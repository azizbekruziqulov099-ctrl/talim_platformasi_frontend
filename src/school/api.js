const API_PREFIX = "/api/maktab-v2";

const RESOURCE_PATHS = Object.freeze({
  buildings: "/buildings",
  classes: "/grades",
  sections: "/grades",
  subjects: "/subjects",
  workloads: "/workloads",
  staff: "/staff",
  calendar: "/calendar",
  timetable: "/timetable",
  attendance: "/attendance",
  grades: "/grade-entries",
  students: "/students",
});

export const schoolRoutes = Object.freeze({
  meta: "/meta",
  workspaces: "/workspaces",
  joinSearch: "/join/search",
  joinRequest: "/join/requests",
  joinRequests: "/join/requests",
  joinRequestDecision: (assignmentId) =>
    `/join/requests/${assignmentId}/decision`,
  userSearch: "/users/search",
  verifyContext: (contextId) => `/admin/contexts/${contextId}/verification`,
  onboardingDrafts: "/onboarding/drafts",
  onboardingDraft: (draftId) => `/onboarding/drafts/${draftId}`,
  onboardingPreview: (draftId) => `/onboarding/drafts/${draftId}/preview`,
  onboardingCommit: (draftId) => `/onboarding/drafts/${draftId}/commit`,
  assistantSessions: "/assistant/sessions",
  assistantActions: (sessionId) => `/assistant/sessions/${sessionId}/actions`,
  dashboard: "/dashboard",
  resource: (_contextId, resource) => {
    const path = RESOURCE_PATHS[resource];
    if (!path) throw new Error(`Noma'lum maktab resursi: ${resource}`);
    return path;
  },
  staffAvailability: (teacherUserId) =>
    `/staff/${teacherUserId}/availability`,
  staffAssign: "/staff",
  staffInvites: "/staff/invites",
  studentParentLinks: "/students/parent-links",
  calendarMakeupPreview: "/calendar/makeup/preview",
  calendarMakeupConfirm: "/calendar/makeup/confirm",
  timetableGenerate: "/timetable/generate",
  timetableGenerations: "/timetable/generations",
  timetablePublish: (_contextId, generationId) =>
    `/timetable/generations/${generationId}/confirm`,
  timetableSubstitutions: "/timetable/substitutions",
  timetableEffective: "/timetable/effective",
  timetableExceptions: "/timetable/exceptions",
  timetableExceptionRevoke: (exceptionId) =>
    `/timetable/exceptions/${exceptionId}/revoke`,
  attendance: "/attendance",
  gradeEntries: "/grade-entries",
  billingPlans: "/billing/plans",
  billingInvoices: "/billing/invoices",
  billingPayments: "/billing/payments",
});

// Frontend ishlatadigan canonical backend dekoratorlari. Statik contract testi
// ushbu ro'yxatni backend/modules/school.py bilan solishtiradi.
export const SCHOOL_API_CONTRACT = Object.freeze([
  ["GET", "/workspaces"],
  ["GET", "/join/search"],
  ["POST", "/join/requests"],
  ["GET", "/join/requests"],
  ["POST", "/join/requests/{assignment_id}/decision"],
  ["GET", "/users/search"],
  ["POST", "/onboarding/drafts"],
  ["PATCH", "/onboarding/drafts/{draft_id}"],
  ["POST", "/onboarding/drafts/{draft_id}/commit"],
  ["POST", "/assistant/sessions"],
  ["POST", "/assistant/sessions/{session_id}/actions"],
  ["POST", "/admin/contexts/{context_id}/verification"],
  ["GET", "/dashboard"],
  ["GET", "/buildings"],
  ["POST", "/buildings"],
  ["GET", "/grades"],
  ["POST", "/grades"],
  ["GET", "/subjects"],
  ["POST", "/subjects"],
  ["GET", "/workloads"],
  ["POST", "/workloads"],
  ["GET", "/staff"],
  ["POST", "/staff"],
  ["POST", "/staff/invites"],
  ["GET", "/staff/{teacher_user_id}/availability"],
  ["PUT", "/staff/{teacher_user_id}/availability"],
  ["GET", "/calendar"],
  ["POST", "/calendar"],
  ["POST", "/calendar/makeup/preview"],
  ["POST", "/calendar/makeup/confirm"],
  ["GET", "/timetable"],
  ["POST", "/timetable/generate"],
  ["GET", "/timetable/generations"],
  ["POST", "/timetable/generations/{generation_id}/confirm"],
  ["POST", "/timetable/substitutions"],
  ["GET", "/timetable/effective"],
  ["GET", "/timetable/exceptions"],
  ["POST", "/timetable/exceptions/{exception_id}/revoke"],
  ["GET", "/students"],
  ["POST", "/students"],
  ["POST", "/students/parent-links"],
  ["POST", "/attendance"],
  ["POST", "/grade-entries"],
  ["GET", "/billing/plans"],
  ["GET", "/billing/invoices"],
]);

function apiUrl(apiBase, path, query, contextId, method) {
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
  // JWT URL, tarix va server loglariga tushmasligi kerak.
  url.searchParams.delete("token");
  return url;
}

function errorMessage(data, response) {
  const detail = data?.detail;
  if (typeof detail === "string") return detail;
  if (detail?.message) return detail.message;
  if (Array.isArray(detail?.errors)) return detail.errors.join("\n");
  if (data?.message) return data.message;
  return `So'rovni bajarib bo'lmadi (${response.status})`;
}

export async function schoolApi(
  path,
  {
    apiBase,
    token,
    contextId,
    method = "GET",
    query,
    body,
    headers,
    signal,
    idempotencyKey,
  } = {},
) {
  const normalizedMethod = method.toUpperCase();
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;
  const requestBody =
    contextId &&
    body !== undefined &&
    !isFormData &&
    !["GET", "HEAD", "DELETE"].includes(normalizedMethod)
      ? { ...body, context_id: Number(contextId) }
      : body;
  const response = await fetch(
    apiUrl(apiBase, path, query, contextId, normalizedMethod),
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
    const error = new Error(errorMessage(data, response));
    error.status = response.status;
    error.detail = data?.detail;
    throw error;
  }
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
    nextCursor: data?.next_cursor || null,
    hasMore: Boolean(data?.next_cursor),
  };
}
