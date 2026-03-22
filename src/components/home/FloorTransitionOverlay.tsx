import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AutoTranslatedText } from '../common/AutoTranslatedText';

interface FloorTransitionOverlayProps {
    floorNumber: number;
    floorTitle: string;
    floorColor: string;
    subcategories?: any[];
    onComplete: () => void;
}

// Sub-component to handle individual node perspective projection
const PerspectiveSphere = ({ node, floorColor, stage, getProjection }: any) => {
    // Map time to a 0-1 progress over the transition duration (3.5s for suck stage)
    // The 'suck' stage starts at 2.1s and ends at 5.6s (3.5s duration)
    const [startTime] = useState(Date.now() + 2100); 
    
    // We'll use a local state or transform to drive the projection
    const [projection, setProjection] = useState({ x: 0, y: 0, size: 0, opacity: 0 });

    useEffect(() => {
        if (stage !== 'suck' && stage !== 'complete') return;
        
        let frameId: number;
        const update = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const progress = Math.min(1, Math.max(0, elapsed / 3500));
            
            // Apply ease-out to progress for "arrival" feel
            const easedProgress = 1 - Math.pow(1 - progress, 2);
            
            setProjection(getProjection(node, easedProgress));
            frameId = requestAnimationFrame(update);
        };
        
        update();
        return () => cancelAnimationFrame(frameId);
    }, [stage, node, startTime, getProjection]);

    return (
        <div 
            className="absolute flex flex-col items-center pointer-events-none"
            style={{ 
                left: `calc(50% + ${projection.x}px)`,
                top: `calc(50% + ${projection.y}px)`,
                opacity: projection.opacity,
                transform: 'translate(-50%, -50%)'
            }}
        >
            <div 
                className="relative rounded-full flex items-center justify-center transition-all duration-75"
                style={{ 
                    width: projection.size + 25,
                    height: projection.size + 25,
                    background: `radial-gradient(circle at center, ${floorColor}aa 0%, transparent 75%)`,
                    border: `1px solid ${floorColor}33`,
                    boxShadow: `0 0 ${projection.size / 2}px ${floorColor}44`,
                    transform: `scale(${1 + Math.sin(Date.now() / 1000 + node.id) * 0.05})` // Subtle pulse
                }}
            >
                {/* Dotted Wireframe */}
                <div className="absolute inset-[-10%] opacity-70">
                    <svg viewBox="0 0 100 100" className="w-full h-full scale-[1.1]">
                        <path 
                            d="M50 5 L85 25 L85 75 L50 95 L15 75 L15 25 Z" 
                            fill="none" 
                            stroke={floorColor} 
                            strokeWidth="1.2" 
                            strokeDasharray="1.5 2" 
                        />
                        <path d="M50 5 L50 95" stroke={floorColor} strokeWidth="0.6" strokeDasharray="1 3" opacity="0.6" />
                        <path d="M15 25 L85 25" stroke={floorColor} strokeWidth="0.6" strokeDasharray="1 3" opacity="0.6" />
                        <path d="M15 75 L85 75" stroke={floorColor} strokeWidth="0.6" strokeDasharray="1 3" opacity="0.6" />
                        <path d="M50 5 L15 75" stroke={floorColor} strokeWidth="0.6" strokeDasharray="1 3" opacity="0.6" />
                        <path d="M50 5 L85 75" stroke={floorColor} strokeWidth="0.6" strokeDasharray="1 3" opacity="0.6" />
                    </svg>
                </div>

                {/* Label */}
                <div className="relative z-10 text-center px-4">
                    <span 
                        className="text-white font-[900] tracking-tighter whitespace-nowrap"
                        style={{ 
                            fontSize: `${Math.max(8, projection.size / 3)}px`,
                            textShadow: `0 0 20px ${floorColor}, 0 0 40px black` 
                        }}
                    >
                        <AutoTranslatedText text={node.label} />
                    </span>
                </div>
            </div>
        </div>
    );
};

