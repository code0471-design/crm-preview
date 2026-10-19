// 분석 › 고객 분석 — 재방문, 이탈, 들어온 경로
const {
  C_BLUE, C_BLUE_SOFT, C_INK, C_MUTED, C_BORDER, C_BG, C_SURFACE,
} = window;

const CA_PRESETS = [
  { id:'month', label:'이번 달', from:'2026.09.01', to:'2026.09.21', test:v => v.days <= 20, prev:v => v.days >= 21 && v.days <= 51, prevLabel:'지난달' },
  { id:'last',  label:'지난달', from:'2026.08.01', to:'2026.08.31', test:v => v.days >= 21 && v.days <= 51, prev:v => v.days >= 52 && v.days <= 82, prevLabel:'그 전달' },
  { id:'q',     label:'최근 3개월', from:'2026.06.23', to:'2026.09.21', test:v => v.days <= 90 },
  { id:'all',   label:'전체', from:'', to:'2026.09.21', test:() => true },
];
const CA_CHANNELS = [
  { id:'road',   name:'로드',   color:'#3B82F6' },
  { id:'online', name:'온라인', color:'#06B6D4' },
  { id:'intro',  name:'소개',   color:'#F59E0B' },
];
const CA_ST = {
  back: { label:'기간 안 재방문', color:'#059669', bg:'#ECFDF5' },
  late: { label:'기간 후 재방문', color:'#0D9488', bg:'#F0FDFA' },
  wait: { label:'주기 전',       color:'#64748B', bg:'#F1F5F9' },
  due:  { label:'지금 연락할 때', color:'#D97706', bg:'#FFFBEB' },
  risk: { label:'이탈 위험',      color:'#DC2626', bg:'#FEF2F2' },
};
const CA_ST_ORDER = { risk:0, due:1, late:2, back:3, wait:4 };

function caPct(a, b) { return b ? Math.round((a / b) * 1000) / 10 : 0; }
function caDate(days) {
  const d = new Date(2026, 8, 21);
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}
function caDes(id) {
  return (window.DESIGNERS || []).find(d => d.id === id) || { id, name:id === 'unassigned' ? '미지정' : id, role:'', color:'#94A3B8' };
}
function caCat(id) {
  return ((window.MENU_CATEGORIES || []).find(c => c.id === id) || {}).name || id;
}
function caEnrich() {
  const people = {};
  (window.MKT_CUSTOMERS || []).forEach(c => { people[c.id] = c; });
  const cycles = window.RV_DEFAULT_CYCLE || {};
  return (window.RV_VISITS || []).map(v => {
    const cycle = cycles[v.cat] || 60;
    const limit = cycle * 1.5;
    let st = 'risk';
    if (v.after != null) st = v.after <= limit ? 'back' : 'late';
    else if (v.days < cycle) st = 'wait';
    else if (v.days < limit) st = 'due';
    const person = people[v.cid] || {};
    return { ...v, cycle, st, channel: person.channel || 'road' };
  });
}
function caPack(rows) {
  const back = rows.filter(v => v.st === 'back').length;
  const late = rows.filter(v => v.st === 'late').length;
  const due = rows.filter(v => v.st === 'due').length;
  const risk = rows.filter(v => v.st === 'risk').length;
  const wait = rows.filter(v => v.st === 'wait').length;
  const fresh = rows.filter(v => v.isNew).length;
  const returned = rows.filter(v => v.after != null);
  const avg = returned.length ? Math.round(returned.reduce((a, v) => a + v.after, 0) / returned.length) : 0;
  const switched = returned.filter(v => v.same === false).length;
  const ready = back + late + due + risk;
  return { n:rows.length, back, late, due, risk, wait, fresh, avg, switched, ready, rate: ready ? caPct(back, ready) : null };
}

