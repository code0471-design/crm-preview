// 마케팅 › 발송내역 & 성과리포트
const {
  C_BLUE, C_BLUE_SOFT, C_CORAL, C_INK, C_MUTED, C_BORDER, C_BG, C_SURFACE,
  c_ghostBtnSm, MKT_UNIT,
  RP_WINDOWS, RP_BULK, RP_AUTO, RP_DAILY, rpRecipients,
} = window;

const rpWon = (n) => Math.round(n).toLocaleString() + '원';
const rpMan = (n) => n >= 10000 ? Math.round(n / 10000).toLocaleString() + '만' : n.toLocaleString();
const rpPct = (a, b) => b ? Math.round((a / b) * 1000) / 10 : 0;
const RP_CH = {
  alimtalk:{ label:'알림톡', bg:'#FEF9C3', fg:'#713F12' },
  sms:{ label:'SMS', bg:'#ECFDF5', fg:'#047857' },
  lms:{ label:'LMS', bg:'#EFF6FF', fg:'#1D4ED8' },
  mms:{ label:'MMS', bg:'#F5F3FF', fg:'#6D28D9' },
};
const RP_AUTO_C = '#93A8D8';
const RP_BULK_C = C_BLUE;

function rpScale(c, k) {
  if (!c.conv) return { ...c, booked:0, visited:0, revenue:0 };
  return { ...c, booked: Math.round((c.booked || 0) * k), visited: Math.round((c.visited || 0) * k), revenue: Math.round((c.revenue || 0) * k / 1000) * 1000 };
}

function RpChBadge({ ch }) {
  const m = RP_CH[ch];
  return <span style={{fontSize:10.5, fontWeight:800, padding:'2px 7px', borderRadius:5, background:m.bg, color:m.fg, whiteSpace:'nowrap'}}>{m.label}</span>;
}

