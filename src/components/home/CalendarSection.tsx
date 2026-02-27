import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCalendarEvents } from '../../api/events';
import { CalendarEvent } from '../../types';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../../utils/i18nUtils';
import { AutoTranslatedText } from '../common/AutoTranslatedText';

export const CalendarSection: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
    const [events, setEvents] = useState<CalendarEvent[]>([]);

    useEffect(() => {
        let mounted = true;
        const fetchEvents = async () => {
            try {
                const data = await getCalendarEvents();
                if (mounted) setEvents(data);
            } catch (error) {
                console.error("Error fetching events", error);
            }
        };
        fetchEvents();
        return () => { mounted = false; };
    }, []);

    // 가상의 3월 달력 데이터 생성 (2026년 3월은 일요일부터 시작한다고 가정)
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const startDayOffset = 0; // 0: Sun, 1: Mon, ...

    const getEventForDay = (day: number) => {
        const dateStr = `2026-03-${day.toString().padStart(2, '0')}`;
        return events.find(ev => ev.date === dateStr);
    };

    return (
        <section className="h-screen w-full snap-start bg-black relative flex flex-col justify-center overflow-hidden">
            <div className="container mx-auto px-6 mb-12 flex justify-between items-end">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-sm font-bold tracking-widest text-dancheong-red mb-3 uppercase">Culture Timeline</h2>
                    <h3 className="text-3xl md:text-5xl font-serif font-bold text-white mb-2">
                        {t('calendar.title', '이달의 문화 달력')}
                    </h3>
                    <p className="text-white/40 text-sm md:text-base font-serif italic">March 2026</p>
                </motion.div>
            </div>

            <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 md:gap-4 max-w-xl mx-auto lg:mx-0">
                    {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                        <div key={day} className="text-[10px] md:text-xs font-bold text-white/30 text-center pb-2">
                            {day}
                        </div>
                    ))}
                    {Array.from({ length: startDayOffset }).map((_, i) => (
                        <div key={`empty-${i}`} />
                    ))}
                    {days.map(day => {
                        const event = getEventForDay(day);
                        return (
                            <motion.button
                                key={day}
                                onClick={() => event && setSelectedEvent(event.id)}
                                whileHover={{ scale: 1.1 }}
                                className={`aspect-square rounded-lg flex items-center justify-center text-sm md:text-lg font-medium transition-all duration-300 relative ${event
                                    ? 'bg-dancheong-red text-white shadow-[0_0_20px_rgba(196,48,43,0.3)]'
                                    : 'bg-white/5 text-white/20 hover:bg-white/10'
                                    } ${selectedEvent === event?.id ? 'ring-2 ring-white scale-110' : ''}`}
                            >
                                {day}
                                {event && (
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-pulse" />
                                )}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Event Detail Preview */}
                <div className="h-[400px] flex items-center justify-center relative">
                    <AnimatePresence mode="wait">
                        {selectedEvent ? (
                            <motion.div
                                key={selectedEvent}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="w-full max-w-md bg-charcoal/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                            >
                                <div className="aspect-video relative overflow-hidden">
                                    <img
                                        src={getEventForDay(Number(events.find(e => e.id === selectedEvent)?.date.split('-')[2]))?.imageUrl}
                                        alt="event"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal to-transparent" />
                                </div>
                                <div className="p-8">
                                    <span className="text-xs font-bold text-dancheong-red uppercase tracking-widest mb-2 block">
                                        {events.find(e => e.id === selectedEvent)?.date}
                                    </span>
                                    <h4 className="text-2xl font-serif font-bold text-white mb-4">
                                        <AutoTranslatedText text={getLocalizedText(events.find(e => e.id === selectedEvent)!.title, i18n.language)} />
                                    </h4>
                                    <p className="text-white/60 text-sm leading-relaxed">
                                        {t('calendar.event_desc', '선정된 일자에 진행되는 특별한 문화 행사를 놓치지 마세요.')}
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center"
                            >
                                <div className="w-20 h-20 border-2 border-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <div className="w-10 h-[1px] bg-white/10 rotate-45" />
                                </div>
                                <p className="text-white/20 font-serif italic">{t('calendar.hover_hint', '날짜를 선택해 보세요')}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
};
