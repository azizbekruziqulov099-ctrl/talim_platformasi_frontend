// REV221: YANGI O'ZBEK ALIFBOSI (2026-yil 21-oktabr qonuni): O‘→Ö, G‘→Ğ, Sh→Ş, Ch→Ç (tutuq ʼ saqlanadi).
// Ma'lumotlar bazasi va miyalar o'zgarmaydi — o'zbekcha interfeysda ekrandagi matn shu yerda yangi alifboga o'giriladi.
// Ovoz (TTS) eski yozuvdagi asl matndan o'qiydi, shuning uchun talaffuz buzilmaydi. Foydalanuvchi yozgan javoblar
// ikkala alifboda ham qabul qilinadi (backend va mashq tekshiruvi ikkala yozuvni tenglashtiradi).
const APOS = "[‘'ʻ`’′]";
const INGLIZ = /(?:^|[^a-z])(she|shes|shoe|shoes|fish|wash|show|shop|shirt|ship|sheep|short|shout|child|children|chair|chicken|cheese|chocolate|church|catch|teacher|teachers|much|lunch|beach|peach|french|which|watch|kitchen|change|check|choose|chat|chess|china|chinese|english|push|brush|lunchbox|march|search|school|chrome|chart|charts|chips|charge|channel|chapter|cheap|chef|chain|chance|chocolate|shopify|shift|flash|cash|ch|sh)(?:$|[^a-z])/i;
const BEGONA = /w|th|ph|ck|ee|oo|ea|ou|tion|c(?!h)|x(?=[aeiou]{2})/i;

