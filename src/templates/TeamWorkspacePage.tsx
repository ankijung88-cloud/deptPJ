import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    Search,
    Users, 
    MessageCircle, 
    Plus, 
    LogOut, 
    Monitor, 
    Coffee, 
    Wind, 
    MoreVertical,
    Send,
    Video,
    Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import io from 'socket.io-client';

import { OfficeEnvironment2D } from '../components/gallery/OfficeEnvironment2D';
import { useNavigationState, useImmersiveMode } from '../context/NavigationActionContext';
import { useAdmin } from '../hooks/useAdmin';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { useAutoTranslate } from '../hooks/useAutoTranslate';
import { LanguageSelector } from '../components/common/LanguageSelector';
import ErrorBoundary from '../components/common/ErrorBoundary';

const socket = io();

const DEPARTMENTS = [
    { 
        id: 'dev', 
        name: 'Development', 
        desc: 'Planning & Logic System', 
        color: '#00D2FF', 
        offset: [-12, 0, -4] 
    },
    { 
        id: 'design', 
        name: 'Design', 
        desc: 'Visual & UX Research', 
        color: '#FF00D2', 
        offset: [-4, 0, -4] 
    },
    { 
        id: 'admin', 
        name: 'Administration', 
        desc: 'Business & Operations', 
        color: '#7000FF', 
        offset: [4, 0, -4] 
    },
    { 
        id: 'exec', 
        name: 'Executive', 
        desc: 'Leadership & Strategy', 
        color: '#FFD700', 
        offset: [12, 0, -4],
        rotation: [0, 0, 0] 
    },
    { 
        id: 'pantry', 
        name: '탕비실', 
        desc: 'Pantry & Break', 
        color: '#FFA500', 
        offset: [-12, 0, 20],
        rotation: [0, Math.PI, 0] 
    },
    { 
        id: 'restroom', 
        name: '화장실', 
        desc: 'Restroom', 
        color: '#00FA9A', 
        offset: [-4, 0, 20],
        rotation: [0, Math.PI, 0] 
    },
    { 
        id: 'meeting', 
        name: '회의실', 
        desc: 'Meeting Room', 
        color: '#FF4500', 
        offset: [4, 0, 20],
        rotation: [0, Math.PI, 0] 
    },
    { 
        id: 'consulting', 
        name: '상담실', 
        desc: 'Consulting Room', 
        color: '#1E90FF', 
        offset: [12, 0, 20],
        rotation: [0, Math.PI, 0] 
    }
];

