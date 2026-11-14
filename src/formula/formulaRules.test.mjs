import { test } from "node:test"; import assert from "node:assert/strict";
import { belgilarga, formulaTeng, harflar, matnLatex, SABAB_MATNI, tahlil } from "./formulaRules.js";

const T = (j, k) => formulaTeng(j, k).togri; const S = (j, k) => formulaTeng(j, k).sabab;
function hammasi(kutilgan, togri, xato) {
  for (const j of togri) assert.ok(T(j, kutilgan), `«${j}» qabul qilinishi kerak edi («${kutilgan}»): ${S(j, kutilgan)}`);
  for (const j of xato) assert.ok(!T(j, kutilgan), `«${j}» RAD etilishi kerak edi («${kutilgan}»)`);
}

test("REV557: kvadrat yuzi S=a² — turli to'g'ri yozuvlar qabul, tuzoqlar rad", () => {
  hammasi("S=a^2", ["S=a^2", "S=a²", "S = a · a", "S=a*a", "a^2=S", "S=aa", "2S=2a^2"], ["S=a^3", "S=2a", "S=a", "S=4a", "S=a^2+1", "a=S^2"]);
  assert.equal(S("s=a^2", "S=a^2"), "harf");                 // kichik s — boshqa harf
  assert.equal(S("1=1", "S=a^2"), "arzimas"); assert.equal(S("S=S", "S=a^2"), "arzimas"); assert.equal(S("a^2=a^2", "S=a^2"), "arzimas");
  assert.equal(S("a^2", "S=a^2"), "tenglik_yoq"); assert.equal(S("", "S=a^2"), "bosh"); assert.equal(S("   ", "S=a^2"), "bosh");
  for (const j of ["S=a^", "S=(a^2", "S=", "=a^2", "S=a^2)", "S==a", "S=a$2", "S=1.2.3"]) assert.equal(S(j, "S=a^2"), "sintaksis", j);
});

test("perimetr, aylana, trapetsiya: ko'paytirish tartibi, yashirin ko'paytirish, o'nli kasr", () => {
  hammasi("P=2(a+b)", ["P=2(a+b)", "P=2a+2b", "P=(a+b)2", "P=(a+b)*2", "P=a+b+a+b", "2(a+b)=P"], ["P=2a+b", "P=a+b", "P=2ab", "P=4a"]);
  hammasi("C=2πr", ["C=2πr", "C=2rπ", "C=π·2r", "C=2*pi*r", "C=πr+πr"], ["C=πr", "C=2r", "C=πr^2", "C=2π"]);
  hammasi("S=πr^2", ["S=πr^2", "S=π·r·r", "S=r^2π"], ["S=2πr", "S=πr", "S=π^2r"]);
  hammasi("S=(a+b)/2*h", ["S=(a+b)h/2", "S=h(a+b)/2", "S=0,5(a+b)h", "S=0.5h(a+b)", "S=(ah+bh)/2"], ["S=(a+b)h", "S=a+b/2*h", "S=(a+b)/2", "S=(a+b)/(2h)"]);
  hammasi("V=a^3", ["V=aaa", "V=a·a^2", "V=a^2a"], ["V=3a", "V=a^2"]);
});

test("Pifagor va ildiz: c²=a²+b² va c=√(a²+b²) — ALOHIDA shakllar (bankda ikkalasi ham ko'rsatiladi)", () => {
  hammasi("c^2=a^2+b^2", ["a^2+b^2=c^2", "c^2=b^2+a^2", "c·c=a·a+b·b"], ["c=a+b", "c^2=a^2-b^2", "c=a^2+b^2", "c^2=(a+b)^2"]);
  hammasi("c=sqrt(a^2+b^2)", ["c=√(a^2+b^2)", "c=sqrt(b^2+a^2)", "sqrt(a^2+b^2)=c"], ["c=sqrt(a^2)+sqrt(b^2)", "c=√a^2+b^2", "c=a^2+b^2"]);
  assert.ok(!T("c=sqrt(a^2+b^2)", "c^2=a^2+b^2"));           // boshqa shakl — bankda alohida javob sifatida beriladi
});

