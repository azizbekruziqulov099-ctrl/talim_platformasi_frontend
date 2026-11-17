import test from "node:test";
import assert from "node:assert/strict";
const mem = {};
globalThis.localStorage = { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } };
globalThis.location = { origin: "https://app.test" };
const store = new Map();
globalThis.caches = { open: async () => ({ put: async (k, v) => { store.set(k, v); }, match: async (k) => store.get(k), keys: async () => [], delete: async () => true }) };
const m = await import("./offlayn.js");

test("kesh kaliti token va qurilmani tushiradi", () => {
  assert.equal(m.keshKalit("https://api.x/api/dars_xonasi/RP001?token=a&til=uz&qurilma=z"), "https://api.x/api/dars_xonasi/RP001?til=uz");
});
test("muddati o'tgan paket ruxsat bermaydi", () => {
  mem.kb_offlayn_meta = JSON.stringify({ kurslar: { K: { darslar: ["A"], exp: Date.now() + 1000 } } });
  assert.equal(m.yuklangan("A"), true);
  assert.equal(m.yuklangan("B"), false);
  assert.equal(m.yuklangan("A", Date.now() + 5000), false);
});
test("internet yo'q: yuklangan dars keshdan, yuklanmagani xato", async () => {
  const url = "https://api.x/api/dars_xonasi/A?token=t&til=uz";
  store.set(m.keshKalit(url), new Response('{"ok":1}'));
  globalThis.fetch = async () => { throw new TypeError("Failed to fetch"); };
  const r = await m.offlaynFetch(url, undefined, { kod: "A" });
  assert.deepEqual(await r.json(), { ok: 1 });
  await assert.rejects(m.offlaynFetch("https://api.x/api/dars_xonasi/B?token=t", undefined, { kod: "B" }));
});
test("HTTP 402 oflayn zaxiraga o'tmaydi", async () => {
  globalThis.fetch = async () => new Response("{}", { status: 402 });
  const r = await m.offlaynFetch("https://api.x/api/dars_xonasi/A?token=t", undefined, { kod: "A" });
  assert.equal(r.status, 402);
});
test("natija navbatga yoziladi va internet kelganda yuboriladi", async () => {
  globalThis.fetch = async () => { throw new TypeError("offline"); };
  const r = await m.postNavbat("https://api.x/api/kurslar/mashq_natija", { token: "t", togri: 5 });
  assert.equal(r.navbatda, true);
  assert.equal(m.navbatUzunligi(), 1);
  const yuborilgan = [];
  globalThis.fetch = async (u, o) => { yuborilgan.push([u, o.body]); return new Response("{}", { status: 200 }); };
  assert.equal(await m.navbatniYubor(), 1);
  assert.equal(m.navbatUzunligi(), 0);
  assert.equal(yuborilgan.length, 1);
});
