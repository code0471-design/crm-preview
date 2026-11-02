// 설정 › 단말기 설정 — 연동, 인쇄, 승인 내역

const {
  C_BLUE, C_INK, C_MUTED, C_BORDER, C_BG, C_SURFACE,
} = window;

const TERM_VANS = ['VAN 결제', '단독 결제'];
const TERM_KINDS = ['네이버', '나이스', 'KIS', 'KSNET', '스마트로'];
const TERM_PORTS = ['', 'COM1', 'COM2', 'COM3', 'USB'];
const TERM_SPEEDS = ['', '9600', '19200', '38400', '115200'];

const TERM_APPROVALS = [
  { at:'2026-09-21 10:00', customer:'박서연', amount:70000, issuer:'신한', no:'48120933', kind:'연동' },
  { at:'2026-09-19 15:10', customer:'조유진', amount:45000, issuer:'삼성', no:'22918470', kind:'연동' },
  { at:'2026-09-11 11:00', customer:'강수현', amount:70000, issuer:'삼성', no:'10448291', kind:'단독' },
  { at:'2026-09-11 15:30', customer:'김도윤', amount:300000, issuer:'BC', no:'90221467', kind:'연동' },
  { at:'2026-09-11 10:00', customer:'이하늘', amount:180000, issuer:'현대', no:'77304126', kind:'연동' },
];

const termField = {
  height:36, padding:'0 12px', width:'100%', boxSizing:'border-box',
  border:`1px solid ${C_BORDER}`, borderRadius:8,
  background:C_SURFACE, color:C_INK, fontSize:13, fontFamily:'inherit', outline:'none',
};

function termWon(n) {
  return new Intl.NumberFormat('ko-KR').format(n || 0);
}

function TermSwitch({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} aria-pressed={on} style={{
      width:36, height:20, borderRadius:10, border:'none', padding:0, cursor:'pointer', flexShrink:0,
      background: on ? C_BLUE : '#E5E7EB', position:'relative',
    }}>
      <span style={{
        position:'absolute', top:2, left: on ? 18 : 2, width:16, height:16, borderRadius:'50%',
        background:'#fff', boxShadow:'0 1px 2px rgba(11,20,37,0.18)',
      }}/>
    </button>
  );
}

function TermLine({ label, on, onChange }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:12, minHeight:32}}>
      <span style={{fontSize:13, fontWeight:600, color:C_INK}}>{label}</span>
      <TermSwitch on={on} onChange={onChange}/>
    </div>
  );
}