function C_CustomerPage() {
  const [preset, setPreset] = React.useState('q');
  const [designer, setDesigner] = React.useState('all');
  const [cat, setCat] = React.useState('all');
  const [channel, setChannel] = React.useState('all');
  const [status, setStatus] = React.useState('all');
  const [freshOnly, setFreshOnly] = React.useState(false);
  const [shown, setShown] = React.useState(40);
  const all = React.useMemo(() => caEnrich(), []);
  const range = CA_PRESETS.find(p => p.id === preset);
  const period = all.filter(range.test);
  const periodPack = caPack(period);
  const scoped = designer === 'all' ? period : period.filter(v => v.designer === designer);
  const pack = caPack(scoped);
  const prevPack = range.prev ? caPack(all.filter(range.prev).filter(v => designer === 'all' || v.designer === designer)) : null;
  const delta = prevPack && pack.rate != null && prevPack.rate != null ? Math.round((pack.rate - prevPack.rate) * 10) / 10 : null;

  const desRows = React.useMemo(() => {
    const map = {};
    period.forEach(v => {
      if (!map[v.designer]) map[v.designer] = [];
      map[v.designer].push(v);
    });
    return Object.keys(map).map(id => ({ des:caDes(id), ...caPack(map[id]) })).sort((a, b) => b.n - a.n);
  }, [period]);
  const catRows = React.useMemo(() => {
    const map = {};
    scoped.forEach(v => {
      if (!map[v.cat]) map[v.cat] = [];
      map[v.cat].push(v);
    });
    return Object.keys(map).map(id => ({ id, name:caCat(id), cycle:(window.RV_DEFAULT_CYCLE || {})[id] || 60, ...caPack(map[id]) })).sort((a, b) => b.n - a.n);
  }, [scoped]);
  const chRows = CA_CHANNELS.map(c => ({ ...c, ...caPack(scoped.filter(v => v.channel === c.id)) })).filter(c => c.n > 0);

  const list = scoped.filter(v => {
    if (cat !== 'all' && v.cat !== cat) return false;
    if (channel !== 'all' && v.channel !== channel) return false;
    if (status !== 'all' && v.st !== status) return false;
    if (freshOnly && !v.isNew) return false;
    return true;
  }).sort((a, b) => (CA_ST_ORDER[a.st] - CA_ST_ORDER[b.st]) || (b.days - a.days));

  const ranked = desRows.filter(d => d.ready >= 8 && d.rate != null).slice().sort((a, b) => b.rate - a.rate);
  const best = ranked[0];
  const weak = ranked[ranked.length - 1];
  const bestCh = chRows.filter(c => c.ready >= 8 && c.rate != null).slice().sort((a, b) => b.rate - a.rate)[0];
  const fromLabel = preset === 'all' && period.length ? caDate(Math.max(...period.map(v => v.days))) : range.from;

  const pickStatus = (id) => { setFreshOnly(false); setStatus(s => s === id ? 'all' : id); setShown(40); };
  const clearAll = () => { setDesigner('all'); setCat('all'); setChannel('all'); setStatus('all'); setFreshOnly(false); setShown(40); };

  const chips = [];
  if (designer !== 'all') chips.push({ k:'des', label:caDes(designer).name });
  if (cat !== 'all') chips.push({ k:'cat', label:caCat(cat) });
  if (channel !== 'all') chips.push({ k:'ch', label:(CA_CHANNELS.find(c => c.id === channel) || {}).name });
  if (freshOnly) chips.push({ k:'new', label:'신규' });
  if (status !== 'all') chips.push({ k:'st', label:CA_ST[status].label });

  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden', background:C_BG}}>
      <div style={{width:'100%', flex:1, display:'flex', flexDirection:'column', minWidth:0, minHeight:0}}>
        <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', padding:'10px 14px', background:C_SURFACE, borderBottom:`1px solid ${C_BORDER}`}}>
          <span style={{fontSize:12.5, color:C_MUTED, fontWeight:600}}>기간</span>
          <div style={caDateBox}>{fromLabel}</div>
          <span style={{color:C_MUTED, fontSize:12}}>~</span>
          <div style={caDateBox}>{range.to}</div>
          <div style={{display:'flex', gap:4}}>
            {CA_PRESETS.map(p => {
              const on = preset === p.id;
              return (
                <button key={p.id} onClick={() => { setPreset(p.id); setShown(40); }} style={caChip(on)}>{p.label}</button>
              );
            })}
          </div>
          <div style={{flex:1}}/>
          <select value={designer} onChange={e => { setDesigner(e.target.value); setShown(40); }} style={caSelect}>
            <option value="all">전체 담당자</option>
            {desRows.map(d => <option key={d.des.id} value={d.des.id}>{d.des.name}</option>)}
          </select>
          <button onClick={() => window.__goPage && window.__goPage('mkt-revisit')} style={caGhost}>재방문율에서 문자</button>
        </div>

        <div style={{flex:1, overflow:'auto', padding:'16px 20px 28px'}}>
          <div style={{fontSize:12, color:C_MUTED, marginBottom:12}}>
            홈 <span style={{margin:'0 6px'}}>›</span>
            분석 <span style={{margin:'0 6px'}}>›</span>
            <span style={{color:C_INK, fontWeight:700}}>고객 분석</span>
          </div>

          {best && weak && best.des.id !== weak.des.id && (
            <div style={{fontSize:12.5, color:C_INK, fontWeight:600, marginBottom:12, lineHeight:1.5}}>
              {best.des.name} 재방문율 {best.rate}% · {weak.des.name} {weak.rate}%
              {bestCh ? ` · ${bestCh.name} 유입 ${bestCh.rate}%` : ''}
            </div>
          )}

          <div style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:10, marginBottom:12}}>
            <CaKpi label="방문 고객" value={`${pack.n.toLocaleString()}명`} sub={`신규 ${pack.fresh.toLocaleString()}명`} on={!freshOnly && status === 'all'} onClick={() => { setFreshOnly(false); setStatus('all'); setShown(40); }}/>
            <CaKpi label="신규" value={`${pack.fresh.toLocaleString()}명`} sub={pack.n ? `방문의 ${caPct(pack.fresh, pack.n)}%` : '—'} on={freshOnly} onClick={() => { setStatus('all'); setFreshOnly(v => !v); setShown(40); }}/>
            <CaKpi label="재방문율" value={pack.rate == null ? '—' : `${pack.rate}%`} sub={pack.rate == null ? `관찰 중 ${pack.wait.toLocaleString()}명` : (delta == null ? `주기 안에 ${pack.back.toLocaleString()}명` : `${range.prevLabel}보다 ${delta > 0 ? '+' : ''}${delta}%p`)} accent={C_BLUE} on={status === 'back'} onClick={() => pickStatus('back')}/>
            <CaKpi label="지금 연락할 때" value={`${pack.due.toLocaleString()}명`} sub="권장 주기는 지났고, 이탈 전" accent="#D97706" on={status === 'due'} onClick={() => pickStatus('due')}/>
            <CaKpi label="이탈 위험" value={`${pack.risk.toLocaleString()}명`} sub="권장 주기의 1.5배를 넘김" accent="#DC2626" on={status === 'risk'} onClick={() => pickStatus('risk')}/>
          </div>
          <div style={{fontSize:11.5, color:C_MUTED, marginBottom:14, lineHeight:1.45}}>
            {pack.ready === 0
              ? '이 기간에 온 고객은 아직 권장 주기 전이라 재방문율을 내지 않습니다.'
              : '재방문율은 권장 주기가 이미 지난 고객만 나눕니다. 아직 주기 전인 고객은 빼 두었습니다.'}
          </div>

          {chips.length > 0 && (
            <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:12, alignItems:'center'}}>
              {chips.map(c => (
                <button key={c.k} onClick={() => {
                  if (c.k === 'des') setDesigner('all');
                  if (c.k === 'cat') setCat('all');
                  if (c.k === 'ch') setChannel('all');
                  if (c.k === 'new') setFreshOnly(false);
                  if (c.k === 'st') setStatus('all');
                  setShown(40);
                }} style={{...caChip(true), display:'inline-flex', alignItems:'center', gap:4}}>
                  {c.label} <span style={{fontWeight:700}}>×</span>
                </button>
              ))}
              <button onClick={clearAll} style={{border:'none', background:'transparent', color:C_MUTED, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit'}}>전체 해제</button>
            </div>
          )}

          <div style={{display:'grid', gridTemplateColumns:'1.35fr 1fr', gap:12, marginBottom:12, alignItems:'start'}}>
            <CaCard title="담당자별" sub="이 기간에 방문한 고객">
              <table style={caTable}>
                <thead>
                  <tr>
                    <th style={caThL}>담당자</th>
                    <th style={caTh}>방문</th>
                    <th style={caTh}>신규</th>
                    <th style={caTh}>재방문율</th>
                    <th style={caTh}>연락</th>
                    <th style={caTh}>이탈</th>
                  </tr>
                </thead>
                <tbody>
                  <tr onClick={() => { setDesigner('all'); setShown(40); }} style={{cursor:'pointer', background: designer === 'all' ? C_BLUE_SOFT : 'transparent'}}>
                    <td style={{...caTdL, fontWeight:700}}>전체</td>
                    <td style={caTd}>{periodPack.n.toLocaleString()}</td>
                    <td style={caTd}>{periodPack.fresh.toLocaleString()}</td>
                    <td style={caTd}><CaRate rate={periodPack.rate}/></td>
                    <td style={{...caTd, color:'#D97706', fontWeight:700}}>{periodPack.due.toLocaleString()}</td>
                    <td style={{...caTd, color:'#DC2626', fontWeight:700}}>{periodPack.risk.toLocaleString()}</td>
                  </tr>
                  {desRows.map(d => (
                    <tr key={d.des.id} onClick={() => { setDesigner(d.des.id); setShown(40); }} style={{cursor:'pointer', background: designer === d.des.id ? C_BLUE_SOFT : 'transparent'}}>
                      <td style={caTdL}>
                        <span style={{display:'inline-flex', alignItems:'center', gap:6}}>
                          <span style={{width:3, height:12, borderRadius:2, background:d.des.color}}/>
                          <span style={{fontWeight:700, color:C_INK}}>{d.des.name}</span>
                          <span style={{fontSize:10.5, color:C_MUTED}}>{d.des.role}</span>
                        </span>
                      </td>
                      <td style={caTd}>{d.n.toLocaleString()}</td>
                      <td style={caTd}>{d.fresh.toLocaleString()}</td>
                      <td style={caTd}><CaRate rate={d.rate}/></td>
                      <td style={{...caTd, color: d.due ? '#D97706' : '#CBD5E1', fontWeight: d.due ? 700 : 500}}>{d.due.toLocaleString()}</td>
                      <td style={{...caTd, color: d.risk ? '#DC2626' : '#CBD5E1', fontWeight: d.risk ? 700 : 500}}>{d.risk.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CaCard>

            <div style={{display:'flex', flexDirection:'column', gap:12}}>
              <CaCard title="시술별" sub="권장 주기 안에 다시 왔는지">
                <table style={caTable}>
                  <thead>
                    <tr>
                      <th style={caThL}>시술</th>
                      <th style={caTh}>주기</th>
                      <th style={caTh}>방문</th>
                      <th style={caTh}>재방문율</th>
                      <th style={caTh}>이탈</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr onClick={() => { setCat('all'); setShown(40); }} style={{cursor:'pointer', background: cat === 'all' ? C_BLUE_SOFT : 'transparent'}}>
                      <td style={{...caTdL, fontWeight:700}}>전체</td>
                      <td style={caTd}>—</td>
                      <td style={caTd}>{scoped.length.toLocaleString()}</td>
                      <td style={caTd}>{pack.rate == null ? '—' : `${pack.rate}%`}</td>
                      <td style={{...caTd, color:'#DC2626', fontWeight:700}}>{pack.risk.toLocaleString()}</td>
                    </tr>
                    {catRows.map(c => (
                      <tr key={c.id} onClick={() => { setCat(c.id); setShown(40); }} style={{cursor:'pointer', background: cat === c.id ? C_BLUE_SOFT : 'transparent'}}>
                        <td style={{...caTdL, fontWeight:700, color:C_INK}}>{c.name}</td>
                        <td style={caTd}>{c.cycle}일</td>
                        <td style={caTd}>{c.n.toLocaleString()}</td>
                        <td style={{...caTd, fontWeight:700, color:C_INK}}>{c.rate == null ? '—' : `${c.rate}%`}</td>
                        <td style={{...caTd, color: c.risk ? '#DC2626' : '#CBD5E1', fontWeight: c.risk ? 700 : 500}}>{c.risk.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CaCard>

              <CaCard title="들어온 경로" sub="처음 온 경로별 재방문">
                <div style={{display:'flex', flexDirection:'column', gap:8, padding:'12px 14px 14px'}}>
                  {chRows.map(c => {
                    const on = channel === c.id;
                    return (
                      <button key={c.id} onClick={() => { setChannel(on ? 'all' : c.id); setShown(40); }} style={{
                        display:'grid', gridTemplateColumns:'64px 1fr 72px 56px', gap:8, alignItems:'center',
                        border:`1px solid ${on ? C_BLUE : C_BORDER}`, borderRadius:8, background: on ? C_BLUE_SOFT : C_SURFACE,
                        padding:'8px 10px', cursor:'pointer', fontFamily:'inherit', textAlign:'left',
                      }}>
                        <span style={{fontSize:12.5, fontWeight:800, color:C_INK}}>{c.name}</span>
                        <span style={{height:6, borderRadius:99, background:'#EEF1F6', overflow:'hidden'}}>
                          <span style={{display:'block', width:`${Math.min(100, c.rate || 0)}%`, height:'100%', background:c.color}}/>
                        </span>
                        <span style={{fontSize:12, fontWeight:800, color:C_INK, fontVariantNumeric:'tabular-nums', textAlign:'right'}}>{c.rate == null ? '—' : `${c.rate}%`}</span>
                        <span style={{fontSize:11, color:C_MUTED, textAlign:'right'}}>{c.n.toLocaleString()}명</span>
                      </button>
                    );
                  })}
                </div>
              </CaCard>
            </div>
          </div>

          <CaCard title="고객" sub={`${list.length.toLocaleString()}명`}>
            <table style={caTable}>
              <thead>
                <tr>
                  <th style={caThL}>고객</th>
                  <th style={caThL}>연락처</th>
                  <th style={caThL}>담당자</th>
                  <th style={caThL}>시술</th>
                  <th style={caThL}>경로</th>
                  <th style={caTh}>기준 방문</th>
                  <th style={caThL}>상태</th>
                </tr>
              </thead>
              <tbody>
                {list.slice(0, shown).map(v => {
                  const d = caDes(v.designer);
                  const st = CA_ST[v.st];
                  const ch = CA_CHANNELS.find(c => c.id === v.channel);
                  return (
                    <tr key={v.id}>
                      <td style={{...caTdL, fontWeight:700, color:C_INK}}>
                        {v.name}
                        {v.isNew && <span style={{marginLeft:6, fontSize:10, fontWeight:700, color:'#059669'}}>신규</span>}
                      </td>
                      <td style={{...caTdL, color:C_MUTED}}>{v.phone}</td>
                      <td style={caTdL}>{d.name}</td>
                      <td style={caTdL}>{caCat(v.cat)}</td>
                      <td style={caTdL}>{ch ? ch.name : '—'}</td>
                      <td style={caTd}>{caDate(v.days)}</td>
                      <td style={caTdL}>
                        <span style={{display:'inline-block', fontSize:11, fontWeight:700, color:st.color, background:st.bg, borderRadius:99, padding:'3px 8px'}}>
                          {st.label}{v.after != null ? ` · ${v.after}일` : ` · ${v.days}일`}
                        </span>
                      </td>
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
      textAlign:'left', cursor:'pointer', fontFamily:'inherit',
      background: on ? C_BLUE_SOFT : C_SURFACE, border:`1.5px solid ${on ? C_BLUE : C_BORDER}`,
      borderRadius:12, padding:'12px 14px',
    }}>
      <div style={{fontSize:11.5, color:C_MUTED, fontWeight:600}}>{label}</div>
      <div style={{marginTop:6, fontSize:22, fontWeight:800, letterSpacing:'-0.03em', color: accent || C_INK, fontVariantNumeric:'tabular-nums', lineHeight:1.1}}>{value}</div>
      <div style={{marginTop:5, fontSize:11, color:C_MUTED, lineHeight:1.35}}>{sub}</div>
    </button>
  );
}
function CaRate({ rate }) {
  if (rate == null) return <span style={{color:C_MUTED, fontWeight:700}}>—</span>;
  return (
    <span style={{display:'inline-flex', alignItems:'center', gap:6, justifyContent:'flex-end'}}>
      <span style={{width:54, height:6, borderRadius:99, background:'#EEF1F6', overflow:'hidden'}}>
        <span style={{display:'block', width:`${Math.min(100, rate)}%`, height:'100%', background:C_BLUE}}/>
      </span>
      <span style={{minWidth:42, fontWeight:800, color:C_INK}}>{rate}%</span>
    </span>
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
