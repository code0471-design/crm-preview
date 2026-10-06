// 매출 입력 화면 — 고정 헤더/좌측 메뉴/오른쪽 날개 사이의 콘텐츠 영역(948px)에 렌더
// 구성: 헤더 / 좌: 고객정보·보유자산·최근방문·판매항목·결제수단·차감 / 우: 결제 요약(sticky)

const {
  C_BLUE, C_BLUE_SOFT, C_INK, C_MUTED, C_BORDER, C_BG, C_SURFACE,
} = window;

const SL_won = (n) => new Intl.NumberFormat('ko-KR').format(Math.max(0, Math.round(n || 0)));
const SL_TEAL = '#0E7490';

const SL_TYPES = {
  service: { label:'시술',   color:'#1E40AF', soft:'#EFF3FC' },
  product: { label:'제품',   color:'#B45309', soft:'#FEF3C7' },
  package: { label:'정액권', color:'#7C3AED', soft:'#F3EEFF' },
  ticket:  { label:'티켓권', color:SL_TEAL,   soft:'#E0F7FA' },
};

const SL_METHODS = [
  { id:'card',     label:'카드',   full:'카드' },
  { id:'cash',     label:'현금',   full:'현금' },
  { id:'transfer', label:'이체',   full:'계좌이체' },
  { id:'naver',    label:'네이버', full:'네이버페이' },
  { id:'kakao',    label:'카카오', full:'카카오페이', etc:true },
  { id:'zero',     label:'제로페이', full:'제로페이', etc:true },
  { id:'etc',      label:'기타',   full:'기타',       etc:true },
];
const SL_MAIN_METHODS = SL_METHODS.filter(m => !m.etc);
const SL_ETC_METHODS = SL_METHODS.filter(m => m.etc);
const SL_ZERO_PAY = { card:0, cash:0, transfer:0, naver:0, kakao:0, zero:0, etc:0 };

// 정액권 / 티켓 사용 내역 (목업)
const SL_MEMBERSHIP_LOG = [
  { date:'2026.07.22', kind:'use',    desc:'헤어스파 + 뿌리염색',        amount:-52000,  balance:168000 },
  { date:'2026.06.10', kind:'use',    desc:'여자 커트 + 클리닉',         amount:-110000, balance:220000 },
  { date:'2026.04.02', kind:'charge', desc:'30만원 충전 (+10% 적립)',    amount:330000,  balance:330000 },
  { date:'2026.03.02', kind:'use',    desc:'뿌리염색',                   amount:-20000,  balance:0 },
  { date:'2025.11.15', kind:'use',    desc:'디지털펌',                   amount:-80000,  balance:20000 },
  { date:'2025.09.01', kind:'charge', desc:'10만원 충전',                amount:100000,  balance:100000 },
];
const SL_SERVICE_LOG = [
  { date:'2026.08.26', menu:'루트터치업',          designer:'문지윤', amount:70000,  method:'카드' },
  { date:'2026.08.05', menu:'헤어스파',            designer:'박소현', amount:0,      method:'티켓' },
  { date:'2026.07.22', menu:'헤어스파 + 뿌리염색', designer:'문지윤', amount:130000, method:'정액권' },
  { date:'2026.06.18', menu:'여자 커트',           designer:'이상현', amount:20000,  method:'현금' },
  { date:'2026.05.05', menu:'디지털펌',            designer:'문지윤', amount:180000, method:'카드' },
  { date:'2026.03.11', menu:'헤어스파',            designer:'박소현', amount:0,      method:'티켓' },
  { date:'2026.02.14', menu:'뿌리염색',            designer:'문지윤', amount:80000,  method:'카드' },
  { date:'2025.12.18', menu:'여자 커트 + 클리닉',  designer:'이상현', amount:65000,  method:'네이버페이' },
  { date:'2025.11.09', menu:'볼륨매직',            designer:'문지윤', amount:160000, method:'카드' },
];
const SL_BOOKING_LOG = [
  { date:'2026.10.01', time:'10:00', menu:'루트터치업',          designer:'문지윤', channel:'네이버', status:'오늘' },
  { date:'2026.08.26', time:'14:00', menu:'루트터치업',          designer:'문지윤', channel:'네이버', status:'방문' },
  { date:'2026.08.12', time:'11:30', menu:'뿌리염색',            designer:'문지윤', channel:'전화',   status:'고객 취소' },
  { date:'2026.07.22', time:'13:00', menu:'헤어스파 + 뿌리염색', designer:'문지윤', channel:'네이버', status:'방문' },
  { date:'2026.06.18', time:'17:00', menu:'여자 커트',           designer:'이상현', channel:'워크인', status:'방문' },
  { date:'2026.06.02', time:'15:00', menu:'클리닉',              designer:'박소현', channel:'네이버', status:'노쇼' },
  { date:'2026.05.05', time:'11:00', menu:'디지털펌',            designer:'문지윤', channel:'전화',   status:'방문' },
];
const SL_PRODUCT_LOG = [
  { date:'2026.08.26', name:'모이스처 샴푸 500ml',  qty:1, amount:38000,  seller:'문지윤' },
  { date:'2026.07.22', name:'헤어팩 마스크 200ml',  qty:2, amount:110000, seller:'문지윤' },
  { date:'2026.05.05', name:'헤어 에센스 100ml',    qty:1, amount:35000,  seller:'문지윤' },
  { date:'2026.02.14', name:'두피 케어 샴푸 250ml', qty:1, amount:32000,  seller:'박소현' },
];
const SL_MESSAGE_LOG = [
  { id:'m8', date:'2026.10.04 11:00', type:'재방문 안내',   channel:'SMS',    text:'루트터치업 후 4주가 지났어요. 편하실 때 예약 부탁드립니다', status:'예약' },
  { id:'m7', date:'2026.10.02 10:00', type:'시술 후 안내',  channel:'알림톡', text:'시술 후 48시간 동안은 샴푸를 피해주세요', status:'예약' },
  { id:'m6', date:'2026.10.01 09:00', type:'예약 당일 안내', channel:'알림톡', text:'오늘 오전 10:00 예약이 있습니다. 매장 위치 안내', status:'예약' },
  { date:'2026.09.30 18:00', type:'예약 리마인드', channel:'알림톡', text:'내일 오전 10:00 예약이 있습니다', status:'발송' },
  { date:'2026.09.28 12:10', type:'예약 확정',     channel:'알림톡', text:'10월 1일 10:00 예약이 확정되었습니다', status:'발송' },
  { date:'2026.08.27 10:00', type:'시술 후 안내',  channel:'SMS',    text:'48시간 동안은 샴푸를 피해주세요', status:'발송' },
  { date:'2026.08.25 18:00', type:'예약 리마인드', channel:'알림톡', text:'내일 오후 2:00 예약이 있습니다', status:'발송' },
  { date:'2026.08.01 11:00', type:'이벤트 안내',   channel:'LMS',    text:'가을 시즌 프로모션 15% 할인 안내', status:'실패' },
  { date:'2026.07.21 18:00', type:'예약 리마인드', channel:'알림톡', text:'내일 오후 1:00 예약이 있습니다', status:'발송' },
];
// 메시지 상태 저장소 (발송취소 반영) — 화면 간 공유
const SL_msgStore = {
  list: SL_MESSAGE_LOG.map((m, i) => ({ id: m.id || `h${i}`, ...m })),
  subs: new Set(),
  cancel(id) { this.list = this.list.map(m => m.id === id ? { ...m, status:'취소' } : m); this.subs.forEach(f => f()); },
  restore(id) { this.list = this.list.map(m => m.id === id ? { ...m, status:'예약' } : m); this.subs.forEach(f => f()); },
};
function SL_useMessages() {
  const [, force] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => { SL_msgStore.subs.add(force); return () => SL_msgStore.subs.delete(force); }, []);
  return SL_msgStore.list;
}

const SL_POINT_LOG = [
  { date:'2026.08.26', kind:'적립', desc:'루트터치업 결제',  amount:1000,  balance:3200 },
  { date:'2026.07.22', kind:'사용', desc:'결제 시 사용',     amount:-2000, balance:2200 },
  { date:'2026.06.18', kind:'적립', desc:'여자 커트 결제',   amount:1000,  balance:4200 },
  { date:'2026.05.05', kind:'적립', desc:'디지털펌 결제',    amount:2700,  balance:3200 },
  { date:'2026.03.02', kind:'소멸', desc:'유효기간 만료',    amount:-500,  balance:500 },
  { date:'2026.02.14', kind:'적립', desc:'뿌리염색 결제',    amount:1000,  balance:1000 },
];
const SL_DETAIL_CATS = [
  { id:'service',    label:'시술' },
  { id:'booking',    label:'예약' },
  { id:'product',    label:'제품 판매' },
  { id:'message',    label:'메시지' },
  { id:'membership', label:'정액권' },
  { id:'ticket',     label:'티켓권' },
  { id:'point',      label:'포인트' },
];

