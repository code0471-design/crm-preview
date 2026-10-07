// 설정 › 고객 그룹 설정
// 그룹 이름 → 기간 → 그 기간의 방문횟수(이상)와 총결제액(얼마~얼마)

const {
  C_BLUE, C_BLUE_SOFT, C_INK, C_MUTED, C_BORDER, C_BG, C_SURFACE,
  c_ghostBtn, c_ghostBtnSm,
} = window;

const CG_PERIODS = [
  { id:'all', label:'전체 기간' },
  { id:'1m', label:'최근 1개월' },
  { id:'3m', label:'최근 3개월' },
  { id:'6m', label:'최근 6개월' },
  { id:'1y', label:'최근 1년' },
  { id:'custom', label:'기간 직접 설정' },
];

const CG_SEED = [
  { id:1, name:'VIP', period:'all', from:'', to:'', useVisit:true, count:'10', usePay:true, payMode:'range', payMin:'1000000', payMax:'3000000' },
  { id:2, name:'단골', period:'all', from:'', to:'', useVisit:true, count:'5', usePay:false, payMode:'min', payMin:'300000', payMax:'1000000' },
  { id:3, name:'최근 고액', period:'3m', from:'', to:'', useVisit:false, count:'3', usePay:true, payMode:'min', payMin:'300000', payMax:'1000000' },
];

function cgBlank() {
  return { id:null, name:'', period:'all', from:'', to:'', useVisit:true, count:'5', usePay:false, payMode:'min', payMin:'300000', payMax:'1000000' };
}
function cgPeriodLabel(g) {
  if (g.period === 'custom') return g.from && g.to ? `${g.from} ~ ${g.to}` : '기간 직접 설정';
  return (CG_PERIODS.find(p => p.id === g.period) || CG_PERIODS[0]).label;
}
function cgPayLabel(g) {
  const a = Number(g.payMin || 0).toLocaleString();
  if (g.payMode !== 'range') return `${a}원 이상`;
  return `${a}원 ~ ${Number(g.payMax || 0).toLocaleString()}원`;
}
function cgParts(g) {
  const parts = [cgPeriodLabel(g)];
  if (g.useVisit) parts.push(`방문 ${Number(g.count || 0).toLocaleString()}회 이상`);
  if (g.usePay) parts.push(`총결제 ${cgPayLabel(g)}`);
  return parts;
}
function cgSummary(g) {
  return cgParts(g).join(' · ');
}
function cgMatchCount(g) {
  const list = window.MKT_CUSTOMERS || [];
  if (!list.length || (!g.useVisit && !g.usePay)) return null;
  if (g.period !== 'all') return null;
  const count = Number(g.count);
  const min = Number(g.payMin);
  const max = Number(g.payMax);
  return list.filter(c => {
    if (g.useVisit && !(c.visits >= count)) return false;
    if (g.usePay && g.payMode === 'range' && !(c.totalPaid >= min && c.totalPaid <= max)) return false;
    if (g.usePay && g.payMode !== 'range' && !(c.totalPaid >= min)) return false;
    return true;
  }).length;
}
function cgDigits(v) { return String(v || '').replace(/[^0-9]/g, ''); }

