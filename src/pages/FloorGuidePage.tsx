import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Building, Archive, Search } from 'lucide-react';
import { useFloors } from '../context/FloorContext';
import { useEditorial } from '../hooks/useEditorial';
import { getLocalizedText } from '../utils/i18nUtils';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { FloorGuideModal } from '../components/common/FloorGuideModal';

const VisitorCounter: React.FC = () => {
    const [count, setCount] = useState(Math.floor(Math.random() * 15) + 8);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setCount(prev => {
                const change = Math.random() > 0.5 ? 1 : -1;
                const newCount = prev + change;
                return newCount < 5 ? 5 : newCount > 30 ? 30 : newCount;
            });
        }, 5000 + Math.random() * 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 py-4 px-6 bg-white/30 backdrop-blur-md rounded-2xl border border-dancheong-ink/5 mb-12 w-fit"
        >
            <div className="relative flex items-center justify-center">
                <span className="absolute inline-flex h-2 w-2 rounded-full bg-red-500 opacity-75 animate-ping"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold tracking-tight">
                <span className="text-dancheong-ink/40 uppercase tracking-[0.1em]">Live Presence</span>
                <span className="w-[1px] h-3 bg-dancheong-ink/10 mx-1"></span>
                <span className="text-dancheong-ink">
                    <AutoTranslatedText text="Currently" />
                    <span className="mx-1.5 text-dancheong-mugwort font-black">{count}</span>
                    <AutoTranslatedText text="visitors exploring this floor" />
                </span>
            </div>
        </motion.div>
    );
};

