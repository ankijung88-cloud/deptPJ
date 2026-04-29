import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFloors } from '../../context/FloorContext';
import { getLocalizedText } from '../../utils/i18nUtils';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { ArrowRight } from 'lucide-react';

export const LandingFloorSection: React.FC = () => {
    const { floors, loading } = useFloors();
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const [hoveredFloor, setHoveredFloor] = useState<string | null>(null);

    // Sort floors from 7F down to 1F for the elevation view
    const sortedFloors = [...floors].sort((a, b) => {
        const levelA = parseInt(a.floor) || 0;
        const levelB = parseInt(b.floor) || 0;
        return levelB - levelA;
    });

    if (loading) return null;

    return (
        <section id="floors" className="relative w-full min-h-screen bg-transparent border-t border-dancheong-ink/5 overflow-hidden flex flex-col justify-center py-20">
            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] bg-dancheong-mugwort/5 blur-[150px] rounded-full opacity-30" />
                <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-dancheong-navy/5 blur-[150px] rounded-full opacity-20" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                {/* Header: Title & Info - Now Centered */}
                <header className="max-w-4xl mx-auto text-center mb-16 lg:mb-24">
                    <div className="flex flex-col items-center gap-2 mb-8">
                        <div className="flex items-center gap-4 opacity-80">
                            <div className="h-[2px] w-8 lg:w-12 bg-dancheong-ink" />
                            <span className="text-[9px] lg:text-[10px] font-black tracking-[0.5em] text-dancheong-mugwort uppercase">
                                Spatial Elevation Guide
                            </span>
                            <div className="h-[2px] w-8 lg:w-12 bg-dancheong-ink" />
                        </div>
                    </div>

                    <div className="w-full mb-10">
                        <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold tracking-tighter leading-[1.2] text-dancheong-ink flex flex-col items-center justify-center px-4">
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            >
                                당신의 Needs를 위한
                            </motion.span>
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                                className="text-dancheong-mugwort"
                            >
                                선택적 솔루션
                            </motion.span>
                        </h2>
                    </div>

                </header>

                {/* 1 Row 6 Column Grid: Panoramic Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 lg:gap-6 w-full">
                    {sortedFloors.reverse().map((floor, index) => {
                        const isActive = hoveredFloor === floor.id;

                        return (
                            <motion.div
                                key={floor.id}
                                className="relative flex flex-col group cursor-pointer h-full"
                                onMouseEnter={() => setHoveredFloor(floor.id)}
                                onMouseLeave={() => setHoveredFloor(null)}
                                onClick={() => navigate(`/floor/${floor.id}`)}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                            >
                                    {/* Square Floor Card */}
                                    <div
                                        className={`w-full aspect-square p-4 lg:p-6 rounded-[2rem] lg:rounded-[2.5rem] transition-all duration-500 relative overflow-hidden flex flex-col items-center text-center justify-center ${isActive ? 'shadow-[0_20px_50px_rgba(26,26,26,0.1)] -translate-y-4' : 'shadow-[0_4px_20px_rgba(26,26,26,0.03)]'}`}
                                        style={{
                                            backgroundColor: isActive ? '#FFFFFF' : '#F9F6F1',
                                            border: isActive ? `2px solid ${floor.color}` : '1.5px solid #E5E1DA'
                                        }}
                                    >
                                        {/* Content Wrapper: Standardized Alignment */}
                                        <div className="relative z-10 flex flex-col items-center justify-between h-full w-full py-1 lg:py-2">
                                            {/* Top: Floor Number - Fixed Position */}
                                            <div className="flex flex-col items-center gap-0.5 lg:gap-1">
                                                <div
                                                    className={`text-2xl lg:text-4xl font-serif italic transition-all duration-500 ${isActive ? 'scale-110 opacity-100 font-black' : 'opacity-40 text-dancheong-ink'}`}
                                                    style={{ color: isActive ? floor.color : undefined }}
                                                >
                                                    {floor.floor}
                                                </div>
                                                <div
                                                    className="w-4 h-[1.5px] transition-all duration-500"
                                                    style={{ backgroundColor: isActive ? floor.color : 'rgba(23,23,23,0.1)' }}
                                                />
                                            </div>
                                            
                                            {/* Middle: Title */}
                                            <div className="flex-grow flex items-center justify-center w-full py-2">
                                                <h3 className={`text-[11px] lg:text-sm font-serif font-black tracking-tight leading-tight transition-all duration-500 max-w-[95%] ${isActive ? 'text-dancheong-ink' : 'text-dancheong-ink/60'}`}>
                                                    <AutoTranslatedText text={getLocalizedText(floor.title, i18n.language)} />
                                                </h3>
                                            </div>

                                            {/* Compact Detailed Wax Seal Button */}
                                            <div
                                                className={`w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center transition-all duration-700 relative ${isActive ? 'scale-110' : ''}`}
                                                style={{
                                                    filter: "url(#compact-seal-filter)",
                                                    WebkitFilter: "url(#compact-seal-filter)",
                                                }}
                                            >
                                                {/* Wax Body */}
                                                <div 
                                                    className="absolute inset-0 rounded-full overflow-hidden"
                                                    style={{
                                                        background: isActive 
                                                            ? 'radial-gradient(circle at 35% 35%, #ff5252 0%, #b71c1c 50%, #7f0000 100%)' 
                                                            : 'radial-gradient(circle at 35% 35%, #d32f2f 0%, #8b0000 60%, #4a0000 100%)',
                                                        boxShadow: `
                                                            0 2px 4px rgba(0,0,0,0.4),
                                                            inset 1.5px 1.5px 3px rgba(255,255,255,0.4),
                                                            inset -2px -2px 5px rgba(0,0,0,0.6)
                                                        `
                                                    }}
                                                >
                                                    {/* Glossy Shine */}
                                                    <div className="absolute top-[10%] left-[15%] w-[40%] h-[25%] bg-gradient-to-br from-white/30 to-transparent rounded-full blur-[1px]" />
                                                </div>

                                                {/* Inner Stamped Ring */}
                                                <div className="absolute inset-[4px] lg:inset-[5px] rounded-full border border-black/10 shadow-inner" />

                                                {/* Icon: Recessed Stamp Effect */}
                                                <div className="relative z-10 flex items-center justify-center">
                                                    <ArrowRight 
                                                        size={isActive ? 14 : 12} 
                                                        className="text-white/90" 
                                                        style={{
                                                            filter: 'drop-shadow(0 -1px 0.5px rgba(0,0,0,0.7))'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Background Accent */}
                                        {isActive && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="absolute -bottom-10 -right-10 w-24 h-24 rounded-full blur-2xl"
                                                style={{ backgroundColor: `${floor.color}20` }}
                                            />
                                        )}
                                    </div>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="mt-16 lg:mt-24 text-center">
                    <p className="max-w-2xl mx-auto text-base md:text-lg text-dancheong-ink/60 font-bold leading-tight px-4 whitespace-pre-line">
                        <AutoTranslatedText text={"몽땅쏙의 각 층은 당신의 영감과 비즈니스를 위한 최적의 목적지로 설계되었습니다.\n위의 층별 카드를 클릭하여 지금 바로 가상 공간으로의 몰입형 탐험을 시작해 보세요."} />
                    </p>
                </div>
            </div>

            {/* Compact SVG Filter for Wax Seal */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <filter id="compact-seal-filter">
                    <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="3" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
                </filter>
            </svg>
        </section>
    );
};
