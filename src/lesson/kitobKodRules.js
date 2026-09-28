// Kitob kodi (XB-03-A01) va amaliy doska uchun sof qoidalar (brauzersiz sinash mumkin).

// Kiritilgan kodni tozalaydi: katta harf, bo'sh joylar olib tashlanadi, kirill X/B/A/... lotinga o'tadi.
const CYR = { "А": "A", "В": "B", "Е": "E", "К": "K", "М": "M", "Н": "H", "О": "O", "Р": "P", "С": "S", "Т": "T", "Х": "X", "У": "Y" };
export function cleanCode(value) {
  return String(value ?? "")
    .toUpperCase()
    .replace(/[АВЕКМНОРСТХУ]/g, (ch) => CYR[ch] || ch)
    .replace(/[–—_.\s]+/g, "-")
    .replace(/[^A-Z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
}

// Qidirishga yaroqli kod: kamida 3 ta harf/raqam.
export function isCodeLike(value) {
  return cleanCode(value).replace(/-/g, "").length >= 3;
}

export function codeUrl(apiBase, token, code) {
  const base = String(apiBase ?? "").replace(/\/+$/, "");
  return `${base}/api/kitob_kod/${encodeURIComponent(cleanCode(code))}?${new URLSearchParams({ token })}`;
}

// Shart matni doskada qatorlarga bo'linadi.
export function conditionLines(text) {
  return String(text ?? "").split(/\n+/).map((line) => line.trim()).filter(Boolean);
}

// Yechim qadamlarini ketma-ket ochish: navbatdagi ko'rinadigan qadamlar soni.
export function nextShown(shown, total) {
  return Math.min(Math.max(0, total), Math.max(0, shown) + 1);
}

// Variant tanlanganda holat: "ok" | "no" | "" (to'g'ri javob belgilanmagan bo'lsa baho berilmaydi).
export function optionState(index, picked, correct) {
  if (picked === null || picked === undefined) return "";
  if (correct === null || correct === undefined) return index === picked ? "picked" : "";
  if (index === correct) return "ok";
  return index === picked ? "no" : "";
}
