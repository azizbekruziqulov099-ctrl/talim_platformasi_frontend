// REV96: «Kutubxonam» — sof yordamchi funksiyalar (testlanadi).

export const KIND_ICON = { word: "📄", pdf: "📕", excel: "📊", slides: "🖥️", image: "🖼️", boshqa: "📎" };
export const KIND_LABEL = { word: "Word", pdf: "PDF", excel: "Excel", slides: "Taqdimot", image: "Rasm", boshqa: "Fayl" };
export const ACCEPT = ".pdf,.doc,.docx,.rtf,.odt,.xls,.xlsx,.csv,.ods,.ppt,.pptx,.odp,.txt,.md,.jpg,.jpeg,.png,.webp,.gif,.zip,.rar,.mp3,.m4a,.mp4";

export function formatSize(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(n < 10 * 1024 * 1024 ? 1 : 0)} MB`;
}

export function placeLabel(doc) {
  if (!doc?.polka) return "Saralanmagan";
  return doc.qator ? `${doc.polka} › ${doc.qator}` : doc.polka;
}

export function fileUrl(apiBase, token, id, download = false) {
  const q = new URLSearchParams({ token });
  if (download) q.set("yuklab", "1");
  return `${String(apiBase).replace(/\/+$/, "")}/api/kutubxonam/hujjat/${id}/fayl?${q}`;
}

/** Tanlangan polka/qator bo'yicha ro'yxat (null polka = «Saralanmagan»). */
export function docsIn(docs, shelfId, rowId) {
  return (docs || []).filter((d) => (shelfId === "none" ? !d.polka_id : d.polka_id === shelfId) && (!rowId || d.qator_id === rowId));
}

export function errorText(data, status) {
  const d = data?.detail;
  if (typeof d === "string") return d;
  if (typeof d?.message === "string") return d.message;
  if (status === 413) return "Fayl juda katta";
  if (status === 401) return "Kirish muddati tugagan. Qayta kiring.";
  return `Xatolik (${status})`;
}
