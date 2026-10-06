// 마케팅 › 발송내역 & 성과리포트 — 목업 데이터
const { MKT_CUSTOMERS: RP_CUST, MKT_UNIT: RP_UNIT } = window;

const RP_TODAY = '2026-09-21';
// 전환 집계 기간별 비율 (30일 = 1)
const RP_WINDOWS = [
  { id:'7',  label:'7일',  k:0.55 },
  { id:'14', label:'14일', k:0.8 },
  { id:'30', label:'30일', k:1 },
];

// 단체발송 캠페인
const RP_BULK = [
  { id:'b9', at:'2026-09-22 11:00', title:'추석 연휴 휴무 안내', channel:'lms', ad:false, status:'scheduled',
    target:['전체 고객','최근 6개월 방문'], planned:842, cost:0, conv:false,
    body:'#{고객명}님, 안녕하세요.\n추석 연휴(9/24~9/26)는 매장 휴무입니다.\n연휴 전후 예약은 미리 문의 부탁드려요.' },
  { id:'b8', at:'2026-09-20 11:00', title:'9월 생일 고객 15% 할인', channel:'lms', ad:true, status:'done',
    target:['이번 달 생일'], sent:96, ok:94, booked:21, visited:17, revenue:1_870_000,
    body:'#{고객명}님, 생일 진심으로 축하드려요!\n생일 달에 방문하시면 전 시술 15% 할인해 드릴게요.' },
  { id:'b7', at:'2026-09-16 14:30', title:'휴면 고객 클리닉 무료 쿠폰', channel:'lms', ad:true, status:'done',
    target:['휴면 3개월','방문 2회 이상'], sent:388, ok:371, booked:46, visited:39, revenue:4_210_000,
    body:'#{고객명}님, 오랜만이에요!\n이번 달 안에 재방문하시면 클리닉 1회를 무료로 해드려요.' },
  { id:'b6', at:'2026-09-10 10:00', title:'가을 컬러 이벤트 20%', channel:'mms', ad:true, status:'done', image:true,
    target:['여성','20대·30대','시술 컬러링'], sent:524, ok:509, booked:58, visited:51, revenue:6_480_000,
    body:'[가을 컬러 이벤트]\n10/1 ~ 10/31 전체 컬러 시술 20% 할인!\n트리트먼트 추가 시 홈케어 샘플 증정.' },
  { id:'b5', at:'2026-09-05 18:00', title:'첫 방문 고객 재방문 혜택', channel:'sms', ad:true, status:'done',
    target:['첫 방문 후 30일+ 미재방문','온라인'], sent:142, ok:139, booked:12, visited:9, revenue:612_000,
    body:'#{고객명}님, 첫 방문 감사했어요! 2번째 방문 시 컷 10% 할인해 드려요.' },
  { id:'b4', at:'2026-09-02 11:00', title:'포인트 소멸 예정 안내', channel:'alimtalk', ad:false, status:'done',
    target:['포인트 1만P+'], sent:213, ok:198, fallback:12, booked:18, visited:16, revenue:1_340_000,
    body:'#{고객명}님, 보유하신 #{잔여포인트}가 이번 달 말 소멸 예정이에요.' },
  { id:'b3', at:'2026-08-27 11:00', title:'정액권 고객 감사 이벤트', channel:'lms', ad:true, status:'done',
    target:['정액권 잔액 있음'], sent:186, ok:183, booked:22, visited:20, revenue:2_150_000,
    body:'#{고객명}님, 늘 찾아주셔서 감사해요. 9월 한 달 정액권 결제 시 10% 추가 적립!' },
  { id:'b2', at:'2026-08-14 15:00', title:'여름 두피 스케일링', channel:'sms', ad:true, status:'done',
    target:['전체 고객'], sent:1180, ok:1121, booked:41, visited:33, revenue:2_640_000,
    body:'(광고) 여름 두피 스케일링 30% 할인! 8월 말까지.' },
  { id:'b1', at:'2026-08-03 11:00', title:'8월 생일 고객 15% 할인', channel:'lms', ad:true, status:'done',
    target:['이번 달 생일'], sent:104, ok:101, booked:19, visited:15, revenue:1_520_000,
    body:'#{고객명}님, 생일 진심으로 축하드려요!' },
].map(c => ({
  kind:'bulk', ...c,
  fail: c.sent != null ? c.sent - c.ok - (c.fallback || 0) : 0,
  cost: c.status === 'scheduled' ? 0 : (c.ok * RP_UNIT[c.channel].price + (c.fallback || 0) * RP_UNIT.lms.price),
  conv: c.conv !== false,
}));

