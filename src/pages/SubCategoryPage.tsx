import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../utils/i18nUtils';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { FeaturedItem } from '../types';
import { BookOpen } from 'lucide-react';
import { JOSEON_THEMES } from '../utils/themeUtils';
import { useFloors } from '../context/FloorContext';
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


const SubCategoryPage: React.FC = () => {
    const { subId } = useParams<{ subId: string }>();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { floors } = useFloors();
    const [items, setItems] = useState<FeaturedItem[]>([]);
    const [stories, setStories] = useState<StoryCard[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    // State for the currently displayed product card
    const [selectedItem, setSelectedItem] = useState<FeaturedItem | StoryCard | null>(null);

    useEffect(() => {
        if (items.length > 0) {
            setSelectedItem(items[0]);
            setSelectedItemId(items[0].id);
        } else if (stories.length > 0) {
            setSelectedItem(stories[0]);
            setSelectedItemId(stories[0].id);
        }
    }, [items, stories]);

    const targetSubId = subId || '';

    // Legacy ID mapping
    const getLegacyId = (id: string) => {
        if (id === 'car-care') return 'global';
        if (id === 'b2b-mall') return 'talk';
        return null;
    };

    const legacySubId = getLegacyId(targetSubId);
    
    // Find the floor that contains this subcategory - using case-insensitive match for robustness
    let parentFloor = floors.find(f => 
        f.subitems?.some(s => s.id?.toLowerCase() === targetSubId?.toLowerCase())
    ) || null;
    if (!parentFloor && legacySubId) {
        parentFloor = floors.find(f => f.subitems?.some(s => s.id === legacySubId)) || null;
    }

    const subcategoryData = parentFloor?.subitems?.find(s => 
        s.id?.toLowerCase() === targetSubId?.toLowerCase() || 
        (legacySubId && s.id?.toLowerCase() === legacySubId.toLowerCase())
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
            <div className="min-h-screen flex flex-col items-center justify-center text-dancheong-ink" style={theme.bgStyle}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 rounded-full border-2 border-dancheong-ink/10 mb-6"
                    style={{ borderTopColor: theme.accentColor }}
                />
                <p className="opacity-40 text-sm font-mono tracking-widest uppercase" style={theme.accentStyle}><AutoTranslatedText text="Loading" /></p>
            </div>
        );
    }

    if (!parentFloor || !subcategoryData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-dancheong-ink p-6" style={theme.bgStyle}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full text-center space-y-6"
                >
                    <div className="w-20 h-20 bg-dancheong-ink/5 rounded-full flex items-center justify-center mx-auto" style={{ border: `1px solid ${theme.accentColor}44` }}>
                        <BookOpen size={32} style={{ color: theme.accentColor, opacity: 0.4 }} />
                    </div>
                    <h2 className="text-2xl font-serif font-bold tracking-tight text-dancheong-ink"><AutoTranslatedText text={t('common.not_found') as string} /></h2>
                    <p className="text-dancheong-ink/40 font-light"><AutoTranslatedText text={t('common.not_found_desc') as string} /></p>
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

    if (!parentFloor) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dancheong-ivory p-20 text-center">
                <div className="max-w-md">
                    <h2 className="text-3xl font-black text-dancheong-ink mb-4">Content Not Found</h2>
                    <p className="text-dancheong-ink/40 mb-8 italic">The requested category could not be located in our current archives.</p>
                    <button 
                        onClick={() => navigate(-1)}
                        className="px-8 py-3 bg-dancheong-ink text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-dancheong-mugwort transition-all"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen font-sans" style={theme.bgStyle}>

            {/* Editorial Header */}
            <header className="relative w-full min-h-[45vh] flex items-center pt-24 pb-10 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    {(subcategoryData?.bgImage || parentFloor?.bgImage) && (
                        <img
                            src={subcategoryData?.bgImage || parentFloor?.bgImage || ''}
                            alt=""
                            className="w-full h-full object-cover opacity-10 scale-110 transition-opacity duration-700"
                        />
                    )}
                    <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 20%, ${theme.bgColor}ee 70%, ${theme.bgColor})` }} />
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
                                    <div className="px-4 py-1.5 rounded-full border text-[10px] font-black tracking-[0.3em] uppercase bg-white/80 border-dancheong-ink/20" 
                                         style={{ 
                                             color: theme.accentColor 
                                          }}>
                                        <AutoTranslatedText text={`Archive ${parentFloor.floor}`} />
                                    </div>
                                    <div className="h-[1px] w-12 bg-dancheong-ink/20" />
                                    <span className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-60 text-dancheong-ink">
                                        <AutoTranslatedText text="Temporal Curation" />
                                    </span>
                                </div>

                                <h1 className="text-5xl md:text-8xl font-black tracking-[-0.02em] uppercase mb-8 leading-[0.9]" 
                                    style={{ 
                                        color: theme.accentColor
                                    }}>
                                    <AutoTranslatedText text={(getLocalizedText(subcategoryData?.label, i18n.language) || t(`subcategory.${targetSubId}`, t('common.no_info'))) as string} />
                                </h1>

                                <p className="text-lg md:text-2xl font-serif italic leading-relaxed opacity-80 max-w-2xl border-l-2 pl-8 border-dancheong-ink/20" 
                                   style={{ color: theme.textSecondary }}>
                                    <AutoTranslatedText text={(subcategoryData?.description ? getLocalizedText(subcategoryData.description, i18n.language) : (t(`subcategory_msg.${targetSubId}`) !== `subcategory_msg.${targetSubId}` ? t(`subcategory_msg.${targetSubId}`) : t('subcategory_desc'))) as string} />
                                </p>

                                <p className="mt-4 text-sm md:text-base font-bold tracking-widest opacity-80 flex items-center gap-3 px-8 py-3 bg-dancheong-ink/10 rounded-full w-fit border border-dancheong-ink/10" style={{ color: theme.accentColor }}>
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
                            <div className="rounded-[2rem] p-8 border shadow-lg overflow-hidden group bg-white/60 backdrop-blur-md border-dancheong-ink/10">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-dancheong-ink/5 pb-2">
                                        <div className="text-[10px] md:text-[12px] font-black tracking-[0.4em] text-dancheong-ink/40 uppercase w-fit">
                                            <AutoTranslatedText text="Collection Data" />
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-xl font-serif font-black text-dancheong-ink">
                                                {items.length + stories.length}
                                            </span>
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 text-dancheong-ink"><AutoTranslatedText text="RECORDS" /></span>
                                        </div>
                                    </div>


                                    
                                    <div className="relative">
                                        <div 
                                            ref={scrollContainerRef}
                                            className="flex-grow space-y-2 max-h-[160px] overflow-y-auto pr-4 scroll-smooth custom-scrollbar"
                                        >
                                            <style>{`
                                                .custom-scrollbar::-webkit-scrollbar {
                                                    width: 4px;
                                                }
                                                .custom-scrollbar::-webkit-scrollbar-track {
                                                    background: rgba(0, 0, 0, 0.02);
                                                    border-radius: 10px;
                                                }
                                                .custom-scrollbar::-webkit-scrollbar-thumb {
                                                    background: rgba(0, 0, 0, 0.1);
                                                    border-radius: 10px;
                                                    transition: background 0.3s;
                                                }
                                                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                                                    background: rgba(0, 0, 0, 0.2);
                                                }
                                            `}</style>
                                            {([...items, ...stories]).map((item, idx) => {
                                                const isSelected = selectedItemId === item.id;
                                                return (
                                                    <motion.div 
                                                        key={item.id} 
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        className={`flex items-start gap-4 group/item cursor-pointer mb-2 p-2 rounded-xl transition-all duration-300 ${
                                                            isSelected ? 'bg-dancheong-ink/5 border-l-4 border-dancheong-ink' : 'hover:bg-dancheong-ink/[0.02]'
                                                        }`}
                                                        onClick={() => {
                                                            setSelectedItemId(item.id);
                                                            setSelectedItem(item);
                                                        }}
                                                    >
                                                        <span className={`text-[10px] font-serif italic mt-1 transition-opacity ${isSelected ? 'opacity-100 text-dancheong-ink' : 'opacity-20'}`}>
                                                            {String(idx + 1).padStart(2, '0')}
                                                        </span>
                                                        <span className={`text-sm md:text-base font-medium transition-colors line-clamp-1 ${
                                                            isSelected ? 'text-dancheong-ink' : 'text-dancheong-ink/60 group-hover/item:text-dancheong-ink'
                                                        }`}>
                                                            <AutoTranslatedText text={getLocalizedText(item.title, i18n.language)} />
                                                        </span>
                                                    </motion.div>
                                                );
                                            })}
                                            {([...items, ...stories].length === 0) && (
                                                <div className="text-sm text-dancheong-ink/20 italic">
                                                    <AutoTranslatedText text="No items found." />
                                                </div>
                                            )}
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

                {/* Content Section - Replaced 3D Gallery with Premium Product Card */}
                {!loading && (
                    <div className="mt-16 relative">
                        {/* Selected Item Detail View */}
                        <motion.div 
                            key={selectedItem?.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/40 backdrop-blur-xl rounded-[3rem] border border-dancheong-ink/10 overflow-hidden shadow-2xl min-h-[70vh] flex flex-col md:flex-row"
                        >
                            {selectedItem ? (
                                <>
                                    {/* Product Visual Area */}
                                    <div className="md:w-3/5 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
                                        <img 
                                            src={(selectedItem as any).image_url || (selectedItem as any).image || ''} 
                                            alt=""
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                        />
                                        <div className="absolute bottom-10 left-10 z-20">
                                            <div className="px-5 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white text-[10px] font-black tracking-widest uppercase mb-4">
                                                <AutoTranslatedText text="Curated Selection" />
                                            </div>
                                            <h3 className="text-4xl md:text-6xl font-black text-white leading-tight">
                                                <AutoTranslatedText text={getLocalizedText(selectedItem.title, i18n.language)} />
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Product Information Area */}
                                    <div className="md:w-2/5 p-12 md:p-16 flex flex-col justify-between">
                                        <div className="space-y-12">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="text-[10px] font-black tracking-[0.4em] text-dancheong-ink/30 uppercase block mb-2">Identifier</span>
                                                    <span className="text-xl font-serif italic text-dancheong-ink/60">#{selectedItem.id.substring(0, 8)}</span>
                                                </div>
                                                <button 
                                                    onClick={() => navigate(`/detail/${selectedItem.id}`)}
                                                    className="p-4 bg-dancheong-ink text-white rounded-full hover:scale-110 transition-transform shadow-xl shadow-dancheong-ink/20"
                                                >
                                                    <BookOpen size={24} />
                                                </button>
                                            </div>

                                            <div className="space-y-6">
                                                <h4 className="text-[10px] font-black tracking-[0.3em] text-dancheong-ink/40 uppercase">Archival Narrative</h4>
                                                <p className="text-lg md:text-xl font-serif leading-relaxed text-dancheong-ink/80 italic">
                                                    <AutoTranslatedText text={getLocalizedText((selectedItem as any).content || (selectedItem as any).description, i18n.language) || t('common.no_description')} />
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-dancheong-ink/5">
                                                <div>
                                                    <span className="text-[9px] font-black tracking-widest text-dancheong-ink/30 uppercase block mb-2">Category</span>
                                                    <span className="text-xs font-bold text-dancheong-ink uppercase tracking-wider">
                                                        {targetSubId}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-[9px] font-black tracking-widest text-dancheong-ink/30 uppercase block mb-2">Status</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-dancheong-mugwort" />
                                                        <span className="text-xs font-bold text-dancheong-ink uppercase tracking-wider">Authenticated</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => navigate(`/detail/${selectedItem.id}`)}
                                            className="w-full py-5 bg-dancheong-ink text-white rounded-2xl text-xs font-black uppercase tracking-[0.3em] hover:bg-dancheong-ink/90 transition-colors mt-12 group"
                                        >
                                            <span className="group-hover:mr-4 transition-all"><AutoTranslatedText text="Explore Detailed Archive" /></span>
                                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center py-40 opacity-20">
                                    <BookOpen size={64} className="mb-6" />
                                    <p className="text-xl font-serif italic">Select a record to explore</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </main>

            {/* Pagination/Footer Indicator */}
            <footer className="px-6 md:px-12 py-16 border-t border-dancheong-ink/10" style={{ backgroundColor: theme.color2 }}>
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ border: `2px solid ${theme.accentColor}`, color: theme.accentColor }}>
                            {subcategoryData?.id.substring(0, 2).toUpperCase() || 'FF'}
                        </div>
                        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: theme.textMuted }}>
                            <AutoTranslatedText text="몽땅쏙 Curation Policy V1.0 - Selection Based on Timeless Aesthetics" />
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

