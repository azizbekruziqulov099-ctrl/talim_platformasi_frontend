import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  INSTITUTE_API_CONTRACT,
  instituteApi,
  instituteRoutes,
  makeIdempotencyKey,
  mergePage,
  pageQuery,
  unwrapItems,
} from "./api.js";
import {
  INSTITUTE_ENUMS,
  assertKnownEnum,
  attendanceWarnings,
  buildAcademicYearPayload,
  buildAssessmentPayload,
  buildAttendancePayload,
  buildCohortPayload,
  buildContractPayload,
  buildCoursePayload,
  buildCurriculumCoursePayload,
  buildCurriculumPayload,
  buildDepartmentPayload,
  buildDraftPatchPayload,
  buildDraftStartPayload,
  buildEnrollmentPayload,
  buildFacultyPayload,
  buildGradePayload,
  buildInstallmentsPayload,
  buildPaymentPayload,
  buildProgramPayload,
  buildSchedulePayload,
  buildSectionPayload,
  buildTermPayload,
} from "./contracts.js";
import {
  ASSISTANT_DRAFT_FIELDS,
  ASSISTANT_SAFE_ACTIONS,
  DEGREE_LEVELS,
  INSTITUTE_ROLES,
  STUDY_FORMS,
  hasPermission,
  menuForRoles,
  normalizeMenu,
  tourForRoles,
} from "./workflow.js";

const apiSource = readFileSync(new URL("./api.js", import.meta.url), "utf8");
const contractsSource = readFileSync(
  new URL("./contracts.js", import.meta.url),
  "utf8",
);
const workflowSource = readFileSync(
  new URL("./workflow.js", import.meta.url),
  "utf8",
);
const workspaceSource = readFileSync(
  new URL("./InstituteWorkspace.jsx", import.meta.url),
  "utf8",
);
const appSource = readFileSync(new URL("../App.jsx", import.meta.url), "utf8");
const backendSource = readFileSync(
  new URL("../../../backend/modules/institute.py", import.meta.url),
  "utf8",
);

function sortedPairs(pairs) {
  return pairs.map(([method, path]) => `${method} ${path}`).sort();
}

function backendRoutePairs() {
  return [...backendSource.matchAll(
    /@router\.(get|post|patch|put|delete)\("([^"]+)"/g,
  )].map((match) => [match[1].toUpperCase(), match[2]]);
}

test("frontend contract exactly matches all 67 backend institute routes", () => {
  const backend = backendRoutePairs();
  assert.equal(backend.length, 67);
  assert.equal(INSTITUTE_API_CONTRACT.length, 67);
  assert.equal(new Set(sortedPairs(backend)).size, 67);
  assert.equal(new Set(sortedPairs(INSTITUTE_API_CONTRACT)).size, 67);
  assert.deepEqual(
    sortedPairs(INSTITUTE_API_CONTRACT),
    sortedPairs(backend),
  );
});

test("dynamic route helpers use the backend path contract", () => {
  assert.equal(instituteRoutes.onboardingDraft(7), "/onboarding/drafts/7");
  assert.equal(
    instituteRoutes.onboardingPreview(7),
    "/onboarding/drafts/7/preview",
  );
  assert.equal(
    instituteRoutes.adminVerificationDecision(14),
    "/admin/verifications/14/decision",
  );
  assert.equal(instituteRoutes.termStatus(3), "/terms/3/status");
  assert.equal(instituteRoutes.staffEnd(4), "/staff/4/end");
  assert.equal(instituteRoutes.curriculumCourses(8), "/curricula/8/courses");
  assert.equal(instituteRoutes.sectionActivate(9), "/sections/9/activate");
  assert.equal(
    instituteRoutes.enrollmentDecision(10),
    "/enrollments/10/decision",
  );
  assert.equal(instituteRoutes.schedulePublish(11), "/schedule/11/publish");
  assert.equal(
    instituteRoutes.assessmentPublish(12),
    "/assessments/12/publish",
  );
  assert.equal(
    instituteRoutes.courseResultFinalize(13),
    "/course-results/13/finalize",
  );
  assert.equal(instituteRoutes.transcriptIssue(15), "/transcripts/15/issue");
  assert.equal(
    instituteRoutes.contractInstallments(16),
    "/contracts/16/installments",
  );
  assert.equal(
    instituteRoutes.assistantActions(17),
    "/assistant/sessions/17/actions",
  );
});

