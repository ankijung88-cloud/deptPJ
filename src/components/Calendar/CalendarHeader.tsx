import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, CalendarDays } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CalendarHeaderProps {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
  onChangeYearMonth: (year: number, month: number) => void;
}

const MONTH_NAMES_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_NAMES_TH = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ year, month, onPrev, onNext, onChangeYearMonth }) => {
  const { t, i18n } = useTranslation();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(year);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pickerOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [pickerOpen]);

  useEffect(() => { if (pickerOpen) setPickerYear(year); }, [pickerOpen, year]);

  const getMonthLabel = () => {
    const lang = i18n.language;
    if (lang === 'en') return `${MONTH_NAMES_EN[month]} ${year}`;
    if (lang === 'ja') return `${year}年${month + 1}月`;
    if (lang === 'zh') return `${year}年${month + 1}月`;
    if (lang === 'th') return `${MONTH_NAMES_TH[month]} ${year}`;
    return `${year}년 ${month + 1}월`;
  };

  const getShortMonth = (m: number) => {
    const lang = i18n.language;
    if (lang === 'en') return MONTH_NAMES_EN[m].slice(0, 3);
    if (lang === 'ja') return `${m + 1}月`;
    if (lang === 'zh') return `${m + 1}月`;
    if (lang === 'th') return MONTH_NAMES_TH[m].slice(0, 3);
    return `${m + 1}월`;
  };

  const handleMonthSelect = (m: number) => {
    onChangeYearMonth(pickerYear, m);
    setPickerOpen(false);
  };

  const handleGoToday = () => {
    const now = new Date();
    onChangeYearMonth(now.getFullYear(), now.getMonth());
    setPickerOpen(false);
  };

  const isCurrentMonth = () => {
    const now = new Date();
    return year === now.getFullYear() && month === now.getMonth();
  };

  return (
    <div className="flex items-center justify-between mb-5">
      <div className="relative" ref={pickerRef}>
        <button
          onClick={() => setPickerOpen(prev => !prev)}
          className="text-lg font-bold text-white tracking-wide flex items-center gap-1.5 hover:text-white/80 transition-colors cursor-pointer"
        >
          {getMonthLabel()}
          <ChevronDown size={16} className={`transition-transform duration-200 ${pickerOpen ? 'rotate-180' : ''}`} />
        </button>

        {pickerOpen && (
          <div className="absolute top-full left-0 mt-2 z-50 bg-[#1e1e2f] border border-white/10 rounded-xl shadow-2xl p-4 w-[280px]">
            {/* 연도 선택 */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setPickerYear(y => y - 1)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-base font-bold text-white">{pickerYear}</span>
              <button
                onClick={() => setPickerYear(y => y + 1)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* 월 그리드 */}
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {Array.from({ length: 12 }, (_, m) => {
                const isActive = pickerYear === year && m === month;
                const isToday = pickerYear === new Date().getFullYear() && m === new Date().getMonth();
                return (
                  <button
                    key={m}
                    onClick={() => handleMonthSelect(m)}
                    className={`
                      py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                      ${isActive
                        ? 'bg-dancheong-red text-white shadow-md'
                        : isToday
                          ? 'ring-1 ring-white/20 text-white/80 hover:bg-white/10'
                          : 'text-white/60 hover:bg-white/10 hover:text-white'
                      }
                    `}
                  >
                    {getShortMonth(m)}
                  </button>
                );
              })}
            </div>

            {/* 오늘로 이동 + 안내 */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <span className="text-[11px] text-white/30">
                {i18n.language === 'en' ? 'Select month, then click a day' : '월을 선택 후 날짜를 클릭하세요'}
              </span>
              {!isCurrentMonth() && (
                <button
                  onClick={handleGoToday}
                  className="flex items-center gap-1 text-[11px] text-dancheong-red/70 hover:text-dancheong-red font-medium transition-colors"
                >
                  <CalendarDays size={12} />
                  {i18n.language === 'en' ? 'Today' : '오늘'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-1">
        <button
          onClick={onPrev}
          aria-label={t('calendar.prev_month', '이전 달')}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={onNext}
          aria-label={t('calendar.next_month', '다음 달')}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;
