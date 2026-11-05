// REV110: bog'cha darsining boshlanishi — ustoz o'z uslubida salomlashadi, bugungi ob-havoni aytadi va o'tgan
// darsdan so'raydi. Sof funksiyalar (brauzersiz sinaladi). «⏸» — bolaga javob berish uchun jimlik (TTS qo'yadi).
import { IMMERSIYA } from "./immersiyaTillari.js";
import { OCHILISH_LUGAT } from "./ochilishLugat.js";
import { kalendarQadami } from "./kalendar.js";
import { FEL_IZOH, birlashtir, gap, izohTeg } from "./izohTil.js";
import { iboraNorm, sinfIborasimi } from "./sinfIboralari.js";
import { ISMLAR, klonla } from "./tilUstozlari.js";
import { bayramGapi, bayramHozir } from "./bayram/bayramRules.js";

const FOREIGN = /\[(en|ru|de|fr|es|ar|tr|zh|ja|ko)\]([\s\S]*?)\[\/\1\]/gi;
const NOT_TARGET = /^(?:say it together|say it with me|repeat after me|look|listen|listen and repeat|again|one more time|your turn|now you|good job|well done|great job|hello everyone)$/i;

/** Har ustozning o'z fe'li: salomi, maqtovi, ob-havoga munosabati. Kunga qarab almashadi — har kuni bir xil emas. */
export const FEL = {
  sardor: {
    salom: ["Salom, aqlli bolajon! Men Sardor akangman.", "Assalomu alaykum, kichkina matematik! Sardor akang keldi.", "Salom, do'stim! Bugun ham birga sanaymiz, hisoblaymiz!",
      "Ha, kelding-a! Seni kutib o'tirgandim, bolajon.", "Assalomu alaykum! Bugun miyamiz yaxshilab ishlaydi — tayyormisan?", "Salom, hisobchi do'stim! Barmoqlaringni tayyorla.",
      "Voy, kim keldi? Mening eng aqlli shogirdim!", "Assalomu alaykum, bolajon! Bugun bir sir bilan keldim.", "Salom! Qani, birga o'ylab, birga topamiz.",
      "Salom-salom! Bugun ham zo'r dars bo'ladi, men ishonaman."],
    javob: ["Men ham yaxshiman, rahmat! Kayfiyatim xuddi besh baho!", "Rahmat, men a'lo! Sen kelding — yanada yaxshi bo'ldi.", "Men zo'rman! Bugun ko'p narsa topamiz.",
      "Rahmat! Men ham yaxshi — sanashga tayyorman.", "Yaxshiman! Seni ko'rib quvondim."],
    maqtov: ["Zo'r hisobladik!", "Mana bu aqlli bola!", "Bir, ikki, uch — barakalla!"],
    havo: { quyosh: "Bugun quyosh charaqlab turibdi!", bulut: "Bugun osmonda bulutlar ko'p. Sanab ko'ramizmi?", yomgir: "Bugun yomg'ir yog'yapti. Tomchilarni sanasak, adashib ketamiz!", qor: "Bugun qor yog'yapti! Qor parchalari son-sanoqsiz!" },
  },
  nilufar: {
    salom: ["Salom, quyoshim! Men Nilufar opangman.", "Assalomu alaykum, jonim! Nilufar opang yangi ertak bilan keldi.", "Salom, mening yulduzcham! Seni sog'indim!",
      "Voy, kelding-a, asalim! Kutib turgandim.", "Assalomu alaykum, gulim! Bugun qiziq narsa bor.", "Salom, mitti do'stim! Quloqlaring tayyormi?",
      "Xush kelibsan, jonim! Bugun birga o'ynaymiz va o'rganamiz.", "Salom, kapalagim! Kel, yonimga o'tir.", "Assalomu alaykum! Bugun men senga bir sir aytaman.",
      "Salom, quvnoq bolajon! Seni ko'rib xursand bo'ldim."],
    javob: ["Men ham yaxshiman, rahmat! Seni ko'rib, yana ham yaxshi bo'ldim!", "Rahmat, jonim, men zo'rman!", "Men yaxshiman! Bugun kayfiyatim baland.",
      "Rahmat! Sen kelding — men ham quvondim.", "Yaxshiman, asalim! Qani, boshlaymiz."],
    maqtov: ["Ofarin, quyoshim!", "Ertakdagidek zo'r!", "Sen juda aqllisan!"],
    havo: { quyosh: "Bugun quyosh ertakdagidek nur sochyapti!", bulut: "Bugun bulutlar osmonda sayr qilyapti.", yomgir: "Bugun yomg'ir tomchilari derazani taqillatyapti.", qor: "Bugun oppoq qor yog'yapti, xuddi ertakdagidek!" },
  },
  malika: {
    salom: ["Salom, kichkina sayohatchi! Men Malika opangman.", "Assalomu alaykum, kashfiyotchi! Malika opang yangi sayohatga chaqiryapti.", "Salom, do'stim! Lupamni oldim — bugun nimani kashf qilamiz?",
      "Voy, kelding-a! Ryukzagim tayyor, faqat seni kutayotgandim.", "Assalomu alaykum, tabiat do'sti! Bugun tashqarida qiziq narsa ko'rdim.", "Salom, kuzatuvchi! Ko'zlaringni katta och.",
      "Xush kelibsan, sayohatchi! Bugun yangi joyga boramiz.", "Salom! Bugun tabiatning bir sirini ochamiz.", "Assalomu alaykum, bolajon! Durbinimni ham oldim.",
      "Salom-salom, kashfiyotchi! Bugun nimalarni topar ekanmiz?"],
    javob: ["Men ham yaxshiman, rahmat! Sayohatga tayyorman!", "Rahmat, men zo'rman! Yo'lga chiqamizmi?", "Yaxshiman! Bugun ko'p narsani kuzatamiz.",
      "Rahmat! Kayfiyatim quyoshdek.", "Men a'lo! Sen bilan sayohat — eng yaxshisi."],
    maqtov: ["Ajoyib kashfiyot!", "Haqiqiy sayohatchi!", "Qoyil, juda zo'r!"],
    havo: { quyosh: "Bugun quyoshli kun — sayohatga juda mos!", bulut: "Bugun bulutli. Bulutlar shaklini kuzatamiz!", yomgir: "Bugun yomg'ir. O'simliklar suv ichib, xursand bo'lyapti!", qor: "Bugun qor yog'yapti. Tabiat oppoq ko'ylak kiydi!" },
  },
};

