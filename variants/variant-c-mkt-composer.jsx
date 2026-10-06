// 마케팅 · 단체발송 — 우측 메시지 작성 패널 + 발송 확인 모달
const {
  C_BLUE, C_BLUE_SOFT, C_CORAL, C_INK, C_MUTED, C_BORDER, C_BG, C_SURFACE,
  c_ghostBtnSm,
  MKT_STORE, MKT_BALANCE, MKT_UNIT, MKT_VARS, MKT_SAMPLES, MKT_ALIMTALK_TPL, MKT_SPECIAL_CHARS,
  mktBytes, mktRender, MKT_TODAY,
} = window;

const MKT_SMS_LIMIT = 90;
const MKT_LMS_LIMIT = 2000;

function mktComposeFull({ channel, isAd, body, tpl }) {
  if (channel === 'alimtalk') return tpl ? tpl.body : '';
  const head = isAd ? `(광고) ${MKT_STORE.name}\n` : '';
  const foot = isAd ? `\n\n무료수신거부 ${MKT_STORE.optout}` : '';
  return head + body + foot;
}
function mktMsgType({ channel, bytes, image }) {
  if (channel === 'alimtalk') return 'alimtalk';
  if (image) return 'mms';
  return bytes > MKT_SMS_LIMIT ? 'lms' : 'sms';
}

// 작은 세그먼트 컨트롤
function MktSeg({ value, onChange, options, size = 'md', full }) {
  return (
    <div style={{
      display:'inline-flex', padding:3, background:'#EEF1F6', borderRadius:8, gap:2,
      width: full ? '100%' : undefined,
    }}>
      {options.map(o => {
        const on = value === o.id;
        return (
          <button key={o.id} onClick={() => !o.disabled && onChange(o.id)} disabled={o.disabled} style={{
            flex: full ? 1 : undefined,
            padding: size === 'sm' ? '4px 10px' : '6px 12px',
            fontSize: size === 'sm' ? 11.5 : 12.5, fontWeight: on ? 700 : 500,
            border:'none', borderRadius:6, cursor: o.disabled ? 'not-allowed' : 'pointer',
            background: on ? C_SURFACE : 'transparent',
            color: o.disabled ? '#B6C0CF' : on ? C_INK : C_MUTED,
            boxShadow: on ? '0 1px 2px rgba(11,20,37,0.08)' : 'none',
            fontFamily:'inherit', display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6,
            whiteSpace:'nowrap',
          }}>{o.icon}{o.label}</button>
        );
      })}
    </div>
  );
}

function MktTypeBadge({ type }) {
  const map = {
    sms:{ label:'SMS', bg:'#ECFDF5', fg:'#047857' },
    lms:{ label:'LMS', bg:'#EFF6FF', fg:'#1D4ED8' },
    mms:{ label:'MMS', bg:'#F5F3FF', fg:'#6D28D9' },
    alimtalk:{ label:'알림톡', bg:'#FEF9C3', fg:'#713F12' },
  };
  const m = map[type];
  return <span style={{
    fontSize:10.5, fontWeight:800, letterSpacing:'0.02em',
    padding:'2px 7px', borderRadius:5, background:m.bg, color:m.fg,
  }}>{m.label}</span>;
}

