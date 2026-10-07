// 시안 C v2 — Dashboard Hybrid 리비전
// 변경사항:
// 1. KPI 스트립 → 별도 대시보드 페이지로 이동 (사이드바에서 이동)
// 2. 헤더 한 줄: 로고+매장명 + 검색 + 비회원입력 + 신규예약
// 3. "ㅋ" → "KK" 로고로 교체
// 4. 서브헤더 한 줄: 예약현황 + 날짜네비 + 뷰전환 + 예약추가
// 5. 디자이너 컬럼 아이콘 제거, 컬럼 폭 축소 (140→112)
// 6. 대기 스트립: 접힘 = 배지, 클릭시 세로 펼침

const C_BLUE = '#1E40AF';
const C_BLUE_SOFT = '#EFF3FC';
const C_CORAL = '#F97066';
const C_INK = '#0B1425';
const C_MUTED = '#5C6B84';
const C_BORDER = '#E5EAF2';
const C_BG = '#F5F7FB';
const C_SURFACE = '#FFFFFF';

const C_STATUS = {
  confirmed: { label: '확정',  bg: '#1E40AF', text: '#fff',    dot: '#1E40AF' },
  visited:   { label: '방문',  bg: '#059669', text: '#fff',    dot: '#059669' },
  pending:   { label: '대기',  bg: '#FFF4D6', text: '#7A4F00', dot: '#D97706' },
  noshow:    { label: '노쇼',  bg: '#F97066', text: '#fff',    dot: '#EF4444' },
  cancelled: { label: '취소',  bg: '#E5EAF2', text: '#5C6B84', dot: '#94A3B8' },
};

const C_SLOT_HEIGHT = 48;
const C_HEADER_H = 44;
const C_TIME_COL_W = 56;
const C_DESIGNER_MIN_W = 96;   // 최소 컬럼 폭 (좁아지면 페이지네이션)

// 로고 (KK)
function C_Logo({ size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 8,
      background: `linear-gradient(135deg, ${C_BLUE} 0%, #3B82F6 100%)`,
      display:'flex', alignItems:'center', justifyContent:'center',
      color:'#fff', fontWeight:800, fontSize: size * 0.4,
      letterSpacing:'-0.04em', flexShrink:0,
      boxShadow: '0 1px 2px rgba(30,64,175,0.25)',
    }}>KK</div>
  );
}

// 대메뉴별 소메뉴 정의 (사이드바 팝오버)
const SCHEDULE_SUB = [
  { id:'booking',  label:'예약 현황' },
  { id:'schedule', label:'매장 일정' },
  { id:'stats',    label:'객수 통계' },
  { id:'closing',   label:'일일 마감' },
  { id:'staff-sub', label:'담당자 대체현황' },
];
const SETTINGS_SUB = [
  { id:'settings-menu',     label:'메뉴 설정' },
  { id:'settings-staff',    label:'스태프 관리' },
  { id:'settings-ops',      label:'운영 관리 설정' },
  { id:'settings-sms',      label:'SMS 매니저 서비스 설정' },
  { id:'settings-payroll',  label:'실시간 급여정산' },
  { id:'settings-lumi',     label:'쌀롱 루미 설정' },
  { id:'settings-phone',    label:'수신전화 설정' },
  { id:'settings-terminal', label:'단말기 설정' },
  { id:'settings-group',    label:'고객 그룹 설정' },
];
const ANALYTICS_SUB = [
  { id:'analytics-dashboard', label:'분석 대시보드' },
  { id:'analytics-sales',     label:'매출 분석' },
  { id:'analytics-customer',  label:'고객 분석' },
  { id:'analytics-terminal',  label:'단말기 설정' },
];
const MARKETING_SUB = [
  { id:'mkt-bulk',    label:'단체발송' },
  { id:'mkt-auto',    label:'자동발송' },
  { id:'mkt-report',  label:'발송내역 & 성과리포트' },
  { id:'mkt-revisit', label:'재방문율' },
  { id:'mkt-charge',  label:'충전관리' },
];
const SUB_MAP = { schedule: SCHEDULE_SUB, settings: SETTINGS_SUB, analytics: ANALYTICS_SUB, marketing: MARKETING_SUB };
const ALL_SUB_IDS = {
  schedule: SCHEDULE_SUB.map(s => s.id),
  settings: SETTINGS_SUB.map(s => s.id),
  analytics: ANALYTICS_SUB.map(s => s.id),
  marketing: MARKETING_SUB.map(s => s.id),
};

// 스텁 페이지 정의 (준비 중 안내)
const STUB_PAGES = {
  'mkt-auto':             { crumbs:['홈','마케팅','자동발송'],          title:'자동발송',            desc:'리마인드·재방문 유도·생일 등 조건에 맞춰 자동으로 발송합니다.' },
  'mkt-report':           { crumbs:['홈','마케팅','발송내역 & 성과리포트'], title:'발송내역 & 성과리포트', desc:'발송 결과와 발송 후 예약·매출 전환을 확인합니다.' },
  'mkt-revisit':          { crumbs:['홈','마케팅','재방문율'],          title:'재방문율',            desc:'디자이너·시술별 재방문율과 이탈 추이를 분석합니다.' },
  'store':                { crumbs:['홈','스토어'],           title:'스토어',              desc:'제품 재고, 발주, 매장 물품 관리 기능이 들어갑니다.' },
  'analytics-dashboard':  { crumbs:['홈','분석','분석 대시보드'],  title:'분석 대시보드',   desc:'매출·객수·시술별 깊은 통계와 리포트를 제공합니다.' },
  'analytics-sales':      { crumbs:['홈','분석','매출 분석'],      title:'매출 분석',       desc:'디자이너별·시술별·시간대별 매출 심화 분석을 제공합니다.' },
  'analytics-customer':   { crumbs:['홈','분석','고객 분석'],      title:'고객 분석',       desc:'재방문율, 이탈률, 채널 성과 등 고객 행동 분석을 제공합니다.' },
  'analytics-terminal':   { crumbs:['홈','분석','단말기 설정'],    title:'단말기 설정',     desc:'카드/POS 단말기 연동을 설정합니다.' },
  'settings-payroll':     { crumbs:['홈','설정','실시간 급여정산'], title:'실시간 급여정산', desc:'디자이너별 매출·수수료를 실시간으로 정산합니다.' },
  'settings-lumi':        { crumbs:['홈','설정','쌀롱 루미'],       title:'쌀롱 루미 설정',   desc:'매장 통합 브랜드 서비스인 쌀롱 루미 연동을 설정합니다.' },
  'settings-terminal':    { crumbs:['홈','설정','단말기 설정'],    title:'단말기 설정',     desc:'카드/POS 단말기 연동을 설정합니다.' },
};

