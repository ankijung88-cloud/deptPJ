import { CalendarEvent, CalendarEventWithStatus, EventStatus } from '../types/event';

/**
 * 이벤트 상태 판별 (단일 함수 — 서버 상태로 교체 시 이 함수만 수정)
 * - now < startAt → UPCOMING
 * - startAt <= now <= endAt → ONGOING
 * - endAt < now → ENDED
 */
export function deriveStatus(event: CalendarEvent, now: Date): EventStatus {
  const todayStr = toISODateKey(now);
  if (todayStr < event.startAt) return 'UPCOMING';
  if (todayStr > event.endAt) return 'ENDED';
  return 'ONGOING';
}

/** ISO 날짜 키 (yyyy-mm-dd) */
export function toISODateKey(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** 이벤트 목록에 상태를 부여 */
export function withStatus(events: CalendarEvent[], now: Date): CalendarEventWithStatus[] {
  return events.map(ev => ({ ...ev, status: deriveStatus(ev, now) }));
}
