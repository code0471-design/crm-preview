// 마케팅 · 단체발송 — 목업 데이터 & 필터 로직
const { DESIGNERS: MKT_DESIGNERS_ALL, MENU_CATEGORIES: MKT_MENU_CATS, PACKAGE_CATEGORIES: MKT_PKG_CATS_SRC } = window;
const MKT_TICKET_CATS = (MKT_PKG_CATS_SRC || []).map(c => ({ id:c.id, name:c.name, color:c.color }));
const MKT_CHANNELS = [
  { id:'road',   label:'로드',   color:'#3B82F6' },
  { id:'online', label:'온라인', color:'#06B6D4' },
  { id:'intro',  label:'소개',   color:'#F59E0B' },
];
const MKT_MEMOS = ['알러지 있음','두피 민감','3시 전 완료 요청','주차 필요','염색 알러지 테스트 필요','조용한 시술 선호','앞머리만 자주 방문','남편과 함께 방문','아이 동반','곱슬 심함 · 매직 주기 3개월','탈색 이력 있음','VIP 응대','네이버 리뷰 작성','문자 수신 선호','전화 X · 문자만'];

const MKT_TODAY = new Date(2026, 8, 21); // 2026-09-21 (앱 기준 오늘)
const MKT_STORE = { name:'카이키키 부평본점', tel:'032-505-1122', optout:'080-855-1290' };

const MKT_BALANCE = 17486;
const MKT_UNIT = {
  alimtalk: { label:'알림톡',   price:18,  color:'#FEE500', ink:'#3C1E1E' },
  sms:      { label:'단문 문자', price:20,  color:'#10B981', ink:'#fff' },
  lms:      { label:'장문 문자', price:48,  color:'#3B82F6', ink:'#fff' },
  mms:      { label:'이미지 문자', price:150, color:'#8B5CF6', ink:'#fff' },
};

function mktRng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MKT_DESIGNERS = MKT_DESIGNERS_ALL.filter(d => d.id !== 'unassigned');
const MKT_CATS = (MKT_MENU_CATS || []).map(c => ({ id:c.id, name:c.name, color:c.color }));

const MKT_CUSTOMERS = (() => {
  const r = mktRng(20260921);
  const pick = (arr) => arr[Math.floor(r() * arr.length)];
  const SUR = ['김','이','박','최','정','강','조','윤','장','임','한','오','서','신','권','황','안','송','유','홍','문','배','백','허'];
  const GIV_F = ['서연','하늘','수현','다은','가영','서진','지영','은지','수아','수민','유나','지민','예린','소윤','하은','민지','채원','윤서','지아','혜진','미경','은경','정은','선영','현주','보람','나연','다혜','세린','지수'];
  const GIV_M = ['진규','상윤','호정','준호','민재','태현','성훈','도윤','현우','지훈','재원','승민'];
  const list = [];
  for (let i = 1; i <= 1342; i++) {
    const female = r() < 0.84;
    const visits = Math.max(1, Math.floor(1 + Math.pow(r(), 2.2) * 38));
    const lastDays = Math.floor(Math.pow(r(), 1.6) * 820);
    const avg = 38000 + Math.floor(r() * 110) * 1000;
    const totalPaid = Math.round((visits * avg) / 1000) * 1000;
    const age = 17 + Math.floor(Math.pow(r(), 1.1) * 52);
    const bm = 1 + Math.floor(r() * 12);
    const bd = 1 + Math.floor(r() * 28);
    const des = r() < 0.1 ? 'unassigned' : pick(MKT_DESIGNERS).id;
    const c1 = pick(MKT_CATS), c2 = pick(MKT_CATS);
    const grade = totalPaid >= 1800000 ? 'VVIP' : totalPaid >= 700000 ? 'VIP' : '일반';
    const p = () => String(1000 + Math.floor(r() * 9000));
    list.push({
      id: i,
      name: pick(SUR) + pick(female ? GIV_F : GIV_M),
      gender: female ? 'F' : 'M',
      phone: `010-${p()}-${p()}`,
      age, birthM: bm, birthD: bd,
      designer: des,
      visits, lastDays, totalPaid,
      points: r() < 0.55 ? Math.floor(r() * 320) * 100 : 0,
      ticket: r() < 0.22 ? (5 + Math.floor(r() * 46)) * 10000 : 0,
      cats: c1 && c2 ? Array.from(new Set([c1.id, c2.id])) : [],
      grade,
      isNew: visits === 1,
      consent: r() < 0.915,
      firstDays: visits === 1 ? lastDays : lastDays + Math.floor(30 + r() * 900),
      channel: pick(MKT_CHANNELS).id,
      memo: r() < 0.28 ? pick(MKT_MEMOS) : '',
      tickets: r() < 0.18 ? [{ cat: pick(MKT_TICKET_CATS).id, left: 1 + Math.floor(r() * 9) }] : [],
    });
    const last = list[list.length - 1];
    if (last.ticket) last.ticket = Math.round(last.ticket * (0.1 + r() * 0.9) / 1000) * 1000;
  }
  return list;
})();

