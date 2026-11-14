import test from "node:test"; import assert from "node:assert/strict";
import { haroratDarajasi, havoMos, haroratQoshimcha, HAVO_MOS, HARORAT_QOSHIMCHA } from "./havoMos.js";
import { ochilish } from "./darsOchilishi.js";
import { kalendarQadami, VAGON, KUN_YORDAM, KUN_SAVOL } from "./kalendar.js";
import { qadamOyini } from "../lesson/oyinQadam.js";
import { oyinTanla, DARSDA_YOQ } from "./oyin/oyinRules.js";
import { XONA_OYINLAR, xonaOyinlari } from "./oyinXona/xonaRules.js";

const NOYABR = new Date(2026, 10, 14, 11, 0);   // shanba, kuz
const IYUL = new Date(2026, 6, 15, 11, 0);      // chorshanba, yoz
const YANVAR = new Date(2027, 0, 12, 11, 0);    // seshanba, qish
const havoQadami = (o) => ochilish({ ustoz: "nilufar", grade: "4-5 yosh", kun: 3, ...o }).find((s) => s._ochilish === "havo");
const gapi = (o) => { const q = havoQadami(o); return `${q.ovoz} ${q.tanlov?.javob || ""}`; };

test("harorat darajalari va faslga qarab taxmin", () => {
  assert.deepEqual([-5, 0, 1, 9, 10, 17, 18, 27, 28, 41].map((t) => haroratDarajasi(t)), ["ayoz", "ayoz", "sovuq", "sovuq", "salqin", "salqin", "iliq", "iliq", "issiq", "issiq"]);
  assert.equal(haroratDarajasi(null, 0), "sovuq"); assert.equal(haroratDarajasi(null, 3), "salqin"); assert.equal(haroratDarajasi(null, 2), null); assert.equal(haroratDarajasi(null), null); assert.equal(haroratDarajasi("", 1), null);
});

test("REV545: sovuq quyoshli kunda «ertakdagidek nur sochyapti» DEYILMAYDI — sovuqligi aytiladi", () => {
  for (const ustoz of ["nilufar", "sardor", "malika"]) for (const kun of [0, 1, 2, 3, 4]) {
    const g = gapi({ ustoz, havo: "quyosh", harorat: 4, sana: NOYABR, kun });
    assert.ok(!/ertakdagidek|charaqlab turibdi|sayohatga juda mos/.test(g), `${ustoz} kun ${kun}: ${g}`);
    assert.match(g, /sovuq/, g);
  }
  assert.match(gapi({ havo: "quyosh", harorat: -6, sana: YANVAR }), /ayoz|muzdek/);
  assert.match(gapi({ havo: "quyosh", harorat: 4, sana: NOYABR, kun: 0 }), /Kuz quyoshi/);
});

test("iliq quyoshli kunda ustozning o'z gapi qoladi; jaziramada — issiqligi aytiladi", () => {
  assert.match(gapi({ ustoz: "nilufar", havo: "quyosh", harorat: 23, sana: IYUL }), /ertakdagidek nur sochyapti/);
  assert.match(gapi({ ustoz: "sardor", havo: "quyosh", harorat: 22, sana: IYUL }), /charaqlab turibdi/);
  assert.match(gapi({ havo: "quyosh", harorat: 38, sana: IYUL }), /issiq|jazirama/);
});

test("bulutli kunda «quyosh bulutlar orasidan…» ham uchraydi (savol yoki «har zamonda»)", () => {
  const hamma = [0, 1, 2, 3, 4, 5].map((kun) => gapi({ havo: "bulut", harorat: 6, sana: NOYABR, kun })).join(" | ");
  assert.match(hamma, /bulutlar orasidan/); assert.match(hamma, /sovuq/);
  assert.match(gapi({ havo: "yomgir", harorat: 3, sana: NOYABR }), /sovuq/);
});

test("harorat noma'lum bo'lsa — fasl bo'yicha; sana ham bo'lmasa — eski gap (o'zgarmaydi)", () => {
  assert.match(gapi({ havo: "quyosh", harorat: null, sana: YANVAR }), /sovuq/);                                  // qish
  assert.match(gapi({ havo: "quyosh", harorat: null, sana: IYUL }), /ertakdagidek/);                              // yoz — ustoz gapi
  assert.match(gapi({ havo: "quyosh", harorat: null }), /ertakdagidek/);                                          // sana yo'q
});

