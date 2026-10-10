export async function workspaceRequest(base, path, token, { method = 'GET', body, signal } = {}) {
  const controller = new AbortController();
  let timedOut = false;
  const abort = () => controller.abort(); signal?.addEventListener('abort', abort, { once: true });
  if (signal?.aborted) controller.abort();
  const timer = setTimeout(() => { timedOut = true; abort(); }, 15000);
  try {
    const response = await fetch(`${String(base || '').replace(/\/+$/, '')}${path}`, { method, signal: controller.signal, cache: 'no-store', credentials: 'omit', headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw Object.assign(new Error(typeof data.detail === 'string' ? data.detail : 'So‘rov bajarilmadi. Qayta urinib ko‘ring.'), { status: response.status });
    return data;
  } catch (error) { if (timedOut) throw new Error('Server javobi kechikdi. Internetni tekshirib, qayta urinib ko‘ring.'); if (error instanceof TypeError) throw new Error('Serverga ulanib bo‘lmadi. Internetni tekshirib, qayta urinib ko‘ring.'); throw error; }
  finally { clearTimeout(timer); signal?.removeEventListener('abort', abort); }
}
