import { CalendarEvent } from '../types/event';

// 이벤트 주제별 테마 이미지 (loremflickr — 키워드 기반, lock으로 고정)
const IMG = {
  sale:    'https://loremflickr.com/600/400/shopping,sale?lock=1',
  fashion: 'https://loremflickr.com/600/400/fashion,runway?lock=2',
  choco:   'https://loremflickr.com/600/400/chocolate,valentine?lock=3',
  culture: 'https://loremflickr.com/600/400/korean,traditional?lock=4',
  beauty:  'https://loremflickr.com/600/400/makeup,cosmetics?lock=5',
  living:  'https://loremflickr.com/600/400/interior,furniture?lock=6',
  kpop:    'https://loremflickr.com/600/400/concert,stage?lock=7',
  booth:   'https://loremflickr.com/600/400/exhibition,booth?lock=8',
  wine:    'https://loremflickr.com/600/400/wine,glass?lock=9',
  art:     'https://loremflickr.com/600/400/gallery,painting?lock=10',
  flower:  'https://loremflickr.com/600/400/flower,bouquet?lock=11',
  kids:    'https://loremflickr.com/600/400/children,playground?lock=12',
  cook:    'https://loremflickr.com/600/400/cooking,chef?lock=13',
  jewel:   'https://loremflickr.com/600/400/jewelry,diamond?lock=14',
  digital: 'https://loremflickr.com/600/400/digital,art?lock=15',
  popup:   'https://loremflickr.com/600/400/beauty,store?lock=16',
  eco:     'https://loremflickr.com/600/400/nature,eco?lock=17',
  child:   'https://loremflickr.com/600/400/kids,drawing?lock=18',
  tech:    'https://loremflickr.com/600/400/gadget,technology?lock=19',
  yoga:    'https://loremflickr.com/600/400/yoga,wellness?lock=20',
};

/**
 * 목 이벤트 데이터 — 1년(2026) 전체
 * 매월 최소 3건 이상, 2월은 진행 중 5건 보장
 */
