import React, { useState } from 'react';
import { 
    OrbitControls, 
    PerspectiveCamera, 
    ContactShadows, 
    Text,
    Preload,
    Stars,
    Environment,
    useTexture
} from '@react-three/drei';
import * as THREE from 'three';
import { AvatarModel } from './AvatarModel';

interface Participant {
    id: string;
    name: string;
    seatId: number | null;
    color: string;
    position?: [number, number, number];
}

interface MeetingRoomEnvironmentProps {
    participants: Participant[];
    localParticipant: Participant;
    onSeatSelect: (seatId: number) => void;
    meetingMode: '1:1' | 'Group';
    screenData?: { url: string; type: string };
    webrtcStream?: MediaStream | null;
}

const SEATS = [
    { id: 0, position: [-1.5, 0, -0.8] as [number, number, number], rotation: [0, -Math.PI / 2, 0] as [number, number, number] },
    { id: 1, position: [-1.5, 0, 0.2] as [number, number, number], rotation: [0, -Math.PI / 2, 0] as [number, number, number] },
    { id: 2, position: [-1.5, 0, 1.2] as [number, number, number], rotation: [0, -Math.PI / 2, 0] as [number, number, number] },
    { id: 3, position: [-1.5, 0, 2.2] as [number, number, number], rotation: [0, -Math.PI / 2, 0] as [number, number, number] },
    { id: 4, position: [-1.5, 0, 3.2] as [number, number, number], rotation: [0, -Math.PI / 2, 0] as [number, number, number] },
    { id: 5, position: [1.5, 0, -0.8] as [number, number, number], rotation: [0, Math.PI / 2, 0] as [number, number, number] },
    { id: 6, position: [1.5, 0, 0.2] as [number, number, number], rotation: [0, Math.PI / 2, 0] as [number, number, number] },
    { id: 7, position: [1.5, 0, 1.2] as [number, number, number], rotation: [0, Math.PI / 2, 0] as [number, number, number] },
    { id: 8, position: [1.5, 0, 2.2] as [number, number, number], rotation: [0, Math.PI / 2, 0] as [number, number, number] },
    { id: 9, position: [1.5, 0, 3.2] as [number, number, number], rotation: [0, Math.PI / 2, 0] as [number, number, number] },
];

const ScreenImageContent: React.FC<{ url: string }> = ({ url }) => {
    // Only load texture if URL is non-empty
    const texture = useTexture(url || '');
    return (
        <meshBasicMaterial 
            color="#ffffff"
            map={texture} 
            toneMapped={false} 
        />
    );
};

const ScreenContent: React.FC<{ screenData?: { url: string; type: string }; webrtcStream?: MediaStream | null }> = ({ screenData, webrtcStream }) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const [videoTexture, setVideoTexture] = React.useState<THREE.VideoTexture | null>(null);

    // Initial setup for Video Texture
    React.useEffect(() => {
        if (!videoRef.current) {
            const video = document.createElement('video');
            // Do NOT set crossOrigin globally; it blocks WebRTC
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.autoplay = true;
            (videoRef as any).current = video;
            const tex = new THREE.VideoTexture(video);
            tex.colorSpace = THREE.SRGBColorSpace;
            setVideoTexture(tex);
        }
    }, []);

    // Handle updates to screenData or webrtcStream
    React.useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (screenData?.type === 'webrtc' && webrtcStream) {
            if (video.srcObject !== webrtcStream) {
                video.removeAttribute('crossOrigin');
                video.srcObject = webrtcStream;
                video.onloadedmetadata = () => {
                    video.play().catch(console.error);
                };
            }
        } else if (screenData?.type === 'video' && screenData.url) {
            if (video.src !== screenData.url) {
                video.srcObject = null;
                video.crossOrigin = "Anonymous";
                video.src = screenData.url;
                video.onloadedmetadata = () => {
                    video.play().catch(console.error);
                };
            }
        } else {
            video.pause();
        }
    }, [screenData, webrtcStream]);

    if (!screenData || screenData.type === 'none') {
        return (
            <group position={[0, 0, 0.03]}>
                <mesh>
                    <planeGeometry args={[6.0, 3.4]} />
                    <meshBasicMaterial color="#000" />
                </mesh>
                <Text
                    position={[0, 0.3, 0.01]}
                    fontSize={0.4}
                    color="#00D2FF"
                    fillOpacity={0.3}
                >
                    BUSINESS ARCHIVE
                </Text>
                <Text
                    position={[0, -0.3, 0.01]}
                    fontSize={0.2}
                    color="white"
                    fillOpacity={0.2}
                >
                    WAITING FOR PRESENTATION...
                </Text>
            </group>
        );
    }

    return (
        <mesh position={[0, 0, 0.03]}>
            <planeGeometry args={[6.0, 3.4]} />
            {screenData.type === 'image' && screenData.url ? (
                <React.Suspense fallback={<meshBasicMaterial color="#000" />}>
                    <ScreenImageContent url={screenData.url} />
                </React.Suspense>
            ) : (
                <meshBasicMaterial 
                    color="#ffffff"
                    map={videoTexture} 
                    toneMapped={false} 
                />
            )}
        </mesh>
    );
};

