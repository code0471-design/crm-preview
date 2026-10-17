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
function stLine(m, day, designer, visit, cat, kind, service, pay, use, n) {
  return { m, day, designer, visit, cat, kind, service, pay: pay || {}, use: use || {}, n: n || 1 };
}

// 시술·제품 행은 pay + use = service. 정액권·티켓·예약금 판매는 service 0.
const ST_ROWS = [
  // 10/17 오늘
  stLine(10, 17, 'moon',  'revisit', 'color',   'service', 70000,  { card:50000 }, { membership:20000 }),
  stLine(10, 17, 'moon',  'revisit', 'clinic',  'service', 80000,  { card:80000 }, {}),
  stLine(10, 17, 'lee',   'revisit', 'perm',    'service', 180000, { card:180000 }, {}),
  stLine(10, 17, 'jung',  'naver',   'color',   'service', 130000, { naver:130000 }, {}),
  stLine(10, 17, 'kims',  'new',     'perm',    'service', 220000, { card:150000, bank:70000 }, {}),
  stLine(10, 17, 'leehj', 'walkin',  'cut',     'service', 25000,  { cash:25000 }, {}),
  stLine(10, 17, 'kimjy', 'revisit', 'cut',     'service', 20000,  { cash:20000 }, {}),
  stLine(10, 17, 'park',  'intro',   'clinic',  'service', 90000,  { card:40000 }, { ticket:50000 }),
  stLine(10, 17, 'moon',  'revisit', null,      'membership', 0,   { card:300000 }, {}),
  stLine(10, 17, 'lee',   'new',     'product', 'product', 45000,  { card:45000 }, {}),
  // 10/16
  stLine(10, 16, 'moon',  'revisit', 'color',   'service', 150000, { card:150000 }, {}),
  stLine(10, 16, 'lee',   'revisit', 'perm',    'service', 160000, { card:100000 }, { membership:60000 }),
  stLine(10, 16, 'jung',  'revisit', 'cut',     'service', 35000,  { card:35000 }, {}),
  stLine(10, 16, 'kims',  'naver',   'color',   'service', 120000, { naver:120000 }, {}),
  stLine(10, 16, 'leehj', 'revisit', 'cut',     'service', 30000,  { cash:15000, card:15000 }, {}),
  stLine(10, 16, 'park',  'revisit', 'product', 'product', 28000,  { card:28000 }, {}),
  stLine(10, 16, 'kimjy', 'new',     'cut',     'service', 18000,  { cash:18000 }, {}),
  stLine(10, 16, 'jung',  'revisit', null,      'ticket',  0,      { card:200000 }, {}),
  // 10/15
  stLine(10, 15, 'moon',  'new',     'perm',    'service', 250000, { card:200000, bank:50000 }, {}),
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
      <div style={{width:948, flexShrink:0, flex:1, display:'flex', flexDirection:'column', minHeight:0}}>
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

          {view === 'overview' && <StOverview b={b} basis={basis} byDes={data.byDes} total={total} ticket={ticket}/>}
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

function StOverview({ b, basis, byDes, total, ticket }) {
  const sale = stSaleSum(b);
  const used = stUseSum(b);
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
  const parts = basis === 'pay'
    ? ST_PAYS.map(p => ({ name:p.name, color:p.color, v:b.payMethods[p.id] || 0 }))
    : ST_CATS.map(c => ({ name:c.name, color:C_BLUE, v:b.cats[c.id] || 0 }));
  const maxPart = Math.max(1, ...parts.map(p => p.v));
  const rank = ST_DES.map(d => ({ ...d, v: basis === 'pay' ? byDes[d.id].pay : byDes[d.id].service, customers: byDes[d.id].customers }))
    .filter(d => d.v > 0)
    .sort((a, c) => c.v - a.v);
  const maxRank = Math.max(1, ...rank.map(d => d.v));

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

      <div style={{display:'grid', gridTemplateColumns:'1.15fr 0.85fr', gap:10}}>
        <div style={stCard}>
          <div style={stTitle}>{basis === 'pay' ? '결제 수단' : '메뉴 구성'}</div>
          <div style={{display:'flex', flexDirection:'column', gap:8, marginTop:12}}>
            {parts.filter(p => p.v > 0).map(p => (
              <div key={p.name}>
                <div style={{display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4}}>
                  <span style={{fontWeight:700, color:C_INK}}>{p.name}</span>
                  <span style={{fontWeight:700, color:C_INK, fontVariantNumeric:'tabular-nums'}}>
                    {stWon(p.v)}원
                    <span style={{color:C_MUTED, fontWeight:600, marginLeft:6}}>{total ? Math.round(p.v / total * 100) : 0}%</span>
                  </span>
                </div>
                <div style={{height:6, borderRadius:4, background:'#F1F5F9'}}>
                  <div style={{height:'100%', width:`${p.v / maxPart * 100}%`, borderRadius:4, background: basis === 'pay' ? p.color : C_BLUE}}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={stCard}>
          <div style={stTitle}>왜 두 금액이 다른가</div>
          <div style={{marginTop:10, display:'flex', flexDirection:'column', gap:6}}>
            <StBridge label="결제 금액" value={b.pay} strong/>
            {b.sale.membership > 0 && <StBridge label="정액권 판매" value={-b.sale.membership}/>}
            {b.sale.ticket > 0 && <StBridge label="티켓 판매" value={-b.sale.ticket}/>}
            {b.sale.deposit > 0 && <StBridge label="예약금 수령" value={-b.sale.deposit}/>}
            {b.use.membership > 0 && <StBridge label="정액권 소진" value={b.use.membership} plus/>}
            {b.use.ticket > 0 && <StBridge label="티켓 소진" value={b.use.ticket} plus/>}
            {b.use.deposit > 0 && <StBridge label="예약금 사용" value={b.use.deposit} plus/>}
            {b.use.point > 0 && <StBridge label="포인트 사용" value={b.use.point} plus/>}
            <div style={{height:1, background:C_BORDER, margin:'4px 0'}}/>
            <StBridge label="시술 금액" value={b.service} strong/>
          </div>
          <div style={{marginTop:8, fontSize:11, color:C_MUTED, lineHeight:1.4}}>
            판 날과 쓰는 날이 달라서 차이가 납니다. 소진 {stWon(used)}원, 판매 {stWon(sale)}원.
          </div>
        </div>
      </div>

      <div style={stCard}>
        <div style={stTitle}>담당자 순위</div>
        <div style={{display:'flex', flexDirection:'column', gap:8, marginTop:12}}>
          {rank.map(d => (
            <div key={d.id} style={{display:'grid', gridTemplateColumns:'92px 1fr 110px', gap:8, alignItems:'center'}}>
              <div style={{display:'flex', alignItems:'center', gap:6, minWidth:0}}>
                <span style={{width:8, height:8, borderRadius:'50%', background:d.color, flexShrink:0}}/>
                <span style={{fontSize:12.5, fontWeight:700, color:C_INK}}>{d.name}</span>
              </div>
              <div style={{height:8, borderRadius:4, background:'#F1F5F9'}}>
                <div style={{height:'100%', width:`${d.v / maxRank * 100}%`, borderRadius:4, background:d.color}}/>
              </div>
              <div style={{textAlign:'right', fontSize:12, fontWeight:800, color:C_INK, fontVariantNumeric:'tabular-nums'}}>
                {stWon(d.v)}원
                <span style={{display:'block', fontSize:10.5, fontWeight:600, color:C_MUTED}}>{d.customers}명</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StBridge({ label, value, strong, plus }) {
  const show = value < 0 ? `−${stWon(-value)}` : plus ? `+${stWon(value)}` : stWon(value);
  return (
    <div style={{display:'flex', justifyContent:'space-between', gap:8, fontSize: strong ? 13 : 12}}>
      <span style={{color: strong ? C_INK : C_MUTED, fontWeight: strong ? 800 : 600}}>{label}</span>
      <span style={{
        fontWeight:800, fontVariantNumeric:'tabular-nums',
        color: value < 0 ? '#DC2626' : plus ? '#059669' : C_INK,
      }}>{show}</span>
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
const stTh = { padding:'8px 10px', fontSize:11, fontWeight:700, color:'#5C6B84', whiteSpace:'nowrap' };
const stTd = { padding:'9px 10px', fontSize:12, fontWeight:700, color:C_INK, textAlign:'right', fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap' };

window.C_SettlePage = C_SettlePage;
