// 시안 A — Linear Style (Slate + Indigo)
// - 좌측 좁은 아이콘 사이드바
// - 상단 얇은 툴바
// - 우측 오늘 요약 위젯 상시 노출
// - 컴팩트 그리드 (30분 = 40px)
// - 얇은 좌측 컬러바 예약 카드

const A_INDIGO = '#6366F1';
const A_INDIGO_SOFT = '#EEF0FF';
const A_INK = '#0F172A';
const A_MUTED = '#64748B';
const A_BORDER = '#E2E8F0';
const A_BG = '#FAFAFB';

const A_STATUS = {
  confirmed: { label: '확정',  bar: '#6366F1', bg: '#EEF0FF', text: '#4338CA' },
  visited:   { label: '방문',  bar: '#10B981', bg: '#ECFDF5', text: '#047857' },
  pending:   { label: '대기',  bar: '#F59E0B', bg: '#FFFBEB', text: '#B45309' },
  noshow:    { label: '노쇼',  bar: '#EF4444', bg: '#FEF2F2', text: '#B91C1C' },
  cancelled: { label: '취소',  bar: '#94A3B8', bg: '#F1F5F9', text: '#64748B' },
};

const A_SLOT_HEIGHT = 40;   // 30분당 40px
const A_HEADER_H = 44;
const A_TIME_COL_W = 56;
const A_DESIGNER_COL_W = 148;

function A_SideBar() {
  const items = [
    { icon: <IconCalendar />, label: 'Schedule', active: true },
    { icon: <IconMenu />,     label: 'Menu' },
    { icon: <IconMegaphone />,label: 'Marketing' },
    { icon: <IconChart />,    label: 'Chart' },
    { icon: <IconGrid />,     label: 'More' },
    { icon: <IconStore />,    label: 'Store' },
  ];
  return (
    <aside style={{
      width: 220, background: '#0F172A', color: '#CBD5E1',
      display: 'flex', flexDirection: 'column',
      padding: '16px 12px', borderRight: '1px solid #1E293B',
    }}>
      <div style={{display:'flex', alignItems:'center', gap:10, padding:'8px 10px 20px'}}>
        <div style={{
          width:32, height:32, borderRadius:8,
          background:'linear-gradient(135deg, #6366F1, #8B5CF6)',
          display:'flex', alignItems:'center', justifyContent:'center',
          color:'#fff', fontWeight:700, fontSize:14,
        }}>ㅋ</div>
        <div>
          <div style={{color:'#F1F5F9', fontWeight:600, fontSize:13}}>카이키키</div>
          <div style={{color:'#64748B', fontSize:11, marginTop:1}}>부평본점</div>
        </div>
      </div>

      <nav style={{display:'flex', flexDirection:'column', gap:2, flex:1}}>
        {items.map((it, i) => (
          <div key={i} style={{
            display:'flex', alignItems:'center', gap:10,
            padding:'8px 10px', borderRadius:6,
            background: it.active ? 'rgba(99,102,241,0.15)' : 'transparent',
            color: it.active ? '#A5B4FC' : '#94A3B8',
            fontSize:13, fontWeight: it.active ? 500 : 400,
            cursor:'pointer',
          }}>
            {it.icon}
            <span>{it.label}</span>
          </div>
        ))}
      </nav>

      <div style={{borderTop:'1px solid #1E293B', paddingTop:12, marginTop:12}}>
        <div style={{display:'flex', alignItems:'center', gap:10, padding:'8px 10px', color:'#64748B', fontSize:12, cursor:'pointer'}}>
          <IconHelp size={16}/> 도움말
        </div>
      </div>
    </aside>
  );
}