const TeamWorkspacePage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { t: _t } = useTranslation();
    const { isAdmin, isAgency, user } = useAdmin();
    const { resetUiTimer } = useNavigationState();
    const { translateAsync } = useAutoTranslate('');
    useImmersiveMode(true);
    const isManagement = isAdmin || isAgency;

    const [participants, setParticipants] = useState<any[]>([]);
    const [assigningSeatId, setAssigningSeatId] = useState<string | null>(null);
    const [seats, setSeats] = useState<any[]>([
        // Dev
        { id: 'seat-dev-manager', deptId: 'dev', position: [0, 0, 3], rotation: [0, 0, 0], isManager: true },
        { id: 'seat-dev-1', deptId: 'dev', position: [-0.8, 0, 0.5], rotation: [0, -Math.PI / 2, 0] },
        { id: 'seat-dev-2', deptId: 'dev', position: [0.8, 0, 0.5], rotation: [0, Math.PI / 2, 0] },
        { id: 'seat-dev-3', deptId: 'dev', position: [-0.8, 0, -1.5], rotation: [0, -Math.PI / 2, 0] },
        { id: 'seat-dev-4', deptId: 'dev', position: [0.8, 0, -1.5], rotation: [0, Math.PI / 2, 0] },
        
        // Design
        { id: 'seat-design-manager', deptId: 'design', position: [0, 0, 3], rotation: [0, 0, 0], isManager: true },
        { id: 'seat-design-1', deptId: 'design', position: [-0.8, 0, 0.5], rotation: [0, -Math.PI / 2, 0] },
        { id: 'seat-design-2', deptId: 'design', position: [0.8, 0, 0.5], rotation: [0, Math.PI / 2, 0] },
        
        // Admin
        { id: 'seat-admin-manager', deptId: 'admin', position: [0, 0, 3], rotation: [0, 0, 0], isManager: true },
        { id: 'seat-admin-1', deptId: 'admin', position: [-0.8, 0, 0.5], rotation: [0, -Math.PI / 2, 0] },
        { id: 'seat-admin-2', deptId: 'admin', position: [0.8, 0, 0.5], rotation: [0, Math.PI / 2, 0] },
        
        // Exec
        { id: 'seat-exec-manager', deptId: 'exec', position: [0, 0, 3], rotation: [0, 0, 0], isManager: true },
        { id: 'seat-exec-1', deptId: 'exec', position: [-0.8, 0, 0.5], rotation: [0, -Math.PI / 2, 0] },
        { id: 'seat-exec-2', deptId: 'exec', position: [0.8, 0, 0.5], rotation: [0, Math.PI / 2, 0] },
        
        // Meeting
        { id: 'seat-meeting-manager', deptId: 'meeting', position: [0, 0, 3], rotation: [0, 0, 0], isManager: true },
        { id: 'seat-meeting-1', deptId: 'meeting', position: [-0.8, 0, 0.5], rotation: [0, -Math.PI / 2, 0] },
        { id: 'seat-meeting-2', deptId: 'meeting', position: [0.8, 0, 0.5], rotation: [0, Math.PI / 2, 0] },
        
        // Consulting
        { id: 'seat-consulting-manager', deptId: 'consulting', position: [0, 0, 3], rotation: [0, 0, 0], isManager: true },
        { id: 'seat-consulting-1', deptId: 'consulting', position: [-0.8, 0, 0.5], rotation: [0, -Math.PI / 2, 0] },
        { id: 'seat-consulting-2', deptId: 'consulting', position: [0.8, 0, 0.5], rotation: [0, Math.PI / 2, 0] }
    ]);
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [userStatus, setUserStatus] = useState('working'); // working, break, smoking, toilet

    const parentId = location.state?.parentId || '';
    const roomId = `office-${parentId}`;

    // Stable reset function
    const handleActivity = useCallback(() => {
        resetUiTimer();
    }, [resetUiTimer]);

    const handleSit = useCallback(async (seatId: string) => {
        const targetSeat = seats.find(s => s.id === seatId);
        if (targetSeat?.assignedUser && targetSeat.assignedUser.id !== user?.id && !isManagement) {
            const msg = await translateAsync(`Reserved for ${targetSeat.assignedUser.name}`);
            alert(msg);
            return;
        }
        socket.emit('select-seat', { seatId });
        handleActivity();
    }, [roomId, handleActivity, seats, user, isManagement, translateAsync]);

    useEffect(() => {
        handleActivity();
        
        const localUser = { ...user, id: socket.id, status: userStatus };
        socket.emit('join-room', { roomId, user: localUser });

        socket.on('participants-update', (updatedParticipants) => {
            setParticipants(updatedParticipants);
        });

        socket.on('office-chat-received', (msg) => {
            setChatMessages(prev => [...prev, msg].slice(-50));
        });

        socket.on('office-seats-update', (updatedSeats) => {
            if (updatedSeats && updatedSeats.length > 0) {
                setSeats(updatedSeats);
            } else {
                // If server has no seats, propose our defaults
                socket.emit('office-seats-update-request', { roomId, seats });
            }
        });

        return () => {
            socket.emit('leave-room', roomId);
            socket.off('participants-update');
            socket.off('office-chat-received');
            socket.off('office-seats-update');
        };
    }, [roomId, user, userStatus, handleActivity]);

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;
        const msg = {
            id: Date.now(),
            sender: user?.name || 'Anonymous',
            content: newMessage,
            timestamp: new Date().toLocaleTimeString()
        };
        socket.emit('office-chat-send', { roomId, msg });
        setNewMessage('');
        handleActivity();
    };

    const handleAddSeat = (deptId: string) => {
        if (!isAdmin) return;
        
        const teamSeats = seats.filter(s => s.deptId === deptId && !s.isManager);
        const count = teamSeats.length;
        
        // Row/Col logic for Back-to-Back pairs
        const row = Math.floor(count / 2);
        const col = count % 2;
        
        const newSeat = {
            id: `seat-${Date.now()}`,
            deptId,
            // X-spacing (±0.8) and Z-spacing (2.0) to match existing grid
            position: [col === 0 ? -0.8 : 0.8, 0, 0.5 - (row * 2.0)] as [number, number, number],
            // Face Left or Right to match the "Back-to-Back" image pattern
            rotation: [0, col === 0 ? -Math.PI / 2 : Math.PI / 2, 0] as [number, number, number],
            occupiedBy: null
        };
        const updatedSeats = [...seats, newSeat];
        setSeats(updatedSeats);
        socket.emit('office-seats-update-request', { roomId, seats: updatedSeats });
        
        // Persist to DB logic (scaffolded)
        fetch(`/api/products/${parentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ theme_data: JSON.stringify({ seats: updatedSeats }) })
        });
    };

    const handleRemoveSeat = (seatId: string) => {
        if (!isAdmin) return;
        const updatedSeats = seats.filter(s => s.id !== seatId);
        setSeats(updatedSeats);
        socket.emit('office-seats-update-request', { roomId, seats: updatedSeats });
        
        // Persist to DB logic
        fetch(`/api/products/${parentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ theme_data: JSON.stringify({ seats: updatedSeats }) })
        });
    };

    const handleAssignUser = (seatId: string, assignedUser: any | null) => {
        if (!isManagement) return;
        const updatedSeats = seats.map(s => 
            s.id === seatId ? { ...s, assignedUser } : s
        );
        setSeats(updatedSeats);
        socket.emit('office-seats-update-request', { roomId, seats: updatedSeats });
        setAssigningSeatId(null);
        
        // Persist to DB logic
        fetch(`/api/products/${parentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ theme_data: JSON.stringify({ seats: updatedSeats }) })
        });
    };



    const handleMove = (point: [number, number, number]) => {
        // In 2D mode, movement logic can be simplified or used for avatars
        if (socket) {
            socket.emit('move', { position: point });
            
            socket.emit('office-move-user', {
                roomId: parentId,
                position: point,
                seatId: null // Standing up
            });
        }
        
        setParticipants(prev => prev.map(p => 
            p.id === user?.uid 
                ? { ...p, position: point, seatId: null }
                : p
        ));
        handleActivity();
    };

    return (
        <div className="fixed inset-0 bg-[#050505] text-white overflow-hidden font-sans" onMouseMove={handleActivity}>
            <ErrorBoundary>
                <div className="absolute inset-0 z-0 pt-24">
                    <OfficeEnvironment2D 
                        seats={seats}
                        participants={participants}
                        departments={DEPARTMENTS}
                        onAddSeat={handleAddSeat}
                        onRemoveSeat={handleRemoveSeat}
                        onAssignUser={(id: string) => setAssigningSeatId(id)}
                        onSit={handleSit}
                        onMove={handleMove}
                        onEnterRoom={() => {}}
                        user={user}
                        isAdmin={isAdmin}
                        isAgency={isAgency}
                    />
                </div>
            </ErrorBoundary>

            {/* Layout UI */}
            <div className="absolute inset-0 pointer-events-none z-10">
                {/* Assignment Modal */}
            <AnimatePresence>
                {assigningSeatId && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setAssigningSeatId(null)}
                            className="absolute inset-0 bg-black/95"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-3xl p-8 overflow-hidden"
                        >
                            <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                                <Plus className="text-[#00D2FF]" />
                                <AutoTranslatedText text="DESIGNATE SEAT" />
                            </h3>
                            <div className="flex flex-col mb-6">
                                <span className="text-[10px] font-black tracking-[0.4em] opacity-30 text-white uppercase"><AutoTranslatedText text="VIRTUAL OFFICE" /></span>
                                <h1 className="text-2xl font-black tracking-tight"><AutoTranslatedText text="Team Workspace" /></h1>
                            </div>
                            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl focus-within:border-[#00D2FF]/50 transition-all mb-4">
                                <Search size={16} className="opacity-40" />
                                <input 
                                    type="text" 
                                    placeholder={_t("Search members...")} 
                                    className="bg-transparent border-none outline-none text-sm w-full font-medium"
                                />
                            </div>
                            <span className="text-[10px] font-bold opacity-30 tracking-widest uppercase"><AutoTranslatedText text="Member Search" /></span>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar pointer-events-auto mt-2">
                                <button 
                                    onClick={() => handleAssignUser(assigningSeatId, null)}
                                    className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 text-left transition-all"
                                >
                                    <div className="text-sm font-bold opacity-40"><AutoTranslatedText text="REMOVE ASSIGNMENT" /></div>
                                </button>
                                {participants.map(p => (
                                    <button 
                                        key={p.id}
                                        onClick={() => handleAssignUser(assigningSeatId, { id: p.id, name: p.name })}
                                        className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-[#00D2FF]/20 hover:border-[#00D2FF]/40 text-left transition-all group pointer-events-auto"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-bold text-lg">{p.name}</div>
                                                <div className="text-[10px] opacity-40 uppercase tracking-widest">{p.status || 'Active'}</div>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#00D2FF]/20">
                                                <Plus className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <button 
                                onClick={() => setAssigningSeatId(null)}
                                className="w-full mt-6 py-4 rounded-2xl bg-white/5 font-bold hover:bg-white/10 transition-all pointer-events-auto"
                            >
                                <AutoTranslatedText text="CANCEL" />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

                {/* Top Bar */}
                <header className="p-6 flex justify-between items-center pointer-events-auto">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate(-1)}
                            className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group"
                        >
                            <LogOut className="w-5 h-5 text-white/60 group-hover:text-white transition-colors rotate-180" />
                        </button>
                        <div>
                            <h1 className="text-xl font-black tracking-tighter text-[#00D2FF]"><AutoTranslatedText text="VIRTUAL OFFICE" /></h1>
                            <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest font-bold">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                {participants.length} <AutoTranslatedText text="Members Active" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {DEPARTMENTS.map(dept => (
                            <div key={dept.id} className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/60">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dept.color }} />
                                <AutoTranslatedText text={dept.name} />
                            </div>
                        ))}
                    </div>
                </header>
                {/* Main Action Controls (Right Sidebar) */}
                <aside className="absolute right-10 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 pointer-events-auto z-20">
                    <div className="px-5 py-8 rounded-[2.5rem] bg-[#0a0a0a] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center gap-6">
                        <div className="pb-4 mb-2 border-b border-white/10 w-full flex justify-center">
                            <LanguageSelector variant="sidebar" />
                        </div>
                        <div className="flex flex-col items-center gap-4 border-b border-white/10 pb-6 mb-2">
                            {[
                                { id: 'working', icon: Monitor, color: '#00D2FF', label: <AutoTranslatedText text="Working" /> },
                                { id: 'break', icon: Coffee, color: '#FF9500', label: <AutoTranslatedText text="Break" /> },
                                { id: 'smoking', icon: Wind, color: '#FF3B30', label: <AutoTranslatedText text="Smoking" /> },
                                { id: 'toilet', icon: Users, color: '#AF52DE', label: <AutoTranslatedText text="Away" /> }
                            ].map(status => (
                                <button
                                    key={status.id}
                                    onClick={() => setUserStatus(status.id)}
                                    className={`relative group p-4 rounded-2xl transition-all ${userStatus === status.id ? 'bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]' : 'hover:bg-white/5'}`}
                                    title={typeof status.label === 'string' ? status.label : ''}
                                >
                                    <status.icon className={`w-6 h-6 ${userStatus === status.id ? '' : 'opacity-40'}`} style={{ color: status.color }} />
                                    {userStatus === status.id && (
                                        <motion.div layoutId="status-indicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full bg-white" />
                                    )}
                                    
                                    {/* Tooltip on hover */}
                                    <div className="absolute right-full mr-4 px-3 py-1.5 rounded-lg bg-black/90 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                        {status.label}
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="flex flex-col items-center gap-4">
                            <button 
                                onClick={() => navigate('/virtual-meeting/default-room')}
                                className="group relative p-4 rounded-2xl bg-[#00D2FF] text-black hover:bg-[#00D2FF]/80 transition-all shadow-[0_10px_20px_rgba(0,210,255,0.2)]"
                            >
                                <Video className="w-6 h-6" />
                                <div className="absolute right-full mr-4 px-3 py-1.5 rounded-lg bg-black/90 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                    <AutoTranslatedText text="Meeting Room" />
                                </div>
                            </button>

                            <button 
                                onClick={() => setIsChatOpen(!isChatOpen)}
                                className={`group relative p-4 rounded-2xl transition-all ${isChatOpen ? 'bg-[#00D2FF] text-black shadow-[0_0_20px_rgba(0,210,255,0.4)]' : 'bg-white/5 text-white/60 hover:text-white'}`}
                            >
                                <MessageCircle className="w-6 h-6" />
                                <div className="absolute right-full mr-4 px-3 py-1.5 rounded-lg bg-black/90 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                    <AutoTranslatedText text="Office Chat" />
                                </div>
                            </button>
                            
                            <button 
                                onClick={() => {/* Settings logic */}}
                                className="group relative p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                            >
                                <Settings className="w-6 h-6 text-white/60" />
                                <div className="absolute right-full mr-4 px-3 py-1.5 rounded-lg bg-black/90 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                    <AutoTranslatedText text="Settings" />
                                </div>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Chat Sidebar Overlay */}
                <AnimatePresence>
                    {isChatOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 100 }}
                            className="absolute right-8 top-24 bottom-32 w-80 bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto flex flex-col overflow-hidden"
                        >
                            <div className="p-4 border-b border-white/10 flex justify-between items-center">
                                <h3 className="font-bold text-xs uppercase tracking-widest text-white/40"><AutoTranslatedText text="Office Chat" /></h3>
                                <button onClick={() => setIsChatOpen(false)} className="text-white/20 hover:text-white transition-colors">
                                    <MoreVertical size={16} />
                                </button>
                            </div>

                            <div className="flex-grow overflow-y-auto p-4 space-y-4 scroll-smooth">
                                {chatMessages.map((msg) => (
                                    <div key={msg.id} className={`flex flex-col ${msg.sender === user?.name ? 'items-end' : 'items-start'}`}>
                                        <span className="text-[10px] text-white/30 mb-1">{msg.sender}</span>
                                        <div className={`px-3 py-2 rounded-2xl text-sm ${msg.sender === user?.name ? 'bg-[#00D2FF] text-black font-medium' : 'bg-white/5 text-white'}`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 bg-white/5">
                                <div className="relative">
                                    <input 
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder={_t("Send a message...")}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 pr-12 text-sm outline-none focus:border-[#00D2FF]/50 transition-all"
                                    />
                                    <button 
                                        onClick={handleSendMessage}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-[#00D2FF] text-black flex items-center justify-center hover:scale-105 transition-all"
                                    >
                                        <Send size={14} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            {/* Visual Accents */}
            <div className="fixed top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00D2FF]/20 to-transparent" />
            <div className="fixed bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00D2FF]/20 to-transparent" />
        </div>
    );
};

export default TeamWorkspacePage;
