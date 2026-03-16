import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Stars, Float, Edges } from '@react-three/drei';
import * as THREE from 'three';

const BRIGHT_OBANGSAEK = ["#00F2FF", "#FFFFFF", "#FF3B30", "#4A4A4A", "#FFD700"];

const FloatingElements = () => {
    const groupRef = useRef<THREE.Group>(null);
    
    // Create random cubes and segments
    const elements = useMemo(() => {
        return Array.from({ length: 15 }).map((_) => ({
            position: [
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 15 - 5
            ] as [number, number, number],
            rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0] as [number, number, number],
            scale: 0.5 + Math.random() * 1.5,
            speed: 0.1 + Math.random() * 0.2,
            color: BRIGHT_OBANGSAEK[Math.floor(Math.random() * BRIGHT_OBANGSAEK.length)]
        }));
    }, []);

    useFrame((state) => {
        if (!groupRef.current) return;
        
        // Gentle global drift
        groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
        
        // Mouse parallax
        const mouseX = state.mouse.x * 2;
        const mouseY = state.mouse.y * 2;
        groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, -mouseX, 0.05);
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, -mouseY, 0.05);
    });

    return (
        <group ref={groupRef}>
            {elements.map((el, i) => (
                <Float
                    key={i}
                    speed={el.speed * 5}
                    rotationIntensity={2}
                    floatIntensity={2}
                >
                    <mesh position={el.position} rotation={el.rotation} scale={el.scale}>
                        <boxGeometry args={[1, 1, 1]} />
                        <meshStandardMaterial color="#1A2420" transparent opacity={0.6} />
                        <Edges color={el.color} threshold={15} />
                    </mesh>
                </Float>
            ))}
        </group>
    );
};

const InfiniteGrid = () => {
    const gridRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!gridRef.current) return;
        // Subtle movement of the grid
        gridRef.current.position.z = (state.clock.elapsedTime * 0.5) % 4;
    });

    return (
        <group ref={gridRef}>
            {/* Bottom Grid */}
            <gridHelper args={[100, 50, "#00FFC2", "#1A2420"]} position={[0, -8, 0]} rotation={[0, 0, 0]} />
            {/* Top Grid */}
            <gridHelper args={[100, 50, "#00FFC2", "#1A2420"]} position={[0, 8, 0]} rotation={[Math.PI, 0, 0]} />
        </group>
    );
};

export const ArrivalBackground3D: React.FC = () => {
    return (
        <div className="absolute inset-0 z-0 bg-[#0A0D17]">
            <Canvas gl={{ antialias: true, alpha: true }}>
                <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={60} />
                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#00FFC2" />
                <pointLight position={[-10, -10, -10]} intensity={1} color="#FF3B30" />
                
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                
                <Suspense fallback={null}>
                    <InfiniteGrid />
                    <FloatingElements />
                </Suspense>

                {/* Fog for depth */}
                <fog attach="fog" args={["#0A0D17", 5, 25]} />
            </Canvas>
            
            {/* Overlay gradients to blend with UI */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A2420] via-transparent to-[#1A2420]/80 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)] pointer-events-none" />
        </div>
    );
};
