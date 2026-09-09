// Serialized foreground polling: next request starts only after the prior one
// settled. React owns foreground/active gating and calls stop() on hide/logout.
export function startKabutarPoll(task, {
  interval, maxDelay = 60000, setTimer = setTimeout, clearTimer = clearTimeout,
} = {}) {
  if (!(interval > 0) || maxDelay < interval) throw new Error("Polling interval noto‘g‘ri");
  const controller = new AbortController();
  let timer = null;
  let failures = 0;
  let stopped = false;
  const run = async () => {
    if (stopped) return;
    let succeeded = false;
    try { succeeded = (await task(controller.signal)) !== false; }
    catch { /* The request owner exposes the useful error to the UI. */ }
    if (stopped) return;
    failures = succeeded ? 0 : Math.min(failures + 1, 8);
    const delay = Math.min(maxDelay, interval * (2 ** failures));
    timer = setTimer(run, delay);
  };
  run();
  return () => {
    stopped = true;
    if (timer !== null) clearTimer(timer);
    controller.abort();
  };
}

// Merge server refreshes and optimistic sends without duplicate bubbles.
export function mergeKabutarMessages(current, incoming) {
  const rows = new Map(current.map(message => [String(message.id), message]));
  incoming.forEach(message => rows.set(String(message.id), { ...rows.get(String(message.id)), ...message }));
  return [...rows.values()].sort((a, b) => Number(a.id) - Number(b.id));
}