// ───────── 페이지 ─────────
function C_MktReportPage() {
  const [period, setPeriod] = React.useState('this');
  const [win, setWin] = React.useState('14');
  const [tab, setTab] = React.useState('bulk');
  const [q, setQ] = React.useState('');
  const [detail, setDetail] = React.useState(null);
  const [toast, setToast] = React.useState(null);
  const [bulk, setBulk] = React.useState(RP_BULK);
  React.useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2200); return () => clearTimeout(t); }, [toast]);

  const k = RP_WINDOWS.find(w => w.id === win).k;
  const inPeriod = (c) => period === 'this' ? c.at.startsWith('2026-09') : period === 'last' ? c.at.startsWith('2026-08') : true;
  const bulkRows = bulk.filter(inPeriod).map(c => rpScale(c, k));
  const autoMul = period === 'this' ? 1 : period === 'last' ? 1.08 : 3.1;
  const autoRows = RP_AUTO.map(a => {
    const m = (v) => Math.round((v || 0) * autoMul);
    return rpScale({ ...a, sent:m(a.sent), ok:m(a.ok), fallback:m(a.fallback), fail:m(a.fail), cost:m(a.cost), booked:m(a.booked), visited:m(a.visited), revenue:m(a.revenue) }, k);
  });

  const done = bulkRows.filter(c => c.status === 'done');
  const all = [...done, ...autoRows];
  const sum = (key, arr = all) => arr.reduce((s, c) => s + (c[key] || 0), 0);
  const sent = sum('sent'), ok = sum('ok') + sum('fallback'), cost = sum('cost');
  const convBase = all.filter(c => c.conv);
  const convOk = sum('ok', convBase) + sum('fallback', convBase);
  const booked = sum('booked'), visited = sum('visited'), revenue = sum('revenue');

  const ql = q.trim();
  const shownBulk = bulkRows.filter(c => !ql || c.title.includes(ql));

  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden', background:C_BG, position:'relative'}}>
      <div style={{width:948, flexShrink:0, flex:1, display:'flex', flexDirection:'column', minHeight:0}}>
        {/* 서브헤더 */}
        <div style={{display:'flex', alignItems:'center', gap:10, padding:'0 14px', height:49, background:C_SURFACE, borderBottom:`1px solid ${C_BORDER}`, flexShrink:0}}>
          <div style={{fontSize:12.5, color:C_MUTED, whiteSpace:'nowrap'}}>
            홈 <span style={{margin:'0 6px'}}>›</span>마케팅<span style={{margin:'0 6px'}}>›</span>
            <span style={{color:C_INK, fontWeight:600}}>발송내역 &amp; 성과리포트</span>
          </div>
          <div style={{flex:1}}/>
          <window.MktSeg size="sm" value={period} onChange={setPeriod} options={[
            { id:'this', label:'이번 달' }, { id:'last', label:'지난 달' }, { id:'90', label:'최근 90일' },
          ]}/>
          <button style={{...c_ghostBtnSm, fontFamily:'inherit'}}>엑셀 다운로드</button>
        </div>

        <div className="mkt-scroll" style={{flex:1, overflow:'auto', padding:'16px 20px 24px', display:'flex', flexDirection:'column', gap:14}}>
          <style>{`.mkt-scroll > * { flex-shrink: 0; }`}</style>

          {/* 전환 기준 */}
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <div style={{fontSize:15, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>
              {period === 'this' ? '2026년 9월' : period === 'last' ? '2026년 8월' : '최근 90일'} 성과
            </div>
            <span style={{fontSize:11.5, color:C_MUTED}}>{period === 'this' ? '9월 1일 ~ 21일 (오늘)' : period === 'last' ? '8월 1일 ~ 31일' : '6월 23일 ~ 9월 21일'}</span>
            <div style={{flex:1}}/>
            <span style={{fontSize:12, color:C_MUTED}}>전환 집계: 받은 날로부터</span>
            <window.MktSeg size="sm" value={win} onChange={setWin} options={RP_WINDOWS.map(w => ({ id:w.id, label:w.label }))}/>
            <span style={{fontSize:12, color:C_MUTED}}>이내</span>
          </div>

          {/* KPI */}
          <div style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:10, overflow:'hidden'}}>
            {[
              { l:'발송', v:sent.toLocaleString(), u:'건', sub:`성공 ${rpPct(ok, sent)}%` },
              { l:'사용 금액', v:cost.toLocaleString(), u:'원', sub:`건당 평균 ${sent ? (cost / ok).toFixed(1) : 0}원` },
              { l:'발송 후 예약', v:booked.toLocaleString(), u:'명', sub:`예약 전환 ${rpPct(booked, convOk)}%`, hl:true },
              { l:'발송 후 방문', v:visited.toLocaleString(), u:'명', sub:`방문 전환 ${rpPct(visited, convOk)}%`, hl:true },
              { l:'방문 매출', v:rpMan(revenue), u:'원', sub:`비용 대비 ${cost ? Math.round(revenue / cost).toLocaleString() : 0}배`, hl:true },
            ].map((x, i) => (
              <div key={i} style={{padding:'14px 16px', borderLeft: i ? `1px solid ${C_BORDER}` : 'none'}}>
                <div style={{fontSize:11.5, fontWeight:600, color:C_MUTED}}>{x.l}</div>
                <div style={{display:'flex', alignItems:'baseline', gap:2, marginTop:4}}>
                  <span style={{fontSize:22, fontWeight:800, color: x.hl ? C_BLUE : C_INK, letterSpacing:'-0.02em', fontVariantNumeric:'tabular-nums'}}>{x.v}</span>
                  <span style={{fontSize:12, fontWeight:600, color:C_MUTED}}>{x.u}</span>
                </div>
                <div style={{fontSize:11, color:C_MUTED, marginTop:3}}>{x.sub}</div>
              </div>
            ))}
          </div>
          <div style={{fontSize:11, color:C_MUTED, marginTop:-6, paddingLeft:2}}>
            전환은 메시지를 받은 고객이 {win}일 안에 예약·방문한 경우로 집계해요. 예약 안내처럼 전환 목적이 아닌 정보성 메시지는 제외돼요.
          </div>

          {/* 일별 차트 */}
          {period === 'this' && <RpDailyChart/>}

          {/* 목록 */}
          <div style={{background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:10, overflow:'hidden'}}>
            <div style={{display:'flex', alignItems:'center', gap:4, padding:'0 14px', borderBottom:`1px solid ${C_BORDER}`, height:48}}>
              {[
                { id:'bulk', label:'단체발송', n:bulkRows.length },
                { id:'auto', label:'자동발송', n:autoRows.length },
              ].map(t => {
                const on = tab === t.id;
                return (
                  <button key={t.id} onClick={() => setTab(t.id)} style={{
                    alignSelf:'stretch', padding:'0 12px', border:'none', background:'transparent', cursor:'pointer', fontFamily:'inherit',
                    fontSize:13, fontWeight: on ? 700 : 500, color: on ? C_INK : C_MUTED,
                    boxShadow: on ? `inset 0 -2px 0 ${C_BLUE}` : 'none', display:'flex', alignItems:'center', gap:6,
                  }}>{t.label}<span style={{fontSize:11, color: on ? C_BLUE : C_MUTED, fontWeight:700}}>{t.n}</span></button>
                );
              })}
              <div style={{flex:1}}/>
              {tab === 'bulk' && (
                <div style={{position:'relative', width:220}}>
                  <IconSearch size={13} style={{position:'absolute', left:9, top:9, color:C_MUTED}}/>
                  <input value={q} onChange={e => setQ(e.target.value)} placeholder="캠페인 이름 검색" style={{
                    width:'100%', height:30, padding:'0 10px 0 28px', border:`1px solid ${C_BORDER}`, borderRadius:6,
                    fontSize:12, color:C_INK, fontFamily:'inherit', outline:'none',
                  }}/>
                </div>
              )}
              {tab === 'auto' && <span style={{fontSize:11.5, color:C_MUTED}}>트리거별 기간 합계</span>}
            </div>
            {tab === 'bulk'
              ? <RpBulkTable rows={shownBulk} onOpen={setDetail}/>
              : <RpAutoTable rows={autoRows}/>}
          </div>
        </div>
      </div>

      {detail && (
        <RpDetail c={rpScale(bulk.find(x => x.id === detail), k)} win={win}
          onClose={() => setDetail(null)}
          onCancel={(id) => { setBulk(b => b.filter(x => x.id !== id)); setDetail(null); setToast('예약 발송을 취소했어요'); }}
          onResend={(label) => { setDetail(null); window.__goPage && window.__goPage('mkt-bulk'); window.__toast && window.__toast(label); }}/>
      )}

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