// REV169: til ustozlari — Nilufar opaning gaplari, o'z ismi bilan
for (const k of Object.keys(ISMLAR)) if (!FEL[k]) FEL[k] = klonla(FEL.nilufar, k, "uz");

const HAVO_KEY = { quyosh: "sunny", bulut: "cloudy", yomgir: "rainy", qor: "snowy" };
const HAVO_EMOJI = { quyosh: "☀️", bulut: "☁️", yomgir: "🌧️", qor: "❄️" };

/** REV324: ob-havo tanlovi — to'g'ri belgi + boshqalari; 2–3 yosh 2 ta, 4–5 yosh 3 ta, 6–7 yosh 4 ta; tartibi kunga qarab. */
export function havoTanlovi({ togri, yosh = 4, kun = 0 }) {
  const hovuz = ["☀️", "☁️", "🌧️", "❄️", "🌅", "🌇"].filter((e) => e !== togri && !(["🌅", "🌇"].includes(e)));
  const soni = yosh < 4 ? 2 : yosh < 6 ? 3 : 4;
  const boshqa = [...hovuz].sort((a, b) => ((hovuz.indexOf(a) * 7 + kun) % 5) - ((hovuz.indexOf(b) * 7 + kun) % 5)).slice(0, soni - 1);
  const variantlar = [...boshqa];
  const joy = Math.abs(Number(kun) || 0) % soni;
  variantlar.splice(joy, 0, togri);
  return { variantlar, togri: joy };
}

