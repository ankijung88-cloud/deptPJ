import React, { useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import {
    Html,
    Edges,
    PerspectiveCamera,
    PresentationControls
} from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Volume2, VolumeX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { getContrastColor } from '../../utils/themeUtils';
import { getLocalizedText } from '../../utils/i18nUtils';
import { useFloors } from '../../context/FloorContext';
import { FloorCategory } from '../../types';

// --- Theme & Configuration ---
const COLORS = {
    paper: '#1A2420',       // Deep Pine Background
    line: '#00FFC2',        // Neon Mint blueprint lines
    fill: '#222B28',        // Slightly lighter pine for structure
    highlight: '#FF3B30'    // Glitch Red highlight for interactions
};


const METRICS = {
    floorHeight: 2.6,
    width: 10,
    depth: 10,
    slabThickness: 0.3,
    columnThickness: 0.25,
    coreSize: 2.8
};

// Custom material to prevent Z-fighting with Edges
const SolidMaterial = ({ color = COLORS.fill, transparent = false, opacity = 1 }) => (
    <meshStandardMaterial
        color={color}
        polygonOffset
        polygonOffsetFactor={1}
        polygonOffsetUnits={1}
        transparent={transparent}
        opacity={opacity}
        roughness={1}
    />
);

// --- Detailed Structural Parts ---

const ElevatorCore = () => (
    <mesh position={[0, METRICS.floorHeight / 2, 0]}>
        <boxGeometry args={[METRICS.coreSize, METRICS.floorHeight, METRICS.coreSize]} />
        <SolidMaterial color={COLORS.fill} />
        <Edges color={COLORS.line} threshold={15} />

        {/* Fake Elevator Doors drawn on the front face */}
        <mesh position={[0, -0.2, METRICS.coreSize / 2 + 0.01]}>
            <planeGeometry args={[1.2, 2]} />
            <meshBasicMaterial color="#1f2b26" polygonOffset polygonOffsetFactor={-1} />
            <Edges color={COLORS.line} />
            {/* Center split line for door */}
            <mesh position={[0, 0, 0]}>
                <planeGeometry args={[0.02, 2]} />
                <meshBasicMaterial color={COLORS.line} />
            </mesh>
        </mesh>
    </mesh>
);

const Columns = () => {
    const positions = [
        // Corners
        [1, 1], [-1, 1], [1, -1], [-1, -1],
        // Midpoints
        [0, 1], [0, -1], [1, 0], [-1, 0]
    ];
    const offsetX = METRICS.width / 2 - METRICS.columnThickness / 2;
    const offsetZ = METRICS.depth / 2 - METRICS.columnThickness / 2;

    return (
        <group>
            {positions.map(([x, z], i) => (
                <mesh key={i} position={[x * offsetX, METRICS.floorHeight / 2, z * offsetZ]}>
                    <boxGeometry args={[METRICS.columnThickness, METRICS.floorHeight, METRICS.columnThickness]} />
                    <SolidMaterial />
                    <Edges color={COLORS.line} />
                </mesh>
            ))}
        </group>
    );
};

const FloorUnit = ({ floor, yPos, isSelected, isHovered, onHover, onToggleModal, isSelectedAnything, isMobile }: any) => {
    const active = isSelected || isHovered;
    const targetScale = active ? 1.02 : 1;
    const groupRef = useRef<THREE.Group>(null);
    const highlightRef = useRef<THREE.MeshStandardMaterial>(null);
    const mouseDownPos = useRef<{ x: number, y: number } | null>(null);

    useFrame((_, delta) => {
        if (groupRef.current) {
            groupRef.current.scale.lerp(new THREE.Vector3(targetScale, 1, targetScale), 8 * delta);
        }
        if (highlightRef.current) {
            const targetOpacity = active ? 0.35 : 0;
            highlightRef.current.opacity = THREE.MathUtils.lerp(highlightRef.current.opacity, targetOpacity, 8 * delta);
        }
    });

    const handlePointerDown = (e: any) => {
        e.stopPropagation();
        mouseDownPos.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: any) => {
        e.stopPropagation();
        if (!mouseDownPos.current) return;

        const distance = Math.sqrt(
            Math.pow(e.clientX - mouseDownPos.current.x, 2) +
            Math.pow(e.clientY - mouseDownPos.current.y, 2)
        );

        // Only trigger click if the movement was minimal (threshold of 5px)
        if (distance < 5) {
            onToggleModal();
        }
        mouseDownPos.current = null;
    };

    return (
        <group
            ref={groupRef}
            position={[0, yPos, 0]}
            onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { document.body.style.cursor = 'auto'; }}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
        >
            {/* Base Slab */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[METRICS.width + 0.5, METRICS.slabThickness, METRICS.depth + 0.5]} />
                <SolidMaterial />
                <Edges color={COLORS.line} />
            </mesh>

            {/* Ceiling Slab (Top of the floor) */}
            <mesh position={[0, METRICS.floorHeight, 0]}>
                <boxGeometry args={[METRICS.width, METRICS.slabThickness, METRICS.depth]} />
                <SolidMaterial />
                <Edges color={COLORS.line} />
            </mesh>

            <Columns />
            <ElevatorCore />

            {/* Active Highlight Volume */}
            <mesh position={[0, METRICS.floorHeight / 2, 0]} scale={0.99}>
                <boxGeometry args={[METRICS.width, METRICS.floorHeight, METRICS.depth]} />
                <meshStandardMaterial
                    ref={highlightRef}
                    color={floor.color}
                    transparent
                    opacity={0}
                    depthWrite={false}
                />
            </mesh>

            {/* Right-aligned 3D Label - Main navigation anchor */}
            {!isSelectedAnything && (
                <Html
                    position={[METRICS.width / 2 + (isMobile ? 4.0 : 3.5), METRICS.floorHeight / 2, METRICS.depth / 2]}
                    center
                    zIndexRange={[50, 100]}
                >
                    <div 
                        onPointerEnter={(e) => { e.stopPropagation(); onHover(parseInt(floor.floor)); document.body.style.cursor = 'pointer'; }}
                        onPointerLeave={() => { document.body.style.cursor = 'auto'; }}
                        onPointerDown={(e) => { e.stopPropagation(); onHover(parseInt(floor.floor)); }}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            pointerEvents: 'auto',
                            transition: 'all 0.3s ease',
                            transform: isHovered ? (isMobile ? 'scale(1.05)' : 'scale(1.1)') : 'scale(1)',
                            zIndex: isHovered ? 100 : 50
                        }}
                    >
                        {/* Elegant Dotted Line */}
                        <div style={{
                            width: isHovered ? '60px' : '40px',
                            borderTop: `2px dotted ${isHovered ? floor.color : 'rgba(255, 255, 255, 0.2)'}`,
                            opacity: isHovered ? 1.0 : 0.3,
                            transition: 'all 0.4s ease'
                        }} />

                        {/* Relative container to anchor label */}
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginLeft: '12px' }}>
                            <div 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleModal();
                                }}
                                style={{
                                    width: isMobile ? '40px' : '64px',
                                    height: isMobile ? '40px' : '64px',
                                    borderRadius: '50%',
                                    border: `1.5px solid ${isHovered ? floor.color : 'rgba(255, 255, 255, 0.3)'}`,
                                    backgroundColor: isHovered ? `${floor.color}22` : 'rgba(20, 28, 25, 0.6)',
                                    backdropFilter: 'blur(10px)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: isHovered 
                                        ? `0 0 20px ${floor.color}44, inset 0 0 10px ${floor.color}33` 
                                        : '0 4px 15px rgba(0,0,0,0.3)',
                                    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
                                    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                                    position: 'relative'
                                }}
                            >
                                <span style={{ 
                                    fontSize: isMobile ? '16px' : '24px', 
                                    fontWeight: '900', 
                                    color: isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
                                    lineHeight: 1,
                                    fontFamily: 'serif',
                                    textShadow: isHovered ? `0 0 10px ${floor.color}` : 'none'
                                }}>
                                    {floor.floor}
                                </span>
                                
                                {/* Inner Ring Detail */}
                                <div style={{
                                    position: 'absolute',
                                    top: '4px', left: '4px', right: '4px', bottom: '4px',
                                    borderRadius: '50%',
                                    border: `0.5px solid ${isHovered ? floor.color : 'rgba(255, 255, 255, 0.1)'}`,
                                    opacity: 0.5,
                                    pointerEvents: 'none'
                                }} />
                            </div>
                        </div>
                    </div>
                </Html>
            )}
        </group>
    );
};

