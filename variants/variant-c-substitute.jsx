// 스케줄 › 담당자 대체현황
// 정액권·티켓 시술. 판매 정산이면 판매자가 시술자에게 비율만큼 넘긴다.

const {
  C_BLUE, C_BLUE_SOFT, C_INK, C_MUTED, C_BORDER, C_BG, C_SURFACE,
  c_ghostBtnSm,
} = window;

const SUB_TODAY = '2026-09-21';
const SUB_THIS_FROM = '2026-09-01';
const SUB_THIS_TO = '2026-09-30';
const SUB_PREV_FROM = '2026-08-01';
const SUB_PREV_TO = '2026-08-31';

const SUB_SEED = [
  { id:1,  date:'2026-09-21', time:'10:00', customer:'박서연', menu:'루트터치업',  kind:'prepaid', voucher:'정액권 30만원', amount:70000,  seller:'문지윤', performer:'문지윤', done:false, give:0, pct:null },
  { id:2,  date:'2026-09-21', time:'11:30', customer:'강수현', menu:'헤어스파',    kind:'prepaid', voucher:'정액권 30만원', amount:70000,  seller:'문지윤', performer:'이상현', done:false, give:0, pct:null },
  { id:3,  date:'2026-09-21', time:'13:00', customer:'유서진', menu:'디지털펌',    kind:'ticket',  voucher:'염색 5회권',   amount:90000,  seller:'한지영', performer:'송미란', done:false, give:0, pct:null },
  { id:4,  date:'2026-09-21', time:'15:00', customer:'한지민', menu:'전체염색',    kind:'ticket',  voucher:'염색 5회권',   amount:130000, seller:'정명희', performer:'정명희', done:false, give:0, pct:null },
  { id:5,  date:'2026-09-21', time:'16:30', customer:'이하늘', menu:'뿌리염색',    kind:'ticket',  voucher:'뿌리염색권',   amount:90000,  seller:'이상현', performer:'문지윤', done:false, give:0, pct:null },
  { id:6,  date:'2026-09-20', time:'14:00', customer:'장하윤', menu:'클리닉',      kind:'prepaid', voucher:'정액권 30만원', amount:80000,  seller:'박소현', performer:'박소현', done:false, give:0, pct:null },
  { id:7,  date:'2026-09-19', time:'14:30', customer:'고은비', menu:'전체염색',    kind:'prepaid', voucher:'정액권 50만원', amount:130000, seller:'송미란', performer:'최유나', done:false, give:0, pct:null },
  { id:8,  date:'2026-09-18', time:'10:30', customer:'이수아', menu:'커트',        kind:'ticket',  voucher:'스파 10회권',  amount:25000,  seller:'박소현', performer:'김지유', done:false, give:0, pct:null },
  { id:9,  date:'2026-09-17', time:'17:00', customer:'윤지원', menu:'드라이',      kind:'prepaid', voucher:'정액권 10만원', amount:15000,  seller:'김지유', performer:'김지유', done:false, give:0, pct:null },
  { id:10, date:'2026-09-16', time:'12:00', customer:'오세훈', menu:'남성컷',      kind:'ticket',  voucher:'컷 5회권',     amount:20000,  seller:'이현진', performer:'윤재훈', done:false, give:0, pct:null },
  { id:11, date:'2026-09-12', time:'15:30', customer:'임서영', menu:'컷 + 클리닉', kind:'prepaid', voucher:'정액권 30만원', amount:80000,  seller:'송미란', performer:'송미란', done:false, give:0, pct:null },
  { id:12, date:'2026-09-11', time:'11:00', customer:'김보경', menu:'헤어스파',    kind:'prepaid', voucher:'정액권 30만원', amount:70000,  seller:'문지윤', performer:'강태원', done:true,  give:70000, pct:100 },
  { id:17, date:'2026-09-11', time:'16:00', customer:'서다은', menu:'클리닉',      kind:'prepaid', voucher:'정액권 30만원', amount:80000,  seller:'이상현', performer:'문지윤', done:true,  give:80000, pct:100 },
  { id:13, date:'2026-08-22', time:'11:00', customer:'서지우', menu:'전체염색',    kind:'prepaid', voucher:'정액권 50만원', amount:130000, seller:'송미란', performer:'최유나', done:false, give:0, pct:null },
  { id:14, date:'2026-08-18', time:'15:00', customer:'배지영', menu:'헤어스파',    kind:'ticket',  voucher:'스파 10회권',  amount:60000,  seller:'박소현', performer:'박소현', done:false, give:0, pct:null },
  { id:15, date:'2026-08-12', time:'13:30', customer:'홍지수', menu:'디지털펌',    kind:'prepaid', voucher:'정액권 100만원', amount:180000, seller:'한지영', performer:'문지윤', done:true,  give:180000, pct:100 },
  { id:16, date:'2026-08-04', time:'10:30', customer:'나예지', menu:'커트',        kind:'ticket',  voucher:'컷 5회권',     amount:20000,  seller:'김지유', performer:'김지유', done:false, give:0, pct:null },
];

