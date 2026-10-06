// 마케팅 › 단체발송 — 고객 조회(타겟팅) + 결과 테이블 + 우측 작성 패널
const {
  C_BLUE, C_BLUE_SOFT, C_CORAL, C_INK, C_MUTED, C_BORDER, C_BG, C_SURFACE,
  c_ghostBtnSm,
  MKT_BALANCE, MKT_UNIT, MKT_DESIGNERS, MKT_CATS, MKT_CUSTOMERS, MKT_EMPTY_FILTER,
  MKT_DORMANT_OPTS, MKT_VPERIOD_PRESETS, MKT_RV_DAYS, MKT_CHANNELS, MKT_TICKET_CATS, mktDateStr, MKT_AGE_OPTS, MKT_GRADE_OPTS, MKT_SEGMENTS, MKT_TODAY,
  mktApplyFilter, mktFilterChips, mktClearChip,
} = window;
const MKT_DES_ALL = window.DESIGNERS;

const MKT_PAGE_SIZE = 12;

// ───── 작은 공용 요소 ─────
function MktPill({ on, onClick, children, tone }) {
  return (
    <button onClick={onClick} style={{
      padding:'5px 11px', fontSize:12, fontWeight: on ? 700 : 500, borderRadius:14,
      border:`1px solid ${on ? C_BLUE : C_BORDER}`,
      background: on ? C_BLUE_SOFT : C_SURFACE, color: on ? C_BLUE : C_INK,
      cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap',
      display:'inline-flex', alignItems:'center', gap:5,
    }}>
      {tone && <span style={{width:7, height:7, borderRadius:'50%', background:tone}}/>}
      {children}
    </button>
  );
}
function MktRange({ a, b, onA, onB, unit, w = 64, money }) {
  const fmt = (v) => money && v !== '' ? Number(v).toLocaleString() : v;
  const st = {
    width:w, height:30, padding:'0 8px', border:`1px solid ${C_BORDER}`, borderRadius:6,
    fontSize:12, color:C_INK, textAlign:'right', fontFamily:'inherit', outline:'none', fontVariantNumeric:'tabular-nums',
  };
  return (
    <div style={{display:'inline-flex', alignItems:'center', gap:5, fontSize:12, color:C_MUTED}}>
      <input value={fmt(a)} onChange={e => onA(e.target.value.replace(/[^0-9]/g,''))} placeholder="0" style={st}/>
      <span>~</span>
      <input value={fmt(b)} onChange={e => onB(e.target.value.replace(/[^0-9]/g,''))} placeholder="제한없음" style={st}/>
      <span>{unit}</span>
    </div>
  );
}
function MktRow({ label, children, top }) {
  return (
    <div style={{display:'grid', gridTemplateColumns:'84px 1fr', alignItems: top ? 'start' : 'center', minHeight:34}}>
      <div style={{fontSize:12, fontWeight:600, color:C_MUTED, paddingTop: top ? 6 : 0}}>{label}</div>
      <div style={{display:'flex', flexWrap:'wrap', gap:5, alignItems:'center'}}>{children}</div>
    </div>
  );
}
function MktCheck({ state, onClick }) { // state: true | false | 'mixed'
  const on = state === true || state === 'mixed';
  return (
    <span onClick={onClick} style={{
      width:16, height:16, borderRadius:4, cursor:'pointer', flexShrink:0,
      border:`1.5px solid ${on ? C_BLUE : '#C3CCDA'}`, background: on ? C_BLUE : C_SURFACE,
      display:'inline-flex', alignItems:'center', justifyContent:'center', color:'#fff',
    }}>
      {state === true && <IconCheck size={11} stroke={3}/>}
      {state === 'mixed' && <span style={{width:8, height:2, background:'#fff', borderRadius:1}}/>}
    </span>
  );
}

