// 운영 관리 페이지 (설정 > 운영 관리)
// 섹션: 예약 설정(운영 시간 / 예약 마감) + 스케줄 설정(예약 캘린더 / 매장 캘린더)
// 우측: 요약 카드

const {
  C_BLUE, C_BLUE_SOFT, C_INK, C_MUTED, C_BORDER, C_BG, C_SURFACE,
  c_ghostBtn,
} = window;

// 시간 옵션: 30분 단위 (오전/오후 한글 표기)
const OPS_TIME_OPTIONS = (() => {
  const arr = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const period = h < 12 ? '오전' : '오후';
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const mm = m === 0 ? '' : `${m}분`;
      arr.push({
        val: `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`,
        label: `${period} ${h12}시${mm}`,
      });
    }
  }
  return arr;
})();

const INTERVAL_OPTIONS = [
  { val:'10', label:'10분' },
  { val:'15', label:'15분' },
  { val:'30', label:'30분' },
  { val:'60', label:'1시간' },
];

const REGULAR_DAYOFF_DAYS = ['월','화','수','목','금','토','일'];

const CLOSE_TIME_OPTIONS = [
  { val:'end',    label:'영업 종료 시간까지' },
  { val:'30min',  label:'영업 종료 30분 전' },
  { val:'1hr',    label:'영업 종료 1시간 전' },
  { val:'2hr',    label:'영업 종료 2시간 전' },
];

function C_OpsPage() {
  // 예약 설정
  const [openTime,  setOpenTime]  = React.useState('10:00');
  const [closeTime, setCloseTime] = React.useState('20:00');
  const [interval,  setInterval_] = React.useState('30');
  const [regularOff, setRegularOff] = React.useState(true);
  const [offDays, setOffDays] = React.useState(['일']);
  const [closeCut, setCloseCut] = React.useState('end');

  // 스케줄 설정
  const [showRest,    setShowRest]    = React.useState(false);
  const [showCompleted, setShowCompleted] = React.useState(true);
  const [useUnassigned, setUseUnassigned] = React.useState(true);
  const [showPersonal,  setShowPersonal]  = React.useState(true);
  const [showStoreSch,  setShowStoreSch]  = React.useState(true);

  const bookingSec = (
    <C_OpsBookingSection
      openTime={openTime} setOpenTime={setOpenTime}
      closeTime={closeTime} setCloseTime={setCloseTime}
      interval={interval} setInterval={setInterval_}
      regularOff={regularOff} setRegularOff={setRegularOff}
      offDays={offDays} setOffDays={setOffDays}
      closeCut={closeCut} setCloseCut={setCloseCut}
    />
  );

  const scheduleSec = (
    <C_OpsScheduleSection
      showRest={showRest} setShowRest={setShowRest}
      showCompleted={showCompleted} setShowCompleted={setShowCompleted}
      useUnassigned={useUnassigned} setUseUnassigned={setUseUnassigned}
      showPersonal={showPersonal} setShowPersonal={setShowPersonal}
      showStoreSch={showStoreSch} setShowStoreSch={setShowStoreSch}
    />
  );

  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden', background:C_BG}}>
      <div style={{width: 948, flexShrink: 0, flex:1, display:'flex', flexDirection:'column', minHeight:0}}>
        <C_OpsSubHeader/>

        <div style={{flex:1, overflow:'auto', padding:'20px 20px 24px', display:'grid', gridTemplateColumns:'1fr 260px', gap:16, alignContent:'start'}}>
          <div style={{display:'flex', flexDirection:'column', gap:14}}>
            {bookingSec}
            {scheduleSec}
          </div>

          {/* 우측 요약 카드 */}
          <C_OpsSummary
            openTime={openTime} closeTime={closeTime}
            interval={interval}
            regularOff={regularOff} offDays={offDays}
            closeCut={closeCut}
            showRest={showRest} showCompleted={showCompleted} useUnassigned={useUnassigned}
            showPersonal={showPersonal} showStoreSch={showStoreSch}
          />
        </div>

        {/* 하단 저장 CTA */}
        <div style={{
          padding:'12px 20px', borderTop:`1px solid ${C_BORDER}`, background:C_SURFACE,
          display:'flex', gap:8, justifyContent:'flex-end', alignItems:'center',
        }}>
          <button style={{...c_ghostBtn, padding:'9px 16px'}}>초기화</button>
          <button style={{
            padding:'9px 22px', background: C_BLUE, color:'#fff',
            border:'none', borderRadius:20, fontSize:13, fontWeight:700,
            cursor:'pointer', boxShadow:'0 1px 2px rgba(30,64,175,0.2)',
            fontFamily:'inherit',
          }}>저장하기</button>
        </div>
      </div>
    </div>
  );
}

