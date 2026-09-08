// REV28: ID search accepts 6–10 digits; account-local presentation settings; server permissions still govern contacts.
export const DEFAULT_KABUTAR_SETTINGS = Object.freeze({ textSize: 15, enterToSend: false, showPreviews: true });

export function normalizeKabutarId(value) {
  const compact = String(value || "").trim().replace(/^KB[\s-]*/i, "");
  return /^\d{6,10}$/.test(compact) ? `KB-${compact}` : "";
}

export function normalizeSettings(value) {
  return {
    textSize: [15, 17, 19].includes(Number(value?.textSize)) ? Number(value.textSize) : 15,
    enterToSend: value?.enterToSend === true,
    showPreviews: value?.showPreviews !== false,
  };
}

export function contactRecord(value) {
  const id = Number(value?.user_id);
  if (!Number.isSafeInteger(id) || id <= 0 || value?.guruh_id) return null;
  return {
    user_id: id,
    full_name: String(value.full_name || "Foydalanuvchi").slice(0, 160),
    kabutar_id: normalizeKabutarId(value.kabutar_id),
    izoh: String(value.qisqa || value.izoh || "").slice(0, 600),
    rasm_bormi: value.rasm_bormi === true,
    rollar: (Array.isArray(value.rollar) ? value.rollar : []).slice(0, 30).map(role => ({
      rol: String(role?.rol || "").slice(0, 160), muassasa: String(role?.muassasa || "").slice(0, 160),
    })),
  };
}

export function collectContacts(directory, saved = []) {
  const contacts = new Map();
  const self = Number(directory?.men?.user_id);
  const add = value => {
    const next = contactRecord(value);
    if (!next || next.user_id === self) return;
    const old = contacts.get(next.user_id);
    if (old) {
      next.kabutar_id ||= old.kabutar_id;
      next.izoh ||= old.izoh;
      next.rasm_bormi ||= old.rasm_bormi;
      const roles = new Map([...old.rollar, ...next.rollar].map(role => [`${role.rol}|${role.muassasa}`, role]));
      next.rollar = [...roles.values()];
    }
    contacts.set(next.user_id, next);
  };
  saved.forEach(add);
  (directory?.suhbatlar || []).forEach(add);
  (directory?.muassasalar || []).forEach(institution => (institution.azolar || []).forEach(person => add({
    ...person,
    rollar: [...(Array.isArray(person.rollar) ? person.rollar : []), { rol: person.izoh || "A’zo", muassasa: institution.muassasa || "" }],
  })));
  return [...contacts.values()].sort((a, b) => a.full_name.localeCompare(b.full_name, "uz"));
}

export function filterContacts(contacts, query, savedOnly = false, saved = []) {
  const normalize = text => String(text || "").toLocaleLowerCase("uz").replace(/[‘’ʻʼ`']/g, "");
  const q = normalize(query).trim();
  const ids = new Set(saved.map(person => Number(person.user_id)));
  return contacts.filter(person => (!savedOnly || ids.has(person.user_id)) && (!q || normalize(
    [person.full_name, person.kabutar_id, person.izoh, ...person.rollar.map(role => `${role.rol} ${role.muassasa}`)].join(" ")
  ).includes(q)));
}

export function kabutarStorageKey(apiBase, ownerId) {
  return ownerId ? `samtm:kabutar:v27:${String(apiBase || "").replace(/\/$/, "")}:${ownerId}` : null;
}

export function readKabutarLocal(storage, key) {
  const empty = { settings: { ...DEFAULT_KABUTAR_SETTINGS }, saved: [] };
  if (!key) return empty;
  try {
    const raw = storage.getItem(key);
    if (!raw || raw.length > 1000000) return empty;
    const data = JSON.parse(raw);
    const saved = new Map((Array.isArray(data.saved) ? data.saved : []).slice(0, 500).map(contactRecord).filter(Boolean).map(person => [person.user_id, person]));
    return { settings: normalizeSettings(data.settings), saved: [...saved.values()] };
  } catch { return empty; }
}

export async function kabutarRequest(apiBase, path, token, options = {}) {
  const { signal, ...init } = options;
  const controller = new AbortController();
  let timedOut = false;
  const cancel = () => controller.abort();
  if (signal?.aborted) cancel();
  else signal?.addEventListener("abort", cancel, { once: true });
  const timer = setTimeout(() => { timedOut = true; cancel(); }, 12000);
  try {
    const response = await fetch(`${String(apiBase || "").replace(/\/$/, "")}${path}${path.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`, { ...init, signal: controller.signal });
    let data;
    try { data = await response.json(); } catch { throw new Error("Server javobi o‘qilmadi. Qayta urinib ko‘ring."); }
    if (!response.ok || data?.detail) {
      throw new Error(typeof data?.detail === "string" ? data.detail : "Ma’lumot olinmadi. Qayta urinib ko‘ring.");
    }
    return data;
  } catch (error) {
    if (timedOut) throw new Error("Ulanish cho‘zildi. Qayta urinib ko‘ring.");
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", cancel);
  }
}

export async function copyKabutarText(value) {
  if (!value) return false;
  try { await navigator.clipboard.writeText(String(value)); return true; } catch { /* Older mobile browsers. */ }
  const field = document.createElement("textarea");
  field.value = String(value);
  field.setAttribute("readonly", "");
  field.style.cssText = "position:fixed;top:0;left:0;opacity:0;font-size:16px";
  const focused = document.activeElement;
  document.body.appendChild(field);
  field.focus(); field.select(); field.setSelectionRange(0, field.value.length);
  try { return document.execCommand("copy"); } catch { return false; }
  finally { field.remove(); focused?.focus?.({ preventScroll: true }); }
}