// 자동발송 — 트리거별 기간 합계 (이번 달)
const RP_AUTO = [
  { id:'a-rsv',    name:'예약 안내',       channel:'alimtalk', sent:612, ok:604, fallback:6, conv:false },
  { id:'a-remind', name:'예약일 확인',     channel:'alimtalk', sent:488, ok:481, fallback:5, conv:false, noshowCut:true },
  { id:'a-birth',  name:'생일 고객',       channel:'lms',      sent:94,  ok:92,  booked:17, visited:14, revenue:1_490_000 },
  { id:'a-after',  name:'시술 후 안내',    channel:'lms',      sent:276, ok:271, booked:39, visited:34, revenue:3_160_000 },
  { id:'a-new',    name:'신규 고객 등록',  channel:'sms',      sent:58,  ok:58,  booked:9,  visited:7,  revenue:420_000 },
  { id:'a-pp-exp', name:'정액권 만료',     channel:'alimtalk', sent:41,  ok:40,  booked:14, visited:13, revenue:980_000 },
  { id:'a-pp-use', name:'정액권 사용',     channel:'alimtalk', sent:233, ok:231, conv:false },
].map(a => ({
  kind:'auto', ...a,
  fail: a.sent - a.ok - (a.fallback || 0),
  cost: a.ok * RP_UNIT[a.channel].price + (a.fallback || 0) * RP_UNIT.lms.price,
  conv: a.conv !== false,
}));

// 일별 발송 (9월 1일~21일)
const RP_DAILY = (() => {
  let s = 921;
  const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const out = [];
  for (let d = 1; d <= 21; d++) {
    const dow = new Date(2026, 8, d).getDay();
    const auto = Math.round((dow === 1 ? 20 : 70) + r() * 40);
    const b = RP_BULK.find(c => c.status === 'done' && c.at.startsWith(`2026-09-${String(d).padStart(2,'0')}`));
    out.push({ d, dow, auto, bulk: b ? b.ok + (b.fallback || 0) : 0, visit: Math.round(r() * 8 + (b ? b.visited * 0.3 : 0)) });
  }
  return out;
})();

const RP_FAIL_REASONS = ['결번·없는 번호','수신 거부','스팸 차단','단말기 수신 불가'];

// 캠페인 상세용 수신자 샘플 (결정적)
function rpRecipients(c) {
  const n = Math.min(c.sent || c.planned || 0, 60);
  let s = c.id.charCodeAt(1) * 977;
  const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const start = Math.floor(r() * (RP_CUST.length - n - 1));
  const okRate = c.sent ? c.ok / c.sent : 1;
  const fbRate = c.sent ? (c.fallback || 0) / c.sent : 0;
  const bkRate = c.sent ? (c.booked || 0) / c.sent : 0;
  return RP_CUST.slice(start, start + n).map((cu, i) => {
    const x = r();
    const res = c.status === 'scheduled' ? 'wait' : x < okRate ? 'ok' : x < okRate + fbRate ? 'fallback' : 'fail';
    const booked = res !== 'fail' && res !== 'wait' && r() < bkRate * 1.4;
    const visited = booked && r() < 0.82;
    return {
      id: cu.id, name: cu.name, phone: cu.phone, res,
      reason: res === 'fail' ? RP_FAIL_REASONS[Math.floor(r() * RP_FAIL_REASONS.length)] : null,
      booked, visited,
      bookDay: booked ? 1 + Math.floor(r() * 12) : null,
      amount: visited ? (4 + Math.floor(r() * 20)) * 10000 : 0,
    };
  });
}

Object.assign(window, { RP_TODAY, RP_WINDOWS, RP_BULK, RP_AUTO, RP_DAILY, rpRecipients });
