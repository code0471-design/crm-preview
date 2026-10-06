// 객수 통계 페이지 — 3 layouts: 표+차트+카드 / 표만 / 카드 그리드

// variant-c.jsx가 window에 노출한 상수/스타일을 읽어옴
const {
  C_BLUE, C_BLUE_SOFT, C_INK, C_MUTED, C_BORDER, C_BG, C_SURFACE,
  c_iconBtnSm, c_ghostBtnSm,
} = window;

function C_StatsPage() {
  const [layout, setLayout] = React.useState('full'); // full | table | cards
  const [period, setPeriod] = React.useState('week');

  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden', background:C_BG}}>
      <div style={{width: 948, flexShrink: 0, flex:1, display:'flex', flexDirection:'column', minHeight:0}}>
        <C_StatsSubHeader
          period={period} setPeriod={setPeriod}
          layout={layout} setLayout={setLayout}
        />
        <div style={{flex:1, overflow:'auto', padding:'16px 20px 24px'}}>
          {/* 브레드크럼 */}
          <div style={{fontSize:12, color:C_MUTED, marginBottom:14}}>
            홈 <span style={{margin:'0 6px'}}>›</span>
            <span style={{color:C_INK, fontWeight:600}}>객수 통계</span>
          </div>

          {/* KPI 스트립 */}
          <C_StatsKPIs/>

          {/* 레이아웃별 본문 */}
          {layout === 'full' && (
            <>
              <C_StatsTrendChart/>
              <C_StatsVisitTable/>
              <C_StatsChannelBreakdown/>
            </>
          )}
          {layout === 'table' && <C_StatsVisitTable/>}
          {layout === 'cards' && <C_StatsChannelCards/>}
        </div>
      </div>
    </div>
  );
}

// ─ 서브헤더 ─
function C_StatsSubHeader({ period, setPeriod, layout, setLayout }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:8,
      padding:'10px 14px', background:C_SURFACE, borderBottom:`1px solid ${C_BORDER}`,
    }}>
      {/* 기간 라벨 */}
      <span style={{fontSize:12.5, color:C_MUTED, fontWeight:500, flexShrink:0}}>기간</span>

      {/* 기간 date picker (목업) */}
      <div style={{display:'flex', alignItems:'center', gap:6, flexShrink:0}}>
        <div style={c_dateInput}>26년 09월 06일 <IconChevronD size={11} style={{color:C_MUTED}}/></div>
        <span style={{color:C_MUTED, fontSize:12}}>~</span>
        <div style={c_dateInput}>26년 09월 11일 <IconChevronD size={11} style={{color:C_MUTED}}/></div>
      </div>

      {/* 프리셋 */}
      <div style={{display:'flex', gap:4, flexShrink:0}}>
        {[
          { id:'week', label:'이번 주' },
          { id:'month',label:'이번 달' },
          { id:'year', label:'올해' },
        ].map(p => (
          <button key={p.id} onClick={() => setPeriod(p.id)} style={{
            padding:'6px 12px', fontSize:12, fontWeight:600,
            border:`1px solid ${period===p.id ? C_BLUE : C_BORDER}`,
            borderRadius:14, cursor:'pointer',
            background: period===p.id ? C_BLUE_SOFT : C_SURFACE,
            color: period===p.id ? C_BLUE : C_MUTED,
          }}>{p.label}</button>
        ))}
      </div>

      <div style={{flex:1}}/>

      {/* 레이아웃 스위치 */}
      <div style={{display:'flex', background:C_BG, borderRadius:7, padding:2, border:`1px solid ${C_BORDER}`, flexShrink:0}}>
        {[
          { id:'full',   label:'상세' },
          { id:'table',  label:'표' },
          { id:'cards',  label:'카드' },
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

      {/* 내보내기 */}
      <button style={{...c_ghostBtnSm, display:'flex', alignItems:'center', gap:5, flexShrink:0}}>
        <IconNote size={12}/> 엑셀
      </button>
    </div>
  );
}

