// 스태프 관리 페이지 (설정 > 스태프 관리)

const {
  C_BLUE, C_BLUE_SOFT, C_INK, C_MUTED, C_BORDER, C_BG, C_SURFACE,
  c_ghostBtn, c_ghostBtnSm,
} = window;

// 근무일수 계산
function calcWorkDays(hireDate) {
  if (!hireDate || hireDate === '-') return null;
  const start = new Date(hireDate);
  const now = new Date(2026, 8, 17); // 오늘 (2026.09.17)
  const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

function C_StaffPage() {
  const [layout, setLayout] = React.useState('table'); // table | cards | list-detail
  const [statusFilter, setStatusFilter] = React.useState('all'); // all | active | resigned
  const [search, setSearch] = React.useState('');
  const [permModal, setPermModal] = React.useState(null); // staff obj | null
  const [detailModal, setDetailModal] = React.useState(null); // {mode:'edit', staff} | {mode:'new'} | null
  const [selectedId, setSelectedId] = React.useState(STAFF[0].id);

  const filtered = STAFF.filter(s => {
    if (statusFilter === 'active'   && s.status !== 'active' && s.status !== 'leave') return false;
    if (statusFilter === 'resigned' && s.status !== 'resigned') return false;
    if (search && !s.name.includes(search) && !s.phone.includes(search) && !s.loginId.includes(search)) return false;
    return true;
  });

  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden', background:C_BG}}>
      <div style={{width: 948, flexShrink: 0, flex:1, display:'flex', flexDirection:'column', minHeight:0}}>
        <C_StaffSubHeader
          layout={layout} setLayout={setLayout}
          statusFilter={statusFilter} setStatusFilter={setStatusFilter}
          search={search} setSearch={setSearch}
          totalCount={STAFF.length} filteredCount={filtered.length}
          onNew={() => setDetailModal({mode:'new'})}
        />
        <div style={{flex:1, overflow:'hidden', display:'flex', minHeight:0}}>
          {layout === 'table' && (
            <div style={{flex:1, overflow:'auto', padding:'16px 12px'}}>
              <C_StaffTable staff={filtered} onOpenPerm={setPermModal} onRowClick={setDetailModal}/>
            </div>
          )}
          {layout === 'cards' && (
            <div style={{flex:1, overflow:'auto', padding:'16px 20px'}}>
              <C_StaffCards staff={filtered} onOpenPerm={setPermModal}
                onRowClick={(s) => setDetailModal({mode:'edit', staff:s})}/>
            </div>
          )}
          {layout === 'list-detail' && (
            <C_StaffListDetail
              staff={filtered}
              selectedId={selectedId} setSelectedId={setSelectedId}
              onOpenPerm={setPermModal}
              onOpenDetail={(s) => setDetailModal({mode:'edit', staff:s})}
            />
          )}
        </div>
      </div>

      {permModal && (
        <C_PermissionModal staff={permModal} onClose={() => setPermModal(null)}/>
      )}
      {detailModal && (
        <C_StaffDetailModal
          mode={detailModal.mode}
          staff={detailModal.staff}
          onClose={() => setDetailModal(null)}
          onOpenPerm={(s) => setPermModal(s)}
        />
      )}
    </div>
  );
}

// ─ 서브헤더 ─
function C_StaffSubHeader({ layout, setLayout, statusFilter, setStatusFilter, search, setSearch, totalCount, filteredCount, onNew }) {
  return (
    <>
      <div style={{
        display:'flex', alignItems:'center', gap:8,
        padding:'10px 14px', background:C_SURFACE, borderBottom:`1px solid ${C_BORDER}`,
      }}>
        <div style={{fontSize:12.5, color:C_MUTED, flexShrink:0}}>
          홈 <span style={{margin:'0 6px'}}>›</span>
          <span>설정</span>
          <span style={{margin:'0 6px'}}>›</span>
          <span style={{color:C_INK, fontWeight:600}}>스태프 관리</span>
        </div>

        {/* 검색 */}
        <div style={{position:'relative', width:220, marginLeft:16, flexShrink:0}}>
          <IconSearch size={12} style={{position:'absolute', left:10, top:9, color:C_MUTED}}/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="전화번호 또는 닉네임..." style={{
              height:30, padding:'0 10px 0 30px', width:'100%',
              border:`1px solid ${C_BORDER}`, borderRadius:15,
              fontSize:12, background:C_BG, color:C_INK,
              fontFamily:'inherit', outline:'none',
            }}/>
        </div>

        {/* 상태 필터 pill 탭 */}
        <div style={{display:'flex', gap:5, flexShrink:0}}>
          {[
            { id:'all',      label:'전체' },
            { id:'active',   label:'근무중' },
            { id:'resigned', label:'해지' },
          ].map(t => (
            <button key={t.id} onClick={() => setStatusFilter(t.id)} style={{
              padding:'5px 14px', fontSize:12, fontWeight:600,
              border:`1px solid ${statusFilter===t.id ? C_BLUE : C_BORDER}`,
              background: statusFilter===t.id ? C_BLUE_SOFT : C_SURFACE,
              color: statusFilter===t.id ? C_BLUE : C_MUTED,
              borderRadius:14, cursor:'pointer', fontFamily:'inherit',
            }}>{t.label}</button>
          ))}
        </div>

        <div style={{flex:1}}/>

        {/* 카운트 */}
        <div style={{fontSize:11.5, color:C_MUTED, fontVariantNumeric:'tabular-nums', flexShrink:0}}>
          {filteredCount}<span style={{color:C_BORDER, margin:'0 3px'}}>/</span>{totalCount}명
        </div>

        {/* 레이아웃 스위치 */}
        <div style={{display:'flex', background:C_BG, borderRadius:7, padding:2, border:`1px solid ${C_BORDER}`, flexShrink:0}}>
          {[
            { id:'table',       label:'테이블' },
            { id:'cards',       label:'카드' },
            { id:'list-detail', label:'상세' },
          ].map(v => (
            <button key={v.id} onClick={() => setLayout(v.id)} style={{
              padding:'5px 10px', fontSize:11.5, fontWeight:600,
              border:'none', borderRadius:5, cursor:'pointer',
              background: layout===v.id ? C_SURFACE : 'transparent',
              color: layout===v.id ? C_INK : C_MUTED,
              boxShadow: layout===v.id ? '0 1px 2px rgba(11,20,37,0.06)' : 'none',
              fontFamily:'inherit',
            }}>{v.label}</button>
          ))}
        </div>

        {/* 신규 등록 */}
        <button onClick={onNew} style={{
          display:'flex', alignItems:'center', gap:6,
          padding:'7px 14px', background: 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)',
          color:'#fff', border:'none', borderRadius:20, fontSize:12.5, fontWeight:700,
          cursor:'pointer', boxShadow:'0 2px 6px rgba(124,58,237,0.35)',
          flexShrink:0, whiteSpace:'nowrap',
          fontFamily:'inherit',
        }}>
          <IconUser size={13}/> 신규 등록
        </button>
      </div>
    </>
  );
}

