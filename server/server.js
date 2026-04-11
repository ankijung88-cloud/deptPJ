import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import authRoutes from './routes/authRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';
import faqRoutes from './routes/faqRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Adjust for production
    methods: ["GET", "POST"]
  }
});

// Real-Time Meeting Logic
const rooms = new Map(); // roomId -> Map of participants
const roomScreens = new Map(); // roomId -> { url: string, type: string }
const roomTokens = new Map(); // roomId -> Set of valid invite tokens

io.on('connection', (socket) => {
  console.log(`[Socket] New connection: ${socket.id}`);

  socket.on('join-room', ({ roomId, user, inviteToken, isHost, role }) => {
    // 1. Check if room exists or create it
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map());
      roomTokens.set(roomId, new Set());
      roomScreens.set(roomId, { url: '', type: 'none' });
    }
    const participants = rooms.get(roomId);
    
    // Extract name from user object or fallback
    const name = user?.name || user?.displayName || 'Anonymous';
    const id = user?.uid || user?.id || socket.id;

    // 2. Validate Access (Only Host can enter without token, others need a valid token)
    if (!isHost) {
      // Check Capacity (Max 9 guests + 1 host = 10 total)
      if (participants.size >= 10) {
        return socket.emit('meeting-error', { message: '회의실 정원(최대 10명)이 초과되었습니다.' });
      }

      // Check Invite Token
      const validTokens = roomTokens.get(roomId);
      if (!inviteToken || !validTokens.has(inviteToken)) {
        return socket.emit('meeting-error', { message: '유효한 초대 토큰이 없습니다. 호스트에게 새 링크를 요청하세요.' });
      }
    }

    // 3. Register Participant
    socket.join(roomId);
    participants.set(socket.id, {
      id: id, // Use permanent UID/ID if available
      name,
      seatId: null,
      color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
      position: [0, 0, 15],
      isMuted: false,
      isVideoOff: false,
      isHost: !!isHost,
      role: role || 'audience'
    });

    console.log(`[Socket] ${name} (${socket.id}) joined ${roomId} (Host: ${!!isHost})`);
    io.to(roomId).emit('participants-update', Array.from(participants.values()));
    socket.emit('screen-update', roomScreens.get(roomId) || { url: '', type: 'none' });
  });

  socket.on('register-invite-token', ({ roomId, token }) => {
    if (!roomTokens.has(roomId)) roomTokens.set(roomId, new Set());
    roomTokens.get(roomId).add(token);
    console.log(`[Socket] New invite token registered for room ${roomId}: ${token}`);
  });

  socket.on('select-seat', ({ seatId }) => {
    // Find room the socket is in
    for (const [roomId, participants] of rooms.entries()) {
      if (participants.has(socket.id)) {
        participants.get(socket.id).seatId = seatId;
        io.to(roomId).emit('participants-update', Array.from(participants.values()));
        break;
      }
    }
  });

  socket.on('toggle-mute', (isMuted) => {
    for (const participants of rooms.values()) {
      if (participants.has(socket.id)) {
        participants.get(socket.id).isMuted = isMuted;
        break;
      }
    }
  });

  socket.on('share-screen', ({ url, type }) => {
    for (const [roomId, participants] of rooms.entries()) {
      if (participants.has(socket.id)) {
        console.log(`[Socket] ${socket.id} started sharing PT on screen in room ${roomId}: ${url} (${type})`);
        roomScreens.set(roomId, { url, type });
        io.to(roomId).emit('screen-update', { url, type });
        break;
      }
    }
  });

  // WebRTC Signaling (P2P Mesh for Screen sharing)
  socket.on('webrtc-offer', ({ targetId, offer }) => {
    io.to(targetId).emit('webrtc-offer', { senderId: socket.id, offer });
  });

  socket.on('webrtc-answer', ({ targetId, answer }) => {
    io.to(targetId).emit('webrtc-answer', { senderId: socket.id, answer });
  });

  socket.on('webrtc-ice-candidate', ({ targetId, candidate }) => {
    io.to(targetId).emit('webrtc-ice-candidate', { senderId: socket.id, candidate });
  });


  socket.on('audition-start', ({ candidateId }) => {
    for (const [roomId, participants] of rooms.entries()) {
      if (participants.has(socket.id)) {
        io.to(roomId).emit('audition-start', { candidateId });
        break;
      }
    }
  });

  socket.on('submit-score', ({ candidateId, scores }) => {
    for (const [roomId, participants] of rooms.entries()) {
      if (participants.has(socket.id)) {
        io.to(roomId).emit('score-update', { candidateId, scores });
        break;
      }
    }
  });

  socket.on('share-materials', ({ url }) => {
    for (const [roomId, participants] of rooms.entries()) {
      if (participants.has(socket.id)) {
        io.to(roomId).emit('materials-update', url);
        break;
      }
    }
  });

  socket.on('share-teleprompter', ({ text }) => {
    for (const [roomId, participants] of rooms.entries()) {
      if (participants.has(socket.id)) {
        io.to(roomId).emit('teleprompter-update', text);
        break;
      }
    }
  });

  socket.on('audition-cheer', ({ candidateId }) => {
    for (const [roomId, participants] of rooms.entries()) {
      if (participants.has(socket.id)) {
        io.to(roomId).emit('cheer-received', { candidateId, senderId: socket.id });
        break;
      }
    }
  });

  socket.on('kick-participant', ({ participantId, roomId }) => {
    console.log(`[Socket] Kick request: From ${socket.id} for target ${participantId} in room ${roomId}`);
    
    const participants = rooms.get(roomId);
    if (!participants) {
      console.log(`[Socket] Kick failed: Room ${roomId} not found`);
      return;
    }

    const requester = participants.get(socket.id);
    console.log(`[Socket] Requester ${socket.id} info in room:`, requester);

    if (requester && requester.isHost) {
      if (participants.has(participantId)) {
        console.log(`[Socket] Host verified. Initiating broadcast-kick for target: ${participantId}`);
        
        // 1. Direct Emit (Fast Path)
        io.to(participantId).emit('kicked');

        // 2. Broadcast Kick to Room (Reliable Path for Proxy/Polling)
        // Clients will check if targetId === socket.id
        io.to(roomId).emit('member-kicked', { targetId: participantId });
        
        // 3. Force leave if possible
        const targetSocket = io.sockets.sockets.get(participantId);
        if (targetSocket) {
          targetSocket.leave(roomId);
        }
        
        // 4. Update Internal State
        participants.delete(participantId);
        
        // 5. Broadcast updated list
        io.to(roomId).emit('participants-update', Array.from(participants.values()));
        console.log(`[Socket] Broadcast-kick complete for ${participantId} in room ${roomId}`);
      } else {
        console.log(`[Socket] Kick failed: Target ${participantId} not in room participants`);
      }
    } else {
      console.log(`[Socket] Kick blocked: Requester ${socket.id} is NOT a host`);
      socket.emit('meeting-error', { message: '멤버 내보내기 권한이 없습니다. (호스트 전용)' });
    }
  });

  // NEW: Generic Room Join (for Office/Square)
  socket.on('join-room', ({ roomId, user }) => {
    socket.join(roomId);
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        participants: new Map(),
        seats: [] // Store seats in memory
      });
    }
    const room = rooms.get(roomId);
    room.participants.set(socket.id, { 
      id: socket.id, 
      ...user, 
      position: user.position || [0, 0, 0],
      color: user.color || '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
    });
    console.log(`[Socket] User ${user?.name || socket.id} joined room ${roomId}`);
    
    // Broadcast updated participants and current seats to the new joiner
    io.to(roomId).emit('participants-update', Array.from(room.participants.values()));
    socket.emit('office-seats-update', room.seats);
  });

  // NEW: Office Specific Logic
  socket.on('office-chat-send', ({ roomId, msg }) => {
    console.log(`[Socket] Office Chat in ${roomId}: ${msg.content}`);
    io.to(roomId).emit('office-chat-received', msg);
  });

  socket.on('office-status-update', ({ roomId, status }) => {
    const room = rooms.get(roomId);
    if (room && room.participants.has(socket.id)) {
      room.participants.get(socket.id).status = status;
      io.to(roomId).emit('office-status-update', { participantId: socket.id, status });
      io.to(roomId).emit('participants-update', Array.from(room.participants.values()));
    }
  });

  socket.on('office-move-user', ({ roomId, position }) => {
    const room = rooms.get(roomId);
    if (room && room.participants.has(socket.id)) {
      room.participants.get(socket.id).position = position;
      room.participants.get(socket.id).seatId = null; // Standing up when moving
      io.to(roomId).emit('participants-update', Array.from(room.participants.values()));
    }
  });

  socket.on('office-seats-update-request', ({ roomId, seats }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.seats = seats; // Store the seats
      console.log(`[Socket] Office Seats updated in ${roomId}`);
      io.to(roomId).emit('office-seats-update', seats);
    }
  });

  socket.on('disconnect', () => {
    for (const [roomId, room] of rooms.entries()) {
      if (room.participants.has(socket.id)) {
        room.participants.delete(socket.id);
        io.to(roomId).emit('participants-update', Array.from(room.participants.values()));
        console.log(`[Socket] ${socket.id} left room ${roomId}`);
        break;
      }
    }
  });
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  console.log(`Creating uploads directory: ${uploadsDir}`);
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Serve static files (Public Assets)
app.use('/assets', express.static(path.join(__dirname, '../public/assets')));