// ─ KPI 스트립 ─
function C_StatsKPIs() {
  // 전체 방문수 계산
  const totals = { road:0, online:0, intro:0, revisit:0, replace:0 };
  Object.values(STATS_VISITS).forEach(v => {
    Object.keys(totals).forEach(k => { totals[k] += v[k] || 0; });
  });
  const total = Object.values(totals).reduce((a,b)=>a+b, 0);
  const newCustomer = totals.road + totals.online + totals.intro;
  const revisit = totals.revisit;
  const revisitRate = total > 0 ? Math.round(revisit / total * 100) : 0;
  const avgPerDay = Math.round(total / 6);

  const kpis = [
    { label:'총 방문',     value:`${total}명`,           sub:'이번주 누적',       accent:C_INK,  icon:<IconUser/>, tint:'#EFF3FC', iconColor:C_BLUE },
    { label:'신규 고객',   value:`${newCustomer}명`,     sub:`전체의 ${Math.round(newCustomer/total*100)}%`, accent:'#059669', icon:<IconTrend/>, tint:'#F0FDF4', iconColor:'#059669' },
    { label:'재방문',      value:`${revisit}명`,         sub:`재방문율 ${revisitRate}%`, accent:C_INK, icon:<IconCalendar/>, tint:'#F5F3FF', iconColor:'#7C3AED' },
    { label:'일평균',      value:`${avgPerDay}명`,       sub:'6일 기준',                 accent:C_INK, icon:<IconChart/>, tint:'#FEF3C7', iconColor:'#D97706' },
  ];

  return (
    <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12, marginBottom:16}}>
      {kpis.map((k, i) => (
        <div key={i} style={{
          background:C_SURFACE, padding:'14px 16px', borderRadius:10,
          border:`1px solid ${C_BORDER}`,
        }}>
          <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10}}>
            <div style={{fontSize:11.5, color:C_MUTED, fontWeight:500}}>{k.label}</div>
            <div style={{
              width:26, height:26, borderRadius:6, background:k.tint,
              color:k.iconColor, display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              {React.cloneElement(k.icon, { size:14 })}
            </div>
          </div>
          <div style={{fontSize:22, fontWeight:700, color:k.accent, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em', lineHeight:1.1}}>
            {k.value}
          </div>
          <div style={{fontSize:11, color:C_MUTED, marginTop:5}}>{k.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ─ 방문 현황 표 (스크린샷 스타일) ─
function C_StatsVisitTable() {
  const designers = DESIGNERS; // 전체 표시
  const totals = { road:0, online:0, intro:0, revisit:0, replace:0 };
  designers.forEach(d => {
    const v = STATS_VISITS[d.id];
    if (!v) return;
    Object.keys(totals).forEach(k => { totals[k] += v[k] || 0; });
  });
  const grandTotal = Object.values(totals).reduce((a,b)=>a+b, 0);

  return (
    <div style={{background:C_SURFACE, borderRadius:10, border:`1px solid ${C_BORDER}`, overflow:'hidden', marginBottom:16}}>
      <div style={{padding:'14px 18px', borderBottom:`1px solid ${C_BORDER}`, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div>
          <div style={{fontSize:13.5, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>방문 현황</div>
          <div style={{fontSize:11.5, color:C_MUTED, marginTop:2}}>디자이너 · 채널별 방문 수</div>
        </div>
        <div style={{display:'flex', gap:10, fontSize:11}}>
          {STATS_CHANNELS.map(c => (
            <span key={c.id} style={{display:'flex', alignItems:'center', gap:4, color:C_MUTED}}>
              <span style={{width:8, height:8, borderRadius:2, background:c.color}}/>
              {c.label}
            </span>
          ))}
        </div>
      </div>
      <table style={{width:'100%', borderCollapse:'collapse', fontSize:12.5, fontVariantNumeric:'tabular-nums'}}>
        <thead>
          <tr style={{background:'#FBFCFE'}}>
            <th style={c_th}>디자이너</th>
            {STATS_CHANNELS.map(c => (
              <th key={c.id} style={c_th}>
                <span style={{display:'inline-flex', alignItems:'center', gap:5}}>
                  <span style={{width:6, height:6, borderRadius:'50%', background:c.color}}/>
                  {c.label}
                </span>
              </th>
            ))}
            <th style={{...c_th, background:C_BLUE_SOFT, color:C_BLUE}}>합계</th>
          </tr>
        </thead>
        <tbody>
          {designers.map(d => {
            const v = STATS_VISITS[d.id] || {road:0, online:0, intro:0, revisit:0, replace:0};
            const rowTotal = Object.values(v).reduce((a,b)=>a+b, 0);
            return (
              <tr key={d.id} style={{borderTop:`1px solid ${C_BORDER}`}}>
                <td style={c_tdName}>
                  <div style={{display:'flex', alignItems:'center', gap:8}}>
                    <div style={{width:3, height:14, borderRadius:2, background:d.color}}/>
                    <span style={{fontWeight:600, color:C_INK}}>{d.name}</span>
                    <span style={{fontSize:10.5, color:C_MUTED}}>{d.role}</span>
                  </div>
                </td>
                {STATS_CHANNELS.map(c => (
                  <td key={c.id} style={c_td}>
                    <span style={{
                      color: v[c.id] > 0 ? C_INK : '#CBD5E1',
                      fontWeight: v[c.id] > 0 ? 600 : 400,
                    }}>{v[c.id]}명</span>
                  </td>
                ))}
                <td style={{...c_td, background:'#FBFCFE', color:C_BLUE, fontWeight:700}}>{rowTotal}명</td>
              </tr>
            );
          })}
          <tr style={{borderTop:`2px solid ${C_BLUE}`, background:C_BLUE_SOFT}}>
            <td style={{...c_tdName, fontWeight:700, color:C_INK}}>합계</td>
            {STATS_CHANNELS.map(c => (
              <td key={c.id} style={{...c_td, fontWeight:700, color:C_INK}}>{totals[c.id]}명</td>
            ))}
            <td style={{...c_td, fontWeight:700, color:C_BLUE, fontSize:14}}>{grandTotal}명</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ─ 채널별 추이 (라인차트) ─
function C_StatsTrendChart() {
  const W = 900, H = 220, PAD_L = 40, PAD_R = 12, PAD_T = 12, PAD_B = 32;
  const maxVal = Math.max(...STATS_TREND.flatMap(d => STATS_CHANNELS.map(c => d[c.id])));
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;
  const xStep = chartW / (STATS_TREND.length - 1);

  const xAt = (i) => PAD_L + i * xStep;
  const yAt = (v) => PAD_T + chartH - (v / maxVal) * chartH;

  return (
    <div style={{background:C_SURFACE, borderRadius:10, border:`1px solid ${C_BORDER}`, padding:'16px 18px', marginBottom:16}}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12}}>
        <div>
          <div style={{fontSize:13.5, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>채널별 방문 추이</div>
          <div style={{fontSize:11.5, color:C_MUTED, marginTop:2}}>일자별 방문 수 · 이번 주</div>
        </div>
        <div style={{display:'flex', gap:12, fontSize:11}}>
          {STATS_CHANNELS.map(c => (
            <span key={c.id} style={{display:'flex', alignItems:'center', gap:5, color:C_INK, fontWeight:500}}>
              <span style={{width:10, height:2, background:c.color, borderRadius:1}}/>
              {c.label}
            </span>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{overflow:'visible'}}>
        {/* Y축 그리드 */}
        {[0, 0.25, 0.5, 0.75, 1].map(t => (
          <g key={t}>
            <line x1={PAD_L} y1={PAD_T + chartH * t} x2={W - PAD_R} y2={PAD_T + chartH * t}
                  stroke={C_BORDER} strokeDasharray={t === 1 ? '' : '3 3'}/>
            <text x={PAD_L - 6} y={PAD_T + chartH * t + 3} textAnchor="end"
                  fontSize="10" fill={C_MUTED} fontFamily="inherit">
              {Math.round(maxVal * (1 - t))}
            </text>
          </g>
        ))}
        {/* X축 라벨 */}
        {STATS_TREND.map((d, i) => (
          <text key={d.date} x={xAt(i)} y={H - 10} textAnchor="middle"
                fontSize="10.5" fill={C_MUTED} fontFamily="inherit" fontVariantNumeric="tabular-nums">
            {d.date}
            <tspan x={xAt(i)} dy="12" fontSize="9" fill={i===0 ? '#EF4444' : i===6 ? C_BLUE : C_MUTED}>{d.dow}</tspan>
          </text>
        ))}
        {/* 라인 */}
        {STATS_CHANNELS.map(c => {
          const points = STATS_TREND.map((d, i) => `${xAt(i)},${yAt(d[c.id])}`).join(' ');
          return (
            <g key={c.id}>
              <polyline points={points} fill="none" stroke={c.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              {STATS_TREND.map((d, i) => (
                <circle key={i} cx={xAt(i)} cy={yAt(d[c.id])} r="3" fill="#fff" stroke={c.color} strokeWidth="2"/>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─ 채널 분석 (도넛 + 재방문율) ─
function C_StatsChannelBreakdown() {
  const totals = { road:0, online:0, intro:0, revisit:0, replace:0 };
  Object.values(STATS_VISITS).forEach(v => {
    Object.keys(totals).forEach(k => { totals[k] += v[k] || 0; });
  });
  const total = Object.values(totals).reduce((a,b)=>a+b, 0);
  const revisitPct = Math.round(totals.revisit / total * 100);
  const newPct = 100 - revisitPct - Math.round(totals.replace / total * 100);

  return (
    <div style={{display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:12, marginBottom:8}}>
      {/* 채널 도넛 */}
      <div style={{background:C_SURFACE, borderRadius:10, border:`1px solid ${C_BORDER}`, padding:'16px 18px'}}>
        <div style={{fontSize:13, fontWeight:700, color:C_INK, marginBottom:14, letterSpacing:'-0.01em'}}>채널 구성비</div>
        <div style={{display:'flex', alignItems:'center', gap:20}}>
          <C_Donut data={STATS_CHANNELS.map(c => ({ ...c, value: totals[c.id] }))} total={total}/>
          <div style={{flex:1, display:'flex', flexDirection:'column', gap:7}}>
            {STATS_CHANNELS.map(c => (
              <div key={c.id} style={{display:'flex', alignItems:'center', gap:6, fontSize:11.5}}>
                <span style={{width:9, height:9, borderRadius:2, background:c.color}}/>
                <span style={{color:C_INK, fontWeight:500, flex:1}}>{c.label}</span>
                <span style={{color:C_MUTED, fontVariantNumeric:'tabular-nums'}}>{total > 0 ? Math.round(totals[c.id]/total*100) : 0}%</span>
                <span style={{color:C_INK, fontWeight:600, fontVariantNumeric:'tabular-nums', minWidth:36, textAlign:'right'}}>{totals[c.id]}명</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 재방문율 게이지 */}
      <div style={{background:C_SURFACE, borderRadius:10, border:`1px solid ${C_BORDER}`, padding:'16px 18px'}}>
        <div style={{fontSize:13, fontWeight:700, color:C_INK, marginBottom:14, letterSpacing:'-0.01em'}}>재방문율</div>
        <div style={{display:'flex', alignItems:'center', gap:20}}>
          <div style={{position:'relative', width:130, height:80}}>
            <svg viewBox="0 0 130 80" width="130" height="80">
              <path d="M 15 70 A 50 50 0 0 1 115 70" fill="none" stroke="#EEF1F6" strokeWidth="12" strokeLinecap="round"/>
              <path d={`M 15 70 A 50 50 0 0 1 ${15 + (revisitPct/100)*100} ${70 - Math.sin((revisitPct/100)*Math.PI)*50}`}
                    fill="none" stroke="#7C3AED" strokeWidth="12" strokeLinecap="round"/>
              <text x="65" y="60" textAnchor="middle" fontSize="22" fontWeight="700" fill={C_INK} fontFamily="inherit">
                {revisitPct}%
              </text>
            </svg>
          </div>
          <div style={{flex:1, display:'flex', flexDirection:'column', gap:6, fontSize:12}}>
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <span style={{color:C_MUTED}}>신규 방문</span>
              <span style={{color:C_INK, fontWeight:600, fontVariantNumeric:'tabular-nums'}}>{newPct}%</span>
            </div>
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <span style={{color:C_MUTED}}>재방문</span>
              <span style={{color:'#7C3AED', fontWeight:700, fontVariantNumeric:'tabular-nums'}}>{revisitPct}%</span>
            </div>
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <span style={{color:C_MUTED}}>대체</span>
              <span style={{color:C_INK, fontWeight:600, fontVariantNumeric:'tabular-nums'}}>{Math.round(totals.replace/total*100)}%</span>
            </div>
            <div style={{
              marginTop:6, padding:'6px 8px', background:'#F5F3FF', borderRadius:6,
              fontSize:11, color:'#6D28D9', fontWeight:500,
            }}>지난 주 대비 <strong style={{fontWeight:700}}>+4%p</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─ 카드 그리드 뷰 ─
function C_StatsChannelCards() {
  const designers = DESIGNERS.filter(d => d.id !== 'unassigned');
  return (
    <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10}}>
      {designers.map(d => {
        const v = STATS_VISITS[d.id] || {};
        const total = Object.values(v).reduce((a,b)=>a+b, 0);
        const maxCh = STATS_CHANNELS.reduce((mx, c) => v[c.id] > (v[mx.id]||0) ? c : mx, STATS_CHANNELS[0]);
        return (
          <div key={d.id} style={{
            background:C_SURFACE, borderRadius:10, border:`1px solid ${C_BORDER}`,
            padding:'12px 14px',
          }}>
            <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
              <div style={{width:4, height:20, borderRadius:2, background:d.color}}/>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:13, fontWeight:700, color:C_INK}}>{d.name}</div>
                <div style={{fontSize:10.5, color:C_MUTED}}>{d.role}</div>
              </div>
              <div style={{fontSize:20, fontWeight:700, color:C_INK, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em'}}>{total}<span style={{fontSize:11, color:C_MUTED, fontWeight:500, marginLeft:2}}>명</span></div>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:4}}>
              {STATS_CHANNELS.map(c => {
                const val = v[c.id] || 0;
                const pct = total > 0 ? val / total * 100 : 0;
                return (
                  <div key={c.id} style={{display:'flex', alignItems:'center', gap:6, fontSize:11}}>
                    <span style={{width:6, height:6, borderRadius:'50%', background:c.color, flexShrink:0}}/>
                    <span style={{color:C_MUTED, minWidth:64}}>{c.label}</span>
                    <div style={{flex:1, height:5, background:'#F1F5F9', borderRadius:3, overflow:'hidden'}}>
                      <div style={{width:`${pct}%`, height:'100%', background:c.color}}/>
                    </div>
                    <span style={{color:C_INK, fontWeight:600, fontVariantNumeric:'tabular-nums', minWidth:22, textAlign:'right'}}>{val}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─ 도넛 SVG ─
function C_Donut({ data, total }) {
  const r = 46, r2 = 30, cx = 60, cy = 60;
  let acc = 0;
  return (
    <div style={{position:'relative', flexShrink:0}}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        {data.map(d => {
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
            <path key={d.id}
              d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${r2} ${r2} 0 ${large} 0 ${x4} ${y4} Z`}
              fill={d.color}/>
          );
        })}
      </svg>
      <div style={{position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', textAlign:'center'}}>
        <div style={{fontSize:10, color:C_MUTED}}>총 방문</div>
        <div style={{fontSize:15, fontWeight:700, color:C_INK, fontVariantNumeric:'tabular-nums'}}>{total}명</div>
      </div>
    </div>
  );
}

// ─ 표 셀 스타일 ─
const c_th = {
  padding:'10px 12px', textAlign:'right', fontSize:11, fontWeight:600,
  color:'#5C6B84', letterSpacing:'0.02em',
  borderBottom:`1px solid ${C_BORDER}`,
};
const c_td = { padding:'10px 12px', textAlign:'right', fontSize:12 };
const c_tdName = { padding:'8px 14px', textAlign:'left', fontSize:12 };

const c_dateInput = {
  padding:'6px 10px', background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:14,
  fontSize:12, color:C_INK, fontWeight:500, cursor:'pointer', whiteSpace:'nowrap',
  fontVariantNumeric:'tabular-nums',
  display:'inline-flex', alignItems:'center', gap:6,
};

window.C_StatsPage = C_StatsPage;
