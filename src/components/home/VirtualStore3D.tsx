import React, { useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import {
    Html,
    Edges,
    PerspectiveCamera,
    PresentationControls,
    Float,
    Stars,
    OrbitControls
} from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Volume2, VolumeX, ChevronUp, ChevronDown, ArrowRight } from 'lucide-react';
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
    floorHeight: 4.2,
    width: 9,
    depth: 9,
    slabThickness: 0.2,
    columnThickness: 0.15,  // Thinner columns for multiple bays
    coreSize: 2.8,
    roofOverhang: 1.4,
    roofHeight: 0.55,       // Flatter roofs like the image
    taperFactor: 0.08,
    bays: 4                 // 4 columns per side (3 bays) as per image
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

// --- 3D Background for Modal ---
const GlassFragment = ({ category, position, color, i18nLanguage, onClick }: { category: any, position: [number, number, number], color: string, i18nLanguage: string, onClick: () => void }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);
    
    useFrame(() => {
        if (!meshRef.current) return;
        meshRef.current.rotation.x += 0.005;
        meshRef.current.rotation.y += 0.008;
    });

    return (
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
            <group position={position}>
                <mesh 
                    ref={meshRef}
                    onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true); }}
                    onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false); }}
                    onClick={(e) => { e.stopPropagation(); onClick(); }}
                >
                    <icosahedronGeometry args={[4.5, 1]} />
                    <meshPhysicalMaterial 
                        transparent 
                        opacity={hovered ? 0.4 : 0.18} 
                        transmission={0.9} 
                        thickness={1} 
                        roughness={0.05} 
                        metalness={0.4}
                        color={color}
                    />
                    <Edges color={hovered ? '#FFF' : color} threshold={15} opacity={0.7} transparent />
                </mesh>
                <Html transform distanceFactor={28} position={[0, 0, 0]} pointerEvents="none">
                    <div className="flex flex-col items-center justify-center p-4 w-[280px] pointer-events-none select-none">
                        <span className="text-2xl font-black tracking-widest text-white text-center leading-tight transition-all duration-300"
                              style={{ 
                                  textShadow: hovered ? `0 0 35px ${color}, 0 0 70px ${color}` : `0 0 20px ${color}, 0 0 40px ${color}80`,
                                  color: 'white',
                                  transform: hovered ? 'scale(1.1)' : 'scale(1)'
                              }}>
                            <AutoTranslatedText text={getLocalizedText(category.label, i18nLanguage)} />
                        </span>
                    </div>
                </Html>
            </group>
        </Float>
    );
};