/** REV121: kun vaqtiga mos ob-havo gapi (ertalab, kechqurun, kechasi). Kunduzi — ustozning o'z gapi (FEL). */
export const VAQT_HAVO = {
  uz: {
    tong: { quyosh: "Tong otdi! Quyosh endigina chiqib kelyapti." },
    kech: { quyosh: "Kech kirdi. Quyosh botyapti, osmon qip-qizil bo'ldi!" },
    tun: { quyosh: "Tashqarida qorong'i. Osmonda oy va yulduzlar charaqlayapti!", bulut: "Tashqarida qorong'i, yulduzlar bulut ortiga yashirindi.",
      yomgir: "Tashqarida qorong'i, yomg'ir derazani taqillatyapti.", qor: "Tashqarida qorong'i, oppoq qor chiroqlar ostida yaltirayapti!" },
  },
  ru: {
    tong: { quyosh: "Наступило утро! Солнышко только-только встаёт." },
    kech: { quyosh: "Наступил вечер. Солнце садится, небо стало красным!" },
    tun: { quyosh: "На улице темно. На небе сияют луна и звёзды!", bulut: "На улице темно, звёзды спрятались за облака.",
      yomgir: "На улице темно, дождик стучит в окно.", qor: "На улице темно, белый снег блестит под фонарями!" },
  },
  en: {
    tong: { quyosh: "The morning is here! The sun is just coming up." },
    kech: { quyosh: "It's evening. The sun is setting and the sky is turning red!" },
    tun: { quyosh: "It's dark outside. The moon and stars are shining in the sky!", bulut: "It's dark outside, and the stars are hiding behind the clouds.",
      yomgir: "It's dark outside, and the rain is tapping on the window.", qor: "It's dark outside, and the white snow sparkles under the lights!" },
  },
};
const CHIROQ = { uz: "Xonada chiroqni yoqdik — endi yorug'!", ru: "Свет в классе включён — теперь светло!", en: "The lights are on in our classroom — now it's bright!" };
// REV157: 4–7 yosh — ochilish o'rganilayotgan tilda (nemis, fransuz, ispan, arab, turk, xitoy, yapon, koreys)
for (const [til, d] of Object.entries(IMMERSIYA)) {
  if (!VAQT_HAVO[til]) VAQT_HAVO[til] = d.VAQT_HAVO;
  if (!CHIROQ[til]) CHIROQ[til] = d.CHIROQ;
}

/** Darsning o'rganiladigan tili: ovoz matnidagi birinchi [xx] teg. Til darsi bo'lmasa — null. */
export function darsTili(steps = []) {
  for (const s of steps) {
    const m = /\[(en|ru|de|fr|es|ar|tr|zh|ja|ko)\]/i.exec(String(s?.ovoz || ""));
    if (m) return m[1].toLowerCase();
  }
  return null;
}

function yoshi(grade) {
  const m = /(\d)\s*[-–]\s*(\d)/.exec(String(grade || ""));
  return m ? Number(m[1]) : 4;
}

/**
 * Dars boshidagi qadamlar (dars qadamlari formatida): [salomlashish, ob-havo, o'tgan dars (bo'lsa)].
 * opts: { ustoz, til, havo: "quyosh"|"bulut"|"yomgir"|"qor", harorat, oldingi: {mavzu, sozlar:[{say, emoji}]}, grade, kun }
 */
