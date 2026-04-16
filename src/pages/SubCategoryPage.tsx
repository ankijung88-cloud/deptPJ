import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../utils/i18nUtils';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { FeaturedItem } from '../types';
import { BookOpen, X } from 'lucide-react';
import { JOSEON_THEMES } from '../utils/themeUtils';
import VirtualGallery from '../components/gallery/VirtualGallery';
import { useFloors } from '../context/FloorContext';
import { useImmersiveMode } from '../context/NavigationActionContext';
import { getFeaturedProducts } from '../api/products';
import { FALLBACK_PRODUCTS } from '../data/fallbackData';

interface StoryCard {
    id: string;
    subcategory: string;
    title: string;
    content: string;
    image_url: string;
    created_at: string;
}

const PointingFinger = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <path 
            d="M9.5 13.5V6.5C9.5 5.39543 10.3954 4.5 11.5 4.5V4.5C12.6046 4.5 13.5 5.39543 13.5 6.5V12.5" 
            stroke="currentColor" 
            strokeWidth="1.2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
        />
        <path 
            d="M13.5 8.5C13.5 7.39543 14.3954 6.5 15.5 6.5V6.5C16.6046 6.5 17.5 7.39543 17.5 8.5V12.5C17.5 15.8137 14.8137 18.5 11.5 18.5C8.18629 18.5 5.5 15.8137 5.5 12.5V11.5C5.5 10.3954 6.39543 9.5 7.5 9.5V9.5C8.60457 9.5 9.5 10.3954 9.5 11.5" 
            stroke="currentColor" 
            strokeWidth="1.2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
        />
        <path 
            d="M11.5 14.5V11.5" 
            stroke="currentColor" 
            strokeWidth="1.2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            opacity="0.5"
        />
    </svg>
);

