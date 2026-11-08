// 모바일 — 예약현황, 매출내역, 일별·월별 매출, 담당자 대체, 매출 분석
const {
  C_BLUE, C_BLUE_SOFT, C_INK, C_MUTED, C_BORDER, C_BG, C_SURFACE,
} = window;

function mRo(name) {
  const c = name.charCodeAt(name.length - 1);
  const jong = c >= 0xac00 && c <= 0xd7a3 ? (c - 0xac00) % 28 : 0;
  return name + (jong ? '으로' : '로');
}
function mWon(n) {
  return new Intl.NumberFormat('ko-KR').format(Math.round(n || 0));
}
function mPad(n) { return String(n).padStart(2, '0'); }

const M_MENUS = [
  { name:'커트', duration:30 },
  { name:'남성컷', duration:30 },
  { name:'염색', duration:90 },
  { name:'펌', duration:120 },
  { name:'클리닉', duration:60 },
  { name:'드라이', duration:30 },
  { name:'헤어스파', duration:60 },
];
const M_REASONS = ['점심 휴식', '교육', '개인 사정', '외부 미팅'];
const M_PAY = [
  { id:'card', name:'카드', color:'#4F46E5' },
  { id:'cash', name:'현금', color:'#10B981' },
  { id:'bank', name:'계좌이체', color:'#0EA5E9' },
  { id:'naver', name:'네이버페이', color:'#03A94D' },
  { id:'gift', name:'상품권', color:'#F59E0B' },
];
const M_CAT = { cut:'커트', color:'염색', perm:'펌', clinic:'클리닉', product:'제품' };
const M_WD = ['일', '월', '화', '수', '목', '금', '토'];
const M_HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

function mHour(r) {
  return M_HOURS[(r.day * 3 + (r.designer || '').length) % M_HOURS.length];
}
function mPayOf(r) {
  return Object.values(r.pay || {}).reduce((a, b) => a + b, 0);
}

function MSheet({ children, onClose }) {
  return (
    <div onClick={onClose} style={{
      position:'absolute', inset:0, background:'rgba(15,23,42,0.45)',
      zIndex:40, display:'flex', alignItems:'flex-end',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width:'100%', maxHeight:'86%', overflow:'auto',
        background:'#fff', borderRadius:'18px 18px 0 0',
        padding:'14px 16px 22px',
      }}>
        <div style={{width:36, height:4, borderRadius:2, background:'#E2E8F0', margin:'0 auto 12px'}}/>
        {children}
      </div>
    </div>
  );
}