function C_SideBar({ page, onPage }) {
  const items = [
    { id:'dashboard', icon:<IconChart/>,    label:'대시보드' },
    { id:'schedule',  icon:<IconCalendar/>, label:'스케줄', hasSub:true, subKey:'schedule' },
    { id:'marketing', icon:<IconMegaphone/>,label:'마케팅', hasSub:true, subKey:'marketing' },
    { id:'analytics', icon:<IconTrend/>,    label:'분석',  hasSub:true, subKey:'analytics' },
    { id:'store',     icon:<IconStore/>,    label:'스토어' },
  ];
  const bottomItems = [
    { id:'settings', icon:<IconSettings/>, label:'설정', hasSub:true, subKey:'settings', anchor:'bottom' },
  ];
  const [hoverId, setHoverId] = React.useState(null);
  const closeTimerRef = React.useRef(null);

  // 아이콘/팝오버 사이 이동 중에는 팝오버가 사라지지 않도록 약간의 delay
  const openPopover = (id) => {
    if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
    setHoverId(id);
  };
  const scheduleClose = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => { setHoverId(null); closeTimerRef.current = null; }, 180);
  };
  React.useEffect(() => () => { if (closeTimerRef.current) clearTimeout(closeTimerRef.current); }, []);

  return (
    <aside style={{
      width:64, background:C_SURFACE, borderRight:`1px solid ${C_BORDER}`,
      display:'flex', flexDirection:'column', alignItems:'center',
      padding:'16px 0', gap:6, flexShrink:0,
      position:'relative',
    }}>
      {items.map((it) => renderItem(it))}

      <div style={{flex:1}}/>

      {bottomItems.map((it) => renderItem(it))}

      <div style={{
        width:36, height:36, borderRadius:'50%',
        background:'linear-gradient(135deg, #1E40AF, #7C3AED)',
        color:'#fff', fontSize:12, fontWeight:600,
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>정</div>
    </aside>
  );

  function renderItem(it) {
    const subIds = it.hasSub ? ALL_SUB_IDS[it.subKey] : null;
    const active = it.hasSub ? subIds.includes(page) : page === it.id;
    const showPop = it.hasSub && hoverId === it.id;
    const subs = it.hasSub ? SUB_MAP[it.subKey] : null;
    const isBottom = it.anchor === 'bottom';
    return (
      <div key={it.id}
           onMouseEnter={() => it.hasSub ? openPopover(it.id) : setHoverId(it.id)}
           onMouseLeave={() => it.hasSub ? scheduleClose() : setHoverId(null)}
           onClick={() => {
             if (it.hasSub) {
               if (!subIds.includes(page)) onPage(subs[0].id);
             } else {
               onPage(it.id);
             }
           }}
           style={{
        width:44, height:44, borderRadius:8,
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2,
        background: active ? C_BLUE_SOFT : 'transparent',
        color: active ? C_BLUE : C_MUTED,
        cursor:'pointer', position:'relative',
        transition:'background 0.15s',
      }}>
        {active && <div style={{position:'absolute', left:-1, top:8, bottom:8, width:3, background:C_BLUE, borderRadius:'0 2px 2px 0'}}/>}
        {React.cloneElement(it.icon, { size:18 })}
        <span style={{fontSize:9, fontWeight:500}}>{it.label}</span>

        {/* 소메뉴 팝오버 */}
        {showPop && (
          <div
            onMouseEnter={() => openPopover(it.id)}
            onMouseLeave={scheduleClose}
            onClick={e => e.stopPropagation()}
            style={{
            position:'absolute', left:44,
            ...(isBottom ? { bottom:-4 } : { top:-4 }),
            paddingLeft:10,
            zIndex:50,
            cursor:'default',
          }}>
            <div style={{
              minWidth: it.subKey === 'settings' || it.subKey === 'marketing' ? 200 : it.subKey === 'schedule' ? 188 : 160,
              background:C_SURFACE,
              border:`1px solid ${C_BORDER}`, borderRadius:10,
              boxShadow:'0 8px 24px rgba(11,20,37,0.12), 0 2px 4px rgba(11,20,37,0.04)',
              padding:6,
            }}>
              <div style={{
                fontSize:10.5, color:C_MUTED, fontWeight:700, letterSpacing:'0.06em',
                padding:'6px 10px 4px', textTransform:'uppercase',
              }}>{it.label}</div>
              {subs.map(sub => {
                const subActive = page === sub.id;
                return (
                  <div key={sub.id}
                       onClick={() => onPage(sub.id)}
                       style={{
                    padding:'8px 10px', fontSize:13, fontWeight: subActive ? 600 : 500,
                    color: subActive ? C_BLUE : C_INK,
                    background: subActive ? C_BLUE_SOFT : 'transparent',
                    borderRadius:6, cursor:'pointer',
                    display:'flex', alignItems:'center', gap:8,
                  }}
                  onMouseEnter={e => { if (!subActive) e.currentTarget.style.background = '#F8FAFC'; }}
                  onMouseLeave={e => { if (!subActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{
                      width:5, height:5, borderRadius:'50%',
                      background: subActive ? C_BLUE : C_BORDER, flexShrink:0,
                    }}/>
                    {sub.label}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
}

// ============ 헤더 (한 줄) ============
function C_TopHeader({ onOpenCustomerRegister, onOpenGuestSales, onOpenClosing } = {}) {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:12,
      padding:'12px 20px', background:C_SURFACE, borderBottom:`1px solid ${C_BORDER}`,
      position:'relative', zIndex:320,
    }}>
      {/* 로고 + 상호 (한 줄) */}
      <div style={{display:'flex', alignItems:'center', gap:10, flexShrink:0}}>
        <C_Logo size={30}/>
        <div style={{display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap'}}>
          <span style={{fontSize:15, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>카이키키 부평본점</span>
          <IconChevronD size={12} style={{color:C_MUTED, cursor:'pointer'}}/>
        </div>
      </div>

      {/* 전체매장 체크 */}
      <label style={{
        display:'flex', alignItems:'center', gap:6, fontSize:12, color:C_MUTED,
        whiteSpace:'nowrap', flexShrink:0, marginLeft:4, cursor:'pointer',
      }}>
        <input type="checkbox" style={{margin:0}}/> 전체매장 검색
      </label>

      {/* 검색 (플렉시블) */}
      <div style={{position:'relative', flex:1, minWidth:180, maxWidth:340}}>
        <IconSearch size={14} style={{position:'absolute', left:12, top:10, color:C_MUTED}}/>
        <input placeholder="고객명 또는 전화번호를 입력하세요" style={{
          height:34, padding:'0 12px 0 34px', width:'100%',
          border:`1px solid ${C_BORDER}`, borderRadius:8,
          fontSize:12.5, background:C_BG, color:C_INK,
          fontFamily:'inherit', outline:'none',
        }}/>
      </div>

      {/* 알림 */}
      <button style={{...c_iconBtn, flexShrink:0, position:'relative'}}>
        <IconBell size={16}/>
        <span style={{
          position:'absolute', top:6, right:6, width:6, height:6,
          borderRadius:'50%', background:C_CORAL,
        }}/>
      </button>

      {/* 비회원 입력 */}
      <button onClick={onOpenGuestSales} style={{...c_ghostBtn, flexShrink:0, whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:6}}>
        <IconUser size={14}/> 비회원 입력
      </button>

      {/* 신규 추가 (고객 신규 등록) */}
      <button onClick={onOpenCustomerRegister} style={{
        display:'flex', alignItems:'center', gap:6,
        padding:'8px 14px', background: C_BLUE, color:'#fff',
        border:'none', borderRadius:8, fontSize:12.5, fontWeight:600,
        cursor:'pointer', boxShadow:'0 1px 2px rgba(30,64,175,0.2)',
        flexShrink:0, whiteSpace:'nowrap',
      }}>
        <IconPlus size={14}/> 신규
      </button>

      {/* 일일마감 */}
      <button onClick={onOpenClosing} style={{
        display:'flex', alignItems:'center', gap:6,
        padding:'8px 14px', background:'#059669', color:'#fff',
        border:'none', borderRadius:8, fontSize:12.5, fontWeight:600,
        cursor:'pointer', boxShadow:'0 1px 2px rgba(5,150,105,0.25)',
        flexShrink:0, whiteSpace:'nowrap',
      }}>
        <IconCheck size={14}/> 일일마감
      </button>
    </div>
  );
}

// ============ 서브헤더 (예약현황 + 날짜 + 뷰전환 + 필터 + 예약추가 + 페이지네이션) ============
function C_SubHeader({ view, setView, tab, setTab, pageInfo, statusFilter, setStatusFilter, selDate, setSelDate }) {
  const { offset, setOffset, visibleCount, totalCount, showPager } = pageInfo;
  const step = Math.max(1, visibleCount);
  const canPrev = offset > 0;
  const canNext = offset + visibleCount < totalCount;
  const from = totalCount === 0 ? 0 : offset + 1;
  const to = Math.min(offset + visibleCount, totalCount);
  const [calOpen, setCalOpen] = React.useState(false);
  const calRef = React.useRef(null);
  React.useEffect(() => {
    if (!calOpen) return;
    const onDoc = (e) => {
      if (calRef.current && !calRef.current.contains(e.target)) setCalOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [calOpen]);

  const dowKr = (y, m, d) => ['일','월','화','수','목','금','토'][new Date(y, m-1, d).getDay()];
  const stepDate = (delta) => {
    const dt = new Date(selDate.y, selDate.m-1, selDate.d);
    const unitDays = view === 'day' ? 1 : view === 'week' ? 7 : 0;
    if (view === 'month') {
      let m = selDate.m + delta, y = selDate.y;
      if (m < 1) { m = 12; y -= 1; }
      if (m > 12) { m = 1; y += 1; }
      setSelDate(prev => ({ ...prev, y, m }));
      return;
    }
    dt.setDate(dt.getDate() + unitDays * delta);
    setSelDate({ y: dt.getFullYear(), m: dt.getMonth()+1, d: dt.getDate() });
  };
  const goToday = () => setSelDate({ y: 2026, m: 9, d: 21 });

  return (
    <div style={{
      display:'flex', alignItems:'center', gap:8,
      padding:'10px 14px', background:C_SURFACE, borderBottom:`1px solid ${C_BORDER}`,
    }}>
      {/* 날짜 네비 */}
      <div ref={calRef} style={{display:'flex', alignItems:'center', gap:6, flexShrink:0, position:'relative'}}>
        <button onClick={() => stepDate(-1)} style={c_iconBtnSm}><IconChevronL size={14}/></button>
        <button onClick={() => setCalOpen(o => !o)} style={{
          fontSize:12.5, fontWeight:700, color:C_INK, textAlign:'center',
          fontVariantNumeric:'tabular-nums', letterSpacing:'-0.01em',
          background: calOpen ? C_BLUE_SOFT : 'transparent',
          border: `1px solid ${calOpen ? C_BLUE : 'transparent'}`,
          borderRadius:6, padding:'4px 10px', cursor:'pointer',
          fontFamily:'inherit', whiteSpace:'nowrap',
        }}>
          {view === 'month' && `${selDate.y}.${String(selDate.m).padStart(2,'0')}`}
          {view === 'week' && (() => {
            const base = new Date(selDate.y, selDate.m - 1, selDate.d);
            const dow = base.getDay();
            const mon = new Date(base); mon.setDate(base.getDate() - ((dow + 6) % 7));
            const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
            const fmt = (d) => `${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
            const sameYearMonth = mon.getFullYear() === sun.getFullYear() && mon.getMonth() === sun.getMonth();
            return (
              <>
                {mon.getFullYear()}.{fmt(mon)} <span style={{color:C_MUTED, fontWeight:500}}>~</span> {sameYearMonth ? String(sun.getDate()).padStart(2,'0') : fmt(sun)}
              </>
            );
          })()}
          {view === 'day' && (
            <>
              {selDate.y}.{String(selDate.m).padStart(2,'0')}.{String(selDate.d).padStart(2,'0')}
              {' '}<span style={{color:C_MUTED, fontWeight:500}}>{dowKr(selDate.y, selDate.m, selDate.d)}</span>
            </>
          )}
        </button>
        <button onClick={() => stepDate(1)} style={c_iconBtnSm}><IconChevronR size={14}/></button>
        <button onClick={goToday} style={{...c_ghostBtnSm, marginLeft:4}}>오늘</button>

        {calOpen && (
          <C_DateDropdownCal
            selDate={selDate}
            onSelect={(d) => { setSelDate(d); setCalOpen(false); }}
          />
        )}
      </div>

      {/* 뷰 전환 */}
      <div style={{display:'flex', background:C_BG, borderRadius:7, padding:2, border:`1px solid ${C_BORDER}`, flexShrink:0}}>
        {['day','week','month'].map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            padding:'5px 12px', fontSize:12, fontWeight:600,
            border:'none', borderRadius:5, cursor:'pointer',
            background: view===v ? C_SURFACE : 'transparent',
            color: view===v ? C_INK : C_MUTED,
            boxShadow: view===v ? '0 1px 2px rgba(11,20,37,0.06)' : 'none',
            whiteSpace:'nowrap',
          }}>{v==='day'?'일':v==='week'?'주':'월'}</button>
        ))}
      </div>

      {/* 디자이너 페이지 (일 뷰만, 10명 단위) */}
      {showPager && view === 'day' && (() => {
        const pages = Math.ceil(totalCount / visibleCount);
        const page = Math.floor(offset / visibleCount) + 1;
        return (
          <div style={{display:'flex', alignItems:'center', gap:4, flexShrink:0}}>
            <button disabled={page <= 1} onClick={() => setOffset(Math.max(0, offset - visibleCount))}
              style={{...c_pagerBtn, opacity: page > 1 ? 1 : 0.35, cursor: page > 1 ? 'pointer' : 'not-allowed'}}>
              <IconChevronL size={13}/>
            </button>
            <span style={{
              fontSize:11.5, color:C_MUTED, fontWeight:700, fontVariantNumeric:'tabular-nums',
              minWidth:30, textAlign:'center',
            }}><span style={{color:C_INK}}>{page}</span> / {pages}</span>
            <button disabled={page >= pages} onClick={() => setOffset(Math.min((pages - 1) * visibleCount, offset + visibleCount))}
              style={{...c_pagerBtn, opacity: page < pages ? 1 : 0.35, cursor: page < pages ? 'pointer' : 'not-allowed'}}>
              <IconChevronR size={13}/>
            </button>
          </div>
        );
      })()}

      <div style={{flex:1, minWidth:8}}/>

      {/* 액션 (우측): 필터 · 예약추가 */}
      <C_StatusFilterButton statusFilter={statusFilter} setStatusFilter={setStatusFilter}/>
      <button onClick={() => window.__openBookingModal && window.__openBookingModal()} style={{
        display:'flex', alignItems:'center', gap:6,
        padding:'7px 14px', background: C_BLUE, color: '#fff',
        border:'none', borderRadius:7, fontSize:12.5, fontWeight:700,
        cursor:'pointer', flexShrink:0, whiteSpace:'nowrap',
        boxShadow:`0 1px 2px ${C_BLUE}44`,
      }}>
        <IconPlus size={13}/> 예약 추가
      </button>
    </div>
  );
}

// ============ 날짜 드롭다운 캘린더 ============
function C_DateDropdownCal({ selDate, onSelect }) {
  const [year, setYear] = React.useState(selDate.y);
  const [month, setMonth] = React.useState(selDate.m);
  const today = { y: 2026, m: 9, d: 21 };

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDow = new Date(year, month - 1, 1).getDay();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prev = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); } else setMonth(m => m - 1);
  };
  const next = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); } else setMonth(m => m + 1);
  };

  return (
    <div style={{
      position:'absolute', top:'calc(100% + 6px)', left:0,
      width:260, background:C_SURFACE, borderRadius:10,
      border:`1px solid ${C_BORDER}`,
      boxShadow:'0 12px 32px rgba(11,20,37,0.16)',
      zIndex:130, padding:'10px 12px',
    }}>
      {/* 년월 네비 */}
      <div style={{display:'flex', alignItems:'center', gap:4, marginBottom:6}}>
        <button onClick={prev} style={{
          width:24, height:24, borderRadius:6, border:'none',
          background:'transparent', color:C_INK, cursor:'pointer',
          display:'inline-flex', alignItems:'center', justifyContent:'center',
        }}><IconChevronL size={12}/></button>
        <div style={{
          flex:1, textAlign:'center', fontSize:13, fontWeight:800,
          color:C_INK, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.01em',
        }}>{year}년 {String(month).padStart(2,'0')}월</div>
        <button onClick={next} style={{
          width:24, height:24, borderRadius:6, border:'none',
          background:'transparent', color:C_INK, cursor:'pointer',
          display:'inline-flex', alignItems:'center', justifyContent:'center',
        }}><IconChevronR size={12}/></button>
      </div>
      {/* 요일 */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', marginBottom:4}}>
        {['일','월','화','수','목','금','토'].map((w, i) => (
          <div key={w} style={{
            textAlign:'center', fontSize:10.5, fontWeight:700, padding:'4px 0',
            color: i === 0 ? '#EF4444' : i === 6 ? C_BLUE : C_MUTED,
          }}>{w}</div>
        ))}
      </div>
      {/* 날짜 */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:2}}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} style={{height:30}}/>;
          const on = selDate.y === year && selDate.m === month && selDate.d === d;
          const isToday = today.y === year && today.m === month && today.d === d;
          const dow = i % 7;
          return (
            <button key={i} onClick={() => onSelect({y: year, m: month, d})} style={{
              height:30, borderRadius:8, border:'none',
              background: on ? C_BLUE : isToday ? C_BLUE_SOFT : 'transparent',
              color: on ? '#fff'
                : dow === 0 ? '#EF4444'
                : dow === 6 ? C_BLUE
                : C_INK,
              fontSize:12, fontWeight: on ? 800 : isToday ? 700 : 500,
              cursor:'pointer', fontFamily:'inherit', fontVariantNumeric:'tabular-nums',
              boxShadow: on ? `0 2px 6px ${C_BLUE}55` : 'none',
              transition:'all 0.1s',
            }}
            onMouseEnter={e => { if (!on && !isToday) e.currentTarget.style.background = C_BG; }}
            onMouseLeave={e => { if (!on && !isToday) e.currentTarget.style.background = 'transparent'; }}
            >{d}</button>
          );
        })}
      </div>
    </div>
  );
}

// ============ 예약 상태 필터 버튼 + 팝오버 ============
const STATUS_OPTIONS = [
  { id:'confirmed', label:'예약 확정', color: C_BLUE },
  { id:'visited',   label:'방문 완료', color:'#059669' },
  { id:'pending',   label:'담당 미지정', color:'#7C3AED' },
  { id:'noshow',    label:'노쇼', color:'#DC2626' },
  { id:'block',     label:'예약불가', color:'#EF4444' },
];

function C_StatusFilterButton({ statusFilter, setStatusFilter }) {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (anchorRef.current && !anchorRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const activeCount = Object.values(statusFilter).filter(Boolean).length;
  const isAllOn = activeCount === STATUS_OPTIONS.length;
  const hasFilter = !isAllOn && activeCount > 0;
  const noneOn = activeCount === 0;

  const toggle = (id) => {
    setStatusFilter(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const toggleAll = () => {
    if (isAllOn) {
      // 전체 해제
      const off = {};
      STATUS_OPTIONS.forEach(o => { off[o.id] = false; });
      setStatusFilter(off);
    } else {
      const on = {};
      STATUS_OPTIONS.forEach(o => { on[o.id] = true; });
      setStatusFilter(on);
    }
  };

  return (
    <div ref={anchorRef} style={{position:'relative', flexShrink:0}}>
      <button onClick={() => setOpen(o => !o)} style={{
        ...c_ghostBtnSm,
        display:'flex', alignItems:'center', gap:5, whiteSpace:'nowrap',
        ...(hasFilter ? {
          background: C_BLUE_SOFT, color: C_BLUE, borderColor: C_BLUE,
        } : noneOn ? {
          background: '#FEF2F2', color:'#DC2626', borderColor:'#FCA5A5',
        } : {}),
      }}>
        <IconFilter size={13}/> 필터
        {hasFilter && (
          <span style={{
            display:'inline-flex', alignItems:'center', justifyContent:'center',
            minWidth:16, height:16, padding:'0 5px', borderRadius:8,
            background:C_BLUE, color:'#fff',
            fontSize:9.5, fontWeight:800, fontVariantNumeric:'tabular-nums',
          }}>{activeCount}</span>
        )}
      </button>

      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 6px)', right:0,
          width:220, background:C_SURFACE, borderRadius:10,
          border:`1px solid ${C_BORDER}`,
          boxShadow:'0 12px 32px rgba(11,20,37,0.16)',
          zIndex:120, padding:'8px',
        }}>
          <div style={{
            padding:'6px 10px 8px', display:'flex', alignItems:'center',
            borderBottom:`1px solid ${C_BORDER}`,
          }}>
            <span style={{fontSize:11.5, fontWeight:800, color:C_INK, letterSpacing:'-0.01em', flex:1}}>
              예약 상태
            </span>
            <button onClick={toggleAll} style={{
              padding:'3px 8px', fontSize:10.5, fontWeight:700,
              border:'none', background:'transparent', color:C_BLUE,
              cursor:'pointer', fontFamily:'inherit', borderRadius:5,
            }}>{isAllOn ? '전체 해제' : '전체 선택'}</button>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:1, marginTop:4}}>
            {STATUS_OPTIONS.map(opt => {
              const on = !!statusFilter[opt.id];
              return (
                <button key={opt.id} onClick={() => toggle(opt.id)} style={{
                  padding:'8px 10px', display:'flex', alignItems:'center', gap:9,
                  border:'none', background: on ? '#FBFCFE' : 'transparent',
                  borderRadius:6, cursor:'pointer', fontFamily:'inherit',
                  textAlign:'left',
                }}
                onMouseEnter={e => { if (!on) e.currentTarget.style.background = '#FBFCFE'; }}
                onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent'; }}
                >
                  {/* 체크박스 */}
                  <span style={{
                    width:16, height:16, borderRadius:4,
                    border:`1.5px solid ${on ? opt.color : C_BORDER}`,
                    background: on ? opt.color : C_SURFACE,
                    display:'inline-flex', alignItems:'center', justifyContent:'center',
                    flexShrink:0,
                  }}>
                    {on && <IconCheck size={11} style={{color:'#fff'}}/>}
                  </span>
                  {/* 상태 색상 점 + 라벨 */}
                  <span style={{width:6, height:6, borderRadius:'50%', background:opt.color, flexShrink:0}}/>
                  <span style={{
                    fontSize:12.5, fontWeight: on ? 700 : 500,
                    color: on ? C_INK : C_MUTED, letterSpacing:'-0.01em',
                  }}>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============ 대기 스트립 (상단바에 인라인, 클릭시 팝오버) ============
function C_WaitingWidget() {
  const [expanded, setExpanded] = React.useState(false);
  const anchorRef = React.useRef(null);

  // 바깥 클릭시 닫힘
  React.useEffect(() => {
    if (!expanded) return;
    const onDoc = (e) => {
      if (anchorRef.current && !anchorRef.current.contains(e.target)) setExpanded(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [expanded]);

  return (
    <div ref={anchorRef} style={{
      position:'relative', zIndex:30, flexShrink:0,
    }}>
      {/* 트리거: 상단바 알약 버튼 */}
      <button onClick={() => setExpanded(!expanded)} style={{
        display:'flex', alignItems:'center', gap:10,
        padding:'6px 12px 6px 8px',
        background:'#FFFBEB', border:'1px solid #FCE9B8', borderRadius:20,
        cursor:'pointer', color:C_INK, fontFamily:'inherit',
      }}>
        <div style={{
          width:22, height:22, borderRadius:'50%',
          background:'#FEF3C7', color:'#D97706',
          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
          position:'relative',
        }}>
          <IconClock size={12}/>
          <span style={{
            position:'absolute', top:-2, right:-2, width:7, height:7, borderRadius:'50%',
            background:C_CORAL, boxShadow:'0 0 0 2px #FFFBEB',
            animation:'c-pulse 2s infinite',
          }}/>
        </div>
        <div style={{fontSize:12, color:C_INK, fontWeight:700, lineHeight:1.2, whiteSpace:'nowrap'}}>
          <span style={{color:'#B45309'}}>대기 {SUMMARY.waiting}</span>
          <span style={{color:C_BORDER, fontWeight:500, margin:'0 5px'}}>·</span>
          <span style={{color:'#059669'}}>시술중 {SUMMARY.completed}</span>
        </div>
        <div style={{
          color:C_MUTED, transition:'transform 0.2s',
          transform: expanded ? 'rotate(180deg)' : 'none',
          display:'flex', alignItems:'center',
        }}>
          <IconChevronD size={12}/>
        </div>
      </button>

      {/* 펼침 팝오버 */}
      {expanded && (
        <div style={{
          position:'absolute', top:'calc(100% + 6px)', right:0,
          minWidth: 320, background:C_SURFACE, borderRadius:10,
          border:`1px solid ${C_BORDER}`,
          boxShadow:'0 8px 24px rgba(11,20,37,0.12), 0 2px 4px rgba(11,20,37,0.04)',
          maxHeight: 480, overflowY:'auto',
        }}>
          {/* 대기 섹션 */}
          <div style={{padding:'12px 14px 8px'}}>
            <div style={{fontSize:10.5, color:C_MUTED, fontWeight:700, letterSpacing:'0.06em', marginBottom:8}}>
              대기 · {WAITING_LIST.length}명
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:6}}>
              {WAITING_LIST.map((w, i) => (
                <div key={i} style={{
                  padding:'10px 12px',
                  background:'#FFF8E5', border:'1px solid #FCE9B8',
                  borderRadius:8,
                }}>
                  <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between'}}>
                    <div style={{fontSize:13, fontWeight:700, color:C_INK}}>{w.name}</div>
                    <div style={{
                      fontSize:11, fontWeight:700, color:'#B45309',
                      background:'#FEF3C7', padding:'2px 7px', borderRadius:10,
                      fontVariantNumeric:'tabular-nums',
                    }}>{w.wait}분 대기</div>
                  </div>
                  <div style={{fontSize:11.5, color:C_MUTED, marginTop:3}}>
                    {w.service} · 선호 {w.preferred}
                  </div>
                  <div style={{display:'flex', gap:6, marginTop:8}}>
                    <button style={{
                      flex:1, padding:'5px 8px', background:C_BLUE, color:'#fff',
                      border:'none', borderRadius:5, fontSize:11.5, fontWeight:600, cursor:'pointer',
                    }}>배정</button>
                    <button style={{
                      padding:'5px 8px', background:C_SURFACE, color:C_INK,
                      border:`1px solid ${C_BORDER}`, borderRadius:5, fontSize:11.5, fontWeight:500, cursor:'pointer',
                      display:'flex', alignItems:'center', gap:4,
                    }}>
                      <IconPhone size={11}/> 전화
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 시술 중 섹션 */}
          <div style={{padding:'8px 14px 14px'}}>
            <div style={{fontSize:10.5, color:C_MUTED, fontWeight:700, letterSpacing:'0.06em', marginBottom:8}}>
              시술 중 · {RESERVATIONS.filter(r => r.status==='visited').length}명
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:4}}>
              {RESERVATIONS.filter(r => r.status==='visited').slice(0, 5).map(r => {
                const d = DESIGNERS.find(x => x.id === r.designer);
                return (
                  <div key={r.id} style={{
                    display:'flex', alignItems:'center', gap:8,
                    padding:'7px 8px', borderRadius:6,
                  }}>
                    <div style={{width:6, height:6, borderRadius:'50%', background:'#059669', flexShrink:0}}/>
                    <div style={{fontSize:12, fontWeight:600, color:C_INK, minWidth:56}}>{r.customer}</div>
                    <div style={{fontSize:11.5, color:C_MUTED, flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{r.menu}</div>
                    <div style={{fontSize:11, color:C_MUTED, fontVariantNumeric:'tabular-nums', flexShrink:0}}>{d.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ 타임 그리드 (가로스크롤 X, 페이지네이션) ============
function C_TimeGrid({ visibleDesigners, colWidth, statusFilter }) {
  const slots = [];
  for (let m = DAY_START; m < DAY_END; m += SLOT_MIN) slots.push(m);
  const now = 14 * 60 + 22;

  const totalWidth = C_TIME_COL_W + visibleDesigners.length * colWidth;

  return (
    <div className="c-timegrid-scroll" style={{
      width: '100%', flexShrink: 0,
      overflowX:'hidden', overflowY:'overlay',
      background:C_SURFACE,
      borderRadius:0, borderTop:`1px solid ${C_BORDER}`,
      borderRight:`1px solid ${C_BORDER}`,
      position:'relative',
      flex:1, minHeight:0,
    }}>
      <div style={{
        display:'grid',
        gridTemplateColumns:`${C_TIME_COL_W}px repeat(${visibleDesigners.length}, minmax(0, 1fr))`,
        width: '100%',
      }}>
        <div style={{
          position:'sticky', top:0, left:0, zIndex:3, background:'#FBFCFE',
          height:C_HEADER_H, borderBottom:`1px solid ${C_BORDER}`, borderRight:`1px solid ${C_BORDER}`,
        }}/>
        {visibleDesigners.map((d, i) => (
          <div key={d.id} style={{
            position:'sticky', top:0, zIndex:2,
            background: i%2===0 ? '#FBFCFE' : C_SURFACE,
            height:C_HEADER_H, padding:'0 10px',
            display:'flex', alignItems:'center', gap:6,
            borderBottom:`1px solid ${C_BORDER}`,
            borderLeft:`1px solid ${C_BORDER}`,
            borderRight: i === visibleDesigners.length - 1 ? `1px solid ${C_BORDER}` : 'none',
            minWidth:0,
          }}>
            <div style={{width:3, height:16, borderRadius:2, background:d.color, flexShrink:0}}/>
            <div style={{minWidth:0, flex:1}}>
              <div style={{
                fontSize:12.5, fontWeight:600, color:C_INK,
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                letterSpacing:'-0.01em',
              }}>{d.name}</div>
              <div style={{fontSize:10, color:C_MUTED, marginTop:1}}>{d.role}</div>
            </div>
          </div>
        ))}

        {slots.map((m) => {
          const isHour = m % 60 === 0;
          return (
            <React.Fragment key={m}>
              <div style={{
                position:'sticky', left:0, background:'#FBFCFE',
                height:C_SLOT_HEIGHT, padding:'4px 8px',
                borderTop: isHour ? `1px solid ${C_BORDER}` : `1px dashed #EEF1F6`,
                borderRight: `1px solid ${C_BORDER}`,
                textAlign:'right',
                fontSize: isHour ? 11 : 10,
                color: isHour ? C_INK : '#94A3B8',
                fontWeight: isHour ? 600 : 400,
                fontVariantNumeric:'tabular-nums',
                zIndex:1,
              }}>
                {minToTime(m)}
              </div>
              {visibleDesigners.map((d, i) => (
                <div key={d.id} style={{
                  height:C_SLOT_HEIGHT,
                  borderTop: isHour ? `1px solid ${C_BORDER}` : `1px dashed #EEF1F6`,
                  borderLeft: `1px solid ${C_BORDER}`,
                  borderRight: i === visibleDesigners.length - 1 ? `1px solid ${C_BORDER}` : 'none',
                  background: i%2===0 ? '#FBFCFE' : C_SURFACE,
                }}/>
              ))}
            </React.Fragment>
          );
        })}

        <C_ReservationLayer visibleDesigners={visibleDesigners} colWidth={colWidth} statusFilter={statusFilter}/>
        <C_NowLine now={now} totalCols={visibleDesigners.length}/>
      </div>
    </div>
  );
}

function C_ReservationLayer({ visibleDesigners, colWidth, statusFilter }) {
  const totalCols = visibleDesigners.length;
  // 각 디자이너 셀은 좌측 경계선(1px)이 콘텐츠를 안쪽으로 밀어냄.
  // 카드는 슬롯의 내부 콘텐츠 영역에 정확히 들어맞도록 배치:
  //  - left  = 시간컬럼(56) + (idx * colWidth) + 좌측 border(1) + 좌측 인셋(2)
  //  - width = colWidth - 좌측 border(1) - 좌우 인셋(2*2)
  //  - top   = (분오프셋 / 30 * 슬롯높이) + 슬롯 상단 border(1) + 상단 인셋(1)
  //  - height= duration/30 * 슬롯높이 - 상단 border(1) - 상하 인셋(2)
  const BORDER = 1;
  const INSET_X = 2;
  const INSET_Y = 1;
  return (
    <div style={{
      gridColumn: `1 / ${totalCols + 2}`,
      gridRow: `2 / ${(DAY_END - DAY_START)/SLOT_MIN + 2}`,
      position:'relative', pointerEvents:'none',
    }}>
      {RESERVATIONS.map(r => {
        // 취소된 예약은 러너석에서 숨김
        if (r.status === 'cancelled') return null;
        // 상태 필터 적용
        if (statusFilter) {
          if (r.type === 'block') {
            if (!statusFilter.block) return null;
          } else if (r.status && !statusFilter[r.status]) {
            return null;
          }
        }
        const designerIdx = visibleDesigners.findIndex(d => d.id === r.designer);
        if (designerIdx < 0) return null;
        const top = (timeToMin(r.start) - DAY_START) / SLOT_MIN * C_SLOT_HEIGHT + BORDER + INSET_Y;
        const height = r.duration / SLOT_MIN * C_SLOT_HEIGHT - BORDER - INSET_Y * 2;
        const left = C_TIME_COL_W + designerIdx * colWidth + BORDER + INSET_X;
        const width = colWidth - BORDER - INSET_X * 2;

        if (r.type === 'block') {
          const isDayoff = r.blockType === 'dayoff';
          const isUnavail = r.blockType === 'unavailable';

          // 종일 휴무 → 무거운 대각 스트라이프 + 회색 톤
          if (isDayoff) {
            return (
              <div key={r.id} style={{
                position:'absolute', top, left, height, width,
                background: `repeating-linear-gradient(-45deg, #94A3B8 0, #94A3B8 8px, #B4BFCE 8px, #B4BFCE 16px)`,
                border:`1px solid #64748B`, borderRadius:6,
                padding:'10px 10px', pointerEvents:'auto',
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-start',
                gap:6, color:'#334155', fontWeight:600,
                boxSizing:'border-box',
              }}>
                <div style={{
                  display:'flex', alignItems:'center', gap:6,
                  padding:'4px 10px', background:C_SURFACE,
                  border:`1px solid #64748B`, borderRadius:12,
                  fontSize:11.5, color:'#334155',
                  boxShadow:'0 1px 3px rgba(11,20,37,0.12)',
                  position:'sticky', top:6,
                }}>
                  <span style={{width:6, height:6, borderRadius:'50%', background:'#475569'}}/>
                  휴무
                </div>
              </div>
            );
          }

          // 예약불가 (사유 포함) → 붉은톤 스트라이프 + 사유 표시
          if (isUnavail) {
            return (
              <div key={r.id} style={{
                position:'absolute', top, left, height, width,
                background: `repeating-linear-gradient(-45deg, #FFF1F0 0, #FFF1F0 5px, #FEE2E2 5px, #FEE2E2 10px)`,
                border:`1px dashed #FCA5A5`, borderRadius:6,
                padding:'6px 8px', pointerEvents:'auto',
                display:'flex', flexDirection:'column', gap:2,
                boxSizing:'border-box', overflow:'hidden',
              }}>
                <div style={{
                  display:'inline-flex', alignItems:'center', gap:4, alignSelf:'flex-start',
                  fontSize:10, fontWeight:700, color:'#B91C1C',
                  background:'#fff', padding:'1px 6px', borderRadius:8,
                  border:'1px solid #FECACA',
                }}>
                  <IconX size={9}/> 예약불가
                </div>
                <div style={{
                  fontSize:11, fontWeight:600, color:'#991B1B',
                  whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                  letterSpacing:'-0.01em',
                }}>{r.reason}</div>
              </div>
            );
          }

          // 기본 블록 (점심/청소 등)
          return (
            <div key={r.id} style={{
              position:'absolute', top, left, height, width,
              background: 'repeating-linear-gradient(-45deg, transparent, transparent 5px, #F5F7FB 5px, #F5F7FB 10px)',
              border:`1px solid ${C_BORDER}`, borderRadius:6,
              padding:'6px 8px', pointerEvents:'auto',
              display:'flex', alignItems:'center', gap:5,
              fontSize:11, color:C_MUTED, fontWeight:500,
              boxSizing:'border-box',
            }}>
              <IconCoffee size={12}/> {r.label}
            </div>
          );
        }

        const st = C_STATUS[r.status];
        return (
          <div key={r.id} onClick={() => window.__openSales && window.__openSales({ customer: r.customer, menu: r.menu, designer: r.designer, start: r.start, memo: r.memo })} style={{
            position:'absolute', top, left, height, width,
            background: st.bg, color: st.text, borderRadius:6,
            padding:'6px 8px', pointerEvents:'auto',
            cursor:'pointer', overflow:'hidden',
            boxShadow:'0 1px 2px rgba(11,20,37,0.06)',
            boxSizing:'border-box',
          }}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
              <div style={{fontSize:10.5, fontWeight:600, fontVariantNumeric:'tabular-nums', opacity:0.85}}>{r.start}</div>
              <span style={{display:'inline-flex', alignItems:'center', gap:3}}>
                {window.BOOKING_DEPOSITS && window.BOOKING_DEPOSITS[r.customer] && (
                  <span title={`예약금 ${new Intl.NumberFormat('ko-KR').format(window.BOOKING_DEPOSITS[r.customer].amount)}원`} style={{
                    fontSize:8.5, fontWeight:900, color:'#fff', background:'#03A94D', borderRadius:3,
                    padding:'0 3px', lineHeight:'12px',
                  }}>₩</span>
                )}
                {r.memo && <span title={r.memo} style={{fontSize:9, opacity:0.85}}>●</span>}
              </span>
            </div>
            <div style={{
              fontSize:12, fontWeight:700, marginTop:2,
              whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
              letterSpacing:'-0.01em',
            }}>
              {r.customer}
            </div>
            {height > 40 && (
              <div style={{fontSize:10.5, opacity:0.85, marginTop:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                {r.menu}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function C_NowLine({ now, totalCols }) {
  const top = (now - DAY_START) / SLOT_MIN * C_SLOT_HEIGHT;
  return (
    <div style={{
      gridColumn: `1 / ${totalCols + 2}`,
      gridRow: `2 / ${(DAY_END - DAY_START)/SLOT_MIN + 2}`,
      position:'relative', pointerEvents:'none',
    }}>
      <div style={{
        position:'absolute', top, left:0, right:0, height:2,
        background:C_CORAL, zIndex:5,
        boxShadow:'0 0 8px rgba(249,112,102,0.4)',
      }}>
        <div style={{
          position:'absolute', left:C_TIME_COL_W-14, top:-9,
          padding:'2px 6px', borderRadius:4,
          background:C_CORAL, color:'#fff',
          fontSize:9.5, fontWeight:700, fontVariantNumeric:'tabular-nums',
        }}>14:22</div>
      </div>
    </div>
  );
}

const c_iconBtn = {
  width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center',
  border:`1px solid ${C_BORDER}`, borderRadius:8, background:C_SURFACE,
  color:C_INK, cursor:'pointer',
};
const c_iconBtnSm = {
  width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center',
  border:`1px solid ${C_BORDER}`, borderRadius:6, background:C_SURFACE,
  color:C_INK, cursor:'pointer',
};
const c_ghostBtn = {
  padding:'8px 12px', border:`1px solid ${C_BORDER}`, borderRadius:8,
  background:C_SURFACE, color:C_INK, fontSize:12.5, fontWeight:500, cursor:'pointer',
};
const c_ghostBtnSm = {
  padding:'6px 10px', border:`1px solid ${C_BORDER}`, borderRadius:6,
  background:C_SURFACE, color:C_INK, fontSize:12, fontWeight:500, cursor:'pointer',
};
const c_pagerBtn = {
  width:26, height:26, display:'flex', alignItems:'center', justifyContent:'center',
  border:`1px solid ${C_BORDER}`, borderRadius:5, background:C_SURFACE,
  color:C_INK, fontFamily:'inherit',
};

// ============ 예약 페이지 ============
function C_BookingPage() {
  const [view, setView] = React.useState('day');
  const [tab, setTab] = React.useState('booking');
  // 현재 선택 날짜 (기본: 2026-09-08 화)
  const [selDate, setSelDate] = React.useState({ y: 2026, m: 9, d: 8 });
  // 주간 뷰 담당자 필터 (한 명 or null=전체)
  const [weekDesigner, setWeekDesigner] = React.useState(null);
  // 예약 상태 필터 (기본: 모두 활성)
  const [statusFilter, setStatusFilter] = React.useState({
    confirmed: true, visited: true, pending: true, noshow: true, block: true,
  });
  // 디자이너 8명 전부 화면에 표시 (페이지네이션은 뷰포트가 매우 좁을 때만 발동)
  const [offset, setOffset] = React.useState(0);

  const totalCount = DESIGNERS.length;

  // 한 페이지에 무조건 10명씩
  const PAGE_SIZE = 10;
  const visibleCount = Math.min(PAGE_SIZE, totalCount);

  // 페이지 단위(10명) offset 유지 — 마지막 페이지는 남은 인원만
  React.useEffect(() => {
    const maxOffset = Math.max(0, (Math.ceil(totalCount / visibleCount) - 1) * visibleCount);
    if (offset > maxOffset) setOffset(maxOffset);
  }, [visibleCount, totalCount, offset]);

  // 마지막 페이지가 10명 미만이어도 컬럼 폭 유지 (빈 컬럼으로 채움)
  const visibleDesigners = (() => {
    const arr = DESIGNERS.slice(offset, offset + visibleCount);
    while (arr.length < visibleCount) {
      arr.push({ id:`__empty_${arr.length}`, name:'', role:'', color:'transparent', empty:true });
    }
    return arr;
  })();
  const showPager = totalCount > visibleCount;

  // 페이지 전체 폭 = 10명 컬럼(88px) + 시간(56) + 스크롤바(11) + border(1) = 948
  // 페이지 폭은 고정(948) — 인원이 늘면 컬럼 폭이 자동 축소
  const SCROLLBAR_W = 11;
  const PAGE_W = 948;
  const GRID_CLIENT_W = PAGE_W - SCROLLBAR_W - 1;
  const colWidth = (GRID_CLIENT_W - C_TIME_COL_W) / visibleCount;

  const SidePanel = window.C_ReservationSidePanel;
  return (
    <div style={{flex:1, display:'flex', flexDirection:'row', minWidth:0, overflow:'hidden'}}>
      <div style={{flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden'}}>
        <div style={{width: PAGE_W, flexShrink: 0, flex:1, display:'flex', flexDirection:'column', minHeight:0}}>
          <C_SubHeader
            view={view} setView={setView} tab={tab} setTab={setTab}
            pageInfo={{ offset, setOffset, visibleCount, totalCount, showPager }}
            statusFilter={statusFilter} setStatusFilter={setStatusFilter}
            selDate={selDate} setSelDate={setSelDate}
          />
          <div style={{
            flex:1, padding:0, minHeight:0,
            display:'flex', position:'relative', overflow:'hidden',
          }}>
            {view === 'day' && (
              <C_TimeGrid visibleDesigners={visibleDesigners} colWidth={colWidth} statusFilter={statusFilter}/>
            )}
            {view === 'week' && window.C_BookingWeekView && (
              React.createElement(window.C_BookingWeekView, {
                selDate, setSelDate, setView,
                statusFilter,
                designerFilter: weekDesigner, setDesignerFilter: setWeekDesigner,
              })
            )}
            {view === 'month' && window.C_BookingMonthView && (
              React.createElement(window.C_BookingMonthView, {
                selDate, setSelDate, setView,
                statusFilter,
              })
            )}
          </div>
        </div>
      </div>
      {/* 사이드 패널: 기존 페이지 영역 침범 안 하도록 오른쪽 별도 부착 */}
      {SidePanel && (
        <div style={{flexShrink:0, height:'100%', display:'flex'}}>
          <SidePanel/>
        </div>
      )}
    </div>
  );
}

// 아직 시안이 없는 페이지 안내
function C_ComingSoon({ title }) {
  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', background:C_BG}}>
      <div style={{width:948, flex:1, display:'flex', alignItems:'center', justifyContent:'center'}}>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:14, fontWeight:600, color:C_MUTED, letterSpacing:'0.05em'}}>{title.toUpperCase()}</div>
          <div style={{fontSize:22, fontWeight:700, color:C_INK, marginTop:8, letterSpacing:'-0.02em'}}>
            시안 준비 중
          </div>
          <div style={{fontSize:13, color:C_MUTED, marginTop:6}}>
            이 화면의 시안은 아직 작업되지 않았습니다.
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ 매장 일정 페이지 ============
function C_SchedulePage() {
  const [year, setYear] = React.useState(SCHEDULE_MONTH.year);
  const [month, setMonth] = React.useState(SCHEDULE_MONTH.month);
  const [view, setView] = React.useState('month'); // month | week
  const [tab, setTab] = React.useState('salon');   // salon | event
  const [layout, setLayout] = React.useState('grid'); // grid | matrix | list  (Tweaks)
  const [modalDate, setModalDate] = React.useState(null);
  const [tooltip, setTooltip] = React.useState(null); // {x, y, ev}
  const [designerFilter, setDesignerFilter] = React.useState(null); // null=all

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); } else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); } else setMonth(m => m + 1);
  };

  const today = { year: 2026, month: 9, day: 11 };

  // 이번달 이벤트 (필터)
  const events = SCHEDULE_EVENTS.filter(ev => {
    const [y, m] = ev.date.split('-').map(Number);
    if (y !== year || m !== month) return false;
    if (designerFilter && ev.designerId && ev.designerId !== designerFilter) return false;
    return true;
  });

  const eventsByDay = {};
  events.forEach(ev => {
    const [, , d] = ev.date.split('-').map(Number);
    if (!eventsByDay[d]) eventsByDay[d] = [];
    eventsByDay[d].push(ev);
  });

  const PAGE_W = 948;

  return (
    <div style={{flex:1, display:'flex', flexDirection:'row', minWidth:0, overflow:'hidden'}}>
     <div style={{flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden', background:C_BG}}>
      <div style={{width: PAGE_W, flexShrink: 0, flex:1, display:'flex', flexDirection:'column', minHeight:0}}>
        <C_ScheduleSubHeader
          year={year} month={month} onPrev={prevMonth} onNext={nextMonth} onToday={() => { setYear(2026); setMonth(9); }}
          view={view} setView={setView} tab={tab} setTab={setTab}
          layout={layout} setLayout={setLayout}
          designerFilter={designerFilter} setDesignerFilter={setDesignerFilter}
          onAddNew={() => setModalDate({year, month, day: today.day})}
        />

        <div style={{flex:1, overflow: view === 'week' && layout !== 'list' ? 'hidden' : 'auto', padding: (view === 'month' && layout === 'list') || (view === 'week' && layout === 'list') ? 0 : 0, background:C_SURFACE}}>
          {view === 'week' && window.C_ScheduleWeek ? (
            React.createElement(window.C_ScheduleWeek, {
              year, month, today,
              layout, events,
              onDayClick: (day, mo, yr) => setModalDate({year: yr || year, month: mo || month, day}),
              onCellClick: (day, designerId, mo, yr) => setModalDate({year: yr || year, month: mo || month, day, designerId}),
              onEventHover: setTooltip,
            })
          ) : (
            <>
              {layout === 'grid' && (
                <C_ScheduleMonthGrid
                  year={year} month={month} today={today}
                  eventsByDay={eventsByDay}
                  onDayClick={(day) => setModalDate({year, month, day})}
                  onEventHover={setTooltip}
                />
              )}
              {layout === 'matrix' && (
                <C_ScheduleMatrix
                  year={year} month={month} today={today}
                  events={events}
                  onCellClick={(designerId, day) => setModalDate({year, month, day, designerId})}
                />
              )}
              {layout === 'list' && (
                <div style={{padding:'16px 20px'}}>
                  <C_ScheduleList
                    year={year} month={month} today={today}
                    events={events}
                    onDayClick={(day) => setModalDate({year, month, day})}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {modalDate && <C_ScheduleAddModal date={modalDate} onClose={() => setModalDate(null)}/>}
      {tooltip && <C_EventTooltip {...tooltip} onClose={() => setTooltip(null)}/>}
     </div>
     {window.C_ReservationSidePanel && <window.C_ReservationSidePanel/>}
    </div>
  );
}

// ── 서브헤더 ──
function C_ScheduleSubHeader({ year, month, onPrev, onNext, onToday, view, setView, tab, setTab, layout, setLayout, designerFilter, setDesignerFilter, onAddNew }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:8,
      padding:'10px 14px', background:C_SURFACE, borderBottom:`1px solid ${C_BORDER}`,
    }}>
      {/* 년월 네비게이션 */}
      <div style={{display:'flex', alignItems:'center', gap:6, flexShrink:0}}>
        <button style={c_iconBtnSm} onClick={onPrev}><IconChevronL size={14}/></button>
        <div style={{
          fontSize:14, fontWeight:700, color:C_INK, minWidth:110, textAlign:'center',
          fontVariantNumeric:'tabular-nums', letterSpacing:'-0.01em',
        }}>
          {formatMonthLabel(year, month)}
        </div>
        <button style={c_iconBtnSm} onClick={onNext}><IconChevronR size={14}/></button>
        <button style={{...c_ghostBtnSm, marginLeft:4}} onClick={onToday}>오늘</button>
      </div>

      <div style={{flex:1}}/>

      {/* 일정 추가 */}
      <button onClick={onAddNew} style={{
        display:'flex', alignItems:'center', gap:6,
        padding:'7px 14px', background: C_BLUE, color:'#fff',
        border:'none', borderRadius:7, fontSize:12.5, fontWeight:700,
        cursor:'pointer', flexShrink:0, whiteSpace:'nowrap',
        boxShadow:`0 1px 2px ${C_BLUE}44`,
      }}>
        <IconPlus size={13}/> 일정 추가
      </button>
    </div>
  );
}

// ── 월간 그리드 (기본) ──
function C_ScheduleMonthGrid({ year, month, today, eventsByDay, onDayClick, onEventHover }) {
  const cells = buildCalendarGrid(year, month);
  const weekdays = ['일','월','화','수','목','금','토'];
  const isToday = (d, inMonth) => inMonth && year === today.year && month === today.month && d === today.day;

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100%'}}>
      {/* 요일 헤더 */}
      <div style={{
        display:'grid', gridTemplateColumns:'repeat(7, 1fr)',
        borderBottom:`1px solid ${C_BORDER}`, background:'#FBFCFE',
      }}>
        {weekdays.map((w, i) => (
          <div key={w} style={{
            padding:'12px 0', textAlign:'center', fontSize:12, fontWeight:600,
            color: i===0 ? '#EF4444' : i===6 ? C_BLUE : C_MUTED,
            letterSpacing:'-0.01em',
          }}>{w}</div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div style={{
        flex:1, display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gridAutoRows:'1fr',
      }}>
        {cells.map((c, i) => {
          const dateStr = c.inMonth ? `${year}-${String(month).padStart(2,'0')}-${String(c.day).padStart(2,'0')}` : null;
          const holiday = dateStr && HOLIDAYS[dateStr];
          const dow = i % 7;
          const dayEvents = c.inMonth ? (eventsByDay[c.day] || []) : [];
          const dayoffs = dayEvents.filter(e => e.type === 'dayoff');
          const t = isToday(c.day, c.inMonth);

          return (
            <div key={i}
                 onClick={() => c.inMonth && onDayClick(c.day)}
                 className={c.inMonth ? 'c-schedule-cell' : ''}
                 style={{
              padding:'8px 8px 6px',
              borderRight: dow < 6 ? `1px solid ${C_BORDER}` : 'none',
              borderBottom: i < 35 ? `1px solid ${C_BORDER}` : 'none',
              background: !c.inMonth ? '#FAFBFD' : holiday ? '#FEF2F2' : t ? '#EFF6FF' : C_SURFACE,
              cursor: c.inMonth ? 'pointer' : 'default',
              position:'relative',
              display:'flex', flexDirection:'column', gap:4,
              minHeight:0, overflow:'hidden',
              transition:'background 0.12s',
            }}>
              {/* 날짜 번호 */}
              <div style={{display:'flex', alignItems:'center', gap:5}}>
                <span style={{
                  fontSize:12, fontWeight: t ? 700 : 500,
                  fontVariantNumeric:'tabular-nums',
                  color: !c.inMonth ? '#CBD5E1'
                    : holiday ? '#DC2626'
                    : t ? '#FFFFFF'
                    : dow===0 ? '#EF4444'
                    : dow===6 ? C_BLUE
                    : C_INK,
                  background: t ? C_BLUE : 'transparent',
                  minWidth: t ? 22 : 'auto',
                  height: t ? 22 : 'auto',
                  borderRadius:'50%',
                  display:'inline-flex', alignItems:'center', justifyContent:'center',
                }}>{c.day}</span>
                {holiday && c.inMonth && (
                  <span style={{fontSize:10.5, color:'#DC2626', fontWeight:600, letterSpacing:'-0.01em'}}>
                    {holiday}
                  </span>
                )}
              </div>

              {/* 이벤트 배지 */}
              {c.inMonth && (
                <div style={{display:'flex', flexDirection:'column', gap:2, minHeight:0, overflow:'hidden'}}>
                  {dayoffs.slice(0, 3).map(ev => {
                    const d = DESIGNERS.find(x => x.id === ev.designerId);
                    if (!d) return null;
                    return (
                      <div key={ev.id}
                           onMouseEnter={(e) => {
                             const r = e.currentTarget.getBoundingClientRect();
                             onEventHover({ x: r.left, y: r.bottom + 4, ev, designer: d });
                           }}
                           onMouseLeave={() => onEventHover(null)}
                           onClick={(e) => e.stopPropagation()}
                           style={{
                        display:'flex', alignItems:'center', gap:5,
                        padding:'2px 6px', borderRadius:4,
                        background:'#F1F5F9',
                        fontSize:10.5, fontWeight:500, color:C_INK,
                        whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                        cursor:'pointer',
                      }}>
                        <span style={{width:6, height:6, borderRadius:'50%', background:d.color, flexShrink:0}}/>
                        <span style={{overflow:'hidden', textOverflow:'ellipsis'}}>{d.name} 휴무</span>
                      </div>
                    );
                  })}
                  {dayoffs.length > 3 && (
                    <div style={{
                      fontSize:10, color:C_MUTED, fontWeight:500, padding:'1px 6px',
                    }}>+ {dayoffs.length - 3}명 더보기</div>
                  )}
                </div>
              )}

              {/* hover + 아이콘 */}
              {c.inMonth && (
                <div className="c-schedule-add-btn" style={{
                  position:'absolute', top:6, right:6, width:18, height:18,
                  borderRadius:4, background:C_BLUE, color:'#fff',
                  display:'none', alignItems:'center', justifyContent:'center',
                  fontSize:12, fontWeight:700,
                }}>+</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 매트릭스 뷰 (디자이너 × 날짜) ──
function C_ScheduleMatrix({ year, month, today, events, onCellClick }) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({length: daysInMonth}, (_, i) => i + 1);
  const designers = DESIGNERS.filter(d => d.id !== 'unassigned');
  const eventMap = {};
  events.forEach(ev => {
    if (!ev.designerId) return;
    eventMap[`${ev.designerId}-${ev.date.split('-')[2]}`] = ev;
  });

  const CELL_W = 24;
  const NAME_W = 100;
  const HEADER_H = 32;
  const ROW_H = 28;

  return (
    <div style={{overflow:'auto', width:'100%', height:'100%'}}>
      <div style={{minWidth: NAME_W + days.length * CELL_W}}>
        {/* 헤더: 요일/일자 */}
        <div style={{
          display:'grid', gridTemplateColumns:`${NAME_W}px repeat(${days.length}, ${CELL_W}px)`,
          position:'sticky', top:0, background:'#FBFCFE', zIndex:2,
          borderBottom:`1px solid ${C_BORDER}`,
        }}>
          <div style={{padding:'6px 10px', fontSize:11, color:C_MUTED, fontWeight:600, borderRight:`1px solid ${C_BORDER}`, height:HEADER_H, display:'flex', alignItems:'center'}}>
            디자이너 · 날짜
          </div>
          {days.map(d => {
            const dow = new Date(year, month - 1, d).getDay();
            const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            const holiday = HOLIDAYS[dateStr];
            const t = year === today.year && month === today.month && d === today.day;
            return (
              <div key={d} style={{
                height:HEADER_H, display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center',
                borderRight:`1px solid ${C_BORDER}`,
                background: holiday ? '#FEF2F2' : t ? '#EFF6FF' : 'transparent',
                fontSize:10, fontWeight:600,
                color: holiday ? '#DC2626' : dow===0 ? '#EF4444' : dow===6 ? C_BLUE : C_INK,
              }}>
                <span style={{fontVariantNumeric:'tabular-nums'}}>{d}</span>
                <span style={{fontSize:9, opacity:0.7, marginTop:-1}}>{['일','월','화','수','목','금','토'][dow]}</span>
              </div>
            );
          })}
        </div>

        {/* 각 디자이너 행 */}
        {designers.map((d, ri) => (
          <div key={d.id} style={{
            display:'grid', gridTemplateColumns:`${NAME_W}px repeat(${days.length}, ${CELL_W}px)`,
            borderBottom: ri < designers.length - 1 ? `1px solid ${C_BORDER}` : 'none',
          }}>
            <div style={{
              padding:'0 10px', height:ROW_H, display:'flex', alignItems:'center', gap:6,
              borderRight:`1px solid ${C_BORDER}`, background:'#FBFCFE',
              position:'sticky', left:0, zIndex:1,
            }}>
              <div style={{width:3, height:14, borderRadius:2, background:d.color}}/>
              <div style={{minWidth:0, flex:1}}>
                <div style={{fontSize:12, fontWeight:600, color:C_INK, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{d.name}</div>
              </div>
            </div>
            {days.map(day => {
              const key = `${d.id}-${String(day).padStart(2,'0')}`;
              const ev = eventMap[key];
              const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
              const holiday = HOLIDAYS[dateStr];
              const dow = new Date(year, month - 1, day).getDay();
              return (
                <div key={day}
                     onClick={() => onCellClick(d.id, day)}
                     title={ev ? `${d.name} — 휴무` : holiday ? holiday : `${d.name} · ${day}일 근무`}
                     style={{
                  height:ROW_H, borderRight:`1px solid ${C_BORDER}`,
                  background: ev
                    ? `repeating-linear-gradient(-45deg, ${d.color}dd 0, ${d.color}dd 4px, ${d.color}99 4px, ${d.color}99 8px)`
                    : holiday ? '#FEF2F2'
                    : dow === 0 || dow === 6 ? '#FAFBFD'
                    : C_SURFACE,
                  cursor:'pointer',
                }}/>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 리스트 뷰 ──
function C_ScheduleList({ year, month, today, events, onDayClick }) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({length: daysInMonth}, (_, i) => i + 1);
  const eventsByDay = {};
  events.forEach(ev => {
    const d = Number(ev.date.split('-')[2]);
    if (!eventsByDay[d]) eventsByDay[d] = [];
    eventsByDay[d].push(ev);
  });

  return (
    <div style={{display:'flex', flexDirection:'column', gap:0, background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:10, overflow:'hidden'}}>
      {days.map(day => {
        const dow = new Date(year, month - 1, day).getDay();
        const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const holiday = HOLIDAYS[dateStr];
        const t = year === today.year && month === today.month && day === today.day;
        const dayEvents = eventsByDay[day] || [];
        const dayoffs = dayEvents.filter(e => e.type === 'dayoff');
        if (dayoffs.length === 0 && !holiday) return null;

        return (
          <div key={day}
               onClick={() => onDayClick(day)}
               style={{
            display:'grid', gridTemplateColumns:'80px 1fr',
            padding:'12px 16px', borderBottom:`1px solid ${C_BORDER}`,
            background: t ? '#EFF6FF' : holiday ? '#FEF2F2' : C_SURFACE,
            cursor:'pointer', gap:14,
          }}>
            <div style={{display:'flex', flexDirection:'column'}}>
              <div style={{
                fontSize:20, fontWeight:700, color: dow===0 || holiday ? '#EF4444' : dow===6 ? C_BLUE : C_INK,
                fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em', lineHeight:1,
              }}>{day}</div>
              <div style={{fontSize:11, color:C_MUTED, marginTop:2}}>
                {['일','월','화','수','목','금','토'][dow]}{holiday ? ` · ${holiday}` : ''}
              </div>
            </div>
            <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
              {dayoffs.map(ev => {
                const d = DESIGNERS.find(x => x.id === ev.designerId);
                if (!d) return null;
                return (
                  <div key={ev.id} style={{
                    display:'inline-flex', alignItems:'center', gap:5,
                    padding:'3px 8px', borderRadius:12,
                    background:'#F1F5F9', fontSize:11.5, color:C_INK, fontWeight:500,
                  }}>
                    <span style={{width:6, height:6, borderRadius:'50%', background:d.color}}/>
                    {d.name} 휴무
                  </div>
                );
              })}
              {dayoffs.length === 0 && holiday && (
                <div style={{fontSize:12, color:'#DC2626', fontWeight:600}}>공휴일</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── 이벤트 툴팁 ──
function C_EventTooltip({ x, y, ev, designer }) {
  const [yr, mo, da] = ev.date.split('-');
  return (
    <div style={{
      position:'fixed', left:x, top:y, zIndex:100,
      background:C_INK, color:'#fff', borderRadius:8,
      padding:'8px 12px', fontSize:12,
      boxShadow:'0 8px 24px rgba(0,0,0,0.25)',
      pointerEvents:'none',
    }}>
      <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:2}}>
        <span style={{width:8, height:8, borderRadius:'50%', background:designer.color}}/>
        <strong style={{fontWeight:700}}>{designer.name}</strong>
        <span style={{color:'#94A3B8'}}>· {designer.role}</span>
      </div>
      <div style={{fontSize:11, color:'#CBD5E1'}}>
        {Number(yr)}년 {Number(mo)}월 {Number(da)}일 · 종일 휴무
      </div>
    </div>
  );
}

// ── 일정 추가 모달 ──
function C_ScheduleAddModal({ date, onClose }) {
  const [selectedDesigners, setSelectedDesigners] = React.useState(
    date.designerId ? [date.designerId] : []
  );
  const [repeat, setRepeat] = React.useState('weekly'); // weekly | biweekly
  const [weekStart, setWeekStart] = React.useState('this'); // this | next  (격주만)
  const [days, setDays] = React.useState([]); // ['mon','tue',...]
  const [endless, setEndless] = React.useState(true);
  const [startDate, setStartDate] = React.useState(
    `${date.year}-${String(date.month).padStart(2,'0')}-${String(date.day).padStart(2,'0')}`
  );
  const [endDate, setEndDate] = React.useState('');
  const [memo, setMemo] = React.useState('');

  const toggleDesigner = (id) => {
    setSelectedDesigners(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const toggleDay = (id) => {
    setDays(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const DAY_OPTS = [
    { id:'sun', label:'일', color:'#EF4444' },
    { id:'mon', label:'월' },
    { id:'tue', label:'화' },
    { id:'wed', label:'수' },
    { id:'thu', label:'목' },
    { id:'fri', label:'금' },
    { id:'sat', label:'토', color:C_BLUE },
  ];

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(11,20,37,0.5)',
      zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width:480, maxHeight:'92vh', background:C_SURFACE, borderRadius:14,
        boxShadow:'0 20px 56px rgba(11,20,37,0.28)',
        display:'flex', flexDirection:'column', overflow:'hidden',
      }}>
        {/* 헤더 */}
        <div style={{padding:'18px 22px 14px', borderBottom:`1px solid ${C_BORDER}`, display:'flex', alignItems:'center', gap:10}}>
          <div style={{
            width:32, height:32, borderRadius:10,
            background:'#F1F5F9', color:'#64748B',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <IconClock size={16}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:16, fontWeight:800, color:C_INK, letterSpacing:'-0.01em'}}>휴무 등록</div>
            <div style={{fontSize:11.5, color:C_MUTED, marginTop:2, fontVariantNumeric:'tabular-nums'}}>
              {date.year}년 {date.month}월 {date.day}일 시작
            </div>
          </div>
          <button onClick={onClose} style={{
            width:28, height:28, borderRadius:8, border:'none', background:'transparent',
            color:C_MUTED, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}><IconX size={16}/></button>
        </div>

        {/* 본문 */}
        <div style={{padding:'18px 22px', overflow:'auto', display:'flex', flexDirection:'column', gap:18}}>
          {/* 대상 디자이너 */}
          <div>
            <div style={{fontSize:11.5, fontWeight:700, color:C_INK, marginBottom:8, letterSpacing:'-0.01em', display:'flex', alignItems:'baseline', gap:6}}>
              <span>대상 디자이너</span>
              <span style={{color:C_MUTED, fontWeight:600, fontSize:10.5}}>{selectedDesigners.length}명 선택</span>
            </div>
            <div style={{
              display:'flex', flexWrap:'wrap', gap:5, maxHeight:110, overflow:'auto',
              padding:8, border:`1px solid ${C_BORDER}`, borderRadius:8, background:C_BG,
            }}>
              {DESIGNERS.filter(d => d.id !== 'unassigned').map(d => {
                const sel = selectedDesigners.includes(d.id);
                return (
                  <button key={d.id} onClick={() => toggleDesigner(d.id)} style={{
                    padding:'4px 10px', fontSize:12, fontWeight:600,
                    border:`1px solid ${sel ? d.color : C_BORDER}`,
                    background: sel ? d.color : C_SURFACE,
                    color: sel ? '#fff' : C_INK,
                    borderRadius:14, cursor:'pointer', fontFamily:'inherit',
                    display:'inline-flex', alignItems:'center', gap:4,
                  }}>
                    <span style={{width:5, height:5, borderRadius:'50%', background: sel ? '#fff' : d.color}}/>
                    {d.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 반복 (매주/격주) */}
          <div>
            <div style={{fontSize:11.5, fontWeight:700, color:C_INK, marginBottom:8, letterSpacing:'-0.01em'}}>반복</div>
            <div style={{display:'flex', gap:6}}>
              {[
                { id:'weekly',   label:'매주' },
                { id:'biweekly', label:'격주' },
              ].map(r => (
                <button key={r.id} onClick={() => setRepeat(r.id)} style={{
                  flex:1, padding:'9px 12px', fontSize:12.5, fontWeight: repeat===r.id ? 800 : 600,
                  border:`1.5px solid ${repeat===r.id ? C_BLUE : C_BORDER}`,
                  background: repeat===r.id ? C_BLUE_SOFT : C_SURFACE,
                  color: repeat===r.id ? C_BLUE : C_INK,
                  borderRadius:8, cursor:'pointer', fontFamily:'inherit',
                }}>{r.label}</button>
              ))}
            </div>
          </div>

          {/* 요일 (중복선택) */}
          <div>
            <div style={{fontSize:11.5, fontWeight:700, color:C_INK, marginBottom:8, letterSpacing:'-0.01em', display:'flex', alignItems:'baseline', gap:6}}>
              <span>요일</span>
              <span style={{color:C_MUTED, fontWeight:600, fontSize:10.5}}>중복 선택 가능</span>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:4}}>
              {DAY_OPTS.map(d => {
                const on = days.includes(d.id);
                const dayColor = d.color || C_INK;
                return (
                  <button key={d.id} onClick={() => toggleDay(d.id)} style={{
                    padding:'10px 0', fontSize:13, fontWeight: on ? 800 : 600,
                    border:`1.5px solid ${on ? C_BLUE : C_BORDER}`,
                    background: on ? C_BLUE : C_SURFACE,
                    color: on ? '#fff' : dayColor,
                    borderRadius:8, cursor:'pointer', fontFamily:'inherit',
                    boxShadow: on ? `0 2px 6px ${C_BLUE}55` : 'none',
                    transition:'all 0.12s',
                  }}>{d.label}</button>
                );
              })}
            </div>
          </div>

          {/* 격주만 이번주/다음주 선택 (요일 아래) */}
          {repeat === 'biweekly' && (() => {
            const DOW_MAP = { sun:0, mon:1, tue:2, wed:3, thu:4, fri:5, sat:6 };
            const base = new Date(date.year, date.month - 1, date.day);
            // 이번주 월요일
            const baseMon = new Date(base);
            baseMon.setDate(base.getDate() - ((base.getDay() + 6) % 7));

            // 선택된 요일 중 가장 이른 요일 (월=1, 일=0을 7로 취급)
            const dayOrder = (id) => id === 'sun' ? 7 : DOW_MAP[id];
            const sortedDays = [...days].sort((a,b) => dayOrder(a) - dayOrder(b));
            const firstDayId = sortedDays[0];

            const fmt = (d) => `${d.getMonth()+1}월 ${d.getDate()}일`;
            const dowKr = (d) => ['일','월','화','수','목','금','토'][d.getDay()];

            // 이번주 / 다음주의 "첫 선택 요일" 실제 날짜
            const dateOfWeek = (mon, dayId) => {
              const d = new Date(mon);
              d.setDate(mon.getDate() + (dayOrder(dayId) - 1));
              return d;
            };
            const thisDate = firstDayId ? dateOfWeek(baseMon, firstDayId) : baseMon;
            const nextMon = new Date(baseMon); nextMon.setDate(baseMon.getDate() + 7);
            const nextDate = firstDayId ? dateOfWeek(nextMon, firstDayId) : nextMon;

            const noDaysYet = days.length === 0;

            return (
              <div>
                <div style={{fontSize:11.5, fontWeight:700, color:C_INK, marginBottom:8, letterSpacing:'-0.01em'}}>시작 주</div>
                {noDaysYet ? (
                  <div style={{
                    padding:'10px 12px', background:'#F5F7FB',
                    border:`1px dashed ${C_BORDER}`, borderRadius:7,
                    fontSize:11.5, color:C_MUTED, textAlign:'center',
                  }}>
                    요일을 먼저 선택하세요
                  </div>
                ) : (
                  <>
                    <div style={{display:'flex', gap:6}}>
                      {[
                        { id:'this', label:'이번주부터', d: thisDate },
                        { id:'next', label:'다음주부터', d: nextDate },
                      ].map(w => {
                        const on = weekStart === w.id;
                        return (
                          <button key={w.id} onClick={() => setWeekStart(w.id)} style={{
                            flex:1, padding:'9px 10px',
                            border:`1.5px solid ${on ? C_BLUE : C_BORDER}`,
                            background: on ? C_BLUE_SOFT : C_SURFACE,
                            borderRadius:8, cursor:'pointer', fontFamily:'inherit',
                            display:'flex', flexDirection:'column', gap:2, alignItems:'flex-start',
                          }}>
                            <span style={{
                              fontSize:11.5, fontWeight: on ? 800 : 600,
                              color: on ? C_BLUE : C_MUTED,
                            }}>{w.label}</span>
                            <span style={{
                              fontSize:10.5, fontWeight:700, color:C_INK,
                              fontVariantNumeric:'tabular-nums',
                            }}>{fmt(w.d)} ({dowKr(w.d)})</span>
                          </button>
                        );
                      })}
                    </div>
                    <div style={{
                      marginTop:8, padding:'8px 10px',
                      background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:6,
                      fontSize:11, color:'#92400E', lineHeight:1.5,
                    }}>
                      <b style={{color:'#78350F'}}>
                        {fmt(weekStart === 'this' ? thisDate : nextDate)}
                      </b> 부터 <b style={{color:'#78350F'}}>격주로</b> 반복됩니다.
                    </div>
                  </>
                )}
              </div>
            );
          })()}

          {/* 기간 */}
          <div>
            <div style={{fontSize:11.5, fontWeight:700, color:C_INK, marginBottom:8, letterSpacing:'-0.01em'}}>기간</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
              <div>
                <div style={{fontSize:10.5, color:C_MUTED, fontWeight:600, marginBottom:4}}>시작일</div>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{
                  width:'100%', height:36, padding:'0 10px',
                  border:`1px solid ${C_BORDER}`, borderRadius:7,
                  fontSize:12.5, background:C_SURFACE, outline:'none',
                  fontFamily:'inherit', boxSizing:'border-box',
                  fontVariantNumeric:'tabular-nums',
                }}/>
              </div>
              <div>
                <div style={{fontSize:10.5, color:C_MUTED, fontWeight:600, marginBottom:4}}>종료일</div>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                  disabled={endless}
                  style={{
                  width:'100%', height:36, padding:'0 10px',
                  border:`1px solid ${C_BORDER}`, borderRadius:7,
                  fontSize:12.5, background: endless ? '#F5F7FB' : C_SURFACE,
                  color: endless ? '#CBD5E1' : C_INK,
                  outline:'none', fontFamily:'inherit', boxSizing:'border-box',
                  fontVariantNumeric:'tabular-nums',
                }}/>
              </div>
            </div>
            {/* 종료 없이 계속 */}
            <label style={{
              display:'flex', alignItems:'center', gap:8, marginTop:8, cursor:'pointer',
              padding:'8px 10px', background: endless ? C_BLUE_SOFT : '#FBFCFE',
              border:`1px solid ${endless ? C_BLUE : C_BORDER}`, borderRadius:7,
            }}>
              <input type="checkbox" checked={endless} onChange={e => setEndless(e.target.checked)}
                style={{margin:0, accentColor: C_BLUE}}/>
              <span style={{fontSize:12, fontWeight: endless ? 700 : 500, color: endless ? C_BLUE : C_INK}}>
                종료 없이 계속 반복
              </span>
            </label>
          </div>

          {/* 메모 */}
          <div>
            <div style={{fontSize:11.5, fontWeight:700, color:C_INK, marginBottom:8, letterSpacing:'-0.01em'}}>
              메모 <span style={{color:C_MUTED, fontWeight:500, fontSize:10.5}}>선택</span>
            </div>
            <input value={memo} onChange={e => setMemo(e.target.value)}
              placeholder="사유나 특이사항을 입력하세요"
              style={{
                width:'100%', height:36, padding:'0 12px',
                border:`1px solid ${C_BORDER}`, borderRadius:7,
                fontSize:12.5, background:C_SURFACE, fontFamily:'inherit', outline:'none',
                boxSizing:'border-box',
              }}/>
          </div>
        </div>

        {/* 푸터 */}
        <div style={{
          padding:'12px 22px', borderTop:`1px solid ${C_BORDER}`, background:'#FBFCFE',
          display:'flex', gap:8, justifyContent:'flex-end',
        }}>
          <button onClick={onClose} style={{...c_ghostBtn, padding:'9px 16px'}}>취소</button>
          <button onClick={onClose} style={{
            padding:'9px 20px', background:C_BLUE, color:'#fff',
            border:'none', borderRadius:7, fontSize:13, fontWeight:700, cursor:'pointer',
            boxShadow:`0 2px 6px ${C_BLUE}44`, fontFamily:'inherit',
            display:'inline-flex', alignItems:'center', gap:5,
          }}>
            <IconCheck size={14}/> 저장
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ 대시보드 페이지 ============
function C_DashboardPage() {
  const revChange = ((SUMMARY.todayRevenue - SUMMARY.yesterdayRevenue) / SUMMARY.yesterdayRevenue * 100).toFixed(1);

  const kpis = [
    { label:'오늘 매출', value:'₩ 2,840,000', change:`+${revChange}% 어제 대비`, changeColor:'#059669', icon:<IconTrend/>, tint:'#EFF3FC', iconColor:C_BLUE },
    { label:'오늘 예약', value:`${SUMMARY.totalBookings}건`, change:`완료 ${SUMMARY.completed} · 예정 ${SUMMARY.upcoming}`, changeColor:C_MUTED, icon:<IconCalendar/>, tint:'#F0FDF4', iconColor:'#059669' },
    { label:'대기 중',   value:`${SUMMARY.waiting}명`, change:'평균 대기 5.5분', changeColor:C_MUTED, icon:<IconClock/>, tint:'#FFFBEB', iconColor:'#D97706', pulse:true },
    { label:'노쇼 / 취소', value:`${SUMMARY.noshow} / ${SUMMARY.cancelled}`, change:'노쇼율 3.7%', changeColor:C_MUTED, icon:<IconX/>, tint:'#FEF2F2', iconColor:'#EF4444' },
  ];

  // 시술 단가표 (매장에서 관리)
  const MENU_PRICES = {
    '커트': 25000, '남성컷': 20000, '앞머리컷': 5000, '드라이': 15000,
    '뿌리염색': 80000, '전체염색': 130000, '루트터치업': 70000,
    '펌': 120000, '디지털펌': 180000, '다운펌': 60000, '매직스트레이트': 200000, '볼륨매직': 150000,
    '클리닉': 55000, '헤어스파': 70000, '헤드스파': 65000, '세팅': 20000,
    '상담': 0,
  };
  const priceOf = (menu) => {
    // "커트 + 클리닉" 같은 조합 지원
    return menu.split(/[+·]/).map(s => {
      const k = s.trim().split(' ')[0];
      // 완전 매칭 우선, 아니면 부분매칭
      if (MENU_PRICES[k]) return MENU_PRICES[k];
      const hit = Object.keys(MENU_PRICES).find(mk => s.includes(mk));
      return hit ? MENU_PRICES[hit] : 50000;
    }).reduce((a,b) => a+b, 0);
  };

  // 디자이너별 예약 상세
  const designerLoad = DESIGNERS.filter(d => d.id !== 'unassigned').map(d => {
    const bookings = RESERVATIONS.filter(r => r.designer === d.id && !r.type);
    const completed = bookings.filter(r => r.status === 'visited');
    const upcoming = bookings.filter(r => r.status === 'confirmed');
    const noshow = bookings.filter(r => r.status === 'noshow' || r.status === 'cancelled');
    const revenue = completed.reduce((a, r) => a + priceOf(r.menu), 0);
    const expectedRevenue = upcoming.reduce((a, r) => a + priceOf(r.menu), 0);
    return {
      ...d, bookings, completed, upcoming, noshow,
      count: bookings.length, revenue, expectedRevenue, priceOf,
    };
  }).sort((a, b) => b.revenue - a.revenue);

  const maxRev = Math.max(...designerLoad.map(x => x.revenue + x.expectedRevenue), 1);

  // 매장 종합 (마감 요약)
  const storeCompleted = designerLoad.reduce((a, d) => a + d.completed.length, 0);
  const storeUpcoming = designerLoad.reduce((a, d) => a + d.upcoming.length, 0);
  const storeRevenue = designerLoad.reduce((a, d) => a + d.revenue, 0);
  const storeExpected = designerLoad.reduce((a, d) => a + d.expectedRevenue, 0);
  const storeNoshow = designerLoad.reduce((a, d) => a + d.noshow.length, 0);
  const storeAvgTicket = storeCompleted > 0 ? Math.round(storeRevenue / storeCompleted) : 0;

  // 결제수단 목업 (완료 건에 균등 분배)
  const paymentMix = {
    '카드': Math.round(storeRevenue * 0.68),
    '현금': Math.round(storeRevenue * 0.14),
    '계좌이체': Math.round(storeRevenue * 0.11),
    '포인트/쿠폰': Math.round(storeRevenue * 0.07),
  };

  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', minWidth:0, background:C_BG, overflow:'auto'}}>
      <div style={{width: 948, flexShrink: 0, display:'flex', flexDirection:'column', minHeight:'100%'}}>
      <div style={{flex:1, padding:'20px 24px 32px'}}>
        {/* 페이지 타이틀 */}
        <div style={{display:'flex', alignItems:'flex-end', gap:12, marginBottom:20}}>
          <h1 style={{margin:0, fontSize:22, fontWeight:700, color:C_INK, letterSpacing:'-0.02em'}}>대시보드</h1>
          <div style={{fontSize:13, color:C_MUTED, paddingBottom:2}}>
            2026.09.08 화요일 · 실시간
          </div>
          <div style={{flex:1}}/>
          <div style={{display:'flex', background:C_SURFACE, borderRadius:7, padding:2, border:`1px solid ${C_BORDER}`}}>
            {['오늘','이번주','이번달'].map((v, i) => (
              <button key={v} style={{
                padding:'5px 14px', fontSize:12, fontWeight:600,
                border:'none', borderRadius:5, cursor:'pointer',
                background: i===0 ? C_BLUE : 'transparent',
                color: i===0 ? '#fff' : C_MUTED,
              }}>{v}</button>
            ))}
          </div>
        </div>

        {/* KPI 스트립 */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14, marginBottom:20}}>
          {kpis.map((k, i) => (
            <div key={i} style={{
              background:C_SURFACE, padding:'16px 18px', borderRadius:12,
              border:`1px solid ${C_BORDER}`,
            }}>
              <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12}}>
                <div style={{fontSize:12, color:C_MUTED, fontWeight:500}}>{k.label}</div>
                <div style={{
                  width:32, height:32, borderRadius:8, background:k.tint,
                  color:k.iconColor, display:'flex', alignItems:'center', justifyContent:'center',
                  position:'relative',
                }}>
                  {React.cloneElement(k.icon, { size:16 })}
                  {k.pulse && <span style={{position:'absolute', top:-2, right:-2, width:8, height:8, borderRadius:'50%', background:C_CORAL, boxShadow:'0 0 0 3px rgba(249,112,102,0.25)'}}/>}
                </div>
              </div>
              <div style={{fontSize:24, fontWeight:700, color:C_INK, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em', lineHeight:1.1}}>
                {k.value}
              </div>
              <div style={{fontSize:11.5, color:k.changeColor, marginTop:6, fontWeight:500}}>
                {k.change}
              </div>
            </div>
          ))}
        </div>

        {/* 매장 종합 마감 */}
        <C_StoreSummary
          storeCompleted={storeCompleted}
          storeUpcoming={storeUpcoming}
          storeRevenue={storeRevenue}
          storeExpected={storeExpected}
          storeNoshow={storeNoshow}
          storeAvgTicket={storeAvgTicket}
          paymentMix={paymentMix}
          designerLoad={designerLoad}
        />

        {/* 디자이너별 성과 (확장형) */}
        <C_DesignerPerformance designerLoad={designerLoad} maxRev={maxRev}/>
      </div>
      </div>
    </div>
  );
}

// 매장 종합 마감 카드
function C_StoreSummary({ storeCompleted, storeUpcoming, storeRevenue, storeExpected, storeNoshow, storeAvgTicket, paymentMix, designerLoad }) {
  const totalPay = Object.values(paymentMix).reduce((a,b) => a+b, 0);
  const payColors = { '카드': C_BLUE, '현금': '#059669', '계좌이체': '#7C3AED', '포인트/쿠폰': '#F59E0B' };

  return (
    <div style={{
      background:C_SURFACE, borderRadius:12, border:`1px solid ${C_BORDER}`,
      padding:'20px 22px', marginBottom:14,
    }}>
      <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:20}}>
        <div>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <div style={{
              width:22, height:22, borderRadius:6, background:C_BLUE_SOFT, color:C_BLUE,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <IconStore size={13}/>
            </div>
            <div style={{fontSize:14, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>매장 종합 · 오늘 마감</div>
          </div>
          <div style={{fontSize:11.5, color:C_MUTED, marginTop:4, marginLeft:30}}>
            부평본점 · 완료 {storeCompleted}건 · 예정 {storeUpcoming}건 · 노쇼/취소 {storeNoshow}건
          </div>
        </div>
        <div style={{display:'flex', gap:8}}>
          <button style={{...c_ghostBtnSm, display:'flex', alignItems:'center', gap:5}}>
            <IconNote size={12}/> 상세 리포트
          </button>
          <button style={{
            padding:'6px 12px', background:C_BLUE, color:'#fff',
            border:'none', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer',
            display:'flex', alignItems:'center', gap:5,
          }}>
            <IconCheck size={12}/> 일일 마감
          </button>
        </div>
      </div>

      {/* 매출 요약 5분할 */}
      <div style={{
        display:'grid', gridTemplateColumns:'repeat(5, 1fr)',
        border:`1px solid ${C_BORDER}`, borderRadius:10, overflow:'hidden',
        marginBottom:20,
      }}>
        <C_SummaryCell label="확정 매출"     value={`₩ ${new Intl.NumberFormat('ko-KR').format(storeRevenue)}`}     sub={`${storeCompleted}건 완료`}                        accent={C_INK}/>
        <C_SummaryCell label="예상 매출"     value={`+ ${new Intl.NumberFormat('ko-KR').format(storeExpected)}`}    sub={`${storeUpcoming}건 예정`}                          accent={C_MUTED}/>
        <C_SummaryCell label="객단가"        value={`₩ ${new Intl.NumberFormat('ko-KR').format(storeAvgTicket)}`}   sub="완료 기준 평균"                                       accent={C_INK}/>
        <C_SummaryCell label="예약 → 방문율" value={`${Math.round(storeCompleted/(storeCompleted+storeNoshow||1)*100)}%`} sub={`노쇼 ${storeNoshow}건`}                        accent="#059669"/>
        <C_SummaryCell label="객수"          value={`${storeCompleted}명`}                                            sub={`재방문 ${Math.round(storeCompleted*0.7)}명`}       accent={C_INK} last/>
      </div>

      {/* 하단: 결제수단 도넛 + 디자이너 매출 랭킹 */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1.4fr', gap:20, alignItems:'stretch'}}>
        {/* 결제수단 */}
        <div>
          <div style={{fontSize:11.5, color:C_MUTED, fontWeight:600, letterSpacing:'0.02em', marginBottom:12}}>결제 수단</div>
          <div style={{display:'flex', gap:16, alignItems:'center'}}>
            {/* 도넛 SVG */}
            <div style={{position:'relative', flexShrink:0}}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                {(() => {
                  let acc = 0;
                  return Object.entries(paymentMix).map(([name, val]) => {
                    const pct = val / totalPay;
                    const start = acc;
                    acc += pct;
                    const startAngle = start * 2 * Math.PI - Math.PI/2;
                    const endAngle = acc * 2 * Math.PI - Math.PI/2;
                    const large = pct > 0.5 ? 1 : 0;
                    const r = 50, r2 = 32, cx = 60, cy = 60;
                    const x1 = cx + r*Math.cos(startAngle), y1 = cy + r*Math.sin(startAngle);
                    const x2 = cx + r*Math.cos(endAngle),   y2 = cy + r*Math.sin(endAngle);
                    const x3 = cx + r2*Math.cos(endAngle),  y3 = cy + r2*Math.sin(endAngle);
                    const x4 = cx + r2*Math.cos(startAngle),y4 = cy + r2*Math.sin(startAngle);
                    return (
                      <path key={name}
                        d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${r2} ${r2} 0 ${large} 0 ${x4} ${y4} Z`}
                        fill={payColors[name]}/>
                    );
                  });
                })()}
              </svg>
              <div style={{
                position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
                textAlign:'center',
              }}>
                <div style={{fontSize:10, color:C_MUTED, fontWeight:500}}>총 결제</div>
                <div style={{fontSize:13, fontWeight:700, color:C_INK, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em'}}>
                  ₩{Math.round(totalPay/10000)}만
                </div>
              </div>
            </div>

            <div style={{flex:1, display:'flex', flexDirection:'column', gap:8}}>
              {Object.entries(paymentMix).map(([name, val]) => (
                <div key={name} style={{display:'flex', alignItems:'center', gap:8}}>
                  <div style={{width:10, height:10, borderRadius:2, background:payColors[name], flexShrink:0}}/>
                  <span style={{fontSize:12, color:C_INK, fontWeight:500, flex:1}}>{name}</span>
                  <span style={{fontSize:11.5, color:C_MUTED, fontVariantNumeric:'tabular-nums'}}>
                    {Math.round(val/totalPay*100)}%
                  </span>
                  <span style={{fontSize:12, color:C_INK, fontWeight:600, fontVariantNumeric:'tabular-nums', minWidth:70, textAlign:'right'}}>
                    ₩{new Intl.NumberFormat('ko-KR').format(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 디자이너별 매출 스택 바 (한줄로 보는 종합) */}
        <div style={{borderLeft:`1px solid ${C_BORDER}`, paddingLeft:20}}>
          <div style={{fontSize:11.5, color:C_MUTED, fontWeight:600, letterSpacing:'0.02em', marginBottom:12}}>
            디자이너별 매출 비중 (확정)
          </div>
          <div style={{
            display:'flex', height:32, borderRadius:6, overflow:'hidden',
            background:C_BG, border:`1px solid ${C_BORDER}`,
          }}>
            {designerLoad.filter(d => d.revenue > 0).map(d => {
              const pct = d.revenue / storeRevenue * 100;
              return (
                <div key={d.id} title={`${d.name} · ₩${new Intl.NumberFormat('ko-KR').format(d.revenue)}`}
                  style={{
                    width:`${pct}%`, background:d.color,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:10, color:'#fff', fontWeight:700,
                    borderRight:'1px solid rgba(255,255,255,0.3)',
                    overflow:'hidden',
                  }}>
                  {pct > 8 ? d.name.slice(-2) : ''}
                </div>
              );
            })}
          </div>
          <div style={{display:'flex', flexWrap:'wrap', gap:'6px 12px', marginTop:12}}>
            {designerLoad.filter(d => d.revenue > 0).map(d => (
              <div key={d.id} style={{display:'flex', alignItems:'center', gap:5, fontSize:11, color:C_MUTED}}>
                <div style={{width:8, height:8, borderRadius:2, background:d.color}}/>
                <span style={{color:C_INK, fontWeight:500}}>{d.name}</span>
                <span style={{fontVariantNumeric:'tabular-nums'}}>
                  ₩{new Intl.NumberFormat('ko-KR').format(d.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function C_SummaryCell({ label, value, sub, accent, last }) {
  return (
    <div style={{
      padding:'14px 16px',
      borderRight: last ? 'none' : `1px solid ${C_BORDER}`,
      background: '#FBFCFE',
    }}>
      <div style={{fontSize:11, color:C_MUTED, fontWeight:500}}>{label}</div>
      <div style={{
        fontSize:18, fontWeight:700, color:accent, marginTop:4,
        fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em', lineHeight:1.1,
      }}>{value}</div>
      <div style={{fontSize:10.5, color:C_MUTED, marginTop:3}}>{sub}</div>
    </div>
  );
}

// 디자이너 성과 - 클릭시 개인별 내역 확장
function C_DesignerPerformance({ designerLoad, maxRev }) {
  const [expandedId, setExpandedId] = React.useState(designerLoad[0]?.id);

  return (
    <div style={{background:C_SURFACE, borderRadius:12, border:`1px solid ${C_BORDER}`, padding:'18px 20px'}}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14}}>
        <div>
          <div style={{fontSize:13, fontWeight:700, color:C_INK}}>디자이너별 성과</div>
          <div style={{fontSize:11.5, color:C_MUTED, marginTop:2}}>행을 클릭하면 예약 내역이 열립니다</div>
        </div>
        <div style={{display:'flex', gap:12, fontSize:11, color:C_MUTED}}>
          <span style={{display:'flex', alignItems:'center', gap:4}}>
            <span style={{width:10, height:10, borderRadius:2, background:'#059669'}}/> 확정 매출
          </span>
          <span style={{display:'flex', alignItems:'center', gap:4}}>
            <span style={{width:10, height:10, borderRadius:2, background:'#BFDBFE'}}/> 예상 매출
          </span>
        </div>
      </div>

      {/* 테이블 헤더 */}
      <div style={{
        display:'grid', gridTemplateColumns:'32px 100px 60px 60px 60px 1fr 130px 130px 20px',
        gap:12, padding:'8px 12px', fontSize:10.5, color:C_MUTED,
        fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase',
        borderBottom:`1px solid ${C_BORDER}`,
      }}>
        <div></div>
        <div>디자이너</div>
        <div style={{textAlign:'right'}}>완료</div>
        <div style={{textAlign:'right'}}>예정</div>
        <div style={{textAlign:'right'}}>노쇼</div>
        <div>매출 비교</div>
        <div style={{textAlign:'right'}}>확정 매출</div>
        <div style={{textAlign:'right'}}>예상 매출</div>
        <div></div>
      </div>

      {/* 행 */}
      {designerLoad.map((d, idx) => {
        const isOpen = expandedId === d.id;
        const revPct = (d.revenue / maxRev) * 100;
        const expPct = (d.expectedRevenue / maxRev) * 100;
        return (
          <div key={d.id} style={{borderBottom: idx < designerLoad.length-1 ? `1px solid ${C_BORDER}` : 'none'}}>
            <div onClick={() => setExpandedId(isOpen ? null : d.id)} style={{
              display:'grid', gridTemplateColumns:'32px 100px 60px 60px 60px 1fr 130px 130px 20px',
              gap:12, padding:'12px', alignItems:'center',
              cursor:'pointer',
              background: isOpen ? C_BLUE_SOFT : 'transparent',
              transition:'background 0.15s',
            }}>
              <div style={{
                width:6, height:26, borderRadius:3, background:d.color,
              }}/>
              <div>
                <div style={{fontSize:13, fontWeight:600, color:C_INK}}>{d.name}</div>
                <div style={{fontSize:10.5, color:C_MUTED, marginTop:1}}>{d.role}</div>
              </div>
              <div style={{fontSize:13, color:C_INK, fontWeight:600, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{d.completed.length}</div>
              <div style={{fontSize:13, color:C_MUTED, fontWeight:500, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{d.upcoming.length}</div>
              <div style={{fontSize:13, color: d.noshow.length > 0 ? '#EF4444' : C_MUTED, fontWeight:500, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{d.noshow.length}</div>
              <div>
                {/* 스택 바: 확정 + 예상 */}
                <div style={{display:'flex', height:8, borderRadius:4, background:'#F1F5F9', overflow:'hidden'}}>
                  <div style={{width:`${revPct}%`, background:'#059669'}}/>
                  <div style={{width:`${expPct}%`, background:'#BFDBFE'}}/>
                </div>
              </div>
              <div style={{fontSize:13, color:C_INK, fontWeight:700, textAlign:'right', fontVariantNumeric:'tabular-nums', letterSpacing:'-0.01em'}}>
                ₩{new Intl.NumberFormat('ko-KR').format(d.revenue)}
              </div>
              <div style={{fontSize:12.5, color:C_MUTED, fontWeight:500, textAlign:'right', fontVariantNumeric:'tabular-nums'}}>
                +{new Intl.NumberFormat('ko-KR').format(d.expectedRevenue)}
              </div>
              <div style={{
                color:C_MUTED, transition:'transform 0.2s',
                transform: isOpen ? 'rotate(180deg)' : 'none',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <IconChevronD size={14}/>
              </div>
            </div>

            {/* 확장 상세 */}
            {isOpen && (
              <div style={{
                padding:'0 12px 16px 50px', background: C_BLUE_SOFT,
              }}>
                <div style={{
                  background:C_SURFACE, borderRadius:8, border:`1px solid ${C_BORDER}`,
                  overflow:'hidden',
                }}>
                  {d.bookings.length === 0 ? (
                    <div style={{padding:'20px', textAlign:'center', color:C_MUTED, fontSize:12}}>
                      오늘 예약 없음
                    </div>
                  ) : (
                    d.bookings.map((r, i) => {
                      const st = C_STATUS[r.status];
                      const price = d.priceOf(r.menu);
                      return (
                        <div key={r.id} style={{
                          display:'grid', gridTemplateColumns:'70px 90px 1fr 100px 100px',
                          gap:12, padding:'10px 14px', alignItems:'center',
                          fontSize:12,
                          borderTop: i > 0 ? `1px solid ${C_BORDER}` : 'none',
                        }}>
                          <div style={{color:C_INK, fontWeight:600, fontVariantNumeric:'tabular-nums'}}>
                            {r.start}
                          </div>
                          <div style={{color:C_INK, fontWeight:500}}>{r.customer}</div>
                          <div style={{color:C_MUTED, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{r.menu}</div>
                          <div>
                            <span style={{
                              display:'inline-flex', alignItems:'center', gap:4,
                              padding:'2px 8px', borderRadius:10,
                              background: st.bg === '#1E40AF' ? C_BLUE_SOFT : st.bg,
                              color: st.bg === '#1E40AF' ? C_BLUE : st.text,
                              fontSize:11, fontWeight:600,
                            }}>
                              <span style={{width:5, height:5, borderRadius:'50%', background:st.dot}}/>
                              {st.label}
                            </span>
                          </div>
                          <div style={{textAlign:'right', color: r.status === 'visited' ? C_INK : C_MUTED, fontWeight: r.status === 'visited' ? 700 : 500, fontVariantNumeric:'tabular-nums'}}>
                            ₩{new Intl.NumberFormat('ko-KR').format(price)}
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* 소계 */}
                  {d.bookings.length > 0 && (
                    <div style={{
                      display:'grid', gridTemplateColumns:'70px 90px 1fr 100px 100px',
                      gap:12, padding:'10px 14px', alignItems:'center',
                      background: '#FBFCFE', borderTop:`1px solid ${C_BORDER}`,
                      fontSize:11.5,
                    }}>
                      <div></div>
                      <div style={{color:C_MUTED, fontWeight:600}}>합계</div>
                      <div style={{color:C_MUTED}}>
                        완료 {d.completed.length}건 · 예정 {d.upcoming.length}건
                      </div>
                      <div style={{textAlign:'right', color:C_MUTED, fontWeight:500}}>확정</div>
                      <div style={{textAlign:'right', color:C_INK, fontWeight:700, fontVariantNumeric:'tabular-nums'}}>
                        ₩{new Intl.NumberFormat('ko-KR').format(d.revenue)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============ 메인 ============
function VariantC() {
  const [page, setPage] = React.useState(() => localStorage.getItem('crm-c-page') || 'booking');
  React.useEffect(() => { localStorage.setItem('crm-c-page', page); }, [page]);
  const [modal, setModal] = React.useState(null); // 'customer-register' | 'guest-sales' | 'booking-add' | null
  const [bookingSeed, setBookingSeed] = React.useState(null);
  const CustomerRegModal = window.C_CustomerRegisterModal;
  const GuestSalesModal = window.C_GuestSalesModal;
  const BookingAddModal = window.C_BookingAddModal;
  const [salesTarget, setSalesTarget] = React.useState(null);
  const [gToast, setGToast] = React.useState(null);
  React.useEffect(() => { if (!gToast) return; const t = setTimeout(() => setGToast(null), 2600); return () => clearTimeout(t); }, [gToast]);
  const SalesPage = window.C_SalesPage;
  // 하위 페이지에서 모달을 열 수 있게 window로 노출
  React.useEffect(() => {
    window.__openBookingModal = (customer) => { setBookingSeed(customer || null); setModal('booking-add'); };
    window.__openSales = (t) => setSalesTarget(t);
    window.__openCustomerRegister = () => setModal('customer-register');
    window.__goPage = (pg) => { setSalesTarget(null); setPage(pg); };
    window.__toast = (msg) => setGToast({ msg, key: Date.now() });
    return () => { delete window.__openBookingModal; delete window.__openSales; };
  }, []);
  // 총 폭 = 사이드바(64) + 페이지(946) = 1010
  return (
    <div style={{
      display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden',
      fontFamily:"'Pretendard Variable','Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
      background: C_BG, color: C_INK,
    }}>
      <style>{`
        @keyframes c-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
        }
        /* 타임그리드 스크롤바 슬림하게 */
        .c-timegrid-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .c-timegrid-scroll::-webkit-scrollbar-track { background: transparent; }
        .c-timegrid-scroll::-webkit-scrollbar-thumb {
          background: rgba(148,163,184,0.35); border-radius: 3px;
        }
        .c-timegrid-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(148,163,184,0.55);
        }
        .c-timegrid-scroll { scrollbar-width: thin; scrollbar-color: rgba(148,163,184,0.35) transparent; }
        /* 스케줄 셀 hover 시 + 아이콘 표시 */
        .c-schedule-cell:hover .c-schedule-add-btn { display: flex !important; }
        .c-schedule-cell:hover { background: #F8FBFF !important; }
      `}</style>
      {/* 최상단 헤더 (예약/매장일정에서는 사이드 패널 폭 260 추가) */}
      <div style={{width: salesTarget || page === 'booking' || page === 'schedule' ? 1272 : (page === 'mkt-bulk' || page === 'mkt-auto') ? 1272 : 1012, flexShrink:0}}>
        <C_TopHeader
          onOpenCustomerRegister={() => setModal('customer-register')}
          onOpenGuestSales={() => setSalesTarget({ guest:true, key: Date.now() })}
          onOpenClosing={() => { setSalesTarget(null); setPage('closing'); }}
        />
      </div>
      {/* 아래: 좌 사이드바(아이콘) + 우 페이지 콘텐츠 (+ 예약/매장일정 페이지는 우측 사이드 패널 260) */}
      <div style={{display:'flex', flex:1, minHeight:0, width: salesTarget || page === 'booking' || page === 'schedule' ? 1272 : (page === 'mkt-bulk' || page === 'mkt-auto') ? 1272 : 1012}}>
        <C_SideBar page={page} onPage={(pg) => { setSalesTarget(null); setPage(pg); }}/>
        {(() => {
          const StatsCmp = window.C_StatsPage;
          const ClosingCmp = window.C_ClosingPage;
          const SettingsMenu = window.C_SettingsMenuPage;
          const StaffCmp = window.C_StaffPage;
          const StubPage = window.C_StubPage;
          if (salesTarget && SalesPage) {
            const Wing = window.C_ReservationSidePanel;
            return (
              <div style={{flex:1, display:'flex', minWidth:0, minHeight:0, overflow:'hidden'}}>
                <SalesPage key={salesTarget.key || salesTarget.customer || 'guest'} target={salesTarget} onClose={() => setSalesTarget(null)}/>
                {Wing && <div style={{flexShrink:0, height:'100%', display:'flex'}}><Wing/></div>}
              </div>
            );
          }
          if (page === 'mkt-bulk' && window.C_MktBulkPage) return <window.C_MktBulkPage/>;
          if (page === 'mkt-auto' && window.C_MktAutoPage) return <window.C_MktAutoPage/>;
          if (page === 'mkt-charge' && window.C_MktChargePage) return <window.C_MktChargePage/>;
          if (page === 'mkt-report' && window.C_MktReportPage) return <window.C_MktReportPage/>;
          if (page === 'mkt-revisit' && window.C_MktRevisitPage) return <window.C_MktRevisitPage/>;
          if (page === 'dashboard') return <C_DashboardPage/>;
          if (page === 'schedule')  return <C_SchedulePage/>;
          if (page === 'stats' && StatsCmp)   return <StatsCmp/>;
          if (page === 'closing' && ClosingCmp) return <ClosingCmp/>;
          if (page === 'staff-sub' && window.C_StaffSubPage) return <window.C_StaffSubPage/>;
          const OpsCmp = window.C_OpsPage;
          const SmsCmp = window.C_SmsPage;
          if (page === 'settings-menu' && SettingsMenu) return <SettingsMenu/>;
          if (page === 'settings-staff' && StaffCmp) return <StaffCmp/>;
          if (page === 'settings-ops' && OpsCmp) return <OpsCmp/>;
          if (page === 'settings-sms' && SmsCmp) return <SmsCmp/>;
          const PhoneCmp = window.C_PhonePage;
          if (page === 'settings-phone' && PhoneCmp) return <PhoneCmp/>;
          if (page === 'settings-group' && window.C_CustomerGroupPage) return <window.C_CustomerGroupPage/>;
          if (STUB_PAGES[page] && StubPage) return <StubPage {...STUB_PAGES[page]}/>;
          return <C_BookingPage/>;
        })()}
      </div>

      {gToast && (
        <div key={gToast.key} style={{
          position:'fixed', left:'50%', bottom:28, transform:'translateX(-50%)', zIndex:400,
          background:'#0B1425', color:'#fff', fontSize:12.5, fontWeight:600, padding:'10px 16px', borderRadius:8,
          boxShadow:'0 8px 24px rgba(11,20,37,0.3)', display:'flex', alignItems:'center', gap:8,
        }}><IconCheck size={14} stroke={2.4}/>{gToast.msg}</div>
      )}
      {/* 전역 모달들 */}
      {modal === 'customer-register' && CustomerRegModal && (
        <CustomerRegModal onClose={() => setModal(null)}/>
      )}
      {modal === 'guest-sales' && GuestSalesModal && (
        <GuestSalesModal onClose={() => setModal(null)}/>
      )}
      {modal === 'booking-add' && BookingAddModal && (
        <BookingAddModal initialCustomer={bookingSeed} onClose={() => { setModal(null); setBookingSeed(null); }}/>
      )}
    </div>
  );
}

window.VariantC = VariantC;
// 하위 페이지 파일에서 참조하는 상수/스타일들
Object.assign(window, {
  C_BLUE, C_BLUE_SOFT, C_CORAL, C_INK, C_MUTED, C_BORDER, C_BG, C_SURFACE,
  C_STATUS, C_SLOT_HEIGHT, C_HEADER_H, C_TIME_COL_W,
  c_iconBtn, c_iconBtnSm, c_ghostBtn, c_ghostBtnSm, c_pagerBtn,
});
