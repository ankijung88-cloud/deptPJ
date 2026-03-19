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
import { useAutoTranslate } from '../../hooks/useAutoTranslate';
import { useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { getLocalizedText } from '../../utils/i18nUtils';
import { AutoTranslatedText } from '../common/AutoTranslatedText';

// Local error boundary for individual cards
class CardErrorBoundary extends Component<{ children: ReactNode, fallback: ReactNode }, { hasError: boolean }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() { return { hasError: true }; }
    componentDidCatch(error: any, _errorInfo: any) {
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
    isMuseum?: boolean;
}

const VideoScreen = ({ url, scale, theme, hovered, playing, setPlaying }: { url: string, scale: [number, number], theme: any, hovered: boolean, playing: boolean, setPlaying: (p: boolean) => void }) => {
    const video = useMemo(() => {
        const v = document.createElement('video');
        v.src = url;
        v.crossOrigin = "Anonymous";
        v.loop = true;
        v.muted = false; // User clicks Play, so we can unmute
        return v;
    }, [url]);

    useEffect(() => {
        if (playing) {
            video.play().catch(err => console.error("Video play failed:", err));
        } else {
            video.pause();
        }
    }, [playing, video]);

    const videoTexture = useMemo(() => new THREE.VideoTexture(video), [video]);

    return (
        <group>
            {/* Screen Frame */}
            <mesh position={[0, 0, -0.1]}>
                <boxGeometry args={[scale[0] + 0.4, scale[1] + 0.4, 0.2]} />
                <meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} />
            </mesh>
            
            {/* The actual screen */}
            <mesh position={[0, 0, 0.05]} onClick={(e) => { e.stopPropagation(); setPlaying(!playing); }}>
                <planeGeometry args={scale} />
                <meshBasicMaterial map={videoTexture} toneMapped={false} />
            </mesh>

            {/* Play/Pause Overlay in 3D (Text or Icons as planes) */}
            {!playing && (
                <mesh position={[0, 0, 0.2]} onClick={(e) => { e.stopPropagation(); setPlaying(true); }}>
                    <circleGeometry args={[0.8, 32]} />
                    <meshBasicMaterial color="white" transparent opacity={0.8} />
                    <mesh position={[0.1, 0, 0.01]} rotation={[0, 0, -Math.PI / 2]}>
                        <circleGeometry args={[0.3, 3]} />
                        <meshBasicMaterial color="black" />
                    </mesh>
                </mesh>
            )}

            {playing && hovered && (
                <mesh position={[0, 0, 0.2]} onClick={(e) => { e.stopPropagation(); setPlaying(false); }}>
                    <circleGeometry args={[0.6, 32]} />
                    <meshBasicMaterial color="white" transparent opacity={0.4} />
                    <group position={[-0.15, 0, 0.01]}>
                        <mesh position={[0, 0, 0]}>
                            <planeGeometry args={[0.1, 0.4]} />
                            <meshBasicMaterial color="black" />
                        </mesh>
                        <mesh position={[0.3, 0, 0]}>
                            <planeGeometry args={[0.1, 0.4]} />
                            <meshBasicMaterial color="black" />
                        </mesh>
                    </group>
                </mesh>
            )}

            {/* Screen Glow */}
            <pointLight position={[0, 0, 2]} intensity={(hovered || !playing) ? 4 : 2} color={theme.accentColor} distance={10} />
        </group>
    );
};

