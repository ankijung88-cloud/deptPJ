import React, { useRef, Suspense, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { 
    Sky, 
    ContactShadows, 
    Environment, 
    Html, 
    useGLTF
} from '@react-three/drei';
import { AvatarModel } from './AvatarModel';

interface Participant {
    id: string;
    name: string;
    position: [number, number, number];
    color: string;
    chatMessage?: string;
    chatTime?: number;
}

interface SquareEnvironmentProps {
    participants: Participant[];
    localParticipant: Participant;
    onMove: (position: [number, number, number]) => void;
    onNameChange?: (name: string) => void;
}

// Landmark Components
const StatueAdmiral = ({ position = [0, 0, 80] }: { position?: [number, number, number] }) => (
    <group position={position}>
        {/* Pedestal */}
        <mesh position={[0, 1.5, 0]}>
            <boxGeometry args={[3, 3, 3]} />
            <meshStandardMaterial color="#333" roughness={0.5} />
        </mesh>
        <mesh position={[0, 4, 0]}>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="#444" roughness={0.4} />
        </mesh>
        {/* Statue (Simplified Silhouette) */}
        <mesh position={[0, 7.5, 0]}>
            <capsuleGeometry args={[0.8, 4, 4, 16]} />
            <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
        </mesh>
        <Html position={[0, 10, 0]} center>
            <div className="bg-black/60 px-4 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                충무공 이순신 장군상
            </div>
        </Html>
    </group>
);

// High-Fidelity GLB Loaders with Procedural Fallbacks
const SejongModel = ({ position = [0, 0, 0] }: { position?: [number, number, number] }) => {
    try {
        const { scene } = useGLTF('/assets/models/sejong.glb');
        return <primitive object={scene} scale={2} position={position} />;
    } catch {
        return <StatueKingProcedural position={position} />;
    }
};

const GwanghwamunModel = ({ position = [0, 0, -120] }: { position?: [number, number, number] }) => {
    try {
        const { scene } = useGLTF('/assets/models/gwanghwamun.glb');
        return <primitive object={scene} scale={1.5} position={position} />;
    } catch {
        return <GyeongbokgungGateProcedural position={position} />;
    }
};

const StatueKingProcedural = ({ position = [0, 0, 0] }: { position?: [number, number, number] }) => (
    <group position={position}>
        {/* Pedestal (Multi-tiered) */}
        <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[8, 0.8, 10]} />
            <meshStandardMaterial color="#333" roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
            <boxGeometry args={[6, 0.8, 8]} />
            <meshStandardMaterial color="#444" roughness={0.4} />
        </mesh>

        {/* Throne (Eojwa) */}
        <group position={[0, 1.6, 0]}>
            <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[4.5, 1, 5]} />
                <meshStandardMaterial color="#CD7F32" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 2.5, -2.4]}>
                <boxGeometry args={[4.5, 3, 0.4]} />
                <meshStandardMaterial color="#CD7F32" metalness={0.8} roughness={0.2} />
            </mesh>
            {[-2.1, 2.1].map(x => (
                <mesh key={x} position={[x, 1.5, 0]}>
                    <boxGeometry args={[0.4, 1.5, 4.8]} />
                    <meshStandardMaterial color="#CD7F32" metalness={0.8} roughness={0.2} />
                </mesh>
            ))}
        </group>

        {/* King Sejong Figure */}
        <group position={[0, 2.6, 0]}>
            <mesh position={[0, 1, 0]}>
                <cylinderGeometry args={[0.8, 1.8, 2.5, 8]} />
                <meshStandardMaterial color="#CD7F32" metalness={0.9} roughness={0.1} />
            </mesh>
            <group position={[0, 2.5, 0]}>
                <mesh>
                    <sphereGeometry args={[0.4, 16, 16]} />
                    <meshStandardMaterial color="#CD7F32" metalness={0.9} roughness={0.1} />
                </mesh>
                <mesh position={[0, 0.3, 0]}>
                    <cylinderGeometry args={[0.1, 0.3, 0.4]} />
                    <meshStandardMaterial color="#CD7F32" metalness={0.9} roughness={0.1} />
                </mesh>
                {[-1, 1].map(side => (
                    <mesh key={side} position={[side * 0.3, 0.1, -0.2]} rotation={[0, 0, side * 0.5]}>
                        <boxGeometry args={[0.3, 0.1, 0.1]} />
                        <meshStandardMaterial color="#CD7F32" />
                    </mesh>
                ))}
            </group>
            <group position={[0.8, 1.8,  0.5]} rotation={[-0.5, 0, 0.8]}>
                <mesh><cylinderGeometry args={[0.15, 0.2, 1.2]} /><meshStandardMaterial color="#CD7F32" /></mesh>
            </group>
            <group position={[-0.8, 1.2, 1.2]} rotation={[0.2, 0, -0.5]}>
                <mesh rotation={[0.5, 0, 0]}><cylinderGeometry args={[0.15, 0.2, 1]} /><meshStandardMaterial color="#CD7F32" /></mesh>
                <mesh position={[0, 0.4, 0.2]} rotation={[0, 0.5, 0]}>
                    <boxGeometry args={[0.8, 0.1, 1.1]} />
                    <meshStandardMaterial color="#f0e68c" roughness={0.8} />
                </mesh>
            </group>
        </group>

        <Html position={[0, 6.5, 0]} center>
            <div className="bg-black/60 px-4 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                세종대왕 동상 (King Sejong the Great)
            </div>
        </Html>
    </group>
);

