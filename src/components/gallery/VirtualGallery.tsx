import React, { useMemo, useRef, Suspense, Component, ReactNode, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
    useScroll,
    ScrollControls,
    Image as DreiImage,
    Text as DreiText
} from '@react-three/drei';
import * as THREE from 'three';
import type { FeaturedItem } from '../../types';
import { useAutoTranslate } from '../../hooks/useAutoTranslate';
import { useNavigate } from 'react-router-dom';
import { Compass, Box } from 'lucide-react';
import { getLocalizedText } from '../../utils/i18nUtils';
import TheaterEnvironment from './TheaterEnvironment';

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
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Add a subtle text shadow/glow for extra premium feel
            ctx.shadowColor = 'rgba(0,0,0,0.9)';
            ctx.shadowBlur = 35;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 4;

            ctx.fillStyle = color;

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
            
            lines.forEach((line, i) => {
                const lineY = (c.height / 2) - ((lines.length - 1) * lineHeight / 2) + (i * lineHeight);
                ctx.fillText(line.trim(), c.width / 2, lineY);
            });
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

// Helper to normalize video paths (fail-safe for legacy strings)
const normalizeVideoUrl = (url: string): string => {
    if (!url) return url;
    // Replace old /assets/videos/ path with new /uploads/ path if detected
    return url.replace('/assets/videos/', '/uploads/');
};