// ───── 필터 ─────
const MKT_EMPTY_FILTER = {
  q:'', gender:'all', ages:[], birth:'all', grades:[], memo:'', memoOnly:false,
  vFrom:'', vTo:'', dormant:'all',
  designers:[], cats:[], visitMin:'', visitMax:'', paidMin:'', paidMax:'',
  pointMin:'',
  balance:'all', balMin:'', balMax:'',
  ticketHave:'all', ticketCats:[], ticketMin:'', ticketMax:'',
  revisit:'all', rvDays:'30', rvDaysMax:'', rvChannels:[], rvCats:[],
};

const MKT_DORMANT_OPTS = [
  { id:'all', label:'전체' },
  { id:'3m',  label:'3개월', min:90 },
  { id:'6m',  label:'6개월', min:180 },
  { id:'1y',  label:'1년',  min:365 },
];
const MKT_VPERIOD_PRESETS = [
  { id:'1m', label:'1개월', days:30 },
  { id:'3m', label:'3개월', days:90 },
  { id:'6m', label:'6개월', days:180 },
  { id:'1y', label:'1년',  days:365 },
];
const MKT_RV_DAYS = ['14','30','60','90'];
function mktDateStr(daysAgo) {
  const d = new Date(MKT_TODAY); d.setDate(d.getDate() - daysAgo);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function mktDaysAgo(str) {
  const [y,m,dd] = str.split('-').map(Number);
  return Math.round((MKT_TODAY - new Date(y, m-1, dd)) / 86400000);
}
const MKT_AGE_OPTS = [10,20,30,40,50,60];
const MKT_GRADE_OPTS = ['VVIP','VIP','일반'];

const MKT_SEGMENTS = [
  { id:'all',     label:'전체 고객',        patch:{} },
  { id:'churn',   label:'이탈 위험 90일+', patch:{ dormant:'3m', visitMin:'2' } },
  { id:'birth',   label:'이번 달 생일',      patch:{ birth:'this' } },
  { id:'vip',     label:'VIP · VVIP',        patch:{ grades:['VVIP','VIP'] } },
  { id:'new',     label:'첫 방문 후 미재방문', patch:{ revisit:'none', rvDays:'30' } },
  { id:'ticket',  label:'정액권 잔액 보유',   patch:{ balance:'yes' } },
  { id:'tk',      label:'티켓 보유',          patch:{ ticketHave:'yes' } },
];

function mktNum(v) { const n = parseInt(String(v).replace(/[^0-9]/g, ''), 10); return isNaN(n) ? null : n; }

function mktApplyFilter(list, f) {
  const curM = MKT_TODAY.getMonth() + 1;
  const nextM = curM === 12 ? 1 : curM + 1;
  const q = f.q.trim().replace(/-/g, '');
  const dm = MKT_DORMANT_OPTS.find(o => o.id === f.dormant);
  const vFromD = f.vFrom ? mktDaysAgo(f.vFrom) : null;
  const vToD = f.vTo ? mktDaysAgo(f.vTo) : null;
  const bMin = mktNum(f.balMin), bMax = mktNum(f.balMax);
  const tMin = mktNum(f.ticketMin), tMax = mktNum(f.ticketMax);
  const rvD = mktNum(f.rvDays), rvDMax = mktNum(f.rvDaysMax);
  const memoQ = f.memo.trim();
  const vMin = mktNum(f.visitMin), vMax = mktNum(f.visitMax);
  const pMin = mktNum(f.paidMin), pMax = mktNum(f.paidMax);
  const ptMin = mktNum(f.pointMin);
  return list.filter(c => {
    if (q && !(c.name.includes(q) || c.phone.replace(/-/g, '').includes(q))) return false;
    if (f.gender !== 'all' && c.gender !== f.gender) return false;
    if (f.ages.length && !f.ages.includes(Math.min(60, Math.floor(c.age / 10) * 10))) return false;
    if (f.birth === 'this' && c.birthM !== curM) return false;
    if (f.birth === 'next' && c.birthM !== nextM) return false;
    if (f.grades.length && !f.grades.includes(c.grade)) return false;
    if (memoQ && !c.memo.includes(memoQ)) return false;
    if (f.memoOnly && !c.memo) return false;
    if (vFromD != null && c.lastDays > vFromD) return false;
    if (vToD != null && c.lastDays < vToD) return false;
    if (dm && dm.min && c.lastDays < dm.min) return false;
    if (f.designers.length && !f.designers.includes(c.designer)) return false;
    if (f.cats.length && !c.cats.some(x => f.cats.includes(x))) return false;
    if (vMin != null && c.visits < vMin) return false;
    if (vMax != null && c.visits > vMax) return false;
    if (pMin != null && c.totalPaid < pMin * 10000) return false;
    if (pMax != null && c.totalPaid > pMax * 10000) return false;
    if (ptMin != null && c.points < ptMin) return false;
    if (f.balance === 'yes' && !c.ticket) return false;
    if (f.balance === 'no' && c.ticket) return false;
    if (f.balance === 'range') {
      if (bMin != null && c.ticket < bMin) return false;
      if (bMax != null && c.ticket > bMax) return false;
      if (bMin == null && bMax == null && !c.ticket) return false;
    }
    if (f.ticketHave === 'no' && c.tickets.length) return false;
    if (f.ticketHave === 'yes') {
      const tk = c.tickets.filter(t => !f.ticketCats.length || f.ticketCats.includes(t.cat));
      if (!tk.length) return false;
      if (tMin != null && !tk.some(t => t.left >= tMin)) return false;
      if (tMax != null && !tk.some(t => t.left <= tMax)) return false;
    }
    if (f.revisit === 'none') {
      if (c.visits !== 1) return false;
      if (rvD != null && c.firstDays < rvD) return false;
      if (rvDMax != null && c.firstDays > rvDMax) return false;
      if (f.rvChannels.length && !f.rvChannels.includes(c.channel)) return false;
      if (f.rvCats.length && !f.rvCats.includes(c.cats[0])) return false;
    }
    return true;
  });
}

// 적용된 조건 → 칩 라벨 (개별 제거용)
function mktFilterChips(f) {
  const out = [];
  const E = MKT_EMPTY_FILTER;
  if (f.gender !== 'all') out.push({ key:'gender', label: f.gender === 'F' ? '여성' : '남성' });
  if (f.ages.length) out.push({ key:'ages', label: f.ages.map(a => a === 60 ? '60대+' : `${a}대`).join('·') });
  if (f.birth !== 'all') out.push({ key:'birth', label: f.birth === 'this' ? '이번 달 생일' : '다음 달 생일' });
  if (f.grades.length) out.push({ key:'grades', label: f.grades.join('·') });
  if (f.memo.trim()) out.push({ key:'memo', label:`메모 "${f.memo.trim()}"` });
  if (f.memoOnly) out.push({ key:'memoOnly', label:'메모 있는 고객' });
  if (f.vFrom || f.vTo) out.push({ key:'vperiod', label:`방문 ${f.vFrom ? f.vFrom.slice(2).replace(/-/g,'.') : '처음'} ~ ${f.vTo ? f.vTo.slice(2).replace(/-/g,'.') : '오늘'}` });
  if (f.dormant !== 'all') out.push({ key:'dormant', label:`${MKT_DORMANT_OPTS.find(o => o.id === f.dormant).label} 이상 휴면` });
  if (f.designers.length) {
    const names = f.designers.map(id => (MKT_DESIGNERS_ALL.find(d => d.id === id) || {}).name);
    out.push({ key:'designers', label: '담당 ' + (names.length > 2 ? `${names.slice(0,2).join('·')} 외 ${names.length-2}` : names.join('·')) });
  }
  if (f.cats.length) {
    const names = f.cats.map(id => (MKT_CATS.find(c => c.id === id) || {}).name);
    out.push({ key:'cats', label: '시술 ' + (names.length > 2 ? `${names.slice(0,2).join('·')} 외 ${names.length-2}` : names.join('·')) });
  }
  if (f.visitMin !== '' || f.visitMax !== '') out.push({ key:'visits', label:`방문 ${f.visitMin || 0}~${f.visitMax || '∞'}회` });
  if (f.paidMin !== '' || f.paidMax !== '') out.push({ key:'paid', label:`누적 ${f.paidMin || 0}~${f.paidMax || '∞'}만원` });
  if (f.pointMin !== '') out.push({ key:'pointMin', label:`포인트 ${Number(f.pointMin).toLocaleString()}P+` });
  const won = (v) => v === '' ? '' : Number(v).toLocaleString();
  if (f.balance === 'yes') out.push({ key:'balance', label:'정액권 잔액 있음' });
  if (f.balance === 'no') out.push({ key:'balance', label:'정액권 잔액 없음' });
  if (f.balance === 'range') out.push({ key:'balance', label:`정액권 ${won(f.balMin) || 0}~${won(f.balMax) || '∞'}원` });
  if (f.ticketHave === 'no') out.push({ key:'ticket', label:'티켓 미보유' });
  if (f.ticketHave === 'yes') {
    const names = f.ticketCats.map(id => (MKT_TICKET_CATS.find(c => c.id === id) || {}).name);
    let l = '티켓 ' + (names.length ? names.join('·') : '보유');
    if (f.ticketMin !== '' || f.ticketMax !== '') l += ` · 잔여 ${f.ticketMin || 0}~${f.ticketMax || '∞'}회`;
    out.push({ key:'ticket', label:l });
  }
  if (f.revisit === 'none') {
    let l = `첫 방문 후 ${f.rvDays || 0}${f.rvDaysMax ? '~' + f.rvDaysMax : ''}일+ 미재방문`;
    if (f.rvChannels.length) l += ' · ' + f.rvChannels.map(id => MKT_CHANNELS.find(c => c.id === id).label).join('·');
    if (f.rvCats.length) l += ' · ' + f.rvCats.map(id => (MKT_CATS.find(c => c.id === id) || {}).name).join('·');
    out.push({ key:'revisit', label:l });
  }
  void E;
  return out;
}
function mktClearChip(f, key) {
  const E = MKT_EMPTY_FILTER;
  if (key === 'visits') return { ...f, visitMin:'', visitMax:'' };
  if (key === 'paid') return { ...f, paidMin:'', paidMax:'' };
  if (key === 'vperiod') return { ...f, vFrom:'', vTo:'' };
  if (key === 'balance') return { ...f, balance:'all', balMin:'', balMax:'' };
  if (key === 'ticket') return { ...f, ticketHave:'all', ticketCats:[], ticketMin:'', ticketMax:'' };
  if (key === 'revisit') return { ...f, revisit:'all', rvDays:'30', rvDaysMax:'', rvChannels:[], rvCats:[] };
  return { ...f, [key]: E[key] };
}

// ───── 메시지 ─────
function mktBytes(str) {
  let b = 0;
  for (const ch of str) b += ch.charCodeAt(0) > 127 ? 2 : 1;
  return b;
}

const MKT_VARS = [
  { key:'#{고객명}',   sample:(c) => c ? c.name : '박서연' },
  { key:'#{담당자}',   sample:(c) => c ? ((MKT_DESIGNERS_ALL.find(d => d.id === c.designer) || {}).name || '담당 디자이너') : '문지윤' },
  { key:'#{잔여포인트}', sample:(c) => (c ? c.points : 12400).toLocaleString() + 'P' },
  { key:'#{최근방문일}', sample:(c) => {
      const d = new Date(MKT_TODAY); d.setDate(d.getDate() - (c ? c.lastDays : 42));
      return `${d.getMonth()+1}월 ${d.getDate()}일`;
  } },
];
function mktRender(text, c) {
  let t = text;
  MKT_VARS.forEach(v => { t = t.split(v.key).join(v.sample(c)); });
  return t;
}

const MKT_SAMPLES = [
  { id:'revisit', tag:'재방문 유도', title:'오랜만이에요, 다시 만나요',
    body:'#{고객명}님, 오랜만이에요!\n마지막 방문(#{최근방문일}) 이후 머리 상태는 괜찮으신가요?\n\n이번 달 안에 재방문하시면 클리닉 1회를 무료로 해드려요.\n담당 #{담당자} 디자이너가 기다리고 있을게요.' },
  { id:'birth', tag:'생일 축하', title:'생일 축하드려요',
    body:'#{고객명}님, 생일 진심으로 축하드려요!\n생일이 있는 달에 방문하시면 전 시술 15% 할인해 드립니다.\n예약은 네이버 또는 전화로 편하게 문의 주세요.' },
  { id:'point', tag:'포인트 소멸', title:'포인트가 곧 소멸돼요',
    body:'#{고객명}님, 보유하신 #{잔여포인트}가 이번 달 말 소멸 예정이에요.\n소멸 전에 시술·제품 결제에 사용해 주세요!' },
  { id:'event', tag:'이벤트', title:'가을 컬러 이벤트',
    body:'[가을 컬러 이벤트]\n10/1 ~ 10/31 기간 동안 전체 컬러 시술 20% 할인!\n트리트먼트 추가 시 홈케어 샘플도 함께 드려요.' },
  { id:'holiday', tag:'휴무 안내', title:'휴무 안내',
    body:'#{고객명}님, 안녕하세요.\n10월 9일(금) 한글날은 매장 휴무입니다.\n예약 시 참고 부탁드립니다.' },
];

const MKT_ALIMTALK_TPL = [
  { id:'at-revisit', name:'재방문 혜택 안내', status:'승인', code:'KK_RV_002',
    body:'안녕하세요 #{고객명}님,\n카이키키 부평본점입니다.\n\n마지막 방문 후 시간이 꽤 지났어요.\n이번 달 재방문 시 클리닉 1회 서비스를 드립니다.\n\n▶ 담당 디자이너: #{담당자}', button:'예약하기' },
  { id:'at-point', name:'포인트 소멸 예정 안내', status:'승인', code:'KK_PT_001',
    body:'#{고객명}님, 보유 포인트 안내드립니다.\n\n■ 잔여 포인트: #{잔여포인트}\n■ 소멸 예정일: 2026-10-31\n\n소멸 전 사용 부탁드립니다.', button:'포인트 확인' },
  { id:'at-birth', name:'생일 쿠폰 발급', status:'승인', code:'KK_BD_003',
    body:'#{고객명}님, 생일을 축하드립니다!\n\n생일 월 방문 시 전 시술 15% 할인 쿠폰이 발급되었어요.\n■ 사용기한: 발급일로부터 30일', button:'쿠폰 보기' },
  { id:'at-event', name:'시즌 이벤트 안내', status:'검수중', code:'KK_EV_007',
    body:'가을 컬러 이벤트 안내', button:'자세히 보기' },
];

const MKT_SPECIAL_CHARS = '★☆♥♡◆◇■□●○▶◀▲▼※☎♪♬✔✂☞→←↑↓♣♠♤♧◎◈▣☀☁☂✿❀❁·'.split('');

Object.assign(window, {
  MKT_TODAY, MKT_STORE, MKT_BALANCE, MKT_UNIT, MKT_DESIGNERS, MKT_CATS, MKT_CUSTOMERS,
  MKT_EMPTY_FILTER, MKT_DORMANT_OPTS, MKT_VPERIOD_PRESETS, MKT_RV_DAYS, MKT_CHANNELS, MKT_TICKET_CATS,
  mktDateStr, mktDaysAgo, MKT_AGE_OPTS, MKT_GRADE_OPTS, MKT_SEGMENTS,
  mktApplyFilter, mktFilterChips, mktClearChip, mktBytes, MKT_VARS, mktRender,
  MKT_SAMPLES, MKT_ALIMTALK_TPL, MKT_SPECIAL_CHARS,
});
