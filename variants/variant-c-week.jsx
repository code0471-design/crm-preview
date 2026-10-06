// 매장 일정 - 주간 뷰 (3 layouts: 요일 세로 컬럼 / 매트릭스 / 리스트)

const {
  C_BLUE, C_BLUE_SOFT, C_INK, C_MUTED, C_BORDER, C_BG, C_SURFACE,
} = window;

// 주간 뷰 진입점 (외부에서 layout state 받음)
function C_ScheduleWeek({ year, month, today, layout, events, onDayClick, onCellClick, onEventHover }) {
  // 오늘(9/11 목) 포함하는 주의 시작(일)과 끝(토) — 9/6 ~ 9/12
  const todayDate = new Date(year, month - 1, today.day);
  const dow = todayDate.getDay(); // 4 (목)
  const start = new Date(todayDate); start.setDate(todayDate.getDate() - dow);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    days.push({
      date: d.getDate(),
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      dow: i,
      dateStr: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,
    });
  }

  const eventsByDate = {};
  events.forEach(ev => {
    if (!eventsByDate[ev.date]) eventsByDate[ev.date] = [];
    eventsByDate[ev.date].push(ev);
  });

  if (layout === 'matrix') {
    return <C_WeekMatrix days={days} today={today} eventsByDate={eventsByDate} onCellClick={onCellClick}/>;
  }
  if (layout === 'list') {
    return <C_WeekList days={days} today={today} eventsByDate={eventsByDate} onDayClick={onDayClick}/>;
  }
  return <C_WeekColumns days={days} today={today} eventsByDate={eventsByDate} onDayClick={onDayClick} onEventHover={onEventHover}/>;
}