// Detailed Gwanghwamun Gate Sub-components
const KoreanRoof = ({ args, position, rotation }: { args: [number, number, number, number], position: [number, number, number], rotation?: [number, number, number] }) => (
    <group position={position} rotation={rotation}>
        <mesh>
            <cylinderGeometry args={args} />
            <meshStandardMaterial color="#2d3436" roughness={0.3} />
        </mesh>
        {/* Curved Eaves (Cheoma) - Simplified with slightly larger base */}
        <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[args[0] * 1.1, args[1] * 1.05, 0.4, args[3]]} />
            <meshStandardMaterial color="#1b4d3e" />
        </mesh>
    </group>
);

const GateDoor = ({ position, isOpen }: { position: [number, number, number], isOpen: boolean }) => {
    const leftDoor = useRef<THREE.Group>(null);
    const rightDoor = useRef<THREE.Group>(null);

    useFrame((_state, delta) => {
        if (!leftDoor.current || !rightDoor.current) return;
        const targetRotation = isOpen ? Math.PI / 2 : 0;
        leftDoor.current.rotation.y = THREE.MathUtils.lerp(leftDoor.current.rotation.y, -targetRotation, 3 * delta);
        rightDoor.current.rotation.y = THREE.MathUtils.lerp(rightDoor.current.rotation.y, targetRotation, 3 * delta);
    });

    return (
        <group position={position}>
            {/* Left Door wing */}
            <group ref={leftDoor} position={[-3, 0, 0]}>
                <mesh position={[1.5, 2, 0]}>
                    <boxGeometry args={[3, 4, 0.4]} />
                    <meshStandardMaterial color="#8b0000" metalness={0.2} roughness={0.8} />
                    {/* Metal studs */}
                    {[0.5, 1.5, 2.5, 3.5].map(y => (
                        [0.5, 1.5, 2.5].map(x => (
                            <mesh key={`${x}-${y}`} position={[x - 1.5, y - 2, 0.21]}>
                                <sphereGeometry args={[0.05, 8, 8]} />
                                <meshStandardMaterial color="#d4af37" metalness={0.9} />
                            </mesh>
                        ))
                    ))}
                </mesh>
            </group>
            {/* Right Door wing */}
            <group ref={rightDoor} position={[3, 0, 0]}>
                <mesh position={[-1.5, 2, 0]}>
                    <boxGeometry args={[3, 4, 0.4]} />
                    <meshStandardMaterial color="#8b0000" metalness={0.2} roughness={0.8} />
                    {/* Metal studs */}
                    {[0.5, 1.5, 2.5, 3.5].map(y => (
                        [0.5, 1.5, 2.5].map(x => (
                            <mesh key={`${x}-${y}`} position={[1.5 - x, y - 2, 0.21]}>
                                <sphereGeometry args={[0.05, 8, 8]} />
                                <meshStandardMaterial color="#d4af37" metalness={0.9} />
                            </mesh>
                        ))
                    ))}
                </mesh>
            </group>
        </group>
    );
};

