import React, { useEffect, useState, useRef, useMemo } from 'react';
import { AutoTranslatedText } from '../common/AutoTranslatedText';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { getFeaturedProducts } from '../../api/products';
import { getCalendarEvents } from '../../api/events';
import { FeaturedItem, CalendarEvent } from '../../types';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../../utils/i18nUtils';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

export const FeaturedSection: React.FC = () => {
    const [products, setProducts] = useState<FeaturedItem[]>([]);
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    
    // 달력 표시 기준이 되는 날짜 (월 변경용)
    const [targetDate, setTargetDate] = useState<Date>(new Date());
    // 선택된 특정 일수 번호 (해당 월 내에서)
    const [selectedDate, setSelectedDate] = useState<number | null>(null);
    
    // 네이티브 Date Picker를 트리거하기 위한 참조
    const dateInputRef = useRef<HTMLInputElement>(null);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { t, i18n } = useTranslation();

    useEffect(() => {
        let mounted = true;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [productsData, eventsData] = await Promise.all([
                    getFeaturedProducts(),
                    getCalendarEvents()
                ]);

                if (mounted) {
                    setProducts(productsData || []);
                    setCalendarEvents(eventsData || []);
                }
            } catch (err: any) {
                if (mounted) {
                    setError(err.message || '데이터를 불러오지 못했습니다.');
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();
        return () => { mounted = false; };
    }, []);

    // 동적 달력 구성 및 상태 기반 계산
    const currentYear = targetDate.getFullYear();
    const currentMonth = targetDate.getMonth(); // 0-based
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const startDayOffset = new Date(currentYear, currentMonth, 1).getDay(); // 0(일) ~ 6(토)
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const currentMonthStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}`;

    const generatedEvents = useMemo(() => {
        const events: CalendarEvent[] = [];
        const todayStr = new Date().toLocaleDateString('en-CA');
        const images = [
            'https://images.unsplash.com/photo-1540575861501-7c00117fb3c9?q=80&w=2670&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=2673&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2670&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=2574&auto=format&fit=crop'
        ];
        
        for (let baseDay = 1; baseDay <= daysInMonth; baseDay += 5) { // 5일 간격으로 이벤트 하나씩 생성
            const pseudoRandom = (baseDay * currentMonth * currentYear * 17) % 100;
            
            if (pseudoRandom < 80) { // 확률 80% 로 배치
                const startDay = baseDay;
                
                // 이벤트 기간을 한 달로 설정
                const startDateObj = new Date(currentYear, currentMonth, startDay);
                const endDateObj = new Date(currentYear, currentMonth + 1, startDay); // 정확히 1달 뒤
                
                const dateStr = `${startDateObj.getFullYear()}-${(startDateObj.getMonth() + 1).toString().padStart(2, '0')}-${startDateObj.getDate().toString().padStart(2, '0')}`;
                const endDateStr = `${endDateObj.getFullYear()}-${(endDateObj.getMonth() + 1).toString().padStart(2, '0')}-${endDateObj.getDate().toString().padStart(2, '0')}`;
                
                let titleStr = '';
                let cat = 'EVENT';
                
                // 오늘 날짜(`todayStr`)를 기준으로 이벤트 상태 판단
                if (endDateStr < todayStr) {
                    titleStr = `종료된 아카이브 전시`;
                    cat = 'ARCHIVE';
                } else if (dateStr > todayStr) {
                    titleStr = `오픈 예정 특별 공연`;
                    cat = 'UPCOMING';
                } else {
                    titleStr = `진행 중인 특별 기획전`;
                    cat = 'ONGOING';
                }

                events.push({
                    id: `dummy-${currentMonthStr}-${startDay}`,
                    date: dateStr,
                    endDate: endDateStr,
                    title: { ko: titleStr, en: titleStr },
                    category: cat,
                    imageUrl: images[startDay % images.length]
                });
            }
        }
        return events;
    }, [currentYear, currentMonth, currentMonthStr, daysInMonth]);

    const handlePrevMonth = () => {
        setTargetDate(new Date(currentYear, currentMonth - 1, 1));
        setSelectedDate(null); // 월 변경 시 선택 초기화
    };

    const handleNextMonth = () => {
        setTargetDate(new Date(currentYear, currentMonth + 1, 1));
        setSelectedDate(null); // 월 변경 시 선택 초기화
    };

    const getEventsForDay = (day: number) => {
        const currentTargetDateStr = `${currentMonthStr}-${day.toString().padStart(2, '0')}`;
        
        // 목 데이터와 생성된 랜덤 데이터를 합쳐서 반환
        const allEvents = [...calendarEvents, ...generatedEvents];

        return allEvents.filter(ev => {
            const startDate = ev.date; // 형식은 YYYY-MM-DD
            const endDate = ev.endDate || ev.date; // endDate가 없으면 startDate가 endDate와 같음
            
            // 문자열 비교 (YYYY-MM-DD 포맷이라 정렬 순서대로 안전하게 비교 가능)
            return currentTargetDateStr >= startDate && currentTargetDateStr <= endDate;
        });
    };

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
                <div className="text-red-500 mb-4 font-bold">오류가 발생했습니다: {error}</div>
            </section>
        );
    }

    // 우측 영역에 보여줄 배너 데이터 결정 로직
    // 선택된 날짜에 이벤트가 있으면 해당 이벤트(들을) 우선 표시, 없으면 products(추천) 표시
    const activeEventsToDisplay = selectedDate && getEventsForDay(selectedDate).length > 0
        ? getEventsForDay(selectedDate).map(ev => {
            const safeDate = ev.date || '';
            const safeEndDate = ev.endDate || ev.date || '';
            
            const [year, month, day] = safeDate.includes('-') ? safeDate.split('-') : [safeDate, '', ''];
            const [endYear, endMonth, endDay] = safeEndDate.includes('-') ? safeEndDate.split('-') : [safeEndDate, '', ''];
            
            let dateStr = safeDate;
            if (year && month && day) {
                dateStr = endYear && endYear !== year ? `${year}.${month}.${day} - ${endYear}.${endMonth}.${endDay}` :
                    (endMonth && endMonth !== month) || (endDay && endDay !== day) ? `${year}.${month}.${day} - ${endMonth}.${endDay}` :
                        `${year}.${month}.${day}`;
            }
            return {
                id: ev.id,
                title: ev.title,
                category: ev.category,
                imageUrl: ev.imageUrl || '',
                description: { ko: '선택하신 일자에 진행되는 특별 문화 행사입니다.', en: 'Special cultural event for the selected date.' },
                date: { ko: dateStr, en: dateStr }
            } as unknown as FeaturedItem;
        })
        : products;

    return (
        <section className="h-[100dvh] w-full snap-start bg-[#2a2a2a] relative flex flex-col justify-center overflow-hidden pt-24 pb-12 min-h-[700px]">
            <style>{`
                .event-swiper .swiper-button-next,
                .event-swiper .swiper-button-prev {
                    color: white !important;
                    background: transparent !important;
                }
                .event-swiper .swiper-button-next:after,
                .event-swiper .swiper-button-prev:after {
                    font-size: 16px;
                }
                
                /* 숫자형 커스텀 페이지네이션 스타일 */
                .event-swiper .swiper-pagination-fraction {
                    bottom: 24px !important;
                    left: 50% !important;
                    right: auto !important;
                    transform: translateX(-50%) !important;
                    width: max-content !important;
                    font-size: 14px;
                    font-weight: 500;
                    letter-spacing: 2px;
                    background: rgba(0,0,0,0.5);
                    padding: 4px 12px;
                    border-radius: 20px;
                    color: rgba(255,255,255,0.5); /* 전체 페이지 수 색상 (연한 흰색) */
                }
                .event-swiper .swiper-pagination-current {
                    color: #ffffff; /* 현재 페이지 색상 (강조 흰색) */
                    font-weight: 700;
                }
            `}</style>

            <div className="container mx-auto px-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 shrink-0">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-sm font-bold tracking-widest text-dancheong-red mb-3 uppercase flex items-center gap-2">
                        <CalendarIcon size={16} /> Promotion & Events
                    </h2>
                    <h3 className="text-3xl md:text-5xl font-serif font-bold text-white mb-2">
                        <AutoTranslatedText text="추천 & 이벤트" />
                    </h3>
                </motion.div>
                
                {selectedDate && (
                    <motion.button 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        onClick={() => setSelectedDate(null)}
                        className="text-sm border border-white/20 px-4 py-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition"
                    >
                        전체 추천 보기
                    </motion.button>
                )}
            </div>

            <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-stretch flex-1 min-h-0">
                
                {/* 1. 좌측: 이벤트 달력 세팅 */}
                <div className="lg:col-span-5 bg-black/40 border border-white/5 rounded-[2rem] p-6 lg:p-10 shadow-2xl backdrop-blur-sm flex flex-col justify-center gap-6">
                    <div className="flex justify-between items-center shrink-0 border-b border-white/10 pb-4">
                        <div 
                            className="relative flex items-center group cursor-pointer"
                            onClick={() => {
                                if (dateInputRef.current) {
                                    try { dateInputRef.current.showPicker(); } catch(e) {}
                                }
                            }}
                        >
                            <h4 className="text-xl font-serif font-bold text-white group-hover:text-dancheong-red transition-colors">
                                {`${currentYear}년 ${currentMonth + 1}월`}
                            </h4>
                            <input 
                                ref={dateInputRef}
                                type="date"
                                value={`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${selectedDate ? String(selectedDate).padStart(2, '0') : '01'}`}
                                onChange={(e) => {
                                    if (e.target.value) {
                                        const [year, month, day] = e.target.value.split('-');
                                        setTargetDate(new Date(parseInt(year), parseInt(month) - 1, 1));
                                        setSelectedDate(parseInt(day));
                                    }
                                }}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full [color-scheme:dark]"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handlePrevMonth} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white transition cursor-pointer">
                                <ChevronLeft size={16}/>
                            </button>
                            <button onClick={handleNextMonth} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white transition cursor-pointer">
                                <ChevronRight size={16}/>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-y-2 md:gap-y-4 gap-x-2 text-center flex-grow content-start">
                        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                            <div key={day} className="text-[10px] md:text-sm font-bold text-white/30 pb-2">
                                {day}
                            </div>
                        ))}
                        {Array.from({ length: startDayOffset }).map((_, i) => (
                            <div key={`empty-${i}`} />
                        ))}
                        {days.map(day => {
                            const dayEvents = getEventsForDay(day);
                            const hasEvents = dayEvents.length > 0;
                            const isSelected = selectedDate === day;
                            
                            let markerColor = 'bg-white/0'; // default (no marker)
                            
                            if (hasEvents) {
                                const todayStr = new Date().toLocaleDateString('en-CA');
                                const hasOngoing = dayEvents.some(ev => ev.date <= todayStr && (ev.endDate || ev.date) >= todayStr);
                                const hasUpcoming = dayEvents.some(ev => ev.date > todayStr);
                                
                                if (hasOngoing) markerColor = 'bg-blue-500';
                                else if (hasUpcoming) markerColor = 'bg-green-500';
                                else markerColor = 'bg-red-500';
                            }

                            return (
                                <motion.button
                                    key={day}
                                    onClick={() => setSelectedDate(day)}
                                    whileHover={{ scale: 1.1 }}
                                    className={`aspect-square w-full rounded-full flex flex-col items-center justify-center text-sm md:text-lg font-medium transition-all duration-300 relative 
                                        ${isSelected ? 'bg-dancheong-red text-white shadow-[0_0_15px_rgba(196,48,43,0.5)]' : 'hover:bg-white/10 text-white/70'}
                                    `}
                                >
                                    <span>{day}</span>
                                    {hasEvents && !isSelected && (
                                        <span className={`absolute bottom-2 w-1.5 h-1.5 ${markerColor} rounded-full`} />
                                    )}
                                    {hasEvents && isSelected && (
                                        <span className="absolute bottom-1 w-1.5 h-1.5 bg-white rounded-full" />
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* 2. 우측: 이벤트 배너 목록 */}
                <div className="lg:col-span-7 min-h-0 flex flex-col">
                    <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-4 mb-4 gap-4 md:gap-0">
                        <h4 className="text-base md:text-lg font-bold text-white flex-shrink-0">
                            <span>{selectedDate ? `${currentMonthStr.split('-')[0]}년 ${currentMonthStr.split('-')[1]}월 ${selectedDate}일 진행 이벤트` : '이달의 주요 추천 목록'}</span>
                            <span className="text-white/40 font-normal text-xs md:text-sm ml-3">{activeEventsToDisplay.length}개의 항목</span>
                        </h4>
                        
                        {/* 마커 색상 범례 (Legend) */}
                        <div className="flex items-center gap-4 text-xs font-medium text-white/60 bg-white/5 px-3 py-1.5 rounded-full shrink-0 w-fit">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                <span>진행 중</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <span>오픈 예정</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                <span>종료 됨</span>
                            </div>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedDate || 'all'}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="flex-grow rounded-2xl overflow-hidden shadow-2xl relative"
                        >
                            {activeEventsToDisplay.length > 0 ? (
                                <Swiper
                                    modules={[Navigation, Pagination, Autoplay, EffectFade]}
                                    effect="fade"
                                    slidesPerView={1}
                                    loop={activeEventsToDisplay.length > 1}
                                    autoplay={{ delay: 4000, disableOnInteraction: false }}
                                    navigation={activeEventsToDisplay.length > 1}
                                    pagination={{ 
                                        type: 'fraction',
                                        renderFraction: function (currentClass, totalClass) {
                                            return '<span class="' + currentClass + '"></span>' +
                                                   ' / ' +
                                                   '<span class="' + totalClass + '"></span>';
                                        }
                                    }}
                                    className="event-swiper w-full h-full rounded-[2rem]"
                                >
                                    {activeEventsToDisplay.map((item, idx) => (
                                        <SwiperSlide key={`${item.id}-${idx}`} className="h-full">
                                            <div className="relative w-full h-full">
                                                {item.imageUrl ? (
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={getLocalizedText(item.title, i18n.language) || 'Event Image'}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-[#1a1a1a] flex flex-col items-center justify-center text-white/30">
                                                        <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                                        </svg>
                                                        <span className="text-sm font-medium tracking-wide">이미지 등록 예정</span>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                                <div className="absolute bottom-0 left-0 w-full p-6 md:p-8">
                                                    <span className="px-3 py-1 bg-dancheong-red rounded-full text-[10px] md:text-xs font-bold text-white mb-3 inline-block">
                                                        {item.category || 'EVENT'}
                                                    </span>
                                                    <h4 className="text-xl md:text-3xl font-bold text-white mb-2 line-clamp-1 md:line-clamp-2">
                                                        <AutoTranslatedText text={getLocalizedText(item.title, i18n.language)} />
                                                    </h4>
                                                    <p className="text-white/70 text-sm md:text-base line-clamp-1 md:line-clamp-2 mb-4 max-w-xl">
                                                        <AutoTranslatedText text={getLocalizedText(item.description, i18n.language) || '이벤트에 대한 상세 정보가 없습니다.'} />
                                                    </p>
                                                    
                                                    <div className="flex justify-between items-center text-xs md:text-sm font-medium pt-3 border-t border-white/20">
                                                        <div className="flex flex-col gap-1 text-white/60">
                                                            <span>📅 {getLocalizedText(item.date, i18n.language)}</span>
                                                            {item.location && <span>📍 {getLocalizedText(item.location, i18n.language)}</span>}
                                                        </div>
                                                        <Link to={`/detail/${item.id}`} className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                                                            <ArrowUpRight size={20} />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            ) : (
                                <div className="w-full h-full min-h-[250px] flex flex-col items-center justify-center bg-black/20 rounded-[2rem] border border-white/5">
                                    <CalendarIcon size={48} className="text-white/20 mb-4" />
                                    <p className="text-white/40 text-lg">해당 날짜에 진행 예정인 일정이 없습니다.</p>
                                    <button onClick={() => setSelectedDate(null)} className="mt-6 text-dancheong-red hover:underline text-sm font-bold tracking-widest uppercase">
                                        추천 목록 보기
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
};