// ─ 권한 상태 칩 ─
function PermRoleChip({ role }) {
  const cfg = {
    admin:    { label:'관리자',   bg:'#EFF3FC', color:'#1E40AF', dot:'#3B82F6' },
    designer: { label:'디자이너', bg:'#F5F3FF', color:'#6D28D9', dot:'#8B5CF6' },
    intern:   { label:'인턴',     bg:'#F1F5F9', color:'#475569', dot:'#94A3B8' },
    custom:   { label:'커스텀',   bg:'#FFF7ED', color:'#C2410C', dot:'#F97316' },
  }[role] || { label:'-', bg:'transparent', color:'#CBD5E1', dot:'#CBD5E1' };
  if (!role) return <span style={{color:'#CBD5E1', fontSize:11}}>-</span>;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      padding:'3px 9px', borderRadius:12,
      background: cfg.bg, color: cfg.color,
      fontSize:11, fontWeight:700, letterSpacing:'-0.01em',
    }}>
      <span style={{width:5, height:5, borderRadius:'50%', background:cfg.dot}}/>
      {cfg.label}
    </span>
  );
}

// ─ 상태 컬러 칩 ─
function StatusChip({ status }) {
  const cfg = {
    active:   { label:'근무',  bg:'#D1FAE5', color:'#059669', dot:'#10B981' },
    leave:    { label:'휴직',  bg:'#F1F5F9', color:'#64748B', dot:'#94A3B8' },
    resigned: { label:'해지',  bg:'#FEE2E2', color:'#DC2626', dot:'#EF4444' },
  }[status] || { label:status, bg:'#F1F5F9', color:'#64748B', dot:'#94A3B8' };
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      padding:'3px 9px', borderRadius:12,
      background: cfg.bg, color: cfg.color,
      fontSize:11, fontWeight:700, letterSpacing:'-0.01em',
    }}>
      <span style={{width:5, height:5, borderRadius:'50%', background:cfg.dot}}/>
      {cfg.label}
    </span>
  );
}

