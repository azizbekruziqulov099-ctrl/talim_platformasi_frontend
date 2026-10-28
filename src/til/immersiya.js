// REV184: IKKI USTOZ — haqiqiy suhbat. Bitta ustoz ikki ovozda gapirmaydi: o'rganilayotgan til ustozi (Emili, Lukas, Anna…)
// o'z tilida gapiradi, izoh ustozi (uz / ru / en) esa uning gapini bolaga tushuntiradi: «Emili opa shunday dedi.
// O'zbekchada bunday tushunamiz: …». Tarjima asta-sekin kamayadi (immersiya):
//   2–3 yosh 15→35 %, 4–5 yosh 35→60 %, 6–7 yosh 60→85 %,
//   1–4-sinf 0→60 % (yil oxirida 50–60 %), 5-sinf 80 %, 6-sinf 90 %, 7–11-sinf 100 % (tarjima faqat so'z bosilganda).
// Yangi so'z/gap birinchi 5–6 marta tarjima qilinadi, keyin tarjimasiz — bola bilmagan so'zni bosib, izoh ustozidan so'raydi.
import { segmentlar } from "../speech/aralashOvoz.js";

const KEY = "kabutar:til:korish:v1";
const MAX = 6000;
export const BILDI = 6;            // shuncha marta eshitgach — tanish (tarjimasi aytilmaydi)
const BILDI_KICHIK = 8;            // 2–3 yosh — ko'proq takror

function store() { try { return globalThis.localStorage; } catch { return null; } }
function oqi(st = store()) { try { return JSON.parse(st?.getItem(KEY) || "{}") || {}; } catch { return {}; } }
function yoz(d, st = store()) { try { st?.setItem(KEY, JSON.stringify(d)); } catch { /* joy yo'q */ } }

/** Sinf yoki yosh matnidan: {yosh} yoki {sinf}. «2-3 yosh», «4-5 yosh», «1-sinf», «7», «10-sinf». */
export function bosqich(g = "") {
  const s = String(g || "");
  const y = /(\d)\s*[-–]\s*(\d)\s*(?:yosh|лет|years)?/i.exec(s);
  if (y && /yosh|лет|year/i.test(s)) return { yosh: Number(y[1]) };
  const m = /(1[01]|[1-9])/.exec(s);
  return m ? { sinf: Number(m[1]) } : {};
}

/** Mavzu raqami: «12. Bu qanday rang?» → 12. */
export function mavzuRaqami(nom = "") { const m = /^\s*(\d{1,3})[.)]/.exec(String(nom || "")); return m ? Number(m[1]) : 0; }

/** Immersiya ulushi 0..1 — darsda o'rganilayotgan til qancha bo'lishi. raqam/jami — yil (kurs) ichidagi o'rin. */
export function ulush({ sinf = 0, yosh = 0, raqam = 0, jami = 0 } = {}) {
  const lerp = (a, b) => { const p = jami > 0 && raqam > 0 ? Math.min(1, Math.max(0, (raqam - 1) / Math.max(1, jami - 1))) : 0.5; return a + (b - a) * p; };
  if (yosh) {
    if (yosh <= 3) return lerp(0.15, 0.35);
    if (yosh <= 5) return lerp(0.35, 0.6);
    return lerp(0.6, 0.85);
  }
  if (!sinf) return 0.5;
  if (sinf === 1) return lerp(0, 0.15);
  if (sinf === 2) return lerp(0.15, 0.3);
  if (sinf === 3) return lerp(0.3, 0.45);
  if (sinf === 4) return lerp(0.45, 0.6);
  if (sinf === 5) return lerp(0.8, 0.85);
  if (sinf === 6) return lerp(0.85, 0.9);
  return 1;
}
export const kursJami = ({ sinf = 0, yosh = 0 } = {}) => (yosh ? (yosh <= 3 ? 50 : yosh <= 5 ? 80 : 100) : sinf ? 68 : 0);

