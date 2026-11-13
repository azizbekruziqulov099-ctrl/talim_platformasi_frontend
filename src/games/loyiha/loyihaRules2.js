// REV542: Kabu loyiha — F2: yana 10 ta loyiha modeli (sof, testlanadi).
import { kodYurit } from "./loyihaRules.js";

// 1) Suv filtri: qatlamlar yuqoridan pastga. Yirikdan maydaga tartib to'g'ri; teskari bo'lsa — tiqilib qoladi.
export const FILTR = { shagal: { n: 1, t: 30 }, qum: { n: 2, t: 30 }, komir: { n: 3, t: 25 }, paxta: { n: 4, t: 15 } };
export function filtrTozalik(qatlamlar) {   // qatlamlar: 3 ta kalit (takrorsiz bo'lishi shart emas)
  const xil = [...new Set(qatlamlar.filter(Boolean))]; let t = xil.reduce((a, k) => a + FILTR[k].t, 0);
  for (let i = 0; i + 1 < qatlamlar.length; i += 1) if (qatlamlar[i] && qatlamlar[i + 1] && FILTR[qatlamlar[i]].n > FILTR[qatlamlar[i + 1]].n) t -= 20;   // mayda qatlam yirigining ustida
  return Math.max(0, Math.min(100, t));
}
export const FILTR_MAQSAD = 80;

// 2) Richag: moment = og'irlik × masofa. → -1 chapga og'adi, 0 muvozanat, 1 o'ngga
export const RICHAG = { chapYuk: 6, chapMasofa: 2, toshlar: [2, 3, 4] };
export const richagHolat = (ongYuk, ongMasofa) => Math.sign(ongYuk * ongMasofa - RICHAG.chapYuk * RICHAG.chapMasofa);

// 3) Parashyut: tushish tezligi ~ sqrt(massa / yuza). Kichik gumbaz — tez tushadi.
export const parashyutTezlik = (yuza, massa = 2) => Math.round(10 * Math.sqrt(massa / yuza) * 10) / 10;
export const PARASHYUT = { tezlik: 7.5, mato: 4 };   // yumshoq qo'nish chegarasi (m/s) va mato byudjeti
export const parashyutOtdi = (yuza) => parashyutTezlik(yuza) <= PARASHYUT.tezlik && yuza <= PARASHYUT.mato;

// 4) Qayiq: bir xil plastilindan — keng va devorli shakl ko'p suv siqib chiqaradi. Plastilin: eni + 2·devor ≤ 8
export const QAYIQ = { plastilin: 8, maqsad: 10 };
export const qayiqYaroqli = (eni, devor) => eni + 2 * devor <= QAYIQ.plastilin;
export const qayiqSigim = (eni, devor) => (qayiqYaroqli(eni, devor) ? Math.floor(eni * devor * 1.5) : 0);   // nechta tanga ko'taradi

// 5) Soya: 1 m tayoqning soyasi = 1 / tg(quyosh balandligi). Tush payti quyosh eng baland.
// O'zbekistonda quyosh hech qachon tik tepaga chiqmaydi: yozda tushda ≈ 73° (shuning uchun tushda ham qisqa soya bor)
export const quyoshBalandlik = (soat) => Math.max(8, 73 - Math.abs(12 - soat) * 11);
export const soyaUzunlik = (soat) => Math.round((1 / Math.tan((quyoshBalandlik(soat) * Math.PI) / 180)) * 100) / 100;
export const soyaTeng = (soat) => Math.abs(soyaUzunlik(soat) - 1) <= 0.12;   // soya ≈ tayoq bo'yi

// 6) Qiya tekislik: jism sirpanadi, agar tg(burchak) > ishqalanish koeffitsienti
export const SIRT = { muz: 0.05, yogoch: 0.3, gilam: 0.6 };
export const sirpanadi = (burchak, sirt) => Math.tan((burchak * Math.PI) / 180) > SIRT[sirt];
/** Maqsad: shunday burchakki, yog'ochda sirpansin, gilamda turib qolsin */
export const qiyaOtdi = (burchak) => sirpanadi(burchak, "yogoch") && !sirpanadi(burchak, "gilam");

// 7) Masshtab: haqiqiy o'lcham (m) → chizmada (sm), masshtab 1 : m
export const MASSHTAB = [{ nom: "Xona", eni: 4, boyi: 3, m: 50 }, { nom: "Sinf", eni: 8, boyi: 6, m: 100 }, { nom: "Hovli", eni: 10, boyi: 5, m: 200 }];
export const chizmadaSm = (metr, m) => (metr * 100) / m;
export const masshtabTogri = (t, eniSm, boyiSm) => eniSm === chizmadaSm(t.eni, t.m) && boyiSm === chizmadaSm(t.boyi, t.m);

