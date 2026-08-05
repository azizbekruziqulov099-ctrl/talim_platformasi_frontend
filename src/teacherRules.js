export const TEACHER_FREE_CLUB_LIMIT = 1;
export const SECOND_CLUB_PRICE_UZS = 50_000;
export const CLUB_STUDENT_LIMIT = 25;

export function apiErrorMessage(detail, fallback = "Xato yuz berdi") {
  if (typeof detail === "string" && detail.trim()) return detail;
  if (detail && typeof detail === "object") {
    if (typeof detail.message === "string" && detail.message.trim()) return detail.message;
    if (typeof detail.detail === "string" && detail.detail.trim()) return detail.detail;
  }
  return fallback;
}

export function normalizedClubCapacity(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return CLUB_STUDENT_LIMIT;
  return Math.min(parsed, CLUB_STUDENT_LIMIT);
}

export function groupTypeLabel(type) {
  return {
    sinf: "Sinf",
    guruh: "Guruh",
    grupa: "Grupa",
    repetitor: "Repetitor guruhi",
  }[type] || "Guruh";
}

export function topicName(topic) {
  const generic = /^\s*(?:(?:birinchi|ikkinchi|uchinchi|to['‘’]?rtinchi|beshinchi|oltinchi|yettinchi|sakkizinchi|to['‘’]?qqizinchi|o['‘’]?ninchi|\d+)\s*-?\s*)?(?:mavzu|mavzu nomi)\s*\d*\s*$/iu;
  const candidates = [
    topic?.real_topic_name,
    topic?.display_name,
    topic?.kichik_name,
    topic?.mavzu_name,
    topic?.nomi,
    topic?.bolim_name,
    topic?.bob_name,
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean);
  const raw = candidates.find((value) => !generic.test(value)) || candidates[0] || "Nomsiz mavzu";
  const withoutNumber = raw
    .replace(/^\s*\d+\s*(?:-?\s*mavzu\s*|[-.)]\s*)/iu, "")
    .replace(/^\s*(?:birinchi|ikkinchi|uchinchi|to['‘’]?rtinchi|beshinchi|oltinchi|yettinchi|sakkizinchi|to['‘’]?qqizinchi|o['‘’]?ninchi)\s+mavzu\s*[:—-]?\s*/iu, "")
    .trim();
  return withoutNumber || raw;
}

export function formatTopicTitle(index, topic) {
  const tartib = Number.isFinite(Number(topic?.tartib_raqami))
    ? Number(topic.tartib_raqami)
    : Number(index) + 1;
  return `${tartib}-mavzu — ${topicName(topic)}`;
}

export function freeClubAvailable(quota) {
  if (!quota) return true;
  if (quota.admin) return true;
  return Boolean(quota.bepul_yarata_oladi);
}
