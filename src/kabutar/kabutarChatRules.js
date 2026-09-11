// Keep the message DOM and memory bounded, including a long running conversation.
export const KABUTAR_MESSAGE_WINDOW = 400;

export function chatMessageWindow(current, incoming, older = false) {
  const byId = new Map();
  for (const row of [...current, ...incoming]) {
    if (!Number.isSafeInteger(Number(row?.id)) || Number(row.id) <= 0) continue;
    const key = String(row.id);
    byId.set(key, { ...byId.get(key), ...row });
  }
  const rows = [...byId.values()].sort((a, b) => Number(a.id) - Number(b.id));
  return older ? rows.slice(0, KABUTAR_MESSAGE_WINDOW) : rows.slice(-KABUTAR_MESSAGE_WINDOW);
}

export function chatNearBottom(element) {
  return !element || element.scrollHeight - element.scrollTop - element.clientHeight < 110;
}

export function chatDateKey(value) {
  const date = new Date(value || "");
  return Number.isNaN(date.getTime()) ? "" : `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function chatDateLabel(value, now = new Date(), locale = "uz-UZ", translate = text => text) {
  const date = new Date(value || "");
  if (Number.isNaN(date.getTime())) return "";
  if (chatDateKey(date) === chatDateKey(now)) return translate("Bugun");
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (chatDateKey(date) === chatDateKey(yesterday)) return translate("Kecha");
  const options = { day: "numeric", month: "long", year: date.getFullYear() === now.getFullYear() ? undefined : "numeric" };
  try { return date.toLocaleDateString(locale, options); }
  catch { return date.toLocaleDateString("uz-UZ", options); }
}

export function institutionGroupVisible(group, scope = null) {
  if (!group || ["global", "tashqi"].includes(group.manba_turi)) return false;
  if (!scope) return true; // The server also authorizes every returned group.
  const normalize = value => value === "institut" ? "universitet" : String(value || "");
  return normalize(group.scope_turi || group.manba_turi) === normalize(scope.turi)
    && String(group.scope_id ?? group.manba_id) === String(scope.muassasa_id);
}
