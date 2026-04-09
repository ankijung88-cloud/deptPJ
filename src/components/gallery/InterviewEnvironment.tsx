import React, { useMemo, useEffect, useState } from 'react';
import { 
    OrbitControls,
    PerspectiveCamera, 
    ContactShadows, 
    Environment,
    useTexture,
    Text,
    MeshReflectorMaterial,
    Preload
} from '@react-three/drei';
import * as THREE from 'three';
import { AvatarModel } from './AvatarModel';

interface Participant {
    id: string;
    name: string;
    seatId: number | null;
    color: string;
    role: 'interviewer' | 'candidate' | 'audience';
    status: 'waiting' | 'in-progress' | 'completed';
    isVideoOff?: boolean;
}

export interface SharedMaterial {
    id: string;
    name: string;
    url: string;
    type: 'resume' | 'reference';
    ownerName: string;
}

interface InterviewEnvironmentProps {
    participants: Participant[];
    localParticipant: Participant;
    onSeatSelect: (seatId: number) => void;
    localStream?: MediaStream | null;
    remoteStreams?: Record<string, MediaStream>;
    backdropUrl: string;
    activeMaterial: SharedMaterial | null;
    currentCandidateId: string | null;
    onScreenClick: () => void;
    onNameUpdate?: (newName: string) => void;
}

const INTERVIEW_SEATS = [
    { id: 0, position: [-1.5, 0, 1.6] as [number, number, number], rotation: [0, 0, 0], label: '면접관 1' },
    { id: 1, position: [0, 0, 1.6] as [number, number, number], rotation: [0, 0, 0], label: '면접관 2' },
    { id: 2, position: [1.5, 0, 1.6] as [number, number, number], rotation: [0, 0, 0], label: '면접관 3' },
    { id: 3, position: [0, 0, -2.5] as [number, number, number], rotation: [0, Math.PI, 0], label: '지원자' },
];

interface PersonalScreenProps {
    stream?: MediaStream | null; 
    position: [number, number, number];
    rotation: [number, number, number];
    label: string;
    activeMaterial?: SharedMaterial | null;
    isInterviewing?: boolean;
    onScreenClick?: () => void;
}

const PersonalScreen: React.FC<PersonalScreenProps> = ({ stream, position, rotation, label, activeMaterial, isInterviewing, onScreenClick }) => {
    const video = useMemo(() => {
        const v = document.createElement('video');
        v.autoplay = true;
        v.playsInline = true;
        v.muted = true;
        return v;
    }, []);

    const [texture, setTexture] = useState<THREE.VideoTexture | null>(null);

    useEffect(() => {
        if (!stream || !video) {
            setTexture(null);
            return;
        }
        if (video.srcObject !== stream) {
            video.srcObject = stream;
            video.play().catch(err => console.warn('[InterviewScreen] Play failed:', err));
            const vt = new THREE.VideoTexture(video);
            vt.colorSpace = THREE.SRGBColorSpace;
            vt.repeat.set(-1, 1);
            vt.offset.set(1, 0);
            setTexture(vt);
        }
    }, [stream, video]);

    return (
        <group position={position} rotation={rotation}>
            {/* Screen Frame */}
            {/* Screen Frame - Enlarged */}
            <mesh position={[0, 1.1, 0]}>
                <boxGeometry args={[1.2, 0.68, 0.05]} />
                <meshStandardMaterial 
                    color={isInterviewing ? "#10b981" : "#111"} 
                    emissive={isInterviewing ? "#10b981" : "#000"}
                    emissiveIntensity={isInterviewing ? 0.3 : 0}
                    metalness={0.8} 
                    roughness={0.2} 
                />
            </mesh>
            {/* Screen Display - Enlarged */}
            <mesh 
                position={[0, 1.1, 0.031]}
                onClick={(e) => {
                    e.stopPropagation();
                    if (onScreenClick) onScreenClick();
                }}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    document.body.style.cursor = 'pointer';
                }}
                onPointerOut={() => {
                    document.body.style.cursor = 'default';
                }}
            >
                <planeGeometry args={[1.15, 0.63]} />
                {activeMaterial ? (
                    <ResumeTexture url={activeMaterial.url} />
                ) : texture ? (
                    <meshBasicMaterial map={texture} toneMapped={false} />
                ) : (
                    <meshBasicMaterial color="#050505" />
                )}
                
                {/* Resume Mode Indicator */}
                {activeMaterial && (
                    <group position={[0, -0.25, 0.01]}>
                        <mesh>
                            <planeGeometry args={[0.4, 0.1]} />
                            <meshBasicMaterial color="#00D2FF" transparent opacity={0.8} />
                        </mesh>
                        <Text
                            fontSize={0.03}
                            color="black"
                            maxWidth={0.38}
                            textAlign="center"
                        >
                            {`${activeMaterial.ownerName} - ${activeMaterial.type === 'resume' ? '이력서' : '참고자료'}`}
                        </Text>
                    </group>
                )}

                {!texture && !activeMaterial && (
                    <Text
                        position={[0, 0, 0.01]}
                        fontSize={0.04}
                        color="#00D2FF"
                        maxWidth={0.6}
                        textAlign="center"
                    >
                        WAITING FOR SYNC...
                    </Text>
                )}

                {isInterviewing && (
                    <group position={[0, 0.28, 0.01]}>
                        <mesh>
                            <planeGeometry args={[0.3, 0.07]} />
                            <meshBasicMaterial color="#10b981" />
                        </mesh>
                        <Text
                            fontSize={0.03}
                            color="white"
                            maxWidth={0.28}
                            textAlign="center"
                        >
                            INTERVIEWING
                        </Text>
                    </group>
                )}
            </mesh>
            {/* Label - Positioned higher for large screen */}
            <Text position={[0, 1.55, 0]} fontSize={0.12} color="white">
                {String(label || 'Unknown')}
            </Text>
        </group>
    );
};

