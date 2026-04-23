import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
            <div className="min-h-screen bg-[#05070D] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#00FFC2]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#05070D] text-white font-sans selection:bg-[#00FFC2]/30 overflow-x-hidden">
            {/* Ambient Background Grid */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>

            <main className="relative z-10 pt-32 pb-40 px-6 lg:px-12 max-w-[1400px] mx-auto">
                <header className="mb-32 text-left relative">
                    {/* Decorative Vertical Line */}
                    <div className="absolute -left-8 top-0 bottom-0 w-[1px] bg-gradient-to-b from-[#00FFC2] to-transparent opacity-20 hidden lg:block" />
                    
                    <div className="flex flex-col gap-2 mb-12">
                        <div className="flex items-center gap-4 opacity-80">
                            <div className="w-10 h-[1px] bg-[#00FFC2] shadow-[0_0_8px_rgba(0,255,194,0.5)]" />
                            <span className="text-[10px] font-black tracking-[0.5em] text-[#00FFC2] uppercase">
                                Spatial Elevation System
                            </span>
                        </div>
                        <div className="flex gap-4 items-center pl-14 opacity-20">
                            <span className="text-[8px] font-mono tracking-widest uppercase">DEPART / Archive V2.0</span>
                            <div className="w-1 h-1 rounded-full bg-white/40" />
                            <span className="text-[8px] font-mono tracking-widest uppercase">Coordinates: 37.5665° N, 126.9780° E</span>
                        </div>
                    </div>

                    <div className="relative inline-block mb-10">
                        <h1 className="text-7xl md:text-[10rem] font-serif font-black tracking-tighter leading-[0.8] relative z-10">
                            <motion.span 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="block text-white"
                            >
                                VERTICAL
                            </motion.span>
                            <motion.span 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                                className="block text-[#00FFC2]"
                                style={{ textShadow: '0 0 60px rgba(0,255,194,0.3)' }}
                            >
                                ARCHIVE
                            </motion.span>
                        </h1>
                        
                        {/* Decorative Badge */}
                        <div className="absolute -right-20 top-1/2 -translate-y-1/2 rotate-90 origin-center hidden xl:block">
                            <span className="text-[10px] font-mono tracking-[1.5em] text-white/10 uppercase whitespace-nowrap">
                                ELEVATION MAPPING
                            </span>
                        </div>
                    </div>

                    <p className="max-w-2xl text-xl text-white/40 font-light leading-relaxed pl-1 border-l-2 border-white/5 ml-1">
                        <AutoTranslatedText text="Discover the vertical narrative of DEPART. Each floor represents a curated sanctuary where tradition meets contemporary innovation." />
                    </p>
                </header>

                <section className="relative">
                    {/* Vertical Connecting Line */}
                    <div className="absolute left-1/2 md:left-[120px] top-0 bottom-0 w-[1px] bg-white/5 z-0" />

                    <div className="space-y-12 relative z-10">
                        {sortedFloors.map((floor, index) => {
                            const isActive = hoveredFloor === floor.id;
                            
                            return (
                                <motion.div
                                    key={floor.id}
                                    className="relative flex flex-col md:flex-row items-center md:items-stretch gap-8 group cursor-pointer"
                                    onMouseEnter={() => setHoveredFloor(floor.id)}
                                    onMouseLeave={() => setHoveredFloor(null)}
                                    onClick={() => navigate(`/floor/${floor.id}`)}
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    {/* Level Indicator */}
                                    <div className="w-24 md:w-[120px] flex-shrink-0 flex items-center justify-center">
                                        <div 
                                            className={`text-4xl md:text-5xl font-serif italic transition-all duration-500 ${isActive ? 'scale-110' : 'opacity-30'}`}
                                            style={{ color: isActive ? floor.color : 'white' }}
                                        >
                                            {floor.floor}
                                        </div>
                                    </div>

                                    {/* Floor Card */}
                                    <div className="flex-grow w-full md:w-auto">
                                        <div 
                                            className={`p-8 md:p-12 bg-[#0A0C14] border transition-all duration-700 relative overflow-hidden flex flex-col md:flex-row justify-between gap-8 items-center ${isActive ? 'border-white/20' : 'border-white/5'}`}
                                            style={{ 
                                                backgroundColor: '#0A0C14',
                                                borderColor: isActive ? `${floor.color}44` : 'rgba(255,255,255,0.05)'
                                            }}
                                        >
                                            {/* Accent Illumination on Hover */}
                                            {isActive && (
                                                <div 
                                                    className="absolute inset-0 pointer-events-none opacity-5 transition-opacity duration-700"
                                                    style={{ background: `linear-gradient(90deg, ${floor.color} 0%, transparent 100%)` }}
                                                />
                                            )}

                                            <div className="relative z-10 max-w-xl text-center md:text-left">
                                                <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4 tracking-tight group-hover:translate-x-2 transition-transform duration-500">
                                                    <AutoTranslatedText text={getLocalizedText(floor.title, i18n.language)} />
                                                </h2>
                                                <div className="relative min-h-[140px] mt-6">
                                                    <AnimatePresence mode="wait">
                                                        {!isActive ? (
                                                            <motion.div
                                                                key="overview"
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -10 }}
                                                                transition={{ duration: 0.4 }}
                                                                className="space-y-6"
                                                            >
                                                                <p className="text-white/30 text-base font-light leading-relaxed hidden md:block max-w-lg">
                                                                    <AutoTranslatedText text={getLocalizedText(floor.description, i18n.language)} />
                                                                </p>
                                                                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                                                    {floor.subitems?.slice(0, 4).map((sub) => (
                                                                        <span key={sub.id} className="text-[9px] tracking-[0.2em] font-bold uppercase py-1.5 px-3 border border-white/5 bg-white/5 opacity-30">
                                                                            <AutoTranslatedText text={getLocalizedText(sub.label, i18n.language)} />
                                                                        </span>
                                                                    ))}
                                                                    {floor.subitems && floor.subitems.length > 4 && (
                                                                        <span className="text-[9px] tracking-[0.2em] font-bold uppercase py-1.5 px-3 opacity-10">
                                                                            + {floor.subitems.length - 4}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        ) : (
                                                            <motion.div
                                                                key="subcategory-grid"
                                                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                exit={{ opacity: 0, y: -10, scale: 1.02 }}
                                                                transition={{ duration: 0.3, ease: "easeOut" }}
                                                                className="grid grid-cols-2 lg:grid-cols-3 gap-2 w-full"
                                                            >
                                                                {floor.subitems?.map((sub) => (
                                                                    <motion.button
                                                                        key={sub.id}
                                                                        whileHover={{ 
                                                                            backgroundColor: `${floor.color}15`,
                                                                            borderColor: `${floor.color}66`,
                                                                            x: 4
                                                                        }}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            navigate(`/category/${sub.id}`);
                                                                        }}
                                                                        className="p-4 bg-[#0F121A] border border-white/10 text-left flex items-center justify-between group/sub transition-all duration-300"
                                                                    >
                                                                        <span className="text-[10px] font-bold tracking-widest uppercase text-white/40 group-hover/sub:text-white truncate">
                                                                            <AutoTranslatedText text={getLocalizedText(sub.label, i18n.language)} />
                                                                        </span>
                                                                        <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover/sub:opacity-100 group-hover/sub:translate-x-0 transition-all duration-300" style={{ color: floor.color }} />
                                                                    </motion.button>
                                                                ))}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>

                                            <div className="relative z-10 flex flex-col items-center gap-4">
                                                <div 
                                                    className={`w-16 h-16 rounded-full border flex items-center justify-center transition-all duration-700 ${isActive ? 'rotate-[-45deg]' : ''}`}
                                                    style={{ 
                                                        borderColor: isActive ? floor.color : 'rgba(255,255,255,0.1)',
                                                        backgroundColor: isActive ? `${floor.color}11` : 'transparent'
                                                    }}
                                                >
                                                    <ArrowRight size={24} style={{ color: isActive ? floor.color : 'rgba(255,255,255,0.4)' }} />
                                                </div>
                                                <span 
                                                    className={`text-[10px] tracking-[0.3em] font-black uppercase transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}
                                                    style={{ color: floor.color }}
                                                >
                                                    <AutoTranslatedText text="Enter Floor" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                <footer className="mt-32 pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-12 text-white/20">
                    <div className="flex items-center gap-8">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold tracking-[0.3em] uppercase"><AutoTranslatedText text="Project Status" /></span>
                            <span className="text-xs text-white/40"><AutoTranslatedText text="Building Operational" /></span>
                        </div>
                        <div className="w-[1px] h-10 bg-white/5" />
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold tracking-[0.3em] uppercase"><AutoTranslatedText text="Data Archive" /></span>
                            <span className="text-xs text-white/40"><AutoTranslatedText text="2D Optimized" /></span>
                        </div>
                    </div>
                    
                    <BrandLogo size={60} color="#00FFC2" className="opacity-20 hover:opacity-100 transition-opacity" />
                    
                    <div className="font-mono text-[10px] tracking-[0.2em] text-right hidden md:block">
                        <p>© 2026 DEPART ARCHIVE</p>
                        <p>PREMIUM GRID INTERFACE V2.0</p>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default InspirationPage;
