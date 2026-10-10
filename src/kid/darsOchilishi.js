// REV110: bog'cha darsining boshlanishi — ustoz o'z uslubida salomlashadi, bugungi ob-havoni aytadi va o'tgan
// darsdan so'raydi. Sof funksiyalar (brauzersiz sinaladi). «⏸» — bolaga javob berish uchun jimlik (TTS qo'yadi).
import { OCHILISH_LUGAT } from "./ochilishLugat.js";
import { FEL_IZOH, birlashtir, gap, izohTeg } from "./izohTil.js";

const FOREIGN = /\[(en|ru|de|fr|es|ar|tr|zh|ja|ko)\]([\s\S]*?)\[\/\1\]/gi;
const NOT_TARGET = /^(?:say it together|say it with me|repeat after me|look|listen|listen and repeat|again|one more time|your turn|now you|good job|well done|great job|hello everyone)$/i;

/** Har ustozning o'z fe'li: salomi, maqtovi, ob-havoga munosabati. Kunga qarab almashadi — har kuni bir xil emas. */
export const FEL = {
  sardor: {
    salom: ["Salom, aqlli bolajon! Men Sardor akangman.", "Assalomu alaykum, kichkina matematik! Sardor akang keldi.", "Salom, do'stim! Bugun ham birga sanaymiz, hisoblaymiz!"],
    javob: "Men ham yaxshiman, rahmat! Kayfiyatim xuddi besh baho!",
    maqtov: ["Zo'r hisobladik!", "Mana bu aqlli bola!", "Bir, ikki, uch — barakalla!"],
    havo: { quyosh: "Bugun quyosh charaqlab turibdi!", bulut: "Bugun osmonda bulutlar ko'p. Sanab ko'ramizmi?", yomgir: "Bugun yomg'ir yog'yapti. Tomchilarni sanasak, adashib ketamiz!", qor: "Bugun qor yog'yapti! Qor parchalari son-sanoqsiz!" },
  },
  nilufar: {
    salom: ["Salom, quyoshim! Men Nilufar opangman.", "Assalomu alaykum, jonim! Nilufar opang yangi ertak bilan keldi.", "Salom, mening yulduzcham! Seni sog'indim!"],
    javob: "Men ham yaxshiman, rahmat! Seni ko'rib, yana ham yaxshi bo'ldim!",
    maqtov: ["Ofarin, quyoshim!", "Ertakdagidek zo'r!", "Sen juda aqllisan!"],
    havo: { quyosh: "Bugun quyosh ertakdagidek nur sochyapti!", bulut: "Bugun bulutlar osmonda sayr qilyapti.", yomgir: "Bugun yomg'ir tomchilari derazani taqillatyapti.", qor: "Bugun oppoq qor yog'yapti, xuddi ertakdagidek!" },
  },
  malika: {
    salom: ["Salom, kichkina sayohatchi! Men Malika opangman.", "Assalomu alaykum, kashfiyotchi! Malika opang yangi sayohatga chaqiryapti.", "Salom, do'stim! Lupamni oldim — bugun nimani kashf qilamiz?"],
    javob: "Men ham yaxshiman, rahmat! Sayohatga tayyorman!",
    maqtov: ["Ajoyib kashfiyot!", "Haqiqiy sayohatchi!", "Qoyil, juda zo'r!"],
    havo: { quyosh: "Bugun quyoshli kun — sayohatga juda mos!", bulut: "Bugun bulutli. Bulutlar shaklini kuzatamiz!", yomgir: "Bugun yomg'ir. O'simliklar suv ichib, xursand bo'lyapti!", qor: "Bugun qor yog'yapti. Tabiat oppoq ko'ylak kiydi!" },
  },
};

