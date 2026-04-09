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

  socket.on('join-meeting', ({ roomId, name, inviteToken, isHost }) => {
    // 1. Check if room exists or create it
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map());
      roomScreens.set(roomId, { url: '', type: 'none' });
      roomTokens.set(roomId, new Set());
    }

    const participants = rooms.get(roomId);

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
      id: socket.id,
      name,
      seatId: null,
      color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
      position: [0, 0, 0],
      isMuted: false,
      isVideoOff: false,
      isHost: !!isHost
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
        console.log(`[Socket] Host verified. Kicking target ${participantId}`);
        
        // Notify the target first
        io.to(participantId).emit('kicked');
        
        // Make the target socket leave the room
        const targetSocket = io.sockets.sockets.get(participantId);
        if (targetSocket) {
          console.log(`[Socket] Command: targetSocket.leave(${roomId}) for ${participantId}`);
          targetSocket.leave(roomId);
        } else {
          console.log(`[Socket] Warn: Target socket ${participantId} not found in io.sockets.sockets`);
        }
        
        // Remove from our internal state
        participants.delete(participantId);
        
        // Broadcast updated list to remaining participants
        io.to(roomId).emit('participants-update', Array.from(participants.values()));
        console.log(`[Socket] Kick sequence complete for ${participantId}`);
      } else {
        console.log(`[Socket] Kick failed: Target ${participantId} not in room participants`);
      }
    } else {
      console.log(`[Socket] Kick blocked: Requester ${socket.id} is NOT a host`);
      socket.emit('meeting-error', { message: '멤버 내보내기 권한이 없습니다. (호스트 전용)' });
    }
  });

  socket.on('disconnect', () => {
    for (const [roomId, participants] of rooms.entries()) {
      if (participants.has(socket.id)) {
        participants.delete(socket.id);
        io.to(roomId).emit('participants-update', Array.from(participants.values()));
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


