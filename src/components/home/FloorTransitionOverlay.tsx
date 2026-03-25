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

const ArchedDoorPanel = ({ side, progress, xOffset }: { 
    side: 'left' | 'right', progress: number, xOffset: number
}) => {
    const animVal = Math.max(0, progress);
    const eased = 1 - Math.pow(1 - animVal, 5);
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

    const decorations = useMemo(() => {
        const deco = [];
        // Vertical Wood Planks Lines
        const numPlanks = 6;
        for (let i = 1; i <= numPlanks; i++) {
            const xPos = side === 'left' ? i * (w / (numPlanks + 1)) : -i * (w / (numPlanks + 1));
            deco.push(
                <mesh key={`plank-${i}`} position={[xPos, (h + r) / 2, 1.05]}>
                    <boxGeometry args={[0.08, h + r, 0.12]} />
                    <meshStandardMaterial color="#4A1512" roughness={0.9} transparent opacity={opacity * 0.4} />
                </mesh>
            );
        }
        
        // Iron Studs (Black)
        const rows = 11; const cols = 5;
        const arcCenterX = side === 'left' ? w : -w;
        const arcCenterY = h;
        for(let row = 0; row < rows; row++) {
            for(let col = 0; col < cols; col++) {
                const xPos = side === 'left' ? (col + 0.5) * (w/cols) : -(col + 0.5) * (w/cols);
                const yPos = 3 + row * 3.1;
                
                let inside = true;
                if (yPos > h) {
                    const dx = xPos - arcCenterX;
                    const dy = yPos - arcCenterY;
                    if (dx*dx + dy*dy > r*r - 0.5) inside = false;
                }
                
                if (inside) {
                    deco.push(
                        <mesh key={`stud-${row}-${col}`} position={[xPos, yPos, 1.1]}>
                            <sphereGeometry args={[0.25, 12, 12]} />
                            <meshStandardMaterial color="#1A1A1A" metalness={0.6} roughness={0.7} transparent opacity={opacity} />
                        </mesh>
                    );
                }
            }
        }
        
        // Central Iron Handle/Lock Plates
        const isLeft = side === 'left';
        const plateWidth = 2.0;
        const plateHeight = 8.0;
        const plateX = isLeft ? w - plateWidth/2 : -w + plateWidth/2;
        
        // Main Plate
        deco.push(
            <mesh key="handle-plate" position={[plateX, 10, 1.08]}>
                <boxGeometry args={[plateWidth, plateHeight, 0.15]} />
                <meshStandardMaterial color="#222222" metalness={0.7} roughness={0.5} transparent opacity={opacity} />
            </mesh>
        );
        
        // Handle Ring
        const ringX = isLeft ? plateX - 0.3 : plateX + 0.3;
        deco.push(
            <mesh key="handle-ring" position={[ringX, 9, 1.25]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.6, 0.15, 8, 24]} />
                <meshStandardMaterial color="#1F1F1F" metalness={0.8} roughness={0.4} transparent opacity={opacity} />
            </mesh>
        );
        deco.push(
            <mesh key="handle-holder" position={[ringX, 9.6, 1.15]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 0.3, 16]} />
                <meshStandardMaterial color="#1A1A1A" metalness={0.8} roughness={0.4} transparent opacity={opacity} />
            </mesh>
        );

        // Bottom Corner Iron Plates
        const cornerPlateW = 3.5;
        const cornerPlateH = 2.0;
        
        // Hinge side plate
        const hingeX = isLeft ? cornerPlateW/2 : -cornerPlateW/2;
        deco.push(
            <mesh key="corner-plate-hinge" position={[hingeX, cornerPlateH/2, 1.08]}>
                <boxGeometry args={[cornerPlateW, cornerPlateH, 0.15]} />
                <meshStandardMaterial color="#222222" metalness={0.7} roughness={0.5} transparent opacity={opacity} />
            </mesh>
        );

        // Center side plate (bottom)
        const centerCornerX = isLeft ? w - cornerPlateW/2 : -w + cornerPlateW/2;
        deco.push(
            <mesh key="corner-plate-center" position={[centerCornerX, cornerPlateH/2, 1.08]}>
                <boxGeometry args={[cornerPlateW, cornerPlateH, 0.15]} />
                <meshStandardMaterial color="#222222" metalness={0.7} roughness={0.5} transparent opacity={opacity} />
            </mesh>
        );

        return deco;
    }, [side, w, h, opacity, r]);

    return (
        <group position={[xOffset + (side === 'left' ? -13.1 : 13.1), -18, 5]} rotation={[0, angle, 0]}>
            <mesh position={[0, 0, 0]}>
                <extrudeGeometry args={[doorShape, { depth: 1.0, bevelEnabled: true, bevelThickness: 0.2, bevelSize: 0.2 }]} />
                <meshStandardMaterial color="#94332D" roughness={0.9} metalness={0.05} transparent opacity={opacity} />
            </mesh>
            {decorations}
        </group>
    );
};