function MBoard() {
  const designers = (window.DESIGNERS || []).filter(d => d.id !== 'unassigned');
  const [desId, setDesId] = React.useState(designers[0] ? designers[0].id : 'moon');
  const [items, setItems] = React.useState(() => (window.RESERVATIONS || []).map(r => ({ ...r })));
  const [sheet, setSheet] = React.useState(null);
  const [toast, setToast] = React.useState('');
  const designer = designers.find(d => d.id === desId) || designers[0];
  const mine = items.filter(r => r.designer === desId && r.status !== 'cancelled');
  const dayoff = mine.find(r => r.type === 'block' && r.blockType === 'dayoff');
  const slots = [];
  for (let m = window.DAY_START; m < window.DAY_END; m += window.SLOT_MIN) slots.push(m);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const at = (min) => mine.find(r => {
    const s = window.timeToMin(r.start);
    return min >= s && min < s + r.duration;
  });
    const clash = (start, duration, designerId) => items.some(r => {
    if (r.designer !== designerId || r.status === 'cancelled') return false;
    const a = window.timeToMin(start);
    const b = window.timeToMin(r.start);
    return a < b + r.duration && b < a + duration;
  });

  const openEmpty = (min) => {
    if (dayoff) return;
    setSheet({ mode:'pick', start: window.minToTime(min), designer: desId });
  };

  return (
    <div style={{display:'flex', flexDirection:'column', minHeight:0, flex:1}}>
      <div style={{padding:'12px 16px 8px', background:'#fff'}}>
        <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between'}}>
          <div style={{fontSize:18, fontWeight:800, letterSpacing:'-0.03em'}}>예약현황</div>
          <div style={{fontSize:12, color:C_MUTED, fontWeight:700}}>2026.09.21</div>
        </div>
        <div style={{fontSize:12, color:C_MUTED, marginTop:2}}>빈 시간을 누르면 예약 등록 또는 예약불가를 넣을 수 있어요.</div>
      </div>
      <div style={{display:'flex', gap:6, overflowX:'auto', padding:'8px 16px 10px', background:'#fff', borderBottom:`1px solid ${C_BORDER}`}}>
        {designers.map(d => {
          const on = d.id === desId;
          const n = items.filter(r => r.designer === d.id && !r.type && r.status !== 'cancelled').length;
          return (
            <button key={d.id} onClick={() => setDesId(d.id)} style={{
              flexShrink:0, border: on ? `1px solid ${C_BLUE}` : `1px solid ${C_BORDER}`,
              background: on ? C_BLUE_SOFT : '#fff', color: on ? C_BLUE : C_INK,
              borderRadius:16, padding:'6px 10px', fontSize:12, fontWeight:700, fontFamily:'inherit', cursor:'pointer',
            }}>
              <span style={{display:'inline-block', width:6, height:6, borderRadius:'50%', background:d.color, marginRight:5}}/>
              {d.name}
              <span style={{marginLeft:4, color: on ? C_BLUE : C_MUTED, fontWeight:600}}>{n}</span>
            </button>
          );
        })}
      </div>
      <div style={{flex:1, overflow:'auto', padding:'8px 12px 16px'}}>
        {dayoff ? (
          <div style={{
            margin:8, padding:'28px 16px', borderRadius:14, textAlign:'center',
            background:'repeating-linear-gradient(-45deg, #E2E8F0 0, #E2E8F0 8px, #F1F5F9 8px, #F1F5F9 16px)',
            color:'#334155', fontWeight:800,
          }}>휴무 · {dayoff.reason || dayoff.label}</div>
        ) : slots.map(min => {
          const hit = at(min);
          const startMin = hit ? window.timeToMin(hit.start) : min;
          if (hit && startMin !== min) return null;
          const h = hit ? Math.max(52, hit.duration / 30 * 52) : 52;
          if (!hit) {
            return (
              <button key={min} onClick={() => openEmpty(min)} style={{
                width:'100%', display:'flex', gap:10, alignItems:'center',
                border:'none', borderBottom:`1px solid ${C_BORDER}`, background:'transparent',
                padding:'0 6px', height:h, cursor:'pointer', fontFamily:'inherit', textAlign:'left',
              }}>
                <div style={{width:46, fontSize:12, fontWeight:700, color:C_MUTED, fontVariantNumeric:'tabular-nums'}}>{window.minToTime(min)}</div>
                <div style={{flex:1, fontSize:12.5, color:'#94A3B8'}}>비어 있음</div>
                <div style={{fontSize:18, color:C_BLUE, fontWeight:500}}>+</div>
              </button>
            );
          }
          if (hit.type === 'block') {
            return (
              <div key={hit.id} style={{
                display:'flex', gap:10, alignItems:'center', minHeight:h,
                borderBottom:`1px solid ${C_BORDER}`, padding:'8px 6px',
                background:'repeating-linear-gradient(-45deg, #FFF1F2 0, #FFF1F2 6px, #FFE4E6 6px, #FFE4E6 12px)',
              }}>
                <div style={{width:46, fontSize:12, fontWeight:800, color:'#BE123C', fontVariantNumeric:'tabular-nums'}}>{hit.start}</div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:12.5, fontWeight:800, color:'#9F1239'}}>예약불가</div>
                  <div style={{fontSize:12, color:'#BE123C', marginTop:1}}>{hit.reason || hit.label} · {hit.duration}분</div>
                </div>
                {String(hit.id).indexOf('m') === 0 && (
                  <button onClick={() => setItems(list => list.filter(x => x.id !== hit.id))} style={{
                    border:'none', background:'#fff', color:'#9F1239', borderRadius:8, padding:'6px 8px', fontSize:11, fontWeight:800, cursor:'pointer',
                  }}>해제</button>
                )}
              </div>
            );
          }
          const st = (window.C_STATUS && window.C_STATUS[hit.status]) || { label: hit.status, bg: C_BLUE, text:'#fff' };
          return (
            <div key={hit.id} style={{
              display:'flex', gap:10, alignItems:'center', minHeight:h,
              borderBottom:`1px solid ${C_BORDER}`, padding:'8px 6px',
            }}>
              <div style={{width:46, fontSize:12, fontWeight:800, color:C_INK, fontVariantNumeric:'tabular-nums'}}>{hit.start}</div>
              <div style={{width:3, alignSelf:'stretch', borderRadius:2, background: designer ? designer.color : C_BLUE}}/>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:14, fontWeight:800, letterSpacing:'-0.02em'}}>{hit.customer}</div>
                <div style={{fontSize:12, color:C_MUTED, marginTop:1}}>{hit.menu} · {hit.duration}분</div>
              </div>
              <span style={{
                fontSize:10.5, fontWeight:800, color: st.text, background: st.bg,
                borderRadius:8, padding:'3px 6px',
              }}>{st.label}</span>
            </div>
          );
        })}
      </div>
      {toast && (
        <div style={{
          position:'absolute', left:16, right:16, bottom:78, zIndex:30,
          background:'#0F172A', color:'#fff', borderRadius:12, padding:'10px 12px',
          fontSize:13, fontWeight:700, textAlign:'center',
        }}>{toast}</div>
      )}
      {sheet && sheet.mode === 'pick' && (
        <MSheet onClose={() => setSheet(null)}>
          <div style={{fontSize:16, fontWeight:800}}>{sheet.start} · {designer && designer.name}</div>
          <div style={{display:'flex', flexDirection:'column', gap:8, marginTop:14}}>
            <button onClick={() => setSheet({ ...sheet, mode:'book', menu: M_MENUS[0], customer: null, q:'' })} style={mPrimary}>새 예약 등록</button>
            <button onClick={() => setSheet({ ...sheet, mode:'block', reason: M_REASONS[0], duration: 60 })} style={mGhost}>예약불가</button>
          </div>
        </MSheet>
      )}
      {sheet && sheet.mode === 'book' && (
        <MBookSheet
          sheet={sheet}
          designers={designers}
          onChange={setSheet}
          onClose={() => setSheet(null)}
          onSave={(row) => {
            if (clash(row.start, row.duration, row.designer)) { setToast('그 시간에는 이미 일정이 있어요.'); return; }
            setItems(list => [...list, row]);
            setDesId(row.designer);
            setSheet(null);
            setToast(`${row.customer} 예약이 등록됐어요.`);
          }}
        />
      )}
      {sheet && sheet.mode === 'block' && (
        <MSheet onClose={() => setSheet(null)}>
          <div style={{fontSize:16, fontWeight:800}}>예약불가</div>
          <div style={{fontSize:12.5, color:C_MUTED, margin:'4px 0 12px'}}>{sheet.start} · {designer && designer.name}</div>
          <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
            {M_REASONS.map(reason => (
              <button key={reason} onClick={() => setSheet({ ...sheet, reason })} style={mChip(sheet.reason === reason)}>{reason}</button>
            ))}
          </div>
          <div style={{display:'flex', gap:6, marginTop:12}}>
            {[30, 60, 90].map(duration => (
              <button key={duration} onClick={() => setSheet({ ...sheet, duration })} style={mChip(sheet.duration === duration)}>{duration}분</button>
            ))}
          </div>
          <button onClick={() => {
            const duration = sheet.duration || 60;
            if (clash(sheet.start, duration, desId)) { setToast('그 시간에는 이미 일정이 있어요.'); return; }
            setItems(list => [...list, {
              id:'m' + Date.now(), type:'block', blockType:'unavailable',
              designer: desId, start: sheet.start, duration,
              label:'예약불가', reason: sheet.reason,
            }]);
            setSheet(null);
            setToast('예약불가를 넣었어요.');
          }} style={{...mPrimary, marginTop:16}}>예약불가 저장</button>
        </MSheet>
      )}
    </div>
  );
}