function C_CustomerGroupPage() {
  const [groups, setGroups] = React.useState(CG_SEED);
  const [draft, setDraft] = React.useState(null);
  const [error, setError] = React.useState('');
  const [confirmId, setConfirmId] = React.useState(null);

  const patch = (p) => { setDraft(d => ({ ...d, ...p })); setError(''); };
  const openNew = () => { setDraft(cgBlank()); setError(''); setConfirmId(null); };
  const openEdit = (g) => { setDraft({ ...g }); setError(''); setConfirmId(null); };

  const save = () => {
    const name = draft.name.trim();
    if (!name) { setError('그룹 이름을 입력해 주세요.'); return; }
    if (groups.some(g => g.name === name && g.id !== draft.id)) { setError('같은 이름의 그룹이 이미 있어요.'); return; }
    if (!draft.useVisit && !draft.usePay) { setError('방문횟수와 총결제액 중 하나 이상을 켜 주세요.'); return; }
    if (draft.period === 'custom' && (!draft.from || !draft.to)) { setError('기간의 시작일과 종료일을 정해 주세요.'); return; }
    if (draft.period === 'custom' && draft.from > draft.to) { setError('시작일이 종료일보다 늦어요.'); return; }
    if (draft.useVisit && cgDigits(draft.count) === '') { setError('방문횟수를 입력해 주세요.'); return; }
    if (draft.usePay && cgDigits(draft.payMin) === '') { setError('총결제액을 입력해 주세요.'); return; }
    if (draft.usePay && draft.payMode === 'range' && cgDigits(draft.payMax) === '') { setError('총결제액의 끝 금액을 입력해 주세요.'); return; }
    if (draft.usePay && draft.payMode === 'range' && Number(cgDigits(draft.payMin)) > Number(cgDigits(draft.payMax))) { setError('앞 금액이 뒤 금액보다 커요.'); return; }
    const next = {
      ...draft,
      name,
      count: cgDigits(draft.count) || '0',
      payMin: cgDigits(draft.payMin) || '0',
      payMax: cgDigits(draft.payMax) || '0',
    };
    setGroups(list => next.id
      ? list.map(g => g.id === next.id ? next : g)
      : [...list, { ...next, id: Date.now() }]);
    setDraft(null);
    setError('');
  };

  const remove = (id) => {
    setGroups(list => list.filter(g => g.id !== id));
    setConfirmId(null);
    if (draft && draft.id === id) setDraft(null);
  };

  const previewN = draft ? cgMatchCount(draft) : null;

  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden', background:C_BG}}>
      <div style={{width:948, flexShrink:0, flex:1, display:'flex', flexDirection:'column', minHeight:0}}>
        <div style={{display:'flex', alignItems:'center', gap:8, padding:'10px 14px', background:C_SURFACE, borderBottom:`1px solid ${C_BORDER}`}}>
          <div style={{fontSize:12.5, color:C_MUTED, flexShrink:0}}>
            홈 <span style={{margin:'0 6px'}}>›</span>설정<span style={{margin:'0 6px'}}>›</span>
            <span style={{color:C_INK, fontWeight:600}}>고객 그룹 설정</span>
          </div>
          <div style={{flex:1}}/>
          <button onClick={openNew} style={{
            display:'flex', alignItems:'center', gap:6, height:32, padding:'0 12px',
            background:C_BLUE, color:'#fff', border:'none', borderRadius:8, fontSize:12.5, fontWeight:700,
            cursor:'pointer', fontFamily:'inherit', boxShadow:'0 1px 2px rgba(30,64,175,0.2)',
          }}><IconPlus size={13}/> 그룹 추가</button>
        </div>

        <div style={{flex:1, overflow:'auto', padding:'16px 20px 24px', display:'flex', flexDirection:'column', gap:14}}>
          <div style={{fontSize:12.5, color:C_MUTED, lineHeight:1.6}}>
            그룹 이름 다음에 <b style={{color:C_INK, fontWeight:600}}>기간</b>을 먼저 정해요. 그 기간의 <b style={{color:C_INK, fontWeight:600}}>방문횟수</b>와 <b style={{color:C_INK, fontWeight:600}}>총결제액</b>을 따로, 또는 둘 다 조건으로 넣어요. 최근 기간은 오늘을 기준으로 다시 계산돼요.
          </div>

          {draft && (
            <div style={{background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:12, padding:'18px 20px'}}>
              <div style={{fontSize:14, fontWeight:700, color:C_INK, marginBottom:14}}>{draft.id ? '그룹 수정' : '새 그룹'}</div>
              <CgRow label="그룹 이름" required>
                <input value={draft.name} onChange={e => patch({ name:e.target.value })} placeholder="예: VIP, 단골, 고액" style={cgInput}/>
              </CgRow>
              <CgRow label="기간" required hint={draft.period === 'all' ? '지금까지의 방문과 결제를 봐요.' : '이 기간의 방문과 결제를 봐요. 오늘을 기준으로 다시 계산돼요.'}>
                <select value={draft.period} onChange={e => patch({ period:e.target.value })} style={{...cgSelect, minWidth:180}}>
                  {CG_PERIODS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
                {draft.period === 'custom' && (
                  <div style={{display:'flex', alignItems:'center', gap:8, marginTop:8}}>
                    <input type="date" value={draft.from} onChange={e => patch({ from:e.target.value })} style={cgInput}/>
                    <span style={{color:C_MUTED}}>~</span>
                    <input type="date" value={draft.to} onChange={e => patch({ to:e.target.value })} style={cgInput}/>
                  </div>
                )}
              </CgRow>
              <CgRow label="방문횟수" hint="그 기간에 방문한 횟수 이상이에요.">
                <div style={{display:'flex', alignItems:'center', gap:8}}>
                  <CgCheck on={draft.useVisit} onClick={() => patch({ useVisit: !draft.useVisit })}/>
                  <input value={Number(cgDigits(draft.count) || 0).toLocaleString()} disabled={!draft.useVisit} onChange={e => patch({ count: cgDigits(e.target.value) })} style={{...cgInput, width:120, textAlign:'right', opacity: draft.useVisit ? 1 : 0.45}}/>
                  <span style={{fontSize:13, color: draft.useVisit ? C_INK : C_MUTED}}>회 이상</span>
                </div>
              </CgRow>
              <CgRow label="총결제액" hint={draft.payMode === 'range' ? '앞 금액부터 뒤 금액까지예요.' : '이 금액 이상 결제한 고객이에요.'}>
                <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
                  <CgCheck on={draft.usePay} onClick={() => patch({ usePay: !draft.usePay })}/>
                  <window.MktSeg size="sm" value={draft.payMode} onChange={v => patch({ payMode:v })} options={[
                    { id:'min', label:'이상' }, { id:'range', label:'구간' },
                  ]}/>
                  <input value={Number(cgDigits(draft.payMin) || 0).toLocaleString()} disabled={!draft.usePay} onChange={e => patch({ payMin: cgDigits(e.target.value) })} style={{...cgInput, width:140, textAlign:'right', opacity: draft.usePay ? 1 : 0.45}}/>
                  {draft.payMode === 'range' ? (
                    <>
                      <span style={{fontSize:13, color: draft.usePay ? C_INK : C_MUTED}}>원</span>
                      <span style={{fontSize:13, color:C_MUTED}}>~</span>
                      <input value={Number(cgDigits(draft.payMax) || 0).toLocaleString()} disabled={!draft.usePay} onChange={e => patch({ payMax: cgDigits(e.target.value) })} style={{...cgInput, width:140, textAlign:'right', opacity: draft.usePay ? 1 : 0.45}}/>
                      <span style={{fontSize:13, color: draft.usePay ? C_INK : C_MUTED}}>원</span>
                    </>
                  ) : (
                    <span style={{fontSize:13, color: draft.usePay ? C_INK : C_MUTED}}>원 이상</span>
                  )}
                </div>
              </CgRow>

              <div style={{marginTop:8, padding:'10px 12px', borderRadius:8, background:'#F8FAFF', border:'1px solid #E6EDF8', fontSize:12.5, color:C_INK}}>
                {draft.useVisit && draft.usePay ? '둘 다 맞는 고객 · ' : ''}{cgSummary(draft)}
                {previewN != null
                  ? <span style={{color:C_MUTED}}> · 지금 고객 <b style={{color:C_BLUE}}>{previewN.toLocaleString()}명</b></span>
                  : draft.period !== 'all'
                    ? <span style={{color:C_MUTED}}> · 이 기간 방문·결제는 매출이 연결되면 집계돼요</span>
                    : null}
              </div>
              {error && <div style={{marginTop:8, fontSize:12.5, color:'#DC2626', fontWeight:600}}>{error}</div>}

              <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop:16}}>
                <button onClick={() => { setDraft(null); setError(''); }} style={{...c_ghostBtn, padding:'8px 16px'}}>취소</button>
                <button onClick={save} style={{
                  padding:'8px 18px', background:C_BLUE, color:'#fff', border:'none', borderRadius:20,
                  fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                }}>저장</button>
              </div>
            </div>
          )}

          <div style={{background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:12, overflow:'hidden'}}>
            <div style={{display:'grid', gridTemplateColumns:'0.9fr 130px 2.2fr 90px 120px', gap:10, padding:'10px 16px', background:'#FBFCFE', borderBottom:`1px solid ${C_BORDER}`, fontSize:11, fontWeight:700, color:C_MUTED}}>
              <div>그룹 이름</div>
              <div>기간</div>
              <div>조건</div>
              <div style={{textAlign:'right'}}>해당 고객</div>
              <div/>
            </div>
            {groups.length === 0 && (
              <div style={{padding:'40px 16px', textAlign:'center', fontSize:13, color:C_MUTED}}>아직 그룹이 없어요. 오른쪽 위의 그룹 추가로 만들어 주세요.</div>
            )}
            {groups.map((g, i) => {
              const n = cgMatchCount(g);
              const on = draft && draft.id === g.id;
              return (
                <div key={g.id} style={{
                  display:'grid', gridTemplateColumns:'0.9fr 130px 2.2fr 90px 120px', gap:10, alignItems:'center',
                  padding:'12px 16px', borderTop: i ? '1px solid #EFF2F7' : 'none',
                  background: on ? C_BLUE_SOFT : C_SURFACE,
                }}>
                  <div style={{fontSize:13.5, fontWeight:700, color:C_INK}}>{g.name}</div>
                  <div style={{fontSize:12.5, color:C_INK}}>{cgPeriodLabel(g)}</div>
                  <div style={{display:'flex', alignItems:'center', gap:6, minWidth:0, flexWrap:'wrap'}}>
                    {g.useVisit && <CgTag kind="visit">방문 {Number(g.count).toLocaleString()}회 이상</CgTag>}
                    {g.usePay && <CgTag kind="pay">{cgPayLabel(g)}</CgTag>}
                    {!g.useVisit && !g.usePay && <span style={{fontSize:12.5, color:C_MUTED}}>조건 없음</span>}
                  </div>
                  <div style={{textAlign:'right', fontSize:13, fontWeight:700, color:C_INK, fontVariantNumeric:'tabular-nums'}}>
                    {n == null ? '기간 집계' : `${n.toLocaleString()}명`}
                  </div>
                  <div style={{display:'flex', justifyContent:'flex-end', gap:6}}>
                    {confirmId === g.id ? (
                      <>
                        <button onClick={() => remove(g.id)} style={{...c_ghostBtnSm, color:'#DC2626', borderColor:'#FECACA', fontFamily:'inherit'}}>삭제</button>
                        <button onClick={() => setConfirmId(null)} style={{...c_ghostBtnSm, fontFamily:'inherit'}}>취소</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => openEdit(g)} style={{...c_ghostBtnSm, fontFamily:'inherit'}}>수정</button>
                        <button onClick={() => setConfirmId(g.id)} style={{...c_ghostBtnSm, fontFamily:'inherit'}}>삭제</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function CgCheck({ on, onClick }) {
  return (
    <span onClick={onClick} style={{
      width:18, height:18, borderRadius:4, cursor:'pointer', flexShrink:0,
      border:`1.5px solid ${on ? C_BLUE : '#C3CCDA'}`,
      background: on ? C_BLUE : C_SURFACE,
      display:'inline-flex', alignItems:'center', justifyContent:'center', color:'#fff',
    }}>{on && <IconCheck size={12} stroke={3}/>}</span>
  );
}

function CgTag({ kind, children }) {
  const visit = kind === 'visit';
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', height:24, padding:'0 8px', borderRadius:12,
      fontSize:12, fontWeight:700, whiteSpace:'nowrap',
      background: visit ? '#EFF6FF' : '#ECFDF5',
      color: visit ? '#1D4ED8' : '#047857',
    }}>{children}</span>
  );
}

function CgRow({ label, required, hint, children }) {
  return (
    <div style={{display:'grid', gridTemplateColumns:'88px 1fr', gap:12, alignItems:'start', padding:'7px 0'}}>
      <div style={{fontSize:13, fontWeight:600, color:C_INK, paddingTop:8}}>
        {label}{required && <span style={{color:'#EF4444'}}> *</span>}
      </div>
      <div>
        {children}
        {hint && <div style={{fontSize:11.5, color:C_MUTED, marginTop:6}}>{hint}</div>}
      </div>
    </div>
  );
}

const cgInput = {
  height:36, padding:'0 12px', border:`1px solid ${C_BORDER}`, borderRadius:8,
  fontSize:13, color:C_INK, background:C_SURFACE, fontFamily:'inherit', outline:'none', width:280,
};
const cgSelect = {
  height:36, padding:'0 28px 0 12px', border:`1px solid ${C_BORDER}`, borderRadius:8,
  fontSize:13, color:C_INK, background:C_SURFACE, fontFamily:'inherit', outline:'none', cursor:'pointer',
};

window.C_CustomerGroupPage = C_CustomerGroupPage;
