// 마케팅 › 재방문율 — 디자이너별 · 시술별 재방문 현황 + 바로 문자 보내기
const {
  C_BLUE, C_BLUE_SOFT, C_CORAL, C_INK, C_MUTED, C_BORDER, C_BG, C_SURFACE,
  c_ghostBtnSm, MKT_DESIGNERS, MKT_CATS, MKT_TODAY,
  RV_DEFAULT_CYCLE, RV_VISITS,
} = window;
const RV_DES_ALL = window.DESIGNERS;

const RV_MONTHS = ['2026-04','2026-05','2026-06','2026-07','2026-08','2026-09'];
const RV_WINS = [
  { id:'cycle', label:'시술 주기 안', short:'시술 주기', days:null },
  { id:'30',  label:'1개월 안', short:'1개월', days:30 },
  { id:'60',  label:'2개월 안', short:'2개월', days:60 },
  { id:'90',  label:'3개월 안', short:'3개월', days:90 },
  { id:'all', label:'지금까지', short:'지금까지', days:Infinity },
];
const rvYm = (daysAgo) => { const d = new Date(MKT_TODAY); d.setDate(d.getDate() - daysAgo); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; };
const rvMonthLabel = (ym) => `${Number(ym.slice(5))}월`;
// 기준 월 말일 → 오늘까지 경과일 (관찰 완료 여부 판단)
const rvMonthEndAgo = (ym) => { const [y, m] = ym.split('-').map(Number); return Math.round((MKT_TODAY - new Date(y, m, 0)) / 86400000); };
// 코호트 지표: 방문 고객 중 W일 안에 다시 온 비율 (아직 W일이 안 지난 고객은 '관찰 중' — 수치가 더 오를 수 있음)
// 시술 주기 기준: 고객마다 받은 시술의 권장 주기 × 1.5 (이탈 위험 전) 안에 왔는지
const rvWinDays = (w, v) => w.id === 'cycle' ? v.cy * 1.5 : w.days;
function rvCohort(arr, w) {
  let back = 0, observing = 0;
  arr.forEach(v => {
    const W = rvWinDays(w, v);
    if (v.after != null && v.after <= W) back++;
    else if (W !== Infinity && v.days < W) observing++;
  });
  return { n:arr.length, back, observing, den:arr.length, rate: arr.length ? Math.round((back / arr.length) * 1000) / 10 : 0 };
}
// 상태: 재방문 / 아직 주기 전 / 지금 연락할 때 / 이탈 위험
const RV_ST = {
  back:  { label:'기간 안 재방문', color:'#059669', bg:'#ECFDF5' },
  late:  { label:'기간 후 재방문', color:'#0D9488', bg:'#F0FDFA' },
  wait:  { label:'주기 전',       color:'#94A3B8', bg:'#F1F5F9' },
  due:   { label:'지금 연락할 때', color:'#D97706', bg:'#FFFBEB' },
  risk:  { label:'이탈 위험',      color:'#DC2626', bg:'#FEF2F2' },
};
function rvStatus(v, cycle, W) {
  if (v.after != null) return v.after <= W ? 'back' : 'late';
  // (W는 고객별 기간)
  if (v.days < cycle) return 'wait';
  if (v.days < cycle * 1.5) return 'due';
  return 'risk';
}
const rvPct = (a, b) => b ? Math.round((a / b) * 1000) / 10 : 0;
const rvDate = (daysAgo) => { const d = new Date(MKT_TODAY); d.setDate(d.getDate() - daysAgo); return `${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`; };
const rvDesName = (id) => (RV_DES_ALL.find(d => d.id === id) || {}).name || '-';
const rvDesColor = (id) => (RV_DES_ALL.find(d => d.id === id) || {}).color || '#94A3B8';
const rvCat = (id) => MKT_CATS.find(c => c.id === id) || { name:id, color:'#94A3B8' };

