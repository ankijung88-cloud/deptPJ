import React, { useMemo, useRef, Suspense, Component, ReactNode, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
    PerspectiveCamera, 
    useScroll, 
    ScrollControls,
    Image as DreiImage,
    Text as DreiText 
} from '@react-three/drei';
import * as THREE from 'three';
import { FeaturedItem } from '../../types';
import { useNavigate } from 'react-router-dom';
import { useAutoTranslate } from '../../hooks/useAutoTranslate';
import { Compass } from 'lucide-react';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
// Removed getFallbackTexture as it is no longer used to simplify the loading logic.

// Local error boundary for individual cards to prevent one broken image from crashing the whole canvas
class CardErrorBoundary extends Component<{ children: ReactNode, fallback: ReactNode }, { hasError: boolean }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() { return { hasError: true }; }
    componentDidCatch(error: any, _errorInfo: any) {
        // Silently catch texture load errors to prevent console spam
        console.warn("Handled Card Error:", error.message || error);
    }
    render() {
        if (this.state.hasError) return this.props.fallback;
        return this.props.children;
    }
}

// Error Boundary for R3F Canvas
class GalleryErrorBoundary extends React.Component<{ children: React.ReactNode, fallback: React.ReactNode }, { hasError: boolean }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() { return { hasError: true }; }
    componentDidCatch(error: any, errorInfo: any) {
        console.error("VirtualGallery R3F Crash:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) return this.props.fallback;
        return this.props.children;
    }
}

const CanvasText = ({ text, color = "white", width = 4, height = 1 }: { text: string, color?: string, width?: number, height?: number }) => {
    const textureRef = useRef<THREE.CanvasTexture>(null);
    
    const canvas = useMemo(() => {
        const c = document.createElement('canvas');
        c.width = 2048;
        c.height = 512;
        const ctx = c.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, c.width, c.height);
            const fontSize = 80;
            const lineHeight = 100;
            ctx.font = `bold ${fontSize}px 'Pretendard', sans-serif, Arial`;
            ctx.fillStyle = color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 12;

            const maxWidth = 1800;
            const words = (text || "").split(/(\s+)/);
            const lines = [];
            let currentLine = "";

            for (let i = 0; i < words.length; i++) {
                const word = words[i];
                if (!word) continue;
                const testLine = currentLine + word;
                let testWidth = ctx.measureText(testLine).width;
                if (testWidth <= 0) testWidth = testLine.length * (fontSize * 0.6);
                if (testWidth < maxWidth) {
                    currentLine = testLine;
                } else {
                    if (currentLine) lines.push(currentLine);
                    currentLine = word.trim();
                }
            }
            if (currentLine) lines.push(currentLine);
            const totalHeight = lines.length * lineHeight;
            const startY = (c.height - totalHeight) / 2 + lineHeight / 2;
            lines.forEach((line, i) => { ctx.fillText(line.trim(), c.width / 2, startY + i * lineHeight); });
        }

        // Signal texture update
        if (textureRef.current) {
            textureRef.current.needsUpdate = true;
        }
        
        return c;
    }, [text, color]);

    return (
        <mesh position={[0, 0, 0.1]}>
            <planeGeometry args={[width, height]} />
            <meshBasicMaterial transparent side={THREE.DoubleSide}>
                <canvasTexture ref={textureRef} attach="map" image={canvas} />
            </meshBasicMaterial>
        </mesh>
    );
};

interface ExhibitProps {
    item: any;
    side: number;
    zPos: number;
    theme: any;
    index: number;
    lang: string;
    onItemClick?: (item: any) => void;
    isMobile: boolean;
}

const SafeImage = ({ url, scale, hovered }: { url: string, scale: [number, number], hovered: boolean, color2: string }) => {
    // We trust the database URL directly and let DreiImage handle the internal loading/error.
    // Removing any overlapping material children to ensure DreiImage's texture is clearly visible.
    return (
        <DreiImage 
            url={url} 
            scale={scale} 
            transparent 
            opacity={hovered ? 1 : 0.9}
            position={[0, 0, 0.01]}
        />
    );
};

