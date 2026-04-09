import React, { useState, useMemo, Suspense, useEffect } from 'react';
import { 
    OrbitControls, 
    PerspectiveCamera, 
    ContactShadows, 
    Preload,
    Environment,
    useTexture,
    Float,
    Stars,
    Text
} from '@react-three/drei';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { AvatarModel } from './AvatarModel';

interface Participant {
    id: string;
    name: string;
    seatId: number | null;
    color: string;
    role: 'judge' | 'candidate' | 'audience';
    isPerforming?: boolean;
}

export interface LightingConfig {
    stage: boolean;
    ambient: boolean;
    top: boolean;
    diagonal: boolean;
}

interface AuditionStageEnvironmentProps {
    participants: Participant[];
    localParticipant: Participant;
    onSeatSelect: (seatId: number) => void;
    activeCandidateId?: string | null;
    screenData?: { url: string; type: string };
    webrtcStream?: MediaStream | null;
    materialsUrl?: string | null;
    lightingConfig?: LightingConfig;
    onNameChange?: (newName: string) => void;
}

const STAGE_SEATS = [
    { id: 0, position: [-2, 0, 2] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], label: 'Judge 1' },
    { id: 1, position: [0, 0, 2] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], label: 'Judge 2' },
    { id: 2, position: [2, 0, 2] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], label: 'Judge 3' },
    { id: 3, position: [-3, 0.3, 5] as [number, number, number], rotation: [0, 0, 0] as [number, number, number] },
    { id: 4, position: [-1, 0.3, 5] as [number, number, number], rotation: [0, 0, 0] as [number, number, number] },
    { id: 5, position: [1, 0.3, 5] as [number, number, number], rotation: [0, 0, 0] as [number, number, number] },
    { id: 6, position: [3, 0.3, 5] as [number, number, number], rotation: [0, 0, 0] as [number, number, number] },
    { id: 7, position: [-2.5, 0.6, 7] as [number, number, number], rotation: [0, 0, 0] as [number, number, number] },
    { id: 8, position: [0, 0.6, 7] as [number, number, number], rotation: [0, 0, 0] as [number, number, number] },
    { id: 9, position: [2.5, 0.6, 7] as [number, number, number], rotation: [0, 0, 0] as [number, number, number] },
];

const CANDIDATE_STAGE_POS = [0, 0.5, -5] as [number, number, number];

const ScreenImageContent: React.FC<{ url: string }> = ({ url }) => {
    const texture = useTexture(url || '');
    return <meshBasicMaterial map={texture} toneMapped={false} />;
};

const ScreenContent: React.FC<{ screenData?: { url: string; type: string }; webrtcStream?: MediaStream | null }> = ({ screenData, webrtcStream }) => {
    const video = useMemo(() => {
        const v = document.createElement('video');
        v.autoplay = true;
        v.playsInline = true;
        v.muted = true;
        v.style.position = 'fixed';
        v.style.top = '-100px';
        v.style.width = '2px';
        v.style.height = '2px';
        v.style.opacity = '0.1'; // Minimal visibility to keep hardware active
        v.style.pointerEvents = 'none';
        v.id = 'stage-video-source';
        document.body.appendChild(v);
        return v;
    }, []);

    const [texture, setTexture] = useState<THREE.VideoTexture | null>(null);

    // Synchronize Stream to Vanilla Video Element
    useEffect(() => {
        if (!webrtcStream || !video) return;

        if (video.srcObject !== webrtcStream) {
            video.srcObject = webrtcStream;
            video.play().catch(err => console.warn('[WebRTC] Vanilla play failed:', err));
            
            const vt = new THREE.VideoTexture(video);
            vt.colorSpace = THREE.SRGBColorSpace;
            vt.repeat.set(-1, 1);
            vt.offset.set(1, 0);
            setTexture(vt);
        }

        return () => {
            if (video) {
                video.pause();
                video.srcObject = null;
            }
        };
    }, [webrtcStream, video]);

    // Cleanup video element on unmount
    useEffect(() => {
        return () => {
            if (video && video.parentNode) {
                video.parentNode.removeChild(video);
            }
        };
    }, [video]);

    useFrame(() => {
        if (texture && video.readyState >= 2) {
            texture.needsUpdate = true;
        }
    });

    if (!screenData || screenData.type === 'none') {
        return (
            <group position={[0, 0, 0.03]}>
                <mesh><planeGeometry args={[10.0, 5.6]} /><meshBasicMaterial color="#000" /></mesh>
                <Text position={[0, 0, 0.01]} fontSize={0.6} color="#FFD700" fillOpacity={0.3}>AUDITION STAGE</Text>
            </group>
        );
    }

    return (
        <group position={[0, 0, 0.1]}>
            <mesh>
                <planeGeometry args={[10.0, 5.6]} />
                {screenData.type === 'image' && screenData.url ? (
                    <Suspense fallback={<meshBasicMaterial color="#000" />}>
                        <ScreenImageContent url={screenData.url} />
                    </Suspense>
                ) : (
                    texture ? <meshBasicMaterial map={texture} toneMapped={false} /> : <meshBasicMaterial color="#050505" />
                )}
            </mesh>
        </group>
    );
};

