import test from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs";
import { korinishOl, korinishQoy, korinishAlmash, KORINISH_KALIT } from "./korinish.js";

const ombor = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) }; };
const ildiz = () => { const a = {}; return { setAttribute: (k, v) => { a[k] = v; }, removeAttribute: (k) => { delete a[k]; }, a }; };

test("REV549: yangi ko'rinish ixtiyoriy — sukut bo'yicha eski; yoqish, o'chirish, almashtirish", () => {
  const o = ombor(), el = ildiz();
  assert.equal(korinishOl(o), "eski"); assert.equal(korinishOl({ getItem: () => { throw new Error("yopiq"); } }), "eski");
  assert.equal(korinishQoy("yangi", { ombor: o, ildiz: el }), "yangi"); assert.equal(el.a["data-kb-korinish"], "yangi"); assert.equal(o.getItem(KORINISH_KALIT), "yangi");
  assert.equal(korinishAlmash({ ombor: o, ildiz: el }), "eski"); assert.equal(el.a["data-kb-korinish"], undefined);
  assert.equal(korinishAlmash({ ombor: o, ildiz: el }), "yangi"); assert.equal(korinishQoy("nimadir", { ombor: o, ildiz: el }), "eski");
});

test("REV549: yangi uslublar FAQAT yoqilganda ishlaydi — har qoida html[data-kb-korinish=\"yangi\"] bilan boshlanadi", () => {
  // @media (…) { … } o'ramlari ochib tashlanadi — ichidagi har qoida ham shu tekshiruvdan o'tadi
  const css = fs.readFileSync(new URL("./korinishYangi.css", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/@media[^{]*\{/g, "");
  const qoidalar = [...css.matchAll(/([^{}]+)\{[^}]*\}/g)].map((m) => m[1].trim());
  assert.ok(qoidalar.every((q) => !q.startsWith("@")), "at-qoida o'rami selektor sifatida o'qilmasin");
  assert.ok(qoidalar.some((q) => q.includes(".premium-app-main")), "@media ichidagi qoidalar ham tekshirilyapti");
  assert.ok(qoidalar.length >= 45);
  // REV550: to'lov uslublari ham faqat yangi ko'rinishda
  assert.ok(qoidalar.some((q) => q.includes(".bm-pay-btn")) && qoidalar.some((q) => q.includes(".course-pay-option")));
  // selektorlar ro'yxati faqat YUQORI darajadagi vergul bo'yicha bo'linadi — :is(a, b) ichidagi vergul ajratuvchi emas
  const bol = (sel) => { const out = []; let d = 0, cur = ""; for (const ch of sel) { if (ch === "(") d += 1; else if (ch === ")") d -= 1; if (ch === "," && d === 0) { out.push(cur.trim()); cur = ""; } else cur += ch; } out.push(cur.trim()); return out; };
  assert.deepEqual(bol("a :is(b,c), d"), ["a :is(b,c)", "d"]);
  const erkin = qoidalar.flatMap(bol).filter((x) => !x.startsWith('html[data-kb-korinish="yangi"]'));
  assert.deepEqual(erkin, [".kb-korinish-tugma", ".kb-korinish-tugma:hover"], "faqat admin tugmasining o'zi shartsiz");
  const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /localStorage\.getItem\("kb_korinish"\) === "yangi"/); assert.ok(html.indexOf("kb_korinish") < html.indexOf("<body"), "sahifa chizilmasdan oldin");
  const app = fs.readFileSync(new URL("./App.jsx", import.meta.url), "utf8");
  assert.match(app, /foydalanuvchi\?\.is_admin && <button type="button" className="kb-korinish-tugma"/, "tugma faqat adminga");
});

test("REV551: doimiy chap menyu — faqat keng ekranda, dars/test paytida yashirin, eng pastki qatlamda", () => {
  const css = fs.readFileSync(new URL("./korinishYangi.css", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const i = css.indexOf("@media (min-width:1100px)"); assert.ok(i > 0, "faqat keng ekran uchun");
  const blok = css.slice(i);
  const qoidalar = [...blok.matchAll(/(html\[data-kb-korinish="yangi"\][^{}]+)\{([^}]*)\}/g)];
  assert.ok(qoidalar.length >= 7);
  // dars va test paytida hech biri ishlamasin — o'quvchining ekranini menyu egallamaydi
  for (const [, sel] of qoidalar) assert.ok(sel.includes("body:not(.kb-focus-dars):not(.kb-focus-test)"), sel.trim().slice(0, 90));
  // qatlam: butun ekranli oynalar (dars xonasi, o'yinlar xonasi, to'lov, modal — z-index ≥ 50) menyuning USTIDA ochilishi shart
  const menyu = qoidalar.find(([, sel]) => sel.trim().endsWith(".premium-app-shell .premium-sidebar")); assert.ok(menyu);
  const z = Number((/z-index:(\d+)/.exec(menyu[2]) || [])[1]); assert.ok(z > 0 && z < 50, `doimiy menyu z-index ${z} — 50 dan past bo'lishi kerak`);
  assert.match(blok, /\.premium-app-main\{margin-left:264px!important\}/); assert.match(menyu[2], /width:264px!important/);
});
