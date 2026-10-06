// 마케팅 › 충전관리 — 문자 캐쉬 잔액 · 충전 · 자동 충전 · 충전 내역
const {
  C_BLUE, C_BLUE_SOFT, C_CORAL, C_INK, C_MUTED, C_BORDER, C_BG, C_SURFACE,
  c_ghostBtnSm, MKT_UNIT,
} = window;

const CH_CARDS = [
  { id:'c1', brand:'신한', last:'4047', exp:'08/29', main:true },
  { id:'c2', brand:'국민', last:'1182', exp:'03/28', main:false },
];
const CH_AMOUNTS = [10000, 20000, 30000, 50000, 100000, 200000];
const CH_HISTORY = [
  { id:1, at:'2026-09-03 18:49', kind:'charge', method:'신한 (4890-****-****-4047)', amount:20000, after:20000, status:'성공' },
  { id:2, at:'2026-08-14 11:02', kind:'auto',   method:'신한 (4890-****-****-4047)', amount:40000, after:41230, status:'성공' },
  { id:3, at:'2026-07-28 09:15', kind:'auto',   method:'국민 (9410-****-****-1182)', amount:40000, after:0,     status:'실패', reason:'한도 초과' },
  { id:4, at:'2026-07-02 16:40', kind:'charge', method:'신한 (4890-****-****-4047)', amount:50000, after:52880, status:'성공' },
  { id:5, at:'2026-06-11 13:27', kind:'refund', method:'신한 (4890-****-****-4047)', amount:-10000, after:18200, status:'환불' },
];
const chWon = (n) => n.toLocaleString() + '원';

