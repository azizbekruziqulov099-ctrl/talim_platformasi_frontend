export const GAME_MODE_IDS = ["bridge", "millionaire", "space", "detective", "city"];

export const GAME_MODES = [
  {
    id: "bridge",
    icon: "◆",
    name: "Oltin ko'prik",
    short: "To'g'ri oynaga sakrab yo'lni oching",
    colors: ["#0E7490", "#67E8F9"],
  },
  {
    id: "millionaire",
    icon: "₿",
    name: "Bilim millioneri",
    short: "Pog'onalarga chiqing, 50/50 dan foydalaning",
    colors: ["#5B21B6", "#C4B5FD"],
  },
  {
    id: "space",
    icon: "✦",
    name: "Raketa missiyasi",
    short: "Har to'g'ri javob bilan yangi orbitaga o'ting",
    colors: ["#1D4ED8", "#93C5FD"],
  },
  {
    id: "detective",
    icon: "⌕",
    name: "Sirli izlar",
    short: "To'rtta dalilni topib, Boss jumboqni yeching",
    colors: ["#9A3412", "#FDBA74"],
  },
  {
    id: "city",
    icon: "▦",
    name: "Bilim shahri",
    short: "Javoblar bilan shahringizni bosqichma-bosqich quring",
    colors: ["#166534", "#86EFAC"],
  },
];

const JUNIOR_AGE_BAND = {
    label: "1–4-sinf",
    bossName: "Sehrli darvoza",
    bridgeName: "Sehrli toshlar",
    bossAttempts: 1,
    helper: "Katta tugmalar, savolni avtomatik ovozli o'qish va ko'rinarli vaqt",
};

const MIDDLE_AGE_BAND = {
    label: "5–9-sinf",
    bossName: "Boss bosqichi",
    bridgeName: "Oltin ko'prik",
    bossAttempts: 1,
    helper: "Sarguzasht, qo'lda ovozli o'qish va 4 variantli bosqich",
};

export const AGE_BANDS = {
  grade_1_4: JUNIOR_AGE_BAND,
  grade_5_9: MIDDLE_AGE_BAND,
  grade_10_11: {
    label: "10–11-sinf",
    bossName: "Final topshiriq",
    bridgeName: "Oyna yo'li",
    bossAttempts: 1,
    helper: "Strategik ko'rinish, murakkab savol va aniq izoh",
  },
  applicant: {
    label: "Abituriyent",
    bossName: "Imtihon finali",
    bridgeName: "Grant yo'li",
    bossAttempts: 1,
    helper: "Sokin professional dizayn va imtihonga yaqin ritm",
  },
  // V18.0 sessiyalarini migratsiya paytida ham ko'rsata olish uchun aliaslar.
  grade_1_5: JUNIOR_AGE_BAND,
  grade_6_9: MIDDLE_AGE_BAND,
};

export const GAME_TIMER_READY_DELAY_MS = 120;
export const GAME_AUTO_READ_MAX_WAIT_MS = 30000;
// To'g'ri/xato javob, qahramon animatsiyasi va izoh ko'rinib turadigan
// yagona majburiy pauza. Keyingi savolning server taymeri faqat bundan
// keyin, yangi savol ekranga chiqqach faollashadi.
export const GAME_FEEDBACK_HOLD_MS = 4500;
export const GAME_TIMEOUT_ANSWER = "__TIMEOUT__";

export function gameFeedbackCountdownSeconds(remainingMs) {
  return Math.max(0, Math.ceil(Math.max(0, Number(remainingMs) || 0) / 1000));
}

export function normalizeGradeBand(value) {
  const band = String(value || "").trim().toLowerCase();
  if (band === "grade_1_5" || band === "junior_1_4" || band === "junior_1_5") return "grade_1_4";
  if (band === "grade_6_9" || band === "middle_5_9" || band === "middle_6_9") return "grade_5_9";
  if (["grade_1_4", "grade_5_9", "grade_10_11", "applicant"].includes(band)) return band;
  return "applicant";
}

export function gradeBandForClass(value) {
  const text = String(value ?? "").trim().toLowerCase().replace(/-sinf$/i, "");
  const match = text.match(/(?:^|\D)(\d{1,2})(?:\D|$)/);
  if (!match) return "applicant";
  const grade = Number(match[1]);
  if (grade >= 1 && grade <= 4) return "grade_1_4";
  if (grade >= 5 && grade <= 9) return "grade_5_9";
  if (grade >= 10 && grade <= 11) return "grade_10_11";
  return "applicant";
}

