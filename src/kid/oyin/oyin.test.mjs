// REV324: o'yin dvigateli sinovlari — node:test bilan, brauzersiz (faqat sof qoidalar: oyinRules.js, oyinMatn.js).
import test from "node:test";
import assert from "node:assert/strict";
import {
  OYINLAR, YOSHLAR, HARAKATLAR, KUN_MS, DAVOMIYLIK,
  oyinTanla, oyinYasa, tekshir, maslahat, qiyinlikMoslash, variantSoni, elementlarTayyor, sonOraligi,
  aytishBaho, raundGapi, javobGapi, taxminiySoniya, yoshNorm, oyinOl, yulduzlar,
} from "./oyinRules.js";
import { OYIN_MATN, IZOH_TILLARI, oyinMatn } from "./oyinMatn.js";

const EL = [
  ["cat", "mushuk", "🐱"], ["dog", "it", "🐶"], ["apple", "olma", "🍎"], ["ball", "to‘p", "⚽"],
  ["sun", "quyosh", "☀️"], ["car", "mashina", "🚗"], ["fish", "baliq", "🐟"], ["bird", "qush", "🐦"],
].map(([say, uz, emoji]) => ({ say, uz, emoji, image: "", rom: "" }));
const IDLAR = [116, 117, 83, 89, 88, 86, 90, 91, 32, 31, 35, 38, 55, 97, 33, 68, 76, 103, 93, 106, 114, 61, 62, 63, 64, 49, 57, 43, 59, 149, 154, 161, 162, 168, 150, 96, 14, 18, 148, 94, 158, 147, 95, 165, 152, 146, 29, 157, 153, 15, 156, 166, 121, 123, 142, 118, 120];   // REV335: fazoviy o'yinlar
const URUGLAR = Array.from({ length: 25 }, (_, i) => i + 1);
const kalitlar = (r) => r.variantlar.map((v) => v.k);
const takrorsiz = (arr) => new Set(arr).size === arr.length;

/** Raundda to'g'ri javob bormi — raund turiga qarab. */
function togriBor(r) {
  switch (r.tur) {
    case "tanlov": case "aytish": case "sanash": return kalitlar(r).includes(r.togri);
    case "juft": return r.togri.every((k) => r.variantlar.filter((c) => c.juft === k).length === 2)
      && r.variantlar.every((c) => r.togri.includes(c.juft));
    case "tartib": return r.togri.length === r.variantlar.length && r.togri.every((k) => kalitlar(r).includes(k));
    case "savat": return r.variantlar.filter((v) => v.el.k === r.savol.el.k).length >= r.savol.soni;
    default: return false;
  }
}

/** O'yinni xatosiz oxirigacha o'ynash (maslahat → tekshir). */
function oxirigacha(h) {
  let s = h;
  for (let i = 0; i < 500 && !s.tugadi; i += 1) {
    const n = tekshir(s, maslahat(s));
    assert.notEqual(n.togri, false, `${h.id}: maslahat noto'g'ri javob berdi`);
    s = n.holat;
  }
  return s;
}

test("REV324: katalog — 15 ta o'yin, maydonlari to'g'ri", () => {
  assert.deepEqual(OYINLAR.map((o) => o.id).sort((a, b) => a - b), [...IDLAR].sort((a, b) => a - b));
  for (const o of OYINLAR) {
    assert.ok(o.nom && typeof o.nom === "string", `${o.id} nom`);
    assert.ok(o.yosh.length && o.yosh.every((y) => YOSHLAR.includes(y)), `${o.id} yosh`);
    assert.ok(HARAKATLAR.includes(o.harakat), `${o.id} harakat`);
    assert.equal(typeof o.kerak.min_element, "number", `${o.id} kerak.min_element`);
    for (const y of o.yosh) {
      const s = taxminiySoniya(o.id, y);
      assert.ok(s >= DAVOMIYLIK.min && s <= DAVOMIYLIK.max, `${o.id} ${y}: ${s} s (40–90 bo'lishi kerak)`);
    }
  }
  assert.equal(oyinOl(91).harakat, "surish");
  assert.equal(oyinOl(32).harakat, "surish");
  assert.equal(oyinOl(117).harakat, "aytish");
});

