import React, { useMemo, useState, useCallback } from 'react';
import { MOCK_EVENTS } from '../data/events';
import { EventStatus, CalendarEventWithStatus } from '../types/event';
import { withStatus } from '../utils/status';
import { isOverlappingDate } from '../utils/date';
import Calendar from '../components/Calendar/Calendar';
import EventTabs from '../components/Events/EventTabs';
import EventList from '../components/Events/EventList';
import EventModal from '../components/Events/EventModal';
import { useTranslation } from 'react-i18next';

const TAB_LABELS: Record<EventStatus, string> = {
  ENDED: 'calendar.tab_ended',
  ONGOING: 'calendar.tab_ongoing',
  UPCOMING: 'calendar.tab_upcoming',
};

/** 상태별로 번갈아 섞기: ONGOING → ENDED → UPCOMING → ONGOING → ... */
function interleaveByStatus(events: CalendarEventWithStatus[]): CalendarEventWithStatus[] {
  const buckets: Record<EventStatus, CalendarEventWithStatus[]> = {
    ONGOING: [], UPCOMING: [], ENDED: [],
  };
  for (const ev of events) buckets[ev.status].push(ev);

  // 각 버킷 내부 정렬
  buckets.ONGOING.sort((a, b) => a.endAt.localeCompare(b.endAt));
  buckets.UPCOMING.sort((a, b) => a.startAt.localeCompare(b.startAt));
  buckets.ENDED.sort((a, b) => b.endAt.localeCompare(a.endAt));

  const order: EventStatus[] = ['ONGOING', 'UPCOMING', 'ENDED'];
  const result: CalendarEventWithStatus[] = [];
  const indices = { ONGOING: 0, UPCOMING: 0, ENDED: 0 };
  const total = events.length;

  let round = 0;
  while (result.length < total) {
    const status = order[round % 3];
    if (indices[status] < buckets[status].length) {
      result.push(buckets[status][indices[status]]);
      indices[status]++;
    }
    round++;
    // 무한루프 방지
    if (round > total * 3) break;
  }

  return result;
}

const EventsDashboard: React.FC = () => {
  const { t } = useTranslation();
  const now = useMemo(() => new Date(), []);
  const [activeTab, setActiveTab] = useState<EventStatus | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const eventsWithStatus = useMemo(() => withStatus(MOCK_EVENTS, now), [now]);

  // 날짜 선택 유무에 따른 1차 필터
  const dateFilteredEvents = useMemo(() => {
    if (!selectedDate) return eventsWithStatus;
    return eventsWithStatus.filter(ev => isOverlappingDate(ev.startAt, ev.endAt, selectedDate));
  }, [eventsWithStatus, selectedDate]);

  const counts = useMemo(() => {
    const c: Record<EventStatus, number> = { ENDED: 0, ONGOING: 0, UPCOMING: 0 };
    for (const ev of dateFilteredEvents) c[ev.status]++;
    return c;
  }, [dateFilteredEvents]);

  // 이벤트 목록: 탭 선택 시 정렬/필터, null이면 상태별 번갈아 혼합
  const filteredEvents = useMemo(() => {
    let result = [...dateFilteredEvents];
    if (activeTab) {
      result = result.filter(ev => ev.status === activeTab);
      if (activeTab === 'ONGOING') result.sort((a, b) => a.endAt.localeCompare(b.endAt));
      else if (activeTab === 'ENDED') result.sort((a, b) => b.endAt.localeCompare(a.endAt));
      else result.sort((a, b) => a.startAt.localeCompare(b.startAt));
      return result;
    }
    return interleaveByStatus(result);
  }, [dateFilteredEvents, activeTab]);

  const handleSelectDate = useCallback((dateKey: string | null) => {
    if (dateKey && dateKey !== selectedDate) {
      const overlapping = eventsWithStatus.filter(ev =>
        isOverlappingDate(ev.startAt, ev.endAt, dateKey)
      );
      const statuses = new Set(overlapping.map(ev => ev.status));

      if (statuses.has('ONGOING')) setActiveTab('ONGOING');
      else if (statuses.has('UPCOMING')) setActiveTab('UPCOMING');
      else if (statuses.has('ENDED')) setActiveTab('ENDED');
      else setActiveTab(null);

      setSelectedDate(dateKey);
    } else {
      setSelectedDate(null);
    }
  }, [selectedDate, eventsWithStatus]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-[5fr_7fr] gap-6 h-[600px]">
        {/* 좌측: 캘린더 */}
        <div className="h-full">
          <Calendar
            events={eventsWithStatus}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />
        </div>

        {/* 우측: 탭 + 리스트 */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl flex flex-col overflow-hidden h-full">
          <div className="shrink-0">
            <EventTabs
              activeTab={activeTab}
              counts={counts}
              onTabChange={(tab) => setActiveTab(prev => prev === tab ? null : tab)}
            />
          </div>

          <div className="flex-1 px-3 py-3 overflow-hidden">
            <EventList events={filteredEvents} />
          </div>

          <div className="px-5 py-3 border-t border-white/[0.06] text-right shrink-0">
            <button
              onClick={() => setModalOpen(true)}
              className="text-xs text-white/40 hover:text-white transition-colors"
            >
              {`${t('calendar.show_all', '전체 보기')} (${filteredEvents.length}${t('calendar.count_suffix', '건')}) →`}
            </button>
          </div>
        </div>
      </div>

      <EventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        events={filteredEvents}
        tabLabel={activeTab ? t(TAB_LABELS[activeTab]) : t('calendar.show_all', '전체 보기')}
      />
    </>
  );
};

export default EventsDashboard;
