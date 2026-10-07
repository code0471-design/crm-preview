// 일일 마감 페이지 — 3 tabs (매출/내수/메타), 3 layouts (cards/summary/list-detail)

const {
  C_BLUE, C_BLUE_SOFT, C_INK, C_MUTED, C_BORDER, C_BG, C_SURFACE,
  c_iconBtnSm, c_ghostBtnSm,
} = window;

const CLOSING_BASE_DAY = '2026-09-11';
const CLOSING_APP_TODAY = '2026-09-21';

function closingShift(iso, delta) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d + delta);
  const p = (n) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}`;
}
function closingLabel(iso) {
  const [y, m, d] = iso.split('-');
  return `${y}년 ${m}월 ${d}일`;
}
function closingSubNet(d) {
  return (d.useLines || []).filter(u => u.sub).reduce((s, u) => s + (u.fee || 0), 0);
}
function closingPaid(r) { return r.amount || 0; }
function closingRowFee(r, settle) {
  if (r.kind === 'prepaid' || r.kind === 'ticket') return settle === 'use' ? 0 : (r.amount || 0);
  return r.amount || 0;
}
function closingGross(d) {
  return d.rows.reduce((a, r) => a + closingPaid(r), 0);
}
function closingFee(d) {
  const settle = d.settle || 'sale';
  const fromRows = d.rows.reduce((a, r) => a + closingRowFee(r, settle), 0);
  const fromUse = (d.useLines || []).reduce((s, l) => s + (l.fee || 0), 0);
  return fromRows + fromUse + (d.help || 0);
}
function closingReal(d) { return closingFee(d); }
// 해당 날짜 마감. 판매 정산이면 소진은 0원, 소진 정산이면 소진액이 시술자 수수료 대상.
function closingBook(iso, rows, settle) {
  const mode = settle === 'use' ? 'use' : 'sale';
  const map = {};
  const put = (id, name) => {
    if (!map[id]) {
      const base = iso === CLOSING_BASE_DAY ? CLOSING_TODAY[id] : null;
      map[id] = base
        ? { name: base.name, rows: base.rows, ticket: base.ticket || 0, coupon: base.coupon || 0, help: base.help || 0, subLines: [], useLines: [], settle: mode }
        : { name, rows: [], ticket: 0, coupon: 0, help: 0, subLines: [], useLines: [], settle: mode };
    }
    return map[id];
  };
  if (iso === CLOSING_BASE_DAY) {
    Object.entries(CLOSING_TODAY).forEach(([id, d]) => put(id, d.name));
  }
  (rows || []).filter(r => r.date === iso).forEach(r => {
    const perf = DESIGNERS.find(x => x.name === r.performer);
    const seller = DESIGNERS.find(x => x.name === r.seller);
    const tag = r.kind === 'ticket' ? '티켓소진' : '정액권소진';
    const transferred = mode === 'sale' && r.done && r.seller !== r.performer;
    const give = transferred ? (r.give || 0) : 0;
    put(perf ? perf.id : r.performer, r.performer).useLines.push({
      time: r.time, customer: r.customer, menu: r.menu, tag,
      paid: 0,
      saleAmount: r.amount || 0,
      fee: mode === 'use' ? (r.amount || 0) : (transferred ? give : 0),
      done: !!r.done,
      sub: transferred,
    });
    if (transferred) {
      put(seller ? seller.id : r.seller, r.seller).useLines.push({
        time: r.time, customer: r.customer, menu: r.menu, tag,
        paid: 0,
        saleAmount: r.amount || 0,
        fee: -give,
        done: true,
        sub: true,
      });
    }
  });
  return map;
}

function C_ClosingPage() {
  const [tab, setTab] = React.useState('sales');    // sales | internal | meta
  const [layout, setLayout] = React.useState('cards'); // cards | summary | list-detail
  const [selectedDesigner, setSelectedDesigner] = React.useState('moon');
  const [day, setDay] = React.useState(CLOSING_BASE_DAY);
  const [pin, setPin] = React.useState(null);
  const [hover, setHover] = React.useState(null);
  const spot = hover || pin;
  const toggleSpot = (id) => setPin(cur => cur === id ? null : id);
  const handoff = window.useSubHandoff ? window.useSubHandoff() : null;
  const book = closingBook(day, handoff ? handoff.rows : [], handoff ? handoff.settle : 'sale');

  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden', background:C_BG}}>
      <div style={{width: 948, flexShrink: 0, flex:1, display:'flex', flexDirection:'column', minHeight:0}}>
        <C_ClosingSubHeader
          tab={tab} setTab={setTab}
          layout={layout} setLayout={setLayout}
          day={day} setDay={setDay}
        />
        <div style={{flex:1, overflow:'auto', padding:'16px 20px 24px'}}>
          {/* 브레드크럼 */}
          <div style={{fontSize:12, color:C_MUTED, marginBottom:14}}>
            홈 <span style={{margin:'0 6px'}}>›</span>
            <span>일일 마감</span>
            <span style={{margin:'0 6px'}}>›</span>
            <span style={{color:C_INK, fontWeight:600}}>
              {tab === 'sales' ? '매출 마감' : tab === 'internal' ? '내수 마감' : '메타 매출'}
            </span>
          </div>

          {window.C_SettlePicker && <div style={{marginBottom:14}}><window.C_SettlePicker/></div>}

          {/* KPI 스트립 */}
          <C_ClosingKPIs book={book} spot={spot} onHover={setHover} onToggle={toggleSpot}/>

          {/* 범례 */}
          <C_ClosingLegend tab={tab}/>

          {/* 탭별 본문 */}
          {tab === 'sales' && (
            <>
              {Object.keys(book).length === 0 && (
                <div style={{padding:'48px 16px', textAlign:'center', fontSize:13, color:C_MUTED, background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:12}}>
                  이 날짜에 마감할 매출이 없어요.
                </div>
              )}
              {layout === 'cards' && <C_SalesCards book={book} spot={spot}/>}
              {layout === 'summary' && <C_SalesSummary book={book}/>}
              {layout === 'list-detail' && (
                <C_SalesListDetail book={book} spot={spot} selected={selectedDesigner} onSelect={setSelectedDesigner}/>
              )}
            </>
          )}
          {tab === 'internal' && <C_InternalClosing/>}
          {tab === 'meta' && <C_MetaClosing/>}
        </div>
      </div>
    </div>
  );
}

// ─ 서브헤더 ─
function C_ClosingSubHeader({ tab, setTab, layout, setLayout, day, setDay }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:8,
      padding:'10px 14px', background:C_SURFACE, borderBottom:`1px solid ${C_BORDER}`,
    }}>
      {/* 날짜 네비 */}
      <div style={{display:'flex', alignItems:'center', gap:6, flexShrink:0}}>
        <button onClick={() => setDay(closingShift(day, -1))} style={c_iconBtnSm}><IconChevronL size={14}/></button>
        <div style={{
          fontSize:15, fontWeight:700, color:C_INK, minWidth:148, textAlign:'center',
          fontVariantNumeric:'tabular-nums', letterSpacing:'-0.01em',
          display:'flex', alignItems:'center', justifyContent:'center', gap:5,
        }}>
          {closingLabel(day)}
        </div>
        <button onClick={() => setDay(closingShift(day, 1))} style={c_iconBtnSm}><IconChevronR size={14}/></button>
        <button onClick={() => setDay(CLOSING_APP_TODAY)} style={{...c_ghostBtnSm, marginLeft:2}}>오늘</button>
      </div>

      <div style={{flex:1}}/>

      {/* 3 탭 */}
      <div style={{display:'flex', background:C_BG, borderRadius:20, padding:3, border:`1px solid ${C_BORDER}`, flexShrink:0}}>
        {[
          { id:'sales',    label:'매출 마감' },
          { id:'internal', label:'내수 마감' },
          { id:'meta',     label:'메타 매출' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding:'4px 14px', fontSize:12, fontWeight:600,
            border:'none', borderRadius:16, cursor:'pointer',
            background: tab===t.id ? C_SURFACE : 'transparent',
            color: tab===t.id ? C_INK : C_MUTED,
            boxShadow: tab===t.id ? '0 1px 2px rgba(11,20,37,0.08)' : 'none',
            whiteSpace:'nowrap',
          }}>{t.label}</button>
        ))}
      </div>

      {/* 레이아웃 스위치 (매출 탭에서만) */}
      {tab === 'sales' && (
        <div style={{display:'flex', background:C_BG, borderRadius:7, padding:2, border:`1px solid ${C_BORDER}`, flexShrink:0}}>
          {[
            { id:'cards',       label:'카드' },
            { id:'summary',     label:'요약' },
            { id:'list-detail', label:'리스트' },
          ].map(v => (
            <button key={v.id} onClick={() => setLayout(v.id)} style={{
              padding:'5px 10px', fontSize:11.5, fontWeight:600,
              border:'none', borderRadius:5, cursor:'pointer',
              background: layout===v.id ? C_SURFACE : 'transparent',
              color: layout===v.id ? C_INK : C_MUTED,
              boxShadow: layout===v.id ? '0 1px 2px rgba(11,20,37,0.06)' : 'none',
            }}>{v.label}</button>
          ))}
        </div>
      )}

      {/* CTA */}
      <button style={{
        padding:'7px 14px', background: C_BLUE, color:'#fff',
        border:'none', borderRadius:7, fontSize:12, fontWeight:600,
        cursor:'pointer', flexShrink:0, whiteSpace:'nowrap',
        display:'flex', alignItems:'center', gap:5,
        boxShadow:'0 1px 2px rgba(30,64,175,0.2)',
      }}>
        <IconCheck size={12}/> 마감 확정
      </button>
    </div>
  );
}

// ─ 통계 계산 유틸 ─
function calcClosingTotals(book) {
  const totals = {
    revenue: 0, count: 0, cash: 0, card: 0, mix: 0, fresh: 0, returning: 0,
  };
  Object.values(book || {}).forEach(d => {
    d.rows.forEach(r => {
      totals.revenue += r.amount;
      totals.count += 1;
      if (r.pay === 'cash' || r.pay === 'card' || r.pay === 'mix') totals[r.pay] += r.amount;
      if (r.channel === 'revisit' || r.channel === 'replace') totals.returning += 1;
      else totals.fresh += 1;
    });
  });
  return totals;
}

// ─ KPI 스트립 ─
function closingSpotOn(row, spot) {
  if (!spot || !row) return false;
  if (spot === 'card') return row.pay === 'card';
  if (spot === 'cash') return row.pay === 'cash';
  if (spot === 'fresh') return row.channel !== 'revisit' && row.channel !== 'replace';
  if (spot === 'returning') return row.channel === 'revisit' || row.channel === 'replace';
  return false;
}
function closingSpotStyle(on) {
  if (on === true) return { background:'#FEF08A', boxShadow:'inset 4px 0 0 #D97706', opacity:1 };
  if (on === false) return { opacity:0.22 };
  return {};
}

function C_ClosingKPIs({ book, spot, onHover, onToggle }) {
  const t = calcClosingTotals(book);
  const won = (n) => new Intl.NumberFormat('ko-KR').format(n || 0);
  const money = [
    { id:null, label:'총 고객 결제액', value:`₩ ${won(t.revenue)}`, sub: t.mix ? `현금+카드 ${won(t.mix)} 포함` : `${t.count}건`, tint:'#EFF3FC', iconColor:C_BLUE, icon:<IconTrend/> },
    { id:'card', label:'카드합계', value:`₩ ${won(t.card)}`, sub:'카드 결제 · 클릭하면 고정', tint:'#EFF6FF', iconColor:'#2563EB', icon:<IconTag/> },
    { id:'cash', label:'현금합계', value:`₩ ${won(t.cash)}`, sub:'현금 결제 · 클릭하면 고정', tint:'#F0FDF4', iconColor:'#059669', icon:<IconChart/> },
  ];
  const guest = (
      <div style={{background:C_SURFACE, padding:'14px 16px', borderRadius:10, border:`1px solid ${C_BORDER}`}}>
        <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:8}}>
          <div style={{fontSize:11.5, color:C_MUTED, fontWeight:500}}>객수</div>
          <div style={{width:26, height:26, borderRadius:6, background:'#F0FDF4', color:'#059669', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <IconUser size={14}/>
          </div>
        </div>
        <div style={{fontSize:20, fontWeight:700, color:C_INK, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em', lineHeight:1.1}}>{t.count}명</div>
        <div style={{display:'flex', gap:8, marginTop:8}}>
          <span onMouseEnter={() => onHover('fresh')} onMouseLeave={() => onHover(null)} onClick={() => onToggle('fresh')} style={{fontSize:12, fontWeight:700, color:'#1D4ED8', background: spot === 'fresh' ? '#FEF08A' : '#EFF6FF', borderRadius:8, padding:'3px 8px', cursor:'pointer', boxShadow: spot === 'fresh' ? 'inset 0 0 0 1.5px #D97706' : 'none'}}>신규 {t.fresh}</span>
          <span onMouseEnter={() => onHover('returning')} onMouseLeave={() => onHover(null)} onClick={() => onToggle('returning')} style={{fontSize:12, fontWeight:700, color:'#6D28D9', background: spot === 'returning' ? '#FEF08A' : '#F5F3FF', borderRadius:8, padding:'3px 8px', cursor:'pointer', boxShadow: spot === 'returning' ? 'inset 0 0 0 1.5px #D97706' : 'none'}}>기존 {t.returning}</span>
        </div>
      </div>
  );

  return (
    <div style={{display:'grid', gridTemplateColumns:'1.15fr 0.95fr 1fr 1fr', gap:12, marginBottom:14}}>
      {money.slice(0, 1).map(k => (
        <div key={k.label} style={{background:C_SURFACE, padding:'14px 16px', borderRadius:10, border:`1px solid ${C_BORDER}`}}>
          <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10}}>
            <div style={{fontSize:11.5, color:C_MUTED, fontWeight:500}}>{k.label}</div>
            <div style={{width:26, height:26, borderRadius:6, background:k.tint, color:k.iconColor, display:'flex', alignItems:'center', justifyContent:'center'}}>
              {React.cloneElement(k.icon, { size:14 })}
            </div>
          </div>
          <div style={{fontSize:20, fontWeight:700, color:C_INK, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em', lineHeight:1.1}}>{k.value}</div>
          <div style={{fontSize:11, color:C_MUTED, marginTop:5}}>{k.sub}</div>
        </div>
      ))}
      {guest}
      {money.slice(1).map(k => (
        <div key={k.label}
          onMouseEnter={() => onHover(k.id)} onMouseLeave={() => onHover(null)} onClick={() => onToggle(k.id)}
          style={{background: spot === k.id ? '#FFFBEB' : C_SURFACE, padding:'14px 16px', borderRadius:10, border:`1px solid ${spot === k.id ? '#F59E0B' : C_BORDER}`, cursor:'pointer'}}>
          <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10}}>
            <div style={{fontSize:11.5, color:C_MUTED, fontWeight:500}}>{k.label}</div>
            <div style={{width:26, height:26, borderRadius:6, background:k.tint, color:k.iconColor, display:'flex', alignItems:'center', justifyContent:'center'}}>
              {React.cloneElement(k.icon, { size:14 })}
            </div>
          </div>
          <div style={{fontSize:20, fontWeight:700, color:C_INK, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em', lineHeight:1.1}}>{k.value}</div>
          <div style={{fontSize:11, color:C_MUTED, marginTop:5}}>{k.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ─ 범례 ─
function C_ClosingLegend({ tab }) {
  return (
    <div style={{
      display:'flex', gap:14, padding:'10px 14px',
      background:C_SURFACE, borderRadius:8, border:`1px solid ${C_BORDER}`,
      marginBottom:14, alignItems:'center', flexWrap:'wrap',
    }}>
      <span style={{fontSize:11, color:C_MUTED, fontWeight:600}}>채널</span>
      {STATS_CHANNELS.map(c => (
        <span key={c.id} style={{display:'inline-flex', alignItems:'center', gap:5, fontSize:11.5}}>
          <span style={{width:8, height:8, borderRadius:'50%', background:c.color}}/>
          <span style={{color:C_INK}}>{c.label}</span>
        </span>
      ))}
      <div style={{width:1, height:14, background:C_BORDER, margin:'0 4px'}}/>
      <span style={{fontSize:11, color:C_MUTED, fontWeight:600}}>결제</span>
      {PAY_METHODS.map(p => (
        <span key={p.id} style={{display:'inline-flex', alignItems:'center', gap:5, fontSize:11.5}}>
          <span style={{width:8, height:8, borderRadius:2, background:p.color}}/>
          <span style={{color:C_INK}}>{p.label}</span>
        </span>
      ))}
    </div>
  );
}

// ─ 매출 마감: 디자이너 카드 세로 나열 (기본) ─
function C_SalesCards({ book, spot }) {
  if (!Object.keys(book).length) return null;
  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
      {Object.entries(book).map(([id, d]) => {
        const designer = DESIGNERS.find(x => x.id === id);
        return <C_DesignerClosingCard key={id} id={id} d={d} designer={designer} spot={spot}/>;
      })}
    </div>
  );
}

function C_DesignerClosingCard({ id, d, designer, spot }) {
  const rowTotal = d.rows.reduce((a, r) => a + r.amount, 0);
  const cashTotal = d.rows.filter(r => r.pay === 'cash').reduce((a,r) => a+r.amount, 0);
  const cardTotal = d.rows.filter(r => r.pay === 'card').reduce((a,r) => a+r.amount, 0);
  const mixTotal  = d.rows.filter(r => r.pay === 'mix').reduce((a,r) => a+r.amount, 0);
  const gross = closingGross(d);
  const fee = closingFee(d);
  const color = designer?.color || '#94A3B8';
  const initials = d.name.charAt(0);

  return (
    <div style={{
      background:C_SURFACE, borderRadius:12, overflow:'hidden',
      border:`1px solid ${C_BORDER}`,
      borderTop:`3px solid ${color}`,
      boxShadow:'0 1px 3px rgba(11,20,37,0.06), 0 1px 2px rgba(11,20,37,0.04)',
    }}>
      {/* 헤더 - 디자이너 색상 톤 배경 */}
      <div style={{
        padding:'12px 14px', display:'flex', alignItems:'center', gap:10,
        borderBottom:`1px solid ${C_BORDER}`,
        background: `linear-gradient(90deg, ${color}14 0%, ${color}05 60%, transparent 100%)`,
      }}>
        {/* 아바타 */}
        <div style={{
          width:34, height:34, borderRadius:'50%',
          background: color, color:'#fff',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:14, fontWeight:700, letterSpacing:'-0.02em',
          flexShrink:0,
          boxShadow: `0 2px 6px ${color}55`,
        }}>{initials}</div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{display:'flex', alignItems:'center', gap:6}}>
            <div style={{fontSize:14, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>{d.name}</div>
            <span style={{display:'inline-flex', alignItems:'baseline', gap:4, fontVariantNumeric:'tabular-nums'}}>
              <span style={{fontSize:10, fontWeight:700, color:C_MUTED}}>수수료 대상</span>
              <span style={{fontSize:13, fontWeight:800, color: fee < 0 ? '#DC2626' : C_BLUE, letterSpacing:'-0.02em'}}>
                {new Intl.NumberFormat('ko-KR').format(fee)}
              </span>
            </span>
          </div>
          <div style={{marginTop:3}}>
            <span style={{
              fontSize:10.5, fontWeight:700, color, background:`${color}22`,
              padding:'1px 6px', borderRadius:8, letterSpacing:'-0.01em',
            }}>{designer?.role}</span>
          </div>
        </div>
        <div style={{textAlign:'right', flexShrink:0}}>
          <div style={{fontSize:10, color:C_MUTED, fontWeight:600, letterSpacing:'0.02em'}}>총 고객 결제액</div>
          <div style={{fontSize:16, fontWeight:700, color:C_INK, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em', lineHeight:1.15}}>
            ₩ {new Intl.NumberFormat('ko-KR').format(gross)}
          </div>
        </div>
      </div>

      {/* 매출 내역 미니 테이블 */}
      <table style={{width:'100%', borderCollapse:'collapse', fontSize:11.5, fontVariantNumeric:'tabular-nums'}}>
        <thead>
          <tr style={{background:'#FBFCFE', color:C_MUTED, fontSize:10.5}}>
            <th style={{...c_thSm, width:28}}>#</th>
            <th style={{...c_thSm, textAlign:'left', width:44}}>시간</th>
            <th style={{...c_thSm, textAlign:'left', width:52}}>고객명</th>
            <th style={{...c_thSm, textAlign:'left'}}>시술명</th>
            <th style={{...c_thSm, textAlign:'right', width:72}}>고객결제액</th>
            <th style={{...c_thSm, textAlign:'right', width:72}}>수수료 대상</th>
          </tr>
        </thead>
        <tbody>
          {d.rows.map((r, i) => {
            const ch = STATS_CHANNELS.find(c => c.id === r.channel);
            const pay = PAY_METHODS.find(p => p.id === r.pay);
            const lineFee = closingRowFee(r, d.settle);
            const on = spot ? closingSpotOn(r, spot) : null;
            return (
              <tr key={i} style={{borderTop:`1px solid ${C_BORDER}`, transition:'background 0.12s, opacity 0.12s', ...closingSpotStyle(on)}}>
                <td style={{...c_tdSm, color:C_MUTED, textAlign:'center'}}>{i+1}</td>
                <td style={c_tdSm}>{r.time}</td>
                <td style={c_tdSm}><C_CustLink name={r.customer} menu={r.menu} designer={id} amount={r.amount} pay={r.pay}/></td>
                <td style={{...c_tdSm, color:C_INK, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                  <span title={`${ch?.label} · ${pay?.label}`} style={{
                    display:'inline-block', width:7, height:7, borderRadius:'50%', background:ch?.color, marginRight:5,
                  }}/>
                  {r.menu}
                </td>
                <td style={{...c_tdSm, textAlign:'right', color:C_INK, fontWeight:600}}>
                  {new Intl.NumberFormat('ko-KR').format(closingPaid(r))}
                </td>
                <td style={{...c_tdSm, textAlign:'right', fontWeight:700, color: lineFee ? C_INK : '#94A3B8'}}>
                  {new Intl.NumberFormat('ko-KR').format(lineFee)}
                </td>
              </tr>
            );
          })}
          {(d.useLines || []).map((u, i) => {
            const feeN = u.fee || 0;
            const feeColor = feeN < 0 ? '#DC2626' : feeN > 0 ? (u.sub ? '#047857' : '#6D28D9') : '#94A3B8';
            const feeText = feeN > 0 && u.sub
              ? '+' + new Intl.NumberFormat('ko-KR').format(feeN)
              : new Intl.NumberFormat('ko-KR').format(feeN);
            const on = spot ? false : null;
            return (
            <tr key={`use-${i}`} style={{borderTop:`1px solid ${C_BORDER}`, background: on === false ? undefined : (u.sub ? '#FFF7ED' : (feeN > 0 ? '#F5F3FF' : C_SURFACE)), transition:'background 0.12s, opacity 0.12s', ...closingSpotStyle(on)}}>
              <td style={{...c_tdSm, color:C_MUTED, textAlign:'center', boxShadow: u.sub ? 'inset 3px 0 0 #F59E0B' : 'none'}}>{d.rows.length + i + 1}</td>
              <td style={c_tdSm}>{u.time}</td>
              <td style={c_tdSm}><C_CustLink name={u.customer} menu={u.menu} designer={id} amount={u.saleAmount} pay="card"/></td>
              <td style={{...c_tdSm, color:C_INK, whiteSpace:'nowrap'}}>
                {u.menu}
                <span style={{marginLeft:6, fontSize:10, fontWeight:800, color: feeN > 0 && !u.sub ? '#6D28D9' : '#94A3B8', background: feeN > 0 && !u.sub ? '#EDE9FE' : '#F1F5F9', borderRadius:8, padding:'1px 5px'}}>{u.tag}</span>
                {u.sub && <span style={{marginLeft:4, fontSize:10, fontWeight:800, color:'#C2410C', background:'#FFEDD5', borderRadius:8, padding:'1px 5px'}}>대체</span>}
              </td>
              <td style={{...c_tdSm, textAlign:'right', color:'#94A3B8', fontWeight:600}}>0</td>
              <td style={{...c_tdSm, textAlign:'right', fontWeight:700, color:feeColor}}>
                {feeText}
              </td>
            </tr>
            );
          })}
          {d.help ? <C_FeeRow label="헬프 매출" fee={d.help}/> : null}
          <C_SumBand label="대체 매출" fee={closingSubNet(d)} signed gap/>
          <C_SumBand label="현금 매출" paid={cashTotal}/>
          <C_SumBand label="카드 매출" paid={cardTotal}/>
          {mixTotal ? <C_SumBand label="현금+카드" paid={mixTotal}/> : null}
          <tr style={{borderTop:`2px solid ${C_BLUE}`, background:C_BLUE_SOFT}}>
            <td colSpan="4" style={{...c_tdSm, color:C_INK, fontWeight:700}}>총 고객 결제액</td>
            <td style={{...c_tdSm, textAlign:'right', color:C_INK, fontWeight:700, fontSize:13}}>
              {new Intl.NumberFormat('ko-KR').format(gross)}
            </td>
            <td style={c_tdSm}/>
          </tr>
          <tr style={{borderTop:`1px solid ${C_BORDER}`, background:C_BLUE_SOFT}}>
            <td colSpan="5" style={{...c_tdSm, color:C_BLUE, fontWeight:700}}>수수료 대상</td>
            <td style={{...c_tdSm, textAlign:'right', color:C_BLUE, fontWeight:700, fontSize:13}}>
              {new Intl.NumberFormat('ko-KR').format(fee)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function C_CustLink({ name, menu, designer, amount, pay }) {
  return (
    <button
      onClick={() => window.__openSales && window.__openSales({ customer:name, menu, designer, amount, pay, detail:true, key:Date.now() })}
      style={{
        background:'none', border:'none', padding:0, margin:0, color:C_BLUE, fontWeight:600,
        cursor:'pointer', fontFamily:'inherit', fontSize:'inherit', textAlign:'left',
      }}
    >{name}</button>
  );
}

function C_SumBand({ label, paid, fee, signed, gap }) {
  const paidOn = paid != null;
  const feeOn = fee != null;
  const n = paidOn ? (paid || 0) : (fee || 0);
  const color = signed ? (n < 0 ? '#DC2626' : n > 0 ? '#047857' : C_MUTED) : C_INK;
  const text = `${signed && n > 0 ? '+' : ''}${new Intl.NumberFormat('ko-KR').format(n)}`;
  return (
    <tr style={{background:'#F4F7FB', borderTop: gap ? `8px solid ${C_BG}` : `1px solid ${C_BORDER}`}}>
      <td colSpan="4" style={{...c_tdSm, color:C_MUTED, fontSize:11, fontWeight:700, letterSpacing:'-0.01em'}}>{label}</td>
      <td style={{...c_tdSm, textAlign:'right', color: paidOn ? color : C_MUTED, fontWeight:700}}>{paidOn ? text : ''}</td>
      <td style={{...c_tdSm, textAlign:'right', color: feeOn ? color : C_MUTED, fontWeight:700}}>{feeOn ? text : ''}</td>
    </tr>
  );
}

function C_FeeRow({ label, fee }) {
  return (
    <tr style={{borderTop:`1px solid ${C_BORDER}`, background:'#FBFCFE'}}>
      <td colSpan="5" style={{...c_tdSm, color:C_MUTED, fontSize:10.5}}>{label}</td>
      <td style={{...c_tdSm, textAlign:'right', color: fee < 0 ? '#EF4444' : fee === 0 ? '#CBD5E1' : C_INK, fontWeight:600}}>
        {new Intl.NumberFormat('ko-KR').format(fee)}
      </td>
    </tr>
  );
}

function C_SumRow({ label, value, muted }) {
  return (
    <tr style={{borderTop:`1px solid ${C_BORDER}`, background:'#FBFCFE'}}>
      <td colSpan="5" style={{...c_tdSm, color:muted ? '#CBD5E1' : C_MUTED, fontSize:10.5}}>{label}</td>
      <td style={{...c_tdSm, textAlign:'right', color: value < 0 ? '#EF4444' : muted || value === 0 ? '#CBD5E1' : C_INK, fontWeight: value === 0 ? 400 : 500}}>
        {value === 0 ? '0' : new Intl.NumberFormat('ko-KR').format(value)}
      </td>
    </tr>
  );
}

// ─ 매출 마감: 요약 뷰 (전체 랭킹표) ─
function C_SalesSummary({ book }) {
  if (!Object.keys(book).length) return null;
  const rows = Object.entries(book).map(([id, d]) => {
    const designer = DESIGNERS.find(x => x.id === id);
    const total = d.rows.reduce((a,r) => a+r.amount, 0);
    const count = d.rows.length;
    const cash = d.rows.filter(r => r.pay === 'cash').reduce((a,r) => a+r.amount, 0);
    const card = d.rows.filter(r => r.pay === 'card').reduce((a,r) => a+r.amount, 0);
    const sub = closingSubNet(d);
    const prepaid = d.rows.filter(r => r.kind === 'prepaid' || r.kind === 'ticket').reduce((a, r) => a + r.amount, 0);
    return { id, name: d.name, designer, total, count, cash, card, ticket: prepaid, sub, real: closingFee(d) };
  }).sort((a,b) => b.real - a.real);
  const grand = rows.reduce((a,r) => a+r.real, 0);
  const maxReal = Math.max(...rows.map(r => r.real), 1);

  return (
    <div style={{background:C_SURFACE, borderRadius:10, border:`1px solid ${C_BORDER}`, overflow:'hidden'}}>
      <div style={{padding:'14px 18px', borderBottom:`1px solid ${C_BORDER}`, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div style={{fontSize:13.5, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>디자이너별 매출 요약</div>
        <div style={{fontSize:12, color:C_MUTED}}>총 {rows.length}명 · ₩ {new Intl.NumberFormat('ko-KR').format(grand)}</div>
      </div>
      <table style={{width:'100%', borderCollapse:'collapse', fontSize:12, fontVariantNumeric:'tabular-nums'}}>
        <thead>
          <tr style={{background:'#FBFCFE'}}>
            <th style={{...c_th, textAlign:'left'}}>#</th>
            <th style={{...c_th, textAlign:'left'}}>디자이너</th>
            <th style={c_th}>건수</th>
            <th style={c_th}>현금</th>
            <th style={c_th}>카드</th>
            <th style={c_th}>정액권</th>
            <th style={c_th}>대체</th>
            <th style={{...c_th, textAlign:'left', width:120}}>매출 비교</th>
            <th style={{...c_th, background:C_BLUE_SOFT, color:C_BLUE}}>수수료 대상</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id} style={{borderTop:`1px solid ${C_BORDER}`}}>
              <td style={{...c_td, textAlign:'left', color:C_MUTED, fontWeight:600, width:32}}>{i+1}</td>
              <td style={{...c_tdName}}>
                <div style={{display:'flex', alignItems:'center', gap:8}}>
                  <div style={{width:3, height:14, borderRadius:2, background:r.designer?.color}}/>
                  <span style={{fontWeight:600, color:C_INK}}>{r.name}</span>
                  <span style={{fontSize:10.5, color:C_MUTED}}>{r.designer?.role}</span>
                </div>
              </td>
              <td style={c_td}>{r.count}건</td>
              <td style={{...c_td, color: r.cash > 0 ? C_INK : '#CBD5E1'}}>{r.cash > 0 ? new Intl.NumberFormat('ko-KR').format(r.cash) : '0'}</td>
              <td style={{...c_td, color: r.card > 0 ? C_INK : '#CBD5E1'}}>{r.card > 0 ? new Intl.NumberFormat('ko-KR').format(r.card) : '0'}</td>
              <td style={{...c_td, color: r.ticket > 0 ? C_INK : '#CBD5E1'}}>{r.ticket > 0 ? new Intl.NumberFormat('ko-KR').format(r.ticket) : '0'}</td>
              <td style={{...c_td, color: r.sub > 0 ? '#047857' : r.sub < 0 ? '#DC2626' : '#CBD5E1'}}>{r.sub === 0 ? '0' : (r.sub > 0 ? '+' : '') + new Intl.NumberFormat('ko-KR').format(r.sub)}</td>
              <td style={{padding:'8px 12px'}}>
                <div style={{height:6, background:'#F1F5F9', borderRadius:3, overflow:'hidden'}}>
                  <div style={{width:`${r.real/maxReal*100}%`, height:'100%', background:r.designer?.color}}/>
                </div>
              </td>
              <td style={{...c_td, color:C_BLUE, fontWeight:700, background:'#FBFCFE'}}>{new Intl.NumberFormat('ko-KR').format(r.real)}</td>
            </tr>
          ))}
          <tr style={{borderTop:`2px solid ${C_BLUE}`, background:C_BLUE_SOFT}}>
            <td colSpan="7" style={{...c_td, textAlign:'right', color:C_INK, fontWeight:700}}>합계</td>
            <td/>
            <td style={{...c_td, color:C_BLUE, fontWeight:700, fontSize:14}}>{new Intl.NumberFormat('ko-KR').format(grand)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ─ 매출 마감: 리스트+상세 (좌 리스트, 우 카드 하나) ─
function C_SalesListDetail({ book, selected, onSelect, spot }) {
  const ids = Object.keys(book);
  if (!ids.length) return null;
  const cur = book[selected] || book[ids[0]];
  const curId = book[selected] ? selected : ids[0];
  const curDesigner = DESIGNERS.find(x => x.id === curId);
  return (
    <div style={{display:'grid', gridTemplateColumns:'260px 1fr', gap:12}}>
      <div style={{background:C_SURFACE, borderRadius:10, border:`1px solid ${C_BORDER}`, overflow:'hidden', maxHeight:640, overflowY:'auto'}}>
        {ids.map(id => {
          const d = book[id];
          const total = closingReal(d);
          const active = id === curId;
          const designer = DESIGNERS.find(x => x.id === id);
          return (
            <div key={id} onClick={() => onSelect(id)} style={{
              padding:'12px 14px', borderBottom:`1px solid ${C_BORDER}`,
              cursor:'pointer',
              background: active ? C_BLUE_SOFT : 'transparent',
              display:'flex', alignItems:'center', gap:10,
              transition:'background 0.12s',
            }}>
              <div style={{width:4, height:26, borderRadius:2, background:designer?.color}}/>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:13, fontWeight:600, color:C_INK}}>{d.name}</div>
                <div style={{fontSize:10.5, color:C_MUTED}}>{d.rows.length}건</div>
              </div>
              <div style={{fontSize:13, fontWeight:700, color: active ? C_BLUE : C_INK, fontVariantNumeric:'tabular-nums'}}>
                ₩{Math.round(total/1000)}K
              </div>
            </div>
          );
        })}
      </div>
      <div>
        <C_DesignerClosingCard id={curId} d={cur} designer={curDesigner} spot={spot}/>
      </div>
    </div>
  );
}

// ─ 내수 마감 ─
function C_InternalClosing() {
  return (
    <div style={{display:'flex', flexDirection:'column', gap:14}}>
      {/* 정액권 판매 */}
      <div style={{background:C_SURFACE, borderRadius:10, border:`1px solid ${C_BORDER}`, overflow:'hidden'}}>
        <div style={{padding:'14px 18px', borderBottom:`1px solid ${C_BORDER}`, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{fontSize:13.5, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>정액권 판매</div>
          <div style={{fontSize:12, color:C_MUTED}}>{CLOSING_INTERNAL.ticketSold.length}건 · ₩ {new Intl.NumberFormat('ko-KR').format(CLOSING_INTERNAL.ticketSold.reduce((a,t)=>a+t.amount,0))}</div>
        </div>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:12.5, fontVariantNumeric:'tabular-nums'}}>
          <thead><tr style={{background:'#FBFCFE'}}>
            <th style={{...c_th, textAlign:'left'}}>정액권명</th>
            <th style={{...c_th, textAlign:'left'}}>고객</th>
            <th style={{...c_th, textAlign:'left'}}>디자이너</th>
            <th style={c_th}>수량</th>
            <th style={c_th}>금액</th>
          </tr></thead>
          <tbody>
            {CLOSING_INTERNAL.ticketSold.map((t, i) => {
              const d = DESIGNERS.find(x => x.id === t.designer);
              return (
                <tr key={i} style={{borderTop:`1px solid ${C_BORDER}`}}>
                  <td style={{...c_tdName, fontWeight:600, color:C_INK}}>{t.name}</td>
                  <td style={{...c_tdName, color:C_BLUE}}>{t.customer}</td>
                  <td style={c_tdName}>
                    <span style={{display:'inline-flex', alignItems:'center', gap:5}}>
                      <span style={{width:6, height:6, borderRadius:'50%', background:d?.color}}/>
                      {d?.name}
                    </span>
                  </td>
                  <td style={c_td}>{t.qty}</td>
                  <td style={{...c_td, fontWeight:700, color:C_INK}}>{new Intl.NumberFormat('ko-KR').format(t.amount)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 정액권 사용 */}
      <div style={{background:C_SURFACE, borderRadius:10, border:`1px solid ${C_BORDER}`, overflow:'hidden'}}>
        <div style={{padding:'14px 18px', borderBottom:`1px solid ${C_BORDER}`, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{fontSize:13.5, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>정액권 사용</div>
          <div style={{fontSize:12, color:C_MUTED}}>{CLOSING_INTERNAL.ticketUsed.length}건 사용</div>
        </div>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:12.5, fontVariantNumeric:'tabular-nums'}}>
          <thead><tr style={{background:'#FBFCFE'}}>
            <th style={{...c_th, textAlign:'left'}}>정액권명</th>
            <th style={{...c_th, textAlign:'left'}}>고객</th>
            <th style={{...c_th, textAlign:'left'}}>디자이너</th>
            <th style={c_th}>사용 횟수</th>
          </tr></thead>
          <tbody>
            {CLOSING_INTERNAL.ticketUsed.map((t, i) => {
              const d = DESIGNERS.find(x => x.id === t.designer);
              return (
                <tr key={i} style={{borderTop:`1px solid ${C_BORDER}`}}>
                  <td style={{...c_tdName, fontWeight:600, color:C_INK}}>{t.name}</td>
                  <td style={{...c_tdName, color:C_BLUE}}>{t.customer}</td>
                  <td style={c_tdName}>
                    <span style={{display:'inline-flex', alignItems:'center', gap:5}}>
                      <span style={{width:6, height:6, borderRadius:'50%', background:d?.color}}/>
                      {d?.name}
                    </span>
                  </td>
                  <td style={c_td}>{t.qty}회</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 재고 사용 */}
      <div style={{background:C_SURFACE, borderRadius:10, border:`1px solid ${C_BORDER}`, overflow:'hidden'}}>
        <div style={{padding:'14px 18px', borderBottom:`1px solid ${C_BORDER}`, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{fontSize:13.5, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>재고 사용</div>
          <div style={{fontSize:12, color:C_MUTED}}>총 ₩ {new Intl.NumberFormat('ko-KR').format(CLOSING_INTERNAL.stockUsed.reduce((a,s)=>a+s.amount,0))}</div>
        </div>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:12.5, fontVariantNumeric:'tabular-nums'}}>
          <thead><tr style={{background:'#FBFCFE'}}>
            <th style={{...c_th, textAlign:'left'}}>제품명</th>
            <th style={c_th}>수량</th>
            <th style={c_th}>금액</th>
          </tr></thead>
          <tbody>
            {CLOSING_INTERNAL.stockUsed.map((s, i) => (
              <tr key={i} style={{borderTop:`1px solid ${C_BORDER}`}}>
                <td style={{...c_tdName, fontWeight:600, color:C_INK}}>{s.name}</td>
                <td style={c_td}>{s.qty}개</td>
                <td style={{...c_td, fontWeight:600, color:C_INK}}>{new Intl.NumberFormat('ko-KR').format(s.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─ 메타 매출 ─
function C_MetaClosing() {
  const total = CLOSING_META.reduce((a,m)=>a+m.amount, 0);
  return (
    <div>
      <div style={{
        background:'#EFF3FC', borderRadius:10, border:`1px solid #C7D6F5`,
        padding:'14px 18px', marginBottom:14,
        display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        <div>
          <div style={{fontSize:12, color:C_BLUE, fontWeight:600, letterSpacing:'0.02em'}}>메타 매출 · 오늘 정산</div>
          <div style={{fontSize:11.5, color:C_MUTED, marginTop:4}}>외부 채널 및 광고비, 제휴 정산 (매출 마감과 별도 집계)</div>
        </div>
        <div style={{fontSize:22, fontWeight:700, color: total >= 0 ? C_BLUE : '#EF4444', fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em'}}>
          {total >= 0 ? '+' : ''}₩ {new Intl.NumberFormat('ko-KR').format(total)}
        </div>
      </div>

      <div style={{background:C_SURFACE, borderRadius:10, border:`1px solid ${C_BORDER}`, overflow:'hidden'}}>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:12.5, fontVariantNumeric:'tabular-nums'}}>
          <thead><tr style={{background:'#FBFCFE'}}>
            <th style={{...c_th, textAlign:'left'}}>정산 출처</th>
            <th style={c_th}>건수</th>
            <th style={{...c_th, textAlign:'left'}}>비고</th>
            <th style={c_th}>금액</th>
          </tr></thead>
          <tbody>
            {CLOSING_META.map((m, i) => (
              <tr key={i} style={{borderTop:`1px solid ${C_BORDER}`}}>
                <td style={{...c_tdName, fontWeight:600, color:C_INK}}>{m.source}</td>
                <td style={c_td}>{m.count}건</td>
                <td style={{...c_tdName, color:C_MUTED, fontSize:11.5}}>{m.note}</td>
                <td style={{...c_td, fontWeight:700, color: m.amount >= 0 ? C_INK : '#EF4444'}}>
                  {m.amount >= 0 ? '+' : ''}{new Intl.NumberFormat('ko-KR').format(m.amount)}
                </td>
              </tr>
            ))}
            <tr style={{borderTop:`2px solid ${C_BLUE}`, background:C_BLUE_SOFT}}>
              <td colSpan="3" style={{...c_td, textAlign:'right', color:C_INK, fontWeight:700}}>합계</td>
              <td style={{...c_td, fontWeight:700, color: total >= 0 ? C_BLUE : '#EF4444', fontSize:14}}>
                {total >= 0 ? '+' : ''}₩ {new Intl.NumberFormat('ko-KR').format(total)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

const c_thSm = { padding:'6px 8px', fontSize:10.5, fontWeight:600, color:'#5C6B84' };
const c_tdSm = { padding:'6px 8px', fontSize:11.5 };

window.C_ClosingPage = C_ClosingPage;