const HaechiStatue = ({ position }: { position: [number, number, number] }) => (
    <group position={position}>
        {/* Pedestal */}
        <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[1.5, 0.8, 2]} />
            <meshStandardMaterial color="#95a5a6" />
        </mesh>
        {/* Body */}
        <mesh position={[0, 1.2, 0]}>
            <boxGeometry args={[1, 0.6, 1.4]} />
            <meshStandardMaterial color="#bdc3c7" roughness={0.8} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 1.7, 0.4]}>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial color="#bdc3c7" roughness={0.8} />
        </mesh>
        {/* Tail/Details */}
        <mesh position={[0, 1.4, -0.6]} rotation={[0.5, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.2, 0.8]} />
            <meshStandardMaterial color="#95a5a6" />
        </mesh>
    </group>
);

const GyeongbokgungGateProcedural = ({ 
    position = [0, 0, -120],
    isNear = false 
}: { 
    position?: [number, number, number],
    isNear?: boolean 
}) => {
    // Shape for arched gate
    const gateShape = React.useMemo(() => {
        const shape = new THREE.Shape();
        shape.moveTo(-3, 0);
        shape.lineTo(-3, 4);
        shape.absarc(0, 4, 3, Math.PI, 0, true);
        shape.lineTo(3, 0);
        shape.lineTo(-3, 0);
        return shape;
    }, []);

    return (
        <group position={position}>
            {/* Stone Base (Yuk-chuk) */}
            <mesh position={[0, 5, 0]} castShadow receiveShadow>
                <boxGeometry args={[100, 10, 12]} />
                <meshStandardMaterial color="#b2bec3" roughness={0.7} />
            </mesh>

            {/* Arched Gates */}
            {[ -25, 0, 25 ].map((x, i) => (
                <group key={i} position={[x, 0.1, 6.1]}>
                    <mesh rotation={[0, 0, 0]}>
                        <extrudeGeometry args={[gateShape, { depth: 0.5, bevelEnabled: false }]} />
                        <meshBasicMaterial color="#000" />
                    </mesh>
                    <mesh position={[0, 0, -0.1]}>
                        <extrudeGeometry args={[gateShape, { depth: 0.8, bevelEnabled: true, bevelThickness: 0.2, bevelSize: 0.2 }]} />
                        <meshStandardMaterial color="#95a5a6" />
                    </mesh>
                    <GateDoor position={[0, 0, 0.3]} isOpen={isNear} />
                </group>
            ))}

            {/* Wooden Pavilion */}
            <group position={[0, 10, 0]}>
                <mesh position={[0, 2.5, 0]}>
                    <boxGeometry args={[80, 5, 10]} />
                    <meshStandardMaterial color="#8b0000" />
                </mesh>
                {/* Pillars */}
                {[-35, -15, 15, 35].map((x) => (
                    <mesh key={x} position={[x, 2.5, 5.1]}>
                        <cylinderGeometry args={[0.4, 0.4, 5]} />
                        <meshStandardMaterial color="#1b4d3e" />
                    </mesh>
                ))}
            </group>

            <KoreanRoof args={[45, 55, 3, 4]} position={[0, 15, 0]} rotation={[0, Math.PI / 4, 0]} />

            <group position={[0, 17, 0]}>
                <mesh position={[0, 2, 0]}>
                    <boxGeometry args={[60, 4, 8]} />
                    <meshStandardMaterial color="#8b0000" />
                </mesh>
                <Html position={[0, 2, 4.1]} center transform>
                    <div className="bg-[#111] px-4 py-1 border-2 border-yellow-500 text-yellow-500 font-bold text-[18px] tracking-[0.5em] whitespace-nowrap shadow-xl">
                        光化門
                    </div>
                </Html>
            </group>

            <KoreanRoof args={[35, 45, 4, 4]} position={[0, 21, 0]} rotation={[0, Math.PI / 4, 0]} />

            <group position={[0, 0, 0]}>
                {[ -1, 1 ].map(dir => (
                    <mesh key={dir} position={[dir * 100, 3, 0]}>
                        <boxGeometry args={[100, 6, 4]} />
                        <meshStandardMaterial color="#95a5a6" />
                    </mesh>
                ))}
            </group>

            <HaechiStatue position={[-35, 0, 15]} />
            <HaechiStatue position={[35, 0, 15]} />
        </group>
    );
};

