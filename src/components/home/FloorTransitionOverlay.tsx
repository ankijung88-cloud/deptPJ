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
        // Refined Timeline for "Slow Zoom -> Lateral Sliding Doors -> Internal Vortex"
        const zoomTimer = setTimeout(() => setStage('door'), 2000); 
        const suckTimer = setTimeout(() => setStage('suck'), 3200); 
        const completeTimer = setTimeout(() => onComplete(), 5500); 

        return () => {
            clearTimeout(zoomTimer);
            clearTimeout(suckTimer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    // Particles for the vacuum effect
    const particles = Array.from({ length: 45 }).map((_, i) => ({
        id: i,
        angle: (i / 45) * Math.PI * 2,
        delay: Math.random() * 1.5,
        duration: 1.0 + Math.random() * 0.5,
        scale: 0.8 + Math.random() * 1.5,
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
            className="fixed inset-0 z-[5000] flex items-center justify-center overflow-hidden bg-black"
        >
            {/* 1. LAYER: Vertical Facade Zoom (Background) */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                    scale: stage === 'zoom' ? 1.2 : 6, 
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
                            linear-gradient(to bottom, ${floorColor}22 2px, transparent 2px),
                            linear-gradient(90deg, rgba(255,255,255,0.02) 0%, transparent 50%, rgba(255,255,255,0.02) 100%)
                        `,
                        backgroundSize: '200px 200px, 200px 200px, 100% 100%',
                        transform: 'perspective(1000px) translateZ(-100px)'
                    }}
                />
            </motion.div>

            {/* 2. LAYER: Internal Vortex (Visible through sliding gap) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden">
                <AnimatePresence>
                    {(stage === 'suck' || stage === 'complete') && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="relative w-full h-full flex items-center justify-center"
                        >
                            <motion.div
                                initial={{ scale: 0.05, opacity: 0, border: `6px solid ${floorColor}` }}
                                animate={{ scale: 20, opacity: [0, 1, 0] }}
                                transition={{ duration: 2.5, ease: "easeOut" }}
                                className="absolute w-32 h-32 rounded-full"
                            />

                            <motion.div
                                animate={{ 
                                    scale: [1, 1.3, 1],
                                    opacity: [0.6, 1, 0.6]
                                }}
                                transition={{ duration: 0.4, repeat: Infinity }}
                                className="w-64 h-64 rounded-full blur-[80px]"
                                style={{ backgroundColor: floorColor }}
                            />

                            {particles.map((p) => (
                                <motion.div
                                    key={p.id}
                                    initial={{ 
                                        x: Math.cos(p.angle) * window.innerWidth * 1.5,
                                        y: Math.sin(p.angle) * window.innerHeight * 1.5,
                                        scale: 0,
                                        opacity: 0
                                    }}
                                    animate={{ 
                                        x: 0, 
                                        y: 0, 
                                        scale: [0, p.scale, 0],
                                        opacity: [0, 1, 0]
                                    }}
                                    transition={{ 
                                        duration: p.duration, 
                                        delay: p.delay,
                                        repeat: Infinity,
                                        ease: "circIn"
                                    }}
                                    className="absolute w-1 h-80 rounded-full"
                                    style={{ 
                                        backgroundColor: floorColor,
                                        boxShadow: `0 0 20px ${floorColor}`,
                                        rotate: `${p.angle}rad`,
                                        transformOrigin: '50% 100%'
                                    }}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 3. LAYER: Lateral Sliding Doors (Foreground) */}
            <div className="relative w-full h-full flex items-center justify-center z-30 pointer-events-none overflow-hidden">
                {/* Left Sliding Door */}
                <motion.div
                    initial={{ x: 0 }}
                    animate={{ x: (stage === 'suck' || stage === 'complete') ? '-100%' : 0 }}
                    transition={{ duration: 1.6, ease: [0.6, 0.01, -0.05, 0.95] }}
                    className="absolute right-1/2 w-[50vw] h-full border-r-[4px] border-[#00FFC2]/50 overflow-hidden shadow-[20px_0_50px_rgba(0,0,0,0.8)] bg-[#121917]"
                    style={{ 
                        backgroundImage: `repeating-linear-gradient(45deg, rgba(0,255,194,0.04) 0, rgba(0,255,194,0.04) 3px, transparent 3px, transparent 12px)`
                    }}
                >
                    <div className="absolute inset-16 border-[3px] border-[#00FFC2]/15 flex flex-col items-center justify-around py-32">
                        <div className="w-12 h-12 border-[3px] border-[#00FFC2]/30 rotate-45" />
                        <div className="w-20 h-20 border-[3px] border-[#00FFC2]/30 rotate-45 flex items-center justify-center">
                           <div className="w-8 h-8 bg-[#00FFC2]/20" />
                        </div>
                        <div className="w-12 h-12 border-[3px] border-[#00FFC2]/30 rotate-45" />
                    </div>
                </motion.div>

                {/* Right Sliding Door */}
                <motion.div
                   initial={{ x: 0 }}
                   animate={{ x: (stage === 'suck' || stage === 'complete') ? '100%' : 0 }}
                   transition={{ duration: 1.6, ease: [0.6, 0.01, -0.05, 0.95] }}
                    className="absolute left-1/2 w-[50vw] h-full border-l-[4px] border-[#00FFC2]/50 overflow-hidden shadow-[-20px_0_50px_rgba(0,0,0,0.8)] bg-[#121917]"
                    style={{ 
                        backgroundImage: `repeating-linear-gradient(45deg, rgba(0,255,194,0.04) 0, rgba(0,255,194,0.04) 3px, transparent 3px, transparent 12px)`
                    }}
                >
                    <div className="absolute inset-16 border-[3px] border-[#00FFC2]/15 flex flex-col items-center justify-around py-32">
                        <div className="w-12 h-12 border-[3px] border-[#00FFC2]/30 rotate-45" />
                        <div className="w-20 h-20 border-[3px] border-[#00FFC2]/30 rotate-45 flex items-center justify-center">
                           <div className="w-8 h-8 bg-[#00FFC2]/20" />
                        </div>
                        <div className="w-12 h-12 border-[3px] border-[#00FFC2]/30 rotate-45" />
                    </div>
                </motion.div>

                {/* Typography Overlay */}
                <AnimatePresence>
                    {(stage === 'zoom' || stage === 'door') && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 50 }}
                            animate={{ opacity: 1, scale: 1.2, y: 0 }}
                            exit={{ opacity: 0, scale: 4, filter: 'blur(40px)', y: -200 }}
                            transition={{ duration: 1.8, ease: "easeOut" }}
                            className="absolute z-40 flex flex-col items-center justify-center"
                        >
                            <span className="text-[18rem] md:text-[24rem] font-black font-serif italic mb-6 leading-none" style={{ color: floorColor, textShadow: `0 0 70px ${floorColor}cc` }}>
                                {floorNumber}
                            </span>
                            <div className="flex flex-col items-center -mt-12">
                                <h2 className="text-6xl md:text-8xl font-black text-white tracking-[0.6em] uppercase mb-8">
                                    <AutoTranslatedText text={floorTitle} />
                                </h2>
                                <div className="w-64 h-[2px] bg-[#00FFC2] shadow-[0_0_20px_#00FFC2]" />
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
