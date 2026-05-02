import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Building, Archive } from 'lucide-react';
import { useFloors } from '../context/FloorContext';
import { useEditorial } from '../hooks/useEditorial';
import { getLocalizedText } from '../utils/i18nUtils';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';

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
            className="flex items-center gap-3 md:gap-4 py-2 md:py-4 px-4 md:px-6 bg-white shadow-lg rounded-xl md:rounded-2xl border border-dancheong-ink/10 mb-8 md:mb-12 w-full md:w-fit"
        >
            <div className="relative flex items-center justify-center flex-shrink-0">
                <span className="absolute inline-flex h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-red-500 opacity-75 animate-ping"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-red-500"></span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs font-bold tracking-tight overflow-hidden">
                <span className="text-dancheong-ink/60 uppercase tracking-[0.1em] whitespace-nowrap"><AutoTranslatedText text="Live Presence" /></span>
                <span className="w-[1px] h-3 bg-dancheong-ink/20 mx-0.5 md:mx-1"></span>
                <span className="text-dancheong-ink whitespace-nowrap truncate">
                    <AutoTranslatedText text="Currently" />
                    <span className="mx-1 text-dancheong-mugwort font-black text-xs md:text-sm">{count}</span>
                    <AutoTranslatedText text="visitors exploring" />
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
    const [selectedSubId, setSelectedSubId] = useState<string | null>(null);

    const floorData = floors.find(f => f.id === floorId);

    // Filter products for the selected subcategory


    useEffect(() => {
        window.scrollTo(0, 0);
    }, [floorId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-dancheong-mugwort"></div>
            </div>
        );
    }

    if (!floorData) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center flex-col gap-8">
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
        <div className="min-h-screen bg-transparent text-dancheong-ink pb-20">
            {/* Hero Section with Background Image */}
            <header className="relative w-full h-[25vh] md:h-[70vh] min-h-[220px] md:min-h-[500px] flex items-center overflow-hidden mb-8 md:mb-24 pt-22 md:pt-20">
                {/* Background Image Layer */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src={floorData.bgImage || '/placeholder_floor.jpg'} 
                        alt={getLocalizedText(floorData.floor, i18n.language)}
                        className="w-full h-full object-cover transition-transform duration-[2000ms] scale-105"
                    />
                    {/* Sophisticated Gradient Overlay for Text Legibility */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#F2E7D5] via-[#F2E7D5]/95 via-40% to-transparent" />
                </div>

                <div className="lossless-layout relative z-10 w-full">
                    <div className="max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-3 text-dancheong-mugwort font-black text-[10px] tracking-[0.5em] uppercase mb-1 md:mb-8"
                        >
                            <Archive size={14} />
                            <span><AutoTranslatedText text="FLOOR DIRECTORY" /></span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-3xl md:text-[10rem] font-serif font-black text-dancheong-ink tracking-tighter leading-[0.8] mb-2 md:mb-12"
                        >
                            <AutoTranslatedText text={getLocalizedText(floorData.floor, i18n.language)} />
                        </motion.h1>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="md:text-left"
                        >
                            <div className="flex items-center gap-4 mb-1 md:mb-8">
                                <div className="w-12 h-[2px] bg-dancheong-mugwort"></div>
                                <h2 className="text-xl font-serif font-bold text-dancheong-ink/90">
                                    <AutoTranslatedText text={getLocalizedText(floorData.title, i18n.language)} />
                                </h2>
                            </div>
                            
                             <p className="text-dancheong-ink/80 font-bold text-sm md:text-2xl leading-tight max-w-2xl whitespace-pre-wrap">
                                <AutoTranslatedText text={getLocalizedText(floorData.description, i18n.language)} />
                            </p>
                        </motion.div>
                    </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute bottom-0 right-0 p-12 z-20 hidden md:block">
                     <div className="flex items-center gap-4">
                        <div className="w-24 h-[1px] bg-dancheong-ink/20"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-dancheong-ink/40">EST. 2024</span>
                     </div>
                </div>
            </header>

            <div className="lossless-layout">

                {/* Visitor Counter Section */}
                <VisitorCounter />

                {/* Zones Grid - Compact 6-Column Layout */}
                <div className="grid grid-cols-5 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-6 mb-12 md:mb-32">
                    {(floorData.subitems || []).map((sub: any, idx: number) => (
                        <React.Fragment key={sub.id}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.05, duration: 0.5 }}
                                onClick={() => setSelectedSubId(selectedSubId === sub.id ? null : sub.id)}
                                className="group/card cursor-pointer w-full"
                            >
                                <div className={`aspect-square heritage-card !rounded-lg md:!rounded-[32px] p-1.5 md:p-8 flex flex-col justify-end relative overflow-hidden border-dancheong-ink/10 bg-white transition-all duration-500 hover:shadow-[0_20px_40px_rgba(23,23,23,0.1)] hover:-translate-y-2 ${selectedSubId === sub.id ? 'ring-2 ring-dancheong-mugwort ring-offset-4' : ''}`}>
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
                                        <div className="hidden md:block text-[10px] font-light italic text-dancheong-ink/20 mb-1 group-hover/card:text-white transition-colors">
                                             {idx + 1}F
                                         </div>
                                         <h3 className="text-[9px] leading-tight md:text-lg font-serif font-black text-dancheong-ink group-hover/card:text-white transition-colors duration-300 tracking-tighter text-center">
                                             <AutoTranslatedText text={getLocalizedText(sub.label, i18n.language)} />
                                         </h3>
                                        
                                         <div className="hidden md:flex mt-4 items-center gap-2 text-dancheong-ink/60 group-hover/card:text-white transition-colors duration-300 font-black text-[9px] uppercase tracking-[0.2em]">
                                            <AutoTranslatedText text="Explore" />
                                            <ArrowRight size={12} className="group-hover/card:translate-x-1 transition-transform" />
                                        </div>
                                    </div>

                                    {/* Decorative Icon - Smaller for 6-col */}
                                    <div className="absolute top-2 right-2 md:top-6 md:right-6 opacity-[0.03] group-hover/card:opacity-10 transition-opacity duration-500 pointer-events-none">
                                        <Building className="w-4 h-4 md:w-10 md:h-10 text-dancheong-ink group-hover/card:text-white" />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Inline Collection List for Mobile/Desktop Push Layout */}
                            {selectedSubId === sub.id && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="col-span-full mb-12 overflow-hidden"
                                >
                                    <div className="mt-8 p-8 md:p-12 bg-dancheong-ink/[0.02] rounded-[40px] border border-dancheong-ink/5">
                                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-dancheong-ink/10">
                                            <div className="flex items-center gap-4">
                                                <Archive size={20} className="text-dancheong-mugwort" />
                                                <h2 className="text-2xl font-serif font-black text-dancheong-ink">
                                                    <AutoTranslatedText text={getLocalizedText(sub.label, i18n.language)} />
                                                </h2>
                                            </div>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedSubId(null);
                                                }}
                                                className="text-[10px] font-black uppercase tracking-[0.2em] text-dancheong-ink/30 hover:text-dancheong-ink transition-colors"
                                            >
                                                <AutoTranslatedText text="Close List" />
                                            </button>
                                        </div>

                                        {liveProducts.filter(p => p.subcategory === sub.id).length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {liveProducts.filter(p => p.subcategory === sub.id).map((item, idx) => (
                                                    <motion.div
                                                        key={item.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        className="group p-6 bg-white rounded-2xl border border-dancheong-ink/5 hover:border-dancheong-mugwort/30 hover:bg-white transition-all flex items-center justify-between shadow-sm"
                                                    >
                                                        <div className="flex-1">
                                                            <h3 
                                                                onClick={() => navigate(`/detail/${item.id}`)}
                                                                className="text-lg font-serif font-bold text-dancheong-ink group-hover:text-dancheong-mugwort cursor-pointer transition-colors"
                                                            >
                                                                <AutoTranslatedText text={getLocalizedText(item.title, i18n.language)} />
                                                            </h3>
                                                            <p className="text-sm text-dancheong-ink/60 font-medium mt-1 line-clamp-1 leading-tight">
                                                                <AutoTranslatedText text={getLocalizedText(item.description, i18n.language) || 'Explore the curated narrative.'} />
                                                            </p>
                                                        </div>
                                                        <button 
                                                            onClick={() => navigate(`/detail/${item.id}`)}
                                                            className="p-3 bg-dancheong-ink/5 text-dancheong-ink rounded-full group-hover:bg-dancheong-ink group-hover:text-white transition-all"
                                                        >
                                                            <ArrowRight size={16} />
                                                        </button>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-12 text-center bg-dancheong-ink/5 rounded-2xl border border-dashed border-dancheong-ink/10">
                                                <p className="text-dancheong-ink/80 font-serif font-black italic text-lg">
                                                    <AutoTranslatedText text="No items currently in this archive section." />
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </React.Fragment>
                    ))}
                </div>



                {/* Live Products Section - 4 Column Grid */}
                {liveProducts.length > 0 && (
                    <div className="mb-32">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="flex items-center justify-between mb-6 md:mb-12"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-[1px] bg-dancheong-mugwort opacity-30"></div>
                                <h2 className="text-xl md:text-3xl font-serif font-black text-dancheong-ink tracking-tight uppercase">
                                    <AutoTranslatedText text="NOW ON" />
                                </h2>
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-dancheong-ink/70 bg-dancheong-ink/5 px-3 py-1 rounded-full">
                                <AutoTranslatedText text="현재 진행중" />
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                            {liveProducts.map((product, idx) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    onClick={() => navigate(`/detail/${product.id}`)}
                                    className="group cursor-pointer"
                                >
                                    <div className="relative aspect-square rounded-2xl md:rounded-[32px] overflow-hidden shadow-xl shadow-dancheong-ink/5 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-dancheong-ink/10 group-hover:-translate-y-2">
                                        {/* Image */}
                                        <img 
                                            src={product.imageUrl || '/placeholder_product.jpg'} 
                                            alt={getLocalizedText(product.title, i18n.language)}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        
                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-dancheong-ink via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                                        
                                        {/* Content */}
                                        <div className="absolute inset-0 p-4 md:p-8 flex flex-col justify-end">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/70"><AutoTranslatedText text="Live Archive" /></span>
                                            </div>
                                            <h4 className="text-sm md:text-xl font-serif font-bold text-white leading-tight mb-2">
                                                <AutoTranslatedText text={getLocalizedText(product.title, i18n.language)} />
                                            </h4>
                                            <div className="h-[1px] w-0 group-hover:w-full bg-white/30 transition-all duration-500 mb-4"></div>
                                            <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                                                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/60"><AutoTranslatedText text="View Details" /></span>
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
        </div>
    );
};

export default FloorGuidePage;
