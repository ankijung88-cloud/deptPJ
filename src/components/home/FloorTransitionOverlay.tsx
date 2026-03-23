import React, { useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { getLocalizedText } from '../../utils/i18nUtils';
import { useTranslation } from 'react-i18next';

interface FloorTransitionOverlayProps {
    floorNumber: number;
    floorTitle: string;
    subcategories?: any[];
    onComplete: () => void;
}

const getSafeString = (text: any, language: string) => {
    if (!text) return '';
    if (typeof text === 'string') return text;
    if (typeof text === 'object') {
        const localized = getLocalizedText(text, language);
        if (typeof localized === 'string') return localized;
        return text.ko || text.en || '';
    }
    return String(text);
};

// --- Arched Door Panel with Integrated Text ---
const ArchedDoorPanel = ({ side, progress, xOffset }: { 
    side: 'left' | 'right', progress: number, xOffset: number
}) => {
    // Only start opening after the initial information stage (progress > 0)
    const animVal = Math.max(0, progress);
    const eased = 1 - Math.pow(1 - animVal, 5); // Quintic ease-out for better momentum
    const opacity = 1 - Math.pow(Math.max(0, (animVal - 0.7) * 3.3), 2);
    
    const w = 13.1; const h = 24; const r = 13.1; 
    const angle = side === 'left' ? Math.PI / 1.5 * eased : -Math.PI / 1.5 * eased;
    
    const doorShape = useMemo(() => {
        const s = new THREE.Shape();
        if (side === 'left') {
            s.moveTo(0, 0); s.lineTo(w, 0); s.lineTo(w, h + r); 
            s.absarc(w, h, r, Math.PI / 2, Math.PI, false); s.lineTo(0, 0);
        } else {
            s.moveTo(0, 0); s.lineTo(-w, 0); s.lineTo(-w, h + r); 
            s.absarc(-w, h, r, Math.PI / 2, 0, true); s.lineTo(0, 0);
        }
        return s;
    }, [w, h, r, side]);

    // Gwanghwamun Iconic Studs, Knocker & Wood Grain (Stabilized version)
    const decorations = useMemo(() => {
        const deco = [];
        // Procedural Wood Grain Lines (Traditional Korean Woodwork) - STABILIZED
        const grainCount = 20;
        for (let i = 0; i < grainCount; i++) {
            const xPos = side === 'left' ? (i / grainCount) * w : -(i / grainCount) * w;
            // Use bit-wise or fixed logic for 'pseudo-random' stability instead of Math.random
            const grainWidth = 0.08 + ((i * 13) % 7) / 50; 
            const grainShift = ((i * 7) % 11) / 10;
            const grainH = h + r;
            deco.push(
                <mesh key={`grain-${i}`} position={[xPos + (side === 'left' ? grainShift : -grainShift), (grainH / 2) - 15, 1.05]}>
                    <boxGeometry args={[grainWidth, grainH, 0.02]} />
                    <meshStandardMaterial color="#3A0000" transparent opacity={opacity * 0.15} />
                </mesh>
            );
        }
        // Studs (Golden circles)
        const rows = 12; const cols = 5;
        for(let row = 0; row < rows; row++) {
            for(let col = 0; col < cols; col++) {
                const xPos = side === 'left' ? (col + 0.5) * (w/cols) : -(col + 0.5) * (w/cols);
                const yPos = (row + 1) * (h/rows) - 15;
                if (yPos < h-2) {
                    deco.push(
                        <mesh key={`stud-${row}-${col}`} position={[xPos, yPos, 1.1]}>
                            <sphereGeometry args={[0.22, 16, 16]} />
                            <meshStandardMaterial color="#D4AF37" metalness={0.8} roughness={0.2} transparent opacity={opacity} />
                        </mesh>
                    );
                }
            }
        }
        // Traditional Iron Ring Knocker (Mungori)
        const knockerX = side === 'left' ? w * 0.75 : -w * 0.75;
        deco.push(
            <group key="knocker" position={[knockerX, 0, 1.1]}>
                <mesh position={[0, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
                    <cylinderGeometry args={[0.8, 0.9, 0.4, 32]} />
                    <meshStandardMaterial color="#2A2A2A" metalness={0.9} roughness={0.1} transparent opacity={opacity} />
                </mesh>
                <mesh position={[0,-1.2, 0.2]} rotation={[Math.PI/2, 0, 0]}>
                    <torusGeometry args={[1.2, 0.25, 16, 64]} />
                    <meshStandardMaterial color="#3A3A3A" metalness={0.9} roughness={0.1} transparent opacity={opacity} />
                </mesh>
            </group>
        );
        return deco;
    }, [side, w, h, opacity, r]);

    return (
        <group position={[xOffset + (side === 'left' ? -13.1 : 13.1), -18, 5]} rotation={[0, angle, 0]}>
            <mesh position={[0, 0, 0]}>
                <extrudeGeometry args={[doorShape, { depth: 1.0, bevelEnabled: true, bevelThickness: 0.3, bevelSize: 0.3 }]} />
                <meshStandardMaterial color="#721111" roughness={0.4} metalness={0.2} transparent opacity={opacity} />
            </mesh>
            {decorations}
        </group>
    );
};

// --- 3D Stone Block Wall with Depth ---
const GateWall = ({ progress }: { progress: number }) => {
    const animVal = Math.max(0, progress);
    // Wall becomes more transparent earlier to reveal the space behind
    const opacity = 1 - Math.pow(Math.max(0, (animVal - 0.3) * 1.5), 2);
    const wallDepth = 12;
    
    const wallShape = useMemo(() => {
        const s = new THREE.Shape();
        s.moveTo(-180, -80); s.lineTo(180, -80); s.lineTo(180, 120); s.lineTo(-180, 120); s.lineTo(-180, -80);
        const hole = new THREE.Path();
        const w = 13.5; const h = 24; const r = 13.5; 
        hole.moveTo(-w, -18); hole.lineTo(w, -18); hole.lineTo(w, h - 18);
        hole.absarc(0, h - 18, r, 0, Math.PI, false); hole.lineTo(-w, -18);
        s.holes.push(hole);
        return s;
    }, []);

    const stones = useMemo(() => {
        const blocks = [];
        // Granite texture lines
        for(let y = -80; y < 120; y += 12) {
            const isCenterArea = y > -20 && y < 40;
            if (!isCenterArea) {
                blocks.push(<mesh key={`hl-${y}`} position={[0, y, wallDepth + 0.1]}><boxGeometry args={[360, 0.6, 0.1]} /><meshStandardMaterial color="#4A4540" transparent opacity={opacity * 0.3} /></mesh>);
            } else {
                blocks.push(<mesh key={`hl-off-${y}`} position={[-100, y, wallDepth + 0.1]}><boxGeometry args={[160, 0.6, 0.1]} /><meshStandardMaterial color="#4A4540" transparent opacity={opacity * 0.3} /></mesh>);
                blocks.push(<mesh key={`hr-off-${y}`} position={[100, y, wallDepth + 0.1]}><boxGeometry args={[160, 0.6, 0.1]} /><meshStandardMaterial color="#4A4540" transparent opacity={opacity * 0.3} /></mesh>);
            }
            // Vertical cracks
            for(let x = -150; x < 150; x += 30) {
                if (Math.abs(x) > 20) {
                    blocks.push(<mesh key={`v-${x}-${y}`} position={[x + (y%24===0?15:0), y+6, wallDepth + 0.1]}><boxGeometry args={[0.5, 12, 0.1]} /><meshStandardMaterial color="#3A3530" transparent opacity={opacity * 0.2} /></mesh>);
                }
            }
        }
        return blocks;
    }, [opacity, wallDepth]);

    return (
        <group position={[0, 0, 0]}>
            <mesh>
                <extrudeGeometry args={[wallShape, { depth: wallDepth, bevelEnabled: true, bevelThickness: 0.5, bevelSize: 0.5 }]} />
                <meshStandardMaterial color="#A8A59E" roughness={1.0} transparent opacity={opacity} />
            </mesh>
            {stones}
        </group>
    );
};

// Scene wrapper
const TransitionScene = ({ progress }: any) => {
    const animVal = Math.max(0, progress);
    const walkStrength = Math.min(1, animVal * 1.5);
    const camZ = 70 - (walkStrength * 75); // Smoother move-through
    const camY = 10 + (walkStrength * 2);

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, camY, camZ]} fov={45} />
            <group scale={[1.3, 1.3, 1.3]} position={[0, 8, 0]}>
                <GateWall progress={progress} />
                <ArchedDoorPanel side="left" progress={progress} xOffset={0} />
                <ArchedDoorPanel side="right" progress={progress} xOffset={0} />
            </group>
            <ambientLight intensity={1.5} />
            <pointLight position={[0, 30, 40]} intensity={25 * (1 - Math.pow(animVal, 2))} color="#FFFAF0" />
            <directionalLight position={[10, 50, 20]} intensity={4 * (1 - Math.pow(animVal, 2))} color="#FFD700" />
        </>
    );
};