const FloorGuidePage: React.FC = () => {
    const { floorId } = useParams<{ floorId: string }>();
    const { floors, loading } = useFloors();
    const { items: liveProducts } = useEditorial(floorId);
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const floorData = floors.find(f => f.id === floorId);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [floorId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-dancheong-ivory flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-dancheong-mugwort"></div>
            </div>
        );
    }

    if (!floorData) {
        return (
            <div className="min-h-screen bg-dancheong-ivory flex items-center justify-center flex-col gap-8">
                <div className="w-20 h-20 bg-dancheong-ink/10 rounded-full flex items-center justify-center">
                    <Archive size={32} className="text-dancheong-ink/20" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-dancheong-ink"><AutoTranslatedText text="Floor not found" /></h2>
                <button onClick={() => navigate('/floor-guide')} className="px-8 py-3 bg-dancheong-ink text-white rounded-full text-xs font-black uppercase tracking-widest">
                    <AutoTranslatedText text="Back to Directory" />
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dancheong-ivory text-dancheong-ink pb-20 pt-32">
            <div className="lossless-layout">
                <header>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-12 pb-24">
                        {/* Text Content - Now everything on the left */}
                        <div className="max-w-2xl">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-3 text-dancheong-mugwort font-black text-[11px] tracking-[0.5em] uppercase mb-6"
                            >
                                <Archive size={14} />
                                <span>FLOOR DIRECTORY</span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-6xl md:text-9xl font-serif font-black text-dancheong-ink tracking-tighter leading-[0.85] mb-10"
                            >
                                <AutoTranslatedText text={getLocalizedText(floorData.floor, i18n.language)} />
                            </motion.h1>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="md:text-left"
                            >
                                <p className="text-dancheong-ink/80 font-light italic text-xl leading-relaxed mb-12">
                                    <AutoTranslatedText text={getLocalizedText(floorData.description, i18n.language)} />
                                </p>

                                {/* Search / Minimap Button */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsModalOpen(true)}
                                    className="inline-flex items-center gap-3 px-8 py-4 bg-dancheong-ink text-white rounded-full transition-all duration-300 shadow-xl shadow-dancheong-ink/10 group"
                                >
                                    <div className="p-2 bg-white/10 rounded-full group-hover:bg-dancheong-mugwort transition-colors">
                                        <Search size={16} strokeWidth={3} />
                                    </div>
                                    <span className="font-black text-[11px] uppercase tracking-[0.3em] pr-2">
                                        <AutoTranslatedText text="Floor Search Map" />
                                    </span>
                                </motion.button>
                            </motion.div>
                        </div>

                        {/* Right Side Image Box */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, x: 50 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="relative flex-grow max-w-2xl h-[400px] md:h-[500px]"
                        >
                            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-[40px] border border-dancheong-ink/5 p-4 shadow-2xl shadow-dancheong-ink/10">
                                <div className="w-full h-full rounded-[30px] overflow-hidden relative group">
                                    <img 
                                        src={floorData.bgImage || '/placeholder_floor.jpg'} 
                                        alt={getLocalizedText(floorData.floor, i18n.language)}
                                        className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                                    />
                                    {/* Glass Overlay with Floor Title */}
                                    <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">CURRENT VIEW</p>
                                        <h4 className="text-xl font-serif font-bold text-white">
                                            <AutoTranslatedText text={getLocalizedText(floorData.title, i18n.language)} />
                                        </h4>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Decorative Elements */}
                            <div className="absolute -top-4 -right-4 w-24 h-24 border-t-2 border-r-2 border-dancheong-mugwort/30 rounded-tr-3xl" />
                            <div className="absolute -bottom-4 -left-4 w-24 h-24 border-b-2 border-l-2 border-dancheong-ink/10 rounded-bl-3xl" />
                        </motion.div>
                    </div>
                </header>

                {/* Visitor Counter Section */}
                <VisitorCounter />

                {/* Zones Grid - Compact 6-Column Layout */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 mb-32">
                    {(floorData.subitems || []).map((sub: any, idx: number) => (
                        <motion.div
                            key={sub.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05, duration: 0.5 }}
                            onClick={() => navigate(`/category/${sub.id}`)}
                            className="group/card cursor-pointer"
                        >
                            <div className="aspect-square heritage-card rounded-[24px] md:rounded-[32px] p-6 md:p-8 flex flex-col justify-end relative overflow-hidden border-dancheong-ink/10 bg-white/40 backdrop-blur-md transition-all duration-500 hover:shadow-[0_20px_40px_rgba(23,23,23,0.1)] hover:-translate-y-2">
                                {/* Background Image */}
                                <div className="absolute inset-0 z-0">
                                    <img 
                                        src={sub.bgImage || '/placeholder_floor.jpg'} 
                                        alt={getLocalizedText(sub.label, i18n.language)}
                                        className="w-full h-full object-cover grayscale opacity-20 group-hover/card:grayscale-0 group-hover/card:opacity-100 group-hover/card:scale-110 transition-all duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent opacity-80 group-hover/card:from-dancheong-ink/90 group-hover/card:to-dancheong-ink/40 group-hover/card:opacity-100 transition-all duration-500" />
                                </div>

                                {/* Content Overlay */}
                                <div className="relative z-10">
                                    <div className="text-[8px] font-black uppercase tracking-[0.3em] text-dancheong-mugwort mb-2 group-hover/card:text-white/50 transition-colors">
                                        SEC {idx + 1}
                                    </div>
                                    <h3 className="text-sm md:text-lg font-serif font-black text-dancheong-ink group-hover/card:text-white transition-colors duration-300 leading-tight tracking-tight">
                                        <AutoTranslatedText text={getLocalizedText(sub.label, i18n.language)} />
                                    </h3>
                                    
                                    <div className="mt-3 flex items-center gap-2 text-dancheong-ink/40 group-hover/card:text-white/60 transition-colors duration-300 font-black text-[8px] uppercase tracking-[0.2em]">
                                        <AutoTranslatedText text="Explore" />
                                        <ArrowRight size={10} className="group-hover/card:translate-x-1 transition-transform" />
                                    </div>
                                </div>

                                {/* Decorative Icon - Smaller for 6-col */}
                                <div className="absolute top-6 right-6 opacity-[0.03] group-hover/card:opacity-10 transition-opacity duration-500 pointer-events-none">
                                    <Building size={40} className="text-dancheong-ink group-hover/card:text-white" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Live Products Section - 4 Column Grid */}
                {liveProducts.length > 0 && (
                    <div className="mb-32">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="flex items-center justify-between mb-12"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-[1px] bg-dancheong-mugwort opacity-30"></div>
                                <h2 className="text-3xl font-serif font-black text-dancheong-ink tracking-tight uppercase">
                                    <AutoTranslatedText text="Live Now" />
                                </h2>
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-dancheong-ink/40">
                                <AutoTranslatedText text="Explore Current Exhibits" />
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {liveProducts.map((product, idx) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    onClick={() => navigate(`/product/${product.id}`)}
                                    className="group cursor-pointer"
                                >
                                    <div className="relative aspect-[4/5] rounded-[32px] overflow-hidden shadow-xl shadow-dancheong-ink/5 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-dancheong-ink/10 group-hover:-translate-y-2">
                                        {/* Image */}
                                        <img 
                                            src={product.imageUrl || '/placeholder_product.jpg'} 
                                            alt={getLocalizedText(product.title, i18n.language)}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        
                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-dancheong-ink via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                                        
                                        {/* Content */}
                                        <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/70">Live Archive</span>
                                            </div>
                                            <h4 className="text-xl font-serif font-bold text-white leading-tight mb-2">
                                                <AutoTranslatedText text={getLocalizedText(product.title, i18n.language)} />
                                            </h4>
                                            <div className="h-[1px] w-0 group-hover:w-full bg-white/30 transition-all duration-500 mb-4"></div>
                                            <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                                                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/60">View Details</span>
                                                <ArrowRight size={14} className="text-white/60" />
                                            </div>
                                        </div>

                                        {/* Corner Accents */}
                                        <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-white/20 rounded-tl-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer Return */}
                <div className="text-center pt-20">
                    <button 
                        onClick={() => navigate('/floor-guide')}
                        className="group px-16 py-6 bg-dancheong-ink text-white rounded-full text-xs font-black uppercase tracking-[0.4em] hover:bg-dancheong-mugwort transition-all duration-500 shadow-2xl shadow-dancheong-ink/20 active:scale-95 flex items-center gap-4 mx-auto"
                    >
                        <AutoTranslatedText text="Back to Directory" />
                        <ArrowRight size={16} className="opacity-40 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Minimap Modal */}
            <FloorGuideModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </div>
    );
};

export default FloorGuidePage;
