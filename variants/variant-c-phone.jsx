// 수신전화 설정 페이지 (설정 > 수신전화 설정)
// 탭 2개: 전화 연동 / 통화 기록

const {
  C_BLUE, C_BLUE_SOFT, C_INK, C_MUTED, C_BORDER, C_BG, C_SURFACE,
  c_ghostBtn, c_ghostBtnSm,
} = window;

// ==== 통화 기록 목업 ====
const CALL_LOGS_MOCK = (() => {
  const rows = [];
  const customers = [
    { name:'곽진회', grade:'VIP',   phone:'010-8276-6967' },
    { name:'비회원', grade:'',       phone:'010-6336-5771' },
    { name:'박서연', grade:'단골',   phone:'010-2221-3345' },
    { name:'이하늘', grade:'',       phone:'010-4451-1129' },
    { name:'문가영', grade:'VIP',   phone:'010-5567-2298' },
    { name:'조은지', grade:'',       phone:'010-3323-4467' },
    { name:'박수민', grade:'',       phone:'010-7712-9987' },
    { name:'서다은', grade:'단골',   phone:'010-2211-6688' },
    { name:'이수아', grade:'',       phone:'010-9987-4412' },
    { name:'유서진', grade:'VIP',   phone:'010-3345-6612' },
    { name:'홍민석', grade:'',       phone:'010-6612-4478' },
    { name:'김재원', grade:'',       phone:'010-8801-3345' },
    { name:'이도현', grade:'단골',   phone:'010-4451-9987' },
    { name:'배지영', grade:'',       phone:'010-7723-1123' },
    { name:'장하윤', grade:'',       phone:'010-2233-5541' },
    { name:'박태준', grade:'',       phone:'010-9987-0012' },
    { name:'정예진', grade:'',       phone:'010-4467-8895' },
  ];
  const statuses = [
    { icon:'📞', label:'수신' },
    { icon:'📞', label:'수신' },
    { icon:'📞', label:'수신' },
    { icon:'📤', label:'발신' },
    { icon:'❗', label:'부재' },
  ];
  const designers = ['미지정','문지윤','이상현','정명희','이현진','김산','박소현','한지영'];
  const kinds = ['상담','예약','클레임','기타',''];
  // 오늘부터 역순 17건
  const base = new Date(2026, 8, 17, 15, 44);
  for (let i = 0; i < 17; i++) {
    const c = customers[i];
    const s = statuses[i % 5];
    const dt = new Date(base.getTime() - i * (Math.random() * 60 + 30) * 60000);
    const dow = ['일','월','화','수','목','금','토'][dt.getDay()];
    const dateStr = `${String(dt.getFullYear()).slice(2)}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}(${dow}) ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;
    rows.push({
      id: 17 - i,
      dateStr,
      customer: c.name,
      grade: c.grade,
      designer: designers[i % designers.length],
      phone: c.phone,
      status: s,
      kind: kinds[i % 5],
      hasMemo: i % 3 === 0,
    });
  }
  return rows;
})();

// 수신 상태 집계 (누적)
const CALL_STATS = {
  status: [
    { label:'수신', value:546, color:'#1E40AF' },
    { label:'발신', value: 15, color:'#6366F1' },
    { label:'부재', value: 60, color:'#CBD5E1' },
  ],
  kind: [
    { label:'상담',   value:0, color:'#1E40AF' },
    { label:'클레임', value:0, color:'#3B82F6' },
    { label:'예약',   value:0, color:'#8B5CF6' },
    { label:'기타',   value:0, color:'#CBD5E1' },
  ],
};

function C_PhonePage() {
  const [tab, setTab] = React.useState('link'); // link | log
  const [connectingState, setConnectingState] = React.useState(null); // null | 'loading' | 'success'
  const [customerModal, setCustomerModal] = React.useState(null);

  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden', background:C_BG}}>
      <div style={{width: 948, flexShrink: 0, flex:1, display:'flex', flexDirection:'column', minHeight:0}}>
        {/* 서브헤더 */}
        <div style={{
          display:'flex', alignItems:'center', gap:8,
          padding:'10px 14px', background:C_SURFACE, borderBottom:`1px solid ${C_BORDER}`,
        }}>
          <div style={{fontSize:12.5, color:C_MUTED, flexShrink:0}}>
            홈 <span style={{margin:'0 6px'}}>›</span>
            <span>수신전화 설정</span>
            <span style={{margin:'0 6px'}}>›</span>
            <span style={{color:C_INK, fontWeight:600}}>전화 연동</span>
          </div>
          <div style={{flex:1}}/>
          <div style={{display:'flex', gap:4, flexShrink:0, background:C_BG, borderRadius:20, padding:3, border:`1px solid ${C_BORDER}`}}>
            {[
              { id:'link', label:'전화 연동' },
              { id:'log',  label:'통화 기록' },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding:'5px 16px', fontSize:12, fontWeight:700,
                border:'none', borderRadius:16, cursor:'pointer',
                background: tab===t.id ? 'linear-gradient(135deg, #6D28D9, #7C3AED)' : 'transparent',
                color: tab===t.id ? '#fff' : C_MUTED,
                boxShadow: tab===t.id ? '0 1px 2px rgba(124,58,237,0.25)' : 'none',
                fontFamily:'inherit',
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        <div style={{flex:1, overflow:'auto', padding:'22px 22px 24px'}}>
          {tab === 'link' && <C_PhoneLinkTab onConnect={() => {
            setConnectingState('loading');
            setTimeout(() => setConnectingState('success'), 900);
          }}/>}
          {tab === 'log' && <C_PhoneLogTab onCustomerClick={setCustomerModal}/>}
        </div>
      </div>

      {connectingState && (
        <C_ConnectResultModal state={connectingState} onClose={() => setConnectingState(null)}/>
      )}
      {customerModal && (
        <C_CustomerPopover customer={customerModal} onClose={() => setCustomerModal(null)}/>
      )}
    </div>
  );
}

// ─── 탭 1: 전화 연동 ───
function C_PhoneLinkTab({ onConnect }) {
  const [linkId, setLinkId] = React.useState('0325050377@kt.com');
  const [linkPw, setLinkPw] = React.useState('1q2w3e!!');
  const [linkPhone, setLinkPhone] = React.useState('KT 전화');
  const [phoneNumber, setPhoneNumber] = React.useState('0325050377');
  const [popup, setPopup] = React.useState('on');

  return (
    <div style={{maxWidth:520, margin:'0 auto', display:'flex', flexDirection:'column', gap:24}}>
      {/* 연동 설정 */}
      <section>
        <h2 style={{margin:'0 0 14px', fontSize:14, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>연동 설정</h2>

        {/* 설치 및 신청 - 정보 칩 */}
        <div style={{display:'flex', flexDirection:'column', gap:10, marginBottom:16}}>
          <div style={{display:'flex', alignItems:'center', gap:14}}>
            <label style={c_phLabel}>설치 및 신청</label>
            <div style={{display:'flex', gap:6, flex:1}}>
              {['연동 프로그램 설치', '사용 신청', '환경설정'].map((step, i) => (
                <div key={i} style={{
                  padding:'4px 10px', fontSize:11.5, fontWeight:600,
                  background:C_BLUE_SOFT, color:C_BLUE, borderRadius:12,
                }}>{step}</div>
              ))}
            </div>
          </div>
          <div style={{paddingLeft:100, fontSize:11.5, color:C_MUTED, marginTop:-4}}>
            연동 프로그램 설치를 완료하고 사용 신청해 주세요.
          </div>
        </div>

        <div style={{display:'flex', alignItems:'center', gap:14, marginBottom:10}}>
          <label style={c_phLabel}>연동 아이디</label>
          <input value={linkId} onChange={e => setLinkId(e.target.value)}
            placeholder="연동 아이디" style={c_phInput}/>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:14, marginBottom:16}}>
          <label style={c_phLabel}>비밀번호</label>
          <input type="password" value={linkPw} onChange={e => setLinkPw(e.target.value)}
            placeholder="비밀번호" style={c_phInput}/>
        </div>

        <div style={{textAlign:'center'}}>
          <button onClick={onConnect} style={{
            padding:'10px 34px', background:'linear-gradient(135deg, #6D28D9, #7C3AED)',
            color:'#fff', border:'none', borderRadius:22, fontSize:13, fontWeight:700,
            cursor:'pointer', boxShadow:'0 2px 6px rgba(124,58,237,0.35)', fontFamily:'inherit',
          }}>연동하기</button>
        </div>
      </section>

      <div style={{height:1, background:C_BORDER}}/>

      {/* 발신자 표시 설정 */}
      <section>
        <h2 style={{margin:'0 0 14px', fontSize:14, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>발신자 표시 설정</h2>

        <div style={{display:'flex', alignItems:'center', gap:14, marginBottom:10}}>
          <label style={c_phLabel}>연동 전화</label>
          <select value={linkPhone} onChange={e => setLinkPhone(e.target.value)} style={c_phSelect}>
            <option>KT 전화</option>
            <option>SKT 전화</option>
            <option>LG U+ 전화</option>
            <option>인터넷 전화</option>
          </select>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:14, marginBottom:10}}>
          <label style={c_phLabel}>전화번호</label>
          <input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value.replace(/\D/g,''))}
            style={{...c_phInput, fontVariantNumeric:'tabular-nums'}}/>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:14, marginBottom:16}}>
          <label style={c_phLabel}>팝업창 알림</label>
          <div style={{display:'flex', gap:16}}>
            {[
              { id:'on',  label:'사용' },
              { id:'off', label:'미사용' },
            ].map(o => (
              <label key={o.id} style={{display:'inline-flex', alignItems:'center', gap:5, fontSize:12.5, color:C_INK, cursor:'pointer'}}>
                <input type="radio" checked={popup === o.id} onChange={() => setPopup(o.id)} style={{margin:0}}/>
                {o.label}
              </label>
            ))}
          </div>
        </div>

        <div style={{textAlign:'center'}}>
          <button style={{
            padding:'10px 34px', background:'linear-gradient(135deg, #6D28D9, #7C3AED)',
            color:'#fff', border:'none', borderRadius:22, fontSize:13, fontWeight:700,
            cursor:'pointer', boxShadow:'0 2px 6px rgba(124,58,237,0.35)', fontFamily:'inherit',
          }}>저장하기</button>
        </div>
      </section>
    </div>
  );
}

// ─── 탭 2: 통화 기록 ───
function C_PhoneLogTab({ onCustomerClick }) {
  const [page, setPage] = React.useState(1);
  const [statFilter, setStatFilter] = React.useState('today'); // today | week | month | cumulative
  const perPage = 10;
  const total = CALL_LOGS_MOCK.length;
  const totalPages = Math.ceil(total / perPage);
  const start = (page - 1) * perPage;
  const rows = CALL_LOGS_MOCK.slice(start, start + perPage);

  return (
    <div style={{display:'flex', flexDirection:'column', gap:20}}>
      {/* 액션 바 */}
      <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
        <button style={{
          padding:'7px 14px', border:`1px solid ${C_BORDER}`, borderRadius:20,
          background:C_SURFACE, color:C_INK, fontSize:12, fontWeight:600,
          display:'inline-flex', alignItems:'center', gap:6, cursor:'pointer',
          fontFamily:'inherit',
        }}>
          <IconClock size={12}/> 내역 불러오기
        </button>
        <button style={{
          padding:'7px 14px', border:`1px solid ${C_BORDER}`, borderRadius:20,
          background:C_SURFACE, color:C_INK, fontSize:12, fontWeight:600,
          display:'inline-flex', alignItems:'center', gap:6, cursor:'pointer',
          fontFamily:'inherit',
        }}>
          <IconFilter size={12}/> 필터
        </button>
      </div>

      {/* 통화 테이블 */}
      <div style={{background:C_SURFACE, borderRadius:10, border:`1px solid ${C_BORDER}`, overflow:'hidden'}}>
        <div style={{
          display:'grid', gridTemplateColumns:'40px 140px 100px 70px 118px 90px 90px 40px 130px',
          padding:'12px 16px', background:'#FBFCFE',
          borderBottom:`1px solid ${C_BORDER}`,
          fontSize:11.5, fontWeight:700, color:C_MUTED, letterSpacing:'0.02em',
        }}>
          <div style={{textAlign:'center'}}>번호</div>
          <div>일시 ↕</div>
          <div>고객명[등급]</div>
          <div>담당자</div>
          <div>수신 번호</div>
          <div style={{textAlign:'center'}}>수신 상태</div>
          <div style={{textAlign:'center'}}>수신 유형</div>
          <div style={{textAlign:'center'}}>메모</div>
          <div style={{textAlign:'center'}}>비고</div>
        </div>
        {rows.map((r, i) => (
          <div key={r.id} style={{
            display:'grid', gridTemplateColumns:'40px 140px 100px 70px 118px 90px 90px 40px 130px',
            padding:'14px 16px', alignItems:'center',
            borderTop: i > 0 ? `1px solid ${C_BORDER}` : 'none',
            fontSize:12.5,
          }}>
            <div style={{textAlign:'center', color:C_MUTED, fontVariantNumeric:'tabular-nums', fontSize:11.5}}>{r.id}</div>
            <div style={{color:C_INK, fontVariantNumeric:'tabular-nums'}}>{r.dateStr}</div>
            <div>
              <button onClick={() => onCustomerClick(r)} style={{
                background:'transparent', border:'none', padding:0, cursor:'pointer',
                color:C_INK, fontWeight:600, fontFamily:'inherit', fontSize:12.5,
                textAlign:'left',
              }}
              onMouseEnter={e => e.currentTarget.style.color = C_BLUE}
              onMouseLeave={e => e.currentTarget.style.color = C_INK}
              >
                {r.customer}<span style={{color:C_MUTED, fontWeight:400}}>[{r.grade}]</span>
              </button>
            </div>
            <div style={{color: r.designer === '미지정' ? C_MUTED : C_INK, fontSize:12}}>{r.designer}</div>
            <div style={{color:C_INK, fontVariantNumeric:'tabular-nums'}}>{r.phone}</div>
            <div style={{textAlign:'center', color:C_INK, fontSize:12}}>
              <span style={{marginRight:3}}>{r.status.icon}</span>{r.status.label}
            </div>
            <div style={{textAlign:'center'}}>
              {r.kind ? (
                <span style={{
                  display:'inline-block', padding:'2px 8px', borderRadius:10,
                  background: C_BLUE_SOFT, color:C_BLUE, fontSize:10.5, fontWeight:600,
                }}>{r.kind}</span>
              ) : (
                <button style={{
                  display:'inline-flex', alignItems:'center',
                  padding:'2px 10px', border:`1px solid ${C_BLUE}`, borderRadius:10,
                  background:C_SURFACE, color:C_BLUE, cursor:'pointer',
                  fontSize:11, fontWeight:600, fontFamily:'inherit',
                }}>+</button>
              )}
            </div>
            <div style={{textAlign:'center', color: r.hasMemo ? C_INK : '#CBD5E1'}}>
              📋
            </div>
            <div style={{display:'flex', gap:5, justifyContent:'center'}}>
              <button style={c_phRowBtn}>통화</button>
              <button style={c_phRowBtn}>예약</button>
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      <div style={{display:'flex', justifyContent:'center', alignItems:'center', gap:4}}>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={c_phPagerBtn}>
          <IconChevronL size={12}/>
        </button>
        {Array.from({length: totalPages}, (_, i) => i + 1).map(p => (
          <button key={p} onClick={() => setPage(p)} style={{
            width:28, height:28, borderRadius:'50%', border:'none',
            background: p === page ? C_BLUE : 'transparent',
            color: p === page ? '#fff' : C_MUTED,
            fontSize:12, fontWeight:600, cursor:'pointer',
            fontFamily:'inherit', fontVariantNumeric:'tabular-nums',
          }}>{p}</button>
        ))}
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={c_phPagerBtn}>
          <IconChevronR size={12}/>
        </button>
      </div>

      <div style={{height:1, background:C_BORDER}}/>

      {/* 수신 상태 도넛 차트 */}
      <div>
        <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:12}}>
          <h2 style={{margin:0, fontSize:14, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>수신 상태</h2>
          <span style={{fontSize:11.5, color:C_MUTED}}>
            {statFilter === 'today' ? '2026-09-17 오늘 기준'
              : statFilter === 'week' ? '이번주 기준'
              : statFilter === 'month' ? '이번달 기준'
              : '2026-09-17일까지의 누적 기준'}
          </span>
          <div style={{flex:1}}/>
          <div style={{display:'flex', gap:5}}>
            {[
              { id:'today',      label:'오늘' },
              { id:'week',       label:'이번주' },
              { id:'month',      label:'이번달' },
              { id:'cumulative', label:'누적' },
            ].map(f => (
              <button key={f.id} onClick={() => setStatFilter(f.id)} style={{
                padding:'4px 12px', fontSize:11.5, fontWeight:600,
                border:`1px solid ${statFilter===f.id ? C_BLUE : C_BORDER}`,
                background: statFilter===f.id ? C_BLUE_SOFT : C_SURFACE,
                color: statFilter===f.id ? C_BLUE : C_MUTED,
                borderRadius:12, cursor:'pointer', fontFamily:'inherit',
              }}>{f.label}</button>
            ))}
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
          <C_PhoneDonutCard title="수신 상태" data={CALL_STATS.status}/>
          <C_PhoneDonutCard title="수신 유형" data={CALL_STATS.kind}/>
        </div>
      </div>
    </div>
  );
}

function C_PhoneDonutCard({ title, data }) {
  const total = data.reduce((a,d) => a + d.value, 0);
  const isEmpty = total === 0;

  return (
    <div style={{
      background:C_SURFACE, borderRadius:10, border:`1px solid ${C_BORDER}`,
      padding:'18px 22px',
    }}>
      <div style={{display:'flex', alignItems:'center', gap:20}}>
        {/* 도넛 SVG */}
        <div style={{position:'relative', width:130, height:130, flexShrink:0}}>
          {isEmpty ? (
            <svg width="130" height="130" viewBox="0 0 130 130">
              <circle cx="65" cy="65" r="52" fill="none" stroke="#E5EAF2" strokeWidth="20"/>
            </svg>
          ) : (
            <svg width="130" height="130" viewBox="0 0 130 130">
              {(() => {
                let acc = 0;
                const r = 52, r2 = 36, cx = 65, cy = 65;
                return data.map(d => {
                  if (!d.value) return null;
                  const pct = d.value / total;
                  const start = acc; acc += pct;
                  const sa = start * 2*Math.PI - Math.PI/2;
                  const ea = acc * 2*Math.PI - Math.PI/2;
                  const large = pct > 0.5 ? 1 : 0;
                  const x1 = cx + r*Math.cos(sa), y1 = cy + r*Math.sin(sa);
                  const x2 = cx + r*Math.cos(ea), y2 = cy + r*Math.sin(ea);
                  const x3 = cx + r2*Math.cos(ea), y3 = cy + r2*Math.sin(ea);
                  const x4 = cx + r2*Math.cos(sa), y4 = cy + r2*Math.sin(sa);
                  return (
                    <path key={d.label}
                      d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${r2} ${r2} 0 ${large} 0 ${x4} ${y4} Z`}
                      fill={d.color}/>
                  );
                });
              })()}
            </svg>
          )}
          <div style={{position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', textAlign:'center'}}>
            <div style={{fontSize:11.5, color:C_MUTED, fontWeight:600}}>{title}</div>
            <div style={{fontSize:18, fontWeight:700, color:C_INK, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em', marginTop:2}}>
              {total}건
            </div>
          </div>
        </div>

        {/* 레전드 */}
        <div style={{flex:1, display:'flex', flexDirection:'column', gap:8}}>
          {data.map(d => (
            <div key={d.label} style={{display:'flex', alignItems:'center', gap:8}}>
              <span style={{width:8, height:8, borderRadius:'50%', background:d.color, flexShrink:0}}/>
              <span style={{fontSize:12, color:C_INK, fontWeight:500, flex:1}}>{d.label}</span>
              <span style={{fontSize:12.5, color:C_INK, fontWeight:700, fontVariantNumeric:'tabular-nums'}}>{d.value}건</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 연동 결과 모달 ───
function C_ConnectResultModal({ state, onClose }) {
  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(11,20,37,0.5)',
      zIndex:220, display:'flex', alignItems:'center', justifyContent:'center', padding:20,
    }}>
      <div style={{
        width:340, background:C_SURFACE, borderRadius:14,
        boxShadow:'0 24px 64px rgba(11,20,37,0.28)',
        padding:'26px 24px', textAlign:'center',
      }}>
        {state === 'loading' ? (
          <>
            <div style={{
              width:52, height:52, margin:'0 auto 16px', borderRadius:'50%',
              border:`4px solid ${C_BLUE_SOFT}`, borderTopColor: C_BLUE,
              animation:'phSpin 0.8s linear infinite',
            }}/>
            <div style={{fontSize:15, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>연동 중입니다</div>
            <div style={{fontSize:12, color:C_MUTED, marginTop:6}}>잠시만 기다려주세요...</div>
            <style>{`@keyframes phSpin { to { transform: rotate(360deg); } }`}</style>
          </>
        ) : (
          <>
            <div style={{
              width:56, height:56, margin:'0 auto 16px', borderRadius:'50%',
              background:'#D1FAE5', color:'#059669',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <IconCheck size={26}/>
            </div>
            <div style={{fontSize:16, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>연동되었습니다</div>
            <div style={{fontSize:12.5, color:C_MUTED, marginTop:6, lineHeight:1.5}}>
              전화 연동이 완료되었습니다.<br/>
              이제 인입되는 통화가 자동으로 기록됩니다.
            </div>
            <button onClick={onClose} style={{
              marginTop:20, padding:'9px 26px',
              background:'linear-gradient(135deg, #6D28D9, #7C3AED)', color:'#fff',
              border:'none', borderRadius:20, fontSize:13, fontWeight:700, cursor:'pointer',
              fontFamily:'inherit', boxShadow:'0 2px 6px rgba(124,58,237,0.35)',
            }}>확인</button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── 고객 상세 팝오버 ───
function C_CustomerPopover({ customer, onClose }) {
  // 목업 시술 이력
  const history = [
    { date:'2026-09-11', menu:'루트터치업', designer:'문지윤', amount:70000 },
    { date:'2026-08-22', menu:'헤어스파 + 뿌리염색', designer:'문지윤', amount:130000 },
    { date:'2026-07-18', menu:'남자컷', designer:'이상현', amount:8000 },
    { date:'2026-06-05', menu:'디지털펌', designer:'문지윤', amount:180000 },
  ];
  const totalSpent = history.reduce((a,h) => a + h.amount, 0);

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(11,20,37,0.5)',
      zIndex:220, display:'flex', alignItems:'center', justifyContent:'center', padding:20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width:560, maxHeight:'88vh', background:C_SURFACE, borderRadius:14,
        boxShadow:'0 24px 64px rgba(11,20,37,0.28)',
        display:'flex', flexDirection:'column', overflow:'hidden',
      }}>
        {/* 상단 요약 */}
        <div style={{padding:'18px 22px 14px', borderBottom:`1px solid ${C_BORDER}`, display:'flex', alignItems:'center', gap:14}}>
          <div style={{
            width:48, height:48, borderRadius:'50%',
            background:`linear-gradient(135deg, ${C_BLUE}, #7C3AED)`, color:'#fff',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:18, fontWeight:700,
          }}>{customer.customer.charAt(0)}</div>
          <div style={{flex:1}}>
            <div style={{display:'flex', alignItems:'center', gap:6}}>
              <div style={{fontSize:16, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>{customer.customer}</div>
              {customer.grade && (
                <span style={{
                  fontSize:10, fontWeight:700, color:'#D97706',
                  background:'#FEF3C7', padding:'2px 7px', borderRadius:10,
                }}>{customer.grade}</span>
              )}
            </div>
            <div style={{fontSize:12, color:C_MUTED, marginTop:3, fontVariantNumeric:'tabular-nums'}}>
              {customer.phone}
            </div>
          </div>
          <button onClick={onClose} style={{
            width:28, height:28, borderRadius:7, border:'none',
            background:'transparent', color:C_MUTED, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}><IconX size={16}/></button>
        </div>

        {/* KPI */}
        <div style={{
          padding:'14px 22px', display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12,
          borderBottom:`1px solid ${C_BORDER}`, background:'#FBFCFE',
        }}>
          <div>
            <div style={{fontSize:10.5, color:C_MUTED, fontWeight:600, letterSpacing:'0.02em'}}>총 방문</div>
            <div style={{fontSize:16, fontWeight:700, color:C_INK, marginTop:3, fontVariantNumeric:'tabular-nums'}}>{history.length}회</div>
          </div>
          <div>
            <div style={{fontSize:10.5, color:C_MUTED, fontWeight:600, letterSpacing:'0.02em'}}>총 사용</div>
            <div style={{fontSize:16, fontWeight:700, color:C_INK, marginTop:3, fontVariantNumeric:'tabular-nums'}}>₩ {new Intl.NumberFormat('ko-KR').format(totalSpent)}</div>
          </div>
          <div>
            <div style={{fontSize:10.5, color:C_MUTED, fontWeight:600, letterSpacing:'0.02em'}}>주 담당</div>
            <div style={{fontSize:14, fontWeight:700, color:C_INK, marginTop:3}}>{customer.designer !== '미지정' ? customer.designer : '문지윤'}</div>
          </div>
        </div>

        {/* 메모 */}
        <div style={{padding:'14px 22px', borderBottom:`1px solid ${C_BORDER}`}}>
          <div style={{fontSize:11, color:C_MUTED, fontWeight:700, letterSpacing:'0.02em', marginBottom:6}}>메모</div>
          <div style={{
            padding:'10px 12px', background:'#FEF3C7', borderRadius:8, border:'1px solid #FCE9B8',
            fontSize:12.5, color:C_INK, lineHeight:1.5,
          }}>
            알러지 있음. 뿌리염색 시 두피 자극 최소화 필요. 예약 리마인드 필수.
          </div>
        </div>

        {/* 시술 이력 */}
        <div style={{padding:'14px 22px', flex:1, overflowY:'auto'}}>
          <div style={{fontSize:11, color:C_MUTED, fontWeight:700, letterSpacing:'0.02em', marginBottom:8}}>최근 시술 이력</div>
          <div style={{background:C_SURFACE, borderRadius:8, border:`1px solid ${C_BORDER}`, overflow:'hidden'}}>
            {history.map((h, i) => (
              <div key={i} style={{
                display:'grid', gridTemplateColumns:'92px 1fr 80px 90px',
                padding:'10px 14px', alignItems:'center',
                borderTop: i > 0 ? `1px solid ${C_BORDER}` : 'none',
                fontSize:12,
              }}>
                <div style={{color:C_MUTED, fontVariantNumeric:'tabular-nums'}}>{h.date}</div>
                <div style={{color:C_INK, fontWeight:500}}>{h.menu}</div>
                <div style={{color:C_MUTED}}>{h.designer}</div>
                <div style={{color:C_INK, fontWeight:600, fontVariantNumeric:'tabular-nums', textAlign:'right'}}>
                  ₩{new Intl.NumberFormat('ko-KR').format(h.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 푸터 */}
        <div style={{padding:'12px 22px', borderTop:`1px solid ${C_BORDER}`, background:'#FBFCFE', display:'flex', gap:8, justifyContent:'flex-end'}}>
          <button onClick={onClose} style={{...c_ghostBtn, padding:'9px 16px'}}>닫기</button>
          <button style={{
            padding:'9px 18px', background:C_SURFACE, color:C_INK,
            border:`1px solid ${C_BORDER}`, borderRadius:7, fontSize:12.5, fontWeight:600,
            cursor:'pointer', display:'inline-flex', alignItems:'center', gap:5, fontFamily:'inherit',
          }}>
            <IconUser size={12}/> 고객 상세로 이동
          </button>
          <button style={{
            padding:'9px 22px', background:C_BLUE, color:'#fff',
            border:'none', borderRadius:7, fontSize:13, fontWeight:600, cursor:'pointer',
            boxShadow:'0 1px 2px rgba(30,64,175,0.2)', fontFamily:'inherit',
          }}>새 예약 만들기</button>
        </div>
      </div>
    </div>
  );
}

// ─── styles ───
const c_phLabel = {
  width:86, flexShrink:0,
  fontSize:12.5, color:C_INK, fontWeight:600,
};
const c_phInput = {
  flex:1, height:36, padding:'0 14px',
  border:`1px solid ${C_BORDER}`, borderRadius:20,
  fontSize:12.5, background:C_SURFACE, outline:'none',
  fontFamily:'inherit', boxSizing:'border-box',
};
const c_phSelect = {
  ...c_phInput, cursor:'pointer',
  appearance:'none', WebkitAppearance:'none',
  paddingRight:32,
  backgroundImage:`url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235C6B84' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>")`,
  backgroundRepeat:'no-repeat',
  backgroundPosition:'right 12px center',
};
const c_phRowBtn = {
  padding:'4px 12px', border:`1px solid ${C_BORDER}`, borderRadius:12,
  background:C_SURFACE, color:C_MUTED, cursor:'pointer',
  fontSize:11, fontWeight:600, fontFamily:'inherit',
};
const c_phPagerBtn = {
  width:28, height:28, borderRadius:'50%', border:'none',
  background:'transparent', color:C_MUTED, cursor:'pointer',
  display:'inline-flex', alignItems:'center', justifyContent:'center',
};

window.C_PhonePage = C_PhonePage;