function mktFmtLast(days) {
  const d = new Date(MKT_TODAY); d.setDate(d.getDate() - days);
  return `${String(d.getFullYear()).slice(2)}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
}

// ───────── 페이지 ─────────
function C_MktBulkPage() {
  const [f, setF] = React.useState(() => ({ ...MKT_EMPTY_FILTER, birth:'this' }));
  const [seg, setSeg] = React.useState('birth');
  const [open, setOpen] = React.useState(true);
  const [mode, setMode] = React.useState('all'); // all | picked
  const [picked, setPicked] = React.useState(() => new Set());
  const [pg, setPg] = React.useState(0);
  const [sort, setSort] = React.useState({ k:'lastDays', dir:1 });
  const [confirm, setConfirm] = React.useState(null);
  const [toast, setToast] = React.useState(null);

  const set = (patch) => { setF(prev => ({ ...prev, ...patch })); setSeg(null); setPg(0); };
  const toggleIn = (key, v) => set({ [key]: f[key].includes(v) ? f[key].filter(x => x !== v) : [...f[key], v] });

  const result = React.useMemo(() => {
    const r = mktApplyFilter(MKT_CUSTOMERS, f);
    const { k, dir } = sort;
    return r.slice().sort((a, b) => (a[k] > b[k] ? 1 : a[k] < b[k] ? -1 : 0) * dir);
  }, [f, sort]);
  const chips = mktFilterChips(f);

  // 선택은 현재 결과 안에서만 유효
  const pickedInResult = React.useMemo(() => result.filter(c => picked.has(c.id)), [result, picked]);
  const targetList = mode === 'all' ? result : pickedInResult;
  const recipients = {
    count: targetList.length,
    countConsent: targetList.filter(c => c.consent).length,
    modeLabel: mode === 'all' ? '조회된 고객 전체' : '선택한 고객',
    chips,
  };

  const pages = Math.max(1, Math.ceil(result.length / MKT_PAGE_SIZE));
  const rows = result.slice(pg * MKT_PAGE_SIZE, (pg + 1) * MKT_PAGE_SIZE);
  const pageAllOn = rows.length > 0 && rows.every(c => picked.has(c.id));
  const pageSomeOn = rows.some(c => picked.has(c.id));

  const togglePick = (id) => {
    setPicked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    setMode('picked');
  };
  const togglePage = () => {
    setPicked(prev => {
      const n = new Set(prev);
      if (pageAllOn) rows.forEach(c => n.delete(c.id)); else rows.forEach(c => n.add(c.id));
      return n;
    });
    setMode('picked');
  };

  const applySeg = (s) => {
    setF({ ...MKT_EMPTY_FILTER, ...s.patch }); setSeg(s.id); setPg(0);
  };
  const reset = () => { setF(MKT_EMPTY_FILTER); setSeg('all'); setPg(0); };

  const sortBy = (k) => setSort(s => s.k === k ? { k, dir: -s.dir } : { k, dir: k === 'lastDays' ? 1 : -1 });

  const cols = '20px 1.15fr 1.2fr 0.8fr 1fr 0.5fr 0.95fr 0.95fr 0.55fr';
  const desName = (id) => (MKT_DES_ALL.find(d => d.id === id) || {}).name || '미지정';
  const desColor = (id) => (MKT_DES_ALL.find(d => d.id === id) || {}).color || '#94A3B8';

  const SortHead = ({ k, children, right }) => (
    <div onClick={() => sortBy(k)} style={{cursor:'pointer', textAlign: right ? 'right' : 'left', userSelect:'none', color: sort.k === k ? C_INK : C_MUTED}}>
      {children}{sort.k === k && <span style={{marginLeft:3, fontSize:9}}>{(k === 'lastDays' ? -sort.dir : sort.dir) > 0 ? '▲' : '▼'}</span>}
    </div>
  );

  return (
    <div style={{flex:1, display:'flex', minWidth:0, minHeight:0, overflow:'hidden', background:C_BG}}>
      {/* ───── 좌: 조회 ───── */}
      <div style={{flex:1, minWidth:0, display:'flex', flexDirection:'column', minHeight:0}}>
        {/* 서브헤더 */}
        <div style={{display:'flex', alignItems:'center', gap:8, padding:'10px 14px', background:C_SURFACE, borderBottom:`1px solid ${C_BORDER}`, minHeight:49}}>
          <div style={{fontSize:12.5, color:C_MUTED}}>
            홈 <span style={{margin:'0 6px'}}>›</span>마케팅<span style={{margin:'0 6px'}}>›</span>
            <span style={{color:C_INK, fontWeight:600}}>단체발송</span>
          </div>
          <div style={{flex:1}}/>
          <button style={{...c_ghostBtnSm, fontFamily:'inherit'}}>발신번호 관리</button>
          <button onClick={() => window.__goPage && window.__goPage('mkt-report')} style={{...c_ghostBtnSm, fontFamily:'inherit'}}>발송 내역</button>
        </div>

        <div className="mkt-scroll" style={{flex:1, overflow:'auto', padding:'16px 18px 20px', display:'flex', flexDirection:'column', gap:12}}>
          <style>{`.mkt-scroll > * { flex-shrink: 0; }`}</style>
          {/* 잔액 스트립 */}
          <div style={{
            display:'flex', alignItems:'stretch', background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:10, overflow:'hidden',
          }}>
            <div style={{padding:'12px 16px', display:'flex', alignItems:'center', gap:12, borderRight:`1px solid ${C_BORDER}`}}>
              <div>
                <div style={{fontSize:11, fontWeight:600, color:C_MUTED}}>문자 캐쉬 잔액</div>
                <div style={{fontSize:20, fontWeight:800, color:C_INK, letterSpacing:'-0.02em', fontVariantNumeric:'tabular-nums', marginTop:1}}>
                  {MKT_BALANCE.toLocaleString()}<span style={{fontSize:13, fontWeight:600, color:C_MUTED, marginLeft:2}}>원</span>
                </div>
              </div>
              <button onClick={() => window.__goPage && window.__goPage('mkt-charge')} style={{
                height:30, padding:'0 12px', border:'none', borderRadius:7, background:C_BLUE, color:'#fff',
                fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
              }}>충전</button>
            </div>
            {['alimtalk','sms','lms','mms'].map((k, i) => {
              const u = MKT_UNIT[k];
              return (
                <div key={k} style={{flex:1, padding:'12px 14px', borderLeft: i ? `1px solid ${C_BORDER}` : 'none'}}>
                  <div style={{fontSize:11, color:C_MUTED, display:'flex', alignItems:'center', gap:5}}>
                    <span style={{width:7, height:7, borderRadius:2, background:u.color}}/>{u.label} · {u.price}원
                  </div>
                  <div style={{fontSize:14, fontWeight:700, color:C_INK, marginTop:4, fontVariantNumeric:'tabular-nums'}}>
                    {Math.floor(MKT_BALANCE / u.price).toLocaleString()}<span style={{fontSize:11.5, fontWeight:500, color:C_MUTED, marginLeft:2}}>건</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 조회 카드 */}
          <div style={{background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:10}}>
            {/* 빠른 타겟 */}
            <div style={{padding:'12px 14px', display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', borderBottom: open ? `1px solid ${C_BORDER}` : 'none'}}>
              <span style={{fontSize:12, fontWeight:700, color:C_INK, marginRight:4}}>빠른 타겟</span>
              {MKT_SEGMENTS.map(s => (
                <MktPill key={s.id} on={seg === s.id} onClick={() => applySeg(s)}>{s.label}</MktPill>
              ))}
              <div style={{flex:1}}/>
              <button onClick={() => setOpen(o => !o)} style={{
                border:'none', background:'transparent', color:C_BLUE, fontSize:12, fontWeight:600, cursor:'pointer',
                display:'inline-flex', alignItems:'center', gap:3, fontFamily:'inherit',
              }}>상세 조건 {open ? <IconChevronU size={13}/> : <IconChevronD size={13}/>}</button>
            </div>

            {open && (
              <>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', columnGap:20}}>
                {/* 고객 정보 */}
                <div style={{padding:'12px 14px', display:'flex', flexDirection:'column', gap:6, borderRight:`1px solid ${C_BORDER}`}}>
                  <div style={mktSecTitle}>고객 정보</div>
                  <MktRow label="검색">
                    <MktSearchInput value={f.q} onChange={v => set({ q:v })} placeholder="이름 또는 전화번호"/>
                  </MktRow>
                  <MktRow label="메모">
                    <MktSearchInput value={f.memo} onChange={v => set({ memo:v })} placeholder="메모 키워드"/>
                    <MktPill on={f.memoOnly} onClick={() => set({ memoOnly: !f.memoOnly })}>메모 있음</MktPill>
                  </MktRow>
                  <MktRow label="성별">
                    {[['all','전체'],['F','여성'],['M','남성']].map(([v,l]) => <MktPill key={v} on={f.gender===v} onClick={() => set({gender:v})}>{l}</MktPill>)}
                  </MktRow>
                  <MktRow label="연령대">
                    {MKT_AGE_OPTS.map(a => <MktPill key={a} on={f.ages.includes(a)} onClick={() => toggleIn('ages', a)}>{a === 60 ? '60대+' : `${a}대`}</MktPill>)}
                  </MktRow>
                  <MktRow label="생일">
                    {[['all','전체'],['this','이번 달'],['next','다음 달']].map(([v,l]) => <MktPill key={v} on={f.birth===v} onClick={() => set({birth:v})}>{l}</MktPill>)}
                  </MktRow>
                  <MktRow label="고객 등급">
                    {MKT_GRADE_OPTS.map(g => <MktPill key={g} on={f.grades.includes(g)} onClick={() => toggleIn('grades', g)}>{g}</MktPill>)}
                  </MktRow>
                </div>
                {/* 방문 · 시술 · 결제 */}
                <div style={{padding:'12px 14px 12px 0', display:'flex', flexDirection:'column', gap:6}}>
                  <div style={mktSecTitle}>방문 · 시술 · 결제</div>
                  <MktRow label="방문 기간" top>
                    <div style={{display:'flex', flexDirection:'column', gap:5, width:'100%'}}>
                      <div style={{display:'flex', alignItems:'center', gap:5}}>
                        <input type="date" value={f.vFrom} onChange={e => set({ vFrom:e.target.value })} style={mktDate}/>
                        <span style={{fontSize:12, color:C_MUTED}}>~</span>
                        <input type="date" value={f.vTo} onChange={e => set({ vTo:e.target.value })} style={mktDate}/>
                      </div>
                      <div style={{display:'flex', gap:4}}>
                        {MKT_VPERIOD_PRESETS.map(p => {
                          const on = f.vFrom === mktDateStr(p.days) && f.vTo === mktDateStr(0);
                          return <MktPill key={p.id} on={on} onClick={() => set(on ? { vFrom:'', vTo:'' } : { vFrom:mktDateStr(p.days), vTo:mktDateStr(0) })}>최근 {p.label}</MktPill>;
                        })}
                      </div>
                    </div>
                  </MktRow>
                  <MktRow label="휴면">
                    {MKT_DORMANT_OPTS.map(o => <MktPill key={o.id} on={f.dormant===o.id} onClick={() => set({ dormant:o.id })}>{o.label}</MktPill>)}
                    <span style={{fontSize:11, color:C_MUTED}}>이상 미방문</span>
                  </MktRow>
                  <MktRow label="담당자" top>
                    <MktDesignerPicker value={f.designers} onChange={v => set({ designers:v })}/>
                  </MktRow>
                  <MktRow label="시술 이력" top>
                    {MKT_CATS.map(c => <MktPill key={c.id} tone={c.color} on={f.cats.includes(c.id)} onClick={() => toggleIn('cats', c.id)}>{c.name}</MktPill>)}
                  </MktRow>
                  <MktRow label="방문 횟수">
                    <MktRange a={f.visitMin} b={f.visitMax} onA={v => set({visitMin:v})} onB={v => set({visitMax:v})} unit="회"/>
                  </MktRow>
                  <MktRow label="누적 결제">
                    <MktRange a={f.paidMin} b={f.paidMax} onA={v => set({paidMin:v})} onB={v => set({paidMax:v})} unit="만원"/>
                  </MktRow>
                </div>
              </div>

              {/* 보유 혜택 */}
              <div style={{borderTop:`1px solid ${C_BORDER}`, display:'grid', gridTemplateColumns:'1fr 1fr', columnGap:20}}>
                <div style={{padding:'12px 14px', display:'flex', flexDirection:'column', gap:6, borderRight:`1px solid ${C_BORDER}`}}>
                  <div style={mktSecTitle}>정액권 · 포인트</div>
                  <MktRow label="정액권 잔액" top>
                    <div style={{display:'flex', flexDirection:'column', gap:5}}>
                      <div style={{display:'flex', gap:4}}>
                        {[['all','전체'],['yes','있음'],['no','없음'],['range','금액 지정']].map(([v,l]) => (
                          <MktPill key={v} on={f.balance===v} onClick={() => set({ balance:v, ...(v !== 'range' ? { balMin:'', balMax:'' } : {}) })}>{l}</MktPill>
                        ))}
                      </div>
                      {f.balance === 'range' && (
                        <MktRange money a={f.balMin} b={f.balMax} onA={v => set({balMin:v})} onB={v => set({balMax:v})} unit="원" w={96}/>
                      )}
                    </div>
                  </MktRow>
                  <MktRow label="포인트">
                    <MktPill on={f.pointMin===''} onClick={() => set({pointMin:''})}>전체</MktPill>
                    {['5000','10000','30000'].map(v => (
                      <MktPill key={v} on={f.pointMin===v} onClick={() => set({pointMin: f.pointMin===v ? '' : v})}>{Number(v)/10000 >= 1 ? Number(v)/10000 + '만' : Number(v)/1000 + '천'}P+</MktPill>
                    ))}
                  </MktRow>
                </div>
                <div style={{padding:'12px 14px 12px 0', display:'flex', flexDirection:'column', gap:6}}>
                  <div style={mktSecTitle}>티켓 (회수권 · 이용권)</div>
                  <MktRow label="티켓 보유">
                    {[['all','전체'],['yes','보유'],['no','미보유']].map(([v,l]) => (
                      <MktPill key={v} on={f.ticketHave===v} onClick={() => set({ ticketHave:v, ...(v !== 'yes' ? { ticketCats:[], ticketMin:'', ticketMax:'' } : {}) })}>{l}</MktPill>
                    ))}
                  </MktRow>
                  {f.ticketHave === 'yes' && (
                    <>
                      <MktRow label="티켓 종류" top>
                        {MKT_TICKET_CATS.map(c => <MktPill key={c.id} tone={c.color} on={f.ticketCats.includes(c.id)} onClick={() => toggleIn('ticketCats', c.id)}>{c.name}</MktPill>)}
                      </MktRow>
                      <MktRow label="잔여 횟수">
                        <MktRange a={f.ticketMin} b={f.ticketMax} onA={v => set({ticketMin:v})} onB={v => set({ticketMax:v})} unit="회"/>
                      </MktRow>
                    </>
                  )}
                </div>
              </div>

              {/* 첫 방문 후 미재방문 */}
              <MktRevisitBlock f={f} set={set} toggleIn={toggleIn}/>
              </>
            )}
          </div>

          {/* 결과 */}
          <div style={{background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:10, overflow:'hidden'}}>
            {/* 결과 헤더 */}
            <div style={{padding:'12px 14px', display:'flex', alignItems:'center', gap:10, borderBottom:`1px solid ${C_BORDER}`}}>
              <div style={{fontSize:13, color:C_INK}}>
                조회 결과 <b style={{fontSize:15, fontWeight:800, color:C_BLUE, fontVariantNumeric:'tabular-nums'}}>{result.length.toLocaleString()}</b>명
                <span style={{fontSize:11.5, color:C_MUTED, marginLeft:6}}>/ 전체 {MKT_CUSTOMERS.length.toLocaleString()}명</span>
              </div>
              <div style={{flex:1}}/>
              <window.MktSeg size="sm" value={mode} onChange={setMode} options={[
                { id:'all', label:`조회된 전체 ${result.length.toLocaleString()}` },
                { id:'picked', label:`선택 ${pickedInResult.length.toLocaleString()}`, disabled: pickedInResult.length === 0 },
              ]}/>
            </div>

            {/* 적용 조건 칩 */}
            {chips.length > 0 && (
              <div style={{padding:'8px 14px', display:'flex', alignItems:'center', gap:5, flexWrap:'wrap', background:'#FBFCFE', borderBottom:`1px solid ${C_BORDER}`}}>
                {chips.map(c => (
                  <span key={c.key} style={{
                    display:'inline-flex', alignItems:'center', gap:4, padding:'3px 5px 3px 9px', borderRadius:12,
                    background:C_SURFACE, border:`1px solid ${C_BORDER}`, fontSize:11.5, color:C_INK, fontWeight:500,
                  }}>
                    {c.label}
                    <button onClick={() => { setF(prev => mktClearChip(prev, c.key)); setSeg(null); setPg(0); }} style={{
                      width:16, height:16, border:'none', borderRadius:'50%', background:'#EEF1F6', color:C_MUTED,
                      cursor:'pointer', display:'inline-flex', alignItems:'center', justifyContent:'center', padding:0,
                    }}><IconX size={9} stroke={2.4}/></button>
                  </span>
                ))}
                <button onClick={reset} style={{border:'none', background:'transparent', color:C_MUTED, fontSize:11.5, cursor:'pointer', textDecoration:'underline', fontFamily:'inherit'}}>조건 초기화</button>
              </div>
            )}

            {/* 테이블 헤더 */}
            <div style={{
              display:'grid', gridTemplateColumns:cols, alignItems:'center', gap:8,
              padding:'9px 14px', background:'#FBFCFE', borderBottom:`1px solid ${C_BORDER}`,
              fontSize:11, fontWeight:700, color:C_MUTED,
            }}>
              <MktCheck state={pageAllOn ? true : pageSomeOn ? 'mixed' : false} onClick={togglePage}/>
              <div>고객명</div>
              <div>연락처</div>
              <div>담당</div>
              <SortHead k="lastDays">최근 방문</SortHead>
              <SortHead k="visits" right>방문</SortHead>
              <SortHead k="totalPaid" right>누적 결제</SortHead>
              <SortHead k="ticket" right>정액권 · 티켓</SortHead>
              <div style={{textAlign:'center'}}>광고수신</div>
            </div>
            {rows.length === 0 ? (
              <div style={{padding:'44px 14px', textAlign:'center'}}>
                <div style={{fontSize:13, fontWeight:600, color:C_INK}}>조건에 맞는 고객이 없어요</div>
                <div style={{fontSize:12, color:C_MUTED, marginTop:4}}>조건을 하나씩 지워 보세요.</div>
              </div>
            ) : rows.map((c, i) => {
              const on = picked.has(c.id);
              return (
                <div key={c.id} onClick={() => togglePick(c.id)} style={{
                  display:'grid', gridTemplateColumns:cols, alignItems:'center', gap:8,
                  padding:'9px 14px', fontSize:12.5, color:C_INK, cursor:'pointer',
                  borderTop: i ? `1px solid #EFF2F7` : 'none',
                  background: on ? '#F5F8FE' : C_SURFACE,
                }}>
                  <MktCheck state={on} onClick={e => { e.stopPropagation(); togglePick(c.id); }}/>
                  <div style={{display:'flex', alignItems:'center', gap:6, minWidth:0}}>
                    <span style={{fontWeight:600, whiteSpace:'nowrap'}}>{c.name}</span>
                    {c.memo && <span title={c.memo} style={{display:'inline-flex', color:'#94A3B8'}}><IconNote size={12}/></span>}
                    {c.grade !== '일반' && <span style={{
                      fontSize:9.5, fontWeight:800, padding:'1px 5px', borderRadius:4,
                      background: c.grade === 'VVIP' ? '#FDF2F8' : '#FEF3C7', color: c.grade === 'VVIP' ? '#BE185D' : '#B45309',
                    }}>{c.grade}</span>}
                  </div>
                  <div style={{color:C_MUTED, fontVariantNumeric:'tabular-nums'}}>{c.phone}</div>
                  <div style={{display:'flex', alignItems:'center', gap:5, whiteSpace:'nowrap'}}>
                    <span style={{width:6, height:6, borderRadius:'50%', background:desColor(c.designer)}}/>{desName(c.designer)}
                  </div>
                  <div style={{fontVariantNumeric:'tabular-nums'}}>
                    {mktFmtLast(c.lastDays)}
                    <span style={{fontSize:10.5, marginLeft:4, color: c.lastDays >= 90 ? '#C2410C' : C_MUTED}}>
                      {c.lastDays === 0 ? '오늘' : c.lastDays >= 365 ? `${Math.floor(c.lastDays/365)}년+` : `${c.lastDays}일`}
                    </span>
                  </div>
                  <div style={{textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{c.visits}회</div>
                  <div style={{textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{c.totalPaid.toLocaleString()}</div>
                  <div style={{textAlign:'right', fontVariantNumeric:'tabular-nums', lineHeight:1.3}}>
                    {!c.ticket && !c.tickets.length && <span style={{color:'#B6C0CF'}}>-</span>}
                    {c.ticket > 0 && <div>{c.ticket.toLocaleString()}</div>}
                    {c.tickets.map((t, k) => <div key={k} style={{fontSize:10.5, color:C_MUTED}}>{(MKT_TICKET_CATS.find(x => x.id === t.cat) || {}).name} {t.left}회</div>)}
                  </div>
                  <div style={{textAlign:'center'}}>
                    {c.consent
                      ? <span style={{fontSize:10.5, fontWeight:700, color:'#047857'}}>동의</span>
                      : <span style={{fontSize:10.5, fontWeight:700, color:C_CORAL}}>거부</span>}
                  </div>
                </div>
              );
            })}

            {/* 페이지네이션 */}
            <div style={{display:'flex', alignItems:'center', gap:6, padding:'10px 14px', borderTop:`1px solid ${C_BORDER}`, background:'#FBFCFE'}}>
              <span style={{fontSize:11.5, color:C_MUTED, fontVariantNumeric:'tabular-nums'}}>
                {result.length ? `${(pg*MKT_PAGE_SIZE+1).toLocaleString()}–${Math.min(result.length,(pg+1)*MKT_PAGE_SIZE).toLocaleString()}` : 0} / {result.length.toLocaleString()}
              </span>
              {pickedInResult.length > 0 && (
                <button onClick={() => { setPicked(new Set()); setMode('all'); }} style={{border:'none', background:'transparent', color:C_MUTED, fontSize:11.5, cursor:'pointer', textDecoration:'underline', fontFamily:'inherit'}}>선택 해제</button>
              )}
              <div style={{flex:1}}/>
              <button disabled={pg === 0} onClick={() => setPg(p => p - 1)} style={{...mktPager, opacity: pg === 0 ? 0.4 : 1}}><IconChevronL size={13}/></button>
              <span style={{fontSize:12, fontWeight:600, color:C_INK, minWidth:56, textAlign:'center', fontVariantNumeric:'tabular-nums'}}>{pg+1} / {pages}</span>
              <button disabled={pg >= pages - 1} onClick={() => setPg(p => p + 1)} style={{...mktPager, opacity: pg >= pages - 1 ? 0.4 : 1}}><IconChevronR size={13}/></button>
            </div>
          </div>
        </div>
      </div>

      {/* ───── 우: 작성 ───── */}
      <window.C_MktComposer
        recipients={recipients}
        previewList={targetList.slice(0, 30)}
        onRequestSend={(p) => setConfirm(p)}
      />

      {confirm && (
        <window.C_MktSendConfirm
          payload={confirm} recipients={recipients}
          onClose={() => setConfirm(null)}
          onConfirm={() => { setConfirm(null); setPicked(new Set()); setMode('all'); }}
        />
      )}
    </div>
  );
}

