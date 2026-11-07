import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { speakableText } from "../lesson/darsXonasiRules.js";
import { MIK_TIL, ovozMatni, xbTil } from "./xbTil.js";

/**
 * REV260: ustoz ovozi (/api/ovoz) — ovoz qancha aytilganini (0–1) ham beradi: doskadagi yozuv shunga qarab harfma-harf yuradi.
 * Ovoz ishlamasa (tarmoq, brauzer) — matn uzunligiga qarab taxminiy vaqt bilan davom etadi.
 */
import { USTOZLAR } from "../kid/ustozlar.js";
const USTOZLAR_JINS = Object.fromEntries(Object.entries(USTOZLAR).map(([k, v]) => [k, v.lab]));

export function useUstozOvoz(apiBase, jins0 = "qiz", ustoz = "") {
  // REV402: ovoz ustozga mos — erkak ustoz erkak ovozida (ustoz keyinroq aniqlansa, ovoz.ustozQoy(u) bilan beriladi)
  const ustozRef = useRef(ustoz); if (ustoz) ustozRef.current = ustoz;
  const lab = USTOZLAR_JINS[ustozRef.current];
  const jins = lab ? (lab === "erkak" ? "ogil" : "qiz") : jins0;
  const audioRef = useRef(null);
  const runRef = useRef(0);
  const timerRef = useRef(0);
  const [speaking, setSpeaking] = useState(false);
  const [progress, setProgress] = useState(0);

  const hush = useCallback(() => {
    runRef.current += 1;
    clearInterval(timerRef.current);
    const a = audioRef.current; audioRef.current = null;
    if (a) { try { a.pause(); a.src = ""; } catch { /* bo'shatildi */ } }
    setSpeaking(false);
  }, []);

  const say = useCallback((text, done) => {
    hush();
    const my = runRef.current;
    const clean = speakableText(text);
    setProgress(0);
    if (!clean) { setProgress(1); done?.(); return; }
    setSpeaking(true);
    const finish = () => { if (my !== runRef.current) return; clearInterval(timerRef.current); setProgress(1); setSpeaking(false); audioRef.current = null; done?.(); };
    const fallback = () => {
      const ms = Math.min(14000, 800 + clean.length * 55), t0 = Date.now();
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        if (my !== runRef.current) { clearInterval(timerRef.current); return; }
        const p = Math.min(1, (Date.now() - t0) / ms);
        setProgress(p);
        if (p >= 1) finish();
      }, 60);
    };
    try {
      // REV270: ruscha/inglizcha matn — til tegi bilan (server shu tilning ovozini tanlaydi)
      const a = new Audio(`${String(apiBase).replace(/\/+$/, "")}/api/ovoz?k=133&${new URLSearchParams({ matn: ovozMatni(clean.slice(0, 1480)), jins })}`);
      audioRef.current = a;
      let failed = false;
      a.ontimeupdate = () => { if (my === runRef.current && a.duration && Number.isFinite(a.duration)) setProgress(Math.min(1, a.currentTime / a.duration)); };
      a.onended = finish;
      a.onerror = () => { if (!failed && my === runRef.current) { failed = true; fallback(); } };
      a.play().catch(() => { if (!failed && my === runRef.current) { failed = true; fallback(); } });
    } catch { fallback(); }
  }, [apiBase, hush, jins]);

  useEffect(() => hush, [hush]);
  const [, majbur] = useState(0);
  const ustozQoy = useCallback((u) => { if (u && ustozRef.current !== u) { ustozRef.current = u; majbur((x) => x + 1); } }, []);
  return useMemo(() => ({ say, hush, speaking, progress, ustozQoy }), [say, hush, speaking, progress, ustozQoy]);
}

/** Mikrofon: bir marta tinglab, eng ishonchli variantlarni qaytaradi. Brauzer qo'llamasa — mavjud=false. */
export function useMikrofon(lang = MIK_TIL[xbTil()] || "uz-UZ") {
  const recRef = useRef(null);
  const [tinglash, setTinglash] = useState(false);
  const [xato, setXato] = useState("");
  const R = typeof globalThis !== "undefined" ? (globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition) : null;
  const toxta = useCallback(() => { try { recRef.current?.abort(); } catch { /* yo'q */ } recRef.current = null; setTinglash(false); }, []);
  const tingla = useCallback((onNatija) => {
    if (!R) { setXato("Brauzeringiz ovozni tanimaydi — javobni yozing."); return; }
    toxta();
    setXato("");
    let done = false;
    const r = new R();
    recRef.current = r;
    r.lang = lang; r.interimResults = false; r.maxAlternatives = 5;
    r.onresult = (e) => {
      if (done) return; done = true;
      const alts = Array.from(e.results?.[0] || []).map((x) => x.transcript).filter(Boolean);
      setTinglash(false); recRef.current = null;
      onNatija?.(alts);
    };
    r.onerror = (e) => { if (!done) { done = true; setTinglash(false); setXato(e?.error === "not-allowed" ? "Mikrofonga ruxsat berilmagan." : "Eshitilmadi — qaytadan ayting yoki yozing."); } };
    r.onend = () => { if (!done) { done = true; setTinglash(false); } };
    try { r.start(); setTinglash(true); } catch { setTinglash(false); }
  }, [R, lang, toxta]);
  useEffect(() => toxta, [toxta]);
  return { mavjud: Boolean(R), tinglash, xato, tingla, toxta };
}

/** API so'rovi: xato bo'lsa server xabari bilan Error. */
export async function xbFetch(apiBase, path, token, { method = "GET", body, params } = {}) {
  const base = String(apiBase || "").replace(/\/+$/, "");
  // REV270: har so'rov o'quvchi tilida (uz/ru/en) — server shu tildagi kontent va shu tildagi natijalarni beradi
  const til = (params && params.til) || xbTil();
  const q = new URLSearchParams({ ...(params || {}), til, ...(method === "GET" ? { token } : {}) });
  const res = await fetch(`${base}${path}?${q}`, {
    method,
    headers: method === "GET" ? undefined : { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: method === "GET" ? undefined : JSON.stringify({ token, til, ...(body || {}) }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof data.detail === "string" ? data.detail : "Server xatosi");
  return data;
}