const SubCategoryPage: React.FC = () => {
    const { subId } = useParams<{ subId: string }>();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { floors } = useFloors();
    const [items, setItems] = useState<FeaturedItem[]>([]);
    const [stories, setStories] = useState<StoryCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [isExplorationMode, setIsExplorationMode] = useState(false);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    // Toggle immersive mode when in exploration mode
    useImmersiveMode(isExplorationMode);

    const targetSubId = subId || '';

    // Legacy ID mapping
    const getLegacyId = (id: string) => {
        if (id === 'car-care') return 'global';
        if (id === 'b2b-mall') return 'talk';
        return null;
    };

    const legacySubId = getLegacyId(targetSubId);
    
    let parentFloor = floors.find(f => f.subitems?.some(s => s.id === targetSubId)) || null;
    if (!parentFloor && legacySubId) {
        parentFloor = floors.find(f => f.subitems?.some(s => s.id === legacySubId)) || null;
    }

    const subcategoryData = parentFloor?.subitems?.find(s => 
        s.id === targetSubId || (legacySubId && s.id === legacySubId)
    ) || null;


    useEffect(() => {
        let mounted = true;
        const fetchData = async () => {
            if (!parentFloor) { setLoading(false); return; }
            setLoading(true);
            try {
                const [itemsData] = await Promise.all([
                    getFeaturedProducts(),
                ]);

                if (mounted) {
                    let finalItems: FeaturedItem[] = [];
                    // Fallback to empty stories for now as nav fetch was redundant for metadata
                    let finalStories: StoryCard[] = [];

                    if (itemsData) {
                        const sourceItems = (itemsData && itemsData.length > 0) ? itemsData : (FALLBACK_PRODUCTS as any[]);
                        const seen = new Set<string>();
                        finalItems = sourceItems
                            .filter((item: any) => { 
                                if (seen.has(item.id)) return false; 
                                seen.add(item.id); 
                                return true; 
                            })
                            .filter((item: any) => {
                                if (targetSubId) {
                                    const exactMatch = item.subcategory === targetSubId || (legacySubId && item.subcategory === legacySubId);
                                    const labelMatch = subcategoryData && subcategoryData.label && (
                                        (typeof subcategoryData.label === 'string' && subcategoryData.label.toLowerCase() === (item.subcategory || '').toLowerCase()) ||
                                        (typeof subcategoryData.label === 'object' && subcategoryData.label !== null && (
                                            (subcategoryData.label as any).ko === item.subcategory ||
                                            (subcategoryData.label as any).en === item.subcategory
                                        )) ||
                                        t(`subcategory.${targetSubId}`, '').toLowerCase() === (item.subcategory || '').toLowerCase()
                                    );
                                    return exactMatch || !!labelMatch;
                                }
                                return true;
                            });
                    }

                    setItems(finalItems);
                    setStories(finalStories);
                }
            } catch (err: any) {
                console.error('Failed to fetch subcategory items:', err.message || err);
                if (mounted) {
                    setItems([]);
                    setStories([]);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        window.scrollTo(0, 0);
        fetchData();
        return () => { mounted = false; };
    }, [targetSubId, parentFloor]);

    const theme = React.useMemo(() => JOSEON_THEMES[Math.floor(Math.random() * JOSEON_THEMES.length)], []);;


    // While loading, show spinner (don't flash not-found)

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-white" style={theme.bgStyle}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 rounded-full border-2 border-white/10 mb-6"
                    style={{ borderTopColor: theme.accentColor }}
                />
                <p className="opacity-40 text-sm font-mono tracking-widest uppercase" style={theme.accentStyle}><AutoTranslatedText text="Loading" /></p>
            </div>
        );
    }




    if (!parentFloor || !subcategoryData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-white p-6" style={theme.bgStyle}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full text-center space-y-6"
                >
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto" style={{ border: `1px solid ${theme.accentColor}44` }}>
                        <BookOpen size={32} style={{ color: theme.accentColor, opacity: 0.4 }} />
                    </div>
                    <h2 className="text-2xl font-serif font-bold tracking-tight"><AutoTranslatedText text={t('common.not_found') as string} /></h2>
                    <p className="text-white/50 font-light"><AutoTranslatedText text={t('common.not_found_desc') as string} /></p>
                    <Link
                        to="/inspiration"
                        className="inline-flex items-center gap-2 px-8 py-3 text-white rounded-full font-medium hover:opacity-90 transition-all active:scale-95"
                        style={theme.bgHighlightStyle}
                    >
                        <AutoTranslatedText text={t('common.go_inspiration') as string} />
                    </Link>
                </motion.div>
            </div>
        );

    }

    // items[0] is used for content logic if needed elsewhere

    return (
        <div className="min-h-screen font-sans" style={theme.bgStyle}>

            {/* Back Navigation Bar */}

            {/* Editorial Header */}
            <header className="relative w-full min-h-[45vh] flex items-center pt-24 pb-10 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    {(subcategoryData?.bgImage || parentFloor?.bgImage) && (
                        <img
                            src={subcategoryData?.bgImage || parentFloor?.bgImage || ''}
                            alt=""
                            className="w-full h-full object-cover opacity-50 scale-110 transition-opacity duration-700"
                        />
                    )}
                    <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 20%, ${theme.bgColor}aa 70%, ${theme.bgColor})` }} />
                </div>

                <div className="container mx-auto px-6 md:px-12 relative z-10">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 lg:gap-20">
                        {/* Title & Narrative Section */}
                        <div className="flex-1 max-w-4xl">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="px-4 py-1.5 rounded-full border text-[10px] font-black tracking-[0.3em] uppercase backdrop-blur-md" 
                                         style={{ 
                                             backgroundColor: `${theme.color2}44`, 
                                             borderColor: `${theme.color3}66`, 
                                             color: theme.highlightColor 
                                          }}>
                                        <AutoTranslatedText text={`Archive ${parentFloor.floor}`} />
                                    </div>
                                    <div className="h-[1px] w-12 bg-white/20" />
                                    <span className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-40 text-white">
                                        <AutoTranslatedText text="Temporal Curation" />
                                    </span>
                                </div>

                                <h1 className="text-5xl md:text-8xl font-black tracking-[-0.02em] uppercase mb-8 leading-[0.9]" 
                                    style={{ 
                                        color: theme.highlightColor, 
                                        textShadow: `0 0 40px ${theme.glowColor}44` 
                                    }}>
                                    <AutoTranslatedText text={(getLocalizedText(subcategoryData?.label, i18n.language) || t(`subcategory.${targetSubId}`, t('common.no_info'))) as string} />
                                </h1>

                                <p className="text-lg md:text-2xl font-serif italic leading-relaxed opacity-80 max-w-2xl border-l-2 pl-8" 
                                   style={{ borderColor: `${theme.color3}44`, color: theme.color4 }}>
                                    <AutoTranslatedText text={t(`subcategory_msg.${targetSubId}`) !== `subcategory_msg.${targetSubId}` ? t(`subcategory_msg.${targetSubId}`) : t('subcategory_desc')} />
                                </p>

                                <p className="mt-4 text-sm md:text-base font-bold tracking-widest opacity-60 flex items-center gap-3 px-8 py-3 bg-white/5 rounded-full w-fit border border-white/5" style={{ color: theme.accentColor }}>
                                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: theme.accentColor }} />
                                    <AutoTranslatedText text={t('subcategory_guide')} />
                                </p>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="lg:w-[380px] shrink-0"
                        >
                            <div className="rounded-[2rem] p-1 backdrop-blur-3xl border shadow-2xl overflow-hidden group"
                                 style={{ 
                                     backgroundColor: `${theme.color1}44`, 
                                     borderColor: `${theme.color3}33`,
                                     boxShadow: `0 20px 40px -10px ${theme.bgColor}cc`
                                 }}>
                                
                                <div className="p-6 md:p-7 space-y-4">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                            <div className="text-[10px] md:text-[12px] font-black tracking-[0.4em] text-white/60 uppercase w-fit">
                                                <AutoTranslatedText text="Collection Data" />
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-xl font-serif font-black" style={{ color: theme.highlightColor }}>
                                                    {items.length + stories.length}
                                                </span>
                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 text-white"><AutoTranslatedText text="RECORDS" /></span>
                                            </div>
                                        </div>
                                        
                                        <div className="relative">
                                            {/* List of Titles - Pure Scrollable Container */}
                                            <div 
                                                ref={scrollContainerRef}
                                                className="flex-grow space-y-2 max-h-[160px] overflow-y-auto pr-4 scroll-smooth custom-scrollbar"
                                            >
                                                <style>{`
                                                    .custom-scrollbar::-webkit-scrollbar {
                                                        width: 4px;
                                                    }
                                                    .custom-scrollbar::-webkit-scrollbar-track {
                                                        background: rgba(255, 255, 255, 0.05);
                                                        border-radius: 10px;
                                                    }
                                                    .custom-scrollbar::-webkit-scrollbar-thumb {
                                                        background: rgba(255, 255, 255, 0.2);
                                                        border-radius: 10px;
                                                        transition: background 0.3s;
                                                    }
                                                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                                                        background: rgba(255, 255, 255, 0.4);
                                                    }
                                                `}</style>
                                                {([...items, ...stories]).map((item, idx) => (
                                                    <motion.div 
                                                        key={item.id} 
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        className="flex items-start gap-4 group/item cursor-pointer mb-2"
                                                        onClick={() => {
                                                            setSelectedItemId(item.id);
                                                            setIsExplorationMode(true);
                                                        }}
                                                    >
                                                        <span className="text-[10px] font-serif italic opacity-30 mt-1">{String(idx + 1).padStart(2, '0')}</span>
                                                        <span className="text-sm md:text-base font-medium text-white/80 group-hover/item:text-white transition-colors line-clamp-1">
                                                            <AutoTranslatedText text={getLocalizedText(item.title, i18n.language)} />
                                                        </span>
                                                    </motion.div>
                                                ))}
                                                {([...items, ...stories].length === 0) && (
                                                    <div className="text-sm text-white/20 italic">
                                                        <AutoTranslatedText text="No items found." />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 md:px-12 pb-32">
                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col justify-center items-center py-48 space-y-6">
                        <div className="flex flex-col items-center gap-6 py-20">
                            <div className="w-16 h-16 border-2 border-white/10 rounded-full animate-spin" style={{ borderTopColor: theme.accentColor }} />
                            <p className="opacity-60 font-medium tracking-[0.2em] animate-pulse" style={theme.accentStyle}>
                                <AutoTranslatedText text={t('common.loading_content') as string} />
                            </p>
                        </div>
                    </div>
                )}

                {/* Content Section - 3D Virtual Gallery Preview */}
                {!loading && (
                    <>
                        {/* Animated Pointer - Centered between text and gallery */}
                        <div className="flex justify-center -mt-12 -mb-6 relative z-10 pointer-events-none">
                            <motion.div
                                animate={{ 
                                    y: [0, 20, 0],
                                    opacity: [0.4, 0.8, 0.4]
                                }}
                                transition={{ 
                                    duration: 2, 
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                style={{ color: theme.accentColor }}
                                className="flex flex-col items-center"
                            >
                                <PointingFinger size={80} className="rotate-180 drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]" />
                            </motion.div>
                        </div>

                        <div className="mt-16 border-t-2 border-b-2 overflow-hidden rounded-3xl h-[60vh] md:h-[80vh]" style={{ borderColor: `${theme.color3}44` }}>
                        <div className="relative group cursor-pointer w-full h-full">
                            <VirtualGallery 
                                items={items} 
                                stories={stories} 
                                theme={theme} 
                                lang={i18n.language} 
                                onClick={() => {
                                    setSelectedItemId(null);
                                    setIsExplorationMode(true);
                                }}
                                onItemClick={(item) => navigate(`/detail/${item.id}`)}
                            />
                        </div>
                    </div>
                </>
            )}
            </main>

            {/* Immersive Exploration Mode - Fullscreen Overlay */}
            {isExplorationMode && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="fixed inset-0 z-[2000] bg-black"
                >
                    <div className="absolute top-8 left-10 z-[2010] flex items-center gap-6">
                         <h1 
                            className="text-4xl md:text-7xl font-serif font-black mb-8 leading-[1.1] tracking-tight text-white"
                        >
                            {subcategoryData ? getLocalizedText(subcategoryData.label, i18n.language) : ''}
                        </h1>
                        <h2 className="text-xl md:text-2xl font-serif italic text-white/30 hidden md:block">
                            <AutoTranslatedText text="Immersive Gallery" />
                        </h2>
                    </div>

                    <button
                        onClick={() => setIsExplorationMode(false)}
                        className="absolute top-8 right-10 z-[2010] p-3 md:p-4 bg-white/5 hover:bg-white/20 rounded-full text-white backdrop-blur-xl border border-white/10 transition-all active:scale-95 group"
                    >
                        <X size={24} className="group-hover:rotate-90 transition-transform duration-500" />
                    </button>

                    <div className="w-full h-full">
                        <VirtualGallery 
                            items={items} 
                            stories={stories} 
                            theme={theme} 
                            showUI={false} 
                            lang={i18n.language} 
                            defaultActivated={true}
                            initialItemId={selectedItemId}
                        />
                    </div>
                    
                    {/* Navigation HUD */}
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-[2010] flex flex-col items-center">
                        <div className="flex items-center gap-8 mb-4">
                            <div className="w-24 h-[1px] bg-gradient-to-r from-transparent to-white/40" />
                            <div className="text-[10px] font-mono tracking-[0.5em] text-white/40 uppercase"><AutoTranslatedText text="Scroll to Proceed" /></div>
                            <div className="w-24 h-[1px] bg-gradient-to-l from-transparent to-white/40" />
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Pagination/Footer Indicator */}
            <footer className="px-6 md:px-12 py-16" style={{ backgroundColor: theme.color2, borderTop: `2px solid ${theme.color3}` }}>
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ border: `2px solid ${theme.accentColor}`, color: theme.accentColor }}>
                            {subcategoryData?.id.substring(0, 2).toUpperCase() || 'FF'}
                        </div>
                        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: theme.textMuted }}>
                            <AutoTranslatedText text="HXVA ARCADE Curation Policy V1.0 - Selection Based on Timeless Aesthetics" />
                        </div>
                    </div>
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="text-xs font-bold tracking-widest uppercase transition-opacity hover:opacity-70 cursor-pointer"
                        style={theme.accentStyle}
                    >
                        <AutoTranslatedText text="Back to Top" />
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default SubCategoryPage;

