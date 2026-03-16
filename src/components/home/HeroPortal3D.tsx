import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MotionValue } from 'framer-motion';

interface ParticleProps {
    count: number;
    velocity: MotionValue<number>;
}

const OBANGSAEK = [
    new THREE.Color("#00F2FF"), // Blue (East) - Bright Neon
    new THREE.Color("#FFFFFF"), // White (West)
    new THREE.Color("#FF3B30"), // Red (South) - Vibrant
    new THREE.Color("#4A4A4A"), // Black (North) - Dark Grey for visibility
    new THREE.Color("#FFD700")  // Yellow (Center) - Bright Gold
];

const StarPortal: React.FC<ParticleProps> = ({ count, velocity }) => {
    const points = useRef<THREE.Points>(null);
    const lineRef = useRef<THREE.LineSegments>(null);
    const groupRef = useRef<THREE.Group>(null);

    // Create particles, streak lines, and their colors
    const { pos, linePos, colors, lineColors } = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const linePos = new Float32Array(count * 6);
        const colors = new Float32Array(count * 3);
        const lineColors = new Float32Array(count * 6);

        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const r = Math.random() * 8 + 2;
            const z = Math.random() * -100;

            const i3 = i * 3;
            pos[i3] = Math.cos(theta) * r;
            pos[i3 + 1] = Math.sin(theta) * r;
            pos[i3 + 2] = z;

            // Pick a random Obangsaek color
            const color = OBANGSAEK[Math.floor(Math.random() * OBANGSAEK.length)];
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;

            // Line segment (streak)
            const i6 = i * 6;
            linePos[i6] = pos[i3];
            linePos[i6 + 1] = pos[i3 + 1];
            linePos[i6 + 2] = z;
            linePos[i6 + 3] = pos[i3];
            linePos[i6 + 4] = pos[i3 + 1];
            linePos[i6 + 5] = z - 2;

            // Line colors (both points of the segment get the same color)
            lineColors[i6] = color.r;
            lineColors[i6 + 1] = color.g;
            lineColors[i6 + 2] = color.b;
            lineColors[i6 + 3] = color.r;
            lineColors[i6 + 4] = color.g;
            lineColors[i6 + 5] = color.b;
        }
        return { pos, linePos, colors, lineColors };
    }, [count]);

    useFrame((state, delta) => {
        if (!points.current || !lineRef.current || !groupRef.current) return;

        const positions = points.current.geometry.attributes.position.array as Float32Array;
        const linePositions = lineRef.current.geometry.attributes.position.array as Float32Array;
        const currentVelocity = velocity.get();
        const speedMultiplier = currentVelocity * 25;

        groupRef.current.rotation.z += delta * 0.05;
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const i6 = i * 6;

            const move = delta * speedMultiplier;
            positions[i3 + 2] += move;

            linePositions[i6 + 2] = positions[i3 + 2];
            linePositions[i6 + 5] = positions[i3 + 2] - (currentVelocity * 0.3 + 0.5);

            if (positions[i3 + 2] > 10) {
                positions[i3 + 2] = -100;
                linePositions[i6 + 2] = -100;
                linePositions[i6 + 5] = -101;
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
                </bufferGeometry>
                <pointsMaterial
                    size={0.15}
                    vertexColors
                    transparent
                    opacity={0.8}
                    sizeAttenuation={true}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </points>
            <lineSegments ref={lineRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={linePos.length / 3} array={linePos} itemSize={3} />
                    <bufferAttribute attach="attributes-color" count={lineColors.length / 3} array={lineColors} itemSize={3} />
                </bufferGeometry>
                <lineBasicMaterial vertexColors transparent opacity={0.4} blending={THREE.AdditiveBlending} />
            </lineSegments>
        </group>
    );
};

export const HeroPortal3D: React.FC<{ velocity: MotionValue<number> }> = ({ velocity }) => {
    return (
        <div className="absolute inset-0 z-0 bg-transparent">
            <Canvas gl={{ alpha: true, antialias: true }} camera={{ position: [0, 0, 5], fov: 75 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[0, 0, 0]} intensity={2.5} color="#FFD700" />
                <StarPortal count={1500} velocity={velocity} />
            </Canvas>
        </div>
    );
};
