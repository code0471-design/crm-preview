// 마케팅 › 자동발송 — 알림톡 / 문자 템플릿 설정
const {
  C_BLUE, C_BLUE_SOFT, C_CORAL, C_INK, C_MUTED, C_BORDER, C_BG, C_SURFACE,
  c_ghostBtnSm,
  MKT_BALANCE, MKT_UNIT, MKT_STORE, MKT_CATS, mktBytes,
  AU_SAMPLE, AU_SMS_VARS, AU_REVIEW_PHRASES, AU_GROUP_ORDER,
  AU_ALIMTALK, AU_SMS, AU_AFTER_RULES, AU_SAVED_TEMPLATES,
} = window;

const AU_VAR_RE = /#\{([^}]+)\}/g;
const auFill = (t) => t.replace(AU_VAR_RE, (_, k) => AU_SAMPLE[k] != null ? AU_SAMPLE[k] : k);

// 미리보기: 변수는 샘플값으로 치환 + 은은한 하이라이트
function AuRich({ text, hl = true }) {
  const parts = [];
  let last = 0, m;
  const re = new RegExp(AU_VAR_RE.source, 'g');
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const v = AU_SAMPLE[m[1]] != null ? AU_SAMPLE[m[1]] : m[1];
    parts.push(hl
      ? <span key={m.index} style={{background:'rgba(30,64,175,0.08)', color:C_BLUE, borderRadius:3, padding:'0 2px'}}>{v}</span>
      : v);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}
// 템플릿 원문: 변수를 칩으로
function AuTplText({ text }) {
  const parts = [];
  let last = 0, m;
  const re = new RegExp(AU_VAR_RE.source, 'g');
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(<span key={m.index} style={{
      display:'inline-block', fontSize:11.5, fontWeight:600, color:C_BLUE, background:C_BLUE_SOFT,
      border:'1px solid #D6E0F7', borderRadius:4, padding:'0 5px', margin:'0 1px', lineHeight:'18px',
    }}>{m[1]}</span>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

// ───────── 페이지 ─────────
function C_MktAutoPage() {
  const [tab, setTab] = React.useState(() => localStorage.getItem('crm-au-tab') || 'alimtalk');
  const [al, setAl] = React.useState(AU_ALIMTALK);
  const [sms, setSms] = React.useState(AU_SMS);
  const [rules, setRules] = React.useState(AU_AFTER_RULES);
  const [selAl, setSelAl] = React.useState('al-rsv');
  const [selSms, setSelSms] = React.useState('sms-rsv');
  const [dirty, setDirty] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  React.useEffect(() => { localStorage.setItem('crm-au-tab', tab); }, [tab]);
  React.useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2200); return () => clearTimeout(t); }, [toast]);

  const list = tab === 'alimtalk' ? al : sms;
  const selId = tab === 'alimtalk' ? selAl : selSms;
  const item = list.find(x => x.id === selId) || list[0];
  const patch = (p) => {
    const setter = tab === 'alimtalk' ? setAl : setSms;
    setter(prev => prev.map(x => x.id === item.id ? { ...x, ...p } : x));
    setDirty(true);
  };
  const select = (id) => { tab === 'alimtalk' ? setSelAl(id) : setSelSms(id); setDirty(false); };

  const onCount = (arr) => arr.filter(x => x.on).length;

  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', minWidth:0, minHeight:0, overflow:'hidden', background:C_BG}}>
      {/* 서브헤더 */}
      <div style={{display:'flex', alignItems:'center', gap:10, padding:'0 14px', background:C_SURFACE, borderBottom:`1px solid ${C_BORDER}`, height:49, flexShrink:0}}>
        <div style={{fontSize:12.5, color:C_MUTED}}>
          홈 <span style={{margin:'0 6px'}}>›</span>마케팅<span style={{margin:'0 6px'}}>›</span>
          <span style={{color:C_INK, fontWeight:600}}>자동발송</span>
        </div>
        <div style={{flex:1}}/>
        {tab === 'sms' && <button style={{...c_ghostBtnSm, fontFamily:'inherit'}}>발신번호 관리</button>}
        <button onClick={() => window.__goPage && window.__goPage('mkt-report')} style={{...c_ghostBtnSm, fontFamily:'inherit'}}>발송 내역</button>
      </div>

      <div style={{flex:1, display:'flex', minHeight:0}}>
        {/* 좌: 트리거 목록 */}
        <AuTriggerList tab={tab} setTab={(t) => { setTab(t); setDirty(false); }} counts={{ alimtalk:[onCount(al), al.length], sms:[onCount(sms), sms.length] }}
          list={list} selId={item.id} onSelect={select}
          onToggle={(id) => {
            const setter = tab === 'alimtalk' ? setAl : setSms;
            setter(prev => prev.map(x => x.id === id ? { ...x, on: !x.on } : x));
          }}/>

        {/* 중앙: 설정 */}
        <div style={{flex:1, minWidth:0, overflow:'auto', padding:'16px 16px 20px'}}>
          <div style={{background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:10, overflow:'hidden'}}>
            <AuHeader tab={tab} item={item}/>
            <div style={{display:'grid', gridTemplateColumns:'1fr 296px'}}>
              <div style={{borderRight:`1px solid ${C_BORDER}`, minWidth:0}}>
                {tab === 'alimtalk'
                  ? <AuAlimtalkForm item={item} patch={patch}/>
                  : item.rules
                    ? <AuRulesForm item={item} patch={patch} rules={rules} setRules={(r) => { setRules(r); setDirty(true); }}/>
                    : <AuSmsForm item={item} patch={patch}/>}
              </div>
              <AuPreview tab={tab} item={item} rules={rules}/>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:8, padding:'12px 16px', borderTop:`1px solid ${C_BORDER}`, background:'#FBFCFE'}}>
              <button disabled={!dirty} onClick={() => { setDirty(false); setToast(`'${item.name}' 설정을 저장했어요`); }} style={{
                height:36, padding:'0 22px', border:'none', borderRadius:8, fontFamily:'inherit',
                background: dirty ? C_BLUE : '#C3CCDA', color:'#fff', fontSize:13, fontWeight:700,
                cursor: dirty ? 'pointer' : 'not-allowed',
              }}>저장</button>
              {dirty && <span style={{fontSize:11.5, color:'#B45309'}}>저장하지 않은 변경사항이 있어요</span>}
              <div style={{flex:1}}/>
              <button onClick={() => setToast('내 번호(010-5096-3265)로 테스트 발송했어요')} style={{...c_ghostBtnSm, height:36, padding:'0 14px', fontFamily:'inherit', fontWeight:600}}>테스트 발송</button>
            </div>
          </div>
        </div>
      </div>

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