const ModalBackground3D = ({ activeFloorData, onClose, buttonTextColor, i18nLanguage, categories, onCategoryClick }: { activeFloorData: any, onClose: () => void, buttonTextColor: string, i18nLanguage: string, categories: any[], onCategoryClick: (catId: string) => void }) => {
    const groupRef = useRef<THREE.Group>(null);
    
    useFrame((state) => {
        if (!groupRef.current) return;
        const { x, y } = state.mouse;
        // Subtle parallax
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, x * 0.06, 0.05);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -y * 0.03, 0.05);
    });

    // Strategy for non-overlapping fragments around center [0, 0.5, 0]
    const fragmentPositions = useMemo(() => {
        if (!categories) return [];
        const positions: [number, number, number][] = [];
        const radius = 35; 
        const startAngle = -Math.PI * 0.9; // Shifted Left/Center
        const totalAngle = Math.PI * 0.9;  // Avoid right side (video frame)
        
        categories.forEach((_, i) => {
            const angle = startAngle + (totalAngle / (categories.length - 1 || 1)) * i;
            // High sky - avoiding center-ground and right-video areas
            const x = Math.cos(angle) * (radius + (i % 2 === 0 ? 12 : -8));
            const z = Math.sin(angle) * (radius + (i % 2 === 1 ? 6 : -12)) - 35; // Further back
            const y = 32 + Math.sin(i * 1.5) * 15; 
            positions.push([x, y, z]);
        });
        return positions;
    }, [categories]);

    return (
        <group ref={groupRef}>
            {/* Stars in the upper background */}
            <Stars radius={150} depth={60} count={6000} factor={5} saturation={0} fade speed={1} />
            
            {/* 3D Land at the bottom */}
            <group position={[0, -15, -15]}>
                <gridHelper args={[300, 60, COLORS.line, COLORS.line]} rotation={[0, 0, 0]}>
                    <lineBasicMaterial attach="material" transparent opacity={0.12} color={COLORS.line} />
                </gridHelper>
                
                {/* Ground plane for depth */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
                    <planeGeometry args={[300, 300]} />
                    <meshBasicMaterial color={COLORS.paper} transparent opacity={0.4} />
                </mesh>

                {/* Perspective-aligned Floor Info lying on the ground - CENTERED */}
                <group position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <Html transform distanceFactor={30} position={[0, 0, 0]} pointerEvents="auto">
                        <div className="flex flex-col items-center gap-6 select-none cursor-default" style={{ width: '1000px' }}>
                            <div className="flex flex-col items-center gap-4 mb-4 border-b-2 pb-8 w-full" style={{ borderColor: activeFloorData.color }}>
                                <span className="text-9xl font-black font-serif italic mb-2" style={{ color: activeFloorData.color, textShadow: `0 0 30px ${activeFloorData.color}80` }}>
                                    {activeFloorData.floor}
                                </span>
                                <span className="text-7xl font-black text-white tracking-widest leading-none text-center">
                                    <AutoTranslatedText text={getLocalizedText(activeFloorData.title, i18nLanguage)} />
                                </span>
                            </div>
                            <p className="text-white/70 font-sans text-2xl font-medium leading-relaxed mb-12 tracking-[0.2em] uppercase text-center max-w-[800px]">
                                <AutoTranslatedText text={`선택된 ${activeFloorData.floor}층의 스페이스 다이어그램입니다.`} /><br />
                                <AutoTranslatedText text="각 파편화된 다목적 조닝(Zoning) 블록을 확인하세요." />
                            </p>
                            <button
                                onClick={(e) => { e.stopPropagation(); onClose(); }}
                                className="w-[500px] py-8 font-bold tracking-[0.4em] text-3xl transition-all hover:scale-105 active:scale-95 flex justify-center items-center gap-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/20"
                                style={{ backgroundColor: activeFloorData.color, color: buttonTextColor }}
                            >
                                <span className="font-serif font-black text-4xl leading-none" style={{ color: buttonTextColor }}>→</span>
                                <AutoTranslatedText text="ENTER ZONE" />
                            </button>
                        </div>
                    </Html>
                </group>

                {/* 3D Glass Category Shards */}
                {categories && categories.map((cat, idx) => (
                    <GlassFragment 
                        key={idx} 
                        category={cat} 
                        position={fragmentPositions[idx]} 
                        color={activeFloorData.color} 
                        i18nLanguage={i18nLanguage} 
                        onClick={() => onCategoryClick(cat.id)}
                    />
                ))}
            </group>
            
            <ambientLight intensity={1.5} />
            <pointLight position={[30, 30, 30]} intensity={2.5} color={COLORS.line} />
        </group>
    );
};

// --- Traditional Pagoda Parts ---

const TraditionalRoof = ({ width, depth, color }: { width: number, depth: number, color?: string }) => {
    const overhang = METRICS.roofOverhang;
    const roofW = width + overhang * 2;
    const roofD = depth + overhang * 2;
    const h = METRICS.roofHeight;

    return (
        <group position={[0, METRICS.floorHeight - 0.05, 0]}>
            {/* 1. Main Roof Structure (Pyramid) - Darker and flatter */}
            <mesh position={[0, h / 2, 0]} rotation={[0, Math.PI / 4, 0]}>
                <coneGeometry args={[roofW * 0.707, h, 4]} />
                <meshStandardMaterial color={"#1a1a1a"} transparent opacity={0.95} />
                <Edges color={color || COLORS.line} threshold={20} />
            </mesh>
            
            {/* Tile lines (Ribs) - consistent with image */}
            <group position={[0, h/2, 0]}>
                {Array.from({ length: 16 }).map((_, i) => {
                    const angle = (i / 16) * Math.PI * 2;
                    if (i % 4 === 0) return null; // Skip corners
                    const x = Math.cos(angle) * (roofW / 2.5);
                    const z = Math.sin(angle) * (roofD / 2.5);
                    return (
                        <mesh key={i} position={[x, 0, z]} rotation={[0, -angle, Math.atan2(h, roofW/2)]}>
                            <boxGeometry args={[0.01, h * 1.5, 0.01]} />
                            <meshBasicMaterial color={COLORS.line} transparent opacity={0.1} />
                        </mesh>
                    );
                })}
            </group>

            {/* 2. Thick Eaves (Meakkereun) */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[roofW, 0.15, roofD]} />
                <SolidMaterial color={COLORS.fill} />
                <Edges color={color || COLORS.line} />
            </mesh>

            {/* 3. Corner Eaves-up */}
            {[
                [1, 1], [1, -1], [-1, -1], [-1, 1]
            ].map(([x, z], i) => (
                <group key={i} position={[x * roofW / 2, 0.05, z * roofD / 2]} rotation={[0, Math.atan2(-z, -x) + Math.PI/4, 0]}>
                    <mesh position={[0.3, 0.1, 0.3]} rotation={[0, 0, 0.4]}>
                        <boxGeometry args={[0.5, 0.05, 0.05]} />
                        <meshBasicMaterial color={color || COLORS.line} />
                    </mesh>
                </group>
            ))}
        </group>
    );
};

