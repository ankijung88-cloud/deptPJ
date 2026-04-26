import React, { useState, useEffect, Suspense, useCallback } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
    Users, 
    UserPlus,
    Mic, 
    MicOff, 
    Video, 
    VideoOff, 
    LogOut, 
    Settings,
    MessageSquare,
    Hand,
    MonitorUp,
    ChevronRight,
    Search,
    Upload,
    Link,
    X,
    Maximize,
    Minimize,
    UserMinus,
    Lock
} from 'lucide-react';
import { MeetingRoomEnvironment } from '../components/gallery/MeetingRoomEnvironment';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { useAutoTranslate } from '../hooks/useAutoTranslate';
import { useNavigate, useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { useAdmin } from '../hooks/useAdmin';
import { useWebRTCScreenShare } from '../hooks/useWebRTCScreenShare';
import { useNavigationState, useImmersiveMode } from '../context/NavigationActionContext';

interface Participant {
    id: string;
    name: string;
    seatId: number | null;
    color: string;
    position?: [number, number, number];
    isMuted: boolean;
    isVideoOff: boolean;
}

const COLORS = ['#00D2FF', '#FF4757', '#2ECC71', '#F39C12', '#9B59B6', '#FFD32A'];

const VirtualMeetingPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { translateAsync } = useAutoTranslate('');
    const { id: roomId } = useParams<{ id: string }>();
    const roomKey = `meeting_token_${roomId || 'default'}`;
    
    const [socket, setSocket] = useState<Socket | null>(null);
    const [meetingMode] = useState<'1:1' | 'Group'>('Group');
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [showParticipants, setShowParticipants] = useState(false);
    
    // Authorization States
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [entryToken, setEntryToken] = useState('');
    const [showTokenModal, setShowTokenModal] = useState(false);
    const [tokenError, setTokenError] = useState('');
    
    const { resetUiTimer } = useNavigationState();
    useImmersiveMode(true);
    
    const [localParticipant, setLocalParticipant] = useState<Participant>({
        id: 'local',
        name: t('User') + '_' + Math.floor(Math.random() * 1000),
        seatId: null,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        position: [0, 0, 0],
        isMuted: false,
        isVideoOff: false
    });
    
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [screenData, setScreenData] = useState<{ url: string; type: string }>({ url: '', type: 'none' });
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isScreenMaximized, setIsScreenMaximized] = useState(false);
    const [inviteLink, setInviteLink] = useState<string | null>(null);
    const [showInviteModal, setShowInviteModal] = useState(false);

    // Close maximize view if presentation ends
    useEffect(() => {
        if (screenData.type === 'none') {
            setIsScreenMaximized(false);
        }
    }, [screenData.type]);
    
    const { isAdmin, isAgency } = useAdmin();
    const isHost = isAdmin || isAgency;
    const hasScreenControl = isHost;

    // WebRTC Screen Sharing Hook
    const { 
        localStream, 
        remoteStreams, 
        isSharing, 
        startScreenShare, 
        stopStream 
    } = useWebRTCScreenShare(socket, participants);

    // Initial Authorization Check
    useEffect(() => {
        if (isHost) {
            setIsAuthorized(true);
            return;
        }

        // Check URL for invite token
        const params = new URLSearchParams(window.location.search);
        const inviteToken = params.get('invite');
        if (inviteToken) {
            sessionStorage.setItem(roomKey, inviteToken);
            setIsAuthorized(true);
            return;
        }

        // Check SessionStorage
        const savedToken = sessionStorage.getItem(roomKey);
        if (savedToken) {
            setIsAuthorized(true);
            return;
        }

        // Otherwise, show modal
        setShowTokenModal(true);
    }, [isHost, roomId, roomKey]);

    // Real-time Socket Setup - Only connect if authorized
    useEffect(() => {
        if (!isAuthorized) return;

        const socketUrl = window.location.port === '5173'
            ? window.location.origin.replace('5173', '3000') 
            : window.location.origin;

        console.log(`[Socket] Connecting to: ${socketUrl}`);
        
        const newSocket = io(socketUrl, {
            transports: ['polling', 'websocket'],
            autoConnect: true,
            reconnectionAttempts: 5
        });
        
        setSocket(newSocket);
        
        const token = sessionStorage.getItem(roomKey);

        newSocket.on('connect', () => {
            console.log('[Socket] Connected!', newSocket.id);
            newSocket.emit('join-meeting', { 
                roomId: roomId || 'default-room', 
                name: localParticipant.name,
                inviteToken: token,
                isHost
            });
        });

        newSocket.on('meeting-error', async (data: { message: string }) => {
            const msg = await translateAsync(data.message);
            alert(msg);
            if (data.message.includes('토큰') || data.message.includes('정원')) {
                sessionStorage.removeItem(roomKey);
                setIsAuthorized(false);
                setShowTokenModal(true);
            }
        });

        newSocket.on('kicked', async () => {
            const msg = t('meeting.kicked_msg', 'Host has removed you from the meeting.');
            alert(msg);
            navigate(-1);
        });
        
        // Broadcast kick listener (More reliable for Vercel/Proxies)
        newSocket.on('member-kicked', (data: { targetId: string }) => {
            console.log('[Socket] Member-kicked broadcast received:', data);
            if (data.targetId === newSocket.id) {
                const msg = t('meeting.kicked_msg', '호스트가 귀하를 회의에서 퇴장시켰습니다.');
                alert(msg);
                navigate(-1);
            }
        });

        newSocket.on('participants-update', (data: Participant[]) => {
            console.log('[Socket] Participants update:', data);
            if (Array.isArray(data)) {
                setParticipants(data.filter(p => p && p.id !== newSocket.id));
            }
        });

        newSocket.on('screen-update', (data: { url: string, type: string }) => {
            console.log('[Socket] Screen update:', data);
            setScreenData(data);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [isAuthorized, isAdmin, isAgency, roomId, roomKey]);

    const handleSeatSelect = useCallback((seatId: number) => {
        setLocalParticipant(prev => ({ ...prev, seatId }));
        if (socket) {
            socket.emit('select-seat', { seatId });
        }
    }, [socket]);

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (socket) socket.emit('toggle-mute', !isMuted);
    };

    const toggleVideo = () => {
        setIsVideoOff(!isVideoOff);
        if (socket) socket.emit('toggle-video', !isVideoOff);
    };

    const handleKickParticipant = (participantId: string) => {
        if (!isHost || !socket) {
            console.warn('[Meeting] Kick blocked: Not host or socket disconnected', { isHost, socketId: socket?.id });
            return;
        }
        
        const finalRoomId = roomId || 'default-room';
        const confirmMsg = t('meeting.kick_confirm', '해당 참가자를 내보내시겠습니까?');
        if (window.confirm(confirmMsg)) {
            console.log(`[Meeting] Emitting kick-participant: room=${finalRoomId}, target=${participantId}`);
            socket.emit('kick-participant', { participantId, roomId: finalRoomId });
        }
    };

    const handleTokenSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!entryToken.trim()) {
            const errorMsg = await translateAsync('Please enter a token.');
            setTokenError(errorMsg);
            return;
        }
        
        // Store and attempt entry
        sessionStorage.setItem(roomKey, entryToken.trim());
        setIsAuthorized(true);
        setShowTokenModal(false);
        setTokenError('');
    };

    const handleShareScreen = (url: string, manualType?: string) => {
        let type = manualType || 'image';
        if (url === '') {
            type = 'none';
            // If we are broadcasting WebRTC, ensure we stop local streams too
            if (isSharing) stopStream();
        } else if (!manualType && (url.includes('.mp4') || url.includes('youtube.com') || url.includes('youtu.be'))) {
            type = 'video';
        }
        if (socket) {
            socket.emit('share-screen', { url, type });
        }
        setIsShareModalOpen(false);
    };

    const handleWebRTCShare = async () => {
        const stream = await startScreenShare();
        if (stream) {
            handleShareScreen('live-broadcast', 'webrtc');
        } else {
            const msg = t('common.capture_error', '화면 캡처 권한을 얻지 못했습니다.');
            alert(msg);
        }
    };

    return (
        <ErrorBoundary>
            <div className="relative w-full h-screen bg-[#050505] overflow-hidden text-white font-sans">
                {/* 3D Scene Layer */}
                <div className="absolute inset-0 z-0 bg-[#050505]">
                    <Canvas 
                        shadows 
                        gl={{ antialias: true, alpha: true }}
                        onCreated={({ gl, scene }) => {
                            gl.setClearColor('#041f18');
                            scene.background = new THREE.Color('#031510');
                            scene.fog = new THREE.FogExp2('#031510', 0.05);
                        }}
                    >
                        <Suspense fallback={
                            <Html center>
                                <div className="flex flex-col items-center justify-center gap-6 w-screen h-screen bg-[#050505]">
                                    <div className="relative">
                                        <div className="w-20 h-20 border-4 border-[#00D2FF]/10 border-t-[#00D2FF] rounded-full animate-spin" />
                                        <div className="absolute inset-0 w-20 h-20 border-4 border-[#00D2FF]/5 rounded-full animate-pulse shadow-[0_0_20px_#00D2FF22]" />
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <p className="text-[#00D2FF] font-black tracking-[0.4em] uppercase animate-pulse text-lg">{t('common.loading_space')}</p>
                                        <p className="text-[#00D2FF]/40 text-xs tracking-widest uppercase">{t('common.loading_content')}</p>
                                    </div>
                                </div>
                            </Html>
                        }>
                            <MeetingRoomEnvironment 
                                participants={participants}
                                localParticipant={localParticipant}
                                onSeatSelect={handleSeatSelect}
                                meetingMode={meetingMode}
                                screenData={screenData}
                                webrtcStream={(screenData.type === 'webrtc' && isSharing) ? localStream : (Object.values(remoteStreams)[0] || null)}
                            />
                        </Suspense>
                    </Canvas>
                </div>

                {/* Header / HUD Layer */}
                <motion.header 
                    initial={{ y: 0, opacity: 1 }}
                    animate={{ 
                        y: 0, 
                        opacity: 1 
                    }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                    className="absolute top-0 inset-x-0 z-10 p-10 flex justify-between items-start pointer-events-none bg-gradient-to-b from-emerald-500/20 via-emerald-500/5 to-transparent h-64"
                    onMouseMove={resetUiTimer}
                    style={{ pointerEvents: 'auto' }}
                >
                    {/* Top Neon Light Bar (Self-Illuminating) */}
                    <div className="absolute top-0 inset-x-0 h-[4px] flex items-center justify-center">
                        <motion.div 
                            initial={{ opacity: 0.8 }}
                            animate={{ opacity: [0.8, 1, 0.8] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_15px_rgba(255,255,255,0.8),0_0_30px_rgba(52,211,153,0.6),0_0_60px_rgba(52,211,153,0.4)]" 
                        />
                    </div>
                    
                    <div className="flex flex-col gap-2 pointer-events-auto">
                        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate(-1)}>
                            <div className="p-3 bg-[#111] border border-white/10 rounded-full group-hover:bg-[#FF4757]/20 transition-all">
                                <LogOut size={20} className="rotate-180 group-hover:text-[#FF4757]" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight"><AutoTranslatedText text={t('meeting.meeting_room')} /></h1>
                                <p className="text-xs font-bold tracking-[0.2em] uppercase opacity-40 text-[#00D2FF]"><AutoTranslatedText text={t('meeting.lounge_desc')} /></p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pointer-events-auto">
                        <div className="bg-[#0a0a0a] px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-8">
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] font-black opacity-30 text-white uppercase tracking-widest"><AutoTranslatedText text={t('meeting.active_members')} /></span>
                                <div className="flex items-center gap-2">
                                    <Users size={14} className="text-[#00D2FF]" />
                                    <span className="text-xl font-black">{participants.length + 1} <span className="text-sm opacity-40">/ 10</span></span>
                                </div>
                            </div>
                            <div className="w-[1px] h-8 bg-white/10" />
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] font-black opacity-30 text-white uppercase tracking-widest"><AutoTranslatedText text={t('meeting.room_quality')} /></span>
                                <span className="text-sm font-bold text-[#2ECC71]">Ultra HD</span>
                            </div>
                        </div>
                    </div>
                </motion.header>

                {/* Main Action Controls (Bottom Bar) */}
                <footer className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20">
                    <motion.div 
                        initial={{ y: 0, opacity: 1 }}
                        animate={{ 
                            y: 0, 
                            opacity: 1 
                        }}
                        transition={{ duration: 0.5, ease: "circOut" }}
                        className="flex items-center gap-4 px-8 py-5 bg-[#0a0a0a] rounded-[2.5rem] border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] pointer-events-auto"
                        onMouseMove={resetUiTimer}
                        style={{ pointerEvents: 'auto' }}
                    >
                        <div className="flex items-center gap-3 pr-6 border-r border-white/10">
                            <button 
                                onClick={toggleMute}
                                className={`p-4 rounded-2xl transition-all duration-300 ${isMuted ? 'bg-[#FF4757] text-white shadow-[0_0_20px_#FF475744]' : 'bg-white/5 hover:bg-white/10'}`}
                            >
                                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                            </button>
                            <button 
                                onClick={toggleVideo}
                                className={`p-4 rounded-2xl transition-all duration-300 ${isVideoOff ? 'bg-[#FF4757] text-white shadow-[0_0_20px_#FF475744]' : 'bg-white/5 hover:bg-white/10'}`}
                            >
                                {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                            </button>
                        </div>

                        <div className="flex items-center gap-3 px-3">
                            <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all relative">
                                <MessageSquare size={24} />
                                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-[#00D2FF] rounded-full border-2 border-black" />
                            </button>
                            <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"><Hand size={24} /></button>
                            {screenData.type !== 'none' && (
                                <button 
                                    onClick={() => setIsScreenMaximized(true)}
                                    title={t("전체화면으로 보기")}
                                    className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-transparent hover:border-[#00D2FF]/30 active:scale-95 text-[#00D2FF]"
                                >
                                    <Maximize size={24} />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                            <button 
                                onClick={() => {
                                    // Generate token and register on server
                                    const token = Math.random().toString(36).substring(2, 10);
                                    if (socket) socket.emit('register-invite-token', { roomId: 'default-room', token });

                                    const url = `${window.location.origin}${window.location.pathname}?invite=${token}`;
                                    setInviteLink(url);
                                    setShowInviteModal(true);
                                }}
                                disabled={participants.length >= 9}
                                className={`flex items-center gap-3 px-6 py-4 font-black rounded-2xl transition-all shadow-[0_5px_15px_#00D2FF33] ${participants.length >= 9 ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50' : 'bg-[#00D2FF] hover:bg-[#00D2FF]/80 text-black'}`}
                            >
                                <UserPlus size={20} />
                                <span className="text-sm uppercase tracking-widest hidden md:block">
                                    {participants.length >= 9 ? t('common.full', 'Room Full') : t('common.invite')}
                                </span>
                            </button>
                            <button 
                                onClick={() => setShowParticipants(!showParticipants)}
                                className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all ${showParticipants ? 'bg-white/20 text-white font-black' : 'bg-white/5 hover:bg-white/10'}`}
                            >
                                <Users size={20} />
                                <span className="text-sm uppercase tracking-widest hidden md:block">{t('common.participants')}</span>
                            </button>
                            {hasScreenControl && (
                                <button 
                                    onClick={() => setIsShareModalOpen(true)}
                                    title={t("PT Management")}
                                    className={`p-4 rounded-2xl transition-all border ${screenData.type !== 'none' ? 'bg-[#00D2FF]/20 border-[#00D2FF] text-[#00D2FF]' : 'bg-white/5 hover:bg-white/10 border-transparent hover:border-[#00D2FF]/30 active:scale-95'}`}
                                >
                                    <Settings size={24} />
                                </button>
                            )}
                        </div>
                    </motion.div>
                </footer>

                {/* Sidebar (Participants List) */}
                <AnimatePresence>
                    {showParticipants && (
                        <motion.aside 
                            initial={{ x: 400 }}
                            animate={{ x: 0 }}
                            exit={{ x: 400 }}
                            className="absolute right-0 top-0 bottom-0 w-80 z-30 bg-[#0a0a0a] border-l border-white/10 p-8 flex flex-col gap-8 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black tracking-tight">{t('common.participants')}</h3>
                                <button onClick={() => setShowParticipants(false)} className="p-2 hover:bg-white/10 rounded-lg transition-all"><ChevronRight size={24} /></button>
                            </div>

                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                                <input 
                                    type="text" 
                                    placeholder={t("common.search_placeholder")} 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-[#00D2FF]/50 transition-all font-sans"
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                                {/* Local User */}
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-[#00D2FF]/30">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-black font-black" style={{ backgroundColor: localParticipant.color }}>
                                            {localParticipant.name[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm tracking-tight">{localParticipant.name} ({t('common.me')})</p>
                                            <p className="text-[10px] uppercase tracking-widest text-[#00D2FF]">{t('meeting.host')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isMuted && <MicOff size={14} className="text-[#FF4757]" />}
                                        {isVideoOff && <VideoOff size={14} className="text-[#FF4757]" />}
                                    </div>
                                </div>

                                {/* Remote Users */}
                                {participants.map(p => (
                                    <div key={p.id} className="flex items-center justify-between p-4 rounded-full bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-black font-black" style={{ backgroundColor: p.color }}>
                                                {p.name[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm tracking-tight">{p.name}</p>
                                                <p className="text-[10px] uppercase opacity-30 tracking-widest">{p.seatId !== null ? <>{t('meeting.seat')} {p.seatId + 1}</> : t('meeting.observing')}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isHost && (
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleKickParticipant(p.id);
                                                    }}
                                                    className="p-1.5 hover:bg-[#FF4757]/20 text-white/20 hover:text-[#FF4757] rounded-lg transition-all"
                                                    title={t("Kick Member")}
                                                >
                                                    <UserMinus size={14} />
                                                </button>
                                            )}
                                            {p.isMuted && <MicOff size={14} className="opacity-40" />}
                                            {p.isVideoOff && <VideoOff size={14} className="opacity-40" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Interaction Tooltip */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-1 pointer-events-none">
                    <div className="flex flex-col items-center gap-4 animate-bounce">
                        <div className="w-1.5 h-1.5 bg-[#00D2FF] rounded-full shadow-[0_0_15px_#00D2FF]" />
                        <span className="text-[10px] font-black tracking-[0.4em] uppercase opacity-20">{t('common.interaction_active')}</span>
                    </div>
                </div>

                {/* Share PT Modal */}
                <AnimatePresence>
                    {isShareModalOpen && hasScreenControl && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                exit={{ opacity: 0 }} 
                                className="absolute inset-0 bg-black/80"
                                onClick={() => setIsShareModalOpen(false)}
                            />
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative bg-[#1A1A1A] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl flex flex-col gap-6"
                            >
                                <button 
                                    onClick={() => setIsShareModalOpen(false)}
                                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors"
                                >
                                    <X size={20} className="text-white/60" />
                                </button>
                                
                                <div>
                                    <h2 className="text-2xl font-black mb-2">{t('meeting.upload_pt')}</h2>
                                    <p className="text-sm text-white/50">{t('meeting.select_media_desc')}</p>
                                </div>

                                <div className="space-y-4">
                                    <button 
                                        onClick={() => {
                                            const fileInput = document.createElement('input');
                                            fileInput.type = 'file';
                                            fileInput.accept = 'image/*,video/mp4';
                                            fileInput.onchange = async (e: any) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const formData = new FormData();
                                                    formData.append('file', file); // Must match upload.single('file') in backend
                                                    try {
                                                        const res = await fetch('/api/upload', {
                                                            method: 'POST',
                                                            headers: { 'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}` },
                                                            body: formData
                                                        });
                                                        if (res.ok) {
                                                            const data = await res.json();
                                                            handleShareScreen(data.url);
                                                        } else {
                                                            const errData = await res.json();
                                                            const msg = await translateAsync(`업로드 실패: ${errData.message || '알 수 없는 오류'}`);
                                                            alert(msg);
                                                        }
                                                    } catch (err) {
                                                        console.error('Upload failed', err);
                                                        const msg = await translateAsync('업로드 중 네트워크 오류가 발생했습니다.');
                                                        alert(msg);
                                                    }
                                                }
                                            };
                                            fileInput.click();
                                        }}
                                        className="w-full relative overflow-hidden group py-10 px-6 border-2 border-dashed border-[#00D2FF]/30 hover:border-[#00D2FF] rounded-xl flex flex-col items-center justify-center gap-4 transition-all bg-white/5 hover:bg-[#00D2FF]/5"
                                    >
                                        <div className="p-4 bg-[#00D2FF]/10 rounded-full group-hover:scale-110 transition-transform">
                                            <Upload size={32} className="text-[#00D2FF]" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-white mb-1">{t('common.upload_pc')}</p>
                                            <p className="text-xs text-white/40">{t('common.supported_formats')}</p>
                                        </div>
                                    </button>

                                    <div className="relative flex items-center justify-center my-4">
                                        <div className="absolute inset-x-0 h-[1px] bg-white/10" />
                                                                                <span className="relative bg-[#1A1A1A] px-4 text-xs font-bold text-white/30 uppercase tracking-widest"><AutoTranslatedText text="or" /></span>
                                    </div>

                                    <button 
                                        onClick={handleWebRTCShare}
                                        className="w-full bg-[#111] hover:bg-[#222] border border-[#00D2FF]/30 text-[#00D2FF] font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-colors"
                                    >
                                        <MonitorUp size={20} />
                                        <span>{t('meeting.live_broadcast')}</span>
                                    </button>

                                    <div className="relative flex items-center justify-center my-4">
                                        <div className="absolute inset-x-0 h-[1px] bg-white/10" />
                                                                                <span className="relative bg-[#1A1A1A] px-4 text-xs font-bold text-white/30 uppercase tracking-widest"><AutoTranslatedText text="or paste link" /></span>
                                    </div>

                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        const formData = new FormData(e.currentTarget);
                                        const url = formData.get('url') as string;
                                        if (url) handleShareScreen(url);
                                    }}>
                                        <div className="relative">
                                            <Link size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                                            <input 
                                                name="url"
                                                type="url"
                                                placeholder={t("common.link_placeholder")} 
                                                className="w-full bg-[#050505] border border-white/10 hover:border-white/20 focus:border-[#00D2FF] outline-none rounded-xl py-4 pl-12 pr-4 transition-colors"
                                            />
                                        </div>
                                        <button 
                                            type="submit"
                                            className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-xl transition-colors"
                                        >
                                            {t('meeting.stream_external')}
                                        </button>
                                    </form>
                                    
                                    {screenData.type !== 'none' && (
                                        <button 
                                            onClick={() => handleShareScreen('')}
                                            className="w-full mt-2 border border-[#FF4757]/30 hover:bg-[#FF4757]/10 text-[#FF4757] font-bold py-4 rounded-xl transition-colors"
                                        >
                                            {t('meeting.stop_sharing')}
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
                
                {/* Invite Link Modal */}
                <AnimatePresence>
                    {showInviteModal && (
                        <div className="absolute inset-0 z-[120] flex items-center justify-center p-6 bg-black/95">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-10 relative shadow-[0_50px_100px_-20px_rgba(0,0,0,1)]"
                            >
                                <button 
                                    onClick={() => setShowInviteModal(false)}
                                    className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors group"
                                >
                                    <X size={20} className="group-active:scale-90 transition-transform" />
                                </button>
                                
                                <div className="flex flex-col items-center text-center gap-8">
                                    <div className="w-20 h-20 bg-[#00D2FF]/10 rounded-3xl flex items-center justify-center rotate-12">
                                        <UserPlus size={40} className="text-[#00D2FF] -rotate-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-black tracking-tight">{t('common.invite')}</h3>
                                        <p className="text-sm text-white/40 font-medium">{t('common.invite_desc')}</p>
                                    </div>
                                    
                                    <div className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between gap-4 overflow-hidden group hover:border-[#00D2FF]/30 transition-colors">
                                        <div className="flex-1 overflow-hidden">
                                            <span className="text-[10px] uppercase font-black tracking-widest text-white/20 mb-2 block">{t('common.secure_link')}</span>
                                            <span className="text-xs font-mono text-[#00D2FF] truncate block">
                                                {inviteLink}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                if (inviteLink) {
                                                    navigator.clipboard.writeText(inviteLink)
                                                        .then(async () => {
                                                            const msg = t('common.copy_success');
                                                            alert(msg);
                                                        })
                                                        .catch(async () => {
                                                            const msg = t('common.copy_fail');
                                                            alert(msg);
                                                        });
                                                }
                                            }}
                                            className="px-5 py-3 bg-[#00D2FF] text-black rounded-xl text-xs font-black transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(0,210,255,0.3)]"
                                        >
                                            {t('common.copy')}
                                        </button>
                                    </div>
                                    
                                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em]">
                                        {t('common.invite_validity')}
                                    </p>
                                    
                                    <button 
                                        onClick={() => setShowInviteModal(false)}
                                        className="w-full py-5 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl transition-all border border-white/5"
                                    >
                                        {t('common.confirm')}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* 2D Fullscreen Overlay */}
                <AnimatePresence>
                    {isScreenMaximized && screenData.type !== 'none' && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute inset-0 z-[100] bg-black/95 flex items-center justify-center p-8 md:p-12"
                        >
                            <button 
                                onClick={() => setIsScreenMaximized(false)}
                                className="absolute top-8 right-8 z-[110] p-4 bg-white/10 hover:bg-[#FF4757] text-white rounded-full transition-colors group shadow-2xl"
                            >
                                <Minimize size={24} className="group-hover:scale-90 transition-transform" />
                            </button>
                            
                            <div className="w-full h-full max-w-[1920px] mx-auto border border-white/10 rounded-2xl overflow-hidden bg-black shadow-[0_0_100px_rgba(0,210,255,0.15)] flex items-center justify-center">
                                {screenData.type === 'webrtc' ? (
                                    <video 
                                        autoPlay 
                                        playsInline 
                                        muted
                                        className="w-full h-full object-contain"
                                        ref={(video) => {
                                            const stream = isSharing ? localStream : (Object.values(remoteStreams)[0] || null);
                                            if (video && stream && video.srcObject !== stream) {
                                                video.srcObject = stream;
                                            }
                                        }}
                                    />
                                ) : screenData.type === 'video' ? (
                                    <video src={screenData.url} autoPlay loop muted playsInline className="w-full h-full object-contain" />
                                ) : (
                                                                        <img src={screenData.url} alt="Presentation" className="w-full h-full object-contain" />
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* Secure Entry Modal */}
                <AnimatePresence>
                    {showTokenModal && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-[100] flex items-center justify-center bg-[#050505]/95"
                        >
                            <motion.div 
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                className="w-full max-w-md p-10 bg-[#111] border border-white/10 rounded-[40px] shadow-2xl flex flex-col items-center text-center gap-8"
                            >
                                <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                                    <Lock size={40} />
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                    <h2 className="text-3xl font-black tracking-tight">{t('common.secure_entry')}</h2>
                                    <p className="text-white/40 text-sm tracking-wide">
                                        {t('common.entry_desc')}
                                    </p>
                                </div>

                                <form onSubmit={handleTokenSubmit} className="w-full flex flex-col gap-4">
                                    <div className="relative group">
                                        <input 
                                            type="text" 
                                            autoFocus
                                            value={entryToken}
                                            onChange={(e) => setEntryToken(e.target.value)}
                                            placeholder={t("Enter Access Token")}
                                            className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 font-mono tracking-widest text-center text-lg focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all placeholder:tracking-normal placeholder:font-sans placeholder:text-white/20"
                                        />
                                        {tokenError && (
                                            <p className="absolute -bottom-6 left-0 right-0 text-[#FF4757] text-xs font-bold uppercase tracking-widest">{tokenError}</p>
                                        )}
                                    </div>

                                    <button 
                                        type="submit"
                                        className="h-16 bg-gradient-to-r from-emerald-500 to-emerald-400 text-[#050505] font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(16,185,129,0.3)] mt-2"
                                    >
                                        <AutoTranslatedText text="입장하기" />
                                    </button>

                                    <button 
                                        type="button"
                                        onClick={() => navigate(-1)}
                                        className="text-white/20 hover:text-white/60 text-xs font-bold uppercase tracking-[0.2em] mt-2 transition-all"
                                    >
                                        <AutoTranslatedText text="돌아가기" />
                                    </button>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </ErrorBoundary>
    );
};

export default VirtualMeetingPage;
