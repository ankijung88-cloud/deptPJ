import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, MeshDistortMaterial, Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

interface AvatarModelProps {
    position?: [number, number, number];
    name: string;
    color?: string;
    isLocal?: boolean;
    onNameChange?: (name: string) => void;
    avatarType?: 'premium' | 'modern' | 'classic';
    chatMessage?: string;
    chatTime?: number;
}

export const AvatarModel: React.FC<AvatarModelProps> = ({ 
    position, 
    name, 
    color = '#00D2FF', 
    isLocal = false,
    onNameChange,
    avatarType = 'premium',
    chatMessage,
    chatTime
}) => {
    const meshRef = useRef<THREE.Group>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [internalName, setInternalName] = useState(name);
    const [visibleMessage, setVisibleMessage] = useState<string | null>(null);

    useEffect(() => {
        setInternalName(name);
    }, [name]);

    useEffect(() => {
        if (chatMessage && chatMessage.trim()) {
            setVisibleMessage(chatMessage);
            const timer = setTimeout(() => setVisibleMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [chatMessage, chatTime]);

    // Smooth movement and floating animation
    useFrame((state, delta) => {
        if (meshRef.current) {
            // Lerp to target position for smooth movement
            if (position) {
                const target = new THREE.Vector3(...position);
                meshRef.current.position.lerp(target, 10 * delta);
            }

            const speedMultiplier = avatarType === 'premium' ? 1.5 : 1;
            const floatOffset = Math.sin(state.clock.elapsedTime * 2 * speedMultiplier) * 0.05;
            meshRef.current.position.y += floatOffset;
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

    const handleUpdate = () => {
        if (onNameChange) onNameChange(internalName);
        setIsEditing(false);
    };

    return (
        <group 
            ref={meshRef} 
            position={position}
            onPointerOver={() => isLocal && (document.body.style.cursor = 'pointer')}
            onPointerOut={() => isLocal && (document.body.style.cursor = 'default')}
            onClick={(e) => {
                if (isLocal) {
                    e.stopPropagation();
                    setIsEditing(true);
                }
            }}
        >
            {/* Name Tag or Input */}
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                {isEditing ? (
                    <Html position={[0, 1.2, 0]} center distanceFactor={10}>
                        <input 
                            autoFocus
                            value={internalName}
                            onChange={(e) => setInternalName(e.target.value.slice(0, 12))}
                            onBlur={handleUpdate}
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                            style={{
                                background: 'rgba(0, 0, 0, 0.8)',
                                border: '2px solid #FFD700',
                                borderRadius: '8px',
                                padding: '4px 12px',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: '900',
                                fontStyle: 'italic',
                                outline: 'none',
                                width: '120px',
                                textAlign: 'center',
                                boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
                                backdropFilter: 'blur(10px)'
                            }}
                        />
                    </Html>
                ) : (
                    <Text
                        position={[0, 1.2, 0]}
                        fontSize={0.15}
                        color="white"
                        anchorX="center"
                        anchorY="middle"
                    >
                        {name} {isLocal ? '(You)' : ''}
                    </Text>
                )}
            </Float>

            {/* Chat Bubble */}
            <AnimatePresence>
                {visibleMessage && (
                    <Html position={[0, 1.8, 0]} center distanceFactor={10}>
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="bg-white text-black px-4 py-2 rounded-2xl shadow-xl font-bold min-w-[100px] text-center relative pointer-events-none"
                        >
                            {visibleMessage}
                            {/* Speech bubble tail */}
                            <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white" />
                        </motion.div>
                    </Html>
                )}
            </AnimatePresence>

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
