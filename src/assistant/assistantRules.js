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
