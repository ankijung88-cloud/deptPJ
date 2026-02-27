import React, { useEffect, useState } from 'react';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../utils/i18nUtils';
import { getProductsByCategory } from '../api/products';
import { getFloorCategories } from '../api/categories';
import { FeaturedItem, FloorCategory } from '../types';
import { useAuth } from '../context/AuthContext';
import { Plus } from 'lucide-react';
import LoginModal from '../components/auth/LoginModal';
import { useNavigate } from 'react-router-dom';

// Mapping URL paths to Internal Categories (for filtering)
// Includes legacy keys for backward compatibility
const CATEGORY_FILTERS: Record<string, string[]> = {
    'trend': ['Trend', 'trend', 'popup', 'collab', 'new', 'discount', '트렌드', '팝업', '할인상품', '신상품'],
    'tickets': ['Tickets', 'tickets', 'Exhibition', 'Performance', 'performance', 'exhibition', '공연', '전시'],
    'art': ['Art', 'art', 'class', 'fashion', '활동', '예술', '클래스', '스타일'],
    'style': ['Style', 'style', 'photo', 'video', 'media', '사진', '영상', '미디어'],
    'travel': ['Travel', 'travel', 'local', 'course', 'guide', '여행', '로컬'],
    'community': ['Community', 'community', 'notice', 'qna', 'reviews', '커뮤니티', '공지사항', '후기']
};

