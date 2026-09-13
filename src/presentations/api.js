const PREFIX = '/api/taqdimotlar';

export class PresentationError extends Error {
  constructor(message, status = 0) { super(message); this.name = 'PresentationError'; this.status = status; }
}

export async function presentationRequest(apiBase, token, path, options = {}) {
  const controller = new AbortController();
  const { signal, timeout = 30000, body, binary = false, ...fetchOptions } = options;
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(abort, timeout);
  const multipart = typeof FormData !== 'undefined' && body instanceof FormData;
  try {
    const response = await fetch(`${String(apiBase || '').replace(/\/+$/, '')}${PREFIX}${path}`, {
      ...fetchOptions,
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(!multipart && body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...fetchOptions.headers },
      ...(body !== undefined ? { body: multipart ? body : JSON.stringify(body) } : {}),
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!response.ok) {
      let data;
      try { data = await response.json(); } catch { data = null; }
      const detail = typeof data?.detail === 'string' ? data.detail : Array.isArray(data?.detail) ? data.detail.map(item => item.msg || String(item)).join('; ') : data?.message;
      throw new PresentationError(detail || (response.status === 409 ? 'Loyiha boshqa oynada o‘zgartirilgan. Nusxa sifatida saqlang yoki serverdagi loyihani qayta oching.' : response.status === 403 ? 'Ushbu amal uchun ruxsat berilmagan.' : `So‘rov bajarilmadi (${response.status}). Qayta urinib ko‘ring.`), response.status);
    }
    return binary ? await response.blob() : await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      if (signal?.aborted) throw error;
      throw new PresentationError('Server javobi uzoq kutilmoqda. Matningiz shu oynada saqlanib turibdi; qayta urinib ko‘ring.');
    }
    if (error instanceof PresentationError) throw error;
    throw new PresentationError('Serverga ulanib bo‘lmadi. Internetni tekshiring va qayta urinib ko‘ring.');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}
