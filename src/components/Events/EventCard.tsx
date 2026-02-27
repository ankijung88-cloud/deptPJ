import React from 'react';
import { CalendarEventWithStatus } from '../../types/event';
import { formatDateRange } from '../../utils/date';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface EventCardProps {
  event: CalendarEventWithStatus;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { t } = useTranslation();
  const isEnded = event.status === 'ENDED';

  const badgeLabel = event.status === 'ENDED' ? t('calendar.ended', '종료')
    : event.status === 'ONGOING' ? t('calendar.ongoing', '진행 중')
      : t('calendar.upcoming', '예정');

  const style = event.status === 'ENDED' ? { dot: 'bg-red-400', text: 'text-red-300', glow: '0 0 6px rgba(248,113,113,0.5)' }
    : event.status === 'ONGOING' ? { dot: 'bg-blue-400', text: 'text-blue-300', glow: '0 0 6px rgba(96,165,250,0.5)' }
      : { dot: 'bg-emerald-400', text: 'text-emerald-300', glow: '0 0 6px rgba(52,211,153,0.5)' };

  const title = t(event.title, event.title);
  const summary = t(event.summary, event.summary);

  return (
    <Link
      to={`/event/${event.id}`}
      state={{
        title,
        description: summary,
        date: event.startAt,
        endDate: event.endAt,
        imageUrl: event.thumbnailUrl,
        category: event.status,
      }}
      className={`
        block relative w-full shrink-0 rounded-xl overflow-hidden group
        ${isEnded ? 'opacity-60' : ''}
      `}
      style={{ height: 'calc((100% - 32px) / 5)', minHeight: '85px' }}
    >
      {/* 배경 이미지 */}
      <img
        src={event.thumbnailUrl}
        alt={title}
        className={`
          absolute inset-0 w-full h-full object-cover
          group-hover:scale-105 transition-transform duration-500
          ${isEnded ? 'grayscale' : ''}
        `}
        loading="lazy"
      />

      {/* 그라데이션 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

      {/* 텍스트 콘텐츠 */}
      <div className="relative z-10 flex flex-col justify-center h-full px-4 py-2">
        {/* 상태 배지 + 기간 */}
        <div className="flex items-center gap-2 mb-1">
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/5 ${style.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} style={{ boxShadow: style.glow }} />
            <span className="text-[10px] font-bold">
              {badgeLabel}
            </span>
          </div>
          <span className="text-[10px] text-white/60">
            📅 {formatDateRange(event.startAt, event.endAt)}
          </span>
        </div>

        {/* 제목 */}
        <h5 className="text-sm font-bold text-white line-clamp-1 group-hover:text-dancheong-red transition-colors">
          {title}
        </h5>

        {/* 설명 */}
        <p className="text-[11px] text-white/50 line-clamp-1 mt-0.5">
          {summary}
        </p>
      </div>
    </Link>
  );
};

export default EventCard;
