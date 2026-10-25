// REV166: bola va ota-ona kundaligi — sof funksiyalar (DOM'siz sinaladi). Ma'lumot: /api/bola/kundalik, bola_faollik.kundalik.

/** Darajalar zinapoyasi (backend bogcha_reja.DARAJALAR bilan bir xil tartib) — bola keyingi belgini ko'rib turadi. */
export const DARAJA_ZINA = ['🥚', '🐣', '🐥', '🐤', '🐦', '🦜', '🦉', '🕊', '🦅', '🌟', '🚀', '🌈', '👑'];

/** «Kuchlarim»: backend kaliti → bolaga tushunarli nom va belgi (tartib ham shu). */
export const KUCHLAR = [
  ['xotira', '🧠', 'Aqlli', 'Savollarga to‘g‘ri javob beradi'],
  ['tezlik', '⚡', 'Chaqqon', 'Tez javob beradi'],
  ['diqqat', '🎯', 'Diqqatli', 'Darsni chalg‘imay o‘tadi'],
  ['gapirish', '🎤', 'Gapiradi', 'So‘zlarni to‘g‘ri aytadi'],
  ['muntazam', '📅', 'Har kuni', 'Har kuni o‘qiydi'],
  ['natija', '⭐', 'Yulduzchi', 'Ko‘p yulduz oladi'],
];

export function kuchlarRoyxati(kuch = []) {
  const by = new Map((kuch || []).map((k) => [k.kalit, Number(k.daraja) || 0]));
  return KUCHLAR.filter(([k]) => by.has(k)).map(([kalit, emoji, nom, izoh]) => ({ kalit, emoji, nom, izoh, daraja: Math.max(1, Math.min(5, by.get(kalit))) }));
}

/** Bir kunning kataklari: rejadagi har fan (o'tildimi, yulduzi, bahosi) + rejadan tashqari o'tilgan darslar.
 *  holat: tugadi | chala | bugun (hali boshlanmagan) | otkazildi (kun o'tib ketdi — keyin o'zi ochiladi) | keladi | takror | bosh */
export function kunKataklari(kun) {
  if (!kun) return [];
  const darslar = Array.isArray(kun.darslar) ? kun.darslar : [];
  const used = new Set();
  const out = [];
  for (const k of kun.rejada || []) {
    const idx = darslar.findIndex((d, i) => !used.has(i) && d.kalit === k && d.tugadi);
    const any = idx >= 0 ? idx : darslar.findIndex((d, i) => !used.has(i) && d.kalit === k);
    if (any >= 0) {
      used.add(any);
      const d = darslar[any];
      out.push({ ...d, kalit: k, fan: d.fan, mavzu: d.mavzu, holat: d.tugadi ? 'tugadi' : 'chala', yulduz: d.yulduz || 0, baho: d.baho || null });
    } else {
      out.push({ kalit: k, fan: '', mavzu: '', holat: kun.holat === 'bugun' ? 'bugun' : kun.holat === 'otdi' ? 'otkazildi' : 'keladi', yulduz: 0, baho: null });
    }
  }
  darslar.forEach((d, i) => {
    if (used.has(i)) return;
    out.push({ ...d, kalit: d.kalit, fan: d.fan, mavzu: d.mavzu, holat: d.tugadi ? 'tugadi' : 'chala', yulduz: d.yulduz || 0, baho: d.baho || null, qoshimcha: true });
  });
  if (!out.length) out.push({ holat: kun.kun === 6 ? 'takror' : 'bosh' });
  return out;
}

/** Yulduz satri: 2 → «⭐⭐☆». */
export function yulduzSatr(n, max = 3) {
  const k = Math.max(0, Math.min(max, Number(n) || 0));
  return '⭐'.repeat(k) + '☆'.repeat(max - k);
}

/** «19.10» ko'rinishidagi qisqa sana. */
export function qisqaSana(iso) {
  const m = /^\d{4}-(\d{2})-(\d{2})/.exec(String(iso || ''));
  return m ? `${m[2]}.${m[1]}` : '';
}

/** Haftaning qisqa xulosasi (tugatilgan dars, yulduz, rejadagi dars soni). */
export function haftaHisobi(hafta) {
  const kunlar = hafta?.kunlar || [];
  const reja = kunlar.reduce((n, k) => n + (k.rejada || []).length, 0);
  const tugadi = kunlar.reduce((n, k) => n + (k.darslar || []).filter((d) => d.tugadi).length, 0);
  const yulduz = kunlar.reduce((n, k) => n + (Number(k.yulduz) || 0), 0);
  return { reja, tugadi, yulduz, foiz: reja ? Math.min(100, Math.round((tugadi / reja) * 100)) : null };
}

