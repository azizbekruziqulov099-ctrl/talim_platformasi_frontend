// REV670: PEDAGOGIKA (13.00.02 doktorantura) JONLI DOSKASI — sof qoidalar (brauzersiz sinaladi).
// Matematika doskasining (matDoska.js) davomi: matnli fanlar uchun sxemali, rangli buyruqlar.
//   KOD:    Q=Qonuniyatlarni ochish | M=Mazmun, metod | …      — harflar rangli chiqib, so'zga ochiladi
//   SXEMA:  Markaz > shox 1 | shox 2 | …                         — markazdan shoxlar o'sib chiqadi
//   ZANJIR: 1992 :: 2-iyul :: + Gerb | 1997 :: 29-avgust | …     — vaqt chizig'i / ketma-ketlik (strelka bilan)
//   JADVAL: Ta'lim | Tarbiya ;; BKM beradi | Dunyoqarash ;; …    — taqqoslash jadvali, birinchi qator — sarlavha
// Oddiy qatorda rangli so'z: [s]sariq — muhim[/s], [k]ko'k — sana/raqam[/k], [y]yashil — atama[/y], [p]pushti — e'tibor[/p].
// Buyruq faqat KATTA harf bilan yozilganda ishlaydi («KOD:»), «Kod: …» — oddiy yozuv bo'lib qoladi.

export const PED_BUYRUQLAR = ["KOD", "SXEMA", "ZANJIR", "JADVAL"];
export const PED_RE = /13\.00\.02|doktorantura/i;
/** Shu fan jonli (sxemali) doskada o'tiladimi — 13.00.02 tayanch doktorantura kursi. */
export const pedRejim = (fan) => PED_RE.test(String(fan || ""));

const toza = (s) => String(s ?? "").trim();

/** «Q=Qonuniyatlarni ochish | M=Mazmun» → [{h:"Q", soz:"Qonuniyatlarni ochish"}, …] (2–12 ta), aks holda null. */
export function kodTahlil(arg) {
  const qism = String(arg ?? "").split("|").map(toza).filter(Boolean);
  const out = [];
  for (const q of qism) {
    const m = q.match(/^([^=]{1,6}?)\s*=\s*(.+)$/);
    if (!m || !toza(m[1]) || !toza(m[2])) return null;
    out.push({ h: toza(m[1]), soz: toza(m[2]) });
  }
  return out.length >= 2 && out.length <= 12 ? out : null;
}

/** «Markaz > a | b | c» → {markaz, shox:[…]} (2–8 shox), aks holda null. */
export function sxemaTahlil(arg) {
  const m = String(arg ?? "").match(/^([^>]+?)\s*>\s*(.+)$/);
  if (!m) return null;
  const shox = m[2].split("|").map(toza).filter(Boolean);
  return toza(m[1]) && shox.length >= 2 && shox.length <= 8 ? { markaz: toza(m[1]), shox } : null;
}

/** «1992 :: 2-iyul :: + Gerb | 1997 :: 29-avgust» → [{bosh:"1992", izoh:["2-iyul","+ Gerb"]}, …] (2–8 ta). */
export function zanjirTahlil(arg) {
  const items = String(arg ?? "").split("|").map(toza).filter(Boolean).map((s) => {
    const p = s.split("::").map(toza);
    return { bosh: p[0], izoh: p.slice(1).filter(Boolean) };
  });
  return items.length >= 2 && items.length <= 8 && items.every((x) => x.bosh) ? items : null;
}

/** «A | B ;; a1 | b1 ;; a2 | b2» → {bosh:[A,B], qatorlar:[[a1,b1],[a2,b2]]} (2–4 ustun, 1–10 qator). */
export function jadvalTahlil(arg) {
  const rows = String(arg ?? "").split(";;").map((r) => r.split("|").map(toza)).filter((r) => r.some(Boolean));
  if (rows.length < 2 || rows.length > 11) return null;
  const n = rows[0].length;
  if (n < 2 || n > 4 || rows.some((r) => r.length !== n)) return null;
  return { bosh: rows[0], qatorlar: rows.slice(1) };
}

// ── rangli so'zlar ─────────────────────────────────────────────
const RANG_RE = /\[(s|k|y|p)\]([\s\S]*?)\[\/\1\]/g;
export const RANG_NOMI = { s: "sariq", k: "kok", y: "yashil", p: "pushti" };

/** Matn → [{t, rang|null}] — rang tegi bo'lmasa bitta bo'lak. */
export function rangBolaklar(text) {
  const s = String(text ?? "");
  const out = [];
  let last = 0;
  for (const m of s.matchAll(RANG_RE)) {
    if (m.index > last) out.push({ t: s.slice(last, m.index), rang: null });
    if (m[2]) out.push({ t: m[2], rang: m[1] });
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push({ t: s.slice(last), rang: null });
  return out.length ? out : [{ t: s, rang: null }];
}

/** Rang teglarisiz matn (ovoz, PDF, «Esda tut» uchun). */
export const rangsiz = (text) => String(text ?? "").replace(RANG_RE, "$2");

/** Buyruqni yozish uchun ketadigan so'zlar soni (taxminan) — ovoz bilan bir xil sur'atda chizilsin. */
export function pedYozishSozlari(tur, arg) {
  if (tur === "kod") return 8 + (kodTahlil(arg)?.length || 2) * 9;
  if (tur === "sxema") return 8 + (sxemaTahlil(arg)?.shox.length || 2) * 9;
  if (tur === "zanjir") return 6 + (zanjirTahlil(arg)?.length || 2) * 10;
  if (tur === "jadval") return 6 + (jadvalTahlil(arg)?.qatorlar.length || 1) * 10;
  return 14;
}
