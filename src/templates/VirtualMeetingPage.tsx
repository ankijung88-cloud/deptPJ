import React, { useState, useEffect, useCallback } from 'react';
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
    MessageSquare,
    Hand,
    MonitorUp,
    ChevronRight,
    Upload,
    Link,
    X,
    Minimize,
    UserMinus,
    Lock,
    Trash2,
    Square,
    Columns2,
    LayoutGrid,
    MonitorPlay
} from 'lucide-react';
import { MeetingRoomEnvironment2D } from '../components/gallery/MeetingRoomEnvironment2D';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { useAutoTranslate } from '../hooks/useAutoTranslate';
import { FeaturedItem } from '../types';
import { useNavigate, useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { useAdmin } from '../hooks/useAdmin';
import { useWebRTCScreenShare } from '../hooks/useWebRTCScreenShare';
import { useImmersiveMode } from '../context/NavigationActionContext';

interface Participant {
    id: string;
    name: string;
    seatId: number | null;
    color: string;
    position?: [number, number, number];
    isMuted: boolean;
    isVideoOff: boolean;
}

interface ChatMessage {
    id: number;
    sender: string;
    content: string;
    timestamp: string;
}

const COLORS = ['#00D2FF', '#FF4757', '#2ECC71', '#F39C12', '#9B59B6', '#FFD32A'];

interface VirtualMeetingPageProps {
    item?: FeaturedItem;
    productId?: string;
    onClose?: () => void;
}

const VirtualMeetingPage: React.FC<VirtualMeetingPageProps> = ({ item, productId: propProductId, onClose }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { translateAsync } = useAutoTranslate('');
    const { id: paramRoomId } = useParams<{ id: string }>();
    const roomId = paramRoomId || propProductId || item?.id;
    const roomKey = `meeting_token_${roomId || 'default'}`;
    
    const [socket, setSocket] = useState<Socket | null>(null);
    const [meetingMode] = useState<'1:1' | 'Group'>('Group');
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [showParticipants, setShowParticipants] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [showChat, setShowChat] = useState(true);
    
    // Authorization States
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [entryToken, setEntryToken] = useState('');
    const [showTokenModal, setShowTokenModal] = useState(false);
    const [tokenError, setTokenError] = useState('');
    
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
    const [splitMode, setSplitMode] = useState<1 | 2 | 4>(1);
    const [screenData, setScreenData] = useState<{ url: string; type: string; presenterId?: string }>({ url: '', type: 'none' });
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isScreenListModalOpen, setIsScreenListModalOpen] = useState(false);
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
    
    // Everyone can share screen now, but Host has upload permissions for files if needed
    const canShareScreen = true; 
    const hasScreenControl = isHost; // Host still controls global settings if any

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

        newSocket.on('screen-update', (data: { url: string, type: string, presenterId?: string }) => {
            console.log('[Socket] Screen update:', data);
            setScreenData(data);
        });

        newSocket.on('meeting-chat-received', (msg: ChatMessage) => {
            setChatMessages(prev => {
                // Prevent duplicate if already added by optimistic update
                if (prev.some(m => m.id === msg.id)) return prev;
                return [...prev, msg].slice(-100);
            });
        });

        newSocket.on('meeting-chat-deleted', (messageId: number) => {
            setChatMessages(prev => prev.filter(m => m.id !== messageId));
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
        if (!isHost || !socket) return;
        const confirmMsg = t('meeting.kick_confirm', '해당 참가자를 내보내시겠습니까?');
        if (window.confirm(confirmMsg)) {
            socket.emit('kick-participant', { participantId, roomId: roomId || 'default-room' });
        }
    };

    const handleSendMessage = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        const msg: ChatMessage = {
            id: Date.now(),
            sender: localParticipant.name,
            content: newMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // Optimistic Update: 본인의 메시지는 즉시 화면에 표시
        setChatMessages(prev => [...prev, msg].slice(-100));

        socket.emit('meeting-chat-send', { roomId, msg });
        setNewMessage('');
    };

    const handleDeleteMessage = (messageId: number) => {
        if (!socket) return;
        
        // Optimistic delete
        setChatMessages(prev => prev.filter(m => m.id !== messageId));
        
        socket.emit('meeting-chat-delete', { roomId, messageId });
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

    const handleShareScreen = (url: string, manualType?: string, presenterId?: string) => {
        let type = manualType || 'image';
        if (url === '') {
            type = 'none';
            // If we are broadcasting WebRTC, ensure we stop local streams too
            if (isSharing) stopStream();
        } else if (!manualType && (url.includes('.mp4') || url.includes('youtube.com') || url.includes('youtu.be'))) {
            type = 'video';
        }
        if (socket) {
            socket.emit('share-screen', { 
                url, 
                type, 
                presenterId: presenterId || (url !== '' ? socket.id : undefined)
            });
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
            <div className="relative w-full h-screen bg-[#F2E7D5] overflow-hidden text-black font-sans flex">
                
                {/* 1. Left Sidebar - Controls */}
                <aside className="w-40 h-full bg-white border-r border-black/10 flex flex-col items-center py-8 z-50 shadow-xl">
                    <div className="flex flex-col items-center w-full gap-8 px-4">
                        {/* Logout & Language */}
                        <div className="grid grid-cols-2 gap-2 w-full">
                            <button 
                                onClick={() => {
                                    if (onClose) {
                                        onClose();
                                    } else {
                                        navigate(-1);
                                    }
                                }} 
                                className="group relative flex items-center justify-center p-3 bg-black/5 rounded-xl hover:bg-red-600/10 transition-all"
                            >
                                <LogOut size={18} className="rotate-180 group-hover:text-red-600" />
                                <span className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-black text-white border border-white/10 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                    {t('common.back')}
                                </span>
                            </button>
                            <div className="group relative flex items-center justify-center p-3 bg-black/5 rounded-xl hover:bg-black/10 transition-all">
                                <LanguageSelector variant="sidebar" />
                                <span className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-black text-white border border-white/10 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                    {t('common.language')}
                                </span>
                            </div>
                        </div>

                        <div className="w-full h-[1px] bg-black/5" />

                        {/* Main Grid Controls */}
                        <div className="grid grid-cols-2 gap-2 w-full">
                            {/* Audio/Video */}
                            <button 
                                onClick={toggleMute}
                                className={`group relative flex items-center justify-center p-4 rounded-xl transition-all ${isMuted ? 'bg-red-600 text-white' : 'bg-black/5 hover:bg-black/10'}`}
                            >
                                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                                <span className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-black text-white text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                    {isMuted ? t('Unmute') : t('Mute')}
                                </span>
                            </button>
                            
                            <button 
                                onClick={toggleVideo}
                                className={`group relative flex items-center justify-center p-4 rounded-xl transition-all ${isVideoOff ? 'bg-red-600 text-white' : 'bg-black/5 hover:bg-black/10'}`}
                            >
                                {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                                <span className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-black text-white text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                    {isVideoOff ? t('Start Video') : t('Stop Video')}
                                </span>
                            </button>

                            {/* Split Modes */}
                            <button 
                                onClick={() => setSplitMode(1)}
                                className={`group relative flex items-center justify-center p-4 rounded-xl transition-all ${splitMode === 1 ? 'bg-red-600 text-white shadow-lg' : 'bg-black/5 hover:bg-black/10'}`}
                            >
                                <Square size={20} />
                                <span className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-black text-white text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                    {t('common.screen_1')}
                                </span>
                            </button>

                            <button 
                                onClick={() => setSplitMode(2)}
                                className={`group relative flex items-center justify-center p-4 rounded-xl transition-all ${splitMode === 2 ? 'bg-red-600 text-white shadow-lg' : 'bg-black/5 hover:bg-black/10'}`}
                            >
                                <Columns2 size={20} />
                                <span className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-black text-white text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                    {t('common.screen_2')}
                                </span>
                            </button>

                            <button 
                                onClick={() => setSplitMode(4)}
                                className={`group relative flex items-center justify-center p-4 rounded-xl transition-all ${splitMode === 4 ? 'bg-red-600 text-white shadow-lg' : 'bg-black/5 hover:bg-black/10'}`}
                            >
                                <LayoutGrid size={20} />
                                <span className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-black text-white text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                    {t('common.screen_4')}
                                </span>
                            </button>

                            {/* Chat */}
                            <button 
                                onClick={() => setShowChat(!showChat)}
                                className={`group relative flex items-center justify-center p-4 rounded-xl transition-all ${showChat ? 'bg-black text-white shadow-lg' : 'bg-black/5 hover:bg-black/10'}`}
                            >
                                <MessageSquare size={20} />
                                <span className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-black text-white text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                    {t('Chat')}
                                </span>
                            </button>

                            {/* Interaction & Share */}
                            <button className="group relative flex items-center justify-center p-4 bg-black/5 hover:bg-black/10 rounded-xl transition-all">
                                <Hand size={20} />
                                <span className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-black text-white text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                    {t('Raise Hand')}
                                </span>
                            </button>

                            {canShareScreen && (
                                <button 
                                    onClick={() => setIsShareModalOpen(true)}
                                    className={`group relative flex items-center justify-center p-4 rounded-xl transition-all border ${screenData.type !== 'none' && screenData.presenterId === socket?.id ? 'bg-red-600/10 border-red-600 text-red-600' : 'bg-black/5 hover:bg-black/10 border-transparent'}`}
                                >
                                    <MonitorUp size={20} />
                                    <span className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-black text-white text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                        {t('Share Screen')}
                                    </span>
                                </button>
                            )}

                            {/* Screen Selection Button */}
                            <button 
                                onClick={() => setIsScreenListModalOpen(true)}
                                className={`group relative flex items-center justify-center p-4 rounded-xl transition-all ${isScreenListModalOpen ? 'bg-red-600/10 text-red-600 border border-red-600/30' : 'bg-black/5 hover:bg-black/10'}`}
                            >
                                <MonitorPlay size={20} />
                                <span className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-black text-white text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                    {t('meeting.screen_selector', 'Screen Selector')}
                                </span>
                            </button>

                            {/* Invite & Participants */}
                            <button 
                                onClick={() => {
                                    const token = Math.random().toString(36).substring(2, 10);
                                    if (socket) socket.emit('register-invite-token', { roomId: roomId || 'default-room', token });
                                    const url = `${window.location.origin}${window.location.pathname}?invite=${token}`;
                                    setInviteLink(url);
                                    setShowInviteModal(true);
                                }}
                                className="group relative flex items-center justify-center p-4 bg-black/5 hover:bg-black/10 rounded-xl transition-all"
                            >
                                <UserPlus size={20} />
                                <span className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-black text-white text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                    {t('Invite')}
                                </span>
                            </button>

                            <button 
                                onClick={() => setShowParticipants(!showParticipants)}
                                className={`group relative flex items-center justify-center p-4 rounded-xl transition-all ${showParticipants ? 'bg-black text-white shadow-lg' : 'bg-black/5 hover:bg-black/10'}`}
                            >
                                <Users size={20} />
                                <span className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-black text-white text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                    {t('Participants')}
                                </span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* 2. Main Content Area (Center + Bottom) */}
                <main className="flex-1 flex flex-col relative overflow-hidden bg-white/50">
                    
                    {/* Top Status Bar (Minimal) */}
                    <div className="h-16 border-b border-black/10 flex items-center justify-between px-10 bg-black/5 backdrop-blur-md">
                        <div className="flex items-center gap-6">
                            <h2 className="text-sm font-black uppercase tracking-widest text-black"><AutoTranslatedText text={t('meeting.meeting_room')} /></h2>
                            <div className="w-[1px] h-4 bg-black/10" />
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-mono text-emerald-600 uppercase tracking-widest">Live Connection</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black opacity-30 uppercase tracking-widest text-black/40">{t('meeting.room_quality')} : ULTRA HD</span>
                        </div>
                    </div>

                    {/* Center: Presentation (Monitor) */}
                    <div className="flex-1 relative flex items-center justify-center p-10 overflow-hidden">
                        <MeetingRoomEnvironment2D 
                            participants={participants}
                            localParticipant={localParticipant}
                            onSeatSelect={handleSeatSelect}
                            meetingMode={meetingMode}
                            screenData={screenData}
                            webrtcStream={
                                screenData.type === 'webrtc' 
                                    ? (screenData.presenterId === socket?.id ? localStream : (screenData.presenterId ? remoteStreams[screenData.presenterId] : null))
                                    : null
                            }
                            splitMode={splitMode}
                        />
                    </div>

                    {/* Bottom: Participant Videos (1-Row Grid) */}
                    <div className="h-48 border-t border-black/10 bg-white flex items-center px-6 gap-4 overflow-x-auto custom-scrollbar">
                        {/* Local Participant */}
                        <div className="flex-shrink-0 w-64 h-36 bg-black rounded-2xl border-2 border-red-600 relative overflow-hidden group">
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-black">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black text-black" style={{ backgroundColor: localParticipant.color }}>
                                    {localParticipant.name[0].toUpperCase()}
                                </div>
                            </div>
                            <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                <span className="text-[10px] font-bold tracking-tight">{localParticipant.name} (Me)</span>
                                {isMuted && <MicOff size={10} className="text-[#FF4757]" />}
                                {isVideoOff && <VideoOff size={10} className="text-[#FF4757]" />}
                            </div>
                        </div>

                        {/* Remote Participants */}
                        {participants.map(p => (
                            <div key={p.id} className="flex-shrink-0 w-64 h-36 bg-black rounded-2xl border border-black/10 relative overflow-hidden group hover:border-red-600/30 transition-colors">
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black text-black" style={{ backgroundColor: p.color }}>
                                        {p.name[0].toUpperCase()}
                                    </div>
                                    {p.isVideoOff && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                            <VideoOff size={32} className="text-white/20" />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                    <span className="text-[10px] font-bold tracking-tight">{p.name}</span>
                                    <div className="flex items-center gap-1">
                                        {p.isMuted && <MicOff size={10} className="text-[#FF4757]" />}
                                        {p.isVideoOff && <VideoOff size={10} className="text-[#FF4757]" />}
                                    </div>
                                </div>
                                {isHost && (
                                    <button 
                                        onClick={() => handleKickParticipant(p.id)}
                                        className="absolute top-3 right-3 p-2 bg-black/40 hover:bg-[#FF4757] text-white/40 hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <UserMinus size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </main>

                {/* 3. Right Sidebar - Chat */}
                <AnimatePresence>
                    {showChat && (
                        <motion.aside 
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 360, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="h-full bg-white border-l border-black/10 flex flex-col z-50 shadow-2xl"
                        >
                            <div className="p-8 border-b border-black/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <MessageSquare size={20} className="text-red-600" />
                                    <h3 className="text-xl font-black tracking-tight text-black">{t('common.chat')}</h3>
                                </div>
                                <button onClick={() => setShowChat(false)} className="p-2 hover:bg-black/5 rounded-lg opacity-40 hover:opacity-100 transition-all text-black">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                {chatMessages.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center gap-4 opacity-20 text-black">
                                        <MessageSquare size={48} strokeWidth={1} />
                                        <p className="text-[10px] font-black uppercase tracking-widest">{t('meeting.no_messages')}</p>
                                    </div>
                                )}
                                {chatMessages.map(msg => (
                                    <div key={msg.id} className={`flex flex-col gap-1 group relative ${msg.sender === localParticipant.name ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-center gap-2 px-1 text-black/60">
                                            <span className="text-[10px] font-black opacity-60 uppercase tracking-widest">{msg.sender}</span>
                                            <span className="text-[8px] opacity-40 font-mono">{msg.timestamp}</span>
                                        </div>
                                        <div className="flex items-center gap-2 max-w-[85%] group">
                                            {msg.sender === localParticipant.name && (
                                                <button 
                                                    onClick={() => handleDeleteMessage(msg.id)}
                                                    className="opacity-0 group-hover:opacity-40 hover:!opacity-100 p-1.5 hover:bg-black/5 rounded-lg transition-all order-first"
                                                >
                                                    <Trash2 size={12} className="text-red-600" />
                                                </button>
                                            )}
                                            <div className={`flex-1 px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed ${msg.sender === localParticipant.name ? 'bg-red-600 text-white rounded-tr-none' : 'bg-black/5 text-black/80 rounded-tl-none border border-black/10'}`}>
                                                {msg.content}
                                            </div>
                                            {(msg.sender !== localParticipant.name && isHost) && (
                                                <button 
                                                    onClick={() => handleDeleteMessage(msg.id)}
                                                    className="opacity-0 group-hover:opacity-40 hover:!opacity-100 p-1.5 hover:bg-black/5 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={12} className="text-red-600" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={handleSendMessage} className="p-6 border-t border-black/10 bg-black/5">
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder={t('meeting.chat_placeholder')}
                                        className="w-full bg-black/5 border border-black/10 rounded-2xl py-4 pl-6 pr-14 text-sm text-black outline-none focus:border-red-600/50 transition-all placeholder:text-black/20"
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black text-white hover:bg-red-600 rounded-xl disabled:opacity-30 disabled:grayscale transition-all active:scale-95"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </form>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Overlays (Modals etc.) */}
                <AnimatePresence>
                    {showParticipants && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-10 relative shadow-2xl"
                            >
                                <button onClick={() => setShowParticipants(false)} className="absolute top-8 right-8 p-3 hover:bg-white/5 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                                <h3 className="text-3xl font-black mb-8 tracking-tight">{t('common.participants')}</h3>
                                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-[#00D2FF]/30">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-black font-black" style={{ backgroundColor: localParticipant.color }}>{localParticipant.name[0]}</div>
                                            <span className="font-bold">{localParticipant.name} (Me)</span>
                                        </div>
                                    </div>
                                    {participants.map(p => (
                                        <div key={p.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-black font-black" style={{ backgroundColor: p.color }}>{p.name[0]}</div>
                                                <span className="font-bold">{p.name}</span>
                                            </div>
                                            {isHost && (
                                                <button onClick={() => handleKickParticipant(p.id)} className="p-2 hover:bg-[#FF4757]/20 text-[#FF4757] rounded-lg transition-all"><UserMinus size={18} /></button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>


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
                                            className="w-full mt-2 border border-red-600/30 hover:bg-red-600/10 text-red-600 font-bold py-4 rounded-xl transition-colors"
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
                        <div className="absolute inset-0 z-[120] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="w-full max-w-md bg-dancheong-ivory border border-dancheong-ink/10 rounded-[2.5rem] p-10 relative shadow-2xl text-dancheong-ink"
                            >
                                <button 
                                    onClick={() => setShowInviteModal(false)}
                                    className="absolute top-8 right-8 p-3 hover:bg-dancheong-ink/5 rounded-full transition-colors group"
                                >
                                    <X size={20} className="text-dancheong-ink/40 group-hover:text-dancheong-ink group-active:scale-90 transition-transform" />
                                </button>
                                
                                <div className="flex flex-col items-center text-center gap-8">
                                    <div className="w-20 h-20 bg-red-600/10 rounded-3xl flex items-center justify-center rotate-12">
                                        <UserPlus size={40} className="text-red-600 -rotate-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-black tracking-tight">{t('common.invite')}</h3>
                                        <p className="text-sm text-dancheong-ink/40 font-medium">{t('common.invite_desc')}</p>
                                    </div>
                                    
                                    <div className="w-full bg-white/40 border border-dancheong-ink/5 p-5 rounded-2xl flex items-center justify-between gap-4 overflow-hidden group hover:border-red-600/30 transition-colors">
                                        <div className="flex-1 overflow-hidden">
                                            <span className="text-[10px] uppercase font-black tracking-widest text-dancheong-ink/20 mb-2 block">{t('common.secure_link')}</span>
                                            <span className="text-xs font-mono text-dancheong-mugwort truncate block text-left">
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
                                            className="px-5 py-3 bg-black text-white hover:bg-red-600 rounded-xl text-xs font-black transition-all hover:scale-105 active:scale-95 shadow-lg"
                                        >
                                            {t('common.copy')}
                                        </button>
                                    </div>
                                    
                                    <p className="text-[10px] text-dancheong-ink/20 font-bold uppercase tracking-[0.2em]">
                                        {t('common.invite_validity')}
                                    </p>
                                    
                                    <button 
                                        onClick={() => setShowInviteModal(false)}
                                        className="w-full py-5 bg-dancheong-ink text-white font-black rounded-2xl transition-all hover:bg-dancheong-mugwort"
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
                                className="absolute top-8 right-8 z-[110] p-4 bg-white/10 hover:bg-red-600 text-white rounded-full transition-colors group shadow-2xl"
                            >
                                <Minimize size={24} className="group-hover:scale-90 transition-transform" />
                            </button>
                            
                            <div className="w-full h-full max-w-[1920px] mx-auto border border-white/10 rounded-2xl overflow-hidden bg-black shadow-2xl flex items-center justify-center">
                                {screenData.type === 'webrtc' ? (
                                    <video 
                                        autoPlay 
                                        playsInline 
                                        muted
                                        className="w-full h-full object-contain"
                                        ref={(video) => {
                                            const stream = screenData.presenterId === socket?.id ? localStream : (screenData.presenterId ? remoteStreams[screenData.presenterId] : null);
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
                            className="absolute inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md"
                        >
                            <motion.div 
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                className="w-full max-w-md p-10 bg-dancheong-ivory border border-dancheong-ink/10 rounded-[40px] shadow-2xl flex flex-col items-center text-center gap-8 text-dancheong-ink"
                            >
                                <div className="w-20 h-20 bg-dancheong-mugwort/10 rounded-3xl flex items-center justify-center text-dancheong-mugwort border border-dancheong-mugwort/20">
                                    <Lock size={40} />
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                    <h2 className="text-3xl font-black tracking-tight">{t('common.secure_entry')}</h2>
                                    <p className="text-dancheong-ink/40 text-sm tracking-wide">
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
                                            className="w-full h-16 bg-white/50 border border-dancheong-ink/5 rounded-2xl px-6 font-mono tracking-widest text-center text-lg focus:outline-none focus:border-red-600/30 focus:bg-white transition-all placeholder:tracking-normal placeholder:font-sans placeholder:text-dancheong-ink/20"
                                        />
                                        {tokenError && (
                                            <p className="absolute -bottom-6 left-0 right-0 text-red-600 text-xs font-bold uppercase tracking-widest">{tokenError}</p>
                                        )}
                                    </div>

                                    <button 
                                        type="submit"
                                        className="h-16 bg-dancheong-ink text-white font-black rounded-2xl hover:bg-dancheong-mugwort transition-all shadow-lg mt-2"
                                    >
                                        <AutoTranslatedText text="입장하기" />
                                    </button>

                                    <button 
                                        type="button"
                                        onClick={() => navigate(-1)}
                                        className="text-dancheong-ink/30 hover:text-dancheong-ink text-xs font-bold uppercase tracking-[0.2em] mt-2 transition-all"
                                    >
                                        <AutoTranslatedText text="돌아가기" />
                                    </button>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Screen Selection Modal */}
                <AnimatePresence>
                    {isScreenListModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="w-full max-w-lg bg-dancheong-ivory border border-dancheong-ink/10 rounded-[2.5rem] p-10 relative shadow-2xl text-dancheong-ink"
                            >
                                <button onClick={() => setIsScreenListModalOpen(false)} className="absolute top-8 right-8 p-3 hover:bg-dancheong-ink/5 rounded-full transition-colors group">
                                    <X size={20} className="text-dancheong-ink/40 group-hover:text-dancheong-ink transition-colors" />
                                </button>
                                <h3 className="text-3xl font-black mb-8 tracking-tight">{t('meeting.screen_selector', 'Screen Selector')}</h3>
                                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                                    {/* Local Screen */}
                                    <div 
                                        onClick={() => {
                                            if (isSharing) handleShareScreen('live-broadcast', 'webrtc', socket?.id);
                                            setIsScreenListModalOpen(false);
                                        }}
                                        className={`flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer ${screenData.presenterId === socket?.id ? 'bg-dancheong-mugwort border-dancheong-mugwort shadow-lg' : 'bg-white/40 border-dancheong-ink/5 hover:bg-white hover:border-dancheong-mugwort/30'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-black font-black" style={{ backgroundColor: localParticipant.color }}>{localParticipant.name[0]}</div>
                                            <div className="flex flex-col">
                                                <span className={`font-bold transition-colors ${screenData.presenterId === socket?.id ? 'text-white' : 'text-dancheong-ink'}`}>{localParticipant.name} (Me)</span>
                                                <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${screenData.presenterId === socket?.id ? 'text-white/60' : (isSharing ? 'text-dancheong-mugwort' : 'text-dancheong-ink/20')}`}>
                                                    {isSharing ? t('meeting.currently_sharing', 'Currently Sharing') : t('meeting.not_sharing', 'Not Sharing')}
                                                </span>
                                            </div>
                                        </div>
                                        {screenData.presenterId === socket?.id && (
                                            <div className="px-3 py-1 bg-white text-dancheong-mugwort text-[10px] font-black rounded-full uppercase shadow-sm">Active</div>
                                        )}
                                    </div>

                                    {/* Remote Screens */}
                                    {participants.map(p => {
                                        const isSharing = !!remoteStreams[p.id];
                                        return (
                                            <div 
                                                key={p.id} 
                                                onClick={() => {
                                                    if (isSharing) handleShareScreen('live-broadcast', 'webrtc', p.id);
                                                    setIsScreenListModalOpen(false);
                                                }}
                                                className={`flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer ${screenData.presenterId === p.id ? 'bg-dancheong-mugwort border-dancheong-mugwort shadow-lg' : 'bg-white/40 border-dancheong-ink/5 hover:bg-white hover:border-dancheong-mugwort/30'} ${!isSharing ? 'opacity-30 cursor-not-allowed grayscale' : ''}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-black font-black" style={{ backgroundColor: p.color }}>{p.name[0]}</div>
                                                    <div className="flex flex-col">
                                                        <span className={`font-bold transition-colors ${screenData.presenterId === p.id ? 'text-white' : 'text-dancheong-ink'}`}>{p.name}</span>
                                                        <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${screenData.presenterId === p.id ? 'text-white/60' : (isSharing ? 'text-dancheong-mugwort' : 'text-dancheong-ink/20')}`}>
                                                            {isSharing ? t('meeting.currently_sharing', 'Currently Sharing') : t('meeting.not_sharing', 'Not Sharing')}
                                                        </span>
                                                    </div>
                                                </div>
                                                {screenData.presenterId === p.id && (
                                                    <div className="px-3 py-1 bg-white text-dancheong-mugwort text-[10px] font-black rounded-full uppercase shadow-sm">Active</div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </ErrorBoundary>
    );
};

export default VirtualMeetingPage;
