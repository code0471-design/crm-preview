// 분석 › 매출내역
// 기간과 구분으로 결제 건을 찾고, 합계와 한 줄 내역을 본다.

const {
  C_BLUE, C_BLUE_SOFT, C_INK, C_MUTED, C_BORDER, C_BG, C_SURFACE,
  c_ghostBtnSm,
} = window;

const LEDGER_TODAY = '2026-09-21';

const LEDGER_ROWS = [
  { date:'2026-09-21', time:'10:00', customer:'박서연', menu:'루트터치업', designer:'문지윤', designerId:'moon', kind:'service', visit:'returning', list:70000, discount:0, pay:'card', amount:70000 },
  { date:'2026-09-21', time:'11:30', customer:'오세훈', menu:'남성컷', designer:'이현진', designerId:'leehj', kind:'service', visit:'fresh', list:20000, discount:0, pay:'cash', amount:20000 },
  { date:'2026-09-20', time:'14:00', customer:'장하윤', menu:'클리닉', designer:'박소현', designerId:'park', kind:'prepaid', visit:'returning', list:80000, discount:0, pay:'card', amount:0 },
  { date:'2026-09-19', time:'15:10', customer:'조유진', menu:'모이스처 샴푸', designer:'문지윤', designerId:'moon', kind:'product', visit:'returning', list:38000, discount:3000, pay:'card', amount:35000 },
  { date:'2026-09-18', time:'13:20', customer:'유서진', menu:'디지털펌', designer:'한지영', designerId:'han', kind:'service', visit:'fresh', list:180000, discount:0, pay:'naver', amount:180000 },
  { date:'2026-09-16', time:'12:00', customer:'오세훈', menu:'남성컷', designer:'윤재훈', designerId:'yoon', kind:'ticket', visit:'returning', list:20000, discount:0, pay:'card', amount:0 },
  { date:'2026-09-11', time:'10:00', customer:'이하늘', menu:'디지털펌', designer:'이상현', designerId:'lee', kind:'service', visit:'fresh', list:180000, discount:0, pay:'card', amount:180000 },
  { date:'2026-09-11', time:'10:00', customer:'박서연', menu:'루트터치업', designer:'문지윤', designerId:'moon', kind:'service', visit:'returning', list:70000, discount:0, pay:'card', amount:70000 },
  { date:'2026-09-11', time:'11:00', customer:'강수현', menu:'헤어스파', designer:'문지윤', designerId:'moon', kind:'service', visit:'returning', list:70000, discount:0, pay:'card', amount:70000 },
  { date:'2026-09-11', time:'11:00', customer:'한지민', menu:'전체염색', designer:'정명희', designerId:'jung', kind:'service', visit:'fresh', list:130000, discount:0, pay:'card', amount:130000 },
  { date:'2026-09-11', time:'11:30', customer:'장하윤', menu:'뿌리염색+클리닉', designer:'박소현', designerId:'park', kind:'service', visit:'returning', list:150000, discount:15000, pay:'mix', amount:135000 },
  { date:'2026-09-11', time:'15:30', customer:'김도윤', menu:'정액권 30만원', designer:'이상현', designerId:'lee', kind:'prepaid', visit:'returning', list:300000, discount:0, pay:'card', amount:300000 },
  { date:'2026-09-08', time:'16:40', customer:'이수아', menu:'커트', designer:'박소현', designerId:'park', kind:'service', visit:'fresh', list:25000, discount:0, pay:'card', amount:25000 },
  { date:'2026-08-22', time:'11:00', customer:'서지우', menu:'전체염색', designer:'송미란', designerId:'song', kind:'prepaid', visit:'returning', list:130000, discount:0, pay:'card', amount:0 },
  { date:'2026-08-12', time:'13:30', customer:'홍지수', menu:'디지털펌', designer:'문지윤', designerId:'moon', kind:'service', visit:'fresh', list:180000, discount:0, pay:'card', amount:180000 },
];

const LEDGER_KINDS = [
  { id:'all', label:'전체' },
  { id:'service', label:'시술' },
  { id:'prepaid', label:'정액권' },
  { id:'ticket', label:'티켓' },
  { id:'product', label:'제품' },
];
const LEDGER_VISITS = [
  { id:'all', label:'전체' },
  { id:'fresh', label:'신규' },
  { id:'returning', label:'기존' },
];
const LEDGER_PAYS = [
  { id:'all', label:'전체' },
  { id:'card', label:'카드' },
  { id:'cash', label:'현금' },
  { id:'naver', label:'네이버' },
  { id:'mix', label:'현금+카드' },
];
const LEDGER_PAY_LABEL = { card:'카드', cash:'현금', naver:'네이버', mix:'현금+카드' };
const LEDGER_KIND_LABEL = { service:'시술', prepaid:'정액권', ticket:'티켓', product:'제품' };