export function modeForId(modeId) {
  return GAME_MODES.find((mode) => mode.id === modeId) || GAME_MODES[0];
}

export function modeNameForBand(modeId, gradeBand) {
  const mode = modeForId(modeId);
  if (mode.id !== "bridge") return mode.name;
  return AGE_BANDS[normalizeGradeBand(gradeBand)].bridgeName;
}

function firstFiniteNonNegative(values) {
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue;
    const number = Number(value);
    if (Number.isFinite(number) && number >= 0) return number;
  }
  return null;
}

function firstDefinedBoolean(values) {
  for (const value of values) {
    if (typeof value === "boolean") return value;
    if (value === 1 || value === "1" || value === "true") return true;
    if (value === 0 || value === "0" || value === "false") return false;
  }
  return null;
}

function parseDeadlineMs(values) {
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue;
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric > 0) {
      return numeric < 1e12 ? numeric * 1000 : numeric;
    }
    const parsed = Date.parse(String(value));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function firstTimerStatus(values) {
  for (const value of values) {
    const status = String(value || "").trim().toLowerCase();
    if (["waiting", "active", "expired"].includes(status)) return status;
  }
  return null;
}

export function resolveGameGradeBand(session = {}, question = {}) {
  const explicitGrade = [
    question.grade,
    question.class,
    question.sinf,
    session.grade,
    session.class,
    session.sinf,
  ].find((value) => /(?:^|\D)\d{1,2}(?:\D|$)/.test(String(value ?? "")));
  if (explicitGrade !== undefined) return gradeBandForClass(explicitGrade);
  return normalizeGradeBand(question.grade_band || question.cohort || session.grade_band || session.cohort);
}

export function shouldAutoReadGameQuestion(session = {}, question = {}) {
  const enabled = firstDefinedBoolean([
    question.auto_read,
    question.auto_read_aloud,
    question.voice_auto_read,
    session.auto_read,
    session.auto_read_questions,
    session.voice_auto_read,
    session.preferences?.auto_read_questions,
    session.settings?.auto_read_questions,
  ]);
  const voiceAllowed = firstDefinedBoolean([
    question.voice_enabled,
    session.voice_enabled,
    session.preferences?.voice_enabled,
    session.settings?.voice_enabled,
  ]);
  if (voiceAllowed === false) return false;
  if (enabled !== null) return enabled;
  return resolveGameGradeBand(session, question) === "grade_1_4";
}

export function hasGameTimerData(payload = {}) {
  const timer = payload.timer || payload.question_timer || {};
  return [
    payload.time_limit_seconds,
    payload.time_limit,
    payload.timer_limit_seconds,
    payload.remaining_seconds,
    payload.time_remaining_seconds,
    payload.seconds_remaining,
    payload.deadline_at,
    payload.deadline,
    payload.timer_deadline_at,
    timer.time_limit_seconds,
    timer.limit_seconds,
    timer.remaining_seconds,
    timer.deadline_at,
  ].some((value) => value !== null && value !== undefined && value !== "");
}

