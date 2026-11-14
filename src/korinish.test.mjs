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
  const css = fs.readFileSync(new URL("./korinishYangi.css", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const qoidalar = [...css.matchAll(/([^{}]+)\{[^}]*\}/g)].map((m) => m[1].trim());
  assert.ok(qoidalar.length >= 30);
  const erkin = qoidalar.filter((q) => !q.split(",").every((x) => x.trim().startsWith('html[data-kb-korinish="yangi"]')));
  assert.deepEqual(erkin, [".kb-korinish-tugma", ".kb-korinish-tugma:hover"], "faqat admin tugmasining o'zi shartsiz");
  const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /localStorage\.getItem\("kb_korinish"\) === "yangi"/); assert.ok(html.indexOf("kb_korinish") < html.indexOf("<body"), "sahifa chizilmasdan oldin");
  const app = fs.readFileSync(new URL("./App.jsx", import.meta.url), "utf8");
  assert.match(app, /foydalanuvchi\?\.is_admin && <button type="button" className="kb-korinish-tugma"/, "tugma faqat adminga");
});
