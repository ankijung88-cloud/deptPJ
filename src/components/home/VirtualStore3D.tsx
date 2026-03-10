import React, { useRef, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { getContrastColor } from '../../utils/themeUtils';

// --- Theme & Configuration ---
const COLORS = {
    paper: '#1A2420',       // Deep Pine Background
    line: '#00FFC2',        // Neon Mint blueprint lines
    fill: '#222B28',        // Slightly lighter pine for structure
    highlight: '#FF3B30'    // Glitch Red highlight for interactions
};

const FLOORS = [
    {
        level: 6,
        title: 'LOCAL HERITAGE',
        label: '6F',
        color: '#FF3B30', // Red (South)
        videoUrl: 'https://tjucpoqxzsolmmceguez.supabase.co/storage/v1/object/public/dept-media/video/festival.mp4',
        subcategories: [
            { id: 'heritage', label: '지역 문화 유산' },
            { id: 'travel', label: '전략적 앵커' },
            { id: 'f6_gourmet', label: '미식 아카이브' },
            { id: 'f6_craft', label: '지역 공예관' },
            { id: 'f6_tour', label: '헤리티지 투어' }
        ]
    },
    {
        level: 5,
        title: 'FASHION ARCHIVE',
        label: '5F',
        color: '#FFD700', // Yellow (Center)
        videoUrl: 'https://tjucpoqxzsolmmceguez.supabase.co/storage/v1/object/public/dept-media/video/modern_tradition.mp4',
        subcategories: [
            { id: 'archive', label: '패션 아카이브' },
            { id: 'collection', label: '시즌 컬렉션' },
            { id: 'f5_material', label: '소재 도서관' },
            { id: 'f5_fitting', label: '피팅 스튜디오' },
            { id: 'f5_textile', label: '텍스타일 룸' }
        ]
    },
    {
        level: 4,
        title: 'CULTURE TALK',
        label: '4F',
        color: '#F8FAFF', // White (West)
        videoUrl: 'https://tjucpoqxzsolmmceguez.supabase.co/storage/v1/object/public/dept-media/video/travel.mp4',
        subcategories: [
            { id: 'talk', label: '문화 담론' },
            { id: 'interview', label: '아티스트 인터뷰' },
            { id: 'f4_plus', label: '토크 플러스' },
            { id: 'f4_book', label: '도서관 섹션' },
            { id: 'f4_seminar', label: '세미나 룸' }
        ]
    },
    {
        level: 3,
        title: 'PERFORMANCE & EXHIBITION',
        label: '3F',
        color: '#0070FF', // Blue (East)
        videoUrl: 'https://tjucpoqxzsolmmceguez.supabase.co/storage/v1/object/public/dept-media/video/active.mp4',
        subcategories: [
            { id: 'performance', label: '공연 실황' },
            { id: 'exhibit', label: '가상 전시' },
            { id: 'f3_media', label: '미디어 아트 홀' },
            { id: 'f3_lounge', label: '아티스트 라운지' },
            { id: 'f3_audio', label: '사운드 아카이브' }
        ]
    },
    {
        level: 2,
        title: 'COLLABORATION & POP-UP',
        label: '2F',
        color: '#00FFC2', // Cyan/Green (East/Neo-Dancheong Mint)
        videoUrl: 'https://tjucpoqxzsolmmceguez.supabase.co/storage/v1/object/public/dept-media/video/trend.mp4',
        subcategories: [
            { id: 'sync', label: '시너지 공간' },
            { id: 'pop', label: '다이내믹 팝업' },
            { id: 'f2_lab', label: '브랜드 랩' },
            { id: 'f2_art', label: '아트 콜라보' },
            { id: 'f2_gallery', label: '한정판 갤러리' }
        ]
    },
    {
        level: 1,
        title: 'K-CULTURE TRENDS',
        label: '1F',
        color: '#0A0D17', // Black (North/Void Navy)
        videoUrl: 'https://tjucpoqxzsolmmceguez.supabase.co/storage/v1/object/public/dept-media/video/k-culture.mp4',
        subcategories: [
            { id: 'global', label: '글로벌 트렌드' },
            { id: 'window', label: '디지털 쇼윈도' },
            { id: 'f1_kpop', label: 'K-팝 스테이지' },
            { id: 'f1_library', label: '트렌드 라이브러리' },
            { id: 'f1_tech', label: '한류 테크존' }
        ]
    },
];

const METRICS = {
    floorHeight: 2.8,
    width: 13,
    depth: 13,
    slabThickness: 0.3,
    columnThickness: 0.25,
    coreSize: 3.5
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

const FloorUnit = ({ floor, yPos, isSelected, isHovered, onHover, onClick, isSelectedAnything }: any) => {
    const active = isSelected || isHovered;
    const targetScale = active ? 1.02 : 1;
    const groupRef = useRef<THREE.Group>(null);
    const highlightRef = useRef<THREE.MeshStandardMaterial>(null);

    useFrame((_, delta) => {
        if (groupRef.current) {
            groupRef.current.scale.lerp(new THREE.Vector3(targetScale, 1, targetScale), 8 * delta);
        }
        if (highlightRef.current) {
            const targetOpacity = active ? 0.15 : 0;
            highlightRef.current.opacity = THREE.MathUtils.lerp(highlightRef.current.opacity, targetOpacity, 8 * delta);
        }
    });

    return (
        <group
            ref={groupRef}
            position={[0, yPos, 0]}
            onPointerOver={(e) => { e.stopPropagation(); onHover(floor.level); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { onHover(null); document.body.style.cursor = 'auto'; }}
            onClick={(e) => { e.stopPropagation(); onClick(floor.level === isSelected ? null : floor.level); }}
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

            {/* Right-aligned 3D Label matching sketch - hidden when modal is open */}
            {!isSelectedAnything && (
                <Html
                    position={[METRICS.width / 2 + 0.5, METRICS.floorHeight / 2, METRICS.depth / 2]}
                    center
                    style={{
                        transition: 'all 0.3s ease',
                        transform: active ? 'scale(1.1)' : 'scale(1)',
                        pointerEvents: 'none'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                        {/* Elegant Dotted Line for Architectural Detail */}
                        <div style={{
                            width: active ? '60px' : '40px',
                            borderTop: `2px dotted ${active ? floor.color : COLORS.line}`,
                            opacity: active ? 0.9 : 0.4,
                            transition: 'all 0.4s ease'
                        }} />

                        <div style={{
                            fontFamily: 'serif',
                            marginLeft: '12px',
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: '12px',
                            whiteSpace: 'nowrap',
                            // Aggressive neon halo for perfect readability
                            textShadow: '0 0 12px rgba(0, 255, 194, 0.4), 0 0 8px rgba(0, 255, 194, 0.2)',
                            transition: 'all 0.4s ease',
                            transform: active ? 'scale(1.15) translateX(10px)' : 'scale(1)',
                            color: active ? floor.color : '#ffffff'
                        }}>
                            <span style={{ fontSize: '42px', fontWeight: '900', lineHeight: 1 }}>
                                {floor.label}
                            </span>

                            <span style={{
                                fontSize: '15px',
                                fontWeight: '900',
                                letterSpacing: '0.12em',
                                opacity: active ? 1 : 0.7,
                                borderLeft: `2.5px solid ${active ? floor.color : COLORS.line}`,
                                paddingLeft: '12px',
                                textTransform: 'uppercase'
                            }}>
                                <AutoTranslatedText text={floor.title} />
                            </span>
                        </div>
                    </div>
                </Html>
            )}
        </group>
    );
};

// --- Scene Assembly ---

const BlueprintBuilding = ({ selectedFloor, hoveredFloor, setHoveredFloor, setSelectedFloor }: any) => {
    // Center the building vertically
    const totalHeight = FLOORS.length * METRICS.floorHeight;

    return (
        <group position={[0, -(totalHeight / 2) + 2, 0]}>
            {/* Foundation */}
            <mesh position={[0, -METRICS.slabThickness, 0]}>
                <boxGeometry args={[METRICS.width + 1.5, METRICS.slabThickness, METRICS.depth + 1.5]} />
                <SolidMaterial />
                <Edges color={COLORS.line} />
            </mesh>

            {FLOORS.slice().reverse().map((floor, index) => (
                <FloorUnit
                    key={floor.level}
                    floor={floor}
                    yPos={index * METRICS.floorHeight}
                    isSelected={selectedFloor === floor.level}
                    isHovered={hoveredFloor === floor.level}
                    isSelectedAnything={selectedFloor !== null}
                    onHover={setHoveredFloor}
                    onClick={setSelectedFloor}
                />
            ))}

            {/* Top Roof Cover */}
            <mesh position={[0, FLOORS.length * METRICS.floorHeight, 0]}>
                <boxGeometry args={[METRICS.width + 0.5, METRICS.slabThickness, METRICS.depth + 0.5]} />
                <SolidMaterial />
                <Edges color={COLORS.line} />
            </mesh>
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
const FragmentedModal = ({ activeFloorData, onClose }: { activeFloorData: any, onClose: () => void }) => {
    const navigate = useNavigate();
    const [isVideoExpanded, setIsVideoExpanded] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [videoError, setVideoError] = useState(false);
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
        if (!activeFloorData?.subcategories) return [];

        // Define 8 non-overlapping screen zones (Ergonomic L-shape: Top and Left areas to balance bottom-right main modal)
        const zones = [
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

        return activeFloorData.subcategories.slice(0, zones.length).map((sub: any, i: number) => {
            const zone = shuffledZones[i];
            return {
                id: i,
                subId: sub.id,
                text: sub.label,
                width: 150,
                height: 80,
                // Keep the items focused slightly more within their zone boundary to prevent bleed
                top: zone.t[0] + Math.random() * (zone.t[1] - zone.t[0]),
                left: zone.l[0] + Math.random() * (zone.l[1] - zone.l[0]),
                delay: i * 0.08,
                type: Math.floor(Math.random() * 4)
            };
        });
    }, [activeFloorData]);

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
                initial={{ opacity: 0, scale: 0.9, x: 50 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute right-12 bottom-12 bg-[#1A2420]/80 backdrop-blur-xl border-2 shadow-2xl p-10 z-50 min-w-[500px] cursor-default"
                style={{ borderColor: MODAL_COLORS.line }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-6 mb-6 pb-6 border-b-2" style={{ borderColor: activeFloorData.color }}>
                    <span className="text-8xl font-black font-serif" style={{ color: activeFloorData.color }}>
                        {activeFloorData.label}
                    </span>
                    <span className="text-4xl font-black text-white tracking-tighter leading-none break-words max-w-[250px]">
                        <AutoTranslatedText text={activeFloorData.title} />
                    </span>
                </div>
                <p className="text-white/80 font-sans text-sm font-medium leading-relaxed mb-8 tracking-wide">
                    <AutoTranslatedText text={`선택된 ${activeFloorData.label}층의 스페이스 다이어그램입니다.`} /><br />
                    <AutoTranslatedText text="각 파편화된 다목적 조닝(Zoning) 블록을 확인하세요." />
                </p>
                <button
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    className="w-full py-4 font-bold tracking-widest text-lg transition-transform hover:bg-opacity-90 active:scale-95 flex justify-center items-center gap-4 shadow-md"
                    style={{ backgroundColor: activeFloorData.color, color: buttonTextColor }}
                >
                    <span className="font-serif font-black text-2xl leading-none relative -top-[2px]" style={{ color: buttonTextColor }}>→</span>
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
                        className="w-[300px] h-[300px] rounded-full overflow-hidden border-4 border-[#00F2FF]/30 shadow-[0_0_50px_rgba(0,242,255,0.2)] transition-transform duration-500 group-hover:scale-110"
                        style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
                    >
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover rounded-full"
                            style={{ clipPath: 'circle(50% at 50% 50%)' }}
                            src={activeFloorData.videoUrl}
                        />
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
                                <AutoTranslatedText text={activeFloorData.title} />
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
                                        Preview Loading or Unavailable
                                    </p>
                                </div>
                            )}

                            <div className="absolute bottom-10 right-10 flex items-center gap-4">
                                <button
                                    onClick={() => setIsMuted(!isMuted)}
                                    className="p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all"
                                >
                                    {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                                </button>
                            </div>
                        </motion.div>
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
                        className="absolute shadow-xl flex items-center justify-center p-4 cursor-pointer hover:scale-105 hover:z-[70] transition-all duration-300 z-40 backdrop-blur-sm"
                        style={{
                            top: `${frag.top}%`,
                            left: `${frag.left}%`,
                            width: frag.width,
                            height: frag.height,
                            backgroundColor: bg,
                            border: border !== 'transparent' ? `2px solid ${border}` : 'none',
                            color: textColor,
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/category/${frag.subId}`);
                        }}
                    >
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-mono tracking-widest opacity-60 mb-2 uppercase border-b border-current pb-1 w-full text-center">{activeFloorData.label}.Z{frag.id + 1}</span>
                            <span className="font-black text-lg text-center tracking-tighter leading-none break-keep">
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
    const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
    const [hoveredFloor, setHoveredFloor] = useState<number | null>(null);
    const location = useLocation();

    // Listen for floor parameter in URL (for navigation from Header)
    React.useEffect(() => {
        const params = new URLSearchParams(location.search);
        const floorParam = params.get('floor');
        if (floorParam) {
            const level = parseInt(floorParam);
            if (!isNaN(level) && level >= 1 && level <= 6) {
                setSelectedFloor(level);
            }
        }
    }, [location.search]);

    const activeFloorData = useMemo(() => {
        if (!selectedFloor) return null;
        return FLOORS.find(f => f.level === selectedFloor);
    }, [selectedFloor]);

    return (
        <div
            className={`fixed inset-0 top-0 left-0 w-full h-full transition-all duration-300 ${selectedFloor ? 'z-[100]' : 'z-[40]'}`}
            style={{ backgroundColor: COLORS.paper }}
        >

            {/* Blueprint Header */}
            <div className="absolute top-40 left-16 pointer-events-none z-10 opacity-80">
                <h1 className="text-[#00FFC2] text-5xl font-black uppercase font-serif tracking-tight leading-none mb-4 drop-shadow-[0_0_15px_rgba(0,255,194,0.4)]">
                    <AutoTranslatedText text="CULTURAL" /><br />
                    <AutoTranslatedText text="ARCHIVE" />
                </h1>
                <div className="h-[2px] w-24 bg-[#00FFC2] mb-2 shadow-[0_0_10px_rgba(0,255,194,0.5)]"></div>
                <p className="text-[#00FFC2]/80 font-mono text-sm tracking-[0.2em] font-bold">
                    <AutoTranslatedText text="STRUCTURAL ELEVATION" /><br />
                    <AutoTranslatedText text="SCALE 1:100" />
                </p>
            </div>

            {/* Transparent Canvas overlays the background */}
            <Canvas shadows={false} gl={{ antialias: true, alpha: false }}>
                <color attach="background" args={[COLORS.paper]} />
                <CityBackground3D />

                {/* Flat lighting suitable for wireframe/blueprint style */}
                <ambientLight intensity={2.5} />
                <directionalLight position={[10, 20, 15]} intensity={1} color={'#ffffff'} />

                {/* Perspective Camera: Wide angle, placed exactly at 4F height (Y = 2.0) to make 4F the horizontal reference block.
                    Looking up shows ceilings of 5-6F, looking down shows floors of 1-3F. */}
                <PerspectiveCamera
                    makeDefault
                    position={[-24, 2.0, 32]}
                    fov={35}
                    near={0.1}
                    far={1000}
                    onUpdate={(c) => c.lookAt(0, 2.0, 0)}
                />

                <PresentationControls
                    global
                    config={{ mass: 2, tension: 500 }}
                    snap={{ mass: 4, tension: 1500 }}
                    rotation={[0, 0, 0]}
                    polar={[0, 0]} // Locked vertically so the 4F horizon is permanently horizontally maintained
                    azimuth={[-Math.PI, Math.PI]}
                >
                    <BlueprintBuilding
                        selectedFloor={selectedFloor}
                        hoveredFloor={hoveredFloor}
                        setHoveredFloor={setHoveredFloor}
                        setSelectedFloor={setSelectedFloor}
                    />
                </PresentationControls>
            </Canvas>

            <AnimatePresence>
                {activeFloorData && (
                    <FragmentedModal
                        activeFloorData={activeFloorData}
                        onClose={() => setSelectedFloor(null)}
                    />
                )}
            </AnimatePresence>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[#2c3e50] font-mono text-sm tracking-widest uppercase font-bold opacity-70">
                <AutoTranslatedText text="[Drag to Rotate] • [Click Floor to Select]" />
            </div>
        </div>
    );
};
