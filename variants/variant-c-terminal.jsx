// 분석 › 단말기 결제내역
// 매출내역의 카드 건을 단말기 승인과 맞춰 본다.
// 단독·연동은 승인번호가 있고, 단말기 없는 카드매출은 입력만 된 금액이다.

const {
  C_BLUE, C_BLUE_SOFT, C_INK, C_MUTED, C_BORDER, C_BG, C_SURFACE,
  c_ghostBtnSm,
} = window;

const TERM_TODAY = '2026-09-21';

// 매출내역 카드 건에 붙는 단말기 결과. 여기 없으면 승인 없는 카드 입력으로 본다.
const TERM_EXTRA = {
  '2026-09-21|10:00|박서연': { match:'link', issuer:'신한', approval:'48120933' },
  '2026-09-19|15:10|조유진': { match:'link', issuer:'삼성', approval:'22918470' },
  '2026-09-11|10:00|이하늘': { match:'link', issuer:'현대', approval:'77304126' },
  '2026-09-11|10:00|박서연': { match:'link', issuer:'국민', approval:'55019824' },
  '2026-09-11|11:00|한지민': { match:'link', issuer:'롯데', approval:'31882045' },
  '2026-09-11|15:30|김도윤': { match:'link', issuer:'BC', approval:'90221467' },
  '2026-08-12|13:30|홍지수': { match:'link', issuer:'하나', approval:'66430118' },
  '2026-09-11|11:00|강수현': { match:'solo', issuer:'삼성', approval:'10448291' },
  '2026-09-08|16:40|이수아': { match:'none', issuer:'', approval:'' },
  '2026-09-20|14:00|장하윤': { match:'none', issuer:'', approval:'' },
  '2026-09-16|12:00|오세훈': { match:'none', issuer:'', approval:'' },
  '2026-08-22|11:00|서지우': { match:'none', issuer:'', approval:'' },
};

const TERM_MATCHES = [
  { id:'all', label:'전체' },
  { id:'solo', label:'단독결제' },
  { id:'link', label:'연동결제' },
  { id:'none', label:'단말기 없는 카드매출' },
];
const TERM_MATCH_LABEL = { solo:'단독', link:'연동', none:'단말기 없음' };
const TERM_TITLES = { solo:'단독결제', link:'연동결제', none:'단말기 없는 카드매출' };