function MktSearchInput({ value, onChange, placeholder }) {
  return (
    <div style={{position:'relative', flex:1, minWidth:150}}>
      <IconSearch size={13} style={{position:'absolute', left:9, top:9, color:C_MUTED}}/>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{
        width:'100%', height:30, padding:'0 10px 0 28px', border:`1px solid ${C_BORDER}`, borderRadius:6,
        fontSize:12, color:C_INK, fontFamily:'inherit', outline:'none',
      }}/>
    </div>
  );
}

// 첫 방문 후 미재방문 — 기준 상세 설정
function MktRevisitBlock({ f, set, toggleIn }) {
  const on = f.revisit === 'none';
  const numSt = {
    width:52, height:30, padding:'0 8px', border:`1px solid ${C_BORDER}`, borderRadius:6,
    fontSize:12.5, fontWeight:700, color:C_INK, textAlign:'center', fontFamily:'inherit', outline:'none', fontVariantNumeric:'tabular-nums',
  };
  return (
    <div style={{borderTop:`1px solid ${C_BORDER}`, background: on ? '#F8FAFF' : C_SURFACE}}>
      <div style={{padding:'12px 14px', display:'flex', alignItems:'center', gap:10}}>
        <div style={{flex:1}}>
          <div style={{fontSize:12.5, fontWeight:700, color:C_INK}}>첫 방문 후 미재방문</div>
          <div style={{fontSize:11.5, color:C_MUTED, marginTop:2}}>
            방문 이력이 <b style={{color:C_INK}}>딱 1회</b>뿐이고, 첫 방문일로부터 설정한 기간이 지나도록 <b style={{color:C_INK}}>다시 오지 않은</b> 고객을 찾아요.
          </div>
        </div>
        <window.MktToggle checked={on} onChange={() => set(on
          ? { revisit:'all', rvDays:'30', rvDaysMax:'', rvChannels:[], rvCats:[] }
          : { revisit:'none' })}/>
      </div>
      {on && (
        <div style={{padding:'0 14px 14px', display:'flex', flexDirection:'column', gap:8}}>
          <div style={{
            display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', fontSize:12.5, color:C_INK,
            padding:'10px 12px', background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:8,
          }}>
            <span>첫 방문일로부터</span>
            <input value={f.rvDays} onChange={e => set({ rvDays:e.target.value.replace(/[^0-9]/g,'') })} style={numSt}/>
            <span>일 이상</span>
            <span style={{color:C_MUTED}}>~</span>
            <input value={f.rvDaysMax} onChange={e => set({ rvDaysMax:e.target.value.replace(/[^0-9]/g,'') })} placeholder="제한없음" style={{...numSt, width:72, fontWeight:500}}/>
            <span>일 이하 지났는데 재방문 없음</span>
            <div style={{flex:1}}/>
            {MKT_RV_DAYS.map(d => (
              <MktPill key={d} on={f.rvDays === d && !f.rvDaysMax} onClick={() => set({ rvDays:d, rvDaysMax:'' })}>{d}일</MktPill>
            ))}
          </div>
          <MktRow label="첫 방문 경로">
            {MKT_CHANNELS.map(c => <MktPill key={c.id} tone={c.color} on={f.rvChannels.includes(c.id)} onClick={() => toggleIn('rvChannels', c.id)}>{c.label}</MktPill>)}
            <span style={{fontSize:11, color:C_MUTED}}>미선택 시 전체</span>
          </MktRow>
          <MktRow label="첫 방문 시술" top>
            {MKT_CATS.map(c => <MktPill key={c.id} tone={c.color} on={f.rvCats.includes(c.id)} onClick={() => toggleIn('rvCats', c.id)}>{c.name}</MktPill>)}
          </MktRow>
          <div style={{fontSize:11, color:C_MUTED, lineHeight:1.5, paddingLeft:84}}>
            예) 30일 이상 · 온라인 · 컷&드라이 → 네이버로 처음 와서 커트만 하고 한 달 넘게 안 온 고객
          </div>
        </div>
      )}
    </div>
  );
}