function sozOgir(soz) {
  // Ingliz/boshqa tildagi so'z (children, fish, Chrome…) o'zgarmaydi
  const harf = soz.replace(/[^A-Za-z‘'ʻ`’′]/g, "");
  if (/sh|ch/i.test(harf) && (INGLIZ.test(harf) || BEGONA.test(harf.replace(/ch|sh/gi, "")))) {
    return soz.replace(new RegExp(`([oOgG])${APOS}`, "g"), (_, h) => ({ o: "ö", O: "Ö", g: "ğ", G: "Ğ" }[h]));
  }
  return soz
    .replace(new RegExp(`([oO])${APOS}`, "g"), (_, h) => (h === "o" ? "ö" : "Ö"))
    .replace(new RegExp(`([gG])${APOS}`, "g"), (_, h) => (h === "g" ? "ğ" : "Ğ"))
    .replace(/SH/g, "Ş").replace(/Sh/g, "Ş").replace(/sh/g, "ş")
    .replace(/CH/g, "Ç").replace(/Ch/g, "Ç").replace(/ch/g, "ç");
}

export function yangiAlifbo(text) {
  const s = String(text ?? "");
  if (!/[oOgG][‘'ʻ`’′]|sh|ch/i.test(s)) return s;
  // URL, e-pochta, @nik, kod va [lat]…[/lat] o'zgarmaydi
  return s.replace(/(https?:\/\/\S+|www\.\S+|\S+@\S+|@\w+|\[lat\][\s\S]*?\[\/lat\])|([A-Za-z‘'ʻ`’′]+)/g, (m, himoya, soz) => (himoya ? m : sozOgir(soz)));
}

export function eskiAlifbo(text) {
  return String(text ?? "")
    .replace(/Ö/g, "O‘").replace(/ö/g, "o‘").replace(/Ğ/g, "G‘").replace(/ğ/g, "g‘")
    .replace(/Ş(?=[a-zö-ş])/g, "Sh").replace(/Ş/g, "SH").replace(/ş/g, "sh")
    .replace(/Ç(?=[a-zö-ş])/g, "Ch").replace(/Ç/g, "CH").replace(/ç/g, "ch");
}

/** Javoblarni solishtirish uchun: ikkala alifbo bir xil ko'rinishga keladi. */
export function alifboTeng(text) {
  return eskiAlifbo(text).replace(/[‘'ʻ`’′ʼ]/g, "’").toLocaleLowerCase("uz");
}

const KALIT = "kb_alifbo";
export function alifboTanlov() {
  try { return window.localStorage.getItem(KALIT) === "eski" ? "eski" : "yangi"; } catch { return "yangi"; }
}
export function alifboOrnat(qiymat) {
  try { window.localStorage.setItem(KALIT, qiymat === "eski" ? "eski" : "yangi"); } catch { /* */ }
  window.location.reload();
}

const OTKAZ = "script,style,textarea,input,select,code,pre,kbd,[contenteditable=''],[contenteditable='true'],.katex,[data-eski-alifbo],.kb-chat-bubble";
function ozbekchami(node) {
  const el = node.parentElement;
  if (!el || el.closest(OTKAZ)) return false;
  const tilEl = el.closest("[lang]");
  const til = (tilEl?.getAttribute("lang") || document.documentElement.lang || "").toLowerCase();
  return til.startsWith("uz");
}

let kuzatuvchi = null;
function matnniOgir(root) {
  const yur = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const tugunlar = [];
  for (let n = yur.nextNode(); n; n = yur.nextNode()) tugunlar.push(n);
  if (root.nodeType === 3) tugunlar.push(root);
  for (const n of tugunlar) {
    if (!ozbekchami(n)) continue;
    const yangi = yangiAlifbo(n.nodeValue);
    if (yangi !== n.nodeValue) n.nodeValue = yangi;
  }
  // tugma/rasm yozuvlari (placeholder, title, aria-label) ham
  if (root.querySelectorAll) {
    for (const el of root.querySelectorAll("[placeholder],[title],[aria-label]")) {
      if (el.closest("[data-eski-alifbo]")) continue;
      for (const a of ["placeholder", "title", "aria-label"]) {
        const v = el.getAttribute(a);
        if (v) { const y = yangiAlifbo(v); if (y !== v) el.setAttribute(a, y); }
      }
    }
  }
}

function klaviaturaYordamchi() {
  // Yangi harflarni yozish oson bo'lsin: o'zbekcha matn maydoniga kirganda pastda Ö Ğ Ş Ç tugmalari chiqadi
  if (document.getElementById("kb-alifbo-klaviatura")) return;
  const bar = document.createElement("div");
  bar.id = "kb-alifbo-klaviatura";
  bar.setAttribute("data-eski-alifbo", "1");
  bar.style.cssText = "position:fixed;left:50%;bottom:calc(10px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);display:none;gap:6px;z-index:2147483646;background:#fff;border:1px solid #d8e3e8;border-radius:14px;padding:6px;box-shadow:0 6px 24px rgba(0,0,0,.15)";
  let maydon = null;
  for (const h of ["ö", "ğ", "ş", "ç", "Ö", "Ğ", "Ş", "Ç", "ʼ"]) {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = h;
    b.style.cssText = "min-width:38px;height:38px;border-radius:10px;border:1px solid #cfe0e6;background:#f5fafc;font:700 18px system-ui;color:#18324b";
    b.addEventListener("mousedown", (e) => e.preventDefault());
    b.addEventListener("click", () => {
      if (!maydon) return;
      const s = maydon.selectionStart ?? maydon.value.length, e = maydon.selectionEnd ?? s;
      const proto = maydon.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, "value").set.call(maydon, maydon.value.slice(0, s) + h + maydon.value.slice(e));
      maydon.dispatchEvent(new Event("input", { bubbles: true }));
      maydon.setSelectionRange?.(s + h.length, s + h.length);
    });
    bar.appendChild(b);
  }
  document.body.appendChild(bar);
  document.addEventListener("focusin", (e) => {
    const t = e.target;
    const ok = t && (t.tagName === "TEXTAREA" || (t.tagName === "INPUT" && /^(text|search|)$/.test(t.type || "")));
    const til = (t?.closest?.("[lang]")?.getAttribute("lang") || document.documentElement.lang || "").toLowerCase();
    maydon = ok && til.startsWith("uz") ? t : null;
    bar.style.display = maydon ? "flex" : "none";
  });
  document.addEventListener("focusout", () => setTimeout(() => {
    if (!document.activeElement || !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) bar.style.display = "none";
  }, 150));
}

// REV222: brauzer ovozi (speechSynthesis) ham yangi harflarni turkcha o'qimasin — o'zbekcha gap eski yozuvda o'qiladi.
let ovozTuzatildi = false;
function ovozniTuzat() {
  if (ovozTuzatildi || typeof window === "undefined" || !window.speechSynthesis) return;
  ovozTuzatildi = true;
  const asl = window.speechSynthesis.speak.bind(window.speechSynthesis);
  window.speechSynthesis.speak = (u) => {
    try {
      const til = String(u?.lang || document.documentElement.lang || "uz").toLowerCase();
      if (u && til.startsWith("uz") && /[ÖöĞğŞşÇç]/.test(u.text || "")) u.text = eskiAlifbo(u.text).replace(/([oOgG])‘/g, "$1ʻ");
    } catch { /* */ }
    return asl(u);
  };
}

export function startYangiAlifbo() {
  try { ovozniTuzat(); } catch { /* */ }
  if (typeof document === "undefined" || alifboTanlov() === "eski" || kuzatuvchi) return;
  const ishga = () => {
    if (!(document.documentElement.lang || "").toLowerCase().startsWith("uz")) return;
    matnniOgir(document.body);
  };
  kuzatuvchi = new MutationObserver((ozgarishlar) => {
    if (!(document.documentElement.lang || "").toLowerCase().startsWith("uz")) return;
    for (const o of ozgarishlar) {
      if (o.type === "characterData") { const n = o.target; if (ozbekchami(n)) { const y = yangiAlifbo(n.nodeValue); if (y !== n.nodeValue) n.nodeValue = y; } }
      else o.addedNodes.forEach((n) => (n.nodeType === 1 || n.nodeType === 3) && matnniOgir(n));
    }
  });
  kuzatuvchi.observe(document.body, { childList: true, subtree: true, characterData: true });
  new MutationObserver(ishga).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  ishga();
  klaviaturaYordamchi();
}

/** Teglangan matn: [en]…[/en] kabi chet tili bo'laklari o'zgarmaydi, qolgani (va [uz]…[/uz]) yangi alifboga. */
export function yangiAlifboTegli(text) {
  const s = String(text ?? "");
  return s.split(/(\[([a-z]{2})\][\s\S]*?\[\/\2\])/).map((q, i, arr) => {
    if (i % 3 === 2) return "";               // ichki guruh (til kodi) — split takrori
    const m = /^\[([a-z]{2})\]/.exec(q);
    if (m && m[1] !== "uz") return q;
    return yangiAlifbo(q);
  }).join("");
}

/** Dars (yoki istalgan JSON) ichidagi barcha matnlar — teglarni hurmat qilib. */
export function chuqurOgir(v) {
  if (typeof v === "string") return /^(https?:|\/api\/|data:)/.test(v) ? v : yangiAlifboTegli(v);
  if (Array.isArray(v)) return v.map(chuqurOgir);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, /^(rasm|src|url|id|topic_code|kod|audio|unit_code|til|lang)$/.test(k) ? x : chuqurOgir(x)]));
  return v;
}


/** REV224: «O‘zbekchada: …», «o‘zbekcha — …» kabi ortiqcha yorliqlar olib tashlanadi — o'zbekcha aytilgani o'zi tushunarli. */
export function ozbekchaYorliqsiz(v) {
  if (typeof v === "string") {
    return v
      // REV234: «O'zbekcha tushuntiraman:», «O'zbek tilida:», «O'zbekchasi:» ham
      .replace(/\(?\s*(?:[OoÖö][‘'ʻ’`]?zbek(?:ch|ç)a(?:da|si)?|[OoÖö][‘'ʻ’`]?zbek tilida)(?:\s+(?:tushuntiraman|aytsak|aytganda|aytamiz|bu))?\s*[:—–-]\s*/gi, (m) => (m.trim().startsWith("(") ? " (" : " "))
      .replace(/[,;]?\s*(?:o[‘'ʻ’`]?|ö)zbek(?:ch|ç)ada\b\s*/gi, " ")
      .replace(/\s{2,}/g, " ").trim();
  }
  if (Array.isArray(v)) return v.map(ozbekchaYorliqsiz);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, /^(rasm|src|url|id|topic_code|kod|audio|unit_code|til|lang)$/.test(k) ? x : ozbekchaYorliqsiz(x)]));
  return v;
}