const ExhibitCard = ({ item, side, zPos, theme, index, lang, onItemClick, isMobile }: ExhibitProps) => {
    const groupRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.Mesh>(null);
    const navigate = useNavigate();
    const [hovered, setHovered] = React.useState(false);
    
    const isStory = !item.imageUrl && !item.image_url; 
    const imageUrl = item.imageUrl || item.image_url;
    
    const getDisplayName = (val: any) => {
        if (!val) return "";
        if (typeof val === 'string') return val;
        
        // Use the passed-in lang prop for consistency
        const currentLang = lang?.split('-')[0] || 'ko';
        if (val[currentLang]) return val[currentLang];
        
        return val.ko || val.en || Object.values(val)[0] || "";
    };

    const displayName = getDisplayName(item.title);
    const { translatedText } = useAutoTranslate(displayName, lang);

    // Dynamic constants for Conveyor Belt (Mobile Only)
    const totalExhibits = (useThree().get as any)().exhibitsCount || 10;
    const radius = isMobile ? 25.0 : 3.5; // Large radius for mobile to prevent overlap with many items
    const angleStep = (Math.PI * 2) / totalExhibits;
    const verticalOffset = -0.5; // Slightly lower for better thumb ergonomics

    useFrame((state) => {
        if (!groupRef.current) return;
        
        const { size, viewport } = state;
        const isMobile = size.width < 768;

        let effectiveZ = zPos;
        let effectiveY = 0;
        let effectiveRotationX = 0;
        let centerFactor = 0;

        if (isMobile) {
            const scroll = (state as any).scrollOffset || 0;
            // Map scroll to global rotation angle
            const globalAngle = scroll * Math.PI * 2 * 3; // 3 full rotations over the scroll length
            const cardAngle = globalAngle + (index * angleStep);
            
            // Circular positioning (Vertical loop) with verticalOffset
            effectiveY = Math.sin(cardAngle) * radius + verticalOffset;
            effectiveZ = Math.cos(cardAngle) * radius - radius; // Front is at z=0
            
            // Face the camera: Rotation around X-axis
            effectiveRotationX = -cardAngle;

            // centerFactor: 1.0 when card is at the very front
            const normalizedAngle = ((cardAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
            const distFromFront = Math.min(normalizedAngle, Math.PI * 2 - normalizedAngle);
            
            const mobilePlateau = 0.05; // Much sharper focus
            if (distFromFront <= mobilePlateau) {
                centerFactor = 1.0;
            } else if (distFromFront <= 0.25) { // Narrower range
                centerFactor = THREE.MathUtils.smoothstep(distFromFront, 0.25, mobilePlateau);
            }
        } else {
            // Linear Corridor (Desktop)
            const sweetSpot = zPos + 8;
            const distToSweetSpot = Math.abs(state.camera.position.z - sweetSpot);
            const desktopPlateau = 4;
            
            if (distToSweetSpot <= desktopPlateau) { 
                centerFactor = 1.0;
            } else if (distToSweetSpot <= 10) { 
                centerFactor = THREE.MathUtils.smoothstep(distToSweetSpot, 10, desktopPlateau);
            }
        }

        const baseWidth = 4;
        // Normalization: Mobile uses the SAME logic as Web/Desktop
        // But keeps the requested 98% scale at the very center (centerFactor = 1.0)
        const targetWidth = isMobile 
            ? THREE.MathUtils.lerp(viewport.width * 0.45, viewport.width * 0.8, centerFactor)
            : Math.min(viewport.width * 0.82, 4.2);
        const responsiveScale = targetWidth / baseWidth;

        // X Displacement and Rotation - WEB Pattern for ALL devices
        // Mobile now exactly follows the "Web style" of shifting aside
        const sideDisplacement = Math.min(viewport.width * 0.35, 4.2);
        const startX = side * sideDisplacement;
        const targetX = THREE.MathUtils.lerp(startX, 0, centerFactor);
        const targetRotationY = THREE.MathUtils.lerp(side * -Math.PI / 10, 0, centerFactor);
        
        const baseScale = isMobile ? 1.0 : 0.95;
        const finalScale = responsiveScale * baseScale * (hovered ? 1.05 : 1);
        
        // Update Card Transforms (Scaling + Rotation)
        if (groupRef.current) {
            if (isMobile) {
                groupRef.current.parent!.position.y = effectiveY;
                groupRef.current.parent!.position.z = effectiveZ;
                groupRef.current.parent!.rotation.x = effectiveRotationX;
                groupRef.current.position.x = 0; // Center horizontally in conveyor
                groupRef.current.position.y = 0;
                groupRef.current.rotation.y = 0;
            } else {
                groupRef.current.position.x = targetX;
                groupRef.current.rotation.y = targetRotationY;
                groupRef.current.parent!.position.y = 0;
                groupRef.current.parent!.rotation.x = 0;
            }
            groupRef.current.scale.setScalar(finalScale);
        }
    });

    return (
        <group position={[0, 0, zPos]}>
            {/* Debug Index Label - Subtle marker at the top */}
            <Suspense fallback={null}>
                <DreiText position={[0, 1.8, 0]} fontSize={0.1} color={theme.accentColor} fillOpacity={0.6}>
                    #{index + 1}
                </DreiText>
            </Suspense>

            {/* The Animated Card Mesh - Grouped for scaling/rotation isolation */}
            <group ref={groupRef}>
                <mesh 
                    ref={meshRef}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onItemClick) {
                            onItemClick(item);
                        } else if (!isStory) {
                            navigate(`/detail/${item.id}`);
                        }
                    }}
                    onPointerOver={() => setHovered(true)}
                    onPointerOut={() => setHovered(false)}
                >
                    <mesh position={[0, 0, -0.05]}>
                        <boxGeometry args={[4.2, 3.2, 0.1]} />
                        <meshStandardMaterial 
                            color={theme.color1} 
                            emissive={theme.accentColor}
                            emissiveIntensity={hovered ? 1.5 : 0.2}
                            metalness={0.8}
                            roughness={0.2}
                        />
                    </mesh>

                    {imageUrl ? (
                        <CardErrorBoundary fallback={
                            <mesh position={[0, 0, 0.01]}>
                                <planeGeometry args={[4, 3]} />
                                <meshStandardMaterial color={theme.color2} transparent opacity={0.3} />
                            </mesh>
                        }>
                            <Suspense fallback={
                                <mesh position={[0, 0, 0.01]}>
                                    <planeGeometry args={[4, 3]} />
                                    <meshStandardMaterial color={theme.color2} transparent opacity={0.3} />
                                </mesh>
                            }>
                                <SafeImage 
                                    url={imageUrl} 
                                    scale={[4, 3]} 
                                    hovered={hovered}
                                    color2={theme.color2}
                                />
                            </Suspense>
                        </CardErrorBoundary>
                    ) : (
                        <mesh position={[0, 0, 0.01]}>
                            <planeGeometry args={[4, 3]} />
                            <meshStandardMaterial color={theme.color2} transparent opacity={0.3} />
                        </mesh>
                    )}
                </mesh>

                {/* Integrated Title Overlay - Inside the card for perfect context */}
                <group position={[0, -1.1, 0.06]}>
                    <mesh>
                        <planeGeometry args={[4, 0.8]} />
                        <meshBasicMaterial color="black" transparent opacity={0.6} />
                    </mesh>
                    <CanvasText 
                        text={translatedText || displayName || <AutoTranslatedText text="Loading..." />} 
                        color="white" 
                        width={4} 
                        height={0.8} 
                    />
                </group>
            </group>
        </group>
    );
};

