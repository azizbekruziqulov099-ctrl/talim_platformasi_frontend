// Dars xonasining sof qoidalari (brauzersiz sinash mumkin).

const norm = (value) => String(value ?? "")
  .toLowerCase()
  .replace(/[‘’ʻʼ`]/g, "'")
  .replace(/\$|\\,|\\;|\s+/g, "")
  .replace(/,/g, ".")
  .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, "$1/$2");

// «kutilgan_javob»da bir nechta to'g'ri javob | yoki ; bilan ajratiladi: 2/6|1/3
export function checkAnswer(given, expected) {
  const answer = norm(given);
  if (!answer) return false;
  return String(expected ?? "").split(/[|;]/).map(norm).filter(Boolean).includes(answer);
}

// Bir xil «sahna»dagi ketma-ket qadamlar bitta doskada yig'iladi.
export function sceneRange(steps, index) {
  if (!steps?.[index]) return [];
  const scene = steps[index].sahna;
  let start = index;
  while (start > 0 && steps[start - 1].sahna === scene) start -= 1;
  return Array.from({ length: index - start + 1 }, (_, i) => start + i);
}

// Ovoz uchun: formulalar va belgilar o'qilmaydi, faqat so'zlar.
export function speakableText(text) {
  return String(text ?? "")
    .replace(/\[\d{1,2}\]/g, " ")
    .replace(/\$[^$]*\$/g, " ")
    .replace(/[\\{}^_#*<>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Ochiq dars ishlanmasi (PDF yoki Word) — shu mavzuning nashr qilingan darsi.
export function lessonDownloadUrl(apiBase, token, topicCode, format = "pdf") {
  const base = String(apiBase ?? "").replace(/\/+$/, "");
  return `${base}/api/dars_xonasi/${encodeURIComponent(topicCode)}/yuklab?${new URLSearchParams({ token, format: format === "docx" ? "docx" : "pdf" })}`;
}

// Ovoz va doska mosligi. Doskadagi har satr — alohida qator. Ovoz matnidagi [1], [2]
// belgilari: o'qituvchi shu so'zga yetganda doskaning o'sha qatori yoziladi. Belgi
// bo'lmagan qatorlar gap bo'ylab teng taqsimlanadi (birinchisi darhol).
export function boardCues(board, voice) {
  const lines = String(board ?? "").split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const words = [];
  const marked = new Map();
  for (const token of String(voice ?? "").split(/\s+/).filter(Boolean)) {
    const parts = token.split(/(\[\d{1,2}\])/).filter(Boolean);
    for (const part of parts) {
      const marker = part.match(/^\[(\d{1,2})\]$/);
      if (marker) { const n = Number(marker[1]) - 1; if (n >= 0 && !marked.has(n)) marked.set(n, words.length); }
      else words.push(part);
    }
  }
  const spoken = words.join(" ");
  const total = Math.max(1, words.length);
  const cues = lines.map((_, i) => marked.has(i) ? marked.get(i) : marked.size ? 0 : Math.floor((i * total) / Math.max(1, lines.length)));
  return { lines, spoken, cues };
}

// Hozir aytilayotgan so'zga qarab doskada nechta qator ko'rinishi kerak.
export function visibleLines(cues, wordIndex, finished) {
  if (finished) return cues.length;
  const at = Math.max(0, wordIndex);
  return cues.filter((cue) => cue <= at).length;
}