const SafeImage = ({ url, scale, hovered }: { url: string, scale: [number, number], hovered: boolean }) => {
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
    
    const isProduct = item.id?.includes('item-') || item.id?.startsWith('p') || item.price || item.location;
    const isStory = !isProduct; 
    const imageUrl = item.imageUrl || item.image_url;
    
    const displayName = getLocalizedText(item.title, lang);
    const { translatedText } = useAutoTranslate(displayName, lang);

    const state = useThree();
    const exhibitsCount = (state as any).exhibitsCount || 10;
    const radius = isMobile ? 25.0 : 3.5;
    const angleStep = (Math.PI * 2) / exhibitsCount;
    const verticalOffset = -0.5;

    useFrame((state) => {
        if (!groupRef.current) return;
        
        const { size, viewport } = state;
        const isMobile = size.width < 768;

        let centerFactor = 0;

        if (isMobile) {
            const scroll = (state as any).scrollOffset || 0;
            const globalAngle = scroll * Math.PI * 2 * 3;
            const cardAngle = globalAngle + (index * angleStep);
            
            const effectiveY = Math.sin(cardAngle) * radius + verticalOffset;
            const effectiveZ = Math.cos(cardAngle) * radius - radius;
            const effectiveRotationX = -cardAngle;

            const normalizedAngle = ((cardAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
            const distFromFront = Math.min(normalizedAngle, Math.PI * 2 - normalizedAngle);
            
            const mobilePlateau = 0.05;
            if (distFromFront <= mobilePlateau) {
                centerFactor = 1.0;
            } else if (distFromFront <= 0.25) {
                centerFactor = THREE.MathUtils.smoothstep(distFromFront, 0.25, mobilePlateau);
            }

            if (groupRef.current) {
                groupRef.current.parent!.position.y = effectiveY;
                groupRef.current.parent!.position.z = effectiveZ;
                groupRef.current.parent!.rotation.x = effectiveRotationX;
                groupRef.current.position.x = 0; 
                groupRef.current.position.y = 0;
                groupRef.current.rotation.y = 0;
                groupRef.current.scale.setScalar(THREE.MathUtils.lerp(viewport.width * 0.45 / 4, viewport.width * 0.8 / 4, centerFactor) * (hovered ? 1.05 : 1));
            }
        } else {
            const sweetSpot = zPos + 8;
            const distFromCamera = state.camera.position.z - sweetSpot;
            const absDist = Math.abs(distFromCamera);

            const desktopPlateau = 2.5; 
            const transitionRange = 12; 
            
            if (absDist <= desktopPlateau) { 
                centerFactor = 1.0;
            } else if (absDist <= transitionRange) { 
                centerFactor = THREE.MathUtils.smoothstep(absDist, transitionRange, desktopPlateau);
            }

            const baseSideDisplacement = Math.min(viewport.width * 0.45, 6.0);
            const passingFactor = distFromCamera < -desktopPlateau 
                ? THREE.MathUtils.mapLinear(Math.min(absDist, 10), desktopPlateau, 10, 1, 2.2)
                : 1;

            const startX = side * baseSideDisplacement * passingFactor;
            const targetX = THREE.MathUtils.lerp(startX, 0, centerFactor);
            const targetRotationY = THREE.MathUtils.lerp(side * -Math.PI / 10, 0, centerFactor);
            const focusScale = THREE.MathUtils.lerp(0.85, 1.25, centerFactor);
            const finalScale = focusScale * (hovered ? 1.05 : 1);
            
            if (groupRef.current) {
                groupRef.current.position.x = targetX;
                groupRef.current.rotation.y = targetRotationY;
                groupRef.current.parent!.position.y = 0;
                groupRef.current.parent!.rotation.x = 0;
                groupRef.current.scale.setScalar(finalScale);
            }
        }
    });

    return (
        <group position={[0, 0, zPos]}>
            <Suspense fallback={null}>
                <DreiText position={[0, 1.8, 0]} fontSize={0.1} color={theme.accentColor} fillOpacity={0.6}>
                    #{index + 1}
                </DreiText>
            </Suspense>

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
                                <DreiText position={[0, 0, 0.1]} fontSize={0.5} color={theme.accentColor} fillOpacity={0.2}>
                                    ◈
                                </DreiText>
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
                                />
                            </Suspense>
                        </CardErrorBoundary>
                    ) : (
                        <mesh position={[0, 0, 0.01]}>
                            <planeGeometry args={[4, 3]} />
                            <meshStandardMaterial color={theme.color2} transparent opacity={0.4} metalness={0.9} roughness={0.1} />
                            <group position={[0, 0, 0.1]}>
                                <DreiText position={[0, 0.2, 0]} fontSize={0.2} color={theme.accentColor}>
                                    {displayName?.substring(0, 12) + (displayName?.length > 12 ? '...' : '')}
                                </DreiText>
                                <DreiText position={[0, -0.2, 0]} fontSize={0.1} color="white" fillOpacity={0.5}>
                                    DEPT. ARCHIVE ITEM
                                </DreiText>
                            </group>
                        </mesh>
                    )}
                </mesh>

                <group position={[0, -1.1, 0.06]}>
                    <mesh>
                        <planeGeometry args={[4, 0.8]} />
                        <meshBasicMaterial color="black" transparent opacity={0.6} />
                    </mesh>
                    <CanvasText 
                        text={translatedText || displayName || "Loading..."} 
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
    isMobile,
    isMuseum = false,
    cinemaItem = null,
    playing,
    setPlaying
}: { 
    items: FeaturedItem[], 
    stories: any[], 
    theme: any,
    lang: string, 
    onItemClick?: (item: any) => void,
    isMobile: boolean,
    isMuseum?: boolean,
    cinemaItem?: FeaturedItem | null,
    playing?: boolean,
    setPlaying?: (p: boolean) => void
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

    const museumWalls = useMemo(() => {
        if (!isMuseum) return null;
        const spacing = 20;
        const length = (exhibits.length * spacing) + 100;
        
        return (
            <group>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, -length / 2 + 50]}>
                    <planeGeometry args={[100, length]} />
                    <meshStandardMaterial color="#2a1a0a" metalness={0.1} roughness={0.8} />
                </mesh>
                <mesh position={[-15, 0, -length / 2 + 50]} rotation={[0, Math.PI / 2, 0]}>
                    <planeGeometry args={[length, 20]} />
                    <meshStandardMaterial color="#f5f5f5" metalness={0.05} roughness={0.9} />
                </mesh>
                <mesh position={[15, 0, -length / 2 + 50]} rotation={[0, -Math.PI / 2, 0]}>
                    <planeGeometry args={[length, 20]} />
                    <meshStandardMaterial color="#f5f5f5" metalness={0.05} roughness={0.9} />
                </mesh>
                <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 15, -length / 2 + 50]}>
                    <planeGeometry args={[100, length]} />
                    <meshStandardMaterial color="#333333" metalness={0.1} roughness={0.5} />
                </mesh>
            </group>
        );
    }, [isMuseum, exhibits.length]);

    const { set } = useThree();
    useEffect(() => {
        set({ exhibitsCount: exhibits.length } as any);
    }, [exhibits.length, set]);

    const focusState = useRef({ index: -1, startTime: 0 });

    useFrame((state) => {
        const spacing = 20;
        const totalZ = exhibits.length * spacing;
        (state as any).scrollOffset = scroll.offset;

        if (isMobile) {
            camera.position.set(0, 0, 5);
            camera.lookAt(0, 0, 0);
            let pullBias = 0;
            const angleStep = (Math.PI * 2) / exhibits.length;
            const globalAngle = (scroll.offset || 0) * Math.PI * 2 * 3;

            exhibits.forEach((_, i) => {
                const cardAngle = globalAngle + (i * angleStep);
                const normalizedAngle = ((cardAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
                const distFromFront = Math.min(normalizedAngle, Math.PI * 2 - normalizedAngle);
                if (distFromFront < 0.1) {
                    if (focusState.current.index !== i) {
                        focusState.current = { index: i, startTime: state.clock.elapsedTime };
                    }
                    const elapsed = state.clock.elapsedTime - focusState.current.startTime;
                    if (elapsed < 1.0) {
                        pullBias = -distFromFront * (normalizedAngle > Math.PI ? -1 : 1);
                    }
                }
            });
            (state as any).scrollOffset = scroll.offset + pullBias * 0.01;
        } else {
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
            {isMuseum ? (
                <>
                    {museumWalls}
                    <fog attach="fog" args={["#000", 1, 80]} />
                </>
            ) : (
                <>
                    <gridHelper args={[1000, 100, theme.accentColor, theme.color3.substring(0, 7)]} rotation={[0, 0, 0]} position={[0, -5, -500]} />
                    <gridHelper args={[1000, 100, theme.accentColor, theme.color3.substring(0, 7)]} rotation={[0, 0, 0]} position={[0, 5, -500]} />
                    <mesh position={[-5.1, -4.95, -100]}>
                        <boxGeometry args={[0.2, 0.01, 2000]} />
                        <meshStandardMaterial color={theme.accentColor} emissive={theme.accentColor} emissiveIntensity={4} />
                    </mesh>
                    <mesh position={[5.1, -4.95, -100]}>
                        <boxGeometry args={[0.2, 0.01, 2000]} />
                        <meshStandardMaterial color={theme.accentColor} emissive={theme.accentColor} emissiveIntensity={4} />
                    </mesh>
                    <fog attach="fog" args={[theme.bgColor, 10, 60]} />
                </>
            )}

            {cinemaItem && (
                <group position={[0, 0, camera.position.z - 15]}>
                    <VideoScreen 
                        url={cinemaItem.videoUrl || (cinemaItem as any).video_url || cinemaItem.imageUrl || (cinemaItem as any).image_url} 
                        scale={isMobile ? [6, 3.4] : [14, 8]} 
                        hovered={false} 
                        theme={theme} 
                        playing={!!playing}
                        setPlaying={(p) => setPlaying?.(p)}
                    />
                </group>
            )}

            {!cinemaItem && exhibits.map((ex: any, i: number) => (
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
            <pointLight position={[0, -10, -5]} intensity={1} color={theme.color1} />
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
    onClick,
    isMuseum = false,
    cinemaItem = null,
    playing,
    setPlaying
}: { 
    items: FeaturedItem[], 
    stories: any[], 
    theme: any, 
    showUI?: boolean, 
    lang?: string, 
    onItemClick?: (item: any) => void,
    defaultActivated?: boolean,
    onClick?: () => void,
    isMuseum?: boolean,
    cinemaItem?: FeaturedItem | null,
    playing?: boolean,
    setPlaying?: (p: boolean) => void
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
                if (!onClick && !isActivated) setIsActivated(true);
                if (onClick) onClick();
            }}
        >
            <style dangerouslySetInnerHTML={{ __html: `
                .hide-3d-scrollbar *::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
                .hide-3d-scrollbar * { -ms-overflow-style: none !important; scrollbar-width: none !important; overflow: hidden !important; }
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
                            ? 0 
                            : (isMobile 
                                ? 200 
                                : Math.max(3, ((items?.length || 0) + (stories?.length || 0)) * 0.8))} 
                        damping={0.3} 
                        distance={1}
                        enabled={isActivated}
                        style={!isActivated ? { display: 'none', visibility: 'hidden', pointerEvents: 'none' } : {}}
                    >
                        <Suspense fallback={null}>
                                <GalleryScene 
                                    items={items} 
                                    stories={stories} 
                                    theme={theme} 
                                    lang={lang} 
                                    onItemClick={onItemClick} 
                                    isMobile={isMobile}
                                    isMuseum={isMuseum}
                                    cinemaItem={cinemaItem}
                                    playing={playing}
                                    setPlaying={setPlaying}
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