function C_TermSettingsPage() {
  const [view, setView] = React.useState('print');
  const [use, setUse] = React.useState(true);
  const [pad, setPad] = React.useState(false);
  const [biz, setBiz] = React.useState('865-12-01847');
  const [van, setVan] = React.useState('VAN 결제');
  const [tid, setTid] = React.useState('');
  const [kind, setKind] = React.useState('네이버');
  const [port, setPort] = React.useState('');
  const [speed, setSpeed] = React.useState('');
  const [custPrint, setCustPrint] = React.useState(true);
  const [point, setPoint] = React.useState(false);
  const [prepaid, setPrepaid] = React.useState(false);
  const [ticket, setTicket] = React.useState(false);
  const [footer, setFooter] = React.useState('');
  const [storeCopy, setStoreCopy] = React.useState(true);
  const [grade, setGrade] = React.useState(false);
  const [hq, setHq] = React.useState(false);

  const save = () => {
    if (use && !tid.trim()) {
      if (window.__toast) window.__toast('단말기 번호를 입력해 주세요.');
      return;
    }
    if (window.__toast) window.__toast('단말기 설정을 저장했어요.');
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
            설정 <span style={{margin:'0 6px'}}>›</span>
            <span style={{color:C_INK, fontWeight:600}}>단말기 설정</span>
            <span style={{margin:'0 6px'}}>›</span>
            <span style={{color:C_INK, fontWeight:600}}>{view === 'print' ? '인쇄 설정' : '승인 내역'}</span>
          </div>
          <div style={{flex:1}}/>
          <div style={{display:'flex', background:C_BG, borderRadius:20, padding:3, border:`1px solid ${C_BORDER}`}}>
            {[
              { id:'approval', label:'승인 내역' },
              { id:'print', label:'인쇄 설정' },
            ].map(t => (
              <button key={t.id} onClick={() => setView(t.id)} style={{
                padding:'5px 14px', fontSize:12.5, fontWeight:700, border:'none', borderRadius:16,
                cursor:'pointer', fontFamily:'inherit',
                background: view === t.id ? C_BLUE : 'transparent',
                color: view === t.id ? '#fff' : C_MUTED,
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        <div style={{flex:1, overflow:'auto', padding:'18px 20px 24px'}}>
          {view === 'print' && (
            <div style={{background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:12, padding:'18px 20px 20px'}}>
              <div style={{fontSize:14, fontWeight:800, color:C_INK, marginBottom:14}}>단말기 연동 설정</div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px 48px'}}>
                <div style={{display:'flex', flexDirection:'column', gap:12}}>
                  <TermLine label="사용 여부" on={use} onChange={setUse}/>
                  <div style={{display:'flex', flexDirection:'column', gap:12, opacity: use ? 1 : 0.4, pointerEvents: use ? 'auto' : 'none'}}>
                    <TermLine label="멀티패드 사용 여부" on={pad} onChange={setPad}/>
                    <label style={{display:'flex', flexDirection:'column', gap:6}}>
                      <span style={{fontSize:12.5, fontWeight:700, color:C_INK}}>사업자 번호</span>
                      <input value={biz} onChange={e => setBiz(e.target.value)} placeholder="사업자 번호를 입력해 주세요." style={termField}/>
                    </label>
                    <label style={{display:'flex', flexDirection:'column', gap:6}}>
                      <span style={{fontSize:12.5, fontWeight:700, color:C_INK}}>단말기 번호 연동</span>
                      <select value={van} onChange={e => setVan(e.target.value)} style={termField}>
                        {TERM_VANS.map(v => <option key={v}>{v}</option>)}
                      </select>
                      <input value={tid} onChange={e => setTid(e.target.value)} placeholder="VAN-TID 단말기 번호를 입력해 주세요." style={termField}/>
                    </label>
                  </div>
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:12, opacity: use ? 1 : 0.4, pointerEvents: use ? 'auto' : 'none'}}>
                  <label style={{display:'flex', flexDirection:'column', gap:6}}>
                    <span style={{fontSize:12.5, fontWeight:700, color:C_INK}}>카드 단말기 종류</span>
                    <select value={kind} onChange={e => setKind(e.target.value)} style={termField}>
                      {TERM_KINDS.map(v => <option key={v}>{v}</option>)}
                    </select>
                  </label>
                  <div style={{display:'flex', flexDirection:'column', gap:6}}>
                    <span style={{fontSize:12.5, fontWeight:700, color:C_INK}}>포트 및 속도 설정</span>
                    <select value={port} onChange={e => setPort(e.target.value)} style={termField}>
                      <option value="">포트 선택</option>
                      {TERM_PORTS.filter(Boolean).map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                    <select value={speed} onChange={e => setSpeed(e.target.value)} style={termField}>
                      <option value="">선택</option>
                      {TERM_SPEEDS.filter(Boolean).map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                    <div style={{fontSize:11.5, color:C_MUTED, lineHeight:1.45}}>미 선택 시 포트 1번, 통신 속도 19200으로 설정됩니다.</div>
                  </div>
                </div>
              </div>

              <div style={{height:1, borderTop:`1px dashed ${C_BORDER}`, margin:'20px 0 16px'}}/>

              <div style={{fontSize:14, fontWeight:800, color:C_INK, marginBottom:14}}>단말기 인쇄 설정</div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px 48px', alignItems:'start'}}>
                <div style={{display:'flex', flexDirection:'column', gap:12}}>
                  <TermLine label="고객용 출력 여부 확인" on={custPrint} onChange={setCustPrint}/>
                  <TermLine label="고객 포인트 출력" on={point} onChange={setPoint}/>
                  <TermLine label="정액권 정보 출력" on={prepaid} onChange={setPrepaid}/>
                  <TermLine label="티켓권 정보 출력" on={ticket} onChange={setTicket}/>
                  <label style={{display:'flex', flexDirection:'column', gap:6, marginTop:4}}>
                    <span style={{fontSize:12.5, fontWeight:700, color:C_INK}}>하단 문구</span>
                    <textarea
                      value={footer}
                      maxLength={500}
                      onChange={e => setFooter(e.target.value.slice(0, 500))}
                      placeholder="고객이 확인하는 문구를 입력해 주세요."
                      rows={4}
                      style={{...termField, height:'auto', padding:'8px 12px', resize:'vertical', lineHeight:1.5}}
                    />
                    <div style={{textAlign:'right', fontSize:11, color:C_MUTED, fontVariantNumeric:'tabular-nums'}}>{footer.length}/500</div>
                  </label>
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:12}}>
                  <TermLine label="매장 보관용 출력 여부" on={storeCopy} onChange={setStoreCopy}/>
                  <TermLine label="고객 등급 정보 출력" on={grade} onChange={setGrade}/>
                  <TermLine label="본사명 출력 여부" on={hq} onChange={setHq}/>
                </div>
              </div>
            </div>
          )}

          {view === 'approval' && <C_TermApprovalList/>}
        </div>

        {view === 'print' && (
          <div style={{
            padding:'12px 20px', borderTop:`1px solid ${C_BORDER}`, background:C_SURFACE,
            display:'flex', justifyContent:'flex-end',
          }}>
            <button onClick={save} style={{
              padding:'9px 22px', background:C_BLUE, color:'#fff', border:'none', borderRadius:8,
              fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
            }}>저장하기</button>
          </div>
        )}
      </div>
    </div>
  );
}

function C_TermApprovalList() {
  const cols = '150px 1fr 110px 80px 110px 70px';
  return (
    <div style={{background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:12, overflow:'hidden'}}>
      <div style={{padding:'14px 16px', fontSize:14, fontWeight:800, color:C_INK}}>승인 내역</div>
      <div style={{
        display:'grid', gridTemplateColumns:cols, padding:'8px 16px', background:'#FBFCFE',
        borderTop:`1px solid ${C_BORDER}`, fontSize:11, fontWeight:700, color:C_MUTED,
      }}>
        <div>일시</div><div>고객</div>
        <div style={{textAlign:'right'}}>금액</div>
        <div style={{textAlign:'center'}}>카드사</div>
        <div style={{textAlign:'right'}}>승인번호</div>
        <div style={{textAlign:'right'}}>구분</div>
      </div>
      {TERM_APPROVALS.map(r => (
        <div key={r.no} style={{
          display:'grid', gridTemplateColumns:cols, padding:'12px 16px', alignItems:'center',
          borderTop:`1px solid ${C_BORDER}`, fontSize:13, color:C_INK,
        }}>
          <div style={{fontVariantNumeric:'tabular-nums'}}>{r.at}</div>
          <div style={{fontWeight:600}}>{r.customer}</div>
          <div style={{textAlign:'right', fontWeight:700, fontVariantNumeric:'tabular-nums'}}>{termWon(r.amount)}원</div>
          <div style={{textAlign:'center', color:C_MUTED}}>{r.issuer}</div>
          <div style={{textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{r.no}</div>
          <div style={{textAlign:'right', fontWeight:700, color: r.kind === '단독' ? '#6D28D9' : C_BLUE}}>{r.kind}</div>
        </div>
      ))}
    </div>
  );
}

window.C_TermSettingsPage = C_TermSettingsPage;
