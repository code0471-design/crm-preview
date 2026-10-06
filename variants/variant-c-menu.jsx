// 시술 메뉴 페이지 — 3 layouts: list-detail(기본) / grid(스크린샷) / unified-table

const {
  C_BLUE, C_BLUE_SOFT, C_INK, C_MUTED, C_BORDER, C_BG, C_SURFACE,
  c_iconBtn, c_iconBtnSm, c_ghostBtn, c_ghostBtnSm,
} = window;

// 5개 탭 스키마
const MENU_TABS = [
  { id:'service',  label:'시술',  categories:'MENU_CATEGORIES',    items:'MENU_ITEMS' },
  { id:'product',  label:'제품',  categories:'PRODUCT_CATEGORIES', items:'PRODUCT_ITEMS' },
  { id:'package',  label:'패키지',categories:'PACKAGE_CATEGORIES', items:'PACKAGE_ITEMS' },
  { id:'custom',   label:'커스텀',categories:'CUSTOM_CATEGORIES',  items:'CUSTOM_ITEMS' },
  { id:'discount', label:'할인',  categories:'DISCOUNT_CATEGORIES',items:'DISCOUNT_ITEMS' },
];

function C_SettingsMenuPage() {
  const [tab, setTab] = React.useState('service');
  const [layout, setLayout] = React.useState('grid'); // grid | list-detail
  const [search, setSearch] = React.useState('');
  const [reorderMode, setReorderMode] = React.useState(false);
  const [showCategoryModal, setShowCategoryModal] = React.useState(false);
  const [editCategory, setEditCategory] = React.useState(null);
  const [showMenuModal, setShowMenuModal] = React.useState(false);

  const currentTab = MENU_TABS.find(t => t.id === tab);
  const categories = window[currentTab.categories];
  const items = window[currentTab.items];
  const [selectedCat, setSelectedCat] = React.useState(categories[0].id);

  // 탭 변경 시 selectedCat 초기화
  React.useEffect(() => {
    setSelectedCat(categories[0].id);
  }, [tab]);

  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden', background:C_BG}}>
      <div style={{width: 948, flexShrink: 0, flex:1, display:'flex', flexDirection:'column', minHeight:0}}>
        <C_SettingsMenuSubHeader
          tab={tab} setTab={setTab}
          layout={layout} setLayout={setLayout}
          reorderMode={reorderMode} setReorderMode={setReorderMode}
          onNewCategory={() => { setEditCategory(null); setShowCategoryModal(true); }}
          search={search} setSearch={setSearch}
        />

        <div style={{flex:1, overflow:'hidden', display:'flex', minHeight:0}}>
          {layout === 'list-detail' && (
            <C_MenuListDetail
              tab={tab} categories={categories} items={items}
              selectedCat={selectedCat} setSelectedCat={setSelectedCat}
              search={search}
              onEditCategory={(cat) => { setEditCategory(cat); setShowCategoryModal(true); }}
              onAddMenu={() => setShowMenuModal(true)}
              reorderMode={reorderMode}
            />
          )}
          {layout === 'grid' && (
            <div style={{flex:1, overflow:'auto', padding:'16px 20px'}}>
              <C_MenuGrid
                tab={tab} categories={categories} items={items}
                search={search}
                onAddMenu={() => setShowMenuModal(true)}
                onEditCategory={(cat) => { setEditCategory(cat); setShowCategoryModal(true); }}
              />
            </div>
          )}
        </div>
      </div>

      {showCategoryModal && (
        <C_CategoryModal cat={editCategory} palette={MENU_COLOR_PALETTE} onClose={() => setShowCategoryModal(false)}/>
      )}
      {showMenuModal && (
        <C_MenuModal tab={tab} categories={categories} defaultCat={selectedCat} onClose={() => setShowMenuModal(false)}/>
      )}
    </div>
  );
}