// 담당자 다중 선택 (접힘: 칩 요약 → 펼침: 전체)
function MktDesignerPicker({ value, onChange }) {
  const [exp, setExp] = React.useState(false);
  const list = [...MKT_DESIGNERS, { id:'unassigned', name:'미지정', color:'#94A3B8' }];
  const shown = exp ? list : list.slice(0, 6);
  const tog = (id) => onChange(value.includes(id) ? value.filter(x => x !== id) : [...value, id]);
  return (
    <>
      {shown.map(d => <MktPill key={d.id} tone={d.color} on={value.includes(d.id)} onClick={() => tog(d.id)}>{d.name}</MktPill>)}
      <button onClick={() => setExp(e => !e)} style={{border:'none', background:'transparent', color:C_BLUE, fontSize:11.5, fontWeight:600, cursor:'pointer', fontFamily:'inherit'}}>
        {exp ? '접기' : `+${list.length - 6}명`}
      </button>
    </>
  );
}

const mktSecTitle = { fontSize:11, fontWeight:700, color:C_INK, letterSpacing:'0.02em', marginBottom:2 };
const mktDate = {
  height:30, padding:'0 8px', border:`1px solid ${C_BORDER}`, borderRadius:6,
  fontSize:12, color:C_INK, background:C_SURFACE, fontFamily:'inherit', outline:'none', width:132,
};
const mktSelect = {
  height:30, padding:'0 8px', border:`1px solid ${C_BORDER}`, borderRadius:6,
  fontSize:12, color:C_INK, background:C_SURFACE, fontFamily:'inherit', outline:'none', minWidth:150,
};
const mktPager = {
  width:26, height:26, display:'flex', alignItems:'center', justifyContent:'center',
  border:`1px solid ${C_BORDER}`, borderRadius:5, background:C_SURFACE, color:C_INK, cursor:'pointer', padding:0,
};

window.C_MktBulkPage = C_MktBulkPage;