test("REV324: har o'yin, har yosh — oyinYasa to'g'ri javobni o'z ichiga oladi, variantlar takrorsiz", () => {
  for (const o of OYINLAR) {
    for (const y of o.yosh) {
      for (const urug of URUGLAR) {
        const h = oyinYasa(o.id, { elementlar: EL, yosh: y, urug });
        assert.ok(h, `${o.id} ${y} yasalmadi`);
        assert.equal(h.raundlar.length, o.raund[y], `${o.id} ${y} raundlar soni`);
        for (const r of h.raundlar) {
          assert.ok(togriBor(r), `${o.id} ${y} urug ${urug}: to'g'ri javob yo'q`);
          assert.ok(takrorsiz(kalitlar(r)), `${o.id} ${y}: variant kalitlari takrorlandi`);
          // element variantlari (kartalar/juftlar emas) — bir xil element ikki marta chiqmaydi
          if (r.variantlar.every((v) => String(v.k).startsWith("e:"))) {
            assert.ok(takrorsiz(r.variantlar.map((v) => v.el.k)), `${o.id} ${y}: bir xil rasm ikki marta`);
          }
          if (r.variantlar.every((v) => v.son !== undefined)) {
            assert.ok(takrorsiz(r.variantlar.map((v) => v.son)), `${o.id} ${y}: bir xil son ikki marta`);
            assert.ok(r.variantlar.every((v) => v.son >= 1), `${o.id} ${y}: son 1 dan kichik`);
          }
        }
      }
    }
  }
});

test("REV324: tanlovlar soni yoshga qarab — 2-3: 2, 4-5: 3, 6-7: 4", () => {
  assert.equal(variantSoni("2-3"), 2);
  assert.equal(variantSoni("4-5"), 3);
  assert.equal(variantSoni("6-7"), 4);
  assert.equal(variantSoni(3), 2);
  assert.equal(variantSoni("6–7 yosh"), 4);
  const TANLOV = [116, 117, 83, 88, 90, 31, 35, 38, 33, 55];   // n ta tanlov (55 — n ta juft)
  for (const id of TANLOV) {
    for (const y of oyinOl(id).yosh) {
      const h = oyinYasa(id, { elementlar: EL, yosh: y, urug: 3 });
      for (const r of h.raundlar) assert.equal(r.variantlar.length, variantSoni(y), `${id} ${y}`);
    }
  }
  for (const y of YOSHLAR) {
    const n = variantSoni(y);
    for (const r of oyinYasa(89, { elementlar: EL, yosh: y, urug: 3 }).raundlar) assert.equal(r.variantlar.length, n * 2, `89 ${y}: ${n} juft`);
    for (const r of oyinYasa(86, { elementlar: EL, yosh: y, urug: 3 }).raundlar) assert.equal(r.variantlar.length, n + 1, `86 ${y}: n+1 karta`);
    for (const r of oyinYasa(97, { elementlar: EL, yosh: y, urug: 3 }).raundlar) assert.deepEqual(kalitlar(r), ["ha", "yoq"]);
  }
  for (const y of ["4-5", "6-7"]) {
    for (const r of oyinYasa(91, { elementlar: EL, yosh: y, urug: 3 }).raundlar) assert.equal(r.variantlar.length, variantSoni(y), `91 ${y}`);
  }
});

test("REV324: variantlar aralashadi — to'g'ri javob doim bir joyda emas", () => {
  for (const id of [116, 83, 88, 90, 31, 35, 38, 33, 55, 86]) {
    const y = oyinOl(id).yosh.at(-1);
    const joylar = new Set();
    for (const urug of URUGLAR) {
      for (const r of oyinYasa(id, { elementlar: EL, yosh: y, urug }).raundlar) joylar.add(kalitlar(r).indexOf(r.togri));
    }
    assert.ok(joylar.size >= 3, `${id}: to'g'ri javob ${[...joylar]} joylarda`);
  }
  // hikoya tartibi — aralashgan tartib hech qachon to'g'risining o'zi emas
  for (const urug of URUGLAR) {
    for (const r of oyinYasa(91, { elementlar: EL, yosh: "6-7", urug }).raundlar) assert.notDeepEqual(kalitlar(r), r.togri);
  }
});

