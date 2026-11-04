// REV315: «qaysi dars qaysi tilda o'tildi» — saytning HAMMA joyida (o'quvchi tahlili, o'qituvchi va admin panellari,
// ota-ona sahifasi, test va dars ro'yxatlari) fan nomidagi «(izoh: rus)» kabi ichki belgi o'rniga til bayrog'i ko'rinadi:
// «Matematika (izoh: rus)» → «Matematika 🇷🇺». Faqat ko'rinish (matn tugunlari) o'zgaradi, ma'lumot o'zgarmaydi.
const BAYROQ = { rus: "🇷🇺", ruscha: "🇷🇺", ingliz: "🇬🇧", inglizcha: "🇬🇧", nemis: "🇩🇪", nemischa: "🇩🇪", ispan: "🇪🇸", ispancha: "🇪🇸", "o'zbek": "🇺🇿", "o‘zbek": "🇺🇿" };
const RE = /\s*\(\s*izoh\s*:\s*([^)]+?)\s*\)/gi;
const TASHQARI = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "CODE", "PRE"]);

export function izohniBayroqqa(matn) {
  return String(matn).replace(RE, (m, t) => { const b = BAYROQ[String(t).trim().toLowerCase()]; return b ? ` ${b}` : m; });
}

function tugun(n) {
  if (n.nodeType !== 3 || !n.nodeValue || !/izoh\s*:/i.test(n.nodeValue)) return;
  const p = n.parentElement;
  if (!p || TASHQARI.has(p.tagName) || p.isContentEditable) return;
  const yangi = izohniBayroqqa(n.nodeValue);
  if (yangi !== n.nodeValue) n.nodeValue = yangi;
}
function aylan(el) {
  if (!el) return;
  if (el.nodeType === 3) { tugun(el); return; }
  if (el.nodeType !== 1 || TASHQARI.has(el.tagName)) return;
  const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) tugun(n);
}

export function startIzohBayroq() {
  if (typeof document === "undefined" || !document.body || startIzohBayroq.ish) return;
  startIzohBayroq.ish = true;
  aylan(document.body);
  let navbat = [];
  let kut = 0;
  const mo = new MutationObserver((ms) => {
    for (const m of ms) {
      if (m.type === "characterData") navbat.push(m.target);
      else m.addedNodes.forEach((x) => navbat.push(x));
    }
    if (!kut) kut = requestAnimationFrame(() => { kut = 0; const q = navbat; navbat = []; q.forEach(aylan); });
  });
  mo.observe(document.body, { childList: true, subtree: true, characterData: true });
}
