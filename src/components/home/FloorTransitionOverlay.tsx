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
        // Timeline
        const zoomTimer = setTimeout(() => setStage('door'), 800);
        const doorTimer = setTimeout(() => setStage('suck'), 1800);
        const completeTimer = setTimeout(() => onComplete(), 4000);

        return () => {
            clearTimeout(zoomTimer);
            clearTimeout(doorTimer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[5000] flex items-center justify-center overflow-hidden bg-black"
        >
            {/* Background Zooming Layer */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                    scale: stage === 'zoom' ? 1 : 2.5, 
                    opacity: stage === 'complete' ? 0 : 1 
                }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
                <div 
                    className="w-full h-full opacity-30"
                    style={{ 
                        background: `radial-gradient(circle, ${floorColor}44 0%, transparent 70%)`,
                        filter: stage === 'suck' ? 'blur(40px)' : 'none'
                    }}
                />
            </motion.div>

            {/* Traditional Doors */}
            <div className="relative w-full h-full flex items-center justify-center perspective-[2000px]">
                {/* Left Door */}
                <motion.div
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: (stage === 'door' || stage === 'suck' || stage === 'complete') ? -110 : 0 }}
                    transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                    className="absolute right-1/2 w-[50vw] h-full border-r-[1px] border-white/20 origin-right overflow-hidden shadow-2xl"
                    style={{ 
                        backgroundColor: '#1A2420',
                        backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.02) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.02) 75%, transparent 75%, transparent)',
                        backgroundSize: '40px 40px'
                    }}
                >
                    <div className="absolute inset-10 border-[1px] border-white/10 flex items-center justify-center">
                        <div className="w-[80%] h-[80%] border-[2px] border-white/5 opacity-20" />
                    </div>
                </motion.div>

                {/* Right Door */}
                <motion.div
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: (stage === 'door' || stage === 'suck' || stage === 'complete') ? 110 : 0 }}
                    transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                    className="absolute left-1/2 w-[50vw] h-full border-l-[1px] border-white/20 origin-left overflow-hidden shadow-2xl"
                    style={{ 
                        backgroundColor: '#1A2420',
                        backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.02) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.02) 75%, transparent 75%, transparent)',
                        backgroundSize: '40px 40px'
                    }}
                >
                    <div className="absolute inset-10 border-[1px] border-white/10 flex items-center justify-center">
                        <div className="w-[80%] h-[80%] border-[2px] border-white/5 opacity-20" />
                    </div>
                </motion.div>

                {/* Sucking In Effect (Vacuum Vortex) */}
                <AnimatePresence>
                    {(stage === 'suck' || stage === 'complete') && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 4, opacity: [0, 1, 0.8] }}
                                transition={{ duration: 2, ease: "easeOut" }}
                                className="w-64 h-64 rounded-full"
                                style={{ 
                                    background: `radial-gradient(circle, ${floorColor} 0%, transparent 60%)`,
                                    boxShadow: `0 0 100px ${floorColor}`
                                }}
                            />
                            
                            {[...Array(24)].map((_, i) => {
                                const angle = (i / 24) * Math.PI * 2;
                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ 
                                            x: Math.cos(angle) * window.innerWidth,
                                            y: Math.sin(angle) * window.innerHeight,
                                            scale: 0,
                                            opacity: 0
                                        }}
                                        animate={{ 
                                            x: 0, 
                                            y: 0, 
                                            scale: [0, 1, 0],
                                            opacity: [0, 0.8, 0]
                                        }}
                                        transition={{ 
                                            duration: 1.2, 
                                            delay: Math.random() * 0.5,
                                            repeat: Infinity,
                                            ease: "circIn"
                                        }}
                                        className="absolute w-1 h-32 rounded-full"
                                        style={{ 
                                            backgroundColor: floorColor,
                                            rotate: `${angle}rad`
                                        }}
                                    />
                                );
                            })}
                        </div>
                    )}
                </AnimatePresence>

                {/* Floor Info Fragment */}
                {stage !== 'suck' && stage !== 'complete' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 2, filter: 'blur(20px)' }}
                        className="relative z-10 flex flex-col items-center justify-center pointer-events-none"
                    >
                        <span className="text-9xl font-black font-serif italic mb-4" style={{ color: floorColor, textShadow: `0 0 40px ${floorColor}aa` }}>
                            {floorNumber}F
                        </span>
                        <h2 className="text-4xl font-black text-white tracking-[0.3em] uppercase mb-2">
                            <AutoTranslatedText text={floorTitle} />
                        </h2>
                        <div className="w-24 h-[1px] bg-white/30" />
                    </motion.div>
                )}
            </div>

            {/* Final Flash/Fade */}
            {stage === 'complete' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-white z-[6000]"
                />
            )}
        </motion.div>
    );
};
