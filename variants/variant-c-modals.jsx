// 신규 고객 등록 모달 + 비회원 매출 입력 모달

const {
  C_BLUE, C_BLUE_SOFT, C_CORAL, C_INK, C_MUTED, C_BORDER, C_BG, C_SURFACE,
  c_ghostBtn, c_ghostBtnSm, c_iconBtnSm,
} = window;

// ===== 기본 태그 프리셋 =====
const DEFAULT_TAGS = [
  { label:'VIP',      color:'#F59E0B' },
  { label:'신규',      color:'#3B82F6' },
  { label:'단골',      color:'#059669' },
  { label:'알러지',    color:'#EF4444' },
  { label:'몰컷',      color:'#8B5CF6' },
  { label:'은곰',      color:'#64748B' },
  { label:'긴머리',    color:'#EC4899' },
  { label:'남성',      color:'#06B6D4' },
  { label:'상담필요',  color:'#D97706' },
];

const MBTI_LIST = [
  'INTJ','INTP','ENTJ','ENTP',
  'INFJ','INFP','ENFJ','ENFP',
  'ISTJ','ISFJ','ESTJ','ESFJ',
  'ISTP','ISFP','ESTP','ESFP',
  '선택안함',
];

// =============================================================
// 1) 신규 고객 등록 모달 (작은 모달)
// =============================================================
function C_CustomerRegisterModal({ onClose }) {
  const [name, setName] = React.useState('');
  const [gender, setGender] = React.useState('none');
  const [phone, setPhone] = React.useState('');
  const [birth, setBirth] = React.useState('');
  const [mbti, setMbti] = React.useState('선택안함');
  const [designer, setDesigner] = React.useState('');
  const [channel, setChannel] = React.useState('');
  const [tags, setTags] = React.useState([]);
  const [tagInput, setTagInput] = React.useState('');
  const [memo, setMemo] = React.useState('');
  const [notifyMkt, setNotifyMkt] = React.useState(false);
  const [notifySurvey, setNotifySurvey] = React.useState(false);

  const toggleTag = (label) => {
    setTags(prev => prev.includes(label) ? prev.filter(x => x !== label) : [...prev, label]);
  };
  const addTagFromInput = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
  };
  const canSave = name.trim() && phone.trim();

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(11,20,37,0.5)',
      zIndex:200, display:'flex', alignItems:'center', justifyContent:'center',
      padding:20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width:520, maxHeight:'90vh',
        background:C_SURFACE, borderRadius:14,
        boxShadow:'0 24px 64px rgba(11,20,37,0.28)',
        display:'flex', flexDirection:'column', overflow:'hidden',
      }}>
        {/* 헤더 */}
        <div style={{padding:'18px 22px 14px', borderBottom:`1px solid ${C_BORDER}`, display:'flex', alignItems:'center', gap:10}}>
          <div style={{
            width:32, height:32, borderRadius:'50%',
            background: C_BLUE_SOFT, color:C_BLUE,
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
          }}>
            <IconUser size={16}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:15, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>고객 신규 등록</div>
            <div style={{fontSize:11.5, color:C_MUTED, marginTop:2}}>고객 정보를 입력하면 예약과 매출에서 바로 사용됩니다</div>
          </div>
          <button onClick={onClose} style={c_closeBtn}><IconX size={16}/></button>
        </div>

        {/* 본문 */}
        <div style={{flex:1, overflow:'auto', padding:'18px 22px', display:'flex', flexDirection:'column', gap:16}}>
          {/* 고객명 + 성별 */}
          <div style={{display:'grid', gridTemplateColumns:'1fr 200px', gap:12}}>
            <C_Field label="고객명" required>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="이름을 입력해주세요" style={c_input}/>
            </C_Field>
            <C_Field label="성별">
              <div style={{display:'flex', background:C_BG, borderRadius:7, padding:2, border:`1px solid ${C_BORDER}`}}>
                {[
                  { id:'male',   label:'남성' },
                  { id:'female', label:'여성' },
                  { id:'none',   label:'선택안함' },
                ].map(g => (
                  <button key={g.id} onClick={() => setGender(g.id)} style={{
                    flex:1, padding:'6px 4px', fontSize:11.5, fontWeight:600,
                    border:'none', borderRadius:5, cursor:'pointer',
                    background: gender===g.id ? C_SURFACE : 'transparent',
                    color: gender===g.id ? C_INK : C_MUTED,
                    boxShadow: gender===g.id ? '0 1px 2px rgba(11,20,37,0.06)' : 'none',
                    fontFamily:'inherit',
                  }}>{g.label}</button>
                ))}
              </div>
            </C_Field>
          </div>

          {/* 전화번호 + 생년월일 */}
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
            <C_Field label="전화번호" required>
              <input value={phone} onChange={e => setPhone(formatPhone(e.target.value))}
                placeholder="010-0000-0000" style={c_input}/>
            </C_Field>
            <C_Field label="생년월일">
              <input value={birth} onChange={e => setBirth(e.target.value)}
                placeholder="YYYY-MM-DD" style={c_input}/>
            </C_Field>
          </div>

          {/* MBTI + 담당자 */}
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
            <C_Field label="MBTI">
              <select value={mbti} onChange={e => setMbti(e.target.value)} style={c_select}>
                {MBTI_LIST.map(m => <option key={m}>{m}</option>)}
              </select>
            </C_Field>
            <C_Field label="담당자">
              <select value={designer} onChange={e => setDesigner(e.target.value)} style={c_select}>
                <option value="">디자이너 선택</option>
                {DESIGNERS.filter(d => d.id !== 'unassigned').map(d => (
                  <option key={d.id} value={d.id}>{d.name} · {d.role}</option>
                ))}
              </select>
            </C_Field>
          </div>

          {/* 마케팅 유입 경로 */}
          <C_Field label="마케팅 유입 경로">
            <div style={{display:'flex', gap:5, flexWrap:'wrap'}}>
              {STATS_CHANNELS.map(c => (
                <button key={c.id} onClick={() => setChannel(c.id)} style={{
                  padding:'6px 12px', fontSize:12, fontWeight:600,
                  border:`1px solid ${channel===c.id ? c.color : C_BORDER}`,
                  background: channel===c.id ? `${c.color}18` : C_SURFACE,
                  color: channel===c.id ? C_INK : C_MUTED,
                  borderRadius:14, cursor:'pointer',
                  display:'inline-flex', alignItems:'center', gap:5,
                  fontFamily:'inherit',
                }}>
                  <span style={{width:6, height:6, borderRadius:'50%', background:c.color}}/>
                  {c.label}
                </button>
              ))}
            </div>
          </C_Field>

          {/* 태그 */}
          <C_Field label="태그" hint={`최대 6개 · 현재 ${tags.length}/6`}>
            <div style={{
              padding:8, border:`1px solid ${C_BORDER}`, borderRadius:7,
              background:C_BG, minHeight:38,
              display:'flex', flexWrap:'wrap', gap:5, alignItems:'center',
            }}>
              {tags.map(t => {
                const preset = DEFAULT_TAGS.find(p => p.label === t);
                const color = preset?.color || C_MUTED;
                return (
                  <span key={t} style={{
                    display:'inline-flex', alignItems:'center', gap:4,
                    padding:'3px 4px 3px 9px', fontSize:11.5, fontWeight:600,
                    background: `${color}22`, color: C_INK,
                    borderRadius:12, border:`1px solid ${color}55`,
                  }}>
                    <span style={{width:5, height:5, borderRadius:'50%', background:color}}/>
                    {t}
                    <button onClick={() => setTags(tags.filter(x => x !== t))} style={{
                      width:16, height:16, marginLeft:2, borderRadius:'50%',
                      border:'none', background:'transparent', color:C_MUTED, cursor:'pointer',
                      display:'inline-flex', alignItems:'center', justifyContent:'center',
                    }}>
                      <IconX size={10}/>
                    </button>
                  </span>
                );
              })}
              <input value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTagFromInput(); } }}
                placeholder={tags.length === 0 ? '태그 입력 후 Enter (또는 아래 프리셋 클릭)' : ''}
                style={{
                  flex:1, minWidth:120, border:'none', outline:'none',
                  fontSize:12, background:'transparent', fontFamily:'inherit',
                  padding:'4px 6px',
                }}/>
            </div>
            {/* 프리셋 */}
            <div style={{marginTop:8, display:'flex', flexWrap:'wrap', gap:4}}>
              {DEFAULT_TAGS.map(t => {
                const on = tags.includes(t.label);
                return (
                  <button key={t.label} onClick={() => toggleTag(t.label)}
                    disabled={!on && tags.length >= 6}
                    style={{
                    padding:'3px 9px', fontSize:11, fontWeight:600,
                    border:`1px dashed ${on ? t.color : C_BORDER}`,
                    background: on ? `${t.color}18` : C_SURFACE,
                    color: on ? C_INK : C_MUTED,
                    borderRadius:12, cursor: (!on && tags.length >= 6) ? 'not-allowed' : 'pointer',
                    opacity: (!on && tags.length >= 6) ? 0.4 : 1,
                    display:'inline-flex', alignItems:'center', gap:4,
                    fontFamily:'inherit',
                  }}>
                    <span style={{width:5, height:5, borderRadius:'50%', background:t.color}}/>
                    {t.label}
                  </button>
                );
              })}
            </div>
          </C_Field>

          {/* 메모 */}
          <C_Field label="메모">
            <textarea value={memo} onChange={e => setMemo(e.target.value)}
              placeholder="특이사항, 알러지, 헤어 이력 등 (선택)"
              rows={2}
              style={{
                padding:'8px 12px',
                border:`1px solid ${C_BORDER}`, borderRadius:7,
                fontSize:12.5, background:C_SURFACE, fontFamily:'inherit', outline:'none',
                resize:'vertical', width:'100%', boxSizing:'border-box',
              }}/>
          </C_Field>

          {/* 알림 수신 동의 */}
          <C_Field label="알림 수신 동의">
            <div style={{display:'flex', gap:14}}>
              <label style={c_check}>
                <input type="checkbox" checked={notifyMkt} onChange={e => setNotifyMkt(e.target.checked)}/>
                <span>마케팅 알림 (예약 리마인더, 프로모션 SMS)</span>
              </label>
              <label style={c_check}>
                <input type="checkbox" checked={notifySurvey} onChange={e => setNotifySurvey(e.target.checked)}/>
                <span>만족도 설문</span>
              </label>
            </div>
          </C_Field>
        </div>

        {/* 푸터 */}
        <div style={{
          padding:'12px 22px', borderTop:`1px solid ${C_BORDER}`, background:'#FBFCFE',
          display:'flex', gap:8, justifyContent:'flex-end',
        }}>
          <button onClick={onClose} style={{...c_ghostBtn, padding:'9px 16px'}}>취소</button>
          <button onClick={onClose} disabled={!canSave} style={{
            padding:'9px 20px', background: canSave ? C_BLUE : '#E5EAF2',
            color: canSave ? '#fff' : '#94A3B8',
            border:'none', borderRadius:7, fontSize:13, fontWeight:600,
            cursor: canSave ? 'pointer' : 'not-allowed',
            boxShadow: canSave ? '0 1px 2px rgba(30,64,175,0.2)' : 'none',
          }}>저장</button>
        </div>
      </div>
    </div>
  );
}