// ─ 서브헤더 (탭 + 컨트롤) ─
function C_SettingsMenuSubHeader({ tab, setTab, layout, setLayout, reorderMode, setReorderMode, onNewCategory, search, setSearch }) {
  return (
    <>
      {/* 상단 라인: 브레드크럼 + 검색 + 컨트롤 */}
      <div style={{
        display:'flex', alignItems:'center', gap:8,
        padding:'10px 14px', background:C_SURFACE, borderBottom:`1px solid ${C_BORDER}`,
      }}>
        <div style={{fontSize:12.5, color:C_MUTED, flexShrink:0}}>
          홈 <span style={{margin:'0 6px'}}>›</span>
          <span>설정</span>
          <span style={{margin:'0 6px'}}>›</span>
          <span style={{color:C_INK, fontWeight:600}}>메뉴 설정</span>
        </div>

        <div style={{flex:1}}/>

        {/* 검색 */}
        <div style={{position:'relative', width:200, flexShrink:0}}>
          <IconSearch size={12} style={{position:'absolute', left:10, top:9, color:C_MUTED}}/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="메뉴 이름 검색" style={{
              height:30, padding:'0 10px 0 30px', width:'100%',
              border:`1px solid ${C_BORDER}`, borderRadius:6,
              fontSize:12, background:C_BG, color:C_INK,
              fontFamily:'inherit', outline:'none',
            }}/>
        </div>

        {/* 레이아웃 스위치 (그리드/리스트 순서) */}
        <div style={{display:'flex', background:C_BG, borderRadius:7, padding:2, border:`1px solid ${C_BORDER}`, flexShrink:0}}>
          {[
            { id:'grid',        label:'그리드' },
            { id:'list-detail', label:'리스트' },
          ].map(v => (
            <button key={v.id} onClick={() => setLayout(v.id)} style={{
              padding:'5px 12px', fontSize:11.5, fontWeight:600,
              border:'none', borderRadius:5, cursor:'pointer',
              background: layout===v.id ? C_SURFACE : 'transparent',
              color: layout===v.id ? C_INK : C_MUTED,
              boxShadow: layout===v.id ? '0 1px 2px rgba(11,20,37,0.06)' : 'none',
              fontFamily:'inherit',
            }}>{v.label}</button>
          ))}
        </div>

        {/* 순서 변경 */}
        <button onClick={() => setReorderMode(!reorderMode)} style={{
          ...c_ghostBtnSm,
          display:'flex', alignItems:'center', gap:5, flexShrink:0,
          background: reorderMode ? C_BLUE_SOFT : C_SURFACE,
          color: reorderMode ? C_BLUE : C_INK,
          borderColor: reorderMode ? C_BLUE : C_BORDER,
        }}>
          <IconGrid size={12}/> 순서 변경
        </button>

        {/* 카테고리 등록 */}
        <button onClick={onNewCategory} style={{
          display:'flex', alignItems:'center', gap:6,
          padding:'7px 12px', background: C_BLUE, color:'#fff',
          border:'none', borderRadius:7, fontSize:12, fontWeight:600,
          cursor:'pointer', flexShrink:0, whiteSpace:'nowrap',
          boxShadow:'0 1px 2px rgba(30,64,175,0.2)',
        }}>
          <IconPlus size={13}/> 카테고리 등록
        </button>
      </div>

      {/* 두 번째 라인: 5개 탭 */}
      <div style={{
        display:'flex', alignItems:'center', gap:2,
        padding:'0 14px', background:C_SURFACE, borderBottom:`1px solid ${C_BORDER}`,
      }}>
        {MENU_TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding:'11px 16px', fontSize:13, fontWeight: tab===t.id ? 700 : 500,
            border:'none', background:'transparent',
            color: tab===t.id ? C_BLUE : C_MUTED, cursor:'pointer',
            borderBottom: tab===t.id ? `2px solid ${C_BLUE}` : '2px solid transparent',
            marginBottom:-1, letterSpacing:'-0.01em',
            fontFamily:'inherit',
            transition:'color 0.12s',
          }}
          onMouseEnter={e => { if (tab !== t.id) e.currentTarget.style.color = C_INK; }}
          onMouseLeave={e => { if (tab !== t.id) e.currentTarget.style.color = C_MUTED; }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </>
  );
}

