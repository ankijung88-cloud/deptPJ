import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TheaterEnvironmentProps {
    accentColor: string;
    isMobile: boolean;
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
            const baseIntensity = isPlaying ? 0.3 : 2.5;
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
            <pointLight ref={lightRef} intensity={isPlaying ? 0.2 : 2} distance={15} color={accentColor} />
        </group>
    );
};

// Sub-component for Projector Beam
const ProjectorBeam = ({ accentColor, isPlaying }: { accentColor: string, isPlaying: boolean }) => {
    const beamRef = useRef<THREE.Mesh>(null);
    useFrame(({ clock }) => {
        if (beamRef.current && isPlaying) {
            // Slight jitter to simulate light through dust particles
            beamRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 10) * 0.001;
        }
    });

    if (!isPlaying) return null;

    return (
        <mesh ref={beamRef} position={[0, 15, 20]} rotation={[0.4, 0, 0]}>
            <cylinderGeometry args={[2, 25, 60, 32, 1, true]} />
            <meshBasicMaterial 
                color={accentColor} 
                transparent 
                opacity={0.03} 
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    );
};

const TheaterEnvironment: React.FC<TheaterEnvironmentProps> = ({ accentColor, isMobile, isPlaying }) => {
    const glowRef = useRef<THREE.Mesh>(null);
    
    // Create a subtle carpet texture using a canvas pattern
    const carpetTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            // Dark base
            ctx.fillStyle = '#0a0a0c';
            ctx.fillRect(0, 0, 512, 512);
            // Sparse noise for carpet feel
            for (let i = 0; i < 5000; i++) {
                const x = Math.random() * 512;
                const y = Math.random() * 512;
                const size = Math.random() * 1.5;
                ctx.fillStyle = Math.random() > 0.5 ? '#111' : '#080808';
                ctx.fillRect(x, y, size, size);
            }
        }
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(10, 10);
        return texture;
    }, []);

    // Pulse effect for the screen glow
    useFrame(({ clock }) => {
        if (glowRef.current) {
            const time = clock.getElapsedTime();
            glowRef.current.scale.setScalar(1 + Math.sin(time * 0.5) * 0.05);
        }
    });

    // Dynamic colors based on play state - SIGNIFICANTLY BRIGHTER when paused
    // Using grey tones for clarity as requested
    const wallColor = isPlaying ? "#0d0d0f" : "#4a4a4f"; 
    const floorColor = isPlaying ? "#0a0a0a" : "#3a3a3f";
    const ceilingColor = isPlaying ? "#08080a" : "#2a2a2f";
    const trimColor = isPlaying ? "#050505" : "#18181a";

    return (
        <group>
            {/* 1. Realistic Carpet Floor */}
            <mesh rotation={[-Math.PI / 2.1, 0, 0]} position={[0, -6, 0]}>
                <planeGeometry args={[120, 100]} />
                <meshStandardMaterial 
                    color={floorColor}
                    map={carpetTexture}
                    roughness={0.9} 
                    metalness={0.05}
                />
            </mesh>

            {/* Aisle Lights for floor definition */}
            <AisleLights accentColor={accentColor} isPlaying={isPlaying} />

            {/* 2. Textured Ceiling (Panels) */}
            <mesh rotation={[Math.PI / 2.1, 0, 0]} position={[0, 20, 0]}>
                <planeGeometry args={[120, 100]} />
                <meshStandardMaterial 
                    color={ceilingColor} 
                    roughness={0.8} 
                    metalness={0.1}
                />
            </mesh>

            {/* 3. Left Wall with Acoustic Panels */}
            <group position={[-40, 5, 0]} rotation={[0, Math.PI / 3, 0]}>
                <mesh>
                    <planeGeometry args={[100, 100]} />
                    <meshStandardMaterial color={wallColor} roughness={0.7} />
                </mesh>
                {/* Visual Panel Divisions */}
                {[ -30, -10, 10, 30 ].map((x, i) => (
                    <mesh key={i} position={[x, 0, 0.15]}>
                        <boxGeometry args={[2, 100, 0.2]} />
                        <meshStandardMaterial color={trimColor} roughness={0.5} />
                    </mesh>
                ))}
                {/* Wall Sconces - only bright when paused */}
                <WallSconce position={[-20, 8, 0.3]} rotation={[0, 0, 0]} accentColor={accentColor} isPlaying={isPlaying} />
                <WallSconce position={[20, 8, 0.3]} rotation={[0, 0, 0]} accentColor={accentColor} isPlaying={isPlaying} />
            </group>

            {/* 4. Right Wall with Acoustic Panels */}
            <group position={[40, 5, 0]} rotation={[0, -Math.PI / 3, 0]}>
                <mesh>
                    <planeGeometry args={[100, 100]} />
                    <meshStandardMaterial color={wallColor} roughness={0.7} />
                </mesh>
                {/* Visual Panel Divisions */}
                {[ -30, -10, 10, 30 ].map((x, i) => (
                    <mesh key={i} position={[x, 0, 0.15]}>
                        <boxGeometry args={[2, 100, 0.2]} />
                        <meshStandardMaterial color={trimColor} roughness={0.5} />
                    </mesh>
                ))}
                {/* Wall Sconces - only bright when paused */}
                <WallSconce position={[-20, 8, 0.3]} rotation={[0, 0, 0]} accentColor={accentColor} isPlaying={isPlaying} />
                <WallSconce position={[20, 8, 0.3]} rotation={[0, 0, 0]} accentColor={accentColor} isPlaying={isPlaying} />
            </group>

            {/* 5. Back Wall (behind projector) */}
            <mesh position={[0, 5, -28]}>
                <planeGeometry args={[100, 60]} />
                <meshStandardMaterial color={isPlaying ? "#050505" : "#333338"} roughness={0.9} />
            </mesh>

            {/* Screen Glow Halo */}
            <mesh ref={glowRef} position={[0, 5, -25.8]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[55, 32]} />
                <meshBasicMaterial 
                    color={accentColor} 
                    transparent={true} 
                    opacity={isPlaying ? 0.12 : 0.05} 
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Projector light beam - only when playing */}
            {!isMobile && <ProjectorBeam accentColor={accentColor} isPlaying={isPlaying} />}

            {/* Dynamic atmosphere lights - DRASTICALLY BRIGHTER when paused to reveal architecture */}
            <ambientLight intensity={isPlaying ? 0.05 : 1.5} /> 
            <pointLight 
                position={[0, 15, -10]} 
                intensity={isPlaying ? 1 : 15} 
                color={isPlaying ? accentColor : "#ffffff"} 
                distance={60} 
            />
            {!isPlaying && (
                <>
                    {/* Fill light coming from the "entrance/back" */}
                    <pointLight 
                        position={[0, 5, 10]} 
                        intensity={12} 
                        color="#ffffff" 
                        distance={100} 
                    />
                    {/* Top highlights to distinguish ceiling and walls */}
                    <pointLight position={[0, 18, -10]} intensity={10} color="#ffffff" distance={60} />
                </>
            )}
            
            {/* Lighting - Substantial Screen Glow (Bounce) - Stronger when playing */}
            <rectAreaLight
                width={50}
                height={30}
                intensity={isPlaying ? 15 : 2} 
                color={accentColor}
                position={[0, 5, -24.8]}
                rotation={[0, Math.PI, 0]} 
            />
        </group>
    );
};

export default TheaterEnvironment;
