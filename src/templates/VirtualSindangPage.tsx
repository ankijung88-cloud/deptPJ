import { useTranslation } from 'react-i18next';
import React, { useState, useEffect, Suspense, useCallback } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, 
    UserPlus,
    Mic, 
    MicOff, 
    Video, 
    VideoOff, 
    LogOut, 
    MessageSquare,
    X,
    Lock,
    Sparkles,
    Image as ImageIcon
} from 'lucide-react';
import { SindangEnvironment } from '../components/gallery/SindangEnvironment';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { useNavigate, useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { useAdmin } from '../hooks/useAdmin';
import { useNavigationState, useImmersiveMode } from '../context/NavigationActionContext';
import { useAutoTranslate } from '../hooks/useAutoTranslate';

interface Participant {
    id: string;
    name: string;
    seatId: number | null;
    color: string;
    position?: [number, number, number];
    isMuted: boolean;
    isVideoOff: boolean;
}

const COLORS = ['#FFD700', '#FF5252', '#FFEB3B', '#E91E63', '#9C27B0', '#FF9800'];

const VirtualSindangPage: React.FC = () => {
    const navigate = useNavigate();
    const { id: roomId } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const { translateAsync } = useAutoTranslate('');
    const roomKey = `sindang_token_${roomId || 'default'}`;
    
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [shrineImageUrl, setShrineImageUrl] = useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    
    // Authorization & Mode States
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [consultationMode, setConsultationMode] = useState<'basic' | 'premium' | null>(null);
    const [entryToken, setEntryToken] = useState('');
    const [showTokenModal, setShowTokenModal] = useState(false);
    
    // Tarot States
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [tarotBackUrl, setTarotBackUrl] = useState<string | null>(null);
    const tarotBackInputRef = React.useRef<HTMLInputElement>(null);
    const [aiReadingResult, setAiReadingResult] = useState<string | null>(null);
    
    const { resetUiTimer } = useNavigationState();
    useImmersiveMode(true);
    
    const [localParticipant, setLocalParticipant] = useState<Participant>({
        id: 'local',
        name: t('Guest') + '_' + Math.floor(Math.random() * 1000),
        seatId: null,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        position: [0, 0, 0],
        isMuted: false,
        isVideoOff: false
    });
    
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [inviteLink, setInviteLink] = useState<string | null>(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    
    const { isAdmin, isAgency } = useAdmin();
    const isHost = isAdmin || isAgency;

    // Initial Authorization Check
    useEffect(() => {
        if (isHost) {
            setIsAuthorized(true);
            setConsultationMode('premium');
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const inviteToken = params.get('invite');
        if (inviteToken) {
            sessionStorage.setItem(roomKey, inviteToken);
            setIsAuthorized(true);
            setConsultationMode('premium');
            return;
        }

        // If they have a saved token, they were doing a premium consultation
        const savedToken = sessionStorage.getItem(roomKey);
        if (savedToken) {
            setIsAuthorized(true);
            setConsultationMode('premium');
            return;
        }

        // Otherwise show modal to choose either AI or Enter Code
        setShowTokenModal(true);
    }, [isHost, roomId, roomKey]);

    // Socket Setup
    useEffect(() => {
        if (!isAuthorized) return;

        const socketUrl = window.location.port === '5173'
            ? window.location.origin.replace('5173', '3000') 
            : window.location.origin;
        
        const newSocket = io(socketUrl, {
            transports: ['polling', 'websocket'],
            autoConnect: true
        });
        
        setSocket(newSocket);
        
        const token = sessionStorage.getItem(roomKey);

        newSocket.on('connect', () => {
            newSocket.emit('join-meeting', { 
                roomId: `sindang_${roomId || 'default'}`, 
                name: localParticipant.name,
                inviteToken: token,
                isHost
            });
        });

        newSocket.on('meeting-error', (data: { message: string }) => {
            alert(data.message);
            if (data.message.includes('토큰') || data.message.includes('정원')) {
                setIsAuthorized(false);
                setShowTokenModal(true);
            }
        });

        newSocket.on('participants-update', (data: Participant[]) => {
            if (Array.isArray(data)) {
                // Enforce 2 person limit client-side just in case
                setParticipants(data.filter(p => p && p.id !== newSocket.id));
            }
        });

        newSocket.on('kicked', async () => {
            const msg = await translateAsync('상담이 종료되었습니다. 상세 페이지로 이동합니다.');
            alert(msg);
            navigate(-1);
        });

        newSocket.on('member-kicked', async (data: { targetId: string }) => {
            if (data.targetId === newSocket.id) {
                const msg = await translateAsync('상담이 종료되었습니다. 상세 페이지로 이동합니다.');
                alert(msg);
                navigate(-1);
            }
        });

        newSocket.on('screen-update', (data: { url: string; type: string }) => {
            if (data.type === 'shrine-image') {
                setShrineImageUrl(data.url);
            } else if (data.type === 'tarot-back') {
                setTarotBackUrl(data.url);
            }
        });

        newSocket.on('custom-event', (data: any) => {
            if (data.type === 'flip-card') {
                setFlippedCards(prev => {
                    if (prev.includes(data.cardIndex)) return prev;
                    return [...prev, data.cardIndex];
                });
            } else if (data.type === 'reset-tarot') {
                setFlippedCards([]);
            }
        });

        return () => {
            newSocket.disconnect();
        };
    }, [isAuthorized, isHost, roomId, roomKey]);

    const handleSeatSelect = useCallback((seatId: number) => {
        setLocalParticipant(prev => ({ ...prev, seatId }));
        if (socket && consultationMode === 'premium') {
            socket.emit('select-seat', { seatId });
        }
    }, [socket, consultationMode]);

    const handleCardFlip = useCallback((cardIndex: number) => {
        setFlippedCards(prev => {
            if (prev.includes(cardIndex)) return prev;
            
            const newFlipped = [...prev, cardIndex];
            
            if (consultationMode === 'premium' && socket) {
                // Emit flip to other users
                socket.emit('send-custom', { type: 'flip-card', cardIndex });
            }
            
            // Check for AI Basic Mode Trigger
            if (consultationMode === 'basic' && newFlipped.length === 3) {
                // Trigger AI Reading automatically after 3 cards
                fetchAiTarotReading(newFlipped);
            }
            
            return newFlipped;
        });
    }, [socket, consultationMode]);

    const fetchAiTarotReading = async (cards: number[]) => {
        try {
            console.log("Fetching AI tarot reading for cards:", cards);
            // Placeholder AI Fetch logic (similarly to how fortune works, or generic proxy)
            // For now, setting a dummy result after small delay to show the system works
            setTimeout(() => {
                setAiReadingResult("AI 타로 마스터의 해석: \n\n과거, 현재, 미래에 걸쳐 뽑으신 세 장의 카드는 각각 새로운 시작, 내면의 직관, 그리고 다가올 풍요를 상징하고 있습니다. 망설이지 말고 직관을 믿고 나아가세요.");
            }, 1500);
        } catch (error) {
            console.error("AI Reading failed", error);
        }
    };

    const handleResetTarot = () => {
        setFlippedCards([]);
        setAiReadingResult(null);
        if (consultationMode === 'premium' && socket) {
            socket.emit('send-custom', { type: 'reset-tarot' });
        }
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (socket) socket.emit('toggle-mute', !isMuted);
    };

    const toggleVideo = () => {
        setIsVideoOff(!isVideoOff);
        if (socket) socket.emit('toggle-video', !isVideoOff);
    };

    const handleEndConsultation = async () => {
        if (!socket || !isHost) return;
        
        const confirmMsg = await translateAsync('상담을 종료하시겠습니까? 클라이언트가 퇴장 처리됩니다.');
        if (!window.confirm(confirmMsg)) return;

        // Kick the other participant (the client)
        if (participants.length > 0) {
            participants.forEach(p => {
                socket.emit('kick-participant', { 
                    participantId: p.id, 
                    roomId: `sindang_${roomId || 'default'}` 
                });
            });
        }

        // Navigate the host back
        setTimeout(() => {
            navigate(-1);
        }, 500);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'shrine-image' | 'tarot-back') => {
        const file = e.target.files?.[0];
        if (!file || !socket || !isHost) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');
            const data = await response.json();
            const imageUrl = data.url;

            if (type === 'shrine-image') {
                setShrineImageUrl(imageUrl);
            } else {
                setTarotBackUrl(imageUrl);
            }

            socket.emit('share-screen', { 
                roomId: `sindang_${roomId || 'default'}`, 
                url: imageUrl, 
                type: type 
            });
        } catch (error) {
            console.error('Image upload error:', error);
            const msg = await translateAsync('이미지 업로드에 실패했습니다.');
            alert(msg);
        }
    };

    const handleTokenSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sessionStorage.setItem(roomKey, entryToken.trim());
        setConsultationMode('premium');
        setIsAuthorized(true);
        setShowTokenModal(false);
    };

    const handleSelectAI = () => {
        setConsultationMode('basic');
        setIsAuthorized(true);
        setShowTokenModal(false);
    };

    return (
        <ErrorBoundary>
            <div 
                className="relative w-full h-screen bg-[#050505] overflow-hidden text-white font-sans"
                onMouseMove={() => resetUiTimer()}
                onMouseEnter={() => resetUiTimer()}
            >
                {/* 3D Scene Layer */}
                <div className="absolute inset-0 z-0 bg-[#050505]">
                    <Canvas 
                        shadows 
                        gl={{ antialias: true, alpha: true }}
                        onCreated={({ gl, scene }) => {
                            gl.setClearColor('#050505');
                            scene.background = new THREE.Color('#050505');
                            scene.fog = new THREE.FogExp2('#050505', 0.05);
                        }}
                    >
                        <Suspense fallback={
                            <Html center>
                                <div className="flex flex-col items-center justify-center gap-6 w-screen h-screen bg-[#050505]">
                                    <div className="relative">
                                        <div className="w-20 h-20 border-4 border-[#FFD700]/10 border-t-[#FFD700] rounded-full animate-spin" />
                                        <div className="absolute inset-0 w-20 h-20 border-4 border-[#FFD700]/5 rounded-full animate-pulse shadow-[0_0_20px_#FFD70022]" />
                                    </div>
                                    <p className="text-[#FFD700] font-black tracking-[0.4em] uppercase animate-pulse">
                                        <AutoTranslatedText text="Entering Shaman House" />
                                    </p>
                                </div>
                            </Html>
                        }>
                            <SindangEnvironment 
                                participants={participants}
                                localParticipant={localParticipant}
                                onSeatSelect={handleSeatSelect}
                                shrineImageUrl={shrineImageUrl}
                                tarotBackUrl={tarotBackUrl}
                                flippedCards={flippedCards}
                                onCardFlip={handleCardFlip}
                                consultationMode={consultationMode || 'premium'}
                            />
                        </Suspense>
                    </Canvas>
                </div>

                {/* Header / HUD */}
                <motion.header 
                    initial={{ y: 0, opacity: 1 }}
                    className="absolute top-0 inset-x-0 z-10 p-10 flex justify-between items-start pointer-events-none"
                    style={{ pointerEvents: 'auto' }}
                >
                    <div className="flex flex-col gap-2 pointer-events-auto">
                        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate(-1)}>
                            <div className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full group-hover:bg-[#FF5252]/20 transition-all">
                                <LogOut size={20} className="rotate-180 group-hover:text-[#FF5252]" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                                    <AutoTranslatedText text="신점 상담소" />
                                    <Sparkles size={20} className="text-[#FFD700]" />
                                </h1>
                                <p className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40 text-[#FF5252]">
                                    <AutoTranslatedText text="Spiritual Consultation Room" />
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pointer-events-auto">
                        <div className="bg-black/60 backdrop-blur-2xl px-6 py-3 rounded-2xl border border-[#FFD700]/20 flex items-center gap-8">
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] font-black opacity-30 text-white uppercase tracking-widest">
                                    <AutoTranslatedText text="Consultation" />
                                </span>
                                <div className="flex items-center gap-2">
                                    <Users size={14} className="text-[#FFD700]" />
                                    <span className="text-xl font-black">{participants.length + 1} <span className="text-sm opacity-40">/ 2</span></span>
                                </div>
                            </div>
                            <div className="w-[1px] h-8 bg-white/10" />
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] font-black opacity-30 text-white uppercase tracking-widest">
                                    <AutoTranslatedText text="Aura Level" />
                                </span>
                                <span className="text-sm font-bold text-[#FFD700]"><AutoTranslatedText text="Divine" /></span>
                            </div>
                        </div>
                    </div>
                </motion.header>

                {/* Controls (Bottom Bar) */}
                <footer className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20">
                    <motion.div 
                        initial={{ y: 0, opacity: 1 }}
                        className="flex items-center gap-4 px-8 py-5 bg-black/60 backdrop-blur-3xl rounded-[2.5rem] border border-[#FFD700]/20 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]"
                        style={{ pointerEvents: 'auto' }}
                    >
                        <div className="flex items-center gap-3 pr-6 border-r border-white/10">
                            <button 
                                onClick={toggleMute}
                                className={`p-4 rounded-2xl transition-all duration-300 ${isMuted ? 'bg-[#FF5252] text-white shadow-[0_0_20px_#FF525244]' : 'bg-white/5 hover:bg-white/10'}`}
                            >
                                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                            </button>
                            <button 
                                onClick={toggleVideo}
                                className={`p-4 rounded-2xl transition-all duration-300 ${isVideoOff ? 'bg-[#FF5252] text-white shadow-[0_0_20px_#FF525244]' : 'bg-white/5 hover:bg-white/10'}`}
                            >
                                {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                            </button>
                        </div>

                        <div className="flex items-center gap-3 px-3">
                            <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"><MessageSquare size={24} /></button>
                        </div>

                        <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                            <button 
                                onClick={() => {
                                    const token = Math.random().toString(36).substring(2, 10);
                                    if (socket) socket.emit('register-invite-token', { roomId: `sindang_${roomId || 'default'}`, token });
                                    const url = `${window.location.origin}${window.location.pathname}?invite=${token}`;
                                    setInviteLink(url);
                                    setShowInviteModal(true);
                                }}
                                disabled={participants.length >= 1}
                                className={`flex items-center gap-3 px-6 py-4 font-black rounded-2xl transition-all shadow-[0_5px_15px_rgba(255,215,0,0.2)] ${participants.length >= 1 ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50' : 'bg-[#FFD700] hover:bg-[#FFD700]/80 text-black'}`}
                            >
                                <UserPlus size={20} />
                                <span className="text-sm uppercase tracking-widest hidden md:block">
                                    {participants.length >= 1 ? <AutoTranslatedText text="Room Full" /> : <AutoTranslatedText text="Invite" />}
                                </span>
                            </button>

                            {isHost && (
                                <button 
                                    onClick={handleEndConsultation}
                                    className="flex items-center gap-3 px-6 py-4 font-black rounded-2xl bg-gradient-to-r from-[#FF5252] to-[#8B0000] text-white shadow-[0_10px_20px_rgba(255,82,82,0.3)] hover:scale-105 transition-all"
                                >
                                    <LogOut size={20} />
                                    <span className="text-sm uppercase tracking-widest hidden md:block">
                                        <AutoTranslatedText text="상담 끝내기" />
                                    </span>
                                </button>
                            )}

                            {isHost && (
                                <>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={(e) => handleImageUpload(e, 'shrine-image')} 
                                        className="hidden" 
                                        accept="image/*"
                                    />
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center gap-3 px-6 py-4 font-black rounded-2xl bg-gradient-to-r from-[#6366f1] to-[#4f46e5] text-white shadow-[0_10px_20px_rgba(99,102,241,0.3)] hover:scale-105 transition-all"
                                        title={t("신당 배경 이미지 업로드")}
                                    >
                                        <ImageIcon size={20} />
                                        <span className="text-sm uppercase tracking-widest hidden md:block">
                                            <AutoTranslatedText text="배경 업로드" />
                                        </span>
                                    </button>
                                    
                                    <input 
                                        type="file" 
                                        ref={tarotBackInputRef} 
                                        onChange={(e) => handleImageUpload(e, 'tarot-back')} 
                                        className="hidden" 
                                        accept="image/*"
                                    />
                                    <button 
                                        onClick={() => tarotBackInputRef.current?.click()}
                                        className="flex items-center gap-3 px-6 py-4 font-black rounded-2xl bg-gradient-to-r from-[#9C27B0] to-[#7B1FA2] text-white shadow-[0_10px_20px_rgba(156,39,176,0.3)] hover:scale-105 transition-all"
                                        title={t("나만의 타로 뒷면 업로드")}
                                    >
                                        <Sparkles size={20} />
                                        <span className="text-sm uppercase tracking-widest hidden md:block">
                                            <AutoTranslatedText text="타로덱 설정" />
                                        </span>
                                    </button>

                                    <button 
                                        onClick={handleResetTarot}
                                        className="flex items-center gap-3 px-6 py-4 font-black rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all"
                                    >
                                        <span className="text-sm uppercase tracking-widest hidden md:block">
                                            <AutoTranslatedText text="타로 섞기 (Reset)" />
                                        </span>
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                </footer>

                {/* Entry Modal */}
                <AnimatePresence>
                    {showTokenModal && (
                        <motion.div 
                            className="absolute inset-0 z-[100] flex items-center justify-center bg-[#050505]/90 backdrop-blur-3xl p-6"
                        >
                            <motion.div 
                                className="w-full max-w-4xl grid md:grid-cols-2 gap-8"
                            >
                                {/* Mode 1: AI Tarot (Basic) */}
                                <div className="p-12 bg-black/40 border border-[#9C27B0]/30 rounded-[3rem] shadow-2xl flex flex-col items-center text-center gap-8 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-b from-[#9C27B0]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    
                                    <div className="w-20 h-20 bg-[#9C27B0]/10 rounded-3xl flex items-center justify-center text-[#9C27B0] border border-[#9C27B0]/30 shadow-[0_0_30px_rgba(156,39,176,0.2)] group-hover:scale-110 transition-transform">
                                        <Sparkles size={40} />
                                    </div>
                                    
                                    <div className="flex flex-col gap-2 relative z-10">
                                        <h2 className="text-3xl font-black tracking-tight text-[#9C27B0]">
                                            <AutoTranslatedText text="AI 타로 보기" />
                                        </h2>
                                        <p className="text-white/40 text-sm tracking-wide h-16">
                                            <AutoTranslatedText text="신비로운 AI 타로 마스터와 함께 오늘 하루의 운세와 고민을 혼자 편안하게 점쳐보세요." />
                                        </p>
                                    </div>

                                    <button 
                                        onClick={handleSelectAI}
                                        className="w-full py-5 bg-[#9C27B0] text-white font-black rounded-2xl transition-all hover:scale-[1.02] shadow-[0_10px_30px_rgba(156,39,176,0.3)] relative z-10"
                                    >
                                        <AutoTranslatedText text="혼자 점보기 (기본형)" />
                                    </button>
                                </div>

                                {/* Mode 2: 1:1 Consultation (Premium) */}
                                <div className="p-12 bg-black/40 border border-[#FFD700]/30 rounded-[3rem] shadow-2xl flex flex-col items-center text-center gap-8">
                                    <div className="w-20 h-20 bg-[#FFD700]/10 rounded-3xl flex items-center justify-center text-[#FFD700] border border-[#FFD700]/30">
                                        <Lock size={40} />
                                    </div>
                                    
                                    <div className="flex flex-col gap-2">
                                        <h2 className="text-3xl font-black tracking-tight text-[#FFD700]"><AutoTranslatedText text="1:1 타로 점사" /></h2>
                                        <p className="text-white/40 text-sm tracking-wide h-16">
                                            <AutoTranslatedText text="전문 타로술사와의 프라이빗한 1:1 상담. 부여받은 입장 코드를 입력해 주세요." />
                                        </p>
                                    </div>

                                    <form onSubmit={handleTokenSubmit} className="w-full flex flex-col gap-4">
                                        <input 
                                            type="text" 
                                            value={entryToken}
                                            onChange={(e) => setEntryToken(e.target.value)}
                                            placeholder={t("Access Code")}
                                            className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 font-mono tracking-widest text-center text-lg focus:outline-none focus:border-[#FFD700]/50 transition-all placeholder:tracking-normal placeholder:font-sans placeholder:text-white/20 text-white"
                                        />
                                        <button 
                                            type="submit"
                                            className="w-full py-5 bg-[#FFD700] text-black font-black rounded-2xl transition-all hover:scale-[1.02] shadow-[0_10px_30px_rgba(255,215,0,0.3)]"
                                        >
                                            <AutoTranslatedText text="전문가 상담 입장 (고급형)" />
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Invite Modal */}
                <AnimatePresence>
                    {showInviteModal && (
                        <div className="absolute inset-0 z-[120] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
                            <motion.div
                                className="w-full max-w-md bg-[#0a0a0a] border border-[#FFD700]/20 rounded-[2.5rem] p-10 relative shadow-[0_50px_100px_-20px_rgba(0,0,0,1)]"
                            >
                                <button onClick={() => setShowInviteModal(false)} className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
                                
                                <div className="flex flex-col items-center text-center gap-8">
                                    <div className="w-20 h-20 bg-[#FFD700]/10 rounded-3xl flex items-center justify-center rotate-12">
                                        <UserPlus size={40} className="text-[#FFD700] -rotate-12" />
                                    </div>
                                    <h3 className="text-3xl font-black tracking-tight">
                                        <AutoTranslatedText text="Invite Client" />
                                    </h3>
                                    
                                    <div className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between gap-4 overflow-hidden group">
                                        <div className="flex-1 overflow-hidden">
                                            <span className="text-[10px] uppercase font-black tracking-widest text-white/20 mb-2 block text-left">
                                                <AutoTranslatedText text="Secure Invite Link" />
                                            </span>
                                            <span className="text-xs font-mono text-[#FFD700] truncate block text-left">{inviteLink}</span>
                                        </div>
                                        <button 
                                            onClick={async () => {
                                                if (inviteLink) {
                                                    navigator.clipboard.writeText(inviteLink).then(async () => {
                                                        const msg = await translateAsync('초대 링크가 복사되었습니다!');
                                                        alert(msg);
                                                    });
                                                }
                                            }}
                                            className="px-5 py-3 bg-[#FFD700] text-black rounded-xl text-xs font-black transition-all hover:scale-105"
                                        >
                                            <AutoTranslatedText text="COPY" />
                                        </button>
                                    </div>
                                    <button onClick={() => setShowInviteModal(false)} className="w-full py-5 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl transition-all">
                                        <AutoTranslatedText text="DONE" />
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* AI Reading Result Modal */}
                <AnimatePresence>
                    {aiReadingResult && (
                        <div className="absolute inset-0 z-[150] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="w-full max-w-2xl bg-[#110e1a] border border-[#9C27B0]/40 rounded-[2.5rem] p-10 relative overflow-hidden shadow-[0_30px_100px_rgba(156,39,176,0.3)]"
                            >
                                <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#9C27B0] blur-[100px] opacity-20 rounded-full" />
                                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#4f46e5] blur-[100px] opacity-20 rounded-full" />
                                
                                <button onClick={handleResetTarot} className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors relative z-10"><X size={20} /></button>
                                
                                <div className="flex flex-col items-center text-center gap-6 relative z-10">
                                    <div className="w-16 h-16 bg-[#9C27B0]/20 rounded-2xl flex items-center justify-center text-[#e879f9] border border-[#9C27B0]/50 shadow-[0_0_30px_rgba(156,39,176,0.4)]">
                                        <Sparkles size={32} />
                                    </div>
                                    <h3 className="text-3xl font-black tracking-tight text-white">
                                        <AutoTranslatedText text="AI 타로 해석" />
                                    </h3>
                                    
                                    <div className="w-full bg-white/5 border border-white/10 p-8 rounded-3xl text-left text-white/80 leading-relaxed font-medium whitespace-pre-wrap max-h-[50vh] overflow-y-auto custom-scrollbar">
                                        <AutoTranslatedText text={aiReadingResult} />
                                    </div>
                                    
                                    <button onClick={handleResetTarot} className="mt-4 px-8 py-4 bg-gradient-to-r from-[#9C27B0] to-[#7B1FA2] text-white font-black rounded-2xl transition-all hover:scale-105 shadow-[0_10px_20px_rgba(156,39,176,0.3)]">
                                        <AutoTranslatedText text="새로운 질문하기" />
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </ErrorBoundary>
    );
};

export default VirtualSindangPage;