// ─ 서브헤더 ─
function C_OpsSubHeader() {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:8,
      padding:'10px 14px', background:C_SURFACE, borderBottom:`1px solid ${C_BORDER}`,
    }}>
      <div style={{fontSize:12.5, color:C_MUTED, flexShrink:0}}>
        홈 <span style={{margin:'0 6px'}}>›</span>
        <span>설정</span>
        <span style={{margin:'0 6px'}}>›</span>
        <span style={{color:C_INK, fontWeight:600}}>운영 관리 설정</span>
      </div>
    </div>
  );
}

// ─ 섹션 카드 래퍼 ─
function C_OpsCard({ title, children }) {
  return (
    <div style={{
      background:C_SURFACE, borderRadius:12, border:`1px solid ${C_BORDER}`,
      padding:'20px 22px',
    }}>
      <div style={{fontSize:15, fontWeight:700, color:C_INK, letterSpacing:'-0.01em', marginBottom:16}}>
        {title}
      </div>
      {children}
    </div>
  );
}

function C_OpsRow({ label, required, hint, children }) {
  return (
    <>
      <div style={{display:'grid', gridTemplateColumns:'120px 1fr', alignItems:'center', gap:14, padding:'8px 0'}}>
        <label style={{fontSize:13, fontWeight:600, color:C_INK, lineHeight:1.4}}>
          {label} {required && <span style={{color:'#EF4444'}}>*</span>}
        </label>
        <div>{children}</div>
      </div>
      {hint && (
        <div style={{fontSize:11.5, color:C_MUTED, paddingLeft:134, marginTop:-4, marginBottom:8}}>
          {hint}
        </div>
      )}
    </>
  );
}

