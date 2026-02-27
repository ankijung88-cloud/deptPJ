import React, { useMemo, useState, useCallback } from 'react';
import { CalendarEventWithStatus, EventStatus } from '../../types/event';
import { toISODateKey } from '../../utils/status';
import { monthStartEnd, addDays } from '../../utils/date';
import CalendarHeader from './CalendarHeader';
import CalendarDayCell from './CalendarDayCell';
import Legend from './Legend';

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

interface CalendarProps {
  events: CalendarEventWithStatus[];
  selectedDate: string | null;
  onSelectDate: (dateKey: string | null) => void;
}

const Calendar: React.FC<CalendarProps> = ({ events, selectedDate, onSelectDate }) => {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());

  const todayKey = toISODateKey(now);

  // 이전/다음 달 네비게이션
  const goToPrev = useCallback(() => {
    setCurrentMonth(m => {
      if (m === 0) { setCurrentYear(y => y - 1); return 11; }
      return m - 1;
    });
  }, []);

  const goToNext = useCallback(() => {
    setCurrentMonth(m => {
      if (m === 11) { setCurrentYear(y => y + 1); return 0; }
      return m + 1;
    });
  }, []);

  // 년월 직접 선택
  const handleChangeYearMonth = useCallback((y: number, m: number) => {
    setCurrentYear(y);
    setCurrentMonth(m);
  }, []);

  // 달력 그리드 데이터
  const { daysInMonth, firstDayOfWeek } = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();
    return { daysInMonth: lastDate, firstDayOfWeek: firstDay };
  }, [currentYear, currentMonth]);

  // 날짜별 상태 맵 구축
  const dayStatusMap = useMemo(() => {
    const map = new Map<string, Set<EventStatus>>();
    const { start: mStart, end: mEnd } = monthStartEnd(currentYear, currentMonth);

    for (const ev of events) {
      // 이벤트가 이번 달과 겹치지 않으면 스킵
      if (ev.endAt < mStart || ev.startAt > mEnd) continue;

      // 이벤트가 이번 달에 걸치는 날짜 범위
      const rangeStart = ev.startAt > mStart ? ev.startAt : mStart;
      const rangeEnd = ev.endAt < mEnd ? ev.endAt : mEnd;

      let cursor = new Date(rangeStart + 'T00:00:00');
      const endDate = new Date(rangeEnd + 'T00:00:00');

      while (cursor <= endDate) {
        const key = toISODateKey(cursor);
        if (!map.has(key)) map.set(key, new Set());
        map.get(key)!.add(ev.status);
        cursor = addDays(cursor, 1);
      }
    }

    return map;
  }, [events, currentYear, currentMonth]);

  // 날짜 클릭 핸들러
  const handleDayClick = useCallback((day: number) => {
    const key = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    onSelectDate(selectedDate === key ? null : key);
  }, [currentYear, currentMonth, selectedDate, onSelectDate]);

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 h-full flex flex-col">
      <CalendarHeader
        year={currentYear}
        month={currentMonth}
        onPrev={goToPrev}
        onNext={goToNext}
        onChangeYearMonth={handleChangeYearMonth}
      />

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-white/40 tracking-widest py-1">
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 — 항상 6행(42칸) 고정 */}
      <div className="grid grid-cols-7 gap-1.5 flex-1 auto-rows-fr">
        {/* 앞쪽 빈 셀 */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* 날짜 셀 */}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const dateKey = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          const statuses = dayStatusMap.get(dateKey) || new Set<EventStatus>();

          return (
            <CalendarDayCell
              key={day}
              day={day}
              dateKey={dateKey}
              isToday={dateKey === todayKey}
              isSelected={dateKey === selectedDate}
              statuses={statuses}
              onClick={handleDayClick}
            />
          );
        })}

        {/* 뒤쪽 빈 셀 — 42칸 채우기 */}
        {Array.from({ length: 42 - firstDayOfWeek - daysInMonth }).map((_, i) => (
          <div key={`trail-${i}`} />
        ))}
      </div>

      <Legend />
    </div>
  );
};

export default Calendar;
