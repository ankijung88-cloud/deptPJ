import React, { useEffect, useState } from 'react';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { getFeaturedProducts } from '../../api/products';
import { FeaturedItem } from '../../types';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../../utils/i18nUtils';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export const FeaturedSection: React.FC = () => {
    const [products, setProducts] = useState<FeaturedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { t, i18n } = useTranslation();

    useEffect(() => {
        let mounted = true;

        const fetchProducts = async () => {
            console.log('FeaturedSection: Fetching products...');
            setError(null);
            setLoading(true);

            try {
                const data = await getFeaturedProducts();

                if (mounted) {
                    console.log('FeaturedSection: Successfully loaded', data?.length, 'products');
                    setProducts(data);
                }
            } catch (err: any) {
                const isAbortError = err?.name === 'AbortError' || err?.message?.includes('AbortError') || err?.message?.includes('signal is aborted');

                if (!isAbortError) {
                    console.error('FeaturedSection: Fetch error:', err);
                    if (mounted) {
                        setError(err.message || '데이터를 불러오지 못했습니다.');
                    }
                } else {
                    console.debug('FeaturedSection: Fetch aborted or component unmounted.');
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchProducts();
        return () => { mounted = false; };
    }, []);

    if (loading) {
        return (
            <section className="h-screen w-full snap-start bg-[#2a2a2a] text-center flex flex-col items-center justify-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-dancheong-red"></div>
                    <div className="text-white/60">{t('common.loading')}</div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="h-screen w-full snap-start bg-[#2a2a2a] text-center flex flex-col items-center justify-center">
                <div className="max-w-md mx-auto px-6">
                    <div className="text-red-500 mb-4 font-bold">오류가 발생했습니다: {error}</div>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full transition-colors border border-white/20"
                    >
                        다시 시도
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="h-screen w-full snap-start bg-[#2a2a2a] relative flex flex-col justify-center overflow-hidden">
            <style>{`
                .featured-swiper {
                    padding: 0 6% !important;
                    overflow: visible !important;
                }
                .featured-swiper .swiper-slide {
                    transition: all 0.5s ease;
                    opacity: 0.4;
                    transform: scale(0.9);
                }
                .featured-swiper .swiper-slide-active {
                    opacity: 1;
                    transform: scale(1);
                }
            `}</style>

            <div className="container mx-auto px-6 mb-12 flex justify-between items-end">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="max-w-4xl"
                >
                    <h2 className="text-sm font-bold tracking-widest text-dancheong-red mb-3 uppercase">Promotion & Exchange</h2>
                    <h3 className="text-3xl md:text-5xl font-serif font-bold text-white mb-2">{t('featured.title')}</h3>
                </motion.div>

                <Link
                    to="/all-products"
                    className="text-white/40 hover:text-white text-sm tracking-widest font-medium transition-colors border-b border-white/10 hover:border-white pb-1 mb-2 hidden md:block"
                >
                    {t('common.view_all')}
                </Link>
            </div>

            <div className="w-full relative px-0">
                <Swiper
                    modules={[Navigation, Pagination, Keyboard, Autoplay]}
                    slidesPerView={1}
                    spaceBetween={30}
                    centeredSlides={true}
                    loop={products.length > 3}
                    speed={800}
                    keyboard={{ enabled: true }}
                    breakpoints={{
                        768: {
                            slidesPerView: 2,
                            spaceBetween: 40,
                        },
                        1280: {
                            slidesPerView: 3,
                            spaceBetween: 50,
                        }
                    }}
                    navigation={{
                        prevEl: '.featured-prev',
                        nextEl: '.featured-next',
                    }}
                    className="featured-swiper w-full"
                >
                    {products.map((item) => (
                        <SwiperSlide key={item.id}>
                            <Link to={`/detail/${item.id}`} className="block group h-full">
                                <div className="bg-charcoal rounded-2xl overflow-hidden shadow-2xl h-full border border-white/5 group-hover:border-dancheong-red/30 transition-colors duration-500">
                                    <div className="relative aspect-video overflow-hidden">
                                        <img
                                            src={item.imageUrl}
                                            alt={getLocalizedText(item.title, i18n.language)}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                    </div>

                                    <div className="p-8">
                                        <h4 className="text-2xl font-bold text-white mb-3 group-hover:text-dancheong-red transition-colors line-clamp-1">
                                            <AutoTranslatedText text={getLocalizedText(item.title, i18n.language)} />
                                        </h4>
                                        <p className="text-white/60 text-base line-clamp-2 mb-6 h-12">
                                            <AutoTranslatedText text={getLocalizedText(item.description, i18n.language)} />
                                        </p>
                                        <div className="flex justify-between items-center text-sm font-medium pt-4 border-t border-white/10">
                                            <span className="text-white/40 uppercase tracking-widest group-hover:text-white transition-colors">{t('common.view_details')}</span>
                                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-dancheong-red transition-all">
                                                <ArrowUpRight className="text-white" size={20} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {/* Custom Navigation Arrows - Bottom Center */}
            <div className="flex justify-center items-center gap-8 mt-16 z-20">
                <button className="featured-prev w-14 h-14 flex items-center justify-center rounded-full border border-white/10 text-white/40 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all focus:outline-none" aria-label="이전 상품">
                    <ChevronLeft size={28} />
                </button>
                <button className="featured-next w-14 h-14 flex items-center justify-center rounded-full border border-white/10 text-white/40 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all focus:outline-none" aria-label="다음 상품">
                    <ChevronRight size={28} />
                </button>
            </div>

            <div className="text-center mt-6 md:hidden">
                <Link
                    to="/all-products"
                    className="text-white/40 hover:text-white text-sm tracking-widest font-medium transition-colors border-b border-white/10 hover:border-white pb-1"
                >
                    {t('common.view_all')}
                </Link>
            </div>
        </section>
    );
};
