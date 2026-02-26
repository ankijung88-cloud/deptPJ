import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../utils/i18nUtils';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { getProductsByCategory } from '../api/products';
import { getFloorCategories } from '../api/categories';
import { FeaturedItem, FloorCategory } from '../types';
import { ArrowRight, BookOpen } from 'lucide-react';


const SubCategoryPage: React.FC = () => {
    const { subId } = useParams<{ subId: string }>();
    const { i18n } = useTranslation();
    const [items, setItems] = useState<FeaturedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [parentFloor, setParentFloor] = useState<FloorCategory | null>(null);

    const targetSubId = subId || '';

    useEffect(() => {
        let mounted = true;
        const fetchData = async () => {
            setLoading(true);
            try {
                const floors = await getFloorCategories();
                const floor = floors.find(f =>
                    f.subitems?.some((sub: any) => sub.id === targetSubId)
                );
                if (mounted) setParentFloor(floor || null);

                // Fetch items exactly matching the subcategory ID
                const results = await getProductsByCategory(targetSubId);

                // If no exact matches are found, you could optionally fallback to search terms,
                // but strict filtering is preferred to prevent category pollution.
                if (mounted) setItems(results);
            } catch (error: any) {
                console.error('Failed to fetch subcategory items:', error.message || error);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        window.scrollTo(0, 0);
        fetchData();
        return () => { mounted = false; };
    }, [targetSubId]);

    const subcategoryData = parentFloor?.subitems?.find((sub: any) => sub.id === targetSubId);

    if (!parentFloor || !subcategoryData) {
        return (
            <div className="min-h-screen pt-32 text-center bg-charcoal text-white">
                <h2 className="text-2xl font-bold">해당 카테고리를 찾을 수 없습니다.</h2>
                <Link to="/" className="text-dancheong-red mt-4 inline-block">홈으로 가기</Link>
            </div>
        );
    }

    return (
        <div className="pt-20 pb-20 min-h-screen bg-charcoal text-white font-sans">
            {/* Editorial Header */}
            <header className="relative w-full py-24 flex items-center justify-center overflow-hidden mb-16 border-b border-white/10">
                <div className="absolute inset-0 z-0 opacity-20">
                    <img
                        src={parentFloor.bgImage}
                        alt=""
                        className="w-full h-full object-cover grayscale"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal to-transparent" />
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-dancheong-red font-bold tracking-[0.3em] uppercase mb-4 block text-sm">
                            {parentFloor.floor} / <AutoTranslatedText text={getLocalizedText(subcategoryData.label, i18n.language)} />
                        </span>
                        <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-8 tracking-tight">
                            <AutoTranslatedText text={getLocalizedText(subcategoryData.label, i18n.language)} />
                        </h1>
                        <p className="text-xl text-white/70 font-light leading-relaxed">
                            <AutoTranslatedText text="해당 카테고리에 특화된 큐레이션 스토리와 최신 인사이트를 탐색합니다." />
                        </p>
                    </motion.div>
                </div>
            </header>

            <main className="container mx-auto px-6">
                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-32">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dancheong-red"></div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && items.length === 0 && (
                    <div className="text-white/40 text-center py-32 font-light text-lg">
                        <AutoTranslatedText text="현재 이 카테고리에 준비된 콘텐츠가 없습니다." />
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
                                        <AutoTranslatedText text={getLocalizedText(subcategoryData.label, i18n.language)} />
                                    </span>
                                </div>
                            </div>

                            {/* Content Side */}
                            <div className="w-full md:w-1/2 flex flex-col justify-center">
                                <div className="flex items-center text-dancheong-red text-sm mb-6 space-x-4 font-bold tracking-widest uppercase">
                                    <span>{getLocalizedText(item.date, i18n.language)}</span>
                                    {item.location && (
                                        <>
                                            <span className="w-1 h-1 bg-dancheong-red/50 rounded-full" />
                                            <span>{getLocalizedText(item.location, i18n.language)}</span>
                                        </>
                                    )}
                                </div>

                                <h3 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight group-hover:text-white/90 transition-colors">
                                    <AutoTranslatedText text={getLocalizedText(item.title, i18n.language)} />
                                </h3>

                                <p className="text-white/60 text-lg md:text-xl font-light leading-relaxed mb-10 line-clamp-3">
                                    <AutoTranslatedText text={getLocalizedText(item.description, i18n.language)} />
                                </p>

                                <Link
                                    to={`/detail/${item.id}`}
                                    className="inline-flex items-center gap-3 text-white font-medium text-lg pb-2 border-b-2 border-transparent hover:border-dancheong-red hover:text-dancheong-red transition-all w-fit"
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

export default SubCategoryPage;
