import React, { useEffect, useState } from 'react';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getFeaturedProducts } from '../api/products';
import { FeaturedItem } from '../types';
import { getLocalizedText } from '../utils/i18nUtils';

const AllProductsPage: React.FC = () => {
    const [products, setProducts] = useState<FeaturedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { t, i18n } = useTranslation();

    useEffect(() => {
        const fetchAllProducts = async () => {
            setLoading(true);
            try {
                const data = await getFeaturedProducts();
                setProducts(data);
            } catch (error) {
                console.error('Failed to fetch all products:', error);
            } finally {
                setLoading(false);
            }
        };

        window.scrollTo(0, 0);
        fetchAllProducts();
    }, []);

    return (
        <div className="pt-20 pb-12 min-h-screen bg-[#1a1a1a]">
            {/* Header Section */}
            <header className="relative h-[30vh] min-h-[250px] flex items-center justify-center overflow-hidden mb-12">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2560&auto=format&fit=crop"
                        alt="Background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4 tracking-tight">
                            {t('featured.title')}
                        </h1>
                        <p className="text-lg text-white/60 font-light">
                            {t('featured.subtitle')}
                        </p>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: 60 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="h-1 bg-dancheong-red mx-auto mt-6"
                        />
                    </motion.div>
                </div>
            </header>

            <div className="container mx-auto px-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-dancheong-red"></div>
                        <div className="text-white/60">{t('common.loading')}</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.map((item, index) => (
                            <Link to={`/detail/${item.id}`} key={item.id} className="block group">
                                <motion.article
                                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 100,
                                        damping: 20,
                                        delay: Math.min(index * 0.05, 0.5)
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
                                                    return t(`nav.${displayKey.toLowerCase()}`) || displayKey;
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
                )}
            </div>
        </div>
    );
};

export default AllProductsPage;