// ───── 좌측 목록 ─────
function AuTriggerList({ tab, setTab, counts, list, selId, onSelect, onToggle }) {
  const groups = AU_GROUP_ORDER.map(g => ({ g, items: list.filter(x => x.group === g) })).filter(x => x.items.length);
  const units = tab === 'alimtalk' ? ['alimtalk','lms'] : ['sms','lms'];
  return (
    <div style={{width:248, flexShrink:0, background:C_SURFACE, borderRight:`1px solid ${C_BORDER}`, display:'flex', flexDirection:'column', minHeight:0}}>
      {/* 채널 선택 */}
      <div style={{padding:'12px 12px 10px', borderBottom:`1px solid ${C_BORDER}`}}>
        <div style={{fontSize:11, fontWeight:700, color:C_MUTED, marginBottom:7, paddingLeft:2}}>발송 채널</div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:6}}>
          {[
            { id:'alimtalk', label:'알림톡', sub:'카카오 · 18원', dot:'#FEE500' },
            { id:'sms',      label:'문자',   sub:'SMS·LMS · 20원~', dot:'#10B981' },
          ].map(c => {
            const on = tab === c.id;
            const [n, t] = counts[c.id];
            return (
              <button key={c.id} onClick={() => setTab(c.id)} style={{
                textAlign:'left', padding:'9px 10px', borderRadius:8, cursor:'pointer', fontFamily:'inherit',
                border:`1.5px solid ${on ? C_BLUE : C_BORDER}`, background: on ? C_BLUE_SOFT : C_SURFACE,
              }}>
                <div style={{display:'flex', alignItems:'center', gap:6}}>
                  <span style={{width:8, height:8, borderRadius:2, background:c.dot, boxShadow:'inset 0 0 0 1px rgba(0,0,0,0.08)'}}/>
                  <span style={{fontSize:13, fontWeight:700, color: on ? C_BLUE : C_INK}}>{c.label}</span>
                  <div style={{flex:1}}/>
                  <span style={{fontSize:10.5, fontWeight:700, color: on ? C_BLUE : C_MUTED, fontVariantNumeric:'tabular-nums'}}>{n}/{t}</span>
                </div>
                <div style={{fontSize:10.5, color:C_MUTED, marginTop:3}}>{c.sub}</div>
              </button>
            );
          })}
        </div>
      </div>
      <div style={{flex:1, overflow:'auto', padding:'6px 8px 12px'}}>
        {groups.map(({ g, items }) => (
          <div key={g}>
            <div style={{fontSize:11, fontWeight:700, color:C_MUTED, padding:'12px 8px 5px', letterSpacing:'0.02em'}}>{g}</div>
            {items.map(it => {
              const sel = it.id === selId;
              return (
                <div key={it.id} onClick={() => onSelect(it.id)} style={{
                  display:'flex', alignItems:'center', gap:8, padding:'8px 8px', borderRadius:7, cursor:'pointer',
                  background: sel ? C_BLUE_SOFT : 'transparent',
                }}
                onMouseEnter={e => { if (!sel) e.currentTarget.style.background = '#F5F7FB'; }}
                onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'transparent'; }}>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:12.5, fontWeight: sel ? 700 : 500, color: sel ? C_BLUE : C_INK, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{it.name}</div>
                    <div style={{fontSize:10.5, color:C_MUTED, marginTop:1}}>{it.event}{it.recipient === 'designer' ? ' · 디자이너 수신' : ''}</div>
                  </div>
                  <div onClick={e => e.stopPropagation()}>
                    <AuMiniToggle checked={it.on} onChange={() => onToggle(it.id)}/>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {/* 잔액 */}
      <div style={{padding:'12px 14px', borderTop:`1px solid ${C_BORDER}`, background:'#FBFCFE'}}>
        <div style={{display:'flex', alignItems:'center'}}>
          <div style={{flex:1}}>
            <div style={{fontSize:11, fontWeight:600, color:C_MUTED}}>문자 캐쉬 잔액</div>
            <div style={{fontSize:17, fontWeight:800, color:C_INK, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em'}}>
              {MKT_BALANCE.toLocaleString()}<span style={{fontSize:12, fontWeight:600, color:C_MUTED, marginLeft:2}}>원</span>
            </div>
          </div>
          <button onClick={() => window.__goPage && window.__goPage('mkt-charge')} style={{
            height:28, padding:'0 11px', border:'none', borderRadius:7, background:C_BLUE, color:'#fff',
            fontSize:11.5, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
          }}>충전</button>
        </div>
        <div style={{display:'flex', gap:10, marginTop:6}}>
          {units.map(k => (
            <span key={k} style={{fontSize:11, color:C_MUTED, display:'flex', alignItems:'center', gap:4, fontVariantNumeric:'tabular-nums'}}>
              <span style={{width:6, height:6, borderRadius:2, background:MKT_UNIT[k].color}}/>
              {MKT_UNIT[k].label} <b style={{color:C_INK, fontWeight:600}}>{Math.floor(MKT_BALANCE / MKT_UNIT[k].price).toLocaleString()}건</b>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
function AuMiniToggle({ checked, onChange }) {
  return (
    <button onClick={onChange} title={checked ? '사용 중' : '미사용'} style={{
      width:28, height:16, borderRadius:8, border:'none', padding:0, cursor:'pointer', flexShrink:0,
      background: checked ? '#059669' : '#D5DBE5', position:'relative', transition:'background 0.15s',
    }}>
      <span style={{position:'absolute', top:2, left: checked ? 14 : 2, width:12, height:12, borderRadius:'50%', background:'#fff', transition:'left 0.15s'}}/>
    </button>
  );
}

// ───── 카드 헤더 ─────
function AuHeader({ tab, item }) {
  const prices = tab === 'alimtalk'
    ? [['알림톡', MKT_UNIT.alimtalk.price], ['실패 시 대체 문자(LMS)', MKT_UNIT.lms.price]]
    : [['단문 문자(SMS)', MKT_UNIT.sms.price], ['장문 문자(LMS)', MKT_UNIT.lms.price]];
  return (
    <div style={{padding:'16px 18px 14px', borderBottom:`1px solid ${C_BORDER}`, display:'flex', alignItems:'flex-start', gap:12}}>
      <div style={{flex:1}}>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <span style={{fontSize:16, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>{item.name}</span>
          <span style={{
            fontSize:10.5, fontWeight:700, padding:'2px 8px', borderRadius:10,
            background: item.on ? '#ECFDF5' : '#EEF1F6', color: item.on ? '#047857' : C_MUTED,
          }}>{item.on ? '사용 중' : '미사용'}</span>
          {item.ad && <span style={{fontSize:10.5, fontWeight:700, padding:'2px 8px', borderRadius:10, background:'#FFF7ED', color:'#C2410C'}}>광고성</span>}
        </div>
        <div style={{fontSize:12, color:C_MUTED, marginTop:5, display:'flex', alignItems:'center', gap:6}}>
          <IconBell size={12}/> <b style={{color:C_INK, fontWeight:600}}>{item.event}</b> 자동 발송돼요
          {item.recipient === 'designer' && <> · 받는 사람: <b style={{color:C_INK, fontWeight:600}}>담당 디자이너</b></>}
          {item.recipientNote && <> · {item.recipientNote}</>}
        </div>
      </div>
      <div style={{display:'flex', gap:6}}>
        {prices.map(([l, p]) => (
          <div key={l} style={{padding:'6px 10px', background:C_BG, borderRadius:7, textAlign:'right'}}>
            <div style={{fontSize:10.5, color:C_MUTED}}>{l}</div>
            <div style={{fontSize:13, fontWeight:700, color:C_INK, fontVariantNumeric:'tabular-nums'}}>{p}원<span style={{fontSize:10.5, color:C_MUTED, fontWeight:500}}>/건</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ───── 공용 폼 행 ─────
function AuRow({ title, desc, right, children, last }) {
  return (
    <div style={{padding:'14px 18px', borderBottom: last ? 'none' : `1px solid ${C_BORDER}`}}>
      <div style={{display:'flex', alignItems:'center', gap:10}}>
        <div style={{flex:1}}>
          <div style={{fontSize:12.5, fontWeight:700, color:C_INK}}>{title}</div>
          {desc && <div style={{fontSize:11.5, color:C_MUTED, marginTop:3, lineHeight:1.5}}>{desc}</div>}
        </div>
        {right}
      </div>
      {children && <div style={{marginTop:10}}>{children}</div>}
    </div>
  );
}
const auSelect = {
  height:34, padding:'0 10px', border:`1px solid ${C_BORDER}`, borderRadius:7, minWidth:220,
  fontSize:12.5, color:C_INK, background:C_SURFACE, fontFamily:'inherit', outline:'none',
};

function AuTiming({ item, patch }) {
  const t = item.timing;
  if (t.kind === 'reserve') {
    const mode = item.timingMode || 'time';
    const opts = mode === 'time' ? t.time : t.date;
    return (
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <window.MktSeg size="sm" value={mode} onChange={v => patch({ timingMode:v, timingVal:(v === 'time' ? t.time : t.date)[0] })} options={[
          { id:'time', label:'시간 (00분 후)' }, { id:'date', label:'날짜 (00일 전)' },
        ]}/>
        <select value={item.timingVal || opts[0]} onChange={e => patch({ timingVal:e.target.value })} style={{...auSelect, minWidth:180}}>
          {opts.map(o => <option key={o}>{o}</option>)}
        </select>
      </div>
    );
  }
  return (
    <select value={item.timingVal || t.options[0]} onChange={e => patch({ timingVal:e.target.value })} disabled={t.options.length === 1}
      style={{...auSelect, background: t.options.length === 1 ? C_BG : C_SURFACE}}>
      {t.options.map(o => <option key={o}>{o}</option>)}
    </select>
  );
}

// ───── 알림톡 폼 ─────
function AuAlimtalkForm({ item, patch }) {
  const fb = item.fallback != null ? item.fallback : true;
  return (
    <>
      <AuRow title="알림 사용" desc={item.on ? '조건이 맞으면 자동으로 발송돼요.' : '꺼져 있어요. 켜면 바로 발송이 시작돼요.'}
        right={<window.MktToggle checked={item.on} onChange={() => patch({ on: !item.on })}/>}>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <span style={{fontSize:12, color:C_MUTED, width:56}}>발송 시점</span>
          <AuTiming item={item} patch={patch}/>
        </div>
      </AuRow>

      {item.review && (
        <>
          <AuRow title="네이버예약 시술건만 발송" desc="네이버예약으로 들어온 예약의 매출 입력 건에만 발송해요."
            right={<window.MktToggle checked={!!item.naverOnly} onChange={() => patch({ naverOnly: !item.naverOnly })}/>}/>
          <AuRow title="리뷰 요청 문구" desc="템플릿의 #{리뷰문구} 자리에 들어가요.">
            <select value={item.reviewPhrase || AU_REVIEW_PHRASES[0]} onChange={e => { AU_SAMPLE['리뷰문구'] = e.target.value; patch({ reviewPhrase:e.target.value }); }} style={{...auSelect, width:'100%'}}>
              {AU_REVIEW_PHRASES.map(p => <option key={p}>{p}</option>)}
            </select>
          </AuRow>
          <AuRow title="리뷰 작성하기 버튼 링크" desc="네이버·카카오·구글 지도 등 리뷰를 남길 수 있는 주소를 넣어 주세요.">
            <div style={{display:'flex', gap:6}}>
              <input value={item.url || ''} onChange={e => patch({ url:e.target.value })} placeholder="https://" style={{...auSelect, flex:1, minWidth:0}}/>
              {['네이버','카카오맵','구글'].map(s => (
                <button key={s} onClick={() => patch({ url:`https://${s === '네이버' ? 'm.place.naver.com/hairshop/1234567/review' : s === '카카오맵' ? 'place.map.kakao.com/7654321' : 'g.page/kaikiki-bupyeong/review'}` })}
                  style={{...c_ghostBtnSm, fontFamily:'inherit', whiteSpace:'nowrap'}}>{s}</button>
              ))}
            </div>
            {item.on && !item.url && <div style={{fontSize:11, color:C_CORAL, marginTop:6, fontWeight:600}}>링크가 없으면 버튼이 동작하지 않아요.</div>}
          </AuRow>
        </>
      )}

      <AuRow title="템플릿" desc="카카오 검수를 통과한 문구만 보낼 수 있어요. 내용을 바꾸려면 수정 요청 후 재검수(1~2영업일)가 필요해요.">
        <div style={{border:`1px solid ${C_BORDER}`, borderRadius:8, overflow:'hidden'}}>
          <div style={{display:'flex', alignItems:'center', gap:8, padding:'8px 12px', background:'#FBFCFE', borderBottom:`1px solid ${C_BORDER}`}}>
            <span style={{fontSize:11, fontFamily:'ui-monospace, Menlo, monospace', color:C_MUTED}}>{item.code}</span>
            <span style={{fontSize:10.5, fontWeight:700, padding:'1px 7px', borderRadius:10, background:'#ECFDF5', color:'#047857'}}>승인</span>
            <div style={{flex:1}}/>
            <span style={{fontSize:11, color:C_MUTED}}>읽기 전용</span>
          </div>
          <div style={{padding:'12px', fontSize:12.5, lineHeight:1.75, color:C_INK, whiteSpace:'pre-wrap', wordBreak:'keep-all'}}>
            <AuTplText text={item.body}/>
          </div>
          {item.button && (
            <div style={{padding:'0 12px 12px'}}>
              <span style={{fontSize:11, color:C_MUTED, marginRight:6}}>버튼</span>
              <span style={{fontSize:12, fontWeight:600, color:C_INK, padding:'3px 10px', border:`1px solid ${C_BORDER}`, borderRadius:5}}>{item.button}</span>
            </div>
          )}
        </div>
      </AuRow>

      <AuRow last title="실패 시 문자로 대체 발송"
        desc={`카카오톡 미사용·알림톡 수신거부 고객에게 장문 문자(LMS)로 보내요. 대체 문자는 건당 ${MKT_UNIT.lms.price}원이 별도로 부과돼요.`}
        right={<window.MktToggle checked={fb} onChange={() => patch({ fallback: !fb })}/>}/>
    </>
  );
}

// ───── 문자 폼 ─────
function AuSmsEditor({ value, onChange, ad, minH = 200 }) {
  const ref = React.useRef(null);
  const [tplOpen, setTplOpen] = React.useState(false);
  const full = (ad ? `(광고) ${MKT_STORE.name}\n` : '') + auFill(value) + (ad ? `\n무료수신거부 ${MKT_STORE.optout}` : '');
  const bytes = mktBytes(full);
  const type = bytes > 90 ? 'lms' : 'sms';
  const insert = (k) => {
    const ta = ref.current, s = `#{${k}}`;
    const st = ta ? ta.selectionStart : value.length, en = ta ? ta.selectionEnd : value.length;
    onChange(value.slice(0, st) + s + value.slice(en));
    requestAnimationFrame(() => { if (ta) { ta.focus(); ta.selectionStart = ta.selectionEnd = st + s.length; } });
  };
  return (
    <div>
      <div style={{border:`1px solid ${C_BORDER}`, borderRadius:8, overflow:'hidden', position:'relative'}}>
        {ad && <div style={{padding:'8px 12px 0', fontSize:12, color:'#C2410C', fontWeight:600}}>(광고) {MKT_STORE.name}</div>}
        <textarea ref={ref} value={value} onChange={e => onChange(e.target.value)} style={{
          width:'100%', minHeight:minH, resize:'vertical', border:'none', outline:'none', display:'block',
          padding:'10px 12px', fontSize:12.5, lineHeight:1.7, color:C_INK, fontFamily:'inherit',
        }}/>
        {ad && <div style={{padding:'0 12px 8px', fontSize:12, color:'#C2410C', fontWeight:600}}>무료수신거부 {MKT_STORE.optout}</div>}
        <div style={{display:'flex', alignItems:'center', gap:6, padding:'6px 10px', borderTop:`1px solid ${C_BORDER}`, background:'#FBFCFE'}}>
          <button onClick={() => setTplOpen(o => !o)} style={{
            padding:'4px 8px', fontSize:11.5, fontWeight:600, borderRadius:5, cursor:'pointer', fontFamily:'inherit',
            border:`1px solid ${tplOpen ? '#C7D6F5' : 'transparent'}`, background: tplOpen ? C_BLUE_SOFT : 'transparent', color: tplOpen ? C_BLUE : C_MUTED,
          }}>템플릿 불러오기</button>
          <div style={{flex:1}}/>
          <window.MktTypeBadge type={type}/>
          <span style={{fontSize:11.5, color:C_MUTED, fontVariantNumeric:'tabular-nums'}}>
            <b style={{color:C_INK}}>{bytes}</b> / {type === 'sms' ? 90 : '2,000'} byte
          </span>
        </div>
        {tplOpen && (
          <div style={{
            position:'absolute', left:8, bottom:40, width:300, zIndex:20, padding:6,
            background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:10, boxShadow:'0 12px 28px rgba(11,20,37,0.14)',
          }}>
            {AU_SAVED_TEMPLATES.map(t => (
              <div key={t.id} onClick={() => { onChange(t.body); setTplOpen(false); }} style={{padding:'8px 10px', borderRadius:7, cursor:'pointer'}}
                onMouseEnter={e => e.currentTarget.style.background = '#F5F7FB'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{fontSize:12.5, fontWeight:600, color:C_INK}}>{t.name}</div>
                <div style={{fontSize:11, color:C_MUTED, marginTop:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{auFill(t.body).replace(/\n/g,' ')}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{display:'flex', flexWrap:'wrap', gap:5, marginTop:8}}>
        {AU_SMS_VARS.map(k => (
          <button key={k} onClick={() => insert(k)} style={{
            padding:'4px 8px', fontSize:11.5, fontWeight:600, color:C_BLUE, background:C_BLUE_SOFT,
            border:'1px solid #D6E0F7', borderRadius:6, cursor:'pointer', fontFamily:'inherit',
          }}>+ {k}</button>
        ))}
      </div>
      {type === 'lms' && <div style={{fontSize:11, color:C_MUTED, marginTop:6}}>치환 후 90byte를 넘으면 장문(LMS, 건당 {MKT_UNIT.lms.price}원)으로 자동 전환돼요. 고객명·일시 길이에 따라 달라질 수 있어요.</div>}
    </div>
  );
}

function AuSmsForm({ item, patch }) {
  return (
    <>
      <AuRow title="자동 문자 사용" desc={item.on ? '조건이 맞으면 자동으로 발송돼요.' : '꺼져 있어요. 켜면 바로 발송이 시작돼요.'}
        right={<window.MktToggle checked={item.on} onChange={() => patch({ on: !item.on })}/>}>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <span style={{fontSize:12, color:C_MUTED, width:56}}>발송 시점</span>
          <AuTiming item={item} patch={patch}/>
        </div>
        {item.ad && (
          <div style={{marginTop:10, fontSize:11.5, color:'#9A3412', background:'#FFF7ED', border:'1px solid #FED7AA', borderRadius:7, padding:'8px 10px', lineHeight:1.5}}>
            혜택 안내가 포함된 <b>광고성 문자</b>예요. (광고) 표기·수신거부 번호가 자동으로 붙고, 광고 수신 거부 고객에게는 발송되지 않아요.
          </div>
        )}
      </AuRow>
      <AuRow last title="발송 내용" desc="변수는 고객별 실제 값으로 바뀌어 발송돼요.">
        <AuSmsEditor value={item.body} onChange={v => patch({ body:v })} ad={item.ad}/>
      </AuRow>
    </>
  );
}

// ───── 문자 · 시술 후 안내 (시술별 규칙) ─────
function AuRulesForm({ item, patch, rules, setRules }) {
  const [openId, setOpenId] = React.useState(rules[0] && rules[0].id);
  const upd = (id, p) => setRules(rules.map(r => r.id === id ? { ...r, ...p } : r));
  const catOf = (id) => MKT_CATS.find(c => c.id === id) || { name:id, color:'#94A3B8' };
  const add = () => {
    const used = rules.map(r => r.cat);
    const cat = (MKT_CATS.find(c => !used.includes(c.id)) || MKT_CATS[0]).id;
    const id = 'r' + Date.now();
    setRules([...rules, { id, cat, days:7, hour:'11', on:true, body:'#{고객명}님, 시술 후 불편한 점은 없으신가요?\n궁금한 점은 #{담당자명}에게 편하게 물어보세요.' }]);
    setOpenId(id);
  };
  const numSt = {
    width:52, height:30, border:`1px solid ${C_BORDER}`, borderRadius:6, textAlign:'center',
    fontSize:12.5, fontWeight:700, color:C_INK, fontFamily:'inherit', outline:'none', fontVariantNumeric:'tabular-nums',
  };
  return (
    <>
      <AuRow title="자동 문자 사용" desc="시술 종류별로 발송 시점과 문구를 다르게 설정해요."
        right={<window.MktToggle checked={item.on} onChange={() => patch({ on: !item.on })}/>}/>
      <div style={{padding:'14px 18px'}}>
        <div style={{display:'flex', alignItems:'center', marginBottom:10}}>
          <div style={{fontSize:12.5, fontWeight:700, color:C_INK, flex:1}}>시술별 발송 규칙 <span style={{color:C_MUTED, fontWeight:500}}>{rules.length}</span></div>
          <button onClick={add} style={{...c_ghostBtnSm, fontFamily:'inherit', display:'flex', alignItems:'center', gap:4}}><IconPlus size={12}/> 규칙 추가</button>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:8}}>
          {rules.map(r => {
            const open = openId === r.id;
            const c = catOf(r.cat);
            return (
              <div key={r.id} style={{border:`1px solid ${open ? '#C7D6F5' : C_BORDER}`, borderRadius:8, overflow:'hidden', opacity: r.on ? 1 : 0.6}}>
                <div onClick={() => setOpenId(open ? null : r.id)} style={{
                  display:'flex', alignItems:'center', gap:8, padding:'10px 12px', cursor:'pointer',
                  background: open ? '#F8FAFF' : C_SURFACE, fontSize:12.5, color:C_INK, flexWrap:'wrap',
                }}>
                  <select value={r.cat} onClick={e => e.stopPropagation()} onChange={e => upd(r.id, { cat:e.target.value })} style={{...auSelect, minWidth:0, width:150, height:30}}>
                    {MKT_CATS.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
                  </select>
                  <span>시술</span>
                  <input value={r.days} onClick={e => e.stopPropagation()} onChange={e => upd(r.id, { days:e.target.value.replace(/[^0-9]/g,'') })} style={numSt}/>
                  <span>일 후</span>
                  <select value={r.hour} onClick={e => e.stopPropagation()} onChange={e => upd(r.id, { hour:e.target.value })} style={{...auSelect, minWidth:0, width:96, height:30}}>
                    {['09','10','11','12','14','16','18'].map(h => <option key={h} value={h}>{Number(h) < 12 ? `오전 ${Number(h)}시` : `오후 ${Number(h) === 12 ? 12 : Number(h) - 12}시`}</option>)}
                  </select>
                  <span>발송</span>
                  <div style={{flex:1}}/>
                  <span style={{width:8, height:8, borderRadius:'50%', background:c.color}}/>
                  <div onClick={e => e.stopPropagation()} style={{display:'flex', alignItems:'center', gap:6}}>
                    <AuMiniToggle checked={r.on} onChange={() => upd(r.id, { on: !r.on })}/>
                    <button onClick={() => setRules(rules.filter(x => x.id !== r.id))} title="삭제" style={{border:'none', background:'transparent', color:C_MUTED, cursor:'pointer', display:'flex', padding:2}}><IconX size={13}/></button>
                  </div>
                  {open ? <IconChevronU size={14} style={{color:C_MUTED}}/> : <IconChevronD size={14} style={{color:C_MUTED}}/>}
                </div>
                {open && (
                  <div style={{padding:'10px 12px 12px', borderTop:`1px solid ${C_BORDER}`}}>
                    <AuSmsEditor value={r.body} onChange={v => upd(r.id, { body:v })} minH={110}/>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div style={{fontSize:11, color:C_MUTED, marginTop:10, lineHeight:1.5}}>
          한 고객이 같은 날 여러 시술을 받으면 규칙별로 각각 발송돼요. 같은 날 발송이 겹치면 1건만 보내요.
        </div>
      </div>
    </>
  );
}

// ───── 우측 미리보기 ─────
function AuPreview({ tab, item, rules }) {
  let body = item.body, title = null;
  if (item.rules) {
    const r = rules[0];
    body = r ? r.body : '';
    title = r ? `${(MKT_CATS.find(c => c.id === r.cat) || {}).name} · ${r.days}일 후` : null;
  }
  const full = tab === 'sms'
    ? (item.ad ? `(광고) ${MKT_STORE.name}\n` : '') + body + (item.ad ? `\n무료수신거부 ${MKT_STORE.optout}` : '')
    : body;
  const type = tab === 'alimtalk' ? 'alimtalk' : mktBytes(auFill(full)) > 90 ? 'lms' : 'sms';
  return (
    <div style={{background:'#F3F5F9', padding:'16px 18px', display:'flex', flexDirection:'column', alignItems:'center'}}>
      <div style={{alignSelf:'stretch', display:'flex', alignItems:'center', marginBottom:10}}>
        <span style={{fontSize:11.5, fontWeight:700, color:C_MUTED, flex:1}}>받는 화면 미리보기</span>
        <window.MktTypeBadge type={type}/>
      </div>
      <div style={{
        width:244, borderRadius:26, background:'#fff', padding:8,
        boxShadow:'0 0 0 1px #D5DBE5, 0 8px 20px rgba(11,20,37,0.08)',
      }}>
        <div style={{borderRadius:19, background: tab === 'alimtalk' ? '#B9CCE0' : '#F1F3F7', padding:'14px 10px 16px', minHeight:380}}>
          <div style={{fontSize:10, color: tab === 'alimtalk' ? '#3B4A5E' : C_MUTED, textAlign:'center', marginBottom:10}}>
            {tab === 'alimtalk' ? `${MKT_STORE.name} · 카카오 채널` : `${MKT_STORE.tel}`}
          </div>
          {title && <div style={{fontSize:10, color:C_MUTED, textAlign:'center', marginBottom:6}}>{title}</div>}
          {tab === 'alimtalk' ? (
            <div style={{background:'#fff', borderRadius:10, overflow:'hidden'}}>
              <div style={{background:'#FEE500', padding:'8px 11px', fontSize:11.5, fontWeight:700, color:'#3C1E1E'}}>알림톡 도착</div>
              <div style={{padding:'11px', fontSize:11.5, lineHeight:1.65, color:'#1F2937', whiteSpace:'pre-wrap', wordBreak:'break-all'}}>
                <AuRich text={body}/>
              </div>
              {item.button && (
                <div style={{padding:'0 11px 11px'}}>
                  <div style={{background:'#F3F4F6', borderRadius:5, padding:'8px', textAlign:'center', fontSize:11.5, color:'#374151', fontWeight:600}}>{item.button}</div>
                </div>
              )}
            </div>
          ) : (
            <div style={{background:'#E2E7EF', borderRadius:12, borderBottomLeftRadius:3, padding:'10px 11px', fontSize:11.5, lineHeight:1.65, color:'#111827', whiteSpace:'pre-wrap', wordBreak:'break-all'}}>
              {body ? <AuRich text={full}/> : <span style={{color:'#94A3B8'}}>내용을 입력하세요</span>}
            </div>
          )}
        </div>
      </div>
      <div style={{fontSize:10.5, color:C_MUTED, marginTop:10, textAlign:'center', lineHeight:1.5}}>
        파란 글씨는 고객별로 바뀌는 값이에요<br/>(예시: {AU_SAMPLE['고객명']} 고객)
      </div>
    </div>
  );
}

window.C_MktAutoPage = C_MktAutoPage;