test("trigonometriya: sin²x+cos²x=1 — qayta tartiblash qabul, «1=1» va yaqin xatolar rad", () => {
  hammasi("sin^2(x)+cos^2(x)=1",
    ["sin^2(x)+cos^2(x)=1", "cos^2(x)+sin^2(x)=1", "1=sin^2(x)+cos^2(x)", "sin(x)^2+cos(x)^2=1", "sin^2(x)=1-cos^2(x)", "cos^2(x)=1-sin^2(x)", "sin^2 x+cos^2 x=1", "sin(x)·sin(x)+cos(x)·cos(x)=1"],
    ["sin^2(x)+cos^2(x)=2", "sin(x)+cos(x)=1", "sin^2(x)-cos^2(x)=1", "sin^2(x)+cos^2(2x)=1", "sin(x^2)+cos(x^2)=1", "sin^2(x)+sin^2(x)=1", "sin^2(x)+tg^2(x)=1"]);
  assert.equal(S("1=1", "sin^2(x)+cos^2(x)=1"), "arzimas"); assert.equal(S("x=x", "sin^2(x)+cos^2(x)=1"), "arzimas");
  assert.equal(S("sin^2(y)+cos^2(y)=1", "sin^2(x)+cos^2(x)=1"), "harf");
  hammasi("tg(x)=sin(x)/cos(x)", ["tg(x)=sin(x)/cos(x)", "sin(x)/cos(x)=tg(x)", "tg x=sin x/cos x"], ["tg(x)=cos(x)/sin(x)", "tg(x)=sin(x)cos(x)", "ctg(x)=sin(x)/cos(x)"]);
  hammasi("sin(2x)=2sin(x)cos(x)", ["sin(2x)=2cos(x)sin(x)", "2sin(x)cos(x)=sin(2x)"], ["sin(2x)=2sin(x)", "sin(2x)=sin(x)cos(x)", "sin(x)=2sin(x)cos(x)"]);
});

test("algebraik ayniyatlar: tomonlar almashishi mumkin, lekin «(a+b)²=(a+b)²» formula emas", () => {
  hammasi("(a+b)^2=a^2+2ab+b^2",
    ["(a+b)^2=a^2+2ab+b^2", "a^2+2ab+b^2=(a+b)^2", "(a+b)^2=a^2+b^2+2ab", "(a+b)(a+b)=a^2+2ab+b^2", "(b+a)^2=b^2+2ab+a^2"],
    ["(a+b)^2=(a+b)^2", "(a+b)^2=(b+a)^2", "a^2+2ab+b^2=a^2+2ab+b^2", "(a+b)^2=a^2+b^2", "(a-b)^2=a^2-2ab+b^2", "(a+b)^2=a^2+ab+b^2", "(a+b)^3=a^2+2ab+b^2"]);
  hammasi("a^2-b^2=(a-b)(a+b)", ["a^2-b^2=(a+b)(a-b)", "(a-b)(a+b)=a^2-b^2"], ["a^2-b^2=(a-b)^2", "a^2-b^2=a^2-b^2", "a^2+b^2=(a-b)(a+b)"]);
  hammasi("a(b+c)=ab+ac", ["ab+ac=a(b+c)", "(b+c)a=ac+ab"], ["a(b+c)=ab+c", "a(b+c)=a(b+c)"]);
});

test("ko'rinish (LaTeX): daraja, kasr, ildiz, trigonometriya, π", () => {
  assert.equal(matnLatex("S=a^2"), "S=a^{2}"); assert.equal(matnLatex("(a+b)/2"), "\\frac{a+b}{2}");
  assert.equal(matnLatex("c=sqrt(a^2+b^2)"), "c=\\sqrt{a^{2}+b^{2}}"); assert.equal(matnLatex("sin^2(x)+cos^2(x)=1"), "\\sin^{2} x+\\cos^{2} x=1");
  assert.equal(matnLatex("C=2πr"), "C=2\\pi r"); assert.equal(matnLatex("(a+b)^2"), "\\left(a+b\\right)^{2}"); assert.equal(matnLatex("a-(b-c)"), "a-\\left(b-c\\right)");
  assert.equal(matnLatex("0,5a"), "0{,}5a"); assert.equal(matnLatex("S=a^"), ""); assert.equal(matnLatex(""), "");
});

test("tahlil: belgilar, o'zgaruvchilar, xatolar; natija urug'ga bog'liq emas", () => {
  assert.deepEqual([...harflar(tahlil("S=(a+b)/2*h").chap), ...harflar(tahlil("S=(a+b)/2*h").ong)].sort(), ["S", "a", "b", "h"]);
  assert.equal(belgilarga("a²").map((x) => x.t).join(""), "x^son"); assert.equal(belgilarga("a$b").xato, "belgi");
  assert.equal(tahlil("sin").xato, "tugallanmagan"); assert.equal(tahlil("(a+b").xato, "qavs"); assert.equal(tahlil("a=b=c").xato, "tenglik");
  for (const u of [1, 7, 99, 12345]) { assert.ok(formulaTeng("S=a·a", "S=a^2", { urug: u }).togri); assert.ok(!formulaTeng("S=2a", "S=a^2", { urug: u }).togri);
    assert.ok(formulaTeng("sin^2(x)=1-cos^2(x)", "sin^2(x)+cos^2(x)=1", { urug: u }).togri); assert.ok(!formulaTeng("(a+b)^2=a^2+b^2", "(a+b)^2=a^2+2ab+b^2", { urug: u }).togri); }
  assert.throws(() => formulaTeng("S=a", "S=a^"), /kutilgan formula/);
  for (const k of ["bosh", "sintaksis", "tenglik_yoq", "harf", "arzimas", "boshqa"]) assert.ok(SABAB_MATNI[k]);
});

