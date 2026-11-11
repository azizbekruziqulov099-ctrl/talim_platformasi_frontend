// REV486: bitta obunali profil — bitta qurilma. Har qurilma o'z maxfiy kalitini saqlaydi (brauzer yoki ilova xotirasi).
export function qurilmaKaliti() {
  try {
    let k = localStorage.getItem("kb_qurilma");
    if (!k || !/^[A-Za-z0-9_-]{16,64}$/.test(k)) {
      const r = (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`).replace(/[^A-Za-z0-9_-]/g, "");
      k = r.slice(0, 48); localStorage.setItem("kb_qurilma", k);
    }
    return k;
  } catch { return ""; }
}

export function qurilmaNomi() {
  const u = String(globalThis.navigator?.userAgent || "");
  const ilova = /TalimAI|wv\)/.test(u) ? " (ilova)" : "";
  if (/iPhone/.test(u)) return `iPhone${ilova}`;
  if (/iPad/.test(u)) return `iPad${ilova}`;
  if (/Android/.test(u)) return `Android telefon${ilova}`;
  if (/Windows/.test(u)) return "Windows kompyuter";
  if (/Mac OS X/.test(u)) return "Mac kompyuter";
  if (/Linux/.test(u)) return "Linux kompyuter";
  return "Qurilma";
}