test("REV324: elementlar kam bo'lsa — boricha (kamida 2), yetmasa null", () => {
  const uch = EL.slice(0, 3);
  const h = oyinYasa(116, { elementlar: uch, yosh: "6-7", urug: 1 });
  for (const r of h.raundlar) { assert.equal(r.variantlar.length, 3); assert.ok(togriBor(r)); }
  assert.equal(oyinYasa(116, { elementlar: EL.slice(0, 1), yosh: "4-5" }), null);
  assert.equal(oyinYasa(88, { elementlar: EL.slice(0, 2), yosh: "4-5" }), null);   // kamida 3 kerak
  assert.equal(oyinYasa(91, { elementlar: EL, yosh: "2-3" }), null);              // 2-3 yoshga emas
  assert.equal(oyinYasa(999, { elementlar: EL, yosh: "4-5" }), null);
  assert.ok(oyinYasa(38, { elementlar: [], yosh: "4-5", urug: 1 }), "yo'qolgan son elementlarsiz ham bo'ladi");
  // rasmsiz va takror elementlar olinmaydi
  const t = elementlarTayyor([{ say: "cat", emoji: "🐱" }, { say: "Cat", emoji: "😺" }, { say: "kitty", emoji: "🐱" }, { say: "x" }, null]);
  assert.deepEqual(t.map((e) => e.say), ["cat"]);
});

test("REV324: sonlar — yoshga qarab oraliq, darsdagi sonlar, [] — son yo'q", () => {
  assert.deepEqual(sonOraligi("2-3"), { min: 1, max: 3 });
  assert.deepEqual(sonOraligi("6-7", [2, 7, 4]), { min: 2, max: 7 });
  assert.deepEqual(sonOraligi("2-3", [1, 9]), { min: 1, max: 5 });   // yosh chegarasi
  assert.equal(sonOraligi("4-5", []), null);
  assert.equal(oyinYasa(31, { elementlar: EL, yosh: "4-5", sonlar: [] }), null);
  for (const urug of URUGLAR) {
    for (const r of oyinYasa(31, { elementlar: EL, yosh: "6-7", sonlar: [3, 4, 5, 6], urug }).raundlar) {
      assert.ok(r.savol.soni >= 3 && r.savol.soni <= 6, `sanoq ${r.savol.soni}`);
    }
    for (const r of oyinYasa(33, { elementlar: EL, yosh: "4-5", urug }).raundlar) {
      const javob = Number(r.togri.slice(2));
      assert.equal(javob, r.savol.a + r.savol.b);
      assert.ok(javob <= 5);
    }
    for (const r of oyinYasa(35, { elementlar: EL, yosh: "2-3", urug }).raundlar) {
      const s = r.variantlar.map((g) => g.son).sort((a, b) => a - b);
      assert.ok(s[1] - s[0] >= 2, "2-3 yoshda farq kamida 2");
    }
  }
});

test("REV324: oyinTanla — 7 kun ichida o'ynalgani qaytmaydi", () => {
  const hozir = Date.UTC(2026, 10, 4, 10);
  const kun = (d) => hozir - d * KUN_MS;
  for (const urug of URUGLAR) {
    const tarix = [{ id: 116, vaqt: kun(1) }, { id: 83, vaqt: kun(3) }, { id: 89, vaqt: kun(6.9) }, { id: 97, vaqt: kun(9) }, { id: 91, vaqt: kun(2) }];
    const id = oyinTanla({ elementlar: EL, yosh: "4-5", tarix, hozir, urug });
    assert.ok(id !== null);
    assert.ok(![116, 83, 89, 91].includes(id), `7 kun ichida o'ynalgan ${id} qaytdi`);
  }
  // aniq 7 kun oldin o'ynalgani yana chiqishi mumkin; 6 kun 23 soat oldingisi — yo'q
  const ochiq = new Set();
  for (let urug = 1; urug <= 600; urug++) {   // REV348: o'yinlar ko'paydi — ko'proq urug' bilan tekshiriladi
    ochiq.add(oyinTanla({ elementlar: EL, yosh: "4-5", tarix: [{ id: 32, vaqt: kun(7) }, { id: 117, vaqt: kun(1) }], hozir, urug }));
  }
  assert.ok(ochiq.has(32), "7 kun o'tgan o'yin yana tanlanadi");
  for (const urug of URUGLAR) {
    assert.notEqual(oyinTanla({ elementlar: EL, yosh: "4-5", tarix: [{ id: 32, vaqt: kun(7) - 1 + 2 * 60 * 60 * 1000 }, { id: 117, vaqt: kun(1) }], hozir, urug }), 32);
  }
  // vaqt ISO satr yoki Date ham bo'lishi mumkin
  const iso = oyinTanla({ elementlar: EL, yosh: "6-7", tarix: [{ id: 116, vaqt: new Date(kun(2)).toISOString() }], hozir, urug: 4 });
  assert.notEqual(iso, 116);
});

