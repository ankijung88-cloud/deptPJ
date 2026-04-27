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
                        <h2 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-[7.5rem] font-serif font-black tracking-tighter leading-none text-dancheong-ink flex flex-row items-center justify-center gap-x-2 sm:gap-x-4 lg:gap-x-8 whitespace-nowrap px-4">
                            <motion.span
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            >
                                인클루전
                            </motion.span>
                            <motion.span
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                                className="text-dancheong-mugwort"
                            >
                                아카이브
                            </motion.span>
                        </h2>
                    </div>

                    <p className="max-w-2xl mx-auto text-base md:text-lg text-dancheong-ink/60 font-light leading-relaxed px-4">
                        <AutoTranslatedText text="Discover the vertical narrative of 몽땅쏙. Each floor represents a curated sanctuary where tradition meets contemporary innovation." />
                    </p>
                </header>

                {/* 1 Row 7 Column Grid: Panoramic Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 lg:gap-6 w-full">
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
                                        className={`w-full aspect-square p-4 lg:p-6 rounded-[2rem] lg:rounded-[2.5rem] transition-all duration-500 relative overflow-hidden flex flex-col items-center text-center justify-center ${isActive ? 'shadow-[0_20px_50px_rgba(23,23,23,0.15)] -translate-y-4' : 'shadow-[0_4px_20px_rgba(23,23,23,0.05)]'}`}
                                        style={{
                                            backgroundColor: isActive ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.5)',
                                            border: isActive ? `2px solid ${floor.color}` : '1.5px solid rgba(23,23,23,0.12)'
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
                                            
                                            {/* Middle: Title - Centered in remaining space */}
                                            <div className="flex-grow flex items-center justify-center w-full py-2">
                                                <h3 className={`text-[11px] lg:text-sm font-serif font-black tracking-tight leading-tight transition-all duration-500 max-w-[95%] ${isActive ? 'text-dancheong-ink' : 'text-dancheong-ink/60'}`}>
                                                    <AutoTranslatedText text={getLocalizedText(floor.title, i18n.language)} />
                                                </h3>
                                            </div>

                                            {/* Bottom Navigation - Fixed Position */}
                                            <div
                                                className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full border flex items-center justify-center transition-all duration-500 ${isActive ? 'rotate-[-45deg] shadow-lg' : ''}`}
                                                style={{
                                                    borderColor: isActive ? floor.color : 'rgba(23,23,23,0.1)',
                                                    backgroundColor: isActive ? `${floor.color}10` : 'transparent'
                                                }}
                                            >
                                                <ArrowRight size={isActive ? 14 : 10} className={isActive ? '' : 'text-dancheong-ink/30'} style={{ color: isActive ? floor.color : undefined }} />
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

            </div>
        </section>
    );
};
