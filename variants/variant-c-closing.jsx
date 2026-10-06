// 일일 마감 페이지 — 3 tabs (매출/내수/메타), 3 layouts (cards/summary/list-detail)

const {
  C_BLUE, C_BLUE_SOFT, C_INK, C_MUTED, C_BORDER, C_BG, C_SURFACE,
  c_iconBtnSm, c_ghostBtnSm,
} = window;

function C_ClosingPage() {
  const [tab, setTab] = React.useState('sales');    // sales | internal | meta
  const [layout, setLayout] = React.useState('cards'); // cards | summary | list-detail
  const [selectedDesigner, setSelectedDesigner] = React.useState('moon');

  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden', background:C_BG}}>
      <div style={{width: 948, flexShrink: 0, flex:1, display:'flex', flexDirection:'column', minHeight:0}}>
        <C_ClosingSubHeader
          tab={tab} setTab={setTab}
          layout={layout} setLayout={setLayout}
        />
        <div style={{flex:1, overflow:'auto', padding:'16px 20px 24px'}}>
          {/* 브레드크럼 */}
          <div style={{fontSize:12, color:C_MUTED, marginBottom:14}}>
            홈 <span style={{margin:'0 6px'}}>›</span>
            <span>일일 마감</span>
            <span style={{margin:'0 6px'}}>›</span>
            <span style={{color:C_INK, fontWeight:600}}>
              {tab === 'sales' ? '매출 마감' : tab === 'internal' ? '내수 마감' : '메타 매출'}
            </span>
          </div>

          {/* KPI 스트립 */}
          <C_ClosingKPIs tab={tab}/>

          {/* 범례 */}
          <C_ClosingLegend tab={tab}/>

          {/* 탭별 본문 */}
          {tab === 'sales' && (
            <>
              {layout === 'cards' && <C_SalesCards/>}
              {layout === 'summary' && <C_SalesSummary/>}
              {layout === 'list-detail' && (
                <C_SalesListDetail selected={selectedDesigner} onSelect={setSelectedDesigner}/>
              )}
            </>
          )}
          {tab === 'internal' && <C_InternalClosing/>}
          {tab === 'meta' && <C_MetaClosing/>}
        </div>
      </div>
    </div>
  );
}

// ─ 서브헤더 ─
function C_ClosingSubHeader({ tab, setTab, layout, setLayout }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:8,
      padding:'10px 14px', background:C_SURFACE, borderBottom:`1px solid ${C_BORDER}`,
    }}>
      {/* 날짜 네비 */}
      <div style={{display:'flex', alignItems:'center', gap:6, flexShrink:0}}>
        <button style={c_iconBtnSm}><IconChevronL size={14}/></button>
        <div style={{
          fontSize:15, fontWeight:700, color:C_INK, minWidth:130, textAlign:'center',
          fontVariantNumeric:'tabular-nums', letterSpacing:'-0.01em',
          display:'flex', alignItems:'center', justifyContent:'center', gap:5,
        }}>
          2026년 09월 11일 <IconChevronD size={11} style={{color:C_MUTED}}/>
        </div>
        <button style={c_iconBtnSm}><IconChevronR size={14}/></button>
        <button style={{...c_ghostBtnSm, marginLeft:2}}>오늘</button>
      </div>

      <div style={{flex:1}}/>

      {/* 3 탭 */}
      <div style={{display:'flex', background:C_BG, borderRadius:20, padding:3, border:`1px solid ${C_BORDER}`, flexShrink:0}}>
        {[
          { id:'sales',    label:'매출 마감' },
          { id:'internal', label:'내수 마감' },
          { id:'meta',     label:'메타 매출' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding:'4px 14px', fontSize:12, fontWeight:600,
            border:'none', borderRadius:16, cursor:'pointer',
            background: tab===t.id ? C_SURFACE : 'transparent',
            color: tab===t.id ? C_INK : C_MUTED,
            boxShadow: tab===t.id ? '0 1px 2px rgba(11,20,37,0.08)' : 'none',
            whiteSpace:'nowrap',
          }}>{t.label}</button>
        ))}
      </div>

      {/* 레이아웃 스위치 (매출 탭에서만) */}
      {tab === 'sales' && (
        <div style={{display:'flex', background:C_BG, borderRadius:7, padding:2, border:`1px solid ${C_BORDER}`, flexShrink:0}}>
          {[
            { id:'cards',       label:'카드' },
            { id:'summary',     label:'요약' },
            { id:'list-detail', label:'리스트' },
          ].map(v => (
            <button key={v.id} onClick={() => setLayout(v.id)} style={{
              padding:'5px 10px', fontSize:11.5, fontWeight:600,
              border:'none', borderRadius:5, cursor:'pointer',
              background: layout===v.id ? C_SURFACE : 'transparent',
              color: layout===v.id ? C_INK : C_MUTED,
              boxShadow: layout===v.id ? '0 1px 2px rgba(11,20,37,0.06)' : 'none',
            }}>{v.label}</button>
          ))}
        </div>
      )}

      {/* CTA */}
      <button style={{
        padding:'7px 14px', background: C_BLUE, color:'#fff',
        border:'none', borderRadius:7, fontSize:12, fontWeight:600,
        cursor:'pointer', flexShrink:0, whiteSpace:'nowrap',
        display:'flex', alignItems:'center', gap:5,
        boxShadow:'0 1px 2px rgba(30,64,175,0.2)',
      }}>
        <IconCheck size={12}/> 마감 확정
      </button>
    </div>
  );
}

