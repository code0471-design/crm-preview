// 결산 — 결제 금액 / 시술 금액(정액권 소진) 두 기준으로 본다.
// 부가세·봉사료는 다루지 않는다.

const {
  C_BLUE, C_BLUE_SOFT, C_INK, C_MUTED, C_BORDER, C_BG, C_SURFACE,
} = window;

const ST_DES = [
  { id:'moon',  name:'문지윤', role:'원장',     color:'#F59E0B' },
  { id:'lee',   name:'이상현', role:'디자이너', color:'#EC4899' },
  { id:'jung',  name:'정명희', role:'실장',     color:'#EF4444' },
  { id:'kims',  name:'김산',   role:'디자이너', color:'#06B6D4' },
  { id:'leehj', name:'이현진', role:'디자이너', color:'#3B82F6' },
  { id:'kimjy', name:'김지유', role:'인턴',     color:'#10B981' },
  { id:'park',  name:'박소현', role:'디자이너', color:'#14B8A6' },
];
const ST_CATS = [
  { id:'cut', name:'커트' },
  { id:'color', name:'염색' },
  { id:'perm', name:'펌' },
  { id:'clinic', name:'클리닉' },
  { id:'product', name:'제품' },
];
const ST_VISITS = [
  { id:'revisit', name:'재방문', color:'#1E40AF' },
  { id:'new',     name:'신규',   color:'#059669' },
  { id:'intro',   name:'소개',   color:'#7C3AED' },
  { id:'naver',   name:'네이버', color:'#03A94D' },
  { id:'walkin',  name:'워크인', color:'#D97706' },
];
const ST_PAYS = [
  { id:'card',  name:'카드',       color:'#1E40AF' },
  { id:'cash',  name:'현금',       color:'#059669' },
  { id:'bank',  name:'계좌이체',   color:'#0EA5E9' },
  { id:'naver', name:'네이버페이', color:'#03A94D' },
  { id:'gift',  name:'상품권',     color:'#D97706' },
];
const ST_PRESETS = [
  { id:'today',     label:'오늘',    from:'2026.10.17', to:'2026.10.17' },
  { id:'yesterday', label:'어제',    from:'2026.10.16', to:'2026.10.16' },
  { id:'week',      label:'이번 주', from:'2026.10.12', to:'2026.10.17' },
  { id:'month',     label:'이번 달', from:'2026.10.01', to:'2026.10.17' },
  { id:'last',      label:'지난달',  from:'2026.09.01', to:'2026.09.30' },
];

function stMoney(o) {
  return Object.values(o || {}).reduce((a, b) => a + b, 0);
}
function stWon(n) {
  return new Intl.NumberFormat('ko-KR').format(Math.round(n || 0));
}
function stLine(m, day, designer, visit, cat, kind, service, pay, use, n, extra) {
  return { m, day, designer, visit, cat, kind, service, pay: pay || {}, use: use || {}, n: n || 1, receipt:false, sub:0, ...(extra || {}) };
}

// 시술·제품 행은 pay + use = service. 정액권·티켓·예약금 판매는 service 0.
const ST_ROWS = [
  // 10/17 오늘
  stLine(10, 17, 'moon',  'revisit', 'color',   'service', 70000,  { card:50000 }, { membership:20000 }, 1, { sub:20000 }),
  stLine(10, 17, 'moon',  'revisit', 'clinic',  'service', 80000,  { card:80000 }, {}),
  stLine(10, 17, 'lee',   'revisit', 'perm',    'service', 180000, { card:180000 }, {}),
  stLine(10, 17, 'jung',  'naver',   'color',   'service', 130000, { naver:130000 }, {}),
  stLine(10, 17, 'kims',  'new',     'perm',    'service', 220000, { card:150000, bank:70000 }, {}, 1, { receipt:true, sub:40000 }),
  stLine(10, 17, 'leehj', 'walkin',  'cut',     'service', 25000,  { cash:25000 }, {}, 1, { receipt:true }),
  stLine(10, 17, 'kimjy', 'revisit', 'cut',     'service', 20000,  { cash:20000 }, {}),
  stLine(10, 17, 'park',  'intro',   'clinic',  'service', 90000,  { card:40000 }, { ticket:50000 }),
  stLine(10, 17, 'moon',  'revisit', null,      'membership', 0,   { card:300000 }, {}),
  stLine(10, 17, 'lee',   'new',     'product', 'product', 45000,  { card:45000 }, {}),
  // 10/16
  stLine(10, 16, 'moon',  'revisit', 'color',   'service', 150000, { card:150000 }, {}),
  stLine(10, 16, 'lee',   'revisit', 'perm',    'service', 160000, { card:100000 }, { membership:60000 }, 1, { sub:50000 }),
  stLine(10, 16, 'jung',  'revisit', 'cut',     'service', 35000,  { card:35000 }, {}),
  stLine(10, 16, 'kims',  'naver',   'color',   'service', 120000, { naver:120000 }, {}),
  stLine(10, 16, 'leehj', 'revisit', 'cut',     'service', 30000,  { cash:15000, card:15000 }, {}),
  stLine(10, 16, 'park',  'revisit', 'product', 'product', 28000,  { card:28000 }, {}),
  stLine(10, 16, 'kimjy', 'new',     'cut',     'service', 18000,  { cash:18000 }, {}),
  stLine(10, 16, 'jung',  'revisit', null,      'ticket',  0,      { card:200000 }, {}),
  // 10/15
  stLine(10, 15, 'moon',  'new',     'perm',    'service', 250000, { card:200000, bank:50000 }, {}, 1, { receipt:true }),
  stLine(10, 15, 'lee',   'intro',   'color',   'service', 140000, { card:80000 }, { membership:60000 }),
  stLine(10, 15, 'jung',  'revisit', 'clinic',  'service', 70000,  { card:70000 }, {}),
  stLine(10, 15, 'kims',  'revisit', 'cut',     'service', 40000,  { cash:40000 }, {}),
  stLine(10, 15, 'leehj', 'naver',   'color',   'service', 110000, { naver:110000 }, {}),
  stLine(10, 15, 'park',  'walkin',  'cut',     'service', 22000,  { cash:22000 }, {}),
  stLine(10, 15, 'moon',  'naver',   null,      'deposit', 0,      { naver:50000 }, {}),
  // 10/14
  stLine(10, 14, 'lee',   'revisit', 'perm',    'service', 190000, { card:190000 }, {}),
  stLine(10, 14, 'jung',  'naver',   'color',   'service', 125000, { naver:90000 }, { point:35000 }),
  stLine(10, 14, 'kims',  'revisit', 'clinic',  'service', 85000,  { card:85000 }, {}),
  stLine(10, 14, 'moon',  'revisit', 'color',   'service', 160000, { card:100000 }, { membership:60000 }),
  stLine(10, 14, 'kimjy', 'revisit', 'product', 'product', 18000,  { cash:18000 }, {}),
  stLine(10, 14, 'park',  'revisit', null,      'membership', 0,   { bank:400000 }, {}),
  // 10/13
  stLine(10, 13, 'moon',  'revisit', 'clinic',  'service', 95000,  { card:95000 }, {}),
  stLine(10, 13, 'lee',   'new',     'color',   'service', 170000, { card:170000 }, {}),
  stLine(10, 13, 'jung',  'revisit', 'perm',    'service', 210000, { card:150000, bank:60000 }, {}),
  stLine(10, 13, 'leehj', 'revisit', 'cut',     'service', 28000,  { card:28000 }, {}),
  stLine(10, 13, 'kims',  'intro',   'product', 'product', 52000,  { card:52000 }, {}),
  stLine(10, 13, 'park',  'revisit', 'color',   'service', 100000, { card:50000 }, { ticket:50000 }),
  // 10/12 이번 주 시작
  stLine(10, 12, 'moon',  'naver',   'perm',    'service', 240000, { naver:240000 }, {}),
  stLine(10, 12, 'lee',   'revisit', 'cut',     'service', 45000,  { card:45000 }, {}),
  stLine(10, 12, 'jung',  'walkin',  'color',   'service', 80000,  { cash:30000, card:50000 }, {}),
  stLine(10, 12, 'kimjy', 'revisit', 'cut',     'service', 15000,  { cash:15000 }, {}),
  stLine(10, 12, 'leehj', 'revisit', null,      'ticket',  0,      { card:150000 }, {}),
  stLine(10, 12, 'park',  'revisit', 'clinic',  'service', 75000,  { card:25000 }, { membership:50000 }),
  // 10월 초 (이번 달에는 포함, 이번 주에는 제외)
  stLine(10, 9, 'moon',  'revisit', 'color',  'service', 320000, { card:220000 }, { membership:100000 }, 4),
  stLine(10, 9, 'lee',   'revisit', 'perm',   'service', 280000, { card:280000 }, {}, 2),
  stLine(10, 9, 'jung',  'naver',   'clinic', 'service', 150000, { naver:150000 }, {}, 2),
  stLine(10, 6, 'kims',  'revisit', 'color',  'service', 260000, { card:200000, bank:60000 }, {}, 3),
  stLine(10, 6, 'park',  'new',     'perm',   'service', 180000, { card:180000 }, {}, 1),
  stLine(10, 6, 'moon',  'revisit', null,     'membership', 0,   { card:500000 }, {}, 1),
  stLine(10, 3, 'leehj', 'revisit', 'cut',    'service', 120000, { card:80000, cash:40000 }, {}, 6),
  stLine(10, 3, 'kimjy', 'revisit', 'cut',    'service', 70000,  { cash:70000 }, {}, 5),
  stLine(10, 3, 'jung',  'intro',   'color',  'service', 200000, { card:140000 }, { point:20000, membership:40000 }, 2),
  stLine(10, 3, 'lee',   'naver',   null,     'deposit', 0,      { naver:80000 }, {}, 1),
  // 9월
  stLine(9, 22, 'lee',   'intro',   'product','product', 180000, { card:180000 }, {}, 6),
  stLine(9, 20, 'moon',  'revisit', 'color',  'service', 900000, { card:700000 }, { membership:200000 }, 8),
  stLine(9, 18, 'lee',   'revisit', 'perm',   'service', 780000, { card:780000 }, {}, 5),
  stLine(9, 15, 'jung',  'naver',   'color',  'service', 640000, { naver:640000 }, {}, 6),
  stLine(9, 12, 'kims',  'new',     'perm',   'service', 520000, { card:400000, bank:120000 }, {}, 3),
  stLine(9, 10, 'leehj', 'revisit', 'cut',    'service', 210000, { card:150000, cash:60000 }, {}, 12),
  stLine(9, 8,  'park',  'revisit', 'clinic', 'service', 360000, { card:200000 }, { ticket:160000 }, 4),
  stLine(9, 5,  'moon',  'revisit', null,     'membership', 0,   { card:800000 }, {}, 1),
  stLine(9, 4,  'kimjy', 'revisit', 'cut',    'service', 140000, { cash:140000 }, {}, 10),
  stLine(9, 2,  'jung',  'revisit', null,     'ticket',  0,      { card:300000 }, {}, 1),
];

