
import assert from "node:assert/strict";
import test from "node:test";
import {
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

test("V17 self-service trial exposes four private organization types", () => {
  assert.equal(ORGANIZATION_TRIAL_DAYS, 30);
  assert.equal(ORGANIZATION_ACTIVATION_PRICE_UZS, 200_000);
  assert.deepEqual(
    ORGANIZATION_TYPES.map((item) => item.value),
    ["kindergarten", "school", "learning_center", "institute"],
  );

  const payload = buildTrialStartPayload({
    organizationType: "school",
    name: "  Ziyo maktabi  ",
    idempotencyKey: "trial-start:fixed",
  });
  assert.deepEqual(payload, {
    organization_type: "school",
    name: "Ziyo maktabi",
    ownership_type: "private",
    confirm_start: true,
    idempotency_key: "trial-start:fixed",
  });
  assert.throws(
    () => buildTrialStartPayload({ organizationType: "public_school", name: "No", idempotencyKey: "x" }),
    /turini tanlang/,
  );
});

test("activation payload cannot be created without explicit charge consent", () => {
  assert.throws(
    () => buildActivationPayload({ confirmed: false, idempotencyKey: "activation:1" }),
    /tasdiqlang/,
  );
  assert.deepEqual(
    buildActivationPayload({ confirmed: true, idempotencyKey: "activation:1" }),
    { confirm_charge: true, idempotency_key: "activation:1" },
  );
  assert.equal(formatUzs(200_000), "200 000 UZS");
});

test("expired unpaid organization is read-only and maps to its retained workspace", () => {
  const organization = {
    id: 41,
    context_id: 90,
    organization_type: "learning_center",
    name: "Kelajak markazi",
    lifecycle_status: "read_only",
    access_mode: "read_only",
    trial_ends_at: "2026-09-01T00:00:00Z",
    days_remaining: 0,
  };
  assert.equal(organizationIsReadOnly(organization), true);
  assert.equal(organizationTrialState(organization).label, "Faqat ko'rish");
  assert.deepEqual(organizationToLegacyMembership(organization), {
    turi: "markaz",
    muassasa_id: 90,
    muassasa_nomi: "Kelajak markazi",
    lavozim: "owner",
    context_id: 90,
    organization_v17_id: 41,
    lifecycle_status: "read_only",
    access_mode: "read_only",
    trial_ends_at: "2026-09-01T00:00:00Z",
    days_remaining: 0,
  });
});

test("wallet and read-only errors have actionable Uzbek messages", () => {
  assert.match(
    organizationTrialErrorMessage({
      detail: {
        code: "INSUFFICIENT_WALLET_BALANCE",
        required_uzs: 200_000,
        balance_uzs: 15_000,
      },
    }),
    /Kerak: 200 000 UZS, mavjud: 15 000 UZS/,
  );
  assert.match(
    organizationTrialErrorMessage({ detail: { code: "TRIAL_READ_ONLY" } }),
    /faqat ko'rish/,
  );
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
