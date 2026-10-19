// 분석 › 분석 대시보드 — 결산, 정액권, 고객의 핵심만 한 장에
const {
  C_BLUE, C_BLUE_SOFT, C_INK, C_MUTED, C_BORDER, C_BG, C_SURFACE,
} = window;

function dashWon(n) {
  return new Intl.NumberFormat('ko-KR').format(Math.round(n || 0));
}
function dashPct(a, b) { return b ? Math.round((a / b) * 1000) / 10 : 0; }

function C_DashPage() {
  const [preset, setPreset] = React.useState('month');
  const presets = window.ST_PRESETS || [];
  const range = presets.find(p => p.id === preset) || presets[0];
  const rows = window.stRowsFor ? window.stRowsFor(preset) : [];
  const data = window.stCollect ? window.stCollect(rows) : { all:{ pay:0, service:0, customers:0, sale:{membership:0,ticket:0}, use:{membership:0,ticket:0}, cats:{} }, byDes:{}, byVisit:{} };
  const b = data.all;
  const ticket = b.customers ? Math.round(b.service / b.customers) : 0;
  const des = (window.ST_DES || []).map(d => ({ ...d, pay:(data.byDes[d.id] || {}).pay || 0, n:(data.byDes[d.id] || {}).customers || 0 })).filter(d => d.pay > 0).sort((a, c) => c.pay - a.pay);
  const maxPay = des.reduce((m, d) => Math.max(m, d.pay), 0);
  const cats = (window.ST_CATS || []).map(c => ({ ...c, amount:(b.cats && b.cats[c.id]) || 0 }));
  const maxCat = cats.reduce((m, c) => Math.max(m, c.amount), 0);
  const visits = (window.ST_VISITS || []).map(v => ({ ...v, n:(data.byVisit[v.id] || {}).customers || 0 }));
  const hold = window.PP_HOLD || [];
  const mem = hold.filter(r => r.kind === 'membership');
  const tik = hold.filter(r => r.kind === 'ticket');
  const bal = (list) => list.reduce((a, r) => a + Math.max(0, r.sales - r.used), 0);
  const people = window.MKT_CUSTOMERS || [];
  const d30 = people.filter(c => c.lastDays <= 30).length;
  const old = people.filter(c => c.lastDays > 180).length;
  const go = (id) => window.__goPage && window.__goPage(id);

  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden', background:C_BG}}>
      <div style={{width:'100%', flex:1, display:'flex', flexDirection:'column', minWidth:0, minHeight:0}}>
        <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', padding:'10px 14px', background:C_SURFACE, borderBottom:`1px solid ${C_BORDER}`}}>
          <span style={{fontSize:12.5, color:C_MUTED, fontWeight:600}}>기간</span>
          <div style={dashDate}>{range && range.from}</div>
          <span style={{color:C_MUTED, fontSize:12}}>~</span>
          <div style={dashDate}>{range && range.to}</div>
          <div style={{display:'flex', gap:4}}>
            {presets.map(p => {
              const on = preset === p.id;
              return (
                <button key={p.id} onClick={() => setPreset(p.id)} style={{
                  padding:'6px 11px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                  border:`1px solid ${on ? C_BLUE : C_BORDER}`, borderRadius:14,
                  background: on ? C_BLUE_SOFT : C_SURFACE, color: on ? C_BLUE : C_MUTED,
                }}>{p.label}</button>
              );
            })}
          </div>
        </div>

        <div style={{flex:1, overflow:'auto', padding:'16px 20px 28px'}}>
          <div style={{fontSize:12, color:C_MUTED, marginBottom:12}}>
            홈 <span style={{margin:'0 6px'}}>›</span>
            분석 <span style={{margin:'0 6px'}}>›</span>
            <span style={{color:C_INK, fontWeight:700}}>분석 대시보드</span>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:10, marginBottom:12}}>
            <DashKpi label="결제 금액" value={`${dashWon(b.pay)}원`} sub="고객이 낸 돈"/>
            <DashKpi label="시술 금액" value={`${dashWon(b.service)}원`} sub="정액권 소진 포함"/>
            <DashKpi label="방문" value={`${(b.customers || 0).toLocaleString()}명`} sub="시술·제품"/>
            <DashKpi label="객단가" value={`${dashWon(ticket)}원`} sub="시술 금액 ÷ 방문"/>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
            <DashCard title="담당자" link="결산" onLink={() => go('analytics-sales')}>
              {des.map(d => (
                <DashLine key={d.id} name={d.name} color={d.color} pct={maxPay ? d.pay / maxPay * 100 : 0} right={`${dashWon(d.pay)}원`} sub={`${d.n}명`}/>
              ))}
            </DashCard>
            <DashCard title="시술" link="결산" onLink={() => go('analytics-sales')}>
              {cats.map(c => (
                <DashLine key={c.id} name={c.name} color={C_BLUE} pct={maxCat ? c.amount / maxCat * 100 : 0} right={c.amount ? `${dashWon(c.amount)}원` : '0'} sub={b.service ? `${dashPct(c.amount, b.service)}%` : ''}/>
              ))}
            </DashCard>
            <DashCard title="방문 구분" link="결산" onLink={() => go('analytics-sales')}>
              <div style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:8}}>
                {visits.map(v => (
                  <div key={v.id} style={{padding:'10px 8px', borderRadius:8, background:'#F8FAFC'}}>
                    <div style={{fontSize:11, fontWeight:700, color:v.color}}>{v.name}</div>
                    <div style={{marginTop:4, fontSize:16, fontWeight:800, color:C_INK, fontVariantNumeric:'tabular-nums'}}>{v.n}<span style={{fontSize:11, fontWeight:700, marginLeft:2}}>명</span></div>
                  </div>
                ))}
              </div>
            </DashCard>
            <DashCard title="정액권 · 티켓" link="정액권 분석" onLink={() => go('analytics-prepaid')}>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10}}>
                <DashMini label="정액권 판매" value={`${dashWon(b.sale.membership)}원`}/>
                <DashMini label="정액권 소진" value={`${dashWon(b.use.membership)}원`}/>
                <DashMini label="티켓 판매" value={`${dashWon(b.sale.ticket)}원`}/>
                <DashMini label="티켓 소진" value={`${dashWon(b.use.ticket)}원`}/>
              </div>
              <div style={{fontSize:11.5, color:C_MUTED, lineHeight:1.45}}>
                보유 금액 잔액 · 정액권 {dashWon(bal(mem))}원 · 티켓 {dashWon(bal(tik))}원
              </div>
            </DashCard>
          </div>

          <div style={{marginTop:12, background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:12, padding:'14px 16px', display:'flex', alignItems:'center', gap:18, flexWrap:'wrap'}}>
            <div style={{minWidth:140}}>
              <div style={{fontSize:13, fontWeight:800, color:C_INK}}>등록 고객</div>
              <div style={{fontSize:11.5, color:C_MUTED, marginTop:2}}>2026.09.21 기준</div>
            </div>
            <DashMini label="전체" value={`${people.length.toLocaleString()}명`}/>
            <DashMini label="30일 이내" value={`${d30.toLocaleString()}명`}/>
            <DashMini label="180일 넘음" value={`${old.toLocaleString()}명`}/>
            <div style={{flex:1}}/>
            <button onClick={() => go('analytics-customer')} style={dashLink}>고객 분석</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashKpi({ label, value, sub }) {
  return (
    <div style={{background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:12, padding:'12px 14px'}}>
      <div style={{fontSize:11.5, color:C_MUTED, fontWeight:600}}>{label}</div>
      <div style={{marginTop:6, fontSize:22, fontWeight:800, letterSpacing:'-0.03em', color:C_INK, fontVariantNumeric:'tabular-nums', lineHeight:1.1}}>{value}</div>
      <div style={{marginTop:5, fontSize:11, color:C_MUTED}}>{sub}</div>
    </div>
  );
}
function DashCard({ title, link, onLink, children }) {
  return (
    <div style={{background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:12, padding:'14px 16px'}}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12}}>
        <div style={{fontSize:13.5, fontWeight:800, color:C_INK}}>{title}</div>
        <button onClick={onLink} style={dashLink}>{link}</button>
      </div>
      <div style={{display:'flex', flexDirection:'column', gap:8}}>{children}</div>
    </div>
  );
}
function DashLine({ name, color, pct, right, sub }) {
  return (
    <div style={{display:'grid', gridTemplateColumns:'72px 1fr auto', gap:8, alignItems:'center'}}>
      <span style={{fontSize:12.5, fontWeight:700, color:C_INK, display:'inline-flex', alignItems:'center', gap:6}}>
        <span style={{width:3, height:12, borderRadius:2, background:color}}/>{name}
      </span>
      <span style={{height:6, borderRadius:99, background:'#EEF1F6', overflow:'hidden'}}>
        <span style={{display:'block', width:`${Math.min(100, pct)}%`, height:'100%', background:color}}/>
      </span>
      <span style={{textAlign:'right'}}>
        <span style={{fontSize:12, fontWeight:800, color:C_INK, fontVariantNumeric:'tabular-nums'}}>{right}</span>
        {sub && <span style={{marginLeft:6, fontSize:11, color:C_MUTED}}>{sub}</span>}
      </span>
    </div>
  );
}
function DashMini({ label, value }) {
  return (
    <div>
      <div style={{fontSize:11, color:C_MUTED, fontWeight:600}}>{label}</div>
      <div style={{marginTop:2, fontSize:14, fontWeight:800, color:C_INK, fontVariantNumeric:'tabular-nums'}}>{value}</div>
    </div>
  );
}
const dashDate = {
  height:32, padding:'0 10px', borderRadius:8, border:`1px solid ${C_BORDER}`, background:'#F8FAFC',
  display:'flex', alignItems:'center', fontSize:12, fontWeight:700, color:C_INK, fontVariantNumeric:'tabular-nums',
};
const dashLink = {
  height:28, padding:'0 10px', borderRadius:8, border:`1px solid ${C_BORDER}`, background:C_SURFACE,
  color:C_BLUE, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
};

window.C_DashPage = C_DashPage;