test("cursor helpers cap every page at 100 and merge later pages", () => {
  assert.equal(pageQuery({ limit: 500 }).limit, 100);
  assert.equal(pageQuery({ limit: -4 }).limit, 1);
  assert.equal(pageQuery({ limit: 20, search: "  Ali  " }).search, "Ali");
  assert.equal(pageQuery({ afterId: 91 }).after_id, 91);

  const first = Array.from({ length: 100 }, (_, index) => ({
    id: index + 1,
    version: 1,
  }));
  const second = [
    { id: 100, version: 2 },
    ...Array.from({ length: 100 }, (_, index) => ({
      id: index + 101,
      version: 1,
    })),
  ];
  const merged = mergePage(first, second);
  assert.equal(merged.length, 200);
  assert.equal(merged.find((item) => item.id === 100).version, 2);

  assert.deepEqual(unwrapItems({ items: [{ id: 1 }], next_cursor: 1 }), {
    items: [{ id: 1 }],
    nextCursor: 1,
    hasMore: true,
  });
  assert.deepEqual(unwrapItems([{ id: 2 }]), {
    items: [{ id: 2 }],
    nextCursor: null,
    hasMore: false,
  });
});

test("API uses Bearer auth and removes token from the query string", async () => {
  assert.match(apiSource, /Authorization:\s*`Bearer \$\{token\}`/);
  assert.match(apiSource, /url\.searchParams\.delete\("token"\)/);
  assert.doesNotMatch(apiSource, /url\.searchParams\.set\("token"/);

  const oldWindow = globalThis.window;
  const oldFetch = globalThis.fetch;
  let request = null;
  try {
    globalThis.window = { location: { origin: "https://front.example" } };
    globalThis.fetch = async (url, options) => {
      request = { url: String(url), options };
      return {
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        json: async () => ({ ok: true }),
      };
    };
    await instituteApi(instituteRoutes.dashboard, {
      apiBase: "https://api.example",
      token: "jwt-secret",
      contextId: 22,
      query: { token: "must-not-leak", search: "Ali" },
    });
    const url = new URL(request.url);
    assert.equal(url.pathname, "/api/institut-v1/dashboard");
    assert.equal(url.searchParams.get("context_id"), "22");
    assert.equal(url.searchParams.get("search"), "Ali");
    assert.equal(url.searchParams.has("token"), false);
    assert.equal(request.options.headers.Authorization, "Bearer jwt-secret");
    assert.equal(request.options.credentials, "omit");
  } finally {
    if (oldWindow === undefined) delete globalThis.window;
    else globalThis.window = oldWindow;
    globalThis.fetch = oldFetch;
  }
});

test("every write requires an explicit allowed gate before fetch", async () => {
  let fetchCalled = false;
  const oldFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    fetchCalled = true;
    throw new Error("fetch must not run");
  };
  try {
    await assert.rejects(
      instituteApi(instituteRoutes.campuses, {
        method: "POST",
        body: { name: "Test" },
      }),
      (error) => error.status === 403 && /inson tasdig/i.test(error.message),
    );
    assert.equal(fetchCalled, false);
  } finally {
    globalThis.fetch = oldFetch;
  }
  assert.match(apiSource, /isWrite && allowed !== true/);
});

test("idempotency key is stable for a retry and material changes split it", () => {
  const first = makeIdempotencyKey("institute-test", [3, 100]);
  const retry = makeIdempotencyKey("institute-test", [3, 100]);
  const changed = makeIdempotencyKey("institute-test", [3, 150]);
  assert.equal(retry, first);
  assert.notEqual(changed, first);
});

test("canonical enums contain every supported degree and study form", () => {
  assert.deepEqual(INSTITUTE_ENUMS.degreeLevels, [
    "foundation",
    "bachelor",
    "master",
    "doctoral",
    "professional",
    "custom",
  ]);
  assert.deepEqual(INSTITUTE_ENUMS.studyForms, [
    "full_time",
    "part_time",
    "evening",
    "distance",
    "dual",
    "custom",
  ]);
  assert.deepEqual(
    DEGREE_LEVELS.map((item) => item.value).sort(),
    [...INSTITUTE_ENUMS.degreeLevels].sort(),
  );
  assert.deepEqual(
    STUDY_FORMS.map((item) => item.value).sort(),
    [...INSTITUTE_ENUMS.studyForms].sort(),
  );
  assert.equal(assertKnownEnum("degreeLevels", "doctoral"), "doctoral");
  assert.throws(
    () => assertKnownEnum("studyForms", "weekend_only"),
    /noma’lum qiymat/,
  );
});

