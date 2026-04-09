import React, { useState, Suspense } from 'react';
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
// removed unused THREE import
import { AvatarModel } from './AvatarModel';

interface Participant {
    id: string;
    name: string;
    seatId: number | null;
    color: string;
    position?: [number, number, number];
}
interface SindangEnvironmentProps {
    participants: Participant[];
    localParticipant: Participant;
    onSeatSelect: (seatId: number) => void;
    shrineImageUrl?: string | null;
}

const SEATS = [
    { id: 0, position: [0, 0, -0.8] as [number, number, number], rotation: [0, 0, 0] as [number, number, number] }, // Shaman
    { id: 1, position: [0, 0, 0.8] as [number, number, number], rotation: [0, Math.PI, 0] as [number, number, number] }, // Client
];

const TraditionalTable: React.FC = () => (
    <group position={[0, 0.25, 0]}>
        {/* Table Top */}
        <mesh receiveShadow castShadow>
            <boxGeometry args={[1.2, 0.08, 0.8]} />
            <meshStandardMaterial color="#3d1f08" roughness={0.3} metalness={0.4} />
        </mesh>
        {/* Table Legs */}
        {[-0.5, 0.5].map(x => 
            [-0.3, 0.3].map(z => (
                <mesh key={`${x}-${z}`} position={[x, -0.12, z]} castShadow>
                    <boxGeometry args={[0.08, 0.25, 0.08]} />
                    <meshStandardMaterial color="#2d1500" />
                </mesh>
            ))
        )}
    </group>
);

const ShrineImage: React.FC<{ url: string }> = ({ url }) => {
    // Ensure the URL is absolute or properly handled for the texture loader
    const fullUrl = url.startsWith('/') ? `${window.location.origin}${url}` : url;
    const texture = useTexture(fullUrl);
    
    return (
        <mesh position={[0, 3, -0.6]}>
            <planeGeometry args={[10, 6]} />
            <meshStandardMaterial 
                map={texture}
                roughness={0.8} 
                transparent
                side={2} // THREE.DoubleSide
            />
        </mesh>
    );
};

const ShrineAltar: React.FC<{ shrineImageUrl?: string | null }> = ({ shrineImageUrl }) => {
    return (
        <group position={[0, 0, -3.5]}>
            {/* Main Base */}
            <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
                <boxGeometry args={[5, 0.8, 1.2]} />
                <meshStandardMaterial color="#2d1500" roughness={0.5} />
            </mesh>
            
            {/* Statues / Deities (Represented by glowing cylinders/spheres for now) */}
            {[ -1.5, 0, 1.5 ].map((x, i) => (
                <group key={i} position={[x, 1.0, 0]}>
                    <mesh castShadow>
                        <cylinderGeometry args={[0.2, 0.25, 0.5, 16]} />
                        <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
                    </mesh>
                    <mesh position={[0, 0.4, 0]} castShadow>
                        <sphereGeometry args={[0.15, 32, 32]} />
                        <meshStandardMaterial color="#d4af37" metalness={1} roughness={0} />
                    </mesh>
                    {/* Aura light for deities */}
                    <pointLight position={[0, 0.5, 0.2]} intensity={5} color="#FFD700" distance={3} />
                </group>
            ))}

            {/* Background Wall - Now supports uploaded images covering the entire back area */}
            {shrineImageUrl ? (
                <Suspense fallback={
                    <mesh position={[0, 3, -0.6]}>
                        <planeGeometry args={[10, 6]} />
                        <meshStandardMaterial color="#5C1A1A" roughness={0.8} />
                    </mesh>
                }>
                    <ShrineImage url={shrineImageUrl} />
                </Suspense>
            ) : (
                <mesh position={[0, 3, -0.6]}>
                    <planeGeometry args={[10, 6]} />
                    <meshStandardMaterial color="#5C1A1A" roughness={0.8} />
                </mesh>
            )}

            {/* Decorative Paper Flowers (Zihwa) - Stylized */}
            {[ -2.2, -1.8, 1.8, 2.2 ].map((x, i) => (
                <group key={i} position={[x, 0.85, 0.2]}>
                    <mesh castShadow>
                        <cylinderGeometry args={[0.01, 0.01, 0.3]} />
                        <meshStandardMaterial color="#2d1500" />
                    </mesh>
                    <mesh position={[0, 0.2, 0]}>
                        <sphereGeometry args={[0.1, 8, 8]} />
                        <meshStandardMaterial color={i % 2 === 0 ? "#FF5252" : "#FFEB3B"} />
                    </mesh>
                </group>
            ))}
        </group>
    );
};