const GongPo = ({ x, z }: { x: number, z: number }) => (
    <group position={[x, METRICS.floorHeight - 0.35, z]}>
        {/* Layered brackets - smaller and more integrated */}
        <mesh position={[0, 0.08, 0]}>
            <boxGeometry args={[0.45, 0.06, 0.25]} />
            <SolidMaterial color={COLORS.fill} />
            <Edges color={COLORS.line} />
        </mesh>
        <mesh position={[0, 0.16, 0]}>
            <boxGeometry args={[0.6, 0.06, 0.3]} />
            <SolidMaterial color={COLORS.fill} />
            <Edges color={COLORS.line} />
        </mesh>
    </group>
);

const Railings = ({ width, depth }: { width: number, depth: number }) => {
    const h = 0.5;
    const postCount = 10;
    return (
        <group position={[0, 0.1, 0]}>
            {/* Top Rail - thinner */}
            <mesh position={[0, h, depth / 2]}>
                <boxGeometry args={[width, 0.03, 0.03]} />
                <meshBasicMaterial color={COLORS.line} />
            </mesh>
            <mesh position={[0, h, -depth / 2]}>
                <boxGeometry args={[width, 0.03, 0.03]} />
                <meshBasicMaterial color={COLORS.line} />
            </mesh>
            <mesh position={[width / 2, h, 0]}>
                <boxGeometry args={[0.03, 0.03, depth]} />
                <meshBasicMaterial color={COLORS.line} />
            </mesh>
            <mesh position={[-width / 2, h, 0]}>
                <boxGeometry args={[0.03, 0.03, depth]} />
                <meshBasicMaterial color={COLORS.line} />
            </mesh>

            {/* Balustrade pattern */}
            {Array.from({ length: postCount }).map((_, i) => {
                const step = (i / (postCount - 1)) - 0.5;
                return (
                    <group key={i}>
                        <mesh position={[step * width * 0.98, h / 2, depth / 2]}>
                            <boxGeometry args={[0.02, h, 0.02]} />
                            <meshBasicMaterial color={COLORS.line} transparent opacity={0.2} />
                        </mesh>
                        <mesh position={[step * width * 0.98, h / 2, -depth / 2]}>
                            <boxGeometry args={[0.02, h, 0.02]} />
                            <meshBasicMaterial color={COLORS.line} transparent opacity={0.2} />
                        </mesh>
                        <mesh position={[width / 2, h / 2, step * depth * 0.98]}>
                            <boxGeometry args={[0.02, h, 0.02]} />
                            <meshBasicMaterial color={COLORS.line} transparent opacity={0.2} />
                        </mesh>
                        <mesh position={[-width / 2, h / 2, step * depth * 0.98]}>
                            <boxGeometry args={[0.02, h, 0.02]} />
                            <meshBasicMaterial color={COLORS.line} transparent opacity={0.2} />
                        </mesh>
                    </group>
                );
            })}
        </group>
    );
};


// --- Detailed Structural Parts ---

const PagodaCore = ({ height, width, depth }: { height: number, width: number, depth: number }) => (
    <group position={[0, height / 2, 0]}>
        {/* Main Body */}
        <mesh>
            <boxGeometry args={[width * 0.8, height, depth * 0.8]} />
            <SolidMaterial color={COLORS.fill} transparent opacity={0.5} />
            <Edges color={COLORS.line} threshold={15} />
        </mesh>
        
        {/* High-detail Latticed Frames (Increased prominence) */}
        {[-width * 0.4, width * 0.4].map((z, i) => (
            <group key={i} position={[0, 0, z]}>
                {/* Horizontal frames */}
                {[-0.3, 0, 0.3].map(y => (
                    <mesh key={y} position={[0, y * height, 0]}>
                        <boxGeometry args={[width * 0.8, 0.03, 0.03]} />
                        <meshBasicMaterial color={COLORS.line} transparent opacity={0.6} />
                    </mesh>
                ))}
                {/* Vertical frames (Bays) */}
                {[-0.3, -0.1, 0.1, 0.3].map(x => (
                    <mesh key={x} position={[x * width, 0, 0]}>
                        <boxGeometry args={[0.03, height, 0.03]} />
                        <meshBasicMaterial color={COLORS.line} transparent opacity={0.6} />
                    </mesh>
                ))}
            </group>
        ))}
    </group>
);

