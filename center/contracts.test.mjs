import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  CENTER_API_CONTRACT,
  centerRoutes,
  makeIdempotencyKey,
  mergePage,
  pageQuery,
} from "./api.js";
import {
  CENTER_ENUMS,
  buildAssessmentPayload,
  buildAttemptDraftPayload,
  buildAttendancePayload,
  buildCoursePayload,
  buildEnrollmentDecision,
  buildEnrollmentPayload,
  buildGradePayload,
  buildHomeworkPayload,
  buildLessonPlanPayload,
  buildPaymentPayload,
  buildSchedulePayload,
} from "./contracts.js";

const workspaceSource = readFileSync(
  new URL("./LearningCenterWorkspace.jsx", import.meta.url),
  "utf8",
);

test("cursor helpers preserve later selector pages without a 100-item trap", () => {
  assert.equal(pageQuery({ limit: 500 }).limit, 100);
  const first = Array.from({ length: 100 }, (_, index) => ({
    id: index + 1,
  }));
  const second = Array.from({ length: 100 }, (_, index) => ({
    id: index + 101,
  }));
  assert.equal(mergePage(first, second).length, 200);
});

test("paged resource reload clears stale cursor history", () => {
  assert.match(
    workspaceSource,
    /const reload = \(\) => \{[\s\S]*seenCursorsRef\.current = new Set\(\);/,
  );
  assert.doesNotMatch(workspaceSource, /reload:\s*\(\)\s*=>\s*load\(null\)/);
});

test("avatar permits staff focus but never staff draft mutation", () => {
  assert.match(
    workspaceSource,
    /action\.section === "staff" && action\.type !== "FOCUS_FIELD"/,
  );
  assert.match(workspaceSource, /staff:\s*new Set\(\["branch_id"\]\)/);
});

test("system admin can page through every pending verification", () => {
  assert.match(
    workspaceSource,
    /const loadMoreVerifications = async \(\) => \{[\s\S]*centerRoutes\.adminVerifications[\s\S]*afterId: verificationNextCursor/,
  );
  assert.match(workspaceSource, /onClick=\{loadMoreVerifications\}/);
});

test("worklog selectors can load later course and lesson pages", () => {
  assert.match(
    workspaceSource,
    /value=\{worklogForm\.note\}[\s\S]*\["Kurslar", courses\],[\s\S]*\["Darslar", worklogSchedule\]/,
  );
});

test("attempt draft route and payload use the server autosave contract", () => {
  assert.equal(centerRoutes.attemptDraft(17), "/attempts/17/draft");
  assert.ok(
    CENTER_API_CONTRACT.some(
      ([method, path]) =>
        method === "PATCH" && path === "/attempts/{attempt_id}/draft",
    ),
  );
  assert.deepEqual(
    buildAttemptDraftPayload(
      [
        { id: 1, metadata: { question_type: "multiple_choice" } },
        { id: 2, metadata: { question_type: "short_answer" } },
        { id: 3, metadata: { question_type: "short_answer" } },
      ],
      { 1: "2", 2: "Javob" },
    ),
    {
      answers: [
        { assessment_item_id: 1, response: { selected: "2" } },
        { assessment_item_id: 2, response: { text: "Javob" } },
      ],
    },
  );
});

test("idempotency key is stable for a retry and changes with material input", () => {
  const first = makeIdempotencyKey("payment-test", ["invoice-1", 100]);
  const retry = makeIdempotencyKey("payment-test", ["invoice-1", 100]);
  const changed = makeIdempotencyKey("payment-test", ["invoice-1", 150]);
  assert.equal(retry, first);
  assert.notEqual(changed, first);
});

test("canonical enums match markaz-v2", () => {
  assert.ok(CENTER_ENUMS.roles.includes("receptionist"));
  assert.ok(!CENTER_ENUMS.roles.includes("reception"));
  assert.deepEqual(CENTER_ENUMS.deliveryModes, [
    "offline",
    "online_live",
    "hybrid",
  ]);
  assert.ok(CENTER_ENUMS.targetFrameworks.includes("general"));
  assert.ok(CENTER_ENUMS.assessmentTypes.includes("ielts_mock"));
  assert.ok(CENTER_ENUMS.paymentMethods.includes("bank_transfer"));
  assert.ok(!CENTER_ENUMS.roomTypes.includes("virtual"));
});

test("enrollment and decision use backend field names", () => {
  const payload = buildEnrollmentPayload({
    course_id: "3",
    student_user_id: "9",
    entry_status: "pending",
    notes: "Sinov",
    start_date: "2099-01-01",
  });
  assert.deepEqual(Object.keys(payload).sort(), [
    "confirmation",
    "course_id",
    "note",
    "requested_status",
    "start_date",
    "student_user_id",
  ]);
  assert.equal(payload.start_date, "2099-01-01");
  assert.deepEqual(buildEnrollmentDecision("approve"), {
    status: "active",
    confirmation: true,
  });
  assert.equal(buildEnrollmentDecision("reject").status, "rejected");
  assert.equal(buildEnrollmentDecision("pause").status, "paused");
  assert.equal(buildEnrollmentDecision("withdraw").status, "withdrawn");
});

test("course maps CEFR/IELTS and schedule hints to canonical fields", () => {
  const payload = buildCoursePayload({
    branch_id: "1",
    subject_id: "2",
    teacher_user_id: "3",
    name: "IELTS",
    course_type: "exam_prep",
    delivery_mode: "online_live",
    target_framework: "ielts",
    cefr_level: "B2",
    ielts_overall_target: "6.5",
    ielts_listening_target: "7.0",
    ielts_reading_target: "6.5",
    ielts_writing_target: "6.0",
    ielts_speaking_target: "6.5",
    level_label: "",
    monthly_price: 500000,
    sessions_per_week: 3,
    weekdays: [1, 3, 5],
    starts_at: "18:00",
    start_date: "2099-01-01",
    end_date: "",
    capacity: 12,
    duration_minutes: 90,
  });
  assert.equal(payload.target_score, 6.5);
  assert.equal(payload.target_components.listening, 7);
  assert.equal(payload.ielts_test_type, "academic");
  assert.equal(payload.delivery_mode, "online_live");
  assert.equal(payload.status, "draft");
  assert.ok(!("format_key" in payload));
});

test("individual course is always limited to one student", () => {
  const payload = buildCoursePayload({
    branch_id: "",
    subject_id: "2",
    teacher_user_id: "",
    name: "Yakka matematika",
    course_type: "individual",
    delivery_mode: "offline",
    target_framework: "general",
    level_label: "8-sinf",
    monthly_price: 500000,
    sessions_per_week: 2,
    weekdays: [2, 4],
    starts_at: "16:00",
    start_date: "2099-01-01",
    end_date: "",
    capacity: 12,
    duration_minutes: 90,
  });
  assert.equal(payload.capacity, 1);
});

test("schedule uses dated contract and draft confirmation boundary", () => {
  const payload = buildSchedulePayload({
    course_id: "2",
    teacher_user_id: "7",
    room_id: "4",
    lesson_date: "2099-01-01",
    starts_at: "17:00",
    duration_minutes: 90,
    topic: "Kasrlar",
  });
  assert.equal(payload.schedule_kind, "dated");
  assert.equal(payload.status, "draft");
  assert.equal(payload.confirmation, false);
  assert.equal(payload.lesson_date, "2099-01-01");
  assert.ok("ends_at" in payload);
  const published = buildSchedulePayload({
    course_id: "2",
    teacher_user_id: "7",
    room_id: "4",
    lesson_date: "2099-01-01",
    starts_at: "17:00",
    duration_minutes: 90,
    topic: "Kasrlar",
    status: "published",
  });
  assert.equal(published.status, "published");
  assert.equal(published.confirmation, true);
  const weekly = buildSchedulePayload({
    course_id: "2",
    teacher_user_id: "7",
    room_id: "4",
    schedule_kind: "weekly",
    weekday: 3,
    effective_from: "2099-01-01",
    effective_to: "2099-05-31",
    starts_at: "17:00",
    duration_minutes: 90,
    topic: "Kasrlar",
  });
  assert.equal(weekly.schedule_kind, "weekly");
  assert.equal(weekly.weekday, 3);
  assert.equal(weekly.lesson_date, null);
  assert.equal(weekly.effective_from, "2099-01-01");
});

test("lesson and homework map text and latex to backend keys", () => {
  const form = {
    course_id: "1",
    lesson_date: "2099-01-01",
    title: "Kvadrat tenglama",
    objective: "Yechish",
    activities: "Mashq",
    explanation: "Izoh",
    formula_latex: "x^2=4",
    duration_minutes: 90,
    homework_text: "Misollar",
    due_date: "2099-01-02",
    max_score: 100,
  };
  const plan = buildLessonPlanPayload(form);
  assert.equal(plan.content_latex, "x^2=4");
  assert.ok(Array.isArray(plan.objectives));
  assert.ok(Array.isArray(plan.stages));
  assert.equal(plan.duration_minutes, 90);
  const homework = buildHomeworkPayload(form);
  assert.equal(homework.instructions, "Misollar");
  assert.equal(homework.content_latex, "x^2=4");
  assert.equal(homework.due_date, "2099-01-02");
  assert.equal(homework.due_at, null);
});

test("attendance and grade use lesson_date/grade_type", () => {
  const form = {
    student_user_id: "8",
    attendance_status: "excused",
    assessment_name: "Joriy",
    score: 85,
    note: "",
  };
  const attendance = buildAttendancePayload({
    courseId: 2,
    date: "2099-01-01",
    form,
  });
  assert.equal(attendance.lesson_date, "2099-01-01");
  assert.ok(!("attendance_date" in attendance));
  const grade = buildGradePayload({
    courseId: 2,
    date: "2099-01-01",
    form,
    idempotencyKey: "grade-test-123456",
  });
  assert.equal(grade.grade_type, "daily");
  assert.equal(grade.idempotency_key, "grade-test-123456");
});

test("assessment contains at least one safe referenced item", () => {
  const payload = buildAssessmentPayload(
    {
      course_id: "2",
      title: "Sinov",
      assessment_type: "quiz",
      framework: "custom",
      duration_minutes: 30,
      max_attempts: 1,
      opens_at: "",
      closes_at: "",
      instructions: "",
    },
    [
      {
        prompt: "2+2?",
        question_type: "multiple_choice",
        formula_latex: "2+2",
        options: ["3", "4", "5", "6"],
        correct_answer: "1",
        points: 1,
      },
    ],
  );
  assert.equal(payload.items.length, 1);
  assert.equal(payload.items[0].metadata.correct_answer, "1");
  assert.equal(payload.items[0].metadata.content_latex, "2+2");
  assert.ok(CENTER_ENUMS.assessmentTypes.includes(payload.assessment_type));
});

test("assessment remaps the correct option after blank choices are removed", () => {
  const payload = buildAssessmentPayload(
    {
      course_id: "2",
      title: "Sinov",
      assessment_type: "quiz",
      framework: "custom",
      duration_minutes: 30,
      max_attempts: 1,
      opens_at: "",
      closes_at: "",
      instructions: "",
    },
    [
      {
        prompt: "To‘g‘ri javobni tanlang",
        question_type: "multiple_choice",
        formula_latex: "",
        options: ["A", "", "C", "D"],
        correct_answer: "2",
        points: 1,
      },
    ],
  );
  assert.deepEqual(payload.items[0].metadata.options, ["A", "C", "D"]);
  assert.equal(payload.items[0].metadata.correct_answer, "1");
});

test("payment preserves the human-selected payment date", () => {
  const payload = buildPaymentPayload(
    {
      invoice_id: "4",
      amount: "120000",
      payment_method: "bank_transfer",
      reference: "CHEK-1",
      paid_at: "2099-01-05",
    },
    "payment-test-123456",
  );
  assert.equal(payload.paid_at, "2099-01-05");
  assert.equal(payload.payment_method, "bank_transfer");
  assert.equal(payload.confirmation, true);
});