function MBookSheet({ sheet, designers, onChange, onClose, onSave }) {
  const q = sheet.q || '';
  const digits = q.replace(/[^0-9]/g, '');
  const found = q.trim()
    ? (window.CUSTOMERS || []).filter(c => c.name.includes(q.trim()) || (digits && c.phone.replace(/-/g, '').includes(digits))).slice(0, 8)
    : [];
  const menu = sheet.menu || M_MENUS[0];
  return (
    <MSheet onClose={onClose}>
      <div style={{fontSize:16, fontWeight:800}}>새 예약</div>
      <div style={{fontSize:12.5, color:C_MUTED, marginTop:2}}>{sheet.start}</div>
      <div style={{fontSize:12, fontWeight:800, margin:'14px 0 6px'}}>담당자</div>
      <div style={{display:'flex', gap:6, overflowX:'auto'}}>
        {designers.map(d => (
          <button key={d.id} onClick={() => onChange({ ...sheet, designer: d.id })} style={mChip(sheet.designer === d.id)}>{d.name}</button>
        ))}
      </div>
      <div style={{fontSize:12, fontWeight:800, margin:'14px 0 6px'}}>고객명 검색</div>
      <input value={q} onChange={e => onChange({ ...sheet, q: e.target.value, customer: null })} placeholder="이름 또는 전화번호" style={mInput}/>
      {sheet.customer && (
        <div style={{marginTop:8, fontSize:13, fontWeight:800, color:C_BLUE}}>{sheet.customer.name} · {sheet.customer.phone}</div>
      )}
      {q.trim() && !sheet.customer && (
        <div style={{marginTop:6, border:`1px solid ${C_BORDER}`, borderRadius:10, overflow:'hidden'}}>
          {found.length === 0 && <div style={{padding:12, fontSize:12.5, color:C_MUTED}}>찾는 고객이 없어요.</div>}
          {found.map(c => (
            <button key={c.id} onClick={() => onChange({ ...sheet, customer: c, q: c.name })} style={{
              width:'100%', textAlign:'left', border:'none', borderBottom:`1px solid ${C_BORDER}`,
              background:'#fff', padding:'10px 12px', cursor:'pointer', fontFamily:'inherit',
            }}>
              <div style={{fontSize:13.5, fontWeight:800}}>{c.name}</div>
              <div style={{fontSize:11.5, color:C_MUTED, marginTop:1}}>{c.phone}</div>
            </button>
          ))}
        </div>
      )}
      <div style={{fontSize:12, fontWeight:800, margin:'14px 0 6px'}}>시술</div>
      <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
        {M_MENUS.map(item => (
          <button key={item.name} onClick={() => onChange({ ...sheet, menu: item })} style={mChip(menu.name === item.name)}>{item.name}</button>
        ))}
      </div>
      <button disabled={!sheet.customer} onClick={() => onSave({
        id:'m' + Date.now(),
        designer: sheet.designer,
        start: sheet.start,
        duration: menu.duration,
        customer: sheet.customer.name,
        menu: menu.name,
        status:'confirmed',
      })} style={{...mPrimary, marginTop:16, opacity: sheet.customer ? 1 : 0.4}}>예약 등록</button>
    </MSheet>
  );
}

