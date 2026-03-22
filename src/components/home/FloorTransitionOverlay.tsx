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
        // Timeline for "Slow Zoom -> Door Slide -> 3D Space Arrival"
        const zoomTimer = setTimeout(() => setStage('door'), 2000); 
        const arrivalTimer = setTimeout(() => setStage('suck'), 2100); 
        const completeTimer = setTimeout(() => onComplete(), 4800); 

        return () => {
            clearTimeout(zoomTimer);
            clearTimeout(arrivalTimer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    // Simulated Stars for the Starfield
    const stars = Array.from({ length: 100 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 2,
    }));

    // Simulated Glowing Spheres from the user image
    const spheres = [
        { x: -20, y: -10, size: 40, delay: 0.1 },
        { x: 15, y: -30, size: 55, delay: 0.3 },
        { x: -40, y: -25, size: 30, delay: 0 },
        { x: 35, y: -15, size: 45, delay: 0.2 },
    ];

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
            className="fixed inset-0 z-[5000] flex items-center justify-center overflow-hidden bg-black"
        >
            {/* 1. LAYER: Vertical Facade Zoom (Background) */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                    scale: stage === 'zoom' ? 1.2 : 10, 
                    opacity: stage === 'complete' ? 0 : 0.6
                }}
                transition={{ 
                    scale: { duration: stage === 'zoom' ? 2 : 4, ease: "linear" },
                    opacity: { duration: 1 }
                }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
                <div 
                    className="w-[200vw] h-[200vh] opacity-30"
                    style={{ 
                        backgroundImage: `
                            linear-gradient(to right, ${floorColor}22 2px, transparent 2px),
                            linear-gradient(to bottom, ${floorColor}22 2px, transparent 2px)
                        `,
                        backgroundSize: '200px 200px, 200px 200px',
                        transform: 'perspective(1000px) translateZ(-100px)'
                    }}
                />
            </motion.div>

            {/* 2. LAYER: 3D Space Arrival (Behind Doors, Zooms through gap) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden">
                <AnimatePresence>
                    {(stage === 'suck' || stage === 'complete') && (
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 10, opacity: 1 }}
                            exit={{ opacity: 1 }}
                            transition={{ duration: 2.8, ease: "easeIn" }}
                            className="relative w-full h-full flex items-center justify-center bg-black"
                        >
                            {/* Starfield */}
                            <div className="absolute inset-0">
                                {stars.map(s => (
                                    <div 
                                        key={s.id}
                                        className="absolute bg-white rounded-full opacity-40"
                                        style={{ 
                                            left: `${s.x}%`, 
                                            top: `${s.y}%`, 
                                            width: s.size, 
                                            height: s.size 
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Cyan 3D Grid Plane (from user image) */}
                            <div 
                                className="absolute bottom-[-20%] w-[150vw] h-[100vh] opacity-50"
                                style={{ 
                                    backgroundImage: `
                                        linear-gradient(to right, #00E5FF 1px, transparent 1px),
                                        linear-gradient(to bottom, #00E5FF 1px, transparent 1px)
                                    `,
                                    backgroundSize: '80px 80px',
                                    transform: 'perspective(1000px) rotateX(75deg)'
                                }}
                            />

                            {/* Glowing Spheres (from user image) */}
                            {spheres.map((s, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: s.delay, duration: 0.8 }}
                                    className="absolute rounded-full blur-[2px]"
                                    style={{ 
                                        left: `calc(50% + ${s.x}vw)`,
                                        top: `calc(50% + ${s.y}vh)`,
                                        width: s.size,
                                        height: s.size,
                                        background: `radial-gradient(circle at 30% 30%, #fff, #00E5FF 40%, #0091EA 100%)`,
                                        boxShadow: `0 0 40px rgba(0,229,255,0.6)`
                                    }}
                                />
                            ))}

                            {/* Center Glow Flash */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 0.4, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute w-full h-full bg-[#00E5FF] blur-[150px] opacity-20"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 3. LAYER: Lateral Sliding Doors (Foreground) */}
            <div className="relative w-full h-full flex items-center justify-center z-30 pointer-events-none overflow-hidden">
                <motion.div
                    initial={{ x: 0 }}
                    animate={{ x: (stage === 'suck' || stage === 'complete') ? '-100%' : 0 }}
                    transition={{ duration: 1.6, ease: [0.6, 0.01, -0.05, 0.95] }}
                    className="absolute right-1/2 w-[50vw] h-full border-r-[4px] border-[#00FFC2]/50 overflow-hidden shadow-[20px_0_100px_rgba(0,0,0,1)] bg-[#121917]"
                    style={{ 
                        backgroundImage: `repeating-linear-gradient(45deg, rgba(0,255,194,0.04) 0, rgba(0,255,194,0.04) 3px, transparent 3px, transparent 12px)`
                    }}
                >
                    <div className="absolute inset-20 border-[2px] border-[#00FFC2]/15 flex flex-col items-center justify-around py-40">
                        <div className="w-16 h-16 border-[2px] border-[#00FFC2]/30 rotate-45" />
                        <div className="w-24 h-24 border-[2px] border-[#00FFC2]/30 rotate-45 flex items-center justify-center">
                           <div className="w-10 h-10 bg-[#00FFC2]/20" />
                        </div>
                        <div className="w-16 h-16 border-[2px] border-[#00FFC2]/30 rotate-45" />
                    </div>
                </motion.div>

                <motion.div
                   initial={{ x: 0 }}
                   animate={{ x: (stage === 'suck' || stage === 'complete') ? '100%' : 0 }}
                   transition={{ duration: 1.6, ease: [0.6, 0.01, -0.05, 0.95] }}
                    className="absolute left-1/2 w-[50vw] h-full border-l-[4px] border-[#00FFC2]/50 overflow-hidden shadow-[-20px_0_100px_rgba(0,0,0,1)] bg-[#121917]"
                    style={{ 
                        backgroundImage: `repeating-linear-gradient(45deg, rgba(0,255,194,0.04) 0, rgba(0,255,194,0.04) 3px, transparent 3px, transparent 12px)`
                    }}
                >
                    <div className="absolute inset-20 border-[2px] border-[#00FFC2]/15 flex flex-col items-center justify-around py-40">
                        <div className="w-16 h-16 border-[2px] border-[#00FFC2]/30 rotate-45" />
                        <div className="w-24 h-24 border-[2px] border-[#00FFC2]/30 rotate-45 flex items-center justify-center">
                           <div className="w-10 h-10 bg-[#00FFC2]/20" />
                        </div>
                        <div className="w-16 h-16 border-[2px] border-[#00FFC2]/30 rotate-45" />
                    </div>
                </motion.div>

                <AnimatePresence>
                    {(stage === 'zoom' || stage === 'door') && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 50 }}
                            animate={{ opacity: 1, scale: 1.2, y: 0 }}
                            exit={{ opacity: 0, scale: 5, filter: 'blur(60px)', y: -300 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="absolute z-40 flex flex-col items-center justify-center"
                        >
                            <span className="text-[20rem] md:text-[28rem] font-black font-serif italic mb-8 leading-none" style={{ color: floorColor, textShadow: `0 0 100px ${floorColor}aa` }}>
                                {floorNumber}
                            </span>
                            <div className="flex flex-col items-center -mt-16">
                                <h2 className="text-7xl md:text-9xl font-black text-white tracking-[0.8em] uppercase mb-10">
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
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-white z-[6000]"
                />
            )}
        </motion.div>
    );
};
