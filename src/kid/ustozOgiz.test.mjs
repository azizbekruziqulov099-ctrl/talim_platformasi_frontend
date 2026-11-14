import test from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs";

// ustozlar.js rasm fayllarini import qiladi (Vite) — shuning uchun og'iz sozlamalari matndan o'qiladi
const manba = fs.readFileSync(new URL("./ustozlar.js", import.meta.url), "utf8");
const YANGI = ["m_bogcha_ayol", "m_bogcha_erkak", "m_sinf57_ayol", "m_sinf57_erkak", "m_sinf811_ayol", "m_sinf811_erkak", "m_talaba_ayol", "m_talaba_erkak"];
const pozalar = (nom) => [...manba.matchAll(new RegExp(`\\./ustoz/${nom}/poza_(\\d)\\.webp"\\), w: (\\d+), h: (\\d+), og: \\{([^}]*)\\}`, "g"))].map((m) => {
  const og = Object.fromEntries([...m[4].matchAll(/(\w+): ("[^"]*"|[\d.]+)/g)].map((x) => [x[1], x[2].startsWith('"') ? x[2].slice(1, -1) : Number(x[2])]));
  const W = Number(m[2]), H = Number(m[3]); const quti = (og.w / 100) * W;
  return { poza: Number(m[1]), W, H, og, quti, yamoqEni: (quti * (og.tw ?? 185)) / 100, yamoqBoyi: (quti * (og.th ?? 100)) / 100 };
});

test("REV552: yangi ustozlarda og'iz yamog'i kichik — burun, ko'zoynak, mo'ylov va soqolni o'chirmaydi", () => {
  let jami = 0;
  for (const nom of YANGI) { const ps = pozalar(nom); assert.ok(ps.length >= 6, `${nom}: pozalar ${ps.length}`);
    for (const p of ps) { jami += 1; const kim = `${nom} p${p.poza}`;
      for (const k of ["x", "y", "w", "tw", "th", "tq"]) assert.ok(Number.isFinite(p.og[k]), `${kim}: ${k} yo'q`);
      assert.match(p.og.skin, /^#[0-9a-f]{6}$/i, kim);
      // og'iz qutisi: asl og'iz ≈ 14–28 px (540 px balandlikdagi rasmda). Avval quti 30–46 px edi.
      assert.ok(p.quti >= 14 && p.quti <= 30, `${kim}: quti ${p.quti.toFixed(1)} px`);
      // yamoq: avval 55–84 × 30–46 px. Endi oddiy pozada ≤ 41 × 19 px, kulgan pozada (4) ≤ 42 × 28 px
      assert.ok(p.yamoqEni <= 42, `${kim}: yamoq eni ${p.yamoqEni.toFixed(1)} px`);
      assert.ok(p.yamoqBoyi <= (p.poza === 4 ? 28 : 19), `${kim}: yamoq bo'yi ${p.yamoqBoyi.toFixed(1)} px`);
      assert.ok(p.og.x > 25 && p.og.x < 75 && p.og.y > 9 && p.og.y < 20, `${kim}: markaz (${p.og.x}, ${p.og.y})`);
      assert.equal(p.og.tq, 78, kim);
    } }
  assert.equal(jami, 54);
});

test("REV552: mo'ylovli ustozlarda yamoq juda past — mo'ylovga yetmaydi (oddiy pozalar)", () => {
  for (const nom of ["m_sinf811_erkak", "m_talaba_erkak"]) for (const p of pozalar(nom).filter((x) => x.poza !== 4)) assert.ok(p.yamoqBoyi <= 9.5, `${nom} p${p.poza}: ${p.yamoqBoyi.toFixed(1)} px`);
});

test("REV552: eski ustozlar o'zgarmagan (o'z yuz kadrlari yoki eski og'iz o'lchami); komponent va uslub yangi sozlamalarni qo'llaydi", () => {
  assert.match(manba, /\.\/ustoz\/nilufar\/poza_1\.webp"\), w: \d+, h: \d+, yuz:/, "Nilufar — rassom chizgan yuz kadrlari bilan");
  // umumiy og'iz varag'ini («og») faqat 8 ta yangi ustoz ishlatadi — eskilari (Nilufar, Sardor, Anna …) rassom chizgan yuz kadrlari bilan
  const ogli = [...manba.matchAll(/\.\/ustoz\/(\w+)\/poza_\d\.webp"\), w: \d+, h: \d+, og: \{/g)].map((m) => m[1]);
  assert.deepEqual([...new Set(ogli)].sort(), [...YANGI].sort()); assert.equal(ogli.length, 54);
  assert.equal([...manba.matchAll(/\btq: \d+/g)].length, 54, "yangi sozlama faqat shu 54 pozada");
  const jsx = fs.readFileSync(new URL("./UstozSahna.jsx", import.meta.url), "utf8"); const css = fs.readFileSync(new URL("./ustozSahna.css", import.meta.url), "utf8");
  assert.match(jsx, /p\.og\.th \? \{ height: `\$\{p\.og\.th\}%` \}/); assert.match(jsx, /"--teri-q": `\$\{p\.og\.tq\}%`/);
  assert.match(css, /radial-gradient\(closest-side,var\(--teri\) var\(--teri-q,62%\),transparent 100%\)/, "sukut bo'yicha eski qiymat (62%) — eski ustozlar o'zgarmaydi");
});
