import React, { useEffect } from 'react';
import { CalendarEventWithStatus } from '../../types/event';
import EventCard from './EventCard';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: CalendarEventWithStatus[];
  tabLabel: string;
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, events, tabLabel }) => {
  const { t } = useTranslation();

  // ESC로 닫기 + 스크롤 잠금
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* 모달 본체 */}
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0">
          <h4 className="text-lg font-bold text-white">{tabLabel}</h4>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
            aria-label={t('calendar.close', '닫기')}
          >
            <X size={18} />
          </button>
        </div>

        {/* 이벤트 리스트 */}
        <div className="flex-1 overflow-y-auto px-4 py-3 custom-scrollbar">
          {events.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-white/30 text-sm">
              {t('calendar.no_events', '해당하는 이벤트가 없습니다.')}
            </div>
          ) : (
            <div className="space-y-1">
              {events.map(ev => (
                <div key={ev.id} className="h-[85px]">
                  <EventCard event={ev} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 하단 카운트 */}
        <div className="px-6 py-3 border-t border-white/[0.06] text-center shrink-0">
          <span className="text-xs text-white/30">
            {events.length}{t('calendar.count_suffix', '건')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