// ───── 일별 차트 ─────
function RpDailyChart() {
  const [hover, setHover] = React.useState(null);
  const H = 120;
  const max = Math.max(...RP_DAILY.map(d => d.auto + d.bulk));
  const step = max > 500 ? 200 : 100;
  const top = Math.ceil(max / step) * step;
  const DOW = ['일','월','화','수','목','금','토'];
  return (
    <div style={{background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:10, padding:'14px 16px 12px'}}>
      <div style={{display:'flex', alignItems:'center', gap:14, marginBottom:12}}>
        <div style={{fontSize:13, fontWeight:700, color:C_INK, flex:1}}>일별 발송</div>
        {[['자동발송', RP_AUTO_C], ['단체발송', RP_BULK_C]].map(([l, c]) => (
          <span key={l} style={{fontSize:11.5, color:C_MUTED, display:'flex', alignItems:'center', gap:5}}>
            <span style={{width:9, height:9, borderRadius:2, background:c}}/>{l}
          </span>
        ))}
      </div>
      <div style={{display:'flex', gap:8}}>
        <div style={{display:'flex', flexDirection:'column', justifyContent:'space-between', height:H, fontSize:10, color:'#94A3B8', textAlign:'right', width:28, fontVariantNumeric:'tabular-nums'}}>
          {[top, top / 2, 0].map(v => <span key={v} style={{lineHeight:'10px'}}>{v}</span>)}
        </div>
        <div style={{flex:1, position:'relative'}}>
          <div style={{position:'absolute', inset:0, height:H, display:'flex', flexDirection:'column', justifyContent:'space-between', pointerEvents:'none'}}>
            {[0,1,2].map(i => <div key={i} style={{borderTop:`1px ${i === 2 ? 'solid' : 'dashed'} ${C_BORDER}`}}/>)}
          </div>
          <div style={{display:'flex', alignItems:'flex-end', gap:6, height:H, position:'relative'}}>
            {RP_DAILY.map(d => {
              const tot = d.auto + d.bulk;
              const on = hover === d.d;
              return (
                <div key={d.d} onMouseEnter={() => setHover(d.d)} onMouseLeave={() => setHover(null)}
                  style={{flex:1, height:'100%', display:'flex', flexDirection:'column', justifyContent:'flex-end', position:'relative', cursor:'default'}}>
                  {on && (
                    <div style={{
                      position:'absolute', bottom: (tot / top) * H + 6, left:'50%', transform:'translateX(-50%)', zIndex:5,
                      background:'#0B1425', color:'#fff', fontSize:11, padding:'6px 9px', borderRadius:6, whiteSpace:'nowrap', lineHeight:1.5,
                    }}>
                      <b>9/{d.d}({DOW[d.dow]})</b> · {tot.toLocaleString()}건<br/>
                      자동 {d.auto} · 단체 {d.bulk}
                    </div>
                  )}
                  {d.bulk > 0 && <div style={{height:(d.bulk / top) * H, background:RP_BULK_C, borderRadius:'3px 3px 0 0', opacity: hover && !on ? 0.5 : 1}}/>}
                  <div style={{height:(d.auto / top) * H, background:RP_AUTO_C, borderRadius: d.bulk ? 0 : '3px 3px 0 0', opacity: hover && !on ? 0.5 : 1}}/>
                </div>
              );
            })}
          </div>
          <div style={{display:'flex', gap:6, marginTop:5}}>
            {RP_DAILY.map(d => (
              <div key={d.d} style={{flex:1, textAlign:'center', fontSize:10, color: d.dow === 0 ? '#DC2626' : '#94A3B8', fontVariantNumeric:'tabular-nums'}}>{d.d}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ───── 단체발송 테이블 ─────
const RP_BULK_COLS = '108px 1fr 70px 96px 120px 92px 96px 20px';
function RpBulkTable({ rows, onOpen }) {
  return (
    <>
      <div style={{display:'grid', gridTemplateColumns:RP_BULK_COLS, gap:10, padding:'9px 16px', background:'#FBFCFE', borderBottom:`1px solid ${C_BORDER}`, fontSize:11, fontWeight:700, color:C_MUTED}}>
        <div>발송 일시</div><div>캠페인</div><div>채널</div>
        <div style={{textAlign:'right'}}>발송 · 성공률</div><div>예약 → 방문</div>
        <div style={{textAlign:'right'}}>사용 금액</div><div style={{textAlign:'right'}}>방문 매출</div><div/>
      </div>
      {rows.length === 0 && <div style={{padding:'36px', textAlign:'center', fontSize:12.5, color:C_MUTED}}>이 기간에 발송한 캠페인이 없어요</div>}
      {rows.map((c, i) => {
        const sch = c.status === 'scheduled';
        const okAll = (c.ok || 0) + (c.fallback || 0);
        const rate = rpPct(okAll, c.sent);
        const conv = rpPct(c.booked, okAll);
        return (
          <div key={c.id} onClick={() => onOpen(c.id)} style={{
            display:'grid', gridTemplateColumns:RP_BULK_COLS, gap:10, alignItems:'center',
            padding:'12px 16px', borderTop: i ? '1px solid #EFF2F7' : 'none', fontSize:12.5, color:C_INK, cursor:'pointer',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#F8FAFF'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div style={{fontVariantNumeric:'tabular-nums', color:C_MUTED, fontSize:12}}>
              {c.at.slice(5, 10).replace('-', '.')} <span style={{color:'#94A3B8'}}>{c.at.slice(11)}</span>
            </div>
            <div style={{minWidth:0}}>
              <div style={{display:'flex', alignItems:'center', gap:6}}>
                {sch && <span style={{fontSize:10.5, fontWeight:700, padding:'2px 7px', borderRadius:10, background:'#FEF3C7', color:'#B45309', whiteSpace:'nowrap'}}>예약됨</span>}
                <span style={{fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{c.title}</span>
                {c.ad && <span style={{fontSize:10, color:'#C2410C', fontWeight:700}}>광고</span>}
              </div>
              <div style={{fontSize:11, color:C_MUTED, marginTop:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{c.target.join(' · ')}</div>
            </div>
            <div><RpChBadge ch={c.channel}/></div>
            <div style={{textAlign:'right', fontVariantNumeric:'tabular-nums'}}>
              {sch ? <span style={{color:C_MUTED}}>{c.planned.toLocaleString()}명 예정</span> : <>
                {c.sent.toLocaleString()}
                <span style={{fontSize:11, marginLeft:4, color: rate < 95 ? '#B45309' : C_MUTED}}>{rate}%</span>
              </>}
            </div>
            <div>
              {sch ? <span style={{fontSize:11.5, color:C_MUTED}}>{c.at.slice(5,10).replace('-','/')} 발송 예정</span>
                : !c.conv ? <span style={{fontSize:11.5, color:'#B6C0CF'}}>정보성 · 집계 안 함</span>
                : <RpMiniFunnel booked={c.booked} visited={c.visited} base={okAll} conv={conv}/>}
            </div>
            <div style={{textAlign:'right', fontVariantNumeric:'tabular-nums', color:C_MUTED}}>{sch ? '-' : rpWon(c.cost)}</div>
            <div style={{textAlign:'right', fontVariantNumeric:'tabular-nums', fontWeight:700}}>{sch || !c.conv ? <span style={{color:'#B6C0CF', fontWeight:500}}>-</span> : rpWon(c.revenue)}</div>
            <IconChevronR size={14} style={{color:'#B6C0CF'}}/>
          </div>
        );
      })}
    </>
  );
}
function RpMiniFunnel({ booked, visited, base, conv }) {
  const w = 52;
  return (
    <div style={{display:'flex', alignItems:'center', gap:6}}>
      <div style={{width:w, height:6, borderRadius:3, background:'#EEF1F6', position:'relative', overflow:'hidden'}}>
        <div style={{position:'absolute', left:0, top:0, bottom:0, width: `${Math.min(100, (booked / base) * 100 * 4)}%`, background:'#B8C7EA'}}/>
        <div style={{position:'absolute', left:0, top:0, bottom:0, width: `${Math.min(100, (visited / base) * 100 * 4)}%`, background:C_BLUE}}/>
      </div>
      <span style={{fontSize:12, fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap'}}>
        {booked}<span style={{color:'#94A3B8'}}> → </span><b>{visited}</b>
      </span>
    </div>
  );
}

// ───── 자동발송 테이블 ─────
const RP_AUTO_COLS = '1fr 70px 90px 70px 120px 96px 104px';
function RpAutoTable({ rows }) {
  return (
    <>
      <div style={{display:'grid', gridTemplateColumns:RP_AUTO_COLS, gap:10, padding:'9px 16px', background:'#FBFCFE', borderBottom:`1px solid ${C_BORDER}`, fontSize:11, fontWeight:700, color:C_MUTED}}>
        <div>자동발송 항목</div><div>채널</div><div style={{textAlign:'right'}}>발송</div><div style={{textAlign:'right'}}>성공률</div>
        <div>예약 → 방문</div><div style={{textAlign:'right'}}>사용 금액</div><div style={{textAlign:'right'}}>방문 매출</div>
      </div>
      {rows.map((a, i) => {
        const okAll = a.ok + (a.fallback || 0);
        return (
          <div key={a.id} style={{display:'grid', gridTemplateColumns:RP_AUTO_COLS, gap:10, alignItems:'center', padding:'12px 16px', borderTop: i ? '1px solid #EFF2F7' : 'none', fontSize:12.5, color:C_INK}}>
            <div style={{minWidth:0}}>
              <div style={{fontWeight:600}}>{a.name}</div>
              {a.fallback > 0 && <div style={{fontSize:11, color:C_MUTED, marginTop:2}}>문자 대체 {a.fallback}건 포함</div>}
            </div>
            <div><RpChBadge ch={a.channel}/></div>
            <div style={{textAlign:'right', fontVariantNumeric:'tabular-nums'}}>{a.sent.toLocaleString()}</div>
            <div style={{textAlign:'right', fontVariantNumeric:'tabular-nums', color:C_MUTED}}>{rpPct(okAll, a.sent)}%</div>
            <div>
              {a.conv ? <RpMiniFunnel booked={a.booked} visited={a.visited} base={okAll}/>
                : a.noshowCut ? <span style={{fontSize:11.5, color:'#047857', fontWeight:600}}>노쇼율 4.1% → 1.8%</span>
                : <span style={{fontSize:11.5, color:'#B6C0CF'}}>정보성 · 집계 안 함</span>}
            </div>
            <div style={{textAlign:'right', fontVariantNumeric:'tabular-nums', color:C_MUTED}}>{rpWon(a.cost)}</div>
            <div style={{textAlign:'right', fontVariantNumeric:'tabular-nums', fontWeight:700}}>{a.conv ? rpWon(a.revenue) : <span style={{color:'#B6C0CF', fontWeight:500}}>-</span>}</div>
          </div>
        );
      })}
    </>
  );
}

// ───── 캠페인 상세 (우측 드로어) ─────
function RpDetail({ c, win, onClose, onCancel, onResend }) {
  const [f, setF] = React.useState('all');
  const list = React.useMemo(() => rpRecipients(c), [c.id]);
  const sch = c.status === 'scheduled';
  const okAll = (c.ok || 0) + (c.fallback || 0);
  const rows = list.filter(r => f === 'all' || (f === 'fail' ? r.res === 'fail' : f === 'booked' ? r.booked : f === 'none' ? (!r.booked && r.res !== 'fail') : true));
  const steps = [
    { l:'발송', v:c.sent },
    { l:'수신 성공', v:okAll },
    { l:'예약', v:c.booked },
    { l:'방문', v:c.visited },
  ];
  const noReact = okAll - (c.booked || 0);

  return (
    <div onClick={onClose} style={{position:'fixed', inset:0, background:'rgba(11,20,37,0.32)', zIndex:150, display:'flex', justifyContent:'flex-end'}}>
      <div onClick={e => e.stopPropagation()} style={{width:560, height:'100%', background:C_SURFACE, boxShadow:'-12px 0 40px rgba(11,20,37,0.2)', display:'flex', flexDirection:'column'}}>
        {/* 헤더 */}
        <div style={{padding:'16px 20px', borderBottom:`1px solid ${C_BORDER}`, display:'flex', alignItems:'flex-start', gap:10}}>
          <div style={{flex:1, minWidth:0}}>
            <div style={{display:'flex', alignItems:'center', gap:6}}>
              <RpChBadge ch={c.channel}/>
              {c.ad && <span style={{fontSize:10.5, fontWeight:700, padding:'2px 7px', borderRadius:10, background:'#FFF7ED', color:'#C2410C'}}>광고성</span>}
              {sch && <span style={{fontSize:10.5, fontWeight:700, padding:'2px 7px', borderRadius:10, background:'#FEF3C7', color:'#B45309'}}>예약됨</span>}
            </div>
            <div style={{fontSize:17, fontWeight:700, color:C_INK, marginTop:6, letterSpacing:'-0.01em'}}>{c.title}</div>
            <div style={{fontSize:12, color:C_MUTED, marginTop:3}}>{c.at.replace(/-/g,'.')} {sch ? '발송 예정' : '발송'} · {c.target.join(' · ')}</div>
          </div>
          <button onClick={onClose} style={{border:'none', background:'transparent', cursor:'pointer', color:C_MUTED, display:'flex', padding:2}}><IconX size={18}/></button>
        </div>

        <div className="mkt-scroll" style={{flex:1, overflow:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:16}}>
          {sch ? (
            <div style={{padding:'14px 16px', background:'#FFFBEB', border:'1px solid #FCE9B8', borderRadius:10, fontSize:12.5, color:'#92400E', lineHeight:1.6}}>
              <b>{c.planned.toLocaleString()}명</b>에게 {c.at.slice(5,10).replace('-','월 ')}일 {c.at.slice(11)}에 발송될 예정이에요.<br/>
              예상 차감 <b>{rpWon(c.planned * MKT_UNIT[c.channel].price)}</b> · 발송 전까지 취소할 수 있어요.
            </div>
          ) : (
            <>
              {/* 퍼널 */}
              <div>
                <div style={{fontSize:12.5, fontWeight:700, color:C_INK, marginBottom:10}}>
                  성과 {c.conv && <span style={{fontWeight:500, color:C_MUTED}}>· 받은 날로부터 {win}일 이내</span>}
                </div>
                <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:6}}>
                  {steps.map((s, i) => {
                    const prev = i ? steps[i - 1].v : null;
                    const na = !c.conv && i >= 2;
                    return (
                      <div key={s.l} style={{padding:'10px 12px', background: i >= 2 && !na ? C_BLUE_SOFT : C_BG, borderRadius:8, position:'relative'}}>
                        <div style={{fontSize:11, color:C_MUTED, fontWeight:600}}>{s.l}</div>
                        <div style={{fontSize:19, fontWeight:800, color: na ? '#B6C0CF' : i >= 2 ? C_BLUE : C_INK, fontVariantNumeric:'tabular-nums', marginTop:2}}>
                          {na ? '-' : s.v.toLocaleString()}
                        </div>
                        {i > 0 && !na && <div style={{fontSize:10.5, color:C_MUTED, marginTop:1}}>{rpPct(s.v, prev)}%</div>}
                      </div>
                    );
                  })}
                </div>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', marginTop:8, border:`1px solid ${C_BORDER}`, borderRadius:8, overflow:'hidden'}}>
                  {[
                    ['사용 금액', rpWon(c.cost)],
                    ['방문 매출', c.conv ? rpWon(c.revenue) : '-'],
                    ['비용 대비', c.conv && c.cost ? `${Math.round(c.revenue / c.cost).toLocaleString()}배` : '-'],
                  ].map(([l, v], i) => (
                    <div key={l} style={{padding:'9px 12px', borderLeft: i ? `1px solid ${C_BORDER}` : 'none'}}>
                      <div style={{fontSize:11, color:C_MUTED}}>{l}</div>
                      <div style={{fontSize:13.5, fontWeight:700, color:C_INK, fontVariantNumeric:'tabular-nums', marginTop:2}}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 후속 액션 */}
              <div style={{display:'flex', gap:6}}>
                <button disabled={!c.fail} onClick={() => onResend(`실패한 ${c.fail}명을 단체발송 대상으로 불러왔어요`)} style={{...rpActBtn, opacity: c.fail ? 1 : 0.45, cursor: c.fail ? 'pointer' : 'not-allowed'}}>
                  <div style={{fontSize:12.5, fontWeight:700, color:C_INK}}>실패 고객에게 재발송</div>
                  <div style={{fontSize:11, color:C_MUTED, marginTop:2}}>{c.fail}명 · 번호 확인 필요할 수 있어요</div>
                </button>
                {c.conv && (
                  <button onClick={() => onResend(`예약하지 않은 ${noReact.toLocaleString()}명을 단체발송 대상으로 불러왔어요`)} style={rpActBtn}>
                    <div style={{fontSize:12.5, fontWeight:700, color:C_BLUE}}>미반응 고객에게 한 번 더</div>
                    <div style={{fontSize:11, color:C_MUTED, marginTop:2}}>받았지만 예약 안 한 {noReact.toLocaleString()}명</div>
                  </button>
                )}
              </div>
            </>
          )}

          {/* 메시지 */}
          <div>
            <div style={{fontSize:12.5, fontWeight:700, color:C_INK, marginBottom:8}}>보낸 메시지</div>
            <div style={{background:'#F3F5F9', border:`1px solid ${C_BORDER}`, borderRadius:10, padding:12}}>
              <div style={{background: c.channel === 'alimtalk' ? '#fff' : '#E2E7EF', borderRadius:12, borderBottomLeftRadius:3, overflow:'hidden', maxWidth:340}}>
                {c.channel === 'alimtalk' && <div style={{background:'#FEE500', padding:'7px 11px', fontSize:11.5, fontWeight:700, color:'#3C1E1E'}}>알림톡 도착</div>}
                {c.image && <div style={{height:90, background:'repeating-linear-gradient(135deg,#D6DCE6 0 8px,#CDD4DF 8px 16px)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10.5, color:C_MUTED, fontFamily:'ui-monospace, Menlo, monospace'}}>event_banner.jpg</div>}
                <div style={{padding:'10px 12px', fontSize:12, lineHeight:1.65, color:'#111827', whiteSpace:'pre-wrap'}}>
                  {c.ad && c.channel !== 'alimtalk' && '(광고) 카이키키 부평본점\n'}{c.body.replace('#{고객명}', '박서연').replace('#{잔여포인트}', '12,400P')}{c.ad && c.channel !== 'alimtalk' && '\n\n무료수신거부 080-855-1290'}
                </div>
              </div>
            </div>
          </div>

          {/* 수신자 */}
          {!sch && (
            <div>
              <div style={{display:'flex', alignItems:'center', marginBottom:8}}>
                <div style={{fontSize:12.5, fontWeight:700, color:C_INK, flex:1}}>받은 고객</div>
                <window.MktSeg size="sm" value={f} onChange={setF} options={[
                  { id:'all', label:'전체' }, { id:'booked', label:'예약함' }, { id:'none', label:'미반응' }, { id:'fail', label:'실패' },
                ]}/>
              </div>
              <div style={{border:`1px solid ${C_BORDER}`, borderRadius:8, overflow:'hidden'}}>
                {rows.slice(0, 14).map((r, i) => (
                  <div key={r.id} style={{display:'grid', gridTemplateColumns:'72px 112px 1fr 96px', gap:8, alignItems:'center', padding:'8px 12px', borderTop: i ? '1px solid #EFF2F7' : 'none', fontSize:12}}>
                    <span style={{fontWeight:600, color:C_INK}}>{r.name}</span>
                    <span style={{color:C_MUTED, fontVariantNumeric:'tabular-nums'}}>{r.phone}</span>
                    <span>
                      {r.res === 'fail' && <span style={{color:'#DC2626', fontWeight:600}}>실패 · {r.reason}</span>}
                      {r.res === 'fallback' && <span style={{color:C_MUTED}}>문자 대체 수신</span>}
                      {r.res === 'ok' && !r.booked && <span style={{color:'#94A3B8'}}>수신</span>}
                      {r.booked && <span style={{color:C_BLUE, fontWeight:600}}>{r.bookDay}일 뒤 예약{r.visited ? ' · 방문' : ''}</span>}
                    </span>
                    <span style={{textAlign:'right', fontVariantNumeric:'tabular-nums', fontWeight: r.amount ? 700 : 400, color: r.amount ? C_INK : '#B6C0CF'}}>{r.amount ? rpWon(r.amount) : '-'}</span>
                  </div>
                ))}
                {rows.length === 0 && <div style={{padding:'24px', textAlign:'center', fontSize:12, color:C_MUTED}}>해당하는 고객이 없어요</div>}
              </div>
              {rows.length > 14 && <div style={{fontSize:11.5, color:C_MUTED, marginTop:6, textAlign:'center'}}>외 {(rows.length - 14).toLocaleString()}명 · 엑셀로 전체 보기</div>}
            </div>
          )}
        </div>

        {sch && (
          <div style={{padding:'14px 20px', borderTop:`1px solid ${C_BORDER}`, background:'#FBFCFE', display:'flex', gap:8}}>
            <button onClick={() => onCancel(c.id)} style={{...c_ghostBtnSm, height:38, padding:'0 16px', fontFamily:'inherit', fontWeight:600, color:'#DC2626'}}>예약 취소</button>
            <div style={{flex:1}}/>
            <button onClick={() => onResend('캠페인을 단체발송에서 수정할 수 있어요')} style={{height:38, padding:'0 18px', border:'none', borderRadius:8, background:C_BLUE, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit'}}>내용 수정</button>
          </div>
        )}
      </div>
    </div>
  );
}
const rpActBtn = {
  flex:1, textAlign:'left', padding:'10px 12px', border:`1px solid ${C_BORDER}`, borderRadius:8,
  background:C_SURFACE, cursor:'pointer', fontFamily:'inherit',
};

window.C_MktReportPage = C_MktReportPage;
