// 예약 페이지 우측 세로 사이드 패널: (대기+시술중 합침) + 예약 리스트

const {
  C_BLUE, C_BLUE_SOFT, C_INK, C_MUTED, C_BORDER, C_BG, C_SURFACE,
} = window;

// 날짜별 예약 목업: 오늘은 실제 RESERVATIONS, 다른 날은 결정론적 생성
const SP_TODAY = new Date(2026, 9, 1);
function SP_mockDay(offset) {
  const names = ['박서연','강수현','서다은','홍지수','배지영','문가영','이하늘','신유진','김도윤','조은지','박수민','유서진','이수아','장하윤','홍민석','정예린'];
  const menus = ['루트터치업','디지털펌','여자 커트','헤어스파','뿌리염색','클리닉','볼륨매직','남자컷','전체염색','드라이'];
  const ds = DESIGNERS.filter(d => d.id !== 'unassigned').slice(0, 10);
  const cnt = 8 + ((offset * 5 + 3) % 6);
  const out = [];
  for (let i = 0; i < cnt; i++) {
    const h = 10 + ((i * 7 + offset * 3) % 9);
    const m = ((i + offset) % 2) * 30;
    out.push({
      customer: names[(i * 3 + offset * 5 + 16) % names.length],
      start: `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`,
      menu: menus[(i * 2 + offset) % menus.length],
      designer: i === 2 && offset % 3 === 0 ? 'unassigned' : ds[(i + offset * 2 + 10) % ds.length].id,
      duration: 60,
    });
  }
  return out.sort((x, y) => x.start.localeCompare(y.start));
}

