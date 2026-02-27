import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { getFeaturedProducts } from '../../api/products';
import { getCalendarEvents } from '../../api/events';
import { FeaturedItem, CalendarEvent } from '../../types';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../../utils/i18nUtils';



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
    const [eventCategory, setEventCategory] = useState<'ONGOING' | 'UPCOMING' | 'ARCHIVE'>('ONGOING');
    const [showAll, setShowAll] = useState(false);
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
                    setError(err.message || t('common.error', '오류가 발생했습니다.'));
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
        const todayObj = new Date();
        const todayStr = todayObj.toLocaleDateString('en-CA');
        const images = [
            'https://images.unsplash.com/photo-1540575861501-7c00117fb3c9?q=80&w=2670&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=2673&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2670&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=2574&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2671&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=2574&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=2680&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1545987796-200d7b122a92?q=80&w=2670&auto=format&fit=crop'
        ];
        // 현재 월 + 이전/다음 월에서 이벤트를 생성하여 각 카테고리에 충분한 데이터 확보
        for (let monthOffset = -1; monthOffset <= 1; monthOffset++) {
            const targetDate = new Date(currentYear, currentMonth + monthOffset, 1);
            const targetYear = targetDate.getFullYear();
            const targetMonth = targetDate.getMonth();
            const targetDaysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
            
            for (let baseDay = 2; baseDay <= targetDaysInMonth; baseDay += 3) {
                const pseudoRandom = ((baseDay + 1) * (targetMonth + 3) * (targetYear % 100 + 7) * 17) % 100;
            
            if (pseudoRandom < 70) {
                const startDay = baseDay;
                const duration = (pseudoRandom % 16) + 20; // 20~35일 (약 한 달)
                
                const startDateObj = new Date(targetYear, targetMonth, startDay);
                const endDateObj = new Date(targetYear, targetMonth, startDay + duration); 
                
                const dateStr = `${startDateObj.getFullYear()}-${(startDateObj.getMonth() + 1).toString().padStart(2, '0')}-${startDateObj.getDate().toString().padStart(2, '0')}`;
                const endDateStr = `${endDateObj.getFullYear()}-${(endDateObj.getMonth() + 1).toString().padStart(2, '0')}-${endDateObj.getDate().toString().padStart(2, '0')}`;
                
                let titleStr = '';
                let descStr = '';
                let cat = 'EVENT';
                
                if (endDateStr < todayStr) {
                    titleStr = t('featured.event_archived', '종료된 이벤트');
                    descStr = t('featured.event_archived_desc', '이미 종료된 이벤트입니다.');
                    cat = 'ARCHIVE';
                } else if (dateStr > todayStr) {
                    titleStr = t('featured.event_upcoming', '진행 예정 이벤트');
                    descStr = t('featured.event_upcoming_desc', '곧 만나볼 수 있는 특별한 이벤트입니다.');
                    cat = 'UPCOMING';
                } else {
                    titleStr = t('featured.event_ongoing', '진행 중인 이벤트');
                    descStr = t('featured.event_ongoing_desc', '현재 진행 중인 특별한 이벤트입니다.');
                    cat = 'ONGOING';
                }

                events.push({
                    id: `dummy-${targetYear}-${(targetMonth+1).toString().padStart(2,'0')}-${startDay}`,
                    date: dateStr,
                    endDate: endDateStr,
                    title: titleStr,
                    description: descStr,
                    category: cat,
                    imageUrl: images[(startDay + monthOffset + 5) % images.length]
                });
            }
            }
        }

        // 현재 날짜를 포함하는 "진행중" 이벤트 랜덤 추가 (파란색 마커)
        if (currentYear === todayObj.getFullYear() && currentMonth === todayObj.getMonth()) {
            const todayDay = todayObj.getDate();
            const ongoingDays = [todayDay, Math.max(1, todayDay - 2), Math.min(daysInMonth, todayDay + 3)];
            const uniqueDays = [...new Set(ongoingDays)];
            uniqueDays.forEach((d, idx) => {
                const startD = Math.max(1, d - 1);
                const endD = Math.min(daysInMonth, d + 2);
                const sObj = new Date(currentYear, currentMonth, startD);
                const eObj = new Date(currentYear, currentMonth, endD);
                const sStr = `${sObj.getFullYear()}-${(sObj.getMonth()+1).toString().padStart(2,'0')}-${sObj.getDate().toString().padStart(2,'0')}`;
                const eStr = `${eObj.getFullYear()}-${(eObj.getMonth()+1).toString().padStart(2,'0')}-${eObj.getDate().toString().padStart(2,'0')}`;
                events.push({
                    id: `ongoing-${currentMonthStr}-${d}-${idx}`,
                    date: sStr,
                    endDate: eStr,
                    title: t('featured.event_ongoing', '진행 중인 이벤트'),
                    description: t('featured.event_ongoing_desc', '현재 진행 중인 특별한 이벤트입니다.'),
                    category: 'ONGOING',
                    imageUrl: images[d % images.length]
                });
            });
        }

        return events;
    }, [currentYear, currentMonth, currentMonthStr, daysInMonth, t]);

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

    // 이벤트 분류: 진행중, 예정, 종료 (조건부 return 전에 훅 호출)
    const allEventItems = useMemo(() => {
        const todayStr = new Date().toLocaleDateString('en-CA');
        const allEvents = [...(calendarEvents || []), ...generatedEvents];
        return allEvents.map(ev => {
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
            let category = ev.category || 'EVENT';
            if (!ev.category || ev.category === 'EVENT') {
                if (safeEndDate < todayStr) category = 'ARCHIVE';
                else if (safeDate > todayStr) category = 'UPCOMING';
                else category = 'ONGOING';
            }
            return {
                id: ev.id,
                title: ev.title,
                category,
                imageUrl: ev.imageUrl || '',
                description: ev.description || t('featured.event_ongoing_desc', '현재 진행 중인 특별한 이벤트입니다.'),
                date: { ko: dateStr, en: dateStr }
            } as unknown as FeaturedItem;
        });
    }, [calendarEvents, generatedEvents, t]);

    // 이미지가 있는 이벤트만 필터링 (http URL만 유효)
    const fallbackImages = [
        'https://images.unsplash.com/photo-1540575861501-7c00117fb3c9?q=80&w=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=400&auto=format&fit=crop',
    ];
    const ensureImage = (items: FeaturedItem[]) => items.map((e, i) => ({
        ...e,
        imageUrl: (e.imageUrl && (e.imageUrl.startsWith('http') || e.imageUrl.startsWith('/'))) ? e.imageUrl : fallbackImages[i % fallbackImages.length]
    })) as FeaturedItem[];
    
    const ongoingEvents = ensureImage(allEventItems.filter(e => e.category === 'ONGOING'));
    const upcomingEvents = ensureImage(allEventItems.filter(e => e.category === 'UPCOMING'));
    const archivedEvents = ensureImage(allEventItems.filter(e => e.category === 'ARCHIVE'));
    
    // 진행 중 이벤트가 5개 미만이면 products(추천 상품)로 보충
    const productsReady = ensureImage(products);
    const ongoingProducts = ongoingEvents.length >= 5 
        ? ongoingEvents 
        : [...ongoingEvents, ...productsReady.filter(p => !ongoingEvents.find(e => e.id === p.id))].slice(0, Math.max(5, ongoingEvents.length));
    const upcomingProducts = upcomingEvents;
    const archivedProducts = archivedEvents;

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
                <div className="text-red-500 mb-4 font-bold">{t('common.error', '오류가 발생했습니다.')} {error}</div>
            </section>
        );
    }

    return (
        <section className="h-[100dvh] w-full snap-start bg-[#2a2a2a] relative flex flex-col justify-center overflow-hidden pt-24 pb-12 min-h-[700px]">


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
                        {t('featured.title', '추천 & 이벤트')}
                    </h3>
                </motion.div>
                
                {selectedDate && (
                    <motion.button 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        onClick={() => setSelectedDate(null)}
                        className="text-sm border border-white/20 px-4 py-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition"
                    >
                        {t('common.view_all', '전체 추천 보기')}
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
                                {new Intl.DateTimeFormat(i18n.language, { year: 'numeric', month: 'long' }).format(new Date(currentYear, currentMonth))}
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
                    {/* 마커 색상 범례 */}
                    <div className="flex items-center justify-center gap-5 mt-4 pt-3 border-t border-white/5">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            <span className="text-[10px] text-white/50">{t('featured.archived', '종료')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            <span className="text-[10px] text-white/50">{t('featured.ongoing', '진행 중')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span className="text-[10px] text-white/50">{t('featured.upcoming', '예정')}</span>
                        </div>
                    </div>
                </div>

                {/* 2. 우측: 이벤트 카테고리 탭 + 카드 리스트 */}
                <div className="lg:col-span-7 min-h-0 relative rounded-[2rem] overflow-hidden shadow-2xl flex flex-col bg-black/30 border border-white/5">
                    <div className="flex flex-col h-full">

                        {/* 날짜 선택 시: 해당 날짜에 포함된 이벤트 표시 */}
                        {selectedDate !== null ? (
                            <>
                                {/* 선택된 날짜 헤더 */}
                                <div className="px-5 pt-5 pb-3 shrink-0 border-b border-white/10 flex items-center justify-between">
                                    <h4 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                                        <CalendarIcon size={16} className="text-dancheong-red" />
                                        {currentYear}.{(currentMonth + 1).toString().padStart(2, '0')}.{selectedDate.toString().padStart(2, '0')}
                                        <span className="text-white/40 font-normal ml-1">
                                            ({getEventsForDay(selectedDate).length}{t('featured.events_count', '건')})
                                        </span>
                                    </h4>
                                    <button
                                        onClick={() => setSelectedDate(null)}
                                        className="text-xs text-white/50 hover:text-white border border-white/20 px-3 py-1 rounded-full hover:bg-white/10 transition-all"
                                    >
                                        {t('common.close', '닫기')}
                                    </button>
                                </div>

                                {/* 해당 날짜 이벤트 리스트 */}
                                <div className="flex-1 overflow-y-auto px-5 pb-3 space-y-2 custom-scrollbar min-h-0 pt-3">
                                    {(() => {
                                        const dayEvents = getEventsForDay(selectedDate);
                                        const selectedDateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${selectedDate.toString().padStart(2, '0')}`;

                                        if (dayEvents.length === 0) {
                                            return (
                                                <div className="flex flex-col items-center justify-center py-16 text-white/30">
                                                    <CalendarIcon size={40} strokeWidth={1} className="mb-3" />
                                                    <p className="text-sm">{t('featured.no_events_on_date', '해당 날짜에 이벤트가 없습니다.')}</p>
                                                </div>
                                            );
                                        }

                                        return dayEvents.map((ev, idx) => {
                                            const safeDate = ev.date || '';
                                            const safeEndDate = ev.endDate || ev.date || '';
                                            const todayStr = new Date().toLocaleDateString('en-CA');
                                            const isOngoing = safeDate <= selectedDateStr && safeEndDate >= selectedDateStr;
                                            const isArchived = safeEndDate < todayStr;
                                            const statusLabel = isArchived ? t('featured.archived', '종료') : isOngoing ? t('featured.ongoing', '진행 중') : t('featured.upcoming', '예정');
                                            const statusColor = isArchived ? 'bg-red-500/80' : isOngoing ? 'bg-blue-500/80' : 'bg-green-500/80';

                                            // 날짜 문자열 포맷
                                            const formatDate = (d: string) => d.replace(/-/g, '.');
                                            const dateDisplay = safeEndDate && safeEndDate !== safeDate
                                                ? `${formatDate(safeDate)} - ${formatDate(safeEndDate)}`
                                                : formatDate(safeDate);

                                            const imgSrc = (ev.imageUrl && (ev.imageUrl.startsWith('http') || ev.imageUrl.startsWith('/'))) ? ev.imageUrl : fallbackImages[idx % fallbackImages.length];

                                            return (
                                                <Link
                                                    key={`date-${ev.id}-${idx}`}
                                                    to={`/detail/${ev.id}`}
                                                    className="flex gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all group"
                                                >
                                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden shrink-0 bg-[#1a1a1a]">
                                                        <img
                                                            src={imgSrc}
                                                            alt=""
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                            onError={(e) => { (e.target as HTMLImageElement).src = fallbackImages[idx % fallbackImages.length]; }}
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold text-white w-fit mb-1.5 ${statusColor}`}>
                                                            {statusLabel}
                                                        </span>
                                                        <h5 className="text-sm md:text-base font-bold text-white line-clamp-1 break-words group-hover:text-dancheong-red transition-colors">
                                                            {typeof ev.title === 'string' ? ev.title : getLocalizedText(ev.title as any, i18n.language)}
                                                        </h5>
                                                        <p className="text-xs text-white/50 line-clamp-1 mt-1 break-words">
                                                            {ev.description ? (typeof ev.description === 'string' ? ev.description : getLocalizedText(ev.description as any, i18n.language)) : t('featured.event_ongoing_desc', '현재 진행 중인 특별한 이벤트입니다.')}
                                                        </p>
                                                        <span className="text-[10px] text-white/40 mt-1">📅 {dateDisplay}</span>
                                                    </div>
                                                    <div className="shrink-0 flex items-center">
                                                        <ArrowUpRight size={16} className="text-white/30 group-hover:text-white transition-colors" />
                                                    </div>
                                                </Link>
                                            );
                                        });
                                    })()}
                                </div>
                            </>
                        ) : (
                            <>
                                {/* 기본 뷰: 카테고리 탭 */}
                                <div className="px-5 pt-5 pb-3 shrink-0 border-b border-white/10">
                                    <div className="flex items-center justify-around w-full">
                                        {[
                                            { key: 'ARCHIVE' as const, label: t('featured.event_archived', '종료된 이벤트'), count: archivedProducts.length },
                                            { key: 'ONGOING' as const, label: t('featured.event_ongoing', '진행 중인 이벤트'), count: ongoingProducts.length },
                                            { key: 'UPCOMING' as const, label: t('featured.event_upcoming', '진행 예정 이벤트'), count: upcomingProducts.length },
                                        ].map((tab) => (
                                            <button
                                                key={tab.key}
                                                onClick={() => { setEventCategory(tab.key); }}
                                                className={`text-sm font-bold pb-2 border-b-2 transition-all ${
                                                    eventCategory === tab.key
                                                        ? 'text-white border-white'
                                                        : 'text-white/35 border-transparent hover:text-white/60'
                                                }`}
                                            >
                                                {tab.label} ({tab.count})
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 이벤트 카드 리스트 */}
                                <div className="flex-1 overflow-y-auto px-5 pb-3 space-y-2 custom-scrollbar min-h-0 pt-3">
                                    {(() => {
                                        const categoryMap = { ONGOING: ongoingProducts, UPCOMING: upcomingProducts, ARCHIVE: archivedProducts };
                                        const items = categoryMap[eventCategory];
                                        const displayItems = items.slice(0, 5);
                                        const isArchive = eventCategory === 'ARCHIVE';

                                        if (items.length === 0) {
                                            return (
                                                <div className="flex flex-col items-center justify-center py-16 text-white/30">
                                                    <CalendarIcon size={40} strokeWidth={1} className="mb-3" />
                                                    <p className="text-sm">{t('featured.no_events', '이벤트 없음')}</p>
                                                </div>
                                            );
                                        }

                                        return displayItems.map((item, idx) => (
                                            <Link
                                                key={`${eventCategory}-${item.id}-${idx}`}
                                                to={`/detail/${item.id}`}
                                                className="flex gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all group"
                                            >
                                                <div className={`w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden shrink-0 bg-[#1a1a1a] ${isArchive ? 'opacity-60' : ''}`}>
                                                    <img
                                                        src={(item.imageUrl && (item.imageUrl.startsWith('http') || item.imageUrl.startsWith('/'))) ? item.imageUrl : fallbackImages[idx % fallbackImages.length]}
                                                        alt=""
                                                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isArchive ? 'grayscale' : ''}`}
                                                        onError={(e) => { (e.target as HTMLImageElement).src = fallbackImages[idx % fallbackImages.length]; }}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                    <h5 className={`text-sm md:text-base font-bold line-clamp-1 break-words group-hover:text-dancheong-red transition-colors ${isArchive ? 'text-white/60' : 'text-white'}`}>
                                                        {typeof item.title === 'string' ? item.title : getLocalizedText(item.title, i18n.language)}
                                                    </h5>
                                                    <p className="text-xs text-white/50 line-clamp-1 mt-1 break-words">
                                                        {typeof item.description === 'string' ? item.description : getLocalizedText(item.description, i18n.language)}
                                                    </p>
                                                    {item.date && (
                                                        <span className={`text-[10px] mt-1 ${isArchive ? 'text-white/30' : 'text-white/40'}`}>📅 {typeof item.date === 'string' ? item.date : getLocalizedText(item.date, i18n.language)}</span>
                                                    )}
                                                </div>
                                                <div className="shrink-0 flex items-center">
                                                    <ArrowUpRight size={16} className="text-white/30 group-hover:text-white transition-colors" />
                                                </div>
                                            </Link>
                                        ));
                                    })()}
                                </div>
                            </>
                        )}

                        {/* 전체 보기 버튼 */}
                        <div className="px-5 py-3 border-t border-white/10 shrink-0 flex justify-end">
                            <button
                                onClick={() => { setSelectedDate(null); setShowAll(true); }}
                                className="text-sm text-white/60 hover:text-white py-1.5 px-4 rounded-lg hover:bg-white/5 transition-all tracking-wide"
                            >
                                {t('common.view_all', '전체 보기')} →
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 전체 보기 모달 */}
            {showAll && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setShowAll(false)}>
                    {/* 배경 오버레이 */}
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                    
                    {/* 모달 본체 */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className="relative bg-[#1a1a1a] rounded-2xl border border-white/10 shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* 모달 헤더 */}
                        <div className="px-6 pt-5 pb-4 flex items-center justify-between shrink-0 border-b border-white/10">
                            <h3 className="text-lg font-bold text-white">{t('featured.all_events', '전체 이벤트')}</h3>
                            <button
                                onClick={() => setShowAll(false)}
                                className="text-white/40 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-all"
                            >
                                ✕
                            </button>
                        </div>

                        {/* 모달 카테고리 탭 */}
                        <div className="px-6 pt-4 pb-3 shrink-0 border-b border-white/5">
                            <div className="flex items-center justify-around w-full">
                                {[
                                    { key: 'ARCHIVE' as const, label: t('featured.event_archived', '종료된 이벤트'), count: archivedProducts.length },
                                    { key: 'ONGOING' as const, label: t('featured.event_ongoing', '진행 중인 이벤트'), count: ongoingProducts.length },
                                    { key: 'UPCOMING' as const, label: t('featured.event_upcoming', '진행 예정 이벤트'), count: upcomingProducts.length },
                                ].map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setEventCategory(tab.key)}
                                        className={`text-sm font-bold pb-2 border-b-2 transition-all ${
                                            eventCategory === tab.key
                                                ? 'text-white border-white'
                                                : 'text-white/35 border-transparent hover:text-white/60'
                                        }`}
                                    >
                                        {tab.label} ({tab.count})
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 모달 이벤트 리스트 */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2 custom-scrollbar">
                            {(() => {
                                const categoryMap = { ONGOING: ongoingProducts, UPCOMING: upcomingProducts, ARCHIVE: archivedProducts };
                                const items = categoryMap[eventCategory];
                                const isArchive = eventCategory === 'ARCHIVE';

                                if (items.length === 0) {
                                    return (
                                        <div className="flex flex-col items-center justify-center py-20 text-white/30">
                                            <CalendarIcon size={48} strokeWidth={1} className="mb-4" />
                                            <p className="text-sm">{t('featured.no_events', '이벤트 없음')}</p>
                                        </div>
                                    );
                                }

                                return items.map((item, idx) => (
                                    <Link
                                        key={`modal-${eventCategory}-${item.id}-${idx}`}
                                        to={`/detail/${item.id}`}
                                        className="flex gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group"
                                        onClick={() => setShowAll(false)}
                                    >
                                        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden shrink-0 bg-[#0a0a0a] ${isArchive ? 'opacity-50' : ''}`}>
                                            <img
                                                src={(item.imageUrl && (item.imageUrl.startsWith('http') || item.imageUrl.startsWith('/'))) ? item.imageUrl : fallbackImages[idx % fallbackImages.length]}
                                                alt=""
                                                className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isArchive ? 'grayscale' : ''}`}
                                                onError={(e) => { (e.target as HTMLImageElement).src = fallbackImages[idx % fallbackImages.length]; }}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <h5 className={`text-sm md:text-base font-bold line-clamp-1 break-words group-hover:text-dancheong-red transition-colors ${isArchive ? 'text-white/50' : 'text-white'}`}>
                                                {typeof item.title === 'string' ? item.title : getLocalizedText(item.title, i18n.language)}
                                            </h5>
                                            <p className="text-xs text-white/40 line-clamp-1 mt-1 break-words">
                                                {typeof item.description === 'string' ? item.description : getLocalizedText(item.description, i18n.language)}
                                            </p>
                                            {item.date && (
                                                <span className={`text-[10px] mt-1 ${isArchive ? 'text-white/25' : 'text-white/40'}`}>📅 {typeof item.date === 'string' ? item.date : getLocalizedText(item.date, i18n.language)}</span>
                                            )}
                                        </div>
                                        <div className="shrink-0 flex items-center">
                                            <ArrowUpRight size={16} className="text-white/20 group-hover:text-white transition-colors" />
                                        </div>
                                    </Link>
                                ));
                            })()}
                        </div>
                    </motion.div>
                </div>
            )}
        </section>
    );
};