export const MOCK_EVENTS: CalendarEvent[] = [
  // ── 1월 ──
  { id: 'ev-01', title: 'events.ev01.title', summary: 'events.ev01.summary', thumbnailUrl: IMG.sale,    startAt: '2026-01-03', endAt: '2026-01-08' },
  { id: 'ev-02', title: 'events.ev02.title', summary: 'events.ev02.summary', thumbnailUrl: IMG.fashion, startAt: '2026-01-14', endAt: '2026-01-19' },
  { id: 'ev-03', title: 'events.ev03.title', summary: 'events.ev03.summary', thumbnailUrl: IMG.choco,   startAt: '2026-01-24', endAt: '2026-01-29' },

  // ── 2월 (종료 2 + 진행 중 5) ──
  { id: 'ev-04', title: 'events.ev04.title', summary: 'events.ev04.summary', thumbnailUrl: IMG.culture, startAt: '2026-02-02', endAt: '2026-02-06' },
  { id: 'ev-05', title: 'events.ev05.title', summary: 'events.ev05.summary', thumbnailUrl: IMG.beauty,  startAt: '2026-02-10', endAt: '2026-02-14' },
  { id: 'ev-06', title: 'events.ev06.title', summary: 'events.ev06.summary', thumbnailUrl: IMG.living,  startAt: '2026-02-20', endAt: '2026-03-05' },
  { id: 'ev-37', title: 'events.ev07.title', summary: 'events.ev07.summary', thumbnailUrl: IMG.kpop,    startAt: '2026-02-22', endAt: '2026-03-08' },
  { id: 'ev-38', title: 'events.ev08.title', summary: 'events.ev08.summary', thumbnailUrl: IMG.booth,   startAt: '2026-02-24', endAt: '2026-03-04' },
  { id: 'ev-39', title: 'events.ev09.title', summary: 'events.ev09.summary', thumbnailUrl: IMG.wine,    startAt: '2026-02-25', endAt: '2026-03-10' },
  { id: 'ev-40', title: 'events.ev10.title', summary: 'events.ev10.summary', thumbnailUrl: IMG.art,     startAt: '2026-02-26', endAt: '2026-03-12' },

  // ── 3월 ──
  { id: 'ev-07', title: 'events.ev07.title', summary: 'events.ev07.summary', thumbnailUrl: IMG.kpop,    startAt: '2026-03-05', endAt: '2026-03-10' },
  { id: 'ev-08', title: 'events.ev08.title', summary: 'events.ev08.summary', thumbnailUrl: IMG.booth,   startAt: '2026-03-15', endAt: '2026-03-20' },
  { id: 'ev-09', title: 'events.ev09.title', summary: 'events.ev09.summary', thumbnailUrl: IMG.wine,    startAt: '2026-03-25', endAt: '2026-03-30' },

  // ── 4월 ──
  { id: 'ev-10', title: 'events.ev10.title', summary: 'events.ev10.summary', thumbnailUrl: IMG.art,     startAt: '2026-04-03', endAt: '2026-04-08' },
  { id: 'ev-11', title: 'events.ev11.title', summary: 'events.ev11.summary', thumbnailUrl: IMG.flower,  startAt: '2026-04-14', endAt: '2026-04-19' },
  { id: 'ev-12', title: 'events.ev12.title', summary: 'events.ev12.summary', thumbnailUrl: IMG.kids,    startAt: '2026-04-24', endAt: '2026-04-29' },

  // ── 5월 ──
  { id: 'ev-13', title: 'events.ev13.title', summary: 'events.ev13.summary', thumbnailUrl: IMG.cook,    startAt: '2026-05-04', endAt: '2026-05-09' },
  { id: 'ev-14', title: 'events.ev14.title', summary: 'events.ev14.summary', thumbnailUrl: IMG.jewel,   startAt: '2026-05-15', endAt: '2026-05-20' },
  { id: 'ev-15', title: 'events.ev15.title', summary: 'events.ev15.summary', thumbnailUrl: IMG.digital, startAt: '2026-05-26', endAt: '2026-05-31' },

  // ── 6월 ──
  { id: 'ev-16', title: 'events.ev16.title', summary: 'events.ev16.summary', thumbnailUrl: IMG.popup,   startAt: '2026-06-02', endAt: '2026-06-07' },
  { id: 'ev-17', title: 'events.ev17.title', summary: 'events.ev17.summary', thumbnailUrl: IMG.eco,     startAt: '2026-06-13', endAt: '2026-06-18' },
  { id: 'ev-18', title: 'events.ev18.title', summary: 'events.ev18.summary', thumbnailUrl: IMG.child,   startAt: '2026-06-24', endAt: '2026-06-29' },

  // ── 7월 ──
  { id: 'ev-19', title: 'events.ev19.title', summary: 'events.ev19.summary', thumbnailUrl: IMG.tech,    startAt: '2026-07-03', endAt: '2026-07-08' },
  { id: 'ev-20', title: 'events.ev20.title', summary: 'events.ev20.summary', thumbnailUrl: IMG.yoga,    startAt: '2026-07-16', endAt: '2026-07-21' },
  { id: 'ev-21', title: 'events.ev01.title', summary: 'events.ev01.summary', thumbnailUrl: IMG.sale,    startAt: '2026-07-27', endAt: '2026-08-01' },

  // ── 8월 ──
  { id: 'ev-22', title: 'events.ev09.title', summary: 'events.ev09.summary', thumbnailUrl: IMG.wine,    startAt: '2026-08-06', endAt: '2026-08-11' },
  { id: 'ev-23', title: 'events.ev15.title', summary: 'events.ev15.summary', thumbnailUrl: IMG.digital, startAt: '2026-08-17', endAt: '2026-08-22' },
  { id: 'ev-24', title: 'events.ev03.title', summary: 'events.ev03.summary', thumbnailUrl: IMG.choco,   startAt: '2026-08-26', endAt: '2026-08-31' },

  // ── 9월 ──
  { id: 'ev-25', title: 'events.ev07.title', summary: 'events.ev07.summary', thumbnailUrl: IMG.kpop,    startAt: '2026-09-04', endAt: '2026-09-09' },
  { id: 'ev-26', title: 'events.ev12.title', summary: 'events.ev12.summary', thumbnailUrl: IMG.kids,    startAt: '2026-09-15', endAt: '2026-09-20' },
  { id: 'ev-27', title: 'events.ev18.title', summary: 'events.ev18.summary', thumbnailUrl: IMG.child,   startAt: '2026-09-25', endAt: '2026-09-30' },

  // ── 10월 ──
  { id: 'ev-28', title: 'events.ev10.title', summary: 'events.ev10.summary', thumbnailUrl: IMG.art,     startAt: '2026-10-05', endAt: '2026-10-10' },
  { id: 'ev-29', title: 'events.ev06.title', summary: 'events.ev06.summary', thumbnailUrl: IMG.living,  startAt: '2026-10-16', endAt: '2026-10-21' },
  { id: 'ev-30', title: 'events.ev14.title', summary: 'events.ev14.summary', thumbnailUrl: IMG.jewel,   startAt: '2026-10-26', endAt: '2026-10-31' },

  // ── 11월 ──
  { id: 'ev-31', title: 'events.ev02.title', summary: 'events.ev02.summary', thumbnailUrl: IMG.fashion, startAt: '2026-11-03', endAt: '2026-11-08' },
  { id: 'ev-32', title: 'events.ev08.title', summary: 'events.ev08.summary', thumbnailUrl: IMG.booth,   startAt: '2026-11-14', endAt: '2026-11-19' },
  { id: 'ev-33', title: 'events.ev20.title', summary: 'events.ev20.summary', thumbnailUrl: IMG.yoga,    startAt: '2026-11-24', endAt: '2026-11-29' },

  // ── 12월 ──
  { id: 'ev-34', title: 'events.ev04.title', summary: 'events.ev04.summary', thumbnailUrl: IMG.culture, startAt: '2026-12-04', endAt: '2026-12-09' },
  { id: 'ev-35', title: 'events.ev11.title', summary: 'events.ev11.summary', thumbnailUrl: IMG.flower,  startAt: '2026-12-15', endAt: '2026-12-20' },
  { id: 'ev-36', title: 'events.ev17.title', summary: 'events.ev17.summary', thumbnailUrl: IMG.eco,     startAt: '2026-12-25', endAt: '2026-12-30' },
];
