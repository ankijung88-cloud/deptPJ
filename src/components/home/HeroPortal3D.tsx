import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MotionValue } from 'framer-motion';

interface ParticleProps {
    count: number;
    velocity: MotionValue<number>;
}

// Heritage-inspired Palette (Ivory & Ink compatible)
const LUMINOUS_PALETTE = [
    new THREE.Color("#171717"), // Ink
    new THREE.Color("#4F6D5B"), // Mugwort
    new THREE.Color("#1A2944"), // Navy
    new THREE.Color("#8B7355"), // Antique Gold
    new THREE.Color("#2F4F4F"), // Dark Slate
];

const StarPortal: React.FC<ParticleProps> = ({ count, velocity }) => {
    const points = useRef<THREE.Points>(null);
    const lineRef = useRef<THREE.LineSegments>(null);
    const groupRef = useRef<THREE.Group>(null);

    // Create a "Sparkle" texture for a sharp, tech-like look (Avoids the 'mold' feel)
    const sparkleTexture = useMemo(() => {
        const size = 128;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d')!;
        
        context.clearRect(0, 0, size, size);
        
        // Draw a cross/sparkle shape
        context.strokeStyle = 'white';
        context.lineWidth = 4;
        
        // Main Glow
        const gradient = context.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, size, size);

        // Sharp horizontal/vertical lines for sparkle effect
        context.beginPath();
        context.moveTo(size/2, 20);
        context.lineTo(size/2, size-20);
        context.moveTo(20, size/2);
        context.lineTo(size-20, size/2);
        
        const lineGradient = context.createLinearGradient(0, 0, size, size);
        lineGradient.addColorStop(0, 'rgba(255,255,255,0)');
        lineGradient.addColorStop(0.5, 'rgba(255,255,255,0.8)');
        lineGradient.addColorStop(1, 'rgba(255,255,255,0)');
        context.strokeStyle = lineGradient;
        context.stroke();
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }, []);

    // Create particles, streak lines, and their colors
    const { pos, linePos, colors, lineColors, sizes } = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const linePos = new Float32Array(count * 6);
        const colors = new Float32Array(count * 3);
        const lineColors = new Float32Array(count * 6);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const r = Math.random() * 30 + 3; 
            const z = Math.random() * -250; 

            const i3 = i * 3;
            pos[i3] = Math.cos(theta) * r;
            pos[i3 + 1] = Math.sin(theta) * r;
            pos[i3 + 2] = z;

            const color = LUMINOUS_PALETTE[Math.floor(Math.random() * LUMINOUS_PALETTE.length)];
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;

            sizes[i] = Math.random() * 3.0 + 1.0;

            const i6 = i * 6;
            linePos[i6] = pos[i3];
            linePos[i6 + 1] = pos[i3 + 1];
            linePos[i6 + 2] = z;
            linePos[i6 + 3] = pos[i3];
            linePos[i6 + 4] = pos[i3 + 1];
            linePos[i6 + 5] = z - (Math.random() * 15 + 10);

            lineColors[i6] = color.r;
            lineColors[i6 + 1] = color.g;
            lineColors[i6 + 2] = color.b;
            lineColors[i6 + 3] = color.r * 0.05;
            lineColors[i6 + 4] = color.g * 0.05;
            lineColors[i6 + 5] = color.b * 0.05;
        }
        return { pos, linePos, colors, lineColors, sizes };
    }, [count]);

    useFrame((state, delta) => {
        if (!points.current || !lineRef.current || !groupRef.current) return;

        const positions = points.current.geometry.attributes.position.array as Float32Array;
        const linePositions = lineRef.current.geometry.attributes.position.array as Float32Array;
        const currentVelocity = velocity.get();
        const speedMultiplier = currentVelocity * 15;

        groupRef.current.rotation.z += delta * 0.015;
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.04;

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const i6 = i * 6;

            const move = delta * speedMultiplier;
            positions[i3 + 2] += move;

            linePositions[i6 + 2] = positions[i3 + 2];
            linePositions[i6 + 5] = positions[i3 + 2] - (currentVelocity * 2.0 + 1.0);

            if (positions[i3 + 2] > 20) {
                positions[i3 + 2] = -250;
                linePositions[i6 + 2] = -250;
                linePositions[i6 + 5] = -260;
            }
        }
        points.current.geometry.attributes.position.needsUpdate = true;
        lineRef.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <group ref={groupRef}>
            <points ref={points}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={pos.length / 3} array={pos} itemSize={3} />
                    <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
                    <bufferAttribute attach="attributes-size" count={sizes.length} array={sizes} itemSize={1} />
                </bufferGeometry>
                <pointsMaterial
                    size={1.8}
                    vertexColors
                    transparent
                    opacity={0.8}
                    map={sparkleTexture}
                    sizeAttenuation={true}
                    blending={THREE.NormalBlending}
                    depthWrite={false}
                />
            </points>
            <lineSegments ref={lineRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={linePos.length / 3} array={linePos} itemSize={3} />
                    <bufferAttribute attach="attributes-color" count={lineColors.length / 3} array={lineColors} itemSize={3} />
                </bufferGeometry>
                <lineBasicMaterial vertexColors transparent opacity={0.2} blending={THREE.NormalBlending} depthWrite={false} />
            </lineSegments>
        </group>
    );
};

export const HeroPortal3D: React.FC<{ velocity: MotionValue<number> }> = ({ velocity }) => {
    return (
        <div className="absolute inset-0 z-0 bg-transparent">
            <Canvas dpr={[1, 2]} gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }} camera={{ position: [0, 0, 5], fov: 75 }}>
                <ambientLight intensity={0.8} color="#FDFBF7" />
                <pointLight position={[0, 0, 10]} intensity={2.0} color="#FDFBF7" />
                <StarPortal count={1500} velocity={velocity} />
            </Canvas>
        </div>
    );
};