function termShift(iso, delta) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d + delta);
  const p = (n) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}`;
}
function termMonth(iso, delta) {
  const [y, m] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1 + delta, 1);
  const p = (n) => String(n).padStart(2, '0');
  const last = new Date(dt.getFullYear(), dt.getMonth() + 1, 0).getDate();
  return {
    from: `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-01`,
    to: `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(last)}`,
  };
}
function termWon(n) {
  return new Intl.NumberFormat('ko-KR').format(n || 0);
}
function termOf(row) {
  return TERM_EXTRA[`${row.date}|${row.time}|${row.customer}`] || { match:'none', issuer:'', approval:'' };
}

function C_TermLogPage() {
  const month = termMonth(TERM_TODAY, 0);
  const [from, setFrom] = React.useState(month.from);
  const [to, setTo] = React.useState(month.to);
  const [match, setMatch] = React.useState('all');

  const applyRange = (a, b) => { setFrom(a); setTo(b); };
  const reset = () => { applyRange(month.from, month.to); setMatch('all'); };

  const rows = (window.LEDGER_ROWS || []).filter(r => r.pay === 'card' && r.date >= from && r.date <= to)
    .map(r => ({ ...r, ...termOf(r) }))
    .sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1));

  const sumOf = (id) => rows.filter(r => r.match === id).reduce((a, r) => a + r.amount, 0);
  const countOf = (id) => rows.filter(r => r.match === id).length;
  const approved = sumOf('solo') + sumOf('link');
  const cardInput = rows.reduce((a, r) => a + r.amount, 0);
  const gap = sumOf('none');

  const blocks = match === 'all' ? ['solo', 'link', 'none'] : [match];

  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden', background:C_BG}}>
      <div style={{width:948, flexShrink:0, flex:1, display:'flex', flexDirection:'column', minHeight:0}}>
        <div style={{padding:'14px 20px 0', flexShrink:0}}>
          <div style={{fontSize:12, color:C_MUTED, marginBottom:8}}>
            홈 <span style={{margin:'0 6px'}}>›</span> 분석 <span style={{margin:'0 6px'}}>›</span>
            <span style={{color:C_INK, fontWeight:700}}>단말기 결제내역</span>
          </div>
          <div style={{fontSize:18, fontWeight:800, color:C_INK, letterSpacing:'-0.02em'}}>단말기 결제내역</div>
          <div style={{fontSize:12, color:C_MUTED, marginTop:3}}>단말기에서 승인된 건과, 카드로만 입력되고 승인이 없는 건을 나눕니다.</div>
        </div>

        <div style={{flex:1, overflow:'auto', padding:'14px 20px 24px'}}>
          <div style={{background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:12, padding:'12px 14px', marginBottom:12}}>
            <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
              <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={termDate}/>
              <span style={{color:C_MUTED, fontSize:12}}>~</span>
              <input type="date" value={to} onChange={e => setTo(e.target.value)} style={termDate}/>
              {[
                { label:'오늘', range:[TERM_TODAY, TERM_TODAY] },
                { label:'어제', range:[termShift(TERM_TODAY, -1), termShift(TERM_TODAY, -1)] },
                { label:'이번달', range:[month.from, month.to] },
                { label:'지난달', range:[termMonth(TERM_TODAY, -1).from, termMonth(TERM_TODAY, -1).to] },
              ].map(b => (
                <button key={b.label} onClick={() => applyRange(b.range[0], b.range[1])} style={c_ghostBtnSm}>{b.label}</button>
              ))}
              <div style={{flex:1}}/>
              <button onClick={reset} style={c_ghostBtnSm}>초기화</button>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', marginTop:12}}>
              <span style={{fontSize:11.5, fontWeight:700, color:C_MUTED, width:36}}>구분</span>
              {TERM_MATCHES.map(o => {
                const on = match === o.id;
                return (
                  <button key={o.id} onClick={() => setMatch(o.id)} style={{
                    height:26, padding:'0 10px', borderRadius:13, cursor:'pointer', fontFamily:'inherit',
                    border:`1px solid ${on ? C_BLUE : C_BORDER}`, background: on ? C_BLUE_SOFT : C_SURFACE,
                    color: on ? C_BLUE : C_INK, fontSize:12, fontWeight: on ? 800 : 600,
                  }}>{o.label}</button>
                );
              })}
            </div>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1.2fr 1fr 1fr 1.3fr', gap:10, marginBottom:10}}>
            {[
              { label:'단말기 승인', value:`₩ ${termWon(approved)}`, sub:`단독+연동 ${countOf('solo') + countOf('link')}건` },
              { label:'단독결제', value:`₩ ${termWon(sumOf('solo'))}`, sub:`${countOf('solo')}건` },
              { label:'연동결제', value:`₩ ${termWon(sumOf('link'))}`, sub:`${countOf('link')}건` },
              { label:'단말기 없는 카드매출', value:`₩ ${termWon(gap)}`, sub:`${countOf('none')}건`, warn: gap > 0 },
            ].map(k => (
              <div key={k.label} style={{background:C_SURFACE, border:`1px solid ${k.warn ? '#FECACA' : C_BORDER}`, borderRadius:10, padding:'12px 14px'}}>
                <div style={{fontSize:11.5, color: k.warn ? '#DC2626' : C_MUTED, fontWeight:600}}>{k.label}</div>
                <div style={{fontSize:18, fontWeight:800, color: k.warn ? '#DC2626' : C_INK, marginTop:4, letterSpacing:'-0.02em', fontVariantNumeric:'tabular-nums'}}>{k.value}</div>
                <div style={{fontSize:11, color:C_MUTED, marginTop:3}}>{k.sub}</div>
              </div>
            ))}
          </div>
          <div style={{fontSize:12, color:C_MUTED, marginBottom:12}}>
            카드 입력 ₩ {termWon(cardInput)} · 단말기 승인 ₩ {termWon(approved)} · 차이 ₩ {termWon(gap)}
          </div>

          <div style={{display:'flex', flexDirection:'column', gap:12}}>
            {blocks.map(id => (
              <TermBlock key={id} title={TERM_TITLES[id]} rows={rows.filter(r => r.match === id)}/>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TermBlock({ title, rows }) {
  const amount = rows.reduce((a, r) => a + r.amount, 0);
  return (
    <div style={{background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:12, overflow:'hidden'}}>
      <div style={{display:'flex', alignItems:'center', gap:10, padding:'12px 14px', borderBottom:`1px solid ${C_BORDER}`}}>
        <div style={{fontSize:13.5, fontWeight:800, color:C_INK}}>{title}</div>
        <div style={{fontSize:12, color:C_MUTED, fontWeight:700}}>{rows.length}건</div>
        <div style={{marginLeft:'auto', fontSize:13, fontWeight:800, color:C_BLUE, fontVariantNumeric:'tabular-nums'}}>합계 ₩ {termWon(amount)}</div>
      </div>
      <table style={{width:'100%', borderCollapse:'collapse', fontSize:12, fontVariantNumeric:'tabular-nums'}}>
        <thead>
          <tr style={{background:'#FBFCFE', color:C_MUTED, fontSize:11}}>
            {['일시','고객','메뉴','담당','구분','카드사','승인번호','결제액'].map(h => (
              <th key={h} style={{padding:'8px 10px', fontWeight:700, textAlign: h === '결제액' ? 'right' : 'left', borderBottom:`1px solid ${C_BORDER}`, whiteSpace:'nowrap'}}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={8} style={{padding:'28px 12px', textAlign:'center', color:C_MUTED, fontSize:13}}>이 조건에 해당하는 결제가 없어요.</td></tr>
          )}
          {rows.map((r, i) => (
            <tr key={i} style={{borderTop:`1px solid ${C_BORDER}`}}>
              <td style={termTd}>{r.date.slice(5).replace('-', '.')} {r.time}</td>
              <td style={termTd}>
                <button onClick={() => window.__openSales && window.__openSales({
                  customer:r.customer, menu:r.menu, designer:r.designerId, amount:r.amount, pay:r.pay, detail:true, key:Date.now(),
                })} style={{border:'none', background:'none', padding:0, color:C_BLUE, fontWeight:700, cursor:'pointer', fontFamily:'inherit', fontSize:12}}>{r.customer}</button>
              </td>
              <td style={{...termTd, fontWeight:700}}>{r.menu}</td>
              <td style={termTd}>{r.designer}</td>
              <td style={termTd}><TermBadge match={r.match}/></td>
              <td style={{...termTd, color: r.issuer ? C_INK : '#CBD5E1'}}>{r.issuer || '—'}</td>
              <td style={{...termTd, fontWeight: r.approval ? 700 : 500, color: r.approval ? C_INK : '#CBD5E1'}}>{r.approval || '—'}</td>
              <td style={{...termTd, textAlign:'right', fontWeight:800}}>{termWon(r.amount)}</td>
            </tr>
          ))}
        </tbody>
        {rows.length > 0 && (
          <tfoot>
            <tr style={{background:C_BLUE_SOFT}}>
              <td colSpan={7} style={{...termTd, fontWeight:800, color:C_BLUE}}>합계</td>
              <td style={{...termTd, textAlign:'right', fontWeight:800, color:C_BLUE}}>{termWon(amount)}</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

function TermBadge({ match }) {
  const tone = match === 'link'
    ? { color:C_BLUE, background:C_BLUE_SOFT }
    : match === 'solo'
      ? { color:'#B45309', background:'#FFFBEB' }
      : { color:'#DC2626', background:'#FEF2F2' };
  return (
    <span style={{fontSize:10, fontWeight:800, borderRadius:99, padding:'2px 6px', ...tone}}>
      {TERM_MATCH_LABEL[match]}
    </span>
  );
}

const termDate = {
  height:30, padding:'0 8px', border:`1px solid ${C_BORDER}`, borderRadius:8,
  fontSize:12, fontFamily:'inherit', color:C_INK, background:C_SURFACE, outline:'none',
};
const termTd = { padding:'8px 10px', color:C_INK, whiteSpace:'nowrap' };

window.C_TermLogPage = C_TermLogPage;
