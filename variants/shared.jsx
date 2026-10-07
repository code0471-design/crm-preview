// 공용 목업 데이터 — 3가지 시안 모두 사용

const DESIGNERS = [
  { id: 'unassigned', name: '미지정', role: '대기', color: '#94A3B8' },
  { id: 'moon',   name: '문지윤', role: '원장',   color: '#F59E0B' },
  { id: 'lee',    name: '이상현', role: '디자이너', color: '#EC4899' },
  { id: 'kimmj',  name: '김민주', role: '디자이너', color: '#8B5CF6' },
  { id: 'kims',   name: '김산',   role: '디자이너', color: '#06B6D4' },
  { id: 'kimjy',  name: '김지유', role: '인턴',   color: '#10B981' },
  { id: 'jung',   name: '정명희', role: '실장',   color: '#EF4444' },
  { id: 'leehj',  name: '이현진', role: '디자이너', color: '#3B82F6' },
  { id: 'park',   name: '박소현', role: '디자이너', color: '#14B8A6' },
  { id: 'choi',   name: '최유나', role: '인턴',   color: '#F472B6' },
  { id: 'yoon',   name: '윤재훈', role: '디자이너', color: '#0EA5E9' },
  { id: 'han',    name: '한지영', role: '디자이너', color: '#A855F7' },
  { id: 'song',   name: '송미란', role: '실장',   color: '#DC2626' },
  { id: 'kang',   name: '강태원', role: '디자이너', color: '#65A30D' },
  { id: 'oh',     name: '오지훈', role: '인턴',   color: '#EAB308' },
];

