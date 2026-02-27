import React, { useEffect, useState } from 'react';
import { AutoTranslatedText } from '../components/common/AutoTranslatedText';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../utils/i18nUtils';
import { getProductById } from '../api/products';
import { FeaturedItem } from '../types';





export const DetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t, i18n } = useTranslation();
    const [item, setItem] = useState<FeaturedItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchItem = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await getProductById(id);
                setItem(data);
            } catch (error) {
                console.error('Failed to fetch product detail:', error);
            } finally {
                setLoading(false);
            }
        };

        window.scrollTo(0, 0);
        fetchItem();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center text-white bg-charcoal">
                <div className="text-center">
                    <p>{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center text-white bg-charcoal">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">{t('common.item_not_found')}</h2>
                    <Link to="/" className="text-dancheong-red hover:underline">{t('common.back_home')}</Link>
                </div>
            </div>
        );
    }

    return (
        <article className="pt-20 min-h-screen bg-charcoal text-white">
            {/* Header / Hero */}
            <div className="relative h-[60vh] w-full group">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-all duration-500"
                    style={{ backgroundImage: `url(${item.imageUrl})` }}
                >
                    <div className="absolute inset-0 bg-black/40" />
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-x-0 top-0 bottom-16 z-20 pointer-events-none">
                    <div className="container mx-auto px-6 h-full flex flex-col justify-end">
                        <Link to="/" className="inline-flex items-center text-white/60 hover:text-white mb-6 transition-colors pointer-events-auto">
                            <ArrowLeft size={20} className="mr-2" />
                            {t('common.back')}
                        </Link>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="pointer-events-auto"
                        >
                            <div className="inline-block border-b-2 border-dancheong-red mb-4 pb-1">
                                <span className="text-xl font-serif font-bold tracking-wider">
                                    {(() => {
                                        const displayKey = (item as any).subcategory || item.category;
                                        const key = `nav.${displayKey.toLowerCase()}`;
                                        const translated = t(key);
                                        const fallbackText = displayKey.charAt(0).toUpperCase() + displayKey.slice(1);
                                        const textToDisplay = translated === key ? fallbackText : translated;
                                        return <AutoTranslatedText text={textToDisplay} />;
                                    })()}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4"><AutoTranslatedText text={getLocalizedText(item.title, i18n.language)} /></h1>

                            <div className="flex flex-wrap gap-6 text-white/80 text-sm">
                                <div className="flex items-center">
                                    <CalendarIcon size={16} className="mr-2 text-dancheong-green" />
                                    <AutoTranslatedText text={getLocalizedText(item.date, i18n.language)} />
                                </div>
                                <div className="flex items-center">
                                    <MapPin size={16} className="mr-2 text-dancheong-green" />
                                    <AutoTranslatedText text={getLocalizedText(item.location, i18n.language)} />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-transparent h-[40%] mt-auto" />
            </div>

            {/* Content Body */}
            <div className="container mx-auto px-6 py-12 relative max-w-4xl">
                <div className="space-y-8">
                    <section>
                        <h3 className="text-2xl font-bold font-serif mb-6 border-l-4 border-dancheong-green pl-4">{t('common.detail_intro')}</h3>
                        <p className="text-lg leading-relaxed text-white/80 whitespace-pre-line min-h-[500px]">
                            <AutoTranslatedText text={getLocalizedText(item.description, i18n.language)} />
                        </p>
                    </section>
                </div>
            </div>
        </article>
    );
};

export default DetailPage;
