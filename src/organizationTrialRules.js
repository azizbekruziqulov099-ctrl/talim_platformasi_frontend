export const PAYMENTS_ENABLED = false;
export const PRIVATE_OWNERSHIP_TYPE = "private";
export const ORGANIZATION_TRIAL_DAYS = 0;
export const ORGANIZATION_ACTIVATION_PRICE_UZS = 0;
export const ADMIN_WALLET_CREDIT_MAX_UZS = 100_000_000;
export const ORGANIZATION_TYPES = Object.freeze([
  { value: "kindergarten", label: "Bog'cha", icon: "🧸", legacyType: "bogcha", workspace: "bogcha_workspace" },
  { value: "school", label: "Maktab", icon: "🏫", legacyType: "maktab", workspace: "maktab_workspace" },
  { value: "learning_center", label: "O'quv markazi", icon: "🎓", legacyType: "markaz", workspace: "markaz_workspace" },
  { value: "institute", label: "Institut", icon: "🏛️", legacyType: "universitet", workspace: "institut_workspace" },
]);
const TYPE_BY_VALUE = new Map(ORGANIZATION_TYPES.map(item => [item.value, item]));
export const organizationTypeMeta = value => TYPE_BY_VALUE.get(value) || { value, label: "Muassasa", icon: "🏢", legacyType: null, workspace: null };
export const formatUzs = value => `${Math.max(0, Number(value) || 0).toLocaleString("uz-UZ")} UZS`;
export const organizationIsReadOnly = () => false;
export const organizationCanActivate = () => false;
export const organizationTrialState = () => ({ key: "active", label: "Faol · bepul", detail: "Barcha imkoniyatlar hozircha bepul ochilgan." });
export function formatTrialEnd() { return "Muddatsiz"; }
export function makeOrganizationIdempotencyKey(scope = "organization") { return `${scope}:${globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`}`; }
export function buildTrialStartPayload({ organizationType, name, idempotencyKey }) { const normalizedName = String(name || "").trim(); if (!TYPE_BY_VALUE.has(organizationType)) throw new Error("Muassasa turini tanlang"); if (normalizedName.length < 2) throw new Error("Muassasa nomini kiriting"); return { organization_type: organizationType, name: normalizedName, ownership_type: "private", confirm_start: true, free_mode: true, idempotency_key: idempotencyKey || makeOrganizationIdempotencyKey("free") }; }
export function buildActivationPayload() { return { confirm_charge: false, free_mode: true }; }
export function buildAdminWalletCreditPayload({
  userId,
  amountUzs,
  reference,
  note,
  confirmed,
  idempotencyKey,
}) {
  const normalizedUserId = Number(userId);
  const normalizedAmount = Number(amountUzs);
  const normalizedReference = String(reference || "").trim();
  const normalizedNote = String(note || "").trim();
  if (!Number.isInteger(normalizedUserId) || normalizedUserId < 1) {
    throw new Error("To'g'ri user_id kiriting");
  }
  if (
    !Number.isInteger(normalizedAmount)
    || normalizedAmount < 1
    || normalizedAmount > ADMIN_WALLET_CREDIT_MAX_UZS
  ) {
    throw new Error("amount_uzs 1 dan 100 000 000 gacha bo'lishi kerak");
  }
  if (normalizedReference.length < 3 || normalizedReference.length > 160) {
    throw new Error("Audit uchun 3–160 belgili reference kiriting");
  }
  if (!confirmed) {
    throw new Error("Hamyon kreditini aniq tasdiqlang");
  }
  if (!idempotencyKey) {
    throw new Error("So'rov kaliti yaratilmagan");
  }
  return {
    user_id: normalizedUserId,
    amount_uzs: normalizedAmount,
    reference: normalizedReference,
    ...(normalizedNote ? { note: normalizedNote } : {}),
    confirm_credit: true,
    idempotency_key: idempotencyKey,
  };
}
export const organizationTrialErrorMessage = (detail, fallback = "Amalni bajarib bo'lmadi") => typeof (detail?.detail ?? detail) === "string" ? (detail?.detail ?? detail) : detail?.message || fallback;
export function organizationToLegacyMembership(organization) { const meta = organizationTypeMeta(organization?.organization_type); if (!organization || !meta.legacyType) return null; return { turi: meta.legacyType, muassasa_id: organization.context_id || organization.id, muassasa_nomi: organization.name, lavozim: "owner", context_id: organization.context_id, organization_v17_id: organization.id, lifecycle_status: "active", access_mode: "full", days_remaining: null }; }