const VideoScreen = ({ videoUrl: rawVideoUrl, imageUrl, scale: baseScale, theme, hovered, playing, setPlaying, isMobile = false }: { videoUrl: string, imageUrl: string, scale: [number, number], theme: any, hovered: boolean, playing: boolean, setPlaying: (p: boolean) => void, isMobile?: boolean }) => {
    const [videoReady, setVideoReady] = useState(false);
    const [aspectRatio, setAspectRatio] = useState(baseScale[0] / baseScale[1]);
    
    // Apply normalization to videoUrl
    const videoUrl = normalizeVideoUrl(rawVideoUrl);

    // Check if the URL is actually a video
    const isVideo = useMemo(() => {
        if (!videoUrl) return false;
        const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
        const lowerUrl = videoUrl.toLowerCase();
        return videoExtensions.some(ext => lowerUrl.endsWith(ext) || lowerUrl.includes(ext + '?'));
    }, [videoUrl]);

    const video = useMemo(() => {
        if (!isVideo) return null;
        const v = document.createElement('video');
        v.crossOrigin = "anonymous"; // Set before src
        v.src = videoUrl;
        v.loop = false;
        v.onended = () => {
            setPlaying(false);
        };
        
        // Match global mute state
        const savedMuted = localStorage.getItem('isGlobalMuted');
        v.muted = savedMuted === null ? true : savedMuted === 'true';
        v.dataset.hasSound = "true";
        v.playsInline = true;
        
        v.onloadedmetadata = () => {
            if (v.videoWidth && v.videoHeight) {
                setAspectRatio(v.videoWidth / v.videoHeight);
            }
        };
        
        const handleCanPlay = () => {
            console.log("Video can play:", videoUrl);
            setVideoReady(true);
        };
        const handleError = (e: any) => {
            console.error("Video element error:", e);
        };
        
        v.addEventListener('canplay', handleCanPlay);
        v.addEventListener('error', handleError);
        
        // Force load
        v.load();
        
        return v;
    }, [videoUrl, isVideo]);

    useEffect(() => {
        const handleGlobalMute = (e: any) => {
            if (video) video.muted = e.detail;
        };
        window.addEventListener('globalMuteChange', handleGlobalMute);
        return () => window.removeEventListener('globalMuteChange', handleGlobalMute);
    }, [video]);

    useEffect(() => {
        if (!video) return;
        if (playing) {
            video.play().catch(err => {
                console.error("Video play failed:", err);
                // If play fails (e.g. need interaction for sound), try muted
                if (err.name === 'NotAllowedError') {
                    video.muted = true;
                    video.play().catch(e => console.error("Muted play also failed:", e));
                }
            });
        } else {
            video.pause();
        }

        // Add cleanup to ensure video stops when component unmounts or playing state changes
        return () => {
            if (video) video.pause();
        };
    }, [playing, video]);

    // Handle full element disposal on unmount or video re-creation
    useEffect(() => {
        return () => {
            if (video) {
                video.pause();
                video.src = "";
                video.load();
                try {
                    video.remove();
                } catch (e) {
                    // Ignore if remove fails
                }
            }
        };
    }, [video]);


    const videoTexture = useMemo(() => video ? new THREE.VideoTexture(video) : null, [video]);
    
    const currentScale = useMemo(() => {
        const maxWidth = baseScale[0];
        const maxHeight = baseScale[1];
        const boxRatio = maxWidth / maxHeight;
        
        if (aspectRatio > boxRatio) {
            // Video is wider than the box
            return [maxWidth, maxWidth / aspectRatio] as [number, number];
        } else {
            // Video is taller than the box
            return [maxHeight * aspectRatio, maxHeight] as [number, number];
        }
    }, [aspectRatio, baseScale]);

    return (
        <group>
            {/* Screen Frame */}
            <mesh position={[0, 0, -0.1]}>
                <boxGeometry args={[currentScale[0] + 0.4, currentScale[1] + 0.4, 0.2]} />
                <meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} />
            </mesh>

            {/* The actual screen - shows video only if playing AND ready */}
            <mesh position={[0, 0, 0.05]} onClick={(e) => { e.stopPropagation(); setPlaying(!playing); }}>
                <planeGeometry args={currentScale} />
                {playing && videoReady && videoTexture ? (
                    <meshBasicMaterial map={videoTexture} toneMapped={false} />
                ) : (
                    <meshBasicMaterial transparent opacity={0} />
                )}
            </mesh>

            {/* Poster Image (Visible when not playing OR video not ready) */}
            {(!playing || !videoReady || !videoTexture) && imageUrl && (
                <Suspense fallback={<meshBasicMaterial color="#050505" />}>
                    <DreiImage
                        url={imageUrl}
                        scale={currentScale}
                        transparent
                        opacity={1}
                        position={[0, 0, 0.06]}
                        onClick={(e) => { e.stopPropagation(); setPlaying(true); }}
                    />
                </Suspense>
            )}

            {/* Play/Pause Overlay in 3D */}
            {!playing && (
                <group position={[0, 0, 0.25]} onClick={(e) => { e.stopPropagation(); setPlaying(true); }}>
                    <mesh>
                        <circleGeometry args={[0.8, 32]} />
                        <meshBasicMaterial color="#000000" transparent opacity={0.6} />
                    </mesh>
                    <mesh>
                        <ringGeometry args={[0.79, 0.81, 64]} />
                        <meshBasicMaterial color="white" transparent opacity={0.3} />
                    </mesh>
                    <mesh position={[0.05, 0, 0.01]} rotation={[0, 0, 0]}>
                        <circleGeometry args={[0.3, 3]} />
                        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
                    </mesh>
                </group>
            )}

            {playing && hovered && (
                <group position={[0, 0, 0.25]} onClick={(e) => { e.stopPropagation(); setPlaying(false); }}>
                    <mesh>
                        <circleGeometry args={[0.8, 32]} />
                        <meshBasicMaterial color="#000000" transparent opacity={0.4} />
                    </mesh>
                    <mesh>
                        <ringGeometry args={[0.79, 0.81, 64]} />
                        <meshBasicMaterial color="white" transparent opacity={0.2} />
                    </mesh>
                    <group position={[-0.15, 0, 0.01]}>
                        <mesh position={[0, 0, 0]}>
                            <planeGeometry args={[0.12, 0.45]} />
                            <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
                        </mesh>
                        <mesh position={[0.3, 0, 0]}>
                            <planeGeometry args={[0.12, 0.45]} />
                            <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
                        </mesh>
                    </group>
                </group>
            )}

            {/* Screen Glow */}
            <pointLight position={[0, 0, 2]} intensity={(hovered || !playing) ? 6 : 2} color={theme.accentColor} distance={15} />

            {/* Empty State Message inside the 3D Screen */}
            {!videoUrl && !imageUrl && (
                <group position={[0, 0, 0.1]}>
                    <DreiText
                        fontSize={isMobile ? 0.4 : 0.8}
                        color="white"
                        anchorX="center"
                        anchorY="middle"
                        maxWidth={isMobile ? 5 : 15}
                        textAlign="center"
                    >
                        {/* Removed external font URL to prevent loading crash */}
                        상영 중인 영상이 없습니다.
                    </DreiText>
                    <DreiText
                        position={[0, -1.2, 0]}
                        fontSize={isMobile ? 0.2 : 0.4}
                        color={theme?.accentColor || '#ffffff'}
                        fillOpacity={0.4}
                        anchorX="center"
                        anchorY="middle"
                    >
                        NO CONTENT PLAYING
                    </DreiText>
                </group>
            )}
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
                    {/* 1. Card Base & Border */}
                    <group position={[0, 0, -0.05]}>
                        {/* Main Body */}
                        <mesh>
                            <boxGeometry args={[4.2, 3.2, 0.1]} />
                            <meshStandardMaterial
                                color={theme.color1}
                                emissive={theme.accentColor}
                                emissiveIntensity={hovered ? 1.5 : 0.2}
                                metalness={0.8}
                                roughness={0.2}
                            />
                        </mesh>
                        {/* Boundary Border */}
                        <mesh scale={[1.02, 1.02, 1.05]}>
                            <boxGeometry args={[4.2, 3.2, 0.1]} />
                            <meshBasicMaterial 
                                color={theme.accentColor} 
                                transparent 
                                opacity={hovered ? 0.8 : 0.3} 
                                wireframe={false}
                            />
                        </mesh>
                    </group>

                    {/* 2. Background Title (Visible during loading) */}
                    <group position={[0, 0, -0.01]}>
                        <DreiText position={[0, 0, 0]} fontSize={0.25} color="white" fillOpacity={0.4} maxWidth={3.5} textAlign="center">
                            {displayName}
                        </DreiText>
                        <DreiText position={[0, -0.6, 0]} fontSize={0.12} color={theme.accentColor} fillOpacity={0.3}>
                            LOADING EXHIBIT...
                        </DreiText>
                    </group>

                    {/* 3. Image Layer */}
                    {imageUrl ? (
                        <CardErrorBoundary fallback={
                            <mesh position={[0, 0, 0.01]}>
                                <planeGeometry args={[4, 3]} />
                                <meshStandardMaterial color={theme.color2} transparent opacity={0.1} />
                                <DreiText position={[0, 0, 0.1]} fontSize={0.5} color={theme.accentColor} fillOpacity={0.2}>
                                    ◈
                                </DreiText>
                            </mesh>
                        }>
                            <Suspense fallback={
                                <mesh position={[0, 0, 0.01]}>
                                    <planeGeometry args={[4, 3]} />
                                    <meshStandardMaterial color={theme.color2} transparent opacity={0.05} />
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
                                    몽땅쏙 ARCHIVE ITEM
                                </DreiText>
                            </group>
                        </mesh>
                    )}

                    {/* 4. Title Bar (Premium Glassmorphism) */}
                    <group position={[0, -1.15, 0.08]}>
                        <mesh>
                            <planeGeometry args={[4.2, 0.9]} />
                            <meshStandardMaterial 
                                color="black" 
                                transparent 
                                opacity={hovered ? 0.85 : 0.65} 
                                metalness={1}
                                roughness={0.1}
                            />
                        </mesh>
                        {/* Glow effect when hovered */}
                        {hovered && (
                            <mesh position={[0, 0, -0.01]}>
                                <planeGeometry args={[4.4, 1.1]} />
                                <meshBasicMaterial color={theme.accentColor} transparent opacity={0.3} />
                            </mesh>
                        )}
                        <CanvasText
                            text={translatedText || displayName || "Loading..."}
                            color={hovered ? theme.accentColor : "white"}
                            width={4}
                            height={0.8}
                        />
                        
                        {/* Interactive Hint */}
                        <group position={[0, -0.65, 0.1]}>
                            <mesh>
                                <planeGeometry args={[hovered ? 2.5 : 1.5, 0.25]} />
                                <meshBasicMaterial color={hovered ? theme.accentColor : "white"} transparent opacity={hovered ? 0.2 : 0.1} />
                            </mesh>
                            <DreiText 
                                fontSize={0.1} 
                                color={hovered ? theme.accentColor : "white"} 
                                fillOpacity={hovered ? 1 : 0.6}
                                font="https://fonts.gstatic.com/s/notosanskr/v27/PpkLdfScl0q6m7JNoN5SpgY.woff2"
                            >
                                {hovered ? "CLICK TO VISIT STORE" : "INTERACTABLE EXHIBIT"}
                            </DreiText>
                        </group>
                    </group>
                </mesh>
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
    targetIndex = 0,
    isTheaterMode = false,
    isZoomed = false
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
    targetIndex?: number,
    isTheaterMode?: boolean,
    isZoomed?: boolean
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

    const isTheater = isTheaterMode || (!!cinemaItem && !isMuseum);
    const activeCinemaItem = cinemaItem || (isTheaterMode ? items[0] : null);

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
                {/* Central Path for Museum */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4.98, -length / 2 + 50]}>
                    <planeGeometry args={[10, length]} />
                    <meshStandardMaterial 
                        color={theme.accentColor} 
                        transparent={false} 
                        metalness={0.1} 
                        roughness={0.9} 
                    />
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
    }, [isMuseum, exhibits.length, theme.accentColor]);


    const lastSetIndex = useRef<number>(-1);
    useFrame((frameState, delta) => {
        if (!isActivated) return;

        if (isTheater) {
            // Birds-eye view (looking down at seats) when paused; immersive level view when playing
            // Reduced FOV (40) and height (12) to minimize perspective "keystone" distortion on vertical lines
            // isZoomed: Zoom directly into the screen plane for 1:1 video focus
            const theaterZ = playing ? (isMobile ? 18 : 32) : (isMobile ? 32 : 55);
            const theaterY = playing ? (isMobile ? 3 : 7) : (isMobile ? 8 : 14);
            
            const zoomZ = isMobile ? 0 : 9; // Calibrated for FOV 40 to fill roughly 90% of screen
            const zoomY = isMobile ? 3 : 7.2; // Center of screen

            const targetZ = isZoomed ? zoomZ : theaterZ;
            const targetY = isZoomed ? zoomY : theaterY;

            const lerpSpeed = isZoomed ? 3.5 : (playing ? 1.5 : 2.5);
            
            camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, delta * lerpSpeed);
            camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, delta * lerpSpeed);
            camera.position.x = 0;
            
            // Focus on screen at all times
            camera.lookAt(0, 7.2, -25);
            return;
        }

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
            ) : !isTheater ? (
                <>
                    <gridHelper args={[1000, 100, theme.accentColor, theme.color3.substring(0, 7)]} rotation={[0, 0, 0]} position={[0, -5, -500]} />
                    <gridHelper args={[1000, 100, theme.accentColor, theme.color3.substring(0, 7)]} rotation={[0, 0, 0]} position={[0, 5, -500]} />
                    
                    {/* Central Path Visualization for corridor effect */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4.98, -500]}>
                        <planeGeometry args={[10, 2000]} />
                        <meshStandardMaterial 
                            color={theme.accentColor} 
                            transparent={false} 
                            metalness={0.1} 
                            roughness={0.9} 
                        />
                    </mesh>
                </>
            ) : (
                <TheaterEnvironment accentColor={theme.accentColor} isPlaying={playing || false} />
            )}

            <Suspense fallback={null}>
                {isTheater && activeCinemaItem ? (
                    <group position={[0, 7.2, -25]}>
                        <VideoScreen
                            videoUrl={activeCinemaItem.videoUrl || ""}
                            imageUrl={activeCinemaItem.imageUrl || activeCinemaItem.image_url || ""}
                            scale={[24, 13.5]}
                            theme={theme}
                            hovered={true}
                            playing={playing || false}
                            setPlaying={setPlaying || (() => {})}
                            isMobile={isMobile}
                        />
                    </group>
                ) : (
                    exhibits.map((ex, i) => (
                        <ExhibitCard
                            key={ex.id || i}
                            item={ex}
                            side={ex.side}
                            zPos={ex.zPos}
                            theme={theme}
                            index={i}
                            lang={lang}
                            onItemClick={onItemClick}
                            isMobile={isMobile}
                            isMuseum={isMuseum}
                            exhibitsCount={exhibits.length}
                        />
                    ))
                )}
            </Suspense>
        </group>
    );
};