const GyeongbokgungPalace = () => {
    return (
        <group position={[0, 0, -260]}>
            {/* Main Courtyard (Jojeong) */}
            <mesh position={[0, 0.05, 50]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[120, 100]} />
                <meshStandardMaterial color="#95a5a6" roughness={0.8} />
            </mesh>
            
            {/* Geunjeongjeon Hall */}
            <Geunjeongjeon position={[0, 0, 0]} />

            {/* Cloister Corridors (East, West, North) */}
            {/* Side Corridors */}
            {[-60, 60].map(x => (
                <group key={x} position={[x, 0, 50]}>
                    <mesh position={[0, 1.5, 0]}>
                        <boxGeometry args={[4, 3, 100]} />
                        <meshStandardMaterial color="#8b0000" />
                    </mesh>
                    <mesh position={[0, 3, 0]} rotation={[0.1 * (x > 0 ? 1 : -1), 0, 0]}>
                        <boxGeometry args={[6, 0.5, 102]} />
                        <meshStandardMaterial color="#2c3e50" />
                    </mesh>
                </group>
            ))}
        </group>
    );
};

const Geunjeongjeon = ({ position }: { position: [number, number, number] }) => (
    <group position={position}>
        {/* Double-tiered Stone Pedestal (Woldae) */}
        <mesh position={[0, 1, 0]}>
            <boxGeometry args={[50, 2, 40]} />
            <meshStandardMaterial color="#b2bec3" />
        </mesh>
        <mesh position={[0, 2.5, 0]}>
            <boxGeometry args={[40, 1.5, 30]} />
            <meshStandardMaterial color="#b2bec3" />
        </mesh>

        {/* Main Building Structure */}
        <group position={[0, 3.2, 0]}>
            {/* Columns & Walls */}
            <mesh position={[0, 4, 0]}>
                <boxGeometry args={[35, 8, 25]} />
                <meshStandardMaterial color="#8b0000" />
            </mesh>
            
            {/* Lower Roof */}
            <KoreanRoof args={[22, 32, 4, 4]} position={[0, 8, 0]} rotation={[0, Math.PI / 4, 0]} />
            
            {/* Upper Tier Structure */}
            <mesh position={[0, 10, 0]}>
                <boxGeometry args={[25, 4, 18]} />
                <meshStandardMaterial color="#8b0000" />
            </mesh>
            
            {/* Upper Roof */}
            <KoreanRoof args={[18, 28, 5, 4]} position={[0, 14, 0]} rotation={[0, Math.PI / 4, 0]} />
        </group>

        {/* Name Plate */}
        <Html position={[0, 12, 12.6]} center transform>
            <div className="bg-[#111] px-4 py-1 border-2 border-yellow-500 text-yellow-500 font-bold text-[14px] tracking-[0.5em] whitespace-nowrap shadow-xl">
                勤政殿
            </div>
        </Html>
    </group>
);

const SurroundingCity = React.memo(() => {
    const buildings = React.useMemo(() => {
        const sides = [-130, 130];
        const countPerSide = 25;
        const result = [];

        for (const x of sides) {
            for (let i = 0; i < countPerSide; i++) {
                const z = (i / countPerSide) * 440 - 220;
                const width = 15 + Math.random() * 15;
                const depth = 20 + Math.random() * 20;
                const height = 30 + Math.random() * 80;
                const type = Math.random() > 0.5 ? 'glass' : 'stone';
                
                result.push({
                    id: `${x}-${i}`,
                    position: [x, height / 2, z] as [number, number, number],
                    args: [width, height, depth] as [number, number, number],
                    color: type === 'glass' ? '#2c3e50' : '#7f8c8d',
                    metalness: type === 'glass' ? 0.9 : 0.2,
                    roughness: type === 'glass' ? 0.1 : 0.8,
                });
            }
        }
        return result;
    }, []);

    return (
        <group>
            {buildings.map((b) => (
                <mesh key={b.id} position={b.position}>
                    <boxGeometry args={b.args} />
                    <meshStandardMaterial 
                        color={b.color} 
                        metalness={b.metalness} 
                        roughness={b.roughness} 
                    />
                    {/* Window Grid Effect (Simplified) */}
                    <mesh position={[0, 0, b.args[2] / 2 + 0.1]}>
                        <planeGeometry args={[b.args[0] * 0.8, b.args[1] * 0.8]} />
                        <meshBasicMaterial color="#ffffff" transparent opacity={0.05} />
                    </mesh>
                </mesh>
            ))}
        </group>
    );
});

