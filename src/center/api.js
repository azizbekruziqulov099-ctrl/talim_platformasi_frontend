const API_PREFIX = "/api/markaz-v2";
const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;
const idempotencyStorageByKey = new Map();
const idempotencyKeyByFingerprint = new Map();

export const centerRoutes = Object.freeze({
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
  branches: "/branches",
  rooms: "/rooms",
  subjects: "/subjects",
  staff: "/staff",
  staffStatus: (assignmentId) => `/staff/${assignmentId}/status`,
  staffAvailability: (teacherUserId) =>
    `/staff/${teacherUserId}/availability`,
  courses: "/courses",
  courseCatalog: "/courses/catalog",
  courseActivate: (courseId) => `/courses/${courseId}/activate`,
  enrollments: "/enrollments",
  enrollmentDecision: (enrollmentId) =>
    `/enrollments/${enrollmentId}/decision`,
  parentLinks: "/parent-links",
  parentLinkRevoke: (parentUserId, studentUserId) =>
    `/parent-links/${parentUserId}/${studentUserId}/revoke`,
  schedule: "/schedule",
  schedulePublish: (slotId) => `/schedule/${slotId}/publish`,
  attendance: "/attendance",
  grades: "/grades",
  lessonPlans: "/lesson-plans",
  lessonPlanPublish: (planId) => `/lesson-plans/${planId}/publish`,
  homework: "/homework",
  homeworkPublish: (homeworkId) => `/homework/${homeworkId}/publish`,
  homeworkSubmissions: (homeworkId) =>
    `/homework/${homeworkId}/submissions`,
  homeworkMySubmission: (homeworkId) =>
    `/homework/${homeworkId}/my-submission`,
  homeworkSubmissionGrade: (submissionId) =>
    `/homework-submissions/${submissionId}/grade`,
  homeworkSubmissionReturn: (submissionId) =>
    `/homework-submissions/${submissionId}/return`,
  assessments: "/assessments",
  assessmentPublish: (assessmentId) =>
    `/assessments/${assessmentId}/publish`,
  assessmentAttempts: (assessmentId) =>
    `/assessments/${assessmentId}/attempts`,
  assessmentAttemptReviews: "/assessment-attempts",
  myAssessmentAttempts: "/my-assessment-attempts",
  attempt: (attemptId) => `/attempts/${attemptId}`,
  attemptDraft: (attemptId) => `/attempts/${attemptId}/draft`,
  attemptReview: (attemptId) => `/attempts/${attemptId}/review`,
  attemptSubmit: (attemptId) => `/attempts/${attemptId}/submit`,
  attemptScore: (attemptId) => `/attempts/${attemptId}/score`,
  attemptResult: (attemptId) => `/attempts/${attemptId}/result`,
  lessonPlanDocx: (planId) => `/lesson-plans/${planId}/docx`,
  billingPlans: "/billing/plans",
  billingDiscounts: "/billing/discounts",
  billingInvoices: "/billing/invoices",
  billingPayments: "/billing/payments",
  billingDebts: "/billing/debts",
  teacherWorkload: "/teacher-workload",
  teacherWorklogs: "/teacher-worklogs",
  teacherWorklogDecision: (worklogId) =>
    `/teacher-worklogs/${worklogId}/decision`,
  analyticsSummary: "/analytics/summary",
  assistantSessions: "/assistant/sessions",
  assistantActions: (sessionId) =>
    `/assistant/sessions/${sessionId}/actions`,
});