function C_MktChargePage() {
  const [balance, setBalance] = React.useState(17486);
  const [history, setHistory] = React.useState(CH_HISTORY);
  const [auto, setAuto] = React.useState({ on:false, below:20000, amount:40000, card:'c1' });
  const [autoSaved, setAutoSaved] = React.useState(auto);
  const [chargeOpen, setChargeOpen] = React.useState(false);
  const [cardsOpen, setCardsOpen] = React.useState(false);
  const [filter, setFilter] = React.useState('all');
  const [toast, setToast] = React.useState(null);
  React.useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2200); return () => clearTimeout(t); }, [toast]);

  const dirty = JSON.stringify(auto) !== JSON.stringify(autoSaved);
  const cardLabel = (id) => { const c = CH_CARDS.find(x => x.id === id); return c ? `${c.brand} (${c.last.padStart(4,'*')})` : ''; };
  const rows = history.filter(h => filter === 'all' || (filter === 'charge' ? h.kind !== 'refund' : h.kind === filter));
  const low = balance < 20000;

  // 최근 30일 사용 추정 (목업)
  const used30 = 26840;
  const daysLeft = Math.max(1, Math.round(balance / (used30 / 30)));

  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden', background:C_BG}}>
      <div style={{width:948, flexShrink:0, flex:1, display:'flex', flexDirection:'column', minHeight:0}}>
        {/* 서브헤더 */}
        <div style={{display:'flex', alignItems:'center', gap:8, padding:'0 14px', height:49, background:C_SURFACE, borderBottom:`1px solid ${C_BORDER}`, flexShrink:0}}>
          <div style={{fontSize:12.5, color:C_MUTED}}>
            홈 <span style={{margin:'0 6px'}}>›</span>마케팅<span style={{margin:'0 6px'}}>›</span>
            <span style={{color:C_INK, fontWeight:600}}>충전관리</span>
          </div>
          <div style={{flex:1}}/>
          <button onClick={() => setCardsOpen(true)} style={{...c_ghostBtnSm, fontFamily:'inherit'}}>결제 수단 관리</button>
        </div>

        <div className="mkt-scroll" style={{flex:1, overflow:'auto', padding:'18px 20px 24px', display:'flex', flexDirection:'column', gap:14}}>
          <style>{`.mkt-scroll > * { flex-shrink: 0; }`}</style>
          {/* 잔액 카드 */}
          <div style={{background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:10, overflow:'hidden'}}>
            <div style={{padding:'20px 22px', display:'flex', alignItems:'center', gap:24}}>
              <div>
                <div style={{fontSize:12, fontWeight:600, color:C_MUTED}}>문자 캐쉬 잔액</div>
                <div style={{display:'flex', alignItems:'baseline', gap:4, marginTop:4}}>
                  <span style={{fontSize:32, fontWeight:800, color:C_INK, letterSpacing:'-0.03em', fontVariantNumeric:'tabular-nums'}}>{balance.toLocaleString()}</span>
                  <span style={{fontSize:16, fontWeight:600, color:C_MUTED}}>원</span>
                </div>
                <div style={{fontSize:11.5, color: low ? '#B45309' : C_MUTED, marginTop:4}}>
                  최근 30일 {chWon(used30)} 사용 · 이 속도면 약 <b style={{color: low ? '#B45309' : C_INK}}>{daysLeft}일</b> 뒤 소진
                </div>
              </div>
              <div style={{flex:1}}/>
              <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8}}>
                <button onClick={() => setChargeOpen(true)} style={{
                  height:42, padding:'0 22px', border:'none', borderRadius:9, background:C_BLUE, color:'#fff',
                  fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 1px 2px rgba(30,64,175,0.25)',
                  display:'flex', alignItems:'center', gap:6,
                }}><IconPlus size={15} stroke={2.2}/> 충전하기</button>
                <span style={{fontSize:11, color:C_MUTED}}>
                  자동 충전 <b style={{color: autoSaved.on ? '#047857' : C_MUTED}}>{autoSaved.on ? '사용 중' : '미사용'}</b>
                </span>
              </div>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', borderTop:`1px solid ${C_BORDER}`, background:'#FBFCFE'}}>
              {['alimtalk','sms','lms','mms'].map((k, i) => {
                const u = MKT_UNIT[k];
                return (
                  <div key={k} style={{padding:'12px 18px', borderLeft: i ? `1px solid ${C_BORDER}` : 'none', display:'flex', alignItems:'center'}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:11.5, color:C_MUTED, display:'flex', alignItems:'center', gap:5}}>
                        <span style={{width:7, height:7, borderRadius:2, background:u.color}}/>{u.label}
                      </div>
                      <div style={{fontSize:11, color:C_MUTED, marginTop:2}}>{u.price}원/건</div>
                    </div>
                    <div style={{fontSize:15, fontWeight:700, color:C_INK, fontVariantNumeric:'tabular-nums'}}>
                      {Math.floor(balance / u.price).toLocaleString()}<span style={{fontSize:11.5, fontWeight:500, color:C_MUTED, marginLeft:2}}>건</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 자동 충전 */}
          <div style={{background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:10, overflow:'hidden'}}>
            <div style={{padding:'16px 20px', display:'flex', alignItems:'center', gap:12, borderBottom:`1px solid ${C_BORDER}`}}>
              <div style={{flex:1}}>
                <div style={{fontSize:14, fontWeight:700, color:C_INK}}>잔액 자동 충전</div>
                <div style={{fontSize:12, color:C_MUTED, marginTop:3}}>잔액이 설정 금액보다 적어지면 등록된 카드로 자동 충전돼요. 발송 중 잔액 부족으로 멈추는 일을 막아줘요.</div>
              </div>
              <window.MktToggle checked={auto.on} onChange={() => setAuto(a => ({ ...a, on: !a.on }))}/>
            </div>
            <div style={{padding:'18px 20px', opacity: auto.on ? 1 : 0.45, pointerEvents: auto.on ? 'auto' : 'none'}}>
              <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', fontSize:13.5, color:C_INK, lineHeight:2}}>
                <span>잔액이</span>
                <select value={auto.below} onChange={e => setAuto(a => ({ ...a, below:Number(e.target.value) }))} style={chSel}>
                  {[5000, 10000, 20000, 30000, 50000].map(v => <option key={v} value={v}>{chWon(v)}</option>)}
                </select>
                <span>보다 적으면</span>
                <select value={auto.amount} onChange={e => setAuto(a => ({ ...a, amount:Number(e.target.value) }))} style={chSel}>
                  {[20000, 30000, 40000, 50000, 100000].map(v => <option key={v} value={v}>{chWon(v)}</option>)}
                </select>
                <span>만큼</span>
                <select value={auto.card} onChange={e => setAuto(a => ({ ...a, card:e.target.value }))} style={{...chSel, minWidth:150}}>
                  {CH_CARDS.map(c => <option key={c.id} value={c.id}>{c.brand} ({c.last}){c.main ? ' · 대표' : ''}</option>)}
                </select>
                <span>카드로 자동 충전해요.</span>
              </div>
              <div style={{marginTop:12, padding:'10px 12px', background:C_BG, borderRadius:8, fontSize:12, color:C_INK, display:'flex', alignItems:'center', gap:8}}>
                <IconNote size={13} style={{color:C_MUTED}}/>
                1회 자동 충전 시 <b>{chWon(Math.round(auto.amount * 1.1))}</b> 결제 <span style={{color:C_MUTED}}>(충전 {chWon(auto.amount)} + 부가세 {chWon(Math.round(auto.amount * 0.1))})</span>
              </div>
              {auto.on && auto.below > balance && (
                <div style={{marginTop:8, fontSize:11.5, color:'#B45309'}}>
                  현재 잔액({chWon(balance)})이 설정 금액보다 적어서, 저장하면 바로 1회 결제돼요.
                </div>
              )}
            </div>
            <div style={{padding:'12px 20px', borderTop:`1px solid ${C_BORDER}`, background:'#FBFCFE', display:'flex', alignItems:'center', gap:8}}>
              <button disabled={!dirty} onClick={() => {
                setAutoSaved(auto); setToast(auto.on ? '자동 충전 설정을 저장했어요' : '자동 충전을 껐어요');
              }} style={{
                height:36, padding:'0 20px', border:'none', borderRadius:8, fontFamily:'inherit', fontSize:13, fontWeight:700, color:'#fff',
                background: dirty ? C_BLUE : '#C3CCDA', cursor: dirty ? 'pointer' : 'not-allowed',
              }}>변경사항 저장</button>
              {dirty && <button onClick={() => setAuto(autoSaved)} style={{...c_ghostBtnSm, height:36, padding:'0 14px', fontFamily:'inherit', fontWeight:600}}>취소</button>}
              <div style={{flex:1}}/>
              <span style={{fontSize:11, color:C_MUTED, textAlign:'right', lineHeight:1.5}}>
                잔액이 설정 금액에 도달할 때까지 여러 번 결제될 수 있어요.
              </span>
            </div>
          </div>

          {/* 충전 내역 */}
          <div style={{background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:10, overflow:'hidden'}}>
            <div style={{padding:'14px 20px', display:'flex', alignItems:'center', gap:10, borderBottom:`1px solid ${C_BORDER}`}}>
              <div style={{fontSize:14, fontWeight:700, color:C_INK, flex:1}}>충전 내역</div>
              <window.MktSeg size="sm" value={filter} onChange={setFilter} options={[
                { id:'all', label:'전체' }, { id:'charge', label:'충전' }, { id:'auto', label:'자동 충전' }, { id:'refund', label:'환불' },
              ]}/>
            </div>
            <div style={{
              display:'grid', gridTemplateColumns:'64px 132px 76px 1fr 110px 110px 56px', gap:10,
              padding:'9px 20px', background:'#FBFCFE', borderBottom:`1px solid ${C_BORDER}`, fontSize:11, fontWeight:700, color:C_MUTED,
            }}>
              <div>상태</div><div>일시</div><div>구분</div><div>결제 수단</div>
              <div style={{textAlign:'right'}}>충전 금액</div><div style={{textAlign:'right'}}>충전 후 잔액</div><div style={{textAlign:'center'}}>영수증</div>
            </div>
            {rows.map((h, i) => {
              const st = {
                '성공': { bg:'#ECFDF5', fg:'#047857' }, '실패': { bg:'#FEF2F2', fg:'#DC2626' }, '환불': { bg:'#EEF1F6', fg:C_MUTED },
              }[h.status];
              return (
                <div key={h.id} style={{
                  display:'grid', gridTemplateColumns:'64px 132px 76px 1fr 110px 110px 56px', gap:10, alignItems:'center',
                  padding:'12px 20px', borderTop: i ? '1px solid #EFF2F7' : 'none', fontSize:12.5, color:C_INK,
                }}>
                  <div><span style={{fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:10, background:st.bg, color:st.fg}}>{h.status}</span></div>
                  <div style={{fontVariantNumeric:'tabular-nums', color:C_MUTED}}>{h.at.replace(/-/g,'.')}</div>
                  <div>{h.kind === 'auto' ? '자동 충전' : h.kind === 'refund' ? '환불' : '충전'}</div>
                  <div style={{color:C_MUTED, minWidth:0}}>
                    {h.method}
                    {h.reason && <span style={{color:'#DC2626', marginLeft:6, fontSize:11.5, whiteSpace:'nowrap'}}>· {h.reason}</span>}
                  </div>
                  <div style={{textAlign:'right', fontWeight:700, fontVariantNumeric:'tabular-nums', color: h.status === '실패' ? '#B6C0CF' : h.amount < 0 ? C_MUTED : C_INK, textDecoration: h.status === '실패' ? 'line-through' : 'none'}}>
                    {h.amount > 0 ? '+' : ''}{chWon(h.amount)}
                  </div>
                  <div style={{textAlign:'right', color:C_MUTED, fontVariantNumeric:'tabular-nums'}}>{h.status === '실패' ? '-' : chWon(h.after)}</div>
                  <div style={{textAlign:'center'}}>
                    {h.status === '성공' && <button style={{border:'none', background:'transparent', color:C_BLUE, fontSize:11.5, fontWeight:600, cursor:'pointer', fontFamily:'inherit'}}>보기</button>}
                    {h.status === '실패' && <button onClick={() => setChargeOpen(true)} style={{border:'none', background:'transparent', color:C_BLUE, fontSize:11.5, fontWeight:600, cursor:'pointer', fontFamily:'inherit'}}>재시도</button>}
                  </div>
                </div>
              );
            })}
            {rows.length === 0 && <div style={{padding:'32px', textAlign:'center', fontSize:12.5, color:C_MUTED}}>내역이 없어요</div>}
          </div>

          <div style={{fontSize:11.5, color:C_MUTED, lineHeight:1.7, padding:'0 2px'}}>
            · 결제 금액은 충전 금액에 부가세 10%가 더해진 금액이에요. (예: 10,000원 충전 시 11,000원 결제)<br/>
            · 충전 후 사용하지 않은 캐쉬는 결제일로부터 7일 이내 전액 환불할 수 있어요. 이후에는 고객센터로 문의해 주세요.
          </div>
        </div>
      </div>

      {chargeOpen && (
        <C_ChargeModal onClose={() => setChargeOpen(false)} onDone={(amt, card) => {
          setChargeOpen(false);
          const nb = balance + amt;
          setBalance(nb);
          const now = '2026-09-21 ' + new Date().toTimeString().slice(0,5);
          const c = CH_CARDS.find(x => x.id === card);
          setHistory(h => [{ id:Date.now(), at:now, kind:'charge', method:`${c.brand} (****-****-****-${c.last})`, amount:amt, after:nb, status:'성공' }, ...h]);
          setToast(`${chWon(amt)} 충전했어요`);
        }}/>
      )}
      {cardsOpen && <C_CardsModal onClose={() => setCardsOpen(false)}/>}

      {toast && (
        <div style={{
          position:'fixed', left:'50%', bottom:28, transform:'translateX(-50%)', zIndex:300,
          background:'#0B1425', color:'#fff', fontSize:12.5, fontWeight:600, padding:'10px 16px', borderRadius:8,
          boxShadow:'0 8px 24px rgba(11,20,37,0.3)', display:'flex', alignItems:'center', gap:8,
        }}><IconCheck size={14} stroke={2.4}/>{toast}</div>
      )}
    </div>
  );
}