const ST_FLOW = [
  { m:10, day:17, dir:'out', cash:15000, bank:0, receipt:false },
  { m:10, day:11, dir:'in',  cash:0, bank:150000, receipt:true },
  { m:10, day:4,  dir:'in',  cash:20000, bank:80000, receipt:false },
  { m:10, day:7,  dir:'out', cash:35000, bank:0, receipt:false },
  { m:9,  day:18, dir:'in',  cash:0, bank:200000, receipt:true },
  { m:9,  day:9,  dir:'out', cash:45000, bank:60000, receipt:false },
];

function stBlank() {
  return {
    pay:0, service:0, customers:0, serviceN:0, lines:0,
    payMethods:{ card:0, cash:0, bank:0, naver:0, gift:0 },
    use:{ membership:0, ticket:0, deposit:0, point:0 },
    sale:{ membership:0, ticket:0, deposit:0 },
    cats:{ cut:0, color:0, perm:0, clinic:0, product:0 },
    payCats:{ cut:0, color:0, perm:0, clinic:0, product:0 },
  };
}
function stAdd(b, r) {
  const paid = stMoney(r.pay);
  const n = r.n || 1;
  b.pay += paid;
  b.service += r.service || 0;
  b.lines += n;
  Object.entries(r.pay || {}).forEach(([k, v]) => { b.payMethods[k] = (b.payMethods[k] || 0) + v; });
  Object.entries(r.use || {}).forEach(([k, v]) => { b.use[k] = (b.use[k] || 0) + v; });
  if (r.kind === 'membership' || r.kind === 'ticket' || r.kind === 'deposit') b.sale[r.kind] += paid;
  if (r.kind === 'service' || r.kind === 'product') {
    b.customers += n;
    if (r.kind === 'service') b.serviceN += n;
    if (r.cat) {
      b.cats[r.cat] = (b.cats[r.cat] || 0) + r.service;
      b.payCats[r.cat] = (b.payCats[r.cat] || 0) + paid;
    }
  }
}
function stRowsFor(preset) {
  if (preset === 'last') return ST_ROWS.filter(r => r.m === 9);
  const oct = ST_ROWS.filter(r => r.m === 10);
  if (preset === 'today') return oct.filter(r => r.day === 17);
  if (preset === 'yesterday') return oct.filter(r => r.day === 16);
  if (preset === 'week') return oct.filter(r => r.day >= 12);
  return oct;
}
function stFlowsFor(preset) {
  if (preset === 'last') return ST_FLOW.filter(f => f.m === 9);
  const oct = ST_FLOW.filter(f => f.m === 10);
  if (preset === 'today') return oct.filter(f => f.day === 17);
  if (preset === 'yesterday') return oct.filter(f => f.day === 16);
  if (preset === 'week') return oct.filter(f => f.day >= 12);
  return oct;
}
function stCollect(rows) {
  const all = stBlank();
  const byDes = {};
  const byVisit = {};
  ST_DES.forEach(d => { byDes[d.id] = stBlank(); });
  ST_VISITS.forEach(v => { byVisit[v.id] = stBlank(); });
  rows.forEach(r => {
    stAdd(all, r);
    if (byDes[r.designer]) stAdd(byDes[r.designer], r);
    if (byVisit[r.visit]) stAdd(byVisit[r.visit], r);
  });
  return { all, byDes, byVisit };
}
function stSaleSum(b) { return b.sale.membership + b.sale.ticket + b.sale.deposit; }
function stUseSum(b) { return b.use.membership + b.use.ticket + b.use.deposit + b.use.point; }

function C_SettlePage() {
  const [preset, setPreset] = React.useState('month');
  const [designer, setDesigner] = React.useState('all');
  const [basis, setBasis] = React.useState('pay');
  const [view, setView] = React.useState('overview');
  const range = ST_PRESETS.find(p => p.id === preset);
  const rows = stRowsFor(preset).filter(r => designer === 'all' || r.designer === designer);
  const data = stCollect(rows);
  const b = data.all;
  const total = basis === 'pay' ? b.pay : b.service;
  const ticket = b.customers > 0 ? Math.round(total / b.customers) : 0;

  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden', background:C_BG}}>
      <div style={{width:'100%', flexShrink:0, flex:1, display:'flex', flexDirection:'column', minWidth:0, minHeight:0}}>
        <div style={{
          display:'flex', alignItems:'center', gap:8, flexWrap:'wrap',
          padding:'10px 14px', background:C_SURFACE, borderBottom:`1px solid ${C_BORDER}`,
        }}>
          <span style={{fontSize:12.5, color:C_MUTED, fontWeight:600, flexShrink:0}}>기간</span>
          <div style={stDate}>{range.from}</div>
          <span style={{color:C_MUTED, fontSize:12}}>~</span>
          <div style={stDate}>{range.to}</div>
          <div style={{display:'flex', gap:4, flexShrink:0}}>
            {ST_PRESETS.map(p => {
              const on = preset === p.id;
              return (
                <button key={p.id} onClick={() => setPreset(p.id)} style={{
                  padding:'6px 11px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                  border:`1px solid ${on ? C_BLUE : C_BORDER}`, borderRadius:14,
                  background: on ? C_BLUE_SOFT : C_SURFACE, color: on ? C_BLUE : C_MUTED,
                }}>{p.label}</button>
              );
            })}
          </div>
          <div style={{flex:1}}/>
          <select value={designer} onChange={e => setDesigner(e.target.value)} style={stSelect}>
            <option value="all">전체 담당자</option>
            {ST_DES.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <button onClick={() => window.__toast && window.__toast('결산 내역을 엑셀로 내보냅니다')} style={{
            height:32, padding:'0 12px', borderRadius:8, border:`1px solid ${C_BORDER}`,
            background:C_SURFACE, color:C_INK, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
          }}>엑셀</button>
        </div>

        <div style={{flex:1, overflow:'auto', padding:'16px 20px 28px'}}>
          <div style={{fontSize:12, color:C_MUTED, marginBottom:12}}>
            홈 <span style={{margin:'0 6px'}}>›</span>
            분석 <span style={{margin:'0 6px'}}>›</span>
            <span style={{color:C_INK, fontWeight:700}}>결산</span>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10}}>
            <StBasisCard
              on={basis === 'pay'}
              kicker="결제 금액"
              hint="고객이 실제로 낸 돈"
              amount={b.pay}
              note="카드 · 현금 · 계좌 · 네이버페이. 정액권·티켓을 판 돈이 포함됩니다."
              onClick={() => setBasis('pay')}
            />
            <StBasisCard
              on={basis === 'service'}
              kicker="시술 금액"
              hint="시술·제품 기준, 정액권 소진 포함"
              amount={b.service}
              note="한 시술의 금액입니다. 정액권·티켓·예약금·포인트로 받은 것도 들어갑니다."
              onClick={() => setBasis('service')}
            />
          </div>
          <div style={{fontSize:12, color:C_MUTED, marginBottom:14, lineHeight:1.45}}>
            {basis === 'pay'
              ? '통장과 카드로 들어온 돈입니다. 정액권을 판 금액은 포함되고, 예전에 판 정액권을 오늘 쓴 금액은 빠집니다.'
              : '실제로 한 시술과 판 제품의 금액입니다. 정액권을 소진한 금액은 포함되고, 정액권을 새로 판 금액은 빠집니다.'}
          </div>

          <div style={{display:'flex', gap:4, marginBottom:14}}>
            {[
              { id:'overview', label:'종합' },
              { id:'designer', label:'담당자' },
              { id:'menu', label:'메뉴' },
              { id:'visit', label:'방문' },
              { id:'calendar', label:'매출캘린더' },
              { id:'trend', label:'월별 추이' },
            ].map(t => {
              const on = view === t.id;
              return (
                <button key={t.id} onClick={() => setView(t.id)} style={{
                  padding:'7px 14px', fontSize:12.5, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                  border:'none', borderRadius:8,
                  background: on ? C_BLUE : C_SURFACE, color: on ? '#fff' : C_MUTED,
                  boxShadow: on ? 'none' : `inset 0 0 0 1px ${C_BORDER}`,
                }}>{t.label}</button>
              );
            })}
          </div>

          {view === 'overview' && <StOverview b={b} basis={basis} rows={rows} total={total} ticket={ticket}/>}
          {view === 'designer' && <StDesigner byDes={data.byDes} basis={basis}/>}
          {view === 'menu' && <StMenu b={b} basis={basis}/>}
          {view === 'visit' && <StVisit rows={rows} basis={basis}/>}
          {view === 'calendar' && <StCalendar rows={rows} basis={basis} preset={preset}/>}
          {view === 'trend' && <StTrend rows={ST_ROWS.filter(r => designer === 'all' || r.designer === designer)} basis={basis} designer={designer}/>}
        </div>
      </div>
    </div>
  );
}

