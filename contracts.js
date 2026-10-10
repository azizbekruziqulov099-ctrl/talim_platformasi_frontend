export const INSTITUTE_ENUMS = Object.freeze({
  relationships: ["owner", "founder", "rector", "administrator"],
  ownershipTypes: ["public", "private"],
  institutionTypes: ["institute", "university", "academy", "branch"],
  setupModes: ["manual", "guided", "assistant"],
  gradingSystems: ["credit_modular", "five_point", "custom"],
  degreeLevels: [
    "foundation",
    "bachelor",
    "master",
    "doctoral",
    "professional",
    "custom",
  ],
  studyForms: [
    "full_time",
    "part_time",
    "evening",
    "distance",
    "dual",
    "custom",
  ],
  termTypes: ["semester", "trimester", "quarter", "summer", "custom"],
  termStatuses: [
    "planned",
    "registration",
    "active",
    "grade_entry",
    "closed",
    "archived",
  ],
  requirementTypes: ["required", "elective", "optional"],
  deliveryModes: ["offline", "online_live", "hybrid", "self_paced"],
  enrollmentStatuses: [
    "pending",
    "enrolled",
    "waitlisted",
    "completed",
    "withdrawn",
    "rejected",
  ],
  attendanceStatuses: [
    "present",
    "absent",
    "late",
    "excused",
    "sick",
  ],
  paymentMethods: ["cash", "card", "bank_transfer", "online", "other"],
});

function numberOrNull(value) {
  if (value === "" || value === undefined || value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function integerOrNull(value) {
  const parsed = numberOrNull(value);
  return parsed === null ? null : Math.trunc(parsed);
}

function textOrNull(value) {
  const text = String(value ?? "").trim();
  return text || null;
}

function compactObject(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined),
  );
}

export function buildDraftStartPayload(form) {
  return {
    relationship: form.relationship || "rector",
    ownership_type: form.ownership_type || "public",
    institution_type: form.institution_type || "institute",
    setup_mode: form.setup_mode || "guided",
    grading_system: form.grading_system || "credit_modular",
  };
}

export function buildDraftPatchPayload(step, payload, expectedVersion) {
  return compactObject({
    step,
    payload,
    expected_version:
      expectedVersion === undefined || expectedVersion === null
        ? undefined
        : Number(expectedVersion),
  });
}

export function buildFacultyPayload(form) {
  return compactObject({
    campus_id: Number(form.campus_id),
    code: form.code.trim(),
    name: form.name.trim(),
    dean_user_id: integerOrNull(form.dean_user_id) ?? undefined,
  });
}

export function buildDepartmentPayload(form) {
  return compactObject({
    faculty_id: Number(form.faculty_id),
    code: form.code.trim(),
    name: form.name.trim(),
    head_user_id: integerOrNull(form.head_user_id) ?? undefined,
  });
}

export function buildProgramPayload(form) {
  return {
    department_id: Number(form.department_id),
    code: form.code.trim(),
    name: form.name.trim(),
    degree_level: form.degree_level || "bachelor",
    study_form: form.study_form || "full_time",
    language: form.language || "uz",
    duration_terms: Number(form.duration_terms),
    target_credits: Number(form.target_credits),
    policy_overrides: form.policy_overrides || {},
  };
}

export function buildAcademicYearPayload(form) {
  return {
    code: form.code.trim(),
    starts_on: form.starts_on,
    ends_on: form.ends_on,
  };
}

export function buildTermPayload(form) {
  return compactObject({
    academic_year_id: Number(form.academic_year_id),
    term_no: Number(form.term_no),
    term_type: form.term_type || "semester",
    name: form.name.trim(),
    starts_on: form.starts_on,
    ends_on: form.ends_on,
    registration_opens_at: textOrNull(form.registration_opens_at) ?? undefined,
    registration_closes_at:
      textOrNull(form.registration_closes_at) ?? undefined,
    change_deadline: textOrNull(form.change_deadline) ?? undefined,
  });
}

export function buildCoursePayload(form) {
  return compactObject({
    department_id: Number(form.department_id),
    code: form.code.trim(),
    title: form.title.trim(),
    credit_value: Number(form.credit_value),
    lecture_hours: Number(form.lecture_hours || 0),
    practice_hours: Number(form.practice_hours || 0),
    laboratory_hours: Number(form.laboratory_hours || 0),
    independent_hours: Number(form.independent_hours || 0),
    supports_latex: Boolean(form.supports_latex),
    description: textOrNull(form.description) ?? undefined,
    metadata: form.metadata || {},
  });
}

export function buildCurriculumPayload(form) {
  return {
    program_id: Number(form.program_id),
    admission_year: Number(form.admission_year),
    version: Number(form.version || 1),
    name: form.name.trim(),
  };
}

export function buildCurriculumCoursePayload(form) {
  return compactObject({
    course_id: Number(form.course_id),
    recommended_term: Number(form.recommended_term),
    requirement_type: form.requirement_type || "required",
    elective_block: textOrNull(form.elective_block) ?? undefined,
    credits_override: numberOrNull(form.credits_override) ?? undefined,
    hours_override: form.hours_override || {},
    prerequisite_course_ids: (form.prerequisite_course_ids || [])
      .map(Number)
      .filter(Number.isFinite),
  });
}

export function buildCohortPayload(form) {
  return compactObject({
    program_id: Number(form.program_id),
    curriculum_id: Number(form.curriculum_id),
    code: form.code.trim(),
    admission_year: Number(form.admission_year),
    current_level: Number(form.current_level || 1),
    study_language: form.study_language || "uz",
    advisor_user_id: integerOrNull(form.advisor_user_id) ?? undefined,
  });
}