// 말풍선 미리보기
function MktBubble({ text, title, image, channel, tpl, compact }) {
  if (channel === 'alimtalk') {
    return (
      <div style={{background:'#FFFFFF', borderRadius:12, overflow:'hidden', boxShadow:'0 1px 2px rgba(0,0,0,0.06)', maxWidth: compact ? '100%' : 250}}>
        <div style={{background:'#FEE500', padding:'8px 12px', fontSize:11.5, fontWeight:700, color:'#3C1E1E'}}>알림톡 도착</div>
        <div style={{padding:'12px', fontSize:12, lineHeight:1.6, color:'#1F2937', whiteSpace:'pre-wrap', wordBreak:'break-all'}}>{text}</div>
        {tpl && tpl.button && (
          <div style={{padding:'0 12px 12px'}}>
            <div style={{border:'1px solid #E5E7EB', borderRadius:6, padding:'7px', textAlign:'center', fontSize:11.5, color:'#374151', fontWeight:600}}>{tpl.button}</div>
          </div>
        )}
      </div>
    );
  }
  return (
    <div style={{
      background:'#E9EDF3', borderRadius:14, borderBottomLeftRadius:4, overflow:'hidden',
      maxWidth: compact ? '100%' : 250,
    }}>
      {image && (
        <div style={{
          height:110, background:'repeating-linear-gradient(135deg,#D6DCE6 0 8px,#CDD4DF 8px 16px)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:10.5, color:'#5C6B84', fontFamily:'ui-monospace, SFMono-Regular, Menlo, monospace',
        }}>event_banner.jpg</div>
      )}
      <div style={{padding:'10px 12px', fontSize:12, lineHeight:1.6, color:'#111827', whiteSpace:'pre-wrap', wordBreak:'break-all'}}>
        {title && <div style={{fontWeight:700, marginBottom:4}}>{title}</div>}
        {text || <span style={{color:'#94A3B8'}}>메시지 내용을 입력하면 여기에 표시됩니다</span>}
      </div>
    </div>
  );
}

