import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../utils/i18nUtils';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { FeaturedItem } from '../types';
import { ArrowRight, BookOpen, Play, MapPin, Calendar, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface StoryCard {
    id: string;
    subcategory: string;
    title: string;
    content: string;
    image_url: string;
    created_at: string;
}

// Mirrors the FLOORS data in VirtualStore3D.tsx (single source of truth for nav IDs)
const FLOOR_NAV = [
    {
        id: 'floor1', level: 1, floor: '1F',
        title: '글로벌 K-컬처 트렌드',
        bgImage: 'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?q=80&w=2560&auto=format&fit=crop',
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
        bgImage: 'https://images.unsplash.com/photo-1543431690-3b6be2c3cb19?q=80&w=2560&auto=format&fit=crop',
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
        bgImage: 'https://images.unsplash.com/photo-1517260739337-6799d239ce83?q=80&w=2560&auto=format&fit=crop',
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
        bgImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2560&auto=format&fit=crop',
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
        bgImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=2560&auto=format&fit=crop',
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
        bgImage: 'https://images.unsplash.com/photo-1596120364993-90dcc247f07e?q=80&w=2560&auto=format&fit=crop',
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
    const { i18n } = useTranslation();
    const [items, setItems] = useState<FeaturedItem[]>([]);
    const [stories, setStories] = useState<StoryCard[]>([]);
    const [loading, setLoading] = useState(true);

    const targetSubId = subId || '';

    // Find parent floor from local FLOOR_NAV (always works, no Supabase dependency)
    const parentFloor = FLOOR_NAV.find(f => f.subitems.some(s => s.id === targetSubId)) || null;
    const subcategoryData = parentFloor?.subitems.find(s => s.id === targetSubId) || null;
    const floorNumber = parentFloor?.level?.toString() || '1';

    useEffect(() => {
        let mounted = true;
        const fetchData = async () => {
            if (!parentFloor) { setLoading(false); return; }
            setLoading(true);
            try {
                console.log('Fetching data for subcategory:', targetSubId);
                const [itemsResponse, storiesResponse] = await Promise.all([
                    supabase.from('featured_items').select('*').eq('subcategory', targetSubId),
                    supabase.from('story_cards').select('*').eq('subcategory', targetSubId)
                ]);
                console.log('Items response:', itemsResponse.data?.length || 0, 'items');
                console.log('Stories response:', storiesResponse.data?.length || 0, 'stories');

                if (mounted) {
                    if (!itemsResponse.error && itemsResponse.data) {
                        const seen = new Set<string>();
                        const uniqueItems = itemsResponse.data
                            .map(mapToFeaturedItem)
                            .filter(item => { if (seen.has(item.id)) return false; seen.add(item.id); return true; });
                        setItems(uniqueItems);
                    }
                    if (!storiesResponse.error && storiesResponse.data) {
                        setStories(storiesResponse.data as StoryCard[]);
                    }
                }
            } catch (error: any) {
                console.error('Failed to fetch subcategory items:', error.message || error);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        window.scrollTo(0, 0);
        fetchData();
        return () => { mounted = false; };
    }, [targetSubId, parentFloor]);

    // Debug: log the subId to console to help identify mismatches
    console.log('[SubCategoryPage] subId:', targetSubId, '| parentFloor:', parentFloor?.id, '| subcategoryData:', subcategoryData?.id);

    // While loading, show spinner (don't flash not-found)
    if (loading) {
        return (
            <div className="min-h-screen pt-32 flex flex-col items-center justify-center bg-[#111] text-white">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 rounded-full border-2 border-white/10 border-t-white mb-6"
                />
                <p className="text-white/40 text-sm font-mono tracking-widest uppercase"><AutoTranslatedText text="Loading" /></p>
            </div>
        );
    }

    if (!parentFloor || !subcategoryData) {
        return (
            <div className="min-h-screen pt-32 flex flex-col items-center justify-center bg-[#1a1a1a] text-white p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full text-center space-y-6"
                >
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                        <BookOpen size={32} className="text-white/20" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold tracking-tight"><AutoTranslatedText text="카테고리를 찾을 수 없습니다" /></h2>
                    <p className="text-white/50 font-light"><AutoTranslatedText text="요청하신 페이지가 존재하지 않거나 현재 준비 중입니다." /></p>
                    <p className="text-white/30 font-mono text-xs">subId: {targetSubId}</p>
                    <Link
                        to="/inspiration"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-all active:scale-95"
                    >
                        <AutoTranslatedText text="인스피레이션 홈으로" />
                    </Link>
                </motion.div>
            </div>
        );

    }

    const featuredItem = items[0];
    const otherItems = items.slice(1);

    return (
        <div className="min-h-screen bg-[#111111] text-white font-sans selection:bg-white/20 selection:text-white">

            {/* Back Navigation Bar */}
            <div className="fixed top-28 left-0 w-full z-40 pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="container mx-auto px-6 md:px-12 flex justify-end pointer-events-auto"
                >
                    <Link
                        to={`/inspiration?floor=${floorNumber}`}
                        className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/5 hover:bg-white/10 backdrop-blur-2xl border border-white/10 rounded-full text-sm font-medium transition-all group shadow-2xl"
                    >
                        <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                        <AutoTranslatedText text={`BACK TO 3D ${parentFloor.floor}`} />
                    </Link>
                </motion.div>
            </div>

            {/* Editorial Header */}
            <header className="relative w-full min-h-[70vh] flex items-center pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src={parentFloor.bgImage}
                        alt=""
                        className="w-full h-full object-cover grayscale opacity-30 scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#111111]/0 via-[#111111]/80 to-[#111111]" />
                </div>

                <div className="container mx-auto px-6 md:px-12 relative z-10">
                    <div className="max-w-4xl">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded border border-white/10 text-[10px] font-bold tracking-[0.2em] uppercase text-white/60">
                                    <AutoTranslatedText text={`Archive ${parentFloor.floor}`} />
                                </span>
                                <div className="h-[1px] w-12 bg-white/20" />
                                <span className="text-white/40 text-xs font-medium tracking-widest uppercase">
                                    <AutoTranslatedText text="Curation Journal" />
                                </span>
                            </div>

                            <h1 className="text-6xl md:text-9xl font-serif font-bold text-white mb-10 tracking-tighter leading-[0.9]">
                                <AutoTranslatedText text={getLocalizedText(subcategoryData.label, i18n.language)} />
                            </h1>

                            <div className="flex flex-col md:flex-row md:items-end gap-8 md:gap-16">
                                <p className="text-xl md:text-2xl text-white/60 font-serif italic leading-relaxed max-w-2xl">
                                    <AutoTranslatedText text="전통의 깊이와 현대적 감각이 교차하는 지점에서 발견한 새로운 영감의 기록들을 탐색합니다." />
                                </p>
                                <div className="shrink-0 pb-2">
                                    <div className="text-white/20 text-xs tracking-widest uppercase mb-2"><AutoTranslatedText text="Total Stories" /></div>
                                    <div className="text-4xl font-serif font-bold">{items.length + stories.length}</div>
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
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 border-2 border-white/5 rounded-full" />
                            <div className="absolute inset-0 border-2 border-t-white rounded-full animate-spin" />
                        </div>
                        <span className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase animate-pulse"><AutoTranslatedText text="Loading Stories" /></span>
                    </div>
                )}

                {/* Content Sections */}
                {!loading && (
                    <div className="space-y-32">
                        {/* Featured Hero Article */}
                        {featuredItem && (
                            <motion.section
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1 }}
                                className="relative grid md:grid-cols-12 gap-12 group cursor-pointer"
                            >
                                <div className="md:col-span-8 overflow-hidden rounded-3xl relative aspect-[16/10] bg-white/5">
                                    <img
                                        src={featuredItem.imageUrl}
                                        alt={getLocalizedText(featuredItem.title, i18n.language)}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />

                                    {featuredItem.videoUrl && (
                                        <div className="absolute bottom-10 right-10 z-20">
                                            <div className="flex items-center gap-3 px-6 py-3 bg-white text-black rounded-full text-sm font-bold shadow-2xl translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                                <Play size={16} fill="currentColor" />
                                                <AutoTranslatedText text="WATCH STORY" />
                                            </div>
                                        </div>
                                    )}

                                    <div className="absolute top-10 left-10">
                                        <div className="px-4 py-2 bg-black/60 backdrop-blur-xl rounded-full border border-white/20 text-[10px] font-black tracking-widest uppercase">
                                            <AutoTranslatedText text="Feature Story" />
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-4 flex flex-col justify-center">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 text-xs font-bold tracking-widest text-[#d4af37]">
                                            <span className="flex items-center gap-1.5"><Calendar size={14} /> {getLocalizedText(featuredItem.date, i18n.language)}</span>
                                            <span className="w-1 h-1 bg-white/20 rounded-full" />
                                            <span className="flex items-center gap-1.5"><MapPin size={14} /> {getLocalizedText(featuredItem.location, i18n.language)}</span>
                                        </div>

                                        <h3 className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight group-hover:text-white/80 transition-colors">
                                            <AutoTranslatedText text={getLocalizedText(featuredItem.title, i18n.language)} />
                                        </h3>

                                        <p className="text-white/50 text-xl font-light leading-relaxed">
                                            <AutoTranslatedText text={getLocalizedText(featuredItem.description, i18n.language)} />
                                        </p>

                                        <Link
                                            to={`/detail/${featuredItem.id}`}
                                            className="inline-flex items-center gap-4 text-white font-bold group/btn pt-4"
                                        >
                                            <span className="border-b border-white/30 pb-1 group-hover/btn:border-white transition-all"><AutoTranslatedText text="Read Full Article" /></span>
                                            <ArrowRight size={20} className="group-hover/btn:translate-x-2 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.section>
                        )}

                        {/* Secondary Grid */}
                        {otherItems.length > 0 && (
                            <div className="grid md:grid-cols-2 gap-16 md:gap-24">
                                {otherItems.map((item, idx) => (
                                    <motion.article
                                        key={item.id}
                                        initial={{ opacity: 0, y: 40 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                                        className="group cursor-pointer flex flex-col h-full"
                                    >
                                        <div className="relative overflow-hidden rounded-2xl aspect-[4/3] mb-8 bg-white/5">
                                            <img
                                                src={item.imageUrl}
                                                alt={getLocalizedText(item.title, i18n.language)}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            {item.videoUrl && (
                                                <div className="absolute top-4 right-4 p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                                                    <Play size={16} className="text-white" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col flex-grow">
                                            <div className="flex items-center gap-3 text-[10px] font-bold tracking-widest text-white/40 mb-4 uppercase">
                                                <span>{getLocalizedText(item.date, i18n.language)}</span>
                                                <span className="w-1 h-1 bg-white/10 rounded-full" />
                                                <span>{getLocalizedText(item.location, i18n.language)}</span>
                                            </div>

                                            <h4 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4 leading-tight group-hover:text-white/70 transition-colors">
                                                <AutoTranslatedText text={getLocalizedText(item.title, i18n.language)} />
                                            </h4>

                                            <p className="text-white/40 text-base font-light leading-relaxed mb-8 line-clamp-3">
                                                <AutoTranslatedText text={getLocalizedText(item.description, i18n.language)} />
                                            </p>

                                            <div className="mt-auto flex items-center justify-between">
                                                <Link
                                                    to={`/detail/${item.id}`}
                                                    className="inline-flex items-center gap-2 text-white/60 text-sm font-bold hover:text-white transition-colors"
                                                >
                                                    <AutoTranslatedText text="View Details" />
                                                    <ArrowRight size={16} />
                                                </Link>
                                                <div className="text-[10px] font-medium text-white/10 tracking-[0.2em]"><AutoTranslatedText text="STORY #" />0{idx + 2}</div>
                                            </div>
                                        </div>
                                    </motion.article>
                                ))}
                            </div>
                        )}

                        {/* Story Cards Section */}
                        {stories.length > 0 && (
                            <div className="mt-20 space-y-12">
                                <div className="flex items-center gap-4">
                                    <div className="h-[1px] w-8 bg-white/40" />
                                    <h3 className="text-white/40 text-[10px] font-bold tracking-[0.3em] uppercase"><AutoTranslatedText text="Editorial Stories" /></h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {stories.map((story, idx) => (
                                        <motion.div
                                            key={story.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-500"
                                        >
                                            <div className="aspect-[16/10] overflow-hidden">
                                                <img
                                                    src={story.image_url}
                                                    alt={story.title}
                                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                                                />
                                            </div>
                                            <div className="p-8 space-y-4">
                                                <h4 className="text-xl font-serif font-bold text-white/90 leading-tight tracking-tight">
                                                    <AutoTranslatedText text={story.title} />
                                                </h4>
                                                <p className="text-white/40 text-sm leading-relaxed font-light">
                                                    <AutoTranslatedText text={story.content} />
                                                </p>
                                                <div className="pt-4 flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-white/20 tracking-widest uppercase"><AutoTranslatedText text="Editorial" /></span>
                                                    <div className="w-8 h-[1px] bg-white/10 group-hover:w-12 transition-all duration-500" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Empty State (Only if both items and stories are 0) */}
                        {!loading && items.length === 0 && stories.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-32 space-y-6">
                                <div className="w-12 h-[1px] bg-white/20" />
                                <div className="text-white/30 font-serif italic text-xl">
                                    <AutoTranslatedText text="Currently curators are collecting new stories for this heritage." />
                                </div>
                                <div className="w-12 h-[1px] bg-white/20" />
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Pagination/Footer Indicator */}
            <footer className="container mx-auto px-6 md:px-12 py-20 border-t border-white/5">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[10px] font-bold">
                            {subcategoryData.id.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="text-white/40 text-xs font-bold tracking-widest uppercase">
                            <AutoTranslatedText text="DEPT. Curation Policy V1.0 - Selection Based on Timeless Aesthetics" />
                        </div>
                    </div>
                    <Link
                        to="/inspiration"
                        className="text-white/20 hover:text-white text-[10px] font-bold tracking-widest uppercase transition-colors"
                    >
                        <AutoTranslatedText text="Back to Top" />
                    </Link>
                </div>
            </footer>
        </div>
    );
};

export default SubCategoryPage;

