// REV361: yakshanba «Kabu imtihoni» — haftaning darslaridagi o'yinlar aralash (fanlar ham aralash). Sof funksiyalar.
import { OYINLAR, oyinOl } from "../oyin/oyinRules.js";
import { darsElementlari, qadamOyini } from "../../lesson/oyinQadam.js";
import { oyinYopiqmi } from "../oyin/oyinSozlama.js";   // REV364: admin o'chirgan o'yin imtihonga ham kirmaydi
const HARAKAT_OYINLARI = new Set([171, 172, 175]);   // «Bajardim» o'yinlari — imtihonga kirmaydi

const haftaBoshi = (d) => { const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); x.setUTCDate(x.getUTCDate() - ((x.getUTCDay() + 6) % 7)); return x.toISOString().slice(0, 10); };
export const yakshanbami = (sana = new Date()) => sana.getDay() === 0;

/** Shu haftada (dushanba–shanba) tugatilgan darslar kodi — stiker albomidagi yozuvlardan, eng yangisi oxirida. */
export function haftaDarslari(albom, sana = new Date()) {
  const bosh = haftaBoshi(sana);
  const kodlar = Object.keys(albom?.berildi || {}).map((k) => k.split("|")).filter(([, kun]) => kun >= bosh && kun <= sana.toISOString().slice(0, 10))
    .sort((a, b) => (a[1] < b[1] ? -1 : 1)).map(([kod]) => kod);
  return [...new Set(kodlar)];
}

const rng = (urug) => { let s = (Number(urug) || 1) >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };

/** Imtihon rejasi: har darsdan o'sha darsda bo'lgan o'yin(lar), fanlar aralash, ketma-ket bir xil o'yin kelmaydi.
 * darslar — [{ kod, mavzu, fan, steps }]. Qaytaradi — [{ id, elementlar, sonlar, kod, mavzu, fan }]. */
export function imtihonRejasi(darslar, { yosh = "4-5", urug = 1, soni } = {}) {
  const rnd = rng(urug);
  const N = soni || (yosh === "2-3" ? 4 : yosh === "4-5" ? 6 : 8);
  const nomzod = (darslar || []).map((d) => {
    const hov = darsElementlari(d.steps || []);
    const ids = [...new Set((d.steps || []).filter((s) => s.turi === "amaliy" && s.oyin && !HARAKAT_OYINLARI.has(Number(s.oyin)) && !oyinYopiqmi(s.oyin)).map((s) => Number(s.oyin)))];
    const oyinlar = ids.map((id) => {
      const st = (d.steps || []).find((s) => Number(s.oyin) === id);
      const o = st ? qadamOyini(st, { yosh, darsElementlari: hov }) : null;
      return o && oyinOl(id)?.yosh.includes(yosh) ? { ...o, kod: d.kod, mavzu: d.mavzu, fan: d.fan } : null;
    }).filter(Boolean);
    return oyinlar.sort(() => rnd() - 0.5);
  }).filter((x) => x.length);
  const out = [];
  for (let aylana = 0; out.length < N && aylana < 6; aylana += 1) {
    for (const d of nomzod.sort(() => rnd() - 0.5)) {   // darslar (fanlar) navbat bilan aralashadi
      if (out.length >= N) break;
      const o = d.find((x) => !out.length || x.id !== out[out.length - 1].id) || null;
      if (o) { out.push(o); d.splice(d.indexOf(o), 1); }
    }
  }
  return out;
}

/** Natija: o'yinlar bo'yicha — mustahkam / takror kerak bo'lgan mavzular. */
export function imtihonXulosa(natijalar = []) {
  const by = {};
  for (const n of natijalar) { const k = n.mavzu || n.kod; by[k] = by[k] || { mavzu: k, togri: 0, xato: 0 }; by[k].togri += n.togri || 0; by[k].xato += n.xato || 0; }
  const ruyxat = Object.values(by).map((m) => ({ ...m, foiz: m.togri + m.xato ? Math.round((100 * m.togri) / (m.togri + m.xato)) : 0 }));
  const jamiT = ruyxat.reduce((a, b) => a + b.togri, 0), jamiX = ruyxat.reduce((a, b) => a + b.xato, 0);
  const foiz = jamiT + jamiX ? Math.round((100 * jamiT) / (jamiT + jamiX)) : 0;
  return { ruyxat, foiz, yulduz: foiz >= 85 ? 3 : foiz >= 60 ? 2 : 1, takror: ruyxat.filter((m) => m.foiz < 60).map((m) => m.mavzu) };
}
export { OYINLAR };