const VirtualGallery = ({
    items,
    stories,
    theme,
    lang,
    onItemClick,
    isMuseum = false,
    cinemaItem = null,
    playing,
    setPlaying,
    onActiveIndexChange,
    targetIndex = 0,
    isTheaterMode = false,
    isZoomed = false,
    onClick,
    showUI = true,
    isActivated,
    defaultActivated = false,
    initialItemId = null
}: {
    items: FeaturedItem[],
    stories: any[],
    theme: any,
    lang: string,
    onItemClick?: (item: any) => void,
    isMuseum?: boolean,
    cinemaItem?: FeaturedItem | null,
    playing?: boolean,
    setPlaying?: (p: boolean) => void,
    onActiveIndexChange?: (index: number) => void,
    targetIndex?: number,
    isTheaterMode?: boolean,
    isZoomed?: boolean,
    onClick?: () => void,
    showUI?: boolean,
    isActivated?: boolean,
    defaultActivated?: boolean,
    initialItemId?: string | null
}) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [internalActivated, setInternalActivated] = useState(defaultActivated || isActivated || false);

    // Sync internal state with isActivated prop if it changes
    useEffect(() => {
        if (isActivated !== undefined) {
            setInternalActivated(isActivated);
        }
    }, [isActivated]);

    // If initialItemId is provided, find its index
    const effectiveTargetIndex = useMemo(() => {
        if (initialItemId) {
            const index = items.findIndex(item => item.id === initialItemId);
            if (index !== -1) return index;
        }
        return targetIndex;
    }, [initialItemId, items, targetIndex]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        
        // Delay activation to ensure smooth entry if not already activated
        const timer = setTimeout(() => {
            if (!internalActivated) setInternalActivated(true);
        }, 100);
        
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timer);
        };
    }, [internalActivated]);

    const exhibitsCount = (items?.length || 0) + (stories?.length || 0);
    const scrollPages = isMuseum ? exhibitsCount * 1.5 : exhibitsCount * 1.2;

    return (
        <div 
            className="w-full h-full relative" 
            style={{ background: isMuseum ? '#000' : 'transparent' }}
            onClick={onClick}
        >
            <GalleryErrorBoundary fallback={
                <div className="flex items-center justify-center w-full h-full text-white bg-red-900/20 p-8 text-center rounded-xl border border-red-500/30">
                    <div className="max-w-md">
                        <Box className="w-12 h-12 mx-auto mb-4 text-red-500 opacity-50" />
                        <h3 className="text-xl font-bold mb-2">2D Gallery Interrupted</h3>
                        <p className="opacity-70 mb-4">The exhibition environment encountered a rendering issue. Please try refreshing or check back in a moment.</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded-full text-sm font-medium transition-colors"
                        >
                            Refresh Experience
                        </button>
                    </div>
                </div>
            }>
                <Canvas
                    shadows
                    camera={{ fov: 40, position: [0, 0, 50], near: 0.1, far: 2000 }}
                    gl={{ antialias: true, alpha: true }}
                    onPointerMissed={() => onClick?.()}
                >
                    <color attach="background" args={isMuseum ? ["#050505"] : ["#000000"]} />
                    {isMuseum && <fog attach="fog" args={["#000", 1, 100]} />}
                    
                    <ambientLight intensity={isMuseum ? 0.3 : 0.6} />
                    <pointLight position={[10, 10, 10]} intensity={1.5} color={theme.accentColor} />
                    <pointLight position={[-10, 10, 5]} intensity={1.0} color={theme.color3} />

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
                                onActiveIndexChange={onActiveIndexChange}
                                isActivated={internalActivated}
                                targetIndex={effectiveTargetIndex}
                                isTheaterMode={isTheaterMode}
                                isZoomed={isZoomed}
                            />
                        ) : (
                            <ScrollControls pages={scrollPages} damping={0.2} infinite={false}>
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
                                    onActiveIndexChange={onActiveIndexChange}
                                    isActivated={internalActivated}
                                    targetIndex={targetIndex}
                                    isTheaterMode={isTheaterMode}
                                    isZoomed={isZoomed}
                                />
                            </ScrollControls>
                        )}
                    </Suspense>
                </Canvas>
            </GalleryErrorBoundary>

            {/* Navigation Overlay */}
            {showUI && !isTheaterMode && !cinemaItem && !isMuseum && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
                    <div className="flex items-center gap-3 mb-2 opacity-40">
                        <Compass className="w-4 h-4 text-white animate-spin-slow" />
                        <span className="text-[10px] uppercase tracking-[0.4em] text-white font-bold italic">Explorer</span>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="w-24 h-[1px] bg-gradient-to-r from-transparent to-white/40" />
                        <div className="text-[11px] font-black text-white/80 uppercase tracking-[0.3em]">
                            {isMobile ? "SWIPE TO NAVIGATE" : "SCROLL TO EXPLORE"}
                        </div>
                        <div className="w-24 h-[1px] bg-gradient-to-l from-transparent to-white/40" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default VirtualGallery;