export const CENTER_API_CONTRACT = Object.freeze([
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
  ["GET", "/branches"],
  ["POST", "/branches"],
  ["GET", "/rooms"],
  ["POST", "/rooms"],
  ["GET", "/subjects"],
  ["POST", "/subjects"],
  ["GET", "/staff"],
  ["POST", "/staff"],
  ["POST", "/staff/{assignment_id}/status"],
  ["GET", "/staff/{teacher_user_id}/availability"],
  ["PUT", "/staff/{teacher_user_id}/availability"],
  ["GET", "/courses/catalog"],
  ["GET", "/courses"],
  ["POST", "/courses"],
  ["POST", "/courses/{course_id}/activate"],
  ["GET", "/enrollments"],
  ["POST", "/enrollments"],
  ["POST", "/enrollments/{enrollment_id}/decision"],
  ["GET", "/parent-links"],
  ["POST", "/parent-links"],
  ["POST", "/parent-links/{parent_user_id}/{student_user_id}/revoke"],
  ["GET", "/schedule"],
  ["POST", "/schedule"],
  ["POST", "/schedule/{slot_id}/publish"],
  ["GET", "/attendance"],
  ["POST", "/attendance"],
  ["GET", "/grades"],
  ["POST", "/grades"],
  ["GET", "/lesson-plans"],
  ["POST", "/lesson-plans"],
  ["POST", "/lesson-plans/{plan_id}/publish"],
  ["GET", "/homework"],
  ["POST", "/homework"],
  ["POST", "/homework/{homework_id}/publish"],
  ["POST", "/homework/{homework_id}/submissions"],
  ["GET", "/homework/{homework_id}/submissions"],
  ["GET", "/homework/{homework_id}/my-submission"],
  ["POST", "/homework-submissions/{submission_id}/grade"],
  ["POST", "/homework-submissions/{submission_id}/return"],
  ["GET", "/assessments"],
  ["POST", "/assessments"],
  ["POST", "/assessments/{assessment_id}/publish"],
  ["POST", "/assessments/{assessment_id}/attempts"],
  ["GET", "/assessment-attempts"],
  ["GET", "/my-assessment-attempts"],
  ["GET", "/attempts/{attempt_id}"],
  ["PATCH", "/attempts/{attempt_id}/draft"],
  ["GET", "/attempts/{attempt_id}/review"],
  ["POST", "/attempts/{attempt_id}/submit"],
  ["POST", "/attempts/{attempt_id}/score"],
  ["GET", "/attempts/{attempt_id}/result"],
  ["GET", "/lesson-plans/{plan_id}/docx"],
  ["GET", "/billing/plans"],
  ["POST", "/billing/plans"],
  ["POST", "/billing/discounts"],
  ["GET", "/billing/invoices"],
  ["POST", "/billing/invoices"],
  ["POST", "/billing/payments"],
  ["GET", "/billing/debts"],
  ["GET", "/teacher-workload"],
  ["POST", "/teacher-worklogs"],
  ["POST", "/teacher-worklogs/{worklog_id}/decision"],
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

export async function centerApi(
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
      "Xavfsizlik sabab bu amal uchun server bergan aniq ruxsat talab qilinadi.",
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
    error.detail = data?.detail;
    error.code = data?.code || data?.detail?.code || null;
    throw error;
  }
  if (idempotencyKey) {
    completeIdempotencyKey(idempotencyKey);
  }
  return data;
}

export async function centerDownload(
  path,
  { apiBase, token, contextId, filename = "fayl" } = {},
) {
  const response = await fetch(
    makeUrl(apiBase, path, undefined, contextId, "GET"),
    {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
      credentials: "omit",
    },
  );
  if (!response.ok) {
    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }
    throw new Error(readError(data, response));
  }
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = String(filename)
    .replace(/[^\p{L}\p{N}._-]+/gu, "_")
    .slice(0, 120);
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
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

export function mergePage(current, incoming, maxItems = Number.POSITIVE_INFINITY) {
  const merged = new Map(current.map((item) => [item.id, item]));
  incoming.forEach((item) => merged.set(item.id, item));
  const values = [...merged.values()];
  return Number.isFinite(maxItems) ? values.slice(0, maxItems) : values;
}

function idempotencyFingerprintHash(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function completeIdempotencyKey(key) {
  const storageKey = idempotencyStorageByKey.get(key);
  for (const [fingerprint, entry] of idempotencyKeyByFingerprint) {
    if (entry.key === key) {
      idempotencyKeyByFingerprint.delete(fingerprint);
      break;
    }
  }
  if (!storageKey) return;
  idempotencyStorageByKey.delete(key);
  try {
    globalThis.sessionStorage?.removeItem(storageKey);
  } catch {
    // Xotira yopiq bo‘lsa modul ichidagi kalitning o‘zi yetarli.
  }
}

export function makeIdempotencyKey(scope, values = []) {
  const fingerprint = JSON.stringify([scope, ...values]);
  const memoryEntry = idempotencyKeyByFingerprint.get(fingerprint);
  if (
    memoryEntry &&
    Date.now() - memoryEntry.createdAt < IDEMPOTENCY_TTL_MS
  ) {
    return memoryEntry.key;
  }
  const storageKey = `samtm-center-idempotency-${idempotencyFingerprintHash(
    fingerprint,
  )}`;
  try {
    const saved = JSON.parse(
      globalThis.sessionStorage?.getItem(storageKey) || "null",
    );
    if (
      saved?.fingerprint === fingerprint &&
      typeof saved.key === "string" &&
      Date.now() - Number(saved.created_at || 0) < IDEMPOTENCY_TTL_MS
    ) {
      idempotencyStorageByKey.set(saved.key, storageKey);
      idempotencyKeyByFingerprint.set(fingerprint, {
        key: saved.key,
        createdAt: Number(saved.created_at),
      });
      return saved.key;
    }
  } catch {
    // Brauzer sessionStorage bermasa quyida yangi modul kaliti yaratiladi.
  }
  const random =
    globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const key = [scope, idempotencyFingerprintHash(fingerprint), random]
    .join(":")
    .slice(0, 180);
  idempotencyStorageByKey.set(key, storageKey);
  idempotencyKeyByFingerprint.set(fingerprint, {
    key,
    createdAt: Date.now(),
  });
  try {
    globalThis.sessionStorage?.setItem(
      storageKey,
      JSON.stringify({
        fingerprint,
        key,
        created_at: Date.now(),
      }),
    );
  } catch {
    // Modul xotirasidagi kalit sahifa ochiq turgancha retryni himoya qiladi.
  }
  return key;
}
