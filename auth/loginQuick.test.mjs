import test from "node:test";
import assert from "node:assert/strict";
import { methodLabel, rememberAccount, savedAccounts } from "./loginMemory.js";

function memoryStore() {
  const data = new Map();
  return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, String(v)), removeItem: (k) => data.delete(k) };
}

test("quick account is remembered and switches method once Telegram is linked", () => {
  const store = memoryStore();
  rememberAccount({ user_id: -5, full_name: "Talaba 1234", identities: {}, learning_profile: { role: "talaba" } }, "tok", { method: "quick" }, store);
  assert.equal(savedAccounts(store)[0].method, "quick");
  assert.equal(savedAccounts(store)[0].role, "talaba");
  assert.equal(methodLabel("quick"), "Tez kirish");
  rememberAccount({ user_id: -5, full_name: "Talaba 1234", identities: { telegram: true } }, "tok2", null, store);
  assert.equal(savedAccounts(store)[0].method, "telegram");
});