// 카테고리별 표 정의 → { cols, head, rows:[[{t,a,c,b}]] }
function SL_detailTable(cat) {
  const g = '#059669', red = '#DC2626', purple = '#7C3AED';
  const sign = (v) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${SL_won(Math.abs(v))}`;
  switch (cat) {
    case 'service': return {
      cols:'78px minmax(0,1fr) 56px 76px 62px', head:['날짜','시술','시술자','금액','결제'],
      rows: SL_SERVICE_LOG.map(r => [
        { t:r.date }, { t:r.menu, b:1 }, { t:r.designer },
        { t: r.amount ? SL_won(r.amount) : '-', a:'r', b:1 },
        { t:r.method, a:'r', c: r.method === '티켓' ? SL_TEAL : r.method === '정액권' ? purple : null },
      ]),
    };
    case 'booking': {
      const sc = { '오늘':C_BLUE, '방문':g, '고객 취소':'#94A3B8', '매장 취소':'#94A3B8', '노쇼':red };
      return {
        cols:'78px 40px minmax(0,1fr) 52px 48px 62px', head:['날짜','시간','시술','시술자','경로','상태'],
        rows: SL_BOOKING_LOG.map(r => [
          { t:r.date }, { t:r.time }, { t:r.menu, b:1 }, { t:r.designer }, { t:r.channel, c:C_MUTED },
          { t:r.status, a:'r', c: sc[r.status], b:1 },
        ]),
      };
    }
    case 'product': return {
      cols:'78px minmax(0,1fr) 40px 76px 56px', head:['날짜','제품','수량','금액','판매'],
      rows: SL_PRODUCT_LOG.map(r => [
        { t:r.date }, { t:r.name, b:1 }, { t:`${r.qty}개`, a:'r' },
        { t:SL_won(r.amount), a:'r', b:1 }, { t:r.seller, a:'r' },
      ]),
    };
    case 'message': return {
      cols:'104px 80px minmax(0,1fr) 44px 36px', head:['발송일시','유형','내용','채널','결과'],
      rows: SL_MESSAGE_LOG.map(r => [
        { t:r.date }, { t:r.type, b:1 }, { t:r.text, c:C_MUTED }, { t:r.channel, c:C_MUTED },
        { t:r.status, a:'r', c: r.status === '발송' ? g : red, b:1 },
      ]),
    };
    case 'membership': return {
      cols:'78px 38px minmax(0,1fr) 86px 86px', head:['날짜','구분','내용','금액','잔액'],
      rows: SL_MEMBERSHIP_LOG.map(r => [
        { t:r.date }, { t: r.kind === 'charge' ? '충전' : r.kind === 'refund' ? '환불' : '사용', c: r.kind === 'charge' ? purple : r.kind === 'refund' ? red : C_MUTED, b:1 },
        { t:r.desc, b:1 }, { t:sign(r.amount), a:'r', b:1, c: r.amount > 0 ? purple : null },
        { t:SL_won(r.balance), a:'r', c:C_MUTED },
      ]),
    };
    case 'ticket': return {
      cols:'78px 38px minmax(0,1fr) 70px', head:['날짜','구분','내용','남은 횟수'],
      rows: SL_TICKET_LOG.map(r => [
        { t:r.date }, { t: r.kind === 'buy' ? '구매' : r.kind === 'refund' ? '환불' : '사용', c: r.kind === 'buy' ? SL_TEAL : r.kind === 'refund' ? red : C_MUTED, b:1 },
        { t:`${r.ticket} · ${r.desc}`, b:1 }, { t:r.remain, a:'r', c:SL_TEAL, b:1 },
      ]),
    };
    case 'point': return {
      cols:'78px 38px minmax(0,1fr) 76px 76px', head:['날짜','구분','내용','포인트','잔여'],
      rows: SL_POINT_LOG.map(r => [
        { t:r.date }, { t:r.kind, c: r.kind === '적립' ? g : r.kind === '소멸' ? '#94A3B8' : C_MUTED, b:1 },
        { t:r.desc, b:1 }, { t:sign(r.amount), a:'r', b:1, c: r.amount > 0 ? g : null },
        { t:`${SL_won(r.balance)} P`, a:'r', c:C_MUTED },
      ]),
    };
    default: return { cols:'1fr', head:[], rows:[] };
  }
}

function SL_DetailTable({ cat, limit }) {
  if (cat === 'message') return <SL_MessageTable limit={limit}/>;
  const d = SL_detailTable(cat);
  const rows = limit ? d.rows.slice(0, limit) : d.rows;
  const cell = (c, i) => (
    <span key={i} style={{
      textAlign: c.a === 'r' ? 'right' : 'left', fontWeight: c.b ? 700 : 500,
      color: c.c || (i === 0 ? C_MUTED : C_INK), fontSize: i === 0 ? 11.5 : 12,
      fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', minWidth:0,
    }}>{c.t}</span>
  );
  return (
    <>
      <div style={{display:'grid', gridTemplateColumns:d.cols, gap:8, padding:'6px 14px', background:'#FBFCFE',
        borderBottom:`1px solid ${C_BORDER}`, fontSize:10.5, fontWeight:700, color:C_MUTED}}>
        {d.head.map((h, i) => <span key={i} style={{textAlign: d.rows[0] && d.rows[0][i].a === 'r' ? 'right' : 'left'}}>{h}</span>)}
      </div>
      {rows.length === 0 ? (
        <div style={{padding:'18px', textAlign:'center', fontSize:12, color:C_MUTED}}>내역이 없습니다</div>
      ) : rows.map((r, i) => (
        <div key={i} style={{display:'grid', gridTemplateColumns:d.cols, gap:8, padding:'6px 14px', alignItems:'center',
          borderBottom: i === rows.length - 1 ? 'none' : `1px solid ${C_BORDER}`}}>
          {r.map(cell)}
        </div>
      ))}
    </>
  );
}

// 메시지 표: 예약(발송 대기) 메시지는 상단 고정 + 발송취소
function SL_MessageTable({ limit }) {
  const list = SL_useMessages();
  const [confirmId, setConfirmId] = React.useState(null);
  const pending = list.filter(m => m.status === '예약' || m.status === '취소' && m.id.startsWith('m'))
    .sort((a, b) => a.date.localeCompare(b.date));
  const sent = list.filter(m => !pending.includes(m));
  const rows = limit ? [...pending, ...sent.slice(0, Math.max(2, limit - pending.length))] : [...pending, ...sent];
  const cols = '104px 84px minmax(0,1fr) 44px 70px';
  const chColor = { '알림톡':'#B45309', 'SMS':C_BLUE, 'LMS':'#7C3AED' };
  const stColor = { '발송':'#059669', '실패':'#DC2626', '예약':C_BLUE, '취소':'#94A3B8' };
  const target = list.find(m => m.id === confirmId);

  return (
    <>
      <div style={{display:'grid', gridTemplateColumns:cols, gap:8, padding:'6px 14px', background:'#FBFCFE',
        borderBottom:`1px solid ${C_BORDER}`, fontSize:10.5, fontWeight:700, color:C_MUTED}}>
        <span>발송일시</span><span>유형</span><span>내용</span><span>채널</span><span style={{textAlign:'right'}}>상태</span>
      </div>
      {pending.length > 0 && (
        <div style={{padding:'5px 14px', background:'#EFF3FC', borderBottom:`1px solid ${C_BORDER}`,
          fontSize:10.5, fontWeight:800, color:C_BLUE, display:'flex', alignItems:'center', gap:5}}>
          <IconClock size={11}/> 발송 예정 {pending.filter(m => m.status === '예약').length}건
          <span style={{fontWeight:600, color:C_MUTED}}>· 발송 전까지 취소할 수 있습니다</span>
        </div>
      )}
      {rows.map((m, i) => {
        const isPending = pending.includes(m);
        const cancelled = m.status === '취소';
        const showSep = isPending && rows[i + 1] && !pending.includes(rows[i + 1]);
        return (
          <div key={m.id} title={m.text} style={{
            display:'grid', gridTemplateColumns:cols, gap:8, padding:'6px 14px', alignItems:'center',
            background: isPending && !cancelled ? '#F7F9FE' : 'transparent',
            borderBottom: showSep ? `2px solid ${C_BORDER}` : i === rows.length - 1 ? 'none' : `1px solid ${C_BORDER}`,
            opacity: cancelled ? 0.55 : 1,
          }}>
            <span style={{fontSize:11.5, color: isPending ? C_BLUE : C_MUTED, fontWeight: isPending ? 800 : 500,
              fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap'}}>{m.date}</span>
            <span style={{fontSize:12, fontWeight:700, color:C_INK, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
              textDecoration: cancelled ? 'line-through' : 'none'}}>{m.type}</span>
            <span style={{fontSize:12, color:C_MUTED, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', minWidth:0,
              textDecoration: cancelled ? 'line-through' : 'none'}}>{m.text}</span>
            <span style={{fontSize:11, fontWeight:700, color: chColor[m.channel] || C_MUTED}}>{m.channel}</span>
            <span style={{justifySelf:'end', display:'inline-flex', alignItems:'center', gap:4}}>
              {m.status === '예약' ? (
                <button onClick={() => setConfirmId(m.id)} style={{
                  padding:'3px 8px', borderRadius:6, border:'1px solid #FCA5A5', background:'#FEF2F2',
                  color:'#DC2626', fontSize:10.5, fontWeight:800, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap',
                }}>발송취소</button>
              ) : cancelled ? (
                <button onClick={() => SL_msgStore.restore(m.id)} title="다시 예약" style={{
                  padding:'3px 8px', borderRadius:6, border:`1px solid ${C_BORDER}`, background:C_SURFACE,
                  color:C_MUTED, fontSize:10.5, fontWeight:700, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap',
                }}>취소됨 · 복구</button>
              ) : (
                <span style={{fontSize:12, fontWeight:700, color: stColor[m.status]}}>{m.status}</span>
              )}
            </span>
          </div>
        );
      })}

      {target && ReactDOM.createPortal(
        <div onClick={() => setConfirmId(null)} style={{...sl_overlay, zIndex:230}}>
          <div onClick={e => e.stopPropagation()} style={{...sl_modal, width:360, padding:'22px 22px 18px'}}>
            <div style={{fontSize:16, fontWeight:800, color:C_INK}}>발송을 취소할까요?</div>
            <div style={{marginTop:12, padding:'10px 12px', background:'#FBFCFE', border:`1px solid ${C_BORDER}`, borderRadius:9}}>
              <div style={{display:'flex', alignItems:'center', gap:6, fontSize:11.5}}>
                <span style={{fontWeight:800, color: chColor[target.channel]}}>{target.channel}</span>
                <span style={{fontWeight:800, color:C_INK}}>{target.type}</span>
                <span style={{marginLeft:'auto', color:C_BLUE, fontWeight:700, fontVariantNumeric:'tabular-nums'}}>{target.date} 발송 예정</span>
              </div>
              <div style={{fontSize:12, color:C_MUTED, marginTop:6, lineHeight:1.5}}>{target.text}</div>
            </div>
            <div style={{fontSize:11.5, color:C_MUTED, marginTop:10}}>취소한 메시지는 발송되지 않으며, 필요하면 ‘복구’로 다시 예약할 수 있습니다.</div>
            <div style={{display:'flex', gap:8, justifyContent:'flex-end', marginTop:16}}>
              <button onClick={() => setConfirmId(null)} style={sl_ghostBtn}>닫기</button>
              <button onClick={() => { SL_msgStore.cancel(target.id); setConfirmId(null); }}
                style={{...sl_primaryBtn, background:'#DC2626'}}>발송취소</button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

function SL_DetailChips({ value, onChange, size = 'sm' }) {
  const pendingCnt = SL_useMessages().filter(m => m.status === '예약').length;
  return (
    <div style={{display:'flex', gap:4, flexWrap:'nowrap'}}>
      {SL_DETAIL_CATS.map(c => {
        const on = value === c.id;
        return (
          <button key={c.id} onClick={() => onChange(c.id)} style={{
            padding: size === 'sm' ? '4px 10px' : '6px 13px', borderRadius:14,
            fontSize: size === 'sm' ? 11.5 : 12.5, fontWeight: on ? 800 : 600,
            border:`1px solid ${on ? C_BLUE : C_BORDER}`, background: on ? C_BLUE_SOFT : C_SURFACE,
            color: on ? C_BLUE : C_MUTED, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap',
          }}>
            {c.label}
            {c.id === 'message' && pendingCnt > 0 && (
              <span style={{marginLeft:4, minWidth:15, height:15, padding:'0 4px', borderRadius:8, background:C_BLUE, color:'#fff',
                fontSize:9.5, fontWeight:800, display:'inline-flex', alignItems:'center', justifyContent:'center', verticalAlign:'1px'}}>{pendingCnt}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function SL_DetailModal({ initial, cust, onClose }) {
  const [cat, setCat] = React.useState(initial);
  const msgs = SL_useMessages();
  const total = cat === 'message' ? msgs.length : SL_detailTable(cat).rows.length;
  return (
    <div onClick={onClose} style={sl_overlay}>
      <div onClick={e => e.stopPropagation()} style={{...sl_modal, width:680, overflow:'hidden'}}>
        <div style={sl_modalHead}>
          <div style={{flex:1}}>
            <div style={{fontSize:16, fontWeight:800, color:C_INK}}>{cust.name}님 상세 내역</div>
            <div style={{fontSize:11.5, color:C_MUTED, marginTop:2}}>
              {SL_DETAIL_CATS.find(c => c.id === cat).label} 총 <b style={{color:C_INK}}>{total}건</b>
            </div>
          </div>
          <button onClick={onClose} style={sl_iconBtn}><IconX size={15}/></button>
        </div>
        <div style={{padding:'10px 20px', borderBottom:`1px solid ${C_BORDER}`}}>
          <SL_DetailChips value={cat} onChange={setCat} size="md"/>
        </div>
        <div style={{overflowY:'auto'}}>
          <SL_DetailTable cat={cat}/>
        </div>
      </div>
    </div>
  );
}
const SL_TICKET_LOG = [
  { date:'2026.08.05', ticket:'헤어스파', kind:'use', desc:'1회 사용', remain:'3/5' },
  { date:'2026.03.11', ticket:'헤어스파', kind:'use', desc:'1회 사용', remain:'4/5' },
  { date:'2026.01.20', ticket:'헤어스파', kind:'buy', desc:'5회권 구매 280,000원', remain:'5/5' },
  { date:'2025.12.18', ticket:'클리닉',   kind:'use', desc:'1회 사용', remain:'7/10' },
  { date:'2025.11.02', ticket:'클리닉',   kind:'use', desc:'2회 사용', remain:'8/10' },
  { date:'2025.09.15', ticket:'클리닉',   kind:'buy', desc:'10회권 구매 480,000원', remain:'10/10' },
];
const SL_CLAIM_TYPES = ['시술 불만족', '대기 시간', '직원 응대', '가격 문의', '기타'];

const SL_CHARGE_ITEMS = {
  charge: [
    { id:'c10',  name:'정액권 10만원 충전',  price:100000,  desc:'10만원 적립' },
    { id:'c30',  name:'정액권 30만원 충전',  price:300000,  desc:'33만원 적립 (+10%)' },
    { id:'c50',  name:'정액권 50만원 충전',  price:500000,  desc:'57.5만원 적립 (+15%)' },
    { id:'c100', name:'정액권 100만원 충전', price:1000000, desc:'120만원 적립 (+20%)' },
  ],
};

const SL_HISTORY = [
  { date:'2026.08.26', menu:'루트터치업',            designer:'문지윤', amount:70000,  method:'카드' },
  { date:'2026.07.22', menu:'헤어스파 + 뿌리염색',   designer:'문지윤', amount:130000, method:'정액권' },
  { date:'2026.06.18', menu:'여자 커트',             designer:'이상현', amount:20000,  method:'현금' },
  { date:'2026.05.05', menu:'디지털펌',              designer:'문지윤', amount:180000, method:'카드' },
  { date:'2026.04.02', menu:'정액권 30만원 충전',    designer:'문지윤', amount:300000, method:'카드' },
  { date:'2026.03.11', menu:'헤어스파 (티켓 사용)',  designer:'박소현', amount:0,      method:'티켓' },
  { date:'2026.02.14', menu:'뿌리염색',              designer:'문지윤', amount:80000,  method:'카드' },
  { date:'2026.01.20', menu:'헤어스파 5회권 구매',   designer:'문지윤', amount:280000, method:'카드' },
  { date:'2025.12.18', menu:'여자 커트 + 클리닉',    designer:'이상현', amount:65000,  method:'네이버페이' },
  { date:'2025.11.09', menu:'볼륨매직',              designer:'문지윤', amount:160000, method:'카드' },
  { date:'2025.10.02', menu:'뿌리염색',              designer:'문지윤', amount:80000,  method:'현금' },
  { date:'2025.08.27', menu:'여자 커트',             designer:'이상현', amount:20000,  method:'카드' },
];

function SL_findMenuPrice(name) {
  if (!name) return 50000;
  for (const k of Object.keys(MENU_ITEMS)) {
    const hit = MENU_ITEMS[k].find(it => it.name === name || it.name.startsWith(name));
    if (hit) return hit.price;
  }
  if (/컷|커트/.test(name)) return 20000;
  if (/매직/.test(name)) return 150000;
  if (/펌/.test(name)) return 120000;
  if (/염색|컬러|뿌리/.test(name)) return 90000;
  if (/스파|클리닉/.test(name)) return 60000;
  if (/드라이/.test(name)) return 15000;
  return 50000;
}

// ─────────────────────────────────────────
function C_SalesPage({ target, onClose }) {
  const isGuest = !!target.guest;
  const customer = isGuest ? {
    id:0, name:'', phone:'', tags:[], totalVisits:0, lastVisit:'-', memo:'', mainDesigner:null,
  } : CUSTOMERS.find(c => c.name === target.customer) || {
    id:0, name: target.customer || '비회원', phone:'010-0000-0000', tags:[], totalVisits:1, lastVisit:'-', memo:'',
  };
  const initDesigner = target.designer
    || DESIGNERS.find(d => d.name === target.designerName)?.id
    || customer.mainDesigner || 'moon';

  const [tab, setTab] = React.useState('sales');
  const [stage, setStage] = React.useState(null);
  const [items, setItems] = React.useState(() => target.menu ? [{
    key: 1, type:'service', name: target.menu,
    price: SL_findMenuPrice(target.menu), discount:0, designer: initDesigner, ticketId:null,
  }] : []);
  const [picker, setPicker] = React.useState(null);
  const [historyOpen, setHistoryOpen] = React.useState(false);

  // 고객 정보 (수정 가능)
  const [cust, setCust] = React.useState(() => ({ mbti:'INFP', birth:'2002-01-01', claim:0, ...customer }));
  const [editOpen, setEditOpen] = React.useState(false);
  const [smsOpen, setSmsOpen] = React.useState(false);
  const [payDate, setPayDate] = React.useState('2026-10-01T16:45');
  // 결제수단: 기본은 카드 한 가지로 전액. '나눠서 결제'를 켜면 수단별 금액 입력
  const [method, setMethod] = React.useState('card');
  const [split, setSplit] = React.useState(false);
  const [pay, setPay] = React.useState({ ...SL_ZERO_PAY });
  const [etcOpen, setEtcOpen] = React.useState(false);
  const [discountLine, setDiscountLine] = React.useState(null); // 할인 메뉴를 적용할 판매항목 key
  const [claimOpen, setClaimOpen] = React.useState(false);
  const [refundOpen, setRefundOpen] = React.useState(false);
  const [assetTab, setAssetTab] = React.useState('service'); // SL_DETAIL_CATS id
  const [installment, setInstallment] = React.useState('일시불');
  const [deduct, setDeduct] = React.useState({ membership:0, point:0, extra:0 });
  // 예약금: 예약 등록 시 입력된 금액을 불러와 자동 차감 (네이버 연동 전 수기)
  const savedDeposit = !isGuest && window.BOOKING_DEPOSITS ? window.BOOKING_DEPOSITS[customer.name] : null;
  const [deposit, setDeposit] = React.useState(() => savedDeposit ? { ...savedDeposit, on:true } : { amount:0, channel:'naver', on:false });
  const [depositEdit, setDepositEdit] = React.useState(false);
  const [coupon, setCoupon] = React.useState('none');
  const [memo, setMemo] = React.useState('');
  const [done, setDone] = React.useState(false);
  const [memoOpen, setMemoOpen] = React.useState(false);

  const ASSET = (!isGuest && window.CUSTOMER_ASSETS && window.CUSTOMER_ASSETS[customer.name]) || { membership:0, tickets:[] };
  const MEMBERSHIP_BAL_INIT = ASSET.membership;
  const POINT_BAL = 3200;
  const TICKETS_INIT = ASSET.tickets;
  const [membershipBal, setMembershipBal] = React.useState(MEMBERSHIP_BAL_INIT);
  const MEMBERSHIP_BAL = membershipBal;
  const [ticketBase, setTicketBase] = React.useState(TICKETS_INIT);
  const TICKETS = ticketBase.filter(t => t.remain > 0);

  // 금액 계산
  const subtotal = items.reduce((a, it) => a + it.price, 0);
  const lineAmt = (it) => {
    if (it.ticketId) return 0;
    const fromMenus = (it.discounts || []).reduce((a, d) => a + (d.type === 'percent' ? Math.round(it.price * d.value / 100) : d.value), 0);
    return Math.min(it.price, fromMenus + (it.manual || 0));
  };
  const lineDiscount = items.reduce((a, it) => a + lineAmt(it), 0);
  const discountCount = items.reduce((a, it) => a + (it.ticketId ? 0 : (it.discounts || []).length + (it.manual ? 1 : 0)), 0);
  const ticketAmt = items.filter(it => it.ticketId).reduce((a, it) => a + it.price, 0);
  const ticketCount = items.filter(it => it.ticketId).length;
  const couponBase = Math.max(0, subtotal - lineDiscount - ticketAmt);
  const couponAmt = 0;
  const totalDiscount = lineDiscount + couponAmt + deduct.extra;
  const depositAmt = deposit.on ? Math.min(deposit.amount, Math.max(0, subtotal - ticketAmt - totalDiscount)) : 0;
  const afterDiscount = Math.max(0, subtotal - ticketAmt - totalDiscount - depositAmt);
  const payable = Math.max(0, afterDiscount - deduct.membership - deduct.point);

  const payMap = split ? pay : { ...SL_ZERO_PAY, [method]: payable };
  const paid = Object.values(payMap).reduce((a, v) => a + v, 0);
  const remaining = payable - paid;
  const fillRemain = (key) => {
    const others = Object.entries(pay).filter(([k]) => k !== key).reduce((a, [, v]) => a + v, 0);
    setPay(prev => ({ ...prev, [key]: Math.max(0, payable - others) }));
  };
  const startSplit = () => {
    setPay({ ...SL_ZERO_PAY, [method]: payable });
    setSplit(true);
  };

  const addItems = (type, list) => {
    setItems(prev => [...prev, ...list.map((it, i) => ({
      key: Date.now() + i, type, name: it.name, price: it.price, discount:0,
      designer: initDesigner, ticketId:null,
    }))]);
    setPicker(null);
  };
  const updateItem = (key, patch) => setItems(prev => prev.map(it => it.key === key ? { ...it, ...patch } : it));
  const removeItem = (key) => setItems(prev => prev.filter(it => it.key !== key));

  const ticketRemain = (tid) => {
    const t = TICKETS.find(x => x.id === tid);
    return t.remain - items.filter(it => it.ticketId === tid).length;
  };
  const eligibleLines = items.filter(it => it.type === 'service' && !it.ticketId);
  const applyTicket = (tid, key) => updateItem(key, { ticketId: tid, discount:0, discounts:[], manual:0 });
  const addTicketLine = (tk) => setItems(prev => [...prev, {
    key: Date.now(), type:'service', name: tk.name, price: tk.unit, discount:0,
    designer: initDesigner, ticketId: tk.id,
  }]);

  const mainDesigner = DESIGNERS.find(d => d.id === cust.mainDesigner);
  const displayName = cust.name || '비회원';
  const custOut = { ...cust, name: displayName };
  const ready = items.length > 0 && remaining === 0;

  return (
    <div style={{
      width:948, flexShrink:0, height:'100%', background:C_BG,
      overflow:'auto', fontFamily:'inherit', boxSizing:'border-box',
    }}>
      <div style={{padding:'12px 14px 16px', display:'flex', flexDirection:'column', gap:10}}>
        {/* ── 헤더 ── */}
        <div style={{
          background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:12,
          padding:'10px 14px', display:'flex', alignItems:'center', gap:12,
        }}>
          <button onClick={onClose} style={sl_iconBtn} title="예약 화면으로">
            <IconChevronL size={16}/>
          </button>
          <div style={{
            width:38, height:38, borderRadius:'50%', flexShrink:0,
            background: isGuest ? '#94A3B8' : (mainDesigner?.color || C_BLUE), color:'#fff',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:15, fontWeight:800,
          }}>{isGuest ? <IconUser size={18}/> : displayName.charAt(0)}</div>
          <div style={{minWidth:0}}>
            <div style={{display:'flex', alignItems:'center', gap:6}}>
              <span style={{fontSize:17, fontWeight:800, color:C_INK, letterSpacing:'-0.02em'}}>{displayName}</span>
              {isGuest && cust.name && <SL_Tag t="비회원"/>}
              {deposit.on && deposit.amount > 0 && (
                <span style={{fontSize:10, fontWeight:800, padding:'2px 7px', borderRadius:8, background:'#E8F8EF', color:'#03A94D'}}>
                  예약금 {SL_won(deposit.amount)}
                </span>
              )}
              {cust.tags.slice(0, 2).map(t => <SL_Tag key={t} t={t}/>)}
            </div>
            <div style={{fontSize:11, color:C_MUTED, marginTop:2, fontVariantNumeric:'tabular-nums', display:'flex', alignItems:'center', gap:9, whiteSpace:'nowrap'}}>
              {isGuest ? (
                <span>{cust.phone ? cust.phone : '회원 정보 없이 매출을 입력합니다'}</span>
              ) : (<>
              <button onClick={() => setSmsOpen(true)} title="문자 보내기" style={{
                border:'none', background:'transparent', padding:0, cursor:'pointer', fontFamily:'inherit',
                color:C_BLUE, fontSize:11, fontWeight:700, fontVariantNumeric:'tabular-nums',
                display:'inline-flex', alignItems:'center', gap:4,
              }}>
                <span style={{textDecoration:'underline', textUnderlineOffset:2}}>{cust.phone}</span>
                <span style={{fontSize:9.5, fontWeight:800, padding:'1px 6px', borderRadius:8, background:C_BLUE_SOFT}}>문자</span>
              </button>
              <span>최근 <b style={{color:C_INK, fontWeight:700}}>{cust.lastVisit}</b></span>
              <span>방문 <b style={{color:C_INK, fontWeight:700}}>{cust.totalVisits}회</b></span>
              </>)}
            </div>
          </div>

          <div style={{flex:1}}/>

          <div style={{display:'flex', background:C_BG, borderRadius:20, padding:3, border:`1px solid ${C_BORDER}`, flexShrink:0}}>
            {[
              { id:'sales', label:'매출 입력' },
              { id:'booking', label:'예약 정보' },
            ].filter(t => !isGuest || t.id === 'sales').map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding:'6px 14px', fontSize:12.5, fontWeight:700,
                border:'none', borderRadius:16, cursor:'pointer', fontFamily:'inherit',
                background: tab === t.id ? C_BLUE : 'transparent',
                color: tab === t.id ? '#fff' : C_MUTED, whiteSpace:'nowrap',
              }}>{t.label}</button>
            ))}
          </div>

          <div style={{display:'flex', gap:6, flexShrink:0}}>
            <button onClick={() => window.__openBookingModal && window.__openBookingModal(isGuest ? null : cust)} style={sl_ghostBtn}>
              <IconPlus size={13}/> 예약등록
            </button>
            <button onClick={() => setStage(stage === 'waiting' ? null : 'waiting')} style={{
              ...sl_ghostBtn,
              ...(stage === 'waiting' ? { background:'#FFFBEB', borderColor:'#F59E0B', color:'#B45309' } : {}),
            }}>
              <IconClock size={13}/> {stage === 'waiting' ? '대기중' : '대기 시작'}
            </button>
            <button onClick={() => setStage(stage === 'service' ? null : 'service')} style={{
              ...sl_ghostBtn,
              ...(stage === 'service' ? { background:C_BLUE_SOFT, borderColor:C_BLUE, color:C_BLUE } : {}),
            }}>
              <IconCheck size={13}/> {stage === 'service' ? '시술중' : '시술 시작'}
            </button>
          </div>
        </div>

        {tab === 'sales' && (
          <div style={{display:'grid', gridTemplateColumns:'minmax(0, 1fr) 268px', gap:10, alignItems:'start'}}>
            {/* ── 좌측 ── */}
            <div style={{display:'flex', flexDirection:'column', gap:10, minWidth:0}}>
              {isGuest && (
                <div style={{...sl_card, padding:'10px 14px', display:'flex', alignItems:'center', gap:10}}>
                  <span style={{...sl_title, whiteSpace:'nowrap'}}>비회원 정보</span>
                  <span style={{fontSize:10.5, color:C_MUTED, whiteSpace:'nowrap'}}>선택 입력</span>
                  <input value={cust.name} onChange={e => setCust(c => ({ ...c, name: e.target.value }))}
                    placeholder="이름" style={{...sl_input, width:120, height:32}}/>
                  <input value={cust.phone} inputMode="tel"
                    onChange={e => setCust(c => ({ ...c, phone: e.target.value }))}
                    placeholder="연락처 (영수증·재방문 안내용)" style={{...sl_input, flex:1, height:32, width:'auto', minWidth:0}}/>
                  <button onClick={() => window.__openCustomerRegister && window.__openCustomerRegister()}
                    style={{...sl_ghostBtn, padding:'7px 11px', fontSize:11.5, flexShrink:0}}>
                    <IconPlus size={11}/> 회원으로 등록
                  </button>
                </div>
              )}

              {!isGuest && (<>
              {/* 고객 정보 한 줄 */}
              <div style={{
                ...sl_card, padding:'5px 8px 5px 14px', display:'flex', alignItems:'center', gap:14,
                fontSize:11.5, whiteSpace:'nowrap',
              }}>
                <span><span style={{color:C_MUTED}}>MBTI</span> <b style={{color:C_INK}}>{cust.mbti || '-'}</b></span>
                <span><span style={{color:C_MUTED}}>생일</span> <b style={{color:C_INK, fontVariantNumeric:'tabular-nums'}}>{cust.birth ? cust.birth.slice(5).replace('-', '.') : '-'}</b></span>
                <span style={{display:'inline-flex', alignItems:'center', gap:4}}>
                  <span style={{color:C_MUTED}}>클레임</span>
                  <b style={{color: cust.claim ? '#DC2626' : C_INK}}>{cust.claim}건</b>
                  <button onClick={() => setClaimOpen(true)} title="클레임 등록" style={{
                    height:20, padding:'0 6px', borderRadius:5, border:'1px solid #FCA5A5',
                    background:'#FEF2F2', color:'#DC2626', fontSize:10.5, fontWeight:800,
                    cursor:'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap:2,
                  }}><IconPlus size={9}/>등록</button>
                </span>
                <span style={{display:'inline-flex', alignItems:'center', gap:2}}>
                  <span style={{color:C_MUTED}}>담당자</span>
                  <SL_DesignerPicker compact value={cust.mainDesigner}
                    onChange={(v) => setCust(c => ({ ...c, mainDesigner:v }))}/>
                </span>
                <span style={{
                  flex:1, minWidth:0, overflow:'hidden', textOverflow:'ellipsis',
                  color: cust.memo ? '#92400E' : C_MUTED, display:'flex', alignItems:'center', gap:4,
                }}>
                  <IconNote size={11}/> {cust.memo || '등록된 메모가 없습니다'}
                </span>
                <button onClick={() => setEditOpen(true)} style={{...sl_ghostBtn, padding:'5px 10px', fontSize:11.5, flexShrink:0}}>
                  <IconUser size={11}/> 고객정보 수정
                </button>
              </div>

              {/* 보유 자산 */}
              <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:8}}>
                <SL_AssetCard label="포인트" value={`${SL_won(POINT_BAL)} P`} color="#059669"/>
                <SL_AssetCard label="정액권 잔액" value={MEMBERSHIP_BAL > 0 ? `${SL_won(MEMBERSHIP_BAL)}원` : '없음'} color="#7C3AED"/>
                <SL_AssetCard label="티켓권"
                  value={TICKETS.length ? TICKETS.map(t => `${t.name} ${ticketRemain(t.id)}회`).join(' · ') : '없음'} color={SL_TEAL}/>
              </div>

              {/* 최근 방문 5회 */}
              <div style={sl_card}>
                <div style={{padding:'8px 12px 8px 14px', display:'flex', alignItems:'center', gap:8, borderBottom:`1px solid ${C_BORDER}`}}>
                  <span style={{...sl_title, whiteSpace:'nowrap'}}>상세 내역</span>
                  <SL_DetailChips value={assetTab} onChange={setAssetTab}/>
                  <div style={{flex:1}}/>
                  {(assetTab === 'membership' || assetTab === 'ticket') && (
                    <button onClick={() => setRefundOpen(true)} style={{
                      border:'1px solid #FCA5A5', background:'#FEF2F2', color:'#DC2626', cursor:'pointer',
                      fontSize:11, fontWeight:800, fontFamily:'inherit', borderRadius:6, padding:'4px 9px', whiteSpace:'nowrap',
                    }}>환불</button>
                  )}
                  <button onClick={() => setHistoryOpen(true)} style={{
                    border:'none', background:'transparent', color:C_BLUE, cursor:'pointer',
                    fontSize:12, fontWeight:700, fontFamily:'inherit', whiteSpace:'nowrap',
                    display:'inline-flex', alignItems:'center', gap:2, padding:0,
                  }}>전체보기 <IconChevronR size={11}/></button>
                </div>
                <SL_DetailTable cat={assetTab} limit={5}/>
              </div>
              </>)}

              {/* 판매 항목 */}
              <div style={sl_card}>
                <div style={{padding:'9px 14px', display:'flex', alignItems:'center', gap:6, borderBottom:`1px solid ${C_BORDER}`}}>
                  <span style={sl_title}>판매 항목</span>
                  <span style={{fontSize:11, color:C_MUTED, fontWeight:600}}>{items.length}건</span>
                  <div style={{flex:1}}/>
                  {Object.entries(SL_TYPES).filter(([k]) => !isGuest || k === 'service' || k === 'product').map(([k, t]) => (
                    <button key={k} onClick={() => setPicker(k)} style={{
                      padding:'5px 10px', fontSize:11.5, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                      border:`1px solid ${t.color}44`, background:t.soft, color:t.color, borderRadius:14,
                      display:'inline-flex', alignItems:'center', gap:3, whiteSpace:'nowrap',
                    }}>
                      <IconPlus size={10}/> {t.label}
                    </button>
                  ))}
                </div>

                <div style={{...sl_rowGrid, padding:'7px 14px', background:'#FBFCFE', borderBottom:`1px solid ${C_BORDER}`,
                  fontSize:10.5, fontWeight:700, color:C_MUTED, textAlign:'center'}}>
                  <span>분류</span><span>메뉴</span><span>시술자</span>
                  <span>판매금액</span><span>할인</span><span>결제금액</span><span/>
                </div>

                {items.length === 0 ? (
                  <div style={{padding:'22px 14px', textAlign:'center', color:C_MUTED, fontSize:12.5}}>
                    위의 <b style={{color:C_INK}}>{isGuest ? '+ 시술 / 제품' : '+ 시술 / 제품 / 정액권 / 티켓권'}</b> 으로 판매 항목을 추가하세요
                  </div>
                ) : items.map(it => {
                  const t = SL_TYPES[it.type];
                  const tk = it.ticketId ? TICKETS.find(x => x.id === it.ticketId) : null;
                  return (
                    <div key={it.key} style={{...sl_rowGrid, padding:'7px 14px', borderBottom:`1px solid ${C_BORDER}`, fontSize:12.5,
                      background: tk ? '#F3FBFC' : 'transparent'}}>
                      <span style={{
                        justifySelf:'center', fontSize:10.5, fontWeight:800, padding:'2px 7px', borderRadius:10,
                        background:t.soft, color:t.color,
                      }}>{t.label}</span>
                      <span title={it.name} style={{fontWeight:700, color:C_INK, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', textAlign:'center'}}>{it.name}</span>
                      <SL_DesignerPicker value={it.designer} onChange={(v) => updateItem(it.key, { designer:v })}/>
                      <span style={{textAlign:'center', fontVariantNumeric:'tabular-nums', color:C_INK}}>{SL_won(it.price)}</span>
                      {tk ? (
                        <button onClick={() => updateItem(it.key, { ticketId:null })} title="티켓 사용 취소" style={{
                          justifySelf:'center', display:'inline-flex', alignItems:'center', gap:3,
                          padding:'3px 6px 3px 8px', borderRadius:10, border:`1px solid ${SL_TEAL}55`,
                          background:'#E0F7FA', color:SL_TEAL, fontSize:10.5, fontWeight:800,
                          cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap',
                        }}>
                          {tk.name} 1회 <IconX size={9}/>
                        </button>
                      ) : (
                        <SL_LineDiscountBtn item={it} amount={lineAmt(it)} onClick={() => setDiscountLine(it.key)}/>
                      )}
                      <span style={{textAlign:'center', fontVariantNumeric:'tabular-nums', fontWeight:800,
                        color: tk ? SL_TEAL : C_INK}}>
                        {tk ? '티켓' : SL_won(it.price - lineAmt(it))}
                      </span>
                      <button onClick={() => removeItem(it.key)} style={{
                        width:22, height:22, border:'none', background:'transparent', color:'#94A3B8', justifySelf:'center',
                        cursor:'pointer', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center',
                      }}><IconX size={12}/></button>
                    </div>
                  );
                })}
              </div>

              {/* 결제 수단 + 차감/할인 */}
              <div style={{display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)', gap:10}}>
                <div style={{...sl_card, padding:'11px 13px'}}>
                  <div style={{display:'flex', alignItems:'center', marginBottom:9}}>
                    <span style={sl_title}>결제 수단</span>
                    <div style={{flex:1}}/>
                    <button onClick={() => split ? setSplit(false) : startSplit()} style={{
                      border:'none', background:'transparent', color:C_BLUE, cursor:'pointer',
                      fontSize:11.5, fontWeight:700, fontFamily:'inherit', padding:0,
                    }}>{split ? '한 가지로 결제' : '+ 나눠서 결제'}</button>
                  </div>
                  {!split ? (
                    <>
                      <div style={{display:'grid', gridTemplateColumns:'repeat(5, minmax(0,1fr))', gap:4, position:'relative'}}>
                        {SL_MAIN_METHODS.map(m => {
                          const on = method === m.id;
                          return (
                            <button key={m.id} onClick={() => { setMethod(m.id); setEtcOpen(false); }} style={{
                              padding:'9px 0', fontSize:12, fontWeight: on ? 800 : 600,
                              border:`1.5px solid ${on ? C_BLUE : C_BORDER}`,
                              background: on ? C_BLUE : C_SURFACE, color: on ? '#fff' : C_INK,
                              borderRadius:8, cursor:'pointer', fontFamily:'inherit',
                            }}>{m.label}</button>
                          );
                        })}
                        {(() => {
                          const etcOn = SL_ETC_METHODS.some(m => m.id === method);
                          const cur = SL_ETC_METHODS.find(m => m.id === method);
                          return (
                            <button onClick={() => setEtcOpen(o => !o)} style={{
                              padding:'9px 0', fontSize: etcOn && cur.id !== 'etc' ? 11 : 12, fontWeight: etcOn ? 800 : 600,
                              border:`1.5px solid ${etcOn ? C_BLUE : C_BORDER}`,
                              background: etcOn ? C_BLUE : C_SURFACE, color: etcOn ? '#fff' : C_INK,
                              borderRadius:8, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap',
                              display:'inline-flex', alignItems:'center', justifyContent:'center', gap:2,
                            }}>{etcOn ? cur.label : '기타'} <IconChevronD size={9}/></button>
                          );
                        })()}
                        {etcOpen && (
                          <div style={{
                            position:'absolute', top:'calc(100% + 4px)', right:0, zIndex:30, width:150,
                            background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:9,
                            boxShadow:'0 10px 28px rgba(11,20,37,0.16)', padding:4,
                          }}>
                            {SL_ETC_METHODS.map(m => (
                              <button key={m.id} onClick={() => { setMethod(m.id); setEtcOpen(false); }} style={{
                                ...sl_menuItem, fontWeight: method === m.id ? 800 : 600,
                                background: method === m.id ? C_BLUE_SOFT : 'transparent',
                                color: method === m.id ? C_BLUE : C_INK,
                              }}>
                                <span>{m.full}</span>
                                {method === m.id && <IconCheck size={12}/>}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{
                        marginTop:10, padding:'9px 12px', background:'#FBFCFE',
                        border:`1px solid ${C_BORDER}`, borderRadius:8,
                        display:'flex', alignItems:'center', gap:8,
                      }}>
                        <span style={{fontSize:12, color:C_MUTED, fontWeight:600, whiteSpace:'nowrap'}}>
                          <b style={{color:C_INK}}>{SL_METHODS.find(m => m.id === method).full}</b>로 전액
                        </span>
                        <div style={{flex:1}}/>
                        {method === 'card' && (
                          <select value={installment} onChange={e => setInstallment(e.target.value)} style={{...sl_select, height:28}}>
                            {['일시불','2개월','3개월','6개월','12개월'].map(o => <option key={o}>{o}</option>)}
                          </select>
                        )}
                        <span style={{fontSize:14, fontWeight:800, color:C_INK, fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap'}}>
                          {SL_won(payable)}원
                        </span>
                      </div>
                      <div style={{marginTop:7, fontSize:10.5, color:C_MUTED}}>
                        카드 + 현금처럼 두 가지 이상으로 받을 땐 ‘나눠서 결제’를 누르세요
                      </div>
                    </>
                  ) : (
                    <div style={{display:'flex', flexDirection:'column', gap:6}}>
                      {SL_METHODS.map(m => (
                        <SL_PayRow key={m.id} label={m.label} value={pay[m.id]}
                          onChange={v => setPay(prev => ({ ...prev, [m.id]: v }))}
                          onFill={() => fillRemain(m.id)} fillLabel="남은금액"
                          extra={m.id === 'card' ? (
                            <select value={installment} onChange={e => setInstallment(e.target.value)} style={sl_select}>
                              {['일시불','2개월','3개월','6개월','12개월'].map(o => <option key={o}>{o}</option>)}
                            </select>
                          ) : <span/>}/>
                      ))}
                      <div style={{fontSize:10.5, color:C_MUTED, marginTop:2}}>
                        ‘남은금액’을 누르면 아직 안 받은 금액이 그 칸에 채워집니다
                      </div>
                    </div>
                  )}
                </div>

                <div style={{...sl_card, padding:'11px 13px'}}>
                  <div style={{...sl_title, marginBottom:9}}>차감 · 할인</div>
                  <div style={{display:'flex', flexDirection:'column', gap:6}}>
                    {/* 예약금 */}
                    <SL_DepositRow deposit={deposit} setDeposit={setDeposit} applied={depositAmt}
                      edit={depositEdit} setEdit={setDepositEdit}/>
                    {!isGuest && (<>
                    {/* 티켓 사용 */}
                    <div style={{display:'grid', gridTemplateColumns:'52px 1fr', gap:6, alignItems:'center'}}>
                      <div style={{display:'flex', flexDirection:'column', lineHeight:1.2}}>
                        <span style={sl_label}>티켓</span>
                        <span style={{fontSize:9.5, color:C_MUTED}}>회 차감</span>
                      </div>
                      <div style={{display:'flex', gap:4}}>
                        {TICKETS.length === 0 && (
                          <span style={{fontSize:11.5, color:'#94A3B8', padding:'6px 0'}}>보유한 티켓이 없습니다</span>
                        )}
                        {TICKETS.map(tk => (
                          <SL_TicketChip key={tk.id} ticket={tk} remain={ticketRemain(tk.id)}
                            lines={eligibleLines} onApply={(key) => applyTicket(tk.id, key)}
                            onAddNew={() => addTicketLine(tk)}/>
                        ))}
                      </div>
                    </div>
                    <SL_PayRow label="정액권" hint={`잔액 ${SL_won(MEMBERSHIP_BAL)}`} value={deduct.membership}
                      max={Math.min(MEMBERSHIP_BAL, Math.max(0, afterDiscount - deduct.point))}
                      onChange={v => setDeduct(d => ({...d, membership:v}))}
                      onFill={() => setDeduct(d => ({...d, membership: Math.max(0, Math.min(MEMBERSHIP_BAL, afterDiscount - d.point))}))}
                      fillLabel="전액"/>
                    <SL_PayRow label="포인트" hint={`보유 ${SL_won(POINT_BAL)}`} value={deduct.point}
                      max={Math.min(POINT_BAL, Math.max(0, afterDiscount - deduct.membership))}
                      onChange={v => setDeduct(d => ({...d, point:v}))}
                      onFill={() => setDeduct(d => ({...d, point: Math.max(0, Math.min(POINT_BAL, afterDiscount - d.membership))}))}
                      fillLabel="전액"/>
                    </>)}
                    <SL_PayRow label="전체할인" hint="결제 전체" value={deduct.extra} max={subtotal}
                      onChange={v => setDeduct(d => ({...d, extra:v}))}/>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 우측: 결제 요약 (sticky) ── */}
            <div style={{position:'sticky', top:0}}>
              <div style={{
                background:C_SURFACE, borderRadius:16, overflow:'hidden',
                border:`1.5px solid ${C_BLUE}`, boxShadow:'0 8px 24px rgba(30,64,175,0.14)',
              }}>
                {/* ① 받을 금액 (가장 크게) */}
                <div style={{padding:'10px 18px', display:'flex', alignItems:'center', borderBottom:`1px solid ${C_BORDER}`}}>
                  <span style={{...sl_title, fontSize:14}}>결제 요약</span>
                </div>
                <div style={{background:C_BLUE, color:'#fff', padding:'14px 18px 14px'}}>
                  <div style={{fontSize:12, fontWeight:700, opacity:0.85}}>받을 금액</div>
                  <div style={{fontSize:32, fontWeight:800, letterSpacing:'-0.03em', fontVariantNumeric:'tabular-nums', lineHeight:1.15, marginTop:2}}>
                    {SL_won(payable)}<span style={{fontSize:16, marginLeft:3, fontWeight:700}}>원</span>
                  </div>
                  <div style={{marginTop:10}}>
                    {items.length === 0 ? (
                      <span style={sl_heroPill('rgba(255,255,255,0.18)', '#fff')}>판매 항목을 추가하세요</span>
                    ) : remaining === 0 ? (
                      <span style={sl_heroPill('#fff', '#059669')}>
                        <IconCheck size={12}/>
                        {split ? '결제 금액 일치' : `${SL_METHODS.find(m => m.id === method).full}${method === 'card' && installment !== '일시불' ? ` ${installment}` : ''}`}
                      </span>
                    ) : remaining > 0 ? (
                      <span style={sl_heroPill('#FEF3C7', '#B45309')}>아직 {SL_won(remaining)}원 남음</span>
                    ) : (
                      <span style={sl_heroPill('#FEE2E2', '#DC2626')}>{SL_won(-remaining)}원 더 입력됨</span>
                    )}
                  </div>
                </div>

                {/* ② 계산 내역 (0원 항목은 숨김) */}
                <div style={{padding:'12px 18px 10px'}}>
                  <SL_RcptRow label="판매 금액" value={subtotal} strong/>
                  {(() => {
                    const rows = [
                      { label:`할인${discountCount ? ` ${discountCount}건` : ''}`, v:totalDiscount, c:'#DC2626' },
                      { label:`예약금 (${SL_DEPOSIT_CH[deposit.channel]})`, v:depositAmt, c:'#03A94D' },
                      { label:`티켓 ${ticketCount}회`, v:ticketAmt, c:SL_TEAL },
                      { label:'정액권', v:deduct.membership, c:'#7C3AED' },
                      { label:'포인트', v:deduct.point, c:'#059669' },
                    ].filter(r => r.v > 0);
                    return rows.length === 0 ? (
                      <div style={{fontSize:11.5, color:'#94A3B8', padding:'4px 0'}}>할인 · 차감 없음</div>
                    ) : rows.map(r => <SL_RcptRow key={r.label} label={r.label} value={-r.v} dot={r.c}/>);
                  })()}
                </div>

                {/* ③ 받는 방법 (나눠서 결제일 때만 상세) */}
                {split && paid > 0 && (
                  <div style={{padding:'10px 18px', borderTop:`1px dashed ${C_BORDER}`}}>
                    <div style={{fontSize:11, color:C_MUTED, fontWeight:700, marginBottom:4}}>받는 방법</div>
                    {SL_METHODS.filter(m => payMap[m.id] > 0).map(m => (
                      <SL_RcptRow key={m.id}
                        label={m.id === 'card' && installment !== '일시불' ? `카드 (${installment})` : m.full}
                        value={payMap[m.id]}/>
                    ))}
                  </div>
                )}

                {/* ④ 결제일시 · 메모 */}
                <div style={{padding:'10px 18px', borderTop:`1px solid ${C_BORDER}`, background:'#FBFCFE', display:'flex', flexDirection:'column', gap:7}}>
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:8}}>
                    <span style={{fontSize:11.5, color:C_MUTED, fontWeight:700, whiteSpace:'nowrap'}}>결제일시</span>
                    <input type="datetime-local" value={payDate} onChange={e => setPayDate(e.target.value)} style={{
                      height:26, padding:'0 4px', border:`1px solid ${C_BORDER}`, borderRadius:6,
                      fontSize:11, fontWeight:700, color:C_INK, background:C_SURFACE,
                      fontFamily:'inherit', outline:'none', fontVariantNumeric:'tabular-nums', minWidth:0,
                    }}/>
                  </div>
                  <textarea value={memo} onChange={e => setMemo(e.target.value.slice(0, 300))}
                    placeholder="매출 메모" rows={2}
                    style={{
                      width:'100%', padding:'6px 8px', border:`1px solid ${C_BORDER}`, borderRadius:7,
                      fontSize:11.5, background:C_SURFACE, outline:'none', fontFamily:'inherit',
                      resize:'none', boxSizing:'border-box', lineHeight:1.5,
                    }}/>
                </div>

                {/* ⑤ 버튼 */}
                <div style={{padding:'12px 14px 14px', display:'flex', flexDirection:'column', gap:6}}>
                  <button disabled={!ready} onClick={() => setDone(true)} style={{
                    padding:'14px', borderRadius:12, border:'none', fontFamily:'inherit',
                    fontSize:16, fontWeight:800, letterSpacing:'-0.01em',
                    background: ready ? C_BLUE : '#E5EAF2',
                    color: ready ? '#fff' : '#94A3B8',
                    cursor: ready ? 'pointer' : 'not-allowed',
                    boxShadow: ready ? `0 4px 12px ${C_BLUE}44` : 'none',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                  }}>
                    <IconCheck size={17}/> 거래 완료
                  </button>
                  <button style={{
                    padding:'11px', borderRadius:12, border:'none', fontFamily:'inherit', cursor:'pointer',
                    background:'#DC2626', color:'#fff', fontSize:13.5, fontWeight:800,
                    boxShadow:'0 2px 8px rgba(220,38,38,0.28)',
                  }}>
                    단말기 결제 입력
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'booking' && <SL_BookingInfo target={target} customer={cust}/>}
      </div>

      {done && (
        <SL_PayResult
          customerName={displayName}
          items={items}
          lineAmt={lineAmt}
          payable={payable}
          subtotal={subtotal}
          totalDiscount={totalDiscount}
          discountCount={discountCount}
          depositAmt={depositAmt}
          deposit={deposit}
          ticketAmt={ticketAmt}
          ticketCount={ticketCount}
          deduct={deduct}
          payMap={payMap}
          installment={installment}
          payDate={payDate}
          memo={memo}
          onEdit={() => setDone(false)}
          onClose={() => {
            if (!isGuest && window.BOOKING_DEPOSITS) delete window.BOOKING_DEPOSITS[customer.name];
            onClose();
          }}
        />
      )}
      {picker && <SL_ItemPicker type={picker} onClose={() => setPicker(null)} onAdd={(list) => addItems(picker, list)}/>}
      {historyOpen && <SL_DetailModal initial={assetTab} cust={custOut} onClose={() => setHistoryOpen(false)}/>}
      {editOpen && <SL_CustomerEditModal cust={cust}
        onSave={(v) => { setCust(v); setEditOpen(false); }} onClose={() => setEditOpen(false)}/>}
      {smsOpen && <SL_SmsModal cust={cust} onClose={() => setSmsOpen(false)}/>}
      {discountLine !== null && (() => {
        const line = items.find(x => x.key === discountLine);
        if (!line) return null;
        return <SL_DiscountModal item={line} cust={cust}
          onApply={(discounts, manual) => { updateItem(line.key, { discounts, manual, discount:0 }); setDiscountLine(null); }}
          onClose={() => setDiscountLine(null)}/>;
      })()}
      {claimOpen && <SL_ClaimModal cust={custOut} designerId={initDesigner}
        onSave={() => { setCust(c => ({ ...c, claim: (c.claim || 0) + 1 })); setClaimOpen(false); }}
        onClose={() => setClaimOpen(false)}/>}
      {refundOpen && <SL_RefundModal cust={custOut} initial={assetTab === 'ticket' ? 'ticket' : 'membership'}
        membershipBal={MEMBERSHIP_BAL} tickets={ticketBase}
        onDone={(r) => {
          if (r.type === 'membership') setMembershipBal(b => b - r.deduct);
          else setTicketBase(prev => prev.map(t => t.id === r.ticketId ? { ...t, remain: 0 } : t));
          setRefundOpen(false);
        }}
        onClose={() => setRefundOpen(false)}/>}
    </div>
  );
}

// ─── 작은 컴포넌트들 ───
function SL_Tag({ t }) {
  const map = { VIP:['#FEF3C7','#B45309'], 단골:['#DBEAFE', C_BLUE], 신규:['#D1FAE5','#059669'] };
  const [bg, fg] = map[t] || ['#F1F5F9', C_MUTED];
  return <span style={{fontSize:10, fontWeight:800, padding:'2px 7px', borderRadius:8, background:bg, color:fg}}>{t}</span>;
}

function SL_AssetCard({ label, value, sub, color }) {
  return (
    <div style={{...sl_card, padding:'9px 12px', borderTop:`3px solid ${color}`}}>
      <div style={{fontSize:10.5, color:C_MUTED, fontWeight:700}}>{label}</div>
      <div style={{fontSize:13.5, fontWeight:800, color:C_INK, marginTop:2, fontVariantNumeric:'tabular-nums',
        letterSpacing:'-0.01em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
        {value} {sub && <span style={{fontSize:10.5, color:C_MUTED, fontWeight:600}}>{sub}</span>}
      </div>
    </div>
  );
}

function SL_HistoryRow({ r, last }) {
  return (
    <div style={{
      display:'grid', gridTemplateColumns:'78px minmax(0,1fr) 56px 76px 58px', gap:8,
      padding:'6px 14px', fontSize:12, alignItems:'center',
      borderBottom: last ? 'none' : `1px solid ${C_BORDER}`,
    }}>
      <span style={{color:C_MUTED, fontVariantNumeric:'tabular-nums', fontSize:11.5}}>{r.date}</span>
      <span style={{color:C_INK, fontWeight:700, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{r.menu}</span>
      <span style={{color:C_INK}}>{r.designer}</span>
      <span style={{textAlign:'right', fontWeight:800, color:C_INK, fontVariantNumeric:'tabular-nums'}}>
        {r.amount ? SL_won(r.amount) : '-'}
      </span>
      <span style={{textAlign:'right', color: r.method === '티켓' ? SL_TEAL : C_MUTED, fontSize:11.5, fontWeight: r.method === '티켓' ? 700 : 500}}>{r.method}</span>
    </div>
  );
}

function SL_MoneyInput({ value, onChange, max, small, disabled }) {
  return (
    <div style={{position:'relative', minWidth:0}}>
      <input
        value={value ? SL_won(value) : ''}
        placeholder="0"
        disabled={disabled}
        onChange={e => {
          let v = parseInt(e.target.value.replace(/\D/g, '') || '0', 10);
          if (max !== undefined) v = Math.min(v, Math.max(0, max));
          onChange(v);
        }}
        style={{
          width:'100%', height: small ? 28 : 33, padding: small ? '0 8px 0 6px' : '0 22px 0 8px',
          border:`1px solid ${C_BORDER}`, borderRadius:7, textAlign:'right',
          fontSize: small ? 12 : 13, fontWeight:700, color:C_INK, background: disabled ? '#F5F7FB' : C_SURFACE,
          outline:'none', fontFamily:'inherit', boxSizing:'border-box', fontVariantNumeric:'tabular-nums',
        }}
        onFocus={e => e.target.style.borderColor = C_BLUE}
        onBlur={e => e.target.style.borderColor = C_BORDER}
      />
      {!small && <span style={{position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', fontSize:11, color:C_MUTED}}>원</span>}
    </div>
  );
}

function SL_PayRow({ label, hint, value, onChange, onFill, fillLabel = '잔액', fillActive, max, extra }) {
  const cols = ['52px'];
  if (extra) cols.push('66px');
  cols.push('minmax(0,1fr)');
  if (onFill) cols.push(fillLabel.length > 2 ? '58px' : '40px');
  return (
    <div style={{display:'grid', gridTemplateColumns: cols.join(' '), gap:6, alignItems:'center'}}>
      <div style={{display:'flex', flexDirection:'column', lineHeight:1.2, minWidth:0}}>
        <span style={sl_label}>{label}</span>
        {hint && <span style={{fontSize:9.5, color:C_MUTED, fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap'}}>{hint}</span>}
      </div>
      {extra}
      <SL_MoneyInput value={value} onChange={onChange} max={max}/>
      {onFill && (
        <button onClick={onFill} style={{
          height:33, border:`1px solid ${fillActive ? C_BLUE : C_BLUE + '55'}`,
          background: fillActive ? C_BLUE : C_BLUE_SOFT, color: fillActive ? '#fff' : C_BLUE,
          borderRadius:7, fontSize:10.5, fontWeight:800, cursor:'pointer', fontFamily:'inherit', padding:0,
        }}>{fillLabel}</button>
      )}
    </div>
  );
}

function SL_SumRow({ label, value, muted }) {
  return (
    <div style={{display:'flex', justifyContent:'space-between', padding:'3px 0', fontSize:12.5}}>
      <span style={{color:C_MUTED, fontWeight:600}}>{label}</span>
      <span style={{fontWeight:700, fontVariantNumeric:'tabular-nums', color: muted ? '#CBD5E1' : value < 0 ? '#DC2626' : C_INK}}>
        {value < 0 ? '−' : ''}{SL_won(Math.abs(value))}
      </span>
    </div>
  );
}

// 티켓 칩: 클릭 → 시술 항목에 1회 적용 (시술이 없으면 해당 시술을 티켓으로 바로 추가)
function SL_TicketChip({ ticket, remain, lines, onApply, onAddNew }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  const disabled = remain <= 0;
  const click = () => {
    if (disabled) return;
    if (lines.length === 0) onAddNew();
    else setOpen(o => !o);
  };
  return (
    <div ref={ref} style={{position:'relative', flex:1, minWidth:0}}>
      <button onClick={click} disabled={disabled}
        title={disabled ? '남은 횟수가 없습니다' : `${ticket.name} 1회 사용`}
        style={{
          width:'100%', padding:'5px 6px', borderRadius:7, fontFamily:'inherit',
          border:`1px solid ${disabled ? C_BORDER : SL_TEAL + '66'}`,
          background: disabled ? '#F5F7FB' : '#E0F7FA',
          color: disabled ? '#94A3B8' : SL_TEAL, cursor: disabled ? 'not-allowed' : 'pointer',
          display:'flex', flexDirection:'column', alignItems:'center', lineHeight:1.25,
        }}>
        <span style={{fontSize:11.5, fontWeight:800, whiteSpace:'nowrap'}}>{ticket.name} 1회 사용</span>
        <span style={{fontSize:10, fontWeight:600, fontVariantNumeric:'tabular-nums'}}>{remain}/{ticket.total}회 남음</span>
      </button>
      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 4px)', left:0, zIndex:30, width:220,
          background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:9,
          boxShadow:'0 10px 28px rgba(11,20,37,0.16)', padding:6,
        }}>
          <div style={{fontSize:10.5, color:C_MUTED, fontWeight:700, padding:'3px 6px 6px'}}>어느 시술에 사용할까요?</div>
          {lines.map(l => (
            <button key={l.key} onClick={() => { onApply(l.key); setOpen(false); }} style={sl_menuItem}
              onMouseEnter={e => e.currentTarget.style.background = '#E0F7FA'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{fontWeight:700, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{l.name}</span>
              <span style={{color:C_MUTED, fontVariantNumeric:'tabular-nums', flexShrink:0}}>{SL_won(l.price)}</span>
            </button>
          ))}
          <div style={{height:1, background:C_BORDER, margin:'4px 2px'}}/>
          <button onClick={() => { onAddNew(); setOpen(false); }} style={{...sl_menuItem, color:SL_TEAL}}
            onMouseEnter={e => e.currentTarget.style.background = '#E0F7FA'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <span style={{fontWeight:800}}>+ {ticket.name} 항목 새로 추가</span>
          </button>
        </div>
      )}
    </div>
  );
}

function SL_DesignerPicker({ value, onChange, compact }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  const d = DESIGNERS.find(x => x.id === value);
  const list = DESIGNERS.filter(x => x.id !== 'unassigned').slice(0, 10);
  return (
    <div ref={ref} style={{position:'relative', minWidth:0}}>
      <button onClick={() => setOpen(o => !o)} style={compact ? {
        height:24, padding:'0 6px', border:`1px solid ${open ? C_BLUE : C_BORDER}`,
        borderRadius:6, background: open ? C_BLUE_SOFT : C_SURFACE, cursor:'pointer', fontFamily:'inherit',
        display:'inline-flex', alignItems:'center', gap:4, fontSize:11.5, fontWeight:700, color:C_INK,
      } : {
        width:'100%', height:28, padding:'0 7px', border:`1px solid ${open ? C_BLUE : C_BORDER}`,
        borderRadius:7, background:C_SURFACE, cursor:'pointer', fontFamily:'inherit',
        display:'flex', alignItems:'center', gap:4, fontSize:12, fontWeight:700, color:C_INK,
      }}>
        <span style={{width:6, height:6, borderRadius:'50%', background:d?.color || '#CBD5E1', flexShrink:0}}/>
        <span style={{flex:1, textAlign: compact ? 'left' : 'center', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{d?.name || '미지정'}</span>
        <IconChevronD size={10} style={{color:C_MUTED}}/>
      </button>
      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 4px)', left:0, zIndex:20, width:180,
          background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:9,
          boxShadow:'0 10px 28px rgba(11,20,37,0.16)', padding:6,
          display:'grid', gridTemplateColumns:'1fr 1fr', gap:3,
        }}>
          {list.map(x => (
            <button key={x.id} onClick={() => { onChange(x.id); setOpen(false); }} style={{
              padding:'6px 8px', border:'none', borderRadius:6, cursor:'pointer', fontFamily:'inherit',
              background: x.id === value ? `${x.color}18` : 'transparent',
              fontSize:12, fontWeight: x.id === value ? 800 : 600, color:C_INK,
              display:'flex', alignItems:'center', gap:5, textAlign:'left',
            }}>
              <span style={{width:6, height:6, borderRadius:'50%', background:x.color}}/>
              {x.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 항목 추가 팝업 ───
function SL_ItemPicker({ type, onClose, onAdd }) {
  const t = SL_TYPES[type];
  const source = type === 'service' ? { cats: MENU_CATEGORIES, items: MENU_ITEMS }
    : type === 'product' ? { cats: PRODUCT_CATEGORIES, items: PRODUCT_ITEMS }
    : type === 'ticket' ? { cats: PACKAGE_CATEGORIES, items: PACKAGE_ITEMS }
    : { cats: [{ id:'charge', name:'정액권 충전', color:'#7C3AED' }], items: SL_CHARGE_ITEMS };
  const [cat, setCat] = React.useState(source.cats[0].id);
  const [sel, setSel] = React.useState([]);
  const list = source.items[cat] || [];
  const toggle = (it) => setSel(prev => prev.some(s => s.id === it.id) ? prev.filter(s => s.id !== it.id) : [...prev, it]);
  const total = sel.reduce((a, s) => a + s.price, 0);

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(11,20,37,0.5)', zIndex:210,
      display:'flex', alignItems:'center', justifyContent:'center', padding:16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width:640, maxWidth:'96vw', background:C_SURFACE, borderRadius:14,
        boxShadow:'0 24px 64px rgba(11,20,37,0.28)', display:'flex', flexDirection:'column', overflow:'hidden',
      }}>
        <div style={{padding:'14px 18px', borderBottom:`1px solid ${C_BORDER}`, display:'flex', alignItems:'center', gap:8}}>
          <span style={{fontSize:11, fontWeight:800, padding:'3px 9px', borderRadius:10, background:t.soft, color:t.color}}>{t.label}</span>
          <span style={{fontSize:16, fontWeight:800, color:C_INK, letterSpacing:'-0.01em'}}>{t.label} 추가</span>
          <div style={{flex:1}}/>
          <button onClick={onClose} style={sl_iconBtn}><IconX size={15}/></button>
        </div>

        {source.cats.length > 1 && (
          <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', borderBottom:`2px solid ${C_BORDER}`, padding:'0 18px'}}>
            {source.cats.map(c => {
              const on = cat === c.id;
              const n = sel.filter(s => (source.items[c.id] || []).some(i => i.id === s.id)).length;
              return (
                <button key={c.id} onClick={() => setCat(c.id)} style={{
                  padding:'10px 6px', border:'none', background:'transparent', cursor:'pointer', fontFamily:'inherit',
                  borderBottom:`2px solid ${on ? c.color : 'transparent'}`, marginBottom:-2,
                  fontSize:12, fontWeight: on ? 800 : 600, color: on ? c.color : C_MUTED, whiteSpace:'nowrap',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:4,
                }}>
                  {c.name}
                  {n > 0 && <span style={{minWidth:16, height:16, borderRadius:8, background:c.color, color:'#fff', fontSize:9.5, fontWeight:800, display:'inline-flex', alignItems:'center', justifyContent:'center'}}>{n}</span>}
                </button>
              );
            })}
          </div>
        )}

        <div style={{padding:'14px 18px', display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:6, minHeight:180, alignContent:'start'}}>
          {list.map(it => {
            const on = sel.some(s => s.id === it.id);
            return (
              <button key={it.id} onClick={() => toggle(it)} style={{
                padding:'10px 12px', textAlign:'left', position:'relative',
                border:`1.5px solid ${on ? t.color : C_BORDER}`, background: on ? t.soft : C_SURFACE,
                borderRadius:9, cursor:'pointer', fontFamily:'inherit',
                display:'flex', flexDirection:'column', gap:3, minWidth:0,
              }}>
                {on && <span style={{position:'absolute', top:6, right:6, width:16, height:16, borderRadius:'50%', background:t.color, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center'}}><IconCheck size={10}/></span>}
                <span style={{fontSize:12, fontWeight:700, color:C_INK, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', paddingRight: on ? 16 : 0}}>{it.name}</span>
                <span style={{fontSize:11.5, fontWeight:800, color: on ? t.color : C_MUTED, fontVariantNumeric:'tabular-nums'}}>{SL_won(it.price)}원</span>
                {(it.desc || it.sessions) && <span style={{fontSize:10, color:C_MUTED}}>{it.desc || `${it.sessions}회 · ${it.validDays}일`}</span>}
              </button>
            );
          })}
        </div>

        <div style={{padding:'12px 18px', borderTop:`1px solid ${C_BORDER}`, background:'#FBFCFE', display:'flex', alignItems:'center', gap:10}}>
          <span style={{fontSize:12, color:C_MUTED, fontWeight:600}}>
            {sel.length > 0 ? <>선택 <b style={{color:C_INK}}>{sel.length}개</b> · <b style={{color:t.color, fontVariantNumeric:'tabular-nums'}}>{SL_won(total)}원</b></> : '항목을 선택하세요 (여러 개 가능)'}
          </span>
          <div style={{flex:1}}/>
          <button onClick={onClose} style={sl_ghostBtn}>취소</button>
          <button disabled={!sel.length} onClick={() => onAdd(sel)} style={{
            padding:'9px 20px', border:'none', borderRadius:8, fontFamily:'inherit',
            fontSize:13, fontWeight:800, cursor: sel.length ? 'pointer' : 'not-allowed',
            background: sel.length ? C_BLUE : '#E5EAF2', color: sel.length ? '#fff' : '#94A3B8',
          }}>추가</button>
        </div>
      </div>
    </div>
  );
}

// ─── 탭: 예약 정보 ───
function SL_BookingInfo({ target, customer }) {
  const d = DESIGNERS.find(x => x.id === target.designer) || DESIGNERS.find(x => x.name === target.designerName);
  const rows = [
    ['예약 일시', `2026.10.01 (목) ${target.start || target.time || '-'}`],
    ['시술자', d?.name || '미지정'],
    ['시술', target.menu || '-'],
    ['예약 방법', '네이버'],
    ['예약 메모', target.memo || '없음'],
    ['고객 메모', customer.memo || '없음'],
  ];
  return (
    <div style={{...sl_card, padding:'18px 22px', maxWidth:640}}>
      <div style={{...sl_title, marginBottom:12}}>예약 정보</div>
      {rows.map(([k, v]) => (
        <div key={k} style={{display:'grid', gridTemplateColumns:'100px 1fr', padding:'9px 0', borderBottom:`1px solid ${C_BORDER}`, fontSize:13}}>
          <span style={{color:C_MUTED, fontWeight:600}}>{k}</span>
          <span style={{color:C_INK, fontWeight:700}}>{v}</span>
        </div>
      ))}
    </div>
  );
}

// ─── 전체 방문 내역 팝업 ───
function SL_HistoryModal({ customer, onClose }) {
  const total = SL_HISTORY.reduce((a, r) => a + r.amount, 0);
  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(11,20,37,0.5)', zIndex:210,
      display:'flex', alignItems:'center', justifyContent:'center', padding:16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width:600, maxWidth:'96vw', maxHeight:'84vh', background:C_SURFACE, borderRadius:14,
        boxShadow:'0 24px 64px rgba(11,20,37,0.28)', display:'flex', flexDirection:'column', overflow:'hidden',
      }}>
        <div style={{padding:'14px 18px', borderBottom:`1px solid ${C_BORDER}`, display:'flex', alignItems:'center', gap:8}}>
          <div style={{flex:1}}>
            <div style={{fontSize:16, fontWeight:800, color:C_INK, letterSpacing:'-0.01em'}}>{customer.name}님 방문 · 결제 내역</div>
            <div style={{fontSize:11.5, color:C_MUTED, marginTop:2, fontVariantNumeric:'tabular-nums'}}>
              총 <b style={{color:C_INK}}>{SL_HISTORY.length}건</b> · 누적 <b style={{color:C_BLUE}}>{SL_won(total)}원</b>
            </div>
          </div>
          <button onClick={onClose} style={sl_iconBtn}><IconX size={15}/></button>
        </div>
        <div style={{
          display:'grid', gridTemplateColumns:'78px minmax(0,1fr) 56px 76px 58px', gap:8,
          padding:'7px 14px', background:'#FBFCFE', fontSize:10.5, fontWeight:700, color:C_MUTED,
          borderBottom:`1px solid ${C_BORDER}`,
        }}>
          <span>날짜</span><span>내역</span><span>시술자</span><span style={{textAlign:'right'}}>금액</span><span style={{textAlign:'right'}}>결제</span>
        </div>
        <div style={{overflowY:'auto'}}>
          {SL_HISTORY.map((r, i) => <SL_HistoryRow key={i} r={r} last={i === SL_HISTORY.length - 1}/>)}
        </div>
      </div>
    </div>
  );
}

function SL_fmtWhen(v) {
  if (!v) return '';
  const [d, t] = String(v).split('T');
  if (!t) return d;
  const [hh, mm] = t.split(':');
  const h = Number(hh);
  const ap = h < 12 ? '오전' : '오후';
  const h12 = h % 12 || 12;
  return `${d.replace(/-/g, '.')} ${ap} ${String(h12).padStart(2, '0')}:${mm || '00'}`;
}

// ─── 결제 내용 팝업 ───
function SL_PayResult({
  customerName, items, lineAmt, payable, totalDiscount,
  depositAmt, deposit, ticketAmt, ticketCount, deduct, payMap, installment,
  payDate, memo, onEdit, onClose,
}) {
  const names = Object.fromEntries(SL_METHODS.map(m => [m.id, m.full]));
  const used = Object.entries(payMap).filter(([, v]) => v > 0);
  const discounts = [];
  items.forEach(it => {
    const off = lineAmt(it);
    if (off > 0) discounts.push({ name: it.name, amount: off });
  });
  const cuts = [
    depositAmt > 0 ? { label:`예약금 (${SL_DEPOSIT_CH[deposit.channel] || '예약금'})`, v:depositAmt, c:'#03A94D' } : null,
    ticketCount > 0 ? { label:`티켓 ${ticketCount}회`, v:ticketAmt, c:SL_TEAL } : null,
    deduct.membership > 0 ? { label:'정액권', v:deduct.membership, c:'#7C3AED' } : null,
    deduct.point > 0 ? { label:'포인트', v:deduct.point, c:'#059669' } : null,
  ].filter(Boolean);
  const sec = { fontSize:11, fontWeight:800, color:C_MUTED, letterSpacing:'-0.01em', margin:'12px 0 6px' };
  return (
    <div style={{position:'fixed', inset:0, background:'rgba(11,20,37,0.5)', zIndex:220, display:'flex', alignItems:'center', justifyContent:'center', padding:20}}>
      <div style={{
        width:440, maxWidth:'94vw', maxHeight:'86vh', background:C_SURFACE, borderRadius:16,
        boxShadow:'0 24px 64px rgba(11,20,37,0.28)', display:'flex', flexDirection:'column', overflow:'hidden',
      }}>
        <div style={{padding:'16px 18px 12px', display:'flex', alignItems:'center', gap:10, borderBottom:`1px solid ${C_BORDER}`}}>
          <div style={{width:32, height:32, borderRadius:'50%', background:'#D1FAE5', color:'#059669', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
            <IconCheck size={16}/>
          </div>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:15, fontWeight:800, color:C_INK, letterSpacing:'-0.02em'}}>결제 완료</div>
            <div style={{fontSize:12, color:C_MUTED, marginTop:1}}>{customerName}님</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:18, fontWeight:800, color:C_BLUE, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em'}}>{SL_won(payable)}원</div>
          </div>
        </div>

        <div style={{padding:'4px 18px 14px', overflow:'auto'}}>
          <div style={sec}>일시</div>
          <div style={{fontSize:13.5, fontWeight:800, color:C_INK}}>{SL_fmtWhen(payDate)}</div>

          <div style={sec}>시술 메뉴</div>
          {items.length === 0 ? (
            <div style={{fontSize:12.5, color:C_MUTED}}>없음</div>
          ) : items.map(it => {
            const designer = (typeof DESIGNERS !== 'undefined' ? DESIGNERS : []).find(d => d.id === it.designer);
            const off = lineAmt(it);
            return (
              <div key={it.key} style={{display:'flex', alignItems:'center', gap:8, padding:'6px 0', borderBottom:`1px solid ${C_BORDER}`}}>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:13, fontWeight:800, color:C_INK, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{it.name}</div>
                  <div style={{fontSize:11, color:C_MUTED, marginTop:1}}>{designer ? designer.name : '담당 미지정'}</div>
                </div>
                <span style={{fontSize:13, fontWeight:800, color: it.ticketId ? SL_TEAL : C_INK, fontVariantNumeric:'tabular-nums', flexShrink:0}}>
                  {it.ticketId ? '티켓' : `${SL_won(Math.max(0, it.price - off))}원`}
                </span>
              </div>
            );
          })}

          <div style={sec}>할인</div>
          {discounts.length === 0 ? (
            <div style={{fontSize:12.5, color:C_MUTED}}>없음</div>
          ) : discounts.map((d, i) => (
            <div key={i} style={{display:'flex', justifyContent:'space-between', gap:8, padding:'3px 0', fontSize:13}}>
              <span style={{color:C_INK, fontWeight:700, minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{d.name}</span>
              <span style={{color:'#DC2626', fontWeight:800, fontVariantNumeric:'tabular-nums', flexShrink:0}}>−{SL_won(d.amount)}원</span>
            </div>
          ))}
          {totalDiscount > 0 && discounts.length > 1 && (
            <div style={{display:'flex', justifyContent:'space-between', padding:'4px 0 0', fontSize:12, color:C_MUTED}}>
              <span>할인 합계</span><span style={{fontWeight:800, color:'#DC2626'}}>−{SL_won(totalDiscount)}원</span>
            </div>
          )}

          <div style={sec}>차감</div>
          {cuts.length === 0 ? (
            <div style={{fontSize:12.5, color:C_MUTED}}>없음</div>
          ) : cuts.map(r => (
            <div key={r.label} style={{display:'flex', justifyContent:'space-between', gap:8, padding:'3px 0', fontSize:13}}>
              <span style={{color:C_INK, fontWeight:700}}>{r.label}</span>
              <span style={{color:r.c, fontWeight:800, fontVariantNumeric:'tabular-nums'}}>−{SL_won(r.v)}원</span>
            </div>
          ))}

          <div style={sec}>결제수단</div>
          {used.length === 0 ? (
            <div style={{fontSize:12.5, color:C_MUTED}}>없음</div>
          ) : used.map(([k, v]) => (
            <div key={k} style={{display:'flex', justifyContent:'space-between', gap:8, padding:'3px 0', fontSize:13}}>
              <span style={{color:C_INK, fontWeight:700}}>{k === 'card' && installment && installment !== '일시불' ? `카드 (${installment})` : (names[k] || k)}</span>
              <span style={{fontWeight:800, fontVariantNumeric:'tabular-nums', color:C_INK}}>{SL_won(v)}원</span>
            </div>
          ))}

          {memo ? (
            <>
              <div style={sec}>메모</div>
              <div style={{fontSize:12.5, color:C_INK, lineHeight:1.5}}>{memo}</div>
            </>
          ) : null}
        </div>

        <div style={{padding:'12px 18px', borderTop:`1px solid ${C_BORDER}`, display:'flex', justifyContent:'flex-end', gap:8, background:'#FBFCFE'}}>
          <button onClick={onEdit} style={{...sl_ghostBtn, height:38, padding:'0 14px', fontSize:13}}>매출 수정</button>
          <button onClick={onClose} style={{
            height:38, padding:'0 18px', border:'none', borderRadius:8, background:C_BLUE, color:'#fff',
            fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'inherit',
          }}>확인</button>
        </div>
      </div>
    </div>
  );
}

// ─── 결제 요약 영수증 행 ───
function SL_RcptRow({ label, value, dot, strong }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:6, padding:'4px 0'}}>
      {dot && <span style={{width:6, height:6, borderRadius:'50%', background:dot, flexShrink:0}}/>}
      <span style={{fontSize:12.5, color: strong ? C_INK : C_MUTED, fontWeight: strong ? 800 : 600, flex:1, minWidth:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{label}</span>
      <span style={{fontSize: strong ? 14 : 13, fontWeight:800, fontVariantNumeric:'tabular-nums', color: value < 0 ? (dot || '#DC2626') : C_INK}}>
        {value < 0 ? '−' : ''}{SL_won(Math.abs(value))}
      </span>
    </div>
  );
}
const sl_heroPill = (bg, fg) => ({
  display:'inline-flex', alignItems:'center', gap:4, padding:'5px 10px', borderRadius:14,
  background:bg, color:fg, fontSize:12, fontWeight:800, whiteSpace:'nowrap', maxWidth:'100%',
});

// ─── 판매항목 할인 버튼 ───
function SL_LineDiscountBtn({ item, amount, onClick }) {
  const list = item.discounts || [];
  const has = amount > 0;
  const label = list.length === 1 && !item.manual ? list[0].name
    : list.length > 0 ? `할인 ${list.length + (item.manual ? 1 : 0)}건`
    : item.manual ? '직접 할인' : '';
  return (
    <button onClick={onClick} title={has ? [...list.map(d => d.name), item.manual ? `직접 ${SL_won(item.manual)}원` : null].filter(Boolean).join(', ') : '할인 메뉴 선택'}
      style={{
        width:'100%', height:28, padding:'0 7px', borderRadius:7, fontFamily:'inherit', cursor:'pointer',
        border: has ? `1px solid ${C_BLUE}55` : `1px dashed ${C_BORDER}`,
        background: has ? C_BLUE_SOFT : C_SURFACE,
        display:'flex', alignItems:'center', justifyContent: has ? 'space-between' : 'center', gap:4, minWidth:0,
      }}>
      {has ? (
        <>
          <span style={{fontSize:10, fontWeight:700, color:C_BLUE, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', minWidth:0}}>{label}</span>
          <span style={{fontSize:11.5, fontWeight:800, color:'#DC2626', fontVariantNumeric:'tabular-nums', flexShrink:0}}>−{SL_won(amount)}</span>
        </>
      ) : (
        <span style={{fontSize:11, fontWeight:700, color:C_MUTED, display:'inline-flex', alignItems:'center', gap:3}}>
          <IconTag size={10}/> 할인
        </span>
      )}
    </button>
  );
}

// ─── 예약금 행 ───
const SL_DEPOSIT_CH = { naver:'네이버', transfer:'계좌이체', etc:'기타' };
function SL_DepositRow({ deposit, setDeposit, applied, edit, setEdit }) {
  const G = '#03A94D';
  if (!deposit.on && !edit) {
    return (
      <div style={{display:'grid', gridTemplateColumns:'52px 1fr', gap:6, alignItems:'center'}}>
        <span style={sl_label}>예약금</span>
        <button onClick={() => setEdit(true)} style={{
          justifySelf:'start', padding:'5px 10px', borderRadius:12, border:`1px dashed ${G}88`,
          background:C_SURFACE, color:G, fontSize:11, fontWeight:800, cursor:'pointer', fontFamily:'inherit',
          display:'inline-flex', alignItems:'center', gap:3,
        }}><IconPlus size={10}/> 예약금 입력</button>
      </div>
    );
  }
  if (edit) {
    return (
      <div style={{padding:'8px 9px', borderRadius:9, background:'#F3FBF6', border:`1px solid ${G}55`, display:'flex', flexDirection:'column', gap:6}}>
        <div style={{display:'flex', alignItems:'center', gap:4}}>
          <span style={{...sl_label, marginRight:4}}>예약금</span>
          {Object.entries(SL_DEPOSIT_CH).map(([id, l]) => (
            <button key={id} onClick={() => setDeposit(d => ({ ...d, channel:id }))} style={{
              padding:'4px 9px', borderRadius:10, fontSize:11, fontWeight: deposit.channel === id ? 800 : 600,
              border:`1px solid ${deposit.channel === id ? G : C_BORDER}`,
              background: deposit.channel === id ? G : C_SURFACE, color: deposit.channel === id ? '#fff' : C_MUTED,
              cursor:'pointer', fontFamily:'inherit',
            }}>{l}</button>
          ))}
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 44px 44px', gap:4}}>
          <SL_MoneyInput value={deposit.amount} onChange={v => setDeposit(d => ({ ...d, amount:v }))}/>
          <button onClick={() => { setDeposit(d => ({ ...d, on: d.amount > 0 })); setEdit(false); }} style={{
            height:33, border:'none', borderRadius:7, background:G, color:'#fff', fontSize:11, fontWeight:800,
            cursor:'pointer', fontFamily:'inherit',
          }}>적용</button>
          <button onClick={() => setEdit(false)} style={{
            height:33, border:`1px solid ${C_BORDER}`, borderRadius:7, background:C_SURFACE, color:C_MUTED,
            fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
          }}>취소</button>
        </div>
      </div>
    );
  }
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:8, padding:'7px 9px', borderRadius:9,
      background:'#F3FBF6', border:`1px solid ${G}55`,
    }}>
      <span style={{
        fontSize:10, fontWeight:900, color:'#fff', background:G, borderRadius:5,
        width:18, height:18, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
      }}>{deposit.channel === 'naver' ? 'N' : '₩'}</span>
      <div style={{flex:1, minWidth:0, lineHeight:1.25}}>
        <div style={{fontSize:12, fontWeight:800, color:C_INK}}>
          {SL_DEPOSIT_CH[deposit.channel]} 예약금 <span style={{color:G, fontVariantNumeric:'tabular-nums'}}>{SL_won(deposit.amount)}원</span>
        </div>
        <div style={{fontSize:10, color:C_MUTED}}>
          {deposit.paidAt ? `${deposit.paidAt} 예약 시 받음 · ` : ''}결제금액에서 자동 차감
          {applied < deposit.amount ? ` (${SL_won(applied)}원만 적용)` : ''}
        </div>
      </div>
      <button onClick={() => setEdit(true)} style={{
        border:'none', background:'transparent', color:C_BLUE, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit', padding:0,
      }}>수정</button>
      <button onClick={() => setDeposit(d => ({ ...d, on:false }))} title="차감 안 함" style={{
        border:'none', background:'transparent', color:'#94A3B8', cursor:'pointer', padding:0, display:'flex',
      }}><IconX size={12}/></button>
    </div>
  );
}

// ─── 정액권/티켓 내역 행 ───
function SL_LedgerRow({ date, tag, tagColor, desc, amount, amountColor, right, last }) {
  return (
    <div style={{
      display:'grid', gridTemplateColumns:'78px 38px minmax(0,1fr) 86px 76px', gap:8,
      padding:'6px 14px', fontSize:12, alignItems:'center',
      borderBottom: last ? 'none' : `1px solid ${C_BORDER}`,
    }}>
      <span style={{color:C_MUTED, fontVariantNumeric:'tabular-nums', fontSize:11.5}}>{date}</span>
      <span style={{fontSize:10.5, fontWeight:800, color:tagColor}}>{tag}</span>
      <span style={{color:C_INK, fontWeight:700, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{desc}</span>
      <span style={{textAlign:'right', fontWeight:800, color:amountColor, fontVariantNumeric:'tabular-nums'}}>{amount}</span>
      <span style={{textAlign:'right', color:C_MUTED, fontSize:11, fontVariantNumeric:'tabular-nums'}}>{right}</span>
    </div>
  );
}

// ─── 할인 메뉴 선택 (메뉴 관리 > 할인 메뉴 연동) ───
function SL_DiscountModal({ item, cust, onApply, onClose }) {
  const base = item.price;
  const [cat, setCat] = React.useState(DISCOUNT_CATEGORIES[0].id);
  const [sel, setSel] = React.useState(item.discounts || []);
  const [manual, setManual] = React.useState(item.manual || 0);
  const toggle = (d) => setSel(prev => prev.some(x => x.id === d.id) ? prev.filter(x => x.id !== d.id) : [...prev, d]);
  const amt = (d) => d.type === 'percent' ? Math.round(base * d.value / 100) : d.value;
  const total = Math.min(base, sel.reduce((a, d) => a + amt(d), 0) + manual);
  const hint = (d) => {
    if (d.condition === 'VIP 등급') return cust.tags?.includes('VIP') ? '적용 가능' : 'VIP 아님';
    if (d.condition === '첫 방문만') return (cust.totalVisits || 0) <= 1 ? '적용 가능' : '첫 방문 아님';
    return d.condition;
  };
  return (
    <div onClick={onClose} style={sl_overlay}>
      <div onClick={e => e.stopPropagation()} style={{...sl_modal, width:560}}>
        <div style={sl_modalHead}>
          <div style={{flex:1}}>
            <div style={{fontSize:16, fontWeight:800, color:C_INK}}>할인 적용</div>
            <div style={{fontSize:12, color:C_MUTED, marginTop:2}}>
              <b style={{color:C_INK}}>{item.name}</b> · <span style={{fontVariantNumeric:'tabular-nums'}}>{SL_won(item.price)}원</span>
              <span style={{marginLeft:6}}>· 할인 메뉴 여러 개 선택 가능</span>
            </div>
          </div>
          <button onClick={onClose} style={sl_iconBtn}><IconX size={15}/></button>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', borderBottom:`2px solid ${C_BORDER}`, padding:'0 20px'}}>
          {DISCOUNT_CATEGORIES.map(c => {
            const on = cat === c.id;
            const cnt = sel.filter(s => (DISCOUNT_ITEMS[c.id] || []).some(i => i.id === s.id)).length;
            return (
              <button key={c.id} onClick={() => setCat(c.id)} style={{
                padding:'10px 4px', border:'none', background:'transparent', cursor:'pointer', fontFamily:'inherit',
                borderBottom:`2px solid ${on ? c.color : 'transparent'}`, marginBottom:-2,
                fontSize:12.5, fontWeight: on ? 800 : 600, color: on ? c.color : C_MUTED,
                display:'flex', alignItems:'center', justifyContent:'center', gap:4,
              }}>
                {c.name}
                {cnt > 0 && <span style={{minWidth:16, height:16, borderRadius:8, background:c.color, color:'#fff', fontSize:9.5, fontWeight:800, display:'inline-flex', alignItems:'center', justifyContent:'center'}}>{cnt}</span>}
              </button>
            );
          })}
        </div>
        <div style={{padding:'14px 20px', display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:6, minHeight:140, alignContent:'start'}}>
          {(DISCOUNT_ITEMS[cat] || []).filter(d => d.active).map(d => {
            const on = sel.some(x => x.id === d.id);
            const h = hint(d);
            const warn = h.endsWith('아님');
            return (
              <button key={d.id} onClick={() => toggle(d)} style={{
                padding:'10px 12px', textAlign:'left', position:'relative',
                border:`1.5px solid ${on ? C_BLUE : C_BORDER}`, background: on ? C_BLUE_SOFT : C_SURFACE,
                borderRadius:9, cursor:'pointer', fontFamily:'inherit',
                display:'flex', flexDirection:'column', gap:3, minWidth:0,
              }}>
                {on && <span style={{position:'absolute', top:7, right:7, width:16, height:16, borderRadius:'50%', background:C_BLUE, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center'}}><IconCheck size={10}/></span>}
                <span style={{fontSize:12.5, fontWeight:800, color:C_INK, paddingRight:18}}>{d.name}</span>
                <span style={{fontSize:12, fontWeight:800, color:C_BLUE, fontVariantNumeric:'tabular-nums'}}>
                  {d.type === 'percent' ? `${d.value}%` : `${SL_won(d.value)}원`}
                  <span style={{color:C_MUTED, fontWeight:600, marginLeft:6}}>−{SL_won(amt(d))}원</span>
                </span>
                <span style={{fontSize:10.5, fontWeight:700, color: warn ? '#B45309' : C_MUTED}}>{h}</span>
              </button>
            );
          })}
        </div>
        <div style={{padding:'0 20px 14px', display:'grid', gridTemplateColumns:'auto 160px 1fr', gap:10, alignItems:'center'}}>
          <span style={sl_label}>직접 입력</span>
          <SL_MoneyInput value={manual} max={base} onChange={setManual}/>
          <span style={{fontSize:10.5, color:C_MUTED}}>할인 메뉴에 없는 금액만큼 추가로 깎을 때</span>
        </div>
        <div style={sl_modalFoot}>
          <span style={{fontSize:12, color:C_MUTED, fontWeight:600, marginRight:'auto', alignSelf:'center', fontVariantNumeric:'tabular-nums'}}>
            {total ? <>할인 <b style={{color:'#DC2626'}}>−{SL_won(total)}원</b> → 결제 <b style={{color:C_INK}}>{SL_won(base - total)}원</b></> : '할인 없음'}
          </span>
          {(sel.length > 0 || manual > 0) && (
            <button onClick={() => { setSel([]); setManual(0); }} style={sl_ghostBtn}>초기화</button>
          )}
          <button onClick={onClose} style={sl_ghostBtn}>취소</button>
          <button onClick={() => onApply(sel, manual)} style={sl_primaryBtn}>적용</button>
        </div>
      </div>
    </div>
  );
}

// ─── 클레임 등록 ───
function SL_ClaimModal({ cust, designerId, onSave, onClose }) {
  const [type, setType] = React.useState(SL_CLAIM_TYPES[0]);
  const [designer, setDesigner] = React.useState(designerId);
  const [action, setAction] = React.useState('none');
  const [text, setText] = React.useState('');
  const designers = DESIGNERS.filter(d => d.id !== 'unassigned').slice(0, 10);
  const chip = (on, label, onClick, color = C_BLUE) => (
    <button onClick={onClick} style={{
      padding:'6px 12px', borderRadius:14, fontSize:12, fontWeight: on ? 800 : 600,
      border:`1px solid ${on ? color : C_BORDER}`, background: on ? `${color}14` : C_SURFACE,
      color: on ? color : C_MUTED, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap',
    }}>{label}</button>
  );
  return (
    <div onClick={onClose} style={sl_overlay}>
      <div onClick={e => e.stopPropagation()} style={{...sl_modal, width:480}}>
        <div style={sl_modalHead}>
          <div style={{flex:1}}>
            <div style={{fontSize:16, fontWeight:800, color:C_INK}}>클레임 등록</div>
            <div style={{fontSize:11.5, color:C_MUTED, marginTop:2}}>{cust.name}님 · 현재 {cust.claim || 0}건</div>
          </div>
          <button onClick={onClose} style={sl_iconBtn}><IconX size={15}/></button>
        </div>
        <div style={{padding:'16px 20px', display:'flex', flexDirection:'column', gap:12}}>
          <div>
            <div style={{...sl_label, marginBottom:6}}>유형</div>
            <div style={{display:'flex', flexWrap:'wrap', gap:5}}>
              {SL_CLAIM_TYPES.map(t => chip(type === t, t, () => setType(t), '#DC2626'))}
            </div>
          </div>
          <div>
            <div style={{...sl_label, marginBottom:6}}>관련 시술자</div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(5, minmax(0,1fr))', gap:4}}>
              {designers.map(d => {
                const on = designer === d.id;
                return (
                  <button key={d.id} onClick={() => setDesigner(d.id)} style={{
                    padding:'6px 2px', borderRadius:7, fontSize:11.5, fontWeight: on ? 800 : 600,
                    border:`1.5px solid ${on ? d.color : C_BORDER}`, background: on ? `${d.color}18` : C_SURFACE,
                    color: on ? C_INK : C_MUTED, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap',
                  }}>{d.name}</button>
                );
              })}
            </div>
          </div>
          <div>
            <div style={{...sl_label, marginBottom:6}}>내용</div>
            <textarea value={text} onChange={e => setText(e.target.value.slice(0, 300))} rows={4}
              placeholder="고객이 말한 내용을 그대로 적어주세요"
              style={{...sl_input, height:'auto', padding:'9px 11px', resize:'none', lineHeight:1.5}}/>
          </div>
          <div>
            <div style={{...sl_label, marginBottom:6}}>처리</div>
            <div style={{display:'flex', gap:5}}>
              {[['none','처리 전'],['redo','재시술 예약'],['discount','다음 방문 할인'],['done','처리 완료']].map(([id, l]) =>
                chip(action === id, l, () => setAction(id)))}
            </div>
          </div>
        </div>
        <div style={sl_modalFoot}>
          <button onClick={onClose} style={sl_ghostBtn}>취소</button>
          <button disabled={!text.trim()} onClick={onSave} style={{
            ...sl_primaryBtn, background:'#DC2626',
            opacity: text.trim() ? 1 : 0.4, cursor: text.trim() ? 'pointer' : 'not-allowed',
          }}>클레임 등록</button>
        </div>
      </div>
    </div>
  );
}

// ─── 정액권 / 티켓권 환불 ───
function SL_RefundModal({ cust, initial, membershipBal, tickets, onDone, onClose }) {
  const [type, setType] = React.useState(initial);
  const [ticketId, setTicketId] = React.useState(tickets.find(t => t.remain > 0)?.id);
  const [step, setStep] = React.useState(1); // 1 계산 · 2 완료
  const [method, setMethod] = React.useState('card');
  const [feeRate, setFeeRate] = React.useState(10);
  const [reason, setReason] = React.useState('');

  // 정액권: 충전 원금 비율 기준 (보너스 적립분 제외). 목업: 30만원 충전에 33만 적립 → 잔액 × 300/330
  const mPaidRatio = 300000 / 330000;
  const tk = tickets.find(t => t.id === ticketId);
  const base = type === 'membership'
    ? Math.round(membershipBal * mPaidRatio)
    : tk ? Math.round(tk.price - (tk.price / tk.total) * (tk.total - tk.remain)) : 0;
  const fee = Math.round(base * feeRate / 100 / 10) * 10;
  const refund = Math.max(0, base - fee);

  const line = (label, value, strong, color) => (
    <div style={{display:'flex', justifyContent:'space-between', padding:'5px 0', fontSize: strong ? 14 : 12.5}}>
      <span style={{color: strong ? C_INK : C_MUTED, fontWeight: strong ? 800 : 600}}>{label}</span>
      <span style={{fontWeight:800, color: color || C_INK, fontVariantNumeric:'tabular-nums'}}>{value}</span>
    </div>
  );

  if (step === 2) {
    return (
      <div style={sl_overlay}>
        <div style={{...sl_modal, width:360, padding:'26px 24px 20px', textAlign:'center'}}>
          <div style={{width:52, height:52, margin:'0 auto 12px', borderRadius:'50%', background:'#FEF2F2', color:'#DC2626', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <IconCheck size={24}/>
          </div>
          <div style={{fontSize:16, fontWeight:800, color:C_INK}}>환불 처리되었습니다</div>
          <div style={{fontSize:12, color:C_MUTED, marginTop:4}}>
            {cust.name}님 · {type === 'membership' ? '정액권' : `${tk?.name} 티켓`}
          </div>
          <div style={{fontSize:24, fontWeight:800, color:'#DC2626', marginTop:12, fontVariantNumeric:'tabular-nums'}}>{SL_won(refund)}원</div>
          <div style={{fontSize:11.5, color:C_MUTED, marginTop:4}}>
            {SL_METHODS.find(m => m.id === method)?.full}로 환불 · 일일마감에 환불로 기록됩니다
          </div>
          <button onClick={() => onDone({ type, ticketId, refund, deduct: type === 'membership' ? membershipBal : 0 })}
            style={{...sl_primaryBtn, width:'100%', marginTop:18, padding:'11px'}}>확인</button>
        </div>
      </div>
    );
  }

  return (
    <div onClick={onClose} style={sl_overlay}>
      <div onClick={e => e.stopPropagation()} style={{...sl_modal, width:500}}>
        <div style={sl_modalHead}>
          <div style={{flex:1}}>
            <div style={{fontSize:16, fontWeight:800, color:C_INK}}>정액권 · 티켓권 환불</div>
            <div style={{fontSize:11.5, color:C_MUTED, marginTop:2}}>{cust.name}님</div>
          </div>
          <button onClick={onClose} style={sl_iconBtn}><IconX size={15}/></button>
        </div>
        <div style={{padding:'16px 20px', display:'flex', flexDirection:'column', gap:14}}>
          {/* 1. 대상 */}
          <div>
            <div style={{...sl_label, marginBottom:6}}>① 환불할 상품</div>
            <div style={{display:'flex', flexDirection:'column', gap:5}}>
              <SL_RefundOption on={type === 'membership'} onClick={() => setType('membership')}
                color="#7C3AED" title="정액권" sub={`잔액 ${SL_won(membershipBal)}원 (충전 30만원 · 적립 33만원)`}
                disabled={membershipBal <= 0}/>
              {tickets.map(t => (
                <SL_RefundOption key={t.id} on={type === 'ticket' && ticketId === t.id}
                  onClick={() => { setType('ticket'); setTicketId(t.id); }}
                  color={SL_TEAL} title={`${t.name} ${t.total}회권`}
                  sub={`${t.remain}/${t.total}회 남음 · 구매 ${SL_won(t.price)}원 (${t.bought})`}
                  disabled={t.remain <= 0}/>
              ))}
            </div>
          </div>

          {/* 2. 계산 */}
          <div>
            <div style={{display:'flex', alignItems:'center', marginBottom:6}}>
              <span style={sl_label}>② 환불 금액</span>
              <div style={{flex:1}}/>
              <span style={{fontSize:11, color:C_MUTED, marginRight:6}}>위약금</span>
              {[0, 10, 20].map(r => (
                <button key={r} onClick={() => setFeeRate(r)} style={{
                  marginLeft:3, padding:'3px 9px', borderRadius:10, fontSize:11, fontWeight: feeRate === r ? 800 : 600,
                  border:`1px solid ${feeRate === r ? C_BLUE : C_BORDER}`, background: feeRate === r ? C_BLUE_SOFT : C_SURFACE,
                  color: feeRate === r ? C_BLUE : C_MUTED, cursor:'pointer', fontFamily:'inherit',
                }}>{r}%</button>
              ))}
            </div>
            <div style={{padding:'10px 14px', background:'#FBFCFE', border:`1px solid ${C_BORDER}`, borderRadius:9}}>
              {type === 'membership' ? (
                <>
                  {line('남은 잔액', `${SL_won(membershipBal)}원`)}
                  {line('보너스 적립분 제외', `−${SL_won(membershipBal - base)}원`, false, '#DC2626')}
                </>
              ) : tk && (
                <>
                  {line('구매 금액', `${SL_won(tk.price)}원`)}
                  {line(`사용 ${tk.total - tk.remain}회 공제 (회당 ${SL_won(tk.price / tk.total)})`, `−${SL_won(tk.price - base)}원`, false, '#DC2626')}
                </>
              )}
              {line(`위약금 ${feeRate}%`, `−${SL_won(fee)}원`, false, fee ? '#DC2626' : '#CBD5E1')}
              <div style={{borderTop:`1px dashed ${C_BORDER}`, marginTop:5, paddingTop:5}}>
                {line('환불할 금액', `${SL_won(refund)}원`, true, '#DC2626')}
              </div>
            </div>
          </div>

          {/* 3. 수단 + 사유 */}
          <div>
            <div style={{...sl_label, marginBottom:6}}>③ 환불 수단 · 사유</div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))', gap:4, marginBottom:6}}>
              {[['card','카드 취소'],['cash','현금'],['transfer','계좌이체'],['etc','기타']].map(([id, l]) => (
                <button key={id} onClick={() => setMethod(id)} style={{
                  padding:'8px 0', fontSize:12, fontWeight: method === id ? 800 : 600,
                  border:`1.5px solid ${method === id ? C_BLUE : C_BORDER}`,
                  background: method === id ? C_BLUE : C_SURFACE, color: method === id ? '#fff' : C_INK,
                  borderRadius:8, cursor:'pointer', fontFamily:'inherit',
                }}>{l}</button>
              ))}
            </div>
            <input value={reason} onChange={e => setReason(e.target.value)} placeholder="환불 사유 (예: 이사, 단순 변심)"
              style={sl_input}/>
          </div>
        </div>
        <div style={sl_modalFoot}>
          <span style={{fontSize:11, color:C_MUTED, marginRight:'auto', alignSelf:'center'}}>
            환불하면 {type === 'membership' ? '정액권 잔액이 0원' : '티켓 남은 횟수가 0회'}이 됩니다
          </span>
          <button onClick={onClose} style={sl_ghostBtn}>취소</button>
          <button disabled={!reason.trim() || refund <= 0} onClick={() => setStep(2)} style={{
            ...sl_primaryBtn, background:'#DC2626',
            opacity: reason.trim() && refund > 0 ? 1 : 0.4, cursor: reason.trim() && refund > 0 ? 'pointer' : 'not-allowed',
          }}>{SL_won(refund)}원 환불</button>
        </div>
      </div>
    </div>
  );
}

function SL_RefundOption({ on, onClick, color, title, sub, disabled }) {
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled} style={{
      padding:'9px 12px', borderRadius:9, textAlign:'left', fontFamily:'inherit',
      border:`1.5px solid ${on ? color : C_BORDER}`, background: disabled ? '#F5F7FB' : on ? `${color}10` : C_SURFACE,
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
      display:'flex', alignItems:'center', gap:10,
    }}>
      <span style={{
        width:16, height:16, borderRadius:'50%', border:`2px solid ${on ? color : C_BORDER}`,
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
      }}>{on && <span style={{width:7, height:7, borderRadius:'50%', background:color}}/>}</span>
      <div style={{minWidth:0}}>
        <div style={{fontSize:12.5, fontWeight:800, color:C_INK}}>{title}{disabled ? ' (환불됨)' : ''}</div>
        <div style={{fontSize:11, color:C_MUTED, marginTop:1, fontVariantNumeric:'tabular-nums'}}>{sub}</div>
      </div>
    </button>
  );
}

// ─── 고객 정보 수정 ───
function SL_CustomerEditModal({ cust, onSave, onClose }) {
  const [f, setF] = React.useState({ ...cust, tags:[...(cust.tags || [])] });
  const set = (k, v) => setF(prev => ({ ...prev, [k]: v }));
  const designers = DESIGNERS.filter(d => d.id !== 'unassigned').slice(0, 10);
  const row = (label, node) => (
    <div style={{display:'grid', gridTemplateColumns:'72px 1fr', gap:10, alignItems:'center'}}>
      <span style={sl_label}>{label}</span>{node}
    </div>
  );
  const input = (k, extra = {}) => (
    <input value={f[k] || ''} onChange={e => set(k, e.target.value)} {...extra} style={sl_input}/>
  );
  return (
    <div onClick={onClose} style={sl_overlay}>
      <div onClick={e => e.stopPropagation()} style={{...sl_modal, width:480}}>
        <div style={sl_modalHead}>
          <span style={{fontSize:16, fontWeight:800, color:C_INK, flex:1}}>고객 정보 수정</span>
          <button onClick={onClose} style={sl_iconBtn}><IconX size={15}/></button>
        </div>
        <div style={{padding:'16px 20px', display:'flex', flexDirection:'column', gap:11}}>
          {row('이름', input('name'))}
          {row('전화번호', input('phone', { inputMode:'tel' }))}
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
            {row('MBTI', <input value={f.mbti || ''} maxLength={4}
              onChange={e => set('mbti', e.target.value.toUpperCase())} style={sl_input}/>)}
            {row('생일', input('birth', { type:'date' }))}
          </div>
          {row('등급', (
            <div style={{display:'flex', gap:5}}>
              {['VIP','단골','신규'].map(t => {
                const on = f.tags.includes(t);
                return (
                  <button key={t} onClick={() => set('tags', on ? f.tags.filter(x => x !== t) : [...f.tags, t])} style={{
                    padding:'6px 14px', borderRadius:14, fontSize:12, fontWeight: on ? 800 : 600,
                    border:`1px solid ${on ? C_BLUE : C_BORDER}`, background: on ? C_BLUE_SOFT : C_SURFACE,
                    color: on ? C_BLUE : C_MUTED, cursor:'pointer', fontFamily:'inherit',
                  }}>{t}</button>
                );
              })}
            </div>
          ))}
          <div style={{display:'grid', gridTemplateColumns:'72px 1fr', gap:10, alignItems:'start'}}>
            <span style={{...sl_label, paddingTop:7}}>담당자</span>
            <div style={{display:'grid', gridTemplateColumns:'repeat(5, minmax(0,1fr))', gap:4}}>
              {designers.map(d => {
                const on = f.mainDesigner === d.id;
                return (
                  <button key={d.id} onClick={() => set('mainDesigner', d.id)} style={{
                    padding:'7px 2px', borderRadius:7, fontSize:11.5, fontWeight: on ? 800 : 600,
                    border:`1.5px solid ${on ? d.color : C_BORDER}`, background: on ? `${d.color}18` : C_SURFACE,
                    color: on ? C_INK : C_MUTED, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap',
                  }}>{d.name}</button>
                );
              })}
            </div>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'72px 1fr', gap:10, alignItems:'start'}}>
            <span style={{...sl_label, paddingTop:7}}>메모</span>
            <textarea value={f.memo || ''} onChange={e => set('memo', e.target.value.slice(0, 200))} rows={3}
              placeholder="알러지, 선호 스타일 등" style={{...sl_input, height:'auto', padding:'8px 10px', resize:'none', lineHeight:1.5}}/>
          </div>
        </div>
        <div style={sl_modalFoot}>
          <button onClick={onClose} style={sl_ghostBtn}>취소</button>
          <button onClick={() => onSave(f)} style={sl_primaryBtn}>저장</button>
        </div>
      </div>
    </div>
  );
}

// ─── 문자 보내기 ───
function SL_SmsModal({ cust, onClose }) {
  const TPL = [
    { id:'confirm', label:'예약 확인',   text:`[쌀롱] ${cust.name}님, 10월 1일 예약이 확정되었습니다. 방문을 기다리겠습니다.` },
    { id:'after',   label:'시술 후 안내', text:`[쌀롱] ${cust.name}님, 오늘 시술은 만족스러우셨나요? 48시간 동안은 샴푸를 피해주세요.` },
    { id:'revisit', label:'재방문 안내', text:`[쌀롱] ${cust.name}님, 마지막 방문 후 한 달이 지났어요. 편하실 때 예약 부탁드립니다.` },
  ];
  const [text, setText] = React.useState('');
  const [sent, setSent] = React.useState(false);
  const bytes = [...text].reduce((a, ch) => a + (ch.charCodeAt(0) > 127 ? 2 : 1), 0);
  const kind = bytes > 90 ? 'LMS' : 'SMS';
  return (
    <div onClick={onClose} style={sl_overlay}>
      <div onClick={e => e.stopPropagation()} style={{...sl_modal, width:420}}>
        {sent ? (
          <div style={{padding:'28px 24px 20px', textAlign:'center'}}>
            <div style={{width:52, height:52, margin:'0 auto 12px', borderRadius:'50%', background:'#D1FAE5', color:'#059669', display:'flex', alignItems:'center', justifyContent:'center'}}>
              <IconCheck size={24}/>
            </div>
            <div style={{fontSize:16, fontWeight:800, color:C_INK}}>문자를 보냈습니다</div>
            <div style={{fontSize:12, color:C_MUTED, marginTop:4, fontVariantNumeric:'tabular-nums'}}>{cust.name} · {cust.phone}</div>
            <button onClick={onClose} style={{...sl_primaryBtn, width:'100%', marginTop:18, padding:'11px'}}>확인</button>
          </div>
        ) : (
          <>
            <div style={sl_modalHead}>
              <div style={{flex:1}}>
                <div style={{fontSize:16, fontWeight:800, color:C_INK}}>문자 보내기</div>
                <div style={{fontSize:11.5, color:C_MUTED, marginTop:2, fontVariantNumeric:'tabular-nums'}}>
                  받는 사람 <b style={{color:C_INK}}>{cust.name}</b> · {cust.phone}
                </div>
              </div>
              <button onClick={onClose} style={sl_iconBtn}><IconX size={15}/></button>
            </div>
            <div style={{padding:'14px 20px', display:'flex', flexDirection:'column', gap:10}}>
              <div style={{display:'flex', gap:5}}>
                {TPL.map(t => (
                  <button key={t.id} onClick={() => setText(t.text)} style={{
                    padding:'6px 11px', borderRadius:14, fontSize:11.5, fontWeight:700,
                    border:`1px solid ${C_BORDER}`, background:C_SURFACE, color:C_INK,
                    cursor:'pointer', fontFamily:'inherit',
                  }}>{t.label}</button>
                ))}
              </div>
              <div style={{position:'relative'}}>
                <textarea value={text} onChange={e => setText(e.target.value)} rows={6} autoFocus
                  placeholder="보낼 내용을 입력하거나 위의 문구를 선택하세요"
                  style={{...sl_input, height:'auto', padding:'10px 12px', resize:'none', lineHeight:1.55}}/>
                <span style={{position:'absolute', right:10, bottom:8, fontSize:10.5, color:C_MUTED, fontVariantNumeric:'tabular-nums'}}>
                  <b style={{color: kind === 'LMS' ? '#B45309' : C_BLUE}}>{kind}</b> {bytes}/{kind === 'LMS' ? 2000 : 90}byte
                </span>
              </div>
            </div>
            <div style={sl_modalFoot}>
              <button onClick={onClose} style={sl_ghostBtn}>취소</button>
              <button disabled={!text.trim()} onClick={() => setSent(true)} style={{
                ...sl_primaryBtn, opacity: text.trim() ? 1 : 0.4, cursor: text.trim() ? 'pointer' : 'not-allowed',
              }}>보내기</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── styles ───
const sl_overlay = {
  position:'fixed', inset:0, background:'rgba(11,20,37,0.5)', zIndex:210,
  display:'flex', alignItems:'center', justifyContent:'center', padding:16,
};
const sl_modal = {
  maxWidth:'96vw', maxHeight:'88vh', background:'#fff', borderRadius:14,
  boxShadow:'0 24px 64px rgba(11,20,37,0.28)', display:'flex', flexDirection:'column', overflow:'auto',
};
const sl_modalHead = { padding:'14px 20px', borderBottom:'1px solid #E5EAF2', display:'flex', alignItems:'center', gap:8 };
const sl_modalFoot = { padding:'12px 20px', borderTop:'1px solid #E5EAF2', background:'#FBFCFE', display:'flex', justifyContent:'flex-end', gap:8 };
const sl_input = {
  width:'100%', height:34, padding:'0 10px', border:'1px solid #E5EAF2', borderRadius:8,
  fontSize:12.5, color:'#0B1425', background:'#fff', outline:'none', fontFamily:'inherit', boxSizing:'border-box',
};
const sl_primaryBtn = {
  padding:'9px 20px', border:'none', borderRadius:8, background:'#1E40AF', color:'#fff',
  fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'inherit',
};
const sl_menuItem = {
  width:'100%', padding:'7px 8px', border:'none', borderRadius:6, background:'transparent',
  cursor:'pointer', fontFamily:'inherit', display:'flex', justifyContent:'space-between', gap:6,
  fontSize:12, color:'#0B1425', textAlign:'left',
};
const sl_card = { background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:12, minWidth:0 };
const sl_title = { fontSize:13, fontWeight:800, color:C_INK, letterSpacing:'-0.01em' };
const sl_label = { fontSize:12, fontWeight:700, color:C_INK, whiteSpace:'nowrap' };
const sl_rowGrid = { display:'grid', gridTemplateColumns:'50px minmax(0,1fr) 82px 66px 112px 66px 22px', gap:6, alignItems:'center' };
const sl_iconBtn = {
  width:32, height:32, borderRadius:9, border:`1px solid ${C_BORDER}`, background:C_SURFACE,
  color:C_INK, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
};
const sl_ghostBtn = {
  padding:'7px 12px', border:`1px solid ${C_BORDER}`, borderRadius:8, background:C_SURFACE,
  color:C_INK, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
  display:'inline-flex', alignItems:'center', gap:5, whiteSpace:'nowrap',
};
const sl_select = {
  height:33, padding:'0 4px', border:`1px solid ${C_BORDER}`, borderRadius:7, minWidth:0,
  fontSize:11, fontWeight:700, color:C_INK, background:C_SURFACE, fontFamily:'inherit', outline:'none',
};

window.C_SalesPage = C_SalesPage;
