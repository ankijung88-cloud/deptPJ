import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TheaterEnvironmentProps {
    accentColor: string;
    isPlaying: boolean;
}

// Sub-component for Aisle Lights (glowing strips on the floor)
const AisleLights = ({ accentColor, isPlaying }: { accentColor: string, isPlaying: boolean }) => {
    return (
        <group>
            {/* Left Aisle Light */}
            <mesh position={[-25, -5.9, -10]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.3, 40]} />
                <meshStandardMaterial 
                    color={accentColor} 
                    emissive={accentColor} 
                    emissiveIntensity={isPlaying ? 2 : 1.2} 
                    transparent 
                    opacity={0.6}
                />
            </mesh>
            {/* Right Aisle Light */}
            <mesh position={[25, -5.9, -10]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.3, 40]} />
                <meshStandardMaterial 
                    color={accentColor} 
                    emissive={accentColor} 
                    emissiveIntensity={isPlaying ? 2 : 1.2} 
                    transparent 
                    opacity={0.6}
                />
            </mesh>
        </group>
    );
};

// Sub-component for Wall Sconces (decorative lights)
const WallSconce = ({ position, rotation, accentColor, isPlaying }: { position: [number, number, number], rotation: [number, number, number], accentColor: string, isPlaying: boolean }) => {
    const lightRef = useRef<THREE.PointLight>(null);
    
    useFrame(({ clock }) => {
        if (lightRef.current) {
            // Subtle flicker to simulate high-end decorative lighting
            const baseIntensity = isPlaying ? 0.3 : 2;
            lightRef.current.intensity = baseIntensity + Math.sin(clock.getElapsedTime() * 2) * 0.1;
        }
    });

    return (
        <group position={position} rotation={rotation}>
            {/* Sconce Base */}
            <mesh>
                <boxGeometry args={[0.2, 1.5, 0.1]} />
                <meshStandardMaterial color={isPlaying ? "#111" : "#333"} metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Light Source (Visual) */}
            <mesh position={[0, 0, 0.1]}>
                <planeGeometry args={[0.1, 1]} />
                <meshStandardMaterial 
                    color={accentColor} 
                    emissive={accentColor} 
                    emissiveIntensity={isPlaying ? 1 : 4} 
                    transparent 
                    opacity={isPlaying ? 0.5 : 1}
                />
            </mesh>
            {/* Real Light */}
            <pointLight ref={lightRef} intensity={isPlaying ? 0.2 : 1.5} distance={15} color={accentColor} />
        </group>
    );
};

