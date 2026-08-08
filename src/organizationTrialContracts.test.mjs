import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const app = fs.readFileSync(path.join(here, "App.jsx"), "utf8");

const adminTemplates = app.slice(
  app.indexOf("function AdminTab"),
  app.indexOf("function AdminMuassasalarTab"),
);
const adminOrganizations = app.slice(
  app.indexOf("function AdminMuassasalarTab"),
  app.indexOf("const SINF_HARFLARI"),
);

test("four institution managers left Admin Shablonlar for their own menu tab", () => {
  for (const label of ["Maktablar", "O'quv markazlari", "Bog'chalar", "Universitetlar"]) {
    assert.equal(adminTemplates.includes(label), false, `${label} is still inside AdminTab`);
    assert.equal(adminOrganizations.includes(label), true, `${label} is missing from AdminMuassasalarTab`);
  }
  assert.match(app, /\{ kalit: "admin_muassasalar", nom: "Muassasalar", ikon: Building2 \}/);
  assert.match(app, /tab === "admin_muassasalar" && <AdminMuassasalarTab token=\{token\} \/>/);
  assert.match(adminOrganizations, /> Yangi muassasa\s*</);
});

test("teacher receives one canonical private-organization wizard and repetitor stays separate", () => {
  assert.equal((app.match(/nom: "Yangi muassasa"/g) || []).length, 1);
  assert.match(app, /kalit: "muassasa_v17"/);
  assert.match(app, /nom: "Repetitorlik ochish"/);
  assert.match(app, /guruhMaqsadi: "repetitor"/);
  assert.match(app, /ORGANIZATION_TYPES\.map/);
  assert.match(app, /Davlat yoki ommaviy muassasa yaratish administrator orqali/);
});

test("V17 API uses bearer auth, retry-safe keys, and explicit activation consent", () => {
  assert.match(app, /Authorization: `Bearer \$\{token\}`/);
  assert.match(app, /muassasaV17Sorov\("\/meniki", token\)/);
  assert.match(app, /muassasaV17Sorov\("\/sinov-boshlash", token/);
  assert.match(app, /muassasaV17Sorov\(`\/\$\{organizationId\}\/faollashtirish`, token/);
  assert.match(app, /const yaratishKalitiRef = useRef\(""\)/);
  assert.match(app, /const faollashtirishKalitlariRef = useRef\(new Map\(\)\)/);
  assert.match(app, /checked=\{tolovTasdiqlandi\}/);
  assert.match(app, /disabled=\{!tolovTasdiqlandi \|\| jarayon === "faollashtirish"\}/);
  assert.match(app, /buildActivationPayload\(\{/);
});

test("admin manual wallet credit is provider-honest and explicitly confirmed", () => {
  assert.match(adminOrganizations, /Tasdiqlangan hamyon to'ldirish/);
  assert.match(adminOrganizations, /To'lov provayderi hozircha ulanmagan/);
  assert.match(app, /muassasaV17Sorov\("\/admin\/hamyon-toldirish", token/);
  assert.match(app, /buildAdminWalletCreditPayload\(\{/);
  assert.match(app, /checked=\{hamyonTasdiqlandi\}/);
  assert.match(app, /disabled=\{!hamyonTasdiqlandi \|\| hamyonJarayon\}/);
});

test("trial and expiry copy promise 30 days, read-only access, and retained data", () => {
  assert.match(app, /30 kunlik sinov tugagan/);
  assert.match(app, /Sinov tugashi: \{formatTrialEnd\(organization\.trial_ends_at\)\}/);
  assert.match(app, /Barcha ma'lumot saqlangan/);
  assert.match(app, /To'lanmagan muassasa o'chirilmaydi/);
  assert.match(app, /Bir martalik faollashtirish/);
  assert.match(app, /avtomatik yechim yo'q/);
});
