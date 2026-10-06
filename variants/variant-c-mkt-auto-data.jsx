// 마케팅 › 자동발송 — 트리거 / 템플릿 목업 데이터

// 미리보기용 샘플 값
const AU_SAMPLE = {
  '고객명':'홍길동', '매장명':'카이키키 부평본점', '예약일시':'2026-10-04(일) 11:00',
  '담당자명':'문지윤 원장', '매장전화번호':'032-505-1122', '예약메뉴':'컷&드라이',
  '담당자전화번호':'010-1234-5678', '보유포인트':'12,400P', '정액권잔액':'230,000원',
  '사용금액':'45,000원', '잔여횟수':'3회', '만료일':'2026-10-31', '시술명':'일반펌',
  '결제금액':'128,000원', '적립포인트':'3,000P', '대기번호':'3번', '예상대기':'20분',
  '소개고객명':'김하늘', '리뷰문구':'방문을 고민하는 분들에게 도움이 되는 리뷰를 남겨주세요!',
};

// 문자 공통 변수 (에디터 하단 칩)
const AU_SMS_VARS = ['고객명','매장명','예약일시','담당자명','매장전화번호','예약메뉴','담당자전화번호','보유포인트'];

const AU_REVIEW_PHRASES = [
  '방문을 고민하는 분들에게 도움이 되는 리뷰를 남겨주세요!',
  '솔직한 후기는 저희에게 큰 힘이 됩니다 :)',
  '리뷰를 남겨주시면 다음 방문 시 포인트 1,000P를 드려요.',
];

const AU_GROUP_ORDER = ['예약','대기/시술','고객 관리','시술/판매','정액권/횟수권'];

// timing: { kind:'select', options:[...] } | { kind:'reserve', time:[...], date:[...] } | { kind:'rules' }
const AU_ALIMTALK = [
  { id:'al-rsv', group:'예약', name:'예약 안내', event:'예약 등록 시', on:true,
    timing:{ kind:'select', options:['예약 등록 즉시'] }, code:'KK_RSV_001',
    body:'[#{매장명}] 예약 안내\n\n#{고객명} 고객님, 예약이 확정되었습니다.\n\n▶ 예약일시 : #{예약일시}\n▶ 예약메뉴 : #{예약메뉴}\n▶ 담당자 : #{담당자명}\n\n예약 변경은 아래 번호로 연락 주세요.\n☎ #{매장전화번호}' },
  { id:'al-rsv-des', group:'예약', name:'예약 안내(디자이너)', event:'예약 등록 시', on:false, recipient:'designer',
    timing:{ kind:'select', options:['예약 등록 즉시'] }, code:'KK_RSV_002',
    body:'[예약 알림]\n#{담당자명}님, 새 예약이 등록되었습니다.\n\n▶ 고객명 : #{고객명}\n▶ 예약일시 : #{예약일시}\n▶ 예약메뉴 : #{예약메뉴}' },
  { id:'al-rsv-remind', group:'예약', name:'예약일 확인', event:'예약일 전', on:false,
    timing:{ kind:'select', options:['예약 전날 오후 6시','예약 전날 오전 10시','예약 3시간 전','예약 1시간 전'] }, code:'KK_RSV_003',
    body:'#{고객명} 고객님, 내일 예약 잊지 않으셨죠?\n\n▶ 예약일시 : #{예약일시}\n▶ 담당자 : #{담당자명}\n\n변경이 필요하시면 미리 연락 부탁드립니다.\n☎ #{매장전화번호}' },
  { id:'al-wait', group:'대기/시술', name:'대기 접수', event:'대기 등록 시', on:false,
    timing:{ kind:'select', options:['대기 등록 즉시'] }, code:'KK_WT_001',
    body:'#{고객명}님, 대기 접수되었습니다.\n\n▶ 대기번호 : #{대기번호}\n▶ 예상 대기시간 : 약 #{예상대기}\n\n순서가 되면 다시 알려드릴게요.' },
  { id:'al-wait-des', group:'대기/시술', name:'대기 접수(디자이너)', event:'대기 등록 시', on:false, recipient:'designer',
    timing:{ kind:'select', options:['대기 등록 즉시'] }, code:'KK_WT_002',
    body:'[대기 알림]\n#{담당자명}님, #{고객명} 고객님이 대기 중입니다.\n▶ 대기번호 : #{대기번호}' },
  { id:'al-prepaid-use', group:'정액권/횟수권', name:'정액권 사용', event:'정액권 차감 시', on:true,
    timing:{ kind:'select', options:['사용 즉시'] }, code:'KK_PP_001',
    body:'#{고객명}님, 정액권이 사용되었습니다.\n\n▶ 사용금액 : #{사용금액}\n▶ 잔여금액 : #{정액권잔액}\n▶ 유효기간 : #{만료일}까지' },
  { id:'al-prepaid-exp', group:'정액권/횟수권', name:'정액권 만료', event:'정액권 만료 전', on:true,
    timing:{ kind:'select', options:['만료 7일 전 오전 11시','만료 14일 전 오전 11시','만료 30일 전 오전 11시'] }, code:'KK_PP_002',
    body:'#{고객명}님, 보유하신 정액권이 곧 만료됩니다.\n\n▶ 잔여금액 : #{정액권잔액}\n▶ 만료일 : #{만료일}\n\n만료 전에 꼭 사용해 주세요.' },
  { id:'al-ticket-use', group:'정액권/횟수권', name:'횟수권 사용', event:'횟수권 차감 시', on:false,
    timing:{ kind:'select', options:['사용 즉시'] }, code:'KK_TK_001',
    body:'#{고객명}님, 횟수권이 1회 사용되었습니다.\n\n▶ 잔여 횟수 : #{잔여횟수}\n▶ 유효기간 : #{만료일}까지' },
  { id:'al-ticket-exp', group:'정액권/횟수권', name:'횟수권 만료', event:'횟수권 만료 전', on:false,
    timing:{ kind:'select', options:['만료 7일 전 오전 11시','만료 14일 전 오전 11시','만료 30일 전 오전 11시'] }, code:'KK_TK_002',
    body:'#{고객명}님, 보유하신 횟수권이 곧 만료됩니다.\n\n▶ 잔여 횟수 : #{잔여횟수}\n▶ 만료일 : #{만료일}' },

];

