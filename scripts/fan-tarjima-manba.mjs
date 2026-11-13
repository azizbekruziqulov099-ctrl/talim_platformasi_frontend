// REV533: fan o'yinlaridagi ma'lumot matnlari va shablonlarni interfeys tarjimasi ro'yxatiga kiritish uchun manba fayl yasaydi
// (src/games/mantiq/tarjimaManba.js). Keyin: node scripts/ui-manbalar.mjs. Yangi ma'lumot qo'shilganda qayta ishga tushiring.
import fs from "node:fs"; import path from "node:path";
const ildiz = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../src/games/mantiq");
const { ZANJIRLAR, ELEMENTLAR } = await import(`${ildiz}/fanRules.js`);
const { VILOYATLAR, DAVLATLAR, ZONALAR, viloyatYasa, davlatYasa, zonaYasa } = await import(`${ildiz}/geoRules.js`);
const { TOIFA, bogShablon, ketmaYasa } = await import(`${ildiz}/mantiq2Rules.js`);
const { tenglamaYasa } = await import(`${ildiz}/matRules.js`);
const S = new Set(); const q = (x) => { if (x == null) return; if (typeof x === "object") { if (x.m) S.add(x.m); (x.a || []).forEach((v) => v && typeof v === "object" && v.tr && S.add(v.tr)); } else if (String(x).trim()) S.add(String(x)); };
for (const h of ZANJIRLAR) for (const [muhit, ...z] of h) { q(muhit); z.forEach(([, n]) => q(n)); }
ELEMENTLAR.forEach((e) => q(e[1]));
VILOYATLAR.forEach((v) => { q(v[1]); q(v[2]); q(v[5]); }); DAVLATLAR.forEach((d) => { q(d[1]); q(d[2]); }); ZONALAR.forEach(([z, xs]) => { q(z); xs.forEach((x) => q(x[1])); });
for (const t of TOIFA) { t[1].forEach(q); q(t[2]); q(t[3]); for (const b of TOIFA) if (b !== t) { q(bogShablon(t, b, true)); q(bogShablon(t, b, false)); } }
for (const d of [0, 1, 2]) for (let u = 1; u <= 200; u += 1) { q(ketmaYasa(u, d).qoida); tenglamaYasa(u, d).qadamlar.forEach(q);
  if (u <= 20) { viloyatYasa(u, d).forEach((x) => { q(x.matn); q(x.izoh); }); davlatYasa(u, d).forEach((x) => q(x.izoh)); zonaYasa(u, d).forEach((x) => q(x.izoh)); } }
const jsx = fs.readFileSync(`${ildiz}/MantiqOyinlari.jsx`, "utf8");
for (const m of jsx.matchAll(/\b(?:nom|izoh|g): "((?:[^"\\]|\\.)*)"/g)) q(m[1]);
for (const m of jsx.matchAll(/const DARAJA = \[([^\]]*)\]/g)) for (const x of m[1].matchAll(/"([^"]+)"/g)) q(x[1]);
const tartib = [...S].sort((a, b) => a.localeCompare(b));
const out = `// REV533: AVTOMATIK YASALGAN (scripts/fan-tarjima-manba.mjs) — qo'lda tahrirlamang.\n// Fan o'yinlari ma'lumotidagi so'z va shablonlar: shu yerda turgani uchun interfeys tarjimasi ro'yxatiga tushadi (5 til).\nimport { uiText as __kbUi } from "../../interface/interfaceRuntime.js";\nexport const FAN_TARJIMA_SONI = ${tartib.length};\nexport function fanTarjimaManba() {\n  return [\n${tartib.map((t) => `    __kbUi(${JSON.stringify(t)}),`).join("\n")}\n  ];\n}\n`;
fs.writeFileSync(`${ildiz}/tarjimaManba.js`, out); console.log("matnlar:", tartib.length);
