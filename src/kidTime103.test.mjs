import test from "node:test";
import assert from "node:assert/strict";
import { GRACE_MS, guardView, hoursText, screenCategory, screenName, screenTime, timeText, warnText } from "./kid/screenTime.js";
import { answerSpeed } from "./kid/kidActivity.js";
import { levelDots, minutesText, presence, ratingText, usageRows, weekStack } from "./parent/farzandVaqtRules.js";

const status = (dars, oyin, limits = [60, 60]) => {
  const [dl, ol] = limits;
  const out = { dars: { daqiqa: dars, limit: dl, qoldi: Math.max(0, dl - dars) }, oyin: { daqiqa: oyin, limit: ol, qoldi: Math.max(0, ol - oyin) },
    jami: { daqiqa: dars + oyin, limit: dl + ol, qoldi: Math.max(0, dl + ol - dars - oyin) } };
  out.tugadi = { dars: dars >= dl, oyin: oyin >= ol };
  out.tugadi.jami = out.tugadi.dars && out.tugadi.oyin;
  return out;
};

test("REV103: qaysi ekran dars, qaysi biri erkin vaqt hisobiga", () => {
  assert.equal(screenCategory("mavzular"), "dars");
  assert.equal(screenCategory("test"), "dars");
  assert.equal(screenCategory("ai_ustoz"), "dars");
  assert.equal(screenCategory("shaxmat"), "oyin");
  assert.equal(screenCategory("profil"), "oyin");
  assert.equal(screenCategory("mavzular", "Kabutar"), "oyin");      // ustidan suhbat oynasi ochiq
  assert.equal(screenName("shashka"), "Shashka");
  assert.equal(screenName("mavzular", "", "Dars: «Ranglar»"), "Dars: «Ranglar»");
  assert.equal(screenName("noma'lum"), "Platforma");
  assert.equal(hoursText(180), "3 soat");
  assert.equal(hoursText(75), "1 soat 15 daqiqa");
  assert.equal(hoursText(40), "40 daqiqa");
});

test("REV103: vaqt tugasa ekran yopiladi; dars o'rtasida bo'lsa 10 daqiqagacha tugatib olishi mumkin", () => {
  const t0 = 1_000_000;
  assert.deepEqual(guardView(status(30, 10), "dars", false, 0, t0), { view: null, graceSince: 0 });
  assert.deepEqual(guardView(status(60, 10), "dars", false, 0, t0), { view: "dars", graceSince: 0 });
  assert.deepEqual(guardView(status(60, 10), "oyin", false, 0, t0), { view: null, graceSince: 0 });   // o'yin vaqti hali bor
  // darsda — kutadi, 10 daqiqadan keyin yopadi
  const first = guardView(status(60, 10), "dars", true, 0, t0);
  assert.deepEqual(first, { view: null, graceSince: t0 });
  assert.equal(guardView(status(60, 10), "dars", true, first.graceSince, t0 + GRACE_MS - 1).view, null);
  assert.equal(guardView(status(60, 10), "dars", true, first.graceSince, t0 + GRACE_MS).view, "dars");
  // dars ketayotganda Kabutar (o'yin hisobi) ochib-yopish kutishni qaytadan boshlamaydi
  const away = guardView(status(60, 10), "oyin", true, first.graceSince, t0 + 60000);
  assert.deepEqual(away, { view: null, graceSince: t0 });
  assert.equal(guardView(status(60, 10), "dars", true, away.graceSince, t0 + GRACE_MS).view, "dars");
  assert.equal(guardView(status(60, 10), "oyin", false, first.graceSince, t0).graceSince, 0);   // dars tugadi — kutish tugaydi
  // hammasi tugadi — qaysi ekranda bo'lmasin «jami»
  assert.equal(guardView(status(60, 60), "oyin", false, 0, t0).view, "jami");
  assert.equal(guardView(status(130, 60, [120, 60]), "dars", false, 0, t0).view, "jami");
  assert.equal(guardView({ kuzatilmaydi: true }, "dars", false, 0, t0).view, null);
  assert.equal(guardView(null, "dars", false, 0, t0).view, null);
});

test("REV103: bolaga aytiladigan gaplar va 5 daqiqa qolgani", () => {
  assert.equal(timeText("jami", status(60, 60)), "Bugun vaqting tugadi! Bugun 2 soat o‘qib-o‘ynading. Ko‘zlaring dam olsin. Ertaga uchrashamiz!");
  assert.match(timeText("jami", status(120, 60, [120, 60])), /3 soat/);
  assert.match(timeText("dars", status(60, 0)), /o‘ynasang bo‘ladi/);
  assert.match(timeText("oyin", status(0, 60)), /dars qilamiz/);
  assert.equal(warnText(status(10, 56), "oyin"), "O‘yin vaqtidan 4 daqiqa qoldi.");
  assert.equal(warnText(status(115, 0, [120, 60]), "dars"), "Dars vaqtidan 5 daqiqa qoldi.");
  assert.equal(warnText(status(10, 30), "oyin"), null);
  assert.equal(warnText(status(10, 60), "oyin"), null);   // allaqachon tugagan — ogohlantirish emas, to'siq
});

test("REV103: javob tezligi — mediana, chalg'igan bitta savol buzmaydi", () => {
  assert.equal(answerSpeed([]), 0);
  assert.equal(answerSpeed([2000, 2400, 90000]), 2400);
  assert.equal(answerSpeed([1000, 3000]), 2000);
  assert.equal(answerSpeed([50, 0, -3, NaN]), 300);
});