// REV242: ruscha/inglizcha interfeys ustozlari — o'z tilida, o'z ismi bilan gapiradi (oldin o'zbekcha «Men Nilufar opangman»
// matni inglizcha ovozda o'qilardi). Gaplar shu fan ustozining ruscha/inglizcha gaplaridan, ism almashtirilib olinadi.
const PERSONA = { dmitriy: "sardor", daniel: "sardor", svetlana: "malika", oliver: "malika", olga: "nilufar", sarah: "nilufar" };
const ISM_ALMASH = {
  sardor: { ru: [/Сардор-ака/g], en: [/\bSardor\b/g] }, nilufar: { ru: [/Нилуфар-опа/g], en: [/\bNilufar\b/g] }, malika: { ru: [/Малика-опа/g], en: [/\bMalika\b/g] },
};
const YANGI_ISM = { dmitriy: { ru: "Дмитрий Иванович", en: "Mr Dmitry" }, daniel: { ru: "Дэниел", en: "Mr Daniel" }, svetlana: { ru: "Светлана", en: "Svetlana" },
  oliver: { ru: "Оливер", en: "Mr Oliver" }, olga: { ru: "Ольга Сергеевна", en: "Olga" }, sarah: { ru: "Сара", en: "Ms Sarah" } };
export function felFor(ustoz, izoh = "uz") {
  if (izoh !== "uz" && FEL_IZOH[izoh]?.[ustoz]) return FEL_IZOH[izoh][ustoz];
  const asl = PERSONA[ustoz];
  if (asl) {
    const manba = (izoh !== "uz" && FEL_IZOH[izoh]?.[asl]) || FEL[asl];
    const qolip = ISM_ALMASH[asl]?.[izoh] || [];
    const ism = YANGI_ISM[ustoz]?.[izoh] || "";
    const almash = (t) => qolip.reduce((a, re) => a.replace(re, ism), String(t));
    return Object.fromEntries(Object.entries(manba).map(([k, v]) => [k, Array.isArray(v) ? v.map(almash) : typeof v === "string" ? almash(v) : v]));
  }
  return FEL[ustoz] || FEL.nilufar;
}

// REV315: til darsida izoh ustozi (o'zbekcha — Nilufar opa, ruscha — Olga, inglizcha — Sarah) O'ZI salomlashadi va
// til ustozini tanishtiradi («Bugun yonimda Lukas aka — u bizga nemis tilini o'rgatadi»). Oldin izoh ustozi til ustozining
// nomidan gapirardi («Lukas akang keldi»).
const IZOH_PERSONA = { uz: "nilufar", ru: "olga", en: "sarah" };
const TIL_NOMI_UCHUN = {
  uz: { en: "ingliz tilini", ru: "rus tilini", de: "nemis tilini", fr: "fransuz tilini", es: "ispan tilini", ar: "arab tilini", tr: "turk tilini", zh: "xitoy tilini", ja: "yapon tilini", ko: "koreys tilini" },
  ru: { en: "английскому языку", ru: "русскому языку", de: "немецкому языку", fr: "французскому языку", es: "испанскому языку", ar: "арабскому языку", tr: "турецкому языку", zh: "китайскому языку", ja: "японскому языку", ko: "корейскому языку" },
  en: { en: "English", ru: "Russian", de: "German", fr: "French", es: "Spanish", ar: "Arabic", tr: "Turkish", zh: "Chinese", ja: "Japanese", ko: "Korean" },
};
export function tanishtiruv(ustoz, til, izoh = "uz") {
  const i = ISMLAR[ustoz];
  const tn = TIL_NOMI_UCHUN[izoh]?.[til];
  if (!i || !tn) return "";
  const [uz, lat, ru, , , , , erkak] = i;
  if (izoh === "ru") return `Сегодня со мной ${ru} — ${erkak ? "он" : "она"} научит нас ${tn}.`;
  if (izoh === "en") return `Today ${lat} is here with me — ${erkak ? "he" : "she"} will teach us ${tn}.`;
  return `Bugun yonimda ${uz} ${erkak ? "aka" : "opa"} — u bizga ${tn} o'rgatadi.`;
}

