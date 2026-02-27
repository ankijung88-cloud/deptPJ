/** 날짜 +n일 */
export function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

/** 해당 월의 시작일/종료일 (yyyy-mm-dd) */
export function monthStartEnd(year: number, month: number): { start: string; end: string } {
  const start = `${year}-${(month + 1).toString().padStart(2, '0')}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const end = `${year}-${(month + 1).toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
  return { start, end };
}

/** 이벤트가 특정 날짜와 겹치는지 */
export function isOverlappingDate(startAt: string, endAt: string, dateKey: string): boolean {
  return startAt <= dateKey && endAt >= dateKey;
}

/** 날짜 범위 포맷 (yyyy.mm.dd - yyyy.mm.dd) */
export function formatDateRange(startAt: string, endAt: string): string {
  return `${startAt.replace(/-/g, '.')} - ${endAt.replace(/-/g, '.')}`;
}

/** yyyy-mm-dd → Date 객체 */
export function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
