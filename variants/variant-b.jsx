// 시안 B — Notion Style (Warm Neutral + Sage)
// - 좌측 넓은 라이트 사이드바 (텍스트+아이콘)
// - 큰 날짜 타이틀 + 브레드크럼
// - 우측 접이식 상세 패널 (선택된 예약)
// - 여유 그리드 (30분 = 56px)
// - 부드러운 배경 tint + 상태 dot 카드

const B_SAGE = '#5B8C7B';
const B_SAGE_SOFT = '#EDF2EF';
const B_INK = '#1F1D1A';
const B_MUTED = '#8B857D';
const B_BORDER = '#EAE6E0';
const B_BG = '#FBFAF7';
const B_SURFACE = '#FFFFFF';

const B_STATUS = {
  confirmed: { label: '확정',  dot: '#5B8C7B', bg: '#EDF2EF', ring: '#5B8C7B' },
  visited:   { label: '방문',  dot: '#7B8D5B', bg: '#F0F1E8', ring: '#7B8D5B' },
  pending:   { label: '대기',  dot: '#C9995B', bg: '#F8F0E4', ring: '#C9995B' },
  noshow:    { label: '노쇼',  dot: '#B8695B', bg: '#F5E7E3', ring: '#B8695B' },
  cancelled: { label: '취소',  dot: '#A8A29E', bg: '#F1EFEB', ring: '#A8A29E' },
};

const B_SLOT_HEIGHT = 56;
const B_HEADER_H = 60;
const B_TIME_COL_W = 64;
const B_DESIGNER_COL_W = 156;

