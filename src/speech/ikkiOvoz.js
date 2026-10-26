// REV180: IKKI KISHI gapiradi — tushuntiruvchi (izoh tili: uz / ru / en) va o'rganilayotgan tilning «ona-tilli» so'zlovchisi
// (masalan, nemischa). Bitta ovoz gap o'rtasida tilni almashtirsa — aralash va tushunarsiz eshitiladi. Shuning uchun gap
// teglar bo'yicha bo'linadi: [de]…[/de] — ikkinchi so'zlovchiga, qolgani — tushuntiruvchiga; har biri o'z ovozida, navbat bilan.
// Tegsiz qolgan bo'lak tilini taxmin qilamiz (kirill — rus, nemis/ingliz/fransuz… yordamchi so'zlari) — o'zbek ovozida xato o'qilmasin.
import { segmentlar } from "./aralashOvoz.js";

const STOP = {
  de: /\b(der|die|das|ist|und|ich|du|nicht|ein|eine|mit|wir|sie|er|es|ja|nein|hallo|guten|bitte|danke|heute|was|wie|wer|wo|zu|im|auf|für|sind|bin|hast|haben|schau|mal)\b/gi,
  en: /\b(the|is|are|and|you|what|which|one|this|that|it|of|to|in|we|they|he|she|say|means|word|new|with|today|let's|how|do|does|yes|no|hello|please|thank)\b/gi,
  fr: /\b(le|la|les|est|et|je|tu|nous|vous|un|une|des|bonjour|merci|oui|non|c'est|avec|pour|dans)\b/gi,
  es: /\b(el|la|los|las|es|y|yo|tú|un|una|hola|gracias|sí|con|para|en|que|qué)\b/gi,
  tr: /\b(ve|bir|bu|ne|evet|hayır|merhaba|teşekkürler|ben|sen|için|ile)\b/gi,
  uz: /\b(va|bu|bilan|uchun|degani|so'z|so‘z|bugun|ayting|yozing|nima|qanday|qaysi|salom|ha|yo'q|yo‘q|endi|men|siz)\b/gi,
};
const HARF = { de: /[äöüß]/i, fr: /[çœàâêîôûëïÿé]/i, es: /[ñ¿¡áíóú]/i, tr: /[ğışİ]/, uz: /(o|g)[ʻ‘']/i };

/** Tegsiz bo'lakning tilini taxmin qilish. nomzodlar — shu darsda bo'lishi mumkin bo'lgan tillar (izoh tili, o'rganilayotgan til, uz). */
export function tilTaxmin(matn, nomzodlar = ["uz"]) {
  const t = String(matn || "");
  if (/[Ѐ-ӿ]/.test(t)) return "ru";
  if (/[؀-ۿ]/.test(t)) return "ar";
  if (/[぀-ヿ]/.test(t)) return "ja";
  if (/[가-힯]/.test(t)) return "ko";
  if (/[一-鿿]/.test(t)) return "zh";
  let eng = nomzodlar[0] || "uz", ball = 0;
  for (const l of nomzodlar) {
    const re = STOP[l];
    let b = re ? (t.match(re) || []).length : 0;
    if (HARF[l]?.test(t)) b += 2;
    if (b > ball) { ball = b; eng = l; }
  }
  return eng;
}

/** Tegsiz bo'laklarni ham teglash: «Das ist … Which one is yes?» → [de]Das ist …[/de] [en]Which one is yes?[/en]. */
export function teglash(matn, nomzodlar = ["uz"]) {
  return segmentlar(matn).map((s) => {
    if (s.til !== "uz") return `[${s.til}]${s.matn}[/${s.til}]`;
    // tegsiz bo'lakni gap-gapga ajratib, har birining tilini aniqlaymiz
    return s.matn.split(/(?<=[.!?…»])\s+/).map((g) => { const l = tilTaxmin(g, nomzodlar); return l === "uz" ? g : `[${l}]${g}[/${l}]`; }).join(" ");
  }).join(" ");
}

/**
 * Navbat: [{kim: "iz" | "til", matn}] — ketma-ket bir xil so'zlovchining bo'laklari birlashtiriladi.
 * til — o'rganilayotgan til (masalan, "de"); unga tegishli bo'lak — ikkinchi so'zlovchi.
 */
export function navbat(matn, til = "", nomzodlar = ["uz"]) {
  const out = [];
  for (const s of segmentlar(teglash(matn, nomzodlar))) {
    const kim = til && s.til === til ? "til" : "iz";
    const qism = s.til === "uz" ? s.matn : `[${s.til}]${s.matn}[/${s.til}]`;
    const prev = out[out.length - 1];
    // faqat tinish belgisi qolgan bo'lak («.», «—») alohida ovoz bo'lmaydi — oldingisiga qo'shiladi
    if (!/[\p{L}\p{N}]/u.test(s.matn)) { if (prev) prev.matn = `${prev.matn} ${s.matn}`; continue; }
    if (prev && prev.kim === kim) prev.matn = `${prev.matn} ${qism}`;
    else out.push({ kim, matn: qism });
  }
  return out;
}

/**
 * Ikki ovozda o'qish. url(matn, kim) — /api/ovoz manzili (har so'zlovchi o'z ovozi bilan).
 * onKim(kim) — kim gapira boshladi (Kabu / ustoz kattalashadi); onEnd — hammasi tugadi; onAudio(a) — hozir yangrayotgan
 * Audio, bo'lak tartibi va o'zi (REV181: ustozning og'zi shu ovozga mos qimirlaydi, aytilayotgan so'z yonadi). Qaytaradi: { stop() }.
 */
export function ikkiOvozOqi(matn, { til = "", nomzodlar = ["uz"], url, onKim, onEnd, onAudio, playbackRate = 1 } = {}) {
  const qismlar = navbat(matn, til, nomzodlar);
  let i = -1, toxtadi = false, audio = null, timer = null;
  const tayyor = qismlar.map((q) => { try { const a = new Audio(); a.preload = "auto"; a.src = url(q.matn, q.kim); return a; } catch { return null; } });
  const tozala = () => { clearTimeout(timer); if (audio) { try { audio.onended = audio.onerror = null; audio.pause(); } catch { /* */ } audio = null; } };
  const keyingi = () => {
    if (toxtadi) return;
    tozala();
    i += 1;
    if (i >= qismlar.length) { toxtadi = true; onKim?.(null); onEnd?.(); return; }
    const q = qismlar[i];
    onKim?.(q.kim);
    let tugadi = false;
    const tamom = () => { if (tugadi) return; tugadi = true; timer = setTimeout(keyingi, 180); };
    try {
      const a = tayyor[i] || new Audio(url(q.matn, q.kim));
      audio = a; a.playbackRate = playbackRate; a.onended = tamom; onAudio?.(a, i, q); a.onerror = () => setTimeout(tamom, 300);
      a.play().catch(() => setTimeout(tamom, 600));
      timer = setTimeout(tamom, Math.min(30000, 5000 + q.matn.length * 150));
    } catch { tamom(); }
  };
  keyingi();
  return {
    qismlar,
    stop() { if (toxtadi) return; toxtadi = true; tozala(); for (const a of tayyor) { try { if (a) a.src = ""; } catch { /* */ } } onKim?.(null); },
  };
}