// Serve uploads (SSD first, then DB fallback)
const uploadsPath = process.env.UPLOADS_PATH || path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));
app.use('/uploads', uploadRoutes);

// Fallback for direct video paths (backward compatibility)
app.use('/videos', express.static(path.join(__dirname, '../public/assets/videos')));
app.use('/video', express.static(path.join(__dirname, '../public/assets/videos')));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/orders', orderRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  const errorInfo = `[${new Date().toISOString()}] ${err.stack || err}\n`;
  try {
    fs.appendFileSync(path.join(__dirname, 'error_log.txt'), errorInfo);
  } catch (logErr) {
    console.error('Failed to write to error log:', logErr);
  }
  console.error('[Global Error Handler]:', err);
  res.status(500).json({
    message: err.message || 'Internal Server Error'
  });
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Dept Backend is running - V2 + RealTime' });
});

httpServer.listen(PORT, '0.0.0.0', async () => {
  console.log(`[Server] Dept Backend is running on http://0.0.0.0:${PORT}`);
  
  // Database self-healing: Ensuring schema is correct for 3D Gallery & Admin
  try {
    const { default: initDB } = await import('./config/init_db.js');
    console.log('[DB] Starting schema synchronization...');
    await initDB();
    console.log('[DB] Schema synchronization complete. All units operational.');
  } catch (err) {
    console.error('[DB] Critical: Initialization failed, but server will stay alive:', err.message);
  }
});

// Final safety for Vercel/Proxy timeouts
httpServer.keepAliveTimeout = 65000;
httpServer.headersTimeout = 66000;


