// 분석 › 고객 분석 — 등록 고객의 방문 횟수, 최근 방문, 누적 결제
const {
  C_BLUE, C_BLUE_SOFT, C_INK, C_MUTED, C_BORDER, C_BG, C_SURFACE,
} = window;

const CA_TODAY = '2026.09.21';
const CA_GRADES = [
  { id:'일반', rule:'70만 미만', color:'#64748B', bg:'#F1F5F9' },
  { id:'VIP', rule:'70만 이상', color:'#1E40AF', bg:'#EFF3FC' },
  { id:'VVIP', rule:'180만 이상', color:'#B45309', bg:'#FFFBEB' },
];
const CA_REC = [
  { id:'d30', name:'30일 이내', test:c => c.lastDays <= 30 },
  { id:'d90', name:'31–90일', test:c => c.lastDays > 30 && c.lastDays <= 90 },
  { id:'d180', name:'91–180일', test:c => c.lastDays > 90 && c.lastDays <= 180 },
  { id:'old', name:'180일 넘음', test:c => c.lastDays > 180 },
];
const CA_FREQ = [
  { id:'once', name:'첫 방문', test:c => c.visits === 1 },
  { id:'few', name:'2–4회', test:c => c.visits >= 2 && c.visits <= 4 },
  { id:'mid', name:'5–9회', test:c => c.visits >= 5 && c.visits <= 9 },
  { id:'loyal', name:'10회 이상', test:c => c.visits >= 10 },
];

function caPct(a, b) { return b ? Math.round((a / b) * 1000) / 10 : 0; }
function caWon(n) { return new Intl.NumberFormat('ko-KR').format(Math.round(n || 0)); }
function caDes(id) {
  return (window.DESIGNERS || []).find(d => d.id === id) || { id, name:id === 'unassigned' ? '미지정' : id, role:'', color:'#94A3B8' };
}
function caTicket(c) { return c.visits ? Math.round(c.totalPaid / c.visits) : 0; }
function caPack(rows) {
  const pay = rows.reduce((a, c) => a + c.totalPaid, 0);
  const visits = rows.reduce((a, c) => a + c.visits, 0);
  return {
    n: rows.length,
    pay,
    visits,
    ticket: visits ? Math.round(pay / visits) : 0,
    d30: rows.filter(c => c.lastDays <= 30).length,
    old: rows.filter(c => c.lastDays > 180).length,
    loyal: rows.filter(c => c.visits >= 10).length,
  };
}

