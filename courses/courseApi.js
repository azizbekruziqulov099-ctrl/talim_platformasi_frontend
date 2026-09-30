// REV47: course requests share authentication, cancellation and truthful errors.
export function courseEndpoint(apiBase, path) {
  if (!/^\/api\/kurslar(?:\/|$)/.test(path)) throw new Error("Kurs manzili noto‘g‘ri.");
  return `${String(apiBase || "").replace(/\/+$/, "")}${path}`;
}

export function courseError(data, status) {
  const detail = data?.detail;
  if (typeof detail === "string" && detail.trim()) return detail;
  if (typeof detail?.message === "string") return detail.message;
  if (Array.isArray(detail)) return detail.map(item => item.msg).filter(Boolean).join("; ") || "Kiritilgan ma’lumotlarni tekshiring.";
  if (status === 401) return "Sessiyangiz tugagan. Hisobingizga qayta kiring.";
  if (status === 403) return "Bu dars yoki amal uchun ruxsat yo‘q.";
  if (status === 402) return "Bu dars uchun faol kurs obunasi kerak.";
  if (status === 404) return "Kurs topilmadi yoki serverdagi kurs bo‘limi hali yangilanmagan.";
  if (status === 409) return "Ma’lumot boshqa oynada o‘zgargan. Qayta yuklab tekshiring.";
  if (status === 429) return "So‘rovlar ko‘paydi. Birozdan keyin qayta urinib ko‘ring.";
  if (status === 503) return "Bu xizmat hozir tayyor emas. Keyinroq qayta urinib ko‘ring.";
  return "Amal bajarilmadi. Qayta urinib ko‘ring.";
}

async function request(apiBase, token, path, { method = "GET", body, signal, blob = false, timeout = 20000 } = {}) {
  const controller = new AbortController();
  let timedOut = false;
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  else signal?.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeout);
  const form = typeof FormData !== "undefined" && body instanceof FormData;
  try {
    const response = await fetch(courseEndpoint(apiBase, path), {
      method, cache: "no-store", credentials: "omit", signal: controller.signal,
      headers: { ...(blob ? {} : { Accept: "application/json" }), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body !== undefined && !form ? { "Content-Type": "application/json" } : {}) },
      ...(body === undefined ? {} : { body: form ? body : JSON.stringify(body) }),
    });
    if (blob && response.ok) return await response.blob();
    const data = await response.json().catch(() => null);
    if (!response.ok) { const error = new Error(courseError(data, response.status)); error.status = response.status; error.detail = data?.detail; throw error; }
    if (!data || typeof data !== "object") throw new Error("Serverdan noto‘g‘ri javob keldi. Amal saqlanganini tekshiring.");
    return data;
  } catch (error) {
    if (timedOut) { const timeoutError = new Error("Javobni kutish tugadi. Saqlash holatini qayta tekshiring."); timeoutError.name = "TimeoutError"; throw timeoutError; }
    if (error.name === "AbortError") throw error;
    if (error instanceof TypeError) throw new Error("Internet bilan aloqa uzildi. Qayta urinib ko‘ring.");
    throw error;
  } finally { clearTimeout(timer); signal?.removeEventListener("abort", abort); }
}

export function courseRequest(apiBase, token, path, options = {}) { return request(apiBase, token, path, options); }
export function uploadCourseFile(apiBase, token, courseId, file, { signal } = {}) {
  const body = new FormData(); body.append("file", file);
  return request(apiBase, token, `/api/kurslar/courses/${Number(courseId)}/files`, { method: "POST", body, signal, timeout: 45000 });
}
export function fetchCourseBlob(apiBase, token, lessonId, assetId, { signal } = {}) {
  return request(apiBase, token, `/api/kurslar/lessons/${Number(lessonId)}/files/${encodeURIComponent(assetId)}`, { signal, blob: true, timeout: 45000 });
}
