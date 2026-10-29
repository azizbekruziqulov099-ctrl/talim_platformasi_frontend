
import assert from "node:assert/strict";
import test from "node:test";
import {
  PAYMENTS_ENABLED,
  ORGANIZATION_ACTIVATION_PRICE_UZS,
  ORGANIZATION_TRIAL_DAYS,
  ORGANIZATION_TYPES,
  buildAdminWalletCreditPayload,
  buildActivationPayload,
  buildTrialStartPayload,
  formatUzs,
  organizationIsReadOnly,
  organizationToLegacyMembership,
  organizationTrialErrorMessage,
  organizationTrialState,
} from "./organizationTrialRules.js";

test("free mode: four private organization types, no trial clock, no price", () => {
  // Hozirgi siyosat: to'lovlar o'chirilgan (PAYMENTS_ENABLED=false) — sinov muddati va narx yo'q, hammasi bepul ochiq.
  assert.equal(PAYMENTS_ENABLED, false);
  assert.equal(ORGANIZATION_TRIAL_DAYS, 0);
  assert.equal(ORGANIZATION_ACTIVATION_PRICE_UZS, 0);
  assert.deepEqual(
    ORGANIZATION_TYPES.map((item) => item.value),
    ["kindergarten", "school", "learning_center", "institute"],
  );
  const payload = buildTrialStartPayload({ organizationType: "school", name: "  Ziyo maktabi  ", idempotencyKey: "trial-start:fixed" });
  assert.deepEqual(payload, {
    organization_type: "school",
    name: "Ziyo maktabi",
    ownership_type: "private",
    confirm_start: true,
    free_mode: true,
    idempotency_key: "trial-start:fixed",
  });
  assert.throws(() => buildTrialStartPayload({ organizationType: "public_school", name: "No", idempotencyKey: "x" }), /turini tanlang/);
  assert.throws(() => buildTrialStartPayload({ organizationType: "school", name: " ", idempotencyKey: "x" }), /nomini kiriting/);
});

test("free mode never charges: activation payload carries no charge consent", () => {
  assert.deepEqual(buildActivationPayload({ confirmed: true, idempotencyKey: "activation:1" }), { confirm_charge: false, free_mode: true });
  assert.match(formatUzs(200_000), /^200[\s\u00a0\u202f,.]?000 UZS$/);
});

test("free mode organization is never read-only and maps to its workspace", () => {
  const organization = { id: 41, context_id: 90, organization_type: "learning_center", name: "Kelajak markazi" };
  assert.equal(organizationIsReadOnly(organization), false);
  assert.equal(organizationTrialState(organization).key, "active");
  assert.deepEqual(organizationToLegacyMembership(organization), {
    turi: "markaz",
    muassasa_id: 90,
    muassasa_nomi: "Kelajak markazi",
    lavozim: "owner",
    context_id: 90,
    organization_v17_id: 41,
    lifecycle_status: "active",
    access_mode: "full",
    days_remaining: null,
  });
});

test("error messages fall back to server text or a clear Uzbek default", () => {
  assert.equal(organizationTrialErrorMessage({ detail: "Ruxsat yo'q" }), "Ruxsat yo'q");
  assert.equal(organizationTrialErrorMessage({}), "Amalni bajarib bo'lmadi");
});

test("admin wallet credit requires a bounded amount, audit reference, and explicit confirmation", () => {
  assert.throws(
    () => buildAdminWalletCreditPayload({
      userId: 17,
      amountUzs: 200_000,
      reference: "PAY-42",
      confirmed: false,
      idempotencyKey: "admin-wallet:fixed",
    }),
    /aniq tasdiqlang/,
  );
  assert.deepEqual(
    buildAdminWalletCreditPayload({
      userId: "17",
      amountUzs: "200000",
      reference: "  PAY-42  ",
      note: "Kassa cheki tekshirildi",
      confirmed: true,
      idempotencyKey: "admin-wallet:fixed",
    }),
    {
      user_id: 17,
      amount_uzs: 200_000,
      reference: "PAY-42",
      note: "Kassa cheki tekshirildi",
      confirm_credit: true,
      idempotency_key: "admin-wallet:fixed",
    },
  );
});
