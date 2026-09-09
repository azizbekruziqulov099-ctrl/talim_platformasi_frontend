export async function workspaceRequest(base, path, token, { method = 'GET', body, signal } = {}) {
  const controller = new AbortController();
  const abort = () => controller.abort(); signal?.addEventListener('abort', abort, { once: true });
  if (signal?.aborted) controller.abort();
  const timer = setTimeout(abort, 15000);
  try {
    const response = await fetch(`${base}${path}`, { method, signal: controller.signal, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw Object.assign(new Error(typeof data.detail === 'string' ? data.detail : 'So‘rov bajarilmadi. Qayta urinib ko‘ring.'), { status: response.status });
    return data;
  } catch (error) { if (error.name === 'AbortError') throw new Error('Server javobi kechikdi. Internetni tekshirib, qayta urinib ko‘ring.'); throw error; }
  finally { clearTimeout(timer); signal?.removeEventListener('abort', abort); }
}