const GateWall = ({ progress }: { progress: number }) => {
    const animVal = Math.max(0, progress);
    const opacity = 1 - Math.pow(Math.max(0, (animVal - 0.3) * 1.5), 2);
    const wallDepth = 12;
    const w = 13.5; const h = 24; const r = 13.5; 
    
    const wallShape = useMemo(() => {
        const s = new THREE.Shape();
        s.moveTo(-180, -80); s.lineTo(180, -80); s.lineTo(180, 120); s.lineTo(-180, 120); s.lineTo(-180, -80);
        const hole = new THREE.Path();
        hole.moveTo(-w, -18); hole.lineTo(w, -18); hole.lineTo(w, h - 18);
        hole.absarc(0, h - 18, r, 0, Math.PI, false); hole.lineTo(-w, -18);
        s.holes.push(hole);
        return s;
    }, [w, h, r]);

    const wallTex = useMemo(() => {
        if (typeof document === 'undefined') return null;
        
        // Use a higher resolution canvas based on DPR for perfect sharpness on Retina/Vercel
        const dpr = typeof window !== 'undefined' ? window.devicePixelRatio : 1;
        const scale = Math.max(dpr, 1.5) * 2; // Extra super-sampling
        const canvas = document.createElement('canvas');
        canvas.width = 1440 * scale; 
        canvas.height = 800 * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const s = scale * 4; // drawing scale

        // Base color (clean bright granite)
        ctx.fillStyle = '#EAE8E4';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Subtle stone tinting variation
        ctx.fillStyle = 'rgba(0,0,0,0.02)';
        const bH = 10 * s;
        const bW = 24 * s;
        for (let yRaw = -80; yRaw <= 120; yRaw += 10) {
            const cy = (120 - yRaw) * s;
            const stagger = (Math.round((yRaw + 80) / 10) % 2 === 0) ? bW / 2 : 0;
            for (let xRaw = -180; xRaw < 180; xRaw += 24) {
                const cx = (xRaw + 180) * s + stagger;
                if (Math.random() > 0.45) ctx.fillRect(cx, cy - bH, bW, bH);
            }
        }

        // Mortar lines for main wall - Absolute minimal thickness
        ctx.strokeStyle = '#938F86'; // Slightly darker to maintain thin visibility
        ctx.lineWidth = 0.1 * s; // Absolute minimum (approx 0.025 world units)
        ctx.beginPath();
        for (let yRaw = -80; yRaw <= 120; yRaw += 10) {
            const cy = (120 - yRaw) * s;
            ctx.moveTo(0, cy); ctx.lineTo(canvas.width, cy);
            const stagger = (Math.round((yRaw + 80) / 10) % 2 === 0) ? bW / 2 : 0;
            for (let xRaw = -180; xRaw < 180; xRaw += 24) {
                const cx = (xRaw + 180) * s + stagger;
                ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - bH);
            }
        }
        ctx.stroke();

        // 2. Overlay the arch rim flush with the wall
        const cxCenter = 180 * s;
        const cyCenter = (120 - 6) * s; 
        const rInner = 13.5 * s;
        const rOuter = 18.2 * s;

        // Erase background lines behind the arch
        ctx.fillStyle = '#EAE8E4';
        ctx.beginPath();
        ctx.arc(cxCenter, cyCenter, rOuter, 0, Math.PI, true);
        ctx.lineTo(cxCenter - rOuter, canvas.height);
        ctx.lineTo(cxCenter + rOuter, canvas.height);
        ctx.fill();

        // Arch color
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.arc(cxCenter, cyCenter, rOuter, 0, Math.PI, true);
        ctx.arc(cxCenter, cyCenter, rInner, Math.PI, 0, false);
        ctx.fill();

        // Radial Voussoir Joints - Absolute minimal
        ctx.strokeStyle = '#8E8A81'; // Slightly more contrast for very thin lines
        ctx.lineWidth = 0.15 * s; // Absolute minimum
        ctx.beginPath();
        
        ctx.arc(cxCenter, cyCenter, rOuter, Math.PI, 0, false);
        ctx.moveTo(cxCenter - rInner, cyCenter);
        ctx.arc(cxCenter, cyCenter, rInner, Math.PI, 0, false);
        
        ctx.moveTo(cxCenter - rOuter, cyCenter); ctx.lineTo(cxCenter - rOuter, canvas.height);
        ctx.moveTo(cxCenter - rInner, cyCenter); ctx.lineTo(cxCenter - rInner, canvas.height);
        ctx.moveTo(cxCenter + rOuter, cyCenter); ctx.lineTo(cxCenter + rOuter, canvas.height);
        ctx.moveTo(cxCenter + rInner, cyCenter); ctx.lineTo(cxCenter + rInner, canvas.height);

        const numStones = 16;
        for (let i = 1; i < numStones; i++) {
            const angle = Math.PI - (i / numStones) * Math.PI;
            ctx.moveTo(cxCenter + Math.cos(angle) * rInner, cyCenter - Math.sin(angle) * rInner);
            ctx.lineTo(cxCenter + Math.cos(angle) * rOuter, cyCenter - Math.sin(angle) * rOuter);
        }
        for (let j = 0; j < 4; j++) {
            const yJoint = cyCenter + (j + 1) * (10.1 * s);
            if (yJoint <= canvas.height) {
                ctx.moveTo(cxCenter - rOuter, yJoint); ctx.lineTo(cxCenter - rInner, yJoint);
                ctx.moveTo(cxCenter + rOuter, yJoint); ctx.lineTo(cxCenter + rInner, yJoint);
            }
        }
        ctx.stroke();

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace; // Match production colorspace
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false; // Physically block mipmap-induced blur
        tex.anisotropy = 16;
        tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.repeat.set(1 / 360, 1 / 200);
        tex.offset.set(180 / 360, 80 / 200);
        tex.needsUpdate = true;
        return tex;
    }, []);

    const archwayDetails = useMemo(() => {
        const blocks = [];
        const MAT_STONE = <meshStandardMaterial color="#F2F0EB" roughness={0.9} transparent opacity={opacity} />;
        const MAT_DARK = <meshStandardMaterial color="#D1CCC5" roughness={0.9} transparent opacity={opacity} />;

        // 3. Keystone (Yongdu/Protruding center stone)
        const jointR = 15.25;
        const keystoneAngle = Math.PI / 2;
        const ksX = Math.cos(keystoneAngle) * jointR;
        const ksY = Math.sin(keystoneAngle) * jointR + (h - 18);
        blocks.push(
            <mesh key="keystone" position={[-ksX, ksY + 0.3, wallDepth + 0.1]} rotation={[0, 0, keystoneAngle]}>
                <boxGeometry args={[4.4, 4.0, 0.2]} />
                {MAT_STONE}
            </mesh>
        );
        // Traditional Carving Detail (Simulated with several small blocks)
        blocks.push(
            <group key="keystone-face" position={[-ksX, ksY + 0.3, wallDepth + 0.3]}>
                <mesh position={[0, 0, 0]}><boxGeometry args={[3.2, 2.6, 0.1]} />{MAT_DARK}</mesh>
                {/* Simplified features like a traditional mask */}
                <mesh position={[0.7, 0.5, 0.1]}><boxGeometry args={[0.5, 0.5, 0.15]} />{MAT_STONE}</mesh> 
                <mesh position={[-0.7, 0.5, 0.1]}><boxGeometry args={[0.5, 0.5, 0.15]} />{MAT_STONE}</mesh>
                <mesh position={[0, -0.6, 0.1]}><boxGeometry args={[1.2, 0.4, 0.15]} />{MAT_STONE}</mesh>
            </group>
        );

        // Ground stone threshold
        blocks.push(
            <mesh key="threshold" position={[0, -18.5, wallDepth + 0.5]}>
                <boxGeometry args={[w * 2 + 10, 1.0, 2.0]} />
                {MAT_DARK}
            </mesh>
        );

        return blocks;
    }, [opacity, wallDepth, h, w]);

    return (
        <group position={[0, 0, 0]}>
            <mesh>
                <extrudeGeometry args={[wallShape, { depth: wallDepth, bevelEnabled: true, bevelThickness: 0.2, bevelSize: 0.2 }]} />
                <meshStandardMaterial map={wallTex} color="#FFF" roughness={1.0} transparent opacity={opacity} />
            </mesh>
            {archwayDetails}
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
                            <Canvas flat dpr={[1, 2]} gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}>
                                <TransitionScene progress={animProgress} floorNumber={floorNumber} floorTitle={safeTitle} />
                            </Canvas>
                        </React.Suspense>
                    </motion.div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
