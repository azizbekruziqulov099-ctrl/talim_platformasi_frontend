const API_PREFIX = "/api/institut-v1";
const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;
const idempotencyByFingerprint = new Map();

export const instituteRoutes = Object.freeze({
  health: "/health",
  meta: "/meta",
  workspaces: "/workspaces",
  dashboard: "/dashboard",
  userSearch: "/users/search",
  onboardingDrafts: "/onboarding/drafts",
  onboardingDraft: (draftId) => `/onboarding/drafts/${draftId}`,
  onboardingPreview: (draftId) => `/onboarding/drafts/${draftId}/preview`,
  onboardingCommit: (draftId) => `/onboarding/drafts/${draftId}/commit`,
  adminVerifications: "/admin/verifications",
  adminVerificationDecision: (contextId) =>
    `/admin/verifications/${contextId}/decision`,
  campuses: "/campuses",
  rooms: "/rooms",
  faculties: "/faculties",
  departments: "/departments",
  programs: "/programs",
  academicYears: "/academic-years",
  terms: "/terms",
  termStatus: (termId) => `/terms/${termId}/status`,
  staff: "/staff",
  staffEnd: (assignmentId) => `/staff/${assignmentId}/end`,
  courseCatalog: "/course-catalog",
  curricula: "/curricula",
  curriculumCourses: (curriculumId) =>
    `/curricula/${curriculumId}/courses`,
  curriculumPublish: (curriculumId) =>
    `/curricula/${curriculumId}/publish`,
  cohorts: "/cohorts",
  sections: "/sections",
  sectionActivate: (sectionId) => `/sections/${sectionId}/activate`,
  enrollments: "/enrollments",
  enrollmentDecision: (enrollmentId) =>
    `/enrollments/${enrollmentId}/decision`,
  schedule: "/schedule",
  schedulePublish: (slotId) => `/schedule/${slotId}/publish`,
  attendance: "/attendance",
  assessments: "/assessments",
  assessmentPublish: (assessmentId) =>
    `/assessments/${assessmentId}/publish`,
  grades: "/grades",
  courseResults: "/course-results",
  courseResultFinalize: (enrollmentId) =>
    `/course-results/${enrollmentId}/finalize`,
  transcripts: "/transcripts",
  transcriptIssue: (studentId) => `/transcripts/${studentId}/issue`,
  contracts: "/contracts",
  contractInstallments: (contractId) =>
    `/contracts/${contractId}/installments`,
  payments: "/payments",
  debts: "/debts",
  workloads: "/workloads",
  analyticsSummary: "/analytics/summary",
  assistantSessions: "/assistant/sessions",
  assistantActions: (sessionId) =>
    `/assistant/sessions/${sessionId}/actions`,
});

export const INSTITUTE_API_CONTRACT = Object.freeze([
  ["GET", "/health"],
  ["GET", "/meta"],
  ["GET", "/workspaces"],
  ["GET", "/dashboard"],
  ["GET", "/users/search"],
  ["POST", "/onboarding/drafts"],
  ["PATCH", "/onboarding/drafts/{draft_id}"],
  ["GET", "/onboarding/drafts/{draft_id}/preview"],
  ["POST", "/onboarding/drafts/{draft_id}/commit"],
  ["GET", "/admin/verifications"],
  ["POST", "/admin/verifications/{context_id}/decision"],
  ["GET", "/campuses"],
  ["POST", "/campuses"],
  ["GET", "/rooms"],
  ["POST", "/rooms"],
  ["GET", "/faculties"],
  ["POST", "/faculties"],
  ["GET", "/departments"],
  ["POST", "/departments"],
  ["GET", "/programs"],
  ["POST", "/programs"],
  ["GET", "/academic-years"],
  ["POST", "/academic-years"],
  ["GET", "/terms"],
  ["POST", "/terms"],
  ["POST", "/terms/{term_id}/status"],
  ["GET", "/staff"],
  ["POST", "/staff"],
  ["POST", "/staff/{assignment_id}/end"],
  ["GET", "/course-catalog"],
  ["POST", "/course-catalog"],
  ["GET", "/curricula"],
  ["POST", "/curricula"],
  ["POST", "/curricula/{curriculum_id}/courses"],
  ["POST", "/curricula/{curriculum_id}/publish"],
  ["GET", "/cohorts"],
  ["POST", "/cohorts"],
  ["GET", "/sections"],
  ["POST", "/sections"],
  ["POST", "/sections/{section_id}/activate"],
  ["GET", "/enrollments"],
  ["POST", "/enrollments"],
  ["POST", "/enrollments/{enrollment_id}/decision"],
  ["GET", "/schedule"],
  ["POST", "/schedule"],
  ["POST", "/schedule/{slot_id}/publish"],
  ["GET", "/attendance"],
  ["POST", "/attendance"],
  ["GET", "/assessments"],
  ["POST", "/assessments"],
  ["POST", "/assessments/{assessment_id}/publish"],
  ["GET", "/grades"],
  ["POST", "/grades"],
  ["GET", "/course-results"],
  ["POST", "/course-results/{enrollment_id}/finalize"],
  ["GET", "/transcripts"],
  ["POST", "/transcripts/{student_id}/issue"],
  ["GET", "/contracts"],
  ["POST", "/contracts"],
  ["POST", "/contracts/{contract_id}/installments"],
  ["POST", "/payments"],
  ["GET", "/debts"],
  ["GET", "/workloads"],
  ["POST", "/workloads"],
  ["GET", "/analytics/summary"],
  ["POST", "/assistant/sessions"],
  ["POST", "/assistant/sessions/{session_id}/actions"],
]);

