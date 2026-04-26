import { useTranslation } from 'react-i18next';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Users, ArrowLeft, Info, MessageSquare } from 'lucide-react';
import { useImmersiveMode } from '../context/NavigationActionContext';
import { SquareEnvironment } from '../components/gallery/SquareEnvironment';
import { useWebRTCScreenShare } from '../hooks/useWebRTCScreenShare';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';

// Multi-user participation logic
interface Participant {
    id: string;
    name: string;
    position: [number, number, number];
    color: string;
    chatMessage?: string;
    chatTime?: number;
}

const VirtualSquarePage: React.FC = () => {
    useImmersiveMode(true);
    const { id: productId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [localParticipant, setLocalParticipant] = useState<Participant>({
        id: 'local',
        name: `User_${Math.floor(Math.random() * 1000)}`,
        position: [0, 0, 0],
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
    });
    const [chatInput, setChatInput] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // WebRTC for Voice
    const { 
        startCameraShare, 
        stopStream, 
        localStream, 
        remoteStreams 
    } = useWebRTCScreenShare(socket, participants);

    // Socket Initialization
    useEffect(() => {
        const socketInstance = io(window.location.hostname === 'localhost' ? 'http://localhost:3000' : window.location.origin);
        setSocket(socketInstance);

        socketInstance.on('connect', () => {
            console.log('[Square] Connected to Socket Server');
            socketInstance.emit('join-room', {
                roomId: `square-${productId}`,
                user: localParticipant
            });
        });

        socketInstance.on('room-users', (users: Participant[]) => {
            setParticipants(users.filter(u => u.id !== socketInstance.id));
        });

        socketInstance.on('user-moved', (data: { id: string, position: [number, number, number] }) => {
            setParticipants(prev => prev.map(p => p.id === data.id ? { ...p, position: data.position } : p));
        });

        socketInstance.on('chat-message', (data: { id: string, message: string, time: number }) => {
            setParticipants(prev => prev.map(p => p.id === data.id ? { ...p, chatMessage: data.message, chatTime: data.time } : p));
        });

        // Trigger Auto-Mic on mount
        const initMic = async () => {
             const stream = await startCameraShare();
             if (stream) {
                 console.log('[Square] Mic Auto-Enabled');
             }
        };
        initMic();

        return () => {
            socketInstance.disconnect();
            stopStream();
        };
    }, []);

    // Movement sync
    const handleMove = useCallback((newPos: [number, number, number]) => {
        setLocalParticipant(prev => ({ ...prev, position: newPos }));
        socket?.emit('move', { position: newPos });
    }, [socket]);

    const handleSendChat = () => {
        if (!chatInput.trim()) return;
        const chatData = {
            message: chatInput,
            time: Date.now()
        };
        setLocalParticipant(prev => ({ ...prev, chatMessage: chatData.message, chatTime: chatData.time }));
        socket?.emit('chat', chatData);
        setChatInput('');
    };

    const handleToggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = isMuted;
            });
            setIsMuted(!isMuted);
        }
    };

    return (
        <div className="h-screen w-screen bg-black overflow-hidden font-['Inter']">
            {/* 3D Scene */}
            <Canvas shadows className="bg-[#050505]">
                <PerspectiveCamera makeDefault position={[0, 10, 30]} fov={50} />
                <PlayerCamera playerPos={localParticipant.position} />
                
                <React.Suspense fallback={null}>
                    <SquareEnvironment 
                        participants={participants}
                        localParticipant={localParticipant}
                        onMove={handleMove}
                        onNameChange={(name) => setLocalParticipant(prev => ({ ...prev, name }))}
                    />
                </React.Suspense>
            </Canvas>

            {/* UI Overlays */}
            {/* Header */}
            <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start pointer-events-none">
                <div className="flex items-center gap-3 pointer-events-auto">
                    <button 
                        onClick={() => navigate(-1)}
                        title="Back"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="h-12 bg-[#0a0a0a] px-6 rounded-2xl border border-white/5 flex items-center gap-3 shadow-2xl">
                        <div className="w-2.5 h-2.5 bg-[#00FFC2] rounded-full animate-pulse" />
                        <h1 className="text-white text-base font-black tracking-tight leading-none">
                            <AutoTranslatedText text="광화문 광장 (Gwanghwamun Square)" />
                        </h1>
                    </div>
                </div>

                <div className="flex gap-2 pointer-events-auto">
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-4 bg-[#111] hover:bg-white/20 rounded-2xl text-white transition-all border border-white/10 relative"
                    >
                        <Users size={20} />
                        {participants.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#00FFC2] text-black text-[10px] font-black rounded-full flex items-center justify-center">
                                {participants.length}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            {/* Chat Overlay */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 flex gap-3 items-end">
                <div className="flex-1 bg-[#0a0a0a] rounded-3xl border border-white/10 p-2 flex items-center gap-2 shadow-2xl">
                    <div className="pl-4 text-white/40">
                        <MessageSquare size={20} />
                    </div>
                    <input 
                        className="flex-1 bg-transparent border-none outline-none text-white py-3 px-2 text-sm placeholder:text-white/20"
                        placeholder={t('square.chat_placeholder') || t('이곳에 의견을 입력하세요 (바닥을 클릭하면 이동합니다)...')}
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                    />
                    <button 
                        onClick={handleSendChat}
                        className="bg-[#00FFC2] hover:bg-[#00e6af] text-black font-black p-3 rounded-2xl transition-all shadow-[0_0_20px_rgba(0,255,194,0.3)] active:scale-95"
                    >
                        <Send size={18} />
                    </button>
                </div>
                
                <button 
                    onClick={handleToggleMute}
                    className={`p-5 rounded-3xl transition-all shadow-2xl border ${
                        isMuted 
                        ? 'bg-red-500/20 border-red-500/40 text-red-500' 
                        : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
                    }`}
                >
                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>
            </div>

            {/* Sidebar (People List) */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.aside 
                        initial={{ x: 400 }}
                        animate={{ x: 0 }}
                        exit={{ x: 400 }}
                        className="absolute top-0 right-0 w-80 h-full bg-[#0a0a0a] border-l border-white/10 p-8 z-50 shadow-2xl"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-white text-xl font-black"><AutoTranslatedText text="참여자 목록" /></h2>
                            <button onClick={() => setIsSidebarOpen(false)} className="text-white/40 hover:text-white transition-colors">
                                <ArrowLeft size={20} className="rotate-180" />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: localParticipant.color }}>
                                    YOU
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-white font-bold">{localParticipant.name}</span>
                                    <span className="text-white/40 text-xs"><AutoTranslatedText text="나" /></span>
                                </div>
                            </div>
                            
                            {participants.map(p => (
                                <div key={p.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: p.color }}>
                                        {p.name.slice(0, 2)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-white font-bold">{p.name}</span>
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-white/40 text-xs"><AutoTranslatedText text="접속중" /></span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="absolute bottom-10 left-8 right-8 p-6 bg-[#00FFC2]/10 rounded-3xl border border-[#00FFC2]/20">
                            <div className="flex items-center gap-2 mb-2">
                                <Info size={16} className="text-[#00FFC2]" />
                                <span className="text-[#00FFC2] font-black text-xs uppercase tracking-wider"><AutoTranslatedText text="안내" /></span>
                            </div>
                            <p className="text-white/60 text-[11px] leading-relaxed">
                                <AutoTranslatedText text="바닥을 마우스로 클릭하여 원하는 위치로 이동할 수 있습니다. 입력된 대화 내용은 아바타 머리 위에 말풍선으로 표시됩니다." />
                            </p>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Voice Stream Rendering (Hidden) */}
            <div className="hidden">
                {Object.entries(remoteStreams).map(([senderId, stream]) => (
                    <AudioStream key={senderId} stream={stream} />
                ))}
            </div>
        </div>
    );
};

// Subcomponent to render audio stream
const AudioStream = ({ stream }: { stream: MediaStream }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    useEffect(() => {
        if (audioRef.current && stream) {
            audioRef.current.srcObject = stream;
        }
    }, [stream]);
    return <audio ref={audioRef} autoPlay playsInline />;
};

// Custom Player Camera for Drag-to-Look and Smooth Follow
const PlayerCamera = ({ playerPos }: { playerPos: [number, number, number] }) => {
    const { camera, gl } = useThree();
    const [rotation, setRotation] = useState({ yaw: 0, pitch: -0.2 });
    const isDragging = useRef(false);
    const prevMouse = useRef({ x: 0, y: 0 });
    
    // Spring values for smooth camera movement
    const currentPos = useRef(new THREE.Vector3(0, 10, 30));
    const targetOffset = useRef(new THREE.Vector3(0, 8, 20)); // Closer 3rd person view

    useEffect(() => {
        const handleDown = (e: PointerEvent) => {
            isDragging.current = true;
            prevMouse.current = { x: e.clientX, y: e.clientY };
        };
        const handleMove = (e: PointerEvent) => {
            if (!isDragging.current) return;
            const deltaX = e.clientX - prevMouse.current.x;
            const deltaY = e.clientY - prevMouse.current.y;
            
            setRotation(prev => ({
                yaw: prev.yaw - deltaX * 0.005,
                pitch: Math.max(-Math.PI / 2.5, Math.min(Math.PI / 4, prev.pitch - deltaY * 0.005))
            }));
            
            prevMouse.current = { x: e.clientX, y: e.clientY };
        };
        const handleUp = () => {
            isDragging.current = false;
        };

        gl.domElement.addEventListener('pointerdown', handleDown);
        window.addEventListener('pointermove', handleMove);
        window.addEventListener('pointerup', handleUp);
        return () => {
            gl.domElement.removeEventListener('pointerdown', handleDown);
            window.removeEventListener('pointermove', handleMove);
            window.removeEventListener('pointerup', handleUp);
        };
    }, [gl]);

    useFrame((_state, delta) => {
        // 1. Position Interpolation (Follow)
        const targetX = playerPos[0];
        const targetY = playerPos[1] + targetOffset.current.y;
        const targetZ = playerPos[2] + targetOffset.current.z;
        
        currentPos.current.lerp(new THREE.Vector3(targetX, targetY, targetZ), 5 * delta);
        camera.position.copy(currentPos.current);

        // 2. Rotation Application
        const yawQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotation.yaw);
        const pitchQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), rotation.pitch);
        
        camera.quaternion.copy(yawQuat.multiply(pitchQuat));
    });

    return null;
};

export default VirtualSquarePage;