export function buildSectionPayload(form) {
  return compactObject({
    term_id: Number(form.term_id),
    course_id: Number(form.course_id),
    curriculum_course_id:
      integerOrNull(form.curriculum_course_id) ?? undefined,
    code: form.code.trim(),
    name: form.name.trim(),
    primary_lecturer_user_id:
      integerOrNull(form.primary_lecturer_user_id) ?? undefined,
    delivery_mode: form.delivery_mode || "offline",
    section_type: form.section_type || "regular",
    capacity: Number(form.capacity || 30),
    cohort_ids: (form.cohort_ids || []).map(Number).filter(Number.isFinite),
    metadata: form.metadata || {},
  });
}

export function buildEnrollmentPayload(form) {
  return compactObject({
    section_id: Number(form.section_id),
    cohort_id: integerOrNull(form.cohort_id) ?? undefined,
    student_user_id: Number(form.student_user_id),
    student_number: form.student_number.trim(),
    enrollment_type: form.enrollment_type || "regular",
    status: form.status || "pending",
    note: textOrNull(form.note) ?? undefined,
    confirmation: false,
  });
}

export function buildSchedulePayload(form) {
  const weekly = form.schedule_kind === "weekly";
  return compactObject({
    section_id: Number(form.section_id),
    teacher_user_id: Number(form.teacher_user_id),
    room_id: integerOrNull(form.room_id) ?? undefined,
    schedule_kind: weekly ? "weekly" : "dated",
    weekday: weekly ? Number(form.weekday) : undefined,
    lesson_date: weekly ? undefined : form.lesson_date,
    effective_from: weekly ? form.effective_from : undefined,
    effective_to: weekly ? form.effective_to : undefined,
    starts_at: form.starts_at,
    ends_at: form.ends_at,
    lesson_kind: form.lesson_kind || "lecture",
    topic: textOrNull(form.topic) ?? undefined,
    status: "draft",
    confirmation: false,
  });
}

export function buildAttendancePayload(form) {
  return compactObject({
    section_id: Number(form.section_id),
    student_user_id: Number(form.student_user_id),
    schedule_slot_id: integerOrNull(form.schedule_slot_id) ?? undefined,
    lesson_date: form.lesson_date,
    scheduled_minutes: Number(form.scheduled_minutes || 80),
    absent_minutes: Number(form.absent_minutes || 0),
    status: form.status || "present",
    note: textOrNull(form.note) ?? undefined,
  });
}

export function buildAssessmentPayload(form) {
  return compactObject({
    section_id: Number(form.section_id),
    assessment_type: form.assessment_type || "quiz",
    title: form.title.trim(),
    max_score: Number(form.max_score),
    weight_percent: Number(form.weight_percent),
    due_at: textOrNull(form.due_at) ?? undefined,
    settings: form.settings || {},
  });
}

export function buildGradePayload(form, idempotencyKey) {
  return compactObject({
    assessment_id: Number(form.assessment_id),
    enrollment_id: Number(form.enrollment_id),
    score: Number(form.score),
    feedback: textOrNull(form.feedback) ?? undefined,
    idempotency_key: idempotencyKey || undefined,
  });
}

export function buildContractPayload(form) {
  return compactObject({
    student_user_id: Number(form.student_user_id),
    program_id: Number(form.program_id),
    academic_year_id: Number(form.academic_year_id),
    contract_no: form.contract_no.trim(),
    contract_type: form.contract_type || "paid",
    total_amount: Number(form.total_amount),
    scholarship_amount: Number(form.scholarship_amount || 0),
    currency: form.currency || "UZS",
    payer_user_id: integerOrNull(form.payer_user_id) ?? undefined,
    starts_on: form.starts_on,
    ends_on: form.ends_on,
    confirmation: true,
  });
}

export function buildInstallmentsPayload(rows) {
  return {
    items: (rows || []).map((row, index) => ({
      installment_no: Number(row.installment_no || index + 1),
      due_date: row.due_date,
      amount: Number(row.amount),
    })),
    confirmation: true,
  };
}

export function buildPaymentPayload(form, idempotencyKey) {
  return compactObject({
    contract_id: Number(form.contract_id),
    installment_id: Number(form.installment_id),
    amount: Number(form.amount),
    currency: form.currency || "UZS",
    payment_method: form.payment_method,
    reference: textOrNull(form.reference) ?? undefined,
    idempotency_key: idempotencyKey,
    paid_at: textOrNull(form.paid_at) ?? undefined,
    confirmation: true,
  });
}

export function attendanceWarnings({
  scheduledMinutes = 0,
  absentMinutes = 0,
  semesterUnexcusedMinutes = 0,
} = {}) {
  const scheduled = Math.max(0, Number(scheduledMinutes) || 0);
  const absent = Math.max(0, Number(absentMinutes) || 0);
  const absencePercent = scheduled > 0 ? (absent / scheduled) * 100 : 0;
  return {
    absence_percent: absencePercent,
    course_warning: absencePercent >= 25,
    semester_hours: (Number(semesterUnexcusedMinutes) || 0) / 60,
    semester_warning: (Number(semesterUnexcusedMinutes) || 0) >= 74 * 60,
    automatic_action: false,
  };
}

export function assertKnownEnum(name, value) {
  if (!INSTITUTE_ENUMS[name]?.includes(value)) {
    throw new Error(`${name} uchun noma’lum qiymat: ${value}`);
  }
  return value;
}
