import React, { useMemo, useRef, Suspense, Component, ReactNode } from 'react';
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

// Local error boundary for individual cards to prevent one broken image from crashing the whole canvas
class CardErrorBoundary extends Component<{ children: ReactNode, fallback: ReactNode }, { hasError: boolean }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() { return { hasError: true }; }
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
}

const ExhibitCard = ({ item, side, zPos, theme, index, lang, onItemClick }: ExhibitProps) => {
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
        
        // Fallbacks
        return val.ko || val.en || Object.values(val)[0] || "";
    };

    const displayName = getDisplayName(item.title);
    const { translatedText } = useAutoTranslate(displayName, lang);

    useFrame((state) => {
        if (!groupRef.current) return;
        
        const { viewport, size } = state;
        const isMobile = size.width < 768;

        // Sticky Focus Plateau Logic (Targeting the viewing sweet spot zPos + 8)
        const sweetSpot = zPos + 8;
        const distToSweetSpot = Math.abs(state.camera.position.z - sweetSpot);
        
        let centerFactor = 0;
        if (distToSweetSpot <= 4) { // Increased stable plateau
            centerFactor = 1.0;
        } else if (distToSweetSpot <= 10) { // Smoother approach
            centerFactor = THREE.MathUtils.smoothstep(distToSweetSpot, 10, 4);
        }

        const baseWidth = 4;
        const targetWidth = Math.min(viewport.width * 0.82, 4.2);
        const responsiveScale = targetWidth / baseWidth;

        // X Displacement and Rotation
        const sideDisplacement = Math.min(viewport.width * 0.35, 4.2);
        const startX = side * sideDisplacement;
        const targetX = THREE.MathUtils.lerp(startX, 0, centerFactor);
        const targetRotationY = THREE.MathUtils.lerp(side * -Math.PI / 10, 0, centerFactor);
        
        const hoverScale = hovered ? 1.05 : 1;
        const baseScale = isMobile ? 0.75 : 0.95;
        const finalScale = responsiveScale * baseScale * hoverScale;
        
        // Update Card Transforms (Scaling + Rotation)
        if (groupRef.current) {
            groupRef.current.position.x = targetX;
            groupRef.current.rotation.y = targetRotationY;
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
                                <meshStandardMaterial color={theme.color2} transparent opacity={0.5} />
                                <DreiText position={[0, 0, 0.01]} fontSize={0.2} color="white" fillOpacity={0.3}>
                                    NOT AVAILABLE
                                </DreiText>
                            </mesh>
                        }>
                            <Suspense fallback={
                                <mesh position={[0, 0, 0.01]}>
                                    <planeGeometry args={[4, 3]} />
                                    <meshStandardMaterial color={theme.color2} transparent opacity={0.3} />
                                </mesh>
                            }>
                                <DreiImage 
                                    url={imageUrl} 
                                    scale={[4, 3]} 
                                    transparent 
                                    opacity={hovered ? 1 : 0.9}
                                    position={[0, 0, 0.01]}
                                />
                            </Suspense>
                        </CardErrorBoundary>
                    ) : (
                        <mesh position={[0, 0, 0.01]}>
                            <planeGeometry args={[4, 3]} />
                            <meshStandardMaterial color={theme.color2} transparent opacity={0.5} />
                            <DreiText position={[0, 0, 0.01]} fontSize={0.2} color="white" fillOpacity={0.3}>
                                NO IMAGE
                            </DreiText>
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

const GalleryScene = ({ items, stories, theme, lang, onItemClick }: { items: FeaturedItem[], stories: any[], theme: any, lang: string, onItemClick?: (item: any) => void }) => {
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

    useFrame(() => {
        const scrollZ = scroll.offset * -(exhibits.length * 20 + 10);
        let pullBias = 0;
        
        // Magnetic Pull Logic: Find the closest exhibit sweet spot and add a 'pull' to the camera target
        exhibits.forEach((ex) => {
            const sweetSpot = ex.zPos + 8;
            const dist = Math.abs(scrollZ - sweetSpot);
            
            // Influence range (e.g., 5 units). Bell curve pull strength.
            if (dist < 6) {
                const strength = Math.pow(1 - dist / 6, 2); // Squared for a sharper but smooth center
                pullBias += (sweetSpot - scrollZ) * strength * 0.85; // Pull the camera toward the sweet spot
            }
        });

        const targetCameraZ = scrollZ + pullBias;
        
        // Smoothly move the camera toward the biased target
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCameraZ, 0.1);
        
        // Always look straight down the corridor
        camera.lookAt(0, 0, camera.position.z - 20);
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
                />
            ))}

            <ambientLight intensity={1.5} />
            <pointLight position={[0, 10, -5]} intensity={2} color={theme.accentColor} />
            <pointLight position={[0, -10, -5]} intensity={1} color={theme.color3.substring(0, 7)} />
        </group>
    );
};

export const VirtualGallery = ({ items, stories, theme, showUI = true, lang = 'ko', onItemClick }: { items: FeaturedItem[], stories: any[], theme: any, showUI?: boolean, lang?: string, onItemClick?: (item: any) => void }) => {
    return (
        <div className="w-full h-full relative bg-[#0a0a0a] overflow-hidden">
            <GalleryErrorBoundary fallback={
                <div className="w-full h-full flex flex-col items-center justify-center text-white/20 p-12 text-center">
                    <Compass size={48} className="mb-6 opacity-10" />
                    <p className="text-sm font-mono tracking-[0.3em] uppercase"><AutoTranslatedText text="3D Gallery Error - Using Standard View" /></p>
                </div>
            }>
                <Canvas shadows={false} dpr={[1, 2]}>
                    <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
                    <ScrollControls 
                        pages={Math.max(3, ((items?.length || 0) + (stories?.length || 0)) * 0.8)} 
                        damping={0.3} 
                        distance={1}
                    >
                        <Suspense fallback={
                            <mesh>
                                <boxGeometry args={[1, 1, 1]} />
                                <meshBasicMaterial color="gray" wireframe />
                            </mesh>
                        }>
                            <GalleryScene items={items} stories={stories} theme={theme} lang={lang} onItemClick={onItemClick} />
                        </Suspense>
                    </ScrollControls>
                </Canvas>
            </GalleryErrorBoundary>

            {showUI && (
                <>
                    <div className="absolute top-10 right-10 pointer-events-none z-20 text-right">
                        <div className="text-[10px] font-mono tracking-[0.4em] text-white/40 mb-1 uppercase">Navigation Guide</div>
                        <div className="text-xl font-serif italic text-white/60">Scroll to explore the Temporal Corridor</div>
                    </div>

                    <div className="absolute bottom-10 left-10 pointer-events-none z-20">
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-white leading-none">{items.length + stories.length}</span>
                                <span className="text-[8px] font-mono tracking-widest text-white/40 uppercase">Total Exhibits</span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default VirtualGallery;
