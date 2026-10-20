import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const src = (p) => fs.readFileSync(new URL(p, import.meta.url), "utf8");

// Haqiqiy quvurdan (bogcha_spiral → AI miya Excel → import → dars) olingan rus tili 4–5 yosh «Salom va rahmat» qadamlari
const QADAMLAR = [
  { turi: "kirish", sarlavha: "👋 Salom va rahmat", doska: "🕊️ Salom va rahmat", ovoz: "[ru]Привет, друзья![/ru] Salom, bolajonlar! Men — Kabutar qushcha. Gu-gu! Yozda siz o'sdingiz, men ham o'sdim! Keling, avval eski do'stlarimiz — sehrli so'zlarni eslaymiz, keyin yangilarini o'rganamiz." },
  { turi: "qoida", sarlavha: "👋 Привет! — salom", doska: "👋 Привет!\nPrivet!\nsalom", ovoz: "Yangi so'z: [ru]Привет![/ru] Bu — salom degani. [ru]Твоя очередь![/ru] Baland ovozda ayt: [ru]Привет![/ru] [ru]Ещё раз![/ru] [ru]Привет![/ru]" },
  { turi: "qoida", sarlavha: "🚪 До свидания! — xayr", doska: "🚪 До свидания!\nDo svidaniya!\nxayr", ovoz: "[ru]Слушай![/ru] [ru]До свидания![/ru] Bu — xayr. [ru]Повторяй за мной:[/ru] [ru]До свидания![/ru]" },
  { turi: "qoida", sarlavha: "🙏 Спасибо! — rahmat", doska: "🙏 Спасибо!\nSpasibo!\nrahmat", ovoz: "[ru]Смотри![/ru] Qara, bu — [ru]Спасибо![/ru] O'zbekcha — rahmat. [ru]Послушай и повтори:[/ru] [ru]Спасибо![/ru]" },
  { turi: "amaliy", sarlavha: "Topshiriq · 🎲 Top-chi o'yini", doska: "[ru]Время игры![/ru] Men aytaman, sen rasmni barmog'ing bilan bos: [ru]Привет![/ru], [ru]До свидания![/ru], [ru]Спасибо![/ru], [ru]четыре[/ru].", ovoz: "Endi amaliy topshiriq: 🎲 Top-chi o'yini. [ru]Время игры![/ru] Men aytaman, sen rasmni barmog'ing bilan bos: [ru]Привет![/ru], [ru]До свидания![/ru], [ru]Спасибо![/ru], [ru]четыре[/ru]." },
];

test("REV156: darsning so'zlari sarlavhadan — ustoz buyruqlari («Твоя очередь», «Слушай») so'z emas", async () => {
  const { darsSozlari } = await import("./kid/darsOchilishi.js");
  const s = darsSozlari(QADAMLAR.slice(1, 4), ["new", "new", "new"]);
  assert.deepEqual(s.map((x) => x.say), ["Привет", "До свидания", "Спасибо"]);
  assert.deepEqual(s.map((x) => x.emoji), ["👋", "🚪", "🙏"]);
  const { sinfIborasimi } = await import("./kid/sinfIboralari.js");
  for (const x of ["Твоя очередь!", "Ещё раз!", "Слушай!", "Your turn!", "Noch mal!", "¡Otra vez!"]) assert.ok(sinfIborasimi(x), x);
  for (const x of ["Привет!", "Hello!", "Спасибо!", "cat"]) assert.ok(!sinfIborasimi(x), x);
});

test("REV156: mikrofon faqat qadamning o'z so'zini so'raydi", async () => {
  const { sozBolaklari } = await import("./lesson/sozAytish.js");
  const b = sozBolaklari("Yangi so'z: [ru]Привет![/ru] [ru]Твоя очередь![/ru] ⏸ Baland ovozda ayt: [ru]Привет![/ru] ⏸", "ru", ["Привет"]);
  assert.deepEqual(b.filter((x) => x.soz).map((x) => x.soz.phrase), ["Привет"]);
});