const Columns = ({ width, depth, height }: { width: number, depth: number, height: number }) => {
    const bays = METRICS.bays;
    const positions: [number, number][] = [];
    
    for (let i = 0; i < bays; i++) {
        for (let j = 0; j < bays; j++) {
            if (i === 0 || i === bays - 1 || j === 0 || j === bays - 1) {
                const x = ((i / (bays - 1)) - 0.5) * width;
                const z = ((j / (bays - 1)) - 0.5) * depth;
                positions.push([x, z]);
            }
        }
    }

    return (
        <group>
            {positions.map(([x, z], i) => (
                <group key={i}>
                    <mesh position={[x, height / 2, z]}>
                        <boxGeometry args={[METRICS.columnThickness, height, METRICS.columnThickness]} />
                        <SolidMaterial />
                        <Edges color={COLORS.line} />
                    </mesh>
                    <GongPo x={x} z={z} />
                </group>
            ))}
        </group>
    );
};

// 1st Floor has more columns (5 per side = 4 bays) for structural scale
const FirstFloorColumns = ({ width, depth, height }: { width: number, depth: number, height: number }) => {
    const bays = 5;
    const positions: [number, number][] = [];
    for (let i = 0; i < bays; i++) {
        for (let j = 0; j < bays; j++) {
            if (i === 0 || i === bays - 1 || j === 0 || j === bays - 1) {
                const x = ((i / (bays - 1)) - 0.5) * width;
                const z = ((j / (bays - 1)) - 0.5) * depth;
                positions.push([x, z]);
            }
        }
    }
    return (
        <group>
            {positions.map(([x, z], i) => (
                <group key={i}>
                    <mesh position={[x, height / 2, z]}>
                        <boxGeometry args={[METRICS.columnThickness * 1.1, height, METRICS.columnThickness * 1.1]} />
                        <SolidMaterial />
                        <Edges color={COLORS.line} />
                    </mesh>
                    <GongPo x={x} z={z} />
                </group>
            ))}
        </group>
    );
};