function B_SideBar() {
  return (
    <aside style={{
      width: 240, background:'#F7F5F1', borderRight:`1px solid ${B_BORDER}`,
      display:'flex', flexDirection:'column', padding:'20px 12px',
    }}>
      <div style={{display:'flex', alignItems:'center', gap:10, padding:'4px 10px 20px'}}>
        <div style={{
          width:32, height:32, borderRadius:8, background:B_SAGE,
          display:'flex', alignItems:'center', justifyContent:'center',
          color:'#fff', fontWeight:700, fontSize:14,
        }}>ㅋ</div>
        <div style={{flex:1}}>
          <div style={{fontSize:13, fontWeight:600, color:B_INK}}>카이키키</div>
          <div style={{fontSize:11, color:B_MUTED, marginTop:1}}>부평본점 · Pro</div>
        </div>
        <IconChevronD size={14} style={{color:B_MUTED}}/>
      </div>

      <div style={{fontSize:10.5, color:B_MUTED, fontWeight:600, letterSpacing:'0.06em', padding:'0 10px 6px'}}>워크스페이스</div>
      {[
        { icon:<IconCalendar size={16}/>, label:'예약 현황', active:true, badge: 27 },
        { icon:<IconClock size={16}/>,    label:'매장 일정' },
        { icon:<IconUser size={16}/>,     label:'객수 통계' },
        { icon:<IconX size={16}/>,        label:'일일 마감' },
      ].map((it, i) => (
        <div key={i} style={{
          display:'flex', alignItems:'center', gap:10,
          padding:'7px 10px', borderRadius:6, cursor:'pointer',
          background: it.active ? '#fff' : 'transparent',
          color: it.active ? B_INK : '#4C4842',
          fontSize:13, fontWeight: it.active ? 500 : 400,
          boxShadow: it.active ? '0 1px 2px rgba(0,0,0,0.04)' : 'none',
        }}>
          {it.icon}
          <span style={{flex:1}}>{it.label}</span>
          {it.badge && <span style={{
            fontSize:10, background:B_SAGE, color:'#fff',
            padding:'1px 6px', borderRadius:8, fontWeight:600, fontVariantNumeric:'tabular-nums',
          }}>{it.badge}</span>}
        </div>
      ))}

      <div style={{fontSize:10.5, color:B_MUTED, fontWeight:600, letterSpacing:'0.06em', padding:'20px 10px 6px'}}>둘러보기</div>
      {[
        { icon:<IconTag size={16}/>,      label:'메뉴 관리' },
        { icon:<IconMegaphone size={16}/>,label:'마케팅' },
        { icon:<IconChart size={16}/>,    label:'매출 분석' },
        { icon:<IconStore size={16}/>,    label:'스토어' },
      ].map((it, i) => (
        <div key={i} style={{
          display:'flex', alignItems:'center', gap:10,
          padding:'7px 10px', borderRadius:6, cursor:'pointer',
          color:'#4C4842', fontSize:13,
        }}>
          {it.icon}<span>{it.label}</span>
        </div>
      ))}

      <div style={{flex:1}}/>

      <div style={{
        padding:'12px', background:'#fff', borderRadius:8,
        border:`1px solid ${B_BORDER}`,
      }}>
        <div style={{fontSize:11, color:B_MUTED, marginBottom:4}}>오늘 매출</div>
        <div style={{fontSize:16, fontWeight:700, color:B_INK, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em'}}>
          ₩ 2,840,000
        </div>
        <div style={{fontSize:11, color:B_SAGE, marginTop:3, fontWeight:600}}>▲ 22.9% 어제 대비</div>
      </div>
    </aside>
  );
}

function B_Header() {
  const [view, setView] = React.useState('day');
  return (
    <div style={{padding:'24px 28px 16px', background: B_BG, borderBottom:`1px solid ${B_BORDER}`}}>
      <div style={{display:'flex', alignItems:'center', gap:6, fontSize:12, color:B_MUTED, marginBottom:8}}>
        <span>Schedule</span>
        <IconChevronR size={12}/>
        <span style={{color:B_INK}}>예약 현황</span>
      </div>
      <div style={{display:'flex', alignItems:'flex-end', gap:16, flexWrap:'wrap'}}>
        <div style={{flexShrink:0, minWidth:0}}>
          <div style={{display:'flex', alignItems:'baseline', gap:10, whiteSpace:'nowrap'}}>
            <h1 style={{margin:0, fontSize:26, fontWeight:700, color:B_INK, letterSpacing:'-0.02em', whiteSpace:'nowrap'}}>
              9월 8일 화요일
            </h1>
            <span style={{fontSize:14, color:B_MUTED}}>2026</span>
          </div>
          <div style={{fontSize:13, color:B_MUTED, marginTop:4, whiteSpace:'nowrap'}}>
            전체 27건 · 방문 12 · 대기 2 · 예정 13
          </div>
        </div>

        <div style={{flex:1, minWidth:16}}/>

        <div style={{display:'flex', alignItems:'center', gap:8, flexShrink:0, flexWrap:'wrap'}}>
          <button style={{...b_iconBtn, flexShrink:0}}><IconChevronL size={16}/></button>
          <button style={{...b_ghostBtn, flexShrink:0, whiteSpace:'nowrap'}}>오늘</button>
          <button style={{...b_iconBtn, flexShrink:0}}><IconChevronR size={16}/></button>

          <div style={{width:1, height:24, background:B_BORDER, margin:'0 4px', flexShrink:0}}/>

          <div style={{display:'flex', background:'#fff', borderRadius:6, padding:2, border:`1px solid ${B_BORDER}`, flexShrink:0}}>
            {['day','week','month'].map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding:'5px 14px', fontSize:12, fontWeight:500,
                border:'none', borderRadius:4, cursor:'pointer',
                background: view===v ? B_SAGE_SOFT : 'transparent',
                color: view===v ? B_SAGE : B_MUTED,
                whiteSpace:'nowrap',
              }}>{v==='day'?'일':v==='week'?'주':'월'}</button>
            ))}
          </div>

          <div style={{width:1, height:24, background:B_BORDER, margin:'0 4px', flexShrink:0}}/>

          <div style={{position:'relative', flexShrink:0}}>
            <IconSearch size={14} style={{position:'absolute', left:10, top:9, color:B_MUTED}}/>
            <input placeholder="고객 검색" style={{
              height:32, padding:'0 10px 0 30px', width:160,
              border:`1px solid ${B_BORDER}`, borderRadius:6,
              fontSize:12, background:'#fff', color:B_INK,
              fontFamily:'inherit', outline:'none',
            }}/>
          </div>

          <button style={{
            display:'flex', alignItems:'center', gap:6,
            padding:'8px 14px', background: B_SAGE, color:'#fff',
            border:'none', borderRadius:6, fontSize:12, fontWeight:600,
            cursor:'pointer', flexShrink:0, whiteSpace:'nowrap',
          }}>
            <IconPlus size={14}/> 예약 추가
          </button>
        </div>
      </div>
    </div>
  );
}