export const FloorTransitionOverlay: React.FC<FloorTransitionOverlayProps> = ({
    floorNumber, floorTitle, onComplete
}) => {
    const { i18n } = useTranslation();
    const [animProgress, setAnimProgress] = useState(0);

    const safeTitle = getSafeString(floorTitle, i18n.language);

    useEffect(() => {
        let raf: number;
        // Start the transition sequence much faster to avoid "stuck" feeling
        const timer = setTimeout(() => {
            const start = Date.now();
            const infoDuration = 1200; // 1.2s for static text info
            const animDuration = 6500;  // 6.5s for door opening
            
            const update = () => {
                const elapsed = Date.now() - start;
                
                if (elapsed < infoDuration) {
                    // Stay at 'closed door' state (animProgress <= 0)
                    setAnimProgress(-0.15 + (elapsed / infoDuration) * 0.15);
                } else {
                    // Moving state (animProgress > 0)
                    const p = Math.min(1, (elapsed - infoDuration) / animDuration);
                    setAnimProgress(p);
                    // ACCELERATED HANDOVER: Quintic easing means at p=0.45, doors are 95% open!
                    // Call onComplete now to unmount the transition layer and handover interaction instantly.
                    if (p >= 0.45) onComplete(); 
                }
                
                if (animProgress < 1) raf = requestAnimationFrame(update);
            };
            raf = requestAnimationFrame(update);
        }, 200);
        
        return () => {
            clearTimeout(timer);
            if (raf) cancelAnimationFrame(raf);
        };
    }, [onComplete]);

    return (
        <AnimatePresence mode="wait">
            <motion.div 
                key="overlay" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0, transition: { duration: 0 } }} // INSTANT EXIT
                className="fixed inset-0 z-[10000] overflow-hidden select-none flex items-center justify-center pointer-events-none"
            >
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                    <motion.div 
                        className="absolute inset-0 z-0 bg-[#0A0D17]"
                        animate={{ 
                            opacity: (1 - Math.min(1, animProgress * 4.0)),
                            pointerEvents: animProgress > 0.05 ? 'none' : 'auto' // Kill blocks early
                        }} 
                        transition={{ duration: 0.5 }}
                    />
                    
                    {/* Unified Loading & Information Layer (Overlays 3D) */}
                    <AnimatePresence>
                        {animProgress <= 0.05 && (
                            <motion.div 
                                key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 pointer-events-none"
                            >
                                <div className="text-[12vw] font-black text-[#00FFC2]/20 italic leading-none">{floorNumber}F</div>
                                <h2 className="text-5xl font-black text-white uppercase tracking-[0.2em] mb-4">
                                    {safeTitle}
                                </h2>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* 3D Scene - Rendered immediately for smoothness */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-10">
                        <React.Suspense fallback={
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <div className="text-[12vw] font-black text-[#00FFC2]/10 italic leading-none">{floorNumber}F</div>
                                <h2 className="text-5xl font-black text-white uppercase tracking-[0.2em] mb-4">
                                    {safeTitle}
                                </h2>
                                <p className="text-[#00FFC2] tracking-[0.3em] font-medium animate-pulse">PREPARING 3D GATE...</p>
                            </div>
                        }>
                            <Canvas flat gl={{ alpha: true }}>
                                <TransitionScene progress={animProgress} floorNumber={floorNumber} floorTitle={safeTitle} />
                            </Canvas>
                        </React.Suspense>
                    </motion.div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
