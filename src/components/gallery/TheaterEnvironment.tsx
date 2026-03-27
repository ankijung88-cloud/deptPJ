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

    // Deep cinematic colors
    const wallColor = "#020202";
    const floorColor = "#010101";

    return (
        <group>
            {/* Floor - slight metallic to catch reflections */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -10, -20]}>
                <planeGeometry args={[200, 200]} />
                <meshStandardMaterial 
                    color={floorColor} 
                    roughness={0.6} 
                    metalness={0.1}
                />
            </mesh>

            {/* Side Walls */}
            <mesh position={[-40, 0, -20]} rotation={[0, Math.PI / 2, 0]}>
                <planeGeometry args={[200, 100]} />
                <meshStandardMaterial color={wallColor} roughness={0.8} />
            </mesh>
            <mesh position={[40, 0, -20]} rotation={[0, -Math.PI / 2, 0]}>
                <planeGeometry args={[200, 100]} />
                <meshStandardMaterial color={wallColor} roughness={0.8} />
            </mesh>

            {/* Ceiling */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 40, -20]}>
                <planeGeometry args={[200, 200]} />
                <meshStandardMaterial color={wallColor} roughness={0.8} />
            </mesh>

            {/* Front Wall (around screen) - Creating a bezel feel */}
            <mesh position={[0, 0, -35]}>
                <planeGeometry args={[300, 200]} />
                <meshStandardMaterial color={wallColor} roughness={0.9} />
            </mesh>

            {/* Screen Glow Halo - This creates the visual "bleed" outside the screen */}
            <mesh ref={glowRef} position={[0, 5, -25.5]}>
                <planeGeometry args={[55, 32]} />
                <meshBasicMaterial 
                    color={accentColor} 
                    transparent={true} 
                    opacity={0.1} 
                    side={THREE.DoubleSide}
                />
            </mesh>
            
            <mesh position={[0, 5, -25.2]}>
                <planeGeometry args={[48, 28]} />
                <meshBasicMaterial 
                    color={accentColor} 
                    transparent={true} 
                    opacity={0.05} 
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Lighting - Main screen glow light */}
            <rectAreaLight
                width={45}
                height={25}
                intensity={15}
                color={accentColor}
                position={[0, 5, -24.8]}
                rotation={[0, Math.PI, 0]} // Casting BACK onto the front wall
            />

            {/* Ambient and defining lights */}
            <ambientLight intensity={0.02} />
            <pointLight 
                position={[0, 5, -20]} 
                intensity={2} 
                color={accentColor} 
                distance={50} 
                decay={2}
            />
            
            <pointLight 
                position={[0, -5, -15]} 
                intensity={1} 
                color={accentColor} 
                distance={40} 
                decay={2}
            />

            {/* Subdued corner glows to define space */}
            <spotLight
                position={[-35, 30, -30]}
                angle={0.4}
                penumbra={1}
                intensity={0.4}
                color={accentColor}
                target-position={[-40, 0, -35]}
            />
            <spotLight
                position={[35, 30, -30]}
                angle={0.4}
                penumbra={1}
                intensity={0.4}
                color={accentColor}
                target-position={[40, 0, -35]}
            />
        </group>
    );
};

export default TheaterEnvironment;