const CategoryPage: React.FC = () => {
    const { category } = useParams<{ category: string }>();
    const [searchParams] = useSearchParams();
    const filter = searchParams.get('filter');
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [items, setItems] = useState<FeaturedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [floorData, setFloorData] = useState<FloorCategory | null>(null);

    // Handle case where category might be undefined or not in map
    const categoryId = category || 'tickets';

    useEffect(() => {
        let mounted = true;
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch floor metadata
                const floors = await getFloorCategories();
                const currentFloor = floors.find(f => f.id === categoryId);
                if (mounted) setFloorData(currentFloor || null);

                // Fetch all items (in a real app, we might filter by category at API level)
                // For mock data, we get all and filter client-side or use getProductsByCategory if it supports multiple

                // Simplification for Mock Data:
                // We need to fetch items that belong to the current "Floor Category".
                // The mapping was: 
                // trend -> Trend
                // tickets -> Exhibition, Performance
                // art -> Art (includes Class, Fashion)
                // style -> Photo, Video (New structure: Style 4F)

                // Let's rely- [x] Restore Community Category & Subcategories.
                // - [x] Match Product Card Badges to Subcategory Names.
                // - [x] Ensure Main Nav shows "All" vs Dropdown shows "Filtered".
                // - [x] Prepare SQL Migration for `subcategory` support.ring.
                // But since we changed logic, let's fetch ALL and filter by matching the requirements.
                // Or better, stick to CATEGORY_FILTERS for the *base* set of items, then apply sub-filter.

                const targetInternalCategories = CATEGORY_FILTERS[categoryId] || [];

                if (targetInternalCategories.length === 0) {
                    if (mounted) setItems([]);
                } else {
                    const promises = targetInternalCategories.map(cat => getProductsByCategory(cat));
                    const results = await Promise.all(promises);
                    let allItems = results.flat();

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
                console.error('Failed to fetch category items:', error.message || error);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        window.scrollTo(0, 0);
        fetchData();
        return () => { mounted = false; };
    }, [categoryId, filter]);

    return (
        <div className="pt-20 pb-12 min-h-screen bg-[#1a1a1a]">
            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
            {/* Stylized Header */}
            <header className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden mb-12">
                {/* Background Image with Parallax-like effect */}
                <motion.div
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0 z-0"
                >
                    <img
                        src={floorData?.bgImage || 'https://images.unsplash.com/photo-1590635327202-b53050a49826?q=80&w=2560&auto=format&fit=crop'}
                        alt=""
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
                </motion.div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 tracking-tight">
                            {(() => {
                                if (categoryId === 'trend' && filter === 'discount') return '할인상품';
                                if (categoryId === 'trend' && filter === 'new') return '신상품';
                                return floorData ? (
                                    <AutoTranslatedText text={getLocalizedText(floorData.title, i18n.language)} />
                                ) : (
                                    categoryId
                                );
                            })()}
                        </h1>
                        {floorData && (
                            <p className="text-xl md:text-2xl text-white/80 font-light max-w-2xl mx-auto">
                                <AutoTranslatedText text={getLocalizedText(floorData.description, i18n.language)} />
                            </p>
                        )}
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: 80 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="h-1 bg-dancheong-red mx-auto mt-8"
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                            className="mt-8"
                        >
                            <button
                                onClick={() => {
                                    if (!user) {
                                        setShowLoginModal(true);
                                    } else {
                                        navigate(`/products/new?category=${categoryId}`);
                                    }
                                }}
                                className="inline-flex items-center bg-white/10 hover:bg-dancheong-red text-white px-6 py-3 rounded-full backdrop-blur-md transition-all border border-white/20 hover:border-dancheong-red group"
                            >
                                <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                                {t('common.register_product')}
                            </button>
                        </motion.div>
                    </motion.div>
                </div>
            </header>

            <div className="container mx-auto px-6">
                {/* Loading State */}
                {loading && (
                    <div className="text-white text-center py-20">
                        {t('common.loading')}
                    </div>
                )}

                {/* Empty State */}
                {!loading && items.length === 0 && (
                    <div className="text-white/50 text-center py-20">
                        {t('common.no_content')}
                    </div>
                )}

                {/* Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {items.map((item, index) => (
                        <Link to={`/detail/${item.id}`} key={item.id} className="block group">
                            <motion.article
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 100,
                                    damping: 20,
                                    delay: index * 0.05
                                }}
                                className="bg-[#2a2a2a] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <img
                                        src={item.imageUrl}
                                        alt={getLocalizedText(item.title, i18n.language)}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full uppercase tracking-wider border border-white/10">
                                            {(() => {
                                                const displayKey = item.subcategory || item.category;
                                                // Support both lower and upper case keys in nav translations
                                                const key = `nav.${displayKey.toLowerCase()}`;
                                                const translated = t(key);
                                                const fallbackText = displayKey.charAt(0).toUpperCase() + displayKey.slice(1);
                                                const textToDisplay = translated === key ? fallbackText : translated;
                                                return <AutoTranslatedText text={textToDisplay} />;
                                            })()}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-dancheong-red transition-colors line-clamp-1">
                                        <AutoTranslatedText text={getLocalizedText(item.title, i18n.language)} />
                                    </h3>
                                    <div className="flex items-center text-white/40 text-sm mb-4 space-x-4">
                                        <span><AutoTranslatedText text={getLocalizedText(item.date, i18n.language)} /></span>
                                        <span className="w-1 h-1 bg-white/40 rounded-full" />
                                        <span className="truncate max-w-[150px]"><AutoTranslatedText text={getLocalizedText(item.location, i18n.language)} /></span>
                                    </div>
                                    <p className="text-white/60 text-sm line-clamp-2 mb-4 leading-relaxed">
                                        <AutoTranslatedText text={getLocalizedText(item.description, i18n.language)} />
                                    </p>
                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <span className="text-dancheong-green font-medium">
                                            {(() => {
                                                const priceText = getLocalizedText(item.price, i18n.language);
                                                // If it's numeric (e.g. "500" or "50,000"), append '원'
                                                const displayPrice = /^[0-9,]+$/.test(priceText) ? `${priceText}원` : priceText;
                                                return <AutoTranslatedText text={displayPrice} />;
                                            })()}
                                        </span>
                                        <span className="text-xs text-white/30 group-hover:text-white/60 transition-colors uppercase tracking-widest">
                                            VIEW DETAILS
                                        </span>
                                    </div>
                                </div>
                            </motion.article>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CategoryPage;
