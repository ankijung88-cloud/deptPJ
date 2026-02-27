import React from 'react';
import { CalendarEventWithStatus } from '../../types/event';
import EventCard from './EventCard';
import { useTranslation } from 'react-i18next';

interface EventListProps {
  events: CalendarEventWithStatus[];
}

const EventList: React.FC<EventListProps> = ({ events }) => {
  const { t } = useTranslation();

  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-white/30 text-sm">
        {t('calendar.no_events', '해당하는 이벤트가 없습니다.')}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 h-full overflow-y-auto pr-2 custom-scrollbar">
      {events.map(ev => (
        <EventCard key={ev.id} event={ev} />
      ))}
    </div>
  );
};

export default EventList;
