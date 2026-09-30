// This view only arranges messages already authorized and loaded by Kabutar.
// It never fetches contacts, messages or media independently.
export const CANVAS_MESSAGE_LIMIT = 400;
export const CANVAS_LAYOUTS = Object.freeze(["keyboard", "grid", "heart", "crescent", "edges"]);

export function canvasMessageDay(message) {
  const value = message?.yaratilgan_at ?? message?.created_at ?? message?.sana;
  const date = value instanceof Date ? value : new Date(value || "");
  if (Number.isNaN(date.getTime())) return "unknown";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function canvasMessageText(message) {
  const text = String(message?.matn || "").replace(/\s+/g, " ").trim();
  if (text) return text;
  if (["rasm", "image", "photo"].includes(message?.fayl_turi)) return "Rasm";
  if (message?.fayl_turi === "audio") return "Ovozli xabar";
  if (["video", "video_doira"].includes(message?.fayl_turi)) return "Video";
  if (message?.fayl_turi) return "Fayl";
  return "Xabar";
}

export function canvasMessages(messages) {
  const seen = new Set();
  return (Array.isArray(messages) ? messages : []).slice(-CANVAS_MESSAGE_LIMIT)
    .filter(message => {
      const id = Number(message?.id);
      if (!Number.isSafeInteger(id) || id <= 0 || seen.has(id)) return false;
      seen.add(id);
      return true;
    }).sort((a, b) => Number(a.id) - Number(b.id));
}

export function canvasDays(messages) {
  return [...new Set(messages.map(canvasMessageDay))].sort((a, b) => a === "unknown" ? -1 : b === "unknown" ? 1 : a.localeCompare(b));
}

export function canvasGeometry(width, height, layout = "keyboard") {
  const mode = CANVAS_LAYOUTS.includes(layout) ? layout : "keyboard";
  const safeWidth = Math.max(180, Number(width) || 640);
  const safeHeight = Math.max(48, Number(height) || 144);
  // A tile stays at least 44 px tall and 72 px wide; excess messages are paged.
  const columns = Math.max(2, Math.min(10, Math.floor((safeWidth + 6) / 92)));
  const rows = Math.max(1, Math.min(4, Math.floor((safeHeight + 6) / 50)));
  const cells = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      let include = true;
      // On a very short viewport every layout becomes a readable single row.
      if (rows >= 2 && columns >= 5) {
        if (mode === "heart") {
          const inset = row === 0 ? 0 : rows === 2 ? Math.floor(columns * .22) : Math.max(0, Math.floor((row - 1) * columns / (rows + 1)));
          include = col >= inset && col < columns - inset;
          if (row === 0) include = col !== Math.floor(columns / 2);
        } else if (mode === "crescent") {
          const middle = rows === 2 ? row === 1 : row > 0 && row < rows - 1;
          include = middle ? col < Math.ceil(columns * .45) : col < columns - 1;
        } else if (mode === "edges") {
          include = row === 0 || row === rows - 1 || col === 0 || col === columns - 1;
        }
      }
      if (mode === "keyboard" && row % 2 === 1 && columns >= 5) include = col < columns - 1;
      if (include) cells.push({ row: row + 1, column: col + 1 });
    }
  }
  return { mode, columns, rows, cells, capacity: Math.max(1, cells.length), adapted: ["heart", "crescent", "edges"].includes(mode) && (rows < 3 || columns < 5) };
}

export function canvasPage(messages, anchorId, capacity) {
  const size = Math.max(1, Math.min(40, Math.floor(Number(capacity) || 1)));
  const anchor = messages.findIndex(message => String(message.id) === String(anchorId));
  // Existing anchors are retained as messages arrive. A new view starts at the end.
  const start = anchor >= 0 ? anchor : Math.max(0, messages.length - size);
  const end = Math.min(messages.length, start + size);
  return {
    items: messages.slice(start, end), start, end,
    before: start, after: Math.max(0, messages.length - end),
    previousId: messages[Math.max(0, start - size)]?.id,
    nextId: messages[end]?.id,
  };
}
