import test from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs";

// versiyaTekshir.js `import.meta.env` va brauzer API'lariga tayanadi — matn lug'atini fayldan o'qib tekshiramiz (DOM'siz)
const manba = fs.readFileSync(new URL("./versiyaTekshir.js", import.meta.url), "utf8");
const html = fs.readFileSync(new URL("../../index.html", import.meta.url), "utf8");

test("REV547: yangilanish matnlari 3 tilda, hamma kalit bor", () => {
  const blok = manba.slice(manba.indexOf("const MATN = {"), manba.indexOf("export const matn"));
  for (const til of ["uz", "ru", "en"]) { const m = new RegExp(`${til}: \\{([^}]*)\\}`).exec(blok); assert.ok(m, til);
    for (const k of ["tayyor", "yangila", "yop", "sarlavha", "izoh", "holat"]) assert.match(m[1], new RegExp(`${k}: "[^"]{3,}"`), `${til}.${k}`); }
  assert.match(manba, /export function yangilanishOynasi/); assert.match(manba, /export function lavhaKorsat/);
  assert.match(manba, /yangila\(\{ oyna: false \}\)/, "fonda jimgina yangilanish — oynasiz");
});

test("REV547: ochilish ekrani index.html ichida — tashqi faylga bog'liq emas, o'zi yopiladi", () => {
  assert.match(html, /id="kb-ochilish"/); assert.match(html, /src="data:image\/webp;base64,[A-Za-z0-9+/=]{500,}"/, "belgi sahifa ichida");
  const blok = html.slice(html.indexOf('<div id="kb-ochilish"'), html.indexOf("</script>", html.indexOf('<div id="kb-ochilish"')));
  assert.ok(!/src="\/|href="\//.test(blok), "ochilish ekrani tarmoqdan hech narsa so'ramaydi");
  assert.match(html, /__kbOchilishYop/); assert.match(html, /setTimeout\(yop, 12000\)/, "ilova ochilmasa ham ekranni to'sib qolmaydi");
  { const i = html.indexOf("window.__kbBootOk = function"); assert.ok(i > 0 && html.slice(i, html.indexOf("\n", i)).includes("__kbOchilishYop()"), "ilova ochilganda yopiladi"); }
  assert.ok(html.indexOf('id="kb-ochilish"') > html.indexOf('id="root"') && html.indexOf('id="kb-ochilish"') < html.indexOf('src="/src/main.jsx"'), "ilova skriptidan oldin chiziladi");
  assert.ok(html.length < 14000, `index.html yengil qolsin: ${html.length}`);
});
