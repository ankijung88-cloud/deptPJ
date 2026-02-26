import React, { useRef, useMemo, useState, Suspense } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useMousePosition } from "../../hooks/useMousePosition";

interface TrailParticle {
    x: number;
    y: number;
    z: number;
    age: number;
    maxAge: number;
    speedX: number;
    speedY: number;
    textureIndex: number;
    active: boolean;
    size: number;
}

function TrailParticles({ mousePos }: { mousePos: React.MutableRefObject<{ x: number; y: number }> }) {
    const count = 300;
    const iconCount = 9;

    // Attempting to load assets copied from the referenced project
    const iconPaths = Array.from({ length: 9 }, (_, i) => `/assets/${i + 1}.png`);

    const textures = useLoader(THREE.TextureLoader, iconPaths);

    const [particles] = useState<TrailParticle[]>(() => {
        const temp: TrailParticle[] = [];
        for (let i = 0; i < count; i++) {
            temp.push({
                x: 0,
                y: 0,
                z: 0,
                age: 0,
                maxAge: 1.5 + Math.random() * 2.5,
                speedX: (Math.random() - 0.5) * 0.02,
                speedY: (Math.random() - 0.5) * 0.02,
                textureIndex: Math.floor(Math.random() * iconCount),
                active: false,
                size: (0.5 + Math.random() * 1.5) * 0.25,
            });
        }
        return temp;
    });

    const meshRefs = useRef<(THREE.InstancedMesh | null)[]>([]);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const { viewport } = useThree();
    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame(() => {
        const currentMouseX = mousePos.current.x;
        const currentMouseY = mousePos.current.y;

        const dist = Math.sqrt(
            Math.pow(currentMouseX - lastMousePos.current.x, 2) +
            Math.pow(currentMouseY - lastMousePos.current.y, 2)
        );

        if (dist > 0.002) {
            for (let k = 0; k < 2; k++) {
                const inactive = particles.find((p) => !p.active);
                if (inactive) {
                    inactive.active = true;
                    // Position mapping logic from normalized space
                    inactive.x = currentMouseX * (viewport.width / 2) + (Math.random() - 0.5) * 0.3;
                    inactive.y = -currentMouseY * (viewport.height / 2) + (Math.random() - 0.5) * 0.3;
                    inactive.z = 1 + Math.random();
                    inactive.age = 0;
                    inactive.textureIndex = Math.floor(Math.random() * iconCount);
                }
            }
            lastMousePos.current = { x: currentMouseX, y: currentMouseY };
        }

        const counters = new Array(iconCount).fill(0);

        for (let i = 0; i < count; i++) {
            const p = particles[i];
            const ti = p.textureIndex;

            if (p.active) {
                p.age += 0.016;
                p.x += p.speedX;
                p.y += p.speedY;

                if (p.age >= p.maxAge) {
                    p.active = false;
                }
            }

            if (p.active && meshRefs.current[ti]) {
                const mesh = meshRefs.current[ti];
                const instanceId = counters[ti];

                dummy.position.set(p.x, p.y, p.z);

                const scaleProgression = Math.max(0, 1 - (p.age / p.maxAge));
                const currentSize = p.size * scaleProgression;

                dummy.scale.set(currentSize, currentSize, currentSize);
                dummy.rotation.z = p.age * 0.5;
                dummy.updateMatrix();

                mesh!.setMatrixAt(instanceId, dummy.matrix);
                counters[ti]++;
            }
        }

        for (let ti = 0; ti < iconCount; ti++) {
            const mesh = meshRefs.current[ti];
            if (mesh) {
                mesh.count = counters[ti];
                mesh.instanceMatrix.needsUpdate = true;
            }
        }
    });

    return (
        <>
            {textures.map((tex: THREE.Texture, idx: number) => (
                <instancedMesh
                    key={idx}
                    ref={(el) => {
                        meshRefs.current[idx] = el;
                    }}
                    args={[undefined, undefined, count]}
                >
                    <planeGeometry args={[1, 1]} />
                    <meshBasicMaterial
                        map={tex}
                        transparent
                        depthWrite={false}
                        alphaTest={0.01}
                        blending={THREE.NormalBlending}
                    />
                </instancedMesh>
            ))}
        </>
    );
}

// NOTE: Fixed inset-0 and pointer-events-none ensures it sits overlaid globally
// but allows all clicks to fall through. z-0 keeps it behind modals but above the 
// standard document background.
export const MouseTrail3D: React.FC = () => {
    const mousePos = useMousePosition();

    return (
        <div className="fixed inset-0 pointer-events-none z-40">
            <Canvas style={{ pointerEvents: 'none' }} camera={{ position: [0, 0, 8], fov: 60 }} gl={{ alpha: true }}>
                <ambientLight intensity={0.4} />
                <Suspense fallback={null}>
                    <TrailParticles mousePos={mousePos} />
                </Suspense>
            </Canvas>
        </div>
    );
};