export function gameQuestionTimerConfig(question = {}, session = {}, nowMs = Date.now()) {
  const questionTimer = question.timer || question.question_timer || {};
  const sessionTimer = session.timer || session.question_timer || session.current_timer || {};
  const status = firstTimerStatus([
    question.timer_status,
    question.timerStatus,
    questionTimer.timer_status,
    questionTimer.status,
    session.current_question_timer_status,
    session.timer_status,
    sessionTimer.timer_status,
    sessionTimer.status,
  ]);
  const limitSeconds = firstFiniteNonNegative([
    question.time_limit_seconds,
    question.time_limit,
    question.timer_limit_seconds,
    questionTimer.time_limit_seconds,
    questionTimer.limit_seconds,
    session.current_question_time_limit_seconds,
    session.time_limit_seconds,
    sessionTimer.time_limit_seconds,
    sessionTimer.limit_seconds,
  ]);
  const suppliedRemaining = firstFiniteNonNegative([
    question.remaining_seconds,
    question.time_remaining_seconds,
    question.seconds_remaining,
    questionTimer.remaining_seconds,
    session.current_question_remaining_seconds,
    session.remaining_seconds,
    sessionTimer.remaining_seconds,
  ]);
  const deadlineMs = parseDeadlineMs([
    question.deadline_at,
    question.deadline,
    question.expires_at,
    question.timer_deadline_at,
    questionTimer.deadline_at,
    session.current_question_deadline_at,
    session.question_deadline_at,
    session.deadline_at,
    sessionTimer.deadline_at,
  ]);
  const serverNowMs = parseDeadlineMs([
    question.server_now,
    questionTimer.server_now,
    session.server_now,
    sessionTimer.server_now,
  ]);
  const referenceNowMs = serverNowMs ?? nowMs;
  const deadlineRemaining = deadlineMs === null ? null : Math.max(0, (deadlineMs - referenceNowMs) / 1000);
  // Backend bergan remaining_seconds server soatida hisoblangan va klient
  // qurilmasining noto'g'ri soatidan ko'ra ishonchliroq.
  const calculatedRemaining = suppliedRemaining ?? deadlineRemaining ?? limitSeconds;
  const remainingSeconds = status === "expired" ? 0 : calculatedRemaining;
  const hasTimingValue = deadlineMs !== null || suppliedRemaining !== null || (limitSeconds !== null && limitSeconds > 0);
  // `waiting` savolda limit bo'lsa ham countdown hali boshlanmagan. Faqat
  // server `active`/`expired` deganda yoki eski server aniq vaqt berganda ishlaydi.
  const enabled = status === "waiting"
    ? false
    : status === "active" || status === "expired" || hasTimingValue;
  const effectiveLimit = limitSeconds && limitSeconds > 0
    ? limitSeconds
    : remainingSeconds !== null
      ? Math.max(1, remainingSeconds)
      : null;
  return {
    enabled,
    status,
    deadlineMs,
    serverNowMs,
    limitSeconds: effectiveLimit,
    remainingSeconds: remainingSeconds === null ? null : Math.max(0, remainingSeconds),
  };
}

export function gameLivesRemaining(...sources) {
  for (const source of sources) {
    if (!source || typeof source !== "object") continue;
    const value = firstFiniteNonNegative([
      source.lives_remaining,
      source.livesRemaining,
      source.initial_lives,
      source.remaining_lives,
      source.life_remaining,
      source.lives,
      source.game?.lives_remaining,
    ]);
    if (value !== null) return Math.floor(value);
  }
  return null;
}

export function isGameTerminalResponse(payload = {}) {
  const status = String(payload.status || payload.game_status || "").trim().toLowerCase();
  return ["finished", "completed", "abandoned", "game_over", "failed", "lost", "expired"].includes(status)
    || payload.game_over === true
    || payload.terminal === true
    || Boolean(payload.result && !payload.question);
}

export function formatGameTimerSeconds(value) {
  const seconds = Math.max(0, Math.ceil(Number(value) || 0));
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

export function gameQuestionOptions(availableCount) {
  const max = Math.min(25, Math.floor(Math.max(0, Number(availableCount) || 0) / 5) * 5);
  return [5, 10, 15, 20, 25].filter((count) => count <= max);
}

export function buildGameStartPayload({ token, topicCodes, questionCount, gameMode }) {
  if (!token) throw new Error("Kirish sessiyasi topilmadi");
  if (!GAME_MODE_IDS.includes(gameMode)) throw new Error("O'yin turini tanlang");
  if (![5, 10, 15, 20, 25].includes(Number(questionCount))) {
    throw new Error("Savollar soni 5 talik bosqichlarda bo'ladi");
  }
  const codes = [...new Set((topicCodes || []).map((value) => String(value || "").trim()).filter(Boolean))];
  if (codes.length === 0) throw new Error("Kamida bitta mavzu tanlang");
  return {
    token,
    topic_codes: codes,
    question_count: Number(questionCount),
    game_mode: gameMode,
  };
}

export function gameErrorMessage(payload, fallback = "O'yinni davom ettirib bo'lmadi") {
  if (typeof payload?.detail === "string") return payload.detail;
  if (typeof payload?.detail?.message === "string") return payload.detail.message;
  if (typeof payload?.message === "string") return payload.message;
  return fallback;
}

export function profileLevelLabel(profile) {
  const level = Math.max(1, Number(profile?.level) || 1);
  if (level < 4) return `Boshlovchi · ${level}-daraja`;
  if (level < 8) return `Izlanuvchi · ${level}-daraja`;
  if (level < 12) return `Bilimdon · ${level}-daraja`;
  return `Usta · ${level}-daraja`;
}