// ─ 테이블 뷰 ─
function C_StaffTable({ staff, onOpenPerm, onRowClick }) {
  // 13 columns — 총 884px 이내 (page 948 - padding 40 - inner 24)
  // 32+72+72+56+82+100+118+118+62+72+34+34+38 = 890 → 조금 여유 있게 재분배
  const cols = '32px 72px 72px 54px 82px 100px 116px 116px 62px 72px 34px 40px 36px';
  return (
    <div style={{background:C_SURFACE, borderRadius:10, border:`1px solid ${C_BORDER}`, overflow:'hidden'}}>
      {/* 헤더 */}
      <div style={{
        display:'grid', gridTemplateColumns: cols,
        padding:'10px 12px', background:'#FBFCFE',
        borderBottom:`1px solid ${C_BORDER}`,
        fontSize:10.5, fontWeight:700, color:C_MUTED, letterSpacing:'0.02em',
      }}>
        <div style={{textAlign:'center'}}>번호</div>
        <div>스태프명</div>
        <div>디자이너명</div>
        <div>직급</div>
        <div>아이디</div>
        <div>전화번호</div>
        <div>입사일(근무일수)</div>
        <div>퇴사일(해지)</div>
        <div style={{textAlign:'center'}}>근무상태</div>
        <div style={{textAlign:'center'}}>권한</div>
        <div style={{textAlign:'center'}}>체크인</div>
        <div style={{textAlign:'center'}}>플랜더</div>
        <div style={{textAlign:'center'}}>설정</div>
      </div>
      {/* 행 */}
      {staff.map((s, i) => {
        const workDays = calcWorkDays(s.hireDate);
        const isDim = s.status === 'resigned';
        return (
          <div key={s.id}
               onClick={() => onRowClick && onRowClick(s)}
               className="c-staff-row"
               style={{
            display:'grid', gridTemplateColumns: cols,
            padding:'12px 12px', alignItems:'center',
            borderTop:`1px solid ${C_BORDER}`,
            fontSize:12, opacity: isDim ? 0.72 : 1,
            background: isDim ? '#FBFCFE' : 'transparent',
            cursor: onRowClick ? 'pointer' : 'default',
            transition:'background 0.12s',
          }}>
            <div style={{textAlign:'center', color:C_MUTED, fontWeight:600, fontSize:11, fontVariantNumeric:'tabular-nums'}}>{i+1}</div>
            <div style={{color:C_INK, fontWeight:600}}>
              {s.name}
              {s.isOwner && <span style={{marginLeft:4, fontSize:9, fontWeight:700, color:'#D97706', background:'#FEF3C7', padding:'1px 5px', borderRadius:8}}>원장</span>}
            </div>
            <div style={{color: s.designerName.startsWith('_') ? C_MUTED : C_INK, fontStyle: s.designerName.startsWith('_') ? 'italic' : 'normal'}}>
              {s.designerName}
            </div>
            <div style={{color:C_MUTED}}>{s.role}</div>
            <div style={{color:C_MUTED, fontVariantNumeric:'tabular-nums', fontFamily:'ui-monospace, monospace', fontSize:11.5}}>
              {s.loginId || '-'}
            </div>
            <div style={{color: s.phone === '-' ? '#CBD5E1' : C_MUTED, fontVariantNumeric:'tabular-nums', fontSize:11.5}}>
              {s.phone}
            </div>
            <div style={{color: s.hireDate === '-' ? '#CBD5E1' : C_INK, fontVariantNumeric:'tabular-nums', fontSize:11.5}}>
              {s.hireDate === '-' ? '-' : (
                <>
                  {s.hireDate}
                  {workDays != null && <span style={{color:C_MUTED, marginLeft:4}}>({workDays}일)</span>}
                </>
              )}
            </div>
            <div style={{color: s.resignDate ? '#DC2626' : '#CBD5E1', fontVariantNumeric:'tabular-nums', fontSize:11.5}}>
              {s.resignDate || '-'}
            </div>
            <div style={{textAlign:'center'}}>
              <StatusChip status={s.status}/>
            </div>
            <div style={{textAlign:'center'}}>
              <PermRoleChip role={s.permissionRole}/>
            </div>
            <div style={{textAlign:'center', color:C_MUTED}}>{s.checkin ? '✓' : '-'}</div>
            <div style={{textAlign:'center', color:C_MUTED}}>{s.floater ? '✓' : '-'}</div>
            <div style={{textAlign:'center'}}>
              <button onClick={(e) => { e.stopPropagation(); onOpenPerm(s); }} title="권한 설정" style={{
                width:26, height:26, borderRadius:6,
                border:`1px solid ${C_BORDER}`, background:C_SURFACE,
                color:C_MUTED, cursor:'pointer',
                display:'inline-flex', alignItems:'center', justifyContent:'center',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C_BLUE; e.currentTarget.style.color = C_BLUE; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C_BORDER; e.currentTarget.style.color = C_MUTED; }}
              >
                <IconSettings size={13}/>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─ 카드 그리드 ─
function C_StaffCards({ staff, onOpenPerm, onRowClick }) {
  return (
    <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12}}>
      {staff.map(s => {
        const workDays = calcWorkDays(s.hireDate);
        const isDim = s.status === 'resigned';
        const designer = DESIGNERS.find(d => d.name === s.name);
        const color = designer?.color || '#94A3B8';
        return (
          <div key={s.id}
               onClick={() => onRowClick && onRowClick(s)}
               style={{
            background:C_SURFACE, borderRadius:10, border:`1px solid ${C_BORDER}`,
            borderTop:`3px solid ${color}`,
            padding:'14px 14px', opacity: isDim ? 0.7 : 1,
            display:'flex', flexDirection:'column', gap:10,
            cursor: onRowClick ? 'pointer' : 'default',
            transition:'box-shadow 0.12s, transform 0.06s',
          }}
          onMouseEnter={e => { if (onRowClick) e.currentTarget.style.boxShadow = '0 4px 12px rgba(11,20,37,0.08)'; }}
          onMouseLeave={e => { if (onRowClick) e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{display:'flex', alignItems:'center', gap:10}}>
              <div style={{
                width:36, height:36, borderRadius:'50%',
                background: color, color:'#fff',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:14, fontWeight:700, flexShrink:0,
              }}>{s.name.charAt(0)}</div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:14, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>
                  {s.name}
                </div>
                <div style={{fontSize:11, color:C_MUTED, marginTop:2}}>{s.role}</div>
              </div>
              <div style={{display:'flex', flexDirection:'column', gap:4, alignItems:'flex-end'}}>
                <StatusChip status={s.status}/>
                <PermRoleChip role={s.permissionRole}/>
              </div>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:4, fontSize:11.5}}>
              <div style={{display:'flex', justifyContent:'space-between'}}>
                <span style={{color:C_MUTED}}>아이디</span>
                <span style={{color:C_INK, fontFamily:'ui-monospace, monospace'}}>{s.loginId}</span>
              </div>
              <div style={{display:'flex', justifyContent:'space-between'}}>
                <span style={{color:C_MUTED}}>전화</span>
                <span style={{color:C_INK, fontVariantNumeric:'tabular-nums'}}>{s.phone}</span>
              </div>
              <div style={{display:'flex', justifyContent:'space-between'}}>
                <span style={{color:C_MUTED}}>입사일</span>
                <span style={{color:C_INK, fontVariantNumeric:'tabular-nums'}}>
                  {s.hireDate === '-' ? '-' : `${s.hireDate}${workDays!=null ? ` (${workDays}일)` : ''}`}
                </span>
              </div>
              {s.resignDate && (
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <span style={{color:C_MUTED}}>퇴사일</span>
                  <span style={{color:'#DC2626', fontVariantNumeric:'tabular-nums'}}>{s.resignDate}</span>
                </div>
              )}
            </div>
            <button onClick={(e) => { e.stopPropagation(); onOpenPerm(s); }} style={{
              padding:'8px 12px', border:`1px solid ${C_BORDER}`, borderRadius:7,
              background:C_SURFACE, color:C_INK, cursor:'pointer',
              fontSize:12, fontWeight:600,
              display:'inline-flex', alignItems:'center', justifyContent:'center', gap:5,
              fontFamily:'inherit',
            }}>
              <IconSettings size={12}/> 권한 설정
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─ 좌우 리스트+상세 ─
function C_StaffListDetail({ staff, selectedId, setSelectedId, onOpenPerm, onOpenDetail }) {
  const cur = staff.find(s => s.id === selectedId) || staff[0];
  return (
    <>
      <div style={{
        width:240, flexShrink:0,
        background:C_SURFACE, borderRight:`1px solid ${C_BORDER}`,
        display:'flex', flexDirection:'column', minHeight:0,
      }}>
        <div style={{flex:1, overflowY:'auto', padding:'8px'}}>
          {staff.map(s => {
            const active = s.id === cur?.id;
            const designer = DESIGNERS.find(d => d.name === s.name);
            const color = designer?.color || '#94A3B8';
            return (
              <div key={s.id}
                   onClick={() => setSelectedId(s.id)}
                   style={{
                padding:'10px 12px', borderRadius:7,
                display:'flex', alignItems:'center', gap:10,
                cursor:'pointer',
                background: active ? C_BLUE_SOFT : 'transparent',
                marginBottom:2,
              }}>
                <div style={{
                  width:26, height:26, borderRadius:'50%',
                  background: color, color:'#fff',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:11, fontWeight:700, flexShrink:0,
                }}>{s.name.charAt(0)}</div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:13, fontWeight: active ? 700 : 600, color:C_INK}}>{s.name}</div>
                  <div style={{fontSize:10.5, color:C_MUTED, marginTop:1}}>{s.role} · {s.loginId}</div>
                </div>
                <StatusChip status={s.status}/>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{flex:1, overflow:'auto', padding:'16px 20px', background:C_BG}}>
        {cur && <C_StaffDetail staff={cur} onOpenPerm={onOpenPerm} onOpenDetail={onOpenDetail}/>}
      </div>
    </>
  );
}

function C_StaffDetail({ staff, onOpenPerm, onOpenDetail }) {
  const workDays = calcWorkDays(staff.hireDate);
  const designer = DESIGNERS.find(d => d.name === staff.name);
  const color = designer?.color || '#94A3B8';
  return (
    <div style={{display:'flex', flexDirection:'column', gap:14}}>
      <div style={{background:C_SURFACE, borderRadius:10, border:`1px solid ${C_BORDER}`, padding:'18px 20px', display:'flex', alignItems:'center', gap:14}}>
        <div style={{
          width:56, height:56, borderRadius:'50%',
          background: color, color:'#fff',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:20, fontWeight:700, boxShadow:`0 2px 8px ${color}55`,
        }}>{staff.name.charAt(0)}</div>
        <div style={{flex:1}}>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <h2 style={{margin:0, fontSize:18, fontWeight:700, color:C_INK, letterSpacing:'-0.02em'}}>{staff.name}</h2>
            <StatusChip status={staff.status}/>
            <PermRoleChip role={staff.permissionRole}/>
          </div>
          <div style={{fontSize:12.5, color:C_MUTED, marginTop:4}}>{staff.role} · @{staff.loginId}</div>
        </div>
        <div style={{display:'flex', gap:6}}>
          <button onClick={() => onOpenDetail && onOpenDetail(staff)} style={{
            padding:'8px 14px', background:C_SURFACE, color:C_INK, border:`1px solid ${C_BORDER}`, borderRadius:7,
            fontSize:12.5, fontWeight:600, cursor:'pointer',
            display:'inline-flex', alignItems:'center', gap:6, fontFamily:'inherit',
          }}>
            <IconNote size={12}/> 상세 편집
          </button>
          <button onClick={() => onOpenPerm(staff)} style={{
            padding:'8px 14px', background:C_BLUE, color:'#fff', border:'none', borderRadius:7,
            fontSize:12.5, fontWeight:600, cursor:'pointer',
            display:'inline-flex', alignItems:'center', gap:6, fontFamily:'inherit',
            boxShadow:'0 1px 2px rgba(30,64,175,0.2)',
          }}>
            <IconSettings size={12}/> 권한 설정
          </button>
        </div>
      </div>
      <div style={{background:C_SURFACE, borderRadius:10, border:`1px solid ${C_BORDER}`, padding:'16px 20px'}}>
        <div style={{fontSize:12, fontWeight:700, color:C_MUTED, letterSpacing:'0.02em', marginBottom:10}}>기본 정보</div>
        <div style={{display:'grid', gridTemplateColumns:'100px 1fr', gap:'8px 16px', fontSize:12.5}}>
          <span style={{color:C_MUTED}}>디자이너명</span><span style={{color:C_INK}}>{staff.designerName}</span>
          <span style={{color:C_MUTED}}>전화번호</span><span style={{color:C_INK, fontVariantNumeric:'tabular-nums'}}>{staff.phone}</span>
          <span style={{color:C_MUTED}}>입사일</span><span style={{color:C_INK, fontVariantNumeric:'tabular-nums'}}>{staff.hireDate === '-' ? '-' : `${staff.hireDate}${workDays!=null ? ` · 근무 ${workDays}일` : ''}`}</span>
          {staff.resignDate && <><span style={{color:C_MUTED}}>퇴사일</span><span style={{color:'#DC2626', fontVariantNumeric:'tabular-nums'}}>{staff.resignDate}</span></>}
          <span style={{color:C_MUTED}}>체크인 노출</span><span style={{color:staff.checkin ? '#059669' : C_MUTED}}>{staff.checkin ? '노출' : '숨김'}</span>
          <span style={{color:C_MUTED}}>플랜더</span><span style={{color:staff.floater ? C_BLUE : C_MUTED}}>{staff.floater ? '지정' : '미지정'}</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// 권한 설정 모달
// ─────────────────────────────────────────
function C_PermissionModal({ staff, onClose }) {
  // 초기 권한: 역할별 프리셋 (원장이면 admin, 인턴이면 intern, 나머지는 designer)
  const initialPreset = staff.isOwner ? 'admin' : staff.role === '인턴' ? 'intern' : 'designer';
  const [preset, setPreset] = React.useState(initialPreset);
  const [perms, setPerms] = React.useState(ROLE_PRESETS[initialPreset].perms);

  const togglePerm = (id) => {
    setPreset('custom');
    setPerms(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const applyPreset = (p) => {
    setPreset(p);
    setPerms(ROLE_PRESETS[p].perms.slice());
  };

  const toggleSection = (sec) => {
    setPreset('custom');
    const secIds = sec.items.map(it => it.id);
    const allOn = secIds.every(id => perms.includes(id));
    setPerms(prev => allOn
      ? prev.filter(id => !secIds.includes(id))
      : Array.from(new Set([...prev, ...secIds])));
  };

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(11,20,37,0.5)',
      zIndex:200, display:'flex', alignItems:'center', justifyContent:'center',
      padding:20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width:520, maxHeight:'88vh', background:C_SURFACE, borderRadius:14,
        boxShadow:'0 24px 64px rgba(11,20,37,0.28)',
        display:'flex', flexDirection:'column', overflow:'hidden',
      }}>
        {/* 헤더 */}
        <div style={{padding:'18px 22px 14px', borderBottom:`1px solid ${C_BORDER}`, display:'flex', alignItems:'center', gap:10}}>
          <div style={{
            width:34, height:34, borderRadius:'50%',
            background: C_BLUE_SOFT, color:C_BLUE,
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
          }}>
            <IconSettings size={16}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:15, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>스태프 권한 설정</div>
            <div style={{fontSize:11.5, color:C_MUTED, marginTop:2}}>
              <strong style={{fontWeight:700, color:C_INK}}>{staff.name}</strong> · {staff.role}
              {staff.loginId && <> · @{staff.loginId}</>}
            </div>
          </div>
          <button onClick={onClose} style={{
            width:28, height:28, borderRadius:7, border:'none',
            background:'transparent', color:C_MUTED, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}><IconX size={16}/></button>
        </div>

        {/* 역할 프리셋 탭 */}
        <div style={{padding:'12px 22px', borderBottom:`1px solid ${C_BORDER}`, background:'#FBFCFE'}}>
          <div style={{fontSize:10.5, color:C_MUTED, fontWeight:700, letterSpacing:'0.06em', marginBottom:8}}>역할 프리셋</div>
          <div style={{display:'flex', gap:5}}>
            {Object.entries(ROLE_PRESETS).map(([id, cfg]) => (
              <button key={id} onClick={() => applyPreset(id)} style={{
                padding:'6px 14px', fontSize:12, fontWeight:600,
                border:`1px solid ${preset===id ? C_BLUE : C_BORDER}`,
                background: preset===id ? C_BLUE_SOFT : C_SURFACE,
                color: preset===id ? C_BLUE : C_MUTED,
                borderRadius:14, cursor:'pointer', fontFamily:'inherit',
              }}>{cfg.label}</button>
            ))}
          </div>
        </div>

        {/* 권한 트리 */}
        <div style={{flex:1, overflow:'auto', padding:'8px 22px 14px'}}>
          {PERMISSION_TREE.map(sec => {
            const secIds = sec.items.map(it => it.id);
            const checkedCount = secIds.filter(id => perms.includes(id)).length;
            const allOn = checkedCount === secIds.length;
            const partial = checkedCount > 0 && !allOn;
            const isBasic = sec.id === 'basic';
            return (
              <div key={sec.id} style={{
                padding:'12px 0',
                borderBottom: `1px solid ${C_BORDER}`,
              }}>
                {/* 섹션 헤더 */}
                <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
                  <button onClick={() => toggleSection(sec)} style={{
                    width:18, height:18, borderRadius:4,
                    border:`1.5px solid ${allOn || partial ? C_BLUE : C_BORDER}`,
                    background: allOn ? C_BLUE : partial ? C_BLUE_SOFT : C_SURFACE,
                    cursor:'pointer', padding:0,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    flexShrink:0,
                  }}>
                    {allOn && <IconCheck size={11} style={{color:'#fff'}}/>}
                    {partial && <span style={{width:8, height:2, background:C_BLUE, borderRadius:1}}/>}
                  </button>
                  <div style={{
                    fontSize:13, fontWeight:700, color:C_INK, letterSpacing:'-0.01em',
                    display:'flex', alignItems:'center', gap:6,
                  }}>
                    {sec.title}
                    {isBasic && (
                      <span style={{
                        fontSize:9.5, fontWeight:700, color:'#D97706',
                        background:'#FEF3C7', padding:'2px 6px', borderRadius:8,
                        letterSpacing:'0.02em',
                      }}>기본</span>
                    )}
                  </div>
                  <span style={{fontSize:11, color:C_MUTED, fontVariantNumeric:'tabular-nums'}}>
                    {checkedCount}/{secIds.length}
                  </span>
                </div>
                {/* 소메뉴 체크박스들 */}
                <div style={{
                  display:'grid', gridTemplateColumns: isBasic ? '1fr' : 'repeat(2, 1fr)',
                  gap:'6px 12px', paddingLeft:26,
                }}>
                  {sec.items.map(it => {
                    const on = perms.includes(it.id);
                    return (
                      <label key={it.id} style={{
                        display:'flex', alignItems:'center', gap:8,
                        padding:'6px 8px', borderRadius:6,
                        cursor:'pointer', fontSize:12.5,
                        color:C_INK,
                        transition:'background 0.12s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <button onClick={(e) => { e.preventDefault(); togglePerm(it.id); }} style={{
                          width:16, height:16, borderRadius:4,
                          border:`1.5px solid ${on ? C_BLUE : C_BORDER}`,
                          background: on ? C_BLUE : C_SURFACE,
                          cursor:'pointer', padding:0,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          flexShrink:0,
                        }}>
                          {on && <IconCheck size={10} style={{color:'#fff'}}/>}
                        </button>
                        <span>{it.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* 푸터 */}
        <div style={{
          padding:'12px 22px', borderTop:`1px solid ${C_BORDER}`, background:'#FBFCFE',
          display:'flex', gap:8, justifyContent:'space-between', alignItems:'center',
        }}>
          <div style={{fontSize:11.5, color:C_MUTED}}>
            총 <strong style={{color:C_INK, fontWeight:700}}>{perms.length}</strong>개 권한 활성
          </div>
          <div style={{display:'flex', gap:8}}>
            <button onClick={onClose} style={{...c_ghostBtn, padding:'8px 14px'}}>취소</button>
            <button onClick={onClose} style={{
              padding:'8px 20px', background:C_BLUE, color:'#fff',
              border:'none', borderRadius:7, fontSize:13, fontWeight:600, cursor:'pointer',
              boxShadow:'0 1px 2px rgba(30,64,175,0.2)',
            }}>저장</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// 신규 등록 모달
// ─────────────────────────────────────────
// ─────────────────────────────────────────
// 스태프 상세 / 신규 등록 통합 모달 (큰 오버레이 + 탭)
// ─────────────────────────────────────────
function C_StaffDetailModal({ mode, staff: initial, onClose, onOpenPerm }) {
  const isNew = mode === 'new';
  const s = initial || {};

  // 정보 탭
  const [name, setName] = React.useState(s.name || '');
  const [designerName, setDesignerName] = React.useState(s.designerName || '');
  const [role, setRole] = React.useState(s.role || '디자이너');
  const [loginId, setLoginId] = React.useState(s.loginId || '');
  const [phone, setPhone] = React.useState(s.phone && s.phone !== '-' ? s.phone : '');
  const [status, setStatus] = React.useState(s.status || 'active');
  const [gender, setGender] = React.useState('none');
  const [bio, setBio] = React.useState('');
  const [mbti, setMbti] = React.useState('선택안함');
  const [birth, setBirth] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [addressDetail, setAddressDetail] = React.useState('');
  const [floaterLink, setFloaterLink] = React.useState('');
  const [memo, setMemo] = React.useState('');

  // 근무 탭
  const [hireDate, setHireDate] = React.useState(s.hireDate && s.hireDate !== '-' ? s.hireDate : (isNew ? '2026-09-17' : ''));
  const [workType, setWorkType] = React.useState('long'); // long | short
  const [dutyDays, setDutyDays] = React.useState(['월','화','수','목','금','토']);
  const [workStart, setWorkStart] = React.useState('10:00');
  const [workEnd, setWorkEnd] = React.useState('20:00');
  const [checkin, setCheckin] = React.useState(s.checkin ?? true);

  // 계좌 탭
  const [bank, setBank] = React.useState('');
  const [account, setAccount] = React.useState('');
  const [accountName, setAccountName] = React.useState('');
  const [ssn, setSsn] = React.useState('');

  const [tab, setTab] = React.useState('info'); // info | duty | account | terms
  const [showResignConfirm, setShowResignConfirm] = React.useState(false);

  const canSave = name.trim() && designerName.trim() && role;
  const designer = DESIGNERS.find(d => d.name === s.name);
  const color = designer?.color || '#94A3B8';

  const toggleDay = (d) => {
    setDutyDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(11,20,37,0.5)',
      zIndex:200, display:'flex', alignItems:'center', justifyContent:'center',
      padding:16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width:940, maxWidth:'96vw', maxHeight:'94vh',
        background:C_SURFACE, borderRadius:14,
        boxShadow:'0 24px 64px rgba(11,20,37,0.28)',
        display:'flex', flexDirection:'column', overflow:'hidden',
      }}>
        {/* 헤더 */}
        <div style={{
          padding:'14px 22px 12px', borderBottom:`1px solid ${C_BORDER}`,
          display:'flex', alignItems:'center', gap:14, background:'#FBFCFE',
        }}>
          <div style={{fontSize:12.5, color:C_MUTED, flexShrink:0}}>
            홈 <span style={{margin:'0 6px'}}>›</span>
            <span>스태프 관리</span>
            <span style={{margin:'0 6px'}}>›</span>
            <span style={{color:C_INK, fontWeight:600}}>{isNew ? '신규 등록' : '스태프 상세'}</span>
          </div>
          <div style={{flex:1}}/>
          <button onClick={onClose} style={{
            width:28, height:28, borderRadius:7, border:'none',
            background:'transparent', color:C_MUTED, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}><IconX size={16}/></button>
        </div>

        {/* 상단 요약 카드 */}
        <div style={{
          padding:'14px 22px', display:'flex', alignItems:'center', gap:14,
          borderBottom:`1px solid ${C_BORDER}`,
        }}>
          <div style={{
            width:48, height:48, borderRadius:'50%',
            background: isNew ? '#E5EAF2' : color, color:'#fff',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:18, fontWeight:700,
            boxShadow: isNew ? 'none' : `0 2px 8px ${color}55`,
            flexShrink:0,
          }}>{isNew ? '?' : (name.charAt(0) || '?')}</div>
          <div style={{flex:1, minWidth:0}}>
            <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
              <div style={{fontSize:17, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>
                {isNew ? '스태프 신규 등록' : (name || '(이름 없음)')}
              </div>
              {!isNew && <StatusChip status={status}/>}
              {!isNew && <PermRoleChip role={s.permissionRole}/>}
            </div>
            <div style={{fontSize:12, color:C_MUTED, marginTop:4}}>
              {isNew ? '계정 정보와 근무 조건을 입력하세요' : `${role} · @${loginId || '아이디 없음'}`}
            </div>
          </div>
          {!isNew && (
            <button onClick={() => onOpenPerm && onOpenPerm({...s, name, role})} style={{
              padding:'8px 14px', background:C_BLUE_SOFT, color:C_BLUE,
              border:`1px solid ${C_BLUE}55`, borderRadius:7,
              fontSize:12, fontWeight:600, cursor:'pointer',
              display:'inline-flex', alignItems:'center', gap:6, fontFamily:'inherit',
            }}>
              <IconSettings size={12}/> 권한 설정
            </button>
          )}
        </div>

        {/* 탭 */}
        <div style={{
          display:'flex', alignItems:'center', gap:2,
          padding:'0 22px', background:C_SURFACE, borderBottom:`1px solid ${C_BORDER}`,
        }}>
          {[
            { id:'info',    label:'기본 정보' },
            { id:'duty',    label:'근무 조건' },
            { id:'account', label:'계좌 · 세무' },
            { id:'terms',   label:'약관 · 동의' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding:'11px 16px', fontSize:12.5, fontWeight: tab===t.id ? 700 : 500,
              border:'none', background:'transparent',
              color: tab===t.id ? C_BLUE : C_MUTED, cursor:'pointer',
              borderBottom: tab===t.id ? `2px solid ${C_BLUE}` : '2px solid transparent',
              marginBottom:-1, letterSpacing:'-0.01em',
              fontFamily:'inherit',
            }}>{t.label}</button>
          ))}
        </div>

        {/* 본문 */}
        <div style={{flex:1, overflow:'auto', padding:'20px 22px', background:C_BG}}>
          {tab === 'info' && (
            <div style={{display:'grid', gridTemplateColumns:'280px 1fr', gap:20}}>
              {/* 좌: 프로필 사진 */}
              <div>
                <div style={{fontSize:11.5, fontWeight:700, color:C_MUTED, letterSpacing:'0.02em', marginBottom:8}}>프로필 사진</div>
                <div style={{
                  aspectRatio:'1/1', background:'#D6DCE5',
                  borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center',
                  border:`1px solid ${C_BORDER}`,
                }}>
                  <div style={{
                    width:70, height:70, borderRadius:'50%', background:'rgba(255,255,255,0.6)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    color:'#94A3B8', fontSize:24, fontWeight:700,
                  }}>{name.charAt(0) || '?'}</div>
                </div>
                <div style={{
                  marginTop:8, padding:'12px 14px', border:`1px dashed ${C_BORDER}`, borderRadius:8,
                  background:C_SURFACE, textAlign:'center',
                }}>
                  <div style={{fontSize:11, color:C_MUTED, lineHeight:1.5}}>
                    400x400px, JPG / PNG<br/>
                    버튼을 클릭하거나 파일을 드래그하여 드롭하세요
                  </div>
                  <button style={{
                    marginTop:8, padding:'8px 14px',
                    background:C_SURFACE, border:`1px solid ${C_BORDER}`, borderRadius:7,
                    fontSize:12, fontWeight:600, color:C_INK, cursor:'pointer',
                    display:'inline-flex', alignItems:'center', gap:5, fontFamily:'inherit',
                  }}>
                    <IconCoffee size={12}/> 이미지 불러오기
                  </button>
                </div>
              </div>

              {/* 우: 필드 */}
              <div style={{background:C_SURFACE, borderRadius:10, border:`1px solid ${C_BORDER}`, padding:'18px 20px'}}>
                <StaffField label="근무 상태" value={
                  <div style={{display:'flex', gap:6}}>
                    {[
                      { id:'active',   label:'근무중',  color:'#059669', bg:'#D1FAE5' },
                      { id:'leave',    label:'휴직',    color:'#64748B', bg:'#F1F5F9' },
                      { id:'resigned', label:'해지',    color:'#DC2626', bg:'#FEE2E2' },
                    ].map(o => (
                      <button key={o.id} onClick={() => setStatus(o.id)} style={{
                        padding:'6px 12px', fontSize:11.5, fontWeight:600,
                        border:`1px solid ${status===o.id ? o.color : C_BORDER}`,
                        background: status===o.id ? o.bg : C_SURFACE,
                        color: status===o.id ? o.color : C_MUTED,
                        borderRadius:14, cursor:'pointer', fontFamily:'inherit',
                      }}>{o.label}</button>
                    ))}
                  </div>
                }/>
                <StaffField label="퇴사(해지)일" value={
                  <span style={{color: s.resignDate ? '#DC2626' : '#CBD5E1', fontSize:12.5, fontVariantNumeric:'tabular-nums'}}>
                    {s.resignDate || '-'}
                  </span>
                }/>
                <StaffField label="아이디">
                  {isNew
                    ? <input value={loginId} onChange={e => setLoginId(e.target.value)} placeholder="영문/숫자" style={{...c_modalInput, fontFamily:'ui-monospace, monospace'}}/>
                    : <span style={{color:C_INK, fontFamily:'ui-monospace, monospace', fontSize:13}}>{loginId || '-'}</span>}
                </StaffField>
                <StaffField label="비밀번호">
                  <div style={{display:'flex', gap:8, alignItems:'center'}}>
                    <input value="****" readOnly style={{...c_modalInput, width:120, textAlign:'center', letterSpacing:'0.1em'}}/>
                    <button style={{
                      padding:'7px 14px', background:C_BLUE, color:'#fff', border:'none', borderRadius:14,
                      fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
                    }}>비밀번호 변경</button>
                  </div>
                </StaffField>
                <StaffField label="스태프명" required>
                  <input value={name} onChange={e => setName(e.target.value)}
                    placeholder="이름을 입력해주세요" style={c_modalInput}/>
                </StaffField>
                <StaffField label="자기소개">
                  <div style={{position:'relative'}}>
                    <textarea value={bio} onChange={e => setBio(e.target.value.slice(0,70))}
                      placeholder="자기소개를 입력해주세요" rows={2}
                      style={{
                        width:'100%', padding:'8px 12px',
                        border:`1px solid ${C_BORDER}`, borderRadius:7,
                        fontSize:12.5, background:C_SURFACE, outline:'none',
                        fontFamily:'inherit', resize:'vertical', boxSizing:'border-box',
                      }}/>
                    <span style={{position:'absolute', right:10, bottom:8, fontSize:10.5, color:C_MUTED, fontVariantNumeric:'tabular-nums'}}>
                      {bio.length}/70
                    </span>
                  </div>
                </StaffField>
                <StaffField label="성별">
                  <div style={{display:'flex', gap:14}}>
                    {[
                      { id:'male', label:'남성' },
                      { id:'female', label:'여성' },
                      { id:'none', label:'선택안함' },
                    ].map(g => (
                      <label key={g.id} style={{display:'inline-flex', alignItems:'center', gap:5, fontSize:12.5, color:C_INK, cursor:'pointer'}}>
                        <input type="radio" checked={gender === g.id} onChange={() => setGender(g.id)} style={{margin:0}}/>
                        {g.label}
                      </label>
                    ))}
                  </div>
                </StaffField>
                <StaffField label="전화번호">
                  <input value={phone} onChange={e => setPhone(formatPhoneStaff(e.target.value))}
                    placeholder="전화번호를 입력해주세요" style={c_modalInput}/>
                </StaffField>
                <StaffField label="MBTI">
                  <select value={mbti} onChange={e => setMbti(e.target.value)} style={{...c_modalInput, cursor:'pointer'}}>
                    {['선택안함','INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP'].map(m => <option key={m}>{m}</option>)}
                  </select>
                </StaffField>
                <StaffField label="생년월일">
                  <input value={birth} onChange={e => setBirth(e.target.value)}
                    placeholder="날짜를 선택해주세요." style={{...c_modalInput, fontVariantNumeric:'tabular-nums'}}/>
                </StaffField>
                <StaffField label="이메일">
                  <input value={email} onChange={e => setEmail(e.target.value)}
                    type="email" placeholder="이메일을 입력해주세요" style={c_modalInput}/>
                </StaffField>
                <StaffField label="기본 주소">
                  <div style={{display:'flex', gap:6, alignItems:'stretch'}}>
                    <input value={address} onChange={e => setAddress(e.target.value)}
                      placeholder="주소를 입력해주세요" style={c_modalInput}/>
                    <button style={{
                      width:34, height:34, borderRadius:'50%',
                      background:C_BLUE, color:'#fff', border:'none', cursor:'pointer',
                      display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                    }} title="주소 검색">
                      <IconSearch size={14}/>
                    </button>
                  </div>
                </StaffField>
                <StaffField label="상세 주소">
                  <input value={addressDetail} onChange={e => setAddressDetail(e.target.value)}
                    placeholder="건물명 등 상세 주소를 입력해주세요" style={c_modalInput}/>
                </StaffField>
                <StaffField label="플랜더 연동">
                  <select value={floaterLink} onChange={e => setFloaterLink(e.target.value)} style={{...c_modalInput, cursor:'pointer'}}>
                    <option value="">스태프 선택</option>
                    {STAFF.filter(x => x.id !== s.id && x.status === 'active').map(x => (
                      <option key={x.id} value={x.id}>{x.name} ({x.role})</option>
                    ))}
                  </select>
                </StaffField>
                <StaffField label="메모" noBorder>
                  <div style={{position:'relative'}}>
                    <textarea value={memo} onChange={e => setMemo(e.target.value.slice(0,1000))}
                      placeholder="내용을 입력해 주세요." rows={4}
                      style={{
                        width:'100%', padding:'8px 12px',
                        border:`1px solid ${C_BORDER}`, borderRadius:7,
                        fontSize:12.5, background:C_SURFACE, outline:'none',
                        fontFamily:'inherit', resize:'vertical', boxSizing:'border-box',
                      }}/>
                    <span style={{position:'absolute', right:10, bottom:8, fontSize:10.5, color:C_MUTED, fontVariantNumeric:'tabular-nums'}}>
                      {memo.length}/1000
                    </span>
                  </div>
                </StaffField>
              </div>
            </div>
          )}

          {tab === 'duty' && (
            <div style={{background:C_SURFACE, borderRadius:10, border:`1px solid ${C_BORDER}`, padding:'18px 20px'}}>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 32px'}}>
                <div>
                  <StaffField label="디자이너명" required>
                    <input value={designerName} onChange={e => setDesignerName(e.target.value)}
                      placeholder="예약 화면에 표시" style={c_modalInput}/>
                  </StaffField>
                  <StaffField label="입사일">
                    <input value={hireDate} onChange={e => setHireDate(e.target.value)}
                      placeholder="날짜를 선택해주세요" style={{...c_modalInput, fontVariantNumeric:'tabular-nums'}}/>
                  </StaffField>
                  <StaffField label="근무 형태">
                    <div style={{display:'flex', gap:14}}>
                      {[
                        { id:'long', label:'장기 근무' },
                        { id:'short', label:'단기 근무 (스페어)' },
                      ].map(o => (
                        <label key={o.id} style={{display:'inline-flex', alignItems:'center', gap:5, fontSize:12.5, color:C_INK, cursor:'pointer'}}>
                          <input type="radio" checked={workType === o.id} onChange={() => setWorkType(o.id)} style={{margin:0}}/>
                          {o.label}
                        </label>
                      ))}
                    </div>
                  </StaffField>
                  <StaffField label="직급" required>
                    <select value={role} onChange={e => setRole(e.target.value)} style={{...c_modalInput, cursor:'pointer'}}>
                      {['원장','실장','디자이너','인턴','매니저'].map(r => <option key={r}>{r}</option>)}
                    </select>
                  </StaffField>
                  <StaffField label="근무 요일">
                    <div style={{display:'flex', gap:5, flexWrap:'wrap'}}>
                      {['월','화','수','목','금','토','일'].map(d => {
                        const on = dutyDays.includes(d);
                        const isWeekend = d === '일';
                        return (
                          <button key={d} onClick={() => toggleDay(d)} style={{
                            width:34, height:34, borderRadius:'50%',
                            border:`1px solid ${on ? C_BLUE : C_BORDER}`,
                            background: on ? C_BLUE_SOFT : C_SURFACE,
                            color: on ? C_BLUE : C_MUTED,
                            fontSize:12.5, fontWeight:700, cursor:'pointer',
                            fontFamily:'inherit',
                          }}>{d}</button>
                        );
                      })}
                    </div>
                  </StaffField>
                  <StaffField label="근무 시간" noBorder>
                    <div style={{display:'flex', gap:6, alignItems:'center'}}>
                      <select value={workStart} onChange={e => setWorkStart(e.target.value)} style={{...c_modalInput, cursor:'pointer'}}>
                        {timeOptions.map(t => <option key={t}>{t}</option>)}
                      </select>
                      <span style={{color:C_MUTED}}>~</span>
                      <select value={workEnd} onChange={e => setWorkEnd(e.target.value)} style={{...c_modalInput, cursor:'pointer'}}>
                        {timeOptions.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  </StaffField>
                </div>
                <div>
                  <StaffField label="체크인 노출">
                    <C_ToggleSw checked={checkin} onChange={setCheckin}/>
                  </StaffField>
                  <div style={{
                    padding:'14px 16px', background:C_BLUE_SOFT, borderRadius:8, border:`1px solid #C7D6F5`,
                    marginTop:16, fontSize:12, color:C_INK, lineHeight:1.5,
                  }}>
                    <strong style={{fontWeight:700}}>근무 조건 안내</strong><br/>
                    <span style={{color:C_MUTED}}>
                      스태프의 실제 예약/시술 캘린더에 반영되는 정보입니다. 요일별 근무 시간이 다르면 별도로 개별 요일 설정 기능이 추가될 예정입니다.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'account' && (
            <div style={{background:C_SURFACE, borderRadius:10, border:`1px solid ${C_BORDER}`, padding:'18px 20px'}}>
              <div style={{fontSize:12, color:C_MUTED, marginBottom:14}}>
                급여 정산 및 세무 신고에 사용되는 정보입니다.
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 32px'}}>
                <div>
                  <StaffField label="은행">
                    <select value={bank} onChange={e => setBank(e.target.value)} style={{...c_modalInput, cursor:'pointer'}}>
                      <option value="">은행을 선택해주세요</option>
                      {['국민','신한','우리','하나','농협','기업','SC제일','씨티','대구','부산','카카오뱅크','토스뱅크'].map(b => <option key={b}>{b}</option>)}
                    </select>
                  </StaffField>
                  <StaffField label="계좌번호">
                    <input value={account} onChange={e => setAccount(e.target.value.replace(/[^\d-]/g,''))}
                      placeholder="계좌번호를 입력해주세요" style={{...c_modalInput, fontVariantNumeric:'tabular-nums'}}/>
                  </StaffField>
                </div>
                <div>
                  <StaffField label="예금주">
                    <input value={accountName} onChange={e => setAccountName(e.target.value)}
                      placeholder="예금주명을 입력해주세요" style={c_modalInput}/>
                  </StaffField>
                  <StaffField label="주민번호">
                    <input value={ssn} onChange={e => setSsn(e.target.value)}
                      placeholder="주민번호 13자리를 입력해주세요" style={{...c_modalInput, fontVariantNumeric:'tabular-nums'}}/>
                  </StaffField>
                </div>
              </div>
            </div>
          )}

          {tab === 'terms' && (
            <div style={{background:C_SURFACE, borderRadius:10, border:`1px solid ${C_BORDER}`, padding:'18px 20px', display:'flex', flexDirection:'column', gap:8}}>
              {[
                { title:'개인정보 수집 및 이용 동의', desc:'스태프 계정 관리 및 급여 정산 목적으로 개인정보를 수집·이용합니다.' },
                { title:'근로 계약서 확인', desc:'표준 근로계약서 서명 및 보관 여부' },
                { title:'비밀유지 서약', desc:'매장 운영 정보 및 고객 정보 비밀 유지 서약' },
                { title:'마케팅 알림 수신 동의', desc:'사내 공지, 이벤트 관련 SMS/이메일 수신' },
              ].map((t, i) => (
                <label key={i} style={{
                  display:'flex', alignItems:'flex-start', gap:10,
                  padding:'12px 14px', borderRadius:8,
                  border:`1px solid ${C_BORDER}`, background:'#FBFCFE',
                  cursor:'pointer',
                }}>
                  <input type="checkbox" style={{marginTop:2}} defaultChecked={i < 2}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13, fontWeight:600, color:C_INK}}>{t.title}</div>
                    <div style={{fontSize:11.5, color:C_MUTED, marginTop:2}}>{t.desc}</div>
                  </div>
                  <a style={{fontSize:11.5, color:C_BLUE, fontWeight:600, cursor:'pointer'}}>보기</a>
                </label>
              ))}
              <div style={{
                marginTop:6, padding:'12px 14px', background:'#FEF3C7', borderRadius:8, border:'1px solid #FCE9B8',
                fontSize:11.5, color:'#92400E', lineHeight:1.5,
              }}>
                <strong style={{fontWeight:700}}>참고</strong> · 각 항목의 세부 내용과 첨부 서식은 시안 확정 후 실제 문서로 대체됩니다.
              </div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div style={{
          padding:'12px 22px', borderTop:`1px solid ${C_BORDER}`, background:C_SURFACE,
          display:'flex', gap:8, justifyContent:'space-between', alignItems:'center',
        }}>
          <div>
            {!isNew && (
              <button onClick={() => setShowResignConfirm(true)} style={{
                padding:'9px 18px', background:'#EF4444', color:'#fff',
                border:'none', borderRadius:20, fontSize:12.5, fontWeight:700,
                cursor:'pointer', fontFamily:'inherit',
                boxShadow:'0 1px 3px rgba(239,68,68,0.3)',
              }}>해지 처리</button>
            )}
          </div>
          <div style={{display:'flex', gap:8}}>
            <button onClick={onClose} style={{...c_ghostBtn, padding:'9px 16px'}}>취소</button>
            <button onClick={onClose} disabled={!canSave} style={{
              padding:'9px 22px',
              background: canSave ? C_BLUE : '#E5EAF2',
              color: canSave ? '#fff' : '#94A3B8',
              border:'none', borderRadius:20, fontSize:13, fontWeight:700,
              cursor: canSave ? 'pointer' : 'not-allowed',
              boxShadow: canSave ? '0 1px 2px rgba(30,64,175,0.2)' : 'none',
              fontFamily:'inherit',
            }}>저장하기</button>
          </div>
        </div>
      </div>

      {showResignConfirm && (
        <C_ConfirmDialog
          title="해지 처리"
          message={<>
            <strong style={{fontWeight:700}}>{name}</strong> 스태프를 정말 해지 처리하시겠습니까?<br/>
            <span style={{color:C_MUTED, fontSize:12}}>해지된 스태프는 '해지' 목록에서 확인할 수 있습니다.</span>
          </>}
          confirmLabel="해지 처리"
          danger
          onCancel={() => setShowResignConfirm(false)}
          onConfirm={() => {
            setShowResignConfirm(false);
            setStatus('resigned');
            onClose();
          }}
        />
      )}
    </div>
  );
}

// 시간 옵션 생성
const timeOptions = (() => {
  const arr = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      arr.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
    }
  }
  return arr;
})();

function StaffField({ label, required, children, value, noBorder }) {
  return (
    <div style={{
      display:'grid', gridTemplateColumns:'110px 1fr',
      alignItems:'center', gap:14, padding:'10px 0',
      borderBottom: noBorder ? 'none' : `1px solid ${C_BORDER}`,
    }}>
      <label style={{fontSize:12.5, fontWeight:600, color:C_INK}}>
        {label} {required && <span style={{color:'#EF4444'}}>*</span>}
      </label>
      <div>{children ?? value}</div>
    </div>
  );
}

function C_ToggleSw({ checked, onChange }) {
  return (
    <div onClick={() => onChange(!checked)} style={{
      width:38, height:22, borderRadius:11,
      background: checked ? '#10B981' : '#E5E7EB',
      position:'relative', cursor:'pointer',
      transition:'background 0.15s',
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

// 확인 다이얼로그
function C_ConfirmDialog({ title, message, confirmLabel, danger, onCancel, onConfirm }) {
  return (
    <div onClick={onCancel} style={{
      position:'fixed', inset:0, background:'rgba(11,20,37,0.55)',
      zIndex:250, display:'flex', alignItems:'center', justifyContent:'center', padding:20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width:400, background:C_SURFACE, borderRadius:12,
        boxShadow:'0 24px 64px rgba(11,20,37,0.28)',
        overflow:'hidden',
      }}>
        <div style={{padding:'20px 22px 8px'}}>
          <div style={{
            width:44, height:44, borderRadius:'50%',
            background: danger ? '#FEE2E2' : C_BLUE_SOFT,
            color: danger ? '#DC2626' : C_BLUE,
            display:'flex', alignItems:'center', justifyContent:'center',
            marginBottom:12,
          }}>
            <IconX size={20}/>
          </div>
          <div style={{fontSize:16, fontWeight:700, color:C_INK, letterSpacing:'-0.01em'}}>{title}</div>
          <div style={{fontSize:13, color:C_INK, marginTop:8, lineHeight:1.5}}>{message}</div>
        </div>
        <div style={{padding:'14px 22px', display:'flex', gap:8, justifyContent:'flex-end'}}>
          <button onClick={onCancel} style={{...c_ghostBtn, padding:'8px 16px'}}>취소</button>
          <button onClick={onConfirm} style={{
            padding:'8px 18px',
            background: danger ? '#EF4444' : C_BLUE,
            color:'#fff', border:'none', borderRadius:7,
            fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
          }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

const c_modalInput = {
  width:'100%', height:34, padding:'0 12px',
  border:`1px solid ${C_BORDER}`, borderRadius:14,
  fontSize:12.5, background:C_SURFACE, outline:'none',
  fontFamily:'inherit', boxSizing:'border-box',
};

function formatPhoneStaff(v) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0,3)}-${d.slice(3)}`;
  return `${d.slice(0,3)}-${d.slice(3,7)}-${d.slice(7)}`;
}

window.C_StaffPage = C_StaffPage;