function makeUrl(apiBase, path, query, contextId, method) {
  const base = apiBase || window.location.origin;
  const url = new URL(`${base}${API_PREFIX}${path}`, window.location.origin);
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  if (
    contextId &&
    ["GET", "HEAD", "DELETE"].includes(String(method || "GET").toUpperCase())
  ) {
    url.searchParams.set("context_id", String(contextId));
  }
  // JWT URL, brauzer tarixi, proksi yoki server logiga tushmasin.
  url.searchParams.delete("token");
  return url;
}

function readError(data, response) {
  const detail = data?.detail;
  if (typeof detail === "string") return detail;
  if (detail?.message) return detail.message;
  if (Array.isArray(detail?.errors)) return detail.errors.join("\n");
  if (data?.message) return data.message;
  return `So‘rov bajarilmadi (${response.status})`;
}

export async function instituteApi(
  path,
  {
    apiBase,
    token,
    contextId,
    method = "GET",
    query,
    body,
    signal,
    headers,
    idempotencyKey,
    allowed,
  } = {},
) {
  const normalizedMethod = String(method).toUpperCase();
  const isWrite = !["GET", "HEAD", "OPTIONS"].includes(normalizedMethod);
  if (isWrite && allowed !== true) {
    const error = new Error(
      "Bu amal uchun server bergan aniq ruxsat va inson tasdig‘i talab qilinadi.",
    );
    error.status = 403;
    throw error;
  }
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;
  const requestBody =
    contextId && isWrite && body !== undefined && !isFormData
      ? { ...body, context_id: Number(contextId) }
      : body;
  const response = await fetch(
    makeUrl(apiBase, path, query, contextId, normalizedMethod),
    {
      method: normalizedMethod,
      headers: {
        Accept: "application/json",
        ...(requestBody !== undefined && !isFormData
          ? { "Content-Type": "application/json" }
          : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
        ...(headers || {}),
      },
      body:
        requestBody === undefined
          ? undefined
          : isFormData
            ? requestBody
            : JSON.stringify(requestBody),
      signal,
      cache: "no-store",
      credentials: "omit",
    },
  );

  let data = null;
  const contentType = response.headers.get("content-type") || "";
  try {
    data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();
  } catch {
    data = null;
  }
  if (!response.ok) {
    const error = new Error(readError(data, response));
    error.status = response.status;
    error.code = data?.code || data?.detail?.code || null;
    error.detail = data?.detail;
    throw error;
  }
  if (idempotencyKey) completeIdempotency(idempotencyKey);
  return data;
}

export function pageQuery({
  afterId,
  limit = 50,
  search,
  status,
  ...filters
} = {}) {
  return {
    after_id: afterId || undefined,
    limit: Math.min(Math.max(Number(limit) || 50, 1), 100),
    search: search?.trim() || undefined,
    status: status || undefined,
    ...filters,
  };
}

export function unwrapItems(data) {
  if (Array.isArray(data)) {
    return { items: data, nextCursor: null, hasMore: false };
  }
  return {
    items: data?.items || [],
    nextCursor: data?.next_cursor ?? null,
    hasMore: Boolean(data?.has_more ?? data?.next_cursor),
  };
}

export function mergePage(current, incoming, key = "id") {
  const getKey =
    typeof key === "function" ? key : (item) => item?.[key] ?? item?.id;
  const merged = new Map(current.map((item) => [String(getKey(item)), item]));
  incoming.forEach((item) => merged.set(String(getKey(item)), item));
  return [...merged.values()];
}

function fingerprintHash(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function completeIdempotency(key) {
  for (const [fingerprint, entry] of idempotencyByFingerprint) {
    if (entry.key !== key) continue;
    idempotencyByFingerprint.delete(fingerprint);
    try {
      globalThis.sessionStorage?.removeItem(entry.storageKey);
    } catch {
      // Yopiq saqlash muhiti so‘rovni to‘xtatmasligi kerak.
    }
    return;
  }
}

export function makeIdempotencyKey(scope, values = []) {
  const fingerprint = JSON.stringify([scope, ...values]);
  const current = idempotencyByFingerprint.get(fingerprint);
  if (current && Date.now() - current.createdAt < IDEMPOTENCY_TTL_MS) {
    return current.key;
  }
  const storageKey = `samtm-institut-idem-${fingerprintHash(fingerprint)}`;
  try {
    const saved = JSON.parse(
      globalThis.sessionStorage?.getItem(storageKey) || "null",
    );
    if (
      saved?.fingerprint === fingerprint &&
      typeof saved.key === "string" &&
      Date.now() - Number(saved.created_at || 0) < IDEMPOTENCY_TTL_MS
    ) {
      const restored = {
        key: saved.key,
        createdAt: Number(saved.created_at),
        storageKey,
      };
      idempotencyByFingerprint.set(fingerprint, restored);
      return restored.key;
    }
  } catch {
    // sessionStorage mavjud bo‘lmasa modul xotirasi ishlaydi.
  }
  const random =
    globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const key = [scope, fingerprintHash(fingerprint), random]
    .join(":")
    .slice(0, 180);
  const entry = { key, createdAt: Date.now(), storageKey };
  idempotencyByFingerprint.set(fingerprint, entry);
  try {
    globalThis.sessionStorage?.setItem(
      storageKey,
      JSON.stringify({
        fingerprint,
        key,
        created_at: entry.createdAt,
      }),
    );
  } catch {
    // Modul xotirasidagi kalit sahifa ochiq turgancha retry himoyasini beradi.
  }
  return key;
}
