import React, { useEffect, useState, useRef } from 'react';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { motion, useScroll, useTransform, AnimatePresence, useSpring, useMotionValue, useInView } from 'framer-motion';
import { getFloorCategories } from '../../api/categories';
import { FloorCategory } from '../../types';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FloorGuideModal } from '../common/FloorGuideModal';

const BentoTile = React.forwardRef<HTMLDivElement, { floor: FloorCategory; index: number; onInView: (floor: number) => void; onClick: () => void }>(({ floor, index, onInView, onClick }, ref) => {
    const { t } = useTranslation();
    const internalRef = useRef<HTMLDivElement | null>(null);
    const isInView = useInView(internalRef, { amount: 0.5 });

    useEffect(() => {
        if (isInView) {
            onInView(parseInt(floor.floor) || (index + 1));
        }
    }, [isInView, floor.floor, index, onInView]);

    const mergedRef = (node: HTMLDivElement | null) => {
        internalRef.current = node;
        if (ref) {
            if (typeof ref === 'function') {
                ref(node);
            } else {
                (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
            }
        }
    };

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), { stiffness: 120, damping: 20 });
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), { stiffness: 120, damping: 20 });
    const layerX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-20, 20]), { stiffness: 100, damping: 30 });
    const layerY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-20, 20]), { stiffness: 100, damping: 30 });
    const numX = useSpring(useTransform(mouseX, [-0.5, 0.5], [40, -40]), { stiffness: 150, damping: 40 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!internalRef.current) return;
        const rect = internalRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        mouseX.set(x);
        mouseY.set(y);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    const floorNumber = parseInt(floor.floor) || (index + 1);
    const navKey = `nav.floor${floorNumber}`;
    const floorLabel = t(navKey);
    const [titlePrefix, mainTitle] = floorLabel.includes('|') ? floorLabel.split('|') : [floorLabel, ''];

    // Semantic Dancheong Color Mapping (Solid Blocks)
    const colorMap: Record<number, string> = {
        6: 'bg-dancheong-vibrant-red text-white',      // Pure Jeok
        5: 'bg-dancheong-vibrant-green text-black',    // Pure Yangrok
        4: 'bg-dancheong-vibrant-blue text-white',     // Pure Samcheong
        3: 'bg-dancheong-vibrant-teal text-white',     // Pure Cheong
        2: 'bg-dancheong-vibrant-yellow text-black',   // Pure Hwang
        1: 'bg-white text-black'                       // Neutral
    };
    const blockStyle = colorMap[floorNumber] || 'bg-white text-black';
    const accentColor = blockStyle.includes('text-white') ? 'white' : 'black';
    const accentHexMap: Record<number, string> = {
        6: '230,0,18',
        5: '0,153,68',
        4: '0,160,233',
        3: '0,71,158',
        2: '255,241,0',
        1: '255,255,255'
    };
    const accentRGB = accentHexMap[floorNumber] || '255,255,255';

    return (
        <motion.div
            ref={mergedRef}
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.5, delay: index * 0.1, ease: [0.19, 1, 0.22, 1] }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            style={{
                perspective: "1200px",
                marginTop: index % 3 === 1 ? '3.5rem' : index % 3 === 2 ? '7rem' : '0'
            }}
            className={`group relative aspect-[3/4] rounded-none overflow-hidden ${blockStyle} cursor-pointer border-none transition-all duration-700 hover:scale-[1.02] shadow-[0_40px_80px_rgba(0,0,0,0.2)]`}
        >
            <motion.div style={{ rotateX, rotateY }} className="w-full h-full relative">
                {/* 1. Deep Background: Parallax Image */}
                <motion.div
                    style={{ x: layerX, y: layerY, scale: 1.2 }}
                    className="absolute inset-[-20%] z-0"
                >
                    <div
                        className="w-full h-full bg-cover bg-center grayscale brightness-[0.2] group-hover:grayscale-0 group-hover:brightness-[0.5] transition-all duration-[2s] ease-out"
                        style={{ backgroundImage: `url(${floor.bgImage})` }}
                    />
                </motion.div>

                {/* 2. Middle Layer: Floating Large Number */}
                <motion.div
                    style={{ x: numX, z: 50 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-overlay opacity-5"
                >
                    <span className="text-[25vw] font-serif font-light text-white leading-none italic select-none">
                        {floorNumber}
                    </span>
                </motion.div>

                {/* 3. Texture Layer: Digital Grain & Scanning */}
                <div className="absolute inset-0 z-10 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-1000">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-50 contrast-150 brightness-150" />
                    <motion.div
                        animate={{ y: ["-100%", "200%"] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className={`absolute inset-x-0 h-[1px] bg-${accentColor}/20 blur-[1px]`}
                    />
                </div>

                {/* 4. Content Layer: Refined Typography */}
                <div className="absolute inset-0 z-20 p-12 md:p-16 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[6rem] font-serif font-black opacity-20 group-hover:opacity-100 transition-opacity leading-none tracking-tighter">
                            0{floorNumber}
                        </span>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-black tracking-[1em] opacity-40 uppercase">
                                <AutoTranslatedText text={titlePrefix.trim()} />
                            </h4>
                            <h3 className="text-4xl md:text-5xl font-serif font-black tracking-tighter leading-none">
                                <AutoTranslatedText text={mainTitle?.trim() || titlePrefix.trim()} />
                            </h3>
                        </div>
                        <div className={`w-12 h-1 bg-${accentColor} opacity-20 group-hover:w-full transition-all duration-700`} />
                    </div>

                    <div className="flex items-end justify-between gap-6">
                        <div className="flex flex-wrap gap-x-6 gap-y-2 max-w-[70%]">
                            {floor.subitems?.map((sub, i) => (
                                <span key={i} className={`text-[10px] font-bold tracking-[0.2em] transition-colors duration-700 uppercase italic ${accentColor === 'white' ? 'text-white/40 group-hover:text-white/80' : 'text-black/40 group-hover:text-black/80'}`}>
                                    / <AutoTranslatedText text={typeof sub.label === 'string' ? sub.label : (sub.label.ko || '')} />
                                </span>
                            ))}
                        </div>
                        <div className={`w-12 h-[0.5px] bg-${accentColor} opacity-20`} />
                    </div>
                </div>
            </motion.div>

            {/* Radiant Dancheong Halo (Hover) - Increased Opacity */}
            <div
                className="absolute -inset-20 blur-[120px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none -z-10"
                style={{ backgroundColor: `rgba(${accentRGB}, 0.15)` }}
            />

            {/* Custom Cursor Circle on Hover */}
            <motion.div
                style={{ x: useTransform(mouseX, [-0.5, 0.5], [-100, 100]), y: useTransform(mouseY, [-0.5, 0.5], [-100, 100]) }}
                className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            >
                <div className="w-32 h-32 rounded-full border flex items-center justify-center backdrop-blur-[1px]" style={{ borderColor: `rgba(${accentRGB}, 0.1)` }}>
                    <Plus size={14} className="animate-spin-slow" style={{ color: `rgba(${accentRGB}, 0.4)` }} />
                </div>
            </motion.div>
        </motion.div>
    );
});

BentoTile.displayName = 'BentoTile';

export const FloorGuideSection: React.FC = () => {
    const { t } = useTranslation();
    const [floors, setFloors] = useState<FloorCategory[]>([]);
    const [activeFloor, setActiveFloor] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const floorRefs = useRef<(HTMLDivElement | null)[]>([]);

    const { scrollYProgress } = useScroll();
    const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "80%"]);
    const textReveal = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

    useEffect(() => {
        getFloorCategories().then(data => {
            const floorMap = new Map<number, FloorCategory>();
            data.forEach(item => {
                const num = parseInt(item.floor);
                if (num >= 1 && num <= 6) floorMap.set(num, item);
            });

            const unifiedFloors: FloorCategory[] = [];
            for (let i = 1; i <= 6; i++) {
                if (floorMap.has(i)) {
                    unifiedFloors.push(floorMap.get(i)!);
                } else {
                    unifiedFloors.push({
                        id: `missing-floor-${i}`,
                        floor: i.toString(),
                        title: { ko: `Floor ${i}` },
                        description: { ko: "" },
                        bgImage: `https://images.unsplash.com/photo-${i === 6 ? '1514565131-fce0801e5785' : '1582298538104-fe2e74c27f59'}?auto=format&fit=crop&q=80&w=1200`,
                        subitems: i === 6 ? [
                            { id: 'heritage', label: { ko: '로컬 헤리티지' } },
                            { id: 'tradition', label: { ko: '전통 문화' } }
                        ] : []
                    });
                }
            }
            setFloors(unifiedFloors);
        });
    }, []);

    const handleScrollToFloor = (floorNum: number) => {
        const index = floorNum - 1;
        if (floorRefs.current[index]) {
            floorRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    return (
        <section className="w-full bg-dancheong-deep-bg py-24 md:py-32 relative overflow-hidden font-sans">
            {/* Background Archival Layout */}
            <motion.div
                style={{ y: bgY, opacity: 0.02 }}
                className="absolute inset-0 select-none pointer-events-none flex flex-col items-center justify-center z-0"
            >
                <div className="text-[60vw] font-serif font-black text-white leading-none tracking-tighter italic">DEPT</div>
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-dancheong-border" />
                <div className="absolute top-0 left-1/2 h-full w-[1px] bg-dancheong-border" />
            </motion.div>

            <div className="lossless-layout relative z-10 px-8 md:px-24">
                {/* Museum Header */}
                <div className="mb-32 grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1.5 }}
                        className="lg:col-span-12 relative"
                    >
                        <div className="flex items-center gap-10 mb-8">
                            <div className="w-16 h-[0.5px] bg-dancheong-border" />
                            <span className="text-[10px] font-medium tracking-[1.5em] text-white/40 uppercase"><AutoTranslatedText text="Structural Archive" /></span>
                        </div>
                        <h2 className="text-7xl md:text-[10rem] font-serif tracking-[0.05em] leading-[1.1] uppercase italic group">
                            <span className="font-extralight text-white/90"><AutoTranslatedText text="공간의" /></span> <br />
                            <span className="text-white not-italic font-bold tracking-tighter"><AutoTranslatedText text="질서" /></span>
                        </h2>
                    </motion.div>

                    <motion.div
                        style={{ opacity: textReveal }}
                        className="lg:col-start-7 lg:col-span-6 space-y-12"
                    >
                        <p className="text-white/30 text-base md:text-xl font-serif font-light italic tracking-[0.2em] leading-relaxed text-right max-w-xl ml-auto">
                            <AutoTranslatedText text="단순한 층의 구분을 넘어, 각 레벨은 고유한 문화적 지평을 담고 있습니다. 수직적 서사의 중심을 흐르는 정교한 배열을 탐색하십시오." />
                        </p>
                        <div className="flex justify-end gap-12 text-[10px] font-mono text-white/20 tracking-[0.5em] uppercase">
                            <span><AutoTranslatedText text="GRID.SYSTEM.ACTV" /></span>
                            <span><AutoTranslatedText text="VER.2026.FALL" /></span>
                        </div>
                    </motion.div>
                </div>

                {/* Experimental Rhythmic Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 lg:gap-x-20 relative">
                    <AnimatePresence>
                        {floors.map((floor, index) => (
                            <BentoTile
                                key={floor.id}
                                floor={floor}
                                index={index}
                                ref={(el: HTMLDivElement | null) => (floorRefs.current[index] = el)}
                                onInView={setActiveFloor}
                                onClick={() => setIsModalOpen(true)}
                            />
                        ))}
                    </AnimatePresence>
                </div>

                {/* Archival Aesthetic Footer */}
                <div className="mt-48 border-t border-dancheong-border pt-24 grid grid-cols-1 md:grid-cols-3 gap-24 items-end">
                    <div className="space-y-6">
                        <div className="text-8xl font-serif font-black text-white italic leading-none opacity-20"><AutoTranslatedText text="01-06" /></div>
                        <span className="text-[10px] font-black tracking-[1em] text-white/40 uppercase block"><AutoTranslatedText text="Sequential Dimensions" /></span>
                    </div>

                    <div className="flex flex-col gap-8 items-center">
                        <div className="flex gap-6">
                            {[1, 2, 3, 4, 5, 6].map((n) => {
                                const isActive = activeFloor === n;
                                const floorLabel = t(`nav.floor${n}`).split('|')[1]?.trim() || `Floor ${n}`;
                                return (
                                    <div key={n} className="relative group/dot">
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-dancheong-border opacity-0 group-hover/dot:opacity-100 transition-all duration-500 pointer-events-none whitespace-nowrap">
                                            <span className="text-[9px] font-bold tracking-[0.2em] text-white uppercase"><AutoTranslatedText text={`${n}F`} /> <AutoTranslatedText text={floorLabel} /></span>
                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/60 border-r border-b border-dancheong-border rotate-45" />
                                        </div>

                                        <button
                                            onClick={() => handleScrollToFloor(n)}
                                            className={`w-2.5 h-2.5 rounded-full transition-all duration-700 relative
                                                ${isActive
                                                    ? n === 6 ? 'bg-dancheong-red shadow-[0_0_15px_rgba(139,58,54,0.6)] scale-125'
                                                        : n === 5 ? 'bg-dancheong-teal shadow-[0_0_15px_rgba(91,176,133,0.6)] scale-125'
                                                            : n === 4 ? 'bg-dancheong-blue shadow-[0_0_15px_rgba(123,166,201,0.6)] scale-125'
                                                                : n === 3 ? 'bg-dancheong-green shadow-[0_0_15px_rgba(74,93,78,0.6)] scale-125'
                                                                    : n === 2 ? 'bg-dancheong-yellow shadow-[0_0_15px_rgba(218,165,32,0.6)] scale-125'
                                                                        : 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.4)] scale-125'
                                                    : 'bg-white/10 hover:bg-white/30'}
                                            `}
                                        >
                                            {isActive && (
                                                <motion.div
                                                    layoutId="active-dot-ring"
                                                    className="absolute inset-[-4px] border border-white/20 rounded-full"
                                                />
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-[0.5px] bg-dancheong-border" />
                            <span className="text-[10px] font-mono text-white/20 tracking-[0.3em]"><AutoTranslatedText text="NAVIGATE.SYSTEM" /></span>
                            <div className="w-12 h-[0.5px] bg-dancheong-border" />
                        </div>
                    </div>

                    <div className="text-right space-y-4">
                        <div className="text-[10px] font-mono text-white/40 tracking-[0.4em] uppercase">
                            <AutoTranslatedText text="Department Culture Research Group" />
                        </div>
                        <div className="text-[9px] font-mono text-white/10 tracking-[0.2em] uppercase">
                            <AutoTranslatedText text="All spatial data is encrypted and archived within the Department Network." />
                        </div>
                    </div>
                </div>
            </div>

            {/* Radiant Spotlight */}
            <div className="absolute top-1/4 -left-1/4 w-[1200px] h-[1200px] bg-dancheong-green/[0.03] rounded-full blur-[300px] pointer-events-none -z-10 animate-pulse" />
            <div className="absolute bottom-[-1/4] right-[-1/4] w-[1500px] h-[1500px] bg-dancheong-red/[0.03] rounded-full blur-[400px] pointer-events-none -z-10" />

            <FloorGuideModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </section>
    );
};