const AU_SMS = [
  { id:'sms-rsv', group:'예약', name:'예약등록 안내', event:'예약 등록 시', on:true,
    timing:{ kind:'reserve', time:['예약 즉시','예약 10분 후','예약 30분 후','예약 1시간 후'], date:['예약 1일 전 오전 10시','예약 2일 전 오전 10시','예약 3일 전 오전 10시'] },
    body:'[#{매장명} 예약 안내]\n\n#{고객명} 고객님, 예약이 확정되었습니다.\n\n▶예약매장 : #{매장명}\n▶예약일시 : #{예약일시}\n▶담당자 : #{담당자명}\n\n예약 변경사항은 아래 번호로 사전에 연락주세요. 그럼 예약일에 뵙겠습니다.\n☎ : #{매장전화번호}' },
  { id:'sms-rsv-remind', group:'예약', name:'예약일 확인 안내', event:'예약일 전', on:false,
    timing:{ kind:'select', options:['예약 전날 오후 6시','예약 전날 오전 10시','예약 3시간 전'] },
    body:'#{고객명}님, 내일 #{예약일시} #{매장명} 예약이 있어요.\n변경 시 연락 주세요 ☎ #{매장전화번호}' },

  { id:'sms-new', group:'고객 관리', name:'신규 고객 등록', event:'고객 등록 시', on:false,
    timing:{ kind:'select', options:['고객 등록 즉시','첫 매출입력 직후'] },
    body:'#{고객명}님, #{매장명}에 처음 오신 걸 환영해요!\n가입 축하 포인트 #{적립포인트}를 적립해 드렸어요.' },
  { id:'sms-intro', group:'고객 관리', name:'고객 소개', event:'소개 고객 첫 방문 시', on:false, recipientNote:'소개해 준 고객에게 발송돼요.',
    timing:{ kind:'select', options:['소개 고객 매출입력 직후','다음날 오전 11시'] },
    body:'#{고객명}님 소개로 #{소개고객명}님이 방문해 주셨어요.\n감사의 마음으로 #{적립포인트}를 적립해 드렸어요!' },
  { id:'sms-birth', group:'고객 관리', name:'생일 고객', event:'고객 생일', on:true, ad:true,
    timing:{ kind:'select', options:['생일 당일 오전 10시','생일 3일 전 오전 10시','생일 7일 전 오전 10시'] },
    body:'#{고객명}님, 생일 진심으로 축하드려요!\n생일 달에 방문하시면 전 시술 15% 할인해 드릴게요.\n예약 ☎ #{매장전화번호}' },

  { id:'sms-after', group:'시술/판매', name:'시술 후 안내', event:'시술 후 N일', on:true, rules:true,
    timing:{ kind:'rules' }, body:'' },
  { id:'sms-product', group:'시술/판매', name:'제품판매', event:'제품 결제 시', on:false,
    timing:{ kind:'select', options:['결제 직후','결제 3일 후 오전 11시'] },
    body:'#{고객명}님, 구매하신 제품은 잘 사용하고 계신가요?\n사용법이 궁금하시면 언제든 문의 주세요 ☎ #{매장전화번호}' },

  { id:'sms-prepaid-use', group:'정액권/횟수권', name:'정액권 사용', event:'정액권 차감 시', on:false,
    timing:{ kind:'select', options:['사용 즉시'] },
    body:'[#{매장명}] 정액권 #{사용금액} 사용, 잔액 #{정액권잔액}' },
  { id:'sms-prepaid-exp', group:'정액권/횟수권', name:'정액권 만료', event:'정액권 만료 전', on:false,
    timing:{ kind:'select', options:['만료 7일 전 오전 11시','만료 14일 전 오전 11시','만료 30일 전 오전 11시'] },
    body:'#{고객명}님, 정액권 잔액 #{정액권잔액}이 #{만료일}에 만료돼요. 만료 전에 사용해 주세요.' },
  { id:'sms-ticket-use', group:'정액권/횟수권', name:'횟수권 사용', event:'횟수권 차감 시', on:false,
    timing:{ kind:'select', options:['사용 즉시'] },
    body:'[#{매장명}] 횟수권 1회 사용, 잔여 #{잔여횟수}' },
  { id:'sms-ticket-exp', group:'정액권/횟수권', name:'횟수권 만료', event:'횟수권 만료 전', on:false,
    timing:{ kind:'select', options:['만료 7일 전 오전 11시','만료 14일 전 오전 11시','만료 30일 전 오전 11시'] },
    body:'#{고객명}님, 횟수권 잔여 #{잔여횟수}가 #{만료일}에 만료돼요.' },
];