// ─ 통계 계산 유틸 ─
function calcClosingTotals() {
  const totals = {
    revenue: 0, count: 0, cash: 0, card: 0, mix: 0,
    ticket: 0, coupon: 0, help: 0,
    channels: { road:0, online:0, intro:0, revisit:0, replace:0 },
  };
  Object.values(CLOSING_TODAY).forEach(d => {
    d.rows.forEach(r => {
      totals.revenue += r.amount;
      totals.count += 1;
      totals[r.pay] += r.amount;
      totals.channels[r.channel] += 1;
    });
    totals.ticket += d.ticket || 0;
    totals.coupon += d.coupon || 0;
    totals.help += d.help || 0;
  });
  return totals;
}

// ─ KPI 스트립 ─
function C_ClosingKPIs({ tab }) {
  const t = calcClosingTotals();
  const avgTicket = t.count > 0 ? Math.round(t.revenue / t.count) : 0;

  const salesKpis = [
    { label:'총 매출',   value:`₩ ${new Intl.NumberFormat('ko-KR').format(t.revenue)}`, sub:`${t.count}건 결제`,  accent:C_INK, icon:<IconTrend/>, tint:'#EFF3FC', iconColor:C_BLUE },
    { label:'객수',      value:`${t.count}명`, sub:`재방문 ${t.channels.revisit}명`, accent:C_INK, icon:<IconUser/>, tint:'#F0FDF4', iconColor:'#059669' },
    { label:'객단가',    value:`₩ ${new Intl.NumberFormat('ko-KR').format(avgTicket)}`, sub:'완료 기준 평균', accent:C_INK, icon:<IconChart/>, tint:'#F5F3FF', iconColor:'#7C3AED' },
    { label:'카드 비율', value:`${Math.round(t.card/t.revenue*100)}%`, sub:`₩ ${new Intl.NumberFormat('ko-KR').format(t.card)}`, accent:C_INK, icon:<IconTag/>, tint:'#FEF3C7', iconColor:'#D97706' },
  ];

  return (
    <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12, marginBottom:14}}>
      {salesKpis.map((k, i) => (
        <div key={i} style={{background:C_SURFACE, padding:'14px 16px', borderRadius:10, border:`1px solid ${C_BORDER}`}}>
          <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10}}>
            <div style={{fontSize:11.5, color:C_MUTED, fontWeight:500}}>{k.label}</div>
            <div style={{width:26, height:26, borderRadius:6, background:k.tint, color:k.iconColor, display:'flex', alignItems:'center', justifyContent:'center'}}>
              {React.cloneElement(k.icon, { size:14 })}
            </div>
          </div>
          <div style={{fontSize:20, fontWeight:700, color:k.accent, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em', lineHeight:1.1}}>{k.value}</div>
          <div style={{fontSize:11, color:C_MUTED, marginTop:5}}>{k.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ─ 범례 ─
function C_ClosingLegend({ tab }) {
  return (
    <div style={{
      display:'flex', gap:14, padding:'10px 14px',
      background:C_SURFACE, borderRadius:8, border:`1px solid ${C_BORDER}`,
      marginBottom:14, alignItems:'center', flexWrap:'wrap',
    }}>
      <span style={{fontSize:11, color:C_MUTED, fontWeight:600}}>채널</span>
      {STATS_CHANNELS.map(c => (
        <span key={c.id} style={{display:'inline-flex', alignItems:'center', gap:5, fontSize:11.5}}>
          <span style={{width:8, height:8, borderRadius:'50%', background:c.color}}/>
          <span style={{color:C_INK}}>{c.label}</span>
        </span>
      ))}
      <div style={{width:1, height:14, background:C_BORDER, margin:'0 4px'}}/>
      <span style={{fontSize:11, color:C_MUTED, fontWeight:600}}>결제</span>
      {PAY_METHODS.map(p => (
        <span key={p.id} style={{display:'inline-flex', alignItems:'center', gap:5, fontSize:11.5}}>
          <span style={{width:8, height:8, borderRadius:2, background:p.color}}/>
          <span style={{color:C_INK}}>{p.label}</span>
        </span>
      ))}
    </div>
  );
}

// ─ 매출 마감: 디자이너 카드 세로 나열 (기본) ─
function C_SalesCards() {
  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
      {Object.entries(CLOSING_TODAY).map(([id, d]) => {
        const designer = DESIGNERS.find(x => x.id === id);
        return <C_DesignerClosingCard key={id} id={id} d={d} designer={designer}/>;
      })}
    </div>
  );
}

function C_DesignerClosingCard({ id, d, designer }) {
  const rowTotal = d.rows.reduce((a, r) => a + r.amount, 0);
  const cashTotal = d.rows.filter(r => r.pay === 'cash').reduce((a,r) => a+r.amount, 0);
  const cardTotal = d.rows.filter(r => r.pay === 'card').reduce((a,r) => a+r.amount, 0);
  const mixTotal  = d.rows.filter(r => r.pay === 'mix').reduce((a,r) => a+r.amount, 0);
  const discount = d.coupon || 0;
  const realTotal = rowTotal + (d.ticket||0) - discount + (d.help||0);
  const color = designer?.color || '#94A3B8';
  const initials = d.name.charAt(0);

  return (
    <div style={{
      background:C_SURFACE, borderRadius:12, overflow:'hidden',
      border:`1px solid ${C_BORDER}`,
      borderTop:`3px solid ${color}`,
      boxShadow:'0 1px 3px rgba(11,20,37,0.06), 0 1px 2px rgba(11,20,37,0.04)',
    }}>
      {/* 헤더 - 디자이너 색상 톤 배경 */}
      <div style={{
        padding:'12px 14px', display:'flex', alignItems:'center', gap:10,
        borderBottom:`1px solid ${C_BORDER}`,
        background: `linear-gradient(90deg, ${color}14 0%, ${color}05 60%, transparent 100%)`,
      }}>
        {/* 아바타 */}
        <div style={{
          width:34, height:34, borderRadius:'50%',
          background: color, color:'#fff',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:14, fontWeight:700, letterSpacing:'-0.02em',
          flexShrink:0,
          boxShadow: `0 2px 6px ${color}55`,
        }}>{initials}</div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{display:'flex', alignItems:'center', gap:6}}>
            <div style={{fontSize:14, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>{d.name}</div>
            <span style={{
              fontSize:10, fontWeight:600, color, background:`${color}22`,
              padding:'1px 6px', borderRadius:8, letterSpacing:'-0.01em',
            }}>{designer?.role}</span>
          </div>
          <div style={{fontSize:10.5, color:C_MUTED, marginTop:2, fontVariantNumeric:'tabular-nums'}}>
            {d.rows.length}건 결제 완료
          </div>
        </div>
        <div style={{textAlign:'right', flexShrink:0}}>
          <div style={{fontSize:10, color:C_MUTED, fontWeight:600, letterSpacing:'0.02em'}}>실 매출</div>
          <div style={{fontSize:16, fontWeight:700, color:C_INK, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em', lineHeight:1.15}}>
            ₩ {new Intl.NumberFormat('ko-KR').format(realTotal)}
          </div>
        </div>
      </div>

      {/* 매출 내역 미니 테이블 */}
      <table style={{width:'100%', borderCollapse:'collapse', fontSize:11.5, fontVariantNumeric:'tabular-nums'}}>
        <thead>
          <tr style={{background:'#FBFCFE', color:C_MUTED, fontSize:10.5}}>
            <th style={{...c_thSm, width:36}}>#</th>
            <th style={{...c_thSm, textAlign:'left', width:52}}>시간</th>
            <th style={{...c_thSm, textAlign:'left', width:70}}>고객명</th>
            <th style={{...c_thSm, textAlign:'left'}}>시술명</th>
            <th style={{...c_thSm, width:22}}></th>
            <th style={{...c_thSm, textAlign:'right', width:70}}>금액</th>
          </tr>
        </thead>
        <tbody>
          {d.rows.map((r, i) => {
            const ch = STATS_CHANNELS.find(c => c.id === r.channel);
            const pay = PAY_METHODS.find(p => p.id === r.pay);
            return (
              <tr key={i} style={{borderTop:`1px solid ${C_BORDER}`}}>
                <td style={{...c_tdSm, color:C_MUTED, textAlign:'center'}}>{i+1}</td>
                <td style={c_tdSm}>{r.time}</td>
                <td style={{...c_tdSm, color:C_BLUE, fontWeight:500}}>{r.customer}</td>
                <td style={{...c_tdSm, color:C_INK, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{r.menu}</td>
                <td style={c_tdSm}>
                  <span title={`${ch?.label} · ${pay?.label}`} style={{
                    display:'inline-block', width:8, height:8, borderRadius:'50%', background:ch?.color,
                  }}/>
                </td>
                <td style={{...c_tdSm, textAlign:'right', color:C_INK, fontWeight:600}}>
                  {new Intl.NumberFormat('ko-KR').format(r.amount)}
                </td>
              </tr>
            );
          })}
          {/* 소계/합계 행 */}
          <C_SumRow label="정액권 금액"    value={d.ticket}/>
          <C_SumRow label="티켓권 금액"    value={0} muted/>
          <C_SumRow label="헬프 매출"      value={d.help}/>
          <tr style={{borderTop:`1px solid ${C_BORDER}`, background:'#FBFCFE'}}>
            <td colSpan="4" style={{...c_tdSm, color:C_MUTED, fontSize:10.5}}>현금 매출 (시술/제품)</td>
            <td style={c_tdSm}><span style={{width:6, height:6, borderRadius:'50%', background:'#10B981', display:'inline-block'}}/></td>
            <td style={{...c_tdSm, textAlign:'right', color:C_INK}}>{new Intl.NumberFormat('ko-KR').format(cashTotal)}</td>
          </tr>
          <tr style={{borderTop:`1px solid ${C_BORDER}`, background:'#FBFCFE'}}>
            <td colSpan="4" style={{...c_tdSm, color:C_MUTED, fontSize:10.5}}>카드 매출 (시술/제품)</td>
            <td style={c_tdSm}><span style={{width:6, height:6, borderRadius:'50%', background:'#3B82F6', display:'inline-block'}}/></td>
            <td style={{...c_tdSm, textAlign:'right', color:C_INK}}>{new Intl.NumberFormat('ko-KR').format(cardTotal)}</td>
          </tr>
          <tr style={{borderTop:`2px solid ${C_BLUE}`, background:C_BLUE_SOFT}}>
            <td colSpan="5" style={{...c_tdSm, color:C_INK, fontWeight:700}}>총 영업액</td>
            <td style={{...c_tdSm, textAlign:'right', color:C_INK, fontWeight:700, fontSize:13}}>
              ₩ {new Intl.NumberFormat('ko-KR').format(rowTotal + (d.ticket||0) + (d.help||0))}
            </td>
          </tr>
          <C_SumRow label="할인 금액 (지원/자부담)" value={discount ? -discount : 0}/>
          <tr style={{borderTop:`1px solid ${C_BORDER}`, background:C_BLUE_SOFT}}>
            <td colSpan="5" style={{...c_tdSm, color:C_BLUE, fontWeight:700}}>실 매출계 (시술/제품)</td>
            <td style={{...c_tdSm, textAlign:'right', color:C_BLUE, fontWeight:700, fontSize:13}}>
              ₩ {new Intl.NumberFormat('ko-KR').format(realTotal)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function C_SumRow({ label, value, muted }) {
  return (
    <tr style={{borderTop:`1px solid ${C_BORDER}`, background:'#FBFCFE'}}>
      <td colSpan="5" style={{...c_tdSm, color:muted ? '#CBD5E1' : C_MUTED, fontSize:10.5}}>{label}</td>
      <td style={{...c_tdSm, textAlign:'right', color: value < 0 ? '#EF4444' : muted || value === 0 ? '#CBD5E1' : C_INK, fontWeight: value === 0 ? 400 : 500}}>
        {value === 0 ? '0' : new Intl.NumberFormat('ko-KR').format(value)}
      </td>
    </tr>
  );
}

// ─ 매출 마감: 요약 뷰 (전체 랭킹표) ─
function C_SalesSummary() {
  const rows = Object.entries(CLOSING_TODAY).map(([id, d]) => {
    const designer = DESIGNERS.find(x => x.id === id);
    const total = d.rows.reduce((a,r) => a+r.amount, 0);
    const count = d.rows.length;
    const cash = d.rows.filter(r => r.pay === 'cash').reduce((a,r) => a+r.amount, 0);
    const card = d.rows.filter(r => r.pay === 'card').reduce((a,r) => a+r.amount, 0);
    return { id, name: d.name, designer, total, count, cash, card, ticket: d.ticket||0, discount: d.coupon||0, real: total + (d.ticket||0) - (d.coupon||0) + (d.help||0) };
  }).sort((a,b) => b.real - a.real);
  const grand = rows.reduce((a,r) => a+r.real, 0);
  const maxReal = Math.max(...rows.map(r => r.real), 1);

  return (
    <div style={{background:C_SURFACE, borderRadius:10, border:`1px solid ${C_BORDER}`, overflow:'hidden'}}>
      <div style={{padding:'14px 18px', borderBottom:`1px solid ${C_BORDER}`, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div style={{fontSize:13.5, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>디자이너별 매출 요약</div>
        <div style={{fontSize:12, color:C_MUTED}}>총 {rows.length}명 · ₩ {new Intl.NumberFormat('ko-KR').format(grand)}</div>
      </div>
      <table style={{width:'100%', borderCollapse:'collapse', fontSize:12, fontVariantNumeric:'tabular-nums'}}>
        <thead>
          <tr style={{background:'#FBFCFE'}}>
            <th style={{...c_th, textAlign:'left'}}>#</th>
            <th style={{...c_th, textAlign:'left'}}>디자이너</th>
            <th style={c_th}>건수</th>
            <th style={c_th}>현금</th>
            <th style={c_th}>카드</th>
            <th style={c_th}>정액권</th>
            <th style={c_th}>할인</th>
            <th style={{...c_th, textAlign:'left', width:120}}>매출 비교</th>
            <th style={{...c_th, background:C_BLUE_SOFT, color:C_BLUE}}>실 매출</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id} style={{borderTop:`1px solid ${C_BORDER}`}}>
              <td style={{...c_td, textAlign:'left', color:C_MUTED, fontWeight:600, width:32}}>{i+1}</td>
              <td style={{...c_tdName}}>
                <div style={{display:'flex', alignItems:'center', gap:8}}>
                  <div style={{width:3, height:14, borderRadius:2, background:r.designer?.color}}/>
                  <span style={{fontWeight:600, color:C_INK}}>{r.name}</span>
                  <span style={{fontSize:10.5, color:C_MUTED}}>{r.designer?.role}</span>
                </div>
              </td>
              <td style={c_td}>{r.count}건</td>
              <td style={{...c_td, color: r.cash > 0 ? C_INK : '#CBD5E1'}}>{r.cash > 0 ? new Intl.NumberFormat('ko-KR').format(r.cash) : '0'}</td>
              <td style={{...c_td, color: r.card > 0 ? C_INK : '#CBD5E1'}}>{r.card > 0 ? new Intl.NumberFormat('ko-KR').format(r.card) : '0'}</td>
              <td style={{...c_td, color: r.ticket > 0 ? C_INK : '#CBD5E1'}}>{r.ticket > 0 ? new Intl.NumberFormat('ko-KR').format(r.ticket) : '0'}</td>
              <td style={{...c_td, color: r.discount > 0 ? '#EF4444' : '#CBD5E1'}}>{r.discount > 0 ? '-'+new Intl.NumberFormat('ko-KR').format(r.discount) : '0'}</td>
              <td style={{padding:'8px 12px'}}>
                <div style={{height:6, background:'#F1F5F9', borderRadius:3, overflow:'hidden'}}>
                  <div style={{width:`${r.real/maxReal*100}%`, height:'100%', background:r.designer?.color}}/>
                </div>
              </td>
              <td style={{...c_td, color:C_BLUE, fontWeight:700, background:'#FBFCFE'}}>{new Intl.NumberFormat('ko-KR').format(r.real)}</td>
            </tr>
          ))}
          <tr style={{borderTop:`2px solid ${C_BLUE}`, background:C_BLUE_SOFT}}>
            <td colSpan="7" style={{...c_td, textAlign:'right', color:C_INK, fontWeight:700}}>합계</td>
            <td/>
            <td style={{...c_td, color:C_BLUE, fontWeight:700, fontSize:14}}>{new Intl.NumberFormat('ko-KR').format(grand)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ─ 매출 마감: 리스트+상세 (좌 리스트, 우 카드 하나) ─
function C_SalesListDetail({ selected, onSelect }) {
  const ids = Object.keys(CLOSING_TODAY);
  const cur = CLOSING_TODAY[selected] || CLOSING_TODAY[ids[0]];
  const curId = CLOSING_TODAY[selected] ? selected : ids[0];
  const curDesigner = DESIGNERS.find(x => x.id === curId);
  return (
    <div style={{display:'grid', gridTemplateColumns:'260px 1fr', gap:12}}>
      <div style={{background:C_SURFACE, borderRadius:10, border:`1px solid ${C_BORDER}`, overflow:'hidden', maxHeight:640, overflowY:'auto'}}>
        {ids.map(id => {
          const d = CLOSING_TODAY[id];
          const total = d.rows.reduce((a,r) => a+r.amount, 0) + (d.ticket||0) - (d.coupon||0) + (d.help||0);
          const active = id === curId;
          const designer = DESIGNERS.find(x => x.id === id);
          return (
            <div key={id} onClick={() => onSelect(id)} style={{
              padding:'12px 14px', borderBottom:`1px solid ${C_BORDER}`,
              cursor:'pointer',
              background: active ? C_BLUE_SOFT : 'transparent',
              display:'flex', alignItems:'center', gap:10,
              transition:'background 0.12s',
            }}>
              <div style={{width:4, height:26, borderRadius:2, background:designer?.color}}/>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:13, fontWeight:600, color:C_INK}}>{d.name}</div>
                <div style={{fontSize:10.5, color:C_MUTED}}>{d.rows.length}건</div>
              </div>
              <div style={{fontSize:13, fontWeight:700, color: active ? C_BLUE : C_INK, fontVariantNumeric:'tabular-nums'}}>
                ₩{Math.round(total/1000)}K
              </div>
            </div>
          );
        })}
      </div>
      <div>
        <C_DesignerClosingCard id={curId} d={cur} designer={curDesigner}/>
      </div>
    </div>
  );
}

// ─ 내수 마감 ─
function C_InternalClosing() {
  return (
    <div style={{display:'flex', flexDirection:'column', gap:14}}>
      {/* 정액권 판매 */}
      <div style={{background:C_SURFACE, borderRadius:10, border:`1px solid ${C_BORDER}`, overflow:'hidden'}}>
        <div style={{padding:'14px 18px', borderBottom:`1px solid ${C_BORDER}`, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{fontSize:13.5, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>정액권 판매</div>
          <div style={{fontSize:12, color:C_MUTED}}>{CLOSING_INTERNAL.ticketSold.length}건 · ₩ {new Intl.NumberFormat('ko-KR').format(CLOSING_INTERNAL.ticketSold.reduce((a,t)=>a+t.amount,0))}</div>
        </div>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:12.5, fontVariantNumeric:'tabular-nums'}}>
          <thead><tr style={{background:'#FBFCFE'}}>
            <th style={{...c_th, textAlign:'left'}}>정액권명</th>
            <th style={{...c_th, textAlign:'left'}}>고객</th>
            <th style={{...c_th, textAlign:'left'}}>디자이너</th>
            <th style={c_th}>수량</th>
            <th style={c_th}>금액</th>
          </tr></thead>
          <tbody>
            {CLOSING_INTERNAL.ticketSold.map((t, i) => {
              const d = DESIGNERS.find(x => x.id === t.designer);
              return (
                <tr key={i} style={{borderTop:`1px solid ${C_BORDER}`}}>
                  <td style={{...c_tdName, fontWeight:600, color:C_INK}}>{t.name}</td>
                  <td style={{...c_tdName, color:C_BLUE}}>{t.customer}</td>
                  <td style={c_tdName}>
                    <span style={{display:'inline-flex', alignItems:'center', gap:5}}>
                      <span style={{width:6, height:6, borderRadius:'50%', background:d?.color}}/>
                      {d?.name}
                    </span>
                  </td>
                  <td style={c_td}>{t.qty}</td>
                  <td style={{...c_td, fontWeight:700, color:C_INK}}>{new Intl.NumberFormat('ko-KR').format(t.amount)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 정액권 사용 */}
      <div style={{background:C_SURFACE, borderRadius:10, border:`1px solid ${C_BORDER}`, overflow:'hidden'}}>
        <div style={{padding:'14px 18px', borderBottom:`1px solid ${C_BORDER}`, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{fontSize:13.5, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>정액권 사용</div>
          <div style={{fontSize:12, color:C_MUTED}}>{CLOSING_INTERNAL.ticketUsed.length}건 사용</div>
        </div>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:12.5, fontVariantNumeric:'tabular-nums'}}>
          <thead><tr style={{background:'#FBFCFE'}}>
            <th style={{...c_th, textAlign:'left'}}>정액권명</th>
            <th style={{...c_th, textAlign:'left'}}>고객</th>
            <th style={{...c_th, textAlign:'left'}}>디자이너</th>
            <th style={c_th}>사용 횟수</th>
          </tr></thead>
          <tbody>
            {CLOSING_INTERNAL.ticketUsed.map((t, i) => {
              const d = DESIGNERS.find(x => x.id === t.designer);
              return (
                <tr key={i} style={{borderTop:`1px solid ${C_BORDER}`}}>
                  <td style={{...c_tdName, fontWeight:600, color:C_INK}}>{t.name}</td>
                  <td style={{...c_tdName, color:C_BLUE}}>{t.customer}</td>
                  <td style={c_tdName}>
                    <span style={{display:'inline-flex', alignItems:'center', gap:5}}>
                      <span style={{width:6, height:6, borderRadius:'50%', background:d?.color}}/>
                      {d?.name}
                    </span>
                  </td>
                  <td style={c_td}>{t.qty}회</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 재고 사용 */}
      <div style={{background:C_SURFACE, borderRadius:10, border:`1px solid ${C_BORDER}`, overflow:'hidden'}}>
        <div style={{padding:'14px 18px', borderBottom:`1px solid ${C_BORDER}`, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{fontSize:13.5, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>재고 사용</div>
          <div style={{fontSize:12, color:C_MUTED}}>총 ₩ {new Intl.NumberFormat('ko-KR').format(CLOSING_INTERNAL.stockUsed.reduce((a,s)=>a+s.amount,0))}</div>
        </div>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:12.5, fontVariantNumeric:'tabular-nums'}}>
          <thead><tr style={{background:'#FBFCFE'}}>
            <th style={{...c_th, textAlign:'left'}}>제품명</th>
            <th style={c_th}>수량</th>
            <th style={c_th}>금액</th>
          </tr></thead>
          <tbody>
            {CLOSING_INTERNAL.stockUsed.map((s, i) => (
              <tr key={i} style={{borderTop:`1px solid ${C_BORDER}`}}>
                <td style={{...c_tdName, fontWeight:600, color:C_INK}}>{s.name}</td>
                <td style={c_td}>{s.qty}개</td>
                <td style={{...c_td, fontWeight:600, color:C_INK}}>{new Intl.NumberFormat('ko-KR').format(s.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─ 메타 매출 ─
function C_MetaClosing() {
  const total = CLOSING_META.reduce((a,m)=>a+m.amount, 0);
  return (
    <div>
      <div style={{
        background:'#EFF3FC', borderRadius:10, border:`1px solid #C7D6F5`,
        padding:'14px 18px', marginBottom:14,
        display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        <div>
          <div style={{fontSize:12, color:C_BLUE, fontWeight:600, letterSpacing:'0.02em'}}>메타 매출 · 오늘 정산</div>
          <div style={{fontSize:11.5, color:C_MUTED, marginTop:4}}>외부 채널 및 광고비, 제휴 정산 (매출 마감과 별도 집계)</div>
        </div>
        <div style={{fontSize:22, fontWeight:700, color: total >= 0 ? C_BLUE : '#EF4444', fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em'}}>
          {total >= 0 ? '+' : ''}₩ {new Intl.NumberFormat('ko-KR').format(total)}
        </div>
      </div>

      <div style={{background:C_SURFACE, borderRadius:10, border:`1px solid ${C_BORDER}`, overflow:'hidden'}}>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:12.5, fontVariantNumeric:'tabular-nums'}}>
          <thead><tr style={{background:'#FBFCFE'}}>
            <th style={{...c_th, textAlign:'left'}}>정산 출처</th>
            <th style={c_th}>건수</th>
            <th style={{...c_th, textAlign:'left'}}>비고</th>
            <th style={c_th}>금액</th>
          </tr></thead>
          <tbody>
            {CLOSING_META.map((m, i) => (
              <tr key={i} style={{borderTop:`1px solid ${C_BORDER}`}}>
                <td style={{...c_tdName, fontWeight:600, color:C_INK}}>{m.source}</td>
                <td style={c_td}>{m.count}건</td>
                <td style={{...c_tdName, color:C_MUTED, fontSize:11.5}}>{m.note}</td>
                <td style={{...c_td, fontWeight:700, color: m.amount >= 0 ? C_INK : '#EF4444'}}>
                  {m.amount >= 0 ? '+' : ''}{new Intl.NumberFormat('ko-KR').format(m.amount)}
                </td>
              </tr>
            ))}
            <tr style={{borderTop:`2px solid ${C_BLUE}`, background:C_BLUE_SOFT}}>
              <td colSpan="3" style={{...c_td, textAlign:'right', color:C_INK, fontWeight:700}}>합계</td>
              <td style={{...c_td, fontWeight:700, color: total >= 0 ? C_BLUE : '#EF4444', fontSize:14}}>
                {total >= 0 ? '+' : ''}₩ {new Intl.NumberFormat('ko-KR').format(total)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

const c_thSm = { padding:'6px 8px', fontSize:10.5, fontWeight:600, color:'#5C6B84' };
const c_tdSm = { padding:'6px 8px', fontSize:11.5 };

window.C_ClosingPage = C_ClosingPage;