// --- Scene Assembly ---

const BlueprintBuilding = ({ floors, selectedFloor, hoveredFloor, activeModalFloor, setHoveredFloor, setActiveModalFloor, setSelectedFloor, isMobile, lang }: any) => {
    // Center the building vertically
    const totalHeight = floors.length * METRICS.floorHeight;

    return (
        <group 
            position={[0, -(totalHeight / 2) + (isMobile ? 0.7 : 3.2), 0]} 
            scale={isMobile ? [0.7, 1, 0.7] : [0.8, 0.85, 0.8]}
            onClick={(e) => {
                e.stopPropagation();
                if (hoveredFloor) {
                    setHoveredFloor(null);
                }
            }}
        >
            {/* Foundation */}
            <mesh position={[0, -METRICS.slabThickness, 0]}>
                <boxGeometry args={[METRICS.width + 1.5, METRICS.slabThickness, METRICS.depth + 1.5]} />
                <SolidMaterial />
                <Edges color={COLORS.line} />
            </mesh>

            {floors.map((floor: FloorCategory, index: number) => (
                <FloorUnit
                    key={floor.id}
                    floor={floor}
                    yPos={(floors.length - 1 - index) * METRICS.floorHeight}
                    isSelected={selectedFloor === parseInt(floor.floor)}
                    isHovered={hoveredFloor === parseInt(floor.floor)}
                    isSelectedAnything={selectedFloor !== null}
                    onHover={setHoveredFloor}
                    onToggleModal={() => setActiveModalFloor(activeModalFloor === parseInt(floor.floor) ? null : parseInt(floor.floor))}
                    isMobile={isMobile}
                    lang={lang}
                />
            ))}

            {/* Top Roof Cover */}
            <mesh position={[0, floors.length * METRICS.floorHeight, 0]}>
                <boxGeometry args={[METRICS.width + 0.5, METRICS.slabThickness, METRICS.depth + 0.5]} />
                <SolidMaterial />
                <Edges color={COLORS.line} />
            </mesh>

            {/* Central Fixed Hover Modal */}
            <AnimatePresence>
                {activeModalFloor && !selectedFloor && (() => {
                    const activeFloorData = floors.find((f: any) => parseInt(f.floor) === activeModalFloor);
                    if (!activeFloorData) return null;

                    return (
                        <Html
                            position={[isMobile ? -4.5 : -1.5, (totalHeight / 2) - 1, METRICS.depth / 2 + 0.5]}
                            center
                            zIndexRange={[200, 300]}
                            occlude={false}
                            style={{ pointerEvents: 'none' }}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, y: 15 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                                style={{
                                    width: isMobile ? '260px' : '400px',
                                    backgroundColor: 'rgba(20, 28, 25, 0.95)',
                                    backdropFilter: 'blur(20px)',
                                    border: `2px solid ${activeFloorData.color}`,
                                    padding: isMobile ? '20px' : '32px',
                                    borderRadius: '2px',
                                    boxShadow: `0 0 60px ${activeFloorData.color}55, inset 0 0 40px rgba(0,0,0,0.6)`,
                                    pointerEvents: 'auto',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '16px',
                                    color: '#fff'
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div 
                                    className="flex items-center gap-4 mb-6 cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedFloor(activeModalFloor);
                                    }}
                                >
                                    <div className="flex items-baseline gap-2">
                                        <span style={{ fontSize: isMobile ? '32px' : '48px', fontWeight: '900', color: activeFloorData.color, lineHeight: 1, fontFamily: 'serif' }}>
                                            {activeFloorData.floor}
                                        </span>
                                        <span style={{ fontSize: isMobile ? '12px' : '18px', fontWeight: '900', color: activeFloorData.color }}>F</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span style={{ fontSize: '10px', color: activeFloorData.color, letterSpacing: '0.3em', fontWeight: '900', marginBottom: '2px' }}>FLOOR TITLE</span>
                                        <h4 style={{ color: '#fff', fontSize: isMobile ? '16px' : '22px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.2 }}>
                                            <AutoTranslatedText text={getLocalizedText(activeFloorData.title, lang)} />
                                        </h4>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {activeFloorData.subitems?.map((sub: any, idx: number) => (
                                        <motion.div
                                            key={sub.id}
                                            initial={{ opacity: 0, x: -15 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.15 + idx * 0.06 }}
                                            whileHover={{ x: 8 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const navigate = (window as any)._deptNavigate;
                                                if (navigate) navigate(`/category/${sub.id}`);
                                            }}
                                            style={{
                                                fontSize: isMobile ? '12px' : '15px',
                                                fontWeight: '700',
                                                letterSpacing: '0.05em',
                                                color: 'rgba(255,255,255,0.8)',
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap',
                                                textTransform: 'uppercase',
                                                padding: '6px 0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px'
                                            }}
                                        >
                                            <div style={{ width: '6px', height: '1.5px', backgroundColor: activeFloorData.color }} />
                                            <AutoTranslatedText text={getLocalizedText(sub.label, lang)} />
                                        </motion.div>
                                    ))}
                                </div>

                                <div 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveModalFloor(null);
                                    }}
                                    className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center opacity-60 hover:opacity-100 transition-opacity"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="flex flex-col gap-1">
                                        <span style={{ fontSize: '7px', color: '#fff', fontWeight: '900', letterSpacing: '0.4em' }}>STRUCTURAL FRAGMENT</span>
                                        <span style={{ fontSize: '8px', color: activeFloorData.color, fontWeight: 'bold' }}>CODE: DEPT_FR_0{activeFloorData.floor}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: activeFloorData.color, fontWeight: '900', fontSize: '12px', whiteSpace: 'nowrap' }}>
                                        <span style={{ fontSize: '18px', lineHeight: 1 }}>→</span>
                                        <span style={{ letterSpacing: '0.1em' }}>CLOSE</span>
                                    </div>
                                </div>
                            </motion.div>
                        </Html>
                    );
                })()}
            </AnimatePresence>
        </group>
    );
};

