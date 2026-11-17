/* Taqdimot dvigateli API (/api/taqdimot-dvigatel). */
export const DV_PREFIX = '/api/taqdimot-dvigatel';

export class DvigatelXato extends Error {
  constructor(message, status = 0) { super(message); this.name = 'DvigatelXato'; this.status = status; }
}

export function dvUrl(apiBase, path) {
  return `${String(apiBase || '').replace(/\/+$/, '')}${DV_PREFIX}${path}`;
}

export async function dvSorov(apiBase, token, path, { method = 'GET', json, raw, headers = {}, binary = false, text = false, timeout = 60000 } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(dvUrl(apiBase, path), {
      method,
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers },
      body: json !== undefined ? JSON.stringify(json) : raw,
      signal: ctrl.signal,
      cache: 'no-store',
    });
    if (!res.ok) {
      let d = null;
      try { d = await res.json(); } catch { /* bo'sh */ }
      throw new DvigatelXato(typeof d?.detail === 'string' ? d.detail : `So‘rov bajarilmadi (${res.status})`, res.status);
    }
    if (binary) return await res.blob();
    if (text) return await res.text();
    return await res.json();
  } catch (e) {
    if (e instanceof DvigatelXato) throw e;
    if (e.name === 'AbortError') throw new DvigatelXato('Server javobi uzoq kutilmoqda. Qayta urinib ko‘ring.');
    throw new DvigatelXato('Serverga ulanib bo‘lmadi. Internetni tekshiring.');
  } finally {
    clearTimeout(timer);
  }
}

export function yuklabOl(blob, nom) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nom;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
