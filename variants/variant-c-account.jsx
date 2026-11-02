// 헤더 매장명 › 계정 정보 / 구독 / 사용료 청구

const {
  C_BLUE, C_BLUE_SOFT, C_INK, C_MUTED, C_BORDER, C_BG, C_SURFACE,
  c_ghostBtn,
} = window;

const ACCOUNT_ADDRS = [
  '인천광역시 부평구 부평대로 168',
  '인천광역시 부평구 경원대로 1402',
  '인천광역시 부평구 마장로 42',
];

const ACCOUNT_BILLS = [
  { date:'2026-09-01', name:'9월 매장 사용료', amount:49000, method:'카드', status:'결제완료' },
  { date:'2026-08-01', name:'8월 매장 사용료', amount:49000, method:'카드', status:'결제완료' },
  { date:'2026-07-01', name:'7월 매장 사용료', amount:49000, method:'카드', status:'결제완료' },
  { date:'2026-06-01', name:'6월 매장 사용료', amount:49000, method:'카드', status:'결제완료' },
];

function accountWon(n) {
  return new Intl.NumberFormat('ko-KR').format(n || 0);
}

const accInput = {
  height:34, padding:'0 12px', width:'100%', boxSizing:'border-box',
  border:`1px solid ${C_BORDER}`, borderRadius:8,
  fontSize:13, background:C_SURFACE, color:C_INK, fontFamily:'inherit', outline:'none',
};

function AccRow({ label, required, children, top }) {
  return (
    <div style={{display:'grid', gridTemplateColumns:'108px 1fr', alignItems: top ? 'start' : 'center', gap:12}}>
      <div style={{fontSize:12.5, fontWeight:700, color:C_INK, paddingTop: top ? 8 : 0}}>
        {label}{required && <span style={{color:'#EF4444'}}> *</span>}
      </div>
      <div style={{minWidth:0}}>{children}</div>
    </div>
  );
}