test("REV103: ota-ona paneli — limitga nisbatan, hozir platformadami, haftalik ustunlar, reyting", () => {
  const rows = usageRows({ ...status(45, 60), nima: [] });
  assert.deepEqual(rows.map((r) => [r.key, r.daqiqa, r.limit, r.pct, r.full]), [["dars", 45, 60, 75, false], ["oyin", 60, 60, 100, true], ["jami", 105, 120, 88, false]]);
  assert.deepEqual(usageRows(null), []);
  assert.equal(presence({ platformada: true, nom: "Shaxmat", daqiqa: 0 }).text, "Hozir platformada — «Shaxmat»");
  assert.equal(presence({ platformada: false, nom: "Dars: «Ranglar»", daqiqa: 12 }).text, "12 daqiqadan beri platformada emas (oxirgi: «Dars: «Ranglar»»)");
  assert.equal(presence({ platformada: false, nom: "", daqiqa: 12 }).cls, "is-away");
  assert.equal(presence(null).text, "Bugun hali platformaga kirmagan");
  assert.equal(presence({ platformada: true }, true).emoji, "🌙");
  const week = weekStack([{ sana: "2026-10-04", kun: "Yakshanba", dars: 60, oyin: 60 }, { sana: "2026-10-05", kun: "Dushanba", dars: 15, oyin: 0 }]);
  assert.deepEqual(week.map((d) => [d.darsPx, d.oyinPx, d.jami]), [[28, 28, 120], [7, 0, 15]]);
  assert.equal(levelDots(4), "●●●●○");
  assert.equal(levelDots(0), "●○○○○");
  assert.equal(minutesText(125), "2 soat 5 daqiqa");
  assert.equal(ratingText({ orin: 2, jami: 37, yulduz: 18 }, "4-5 yosh"), "4-5 yosh guruhida 2-o‘rin (37 bola ichida) · ⭐ 18 yulduz (7 kun)");
  assert.equal(ratingText(null), "");
});

test("REV103: signal — ekran almashsa darhol (oldingi ekran vaqti to'g'ri yoziladi), bog'cha bolasi bo'lmasa to'xtaydi", async () => {
  const calls = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, opts = {}) => {
    calls.push({ url: String(url), body: opts.body ? JSON.parse(opts.body) : null, keepalive: Boolean(opts.keepalive) });
    const isSignal = String(url).includes("/signal");
    return { ok: true, json: async () => (isSignal ? { ...status(5, 0), xabar: null } : status(5, 0)) };
  };
  try {
    const seen = [];
    const off = screenTime.subscribe((s) => seen.push(s));
    screenTime.where("dars", "Darslar");
    screenTime.start({ apiBase: "https://api.test/", token: "T" });
    await new Promise((r) => setTimeout(r, 20));
    const firstSignal = calls.find((c) => c.url === "https://api.test/api/bola/vaqt/signal");
    assert.deepEqual(firstSignal.body, { token: "T", turi: "dars", nom: "Darslar", korinadi: true });
    assert.ok(calls.some((c) => c.url.startsWith("https://api.test/api/bola/vaqt?")));
    screenTime.setDetail("Dars: «Ranglar»");
    await new Promise((r) => setTimeout(r, 900));
    assert.deepEqual(calls.at(-1).body, { token: "T", turi: "dars", nom: "Dars: «Ranglar»", korinadi: true });
    screenTime.setDetail("");
    screenTime.where("oyin", "Shaxmat");
    await new Promise((r) => setTimeout(r, 900));
    assert.deepEqual(calls.at(-1).body, { token: "T", turi: "oyin", nom: "Shaxmat", korinadi: true });
    assert.ok(seen.length >= 2 && seen.at(-1).dars.daqiqa === 5);
    // band (dars ketyapti) belgisi o'zgarsa — qo'riqchi qayta hisoblaydi
    const before = seen.length;
    screenTime.setBusy("dars", true);
    assert.equal(screenTime.isBusy(), true);
    assert.equal(seen.length, before + 1);
    screenTime.setBusy("dars", false);
    screenTime.stop();
    assert.equal(calls.at(-1).keepalive, true);
    assert.equal(calls.at(-1).body.korinadi, false);
    off();
    // chiqib ketgandan keyin kelgan eski javob yangi bolaning holatini buzmaydi
    let release;
    globalThis.fetch = (url, opts = {}) => new Promise((resolve) => { release = () => resolve({ ok: true, json: async () => status(60, 60) }); });
    screenTime.start({ apiBase: "https://api.test", token: "OLD" });
    screenTime.stop();
    release();
    await new Promise((r) => setTimeout(r, 10));
    assert.equal(screenTime.current(), null);
    // server «kuzatilmaydi» desa — boshqa signal yuborilmaydi
    globalThis.fetch = async (url, opts = {}) => { calls.push({ url: String(url), body: opts.body ? JSON.parse(opts.body) : null }); return { ok: true, json: async () => ({ kuzatilmaydi: true }) }; };
    screenTime.start({ apiBase: "https://api.test", token: "T" });
    await new Promise((r) => setTimeout(r, 20));
    const count = calls.length;
    screenTime.where("dars", "Darslar");
    await new Promise((r) => setTimeout(r, 900));
    assert.equal(calls.length, count);
    screenTime.stop();
  } finally {
    globalThis.fetch = realFetch;
  }
});
