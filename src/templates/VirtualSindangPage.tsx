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
    
    // Authorization States
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [entryToken, setEntryToken] = useState('');
    const [showTokenModal, setShowTokenModal] = useState(false);
    
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
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const inviteToken = params.get('invite');
        if (inviteToken) {
            sessionStorage.setItem(roomKey, inviteToken);
            setIsAuthorized(true);
            return;
        }

        const savedToken = sessionStorage.getItem(roomKey);
        if (savedToken) {
            setIsAuthorized(true);
            return;
        }

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
            }
        });

        return () => {
            newSocket.disconnect();
        };
    }, [isAuthorized, isHost, roomId, roomKey]);

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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

            setShrineImageUrl(imageUrl);
            socket.emit('share-screen', { 
                roomId: `sindang_${roomId || 'default'}`, 
                url: imageUrl, 
                type: 'shrine-image' 
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
                                        onChange={handleImageUpload} 
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
                                </>
                            )}
                        </div>
                    </motion.div>
                </footer>

                {/* Entry Modal */}
                <AnimatePresence>
                    {showTokenModal && (
                        <motion.div 
                            className="absolute inset-0 z-[100] flex items-center justify-center bg-[#050505]/90 backdrop-blur-3xl"
                        >
                            <motion.div 
                                className="w-full max-w-md p-12 bg-black/40 border border-[#FFD700]/30 rounded-[3rem] shadow-2xl flex flex-col items-center text-center gap-8"
                            >
                                <div className="w-20 h-20 bg-[#FFD700]/10 rounded-3xl flex items-center justify-center text-[#FFD700] border border-[#FFD700]/30">
                                    <Lock size={40} />
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                    <h2 className="text-3xl font-black tracking-tight text-[#FFD700]"><AutoTranslatedText text="영적 입장" /></h2>
                                    <p className="text-white/40 text-sm tracking-wide">
                                        <AutoTranslatedText text="이곳은 조용한 상담을 위한 신성한 공간입니다. 부여받은 입장 코드를 입력해 주세요." />
                                    </p>
                                </div>

                                <form onSubmit={handleTokenSubmit} className="w-full flex flex-col gap-4">
                                    <input 
                                        type="text" 
                                        autoFocus
                                        value={entryToken}
                                        onChange={(e) => setEntryToken(e.target.value)}
                                        placeholder={t("Access Code")}
                                        className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 font-mono tracking-widest text-center text-lg focus:outline-none focus:border-[#FFD700]/50 transition-all placeholder:tracking-normal placeholder:font-sans placeholder:text-white/10"
                                    />
                                    <button 
                                        type="submit"
                                        className="w-full py-5 bg-[#FFD700] text-black font-black rounded-2xl transition-all hover:scale-[1.02] shadow-[0_10px_30px_rgba(255,215,0,0.3)]"
                                    >
                                        <AutoTranslatedText text="ENTER THE SHRINE" />
                                    </button>
                                </form>
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
            </div>
        </ErrorBoundary>
    );
};

export default VirtualSindangPage;
