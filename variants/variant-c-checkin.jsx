// 설정 › 셀프체크인 — 패드에 나갈 디자이너 사진과 노출 메뉴

const {
  C_BLUE, C_BLUE_SOFT, C_INK, C_MUTED, C_BORDER, C_BG, C_SURFACE,
  c_ghostBtnSm,
} = window;

const CHECKIN_PHOTOS = {};

function checkinWon(n) {
  return new Intl.NumberFormat('ko-KR').format(n || 0);
}

function checkinPeople() {
  return (window.STAFF || []).filter(s => s.status === 'active' && s.checkin);
}

function checkinMenus() {
  const cats = window.MENU_CATEGORIES || [];
  const items = window.MENU_ITEMS || {};
  return cats.map(cat => ({
    cat,
    items: (items[cat.id] || []).filter(it => it.checkin),
  })).filter(g => g.items.length > 0);
}

function C_CheckinPage() {
  const [, setTick] = React.useState(0);
  const fileRef = React.useRef(null);
  const pickRef = React.useRef(null);
  const people = checkinPeople();
  const groups = checkinMenus();
  const menuCount = groups.reduce((n, g) => n + g.items.length, 0);
  const photoCount = people.filter(s => CHECKIN_PHOTOS[s.id]).length;

  const openFile = (id) => {
    pickRef.current = id;
    if (fileRef.current) {
      fileRef.current.value = '';
      fileRef.current.click();
    }
  };
  const onFile = (e) => {
    const file = e.target.files && e.target.files[0];
    const id = pickRef.current;
    if (!file || id == null) return;
    const reader = new FileReader();
    reader.onload = () => {
      CHECKIN_PHOTOS[id] = reader.result;
      setTick(n => n + 1);
    };
    reader.readAsDataURL(file);
  };
  const clearPhoto = (id) => {
    delete CHECKIN_PHOTOS[id];
    setTick(n => n + 1);
  };
  const stopMenu = (it) => {
    it.checkin = false;
    setTick(n => n + 1);
  };

  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden', background:C_BG}}>
      <div style={{width:948, flexShrink:0, flex:1, display:'flex', flexDirection:'column', minHeight:0}}>
        <div style={{
          display:'flex', alignItems:'center', gap:8,
          padding:'10px 14px', background:C_SURFACE, borderBottom:`1px solid ${C_BORDER}`,
        }}>
          <div style={{fontSize:12.5, color:C_MUTED, flexShrink:0}}>
            홈 <span style={{margin:'0 6px'}}>›</span>설정<span style={{margin:'0 6px'}}>›</span>
            <span style={{color:C_INK, fontWeight:600}}>셀프체크인</span>
          </div>
        </div>

        <div style={{flex:1, overflow:'auto', padding:'16px 20px 28px'}}>
          <div style={{marginBottom:16}}>
            <h1 style={{margin:0, fontSize:20, fontWeight:700, color:C_INK, letterSpacing:'-0.02em'}}>셀프체크인 설정</h1>
            <div style={{fontSize:12.5, color:C_MUTED, marginTop:6, lineHeight:1.5}}>
              매장 패드에서 고객이 직접 체크인할 때 보이는 디자이너와 시술입니다.
            </div>
          </div>

          <section style={{background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:12, padding:'16px 16px 14px', marginBottom:14}}>
            <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:12, marginBottom:4}}>
              <div style={{fontSize:14, fontWeight:800, color:C_INK}}>디자이너 사진</div>
              <div style={{fontSize:12, color:C_MUTED, fontVariantNumeric:'tabular-nums'}}>사진 {photoCount} / {people.length}</div>
            </div>
            <div style={{fontSize:12.5, color:C_MUTED, marginBottom:14, lineHeight:1.5}}>
              스태프 관리에서 체크인 노출이 켜진 디자이너입니다. 사진을 올리면 패드에 이 얼굴로 나옵니다.
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{display:'none'}}/>
            <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:10}}>
              {people.map(s => {
                const photo = CHECKIN_PHOTOS[s.id];
                return (
                  <div key={s.id} style={{
                    border:`1px solid ${C_BORDER}`, borderRadius:10, padding:'14px 10px 12px',
                    display:'flex', flexDirection:'column', alignItems:'center', background:'#FBFCFE',
                  }}>
                    <button onClick={() => openFile(s.id)} title="사진 올리기" style={{
                      width:72, height:72, borderRadius:'50%', padding:0, overflow:'hidden', cursor:'pointer',
                      border: photo ? 'none' : `1.5px dashed ${C_BORDER}`,
                      background: photo ? '#E8EEF8' : C_BLUE_SOFT,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      color:C_BLUE, fontSize:22, fontWeight:800, fontFamily:'inherit',
                    }}>
                      {photo
                        ? <img src={photo} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                        : s.name.slice(0, 1)}
                    </button>
                    <div style={{marginTop:8, fontSize:13, fontWeight:700, color:C_INK}}>{s.name}</div>
                    <div style={{marginTop:2, fontSize:11.5, color:C_MUTED}}>{s.role}</div>
                    <button onClick={() => openFile(s.id)} style={{...c_ghostBtnSm, marginTop:8, height:28, fontSize:11.5}}>
                      {photo ? '사진 바꾸기' : '사진 올리기'}
                    </button>
                    {photo && (
                      <button onClick={() => clearPhoto(s.id)} style={{
                        marginTop:4, border:'none', background:'transparent', color:'#DC2626',
                        fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit', padding:'2px 6px',
                      }}>삭제</button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section style={{background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:12, padding:'16px 16px 8px'}}>
            <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:12, marginBottom:4}}>
              <div style={{fontSize:14, fontWeight:800, color:C_INK}}>셀프체크인 메뉴</div>
              <div style={{fontSize:12, color:C_MUTED, fontVariantNumeric:'tabular-nums'}}>{menuCount}개</div>
            </div>
            <div style={{fontSize:12.5, color:C_MUTED, marginBottom:12, lineHeight:1.5}}>
              메뉴 설정에서 셀프체크인 노출을 켠 시술입니다. 노출중지를 누르면 패드에서 빠집니다.
            </div>
            {groups.length === 0 && (
              <div style={{padding:'28px 8px 32px', textAlign:'center', fontSize:13, color:C_MUTED}}>
                노출된 시술이 없어요. 메뉴 설정에서 2차 메뉴를 등록할 때 셀프체크인 노출을 켜 주세요.
              </div>
            )}
            {groups.map(g => (
              <div key={g.cat.id} style={{borderTop:`1px solid ${C_BORDER}`, padding:'10px 0 6px'}}>
                <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
                  <span style={{width:8, height:8, borderRadius:2, background:g.cat.color, flexShrink:0}}/>
                  <span style={{fontSize:12.5, fontWeight:800, color:C_INK}}>{g.cat.name}</span>
                  <span style={{fontSize:11.5, color:C_MUTED}}>{g.items.length}</span>
                </div>
                {g.items.map(it => (
                  <div key={it.id} style={{
                    display:'flex', alignItems:'center', gap:10,
                    padding:'8px 4px 8px 16px',
                  }}>
                    <div style={{flex:1, minWidth:0, fontSize:13, fontWeight:600, color:C_INK}}>{it.name}</div>
                    <div style={{fontSize:12, color:C_MUTED, fontVariantNumeric:'tabular-nums', flexShrink:0}}>
                      {it.duration ? `${it.duration}분` : '시간 없음'}
                    </div>
                    <div style={{width:88, textAlign:'right', fontSize:13, fontWeight:700, color:C_INK, fontVariantNumeric:'tabular-nums', flexShrink:0}}>
                      {checkinWon(it.price)}원
                    </div>
                    <button onClick={() => stopMenu(it)} style={{
                      height:28, padding:'0 10px', flexShrink:0, cursor:'pointer', fontFamily:'inherit',
                      border:'1px solid #FDBA74', borderRadius:7, background:'#FFF7ED', color:'#C2410C',
                      fontSize:11.5, fontWeight:700,
                    }}>노출중지</button>
                  </div>
                ))}
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}

window.C_CheckinPage = C_CheckinPage;
