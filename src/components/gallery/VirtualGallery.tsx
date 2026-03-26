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
import { Compass, ChevronUp, ChevronDown } from 'lucide-react';
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
                <group position={[0, 0, 0.2]} onClick={(e) => { e.stopPropagation(); setPlaying(true); }}>
                    {/* Subtle Semi-transparent Dark Circle */}
                    <mesh>
                        <circleGeometry args={[0.8, 32]} />
                        <meshBasicMaterial color="#050505" transparent opacity={0.6} />
                    </mesh>
                    {/* Thin Border */}
                    <mesh>
                        <ringGeometry args={[0.79, 0.81, 64]} />
                        <meshBasicMaterial color="white" transparent opacity={0.15} />
                    </mesh>
                    {/* Play Triangle - Centered by matching pivot points with the circle */}
                    <mesh position={[0, 0, 0.01]} rotation={[0, 0, 0]}>
                        <circleGeometry args={[0.45, 3]} />
                        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
                    </mesh>
                </group>
            )}

            {playing && hovered && (
                <group position={[0, 0, 0.2]} onClick={(e) => { e.stopPropagation(); setPlaying(false); }}>
                    {/* Subtle Semi-transparent Dark Circle */}
                    <mesh>
                        <circleGeometry args={[0.8, 32]} />
                        <meshBasicMaterial color="#050505" transparent opacity={0.4} />
                    </mesh>
                    {/* Thin Border */}
                    <mesh>
                        <ringGeometry args={[0.79, 0.81, 64]} />
                        <meshBasicMaterial color="white" transparent opacity={0.1} />
                    </mesh>
                    {/* Pause Bars */}
                    <group position={[-0.15, 0, 0.01]}>
                        <mesh position={[0, 0, 0]}>
                            <planeGeometry args={[0.12, 0.45]} />
                            <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
                        </mesh>
                        <mesh position={[0.3, 0, 0]}>
                            <planeGeometry args={[0.12, 0.45]} />
                            <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
                        </mesh>
                    </group>
                </group>
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

const ExhibitCard = ({ item, side, zPos, theme, index, lang, onItemClick, isMobile, exhibitsCount }: ExhibitProps & { exhibitsCount: number }) => {
    const groupRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.Mesh>(null);
    const navigate = useNavigate();
    const [hovered, setHovered] = React.useState(false);
    
    const isProduct = item.id?.includes('item-') || item.id?.startsWith('p') || item.price || item.location;
    const isStory = !isProduct; 
    const imageUrl = item.imageUrl || item.image_url;
    
    const displayName = getLocalizedText(item.title, lang);
    const { translatedText } = useAutoTranslate(displayName, lang);
    
    // Dynamic radius on mobile: ensure enough space for cards as count grows
    // Card height is ~3.2. To avoid overlap, arc length (radius * angleStep) should be > 4.5
    // angleStep = 2*PI / count. So radius * (2*PI / count) > 4.5 => radius > (4.5 * count) / (2*PI)
    const minSafeRadius = (5.5 * exhibitsCount) / (Math.PI * 2);
    // Standardize mobile radius: 20 is a safe minimum for visual clarity, otherwise expand with item count
    const radius = isMobile ? Math.max(20, minSafeRadius) : 3.5;
    
    const verticalOffset = isMobile ? 0 : -0.5;

    useFrame((state) => {
        if (!groupRef.current) return;
        
        const { viewport } = state;
        // isMobile prop is passed down and should be used consistently to avoid mid-frame discordance

        // Use the synchronized currentOffset passed from the scene
        const currentOffset = (state as any).currentOffset || 0;
        let centerFactor = 0;

        if (isMobile) {
            const angleStep = (Math.PI * 2) / exhibitsCount;
            // Subtracting index * angleStep to bring higher index items from "below" as offset increases
            // Adding a half-turn offset if needed, but current logic works well with 0 as center
            const cardAngle = (currentOffset * angleStep) - (index * angleStep);
            
            const effectiveY = Math.sin(cardAngle) * radius + verticalOffset;
            const effectiveZ = Math.cos(cardAngle) * radius - radius;
            const effectiveRotationX = -cardAngle;

            const normalizedAngle = ((cardAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
            const distFromFront = Math.min(normalizedAngle, Math.PI * 2 - normalizedAngle);
            
            const mobilePlateau = Math.min(0.1, angleStep * 0.15);
            const mobileTransitionRange = Math.min(0.4, angleStep * 0.6);
            
            if (distFromFront <= mobilePlateau) {
                centerFactor = 1.0;
            } else if (distFromFront <= mobileTransitionRange) {
                centerFactor = THREE.MathUtils.smoothstep(distFromFront, mobileTransitionRange, mobilePlateau);
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
            const desktopOffset = currentOffset * 20; // 20 units per item on desktop
            const cameraZ = -desktopOffset;
            const distFromCamera = cameraZ - sweetSpot;
            const absDist = Math.abs(distFromCamera);

            const desktopPlateau = 2.5; 
            const transitionRange = 12; 
            
            if (absDist <= desktopPlateau) { 
                centerFactor = 1.0;
            } else if (absDist <= transitionRange) { 
                centerFactor = THREE.MathUtils.smoothstep(absDist, transitionRange, desktopPlateau);
            }

            // Fixed side displacement ensures the "road width" is consistent across all pages
            const baseSideDisplacement = 5.5; 
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
    setPlaying,
    onActiveIndexChange,
    isActivated,
    targetIndex = 0
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
    setPlaying?: (p: boolean) => void,
    onActiveIndexChange?: (index: number) => void,
    isActivated?: boolean,
    targetIndex?: number
}) => {
    // We only call useScroll if we are NOT on mobile, 
    // because on mobile we are not wrapped in ScrollControls
    const scroll = !isMobile ? useScroll() : null;
    const { camera } = useThree() as any;
    
    const exhibits = useMemo(() => {
        const combined = [...(items || []), ...(stories || [])];
        return combined.map((ex, i) => ({
            ...ex,
            side: i % 2 === 0 ? -1 : 1,
            zPos: -i * 20 - 10 
        }));
    }, [items, stories]);

    const forcedScroll = useRef<{ offset: number, startTime: number, active: boolean }>({ offset: 0, startTime: 0, active: false });
    const currentOffset = useRef(targetIndex);
    const lastTargetIndex = useRef(targetIndex);

    useEffect(() => {
        if (!isMobile && scroll && exhibits.length > 0) {
            // Find target index's scroll offset for desktop
            const spacing = 20;
            const totalZ = exhibits.length * spacing;
            const targetZ = exhibits[targetIndex]?.zPos || 0;
            const targetOffset = (targetZ + 8) / -(totalZ + 10);
            
            forcedScroll.current = {
                offset: THREE.MathUtils.clamp(targetOffset, 0, 1),
                startTime: Date.now(),
                active: true
            };
        }
    }, [targetIndex, isMobile, exhibits]);

    useEffect(() => {
        if (targetIndex !== lastTargetIndex.current) {
            lastTargetIndex.current = targetIndex;
        }
    }, [targetIndex]);

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

    const lastSetIndex = useRef<number>(-1);
    useFrame((frameState, delta) => {
        if (!isActivated) return;

        if (isMobile) {
            // Mobile: State-driven discrete navigation
            const lerpSpeed = 4.5;
            currentOffset.current = THREE.MathUtils.lerp(currentOffset.current, targetIndex, delta * lerpSpeed);
            (frameState as any).currentOffset = currentOffset.current;

            camera.position.set(0, 0, 5);
            camera.lookAt(0, 0, 0);
            
            const closestIndex = ((Math.round(currentOffset.current) % exhibits.length) + exhibits.length) % exhibits.length;
            if (closestIndex !== lastSetIndex.current && onActiveIndexChange) {
                lastSetIndex.current = closestIndex;
                onActiveIndexChange(closestIndex);
            }
        } else if (scroll) {
            // Desktop: Scroll-driven navigation
            if (forcedScroll.current.active) {
                const duration = 1000;
                const elapsed = Date.now() - forcedScroll.current.startTime;
                const progress = THREE.MathUtils.smoothstep(elapsed / duration, 0, 1);
                scroll.offset = THREE.MathUtils.lerp(scroll.offset, forcedScroll.current.offset, progress);
                if (scroll.el) {
                    scroll.el.scrollTop = scroll.offset * (scroll.el.scrollHeight - scroll.el.clientHeight);
                }
                if (progress >= 1) forcedScroll.current.active = false;
            }

            const totalZ = exhibits.length * 20;
            const scrollZ = scroll.offset * -(totalZ + 10);
            
            // Auto-snapping bias for Desktop
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

            // Sync index back to parent
            const itemsInView = exhibits.map((ex, i) => ({
                index: i,
                dist: Math.abs((camera.position.z - 8) - ex.zPos)
            }));
            const closest = itemsInView.sort((a, b) => a.dist - b.dist)[0];
            if (closest && closest.index !== lastSetIndex.current && onActiveIndexChange && !forcedScroll.current.active) {
                lastSetIndex.current = closest.index;
                onActiveIndexChange(closest.index);
            }

            // Also pass offset to cards (though desktop cards use cameraZ relative positioning mostly)
            (frameState as any).currentOffset = (camera.position.z / -20);
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
                    exhibitsCount={exhibits.length}
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
    playing,
    setPlaying,
    initialItemId,
    onItemClick,
    defaultActivated = false,
    onClick,
    isMuseum = false,
    cinemaItem = null,
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
    setPlaying?: (p: boolean) => void,
    initialItemId?: string | null
}) => {
    const [isActivated, setIsActivated] = useState(defaultActivated);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [targetIndex, setTargetIndex] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);

    const totalExhibits = (items?.length || 0) + (stories?.length || 0);

    const handleNavigate = (direction: 'up' | 'down') => {
        if (totalExhibits === 0) return;
        
        setTargetIndex(prev => {
            const next = direction === 'up' ? prev - 1 : prev + 1;
            return next;
        });
    };

    useEffect(() => {
        if (initialItemId && items.length > 0) {
            const idx = items.findIndex(item => item.id === initialItemId);
            if (idx !== -1) {
                setTargetIndex(idx);
                setActiveIndex(idx);
                setIsActivated(true);
            }
        }
    }, [initialItemId, items]);

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
                    <Suspense fallback={null}>
                        {isMobile ? (
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
                                onActiveIndexChange={setActiveIndex}
                                isActivated={isActivated}
                                targetIndex={targetIndex}
                            />
                        ) : (
                            <ScrollControls 
                                pages={!isActivated 
                                    ? 0 
                                    : Math.max(3, ((items?.length || 0) + (stories?.length || 0)) * 0.8)} 
                                damping={0.3} 
                                distance={1}
                                enabled={isActivated}
                            >
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
                                    onActiveIndexChange={setActiveIndex}
                                    isActivated={isActivated}
                                    targetIndex={targetIndex}
                                />
                            </ScrollControls>
                        )}
                    </Suspense>
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
                                <span className="text-2xl font-black text-white leading-none">{(activeIndex % totalExhibits + totalExhibits) % totalExhibits + 1} / {totalExhibits}</span>
                                <span className="text-[8px] font-mono tracking-widest text-white/40 uppercase"><AutoTranslatedText text="Current Exhibit" /></span>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {isMobile && isActivated && (
                <div className="absolute bottom-24 right-6 z-40 flex flex-col gap-4">
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleNavigate('up'); }}
                        className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white/70 active:scale-90 active:bg-white/10 transition-all duration-200"
                    >
                        <ChevronUp size={24} />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleNavigate('down'); }}
                        className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white/70 active:scale-90 active:bg-white/10 transition-all duration-200"
                    >
                        <ChevronDown size={24} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default VirtualGallery;