window.SUB_HANDOFF = {
  pct: '100',
  settle: 'sale', // sale: 판매시 판매자 정산 / use: 소진시 시술자 정산
  rows: SUB_SEED.map(r => ({ ...r })),
  listeners: new Set(),
};
function subNotify() {
  window.SUB_HANDOFF.listeners.forEach(fn => fn());
}
function useSubHandoff() {
  const [, setN] = React.useState(0);
  React.useEffect(() => {
    const fn = () => setN(n => n + 1);
    window.SUB_HANDOFF.listeners.add(fn);
    return () => window.SUB_HANDOFF.listeners.delete(fn);
  }, []);
  return window.SUB_HANDOFF;
}
window.useSubHandoff = useSubHandoff;

function subWon(n) {
  return new Intl.NumberFormat('ko-KR').format(n || 0);
}
function subDiff(r) { return r.seller !== r.performer; }
function subTarget(r, settle) { return settle === 'use' || subDiff(r); }
function subRate(pct) {
  const n = Number(String(pct ?? '').replace(/[^0-9]/g, ''));
  if (!n) return 0;
  return Math.min(100, n);
}
function subGive(r, rate, settle) {
  if (!subTarget(r, settle)) return 0;
  if (settle === 'use') return r.amount;
  if (r.done) return r.give;
  return Math.round(r.amount * rate / 100);
}
function subDay(iso) {
  const parts = String(iso || '').split('-');
  return parts.length === 3 ? `${parts[1]}.${parts[2]}` : iso;
}

