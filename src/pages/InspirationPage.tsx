import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFloors } from '../context/FloorContext';
import { getLocalizedText } from '../utils/i18nUtils';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { BrandLogo } from '../components/common/BrandLogo';
import { ArrowRight } from 'lucide-react';

const InspirationPage: React.FC = () => {
    const { floors, loading } = useFloors();
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const [hoveredFloor, setHoveredFloor] = useState<string | null>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Sort floors from 7F down to 1F for the elevation view
    const sortedFloors = [...floors].sort((a, b) => {
        const levelA = parseInt(a.floor) || 0;
        const levelB = parseInt(b.floor) || 0;
        return levelB - levelA;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-dancheong-ivory flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-dancheong-mugwort"></div>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] lg:h-screen w-full bg-dancheong-ivory text-dancheong-ink font-sans overflow-x-hidden lg:overflow-hidden flex flex-col lg:flex-row">
            
            {/* Left Side: Title & Info */}
            <aside className="lg:w-1/2 w-full lg:h-full h-auto flex flex-col px-8 py-20 lg:p-24 relative border-b lg:border-b-0 lg:border-r border-dancheong-ink/5 lg:overflow-y-auto no-scrollbar">
                {/* Decorative Vertical Line */}
                <div className="absolute left-8 lg:left-24 top-0 bottom-0 w-[1px] bg-dancheong-ink opacity-10 hidden lg:block" />
                
                <header className="relative z-10 lg:mt-auto">
                    <div className="flex flex-col gap-2 mb-10">
                        <div className="flex items-center gap-4 opacity-80">
                            <div className="h-[2px] w-12 bg-dancheong-ink" />
                            <span className="text-[10px] font-black tracking-[0.5em] text-dancheong-mugwort uppercase">
                                Spatial Elevation Guide
                            </span>
                        </div>
                        <div className="flex gap-4 items-center pl-14 opacity-40">
                            <span className="text-[8px] font-mono tracking-widest uppercase">몽땅쏙 / Archive V3.0</span>
                            <div className="w-1 h-1 rounded-full bg-dancheong-ink/20" />
                            <span className="text-[8px] font-mono tracking-widest uppercase">Traditional Contemporary Harmony</span>
                        </div>
                    </div>

                    <div className="relative inline-block mb-8">
                        <h1 className="text-5xl md:text-[6.5rem] xl:text-[8rem] font-serif font-black tracking-tighter leading-[0.85] relative z-10">
                            <motion.span 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="block text-dancheong-ink mb-2"
                            >
                                VERTICAL
                            </motion.span>
                            <motion.span 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                                className="block text-dancheong-mugwort"
                            >
                                ARCHIVE
                            </motion.span>
                        </h1>
                    </div>

                    <p className="max-w-md text-base md:text-lg text-dancheong-ink/60 font-light leading-relaxed pl-1 border-l-2 border-dancheong-ink/10 ml-1 mb-16">
                        <AutoTranslatedText text="Discover the vertical narrative of 몽땅쏙. Each floor represents a curated sanctuary where tradition meets contemporary innovation." />
                    </p>

                    {/* Floor Descriptions List */}
                    <div className="space-y-8 pl-1 ml-1 mb-16">
                        {sortedFloors.map((floor, index) => (
                            <motion.div 
                                key={`desc-${floor.id}`} 
                                className="relative pl-6 border-l border-dancheong-ink/10"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                            >
                                <div 
                                    className="absolute -left-[3.5px] top-2 w-1.5 h-1.5 rounded-full"
                                    style={{ backgroundColor: floor.color }}
                                />
                                <h3 className="text-sm font-black tracking-[0.1em] mb-2 uppercase flex items-center gap-3">
                                    <span style={{ color: floor.color }} className="font-serif italic text-base">{floor.floor}</span>
                                    <span className="text-dancheong-ink/30 text-[10px]">|</span>
                                    <span className="text-dancheong-ink/80"><AutoTranslatedText text={getLocalizedText(floor.title, i18n.language)} /></span>
                                </h3>
                                <p className="text-sm text-dancheong-ink/50 font-light leading-relaxed whitespace-pre-wrap">
                                    <AutoTranslatedText text={getLocalizedText(floor.description, i18n.language)} />
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </header>

                <div className="relative flex items-center gap-6 opacity-30 mt-auto pt-8">
                    <BrandLogo size={40} />
                    <div className="font-mono text-[9px] tracking-[0.2em] leading-tight">
                        <p>© 2026 몽땅쏙 ARCHIVE</p>
                        <p>SOLID SURFACE INTERFACE</p>
                    </div>
                </div>
            </aside>

            {/* Right Side: Floors */}
            <main className="lg:w-1/2 w-full lg:h-full h-auto px-6 py-20 lg:p-16 lg:overflow-y-auto no-scrollbar relative flex flex-col justify-center bg-white/30 backdrop-blur-sm">
                <div className="w-full max-w-xl mx-auto space-y-3">
                    {sortedFloors.map((floor, index) => {
                        const isActive = hoveredFloor === floor.id;
                        
                        return (
                            <motion.div
                                key={floor.id}
                                className="relative flex flex-row items-stretch group cursor-pointer"
                                onMouseEnter={() => setHoveredFloor(floor.id)}
                                onMouseLeave={() => setHoveredFloor(null)}
                                onClick={() => navigate(`/floor/${floor.id}`)}
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                {/* Floor Card */}
                                <div 
                                    className={`w-full p-4 lg:p-5 rounded-2xl lg:rounded-3xl transition-all duration-500 relative overflow-hidden flex flex-row justify-between items-center ${isActive ? 'shadow-[0_10px_30px_rgba(23,23,23,0.08)] translate-y-[-2px]' : 'border-transparent'}`}
                                    style={{ 
                                        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.4)',
                                        border: isActive ? `1px solid ${floor.color}` : '1px solid rgba(23,23,23,0.04)',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                >
                                    <div className="flex items-center gap-4 lg:gap-6 w-full">
                                        {/* Level Indicator */}
                                        <div className="w-12 lg:w-16 flex-shrink-0 flex items-center justify-center border-r border-dancheong-ink/10 pr-4 lg:pr-6">
                                            <div 
                                                className={`text-2xl lg:text-3xl font-serif italic transition-all duration-500 ${isActive ? 'scale-110 opacity-100 font-black' : 'opacity-40 text-dancheong-ink'}`}
                                                style={{ color: isActive ? floor.color : undefined }}
                                            >
                                                {floor.floor}
                                            </div>
                                        </div>
                                        
                                        <div className="flex-grow min-w-0">
                                            <h2 className="text-lg lg:text-xl font-serif font-black tracking-tight group-hover:translate-x-1 transition-transform duration-300 truncate">
                                                <AutoTranslatedText text={getLocalizedText(floor.title, i18n.language)} />
                                            </h2>
                                            
                                            <div className="mt-1 lg:mt-2 text-[10px] lg:text-xs opacity-50 font-medium truncate">
                                                <AutoTranslatedText text={floor.subitems?.map(s => getLocalizedText(s.label, i18n.language)).join(' • ') || ''} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative z-10 flex flex-col items-center pl-2 lg:pl-4 flex-shrink-0">
                                        <div 
                                            className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full border flex items-center justify-center transition-all duration-500 ${isActive ? 'rotate-[-45deg] shadow-lg' : ''}`}
                                            style={{ 
                                                borderColor: isActive ? floor.color : 'rgba(23,23,23,0.1)',
                                                backgroundColor: isActive ? `${floor.color}10` : 'transparent'
                                            }}
                                        >
                                            <ArrowRight size={14} className={isActive ? '' : 'text-dancheong-ink/30 lg:w-[16px] lg:h-[16px] w-[14px] h-[14px]'} style={{ color: isActive ? floor.color : undefined }} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
};

export default InspirationPage;
