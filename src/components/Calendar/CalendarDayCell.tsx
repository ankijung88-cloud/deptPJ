import React from 'react';
import { EventStatus } from '../../types/event';
import { useTranslation } from 'react-i18next';

interface CalendarDayCellProps {
  day: number;
  dateKey: string;
  isToday: boolean;
  isSelected: boolean;
  statuses: Set<EventStatus>;
  onClick: (day: number) => void;
}

/**
 * 우선순위: ONGOING > UPCOMING > ENDED
 * 하루에 하나의 색상만 표시 — 가장 중요한 상태 기준
 */
function getDominantStatus(statuses: Set<EventStatus>): EventStatus | null {
  if (statuses.has('ONGOING')) return 'ONGOING';
  if (statuses.has('UPCOMING')) return 'UPCOMING';
  if (statuses.has('ENDED')) return 'ENDED';
  return null;
}

const STATUS_STYLE: Record<EventStatus, { dot: string; bg: string; glow: string; label: string }> = {
  ONGOING:  { dot: 'bg-blue-400',    bg: 'bg-blue-500/8',    glow: '0 0 6px rgba(96,165,250,0.5)',  label: '진행 중' },
  UPCOMING: { dot: 'bg-emerald-400', bg: 'bg-emerald-500/8', glow: '0 0 6px rgba(52,211,153,0.5)',  label: '예정' },
  ENDED:    { dot: 'bg-red-400',     bg: 'bg-red-500/8',     glow: '0 0 6px rgba(248,113,113,0.5)', label: '종료' },
};

const CalendarDayCell: React.FC<CalendarDayCellProps> = ({
  day, dateKey, isToday, isSelected, statuses, onClick,
}) => {
  const { t } = useTranslation();
  const dominant = getDominantStatus(statuses);
  const style = dominant ? STATUS_STYLE[dominant] : null;

  const statusLabel = dominant
    ? dominant === 'ONGOING' ? t('calendar.ongoing', '진행 중')
    : dominant === 'UPCOMING' ? t('calendar.upcoming', '예정')
    : t('calendar.ended', '종료')
    : '';

  return (
    <button
      onClick={() => onClick(day)}
      title={dominant ? `${dateKey} — ${statusLabel}` : dateKey}
      aria-label={`${dateKey}${dominant ? ` (${statusLabel})` : ''}`}
      className={`
        relative flex flex-col items-center justify-center
        w-full rounded-lg
        text-sm font-medium transition-all duration-200
        ${isSelected
          ? 'bg-dancheong-red/80 text-white shadow-lg shadow-red-900/30 scale-105'
          : isToday
            ? 'bg-white/10 text-white ring-1 ring-white/20'
            : style
              ? `${style.bg} text-white/80 hover:brightness-125 cursor-pointer`
              : 'text-white/40 hover:bg-white/5 hover:text-white/60'
        }
      `}
    >
      <span className={isToday && !isSelected ? 'font-bold' : ''}>{day}</span>

      {/* 단일 도트 — 우선순위 기반 하나의 색상만 표시 */}
      {style && (
        <span
          className={`absolute bottom-1.5 w-[6px] h-[6px] rounded-full ${style.dot}`}
          style={{ boxShadow: style.glow }}
        />
      )}
    </button>
  );
};

export default CalendarDayCell;