// 상태: confirmed(확정), visited(방문), noshow(노쇼), cancelled(취소), pending(대기)
const RESERVATIONS = [
  // 오전
  { id: 1, designer: 'moon',  start: '10:00', duration: 60,  customer: '박서연', menu: '루트터치업', status: 'visited',   memo: 'VIP' },
  { id: 2, designer: 'lee',   start: '10:00', duration: 90,  customer: '이하늘', menu: '디지털펌', status: 'visited' },
  { id: 3, designer: 'kimmj', start: '10:30', duration: 120, customer: '최민서', menu: '커트 + 클리닉', status: 'visited' },
  { id: 4, designer: 'kims',  start: '10:00', duration: 60,  customer: '조유진', menu: '앞머리컷', status: 'visited' },
  { id: 5, designer: 'jung',  start: '11:00', duration: 90,  customer: '한지민', menu: '전체염색', status: 'visited',   memo: '알러지 있음' },
  { id: 6, designer: 'leehj', start: '11:30', duration: 60,  customer: '오세훈', menu: '남성컷', status: 'visited' },
  { id: 7, designer: 'kimjy', start: '11:00', duration: 30,  customer: '윤지원', menu: '드라이', status: 'visited' },

  // 점심 브레이크
  { id: 't1', type: 'block', blockType: 'unavailable', designer: 'moon',  start: '12:30', duration: 60, label: '예약불가 (점심 휴식)' },
  { id: 't2', type: 'block', blockType: 'unavailable', designer: 'lee',   start: '13:00', duration: 60, label: '예약불가 (점심 휴식)' },
  { id: 't3', type: 'block', blockType: 'unavailable', designer: 'kimmj', start: '13:00', duration: 60, label: '예약불가 (점심 휴식)' },

  // 오후
  { id: 8,  designer: 'moon',  start: '13:30', duration: 60,  customer: '강수현', menu: '헤어스파', status: 'confirmed' },
  { id: 9,  designer: 'kims',  start: '13:00', duration: 120, customer: '정예린', menu: '매직스트레이트', status: 'confirmed', memo: '3시 전에 완료 요청' },
  { id: 10, designer: 'jung',  start: '13:30', duration: 90,  customer: '임채원', menu: '컷 + 뿌리염색', status: 'confirmed' },
  { id: 11, designer: 'leehj', start: '13:00', duration: 60,  customer: '문태호', menu: '남성 다운펌', status: 'confirmed' },
  { id: 12, designer: 'kimjy', start: '13:00', duration: 30,  customer: '노민아', menu: '드라이', status: 'noshow' },

  { id: 13, designer: 'unassigned', start: '14:00', duration: 60, customer: '박은경', menu: '뿌리톤 다운',  status: 'pending' },
  { id: 14, designer: 'unassigned', start: '14:30', duration: 30, customer: '김선일', menu: '상담 후 결정', status: 'pending' },
  { id: 15, designer: 'moon',  start: '15:00', duration: 90,  customer: '서다은', menu: '컷 + 클리닉', status: 'confirmed' },
  { id: 16, designer: 'lee',   start: '14:30', duration: 120, customer: '홍지수', menu: '볼륨매직 + 컷', status: 'confirmed', memo: '단골, 진한 컬러 선호' },
  { id: 17, designer: 'kimmj', start: '15:30', duration: 60,  customer: '전소미', menu: '뿌리염색', status: 'confirmed' },
  { id: 18, designer: 'kims',  start: '15:30', duration: 60,  customer: '박지훈', menu: '남성컷 + 다운펌', status: 'confirmed' },
  { id: 19, designer: 'jung',  start: '15:30', duration: 60,  customer: '유하린', menu: '앞머리 커트', status: 'cancelled' },
  { id: 20, designer: 'leehj', start: '14:30', duration: 90,  customer: '안지호', menu: '펌 리터치', status: 'confirmed' },

  { id: 21, designer: 'moon',  start: '17:00', duration: 60,  customer: '송경미', menu: '싱글러 뿌리 염색 (Scaring)', status: 'confirmed' },
  { id: 22, designer: 'lee',   start: '17:00', duration: 90,  customer: '김도윤', menu: '컷 + 매직', status: 'confirmed' },
  { id: 23, designer: 'kimmj', start: '17:30', duration: 60,  customer: '허은진', menu: '헤드스파', status: 'confirmed' },
  { id: 24, designer: 'kims',  start: '18:00', duration: 60,  customer: '양수빈', menu: '커트', status: 'confirmed' },
  { id: 25, designer: 'kimjy', start: '16:30', duration: 30,  customer: '나예지', menu: '드라이 + 세팅', status: 'confirmed' },
  { id: 26, designer: 'jung',  start: '18:30', duration: 60,  customer: '조현우', menu: '남성 커트', status: 'confirmed' },
  { id: 27, designer: 'leehj', start: '19:00', duration: 60,  customer: '김하늘', menu: '뿌리터치', status: 'confirmed' },

  // 청소 블록
  { id: 't4', type: 'block', designer: 'kimjy', start: '19:30', duration: 30, label: '정리/청소' },

  // 박소현 (신규 디자이너)
  { id: 28, designer: 'park', start: '10:00', duration: 60,  customer: '이수아', menu: '커트',           status: 'visited' },
  { id: 29, designer: 'park', start: '11:30', duration: 90,  customer: '장하윤', menu: '뿌리염색 + 클리닉', status: 'visited' },
  { id: 30, designer: 'park', start: '14:00', duration: 120, customer: '배지영', menu: '볼륨매직',        status: 'confirmed', memo: '단골' },
  { id: 31, designer: 'park', start: '16:30', duration: 60,  customer: '문가영', menu: '헤어스파',        status: 'confirmed' },
  { id: 32, designer: 'park', start: '18:00', duration: 90,  customer: '류지원', menu: '컷 + 뿌리염색',   status: 'confirmed' },
  { id: 't8', type: 'block', blockType: 'unavailable', designer: 'park', start: '13:00', duration: 60, label: '예약불가 (점심 휴식)' },

  // 최유나 (신규 인턴)
  { id: 33, designer: 'choi', start: '10:30', duration: 30, customer: '이서윤', menu: '드라이',      status: 'visited' },
  { id: 34, designer: 'choi', start: '11:30', duration: 30, customer: '박수민', menu: '앞머리컷',    status: 'visited' },
  { id: 35, designer: 'choi', start: '14:00', duration: 30, customer: '김나연', menu: '드라이',      status: 'confirmed' },
  { id: 36, designer: 'choi', start: '15:30', duration: 30, customer: '정하은', menu: '드라이',      status: 'confirmed' },
  { id: 37, designer: 'choi', start: '17:00', duration: 60, customer: '조민서', menu: '드라이 + 세팅', status: 'confirmed' },
  { id: 't9', type: 'block', blockType: 'unavailable', designer: 'choi', start: '13:00', duration: 60, label: '교육', reason: '인턴 교육' },

  // 윤재훈 (디자이너)
  { id: 38, designer: 'yoon', start: '10:00', duration: 60,  customer: '이도현', menu: '남성컷 + 다운펌',  status: 'visited' },
  { id: 39, designer: 'yoon', start: '11:30', duration: 60,  customer: '김재원', menu: '남성컷',          status: 'visited' },
  { id: 40, designer: 'yoon', start: '14:00', duration: 90,  customer: '이준우', menu: '펌 + 클리닉',      status: 'confirmed' },
  { id: 41, designer: 'yoon', start: '16:30', duration: 90,  customer: '박현진', menu: '컷 + 뿌리염색',    status: 'confirmed' },
  { id: 't10', type: 'block', blockType: 'unavailable', designer: 'yoon', start: '13:00', duration: 60, label: '예약불가 (점심 휴식)' },

  // 한지영 (디자이너)
  { id: 42, designer: 'han', start: '10:30', duration: 90,  customer: '유서진', menu: '디지털펌',         status: 'visited', memo: 'VIP' },
  { id: 43, designer: 'han', start: '13:00', duration: 60,  customer: '조은지', menu: '뿌리터치',         status: 'confirmed' },
  { id: 44, designer: 'han', start: '15:00', duration: 120, customer: '신유진', menu: '매직스트레이트',   status: 'confirmed' },
  { id: 45, designer: 'han', start: '18:00', duration: 60,  customer: '문가희', menu: '헤어스파',         status: 'confirmed' },

  // 송미란 (실장) — 오후 반차
  { id: 46, designer: 'song', start: '10:00', duration: 90,  customer: '고은비', menu: '전체염색',        status: 'visited' },
  { id: 47, designer: 'song', start: '11:30', duration: 60,  customer: '임서영', menu: '컷 + 클리닉',     status: 'visited' },
  { id: 'off2', type: 'block', blockType: 'unavailable', designer: 'song', start: '13:00', duration: 420, label: '오후 반차', reason: '오후 반차' },

  // 강태원 (디자이너)
  { id: 48, designer: 'kang', start: '11:00', duration: 60,  customer: '박태준', menu: '남성컷',          status: 'visited' },
  { id: 49, designer: 'kang', start: '13:30', duration: 90,  customer: '최지원', menu: '펌 + 컷',          status: 'confirmed' },
  { id: 50, designer: 'kang', start: '16:00', duration: 60,  customer: '이건우', menu: '남성 다운펌',      status: 'confirmed' },
  { id: 51, designer: 'kang', start: '17:30', duration: 30,  customer: '홍민석', menu: '남성컷',          status: 'confirmed' },

  // 오지훈 (인턴)
  { id: 52, designer: 'oh', start: '10:00', duration: 30, customer: '김보경', menu: '드라이',       status: 'visited' },
  { id: 53, designer: 'oh', start: '12:00', duration: 30, customer: '정예진', menu: '앞머리컷',     status: 'visited' },
  { id: 54, designer: 'oh', start: '14:30', duration: 30, customer: '이하영', menu: '드라이',       status: 'cancelled' },
  { id: 55, designer: 'oh', start: '16:00', duration: 60, customer: '조수아', menu: '드라이 + 세팅', status: 'confirmed' },
  { id: 't11', type: 'block', designer: 'oh', start: '19:00', duration: 30, label: '정리/청소' },

  // 예약불가 (사유 포함) — 개별 시간대 차단
  { id: 't5', type: 'block', blockType: 'unavailable', designer: 'jung',  start: '16:30', duration: 30, label: '외부 미팅', reason: '외부 미팅' },
  { id: 't6', type: 'block', blockType: 'unavailable', designer: 'kims',  start: '17:00', duration: 60, label: '교육 참석', reason: '내부 교육' },
  { id: 't7', type: 'block', blockType: 'unavailable', designer: 'leehj', start: '16:00', duration: 60, label: '개인 사정', reason: '개인 사정' },

  // 하루종일 휴무 (김민주) — 09:00 ~ 20:00 통째로 차단
  { id: 'off1', type: 'block', blockType: 'dayoff', designer: 'kimmj', start: '09:00', duration: 660, label: '휴무', reason: '휴무일' },
];

// 김민주는 오늘 휴무이므로 기존 예약을 제거 (예약과 휴무 중복 방지)
for (let i = RESERVATIONS.length - 1; i >= 0; i--) {
  const r = RESERVATIONS[i];
  if (r.designer === 'kimmj' && r.id !== 'off1' && r.id !== 't3') {
    // 기존 예약(3, 17, 23) 및 점심(t3) 제거 → 종일 휴무로 대체
    RESERVATIONS.splice(i, 1);
  } else if (r.id === 't3') {
    RESERVATIONS.splice(i, 1);
  }
}

