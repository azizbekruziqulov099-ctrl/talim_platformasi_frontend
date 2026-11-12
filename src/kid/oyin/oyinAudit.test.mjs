// REV523: doimiy tekshiruv — har o'yinning har raundida to'g'ri javob variantlar ichida, variantlar kaliti takrorlanmaydi,
// va bolalar o'yinlari so'zlari nemis/ispan tillarida inglizcha qolib ketmagan.
import test from "node:test"; import assert from "node:assert/strict";
import { oyinYasa } from "./oyinRules.js";
import { bosqichlar, bosqichSozlama, xonaElementlar, XONA_OYINLAR } from "../oyinXona/xonaRules.js";
import { SARALASH, ULASH } from "./saralashData.js";

test("hamma o'yin: to'g'ri javob variantlarda bor, kalitlar takrorlanmaydi", () => {
  let raund = 0;
  for (const id of XONA_OYINLAR) for (const yosh of ["2-3", "4-5", "6-7"]) for (const b of bosqichlar(id).slice(0, 4)) {
    const h = oyinYasa(id, { elementlar: xonaElementlar(b, "uz"), yosh, urug: 5 + b.i, til: "uz", izoh: "uz", kirishDaraja: "yoq", ...bosqichSozlama(yosh, b.i, id) });
    if (!h) continue;
    for (const r of h.raundlar) { raund += 1;
      if (!Array.isArray(r.variantlar)) continue;
      const ks = r.variantlar.map((v) => v?.k);
      assert.equal(new Set(ks).size, ks.length, `o'yin ${id}: bir xil kalitli variant`);
      if (r.tur === "tanlov" && r.togri != null && typeof r.togri !== "object") assert.ok(ks.includes(r.togri), `o'yin ${id}: to'g'ri javob variantlarda yo'q`);
    }
  }
  assert.ok(raund > 5000);
});

test("saralash va juftlash so'zlari 5 tilda (nemis/ispan inglizcha qolmagan)", () => {
  const umumiy = /^(taxi|banana|panda|koala|zebra|pizza|kiwi|radio|robot|ananas|mango|tiger|hamster|ball|bus|sofa|tennis|jeans|pony|gorilla|puma|jaguar|helikopter)$/i;
  const yomon = [];
  const kor = (o) => { if (!o || typeof o !== "object") return;
    if (typeof o.uz === "string" && typeof o.en === "string" && o.en.length > 3 && !umumiy.test(o.en)) {
      if (!o.ru) yomon.push(`ru:${o.uz}`);
      for (const t of ["de", "es"]) if (!o[t] || (o[t] === o.en && /\s/.test(o.en))) yomon.push(`${t}:${o.en}`);   // ko'p so'zli ibora aynan inglizcha bo'lsa — tarjima qilinmagan
    }
    for (const v of Object.values(o)) if (v && typeof v === "object") kor(v); };
  kor(SARALASH); kor(ULASH);
  assert.deepEqual(yomon, []);
});

test("xonadagi har o'yinning ekrani (komponenti) ulangan — bo'sh ekran bo'lib ochilmaydi", async () => {
  const fs = await import("node:fs"); const url = await import("node:url");
  const matn = fs.readFileSync(url.fileURLToPath(new URL("./oyinlar/index.js", import.meta.url)), "utf8");
  const blok = matn.slice(matn.indexOf("export const OYIN_KOMPONENTLAR"));
  const bor = new Set([...blok.matchAll(/(?<![\w.])(\d{1,3})\s*:/g)].map((m) => Number(m[1])));
  assert.deepEqual(XONA_OYINLAR.filter((id) => !bor.has(Number(id))), []);
});