// Sub-component for Cinema Seats
const CinemaSeats = ({ isPlaying }: { isPlaying: boolean }) => {
    if (isPlaying) return null; // Only visible when paused/waiting

    // Create a row of seats
    const renderSeatRow = (rowZ: number, rowY: number, rowScale: number, count: number) => {
        const seats = [];
        const spacing = 4.5 * rowScale;
        const startX = -((count - 1) * spacing) / 2;

        for (let i = 0; i < count; i++) {
            const x = startX + i * spacing;
            seats.push(
                <group key={i} position={[x, rowY, rowZ]} scale={rowScale}>
                    {/* Bottom Cushion - Dark Red contrast */}
                    <mesh position={[0, 0.5, 0]}>
                        <boxGeometry args={[3.8, 0.8, 3]} />
                        <meshStandardMaterial color="#6a1b1b" roughness={0.8} />
                    </mesh>
                    {/* Backrest - Facing the Screen (-Z). Backrest is at +Z side. */}
                    <mesh position={[0, 2.5, 1.2]} rotation={[-0.15, 0, 0]}>
                        <boxGeometry args={[3.8, 4, 0.6]} />
                        <meshStandardMaterial color="#5a1616" roughness={0.9} />
                    </mesh>
                    {/* Armrests */}
                    <mesh position={[-2, 1.8, 0.5]}>
                        <boxGeometry args={[0.4, 0.3, 2.5]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>
                    <mesh position={[2, 1.8, 0.5]}>
                        <boxGeometry args={[0.4, 0.3, 2.5]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>
                    {/* Base/Support */}
                    <mesh position={[0, -0.4, 0]}>
                        <boxGeometry args={[0.5, 1, 0.5]} />
                        <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
                    </mesh>
                </group>
            );
        }
        return seats;
    };

    return (
        <group>
            {/* Row 1: Back row, slightly higher */}
            <group position={[0, 0, 0]}>
                {renderSeatRow(5, -5.8, 0.8, 12)}
            </group>
            {/* Row 2: Middle row */}
            <group position={[0, 0, 0]}>
                {renderSeatRow(12, -6.0, 1.0, 10)}
            </group>
            {/* Row 3: Front row, slightly lower/closer */}
            <group position={[0, 0, 0]}>
                {renderSeatRow(20, -6.1, 1.2, 8)}
            </group>
        </group>
    );
};

const TheaterEnvironment: React.FC<TheaterEnvironmentProps> = ({ accentColor, isPlaying }) => {
    const glowRef = useRef<THREE.Mesh>(null);
    
    // Pulse effect for the screen glow
    useFrame(({ clock }) => {
        if (glowRef.current) {
            const time = clock.getElapsedTime();
            glowRef.current.scale.setScalar(1 + Math.sin(time * 0.5) * 0.05);
        }
    });

    // Create a subtle carpet texture using a canvas pattern
    const carpetTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#111';
            ctx.fillRect(0, 0, 512, 512);
            for (let i = 0; i < 6000; i++) {
                const x = Math.random() * 512;
                const y = Math.random() * 512;
                const size = Math.random() * 1.5;
                ctx.fillStyle = Math.random() > 0.5 ? '#1a1a1a' : '#0a0a0a';
                ctx.fillRect(x, y, size, size);
            }
        }
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(10, 10);
        return texture;
    }, []);

    // Color palette: Differentiating floor and walls for visibility
    const wallColor = isPlaying ? "#0d0d0f" : "#44444a"; 
    const floorColor = isPlaying ? "#0a0a0a" : "#2a2a2f";
    const ceilingColor = isPlaying ? "#08080a" : "#1a1a1e";
    const trimColor = isPlaying ? "#050505" : "#121214";

    const sideWallX = 40; 
    const wallZOffset = 10; 

    return (
        <group>
            {/* 1. Realistic Carpet Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -6, 0]}>
                <planeGeometry args={[200, 200]} />
                <meshStandardMaterial 
                    color={floorColor}
                    map={carpetTexture}
                    roughness={0.9} 
                    metalness={0.05}
                />
            </mesh>

            {/* Cinema Seats - Visible when paused */}
            <CinemaSeats isPlaying={isPlaying} />

            {/* Aisle Lights */}
            <AisleLights accentColor={accentColor} isPlaying={isPlaying} />

            {/* 2. Ceiling */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 20, 0]}>
                <planeGeometry args={[200, 200]} />
                <meshStandardMaterial 
                    color={ceilingColor} 
                    roughness={0.8} 
                    metalness={0.1}
                />
            </mesh>

            {/* 3. Left Wall - Strictly Parallel */}
            <group position={[-sideWallX, 5, wallZOffset]} rotation={[0, Math.PI / 2, 0]}>
                <mesh>
                    <planeGeometry args={[120, 100]} />
                    <meshStandardMaterial color={wallColor} roughness={0.7} />
                </mesh>
                {/* Visual Panel Divisions */}
                {[ -40, -20, 0, 20, 40 ].map((z, i) => (
                    <mesh key={i} position={[0, 0, z]}>
                        <boxGeometry args={[0.2, 100, 2]} />
                        <meshStandardMaterial color={trimColor} roughness={0.5} />
                    </mesh>
                ))}
                {/* Wall Sconces - Restore visibility and usage */}
                <WallSconce position={[0.2, 5, -20]} rotation={[0, -Math.PI/2, 0]} accentColor={accentColor} isPlaying={isPlaying} />
                <WallSconce position={[0.2, 5, 20]} rotation={[0, -Math.PI/2, 0]} accentColor={accentColor} isPlaying={isPlaying} />
            </group>

            {/* 4. Right Wall - Strictly Parallel */}
            <group position={[sideWallX, 5, wallZOffset]} rotation={[0, -Math.PI / 2, 0]}>
                <mesh>
                    <planeGeometry args={[120, 100]} />
                    <meshStandardMaterial color={wallColor} roughness={0.7} />
                </mesh>
                {/* Visual Panel Divisions */}
                {[ -40, -20, 0, 20, 40 ].map((z, i) => (
                    <mesh key={i} position={[0, 0, z]}>
                        <boxGeometry args={[0.2, 100, 2]} />
                        <meshStandardMaterial color={trimColor} roughness={0.5} />
                    </mesh>
                ))}
                {/* Wall Sconces - Restore visibility and usage */}
                <WallSconce position={[-0.2, 5, -20]} rotation={[0, Math.PI/2, 0]} accentColor={accentColor} isPlaying={isPlaying} />
                <WallSconce position={[-0.2, 5, 20]} rotation={[0, Math.PI/2, 0]} accentColor={accentColor} isPlaying={isPlaying} />
            </group>

            {/* 5. Back Wall - Moved safely behind the screen at -25 */}
            <mesh position={[0, 10, -50]}>
                <planeGeometry args={[150, 100]} />
                <meshStandardMaterial color={isPlaying ? "#050505" : "#222226"} roughness={0.9} />
            </mesh>

            {/* Screen Glow Halo - Behind the screen (-25.8) */}
            <mesh ref={glowRef} position={[0, 5, -25.8]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[55, 32]} />
                <meshBasicMaterial 
                    color={accentColor} 
                    transparent={true} 
                    opacity={isPlaying ? 0.15 : 0.05} 
                    side={THREE.DoubleSide}
                />
            </mesh>

            <ambientLight intensity={isPlaying ? 0.1 : 1.5} /> 
            <pointLight 
                position={[0, 15, -10]} 
                intensity={isPlaying ? 2 : 10} 
                color={isPlaying ? accentColor : "#ffffff"} 
                distance={60} 
            />
            {!isPlaying && (
                <pointLight position={[0, 8, 10]} intensity={10} color="#ffffff" distance={80} />
            )}
            
            <rectAreaLight
                width={50}
                height={30}
                intensity={isPlaying ? 20 : 2} 
                color={accentColor}
                position={[0, 5, -24.8]}
                rotation={[0, Math.PI, 0]} 
            />
        </group>
    );
};

export default TheaterEnvironment;