test("rus va ingliz tilida ham; boshqa tilda — null (ustoz gapi qoladi); hamma darajada gap bor", () => {
  assert.match(havoMos({ h: "quyosh", harorat: 3, fasl: 3, izoh: "ru" }), /холодно/); assert.match(havoMos({ h: "quyosh", harorat: 3, fasl: 3, izoh: "en", kun: 0 }), /cold/);
  assert.equal(havoMos({ h: "quyosh", harorat: 3, izoh: "de" }), null); assert.equal(havoMos({ h: "quyosh", harorat: 22, izoh: "uz" }), null);
  assert.ok(!/\{F\}/.test(havoMos({ h: "quyosh", harorat: 3, fasl: null, izoh: "uz", kun: 0 })));
  for (const til of ["uz", "ru", "en"]) { for (const d of ["ayoz", "sovuq", "salqin", "issiq"]) assert.ok(HAVO_MOS[til].quyosh[d].length >= 2, `${til} ${d}`);
    assert.deepEqual(Object.keys(HARORAT_QOSHIMCHA[til]), ["ayoz", "sovuq", "issiq"]); }
  assert.equal(haroratQoshimcha({ harorat: 20 }), ""); assert.match(haroratQoshimcha({ harorat: 2 }), /sovuq/);
});

test("ertalab va kechqurun: kun vaqti gapiga sovuq qo'shimchasi qo'shiladi", () => {
  assert.match(gapi({ havo: "quyosh", harorat: 2, sana: NOYABR, vaqt: "tong" }), /Tong otdi.*sovuq/s);
  assert.ok(!/sovuq/.test(gapi({ havo: "quyosh", harorat: 21, sana: IYUL, vaqt: "tong" })));
});

test("REV545: kun poyezdi 2–7 yoshning hammasida; bola BUTUN haftani ko'radi — 1 dan 7 gacha yettita vagon tartib bilan", () => {
  for (const grade of ["2-3 yosh", "4-5 yosh", "6-7 yosh"]) for (const kun of [0, 3, 9]) {
    const q = ochilish({ grade, sana: NOYABR, havo: "bulut", harorat: 5, kun }).find((s) => s._ochilish === "kun");
    assert.ok(q, `${grade}: kun qadami yo'q`);
    assert.deepEqual(q.tanlov.variantlar, VAGON, `${grade}: yettita vagon tartib bilan`);   // kunga qarab aralashmaydi
    assert.equal(q.tanlov.togri, 5); assert.equal(q.tanlov.variantlar[q.tanlov.togri], "6️⃣");   // shanba — 6-kun
    assert.match(q.tanlov.javob, /shanba/i); assert.match(q.doska, /shanba/);
  }
  // har hafta kuni o'z vagonida: dushanba — 1 … yakshanba — 7
  for (let k = 0; k < 7; k += 1) { const q = kalendarQadami({ yosh: 4, sana: new Date(2026, 10, 16 + k), tanlov: "kun" }); assert.equal(q.tanlov.togri, k); }
  const kichik = kalendarQadami({ yosh: 3, sana: NOYABR, tanlov: "kun" });
  assert.match(kichik.ovoz, /Haftada yetti kun bor\. Bugun — shanba\. Shanba — haftaning oltinchi kuni\. Oltinchi vagonni top!/);
  assert.equal(kalendarQadami({ yosh: 6, sana: NOYABR, tanlov: "kun" }).ovoz, KUN_SAVOL.uz);   // 6–7 yosh — o'zi topadi
  assert.match(kalendarQadami({ yosh: 4, sana: new Date(2026, 10, 16), tanlov: "kun" }).ovoz, /dushanba.*birinchi kuni/);
});

test("kun yordami 11 tilda, o'rinbosarlar qolmaydi", () => {
  for (const til of Object.keys(KUN_SAVOL)) { assert.ok(KUN_YORDAM[til], til);
    const q = kalendarQadami({ til, izoh: "uz", yosh: 4, sana: NOYABR, tanlov: "kun" }); assert.ok(!/\{[DdnOo]\}/.test(q.ovoz), `${til}: ${q.ovoz}`); assert.match(q.ovoz, /6|olti/i, til); }
});

test("REV545: 117 «Ayt va och» darsda chiqmaydi — o'rniga 116 «Eshit va bos»; boshqa o'yinlar o'zgarmaydi", () => {
  const step = { oyin: 117, doska: "🍎 olma\n🍐 nok\n🍌 banan" };
  assert.deepEqual(qadamOyini(step, { yosh: "4-5" })?.id, 116);
  assert.equal(qadamOyini({ ...step, oyin: "117" }, { yosh: "2-3" })?.id, 116);
  assert.equal(qadamOyini({ ...step, oyin: 116 }, { yosh: "4-5" })?.id, 116); assert.equal(qadamOyini({ ...step, oyin: 83 }, { yosh: "4-5" })?.id, 83);
  assert.ok(DARSDA_YOQ.has(117));
  const EL = ["🍎", "🍐", "🍌", "🍇", "🍓", "🍒"].map((e, i) => ({ emoji: e, uz: `m${i}` }));
  for (let urug = 1; urug <= 300; urug += 1) for (const yosh of ["2-3", "4-5", "6-7"]) assert.notEqual(oyinTanla({ elementlar: EL, yosh, tarix: [], urug }), 117);
});

test("117 «Ayt va och» o'yin xonasida QOLADI (faqat darslardan olingan)", () => {
  assert.ok(XONA_OYINLAR.includes(117));
  for (const yosh of ["2-3", "4-5", "6-7"]) assert.ok(xonaOyinlari(yosh).some((o) => o.id === 117), yosh);
});
