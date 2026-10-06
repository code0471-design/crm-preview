// 예약 등록 모달 - 세련된 재설계 (한 화면, 좌 입력 / 우 라이브 미리보기)

const {
  C_BLUE, C_BLUE_SOFT, C_INK, C_MUTED, C_BORDER, C_BG, C_SURFACE,
  c_ghostBtn,
} = window;

function C_BookingAddModal({ onClose, initialCustomer }) {
  const [customer, setCustomer] = React.useState(initialCustomer || CUSTOMERS[0]);
  const [showCustomerPicker, setShowCustomerPicker] = React.useState(false);
  const [guestOpen, setGuestOpen] = React.useState(false);
  const [guestName, setGuestName] = React.useState('');
  const openGuest = () => { setGuestName(''); setGuestOpen(true); };
  const applyGuest = (name) => {
    const trimmed = (name || '').trim();
    setCustomer({
      id: 'guest-' + Date.now(),
      name: trimmed,
      phone: '',
      tags: ['비회원'],
      lastVisit: '-',
      totalVisits: 0,
      mainDesigner: null,
      memo: '',
      guest: true,
    });
    setGuestOpen(false);
  };
  const shownName = customer.guest && !customer.name ? '비회원' : customer.name;
  const avatarChar = (customer.name || '비').charAt(0);

  const [date, setDate] = React.useState({y: 2026, m: 9, d: 21});
  const [designerId, setDesignerId] = React.useState('moon');
  const [time, setTime] = React.useState('17:30');

  const [serviceCategory, setServiceCategory] = React.useState(MENU_CATEGORIES[0].id);
  const [selectedServices, setSelectedServices] = React.useState([]);
  const [memo, setMemo] = React.useState('');
  // 예약금 (네이버 예약금 등 — 연동 전 수기 입력)
  const [deposit, setDeposit] = React.useState({ on:false, amount:0, channel:'naver' });
  const register = () => {
    if (deposit.on && deposit.amount > 0 && customer?.name) {
      window.BOOKING_DEPOSITS[customer.name] = { amount: deposit.amount, channel: deposit.channel, paidAt:'2026.10.01' };
    }
    onClose();
  };

  // 미리보기용 호환 배열
  const designerIds = designerId ? [designerId] : [];
  const toggleService = (item, catId) => {
    const exists = selectedServices.some(s => s.itemId === item.id);
    if (exists) setSelectedServices(prev => prev.filter(s => s.itemId !== item.id));
    else setSelectedServices(prev => [...prev, {
      catId, itemId: item.id, name: item.name, price: item.price, duration: item.duration || 0,
    }]);
  };

  const totalPrice = selectedServices.reduce((a,s) => a + s.price, 0);
  const totalMin = selectedServices.reduce((a,s) => a + s.duration, 0);
  const items = MENU_ITEMS[serviceCategory] || [];
  const dow = ['일','월','화','수','목','금','토'][new Date(date.y, date.m - 1, date.d).getDay()];

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(11,20,37,0.6)',
      zIndex:200, display:'flex', alignItems:'center', justifyContent:'center',
      padding:16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width:1080, maxWidth:'96vw', height:'88vh', maxHeight:840,
        background:C_SURFACE, borderRadius:20,
        boxShadow:'0 32px 80px rgba(11,20,37,0.32)',
        display:'flex', flexDirection:'column', overflow:'hidden',
      }}>
        {/* 헤더: 타이틀 + 고객 검색 + 닫기 */}
        <div style={{
          padding:'16px 22px', display:'flex', alignItems:'center', gap:16,
          borderBottom:`1px solid ${C_BORDER}`,
        }}>
          <div style={{fontSize:18, fontWeight:800, color:C_INK, letterSpacing:'-0.02em', flexShrink:0}}>
            예약 등록
          </div>
          {/* 고객 검색 (인라인, 헤더 옆) */}
          <button onClick={() => setShowCustomerPicker(true)} style={{
            display:'flex', alignItems:'center', gap:10, flex:1, maxWidth:420,
            padding:'8px 14px 8px 10px',
            background:C_BG, border:`1.5px solid ${C_BORDER}`, borderRadius:12,
            cursor:'pointer', fontFamily:'inherit',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = C_BLUE}
          onMouseLeave={e => e.currentTarget.style.borderColor = C_BORDER}
          >
            <div style={{
              width:26, height:26, borderRadius:'50%',
              background: customer.guest ? '#94A3B8' : C_BLUE, color:'#fff',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:11, fontWeight:800, flexShrink:0,
            }}>{avatarChar}</div>
            <div style={{flex:1, minWidth:0, textAlign:'left'}}>
              <div style={{display:'flex', alignItems:'center', gap:5}}>
                <span style={{fontSize:13.5, fontWeight:800, color:C_INK, letterSpacing:'-0.01em'}}>{shownName}</span>
                {customer.tags[0] && (
                  <span style={{
                    fontSize:10, fontWeight:700, padding:'1px 7px', borderRadius:8,
                    background: customer.tags[0]==='VIP' ? '#FEF3C7' : customer.tags[0]==='단골' ? '#DBEAFE' : customer.tags[0]==='비회원' ? '#F1F5F9' : '#F1F5F9',
                    color: customer.tags[0]==='VIP' ? '#B45309' : customer.tags[0]==='단골' ? C_BLUE : C_MUTED,
                  }}>{customer.tags[0]}</span>
                )}
                {customer.phone && (
                  <span style={{fontSize:11, color:C_MUTED, fontVariantNumeric:'tabular-nums'}}>{customer.phone}</span>
                )}
                {!customer.guest && (
                  <span style={{fontSize:11, color:C_MUTED}}>· 방문 {customer.totalVisits}회</span>
                )}
              </div>
            </div>
            <IconSearch size={13} style={{color:C_MUTED, flexShrink:0}}/>
          </button>
          <button onClick={openGuest} style={{
            display:'inline-flex', alignItems:'center', gap:6, flexShrink:0,
            height:42, padding:'0 14px',
            background:C_SURFACE, color:C_INK,
            border:`1.5px solid ${C_BORDER}`, borderRadius:12,
            fontSize:12.5, fontWeight:800, cursor:'pointer', fontFamily:'inherit',
            whiteSpace:'nowrap', letterSpacing:'-0.01em',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = C_BLUE}
          onMouseLeave={e => e.currentTarget.style.borderColor = C_BORDER}
          >
            <IconUser size={13}/> 비회원 예약 등록
          </button>

          <div style={{flex:1}}/>
          <button onClick={onClose} style={{
            width:36, height:36, borderRadius:10,
            border:'none', background:C_BG,
            color:C_INK, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#EEF1F6'}
          onMouseLeave={e => e.currentTarget.style.background = C_BG}
          ><IconX size={17}/></button>
        </div>

        {/* 본문: 좌 넓게 + 우 미리보기 (좁게) */}
        <div style={{
          flex:1, display:'grid', gridTemplateColumns:'1fr 320px',
          minHeight:0,
        }}>
          {/* ── 좌: 입력 영역 ── */}
          <div style={{
            padding:'18px 22px', overflow:'auto', minHeight:0,
            background:'#F8FAFC',
            display:'flex', flexDirection:'column', gap:12,
          }}>
            {/* 일시 (달력 + 시간) - 상단 풀폭 */}
            <BK_Section label="일시" required>
              <div style={{display:'grid', gridTemplateColumns:'220px minmax(0, 1fr)', gap:12}}>
                <BK_MiniCalendar date={date} setDate={setDate}/>
                <BK_TimeCompact time={time} setTime={setTime}/>
              </div>
            </BK_Section>

            {/* 하단: 담당자 + 시술 좌우 배치 */}
            <div style={{display:'grid', gridTemplateColumns:'minmax(0, 220px) minmax(0, 1fr)', gap:12}}>
              {/* 담당자 - 줄당 2명 */}
              <BK_Section label="담당자" required>
                <BK_DesignerChips designerId={designerId} setDesignerId={setDesignerId}/>
              </BK_Section>

              {/* 시술 */}
              <BK_Section label="시술" badge={selectedServices.length > 0 ? `${selectedServices.length}개 선택` : '다중 선택'}>
                <BK_ServicePicker
                  category={serviceCategory} setCategory={setServiceCategory}
                  items={items} selectedServices={selectedServices}
                  toggleService={toggleService}
                />
              </BK_Section>
            </div>
          </div>

          {/* ── 우: 라이브 미리보기 (예약 카드) ── */}
          <div style={{
            background: C_BG,
            padding:'18px 16px', display:'flex', flexDirection:'column', gap:10,
            borderLeft:`1px solid ${C_BORDER}`, minHeight:0, overflow:'auto',
          }}>
            <BK_LivePreview
              customer={customer}
              date={date} time={time} dow={dow}
              designerIds={designerIds}
              services={selectedServices}
              totalMin={totalMin} totalPrice={totalPrice}
              memo={memo} setMemo={setMemo}
              deposit={deposit} setDeposit={setDeposit}
            />
          </div>
        </div>

        {/* 푸터 */}
        <div style={{
          padding:'14px 22px', borderTop:`1px solid ${C_BORDER}`,
          background:C_SURFACE,
          display:'flex', gap:10, justifyContent:'flex-end', alignItems:'center',
        }}>
          <button onClick={onClose} style={{
            padding:'11px 24px', background:C_SURFACE, color:C_INK,
            border:`1.5px solid ${C_BORDER}`, borderRadius:14,
            fontSize:13, fontWeight:700, cursor:'pointer',
            fontFamily:'inherit', minWidth:110,
          }}>닫기</button>
          <button onClick={register} style={{
            padding:'12px 32px',
            background: C_BLUE, color:'#fff',
            border:'none', borderRadius:14, fontSize:14, fontWeight:800,
            cursor:'pointer', minWidth:160,
            boxShadow:`0 2px 8px ${C_BLUE}44`,
            fontFamily:'inherit',
            display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6,
            letterSpacing:'-0.01em',
          }}>
            <IconCheck size={16}/> 예약 등록
          </button>
        </div>
      </div>

      {showCustomerPicker && (
        <C_CustomerPickerPopover
          current={customer}
          onSelect={(c) => { setCustomer(c); setShowCustomerPicker(false); }}
          onClose={() => setShowCustomerPicker(false)}
        />
      )}
      {guestOpen && (
        <BK_GuestNameDialog
          name={guestName}
          setName={setGuestName}
          onApply={applyGuest}
          onClose={() => setGuestOpen(false)}
        />
      )}
    </div>
  );
}

// ─── 섹션 래퍼 (카드 형식) ───
function BK_Section({ label, required, badge, flex, children, card = true }) {
  const inner = (
    <>
      <div style={{display:'flex', alignItems:'baseline', gap:8, marginBottom: card ? 10 : 8}}>
        <span style={{fontSize:12.5, fontWeight:800, color:C_INK, letterSpacing:'-0.01em'}}>
          {label} {required && <span style={{color:'#EF4444'}}>*</span>}
        </span>
        {badge && (
          <span style={{
            fontSize:10.5, fontWeight:700, color:C_MUTED, letterSpacing:'-0.01em',
          }}>{badge}</span>
        )}
      </div>
      {flex ? <div style={{flex:1, minHeight:0}}>{children}</div> : children}
    </>
  );
  if (!card) {
    return <section style={flex ? {flex:1, minHeight:0, display:'flex', flexDirection:'column'} : {}}>{inner}</section>;
  }
  return (
    <section style={{
      background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:12,
      padding:'12px 14px',
      boxShadow:'0 1px 2px rgba(11,20,37,0.03)',
      ...(flex ? {flex:1, minHeight:0, display:'flex', flexDirection:'column'} : {}),
    }}>
      {inner}
    </section>
  );
}

// ─── 고객 히어로 카드 ───
function BK_CustomerHero({ customer, onChange }) {
  const designer = DESIGNERS.find(d => d.id === customer.mainDesigner);
  const color = designer?.color || '#7C3AED';
  return (
    <div style={{
      padding:'18px 20px',
      background:`linear-gradient(135deg, ${color}12 0%, ${C_BLUE}0A 100%)`,
      border:`1px solid ${color}33`,
      borderRadius:16,
      display:'flex', alignItems:'center', gap:16,
    }}>
      {/* 아바타 */}
      <div style={{
        width:56, height:56, borderRadius:'50%',
        background: color, color:'#fff',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:22, fontWeight:800, letterSpacing:'-0.02em',
        boxShadow:`0 4px 12px ${color}55`, flexShrink:0,
      }}>{customer.name.charAt(0)}</div>

      {/* 정보 */}
      <div style={{flex:1, minWidth:0}}>
        <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:5}}>
          <span style={{fontSize:18, fontWeight:800, color:C_INK, letterSpacing:'-0.02em'}}>{customer.name}</span>
          {customer.tags.slice(0,2).map(t => (
            <span key={t} style={{
              fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:10,
              background: t === 'VIP' ? '#FEF3C7' : t === '단골' ? '#DBEAFE' : t === '신규' ? '#D1FAE5' : '#F1F5F9',
              color: t === 'VIP' ? '#B45309' : t === '단골' ? C_BLUE : t === '신규' ? '#059669' : C_MUTED,
              letterSpacing:'-0.01em',
            }}>{t}</span>
          ))}
        </div>
        <div style={{fontSize:12, color:C_MUTED, display:'flex', alignItems:'center', gap:14, fontVariantNumeric:'tabular-nums'}}>
          <span>{customer.phone}</span>
          <span style={{color:C_BORDER}}>·</span>
          <span>방문 {customer.totalVisits}회</span>
          {designer && (
            <>
              <span style={{color:C_BORDER}}>·</span>
              <span style={{display:'inline-flex', alignItems:'center', gap:4}}>
                <span style={{width:6, height:6, borderRadius:'50%', background:color}}/>
                주 담당 {designer.name}
              </span>
            </>
          )}
        </div>
      </div>

      {/* 변경 버튼 */}
      <button onClick={onChange} style={{
        padding:'8px 14px', background:'#fff',
        border:`1.5px solid ${C_BORDER}`, borderRadius:20,
        fontSize:12, fontWeight:700, color:C_INK, cursor:'pointer',
        fontFamily:'inherit',
        display:'inline-flex', alignItems:'center', gap:5,
        boxShadow:'0 1px 3px rgba(11,20,37,0.06)',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = C_BLUE}
      onMouseLeave={e => e.currentTarget.style.borderColor = C_BORDER}
      >
        <IconUser size={12}/> 고객 변경
      </button>
    </div>
  );
}

// ─── 미니 달력 (컴팩트) ───
function BK_MiniCalendar({ date, setDate }) {
  const daysInMonth = new Date(date.y, date.m, 0).getDate();
  const firstDow = new Date(date.y, date.m - 1, 1).getDay();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const today = { y:2026, m:9, d:21 };
  return (
    <div>
      {/* 년월 */}
      <div style={{display:'flex', alignItems:'center', gap:4, marginBottom:6}}>
        <button onClick={() => setDate(prev => ({...prev, m: prev.m === 1 ? 12 : prev.m - 1, y: prev.m === 1 ? prev.y - 1 : prev.y, d: 1}))} style={c_bkNav}>
          <IconChevronL size={11}/>
        </button>
        <div style={{flex:1, textAlign:'center', fontSize:12.5, fontWeight:700, color:C_INK, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.01em'}}>
          {date.y}. {String(date.m).padStart(2,'0')}
        </div>
        <button onClick={() => setDate(prev => ({...prev, m: prev.m === 12 ? 1 : prev.m + 1, y: prev.m === 12 ? prev.y + 1 : prev.y, d: 1}))} style={c_bkNav}>
          <IconChevronR size={11}/>
        </button>
      </div>
      {/* 요일 */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', marginBottom:2}}>
        {['일','월','화','수','목','금','토'].map((w, i) => (
          <div key={w} style={{
            textAlign:'center', fontSize:9.5, fontWeight:700, padding:'2px 0',
            color: i === 0 ? '#EF4444' : i === 6 ? C_BLUE : C_MUTED,
            letterSpacing:'-0.01em',
          }}>{w}</div>
        ))}
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:1}}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} style={{height:24}}/>;
          const on = date.d === d;
          const isToday = date.y === today.y && date.m === today.m && d === today.d;
          const dow = i % 7;
          return (
            <button key={i} onClick={() => setDate(prev => ({...prev, d}))} style={{
              height:24, borderRadius:6, border:'none',
              background: on ? C_BLUE : isToday ? C_BLUE_SOFT : 'transparent',
              color: on ? '#fff'
                : dow === 0 ? '#EF4444'
                : dow === 6 ? C_BLUE
                : C_INK,
              fontSize:11, fontWeight: on ? 800 : isToday ? 700 : 500,
              cursor:'pointer', fontFamily:'inherit', fontVariantNumeric:'tabular-nums',
              transition:'all 0.1s',
              padding:0,
            }}
            onMouseEnter={e => { if (!on) e.currentTarget.style.background = C_BG; }}
            onMouseLeave={e => { if (!on) e.currentTarget.style.background = isToday ? C_BLUE_SOFT : 'transparent'; }}
            >{d}</button>
          );
        })}
      </div>
    </div>
  );
}