// ───────── 작성 패널 ─────────
function C_MktComposer({ recipients, previewList, onRequestSend, initialSample = 1, smsOnly = false }) {
  const [channel, setChannel] = React.useState('sms');
  const [isAd, setIsAd] = React.useState(true);
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState(MKT_SAMPLES[initialSample].body);
  const [image, setImage] = React.useState(false);
  const [tplId, setTplId] = React.useState(MKT_ALIMTALK_TPL[0].id);
  const [fallback, setFallback] = React.useState(true);
  const [sendAt, setSendAt] = React.useState('now');
  const [rDate, setRDate] = React.useState('2026-09-22');
  const [rHour, setRHour] = React.useState('11');
  const [rMin, setRMin] = React.useState('00');
  const [pop, setPop] = React.useState(null); // 'special' | 'sample' | null
  const [pvIdx, setPvIdx] = React.useState(0);
  const taRef = React.useRef(null);

  const tpl = MKT_ALIMTALK_TPL.find(t => t.id === tplId);
  const full = mktComposeFull({ channel, isAd, body, tpl });
  const bytes = mktBytes(full);
  const type = mktMsgType({ channel, bytes, image });
  const unit = MKT_UNIT[type].price;
  const sendCount = channel === 'alimtalk' || !isAd ? recipients.count : recipients.countConsent;
  const cost = sendCount * unit;
  const after = MKT_BALANCE - cost;
  const over = channel !== 'alimtalk' && bytes > MKT_LMS_LIMIT;
  const night = isAd && channel !== 'alimtalk' && sendAt === 'reserve' && (Number(rHour) >= 21 || Number(rHour) < 8);

  const pvList = previewList.length ? previewList : [null];
  const pvC = pvList[pvIdx % pvList.length];
  const pvText = mktRender(full, pvC);

  React.useEffect(() => { setPvIdx(0); }, [previewList.length]);

  const insert = (s) => {
    const ta = taRef.current;
    if (!ta) { setBody(b => b + s); return; }
    const st = ta.selectionStart, en = ta.selectionEnd;
    const nb = body.slice(0, st) + s + body.slice(en);
    setBody(nb);
    requestAnimationFrame(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = st + s.length; });
  };

  const canSend = sendCount > 0 && !over && (channel === 'alimtalk' ? tpl && tpl.status === '승인' : body.trim().length > 0);

  const label = (t) => (
    <div style={{fontSize:11.5, fontWeight:700, color:C_MUTED, marginBottom:7, letterSpacing:'0.01em'}}>{t}</div>
  );

  return (
    <div style={{
      width:344, flexShrink:0, background:C_SURFACE, borderLeft:`1px solid ${C_BORDER}`,
      display:'flex', flexDirection:'column', minHeight:0, position:'relative',
    }}>
      {/* 헤더 */}
      <div style={{padding:'14px 16px 12px', borderBottom:`1px solid ${C_BORDER}`}}>
        <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
          <span style={{fontSize:14, fontWeight:700, color:C_INK}}>메시지 작성</span>
          <MktTypeBadge type={type}/>
          <div style={{flex:1}}/>
          <button onClick={() => setPop(pop === 'sample' ? null : 'sample')} style={{
            ...c_ghostBtnSm, fontSize:11.5, padding:'5px 9px', fontFamily:'inherit',
            background: pop === 'sample' ? C_BLUE_SOFT : C_SURFACE,
            color: pop === 'sample' ? C_BLUE : C_INK,
            borderColor: pop === 'sample' ? '#C7D6F5' : C_BORDER,
          }}>예시 문구</button>
        </div>
        {smsOnly ? (
          <div style={{fontSize:11.5, color:C_MUTED, background:C_BG, borderRadius:7, padding:'7px 10px', lineHeight:1.5}}>
            재방문 유도는 혜택 안내가 들어가는 <b style={{color:C_INK}}>광고성 메시지</b>라 문자(SMS·LMS·MMS)로만 보낼 수 있어요.
          </div>
        ) : (
          <MktSeg full value={channel} onChange={setChannel} options={[
            { id:'sms', label:'문자 (SMS·LMS·MMS)' },
            { id:'alimtalk', label:'카카오 알림톡' },
          ]}/>
        )}
      </div>

      {/* 예시 문구 팝오버 */}
      {pop === 'sample' && (
        <div style={{
          position:'absolute', top:52, right:12, width:300, zIndex:30,
          background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:10,
          boxShadow:'0 12px 28px rgba(11,20,37,0.14)', padding:6,
        }}>
          {MKT_SAMPLES.map(s => (
            <div key={s.id} onClick={() => { setChannel('sms'); setBody(s.body); setPop(null); }}
              style={{padding:'9px 10px', borderRadius:7, cursor:'pointer'}}
              onMouseEnter={e => e.currentTarget.style.background = '#F5F7FB'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{display:'flex', alignItems:'center', gap:6}}>
                <span style={{fontSize:10.5, fontWeight:700, color:C_BLUE, background:C_BLUE_SOFT, padding:'2px 6px', borderRadius:4}}>{s.tag}</span>
                <span style={{fontSize:12.5, fontWeight:600, color:C_INK}}>{s.title}</span>
              </div>
              <div style={{fontSize:11.5, color:C_MUTED, marginTop:4, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{s.body.replace(/\n/g,' ')}</div>
            </div>
          ))}
        </div>
      )}

      {/* 본문 (스크롤) */}
      <div style={{flex:1, overflow:'auto', padding:'14px 16px 16px', display:'flex', flexDirection:'column', gap:16}}>
        {channel === 'sms' ? (
          <>
            {/* 광고 여부 */}
            <div style={{
              display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
              background: isAd ? '#FFF7ED' : C_BG, border:`1px solid ${isAd ? '#FED7AA' : C_BORDER}`, borderRadius:8,
            }}>
              <div style={{flex:1}}>
                <div style={{fontSize:12.5, fontWeight:700, color:C_INK}}>광고성 메시지</div>
                <div style={{fontSize:11, color:C_MUTED, marginTop:2, lineHeight:1.45}}>
                  {isAd ? '(광고) 표기·수신거부 번호가 자동 삽입되고, 수신거부 고객은 제외돼요.' : '예약·휴무 안내 등 정보성 메시지로 발송돼요.'}
                </div>
              </div>
              <MktToggle checked={isAd} onChange={() => setIsAd(v => !v)}/>
            </div>

            {/* 입력 */}
            <div>
              {type !== 'sms' && (
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="제목 (선택, LMS·MMS만 표시)" style={{
                  width:'100%', height:34, padding:'0 10px', marginBottom:6,
                  border:`1px solid ${C_BORDER}`, borderRadius:7, fontSize:12.5, color:C_INK, outline:'none', fontFamily:'inherit',
                }}/>
              )}
              <div style={{border:`1px solid ${over ? C_CORAL : C_BORDER}`, borderRadius:8, overflow:'hidden'}}>
                {isAd && <div style={{padding:'8px 10px 0', fontSize:12, color:'#C2410C', fontWeight:600}}>(광고) {MKT_STORE.name}</div>}
                <textarea ref={taRef} value={body} onChange={e => setBody(e.target.value)}
                  placeholder="보낼 내용을 입력하세요"
                  style={{
                    width:'100%', minHeight:170, resize:'vertical', border:'none', outline:'none',
                    padding:'8px 10px', fontSize:12.5, lineHeight:1.65, color:C_INK, fontFamily:'inherit',
                    display:'block',
                  }}/>
                {isAd && <div style={{padding:'0 10px 8px', fontSize:12, color:'#C2410C', fontWeight:600}}>무료수신거부 {MKT_STORE.optout}</div>}
                {image && (
                  <div style={{margin:'0 10px 10px', display:'flex', alignItems:'center', gap:8, padding:'6px 8px', background:C_BG, borderRadius:6}}>
                    <div style={{width:28, height:28, borderRadius:4, background:'repeating-linear-gradient(135deg,#D6DCE6 0 4px,#CDD4DF 4px 8px)'}}/>
                    <span style={{fontSize:11.5, color:C_INK, flex:1}}>event_banner.jpg <span style={{color:C_MUTED}}>· 182KB</span></span>
                    <button onClick={() => setImage(false)} style={{border:'none', background:'transparent', color:C_MUTED, cursor:'pointer', display:'flex'}}><IconX size={13}/></button>
                  </div>
                )}
                <div style={{
                  display:'flex', alignItems:'center', gap:4, padding:'6px 8px',
                  borderTop:`1px solid ${C_BORDER}`, background:'#FBFCFE', position:'relative',
                }}>
                  <MktToolBtn on={pop === 'special'} onClick={() => setPop(pop === 'special' ? null : 'special')}>특수문자</MktToolBtn>
                  <MktToolBtn on={image} onClick={() => setImage(v => !v)}>이미지</MktToolBtn>
                  <div style={{flex:1}}/>
                  <span style={{fontSize:11.5, fontVariantNumeric:'tabular-nums', color: over ? C_CORAL : C_MUTED}}>
                    <b style={{color: over ? C_CORAL : C_INK, fontWeight:700}}>{bytes.toLocaleString()}</b> / {type === 'sms' ? MKT_SMS_LIMIT : MKT_LMS_LIMIT.toLocaleString()} byte
                  </span>
                  {pop === 'special' && (
                    <div style={{
                      position:'absolute', bottom:'100%', left:6, marginBottom:6, zIndex:20,
                      width:248, padding:8, background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:10,
                      boxShadow:'0 10px 24px rgba(11,20,37,0.14)',
                      display:'grid', gridTemplateColumns:'repeat(8, 1fr)', gap:2,
                    }}>
                      {MKT_SPECIAL_CHARS.map((ch, i) => (
                        <button key={i} onClick={() => insert(ch)} style={{
                          height:26, border:'none', background:'transparent', borderRadius:5, cursor:'pointer', fontSize:13, color:C_INK,
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = C_BLUE_SOFT}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>{ch}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {type === 'lms' && !over && (
                <div style={{fontSize:11, color:C_MUTED, marginTop:6}}>90byte를 넘어 장문(LMS)으로 전환됐어요 · 건당 {MKT_UNIT.lms.price}원</div>
              )}
              {over && <div style={{fontSize:11, color:C_CORAL, marginTop:6, fontWeight:600}}>최대 2,000byte까지 보낼 수 있어요.</div>}
            </div>

            {/* 변수 */}
            <div>
              {label('고객별 자동 입력')}
              <div style={{display:'flex', flexWrap:'wrap', gap:5}}>
                {MKT_VARS.map(v => (
                  <button key={v.key} onClick={() => insert(v.key)} style={{
                    padding:'5px 9px', fontSize:11.5, fontWeight:600, color:C_BLUE,
                    background:C_BLUE_SOFT, border:'1px solid #D6E0F7', borderRadius:6, cursor:'pointer', fontFamily:'inherit',
                  }}>+ {v.key.replace(/[#{}]/g, '')}</button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* 알림톡 템플릿 */}
            <div>
              {label('템플릿 선택')}
              <div style={{display:'flex', flexDirection:'column', gap:6}}>
                {MKT_ALIMTALK_TPL.map(t => {
                  const on = t.id === tplId;
                  const ok = t.status === '승인';
                  return (
                    <div key={t.id} onClick={() => ok && setTplId(t.id)} style={{
                      display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
                      border:`1px solid ${on ? C_BLUE : C_BORDER}`, background: on ? C_BLUE_SOFT : C_SURFACE,
                      borderRadius:8, cursor: ok ? 'pointer' : 'not-allowed', opacity: ok ? 1 : 0.6,
                    }}>
                      <span style={{
                        width:14, height:14, borderRadius:'50%', flexShrink:0,
                        border:`1.5px solid ${on ? C_BLUE : '#C3CCDA'}`,
                        boxShadow: on ? `inset 0 0 0 3px #fff` : 'none', background: on ? C_BLUE : '#fff',
                      }}/>
                      <div style={{flex:1, minWidth:0}}>
                        <div style={{fontSize:12.5, fontWeight:600, color:C_INK}}>{t.name}</div>
                        <div style={{fontSize:10.5, color:C_MUTED, marginTop:2, fontFamily:'ui-monospace, Menlo, monospace'}}>{t.code}</div>
                      </div>
                      <span style={{
                        fontSize:10.5, fontWeight:700, padding:'2px 7px', borderRadius:10,
                        background: ok ? '#ECFDF5' : '#FEF3C7', color: ok ? '#047857' : '#B45309',
                      }}>{t.status}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{
              display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
              background:C_BG, border:`1px solid ${C_BORDER}`, borderRadius:8,
            }}>
              <div style={{flex:1}}>
                <div style={{fontSize:12.5, fontWeight:700, color:C_INK}}>실패 시 문자로 대체 발송</div>
                <div style={{fontSize:11, color:C_MUTED, marginTop:2}}>카카오톡 미사용 고객에게 LMS로 보내요 (건당 {MKT_UNIT.lms.price}원)</div>
              </div>
              <MktToggle checked={fallback} onChange={() => setFallback(v => !v)}/>
            </div>
            <div style={{fontSize:11, color:C_MUTED, lineHeight:1.5, padding:'0 2px'}}>
              알림톡은 정보성 메시지만 보낼 수 있어요. 이벤트·할인 안내는 문자(광고)로 보내 주세요.
            </div>
          </>
        )}

        {/* 미리보기 */}
        <div>
          <div style={{display:'flex', alignItems:'center', marginBottom:7}}>
            <div style={{fontSize:11.5, fontWeight:700, color:C_MUTED, flex:1}}>받는 화면 미리보기</div>
            {pvC && (
              <div style={{display:'flex', alignItems:'center', gap:4}}>
                <button onClick={() => setPvIdx(i => (i - 1 + pvList.length) % pvList.length)} style={mktTinyBtn}><IconChevronL size={11}/></button>
                <span style={{fontSize:11.5, color:C_INK, fontWeight:600, minWidth:44, textAlign:'center'}}>{pvC.name}</span>
                <button onClick={() => setPvIdx(i => (i + 1) % pvList.length)} style={mktTinyBtn}><IconChevronR size={11}/></button>
              </div>
            )}
          </div>
          <div style={{background:'#F3F5F9', borderRadius:10, padding:'12px 12px 14px', border:`1px solid ${C_BORDER}`}}>
            <div style={{fontSize:10.5, color:C_MUTED, textAlign:'center', marginBottom:8}}>
              {channel === 'alimtalk' ? '카이키키 부평본점 (카카오 채널)' : `발신 ${MKT_STORE.tel}`}
            </div>
            <MktBubble text={pvText} title={type !== 'sms' && channel === 'sms' ? title : ''} image={channel === 'sms' && image} channel={channel} tpl={tpl} compact/>
          </div>
        </div>

        {/* 발송 시간 */}
        <div>
          {label('발송 시간')}
          <MktSeg full value={sendAt} onChange={setSendAt} options={[{ id:'now', label:'즉시 발송' }, { id:'reserve', label:'예약 발송' }]}/>
          {sendAt === 'reserve' && (
            <div style={{display:'flex', gap:6, marginTop:8}}>
              <input type="date" value={rDate} onChange={e => setRDate(e.target.value)} style={{...mktInput, flex:1.4}}/>
              <select value={rHour} onChange={e => setRHour(e.target.value)} style={{...mktInput, flex:1}}>
                {Array.from({length:24}, (_, h) => String(h).padStart(2,'0')).map(h => <option key={h} value={h}>{h}시</option>)}
              </select>
              <select value={rMin} onChange={e => setRMin(e.target.value)} style={{...mktInput, flex:1}}>
                {['00','10','20','30','40','50'].map(m => <option key={m} value={m}>{m}분</option>)}
              </select>
            </div>
          )}
          {night && (
            <div style={{marginTop:8, fontSize:11, color:'#B45309', background:'#FEF3C7', border:'1px solid #FCE9B8', borderRadius:6, padding:'7px 9px', lineHeight:1.5}}>
              밤 9시 ~ 오전 8시 광고 문자는 야간 수신에 별도 동의한 고객에게만 보낼 수 있어요.
            </div>
          )}
        </div>
      </div>

      {/* 하단 요약 + 버튼 */}
      <div style={{borderTop:`1px solid ${C_BORDER}`, padding:'12px 16px 14px', background:'#FBFCFE'}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr auto', rowGap:5, fontSize:12, color:C_MUTED, fontVariantNumeric:'tabular-nums'}}>
          <span>받는 사람 <span style={{color:C_MUTED}}>({recipients.modeLabel})</span></span>
          <span style={{color:C_INK, fontWeight:600, textAlign:'right'}}>{sendCount.toLocaleString()}명</span>
          {channel === 'sms' && isAd && recipients.count !== recipients.countConsent && (
            <>
              <span style={{paddingLeft:8}}>└ 수신거부 제외</span>
              <span style={{textAlign:'right'}}>−{(recipients.count - recipients.countConsent).toLocaleString()}명</span>
            </>
          )}
          <span>예상 차감 <span>({MKT_UNIT[type].label} {unit}원 × {sendCount.toLocaleString()})</span></span>
          <span style={{color:C_INK, fontWeight:700, textAlign:'right'}}>{cost.toLocaleString()}원</span>
          <span>발송 후 잔액</span>
          <span style={{color: after < 0 ? C_CORAL : C_INK, fontWeight:600, textAlign:'right'}}>{after.toLocaleString()}원</span>
        </div>
        <div style={{display:'flex', gap:6, marginTop:12}}>
          <button style={{...c_ghostBtnSm, padding:'0 12px', height:40, fontFamily:'inherit', fontWeight:600}}>테스트 발송</button>
          <button
            disabled={!canSend}
            onClick={() => canSend && (after < 0 ? (window.__goPage && window.__goPage('mkt-charge')) : onRequestSend({
              channel, type, isAd, title, image, tpl, fallback, unit, cost, after, sendCount,
              full, sendAt, rDate, rHour, rMin, previewCustomer: pvC,
            }))}
            style={{
              flex:1, height:40, border:'none', borderRadius:8,
              background: !canSend ? '#C3CCDA' : after < 0 ? C_CORAL : C_BLUE,
              color:'#fff', fontSize:13, fontWeight:700, cursor: canSend ? 'pointer' : 'not-allowed',
              fontFamily:'inherit', boxShadow: canSend ? '0 1px 2px rgba(30,64,175,0.25)' : 'none',
            }}>
            {after < 0 ? '잔액 부족 · 충전하기' :
              sendCount === 0 ? '받는 고객을 선택하세요' :
              `${sendCount.toLocaleString()}명에게 ${sendAt === 'now' ? '발송하기' : '예약하기'}`}
          </button>
        </div>
      </div>
    </div>
  );
}

const mktTinyBtn = {
  width:20, height:20, display:'inline-flex', alignItems:'center', justifyContent:'center',
  border:`1px solid ${C_BORDER}`, borderRadius:5, background:C_SURFACE, color:C_MUTED, cursor:'pointer', padding:0,
};
const mktInput = {
  height:34, padding:'0 8px', border:`1px solid ${C_BORDER}`, borderRadius:7,
  fontSize:12.5, color:C_INK, background:C_SURFACE, fontFamily:'inherit', outline:'none', minWidth:0,
};

function MktToolBtn({ on, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding:'4px 8px', fontSize:11.5, fontWeight:600, borderRadius:5, cursor:'pointer', fontFamily:'inherit',
      border:`1px solid ${on ? '#C7D6F5' : 'transparent'}`,
      background: on ? C_BLUE_SOFT : 'transparent', color: on ? C_BLUE : C_MUTED,
    }}>{children}</button>
  );
}

function MktToggle({ checked, onChange }) {
  return (
    <button onClick={onChange} style={{
      width:36, height:20, borderRadius:10, border:'none', padding:0, cursor:'pointer', flexShrink:0,
      background: checked ? C_BLUE : '#CBD5E1', position:'relative', transition:'background 0.15s',
    }}>
      <span style={{
        position:'absolute', top:2, left: checked ? 18 : 2, width:16, height:16, borderRadius:'50%',
        background:'#fff', boxShadow:'0 1px 2px rgba(0,0,0,0.2)', transition:'left 0.15s',
      }}/>
    </button>
  );
}

// ───────── 발송 확인 모달 ─────────
function C_MktSendConfirm({ payload, recipients, onClose, onConfirm }) {
  const [done, setDone] = React.useState(false);
  const p = payload;
  const when = p.sendAt === 'now' ? '지금 즉시' : `${p.rDate.replace(/-/g,'.')} ${p.rHour}:${p.rMin}`;
  const pvText = mktRender(p.full, p.previewCustomer);

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(11,20,37,0.45)', zIndex:200,
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width:640, background:C_SURFACE, borderRadius:14, overflow:'hidden',
        boxShadow:'0 24px 60px rgba(11,20,37,0.3)',
      }}>
        {!done ? (
          <>
            <div style={{padding:'18px 22px', borderBottom:`1px solid ${C_BORDER}`, display:'flex', alignItems:'center'}}>
              <div style={{fontSize:16, fontWeight:700, color:C_INK, flex:1}}>이대로 보낼까요?</div>
              <button onClick={onClose} style={{border:'none', background:'transparent', cursor:'pointer', color:C_MUTED, display:'flex'}}><IconX size={18}/></button>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 250px'}}>
              <div style={{padding:'18px 22px', display:'flex', flexDirection:'column', gap:14}}>
                {[
                  ['받는 사람', `${p.sendCount.toLocaleString()}명`, recipients.modeLabel + (p.isAd && p.channel === 'sms' && recipients.count !== recipients.countConsent ? ` · 수신거부 ${(recipients.count - recipients.countConsent).toLocaleString()}명 제외` : '')],
                  ['발송 채널', <span style={{display:'inline-flex', alignItems:'center', gap:6}}><MktTypeBadge type={p.type}/>{p.channel === 'sms' ? (p.isAd ? '광고성' : '정보성') : p.tpl.name}</span>, p.channel === 'alimtalk' && p.fallback ? '실패 시 LMS 대체 발송' : null],
                  ['발송 시간', when, p.sendAt === 'now' ? null : '예약 발송은 발송 내역에서 취소할 수 있어요'],
                  ['차감 금액', `${p.cost.toLocaleString()}원`, `건당 ${p.unit}원 · 발송 후 잔액 ${p.after.toLocaleString()}원`],
                ].map(([k, v, sub], i) => (
                  <div key={i} style={{display:'grid', gridTemplateColumns:'76px 1fr', alignItems:'baseline'}}>
                    <div style={{fontSize:12, color:C_MUTED}}>{k}</div>
                    <div>
                      <div style={{fontSize:14, fontWeight:700, color:C_INK, fontVariantNumeric:'tabular-nums'}}>{v}</div>
                      {sub && <div style={{fontSize:11.5, color:C_MUTED, marginTop:3}}>{sub}</div>}
                    </div>
                  </div>
                ))}
                {recipients.chips.length > 0 && (
                  <div style={{display:'grid', gridTemplateColumns:'76px 1fr'}}>
                    <div style={{fontSize:12, color:C_MUTED, paddingTop:3}}>적용 조건</div>
                    <div style={{display:'flex', flexWrap:'wrap', gap:4}}>
                      {recipients.chips.map(c => (
                        <span key={c.key} style={{fontSize:11, padding:'3px 8px', borderRadius:10, background:C_BG, border:`1px solid ${C_BORDER}`, color:C_INK}}>{c.label}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div style={{background:'#F3F5F9', padding:'18px 16px', borderLeft:`1px solid ${C_BORDER}`}}>
                <div style={{fontSize:11, color:C_MUTED, marginBottom:8}}>
                  {p.previewCustomer ? `${p.previewCustomer.name}님이 받는 화면` : '받는 화면'}
                </div>
                <div style={{maxHeight:300, overflow:'auto'}}>
                  <MktBubble text={pvText} title={p.type !== 'sms' && p.channel === 'sms' ? p.title : ''} image={p.image} channel={p.channel} tpl={p.tpl} compact/>
                </div>
              </div>
            </div>
            <div style={{padding:'14px 22px', borderTop:`1px solid ${C_BORDER}`, display:'flex', justifyContent:'flex-end', gap:8, background:'#FBFCFE'}}>
              <button onClick={onClose} style={{...c_ghostBtnSm, height:38, padding:'0 16px', fontFamily:'inherit', fontWeight:600}}>다시 확인</button>
              <button onClick={() => setDone(true)} style={{
                height:38, padding:'0 20px', border:'none', borderRadius:8, background:C_BLUE, color:'#fff',
                fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
              }}>{p.sendAt === 'now' ? `${p.sendCount.toLocaleString()}명에게 발송` : '예약 확정'}</button>
            </div>
          </>
        ) : (
          <div style={{padding:'40px 32px 28px', textAlign:'center'}}>
            <div style={{
              width:52, height:52, borderRadius:'50%', background:'#ECFDF5', color:'#059669',
              display:'inline-flex', alignItems:'center', justifyContent:'center', marginBottom:14,
            }}><IconCheck size={26} stroke={2.2}/></div>
            <div style={{fontSize:17, fontWeight:700, color:C_INK}}>
              {p.sendAt === 'now' ? '발송을 시작했어요' : '발송이 예약됐어요'}
            </div>
            <div style={{fontSize:12.5, color:C_MUTED, marginTop:6, lineHeight:1.6}}>
              {p.sendCount.toLocaleString()}명 · {p.cost.toLocaleString()}원 차감 예정<br/>
              발송 결과와 재방문 전환은 <b style={{color:C_INK}}>발송내역 &amp; 성과리포트</b>에서 확인할 수 있어요.
            </div>
            <div style={{display:'flex', justifyContent:'center', gap:8, marginTop:22}}>
              <button onClick={onConfirm} style={{...c_ghostBtnSm, height:38, padding:'0 16px', fontFamily:'inherit', fontWeight:600}}>닫기</button>
              <button onClick={() => { onConfirm(); window.__goPage && window.__goPage('mkt-report'); }} style={{
                height:38, padding:'0 18px', border:'none', borderRadius:8, background:C_BLUE, color:'#fff',
                fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
              }}>발송내역 보기</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { C_MktComposer, C_MktSendConfirm, MktSeg, MktToggle, MktTypeBadge });
