// 마케팅 › 재방문율 — 목업 방문 데이터
// 고객별 "기준 방문" 1건 + 그 이후 재방문 여부를 생성
const { MKT_CUSTOMERS: RV_CUST, MKT_DESIGNERS: RV_DES, MKT_CATS: RV_CATS } = window;

// 시술별 권장 재방문 주기(일) — 화면에서 수정 가능
const RV_DEFAULT_CYCLE = {
  'cut':45, 'etc-perm':90, 'basic-perm':90, 'setting':90,
  'color':60, 'magic':120, 'blending':60, 'clinic':30,
};

const RV_VISITS = (() => {
  let s = 70921;
  const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  // 디자이너별 고객 유지력 (0.5 ~ 0.88)
  const keep = {};
  RV_DES.forEach((d, i) => { keep[d.id] = 0.42 + ((i * 37) % 36) / 100; });
  const out = [];
  RV_CUST.slice(0, 1180).forEach((c, i) => {
    const designer = c.designer === 'unassigned' ? RV_DES[Math.floor(r() * RV_DES.length)].id : c.designer;
    const cat = c.cats[0] || 'cut';
    const cycle = RV_DEFAULT_CYCLE[cat] || 60;
    const days = Math.floor(r() * 200);           // 기준 방문이 며칠 전인지
    const isNew = r() < 0.32;
    const p = keep[designer] * (isNew ? 0.72 : 1);
    let after = null;
    if (r() < p) after = Math.max(7, Math.round(cycle * (0.55 + r() * 0.95)));
    const revisited = after != null && after <= days;
    const same = revisited ? r() < 0.8 : null;
    const toDes = revisited && !same ? RV_DES[Math.floor(r() * RV_DES.length)].id : null;
    out.push({
      id: i + 1, cid: c.id, name: c.name, phone: c.phone, consent: c.consent, points: c.points,
      designer, cat, days, isNew,
      after: revisited ? after : null,
      same, toDes: toDes === designer ? RV_DES[(RV_DES.findIndex(d => d.id === designer) + 1) % RV_DES.length].id : toDes,
    });
  });
  return out;
})();

Object.assign(window, { RV_DEFAULT_CYCLE, RV_VISITS });
