export const ORGANIZATION_TRIAL_DAYS = 30;
export const ORGANIZATION_ACTIVATION_PRICE_UZS = 200_000;
export const ADMIN_WALLET_CREDIT_MAX_UZS = 100_000_000;
export const PRIVATE_OWNERSHIP_TYPE = "private";

export const ORGANIZATION_TYPES = Object.freeze([
  {
    value: "kindergarten",
    label: "Bog'cha",
    icon: "🧸",
    legacyType: "bogcha",
    workspace: "bogcha_workspace",
  },
  {
    value: "school",
    label: "Maktab",
    icon: "🏫",
    legacyType: "maktab",
    workspace: "maktab_workspace",
  },
  {
    value: "learning_center",
    label: "O'quv markazi",
    icon: "🎓",
    legacyType: "markaz",
    workspace: "markaz_workspace",
  },
  {
    value: "institute",
    label: "Institut",
    icon: "🏛️",
    legacyType: "universitet",
    workspace: "institut_workspace",
  },
]);

const TYPE_BY_VALUE = new Map(ORGANIZATION_TYPES.map((item) => [item.value, item]));

export function organizationTypeMeta(value) {
  return TYPE_BY_VALUE.get(value) || {
    value,
    label: "Muassasa",
    icon: "🏢",
    legacyType: null,
    workspace: null,
  };
}

export function formatUzs(value) {
  const amount = Number.isFinite(Number(value))
    ? Number(value)
    : ORGANIZATION_ACTIVATION_PRICE_UZS;
  return `${Math.max(0, amount).toLocaleString("uz-UZ")} UZS`;
}

export function organizationIsReadOnly(organization) {
  return organization?.access_mode === "read_only" || organization?.lifecycle_status === "read_only";
}

export function organizationCanActivate(organization) {
  if (!organization || organization.lifecycle_status === "active") return false;
  if (typeof organization.can_activate === "boolean") return organization.can_activate;
  return organization.lifecycle_status === "trial" || organizationIsReadOnly(organization);
}

export function organizationTrialState(organization) {
  if (organization?.lifecycle_status === "active") {
    return {
      key: "active",
      label: "Faol",
      detail: "Muassasa bir martalik to'lov bilan faollashtirilgan.",
    };
  }
  if (organizationIsReadOnly(organization)) {
    return {
      key: "read_only",
      label: "Faqat ko'rish",
      detail: "Sinov tugagan. Ma'lumotlar saqlangan, lekin tahrirlash faollashtirilguncha yopiq.",
    };
  }
  const days = Math.max(0, Number.parseInt(organization?.days_remaining, 10) || 0);
  return {
    key: "trial",
    label: "Bepul sinov",
    detail: `${days} kun qoldi`,
  };
}

export function formatTrialEnd(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function makeOrganizationIdempotencyKey(scope = "organization") {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) return `${scope}:${uuid}`;
  return `${scope}:${Date.now().toString(36)}:${Math.random().toString(36).slice(2)}`;
}

export function buildTrialStartPayload({ organizationType, name, idempotencyKey }) {
  if (!TYPE_BY_VALUE.has(organizationType)) {
    throw new Error("Muassasa turini tanlang");
  }
  const normalizedName = String(name || "").trim();
  if (normalizedName.length < 2) {
    throw new Error("Muassasa nomini kiriting");
  }
  if (!idempotencyKey) {
    throw new Error("So'rov kaliti yaratilmagan");
  }
  return {
    organization_type: organizationType,
    name: normalizedName,
    ownership_type: PRIVATE_OWNERSHIP_TYPE,
    confirm_start: true,
    idempotency_key: idempotencyKey,
  };
}

export function buildActivationPayload({ confirmed, idempotencyKey }) {
  if (!confirmed) {
    throw new Error("200 000 UZS yechilishini tasdiqlang");
  }
  if (!idempotencyKey) {
    throw new Error("So'rov kaliti yaratilmagan");
  }
  return {
    confirm_charge: true,
    idempotency_key: idempotencyKey,
  };
}

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

export function organizationTrialErrorMessage(detail, fallback = "Amalni bajarib bo'lmadi") {
  const source = detail?.detail ?? detail;
  const code = source?.code || detail?.code;
  if (code === "INSUFFICIENT_WALLET_BALANCE") {
    return `Hamyon mablag'i yetarli emas. Kerak: ${formatUzs(source.required_uzs)}, mavjud: ${formatUzs(source.balance_uzs)}.`;
  }
  if (code === "TRIAL_READ_ONLY" || code === "ORGANIZATION_READ_ONLY") {
    return "Sinov muddati tugagan. Ma'lumotlar saqlangan, hozir faqat ko'rish mumkin.";
  }
  if (typeof source === "string" && source.trim()) return source;
  if (typeof source?.message === "string" && source.message.trim()) return source.message;
  if (typeof detail?.message === "string" && detail.message.trim()) return detail.message;
  return fallback;
}

export function organizationToLegacyMembership(organization) {
  const meta = organizationTypeMeta(organization?.organization_type);
  if (!organization || !meta.legacyType) return null;
  return {
    turi: meta.legacyType,
    muassasa_id: organization.context_id || organization.id,
    muassasa_nomi: organization.name,
    lavozim: "owner",
    context_id: organization.context_id,
    organization_v17_id: organization.id,
    lifecycle_status: organization.lifecycle_status,
    access_mode: organization.access_mode,
    trial_ends_at: organization.trial_ends_at,
    days_remaining: organization.days_remaining,
  };
}