function MLedger() {
  const rows = (window.LEDGER_ROWS || []).slice().sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1));
  const [kind, setKind] = React.useState('all');
  const shown = rows.filter(r => kind === 'all' || r.kind === kind);
  const sum = shown.reduce((a, r) => a + r.amount, 0);
  const kinds = [
    { id:'all', label:'전체' },
    { id:'service', label:'시술' },
    { id:'prepaid', label:'정액권' },
    { id:'ticket', label:'티켓' },
    { id:'product', label:'제품' },
  ];
  const payName = { card:'카드', cash:'현금', naver:'네이버', mix:'현금+카드' };
  return (
    <div style={{flex:1, overflow:'auto', background:C_BG}}>
      <div style={{padding:'14px 16px 8px'}}>
        <div style={{fontSize:18, fontWeight:800, letterSpacing:'-0.03em'}}>매출내역</div>
        <div style={{fontSize:12, color:C_MUTED, marginTop:2}}>2026.09 · PC 매출내역과 같은 결제 건</div>
      </div>
      <div style={{display:'flex', gap:6, overflowX:'auto', padding:'4px 16px 10px'}}>
        {kinds.map(k => (
          <button key={k.id} onClick={() => setKind(k.id)} style={mChip(kind === k.id)}>{k.label}</button>
        ))}
      </div>
      <div style={{margin:'0 16px 12px', background:'#fff', borderRadius:14, padding:'14px 16px'}}>
        <div style={{fontSize:12, color:C_MUTED, fontWeight:700}}>{shown.length}건</div>
        <div style={{fontSize:26, fontWeight:800, letterSpacing:'-0.04em', marginTop:2}}>{mWon(sum)}원</div>
      </div>
      <div style={{margin:'0 16px 20px', background:'#fff', borderRadius:14, overflow:'hidden'}}>
        {shown.map((r, i) => (
          <div key={r.date + r.time + r.customer + r.menu} style={{
            padding:'12px 14px', borderTop: i ? `1px solid ${C_BORDER}` : 'none',
          }}>
            <div style={{display:'flex', justifyContent:'space-between', gap:8}}>
              <div style={{fontSize:14, fontWeight:800}}>{r.customer}</div>
              <div style={{fontSize:14, fontWeight:800, fontVariantNumeric:'tabular-nums'}}>{mWon(r.amount)}원</div>
            </div>
            <div style={{fontSize:12, color:C_MUTED, marginTop:3}}>
              {r.date.slice(5).replace('-', '.')} {r.time} · {r.menu}
            </div>
            <div style={{fontSize:12, color:C_MUTED, marginTop:2}}>
              {r.designer} · {payName[r.pay] || r.pay}
              {r.pay === 'card' && r.cardLink ? ` · ${r.cardLink === 'solo' ? '단독' : '연동'}` : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MSales() {
  const all = window.ST_ROWS || [];
  const [mode, setMode] = React.useState('day');
  const days = [];
  for (let d = 1; d <= 17; d++) {
    const rows = all.filter(r => r.m === 10 && r.day === d);
    if (!rows.length) continue;
    const pay = rows.reduce((s, r) => s + mPayOf(r), 0);
    const n = rows.reduce((s, r) => s + (r.n || 1), 0);
    days.push({ day:d, pay, n });
  }
  const months = [9, 10].map(m => {
    const rows = all.filter(r => r.m === m);
    return { m, pay: rows.reduce((s, r) => s + mPayOf(r), 0), n: rows.reduce((s, r) => s + (r.n || 1), 0) };
  });
  const max = Math.max(1, ...(mode === 'day' ? days.map(d => d.pay) : months.map(d => d.pay)));
  const list = mode === 'day' ? days.slice().reverse() : months.slice().reverse();
  const total = list.reduce((s, r) => s + r.pay, 0);
  return (
    <div style={{flex:1, overflow:'auto', background:C_BG}}>
      <div style={{padding:'14px 16px 8px'}}>
        <div style={{fontSize:18, fontWeight:800, letterSpacing:'-0.03em'}}>일별 / 월별 매출</div>
        <div style={{fontSize:12, color:C_MUTED, marginTop:2}}>결산과 같은 결제 금액</div>
      </div>
      <div style={{display:'flex', gap:6, padding:'4px 16px 12px'}}>
        <button onClick={() => setMode('day')} style={mChip(mode === 'day')}>일별 · 10월</button>
        <button onClick={() => setMode('month')} style={mChip(mode === 'month')}>월별</button>
      </div>
      <div style={{margin:'0 16px 12px', background:'#fff', borderRadius:14, padding:'14px 16px'}}>
        <div style={{fontSize:12, color:C_MUTED, fontWeight:700}}>{mode === 'day' ? '10월 1일–17일' : '9월–10월'}</div>
        <div style={{fontSize:26, fontWeight:800, letterSpacing:'-0.04em', marginTop:2}}>{mWon(total)}원</div>
      </div>
      <div style={{margin:'0 16px 20px', background:'#fff', borderRadius:14, overflow:'hidden'}}>
        {list.map((row, i) => (
          <div key={mode + (row.day || row.m)} style={{padding:'12px 14px', borderTop: i ? `1px solid ${C_BORDER}` : 'none'}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:6}}>
              <div style={{fontSize:14, fontWeight:800}}>{mode === 'day' ? `10월 ${row.day}일` : `2026년 ${row.m}월`}</div>
              <div style={{fontSize:14, fontWeight:800}}>{mWon(row.pay)}원</div>
            </div>
            <div style={{height:8, borderRadius:4, background:'#EEF2FF'}}>
              <div style={{width:`${Math.max(4, row.pay / max * 100)}%`, height:'100%', borderRadius:4, background:C_BLUE}}/>
            </div>
            <div style={{fontSize:11.5, color:C_MUTED, marginTop:4}}>{row.n}건</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MSub() {
  const handoff = window.useSubHandoff ? window.useSubHandoff() : { rows:[] };
  const [filter, setFilter] = React.useState('all');
  const rows = (handoff.rows || []).slice().sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1));
  const shown = rows.filter(r => {
    if (filter === 'diff') return r.seller !== r.performer;
    if (filter === 'done') return r.done;
    return true;
  });
  return (
    <div style={{flex:1, overflow:'auto', background:C_BG}}>
      <div style={{padding:'14px 16px 8px'}}>
        <div style={{fontSize:18, fontWeight:800, letterSpacing:'-0.03em'}}>담당자 대체현황</div>
        <div style={{fontSize:12, color:C_MUTED, marginTop:2}}>PC에서 입력한 대체 내용이에요. 여기서는 수정하지 않아요.</div>
      </div>
      <div style={{display:'flex', gap:6, padding:'4px 16px 12px'}}>
        {[
          { id:'all', label:'전체' },
          { id:'diff', label:'대체 대상' },
          { id:'done', label:'입력됨' },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={mChip(filter === f.id)}>{f.label}</button>
        ))}
      </div>
      <div style={{margin:'0 16px 20px', display:'flex', flexDirection:'column', gap:8}}>
        {shown.length === 0 && <div style={{padding:20, textAlign:'center', color:C_MUTED, fontSize:13}}>표시할 내역이 없어요.</div>}
        {shown.map(r => {
          const diff = r.seller !== r.performer;
          return (
            <div key={r.id} style={{background:'#fff', borderRadius:14, padding:'12px 14px'}}>
              <div style={{display:'flex', justifyContent:'space-between', gap:8}}>
                <div style={{fontSize:14, fontWeight:800}}>{r.customer}</div>
                <span style={{
                  fontSize:11, fontWeight:800, borderRadius:8, padding:'3px 7px',
                  color: r.done ? '#047857' : '#B45309',
                  background: r.done ? '#ECFDF5' : '#FFFBEB',
                }}>{r.done ? '입력됨' : '미입력'}</span>
              </div>
              <div style={{fontSize:12, color:C_MUTED, marginTop:3}}>{r.date.slice(5).replace('-', '.')} {r.time} · {r.menu}</div>
              <div style={{fontSize:13, fontWeight:700, marginTop:8}}>
                {r.seller} → {r.performer}
                {diff ? '' : ' · 동일'}
              </div>
              <div style={{display:'flex', justifyContent:'space-between', marginTop:6, fontSize:12.5}}>
                <span style={{color:C_MUTED}}>{r.voucher}</span>
                <span style={{fontWeight:800}}>{mWon(r.amount)}원</span>
              </div>
              {r.done && (
                <div style={{marginTop:6, fontSize:12.5, color:'#047857', fontWeight:800}}>
                  대체 {r.pct}% · {mWon(r.give)}원
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MAnalysis() {
  const presets = (window.ST_PRESETS || []).filter(p => p.id === 'today' || p.id === 'month' || p.id === 'last');
  const [preset, setPreset] = React.useState('month');
  const [open, setOpen] = React.useState(false);
  const range = presets.find(p => p.id === preset) || presets[0];
  const rows = window.stRowsFor ? window.stRowsFor(preset) : [];
  const pack = window.stCollect ? window.stCollect(rows) : { all:{ pay:0, sale:{ membership:0, ticket:0 }, payMethods:{} }, byDes:{} };
  const b = pack.all;
  const payOfKind = (kind) => rows.filter(r => r.kind === kind).reduce((s, r) => s + mPayOf(r), 0);
  const year = [];
  for (let m = 1; m <= 12; m++) {
    const list = (window.ST_ROWS || []).filter(r => r.m === m);
    year.push(list.reduce((s, r) => s + mPayOf(r), 0));
  }
  const pays = M_PAY.map(p => ({ ...p, amount: (b.payMethods && b.payMethods[p.id]) || 0 })).filter(p => p.amount > 0).sort((a, c) => c.amount - a.amount);
  const payMax = pays.reduce((m, p) => Math.max(m, p.amount), 1);
  const topPay = pays[0];
  const designers = (window.ST_DES || []).map(d => {
    const box = pack.byDes[d.id] || { pay:0, lines:0 };
    return { ...d, pay: box.pay, n: box.lines };
  }).filter(d => d.pay > 0).sort((a, c) => c.pay - a.pay);
  const desMax = designers.reduce((m, d) => Math.max(m, d.pay), 1);
  const hours = M_HOURS.map(h => ({ h, n:0, pay:0 }));
  rows.forEach(r => {
    const slot = hours.find(x => x.h === mHour(r));
    if (!slot) return;
    slot.n += r.n || 1;
    slot.pay += mPayOf(r);
  });
  const hourMax = hours.reduce((m, h) => Math.max(m, h.pay), 1);
  const topHour = hours.slice().sort((a, c) => c.pay - a.pay)[0];
  const weeks = M_WD.map((name, i) => ({ name, i, n:0, pay:0 }));
  rows.forEach(r => {
    const i = new Date(2026, r.m - 1, r.day).getDay();
    weeks[i].n += r.n || 1;
    weeks[i].pay += mPayOf(r);
  });
  const weekMax = weeks.reduce((m, w) => Math.max(m, w.pay), 1);
  const topWeek = weeks.slice().sort((a, c) => c.pay - a.pay)[0];
  const menus = Object.keys(M_CAT).map(id => {
    const list = rows.filter(r => r.cat === id);
    return {
      id, name: M_CAT[id],
      n: list.reduce((s, r) => s + (r.n || 1), 0),
      amount: list.reduce((s, r) => s + (r.service || 0), 0),
    };
  }).filter(m => m.n > 0).sort((a, c) => c.amount - a.amount);
  const menuSum = menus.reduce((s, m) => s + m.amount, 0);
  const menuN = menus.reduce((s, m) => s + m.n, 0);
  const dots = [
    { name:'시술', amount: payOfKind('service'), color:'#4F46E5' },
    { name:'정액권', amount: payOfKind('membership'), color:'#818CF8' },
    { name:'티켓', amount: payOfKind('ticket'), color:'#F59E0B' },
    { name:'제품', amount: payOfKind('product'), color:'#94A3B8' },
    { name:'예약금', amount: payOfKind('deposit'), color:'#CBD5E1' },
  ].filter(d => d.amount > 0);

  return (
    <div style={{flex:1, overflow:'auto', background:'#F8FAFC'}}>
      <div style={{padding:'14px 16px 12px', display:'flex', alignItems:'center', gap:8}}>
        <div style={{fontSize:20, fontWeight:800, letterSpacing:'-0.04em', flex:1}}>매출 분석</div>
      </div>
      <div style={{padding:'0 16px 10px', position:'relative'}}>
        <button onClick={() => setOpen(v => !v)} style={{
          width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center',
          background:'#fff', border:`1px solid ${C_BORDER}`, borderRadius:12, padding:'12px 14px',
          fontFamily:'inherit', cursor:'pointer',
        }}>
          <span style={{fontSize:14, fontWeight:800}}>{range ? `${range.label}  ${range.from} – ${range.to}` : ''}</span>
          <span style={{color:C_MUTED}}>▾</span>
        </button>
        {open && (
          <div style={{
            position:'absolute', left:16, right:16, top:52, background:'#fff',
            borderRadius:12, border:`1px solid ${C_BORDER}`, zIndex:5, overflow:'hidden',
          }}>
            {presets.map(p => (
              <button key={p.id} onClick={() => { setPreset(p.id); setOpen(false); }} style={{
                width:'100%', textAlign:'left', border:'none', borderBottom:`1px solid ${C_BORDER}`,
                background: p.id === preset ? C_BLUE_SOFT : '#fff', padding:'12px 14px',
                fontSize:13.5, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
              }}>{p.label} · {p.from} – {p.to}</button>
            ))}
          </div>
        )}
      </div>

      <div style={{margin:'0 16px 12px', background:'#fff', borderRadius:16, padding:'16px'}}>
        <div style={{fontSize:13, color:C_MUTED, fontWeight:700}}>총 매출</div>
        <div style={{fontSize:30, fontWeight:800, letterSpacing:'-0.04em', margin:'4px 0 12px'}}>{mWon(b.pay)}원</div>
        {dots.map(d => (
          <div key={d.name} style={{display:'flex', alignItems:'center', gap:8, padding:'4px 0', fontSize:13}}>
            <span style={{width:8, height:8, borderRadius:'50%', background:d.color}}/>
            <span style={{flex:1, color:'#334155'}}>{d.name}</span>
            <span style={{fontWeight:800}}>{mWon(d.amount)}원</span>
          </div>
        ))}
        <div style={{fontSize:12, color:C_MUTED, fontWeight:700, margin:'14px 0 6px'}}>12개월 추이</div>
        <MLine values={year}/>
        <div style={{display:'flex', justifyContent:'space-between', fontSize:10, color:'#94A3B8', marginTop:2}}>
          <span>1월</span><span>12월</span>
        </div>
      </div>

      <MCard title={topPay ? `${mRo(topPay.name)} 가장 많이 팔렸어요` : '결제수단'}>
        {pays.map(p => (
          <div key={p.id} style={{marginBottom:10}}>
            <div style={{display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4}}>
              <span style={{display:'flex', alignItems:'center', gap:6}}>
                <span style={{width:8, height:8, borderRadius:'50%', background:p.color}}/>{p.name}
              </span>
              <b>{mWon(p.amount)}원</b>
            </div>
            <div style={{height:8, borderRadius:4, background:'#EEF2F7'}}>
              <div style={{width:`${p.amount / payMax * 100}%`, height:'100%', borderRadius:4, background:p.color}}/>
            </div>
          </div>
        ))}
      </MCard>

      <MCard title="담당자 매출" sub={designers[0] ? `${designers[0].name} 매출이 가장 많아요` : ''}>
        {designers.map(d => (
          <div key={d.id} style={{display:'flex', alignItems:'center', gap:8, padding:'7px 0'}}>
            <span style={{width:8, height:8, borderRadius:'50%', background:d.color, flexShrink:0}}/>
            <span style={{width:52, fontSize:13, fontWeight:700}}>{d.name}</span>
            <div style={{flex:1, height:8, borderRadius:4, background:'#EEF2F7'}}>
              <div style={{width:`${d.pay / desMax * 100}%`, height:'100%', borderRadius:4, background:'#6366F1'}}/>
            </div>
            <span style={{width:92, textAlign:'right', fontSize:12, fontWeight:800}}>{mWon(d.pay)}원</span>
            <span style={{width:36, textAlign:'right', fontSize:11, color:C_MUTED}}>{d.n}건</span>
          </div>
        ))}
      </MCard>

      <MCard title={topHour && topHour.pay ? `${topHour.h < 12 ? '오전' : '오후'} ${topHour.h > 12 ? topHour.h - 12 : topHour.h}시에 가장 많이 팔렸어요` : '시간대'}>
        {hours.filter(h => h.pay > 0).map(h => (
          <div key={h.h} style={{display:'grid', gridTemplateColumns:'52px 1fr 64px', gap:8, alignItems:'center', padding:'5px 0', fontSize:12.5}}>
            <span style={{color:C_MUTED, fontWeight:700}}>{mPad(h.h)}:00</span>
            <div style={{height:8, borderRadius:4, background:'#EEF2F7'}}>
              <div style={{width:`${h.pay / hourMax * 100}%`, height:'100%', borderRadius:4, background:'#818CF8'}}/>
            </div>
            <span style={{textAlign:'right', color:C_MUTED}}>{h.n}건</span>
          </div>
        ))}
      </MCard>

      <MCard title={topWeek && topWeek.pay ? `${topWeek.name}요일에 가장 많이 팔렸어요` : '요일'}>
        {weeks.map(w => (
          <div key={w.name} style={{display:'flex', alignItems:'center', gap:8, padding:'5px 0', fontSize:13}}>
            <span style={{width:28, fontWeight:800, color: w.i === 0 ? '#EF4444' : w.i === 6 ? C_BLUE : C_INK}}>{w.name}</span>
            <div style={{flex:1, height:8, borderRadius:4, background:'#EEF2F7'}}>
              <div style={{width:`${w.pay / weekMax * 100}%`, height:'100%', borderRadius:4, background:'#6366F1'}}/>
            </div>
            <span style={{fontWeight:800, width:88, textAlign:'right'}}>{mWon(w.pay)}원</span>
          </div>
        ))}
      </MCard>

      <MCard title={`시술 ${menuN}건 판매했어요`}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 48px 88px 48px', gap:6, fontSize:11, color:C_MUTED, fontWeight:700, marginBottom:6}}>
          <span>메뉴</span><span style={{textAlign:'right'}}>건수</span><span style={{textAlign:'right'}}>매출</span><span style={{textAlign:'right'}}>비중</span>
        </div>
        {menus.map(m => (
          <div key={m.id} style={{display:'grid', gridTemplateColumns:'1fr 48px 88px 48px', gap:6, padding:'7px 0', borderTop:`1px solid ${C_BORDER}`, fontSize:13}}>
            <b>{m.name}</b>
            <span style={{textAlign:'right'}}>{m.n}건</span>
            <span style={{textAlign:'right', fontWeight:800}}>{mWon(m.amount)}원</span>
            <span style={{textAlign:'right', color:C_MUTED}}>{menuSum ? Math.round(m.amount / menuSum * 1000) / 10 : 0}%</span>
          </div>
        ))}
        <div style={{display:'flex', justifyContent:'space-between', marginTop:10, paddingTop:10, borderTop:`1px solid ${C_BORDER}`, fontWeight:800}}>
          <span>합계</span><span>{mWon(menuSum)}원</span>
        </div>
      </MCard>
      <div style={{height:12}}/>
    </div>
  );
}

function MCard({ title, sub, children }) {
  return (
    <div style={{margin:'0 16px 12px', background:'#fff', borderRadius:16, padding:'16px'}}>
      <div style={{fontSize:15, fontWeight:800, letterSpacing:'-0.03em'}}>{title}</div>
      {sub && <div style={{fontSize:12, color:C_MUTED, marginTop:2}}>{sub}</div>}
      <div style={{marginTop:12}}>{children}</div>
    </div>
  );
}

function MLine({ values }) {
  const w = 320, h = 110, pad = 6;
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => {
    const x = pad + i * (w - pad * 2) / (values.length - 1);
    const y = h - pad - (v / max) * (h - pad * 2);
    return [x, y];
  });
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="110">
      <path d={d} fill="none" stroke="#4F46E5" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round"/>
      {last && <circle cx={last[0]} cy={last[1]} r="3.5" fill="#4F46E5"/>}
    </svg>
  );
}

const mPrimary = {
  height:46, border:'none', borderRadius:12, background:C_BLUE, color:'#fff',
  fontSize:15, fontWeight:800, cursor:'pointer', fontFamily:'inherit',
};
const mGhost = {
  height:46, border:`1px solid ${C_BORDER}`, borderRadius:12, background:'#fff', color:C_INK,
  fontSize:15, fontWeight:800, cursor:'pointer', fontFamily:'inherit',
};
const mInput = {
  width:'100%', height:42, border:`1px solid ${C_BORDER}`, borderRadius:10,
  padding:'0 12px', fontSize:14, fontFamily:'inherit', outline:'none',
};
function mChip(on) {
  return {
    flexShrink:0, border: on ? `1px solid ${C_BLUE}` : `1px solid ${C_BORDER}`,
    background: on ? C_BLUE_SOFT : '#fff', color: on ? C_BLUE : C_INK,
    borderRadius:16, padding:'7px 12px', fontSize:12.5, fontWeight:800,
    fontFamily:'inherit', cursor:'pointer',
  };
}

const M_TABS = [
  { id:'book', label:'예약' },
  { id:'ledger', label:'내역' },
  { id:'sales', label:'매출' },
  { id:'sub', label:'대체' },
  { id:'analysis', label:'분석' },
];

function C_MobileApp({ onPc }) {
  const [tab, setTab] = React.useState('book');
  React.useEffect(() => { window.__closeMobile = onPc; }, [onPc]);
  return (
    <div style={{
      height:'100vh', background:'#E8EDF5', display:'flex', justifyContent:'center',
      fontFamily:"'Pretendard Variable','Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
      color:C_INK,
    }}>
      <div style={{
        width:'100%', maxWidth:420, height:'100%', background:C_BG,
        display:'flex', flexDirection:'column', position:'relative',
        boxShadow:'0 0 0 1px rgba(15,23,42,0.06)',
      }}>
        <div style={{flex:1, minHeight:0, display:'flex', flexDirection:'column'}}>
          {tab === 'book' && <MBoard/>}
          {tab === 'ledger' && <MLedger/>}
          {tab === 'sales' && <MSales/>}
          {tab === 'sub' && <MSub/>}
          {tab === 'analysis' && <MAnalysis/>}
        </div>
        <div style={{
          flexShrink:0, display:'flex', background:'#fff', borderTop:`1px solid ${C_BORDER}`,
          padding:'6px 4px 10px',
        }}>
          {M_TABS.map(t => {
            const on = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex:1, border:'none', background:'transparent', cursor:'pointer', fontFamily:'inherit',
                color: on ? C_BLUE : '#94A3B8', fontSize:11, fontWeight:800, padding:'6px 0',
              }}>
                <div style={{fontSize:16, lineHeight:1, marginBottom:3}}>{t.id === 'book' ? '▦' : t.id === 'ledger' ? '☰' : t.id === 'sales' ? '₩' : t.id === 'sub' ? '⇄' : '◈'}</div>
                {t.label}
              </button>
            );
          })}
          <button onClick={onPc} style={{
            flex:1, border:'none', background:'transparent', cursor:'pointer', fontFamily:'inherit',
            color:'#94A3B8', fontSize:11, fontWeight:800, padding:'6px 0',
          }}>
            <div style={{fontSize:16, lineHeight:1, marginBottom:3}}>⌂</div>
            PC
          </button>
        </div>
      </div>
    </div>
  );
}

window.C_MobileApp = C_MobileApp;
