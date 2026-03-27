import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TheaterEnvironmentProps {
    accentColor: string;
    isMobile: boolean;
}

const TheaterEnvironment: React.FC<TheaterEnvironmentProps> = ({ accentColor }) => {
    const glowRef = useRef<THREE.Mesh>(null);
    
    // Pulse effect for the glow
    useFrame(({ clock }) => {
        if (glowRef.current) {
            const time = clock.getElapsedTime();
            glowRef.current.scale.setScalar(1 + Math.sin(time * 0.5) * 0.05);
        }
    });

    // Slightly brighter cinematic colors for better 3D definition
    const wallColor = "#0a0a0a"; // Brighter than pure black
    const floorColor = "#080808";

    return (
        <group>
            {/* 1. Main Floor - Connects to bottom of bezel */}
            <mesh rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -15, -15]}>
                <planeGeometry args={[200, 100]} />
                <meshStandardMaterial 
                    color={floorColor} 
                    roughness={0.5} 
                    metalness={0.2}
                />
            </mesh>

            {/* 2. Ceiling - Connects to top of bezel */}
            <mesh rotation={[Math.PI / 2.5, 0, 0]} position={[0, 25, -15]}>
                <planeGeometry args={[200, 100]} />
                <meshStandardMaterial 
                    color={wallColor} 
                    roughness={0.8} 
                    metalness={0.1}
                />
            </mesh>

            {/* 3. Left Wall - Angled to screen corner */}
            <mesh position={[-45, 5, -15]} rotation={[0, Math.PI / 3, 0]}>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color={wallColor} roughness={0.7} />
            </mesh>

            {/* 4. Right Wall - Angled to screen corner */}
            <mesh position={[45, 5, -15]} rotation={[0, -Math.PI / 3, 0]}>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color={wallColor} roughness={0.7} />
            </mesh>

            {/* 5. Front Wall (Bezel around screen) */}
            <mesh position={[0, 5, -30]}>
                <planeGeometry args={[100, 60]} />
                <meshStandardMaterial color={wallColor} roughness={0.9} />
            </mesh>

            {/* Screen Glow Halo */}
            <mesh ref={glowRef} position={[0, 5, -25.5]}>
                <planeGeometry args={[55, 32]} />
                <meshBasicMaterial 
                    color={accentColor} 
                    transparent={true} 
                    opacity={0.15} 
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Lighting - Substantial Screen Glow */}
            <rectAreaLight
                width={50}
                height={30}
                intensity={20}
                color={accentColor}
                position={[0, 5, -24.8]}
                rotation={[0, Math.PI, 0]} 
            />

            {/* Space Lighting */}
            <ambientLight intensity={0.05} />
            <pointLight 
                position={[0, 5, -10]} 
                intensity={3} 
                color={accentColor} 
                distance={60} 
                decay={2}
            />
            
            <pointLight 
                position={[0, -10, 0]} 
                intensity={2} 
                color={accentColor} 
                distance={50} 
                decay={1.5}
            />

            {/* Subdued corner glows */}
            <spotLight
                position={[-40, 25, -20]}
                angle={0.5}
                penumbra={1}
                intensity={1}
                color={accentColor}
                target-position={[-22.5, 5, -25]}
            />
            <spotLight
                position={[40, 25, -20]}
                angle={0.5}
                penumbra={1}
                intensity={1}
                color={accentColor}
                target-position={[22.5, 5, -25]}
            />
        </group>
    );
};

export default TheaterEnvironment;