function A_TopBar() {
  const [view, setView] = React.useState('day');
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:12,
      padding:'12px 20px', borderBottom:`1px solid ${A_BORDER}`,
      background:'#fff',
    }}>
      <div style={{display:'flex', alignItems:'center', gap:8, flexShrink:0}}>
        <button style={a_iconBtn}><IconChevronL size={16}/></button>
        <div style={{fontSize:15, fontWeight:600, color:A_INK, whiteSpace:'nowrap'}}>
          2026년 9월 8일 <span style={{color:A_MUTED, fontWeight:400, marginLeft:4}}>화</span>
        </div>
        <button style={a_iconBtn}><IconChevronR size={16}/></button>
        <button style={{...a_ghostBtn, marginLeft:4, whiteSpace:'nowrap'}}>오늘</button>
      </div>

      <div style={{display:'flex', background:'#F1F5F9', borderRadius:6, padding:2, flexShrink:0}}>
        {['day','week','month'].map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            padding:'5px 14px', fontSize:12, fontWeight:500,
            border:'none', borderRadius:4, cursor:'pointer',
            background: view===v ? '#fff' : 'transparent',
            color: view===v ? A_INK : A_MUTED,
            boxShadow: view===v ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
            whiteSpace:'nowrap',
          }}>{v==='day'?'일':v==='week'?'주':'월'}</button>
        ))}
      </div>

      <div style={{flex:1, minWidth:8}}/>

      <div style={{position:'relative', flexShrink:0}}>
        <IconSearch size={14} style={{position:'absolute', left:10, top:9, color:A_MUTED}}/>
        <input placeholder="고객명 · 전화번호 검색" style={{
          height:32, padding:'0 10px 0 30px', width:220,
          border:`1px solid ${A_BORDER}`, borderRadius:6,
          fontSize:12, background:'#fff', color:A_INK,
          fontFamily:'inherit', outline:'none',
        }}/>
      </div>

      <label style={{display:'flex', alignItems:'center', gap:6, fontSize:12, color:A_MUTED, whiteSpace:'nowrap', flexShrink:0}}>
        <input type="checkbox" style={{margin:0}}/> 전체매장
      </label>

      <button style={{...a_iconBtn, flexShrink:0}}><IconBell size={16}/></button>

      <button style={{
        display:'flex', alignItems:'center', gap:6,
        padding:'7px 12px', background: A_INDIGO, color:'#fff',
        border:'none', borderRadius:6, fontSize:12, fontWeight:500,
        cursor:'pointer', flexShrink:0, whiteSpace:'nowrap',
      }}>
        <IconPlus size={14}/> 예약 추가
      </button>
    </div>
  );
}

