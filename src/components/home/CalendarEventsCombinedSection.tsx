import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFeaturedProducts } from '../../api/products';
import { FeaturedItem } from '../../types';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../../utils/i18nUtils';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles } from 'lucide-react';

export const CalendarEventsCombinedSection: React.FC = () => {
    const { i18n } = useTranslation();
    const [products, setProducts] = useState<FeaturedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Current displayed month in calendar
    const [currentMonth, setCurrentMonth] = useState<Date>(() => {
        const d = new Date();
        d.setDate(1);
        return d;
    });

    const handlePrevMonth = () => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() - 1);
            return newDate;
        });
    };

    const handleNextMonth = () => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + 1);
            return newDate;
        });
    };

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
    const year = currentMonth.getFullYear();
    const monthIndex = currentMonth.getMonth();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const startDayOffset = new Date(year, monthIndex, 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentMonthName = monthNames[monthIndex];

    const handleDateClick = (day: number) => {
        const m = (monthIndex + 1).toString().padStart(2, '0');
        const d = day.toString().padStart(2, '0');
        const dateStr = `${year}-${m}-${d}`;
        setSelectedDate(dateStr);
    };

    const filteredProducts = useMemo(() => {
        if (!selectedDate) return products;
        return products.filter(p => p.eventDates?.includes(selectedDate));
    }, [products, selectedDate]);

    if (loading) {
        return (
            <section className="w-full h-[60vh] bg-dancheong-deep-bg flex items-center justify-center">
                <div className="w-12 h-[1px] bg-dancheong-border animate-pulse" />
            </section>
        );
    }

    return (
        <section className="w-full bg-dancheong-deep-bg relative py-20 overflow-hidden flex flex-col justify-center">
            {/* Ambient Background Grid - Dancheong Tinted */}
            <div className="absolute inset-0 z-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, rgba(74, 93, 78, 0.4) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <div className="lossless-layout relative z-10 mb-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-8"
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Sparkles size={14} className="text-dancheong-yellow/40" />
                            <span className="text-xs font-bold tracking-[0.5em] text-white/40 uppercase"><AutoTranslatedText text="Celestial Schedule" /></span>
                        </div>
                        <h2 className="text-4xl md:text-7xl font-serif font-black text-white tracking-tighter leading-none">
                            <span className="block opacity-20 font-light italic mb-2"><AutoTranslatedText text="기록된 아름다움" /></span>
                            <AutoTranslatedText text="영감의 타임라인" />
                        </h2>
                    </div>

                    <Link to="/all-products" className="group flex items-center gap-4 text-[10px] font-bold tracking-[0.4em] text-white/40 hover:text-white transition-colors uppercase">
                        <AutoTranslatedText text="View Archive" />
                        <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Link>
                </motion.div>
            </div>

            <div className="lossless-layout relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16">

                {/* Left: Celestial Calendar Grid */}
                <div className="lg:col-span-4 space-y-10">
                    <div className="bg-dancheong-deep-bg/40 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-dancheong-border relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-dancheong-teal/5 rounded-bl-full blur-3xl pointer-events-none" />

                        <div className="flex items-center justify-between mb-10">
                            <div className="space-y-1">
                                <h4 className="text-white font-serif italic text-2xl flex items-center gap-3">
                                    <AutoTranslatedText text={currentMonthName} /> <span className="text-white/20 not-italic font-sans text-lg">{year}</span>
                                </h4>
                                <p className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase"><AutoTranslatedText text="Monthly Cycle" /></p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handlePrevMonth} className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-full border border-dancheong-border text-white/40 hover:text-white transition-all">
                                    <ChevronLeft size={16} />
                                </button>
                                <button onClick={handleNextMonth} className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-full border border-dancheong-border text-white/40 hover:text-white transition-all">
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                                <div key={idx} className="text-[9px] font-black text-white/20 text-center py-2">{day}</div>
                            ))}
                            {Array.from({ length: startDayOffset }).map((_, i) => <div key={i} />)}
                            {days.map(day => {
                                const m = (monthIndex + 1).toString().padStart(2, '0');
                                const d = day.toString().padStart(2, '0');
                                const dateStr = `${year}-${m}-${d}`;
                                const isSelected = selectedDate === dateStr;
                                const hasEvents = products.some(p => p.eventDates?.includes(dateStr));

                                return (
                                    <button
                                        key={day}
                                        onClick={() => handleDateClick(day)}
                                        className={`aspect-square flex flex-col items-center justify-center rounded-xl transition-all duration-500 relative group/btn
                                            ${isSelected ? 'bg-white text-black scale-110 z-10 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'hover:bg-white/5 text-white/40'}`}
                                    >
                                        <span className={`text-[11px] font-bold ${isSelected ? 'opacity-100' : 'opacity-60'}`}>{day}</span>
                                        {hasEvents && !isSelected && (
                                            <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-dancheong-red/60 rounded-full" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right: Event Timeline (Horizontal Scroll) */}
                <div className="lg:col-span-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedDate}
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            className="space-y-12"
                        >
                            <div className="space-y-2 px-1">
                                <h4 className="text-2xl font-serif font-bold text-white italic">
                                    {selectedDate ? selectedDate.replace(/-/g, '. ') : <AutoTranslatedText text="Featured Inspiration" />}
                                </h4>
                                <p className="text-[10px] font-bold tracking-[0.4em] text-white/20 uppercase">
                                    <AutoTranslatedText text={`${filteredProducts.length} Events Detected`} />
                                </p>
                            </div>

                            <div
                                ref={scrollRef}
                                className="flex gap-8 overflow-x-auto pb-12 px-1 scrollbar-hide snap-x"
                            >
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((item, idx) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="min-w-[280px] md:min-w-[340px] snap-start"
                                        >
                                            <Link to={`/detail/${item.id}`} className="group block space-y-6">
                                                <div className="aspect-[3/4] rounded-[2rem] overflow-hidden border border-dancheong-border group-hover:border-white/20 transition-all duration-500 relative bg-dancheong-deep-bg">
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={getLocalizedText(item.title, i18n.language)}
                                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-dancheong-deep-bg via-transparent to-transparent group-hover:opacity-60 transition-opacity" />

                                                    <div className="absolute top-6 left-6 flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-dancheong-yellow/60 rounded-full animate-pulse" />
                                                        <span className="text-[9px] font-bold tracking-widest text-white uppercase">{item.category}</span>
                                                    </div>
                                                </div>

                                                <div className="space-y-3 px-2 text-left">
                                                    <h3 className="text-xl font-serif font-bold text-white group-hover:text-white/80 transition-colors">
                                                        <AutoTranslatedText text={getLocalizedText(item.title, i18n.language)} />
                                                    </h3>
                                                    <p className="text-sm text-white/40 font-light italic line-clamp-1">
                                                        <AutoTranslatedText text={getLocalizedText(item.description, i18n.language)} />
                                                    </p>
                                                    <div className="flex items-center gap-4 text-[9px] font-bold tracking-[0.3em] text-white/20 uppercase pt-4 border-t border-dancheong-border">
                                                        <span><AutoTranslatedText text="Event Date" /></span>
                                                        <span className="text-dancheong-teal/60"><AutoTranslatedText text={getLocalizedText(item.date, i18n.language)} /></span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="w-full aspect-[16/6] bg-dancheong-deep-bg/20 rounded-[3rem] border border-dashed border-dancheong-border flex flex-col items-center justify-center space-y-6">
                                        <CalendarIcon size={40} className="text-dancheong-border" />
                                        <p className="text-white/20 font-serif italic text-xl"><AutoTranslatedText text="이날은 고요한 여백의 시간입니다." /></p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
};
