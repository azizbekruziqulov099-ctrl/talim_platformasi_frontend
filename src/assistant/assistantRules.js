// Pure view rules. Catalog selection and scoring remain server-authoritative.
export const DEFAULT_ASSISTANT_DRAFT = Object.freeze({
  grade: null, topic_codes: [], question_count: 20, difficulty: "mixed", minutes: 30,
  mode: "practice", subject_points: {},
});

export function initialAssistantDraft(user) {
  const candidate = user?.sinf_darajasi ?? user?.grade ?? user?.class ?? user?.sinf;
  const match = String(candidate ?? "").match(/^\s*(1[01]|[1-9])(?:\D|$)/);
  return { ...DEFAULT_ASSISTANT_DRAFT, grade: match ? Number(match[1]) : null,
    topic_codes: [], subject_points: {} };
}

export function topicTitle(topic) {
  return String(topic?.title || topic?.mavzu_name || topic?.nomi || topic?.topic_code || "Mavzu");
}

export function selectTopic(draft, topicCode, checked) {
  const code = String(topicCode || "").trim();
  const selected = new Set((draft.topic_codes || []).map(String));
  if (code && checked) selected.add(code); else selected.delete(code);
  return { ...draft, topic_codes: [...selected] };
}

export function draftFingerprint(draft) {
  // Stable key prevents a previous confirmation from creating a changed draft.
  const orderedPoints = Object.fromEntries(Object.entries(draft.subject_points || {}).sort(([a], [b]) => a.localeCompare(b)));
  return JSON.stringify({ grade: draft.grade, quarter: draft.quarter || null, topic_codes: [...(draft.topic_codes || [])].sort(),
    question_count: draft.question_count, difficulty: draft.difficulty, minutes: draft.minutes,
    mode: draft.mode, subject_points: orderedPoints });
}

export function assistantRemainingSeconds(expiresAt, serverOffset = 0, now = Date.now()) {
  const expires = Date.parse(expiresAt || "");
  if (!Number.isFinite(expires)) return null;
  return Math.max(0, Math.ceil((expires - (now + serverOffset)) / 1000));
}

export function formatAssistantTime(seconds) {
  if (seconds == null) return "—";
  const value = Math.max(0, Number(seconds) || 0);
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
}

export function questionOptions(question) {
  if (question?.question_type === "write_answer") return [];
  return ["a", "b", "c", "d"].flatMap((letter) => {
    const text = question?.[`option_${letter}`];
    return text == null || String(text).trim() === "" ? [] : [{ value: letter.toUpperCase(), text: String(text) }];
  });
}

export function assistantSpeechChunks(value, limit = 1050) {
  // Preserve explicitly tagged languages; untagged assistant messages are Uzbek.
  const source = String(value || "").replace(/[*#`]/g, "").trim();
  if (!source) return [];
  const pattern = /\[(uz|en|ru)\]([\s\S]*?)\[\/\1\]/gi;
  const parts = [];
  let cursor = 0;
  let match;
  const append = (text, lang) => {
    let remaining = text.trim();
    while (remaining) {
      let cut = Math.min(remaining.length, limit);
      if (cut < remaining.length) {
        const space = remaining.lastIndexOf(" ", cut);
        if (space > limit / 2) cut = space;
      }
      const chunk = remaining.slice(0, cut).trim();
      if (chunk) parts.push(`[${lang}]${chunk}[/${lang}]`);
      remaining = remaining.slice(cut).trim();
    }
  };
  while ((match = pattern.exec(source))) {
    append(source.slice(cursor, match.index), "uz");
    append(match[2], match[1].toLowerCase());
    cursor = pattern.lastIndex;
  }
  append(source.slice(cursor), "uz");
  return parts;
}

export function assistantImageSource(value, apiBase) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("/api/")) return `${apiBase}${raw}`;
  if (/^\d+(?:-\d+){5,9}$/.test(raw)) return `${apiBase}/api/rasm/${encodeURIComponent(raw)}`;
  return null;
}


export function assistantNextSuggestions(draft, conversation = {}, catalog = {}) {
  // Buttons are suggestions only. The server resolves every choice against real topics.
  const supplied = Array.isArray(conversation.suggestions) ? conversation.suggestions : [];
  const clean = supplied.filter((item) => item && typeof item.message === "string" && item.message.trim())
    .slice(0, 11).map((item) => ({ label: String(item.label || item.message).slice(0, 100), message: item.message.slice(0, 2000) }));
  if (clean.length) return [...new Map(clean.map((item) => [item.message, item])).values()];
  if (conversation.nextField === "grade") {
    return Array.from({ length: 11 }, (_, i) => ({ label: `${i + 1}-sinf`, message: `${i + 1}-sinf` }));
  }
  if (conversation.nextField === "question_count") {
    return [10, 20, 30, 50].map((count) => ({ label: `${count} ta savol`, message: `${count} ta savol` }));
  }
  if (conversation.nextField === "minutes") {
    return [15, 30, 45, 60].map((minutes) => ({ label: `${minutes} daqiqa`, message: `${minutes} daqiqa` }));
  }
  if (conversation.nextField === "difficulty") {
    return [{ label: "Oson", message: "Oson savollar" }, { label: "O‘rtacha", message: "O‘rtacha qiyinlik" }, { label: "Aralash", message: "Qiyinligi aralash bo‘lsin" }];
  }
  if (conversation.nextField === "subject" && draft.grade && catalog.subjects?.length) {
    return catalog.subjects.slice(0, 8).map((subject) => ({ label: String(subject.name), message: `${draft.grade}-sinf ${subject.name} mavzularini topamiz` }));
  }
  return [
    { label: "Bilimimni sinab ko‘rmoqchiman", message: "Bilimimni test bilan sinab ko‘rmoqchiman" },
    { label: "Mavzu va test topish", message: "Menga mavzu va unga mos test topishga yordam bering" },
    { label: "PDF test tayyorlash", message: "Chop etish uchun PDF test tayyorlamoqchiman" },
  ];
}

export function assistantResultSummary(result) {
  const correct = Number(result?.correct);
  const total = Number(result?.total);
  if (!Number.isFinite(correct) || !Number.isFinite(total) || total <= 0 || correct < 0 || correct > total) return "Javoblaringizni quyida birga ko‘rib chiqishingiz mumkin.";
  if (correct === total) return "Bu testdagi barcha savollarga to‘g‘ri javob berdingiz. Keyingi mashqda qiyinroq savollarni sinab ko‘rishingiz mumkin.";
  const remaining = total - correct;
  return `${remaining} ta savolni qayta ko‘rib chiqamiz. Quyida javoblaringizni tekshiring, keyin shu mavzulardan yana mashq qilishingiz mumkin.`;
}
