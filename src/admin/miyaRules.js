// REV97: «Miya tarkibi» — sof yordamchilar (testlanadi).
export const rowKey = (r) => `${r.sinf}::${String(r.fan || "").toLowerCase()}`;

/** Qatorlarni guruh (sinf/yosh) bo'yicha: [[sinf, [qatorlar]], …] — server tartibi saqlanadi. */
export function groupRows(rows) {
  const map = new Map();
  for (const r of rows || []) {
    if (!map.has(r.sinf)) map.set(r.sinf, []);
    map.get(r.sinf).push(r);
  }
  return [...map.entries()];
}

/** Tanlanganlar va belgilangan turlar bo'yicha nechta narsa o'chishini aytadi. */
export function selectionSummary(rows, what) {
  const n = { miya: 0, mavzular: 0, testlar: 0 };
  for (const r of rows || []) {
    if (what?.miya) n.miya += Number(r.miya_darslar) || 0;
    if (what?.mavzular) n.mavzular += Number(r.mavzular) || 0;
    if (what?.testlar) n.testlar += Number(r.testlar) || 0;
  }
  const parts = [];
  if (what?.miya) parts.push(`${n.miya} ta miya darsi`);
  if (what?.mavzular) parts.push(`${n.mavzular} ta mavzu`);
  if (what?.testlar) parts.push(`${n.testlar} ta test`);
  return { ...n, any: Boolean(what?.miya || what?.mavzular || what?.testlar), text: parts.join(", ") || "hech narsa belgilanmagan" };
}