export const AuditionStageEnvironment: React.FC<AuditionStageEnvironmentProps> = ({
    participants,
    localParticipant,
    onSeatSelect,
    activeCandidateId,
    screenData,
    webrtcStream,
    materialsUrl,
    lightingConfig = { stage: true, ambient: true, top: false, diagonal: false },
    onNameChange
}) => {
    const [hoveredSeat, setHoveredSeat] = useState<number | null>(null);

    const activeCandidate = useMemo(() => 
        participants.find(p => p.id === activeCandidateId) || (localParticipant.id === activeCandidateId ? localParticipant : null)
    , [participants, localParticipant, activeCandidateId]);

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 5, 12]} fov={50} />
            <OrbitControls 
                enableDamping 
                dampingFactor={0.05} 
                target={[0, 1.5, -2]} 
                maxPolarAngle={Math.PI / 2.1}
                minPolarAngle={Math.PI / 12}
                minDistance={3}
                maxDistance={15}
            />

            <ambientLight intensity={lightingConfig.ambient ? 1.5 : 0.4} />
            <hemisphereLight intensity={0.5} groundColor="#000000" color="#ffffff" />
            
            <Stars radius={800} depth={50} count={20000} factor={10} saturation={0} fade speed={2} />
            <Suspense fallback={null}>
                <Environment preset="city" />
            </Suspense>

            <group position={[0, 0.25, -5]}>
                <mesh receiveShadow castShadow>
                    <cylinderGeometry args={[4, 4.5, 0.5, 64]} />
                    <meshStandardMaterial color="#222" roughness={0.1} metalness={0.8} />
                </mesh>
                <mesh position={[0, 0.26, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[3.9, 4.0, 64]} />
                    <meshBasicMaterial color="#FFD700" transparent opacity={0.8} side={THREE.DoubleSide} />
                </mesh>
            </group>

            {lightingConfig.stage && (
                <spotLight 
                    position={[0, 12, -5]} 
                    angle={0.5} 
                    penumbra={0.5} 
                    intensity={activeCandidate ? 600 : 150} 
                    color="#fff" 
                    castShadow 
                    target-position={[0, 0, -5]}
                />
            )}
            
            {lightingConfig.top && (
                <directionalLight position={[0, 15, -5]} intensity={6} color="#ffffff" castShadow />
            )}

            {lightingConfig.diagonal && (
                <directionalLight position={[10, 12, 5]} intensity={5} color="#FFD700" castShadow />
            )}
            
            <pointLight position={[-5, 5, -5]} intensity={50} color="#ff3b3b" distance={20} />
            <pointLight position={[5, 5, -5]} intensity={50} color="#3b3bff" distance={20} />

            <group position={[0, 3.5, -9.5]}>
                <mesh castShadow>
                    <boxGeometry args={[10.4, 6.0, 0.1]} />
                    <meshStandardMaterial color="#050505" />
                </mesh>
                <ScreenContent screenData={screenData} webrtcStream={webrtcStream} />
                <pointLight position={[0, 0, 1]} intensity={screenData ? 2 : 0.5} color="#FFD700" distance={8} />
            </group>

            {materialsUrl && (
                <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                    <group position={[3, 2, -4]} rotation={[0, -0.5, 0]}>
                        <mesh>
                            <planeGeometry args={[1.5, 2]} />
                            <Suspense fallback={<meshBasicMaterial color="white" />}>
                                <ScreenImageContent url={materialsUrl} />
                            </Suspense>
                        </mesh>
                        <mesh position={[0, 0, -0.01]}>
                            <planeGeometry args={[1.6, 2.1]} />
                            <meshBasicMaterial color="#d4af37" />
                        </mesh>
                    </group>
                </Float>
            )}

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#050505" roughness={0.8} />
            </mesh>

            {STAGE_SEATS.map((seat) => {
                const isOccupied = participants.some(p => p.seatId === seat.id) || localParticipant.seatId === seat.id;
                const isHovered = hoveredSeat === seat.id;
                const isJudgeSeat = seat.id < 3;
                
                return (
                    <group key={seat.id} position={seat.position} rotation={seat.rotation}>
                        <group 
                            onPointerOver={() => !isOccupied && setHoveredSeat(seat.id)}
                            onPointerOut={() => setHoveredSeat(null)}
                            onClick={() => !isOccupied && onSeatSelect(seat.id)}
                        >
                            <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
                                <boxGeometry args={[0.5, 0.1, 0.5]} />
                                <meshStandardMaterial 
                                    color={isOccupied ? "#1a1a1a" : (isHovered ? (isJudgeSeat ? "#FFD700" : "#00D2FF") : "#333")} 
                                    roughness={0.5}
                                    metalness={0.4}
                                    emissive={isHovered && !isOccupied ? (isJudgeSeat ? "#FFD700" : "#00D2FF") : "#000"}
                                    emissiveIntensity={0.5}
                                />
                            </mesh>
                            <mesh position={[0, 0.6, 0.2]} rotation={[-0.1, 0, 0]} castShadow receiveShadow>
                                <boxGeometry args={[0.5, 0.6, 0.1]} />
                                <meshStandardMaterial color={isOccupied ? "#111" : "#222"} />
                            </mesh>
                        </group>
                    </group>
                );
            })}

            {activeCandidate && (
                <group position={CANDIDATE_STAGE_POS}>
                    <AvatarModel 
                        name={activeCandidate.name} 
                        color={activeCandidate.color} 
                        isLocal={activeCandidate.id === localParticipant.id}
                        onNameChange={onNameChange}
                        avatarType="premium"
                    />
                </group>
            )}

            {participants.map((p) => (
                p.seatId !== null && p.id !== activeCandidateId && (
                    <AvatarModel 
                        key={p.id}
                        position={STAGE_SEATS.find(s => s.id === p.seatId)?.position || [0, 0, 0]} 
                        name={p.name}
                        color={p.color}
                        isLocal={p.id === localParticipant.id}
                        onNameChange={onNameChange}
                    />
                )
            ))}
            {localParticipant.seatId !== null && localParticipant.id !== activeCandidateId && (
                <group position={STAGE_SEATS.find(s => s.id === localParticipant.seatId)?.position || [0, 0, 0]}>
                    <AvatarModel 
                        name={localParticipant.name} 
                        color={localParticipant.color} 
                        isLocal={true}
                        onNameChange={onNameChange}
                    />
                </group>
            )}

            <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.5} far={10} color="#000000" />
            <Preload all />
        </>
    );
};