test("draft start and patch use exact defaults and version field", () => {
  assert.deepEqual(buildDraftStartPayload({}), {
    relationship: "rector",
    ownership_type: "public",
    institution_type: "institute",
    setup_mode: "guided",
    grading_system: "credit_modular",
  });
  assert.deepEqual(
    buildDraftPatchPayload("identity", { name: "TATU" }, "4"),
    {
      step: "identity",
      payload: { name: "TATU" },
      expected_version: 4,
    },
  );
  assert.deepEqual(buildDraftPatchPayload("identity", {}, undefined), {
    step: "identity",
    payload: {},
  });
});

test("structure payloads trim text, coerce ids and omit empty leaders", () => {
  assert.deepEqual(
    buildFacultyPayload({
      campus_id: "2",
      code: "  FIZ  ",
      name: "  Fizika fakulteti ",
      dean_user_id: "",
    }),
    { campus_id: 2, code: "FIZ", name: "Fizika fakulteti" },
  );
  assert.deepEqual(
    buildDepartmentPayload({
      faculty_id: "3",
      code: " MAT ",
      name: " Matematika ",
      head_user_id: "19",
    }),
    {
      faculty_id: 3,
      code: "MAT",
      name: "Matematika",
      head_user_id: 19,
    },
  );
  assert.deepEqual(
    buildProgramPayload({
      department_id: "4",
      code: " AM ",
      name: " Amaliy matematika ",
      duration_terms: "8",
      target_credits: "240",
    }),
    {
      department_id: 4,
      code: "AM",
      name: "Amaliy matematika",
      degree_level: "bachelor",
      study_form: "full_time",
      language: "uz",
      duration_terms: 8,
      target_credits: 240,
      policy_overrides: {},
    },
  );
});

test("academic calendar payloads keep exact server field names", () => {
  assert.deepEqual(
    buildAcademicYearPayload({
      code: " 2026-2027 ",
      starts_on: "2026-09-01",
      ends_on: "2027-06-30",
    }),
    {
      code: "2026-2027",
      starts_on: "2026-09-01",
      ends_on: "2027-06-30",
    },
  );
  assert.deepEqual(
    buildTermPayload({
      academic_year_id: "8",
      term_no: "1",
      term_type: "",
      name: " 1-semestr ",
      starts_on: "2026-09-01",
      ends_on: "2026-12-31",
      registration_opens_at: "",
      registration_closes_at: "2026-08-25T09:00",
      change_deadline: "",
    }),
    {
      academic_year_id: 8,
      term_no: 1,
      term_type: "semester",
      name: "1-semestr",
      starts_on: "2026-09-01",
      ends_on: "2026-12-31",
      registration_closes_at: "2026-08-25T09:00",
    },
  );
});

test("course and curriculum payload defaults are deterministic", () => {
  assert.deepEqual(
    buildCoursePayload({
      department_id: "5",
      code: " ALG ",
      title: " Algebra ",
      credit_value: "6",
      lecture_hours: "",
      practice_hours: "30",
      laboratory_hours: "",
      independent_hours: "60",
      supports_latex: 1,
      description: "",
    }),
    {
      department_id: 5,
      code: "ALG",
      title: "Algebra",
      credit_value: 6,
      lecture_hours: 0,
      practice_hours: 30,
      laboratory_hours: 0,
      independent_hours: 60,
      supports_latex: true,
      metadata: {},
    },
  );
  assert.deepEqual(
    buildCurriculumPayload({
      program_id: "6",
      admission_year: "2026",
      version: "",
      name: " 2026 o‘quv reja ",
    }),
    {
      program_id: 6,
      admission_year: 2026,
      version: 1,
      name: "2026 o‘quv reja",
    },
  );
  assert.deepEqual(
    buildCurriculumCoursePayload({
      course_id: "7",
      recommended_term: "2",
      requirement_type: "",
      elective_block: "",
      credits_override: "",
      prerequisite_course_ids: ["1", "x", 4],
    }),
    {
      course_id: 7,
      recommended_term: 2,
      requirement_type: "required",
      hours_override: {},
      prerequisite_course_ids: [1, 4],
    },
  );
});