function C_ReservationSidePanel() {
  const [dayOffset, setDayOffset] = React.useState(0);
  // 수동으로 지운 건 (진행중 / 날짜별 예약 공통)
  const [hidden, setHidden] = React.useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('crm-sp-hidden') || '[]')); } catch (e) { return new Set(); }
  });
  const [lastHidden, setLastHidden] = React.useState(null);
  React.useEffect(() => { localStorage.setItem('crm-sp-hidden', JSON.stringify([...hidden])); }, [hidden]);
  React.useEffect(() => { if (!lastHidden) return; const t = setTimeout(() => setLastHidden(null), 4000); return () => clearTimeout(t); }, [lastHidden]);
  const hide = (key, name) => { setHidden(h => new Set(h).add(key)); setLastHidden({ key, name }); };
  const undo = () => { if (!lastHidden) return; setHidden(h => { const n = new Set(h); n.delete(lastHidden.key); return n; }); setLastHidden(null); };
  const aKey = (a) => `a|${a.name}|${a.time}`;
  const rKey = (r) => `r|${dayOffset}|${r.customer}|${r.start}`;
  // 대기 + 시술중 → 하나로 합쳐 시간순
  const activeList = React.useMemo(() => {
    const wait = WAITING_LIST.map(w => ({
      status: 'waiting',
      name: w.name,
      time: w.arrivedAt,
      service: w.service,
      designer: w.preferred,
      memo: `대기 ${w.wait}분 · 선호 디자이너 ${w.preferred}`,
    }));
    const inSvc = IN_SERVICE_LIST.map(s => ({
      status: 'in_service',
      name: s.name,
      time: s.startAt,
      service: s.service,
      designer: s.designer,
      memo: `${s.startAt} 시작 · 진행 ${s.elapsed}/${s.total}분 (${Math.round(s.elapsed / s.total * 100)}%)`,
      elapsed: s.elapsed,
      total: s.total,
    }));
    return [...wait, ...inSvc].sort((a, b) => a.time.localeCompare(b.time)).filter(a => !hidden.has(aKey(a)));
  }, [hidden]);

  // 오늘 예약 (confirmed만, 진행중과 중복 배제, 10~15건, 미지정 1~2) — 다른 날은 목업
  const reservationsSorted = React.useMemo(() => {
    if (dayOffset !== 0) return SP_mockDay(dayOffset);
    const activeNames = new Set([
      ...WAITING_LIST.map(w => w.name),
      ...IN_SERVICE_LIST.map(s => s.name),
    ]);
    const confirmed = RESERVATIONS.filter(r =>
      r.status === 'confirmed' && !activeNames.has(r.customer) && !r.type,
    );
    const sorted = confirmed.sort((a, b) => a.start.localeCompare(b.start));
    // 미지정 최대 2건만 유지
    const unassigned = sorted.filter(r => r.designer === 'unassigned').slice(0, 2);
    const assigned = sorted.filter(r => r.designer !== 'unassigned').slice(0, 12);
    return [...unassigned, ...assigned].sort((a, b) => a.start.localeCompare(b.start));
  }, [dayOffset]);
  const reservationsShown = reservationsSorted.filter(r => !hidden.has(rKey(r)));

  const dayDate = new Date(SP_TODAY); dayDate.setDate(SP_TODAY.getDate() + dayOffset);
  const dayLabel = dayOffset === 0 ? '오늘 예약' : dayOffset === 1 ? '내일 예약' : dayOffset === -1 ? '어제 예약' : '예약';
  const dateLabel = `${dayDate.getMonth() + 1}.${dayDate.getDate()} (${['일','월','화','수','목','금','토'][dayDate.getDay()]})`;

  return (
    <div style={{
      width:260, flexShrink:0, height:'100%',
      background:C_SURFACE,
      borderLeft:`1px solid ${C_BORDER}`,
      display:'flex', flexDirection:'column', overflow:'hidden',
    }}>
      {/* 진행중 (대기 + 시술중) */}
      <SP_SectionHeader label="진행중" count={activeList.length}/>
      <div style={{maxHeight:'42%', overflowY:'auto', padding:'4px 8px 8px'}}>
        {activeList.length === 0 ? (
          <SP_Empty>진행 중인 고객이 없습니다</SP_Empty>
        ) : (
          activeList.map((a, i) => (
            <SP_Row key={aKey(a)} data={a} showStatus onDismiss={() => hide(aKey(a), a.name)}/>
          ))
        )}
      </div>

      {/* 날짜별 예약 리스트 (화살표로 하루씩 이동) */}
      <div style={{
        padding:'8px 8px 6px 12px', borderTop:`1px solid ${C_BORDER}`,
        display:'flex', alignItems:'center', gap:4, flexShrink:0,
      }}>
        <span style={{fontSize:11.5, fontWeight:800, color:C_INK, letterSpacing:'-0.01em', whiteSpace:'nowrap'}}>{dayLabel}</span>
        <span style={{fontSize:10, fontWeight:700, color:C_MUTED, fontVariantNumeric:'tabular-nums'}}>{reservationsShown.length}</span>
        <div style={{flex:1}}/>
        <button onClick={() => setDayOffset(o => o - 1)} style={sp_navBtn} title="전날"><IconChevronL size={12}/></button>
        <button onClick={() => setDayOffset(0)} title="오늘로" style={{
          ...sp_navBtn, width:'auto', padding:'0 7px', fontSize:11, fontWeight:800,
          color: dayOffset === 0 ? C_BLUE : C_INK, background: dayOffset === 0 ? C_BLUE_SOFT : C_SURFACE,
          borderColor: dayOffset === 0 ? `${C_BLUE}55` : C_BORDER, fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap',
        }}>{dateLabel}</button>
        <button onClick={() => setDayOffset(o => o + 1)} style={sp_navBtn} title="다음날"><IconChevronR size={12}/></button>
      </div>
      <div style={{flex:1, overflowY:'auto', padding:'4px 8px 8px', minHeight:0}}>
        {reservationsShown.length === 0 ? (
          <SP_Empty>등록된 예약이 없습니다</SP_Empty>
        ) : (
          reservationsShown.map((r, i) => (
            <SP_Row key={rKey(r)} onDismiss={() => hide(rKey(r), r.customer)} data={{
              status: 'booked',
              name: r.customer,
              time: r.start,
              service: r.menu,
              designer: DESIGNERS.find(d => d.id === r.designer)?.name || '미지정',
              memo: r.memo,
              duration: r.duration,
            }}/>
          ))
        )}
      </div>

      {/* 지운 건 되돌리기 */}
      {(lastHidden || hidden.size > 0) && (
        <div style={{
          flexShrink:0, borderTop:`1px solid ${C_BORDER}`, padding:'7px 10px',
          display:'flex', alignItems:'center', gap:6, fontSize:11, color:C_MUTED,
          background: lastHidden ? '#0B1425' : '#FBFCFE', transition:'background 0.15s',
        }}>
          {lastHidden ? (
            <>
              <span style={{color:'#fff', flex:1, minWidth:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}><b>{lastHidden.name}</b> 님을 목록에서 지웠어요</span>
              <button onClick={undo} style={{border:'none', background:'transparent', color:'#93C5FD', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit', padding:0}}>되돌리기</button>
            </>
          ) : (
            <>
              <span style={{flex:1}}>지운 항목 {hidden.size}건</span>
              <button onClick={() => setHidden(new Set())} style={{border:'none', background:'transparent', color:C_BLUE, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit', padding:0}}>모두 다시 보기</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function SP_SectionHeader({ label, count, noTopBorder }) {
  return (
    <div style={{
      padding:'10px 12px 6px',
      borderTop: noTopBorder === false ? `1px solid ${C_BORDER}` : 'none',
      display:'flex', alignItems:'center', gap:6, flexShrink:0,
    }}>
      <span style={{fontSize:11.5, fontWeight:800, color:C_INK, letterSpacing:'-0.01em'}}>
        {label}
      </span>
      <span style={{
        fontSize:10, fontWeight:700, color:C_MUTED,
        fontVariantNumeric:'tabular-nums',
      }}>{count}</span>
    </div>
  );
}

function SP_Empty({ children }) {
  return (
    <div style={{
      padding:'16px 12px', textAlign:'center',
      color:'#94A3B8', fontSize:11,
    }}>{children}</div>
  );
}

// 한 줄 카드: 이름 · 시간 · 시술 · 담당 (호버시 툴팁)
function SP_Row({ data, showStatus, onDismiss }) {
  const [hover, setHover] = React.useState(false);
  const [tipPos, setTipPos] = React.useState({ top: 0, left: 0 });
  const rowRef = React.useRef(null);
  const designer = DESIGNERS.find(d => d.name === data.designer);
  const color = designer?.color || '#94A3B8';
  const asset = window.CUSTOMER_ASSETS ? window.CUSTOMER_ASSETS[data.name] : null;
  const hasTicket = asset && asset.tickets.some(t => t.remain > 0);

  // 상태별 좌측 라인 색상 (카드용)
  const statusColor = data.status === 'waiting' ? '#F59E0B'
    : data.status === 'in_service' ? C_BLUE
    : C_BORDER;
  // 툴팁 배지용 색상 (예약은 회색톤 대비 확보)
  const badgeColor = data.status === 'waiting' ? '#F59E0B'
    : data.status === 'in_service' ? C_BLUE
    : '#64748B';

  const statusLabel = data.status === 'waiting' ? '대기'
    : data.status === 'in_service' ? '시술중'
    : '예약';

  const onEnter = (e) => {
    e.currentTarget.style.background = '#FBFCFE';
    if (rowRef.current) {
      const r = rowRef.current.getBoundingClientRect();
      setTipPos({ top: r.top + r.height/2, left: r.left - 8 });
    }
    setHover(true);
  };
  const onLeave = (e) => {
    e.currentTarget.style.background = C_SURFACE;
    setHover(false);
  };

  return (
    <>
    <div ref={rowRef} style={{
      padding:'7px 9px', marginBottom:3,
      background:C_SURFACE, border:`1px solid ${C_BORDER}`,
      borderLeft:`3px solid ${statusColor}`,
      borderRadius:6, cursor:'pointer',
      display:'flex', alignItems:'center', gap:6,
      position:'relative',
    }}
    onMouseEnter={onEnter}
    onMouseLeave={onLeave}
    onClick={() => { setHover(false); window.__openSales && window.__openSales({ customer: data.name, menu: data.service, designerName: data.designer, time: data.time, memo: data.memo }); }}
    >
      {/* 시간 */}
      <span style={{
        fontSize:10.5, fontWeight:800, color: C_BLUE,
        fontVariantNumeric:'tabular-nums', letterSpacing:'-0.01em',
        flexShrink:0, width:34,
      }}>{data.time}</span>

      {/* 이름 + 보유 자산 배지 */}
      <span style={{
        fontSize:12, fontWeight:800, color:C_INK, letterSpacing:'-0.01em',
        flexShrink:0, minWidth:0,
      }}>{data.name}</span>
      {asset && (asset.membership > 0 || hasTicket) && (
        <span style={{display:'inline-flex', gap:2, flexShrink:0}}>
          {asset.membership > 0 && <span style={{...sp_badge, background:'#7C3AED'}} title={`정액권 잔액 ${new Intl.NumberFormat('ko-KR').format(asset.membership)}원`}>정</span>}
          {hasTicket && <span style={{...sp_badge, background:'#0E7490'}} title={asset.tickets.map(t => `${t.name} ${t.remain}회`).join(', ')}>티</span>}
        </span>
      )}

      {/* 시술 (남는 공간, 잘림) */}
      <span style={{
        fontSize:11, color:C_MUTED,
        whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
        flex:1, minWidth:0,
      }}>{data.service}</span>

      {/* 담당자 (점 + 이름) */}
      <span style={{
        display:'inline-flex', alignItems:'center', gap:3,
        fontSize:10.5, color:C_INK, fontWeight:600,
        flexShrink:0,
      }}>
        <span style={{width:5, height:5, borderRadius:'50%', background:color}}/>
        {data.designer}
      </span>

      {/* 수동 삭제 */}
      {onDismiss && (
        <button
          title="목록에서 지우기"
          onClick={(e) => { e.stopPropagation(); setHover(false); onDismiss(); }}
          onMouseEnter={(e) => { e.stopPropagation(); setHover(false); e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#DC2626'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; }}
          style={{
            width:18, height:18, flexShrink:0, marginRight:-3, padding:0,
            border:'none', borderRadius:4, background:'transparent', color:'#94A3B8',
            display:'inline-flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
          }}><IconX size={11} stroke={2.2}/></button>
      )}
    </div>

    {/* 호버 툴팁 - 사이드 패널 왼쪽에 뜸 */}
    {hover && ReactDOM.createPortal(
      <div style={{
        position:'fixed', top: tipPos.top, left: tipPos.left,
        transform:'translate(-100%, -50%)',
        zIndex:200,
        background:'#0B1425', color:'#fff',
        borderRadius:8, padding:'10px 12px',
        boxShadow:'0 8px 24px rgba(11,20,37,0.4)',
        minWidth:200, maxWidth:280,
        pointerEvents:'none',
      }}>
        {/* 화살표 */}
        <div style={{
          position:'absolute', top:'50%', right:-5, transform:'translateY(-50%) rotate(45deg)',
          width:10, height:10, background:'#0B1425',
        }}/>
        <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:6}}>
          <span style={{
            fontSize:9.5, fontWeight:800, padding:'1px 6px', borderRadius:6,
            background:badgeColor, color:'#fff',
          }}>{statusLabel}</span>
          <span style={{fontSize:12, fontWeight:800, letterSpacing:'-0.01em'}}>{data.name}</span>
          <span style={{fontSize:10.5, opacity:0.7, marginLeft:'auto', fontVariantNumeric:'tabular-nums'}}>
            {data.time}{data.duration ? `~${addMin(data.time, data.duration)}` : ''}
          </span>
        </div>
        <div style={{fontSize:11, lineHeight:1.5, marginBottom:6, opacity:0.9}}>
          <span style={{opacity:0.6, marginRight:6}}>시술</span>{data.service}
        </div>
        <div style={{fontSize:11, lineHeight:1.5, marginBottom: (data.memo || asset) ? 6 : 0, opacity:0.9}}>
          <span style={{opacity:0.6, marginRight:6}}>담당</span>{data.designer}
        </div>
        {asset && asset.membership > 0 && (
          <div style={{fontSize:11, lineHeight:1.5, opacity:0.95, display:'flex', alignItems:'center', gap:5}}>
            <span style={{...sp_badge, background:'#7C3AED'}}>정</span>
            정액권 <b style={{fontVariantNumeric:'tabular-nums'}}>{new Intl.NumberFormat('ko-KR').format(asset.membership)}원</b>
          </div>
        )}
        {hasTicket && (
          <div style={{fontSize:11, lineHeight:1.5, opacity:0.95, display:'flex', alignItems:'center', gap:5, marginTop:2}}>
            <span style={{...sp_badge, background:'#0E7490'}}>티</span>
            {asset.tickets.filter(t => t.remain > 0).map(t => `${t.name} ${t.remain}회`).join(' · ')}
          </div>
        )}
        {data.memo && (
          <div style={{
            fontSize:10.5, lineHeight:1.5, marginTop:8, paddingTop:8,
            borderTop:'1px solid rgba(255,255,255,0.15)',
            opacity:0.85,
          }}>
            <span style={{opacity:0.6, marginRight:6, fontSize:10}}>메모</span>
            {data.memo}
          </div>
        )}
      </div>,
      document.body,
    )}
    </>
  );
}

function addMin(hhmm, mins) {
  const [h, m] = hhmm.split(':').map(Number);
  const total = h*60 + m + mins;
  return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
}

const sp_badge = {
  display:'inline-flex', alignItems:'center', justifyContent:'center',
  width:14, height:14, borderRadius:4, color:'#fff', fontSize:9, fontWeight:900, lineHeight:1,
};
const sp_navBtn = {
  width:22, height:22, borderRadius:6, border:`1px solid ${C_BORDER}`, background:C_SURFACE,
  color:C_INK, cursor:'pointer', display:'inline-flex', alignItems:'center', justifyContent:'center',
  fontFamily:'inherit', padding:0,
};

window.C_ReservationSidePanel = C_ReservationSidePanel;
