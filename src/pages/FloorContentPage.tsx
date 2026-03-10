import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../utils/i18nUtils';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { getProductsByCategory } from '../api/products';
import { getFloorCategories } from '../api/categories';
import { FeaturedItem, FloorCategory } from '../types';
import { ArrowRight, BookOpen } from 'lucide-react';
import { getJoseonThemeById } from '../utils/themeUtils';

const CATEGORY_FILTERS: Record<string, string[]> = {
    'floor1': ['Trend', 'trend', 'global', 'window', 'exchange', '글로벌'],
    'floor2': ['Trend', 'popup', 'collab', 'pop', 'sync', '팝업', '협업'],
    'floor3': ['Tickets', 'tickets', 'Exhibition', 'Performance', 'performance', 'exhibition', 'media', 'traditional', '공연', '전시'],
    'floor4': ['Art', 'art', 'class', 'talk', 'interview', '문화', '토크', '인터뷰'],
    'floor5': ['Style', 'style', 'photo', 'video', 'media', 'archive', 'collection', 'kstyle', '패션', '아카이브'],
    'floor6': ['Travel', 'travel', 'local', 'heritage', 'local_heritage', '여행', '로컬', '유산'],
    'community': ['Community', 'community', 'notice', 'qna', 'reviews', '커뮤니티']
};

const FloorContentPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const filter = searchParams.get('filter');
    const { i18n } = useTranslation();
    const [items, setItems] = useState<FeaturedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [floorData, setFloorData] = useState<FloorCategory | null>(null);

    const categoryId = id || 'trend';

    useEffect(() => {
        let mounted = true;
        const fetchData = async () => {
            setLoading(true);
            try {
                const floors = await getFloorCategories();
                const currentFloor = floors.find(f => f.id === categoryId);
                if (mounted) setFloorData(currentFloor || null);
                const targetInternalCategories = CATEGORY_FILTERS[categoryId] || [];
                if (targetInternalCategories.length === 0) {
                    if (mounted) setItems([]);
                } else {
                    const promises = targetInternalCategories.map(cat => getProductsByCategory(cat));
                    const results = await Promise.all(promises);
                    // Deduplicate items
                    const uniqueMap = new Map();
                    results.flat().forEach(item => uniqueMap.set(item.id, item));
                    let allItems = Array.from(uniqueMap.values());

                    // Apply Sub-filter if present
                    if (filter) {
                        allItems = allItems.filter(item =>
                            (item.subcategory && item.subcategory.toLowerCase() === filter.toLowerCase()) ||
                            (item.category && item.category.toLowerCase() === filter.toLowerCase())
                        );
                    }

                    if (mounted) setItems(allItems);
                }
            } catch (error: any) {
                console.error('Failed to fetch floor items:', error.message || error);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        window.scrollTo(0, 0);
        fetchData();
        return () => { mounted = false; };
    }, [categoryId, filter]);

    const floorNumber = floorData?.floor?.charAt(0) || '1';
    const theme = getJoseonThemeById(id || '', floorNumber);

    if (!floorData) {
        return (
            <div className="min-h-screen pt-32 text-center text-white" style={theme.bgStyle}>
                <h2 className="text-2xl font-bold"><AutoTranslatedText text="존재하지 않는 층입니다." /></h2>
                <Link to="/inspiration" style={theme.highlightStyle} className="mt-4 inline-block"><AutoTranslatedText text="홈으로 가기" /></Link>
            </div>
        );
    }

    return (
        <div className="pt-20 pb-20 min-h-screen text-white font-sans" style={theme.bgStyle}>
            {/* Editorial Header */}
            <header className="relative w-full py-24 flex items-center justify-center overflow-hidden mb-16 border-b border-white/10">
                <div className="absolute inset-0 z-0 opacity-20">
                    <img
                        src={floorData.bgImage}
                        alt=""
                        className="w-full h-full object-cover grayscale"
                    />
                    <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${theme.bgColor}, transparent)` }} />
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="font-bold tracking-[0.3em] uppercase mb-4 block text-sm px-4 py-2 rounded-full w-fit" style={{ backgroundColor: `${theme.color2}cc`, color: theme.accentColor, border: `1px solid ${theme.accentColor}` }}>
                            <AutoTranslatedText text={`${floorData.floor} Contents`} />
                        </span>
                        <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8 tracking-tight" style={theme.textPrimaryStyle}>
                            <AutoTranslatedText text={getLocalizedText(floorData.title, i18n.language)} />
                        </h1>
                        <p className="text-xl font-light leading-relaxed" style={theme.textSecondaryStyle}>
                            <AutoTranslatedText text="문화를 읽고, 영감을 발견하는 공간. 이 층에서 제공하는 큐레이션 스토리와 특별한 기획을 확인해보세요." />
                        </p>
                        {/* Gradient accent bar */}
                        <div className="h-1 w-32 mt-8 rounded" style={{ background: `linear-gradient(to right, ${theme.accentColor}, ${theme.color4}, ${theme.color5})` }} />
                    </motion.div>
                </div>
            </header>

            <main className="container mx-auto px-6">
                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-32">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: theme.accentColor }}></div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && items.length === 0 && (
                    <div className="text-white/40 text-center py-32 font-light text-lg">
                        <AutoTranslatedText text="현재 준비된 에디토리얼 콘텐츠가 없습니다." />
                    </div>
                )}

                {/* Editorial List Layout */}
                <div className="flex flex-col gap-24">
                    {!loading && items.map((item, index) => (
                        <motion.article
                            key={item.id}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                            className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-10 md:gap-16 items-center group`}
                        >
                            {/* Visual Side */}
                            <div className="w-full md:w-1/2 overflow-hidden rounded-2xl relative aspect-[4/3] md:aspect-auto md:h-[500px]">
                                <img
                                    src={item.imageUrl}
                                    alt={getLocalizedText(item.title, i18n.language)}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />

                                <div className="absolute top-6 left-6 flex gap-2">
                                    <span className="bg-black/80 backdrop-blur-md text-white text-xs px-4 py-1.5 rounded-full uppercase tracking-wider border border-white/20 select-none">
                                        <AutoTranslatedText text={getLocalizedText(item.category || item.subcategory || 'Culture', i18n.language)} />
                                    </span>
                                </div>
                            </div>

                            {/* Content Side */}
                            <div className="w-full md:w-1/2 flex flex-col justify-center p-6 rounded-2xl" style={{ backgroundColor: theme.color1, border: `1px solid ${theme.color3}` }}>
                                <div className="flex items-center text-sm mb-6 space-x-4 font-bold tracking-widest uppercase" style={{ color: theme.color4 }}>
                                    <span>{getLocalizedText(item.date, i18n.language)}</span>
                                    {item.location && (
                                        <>
                                            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: theme.color4 }} />
                                            <span>{getLocalizedText(item.location, i18n.language)}</span>
                                        </>
                                    )}
                                </div>

                                <h3 className="text-3xl md:text-5xl font-serif font-bold mb-6 leading-tight" style={theme.textPrimaryStyle}>
                                    <AutoTranslatedText text={getLocalizedText(item.title, i18n.language)} />
                                </h3>

                                <p className="text-lg font-light leading-relaxed mb-10 line-clamp-3" style={theme.textSecondaryStyle}>
                                    <AutoTranslatedText text={getLocalizedText(item.description, i18n.language)} />
                                </p>

                                <Link
                                    to={`/detail/${item.id}`}
                                    className="inline-flex items-center gap-3 text-white font-medium text-lg pb-2 border-b-2 border-transparent transition-all w-fit hover:opacity-80"
                                    style={{ borderBottomColor: theme.accentColor }}
                                >
                                    <BookOpen size={20} />
                                    <AutoTranslatedText text="아티클 읽기" />
                                    <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                                </Link>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default FloorContentPage;