// --- City Background Generator ---
// Seeded random helper for deterministic city layout
const createSeededRandom = (seed: number) => {
    let s = seed;
    return () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
    };
};

const CityBackground3D = () => {
    const buildings = useMemo(() => {
        const rng = createSeededRandom(42); // Fixed seed for stability

        // Create Window Canvas Texture for blueprint aesthetics - much fainter
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = COLORS.paper;
            ctx.fillRect(0, 0, 128, 128);

            // Faint windows to eliminate dissonance
            ctx.strokeStyle = 'rgba(44, 62, 80, 0.15)';
            ctx.lineWidth = 2;

            // Draw window boundary
            ctx.strokeRect(32, 24, 64, 80);

            // Draw inner panes
            ctx.beginPath();
            ctx.moveTo(64, 24); ctx.lineTo(64, 104);
            ctx.moveTo(32, 64); ctx.lineTo(96, 64);
            ctx.stroke();
        }

        const texBase = new THREE.CanvasTexture(canvas);
        texBase.wrapS = THREE.RepeatWrapping;
        texBase.wrapT = THREE.RepeatWrapping;

        const items = [];
        const count = 450;
        const range = 350;
        const exclusionRadius = 35; // Don't block the main building

        for (let i = 0; i < count; i++) {
            let x = (rng() - 0.5) * range;
            let z = (rng() - 0.5) * range;

            const dist = Math.sqrt(x * x + z * z);
            if (dist < exclusionRadius) {
                const angle = Math.atan2(z, x);
                x = Math.cos(angle) * (exclusionRadius + rng() * 10);
                z = Math.sin(angle) * (exclusionRadius + rng() * 10);
            }

            // 2. Clear the specific front line-of-sight from camera [-24, 2.0, 32]
            if (z > 0 && x > -50 && x < 20) {
                if (rng() > 0.5) {
                    z = -35 - (rng() * (range / 2));
                } else {
                    x = 35 + (rng() * (range / 2));
                }
            }

            const width = 4 + rng() * 8;
            const depth = 4 + rng() * 8;
            const height = 4 + rng() * 10;

            const tex = texBase.clone();
            tex.repeat.set(Math.max(1, Math.round(width / 4)), Math.max(2, Math.round(height / 4)));

            const material = new THREE.MeshStandardMaterial({
                color: COLORS.paper,
                map: tex,
                roughness: 1,
                polygonOffset: true,
                polygonOffsetFactor: 1,
                polygonOffsetUnits: 1
            });

            const yPos = (height / 2) - (6 * 2.8 / 2) - 1;

            items.push({
                position: [x, yPos, z] as [number, number, number],
                args: [width, height, depth] as [number, number, number],
                material: material
            });
        }
        return items;
    }, []);

    return (
        <group>
            {/* Blueprint Grid Floor/Road */}
            <gridHelper args={[400, 100, COLORS.line, COLORS.line]} position={[0, -6.45, 0]}>
                <lineBasicMaterial attach="material" transparent opacity={0.15} color={COLORS.line} />
            </gridHelper>

            {buildings.map((b, i) => (
                <mesh key={i} position={b.position} material={b.material}>
                    <boxGeometry args={b.args} />
                    <Edges color={COLORS.line} threshold={15} opacity={0.15} transparent />
                </mesh>
            ))}
        </group>
    );
};