test("cohort, section and enrollment payloads preserve draft boundaries", () => {
  assert.deepEqual(
    buildCohortPayload({
      program_id: "4",
      curriculum_id: "5",
      code: " 26-01 ",
      admission_year: "2026",
      current_level: "",
      study_language: "",
      advisor_user_id: "",
    }),
    {
      program_id: 4,
      curriculum_id: 5,
      code: "26-01",
      admission_year: 2026,
      current_level: 1,
      study_language: "uz",
    },
  );
  assert.deepEqual(
    buildSectionPayload({
      term_id: "1",
      course_id: "2",
      curriculum_course_id: "",
      code: " ALG-1 ",
      name: " Algebra 1 ",
      primary_lecturer_user_id: "9",
      delivery_mode: "",
      section_type: "",
      capacity: "",
      cohort_ids: ["3", "bad", 4],
    }),
    {
      term_id: 1,
      course_id: 2,
      code: "ALG-1",
      name: "Algebra 1",
      primary_lecturer_user_id: 9,
      delivery_mode: "offline",
      section_type: "regular",
      capacity: 30,
      cohort_ids: [3, 4],
      metadata: {},
    },
  );
  assert.deepEqual(
    buildEnrollmentPayload({
      section_id: "6",
      cohort_id: "3",
      student_user_id: "17",
      student_number: "  S-17 ",
      enrollment_type: "",
      status: "",
      note: "",
    }),
    {
      section_id: 6,
      cohort_id: 3,
      student_user_id: 17,
      student_number: "S-17",
      enrollment_type: "regular",
      status: "pending",
      confirmation: false,
    },
  );
});

test("dated and weekly schedules remain unpublished drafts", () => {
  assert.deepEqual(
    buildSchedulePayload({
      section_id: "2",
      teacher_user_id: "8",
      room_id: "",
      schedule_kind: "dated",
      lesson_date: "2026-09-02",
      starts_at: "09:00",
      ends_at: "10:20",
      lesson_kind: "",
      topic: "",
    }),
    {
      section_id: 2,
      teacher_user_id: 8,
      schedule_kind: "dated",
      lesson_date: "2026-09-02",
      starts_at: "09:00",
      ends_at: "10:20",
      lesson_kind: "lecture",
      status: "draft",
      confirmation: false,
    },
  );
  assert.deepEqual(
    buildSchedulePayload({
      section_id: "2",
      teacher_user_id: "8",
      room_id: "4",
      schedule_kind: "weekly",
      weekday: "3",
      effective_from: "2026-09-01",
      effective_to: "2026-12-31",
      starts_at: "09:00",
      ends_at: "10:20",
      lesson_kind: "practice",
      topic: " Masala yechish ",
    }),
    {
      section_id: 2,
      teacher_user_id: 8,
      room_id: 4,
      schedule_kind: "weekly",
      weekday: 3,
      effective_from: "2026-09-01",
      effective_to: "2026-12-31",
      starts_at: "09:00",
      ends_at: "10:20",
      lesson_kind: "practice",
      topic: "Masala yechish",
      status: "draft",
      confirmation: false,
    },
  );
});

test("attendance, assessment and grade payloads use canonical defaults", () => {
  assert.deepEqual(
    buildAttendancePayload({
      section_id: "3",
      student_user_id: "18",
      schedule_slot_id: "",
      lesson_date: "2026-09-03",
      scheduled_minutes: "",
      absent_minutes: "20",
      status: "",
      note: "",
    }),
    {
      section_id: 3,
      student_user_id: 18,
      lesson_date: "2026-09-03",
      scheduled_minutes: 80,
      absent_minutes: 20,
      status: "present",
    },
  );
  assert.deepEqual(
    buildAssessmentPayload({
      section_id: "3",
      assessment_type: "",
      title: " 1-quiz ",
      max_score: "20",
      weight_percent: "10",
      due_at: "",
    }),
    {
      section_id: 3,
      assessment_type: "quiz",
      title: "1-quiz",
      max_score: 20,
      weight_percent: 10,
      settings: {},
    },
  );
  assert.deepEqual(
    buildGradePayload(
      {
        assessment_id: "9",
        enrollment_id: "12",
        score: "18.5",
        feedback: " Yaxshi ",
      },
      "grade-key",
    ),
    {
      assessment_id: 9,
      enrollment_id: 12,
      score: 18.5,
      feedback: "Yaxshi",
      idempotency_key: "grade-key",
    },
  );
  assert.match(contractsSource, /assessment_type:\s*form\.assessment_type \|\| "quiz"/);
});

