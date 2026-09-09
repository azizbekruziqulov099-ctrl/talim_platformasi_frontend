import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Copy, Download, Forward, Loader2, MessageCircle, Pencil, Reply, Search, Smile, Trash2, Video } from "lucide-react";
import KabutarAccount, { KabutarAccountButton, useKabutarPreferences } from "./KabutarAccount.jsx";
import { kabutarRequest, normalizeKabutarId } from "./kabutarAccountRules.js";
import KabutarMediaComposer from "./KabutarMediaComposer.jsx";
import { isPhotoMessage } from "./kabutarMediaRules.js";

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

export const KABUTAR_TURI = {
  maktab: { ikon: "🏫", nom: "Maktab", rang: "#1B4B7A", yengil: "#EAF1F7" },
  universitet: { ikon: "🎓", nom: "Institut", rang: "#5B4B8A", yengil: "#F1EEF8" },
  institut: { ikon: "🎓", nom: "Institut", rang: "#5B4B8A", yengil: "#F1EEF8" },
  bogcha: { ikon: "🧸", nom: "Bog‘cha", rang: "#B0553A", yengil: "#FFF0EC" },
  markaz: { ikon: "📚", nom: "Ta’lim markazi", rang: "#0D7A77", yengil: "#E8F5F4" },
};
export default function KabutarPanel({ token, apiBase, maktabId = null, title = "Kabutar", onClose, docked = false, onUnread = null, scope = null, showScopeStrip = true }) {
  // scope: { turi, muassasa_id } — faqat shu muassasa Kabutari; null — hammasi
  const [scopeKey, setScopeKey] = useState(scope ? `${scope.turi}:${scope.muassasa_id}` : "all");
  useEffect(() => { if (scope) setScopeKey(`${scope.turi}:${scope.muassasa_id}`); }, [scope?.turi, scope?.muassasa_id]);
  const [directory, setDirectory] = useState(null);
  const [accountView, setAccountView] = useState(null);
  const preferences = useKabutarPreferences(directory?.men?.user_id, apiBase);
  const [chatDirectory, setChatDirectory] = useState({ guruhlar: [], shaxsiylar: [] });
  const [listTab, setListTab] = useState("all");
  const [dirError, setDirError] = useState("");
  const [query, setQuery] = useState("");
  const [idQuery, setIdQuery] = useState("");
  const [idResult, setIdResult] = useState(null); const [idBusy, setIdBusy] = useState(false); const [idError, setIdError] = useState("");
  const searchById = async () => {
    const key = normalizeKabutarId(idQuery);
    if (!key) { setIdError("ID 6–10 xonali raqam: masalan KB-56928957"); return; }
    if (key === directory?.men?.kabutar_id) { setAccountView({ page: "profile" }); return; }
    setIdBusy(true); setIdError(""); setIdResult(null);
    try {
      const d = await kabutarRequest(apiBase, `/api/kabutar/izla?kabutar_id=${encodeURIComponent(key)}`, token);
      setIdResult(d);
    } catch (e) { setIdError(e.message); } finally { setIdBusy(false); }
  };
  const [peer, setPeer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [peerSeenId, setPeerSeenId] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [editing, setEditing] = useState(null);
  const [menuMessage, setMenuMessage] = useState(null);
  const [forwarding, setForwarding] = useState(null);
  const [mediaBusy, setMediaBusy] = useState(false);
  const sendGate = useRef(false); const authRef = useRef(token); authRef.current = token;
  const bodyRef = useRef(null);
  const lastIdRef = useRef(0); const peerRef = useRef(null);

  useEffect(() => { setAccountView(null); setDirectory(null); setChatDirectory({ guruhlar: [], shaxsiylar: [] }); setPeer(null); peerRef.current = null; setMessages([]); }, [apiBase, token]);

  const loadDirectory = useCallback(async ({ signal } = {}) => {
    try {
      const [people, chats] = await Promise.allSettled([
        kabutarRequest(apiBase, "/api/kabutar/aloqalar_umumiy", token, { signal }),
        kabutarRequest(apiBase, "/api/chat/guruhlarim", token, { signal }),
      ]);
      if (signal?.aborted) return;
      if (people.status === "rejected") throw people.reason;
      const d = people.value;
      if (chats.status === "fulfilled") setChatDirectory(chats.value);
      if (maktabId && Array.isArray(d.muassasalar)) d.muassasalar.sort((a, b) => Number(b.turi === "maktab" && String(b.muassasa_id) === String(maktabId)) - Number(a.turi === "maktab" && String(a.muassasa_id) === String(maktabId)));
      setDirectory(d); setDirError("");
      if (onUnread) onUnread(Number(d.jami_oqilmagan || 0));
    } catch (e) { if (!signal?.aborted) setDirError(e.message); }
  }, [apiBase, token, maktabId, onUnread]);
  useEffect(() => { const controller = new AbortController(); const refresh = () => loadDirectory({ signal: controller.signal }); refresh(); const t = setInterval(refresh, 20000); return () => { clearInterval(t); controller.abort(); }; }, [loadDirectory]);

  const markSeen = useCallback(async (peerId, lastId, groupId = null) => {
    if (!lastId) return;
    const target = groupId ? `guruh_id=${groupId}` : `boshqa_user_id=${peerId}`;
    try { await fetch(`${apiBase}/api/chat/korildi_belgila?token=${encodeURIComponent(token)}&${target}&oxirgi_xabar_id=${lastId}`, { method: "POST" }); } catch { /* jim */ }
  }, [apiBase, token]);

  const loadMessages = useCallback(async (peerId, { incremental = false } = {}) => {
    try {
      const current = peerRef.current;
      const groupId = current?.guruh_id;
      const qs = new URLSearchParams({ token });
      if (groupId) qs.set("guruh_id", String(groupId));
      else qs.set("boshqa_user_id", String(peerId));
      if (maktabId) qs.set("maktab_id", String(maktabId));
      if (incremental && lastIdRef.current) qs.set("keyingidan", String(lastIdRef.current));
      const r = await fetch(`${apiBase}${groupId ? "/api/chat/xabarlar" : "/api/kabutar/xabarlar"}?${qs}`);
      const d = await r.json();
      if (!r.ok || d.detail) throw new Error(d.detail || "Xabarlar yuklanmadi");
      if (!peerRef.current || (groupId ? String(peerRef.current.guruh_id) !== String(groupId) : peerRef.current.guruh_id || Number(peerRef.current.user_id) !== Number(peerId))) return;
      const rows = d.xabarlar || [];
        setPeerSeenId(d.boshqa_tomon_korgan_id || d.qarshi_tomon_korgan_id || null);
      if (rows.length) {
        setMessages(old => incremental ? [...old, ...rows.filter(x => !old.some(o => o.id === x.id))] : rows);
        lastIdRef.current = Math.max(lastIdRef.current, ...rows.map(x => x.id));
        const incoming = rows.filter(x => !x.meniki);
        if (incoming.length) { markSeen(peerId, lastIdRef.current, groupId); loadDirectory(); }
        requestAnimationFrame(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; });
      } else if (!incremental) { setMessages([]); }
    } catch (e) { setSendError(e.message); }
  }, [apiBase, token, maktabId, markSeen, loadDirectory]);

  const forwardTo = async item => {
    const params = new URLSearchParams({ token, xabar_id: String(forwarding.id) });
    if (item.guruh_id) params.set("guruh_id", String(item.guruh_id));
    else params.set("qabul_qiluvchi_user_id", String(item.user_id));
    const r = await fetch(`${apiBase}/api/chat/xabar_forward?${params}`, { method: "POST" });
    const d = await r.json();
    if (!r.ok || d.detail) throw new Error(d.detail || "Xabar uzatilmadi");
    setForwarding(null); setMenuMessage(null); await loadDirectory();
  };
  const openPeer = item => {
    if (forwarding) { forwardTo(item).catch(error => setSendError(error.message)); return; }
    peerRef.current = item; lastIdRef.current = 0; setPeer(item); setMessages([]); setReplyTo(null); setEditing(null); setSendError(""); loadMessages(item.user_id || 0);
  };
  useEffect(() => { if (!peer) return undefined; const t = setInterval(() => loadMessages(peer.user_id || 0, { incremental: true }), 6000); return () => clearInterval(t); }, [peer, loadMessages]);

  const send = async ({ file = null, fileKind = null, caption } = {}) => {
    if (!peer || sendGate.current) return false;
    const body = (caption === undefined ? text : caption).trim();
    if (!body && !file) return false;
    const recipient = peerRef.current; const auth = token;
    const isCurrent = () => peerRef.current === recipient && authRef.current === auth;
    sendGate.current = true;
    const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 120000);
    setSending(true); setSendError("");
    try {
      if (editing && !file) {
        const r = await fetch(`${apiBase}/api/chat/xabar_tahrirla`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, xabar_id: editing.id, yangi_matn: body }), signal: controller.signal,
        });
        const d = await r.json();
        if (!r.ok || d.detail) throw new Error(d.detail || "Xabar o‘zgartirilmadi");
        if (!isCurrent()) return true;
        setMessages(old => old.map(item => item.id === editing.id ? { ...item, matn: body, tahrirlangan: true } : item));
        setText(""); setEditing(null); return true;
      }
      const form = new FormData();
      form.append("token", token);
      if (peer.guruh_id) form.append("guruh_id", String(peer.guruh_id));
      else form.append("qabul_qiluvchi_user_id", String(peer.user_id));
      if (!peer.guruh_id && maktabId) form.append("maktab_id", String(maktabId));
      if (!peer.guruh_id && peer.kabutar_id) form.append("kabutar_id", peer.kabutar_id);
      if (body) form.append("matn", body);
      if (replyTo) form.append("javob_xabar_id", String(replyTo.id));
      if (file) { form.append("fayl_turi", fileKind); form.append("fayl", file, file.name || `${fileKind}.webm`); }
      const endpoint = peer.guruh_id ? "/api/chat/xabar_yubor" : "/api/kabutar/yubor";
      const r = await fetch(`${apiBase}${endpoint}`, { method: "POST", body: form, signal: controller.signal });
      const d = await r.json();
      if (!r.ok || d.detail) throw new Error(d.detail || "Yuborilmadi");
      if (!isCurrent()) return true;
      if (caption === undefined) setText(""); setReplyTo(null);
      setMessages(old => [...old.filter(item => item.id !== d.id), { id: d.id, meniki: true, matn: d.matn ?? (body || null), fayl_turi: d.fayl_turi ?? fileKind, fayl_nomi: d.fayl_nomi ?? file?.name, fayl_hajmi_kb: d.fayl_hajmi_kb, yaratilgan_at: d.yaratilgan_at || new Date().toISOString(), yuboruvchi_user_id: directory?.men?.user_id, javob_xabar_id: replyTo?.id, javob_yuboruvchi_ismi: replyTo?.yuboruvchi_ismi, javob_matn_qisqa: replyTo?.matn }]);
      lastIdRef.current = Math.max(lastIdRef.current, d.id);
      requestAnimationFrame(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; });
      return true;
    } catch (e) { if (isCurrent()) setSendError(e.name === "AbortError" ? "Server javobi kelmadi. Qayta yuborishdan oldin xabar yetib borganini tekshiring." : e.message); return false; }
    finally { clearTimeout(timeout); sendGate.current = false; setSending(false); }
  };

  const removeMessage = async message => {
    if (!message?.meniki) return;
    try {
      const r = await fetch(`${apiBase}/api/chat/xabar_ochir?token=${encodeURIComponent(token)}&xabar_id=${message.id}`, { method: "DELETE" });
      const d = await r.json();
      if (!r.ok || d.detail) throw new Error(d.detail || "Xabar o‘chirilmadi");
      setMessages(old => old.filter(item => item.id !== message.id));
      setMenuMessage(null);
    } catch (e) { setSendError(e.message); }
  };

  const reactTo = async (message, emoji) => {
    try {
      const params = new URLSearchParams({ token, xabar_id: String(message.id), emoji });
      const r = await fetch(`${apiBase}/api/chat/reaksiya_qoy?${params}`, { method: "PUT" });
      const d = await r.json();
      if (!r.ok || d.detail) throw new Error(d.detail || "Reaksiya qo‘yilmadi");
      await loadMessages(peer.user_id || 0);
      setMenuMessage(null);
    } catch (e) { setSendError(e.message); }
  };

  const q = query.trim().toLocaleLowerCase("uz");
  const allMuassasalar = directory?.muassasalar || [];
  const scopeList = allMuassasalar.map(m => ({ key: `${m.turi}:${m.muassasa_id}`, ...m }));
  const activeScope = scopeKey === "all" ? null : scopeList.find(m => m.key === scopeKey) || null;
  const scopedMuassasalar = activeScope ? [activeScope] : allMuassasalar;
  const scopedIds = activeScope ? new Set((activeScope.azolar || []).map(a => String(a.user_id))) : null;
  const scopedSuhbatlar = (directory?.suhbatlar || []).filter(x => !scopedIds || scopedIds.has(String(x.user_id)) || x.tashqi);
  const scopeMeta = activeScope ? (KABUTAR_TURI[activeScope.turi] || KABUTAR_TURI.maktab) : null;
  const accent = scopeMeta ? scopeMeta.rang : palette.blue;
  const visibleGroups = (chatDirectory.guruhlar || []).filter(group => {
    if (activeScope && group.manba_turi !== "global") {
      const sameInstitution = String(group.scope_turi || group.manba_turi) === String(activeScope.turi) && String(group.scope_id ?? group.manba_id) === String(activeScope.muassasa_id);
      if (!sameInstitution) return false;
    }
    if (listTab === "personal") return false;
    return !q || String(group.nomi || "").toLocaleLowerCase("uz").includes(q);
  });

  const totalUnread = directory?.jami_oqilmagan || 0;

  return <div className={`kb-panel ${docked ? "h-full flex flex-col" : "min-h-screen"}`} style={{ background: palette.cream }}>
    <div className={`kb-panel-header ${docked ? "px-3 py-2.5" : "px-4 md:px-7 py-4"} flex items-center justify-between gap-3 border-b bg-white shrink-0`} style={{ borderColor: palette.line }}>
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onClose} title={docked ? "Yig‘ish" : "Yopish"} className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: palette.sky, color: palette.blue }}>{docked ? "▾" : <ArrowLeft size={18}/>}</button>
        <div className="min-w-0"><div className="text-[10px] font-black uppercase tracking-[.14em]" style={{ color: accent }}>🕊 {activeScope ? `${scopeMeta.ikon} ${activeScope.muassasa} Kabutari` : "Kabutar · barcha muassasalar"}</div>{!docked && <div className="text-lg font-black truncate" style={{ color: palette.ink }}>{activeScope ? `${scopeMeta.nom} — rasmiy aloqa` : title}</div>}</div>
      </div>
      <div className="kb-header-account flex items-center gap-2"><KabutarAccountButton me={directory?.men} apiBase={apiBase} onProfile={() => setAccountView({ page: "profile" })} onSettings={() => setAccountView({ page: "settings" })}/>{totalUnread > 0 && <span className="px-2.5 py-1 rounded-full text-xs font-black text-white shrink-0" style={{ background: palette.red }}>{totalUnread} yangi</span>}</div>
    </div>
    {forwarding && <div className="px-4 py-2 flex items-center justify-between gap-3 text-xs font-bold text-white" style={{ background: palette.teal }}><span><Forward size={14} className="inline mr-1"/>Xabarni uzatish uchun guruh yoki odamni tanlang</span><button onClick={() => setForwarding(null)} className="px-2 py-1 rounded-lg bg-white/20">Bekor qilish</button></div>}
    <div className={docked ? "flex-1 min-h-0 flex flex-col" : "grid md:grid-cols-[340px_1fr] gap-0 md:h-[calc(100vh-73px)]"}>
      <aside className={`bg-white overflow-y-auto ${docked ? (peer ? "hidden" : "flex-1 min-h-0") : `border-r ${peer ? "hidden md:block" : ""}`}`} style={{ borderColor: palette.line }}>
        <div className="p-3 sticky top-0 bg-white z-10 border-b" style={{ borderColor: palette.line }}><div className="relative"><Search size={15} className="absolute left-3 top-2.5" style={{ color: palette.muted }}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Chat, guruh, ism yoki lavozim..." className="w-full pl-9 pr-3 py-2 rounded-xl border text-sm outline-none" style={{ borderColor: palette.line }}/></div><div className="flex gap-1 mt-2 overflow-x-auto">{[["all","Barchasi"],["groups","Guruhlar"],["personal","Shaxsiy"]].map(([key,label]) => <button key={key} onClick={() => setListTab(key)} className="px-3 py-1.5 rounded-full text-[11px] font-black whitespace-nowrap" style={listTab === key ? { background: accent, color: "#fff" } : { background: palette.sky, color: palette.blue }}>{label}</button>)}</div></div>
        {dirError && <div className="m-3 p-3 rounded-xl text-xs" style={{ background: palette.redBg, color: palette.red }}>{dirError}</div>}
        {!directory && !dirError && <div className="p-6 text-center"><Loader2 className="mx-auto animate-spin" style={{ color: palette.blue }}/></div>}
        {directory && showScopeStrip && scopeList.length > 0 && <div className="p-3 border-b" style={{ borderColor: palette.line, background: "#fff" }}>
          <div className="text-[10px] font-black uppercase tracking-[.12em] mb-1.5" style={{ color: palette.muted }}>Qaysi muassasa Kabutari</div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {[{ key: "all", turi: null, muassasa: "Hammasi" }, ...scopeList].map(m => { const meta = m.turi ? (KABUTAR_TURI[m.turi] || KABUTAR_TURI.maktab) : { ikon: "🕊", rang: palette.ink, yengil: palette.cream }; const on = scopeKey === m.key; const unread = m.turi ? (m.azolar || []).reduce((sum, a) => sum + Number(a.oqilmagan || 0), 0) : (directory.jami_oqilmagan || 0); return <button key={m.key} type="button" onClick={() => { setScopeKey(m.key); setPeer(null); peerRef.current = null; }} className="shrink-0 rounded-xl border px-2.5 py-1.5 text-left transition" style={on ? { background: meta.rang, borderColor: meta.rang, color: "#fff", transform: "scale(1.04)" } : { background: meta.yengil, borderColor: palette.line, color: palette.ink }} title={m.muassasa}><div className="text-[11px] font-black whitespace-nowrap max-w-[150px] truncate">{meta.ikon} {m.muassasa}{unread > 0 && <span className="ml-1 inline-flex min-w-[16px] h-4 px-1 rounded-full text-[9px] items-center justify-center" style={{ background: on ? "rgba(255,255,255,.25)" : palette.red, color: "#fff" }}>{unread}</span>}</div></button>; })}
          </div>
        </div>}
        {directory && <div className="p-3 border-b" style={{ borderColor: palette.line, background: "#FBFAF7" }}>
          <div className="text-[10px] font-black uppercase tracking-[.12em] mb-1.5" style={{ color: palette.muted }}>ID bo‘yicha topish</div>
          <div className="flex gap-1.5"><input value={idQuery} onChange={e => setIdQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && searchById()} placeholder="KB-123456" className="min-w-0 flex-1 px-3 py-2 rounded-xl border text-sm outline-none" style={{ borderColor: palette.line }}/><button onClick={searchById} disabled={idBusy} className="px-3 rounded-xl text-sm font-black text-white" style={{ background: palette.blue }}>{idBusy ? "..." : "Top"}</button></div>
          {idError && <div className="mt-1.5 text-[11px] font-bold" style={{ color: palette.red }}>{idError}</div>}
          {idResult && <button onClick={() => { setAccountView({ page: "profile", person: { ...idResult, izoh: idResult.qisqa, rol: "tashqi" } }); setIdResult(null); setIdQuery(""); }} className="mt-2 w-full text-left rounded-xl border p-2.5" style={{ borderColor: palette.green, background: palette.mint }}><div className="text-sm font-black" style={{ color: palette.ink }}>{idResult.full_name} <span className="text-[10px]" style={{ color: palette.green }}>✓ {idResult.kabutar_id}</span></div>{(idResult.rollar || []).map((r, i) => <div key={i} className="text-[11px]" style={{ color: palette.muted }}>{r.rol}{r.muassasa ? ` — ${r.muassasa}` : ""}</div>)}<div className="text-[10px] mt-1 font-black" style={{ color: palette.blue }}>Profilini ko‘rish ›</div></button>}
        </div>}
        {directory && visibleGroups.length > 0 && <div className="border-b" style={{ borderColor: palette.line }}>
          <div className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-[.12em]" style={{ color: accent }}>Avtomatik guruhlar</div>
          {visibleGroups.map(group => <button key={`g-${group.id}`} onClick={() => openPeer({ guruh_id: group.id, full_name: group.nomi, izoh: `${group.turi} · rasmiy guruh`, rol: "guruh" })} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50" style={{ background: peer?.guruh_id === group.id ? palette.sky : undefined }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg text-white shrink-0" style={{ background: accent }}>👥</div>
            <div className="min-w-0 flex-1"><div className="text-sm font-black truncate" style={{ color: palette.ink }}>{group.nomi}</div><div className="text-[11px] truncate" style={{ color: palette.muted }}>{preferences.settings.showPreviews ? (group.oxirgi_matn || (group.oxirgi_fayl_turi ? "Media xabar" : "Hali xabar yo‘q")) : "Guruh xabarlari"}</div></div>
            {Number(group.okilmagan_soni || 0) > 0 && <span className="min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-black text-white flex items-center justify-center" style={{ background: palette.red }}>{group.okilmagan_soni}</span>}
          </button>)}
        </div>}
        {directory && listTab !== "groups" && (() => { const list = scopedSuhbatlar.filter(x => !q || String(x.full_name).toLocaleLowerCase("uz").includes(q) || String(x.izoh || "").toLocaleLowerCase("uz").includes(q)); if (!list.length) return null; return <div>
          <div className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-[.12em]" style={{ color: palette.ink }}>Suhbatlarim</div>
          {list.map(item => <button key={`s-${item.user_id}`} onClick={() => openPeer({ ...item, rol: item.tashqi ? "tashqi" : "suhbat" })} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50" style={{ background: peer?.user_id === item.user_id ? palette.sky : undefined }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0" style={{ background: item.tashqi ? "#5A5648" : palette.blue }}>{kabutarInitials(item.full_name)}</div>
            <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><div className="text-sm font-black truncate" style={{ color: palette.ink }}>{item.full_name}</div>{item.oxirgi_xabar_at && <span className="text-[10px] shrink-0" style={{ color: palette.muted }}>{kabutarTime(item.oxirgi_xabar_at)}</span>}</div><div className="text-[11px] truncate" style={{ color: palette.muted }}>{preferences.settings.showPreviews ? `${item.izoh ? item.izoh + " · " : ""}${item.oxirgi_meniki ? "Siz: " : ""}${item.oxirgi_matn || ""}` : "Shaxsiy suhbat"}</div></div>
            {item.oqilmagan > 0 && <span className="min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-black text-white flex items-center justify-center" style={{ background: palette.red }}>{item.oqilmagan}</span>}
          </button>)}
        </div>; })()}
        {directory && scopedMuassasalar.map(m => { const groupsHere = KABUTAR_GROUPS.map(([key, label, color]) => [key, label, color, (m.azolar || []).filter(a => a.guruh === key && (!q || String(a.full_name).toLocaleLowerCase("uz").includes(q) || String(a.izoh || "").toLocaleLowerCase("uz").includes(q)))]).filter(g => g[3].length); if (!groupsHere.length) return null; return <div key={`${m.turi}-${m.muassasa_id}`}>
          <div className="px-4 pt-4 pb-1 text-[11px] font-black flex items-center gap-2" style={{ color: (KABUTAR_TURI[m.turi] || KABUTAR_TURI.maktab).rang }}><span>{(KABUTAR_TURI[m.turi] || KABUTAR_TURI.maktab).ikon}</span><span className="truncate">{m.muassasa}</span><span className="text-[10px] font-semibold" style={{ color: palette.muted }}>· {(KABUTAR_TURI[m.turi] || KABUTAR_TURI.maktab).nom} Kabutari</span></div>
          {groupsHere.map(([key, label, color, items]) => <div key={key}>
            <div className="px-4 pt-2 pb-1 text-[10px] font-black uppercase tracking-[.12em] flex items-center justify-between" style={{ color }}>{label}<span style={{ color: palette.muted }}>{items.length}</span></div>
            {items.map(item => <button key={item.user_id} onClick={() => openPeer({ ...item, rol: key })} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50" style={{ background: peer?.user_id === item.user_id ? palette.sky : undefined }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0" style={{ background: color }}>{kabutarInitials(item.full_name)}</div>
              <div className="min-w-0 flex-1"><div className="text-sm font-black truncate" style={{ color: palette.ink }}>{item.full_name} <span className="text-[10px] font-semibold" style={{ color: palette.green }}>✓</span></div><div className="text-[11px] truncate" style={{ color: palette.muted }}>{item.izoh}</div></div>
              {item.oqilmagan > 0 && <span className="min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-black text-white flex items-center justify-center" style={{ background: palette.red }}>{item.oqilmagan}</span>}
            </button>)}
          </div>)}
        </div>; })}
        {directory && !scopedSuhbatlar.length && !scopedMuassasalar.some(m => (m.azolar || []).length) && <div className="p-6 text-center text-xs" style={{ color: palette.muted }}>Bu muassasada hozircha aloqalar yo‘q — yuqorida ID bo‘yicha toping.</div>}
      </aside>
      <section className={`flex flex-col ${docked ? (peer ? "flex-1 min-h-0" : "hidden") : (peer ? "" : "hidden md:flex")}`} style={{ minHeight: docked ? 0 : 420 }}>
        {!peer && <div className="flex-1 flex items-center justify-center p-8 text-center"><div><div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-3" style={{ background: palette.sky }}><MessageCircle size={28} style={{ color: palette.blue }}/></div><div className="font-black" style={{ color: palette.ink }}>Suhbatdoshni tanlang</div><p className="text-xs mt-1 max-w-xs" style={{ color: palette.muted }}>Ro‘yxatda muassasalaringiz bo‘yicha rasmiy suhbatdoshlar. Boshqa odamni — uning Kabutar ID si bilan toping. Xabar yuboruvchining kimligi (ism, lavozim, muassasa) har doim ko‘rinadi.</p></div></div>}
        {peer && <>
          <div className="px-4 py-3 bg-white border-b flex items-center gap-3" style={{ borderColor: palette.line, borderTop: `3px solid ${accent}` }}>
            <button onClick={() => { setPeer(null); peerRef.current = null; }} className={`${docked ? "" : "md:hidden"} w-9 h-9 rounded-xl flex items-center justify-center`} style={{ background: palette.sky, color: palette.blue }}><ArrowLeft size={16}/></button>
            <button type="button" className="kb-peer-profile" onClick={() => setAccountView({ page: "profile", person: peer })} aria-label={`${peer.full_name} profilini ko‘rish`}><span className="kb-avatar" style={{ background: peer.rol === "tashqi" ? "#5A5648" : (KABUTAR_GROUPS.find(g => g[0] === peer.rol) || [])[2] || palette.blue }}>{kabutarInitials(peer.full_name)}</span><span><strong>{peer.full_name}</strong><small>{peer.guruh_id ? "Guruh ma’lumotini ko‘rish" : "Profilini ko‘rish"}{peer.izoh ? ` · ${peer.izoh}` : ""}</small></span></button>
          </div>
          <div ref={bodyRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2" style={{ background: "linear-gradient(180deg,#F7F5F0,#FBFAF7)" }}>
            {!messages.length && <div className="text-center text-xs py-10" style={{ color: palette.muted }}>Hali xabar yo‘q — birinchisini yozing.</div>}
            {messages.map(m => <div key={m.id} className={`relative flex ${m.meniki ? "justify-end" : "justify-start"}`}>
              <div onDoubleClick={() => setReplyTo(m)} onContextMenu={event => { event.preventDefault(); setMenuMessage(menuMessage?.id === m.id ? null : m); }} className="max-w-[78%] rounded-2xl px-3.5 py-2.5 shadow-sm cursor-context-menu" style={m.meniki ? { background: palette.blue, color: "#fff", borderBottomRightRadius: 6 } : { background: "#fff", color: palette.ink, borderBottomLeftRadius: 6, border: `1px solid ${palette.line}` }}>
                {m.javob_xabar_id && <div className="mb-1.5 pl-2 border-l-2 text-[11px] opacity-75"><b>{m.javob_yuboruvchi_ismi || "Xabar"}</b><div className="truncate">{m.javob_matn_qisqa || "Media"}</div></div>}
                {isPhotoMessage(m) && <a href={`${apiBase}/api/chat/fayl/${m.id}?token=${encodeURIComponent(token)}`} target="_blank" rel="noreferrer" className="kb-message-photo"><img loading="lazy" src={`${apiBase}/api/chat/fayl/${m.id}?token=${encodeURIComponent(token)}`} alt={m.matn || "Rasmli xabar"} /></a>}
                {m.matn && <div className="whitespace-pre-wrap break-words" style={{ fontSize: preferences.settings.textSize, lineHeight: 1.55 }}>{m.matn}</div>}
                {m.fayl_turi === "audio" && <audio controls preload="none" className="mt-1 w-56 max-w-full" src={`${apiBase}/api/chat/fayl/${m.id}?token=${encodeURIComponent(token)}`}/>} 
                {m.fayl_turi === "video" && <video controls preload="metadata" className="mt-1 w-64 max-w-full rounded-lg" src={`${apiBase}/api/chat/fayl/${m.id}?token=${encodeURIComponent(token)}`}/>} 
                {m.fayl_turi === "video_doira" && <video controls playsInline preload="metadata" className="mt-1 w-48 h-48 max-w-full rounded-full object-cover border-4 border-white/40" src={`${apiBase}/api/chat/fayl/${m.id}?token=${encodeURIComponent(token)}`}/>} 
                {m.fayl_turi === "hujjat" && !isPhotoMessage(m) && <a href={`${apiBase}/api/chat/fayl/${m.id}?token=${encodeURIComponent(token)}`} target="_blank" rel="noreferrer" className="mt-1 flex items-center gap-2 text-xs font-black underline"><Download size={14}/> {m.fayl_nomi || "Hujjat"}{m.fayl_hajmi_kb ? ` · ${m.fayl_hajmi_kb} KB` : ""}</a>}
                {(m.reaksiyalar || []).length > 0 && <div className="flex flex-wrap gap-1 mt-1">{m.reaksiyalar.map(item => <span key={item.emoji} className="px-1.5 py-0.5 rounded-full text-[10px]" style={{ background: m.meniki ? "rgba(255,255,255,.18)" : palette.sky }}>{item.emoji} {item.soni}</span>)}</div>}
                <div className="mt-1 text-[10px] text-right" style={{ opacity: .75 }}>{m.tahrirlangan ? "tahrirlangan · " : ""}{kabutarTime(m.yaratilgan_at)}{m.meniki ? (peerSeenId && m.id <= peerSeenId ? " · ✓✓ ko‘rildi" : " · ✓") : ""}</div>
              </div>
              {menuMessage?.id === m.id && <div className={`absolute z-20 ${m.meniki ? "right-2" : "left-2"} top-full mt-1 p-2 rounded-2xl border bg-white shadow-xl min-w-[210px]`} style={{ borderColor: palette.line, color: palette.ink }}>
                <div className="flex gap-1 pb-2 mb-1 border-b" style={{ borderColor: palette.line }}>{["❤️","👍","🔥","👏","😁","🤔"].map(emoji => <button key={emoji} onClick={() => reactTo(m, emoji)} className="w-7 h-7 rounded-lg hover:bg-slate-100">{emoji}</button>)}</div>
                <button onClick={() => { setReplyTo(m); setMenuMessage(null); }} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold hover:bg-slate-50"><Reply size={14}/>Javob berish</button>
                <button onClick={() => { navigator.clipboard?.writeText(m.matn || ""); setMenuMessage(null); }} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold hover:bg-slate-50"><Copy size={14}/>Nusxalash</button>
                <button onClick={() => { setForwarding(m); setMenuMessage(null); }} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold hover:bg-slate-50"><Forward size={14}/>Boshqaga uzatish</button>
                {m.meniki && m.matn && !m.fayl_turi && <button onClick={() => { setEditing(m); setText(m.matn); setMenuMessage(null); }} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold hover:bg-slate-50"><Pencil size={14}/>O‘zgartirish</button>}
                {m.meniki && <button onClick={() => removeMessage(m)} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold" style={{ color: palette.red }}><Trash2 size={14}/>O‘chirish</button>}
              </div>}
            </div>)}
          </div>
          {sendError && <div className="mx-4 mb-2 p-2 rounded-xl text-xs" style={{ background: palette.redBg, color: palette.red }}>{sendError}</div>}
          {(replyTo || editing) && <div className="px-4 py-2 bg-white border-t flex items-center justify-between gap-2 text-xs" style={{ borderColor: palette.line }}><div className="truncate" style={{ color: palette.blue }}><b>{editing ? "O‘zgartirilmoqda" : "Javob"}:</b> {(editing || replyTo)?.matn || "Media xabar"}</div><button onClick={() => { setReplyTo(null); setEditing(null); if (editing) setText(""); }} className="font-black">✕</button></div>}
          <KabutarMediaComposer key={`${token}:${peer.guruh_id ? 'g' + peer.guruh_id : 'u' + peer.user_id}`} disabled={sending || Boolean(editing)} onSend={send} onBusyChange={setMediaBusy} />
          <div className="kb-composer p-3 bg-white border-t flex items-end gap-2" style={{ borderColor: palette.line }}>
            <textarea disabled={sending || mediaBusy} value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent?.isComposing && preferences.settings.enterToSend) { e.preventDefault(); send(); } }} rows={1} placeholder={preferences.settings.enterToSend ? "Xabar yozing… Enter — yuborish" : "Xabar yozing…"} aria-label="Xabar matni" className="flex-1 resize-none px-3 py-2.5 rounded-xl border text-sm outline-none max-h-32" style={{ borderColor: palette.line }}/>
            <button onClick={() => send()} disabled={sending || mediaBusy || !text.trim()} className="kb-send-button h-10 px-4 rounded-xl text-sm font-black text-white shrink-0 disabled:opacity-50" style={{ background: palette.blue }}>{sending ? "..." : "Yuborish"}</button>
          </div>
        </>}
      </section>
    </div>
    {accountView && <KabutarAccount token={token} apiBase={apiBase} directory={directory} initialPage={accountView.page} person={accountView.person || null} preferences={preferences} onClose={() => setAccountView(null)} onOpenContact={item => { setAccountView(null); openPeer(item); }} onMeUpdated={card => setDirectory(current => current ? { ...current, men: { ...current.men, ...card } } : { men: card, muassasalar: [], suhbatlar: [] })}/>}
  </div>;
}