// ───────── bank va klaviatura ─────────
import { FORMULALAR, darajaFormulalari, formulaOl } from "./formulalar.js";
import { formulaBelgilari, javobTekshir, jonliLatex, klaviaturaHarflari } from "./formulaRules.js";

test("REV557: bankdagi HAR formula to'g'ri yozilgan, o'ziga teng, ko'rinishi bor; boshqa formulalar bilan adashmaydi", () => {
  assert.ok(FORMULALAR.length >= 34); assert.equal(new Set(FORMULALAR.map((f) => f.id)).size, FORMULALAR.length);
  for (const f of FORMULALAR) {
    assert.ok(f.nom && f.savol && f.izoh && f.mavzu && [0, 1, 2].includes(f.daraja), f.id);
    for (const j of f.javoblar) { assert.ok(!tahlil(j).xato, `${f.id}: ${j} — ${tahlil(j).xato}`); assert.ok(tahlil(j).ong, `${f.id}: tenglik yo'q`);
      assert.ok(formulaTeng(j, j).togri, `${f.id}: «${j}» o'ziga teng emas (${formulaTeng(j, j).sabab})`); assert.ok(matnLatex(j).length > 2, f.id); }
  }
  // boshqa formulaning javobi bu formulaga to'g'ri kelmasligi kerak (bir xil ma'noli juftliklardan tashqari)
  const adash = [];
  for (const a of FORMULALAR) for (const b of FORMULALAR) if (a.id !== b.id) for (const j of b.javoblar) if (javobTekshir(j, a.javoblar).togri) adash.push(`${b.id}→${a.id}`);
  assert.deepEqual(adash, []);
  for (const d of [0, 1, 2]) assert.ok(darajaFormulalari(d).length >= 9, `daraja ${d}`);
  assert.equal(formulaOl(0, 1).id, "kv_p"); assert.equal(formulaOl(0, darajaFormulalari(0).length + 1).id, "kv_p"); assert.ok(formulaOl(2, 0));
});

test("klaviatura: har formulani shu klaviaturadagi tugmalar bilan yozish mumkin; jonli ko'rinish yozish davomida ishlaydi", () => {
  for (const f of FORMULALAR) {
    const h = new Set(klaviaturaHarflari(f.javoblar)); const b = formulaBelgilari(f.javoblar);
    for (const j of f.javoblar) for (const ch of j.replace(/sqrt|sin|cos|ctg|tg|pi|π/g, "")) if (/[A-Za-z]/.test(ch)) assert.ok(h.has(ch), `${f.id}: «${ch}» harfi klaviaturada yo'q`);
    assert.ok(h.size >= 4 && h.size <= 9, `${f.id}: ${[...h]}`);
    if (/sin|cos|tg/.test(f.javoblar.join())) assert.ok(b.trig, f.id);
    if (/π/.test(f.javoblar.join())) assert.ok(b.pi, f.id);
    assert.deepEqual(klaviaturaHarflari(f.javoblar), klaviaturaHarflari(f.javoblar));   // har safar bir xil
  }
  // yozish davomida: har bosqichda ko'rinish bo'sh emas (birinchi belgidan keyin)
  for (const j of ["S=a^2", "S=(a+b)/2*h", "c=sqrt(a^2+b^2)", "sin^2(x)+cos^2(x)=1", "a^m*a^n=a^(m+n)", "V=4πr^3/3"]) {
    const qadamlar = j.match(/sqrt\(|sin\^2\(|cos\^2\(|sin\(|cos\(|\^\(|./g);
    // kamida bitta harf yoki son yozilgandan keyin ko'rinish bo'sh bo'lmasligi kerak («sin^2(» ning o'zida hali ko'rsatadigan narsa yo'q)
    let s = ""; for (const q of qadamlar) { s += q; const operand = /[0-9A-Za-zπ]/.test(s.replace(/sqrt|sin|cos|ctg|tg/g, "").replace(/\^2\(|\^\(/g, ""));
      if (operand) assert.ok(jonliLatex(s).length > 0, `«${s}» ko'rinmadi`); }
    assert.equal(jonliLatex(j), matnLatex(j));
  }
  assert.equal(jonliLatex(""), ""); assert.equal(jonliLatex("S=a^"), "S=a"); assert.equal(jonliLatex("(a+b"), "a+b"); assert.equal(jonliLatex("S=sqrt("), "S");
});

test("bir necha shaklli javob: Pifagor ikki ko'rinishda ham qabul qilinadi", () => {
  const p = FORMULALAR.find((f) => f.id === "pifagor").javoblar;
  for (const j of ["c^2=a^2+b^2", "a^2+b^2=c^2", "c=sqrt(a^2+b^2)", "c=√(b^2+a^2)"]) assert.ok(javobTekshir(j, p).togri, j);
  assert.equal(javobTekshir("c=a+b", p).sabab, "boshqa"); assert.equal(javobTekshir("", p).sabab, "bosh"); assert.equal(javobTekshir("c^2=a^2+", p).sabab, "sintaksis");
});