// ── so'z va gaplarni necha marta eshitgani (shu qurilmada, profil bo'yicha) ──
const NOSPACE = new Set(["ja", "zh"]);
export function sozlarga(til, matn) {
  const t = String(matn || "").toLowerCase();
  if (NOSPACE.has(til)) return [];
  return [...new Set((t.match(/[\p{L}\p{N}'’-]+/gu) || []).map((w) => w.replace(/^['’-]+|['’-]+$/g, "")).filter((w) => w.length > 1 || til === "ko"))];
}
const gapKalit = (matn) => String(matn || "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim().slice(0, 80);

export function korishlar(profil = "", st = store()) {
  const d = oqi(st);
  return d[profil || "_"] || {};
}
/** Necha marta eshitgan: so'z (w:til:soz) yoki gap (g:til:gap). */
export function necha(kor, til, soz) { return (kor[`w:${til}:${String(soz).toLowerCase()}`] || 0); }
export function gapNecha(kor, til, gap) { return (kor[`g:${til}:${gapKalit(gap)}`] || 0); }

/** Qadam aytildi — undagi o'rganilayotgan tildagi so'z va gaplar +1 (bir darsda bir qadam bir marta). */
export function eshitdi({ profil = "", til = "", matn = "" } = {}, st = store()) {
  if (!til || !matn) return;
  const d = oqi(st);
  const kor = (d[profil || "_"] = d[profil || "_"] || {});
  const t = Date.now();
  for (const s of segmentlar(matn)) {
    if (s.til !== til) continue;
    for (const w of sozlarga(til, s.matn)) kor[`w:${til}:${w}`] = (kor[`w:${til}:${w}`] || 0) + 1;
    for (const g of gaplar(s.matn)) { const k = `g:${til}:${gapKalit(g)}`; if (gapKalit(g)) kor[k] = (kor[k] || 0) + 1; }
  }
  kor._t = t;
  const keys = Object.keys(kor);
  if (keys.length > MAX) keys.filter((k) => k !== "_t").slice(0, keys.length - MAX).forEach((k) => delete kor[k]);
  yoz(d, st);
}

export function gaplar(s) { return String(s || "").split(/(?<=[.!?…。！？])\s+/).map((x) => x.trim()).filter((x) => /[\p{L}\p{N}]/u.test(x)); }

// ── izoh ustozining ramka gaplari ──
const TIL_NOMI = {
  uz: { uz: "O'zbekchada", ru: "Ruschada", en: "Inglizchada" },
  ru: { uz: "По-узбекски", ru: "По-русски", en: "По-английски" },
  en: { uz: "In Uzbek", ru: "In Russian", en: "In English" },
};
/** Ramka — REV189: QISQA. Izoh ustozi «Karlos aka shunday dedi, o'zbekchada bunday tushunamiz» demaydi —
 *  faqat «O'zbekchada:» yoki «O'zbekcha tarjimasi:» deydi (ism va erkak — eski chaqiruvlar uchun, ishlatilmaydi). */
export function ramka(iz = "uz", { turi = "uzun", n = 0 } = {}) {
  const R = {
    uz: ["O'zbekchada:", "O'zbekcha tarjimasi:"],
    ru: ["По-русски:", "Перевод:"],
    en: ["In English:", "Translation:"],
  }[iz] || ["O'zbekchada:", "O'zbekcha tarjimasi:"];
  return turi === "uzun" ? R[n % 2] : R[0];
}
/** «worried — xavotirda» kabi qisqa izoh (faqat yangi so'z, yuqori sinflar). */
export function sozIzohGapi(iz, til, soz, tarjima) {
  const t = `[${til}]${soz}[/${til}]`;
  if (iz === "ru") return `${t} [ru]— это «${tarjima}».[/ru]`;
  if (iz === "en") return `${t} [en]means “${tarjima}”.[/en]`;
  return `${t} — «${tarjima}» degani.`;
}

// deterministik «tasodif» (bir xil gap — har safar bir xil qaror)
function xesh(s) { let h = 2166136261; for (const ch of String(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619) >>> 0; } return (h % 1000) / 1000; }
const MUHIM = /⏸|\{|\}|\[lat\]/;   // mikrofon pauzasi va formulalar — hech qachon tashlanmaydi

/**
 * Qadam gapini ikki ustozli suhbatga aylantiradi.
 * opts: til, iz, ulush (0..1), kor (korishlar), ism, erkak, gloss: Map(soz.lower → tarjima), yosh
 * Qaytaradi: teglangan matn — [til]…[/til] til ustoziga, qolgani izoh ustoziga (ikkiOvoz navbati).
 */
export function dialoglash(matn, { til = "", iz = "uz", ulush: u = 0.5, kor = {}, ism = "", erkak = false, gloss = new Map(), yosh = 0 } = {}) {
  const s = String(matn || "");
  if (!til || til === iz || !s.includes(`[${til}]`)) return s;
  const chegara = yosh && yosh <= 3 ? BILDI_KICHIK : BILDI;
  const seg = segmentlar(s).map((x) => ({ ...x, t: x.til === til }));
  const asl = (x) => (x.til === "uz" ? x.matn : `[${x.til}]${x.matn}[/${x.til}]`);
  const tanish = (txt) => {
    const ws = sozlarga(til, txt);
    if (!ws.length) return gaplar(txt).every((g) => gapNecha(kor, til, g) >= chegara);
    return ws.every((w) => necha(kor, til, w) >= chegara) || gaplar(txt).every((g) => gapNecha(kor, til, g) >= chegara);
  };
  const yangiSozlar = (txt) => sozlarga(til, txt).filter((w) => necha(kor, til, w) < chegara);
  const out = [];
  let ramkaN = 0;
  const izohlangan = new Set();   // bir gapda bir so'z bir marta izohlanadi
  const glossla = (ws, n) => ws.filter((w) => !izohlangan.has(w)).map((w) => [w, gloss.get(w)]).filter(([, t]) => t).slice(0, n)
    .map(([w, t]) => { izohlangan.add(w); return sozIzohGapi(iz, til, w, t); });
  for (let i = 0; i < seg.length; i += 1) {
    const x = seg[i];
    if (x.t) { out.push(asl(x)); continue; }
    const oldingi = i > 0 && seg[i - 1].t ? seg[i - 1] : null;
    const nativ = x.matn;
    if (MUHIM.test(nativ)) { out.push(asl(x)); continue; }
    if (!oldingi) {
      // izoh ustozining o'z gapi (kirish, ko'rsatma): immersiya oshgan sari kamroq
      const qolsin = u < 0.3 || xesh(nativ) < 1 - u + 0.15 || seg.every((y) => !y.t || y === x);
      if (qolsin) out.push(asl(x));
      continue;
    }
    // tarjima: til ustozining gapidan keyin keladi. Tarjima gaplari soni ≈ til gaplari soni; ortig'i — ko'rsatma.
    const tg = gaplar(oldingi.matn);
    const ng = gaplar(nativ);
    const tirecha = /^\s*[—–-]/.test(nativ);
    const trN = tirecha ? 1 : Math.min(ng.length, Math.max(1, tg.length));
    const tarjima = ng.slice(0, trN).join(" ");
    const qolgan = ng.slice(trN).join(" ");
    const yangi = yangiSozlar(oldingi.matn);
    const tanishmi = tanish(oldingi.matn);
    const qism = (m) => (x.til === "uz" ? m : `[${x.til}]${m}[/${x.til}]`);
    if (u >= 0.999) {
      // 7–11-sinf: tarjima aytilmaydi (bola bilmagan so'zni bosadi); faqat butunlay yangi so'zga birinchi 2 marta qisqa izoh
      const birinchi = yangi.filter((w) => necha(kor, til, w) < 2 && gloss.has(w)).slice(0, 1);
      if (birinchi.length && tirecha) out.push(qism(tarjima));
    } else if (u >= 0.8) {
      // 5–6-sinf: faqat yangi so'zlar qisqa izohlanadi (butun gap tarjimasi yo'q)
      if (tirecha && yangi.length) { out.push(qism(tarjima)); yangi.forEach((w) => izohlangan.add(w)); }
      else if (yangi.length) {
        out.push(...glossla(yangi, 2));
      }
    } else if (u >= 0.25 && tanishmi && !tirecha) {
      // tanish gap — tarjimasi aytilmaydi; ichida yangi so'z bo'lsa, faqat o'sha so'z
      out.push(...glossla(yangi, 1));
    } else if (tirecha) {
      out.push(qism(tarjima));   // «hello — salom» — so'z izohi har doim qisqa
    } else {
      // to'liq tarjima: yangi gapda izoh ustozi til ustoziga ishora qiladi
      const gapYangi = tg.some((g) => gapNecha(kor, til, g) < 2);
      const turi = gapYangi && ramkaN === 0 ? "uzun" : tanishmi ? "" : "qisqa";
      const r = turi ? ramka(iz, { ism, erkak, turi, n: ramkaN++ }) : "";
      out.push(qism(r ? `${r} ${tarjima}` : tarjima));
    }
    if (qolgan) {
      const qolsin = u < 0.6 || xesh(qolgan) < 1 - u + 0.1;
      if (qolsin) out.push(qism(qolgan));
    }
  }
  const natija = out.join(" ").replace(/\s+/g, " ").trim();
  return natija || s;
}