export function ochilish({ ustoz = "nilufar", til = null, havo = "quyosh", harorat = null, oldingi = null, grade = "", kun = 0, izoh = "uz", vaqt = "kun", aslIzoh = null, sana = null, xil = 0 } = {}) {
  const tilUstozi = Boolean(til && ISMLAR[ustoz] && IZOH_PERSONA[izoh]);
  const fel = tilUstozi ? felFor(IZOH_PERSONA[izoh], izoh) : felFor(ustoz, izoh);
  const tanish = tilUstozi ? tanishtiruv(ustoz, til, izoh) : "";
  // til darsida — oddiy tanishuv salomi («Salom, quyoshim! Men Nilufar opangman.»), «yangi ertak bilan keldi» emas
  const salomGapi = (arr) => (tilUstozi ? arr[0] : arr[Math.abs(kun + xil) % arr.length]);
  const L = til && OCHILISH_LUGAT[til] ? OCHILISH_LUGAT[til] : null;
  const t = (k) => (L ? `[${til}]${L[k]}[/${til}]` : "");
  const z = (text) => izohTeg(text, izoh);                 // ustozning o'z gapi — izoh tilida
  const g = (tpl, vars) => gap(izoh, tpl, vars);
  const kichik = yoshi(grade) <= 2;
  const pick = (arr) => (Array.isArray(arr) ? arr[Math.abs(kun + xil) % arr.length] : arr);   // REV368: har darsda boshqa gap
  const out = [];
  // ertalab — «Good morning!», kechqurun va kechasi — «Good evening!»
  const kechki = vaqt === "kech" || vaqt === "tun";
  const salom = vaqt === "tong" ? "morning" : kechki && L?.evening ? "evening" : "hello";
  // til darsida vaqtga mos salomni chet tilida o'rgatamiz (t(salom)), boshqa fanlarda — izoh tilida
  const vaqtSalom = L ? "" : vaqt === "tong" ? `${g("Xayrli tong!")} ` : kechki ? `${g("Xayrli kech!")} ` : "";

  // 1) Salomlashish
  out.push({
    turi: "kirish", _ochilish: "salom", sarlavha: gap(izoh, "👋 Salom!").replace(/\[\/?\w\w\]/g, ""),
    ovoz: L
      ? (kichik
        ? `${vaqtSalom}${z(salomGapi(fel.salom))}${tanish ? ` ${z(tanish)}` : ""} ${t(salom)} ${g("Endi sen ayt: {p}", { p: t(salom) })} ⏸`
        : `${vaqtSalom}${z(salomGapi(fel.salom))}${tanish ? ` ${z(tanish)}` : ""} ${t(salom)} ${g("Endi sen ayt: {p}", { p: t(salom) })} ⏸ ${t("how")} ⏸ ${z(pick(fel.javob))} ${g("Sen ham shunday javob ber: {p} ⏸", { p: t("fine") })}`)
      : `${vaqtSalom}${z(pick(fel.salom))} ${g(pick(["Qalaysan? ⏸", "Ishlaring yaxshimi? ⏸", "Kayfiyating qanday? ⏸", "Yaxshi dam oldingmi? ⏸"]))} ${z(pick(fel.javob))}`,
    doska: L ? (kichik ? `👋 ${L[salom]}` : `👋 ${L[salom]}\n🙂 ${L.how}\n😊 ${L.fine}`) : "👋",
  });

  // REV323: bayram kuni — salomdan keyin bayram gapi (izoh tilida; tarjimasi bo'lmagan tilda aytilmaydi)
  const bayram = bayramHozir(sana || new Date());
  const bg = bayram ? bayramGapi(bayram, IZOH_PERSONA[izoh] ? izoh : (izoh === "uz" ? "uz" : izoh)) : null;
  if (bg && out[0]) out[0] = { ...out[0], ovoz: `${out[0].ovoz} ${z(bg)}`, _bayram: bayram };

  // 2) Ob-havo
  const h = HAVO_KEY[havo] ? havo : havo === "momaqaldiroq" ? "yomgir" : "quyosh";
  let qoshimcha = "";
  if (L && harorat !== null && Number.isFinite(Number(harorat))) {
    if (Number(harorat) <= 5) qoshimcha = ` ${g("Tashqari sovuq: {p} Issiq kiyin!", { p: t("cold") })}`;
    else if (Number(harorat) >= 30) qoshimcha = ` ${g("Tashqari issiq: {p} Ko'p suv ich!", { p: t("hot") })}`;
  }
  // REV121: kechasi «quyosh charaqlayapti» emas — oy va yulduzlar; kechqurun — quyosh botyapti; chiroq yoqiladi
  const tunda = vaqt === "tun";
  const hk = tunda && h === "quyosh" && L?.starry ? "starry" : HAVO_KEY[h];
  const belgi = tunda ? (h === "quyosh" ? "🌙" : HAVO_EMOJI[h]) : vaqt === "kech" && h === "quyosh" ? "🌇" : vaqt === "tong" && h === "quyosh" ? "🌅" : HAVO_EMOJI[h];
  const vh = (VAQT_HAVO[izoh] || VAQT_HAVO.uz)[vaqt]?.[h];
  const havoGapi = vh ? z(vh) : z(fel.havo[h]);
  const chiroq = kechki ? ` ${z(CHIROQ[izoh] || CHIROQ.uz)}` : "";
  // REV324: bola havoni O'ZI tanlaydi — ustoz faqat so'raydi, bola derazaga qarab belgini bosadi, keyin ustoz tasdiqlaydi.
  // Tunda (oy va yulduzlar) — tanlov yo'q, avvalgidek aytiladi.
  const havoOvoz = L
    ? `${g("Derazaga qara! {p} ⏸", { p: t("weather") })} ${havoGapi} ${t(hk)}${qoshimcha}${chiroq} ${g("Endi sen ayt: {p}", { p: t(hk) })} ⏸`
    : `${g("Derazaga qara! Bugun havo qanday? ⏸")} ${havoGapi}${chiroq}`;
  // REV331: tanlovlar kunma-kun almashadi — juft kun havo, toq kun fasl (bola har kuni boshqa narsani o'zi topadi)
  // REV344: har darsda bola o'zi topadi — havoni (kunduzi) va faslni; 6–7 yoshda kun poyezdi ham qo'shiladi
  const katta = yoshi(grade) >= 6;
  const kalTanlov = !sana ? false : "fasl";
  const kunTanlovi = Boolean(sana) && katta;
  const tanlov = !tunda ? havoTanlovi({ togri: belgi, yosh: yoshi(grade), kun }) : null;
  out.push({
    turi: "kirish", _ochilish: "havo", ...(tanlov ? { tanlov: { ...tanlov, javob: havoOvoz.slice(havoOvoz.indexOf("⏸") + 1).trim() } } : {}),
    sarlavha: `${belgi} ${gap(izoh, "Bugungi ob-havo").replace(/\[\/?\w\w\]/g, "")}`,
    ovoz: tanlov ? havoOvoz.slice(0, havoOvoz.indexOf("⏸")).trim() : havoOvoz,
    doska: L ? `${belgi} ${L[hk]}` : `${belgi}`,
    // REV154: deraza oldida ko'rsatiladigan ob-havo rasmi (havo_quyosh, havo_tun, havo_kech …)
    _havo: tunda ? (h === "quyosh" ? "tun" : h) : vaqt === "kech" && h === "quyosh" ? "kech" : vaqt === "tong" && h === "quyosh" ? "tong" : h,
  });

  // REV158: 3) Vaqt — hafta kuni, fasl, oy, soat, yil (haqiqiy sana; yoshga va til darsiga qarab)
  if (sana) {
    const kq = kalendarQadami({ til, izoh: aslIzoh || (izoh === til ? "uz" : izoh), yosh: yoshi(grade), sana, tanlov: kalTanlov, kun });
    // REV344: 6–7 yosh — fasldan keyin kun poyezdi (alohida qadam, javobi ichida aytiladi)
    const kunQ = kunTanlovi ? kalendarQadami({ til, izoh: aslIzoh || (izoh === til ? "uz" : izoh), yosh: yoshi(grade), sana, tanlov: "kun", kun }) : null;
    if (kunQ) out.push(kunQ);
    if (kq) out.push(kq);
  }

  // 4) O'tgan dars — 1–3 so'zni bola o'zi eslaydi
  // REV123: takror puxta — kichiklar 2 ta, kattalar 3 ta so'zni eslaydi; har biridan keyin birga takrorlanadi
  const sozlar = (oldingi?.sozlar || []).filter((x) => x?.say).slice(0, 6);   // REV158: o'tgan darsning hamma so'zlari (6 tagacha)
  if (oldingi?.mavzu && sozlar.length) {
    const tl = oldingi.til || til;
    const tag = (x) => (tl ? `[${tl}]${x}[/${tl}]` : x);
    // REV140: avval ustoz so'zni o'zi aytadi (nomini) va takrorlaydi, keyin bola birga aytadi
    const savol = sozlar.map((x) => `${x.emoji ? x.emoji + " " : ""}${g("Bu — {p}.", { p: tag(x.say) })} ${g("Birga aytamiz: {p} ⏸", { p: tag(x.say) })}`).join(" ");
    out.push({
      turi: "kirish", _ochilish: "takror", sarlavha: gap(izoh, "🔁 Esingdami?").replace(/\[\/?\w\w\]/g, ""),
      // REV157: 4–7 yosh (izoh = o'rganilayotgan til) — o'zbekcha mavzu nomi chet ovozida o'qilmasin, aytilmaydi
      ovoz: `${izoh === til ? "" : g("O'tgan safar «{name}» darsini o'tgandik.", { name: z(oldingi.mavzu) })} ${L && tl === til ? t("remember") : g("Esingdami?")} ${savol} ${z(pick(fel.maqtov))} ${g("Endi yangi darsga o'tamiz!")}`,
      doska: sozlar.map((x) => `${x.emoji || "⭐"} ${x.say}`).join("\n"),
    });
  }
  return out.map((st) => ({ ...st, ovoz: birlashtir(st.ovoz) }));   // yonma-yon bir xil teglar — bitta ovoz bo'lagi
}

