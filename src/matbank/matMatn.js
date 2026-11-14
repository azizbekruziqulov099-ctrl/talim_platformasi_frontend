// REV559: matematika banki matni (markdown + LaTeX) → bloklar. Toza funksiyalar (React'siz) — node'da sinaladi.
// Manba: pandoc markdown. Kerakli konstruksiyalar: sarlavha (###), ro'yxat (- …), raqamli («1\. …»), $…$ / $$…$$ formulalar (ko'p qatorli ham),
// pandoc «oddiy jadval»lari (chiziqlar bilan), **qalin**, *kursiv*.

const FORMULA = /\$\$([\s\S]+?)\$\$|\$([^$\n][\s\S]*?)\$/g;

/** Formuladan tashqari matndagi pandoc belgilarini tozalaydi: «1\.» → «1.», «A\)» → «A)». */
export const belgiTozala = (s) => String(s ?? "").replace(/\\([.)(\[\]*_#>+\-!`~|&$%{}])/g, "$1").replace(/\\\s*$/gm, "");

/** Bir qatorning ichi → [{t:"txt"|"b"|"i"|"math", s, d?}]. Formula ichidagi belgilar tegilmaydi. */
export function satrIchi(s) {
  const out = []; const matn = String(s ?? ""); let oxirgi = 0;
  const qosh = (x) => { if (!x) return;
    // **qalin** va *kursiv*
    const re = /\*\*([^*]+?)\*\*|(?<![*\w])\*([^*\s][^*]*?)\*(?![*\w])/g; let k = 0, m;
    while ((m = re.exec(x))) { if (m.index > k) out.push({ t: "txt", s: belgiTozala(x.slice(k, m.index)) }); out.push(m[1] !== undefined ? { t: "b", s: belgiTozala(m[1]) } : { t: "i", s: belgiTozala(m[2]) }); k = m.index + m[0].length; }
    if (k < x.length) out.push({ t: "txt", s: belgiTozala(x.slice(k)) }); };
  let m; FORMULA.lastIndex = 0;
  while ((m = FORMULA.exec(matn))) { qosh(matn.slice(oxirgi, m.index)); out.push({ t: "math", s: (m[1] ?? m[2]).trim(), d: m[1] !== undefined }); oxirgi = m.index + m[0].length; }
  qosh(matn.slice(oxirgi));
  return out;
}

const CHIZIQ = /^-{3,}\s*$/; const USTUN_CHIZIGI = /^-{3,}(\s+-{3,})+\s*$/;
const RASM = /^!\[([^\]]*)\]\(([^)\s]+)\)(\{[^}]*\})?$/;   // ![chizma](rasm:T100-1.png)
const RO_YXAT = /^[-*+]\s{1,4}(\S.*)$/; const RAQAMLI = /^(\d+)\\?\.\s+(\S.*)$/; const SARLAVHA = /^(#{1,6})\s+(.+)$/;

/** Pandoc oddiy jadvali: [yuqori chiziq] sarlavha qatori(lari) / ustun chizig'i (bo'shliqli) / qatorlar / [pastki chiziq]. → { head, rows } yoki null. */
function jadvalOqi(satrlar, i) {
  let j = i; if (CHIZIQ.test(satrlar[j] || "") && !USTUN_CHIZIGI.test(satrlar[j])) j += 1;
  const bosh = j; while (j < satrlar.length && !USTUN_CHIZIGI.test(satrlar[j].trim())) { if (j - bosh > 3) return null; j += 1; }
  if (j >= satrlar.length) return null;
  const sep = satrlar[j]; const ustunlar = []; const re = /-{3,}/g; let m; while ((m = re.exec(sep))) ustunlar.push([m.index, m.index + m[0].length]);
  const yar = (q) => ustunlar.map(([a], k) => q.slice(a, k + 1 < ustunlar.length ? ustunlar[k + 1][0] : undefined).trim());
  const head = satrlar.slice(bosh, j).filter((q) => q.trim()).map(yar)[0] || [];
  const rows = []; let k = j + 1;
  // «ko'p qatorli jadval»da qatorlar orasida bo'sh qator bo'ladi: pastki chiziqqacha o'qiymiz (bor bo'lsa, 60 qator ichida); yo'q bo'lsa — birinchi bo'sh qatorgacha
  const yopuvchi = (() => { for (let q = j + 1; q < Math.min(satrlar.length, j + 60); q += 1) { const x = satrlar[q].trim(); if (CHIZIQ.test(x) && !USTUN_CHIZIGI.test(x)) return q; if (x.startsWith("#")) return -1; } return -1; })();
  if (yopuvchi > 0) { for (; k < yopuvchi; k += 1) if (satrlar[k].trim()) rows.push(yar(satrlar[k])); k = yopuvchi + 1; }
  else { while (k < satrlar.length && satrlar[k].trim() !== "") { rows.push(yar(satrlar[k])); k += 1; } }
  return { head, rows, keyingi: k };
}

/** Matn → bloklar: {t:"img",alt,src} · {t:"p",s} · {t:"h",s,lv} · {t:"ul",items} · {t:"ol",items,boshi} · {t:"math",s} · {t:"table",head,rows}. */
export function bloklarga(matn) {
  // formula ichidagi qator uzilishlari bo'shliqqa aylanadi (LaTeX'da ular bir xil) — shunda ko'p qatorli formula bir butun qoladi
  const bir = String(matn ?? "").replace(/\r/g, "").replace(FORMULA, (m) => m.replace(/[ \t]*\n[ \t]*/g, " "));
  const satrlar = bir.split("\n"); const out = []; let par = [];
  const yop = () => { if (par.length) { out.push({ t: "p", s: par.join(" ") }); par = []; } };
  for (let i = 0; i < satrlar.length; i += 1) {
    const q = satrlar[i]; const t = q.trim();
    if (!t) { yop(); continue; }
    if (t.startsWith("$$")) {   // ko'p qatorli ko'rsatma formula
      yop(); let s = t; let k = i;
      if (!(s.length > 3 && s.endsWith("$$"))) { while (k + 1 < satrlar.length && !satrlar[k].trim().endsWith("$$") || k === i && !(t.length > 3 && t.endsWith("$$"))) { k += 1; s += "\n" + satrlar[k]; if (satrlar[k].trim().endsWith("$$")) break; } }
      out.push({ t: "math", s: s.replace(/^\$\$/, "").replace(/\$\$\s*$/, "").trim() }); i = k; continue;
    }
    if (CHIZIQ.test(t)) { yop(); const j = jadvalOqi(satrlar, i); if (j && (j.rows.length || j.head.length)) { out.push({ t: "table", head: j.head, rows: j.rows }); i = j.keyingi - 1; } continue; }
    const ras = RASM.exec(t); if (ras) { yop(); out.push({ t: "img", alt: ras[1], src: ras[2] }); continue; }
    const sar = SARLAVHA.exec(t); if (sar) { yop(); out.push({ t: "h", s: sar[2].replace(/\*\*/g, ""), lv: Math.min(sar[1].length, 4) }); continue; }
    const ul = RO_YXAT.exec(t); if (ul) { yop(); const last = out[out.length - 1]; if (last && last.t === "ul") last.items.push(ul[1]); else out.push({ t: "ul", items: [ul[1]] }); continue; }
    const ol = RAQAMLI.exec(t); if (ol) { yop(); const last = out[out.length - 1]; if (last && last.t === "ol" && Number(ol[1]) === last.boshi + last.items.length) last.items.push(ol[2]); else out.push({ t: "ol", items: [ol[2]], boshi: Number(ol[1]) }); continue; }
    par.push(t);
  }
  yop();
  return out;
}

/** Savol/variant matni (bitta blok) — satr ichi ko'rinishida; ko'rsatma formula ($$…$$) alohida qatorda chiqadi. */
export const savolBloklari = (matn) => bloklarga(matn).map((b) => (b.t === "p" ? { ...b, ichi: satrIchi(b.s) } : b));

export const HARFLAR = ["A", "B", "C", "D", "E"];
/** Qiyinlik belgisi → nom. */
export const QIYINLIK_NOMI = { O: "Oson", R: "O‘rta", Q: "Qiyin" };
/** «rasm:T100-1.png» → server manzili (faqat qat'iy nom shabloni; boshqasi — null). */
export const rasmManzili = (src) => { const m = /^rasm:(T\d{3}-\d{1,3}\.(?:png|jpe?g|gif|webp))$/.exec(String(src || "")); return m ? `/api/matbank/rasm/${m[1]}` : null; };
/** Baho harfi → rang. */
export const BAHO_RANGI = { "A+": "#14803c", A: "#1f8a4c", "B+": "#1b6fd8", B: "#3b82c4", "C+": "#b9831a", C: "#c26a1b" };
/** Natija foizi → daraja matni (rag'bat, past ball uchun ham mehribon). */
export const natijaDarajasi = (foiz) => (foiz >= 90 ? "a‘lo" : foiz >= 70 ? "yaxshi" : foiz >= 50 ? "o‘rtacha" : "takrorlash kerak");
/** Mavzularni qidirish: katta-kichik harf, apostrof va raqam bo'yicha («31», «oraliq», «1.7.3»). */
export function mavzuQidir(royxat, q) {
  const n = (x) => String(x ?? "").toLowerCase().replace(/[‘’ʻʼ`']/g, "'").trim(); const s = n(q); if (!s) return royxat;
  return royxat.filter((m) => n(m.nom).includes(s) || String(m.raqam) === s || n(m.kitob).startsWith(s));
}
/** O'quvchining mavzudagi ulushi (0–100): oxirgi urinishda to'g'ri javob berilgan savollar / mavzudagi barcha savollar. */
export const mavzuUlushi = (m, mening) => { const x = mening?.[m.raqam]; return x && m.testlar ? Math.round((100 * x.oxirgi_togri) / m.testlar) : 0; };

/** Bloklardagi formulalar soni (ko'rsatma, qator ichidagi, ro'yxat va jadval ichidagi) — hech biri yo'qolmaganini tekshirish uchun. */
export function formulaSoni(bloklar) {
  const q = (x) => satrIchi(x).filter((y) => y.t === "math").length; let n = 0;
  for (const b of bloklar) { if (b.t === "math") n += 1; else if (b.t === "table") n += [...b.head, ...b.rows.flat()].reduce((a, c) => a + q(c), 0); else if (b.t === "ul" || b.t === "ol") n += b.items.reduce((a, c) => a + q(c), 0); else if (b.s) n += q(b.s); }
  return n;
}
