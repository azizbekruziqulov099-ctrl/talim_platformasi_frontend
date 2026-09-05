import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Download, Loader2, MessageCircle, Search } from "lucide-react";

// Ranglar — maktab ish maydoni palitrasi bilan bir xil
const palette = {
  ink: "#21384C", muted: "#7A8794", line: "#E5E1D8", cream: "#F7F5F0", sky: "#EAF1F7", blue: "#1B4B7A",
  teal: "#0D7A77", green: "#2E6C55", mint: "#EEF6F1", greenBg: "#EEF6F1", red: "#B0553A", redBg: "#FFF0EC",
};
// =============================================================================
// KABUTAR — maktab ichidagi rasmiy aloqa (V2257). Rollar bo'yicha kim kimga yoza
// olishi serverda tekshiriladi; bu yerda faqat tez va qulay interfeys.
// =============================================================================
const KABUTAR_GROUPS = [
  ["rahbariyat", "Rahbariyat", "#1B4B7A"],
  ["sinf_rahbarlari", "Sinf rahbarlari", "#2E6C55"],
  ["oqituvchilar", "O‘qituvchilar", "#5B4B8A"],
  ["oquvchilar", "O‘quvchilar", "#8A5A1C"],
  ["ota_onalar", "Ota-onalar", "#B0553A"],
];
const kabutarInitials = name => String(name || "").trim().split(/\s+/).slice(0, 2).map(w => w[0] || "").join("").toUpperCase() || "•";
const kabutarTime = iso => { if (!iso) return ""; const d = new Date(iso); const today = new Date(); const same = d.toDateString() === today.toDateString(); return same ? d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }) : d.toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit" }) + " " + d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }); };