// ─ 레이아웃 A: 좌 카테고리 리스트 / 우 아이템 상세 ─
function C_MenuListDetail({ tab, categories, items: allItems, selectedCat, setSelectedCat, search, onEditCategory, onAddMenu, reorderMode }) {
  const currentCat = categories.find(c => c.id === selectedCat) || categories[0];
  const items = (allItems[currentCat.id] || []).filter(it =>
    !search || it.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalItems = (allItems[currentCat.id] || []).length;
  const activeCount = categories.filter(c => c.active).length;

  return (
    <>
      {/* 좌: 카테고리 리스트 */}
      <div style={{
        width:280, flexShrink:0,
        background:C_SURFACE, borderRight:`1px solid ${C_BORDER}`,
        display:'flex', flexDirection:'column', minHeight:0,
      }}>
        <div style={{padding:'14px 16px', borderBottom:`1px solid ${C_BORDER}`, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div>
            <div style={{fontSize:13, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>카테고리</div>
            <div style={{fontSize:11, color:C_MUTED, marginTop:2}}>{activeCount}개 활성 · 전체 {MENU_CATEGORIES.length}개</div>
          </div>
          {reorderMode && (
            <span style={{fontSize:10, color:C_BLUE, background:C_BLUE_SOFT, padding:'3px 8px', borderRadius:10, fontWeight:600}}>
              순서 변경 모드
            </span>
          )}
        </div>
        <div style={{flex:1, overflowY:'auto', padding:'8px 8px'}}>
          {categories.map(cat => {
            const itemCount = (allItems[cat.id] || []).length;
            const active = cat.id === selectedCat;
            return (
              <div key={cat.id}
                   onClick={() => setSelectedCat(cat.id)}
                   style={{
                padding:'10px 12px', borderRadius:7,
                display:'flex', alignItems:'center', gap:10,
                cursor:'pointer',
                background: active ? `${cat.color}14` : 'transparent',
                borderLeft: active ? `3px solid ${cat.color}` : '3px solid transparent',
                marginBottom:2,
                transition:'background 0.12s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#F8FAFC'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                {reorderMode && (
                  <div style={{color:C_MUTED, display:'flex', alignItems:'center', cursor:'grab'}}>
                    <IconGrid size={12}/>
                  </div>
                )}
                <span style={{width:10, height:10, borderRadius:3, background:cat.color, flexShrink:0}}/>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:13, fontWeight: active ? 700 : 600, color: active ? C_INK : C_INK, letterSpacing:'-0.01em'}}>
                    {cat.name}
                  </div>
                  <div style={{fontSize:10.5, color:C_MUTED, marginTop:2, display:'flex', gap:6, alignItems:'center'}}>
                    <span style={{fontVariantNumeric:'tabular-nums'}}>{itemCount}개 메뉴</span>
                    {!cat.active && <span style={{color:'#F87171', fontWeight:600}}>· 비활성</span>}
                    {cat.checkin && <span style={{color:'#10B981', fontWeight:600}}>· 체크인</span>}
                  </div>
                </div>
                {active && !reorderMode && (
                  <button
                    onClick={e => { e.stopPropagation(); onEditCategory(cat); }}
                    style={{
                    width:22, height:22, borderRadius:5,
                    background:C_SURFACE, border:`1px solid ${C_BORDER}`,
                    color:C_MUTED, cursor:'pointer',
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    <IconNote size={11}/>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 우: 시술 상세 */}
      <div style={{flex:1, display:'flex', flexDirection:'column', minHeight:0, background:C_BG}}>
        {/* 카테고리 헤더 (선택된 카테고리 정보) */}
        <div style={{
          padding:'14px 20px', background:C_SURFACE, borderBottom:`1px solid ${C_BORDER}`,
          display:'flex', alignItems:'center', gap:12,
        }}>
          <div style={{width:6, height:26, borderRadius:3, background:currentCat.color}}/>
          <div style={{flex:1}}>
            <div style={{fontSize:15, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>
              {currentCat.name} <span style={{color:C_MUTED, fontWeight:500, fontSize:13}}>({totalItems})</span>
            </div>
            <div style={{fontSize:11.5, color:C_MUTED, marginTop:3, display:'flex', gap:10}}>
              <span>{currentCat.active ? '사용 중' : '비활성'}</span>
              <span>·</span>
              <span>체크인 노출 {currentCat.checkin ? '켬' : '끔'}</span>
            </div>
          </div>
          <button style={{...c_ghostBtnSm, display:'flex', alignItems:'center', gap:5}}>
            <IconGrid size={11}/> 대량 수정
          </button>
        </div>

        {/* 아이템 리스트 */}
        <div style={{flex:1, overflow:'auto', padding:'12px 20px 20px'}}>
          <div style={{
            background:C_SURFACE, borderRadius:10, border:`1px solid ${C_BORDER}`, overflow:'hidden',
          }}>
            <C_TabTable
              tab={tab}
              items={items}
              currentCat={currentCat}
              search={search}
              onAddMenu={onAddMenu}
            />
          </div>
        </div>
      </div>
    </>
  );
}

// 탭별 아이템 테이블 (컬럼 스키마 자동 매핑)
function C_TabTable({ tab, items, currentCat, search, onAddMenu }) {
  const schema = TAB_SCHEMAS[tab];
  const gridCols = `44px 1fr ${schema.cols.map(c => c.w).join(' ')} 80px`;
  const addLabel = ({
    service:'시술 메뉴', product:'제품', package:'패키지', custom:'커스텀 메뉴', discount:'할인 규정',
  })[tab] + '를 추가해주세요';

  return (
    <>
      {/* 헤더 */}
      <div style={{
        display:'grid', gridTemplateColumns: gridCols,
        padding:'10px 14px', background:'#FBFCFE',
        borderBottom:`1px solid ${C_BORDER}`,
        fontSize:11, fontWeight:600, color:C_MUTED, letterSpacing:'0.02em',
      }}>
        <div style={{textAlign:'center'}}>#</div>
        <div>{schema.nameLabel}</div>
        {schema.cols.map((c, i) => (
          <div key={i} style={{textAlign: c.align || 'right'}}>{c.label}</div>
        ))}
        <div style={{textAlign:'center'}}>액션</div>
      </div>
      {/* 행 */}
      {items.length === 0 ? (
        <div style={{padding:'40px 20px', textAlign:'center', color:C_MUTED, fontSize:13}}>
          {search ? '검색 결과 없음' : '아직 등록된 항목이 없습니다'}
        </div>
      ) : (
        items.map((it, i) => (
          <C_MenuRow key={it.id} index={i+1} item={it}
            categoryColor={currentCat.color}
            gridCols={gridCols} schema={schema}/>
        ))
      )}
      {/* + 추가 */}
      <div onClick={onAddMenu} style={{
        padding:'12px 14px', borderTop:`1px solid ${C_BORDER}`,
        display:'flex', alignItems:'center', gap:8, cursor:'pointer',
        color:C_MUTED, fontSize:12.5, fontWeight:500,
        background:'#FBFCFE',
        transition:'background 0.12s, color 0.12s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = C_BLUE_SOFT; e.currentTarget.style.color = C_BLUE; }}
      onMouseLeave={e => { e.currentTarget.style.background = '#FBFCFE'; e.currentTarget.style.color = C_MUTED; }}
      >
        <div style={{width:20, height:20, borderRadius:'50%', border:`1.5px dashed currentColor`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, lineHeight:1}}>+</div>
        {addLabel}
      </div>
    </>
  );
}

// 탭별 컬럼 스키마
const TAB_SCHEMAS = {
  service: {
    nameLabel: '메뉴명',
    cols: [
      { key:'price',    label:'가격',     w:'100px', type:'money' },
      { key:'duration', label:'소요시간', w:'90px',  type:'minutes' },
    ],
  },
  product: {
    nameLabel: '상품명',
    cols: [
      { key:'brand', label:'브랜드', w:'90px',  type:'text', align:'left' },
      { key:'price', label:'가격',   w:'100px', type:'money' },
      { key:'stock', label:'재고',   w:'70px',  type:'stock' },
    ],
  },
  package: {
    nameLabel: '패키지명',
    cols: [
      { key:'price',     label:'가격',     w:'110px', type:'money' },
      { key:'sessions',  label:'회수',     w:'70px',  type:'sessions' },
      { key:'validDays', label:'유효기간', w:'80px',  type:'days' },
    ],
  },
  custom: {
    nameLabel: '조합 메뉴명',
    cols: [
      { key:'combo',    label:'구성 시술', w:'220px', type:'combo', align:'left' },
      { key:'price',    label:'가격',      w:'100px', type:'money' },
      { key:'duration', label:'소요시간',  w:'80px',  type:'minutes' },
    ],
  },
  discount: {
    nameLabel: '할인명',
    cols: [
      { key:'type',      label:'유형',      w:'70px',  type:'discountType' },
      { key:'value',     label:'할인값',    w:'80px',  type:'discountValue' },
      { key:'condition', label:'조건',      w:'140px', type:'text', align:'left' },
      { key:'active',    label:'사용',      w:'50px',  type:'toggle' },
    ],
  },
};

function C_MenuRow({ index, item, categoryColor, gridCols, schema }) {
  const [hover, setHover] = React.useState(false);
  const renderCell = (col) => {
    const v = item[col.key];
    switch (col.type) {
      case 'money':
        return (
          <span style={{color: v > 0 ? C_INK : '#CBD5E1', fontWeight:600, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.01em'}}>
            {!v ? '0' : new Intl.NumberFormat('ko-KR').format(v)}
          </span>
        );
      case 'minutes':
        return (
          <span style={{color: v > 0 ? C_MUTED : '#CBD5E1', fontVariantNumeric:'tabular-nums', fontSize:11.5}}>
            {!v ? '-' : `${v}분`}
          </span>
        );
      case 'sessions':
        return (
          <span style={{color:C_INK, fontVariantNumeric:'tabular-nums', fontSize:12}}>
            <strong style={{fontWeight:700}}>{v}</strong>회
          </span>
        );
      case 'days':
        return (
          <span style={{color:C_MUTED, fontVariantNumeric:'tabular-nums', fontSize:11.5}}>
            {!v ? '-' : `${v}일`}
          </span>
        );
      case 'stock':
        return (
          <span style={{
            color: v > 5 ? '#059669' : v > 0 ? '#D97706' : '#EF4444',
            fontVariantNumeric:'tabular-nums', fontSize:12, fontWeight:600,
          }}>
            {v}개
          </span>
        );
      case 'discountType':
        return (
          <span style={{
            display:'inline-block', padding:'2px 7px', borderRadius:10,
            fontSize:10.5, fontWeight:600,
            background: v === 'percent' ? '#EFF3FC' : '#D1FAE5',
            color: v === 'percent' ? C_BLUE : '#059669',
          }}>
            {v === 'percent' ? '정률' : '정액'}
          </span>
        );
      case 'discountValue':
        return (
          <span style={{color:C_INK, fontWeight:600, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.01em'}}>
            {item.type === 'percent' ? `${v}%` : new Intl.NumberFormat('ko-KR').format(v)}
          </span>
        );
      case 'toggle':
        return (
          <span style={{
            display:'inline-block', width:24, height:14, borderRadius:7,
            background: v ? '#10B981' : '#E5E7EB',
            position:'relative',
          }}>
            <span style={{
              position:'absolute', top:2, left: v ? 12 : 2,
              width:10, height:10, borderRadius:'50%', background:'#fff',
              transition:'left 0.15s',
            }}/>
          </span>
        );
      case 'combo': {
        if (!v) return <span style={{color:'#CBD5E1'}}>-</span>;
        const parts = v.split(/\s*\+\s*/);
        return (
          <div style={{display:'flex', flexWrap:'wrap', gap:4, alignItems:'center'}}>
            {parts.map((p, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span style={{color:C_MUTED, fontSize:11, fontWeight:600}}>+</span>}
                <span style={{
                  display:'inline-block', padding:'2px 7px', borderRadius:10,
                  background:'#F1F5F9', color:C_INK,
                  fontSize:11, fontWeight:500, letterSpacing:'-0.01em',
                }}>{p}</span>
              </React.Fragment>
            ))}
          </div>
        );
      }
      case 'text':
      default:
        return (
          <span style={{color: v ? C_MUTED : '#CBD5E1', fontSize:11.5, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', display:'block'}}>
            {v || '-'}
          </span>
        );
    }
  };

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
      display:'grid', gridTemplateColumns: gridCols,
      padding:'12px 14px', alignItems:'center',
      borderTop:`1px solid ${C_BORDER}`, fontSize:12.5,
      background: hover ? '#FBFCFE' : 'transparent',
    }}>
      <div style={{textAlign:'center', color:C_MUTED, fontWeight:600, fontVariantNumeric:'tabular-nums', fontSize:11}}>{index}</div>
      <div>
        <div style={{fontSize:13, color:C_INK, fontWeight:500}}>{item.name}</div>
        {item.desc && <div style={{fontSize:11, color:C_MUTED, marginTop:2}}>{item.desc}</div>}
        {item.note && !schema.cols.some(c => c.key === 'note') && <div style={{fontSize:11, color:C_MUTED, marginTop:2}}>{item.note}</div>}
      </div>
      {schema.cols.map((col, i) => (
        <div key={i} style={{textAlign: col.align || 'right'}}>
          {renderCell(col)}
        </div>
      ))}
      <div style={{textAlign:'center', color: C_MUTED, fontVariantNumeric:'tabular-nums', fontSize:11.5, opacity: hover ? 1 : 0.4, transition:'opacity 0.15s'}}>
        <button style={c_actionBtn}><IconNote size={11}/></button>
        <button style={{...c_actionBtn, marginLeft:4}}><IconX size={11}/></button>
      </div>
    </div>
  );
}

// 그리드 뷰 우측 대표값
function getGridRightValue(tab, it) {
  const fmt = (n) => new Intl.NumberFormat('ko-KR').format(n);
  if (tab === 'discount') {
    return { text: it.type === 'percent' ? `${it.value}%` : `-${fmt(it.value)}원`, dim: false };
  }
  if (tab === 'custom') {
    return { text: it.duration ? `${it.duration}분` : '-', dim: !it.duration };
  }
  if (tab === 'package') {
    return { text: `${it.sessions}회 · ${fmt(it.price)}`, dim: false };
  }
  // service, product
  return { text: it.price === 0 ? '0' : fmt(it.price), dim: !it.price };
}

// ─ 레이아웃 B: 그리드 (카테고리 카드 나열) ─
function C_MenuGrid({ tab, categories, items: allItems, search, onAddMenu, onEditCategory }) {
  return (
    <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12}}>
      {categories.map(cat => {
        const items = (allItems[cat.id] || []).filter(it =>
          !search || it.name.toLowerCase().includes(search.toLowerCase())
        );
        return (
          <div key={cat.id} style={{
            background:C_SURFACE, borderRadius:10, border:`1px solid ${C_BORDER}`,
            overflow:'hidden',
            borderTop:`3px solid ${cat.color}`,
            boxShadow:'0 1px 2px rgba(11,20,37,0.04)',
          }}>
            {/* 카테고리 헤더 (스크린샷 색상 밴드 스타일) */}
            <div style={{
              padding:'10px 12px',
              background: cat.color,
              color:'#fff',
              display:'flex', alignItems:'center', justifyContent:'space-between',
            }}>
              <div style={{fontSize:12.5, fontWeight:700, letterSpacing:'-0.01em'}}>
                {cat.name} <span style={{opacity:0.8, fontWeight:500}}>({items.length})</span>
              </div>
              <div style={{display:'flex', gap:3}}>
                <button
                  onClick={() => onEditCategory(cat)}
                  style={{
                  width:20, height:20, borderRadius:4, border:'none',
                  background:'rgba(255,255,255,0.2)', color:'#fff',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  cursor:'pointer', fontSize:11,
                }}>⋯</button>
              </div>
            </div>
            {/* 시술 리스트 */}
            <div>
              {items.length === 0 ? (
                <div style={{padding:'20px', textAlign:'center', color:C_MUTED, fontSize:11.5}}>
                  {search ? '검색 결과 없음' : '메뉴 없음'}
                </div>
              ) : (
                items.map((it, i) => {
                  const rightText = getGridRightValue(tab, it);
                  return (
                    <div key={it.id} style={{
                      padding:'8px 12px', borderTop: i > 0 ? `1px solid ${C_BORDER}` : 'none',
                      display:'flex', alignItems:'center', justifyContent:'space-between', gap:8,
                      fontSize:12,
                    }}>
                      <div style={{flex:1, minWidth:0}}>
                        <div style={{color:C_INK, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{it.name}</div>
                      </div>
                      <div style={{color: rightText.dim ? '#CBD5E1' : C_INK, fontWeight:600, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.01em', flexShrink:0}}>
                        {rightText.text}
                      </div>
                    </div>
                  );
                })
              )}
              {/* + 추가 */}
              <div onClick={onAddMenu} style={{
                padding:'8px 12px', borderTop:`1px dashed ${C_BORDER}`,
                fontSize:11, color:C_MUTED, textAlign:'center', cursor:'pointer',
                background:'#FBFCFE',
              }}>+ 항목 추가</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─ 레이아웃 C: 통합 테이블 ─
function C_MenuUnifiedTable({ search }) {
  const rows = [];
  MENU_CATEGORIES.forEach(cat => {
    (MENU_ITEMS[cat.id] || []).forEach(it => {
      if (!search || it.name.toLowerCase().includes(search.toLowerCase())) {
        rows.push({ cat, item: it });
      }
    });
  });

  return (
    <div style={{background:C_SURFACE, borderRadius:10, border:`1px solid ${C_BORDER}`, overflow:'hidden'}}>
      <div style={{padding:'14px 18px', borderBottom:`1px solid ${C_BORDER}`, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div>
          <div style={{fontSize:13, fontWeight:700, color:C_INK}}>전체 시술 메뉴</div>
          <div style={{fontSize:11.5, color:C_MUTED, marginTop:2}}>총 {rows.length}개 메뉴</div>
        </div>
      </div>
      <table style={{width:'100%', borderCollapse:'collapse', fontSize:12.5, fontVariantNumeric:'tabular-nums'}}>
        <thead>
          <tr style={{background:'#FBFCFE'}}>
            <th style={{...c_th, textAlign:'left', width:140}}>카테고리</th>
            <th style={{...c_th, textAlign:'left'}}>메뉴명</th>
            <th style={{...c_th, width:100}}>가격</th>
            <th style={{...c_th, width:90}}>소요시간</th>
            <th style={{...c_th, width:80, textAlign:'center'}}>액션</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({cat, item}, i) => (
            <tr key={`${cat.id}-${item.id}`} style={{borderTop:`1px solid ${C_BORDER}`}}>
              <td style={{padding:'10px 14px', fontSize:12}}>
                <span style={{display:'inline-flex', alignItems:'center', gap:5}}>
                  <span style={{width:7, height:7, borderRadius:2, background:cat.color}}/>
                  <span style={{color:C_INK, fontWeight:500}}>{cat.name}</span>
                </span>
              </td>
              <td style={{padding:'10px 14px', fontSize:13, color:C_INK}}>{item.name}</td>
              <td style={{padding:'10px 14px', textAlign:'right', fontWeight:600, color: item.price > 0 ? C_INK : '#CBD5E1'}}>
                {item.price === 0 ? '0' : new Intl.NumberFormat('ko-KR').format(item.price)}
              </td>
              <td style={{padding:'10px 14px', textAlign:'right', color: item.duration > 0 ? C_MUTED : '#CBD5E1', fontSize:11.5}}>
                {item.duration === 0 ? '-' : `${item.duration}분`}
              </td>
              <td style={{padding:'10px 14px', textAlign:'center'}}>
                <button style={c_actionBtn}><IconNote size={11}/></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─ 카테고리 등록 모달 ─
function C_CategoryModal({ cat, palette, onClose }) {
  palette = palette || MENU_COLOR_PALETTE;
  const [name, setName] = React.useState(cat?.name || '');
  const [color, setColor] = React.useState(cat?.color || palette[0]);
  const [checkin, setCheckin] = React.useState(cat?.checkin ?? false);
  const [active, setActive] = React.useState(cat?.active ?? true);

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(11,20,37,0.4)',
      zIndex:200, display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width:400, background:C_SURFACE, borderRadius:12,
        boxShadow:'0 16px 48px rgba(11,20,37,0.25)',
        overflow:'hidden',
      }}>
        <div style={{padding:'16px 20px 12px', borderBottom:`1px solid ${C_BORDER}`, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div style={{fontSize:15, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>
            시술 카테고리 {cat ? '수정' : '등록'}
          </div>
          <button onClick={onClose} style={{background:'none', border:'none', color:C_MUTED, cursor:'pointer', display:'flex'}}>
            <IconX size={16}/>
          </button>
        </div>

        <div style={{padding:'18px 20px', display:'flex', flexDirection:'column', gap:16}}>
          {/* 카테고리명 */}
          <div style={{display:'grid', gridTemplateColumns:'88px 1fr', alignItems:'center', gap:12}}>
            <label style={{fontSize:12, fontWeight:600, color:C_INK}}>
              카테고리명 <span style={{color:'#EF4444'}}>*</span>
            </label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="카테고리 제목을 입력해 주세요."
              style={{
                height:34, padding:'0 12px',
                border:`1px solid ${C_BORDER}`, borderRadius:6,
                fontSize:12.5, background:C_SURFACE, fontFamily:'inherit', outline:'none',
              }}/>
          </div>

          {/* 컬러값 지정 */}
          <div style={{display:'grid', gridTemplateColumns:'88px 1fr', alignItems:'start', gap:12}}>
            <label style={{fontSize:12, fontWeight:600, color:C_INK, marginTop:6}}>컬러값 지정</label>
            <div>
              {/* 프리뷰 바 */}
              <div style={{
                background: color, color:'#fff', borderRadius:6, padding:'8px 12px',
                fontSize:12.5, fontWeight:600, textAlign:'center', marginBottom:8,
                letterSpacing:'-0.01em',
              }}>
                {name || '카테고리명'}
              </div>
              {/* 팔레트 */}
              <div style={{display:'grid', gridTemplateColumns:'repeat(10, 1fr)', gap:5}}>
                {palette.map(c => (
                  <button key={c}
                    onClick={() => setColor(c)}
                    style={{
                    width:20, height:20, borderRadius:'50%',
                    background:c, border: color === c ? `2px solid ${C_INK}` : '2px solid transparent',
                    cursor:'pointer', padding:0,
                    boxShadow: color === c ? `0 0 0 2px ${c}44` : 'none',
                  }}/>
                ))}
              </div>
            </div>
          </div>

          {/* 체크인 노출 */}
          <div style={{display:'grid', gridTemplateColumns:'88px 1fr', alignItems:'center', gap:12}}>
            <label style={{fontSize:12, fontWeight:600, color:C_INK}}>체크인 노출</label>
            <C_Toggle checked={checkin} onChange={setCheckin}/>
          </div>

          {/* 사용 여부 */}
          <div style={{display:'grid', gridTemplateColumns:'88px 1fr', alignItems:'center', gap:12}}>
            <label style={{fontSize:12, fontWeight:600, color:C_INK}}>사용 여부</label>
            <C_Toggle checked={active} onChange={setActive} colorOn={C_BLUE}/>
          </div>
        </div>

        <div style={{
          padding:'12px 20px', borderTop:`1px solid ${C_BORDER}`, background:'#FBFCFE',
          display:'flex', gap:8, justifyContent:'flex-end',
        }}>
          {cat && (
            <button onClick={onClose} style={{
              padding:'8px 14px', background:C_SURFACE, color:'#EF4444',
              border:`1px solid ${C_BORDER}`, borderRadius:7, fontSize:12.5, fontWeight:500,
              cursor:'pointer', marginRight:'auto',
            }}>삭제</button>
          )}
          <button onClick={onClose} style={{...c_ghostBtn, padding:'8px 14px'}}>취소</button>
          <button onClick={onClose} style={{
            padding:'8px 16px', background:C_BLUE, color:'#fff',
            border:'none', borderRadius:7, fontSize:13, fontWeight:600, cursor:'pointer',
          }}>저장</button>
        </div>
      </div>
    </div>
  );
}

function C_Toggle({ checked, onChange, colorOn }) {
  return (
    <div onClick={() => onChange(!checked)} style={{
      width:34, height:20, borderRadius:10,
      background: checked ? (colorOn || '#10B981') : '#E5E7EB',
      position:'relative', cursor:'pointer', flexShrink:0,
      transition:'background 0.15s',
    }}>
      <div style={{
        position:'absolute', top:2, left: checked ? 16 : 2,
        width:16, height:16, borderRadius:'50%', background:'#fff',
        boxShadow:'0 1px 2px rgba(11,20,37,0.15)',
        transition:'left 0.15s',
      }}/>
    </div>
  );
}

// ─ 메뉴 등록 모달 ─
function C_MenuModal({ tab, categories, defaultCat, onClose }) {
  categories = categories || MENU_CATEGORIES;
  const [category, setCategory] = React.useState(defaultCat);
  const [name, setName] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [duration, setDuration] = React.useState('');
  const [desc, setDesc] = React.useState('');

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(11,20,37,0.4)',
      zIndex:200, display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width:440, background:C_SURFACE, borderRadius:12,
        boxShadow:'0 16px 48px rgba(11,20,37,0.25)',
        overflow:'hidden',
      }}>
        <div style={{padding:'16px 20px 12px', borderBottom:`1px solid ${C_BORDER}`, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div style={{fontSize:15, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>시술 메뉴 등록</div>
          <button onClick={onClose} style={{background:'none', border:'none', color:C_MUTED, cursor:'pointer', display:'flex'}}>
            <IconX size={16}/>
          </button>
        </div>

        <div style={{padding:'18px 20px', display:'flex', flexDirection:'column', gap:14}}>
          {/* 카테고리 */}
          <div>
            <div style={{fontSize:11.5, fontWeight:600, color:C_INK, marginBottom:6}}>카테고리 <span style={{color:'#EF4444'}}>*</span></div>
            <div style={{display:'flex', flexWrap:'wrap', gap:5}}>
              {categories.map(c => (
                <button key={c.id} onClick={() => setCategory(c.id)} style={{
                  padding:'5px 10px', fontSize:11.5, fontWeight:600,
                  border:`1px solid ${category === c.id ? c.color : C_BORDER}`,
                  background: category === c.id ? `${c.color}18` : C_SURFACE,
                  color: category === c.id ? C_INK : C_MUTED,
                  borderRadius:14, cursor:'pointer',
                  display:'inline-flex', alignItems:'center', gap:4,
                }}>
                  <span style={{width:6, height:6, borderRadius:'50%', background:c.color}}/>
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* 메뉴명 */}
          <div style={{display:'grid', gridTemplateColumns:'80px 1fr', alignItems:'center', gap:12}}>
            <label style={{fontSize:12, fontWeight:600, color:C_INK}}>메뉴명 <span style={{color:'#EF4444'}}>*</span></label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="메뉴 이름을 입력하세요"
              style={c_modalInput}/>
          </div>

          {/* 가격 / 소요시간 */}
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
            <div style={{display:'grid', gridTemplateColumns:'80px 1fr', alignItems:'center', gap:12}}>
              <label style={{fontSize:12, fontWeight:600, color:C_INK}}>가격</label>
              <div style={{position:'relative'}}>
                <input value={price} onChange={e => setPrice(e.target.value)}
                  type="number" placeholder="0"
                  style={{...c_modalInput, paddingRight:32, textAlign:'right'}}/>
                <span style={{position:'absolute', right:10, top:8, fontSize:12, color:C_MUTED}}>원</span>
              </div>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'80px 1fr', alignItems:'center', gap:12}}>
              <label style={{fontSize:12, fontWeight:600, color:C_INK}}>소요시간</label>
              <div style={{position:'relative'}}>
                <input value={duration} onChange={e => setDuration(e.target.value)}
                  type="number" placeholder="0"
                  style={{...c_modalInput, paddingRight:32, textAlign:'right'}}/>
                <span style={{position:'absolute', right:10, top:8, fontSize:12, color:C_MUTED}}>분</span>
              </div>
            </div>
          </div>

          {/* 설명 */}
          <div style={{display:'grid', gridTemplateColumns:'80px 1fr', alignItems:'start', gap:12}}>
            <label style={{fontSize:12, fontWeight:600, color:C_INK, marginTop:6}}>설명</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)}
              placeholder="시술 설명, 추가 정보 등 (선택)"
              rows={3}
              style={{
                padding:'8px 12px',
                border:`1px solid ${C_BORDER}`, borderRadius:6,
                fontSize:12.5, background:C_SURFACE, fontFamily:'inherit', outline:'none',
                resize:'vertical',
              }}/>
          </div>
        </div>

        <div style={{
          padding:'12px 20px', borderTop:`1px solid ${C_BORDER}`, background:'#FBFCFE',
          display:'flex', gap:8, justifyContent:'flex-end',
        }}>
          <button onClick={onClose} style={{...c_ghostBtn, padding:'8px 14px'}}>취소</button>
          <button onClick={onClose} style={{
            padding:'8px 16px', background:C_BLUE, color:'#fff',
            border:'none', borderRadius:7, fontSize:13, fontWeight:600, cursor:'pointer',
          }}>저장</button>
        </div>
      </div>
    </div>
  );
}

const c_th = {
  padding:'10px 12px', textAlign:'right', fontSize:11, fontWeight:600,
  color:'#5C6B84', letterSpacing:'0.02em',
  borderBottom:`1px solid ${C_BORDER}`,
};
const c_actionBtn = {
  width:22, height:22, borderRadius:5,
  background:C_SURFACE, border:`1px solid ${C_BORDER}`,
  color:C_MUTED, cursor:'pointer',
  display:'inline-flex', alignItems:'center', justifyContent:'center',
};
const c_modalInput = {
  height:32, padding:'0 12px',
  border:`1px solid ${C_BORDER}`, borderRadius:6,
  fontSize:12.5, background:C_SURFACE, fontFamily:'inherit', outline:'none',
};

window.C_SettingsMenuPage = C_SettingsMenuPage;
