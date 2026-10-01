// REV96: to'garak jurnali — sof funksiyalar (testlanadi).
const OYLAR = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];

export function todayIso(now = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

export function monthShift(oy, delta) {
  let [y, m] = String(oy).split("-").map(Number);
  m += delta;
  while (m > 12) { m -= 12; y += 1; }
  while (m < 1) { m += 12; y -= 1; }
  return `${y}-${String(m).padStart(2, "0")}`;
}

export function monthTitle(oy) {
  const [y, m] = String(oy).split("-").map(Number);
  return `${OYLAR[(m || 1) - 1]} ${y}`;
}

export function money(n) {
  return `${Math.round(Number(n) || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so‘m`;
}

const cell = (v) => {
  const s = String(v ?? "");
  return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Oylik jurnal → Excel ochadigan CSV (nuqta-vergul bilan). */
export function csvJournal(data) {
  const rows = [["O‘quvchi", "Keldi", "Kech", "Kelmadi", "To‘lov (so‘m)", "To‘lov sanasi", "Holat"]];
  const price = Number(data?.guruh?.oylik_summa) || 0;
  for (const a of data?.azolar || []) {
    const paid = a.tolov_summa !== null && a.tolov_summa !== undefined;
    rows.push([a.ism, a.oy_keldi, a.oy_kech, a.oy_kelmadi, paid ? a.tolov_summa : 0, a.tolov_sana || "",
      !paid ? "To‘lamagan" : a.tolov_summa >= price ? "To‘lagan" : "Qisman"]);
  }
  const h = data?.hisob || {};
  rows.push([], ["Kutilgan", h.kutilgan || 0], ["Yig‘ildi", h.yigilgan || 0], ["Qarz", h.qarz || 0]);
  return rows.map((r) => r.map(cell).join(";")).join("\n");
}
