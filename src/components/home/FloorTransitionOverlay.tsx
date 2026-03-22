import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AutoTranslatedText } from '../common/AutoTranslatedText';

interface FloorTransitionOverlayProps {
    floorNumber: number;
    floorTitle: string;
    floorColor: string;
    onComplete: () => void;
}

export const FloorTransitionOverlay: React.FC<FloorTransitionOverlayProps> = ({
    floorNumber,
    floorTitle,
    floorColor,
    onComplete
}) => {
    const [stage, setStage] = useState<'zoom' | 'door' | 'suck' | 'complete'>('zoom');

    useEffect(() => {
        // Timeline: 2s (Facade) -> 0.1s (Hinge Start) -> 3.5s (Suck Zoom) -> Complete
        const zoomTimer = setTimeout(() => setStage('door'), 2000); 
        const arrivalTimer = setTimeout(() => setStage('suck'), 2100); 
        const completeTimer = setTimeout(() => {
            setStage('complete');
            setTimeout(() => onComplete(), 350); // Handover Flash overlap
        }, 5600); 

        return () => {
            clearTimeout(zoomTimer);
            clearTimeout(arrivalTimer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    // Simulated Stars for the Starfield
    const stars = Array.from({ length: 140 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 0.8 + Math.random() * 1.8,
    }));

    // Simulated Glowing Spheres (Matching Image 2 primary nodes for seamless arrival)
    const spheres = [
        { x: -28, y: -15, size: 30, delay: 0.1, label: '문화 담론' },
        { x: -6, y: -30, size: 48, delay: 0.3, label: '아티스트 인터뷰' },
        { x: 18, y: -22, size: 32, delay: 0.05, label: '토크 플러스' },
    ];

    // Studs for Gwanghwamun Gate (Brass nubs)
    const studs = Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        x: (i % 3) * 35 + 15, // 3 columns
        y: Math.floor(i / 3) * 20 + 10, // 5 rows
    }));

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ 
                opacity: 1,
                x: stage === 'suck' ? [0, -1, 1, -1, 1, 0] : 0 
            }}
            exit={{ opacity: 0 }}
            transition={{ 
                x: { duration: 0.1, repeat: stage === 'suck' ? Infinity : 0 }
            }}
            className="fixed inset-0 z-[5000] flex items-center justify-center overflow-hidden bg-black [perspective:1500px]"
        >
            {/* 1. LAYER: Vertical Facade Zoom (Background) - Full Opacity to hide underlying page */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                    scale: stage === 'zoom' ? 1.2 : 4, 
                    opacity: (stage === 'zoom' || stage === 'door') ? 1.0 : 0
                }}
                transition={{ 
                    scale: { duration: stage === 'zoom' ? 2 : 4, ease: "linear" },
                    opacity: { duration: 0.5 }
                }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black"
            >
                <div 
                    className="w-[200vw] h-[200vh] opacity-30"
                    style={{ 
                        backgroundImage: `
                            linear-gradient(to right, ${floorColor}44 2.5px, transparent 2.5px),
                            linear-gradient(to bottom, ${floorColor}44 2.5px, transparent 2.5px)
                        `,
                        backgroundSize: '150px 150px, 150px 150px',
                        transform: 'translateZ(-100px)'
                    }}
                />
            </motion.div>

            {/* 2. LAYER: 3D Space Arrival (Behind Doors, Scaled Sync) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden">
                <AnimatePresence>
                    {(stage === 'suck' || stage === 'complete') && (
                        <motion.div 
                            initial={{ scale: 0.2, opacity: 0 }} 
                            animate={{ scale: 1.5, opacity: 1 }} 
                            exit={{ opacity: 1 }}
                            transition={{ duration: 3.5, ease: "easeOut" }}
                            className="relative w-full h-full flex items-center justify-center bg-black"
                        >
                            {/* Nebula Glow Background (Depth Sync) */}
                            <motion.div 
                                animate={{ 
                                    opacity: [0.15, 0.3, 0.15],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{ duration: 15, repeat: Infinity }}
                                className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(66,56,202,0.25),transparent_75%)]"
                            />

                            {/* Starfield */}
                            <div className="absolute inset-0">
                                {stars.map(s => (
                                    <div 
                                        key={s.id}
                                        className="absolute bg-white rounded-full opacity-50 shadow-[0_0_6px_#fff]"
                                        style={{ 
                                            left: `${s.x}%`, 
                                            top: `${s.y}%`, 
                                            width: s.size, 
                                            height: s.size 
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Cyan 3D Grid Plane (Image 2 Precise) */}
                            <div 
                                className="absolute bottom-[-10%] w-[180vw] h-[100vh] opacity-100"
                                style={{ 
                                    backgroundImage: `
                                        linear-gradient(to right, #00E5FF 1.8px, transparent 1.8px),
                                        linear-gradient(to bottom, #00E5FF 1.8px, transparent 1.8px)
                                    `,
                                    backgroundSize: '75px 75px',
                                    transform: 'perspective(1500px) rotateX(75deg)'
                                }}
                            />

                            {/* Labeled Spheres (Matching Image 2) */}
                            {spheres.map((s, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ 
                                        opacity: 1, 
                                        scale: 1,
                                        y: [0, -10, 0] // Subtle floating animation for 3D depth
                                    }}
                                    transition={{ 
                                        delay: s.delay, 
                                        duration: 1,
                                        y: { duration: 3 + i, repeat: Infinity, ease: "easeInOut" }
                                    }}
                                    className="absolute flex flex-col items-center pointer-events-none z-20"
                                    style={{ 
                                        left: `calc(50% + ${s.x}vw)`,
                                        top: `calc(50% + ${s.y}vh)`,
                                    }}
                                >
                                    <span className="text-white text-[10px] md:text-[12px] font-bold mb-1 opacity-90 whitespace-nowrap bg-black/70 px-2 py-0.5 rounded border border-[#FF5252]/40 shadow-[0_0_20px_rgba(255,82,82,0.4)]">
                                        <AutoTranslatedText text={s.label} />
                                    </span>
                                    <div 
                                        className="rounded-full shadow-[0_0_30px_rgba(255,82,82,0.5)]"
                                        style={{ 
                                            width: s.size,
                                            height: s.size,
                                            background: `radial-gradient(circle at 30% 30%, #fff, #FF5252 45%, #4A0E0E 100%)`,
                                            border: '1px solid rgba(255,160,160,0.3)'
                                        }}
                                    />
                                </motion.div>
                            ))}

                            {/* Ambient Warp Glow (Purple/Pink for match) */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 0.3, 0] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="absolute w-full h-full bg-[#E91E63] blur-[200px] opacity-10 z-30"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 3. LAYER: Gwanghwamun Gates (Swinging Mid/Ingress) */}
            <div className="relative w-full h-full flex items-center justify-center z-30 pointer-events-none [preserve-3d]">
                <motion.div
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: (stage === 'suck' || stage === 'complete') ? -105 : 0 }}
                    transition={{ duration: 1.8, ease: [0.45, 0.05, 0.55, 0.95] }}
                    className="absolute right-1/2 w-[50.2vw] h-full border-r-[8px] border-[#3F1105] bg-[#7C2D12] overflow-hidden shadow-[20px_0_100px_rgba(0,0,0,1)]"
                    style={{ 
                        transformOrigin: 'left center', // Swing INWARDS
                        backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.5), transparent)`
                    }}
                >
                    {/* Brass Studs Grid (3x5) */}
                    <div className="absolute inset-0 flex flex-wrap content-start">
                        {studs.map(s => (
                            <div 
                                key={s.id}
                                className="absolute w-10 h-10 rounded-full bg-gradient-to-br from-[#FDE68A] via-[#B45309] to-[#451A03] shadow-[4px_4px_10px_rgba(0,0,0,0.5)] border-[1px] border-[#FDE68A]/30"
                                style={{ left: `${s.x}%`, top: `${s.y}%` }}
                            />
                        ))}
                    </div>
                </motion.div>

                <motion.div
                   initial={{ rotateY: 0 }}
                   animate={{ rotateY: (stage === 'suck' || stage === 'complete') ? 105 : 0 }}
                   transition={{ duration: 1.8, ease: [0.45, 0.05, 0.55, 0.95] }}
                    className="absolute left-1/2 w-[50.2vw] h-full border-l-[8px] border-[#3F1105] bg-[#7C2D12] overflow-hidden shadow-[-20px_0_100px_rgba(0,0,0,1)]"
                    style={{ 
                        transformOrigin: 'right center', // Swing INWARDS
                        backgroundImage: `linear-gradient(to left, rgba(0,0,0,0.5), transparent)`
                    }}
                >
                    {/* Brass Studs Grid (3x5) */}
                    <div className="absolute inset-0 flex flex-wrap content-start">
                        {studs.map(s => (
                            <div 
                                key={s.id}
                                className="absolute w-10 h-10 rounded-full bg-gradient-to-br from-[#FDE68A] via-[#B45309] to-[#451A03] shadow-[4px_4px_10px_rgba(0,0,0,0.5)] border-[1px] border-[#FDE68A]/30"
                                style={{ left: `${100 - s.x}%`, top: `${s.y}%`, transform: 'translateX(-100%)' }}
                            />
                        ))}
                    </div>
                </motion.div>

                <AnimatePresence>
                    {(stage === 'zoom' || stage === 'door') && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 50 }}
                            animate={{ opacity: 1, scale: 1.2, y: 0 }}
                            exit={{ opacity: 0, scale: 5, filter: 'blur(60px)', y: -300 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="absolute z-40 flex flex-col items-center justify-center p-20 bg-black/40 backdrop-blur-sm rounded-3xl"
                        >
                            <span className="text-[10rem] md:text-[14rem] font-black font-serif italic mb-4 leading-none" style={{ color: floorColor, textShadow: `0 0 100px ${floorColor}aa` }}>
                                {floorNumber}F
                            </span>
                            <div className="flex flex-col items-center mt-4">
                                <h2 className="text-4xl md:text-5xl font-black text-white tracking-[0.8em] uppercase mb-10">
                                    <AutoTranslatedText text={floorTitle} />
                                </h2>
                                <div className="w-80 h-[3px] bg-[#00FFC2] shadow-[0_0_30px_#00FFC2]" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {stage === 'complete' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-white z-[6000]"
                />
            )}
        </motion.div>
    );
};
