import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../utils/i18nUtils';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { FeaturedItem } from '../types';
import { BookOpen, Compass, X, Activity } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { getJoseonThemeById, getFloorBySubId } from '../utils/themeUtils';
import VirtualGallery from '../components/gallery/VirtualGallery';

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

// Mirrors the FLOORS data in VirtualStore3D.tsx (single source of truth for nav IDs)
const FLOOR_NAV = [
    {
        id: 'floor1', level: 1, floor: '1F',
        title: '글로벌 K-컬처 트렌드',
        bgImage: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?q=80&w=2560&auto=format&fit=crop',
        subitems: [
            { id: 'global', label: '글로벌 트렌드' },
            { id: 'window', label: '디지털 쇼윈도' },
            { id: 'f1_kpop', label: 'K-팝 스테이지' },
            { id: 'f1_library', label: '트렌드 라이브러리' },
            { id: 'f1_tech', label: '한류 테크존' }
        ],
        productCategories: ['global', 'exchange', 'collab', 'trend', 'f1_kpop', 'f1_library', 'f1_tech']
    },
    {
        id: 'floor2', level: 2, floor: '2F',
        title: '콜라보레이션 & 팝업',
        bgImage: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2560&auto=format&fit=crop',
        subitems: [
            { id: 'sync', label: '시너지 공간' },
            { id: 'pop', label: '다이내믹 팝업' },
            { id: 'f2_lab', label: '브랜드 랩' },
            { id: 'f2_art', label: '아트 콜라보' },
            { id: 'f2_gallery', label: '한정판 갤러리' }
        ],
        productCategories: ['collab', 'media', 'traditional', 'f2_lab', 'f2_art', 'f2_gallery']
    },
    {
        id: 'floor3', level: 3, floor: '3F',
        title: '퍼포먼스 & 전시',
        bgImage: 'https://images.unsplash.com/photo-1482160549445-562174d86407?q=80&w=2560&auto=format&fit=crop',
        subitems: [
            { id: 'performance', label: '공연 실황' },
            { id: 'exhibit', label: '가상 전시' },
            { id: 'f3_media', label: '미디어 아트 홀' },
            { id: 'f3_lounge', label: '아티스트 라운지' },
            { id: 'f3_audio', label: '사운드 아카이브' }
        ],
        productCategories: ['media', 'class', 'heritage', 'f3_media', 'f3_lounge', 'f3_audio']
    },
    {
        id: 'floor4', level: 4, floor: '4F',
        title: '컬처 토크',
        bgImage: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2560&auto=format&fit=crop',
        subitems: [
            { id: 'talk', label: '문화 담론' },
            { id: 'interview', label: '아티스트 인터뷰' },
            { id: 'f4_plus', label: '토크 플러스' },
            { id: 'f4_book', label: '도서관 섹션' },
            { id: 'f4_seminar', label: '세미나 룸' }
        ],
        productCategories: ['kstyle', 'class', 'f4_plus', 'f4_book', 'f4_seminar']
    },
    {
        id: 'floor5', level: 5, floor: '5F',
        title: '패션 아카이브',
        bgImage: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2560&auto=format&fit=crop',
        subitems: [
            { id: 'archive', label: '패션 아카이브' },
            { id: 'collection', label: '시즌 컬렉션' },
            { id: 'f5_material', label: '소재 도서관' },
            { id: 'f5_fitting', label: '피팅 스튜디오' },
            { id: 'f5_textile', label: '텍스타일 룸' }
        ],
        productCategories: ['kstyle', 'f5_material', 'f5_fitting', 'f5_textile']
    },
    {
        id: 'floor6', level: 6, floor: '6F',
        title: '로컬 헤리티지',
        bgImage: 'https://images.unsplash.com/photo-1528666579003-887483758b29?q=80&w=2560&auto=format&fit=crop',
        subitems: [
            { id: 'heritage', label: '지역 문화 유산' },
            { id: 'travel', label: '전략적 앵커' },
            { id: 'f6_gourmet', label: '미식 아카이브' },
            { id: 'f6_craft', label: '지역 공예관' },
            { id: 'f6_tour', label: '헤리티지 투어' }
        ],
        productCategories: ['heritage', 'local_heritage', 'travel_curation', 'f6_gourmet', 'f6_craft', 'f6_tour']
    },
];

const mapToFeaturedItem = (item: any): FeaturedItem => ({
    id: item.id,
    title: item.title,
    category: item.category,
    subcategory: item.subcategory,
    description: item.description,
    imageUrl: item.image_url,
    date: item.event_date,
    location: item.location,
    price: item.price,
    closedDays: item.closed_days || [],
    videoUrl: item.video_url,
    user_id: item.user_id,
    eventDates: item.event_dates || [],
});

