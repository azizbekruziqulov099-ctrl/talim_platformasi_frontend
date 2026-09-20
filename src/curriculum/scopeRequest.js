// The audience is attached to every admin read/write, including FormData imports.
export async function scopedRequest(fetchImpl, url, options = {}, scope) {
 if (!scope?.id) throw new Error('Avval o‘quv dasturini tanlang');
 const target = new URL(url, 'https://talimkabutar.uz');
 target.searchParams.set('scope_id', String(scope.id));
 const next = { ...options };
 if (typeof next.body === 'string') {
  const body = JSON.parse(next.body);
  body.scope_id = scope.id;
  if ('dars_turi' in body) body.dars_turi = scope.dars_turi || null;
  next.body = JSON.stringify(body);
 }
 const response = await fetchImpl(target.toString(), next);
 if (!response.ok) {
  const data = await response.clone().json().catch(() => ({}));
  throw new Error(typeof data.detail === 'string' ? data.detail : `So‘rov bajarilmadi (${response.status})`);
 }
 return response;
}
