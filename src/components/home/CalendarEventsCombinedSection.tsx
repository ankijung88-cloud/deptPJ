import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFeaturedProducts } from '../../api/products';
import { FeaturedItem } from '../../types';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../../utils/i18nUtils';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Keyboard, Autoplay, EffectCoverflow } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-coverflow';

export const CalendarEventsCombinedSection: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [products, setProducts] = useState<FeaturedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]); // Default to today or a specific date in March 2026 for demo

    // For demo purpose, let's set a default date in March 2026 if today is not in March
    useEffect(() => {
        const today = new Date();
        if (today.getMonth() !== 2 || today.getFullYear() !== 2026) {
            setSelectedDate('2026-03-05');
        }
    }, []);

    useEffect(() => {
        let mounted = true;
        const fetchProducts = async () => {
            try {
                const data = await getFeaturedProducts();
                if (mounted) {
                    setProducts(data);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error fetching products", error);
                if (mounted) setLoading(false);
            }
        };
        fetchProducts();
        return () => { mounted = false; };
    }, []);

    // Calendar logic
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const startDayOffset = 0; // 2026-03-01 is Sunday

    const handleDateClick = (day: number) => {
        const dateStr = `2026-03-${day.toString().padStart(2, '0')}`;
        setSelectedDate(dateStr);
    };

    const filteredProducts = useMemo(() => {
        if (!selectedDate) return products;
        return products.filter(p => p.eventDates?.includes(selectedDate));
    }, [products, selectedDate]);

    if (loading) {
        return (
            <section className="h-screen w-full snap-start bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dancheong-red"></div>
            </section>
        );
    }

    return (
        <section className="h-screen w-full snap-start bg-black relative flex flex-col justify-center overflow-hidden">
            <style>{`
                .combined-swiper {
                    padding-bottom: 60px !important;
                    overflow: visible !important;
                }
                .combined-swiper .swiper-pagination-bullet {
                    background: rgba(255, 255, 255, 0.2);
                    opacity: 1;
                }
                .combined-swiper .swiper-pagination-bullet-active {
                    background: #c4302b;
                }
                .combined-swiper .swiper-slide {
                    transition: opacity 0.5s ease;
                    opacity: 0.2;
                }
                .combined-swiper .swiper-slide-active {
                    opacity: 1;
                }
            `}</style>

            <div className="container mx-auto px-6 mb-12">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-sm font-bold tracking-widest text-dancheong-red mb-3 uppercase">Culture & Events</h2>
                    <h3 className="text-3xl md:text-5xl font-serif font-bold text-white mb-2">
                        <AutoTranslatedText text="이달의 문화 일정 & 추천 이벤트" />
                    </h3>
                </motion.div>
            </div>

            <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                {/* Left side: Calendar (4 cols) */}
                <div className="lg:col-span-4 space-y-6 relative z-20">
                    <div className="bg-charcoal/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-white font-serif italic text-lg flex items-center gap-2">
                                <CalendarIcon size={18} className="text-dancheong-red" />
                                March 2026
                            </h4>
                            <div className="text-white/40 text-xs font-medium">SELECT A DATE</div>
                        </div>

                        <div className="grid grid-cols-7 gap-1 md:gap-2">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                                <div key={day} className="text-[10px] font-bold text-white/20 text-center pb-2">
                                    {day}
                                </div>
                            ))}
                            {Array.from({ length: startDayOffset }).map((_, i) => (
                                <div key={`empty-${i}`} />
                            ))}
                            {days.map(day => {
                                const dateStr = `2026-03-${day.toString().padStart(2, '0')}`;
                                const isSelected = selectedDate === dateStr;
                                const hasEvents = products.some(p => p.eventDates?.includes(dateStr));

                                return (
                                    <button
                                        key={day}
                                        onClick={() => handleDateClick(day)}
                                        className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-300 relative ${isSelected
                                            ? 'bg-dancheong-red text-white shadow-[0_0_15px_rgba(196,48,43,0.4)] scale-110 z-10'
                                            : hasEvents
                                                ? 'bg-white/10 text-white hover:bg-white/20'
                                                : 'bg-white/5 text-white/20 hover:bg-white/10'
                                            }`}
                                    >
                                        {day}
                                        {hasEvents && !isSelected && (
                                            <span className="absolute bottom-1 w-1 h-1 bg-dancheong-red rounded-full" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5">
                            <div className="flex items-center gap-4 text-xs text-white/40">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-dancheong-red rounded-full" />
                                    <span>Selected</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-white/20 rounded-full" />
                                    <span>Events</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side: Filtered Events (8 cols) */}
                {/* Right side: Event Slider (8 cols) */}
                <div className="lg:col-span-8 min-h-[400px] relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div className="space-y-1">
                            <h4 className="text-xl font-bold text-white">
                                {selectedDate ? (
                                    <span className="flex items-center gap-2">
                                        {selectedDate.replace(/-/g, '.')}
                                        <span className="text-sm font-normal text-white/40 italic">Scheduled Events</span>
                                    </span>
                                ) : (
                                    <AutoTranslatedText text="추천 이벤트" />
                                )}
                            </h4>
                            <p className="text-dancheong-red text-xs font-medium tracking-widest uppercase">
                                {filteredProducts.length} {filteredProducts.length === 1 ? 'Event' : 'Events'} FOUND
                            </p>
                        </div>
                        <Link
                            to="/all-products"
                            className="text-white/30 hover:text-dancheong-red text-xs tracking-widest font-medium transition-colors flex items-center gap-1 group"
                        >
                            {t('common.view_all')}
                            <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Link>
                    </div>

                    <div className="relative">
                        <AnimatePresence mode="wait">
                            {filteredProducts.length > 0 ? (
                                <motion.div
                                    key={selectedDate}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <Swiper
                                        modules={[Navigation, Keyboard, Autoplay, EffectCoverflow]}
                                        effect="coverflow"
                                        coverflowEffect={{
                                            rotate: 25,
                                            stretch: -15,
                                            depth: 150,
                                            modifier: 1,
                                            slideShadows: false,
                                            scale: 0.88,
                                        }}
                                        slidesPerView={1.5}
                                        centeredSlides={true}
                                        spaceBetween={0}
                                        loop={filteredProducts.length > 0}
                                        breakpoints={{
                                            768: { slidesPerView: 2.5 },
                                            1024: { slidesPerView: 3.5 },
                                            1440: { slidesPerView: 4.5 },
                                        }}
                                        navigation={{
                                            prevEl: '.comb-prev',
                                            nextEl: '.comb-next',
                                        }}
                                        className="combined-swiper"
                                    >
                                        {[...filteredProducts, ...filteredProducts, ...filteredProducts].map((item, index) => (
                                            <SwiperSlide key={`${item.id}-${index}`}>
                                                <Link to={`/detail/${item.id}`} className="block group h-full">
                                                    <div className="relative aspect-[9/16] rounded-xl overflow-hidden shadow-2xl border border-white/5 group-hover:border-dancheong-red/30 transition-all duration-500 bg-charcoal">
                                                        {/* Image */}
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={getLocalizedText(item.title, i18n.language)}
                                                            className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
                                                        />

                                                        {/* Overlay Gradient */}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

                                                        {/* Category Tag */}
                                                        <div className="absolute top-3 left-3 z-10">
                                                            <div className="bg-dancheong-red/90 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg">
                                                                {item.category}
                                                            </div>
                                                        </div>

                                                        {/* Text Content Overlay */}
                                                        <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col justify-end z-10">
                                                            <motion.div
                                                                initial={false}
                                                                className="space-y-2"
                                                            >
                                                                <h4 className="text-sm md:text-base font-bold text-white leading-tight group-hover:text-dancheong-red transition-colors duration-300">
                                                                    <AutoTranslatedText text={getLocalizedText(item.title, i18n.language)} />
                                                                </h4>

                                                                <p className="text-white/50 text-[10px] line-clamp-2 leading-tight h-7">
                                                                    <AutoTranslatedText text={getLocalizedText(item.description, i18n.language)} />
                                                                </p>

                                                                <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                                                                    <div className="space-y-0.5">
                                                                        <div className="text-[8px] text-white/30 uppercase tracking-widest font-bold">Schedule</div>
                                                                        <div className="text-[10px] text-dancheong-red font-bold tracking-tight">
                                                                            {getLocalizedText(item.date, i18n.language)}
                                                                        </div>
                                                                    </div>

                                                                    <div className="w-7 h-7 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center group-hover:bg-dancheong-red group-hover:scale-110 transition-all duration-300 shadow-lg">
                                                                        <ArrowUpRight className="text-white" size={14} />
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        </div>

                                                        {/* Hover Glow Effect */}
                                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-dancheong-red transition-opacity duration-700 pointer-events-none" />
                                                    </div>
                                                </Link>
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>

                                    {/* Navigation Buttons */}
                                    {filteredProducts.length > 1 && (
                                        <div className="absolute -bottom-2 left-0 right-0 flex justify-center gap-4 z-10">
                                            <button className="comb-prev w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-white/40 hover:text-white hover:border-white/40 transition-all">
                                                <ChevronLeft size={18} />
                                            </button>
                                            <button className="comb-next w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-white/40 hover:text-white hover:border-white/40 transition-all">
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="h-[400px] flex flex-col items-center justify-center text-center space-y-4 bg-charcoal/20 rounded-2xl border border-dashed border-white/10"
                                >
                                    <CalendarIcon size={48} className="text-white/5" />
                                    <div className="space-y-2">
                                        <p className="text-white/40 font-serif italic text-lg leading-relaxed">
                                            No events scheduled for this date.<br />
                                            Please select another date on the calendar.
                                        </p>
                                        <button
                                            onClick={() => setSelectedDate('2026-03-05')}
                                            className="text-dancheong-red text-xs font-bold tracking-widest uppercase hover:underline"
                                        >
                                            Show all events
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
};