const SubCategoryPage: React.FC = () => {
    const { subId } = useParams<{ subId: string }>();
    const { t, i18n } = useTranslation();
    const [items, setItems] = useState<FeaturedItem[]>([]);
    const [stories, setStories] = useState<StoryCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isExplorationMode, setIsExplorationMode] = useState(false);

    const targetSubId = subId || '';

    // Find parent floor from local FLOOR_NAV (always works, no Supabase dependency)
    const parentFloor = FLOOR_NAV.find(f => f.subitems.some(s => s.id === targetSubId)) || null;
    const subcategoryData = parentFloor?.subitems.find(s => s.id === targetSubId) || null;

    useEffect(() => {
        let mounted = true;
        const fetchData = async () => {
            if (!parentFloor) { setLoading(false); return; }
            setLoading(true);
            try {
                const [itemsResponse, storiesResponse] = await Promise.all([
                    supabase.from('featured_items').select('*').eq('subcategory', targetSubId),
                    supabase.from('story_cards').select('*').eq('subcategory', targetSubId)
                ]);

                if (mounted) {
                    if (itemsResponse.error) {
                        setError(`items: ${itemsResponse.error.message} (${itemsResponse.status})`);
                    } else if (itemsResponse.data) {
                        const seen = new Set<string>();
                        const uniqueItems = itemsResponse.data
                            .map(mapToFeaturedItem)
                            .filter(item => { if (seen.has(item.id)) return false; seen.add(item.id); return true; });
                        setItems(uniqueItems);
                    }

                    if (storiesResponse.error) {
                        console.error('Stories error:', storiesResponse.error.message);
                    } else if (storiesResponse.data) {
                        setStories(storiesResponse.data as StoryCard[]);
                    }
                }
            } catch (err: any) {
                console.error('Failed to fetch subcategory items:', err.message || err);
                if (mounted) setError(err.message || 'Unknown network error');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        window.scrollTo(0, 0);
        fetchData();
        return () => { mounted = false; };
    }, [targetSubId, parentFloor]);

    const floorNumber = getFloorBySubId(targetSubId) || '1';
    const theme = getJoseonThemeById(targetSubId, floorNumber);


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

    if (error && items.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-white p-6" style={theme.bgStyle}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full text-center space-y-6"
                >
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                        <Activity size={32} className="text-red-500 opacity-60" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold tracking-tight"><AutoTranslatedText text="데이터를 불러올 수 없습니다" /></h2>
                    <p className="text-white/50 font-light leading-relaxed">
                        <AutoTranslatedText text="일시적인 서버 오류이거나 네트워크 연결에 문제가 있을 수 있습니다. (406 Error - Not Acceptable API state)" />
                    </p>
                    <p className="text-red-500/40 font-mono text-[10px] break-all">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-medium transition-all active:scale-95 border border-white/10"
                    >
                        <AutoTranslatedText text="다시 시도" />
                    </button>
                    <div className="pt-4">
                        <Link to="/" className="text-xs text-white/40 hover:text-white underline underline-offset-4">
                            <AutoTranslatedText text="홈으로 돌아가기" />
                        </Link>
                    </div>
                </motion.div>
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
                    <h2 className="text-2xl font-serif font-bold tracking-tight">{t('common.not_found')}</h2>
                    <p className="text-white/50 font-light">{t('common.not_found_desc')}</p>
                    <Link
                        to="/inspiration"
                        className="inline-flex items-center gap-2 px-8 py-3 text-white rounded-full font-medium hover:opacity-90 transition-all active:scale-95"
                        style={theme.bgHighlightStyle}
                    >
                        {t('common.go_inspiration')}
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
            <header className="relative w-full min-h-[60vh] flex items-center pt-8 pb-10 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src={parentFloor.bgImage}
                        alt=""
                        className="w-full h-full object-cover grayscale opacity-30 scale-110"
                    />
                    <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent, ${theme.bgColor}cc 60%, ${theme.bgColor})` }} />
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
                                    <AutoTranslatedText text={getLocalizedText(subcategoryData.label, i18n.language) || t('common.no_info')} />
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

                        {/* Unified Curation Module (Action + Stats) */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="lg:w-[420px] shrink-0"
                        >
                            <div className="rounded-[2.5rem] p-1.5 backdrop-blur-3xl border shadow-2xl overflow-hidden group"
                                 style={{ 
                                     backgroundColor: `${theme.color1}44`, 
                                     borderColor: `${theme.color3}33`,
                                     boxShadow: `0 20px 40px -10px ${theme.bgColor}cc`
                                 }}>
                                
                                <div className="p-8 space-y-8">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-mono tracking-[0.5em] text-white/30 uppercase"><AutoTranslatedText text="Collection Data" /></div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-6xl font-serif font-black" style={{ color: theme.highlightColor }}>
                                                    {items.length + stories.length}
                                                </span>
                                                <span className="text-xs font-bold uppercase tracking-widest opacity-30 text-white">Records</span>
                                            </div>
                                        </div>
                                        <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center">
                                            <Compass size={20} className="text-white/20 animate-[spin_10s_linear_infinite]" />
                                        </div>
                                    </div>
                                </div>

                                <div className="px-8 py-4 bg-white/5 flex justify-between items-center text-[9px] font-mono tracking-[0.4em] uppercase text-white/40">
                                    <span><AutoTranslatedText text="Status: Immersive Sync" /></span>
                                    <div className="flex gap-1">
                                        <div className="w-1 h-1 rounded-full bg-current animate-pulse" />
                                        <div className="w-1 h-1 rounded-full bg-current animate-pulse delay-75" />
                                        <div className="w-1 h-1 rounded-full bg-current animate-pulse delay-150" />
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
                                {t('common.loading_content')}
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
                                onClick={() => setIsExplorationMode(true)}
                                onItemClick={() => setIsExplorationMode(true)}
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
                        <div className="px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-md bg-black/40">
                            <span className="text-[10px] font-bold tracking-[0.3em] text-white/80 uppercase">
                                <AutoTranslatedText text={subcategoryData.label} />
                            </span>
                        </div>
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
                        />
                    </div>
                    
                    {/* Navigation HUD */}
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-[2010] flex flex-col items-center">
                        <div className="flex items-center gap-8 mb-4">
                            <div className="w-24 h-[1px] bg-gradient-to-r from-transparent to-white/40" />
                            <div className="text-[10px] font-mono tracking-[0.5em] text-white/40 uppercase">Scroll to Proceed</div>
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
                            {subcategoryData.id.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: theme.textMuted }}>
                            <AutoTranslatedText text="DEPT. Curation Policy V1.0 - Selection Based on Timeless Aesthetics" />
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