test("REV324: oyinTanla — ketma-ket bir xil harakat turi kelmaydi, yosh va elementlarga mos", () => {
  const hozir = Date.UTC(2026, 10, 4, 10);
  for (const urug of URUGLAR) {
    for (const [oxirgi, harakat] of [[116, "bosish"], [32, "surish"], [117, "aytish"]]) {
      const id = oyinTanla({ elementlar: EL, yosh: "6-7", tarix: [{ id: oxirgi, vaqt: hozir - KUN_MS / 2 }], hozir, urug });
      assert.notEqual(oyinOl(id).harakat, harakat, `${oxirgi} dan keyin ${id}`);
    }
    // vaqtsiz tarix — ro'yxatdagi oxirgisi «oxirgi o'yin»
    const id2 = oyinTanla({ elementlar: EL, yosh: "4-5", tarix: [{ id: 117 }, { id: 91 }], hozir, urug });
    assert.notEqual(oyinOl(id2).harakat, "surish");
    // 2-3 yosh — faqat shu yoshga mos o'yinlar
    const id3 = oyinTanla({ elementlar: EL, yosh: "2-3", tarix: [], hozir, urug });
    assert.ok(oyinOl(id3).yosh.includes("2-3"));
    assert.ok(![91, 38, 55].includes(id3));
    // 2 ta element — kamida 3 element kerak bo'lgan o'yinlar tanlanmaydi
    const id4 = oyinTanla({ elementlar: EL.slice(0, 2), yosh: "6-7", tarix: [], hozir, urug });
    assert.ok(oyinOl(id4).kerak.min_element <= 2);
  }
  // hech narsa qolmasa — null
  const hammasi = OYINLAR.map((o) => ({ id: o.id, vaqt: hozir - KUN_MS }));
  assert.equal(oyinTanla({ elementlar: EL, yosh: "4-5", tarix: hammasi, hozir }), null);
  // surish va aytish o'yinlari o'ynalgan, oxirgisi «bosish» — bosish ham kelmaydi → null
  // REV349: surish va aytish o'yinlari ko'paydi — hammasi o'ynalgan deb olinadi
  const t = [...OYINLAR.filter((o) => o.harakat !== "bosish").map((o, i) => ({ id: o.id, vaqt: hozir - (3 + i * 0.01) * KUN_MS })), { id: 116, vaqt: hozir - KUN_MS }];
  assert.equal(oyinTanla({ elementlar: EL, yosh: "4-5", tarix: t, hozir }), null);
});

test("REV324: tekshir — to'g'ri javob keyingi raundga o'tkazadi, xato hisoblanadi", () => {
  const h = oyinYasa(116, { elementlar: EL, yosh: "6-7", urug: 2 });
  const r = h.raundlar[0];
  const xato = r.variantlar.find((v) => v.k !== r.togri).k;
  const n1 = tekshir(h, xato);
  assert.equal(n1.togri, false);
  assert.equal(n1.holat.xatolar, 1);
  assert.equal(n1.holat.raund, 0);
  assert.deepEqual(n1.holat.joriy.olingan, [xato]);
  assert.equal(h.xatolar, 0, "asl holat o'zgarmaydi");
  assert.equal(tekshir(n1.holat, xato).togri, null, "olingan variant qayta bosilsa — befarq");
  const n2 = tekshir(n1.holat, r.togri);
  assert.equal(n2.togri, true);
  assert.equal(n2.raundTugadi, true);
  assert.equal(n2.holat.raund, 1);
  assert.equal(n2.holat.togriSoni, 1);
  assert.equal(tekshir(h, "yoq-kalit").togri, null);
});

test("REV324: 2 xatoda keyingi raundlar osonroq, keyingi o'yin qiyinligi pasayadi", () => {
  const h = oyinYasa(116, { elementlar: EL, yosh: "6-7", urug: 5 });
  const r = h.raundlar[0];
  const [x1, x2] = r.variantlar.filter((v) => v.k !== r.togri).map((v) => v.k);
  const a = tekshir(h, x1);
  assert.equal(a.osonlashdi, false);
  const b = tekshir(a.holat, x2);
  assert.equal(b.osonlashdi, true);
  assert.equal(b.holat.qiyinlik, -1);
  assert.equal(b.holat.raundlar[0].variantlar.length, 4, "joriy raund o'zgarmaydi");
  for (const k of b.holat.raundlar.slice(1)) { assert.equal(k.variantlar.length, 3, "keyingilari 4 → 3"); assert.ok(togriBor(k)); }
  assert.deepEqual(maslahat(b.holat), r.togri, "2 xatodan keyin ishora — to'g'ri javob");
  // keyingi o'yin
  assert.equal(qiyinlikMoslash(0, 2), -1);
  assert.equal(qiyinlikMoslash(-1, 3), -2);
  assert.equal(qiyinlikMoslash(-2, 5), -2);
  assert.equal(qiyinlikMoslash(-1, 0), 0);
  assert.equal(qiyinlikMoslash(0, 1), 0);
  assert.equal(variantSoni("6-7", -1), 3);
  assert.equal(variantSoni("2-3", -2), 2);
  const oson = oyinYasa(116, { elementlar: EL, yosh: "6-7", qiyinlik: -1, urug: 5 });
  assert.ok(oson.raundlar.every((x) => x.variantlar.length === 3));
  assert.equal(yulduzlar(0), 3); assert.equal(yulduzlar(2), 2); assert.equal(yulduzlar(5), 1);
});

