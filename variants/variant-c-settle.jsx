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
  stLine(10, 16, 'park',  'revisit', 'product', 'product', 28000,  { gift:28000 }, {}),
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
              note="카드 · 현금 · 계좌 · 네이버페이 · 상품권. 정액권·티켓을 판 돈이 포함됩니다."
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

          {view === 'overview' && <StOverview b={b} basis={basis} rows={rows} flows={designer === 'all' ? stFlowsFor(preset) : []} total={total} ticket={ticket} designerOn={designer !== 'all'}/>}
          {view === 'designer' && <StDesigner byDes={data.byDes} basis={basis}/>}
          {view === 'menu' && <StMenu b={b} basis={basis}/>}
          {view === 'visit' && <StVisit byVisit={data.byVisit} basis={basis}/>}
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
function stNums(s, total, neg) {
  const k = neg ? -1 : 1;
  return [s.cashI, s.bankI, s.cashO, s.bankO, s.card, s.gift, s.naver, s.preUse, s.ticketUse, total].map(n => k * n);
}

function StOverview({ b, basis, rows, flows, total, ticket, designerOn }) {
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
  const flowIn = stFlowSlice(flows, 'in');
  const flowOut = stFlowSlice(flows, 'out');
  const profit = stAddSlice(stAddSlice(store, flowIn), flowOut, -1);
  const closeSvc = stCloseOf(mx.svc, 'work', basis);
  const closePre = stCloseOf(mx.pre, 'prepaid', basis);
  const closeTix = stCloseOf(mx.tix, 'prepaid', basis);
  const closeSub = closeSvc + closePre + closeTix;
  const closeProd = stCloseOf(mx.prod, 'product', basis);
  const closeStore = closeSub + closeProd;
  const closeIn = stSliceMoney(flowIn);
  const closeOut = stSliceMoney(flowOut);
  const closeProfit = closeStore + closeIn - closeOut;
  const storeRows = [
    { label:'시술', pad:true, nums: stNums(mx.svc, closeSvc) },
    { label:'선결제', pad:true, nums: stNums(mx.pre, closePre) },
    { label:'티켓', pad:true, nums: stNums(mx.tix, closeTix) },
    { label:'시술 소계', sub:true, nums: stNums(subSvc, closeSub) },
    { label:'제품판매', nums: stNums(mx.prod, closeProd) },
    { label:'매장 매출 합계', total:true, nums: stNums(store, closeStore) },
    { label:'입금', pad:true, nums: stNums(flowIn, closeIn) },
    { label:'출금', pad:true, nums: stNums(flowOut, closeOut, true) },
    { label:'입출금 소계', sub:true, nums: stNums(stAddSlice(flowIn, flowOut, -1), closeIn - closeOut) },
    { label:'손익', total:true, nums: stNums(profit, closeProfit) },
  ];
  const headNums = ['현금', '통장', '현금', '통장', '카드', '상품권', '네이버페이', '선결제 사용', '티켓 사용', basis === 'pay' ? '합계 · 결제' : '합계 · 시술'];

  const desRows = ST_DES.map(d => {
    const g = mx.byDes[d.id];
    const shown = basis === 'pay' ? stAddSlice(g.work, g.pre) : g.work;
    const use = stSliceUse(g.work);
    const svcSum = basis === 'pay' ? stSliceMoney(shown) : stSliceMoney(g.work) + use;
    const prodSum = stSliceMoney(g.prod) + (basis === 'service' ? stSliceUse(g.prod) : 0);
    const sum = svcSum + prodSum;
    const subAmt = g.work.sub + g.prod.sub;
    if (!sum && !use && !stSliceMoney(g.pre)) return null;
    const cash = (s) => s.cashI + s.cashO;
    const bank = (s) => s.bankI + s.bankO;
    return {
      ...d,
      svc: [cash(shown), bank(shown), shown.card, shown.gift, shown.naver, use, svcSum],
      prod: [cash(g.prod), bank(g.prod), g.prod.card, g.prod.gift, g.prod.naver, prodSum],
      sum, subAmt, settle: sum - subAmt,
    };
  }).filter(Boolean).sort((a, c) => c.settle - a.settle);
  const desFoot = desRows.reduce((a, d) => ({
    svc: d.svc.map((n, i) => n + (a.svc[i] || 0)),
    prod: d.prod.map((n, i) => n + (a.prod[i] || 0)),
    sum: a.sum + d.sum, subAmt: a.subAmt + d.subAmt, settle: a.settle + d.settle,
  }), { svc:[0,0,0,0,0,0,0], prod:[0,0,0,0,0,0], sum:0, subAmt:0, settle:0 });

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
              ? '합계는 고객이 낸 돈입니다. 선결제·티켓을 사용한 금액은 합계에 넣지 않습니다.'
              : '합계는 시술·제품 금액입니다. 선결제·티켓을 사용한 금액은 합계에 넣고, 새로 판 금액은 뺍니다.'}
            {designerOn ? ' 담당자를 고르면 입출금은 빼고 그 담당자 매출만 봅니다.' : ''}
          </div>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%', borderCollapse:'collapse', minWidth:980}}>
            <thead>
              <tr>
                <th rowSpan={2} style={{...stMxTh, textAlign:'left', position:'sticky', left:0, zIndex:1}}>구분</th>
                <th colSpan={2} style={stMxTh}>영수증 발행</th>
                <th colSpan={2} style={stMxTh}>영수증 미발행</th>
                {headNums.slice(4).map(h => <th key={h} rowSpan={2} style={{...stMxTh, ...(h.indexOf('합계') === 0 ? {color:C_BLUE} : {})}}>{h}</th>)}
              </tr>
              <tr>
                {headNums.slice(0, 4).map((h, i) => <th key={h + i} style={stMxTh}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {storeRows.map(r => (
                <tr key={r.label} style={{background: r.total ? C_BLUE_SOFT : r.sub ? '#F8FAFC' : C_SURFACE}}>
                  <td style={{...stMxTd, textAlign:'left', position:'sticky', left:0, background: r.total ? C_BLUE_SOFT : r.sub ? '#F8FAFC' : C_SURFACE, fontWeight:800, paddingLeft: r.pad ? 22 : 10}}>
                    {r.label}
                  </td>
                  {r.nums.map((n, i) => (
                    <td key={i} style={{...stMxTd, fontWeight: i === r.nums.length - 1 || r.total ? 800 : 700, color: n < 0 ? '#DC2626' : (i === r.nums.length - 1 ? C_BLUE : C_INK)}}>
                      {n ? (n < 0 ? '−' : '') + stWon(Math.abs(n)) : <span style={{color:'#E2E8F0'}}>0</span>}
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
          <div style={{fontSize:11.5, color:C_MUTED, marginTop:3}}>대체금액은 마감 합계에 넣지 않습니다. 정산매출에서 뺍니다.</div>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%', borderCollapse:'collapse', minWidth:1180}}>
            <thead>
              <tr>
                <th rowSpan={2} style={{...stMxTh, textAlign:'left', position:'sticky', left:0, zIndex:1}}>담당자</th>
                <th colSpan={7} style={stMxTh}>시술</th>
                <th colSpan={6} style={stMxTh}>판매</th>
                <th rowSpan={2} style={stMxTh}>총합계</th>
                <th rowSpan={2} style={stMxTh}>대체금액</th>
                <th rowSpan={2} style={{...stMxTh, color:C_BLUE}}>정산매출</th>
              </tr>
              <tr>
                {['현금','통장','카드','상품권','네이버','소진','합계','현금','통장','카드','상품권','네이버','합계'].map((h, i) => (
                  <th key={h + i} style={{...stMxTh, color: h === '합계' ? C_BLUE : '#5C6B84'}}>{h}</th>
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
                  {d.svc.concat(d.prod, [d.sum, d.subAmt, d.settle]).map((n, i) => (
                    <td key={i} style={{...stMxTd, fontWeight: i === 6 || i === 12 || i >= 13 ? 800 : 700, color: i === 15 ? C_BLUE : C_INK}}>
                      {n ? stWon(n) : <span style={{color:'#E2E8F0'}}>0</span>}
                    </td>
                  ))}
                </tr>
              ))}
              <tr style={{background:C_BLUE_SOFT}}>
                <td style={{...stMxTd, textAlign:'left', position:'sticky', left:0, background:C_BLUE_SOFT, fontWeight:800, color:C_BLUE}}>합계</td>
                {desFoot.svc.concat(desFoot.prod, [desFoot.sum, desFoot.subAmt, desFoot.settle]).map((n, i) => (
                  <td key={i} style={{...stMxTd, fontWeight:800, color:C_BLUE}}>{n ? stWon(n) : <span style={{color:'#BFDBFE'}}>0</span>}</td>
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

function StVisit({ byVisit, basis }) {
  const items = ST_VISITS.map(v => {
    const x = byVisit[v.id];
    const amount = basis === 'pay' ? x.pay : x.service;
    return { ...v, amount, customers: x.customers };
  }).filter(v => v.amount > 0 || v.customers > 0);
  const total = items.reduce((a, v) => a + v.amount, 0) || 1;
  return (
    <div style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:10}}>
      {ST_VISITS.map(v => {
        const hit = items.find(i => i.id === v.id) || { amount:0, customers:0 };
        const avg = hit.customers ? Math.round(hit.amount / hit.customers) : 0;
        return (
          <div key={v.id} style={stCard}>
            <div style={{display:'flex', alignItems:'center', gap:6}}>
              <span style={{width:8, height:8, borderRadius:'50%', background:v.color}}/>
              <span style={{fontSize:12.5, fontWeight:800, color:C_INK}}>{v.name}</span>
            </div>
            <div style={{marginTop:10, fontSize:16, fontWeight:800, color:C_INK, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em'}}>{stWon(hit.amount)}원</div>
            <div style={{marginTop:4, fontSize:11.5, color:C_MUTED}}>{hit.customers}명 · 객단가 {stWon(avg)}원</div>
            <div style={{marginTop:8, height:4, borderRadius:3, background:'#F1F5F9'}}>
              <div style={{height:'100%', width:`${hit.amount / total * 100}%`, borderRadius:3, background:v.color}}/>
            </div>
          </div>
        );
      })}
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
const stTitle = { fontSize:13.5, fontWeight:800, color:C_INK };
const stMxTh = { padding:'6px 8px', fontSize:10.5, fontWeight:700, color:'#5C6B84', textAlign:'center', whiteSpace:'nowrap', background:'#F8FAFC', borderBottom:`1px solid ${C_BORDER}` };
const stMxTd = { padding:'7px 8px', fontSize:11, fontWeight:700, textAlign:'right', fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap', color:C_INK, borderTop:`1px solid ${C_BORDER}` };
const stTh = { padding:'8px 10px', fontSize:11, fontWeight:700, color:'#5C6B84', whiteSpace:'nowrap' };
const stTd = { padding:'9px 10px', fontSize:12, fontWeight:700, color:C_INK, textAlign:'right', fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap' };

window.C_SettlePage = C_SettlePage;
