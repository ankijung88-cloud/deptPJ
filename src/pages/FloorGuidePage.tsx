import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ChevronLeft, LayoutGrid, Info } from 'lucide-react';
import { useFloors } from '../context/FloorContext';
import { getLocalizedText } from '../utils/i18nUtils';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { getJoseonThemeById } from '../utils/themeUtils';
import { BrandLogo } from '../components/common/BrandLogo';

const FloorGuidePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { floors, loading } = useFloors();
    const { i18n } = useTranslation();
    
    const floorData = floors.find(f => f.id === id);
    const theme = getJoseonThemeById(id || 'default');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" style={{ borderColor: theme.accentColor }}></div>
            </div>
        );
    }

    if (!floorData) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
                <h1 className="text-4xl font-serif mb-4">Floor Not Found</h1>
                <Link to="/inspiration" className="text-primary hover:underline" style={{ color: theme.accentColor }}>Return to Building Map</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-24" style={{ backgroundColor: theme.bgColor }}>
            {/* Header Section */}
            <header className="relative pt-32 pb-16 px-6 lg:px-12 border-b border-white/5 overflow-hidden">
                {/* Background Video/Overlay */}
                {floorData.videoUrl && (
                    <div className="absolute inset-0 z-0 opacity-20 pointer-events-none grayscale">
                        <video 
                            src={floorData.videoUrl} 
                            autoPlay 
                            loop 
                            muted 
                            playsInline 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60" />
                    </div>
                )}

                <div className="max-w-[1800px] mx-auto relative z-10">
                    <button 
                        onClick={() => navigate('/inspiration')}
                        className="flex items-center gap-2 mb-8 text-white/50 hover:text-white transition-colors group"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-bold tracking-widest uppercase"><AutoTranslatedText text="Back to Building" /></span>
                    </button>

                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-2xl md:text-3xl font-serif italic" style={{ color: theme.accentColor }}>{floorData.floor}</span>
                                <div className="h-0.5 w-12" style={{ backgroundColor: theme.accentColor }} />
                            </div>
                            <h1 className="text-5xl md:text-8xl font-serif font-black tracking-tighter mb-6">
                                <AutoTranslatedText text={getLocalizedText(floorData.title, i18n.language)} />
                            </h1>
                            <p className="max-w-2xl text-lg md:text-xl text-white/60 leading-relaxed font-light">
                                <AutoTranslatedText text={getLocalizedText(floorData.description, i18n.language)} />
                            </p>
                        </div>
                        
                        <div className="flex flex-col items-end gap-4 opacity-40 hidden lg:flex">
                            <BrandLogo size={120} color={theme.accentColor} />
                            <div className="text-right font-mono text-[10px] tracking-[0.3em] uppercase">
                                <p>Elevation Sector {floorData.floor}</p>
                                <p>System Operational // 2D Mapping</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Grid List Section */}
            <main className="max-w-[1800px] mx-auto px-6 lg:px-12 py-16">
                <div className="flex items-center gap-3 mb-10 opacity-70">
                    <LayoutGrid size={20} style={{ color: theme.accentColor }} />
                    <h2 className="text-xs font-bold tracking-[0.4em] uppercase text-white/80">
                        <AutoTranslatedText text="Service Zones & Departments" />
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {floorData.subitems?.map((zone, idx) => (
                        <motion.div
                            key={zone.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Link 
                                to={`/category/${zone.id}`}
                                className="group block relative h-full bg-[#1A1A1A] border border-white/10 overflow-hidden transition-all duration-500 hover:border-white/30"
                                style={{ backgroundColor: '#1A1A1A' }}
                            >
                                {/* Active Accent Line */}
                                <div className="absolute top-0 left-0 w-0 h-1 transition-all duration-700 group-hover:w-full" style={{ backgroundColor: theme.accentColor }} />
                                
                                <div className="p-8 md:p-10 flex flex-col h-full justify-between gap-12">
                                    <div className="flex justify-between items-start">
                                        <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-white/10">
                                            <span className="text-white/30 font-mono text-xs">{(idx + 1).toString().padStart(2, '0')}</span>
                                        </div>
                                        <ArrowRight className="text-white/20 group-hover:text-white transition-all duration-500 translate-x-[-10px] opacity-0 group-hover:translate-x-0 group-hover:opacity-100" style={{ color: theme.accentColor }} />
                                    </div>

                                    <div>
                                        <h3 className="text-2xl md:text-3xl font-serif font-bold mb-4 tracking-tight group-hover:translate-x-2 transition-transform duration-500">
                                            <AutoTranslatedText text={getLocalizedText(zone.label, i18n.language)} />
                                        </h3>
                                        {zone.description && (
                                            <p className="text-white/40 text-sm leading-relaxed mb-6 group-hover:text-white/60 transition-colors">
                                                <AutoTranslatedText text={getLocalizedText(zone.description, i18n.language)} />
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: theme.accentColor }}>
                                            <Info size={14} />
                                            <AutoTranslatedText text="Explore Zone" />
                                        </div>
                                    </div>
                                </div>

                                {/* Architectural Corner Details */}
                                <div className="absolute bottom-0 right-0 w-8 h-8 opacity-10">
                                    <div className="absolute bottom-0 right-0 w-full h-[1px] bg-white" />
                                    <div className="absolute bottom-0 right-0 h-full w-[1px] bg-white" />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </main>

            {/* Bottom Navigation */}
            <footer className="max-w-[1800px] mx-auto px-6 lg:px-12 mt-12 border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-8 opacity-60">
                 <p className="text-xs tracking-[0.2em] font-light text-white/40 italic">
                    <AutoTranslatedText text="All departments are subject to digital transformation. Design standards refined for clarity." />
                 </p>
                 <Link to="/inspiration" className="flex items-center gap-4 group" style={{ color: theme.accentColor }}>
                    <span className="text-sm font-bold tracking-widest uppercase"><AutoTranslatedText text="Elevator Map" /></span>
                    <div className="w-10 h-[1px] bg-white/20 group-hover:w-16 transition-all duration-500" style={{ backgroundColor: theme.accentColor }} />
                 </Link>
            </footer>
        </div>
    );
};

export default FloorGuidePage;
