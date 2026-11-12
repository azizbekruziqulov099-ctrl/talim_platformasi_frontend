// REV522: o'yinlarning yagona «xotirasi» — takrorlanmaslik qoidalari (hamma o'yin uchun bitta joyda):
//  1) bitta o'yin (bosqich) ichida bir xil topshiriq ikki marta chiqmaydi;
//  2) bugun boshqa o'yinda ko'rilgan mazmun (masalan, «qo'l yuvish») iloji boricha qayta berilmaydi;
//  3) xato qilingan topshiriq 2–3 tadan keyin bir marta qaytadi (Oyin.jsx — xatoniQaytar).
import { oyinYasa, joriyBosh } from "./oyinRules.js";

const KALIT = "kabutar:oyin:xotira:v1";
const bugun = () => new Date().toISOString().slice(0, 10);

/** Topshiriqning aniq imzosi (aynan shu savol). */
export function raundImzo(r) {
  if (!r) return "";
  return JSON.stringify([r.tur, r.togri ?? null, r.savol ?? null, r.nishon?.k ?? null,
    r.togri == null ? (r.variantlar || []).map((v) => v?.k).sort() : null, r.namuna ?? r.ketma ?? r.juftlar?.map((j) => j?.k) ?? null]);
}

/** Mazmun kaliti — odam tushunadigan «nima haqida» (o'yin turidan qat'i nazar): «qo'l yuvish», «olma», «5»… */
export function mazmunKaliti(r) {
  if (!r) return "";
  const s = r.savol;
  if (s && typeof s === "object" && (s.nima || s.mavzu || s.nom)) return `m:${s.nima || s.mavzu || s.nom}`;
  const v = (r.variantlar || []).find((x) => x?.k === r.togri);
  const el = v?.el || r.nishon || r.el;
  const nom = el?.soz?.uz || el?.uz || el?.say;
  if (nom) return `e:${String(nom).toLowerCase()}`;
  if (v?.son != null) return "";   // sonlar tabiiy ravishda takrorlanadi — mazmun xotirasiga kirmaydi
  return "";
}

export function bugungiXotira() {
  try { const d = JSON.parse(localStorage.getItem(KALIT) || "null"); return d && d.kun === bugun() ? new Set(d.m || []) : new Set(); } catch { return new Set(); }
}
export function xotiragaYoz(kalitlar) {
  try { const s = bugungiXotira(); kalitlar.filter(Boolean).forEach((k) => s.add(k));
    localStorage.setItem(KALIT, JSON.stringify({ kun: bugun(), m: [...s].slice(-800) })); } catch { /* */ }
}

/** Raundlar hovuzidan R tasini tanlash: avval bugun ko'rilmagan va o'yin ichida takrorlanmaydiganlar. Sof funksiya (testlanadi). */
export function raundTanla(hovuz, R, korilgan = new Set()) {
  const out = [], imzolar = new Set(), mazmun = new Set();
  const ol = (shart) => { for (const r of hovuz) { if (out.length >= R) break; if (out.includes(r)) continue;
    const i = raundImzo(r), m = mazmunKaliti(r);
    if (shart(i, m)) { out.push(r); imzolar.add(i); if (m) mazmun.add(m); } } };
  ol((i, m) => !imzolar.has(i) && !(m && mazmun.has(m)) && !(m && korilgan.has(m)));   // yangi va bugun ko'rilmagan
  ol((i, m) => !imzolar.has(i) && !(m && mazmun.has(m)));                               // bugun ko'rilgan, lekin o'yin ichida yangi
  ol((i) => !imzolar.has(i));                                                           // mazmuni o'xshash, savoli boshqa
  ol(() => true);                                                                       // ma'lumot juda kam bo'lsa — oxirgi chora
  return out;
}

/** oyinYasa + xotira: bir necha urug' bilan hovuz yig'ib, takrorsiz raundlar tanlanadi. */
export function xotiraliYasa(id, opts = {}) {
  const asos = oyinYasa(id, opts);
  if (!asos || (asos.raundlar || []).length < 3) return asos;
  const R = asos.raundlar.length; let hovuz = [...asos.raundlar];
  for (let i = 1; i <= 3; i += 1) {
    try { const h = oyinYasa(id, { ...opts, urug: (Number(opts.urug) || 1) + 7919 * i }); if (h?.raundlar?.length) hovuz = hovuz.concat(h.raundlar); } catch { /* */ }
  }
  const raundlar = raundTanla(hovuz, R, bugungiXotira());
  if (raundlar.length < R) return asos;
  xotiragaYoz(raundlar.map(mazmunKaliti));
  return { ...asos, raundlar, joriy: joriyBosh(raundlar[0]) };
}

/** Xato qilingan raund 3 tadan keyin bir marta qaytadi (o'yinda ko'pi bilan 2 ta qaytish). */
export function xatoniQaytar(holat, raundIndeks) {
  const rl = holat?.raundlar || []; const r = rl[raundIndeks];
  if (!r || r.takror || rl.filter((x) => x.takror).length >= 2 || holat.tugadi) return holat;
  const joy = Math.min(rl.length, raundIndeks + 4);
  if (joy <= raundIndeks + 1) return holat;
  const yangi = [...rl]; yangi.splice(joy, 0, { ...r, takror: true });
  return { ...holat, raundlar: yangi };
}