function StBasisCard({ on, kicker, hint, amount, note, onClick }) {
  return (
    <button onClick={onClick} style={{
      textAlign:'left', cursor:'pointer', fontFamily:'inherit',
      padding:'14px 16px', borderRadius:12,
      border:`1.5px solid ${on ? C_BLUE : C_BORDER}`,
      background: on ? C_BLUE_SOFT : C_SURFACE,
      boxShadow: on ? '0 6px 16px rgba(30,64,175,0.08)' : 'none',
    }}>
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <span style={{
          width:16, height:16, borderRadius:'50%', flexShrink:0,
          border:`2px solid ${on ? C_BLUE : '#CBD5E1'}`,
          background: on ? C_BLUE : 'transparent',
          display:'inline-flex', alignItems:'center', justifyContent:'center', color:'#fff',
        }}>{on && <IconCheck size={10} stroke={3}/>}</span>
        <span style={{fontSize:13, fontWeight:800, color: on ? C_BLUE : C_INK}}>{kicker}</span>
        <span style={{fontSize:11.5, color:C_MUTED, fontWeight:600}}>{hint}</span>
      </div>
      <div style={{marginTop:8, fontSize:28, fontWeight:800, letterSpacing:'-0.03em', color:C_INK, fontVariantNumeric:'tabular-nums', lineHeight:1.1}}>
        {stWon(amount)}<span style={{fontSize:14, fontWeight:700, marginLeft:3}}>원</span>
      </div>
      <div style={{marginTop:6, fontSize:11.5, color:C_MUTED, lineHeight:1.4}}>{note}</div>
    </button>
  );
}

function stBlankSlice() {
  return { cashI:0, bankI:0, cashO:0, bankO:0, card:0, gift:0, naver:0, preUse:0, ticketUse:0, sub:0 };
}
function stSliceMoney(s) {
  return s.cashI + s.bankI + s.cashO + s.bankO + s.card + s.gift + s.naver;
}
function stSliceUse(s) {
  return s.preUse + s.ticketUse;
}
function stAddSlice(a, b, sign) {
  const o = stBlankSlice();
  const k = sign || 1;
  Object.keys(o).forEach(key => { o[key] = (a[key] || 0) + k * (b[key] || 0); });
  return o;
}
function stPayInto(s, pay, receipt) {
  const cash = (pay && pay.cash) || 0;
  const bank = (pay && pay.bank) || 0;
  if (receipt) { s.cashI += cash; s.bankI += bank; }
  else { s.cashO += cash; s.bankO += bank; }
  s.card += (pay && pay.card) || 0;
  s.gift += (pay && pay.gift) || 0;
  s.naver += (pay && pay.naver) || 0;
}
function stCloseOf(s, mode, basis) {
  const money = stSliceMoney(s);
  if (mode === 'prepaid') return basis === 'pay' ? money : 0;
  return basis === 'pay' ? money : money + stSliceUse(s);
}
function stBuildMatrix(rows) {
  const svc = stBlankSlice(), pre = stBlankSlice(), tix = stBlankSlice(), prod = stBlankSlice();
  const byDes = {};
  ST_DES.forEach(d => { byDes[d.id] = { work: stBlankSlice(), pre: stBlankSlice(), prod: stBlankSlice() }; });
  rows.forEach(r => {
    const bucket = r.kind === 'product' ? prod : r.kind === 'ticket' ? tix : (r.kind === 'membership' || r.kind === 'deposit') ? pre : svc;
    stPayInto(bucket, r.pay, r.receipt);
    if (r.kind === 'service' || r.kind === 'product') {
      bucket.preUse += ((r.use && r.use.membership) || 0) + ((r.use && r.use.deposit) || 0) + ((r.use && r.use.point) || 0);
      bucket.ticketUse += (r.use && r.use.ticket) || 0;
      bucket.sub += r.sub || 0;
    }
    const g = byDes[r.designer];
    if (!g) return;
    const dg = r.kind === 'product' ? g.prod : (r.kind === 'membership' || r.kind === 'deposit' || r.kind === 'ticket') ? g.pre : g.work;
    stPayInto(dg, r.pay, r.receipt);
    if (r.kind === 'service' || r.kind === 'product') {
      dg.preUse += ((r.use && r.use.membership) || 0) + ((r.use && r.use.deposit) || 0) + ((r.use && r.use.point) || 0);
      dg.ticketUse += (r.use && r.use.ticket) || 0;
      dg.sub += r.sub || 0;
    }
  });
  return { svc, pre, tix, prod, byDes };
}
function stFlowSlice(flows, dir) {
  const s = stBlankSlice();
  flows.filter(f => f.dir === dir).forEach(f => stPayInto(s, f, f.receipt));
  return s;
}
function stNums(s, total, basis) {
  const showUse = basis !== 'pay';
  return [s.cashI + s.cashO, s.bankI + s.bankO, s.card, s.naver, showUse ? s.preUse : 0, showUse ? s.ticketUse : 0, total];
}
function stVatSplit(amount) {
  const supply = Math.round((amount || 0) / 1.1);
  return { supply, vat: (amount || 0) - supply };
}

