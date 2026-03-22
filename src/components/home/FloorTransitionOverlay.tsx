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
        // Timeline for maximum impact
        const zoomTimer = setTimeout(() => setStage('door'), 600); // Faster zoom
        const doorTimer = setTimeout(() => setStage('suck'), 1600);
        const completeTimer = setTimeout(() => onComplete(), 3800);

        return () => {
            clearTimeout(zoomTimer);
            clearTimeout(doorTimer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    // Particles for the vacuum effect
    const particles = Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        angle: (i / 40) * Math.PI * 2,
        delay: Math.random() * 0.8,
        duration: 0.8 + Math.random() * 0.4,
        scale: 0.5 + Math.random() * 1.5,
    }));

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ 
                opacity: 1,
                x: stage === 'door' || stage === 'suck' ? [0, -2, 2, -2, 2, 0] : 0 // Subtle shake
            }}
            exit={{ opacity: 0 }}
            transition={{ 
                x: { duration: 0.2, repeat: stage === 'suck' ? Infinity : 0 }
            }}
            className="fixed inset-0 z-[5000] flex items-center justify-center overflow-hidden bg-black"
        >
            {/* 1. Dramatic Background Zoom/Flare */}
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ 
                    scale: stage === 'zoom' ? 1.2 : 2.5, 
                    opacity: stage === 'complete' ? 0 : 0.4
                }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
                <div 
                    className="w-full h-full"
                    style={{ 
                        background: `radial-gradient(circle at center, ${floorColor} 0%, transparent 60%)`,
                        filter: 'blur(60px)'
                    }}
                />
            </motion.div>

            {/* 2. Traditional Dancheong Doors with Depth */}
            <div className="relative w-full h-full flex items-center justify-center perspective-[2000px]">
                {/* Shockwave Ring (Triggers when doors open) */}
                <AnimatePresence>
                    {(stage === 'door' || stage === 'suck') && (
                        <motion.div
                            initial={{ scale: 0.1, opacity: 0, border: `2px solid ${floorColor}` }}
                            animate={{ scale: 8, opacity: [0, 1, 0] }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="absolute w-64 h-64 rounded-full pointer-events-none"
                        />
                    )}
                </AnimatePresence>

                {/* Left Door */}
                <motion.div
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: (stage === 'door' || stage === 'suck' || stage === 'complete') ? -115 : 0 }}
                    transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1] }}
                    className="absolute right-1/2 w-[50vw] h-full border-r-[2px] border-[#00FFC2]/30 origin-right overflow-hidden shadow-[20px_0_50px_rgba(0,0,0,0.8)] z-20"
                    style={{ 
                        backgroundColor: '#151C1A',
                        backgroundImage: `
                            linear-gradient(90deg, transparent 95%, ${floorColor}22 95%),
                            linear-gradient(0deg, transparent 95%, ${floorColor}22 95%)
                        `,
                        backgroundSize: '40px 40px'
                    }}
                >
                    {/* Dancheong-inspired Pattern */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="w-full h-full" style={{ 
                            backgroundImage: `radial-gradient(circle at 50% 50%, ${floorColor} 1px, transparent 1px)`,
                            backgroundSize: '20px 20px'
                        }} />
                    </div>
                    <div className="absolute inset-16 border-[4px] border-[#00FFC2]/10 flex items-center justify-center">
                        <div className="w-[70%] h-[70%] border-[2px] border-[#00FFC2]/5 flex items-center justify-center relative">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#00FFC2]/20 rotate-45" />
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#00FFC2]/20 rotate-45" />
                        </div>
                    </div>
                </motion.div>

                {/* Right Door */}
                <motion.div
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: (stage === 'door' || stage === 'suck' || stage === 'complete') ? 115 : 0 }}
                    transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1] }}
                    className="absolute left-1/2 w-[50vw] h-full border-l-[2px] border-[#00FFC2]/30 origin-left overflow-hidden shadow-[-20px_0_50px_rgba(0,0,0,0.8)] z-20"
                    style={{ 
                        backgroundColor: '#151C1A',
                        backgroundImage: `
                            linear-gradient(90deg, transparent 95%, ${floorColor}22 95%),
                            linear-gradient(0deg, transparent 95%, ${floorColor}22 95%)
                        `,
                        backgroundSize: '40px 40px'
                    }}
                >
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="w-full h-full" style={{ 
                            backgroundImage: `radial-gradient(circle at 50% 50%, ${floorColor} 1px, transparent 1px)`,
                            backgroundSize: '20px 20px'
                        }} />
                    </div>
                    <div className="absolute inset-16 border-[4px] border-[#00FFC2]/10 flex items-center justify-center">
                        <div className="w-[70%] h-[70%] border-[2px] border-[#00FFC2]/5 flex items-center justify-center relative">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#00FFC2]/20 rotate-45" />
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#00FFC2]/20 rotate-45" />
                        </div>
                    </div>
                </motion.div>

                {/* 3. High-Intensity Vacuum Vortex */}
                <AnimatePresence>
                    {(stage === 'suck' || stage === 'complete') && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                            {/* Central Light core */}
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ 
                                    scale: [0, 5, 4.5], 
                                    opacity: [0, 1, 0.9],
                                    boxShadow: [`0 0 0px ${floorColor}`, `0 0 100px ${floorColor}`, `0 0 60px ${floorColor}`]
                                }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="w-32 h-32 rounded-full"
                                style={{ 
                                    background: `radial-gradient(circle, #fff 0%, ${floorColor} 40%, transparent 75%)`,
                                }}
                            />
                            
                            {/* Particles - Sucking IN */}
                            {particles.map((p) => (
                                <motion.div
                                    key={p.id}
                                    initial={{ 
                                        x: Math.cos(p.angle) * window.innerWidth * 1.2,
                                        y: Math.sin(p.angle) * window.innerHeight * 1.2,
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
                                    className="absolute w-0.5 h-48 rounded-full z-30"
                                    style={{ 
                                        backgroundColor: floorColor,
                                        boxShadow: `0 0 10px ${floorColor}`,
                                        rotate: `${p.angle}rad`,
                                        transformOrigin: '50% 100%'
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </AnimatePresence>

                {/* 4. Dramatic Typography */}
                {stage !== 'suck' && stage !== 'complete' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.7, y: 100 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 2.5, filter: 'blur(30px)', y: -100 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative z-30 flex flex-col items-center justify-center pointer-events-none"
                    >
                        <motion.span 
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-[12rem] md:text-[18rem] font-black font-serif italic leading-none" 
                            style={{ color: floorColor, textShadow: `0 0 60px ${floorColor}88` }}
                        >
                            {floorNumber}
                        </motion.span>
                        <div className="flex flex-col items-center -mt-8">
                            <h2 className="text-4xl md:text-6xl font-black text-white tracking-[0.4em] uppercase mb-4 drop-shadow-2xl">
                                <AutoTranslatedText text={floorTitle} />
                            </h2>
                            <div className="w-48 h-[2px] bg-[#00FFC2] shadow-[0_0_15px_#00FFC2]" />
                        </div>
                    </motion.div>
                )}
            </div>

            {/* 5. Final Portal Entry Flash */}
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