// 8) So'rovnoma: javoblar ro'yxatidan ustunli diagramma yasash
export const SOROV = [{ savol: "Sevimli meva", toifa: ["olma", "anor", "uzum", "banan"], javob: "olma,anor,olma,uzum,banan,olma,uzum,anor,olma,banan,uzum,olma,anor,uzum,olma" },
  { savol: "Maktabga qanday keladi", toifa: ["piyoda", "avtobus", "mashina", "velosiped"], javob: "piyoda,avtobus,piyoda,mashina,piyoda,velosiped,avtobus,piyoda,avtobus,piyoda,mashina,piyoda" },
  { savol: "Sevimli fasl", toifa: ["bahor", "yoz", "kuz", "qish"], javob: "yoz,bahor,yoz,qish,yoz,kuz,bahor,yoz,qish,yoz,bahor,yoz,kuz,yoz" }];
export const sorovSana = (s) => s.toifa.map((t) => s.javob.split(",").filter((x) => x === t).length);
export const sorovTogri = (s, ustunlar) => sorovSana(s).every((v, i) => v === ustunlar[i]);

// 9) Rang aralashtirish: qizil, sariq, ko'k tomchilar (0..3) → hosil bo'lgan rang
export function rangAralash(q, s, k) {
  const bor = [q > 0, s > 0, k > 0].filter(Boolean).length;
  if (!bor) return "oq"; if (bor === 3) return "jigarrang";
  if (bor === 1) return q ? "qizil" : s ? "sariq" : "kok";
  if (q && s) return q > s ? "qizgish_sariq" : s > q ? "sargish" : "toq_sariq";
  if (s && k) return s > k ? "och_yashil" : k > s ? "toq_yashil" : "yashil";
  return q > k ? "pushti_binafsha" : k > q ? "kok_binafsha" : "binafsha";
}
export const RANG_HEX = { oq: "#ffffff", qizil: "#E63946", sariq: "#FFD23F", kok: "#3A86FF", toq_sariq: "#FF8C1A", qizgish_sariq: "#F4631E", sargish: "#FFB52E", yashil: "#2DBE60", och_yashil: "#A8E05F",
  toq_yashil: "#1E7A3C", binafsha: "#9B5DE5", pushti_binafsha: "#C74B9B", kok_binafsha: "#5B4BD6", jigarrang: "#8B5A2B" };
export const RANG_MAQSAD = ["toq_sariq", "yashil", "binafsha", "och_yashil", "jigarrang"];

// 10) Kabu-kod 2: takrorlash — buyruq [yo'nalish, necha marta]. Kam buyruq bilan uzun yo'l.
export const KOD2_XARITALAR = [["K......", ".#####.", ".#...#.", ".#.#.#.", "...#..Y"], ["K.....#", "#####.#", "......#", ".######", "......Y"], ["..#...Y", "..#.##.", "K.#....", "..####.", "......."]];
export const kod2Yoy = (buyruqlar) => buyruqlar.flatMap(([y, n]) => Array(Math.max(1, Math.min(9, n))).fill(y));
export const kod2Yurit = (xarita, buyruqlar) => kodYurit(xarita, kod2Yoy(buyruqlar));
/** Eng kam buyruq (takrorlash bilan): to'g'ri chiziqli bo'laklar soni — BFS holat (i, j, yo'nalish) */
export function kod2EngKam(xarita) {
  const n = xarita.length, m = xarita[0].length; let bosh, nishon; xarita.forEach((q, i) => [...q].forEach((c, j) => { if (c === "K") bosh = [i, j]; if (c === "Y") nishon = [i, j]; }));
  const Y = [[-1, 0], [1, 0], [0, -1], [0, 1]]; const d = new Map(); const navbat = [];
  for (let y = 0; y < 4; y += 1) { d.set(`${bosh[0]}:${bosh[1]}:${y}`, 1); navbat.push([bosh[0], bosh[1], y, 1]); }
  let eng = -1;
  while (navbat.length) { navbat.sort((a, b) => a[3] - b[3]); const [i, j, y, c] = navbat.shift(); if (i === nishon[0] && j === nishon[1]) { eng = c; break; }
    for (let y2 = 0; y2 < 4; y2 += 1) { const a = i + Y[y2][0], b = j + Y[y2][1]; if (a < 0 || b < 0 || a >= n || b >= m || xarita[a][b] === "#") continue; const c2 = c + (y2 === y ? 0 : 1); const k = `${a}:${b}:${y2}`;
      if (!d.has(k) || d.get(k) > c2) { d.set(k, c2); navbat.push([a, b, y2, c2]); } } }
  return eng;
}