const HAVO_KEY = { quyosh: "sunny", bulut: "cloudy", yomgir: "rainy", qor: "snowy" };
const HAVO_EMOJI = { quyosh: "☀️", bulut: "☁️", yomgir: "🌧️", qor: "❄️" };

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
export function ochilish({ ustoz = "nilufar", til = null, havo = "quyosh", harorat = null, oldingi = null, grade = "", kun = 0, izoh = "uz", vaqt = "kun" } = {}) {
  const fel = (izoh !== "uz" && FEL_IZOH[izoh]?.[ustoz]) || FEL[ustoz] || FEL.nilufar;
  const L = til && OCHILISH_LUGAT[til] ? OCHILISH_LUGAT[til] : null;
  const t = (k) => (L ? `[${til}]${L[k]}[/${til}]` : "");
  const z = (text) => izohTeg(text, izoh);                 // ustozning o'z gapi — izoh tilida
  const g = (tpl, vars) => gap(izoh, tpl, vars);
  const kichik = yoshi(grade) <= 2;
  const pick = (arr) => arr[Math.abs(kun) % arr.length];
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
        ? `${vaqtSalom}${z(pick(fel.salom))} ${t(salom)} ${g("Endi sen ayt: {p}", { p: t(salom) })} ⏸`
        : `${vaqtSalom}${z(pick(fel.salom))} ${t(salom)} ⏸ ${t("how")} ⏸ ${z(fel.javob)} ${g("Sen ham shunday javob ber: {p} ⏸", { p: t("fine") })}`)
      : `${vaqtSalom}${z(pick(fel.salom))} ${g("Qalaysan? ⏸")} ${z(fel.javob)}`,
    doska: L ? (kichik ? `👋 ${L[salom]}` : `👋 ${L[salom]}\n🙂 ${L.how}\n😊 ${L.fine}`) : "👋",
  });

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
  out.push({
    turi: "kirish", _ochilish: "havo", sarlavha: `${belgi} ${gap(izoh, "Bugungi ob-havo").replace(/\[\/?\w\w\]/g, "")}`,
    ovoz: L
      ? `${g("Derazaga qara! {p} ⏸", { p: t("weather") })} ${havoGapi} ${t(hk)}${qoshimcha}${chiroq} ${g("Endi sen ayt: {p}", { p: t(hk) })} ⏸`
      : `${g("Derazaga qara! Bugun havo qanday? ⏸")} ${havoGapi}${chiroq}`,
    doska: L ? `${belgi} ${L[hk]}` : `${belgi}`,
  });

  // 3) O'tgan dars — 1–3 so'zni bola o'zi eslaydi
  const sozlar = (oldingi?.sozlar || []).filter((x) => x?.say).slice(0, kichik ? 1 : 3);
  if (oldingi?.mavzu && sozlar.length) {
    const tl = oldingi.til || til;
    const tag = (x) => (tl ? `[${tl}]${x}[/${tl}]` : x);
    const savol = sozlar.map((x) => `${x.emoji ? x.emoji + " " : ""}${g("Bu nima? ⏸")} ${tag(x.say)}!`).join(" ");
    out.push({
      turi: "kirish", _ochilish: "takror", sarlavha: gap(izoh, "🔁 Esingdami?").replace(/\[\/?\w\w\]/g, ""),
      ovoz: `${g("O'tgan safar «{name}» darsini o'tgandik.", { name: z(oldingi.mavzu) })} ${L && tl === til ? t("remember") : g("Esingdami?")} ${savol} ${z(pick(fel.maqtov))} ${g("Endi yangi darsga o'tamiz!")}`,
      doska: sozlar.map((x) => `${x.emoji || "⭐"} ${x.say}`).join("\n"),
    });
  }
  return out.map((st) => ({ ...st, ovoz: birlashtir(st.ovoz) }));   // yonma-yon bir xil teglar — bitta ovoz bo'lagi
}

/**
 * Tugagan darsdan eslab qolinadigan so'zlar: yangi bilim qadamlaridagi qisqa chet so'zlar (4 so'zgacha),
 * emojisi doskadagi shu so'z yozilgan qatordan olinadi.
 */
export function darsSozlari(steps = [], kinds = [], limit = 6) {
  const out = [];
  steps.forEach((s, i) => {
    if (kinds[i] && kinds[i] !== "new") return;
    const lines = String(s?.doska || "").split(/\n+/);
    for (const m of String(s?.ovoz || "").matchAll(FOREIGN)) {
      const say = m[2].trim().replace(/[.!?。！？]+$/u, "");
      if (!say || say.split(/\s+/).length > 4 || NOT_TARGET.test(say) || /[:：⏸]/.test(say)) continue;
      if (out.some((x) => x.say.toLowerCase() === say.toLowerCase())) continue;
      const line = lines.find((l) => l.toLowerCase().includes(say.toLowerCase())) || "";
      let emoji = (line.match(/^[\p{Extended_Pictographic}‍️⃣#*0-9]+/u) || [""])[0].trim();
      if (!/[\p{Extended_Pictographic}\u20e3]/u.test(emoji)) emoji = "";
      out.push({ say, emoji, til: m[1].toLowerCase() });
      if (out.length >= limit) return;
    }
  });
  return out;
}