export const FloorTransitionOverlay: React.FC<FloorTransitionOverlayProps> = ({
    floorNumber,
    floorTitle,
    floorColor,
    subcategories = [],
    onComplete
}) => {
    const [stage, setStage] = useState<'zoom' | 'door' | 'suck' | 'complete'>('zoom');

    useEffect(() => {
        const zoomTimer = setTimeout(() => setStage('door'), 2000); 
        const arrivalTimer = setTimeout(() => setStage('suck'), 2100); 
        const completeTimer = setTimeout(() => {
            setStage('complete');
            setTimeout(() => onComplete(), 350); 
        }, 5600); 

        return () => {
            clearTimeout(zoomTimer);
            clearTimeout(arrivalTimer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    const stars = useMemo(() => Array.from({ length: 800 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 0.5 + Math.random() * 1.5,
    })), []);

    const mappedSpheres = useMemo(() => {
        const positions: any[] = [];
        const radius = 35; 
        const startAngle = -Math.PI * 0.9; 
        const totalAngle = Math.PI * 0.9;  
        
        subcategories.forEach((sub, i) => {
            const angle = startAngle + (totalAngle / (subcategories.length - 1 || 1)) * i;
            const x3d = Math.cos(angle) * (radius + (i % 2 === 0 ? 12 : -8));
            const y3d = (32 + Math.sin(i * 1.5) * 15) - 30; 
            const z3d = (Math.sin(angle) * (radius + (i % 2 === 1 ? 6 : -12)) - 35) - 15; 

            positions.push({
                id: i,
                label: sub.label?.ko || sub.label || '',
                x3d, y3d, z3d,
            });
        });
        return positions;
    }, [subcategories]);

    const getProjection = useMemo(() => (node: any, progress: number) => {
        const cameraZ = 500 * (1 - progress); 
        const distance = Math.max(10, cameraZ - node.z3d + 60); 
        const scaleFactor = 1000 / distance;
        
        return {
            x: node.x3d * scaleFactor,
            y: (node.y3d - 5) * scaleFactor,
            size: 4.5 * scaleFactor * 9,
            opacity: Math.min(1, progress * 4), 
        };
    }, []);

    const studs = Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        x: (i % 3) * 35 + 15,
        y: Math.floor(i / 3) * 20 + 10,
    }));

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ 
                opacity: 1,
                x: stage === 'suck' ? [0, -1, 1, -1, 1, 0] : 0 
            }}
            exit={{ opacity: 0 }}
            transition={{ x: { duration: 0.1, repeat: stage === 'suck' ? Infinity : 0 } }}
            className="fixed inset-0 z-[5000] flex items-center justify-center overflow-hidden bg-black [perspective:1500px]"
        >
            {/* Facade Layer */}
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
                className="absolute inset-0 flex items-center justify-center bg-black"
            >
                <div 
                    className="w-[200vw] h-[200vh] opacity-30"
                    style={{ 
                        backgroundImage: `linear-gradient(to right, ${floorColor}44 2.5px, transparent 2.5px), linear-gradient(to bottom, ${floorColor}44 2.5px, transparent 2.5px)`,
                        backgroundSize: '150px 150px, 150px 150px',
                        transform: 'translateZ(-100px)'
                    }}
                />
            </motion.div>

            {/* 3D Space Arrival */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden">
                <AnimatePresence>
                    {(stage === 'suck' || stage === 'complete') && (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 1 }}
                            transition={{ duration: 1.0 }}
                            className="relative w-full h-full flex items-center justify-center bg-black"
                        >
                            <motion.div 
                                animate={{ opacity: [0.15, 0.3, 0.15], scale: [1, 1.1, 1] }}
                                transition={{ duration: 15, repeat: Infinity }}
                                className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(66,56,202,0.25),transparent_75%)]"
                            />

                            <div className="absolute inset-0">
                                {stars.map(s => (
                                    <div key={s.id} className="absolute bg-white rounded-full opacity-50 shadow-[0_0_6px_#fff]" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }} />
                                ))}
                            </div>

                            <div 
                                className="absolute bottom-[-10%] w-[180vw] h-[100vh] bg-black"
                                style={{ 
                                    backgroundImage: `linear-gradient(to right, #00FFC2 1px, transparent 1px), linear-gradient(to bottom, #00FFC2 1px, transparent 1px)`,
                                    backgroundSize: '80px 80px', transform: 'perspective(1500px) rotateX(78deg)', opacity: 0.45
                                }}
                            />

                            {mappedSpheres.map((s) => (
                                <PerspectiveSphere key={s.id} node={s} floorColor={floorColor} stage={stage} getProjection={getProjection} />
                            ))}

                            <motion.div
                                animate={{ opacity: [0, 0.3, 0] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="absolute w-full h-full bg-[#E91E63] blur-[200px] opacity-10 z-30"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Doors Layer */}
            <div className="relative w-full h-full flex items-center justify-center z-30 pointer-events-none [preserve-3d]">
                <motion.div
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: (stage === 'suck' || stage === 'complete') ? -105 : 0 }}
                    transition={{ duration: 1.8, ease: [0.45, 0.05, 0.55, 0.95] }}
                    className="absolute right-1/2 w-[50.2vw] h-full border-r-[8px] border-[#3F1105] bg-[#7C2D12] overflow-hidden"
                    style={{ transformOrigin: 'left center' }}
                >
                    {studs.map(s => (
                        <div key={s.id} className="absolute w-10 h-10 rounded-full bg-gradient-to-br from-[#FDE68A] via-[#B45309] to-[#451A03] shadow-[4px_4px_10px_rgba(0,0,0,0.5)] border-[1px] border-[#FDE68A]/30" style={{ left: `${s.x}%`, top: `${s.y}%` }} />
                    ))}
                </motion.div>

                <motion.div
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: (stage === 'suck' || stage === 'complete') ? 105 : 0 }}
                    transition={{ duration: 1.8, ease: [0.45, 0.05, 0.55, 0.95] }}
                    className="absolute left-1/2 w-[50.2vw] h-full border-l-[8px] border-[#3F1105] bg-[#7C2D12] overflow-hidden"
                    style={{ transformOrigin: 'right center' }}
                >
                    {studs.map(s => (
                        <div key={s.id} className="absolute w-10 h-10 rounded-full bg-gradient-to-br from-[#FDE68A] via-[#B45309] to-[#451A03] border-[1px] border-[#FDE68A]/30" style={{ left: `${100 - s.x}%`, top: `${s.y}%`, transform: 'translateX(-100%)' }} />
                    ))}
                </motion.div>

                <AnimatePresence>
                    {(stage === 'zoom' || stage === 'door') && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1.2 }}
                            exit={{ opacity: 0, scale: 5, filter: 'blur(60px)', y: -300 }}
                            transition={{ duration: 1.5 }}
                            className="absolute z-40 flex flex-col items-center justify-center p-20 bg-black/40 backdrop-blur-sm rounded-3xl"
                        >
                            <span className="text-[10rem] font-black font-serif italic mb-4" style={{ color: floorColor }}>{floorNumber}F</span>
                            <h2 className="text-4xl font-black text-white tracking-[0.8em] uppercase mb-10"><AutoTranslatedText text={floorTitle} /></h2>
                            <div className="w-80 h-[3px] bg-[#00FFC2] shadow-[0_0_30px_#00FFC2]" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {stage === 'complete' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="absolute inset-0 bg-white z-[6000]" />
            )}
        </motion.div>
    );
};