function B_TimeGrid({ selectedId, onSelect }) {
  const slots = [];
  for (let m = DAY_START; m < DAY_END; m += SLOT_MIN) slots.push(m);

  const now = 14 * 60 + 22;

  return (
    <div style={{
      flex:1, overflow:'auto', background:B_SURFACE,
      borderRadius:12, border:`1px solid ${B_BORDER}`,
    }}>
      <div style={{
        display:'grid',
        gridTemplateColumns:`${B_TIME_COL_W}px repeat(${DESIGNERS.length}, ${B_DESIGNER_COL_W}px)`,
        minWidth: B_TIME_COL_W + DESIGNERS.length * B_DESIGNER_COL_W,
      }}>
        {/* 헤더 */}
        <div style={{position:'sticky', top:0, left:0, zIndex:3, background:B_SURFACE, height:B_HEADER_H, borderBottom:`1px solid ${B_BORDER}`}}/>
        {DESIGNERS.map(d => (
          <div key={d.id} style={{
            position:'sticky', top:0, zIndex:2, background:B_SURFACE,
            height:B_HEADER_H, padding:'0 14px',
            display:'flex', alignItems:'center', gap:10,
            borderBottom:`1px solid ${B_BORDER}`,
            borderLeft:`1px solid ${B_BORDER}`,
          }}>
            <div style={{
              width:32, height:32, borderRadius:'50%',
              background:'#F7F5F1', border:`2px solid ${d.color}`,
              color:d.color, fontSize:12, fontWeight:600,
              display:'flex', alignItems:'center', justifyContent:'center',
              flexShrink:0,
            }}>{d.name.slice(-2,-1)+d.name.slice(-1)}</div>
            <div style={{minWidth:0}}>
              <div style={{fontSize:13, fontWeight:600, color:B_INK, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{d.name}</div>
              <div style={{fontSize:11, color:B_MUTED, marginTop:1}}>{d.role}</div>
            </div>
          </div>
        ))}

        {slots.map((m) => {
          const isHour = m % 60 === 0;
          return (
            <React.Fragment key={m}>
              <div style={{
                position:'sticky', left:0, background:B_SURFACE,
                height:B_SLOT_HEIGHT, padding:'6px 10px',
                borderTop: isHour ? `1px solid ${B_BORDER}` : 'none',
                textAlign:'right',
                fontSize:11.5, color: isHour ? B_INK : B_MUTED,
                fontWeight: isHour ? 600 : 400,
                fontVariantNumeric:'tabular-nums',
                zIndex:1,
              }}>
                {isHour ? minToTime(m) : ':30'}
              </div>
              {DESIGNERS.map(d => (
                <div key={d.id} style={{
                  height:B_SLOT_HEIGHT,
                  borderTop: isHour ? `1px solid ${B_BORDER}` : `1px dashed #F3EFE9`,
                  borderLeft: `1px solid ${B_BORDER}`,
                }}/>
              ))}
            </React.Fragment>
          );
        })}

        <B_ReservationLayer selectedId={selectedId} onSelect={onSelect}/>
        <B_NowLine now={now}/>
      </div>
    </div>
  );
}

function B_ReservationLayer({ selectedId, onSelect }) {
  return (
    <div style={{
      gridColumn: `1 / ${DESIGNERS.length + 2}`,
      gridRow: `2 / ${(DAY_END - DAY_START)/SLOT_MIN + 2}`,
      position:'relative', pointerEvents:'none',
    }}>
      {RESERVATIONS.map(r => {
        const designerIdx = DESIGNERS.findIndex(d => d.id === r.designer);
        if (designerIdx < 0) return null;
        const top = (timeToMin(r.start) - DAY_START) / SLOT_MIN * B_SLOT_HEIGHT;
        const height = r.duration / SLOT_MIN * B_SLOT_HEIGHT - 3;
        const left = B_TIME_COL_W + designerIdx * B_DESIGNER_COL_W;

        if (r.type === 'block') {
          return (
            <div key={r.id} style={{
              position:'absolute', top, left: left+3, height,
              width: B_DESIGNER_COL_W - 6,
              background: '#F7F5F1',
              border:`1px dashed ${B_BORDER}`, borderRadius:6,
              padding:'8px 10px', pointerEvents:'auto',
              display:'flex', alignItems:'center', gap:6,
              fontSize:11.5, color:B_MUTED,
            }}>
              <IconCoffee size={13}/> {r.label}
            </div>
          );
        }

        const st = B_STATUS[r.status];
        const isSelected = selectedId === r.id;
        return (
          <div key={r.id} onClick={() => onSelect(r.id)} style={{
            position:'absolute', top, left: left+3, height,
            width: B_DESIGNER_COL_W - 6,
            background: st.bg, borderRadius:8,
            padding:'8px 10px', pointerEvents:'auto',
            cursor:'pointer', overflow:'hidden',
            border: isSelected ? `2px solid ${st.ring}` : `1px solid ${st.ring}22`,
            boxShadow: isSelected ? `0 4px 12px ${st.ring}30` : 'none',
            transition:'all 0.12s',
          }}>
            <div style={{display:'flex', alignItems:'center', gap:5}}>
              <div style={{width:6, height:6, borderRadius:'50%', background:st.dot, flexShrink:0}}/>
              <div style={{fontSize:11, color:B_INK, fontWeight:600, fontVariantNumeric:'tabular-nums'}}>{r.start}</div>
              {r.memo && <span title={r.memo} style={{fontSize:9, color:B_MUTED, marginLeft:'auto'}}>📌</span>}
            </div>
            <div style={{fontSize:13, color:B_INK, fontWeight:600, marginTop:3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', letterSpacing:'-0.01em'}}>
              {r.customer}
            </div>
            {height > 46 && (
              <div style={{fontSize:11.5, color:B_MUTED, marginTop:2, lineHeight:1.35, overflow:'hidden'}}>
                {r.menu}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function B_NowLine({ now }) {
  const top = (now - DAY_START) / SLOT_MIN * B_SLOT_HEIGHT;
  return (
    <div style={{
      gridColumn: `1 / ${DESIGNERS.length + 2}`,
      gridRow: `2 / ${(DAY_END - DAY_START)/SLOT_MIN + 2}`,
      position:'relative', pointerEvents:'none',
    }}>
      <div style={{
        position:'absolute', top, left:0, right:0, height:2,
        background:'#C9995B', zIndex:5, opacity:0.7,
      }}>
        <div style={{
          position:'absolute', left:B_TIME_COL_W-4, top:-4,
          width:10, height:10, borderRadius:'50%',
          background:'#C9995B',
        }}/>
      </div>
    </div>
  );
}

function B_DetailPanel({ reservationId, onClose }) {
  const r = RESERVATIONS.find(x => x.id === reservationId);
  if (!r || r.type === 'block') return null;
  const designer = DESIGNERS.find(d => d.id === r.designer);
  const st = B_STATUS[r.status];

  return (
    <aside style={{
      width:320, background:B_SURFACE, borderLeft:`1px solid ${B_BORDER}`,
      display:'flex', flexDirection:'column', overflow:'auto',
    }}>
      <div style={{padding:'20px 24px 16px', borderBottom:`1px solid ${B_BORDER}`}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12}}>
          <div style={{display:'flex', alignItems:'center', gap:6}}>
            <div style={{width:8, height:8, borderRadius:'50%', background:st.dot}}/>
            <span style={{fontSize:11.5, color:B_INK, fontWeight:600}}>{st.label} 예약</span>
          </div>
          <button onClick={onClose} style={{background:'none', border:'none', color:B_MUTED, cursor:'pointer', padding:4}}><IconX size={16}/></button>
        </div>
        <h2 style={{margin:0, fontSize:20, fontWeight:700, color:B_INK, letterSpacing:'-0.02em'}}>{r.customer}</h2>
        <div style={{display:'flex', alignItems:'center', gap:6, marginTop:6, fontSize:12, color:B_MUTED}}>
          <IconUser size={12}/> VIP · 방문 12회
        </div>
      </div>

      <div style={{padding:'20px 24px', display:'flex', flexDirection:'column', gap:16}}>
        <B_DetailRow label="시간">
          <div style={{fontSize:13, color:B_INK, fontWeight:500, fontVariantNumeric:'tabular-nums'}}>
            {r.start} — {minToTime(timeToMin(r.start) + r.duration)}
          </div>
          <div style={{fontSize:11.5, color:B_MUTED, marginTop:2}}>{r.duration}분 소요</div>
        </B_DetailRow>

        <B_DetailRow label="시술">
          <div style={{fontSize:13, color:B_INK, fontWeight:500}}>{r.menu}</div>
        </B_DetailRow>

        <B_DetailRow label="담당">
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <div style={{width:24, height:24, borderRadius:'50%', background:designer.color, color:'#fff', fontSize:10, fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center'}}>
              {designer.name.slice(-2)}
            </div>
            <span style={{fontSize:13, color:B_INK, fontWeight:500}}>{designer.name}</span>
            <span style={{fontSize:11.5, color:B_MUTED}}>· {designer.role}</span>
          </div>
        </B_DetailRow>

        {r.memo && (
          <B_DetailRow label="메모">
            <div style={{fontSize:12.5, color:B_INK, padding:'10px 12px', background:'#FFF8EA', borderRadius:6, borderLeft:`3px solid #C9995B`, lineHeight:1.5}}>
              {r.memo}
            </div>
          </B_DetailRow>
        )}

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
          <button style={b_actionBtn}>
            <IconPhone size={14}/> 전화
          </button>
          <button style={b_actionBtn}>
            <IconNote size={14}/> 메모
          </button>
        </div>

        <div style={{display:'flex', gap:8, marginTop:4}}>
          <button style={{...b_ghostBtn, flex:1, padding:'8px 12px'}}>수정</button>
          <button style={{
            flex:1, padding:'8px 12px', background:B_SAGE, color:'#fff',
            border:'none', borderRadius:6, fontSize:12.5, fontWeight:600, cursor:'pointer',
          }}>방문 확정</button>
        </div>
      </div>
    </aside>
  );
}

function B_DetailRow({ label, children }) {
  return (
    <div>
      <div style={{fontSize:10.5, color:B_MUTED, fontWeight:600, letterSpacing:'0.06em', marginBottom:6}}>{label.toUpperCase()}</div>
      {children}
    </div>
  );
}

const b_iconBtn = {
  width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center',
  border:`1px solid ${B_BORDER}`, borderRadius:6, background:'#fff',
  color:B_INK, cursor:'pointer',
};
const b_ghostBtn = {
  padding:'7px 12px', border:`1px solid ${B_BORDER}`, borderRadius:6,
  background:'#fff', color:B_INK, fontSize:12, fontWeight:500, cursor:'pointer',
};
const b_actionBtn = {
  display:'flex', alignItems:'center', justifyContent:'center', gap:6,
  padding:'10px 12px', background:'#F7F5F1', border:`1px solid ${B_BORDER}`,
  borderRadius:6, color:B_INK, fontSize:12.5, fontWeight:500, cursor:'pointer',
};

function VariantB() {
  const [selectedId, setSelectedId] = React.useState(16); // 홍지수 예약 선택
  return (
    <div style={{
      display:'flex', height:'100%',
      fontFamily:"'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
      background: B_BG, color: B_INK,
    }}>
      <B_SideBar/>
      <div style={{flex:1, display:'flex', flexDirection:'column', minWidth:0}}>
        <B_Header/>
        <div style={{flex:1, padding:'20px 28px 28px', minHeight:0, display:'flex'}}>
          <B_TimeGrid selectedId={selectedId} onSelect={setSelectedId}/>
        </div>
      </div>
      {selectedId && <B_DetailPanel reservationId={selectedId} onClose={() => setSelectedId(null)}/>}
    </div>
  );
}

window.VariantB = VariantB;
