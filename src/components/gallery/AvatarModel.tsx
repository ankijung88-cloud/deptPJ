import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface AvatarModelProps {
    position?: [number, number, number];
    name: string;
    color?: string;
    isLocal?: boolean;
    avatarType?: 'premium' | 'modern' | 'classic';
}

export const AvatarModel: React.FC<AvatarModelProps> = ({ 
    position, 
    name, 
    color = '#00D2FF', 
    isLocal = false,
    avatarType = 'premium' 
}) => {
    const meshRef = React.useRef<THREE.Group>(null);

    // Floating animation
    useFrame((state) => {
        if (meshRef.current && position) {
            const speedMultiplier = avatarType === 'premium' ? 1.5 : 1;
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 * speedMultiplier) * 0.05;
            meshRef.current.rotation.y += 0.01;
        }
    });

    const bodyColor = useMemo(() => {
        try {
            return new THREE.Color(color);
        } catch (e) {
            console.warn(`[AvatarModel] Invalid color provided: ${color}. Falling back to default.`);
            return new THREE.Color('#00D2FF');
        }
    }, [color]);

    return (
        <group ref={meshRef} position={position}>
            {/* Name Tag */}
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <Text
                    position={[0, 1.2, 0]}
                    fontSize={0.15}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                >
                    {name} {isLocal ? '(You)' : ''}
                </Text>
            </Float>

            {/* Avatar Body - Stylized Capsule/Person */}
            <mesh position={[0, 0.4, 0]}>
                <capsuleGeometry args={[0.2, 0.6, 4, 16]} />
                <MeshDistortMaterial
                    color={bodyColor}
                    speed={2}
                    distort={0.2}
                    radius={1}
                    metalness={0.8}
                    roughness={0.2}
                    emissive={bodyColor}
                    emissiveIntensity={0.5}
                />
            </mesh>

            {/* Head/Orb */}
            <mesh position={[0, 0.9, 0]}>
                <sphereGeometry args={[0.18, 32, 32]} />
                <meshStandardMaterial
                    color="white"
                    metalness={1}
                    roughness={0}
                    envMapIntensity={1}
                />
            </mesh>

            {/* Glow Ring at base */}
            <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.25, 0.3, 32]} />
                <meshBasicMaterial color={bodyColor} transparent opacity={0.5} side={THREE.DoubleSide} />
            </mesh>
        </group>
    );
};
