import React from 'react';
import { EventStatus } from '../../types/event';
import { useTranslation } from 'react-i18next';

interface EventTabsProps {
  activeTab: EventStatus | null;
  counts: Record<EventStatus, number>;
  onTabChange: (tab: EventStatus) => void;
}

const EventTabs: React.FC<EventTabsProps> = ({ activeTab, counts, onTabChange }) => {
  const { t } = useTranslation();

  const TABS: { key: EventStatus; label: string; dotColor: string }[] = [
    { key: 'ENDED',    label: t('calendar.tab_ended', '종료된 이벤트'),     dotColor: 'bg-red-400' },
    { key: 'ONGOING',  label: t('calendar.tab_ongoing', '진행 중인 이벤트'), dotColor: 'bg-blue-400' },
    { key: 'UPCOMING', label: t('calendar.tab_upcoming', '진행 예정 이벤트'), dotColor: 'bg-emerald-400' },
  ];

  return (
    <div className="flex border-b border-white/[0.06]" role="tablist">
      {TABS.map(({ key, label, dotColor }) => {
        const isActive = activeTab === key;
        return (
          <button
            key={key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(key)}
            className={`
              flex-1 flex items-center justify-center gap-2
              py-3.5 text-xs md:text-[15px] font-semibold
              transition-all duration-200 relative
              ${isActive ? 'text-white' : 'text-white/40 hover:text-white/60'}
            `}
          >
            <span className={`w-2 h-2 rounded-full ${dotColor} ${isActive ? 'opacity-100' : 'opacity-40'}`} />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.split(' ')[0]}</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full ${isActive ? 'bg-white/10 text-white/70' : 'bg-white/5 text-white/30'}`}>
              {counts[key]}
            </span>
            {isActive && (
              <span className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-white rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default EventTabs;