test("contract, installment and payment payloads require confirmation", () => {
  assert.deepEqual(
    buildContractPayload({
      student_user_id: "10",
      program_id: "3",
      academic_year_id: "2",
      contract_no: " C-10 ",
      contract_type: "",
      total_amount: "12000000",
      scholarship_amount: "",
      currency: "",
      payer_user_id: "",
      starts_on: "2026-09-01",
      ends_on: "2027-06-30",
    }),
    {
      student_user_id: 10,
      program_id: 3,
      academic_year_id: 2,
      contract_no: "C-10",
      contract_type: "paid",
      total_amount: 12000000,
      scholarship_amount: 0,
      currency: "UZS",
      starts_on: "2026-09-01",
      ends_on: "2027-06-30",
      confirmation: true,
    },
  );
  assert.deepEqual(
    buildInstallmentsPayload([
      { installment_no: "", due_date: "2026-10-01", amount: "6000000" },
      { installment_no: "2", due_date: "2027-02-01", amount: "6000000" },
    ]),
    {
      items: [
        { installment_no: 1, due_date: "2026-10-01", amount: 6000000 },
        { installment_no: 2, due_date: "2027-02-01", amount: 6000000 },
      ],
      confirmation: true,
    },
  );
  assert.deepEqual(
    buildPaymentPayload(
      {
        contract_id: "11",
        installment_id: "7",
        amount: "6000000",
        currency: "",
        payment_method: "bank_transfer",
        reference: " CHEK-1 ",
        paid_at: "2026-10-01T10:30",
      },
      "payment-key",
    ),
    {
      contract_id: 11,
      installment_id: 7,
      amount: 6000000,
      currency: "UZS",
      payment_method: "bank_transfer",
      reference: "CHEK-1",
      idempotency_key: "payment-key",
      paid_at: "2026-10-01T10:30",
      confirmation: true,
    },
  );
});

test("attendance thresholds only produce warnings, never an automatic action", () => {
  assert.deepEqual(
    attendanceWarnings({
      scheduledMinutes: 400,
      absentMinutes: 100,
      semesterUnexcusedMinutes: 74 * 60,
    }),
    {
      absence_percent: 25,
      course_warning: true,
      semester_hours: 74,
      semester_warning: true,
      automatic_action: false,
    },
  );
  const below = attendanceWarnings({
    scheduledMinutes: 400,
    absentMinutes: 99,
    semesterUnexcusedMinutes: 74 * 60 - 1,
  });
  assert.equal(below.course_warning, false);
  assert.equal(below.semester_warning, false);
  assert.equal(below.automatic_action, false);
});

test("role menu fallback is conservative and student view is self-scoped", () => {
  assert.deepEqual(Object.keys(INSTITUTE_ROLES), [
    "owner",
    "founder",
    "rector",
    "vice_rector_academic",
    "administrator",
    "registrar",
    "dean",
    "deputy_dean",
    "department_head",
    "finance_manager",
    "accountant",
    "hr_manager",
    "methodist",
    "lecturer",
    "advisor",
    "student",
  ]);
  assert.deepEqual(menuForRoles([]), ["overview"]);
  assert.deepEqual(menuForRoles(["unknown_role"]), ["overview"]);
  assert.deepEqual(menuForRoles(["student"]), [
    "overview",
    "curriculum",
    "schedule",
    "attendance",
    "gradebook",
    "exams",
    "transcripts",
    "finance",
  ]);
  for (const forbidden of ["structure", "students", "analytics", "staff", "settings"]) {
    assert.equal(menuForRoles(["student"]).includes(forbidden), false);
  }
  assert.equal(hasPermission(["attendance.write"], "attendance.write"), true);
  assert.equal(hasPermission([], "attendance.write"), false);
});

