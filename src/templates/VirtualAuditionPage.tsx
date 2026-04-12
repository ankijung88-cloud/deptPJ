import React, { useState, useEffect, Suspense, useRef } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, 
    Mic, MicOff, Video, VideoOff, LogOut, Settings,
    ChevronRight,
    Upload, X, UserMinus, UserPlus,
    Trophy, Play, Square, FileText, ClipboardList,
    Heart, Award, Sun, Zap, ArrowDown, Lamp,
    SkipForward, Lock
} from 'lucide-react';
import { AuditionStageEnvironment, LightingConfig } from '../components/gallery/AuditionStageEnvironment';
import { Text } from '@react-three/drei';
import { useNavigate, useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { useAdmin } from '../hooks/useAdmin';
import { useWebRTCScreenShare } from '../hooks/useWebRTCScreenShare';
import { useNavigationState, useImmersiveMode } from '../context/NavigationActionContext';
import { useTranslation } from 'react-i18next';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { useAutoTranslate } from '../hooks/useAutoTranslate';

interface Participant {
    id: string;
    name: string;
    seatId: number | null;
    color: string;
    role: 'judge' | 'candidate' | 'audience';
    isMuted: boolean;
    isVideoOff: boolean;
}

interface ScoreState {
    vocal: number;
    dance: number;
    acting: number;
    visual: number;
}

const COLORS = ['#00D2FF', '#FF4757', '#2ECC71', '#F39C12', '#9B59B6', '#FFD32A'];

const VirtualAuditionPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id: roomId } = useParams<{ id: string }>();
    const { translateAsync } = useAutoTranslate('');
    
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(true);
    const [showParticipants, setShowParticipants] = useState(false);
    const [showQueue, setShowQueue] = useState(true);
    const [showScoring, setShowScoring] = useState(false);
    
    // Audition Specific State
    const [queue, setQueue] = useState<Participant[]>([]);
    const [activeCandidateId, setActiveCandidateId] = useState<string | null>(null);
    const [scores, setScores] = useState<ScoreState>({ vocal: 5, dance: 5, acting: 5, visual: 5 });
    const [isRecording, setIsRecording] = useState(false);
    const [materialsUrl, setMaterialsUrl] = useState<string | null>(null);
    const [teleprompterText, setTeleprompterText] = useState('');
    const [showMaterials, setShowMaterials] = useState(false);
    const [lightingConfig, setLightingConfig] = useState<LightingConfig>({
        stage: true,
        ambient: true,
        top: false,
        diagonal: false
    });
    const [stageFocus, setStageFocus] = useState<'candidate' | 'judge'>('candidate');

    // Security & Auth State
    const roomKey = `audition_room_token_${roomId}`;
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [showEntryModal, setShowEntryModal] = useState(false);
    const [entryToken, setEntryToken] = useState('');
    const [tokenError, setTokenError] = useState('');
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteLink, setInviteLink] = useState('');
    
    // Recording Logic
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    
    const { resetUiTimer } = useNavigationState();
    useImmersiveMode(true);
    
    const { isAdmin, isAgency } = useAdmin();
    const role: 'judge' | 'candidate' | 'audience' = isAdmin || isAgency ? 'judge' : 'audience'; // Initial role from user type
    const [currentRole, setCurrentRole] = useState<'judge' | 'candidate' | 'audience'>(role);

    const savedName = localStorage.getItem('audition_user_name');
    const [localParticipant, setLocalParticipant] = useState<Participant>({
        id: 'local',
        name: savedName || 'User_' + Math.floor(Math.random() * 1000),
        seatId: null,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        role: currentRole,
        isMuted: false,
        isVideoOff: false
    });
    
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [screenData, setScreenData] = useState<{ url: string; type: string }>({ url: '', type: 'none' });

    // WebRTC Hook
    const { 
        localStream, 
        remoteStreams, 
        startCameraShare,
        stopStream
    } = useWebRTCScreenShare(socket, participants);

    // Smart Stream Selection: Find the most relevant remote stream
    const activeRemoteStream = activeCandidateId 
        ? remoteStreams[activeCandidateId] 
        : Object.values(remoteStreams)[0];

    const webrtcStreamToPass = ((stageFocus === 'judge' && localParticipant?.role === 'judge') || (activeCandidateId === localParticipant?.id)) 
        ? localStream 
        : activeRemoteStream;

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
        
        const newSocket = io(socketUrl, { transports: ['websocket'] });
        setSocket(newSocket);
        
        newSocket.on('connect', () => {
            const token = sessionStorage.getItem(roomKey);
            newSocket.emit('join-meeting', { 
                roomId: roomId || 'audition-room', 
                name: localParticipant.name,
                isHost: isAdmin || isAgency,
                role: currentRole,
                token: token
            });
        });

        newSocket.on('participants-update', (data: any[]) => {
            const remoteParticipants = data.filter(p => p.id !== newSocket.id);
            setParticipants(remoteParticipants);
        });

        newSocket.on('audition-start', async ({ candidateId }) => {
            setActiveCandidateId(candidateId);
            if (candidateId === newSocket.id) {
                // I am the active candidate!
                const msg = t('audition.start_notice', '당신의 오디션이 시작되었습니다! 무대로 이동합니다.');
                alert(msg);
                setCurrentRole('candidate');
            }
        });

        newSocket.on('materials-update', (url: string) => {
            setMaterialsUrl(url);
        });

        newSocket.on('screen-update', (data: any) => {
            setScreenData(data);
        });

        newSocket.on('teleprompter-update', (text: string) => {
            setTeleprompterText(text);
        });

        newSocket.on('recording-status', (status: boolean) => {
            setIsRecording(status);
        });

        newSocket.on('audition-cheer', ({ candidateId }) => {
            if (activeCandidateId === candidateId) {
                // Trigger a local heart animation or effect
                console.log('[Audition] Cheer received for active candidate!');
            }
        });

        newSocket.on('lighting-update', (config: LightingConfig) => {
            setLightingConfig(config);
        });

        newSocket.on('stage-focus', ({ mode }: { mode: 'candidate' | 'judge' }) => {
            setStageFocus(mode);
        });

        return () => { newSocket.disconnect(); };
    }, [roomId, isAdmin, isAgency, isAuthorized, roomKey]);

    // Handle Role Sync with Socket and Local State
    useEffect(() => {
        if (socket) {
            socket.emit('update-role', { role: currentRole });
        }
        setLocalParticipant(prev => ({ ...prev, role: currentRole }));
    }, [currentRole, socket]);

    // Update Queue when participants or currentRole changes
    useEffect(() => {
        const allCandidates = participants.filter(p => p.role === 'candidate');
        if (currentRole === 'candidate') {
            // Include self in the queue
            setQueue([localParticipant, ...allCandidates]);
        } else {
            setQueue(allCandidates);
        }
    }, [participants, currentRole, localParticipant]);

    // Sync Mute state with local stream tracks
    useEffect(() => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !isMuted;
            });
        }
    }, [isMuted, localStream]);

    const handleSeatSelect = (seatId: number) => {
        setLocalParticipant(prev => ({ ...prev, seatId }));
        if (socket) socket.emit('select-seat', { seatId });
    };

    const handleNameUpdate = (newName: string) => {
        setLocalParticipant(prev => ({ ...prev, name: newName }));
        localStorage.setItem('audition_user_name', newName);
        if (socket) {
            socket.emit('update-name', { name: newName });
        }
    };

    const handleTokenSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!entryToken.trim()) {
            const errorMsg = t('common.token_error', 'Please enter a valid access token.');
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
        
        // Mock token generation matching the interview pattern
        const token = Math.random().toString(36).substring(2, 10);
        const inviteUrl = `${window.location.origin}${window.location.pathname}?invite=${token}`;
        
        if (socket) socket.emit('register-invite-token', { roomId: roomId || 'audition-room', token });
        
        setInviteLink(inviteUrl);
        setShowInviteModal(true);
    };
    const handleScoreChange = (type: keyof ScoreState, val: number) => {
        setScores(prev => ({ ...prev, [type]: val }));
    };

    const handleNextCandidate = () => {
        if (!socket) return;
        
        const currentIndex = queue.findIndex(p => p.id === activeCandidateId);
        const nextCandidate = queue[currentIndex + 1];
        
        if (nextCandidate) {
            socket.emit('audition-start', { candidateId: nextCandidate.id });
        } else if (currentIndex === -1 && queue.length > 0) {
            // No active candidate, start with first one
            socket.emit('audition-start', { candidateId: queue[0].id });
        } else {
            // End of queue
            socket.emit('audition-start', { candidateId: null });
            const msg = t('audition.complete_notice', '모든 대기 참가자의 오디션이 완료되었습니다.');
            alert(msg);
        }
    };

    const submitTotalScore = () => {
        if (socket && activeCandidateId) {
            socket.emit('submit-score', { candidateId: activeCandidateId, scores });
            const msg = t('audition.score_submitted', '채점이 완료되었습니다.');
            alert(msg);
            setShowScoring(false);
        }
    };

    const toggleLight = (key: keyof LightingConfig) => {
        const newConfig = { ...lightingConfig, [key]: !lightingConfig[key] };
        setLightingConfig(newConfig);
        if (socket) {
            socket.emit('lighting-update', newConfig);
        }
    };

    const toggleVideo = async () => {
        const nextVideoOff = !isVideoOff;
        
        if (!nextVideoOff) {
            // Attempt to start camera
            const stream = await startCameraShare();
            if (stream) {
                setIsVideoOff(false);
                if (socket) {
                    socket.emit('share-screen', { type: 'webrtc', url: 'camera' });
                }
            } else {
                // If permission denied or failed, keep UI state "off"
                setIsVideoOff(true);
            }
        } else {
            setIsVideoOff(true);
            stopStream(); // Hook's stopStream handles socket.emit('share-screen', { type: 'none' })
        }
    };

    const handleTakeStage = async () => {
        if (stageFocus === 'judge') {
            // Release stage - Auto return to candidate
            stopStream();
            setIsVideoOff(true);
            setStageFocus('candidate');
            // Update local screenData immediately
            setScreenData({ type: 'none', url: '' });
            
            if (socket) {
                socket.emit('share-screen', { type: 'none', url: '' });
                socket.emit('stage-focus', { mode: 'candidate' });
            }
        } else {
            // Take stage
            const stream = await startCameraShare();
            if (stream) {
                // Golden delay: Wait for hardware to warm up before switching UI focus
                await new Promise(resolve => setTimeout(resolve, 800));
                
                setIsVideoOff(false);
                setStageFocus('judge');
                // Update local screenData immediately for instant feedback
                setScreenData({ type: 'webrtc', url: 'judge-camera' });
                
                if (socket) {
                    socket.emit('share-screen', { type: 'webrtc', url: 'judge-camera' });
                    socket.emit('stage-focus', { mode: 'judge' });
                }
            }
        }
    };


    // Recording Functions
    const startRecording = async () => {
        if (!webrtcStreamToPass && !localStream) {
            const msg = t('audition.no_stream', '녹화할 스트림이 없습니다.');
            alert(msg);
            return;
        }
        const stream = (currentRole === 'candidate' ? localStream : webrtcStreamToPass);
        if (!stream) return;

        recordedChunksRef.current = [];
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        
        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) recordedChunksRef.current.push(e.data);
        };
        
        recorder.onstop = () => {
            const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `audition_record_${Date.now()}.webm`;
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
        };

        recorder.start();
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
        if (socket) socket.emit('recording-status', { roomId: roomId || 'audition-room', isRecording: true });
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (socket) socket.emit('recording-status', { roomId: roomId || 'audition-room', isRecording: false });
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.url) {
                setMaterialsUrl(data.url);
                if (socket) socket.emit('share-materials', { url: data.url });
            }
        } catch (err) {
            console.error('Upload failed', err);
        }
    };

    return (
        <ErrorBoundary>
            <div 
                className="relative w-full h-screen bg-[#050505] overflow-hidden text-white font-sans selection:bg-[#FFD700] selection:text-black"
                onMouseMove={resetUiTimer}
                onMouseDown={resetUiTimer}
                onKeyDown={resetUiTimer}
                onTouchStart={resetUiTimer}
            >
                {/* 3D Scene Layer */}
                <div className="absolute inset-0 z-0" onMouseMove={resetUiTimer} onMouseDown={resetUiTimer}>
                    <Canvas 
                        shadows 
                        gl={{ antialias: true, alpha: true }}
                        onCreated={({ gl, scene }) => {
                            gl.setClearColor('#050505');
                            scene.fog = new THREE.FogExp2('#050505', 0.01);
                        }}
                        onPointerMove={resetUiTimer}
                        onPointerDown={resetUiTimer}
                    >
                        <Suspense fallback={<Text position={[0, 1.5, -5]} color="white" fontSize={0.5}>
                            {t('common.loading_content')}
                        </Text>}>
                            <AuditionStageEnvironment 
                                participants={participants as any}
                                localParticipant={localParticipant as any}
                                onSeatSelect={handleSeatSelect}
                                onNameChange={handleNameUpdate}
                                activeCandidateId={activeCandidateId}
                                screenData={screenData}
                                webrtcStream={webrtcStreamToPass}
                                materialsUrl={materialsUrl}
                                lightingConfig={lightingConfig}
                            />
                        </Suspense>
                    </Canvas>
                </div>

                {/* HUD Header */}
                <AnimatePresence>
                    {(
                        <motion.header 
                            initial={{ y: -100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -100, opacity: 0 }}
                            className="absolute top-0 inset-x-0 z-10 p-8 flex justify-between items-start pointer-events-none"
                        >
                            <>
                                <div className="flex flex-col gap-4 items-start pointer-events-auto max-w-[50%]">
                                    <div className="flex items-center gap-4">
                                        <motion.div 
                                            className="p-3 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl hover:bg-[#FF4757]/20 transition-all cursor-pointer"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => navigate(-1)}
                                        >
                                            <LogOut size={20} className="text-white" />
                                        </motion.div>

                                        <div className="text-left flex flex-col gap-1">
                                            <h1 className="text-2xl font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/40">
                                                <AutoTranslatedText text={t('audition.title')} />
                                            </h1>
                                            <div className="flex items-center justify-start gap-2 text-yellow-500">
                                                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse shadow-[0_0_10px_#FFD700]" />
                                                <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-60">
                                                    <AutoTranslatedText text={t('audition.live_session', 'Live Audition Session')} />
                                                </span>
                                            </div>
                                        </div>

                                        {isRecording && (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="px-4 py-2 bg-[#FF4757] rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(255,71,87,0.4)]"
                                            >
                                                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white">
                                                    {t('common.recording', 'RECORDING')}
                                                </span>
                                            </motion.div>
                                        )}

                                        {screenData.type === 'webrtc' && screenData.url === 'judge-camera' && (
                                            <motion.div 
                                                initial={{ x: 20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                className="px-4 py-2 bg-[#FFD700] text-black rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(255,215,0,0.4)]"
                                            >
                                                <Video size={14} fill="black" className="animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{t('audition.judge_on_screen')}</span>
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Self Monitor removed for clean view */}
                                </div>

                                <div className="flex items-center justify-end gap-6 pointer-events-auto">
                                    <div className="flex bg-black/40 backdrop-blur-3xl p-1 rounded-2xl border border-white/10">
                                        {(['judge', 'candidate', 'audience'] as const).map(r => (
                                            <button 
                                                key={r}
                                                onClick={() => setCurrentRole(r)}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentRole === r ? 'bg-[#FFD700] text-black shadow-lg shadow-[#FFD700]/20' : 'text-white/40 hover:text-white'}`}
                                            >
                                                {t(`audition.${r}`)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        </motion.header>
                    )}
                </AnimatePresence>

                {/* Left Queue Sidebar */}
                <AnimatePresence>
                    {showQueue && (
                        <motion.aside 
                            initial={{ x: -300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            className="absolute left-8 top-32 bottom-32 w-72 z-20 flex flex-col gap-6 pointer-events-none"
                        >
                            <div className="pointer-events-auto bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 flex flex-col gap-6 shadow-2xl overflow-hidden">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ClipboardList size={18} className="text-[#FFD700]" />
                                        <h3 className="text-sm font-black uppercase tracking-widest">{t('audition.queue')}</h3>
                                    </div>
                                    <span className="bg-white/10 px-2 py-1 rounded text-[10px] font-black">{queue.length}</span>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                    {queue.length === 0 ? (
                                        <p className="text-center text-white/50 text-xs py-4">
                                            {t('audition.waiting_candidates', 'Waiting for candidates...')}
                                        </p>
                                    ) : (
                                        queue.map((p, idx) => (
                                            <motion.div 
                                                key={p.id}
                                                layout
                                                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${activeCandidateId === p.id ? 'bg-[#FFD700]/10 border-[#FFD700] shadow-[0_0_15px_#FFD70022]' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black opacity-30">#0{idx + 1}</span>
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-black font-black text-[10px]" style={{ backgroundColor: p.color }}>
                                                        {p.name[0].toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold tracking-tight">{p.name}</span>
                                                        {activeCandidateId === p.id && <span className="text-[9px] text-[#FFD700] font-black uppercase tracking-widest animate-pulse">{t('audition.performing')}</span>}
                                                    </div>
                                                </div>
                                                {currentRole === 'judge' && (
                                                    <button 
                                                        onClick={() => {
                                                            if (socket) socket.emit('audition-start', { candidateId: p.id });
                                                        }}
                                                        className="p-2 bg-[#FFD700] hover:bg-[#FFD700]/80 text-black rounded-lg transition-all"
                                                    >
                                                        <Play size={12} fill="currentColor" />
                                                    </button>
                                                )}
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                                <div className="p-1 space-y-2">
                                    {currentRole === 'judge' && (
                                        <>
                                            <button 
                                                className="w-full py-4 bg-[#FFD700] hover:bg-[#FFD700]/80 text-black rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-lg flex items-center justify-center gap-3 group"
                                                onClick={handleNextCandidate}
                                            >
                                                {activeCandidateId ? (
                                                    <>
                                                        <span>{t('audition.next_candidate', 'Next Candidate')}</span>
                                                        <SkipForward size={14} fill="black" />
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>{t('audition.start_audition', 'Start Audition')}</span>
                                                        <Play size={14} fill="black" />
                                                    </>
                                                )}
                                            </button>
                                            
                                            <button 
                                                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                                                onClick={() => setShowScoring(!showScoring)}
                                            >
                                                {showScoring ? t('audition.close_evaluation', 'Close Evaluation') : t('audition.judge_evaluation', 'Judge Evaluation')}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Right Judge / Materials Panel */}
                <AnimatePresence>
                    {currentRole === 'judge' && (
                        <motion.aside 
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 300, opacity: 0 }}
                            className="absolute right-6 top-24 bottom-10 w-72 z-20 flex flex-col gap-2 pointer-events-none"
                        >
                            {/* Evaluation Panel */}
                            <motion.div 
                                className="pointer-events-auto bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 flex flex-col gap-4 shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-2 opacity-5">
                                    <Trophy size={40} />
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <Award size={16} className="text-[#FF4757]" />
                                    <h3 className="text-[11px] font-black uppercase tracking-widest">
                                        {t('audition.grading_tool')}
                                    </h3>
                                </div>

                                <div className="space-y-2.5">
                                    {(['vocal', 'dance', 'acting', 'visual'] as const).map(type => (
                                        <div key={type} className="flex flex-col gap-1">
                                            <div className="flex justify-between items-center px-1">
                                                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                                                    {t(`audition.score.${type}`, type.toUpperCase())}
                                                </span>
                                                <span className="text-xs font-black text-[#FFD700]">{scores[type]}<span className="text-[9px] opacity-30 ml-0.5">/ 10</span></span>
                                            </div>
                                            <input 
                                                type="range" min="1" max="10" step="1"
                                                value={scores[type]}
                                                onChange={(e) => handleScoreChange(type, parseInt(e.target.value))}
                                                className="w-full h-0.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#FFD700]"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="p-2 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-xl flex justify-between items-center mt-1">
                                    <span className="text-[9px] font-black uppercase tracking-wider text-[#FFD700]">{t('audition.score.total')}</span>
                                    <span className="text-lg font-black text-white">{scores.vocal + scores.dance + scores.acting + scores.visual} <span className="text-[9px] opacity-30">/ 40</span></span>
                                </div>

                                <button 
                                    onClick={submitTotalScore}
                                    disabled={!activeCandidateId}
                                    className="w-full py-2.5 bg-[#FFD700] hover:bg-[#FFD700]/80 disabled:opacity-30 disabled:cursor-not-allowed text-black font-black rounded-lg text-[10px] uppercase tracking-widest transition-all shadow-lg"
                                >
                                    {t('audition.score.submit')}
                                </button>
                            </motion.div>

                            {/* Materials & Record Panel */}
                            <div className="pointer-events-auto bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-4 flex flex-col gap-2 shadow-xl">
                                <div className="flex items-center gap-2 mb-1">
                                    <Settings size={14} className="text-white/40" />
                                    <h4 className="text-[9px] font-black uppercase tracking-widest text-white/40">
                                        {t('audition.tool_box')}
                                    </h4>
                                </div>
                                
                                <button 
                                    onClick={isRecording ? stopRecording : startRecording}
                                    className={`w-full py-3 flex items-center justify-center gap-2 rounded-xl border transition-all ${isRecording ? 'bg-[#FF4757] border-[#FF4757] shadow-lg' : 'bg-white/5 border-white/10 hover:border-[#FF4757]/40 ring-0 hover:ring-2 hover:ring-[#FF4757]/20'}`}
                                >
                                    {isRecording ? <Square size={14} fill="white" /> : <div className="w-3 h-3 rounded-full bg-[#FF4757] animate-pulse" />}
                                    <span className="text-[9px] font-black uppercase tracking-widest">{isRecording ? t('audition.record.stop') : t('audition.record.start')}</span>
                                </button>

                                {/* Lighting Controls (Judge Only) */}
                                <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex flex-col gap-2">
                                    <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                        <div className="w-1 h-3 bg-[#FFD700] rounded-full" />
                                        <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-[#FFD700]">
                                            {t('common.lighting')}
                                        </h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button 
                                            onClick={() => toggleLight('stage')}
                                            className={`py-2 px-1 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${lightingConfig.stage ? 'bg-[#FFD700]/20 border-[#FFD700]/40 text-[#FFD700]' : 'bg-white/5 border-white/10 opacity-40 grayscale'}`}
                                        >
                                            <Lamp size={14} />
                                            <span className="text-[10px] font-bold mt-1">
                                                {t('audition.stage', 'Stage')}
                                            </span>
                                        </button>
                                        <button 
                                            onClick={() => toggleLight('ambient')}
                                            className={`py-2 px-1 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${lightingConfig.ambient ? 'bg-[#00D2FF]/20 border-[#00D2FF]/40 text-[#00D2FF]' : 'bg-white/5 border-white/10 opacity-40 grayscale'}`}
                                        >
                                            <Sun size={14} />
                                            <span className="text-[10px] font-bold mt-1">
                                                {t('audition.ambient', 'Ambient')}
                                            </span>
                                        </button>
                                        <button 
                                            onClick={() => toggleLight('top')}
                                            className={`py-2 px-1 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${lightingConfig.top ? 'bg-white/20 border-white/40 text-white' : 'bg-white/5 border-white/10 opacity-40 grayscale'}`}
                                        >
                                            <ArrowDown size={14} />
                                            <span className="text-[10px] font-bold mt-1">
                                                {t('audition.top_down', 'Top-Down')}
                                            </span>
                                        </button>
                                        <button 
                                            onClick={() => toggleLight('diagonal')}
                                            className={`py-2 px-1 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${lightingConfig.diagonal ? 'bg-[#FF4757]/20 border-[#FF4757]/40 text-[#FF4757]' : 'bg-white/5 border-white/10 opacity-40 grayscale'}`}
                                        >
                                            <Zap size={14} />
                                            <span className="text-[10px] font-bold mt-1">
                                                {t('audition.diagonal', 'Diagonal')}
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={() => setShowMaterials(true)}
                                        className="py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex flex-col items-center gap-1.5 group transition-all"
                                    >
                                        <FileText size={14} className="group-hover:text-[#00D2FF]" />
                                        <span className="text-[8px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100">{t('audition.materials.title')}</span>
                                    </button>
                                    <button 
                                        onClick={() => setShowParticipants(!showParticipants)}
                                        className="py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex flex-col items-center gap-1.5 group transition-all"
                                    >
                                        <Users size={14} className="group-hover:text-[#00FF88]" />
                                        <span className="text-[8px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100">
                                            {t('common.participants')}
                                        </span>
                                    </button>
                                </div>

                                {/* NEW: Judge Take Stage / Toggle Toggle Button */}
                                <button
                                    onClick={handleTakeStage}
                                    className={`w-full py-4 rounded-2xl border flex items-center justify-center gap-3 transition-all ${
                                        stageFocus === 'judge'
                                            ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black border-none shadow-[0_0_20px_rgba(255,215,0,0.4)] scale-[1.02]'
                                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#FFD700]/40'
                                    }`}
                                >
                                    <Video size={16} fill={stageFocus === 'judge' ? "black" : "none"} />
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                                            {stageFocus === 'judge' 
                                                ? t('audition.release_stage') 
                                                : t('audition.take_stage')}
                                        </span>
                                        {stageFocus === 'judge' && (
                                            <span className="text-[8px] font-bold opacity-60 uppercase tracking-widest mt-0.5">
                                                <AutoTranslatedText text="Focus: Judge" />
                                            </span>
                                        )}
                                    </div>
                                </button>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Candidate Specific (Teleprompter) */}
                <AnimatePresence>
                    {currentRole === 'candidate' && (
                        <motion.div 
                            initial={{ y: 200, x: '-50%', opacity: 0 }}
                            animate={{ 
                                y: 0, 
                                x: '-50%',
                                opacity: 1
                            }}
                            exit={{ y: 200, x: '-50%', opacity: 0 }}
                            className="absolute bottom-32 left-1/2 -translate-x-1/2 w-full max-w-2xl px-8 z-30"
                        >
                            <div className="bg-black/60 backdrop-blur-3xl border border-[#FFD700]/30 rounded-3xl p-8 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] flex flex-col gap-6">
                                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-[#FFD700]/10 rounded-full flex items-center justify-center text-[#FFD700]">
                                            <FileText size={16} />
                                        </div>
                                        <h4 className="text-xs font-black uppercase tracking-widest text-[#FFD700]">{t('audition.teleprompter')}</h4>
                                    </div>
                                    <span className="text-[10px] bg-white/10 px-2 py-1 rounded font-mono opacity-50">PROMPTER v1.0</span>
                                </div>
                                <div className="h-48 overflow-y-auto pr-4 custom-scrollbar-gold">
                                    {teleprompterText ? (
                                        <p className="text-2xl font-black text-white leading-relaxed tracking-tight text-center">
                                            {teleprompterText}
                                        </p>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center gap-4 opacity-20">
                                            <ClipboardList size={40} />
                                            <p className="text-xs font-bold uppercase tracking-[0.2em] italic">
                                                <AutoTranslatedText text="Waiting for script from Judge..." />
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${isMuted ? 'bg-[#FF4757]' : 'bg-[#00FF88] shadow-[0_0_10px_#00FF88]'}`} />
                                            <span className="text-[9px] font-black uppercase tracking-widest opacity-40">
                                                {isMuted ? <AutoTranslatedText text="Muted" /> : <AutoTranslatedText text="Mic Live" />}
                                            </span>
                                        </div>
                                    </div>
                                    {activeCandidateId === socket?.id && (
                                        <div className="bg-[#FFD700] text-black px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest animate-pulse">
                                            <AutoTranslatedText text="On Stage Now" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bottom Center Control Bar (Universal) */}
                <AnimatePresence>
                    {(
                        <motion.footer 
                            initial={{ y: 100, x: '-50%', opacity: 0 }}
                            animate={{ y: 0, x: '-50%', opacity: 1 }}
                            exit={{ y: 100, x: '-50%', opacity: 0 }}
                            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4"
                        >
                            <div className="flex items-center gap-3 px-6 py-4 bg-white/5 backdrop-blur-3xl rounded-3xl border border-white/10 shadow-2xl pointer-events-auto">
                                <button 
                                    onClick={() => setIsMuted(!isMuted)}
                                    className={`p-3 rounded-xl transition-all ${isMuted ? 'bg-[#FF4757] text-white shadow-lg shadow-[#FF4757]/20' : 'bg-white/5 hover:bg-white/10'}`}
                                >
                                    {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                                </button>
                                <button 
                                    onClick={toggleVideo}
                                    className={`p-3 rounded-xl transition-all ${isVideoOff ? 'bg-[#FF4757] text-white shadow-lg shadow-[#FF4757]/20' : 'bg-white/5 hover:bg-white/10'}`}
                                >
                                    {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                                </button>
                                <div className="w-[1px] h-6 bg-white/10 mx-2" />
                                <button onClick={() => setShowParticipants(!showParticipants)} className={`p-3 rounded-xl transition-all ${showParticipants ? 'bg-[#00D2FF] text-black' : 'bg-white/5 hover:bg-white/10'}`}>
                                    <Users size={20} />
                                </button>
                                {(isAdmin || isAgency) && (
                                    <button 
                                        onClick={handleGenerateInvite}
                                        className="p-3 bg-[#FFD700] hover:bg-[#FFD700]/80 text-black rounded-xl transition-all shadow-lg shadow-[#FFD700]/20"
                                    >
                                        <UserPlus size={20} />
                                    </button>
                                )}
                                <button onClick={() => setShowQueue(!showQueue)} className={`p-3 rounded-xl transition-all ${showQueue ? 'bg-[#FFD700] text-black' : 'bg-white/5 hover:bg-white/10'}`}>
                                    <ClipboardList size={20} />
                                </button>
                                {currentRole === 'audience' && (
                                    <button 
                                        className="p-3 bg-gradient-to-br from-[#FF4757] to-[#FF8C61] text-white rounded-xl shadow-lg shadow-[#FF4757]/30 group active:scale-95 transition-all"
                                        onClick={() => {
                                            if (socket) socket.emit('audition-cheer', { candidateId: activeCandidateId });
                                        }}
                                    >
                                        <Heart size={20} className="group-hover:fill-white group-hover:scale-110 transition-all" />
                                    </button>
                                )}
                            </div>
                        </motion.footer>
                    )}
                </AnimatePresence>

                {/* Materials Uploader Modal */}
                <AnimatePresence>
                    {showMaterials && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-10 relative"
                            >
                                <button onClick={() => setShowMaterials(false)} className="absolute top-8 right-8 p-3 hover:bg-white/5 rounded-full"><X size={20} /></button>
                                <div className="flex flex-col gap-8">
                                    <div className="text-center">
                                        <h3 className="text-3xl font-black mb-2 uppercase tracking-tight">{t('audition.materials.title')}</h3>
                                        <p className="text-white/40 text-xs font-black tracking-widest uppercase">
                                            <AutoTranslatedText text="Upload scripts or visual materials" />
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="w-full h-48 border-2 border-dashed border-white/10 hover:border-[#FFD700]/50 bg-white/5 rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer group transition-all">
                                            <div className="p-4 bg-[#FFD700]/10 rounded-full text-[#FFD700] group-hover:scale-110 transition-transform">
                                                <Upload size={32} />
                                            </div>
                                            <div className="text-center capitalize">
                                                <p className="text-sm font-bold">{t('audition.materials.attachment')}</p>
                                                <p className="text-[10px] opacity-30 mt-1">
                                                    <AutoTranslatedText text="PDF, Image or Docs supported" />
                                                </p>
                                            </div>
                                            <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf" />
                                        </label>
                                        <div className="flex flex-col gap-4">
                                            <p className="text-[9px] font-black uppercase tracking-widest opacity-20 text-center">
                                                <AutoTranslatedText text="Script Text (Direct Input)" />
                                            </p>
                                            <textarea 
                                                value={teleprompterText}
                                                onChange={(e) => setTeleprompterText(e.target.value)}
                                                placeholder={t('audition.materials.placeholder') || "Type script here to display on Candidate's teleprompter..."}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-medium outline-none h-32 focus:border-[#FFD700]/50 transition-all font-sans"
                                            />
                                        </div>
                                        <button 
                                            onClick={async () => {
                                                if (socket && teleprompterText) {
                                                    socket.emit('share-teleprompter', { roomId: roomId || 'audition-room', text: teleprompterText });
                                                    const msg = await translateAsync('대본이 전송되었습니다.');
                                                    alert(msg);
                                                }
                                                setShowMaterials(false);
                                            }}
                                            className="w-full py-5 bg-[#FFD700] text-black font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl"
                                        >
                                            {t('audition.materials.share')}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Participant Overlay List */}
                <AnimatePresence>
                    {showParticipants && (
                        <motion.div 
                            initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
                            className="absolute right-0 top-0 bottom-0 w-80 z-30 bg-black/40 backdrop-blur-3xl border-l border-white/10 p-10 flex flex-col gap-10"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-black italic tracking-tighter">
                                    <AutoTranslatedText text="PARTICIPANTS" />
                                </h3>
                                <button onClick={() => setShowParticipants(false)} className="p-2 hover:bg-white/10 rounded-lg"><ChevronRight size={24} /></button>
                            </div>
                            <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                                <div className="flex items-center justify-between p-4 rounded-3xl bg-[#FFD700]/10 border border-[#FFD700]/30 relative overflow-hidden group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-black font-black" style={{ backgroundColor: localParticipant.color }}>{localParticipant.name[0]}</div>
                                        <div>
                                            <p className="font-bold text-sm tracking-tight">{localParticipant.name} (<AutoTranslatedText text="You" />)</p>
                                            <p className="text-[10px] uppercase tracking-widest text-[#FFD700]">{t(`audition.${currentRole}`)}</p>
                                        </div>
                                    </div>
                                </div>
                                {participants.map(p => (
                                    <div key={p.id} className="flex items-center justify-between p-4 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-black font-black" style={{ backgroundColor: p.color }}>{p.name[0]}</div>
                                            <div>
                                                <p className="font-bold text-sm tracking-tight">{p.name}</p>
                                                <p className="text-[10px] uppercase opacity-30 tracking-widest">{t(`audition.${p.role || 'audience'}`)}</p>
                                            </div>
                                        </div>
                                        {(isAdmin || isAgency) && (
                                            <button onClick={() => socket?.emit('kick-participant', { participantId: p.id })} className="p-2 hover:bg-[#FF4757]/20 text-[#FF4757] rounded-lg transition-all"><UserMinus size={16} /></button>
                                        )}
                                    </div>
                                ))}
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
                            className="absolute inset-0 z-[150] flex items-center justify-center bg-[#050505]/80 backdrop-blur-3xl p-6"
                        >
                            <motion.div 
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                className="w-full max-w-md p-12 bg-white/5 border border-white/10 rounded-[40px] shadow-2xl backdrop-blur-xl flex flex-col items-center text-center gap-10"
                            >
                                <div className="w-24 h-24 bg-yellow-500/10 rounded-3xl flex items-center justify-center text-yellow-400 border border-yellow-500/20 rotate-12">
                                    <Lock size={48} className="-rotate-12" />
                                </div>
                                
                                <div className="space-y-3">
                                    <h2 className="text-4xl font-black tracking-tight uppercase text-white">
                                        <AutoTranslatedText text="Secure Access" />
                                    </h2>
                                    <p className="text-white/40 text-sm font-medium leading-relaxed">
                                        <AutoTranslatedText text="This audition room is restricted to invited candidates." /><br />
                                        <AutoTranslatedText text="Please enter your unique invitation token." />
                                    </p>
                                </div>

                                <form onSubmit={handleTokenSubmit} className="w-full space-y-6">
                                    <div className="relative group">
                                        <input 
                                            type="text" 
                                            autoFocus
                                            value={entryToken}
                                            onChange={(e) => setEntryToken(e.target.value)}
                                            placeholder={t('audition.entry.token_placeholder') || "ENTER TOKEN"}
                                            className="w-full h-20 bg-white/5 border border-white/10 rounded-2xl px-8 font-mono tracking-[0.5em] text-center text-2xl text-white focus:outline-none focus:border-yellow-500/50 focus:bg-white/10 transition-all placeholder:tracking-normal placeholder:font-sans placeholder:text-white/10"
                                        />
                                        {tokenError && (
                                            <p className="absolute -bottom-6 left-0 right-0 text-[#FF4757] text-[10px] font-black uppercase tracking-widest">{tokenError}</p>
                                        )}
                                    </div>

                                    <button 
                                        type="submit"
                                        className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] transition-all hover:bg-yellow-500 hover:text-white active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                                    >
                                        <AutoTranslatedText text="Enter Audition Room" />
                                    </button>
                                </form>
                                
                                <p className="text-[10px] text-white/20 font-bold uppercase tracking-[0.3em] cursor-pointer hover:text-white/40 transition-colors" onClick={() => navigate('/')}>
                                    <AutoTranslatedText text="Or return to Home" />
                                </p>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Invite Token Management Modal */}
                <AnimatePresence>
                    {showInviteModal && (
                        <div className="absolute inset-0 z-[160] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-12 relative shadow-[0_50px_100px_-20px_rgba(0,0,0,1)]"
                            >
                                <button 
                                    onClick={() => setShowInviteModal(false)}
                                    className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors group flex items-center justify-center text-white/40 hover:text-white"
                                >
                                    <X size={20} className="group-active:scale-90 transition-transform" />
                                </button>
                                
                                <div className="flex flex-col items-center text-center gap-10">
                                    <div className="w-24 h-24 bg-yellow-500/10 rounded-3xl flex items-center justify-center rotate-12">
                                        <UserPlus size={48} className="text-yellow-500 -rotate-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-black tracking-tight text-white">
                                            <AutoTranslatedText text="Invite Candidate" />
                                        </h3>
                                        <p className="text-sm text-white/40 font-medium">
                                            <AutoTranslatedText text="A secure invitation link has been generated." />
                                        </p>
                                    </div>
                                    
                                    <div className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col gap-4 group hover:border-yellow-500/30 transition-colors">
                                        <div className="overflow-hidden">
                                            <span className="text-[10px] uppercase font-black tracking-widest text-white/20 mb-2 block text-left">Secure Invite URL</span>
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="text-xs font-mono text-yellow-500 truncate block flex-1 text-left">
                                                    {inviteLink}
                                                </span>
                                                <button 
                                                    onClick={async () => {
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
                                                    className="px-6 py-3 bg-yellow-500 text-black rounded-xl text-[10px] font-black transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,215,0,0.3)] whitespace-nowrap"
                                                >
                                                    <AutoTranslatedText text="COPY LINK" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => setShowInviteModal(false)}
                                        className="w-full py-5 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl transition-all border border-white/5"
                                    >
                                        <AutoTranslatedText text="Close" />
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
                .custom-scrollbar-gold::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar-gold::-webkit-scrollbar-track { background: rgba(255,215,0,0.05); }
                .custom-scrollbar-gold::-webkit-scrollbar-thumb { background: rgba(255,215,0,0.5); border-radius: 10px; }
            `}</style>
        </ErrorBoundary>
    );
};

export default VirtualAuditionPage;
