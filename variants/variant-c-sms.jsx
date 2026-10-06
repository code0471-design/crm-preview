// SMS 매니저 서비스 설정 페이지 (설정 > SMS 매니저 서비스 설정)

const {
  C_BLUE, C_BLUE_SOFT, C_INK, C_MUTED, C_BORDER, C_BG, C_SURFACE,
  c_ghostBtn,
} = window;

// 4개 리포트 정의
const SMS_REPORTS_DEFAULT = [
  {
    id:'opening', kind:'매장', label:'오프닝 리포트',
    trigger:'login', triggerLabel:'로그인 시',
    triggerOptions: [
      { val:'open',  label:'운영 시작 시' },
      { val:'login', label:'로그인 시' },
    ],
    recipients: [{ type:'staff', id:15, name:'문지윤', role:'원장' }],
    enabled: true,
  },
  {
    id:'closing', kind:'매장', label:'클로징 리포트',
    trigger:'end', triggerLabel:'운영 종료 즉시',
    triggerOptions: [
      { val:'end',   label:'운영 종료 즉시' },
      { val:'end30', label:'운영 종료 30분 후' },
      { val:'end60', label:'운영 종료 1시간 후' },
    ],
    recipients: [{ type:'staff', id:15, name:'문지윤', role:'원장' }],
    enabled: true,
  },
  {
    id:'monthly', kind:'매장', label:'월간 리포트',
    trigger:'noon', triggerLabel:'매월 1일 오전 12시',
    triggerOptions: [
      { val:'noon',  label:'매월 1일 오전 12시' },
      { val:'noon2', label:'매월 1일 오전 9시' },
      { val:'noon3', label:'매월 5일 오전 9시' },
    ],
    recipients: [],
    enabled: false,
  },
  {
    id:'personal', kind:'개인', label:'개인 리포트',
    trigger:'endAll', triggerLabel:'운영 종료 후 즉시',
    triggerOptions: [
      { val:'endAll', label:'운영 종료 후 즉시' },
      { val:'end30A', label:'운영 종료 후 30분' },
    ],
    recipients: 'ALL_ACTIVE', // 근무중 스태프 전원
    enabled: true,
  },
];