/** Ota-onaga bugungi xulosa (backend kun_xulosasi bilan bir xil qoida): o'rgandi, takrorlash kerak, chala qolgan. */
export function bugungiXulosa(darslar = []) {
  const list = Array.isArray(darslar) ? darslar : [];
  const uniq = (items) => { const seen = new Set(); const out = [];
    for (const x of items) { const k = String(x || '').trim(); if (k && !seen.has(k.toLowerCase())) { seen.add(k.toLowerCase()); out.push(k); } }
    return out; };
  const said = new Set(list.flatMap((d) => (d.sozlar || []).filter((w) => w.aytdi === true).map((w) => String(w.soz || '').toLowerCase())));
  const done = list.filter((d) => d.tugadi);
  const sozlar = [];
  const seenW = new Set();
  for (const d of list) for (const w of d.sozlar || []) {
    const k = String(w.soz || '').toLowerCase();
    if (k && !seenW.has(k)) { seenW.add(k); sozlar.push(w); }
  }
  return {
    organdi: uniq(done.map((d) => d.mavzu)),
    sozlar,
    takrorSoz: sozlar.filter((w) => w.aytdi === false && !said.has(String(w.soz || '').toLowerCase())),
    takrorDars: uniq(done.filter((d) => Number(d.yulduz || 0) <= 1 || Number(d.ai_baho?.baho || 5) <= 2).map((d) => d.mavzu)),
    chala: uniq(list.filter((d) => !d.tugadi).map((d) => d.mavzu)),
  };
}

/** Ertangi rejadagi fanlar (yakshanba — takror: bo'sh ro'yxat; reja yo'q — null). */
export function ertangiFanlar(hafta, bugun) {
  if (!Array.isArray(hafta) || bugun < 0) return null;
  const n = (bugun + 1) % 7;
  return n === 6 ? [] : [...(hafta[n] || [])];
}

// ── REV168: «Bolalar kundaligi» — kunlik kartalar, bajarish darajasi, kuzatuv, «Uyda birga», rivojlanish ──
const I = (t) => t;
const qoshtirnoq = (list) => list.map((w) => `«${w}»`).join(", ");

/** Bajarish darajasi: mustaqil | eslatma | birga | yoq (hali kuzatilmadi). AI bahosi bo'lmasa — yulduzdan. */
export function bajarishDarajasi(d) {
  if (!d || !d.tugadi) return "yoq";
  const b = Number(d.baho || 0);
  if (b) return b >= 5 ? "mustaqil" : b >= 3 ? "eslatma" : "birga";
  const y = Number(d.yulduz || 0);
  return y >= 3 ? "mustaqil" : y === 2 ? "eslatma" : "birga";
}
export const BAJARISH = {
  mustaqil: ["✅", "Mustaqil bajardi"], eslatma: ["💬", "Eslatma bilan bajardi"], birga: ["🤝", "Birga bajardi"], yoq: ["◌", "Hali kuzatilmadi"],
};
const DARAJA_SON = { birga: 1, eslatma: 2, mustaqil: 3 };
const SON_DARAJA = ["yoq", "birga", "eslatma", "mustaqil"];

/** Kartadagi «kuzatuv» — nima qildi (o'zi aytgan so'zlari, savollar natijasi) yoki nega o'tilmagan. */
export function kuzatuvMatni(c, T = I) {
  if (!c) return "";
  if (c.holat === "bugun") return T("Bugungi dars — hali o‘tilmagan.");
  if (c.holat === "otkazildi") return T("O‘tkazib yuborildi — keyingi bo‘sh kunda o‘zi ochiladi.");
  if (c.holat === "keladi") return T("Shu kuni bo‘ladi.");
  if (c.holat === "chala") return T("Dars boshlangan, oxirigacha o‘tilmagan.");
  const parts = [];
  const sozlar = c.sozlar || [];
  const aytdi = sozlar.filter((w) => w.aytdi === true).map((w) => w.soz).slice(0, 3);
  const qoldi = sozlar.filter((w) => w.aytdi === false).map((w) => w.soz).slice(0, 2);
  if (aytdi.length) parts.push(`${qoshtirnoq(aytdi)} — ${T("o‘zi aytdi")}.`);
  if (qoldi.length) parts.push(`${qoshtirnoq(qoldi)} — ${T("hali aytolmadi")}.`);
  if (Number(c.jami) > 0) parts.push(`${T("Savollar")}: ${Number(c.togri) || 0}/${c.jami} ${T("to‘g‘ri")}.`);
  if (!parts.length) {
    const dj = bajarishDarajasi({ ...c, tugadi: true });
    parts.push(T(dj === "mustaqil" ? "Darsni o‘zi oxirigacha o‘tdi." : dj === "eslatma" ? "Darsni eslatma bilan o‘tdi." : "Darsni yordam bilan o‘tdi."));
  }
  return parts.join(" ");
}

