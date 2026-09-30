export const CENTER_ENUMS = Object.freeze({
  roles: [
    "owner",
    "founder",
    "director",
    "administrator",
    "academic_manager",
    "receptionist",
    "accountant",
    "methodist",
    "teacher",
    "student",
    "parent",
  ],
  courseTypes: ["group", "individual", "intensive", "club", "exam_prep"],
  deliveryModes: ["offline", "online_live", "hybrid"],
  targetFrameworks: [
    "general",
    "custom",
    "cefr",
    "ielts",
    "national_exam",
    "school",
    "other",
  ],
  assessmentTypes: [
    "diagnostic",
    "placement",
    "quiz",
    "midterm",
    "mock_exam",
    "exam",
    "final",
    "cefr_mock",
    "ielts_mock",
    "other",
  ],
  assessmentFrameworks: [
    "custom",
    "cefr",
    "ielts",
    "national_exam",
    "school",
    "other",
  ],
  attendanceStatuses: [
    "present",
    "absent",
    "late",
    "excused",
    "absent_excused",
    "sick",
  ],
  roomTypes: [
    "classroom",
    "laboratory",
    "computer",
    "language",
    "meeting",
    "online",
    "other",
  ],
  paymentMethods: ["cash", "card", "bank_transfer", "online", "other"],
});

export function buildEnrollmentPayload(form) {
  return {
    course_id: Number(form.course_id),
    student_user_id: Number(form.student_user_id),
    requested_status: form.entry_status,
    note: form.notes || null,
    start_date: form.start_date || null,
    confirmation: false,
  };
}

export function buildCoursePayload(form) {
  const ieltsTargets =
    form.target_framework === "ielts"
      ? {
          overall: Number(form.ielts_overall_target),
          listening: Number(form.ielts_listening_target),
          reading: Number(form.ielts_reading_target),
          writing: Number(form.ielts_writing_target),
          speaking: Number(form.ielts_speaking_target),
        }
      : null;
  return {
    branch_id: form.branch_id ? Number(form.branch_id) : null,
    subject_id: Number(form.subject_id),
    teacher_user_id: form.teacher_user_id
      ? Number(form.teacher_user_id)
      : null,
    name: form.name,
    course_type: form.course_type,
    delivery_mode: form.delivery_mode,
    target_framework: form.target_framework,
    cefr_level:
      form.target_framework === "cefr" ? form.cefr_level : null,
    level_from:
      form.target_framework === "cefr" ? form.cefr_level : null,
    level_to:
      form.target_framework === "cefr" ? form.cefr_level : null,
    target_score:
      form.target_framework === "ielts"
        ? Number(form.ielts_overall_target)
        : null,
    target_components:
      form.target_framework === "ielts"
        ? {
            listening: Number(form.ielts_listening_target),
            reading: Number(form.ielts_reading_target),
            writing: Number(form.ielts_writing_target),
            speaking: Number(form.ielts_speaking_target),
          }
        : {},
    ielts_targets: ieltsTargets,
    ielts_test_type:
      form.target_framework === "ielts"
        ? form.ielts_test_type || form.ielts_type || "academic"
        : null,
    level_label: form.level_label || null,
    monthly_price: Number(form.monthly_price) || 0,
    sessions_per_week: Number(form.sessions_per_week),
    weekdays: form.weekdays.map(Number),
    starts_at: form.starts_at || null,
    start_date: form.start_date || null,
    end_date: form.end_date || null,
    capacity:
      form.course_type === "individual" ? 1 : Number(form.capacity),
    duration_minutes: Number(form.duration_minutes),
    status: "draft",
    metadata: {},
  };
}

export function buildEnrollmentDecision(decision) {
  const statuses = {
    approve: "active",
    waitlist: "waitlisted",
    reject: "rejected",
    pause: "paused",
    withdraw: "withdrawn",
  };
  return {
    status: statuses[decision],
    confirmation: true,
  };
}

export function buildSchedulePayload(form) {
  const scheduleKind =
    form.schedule_kind === "weekly" ? "weekly" : "dated";
  return {
    course_id: Number(form.course_id),
    teacher_user_id: form.teacher_user_id
      ? Number(form.teacher_user_id)
      : null,
    room_id: form.room_id ? Number(form.room_id) : null,
    schedule_kind: scheduleKind,
    weekday:
      scheduleKind === "weekly" ? Number(form.weekday) : null,
    lesson_date:
      scheduleKind === "dated" ? form.lesson_date : null,
    effective_from:
      scheduleKind === "weekly"
        ? form.effective_from || form.start_date || null
        : null,
    effective_to:
      scheduleKind === "weekly"
        ? form.effective_to || form.end_date || null
        : null,
    starts_at: form.starts_at,
    ends_at: null,
    duration_minutes: Number(form.duration_minutes),
    topic: form.topic || null,
    status: form.status === "published" ? "published" : "draft",
    confirmation: form.status === "published",
  };
}