test("REV324: har o'yin xatosiz oxirigacha o'ynaladi (maslahat bo'yicha)", () => {
  for (const o of OYINLAR) {
    for (const y of o.yosh) {
      for (const urug of URUGLAR.slice(0, 8)) {
        const h = oyinYasa(o.id, { elementlar: EL, yosh: y, urug, mik: false });
        const s = oxirigacha(h);
        assert.equal(s.tugadi, true, `${o.id} ${y} tugamadi`);
        assert.equal(s.xatolar, 0);
        assert.equal(s.togriSoni, h.raundlar.length);
      }
    }
  }
});

test("REV324: ko'p qadamli raundlar — juft kartalar, hikoya tartibi, savat, bosib sana", () => {
  // juft: yangi kartani ochib adashish — xato emas; sherigi ko'rilgan bo'lsa — xato
  const j = oyinYasa(89, { elementlar: EL, yosh: "6-7", urug: 9 });
  const c = j.raundlar[0].variantlar;
  const a = c[0];
  const boshqa = c.filter((x) => x.juft !== a.juft);
  const n1 = tekshir(j, [a.k, boshqa[0].k]);
  assert.equal(n1.togri, false); assert.equal(n1.xato, false); assert.equal(n1.holat.xatolar, 0);
  const a2 = c.find((x) => x.juft === a.juft && x.k !== a.k);                 // a ning sherigi (hali ochilmagan)
  const n2 = tekshir(n1.holat, [a2.k, boshqa[0].k]);
  assert.equal(n2.xato, true, "sherigi (a) ko'rilgan bo'lsa ham boshqasini ochish — xato");
  assert.equal(n2.holat.xatolar, 1);
  assert.equal(tekshir(n2.holat, [a2.k, a.k]).togri, true);
  // tartib: bosqichma (4-5) — faqat navbatdagi joy
  const t = oyinYasa(91, { elementlar: EL, yosh: "4-5", urug: 2 });
  const r = t.raundlar[0];
  assert.equal(r.savol.bosqichma, true);
  assert.equal(tekshir(t, { joy: 1, k: r.togri[1] }).togri, null, "1-joy bo'sh turganda 2-joyga qo'yilmaydi");
  const t1 = tekshir(t, { joy: 0, k: r.togri[1] });
  assert.equal(t1.togri, false);
  const t2 = tekshir(t1.holat, { joy: 0, k: r.togri[0] });
  assert.equal(t2.togri, true); assert.equal(t2.holat.joriy.joylar[0], r.togri[0]);
  assert.equal(tekshir(t, [...r.togri]).raundTugadi, true, "to'liq tartib bilan ham tekshiriladi");
  // savat: kam / ko'p / ortiqchasini olish
  const s = oyinYasa(32, { elementlar: EL, yosh: "6-7", urug: 4 });
  const sr = s.raundlar[0];
  const nishon = sr.variantlar.filter((v) => v.el.k === sr.savol.el.k);
  const chalgit = sr.variantlar.find((v) => v.el.k !== sr.savol.el.k);
  assert.equal(tekshir(s, { qoy: chalgit.k }).togri, false, "boshqa narsa savatga tushmaydi");
  let st = s;
  for (const v of nishon) st = tekshir(st, { qoy: v.k }).holat;            // bittasi ortiqcha
  const kop = tekshir(st, { tayyor: true });
  assert.equal(kop.togri, false); assert.equal(kop.voqea.tur, "tayyor");
  assert.ok(/Ko‘p/.test(javobGapi(st, kop, { izoh: "uz" })));
  st = tekshir(kop.holat, { ol: nishon[0].k }).holat;
  assert.equal(tekshir(st, { tayyor: true }).raundTugadi, true);
  // bosib sana: avval hammasi sanaladi, keyin son tanlanadi
  const b = oyinYasa(31, { elementlar: EL, yosh: "4-5", urug: 6 });
  const br = b.raundlar[0];
  assert.equal(tekshir(b, br.togri).togri, null, "sanamasdan son tanlab bo'lmaydi");
  let bs = b;
  br.savol.narsalar.forEach((k, i) => {
    const n = tekshir(bs, { sana: k });
    assert.equal(n.voqea.son, i + 1);
    bs = n.holat;
  });
  assert.equal(bs.joriy.sanaldi, true);
  assert.equal(tekshir(bs, br.togri).raundTugadi, true);
});