const chSel = {
  height:34, padding:'0 10px', border:`1px solid ${C_BORDER}`, borderRadius:7, minWidth:120,
  fontSize:13, fontWeight:600, color:C_INK, background:C_SURFACE, fontFamily:'inherit', outline:'none',
};

function ChModalShell({ title, onClose, children, footer, width = 520 }) {
  return (
    <div onClick={onClose} style={{position:'fixed', inset:0, background:'rgba(11,20,37,0.45)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div onClick={e => e.stopPropagation()} style={{width, background:C_SURFACE, borderRadius:14, overflow:'hidden', boxShadow:'0 24px 60px rgba(11,20,37,0.3)'}}>
        <div style={{padding:'18px 22px', borderBottom:`1px solid ${C_BORDER}`, display:'flex', alignItems:'center'}}>
          <div style={{fontSize:16, fontWeight:700, color:C_INK, flex:1}}>{title}</div>
          <button onClick={onClose} style={{border:'none', background:'transparent', cursor:'pointer', color:C_MUTED, display:'flex'}}><IconX size={18}/></button>
        </div>
        {children}
        {footer && <div style={{padding:'14px 22px', borderTop:`1px solid ${C_BORDER}`, background:'#FBFCFE', display:'flex', alignItems:'center', gap:8}}>{footer}</div>}
      </div>
    </div>
  );
}

function C_ChargeModal({ onClose, onDone }) {
  const [amt, setAmt] = React.useState(30000);
  const [custom, setCustom] = React.useState('');
  const [card, setCard] = React.useState('c1');
  const val = custom !== '' ? Number(custom) : amt;
  const valid = val >= 10000 && val % 1000 === 0;
  const vat = Math.round(val * 0.1);
  return (
    <ChModalShell title="문자 캐쉬 충전" onClose={onClose} footer={
      <>
        <div style={{flex:1}}>
          <div style={{fontSize:11, color:C_MUTED}}>결제 금액 (부가세 포함)</div>
          <div style={{fontSize:18, fontWeight:800, color:C_INK, fontVariantNumeric:'tabular-nums'}}>{valid ? chWon(val + vat) : '-'}</div>
        </div>
        <button onClick={onClose} style={{...c_ghostBtnSm, height:40, padding:'0 16px', fontFamily:'inherit', fontWeight:600}}>취소</button>
        <button disabled={!valid} onClick={() => onDone(val, card)} style={{
          height:40, padding:'0 22px', border:'none', borderRadius:8, fontFamily:'inherit', fontSize:13.5, fontWeight:700, color:'#fff',
          background: valid ? C_BLUE : '#C3CCDA', cursor: valid ? 'pointer' : 'not-allowed',
        }}>결제하기</button>
      </>
    }>
      <div style={{padding:'18px 22px', display:'flex', flexDirection:'column', gap:18}}>
        <div>
          <div style={chLbl}>충전 금액</div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:6}}>
            {CH_AMOUNTS.map(v => {
              const on = custom === '' && amt === v;
              return (
                <button key={v} onClick={() => { setAmt(v); setCustom(''); }} style={{
                  padding:'11px 10px', borderRadius:8, cursor:'pointer', fontFamily:'inherit', textAlign:'left',
                  border:`1.5px solid ${on ? C_BLUE : C_BORDER}`, background: on ? C_BLUE_SOFT : C_SURFACE,
                }}>
                  <div style={{fontSize:14, fontWeight:700, color: on ? C_BLUE : C_INK, fontVariantNumeric:'tabular-nums'}}>{chWon(v)}</div>
                  <div style={{fontSize:10.5, color:C_MUTED, marginTop:2}}>단문 약 {Math.floor(v / MKT_UNIT.sms.price).toLocaleString()}건</div>
                </button>
              );
            })}
          </div>
          <div style={{display:'flex', alignItems:'center', gap:8, marginTop:8}}>
            <span style={{fontSize:12, color:C_MUTED, width:56}}>직접 입력</span>
            <input value={custom === '' ? '' : Number(custom).toLocaleString()} onChange={e => setCustom(e.target.value.replace(/[^0-9]/g,''))}
              placeholder="10,000원 이상, 1,000원 단위" style={{...chSel, flex:1, fontWeight:500, textAlign:'right'}}/>
            <span style={{fontSize:13, color:C_INK}}>원</span>
          </div>
          {custom !== '' && !valid && <div style={{fontSize:11, color:C_CORAL, marginTop:6, paddingLeft:64}}>10,000원 이상, 1,000원 단위로 입력해 주세요.</div>}
        </div>
        <div>
          <div style={chLbl}>결제 수단</div>
          <div style={{display:'flex', flexDirection:'column', gap:6}}>
            {CH_CARDS.map(c => {
              const on = card === c.id;
              return (
                <div key={c.id} onClick={() => setCard(c.id)} style={{
                  display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:8, cursor:'pointer',
                  border:`1.5px solid ${on ? C_BLUE : C_BORDER}`, background: on ? C_BLUE_SOFT : C_SURFACE,
                }}>
                  <span style={{width:14, height:14, borderRadius:'50%', border:`1.5px solid ${on ? C_BLUE : '#C3CCDA'}`, background: on ? C_BLUE : '#fff', boxShadow: on ? 'inset 0 0 0 3px #fff' : 'none'}}/>
                  <span style={{fontSize:13, fontWeight:600, color:C_INK}}>{c.brand}카드</span>
                  <span style={{fontSize:12.5, color:C_MUTED, fontVariantNumeric:'tabular-nums'}}>**** {c.last}</span>
                  {c.main && <span style={{fontSize:10.5, fontWeight:700, padding:'1px 6px', borderRadius:4, background:'#EEF1F6', color:C_MUTED}}>대표</span>}
                </div>
              );
            })}
          </div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr auto', rowGap:5, fontSize:12.5, color:C_MUTED, padding:'12px 14px', background:C_BG, borderRadius:8, fontVariantNumeric:'tabular-nums'}}>
          <span>충전 금액</span><span style={{color:C_INK, textAlign:'right'}}>{valid ? chWon(val) : '-'}</span>
          <span>부가세 (10%)</span><span style={{color:C_INK, textAlign:'right'}}>{valid ? chWon(vat) : '-'}</span>
        </div>
      </div>
    </ChModalShell>
  );
}