function C_SmsPage() {
  const [reports, setReports] = React.useState(SMS_REPORTS_DEFAULT);
  const [kindFilter, setKindFilter] = React.useState('all'); // all | 매장 | 개인
  const [reportModal, setReportModal] = React.useState(null); // report obj
  const [closeStoreModal, setCloseStoreModal] = React.useState(false);

  const activeStaffCount = STAFF.filter(s => s.status === 'active').length;

  const toggleEnabled = (id) => {
    setReports(prev => prev.map(r => r.id === id ? {...r, enabled: !r.enabled} : r));
  };

  const filtered = reports.filter(r => kindFilter === 'all' || r.kind === kindFilter);

  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden', background:C_BG}}>
      <div style={{width: 948, flexShrink: 0, flex:1, display:'flex', flexDirection:'column', minHeight:0}}>
        {/* 서브헤더 (브레드크럼) */}
        <div style={{
          display:'flex', alignItems:'center', gap:8,
          padding:'10px 14px', background:C_SURFACE, borderBottom:`1px solid ${C_BORDER}`,
        }}>
          <div style={{fontSize:12.5, color:C_MUTED, flexShrink:0}}>
            홈 <span style={{margin:'0 6px'}}>›</span>
            <span>설정</span>
            <span style={{margin:'0 6px'}}>›</span>
            <span style={{color:C_INK, fontWeight:600}}>매니저 SMS 서비스</span>
          </div>
        </div>

        <div style={{flex:1, overflow:'auto', padding:'20px 20px 24px', display:'flex', flexDirection:'column', gap:16}}>
          {/* 서비스 안내 카드 */}
          <div style={{
            background:'#EFF3FC', border:'1px solid #C7D6F5', borderRadius:10,
            padding:'14px 18px',
          }}>
            <div style={{fontSize:12.5, fontWeight:700, color:C_INK, marginBottom:6}}>서비스 사용료 안내사항</div>
            <ul style={{margin:0, paddingLeft:16, fontSize:12, color:C_INK, lineHeight:1.8}}>
              <li>매니저 SMS 서비스는 장문 문자(LMS)로 발송되며, 1건당 <strong style={{fontWeight:700, color:C_BLUE}}>48원</strong>이 부과됩니다.</li>
              <li>해당 서비스 사용료는 문자 사용료에 포함되어 청구됩니다.</li>
            </ul>
          </div>

          {/* 서비스 시작일 / 운영시간 / 마감 카드 */}
          <div style={{
            background:C_SURFACE, borderRadius:10, border:`1px solid ${C_BORDER}`,
            padding:'6px 0', overflow:'hidden',
          }}>
            <div style={{
              display:'grid', gridTemplateColumns:'1fr 1fr 1fr',
              background:'#FBFCFE',
              borderBottom:`1px solid ${C_BORDER}`,
              fontSize:11.5, fontWeight:700, color:C_MUTED, letterSpacing:'0.02em',
              padding:'12px 20px',
            }}>
              <div style={{textAlign:'center'}}>서비스 시작일</div>
              <div style={{textAlign:'center'}}>매장 운영시간</div>
              <div style={{textAlign:'center'}}>금일 운영 마감</div>
            </div>
            <div style={{
              display:'grid', gridTemplateColumns:'1fr 1fr 1fr',
              padding:'18px 20px', alignItems:'center',
            }}>
              <div style={{textAlign:'center', fontSize:13, color:C_INK, fontVariantNumeric:'tabular-nums'}}>
                2026-06-16(화) 13:15
              </div>
              <div style={{textAlign:'center', fontSize:13, color:C_INK, fontWeight:500}}>
                오전 10시 ~ 오후 8시
              </div>
              <div style={{textAlign:'center'}}>
                <button onClick={() => setCloseStoreModal(true)} style={{
                  padding:'8px 22px', background:'linear-gradient(135deg, #6D28D9, #7C3AED)',
                  color:'#fff', border:'none', borderRadius:20,
                  fontSize:12.5, fontWeight:700, cursor:'pointer',
                  boxShadow:'0 2px 6px rgba(124,58,237,0.35)', fontFamily:'inherit',
                }}>영업 종료</button>
              </div>
            </div>
          </div>

          {/* 리포트 관리 */}
          <div>
            <div style={{
              display:'flex', alignItems:'center', gap:10,
              marginBottom:12,
            }}>
              <h2 style={{margin:0, fontSize:15, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>리포트 관리</h2>
              <div style={{display:'flex', gap:5, marginLeft:8}}>
                {[
                  { id:'all',  label:'전체' },
                  { id:'매장', label:'매장' },
                  { id:'개인', label:'개인' },
                ].map(f => (
                  <button key={f.id} onClick={() => setKindFilter(f.id)} style={{
                    padding:'5px 14px', fontSize:12, fontWeight:600,
                    border:`1px solid ${kindFilter===f.id ? C_BLUE : C_BORDER}`,
                    background: kindFilter===f.id ? C_BLUE_SOFT : C_SURFACE,
                    color: kindFilter===f.id ? C_BLUE : C_MUTED,
                    borderRadius:14, cursor:'pointer', fontFamily:'inherit',
                  }}>{f.label}</button>
                ))}
              </div>
            </div>

            {/* 리포트 테이블 */}
            <div style={{background:C_SURFACE, borderRadius:10, border:`1px solid ${C_BORDER}`, overflow:'hidden'}}>
              <div style={{
                display:'grid', gridTemplateColumns:'70px 1fr 1fr 140px 100px 80px',
                padding:'12px 18px', background:'#FBFCFE',
                borderBottom:`1px solid ${C_BORDER}`,
                fontSize:11.5, fontWeight:700, color:C_MUTED, letterSpacing:'0.02em',
              }}>
                <div>분류</div>
                <div>리포트 유형</div>
                <div>발송 시점</div>
                <div style={{textAlign:'center'}}>수신인</div>
                <div style={{textAlign:'center'}}>사용여부</div>
                <div style={{textAlign:'center'}}>리포트 설정</div>
              </div>
              {filtered.map((r, i) => {
                const recipientCount = r.recipients === 'ALL_ACTIVE' ? activeStaffCount : r.recipients.length;
                return (
                  <div key={r.id} style={{
                    display:'grid', gridTemplateColumns:'70px 1fr 1fr 140px 100px 80px',
                    padding:'14px 18px', alignItems:'center',
                    borderTop: i > 0 ? `1px solid ${C_BORDER}` : 'none',
                    fontSize:13, opacity: r.enabled ? 1 : 0.55,
                  }}>
                    <div>
                      <span style={{
                        display:'inline-block', padding:'3px 10px', borderRadius:12,
                        fontSize:11, fontWeight:600,
                        background: r.kind === '매장' ? '#EFF3FC' : '#F5F3FF',
                        color: r.kind === '매장' ? C_BLUE : '#7C3AED',
                      }}>{r.kind}</span>
                    </div>
                    <div style={{color:C_INK, fontWeight:600}}>{r.label}</div>
                    <div style={{color:C_MUTED, fontVariantNumeric:'tabular-nums'}}>{r.triggerLabel}</div>
                    <div style={{textAlign:'center'}}>
                      <RecipientCell
                        report={r}
                        count={recipientCount}
                        onAdd={(newRecipients) => setReports(prev => prev.map(x => x.id === r.id ? {...x, recipients:newRecipients} : x))}
                      />
                    </div>
                    <div style={{textAlign:'center'}}>
                      <C_SmsToggle checked={r.enabled} onChange={() => toggleEnabled(r.id)}/>
                    </div>
                    <div style={{textAlign:'center'}}>
                      <button onClick={() => setReportModal(r)} title="리포트 설정" style={{
                        width:28, height:28, borderRadius:7, border:'none',
                        background:'transparent', color:C_MUTED, cursor:'pointer',
                        display:'inline-flex', alignItems:'center', justifyContent:'center',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = C_BLUE_SOFT; e.currentTarget.style.color = C_BLUE; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C_MUTED; }}
                      >
                        <IconNote size={14}/>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 안내 */}
            <div style={{
              marginTop:14, padding:'12px 14px',
              background:'#FEF3C7', borderRadius:10, border:'1px solid #FCE9B8',
              fontSize:11.5, color:'#92400E', lineHeight:1.5,
            }}>
              <strong style={{fontWeight:700}}>발송 예정 안내</strong> · 사용여부가 켜진 리포트만 발송 시점에 자동 전송됩니다.
              개인 리포트는 각 스태프에게 개별 발송되므로, 근무 중 스태프 <strong>{activeStaffCount}명</strong>에게 전송됩니다.
            </div>
          </div>
        </div>
      </div>

      {reportModal && (
        <C_ReportSettingModal
          report={reportModal}
          onClose={() => setReportModal(null)}
          onSave={(newVal) => {
            setReports(prev => prev.map(r => r.id === reportModal.id ? {...r, ...newVal} : r));
            setReportModal(null);
          }}
        />
      )}

      {closeStoreModal && (
        <C_CloseStoreModal onClose={() => setCloseStoreModal(false)}/>
      )}
    </div>
  );
}

// ─ 수신인 추가 인라인 ─
function RecipientCell({ report, count, onAdd }) {
  const [showAdd, setShowAdd] = React.useState(false);
  const [phone, setPhone] = React.useState('');

  if (report.recipients === 'ALL_ACTIVE') {
    return (
      <div style={{display:'inline-flex', alignItems:'center', gap:6}}>
        <span style={{fontSize:12, color:C_INK, fontWeight:600, fontVariantNumeric:'tabular-nums'}}>{count}명</span>
        <span style={{fontSize:10, color:C_MUTED, padding:'2px 6px', background:'#F1F5F9', borderRadius:8}}>전체</span>
      </div>
    );
  }

  const addPhone = () => {
    const cleaned = phone.replace(/\D/g,'');
    if (cleaned.length < 10) return;
    onAdd([...report.recipients, { type:'phone', phone: formatSmsPhone(phone) }]);
    setPhone('');
    setShowAdd(false);
  };

  return (
    <div style={{display:'inline-flex', alignItems:'center', gap:6}}>
      <span style={{fontSize:12, color:C_INK, fontWeight:600, fontVariantNumeric:'tabular-nums'}}>{count}명</span>
      {showAdd ? (
        <div style={{display:'inline-flex', alignItems:'center', gap:4, background:C_SURFACE, border:`1px solid ${C_BLUE}`, borderRadius:14, padding:'2px 4px 2px 10px'}}>
          <input value={phone}
            onChange={e => setPhone(formatSmsPhone(e.target.value))}
            onKeyDown={e => e.key === 'Enter' && addPhone()}
            placeholder="010-0000-0000"
            autoFocus
            style={{
              width:105, border:'none', outline:'none', fontSize:11,
              background:'transparent', fontFamily:'inherit',
              fontVariantNumeric:'tabular-nums',
            }}/>
          <button onClick={addPhone} style={{
            width:20, height:20, borderRadius:'50%', border:'none',
            background: C_BLUE, color:'#fff', cursor:'pointer',
            display:'inline-flex', alignItems:'center', justifyContent:'center',
          }}>
            <IconCheck size={11}/>
          </button>
          <button onClick={() => { setShowAdd(false); setPhone(''); }} style={{
            width:20, height:20, borderRadius:'50%', border:'none',
            background:'transparent', color:C_MUTED, cursor:'pointer',
            display:'inline-flex', alignItems:'center', justifyContent:'center',
          }}>
            <IconX size={11}/>
          </button>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)} style={{
          display:'inline-flex', alignItems:'center', gap:4,
          padding:'2px 10px', border:`1px solid ${C_BORDER}`, borderRadius:12,
          background:C_SURFACE, color:C_MUTED, cursor:'pointer',
          fontSize:11, fontWeight:600, fontFamily:'inherit',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = C_BLUE; e.currentTarget.style.color = C_BLUE; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = C_BORDER; e.currentTarget.style.color = C_MUTED; }}
        >+</button>
      )}
    </div>
  );
}

function formatSmsPhone(v) {
  const d = v.replace(/\D/g,'').slice(0,11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0,3)}-${d.slice(3)}`;
  return `${d.slice(0,3)}-${d.slice(3,7)}-${d.slice(7)}`;
}

// ─ 토글 ─
function C_SmsToggle({ checked, onChange }) {
  return (
    <div onClick={onChange} style={{
      width:36, height:20, borderRadius:10,
      background: checked ? C_BLUE : '#E5E7EB',
      position:'relative', cursor:'pointer',
      transition:'background 0.15s',
      display:'inline-block', verticalAlign:'middle',
    }}>
      <div style={{
        position:'absolute', top:2, left: checked ? 18 : 2,
        width:16, height:16, borderRadius:'50%', background:'#fff',
        boxShadow:'0 1px 2px rgba(11,20,37,0.15)',
        transition:'left 0.15s',
      }}/>
    </div>
  );
}

// ─────────────────────────────────────────
// 리포트 설정 모달
// ─────────────────────────────────────────
function C_ReportSettingModal({ report, onClose, onSave }) {
  const [trigger, setTrigger] = React.useState(report.trigger);
  const [previewTab, setPreviewTab] = React.useState('sms'); // sms | plander
  const [template, setTemplate] = React.useState(getDefaultTemplate(report.id));

  const triggerLabel = report.triggerOptions.find(o => o.val === trigger)?.label || report.triggerLabel;

  const handleSave = () => {
    onSave({ trigger, triggerLabel });
  };

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(11,20,37,0.5)',
      zIndex:200, display:'flex', alignItems:'center', justifyContent:'center',
      padding:20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width:820, maxHeight:'92vh', background:C_SURFACE, borderRadius:14,
        boxShadow:'0 24px 64px rgba(11,20,37,0.28)',
        display:'flex', flexDirection:'column', overflow:'hidden',
      }}>
        {/* 헤더 */}
        <div style={{padding:'18px 24px 14px', borderBottom:`1px solid ${C_BORDER}`, display:'flex', alignItems:'center', justifyContent:'center', position:'relative'}}>
          <div style={{fontSize:16, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>
            {report.label} 설정
          </div>
          <button onClick={onClose} style={{
            position:'absolute', right:20, top:'50%', transform:'translateY(-50%)',
            width:28, height:28, borderRadius:7, border:'none',
            background:'transparent', color:C_MUTED, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}><IconX size={16}/></button>
        </div>

        {/* 본문 */}
        <div style={{flex:1, overflow:'auto', display:'grid', gridTemplateColumns:'1fr 340px', gap:0}}>
          {/* 좌: 설정 */}
          <div style={{padding:'22px 24px', display:'flex', flexDirection:'column', gap:20}}>
            {/* 발송 조건 */}
            <div>
              <div style={{fontSize:13, fontWeight:700, color:C_INK, marginBottom:10, letterSpacing:'-0.01em'}}>발송 조건</div>
              <div style={{display:'flex', flexDirection:'column', gap:6}}>
                {report.triggerOptions.map(o => {
                  const on = trigger === o.val;
                  return (
                    <label key={o.val} style={{
                      display:'flex', alignItems:'center', gap:8,
                      padding:'10px 14px', borderRadius:8, cursor:'pointer',
                      border:`1px solid ${on ? C_BLUE : C_BORDER}`,
                      background: on ? C_BLUE_SOFT : C_SURFACE,
                    }}>
                      <input type="radio" checked={on} onChange={() => setTrigger(o.val)} style={{margin:0}}/>
                      <span style={{fontSize:13, color:C_INK, fontWeight: on ? 600 : 500}}>{o.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 템플릿 편집 */}
            <div>
              <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:10}}>
                <div style={{fontSize:13, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>메시지 템플릿</div>
                <span style={{fontSize:11, color:C_MUTED, fontVariantNumeric:'tabular-nums'}}>{template.length}자 · LMS</span>
              </div>
              <textarea value={template} onChange={e => setTemplate(e.target.value)}
                rows={9}
                style={{
                  width:'100%', padding:'12px 14px',
                  border:`1px solid ${C_BORDER}`, borderRadius:8,
                  fontSize:12.5, background:C_SURFACE, outline:'none',
                  fontFamily:'ui-monospace, monospace', resize:'vertical', boxSizing:'border-box',
                  lineHeight:1.5, color:C_INK,
                }}/>
              <div style={{marginTop:8, display:'flex', flexWrap:'wrap', gap:5}}>
                {['{매장명}','{날짜}','{예약수}','{매출}','{디자이너명}','{근무자수}'].map(t => (
                  <button key={t} onClick={() => setTemplate(prev => prev + ' ' + t)} style={{
                    padding:'3px 9px', fontSize:11, fontWeight:600,
                    border:`1px dashed ${C_BLUE}`, borderRadius:12,
                    background: C_SURFACE, color: C_BLUE, cursor:'pointer',
                    fontFamily:'ui-monospace, monospace',
                  }}>{t}</button>
                ))}
              </div>
            </div>
          </div>

          {/* 우: 미리보기 */}
          <div style={{background:'#F5F7FB', borderLeft:`1px solid ${C_BORDER}`, padding:'22px 20px', display:'flex', flexDirection:'column', gap:12}}>
            {/* 문자/플랜더 탭 */}
            <div style={{display:'flex', gap:5, alignSelf:'center'}}>
              {[
                { id:'sms',     label:'문자' },
                { id:'plander', label:'플랜더' },
              ].map(t => (
                <button key={t.id} onClick={() => setPreviewTab(t.id)} style={{
                  padding:'5px 18px', fontSize:12, fontWeight:600,
                  border:`1px solid ${previewTab===t.id ? C_BLUE : C_BORDER}`,
                  background: previewTab===t.id ? C_BLUE_SOFT : C_SURFACE,
                  color: previewTab===t.id ? C_BLUE : C_MUTED,
                  borderRadius:14, cursor:'pointer', fontFamily:'inherit',
                }}>{t.label}</button>
              ))}
            </div>

            {/* 폰 미리보기 */}
            <C_PhonePreview mode={previewTab} template={template}/>
          </div>
        </div>

        {/* 푸터 */}
        <div style={{
          padding:'12px 24px', borderTop:`1px solid ${C_BORDER}`, background:C_SURFACE,
          display:'flex', gap:8, justifyContent:'center',
        }}>
          <button onClick={onClose} style={{...c_ghostBtn, padding:'9px 22px', borderRadius:20}}>취소</button>
          <button onClick={handleSave} style={{
            padding:'9px 30px', background: C_BLUE, color:'#fff',
            border:'none', borderRadius:20, fontSize:13, fontWeight:700,
            cursor:'pointer', boxShadow:'0 1px 2px rgba(30,64,175,0.2)',
            fontFamily:'inherit',
          }}>저장</button>
        </div>
      </div>
    </div>
  );
}

// ─ 폰 미리보기 ─
function C_PhonePreview({ mode, template }) {
  return (
    <div style={{
      width:220, alignSelf:'center',
      borderRadius:24, overflow:'hidden',
      background:'#fff', boxShadow:'0 8px 24px rgba(11,20,37,0.12)',
      display:'flex', flexDirection:'column',
    }}>
      {/* Notch */}
      <div style={{padding:'10px 0 6px', display:'flex', justifyContent:'center'}}>
        <div style={{width:60, height:4, borderRadius:2, background:'#0B1425'}}/>
      </div>

      {mode === 'sms' ? (
        <div style={{padding:'12px 14px 22px', display:'flex', flexDirection:'column', gap:10, alignItems:'center'}}>
          <div style={{
            width:44, height:44, borderRadius:'50%', background:'#E5EAF2',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <IconUser size={22} style={{color:'#94A3B8'}}/>
          </div>
          <div style={{fontSize:11, color:C_MUTED, fontVariantNumeric:'tabular-nums'}}>070-0000-0000</div>
          <div style={{
            width:'100%', padding:'11px 12px',
            background:'#F5F7FB', borderRadius:12,
            fontSize:10.5, color:C_INK, lineHeight:1.5,
            whiteSpace:'pre-wrap',
            fontFamily:'ui-monospace, monospace',
            maxHeight:340, overflow:'auto',
          }}>
            {template}
          </div>
        </div>
      ) : (
        <div style={{padding:'12px 14px 22px', display:'flex', flexDirection:'column', gap:10}}>
          {/* 플랜더 앱 푸시 예시 */}
          <div style={{fontSize:10, color:C_MUTED, textAlign:'center', marginBottom:4}}>지금</div>
          <div style={{
            padding:'11px 12px', background:'#F5F7FB', borderRadius:12,
            display:'flex', flexDirection:'column', gap:6,
          }}>
            <div style={{display:'flex', alignItems:'center', gap:6}}>
              <div style={{width:22, height:22, borderRadius:6, background:'linear-gradient(135deg, #6D28D9, #7C3AED)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700}}>P</div>
              <span style={{fontSize:10, fontWeight:700, color:C_INK}}>플랜더 · 카이키키 부평본점</span>
            </div>
            <div style={{fontSize:11, fontWeight:700, color:C_INK}}>
              {template.split('\n')[0] || '리포트 알림'}
            </div>
            <div style={{fontSize:10, color:C_MUTED, lineHeight:1.45, whiteSpace:'pre-wrap', maxHeight:200, overflow:'hidden'}}>
              {template.split('\n').slice(1).join('\n')}
            </div>
            <div style={{fontSize:9, color:C_BLUE, fontWeight:600, marginTop:2}}>
              앱에서 자세히 보기 →
            </div>
          </div>
          <div style={{fontSize:10, color:C_MUTED, textAlign:'center'}}>
            문자 대신 <strong style={{color:C_INK, fontWeight:700}}>플랜더 앱 푸시</strong>로 발송됩니다
          </div>
        </div>
      )}
    </div>
  );
}

// 기본 템플릿 (리포트별)
function getDefaultTemplate(id) {
  const dt = '2026년 10월 25일 수요일';
  switch (id) {
    case 'opening':
      return `[오프닝 보고]
${dt}

[당일 예약 현황: 총 15건]
커트&스타일링 7건
디자인펌 5건
매직스트레이트 2건
모발 클리닉 1건

[근무 현황: 총 3명]
소다은 10:00~6:00
김소영 10:00~6:00
홍길동 10:00~6:00

[등록된 일정]
- 최선강 휴무
- 김상인 휴무
- 디자인 컬러 클래스
- 본사 심감이 회의`;
    case 'closing':
      return `[클로징 보고]
${dt}

[당일 매출 요약]
총 매출: 2,840,000원
객수: 12명
객단가: 236,667원

[결제수단]
카드: 1,900,000원 (67%)
현금: 540,000원 (19%)
계좌이체: 400,000원 (14%)

[디자이너 매출 TOP 3]
1. 문지윤 620,000원
2. 이상현 480,000원
3. 정명희 460,000원

[내수 판매]
정액권 판매: 2건
제품 판매: 5건`;
    case 'monthly':
      return `[월간 리포트]
2026년 9월 요약

[매출]
월 매출: 68,400,000원
전월 대비: +8.2%
목표 달성률: 102%

[객수]
총 방문: 348명 (일평균 11.6명)
재방문율: 63%
신규 고객: 128명

[베스트 시술]
1. 디지털펌 (72건)
2. 뿌리염색 (58건)
3. 매직스트레이트 (41건)

[매장 운영일수] 28일`;
    case 'personal':
      return `[개인 일일 리포트]
${dt}
{디자이너명}님

[오늘 매출] 620,000원
[객수] 4명 / 객단가 155,000원
[재방문] 3명 / 신규 1명

[내역]
1. 박서연 · 루트터치업 · 70,000원
2. 강수현 · 헤어스파 · 70,000원
3. 서다은 · 컷+클리닉 · 80,000원
4. 송경미 · 뿌리염색 · 400,000원

수고하셨습니다!`;
    default:
      return '';
  }
}

// ─────────────────────────────────────────
// 영업 종료 모달 (마감 시간 입력)
// ─────────────────────────────────────────
function C_CloseStoreModal({ onClose }) {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2,'0');
  const mm = String(now.getMinutes()).padStart(2,'0');
  const [closeTime, setCloseTime] = React.useState(`${hh}:${mm}`);
  const [sendReport, setSendReport] = React.useState(true);

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(11,20,37,0.5)',
      zIndex:200, display:'flex', alignItems:'center', justifyContent:'center',
      padding:20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width:420, background:C_SURFACE, borderRadius:14,
        boxShadow:'0 24px 64px rgba(11,20,37,0.28)',
        overflow:'hidden',
      }}>
        <div style={{padding:'18px 22px 8px'}}>
          <div style={{
            width:44, height:44, borderRadius:'50%',
            background:'linear-gradient(135deg, #6D28D9, #7C3AED)', color:'#fff',
            display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12,
          }}>
            <IconClock size={20}/>
          </div>
          <div style={{fontSize:16, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>영업 종료</div>
          <div style={{fontSize:12.5, color:C_MUTED, marginTop:6, lineHeight:1.5}}>
            금일 영업 마감 시간을 기록하고 클로징 리포트를 발송합니다.
          </div>
        </div>

        <div style={{padding:'12px 22px', display:'flex', flexDirection:'column', gap:14}}>
          <div>
            <div style={{fontSize:11.5, fontWeight:700, color:C_INK, marginBottom:6}}>마감 시간</div>
            <input type="time" value={closeTime} onChange={e => setCloseTime(e.target.value)}
              style={{
                width:'100%', height:38, padding:'0 14px',
                border:`1px solid ${C_BORDER}`, borderRadius:14,
                fontSize:14, background:C_SURFACE, outline:'none',
                fontFamily:'inherit', fontVariantNumeric:'tabular-nums',
                boxSizing:'border-box',
              }}/>
          </div>
          <label style={{
            display:'flex', alignItems:'flex-start', gap:8,
            padding:'10px 12px', borderRadius:8,
            border:`1px solid ${sendReport ? C_BLUE : C_BORDER}`,
            background: sendReport ? C_BLUE_SOFT : C_SURFACE,
            cursor:'pointer',
          }}>
            <input type="checkbox" checked={sendReport} onChange={e => setSendReport(e.target.checked)} style={{marginTop:2}}/>
            <div style={{flex:1}}>
              <div style={{fontSize:12.5, fontWeight:600, color:C_INK}}>클로징 리포트 발송</div>
              <div style={{fontSize:11, color:C_MUTED, marginTop:2}}>마감과 동시에 원장님께 클로징 리포트 SMS를 전송합니다.</div>
            </div>
          </label>
        </div>

        <div style={{padding:'14px 22px', display:'flex', gap:8, justifyContent:'flex-end'}}>
          <button onClick={onClose} style={{...c_ghostBtn, padding:'8px 18px', borderRadius:14}}>취소</button>
          <button onClick={onClose} style={{
            padding:'8px 22px', background:'linear-gradient(135deg, #6D28D9, #7C3AED)',
            color:'#fff', border:'none', borderRadius:14,
            fontSize:13, fontWeight:700, cursor:'pointer',
            boxShadow:'0 2px 6px rgba(124,58,237,0.35)', fontFamily:'inherit',
          }}>영업 종료</button>
        </div>
      </div>
    </div>
  );
}

window.C_SmsPage = C_SmsPage;