/** «Uyda birga» — shu kungi dars bo'yicha ota-ona bilan uyda qilinadigan oddiy ish. */
export function uydaBirga(kataklar = [], tilOf = () => "", T = I) {
  const darslar = kataklar.filter((c) => c.kalit && c.holat !== "takror" && c.holat !== "bosh");
  const c = darslar.find((x) => x.holat === "tugadi") || darslar[0];
  if (!c) return T("Bugungi ishini qanday bajarganini so‘rang.");
  const sozlar = (c.sozlar || []).map((w) => w.soz).slice(0, 3);
  if (tilOf(c.kalit) && sozlar.length) return `${T("Uyda shu so‘zlarni narsalarni ko‘rsatib birga ayting")}: ${qoshtirnoq(sozlar)}.`;
  const m = c.mavzu ? `«${c.mavzu}» — ` : "";
  if (c.kalit === "mat") return m + T("uydagi qoshiq, o‘yinchoq yoki mevalarni birga sanang.");
  if (c.kalit === "man") return m + T("o‘yinchoqlardan juftini yoki ortiqchasini birga toping.");
  if (c.kalit === "olam") return m + T("uyda yoki sayrda shunga oid narsani topib, nomini ayting.");
  return m + T("bugungi ishini qanday bajarganini so‘rang.");
}

/** Rivojlanish: har fan bo'yicha o'tgan hafta (avval) va shu hafta (hozir) bajarish darajasi. */
export function rivojlanish(haftalar = []) {
  const shu = haftalar.find((h) => h.hafta === "shu"), otgan = haftalar.find((h) => h.hafta === "otgan");
  const yig = (h) => {
    const out = {};
    for (const k of h?.kunlar || []) for (const d of k.darslar || []) {
      if (!d.tugadi || !d.kalit) continue;
      const o = out[d.kalit] || (out[d.kalit] = { son: [], fan: d.fan, mavzu: "", sozlar: [] });
      o.son.push(DARAJA_SON[bajarishDarajasi(d)]); o.mavzu = d.mavzu || o.mavzu; o.fan = d.fan || o.fan;
      if (d.sozlar?.length) o.sozlar = d.sozlar;
    }
    return out;
  };
  const a = yig(otgan), b = yig(shu);
  const daraja = (x) => (x?.son.length ? SON_DARAJA[Math.round(x.son.reduce((s, v) => s + v, 0) / x.son.length)] : "yoq");
  return [...new Set([...Object.keys(b), ...Object.keys(a)])].map((kalit) => ({
    kalit, fan: b[kalit]?.fan || a[kalit]?.fan || "", mavzu: b[kalit]?.mavzu || a[kalit]?.mavzu || "", sozlar: b[kalit]?.sozlar || a[kalit]?.sozlar || [],
    avval: daraja(a[kalit]), hozir: daraja(b[kalit]),
  })).sort((x, y) => (DARAJA_SON[x.hozir] || 0) - (DARAJA_SON[y.hozir] || 0));
}

/** Tavsiya — eng qiyin fan bo'yicha (hammasi mustaqil bo'lsa — maqtov). */
export function tavsiya(riv = [], nomOf = (k) => k, T = I) {
  const q = riv.find((r) => r.hozir === "birga" || r.hozir === "eslatma") || riv.find((r) => r.hozir === "yoq" && r.avval !== "yoq");
  if (!riv.length) return T("Bir necha dars o‘tgach, bu yerda farzandingiz qanday o‘sayotgani ko‘rinadi.");
  if (!q) return T("Zo‘r! Hammasini o‘zi bajaryapti — har kuni oz-ozdan davom eting.");
  return `${T(nomOf(q.kalit, q.fan))}: ${q.mavzu ? `«${q.mavzu}» — ` : ""}${T("uyda shu mavzuni birga takrorlang.")}`;
}