// 시술 후 안내 — 기본 규칙
const AU_AFTER_RULES = [
  { id:'r1', cat:'basic-perm', days:3,  hour:'11', on:true,
    body:'#{고객명}님, 펌 하신 지 3일 지났어요.\n오늘부터 샴푸 후 완전히 말려주시면 컬이 더 오래 유지돼요.\n궁금한 점은 #{담당자명}에게 편하게 물어보세요.' },
  { id:'r2', cat:'color', days:30, hour:'11', on:true,
    body:'#{고객명}님, 컬러링 후 한 달이 지났어요.\n뿌리 염색이나 컬러 리터치가 필요한 시기예요.\n예약 ☎ #{매장전화번호}' },
  { id:'r3', cat:'magic', days:90, hour:'11', on:false,
    body:'#{고객명}님, 매직 시술 후 3개월이 지났어요.\n뿌리 볼륨이 신경 쓰이신다면 #{담당자명}에게 상담받아 보세요.' },
];

// 문자 템플릿 불러오기 — 저장된 문구 (공용)
const AU_SAVED_TEMPLATES = [
  { id:'t1', name:'짧은 확인 문자', body:'[#{매장명}] #{고객명}님 #{예약일시} 예약 확정. 문의 #{매장전화번호}' },
  { id:'t2', name:'친근한 안내', body:'#{고객명}님 안녕하세요 :)\n#{매장명}입니다.\n#{예약일시}에 #{담당자명}이 기다리고 있을게요!' },
  { id:'t3', name:'포인트 안내 포함', body:'#{고객명}님, 현재 보유 포인트는 #{보유포인트}예요.\n다음 방문 시 사용하실 수 있어요.' },
];

Object.assign(window, {
  AU_SAMPLE, AU_SMS_VARS, AU_REVIEW_PHRASES, AU_GROUP_ORDER,
  AU_ALIMTALK, AU_SMS, AU_AFTER_RULES, AU_SAVED_TEMPLATES,
});
