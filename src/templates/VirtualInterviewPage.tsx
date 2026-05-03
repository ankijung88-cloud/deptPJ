import React, { useState, useEffect, Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, 
    Mic, MicOff, Video, VideoOff, LogOut, Settings,
    X, FileText, Upload, ChevronRight, Monitor,
    Lock, UserPlus
} from 'lucide-react';
import { InterviewEnvironment, SharedMaterial } from '../components/gallery/InterviewEnvironment';
import { useNavigate, useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { useAdmin } from '../hooks/useAdmin';
import { useWebRTCScreenShare } from '../hooks/useWebRTCScreenShare';
import { useImmersiveMode } from '../context/NavigationActionContext';
import { useTranslation } from 'react-i18next';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { useAutoTranslate } from '../hooks/useAutoTranslate';

interface Participant {
    id: string;
    name: string;
    seatId: number | null;
    color: string;
    role: 'interviewer' | 'candidate' | 'audience';
    status: 'waiting' | 'in-progress' | 'completed';
    joinTime: number;
    isMuted: boolean;
    isVideoOff: boolean;
}

const COLORS = ['#00D2FF', '#FF4757', '#2ECC71', '#F39C12', '#9B59B6', '#FFD32A'];

interface VirtualInterviewPageProps {
    item?: any;
    productId?: string;
    onClose?: () => void;
}

const VirtualInterviewPage: React.FC<VirtualInterviewPageProps> = ({ item, productId: propProductId, onClose }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id: paramRoomId } = useParams<{ id: string }>();
    const roomId = paramRoomId || propProductId || item?.id;
    const { translateAsync } = useAutoTranslate('');
    
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [showParticipants, setShowParticipants] = useState(false);
    const [sharedMaterials, setSharedMaterials] = useState<SharedMaterial[]>([]);
    const [activeMaterialId, setActiveMaterialId] = useState<string | null>(null);
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [showMaterials, setShowMaterials] = useState(false);
    
    // Authorization & Queue States
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [showEntryModal, setShowEntryModal] = useState(false);
    const [entryToken, setEntryToken] = useState('');
    const [tokenError, setTokenError] = useState('');
    const [inviteLink, setInviteLink] = useState<string | null>(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [currentCandidateId, setCurrentCandidateId] = useState<string | null>(null);
    const roomKey = `interview_token_${roomId || 'default'}`;
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    useImmersiveMode(true);
    
    const { isAdmin, isAgency } = useAdmin();
    const [currentRole, setCurrentRole] = useState<'interviewer' | 'candidate' | 'audience'>(
        isAdmin || isAgency ? 'interviewer' : 'candidate'
    );

    const savedName = localStorage.getItem('interview_user_name');
    const [localParticipant, setLocalParticipant] = useState<Participant>({
        id: 'local',
        name: savedName || (t('interview.interviewer_prefix') || 'Interviewer_') + Math.floor(Math.random() * 100),
        seatId: null,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        role: currentRole,
        status: 'waiting',
        joinTime: Date.now(),
        isMuted: false,
        isVideoOff: true
    });
    
    const [participants, setParticipants] = useState<Participant[]>([]);

    // WebRTC Hook
    const { 
        localStream, 
        remoteStreams, 
        startCameraShare,
        stopStream
    } = useWebRTCScreenShare(socket, participants);

    // Initial Authorization Check
    useEffect(() => {
        if (isAdmin || isAgency) {
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

        // Otherwise, show professional entry modal
        setShowEntryModal(true);
    }, [isAdmin, isAgency, roomId, roomKey]);

    // Socket Setup
    useEffect(() => {
        if (!isAuthorized) return;

        const socketUrl = window.location.port === '5173'
            ? window.location.origin.replace('5173', '3000') 
            : window.location.origin;
        
        const newSocket = io(socketUrl, { transports: ['polling', 'websocket'] });
        setSocket(newSocket);
        
        newSocket.on('connect', () => {
            console.log('[Socket] Connected!', newSocket.id);
            const token = sessionStorage.getItem(roomKey);
            newSocket.emit('join-meeting', { 
                roomId: roomId || 'interview-room', 
                name: localParticipant.name,
                isHost: isAdmin || isAgency,
                role: currentRole,
                status: isAdmin || isAgency ? 'completed' : 'waiting',
                joinTime: localParticipant.joinTime,
                inviteToken: token
            });
        });

        newSocket.on('participants-update', (data: any[]) => {
            const remoteParticipants = data.filter(p => p.id !== newSocket.id);
            setParticipants(remoteParticipants);
        });

        newSocket.on('resume-broadcast', (material: SharedMaterial) => {
            console.log('[Socket] New material shared:', material.name);
            setSharedMaterials(prev => {
                const exists = prev.find(m => m.id === material.id);
                if (exists) return prev;
                return [...prev, material];
            });
            setActiveMaterialId(material.id);
        });

        newSocket.on('interview-status-sync', (data: { currentCandidateId: string | null; updatedParticipants: any[] }) => {
            console.log('[Socket] Interview status sync:', data);
            setCurrentCandidateId(data.currentCandidateId);
            setParticipants(prev => {
                // Merge status updates into existing participants
                return prev.map(p => {
                    const update = data.updatedParticipants.find(up => up.id === p.id);
                    return update ? { ...p, status: update.status } : p;
                });
            });
        });

        return () => {
            newSocket.disconnect();
            stopStream();
        };
    }, [isAuthorized]);

    // Synchronize Mute/Video State with Local Stream Tracks and Server
    useEffect(() => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !isMuted;
            });
            localStream.getVideoTracks().forEach(track => {
                track.enabled = !isVideoOff;
            });
        }
        // Broadcast statuses to others
        if (socket) {
            socket.emit('participant-status-update', { isMuted, isVideoOff });
        }
    }, [isMuted, isVideoOff, localStream, socket]);

    const handleSeatSelect = (seatId: number) => {
        if (socket) {
            socket.emit('select-seat', { seatId });
            setLocalParticipant(prev => ({ ...prev, seatId }));
        }
    };

    const handleTokenSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!entryToken.trim()) {
            const errorMsg = await translateAsync('Please enter a valid access token.');
            setTokenError(errorMsg);
            return;
        }
        
        sessionStorage.setItem(roomKey, entryToken.trim());
        setIsAuthorized(true);
        setShowEntryModal(false);
        setTokenError('');
    };

    const handleGenerateInvite = () => {
        if (!isAdmin && !isAgency) return;
        
        // Mock token generation
        const token = Math.random().toString(36).substring(2, 10);
        const inviteUrl = `${window.location.origin}${window.location.pathname}?invite=${token}`;
        
        // Ideally register token on server:
        if (socket) socket.emit('register-invite-token', { roomId: roomId || 'interview-room', token });
        
        setInviteLink(inviteUrl);
        setShowInviteModal(true);
    };

    const handleNameUpdate = (newName: string) => {
        setLocalParticipant(prev => ({ ...prev, name: newName }));
        localStorage.setItem('interview_user_name', newName);
        if (socket) {
            socket.emit('update-name', { name: newName });
        }
    };

    const handleNextCandidate = () => {
        if (!socket || !isAuthorized || (!isAdmin && !isAgency)) return;

        // Find the candidates sorted by join time
        const candidates = participants
            .filter(p => p.role === 'candidate')
            .sort((a, b) => a.joinTime - b.joinTime);

        let nextCandidateId: string | null = null;
        const updatedStatusMap: any[] = [];

        // 1. Current in-progress candidate becomes 'completed'
        if (currentCandidateId) {
            updatedStatusMap.push({ id: currentCandidateId, status: 'completed' });
        }

        // 2. Find next 'waiting' candidate
        const nextInQueue = candidates.find(c => c.status === 'waiting' && c.id !== currentCandidateId);
        if (nextInQueue) {
            nextCandidateId = nextInQueue.id;
            updatedStatusMap.push({ id: nextCandidateId, status: 'in-progress' });
        }

        // Broadcast to all
        socket.emit('interview-control', {
            type: 'STATUS_SYNC',
            currentCandidateId: nextCandidateId,
            updatedParticipants: updatedStatusMap
        });
        
        // Update local state immediately for responsiveness
        setCurrentCandidateId(nextCandidateId);
        setParticipants(prev => prev.map(p => {
            const update = updatedStatusMap.find(u => u.id === p.id);
            return update ? { ...p, status: update.status } : p;
        }));
    };

    const toggleCamera = async () => {
        if (!isVideoOff) {
            stopStream();
            setIsVideoOff(true);
        } else {
            const stream = await startCameraShare();
            if (stream) setIsVideoOff(false);
        }
    };

    // Using the specifically generated Namsan sunset with Han River view
    const backdropUrl = '/assets/images/backgrounds/namsan_sunset.png';

    const handleMaterialUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !socket) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            const newMaterial: SharedMaterial = {
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                url: base64,
                type: (isAdmin || isAgency) ? 'reference' : 'resume',
                ownerName: localParticipant.name
            };

            setSharedMaterials(prev => [...prev, newMaterial]);
            setActiveMaterialId(newMaterial.id);
            socket.emit('resume-upload', newMaterial);
        };
        reader.readAsDataURL(file);
    };

    const activeMaterial = sharedMaterials.find(m => m.id === activeMaterialId) || null;

    return (
        <div className="relative w-full h-screen bg-[#F9F9F9] overflow-hidden">
            {/* 3D Canvas */}
            <div className="absolute inset-0 z-0">
                <ErrorBoundary>
                    <Canvas shadows dpr={[1, 2]}>
                        <Suspense fallback={null}>
                            <InterviewEnvironment 
                                participants={participants || []}
                                localParticipant={{
                                    ...(localParticipant || {}), 
                                    id: socket?.id || 'local', 
                                    isVideoOff
                                } as any}
                                onSeatSelect={handleSeatSelect}
                                localStream={localStream}
                                remoteStreams={remoteStreams || {}}
                                backdropUrl={backdropUrl}
                                activeMaterial={activeMaterial}
                                currentCandidateId={currentCandidateId}
                                onScreenClick={() => setShowResumeModal(true)}
                                onNameUpdate={handleNameUpdate}
                            />
                        </Suspense>
                    </Canvas>
                </ErrorBoundary>
            </div>

            {/* Overlays */}
            <div className="absolute inset-0 pointer-events-none z-10">
                {/* Header */}
                <div className="p-8 flex justify-between items-start pointer-events-auto">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <h1 className="text-xl font-black tracking-tighter text-black uppercase group">
                                <span className="text-black/40 group-hover:text-red-600 transition-colors"><AutoTranslatedText text="Virtual" /></span> <AutoTranslatedText text="Interview" />
                            </h1>
                        </div>
                        <p className="text-[10px] text-black/30 font-bold tracking-[0.3em] uppercase pl-5"><AutoTranslatedText text="Namsan Premium Suite" /></p>
                    </div>

                    <div className="flex items-center gap-3 pl-6 border-l border-black/10">
                        {(isAdmin || isAgency) && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleGenerateInvite}
                                className="flex items-center gap-3 px-6 py-4 bg-black hover:bg-red-600 text-white font-black rounded-2xl transition-all shadow-lg"
                            >
                                <UserPlus size={20} />
                                <span className="text-sm uppercase tracking-widest hidden md:block"><AutoTranslatedText text="초대링크" /></span>
                            </motion.button>
                        )}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowSettings(!showSettings)}
                            className="p-4 bg-white border border-black/10 rounded-2xl text-black/60 hover:text-black transition-colors shadow-md"
                        >
                            <Settings size={20} />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onClose ? onClose() : navigate(-1)}
                            className="px-6 py-4 bg-red-600 hover:bg-red-700 rounded-2xl text-white font-black text-xs tracking-widest flex items-center gap-3 transition-all shadow-md"
                        >
                            <LogOut size={16} /> <AutoTranslatedText text="EXIT ROOM" />
                        </motion.button>
                    </div>
                </div>

                {/* Bottom Controls */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 pointer-events-auto">
                    <div className="bg-white border border-black/10 p-4 rounded-[2.5rem] flex items-center gap-3 shadow-2xl">
                        <ControlBtn 
                            active={!isMuted} 
                            onClick={() => setIsMuted(!isMuted)} 
                            label={isMuted ? t('common.mic_on') : t('common.mic_off')}
                            icon={isMuted ? <MicOff size={22} /> : <Mic size={22} />} 
                        />
                        <ControlBtn 
                            active={!isVideoOff} 
                            onClick={toggleCamera} 
                            label={isVideoOff ? t('common.camera_on') : t('common.camera_off')}
                            icon={isVideoOff ? <VideoOff size={22} /> : <Video size={22} />} 
                        />
                        <div className="w-px h-8 bg-black/10 mx-2" />
                        
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleCamera}
                            className={`flex flex-col items-center gap-1 group transition-all px-6 py-2 rounded-2xl ${
                                !isVideoOff ? 'bg-red-600 text-white shadow-md' : 'text-black/40 hover:text-black'
                            }`}
                        >
                            <Monitor size={24} className={!isVideoOff ? 'animate-pulse' : ''} />
                            <span className="text-[9px] font-black uppercase tracking-tighter"><AutoTranslatedText text="스크린 연동" /></span>
                        </motion.button>

                        <div className="w-px h-8 bg-black/10 mx-2" />
                        
                        {/* Resume Upload (Candidate Only) */}
                        {currentRole === 'candidate' && (
                            <>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handleMaterialUpload} 
                                />
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`flex flex-col items-center gap-1 group transition-all px-6 py-2 rounded-2xl ${
                                        sharedMaterials.length > 0 ? 'bg-emerald-500/20 text-emerald-500' : 'text-black/40 hover:text-black'
                                    }`}
                                >
                                    <Upload size={24} />
                                    <span className="text-[9px] font-black uppercase tracking-tighter"><AutoTranslatedText text="이력서 공유" /></span>
                                </motion.button>
                                <div className="w-px h-8 bg-black/10 mx-2" />
                            </>
                        )}

                        {/* Reference Material Upload (Interviewer/Agency Only) */}
                        {(currentRole === 'interviewer' || currentRole === 'audience') && (
                            <>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handleMaterialUpload} 
                                />
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`flex flex-col items-center gap-1 group transition-all px-6 py-2 rounded-2xl ${
                                        sharedMaterials.length > 0 ? 'bg-red-600 text-white shadow-md' : 'text-black/40 hover:text-black'
                                    }`}
                                >
                                    <FileText size={24} />
                                    <span className="text-[9px] font-black uppercase tracking-tighter"><AutoTranslatedText text="참고자료 공유" /></span>
                                </motion.button>
                                <div className="w-px h-8 bg-black/10 mx-2" />
                            </>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                                setShowMaterials(!showMaterials);
                                if (showParticipants) setShowParticipants(false);
                            }}
                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                                showMaterials ? 'bg-emerald-500 text-black' : 'bg-black/5 text-black/40 hover:bg-black/10'
                            }`}
                        >
                            <FileText size={22} />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                                setShowParticipants(!showParticipants);
                                if (showMaterials) setShowMaterials(false);
                            }}
                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                                showParticipants ? 'bg-red-600 text-white' : 'bg-black/5 text-black/40 hover:bg-black/10'
                            }`}
                        >
                            <Users size={22} />
                        </motion.button>

                        {(isAdmin || isAgency) && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleNextCandidate}
                                className="px-6 h-14 bg-emerald-500 rounded-full flex items-center gap-2 group border border-emerald-400/50 shadow-lg"
                            >
                                <ChevronRight size={18} className="text-white group-hover:translate-x-1 transition-transform" />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none"><AutoTranslatedText text="다음 지원자 호출" /></span>
                            </motion.button>
                        )}
                    </div>
                </div>

                {/* Role and Seat Guide */}
                <div className="absolute bottom-12 left-12 pointer-events-auto">
                    {!localParticipant.seatId && (
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-black text-white px-6 py-4 rounded-2xl font-black text-xs tracking-tighter shadow-xl"
                        >
                                                        <AutoTranslatedText text="원하시는 좌석을 선택하여 착석해주세요" />
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Settings Sidebar */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        className="absolute top-0 right-0 w-80 h-full bg-white border-l border-black/10 p-10 z-50 flex flex-col gap-8 shadow-2xl"
                    >
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-black tracking-tighter uppercase p-2 border-b-2 border-red-600 text-black">Settings</h2>
                            <button onClick={() => setShowSettings(false)} className="text-black/20 hover:text-black"><X size={24} /></button>
                        </div>
                        
                        <div className="space-y-6 text-black">
                            <div className="space-y-3">
                                <label className="text-[10px] text-black/40 font-black uppercase tracking-[0.2em]">Participant Role</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <RoleBtn 
                                        active={currentRole === 'interviewer'} 
                                        onClick={() => setCurrentRole('interviewer')} 
                                        label={<AutoTranslatedText text="면접위원" />} 
                                    />
                                    <RoleBtn 
                                        active={currentRole === 'candidate'} 
                                        onClick={() => setCurrentRole('candidate')} 
                                        label={<AutoTranslatedText text="지원자" />} 
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Participants Sidebar */}
            <AnimatePresence>
                {showParticipants && (
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        className="absolute top-0 left-0 w-80 h-full bg-white border-r border-black/10 p-10 z-50 flex flex-col gap-6 shadow-2xl"
                    >
                        <div className="flex justify-between items-center text-black">
                            <h2 className="text-xl font-black tracking-tighter uppercase p-2 border-b-2 border-red-600">
                                <AutoTranslatedText text="Participants" />
                            </h2>
                            <button onClick={() => setShowParticipants(false)} className="text-black/20 hover:text-black"><X size={24} /></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                            {/* Local User */}
                            <ParticipantItem participant={localParticipant} isSelf />
                            
                            {/* Remote Users */}
                            {participants.map(p => (
                                <ParticipantItem key={p.id} participant={p} />
                            ))}

                            {participants.length === 0 && (
                                <div className="py-20 text-center">
                                    <p className="text-[10px] text-black/40 font-black uppercase tracking-widest">
                                        <AutoTranslatedText text="대기 중인 참가자가 없습니다" />
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Shared Materials Sidebar */}
            <AnimatePresence>
                {showMaterials && (
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        className="absolute top-0 left-0 w-80 h-full bg-white border-r border-black/10 p-10 z-50 flex flex-col gap-6 shadow-2xl"
                    >
                        <div className="flex justify-between items-center text-black">
                            <h2 className="text-xl font-black tracking-tighter uppercase p-2 border-b-2 border-red-600">
                                <AutoTranslatedText text="Materials" />
                            </h2>
                            <button onClick={() => setShowMaterials(false)} className="text-black/20 hover:text-black"><X size={24} /></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                            {sharedMaterials.map(m => (
                                <motion.div 
                                    key={m.id}
                                    whileHover={{ x: 5 }}
                                    onClick={() => {
                                        setActiveMaterialId(m.id);
                                        setShowResumeModal(true);
                                    }}
                                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                                        activeMaterialId === m.id 
                                        ? 'bg-emerald-500/20 border-emerald-500/50' 
                                        : 'bg-white/5 border-white/5 hover:bg-white/10'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${m.type === 'resume' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-[#00D2FF]/20 text-[#00D2FF]'}`}>
                                            <FileText size={18} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[11px] font-black text-white truncate uppercase tracking-tight">{m.name}</p>
                                            <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider mt-0.5">
                                                {m.ownerName} • {m.type === 'resume' ? <AutoTranslatedText text="이력서" /> : <AutoTranslatedText text="참고자료" />}
                                            </p>
                                        </div>
                                        <ChevronRight size={14} className="text-white/20 mt-1" />
                                    </div>
                                </motion.div>
                            ))}

                            {sharedMaterials.length === 0 && (
                                <div className="py-20 text-center">
                                    <p className="text-[10px] text-black/40 font-black uppercase tracking-widest">
                                        <AutoTranslatedText text="공유된 자료가 없습니다" />
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Queue Status Overlay for Waiting Candidates */}
            <AnimatePresence>
                {isAuthorized && currentRole === 'candidate' && localParticipant.status === 'waiting' && currentCandidateId && currentCandidateId !== (socket?.id || 'local') && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="absolute bottom-40 left-1/2 -translate-x-1/2 z-[50] flex flex-col items-center"
                    >
                        <div className="px-10 py-5 bg-white border border-black/10 rounded-[2rem] flex items-center gap-6 shadow-2xl">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 group relative">
                                <Users size={24} className="animate-pulse" />
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                                    <span className="text-[8px] font-black text-white">
                                        {participants.filter(p => p.role === 'candidate' && p.status === 'waiting' && p.joinTime < localParticipant.joinTime).length + 1}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-lg font-black tracking-tight flex items-center gap-2 text-black">
                                    <AutoTranslatedText text="면접 진행 중" /> <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                </h4>
                                <p className="text-xs text-black/40 font-bold uppercase tracking-widest whitespace-nowrap">
                                    <AutoTranslatedText text="준비가 완료되면 면접관이 귀하를 호출할 것입니다. 잠시만 기다려 주십시오." />
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* Resume Viewer Modal */}
            <AnimatePresence>
                {showResumeModal && activeMaterial && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[100] bg-[#F9F9F9] flex flex-col p-12"
                    >
                        <div className="flex justify-between items-center mb-10 text-black">
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black tracking-tighter uppercase text-red-600">
                                    {activeMaterial.type === 'resume' ? <AutoTranslatedText text="면접 자료 확인" /> : <AutoTranslatedText text="참고 자료 확인" />}
                                </h2>
                                <div className="flex items-center gap-3">
                                    <p className="text-[10px] text-black/40 font-bold tracking-[0.3em] uppercase">Document Viewer</p>
                                    <div className="w-1 h-1 rounded-full bg-black/10" />
                                    <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest opacity-80">{activeMaterial.ownerName}</p>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowResumeModal(false)}
                                className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center text-black/40 hover:text-black hover:bg-black/10 transition-all border border-black/10 shadow-sm"
                            >
                                <X size={32} />
                            </motion.button>
                        </div>

                        <div className="flex-1 min-h-0 bg-black/5 rounded-[3rem] border border-black/10 p-4 shadow-2xl relative group overflow-hidden">
                            <img 
                                src={activeMaterial.url} 
                                alt={activeMaterial.name} 
                                className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.1)]" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
                        </div>

                        <div className="mt-8 flex justify-center">
                            <div className="px-8 py-3 bg-black/5 rounded-full border border-black/10 text-[10px] text-black/40 font-black uppercase tracking-widest">
                                                                {activeMaterial.name} - <AutoTranslatedText text="마우스를 굴려 확대/축소할 수 있습니다 (준비 중)" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Entry Token Modal (Meeting Style) */}
            <AnimatePresence>
                {showEntryModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-md p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="w-full max-w-md p-12 bg-white border border-black/10 rounded-[40px] shadow-2xl flex flex-col items-center text-center gap-10 text-black"
                        >
                            <div className="w-24 h-24 bg-red-600/10 rounded-3xl flex items-center justify-center text-red-600 border border-red-600/20 rotate-12">
                                <Lock size={48} className="-rotate-12" />
                            </div>
                            
                            <div className="space-y-3">
                                <h2 className="text-4xl font-black tracking-tight uppercase">
                                    <AutoTranslatedText text="보안 입장" />
                                </h2>
                                <p className="text-black/40 text-sm font-medium leading-relaxed">
                                                                        <AutoTranslatedText text="이 인터뷰 룸은 승인된 지원자만 접근할 수 있습니다." /><br />
                                    <AutoTranslatedText text="초대장에 기재된 고유 토큰을 입력해 주세요." />
                                </p>
                            </div>

                            <form onSubmit={handleTokenSubmit} className="w-full space-y-6">
                                <div className="relative group">
                                    <input 
                                        type="text" 
                                        autoFocus
                                        value={entryToken}
                                        onChange={(e) => setEntryToken(e.target.value)}
                                        placeholder={t('interview.token_placeholder') || "ENTER TOKEN"}
                                        className="w-full h-20 bg-black/5 border border-black/10 rounded-2xl px-8 font-mono tracking-[0.5em] text-center text-2xl text-black focus:outline-none focus:border-red-600 focus:bg-white transition-all placeholder:tracking-normal placeholder:font-sans placeholder:text-black/10"
                                    />
                                    {tokenError && (
                                        <p className="absolute -bottom-6 left-0 right-0 text-red-600 text-[10px] font-black uppercase tracking-widest">{tokenError}</p>
                                    )}
                                </div>

                                <button 
                                    type="submit"
                                    className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase tracking-[0.2em] transition-all hover:bg-red-600 active:scale-95 shadow-xl"
                                >
                                    <AutoTranslatedText text="Enter Interview Room" />
                                </button>
                            </form>
                            
                            <p className="text-[10px] text-black/20 font-bold uppercase tracking-[0.3em] cursor-pointer hover:text-black/40 transition-colors" onClick={() => navigate('/')}>
                                <AutoTranslatedText text="Or return to Home" />
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Invite Token Management Modal */}
            <AnimatePresence>
                {showInviteModal && (
                    <div className="absolute inset-0 z-[160] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-md bg-white border border-black/10 rounded-[2.5rem] p-12 relative shadow-2xl text-black"
                        >
                            <button 
                                onClick={() => setShowInviteModal(false)}
                                className="absolute top-8 right-8 p-3 bg-black/5 hover:bg-black/10 rounded-full transition-colors group flex items-center justify-center text-black/40 hover:text-black"
                            >
                                <X size={20} className="group-active:scale-90 transition-transform" />
                            </button>
                            
                            <div className="flex flex-col items-center text-center gap-10">
                                <div className="w-24 h-24 bg-red-600/10 rounded-3xl flex items-center justify-center rotate-12">
                                    <UserPlus size={48} className="text-red-600 -rotate-12" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-black tracking-tight">
                                        <AutoTranslatedText text="Invite Candidate" />
                                    </h3>
                                    <p className="text-sm text-black/40 font-medium">
                                        <AutoTranslatedText text="A secure invitation link has been generated." />
                                    </p>
                                </div>
                                
                                <div className="w-full bg-black/5 border border-black/10 p-6 rounded-2xl flex flex-col gap-4 group hover:border-red-600/30 transition-colors">
                                    <div className="overflow-hidden">
                                        <span className="text-[10px] uppercase font-black tracking-widest text-black/20 mb-2 block text-left">Secure Invite URL</span>
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-xs font-mono text-red-600 truncate block flex-1 text-left">
                                                {inviteLink}
                                            </span>
                                            <button 
                                                onClick={() => {
                                                    if (inviteLink) {
                                                        navigator.clipboard.writeText(inviteLink)
                                                            .then(async () => {
                                                                const msg = await translateAsync('초대 링크가 복사되었습니다!');
                                                                alert(msg);
                                                            })
                                                            .catch(async () => {
                                                                const msg = await translateAsync('복사에 실패했습니다.');
                                                                alert(msg);
                                                            });
                                                    }
                                                }}
                                                className="px-6 py-3 bg-black text-white rounded-xl text-[10px] font-black transition-all hover:scale-105 active:scale-95 shadow-lg hover:bg-red-600 whitespace-nowrap"
                                            >
                                                <AutoTranslatedText text="COPY LINK" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => setShowInviteModal(false)}
                                    className="w-full py-5 bg-black text-white hover:bg-red-600 font-black rounded-2xl transition-all shadow-md"
                                >
                                    <AutoTranslatedText text="Close" />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ParticipantItem: React.FC<{ participant: Participant; isSelf?: boolean }> = ({ participant, isSelf }) => {
    const statusConfig = {
        'waiting': { label: <AutoTranslatedText text="Waiting" />, color: 'text-white/40', bg: 'bg-white/5' },
        'in-progress': { label: <AutoTranslatedText text="In Progress" />, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
        'completed': { label: <AutoTranslatedText text="Completed" />, color: 'text-white/10', bg: 'bg-white/5 opacity-30' }
    };
    const config = statusConfig[participant.status] || statusConfig['waiting'];

    return (
        <div className={`flex items-center justify-between p-4 bg-black/5 rounded-2xl border border-black/10 transition-all ${participant.status === 'completed' ? 'opacity-40' : ''}`}>
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black" style={{ backgroundColor: participant.color + '20', color: participant.color }}>
                    {participant.name[0]}
                </div>
                <div>
                    <p className="text-xs font-black text-black flex items-center gap-2">
                        {participant.name}
                        {isSelf && <span className="text-[9px] text-red-600 font-medium">(<AutoTranslatedText text="ME" />)</span>}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[9px] text-black/30 font-bold uppercase tracking-wider">{participant.role}</p>
                        <div className={`px-1.5 py-0.5 rounded-full ${config.bg} border border-black/5`}>
                            <span className={`text-[7px] font-black uppercase tracking-widest ${config.color}`}>{config.label}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {participant.isMuted ? <MicOff size={14} className="text-red-600/60" /> : <Mic size={14} className="text-emerald-600/60" />}
                {participant.isVideoOff ? <VideoOff size={14} className="text-black/20" /> : <Video size={14} className="text-emerald-600/60" />}
            </div>
        </div>
    );
};

const ControlBtn: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label?: string }> = ({ active, onClick, icon, label }) => (
    <div className="flex flex-col items-center gap-2">
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                active 
                ? 'bg-black/5 text-black hover:bg-black/10' 
                : 'bg-red-600 text-white shadow-lg'
            }`}
        >
            {icon}
        </motion.button>
        {label && <span className="text-[9px] font-black uppercase tracking-tighter text-black/40">{label}</span>}
    </div>
);

const RoleBtn: React.FC<{ active: boolean; onClick: () => void; label: React.ReactNode }> = ({ active, onClick, label }) => (
    <button
        onClick={onClick}
        className={`px-4 py-3 rounded-xl text-[10px] font-black transition-all ${
            active 
            ? 'bg-red-600 text-white shadow-lg' 
            : 'bg-black/5 text-black/40 hover:bg-black/10'
        }`}
    >
        {label}
    </button>
);

export default VirtualInterviewPage;