// ───────── 페이지 ─────────
function C_MktRevisitPage() {
  const [month, setMonth] = React.useState('2026-06');
  const [win, setWin] = React.useState('cycle');
  const [catF, setCatF] = React.useState('all');
  const [who, setWho] = React.useState('all');      // all | new | old
  const [axis, setAxis] = React.useState('designer'); // designer | cat
  const [cycle, setCycle] = React.useState(RV_DEFAULT_CYCLE);
  const [cycleOpen, setCycleOpen] = React.useState(false);
  React.useEffect(() => { window.__rvOpenCycle = () => setCycleOpen(true); return () => { delete window.__rvOpenCycle; }; }, []);
  const [sel, setSel] = React.useState(null);       // 선택한 디자이너/시술 id
  const [stF, setStF] = React.useState('due');
  const [picked, setPicked] = React.useState(() => new Set());
  const [send, setSend] = React.useState(null);     // 문자 보낼 대상 배열
  const [confirm, setConfirm] = React.useState(null);

  const winObj = RV_WINS.find(w => w.id === win);
  const whoOk = (v) => who === 'all' || (who === 'new' ? v.isNew : !v.isNew);
  const tagged = React.useMemo(() => RV_VISITS
    .filter(whoOk)
    .filter(v => catF === 'all' || v.cat === catF)
    .map(v => ({ ...v, ym: rvYm(v.days), cy: cycle[v.cat] || 60 })), [who, catF, cycle]);
  const base = React.useMemo(() => tagged
    .filter(v => v.ym === month)
    .map(v => ({ ...v, st: rvStatus(v, v.cy, rvWinDays(winObj, v)) })), [tagged, month, win]);
  const cohortRows = React.useMemo(() => RV_MONTHS.map(ym => {
    const arr = tagged.filter(v => v.ym === ym);
    const endAgo = rvMonthEndAgo(ym);
    return { ym, n:arr.length, cells: RV_WINS.map(w => {
      const c = rvCohort(arr, w);
      return { ...c, done: w.id === 'cycle' ? c.observing === 0 : (w.days === Infinity || endAgo >= w.days) };
    }) };
  }), [tagged]);

  const count = (arr, st) => arr.filter(v => v.st === st).length;
  const rate = (arr) => rvCohort(arr, winObj).rate;
  const backIn = (arr) => arr.filter(v => v.st === 'back');
  const avgAfter = (arr) => { const b = backIn(arr); return b.length ? Math.round(b.reduce((s, v) => s + v.after, 0) / b.length) : 0; };
  // 주기 지수: 실제 재방문 일수 ÷ 그 시술의 권장 주기 (1.0 = 권장대로, 0.8 = 20% 빨리)
  const avgIdx = (arr) => { const b = backIn(arr); return b.length ? b.reduce((s, v) => s + v.after / v.cy, 0) / b.length : 0; };
  const catBreak = (arr) => MKT_CATS.map(c => {
    const b = backIn(arr).filter(v => v.cat === c.id);
    return b.length ? `${c.name} ${Math.round(b.reduce((s, v) => s + v.after, 0) / b.length)}일 (권장 ${cycle[c.id]}일, ${b.length}명)` : null;
  }).filter(Boolean).join('\n');
  const totC = rvCohort(base, winObj);
  const totRate = totC.rate;
  const monthDone = totC.observing === 0;
  const homo = catF !== 'all'; // 한 시술만 보고 있으면 일수 평균이 의미 있음

  const groups = (axis === 'designer' ? MKT_DESIGNERS.map(d => ({ id:d.id, name:d.name, color:d.color, role:d.role }))
                                      : MKT_CATS.map(c => ({ id:c.id, name:c.name, color:c.color })))
    .map(g => {
      const arr = base.filter(v => (axis === 'designer' ? v.designer : v.cat) === g.id);
      const back = arr.filter(v => v.st === 'back');
      return {
        ...g, arr, n:arr.length, back:back.length, rate:rate(arr), avg:avgAfter(arr), idx:avgIdx(arr), brk:catBreak(arr),
        same: rvPct(back.filter(v => v.same).length, back.length),
        due:count(arr, 'due'), risk:count(arr, 'risk'), wait:count(arr, 'wait'),
      };
    })
    .filter(g => g.n > 0)
    .sort((a, b) => b.rate - a.rate);

  const scope = sel ? (groups.find(g => g.id === sel) || { arr:[] }).arr : base;
  const list = scope.filter(v => stF === 'all' || v.st === stF).sort((a, b) => b.days - a.days);
  const listShown = list.slice(0, 40);
  const pickedList = list.filter(v => picked.has(v.id));
  const selG = sel && groups.find(g => g.id === sel);

  const openSend = (arr, label) => setSend({ arr, label });
  const togglePick = (id) => setPicked(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allOn = listShown.length > 0 && listShown.every(v => picked.has(v.id));

  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden', background:C_BG}}>
      <div style={{width:948, flexShrink:0, flex:1, display:'flex', flexDirection:'column', minHeight:0}}>
        {/* 서브헤더 */}
        <div style={{display:'flex', alignItems:'center', gap:10, padding:'0 14px', height:49, background:C_SURFACE, borderBottom:`1px solid ${C_BORDER}`, flexShrink:0, position:'relative'}}>
          <div style={{fontSize:12.5, color:C_MUTED}}>
            홈 <span style={{margin:'0 6px'}}>›</span>마케팅<span style={{margin:'0 6px'}}>›</span>
            <span style={{color:C_INK, fontWeight:600}}>재방문율</span>
          </div>
          <div style={{flex:1}}/>
          <button onClick={() => setCycleOpen(o => !o)} style={{
            ...c_ghostBtnSm, fontFamily:'inherit', display:'flex', alignItems:'center', gap:5,
            background: cycleOpen ? C_BLUE_SOFT : C_SURFACE, color: cycleOpen ? C_BLUE : C_INK, borderColor: cycleOpen ? '#C7D6F5' : C_BORDER,
          }}><IconClock size={12}/> 시술별 재방문 주기</button>
          <button style={{...c_ghostBtnSm, fontFamily:'inherit'}}>엑셀 다운로드</button>
          {cycleOpen && <RvCyclePop cycle={cycle} setCycle={setCycle} onClose={() => setCycleOpen(false)}/>}
        </div>

        <div className="mkt-scroll" style={{flex:1, overflow:'auto', padding:'16px 20px 24px', display:'flex', flexDirection:'column', gap:14}}>
          <style>{`.mkt-scroll > * { flex-shrink: 0; }`}</style>

          {/* 기준 */}
          <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
            <select value={month} onChange={e => { setMonth(e.target.value); setPicked(new Set()); setSel(null); }} style={rvSel}>
              {RV_MONTHS.map(m => <option key={m} value={m}>2026년 {rvMonthLabel(m)}</option>)}
            </select>
            <span style={{fontSize:13.5, color:C_INK}}>에</span>
            <select value={catF} onChange={e => { setCatF(e.target.value); setPicked(new Set()); setSel(null); if (e.target.value !== 'all' && axis === 'cat') setAxis('designer'); }} style={rvSel}>
              <option value="all">모든 시술</option>
              {MKT_CATS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <span style={{fontSize:13.5, color:C_INK}}>받은 고객이</span>
            <window.MktSeg size="sm" value={win} onChange={(v) => { setWin(v); setPicked(new Set()); }} options={RV_WINS.map(w => ({ id:w.id, label:w.label }))}/>
            <span style={{fontSize:13.5, color:C_INK}}>다시 왔는지</span>
            <div style={{flex:1}}/>
            <window.MktSeg size="sm" value={who} onChange={(v) => { setWho(v); setPicked(new Set()); }} options={[
              { id:'all', label:'전체 고객' }, { id:'new', label:'신규' }, { id:'old', label:'기존' },
            ]}/>
          </div>
          {win === 'cycle' && (
            <div style={{fontSize:11.5, color:C_INK, background:C_BLUE_SOFT, border:'1px solid #D6E0F7', borderRadius:8, padding:'8px 12px', marginTop:-4, lineHeight:1.6}}>
              <b>시술 주기 안</b> = 고객마다 받은 시술의 권장 주기 × 1.5 안에 다시 왔는지예요. 예를 들어 컷&드라이({cycle['cut']}일)는 {Math.round(cycle['cut'] * 1.5)}일 안, 일반펌({cycle['basic-perm']}일)은 {Math.round(cycle['basic-perm'] * 1.5)}일 안에 오면 재방문으로 쳐요. 컷과 펌을 같은 기간으로 비교하지 않아서 시술이 섞여 있어도 공정해요.
              <button onClick={() => window.__rvOpenCycle && window.__rvOpenCycle()} style={{border:'none', background:'transparent', color:C_BLUE, fontWeight:700, cursor:'pointer', fontFamily:'inherit', fontSize:11.5, padding:'0 0 0 6px'}}>권장 주기 수정</button>
            </div>
          )}
          {!monthDone && (
            <div style={{fontSize:11.5, color:'#92400E', background:'#FFFBEB', border:'1px solid #FCE9B8', borderRadius:8, padding:'8px 12px', marginTop:-4, lineHeight:1.5}}>
              {rvMonthLabel(month)} 방문 고객 중 <b>{totC.observing}명</b>은 아직 {win === 'cycle' ? '시술 주기가' : `방문 후 ${winObj.short}이`} 지나지 않았어요. 이 고객들이 기간 안에 다시 오면 재방문율이 더 오를 수 있어요.
            </div>
          )}

          {/* 월별 코호트 */}
          <RvCohortGrid rows={cohortRows} month={month} win={win} onPick={(m, w) => { setMonth(m); setWin(w); setPicked(new Set()); setSel(null); }}/>

          {/* KPI */}
          <div style={{display:'grid', gridTemplateColumns:'1.3fr 1fr 1fr 1fr 1fr', background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:10, overflow:'hidden'}}>
            <div style={{padding:'14px 16px'}}>
              <div style={{fontSize:11.5, fontWeight:600, color:C_MUTED}}>재방문율</div>
              <div style={{display:'flex', alignItems:'baseline', gap:2, marginTop:4}}>
                <span style={{fontSize:26, fontWeight:800, color:C_BLUE, letterSpacing:'-0.02em', fontVariantNumeric:'tabular-nums'}}>{totRate}</span>
                <span style={{fontSize:13, fontWeight:700, color:C_BLUE}}>%</span>
              </div>
              <div style={{fontSize:11, color:C_MUTED, marginTop:3}}>{totC.n.toLocaleString()}명 중 {totC.back.toLocaleString()}명이 {win === 'all' ? '지금까지' : win === 'cycle' ? '시술 주기 안에' : winObj.short + ' 안에'} 재방문</div>
            </div>
            {[
              { l:`${rvMonthLabel(month)} 방문 고객`, v:base.length, u:'명', sub: homo ? `평균 ${avgAfter(base)}일 만에 재방문 (권장 ${cycle[catF]}일)` : `기간 후 재방문 ${count(base, 'late')}명 별도` },
              { l:'주기 전', v:count(base, 'wait'), u:'명', sub:'아직 올 때가 안 됐어요', st:'wait' },
              { l:'지금 연락할 때', v:count(base, 'due'), u:'명', sub:'주기 지남 · 1.5배 미만', st:'due' },
              { l:'이탈 위험', v:count(base, 'risk'), u:'명', sub:'주기 1.5배 이상 지남', st:'risk' },
            ].map((x, i) => (
              <div key={i} onClick={() => x.st && setStF(x.st)} style={{
                padding:'14px 16px', borderLeft:`1px solid ${C_BORDER}`, cursor: x.st ? 'pointer' : 'default',
                background: x.st && stF === x.st ? RV_ST[x.st].bg : 'transparent',
              }}>
                <div style={{fontSize:11.5, fontWeight:600, color:C_MUTED, display:'flex', alignItems:'center', gap:5}}>
                  {x.st && <span style={{width:7, height:7, borderRadius:'50%', background:RV_ST[x.st].color}}/>}{x.l}
                </div>
                <div style={{display:'flex', alignItems:'baseline', gap:2, marginTop:4}}>
                  <span style={{fontSize:20, fontWeight:800, color: x.st === 'risk' ? '#DC2626' : x.st === 'due' ? '#B45309' : C_INK, letterSpacing:'-0.02em', fontVariantNumeric:'tabular-nums'}}>{x.v.toLocaleString()}</span>
                  <span style={{fontSize:12, fontWeight:600, color:C_MUTED}}>{x.u}</span>
                </div>
                <div style={{fontSize:11, color:C_MUTED, marginTop:3}}>{x.sub}</div>
              </div>
            ))}
          </div>

          {/* 디자이너별 / 시술별 */}
          <div style={{background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:10, overflow:'hidden'}}>
            <div style={{display:'flex', alignItems:'center', gap:4, padding:'0 14px', height:48, borderBottom:`1px solid ${C_BORDER}`}}>
              {[{ id:'designer', label:'디자이너별' }, ...(homo ? [] : [{ id:'cat', label:'시술별' }])].map(t => {
                const on = axis === t.id;
                return (
                  <button key={t.id} onClick={() => { setAxis(t.id); setSel(null); setPicked(new Set()); }} style={{
                    alignSelf:'stretch', padding:'0 12px', border:'none', background:'transparent', cursor:'pointer', fontFamily:'inherit',
                    fontSize:13, fontWeight: on ? 700 : 500, color: on ? C_INK : C_MUTED, boxShadow: on ? `inset 0 -2px 0 ${C_BLUE}` : 'none',
                  }}>{t.label}</button>
                );
              })}
              <div style={{flex:1}}/>
              <span style={{fontSize:11.5, color:C_MUTED}}>행을 누르면 아래 고객 목록이 걸러져요</span>
            </div>
            <RvGroupTable axis={axis} groups={groups} totRate={totRate} sel={sel} homo={homo} cycle={cycle}
              onSel={(id) => { setSel(sel === id ? null : id); setPicked(new Set()); }}
              onSend={(g) => openSend(g.arr.filter(v => v.st === 'due' || v.st === 'risk'), `${g.name} · 연락할 때 + 이탈 위험`)}/>
          </div>

          {/* 고객 목록 */}
          <div style={{background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:10, overflow:'hidden'}}>
            <div style={{display:'flex', alignItems:'center', gap:8, padding:'12px 14px', borderBottom:`1px solid ${C_BORDER}`, flexWrap:'wrap'}}>
              <div style={{fontSize:13, fontWeight:700, color:C_INK}}>
                {selG ? <>{selG.name} <span style={{color:C_MUTED, fontWeight:500}}>고객</span></> : '전체 고객'}
              </div>
              {selG && <button onClick={() => setSel(null)} style={{border:'none', background:'#EEF1F6', color:C_MUTED, borderRadius:10, fontSize:11, padding:'2px 8px', cursor:'pointer', fontFamily:'inherit'}}>해제 ✕</button>}
              <div style={{flex:1}}/>
              {['all','due','risk','wait','back','late'].map(k => {
                const on = stF === k;
                const n = k === 'all' ? scope.length : count(scope, k);
                return (
                  <button key={k} onClick={() => { setStF(k); setPicked(new Set()); }} style={{
                    padding:'5px 10px', fontSize:12, fontWeight: on ? 700 : 500, borderRadius:14, cursor:'pointer', fontFamily:'inherit',
                    border:`1px solid ${on ? (k === 'all' ? C_BLUE : RV_ST[k].color) : C_BORDER}`,
                    background: on ? (k === 'all' ? C_BLUE_SOFT : RV_ST[k].bg) : C_SURFACE,
                    color: on ? (k === 'all' ? C_BLUE : RV_ST[k].color) : C_INK, display:'inline-flex', alignItems:'center', gap:5,
                  }}>
                    {k !== 'all' && <span style={{width:6, height:6, borderRadius:'50%', background:RV_ST[k].color}}/>}
                    {k === 'all' ? '전체' : RV_ST[k].label} <span style={{fontVariantNumeric:'tabular-nums', opacity:0.8}}>{n}</span>
                  </button>
                );
              })}
            </div>

            <div style={{
              display:'grid', gridTemplateColumns:RV_LIST_COLS, gap:8, alignItems:'center',
              padding:'9px 14px', background:'#FBFCFE', borderBottom:`1px solid ${C_BORDER}`, fontSize:11, fontWeight:700, color:C_MUTED,
            }}>
              <RvCheck on={allOn} onClick={() => setPicked(p => { const n = new Set(p); listShown.forEach(v => allOn ? n.delete(v.id) : n.add(v.id)); return n; })}/>
              <div>고객</div><div>담당</div><div>시술</div><div>방문일</div><div>경과 / 주기</div><div>상태</div>
            </div>
            {listShown.map((v, i) => {
              const st = RV_ST[v.st];
              const on = picked.has(v.id);
              const ratio = Math.min(2, v.days / v.cy);
              return (
                <div key={v.id} onClick={() => togglePick(v.id)} style={{
                  display:'grid', gridTemplateColumns:RV_LIST_COLS, gap:8, alignItems:'center', cursor:'pointer',
                  padding:'9px 14px', borderTop: i ? '1px solid #EFF2F7' : 'none', fontSize:12.5, color:C_INK, background: on ? '#F5F8FE' : C_SURFACE,
                }}>
                  <RvCheck on={on} onClick={(e) => { e.stopPropagation(); togglePick(v.id); }}/>
                  <div style={{minWidth:0}}>
                    <div style={{display:'flex', alignItems:'center', gap:5}}>
                      <span style={{fontWeight:600}}>{v.name}</span>
                      {v.isNew && <span style={{fontSize:9.5, fontWeight:800, padding:'1px 5px', borderRadius:4, background:'#EFF6FF', color:'#1D4ED8'}}>신규</span>}
                      {!v.consent && <span style={{fontSize:10, color:C_CORAL, fontWeight:700}}>수신거부</span>}
                    </div>
                    <div style={{fontSize:11, color:C_MUTED, fontVariantNumeric:'tabular-nums'}}>{v.phone}</div>
                  </div>
                  <div style={{display:'flex', alignItems:'center', gap:5}}><span style={{width:6, height:6, borderRadius:'50%', background:rvDesColor(v.designer)}}/>{rvDesName(v.designer)}</div>
                  <div style={{display:'flex', alignItems:'center', gap:5, minWidth:0}}><span style={{width:6, height:6, borderRadius:2, background:rvCat(v.cat).color, flexShrink:0}}/><span style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{rvCat(v.cat).name}</span></div>
                  <div style={{fontVariantNumeric:'tabular-nums', color:C_MUTED}}>{rvDate(v.days)}</div>
                  <div>
                    {(v.st === 'back' || v.st === 'late') ? (
                      <span style={{fontSize:12, fontVariantNumeric:'tabular-nums'}}>
                        {v.after}일 만에 재방문
                        {!v.same && <span style={{fontSize:11, color:'#B45309', marginLeft:4}}>→ {rvDesName(v.toDes)}</span>}
                      </span>
                    ) : (
                      <div style={{display:'flex', alignItems:'center', gap:6}}>
                        <div style={{width:64, height:6, borderRadius:3, background:'#EEF1F6', position:'relative', overflow:'hidden'}}>
                          <div style={{position:'absolute', left:0, top:0, bottom:0, width:`${(ratio / 2) * 100}%`, background:st.color}}/>
                          <div style={{position:'absolute', left:'50%', top:-1, bottom:-1, width:1.5, background:'#fff'}}/>
                        </div>
                        <span style={{fontSize:12, fontVariantNumeric:'tabular-nums'}}><b>{v.days}</b><span style={{color:C_MUTED}}> / {v.cy}일</span></span>
                      </div>
                    )}
                  </div>
                  <div><span style={{fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:10, background:st.bg, color:st.color, whiteSpace:'nowrap'}}>{st.label}</span></div>
                </div>
              );
            })}
            {list.length === 0 && <div style={{padding:'36px', textAlign:'center', fontSize:12.5, color:C_MUTED}}>해당하는 고객이 없어요</div>}

            {/* 하단 액션바 */}
            <div style={{display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderTop:`1px solid ${C_BORDER}`, background:'#FBFCFE', position:'sticky', bottom:0}}>
              <span style={{fontSize:12, color:C_MUTED}}>
                {list.length > listShown.length ? `${listShown.length} / ${list.length.toLocaleString()}명 표시 · ` : ''}
                {pickedList.length > 0 ? <><b style={{color:C_INK}}>{pickedList.length}명</b> 선택</> : '고객을 선택하거나 목록 전체에 보낼 수 있어요'}
              </span>
              <div style={{flex:1}}/>
              {pickedList.length > 0 && (
                <button onClick={() => openSend(pickedList, '선택한 고객')} style={{...c_ghostBtnSm, height:34, padding:'0 14px', fontFamily:'inherit', fontWeight:600}}>
                  선택 {pickedList.length}명에게 문자
                </button>
              )}
              <button disabled={!list.length || stF === 'back' || stF === 'late'} onClick={() => openSend(list, `${selG ? selG.name + ' · ' : ''}${stF === 'all' ? '전체' : RV_ST[stF].label}`)} style={{
                height:34, padding:'0 16px', border:'none', borderRadius:8, fontFamily:'inherit', fontSize:12.5, fontWeight:700, color:'#fff',
                background: !list.length || stF === 'back' || stF === 'late' ? '#C3CCDA' : C_BLUE, cursor: !list.length || stF === 'back' || stF === 'late' ? 'not-allowed' : 'pointer',
                display:'flex', alignItems:'center', gap:6,
              }}><IconMegaphone size={13}/> 목록 {list.length.toLocaleString()}명에게 문자</button>
            </div>
          </div>
        </div>
      </div>

      {send && (
        <RvSendDrawer target={send} onClose={() => setSend(null)} onRequest={(p, rec) => setConfirm({ p, rec })}/>
      )}
      {confirm && (
        <window.C_MktSendConfirm payload={confirm.p} recipients={confirm.rec}
          onClose={() => setConfirm(null)}
          onConfirm={() => { setConfirm(null); setSend(null); setPicked(new Set()); }}/>
      )}
    </div>
  );
}
const rvSel = {
  height:34, padding:'0 10px', border:`1px solid ${C_BORDER}`, borderRadius:8,
  fontSize:13.5, fontWeight:700, color:C_INK, background:C_SURFACE, fontFamily:'inherit', outline:'none',
};

// ───── 월별 코호트 표 ─────
function RvCohortGrid({ rows, month, win, onPick }) {
  const cols = '96px 80px 1.15fr repeat(4, 1fr)';
  return (
    <div style={{background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:10, overflow:'hidden'}}>
      <div style={{display:'flex', alignItems:'center', padding:'12px 16px', borderBottom:`1px solid ${C_BORDER}`}}>
        <div style={{fontSize:13, fontWeight:700, color:C_INK, flex:1}}>월별 재방문율</div>
        <span style={{fontSize:11.5, color:C_MUTED, display:'flex', alignItems:'center', gap:6}}>
          <span style={{width:12, height:10, borderRadius:2, background:'repeating-linear-gradient(135deg,#EEF1F6 0 3px,#fff 3px 6px)', border:`1px solid ${C_BORDER}`}}/>
          진행 중 (수치가 더 오를 수 있음) · 칸을 누르면 아래에 적용돼요
        </span>
      </div>
      <div style={{display:'grid', gridTemplateColumns:cols, padding:'8px 16px', fontSize:11, fontWeight:700, color:C_MUTED, background:'#FBFCFE', borderBottom:`1px solid ${C_BORDER}`}}>
        <div>방문 월</div><div style={{textAlign:'right', paddingRight:14}}>방문 고객</div>
        {RV_WINS.map(w => <div key={w.id} style={{textAlign:'center'}}>{w.label}</div>)}
      </div>
      {rows.map(row => (
        <div key={row.ym} style={{display:'grid', gridTemplateColumns:cols, alignItems:'center', padding:'4px 16px', borderTop:'1px solid #EFF2F7', background: row.ym === month ? '#F8FAFF' : C_SURFACE}}>
          <div style={{fontSize:12.5, fontWeight: row.ym === month ? 700 : 500, color:C_INK}}>2026년 {rvMonthLabel(row.ym)}</div>
          <div style={{fontSize:12, color:C_MUTED, textAlign:'right', paddingRight:14, fontVariantNumeric:'tabular-nums'}}>{row.n}명</div>
          {row.cells.map((c, i) => {
            const w = RV_WINS[i];
            const on = row.ym === month && w.id === win;
            const a = Math.min(1, c.rate / 80);
            return (
              <div key={w.id} style={{padding:'0 3px'}}>
                <button onClick={() => onPick(row.ym, w.id)} title={`${c.n}명 중 ${c.back}명 재방문${c.observing ? ` · 아직 기간 안 지난 ${c.observing}명` : ''}`} style={{
                  width:'100%', height:34, borderRadius:6, cursor:'pointer', fontFamily:'inherit',
                  border: on ? `2px solid ${C_INK}` : '1px solid transparent',
                  background: c.done ? `rgba(30,64,175,${0.08 + a * 0.62})` : `repeating-linear-gradient(135deg, rgba(30,64,175,${0.05 + a * 0.2}) 0 4px, #fff 4px 8px)`,
                  color: c.done && a > 0.55 ? '#fff' : C_INK,
                  fontSize:12.5, fontWeight:700, fontVariantNumeric:'tabular-nums',
                }}>
                  {c.n ? `${c.rate}%` : '-'}
                  {!c.done && c.observing > 0 && <span style={{fontSize:10, fontWeight:500, color:C_MUTED, marginLeft:4}}>진행 중</span>}
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

const RV_LIST_COLS = '20px 1.3fr 0.8fr 1.1fr 0.6fr 1.5fr 0.9fr';

function RvCheck({ on, onClick }) {
  return (
    <span onClick={onClick} style={{
      width:16, height:16, borderRadius:4, cursor:'pointer', border:`1.5px solid ${on ? C_BLUE : '#C3CCDA'}`,
      background: on ? C_BLUE : C_SURFACE, display:'inline-flex', alignItems:'center', justifyContent:'center', color:'#fff',
    }}>{on && <IconCheck size={11} stroke={3}/>}</span>
  );
}

// ───── 그룹 테이블 ─────
function RvGroupTable({ axis, groups, totRate, sel, onSel, onSend, homo, cycle }) {
  // 디자이너별: 시술이 섞이면 일수 평균이 의미 없어 숨김 (한 시술만 볼 때만 표시)
  const showAvg = axis === 'cat' || homo;
  const showCycle = axis === 'cat';
  const cols = ['1.2fr', '72px', '2.2fr', showAvg && '96px', showCycle && '80px', '130px', '76px'].filter(Boolean).join(' ');
  const maxN = Math.max(...groups.map(g => g.n), 1);
  return (
    <>
      <div style={{display:'grid', gridTemplateColumns:cols, gap:10, padding:'9px 16px', background:'#FBFCFE', borderBottom:`1px solid ${C_BORDER}`, fontSize:11, fontWeight:700, color:C_MUTED}}>
        <div>{axis === 'designer' ? '디자이너' : '시술'}</div>
        <div style={{textAlign:'right'}}>방문 고객</div>
        <div>재방문율 <span style={{fontWeight:500}}>(점선 = 매장 평균 {totRate}%)</span></div>
        {showAvg && <div style={{textAlign:'right'}}>평균 재방문</div>}
        {showCycle && <div style={{textAlign:'right'}}>권장 주기</div>}
        <div>연락 대상</div>
        <div/>
      </div>
      {groups.map((g, i) => {
        const on = sel === g.id;
        const up = g.rate >= totRate;
        const tgt = g.due + g.risk;
        return (
          <div key={g.id} onClick={() => onSel(g.id)} style={{
            display:'grid', gridTemplateColumns:cols, gap:10, alignItems:'center', cursor:'pointer',
            padding:'10px 16px', borderTop: i ? '1px solid #EFF2F7' : 'none', fontSize:12.5, color:C_INK,
            background: on ? C_BLUE_SOFT : C_SURFACE, boxShadow: on ? `inset 3px 0 0 ${C_BLUE}` : 'none',
          }}>
            <div style={{display:'flex', alignItems:'center', gap:7, minWidth:0}}>
              <span style={{width:8, height:8, borderRadius: axis === 'designer' ? '50%' : 2, background:g.color, flexShrink:0}}/>
              <span style={{fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{g.name}</span>
              {g.role && g.role !== '디자이너' && <span style={{fontSize:10.5, color:C_MUTED}}>{g.role}</span>}
            </div>
            <div style={{textAlign:'right', fontVariantNumeric:'tabular-nums', color:C_MUTED}}>{g.n}</div>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <div style={{flex:1, height:8, borderRadius:4, background:'#EEF1F6', position:'relative'}}>
                <div style={{position:'absolute', left:0, top:0, bottom:0, width:`${g.rate}%`, background: up ? C_BLUE : '#93A8D8', borderRadius:4}}/>
                <div style={{position:'absolute', left:`${totRate}%`, top:-3, bottom:-3, borderLeft:`1.5px dashed ${C_INK}`, opacity:0.4}}/>
              </div>
              <span style={{width:44, textAlign:'right', fontWeight:700, fontVariantNumeric:'tabular-nums', color: up ? C_BLUE : C_INK}}>{g.rate}%</span>
            </div>
            {showAvg && <div style={{textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{g.avg ? `${g.avg}일` : '-'}</div>}
            {showCycle && <div style={{textAlign:'right', fontVariantNumeric:'tabular-nums', color:C_MUTED}}>{cycle[g.id]}일</div>}
            <div style={{display:'flex', alignItems:'center', gap:8, fontSize:12, fontVariantNumeric:'tabular-nums'}}>
              <span style={{color:'#B45309'}}><span style={{display:'inline-block', width:6, height:6, borderRadius:'50%', background:RV_ST.due.color, marginRight:4}}/>{g.due}</span>
              <span style={{color:'#DC2626'}}><span style={{display:'inline-block', width:6, height:6, borderRadius:'50%', background:RV_ST.risk.color, marginRight:4}}/>{g.risk}</span>
            </div>
            <div style={{textAlign:'right'}}>
              <button disabled={!tgt} onClick={(e) => { e.stopPropagation(); onSend(g); }} title="연락할 때 + 이탈 위험 고객에게 문자" style={{
                height:28, padding:'0 10px', borderRadius:6, fontFamily:'inherit', fontSize:11.5, fontWeight:700,
                border:`1px solid ${tgt ? '#C7D6F5' : C_BORDER}`, background: tgt ? C_SURFACE : C_BG, color: tgt ? C_BLUE : '#B6C0CF',
                cursor: tgt ? 'pointer' : 'not-allowed', whiteSpace:'nowrap',
              }}>문자 {tgt}</button>
            </div>
          </div>
        );
      })}
    </>
  );
}

// ───── 시술별 주기 설정 팝오버 ─────
function RvCyclePop({ cycle, setCycle, onClose }) {
  const [draft, setDraft] = React.useState(cycle);
  return (
    <div style={{
      position:'absolute', top:44, right:120, width:340, zIndex:40, background:C_SURFACE,
      border:`1px solid ${C_BORDER}`, borderRadius:10, boxShadow:'0 12px 28px rgba(11,20,37,0.14)',
    }}>
      <div style={{padding:'12px 14px', borderBottom:`1px solid ${C_BORDER}`}}>
        <div style={{fontSize:13, fontWeight:700, color:C_INK}}>시술별 재방문 주기</div>
        <div style={{fontSize:11.5, color:C_MUTED, marginTop:3, lineHeight:1.5}}>이 기간이 지나면 '지금 연락할 때', 1.5배가 지나면 '이탈 위험'으로 분류돼요.</div>
      </div>
      <div style={{padding:'8px 14px', display:'flex', flexDirection:'column', gap:4, maxHeight:300, overflow:'auto'}}>
        {MKT_CATS.map(c => (
          <div key={c.id} style={{display:'flex', alignItems:'center', gap:8, height:34}}>
            <span style={{width:8, height:8, borderRadius:2, background:c.color}}/>
            <span style={{flex:1, fontSize:12.5, color:C_INK}}>{c.name}</span>
            <input value={draft[c.id] || ''} onChange={e => setDraft(d => ({ ...d, [c.id]: Number(e.target.value.replace(/[^0-9]/g,'')) || 0 }))} style={{
              width:56, height:28, border:`1px solid ${C_BORDER}`, borderRadius:6, textAlign:'right', padding:'0 8px',
              fontSize:12.5, fontWeight:700, color:C_INK, fontFamily:'inherit', outline:'none', fontVariantNumeric:'tabular-nums',
            }}/>
            <span style={{fontSize:12, color:C_MUTED}}>일</span>
          </div>
        ))}
      </div>
      <div style={{padding:'10px 14px', borderTop:`1px solid ${C_BORDER}`, display:'flex', gap:6, background:'#FBFCFE'}}>
        <button onClick={() => setDraft(RV_DEFAULT_CYCLE)} style={{...c_ghostBtnSm, fontFamily:'inherit'}}>기본값</button>
        <div style={{flex:1}}/>
        <button onClick={onClose} style={{...c_ghostBtnSm, fontFamily:'inherit'}}>취소</button>
        <button onClick={() => { setCycle(draft); window.__rvCycle = draft; onClose(); }} style={{
          height:28, padding:'0 14px', border:'none', borderRadius:6, background:C_BLUE, color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
        }}>적용</button>
      </div>
    </div>
  );
}

// ───── 문자 보내기 드로어 (단체발송 작성 패널 재사용) ─────
function RvSendDrawer({ target, onClose, onRequest }) {
  const arr = target.arr;
  const rec = {
    count: arr.length,
    countConsent: arr.filter(v => v.consent).length,
    modeLabel: target.label,
    chips: [{ key:'rv', label: target.label }],
  };
  const byDes = {};
  arr.forEach(v => { byDes[v.designer] = (byDes[v.designer] || 0) + 1; });
  const desTop = Object.entries(byDes).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const stCnt = ['due','risk','wait'].map(k => [k, arr.filter(v => v.st === k).length]).filter(x => x[1]);
  return (
    <div onClick={onClose} style={{position:'fixed', inset:0, background:'rgba(11,20,37,0.32)', zIndex:150, display:'flex', justifyContent:'flex-end'}}>
      <div onClick={e => e.stopPropagation()} style={{display:'flex', height:'100%', boxShadow:'-12px 0 40px rgba(11,20,37,0.2)'}}>
        <div style={{width:260, background:C_BG, borderRight:`1px solid ${C_BORDER}`, display:'flex', flexDirection:'column'}}>
          <div style={{padding:'16px', borderBottom:`1px solid ${C_BORDER}`, background:C_SURFACE, display:'flex', alignItems:'flex-start'}}>
            <div style={{flex:1}}>
              <div style={{fontSize:11.5, color:C_MUTED, fontWeight:600}}>재방문 유도 문자</div>
              <div style={{fontSize:15, fontWeight:700, color:C_INK, marginTop:3}}>{arr.length.toLocaleString()}명에게 보내기</div>
              <div style={{fontSize:11.5, color:C_MUTED, marginTop:3}}>{target.label}</div>
            </div>
            <button onClick={onClose} style={{border:'none', background:'transparent', color:C_MUTED, cursor:'pointer', display:'flex'}}><IconX size={16}/></button>
          </div>
          <div style={{padding:'14px 16px', display:'flex', flexDirection:'column', gap:14, overflow:'auto'}}>
            <div>
              <div style={{fontSize:11, fontWeight:700, color:C_MUTED, marginBottom:6}}>상태</div>
              {stCnt.map(([k, n]) => (
                <div key={k} style={{display:'flex', alignItems:'center', gap:6, fontSize:12.5, color:C_INK, height:26}}>
                  <span style={{width:7, height:7, borderRadius:'50%', background:RV_ST[k].color}}/>{RV_ST[k].label}
                  <div style={{flex:1}}/><b style={{fontVariantNumeric:'tabular-nums'}}>{n}</b>
                </div>
              ))}
            </div>
            <div>
              <div style={{fontSize:11, fontWeight:700, color:C_MUTED, marginBottom:6}}>담당 디자이너</div>
              {desTop.map(([id, n]) => (
                <div key={id} style={{display:'flex', alignItems:'center', gap:6, fontSize:12.5, color:C_INK, height:26}}>
                  <span style={{width:6, height:6, borderRadius:'50%', background:rvDesColor(id)}}/>{rvDesName(id)}
                  <div style={{flex:1}}/><b style={{fontVariantNumeric:'tabular-nums'}}>{n}</b>
                </div>
              ))}
            </div>
            <div style={{fontSize:11, color:C_MUTED, lineHeight:1.6, padding:'10px', background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:8}}>
              <b style={{color:C_INK}}>#{'{'}담당자{'}'}</b>를 넣으면 고객마다 담당 디자이너 이름으로 바뀌어요. "○○ 디자이너가 기다리고 있어요" 같은 문구가 재방문에 효과적이에요.
            </div>
          </div>
        </div>
        <window.C_MktComposer
          recipients={rec}
          previewList={arr.slice(0, 30)}
          initialSample={0}
          smsOnly
          onRequestSend={(p) => onRequest(p, rec)}
        />
      </div>
    </div>
  );
}

window.C_MktRevisitPage = C_MktRevisitPage;
