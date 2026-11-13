import { ULASH, SARALASH } from "../oyin/saralashData.js";
import { oyinOl } from "../oyin/oyinRules.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import { bosqichlar, bosqichHolati, bosqichSozlama, yulduzHisob, xonaOyinlari, xonaElementlar, XONA_OYINLAR } from "./xonaRules.js";
import { XONA_TOPLAM } from "./xonaData.js";
import { oyinYasa } from "../oyin/oyinRules.js";
test("REV371: to'plamlar — har narsada rasm va 5 tilda nom", () => {
  const hammasi = XONA_TOPLAM.flatMap((p) => p.items);
  assert.ok(hammasi.length >= 280 && hammasi.length <= 1500, String(hammasi.length));
  for (const x of hammasi) { assert.ok(x.r); for (const t of ["uz", "ru", "en", "de", "es"]) assert.ok(x.s[t], `${x.s.uz} ${t}`); }
});
test("REV371: har o'yinda 7–20 bosqich, har bosqichda 6–15 narsa, narsa takrorlanmaydi", () => {
  for (const id of XONA_OYINLAR) {
    const b = bosqichlar(id);
    if (ULASH[oyinOl(id)?.kalit] || SARALASH[oyinOl(id)?.kalit]) {   // REV450/REV455: juft o'yinlari — o'z juftlaridan (har bosqichda 3 yangi + 1 takror, oxirida «hammasi»)
      assert.ok(b.length >= 2); for (const x of b) assert.ok(x.items.length >= 2 && new Set(x.items.map((i) => i.s.uz)).size === x.items.length);
      continue;
    }
    assert.ok(b.length >= 7 && b.length <= 20, `${id}: ${b.length}`);
    const uz = b.flatMap((x) => x.items.map((i) => i.s.uz)); assert.equal(new Set(uz).size, uz.length);
    for (const x of b) assert.ok(x.items.length >= 6 && x.items.length <= 15);
  }
  assert.notEqual(bosqichlar(116)[0].toplam, bosqichlar(83)[0].toplam);   // o'yinlar boshqa mavzudan boshlanadi
});
test("REV371: qulf — 1-bosqich ochiq, keyingisi o'tilgandan keyingi kuni va faqat obunada", () => {
  assert.equal(bosqichHolati({}, 1, {}), "ochiq");
  assert.equal(bosqichHolati({}, 9, { admin: true }), "ochiq");   // REV450: admin — hammasi ochiq
  assert.equal(bosqichHolati({}, 2, { obuna: true, bugun: "2026-11-07" }), "qulf");
  const p = { 1: { sana: "2026-11-07", yulduz: 3 } };
  assert.equal(bosqichHolati(p, 2, { obuna: true, bugun: "2026-11-07" }), "ertaga");
  assert.equal(bosqichHolati(p, 2, { obuna: true, bugun: "2026-11-08" }), "ochiq");
  assert.equal(bosqichHolati(p, 2, { obuna: false, bugun: "2026-11-08" }), "obuna");
  assert.equal(bosqichHolati(p, 1, {}), "otdi");
});
test("REV371: bosqich o'yini — 10 raund, har raundda boshqa narsa, variantlar bosqich sayin ko'payadi", () => {
  const b = bosqichlar(116)[0]; const els = xonaElementlar(b, "ru");
  assert.ok(els[0].uz && els[0].uz !== b.items[0].s.uz);
  const h = oyinYasa(116, { elementlar: els, yosh: "4-5", urug: 3, izoh: "uz", ...bosqichSozlama("4-5", 1) });
  assert.equal(h.raundlar.length, 10);
  assert.equal(new Set(h.raundlar.map((r) => r.togri)).size, 10);
  assert.ok(bosqichSozlama("2-3", 1).variantSoniMajbur === 2 && bosqichSozlama("6-7", 10).variantSoniMajbur === 4);
  assert.equal(yulduzHisob(10, 0), 3); assert.equal(yulduzHisob(4, 6), 0);
  assert.ok(xonaOyinlari("2-3").length >= 6 && xonaOyinlari("6-7").length >= 8);
});

test("REV371: xonadagi har o'yin har bosqichda quriladi (2-3 / 4-5 / 6-7)", () => {
  for (const y of ["2-3", "4-5", "6-7"]) for (const o of xonaOyinlari(y)) {
    for (const b of bosqichlar(o.id)) {
      const h = oyinYasa(o.id, { elementlar: xonaElementlar(b, "uz"), yosh: y, urug: b.i, izoh: "uz", ...bosqichSozlama(y, b.i, o.id) });
      assert.ok(h && h.raundlar.length >= 5, `${o.id} ${y} ${b.i}`);
    }
  }
});

test("REV379: hamma 57 o'yin xonada, yo'nalishlarga bo'lingan, takrorlanmaydi", () => {
  assert.equal(new Set(XONA_OYINLAR).size, XONA_OYINLAR.length);
  assert.equal(XONA_OYINLAR.length, 67);   // REV537: +4   // REV459: +«Qayerdan keladi?»; REV536: +5 ta shakl o'yini
  assert.ok(xonaOyinlari("6-7").length >= 50);
});

test("REV535: o'z ma'lumotli o'yinlarda bosqich muqovasi o'yinning o'zidan (aloqasiz so'z rasmi emas)", async () => {
  const { oyinYasa } = await import("../oyin/oyinRules.js"); const { bosqichMuqova, OZ_MUQOVALI } = await import("./xonaRules.js");
  for (const id of OZ_MUQOVALI) for (const b of bosqichlar(id).slice(0, 3)) { const m = bosqichMuqova(id, b, "6-7", oyinYasa); assert.ok(m && (m.el || m.rang || m.matn || m.emoji || m.shakl), `o'yin ${id}`); }
  assert.ok(bosqichMuqova(201, bosqichlar(201)[0], "4-5", oyinYasa).shakl);   // shakl o'yini — shakl chizmasi
  assert.match(bosqichMuqova(61, bosqichlar(61)[0], "4-5", oyinYasa).rang, /^#[0-9A-F]{6}$/i);   // rang o'yini — rang doirasi
  assert.equal(bosqichMuqova(83, bosqichlar(83)[0], "4-5", oyinYasa), null);                        // so'z o'yini — bosqichning o'z rasmi qoladi
  for (let u = 1; u <= 30; u += 1) { const h = oyinYasa(57, { elementlar: [], yosh: "6-7", urug: u, til: "uz", izoh: "uz", raundSoni: 10 }); if (h) for (const r of h.raundlar) assert.ok(Number(r.togri.slice(2)) <= 20, "o'nlik o'yini 20 dan oshmaydi"); }
});