// ─ 요일 7컬럼 세로 뷰 (기본) ─
function C_WeekColumns({ days, today, eventsByDate, onDayClick, onEventHover }) {
  const dayNames = ['일','월','화','수','목','금','토'];

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100%'}}>
      {/* 요일 헤더 */}
      <div style={{
        display:'grid', gridTemplateColumns:'repeat(7, 1fr)',
        borderBottom:`1px solid ${C_BORDER}`, background:'#FBFCFE',
      }}>
        {days.map(d => {
          const isToday = d.year === today.year && d.month === today.month && d.date === today.day;
          const holiday = HOLIDAYS[d.dateStr];
          return (
            <div key={d.dateStr} style={{
              padding:'12px 10px', textAlign:'center',
              background: isToday ? '#EFF6FF' : holiday ? '#FEF2F2' : 'transparent',
              borderRight: d.dow < 6 ? `1px solid ${C_BORDER}` : 'none',
            }}>
              <div style={{
                fontSize:11, fontWeight:600,
                color: d.dow===0 || holiday ? '#EF4444' : d.dow===6 ? C_BLUE : C_MUTED,
                letterSpacing:'0.02em',
              }}>{dayNames[d.dow]}</div>
              <div style={{
                fontSize:22, fontWeight:700, marginTop:4,
                fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em', lineHeight:1,
                color: isToday ? '#fff'
                  : d.dow===0 || holiday ? '#EF4444'
                  : d.dow===6 ? C_BLUE
                  : C_INK,
                background: isToday ? C_BLUE : 'transparent',
                width: isToday ? 30 : 'auto', height: isToday ? 30 : 'auto',
                borderRadius:'50%',
                display:'inline-flex', alignItems:'center', justifyContent:'center',
              }}>{d.date}</div>
              {holiday && (
                <div style={{fontSize:10.5, color:'#DC2626', fontWeight:600, marginTop:3}}>{holiday}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* 요일 컬럼 본문 */}
      <div style={{
        flex:1, display:'grid', gridTemplateColumns:'repeat(7, 1fr)',
        minHeight:0, overflow:'hidden',
      }}>
        {days.map(d => {
          const isToday = d.year === today.year && d.month === today.month && d.date === today.day;
          const dayEvents = eventsByDate[d.dateStr] || [];
          const dayoffs = dayEvents.filter(e => e.type === 'dayoff');
          return (
            <div key={d.dateStr}
                 onClick={() => onDayClick(d.date, d.month, d.year)}
                 className="c-schedule-cell"
                 style={{
              padding:'10px 8px', minHeight:0, overflow:'auto',
              borderRight: d.dow < 6 ? `1px solid ${C_BORDER}` : 'none',
              background: !isToday && (d.dow === 0 || d.dow === 6) ? '#FAFBFD' : isToday ? '#F9FBFF' : C_SURFACE,
              cursor:'pointer', position:'relative',
            }}>
              {/* 휴무 배지 세로 나열 */}
              <div style={{display:'flex', flexDirection:'column', gap:4}}>
                {dayoffs.length === 0 ? (
                  <div style={{fontSize:11, color:'#CBD5E1', textAlign:'center', padding:'20px 0'}}>휴무 없음</div>
                ) : (
                  dayoffs.map(ev => {
                    const designer = DESIGNERS.find(x => x.id === ev.designerId);
                    if (!designer) return null;
                    return (
                      <div key={ev.id}
                           onMouseEnter={(e) => {
                             const r = e.currentTarget.getBoundingClientRect();
                             onEventHover && onEventHover({ x: r.left, y: r.bottom + 4, ev, designer });
                           }}
                           onMouseLeave={() => onEventHover && onEventHover(null)}
                           onClick={(e) => e.stopPropagation()}
                           style={{
                        padding:'6px 8px', borderRadius:6,
                        background:`${designer.color}18`,
                        borderLeft:`3px solid ${designer.color}`,
                        display:'flex', flexDirection:'column', gap:2,
                        cursor:'pointer',
                      }}>
                        <div style={{fontSize:11.5, fontWeight:600, color:C_INK, letterSpacing:'-0.01em'}}>{designer.name}</div>
                        <div style={{fontSize:10, color:C_MUTED}}>휴무 · 종일</div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* + 아이콘 (hover) */}
              <div className="c-schedule-add-btn" style={{
                position:'absolute', top:6, right:6, width:18, height:18,
                borderRadius:4, background:C_BLUE, color:'#fff',
                display:'none', alignItems:'center', justifyContent:'center',
                fontSize:12, fontWeight:700,
              }}>+</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─ 매트릭스 (7일 × 15명) ─
function C_WeekMatrix({ days, today, eventsByDate, onCellClick }) {
  const designers = DESIGNERS.filter(d => d.id !== 'unassigned');
  const dayNames = ['일','월','화','수','목','금','토'];

  return (
    <div style={{overflow:'auto', width:'100%', height:'100%'}}>
      {/* 헤더 */}
      <div style={{
        display:'grid', gridTemplateColumns:`120px repeat(7, 1fr)`,
        position:'sticky', top:0, background:'#FBFCFE', zIndex:2,
        borderBottom:`1px solid ${C_BORDER}`,
      }}>
        <div style={{padding:'10px 12px', fontSize:11, color:C_MUTED, fontWeight:600, borderRight:`1px solid ${C_BORDER}`}}>
          디자이너 · 요일
        </div>
        {days.map(d => {
          const isToday = d.year === today.year && d.month === today.month && d.date === today.day;
          const holiday = HOLIDAYS[d.dateStr];
          return (
            <div key={d.dateStr} style={{
              padding:'10px 8px', borderRight:`1px solid ${C_BORDER}`,
              background: isToday ? '#EFF6FF' : holiday ? '#FEF2F2' : 'transparent',
              textAlign:'center',
            }}>
              <div style={{fontSize:10.5, color: d.dow===0 || holiday ? '#EF4444' : d.dow===6 ? C_BLUE : C_MUTED, fontWeight:600}}>
                {dayNames[d.dow]} · {d.date}
              </div>
              {holiday && <div style={{fontSize:9.5, color:'#DC2626', marginTop:2}}>{holiday}</div>}
            </div>
          );
        })}
      </div>

      {/* 행 */}
      {designers.map((designer, ri) => (
        <div key={designer.id} style={{
          display:'grid', gridTemplateColumns:`120px repeat(7, 1fr)`,
          borderBottom: ri < designers.length - 1 ? `1px solid ${C_BORDER}` : 'none',
        }}>
          <div style={{
            padding:'0 12px', height:38, display:'flex', alignItems:'center', gap:6,
            borderRight:`1px solid ${C_BORDER}`, background:'#FBFCFE',
            position:'sticky', left:0, zIndex:1,
          }}>
            <div style={{width:3, height:16, borderRadius:2, background:designer.color}}/>
            <div style={{minWidth:0, flex:1}}>
              <div style={{fontSize:12, fontWeight:600, color:C_INK, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{designer.name}</div>
              <div style={{fontSize:10, color:C_MUTED, marginTop:1}}>{designer.role}</div>
            </div>
          </div>
          {days.map(d => {
            const holiday = HOLIDAYS[d.dateStr];
            const isOff = (eventsByDate[d.dateStr] || []).some(ev => ev.designerId === designer.id && ev.type === 'dayoff');
            return (
              <div key={d.dateStr}
                   onClick={() => onCellClick(d.date, designer.id, d.month, d.year)}
                   title={isOff ? `${designer.name} 휴무` : holiday || `${designer.name} 근무`}
                   style={{
                height:38, borderRight:`1px solid ${C_BORDER}`,
                background: isOff
                  ? `repeating-linear-gradient(-45deg, ${designer.color}dd 0, ${designer.color}dd 5px, ${designer.color}99 5px, ${designer.color}99 10px)`
                  : holiday ? '#FEF2F2'
                  : d.dow === 0 || d.dow === 6 ? '#FAFBFD'
                  : C_SURFACE,
                cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                {isOff && <span style={{fontSize:10, fontWeight:700, color:'#fff', letterSpacing:'-0.02em'}}>휴무</span>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─ 리스트 ─
function C_WeekList({ days, today, eventsByDate, onDayClick }) {
  const dayNames = ['일','월','화','수','목','금','토'];
  return (
    <div style={{padding:'16px 20px', display:'flex', flexDirection:'column', gap:10, height:'100%', overflow:'auto', background:C_BG}}>
      {days.map(d => {
        const isToday = d.year === today.year && d.month === today.month && d.date === today.day;
        const holiday = HOLIDAYS[d.dateStr];
        const dayEvents = eventsByDate[d.dateStr] || [];
        const dayoffs = dayEvents.filter(e => e.type === 'dayoff');
        return (
          <div key={d.dateStr}
               onClick={() => onDayClick(d.date, d.month, d.year)}
               style={{
            background: C_SURFACE, borderRadius:10, border:`1px solid ${C_BORDER}`,
            padding:'14px 16px',
            display:'grid', gridTemplateColumns:'90px 1fr', gap:16,
            cursor:'pointer',
            boxShadow: isToday ? `inset 3px 0 0 ${C_BLUE}` : 'none',
          }}>
            <div>
              <div style={{
                fontSize:11, fontWeight:600, letterSpacing:'0.02em',
                color: d.dow===0 || holiday ? '#EF4444' : d.dow===6 ? C_BLUE : C_MUTED,
              }}>{dayNames[d.dow]}요일</div>
              <div style={{
                fontSize:28, fontWeight:700, fontVariantNumeric:'tabular-nums',
                letterSpacing:'-0.03em', lineHeight:1, marginTop:4,
                color: isToday ? C_BLUE : d.dow===0 || holiday ? '#EF4444' : d.dow===6 ? C_BLUE : C_INK,
              }}>{d.date}</div>
              {holiday && <div style={{fontSize:11, color:'#DC2626', marginTop:4, fontWeight:600}}>{holiday}</div>}
              {isToday && <div style={{
                fontSize:10, fontWeight:700, marginTop:6, padding:'2px 6px',
                background:C_BLUE, color:'#fff', borderRadius:10, display:'inline-block',
              }}>오늘</div>}
            </div>
            <div>
              <div style={{fontSize:11, color:C_MUTED, fontWeight:600, marginBottom:8, letterSpacing:'0.02em'}}>
                휴무 · {dayoffs.length}명
              </div>
              {dayoffs.length === 0 ? (
                <div style={{fontSize:12, color:'#CBD5E1', padding:'8px 0'}}>등록된 일정 없음</div>
              ) : (
                <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
                  {dayoffs.map(ev => {
                    const designer = DESIGNERS.find(x => x.id === ev.designerId);
                    if (!designer) return null;
                    return (
                      <div key={ev.id} style={{
                        display:'inline-flex', alignItems:'center', gap:5,
                        padding:'4px 10px', borderRadius:14,
                        background:`${designer.color}18`,
                        border:`1px solid ${designer.color}44`,
                        fontSize:11.5, color:C_INK, fontWeight:600,
                      }}>
                        <span style={{width:6, height:6, borderRadius:'50%', background:designer.color}}/>
                        {designer.name}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

window.C_ScheduleWeek = C_ScheduleWeek;