function C_AccountPage() {
  const [tab, setTab] = React.useState(() => window.ACCOUNT_TAB || 'info');
  const [photo, setPhoto] = React.useState('');
  const [owner, setOwner] = React.useState('문지윤');
  const [biz, setBiz] = React.useState('865-12-01847');
  const [verified, setVerified] = React.useState(true);
  const [tel, setTel] = React.useState('032-505-1122');
  const [addr, setAddr] = React.useState('인천광역시 부평구 부평대로 168');
  const [addrOpen, setAddrOpen] = React.useState(false);
  const [detail, setDetail] = React.useState('부평본점 3층');
  const [desc, setDesc] = React.useState('');
  const [pwOpen, setPwOpen] = React.useState(false);
  const fileRef = React.useRef(null);

  React.useEffect(() => {
    window.__accountJump = setTab;
    return () => { if (window.__accountJump === setTab) delete window.__accountJump; };
  }, []);

  const readPhoto = (file) => {
    if (!file || !file.type || file.type.indexOf('image/') !== 0) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const save = () => {
    if (!owner.trim() || !biz.trim() || !tel.trim()) {
      if (window.__toast) window.__toast('대표자, 사업자 번호, 매장 번호를 입력해 주세요.');
      return;
    }
    if (window.__toast) window.__toast('계정 정보를 저장했어요.');
  };

  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden', background:C_BG}}>
      <div style={{width:948, flexShrink:0, flex:1, display:'flex', flexDirection:'column', minHeight:0}}>
        <div style={{
          display:'flex', alignItems:'center', gap:8,
          padding:'10px 14px', background:C_SURFACE, borderBottom:`1px solid ${C_BORDER}`,
        }}>
          <div style={{fontSize:12.5, color:C_MUTED, flexShrink:0}}>
            홈 <span style={{margin:'0 6px'}}>›</span>
            <span style={{color:C_INK, fontWeight:600}}>계정 정보</span>
          </div>
          <div style={{flex:1}}/>
          <div style={{display:'flex', background:C_BG, borderRadius:20, padding:3, border:`1px solid ${C_BORDER}`}}>
            {[
              { id:'info', label:'계정 정보' },
              { id:'plan', label:'구독 관리' },
              { id:'pay', label:'결제 관리' },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding:'5px 14px', fontSize:12.5, fontWeight:700, border:'none', borderRadius:16,
                cursor:'pointer', fontFamily:'inherit',
                background: tab === t.id ? C_SURFACE : 'transparent',
                color: tab === t.id ? C_INK : C_MUTED,
                boxShadow: tab === t.id ? '0 1px 2px rgba(11,20,37,0.08)' : 'none',
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        <div style={{flex:1, overflow:'auto', padding:'18px 20px 24px'}}>
          {tab === 'info' && (
            <div style={{background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:12, padding:'20px 20px 8px'}}>
              <div style={{display:'grid', gridTemplateColumns:'200px 1fr', gap:28, alignItems:'start'}}>
                <div>
                  <div style={{fontSize:12.5, fontWeight:700, color:C_INK, marginBottom:8}}>매장 사진</div>
                  <div
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); readPhoto(e.dataTransfer.files && e.dataTransfer.files[0]); }}
                    style={{
                      width:168, height:168, borderRadius:12, overflow:'hidden',
                      background:'#EEF1F6', border:`1px solid ${C_BORDER}`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                    }}
                  >
                    {photo
                      ? <img src={photo} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                      : <span style={{fontSize:28, fontWeight:800, color:'#94A3B8', letterSpacing:'-0.04em'}}>KK</span>}
                  </div>
                  <div style={{
                    marginTop:10, width:168, boxSizing:'border-box',
                    border:`1px dashed ${C_BORDER}`, borderRadius:10, padding:'10px 10px 12px',
                    background:'#FBFCFE', textAlign:'center',
                  }}>
                    <div style={{fontSize:11, color:C_MUTED, lineHeight:1.45}}>400×400px, JPG / PNG<br/>버튼을 누르거나 끌어다 놓으세요.</div>
                    <input ref={fileRef} type="file" accept="image/jpeg,image/png" style={{display:'none'}} onChange={e => readPhoto(e.target.files && e.target.files[0])}/>
                    <button onClick={() => fileRef.current && fileRef.current.click()} style={{...c_ghostBtn, marginTop:8, height:30, fontSize:12}}>
                      이미지 불러오기
                    </button>
                    {photo && (
                      <button onClick={() => setPhoto('')} style={{
                        marginTop:4, border:'none', background:'transparent', color:'#DC2626',
                        fontSize:11.5, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                      }}>사진 삭제</button>
                    )}
                  </div>
                </div>

                <div style={{display:'flex', flexDirection:'column', gap:12, paddingBottom:12}}>
                  <AccRow label="매장명"><span style={{fontSize:13.5, fontWeight:700, color:C_INK}}>카이키키 부평본점</span></AccRow>
                  <AccRow label="브랜드"><span style={{fontSize:13.5, fontWeight:600, color:C_INK}}>카이키키</span></AccRow>
                  <AccRow label="비밀번호">
                    <div style={{display:'flex', alignItems:'center', gap:8}}>
                      <div style={{
                        height:34, minWidth:120, padding:'0 14px', borderRadius:17,
                        background:'#F1F5F9', color:C_MUTED, display:'inline-flex', alignItems:'center',
                        fontSize:14, letterSpacing:'0.12em', fontWeight:700,
                      }}>••••</div>
                      <button onClick={() => setPwOpen(true)} style={{
                        height:34, padding:'0 12px', border:'none', borderRadius:8, cursor:'pointer',
                        background:C_BLUE, color:'#fff', fontSize:12.5, fontWeight:700, fontFamily:'inherit',
                      }}>비밀번호 변경</button>
                    </div>
                  </AccRow>
                  <AccRow label="매장 대표자" required>
                    <input value={owner} onChange={e => setOwner(e.target.value)} style={accInput}/>
                  </AccRow>
                  <AccRow label="사업자 번호" required>
                    <div style={{display:'flex', alignItems:'center', gap:8}}>
                      <input value={biz} onChange={e => { setBiz(e.target.value); setVerified(false); }} style={{...accInput, maxWidth:180}}/>
                      {verified && (
                        <span style={{
                          width:18, height:18, borderRadius:'50%', background:'#059669', color:'#fff',
                          display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                        }}><IconCheck size={11} stroke={3}/></span>
                      )}
                      <button onClick={() => { setVerified(true); if (window.__toast) window.__toast('사업자 번호를 확인했어요.'); }} style={{
                        height:34, padding:'0 12px', border:'none', borderRadius:8, cursor:'pointer', flexShrink:0,
                        background:C_BLUE, color:'#fff', fontSize:12.5, fontWeight:700, fontFamily:'inherit',
                      }}>재인증</button>
                    </div>
                  </AccRow>
                  <AccRow label="매장 번호" required>
                    <input value={tel} onChange={e => setTel(e.target.value)} style={{...accInput, maxWidth:180}}/>
                  </AccRow>
                  <AccRow label="매장 주소">
                    <div style={{position:'relative', display:'flex', alignItems:'center', gap:8}}>
                      <input value={addr} onChange={e => setAddr(e.target.value)} style={accInput}/>
                      <button onClick={() => setAddrOpen(v => !v)} title="주소 검색" style={{
                        width:34, height:34, flexShrink:0, borderRadius:8, cursor:'pointer',
                        border:`1px solid ${C_BORDER}`, background:C_SURFACE, color:C_BLUE,
                        display:'inline-flex', alignItems:'center', justifyContent:'center',
                      }}><IconSearch size={14}/></button>
                      {addrOpen && (
                        <div style={{
                          position:'absolute', top:'calc(100% + 6px)', left:0, right:42, zIndex:5,
                          background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:8,
                          boxShadow:'0 8px 20px rgba(11,20,37,0.12)', overflow:'hidden',
                        }}>
                          {ACCOUNT_ADDRS.map(a => (
                            <button key={a} onClick={() => { setAddr(a); setAddrOpen(false); }} style={{
                              display:'block', width:'100%', textAlign:'left', border:'none',
                              borderBottom:`1px solid ${C_BORDER}`, background:C_SURFACE,
                              padding:'9px 12px', cursor:'pointer', fontFamily:'inherit',
                              fontSize:12.5, color:C_INK,
                            }}>{a}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </AccRow>
                  <AccRow label="상세 주소">
                    <input value={detail} onChange={e => setDetail(e.target.value)} style={accInput}/>
                  </AccRow>
                  <AccRow label="매장 설명" top>
                    <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4} placeholder="매장 소개를 입력해 주세요." style={{
                      ...accInput, height:'auto', padding:'8px 12px', resize:'vertical', lineHeight:1.5,
                    }}/>
                  </AccRow>
                </div>
              </div>
            </div>
          )}

          {tab === 'plan' && <C_AccountPlan/>}
          {tab === 'pay' && <C_AccountBills/>}
        </div>

        {tab === 'info' && (
          <div style={{
            padding:'12px 20px', borderTop:`1px solid ${C_BORDER}`, background:C_SURFACE,
            display:'flex', justifyContent:'flex-end',
          }}>
            <button onClick={save} style={{
              padding:'9px 22px', background:C_BLUE, color:'#fff', border:'none', borderRadius:8,
              fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
            }}>저장</button>
          </div>
        )}
      </div>
      {pwOpen && <C_PasswordModal onClose={() => setPwOpen(false)}/>}
    </div>
  );
}

function C_AccountPlan() {
  const rows = [
    ['요금제', '매장 기본'],
    ['상태', '이용 중'],
    ['이번 기간', '2026.09.01 – 2026.09.30'],
    ['월 사용료', '49,000원'],
    ['다음 결제일', '2026.10.01'],
    ['포함', '예약, 매출, 고객, 문자 기본 발송'],
  ];
  return (
    <div style={{background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:12, padding:'18px 20px'}}>
      <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:14}}>
        <div style={{fontSize:15, fontWeight:800, color:C_INK}}>구독</div>
        <span style={{fontSize:11, fontWeight:800, color:'#047857', background:'#D1FAE5', padding:'2px 8px', borderRadius:10}}>이용 중</span>
      </div>
      {rows.map(([k, v]) => (
        <div key={k} style={{display:'grid', gridTemplateColumns:'108px 1fr', gap:12, padding:'10px 0', borderTop:`1px solid ${C_BORDER}`}}>
          <div style={{fontSize:12.5, fontWeight:700, color:C_MUTED}}>{k}</div>
          <div style={{fontSize:13.5, fontWeight:700, color:C_INK}}>{v}</div>
        </div>
      ))}
    </div>
  );
}

function C_AccountBills() {
  return (
    <div style={{background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:12, overflow:'hidden'}}>
      <div style={{padding:'14px 16px', fontSize:15, fontWeight:800, color:C_INK}}>사용료 청구 내역</div>
      <div style={{
        display:'grid', gridTemplateColumns:'120px 1fr 120px 80px 90px',
        padding:'8px 16px', background:'#FBFCFE', borderTop:`1px solid ${C_BORDER}`,
        fontSize:11, fontWeight:700, color:C_MUTED,
      }}>
        <div>청구일</div><div>항목</div><div style={{textAlign:'right'}}>금액</div><div style={{textAlign:'center'}}>수단</div><div style={{textAlign:'right'}}>상태</div>
      </div>
      {ACCOUNT_BILLS.map(b => (
        <div key={b.date} style={{
          display:'grid', gridTemplateColumns:'120px 1fr 120px 80px 90px',
          padding:'12px 16px', alignItems:'center', borderTop:`1px solid ${C_BORDER}`, fontSize:13, color:C_INK,
        }}>
          <div style={{fontVariantNumeric:'tabular-nums'}}>{b.date}</div>
          <div style={{fontWeight:600}}>{b.name}</div>
          <div style={{textAlign:'right', fontWeight:700, fontVariantNumeric:'tabular-nums'}}>{accountWon(b.amount)}원</div>
          <div style={{textAlign:'center', color:C_MUTED}}>{b.method}</div>
          <div style={{textAlign:'right', color:'#047857', fontWeight:700}}>{b.status}</div>
        </div>
      ))}
    </div>
  );
}

function C_PasswordModal({ onClose }) {
  const [cur, setCur] = React.useState('');
  const [next, setNext] = React.useState('');
  const [again, setAgain] = React.useState('');
  const [error, setError] = React.useState('');
  const save = () => {
    if (!cur || !next) { setError('현재 비밀번호와 새 비밀번호를 입력해 주세요.'); return; }
    if (next !== again) { setError('새 비밀번호가 서로 달라요.'); return; }
    if (window.__toast) window.__toast('비밀번호를 바꿨어요.');
    onClose();
  };
  const field = (label, value, setValue) => (
    <div>
      <div style={{fontSize:12, fontWeight:700, color:C_INK, marginBottom:6}}>{label}</div>
      <input type="password" value={value} onChange={e => { setValue(e.target.value); setError(''); }} style={accInput}/>
    </div>
  );
  return (
    <div onClick={onClose} style={{position:'fixed', inset:0, background:'rgba(11,20,37,0.4)', zIndex:260, display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div onClick={e => e.stopPropagation()} style={{width:360, background:C_SURFACE, borderRadius:12, boxShadow:'0 16px 48px rgba(11,20,37,0.25)', overflow:'hidden'}}>
        <div style={{padding:'16px 18px 12px', borderBottom:`1px solid ${C_BORDER}`, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div style={{fontSize:15, fontWeight:800, color:C_INK}}>비밀번호 변경</div>
          <button onClick={onClose} style={{border:'none', background:'transparent', color:C_MUTED, cursor:'pointer', display:'flex'}}><IconX size={16}/></button>
        </div>
        <div style={{padding:'16px 18px', display:'flex', flexDirection:'column', gap:12}}>
          {field('현재 비밀번호', cur, setCur)}
          {field('새 비밀번호', next, setNext)}
          {field('새 비밀번호 확인', again, setAgain)}
          {error && <div style={{fontSize:12, fontWeight:700, color:'#DC2626'}}>{error}</div>}
        </div>
        <div style={{padding:'12px 18px', borderTop:`1px solid ${C_BORDER}`, display:'flex', justifyContent:'flex-end', gap:8}}>
          <button onClick={onClose} style={{...c_ghostBtn, padding:'8px 14px'}}>취소</button>
          <button onClick={save} style={{padding:'8px 16px', background:C_BLUE, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit'}}>저장</button>
        </div>
      </div>
    </div>
  );
}

window.C_AccountPage = C_AccountPage;
