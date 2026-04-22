import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFloors } from '../context/FloorContext';
import { getLocalizedText } from '../utils/i18nUtils';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { BrandLogo } from '../components/common/BrandLogo';
import { ArrowRight, Building2 } from 'lucide-react';

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
                <header className="mb-24 text-left">
                    <div className="flex items-center gap-4 mb-6 opacity-60">
                        <Building2 size={20} className="text-[#00FFC2]" />
                        <span className="text-xs font-bold tracking-[0.5em] uppercase"><AutoTranslatedText text="Building Elevation Map" /></span>
                    </div>
                    <h1 className="text-6xl md:text-[8rem] font-serif font-black tracking-tighter leading-[0.8] mb-8">
                        <span className="block"><AutoTranslatedText text="VERTICAL" /></span>
                        <span className="block text-[#00FFC2]" style={{ textShadow: '0 0 30px rgba(0,255,194,0.3)' }}><AutoTranslatedText text="ARCHIVE" /></span>
                    </h1>
                    <p className="max-w-2xl text-xl text-white/40 font-light leading-relaxed">
                        <AutoTranslatedText text="Step into a curated sanctuary where each floor unfolds a unique story of Korean heritage, technology, and lifestyle." />
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
                                                <AnimatePresence>
                                                    {isActive && (
                                                        <motion.p 
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="text-white/50 text-lg font-light leading-relaxed mb-4 hidden md:block"
                                                        >
                                                            <AutoTranslatedText text={getLocalizedText(floor.description, i18n.language)} />
                                                        </motion.p>
                                                    )}
                                                </AnimatePresence>
                                                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                                                    {floor.subitems?.slice(0, 3).map((sub) => (
                                                        <span key={sub.id} className="text-[10px] tracking-[0.2em] font-bold uppercase py-1 px-2 border border-white/10 opacity-40 group-hover:opacity-80 group-hover:border-white/30 transition-all">
                                                            <AutoTranslatedText text={getLocalizedText(sub.label, i18n.language)} />
                                                        </span>
                                                    ))}
                                                    {floor.subitems && floor.subitems.length > 3 && (
                                                        <span className="text-[10px] tracking-[0.2em] font-bold uppercase py-1 px-2 opacity-20">
                                                            + {floor.subitems.length - 3} More
                                                        </span>
                                                    )}
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
                        <p>© 2026 DEPT ARCHIVE</p>
                        <p>PREMIUM GRID INTERFACE V2.0</p>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default InspirationPage;
