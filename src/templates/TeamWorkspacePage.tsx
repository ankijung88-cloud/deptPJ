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

interface TeamWorkspacePageProps {
    item?: any;
    productId?: string;
    onClose?: () => void;
}

const TeamWorkspacePage: React.FC<TeamWorkspacePageProps> = ({ item, productId: propProductId, onClose }) => {
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

    const parentId = propProductId || item?.id || location.state?.parentId || '';
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
        <div className="fixed inset-0 bg-[#FFFFFF] text-dancheong-ink overflow-hidden font-sans selection:bg-dancheong-mugwort/20" onMouseMove={handleActivity}>
            {/* Custom Responsive Styles for Sidebar and Chat to prevent overlapping with Navigation Header */}
            <style>{`
                .responsive-aside {
                    top: 140px !important; /* Safely starts below the 120px top header to avoid navigation collision */
                    transform: none !important;
                    max-height: calc(100vh - 180px);
                }
                .responsive-sidebar {
                    max-height: calc(100vh - 180px);
                    overflow-y: auto;
                    scrollbar-width: none; /* Firefox */
                }
                .responsive-sidebar::-webkit-scrollbar {
                    display: none; /* Chrome, Safari, Opera */
                }
                
                .responsive-chat {
                    top: 140px !important; /* Starts safely below the 120px top header to avoid navigation collision */
                    bottom: 32px !important;
                    max-height: calc(100vh - 180px);
                }
                
                @media (max-height: 850px) {
                    .responsive-sidebar-container {
                        padding-top: 1.5rem !important;
                        padding-bottom: 1.5rem !important;
                        gap: 1.5rem !important;
                    }
                    .responsive-sidebar-group {
                        padding-bottom: 1rem !important;
                        gap: 0.75rem !important;
                    }
                    .responsive-sidebar-btn {
                        padding: 0.75rem !important;
                    }
                }
                @media (max-height: 700px) {
                    .responsive-aside {
                        top: 130px !important;
                    }
                    .responsive-chat {
                        top: 130px !important;
                        bottom: 24px !important;
                        max-height: calc(100vh - 160px);
                    }
                    .responsive-sidebar-container {
                        padding-top: 1rem !important;
                        padding-bottom: 1rem !important;
                        gap: 1rem !important;
                    }
                    .responsive-sidebar-group {
                        padding-bottom: 0.5rem !important;
                        gap: 0.5rem !important;
                    }
                    .responsive-sidebar-btn {
                        padding: 0.5rem !important;
                    }
                    .responsive-sidebar-lang {
                        padding-bottom: 1rem !important;
                    }
                }
                
                /* On small screens, transition to a beautiful floating horizontal bottom bar */
                @media (max-width: 640px) {
                    .responsive-aside {
                        left: 1.5rem !important;
                        right: auto !important;
                        top: auto !important;
                        bottom: 1.5rem !important;
                        transform: none !important;
                        flex-direction: row !important;
                        width: calc(100% - 3rem) !important;
                        height: auto !important;
                        max-height: none !important;
                        justify-content: center !important;
                        z-index: 250 !important;
                    }
                    .responsive-sidebar-container {
                        flex-direction: row !important;
                        padding: 0.75rem !important;
                        gap: 1rem !important;
                        border-radius: 2rem !important;
                        width: 100% !important;
                        justify-content: space-around !important;
                        max-height: none !important;
                        overflow-y: visible !important;
                    }
                    .responsive-sidebar-lang {
                        display: none !important; /* Hide language selector in mobile bottom bar to save space */
                    }
                    .responsive-sidebar-group {
                        flex-direction: row !important;
                        padding-bottom: 0 !important;
                        border-bottom: none !important;
                        gap: 0.75rem !important;
                    }
                    .responsive-sidebar-btn-group {
                        flex-direction: row !important;
                        gap: 0.75rem !important;
                    }
                    .responsive-chat {
                        top: 100px !important; /* On mobile, stay below top header */
                        bottom: 6rem !important; /* Keep distance from mobile horizontal bottom bar */
                        height: auto !important;
                        max-height: none !important;
                    }
                }
            `}</style>

            {/* Texture Overlay */}
            <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.03] mix-blend-overlay" 
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-[#FFD1D1]/20 blur-[150px] rounded-full opacity-40 animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute bottom-[10%] left-[-10%] w-[60%] h-[60%] bg-dancheong-mugwort/5 blur-[120px] rounded-full opacity-30" />
            </div>

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
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-dancheong-ink/40 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setAssigningSeatId(null)}
                            className="absolute inset-0"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 40 }}
                            className="relative w-full max-w-lg bg-white/90 backdrop-blur-2xl border border-white/60 rounded-[4rem] p-12 overflow-hidden shadow-[0_100px_150px_rgba(0,0,0,0.2)]"
                        >
                            <h3 className="text-3xl font-serif font-black mb-8 flex items-center gap-4 text-dancheong-ink">
                                <Plus className="text-dancheong-mugwort" />
                                <AutoTranslatedText text="DESIGNATE SEAT" />
                            </h3>
                            <div className="flex flex-col mb-10">
                                <span className="text-[9px] font-black tracking-[0.4em] opacity-40 text-dancheong-ink uppercase"><AutoTranslatedText text="VIRTUAL OFFICE" /></span>
                                <h1 className="text-4xl font-serif font-black tracking-tight text-dancheong-ink leading-none mt-2"><AutoTranslatedText text="Team Workspace" /></h1>
                            </div>
                            <div className="flex items-center gap-4 bg-white/40 border border-white/60 px-6 py-4 rounded-3xl focus-within:border-dancheong-mugwort/30 transition-all mb-8 shadow-inner backdrop-blur-md">
                                <Search size={18} className="opacity-40 text-dancheong-ink" />
                                <input 
                                    type="text" 
                                    placeholder={_t("Search members...")} 
                                    className="bg-transparent border-none outline-none text-sm w-full font-serif italic text-dancheong-ink placeholder:text-dancheong-ink/20"
                                />
                            </div>
                            <span className="text-[9px] font-black opacity-20 tracking-[0.3em] uppercase pl-1"><AutoTranslatedText text="Member Search" /></span>
                            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-3 custom-scrollbar pointer-events-auto mt-4">
                                <button 
                                    onClick={() => handleAssignUser(assigningSeatId, null)}
                                    className="w-full p-6 rounded-[2.5rem] bg-dancheong-ink/5 border border-white/40 hover:bg-white/60 text-left transition-all backdrop-blur-sm"
                                >
                                    <div className="text-[10px] font-black opacity-40 text-dancheong-ink tracking-widest"><AutoTranslatedText text="REMOVE ASSIGNMENT" /></div>
                                </button>
                                {participants.map(p => (
                                    <button 
                                        key={p.id}
                                        onClick={() => handleAssignUser(assigningSeatId, { id: p.id, name: p.name })}
                                        className="w-full p-8 rounded-[3rem] bg-white/40 border border-white/60 hover:bg-white/80 hover:border-dancheong-mugwort/30 text-left transition-all group pointer-events-auto shadow-sm backdrop-blur-md"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-serif font-black text-2xl text-dancheong-ink">{p.name}</div>
                                                <div className="text-[9px] opacity-40 uppercase font-black tracking-[0.3em] mt-1">{p.status || 'Active'}</div>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center group-hover:bg-dancheong-mugwort group-hover:text-white transition-all shadow-sm">
                                                <Plus className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <button 
                                onClick={() => setAssigningSeatId(null)}
                                className="w-full mt-10 py-6 rounded-3xl bg-dancheong-ink/5 font-black text-[10px] tracking-widest hover:bg-white/60 transition-all pointer-events-auto text-dancheong-ink uppercase border border-white/40 shadow-sm"
                            >
                                <AutoTranslatedText text="CANCEL" />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

                {/* Top Bar */}
                <header className="p-8 flex justify-between items-center pointer-events-auto bg-[#FFFFFF]/20 backdrop-blur-xl border-b border-white/40 z-[100]">
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => onClose ? onClose() : navigate(-1)}
                            className="w-14 h-14 rounded-full bg-white/40 border border-white/60 flex items-center justify-center hover:bg-white/80 transition-all group shadow-sm backdrop-blur-md"
                        >
                            <LogOut className="w-6 h-6 text-dancheong-ink/40 group-hover:text-dancheong-ink transition-colors rotate-180" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-serif font-black tracking-tighter text-dancheong-ink uppercase"><AutoTranslatedText text="VIRTUAL OFFICE" /></h1>
                            <div className="flex items-center gap-3 text-[9px] text-dancheong-ink/40 uppercase tracking-[0.3em] font-black mt-1">
                                <span className="w-2 h-2 rounded-full bg-dancheong-mugwort animate-pulse shadow-[0_0_10px_rgba(61,72,61,0.3)]" />
                                {participants.length} <AutoTranslatedText text="Members Active" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {DEPARTMENTS.map(dept => (
                            <div key={dept.id} className="hidden md:flex items-center gap-3 px-5 py-2 rounded-full bg-white/40 border border-white/60 text-[9px] font-black uppercase tracking-[0.2em] text-dancheong-ink/60 backdrop-blur-md shadow-sm">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dept.color, boxShadow: `0 0 10px ${dept.color}40` }} />
                                <AutoTranslatedText text={dept.name} />
                            </div>
                        ))}
                    </div>
                </header>

                {/* Main Action Controls (Left Sidebar) - Safely positioned below Header */}
                <aside className="responsive-aside absolute left-12 top-1/2 -translate-y-1/2 flex flex-col items-center gap-6 pointer-events-auto z-[200]">
                    <div className="responsive-sidebar responsive-sidebar-container px-6 py-12 rounded-[4rem] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_60px_100px_rgba(0,0,0,0.1)] flex flex-col items-center gap-10">
                        <div className="responsive-sidebar-lang pb-8 border-b border-dancheong-ink/5 w-full flex justify-center">
                            <LanguageSelector variant="sidebar" />
                        </div>
                        <div className="responsive-sidebar-group flex flex-col items-center gap-6 border-b border-dancheong-ink/5 pb-10">
                            {[
                                { id: 'working', icon: Monitor, color: '#3D483D', label: <AutoTranslatedText text="Working" /> },
                                { id: 'break', icon: Coffee, color: '#D4A373', label: <AutoTranslatedText text="Break" /> },
                                { id: 'smoking', icon: Wind, color: '#800020', label: <AutoTranslatedText text="Smoking" /> },
                                { id: 'toilet', icon: Users, color: '#7E9181', label: <AutoTranslatedText text="Away" /> }
                            ].map(status => (
                                <button
                                    key={status.id}
                                    onClick={() => setUserStatus(status.id)}
                                    className={`responsive-sidebar-btn relative group p-5 rounded-3xl transition-all duration-500 ${userStatus === status.id ? 'bg-white shadow-[0_15px_30px_rgba(0,0,0,0.08)]' : 'hover:bg-white/60 shadow-none'}`}
                                    title={typeof status.label === 'string' ? status.label : ''}
                                >
                                    <status.icon className={`w-6 h-6 transition-all duration-500 ${userStatus === status.id ? 'scale-110' : 'opacity-40 grayscale'}`} style={{ color: userStatus === status.id ? status.color : 'inherit' }} />
                                    {userStatus === status.id && (
                                        <motion.div layoutId="status-indicator" className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-full bg-dancheong-mugwort max-sm:hidden" />
                                    )}
                                    
                                    <div className="absolute left-full ml-6 px-4 py-2 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/60 text-[9px] font-black uppercase tracking-[0.3em] text-dancheong-ink opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none whitespace-nowrap shadow-2xl -translate-x-4 group-hover:translate-x-0 z-[300] max-sm:hidden">
                                        {status.label}
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="responsive-sidebar-btn-group flex flex-col items-center gap-6">
                            <button 
                                onClick={() => navigate('/virtual-meeting/default-room')}
                                className="responsive-sidebar-btn group relative p-5 rounded-3xl bg-dancheong-mugwort text-white hover:bg-dancheong-ink transition-all shadow-[0_20px_40px_rgba(61,72,61,0.2)] hover:shadow-none active:scale-90"
                            >
                                <Video className="w-6 h-6" />
                                <div className="absolute left-full ml-6 px-4 py-2 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/60 text-[9px] font-black uppercase tracking-[0.3em] text-dancheong-ink opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none whitespace-nowrap shadow-2xl -translate-x-4 group-hover:translate-x-0 z-[300] max-sm:hidden">
                                    <AutoTranslatedText text="Meeting Room" />
                                </div>
                            </button>

                            <button 
                                onClick={() => setIsChatOpen(!isChatOpen)}
                                className={`responsive-sidebar-btn group relative p-5 rounded-3xl transition-all duration-500 active:scale-90 ${isChatOpen ? 'bg-[#800020] text-white shadow-[0_20px_40px_rgba(128,0,32,0.2)]' : 'bg-white/40 text-dancheong-ink/40 hover:text-dancheong-ink hover:bg-white/60 shadow-sm'}`}
                            >
                                <MessageCircle className="w-6 h-6" />
                                <div className="absolute left-full ml-6 px-4 py-2 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/60 text-[9px] font-black uppercase tracking-[0.3em] text-dancheong-ink opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none whitespace-nowrap shadow-2xl -translate-x-4 group-hover:translate-x-0 z-[300] max-sm:hidden">
                                    <AutoTranslatedText text="Office Chat" />
                                </div>
                            </button>
                            
                            <button 
                                onClick={() => {/* Settings logic */}}
                                className="responsive-sidebar-btn group relative p-5 rounded-3xl bg-white/40 border border-white/60 hover:bg-white/80 transition-all shadow-sm active:scale-90"
                            >
                                <Settings className="w-6 h-6 text-dancheong-ink/40" />
                                <div className="absolute left-full ml-6 px-4 py-2 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/60 text-[9px] font-black uppercase tracking-[0.3em] text-dancheong-ink opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none whitespace-nowrap shadow-2xl -translate-x-4 group-hover:translate-x-0 z-[300] max-sm:hidden">
                                    <AutoTranslatedText text="Settings" />
                                </div>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Chat Sidebar Overlay - Anchored on the Right */}
                <AnimatePresence>
                    {isChatOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: 100, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 100, scale: 0.95 }}
                            className="responsive-chat absolute right-12 top-24 bottom-32 w-96 bg-white/80 backdrop-blur-3xl border border-white/60 rounded-[4rem] shadow-[0_100px_150px_rgba(0,0,0,0.15)] pointer-events-auto flex flex-col overflow-hidden z-[150] max-sm:left-6 max-sm:right-6 max-sm:w-auto"
                        >
                            <div className="p-8 border-b border-dancheong-ink/5 flex justify-between items-center bg-white/20">
                                <h3 className="font-black text-[10px] uppercase tracking-[0.4em] text-dancheong-ink/40"><AutoTranslatedText text="Office Chat" /></h3>
                                <button onClick={() => setIsChatOpen(false)} className="text-dancheong-ink/20 hover:text-dancheong-ink transition-all p-2 hover:bg-white/40 rounded-full">
                                    <MoreVertical size={16} />
                                </button>
                            </div>

                            <div className="flex-grow overflow-y-auto p-8 space-y-6 scroll-smooth custom-scrollbar">
                                {chatMessages.map((msg) => (
                                    <div key={msg.id} className={`flex flex-col ${msg.sender === user?.name ? 'items-end' : 'items-start'}`}>
                                        <span className="text-[9px] font-black tracking-widest text-dancheong-ink/30 mb-2 uppercase">{msg.sender}</span>
                                        <div className={`px-6 py-4 rounded-[2rem] text-sm leading-relaxed ${msg.sender === user?.name ? 'bg-dancheong-mugwort text-white shadow-lg shadow-dancheong-mugwort/20' : 'bg-white/60 border border-white text-dancheong-ink shadow-sm'}`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-8 bg-white/20 border-t border-dancheong-ink/5">
                                <div className="relative">
                                    <input 
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder={_t("Send a message...")}
                                        className="w-full bg-white/60 border border-white rounded-[2rem] px-8 py-5 pr-16 text-sm outline-none focus:border-dancheong-mugwort/30 transition-all text-dancheong-ink shadow-inner backdrop-blur-md"
                                    />
                                    <button 
                                        onClick={handleSendMessage}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-dancheong-mugwort text-white flex items-center justify-center hover:bg-dancheong-ink transition-all shadow-lg active:scale-90"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            {/* Visual Accents */}
            <div className="fixed top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent z-[300]" />
            <div className="fixed bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent z-[300]" />
        </div>
    );
};

export default TeamWorkspacePage;