function C_CardsModal({ onClose }) {
  return (
    <ChModalShell title="결제 수단 관리" onClose={onClose} width={460} footer={
      <>
        <div style={{flex:1}}/>
        <button onClick={onClose} style={{...c_ghostBtnSm, height:38, padding:'0 16px', fontFamily:'inherit', fontWeight:600}}>닫기</button>
      </>
    }>
      <div style={{padding:'16px 22px', display:'flex', flexDirection:'column', gap:8}}>
        {CH_CARDS.map(c => (
          <div key={c.id} style={{display:'flex', alignItems:'center', gap:10, padding:'12px 14px', border:`1px solid ${C_BORDER}`, borderRadius:9}}>
            <div style={{width:38, height:26, borderRadius:5, background: c.brand === '신한' ? '#1E3A8A' : '#78716C'}}/>
            <div style={{flex:1}}>
              <div style={{fontSize:13, fontWeight:600, color:C_INK}}>{c.brand}카드 **** {c.last}</div>
              <div style={{fontSize:11, color:C_MUTED, marginTop:2}}>유효기간 {c.exp}</div>
            </div>
            {c.main
              ? <span style={{fontSize:11, fontWeight:700, color:C_BLUE}}>대표 카드</span>
              : <button style={{...c_ghostBtnSm, fontFamily:'inherit', fontSize:11.5}}>대표로 설정</button>}
            <button style={{border:'none', background:'transparent', color:C_MUTED, fontSize:11.5, cursor:'pointer', fontFamily:'inherit'}}>삭제</button>
          </div>
        ))}
        <button style={{
          height:44, border:`1.5px dashed ${C_BORDER}`, borderRadius:9, background:C_SURFACE, color:C_BLUE,
          fontSize:12.5, fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:6,
        }}><IconPlus size={13}/> 새 카드 등록</button>
      </div>
    </ChModalShell>
  );
}
const chLbl = { fontSize:12, fontWeight:700, color:C_INK, marginBottom:8 };

window.C_MktChargePage = C_MktChargePage;
