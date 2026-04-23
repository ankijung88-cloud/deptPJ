import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFloors } from '../context/FloorContext';
import { getLocalizedText } from '../utils/i18nUtils';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { BrandLogo } from '../components/common/BrandLogo';
import { ArrowRight, ChevronRight } from 'lucide-react';

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
            <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-dancheong-mugwort"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-dancheong-ink font-sans selection:bg-dancheong-mugwort/20 selection:text-dancheong-ink overflow-x-hidden">
            {/* Ambient Background Paper Texture Pattern */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.1]">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#171717 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' }} />
            </div>

            <main className="relative z-10 pt-32 pb-40 px-6 lg:px-12 max-w-[1400px] mx-auto">
                <header className="mb-32 text-left relative">
                    {/* Decorative Vertical Line */}
                    <div className="absolute -left-8 top-0 bottom-0 w-[1px] bg-dancheong-ink opacity-30 hidden lg:block" />
                    
                    <div className="flex flex-col gap-2 mb-12">
                        <div className="flex items-center gap-4 opacity-80">
                            <div className="h-[2px] w-12 bg-dancheong-ink" />
                            <span className="text-[10px] font-black tracking-[0.5em] text-dancheong-mugwort uppercase">
                                Spatial Elevation Guide
                            </span>
                        </div>
                        <div className="flex gap-4 items-center pl-14 opacity-40">
                            <span className="text-[8px] font-mono tracking-widest uppercase">DEPART / Archive V3.0</span>
                            <div className="w-1 h-1 rounded-full bg-dancheong-ink/20" />
                            <span className="text-[8px] font-mono tracking-widest uppercase">Traditional Contemporary Harmony</span>
                        </div>
                    </div>

                    <div className="relative inline-block mb-10">
                        <h1 className="text-6xl md:text-[8.5rem] font-serif font-black tracking-tighter leading-[0.8] relative z-10">
                            <motion.span 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="block text-dancheong-ink"
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
                        
                        {/* Decorative Badge */}
                        <div className="absolute -right-20 top-1/2 -translate-y-1/2 rotate-90 origin-center hidden xl:block">
                            <span className="text-[10px] font-mono tracking-[1.5em] text-dancheong-ink/10 uppercase whitespace-nowrap">
                                ELEVATION MAPPING
                            </span>
                        </div>
                    </div>

                    <p className="max-w-2xl text-xl text-dancheong-ink/80 font-light leading-relaxed pl-1 border-l-2 border-dancheong-ink/20 ml-1">
                        <AutoTranslatedText text="Discover the vertical narrative of DEPART. Each floor represents a curated sanctuary where tradition meets contemporary innovation." />
                    </p>
                </header>

                <section className="relative">
                    {/* Vertical Connecting Line */}
                    <div className="absolute left-[60px] top-0 bottom-0 w-[2px] bg-dancheong-ink/10 hidden md:block" />
                    <div className="space-y-4 relative z-10">
                        {sortedFloors.map((floor, index) => {
                            const isActive = hoveredFloor === floor.id;
                            
                            return (
                                <motion.div
                                    key={floor.id}
                                    className="relative flex flex-col md:flex-row items-center md:items-stretch group cursor-pointer"
                                    onMouseEnter={() => setHoveredFloor(floor.id)}
                                    onMouseLeave={() => setHoveredFloor(null)}
                                    onClick={() => navigate(`/floor/${floor.id}`)}
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    {/* Level Indicator */}
                                    <div className="w-24 md:w-[120px] flex-shrink-0 flex items-center justify-center">
                                        <div 
                                            className={`text-4xl md:text-5xl font-serif italic transition-all duration-500 ${isActive ? 'scale-110 opacity-100' : 'opacity-40'}`}
                                            style={{ color: isActive ? floor.color : '#171717' }}
                                        >
                                            {floor.floor}
                                        </div>
                                    </div>

                                    {/* Floor Card */}
                                    <div className="flex-grow w-full md:w-auto">
                                        <div 
                                            className={`p-8 md:p-12 transition-all duration-700 relative overflow-hidden flex flex-col md:flex-row justify-between gap-8 items-center ${isActive ? 'shadow-[0_20px_60px_rgba(23,23,23,0.1)] translate-y-[-8px]' : 'border-transparent'}`}
                                            style={{ 
                                                backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                                                border: isActive ? `2px solid ${floor.color}` : '1px solid transparent'
                                            }}
                                        >
                                            <div className="relative z-10 max-w-xl text-center md:text-left">
                                                <h2 className="text-3xl md:text-5xl font-serif font-black mb-4 tracking-tight group-hover:translate-x-2 transition-transform duration-500">
                                                    <AutoTranslatedText text={getLocalizedText(floor.title, i18n.language)} />
                                                </h2>
                                                
                                                <div className="relative mt-6">
                                                    <AnimatePresence mode="wait">
                                                        {!isActive ? (
                                                            <motion.div
                                                                key="overview"
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                exit={{ opacity: 0 }}
                                                                transition={{ duration: 0.3 }}
                                                                className="flex flex-wrap justify-center md:justify-start gap-3"
                                                            >
                                                                {floor.subitems?.slice(0, 5).map((sub) => (
                                                                    <span key={sub.id} className="text-[10px] tracking-widest font-black uppercase py-2 px-4 border-2 border-[#171717]/40 text-[#171717]/80">
                                                                        <AutoTranslatedText text={getLocalizedText(sub.label, i18n.language)} />
                                                                    </span>
                                                                ))}
                                                                {floor.subitems && floor.subitems.length > 5 && (
                                                                    <span className="text-[10px] tracking-widest font-black uppercase py-2 px-4 opacity-40">
                                                                        + {floor.subitems.length - 5}
                                                                    </span>
                                                                )}
                                                            </motion.div>
                                                        ) : (
                                                            <motion.div
                                                                key="subcategory-dropdown"
                                                                initial={{ opacity: 0, y: -10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -10 }}
                                                                transition={{ duration: 0.3 }}
                                                                className="flex flex-col gap-1 w-full max-w-md border-l-4 border-[#171717]/40 pl-6 py-2"
                                                            >
                                                                <p className="text-[#171717]/90 text-base font-medium leading-relaxed mb-6 hidden md:block italic">
                                                                    <AutoTranslatedText text={getLocalizedText(floor.description, i18n.language)} />
                                                                </p>
                                                                {floor.subitems?.map((sub) => (
                                                                    <motion.button
                                                                        key={sub.id}
                                                                        whileHover={{ x: 10 }}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            navigate(`/category/${sub.id}`);
                                                                        }}
                                                                        className="py-2.5 flex items-center gap-3 group/sub transition-all duration-300 text-left"
                                                                    >
                                                                        <ChevronRight size={14} className="text-[#171717]/40 group-hover/sub:text-[#4F6D5B] transition-colors" />
                                                                        <span className="text-sm font-black tracking-[0.2em] uppercase text-[#171717]/60 group-hover/sub:text-[#171717] truncate">
                                                                            <AutoTranslatedText text={getLocalizedText(sub.label, i18n.language)} />
                                                                        </span>
                                                                    </motion.button>
                                                                ))}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>

                                            <div className="relative z-10 flex flex-col items-center gap-4">
                                                <div 
                                                    className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-700 ${isActive ? 'rotate-[-45deg] shadow-2xl' : ''}`}
                                                    style={{ 
                                                        borderColor: isActive ? floor.color : 'rgba(23,23,23,0.2)',
                                                        backgroundColor: isActive ? `${floor.color}20` : 'transparent'
                                                    }}
                                                >
                                                    <ArrowRight size={24} style={{ color: isActive ? floor.color : 'rgba(23,23,23,0.5)' }} />
                                                </div>
                                                <span 
                                                    className={`text-[10px] tracking-[0.4em] font-black uppercase transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}
                                                    style={{ color: floor.color }}
                                                >
                                                    <AutoTranslatedText text="Explore Floor" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                <footer className="mt-40 pt-16 border-t border-dancheong-ink/10 flex flex-col md:flex-row justify-between items-center gap-12 text-dancheong-ink/30">
                    <div className="flex items-center gap-8">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold tracking-[0.3em] uppercase"><AutoTranslatedText text="System Version" /></span>
                            <span className="text-xs text-dancheong-ink/60"><AutoTranslatedText text="Ivory Minimalist v3.0" /></span>
                        </div>
                        <div className="w-[1px] h-10 bg-dancheong-ink/10" />
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold tracking-[0.3em] uppercase"><AutoTranslatedText text="Archive Status" /></span>
                            <span className="text-xs text-dancheong-ink/60"><AutoTranslatedText text="Active Collection" /></span>
                        </div>
                    </div>
                    
                    <BrandLogo size={60} color="#4F6D5B" className="opacity-40 hover:opacity-100 transition-opacity" />
                    
                    <div className="font-mono text-[10px] tracking-[0.2em] text-right hidden md:block">
                        <p>© 2026 DEPART ARCHIVE</p>
                        <p>SOLID SURFACE INTERFACE</p>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default InspirationPage;