export default function KabutarPanel({ token, apiBase, maktabId = null, title = "Kabutar", onClose }) {
  const [directory, setDirectory] = useState(null);
  const [dirError, setDirError] = useState("");
  const [query, setQuery] = useState("");
  const [idQuery, setIdQuery] = useState("");
  const [idResult, setIdResult] = useState(null); const [idBusy, setIdBusy] = useState(false); const [idError, setIdError] = useState("");
  const searchById = async () => {
    const key = idQuery.replace(/[^0-9]/g, "").slice(-6);
    if (key.length !== 6) { setIdError("ID 6 xonali bo‘ladi: KB-123456"); return; }
    setIdBusy(true); setIdError(""); setIdResult(null);
    try {
      const r = await fetch(`${apiBase}/api/kabutar/izla?token=${encodeURIComponent(token)}&kabutar_id=KB-${key}`);
      const d = await r.json();
      if (!r.ok || d.detail) throw new Error(d.detail || "Topilmadi");
      setIdResult(d);
    } catch (e) { setIdError(e.message); } finally { setIdBusy(false); }
  };
  const [copied, setCopied] = useState(false);
  const copyMyId = async () => { try { await navigator.clipboard.writeText(directory?.men?.kabutar_id || ""); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* jim */ } };
  const [peer, setPeer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [peerSeenId, setPeerSeenId] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef(null); const chunksRef = useRef([]);
  const fileRef = useRef(null); const bodyRef = useRef(null);
  const lastIdRef = useRef(0); const peerRef = useRef(null);

  const loadDirectory = useCallback(async () => {
    try {
      const r = await fetch(`${apiBase}/api/kabutar/aloqalar_umumiy?token=${encodeURIComponent(token)}`);
      const d = await r.json();
      if (!r.ok || d.detail) throw new Error(d.detail || "Aloqalar yuklanmadi");
      if (maktabId && Array.isArray(d.muassasalar)) d.muassasalar.sort((a, b) => Number(b.turi === "maktab" && String(b.muassasa_id) === String(maktabId)) - Number(a.turi === "maktab" && String(a.muassasa_id) === String(maktabId)));
      setDirectory(d); setDirError("");
    } catch (e) { setDirError(e.message); }
  }, [apiBase, token, maktabId]);
  useEffect(() => { loadDirectory(); const t = setInterval(loadDirectory, 20000); return () => clearInterval(t); }, [loadDirectory]);

  const markSeen = useCallback(async (peerId, lastId) => {
    if (!lastId) return;
    try { await fetch(`${apiBase}/api/chat/korildi_belgila?token=${encodeURIComponent(token)}&boshqa_user_id=${peerId}&oxirgi_xabar_id=${lastId}`, { method: "POST" }); } catch { /* jim */ }
  }, [apiBase, token]);

  const loadMessages = useCallback(async (peerId, { incremental = false } = {}) => {
    try {
      const qs = new URLSearchParams({ token, boshqa_user_id: String(peerId) });
      if (maktabId) qs.set("maktab_id", String(maktabId));
      if (incremental && lastIdRef.current) qs.set("keyingidan", String(lastIdRef.current));
      const r = await fetch(`${apiBase}/api/kabutar/xabarlar?${qs}`);
      const d = await r.json();
      if (!r.ok || d.detail) throw new Error(d.detail || "Xabarlar yuklanmadi");
      if (peerRef.current !== peerId) return;
      const rows = d.xabarlar || [];
      setPeerSeenId(d.qarshi_tomon_korgan_id || null);
      if (rows.length) {
        setMessages(old => incremental ? [...old, ...rows.filter(x => !old.some(o => o.id === x.id))] : rows);
        lastIdRef.current = Math.max(lastIdRef.current, ...rows.map(x => x.id));
        const incoming = rows.filter(x => !x.meniki);
        if (incoming.length) { markSeen(peerId, lastIdRef.current); loadDirectory(); }
        requestAnimationFrame(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; });
      } else if (!incremental) { setMessages([]); }
    } catch (e) { setSendError(e.message); }
  }, [apiBase, token, maktabId, markSeen, loadDirectory]);

  const openPeer = item => { peerRef.current = item.user_id; lastIdRef.current = 0; setPeer(item); setMessages([]); setSendError(""); loadMessages(item.user_id); };
  useEffect(() => { if (!peer) return undefined; const t = setInterval(() => loadMessages(peer.user_id, { incremental: true }), 6000); return () => clearInterval(t); }, [peer, loadMessages]);

  const send = async ({ file = null, fileKind = null } = {}) => {
    if (!peer || sending) return;
    const body = text.trim();
    if (!body && !file) return;
    setSending(true); setSendError("");
    try {
      const form = new FormData();
      form.append("token", token); form.append("qabul_qiluvchi_user_id", String(peer.user_id));
      if (maktabId) form.append("maktab_id", String(maktabId));
      if (peer.kabutar_id) form.append("kabutar_id", peer.kabutar_id);
      if (body) form.append("matn", body);
      if (file) { form.append("fayl_turi", fileKind); form.append("fayl", file, file.name || `${fileKind}.webm`); }
      const r = await fetch(`${apiBase}/api/kabutar/yubor`, { method: "POST", body: form });
      const d = await r.json();
      if (!r.ok || d.detail) throw new Error(d.detail || "Yuborilmadi");
      setText("");
      setMessages(old => [...old, { id: d.id, meniki: true, matn: d.matn, fayl_turi: d.fayl_turi, fayl_nomi: d.fayl_nomi, fayl_hajmi_kb: d.fayl_hajmi_kb, yaratilgan_at: d.yaratilgan_at, yuboruvchi_user_id: directory?.men?.user_id }]);
      lastIdRef.current = Math.max(lastIdRef.current, d.id);
      requestAnimationFrame(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; });
    } catch (e) { setSendError(e.message); } finally { setSending(false); }
  };

  const toggleRecord = async () => {
    if (recording) { recorderRef.current?.stop(); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const rec = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : undefined });
      rec.ondataavailable = e => { if (e.data.size) chunksRef.current.push(e.data); };
      rec.onstop = () => { stream.getTracks().forEach(t => t.stop()); setRecording(false); const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" }); if (blob.size > 800) send({ file: new File([blob], "ovoz.webm", { type: blob.type }), fileKind: "audio" }); };
      recorderRef.current = rec; rec.start(); setRecording(true);
    } catch { setSendError("Mikrofon ochilmadi — brauzer ruxsatini tekshiring"); }
  };
  const onPickFile = e => {
    const f = e.target.files?.[0]; e.target.value = "";
    if (!f) return;
    const kind = f.type.startsWith("audio/") ? "audio" : f.type.startsWith("video/") ? "video" : "hujjat";
    send({ file: f, fileKind: kind });
  };

  const q = query.trim().toLocaleLowerCase("uz");

  const totalUnread = directory?.jami_oqilmagan || 0;
  const meName = directory?.men?.full_name || "";

  return <div className="min-h-screen" style={{ background: palette.cream }}>
    <div className="px-4 md:px-7 py-4 flex items-center justify-between gap-3 border-b bg-white" style={{ borderColor: palette.line }}>
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onClose} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: palette.sky, color: palette.blue }}><ArrowLeft size={18}/></button>
        <div className="min-w-0"><div className="text-[10px] font-black uppercase tracking-[.14em]" style={{ color: palette.teal }}>Kabutar · rasmiy aloqa</div><div className="text-lg font-black truncate" style={{ color: palette.ink }}>{title}</div></div>
      </div>
      <div className="flex items-center gap-2">{totalUnread > 0 && <span className="px-2.5 py-1 rounded-full text-xs font-black text-white" style={{ background: palette.red }}>{totalUnread} yangi</span>}{directory?.men && <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: palette.sky }}><div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black text-white" style={{ background: palette.blue }}>{kabutarInitials(meName)}</div><div className="text-xs"><div className="font-black" style={{ color: palette.ink }}>{meName}</div><div className="max-w-[260px] truncate" style={{ color: palette.muted }}>{directory.men.qisqa}</div></div><button onClick={copyMyId} title="Mening Kabutar ID — nusxalash. Boshqalar sizni shu ID bilan topadi" className="ml-2 px-2.5 py-1.5 rounded-lg text-[11px] font-black" style={{ background: palette.blue, color: "#fff" }}>{copied ? "Nusxalandi ✓" : directory.men.kabutar_id || "ID"}</button></div>}</div>
    </div>
    <div className="grid md:grid-cols-[340px_1fr] gap-0 md:h-[calc(100vh-73px)]">
      <aside className={`border-r bg-white overflow-y-auto ${peer ? "hidden md:block" : ""}`} style={{ borderColor: palette.line }}>
        <div className="p-3 sticky top-0 bg-white z-10 border-b" style={{ borderColor: palette.line }}><div className="relative"><Search size={15} className="absolute left-3 top-2.5" style={{ color: palette.muted }}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Ism, lavozim yoki sinf..." className="w-full pl-9 pr-3 py-2 rounded-xl border text-sm outline-none" style={{ borderColor: palette.line }}/></div></div>
        {dirError && <div className="m-3 p-3 rounded-xl text-xs" style={{ background: palette.redBg, color: palette.red }}>{dirError}</div>}
        {!directory && !dirError && <div className="p-6 text-center"><Loader2 className="mx-auto animate-spin" style={{ color: palette.blue }}/></div>}
        {directory && <div className="p-3 border-b" style={{ borderColor: palette.line, background: "#FBFAF7" }}>
          <div className="text-[10px] font-black uppercase tracking-[.12em] mb-1.5" style={{ color: palette.muted }}>ID bo‘yicha topish</div>
          <div className="flex gap-1.5"><input value={idQuery} onChange={e => setIdQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && searchById()} placeholder="KB-123456" className="flex-1 px-3 py-2 rounded-xl border text-sm outline-none" style={{ borderColor: palette.line }}/><button onClick={searchById} disabled={idBusy} className="px-3 rounded-xl text-sm font-black text-white" style={{ background: palette.blue }}>{idBusy ? "..." : "Top"}</button></div>
          {idError && <div className="mt-1.5 text-[11px] font-bold" style={{ color: palette.red }}>{idError}</div>}
          {idResult && <button onClick={() => { openPeer({ user_id: idResult.user_id, full_name: idResult.full_name, izoh: idResult.qisqa, rol: "tashqi", kabutar_id: idResult.kabutar_id }); setIdResult(null); setIdQuery(""); }} className="mt-2 w-full text-left rounded-xl border p-2.5" style={{ borderColor: palette.green, background: palette.mint }}><div className="text-sm font-black" style={{ color: palette.ink }}>{idResult.full_name} <span className="text-[10px]" style={{ color: palette.green }}>✓ {idResult.kabutar_id}</span></div>{idResult.rollar.map((r, i) => <div key={i} className="text-[11px]" style={{ color: palette.muted }}>{r.rol}{r.muassasa ? ` — ${r.muassasa}` : ""}</div>)}<div className="text-[10px] mt-1 font-black" style={{ color: palette.blue }}>Xabar yozish ›</div></button>}
        </div>}
        {directory && (() => { const list = (directory.suhbatlar || []).filter(x => !q || String(x.full_name).toLocaleLowerCase("uz").includes(q) || String(x.izoh || "").toLocaleLowerCase("uz").includes(q)); if (!list.length) return null; return <div>
          <div className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-[.12em]" style={{ color: palette.ink }}>Suhbatlarim</div>
          {list.map(item => <button key={`s-${item.user_id}`} onClick={() => openPeer({ ...item, rol: item.tashqi ? "tashqi" : "suhbat" })} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50" style={{ background: peer?.user_id === item.user_id ? palette.sky : undefined }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0" style={{ background: item.tashqi ? "#5A5648" : palette.blue }}>{kabutarInitials(item.full_name)}</div>
            <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><div className="text-sm font-black truncate" style={{ color: palette.ink }}>{item.full_name}</div>{item.oxirgi_xabar_at && <span className="text-[10px] shrink-0" style={{ color: palette.muted }}>{kabutarTime(item.oxirgi_xabar_at)}</span>}</div><div className="text-[11px] truncate" style={{ color: palette.muted }}>{item.izoh ? item.izoh + " · " : ""}{item.oxirgi_meniki ? "Siz: " : ""}{item.oxirgi_matn}</div></div>
            {item.oqilmagan > 0 && <span className="min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-black text-white flex items-center justify-center" style={{ background: palette.red }}>{item.oqilmagan}</span>}
          </button>)}
        </div>; })()}
        {directory && (directory.muassasalar || []).map(m => { const groupsHere = KABUTAR_GROUPS.map(([key, label, color]) => [key, label, color, (m.azolar || []).filter(a => a.guruh === key && (!q || String(a.full_name).toLocaleLowerCase("uz").includes(q) || String(a.izoh || "").toLocaleLowerCase("uz").includes(q)))]).filter(g => g[3].length); if (!groupsHere.length) return null; return <div key={`${m.turi}-${m.muassasa_id}`}>
          <div className="px-4 pt-4 pb-1 text-[11px] font-black flex items-center gap-2" style={{ color: palette.ink }}><span>{({ maktab: "🏫", institut: "🎓", markaz: "📚", bogcha: "🧸" })[m.turi] || "🏢"}</span><span className="truncate">{m.muassasa}</span></div>
          {groupsHere.map(([key, label, color, items]) => <div key={key}>
            <div className="px-4 pt-2 pb-1 text-[10px] font-black uppercase tracking-[.12em] flex items-center justify-between" style={{ color }}>{label}<span style={{ color: palette.muted }}>{items.length}</span></div>
            {items.map(item => <button key={item.user_id} onClick={() => openPeer({ ...item, rol: key })} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50" style={{ background: peer?.user_id === item.user_id ? palette.sky : undefined }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0" style={{ background: color }}>{kabutarInitials(item.full_name)}</div>
              <div className="min-w-0 flex-1"><div className="text-sm font-black truncate" style={{ color: palette.ink }}>{item.full_name} <span className="text-[10px] font-semibold" style={{ color: palette.green }}>✓</span></div><div className="text-[11px] truncate" style={{ color: palette.muted }}>{item.izoh}</div></div>
              {item.oqilmagan > 0 && <span className="min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-black text-white flex items-center justify-center" style={{ background: palette.red }}>{item.oqilmagan}</span>}
            </button>)}
          </div>)}
        </div>; })}
        {directory && !(directory.suhbatlar || []).length && !(directory.muassasalar || []).some(m => (m.azolar || []).length) && <div className="p-6 text-center text-xs" style={{ color: palette.muted }}>Hozircha aloqalar yo‘q — yuqorida ID bo‘yicha toping.</div>}
      </aside>
      <section className={`flex flex-col ${peer ? "" : "hidden md:flex"}`} style={{ minHeight: 420 }}>
        {!peer && <div className="flex-1 flex items-center justify-center p-8 text-center"><div><div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-3" style={{ background: palette.sky }}><MessageCircle size={28} style={{ color: palette.blue }}/></div><div className="font-black" style={{ color: palette.ink }}>Suhbatdoshni tanlang</div><p className="text-xs mt-1 max-w-xs" style={{ color: palette.muted }}>Ro‘yxatda muassasalaringiz bo‘yicha rasmiy suhbatdoshlar. Boshqa odamni — uning Kabutar ID si bilan toping. Xabar yuboruvchining kimligi (ism, lavozim, muassasa) har doim ko‘rinadi.</p></div></div>}
        {peer && <>
          <div className="px-4 py-3 bg-white border-b flex items-center gap-3" style={{ borderColor: palette.line }}>
            <button onClick={() => { setPeer(null); peerRef.current = null; }} className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: palette.sky, color: palette.blue }}><ArrowLeft size={16}/></button>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white" style={{ background: peer.rol === "tashqi" ? "#5A5648" : (KABUTAR_GROUPS.find(g => g[0] === peer.rol) || [])[2] || palette.blue }}>{kabutarInitials(peer.full_name)}</div>
            <div className="min-w-0"><div className="font-black truncate" style={{ color: palette.ink }}>{peer.full_name} <span className="text-[10px]" style={{ color: palette.green }}>✓ rasmiy profil</span></div><div className="text-[11px] truncate" style={{ color: palette.muted }}>{peer.izoh}</div></div>
          </div>
          <div ref={bodyRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2" style={{ background: "linear-gradient(180deg,#F7F5F0,#FBFAF7)" }}>
            {!messages.length && <div className="text-center text-xs py-10" style={{ color: palette.muted }}>Hali xabar yo‘q — birinchisini yozing.</div>}
            {messages.map(m => <div key={m.id} className={`flex ${m.meniki ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[78%] rounded-2xl px-3.5 py-2.5 shadow-sm" style={m.meniki ? { background: palette.blue, color: "#fff", borderBottomRightRadius: 6 } : { background: "#fff", color: palette.ink, borderBottomLeftRadius: 6, border: `1px solid ${palette.line}` }}>
                {m.matn && <div className="text-sm whitespace-pre-wrap break-words">{m.matn}</div>}
                {m.fayl_turi === "audio" && <audio controls preload="none" className="mt-1 w-56 max-w-full" src={`${apiBase}/api/chat/fayl/${m.id}?token=${encodeURIComponent(token)}`}/>}
                {m.fayl_turi === "video" && <video controls preload="metadata" className="mt-1 w-64 max-w-full rounded-lg" src={`${apiBase}/api/chat/fayl/${m.id}?token=${encodeURIComponent(token)}`}/>}
                {m.fayl_turi === "hujjat" && <a href={`${apiBase}/api/chat/fayl/${m.id}?token=${encodeURIComponent(token)}`} target="_blank" rel="noreferrer" className="mt-1 flex items-center gap-2 text-xs font-black underline"><Download size={14}/> {m.fayl_nomi || "Hujjat"}{m.fayl_hajmi_kb ? ` · ${m.fayl_hajmi_kb} KB` : ""}</a>}
                <div className="mt-1 text-[10px] text-right" style={{ opacity: .75 }}>{kabutarTime(m.yaratilgan_at)}{m.meniki ? (peerSeenId && m.id <= peerSeenId ? " · ✓✓ ko‘rildi" : " · ✓") : ""}</div>
              </div>
            </div>)}
          </div>
          {sendError && <div className="mx-4 mb-2 p-2 rounded-xl text-xs" style={{ background: palette.redBg, color: palette.red }}>{sendError}</div>}
          <div className="p-3 bg-white border-t flex items-end gap-2" style={{ borderColor: palette.line }}>
            <input ref={fileRef} type="file" accept="audio/*,video/*,.pdf,.jpg,.jpeg,.png,.webp,.docx,.xlsx" className="hidden" onChange={onPickFile}/>
            <button onClick={() => fileRef.current?.click()} disabled={sending} title="Fayl: hujjat, rasm, video, audio" className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: palette.sky, color: palette.blue }}>📎</button>
            <button onClick={toggleRecord} disabled={sending} title={recording ? "To‘xtatish va yuborish" : "Ovozli xabar"} className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: recording ? palette.red : palette.sky, color: recording ? "#fff" : palette.blue }}>{recording ? "■" : "🎙"}</button>
            <textarea value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} rows={1} placeholder={`${peer.full_name.split(" ")[0]}ga rasmiy xabar... (Enter — yuborish)`} className="flex-1 resize-none px-3 py-2.5 rounded-xl border text-sm outline-none max-h-32" style={{ borderColor: palette.line }}/>
            <button onClick={() => send()} disabled={sending || !text.trim()} className="h-10 px-4 rounded-xl text-sm font-black text-white shrink-0 disabled:opacity-50" style={{ background: palette.blue }}>{sending ? "..." : "Yuborish"}</button>
          </div>
        </>}
      </section>
    </div>
  </div>;
}