// Helper component to load resume texture
// Helper component to load resume texture
const ResumeTexture: React.FC<{ url: string }> = ({ url }) => {
    // Note: useTexture suspends, so do NOT wrap it in try-catch.
    // The Suspense boundary in the parent handles the loading state.
    const tex = useTexture(url);
    if (tex) {
        tex.colorSpace = THREE.SRGBColorSpace;
    }
    return <meshBasicMaterial map={tex} toneMapped={false} transparent={true} />;
};

export const InterviewEnvironment: React.FC<InterviewEnvironmentProps> = ({
    participants,
    localParticipant,
    onSeatSelect,
    localStream,
    remoteStreams = {},
    backdropUrl,
    activeMaterial,
    currentCandidateId,
    onScreenClick,
    onNameUpdate
}) => {
    const backdropTexture = useTexture(backdropUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000');
    if (backdropTexture) {
        backdropTexture.mapping = THREE.EquirectangularReflectionMapping;
    }

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 2, 8]} fov={50} />
            <OrbitControls 
                enableDamping 
                dampingFactor={0.05} 
                target={[0, 1.2, 0]} 
                maxPolarAngle={Math.PI / 2.1} 
                minPolarAngle={Math.PI / 12}
                minDistance={3}
                maxDistance={15}
            />
            <Environment preset="city" />
            
            {/* Background Sphere/Backdrop */}
            <mesh scale={[-50, 50, 50]}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshBasicMaterial map={backdropTexture} side={THREE.BackSide} />
            </mesh>

            {/* Room Structure - Glass Walls */}
            <group position={[0, 2.5, 0]}>
                {/* Floor */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
                    <planeGeometry args={[20, 20]} />
                    <MeshReflectorMaterial
                        blur={[300, 100]}
                        resolution={1024}
                        mixBlur={1}
                        mixStrength={40}
                        roughness={1}
                        depthScale={1.2}
                        minDepthThreshold={0.4}
                        maxDepthThreshold={1.4}
                        color="#151515"
                        metalness={0.5}
                        mirror={1}
                    />
                </mesh>

                {/* Glass Walls (4 sides) */}
                <mesh position={[0, 0, -5]}>
                    <boxGeometry args={[10, 5, 0.1]} />
                    <meshPhysicalMaterial 
                    color="#ffffff"
                    transparent
                    opacity={0.15}
                    transmission={0.95}
                    thickness={0.5}
                    roughness={0}
                    ior={1.5}
                    clearcoat={1}
                />
                </mesh>
                <mesh position={[0, 0, 5]}>
                    <boxGeometry args={[10, 5, 0.1]} />
                    <meshPhysicalMaterial transparent opacity={0.1} transmission={0.95} roughness={0} color="white" />
                </mesh>
                <mesh position={[-5, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                    <boxGeometry args={[10, 5, 0.1]} />
                    <meshPhysicalMaterial transparent opacity={0.1} transmission={0.95} roughness={0} color="white" />
                </mesh>
                <mesh position={[5, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                    <boxGeometry args={[10, 5, 0.1]} />
                    <meshPhysicalMaterial transparent opacity={0.1} transmission={0.95} roughness={0} color="white" />
                </mesh>
            </group>

            <ambientLight intensity={1.2} />
            <rectAreaLight
                width={8}
                height={0.5}
                color="#ffffff"
                intensity={30}
                position={[0, 3.8, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
            />
            
            <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
            <pointLight position={[0, 5, 5]} intensity={50} color="#fff" distance={20} />
            <directionalLight position={[5, 5, 5]} intensity={1} color="#ffd7af" /> {/* Sunset Warmth */}

            {/* Table */}
            <mesh position={[0, 0.35, 1]} receiveShadow>
                <boxGeometry args={[5, 0.1, 1.2]} />
                <meshStandardMaterial color="#222" roughness={0.1} metalness={0.5} />
            </mesh>
            <mesh position={[0, 0.35, -2]} receiveShadow>
                <boxGeometry args={[1.5, 0.1, 1]} />
                <meshStandardMaterial color="#222" roughness={0.1} metalness={0.5} />
            </mesh>

            {/* Seating and Avatars */}
            {INTERVIEW_SEATS.map((seat) => {
                const participant = participants.find(p => p.seatId === seat.id);
                const isLocalSeat = localParticipant.seatId === seat.id;
                
                // Determine the stream for this seat's screen
                const isLocal = localParticipant.seatId === seat.id;
                const occupantStream = isLocal 
                    ? (localParticipant.isVideoOff ? null : localStream)
                    : (participant && !participant.isVideoOff ? remoteStreams[participant.id] : null);

                return (
                    <group key={seat.id}>
                        {/* Key Light for each seat - Positioned in front of the participant */}
                        <pointLight 
                            position={[
                                seat.position[0], 
                                2, 
                                seat.id === 3 ? seat.position[2] + 0.8 : seat.position[2] - 0.8
                            ]} 
                            intensity={8} 
                            color="#fff" 
                            distance={5} 
                        />

                        {/* Seat Mesh Placeholder */}
                        <mesh position={[seat.position[0], 0.2, seat.position[2]]}>
                            <cylinderGeometry args={[0.3, 0.35, 0.4]} />
                            <meshStandardMaterial color="#111" />
                        </mesh>

                        {/* Avatar */}
                        {participant ? (
                            <AvatarModel 
                                position={seat.position}
                                name={participant.name}
                                color={participant.color}
                                isLocal={false}
                            />
                        ) : isLocalSeat ? (
                            <AvatarModel 
                                position={seat.position}
                                name={localParticipant.name}
                                color={localParticipant.color}
                                isLocal={true}
                                onNameChange={onNameUpdate}
                            />
                        ) : null}

                        {/* Personal Screen aligned to the opposite edge of the table (away from participant) */}
                        <PersonalScreen 
                            position={[
                                seat.position[0], 
                                0, 
                                seat.id === 3 ? -1.5 : 0.4
                            ]}
                            // Orient screen to face the opposite side (Interviewers look at Candidate, Candidate looks at Interviewers)
                            rotation={[0, seat.id === 3 ? 0 : Math.PI, 0]}
                            label={isLocal ? (localParticipant?.name || 'Me') : (participant?.name || seat.label || 'Candidate')}
                            stream={occupantStream}
                            activeMaterial={activeMaterial}
                            isInterviewing={participant?.id === currentCandidateId}
                            onScreenClick={onScreenClick}
                        />

                        {/* Interaction: Seat Click */}
                        {!participant && localParticipant.seatId !== seat.id && (
                            <mesh 
                                position={[seat.position[0], 0.15, seat.position[2]]}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSeatSelect(seat.id);
                                }}
                                onPointerOver={(e) => {
                                    e.stopPropagation();
                                    document.body.style.cursor = 'pointer';
                                }}
                                onPointerOut={() => {
                                    document.body.style.cursor = 'default';
                                }}
                            >
                                <cylinderGeometry args={[0.45, 0.45, 0.1]} />
                                <meshBasicMaterial 
                                    color="#00D2FF" 
                                    transparent 
                                    opacity={0.4} 
                                />
                            </mesh>
                        )}
                    </group>
                );
            })}

            <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.5} far={10} color="#000000" />
            <Preload all />
        </>
    );
};