// ─ 예약 설정 섹션 ─
function C_OpsBookingSection({ openTime, setOpenTime, closeTime, setCloseTime, interval, setInterval, regularOff, setRegularOff, offDays, setOffDays, closeCut, setCloseCut }) {
  const toggleDay = (d) => setOffDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  const closeTimeLabel = OPS_TIME_OPTIONS.find(o => o.val === closeTime)?.label || closeTime;
  const cutMap = { end:'', '30min':' 30분 전', '1hr':' 1시간 전', '2hr':' 2시간 전' };

  return (
    <div style={{display:'flex', flexDirection:'column', gap:14}}>
      <C_OpsCard title="운영 시간 설정">
        <C_OpsRow label="운영시간" required>
          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            <select value={openTime} onChange={e => setOpenTime(e.target.value)} style={c_opsSelect}>
              {OPS_TIME_OPTIONS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
            </select>
            <span style={{color:C_MUTED, fontSize:12}}>~</span>
            <select value={closeTime} onChange={e => setCloseTime(e.target.value)} style={c_opsSelect}>
              {OPS_TIME_OPTIONS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
            </select>
          </div>
        </C_OpsRow>
        <C_OpsRow label="예약 시간 간격">
          <select value={interval} onChange={e => setInterval(e.target.value)} style={{...c_opsSelect, width:200}}>
            {INTERVAL_OPTIONS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
          </select>
        </C_OpsRow>
        <C_OpsRow label="정기 휴무일">
          <div style={{display:'flex', gap:12, alignItems:'center'}}>
            <C_OpsToggle checked={regularOff} onChange={setRegularOff}/>
            {regularOff && (
              <div style={{display:'flex', gap:5, flexWrap:'wrap'}}>
                {REGULAR_DAYOFF_DAYS.map(d => {
                  const on = offDays.includes(d);
                  return (
                    <button key={d} onClick={() => toggleDay(d)} style={{
                      width:32, height:32, borderRadius:'50%',
                      border:`1px solid ${on ? C_BLUE : C_BORDER}`,
                      background: on ? C_BLUE_SOFT : C_SURFACE,
                      color: on ? C_BLUE : C_MUTED,
                      fontSize:12, fontWeight:700, cursor:'pointer',
                      fontFamily:'inherit',
                    }}>{d}</button>
                  );
                })}
              </div>
            )}
          </div>
        </C_OpsRow>
      </C_OpsCard>

      <C_OpsCard title="예약 마감 설정">
        <C_OpsRow label="예약 마감 시간"
          hint={<>운영 시간이 <strong style={{color:C_INK}}>{closeTimeLabel}</strong>인 경우, <strong style={{color:C_BLUE}}>{closeTimeLabel}{cutMap[closeCut]}</strong>까지 예약 가능</>}>
          <select value={closeCut} onChange={e => setCloseCut(e.target.value)} style={{...c_opsSelect, width:260}}>
            {CLOSE_TIME_OPTIONS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
          </select>
        </C_OpsRow>
      </C_OpsCard>
    </div>
  );
}

// ─ 스케줄 설정 섹션 ─
function C_OpsScheduleSection({ showRest, setShowRest, showCompleted, setShowCompleted, useUnassigned, setUseUnassigned, showPersonal, setShowPersonal, showStoreSch, setShowStoreSch }) {
  return (
    <div style={{display:'flex', flexDirection:'column', gap:14}}>
      <C_OpsCard title="예약 캘린더 설정">
        <C_OpsRow label="휴무자 표시" hint="휴무 중인 디자이너 컬럼을 예약 캘린더에 표시합니다.">
          <C_OpsToggle checked={showRest} onChange={setShowRest}/>
        </C_OpsRow>
        <C_OpsRow label="시술 완료 내역 표시" hint="완료된 시술을 캘린더에서 계속 확인할 수 있습니다.">
          <C_OpsToggle checked={showCompleted} onChange={setShowCompleted}/>
        </C_OpsRow>
        <C_OpsRow label="디자이너 미지정 사용" hint="담당자를 미리 지정하지 않은 예약을 접수받습니다.">
          <C_OpsToggle checked={useUnassigned} onChange={setUseUnassigned}/>
        </C_OpsRow>
      </C_OpsCard>

      <C_OpsCard title="매장 캘린더 설정">
        <C_OpsRow label="개인 일정 표시" hint="디자이너 개인 일정(휴무·외부 미팅)을 표시합니다.">
          <C_OpsToggle checked={showPersonal} onChange={setShowPersonal}/>
        </C_OpsRow>
        <C_OpsRow label="매장 일정 표시" hint="매장 전체 일정(정기 회의·프로모션)을 표시합니다.">
          <C_OpsToggle checked={showStoreSch} onChange={setShowStoreSch}/>
        </C_OpsRow>
      </C_OpsCard>
    </div>
  );
}

// ─ 요약 카드 (우측) ─
function C_OpsSummary({ openTime, closeTime, interval, regularOff, offDays, closeCut, showRest, showCompleted, useUnassigned, showPersonal, showStoreSch }) {
  const openLabel = OPS_TIME_OPTIONS.find(o => o.val === openTime)?.label;
  const closeLabel = OPS_TIME_OPTIONS.find(o => o.val === closeTime)?.label;
  const intervalLabel = INTERVAL_OPTIONS.find(o => o.val === interval)?.label;
  const closeCutLabel = CLOSE_TIME_OPTIONS.find(o => o.val === closeCut)?.label;

  // 운영 시간 총합(분)
  const [oh, om] = openTime.split(':').map(Number);
  const [ch, cm] = closeTime.split(':').map(Number);
  const totalMin = (ch*60+cm) - (oh*60+om);
  const totalSlots = totalMin > 0 && Number(interval) ? Math.floor(totalMin / Number(interval)) : 0;

  const scheduleOnCount = [showRest, showCompleted, useUnassigned, showPersonal, showStoreSch].filter(Boolean).length;

  return (
    <div style={{position:'sticky', top:0, display:'flex', flexDirection:'column', gap:12}}>
      {/* 운영 요약 */}
      <div style={{
        background:C_SURFACE, borderRadius:12, border:`1px solid ${C_BORDER}`,
        padding:'16px 18px',
      }}>
        <div style={{fontSize:11, color:C_MUTED, fontWeight:700, letterSpacing:'0.06em'}}>OPERATION</div>
        <div style={{fontSize:14, fontWeight:700, color:C_INK, marginTop:2, letterSpacing:'-0.01em'}}>운영 요약</div>

        <div style={{marginTop:14, display:'flex', flexDirection:'column', gap:10}}>
          <SumStat label="운영 시간" value={`${openLabel} ~ ${closeLabel}`} accent={C_BLUE}/>
          <SumStat label="총 운영 시간" value={totalMin > 0 ? `${Math.floor(totalMin/60)}시간 ${totalMin%60 ? `${totalMin%60}분` : ''}`.trim() : '-'}/>
          <SumStat label="예약 간격" value={intervalLabel}/>
          <SumStat label="예약 슬롯" value={`${totalSlots}개 / 일`} accent={C_BLUE}/>
          <SumStat label="휴무일" value={regularOff ? (offDays.length ? offDays.map(d => `매주 ${d}요일`).join(', ') : '지정 없음') : '없음'}/>
          <SumStat label="예약 마감" value={closeCutLabel}/>
        </div>
      </div>

      {/* 스케줄 요약 */}
      <div style={{
        background:C_SURFACE, borderRadius:12, border:`1px solid ${C_BORDER}`,
        padding:'16px 18px',
      }}>
        <div style={{fontSize:11, color:C_MUTED, fontWeight:700, letterSpacing:'0.06em'}}>SCHEDULE</div>
        <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginTop:2}}>
          <div style={{fontSize:14, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>스케줄 표시</div>
          <div style={{fontSize:12, color:C_MUTED, fontVariantNumeric:'tabular-nums'}}>{scheduleOnCount}/5 켜짐</div>
        </div>

        <div style={{marginTop:12, display:'flex', flexDirection:'column', gap:6}}>
          <SumFlag label="휴무자 표시"        on={showRest}/>
          <SumFlag label="시술 완료 내역"      on={showCompleted}/>
          <SumFlag label="디자이너 미지정"     on={useUnassigned}/>
          <SumFlag label="개인 일정"          on={showPersonal}/>
          <SumFlag label="매장 일정"          on={showStoreSch}/>
        </div>
      </div>

      {/* 도움말 */}
      <div style={{
        padding:'12px 14px', background:C_BLUE_SOFT, borderRadius:10, border:'1px solid #C7D6F5',
        fontSize:11.5, color:C_INK, lineHeight:1.5,
      }}>
        <strong style={{fontWeight:700}}>변경 사항은 저장 후 즉시 반영</strong>
        <div style={{color:C_MUTED, marginTop:4}}>
          예약이 이미 등록된 시간대는 설정 변경의 영향을 받지 않습니다.
        </div>
      </div>
    </div>
  );
}

function SumStat({ label, value, accent }) {
  return (
    <div style={{display:'flex', flexDirection:'column', gap:2, paddingBottom:8, borderBottom:`1px solid ${C_BORDER}`}}>
      <span style={{fontSize:11, color:C_MUTED, fontWeight:600, letterSpacing:'0.02em'}}>{label}</span>
      <span style={{fontSize:13, color: accent || C_INK, fontWeight:600, letterSpacing:'-0.01em', fontVariantNumeric:'tabular-nums'}}>{value}</span>
    </div>
  );
}

function SumFlag({ label, on }) {
  return (
    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:12}}>
      <span style={{color: on ? C_INK : C_MUTED, fontWeight: on ? 600 : 400}}>{label}</span>
      <span style={{
        display:'inline-flex', alignItems:'center', gap:4,
        fontSize:10.5, fontWeight:700, letterSpacing:'-0.01em',
        padding:'2px 8px', borderRadius:10,
        background: on ? '#D1FAE5' : '#F1F5F9',
        color: on ? '#059669' : '#94A3B8',
      }}>
        <span style={{width:5, height:5, borderRadius:'50%', background: on ? '#10B981' : '#94A3B8'}}/>
        {on ? 'ON' : 'OFF'}
      </span>
    </div>
  );
}

function C_OpsToggle({ checked, onChange }) {
  return (
    <div onClick={() => onChange(!checked)} style={{
      width:38, height:22, borderRadius:11,
      background: checked ? C_BLUE : '#E5E7EB',
      position:'relative', cursor:'pointer',
      transition:'background 0.15s', flexShrink:0,
    }}>
      <div style={{
        position:'absolute', top:2, left: checked ? 18 : 2,
        width:18, height:18, borderRadius:'50%', background:'#fff',
        boxShadow:'0 1px 2px rgba(11,20,37,0.15)',
        transition:'left 0.15s',
      }}/>
    </div>
  );
}

const c_opsSelect = {
  height:36, padding:'0 32px 0 14px',
  border:`1px solid ${C_BORDER}`, borderRadius:20,
  fontSize:13, background:C_SURFACE, outline:'none',
  fontFamily:'inherit', cursor:'pointer',
  appearance:'none', WebkitAppearance:'none', MozAppearance:'none',
  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235C6B84' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>")`,
  backgroundRepeat:'no-repeat',
  backgroundPosition:'right 12px center',
  minWidth:150,
};

window.C_OpsPage = C_OpsPage;