// 오늘 요약 데이터
const SUMMARY = {
  todayRevenue: 2_840_000,
  yesterdayRevenue: 2_310_000,
  totalBookings: 27,
  completed: 12,
  upcoming: 13,
  waiting: 2,
  noshow: 1,
  cancelled: 1,
};

const WAITING_LIST = [
  { name: '박은경', wait: 8,  service: '뿌리톤 다운', preferred: '문지윤',   arrivedAt: '14:22' },
  { name: '김선일', wait: 3,  service: '상담',        preferred: '아무나',   arrivedAt: '14:27' },
];

// 시술중 리스트
const IN_SERVICE_LIST = [
  { name: '박서연', startAt: '13:30', service: '루트터치업 + 뿌리톤 다운', designer: '문지윤', elapsed: 60, total: 90 },
  { name: '이하늘', startAt: '13:45', service: '남자컷 + 스캘프 샴푸',       designer: '이상현', elapsed: 45, total: 50 },
  { name: '강수현', startAt: '14:00', service: '디지털펌',                    designer: '문지윤', elapsed: 30, total: 180 },
  { name: '문가영', startAt: '14:15', service: '뿌리염색',                    designer: '박소현', elapsed: 15, total: 90 },
];

// 시간 유틸
function timeToMin(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
function minToTime(mm) {
  const h = Math.floor(mm / 60);
  const m = mm % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

// 표시 시간: 09:00 ~ 20:00 = 660분 (11시간)
const DAY_START = 9 * 60;   // 540
const DAY_END   = 20 * 60;  // 1200
const SLOT_MIN  = 30;       // 30분 단위 그리드

function formatWon(n) {
  return new Intl.NumberFormat('ko-KR').format(n) + '원';
}

// ===== 매장 일정 목업 (2026.09) =====
const SCHEDULE_MONTH = { year: 2026, month: 9 };

const HOLIDAYS = {
  '2026-09-24': '추석',
  '2026-09-25': '추석 연휴',
  '2026-09-26': '추석 연휴',
};

const DAYOFFS = {
  moon:  [7, 14, 21, 28],
  lee:   [1, 8, 15, 22, 29],
  kimmj: [8, 15, 22, 29],
  kims:  [2, 9, 16, 23, 30],
  kimjy: [3, 10, 17],
  jung:  [4, 11, 18, 25],
  leehj: [7, 14, 21],
  park:  [3, 17],
  choi:  [10, 24],
  yoon:  [2, 16, 30],
  han:   [5, 12, 19],
  song:  [6, 13, 20, 27],
  kang:  [4, 18],
  oh:    [11, 25],
};

const SCHEDULE_EVENTS = [];
Object.entries(DAYOFFS).forEach(([designerId, days]) => {
  days.forEach(day => {
    SCHEDULE_EVENTS.push({
      id: `off-${designerId}-${day}`,
      date: `2026-09-${String(day).padStart(2,'0')}`,
      designerId,
      type: 'dayoff',
      label: '휴무',
    });
  });
});
Object.entries(HOLIDAYS).forEach(([date, label]) => {
  SCHEDULE_EVENTS.push({
    id: `holiday-${date}`,
    date,
    designerId: null,
    type: 'holiday',
    label,
  });
});

function formatMonthLabel(y, m) {
  return `${y}년 ${String(m).padStart(2,'0')}월`;
}

function buildCalendarGrid(year, month) {
  const first = new Date(year, month - 1, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const prevDays = new Date(year, month - 1, 0).getDate();
  const cells = [];
  for (let i = startWeekday - 1; i >= 0; i--) {
    cells.push({ day: prevDays - i, month: month - 1, inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, month, inMonth: true });
  }
  let next = 1;
  while (cells.length < 42) {
    cells.push({ day: next++, month: month + 1, inMonth: false });
  }
  return cells;
}

// ===== 객수 통계 목업 (이번주 9/6~9/11 6일치) =====
// 채널: 로드(신규) / 온라인(신규) / 소개(신규) / 재방문 / 대체
const STATS_CHANNELS = [
  { id:'road',     label:'로드(신규)',  color:'#3B82F6' },
  { id:'online',   label:'온라인(신규)', color:'#06B6D4' },
  { id:'intro',    label:'소개(신규)',   color:'#F59E0B' },
  { id:'revisit',  label:'재방문',       color:'#8B5CF6' },
  { id:'replace',  label:'대체',         color:'#EF4444' },
];

// 15명 × 5채널 방문수 (이번주 누적, 대부분 0인 초기 화면 스타일)
const STATS_VISITS = {
  unassigned: { road:0, online:0, intro:0, revisit:0, replace:0 },
  moon:       { road:2, online:5, intro:1, revisit:14, replace:0 },
  lee:        { road:1, online:3, intro:0, revisit:9,  replace:1 },
  kimmj:      { road:0, online:2, intro:1, revisit:6,  replace:0 },
  kims:       { road:1, online:2, intro:2, revisit:8,  replace:0 },
  kimjy:      { road:0, online:1, intro:0, revisit:3,  replace:0 },
  jung:       { road:3, online:4, intro:2, revisit:12, replace:0 },
  leehj:      { road:0, online:2, intro:1, revisit:5,  replace:1 },
  park:       { road:1, online:1, intro:0, revisit:4,  replace:0 },
  choi:       { road:0, online:0, intro:0, revisit:2,  replace:0 },
  yoon:       { road:2, online:2, intro:1, revisit:6,  replace:0 },
  han:        { road:1, online:3, intro:0, revisit:7,  replace:0 },
  song:       { road:0, online:1, intro:2, revisit:8,  replace:0 },
  kang:       { road:0, online:1, intro:0, revisit:4,  replace:0 },
  oh:         { road:0, online:0, intro:0, revisit:1,  replace:0 },
};

// 일별 채널 추이 (7일치 라인차트용) — 이번주 9/6(일) ~ 9/12(토)
const STATS_TREND = [
  { date:'09/06', dow:'일', road:2, online:5, intro:2, revisit:14, replace:0 },
  { date:'09/07', dow:'월', road:1, online:4, intro:1, revisit:11, replace:1 },
  { date:'09/08', dow:'화', road:3, online:6, intro:2, revisit:18, replace:0 },
  { date:'09/09', dow:'수', road:2, online:3, intro:1, revisit:13, replace:1 },
  { date:'09/10', dow:'목', road:1, online:5, intro:2, revisit:15, replace:0 },
  { date:'09/11', dow:'금', road:2, online:4, intro:2, revisit:12, replace:0 },
  { date:'09/12', dow:'토', road:0, online:0, intro:0, revisit:0,  replace:0 },
];

// ===== 일일 마감 목업 (2026.09.11) =====
// 결제수단
const PAY_METHODS = [
  { id:'cash', label:'현금',      color:'#10B981' },
  { id:'card', label:'카드',      color:'#3B82F6' },
  { id:'mix',  label:'현금+카드', color:'#8B5CF6' },
];

// 디자이너별 오늘 마감 내역 (예약중 완료건에서 파생 — 목업)
const CLOSING_TODAY = {
  moon: {
    name:'문지윤',
    rows: [
      { time:'10:00', customer:'박서연', menu:'루트터치업',   amount: 70000, channel:'revisit', pay:'card' },
      { time:'11:00', customer:'강수현', menu:'헤어스파',     amount: 70000, channel:'revisit', pay:'card' },
      { time:'13:30', customer:'강수현', menu:'헤어스파',     amount: 70000, channel:'revisit', pay:'card' },
    ],
    ticket:0, coupon:0, help:0,
  },
  lee: {
    name:'이상현',
    rows: [
      { time:'10:00', customer:'이하늘', menu:'디지털펌',      amount:180000, channel:'road', pay:'card' },
      { time:'15:30', customer:'김도윤', menu:'정액권 30만원', amount:300000, channel:'revisit', pay:'card', kind:'prepaid' },
    ],
    ticket:0, coupon:0, help:5000,
  },
  kims: {
    name:'김산',
    rows: [
      { time:'10:00', customer:'조유진', menu:'앞머리컷',      amount:  5000, channel:'revisit', pay:'cash' },
    ],
    ticket:0, coupon:0, help:0,
  },
  jung: {
    name:'정명희',
    rows: [
      { time:'11:00', customer:'한지민', menu:'전체염색',      amount:130000, channel:'intro', pay:'card' },
    ],
    ticket:0, coupon:15000, help:0,
  },
  leehj: {
    name:'이현진',
    rows: [
      { time:'11:30', customer:'오세훈', menu:'남성컷',        amount: 20000, channel:'online', pay:'cash' },
    ],
    ticket:0, coupon:0, help:0,
  },
  kimjy: {
    name:'김지유',
    rows: [
      { time:'11:00', customer:'윤지원', menu:'드라이',        amount: 15000, channel:'revisit', pay:'cash' },
    ],
    ticket:0, coupon:0, help:0,
  },
  park: {
    name:'박소현',
    rows: [
      { time:'10:00', customer:'이수아', menu:'커트',          amount: 25000, channel:'road',    pay:'card' },
      { time:'11:30', customer:'장하윤', menu:'뿌리염색+클리닉', amount:135000, channel:'revisit', pay:'mix' },
    ],
    ticket:0, coupon:0, help:0,
  },
  choi: {
    name:'최유나',
    rows: [
      { time:'10:30', customer:'이서윤', menu:'드라이',   amount:15000, channel:'revisit', pay:'cash' },
      { time:'11:30', customer:'박수민', menu:'앞머리컷', amount: 5000, channel:'revisit', pay:'cash' },
    ],
    ticket:0, coupon:0, help:0,
  },
  yoon: {
    name:'윤재훈',
    rows: [
      { time:'10:00', customer:'이도현', menu:'남성컷+다운펌', amount: 80000, channel:'road',    pay:'card' },
      { time:'11:30', customer:'김재원', menu:'남성컷',        amount: 20000, channel:'revisit', pay:'card' },
    ],
    ticket:0, coupon:0, help:0,
  },
  han: {
    name:'한지영',
    rows: [
      { time:'10:30', customer:'유서진', menu:'디지털펌',       amount:180000, channel:'intro', pay:'card' },
    ],
    ticket:0, coupon:0, help:0,
  },
  song: {
    name:'송미란',
    rows: [
      { time:'10:00', customer:'고은비', menu:'전체염색',       amount:130000, channel:'revisit', pay:'card' },
      { time:'11:30', customer:'임서영', menu:'컷 + 클리닉',    amount: 80000, channel:'revisit', pay:'card' },
    ],
    ticket:0, coupon:0, help:0,
  },
  kang: {
    name:'강태원',
    rows: [
      { time:'11:00', customer:'박태준', menu:'남성컷',         amount: 20000, channel:'revisit', pay:'cash' },
    ],
    ticket:0, coupon:0, help:0,
  },
  oh: {
    name:'오지훈',
    rows: [
      { time:'10:00', customer:'김보경', menu:'드라이',    amount:15000, channel:'revisit', pay:'cash' },
    ],
    ticket:0, coupon:0, help:0,
  },
};

// 내수 마감 (정액권/티켓/재고)
const CLOSING_INTERNAL = {
  ticketSold: [
    { name:'스파 10회권',  qty:1, amount:600000, customer:'박서연', designer:'moon' },
    { name:'염색 5회권',   qty:1, amount:450000, customer:'유서진', designer:'han' },
  ],
  ticketUsed: [
    { name:'스파 10회권',  qty:2, customer:'강수현', designer:'moon' },
    { name:'뿌리염색권',   qty:1, customer:'이하늘', designer:'lee' },
  ],
  stockUsed: [
    { name:'헤어에센스 200ml', qty:3, amount:120000 },
    { name:'컬러 트리트먼트', qty:5, amount:150000 },
  ],
};

// 메타 매출 (외부 정산)
const CLOSING_META = [
  { source:'네이버 예약',    amount: 240000, count: 3, note:'수수료 8%' },
  { source:'카카오 헤어샵',  amount: 180000, count: 2, note:'수수료 10%' },
  { source:'광고 캠페인 A', amount: -85000, count: 0, note:'집행 비용' },
  { source:'제휴 매장 정산', amount:  50000, count: 1, note:'교환 시술' },
];

// ===== 시술 메뉴 카테고리 & 아이템 =====
const MENU_CATEGORIES = [
  { id:'cut',      name:'컷&드라이',        color:'#3B82F6', checkin:true,  active:true },
  { id:'etc-perm', name:'기타펌',           color:'#F59E0B', checkin:false, active:true },
  { id:'basic-perm',name:'일반펌',           color:'#EC4899', checkin:true,  active:true },
  { id:'setting',  name:'셋팅 or 디지털펌', color:'#8B5CF6', checkin:true,  active:true },
  { id:'color',    name:'컬러링',           color:'#06B6D4', checkin:true,  active:true },
  { id:'magic',    name:'매직스트레이트',   color:'#10B981', checkin:true,  active:true },
  { id:'blending', name:'블렌딩 컬러',      color:'#EF4444', checkin:false, active:true },
  { id:'clinic',   name:'샴푸 헬핏',        color:'#14B8A6', checkin:true,  active:true },
];

const MENU_ITEMS = {
  cut: [
    { id:1,  name:'남자컷 (샴푸포함)',            price:8000,  duration:30, desc:'' },
    { id:2,  name:'여자 커트 (샴푸 별도 5천원)',    price:8000,  duration:30, desc:'' },
    { id:3,  name:'앞머리 컷',                    price:5000,  duration:15, desc:'' },
    { id:4,  name:'샴푸',                        price:8000,  duration:15, desc:'' },
    { id:5,  name:'스켈프 샴푸',                  price:13000, duration:20, desc:'' },
    { id:6,  name:'샴푸+토닉',                   price:18000, duration:25, desc:'' },
    { id:7,  name:'여자 커트+스팀 샴푸 세트',      price:19000, duration:45, desc:'' },
    { id:8,  name:'남자 컷 + 스팸 샴푸 세트',      price:19000, duration:45, desc:'' },
    { id:9,  name:'남자 드라이 (샴푸 5천원 추가)', price:29000, duration:30, desc:'' },
    { id:10, name:'남자 스타일링 (샴푸 5천원 추가)', price:15000, duration:30, desc:'' },
    { id:11, name:'비용추가',                    price:0,     duration:0,  desc:'상황별 추가 청구' },
  ],
  'etc-perm': [
    { id:20, name:'다운 펌',                     price:8000,  duration:60, desc:'' },
    { id:21, name:'다운펌',                     price:13000, duration:60, desc:'' },
    { id:22, name:'다운펌',                     price:18000, duration:80, desc:'' },
    { id:23, name:'다운펌',                     price:8000,  duration:60, desc:'남성 짧은 스타일' },
    { id:24, name:'다운펌',                     price:13000, duration:70, desc:'' },
    { id:25, name:'다운펌',                     price:19000, duration:90, desc:'' },
    { id:26, name:'다운펌',                     price:29000, duration:100, desc:'' },
    { id:27, name:'다운펌',                     price:0,     duration:0,  desc:'' },
  ],
  'basic-perm': [
    { id:30, name:'일반펌 숏 기장',              price:19000, duration:90,  desc:'' },
    { id:31, name:'일반펌 미디엄 기장',          price:29000, duration:120, desc:'' },
    { id:32, name:'일반펌 롱 기장',              price:39000, duration:150, desc:'' },
    { id:33, name:'일반펌 히피 디자이너 (트위스트)', price:49000, duration:180, desc:'' },
  ],
  setting: [
    { id:40, name:'열펌 숏 기장',                price:29000, duration:120, desc:'' },
    { id:41, name:'열펌 미디엄 기장',            price:39000, duration:150, desc:'' },
    { id:42, name:'열펌 롱 기장',                price:49000, duration:180, desc:'' },
    { id:43, name:'셋팅펌 (기존 열펌 + 볼륨 세팅)', price:59000, duration:210, desc:'' },
  ],
  color: [
    { id:50, name:'컬러 숏 기장',                price:49000, duration:90,  desc:'' },
    { id:51, name:'컬러 미디엄 기장',            price:59000, duration:120, desc:'' },
    { id:52, name:'컬러 롱 기장',                price:69000, duration:150, desc:'' },
  ],
  magic: [
    { id:60, name:'매직 숏 기장',                price:29000, duration:120, desc:'' },
    { id:61, name:'매직 미디엄 기장',            price:39000, duration:150, desc:'' },
    { id:62, name:'매직 롱 기장',                price:49000, duration:180, desc:'' },
  ],
  blending: [
    { id:70, name:'블렌딩 뿌리 염색 (5cm)',       price:29000, duration:60,  desc:'' },
    { id:71, name:'블렌딩 숏 기장',              price:39000, duration:90,  desc:'' },
    { id:72, name:'블렌딩 미디엄 기장',          price:49000, duration:120, desc:'' },
    { id:73, name:'블렌딩 롱 기장',              price:59000, duration:150, desc:'' },
  ],
  clinic: [
    { id:80, name:'헬핏 프로 (약산성)',           price:29000, duration:30,  desc:'' },
    { id:81, name:'헬핏 프리미엄',               price:49000, duration:40,  desc:'' },
    { id:82, name:'헬핏 두피케어',               price:39000, duration:35,  desc:'' },
    { id:83, name:'헬핏 트리트먼트 마사지',       price:59000, duration:50,  desc:'' },
  ],
};

// ==== 메뉴 관리 나머지 탭 데이터 ====

// 제품 (헤어 제품/굿즈)
const PRODUCT_CATEGORIES = [
  { id:'shampoo',    name:'샴푸/컨디셔너', color:'#3B82F6', checkin:true, active:true },
  { id:'treatment',  name:'트리트먼트',   color:'#10B981', checkin:true, active:true },
  { id:'styling',    name:'스타일링',     color:'#F59E0B', checkin:false, active:true },
  { id:'tool',       name:'헤어 도구',    color:'#8B5CF6', checkin:false, active:true },
  { id:'gift',       name:'기프트/세트',  color:'#EC4899', checkin:false, active:true },
];
const PRODUCT_ITEMS = {
  shampoo: [
    { id:100, name:'모이스처 샴푸 500ml',    price:38000, stock:12, brand:'루미' },
    { id:101, name:'클렌징 샴푸 300ml',      price:28000, stock:8,  brand:'루미' },
    { id:102, name:'실크 컨디셔너 500ml',    price:42000, stock:15, brand:'루미' },
    { id:103, name:'두피 케어 샴푸 250ml',   price:32000, stock:5,  brand:'헤어헤븐' },
  ],
  treatment: [
    { id:110, name:'헤어팩 마스크 200ml',    price:55000, stock:9,  brand:'루미' },
    { id:111, name:'앰플 트리트먼트 150ml',  price:68000, stock:6,  brand:'프리미엄' },
    { id:112, name:'모발 강화 세럼 50ml',    price:82000, stock:3,  brand:'프리미엄' },
  ],
  styling: [
    { id:120, name:'헤어 에센스 100ml',      price:35000, stock:14, brand:'루미' },
    { id:121, name:'스타일링 왁스 80g',      price:22000, stock:20, brand:'헤어헤븐' },
    { id:122, name:'볼륨 스프레이 200ml',    price:29000, stock:11, brand:'루미' },
  ],
  tool: [
    { id:130, name:'세라믹 브러시 中',        price:45000, stock:4,  brand:'툴박스' },
    { id:131, name:'드라이 롤 브러시 大',     price:38000, stock:2,  brand:'툴박스' },
  ],
  gift: [
    { id:140, name:'홈케어 3종 선물세트',     price:98000, stock:6,  brand:'루미' },
    { id:141, name:'헤어 트래블 키트',        price:45000, stock:8,  brand:'루미' },
  ],
};

// 패키지 (정액권/회수권)
const PACKAGE_CATEGORIES = [
  { id:'spa',      name:'스파 회수권',    color:'#8B5CF6', checkin:true, active:true },
  { id:'clinic',   name:'클리닉 회수권',  color:'#06B6D4', checkin:true, active:true },
  { id:'color',    name:'컬러 회수권',    color:'#EC4899', checkin:true, active:true },
  { id:'combo',    name:'통합 이용권',    color:'#F59E0B', checkin:true, active:true },
];
const PACKAGE_ITEMS = {
  spa: [
    { id:200, name:'헤어스파 5회권',   price:280000, sessions:5,  validDays:180 },
    { id:201, name:'헤어스파 10회권',  price:520000, sessions:10, validDays:365 },
    { id:202, name:'두피스파 5회권',   price:320000, sessions:5,  validDays:180 },
  ],
  clinic: [
    { id:210, name:'클리닉 5회권',    price:250000, sessions:5,  validDays:180 },
    { id:211, name:'클리닉 10회권',   price:480000, sessions:10, validDays:365 },
  ],
  color: [
    { id:220, name:'뿌리염색 5회권',  price:320000, sessions:5,  validDays:180 },
    { id:221, name:'컬러 케어 6회권', price:390000, sessions:6,  validDays:180 },
  ],
  combo: [
    { id:230, name:'프리미엄 케어 12회', price:1200000, sessions:12, validDays:365, note:'스파 6 + 클리닉 6' },
  ],
};

// 커스텀 (여러 카테고리 시술을 조합한 콤보 메뉴)
const CUSTOM_CATEGORIES = [
  { id:'cut-perm',    name:'컷 + 펌',         color:'#8B5CF6', checkin:true, active:true },
  { id:'cut-color',   name:'컷 + 컬러',       color:'#EC4899', checkin:true, active:true },
  { id:'perm-color',  name:'펌 + 컬러',       color:'#F59E0B', checkin:true, active:true },
  { id:'care-combo',  name:'시술 + 케어',     color:'#10B981', checkin:true, active:true },
];
const CUSTOM_ITEMS = {
  'cut-perm': [
    { id:300, name:'컷 + 다운펌',             price:36000, duration:90,  combo:'남자컷 + 다운펌' },
    { id:301, name:'여자 커트 + 일반펌',      price:47000, duration:120, combo:'여자컷 + 일반펌' },
    { id:302, name:'남자 커트 + 셋팅펌',      price:67000, duration:150, combo:'남자컷 + 셋팅펌' },
  ],
  'cut-color': [
    { id:310, name:'컷 + 뿌리염색',           price:65000, duration:100, combo:'남자컷 + 뿌리염색' },
    { id:311, name:'여자 커트 + 전체염색',    price:88000, duration:150, combo:'여자컷 + 전체염색' },
    { id:312, name:'컷 + 블렌딩 컬러',        price:75000, duration:120, combo:'컷 + 블렌딩 컬러' },
  ],
  'perm-color': [
    { id:320, name:'일반펌 + 뿌리염색',       price:78000, duration:150, combo:'일반펌 + 뿌리염색' },
    { id:321, name:'디지털펌 + 컬러',         price:98000, duration:210, combo:'디지털펌 + 컬러' },
  ],
  'care-combo': [
    { id:330, name:'컷 + 클리닉',             price:38000, duration:60,  combo:'남자컷 + 헬핏 프로' },
    { id:331, name:'컬러 + 헤어스파',         price:98000, duration:150, combo:'전체염색 + 헤어스파' },
    { id:332, name:'펌 + 트리트먼트',         price:88000, duration:180, combo:'일반펌 + 트리트먼트 마사지' },
  ],
};

// 할인 (정률/정액)
const DISCOUNT_CATEGORIES = [
  { id:'percent',   name:'정률 할인',    color:'#3B82F6', checkin:false, active:true },
  { id:'amount',    name:'정액 할인',    color:'#10B981', checkin:false, active:true },
  { id:'promo',     name:'프로모션',     color:'#F59E0B', checkin:true,  active:true },
];
const DISCOUNT_ITEMS = {
  percent: [
    { id:400, name:'신규 고객 10% 할인',   type:'percent', value:10, condition:'첫 방문만',  active:true },
    { id:401, name:'VIP 15% 할인',        type:'percent', value:15, condition:'VIP 등급',   active:true },
    { id:402, name:'생일 20% 할인',        type:'percent', value:20, condition:'생일 월',   active:true },
  ],
  amount: [
    { id:410, name:'재방문 3천원 할인',    type:'amount', value:3000,  condition:'재방문 시', active:true },
    { id:411, name:'소개 할인',           type:'amount', value:10000, condition:'소개 시',   active:true },
  ],
  promo: [
    { id:420, name:'가을 시즌 프로모션',    type:'percent', value:15,   condition:'~ 11.30',   active:true },
    { id:421, name:'주중 오전 할인',       type:'amount',  value:5000, condition:'평일 10-12시', active:true },
  ],
};

// ===== 고객 목업 (예약 추가 모달용) =====
// ===== 예약금 (네이버 예약금 등) — 예약 등록 시 입력, 매출 입력에서 차감 =====
// key: 고객명 (목업). 네이버 연동 전까지 수기 입력
const BOOKING_DEPOSITS = {
  '박서연': { amount:20000, channel:'naver', paidAt:'2026.09.28' },
  '강수현': { amount:30000, channel:'naver', paidAt:'2026.09.27' },
  '홍지수': { amount:50000, channel:'transfer', paidAt:'2026.09.25' },
};

// ===== 고객 보유 자산 (정액권 잔액 / 티켓) — 날개·매출입력 공용 =====
const CUSTOMER_ASSETS = {
  '박서연': { membership:168000, tickets:[{ id:'spa', name:'헤어스파', remain:3, total:5, unit:56000, price:280000, bought:'2026.01.20' }, { id:'clinic', name:'클리닉', remain:7, total:10, unit:48000, price:480000, bought:'2025.09.15' }] },
  '강수현': { membership:250000, tickets:[] },
  '서다은': { membership:0,      tickets:[{ id:'spa', name:'헤어스파', remain:2, total:5, unit:56000, price:280000, bought:'2026.05.02' }] },
  '홍지수': { membership:420000, tickets:[{ id:'clinic', name:'클리닉', remain:4, total:10, unit:48000, price:480000, bought:'2026.02.11' }] },
  '배지영': { membership:90000,  tickets:[] },
  '문가영': { membership:0,      tickets:[{ id:'color', name:'컬러', remain:1, total:3, unit:70000, price:210000, bought:'2026.06.20' }] },
  '이하늘': { membership:55000,  tickets:[] },
  '신유진': { membership:0,      tickets:[{ id:'spa', name:'헤어스파', remain:5, total:10, unit:52000, price:520000, bought:'2026.08.01' }] },
  '김도윤': { membership:130000, tickets:[{ id:'clinic', name:'클리닉', remain:2, total:5, unit:50000, price:250000, bought:'2026.04.09' }] },
};

const CUSTOMERS = [
  { id:1,  name:'박서연', phone:'010-2221-3345', tags:['VIP','단골'],   lastVisit:'2026-09-11', totalVisits:12, mainDesigner:'moon',  memo:'알러지 있음' },
  { id:2,  name:'이하늘', phone:'010-4451-1129', tags:['단골'],          lastVisit:'2026-09-08', totalVisits:6,  mainDesigner:'lee',   memo:'' },
  { id:3,  name:'강수현', phone:'010-8801-2231', tags:['VIP'],           lastVisit:'2026-09-08', totalVisits:15, mainDesigner:'moon',  memo:'3시 전 완료 요청' },
  { id:4,  name:'서다은', phone:'010-3345-6612', tags:['단골'],          lastVisit:'2026-09-08', totalVisits:8,  mainDesigner:'moon',  memo:'' },
  { id:5,  name:'문가영', phone:'010-5567-2298', tags:['신규'],          lastVisit:'2026-09-11', totalVisits:1,  mainDesigner:'park',  memo:'' },
  { id:6,  name:'유서진', phone:'010-3345-6612', tags:['VIP'],           lastVisit:'2026-09-11', totalVisits:9,  mainDesigner:'han',   memo:'' },
  { id:7,  name:'배지영', phone:'010-7723-1123', tags:['단골'],          lastVisit:'2026-09-11', totalVisits:5,  mainDesigner:'park',  memo:'' },
  { id:8,  name:'조은지', phone:'010-3323-4467', tags:[],                lastVisit:'2026-09-11', totalVisits:2,  mainDesigner:'han',   memo:'' },
  { id:9,  name:'이수아', phone:'010-9987-4412', tags:['신규'],          lastVisit:'2026-09-11', totalVisits:1,  mainDesigner:'park',  memo:'' },
  { id:10, name:'박수민', phone:'010-7712-9987', tags:[],                lastVisit:'2026-09-11', totalVisits:3,  mainDesigner:'choi',  memo:'' },
  { id:11, name:'박진규', phone:'010-7383-3115', tags:[],                lastVisit:'2026-08-30', totalVisits:2,  mainDesigner:'unassigned', memo:'' },
  { id:12, name:'채상윤', phone:'010-3924-1866', tags:[],                lastVisit:'2026-08-22', totalVisits:1,  mainDesigner:'unassigned', memo:'' },
  { id:13, name:'신은경', phone:'010-6249-1093', tags:['단골'],          lastVisit:'2026-09-01', totalVisits:7,  mainDesigner:'lee',   memo:'' },
  { id:14, name:'이호정', phone:'010-6514-4778', tags:[],                lastVisit:'2026-08-15', totalVisits:1,  mainDesigner:'unassigned', memo:'' },
  { id:15, name:'이진희', phone:'010-9096-3596', tags:[],                lastVisit:'2026-09-05', totalVisits:2,  mainDesigner:'jung',  memo:'' },
  { id:16, name:'서해복', phone:'010-5593-6198', tags:['단골'],          lastVisit:'2026-09-12', totalVisits:5,  mainDesigner:'jung',  memo:'' },
  { id:17, name:'이수경', phone:'010-5708-9096', tags:[],                lastVisit:'2026-08-28', totalVisits:1,  mainDesigner:'unassigned', memo:'' },
];

// ===== 스태프 관리 =====
// 근무상태: active | leave | resigned
const STAFF = [
  { id:1,  name:'최유리', designerName:'최유리', role:'디자이너', loginId:'choi.yr',   phone:'010-3221-1123', hireDate:'2024-03-15', resignDate:null,          status:'active',   checkin:true,  floater:false, permissionRole:'designer' },
  { id:2,  name:'박선영', designerName:'박선영', role:'디자이너', loginId:'park.sy',   phone:'010-8231-4412', hireDate:'2023-11-02', resignDate:null,          status:'active',   checkin:true,  floater:false, permissionRole:'designer' },
  { id:3,  name:'김덕숙', designerName:'김덕숙', role:'디자이너', loginId:'kim.dsuk',  phone:'010-4451-2298', hireDate:'2024-05-20', resignDate:null,          status:'active',   checkin:true,  floater:false, permissionRole:'designer' },
  { id:4,  name:'손정은', designerName:'손정은', role:'디자이너', loginId:'son.je',    phone:'010-3392-1146', hireDate:'2023-07-11', resignDate:null,          status:'active',   checkin:false, floater:true, permissionRole:'designer'  },
  { id:5,  name:'백윤지', designerName:'백윤지', role:'디자이너', loginId:'baek.yj',   phone:'010-7712-3345', hireDate:'2025-01-06', resignDate:null,          status:'active',   checkin:true,  floater:false, permissionRole:'designer' },
  { id:6,  name:'이현진', designerName:'이현진', role:'디자이너', loginId:'lee.hj',    phone:'010-2231-9987', hireDate:'2022-04-18', resignDate:null,          status:'active',   checkin:true,  floater:false, permissionRole:'designer' },
  { id:7,  name:'정명희', designerName:'정명희', role:'실장',     loginId:'jung.mh',   phone:'010-8801-3325', hireDate:'2020-09-01', resignDate:null,          status:'active',   checkin:true,  floater:false, permissionRole:'designer' },
  { id:8,  name:'김지유', designerName:'김지유', role:'인턴',     loginId:'kim.jy',    phone:'010-4442-6612', hireDate:'2025-06-10', resignDate:null,          status:'active',   checkin:true,  floater:false, permissionRole:'intern' },
  { id:9,  name:'김산',   designerName:'김산',   role:'디자이너', loginId:'kim.san',   phone:'010-3391-4478', hireDate:'2023-08-22', resignDate:null,          status:'active',   checkin:true,  floater:true, permissionRole:'designer'  },
  { id:10, name:'김민주', designerName:'김민주', role:'디자이너', loginId:'kim.mj',    phone:'010-6621-8892', hireDate:'2024-02-14', resignDate:null,          status:'leave',    checkin:false, floater:false, permissionRole:'designer' },
  { id:11, name:'조희정', designerName:'조희정', role:'디자이너', loginId:'jo.hj',     phone:'010-7723-5541', hireDate:'2022-05-30', resignDate:'2026-07-22',  status:'resigned', checkin:false, floater:false, permissionRole:'designer' },
  { id:12, name:'매장',   designerName:'매장',   role:'원장',     loginId:'admin',     phone:'010-5096-3265', hireDate:'2018-01-01', resignDate:'2026-07-15',  status:'resigned', checkin:false, floater:false, permissionRole:'admin' },
  { id:13, name:'미지정 직원', designerName:'_unmapped', role:'디자이너', loginId:'unmapped01', phone:'-', hireDate:'-', resignDate:'2026-06-30', status:'resigned', checkin:false, floater:false, permissionRole:'designer' },
  { id:14, name:'희수',   designerName:'희수',   role:'디자이너', loginId:'heesoo',    phone:'-',            hireDate:'-',          resignDate:'2026-05-11',  status:'resigned', checkin:false, floater:false, permissionRole:'designer' },
  { id:15, name:'문지윤', designerName:'문지윤', role:'원장',     loginId:'moon.jy',   phone:'010-1234-5678', hireDate:'2019-03-01', resignDate:null,          status:'active',   checkin:true,  floater:false, isOwner:true, permissionRole:'admin' },
];

// 권한 트리 (사이드바 메뉴 구조와 매칭)
const PERMISSION_TREE = [
  {
    id:'basic',
    title:'기본',
    items:[
      { id:'own-sales',    label:'담당자 매출만 조회' },
      { id:'own-booking',  label:'담당자 예약만 조회' },
      { id:'own-schedule', label:'담당자 일정만 조회' },
    ],
  },
  {
    id:'dashboard',
    title:'대시보드',
    items:[
      { id:'dash-view',    label:'대시보드 조회' },
      { id:'dash-export',  label:'대시보드 내보내기' },
    ],
  },
  {
    id:'schedule',
    title:'스케줄',
    items:[
      { id:'sch-booking',  label:'예약 현황' },
      { id:'sch-store',    label:'매장 일정' },
      { id:'sch-stats',    label:'객수 통계' },
      { id:'sch-closing',  label:'일일 마감' },
      { id:'sch-sub',      label:'담당자 대체현황' },
    ],
  },
  {
    id:'marketing',
    title:'마케팅',
    items:[
      { id:'mkt-view',     label:'캠페인 조회' },
      { id:'mkt-create',   label:'캠페인 생성' },
      { id:'mkt-send',     label:'발송 관리' },
    ],
  },
  {
    id:'analytics',
    title:'분석',
    items:[
      { id:'ana-view',     label:'리포트 조회' },
      { id:'ana-export',   label:'리포트 다운로드' },
    ],
  },
  {
    id:'store',
    title:'스토어',
    items:[
      { id:'store-view',   label:'제품 조회' },
      { id:'store-stock',  label:'재고 관리' },
      { id:'store-order',  label:'발주 관리' },
    ],
  },
  {
    id:'settings',
    title:'설정',
    items:[
      { id:'set-menu',     label:'메뉴 관리' },
      { id:'set-staff',    label:'스태프 관리' },
      { id:'set-ops',      label:'운영 관리' },
      { id:'set-sms',      label:'SMS 매니저 서비스' },
      { id:'set-payroll',  label:'실시간 급여정산' },
      { id:'set-lumi',     label:'쌀롱 루미 설정' },
      { id:'set-terminal', label:'단말기 설정' },
      { id:'set-phone',    label:'수신전화 설정' },
      { id:'set-group',    label:'고객 그룹 설정' },
    ],
  },
];

// 역할 프리셋 (권한 체크 기본값)
const ROLE_PRESETS = {
  admin: { // 관리자: 전부 체크
    label:'관리자',
    perms: (() => {
      const s = new Set();
      PERMISSION_TREE.forEach(sec => sec.items.forEach(it => s.add(it.id)));
      return Array.from(s);
    })(),
  },
  designer: { // 디자이너: 기본 3 + 예약/일정 조회 + 대시보드
    label:'디자이너',
    perms: ['own-sales','own-booking','own-schedule','dash-view','sch-booking','sch-store','sch-closing'],
  },
  intern: { // 인턴: 기본 3 + 예약 현황만
    label:'인턴',
    perms: ['own-booking','own-schedule','sch-booking'],
  },
  custom: {
    label:'커스텀',
    perms: [],
  },
};

// 카테고리 색상 팔레트 (모달용) - 15개
const MENU_COLOR_PALETTE = [
  '#3B82F6', '#06B6D4', '#10B981', '#14B8A6', '#22C55E',
  '#EAB308', '#F59E0B', '#F97316', '#EF4444', '#EC4899',
  '#D946EF', '#8B5CF6', '#6366F1', '#0EA5E9', '#64748B',
];

Object.assign(window, {
  DESIGNERS, RESERVATIONS, SUMMARY, WAITING_LIST, IN_SERVICE_LIST,
  timeToMin, minToTime, formatWon,
  DAY_START, DAY_END, SLOT_MIN,
  SCHEDULE_MONTH, HOLIDAYS, SCHEDULE_EVENTS,
  formatMonthLabel, buildCalendarGrid,
  STATS_CHANNELS, STATS_VISITS, STATS_TREND,
  PAY_METHODS, CLOSING_TODAY, CLOSING_INTERNAL, CLOSING_META,
  MENU_CATEGORIES, MENU_ITEMS, MENU_COLOR_PALETTE,
  PRODUCT_CATEGORIES, PRODUCT_ITEMS,
  PACKAGE_CATEGORIES, PACKAGE_ITEMS,
  CUSTOM_CATEGORIES, CUSTOM_ITEMS,
  DISCOUNT_CATEGORIES, DISCOUNT_ITEMS,
  STAFF, PERMISSION_TREE, ROLE_PRESETS,
  CUSTOMERS, BOOKING_DEPOSITS, CUSTOMER_ASSETS,
});