test("server menu stays authoritative and aliases normalize without expansion", () => {
  assert.deepEqual(
    normalizeMenu(["academics", "grades", "payments", "not_allowed"], [
      "rector",
    ]).map((item) => item.key),
    ["curriculum", "gradebook", "finance"],
  );
  assert.deepEqual(
    normalizeMenu([{ key: "transcript", label: "Natijam" }], ["rector"]),
    [{ key: "transcripts", label: "Natijam" }],
  );
  assert.deepEqual(
    tourForRoles(["student"], ["overview", "schedule"]).map(
      (item) => item.key,
    ),
    ["overview", "schedule"],
  );
});

test("assistant allowlist contains navigation only and no privileged action", () => {
  for (const allowed of [
    "NEXT_STEP",
    "PREVIOUS_STEP",
    "SHOW_MENU",
    "FOCUS_FIELD",
    "SET_DRAFT_VALUE",
  ]) {
    assert.equal(ASSISTANT_SAFE_ACTIONS.has(allowed), true);
  }
  for (const forbidden of [
    "PUBLISH",
    "APPROVE_GRADE",
    "PAY",
    "ASSIGN_ROLE",
    "ISSUE_TRANSCRIPT",
    "EXPEL_STUDENT",
  ]) {
    assert.equal(ASSISTANT_SAFE_ACTIONS.has(forbidden), false);
  }
  assert.deepEqual([...ASSISTANT_DRAFT_FIELDS.schedule].sort(), [
    "course_offering_id",
    "duration_minutes",
    "lesson_date",
    "starts_at",
  ]);
  assert.doesNotMatch(workflowSource, /ASSISTANT_SAFE_ACTIONS[\s\S]*"PAY"/);
});