function formatPhone(v) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0,3)}-${d.slice(3)}`;
  return `${d.slice(0,3)}-${d.slice(3,7)}-${d.slice(7)}`;
}

// =============================================================
// 2) 비회원 매출 입력 모달 (큰 오버레이)
// =============================================================
function C_GuestSalesModal({ onClose }) {
  const [tab, setTab] = React.useState('sales'); // sales | booking | detail
  const [guestName, setGuestName] = React.useState('');
  const [guestPhone, setGuestPhone] = React.useState('');
  const [lines, setLines] = React.useState([
    // 예시 라인 하나
    { id:1, kind:'service', category:'cut', menuId:1, designer:'moon', channel:'road', price:8000, discount:0 },
  ]);
  const [payDate, setPayDate] = React.useState('2026-09-11 15:55');
  const [payments, setPayments] = React.useState({
    card:0, transfer:0, naver:0, etc:0, cash:0, extraDiscount:0,
  });
  const [showMenuPicker, setShowMenuPicker] = React.useState(null); // { lineId, kind }
  const [smartMode, setSmartMode] = React.useState(false);

  const addLine = (kind) => {
    const nextId = Math.max(0, ...lines.map(l => l.id)) + 1;
    setLines(prev => [...prev, { id:nextId, kind, category:null, menuId:null, designer:'', channel:'road', price:0, discount:0 }]);
    setShowMenuPicker({ lineId: nextId, kind });
  };
  const removeLine = (id) => setLines(prev => prev.filter(l => l.id !== id));
  const updateLine = (id, patch) => setLines(prev => prev.map(l => l.id === id ? {...l, ...patch} : l));

  const subtotal = lines.reduce((a, l) => a + (l.price - l.discount), 0);
  const paymentSum = payments.card + payments.transfer + payments.naver + payments.etc + payments.cash;
  const totalDiscount = lines.reduce((a, l) => a + l.discount, 0) + payments.extraDiscount;
  const finalTotal = subtotal - payments.extraDiscount;
  const balance = finalTotal - paymentSum;

  const applySmartFill = () => {
    // 스마트: 카드에 전부 할당
    setPayments(p => ({ ...p, card: finalTotal, transfer:0, naver:0, etc:0, cash:0 }));
  };

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(11,20,37,0.5)',
      zIndex:200, display:'flex', alignItems:'center', justifyContent:'center',
      padding:20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 900, maxWidth:'96vw', maxHeight:'92vh',
        background:C_SURFACE, borderRadius:14,
        boxShadow:'0 24px 64px rgba(11,20,37,0.28)',
        display:'flex', flexDirection:'column', overflow:'hidden',
      }}>
        {/* 헤더 */}
        <div style={{
          padding:'14px 20px', borderBottom:`1px solid ${C_BORDER}`,
          display:'flex', alignItems:'center', gap:12, background:'#FBFCFE',
        }}>
          <button onClick={onClose} style={{
            width:32, height:32, border:`1px solid ${C_BORDER}`, borderRadius:7,
            background:C_SURFACE, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', color:C_MUTED,
          }}>
            <IconChevronL size={14}/>
          </button>
          <div style={{flex:1}}>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <span style={{
                display:'inline-flex', alignItems:'center', gap:5,
                fontSize:12, fontWeight:700, color:'#7C3AED',
                background:'#F5F3FF', border:'1px solid #DDD6FE',
                padding:'4px 10px', borderRadius:12,
                whiteSpace:'nowrap', flexShrink:0,
              }}>
                <IconUser size={12}/> 비회원
              </span>
              <input value={guestName} onChange={e => setGuestName(e.target.value)}
                placeholder="이름 (선택)" style={{
                  height:30, padding:'0 12px', width:130,
                  border:`1px solid ${C_BORDER}`, borderRadius:6,
                  fontSize:12.5, background:C_SURFACE, outline:'none', fontFamily:'inherit',
                }}/>
              <input value={guestPhone} onChange={e => setGuestPhone(formatPhone(e.target.value))}
                placeholder="전화번호 (선택)" style={{
                  height:30, padding:'0 12px', width:150,
                  border:`1px solid ${C_BORDER}`, borderRadius:6,
                  fontSize:12.5, background:C_SURFACE, outline:'none', fontFamily:'inherit',
                }}/>
            </div>
          </div>

          {/* 대기/시술 CTA */}
          <button style={c_neutralBtn}>
            <IconClock size={12}/> 대기 시작
          </button>
          <button style={c_neutralBtn}>
            <IconCheck size={12}/> 시술 시작
          </button>

          {/* 탭 */}
          <div style={{display:'flex', background:C_BG, borderRadius:20, padding:3, border:`1px solid ${C_BORDER}`, flexShrink:0, marginLeft:8}}>
            {[
              { id:'sales', label:'매출 입력' },
              { id:'booking', label:'예약 등록' },
              { id:'detail', label:'상세 내역' },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding:'4px 12px', fontSize:12, fontWeight:600,
                border:'none', borderRadius:16, cursor:'pointer',
                background: tab===t.id ? C_BLUE : 'transparent',
                color: tab===t.id ? '#fff' : C_MUTED,
                boxShadow: tab===t.id ? '0 1px 2px rgba(30,64,175,0.25)' : 'none',
                fontFamily:'inherit',
              }}>{t.label}</button>
            ))}
          </div>

          <button onClick={onClose} style={c_closeBtn}><IconX size={16}/></button>
        </div>

        {/* 본문 */}
        <div style={{flex:1, overflow:'auto', display:'flex', flexDirection:'column', background:C_BG}}>
          {tab === 'sales' && (
            <>
              {/* 시술/제품 라인 테이블 */}
              <div style={{padding:'16px 20px 12px'}}>
                <C_LinesTable
                  lines={lines}
                  onAddService={() => addLine('service')}
                  onAddProduct={() => addLine('product')}
                  onRemove={removeLine}
                  onUpdate={updateLine}
                  onOpenPicker={(lineId, kind) => setShowMenuPicker({ lineId, kind })}
                />
              </div>

              {/* 결제 패널 */}
              <div style={{padding:'0 20px 16px'}}>
                <C_PaymentPanel
                  payments={payments} setPayments={setPayments}
                  payDate={payDate} setPayDate={setPayDate}
                  smartMode={smartMode} setSmartMode={setSmartMode}
                  onSmartFill={applySmartFill}
                  subtotal={subtotal} totalDiscount={totalDiscount}
                  finalTotal={finalTotal} balance={balance} paymentSum={paymentSum}
                />
              </div>
            </>
          )}
          {tab === 'booking' && (
            <div style={{padding:'40px 20px', textAlign:'center', color:C_MUTED, fontSize:13}}>
              예약 등록 탭 — 기본 폼 준비 중
            </div>
          )}
          {tab === 'detail' && (
            <div style={{padding:'40px 20px', textAlign:'center', color:C_MUTED, fontSize:13}}>
              상세 내역 탭 — 준비 중
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div style={{
          padding:'12px 20px', borderTop:`1px solid ${C_BORDER}`, background:C_SURFACE,
          display:'flex', gap:8, justifyContent:'space-between', alignItems:'center',
        }}>
          <div style={{fontSize:12, color:C_MUTED}}>
            <span>소계 </span>
            <strong style={{color:C_INK, fontVariantNumeric:'tabular-nums'}}>₩ {new Intl.NumberFormat('ko-KR').format(subtotal)}</strong>
            <span style={{margin:'0 8px', color:C_BORDER}}>·</span>
            <span>할인 </span>
            <strong style={{color:'#EF4444', fontVariantNumeric:'tabular-nums'}}>-₩ {new Intl.NumberFormat('ko-KR').format(totalDiscount)}</strong>
            <span style={{margin:'0 8px', color:C_BORDER}}>·</span>
            <span>최종 </span>
            <strong style={{color:C_BLUE, fontVariantNumeric:'tabular-nums', fontSize:14}}>₩ {new Intl.NumberFormat('ko-KR').format(finalTotal)}</strong>
          </div>
          <div style={{display:'flex', gap:8}}>
            <button onClick={onClose} style={{...c_ghostBtn, padding:'9px 16px'}}>취소</button>
            <button style={{...c_neutralBtn, padding:'9px 16px', fontSize:12.5}}>단말기 결제 입력</button>
            <button onClick={onClose} style={{
              padding:'9px 22px', background: balance === 0 && finalTotal > 0 ? '#059669' : C_BLUE,
              color:'#fff', border:'none', borderRadius:7, fontSize:13, fontWeight:700,
              cursor:'pointer', letterSpacing:'-0.01em',
              boxShadow:'0 1px 3px rgba(11,20,37,0.15)',
              display:'flex', alignItems:'center', gap:6,
            }}>
              <IconCheck size={13}/> 거래 완료
            </button>
          </div>
        </div>
      </div>

      {showMenuPicker && (() => {
        const line = lines.find(l => l.id === showMenuPicker.lineId);
        return (
          <C_MenuPickerPopover
            {...showMenuPicker}
            initialDesigner={line?.designer || ''}
            initialCategory={line?.category || MENU_CATEGORIES[0].id}
            onSelect={(item) => {
              updateLine(showMenuPicker.lineId, {
                category: item.category, menuId: item.id,
                price: item.price, name: item.name,
                designer: item.designerId,
              });
              setShowMenuPicker(null);
            }}
            onClose={() => setShowMenuPicker(null)}
          />
        );
      })()}
    </div>
  );
}

// ─ 시술/제품 라인 테이블 ─
function C_LinesTable({ lines, onAddService, onAddProduct, onRemove, onUpdate, onOpenPicker }) {
  return (
    <div style={{background:C_SURFACE, borderRadius:10, border:`1px solid ${C_BORDER}`, overflow:'hidden'}}>
      {/* 테이블 헤더 */}
      <div style={{
        display:'grid', gridTemplateColumns:'80px 130px 1fr 100px 110px 90px 110px 40px',
        padding:'10px 14px', background:'#FBFCFE',
        borderBottom:`1px solid ${C_BORDER}`,
        fontSize:11, fontWeight:600, color:C_MUTED, letterSpacing:'0.02em',
      }}>
        <div>분류</div>
        <div>담당자</div>
        <div>메뉴</div>
        <div>방문 구분</div>
        <div style={{textAlign:'right'}}>판매금액</div>
        <div style={{textAlign:'right'}}>할인</div>
        <div style={{textAlign:'right'}}>결제금액</div>
        <div style={{textAlign:'center'}}></div>
      </div>
      {/* 행들 */}
      {lines.length === 0 ? (
        <div style={{padding:'40px 20px', textAlign:'center', color:C_MUTED, fontSize:13}}>
          아래 버튼으로 시술 또는 제품을 추가해주세요
        </div>
      ) : (
        lines.map((l, i) => <C_LineRow key={l.id} line={l} index={i} onRemove={onRemove} onUpdate={onUpdate} onOpenPicker={onOpenPicker}/>)
      )}
      {/* 추가 버튼 행 */}
      <div style={{
        padding:'10px 14px', borderTop:`1px solid ${C_BORDER}`, background:'#FBFCFE',
        display:'flex', gap:8, justifyContent:'center',
      }}>
        <button onClick={onAddService} style={c_addBtn}>
          <IconPlus size={12}/> 시술
        </button>
        <button onClick={onAddProduct} style={c_addBtn}>
          <IconPlus size={12}/> 제품 판매
        </button>
      </div>
    </div>
  );
}

function C_LineRow({ line, index, onRemove, onUpdate, onOpenPicker }) {
  const menuName = React.useMemo(() => {
    if (!line.category || !line.menuId) return null;
    const item = (MENU_ITEMS[line.category] || []).find(m => m.id === line.menuId);
    return item?.name;
  }, [line.category, line.menuId]);

  const netAmount = line.price - line.discount;
  const designer = DESIGNERS.find(d => d.id === line.designer);

  return (
    <div style={{
      display:'grid', gridTemplateColumns:'80px 130px 1fr 100px 110px 90px 110px 40px',
      padding:'10px 14px', alignItems:'center',
      borderTop: index > 0 ? `1px solid ${C_BORDER}` : 'none',
      fontSize:12.5,
    }}>
      <div>
        <span style={{
          display:'inline-flex', alignItems:'center', gap:4,
          fontSize:11, fontWeight:600, color: line.kind === 'service' ? C_BLUE : '#059669',
          padding:'3px 8px', borderRadius:10,
          background: line.kind === 'service' ? C_BLUE_SOFT : '#D1FAE5',
        }}>
          {line.kind === 'service' ? '시술' : '제품'}
        </span>
      </div>
      {/* 담당자 - 카드 형태 (클릭 시 팝오버) */}
      <div>
        {designer ? (
          <button onClick={() => onOpenPicker(line.id, line.kind)} style={{
            width:'100%', display:'flex', alignItems:'center', gap:6,
            padding:'5px 8px 5px 6px', border:`1px solid ${C_BORDER}`, borderRadius:14,
            background:C_SURFACE, cursor:'pointer', fontFamily:'inherit',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = designer.color; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C_BORDER; }}
          >
            <span style={{
              width:20, height:20, borderRadius:'50%',
              background:designer.color, color:'#fff',
              display:'inline-flex', alignItems:'center', justifyContent:'center',
              fontSize:10, fontWeight:700, flexShrink:0,
            }}>{designer.name.charAt(0)}</span>
            <span style={{fontSize:11.5, color:C_INK, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', flex:1, textAlign:'left'}}>{designer.name}</span>
          </button>
        ) : (
          <button onClick={() => onOpenPicker(line.id, line.kind)} style={{
            width:'100%', padding:'6px 8px', border:`1px dashed ${C_BLUE}`, borderRadius:14,
            cursor:'pointer', fontSize:11, background: C_BLUE_SOFT, color:C_BLUE, fontWeight:600,
            display:'flex', alignItems:'center', justifyContent:'center', gap:4,
            fontFamily:'inherit',
          }}>
            <IconPlus size={10}/> 담당 선택
          </button>
        )}
      </div>
      {/* 메뉴 - 카드 형태 (클릭 시 팝오버) */}
      <div>
        {menuName ? (
          <button onClick={() => onOpenPicker(line.id, line.kind)} style={{
            width:'100%', padding:'6px 10px', border:`1px solid ${C_BORDER}`, borderRadius:6,
            cursor:'pointer', fontSize:12.5, background:C_SURFACE,
            color:C_INK, fontWeight:600, letterSpacing:'-0.01em',
            display:'flex', alignItems:'center', justifyContent:'space-between',
            fontFamily:'inherit',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C_BLUE; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C_BORDER; }}
          >
            <span style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{menuName}</span>
            <IconNote size={11} style={{color:C_MUTED, flexShrink:0}}/>
          </button>
        ) : (
          <button onClick={() => onOpenPicker(line.id, line.kind)} style={{
            width:'100%', padding:'6px 10px', border:`1px dashed ${C_BLUE}`, borderRadius:6,
            cursor:'pointer', fontSize:12, background: C_BLUE_SOFT, color:C_BLUE, fontWeight:600,
            display:'flex', alignItems:'center', justifyContent:'center', gap:4,
            fontFamily:'inherit',
          }}>
            <IconPlus size={10}/> 메뉴 선택
          </button>
        )}
      </div>
      <div>
        <select value={line.channel} onChange={e => onUpdate(line.id, {channel: e.target.value})} style={c_rowSelect}>
          {STATS_CHANNELS.map(c => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>
      <div style={{textAlign:'right'}}>
        <C_MoneyInput value={line.price} onChange={v => onUpdate(line.id, {price: v})}/>
      </div>
      <div style={{textAlign:'right'}}>
        <C_MoneyInput value={line.discount} onChange={v => onUpdate(line.id, {discount: v})} small/>
      </div>
      <div style={{textAlign:'right', fontWeight:700, color:C_INK, fontVariantNumeric:'tabular-nums'}}>
        ₩ {new Intl.NumberFormat('ko-KR').format(netAmount)}
      </div>
      <div style={{textAlign:'center'}}>
        <button onClick={() => onRemove(line.id)} style={{
          width:24, height:24, borderRadius:5, border:`1px solid ${C_BORDER}`,
          background:C_SURFACE, color:'#EF4444', cursor:'pointer',
          display:'inline-flex', alignItems:'center', justifyContent:'center',
        }}>
          <IconX size={11}/>
        </button>
      </div>
    </div>
  );
}

function C_MoneyInput({ value, onChange, small }) {
  return (
    <div style={{position:'relative'}}>
      <input
        type="number" value={value === 0 ? '' : value}
        onChange={e => onChange(Number(e.target.value) || 0)}
        placeholder="0"
        style={{
          width:'100%', height:30, padding:'0 24px 0 8px',
          border:`1px solid ${C_BORDER}`, borderRadius:6,
          fontSize: small ? 11.5 : 12.5, background:C_SURFACE, textAlign:'right',
          outline:'none', fontFamily:'inherit', fontVariantNumeric:'tabular-nums',
          color: value > 0 ? C_INK : '#94A3B8',
        }}/>
      <span style={{position:'absolute', right:8, top:8, fontSize:11, color:C_MUTED, pointerEvents:'none'}}>원</span>
    </div>
  );
}

// ─ 결제 패널 ─
function C_PaymentPanel({ payments, setPayments, payDate, setPayDate, smartMode, setSmartMode, onSmartFill, subtotal, totalDiscount, finalTotal, balance, paymentSum }) {
  const set = (key, val) => setPayments(p => ({...p, [key]: Number(val) || 0}));

  return (
    <div style={{
      background:C_SURFACE, borderRadius:10, border:`1px solid ${C_BORDER}`,
      overflow:'hidden',
    }}>
      {/* 헤더 */}
      <div style={{
        padding:'10px 14px', background:'#FBFCFE', borderBottom:`1px solid ${C_BORDER}`,
        display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        <div style={{fontSize:12.5, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>결제 정보</div>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <label style={{display:'flex', alignItems:'center', gap:6, fontSize:11.5, color:C_MUTED, fontWeight:500, cursor:'pointer'}}>
            <input type="checkbox" checked={smartMode} onChange={e => setSmartMode(e.target.checked)} style={{margin:0}}/>
            스마트 입력 모드
          </label>
          <button onClick={onSmartFill} style={{
            display:'inline-flex', alignItems:'center', gap:5,
            padding:'5px 10px', fontSize:11, fontWeight:600,
            background: 'linear-gradient(135deg, #7C3AED, #3B82F6)', color:'#fff',
            border:'none', borderRadius:12, cursor:'pointer',
            fontFamily:'inherit',
          }}>
            ✨ 자동 채우기
          </button>
        </div>
      </div>

      {/* 결제 필드 그리드 */}
      <div style={{padding:'14px 16px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px 24px'}}>
        {/* 좌 컬럼: 카드/이체/네이버/기타 */}
        <div style={{display:'flex', flexDirection:'column', gap:10}}>
          <C_PayField label="카드" value={payments.card} onChange={v => set('card', v)} extra={
            <select style={c_payMiniSelect}><option>일시불</option><option>할부 2</option><option>할부 3</option></select>
          }/>
          <C_PayField label="이체" value={payments.transfer} onChange={v => set('transfer', v)}/>
          <C_PayField label="네이버" value={payments.naver} onChange={v => set('naver', v)}/>
          <C_PayField label="기타 결제" value={payments.etc} onChange={v => set('etc', v)} extra={
            <select style={c_payMiniSelect}><option>선택</option><option>카카오페이</option><option>토스</option><option>제로페이</option></select>
          }/>
          <C_PayField label="결제 날짜" isDate value={payDate} onChange={setPayDate}/>
        </div>

        {/* 우 컬럼: 현금/추가할인/결제금액/잔액 */}
        <div style={{display:'flex', flexDirection:'column', gap:10}}>
          <C_PayField label="현금" value={payments.cash} onChange={v => set('cash', v)}/>
          <C_PayField label="추가 할인" value={payments.extraDiscount} onChange={v => set('extraDiscount', v)} accent="#EF4444"/>
          <div style={{
            padding:'10px 12px', background:'#FBFCFE', borderRadius:7, border:`1px solid ${C_BORDER}`,
          }}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6}}>
              <span style={{fontSize:11, color:C_MUTED, fontWeight:600, letterSpacing:'0.02em'}}>결제 합계</span>
              <span style={{fontSize:14, fontWeight:700, color:C_INK, fontVariantNumeric:'tabular-nums'}}>
                ₩ {new Intl.NumberFormat('ko-KR').format(paymentSum)}
              </span>
            </div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <span style={{fontSize:11, color:C_MUTED, fontWeight:600, letterSpacing:'0.02em'}}>
                {balance > 0 ? '미결제' : balance < 0 ? '초과' : '완료'}
              </span>
              <span style={{
                fontSize:14, fontWeight:700, fontVariantNumeric:'tabular-nums',
                color: balance === 0 ? '#059669' : balance > 0 ? '#EF4444' : '#D97706',
              }}>
                ₩ {new Intl.NumberFormat('ko-KR').format(Math.abs(balance))}
              </span>
            </div>
          </div>
          <div style={{
            padding:'8px 12px', background: C_BLUE_SOFT, borderRadius:7, border:`1px solid ${C_BLUE}44`,
            display:'flex', justifyContent:'space-between', alignItems:'center',
          }}>
            <span style={{fontSize:12, color:C_BLUE, fontWeight:700}}>최종 청구액</span>
            <span style={{fontSize:16, fontWeight:700, color:C_BLUE, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em'}}>
              ₩ {new Intl.NumberFormat('ko-KR').format(finalTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function C_PayField({ label, value, onChange, extra, isDate, accent }) {
  return (
    <div style={{display:'grid', gridTemplateColumns:'80px 1fr', alignItems:'center', gap:8}}>
      <label style={{fontSize:12, color:C_INK, fontWeight:600}}>{label}</label>
      <div style={{display:'flex', gap:6, alignItems:'center'}}>
        {extra && <div style={{flexShrink:0}}>{extra}</div>}
        {isDate ? (
          <input value={value} onChange={e => onChange(e.target.value)}
            style={{
              flex:1, height:30, padding:'0 10px',
              border:`1px solid ${C_BORDER}`, borderRadius:6,
              fontSize:11.5, background:C_SURFACE, outline:'none',
              fontFamily:'inherit', fontVariantNumeric:'tabular-nums',
            }}/>
        ) : (
          <div style={{flex:1, position:'relative'}}>
            <input type="number" value={value === 0 ? '' : value}
              onChange={e => onChange(Number(e.target.value) || 0)}
              placeholder="0"
              style={{
                width:'100%', height:30, padding:'0 24px 0 10px',
                border:`1px solid ${value > 0 ? (accent || C_BLUE) : C_BORDER}`, borderRadius:6,
                fontSize:12.5, background:C_SURFACE, textAlign:'right',
                outline:'none', fontFamily:'inherit', fontVariantNumeric:'tabular-nums',
                color: value > 0 ? (accent || C_INK) : '#94A3B8',
                fontWeight: value > 0 ? 600 : 400,
              }}/>
            <span style={{position:'absolute', right:8, top:8, fontSize:11, color:C_MUTED, pointerEvents:'none'}}>원</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─ 통합 선택 팝오버: 담당 디자이너 카드 + 메뉴 카드 (2 단계) ─
function C_MenuPickerPopover({ lineId, kind, initialDesigner, initialCategory, onSelect, onClose }) {
  const [designer, setDesigner] = React.useState(initialDesigner || '');
  const [category, setCategory] = React.useState(initialCategory || MENU_CATEGORIES[0].id);

  const canConfirm = !!designer;

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, zIndex:250, background:'rgba(11,20,37,0.35)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width:820, maxHeight:'86vh', background:C_SURFACE, borderRadius:12,
        boxShadow:'0 24px 64px rgba(11,20,37,0.28)',
        display:'flex', flexDirection:'column', overflow:'hidden',
      }}>
        {/* 헤더 */}
        <div style={{padding:'14px 18px', borderBottom:`1px solid ${C_BORDER}`, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div style={{flex:1}}>
            <div style={{fontSize:14, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>
              {kind === 'service' ? '시술 추가' : '판매 제품 추가'}
            </div>
            <div style={{fontSize:11.5, color:C_MUTED, marginTop:2}}>
              담당 디자이너를 먼저 선택한 후 메뉴 카드를 눌러 빠르게 추가하세요
            </div>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            {designer && (() => {
              const d = DESIGNERS.find(x => x.id === designer);
              return (
                <span style={{
                  display:'inline-flex', alignItems:'center', gap:5,
                  padding:'4px 10px', borderRadius:12,
                  background: `${d?.color}22`, border:`1px solid ${d?.color}55`,
                  fontSize:11.5, color:C_INK, fontWeight:600,
                }}>
                  <span style={{width:6, height:6, borderRadius:'50%', background:d?.color}}/>
                  {d?.name}
                </span>
              );
            })()}
            <button onClick={onClose} style={c_closeBtn}><IconX size={16}/></button>
          </div>
        </div>

        {/* 담당 디자이너 카드 그리드 */}
        <div style={{padding:'14px 18px 4px', flexShrink:0}}>
          <div style={{fontSize:11, fontWeight:700, color:C_MUTED, letterSpacing:'0.06em', marginBottom:8, display:'flex', alignItems:'center', gap:6}}>
            <span style={{
              width:16, height:16, borderRadius:'50%', background:C_BLUE, color:'#fff',
              display:'inline-flex', alignItems:'center', justifyContent:'center',
              fontSize:10, fontWeight:700,
            }}>1</span>
            담당 디자이너
          </div>
          <div style={{
            display:'grid', gridTemplateColumns:'repeat(8, 1fr)', gap:6,
            maxHeight:150, overflowY:'auto',
          }}>
            {DESIGNERS.filter(d => d.id !== 'unassigned').map(d => {
              const on = designer === d.id;
              const initial = d.name.charAt(0);
              return (
                <button key={d.id}
                  onClick={() => setDesigner(d.id)}
                  style={{
                  padding:'8px 6px',
                  background: on ? `${d.color}22` : C_SURFACE,
                  border:`2px solid ${on ? d.color : C_BORDER}`, borderRadius:8,
                  cursor:'pointer',
                  display:'flex', flexDirection:'column', alignItems:'center', gap:4,
                  fontFamily:'inherit',
                  transition:'border-color 0.12s, background 0.12s, box-shadow 0.12s',
                  boxShadow: on ? `0 2px 8px ${d.color}44, inset 0 0 0 1px ${d.color}` : 'none',
                  position: 'relative',
                }}
                onMouseEnter={e => { if (!on) e.currentTarget.style.borderColor = d.color; }}
                onMouseLeave={e => { if (!on) e.currentTarget.style.borderColor = C_BORDER; }}
                >
                  {on && (
                    <div style={{
                      position:'absolute', top:4, right:4,
                      width:14, height:14, borderRadius:'50%',
                      background: d.color, color:'#fff',
                      display:'flex', alignItems:'center', justifyContent:'center',
                    }}>
                      <IconCheck size={9}/>
                    </div>
                  )}
                  <div style={{
                    width:26, height:26, borderRadius:'50%',
                    background: d.color, color:'#fff',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:11, fontWeight:700, letterSpacing:'-0.02em',
                    boxShadow: on ? `0 2px 6px ${d.color}88` : 'none',
                  }}>{initial}</div>
                  <div style={{fontSize:11, fontWeight: on ? 700 : 600, color:C_INK, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'100%'}}>{d.name}</div>
                  <div style={{fontSize:9, color:C_MUTED, letterSpacing:'-0.01em'}}>{d.role}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 카테고리 탭 */}
        <div style={{padding:'12px 18px 8px', flexShrink:0}}>
          <div style={{fontSize:11, fontWeight:700, color:C_MUTED, letterSpacing:'0.06em', marginBottom:8, display:'flex', alignItems:'center', gap:6}}>
            <span style={{
              width:16, height:16, borderRadius:'50%',
              background: canConfirm ? C_BLUE : C_BORDER,
              color:'#fff',
              display:'inline-flex', alignItems:'center', justifyContent:'center',
              fontSize:10, fontWeight:700,
            }}>2</span>
            시술 메뉴
            {!canConfirm && <span style={{fontSize:10, color:'#EF4444', fontWeight:500, marginLeft:6, letterSpacing:0}}>담당 디자이너를 먼저 선택하세요</span>}
          </div>
          <div style={{
            display:'flex', gap:5, flexWrap:'wrap',
          }}>
            {MENU_CATEGORIES.map(cat => {
              const on = category === cat.id;
              return (
                <button key={cat.id} onClick={() => setCategory(cat.id)} style={{
                  padding:'5px 10px', fontSize:11.5, fontWeight:600,
                  border:`1px solid ${on ? cat.color : C_BORDER}`,
                  background: on ? `${cat.color}18` : C_SURFACE,
                  color: on ? C_INK : C_MUTED,
                  borderRadius:14, cursor:'pointer', whiteSpace:'nowrap',
                  display:'inline-flex', alignItems:'center', gap:5,
                  fontFamily:'inherit',
                }}>
                  <span style={{width:6, height:6, borderRadius:'50%', background:cat.color, flexShrink:0}}/>
                  {cat.name} <span style={{opacity:0.6, fontVariantNumeric:'tabular-nums'}}>({(MENU_ITEMS[cat.id] || []).length})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 메뉴 그리드 */}
        <div style={{
          flex:1, overflowY:'auto', overflowX:'hidden', padding:'8px 18px 14px', background:C_BG,
          opacity: canConfirm ? 1 : 0.5, pointerEvents: canConfirm ? 'auto' : 'none',
          transition:'opacity 0.15s',
        }}>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8}}>
            {(MENU_ITEMS[category] || []).map(item => (
              <button key={item.id}
                onClick={() => onSelect({...item, category, designerId: designer})}
                style={{
                padding:'10px 12px', background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:8,
                cursor:'pointer', textAlign:'left',
                display:'flex', flexDirection:'column', gap:4,
                fontFamily:'inherit',
                transition:'border-color 0.12s, transform 0.06s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C_BLUE; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C_BORDER; }}
              onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)'; }}
              onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <div style={{fontSize:12.5, color:C_INK, fontWeight:600, letterSpacing:'-0.01em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{item.name}</div>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                  <span style={{fontSize:11, color:C_MUTED, fontVariantNumeric:'tabular-nums'}}>{item.duration}분</span>
                  <span style={{fontSize:14, color: item.price > 0 ? C_INK : '#CBD5E1', fontWeight:700, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em'}}>
                    {item.price === 0 ? '0' : new Intl.NumberFormat('ko-KR').format(item.price)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div style={{padding:'10px 18px', borderTop:`1px solid ${C_BORDER}`, background:'#FBFCFE', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{fontSize:11.5, color:C_MUTED}}>
            메뉴 카드를 클릭하면 라인이 자동으로 추가되고 창이 닫힙니다
          </div>
          <button onClick={onClose} style={{...c_ghostBtn, padding:'7px 14px'}}>취소</button>
        </div>
      </div>
    </div>
  );
}

// ─ Field wrapper ─
function C_Field({ label, required, hint, children }) {
  return (
    <div>
      <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:6}}>
        <label style={{fontSize:12, fontWeight:600, color:C_INK}}>
          {label} {required && <span style={{color:'#EF4444'}}>*</span>}
        </label>
        {hint && <span style={{fontSize:10.5, color:C_MUTED}}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

// ─ styles ─
const c_input = {
  width:'100%', height:34, padding:'0 12px',
  border:`1px solid ${C_BORDER}`, borderRadius:7,
  fontSize:12.5, background:C_SURFACE, outline:'none', fontFamily:'inherit', boxSizing:'border-box',
};
const c_select = { ...c_input, cursor:'pointer' };
const c_rowSelect = {
  width:'100%', height:30, padding:'0 8px',
  border:`1px solid ${C_BORDER}`, borderRadius:6,
  fontSize:12, background:C_SURFACE, outline:'none', fontFamily:'inherit', cursor:'pointer',
};
const c_check = {
  display:'inline-flex', alignItems:'center', gap:6,
  fontSize:12, color:C_INK, cursor:'pointer',
};
const c_closeBtn = {
  width:28, height:28, borderRadius:7, border:'none',
  background:'transparent', color:C_MUTED, cursor:'pointer',
  display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
};
const c_neutralBtn = {
  padding:'7px 12px', background:C_SURFACE, color:C_INK,
  border:`1px solid ${C_BORDER}`, borderRadius:7,
  fontSize:12, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap',
  display:'inline-flex', alignItems:'center', gap:5,
  fontFamily:'inherit',
};
const c_addBtn = {
  padding:'7px 14px', background:C_SURFACE, color:C_INK,
  border:`1px dashed ${C_BLUE}`, borderRadius:14,
  fontSize:12, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap',
  display:'inline-flex', alignItems:'center', gap:5,
  color:C_BLUE,
  fontFamily:'inherit',
};
const c_payMiniSelect = {
  height:30, padding:'0 6px',
  border:`1px solid ${C_BORDER}`, borderRadius:6,
  fontSize:11.5, background:C_SURFACE, outline:'none', cursor:'pointer',
  fontFamily:'inherit', width:80,
};

window.C_CustomerRegisterModal = C_CustomerRegisterModal;
window.C_GuestSalesModal = C_GuestSalesModal;
