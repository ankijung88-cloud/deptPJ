import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Archive, Building } from 'lucide-react';
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
            <header className="relative w-full h-[40vh] sm:h-screen flex items-center overflow-hidden mb-8 md:mb-24 pt-22 md:pt-20">
                {/* Background Image Layer */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src={floorData.bgImage || '/placeholder_floor.jpg'} 
                        alt={getLocalizedText(floorData.floor, i18n.language)}
                        className="w-full h-full object-cover transition-transform duration-[3000ms] scale-105"
                    />
                    {/* Sophisticated Glow & Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 via-30% to-white/20 z-[1]" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white z-[1]" />
                    
                    {/* Floating Glow */}
                    <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#FFD1D1]/10 blur-[150px] rounded-full z-[0]" />
                </div>

                <div className="lossless-layout relative z-10 w-full">
                    <div className="max-w-4xl">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-4 text-dancheong-mugwort font-black text-[10px] sm:text-[11px] tracking-[0.6em] uppercase mb-4 md:mb-16"
                        >
                            <div className="w-8 h-[1px] bg-dancheong-mugwort/30" />
                            <span><AutoTranslatedText text="FLOOR ARCHIVE" /></span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            className="text-6xl md:text-[15rem] font-serif font-black italic text-dancheong-ink tracking-tighter leading-[0.75] mb-6 md:mb-20"
                        >
                            <span className="inline-block transition-transform hover:translate-x-4 duration-700">
                                <AutoTranslatedText text={getLocalizedText(floorData.floor, i18n.language)} />
                            </span>
                        </motion.h1>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 1 }}
                            className="relative"
                        >
                            <div className="flex flex-col gap-6 md:gap-10">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-[2px] bg-dancheong-mugwort"></div>
                                    <h2 className="text-2xl md:text-5xl font-serif font-black text-dancheong-ink tracking-tight">
                                        <AutoTranslatedText text={getLocalizedText(floorData.title, i18n.language)} />
                                    </h2>
                                </div>
                                
                                <p className="text-dancheong-ink/60 font-medium text-base md:text-2xl leading-snug max-w-2xl italic">
                                    <AutoTranslatedText text={getLocalizedText(floorData.description, i18n.language)} />
                                </p>
                            </div>
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
                                <div className={`aspect-square heritage-card !rounded-[32px] md:!rounded-[48px] p-4 md:p-8 flex flex-col items-center justify-between relative overflow-hidden border border-dancheong-ink/5 bg-white transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] hover:-translate-y-1 ${selectedSubId === sub.id ? 'ring-2 ring-dancheong-mugwort ring-offset-2' : ''}`}>
                                    {/* Background Floor Identifier - Subtle and centered */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none z-0">
                                        <span className="text-6xl md:text-[12rem] font-serif font-black italic text-dancheong-ink">
                                            {getLocalizedText(floorData.floor, i18n.language)}
                                        </span>
                                    </div>

                                    {/* Top Right Decorative Building Icon */}
                                    <div className="absolute top-3 right-3 md:top-6 md:right-6 opacity-[0.08] pointer-events-none z-10">
                                        <Building className="w-3 h-3 md:w-8 md:h-8 text-dancheong-ink" />
                                    </div>

                                    {/* Category Icon - Top Centered with Blue Circle */}
                                    <div className="relative z-10 mt-2 md:mt-4 flex flex-col items-center">
                                        <div className="relative w-12 h-12 md:w-24 md:h-24 flex items-center justify-center">
                                            {/* Blue Circular Border */}
                                            <div className="absolute inset-0 rounded-full border border-blue-600/40" />
                                            
                                            <img 
                                                src={sub.bgImage || '/placeholder_floor.jpg'} 
                                                alt=""
                                                className="w-3/5 h-3/5 object-contain grayscale-0 relative z-10"
                                            />
                                        </div>
                                    </div>

                                    {/* Main Title - Centered Bold Serif */}
                                    <div className="relative z-10 flex flex-col items-center">
                                         <h3 className="text-xs md:text-3xl font-serif font-black text-dancheong-ink tracking-tight text-center leading-tight">
                                             <AutoTranslatedText text={getLocalizedText(sub.label, i18n.language)} />
                                         </h3>
                                    </div>

                                    {/* Action Link - Bottom Gray Text */}
                                    <div className="relative z-10 flex items-center gap-1 md:gap-2 text-dancheong-ink/40 group-hover/card:text-dancheong-ink transition-colors font-medium text-[8px] md:text-sm">
                                        <AutoTranslatedText text="탐험하세요" />
                                        <ArrowRight size={14} className="opacity-40 group-hover/card:opacity-100 group-hover/card:translate-x-1 transition-all" />
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
                                                                className="text-lg font-serif font-bold text-dancheong-ink group-hover:text-dancheong-mugwort cursor-pointer transition-colors flex items-center gap-3"
                                                            >
                                                                <AutoTranslatedText text={getLocalizedText(item.title, i18n.language)} />
                                                                {item.page_type && item.page_type !== 'standard' && (
                                                                    <span className="px-2 py-0.5 bg-dancheong-ink/5 text-[9px] font-black uppercase tracking-widest rounded-md text-dancheong-ink/40 group-hover:bg-dancheong-mugwort/20 group-hover:text-dancheong-mugwort transition-colors">
                                                                        {item.page_type}
                                                                    </span>
                                                                )}
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