/**
 * Tugagan darsdan eslab qolinadigan so'zlar (darsning o'rganiladigan so'zlari).
 * REV156: so'z avvalo QADAM SARLAVHASIDAN olinadi («👋 Привет! — salom» → 👋 Привет!) — ovozdagi har teg so'z emas:
 * «Твоя очередь!», «Ещё раз!», «Слушай!» kabi ustoz buyruqlari ro'yxatga, mikrofon so'roviga va rasmga kirmaydi.
 * Sarlavhada so'z bo'lmasa — ovozdagi qisqa teglar (sinf buyruqlarisiz).
 */
const SARLAVHA_SOZ = /^((?:\p{Extended_Pictographic}|\p{Regional_Indicator}|[#*0-9]\uFE0F?\u20E3|\uFE0F|\u200D|\p{Emoji_Modifier})+)\s+(.+)$/u;
export function qadamSozi(s) {
  const head = String(s?.sarlavha || "").replace(/\[\/?[a-z]{2}\]/gi, "").trim();
  if (/^🔁/u.test(head)) return null;
  const m = SARLAVHA_SOZ.exec(head);
  if (!m) return null;
  const say = m[2].split(/\s+[—–]\s+/)[0].trim().replace(/[.!?。！？…]+$/u, "").trim();
  if (!say || say.split(/\s+/).length > 5 || sinfIborasimi(say) || /[·:：]/.test(say)) return null;
  const ovoz = String(s?.ovoz || "");
  const k = iboraNorm(say);
  let til = null;
  // REV157: «[de]Schau! Ich heiße …[/de]» — so'z ustoz buyrug'i bilan bitta tegda bo'lsa ham topiladi
  for (const t of ovoz.matchAll(FOREIGN)) { const n = iboraNorm(t[2]); if (n === k || (k && ` ${n} `.includes(` ${k} `))) { til = t[1].toLowerCase(); break; } }
  if (!til) return null;   // so'z ovozda o'rganiladigan til tegida aytilmagan — bu so'z o'rgatish qadami emas
  return { say, emoji: m[1].replace(/\uFE0F/g, "").trim(), til };
}
export function darsSozlari(steps = [], kinds = [], limit = 6) {
  const out = [];
  const bor = (say) => out.some((x) => iboraNorm(x.say) === iboraNorm(say));
  steps.forEach((s, i) => {
    if (out.length >= limit || (kinds[i] && kinds[i] !== "new")) return;
    const q = qadamSozi(s);
    if (q) { if (!bor(q.say)) out.push(q); return; }
    // sarlavhasiz eski miya: ovozdagi teglar (ustoz buyruqlari tashlab ketiladi)
    const lines = String(s?.doska || "").split(/\n+/);
    for (const m of String(s?.ovoz || "").matchAll(FOREIGN)) {
      const say = m[2].trim().replace(/[.!?。！？]+$/u, "");
      if (!say || say.split(/\s+/).length > 4 || NOT_TARGET.test(say) || sinfIborasimi(say) || /[:：⏸]/.test(say)) continue;
      if (bor(say)) continue;
      const line = lines.find((l) => l.toLowerCase().includes(say.toLowerCase())) || "";
      let emoji = (line.match(/^[\p{Extended_Pictographic}\u200D\uFE0F\u20E3#*0-9]+/u) || [""])[0].trim();
      if (!/[\p{Extended_Pictographic}\u20e3]/u.test(emoji)) emoji = "";
      out.push({ say, emoji, til: m[1].toLowerCase() });
      if (out.length >= limit) return;
    }
  });
  return out;
}

// REV156: dars miyasidagi «kirish» qadami ustoz salomlashgandan keyin keladi — undagi salom va «Men — Kabutar qushcha»
// kabi gaplar takror bo'lmasin. Gaplar til teglari bilan birga bo'linadi; salom/tanishtiruv gaplari tashlanadi.
const SALOM_GAP = /^(?:salom|assalomu|assalom|xayrli (?:tong|kun|kech)|привет|здравствуй|здравствуйте|добр(?:ое|ый) (?:утро|день|вечер)|hello|hi|hey|good (?:morning|afternoon|evening)|bip|gu-gu|бип|гу-гу|beep|coo|men\s*[—–-]|я\s*[—–-]|i'?m\b|i am\b|mening ismim\s*[—–-]|меня зовут\s+(?:kabu|кабу|kabutar|кабутар)|my name is (?:kabu|kabutar))(?![\p{L}])/iu;
export function kirishniTozala(step) {
  if (!step) return null;
  const ovoz = String(step.ovoz || "");
  const bolaklar = [];
  let last = 0;
  const TEG = /\[(uz|en|ru|de|fr|es|ar|tr|zh|ja|ko)\]([\s\S]*?)\[\/\1\]/gi;
  for (const m of ovoz.matchAll(TEG)) {
    if (m.index > last) bolaklar.push({ til: null, matn: ovoz.slice(last, m.index) });
    bolaklar.push({ til: m[1].toLowerCase(), matn: m[2] });
    last = m.index + m[0].length;
  }
  if (last < ovoz.length) bolaklar.push({ til: null, matn: ovoz.slice(last) });
  const qoldi = [];
  for (const b of bolaklar) {
    const gaplar = b.matn.split(/(?<=[.!?…])\s+/).map((g) => g.trim()).filter(Boolean)
      .filter((g) => !SALOM_GAP.test(g.replace(/^[^\p{L}]+/u, "")));
    if (!gaplar.length) continue;
    const matn = gaplar.join(" ");
    qoldi.push(b.til ? `[${b.til}]${matn}[/${b.til}]` : matn);
  }
  const yangi = qoldi.join(" ").replace(/\s{2,}/g, " ").trim();
  if (!/\p{L}{2}/u.test(yangi.replace(/\[\/?[a-z]{2}\]/gi, ""))) return null;
  return { ...step, ovoz: yangi };
}