function ledgerShift(iso, delta) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d + delta);
  const p = (n) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}`;
}
function ledgerMonth(iso, delta) {
  const [y, m] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1 + delta, 1);
  const p = (n) => String(n).padStart(2, '0');
  const last = new Date(dt.getFullYear(), dt.getMonth() + 1, 0).getDate();
  const from = `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-01`;
  const to = `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(last)}`;
  return { from, to };
}
function ledgerWon(n) {
  return new Intl.NumberFormat('ko-KR').format(n || 0);
}

function C_SalesLedgerPage() {
  const month = ledgerMonth(LEDGER_TODAY, 0);
  const [from, setFrom] = React.useState(month.from);
  const [to, setTo] = React.useState(month.to);
  const [kind, setKind] = React.useState('all');
  const [visit, setVisit] = React.useState('all');
  const [pay, setPay] = React.useState('all');
  const [designer, setDesigner] = React.useState('all');

  const applyRange = (a, b) => { setFrom(a); setTo(b); };
  const reset = () => {
    applyRange(month.from, month.to);
    setKind('all'); setVisit('all'); setPay('all'); setDesigner('all');
  };

  const rows = LEDGER_ROWS.filter(r => {
    if (r.date < from || r.date > to) return false;
    if (kind !== 'all' && r.kind !== kind) return false;
    if (visit !== 'all' && r.visit !== visit) return false;
    if (pay !== 'all' && r.pay !== pay) return false;
    if (designer !== 'all' && r.designerId !== designer) return false;
    return true;
  }).slice().sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1));

  const sum = rows.reduce((a, r) => {
    a.amount += r.amount;
    a.discount += r.discount;
    a.count += 1;
    if (r.pay === 'card' || r.pay === 'cash' || r.pay === 'naver') a[r.pay] += r.amount;
    if (r.pay === 'mix') a.mix += r.amount;
    return a;
  }, { amount:0, discount:0, count:0, card:0, cash:0, naver:0, mix:0 });

  const designers = DESIGNERS.filter(d => LEDGER_ROWS.some(r => r.designerId === d.id));

  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden', background:C_BG}}>
      <div style={{width:948, flexShrink:0, flex:1, display:'flex', flexDirection:'column', minHeight:0}}>
        <div style={{padding:'14px 20px 0', flexShrink:0}}>
          <div style={{fontSize:12, color:C_MUTED, marginBottom:8}}>
            홈 <span style={{margin:'0 6px'}}>›</span> 분석 <span style={{margin:'0 6px'}}>›</span>
            <span style={{color:C_INK, fontWeight:700}}>매출내역</span>
          </div>
          <div style={{fontSize:18, fontWeight:800, color:C_INK, letterSpacing:'-0.02em'}}>매출내역</div>
          <div style={{fontSize:12, color:C_MUTED, marginTop:3}}>기간 안의 결제 건을 고객·담당·결제수단으로 찾습니다.</div>
        </div>

        <div style={{flex:1, overflow:'auto', padding:'14px 20px 24px'}}>
          <div style={{background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:12, padding:'12px 14px', marginBottom:12}}>
            <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
              <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={ledgerDate}/>
              <span style={{color:C_MUTED, fontSize:12}}>~</span>
              <input type="date" value={to} onChange={e => setTo(e.target.value)} style={ledgerDate}/>
              {[
                { label:'오늘', range:[LEDGER_TODAY, LEDGER_TODAY] },
                { label:'어제', range:[ledgerShift(LEDGER_TODAY, -1), ledgerShift(LEDGER_TODAY, -1)] },
                { label:'이번달', range:[month.from, month.to] },
                { label:'지난달', range:[ledgerMonth(LEDGER_TODAY, -1).from, ledgerMonth(LEDGER_TODAY, -1).to] },
              ].map(b => (
                <button key={b.label} onClick={() => applyRange(b.range[0], b.range[1])} style={c_ghostBtnSm}>{b.label}</button>
              ))}
              <div style={{flex:1}}/>
              <button onClick={reset} style={c_ghostBtnSm}>초기화</button>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:8, marginTop:12}}>
              <LedgerChips label="구분" value={kind} options={LEDGER_KINDS} onChange={setKind}/>
              <LedgerChips label="방문" value={visit} options={LEDGER_VISITS} onChange={setVisit}/>
              <LedgerChips label="결제" value={pay} options={LEDGER_PAYS} onChange={setPay}/>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:8, marginTop:12}}>
              <span style={{fontSize:11.5, fontWeight:700, color:C_MUTED, width:36}}>담당</span>
              <select value={designer} onChange={e => setDesigner(e.target.value)} style={{...ledgerDate, width:140}}>
                <option value="all">전체</option>
                {designers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1.3fr 0.7fr 1fr 1fr 1fr', gap:10, marginBottom:12}}>
            {[
              { label:'결제액', value:`₩ ${ledgerWon(sum.amount)}`, sub:`${sum.count}건` },
              { label:'건수', value:`${sum.count}건`, sub: sum.discount ? `할인 ${ledgerWon(sum.discount)}` : '할인 없음' },
              { label:'카드', value:`₩ ${ledgerWon(sum.card)}`, sub:'카드 결제' },
              { label:'현금', value:`₩ ${ledgerWon(sum.cash)}`, sub:'현금 결제' },
              { label:'네이버', value:`₩ ${ledgerWon(sum.naver)}`, sub: sum.mix ? `현금+카드 ${ledgerWon(sum.mix)}` : '네이버 결제' },
            ].map(k => (
              <div key={k.label} style={{background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:10, padding:'12px 14px'}}>
                <div style={{fontSize:11.5, color:C_MUTED, fontWeight:600}}>{k.label}</div>
                <div style={{fontSize:18, fontWeight:800, color:C_INK, marginTop:4, letterSpacing:'-0.02em', fontVariantNumeric:'tabular-nums'}}>{k.value}</div>
                <div style={{fontSize:11, color:C_MUTED, marginTop:3}}>{k.sub}</div>
              </div>
            ))}
          </div>

          <div style={{background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:12, overflow:'hidden'}}>
            <table style={{width:'100%', borderCollapse:'collapse', fontSize:12, fontVariantNumeric:'tabular-nums'}}>
              <thead>
                <tr style={{background:'#FBFCFE', color:C_MUTED, fontSize:11}}>
                  {['일시','고객','구분','메뉴','담당','판매가','할인','결제액','결제'].map(h => (
                    <th key={h} style={{padding:'8px 10px', fontWeight:700, textAlign: ['판매가','할인','결제액'].includes(h) ? 'right' : 'left', borderBottom:`1px solid ${C_BORDER}`, whiteSpace:'nowrap'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={9} style={{padding:'36px 12px', textAlign:'center', color:C_MUTED, fontSize:13}}>이 조건에 해당하는 매출이 없어요.</td></tr>
                )}
                {rows.map((r, i) => (
                  <tr key={i} style={{borderTop:`1px solid ${C_BORDER}`}}>
                    <td style={ledgerTd}>{r.date.slice(5).replace('-', '.')} {r.time}</td>
                    <td style={ledgerTd}>
                      <button onClick={() => window.__openSales && window.__openSales({
                        customer:r.customer, menu:r.menu, designer:r.designerId, amount:r.amount, pay:r.pay, detail:true, key:Date.now(),
                      })} style={{border:'none', background:'none', padding:0, color:C_BLUE, fontWeight:700, cursor:'pointer', fontFamily:'inherit', fontSize:12}}>{r.customer}</button>
                    </td>
                    <td style={ledgerTd}>{LEDGER_KIND_LABEL[r.kind]}</td>
                    <td style={{...ledgerTd, fontWeight:700, color:C_INK}}>{r.menu}</td>
                    <td style={ledgerTd}>{r.designer}</td>
                    <td style={{...ledgerTd, textAlign:'right'}}>{ledgerWon(r.list)}</td>
                    <td style={{...ledgerTd, textAlign:'right', color: r.discount ? '#DC2626' : '#CBD5E1'}}>{r.discount ? '-'+ledgerWon(r.discount) : '0'}</td>
                    <td style={{...ledgerTd, textAlign:'right', fontWeight:800, color:C_INK}}>{ledgerWon(r.amount)}</td>
                    <td style={ledgerTd}>{LEDGER_PAY_LABEL[r.pay]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function LedgerChips({ label, value, options, onChange }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:6, flexWrap:'wrap'}}>
      <span style={{fontSize:11.5, fontWeight:700, color:C_MUTED, width:36}}>{label}</span>
      {options.map(o => {
        const on = value === o.id;
        return (
          <button key={o.id} onClick={() => onChange(o.id)} style={{
            height:26, padding:'0 10px', borderRadius:13, cursor:'pointer', fontFamily:'inherit',
            border:`1px solid ${on ? C_BLUE : C_BORDER}`, background: on ? C_BLUE_SOFT : C_SURFACE,
            color: on ? C_BLUE : C_INK, fontSize:12, fontWeight: on ? 800 : 600,
          }}>{o.label}</button>
        );
      })}
    </div>
  );
}

const ledgerDate = {
  height:30, padding:'0 8px', border:`1px solid ${C_BORDER}`, borderRadius:8,
  fontSize:12, fontFamily:'inherit', color:C_INK, background:C_SURFACE, outline:'none',
};
const ledgerTd = { padding:'8px 10px', color:C_INK, whiteSpace:'nowrap' };

window.C_SalesLedgerPage = C_SalesLedgerPage;