// ─── 시간 (오전/오후 나눔, 12시간 표기) ───
function BK_TimeCompact({ time, setTime }) {
  const disabled = new Set(['12:00','12:30','15:00']);
  const to12h = (t) => {
    const [h, m] = t.split(':').map(Number);
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:${String(m).padStart(2,'0')}`;
  };

  const morning = []; // 8:00 ~ 11:30 (한 줄에 2개씩)
  for (let h = 8; h < 12; h++) for (const m of [0, 30]) morning.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
  const afternoon = []; // 12:00 ~ 23:30 (한 줄에 6개씩)
  for (let h = 12; h < 24; h++) for (const m of [0, 30]) afternoon.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);

  const renderSlot = (t) => {
    const on = time === t;
    const off = disabled.has(t);
    return (
      <button key={t} onClick={() => !off && setTime(t)} disabled={off} style={{
        padding:'9px 0', fontSize:12, fontWeight: on ? 800 : 600,
        border:`1.5px solid ${on ? C_BLUE : off ? '#EEF1F6' : C_BORDER}`,
        background: on ? C_BLUE : off ? '#F5F7FB' : C_SURFACE,
        color: on ? '#fff' : off ? '#CBD5E1' : C_INK,
        borderRadius:7, cursor: off ? 'not-allowed' : 'pointer',
        fontFamily:'inherit', fontVariantNumeric:'tabular-nums',
        textDecoration: off ? 'line-through' : 'none',
        transition:'all 0.1s',
        minWidth:0,
      }}>{to12h(t)}</button>
    );
  };

  return (
    <div style={{display:'grid', gridTemplateColumns:'minmax(0, 2fr) minmax(0, 6fr)', gap:10, minWidth:0}}>
      {/* 오전 - 한 줄에 2개 */}
      <div style={{minWidth:0}}>
        <div style={{
          fontSize:10.5, fontWeight:800, color:C_MUTED, letterSpacing:'0.08em',
          padding:'4px 8px', background:C_BG, borderRadius:6,
          display:'inline-block', marginBottom:6,
        }}>오전</div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0, 1fr))', gap:3}}>
          {morning.map(renderSlot)}
        </div>
      </div>
      {/* 오후 - 한 줄에 6개 */}
      <div style={{minWidth:0}}>
        <div style={{
          fontSize:10.5, fontWeight:800, color:'#fff', letterSpacing:'0.08em',
          padding:'4px 8px', background:'#0B1425', borderRadius:6,
          display:'inline-block', marginBottom:6,
        }}>오후</div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(6, minmax(0, 1fr))', gap:3}}>
          {afternoon.map(renderSlot)}
        </div>
      </div>
    </div>
  );
}

// ─── 담당자 이름 칩 (단일 선택, 2컬럼) ───
function BK_DesignerChips({ designerId, setDesignerId }) {
  const designers = DESIGNERS.filter(d => d.id !== 'unassigned').slice(0, 10);
  return (
    <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0, 1fr))', gap:4}}>
      {designers.map(d => {
        const on = designerId === d.id;
        return (
          <button key={d.id} onClick={() => setDesignerId(d.id)} style={{
            padding:'8px 10px', fontSize:12.5, fontWeight: on ? 800 : 600,
            border:`1.5px solid ${on ? d.color : C_BORDER}`,
            background: on ? `${d.color}18` : C_SURFACE,
            color: on ? C_INK : C_MUTED,
            borderRadius:8, cursor:'pointer', fontFamily:'inherit',
            letterSpacing:'-0.01em',
            transition:'all 0.12s',
            textAlign:'center', whiteSpace:'nowrap',
            overflow:'hidden', textOverflow:'ellipsis',
            borderLeft: on ? `3px solid ${d.color}` : `1.5px solid ${C_BORDER}`,
            paddingLeft: on ? 8 : 10,
          }}>
            {d.name}
          </button>
        );
      })}
    </div>
  );
}

// ─── 시술 (1차 카테고리 + 2차 세부 메뉴) ───
function BK_ServicePicker({ category, setCategory, items, selectedServices, toggleService }) {
  const currentCat = MENU_CATEGORIES.find(c => c.id === category);
  return (
    <div style={{display:'flex', flexDirection:'column', gap:0}}>
      {/* 1차 카테고리 - 탭 형태 */}
      <div style={{
        display:'grid', gridTemplateColumns:'repeat(4, minmax(0, 1fr))', gap:0,
        borderBottom:`2px solid ${C_BORDER}`,
        position:'relative', marginBottom:-1,
      }}>
        {MENU_CATEGORIES.map(c => {
          const on = category === c.id;
          const selectedInCat = selectedServices.filter(s => s.catId === c.id).length;
          return (
            <button key={c.id} onClick={() => setCategory(c.id)} style={{
              padding:'8px 10px 10px', textAlign:'center',
              border:'none', background:'transparent',
              borderBottom: on ? `2px solid ${c.color}` : '2px solid transparent',
              marginBottom:-2,
              cursor:'pointer', fontFamily:'inherit',
              display:'flex', alignItems:'center', gap:5, justifyContent:'center',
              transition:'all 0.12s',
            }}>
              <span style={{
                fontSize:12, fontWeight: on ? 800 : 600,
                color: on ? c.color : C_MUTED, letterSpacing:'-0.01em',
                whiteSpace:'nowrap',
              }}>{c.name}</span>
              {selectedInCat > 0 && (
                <span style={{
                  display:'inline-flex', alignItems:'center', justifyContent:'center',
                  minWidth:16, height:16, padding:'0 5px', borderRadius:8,
                  background: on ? c.color : C_MUTED, color:'#fff',
                  fontSize:9.5, fontWeight:800, fontVariantNumeric:'tabular-nums',
                }}>{selectedInCat}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* 2차 세부 메뉴 - 균일 크기 그리드 */}
      <div style={{padding:'10px 0 0'}}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0, 1fr))', gap:5}}>
          {items.map(it => {
            const on = selectedServices.some(s => s.itemId === it.id);
            return (
              <button key={it.id} onClick={() => toggleService(it, category)} style={{
                padding:'8px 10px', textAlign:'left',
                border:`1.5px solid ${on ? C_BLUE : C_BORDER}`,
                background: on ? C_BLUE_SOFT : C_SURFACE,
                borderRadius:8, cursor:'pointer', fontFamily:'inherit',
                display:'flex', flexDirection:'column', gap:2,
                position:'relative', minWidth:0,
                transition:'all 0.1s',
              }}>
                {on && (
                  <div style={{
                    position:'absolute', top:5, right:5,
                    width:14, height:14, borderRadius:'50%',
                    background:C_BLUE, color:'#fff',
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    <IconCheck size={9}/>
                  </div>
                )}
                <span style={{
                  fontSize:11.5, fontWeight: on ? 800 : 600, color:C_INK,
                  letterSpacing:'-0.01em',
                  whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                  paddingRight: on ? 14 : 0,
                }}>{it.name}</span>
                <span style={{
                  fontSize:10.5, fontWeight:700,
                  color: on ? C_BLUE : C_MUTED,
                  fontVariantNumeric:'tabular-nums',
                }}>
                  {it.price === 0 ? '0원' : `${new Intl.NumberFormat('ko-KR').format(it.price)}원`}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── 라이브 미리보기 (우측) ───
function BK_LivePreview({ customer, date, time, dow, designerIds, services, totalMin, totalPrice, memo, setMemo, deposit, setDeposit }) {
  const designers = designerIds.map(id => DESIGNERS.find(d => d.id === id)).filter(Boolean);
  const mainDesigner = designers[0];
  const bgAccent = mainDesigner?.color || C_BLUE;

  return (
    <>
      {/* 대형 예약 카드 프리뷰 */}
      <div style={{
        background:C_SURFACE, borderRadius:14,
        boxShadow:'0 2px 6px rgba(11,20,37,0.06)',
        overflow:'hidden',
        border:`1px solid ${C_BORDER}`,
      }}>
        {/* 헤더 밴드 */}
        <div style={{
          padding:'14px 18px', background: C_BLUE,
          color:'#fff',
        }}>
          <div style={{fontSize:10.5, fontWeight:700, letterSpacing:'0.08em', opacity:0.9}}>예약 미리보기</div>
          <div style={{display:'flex', alignItems:'baseline', gap:8, marginTop:3}}>
            <span style={{fontSize:22, fontWeight:800, letterSpacing:'-0.02em', fontVariantNumeric:'tabular-nums'}}>
              {String(date.m).padStart(2,'0')}/{String(date.d).padStart(2,'0')}
            </span>
            <span style={{fontSize:13, opacity:0.9, fontWeight:600}}>({dow})</span>
            <span style={{fontSize:18, fontWeight:800, marginLeft:6, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em'}}>
              {(() => {
                const [h, m] = time.split(':').map(Number);
                const ampm = h < 12 ? '오전' : '오후';
                const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
                return `${ampm} ${h12}:${String(m).padStart(2,'0')}`;
              })()}
            </span>
          </div>
        </div>

        {/* 본문 */}
        <div style={{padding:'16px 18px', display:'flex', flexDirection:'column', gap:14}}>
          {/* 고객 */}
          <PVKV label="고객">
            <div style={{display:'flex', alignItems:'center', gap:6}}>
              <span style={{fontSize:14, fontWeight:800, color:C_INK, letterSpacing:'-0.01em'}}>
                {customer.guest && !customer.name ? '비회원' : customer.name}
              </span>
              {customer.phone && (
                <span style={{fontSize:11.5, color:C_MUTED, fontVariantNumeric:'tabular-nums'}}>· {customer.phone}</span>
              )}
              {customer.guest && (
                <span style={{fontSize:10, fontWeight:700, padding:'1px 7px', borderRadius:8, background:'#F1F5F9', color:C_MUTED}}>비회원</span>
              )}
            </div>
          </PVKV>

          {/* 담당 */}
          <PVKV label="담당자">
            {designers.length === 0 ? (
              <PVPlaceholder>담당자를 선택하세요</PVPlaceholder>
            ) : (
              <span style={{
                display:'inline-flex', alignItems:'center', gap:6,
                padding:'4px 12px 4px 8px',
                background: `${mainDesigner.color}18`, border:`1px solid ${mainDesigner.color}44`,
                borderRadius:14, fontSize:13, fontWeight:700, color:C_INK,
                letterSpacing:'-0.01em',
              }}>
                <span style={{width:8, height:8, borderRadius:'50%', background:mainDesigner.color}}/>
                {mainDesigner.name} <span style={{color:C_MUTED, fontWeight:500, fontSize:11}}>· {mainDesigner.role}</span>
              </span>
            )}
          </PVKV>

          {/* 시술 */}
          <PVKV label="시술">
            {services.length === 0 ? (
              <PVPlaceholder>시술을 선택하세요</PVPlaceholder>
            ) : (
              <div style={{display:'flex', flexWrap:'wrap', gap:4}}>
                {services.map(s => (
                  <span key={s.itemId} style={{
                    fontSize:11.5, fontWeight:700, color:C_BLUE,
                    background:C_BLUE_SOFT, padding:'3px 9px', borderRadius:12,
                  }}>{s.name}</span>
                ))}
              </div>
            )}
          </PVKV>

          {/* 금액 요약 */}
          <div style={{
            marginTop:2, padding:'12px 14px',
            background:'#FBFCFE', border:`1px solid ${C_BORDER}`, borderRadius:12,
            display:'flex', alignItems:'baseline', gap:8,
          }}>
            <span style={{fontSize:10.5, color:C_MUTED, fontWeight:700, letterSpacing:'0.06em'}}>총 금액</span>
            {totalMin > 0 && (
              <span style={{fontSize:11, color:C_MUTED, fontVariantNumeric:'tabular-nums'}}>· 약 {totalMin}분</span>
            )}
            <div style={{flex:1}}/>
            <span style={{fontSize:20, fontWeight:800, color:C_INK, letterSpacing:'-0.02em', fontVariantNumeric:'tabular-nums'}}>
              ₩ {new Intl.NumberFormat('ko-KR').format(totalPrice)}
            </span>
          </div>
          {deposit?.on && deposit.amount > 0 && (
            <div style={{display:'flex', justifyContent:'space-between', fontSize:12, padding:'0 4px', marginTop:-6}}>
              <span style={{color:'#03A94D', fontWeight:700}}>예약금 받음</span>
              <span style={{color:'#03A94D', fontWeight:800, fontVariantNumeric:'tabular-nums'}}>
                −{new Intl.NumberFormat('ko-KR').format(deposit.amount)}
                <span style={{color:C_MUTED, fontWeight:600, marginLeft:6}}>
                  현장 {new Intl.NumberFormat('ko-KR').format(Math.max(0, totalPrice - deposit.amount))}
                </span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 예약금 카드 */}
      {deposit && (
        <div style={{
          background:C_SURFACE, borderRadius:14,
          border:`1px solid ${deposit.on ? '#03A94D66' : C_BORDER}`, padding:'12px 16px',
        }}>
          <label style={{display:'flex', alignItems:'center', gap:8, cursor:'pointer'}}>
            <input type="checkbox" checked={deposit.on}
              onChange={e => setDeposit(d => ({ ...d, on: e.target.checked }))}
              style={{margin:0, accentColor:'#03A94D', width:15, height:15}}/>
            <span style={{fontSize:12, fontWeight:800, color:C_INK}}>예약금 받음</span>
            <span style={{fontSize:10.5, color:C_MUTED}}>매출 입력 시 자동 차감</span>
          </label>
          {deposit.on && (
            <div style={{marginTop:10, display:'flex', flexDirection:'column', gap:7}}>
              <div style={{display:'flex', gap:4}}>
                {[['naver','네이버'],['transfer','계좌이체'],['etc','기타']].map(([id, l]) => {
                  const on = deposit.channel === id;
                  return (
                    <button key={id} onClick={() => setDeposit(d => ({ ...d, channel:id }))} style={{
                      flex:1, padding:'6px 0', borderRadius:7, fontSize:11.5, fontWeight: on ? 800 : 600,
                      border:`1.5px solid ${on ? '#03A94D' : C_BORDER}`,
                      background: on ? '#03A94D' : C_SURFACE, color: on ? '#fff' : C_INK,
                      cursor:'pointer', fontFamily:'inherit',
                    }}>{l}</button>
                  );
                })}
              </div>
              <div style={{position:'relative'}}>
                <input value={deposit.amount ? new Intl.NumberFormat('ko-KR').format(deposit.amount) : ''}
                  placeholder="예약금 금액" autoFocus
                  onChange={e => setDeposit(d => ({ ...d, amount: parseInt(e.target.value.replace(/\D/g,'') || '0', 10) }))}
                  style={{
                    width:'100%', height:34, padding:'0 26px 0 10px', border:`1px solid ${C_BORDER}`, borderRadius:8,
                    fontSize:13, fontWeight:700, textAlign:'right', outline:'none', fontFamily:'inherit',
                    boxSizing:'border-box', fontVariantNumeric:'tabular-nums',
                  }}/>
                <span style={{position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', fontSize:11, color:C_MUTED}}>원</span>
              </div>
              <div style={{display:'flex', gap:4}}>
                {[10000, 20000, 30000, 50000].map(v => (
                  <button key={v} onClick={() => setDeposit(d => ({ ...d, amount:v }))} style={{
                    flex:1, padding:'4px 0', borderRadius:6, fontSize:10.5, fontWeight:700,
                    border:`1px solid ${C_BORDER}`, background: deposit.amount === v ? '#E8F8EF' : '#FBFCFE',
                    color: deposit.amount === v ? '#03A94D' : C_MUTED, cursor:'pointer', fontFamily:'inherit',
                  }}>{v / 10000}만</button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 메모 카드 */}
      <div style={{
        background:C_SURFACE, borderRadius:14,
        border:`1px solid ${C_BORDER}`, padding:'14px 18px',
      }}>
        <div style={{display:'flex', alignItems:'baseline', gap:6, marginBottom:8}}>
          <span style={{fontSize:12, fontWeight:800, color:C_INK, letterSpacing:'-0.01em'}}>메모</span>
          <span style={{fontSize:10.5, color:C_MUTED}}>선택</span>
          <div style={{flex:1}}/>
          <span style={{fontSize:10.5, color:C_MUTED, fontVariantNumeric:'tabular-nums'}}>{memo.length}/300</span>
        </div>
        <textarea value={memo} onChange={e => setMemo(e.target.value.slice(0,300))}
          placeholder="알러지, 요청사항 등"
          rows={3}
          style={{
            width:'100%', padding:'8px 10px',
            border:`1px solid ${C_BORDER}`, borderRadius:10,
            fontSize:12, background:'#FBFCFE', outline:'none',
            fontFamily:'inherit', resize:'none', boxSizing:'border-box',
            lineHeight:1.5,
          }}/>
      </div>

      {/* 최근 방문 이력 카드 (우측 남는 공간 활용) */}
      <div style={{
        background:C_SURFACE, borderRadius:14,
        border:`1px solid ${C_BORDER}`, padding:'14px 18px',
        flex:1, minHeight:0, display:'flex', flexDirection:'column',
      }}>
        <div style={{display:'flex', alignItems:'baseline', gap:6, marginBottom:10}}>
          <span style={{fontSize:12, fontWeight:800, color:C_INK, letterSpacing:'-0.01em'}}>최근 방문</span>
          <span style={{fontSize:10.5, color:C_MUTED}}>{(customer.guest && !customer.name ? '비회원' : customer.name)}님</span>
        </div>
        <div style={{flex:1, overflow:'auto', display:'flex', flexDirection:'column', gap:6}}>
          {customer.guest ? (
            <div style={{padding:'18px 8px', textAlign:'center', color:C_MUTED, fontSize:12, fontWeight:600}}>
              방문 이력이 없습니다
            </div>
          ) : [
            { date:'2026-09-11', menu:'루트터치업', designer:'문지윤', price:70000 },
            { date:'2026-08-22', menu:'헤어스파 + 뿌리염색', designer:'문지윤', price:130000 },
          ].map((h, i) => (
            <div key={i} style={{
              display:'grid', gridTemplateColumns:'70px 1fr auto', gap:8,
              padding:'7px 10px', background:'#FBFCFE', borderRadius:8,
              alignItems:'center',
              border:`1px solid ${C_BORDER}`,
            }}>
              <span style={{fontSize:10.5, color:C_MUTED, fontVariantNumeric:'tabular-nums'}}>{h.date.slice(5)}</span>
              <div style={{minWidth:0}}>
                <div style={{fontSize:11.5, fontWeight:700, color:C_INK, letterSpacing:'-0.01em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{h.menu}</div>
                <div style={{fontSize:10, color:C_MUTED, marginTop:1}}>{h.designer}</div>
              </div>
              <span style={{fontSize:11, color:C_INK, fontWeight:700, fontVariantNumeric:'tabular-nums'}}>
                {new Intl.NumberFormat('ko-KR').format(h.price)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function PVKV({ label, children }) {
  return (
    <div style={{display:'grid', gridTemplateColumns:'54px 1fr', gap:10, alignItems:'flex-start'}}>
      <span style={{fontSize:10.5, color:C_MUTED, fontWeight:700, letterSpacing:'0.02em', paddingTop:3}}>{label}</span>
      <div>{children}</div>
    </div>
  );
}
function PVPlaceholder({ children }) {
  return (
    <span style={{
      display:'inline-block', padding:'3px 10px', borderRadius:12,
      background:'#F1F5F9', color:'#94A3B8',
      fontSize:11.5, fontWeight:600,
    }}>{children}</span>
  );
}

// ─── 비회원 이름 입력 ───
function BK_GuestNameDialog({ name, setName, onApply, onClose }) {
  const trimmed = name.trim();
  return (
    <div onClick={(e) => { e.stopPropagation(); onClose(); }} style={{
      position:'fixed', inset:0, background:'rgba(11,20,37,0.5)',
      zIndex:240, display:'flex', alignItems:'center', justifyContent:'center', padding:20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width:420, background:C_SURFACE, borderRadius:16,
        boxShadow:'0 24px 64px rgba(11,20,37,0.28)',
        padding:'18px 22px 20px',
      }}>
        <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
          <div style={{fontSize:16, fontWeight:800, color:C_INK, letterSpacing:'-0.02em', flex:1}}>비회원 예약</div>
          <button onClick={onClose} style={{
            width:28, height:28, borderRadius:8, border:'none',
            background:C_BG, color:C_INK, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}><IconX size={15}/></button>
        </div>
        <div style={{fontSize:12.5, color:C_MUTED, lineHeight:1.5, marginBottom:14}}>
          이름을 알고 있으면 입력하세요. 없으면 이름 없이 진행할 수 있습니다.
        </div>
        <input value={name} onChange={e => setName(e.target.value)}
          placeholder="이름"
          autoFocus
          onKeyDown={e => { if (e.key === 'Enter' && trimmed) onApply(trimmed); }}
          style={{
            width:'100%', height:42, padding:'0 14px',
            border:`1.5px solid ${C_BORDER}`, borderRadius:12,
            fontSize:14, fontWeight:700, background:C_BG, outline:'none',
            fontFamily:'inherit', boxSizing:'border-box', color:C_INK,
          }}
          onFocus={e => e.target.style.borderColor = C_BLUE}
          onBlur={e => e.target.style.borderColor = C_BORDER}
        />
        <button onClick={() => trimmed && onApply(trimmed)} disabled={!trimmed} style={{
          width:'100%', marginTop:10, height:42,
          border:'none', borderRadius:12,
          background: trimmed ? C_BLUE : '#E5EAF2',
          color: trimmed ? '#fff' : '#94A3B8',
          fontSize:13.5, fontWeight:800, cursor: trimmed ? 'pointer' : 'default',
          fontFamily:'inherit',
        }}>이 이름으로 진행</button>
        <button onClick={() => onApply('')} style={{
          width:'100%', marginTop:8, height:42,
          background:C_SURFACE, color:C_INK,
          border:`1.5px solid ${C_BORDER}`, borderRadius:12,
          fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'inherit',
        }}>이름 없이 비회원으로 진행</button>
      </div>
    </div>
  );
}

// ─── 고객 선택 팝오버 (검색 전 리스트 숨김) ───
function C_CustomerPickerPopover({ current, onSelect, onClose }) {
  const [search, setSearch] = React.useState('');
  const showList = search.trim().length > 0;
  const filtered = showList ? CUSTOMERS.filter(c =>
    c.name.includes(search) || c.phone.replace(/-/g,'').includes(search.replace(/-/g,''))
  ) : [];

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(11,20,37,0.5)',
      zIndex:220, display:'flex', alignItems:'center', justifyContent:'center', padding:20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width:500, maxHeight:'80vh', background:C_SURFACE, borderRadius:16,
        boxShadow:'0 24px 64px rgba(11,20,37,0.28)',
        display:'flex', flexDirection:'column', overflow:'hidden',
      }}>
        <div style={{padding:'18px 22px 14px', borderBottom:`1px solid ${C_BORDER}`, display:'flex', alignItems:'center', gap:8}}>
          <div style={{fontSize:15, fontWeight:800, color:C_INK, flex:1, letterSpacing:'-0.01em'}}>고객 선택</div>
          <button onClick={onClose} style={{
            width:28, height:28, borderRadius:8, border:'none',
            background:C_BG, color:C_INK, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}><IconX size={15}/></button>
        </div>
        <div style={{padding:'14px 22px 10px'}}>
          <div style={{position:'relative'}}>
            <IconSearch size={14} style={{position:'absolute', left:14, top:12, color:C_MUTED}}/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="이름 또는 전화번호를 입력해주세요"
              autoFocus
              style={{
                width:'100%', height:40, padding:'0 14px 0 38px',
                border:`1.5px solid ${C_BORDER}`, borderRadius:12,
                fontSize:13, background:C_BG, outline:'none',
                fontFamily:'inherit', boxSizing:'border-box',
              }}
              onFocus={e => e.target.style.borderColor = C_BLUE}
              onBlur={e => e.target.style.borderColor = C_BORDER}
            />
          </div>
        </div>

        <div style={{flex:1, overflow:'auto', padding:'0 14px 14px'}}>
          {!showList ? (
            <div style={{
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              padding:'40px 20px', gap:14,
            }}>
              <div style={{
                width:56, height:56, borderRadius:16, background:C_BG,
                display:'flex', alignItems:'center', justifyContent:'center',
                color:C_MUTED,
              }}>
                <IconSearch size={26}/>
              </div>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:14, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>고객을 검색해주세요</div>
                <div style={{fontSize:12, color:C_MUTED, marginTop:4}}>이름 일부 또는 전화번호 뒷자리를 입력하세요</div>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              padding:'40px 20px', textAlign:'center', color:C_MUTED, fontSize:13,
            }}>
              '<strong style={{color:C_INK}}>{search}</strong>' 와 일치하는 고객이 없어요.
            </div>
          ) : (
            filtered.map(c => {
              const on = current?.id === c.id;
              const designer = DESIGNERS.find(d => d.id === c.mainDesigner);
              return (
                <button key={c.id} onClick={() => onSelect(c)} style={{
                  width:'100%', padding:'10px 12px', textAlign:'left',
                  background: on ? C_BLUE_SOFT : 'transparent',
                  border:'none', borderRadius:10, cursor:'pointer', fontFamily:'inherit',
                  display:'flex', alignItems:'center', gap:10, marginBottom:2,
                }}
                onMouseEnter={e => { if (!on) e.currentTarget.style.background = '#F8FAFC'; }}
                onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{
                    width:32, height:32, borderRadius:'50%',
                    background: designer?.color || '#94A3B8',
                    color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:13, fontWeight:800, flexShrink:0,
                  }}>{c.name.charAt(0)}</div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{display:'flex', alignItems:'center', gap:5}}>
                      <span style={{fontSize:13.5, fontWeight:800, color:C_INK, letterSpacing:'-0.01em'}}>{c.name}</span>
                      {c.tags[0] && (
                        <span style={{
                          fontSize:10, fontWeight:700, padding:'1px 7px', borderRadius:8,
                          background: c.tags[0]==='VIP' ? '#FEF3C7' : c.tags[0]==='단골' ? '#DBEAFE' : '#F1F5F9',
                          color: c.tags[0]==='VIP' ? '#B45309' : c.tags[0]==='단골' ? C_BLUE : C_MUTED,
                        }}>{c.tags[0]}</span>
                      )}
                    </div>
                    <div style={{fontSize:11, color:C_MUTED, fontVariantNumeric:'tabular-nums', marginTop:2}}>
                      {c.phone} · 방문 {c.totalVisits}회
                    </div>
                  </div>
                  {on && <IconCheck size={16} style={{color:C_BLUE}}/>}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

const c_bkNav = {
  width:26, height:26, borderRadius:8,
  border:`1px solid ${C_BORDER}`, background:C_SURFACE,
  color:C_INK, cursor:'pointer',
  display:'inline-flex', alignItems:'center', justifyContent:'center',
};

window.C_BookingAddModal = C_BookingAddModal;