const GalleryScene = ({ 
    items, 
    stories, 
    theme, 
    lang, 
    onItemClick,
    isMobile 
}: { 
    items: FeaturedItem[], 
    stories: any[], 
    theme: any, 
    lang: string, 
    onItemClick?: (item: any) => void,
    isMobile: boolean
}) => {
    const scroll = useScroll();
    const { camera } = useThree();
    
    const exhibits = useMemo(() => {
        const combined = [...(items || []), ...(stories || [])];
        return combined.map((ex, i) => ({
            ...ex,
            side: i % 2 === 0 ? -1 : 1,
            zPos: -i * 20 - 10 
        }));
    }, [items, stories]);

    // Pass total count to state for access in children
    const { set } = useThree();
    useEffect(() => {
        set({ exhibitsCount: exhibits.length } as any);
    }, [exhibits.length, set]);

    const focusState = useRef({ index: -1, startTime: 0 });

    useFrame((state, _delta) => {
        const spacing = 20;
        const totalZ = exhibits.length * spacing;
        
        // Pass scroll offset to children via custom state
        (state as any).scrollOffset = scroll.offset;

        if (isMobile) {
            // Mobile: Sticky Camera, Conveyor rotates
            camera.position.set(0, 0, 5); // Static camera position for circular view
            camera.lookAt(0, 0, 0);

            let pullBias = 0;
            const angleStep = (Math.PI * 2) / exhibits.length;
            const globalAngle = (scroll.offset || 0) * Math.PI * 2 * 3;

            exhibits.forEach((_, i) => {
                const cardAngle = globalAngle + (i * angleStep);
                const normalizedAngle = ((cardAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
                const distFromFront = Math.min(normalizedAngle, Math.PI * 2 - normalizedAngle);

                if (distFromFront < 0.1) { // Very magnetic for narrow focus
                    if (focusState.current.index !== i) {
                        focusState.current = { index: i, startTime: state.clock.elapsedTime };
                    }
                    const elapsed = state.clock.elapsedTime - focusState.current.startTime;
                    if (elapsed < 1.0) {
                        pullBias = -distFromFront * (normalizedAngle > Math.PI ? -1 : 1);
                    }
                }
            });
            
            // Note: In R3F ScrollControls, we can't easily 'pull' the offset itself without complexity
            // but we can simulate the pause by having cards stay still.
            (state as any).scrollOffset = scroll.offset + pullBias * 0.01;
        } else {
            // Desktop: Linear Corridor
            const scrollZ = scroll.offset * -(totalZ + 10);
            let pullBias = 0;
            
            exhibits.forEach((ex) => {
                const sweetSpot = ex.zPos + 8;
                const dist = Math.abs(scrollZ - sweetSpot);
                if (dist < 6) {
                    const desktopStrength = Math.pow(1 - dist / 6, 2);
                    pullBias += (sweetSpot - scrollZ) * desktopStrength * 0.85;
                }
            });

            const targetCameraZ = scrollZ + pullBias;
            camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCameraZ, 0.1);
            camera.lookAt(0, 0, camera.position.z - 20);
        }
    });

    return (
        <group>
            <gridHelper args={[1000, 100, theme.accentColor, theme.color3.substring(0, 7)]} rotation={[0, 0, 0]} position={[0, -5, -500]} />
            <gridHelper args={[1000, 100, theme.accentColor, theme.color3.substring(0, 7)]} rotation={[0, 0, 0]} position={[0, 5, -500]} />
            
            {/* Neon Path Lines - Floor Strips */}
            <mesh position={[-5.1, -4.95, -100]}>
                <boxGeometry args={[0.2, 0.01, 2000]} />
                <meshStandardMaterial color={theme.accentColor} emissive={theme.accentColor} emissiveIntensity={4} />
            </mesh>
            <mesh position={[5.1, -4.95, -100]}>
                <boxGeometry args={[0.2, 0.01, 2000]} />
                <meshStandardMaterial color={theme.accentColor} emissive={theme.accentColor} emissiveIntensity={4} />
            </mesh>

            <fog attach="fog" args={[theme.bgColor, 10, 60]} />

            {exhibits.map((ex: any, i: number) => (
                <ExhibitCard 
                    key={`${i}-${lang}`} 
                    item={ex} 
                    side={ex.side}
                    zPos={ex.zPos}
                    theme={theme}
                    index={i}
                    lang={lang}
                    onItemClick={onItemClick}
                    isMobile={isMobile}
                />
            ))}

            <ambientLight intensity={1.5} />
            <pointLight position={[0, 10, -5]} intensity={2} color={theme.accentColor} />
            <pointLight position={[0, -10, -5]} intensity={1} color={theme.color3.substring(0, 7)} />
        </group>
    );
};

export const VirtualGallery = ({ 
    items, 
    stories, 
    theme, 
    showUI = true, 
    lang = 'ko', 
    onItemClick,
    defaultActivated = false,
    onClick
}: { 
    items: FeaturedItem[], 
    stories: any[], 
    theme: any, 
    showUI?: boolean, 
    lang?: string, 
    onItemClick?: (item: any) => void,
    defaultActivated?: boolean,
    onClick?: () => void
}) => {
    const [isActivated, setIsActivated] = useState(defaultActivated);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div 
            className={`w-full h-full relative bg-[#0a0a0a] overflow-hidden group ${!isActivated ? 'hide-3d-scrollbar' : ''}`}
            onClick={() => {
                // Only activate internal scroll if no external handler is provided (e.g. for standalone use).
                // For teasers (with onClick prop), we don't activate the teaser's own scroll.
                if (!onClick && !isActivated) setIsActivated(true);
                
                if (onClick) onClick();
            }}
        >
            <style dangerouslySetInnerHTML={{ __html: `
                .hide-3d-scrollbar *::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
                .hide-3d-scrollbar * { -ms-overflow-style: none !important; scrollbar-width: none !important; overflow: hidden !important; }
                .hide-3d-scrollbar div { overflow: hidden !important; }
            `}} />
            <GalleryErrorBoundary fallback={
                <div className="w-full h-full flex flex-col items-center justify-center text-white/20 p-12 text-center">
                    <Compass size={48} className="mb-6 opacity-10" />
                    <p className="text-sm font-mono tracking-[0.3em] uppercase"><AutoTranslatedText text="3D Gallery Error - Using Standard View" /></p>
                </div>
            }>
                <Canvas shadows={false} dpr={[1, 2]}>
                    <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
                    <ScrollControls 
                        pages={!isActivated 
                            ? 0 // No scrolling in teaser mode
                            : (isMobile 
                                ? 200 // Large range for mobile infinite loop
                                : Math.max(3, ((items?.length || 0) + (stories?.length || 0)) * 0.8))} 
                        damping={0.3} 
                        distance={1}
                        enabled={isActivated}
                        style={!isActivated ? { display: 'none', visibility: 'hidden', pointerEvents: 'none' } : {}}
                    >
                        <Suspense fallback={
                            <mesh>
                                <boxGeometry args={[1, 1, 1]} />
                                <meshBasicMaterial color="gray" wireframe />
                            </mesh>
                        }>
                                <GalleryScene 
                                    items={items} 
                                    stories={stories} 
                                    theme={theme} 
                                    lang={lang} 
                                    onItemClick={onItemClick} 
                                    isMobile={isMobile}
                                />
                        </Suspense>
                    </ScrollControls>
                </Canvas>
            </GalleryErrorBoundary>

            {showUI && (
                <>
                    {!isActivated && (
                        <div className="absolute inset-0 z-[30] flex items-center justify-center bg-black/20 backdrop-blur-[2px] cursor-pointer transition-all hover:bg-black/10">
                            <div className="px-8 py-4 border border-white/20 rounded-full backdrop-blur-xl bg-black/40 shadow-2xl flex flex-col items-center gap-2 group-hover:scale-105 transition-transform duration-500">
                                <Compass size={24} className="text-white/60 animate-[spin_8s_linear_infinite]" />
                                <span className="text-sm font-black tracking-[0.3em] text-white uppercase"><AutoTranslatedText text={onClick ? "클릭하여 가상공간 진입" : "클릭하여 탐험 시작"} /></span>
                                <span className="text-[10px] font-mono tracking-widest text-white/30 uppercase"><AutoTranslatedText text={onClick ? "Click to open fullscreen" : "Scroll disabled until click"} /></span>
                            </div>
                        </div>
                    )}

                    <div className="absolute top-10 right-10 pointer-events-none z-20 text-right">
                        <div className="text-[10px] font-mono tracking-[0.4em] text-white/40 mb-1 uppercase"><AutoTranslatedText text="Navigation Guide" /></div>
                        <div className="text-xl font-serif italic text-white/60">
                            {isActivated ? (
                                <AutoTranslatedText text="Scroll to explore the Temporal Corridor" />
                            ) : (
                                <AutoTranslatedText text={onClick ? "가상공간을 보려면 클릭하세요" : "스크롤을 활성화하려면 클릭하세요"} />
                            )}
                        </div>
                    </div>

                    <div className="absolute bottom-24 md:bottom-10 left-20 md:left-10 pointer-events-none z-20">
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-white leading-none">{items.length + stories.length}</span>
                                <span className="text-[8px] font-mono tracking-widest text-white/40 uppercase"><AutoTranslatedText text="Total Exhibits" /></span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default VirtualGallery;