// --- Fragmented Blueprint Modal ---
const FragmentedModal = ({ activeFloorData, onClose, isMobile }: { activeFloorData: any, onClose: () => void, isMobile: boolean }) => {
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const [isVideoExpanded, setIsVideoExpanded] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [videoError, setVideoError] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [videoAspectRatio, setVideoAspectRatio] = useState(16 / 9);
    const videoRef = useRef<HTMLVideoElement>(null);

    const MODAL_COLORS = {
        bg: '#1A2420',
        line: '#00FFC2',
        accent: activeFloorData?.color || '#FF3B30'
    };

    const buttonTextColor = getContrastColor(activeFloorData.color);

    // Keyboard support for closing video modal
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsVideoExpanded(false);
        };
        if (isVideoExpanded) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isVideoExpanded]);

    // Generate scattered positions for subcategories
    const fragments = useMemo(() => {
        if (!activeFloorData?.subitems) return [];

        const zones = isMobile ? [
            { t: [5, 12], l: [5, 25] },
            { t: [5, 12], l: [65, 85] },
            { t: [15, 22], l: [10, 35] },
            { t: [15, 22], l: [60, 80] },
            { t: [25, 32], l: [5, 25] },
            { t: [25, 32], l: [65, 85] },
            { t: [35, 42], l: [10, 40] },
            { t: [72, 78], l: [2, 25] }
        ] : [
            { t: [10, 22], l: [10, 25] }, // Top Left
            { t: [8, 20], l: [35, 50] }, // Top Mid-Left
            { t: [8, 20], l: [60, 75] }, // Top Mid-Right
            { t: [30, 45], l: [8, 22] },  // Mid Left
            { t: [55, 70], l: [8, 22] },  // Mid-Bottom Left
            { t: [78, 90], l: [10, 25] }, // Far Bottom Left
            { t: [30, 45], l: [30, 45] }, // Near Top-Center Left
            { t: [55, 70], l: [30, 45] }  // Near Center-Left
        ];

        // Shuffle zones to distribute subcategories uniquely
        const shuffledZones = [...zones].sort(() => Math.random() - 0.5);

        return activeFloorData.subitems.slice(0, zones.length).map((sub: any, i: number) => {
            const zone = shuffledZones[i];
            return {
                id: i,
                subId: sub.id,
                text: getLocalizedText(sub.label, i18n.language),
                // Positions are still randomized by zone
                top: zone.t[0] + Math.random() * (zone.t[1] - zone.t[0]),
                left: zone.l[0] + Math.random() * (zone.l[1] - zone.l[0]),
                delay: i * 0.08,
                type: Math.floor(Math.random() * 4)
            };
        });
    }, [activeFloorData, isMobile]);

    /* Decorative blocks removed to prevent visual confusion */

    if (!activeFloorData) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[1000] overflow-hidden cursor-pointer"
            style={{ backgroundColor: MODAL_COLORS.bg }}
            onClick={onClose}
        >
            {/* Background SVG lines mimicking architectural sketch */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                <line x1="0%" y1="20%" x2="100%" y2="80%" stroke={MODAL_COLORS.line} strokeWidth="1.5" />
                <line x1="10%" y1="0%" x2="90%" y2="100%" stroke={MODAL_COLORS.line} strokeWidth="1" />
                <line x1="30%" y1="0%" x2="40%" y2="100%" stroke={MODAL_COLORS.line} strokeWidth="1.5" strokeDasharray="6 6" />
                <line x1="80%" y1="0%" x2="60%" y2="100%" stroke={MODAL_COLORS.line} strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0%" y1="60%" x2="100%" y2="40%" stroke={MODAL_COLORS.line} strokeWidth="2" />
                <line x1="100%" y1="10%" x2="0%" y2="90%" stroke={MODAL_COLORS.line} strokeWidth="0.5" />
                <line x1="50%" y1="0%" x2="50%" y2="100%" stroke={MODAL_COLORS.line} strokeWidth="1" opacity={0.1} />
                <line x1="0%" y1="50%" x2="100%" y2="50%" stroke={MODAL_COLORS.line} strokeWidth="1" opacity={0.1} />
            </svg>

            {/* Close button removed as requested. Modal can be closed via backdrop click or the ENTER ZONE button below. */}

            {/* Decorative geometrical blocks removed */}

            {/* Bottom-Right Anchor Title Fragment (More ergonomic placement) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute inset-x-4 bottom-8 md:right-12 md:bottom-12 md:left-auto bg-[#1A2420]/95 backdrop-blur-xl border-2 shadow-2xl p-5 md:p-10 z-50 md:min-w-[500px] cursor-default"
                style={{ borderColor: MODAL_COLORS.line }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 md:gap-6 mb-3 md:mb-6 pb-3 md:pb-6 border-b-2" style={{ borderColor: activeFloorData.color }}>
                    <span className="text-4xl md:text-8xl font-black font-serif" style={{ color: activeFloorData.color }}>
                        {activeFloorData.floor}
                    </span>
                    <span className="text-lg md:text-4xl font-black text-white tracking-tighter leading-none break-words max-w-[150px] md:max-w-[250px]">
                        <AutoTranslatedText text={getLocalizedText(activeFloorData.title, i18n.language)} />
                    </span>
                </div>
                <p className="text-white/80 font-sans text-[11px] md:text-sm font-medium leading-relaxed mb-6 md:mb-8 tracking-wide">
                    <AutoTranslatedText text={`선택된 ${activeFloorData.floor}층의 스페이스 다이어그램입니다.`} /><br />
                    <AutoTranslatedText text="각 파편화된 다목적 조닝(Zoning) 블록을 확인하세요." />
                </p>
                <button
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    className="w-full py-3 md:py-4 font-bold tracking-widest text-sm md:text-lg transition-transform hover:bg-opacity-90 active:scale-95 flex justify-center items-center gap-4 shadow-md"
                    style={{ backgroundColor: activeFloorData.color, color: buttonTextColor }}
                >
                    <span className="font-serif font-black text-xl md:text-2xl leading-none relative -top-[1px] md:-top-[2px]" style={{ color: buttonTextColor }}>→</span>
                    <AutoTranslatedText text="ENTER ZONE" />
                </button>
            </motion.div>

            {/* Central Circular Video Frame */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsVideoExpanded(true);
                }}
            >
                <div className="relative group cursor-pointer">
                    <div
                        className="w-[200px] h-[200px] md:w-[300px] md:h-[300px] rounded-full overflow-hidden border-4 border-[#00F2FF]/30 shadow-[0_0_50px_rgba(0,242,255,0.2)] transition-transform duration-500 group-hover:scale-110 bg-[#0A100D] relative"
                        style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
                    >
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            onLoadedData={() => setVideoLoaded(true)}
                            onError={() => setVideoError(true)}
                            className={`w-full h-full object-cover rounded-full transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
                            style={{ clipPath: 'circle(50% at 50% 50%)' }}
                            src={activeFloorData.videoUrl}
                        />
                        {/* Fallback pattern if video fails */}
                        {(videoError || !videoLoaded) && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1A2420] to-[#0A100D]">
                                <div className="p-4 border border-white/10 rounded-full animate-pulse bg-white/5">
                                    <Play size={24} className="text-white/20" />
                                </div>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />
                    </div>

                    {/* Architectural decoration around video */}
                    <svg className="absolute inset-[-40px] w-[380px] h-[380px] pointer-events-none overflow-visible">
                        <circle cx="190" cy="190" r="170" fill="none" stroke={MODAL_COLORS.line} strokeWidth="1" strokeDasharray="5 5" className="animate-[spin_60s_linear_infinite]" />
                        <circle cx="190" cy="190" r="185" fill="none" stroke={activeFloorData.color} strokeWidth="0.5" opacity="0.3" />
                    </svg>

                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center border border-white/50"
                        >
                            <Play fill="white" size={24} className="text-white ml-1" />
                        </motion.div>
                    </div>

                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
                        <span className="font-mono text-[10px] tracking-[0.4em] uppercase font-bold text-[#00FFC2] bg-black/40 px-4 py-1.5 rounded-full border border-[#00FFC2]/30 backdrop-blur-md">
                            <AutoTranslatedText text="Click to Expand View" />
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Full Screen Video Modal */}
            <AnimatePresence>
                {isVideoExpanded && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[2000] bg-black flex items-center justify-center cursor-default"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsVideoExpanded(false);
                        }}
                    >
                        <motion.button
                            key="close-button"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            className="absolute top-8 right-8 md:top-12 md:right-12 text-white/70 hover:text-white z-[2100] bg-white/10 backdrop-blur-xl w-14 h-14 rounded-full flex items-center justify-center border border-white/20 shadow-2xl transition-all cursor-pointer pointer-events-auto"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsVideoExpanded(false);
                            }}
                        >
                            <X size={28} />
                        </motion.button>

                        <div className="absolute top-10 left-10 z-[110] pointer-events-none">
                            <span className="text-4xl font-serif font-black text-white/20 tracking-tighter uppercase">
                                <AutoTranslatedText text={getLocalizedText(activeFloorData.title, i18n.language)} />
                            </span>
                        </div>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="relative w-full max-w-[90vw] md:max-w-6xl shadow-2xl border border-white/10 rounded-2xl overflow-hidden"
                            style={{
                                aspectRatio: videoAspectRatio,
                                maxHeight: '80vh',
                                width: videoAspectRatio > 1 ? '100%' : 'auto'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <video
                                ref={videoRef}
                                key={activeFloorData.videoUrl}
                                autoPlay
                                loop
                                muted={isMuted}
                                playsInline
                                src={activeFloorData.videoUrl}
                                onError={() => {
                                    console.error("Video load failed:", activeFloorData.videoUrl);
                                    setVideoError(true);
                                }}
                                onLoadedData={() => setVideoError(false)}
                                onLoadedMetadata={(e) => {
                                    const video = e.currentTarget;
                                    if (video.videoWidth && video.videoHeight) {
                                        setVideoAspectRatio(video.videoWidth / video.videoHeight);
                                    }
                                }}
                                className={`w-full h-full object-cover transition-transform duration-700 ${videoError ? 'opacity-0' : 'opacity-100'}`}
                            />
                            {videoError && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                    <div className="w-16 h-16 rounded-full border border-dancheong-gold/30 flex items-center justify-center mb-4">
                                        <div className="w-8 h-8 rounded-full bg-dancheong-gold/20 animate-pulse" />
                                    </div>
                                    <p className="text-dancheong-gold/60 text-sm font-medium uppercase tracking-widest">
                                        <AutoTranslatedText text="Preview Loading or Unavailable" />
                                    </p>
                                </div>
                            )}

                        </motion.div>
                        
                        {/* Mute/Unmute UI moved outside video frame to bottom-right of the screen */}
                        <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12 z-[2100] flex items-center gap-4">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsMuted(!isMuted);
                                }}
                                className="p-4 md:p-5 rounded-full bg-white/10 backdrop-blur-3xl border border-white/20 text-white hover:bg-white/20 transition-all shadow-2xl active:scale-90"
                            >
                                {isMuted ? <VolumeX size={28} /> : <Volume2 size={28} />}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Scattered Subcategory Fragments */}
            {fragments.map((frag: any) => {
                let bg, border, textColor;
                if (frag.type === 0) { // Dark Solid
                    bg = COLORS.line; border = 'transparent'; textColor = COLORS.paper;
                } else if (frag.type === 1) { // Brand Color Solid
                    bg = activeFloorData.color; border = 'transparent'; textColor = getContrastColor(activeFloorData.color);
                } else if (frag.type === 2) { // Cyber Paper with Border
                    bg = '#1A2420'; border = MODAL_COLORS.line; textColor = MODAL_COLORS.line;
                } else { // Translucent Brand Color
                    bg = activeFloorData.color + '40'; // 25% opacity hex
                    border = activeFloorData.color; textColor = getContrastColor(activeFloorData.color);
                }

                return (
                    <motion.div
                        key={`frag-${frag.id}`}
                        initial={{ opacity: 0, scale: 0.3, x: (Math.random() - 0.5) * 300, y: (Math.random() - 0.5) * 300 }}
                        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 + frag.delay, type: 'spring', bounce: 0.5 }}
                        className="absolute shadow-xl flex items-center justify-center p-3 md:p-5 cursor-pointer hover:scale-105 hover:z-[70] transition-all duration-300 z-40 backdrop-blur-sm"
                        style={{
                            top: `${frag.top}%`,
                            left: `${frag.left}%`,
                            minWidth: isMobile ? '100px' : '160px',
                            minHeight: isMobile ? '60px' : '80px',
                            maxWidth: isMobile ? '160px' : '300px',
                            backgroundColor: bg,
                            border: border !== 'transparent' ? `2px solid ${border}` : 'none',
                            color: textColor,
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/category/${frag.subId}`);
                        }}
                    >
                        <div className="flex flex-col items-center justify-center w-full px-2 py-1">
                            <span className="text-[8px] md:text-[10px] font-mono tracking-widest opacity-60 mb-1 md:mb-2 uppercase border-b border-current pb-1 w-full text-center">{activeFloorData.floor}.Z{frag.id + 1}</span>
                            <span className="font-black text-[11px] md:text-xl text-center tracking-tighter leading-[1.1] md:leading-tight break-words w-full">
                                <AutoTranslatedText text={frag.text} />
                            </span>
                        </div>
                    </motion.div>
                );
            })}
        </motion.div>
    );
};