function C_StaffSubPage() {
  const handoff = useSubHandoff();
  const pct = handoff.pct;
  const rows = handoff.rows;
  const setPct = (v) => { handoff.pct = typeof v === 'function' ? v(handoff.pct) : v; subNotify(); };
  const setRows = (updater) => {
    handoff.rows = typeof updater === 'function' ? updater(handoff.rows) : updater;
    subNotify();
  };
  const [filter, setFilter] = React.useState('all');
  const [from, setFrom] = React.useState(SUB_TODAY);
  const [to, setTo] = React.useState(SUB_TODAY);
  const [applied, setApplied] = React.useState({ from: SUB_TODAY, to: SUB_TODAY });
  const [dateError, setDateError] = React.useState('');
  const [selected, setSelected] = React.useState(() => new Set());
  const rate = subRate(pct);
  const settle = handoff.settle || 'sale';
  const isTarget = (r) => subTarget(r, settle);

  const inRange = rows.filter(r => r.date >= applied.from && r.date <= applied.to);
  const shown = inRange.filter(r => {
    if (filter === 'diff') return isTarget(r);
    if (filter === 'same') return !subDiff(r);
    if (filter === 'done') return r.done;
    return true;
  });
  const selectable = shown.filter(isTarget);
  const selectedShown = selectable.filter(r => selected.has(r.id));
  const allOn = selectable.length > 0 && selectedShown.length === selectable.length;
  const mixed = selectedShown.length > 0 && !allOn;
  const pendingSelected = selectedShown.filter(r => !r.done);

  const enterRows = (ids) => {
    const set = ids instanceof Set ? ids : new Set(ids);
    setRows(list => list.map(r => (set.has(r.id) && isTarget(r) && !r.done)
      ? { ...r, done:true, give: settle === 'use' ? r.amount : Math.round(r.amount * rate / 100), pct: settle === 'use' ? 100 : rate }
      : r));
    setSelected(new Set());
  };
  const undo = (id) => {
    setRows(list => list.map(r => r.id === id ? { ...r, done:false, give:0, pct:null } : r));
  };
  const toggleOne = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    setSelected(prev => {
      const next = new Set(prev);
      if (allOn) selectable.forEach(r => next.delete(r.id));
      else selectable.forEach(r => next.add(r.id));
      return next;
    });
  };

  const search = (nextFrom, nextTo) => {
    const a = nextFrom ?? from;
    const b = nextTo ?? to;
    if (!a || !b) { setDateError('시작일과 종료일을 정해 주세요.'); return; }
    if (a > b) { setDateError('시작일이 종료일보다 늦어요.'); return; }
    setFrom(a);
    setTo(b);
    setApplied({ from: a, to: b });
    setDateError('');
    setSelected(new Set());
  };
  const goToday = () => search(SUB_TODAY, SUB_TODAY);

  const diffN = inRange.filter(isTarget).length;
  const doneN = inRange.filter(r => r.done).length;
  const pendingN = inRange.filter(r => isTarget(r) && !r.done).length;
  const giveSum = inRange.reduce((s, r) => s + (r.done ? r.give : 0), 0);

  const kpis = [
    { label:'정액권 · 티켓', value:`${inRange.length}건`, sub:'이 기간 시술', color:C_BLUE },
    { label:'대체 대상 시술', value:`${diffN}건`, sub: settle === 'use' ? '정액권·티켓 전체' : '판매자 ≠ 시술자', color:'#C2410C' },
    { label:'대체 입력', value:`${doneN}건`, sub:`미입력 ${pendingN}건`, color:'#047857' },
    { label:'양도 합계', value:`${subWon(giveSum)}원`, sub:'입력된 금액', color:'#6D28D9' },
  ];

  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden', background:C_BG}}>
      <div style={{width:948, flexShrink:0, flex:1, display:'flex', flexDirection:'column', minHeight:0}}>
        <div style={{display:'flex', alignItems:'center', gap:8, padding:'10px 14px', background:C_SURFACE, borderBottom:`1px solid ${C_BORDER}`}}>
          <div style={{fontSize:12.5, color:C_MUTED, flexShrink:0}}>
            홈 <span style={{margin:'0 6px'}}>›</span>스케줄<span style={{margin:'0 6px'}}>›</span>
            <span style={{color:C_INK, fontWeight:600}}>담당자 대체현황</span>
          </div>
        </div>

        <div style={{flex:1, overflow:'auto', padding:'16px 20px 24px', display:'flex', flexDirection:'column', gap:12}}>
          <C_SettlePicker/>

          <div style={{background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:12, padding:'12px 14px', display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
            {[
              { id:'today', label:'오늘', from:SUB_TODAY, to:SUB_TODAY },
              { id:'month', label:'이번달', from:SUB_THIS_FROM, to:SUB_THIS_TO },
              { id:'prev', label:'지난달', from:SUB_PREV_FROM, to:SUB_PREV_TO },
            ].map(q => {
              const on = applied.from === q.from && applied.to === q.to;
              return (
                <button key={q.id} onClick={() => search(q.from, q.to)} style={{
                  height:34, padding:'0 12px', borderRadius:8, cursor:'pointer', fontFamily:'inherit',
                  border:`1px solid ${on ? C_BLUE : C_BORDER}`,
                  background: on ? C_BLUE_SOFT : C_SURFACE,
                  color: on ? C_BLUE : C_INK,
                  fontSize:12.5, fontWeight:700,
                }}>{q.label}</button>
              );
            })}
            <input type="date" value={from} onChange={e => { setFrom(e.target.value); setDateError(''); }} style={subDate}/>
            <span style={{color:C_MUTED, fontSize:13}}>~</span>
            <input type="date" value={to} onChange={e => { setTo(e.target.value); setDateError(''); }} style={subDate}/>
            <button onClick={() => search()} style={{
              height:34, padding:'0 14px', border:'none', borderRadius:8, cursor:'pointer', fontFamily:'inherit',
              background:C_BLUE, color:'#fff', fontSize:12.5, fontWeight:700,
            }}>검색</button>
            {dateError && <span style={{fontSize:12, color:'#DC2626', fontWeight:600}}>{dateError}</span>}
          </div>

          <div style={{background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:12, padding:'14px 16px', display:'flex', alignItems:'center', gap:16}}>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:13.5, fontWeight:700, color:C_INK}}>양도 비율 · 전체 설정</div>
              <div style={{fontSize:12.5, color:C_MUTED, marginTop:4, lineHeight:1.5}}>
                {settle === 'use'
                  ? '소진 정산은 소진액 전체가 시술자 매출이에요. 비율은 판매 정산일 때만 써요.'
                  : '판매자와 시술자가 다를 때, 시술 금액의 이 비율을 판매자에게 넘겨요.'}
              </div>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:6, flexShrink:0}}>
              <input
                value={pct}
                disabled={settle === 'use'}
                onChange={e => setPct(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
                onBlur={() => setPct(String(rate))}
                style={{
                  width:64, height:36, padding:'0 10px', textAlign:'right',
                  border:`1px solid ${C_BORDER}`, borderRadius:8, fontSize:15, fontWeight:700,
                  color:C_INK, background:C_SURFACE, fontFamily:'inherit', outline:'none',
                  fontVariantNumeric:'tabular-nums', opacity: settle === 'use' ? 0.4 : 1,
                }}
              />
              <span style={{fontSize:14, fontWeight:700, color:C_INK}}>%</span>
            </div>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:10}}>
            {kpis.map(k => (
              <div key={k.label} style={{background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:10, padding:'12px 14px'}}>
                <div style={{fontSize:11.5, color:C_MUTED, fontWeight:600}}>{k.label}</div>
                <div style={{fontSize:18, fontWeight:800, color:k.color, marginTop:6, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em'}}>{k.value}</div>
                <div style={{fontSize:11, color:C_MUTED, marginTop:4}}>{k.sub}</div>
              </div>
            ))}
          </div>

          <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
            {[
              { id:'all', label:`전체 ${inRange.length}` },
              { id:'diff', label:`대체 대상 시술 ${diffN}` },
              { id:'same', label:`본인 시술 ${inRange.filter(r => !subDiff(r)).length}` },
              { id:'done', label:`입력됨 ${doneN}` },
            ].map(f => (
              <button key={f.id} onClick={() => { setFilter(f.id); setSelected(new Set()); }} style={{
                height:30, padding:'0 12px', borderRadius:15, cursor:'pointer', fontFamily:'inherit',
                border:`1px solid ${filter === f.id ? C_BLUE : C_BORDER}`,
                background: filter === f.id ? C_BLUE_SOFT : C_SURFACE,
                color: filter === f.id ? C_BLUE : C_MUTED,
                fontSize:12, fontWeight:700,
              }}>{f.label}</button>
            ))}
            <div style={{flex:1}}/>
            {pendingSelected.length > 0 && (
              <button onClick={() => enterRows(selected)} style={{
                height:30, padding:'0 12px', border:'none', borderRadius:8, cursor:'pointer', fontFamily:'inherit',
                background:C_BLUE, color:'#fff', fontSize:12, fontWeight:700,
              }}>선택 {pendingSelected.length}건 대체</button>
            )}
          </div>

          <div style={{background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:12, overflow:'auto'}}>
            <table style={{width:'100%', borderCollapse:'collapse', tableLayout:'fixed'}}>
              <colgroup>
                <col style={{width:36}}/>
                <col style={{width:58}}/>
                <col style={{width:196}}/>
                <col style={{width:84}}/>
                <col style={{width:76}}/>
                <col style={{width:76}}/>
                <col style={{width:72}}/>
                <col style={{width:84}}/>
                <col/>
              </colgroup>
              <thead>
                <tr style={{background:'#FBFCFE', borderBottom:`1px solid ${C_BORDER}`}}>
                  <th style={subTh}><SubCheck on={allOn} mixed={mixed} disabled={selectable.length === 0} onClick={toggleAll}/></th>
                  <th style={subThL}>일시</th>
                  <th style={subThL}>고객 · 시술</th>
                  <th style={subThR}>사용금액</th>
                  <th style={subThL}>판매자</th>
                  <th style={subThL}>시술자</th>
                  <th style={subThR}>양도</th>
                  <th style={subThR}/>
                  <th style={subTh}/>
                </tr>
              </thead>
              <tbody>
                {shown.length === 0 && (
                  <tr><td colSpan={9} style={{padding:'36px 16px', textAlign:'center', fontSize:13, color:C_MUTED}}>이 기간에 정액권·티켓 시술이 없어요.</td></tr>
                )}
                {shown.map(r => {
                  const target = isTarget(r);
                  const give = subGive(r, rate, settle);
                  const bg = r.done ? '#F0FDF4' : target ? '#FFF8F1' : C_SURFACE;
                  const edge = target ? (r.done ? '#059669' : '#F59E0B') : 'transparent';
                  return (
                    <tr key={r.id} style={{background:bg, borderTop:'1px solid #EFF2F7'}}>
                      <td style={{...subTd, textAlign:'center', borderLeft:`3px solid ${edge}`}}>
                        {target ? <SubCheck on={selected.has(r.id)} onClick={() => toggleOne(r.id)}/> : null}
                      </td>
                      <td style={{...subTdL, fontVariantNumeric:'tabular-nums', lineHeight:1.35}}>
                        <div style={{fontWeight:700}}>{subDay(r.date)}</div>
                        <div style={{color:C_MUTED}}>{r.time}</div>
                      </td>
                      <td style={subTdL}>
                        <div style={{fontSize:13, fontWeight:700, color:C_INK, whiteSpace:'nowrap'}}>{r.customer} · {r.menu}</div>
                        <div style={{display:'flex', alignItems:'center', gap:6, marginTop:3}}>
                          <SubKind kind={r.kind}/>
                          <span style={{fontSize:11.5, color:C_MUTED, whiteSpace:'nowrap'}}>{r.voucher}</span>
                        </div>
                      </td>
                      <td style={{...subTdR, fontWeight:700, fontVariantNumeric:'tabular-nums'}}>{subWon(r.amount)}</td>
                      <td style={subTdL}><SubPerson name={r.seller} hot={target} tone="seller"/></td>
                      <td style={subTdL}><SubPerson name={r.performer} hot={target} tone="performer"/></td>
                      <td style={subTdR}>
                        {target ? (
                          <>
                            <div style={{fontWeight:800, color: r.done ? '#047857' : '#C2410C', fontVariantNumeric:'tabular-nums'}}>{subWon(give)}</div>
                            <div style={{fontSize:11, color:C_MUTED, marginTop:1}}>{settle === 'use' ? '소진액' : (r.done ? `${r.pct}%` : `${rate}%`)}</div>
                          </>
                        ) : (
                          <span style={{color:'#94A3B8'}}>—</span>
                        )}
                      </td>
                      <td style={subTdR}>
                        {!target && <span style={{fontSize:11.5, color:C_MUTED, fontWeight:600}}>본인 시술</span>}
                        {target && !r.done && (
                          <button onClick={() => enterRows([r.id])} style={{
                            height:28, padding:'0 10px', border:'none', borderRadius:6, cursor:'pointer', fontFamily:'inherit',
                            background:'#C2410C', color:'#fff', fontSize:12, fontWeight:700, whiteSpace:'nowrap',
                          }}>대체 입력</button>
                        )}
                        {target && r.done && (
                          <button onClick={() => undo(r.id)} style={{...c_ghostBtnSm, fontFamily:'inherit', color:'#047857', borderColor:'#A7F3D0', background:'#fff'}}>취소</button>
                        )}
                      </td>
                      <td style={subTd}/>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function C_SettlePicker() {
  const handoff = useSubHandoff();
  const mode = handoff.settle || 'sale';
  const pick = (id) => { handoff.settle = id; subNotify(); };
  const options = [
    { id:'sale', title:'정액권 판매시 판매자에게 정산', desc:'소진 건은 일일마감에 0원. 판매자와 시술자가 다를 때만 대체해요.' },
    { id:'use', title:'정액권 소진시 시술자에게 정산', desc:'정액권·티켓 시술 전체가 대체 대상. 소진액이 시술자 매출로 잡혀요.' },
  ];
  return (
    <div style={{background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:12, padding:'14px 16px'}}>
      <div style={{fontSize:13.5, fontWeight:800, color:C_INK, marginBottom:10}}>우리 매장 정산 방식</div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
        {options.map(op => {
          const on = mode === op.id;
          return (
            <button key={op.id} onClick={() => pick(op.id)} style={{
              textAlign:'left', padding:'12px 14px', borderRadius:10, cursor:'pointer', fontFamily:'inherit',
              border:`1.5px solid ${on ? C_BLUE : C_BORDER}`,
              background: on ? C_BLUE_SOFT : C_SURFACE,
              boxShadow: on ? '0 0 0 1px rgba(30,64,175,0.15)' : 'none',
            }}>
              <div style={{fontSize:13, fontWeight:800, color: on ? C_BLUE : C_INK, lineHeight:1.4}}>{op.title}</div>
              <div style={{fontSize:12, color:C_MUTED, marginTop:4, lineHeight:1.45}}>{op.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
window.C_SettlePicker = C_SettlePicker;

function SubCheck({ on, mixed, disabled, onClick }) {
  const active = on || mixed;
  return (
    <span onClick={disabled ? undefined : onClick} style={{
      width:16, height:16, borderRadius:4, flexShrink:0,
      border:`1.5px solid ${active ? C_BLUE : '#C3CCDA'}`,
      background: active ? C_BLUE : C_SURFACE,
      display:'inline-flex', alignItems:'center', justifyContent:'center', color:'#fff',
      cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.35 : 1,
    }}>
      {on && <IconCheck size={11} stroke={3}/>}
      {!on && mixed && <span style={{width:8, height:2, background:'#fff', borderRadius:1}}/>}
    </span>
  );
}

function SubKind({ kind }) {
  const ticket = kind === 'ticket';
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', height:18, padding:'0 6px', borderRadius:9,
      fontSize:10.5, fontWeight:800, flexShrink:0,
      background: ticket ? '#ECFEFF' : '#F3EEFF',
      color: ticket ? '#0E7490' : '#6D28D9',
    }}>{ticket ? '티켓' : '정액권'}</span>
  );
}

function SubPerson({ name, hot, tone }) {
  const seller = tone === 'seller';
  return (
    <span style={{
      display:'inline-block', height:22, lineHeight:'22px', padding:'0 6px', marginLeft:-6, borderRadius:11,
      fontSize:12.5, fontWeight:700, whiteSpace:'nowrap',
      background: hot ? (seller ? '#F3EEFF' : '#EFF3FC') : 'transparent',
      color: hot ? (seller ? '#6D28D9' : C_BLUE) : C_INK,
    }}>{name}</span>
  );
}

const subTh = {
  padding:'10px 0', fontSize:11, fontWeight:700, color:C_MUTED, textAlign:'center', verticalAlign:'middle',
};
const subThL = { ...subTh, textAlign:'left', paddingLeft:8, paddingRight:8 };
const subThR = { ...subTh, textAlign:'right', paddingLeft:8, paddingRight:8 };
const subTd = {
  padding:'11px 0', fontSize:12.5, color:C_INK, verticalAlign:'middle', textAlign:'left',
};
const subTdL = { ...subTd, textAlign:'left', paddingLeft:8, paddingRight:8 };
const subTdR = { ...subTd, textAlign:'right', paddingLeft:8, paddingRight:8 };

const subDate = {
  height:34, padding:'0 8px', border:`1px solid ${C_BORDER}`, borderRadius:8,
  fontSize:12.5, color:C_INK, background:C_SURFACE, fontFamily:'inherit', outline:'none',
};

window.C_StaffSubPage = C_StaffSubPage;