export const SquareEnvironment: React.FC<SquareEnvironmentProps> = ({ 
    participants, 
    localParticipant, 
    onMove,
    onNameChange
}) => {
    const floorRef = useRef<THREE.Mesh>(null);
    const [isNearGate, setIsNearGate] = useState(false);

    useFrame(() => {
        if (!localParticipant.position) return;
        const dist = Math.sqrt(
            Math.pow(localParticipant.position[0] - 0, 2) + 
            Math.pow(localParticipant.position[2] - (-120), 2)
        );
        if (dist < 15 && !isNearGate) setIsNearGate(true);
        if (dist > 20 && isNearGate) setIsNearGate(false);
    });

    const handleFloorDoubleClick = (e: any) => {
        e.stopPropagation();
        if (e.point) {
            onMove([e.point.x, 0, e.point.z]);
        }
    };

    return (
        <group>
            {/* Environment Settings */}
            <Sky sunPosition={[100, 20, 100]} />
            <Environment preset="sunset" />
            <ambientLight intensity={0.5} />
            <pointLight position={[50, 50, 50]} intensity={1.5} />
            <directionalLight 
                position={[10, 20, 10]} 
                intensity={1} 
                castShadow 
                shadow-mapSize={[2048, 2048]} 
            />

            {/* Landmarks - Spread further apart, but slightly reduced distance between statues */}
            <StatueAdmiral position={[0, 0, 50]} />
            <Suspense fallback={<StatueKingProcedural position={[0, 0, 0]} />}>
                <SejongModel position={[0, 0, 0]} />
            </Suspense>
            <Suspense fallback={<GyeongbokgungGateProcedural position={[0, 0, -120]} isNear={isNearGate} />}>
                <GwanghwamunModel position={[0, 0, -120]} />
            </Suspense>

            {/* Surrounding City Skyline */}
            <SurroundingCity />

            {/* Gyeongbokgung Palace Complex (Behind Gwanghwamun) */}
            <GyeongbokgungPalace />


            {/* Main Plaza Floor */}
            <mesh 
                ref={floorRef}
                rotation={[-Math.PI / 2, 0, 0]} 
                position={[0, -0.01, 0]} 
                onDoubleClick={handleFloorDoubleClick}
                receiveShadow
            >
                <planeGeometry args={[200, 800]} />
                <meshStandardMaterial 
                    color="#1a1a1a"
                    roughness={0.9}
                    metalness={0.1}
                />
            </mesh>

            {/* Grid for Scale - Restored */}
            <gridHelper args={[200, 40, "#333", "#222"]} position={[0, 0.001, 0]} />


            {/* Participants */}
            {participants.map((p) => (
                <AvatarModel 
                    key={p.id}
                    position={p.position}
                    name={p.name}
                    color={p.color}
                    chatMessage={p.chatMessage}
                    chatTime={p.chatTime}
                />
            ))}

            {/* Local Participant */}
            <AvatarModel 
                isLocal
                position={localParticipant.position}
                name={localParticipant.name}
                color={localParticipant.color}
                onNameChange={onNameChange}
                chatMessage={localParticipant.chatMessage}
                chatTime={localParticipant.chatTime}
            />

            <ContactShadows 
                position={[0, 0, 0]} 
                opacity={0.4} 
                scale={100} 
                blur={2} 
                far={10} 
                resolution={256} 
                color="#000000" 
            />
        </group>
    );
};
