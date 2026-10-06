// 범용 스텁 페이지 — 마케팅/분석/스토어 + 설정 소메뉴 7개

const {
  C_BLUE, C_BLUE_SOFT, C_INK, C_MUTED, C_BORDER, C_BG, C_SURFACE,
  c_ghostBtnSm,
} = window;

function C_StubPage({ crumbs, title, desc }) {
  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden', background:C_BG}}>
      <div style={{width: 948, flexShrink: 0, flex:1, display:'flex', flexDirection:'column', minHeight:0}}>
        {/* 서브헤더 */}
        <div style={{
          display:'flex', alignItems:'center', gap:8,
          padding:'10px 14px', background:C_SURFACE, borderBottom:`1px solid ${C_BORDER}`,
        }}>
          <div style={{fontSize:12.5, color:C_MUTED, flexShrink:0}}>
            {crumbs.map((c, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span style={{margin:'0 6px'}}>›</span>}
                {i === crumbs.length - 1
                  ? <span style={{color:C_INK, fontWeight:600}}>{c}</span>
                  : <span>{c}</span>}
              </React.Fragment>
            ))}
          </div>
          <div style={{flex:1}}/>
          <button style={{...c_ghostBtnSm, display:'flex', alignItems:'center', gap:5}}>
            <IconFilter size={12}/> 필터
          </button>
          <button style={{
            display:'flex', alignItems:'center', gap:6,
            padding:'7px 12px', background: C_BLUE, color:'#fff',
            border:'none', borderRadius:7, fontSize:12, fontWeight:600,
            cursor:'pointer', boxShadow:'0 1px 2px rgba(30,64,175,0.2)',
          }}>
            <IconPlus size={13}/> 새로 등록
          </button>
        </div>

        {/* 본문 */}
        <div style={{flex:1, overflow:'auto', padding:'20px 20px'}}>
          {/* 페이지 헤더 */}
          <div style={{marginBottom:16}}>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <h1 style={{margin:0, fontSize:20, fontWeight:700, color:C_INK, letterSpacing:'-0.02em'}}>{title}</h1>
              <span style={{
                fontSize:10, fontWeight:700, color:'#D97706',
                background:'#FEF3C7', padding:'3px 8px', borderRadius:10,
                letterSpacing:'0.02em',
              }}>준비 중</span>
            </div>
            <div style={{fontSize:12.5, color:C_MUTED, marginTop:6}}>{desc}</div>
          </div>

          {/* 빈 테이블 스켈레톤 */}
          <div style={{background:C_SURFACE, borderRadius:10, border:`1px solid ${C_BORDER}`, overflow:'hidden'}}>
            <div style={{
              display:'grid', gridTemplateColumns:'44px 2fr 1fr 1fr 1fr 80px',
              padding:'10px 14px', background:'#FBFCFE',
              borderBottom:`1px solid ${C_BORDER}`,
              fontSize:11, fontWeight:600, color:C_MUTED, letterSpacing:'0.02em',
            }}>
              <div style={{textAlign:'center'}}>#</div>
              <div>이름</div>
              <div>항목</div>
              <div>속성</div>
              <div>상태</div>
              <div style={{textAlign:'center'}}>액션</div>
            </div>
            {[1,2,3].map(n => (
              <div key={n} style={{
                display:'grid', gridTemplateColumns:'44px 2fr 1fr 1fr 1fr 80px',
                padding:'14px 14px', alignItems:'center',
                borderTop:`1px solid ${C_BORDER}`,
              }}>
                <div style={{textAlign:'center', color:'#CBD5E1', fontSize:11}}>{n}</div>
                <div><div style={{display:'inline-block', width:140, height:10, borderRadius:3, background:'#EEF1F6'}}/></div>
                <div><div style={{display:'inline-block', width:70, height:10, borderRadius:3, background:'#EEF1F6'}}/></div>
                <div><div style={{display:'inline-block', width:80, height:10, borderRadius:3, background:'#EEF1F6'}}/></div>
                <div><div style={{display:'inline-block', width:40, height:10, borderRadius:3, background:'#EEF1F6'}}/></div>
                <div style={{textAlign:'center'}}><div style={{display:'inline-block', width:20, height:10, borderRadius:3, background:'#EEF1F6'}}/></div>
              </div>
            ))}
            <div style={{
              padding:'20px 14px', textAlign:'center', color:C_MUTED, fontSize:12.5,
              borderTop:`1px solid ${C_BORDER}`,
              background:'#FBFCFE',
            }}>
              이 화면의 데이터는 아직 준비되지 않았습니다
            </div>
          </div>

          {/* 안내 카드 */}
          <div style={{
            marginTop:16, padding:'14px 16px',
            background:C_BLUE_SOFT, borderRadius:8, border:`1px solid #C7D6F5`,
            display:'flex', alignItems:'flex-start', gap:10,
          }}>
            <div style={{
              width:24, height:24, borderRadius:'50%', background:C_BLUE, color:'#fff',
              display:'flex', alignItems:'center', justifyContent:'center',
              flexShrink:0, marginTop:1,
            }}>
              <IconNote size={12}/>
            </div>
            <div style={{fontSize:12, color:C_INK, lineHeight:1.5}}>
              <strong style={{fontWeight:700}}>이 화면은 시안 작업 중입니다.</strong><br/>
              현재는 레이아웃과 정보 구조만 잡혀 있습니다. 실제 데이터와 인터랙션이 확정되는 대로 채워집니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.C_StubPage = C_StubPage;