function A_TimeGrid() {
  // 시간 슬롯 생성 (30분 단위)
  const slots = [];
  for (let m = DAY_START; m < DAY_END; m += SLOT_MIN) slots.push(m);

  const now = 14 * 60 + 22; // 데모용 현재시각 표시

  return (
    <div style={{
      flex:1, overflow:'auto', background:'#fff',
      borderRadius:8, border:`1px solid ${A_BORDER}`,
    }}>
      <div style={{
        display:'grid',
        gridTemplateColumns:`${A_TIME_COL_W}px repeat(${DESIGNERS.length}, ${A_DESIGNER_COL_W}px)`,
        minWidth: A_TIME_COL_W + DESIGNERS.length * A_DESIGNER_COL_W,
      }}>
        {/* 헤더 행 */}
        <div style={{
          position:'sticky', top:0, left:0, zIndex:3,
          background:'#fff', height:A_HEADER_H,
          borderBottom:`1px solid ${A_BORDER}`,
        }}/>
        {DESIGNERS.map(d => (
          <div key={d.id} style={{
            position:'sticky', top:0, zIndex:2, background:'#fff',
            height:A_HEADER_H, padding:'0 12px',
            display:'flex', alignItems:'center', gap:8,
            borderBottom:`1px solid ${A_BORDER}`,
            borderLeft:`1px solid ${A_BORDER}`,
          }}>
            <div style={{
              width:28, height:28, borderRadius:'50%',
              background:d.color, color:'#fff', fontSize:11, fontWeight:600,
              display:'flex', alignItems:'center', justifyContent:'center',
              flexShrink:0,
            }}>{d.name.slice(-2,-1)+d.name.slice(-1)}</div>
            <div style={{minWidth:0}}>
              <div style={{fontSize:12.5, fontWeight:600, color:A_INK, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{d.name}</div>
              <div style={{fontSize:10.5, color:A_MUTED, marginTop:1}}>{d.role}</div>
            </div>
          </div>
        ))}

        {/* 시간 슬롯들 */}
        {slots.map((m, i) => {
          const isHour = m % 60 === 0;
          return (
            <React.Fragment key={m}>
              <div style={{
                position:'sticky', left:0, background:'#fff',
                height:A_SLOT_HEIGHT, padding:'2px 8px',
                borderTop: isHour ? `1px solid ${A_BORDER}` : 'none',
                textAlign:'right',
                fontSize:11, color: isHour ? A_INK : A_MUTED,
                fontWeight: isHour ? 500 : 400,
                fontVariantNumeric:'tabular-nums',
                zIndex:1,
              }}>
                {isHour ? minToTime(m) : ''}
              </div>
              {DESIGNERS.map(d => (
                <div key={d.id} style={{
                  height:A_SLOT_HEIGHT,
                  borderTop: isHour ? `1px solid ${A_BORDER}` : `1px dashed #F1F5F9`,
                  borderLeft: `1px solid ${A_BORDER}`,
                  position:'relative',
                }}/>
              ))}
            </React.Fragment>
          );
        })}

        {/* 예약 카드 오버레이 — 절대위치로 절대층에 배치 */}
        <A_ReservationLayer/>

        {/* 현재시각 라인 */}
        <A_NowLine now={now}/>
      </div>
    </div>
  );
}

function A_ReservationLayer() {
  return (
    <div style={{
      gridColumn: `1 / ${DESIGNERS.length + 2}`,
      gridRow: `2 / ${(DAY_END - DAY_START)/SLOT_MIN + 2}`,
      position:'relative', pointerEvents:'none',
    }}>
      {RESERVATIONS.map(r => {
        const designerIdx = DESIGNERS.findIndex(d => d.id === r.designer);
        if (designerIdx < 0) return null;
        const top = (timeToMin(r.start) - DAY_START) / SLOT_MIN * A_SLOT_HEIGHT;
        const height = r.duration / SLOT_MIN * A_SLOT_HEIGHT - 2;
        const left = A_TIME_COL_W + designerIdx * A_DESIGNER_COL_W;

        if (r.type === 'block') {
          return (
            <div key={r.id} style={{
              position:'absolute', top, left: left+2, height,
              width: A_DESIGNER_COL_W - 4,
              background: 'repeating-linear-gradient(45deg, #F8FAFC, #F8FAFC 6px, #F1F5F9 6px, #F1F5F9 12px)',
              border:'1px dashed #CBD5E1', borderRadius:4,
              padding:'6px 8px', pointerEvents:'auto',
              display:'flex', alignItems:'center', gap:5,
              fontSize:11, color:A_MUTED,
            }}>
              <IconCoffee size={12}/> {r.label}
            </div>
          );
        }

        const st = A_STATUS[r.status];
        return (
          <div key={r.id} style={{
            position:'absolute', top, left: left+2, height,
            width: A_DESIGNER_COL_W - 4,
            background: st.bg, borderRadius:4,
            borderLeft:`3px solid ${st.bar}`,
            padding:'5px 8px 5px 9px', pointerEvents:'auto',
            cursor:'pointer', overflow:'hidden',
            transition:'transform 0.1s',
          }}>
            <div style={{fontSize:10.5, color:st.text, fontWeight:600, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.01em'}}>
              {r.start}
              {r.memo && <span title={r.memo} style={{marginLeft:4, color:'#F59E0B'}}>●</span>}
            </div>
            <div style={{fontSize:12, color:A_INK, fontWeight:600, marginTop:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
              {r.customer}
            </div>
            {height > 36 && (
              <div style={{fontSize:11, color:A_MUTED, marginTop:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                {r.menu}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function A_NowLine({ now }) {
  const top = (now - DAY_START) / SLOT_MIN * A_SLOT_HEIGHT;
  return (
    <div style={{
      gridColumn: `1 / ${DESIGNERS.length + 2}`,
      gridRow: `2 / ${(DAY_END - DAY_START)/SLOT_MIN + 2}`,
      position:'relative', pointerEvents:'none',
    }}>
      <div style={{
        position:'absolute', top, left:0, right:0, height:1,
        background:'#EF4444', zIndex:5,
      }}>
        <div style={{
          position:'absolute', left:A_TIME_COL_W-6, top:-6,
          width:12, height:12, borderRadius:'50%',
          background:'#EF4444', border:'2px solid #fff',
        }}/>
        <div style={{
          position:'absolute', left:4, top:-9,
          fontSize:10, fontWeight:600, color:'#EF4444',
          background:'#fff', padding:'0 3px',
          fontVariantNumeric:'tabular-nums',
        }}>NOW</div>
      </div>
    </div>
  );
}

function A_RightPanel() {
  const revChange = ((SUMMARY.todayRevenue - SUMMARY.yesterdayRevenue) / SUMMARY.yesterdayRevenue * 100).toFixed(1);
  return (
    <aside style={{
      width:280, background:'#fff', borderLeft:`1px solid ${A_BORDER}`,
      display:'flex', flexDirection:'column', padding:20, gap:20, overflow:'auto',
    }}>
      {/* 매출 위젯 */}
      <div>
        <div style={{fontSize:11, color:A_MUTED, fontWeight:500, letterSpacing:'0.02em', marginBottom:6}}>오늘 매출</div>
        <div style={{fontSize:24, fontWeight:700, color:A_INK, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em'}}>
          ₩ {new Intl.NumberFormat('ko-KR').format(SUMMARY.todayRevenue)}
        </div>
        <div style={{display:'flex', alignItems:'center', gap:4, marginTop:6, fontSize:11}}>
          <IconTrend size={12} style={{color:'#10B981'}}/>
          <span style={{color:'#10B981', fontWeight:600}}>+{revChange}%</span>
          <span style={{color:A_MUTED}}>어제 대비</span>
        </div>
      </div>

      <div style={{height:1, background:A_BORDER}}/>

      {/* 오늘 예약 요약 */}
      <div>
        <div style={{fontSize:11, color:A_MUTED, fontWeight:500, letterSpacing:'0.02em', marginBottom:10}}>오늘 예약 · {SUMMARY.totalBookings}건</div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
          <A_Stat label="완료"   value={SUMMARY.completed} color="#10B981"/>
          <A_Stat label="예정"   value={SUMMARY.upcoming}  color="#6366F1"/>
          <A_Stat label="노쇼"   value={SUMMARY.noshow}    color="#EF4444"/>
          <A_Stat label="취소"   value={SUMMARY.cancelled} color="#94A3B8"/>
        </div>
      </div>

      <div style={{height:1, background:A_BORDER}}/>

      {/* 대기 현황 */}
      <div>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10}}>
          <div style={{fontSize:11, color:A_MUTED, fontWeight:500, letterSpacing:'0.02em'}}>대기 현황 · {WAITING_LIST.length}명</div>
          <div style={{
            width:8, height:8, borderRadius:'50%', background:'#F59E0B',
            boxShadow:'0 0 0 3px #FEF3C7',
          }}/>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:6}}>
          {WAITING_LIST.map((w, i) => (
            <div key={i} style={{
              padding:'10px 12px', border:`1px solid ${A_BORDER}`, borderRadius:6,
            }}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
                <div style={{fontSize:13, fontWeight:600, color:A_INK}}>{w.name}</div>
                <div style={{fontSize:11, color:'#B45309', fontWeight:600}}>{w.wait}분 대기</div>
              </div>
              <div style={{fontSize:11, color:A_MUTED, marginTop:3}}>
                {w.service} · {w.preferred}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{height:1, background:A_BORDER}}/>

      {/* 범례 */}
      <div>
        <div style={{fontSize:11, color:A_MUTED, fontWeight:500, letterSpacing:'0.02em', marginBottom:10}}>상태 범례</div>
        <div style={{display:'flex', flexDirection:'column', gap:6}}>
          {Object.entries(A_STATUS).map(([k, s]) => (
            <div key={k} style={{display:'flex', alignItems:'center', gap:8, fontSize:12, color:A_INK}}>
              <div style={{width:12, height:12, borderRadius:2, background:s.bg, borderLeft:`3px solid ${s.bar}`}}/>
              {s.label}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function A_Stat({ label, value, color }) {
  return (
    <div style={{
      padding:'10px 12px', border:`1px solid ${A_BORDER}`, borderRadius:6,
    }}>
      <div style={{fontSize:10.5, color:A_MUTED}}>{label}</div>
      <div style={{fontSize:18, fontWeight:700, color, marginTop:2, fontVariantNumeric:'tabular-nums'}}>{value}</div>
    </div>
  );
}

const a_iconBtn = {
  width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center',
  border:`1px solid ${A_BORDER}`, borderRadius:6, background:'#fff',
  color:A_INK, cursor:'pointer',
};
const a_ghostBtn = {
  padding:'6px 10px', border:`1px solid ${A_BORDER}`, borderRadius:6,
  background:'#fff', color:A_INK, fontSize:12, fontWeight:500, cursor:'pointer',
};

function VariantA() {
  return (
    <div style={{
      display:'flex', height:'100%',
      fontFamily:"'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
      background: A_BG, color: A_INK,
    }}>
      <A_SideBar/>
      <div style={{flex:1, display:'flex', flexDirection:'column', minWidth:0}}>
        <A_TopBar/>
        <div style={{flex:1, display:'flex', gap:0, padding:20, minHeight:0}}>
          <A_TimeGrid/>
        </div>
      </div>
      <A_RightPanel/>
    </div>
  );
}

window.VariantA = VariantA;