function StOverview({ b, basis, rows, total, ticket }) {
  const sale = stSaleSum(b);
  const kpis = basis === 'pay' ? [
    { label:'결제 금액', value:`${stWon(b.pay)}원`, sub:'고객이 낸 돈' },
    { label:'결제 건수', value:`${b.lines}건`, sub:`방문 ${b.customers}명` },
    { label:'객단가', value:`${stWon(ticket)}원`, sub:'방문 고객 한 명당' },
    { label:'선수금 판매', value:`${stWon(sale)}원`, sub:'정액권·티켓·예약금' },
  ] : [
    { label:'시술 금액', value:`${stWon(b.service)}원`, sub:'정액권 소진 포함' },
    { label:'방문 객수', value:`${b.customers}명`, sub:`시술 ${b.serviceN}건` },
    { label:'객단가', value:`${stWon(ticket)}원`, sub:'방문 고객 한 명당' },
    { label:'정액권·티켓 소진', value:`${stWon(b.use.membership + b.use.ticket)}원`, sub:'현금으로 안 들어온 매출' },
  ];
  const mx = stBuildMatrix(rows);
  const subSvc = stAddSlice(stAddSlice(mx.svc, mx.pre), mx.tix);
  const store = stAddSlice(subSvc, mx.prod);
  const closeSvc = stCloseOf(mx.svc, 'work', basis);
  const closePre = stCloseOf(mx.pre, 'prepaid', basis);
  const closeTix = stCloseOf(mx.tix, 'prepaid', basis);
  const closeSub = closeSvc + closePre + closeTix;
  const closeProd = stCloseOf(mx.prod, 'product', basis);
  const closeStore = closeSub + closeProd;
  const storeRows = [
    { label:'시술', nums: stNums(mx.svc, closeSvc, basis) },
    { label:'정액권', nums: stNums(mx.pre, closePre, basis) },
    { label:'티켓', nums: stNums(mx.tix, closeTix, basis) },
    { label:'소계', sub:true, nums: stNums(subSvc, closeSub, basis) },
    { label:'제품', nums: stNums(mx.prod, closeProd, basis) },
    { label:'합계', total:true, nums: stNums(store, closeStore, basis) },
  ];
  const headNums = ['현금', '통장', '카드', '네이버페이', '정액권 사용', '티켓 사용', basis === 'pay' ? '합계 · 결제' : '합계 · 시술'];

  const desRows = ST_DES.map(d => {
    const g = mx.byDes[d.id];
    const shown = basis === 'pay' ? stAddSlice(g.work, g.pre) : g.work;
    const use = stSliceUse(g.work);
    const svcSum = basis === 'pay' ? stSliceMoney(shown) : stSliceMoney(g.work) + use;
    const prodSum = stSliceMoney(g.prod) + (basis === 'service' ? stSliceUse(g.prod) : 0);
    const sum = svcSum + prodSum;
    if (!sum && !use && !stSliceMoney(g.pre)) return null;
    const cash = (s) => s.cashI + s.cashO;
    const bank = (s) => s.bankI + s.bankO;
    const vat = stVatSplit(svcSum);
    return {
      ...d,
      svc: [cash(shown), bank(shown), shown.card, shown.naver, basis === 'pay' ? 0 : use, vat.supply, vat.vat, svcSum],
      prod: [cash(g.prod), bank(g.prod), g.prod.card, g.prod.naver, prodSum],
      sum,
    };
  }).filter(Boolean).sort((a, c) => c.sum - a.sum);
  const desFoot = desRows.reduce((a, d) => ({
    svc: d.svc.map((n, i) => n + (a.svc[i] || 0)),
    prod: d.prod.map((n, i) => n + (a.prod[i] || 0)),
    sum: a.sum + d.sum,
  }), { svc:[0,0,0,0,0,0,0,0], prod:[0,0,0,0,0], sum:0 });
  const footVat = stVatSplit(desFoot.svc[7] || 0);
  desFoot.svc[5] = footVat.supply;
  desFoot.svc[6] = footVat.vat;

  return (
    <div style={{display:'flex', flexDirection:'column', gap:12}}>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:10}}>
        {kpis.map(k => (
          <div key={k.label} style={stCard}>
            <div style={{fontSize:11.5, color:C_MUTED, fontWeight:600}}>{k.label}</div>
            <div style={{marginTop:6, fontSize:18, fontWeight:800, color:C_INK, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em'}}>{k.value}</div>
            <div style={{marginTop:4, fontSize:11, color:C_MUTED}}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{...stCard, padding:0, overflow:'hidden'}}>
        <div style={{padding:'12px 14px', borderBottom:`1px solid ${C_BORDER}`}}>
          <div style={stTitle}>매장 매출</div>
          <div style={{fontSize:11.5, color:C_MUTED, marginTop:3}}>
            {basis === 'pay'
              ? '합계는 고객이 낸 돈입니다. 정액권·티켓을 쓴 금액은 넣지 않습니다.'
              : '합계는 시술·제품 금액입니다. 정액권을 쓴 금액은 포함하고, 새로 판 금액은 뺍니다.'}
          </div>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%', borderCollapse:'collapse', minWidth:760}}>
            <thead>
              <tr>
                <th style={{...stMxTh, textAlign:'left'}}>구분</th>
                {headNums.map(h => <th key={h} style={{...stMxTh, ...(h.indexOf('합계') === 0 ? {color:C_BLUE} : {})}}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {storeRows.map(r => (
                <tr key={r.label} style={{background: r.total ? C_BLUE_SOFT : r.sub ? '#F8FAFC' : C_SURFACE}}>
                  <td style={{...stMxTd, textAlign:'left', background: r.total ? C_BLUE_SOFT : r.sub ? '#F8FAFC' : C_SURFACE, fontWeight:800}}>
                    {r.label}
                  </td>
                  {r.nums.map((n, i) => (
                    <td key={i} style={{...stMxTd, fontWeight: i === r.nums.length - 1 || r.total ? 800 : 700, color: n < 0 ? '#DC2626' : (i === r.nums.length - 1 ? C_BLUE : C_INK)}}>
                      {basis === 'pay' && (i === 4 || i === 5) ? '' : (n ? (n < 0 ? '−' : '') + stWon(Math.abs(n)) : <span style={{color:'#E2E8F0'}}>0</span>)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{...stCard, padding:0, overflow:'hidden'}}>
        <div style={{padding:'12px 14px', borderBottom:`1px solid ${C_BORDER}`}}>
          <div style={stTitle}>담당자별 매출</div>
          <div style={{fontSize:11.5, color:C_MUTED, marginTop:3}}>{basis === 'pay' ? '시술 합계를 공급가와 부가세로 나눴습니다. 결제 기준이라 소진은 비워 둡니다.' : '시술 합계를 공급가와 부가세로 나눴습니다. 소진은 정액권·티켓·포인트를 쓴 금액입니다.'}</div>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%', borderCollapse:'collapse', minWidth:1080}}>
            <thead>
              <tr>
                <th rowSpan={2} style={{...stMxTh, textAlign:'left', position:'sticky', left:0, zIndex:1}}>담당자</th>
                <th colSpan={8} style={stMxTh}>시술</th>
                <th colSpan={5} style={stMxTh}>판매</th>
                <th rowSpan={2} style={{...stMxTh, color:C_BLUE}}>총합계</th>
              </tr>
              <tr>
                {['현금','통장','카드','네이버','소진','공급가','부가세','합계','현금','통장','카드','네이버','합계'].map((h, i) => (
                  <th key={h + i} style={{...stMxTh, color: h === '합계' || h === '공급가' || h === '부가세' ? C_BLUE : '#5C6B84'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {desRows.map(d => (
                <tr key={d.id}>
                  <td style={{...stMxTd, textAlign:'left', position:'sticky', left:0, background:C_SURFACE, fontWeight:800}}>
                    <span style={{display:'inline-flex', alignItems:'center', gap:6}}>
                      <span style={{width:8, height:8, borderRadius:'50%', background:d.color}}/>
                      {d.name}
                      <span style={{fontSize:10.5, color:C_MUTED, fontWeight:600}}>{d.role}</span>
                    </span>
                  </td>
                  {d.svc.concat(d.prod, [d.sum]).map((n, i) => (
                    <td key={i} style={{...stMxTd, fontWeight: i === 7 || i === 12 || i === 13 ? 800 : 700, color: i === 13 ? C_BLUE : C_INK}}>
                      {basis === 'pay' && i === 4 ? '' : (n ? stWon(n) : <span style={{color:'#E2E8F0'}}>0</span>)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr style={{background:C_BLUE_SOFT}}>
                <td style={{...stMxTd, textAlign:'left', position:'sticky', left:0, background:C_BLUE_SOFT, fontWeight:800, color:C_BLUE}}>합계</td>
                {desFoot.svc.concat(desFoot.prod, [desFoot.sum]).map((n, i) => (
                  <td key={i} style={{...stMxTd, fontWeight:800, color:C_BLUE}}>{basis === 'pay' && i === 4 ? '' : (n ? stWon(n) : <span style={{color:'#BFDBFE'}}>0</span>)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


function StDesigner({ byDes, basis }) {
  const rows = ST_DES.map(d => ({ ...d, b: byDes[d.id] })).filter(d => d.b.pay > 0 || d.b.service > 0);
  rows.sort((a, c) => (basis === 'pay' ? c.b.pay - a.b.pay : c.b.service - a.b.service));
  const sum = rows.reduce((a, d) => {
    stAddMerge(a, d.b);
    return a;
  }, stBlank());
  const cols = basis === 'pay'
    ? ['담당자', '방문', '시술·제품 결제', '정액권 판매', '티켓 판매', '예약금', '합계', '객단가']
    : ['담당자', '방문', '시술', '제품', '그중 정액권', '그중 티켓', '합계', '객단가'];
  const cells = (d) => {
    const x = d.b || d;
    const visit = x.customers;
    const avg = visit ? Math.round((basis === 'pay' ? x.pay : x.service) / visit) : 0;
    if (basis === 'pay') {
      const servicePay = x.pay - stSaleSum(x);
      return [visit ? `${visit}명` : '-', stWon(servicePay), stWon(x.sale.membership), stWon(x.sale.ticket), stWon(x.sale.deposit), stWon(x.pay), stWon(avg)];
    }
    const svc = (x.cats.cut || 0) + (x.cats.color || 0) + (x.cats.perm || 0) + (x.cats.clinic || 0);
    return [visit ? `${visit}명` : '-', stWon(svc), stWon(x.cats.product || 0), stWon(x.use.membership), stWon(x.use.ticket), stWon(x.service), stWon(avg)];
  };
  return (
    <div style={{...stCard, padding:0, overflow:'hidden'}}>
      <div style={{padding:'12px 14px', borderBottom:`1px solid ${C_BORDER}`}}>
        <div style={stTitle}>{basis === 'pay' ? '담당자별 결제' : '담당자별 시술'}</div>
        <div style={{fontSize:11.5, color:C_MUTED, marginTop:3}}>
          {basis === 'pay' ? '합계는 고객이 낸 돈입니다. 정액권·티켓을 판 금액이 들어 있습니다.' : '합계는 시술·제품 금액입니다. 정액권·티켓을 소진한 금액이 들어 있습니다.'}
        </div>
      </div>
      <table style={{width:'100%', borderCollapse:'collapse'}}>
        <thead>
          <tr style={{background:'#F8FAFC'}}>
            {cols.map((c, i) => (
              <th key={c} style={{...stTh, textAlign: i === 0 ? 'left' : 'right'}}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(d => {
            const vals = cells(d);
            return (
              <tr key={d.id} style={{borderTop:`1px solid ${C_BORDER}`}}>
                <td style={{...stTd, textAlign:'left'}}>
                  <span style={{display:'inline-flex', alignItems:'center', gap:6}}>
                    <span style={{width:8, height:8, borderRadius:'50%', background:d.color}}/>
                    <span style={{fontWeight:800}}>{d.name}</span>
                    <span style={{fontSize:10.5, color:C_MUTED, fontWeight:600}}>{d.role}</span>
                  </span>
                </td>
                {vals.map((v, i) => (
                  <td key={i} style={{...stTd, fontWeight: i === vals.length - 2 ? 800 : 700}}>{v}</td>
                ))}
              </tr>
            );
          })}
          <tr style={{borderTop:`2px solid ${C_BLUE}`, background:C_BLUE_SOFT}}>
            <td style={{...stTd, textAlign:'left', fontWeight:800}}>합계</td>
            {cells(sum).map((v, i) => (
              <td key={i} style={{...stTd, fontWeight:800, color:C_BLUE}}>{v}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
function stAddMerge(a, b) {
  a.pay += b.pay; a.service += b.service; a.customers += b.customers; a.lines += b.lines;
  a.sale.membership += b.sale.membership; a.sale.ticket += b.sale.ticket; a.sale.deposit += b.sale.deposit;
  a.use.membership += b.use.membership; a.use.ticket += b.use.ticket; a.use.deposit += b.use.deposit; a.use.point += b.use.point;
  Object.keys(a.cats).forEach(k => { a.cats[k] += b.cats[k] || 0; a.payCats[k] += b.payCats[k] || 0; });
}

function StMenu({ b, basis }) {
  const items = ST_CATS.map(c => ({
    name: c.name,
    v: basis === 'pay' ? (b.payCats[c.id] || 0) : (b.cats[c.id] || 0),
  }));
  if (basis === 'pay') {
    items.push({ name:'정액권 판매', v: b.sale.membership });
    items.push({ name:'티켓 판매', v: b.sale.ticket });
    items.push({ name:'예약금 수령', v: b.sale.deposit });
  }
  const shown = items.filter(i => i.v > 0).sort((a, c) => c.v - a.v);
  const total = shown.reduce((a, i) => a + i.v, 0) || 1;
  const max = Math.max(1, ...shown.map(i => i.v));
  return (
    <div style={stCard}>
      <div style={stTitle}>{basis === 'pay' ? '어디서 돈이 들어왔나' : '어떤 시술이 매출인가'}</div>
      <div style={{fontSize:11.5, color:C_MUTED, marginTop:3, marginBottom:12}}>
        {basis === 'pay' ? '시술에서 받은 결제와, 정액권·티켓·예약금을 판 금액을 나눴습니다.' : '정액권·티켓으로 받은 금액도 그 시술 금액에 포함됩니다.'}
      </div>
      {shown.map(i => (
        <div key={i.name} style={{display:'grid', gridTemplateColumns:'88px 1fr 132px', gap:8, alignItems:'center', marginBottom:9}}>
          <span style={{fontSize:12.5, fontWeight:800, color:C_INK}}>{i.name}</span>
          <div style={{height:8, borderRadius:4, background:'#F1F5F9'}}>
            <div style={{height:'100%', width:`${i.v / max * 100}%`, borderRadius:4, background:C_BLUE}}/>
          </div>
          <span style={{textAlign:'right', fontSize:12.5, fontWeight:800, fontVariantNumeric:'tabular-nums', color:C_INK}}>
            {stWon(i.v)}원 <span style={{color:C_MUTED, fontWeight:700}}>{Math.round(i.v / total * 100)}%</span>
          </span>
        </div>
      ))}
    </div>
  );
}

function stRowAmount(r, basis) {
  if (basis === 'pay') return stMoney(r.pay);
  return r.service || 0;
}
function stVisitOf(rows, basis) {
  const map = {};
  ST_DES.forEach(d => { map[d.id] = {}; ST_VISITS.forEach(v => { map[d.id][v.id] = { amount:0, n:0 }; }); });
  rows.forEach(r => {
    if (!map[r.designer] || !map[r.designer][r.visit]) return;
    const cell = map[r.designer][r.visit];
    cell.amount += stRowAmount(r, basis);
    if (r.kind === 'service' || r.kind === 'product') cell.n += r.n || 1;
  });
  return map;
}

function StVisit({ rows, basis }) {
  const map = stVisitOf(rows, basis);
  const list = ST_DES.map(d => {
    const cells = ST_VISITS.map(v => map[d.id][v.id]);
    const sum = cells.reduce((a, c) => a + c.amount, 0);
    const n = cells.reduce((a, c) => a + c.n, 0);
    return { ...d, cells, sum, n };
  }).filter(d => d.sum > 0);
  const foot = ST_VISITS.map((_, i) => list.reduce((a, d) => a + d.cells[i].amount, 0));
  const footN = list.reduce((a, d) => a + d.n, 0);
  const footSum = foot.reduce((a, n) => a + n, 0);
  return (
    <div style={{...stCard, padding:0, overflow:'hidden'}}>
      <div style={{padding:'12px 14px', borderBottom:`1px solid ${C_BORDER}`}}>
        <div style={stTitle}>담당자별 방문</div>
        <div style={{fontSize:11.5, color:C_MUTED, marginTop:3}}>금액은 선택한 결산 기준이고, 옆 숫자는 방문 고객 수입니다.</div>
      </div>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%', borderCollapse:'collapse', minWidth:860}}>
          <thead>
            <tr>
              <th style={{...stMxTh, textAlign:'left'}}>담당자</th>
              {ST_VISITS.map(v => <th key={v.id} style={stMxTh}>{v.name}</th>)}
              <th style={{...stMxTh, color:C_BLUE}}>합계</th>
            </tr>
          </thead>
          <tbody>
            {list.map(d => (
              <tr key={d.id}>
                <td style={{...stMxTd, textAlign:'left', fontWeight:800}}>
                  <span style={{display:'inline-flex', alignItems:'center', gap:6}}>
                    <span style={{width:8, height:8, borderRadius:'50%', background:d.color}}/>
                    {d.name}
                  </span>
                </td>
                {d.cells.map((c, i) => (
                  <td key={i} style={stMxTd}>
                    {c.amount ? stWon(c.amount) : <span style={{color:'#E2E8F0'}}>0</span>}
                    <div style={{fontSize:10, color:C_MUTED, fontWeight:600}}>{c.n ? `${c.n}명` : ''}</div>
                  </td>
                ))}
                <td style={{...stMxTd, fontWeight:800, color:C_BLUE}}>
                  {stWon(d.sum)}
                  <div style={{fontSize:10, color:C_MUTED, fontWeight:600}}>{d.n}명</div>
                </td>
              </tr>
            ))}
            <tr style={{background:C_BLUE_SOFT}}>
              <td style={{...stMxTd, textAlign:'left', fontWeight:800, color:C_BLUE, background:C_BLUE_SOFT}}>합계</td>
              {foot.map((n, i) => <td key={i} style={{...stMxTd, fontWeight:800, color:C_BLUE}}>{n ? stWon(n) : '0'}</td>)}
              <td style={{...stMxTd, fontWeight:800, color:C_BLUE}}>{stWon(footSum)}<div style={{fontSize:10, fontWeight:600}}>{footN}명</div></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StCalendar({ rows, basis, preset }) {
  const month = preset === 'last' ? 9 : 10;
  const year = 2026;
  const first = new Date(year, month - 1, 1).getDay();
  const count = new Date(year, month, 0).getDate();
  const byDay = {};
  rows.forEach(r => {
    if (r.m !== month) return;
    byDay[r.day] = (byDay[r.day] || 0) + stRowAmount(r, basis);
  });
  const cells = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= count; d++) cells.push(d);
  while (cells.length % 7) cells.push(null);
  const max = Math.max(1, ...Object.values(byDay));
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return (
    <div style={stCard}>
      <div style={stTitle}>{year}년 {month}월</div>
      <div style={{fontSize:11.5, color:C_MUTED, marginTop:3, marginBottom:12}}>날짜 칸의 금액은 선택한 결산 기준입니다.</div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:6, marginBottom:6}}>
        {['일','월','화','수','목','금','토'].map(w => (
          <div key={w} style={{textAlign:'center', fontSize:11, fontWeight:700, color:C_MUTED}}>{w}</div>
        ))}
      </div>
      <div style={{display:'flex', flexDirection:'column', gap:6}}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:6}}>
            {week.map((d, di) => {
              const amt = d ? (byDay[d] || 0) : 0;
              return (
                <div key={di} style={{
                  minHeight:72, borderRadius:10, padding:'8px 8px 6px',
                  background: !d ? 'transparent' : amt ? C_BLUE_SOFT : '#F8FAFC',
                  border: d ? `1px solid ${amt ? '#DBE4F8' : C_BORDER}` : 'none',
                }}>
                  {d && (
                    <>
                      <div style={{fontSize:11, fontWeight:700, color: di === 0 ? '#DC2626' : C_MUTED}}>{d}</div>
                      {amt > 0 && (
                        <>
                          <div style={{marginTop:6, fontSize:12, fontWeight:800, color:C_INK, fontVariantNumeric:'tabular-nums'}}>{stWon(amt)}</div>
                          <div style={{marginTop:4, height:3, borderRadius:2, background:'#DBE4F8'}}>
                            <div style={{height:'100%', width:`${amt / max * 100}%`, borderRadius:2, background:C_BLUE}}/>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

const ST_TREND_EARLY = {
  3:{ pay:4820000, service:4510000 },
  4:{ pay:5100000, service:4680000 },
  5:{ pay:5460000, service:5020000 },
  6:{ pay:4980000, service:4730000 },
  7:{ pay:5720000, service:5310000 },
  8:{ pay:5340000, service:4890000 },
};
const ST_TREND_SHARE = { moon:0.28, lee:0.18, jung:0.16, kims:0.12, park:0.11, leehj:0.09, kimjy:0.06 };
function StTrend({ rows, basis, designer }) {
  const months = [3,4,5,6,7,8,9,10].map(m => {
    const by = {};
    ST_DES.forEach(d => {
      if (designer !== 'all' && d.id !== designer) { by[d.id] = 0; return; }
      if (m >= 9) by[d.id] = rows.filter(r => r.m === m && r.designer === d.id).reduce((a, r) => a + stRowAmount(r, basis), 0);
      else by[d.id] = Math.round((basis === 'pay' ? ST_TREND_EARLY[m].pay : ST_TREND_EARLY[m].service) * ST_TREND_SHARE[d.id]);
    });
    return { m, label:`${m}월`, by, total: Object.values(by).reduce((a, n) => a + n, 0) };
  });
  const max = Math.max(1, ...months.map(x => x.total));
  const people = ST_DES.filter(d => designer === 'all' || d.id === designer);
  return (
    <div style={{display:'flex', flexDirection:'column', gap:12}}>
      <div style={stCard}>
        <div style={stTitle}>월별 추이</div>
        <div style={{fontSize:11.5, color:C_MUTED, marginTop:3, marginBottom:10}}>
          {basis === 'pay' ? '결제 금액' : '시술 금액'} · 담당자별로 쌓았습니다. 9월과 10월은 이 화면의 매출입니다.
        </div>
        <div style={{display:'flex', flexWrap:'wrap', gap:10, marginBottom:12}}>
          {people.map(d => (
            <span key={d.id} style={{display:'inline-flex', alignItems:'center', gap:5, fontSize:11.5, fontWeight:700, color:C_INK}}>
              <span style={{width:8, height:8, borderRadius:2, background:d.color}}/>{d.name}
            </span>
          ))}
        </div>
        <div style={{display:'flex', alignItems:'flex-end', gap:8, height:230}}>
          {months.map(m => (
            <div key={m.m} style={{flex:1, minWidth:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', height:'100%'}}>
              <div style={{fontSize:10.5, fontWeight:800, color:C_INK, fontVariantNumeric:'tabular-nums', marginBottom:4}}>{stWon(m.total)}</div>
              <div style={{width:'72%', maxWidth:42, display:'flex', flexDirection:'column-reverse', borderRadius:8, overflow:'hidden', background:'#F1F5F9'}}>
                {people.map(d => (
                  <div key={d.id} style={{height:Math.round((m.by[d.id] || 0) / max * 160), background:d.color}}/>
                ))}
              </div>
              <div style={{marginTop:8, fontSize:12, fontWeight:700, color:C_MUTED}}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{...stCard, padding:0, overflow:'hidden'}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%', borderCollapse:'collapse', minWidth:860}}>
            <thead>
              <tr>
                <th style={{...stMxTh, textAlign:'left'}}>담당자</th>
                {months.map(m => <th key={m.m} style={stMxTh}>{m.label}</th>)}
                <th style={{...stMxTh, color:C_BLUE}}>합계</th>
              </tr>
            </thead>
            <tbody>
              {people.map(d => {
                const sum = months.reduce((a, m) => a + m.by[d.id], 0);
                return (
                  <tr key={d.id}>
                    <td style={{...stMxTd, textAlign:'left', fontWeight:800}}>
                      <span style={{display:'inline-flex', alignItems:'center', gap:6}}>
                        <span style={{width:8, height:8, borderRadius:'50%', background:d.color}}/>{d.name}
                      </span>
                    </td>
                    {months.map(m => <td key={m.m} style={stMxTd}>{m.by[d.id] ? stWon(m.by[d.id]) : <span style={{color:'#E2E8F0'}}>0</span>}</td>)}
                    <td style={{...stMxTd, fontWeight:800, color:C_BLUE}}>{stWon(sum)}</td>
                  </tr>
                );
              })}
              <tr style={{background:C_BLUE_SOFT}}>
                <td style={{...stMxTd, textAlign:'left', fontWeight:800, color:C_BLUE, background:C_BLUE_SOFT}}>합계</td>
                {months.map(m => <td key={m.m} style={{...stMxTd, fontWeight:800, color:C_BLUE}}>{stWon(m.total)}</td>)}
                <td style={{...stMxTd, fontWeight:800, color:C_BLUE}}>{stWon(months.reduce((a, m) => a + m.total, 0))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const PP_GOODS = {
  membership: [
    { id:'a', name:'A정액권' },
    { id:'b', name:'B정액권' },
    { id:'c', name:'C정액권' },
  ],
  ticket: [
    { id:'t1', name:'클리닉 5회' },
    { id:'t2', name:'케어 10회' },
  ],
};
const PP_RANGE = {
  month:['2026-10-01','2026-10-17'],
  last:['2026-09-01','2026-09-30'],
  year:['2026-01-01','2026-10-17'],
};
const PP_HOLD = [
  { kind:'membership', product:'a', designer:'moon', name:'박서연', phone:'010-2221-3345', bought:'2026-10-02', sales:300000, used:120000, days:11 },
  { kind:'membership', product:'a', designer:'lee', name:'조유진', phone:'010-4182-2201', bought:'2026-10-05', sales:300000, used:60000, days:9 },
  { kind:'membership', product:'a', designer:'jung', name:'한지민', phone:'010-9021-1184', bought:'2026-09-20', sales:300000, used:300000, days:22 },
  { kind:'membership', product:'a', designer:'kims', name:'윤지원', phone:'010-6671-3308', bought:'2026-09-08', sales:300000, used:210000, days:18 },
  { kind:'membership', product:'a', designer:'park', name:'임채원', phone:'010-7712-9044', bought:'2026-08-15', sales:300000, used:300000, days:25 },
  { kind:'membership', product:'a', designer:'kimjy', name:'오세훈', phone:'010-2208-6612', bought:'2026-10-11', sales:300000, used:0, days:0 },
  { kind:'membership', product:'b', designer:'moon', name:'강수현', phone:'010-3344-2211', bought:'2026-09-18', sales:500000, used:280000, days:42 },
  { kind:'membership', product:'b', designer:'lee', name:'이하늘', phone:'010-5551-9090', bought:'2026-10-09', sales:500000, used:50000, days:6 },
  { kind:'membership', product:'b', designer:'jung', name:'정예린', phone:'010-8188-2741', bought:'2026-07-02', sales:500000, used:410000, days:55 },
  { kind:'membership', product:'b', designer:'park', name:'최민서', phone:'010-1414-8088', bought:'2026-10-01', sales:500000, used:100000, days:14 },
  { kind:'membership', product:'b', designer:'leehj', name:'홍지수', phone:'010-3636-1919', bought:'2026-09-25', sales:500000, used:190000, days:38 },
  { kind:'membership', product:'c', designer:'moon', name:'김선일', phone:'010-9090-1212', bought:'2026-06-12', sales:1000000, used:640000, days:70 },
  { kind:'membership', product:'c', designer:'lee', name:'시다은', phone:'010-4545-7878', bought:'2026-09-03', sales:1000000, used:220000, days:48 },
  { kind:'membership', product:'c', designer:'kims', name:'문태호', phone:'010-6262-3030', bought:'2026-10-14', sales:1000000, used:0, days:0 },
  { kind:'membership', product:'c', designer:'jung', name:'안지호', phone:'010-1717-4545', bought:'2026-08-20', sales:1000000, used:480000, days:61 },
  { kind:'membership', product:'c', designer:'park', name:'박지훈', phone:'010-2828-6161', bought:'2026-09-28', sales:1000000, used:150000, days:16 },
  { kind:'ticket', product:'t1', designer:'moon', name:'박서연', phone:'010-2221-3345', bought:'2026-10-04', sales:200000, used:80000, days:10 },
  { kind:'ticket', product:'t1', designer:'jung', name:'한지민', phone:'010-9021-1184', bought:'2026-09-15', sales:200000, used:200000, days:28 },
  { kind:'ticket', product:'t1', designer:'park', name:'임채원', phone:'010-7712-9044', bought:'2026-10-07', sales:200000, used:40000, days:8 },
  { kind:'ticket', product:'t1', designer:'lee', name:'조유진', phone:'010-4182-2201', bought:'2026-08-02', sales:200000, used:160000, days:30 },
  { kind:'ticket', product:'t1', designer:'leehj', name:'나예지', phone:'010-5050-2323', bought:'2026-09-11', sales:200000, used:120000, days:22 },
  { kind:'ticket', product:'t2', designer:'moon', name:'강수현', phone:'010-3344-2211', bought:'2026-09-02', sales:350000, used:140000, days:24 },
  { kind:'ticket', product:'t2', designer:'jung', name:'정예린', phone:'010-8188-2741', bought:'2026-10-06', sales:350000, used:35000, days:7 },
  { kind:'ticket', product:'t2', designer:'kims', name:'윤지원', phone:'010-6671-3308', bought:'2026-07-19', sales:350000, used:280000, days:40 },
  { kind:'ticket', product:'t2', designer:'park', name:'최민서', phone:'010-1414-8088', bought:'2026-09-22', sales:350000, used:175000, days:26 },
  { kind:'ticket', product:'t2', designer:'lee', name:'이하늘', phone:'010-5551-9090', bought:'2026-10-12', sales:350000, used:0, days:0 },
  { kind:'ticket', product:'t2', designer:'kimjy', name:'오세훈', phone:'010-2208-6612', bought:'2026-06-03', sales:350000, used:350000, days:45 },
];
function ppIn(date, preset) {
  const [from, to] = PP_RANGE[preset];
  return date >= from && date <= to;
}
function ppAvg(list) {
  const used = list.filter(r => r.days > 0);
  if (!used.length) return 0;
  return Math.round(used.reduce((a, r) => a + r.days, 0) / used.length);
}
function ppSum(list) {
  const sales = list.reduce((a, r) => a + r.sales, 0);
  const used = list.reduce((a, r) => a + r.used, 0);
  return { buyers: new Set(list.map(r => r.name)).size, count: list.length, sales, used, balance: sales - used, days: ppAvg(list) };
}

function C_PrepaidPage() {
  const [tab, setTab] = React.useState('membership');
  const [preset, setPreset] = React.useState('month');
  const [who, setWho] = React.useState('all');
  const [goods, setGoods] = React.useState('all');
  const goodsList = PP_GOODS[tab];
  const periodRows = PP_HOLD.filter(r => r.kind === tab && ppIn(r.bought, preset));
  const shown = periodRows.filter(r => (who === 'all' || r.designer === who) && (goods === 'all' || r.product === goods));
  const sum = ppSum(shown);
  const name = tab === 'membership' ? '정액권' : '티켓';
  const byGoods = goodsList.map(g => ({ ...g, ...ppSum(periodRows.filter(r => r.product === g.id)) })).filter(g => g.count);
  const byDes = ST_DES.map(d => ({ ...d, ...ppSum(periodRows.filter(r => r.designer === d.id)) })).filter(d => d.count);
  const range = PP_RANGE[preset];
  const pickWho = (id) => { setWho(who === id ? 'all' : id); };
  const pickGoods = (id) => { setGoods(goods === id ? 'all' : id); };
  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden', background:C_BG}}>
      <div style={{width:'100%', flex:1, display:'flex', flexDirection:'column', minHeight:0}}>
        <div style={{
          display:'flex', alignItems:'center', gap:8, flexWrap:'wrap',
          padding:'10px 14px', background:C_SURFACE, borderBottom:`1px solid ${C_BORDER}`,
        }}>
          <span style={{fontSize:12.5, color:C_MUTED, fontWeight:600}}>기간</span>
          <div style={stDate}>{range[0].replace(/-/g,'.')}</div>
          <span style={{color:C_MUTED, fontSize:12}}>~</span>
          <div style={stDate}>{range[1].replace(/-/g,'.')}</div>
          {[{id:'month', label:'이번 달'}, {id:'last', label:'지난달'}, {id:'year', label:'올해'}].map(p => (
            <button key={p.id} onClick={() => { setPreset(p.id); setWho('all'); setGoods('all'); }} style={{
              padding:'6px 11px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
              border:`1px solid ${preset === p.id ? C_BLUE : C_BORDER}`, borderRadius:14,
              background: preset === p.id ? C_BLUE_SOFT : C_SURFACE, color: preset === p.id ? C_BLUE : C_MUTED,
            }}>{p.label}</button>
          ))}
          <div style={{flex:1}}/>
          {[{id:'membership', label:'정액권'}, {id:'ticket', label:'티켓'}].map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setWho('all'); setGoods('all'); }} style={{
              padding:'7px 14px', fontSize:12.5, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
              border:'none', borderRadius:8,
              background: tab === t.id ? C_BLUE : C_SURFACE, color: tab === t.id ? '#fff' : C_MUTED,
              boxShadow: tab === t.id ? 'none' : `inset 0 0 0 1px ${C_BORDER}`,
            }}>{t.label}</button>
          ))}
        </div>
        <div style={{flex:1, overflow:'auto', padding:'16px 20px 28px'}}>
          <div style={{fontSize:12, color:C_MUTED, marginBottom:12}}>
            홈 <span style={{margin:'0 6px'}}>›</span> 분석 <span style={{margin:'0 6px'}}>›</span>
            <span style={{color:C_INK, fontWeight:700}}>정액권 분석</span>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:10, marginBottom:12}}>
            {[
              { label:'구매 고객', value:`${sum.buyers}명`, sub:`${sum.count}건` },
              { label:'판매 금액', value:`${stWon(sum.sales)}원`, sub:'기간 안 구매' },
              { label:'소진 금액', value:`${stWon(sum.used)}원`, sub: sum.sales ? `소진율 ${Math.round(sum.used / sum.sales * 100)}%` : '-' },
              { label:'잔액', value:`${stWon(sum.balance)}원`, sub:'아직 안 쓴 금액' },
              { label:'평균 소진기간', value: sum.days ? `${sum.days}일` : '-', sub:'쓰기 시작한 고객' },
            ].map(k => (
              <div key={k.label} style={stCard}>
                <div style={{fontSize:11.5, color:C_MUTED, fontWeight:600}}>{k.label}</div>
                <div style={{marginTop:6, fontSize:18, fontWeight:800, color:C_INK, fontVariantNumeric:'tabular-nums'}}>{k.value}</div>
                <div style={{marginTop:4, fontSize:11, color:C_MUTED}}>{k.sub}</div>
              </div>
            ))}
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1.15fr', gap:10, marginBottom:12}}>
            <PpGroup title={`${name}별`} hint="줄을 누르면 아래 고객만 봅니다. 전체로 돌아오려면 맨 위 전체를 누르세요." cols={['이름','고객','판매','소진','잔액','평균 소진기간']}
              rows={byGoods} all={ppSum(periodRows)} active={goods} onPick={pickGoods}
              cell={(r) => [r.name, `${r.buyers}명`, stWon(r.sales), stWon(r.used), stWon(r.balance), r.days ? `${r.days}일` : '-']}/>
            <PpGroup title="담당자별" hint="매출과 잔액. 전체로 돌아오려면 맨 위 전체를 누르세요." cols={['담당자','고객','판매','소진','잔액','평균 소진기간']}
              rows={byDes} all={ppSum(periodRows)} active={who} onPick={pickWho} dot
              cell={(r) => [r.name, `${r.buyers}명`, stWon(r.sales), stWon(r.used), stWon(r.balance), r.days ? `${r.days}일` : '-']}/>
          </div>
          <div style={{...stCard, padding:0, overflow:'hidden'}}>
            <div style={{padding:'12px 14px', borderBottom:`1px solid ${C_BORDER}`, display:'flex', alignItems:'center', gap:8}}>
              <div>
                <div style={stTitle}>고객 목록</div>
                <div style={{fontSize:11.5, color:C_MUTED, marginTop:3}}>잔액은 판매에서 지금까지 쓴 금액을 뺀 값입니다.</div>
              </div>
              <div style={{flex:1}}/>
              {who !== 'all' && <button onClick={() => setWho('all')} style={stChip}>{ST_DES.find(d => d.id === who).name} ×</button>}
              {goods !== 'all' && <button onClick={() => setGoods('all')} style={stChip}>{(goodsList.find(g => g.id === goods) || {}).name} ×</button>}
            </div>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%', borderCollapse:'collapse', minWidth:920}}>
                <thead>
                  <tr>
                    {['고객','연락처',name,'담당자','구매일','판매','소진','잔액','소진기간'].map((h, i) => (
                      <th key={h} style={{...stMxTh, textAlign: i < 5 ? 'left' : 'right'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shown.length === 0 && (
                    <tr><td colSpan={9} style={{...stMxTd, textAlign:'center', color:C_MUTED, fontWeight:600}}>이 기간에 구매한 고객이 없습니다.</td></tr>
                  )}
                  {shown.map((r, i) => {
                    const des = ST_DES.find(d => d.id === r.designer);
                    const g = goodsList.find(x => x.id === r.product);
                    return (
                      <tr key={i}>
                        <td style={{...stMxTd, textAlign:'left', fontWeight:800}}>{r.name}</td>
                        <td style={{...stMxTd, textAlign:'left', color:C_MUTED}}>{r.phone}</td>
                        <td style={{...stMxTd, textAlign:'left'}}>{g.name}</td>
                        <td style={{...stMxTd, textAlign:'left'}}>
                          <span style={{display:'inline-flex', alignItems:'center', gap:5}}>
                            <span style={{width:7, height:7, borderRadius:'50%', background:des.color}}/>{des.name}
                          </span>
                        </td>
                        <td style={{...stMxTd, textAlign:'left'}}>{r.bought.replace(/-/g,'.')}</td>
                        <td style={stMxTd}>{stWon(r.sales)}</td>
                        <td style={stMxTd}>{stWon(r.used)}</td>
                        <td style={{...stMxTd, fontWeight:800}}>{stWon(r.sales - r.used)}</td>
                        <td style={{...stMxTd, fontWeight:800, color:C_BLUE}}>{r.days ? `${r.days}일` : '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PpGroup({ title, hint, cols, rows, all, active, onPick, cell, dot }) {
  const allOn = active === 'all';
  const allVals = [
    '전체',
    `${all.buyers}명`,
    stWon(all.sales),
    stWon(all.used),
    stWon(all.balance),
    all.days ? `${all.days}일` : '-',
  ];
  return (
    <div style={{...stCard, padding:0, overflow:'hidden'}}>
      <div style={{padding:'12px 14px', borderBottom:`1px solid ${C_BORDER}`}}>
        <div style={stTitle}>{title}</div>
        <div style={{fontSize:11.5, color:C_MUTED, marginTop:3}}>{hint}</div>
      </div>
      <table style={{width:'100%', borderCollapse:'collapse'}}>
        <thead>
          <tr>{cols.map((h, i) => <th key={h} style={{...stMxTh, textAlign: i === 0 ? 'left' : 'right'}}>{h}</th>)}</tr>
        </thead>
        <tbody>
          <tr onClick={() => onPick('all')} style={{cursor:'pointer', background: allOn ? C_BLUE_SOFT : 'transparent'}}>
            <td style={{...stMxTd, textAlign:'left', fontWeight:800, color: allOn ? C_BLUE : C_INK, background: allOn ? C_BLUE_SOFT : C_SURFACE}}>전체</td>
            {allVals.slice(1).map((v, i) => (
              <td key={i} style={{...stMxTd, color: i === allVals.length - 2 ? C_BLUE : C_INK, fontWeight: i >= allVals.length - 3 ? 800 : 700}}>{v}</td>
            ))}
          </tr>
          {rows.map(r => {
            const vals = cell(r);
            const on = active === r.id;
            return (
              <tr key={r.id} onClick={() => onPick(r.id)} style={{cursor:'pointer', background: on ? C_BLUE_SOFT : 'transparent'}}>
                <td style={{...stMxTd, textAlign:'left', fontWeight:800, background: on ? C_BLUE_SOFT : C_SURFACE}}>
                  <span style={{display:'inline-flex', alignItems:'center', gap:6}}>
                    {dot && <span style={{width:8, height:8, borderRadius:'50%', background:r.color}}/>}
                    {vals[0]}
                  </span>
                </td>
                {vals.slice(1).map((v, i) => (
                  <td key={i} style={{...stMxTd, color: i === vals.length - 2 ? C_BLUE : C_INK, fontWeight: i >= vals.length - 3 ? 800 : 700}}>{v}</td>
                ))}
              </tr>
            );
          })}
          {rows.length === 0 && <tr><td colSpan={cols.length} style={{...stMxTd, textAlign:'center', color:C_MUTED}}>없음</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

const stDate = {
  height:32, padding:'0 10px', borderRadius:8, border:`1px solid ${C_BORDER}`,
  background:'#F8FAFC', color:C_INK, fontSize:12, fontWeight:700,
  display:'flex', alignItems:'center', fontVariantNumeric:'tabular-nums',
};
const stSelect = {
  height:32, padding:'0 8px', borderRadius:8, border:`1px solid ${C_BORDER}`,
  background:C_SURFACE, color:C_INK, fontSize:12, fontWeight:700, fontFamily:'inherit',
};
const stCard = { background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:12, padding:'14px 16px' };
const stChip = {
  height:26, padding:'0 10px', borderRadius:13, border:`1px solid ${C_BLUE}`,
  background:C_BLUE_SOFT, color:C_BLUE, fontSize:11.5, fontWeight:800, cursor:'pointer', fontFamily:'inherit',
};
const stTitle = { fontSize:13.5, fontWeight:800, color:C_INK };
const stMxTh = { padding:'6px 8px', fontSize:10.5, fontWeight:700, color:'#5C6B84', textAlign:'center', whiteSpace:'nowrap', background:'#F8FAFC', borderBottom:`1px solid ${C_BORDER}` };
const stMxTd = { padding:'7px 8px', fontSize:11, fontWeight:700, textAlign:'right', fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap', color:C_INK, borderTop:`1px solid ${C_BORDER}` };
const stTh = { padding:'8px 10px', fontSize:11, fontWeight:700, color:'#5C6B84', whiteSpace:'nowrap' };
const stTd = { padding:'9px 10px', fontSize:12, fontWeight:700, color:C_INK, textAlign:'right', fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap' };

window.C_SettlePage = C_SettlePage;
window.C_PrepaidPage = C_PrepaidPage;
