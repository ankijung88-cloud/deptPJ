export type EventStatus = 'ENDED' | 'ONGOING' | 'UPCOMING';

export interface CalendarEvent {
  id: string;
  title: string;
  summary: string;
  thumbnailUrl: string;
  startAt: string; // ISO date string (yyyy-mm-dd)
  endAt: string;   // ISO date string (yyyy-mm-dd)
}

export interface CalendarEventWithStatus extends CalendarEvent {
  status: EventStatus;
}