const FloorUnit = ({ floor, yPos, isSelected, isHovered, onHover, onToggleModal, isSelectedAnything, isMobile }: any) => {
    const [isMainButtonHovered, setIsMainButtonHovered] = React.useState(false);
    const [isPlaceholderHovered, setIsPlaceholderHovered] = React.useState(false);

    const active = isSelected || isHovered || isMainButtonHovered;
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

    const floorScale = 1 - (parseInt(floor.floor) - 1) * METRICS.taperFactor;
    const isFirstFloor = floor.floor === "1";
    
    // Significantly more prominent first floor (Higher and Wider)
    const currentHeight = isFirstFloor ? METRICS.floorHeight * 1.5 : METRICS.floorHeight;
    const currentW = METRICS.width * floorScale * (isFirstFloor ? 1.4 : 1);
    const currentD = METRICS.depth * floorScale * (isFirstFloor ? 1.4 : 1);

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
                <boxGeometry args={[currentW + 0.5, METRICS.slabThickness, currentD + 0.5]} />
                <SolidMaterial />
                <Edges color={COLORS.line} />
            </mesh>

            <Railings width={currentW + 0.5} depth={currentD + 0.5} />
            {isFirstFloor ? (
                <FirstFloorColumns width={currentW} depth={currentD} height={currentHeight} />
            ) : (
                <Columns width={currentW} depth={currentD} height={currentHeight} />
            )}
            <PagodaCore height={currentHeight} width={currentW} depth={currentD} />
            <TraditionalRoof width={currentW} depth={currentD} color={active ? floor.color : COLORS.line} />

            {/* Active Highlight Volume */}
            <mesh position={[0, METRICS.floorHeight / 2, 0]} scale={0.99}>
                <boxGeometry args={[currentW, METRICS.floorHeight, currentD]} />
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
                    position={[
                        METRICS.width / 2 + (isMobile ? 6.0 : 5.5), 
                        METRICS.floorHeight / 2, 
                        METRICS.depth / 2
                    ]}
                    center
                    zIndexRange={[50, 100]}
                >
                    <div 
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            pointerEvents: 'auto',
                            transition: 'all 0.3s ease',
                            zIndex: 50
                        }}
                    >
                        {/* Elegant Dotted Line */}
                        <div style={{
                            width: '60px',
                            borderTop: `2px dotted ${(isHovered || isMainButtonHovered) ? floor.color : 'rgba(255, 255, 255, 0.2)'}`,
                            opacity: (isHovered || isMainButtonHovered) ? 1.0 : 0.3,
                            transition: 'all 0.4s ease'
                        }} />

                        {/* Relative container to anchor label and placeholder */}
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginLeft: '12px', gap: isMobile ? '8px' : '15px' }}>
                            {/* Existing Button */}
                            <div 
                                onPointerEnter={(e) => { e.stopPropagation(); setIsMainButtonHovered(true); onHover(parseInt(floor.floor)); document.body.style.cursor = 'pointer'; }}
                                onPointerLeave={() => { setIsMainButtonHovered(false); onHover(null); document.body.style.cursor = 'auto'; }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleModal();
                                }}
                                style={{
                                    width: isMobile ? '40px' : '64px',
                                    height: isMobile ? '40px' : '64px',
                                    borderRadius: '50%',
                                    border: `1.5px solid ${(isHovered || isMainButtonHovered) ? floor.color : 'rgba(255, 255, 255, 0.3)'}`,
                                    backgroundColor: (isHovered || isMainButtonHovered) ? `${floor.color}22` : 'rgba(20, 28, 25, 0.6)',
                                    backdropFilter: 'blur(10px)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: (isHovered || isMainButtonHovered) 
                                        ? `0 0 20px ${floor.color}44, inset 0 0 10px ${floor.color}33` 
                                        : '0 4px 15px rgba(0,0,0,0.3)',
                                    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
                                    transform: (isHovered || isMainButtonHovered) ? 'scale(1.1)' : 'scale(1)',
                                    position: 'relative',
                                    zIndex: (isHovered || isMainButtonHovered) ? 10 : 1
                                }}
                            >
                                <span style={{ 
                                    fontSize: isMobile ? '16px' : '24px', 
                                    fontWeight: '900', 
                                    color: (isHovered || isMainButtonHovered) ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
                                    lineHeight: 1,
                                    fontFamily: 'serif',
                                    textShadow: (isHovered || isMainButtonHovered) ? `0 0 10px ${floor.color}` : 'none'
                                }}>
                                    {floor.floor}
                                </span>
                                
                                {/* Inner Ring Detail */}
                                <div style={{
                                    position: 'absolute',
                                    top: '4px', left: '4px', right: '4px', bottom: '4px',
                                    borderRadius: '50%',
                                    border: `0.5px solid ${(isHovered || isMainButtonHovered) ? floor.color : 'rgba(255, 255, 255, 0.1)'}`,
                                    opacity: 0.5,
                                    pointerEvents: 'none'
                                }} />
                            </div>

                            {/* Expansion Placeholder Button (Same Design) */}
                            <div 
                                onPointerEnter={(e) => { e.stopPropagation(); setIsPlaceholderHovered(true); document.body.style.cursor = 'pointer'; }}
                                onPointerLeave={() => { setIsPlaceholderHovered(false); document.body.style.cursor = 'auto'; }}
                                style={{
                                    width: isMobile ? '36px' : '56px',
                                    height: isMobile ? '36px' : '56px',
                                    borderRadius: '50%',
                                    border: isPlaceholderHovered ? `1.5px solid ${floor.color}` : '1.5px dashed rgba(255, 255, 255, 0.2)',
                                    backgroundColor: isPlaceholderHovered ? `${floor.color}11` : 'rgba(255, 255, 255, 0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.4s ease',
                                    opacity: 1,
                                    transform: isPlaceholderHovered ? 'scale(1.1)' : 'scale(1)',
                                    boxShadow: isPlaceholderHovered ? `0 0 15px ${floor.color}33` : 'none',
                                    zIndex: isPlaceholderHovered ? 10 : 1
                                }}
                            >
                                <span style={{ 
                                    fontSize: isMobile ? '14px' : '20px', 
                                    fontWeight: '400', 
                                    color: isPlaceholderHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                                    lineHeight: 1
                                }}>+</span>
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
            position={[0, -(totalHeight * 0.5) + (isMobile ? 1.8 : 6.5), 0]} 
            scale={isMobile ? [0.55, 0.75, 0.55] : [0.9, 0.55, 0.9]}
            onClick={(e) => {
                e.stopPropagation();
                if (hoveredFloor) {
                    setHoveredFloor(null);
                }
            }}
        >
            {/* Central 'Gimsim' Pillar through all floors */}
            <mesh position={[0, (floors.length * METRICS.floorHeight) / 2, 0]}>
                <cylinderGeometry args={[0.3, 0.3, floors.length * METRICS.floorHeight, 12]} />
                <SolidMaterial color={COLORS.fill} />
                <Edges color={COLORS.line} />
            </mesh>

            {/* Foundation - Traditional Double Platform with Steps */}
            <group position={[0, -METRICS.slabThickness * 2.5, 0]}>
                {/* Lower Level */}
                <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[METRICS.width + 4, METRICS.slabThickness * 2.5, METRICS.depth + 4]} />
                    <SolidMaterial />
                    <Edges color={COLORS.line} />
                    <gridHelper args={[METRICS.width + 4, 8, COLORS.line, COLORS.line]} position={[0, METRICS.slabThickness * 1.25 + 0.01, 0]}>
                        <lineBasicMaterial attach="material" transparent opacity={0.1} color={COLORS.line} />
                    </gridHelper>
                </mesh>
                {/* Upper Level */}
                <mesh position={[0, METRICS.slabThickness * 2.5, 0]}>
                    <boxGeometry args={[METRICS.width + 2, METRICS.slabThickness * 2.5, METRICS.depth + 2]} />
                    <SolidMaterial />
                    <Edges color={COLORS.line} />
                    <gridHelper args={[METRICS.width + 2, 6, COLORS.line, COLORS.line]} position={[0, METRICS.slabThickness * 1.25 + 0.01, 0]}>
                        <lineBasicMaterial attach="material" transparent opacity={0.1} color={COLORS.line} />
                    </gridHelper>
                </mesh>
            </group>

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
                                    className="flex items-center gap-4 mb-6"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div 
                                        className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
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
                                        <div className="flex flex-col gap-1">
                                            <span style={{ fontSize: '10px', color: activeFloorData.color, letterSpacing: '0.3em', fontWeight: '900', marginBottom: '2px' }}>FLOOR TITLE</span>
                                            <h4 style={{ color: '#fff', fontSize: isMobile ? '16px' : '22px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.2 }}>
                                                <AutoTranslatedText text={getLocalizedText(activeFloorData.title, lang)} />
                                            </h4>
                                            
                                            {/* Watch Video Link - Repositioned below title */}
                                            <motion.div
                                                whileHover={{ scale: 1.02, opacity: 1 }}
                                                className="flex items-center gap-2 transition-all whitespace-nowrap opacity-70 mt-1"
                                                style={{ 
                                                    color: activeFloorData.color,
                                                    fontSize: isMobile ? '10px' : '12px',
                                                    fontWeight: '700',
                                                    letterSpacing: '0.02em',
                                                }}
                                            >
                                                <Play size={isMobile ? 10 : 12} fill={activeFloorData.color} stroke="none" />
                                                <span>영상보러가기</span>
                                            </motion.div>
                                        </div>
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


    /* Decorative blocks removed to prevent visual confusion */

    const [cameraZPos, setCameraZPos] = useState(60);

    // Mobile 2D Modal Layout (Image 1 style)
    if (isMobile) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
                onClick={onClose}
            >
                <motion.div 
                    className="relative w-full max-w-sm bg-[#1A2420] border-2 border-[#00FFC2] p-8 flex flex-col gap-8 shadow-[0_0_50px_rgba(0,255,194,0.2)]"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header: Floor Info */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-baseline gap-4">
                            <span className="text-[64px] font-black text-[#00FFC2] leading-none tracking-tighter">
                                {activeFloorData.floor}
                            </span>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-mono font-bold text-[#00FFC2] tracking-[0.3em] uppercase opacity-70">Floor Title</span>
                                <h2 className="text-2xl font-black text-white uppercase leading-tight">
                                    <AutoTranslatedText text={getLocalizedText(activeFloorData.title, i18n.language)} />
                                </h2>
                            </div>
                        </div>
                        
                        {/* Video Link */}
                        <button 
                            onClick={() => setIsVideoExpanded(true)}
                            className="flex items-center gap-2 text-[#00FFC2] hover:text-[#00FFC2]/80 transition-colors mt-2"
                        >
                            <Play size={14} fill="currentColor" />
                            <span className="text-[10px] font-bold tracking-widest uppercase"><AutoTranslatedText text="영상보러가기" /></span>
                        </button>
                    </div>

                    {/* Subcategories List */}
                    <div className="flex flex-col gap-6 py-4">
                        {activeFloorData.subitems?.map((sub: any, idx: number) => (
                            <button 
                                key={idx}
                                onClick={() => {
                                    onClose();
                                    navigate(`/category/${sub.id}`);
                                }}
                                className="flex items-center gap-4 text-white/90 hover:text-[#00FFC2] transition-all group w-full text-left"
                            >
                                <span className="w-4 h-[2px] bg-[#00FFC2] block transition-transform group-hover:scale-x-150 origin-left" />
                                <span className="text-lg font-black tracking-wider group-hover:translate-x-1 transition-transform">
                                    <AutoTranslatedText text={getLocalizedText(sub.label, i18n.language)} />
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Footer: Metadata & Close */}
                    <div className="mt-4 pt-8 border-t border-white/10 flex items-center justify-between">
                        <div className="flex flex-col gap-1 opacity-50">
                            <span className="text-[8px] font-mono font-bold text-white tracking-[0.2em] uppercase">Structural Fragment</span>
                            <span className="text-[8px] font-mono text-[#00FFC2] tracking-[0.1em]">CODE: DEPT_FR_{activeFloorData.floor.replace(/\D/g, '')}</span>
                        </div>
                        
                        <button 
                            onClick={onClose}
                            className="flex items-center gap-3 text-[#00FFC2] group"
                        >
                            <div className="flex items-center justify-center translate-y-[1px]">
                                <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                                    <ArrowRight size={18} />
                                </motion.div>
                            </div>
                            <span className="text-sm font-black tracking-[0.2em] uppercase group-hover:tracking-[0.4em] transition-all">Close</span>
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        );
    }

    return (
             <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[1000] overflow-hidden bg-[#0A100D]"
        >
            {/* 3D Background Space - Enabled Pointer Events for OrbitControls */}
            <div className="absolute inset-0 z-0 pointer-events-auto">
                <Canvas camera={{ position: [0, 15, cameraZPos], fov: 50 }}>
                    <ModalBackground3D 
                        activeFloorData={activeFloorData} 
                        onClose={onClose} 
                        buttonTextColor={buttonTextColor} 
                        i18nLanguage={i18n.language} 
                        categories={activeFloorData.subitems}
                        onCategoryClick={(catId) => {
                            onClose();
                            navigate(`/category/${catId}`);
                        }}
                    />
                    <OrbitControls 
                        enableDamping 
                        dampingFactor={0.06} 
                        rotateSpeed={-0.8} // Slightly faster for responsiveness
                        enableZoom={true}
                        maxPolarAngle={Math.PI / 1.3} // Increased significantly to allow sky view
                        minPolarAngle={0.1} // Allow looking directly down
                    />
                </Canvas>
            </div>

            {/* Navigation Overlay (Arrows and Click Areas) */}
            <div className="absolute inset-0 pointer-events-none z-[1100]">
                {/* Move Forward (Top) */}
                <button 
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        setCameraZPos(prev => Math.max(25, prev - 10)); 
                    }}
                    className="absolute top-12 left-1/2 -translate-x-1/2 p-6 pointer-events-auto flex flex-col items-center gap-2 group transition-all duration-300"
                >
                    <ChevronUp size={28} className="text-[#00FFC2] opacity-40 group-hover:opacity-100 group-hover:-translate-y-1 transition-all" />
                    <span className="text-[#00FFC2] font-mono text-[10px] tracking-[0.4em] uppercase opacity-0 group-hover:opacity-40 transition-all">Move Forward</span>
                </button>

                {/* Move Backward (Bottom) */}
                <button 
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        setCameraZPos(prev => Math.min(100, prev + 10)); 
                    }}
                    className="absolute bottom-32 left-1/2 -translate-x-1/2 p-6 pointer-events-auto flex flex-col items-center gap-2 group transition-all duration-300"
                >
                    <span className="text-[#00FFC2] font-mono text-[10px] tracking-[0.4em] uppercase opacity-0 group-hover:opacity-40 transition-all">Move Backward</span>
                    <ChevronDown size={28} className="text-[#00FFC2] opacity-40 group-hover:opacity-100 group-hover:translate-y-1 transition-all" />
                </button>
            </div>


            {/* Subtle SVG overlay for architectural grit */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
                <line x1="0%" y1="20%" x2="100%" y2="80%" stroke={MODAL_COLORS.line} strokeWidth="1" />
                <line x1="100%" y1="10%" x2="0%" y2="90%" stroke={MODAL_COLORS.line} strokeWidth="0.5" />
            </svg>

            {/* Close button removed as requested. Modal can be closed via backdrop click or the ENTER ZONE button below. */}

            {/* Decorative geometrical blocks removed */}

            {/* 3D Background Space Handles Fragments */}
            
            <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 100 }}
                animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    x: 0,
                    boxShadow: [
                        "0 0 50px rgba(255, 140, 0, 0.4), 0 0 100px rgba(255, 140, 0, 0.2)",
                        "0 0 80px rgba(255, 140, 0, 0.6), 0 0 150px rgba(255, 140, 0, 0.3)",
                        "0 0 50px rgba(255, 140, 0, 0.4), 0 0 100px rgba(255, 140, 0, 0.2)"
                    ]
                }}
                transition={{ 
                    opacity: { duration: 0.8, delay: 0.2 },
                    scale: { duration: 0.8, delay: 0.2 },
                    x: { duration: 0.8, delay: 0.2 },
                    boxShadow: { 
                        duration: 3, 
                        repeat: Infinity, 
                        ease: "easeInOut"
                    }
                }}
                className="absolute right-8 md:right-16 top-12 md:top-24 z-60 rounded-full"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsVideoExpanded(true);
                }}
            >
                <div className="relative group cursor-pointer">
                    <div
                        className="w-[200px] h-[200px] md:w-[300px] md:h-[300px] rounded-full overflow-hidden border-[6px] border-[#FF8C00] shadow-[0_0_40px_rgba(255,140,0,0.6),inset_0_0_30px_rgba(255,215,0,0.4)] transition-all duration-700 group-hover:scale-110 bg-[#0A100D] relative"
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

                    {/* Sun-like Neon Aura (Expanding light effect) */}
                    <svg className="absolute inset-[-100px] w-[500px] h-[500px] pointer-events-none overflow-visible">
                        {/* Core Neon ring */}
                        <circle cx="250" cy="250" r="170" fill="none" stroke="#FF8C00" strokeWidth="2" opacity="0.8" />
                        
                        {/* Spreading Glow Layers */}
                        <circle cx="250" cy="250" r="175" fill="none" stroke="#FF8C00" strokeWidth="8" opacity="0.2" filter="blur(4px)" className="animate-pulse" />
                        <circle cx="250" cy="250" r="190" fill="none" stroke="#FFD700" strokeWidth="20" opacity="0.1" filter="blur(15px)" />
                        <circle cx="250" cy="250" r="220" fill="none" stroke="#FFA500" strokeWidth="40" opacity="0.05" filter="blur(40px)" />
                        
                        {/* Static subtle floor accent */}
                        <circle cx="250" cy="250" r="165" fill="none" stroke={activeFloorData.color} strokeWidth="2" opacity="0.3" />
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

                    <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 whitespace-nowrap">
                        <span className="font-mono text-[10px] tracking-[0.4em] uppercase font-bold text-[#FFD700] bg-black/60 px-6 py-2 rounded-full border border-[#FFD700]/40 backdrop-blur-md shadow-[0_0_20px_rgba(255,215,0,0.2)]">
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

            {/* Subcategory Fragments are now rendered in 3D Background */}
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
            <div className="absolute top-12 md:top-24 left-8 md:left-16 pointer-events-none z-10">
                {/* Front-aligned Logo above title */}
                <div className="-mb-2 opacity-80">
                    <img 
                        src="/K로고.png" 
                        alt="Logo" 
                        className="h-24 w-auto drop-shadow-[0_0_20px_rgba(0,255,194,0.3)]" 
                    />
                </div>

                <h1 className="text-[#00FFC2] text-3xl md:text-5xl font-black uppercase font-serif tracking-tight leading-none mb-4 drop-shadow-[0_0_15px_rgba(0,255,194,0.4)] opacity-80">
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
                    onUpdate={(c) => c.lookAt(0, isMobile ? 0.0 : 1.2, 0)}
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
                    <AutoTranslatedText text="[Drag to Rotate] • [Click Floor Button to Select]" />
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