test("App keeps the new institute workspace and the legacy university escape", () => {
  assert.match(
    appSource,
    /const InstituteWorkspace = React\.lazy\([\s\S]*\.\/institute\/InstituteWorkspace\.jsx/,
  );
  assert.match(
    appSource,
    /korinish === "institut_workspace" \|\| korinish === "universitet"/,
  );
  assert.match(
    appSource,
    /onLegacy=\{\(\) => setKorinish\("universitet_legacy"\)\}/,
  );
  assert.match(
    appSource,
    /korinish === "universitet_legacy"[\s\S]*<UniversitetGuruhimBilimi[\s\S]*setKorinish\("institut_workspace"\)/,
  );
  assert.match(appSource, /kalit:\s*"institut_workspace"/);
  assert.match(
    appSource,
    /window\.history\.replaceState\(\{\}, document\.title, p\)/,
    "OAuth query qiymatlari brauzer tarixidan darhol tozalanishi kerak",
  );
});

test("onboarding reads the server item envelope and stores named step payloads", () => {
  assert.match(
    workspaceSource,
    /workingDraft = started\.item \|\| started\.draft \|\| started/,
  );
  assert.match(
    workspaceSource,
    /const nextDraft = data\.item \|\| data\.draft \|\| data/,
  );
  for (const key of [
    "identity",
    "academic_policy",
    "structure",
    "campus",
    "program",
    "calendar",
    "team",
    "finance",
  ]) {
    assert.match(workspaceSource, new RegExp(`\\b${key}\\b`));
  }
  assert.match(workspaceSource, /hours_per_credit:\s*Number\(academicPolicy\.credit_hours\)/);
  assert.match(workspaceSource, /promotion_gpa:\s*Number\(academicPolicy\.gpa_threshold\)/);
  assert.match(workspaceSource, /disabled=\{item\.value === "custom"\}/);
});

test("AI assistant reads the server item envelope before sending safe actions", () => {
  assert.match(
    workspaceSource,
    /setAssistantSession\(data\.item \|\| data\.session \|\| data\)/,
  );
  assert.match(
    workspaceSource,
    /assistantActions\(assistantSession\.id\)/,
  );
});

test("section-scoped screens never call required list APIs without section_id", () => {
  assert.match(
    workspaceSource,
    /path:\s*instituteRoutes\.attendance,[\s\S]*query:\s*form\.section_id \? \{ section_id:/,
  );
  assert.match(
    workspaceSource,
    /path:\s*instituteRoutes\.grades,[\s\S]*query:\s*sectionId \? \{ section_id:/,
  );
  const assessmentQueries = workspaceSource.match(
    /path:\s*instituteRoutes\.assessments,[\s\S]{0,180}?query:\s*[^\n]+section_id:/g,
  ) || [];
  assert.ok(assessmentQueries.length >= 2);
});

test("transcript issuing uses institute student record ids, not free-form user ids", () => {
  assert.match(workspaceSource, /item\.student_record_id/);
  assert.match(workspaceSource, /value=\{item\.student_record_id\}/);
  assert.doesNotMatch(workspaceSource, /label="Talaba user ID"[\s\S]{0,180}?transcript/i);
  assert.match(workspaceSource, /item\.gpa \?\? item\.cumulative_gpa/);
  assert.match(
    workspaceSource,
    /item\.total_credits \?\? item\.earned_credits \?\? item\.attempted_credits/,
  );
});

test("analytics renders only semantically compatible server DTO fallbacks", () => {
  assert.match(workspaceSource, /summary\.sections \?\? summary\.active_sections/);
  assert.match(workspaceSource, /summary\.average_percent/);
  assert.match(workspaceSource, /summary\.debt_amount \?\? summary\.debt/);
  assert.match(workspaceSource, /summary\.unexcused_minutes/);
  assert.doesNotMatch(
    workspaceSource,
    /attendance_percent[^\n]+unexcused_minutes/,
  );
});

test("overview labels dashboard counters with their real units", () => {
  assert.match(workspaceSource, /counts\.active_sections/);
  assert.match(workspaceSource, /"Qarzdorlik summasi"/);
  assert.match(workspaceSource, /formatMoney\(counts\.debt/);
  assert.doesNotMatch(workspaceSource, /"Qarzdor kontraktlar"/);
});

test("workspace stops repeated cursors and supports explicit later pages", () => {
  assert.match(workspaceSource, /limit:\s*100/);
  assert.match(workspaceSource, /const seenCursorsRef = useRef\(new Set\(\)\)/);
  assert.match(
    workspaceSource,
    /cursorKey !== String\(afterId \?\? ""\)[\s\S]*!seenCursorsRef\.current\.has\(cursorKey\)/,
  );
  assert.match(
    workspaceSource,
    /const reload = \(\) => \{[\s\S]*seenCursorsRef\.current = new Set\(\)/,
  );
  assert.match(workspaceSource, /function SelectorPagination/);
  assert.match(workspaceSource, /onClick=\{resource\.loadMore\}/);
  assert.doesNotMatch(workspaceSource, /while\s*\([^)]*hasMore/);
});

test("workspace uses human confirmation for sensitive actions", () => {
  assert.match(
    workspaceSource,
    /function askHuman\(message\) \{[\s\S]*globalThis\.confirm/,
  );
  assert.ok((workspaceSource.match(/askHuman\(/g) || []).length >= 12);
  assert.ok((workspaceSource.match(/confirmation:\s*true/g) || []).length >= 12);
  for (const phrase of [
    "O‘quv reja tarkibini tekshirdingizmi",
    "Barcha e’lon qilingan baholashlar",
    "Bank/kassa hujjatini ko‘rdingizmi",
    "Transkript faqat yopilgan natijalardan tuziladi",
    "rolini va uning kampus/fakultet/kafedra doirasini tekshirdingizmi",
  ]) {
    assert.ok(workspaceSource.includes(phrase), phrase);
  }
  assert.match(workspaceSource, /ASSISTANT_SAFE_ACTIONS\.has\(effectiveAction\)/);
  const start = workspaceSource.indexOf("const applyAssistantSuggestion");
  const end = workspaceSource.indexOf("\n  return (", start);
  assert.ok(start > 0 && end > start);
  assert.doesNotMatch(workspaceSource.slice(start, end), /instituteApi\(/);
});

test("student reads are server-scoped and future integrations are honest", () => {
  assert.match(
    workspaceSource,
    /Talaba ko‘rinishida server faqat o‘z transkriptini qaytaradi; URL orqali boshqa student_id yuborilmaydi/,
  );
  assert.doesNotMatch(
    workspaceSource,
    /path:\s*instituteRoutes\.transcripts[\s\S]{0,160}query:\s*\{[^}]*student_id/,
  );
  assert.ok(
    workspaceSource.includes(
      "HEMIS, kontrakt.edu.uz va Billing bilan integratsiya hozir ulanmagan",
    ),
  );
  assert.ok(
    workspaceSource.includes(
      "faqat haqiqiy texnik integratsiya o‘rnatilgach ‘ulangan’ deb ko‘rsatish mumkin",
    ),
  );
  assert.doesNotMatch(apiSource, /hemis|billing|kontrakt\.edu/i);
});