export const MeetingRoomEnvironment: React.FC<MeetingRoomEnvironmentProps> = ({
    participants,
    localParticipant,
    onSeatSelect,
    meetingMode,
    screenData,
    webrtcStream
}) => {
    const [hoveredSeat, setHoveredSeat] = useState<number | null>(null);

    return (
        <>
            {/* Camera Setup */}
            <PerspectiveCamera makeDefault position={meetingMode === '1:1' ? [0, 3, 4] : [0, 3, 6]} fov={50} />
            <OrbitControls 
                enableDamping 
                dampingFactor={0.05} 
                target={[0, 0.8, 1.2]}          // Adjusted target to lift the screen view higher and focus on new table center
                maxPolarAngle={Math.PI / 2.1} // Prevent looking below floor level
                minPolarAngle={Math.PI / 12}  // Allow looking up at stars but with a reasonable limit
                minAzimuthAngle={-Math.PI / 4.5} // Narrow left limit (~40 deg)
                maxAzimuthAngle={Math.PI / 4.5}  // Narrow right limit (~40 deg)
                minDistance={2}               // Prevent zooming too close into avatars
                maxDistance={7}               // Keep camera within the room boundaries
            />

            {/* Lighting & Environment */}
            <ambientLight intensity={1.5} />
            
            {/* The Room Floor - Premium Gold Foundation */}
            <mesh position={[0, -0.11, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[50, 50]} />
                <meshStandardMaterial color="#7d6608" roughness={0.7} metalness={0.2} />
            </mesh>

            {/* Room Walls simplified: Inner architecture now handles all boundaries */}

            <spotLight position={[0, 8, 0]} angle={1.2} penumbra={0.8} intensity={8.0} castShadow />
            <spotLight position={[0, 5, -6]} angle={1.0} penumbra={0.5} intensity={5.0} distance={15} />
            <directionalLight position={[10, 15, 10]} intensity={2.5} castShadow />
            <directionalLight position={[-10, 15, -10]} intensity={2.0} />
            
            {/* Indirect Wall Lighting (Architectural Wash) - 2 per side */}
            {[
                { x: -4.4, z: 1.5 }, { x: -4.4, z: 6.5 },
                { x: 4.4, z: 1.5 }, { x: 4.4, z: 6.5 }
            ].map((pos, i) => (
                <group key={`indirect-group-${i}`} position={[pos.x, 4.0, pos.z]}>
                    {/* Visual Light Fixture (Recessed lamp) */}
                    <mesh rotation={[0, 0, pos.x > 0 ? -Math.PI / 4 : Math.PI / 4]}>
                        <cylinderGeometry args={[0.12, 0.12, 0.05, 16]} />
                        <meshBasicMaterial color="#d4af37" />
                    </mesh>
                    {/* The Light Source (PointLight for reliable wall wash) - Placed closer to camera to ensure it's outside walls */}
                    <pointLight 
                        intensity={40.0} 
                        distance={10} 
                        decay={1.5} 
                        color="#fff9e6" 
                    />
                </group>
            ))}

            {/* Emissive Strip Light Effects - Intensified with Downward Wash */}
            <pointLight position={[0, 4.4, -3.8]} intensity={60.0} color="#d4af37" distance={15} decay={2} />
            <spotLight 
                position={[0, 4.5, -3.9]} 
                angle={0.8} 
                penumbra={1} 
                intensity={150} 
                distance={10} 
                color="#d4af37" 
                castShadow 
            />
            <pointLight position={[0, -0.05, 7.8]} intensity={0.5} color="#d4af37" distance={8} />

            {/* Conference Table */}
            <group position={[0, 0.45, 1.2]}>
                {/* Table Top (Modern Opaque Obsidian) */}
                <mesh receiveShadow castShadow>
                    <boxGeometry args={[2.0, 0.1, 4.5]} />
                    <meshStandardMaterial 
                        color="#050505" 
                        roughness={0.1} 
                        metalness={0.8}
                        transparent={false}
                        opacity={1.0}
                    />
                </mesh>
                
                {/* Table Frame/Glowing Accent (Synchronized Gold) */}
                <mesh position={[0, -0.055, 0]}>
                    <boxGeometry args={[2.05, 0.04, 4.55]} />
                    <meshBasicMaterial color="#d4af37" transparent opacity={0.6} />
                </mesh>

                {/* Table Base/Legs */}
                <mesh position={[0, -0.45, 0]}>
                    <cylinderGeometry args={[0.5, 0.7, 0.9, 32]} />
                    <meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} />
                </mesh>
            </group>

            {/* Presentation PT Screen (Aligned with Table Width) */}
            <group position={[0, 2.4, -4.5]}>
                {/* Screen Bezel */}
                <mesh castShadow>
                    <boxGeometry args={[6.2, 3.6, 0.05]} />
                    <meshStandardMaterial color="#050505" roughness={0.8} />
                </mesh>
                
                {/* Screen Display Area - Native WebGL Plane (Fixes Occlusion) */}
                <ScreenContent 
                    screenData={screenData} 
                    webrtcStream={webrtcStream} 
                />
                
                {/* Screen Ambient Glow */}
                <pointLight position={[0, 0, 0.5]} intensity={screenData && screenData.type !== 'none' ? 1.0 : 0.1} color="#00D2FF" distance={4} />
            </group>

            {/* Interactive Seats */}
            {SEATS.map((seat) => {
                const isOccupied = participants.some(p => p.seatId === seat.id) || localParticipant.seatId === seat.id;
                const isHovered = hoveredSeat === seat.id;
                
                return (
                    <group key={seat.id} position={seat.position} rotation={seat.rotation}>
                        {/* Chair Silhouette/Base */}
                        <group 
                            onPointerOver={() => !isOccupied && setHoveredSeat(seat.id)}
                            onPointerOut={() => setHoveredSeat(null)}
                            onClick={() => !isOccupied && onSeatSelect(seat.id)}
                        >
                            {/* Seat Cushion */}
                            <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
                                <boxGeometry args={[0.5, 0.06, 0.45]} />
                                <meshStandardMaterial 
                                    color={isOccupied ? "#1a1a1a" : (isHovered ? "#00D2FF" : "#2a2a2a")} 
                                    roughness={0.5}
                                    metalness={0.4}
                                    emissive={isHovered && !isOccupied ? "#00D2FF" : "#ffffff"}
                                    emissiveIntensity={isHovered && !isOccupied ? 0.5 : 0.03}
                                />
                            </mesh>
                            
                            {/* Backrest (Slightly leaned back) */}
                            <mesh position={[0, 0.55, 0.2]} rotation={[-0.1, 0, 0]} castShadow receiveShadow>
                                <boxGeometry args={[0.45, 0.5, 0.06]} />
                                <meshStandardMaterial 
                                    color={isOccupied ? "#1a1a1a" : (isHovered ? "#00A0E9" : "#2a2a2a")} 
                                    roughness={0.5}
                                    metalness={0.4}
                                    emissive="#ffffff"
                                    emissiveIntensity={0.02}
                                />
                            </mesh>
                            
                            {/* Armrest Left */}
                            <mesh position={[-0.26, 0.38, 0.05]} castShadow>
                                <cylinderGeometry args={[0.015, 0.015, 0.2]} />
                                <meshStandardMaterial color="#666" metalness={0.8} />
                            </mesh>
                            <mesh position={[-0.26, 0.48, 0]} castShadow>
                                <boxGeometry args={[0.05, 0.02, 0.3]} />
                                <meshStandardMaterial color="#1a1a1a" emissive="#ffffff" emissiveIntensity={0.02} />
                            </mesh>

                            {/* Armrest Right */}
                            <mesh position={[0.26, 0.38, 0.05]} castShadow>
                                <cylinderGeometry args={[0.015, 0.015, 0.2]} />
                                <meshStandardMaterial color="#666" metalness={0.8} />
                            </mesh>
                            <mesh position={[0.26, 0.48, 0]} castShadow>
                                <boxGeometry args={[0.05, 0.02, 0.3]} />
                                <meshStandardMaterial color="#1a1a1a" emissive="#ffffff" emissiveIntensity={0.02} />
                            </mesh>

                            {/* Stem / Gas cylinder */}
                            <mesh position={[0, 0.15, 0]} castShadow>
                                <cylinderGeometry args={[0.03, 0.03, 0.3, 16]} />
                                <meshStandardMaterial color="#777" metalness={0.9} roughness={0.1} />
                            </mesh>

                            {/* Star Base (5 legs with casters) */}
                            <group position={[0, 0.05, 0]}>
                                {[0, 1, 2, 3, 4].map(i => (
                                    <group key={i} rotation={[0, (i * Math.PI * 2) / 5, 0]}>
                                        <mesh position={[0, 0, 0.15]} castShadow>
                                            <boxGeometry args={[0.03, 0.03, 0.3]} />
                                            <meshStandardMaterial color="#555" metalness={0.9} roughness={0.1} />
                                        </mesh>
                                        <mesh position={[0, -0.015, 0.25]} castShadow>
                                            <sphereGeometry args={[0.02, 16, 16]} />
                                            <meshStandardMaterial color="#111" roughness={0.5} />
                                        </mesh>
                                    </group>
                                ))}
                            </group>
                        </group>
                        
                        {/* Occupancy Indicator Label */}
                        <Text
                            position={[0, 0.8, 0]}
                            fontSize={0.2}
                            color="#00D2FF"
                            visible={!isOccupied && isHovered}
                        >
                            Take Seat
                        </Text>
                    </group>
                );
            })}

            {/* Local Participant Avatar */}
            {localParticipant.seatId !== null && (
                <group renderOrder={10}>
                    <AvatarModel 
                        position={SEATS.find(s => s.id === localParticipant.seatId)?.position || [0, 0, 0]} 
                        name={localParticipant.name}
                        color={localParticipant.color}
                        isLocal={true}
                    />
                </group>
            )}

            {/* Remote Participants Avatars */}
            {participants.map((p) => (
                p.seatId !== null && (
                    <group key={p.id} renderOrder={10}>
                        <AvatarModel 
                            position={SEATS.find(s => s.id === p.seatId)?.position || [0, 0, 0]} 
                            name={p.name}
                            color={p.color}
                            isLocal={false}
                        />
                    </group>
                )
            ))}

            {/* Room Architecture - 3D Theater Enclosure */}
            <group>
                {/* Back Wall (Door side) - Infinite Height */}
                <mesh position={[0, 249.89, 8]} receiveShadow>
                    <boxGeometry args={[10, 500, 0.2]} />
                    <meshStandardMaterial color="#062c21" roughness={0.8} />
                </mesh>
                
                {/* Left Wall - Infinite Height */}
                <mesh position={[-5, 249.89, 2]} receiveShadow>
                    <boxGeometry args={[0.2, 500, 12]} />
                    <meshStandardMaterial color="#062c21" roughness={0.8} />
                </mesh>
                
                {/* Right Wall - Infinite Height */}
                <mesh position={[5, 249.89, 2]} receiveShadow>
                    <boxGeometry args={[0.2, 500, 12]} />
                    <meshStandardMaterial color="#062c21" roughness={0.8} />
                </mesh>
                
                {/* Front Wall (Glass Window) - Full Height with Architectural Framing */}
                <group position={[0, 0, -4.8]}>
                    {/* Glass Pane */}
                    <mesh position={[0, 249.89, 0]}>
                        <boxGeometry args={[10, 500, 0.05]} />
                        <meshStandardMaterial 
                            color="#a5f3fc" 
                            transparent={true} 
                            opacity={0.08} 
                            roughness={0} 
                            metalness={0.9}
                            envMapIntensity={2}
                            depthWrite={false}
                        />
                    </mesh>
                    
                    {/* Architectural Frames (Mullions) */}
                    {/* Horizontal Frame at Ceiling Height */}
                    <mesh position={[0, 4.4, 0.05]}>
                        <boxGeometry args={[10, 0.15, 0.12]} />
                        <meshStandardMaterial color="#1a1a1a" metalness={0.8} />
                    </mesh>
                    {/* Vertical Frames */}
                    {[-5, -2, 2, 5].map((x, i) => (
                        <mesh key={`frame-${i}`} position={[x, 2.2, 0.05]}>
                            <boxGeometry args={[0.08, 4.4, 0.1]} />
                            <meshStandardMaterial color="#1a1a1a" metalness={0.8} />
                        </mesh>
                    ))}
                </group>

                {/* Open Ceiling Atmospheric Elements - Deep Space */}
                <Stars radius={800} depth={50} count={25000} factor={10} saturation={0} fade speed={2} />
                <Environment preset="night" />

                {/* Cyan Glowing Trims */}
                {/* Top/Front ceiling trim - Glowing */}
                <mesh position={[0, 4.4, -3.9]}>
                    <boxGeometry args={[10, 0.1, 0.1]} />
                    <meshStandardMaterial color="#d4af37" emissive="#d4af37" emissiveIntensity={5} />
                </mesh>
                {/* Bottom Back trim - Glowing */}
                <mesh position={[0, 0, 7.9]}>
                    <boxGeometry args={[10, 0.1, 0.1]} />
                    <meshStandardMaterial color="#d4af37" emissive="#d4af37" emissiveIntensity={3} />
                </mesh>
                {/* Side Floor Trims */}
                <mesh position={[-4.9, 0, 2]}>
                    <boxGeometry args={[0.1, 0.1, 12]} />
                    <meshBasicMaterial color="#d4af37" transparent opacity={0.3} />
                </mesh>
                <mesh position={[4.9, 0, 2]}>
                    <boxGeometry args={[0.1, 0.1, 12]} />
                    <meshBasicMaterial color="#d4af37" transparent opacity={0.3} />
                </mesh>
            </group>

            {/* Ground (Non-reflective Premium Gold) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 2]} receiveShadow>
                <planeGeometry args={[12, 14]} />
                <meshStandardMaterial 
                    color="#d4af37"
                    roughness={0.9}
                    metalness={0.3}
                />
            </mesh>

            <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.5} far={10} color="#000000" />
            
            {/* Asset Preloading to prevent flashes during interaction */}
            <Preload all />
        </>
    );
};