const Candle: React.FC<{ position: [number, number, number] }> = ({ position }) => (
    <group position={position}>
        <mesh castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.2]} />
            <meshStandardMaterial color="#fff" />
        </mesh>
        <pointLight position={[0, 0.15, 0]} intensity={2} color="#FFA500" distance={2}>
            {/* Flickering light effect can be added via useFrame if needed */}
        </pointLight>
        <mesh position={[0, 0.12, 0]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color="#FFD700" />
        </mesh>
    </group>
);

export const SindangEnvironment: React.FC<SindangEnvironmentProps> = ({
    participants,
    localParticipant,
    onSeatSelect,
    shrineImageUrl
}) => {
    const [hoveredSeat, setHoveredSeat] = useState<number | null>(null);

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 2.5, 4]} fov={60} />
            <OrbitControls 
                enableDamping 
                dampingFactor={0.05} 
                target={[0, 0.8, 0]}
                maxPolarAngle={Math.PI / 2.1} 
                minPolarAngle={Math.PI / 12}
                minAzimuthAngle={-Math.PI / 4.5}
                maxAzimuthAngle={Math.PI / 4.5}
                minDistance={1.5}
                maxDistance={6}
            />

            <ambientLight intensity={0.6} color="#FFE4B5" />
            <pointLight position={[0, 3, 0]} intensity={3} color="#FFA07A" distance={10} />
            
            {/* Traditional Floor (Wooden Maru) */}
            <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[15, 15]} />
                <meshStandardMaterial 
                    color="#4b2c20" 
                    roughness={0.4} 
                    metalness={0.1} 
                />
            </mesh>

            {/* Shrine Altar with optional custom image */}
            <ShrineAltar shrineImageUrl={shrineImageUrl} />

            {/* Consultation Table */}
            <TraditionalTable />

            {/* Candles on altar and table */}
            <Candle position={[-0.4, 0.35, 0]} />
            <Candle position={[0.4, 0.35, 0]} />
            <Candle position={[-1.8, 0.85, -3.2]} />
            <Candle position={[1.8, 0.85, -3.2]} />

            {/* Hanok-inspired Walls */}
            <group>
                {/* Back Wall (behind altar) */}
                <mesh position={[0, 5, -5]}>
                    <boxGeometry args={[10, 10, 0.2]} />
                    <meshStandardMaterial color="#1a1a1a" />
                </mesh>
                {/* Side Walls */}
                <mesh position={[-5, 5, 0]}>
                    <boxGeometry args={[0.2, 10, 10]} />
                    <meshStandardMaterial color="#1a1a1a" />
                </mesh>
                <mesh position={[5, 5, 0]}>
                    <boxGeometry args={[0.2, 10, 10]} />
                    <meshStandardMaterial color="#1a1a1a" />
                </mesh>
            </group>

            {/* Interactive Seats (Bang-seok cushions) */}
            {SEATS.map((seat) => {
                const isOccupied = participants.some(p => p.seatId === seat.id) || localParticipant.seatId === seat.id;
                const isHovered = hoveredSeat === seat.id;
                
                return (
                    <group key={seat.id} position={seat.position} rotation={seat.rotation}>
                        <group 
                            onPointerOver={() => !isOccupied && setHoveredSeat(seat.id)}
                            onPointerOut={() => setHoveredSeat(null)}
                            onClick={() => !isOccupied && onSeatSelect(seat.id)}
                        >
                            {/* Cushion (Bang-seok) */}
                            <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
                                <boxGeometry args={[0.6, 0.1, 0.6]} />
                                <meshStandardMaterial 
                                    color={isOccupied ? "#1a1a1a" : (isHovered ? "#FFD700" : "#8B0000")} 
                                    roughness={0.8}
                                    emissive={isHovered && !isOccupied ? "#FFD700" : "#3d0000"}
                                    emissiveIntensity={isHovered && !isOccupied ? 0.5 : 0.1}
                                />
                            </mesh>
                            
                            {/* Seat Border (Gold trim) */}
                            <mesh position={[0, 0.05, 0]}>
                                <boxGeometry args={[0.62, 0.08, 0.62]} />
                                <meshBasicMaterial color="#d4af37" transparent opacity={0.3} />
                            </mesh>
                        </group>
                        
                        <Text
                            position={[0, 0.5, 0]}
                            fontSize={0.15}
                            color="#d4af37"
                            visible={!isOccupied && isHovered}
                        >
                            {seat.id === 0 ? "Shaman's Seat" : "Client's Seat"}
                        </Text>
                    </group>
                );
            })}

            {/* Avatars */}
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

            <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade speed={1} />
            <Environment preset="night" />
            <ContactShadows resolution={1024} scale={15} blur={2} opacity={0.5} far={5} color="#000000" />
            <Preload all />
        </>
    );
};