function C_CustomerPage() {
  const [designer, setDesigner] = React.useState('all');
  const [grade, setGrade] = React.useState('all');
  const [rec, setRec] = React.useState('all');
  const [freq, setFreq] = React.useState('all');
  const [topOn, setTopOn] = React.useState(false);
  const [shown, setShown] = React.useState(40);
  const people = React.useMemo(() => (window.MKT_CUSTOMERS || []).slice(), []);
  const book = designer === 'all' ? people : people.filter(c => c.designer === designer);
  const pack = caPack(book);
  const allPack = caPack(people);
  const ranked = book.slice().sort((a, b) => b.totalPaid - a.totalPaid);
  const topN = Math.max(1, Math.ceil(book.length * 0.1));
  const topIds = new Set(ranked.slice(0, topN).map(c => c.id));
  const topPay = ranked.slice(0, topN).reduce((a, c) => a + c.totalPaid, 0);
  const topShare = caPct(topPay, pack.pay);

  const desRows = React.useMemo(() => {
    const map = {};
    people.forEach(c => {
      if (!map[c.designer]) map[c.designer] = [];
      map[c.designer].push(c);
    });
    return Object.keys(map).map(id => ({ des:caDes(id), ...caPack(map[id]) })).sort((a, b) => b.n - a.n);
  }, [people]);

  const list = book.filter(c => {
    if (grade !== 'all' && c.grade !== grade) return false;
    if (rec !== 'all' && !CA_REC.find(r => r.id === rec).test(c)) return false;
    if (freq !== 'all' && !CA_FREQ.find(f => f.id === freq).test(c)) return false;
    if (topOn && !topIds.has(c.id)) return false;
    return true;
  }).sort((a, b) => b.totalPaid - a.totalPaid);

  const resetList = () => setShown(40);
  const clearAll = () => { setDesigner('all'); setGrade('all'); setRec('all'); setFreq('all'); setTopOn(false); setShown(40); };
  const chips = [];
  if (designer !== 'all') chips.push({ k:'des', label:caDes(designer).name });
  if (grade !== 'all') chips.push({ k:'grade', label:grade });
  if (rec !== 'all') chips.push({ k:'rec', label:CA_REC.find(r => r.id === rec).name });
  if (freq !== 'all') chips.push({ k:'freq', label:CA_FREQ.find(f => f.id === freq).name });
  if (topOn) chips.push({ k:'top', label:'결제 상위 10%' });

  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden', background:C_BG}}>
      <div style={{width:'100%', flex:1, display:'flex', flexDirection:'column', minWidth:0, minHeight:0}}>
        <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', padding:'10px 14px', background:C_SURFACE, borderBottom:`1px solid ${C_BORDER}`}}>
          <span style={{fontSize:12.5, color:C_MUTED, fontWeight:600}}>기준일</span>
          <div style={caDateBox}>{CA_TODAY}</div>
          <span style={{fontSize:12, color:C_MUTED, fontWeight:600}}>등록 고객</span>
          <div style={{flex:1}}/>
          <select value={designer} onChange={e => { setDesigner(e.target.value); resetList(); }} style={caSelect}>
            <option value="all">전체 담당자</option>
            {desRows.map(d => <option key={d.des.id} value={d.des.id}>{d.des.name}</option>)}
          </select>
        </div>

        <div style={{flex:1, overflow:'auto', padding:'16px 20px 28px'}}>
          <div style={{fontSize:12, color:C_MUTED, marginBottom:12}}>
            홈 <span style={{margin:'0 6px'}}>›</span>
            분석 <span style={{margin:'0 6px'}}>›</span>
            <span style={{color:C_INK, fontWeight:700}}>고객 분석</span>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:10, marginBottom:12}}>
            <CaKpi label="등록 고객" value={`${pack.n.toLocaleString()}명`} sub={`10회 이상 ${pack.loyal.toLocaleString()}명`} on={!topOn && rec === 'all' && grade === 'all' && freq === 'all'} onClick={clearAll}/>
            <CaKpi label="30일 이내" value={`${pack.d30.toLocaleString()}명`} sub={pack.n ? `전체의 ${caPct(pack.d30, pack.n)}%` : '—'} on={rec === 'd30'} onClick={() => { setRec(rec === 'd30' ? 'all' : 'd30'); resetList(); }}/>
            <CaKpi label="180일 넘음" value={`${pack.old.toLocaleString()}명`} sub={pack.n ? `전체의 ${caPct(pack.old, pack.n)}%` : '—'} accent="#DC2626" on={rec === 'old'} onClick={() => { setRec(rec === 'old' ? 'all' : 'old'); resetList(); }}/>
            <CaKpi label="객단가" value={`${caWon(pack.ticket)}원`} sub="누적 결제 ÷ 방문 횟수"/>
            <CaKpi label="결제 상위 10%" value={`${topShare}%`} sub={`${topN.toLocaleString()}명`} accent={C_BLUE} on={topOn} onClick={() => { setTopOn(v => !v); resetList(); }}/>
          </div>

          {chips.length > 0 && (
            <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:12, alignItems:'center'}}>
              {chips.map(c => (
                <button key={c.k} onClick={() => {
                  if (c.k === 'des') setDesigner('all');
                  if (c.k === 'grade') setGrade('all');
                  if (c.k === 'rec') setRec('all');
                  if (c.k === 'freq') setFreq('all');
                  if (c.k === 'top') setTopOn(false);
                  resetList();
                }} style={{...caChip(true), display:'inline-flex', alignItems:'center', gap:4}}>
                  {c.label} <span style={{fontWeight:700}}>×</span>
                </button>
              ))}
              <button onClick={clearAll} style={{border:'none', background:'transparent', color:C_MUTED, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit'}}>전체 해제</button>
            </div>
          )}

          <div style={{display:'grid', gridTemplateColumns:'1.35fr 1fr', gap:12, marginBottom:12, alignItems:'start'}}>
            <CaCard title="담당자별" sub="맡고 있는 고객과 누적 결제">
              <table style={caTable}>
                <thead>
                  <tr>
                    <th style={caThL}>담당자</th>
                    <th style={caTh}>고객</th>
                    <th style={caTh}>30일 이내</th>
                    <th style={caTh}>180일 넘음</th>
                    <th style={caTh}>누적 결제</th>
                    <th style={caTh}>객단가</th>
                  </tr>
                </thead>
                <tbody>
                  <tr onClick={() => { setDesigner('all'); resetList(); }} style={{cursor:'pointer', background: designer === 'all' ? C_BLUE_SOFT : 'transparent'}}>
                    <td style={{...caTdL, fontWeight:700}}>전체</td>
                    <td style={caTd}>{allPack.n.toLocaleString()}</td>
                    <td style={caTd}>{allPack.d30.toLocaleString()}</td>
                    <td style={{...caTd, color:'#DC2626', fontWeight:700}}>{allPack.old.toLocaleString()}</td>
                    <td style={caTd}>{caWon(allPack.pay)}</td>
                    <td style={{...caTd, fontWeight:700}}>{caWon(allPack.ticket)}</td>
                  </tr>
                  {desRows.map(d => (
                    <tr key={d.des.id} onClick={() => { setDesigner(d.des.id); resetList(); }} style={{cursor:'pointer', background: designer === d.des.id ? C_BLUE_SOFT : 'transparent'}}>
                      <td style={caTdL}>
                        <span style={{display:'inline-flex', alignItems:'center', gap:6}}>
                          <span style={{width:3, height:12, borderRadius:2, background:d.des.color}}/>
                          <span style={{fontWeight:700, color:C_INK}}>{d.des.name}</span>
                          <span style={{fontSize:10.5, color:C_MUTED}}>{d.des.role}</span>
                        </span>
                      </td>
                      <td style={caTd}>{d.n.toLocaleString()}</td>
                      <td style={caTd}>{d.d30.toLocaleString()}</td>
                      <td style={{...caTd, color: d.old ? '#DC2626' : '#CBD5E1', fontWeight: d.old ? 700 : 500}}>{d.old.toLocaleString()}</td>
                      <td style={caTd}>{caWon(d.pay)}</td>
                      <td style={{...caTd, fontWeight:700}}>{caWon(d.ticket)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CaCard>

            <div style={{display:'flex', flexDirection:'column', gap:12}}>
              <CaCard title="등급" sub="누적 결제 기준">
                <table style={caTable}>
                  <thead>
                    <tr>
                      <th style={caThL}>등급</th>
                      <th style={caThL}>기준</th>
                      <th style={caTh}>고객</th>
                      <th style={caTh}>결제 비중</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr onClick={() => { setGrade('all'); resetList(); }} style={{cursor:'pointer', background: grade === 'all' ? C_BLUE_SOFT : 'transparent'}}>
                      <td style={{...caTdL, fontWeight:700}}>전체</td>
                      <td style={{...caTdL, color:C_MUTED}}>—</td>
                      <td style={caTd}>{pack.n.toLocaleString()}</td>
                      <td style={caTd}>100%</td>
                    </tr>
                    {CA_GRADES.map(g => {
                      const rows = book.filter(c => c.grade === g.id);
                      const pay = rows.reduce((a, c) => a + c.totalPaid, 0);
                      return (
                        <tr key={g.id} onClick={() => { setGrade(grade === g.id ? 'all' : g.id); resetList(); }} style={{cursor:'pointer', background: grade === g.id ? C_BLUE_SOFT : 'transparent'}}>
                          <td style={caTdL}><span style={{fontWeight:800, color:g.color}}>{g.id}</span></td>
                          <td style={{...caTdL, color:C_MUTED}}>{g.rule}</td>
                          <td style={caTd}>{rows.length.toLocaleString()}</td>
                          <td style={{...caTd, fontWeight:700}}>{caPct(pay, pack.pay)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CaCard>

              <CaCard title="방문 횟수" sub="몇 번 온 고객에게 결제가 몰려 있는지">
                <table style={caTable}>
                  <thead>
                    <tr>
                      <th style={caThL}>구분</th>
                      <th style={caTh}>고객</th>
                      <th style={caTh}>고객 비중</th>
                      <th style={caTh}>결제 비중</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr onClick={() => { setFreq('all'); resetList(); }} style={{cursor:'pointer', background: freq === 'all' ? C_BLUE_SOFT : 'transparent'}}>
                      <td style={{...caTdL, fontWeight:700}}>전체</td>
                      <td style={caTd}>{pack.n.toLocaleString()}</td>
                      <td style={caTd}>100%</td>
                      <td style={caTd}>100%</td>
                    </tr>
                    {CA_FREQ.map(f => {
                      const rows = book.filter(f.test);
                      const pay = rows.reduce((a, c) => a + c.totalPaid, 0);
                      return (
                        <tr key={f.id} onClick={() => { setFreq(freq === f.id ? 'all' : f.id); resetList(); }} style={{cursor:'pointer', background: freq === f.id ? C_BLUE_SOFT : 'transparent'}}>
                          <td style={{...caTdL, fontWeight:700, color:C_INK}}>{f.name}</td>
                          <td style={caTd}>{rows.length.toLocaleString()}</td>
                          <td style={caTd}>{caPct(rows.length, pack.n)}%</td>
                          <td style={{...caTd, fontWeight:700}}>{caPct(pay, pack.pay)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CaCard>
            </div>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:8, marginBottom:12}}>
            {CA_REC.map(r => {
              const n = book.filter(r.test).length;
              const on = rec === r.id;
              return (
                <button key={r.id} onClick={() => { setRec(on ? 'all' : r.id); resetList(); }} style={{
                  textAlign:'left', cursor:'pointer', fontFamily:'inherit',
                  border:`1.5px solid ${on ? C_BLUE : C_BORDER}`, borderRadius:10,
                  background: on ? C_BLUE_SOFT : C_SURFACE, padding:'10px 12px',
                }}>
                  <div style={{fontSize:11.5, color:C_MUTED, fontWeight:700}}>{r.name}</div>
                  <div style={{marginTop:4, fontSize:18, fontWeight:800, color: r.id === 'old' ? '#DC2626' : C_INK, fontVariantNumeric:'tabular-nums'}}>{n.toLocaleString()}<span style={{fontSize:12, fontWeight:700, marginLeft:2}}>명</span></div>
                  <div style={{marginTop:2, fontSize:11, color:C_MUTED}}>{caPct(n, pack.n)}%</div>
                </button>
              );
            })}
          </div>

          <CaCard title="고객" sub={`${list.length.toLocaleString()}명 · 누적 결제 큰 순`}>
            <table style={caTable}>
              <thead>
                <tr>
                  <th style={caThL}>고객</th>
                  <th style={caThL}>등급</th>
                  <th style={caThL}>담당자</th>
                  <th style={caTh}>방문</th>
                  <th style={caTh}>최근 방문</th>
                  <th style={caTh}>누적 결제</th>
                  <th style={caTh}>객단가</th>
                </tr>
              </thead>
              <tbody>
                {list.slice(0, shown).map(c => {
                  const d = caDes(c.designer);
                  const g = CA_GRADES.find(x => x.id === c.grade);
                  return (
                    <tr key={c.id}>
                      <td style={{...caTdL, fontWeight:700, color:C_INK}}>{c.name}</td>
                      <td style={caTdL}><span style={{fontSize:11, fontWeight:800, color:g.color, background:g.bg, borderRadius:99, padding:'2px 7px'}}>{c.grade}</span></td>
                      <td style={caTdL}>{d.name}</td>
                      <td style={caTd}>{c.visits.toLocaleString()}회</td>
                      <td style={{...caTd, color: c.lastDays > 180 ? '#DC2626' : C_INK}}>{c.lastDays}일 전</td>
                      <td style={{...caTd, fontWeight:700}}>{caWon(c.totalPaid)}</td>
                      <td style={caTd}>{caWon(caTicket(c))}</td>
                    </tr>
                  );
                })}
                {list.length === 0 && (
                  <tr><td colSpan={7} style={{...caTdL, color:C_MUTED, padding:'22px 12px'}}>이 조건의 고객이 없습니다.</td></tr>
                )}
              </tbody>
            </table>
            {list.length > shown && (
              <div style={{padding:'10px 14px', borderTop:`1px solid ${C_BORDER}`}}>
                <button onClick={() => setShown(n => n + 40)} style={caGhost}>더 보기 · {list.length - shown}명</button>
              </div>
            )}
          </CaCard>
        </div>
      </div>
    </div>
  );
}

function CaKpi({ label, value, sub, on, onClick, accent }) {
  return (
    <button onClick={onClick} style={{
      textAlign:'left', cursor: onClick ? 'pointer' : 'default', fontFamily:'inherit',
      background: on ? C_BLUE_SOFT : C_SURFACE, border:`1.5px solid ${on ? C_BLUE : C_BORDER}`,
      borderRadius:12, padding:'12px 14px',
    }}>
      <div style={{fontSize:11.5, color:C_MUTED, fontWeight:600}}>{label}</div>
      <div style={{marginTop:6, fontSize:22, fontWeight:800, letterSpacing:'-0.03em', color: accent || C_INK, fontVariantNumeric:'tabular-nums', lineHeight:1.1}}>{value}</div>
      <div style={{marginTop:5, fontSize:11, color:C_MUTED, lineHeight:1.35}}>{sub}</div>
    </button>
  );
}
function CaCard({ title, sub, children }) {
  return (
    <div style={{background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:12, overflow:'hidden'}}>
      <div style={{padding:'12px 14px', borderBottom:`1px solid ${C_BORDER}`}}>
        <div style={{fontSize:13.5, fontWeight:800, color:C_INK}}>{title}</div>
        <div style={{fontSize:11.5, color:C_MUTED, marginTop:2}}>{sub}</div>
      </div>
      {children}
    </div>
  );
}
function caChip(on) {
  return {
    padding:'6px 11px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
    border:`1px solid ${on ? C_BLUE : C_BORDER}`, borderRadius:14,
    background: on ? C_BLUE_SOFT : C_SURFACE, color: on ? C_BLUE : C_MUTED,
  };
}
const caDateBox = {
  height:32, padding:'0 10px', borderRadius:8, border:`1px solid ${C_BORDER}`, background:'#F8FAFC',
  display:'flex', alignItems:'center', fontSize:12, fontWeight:700, color:C_INK, fontVariantNumeric:'tabular-nums',
};
const caSelect = {
  height:32, padding:'0 8px', borderRadius:8, border:`1px solid ${C_BORDER}`, background:C_SURFACE,
  color:C_INK, fontSize:12, fontWeight:700, fontFamily:'inherit',
};
const caGhost = {
  height:32, padding:'0 12px', borderRadius:8, border:`1px solid ${C_BORDER}`, background:C_SURFACE,
  color:C_INK, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
};
const caTable = { width:'100%', borderCollapse:'collapse', fontSize:12.5, fontVariantNumeric:'tabular-nums' };
const caTh = { padding:'8px 10px', fontSize:11, fontWeight:700, color:C_MUTED, textAlign:'right', whiteSpace:'nowrap', background:'#FBFCFE' };
const caThL = { ...caTh, textAlign:'left' };
const caTd = { padding:'9px 10px', textAlign:'right', borderTop:`1px solid ${C_BORDER}`, color:C_INK };
const caTdL = { ...caTd, textAlign:'left' };

window.C_CustomerPage = C_CustomerPage;