test("REV324: Ayt va och — ovoz bahosi, 2-urinish, mikrofon yo'q", () => {
  const h = oyinYasa(117, { elementlar: EL, yosh: "4-5", urug: 3, til: "en" });
  const el = h.raundlar[0].savol.el;
  assert.equal(tekshir(h, { alts: [el.say] }).togri, true);
  assert.equal(aytishBaho(["the " + el.say], el, "en").ok, true);
  const a = tekshir(h, { alts: ["zzzz"] });
  assert.equal(a.voqea.tur, "yana"); assert.equal(a.holat.xatolar, 0, "1-urinish — xato emas");
  const b = tekshir(a.holat, { alts: [] });
  assert.equal(b.voqea.tur, "otdi"); assert.equal(b.raundTugadi, true); assert.equal(b.holat.xatolar, 1);
  const m = tekshir(h, { mikYoq: true });
  assert.equal(m.holat.mik, false);
  assert.ok(raundGapi(m.holat, { izoh: "uz" }).includes("Bos"), "mikrofonsiz — bosib ochadi");
  assert.equal(tekshir(m.holat, h.raundlar[0].togri).togri, true);
});

test("REV324: Ha yoki yo'q — xato bo'lsa ham keyingisiga o'tadi, javoblar aralash", () => {
  for (const urug of URUGLAR) {
    const h = oyinYasa(97, { elementlar: EL, yosh: "6-7", urug });
    const ha = h.raundlar.filter((r) => r.togri === "ha").length;
    assert.equal(ha, 4, "8 raundda 4 ta «ha»");
    for (const r of h.raundlar) assert.equal(r.togri === "ha", r.savol.aytilgan.k === r.savol.el.k);
  }
  const h = oyinYasa(97, { elementlar: EL, yosh: "4-5", urug: 1 });
  const r = h.raundlar[0];
  const n = tekshir(h, r.togri === "ha" ? "yoq" : "ha");
  assert.equal(n.raundTugadi, true); assert.equal(n.holat.raund, 1); assert.equal(n.holat.xatolar, 1);
});

test("REV324: gaplar — har o'yin 5 izoh tilida, so'zlar teglangan, emoji yo'q", () => {
  for (const o of OYINLAR) {
    const m = OYIN_MATN[o.kalit];
    assert.ok(m, `${o.kalit} gaplari yo'q`);
    for (const [gap, tillar] of Object.entries(m)) {
      for (const t of IZOH_TILLARI) assert.ok(tillar[t], `${o.kalit}.${gap}.${t} yo'q`);
    }
    for (const y of o.yosh) {
      const h = oyinYasa(o.id, { elementlar: EL, yosh: y, urug: 2 });
      for (const izoh of IZOH_TILLARI) {
        const g = raundGapi(h, { izoh, birinchi: true });
        assert.ok(g.length > 5, `${o.id} ${izoh}: bo'sh gap`);
        assert.ok(!/\p{Extended_Pictographic}/u.test(g), `${o.id}: gapda emoji`);
        assert.ok(!/\{\w+\}/.test(g), `${o.id}: to'ldirilmagan o'rin: ${g}`);
      }
    }
  }
  const h = oyinYasa(116, { elementlar: EL, yosh: "4-5", urug: 1 });
  assert.match(raundGapi(h, { izoh: "uz" }), /^\[en\][a-z]+\[\/en\]! Qani/);
  assert.match(raundGapi(h, { izoh: "ru", til: "en" }), /\[en\].+\[\/en\]! Где\?/);
  assert.equal(oyinMatn("eshitBos", "raund", "uz", { t: "" }), "Qani, qayerda? Bos!", "so'z bo'lmasa ortiqcha belgi qolmaydi");
  assert.equal(yoshNorm(5), "4-5");
});
