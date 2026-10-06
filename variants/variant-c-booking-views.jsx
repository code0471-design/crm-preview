// 예약 페이지 - 주간/월간 뷰

const {
  C_BLUE, C_BLUE_SOFT, C_INK, C_MUTED, C_BORDER, C_BG, C_SURFACE,
} = window;

// ============ 주간 뷰 (요일 x 시간, 전체 디자이너 컬러 겹침) ============
function C_BookingWeekView({ selDate, setSelDate, setView, statusFilter, designerFilter, setDesignerFilter }) {
  // selDate 기준 주의 월~일
  const base = new Date(selDate.y, selDate.m - 1, selDate.d);
  const dow = base.getDay(); // 0=일
  const monday = new Date(base);
  monday.setDate(base.getDate() - ((dow + 6) % 7));

  const days = Array.from({length: 7}, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const today = new Date(2026, 8, 21);

  // 표시할 예약: 예약만 노출 (블록/취소 제외), statusFilter 적용
  const filtered = React.useMemo(() => {
    return RESERVATIONS.filter(r => {
      if (r.type === 'block') return false;
      if (r.status === 'cancelled') return false;
      if (r.status && statusFilter && !statusFilter[r.status]) return false;
      return true;
    });
  }, [statusFilter]);

  // 시간대: 9:00~20:00, 30분 단위
  const SLOT_MIN = 30;
  const DAY_START = 9 * 60, DAY_END = 20 * 60;
  const SLOT_H = 26;
  const TIME_COL_W = 56;

  const timeSlots = [];
  for (let m = DAY_START; m < DAY_END; m += SLOT_MIN) timeSlots.push(m);

  return (
    <div style={{
      flex:1, display:'flex', flexDirection:'column', minHeight:0, overflow:'hidden',
      background:C_SURFACE,
    }}>
      {/* 주간 시간 그리드 - 시간별 행에 예약 텍스트 삽입 (자동 확장) */}
      <div style={{flex:1, overflow:'auto', minHeight:0}}>
        <BWV_Grid
          days={days} filtered={filtered} today={today}
          selDate={selDate} setSelDate={setSelDate} setView={setView}
          SLOT_H={SLOT_H} SLOT_MIN={SLOT_MIN}
          DAY_START={DAY_START} DAY_END={DAY_END} TIME_COL_W={TIME_COL_W}
        />
      </div>
    </div>
  );
}

function BWV_Grid({ days, filtered, today, selDate, setSelDate, setView, SLOT_H, SLOT_MIN, DAY_START, DAY_END, TIME_COL_W }) {
  // 예약을 (dayIdx, slotStartMin) 버킷에 그룹화
  const buckets = React.useMemo(() => {
    const map = {}; // key: `${dayIdx}-${slotStartMin}`
    filtered.forEach((r, idx) => {
      const dayIdx = idx % 7;
      const [h, m] = r.start.split(':').map(Number);
      const startMin = h*60 + m;
      if (startMin < DAY_START || startMin >= DAY_END) return;
      // 30분 슬롯에 정렬
      const slotMin = Math.floor((startMin - DAY_START) / SLOT_MIN) * SLOT_MIN + DAY_START;
      const key = `${dayIdx}-${slotMin}`;
      if (!map[key]) map[key] = [];
      map[key].push({ r, actualStart: startMin });
    });
    // 각 버킷 시간 오름차순
    Object.values(map).forEach(arr => arr.sort((a,b) => a.actualStart - b.actualStart));
    return map;
  }, [filtered, DAY_START, DAY_END, SLOT_MIN]);

  const timeSlots = [];
  for (let m = DAY_START; m < DAY_END; m += SLOT_MIN) timeSlots.push(m);

  return (
    <div style={{
      display:'grid',
      gridTemplateColumns:`${TIME_COL_W}px repeat(7, minmax(0, 1fr))`,
      minWidth:'100%',
    }}>
      {/* 요일 헤더 */}
      <div style={{
        position:'sticky', top:0, left:0, zIndex:3, background:'#FBFCFE',
        borderBottom:`1px solid ${C_BORDER}`, borderRight:`1px solid ${C_BORDER}`,
        height:52,
      }}/>
      {days.map((d, i) => {
        const isToday = d.toDateString() === today.toDateString();
        const dwi = d.getDay();
        const isSel = d.getFullYear() === selDate.y && d.getMonth()+1 === selDate.m && d.getDate() === selDate.d;
        const dayItems = filtered.filter((_, idx) => idx % 7 === i);
        return (
          <button key={i}
            onClick={() => { setSelDate({y: d.getFullYear(), m: d.getMonth()+1, d: d.getDate()}); setView('day'); }}
            style={{
              position:'sticky', top:0, zIndex:2, background:'#FBFCFE',
              borderBottom:`1px solid ${C_BORDER}`,
              borderLeft:`1px solid ${C_BORDER}`,
              borderRight: i === 6 ? `1px solid ${C_BORDER}` : 'none',
              height:52, padding:'8px 6px',
              display:'flex', alignItems:'center', justifyContent:'center', gap:5,
              cursor:'pointer', fontFamily:'inherit',
            }}
            onMouseEnter={e => e.currentTarget.style.background = C_BG}
            onMouseLeave={e => e.currentTarget.style.background = '#FBFCFE'}
          >
            <span style={{
              fontSize:11, fontWeight:700, letterSpacing:'0.02em',
              color: dwi === 0 ? '#EF4444' : dwi === 6 ? C_BLUE : C_MUTED,
            }}>{['일','월','화','수','목','금','토'][dwi]}</span>
            <span style={{
              minWidth:24, height:24, padding:'0 4px', borderRadius:12,
              display:'inline-flex', alignItems:'center', justifyContent:'center',
              fontSize:12.5, fontWeight: isSel || isToday ? 800 : 700,
              background: isSel ? C_BLUE : isToday ? C_BLUE_SOFT : 'transparent',
              color: isSel ? '#fff' : isToday ? C_BLUE : C_INK,
              fontVariantNumeric:'tabular-nums',
            }}>{d.getDate()}</span>
            {dayItems.length > 0 && (
              <span style={{
                fontSize:9.5, fontWeight:700, color:C_MUTED,
                padding:'1px 5px', background:C_BG, borderRadius:8,
                fontVariantNumeric:'tabular-nums',
              }}>{dayItems.length}</span>
            )}
          </button>
        );
      })}

      {/* 각 시간 슬롯 행 - 자동 확장 */}
      {timeSlots.map((mm, idx) => {
        const isHour = mm % 60 === 0;
        // 해당 슬롯의 최대 예약 수 (모든 요일 중)
        let maxCount = 1;
        for (let di = 0; di < 7; di++) {
          const c = (buckets[`${di}-${mm}`] || []).length;
          if (c > maxCount) maxCount = c;
        }
        const rowH = Math.max(SLOT_H, maxCount * 22 + 4);
        return (
          <React.Fragment key={mm}>
            <div style={{
              position:'sticky', left:0, zIndex:1, background:'#FBFCFE',
              borderRight:`1px solid ${C_BORDER}`,
              borderTop: isHour ? `1px solid ${C_BORDER}` : `1px dashed #EEF1F6`,
              minHeight:rowH, padding:'2px 6px',
              fontSize:10, color:C_MUTED, fontVariantNumeric:'tabular-nums',
              textAlign:'right', fontWeight:700,
            }}>
              {isHour ? `${String(Math.floor(mm/60)).padStart(2,'0')}:00` : ''}
            </div>
            {days.map((d, di) => {
              const items = buckets[`${di}-${mm}`] || [];
              return (
                <div key={di} style={{
                  borderLeft:`1px solid ${C_BORDER}`,
                  borderRight: di === 6 ? `1px solid ${C_BORDER}` : 'none',
                  borderTop: isHour ? `1px solid ${C_BORDER}` : `1px dashed #EEF1F6`,
                  minHeight:rowH,
                  background: idx % 2 === 0 ? C_SURFACE : '#FBFCFE',
                  padding:'2px 3px', display:'flex', flexDirection:'column', gap:1,
                }}>
                  {items.map(({r}, k) => (
                    <BWV_ReservationLine key={k} r={r}/>
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// 개별 예약 한 줄 (호버 툴팁 포함)
function BWV_ReservationLine({ r }) {
  const [hover, setHover] = React.useState(false);
  const [pos, setPos] = React.useState({top:0, left:0});
  const ref = React.useRef(null);
  const designer = DESIGNERS.find(d => d.id === r.designer);
  const color = designer?.color || '#94A3B8';

  const onEnter = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos({top: rect.top + rect.height/2, left: rect.right + 8});
    }
    setHover(true);
  };
  const onLeave = () => setHover(false);

  return (
    <>
    <div ref={ref}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={() => { setHover(false); window.__openSales && window.__openSales({ customer: r.customer, menu: r.menu, designer: r.designer, start: r.start, memo: r.memo }); }}
      style={{
        display:'flex', alignItems:'center', gap:4,
        padding:'2px 4px 2px 5px',
        borderLeft:`3px solid ${color}`,
        cursor:'pointer', minWidth:0,
        borderRadius:2,
      }}
    >
      <span style={{
        fontSize:10.5, fontWeight:800, color:C_INK, letterSpacing:'-0.01em',
        flexShrink:0,
      }}>{r.customer}</span>
      <span style={{
        fontSize:10, color:C_MUTED,
        whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
        flex:1, minWidth:0,
      }}>· {r.menu}</span>
    </div>

    {hover && ReactDOM.createPortal(
      <div style={{
        position:'fixed', top: pos.top, left: pos.left,
        transform:'translateY(-50%)',
        zIndex:200,
        background:'#0B1425', color:'#fff',
        borderRadius:8, padding:'10px 12px',
        boxShadow:'0 8px 24px rgba(11,20,37,0.4)',
        minWidth:220, maxWidth:280,
        pointerEvents:'none',
      }}>
        {/* 화살표 */}
        <div style={{
          position:'absolute', top:'50%', left:-5, transform:'translateY(-50%) rotate(45deg)',
          width:10, height:10, background:'#0B1425',
        }}/>
        <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:6}}>
          <span style={{
            fontSize:9.5, fontWeight:800, padding:'1px 6px', borderRadius:6,
            background:'#64748B', color:'#fff',
          }}>예약</span>
          <span style={{fontSize:12, fontWeight:800, letterSpacing:'-0.01em'}}>{r.customer}</span>
          <span style={{fontSize:10.5, opacity:0.7, marginLeft:'auto', fontVariantNumeric:'tabular-nums'}}>
            {r.start}{r.duration ? `~${addMinW(r.start, r.duration)}` : ''}
          </span>
        </div>
        <div style={{fontSize:11, lineHeight:1.5, marginBottom:6, opacity:0.9}}>
          <span style={{opacity:0.6, marginRight:6}}>시술</span>{r.menu}
        </div>
        <div style={{fontSize:11, lineHeight:1.5, marginBottom: r.memo ? 6 : 0, opacity:0.9, display:'flex', alignItems:'center', gap:5}}>
          <span style={{opacity:0.6, marginRight:1}}>담당</span>
          <span style={{width:6, height:6, borderRadius:'50%', background:color}}/>
          {designer?.name || '미지정'}
        </div>
        {r.memo && (
          <div style={{
            fontSize:10.5, lineHeight:1.5, marginTop:8, paddingTop:8,
            borderTop:'1px solid rgba(255,255,255,0.15)',
            opacity:0.85,
          }}>
            <span style={{opacity:0.6, marginRight:6, fontSize:10}}>메모</span>
            {r.memo}
          </div>
        )}
      </div>,
      document.body,
    )}
    </>
  );
}

function addMinW(hhmm, mins) {
  const [h, m] = hhmm.split(':').map(Number);
  const total = h*60 + m + mins;
  return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
}

// ============ 월간 뷰 (달력 그리드, 각 날 예약 수) ============
// 각 날짜별 목업 예약 데이터
function generateDayMockBookings(day, month) {
  const count = (day * 3 + month) % 15 + 1;
  const customers = ['박서연','이하늘','강수현','문가영','서다은','유서진','조은지','박수민','배지영','이수아','홍민석','김재원','이도현','장하윤','박태준'];
  const menus = ['루트터치업','디지털펌','남자컷','헤어스파','뿌리염색','드라이','매직스트레이트','볼륨매직','전체염색','뿌리터치'];
  const designers = ['moon','lee','kimmj','jung','park','han','yoon','kang'];
  const bookings = [];
  for (let i = 0; i < count; i++) {
    const h = 9 + Math.floor((i * 47 + day * 3) % 11);
    const mm = ((i * 30) % 60);
    bookings.push({
      time: `${String(h).padStart(2,'0')}:${String(mm).padStart(2,'0')}`,
      customer: customers[(day * 2 + i) % customers.length],
      menu: menus[(day + i * 3) % menus.length],
      designer: designers[(day + i) % designers.length],
    });
  }
  return bookings.sort((a, b) => a.time.localeCompare(b.time));
}

function C_BookingMonthView({ selDate, setSelDate, setView, statusFilter }) {
  const [popover, setPopover] = React.useState(null); // {day, month, year, bookings, anchor}
  const y = selDate.y, m = selDate.m;
  const firstDay = new Date(y, m - 1, 1);
  const lastDay = new Date(y, m, 0);
  const startDow = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const today = { y: 2026, m: 9, d: 21 };

  // 6주 x 7일 셀
  const cells = [];
  for (let i = 0; i < startDow; i++) {
    const d = new Date(y, m - 1, -startDow + i + 1);
    cells.push({ day: d.getDate(), month: d.getMonth()+1, year: d.getFullYear(), other: true });
  }
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, month: m, year: y, other: false });
  while (cells.length % 7 !== 0) {
    const idx = cells.length - startDow - daysInMonth + 1;
    cells.push({ day: idx, month: m+1, year: y, other: true });
  }
  while (cells.length < 42) {
    const idx = cells.length - startDow - daysInMonth + 1;
    cells.push({ day: idx, month: m+1, year: y, other: true });
  }

  // 예약 카운트 (목업: 랜덤성 있는 결정론적 데이터)
  const bookingCount = (day) => {
    return (day * 3 + m) % 15 + 1;
  };

  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', minHeight:0, overflow:'hidden'}}>
      {/* 요일 헤더 */}
      <div style={{
        display:'grid', gridTemplateColumns:'repeat(7, 1fr)',
        borderBottom:`1px solid ${C_BORDER}`, background:'#FBFCFE',
      }}>
        {['일','월','화','수','목','금','토'].map((w, i) => (
          <div key={w} style={{
            padding:'10px 8px', textAlign:'center',
            fontSize:11.5, fontWeight:800,
            color: i === 0 ? '#EF4444' : i === 6 ? C_BLUE : C_MUTED,
            letterSpacing:'0.02em',
            borderRight: i < 6 ? `1px solid ${C_BORDER}` : 'none',
          }}>{w}</div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div style={{
        flex:1, display:'grid',
        gridTemplateColumns:'repeat(7, 1fr)',
        gridAutoRows:'1fr',
        minHeight:0,
      }}>
        {cells.map((c, i) => {
          const dow = i % 7;
          const isToday = c.year === today.y && c.month === today.m && c.day === today.d && !c.other;
          const isSel = c.year === selDate.y && c.month === selDate.m && c.day === selDate.d && !c.other;
          const count = c.other ? 0 : bookingCount(c.day);
          return (
            <div key={i} style={{
              padding:'8px 10px', textAlign:'left',
              borderRight: dow < 6 ? `1px solid ${C_BORDER}` : 'none',
              borderBottom: `1px solid ${C_BORDER}`,
              background: c.other ? '#FAFBFC' : C_SURFACE,
              fontFamily:'inherit',
              display:'flex', flexDirection:'column', gap:4,
              position:'relative',
              opacity: c.other ? 0.5 : 1,
              minHeight:0, minWidth:0,
            }}>
              {/* 상단: 날짜 */}
              <div style={{display:'flex', alignItems:'center', gap:5}}>
                <button
                  disabled={c.other}
                  onClick={() => { setSelDate({y: c.year, m: c.month, d: c.day}); setView('day'); }}
                  style={{
                    border:'none', background: isSel ? C_BLUE : 'transparent',
                    borderRadius:'50%', width:24, height:24,
                    display:'inline-flex', alignItems:'center', justifyContent:'center',
                    cursor: c.other ? 'default' : 'pointer', fontFamily:'inherit',
                    fontSize:12.5, fontWeight: isToday || isSel ? 800 : 600,
                    color: isSel ? '#fff'
                      : dow === 0 ? '#EF4444'
                      : dow === 6 ? C_BLUE
                      : C_INK,
                    fontVariantNumeric:'tabular-nums',
                }}>{c.day}</button>
                {isToday && !isSel && (
                  <span style={{
                    fontSize:9, fontWeight:800, color:C_BLUE,
                    background: '#fff', padding:'1px 5px', borderRadius:8,
                    border:`1px solid ${C_BLUE}`,
                  }}>오늘</span>
                )}
              </div>
              {/* 하단: 예약 N건 (클릭 시 팝오버) */}
              {!c.other && count > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    setPopover({
                      day: c.day, month: c.month, year: c.year,
                      bookings: generateDayMockBookings(c.day, c.month),
                      anchor: { x: rect.left, y: rect.bottom + 6 },
                    });
                  }}
                  style={{
                    marginTop:'auto', alignSelf:'flex-start',
                    padding:'3px 8px', borderRadius:10,
                    border:`1px solid ${C_BLUE}`,
                    background: C_BLUE_SOFT, color: C_BLUE,
                    fontSize:10.5, fontWeight:700, cursor:'pointer',
                    fontVariantNumeric:'tabular-nums', fontFamily:'inherit',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = C_BLUE + '25'}
                  onMouseLeave={e => e.currentTarget.style.background = C_BLUE_SOFT}
                >
                  예약 {count}건
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* 팝오버 */}
      {popover && (
        <BMV_DayPopover
          data={popover}
          onClose={() => setPopover(null)}
          onGoDay={() => {
            setSelDate({y: popover.year, m: popover.month, d: popover.day});
            setView('day');
            setPopover(null);
          }}
        />
      )}
    </div>
  );
}

// 월간뷰 팝오버: 하루 예약 리스트 (메모 스타일)
function BMV_DayPopover({ data, onClose, onGoDay }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [onClose]);

  const dow = ['일','월','화','수','목','금','토'][new Date(data.year, data.month-1, data.day).getDay()];

  // 화면 우측에 걸치지 않게 위치 조정
  const winW = window.innerWidth;
  const popW = 300;
  const left = Math.min(data.anchor.x, winW - popW - 16);

  return ReactDOM.createPortal(
    <div ref={ref} style={{
      position:'fixed', top: data.anchor.y, left,
      width: popW, maxHeight:'60vh',
      background:C_SURFACE, borderRadius:12,
      border:`1px solid ${C_BORDER}`,
      boxShadow:'0 16px 40px rgba(11,20,37,0.22)',
      zIndex:200, display:'flex', flexDirection:'column', overflow:'hidden',
    }}>
      {/* 헤더 */}
      <div style={{
        padding:'12px 14px', borderBottom:`1px solid ${C_BORDER}`,
        background:'#FBFCFE', display:'flex', alignItems:'center', gap:8,
      }}>
        <div style={{flex:1}}>
          <div style={{fontSize:13, fontWeight:800, color:C_INK, letterSpacing:'-0.01em', fontVariantNumeric:'tabular-nums'}}>
            {data.year}. {String(data.month).padStart(2,'0')}. {String(data.day).padStart(2,'0')} <span style={{color:C_MUTED, fontWeight:600, fontSize:11}}>{dow}요일</span>
          </div>
          <div style={{fontSize:10.5, color:C_MUTED, fontWeight:700, marginTop:2}}>
            총 <span style={{color:C_BLUE, fontWeight:800}}>{data.bookings.length}건</span>
          </div>
        </div>
        <button onClick={onClose} style={{
          width:24, height:24, borderRadius:6, border:'none',
          background:'transparent', color:C_MUTED, cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}><IconX size={14}/></button>
      </div>
      {/* 리스트 */}
      <div style={{flex:1, overflowY:'auto', padding:'6px 10px 8px'}}>
        {data.bookings.map((b, i) => {
          const designer = DESIGNERS.find(d => d.id === b.designer);
          const color = designer?.color || '#94A3B8';
          return (
            <div key={i} style={{
              padding:'6px 8px', borderRadius:6,
              borderLeft:`3px solid ${color}`,
              background: '#FBFCFE',
              display:'flex', alignItems:'center', gap:5,
              marginBottom:2, fontSize:11,
            }}>
              <span style={{
                fontSize:10, color:C_MUTED, fontWeight:700,
                fontVariantNumeric:'tabular-nums', flexShrink:0, width:30,
              }}>{b.time}</span>
              <span style={{
                fontSize:11.5, fontWeight:800, color:C_INK, letterSpacing:'-0.01em',
                flexShrink:0,
              }}>{b.customer}</span>
              <span style={{
                fontSize:10.5, color:C_MUTED,
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                flex:1, minWidth:0,
              }}>{b.menu}</span>
              <span style={{
                fontSize:9.5, color: C_INK, fontWeight:600, flexShrink:0,
                display:'inline-flex', alignItems:'center', gap:3,
              }}>
                <span style={{width:5, height:5, borderRadius:'50%', background:color}}/>
                {designer?.name}
              </span>
            </div>
          );
        })}
      </div>
      {/* 푸터: 데이 뷰로 이동 */}
      <div style={{
        padding:'8px 12px', borderTop:`1px solid ${C_BORDER}`,
        background:'#FBFCFE', display:'flex', justifyContent:'flex-end',
      }}>
        <button onClick={onGoDay} style={{
          padding:'6px 12px', background:C_BLUE, color:'#fff',
          border:'none', borderRadius:6, fontSize:11.5, fontWeight:700,
          cursor:'pointer', fontFamily:'inherit',
          display:'inline-flex', alignItems:'center', gap:4,
        }}>
          이 날 자세히 보기 <IconChevronR size={11}/>
        </button>
      </div>
    </div>,
    document.body,
  );
}

window.C_BookingWeekView = C_BookingWeekView;
window.C_BookingMonthView = C_BookingMonthView;