test("REV156: ustoz salomlashgandan keyin dars kirishida yana «Salom, bolajonlar!» aytilmaydi", async () => {
  const { kirishniTozala } = await import("./kid/darsOchilishi.js");
  const k = kirishniTozala(QADAMLAR[0]);
  assert.doesNotMatch(k.ovoz, /Привет|Salom|Kabutar qushcha|Gu-gu/);
  assert.match(k.ovoz, /eslaymiz/);
  assert.equal(kirishniTozala({ turi: "kirish", ovoz: "Salom! Men — robot Kabu. Bip-bip!" }), null);
  assert.equal(kirishniTozala({ ovoz: "Hikoya eshitamiz." }).ovoz, "Hikoya eshitamiz.");
  // tartib: ochilish → kirish → takror → yangi
  const d = src("./lesson/DarsXonasi.jsx");
  assert.match(d, /\[\.\.\.opening, \.\.\.kirishlar, \.\.\.boshi\.takror, \.\.\.qolgan\]/);
});

test("REV156: «🎲 Top-chi» o'yini doskasi matn bo'lsa ham o'yin boshlanadi (bola bosguncha kutadi, ✓ belgisi)", async () => {
  const { gameTargets, stepKind } = await import("./kid/kidStageRules.js");
  const kinds = QADAMLAR.map((s) => stepKind(s, "Salom va rahmat"));
  const t = gameTargets(QADAMLAR[4], QADAMLAR, kinds);
  assert.deepEqual(t.map((x) => x.emoji), ["👋", "🚪", "🙏"]);
  const d = src("./lesson/DarsXonasi.jsx");
  assert.doesNotMatch(d, /reveal\(g\)/);              // o'zi javobni ochib o'tib ketmaydi
  assert.match(d, /topilgan/);
  assert.match(src("./kid/UstozSahna.jsx"), /us-tick/);
});

test("REV156: test savoli so'zni aytsa — variantlar o'qilmaydi", async () => {
  const { kidOptions } = await import("./test/kidQuizRules.js");
  const o = kidOptions({ option_a: "👋 [ru]Привет![/ru]", option_b: "🚪 [ru]До свидания![/ru]" }, "Qani, toping: [ru]Привет![/ru] qayerda?");
  assert.ok(o.every((x) => x.listen !== "audio"));
  const q = kidOptions({ option_a: "👋 [ru]Привет![/ru]", option_b: "🚪 [ru]До свидания![/ru]" }, "Do'stingiz uyiga ketyapti. Nima deysiz?");
  assert.ok(q.some((x) => x.listen === "audio"));   // savol so'zni aytmasa — eshitib tanlaydi
});

test("REV156: buyruq teg o'rtasida bo'lsa teglar buzilmaydi", async () => {
  const { ismOldin } = await import("./lesson/kidLessonRules.js");
  const s = ismOldin("[ru]Послушай и повтори:[/ru] [ru]Спасибо![/ru]");
  assert.equal(s, "[ru]Послушай и повтори:[/ru] [ru]Спасибо.[/ru] [ru]Спасибо![/ru] ⏸");
});

test("REV156: «Tushuntir» faqat shu qismni sekinlashtiradi; jonli Kabu; bolalar ekranida gap yo'q", () => {
  const d = src("./lesson/DarsXonasi.jsx");
  assert.match(d, /const qaytar = \(\) => \{ setRate\(avvalgi\)/);
  assert.match(src("./kid/RobotKabu.jsx"), /KABU_MARKUP/);
  assert.match(src("./test/KidQuiz.jsx"), /<RobotKabu/);
  assert.doesNotMatch(d, /"Endi sen ayt!"\)\}<\/small>/);
  assert.match(src("./lesson/VoiceCheck.jsx"), /dx-voice-rasm/);
});