export function buildLessonPlanPayload(form) {
  return {
    course_id: Number(form.course_id),
    lesson_date: form.lesson_date || null,
    title: form.title,
    objectives: form.objective.trim()
      ? [{ text: form.objective.trim() }]
      : [],
    stages: form.activities.trim()
      ? [{ title: "Dars faoliyati", content: form.activities }]
      : [],
    content_text: form.explanation || null,
    content_latex: form.formula_latex || null,
    source_refs: [],
    duration_minutes: Number(form.duration_minutes),
  };
}

export function buildHomeworkPayload(form) {
  return {
    course_id: Number(form.course_id),
    lesson_plan_id: null,
    title: form.title,
    instructions: form.homework_text || null,
    content_latex: form.formula_latex || null,
    resource_refs: [],
    due_date: form.due_date || null,
    due_at: null,
    max_score: Number(form.max_score),
    status: "draft",
    confirmation: false,
  };
}

export function buildAttendancePayload({ courseId, date, form }) {
  return {
    course_id: Number(courseId),
    student_user_id: Number(form.student_user_id),
    lesson_date: date,
    schedule_slot_id: null,
    status: form.attendance_status,
    note: form.note || null,
  };
}

export function buildGradePayload({
  courseId,
  date,
  form,
  idempotencyKey,
}) {
  return {
    course_id: Number(courseId),
    student_user_id: Number(form.student_user_id),
    grade_type: "daily",
    grade_date: date,
    assessment_name: form.assessment_name,
    score: Number(form.score),
    max_score: 100,
    note: form.note || null,
    idempotency_key: idempotencyKey,
  };
}

export function buildAssessmentPayload(form, questions) {
  const now = Date.now();
  const items = questions
    .filter((question) => question.prompt.trim())
    .map((question, index) => {
      const indexedOptions =
        question.question_type === "multiple_choice"
          ? question.options
              .map((option, originalIndex) => ({
                option,
                originalIndex,
              }))
              .filter(({ option }) => option.trim())
          : [];
      const remappedCorrectIndex = indexedOptions.findIndex(
        ({ originalIndex }) =>
          originalIndex === Number(question.correct_answer),
      );
      return {
        question_ref: `manual-${now}-${index + 1}`,
        question_source: "manual_center",
        points: Number(question.points),
        section_key: null,
        metadata: {
          prompt: question.prompt,
          question_type: question.question_type,
          content_latex: question.formula_latex || null,
          options: indexedOptions.map(({ option }) => option),
          correct_answer:
            question.question_type === "multiple_choice" &&
            remappedCorrectIndex >= 0
              ? String(remappedCorrectIndex)
              : question.correct_answer,
        },
      };
    });
  return {
    course_id: Number(form.course_id),
    assessment_type: form.assessment_type,
    title: form.title,
    instructions: form.instructions || null,
    framework: form.framework,
    duration_minutes: Number(form.duration_minutes),
    max_attempts: Number(form.max_attempts),
    opens_at: form.opens_at || null,
    closes_at: form.closes_at || null,
    items,
    settings: {
      shuffle_questions: false,
      show_result_after_submit: true,
    },
  };
}

export function buildAttemptSubmitPayload(items, answers, idempotencyKey) {
  return {
    ...buildAttemptDraftPayload(items, answers),
    idempotency_key: idempotencyKey,
  };
}

export function buildAttemptDraftPayload(items, answers) {
  return {
    answers: items
      .filter((item) => Object.hasOwn(answers, item.id))
      .map((item) => ({
        assessment_item_id: item.id,
        response:
          (item.metadata?.question_type || item.question_type) ===
          "multiple_choice"
            ? { selected: answers[item.id] }
            : { text: answers[item.id] },
      })),
  };
}

export function buildPaymentPayload(form, idempotencyKey) {
  return {
    invoice_id: Number(form.invoice_id),
    amount: Number(form.amount),
    payment_method: form.payment_method,
    idempotency_key: idempotencyKey,
    reference: form.reference || null,
    paid_at: form.paid_at || null,
    confirmation: true,
  };
}

export function assertKnownEnum(name, value) {
  if (!CENTER_ENUMS[name]?.includes(value)) {
    throw new Error(`${name} uchun noma’lum qiymat: ${value}`);
  }
  return value;
}