export const VirtualStore3D: React.FC = () => {
    const { floors, loading } = useFloors();
    const { i18n } = useTranslation();
    const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
    const [hoveredFloor, setHoveredFloor] = useState<number | null>(null);
    const [activeModalFloor, setActiveModalFloor] = useState<number | null>(null);
    const [resetKey, setResetKey] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const navigate = useNavigate();

    // Store navigate globally for the central modal (since it's in a functional component nested deeper)
    React.useEffect(() => {
        (window as any)._deptNavigate = navigate;
    }, [navigate]);

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const activeFloorData = useMemo(() => {
        if (!selectedFloor) return null;
        return floors.find(f => parseInt(f.floor) === selectedFloor);
    }, [selectedFloor, floors]);

    return (
        <div
            className={`fixed inset-0 top-0 left-0 w-full h-full transition-all duration-300 ${selectedFloor ? 'z-[100]' : 'z-[40]'}`}
            style={{ backgroundColor: COLORS.paper, touchAction: 'none' }}
        >

            {/* Blueprint Header */}
            <div className="absolute top-24 md:top-40 left-8 md:left-16 pointer-events-none z-10 opacity-80">
                <h1 className="text-[#00FFC2] text-3xl md:text-5xl font-black uppercase font-serif tracking-tight leading-none mb-4 drop-shadow-[0_0_15px_rgba(0,255,194,0.4)]">
                    <AutoTranslatedText text="CULTURAL" /><br />
                    <AutoTranslatedText text="ARCHIVE" />
                </h1>
                <div className="h-[2px] w-16 md:w-24 bg-[#00FFC2] mb-2 shadow-[0_0_10px_rgba(0,255,194,0.5)]"></div>
                <p className="text-[#00FFC2]/80 font-mono text-[10px] md:text-sm tracking-[0.2em] font-bold">
                    <AutoTranslatedText text="STRUCTURAL ELEVATION" /><br />
                    <AutoTranslatedText text="SCALE 1:100" />
                </p>
            </div>

            {/* Transparent Canvas overlays the background */}
            <Canvas shadows={false} gl={{ antialias: true, alpha: false }} style={{ touchAction: 'none' }}>
                <color attach="background" args={[COLORS.paper]} />
                <CityBackground3D />

                <ambientLight intensity={2.5} />
                <directionalLight position={[10, 20, 15]} intensity={1} color={'#ffffff'} />

                <PerspectiveCamera
                    makeDefault
                    position={[-24, 2.0, 32]}
                    fov={isMobile ? 60 : 35}
                    near={0.1}
                    far={1000}
                    onUpdate={(c) => c.lookAt(0, isMobile ? 0.1 : 2.6, 0)}
                />

                <group 
                    key={resetKey} 
                    position={isMobile ? [-1.2, 0, 0] : [-4.0, 0, 0]}
                    onClick={() => {
                        if (hoveredFloor) setHoveredFloor(null);
                    }}
                >
                    <PresentationControls
                        global
                        config={{ mass: 2, tension: 500 }}
                        snap={false}
                        rotation={[0, 0, 0]}
                        polar={[0, 0]}
                        azimuth={[-Infinity, Infinity]}
                    >
                        {!loading && (
                            <BlueprintBuilding
                                floors={floors}
                                selectedFloor={selectedFloor}
                                hoveredFloor={hoveredFloor}
                                activeModalFloor={activeModalFloor}
                                setHoveredFloor={setHoveredFloor}
                                setActiveModalFloor={setActiveModalFloor}
                                setSelectedFloor={setSelectedFloor}
                                isMobile={isMobile}
                                lang={i18n.language}
                            />
                        )}
                    </PresentationControls>
                </group>
            </Canvas>

            <AnimatePresence>
                {activeFloorData && (
                    <FragmentedModal
                        activeFloorData={activeFloorData}
                        onClose={() => setSelectedFloor(null)}
                        isMobile={isMobile}
                    />
                )}
            </AnimatePresence>

            <div className="absolute bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-col md:flex-row items-center gap-3 md:gap-6 select-none w-[90vw] md:w-max max-w-full px-4 text-center justify-center" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                <div className="text-white/40 font-mono text-[9px] md:text-sm tracking-[0.1em] md:tracking-[0.3em] uppercase font-black break-keep leading-relaxed">
                    <AutoTranslatedText text="[Drag to Rotate] • [Click Floor to Select]" />
                </div>
                
                <button 
                    onClick={() => setResetKey(prev => prev + 1)}
                    className="group flex items-center gap-2 px-6 py-2 rounded-full border border-white/10 hover:border-[#00FFC2]/40 hover:bg-[#00FFC2]/5 transition-all duration-300 backdrop-blur-md"
                >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00FFC2] group-hover:shadow-[0_0_8px_#00FFC2] transition-all" />
                    <span className="text-[#00FFC2] font-bold text-[10px] md:text-sm tracking-widest uppercase">
                        <AutoTranslatedText text="원위치" />
                    </span>
                </button>
            </div>
        </div>
    );
};
