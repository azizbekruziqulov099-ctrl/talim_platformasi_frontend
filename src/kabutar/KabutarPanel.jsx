import {uiText as __kbUi} from '../interface/interfaceRuntime.js';
import {useInterface as useKbInterfaceLocale} from '../interface/InterfacePreferences.jsx';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, Copy, Download, Forward, Loader2, MessageCircle, MoreHorizontal, Pencil, Phone, Reply, Search, Send, ShieldCheck, Trash2, Video } from "lucide-react";
import KabutarAccount, { KabutarAccountButton, useKabutarPreferences } from "./KabutarAccount.jsx";
import { kabutarRequest, normalizeKabutarId, copyKabutarText, suhbatKaliti } from "./kabutarAccountRules.js";
import { startKabutarPoll, mergeKabutarMessages } from "./kabutarPolling.js";
import KabutarMessageCanvas from "./KabutarMessageCanvas.jsx";
import { useInterface } from "../interface/InterfacePreferences.jsx";
import KabutarMediaComposer from "./KabutarMediaComposer.jsx";
import { isPhotoMessage } from "./kabutarMediaRules.js";
import { chatMessageWindow, chatNearBottom, chatDateKey, chatDateLabel, institutionGroupVisible, KABUTAR_MESSAGE_WINDOW } from "./kabutarChatRules.js";
import KabutarCallDialog from "./KabutarCallDialog.jsx";
import KabutarSafety from "./KabutarSafety.jsx";
import KabutarMeetingDialog from "./KabutarMeetingDialog.jsx";
import KabutarTerms from "./KabutarTerms.jsx";
import "./kabutar-chat.css";
import "./kabutar-tg.css";   // REV389: Telegram uslubi

// Ranglar — maktab ish maydoni palitrasi bilan bir xil
const palette = {
  ink: "var(--ui-text, #21384c)", muted: "var(--ui-muted, #718077)", line: "var(--ui-border, #dae6df)", cream: "var(--ui-bg, #f2f6f4)", sky: "var(--ui-accent-soft, #e6f4ef)", blue: "var(--ui-accent, #176e62)",
  button: "var(--ui-action, #176e62)", teal: "var(--ui-accent, #0d7a77)", green: "var(--ui-accent, #2e6c55)", mint: "var(--ui-accent-soft, #eef6f1)", greenBg: "var(--ui-accent-soft, #eef6f1)", red: "var(--kb-error, #b0553a)", redBg: "var(--kb-error-bg, #fff0ec)",
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
const kabutarTime = (iso, locale = "uz") => { if (!iso) return ""; const d = new Date(iso); const today = new Date(); const same = d.toDateString() === today.toDateString(); return same ? d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }) : d.toLocaleDateString(locale, { day: "2-digit", month: "2-digit" }) + " " + d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }); };

export const KABUTAR_TURI = {
  maktab: { ikon: "🏫", nom: "Maktab", rang: "#1B4B7A", yengil: "#EAF1F7" },
  universitet: { ikon: "🎓", nom: "Institut", rang: "#5B4B8A", yengil: "#F1EEF8" },
  institut: { ikon: "🎓", nom: "Institut", rang: "#5B4B8A", yengil: "#F1EEF8" },
  bogcha: { ikon: "🧸", nom: "Bog‘cha", rang: "#B0553A", yengil: "#FFF0EC" },
  markaz: { ikon: "📚", nom: "Ta’lim markazi", rang: "#0D7A77", yengil: "#E8F5F4" },
};
// Keep roots together without losing older conversations whose root is outside
// the bounded message window. Selecting such a card resolves it on the server.
// REV389: avatar rangi ismdan (har suhbatdosh o'z rangida, Telegram kabi)
const AVATAR_RANGLAR = ["#e17076", "#7bc862", "#65aadd", "#a695e7", "#ee7aae", "#6ec9cb", "#faa774", "#4f8fd6"];
export function avatarRangi(nom = "") { let h = 0; for (const c of String(nom)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return AVATAR_RANGLAR[h % AVATAR_RANGLAR.length]; }
const EMOJILAR = "😀 😁 😂 🤣 😊 😍 😘 😎 🤔 😅 😉 🙂 😇 🥰 😢 😭 😡 😱 🙏 👍 👎 👏 🙌 💪 👌 ✌️ 🤝 ❤️ 💙 💚 🔥 ⭐ 🎉 🎂 📚 ✏️ ✅ ❌ ❓ 💯".split(" ");

export function kabutarConversationPosts(messages) {
  const byId = new Map(messages.map(message => [String(message.id), message]));
  const posts = new Map();
  for (const message of messages) {
    let root = message;
    const visited = new Set();
    while (root.javob_xabar_id && byId.has(String(root.javob_xabar_id)) && !visited.has(String(root.id))) {
      visited.add(String(root.id)); root = byId.get(String(root.javob_xabar_id));
    }
    const key = String(root.javob_xabar_id || root.id);
    if (!posts.has(key)) posts.set(key, root.javob_xabar_id ? { ...root, earlierThread: true } : root);
  }
  return [...posts.values()].map(post => ({ ...post, reply_count: Math.max(Number(post.reply_count || 0), messages.filter(message => Number(message.javob_xabar_id) === Number(post.id)).length) })).sort((a, b) => Number(a.id) - Number(b.id));
}

export default function KabutarPanel({ toliq = false, token, apiBase, maktabId = null, title = "Kabutar", onClose, docked = false, onUnread = null, scope = null, showScopeStrip = true, active = true, requestedContact = null }) {
  useKbInterfaceLocale();
  const { t, locale } = useInterface();
  const [pageVisible, setPageVisible] = useState(() => typeof document === "undefined" || document.visibilityState !== "hidden");
  const foreground = active && pageVisible && Boolean(token);
  const foregroundRef = useRef(foreground);
  foregroundRef.current = foreground;
  const onUnreadRef = useRef(onUnread);
  onUnreadRef.current = onUnread;
  const requestsRef = useRef({ directory: null, messages: null, history: null, search: null, action: null, thread: null });
  useEffect(() => {
    const update = () => setPageVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  useEffect(() => {
    if (!foreground) Object.values(requestsRef.current).forEach(entry => entry?.controller.abort());
  }, [foreground]);
  useEffect(() => () => {
    Object.values(requestsRef.current).forEach(entry => entry?.controller.abort());
  }, [token, apiBase]);
  // scope: { turi, muassasa_id } — faqat shu muassasa Kabutari; null — hammasi
  const [scopeKey, setScopeKey] = useState(scope ? `${scope.turi}:${scope.muassasa_id}` : "all");
  useEffect(() => { if (scope) setScopeKey(`${scope.turi}:${scope.muassasa_id}`); }, [scope?.turi, scope?.muassasa_id]);
  const [directory, setDirectory] = useState(null);
  const [accountView, setAccountView] = useState(null);
  const [call, setCall] = useState(null);
  const termsKey = `${apiBase}:${token}`;
  const [termsAcceptedKey, setTermsAcceptedKey] = useState(null);
  const canWrite = termsAcceptedKey === termsKey;
  const [safetyView, setSafetyView] = useState(null);
  const [meetingGroupId, setMeetingGroupId] = useState(null);
  const callRef = useRef(null); callRef.current = call;
  const uzoqRef = useRef(null);   // REV389: uzoq bosish (telefon)
  const [tvKorinadi, setTvKorinadi] = useState(true);   // REV389: admin Kabutar TV ni o'chirib-yoqadi
  useEffect(() => { fetch(`${String(apiBase || "").replace(/\/+$/, "")}/api/kabutar_tv/korinish`).then((r) => (r.ok ? r.json() : null)).then((j) => { if (j && j.korinadi === false) setTvKorinadi(false); }).catch(() => {}); }, [apiBase]);
  const [emojiOchiq, setEmojiOchiq] = useState(false);
  const [qatorMenyu, setQatorMenyu] = useState(null);
  const [qadalganXabar, setQadalgan] = useState(null);   // REV395: suhbatda qadalgan xabar
  const [qidiruv, setQidiruv] = useState(null);      // REV395: suhbat ichida qidirish {matn, i}
  const [tanlov, setTanlov] = useState(null);        // REV396: bir nechta xabarni belgilash — Set(id) yoki null
  const [galereya, setGalereya] = useState(null);    // REV397: ochiq rasm (xabar id)
  const [ovozTezlik, setOvozTezlik] = useState(1);   // REV397: ovozli xabar tezligi
  const surish = useRef(null);                        // REV396: o'ngga surib javob berish {id, x0, y0, dx}
  const qoralamaT = useRef(null);
  const qoralamaYoz = (v) => { const k = suhbatKaliti(peerRef.current); if (!k || editing) return; clearTimeout(qoralamaT.current);
    qoralamaT.current = setTimeout(() => { const d = { ...(preferences.settings.drafts || {}) }; if (v.trim()) d[k] = v; else delete d[k]; preferences.updateSettings({ drafts: d }); }, 600); };   // REV393: {kalit, x, y} — suhbat qatori menyusi
  const [arxivKorinish, setArxivKorinish] = useState(false);
  const [peerHolat, setPeerHolat] = useState({ matn: "", yozmoqda: false, kimlar: [] });   // REV391: «yozmoqda…», «onlayn»
  const yozmoqdaRef = useRef(0);
  const requestedContactRef = useRef(null);
  const preferences = useKabutarPreferences(directory?.men?.user_id, apiBase);
  const [chatDirectory, setChatDirectory] = useState({ guruhlar: [], shaxsiylar: [] });
  // REV212: hozircha Kabutar faqat kanallar uchun — TV kanallarini ko'rish va ko'rsatuv ostiga izoh yozish.
  // REV389: admin to'liq messenjerni (shaxsiy suhbatlar, guruhlar) sinab ko'radi — tasdiqlangach hammaga ochiladi.
  const KANALLAR_REJIMI = !toliq;
  const [listTab, setListTab] = useState(KANALLAR_REJIMI ? "groups" : "all");
  const [directoryLimit, setDirectoryLimit] = useState(60);
  const [dirError, setDirError] = useState("");
  const [query, setQuery] = useState("");
  useEffect(() => setDirectoryLimit(60), [query, scopeKey, listTab]);
  const [idQuery, setIdQuery] = useState("");
  const [idResult, setIdResult] = useState(null); const [idBusy, setIdBusy] = useState(false); const [idError, setIdError] = useState("");
  const searchById = async () => {
    if (idBusy || directory?.policy?.eligible === false) return;
    const raw = idQuery.trim();
    const key = normalizeKabutarId(raw) || (/^[@+]/.test(raw) && raw.length <= 80 ? raw : "");
    if (!key) { setIdError("KB raqami, @nik yoki +998 bilan telefon raqamini kiriting"); return; }
    if (key === directory?.men?.kabutar_id) { setAccountView({ page: "profile" }); return; }
    const controller = new AbortController();
    requestsRef.current.search?.controller.abort();
    requestsRef.current.search = { controller };
    setIdBusy(true); setIdError(""); setIdResult(null);
    try {
      const d = await kabutarRequest(apiBase, `/api/kabutar/find?query=${encodeURIComponent(key)}`, token, { authInHeader: true, signal: controller.signal });
      if (controller.signal.aborted) return;
      if (String(d.user_id) === String(directory?.men?.user_id)) setAccountView({ page: "profile" });
      else setIdResult(d);
    } catch (e) { if (!controller.signal.aborted) setIdError(e.message); } finally { if (requestsRef.current.search?.controller === controller) { requestsRef.current.search = null; setIdBusy(false); } }
  };
  const [peer, setPeer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [threadTargetId, setThreadTargetId] = useState(null);
  const [threadRoot, setThreadRoot] = useState(null);
  const [threadMessages, setThreadMessages] = useState([]);
  const [threadHasMore, setThreadHasMore] = useState(false);
  const [threadCursor, setThreadCursor] = useState(0);
  const [threadBusy, setThreadBusy] = useState(false);
  const [threadError, setThreadError] = useState("");
  const [threadTruncated, setThreadTruncated] = useState(false);
  const [threadLegacyTruncated, setThreadLegacyTruncated] = useState(false);
  const threadMessagesRef = useRef(threadMessages); threadMessagesRef.current = threadMessages;
  const threadPollCount = useRef(0);
  const threadRefreshOffset = useRef(0);
  const [threadRefresh, setThreadRefresh] = useState(0);
  const threadState = useRef({});
  threadState.current = { id: threadTargetId, cursor: threadCursor, hasMore: threadHasMore };
  const draftsRef = useRef(new Map());
  const canvasMode = preferences.settings.messageLayout === "canvas";
  const groupThreads = preferences.settings.groupThreads !== false;
  const readingSubsetRef = useRef(false);
  readingSubsetRef.current = canvasMode || Boolean(threadTargetId) || Boolean(peer?.guruh_id && groupThreads);
  const messagesRef = useRef(messages); messagesRef.current = messages;
  const [historyMode, setHistoryMode] = useState(false);
  const historyModeRef = useRef(false);
  const [historyBusy, setHistoryBusy] = useState(false);
  const [hasOlder, setHasOlder] = useState(false);
  const [newMessages, setNewMessages] = useState(0);
  const [messageLoading, setMessageLoading] = useState(false);
  const scrollIntent = useRef(null);
  const textareaRef = useRef(null);
  const [peerSeenId, setPeerSeenId] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [messageError, setMessageError] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [editing, setEditing] = useState(null);
  const [menuMessage, setMenuMessage] = useState(null);
  const [forwarding, setForwarding] = useState(null);
  const [mediaBusy, setMediaBusy] = useState(false);
  const outgoingRef = useRef(null);
  const bodyRef = useRef(null);
  const lastIdRef = useRef(0); const peerRef = useRef(null);
  const peerKey = value => value ? (value.guruh_id ? `g:${value.guruh_id}` : `u:${value.user_id}`) : "";
  const conversationKey = peerKey(peer);
  const composerKey = `${conversationKey}:${threadTargetId || "main"}`;
  const composerKeyRef = useRef(composerKey); composerKeyRef.current = composerKey;
  const saveDraft = () => {
    const key = composerKeyRef.current;
    if (text || replyTo || editing) draftsRef.current.set(key, { text, replyTo, editing });
    else draftsRef.current.delete(key);
    while (draftsRef.current.size > 40) draftsRef.current.delete(draftsRef.current.keys().next().value);
  };
  const restoreDraft = key => {
    const draft = draftsRef.current.get(key);
    // REV393: sahifa qayta ochilganda ham qoralama qoladi (saqlangan qoralama — faqat asosiy suhbat uchun)
    const saqlangan = !draft && /:main$/.test(key) ? preferences.settings.drafts?.[suhbatKaliti(peerRef.current)] : "";
    setText(draft?.text || saqlangan || ""); setReplyTo(draft?.replyTo || null); setEditing(draft?.editing || null);
  };
  const closeDiscussion = () => {
    if (sending || mediaBusy) return;
    saveDraft(); requestsRef.current.thread?.controller.abort();
    setThreadTargetId(null); setThreadRoot(null); setThreadMessages([]); setThreadError(""); setThreadBusy(false);
    setMenuMessage(null); restoreDraft(`${conversationKey}:main`);
  };
  const leaveConversation = () => {
    saveDraft(); requestsRef.current.thread?.controller.abort(); requestsRef.current.messages?.controller.abort();
    outgoingRef.current?.controller.abort(); setPeer(null); peerRef.current = null; setSelectedMessage(null);
    setThreadTargetId(null); setThreadRoot(null); setThreadMessages([]); setThreadError(""); setThreadBusy(false);
    setText(""); setReplyTo(null); setEditing(null); setMenuMessage(null);
  };
  const selectMessage = message => {
    if (sending || mediaBusy || !message) return;
    setMenuMessage(null);
    if (peerRef.current?.guruh_id) {
      if (Number(threadRoot?.id || threadTargetId) === Number(message.id)) return;
      saveDraft(); requestsRef.current.thread?.controller.abort();
      setThreadTargetId(message.id); setThreadRoot(null); setThreadMessages([]);
      setThreadHasMore(false); setThreadCursor(0); setThreadTruncated(false); setThreadLegacyTruncated(false); threadPollCount.current = 0; threadRefreshOffset.current = 0; setThreadError(""); setThreadBusy(true);
      restoreDraft(`${conversationKey}:${message.id}`);
    } else setSelectedMessage(message);
  };
  const setDisplayMode = mode => {
    if (sending || mediaBusy) return;
    if (threadTargetId) closeDiscussion();
    setSelectedMessage(null); preferences.updateSettings({ messageLayout: mode });
    readingSubsetRef.current = mode === "canvas" || Boolean(peer?.guruh_id && groupThreads);
    if (!readingSubsetRef.current && peerRef.current) loadMessages(peerRef.current.user_id || 0);
  };
  useEffect(() => {
    draftsRef.current.clear(); setSelectedMessage(null); setThreadTargetId(null); setThreadRoot(null); setThreadMessages([]);
    peerRef.current = null; lastIdRef.current = 0; setPeer(null); setMessages([]); setDirectory(null); setChatDirectory({ guruhlar: [], shaxsiylar: [] });
    setText(""); setReplyTo(null); setEditing(null);
  }, [apiBase, token]);
  useLayoutEffect(() => {
    const intent = scrollIntent.current, element = bodyRef.current;
    if (!intent || !element || intent.key !== conversationKey) return;
    if (readingSubsetRef.current) { scrollIntent.current = null; return; }
    if (intent.mode === "older") {
      const anchor = intent.anchorId && element.querySelector?.(`[data-kb-message-id="${intent.anchorId}"]`);
      if (anchor && intent.offset !== undefined) element.scrollTop += anchor.getBoundingClientRect().top - element.getBoundingClientRect().top - intent.offset;
      else element.scrollTop = element.scrollHeight - intent.height + intent.top;
    }
    else element.scrollTop = element.scrollHeight;
    scrollIntent.current = null;
  }, [messages, conversationKey]);
  useLayoutEffect(() => {
    const element = textareaRef.current;
    if (element) { element.style.height = "auto"; element.style.height = `${Math.min(element.scrollHeight, 130)}px`; }
  }, [text, conversationKey]);
  useLayoutEffect(() => {
    if (menuMessage) bodyRef.current?.querySelector?.(".kb-message-menu")?.scrollIntoView?.({ block: "nearest", behavior: "instant" });
  }, [menuMessage]);
  useEffect(() => {
    if (!menuMessage) return undefined;
    const escape = event => { if (event.key === "Escape") { event.preventDefault(); setMenuMessage(null); } };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [menuMessage]);
  useEffect(() => {
    const entry = outgoingRef.current;
    if (entry && entry.key !== conversationKey) entry.controller.abort();
  }, [conversationKey]);
  useEffect(() => () => { outgoingRef.current?.controller.abort(); }, [token, apiBase]);

  useEffect(() => { setAccountView(null); setDirectory(null); setChatDirectory({ guruhlar: [], shaxsiylar: [] }); setPeer(null); peerRef.current = null; setMessages([]); setCall(null); setMeetingGroupId(null); setSafetyView(null); setIdResult(null); setIdBusy(false); }, [apiBase, token]);

  const loadDirectory = useCallback(({ signal } = {}) => {
    if (!foregroundRef.current || signal?.aborted) return Promise.resolve(false);
    const existing = requestsRef.current.directory;
    if (existing && !existing.controller.signal.aborted) return existing.promise;
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal?.addEventListener("abort", abort, { once: true });
    const entry = { controller, promise: null };
    entry.promise = (async () => {
      try {
        const [people, chats] = await Promise.allSettled([
          kabutarRequest(apiBase, "/api/kabutar/aloqalar_umumiy", token, { signal: controller.signal }),
          kabutarRequest(apiBase, "/api/chat/guruhlarim", token, { signal: controller.signal }),
        ]);
        if (controller.signal.aborted || !foregroundRef.current) return false;
        if (people.status === "rejected") throw people.reason;
        const d = people.value;
        if (chats.status === "fulfilled") setChatDirectory(chats.value);
        if (maktabId && Array.isArray(d.muassasalar)) d.muassasalar.sort((a, b) => Number(b.turi === "maktab" && String(b.muassasa_id) === String(maktabId)) - Number(a.turi === "maktab" && String(a.muassasa_id) === String(maktabId)));
        setDirectory(d);
        setDirError(chats.status === "rejected" ? "Guruhlar vaqtincha yuklanmadi. Qayta ulanmoqda…" : "");
        onUnreadRef.current?.(Number(d.jami_oqilmagan || 0));
        return chats.status === "fulfilled";
      } catch (e) {
        if (!controller.signal.aborted && foregroundRef.current) setDirError(e.message);
        return false;
      } finally {
        signal?.removeEventListener("abort", abort);
        if (requestsRef.current.directory === entry) requestsRef.current.directory = null;
      }
    })();
    requestsRef.current.directory = entry;
    return entry.promise;
  }, [apiBase, token, maktabId]);
  useEffect(() => {
    if (!foreground) return undefined;
    return startKabutarPoll(signal => loadDirectory({ signal }), { interval: 20000 });
  }, [foreground, loadDirectory]);

  const markSeen = useCallback(async (peerId, lastId, groupId = null, signal) => {
    if (!lastId || !foregroundRef.current || readingSubsetRef.current) return;
    const target = groupId ? `guruh_id=${groupId}` : `boshqa_user_id=${peerId}`;
    try {
      await kabutarRequest(apiBase, `/api/chat/korildi_belgila?${target}&oxirgi_xabar_id=${lastId}`, token, { method: "POST", signal });
    } catch { /* Reading still works if the receipt is temporarily unavailable. */ }
  }, [apiBase, token]);

  const loadMessages = useCallback(async (peerId, { incremental = false, signal } = {}) => {
    const current = peerRef.current;
    if (!current || !foregroundRef.current || signal?.aborted || (incremental && historyModeRef.current)) return false;
    const groupId = current.guruh_id;
    const key = groupId ? `g:${groupId}` : `u:${peerId}`;
    const isCurrent = () => {
      const next = peerRef.current;
      return next && (next.guruh_id ? `g:${next.guruh_id}` : `u:${next.user_id}`) === key;
    };
    const existing = requestsRef.current.messages;
    if (existing && !existing.controller.signal.aborted) {
      if (existing.key === key) {
        // A reaction/edit refresh requires the complete list after an in-flight
        // incremental read; otherwise callers share the existing request.
        if (!incremental && existing.incremental) {
          await existing.promise;
          if (!isCurrent() || signal?.aborted) return false;
          return loadMessages(peerId, { incremental: false, signal });
        }
        return existing.promise;
      }
      existing.controller.abort();
    }
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal?.addEventListener("abort", abort, { once: true });
    const entry = { controller, key, incremental, promise: null };
    const followBottom = !readingSubsetRef.current && (!incremental || chatNearBottom(bodyRef.current));
    if (!incremental) { setMessageLoading(true); historyModeRef.current = false; setHistoryMode(false); }
    entry.promise = (async () => {
      try {
        const collected = [];
        let newest = lastIdRef.current;
        let seenId = null;
        // Catch up at most three bounded pages per cycle; never skip unread
        // rows by moving the cursor to an optimistic outgoing message ID.
        for (let page = 0; page < 3; page += 1) {
          const qs = new URLSearchParams();
          if (groupId) qs.set("guruh_id", String(groupId));
          else qs.set("boshqa_user_id", String(peerId));
          if (maktabId) qs.set("maktab_id", String(maktabId));
          if ((incremental || page > 0) && newest) qs.set("keyingidan", String(newest));
          const d = await kabutarRequest(apiBase, `/api/chat/xabarlar?${qs}`, token, { signal: controller.signal });
          if (controller.signal.aborted || !foregroundRef.current || !isCurrent()) return false;
          const rows = Array.isArray(d.xabarlar) ? d.xabarlar : [];
          seenId = d.boshqa_tomon_korgan_id || d.qarshi_tomon_korgan_id || seenId;
          if (page === 0) setQadalgan(d.qadalgan || null);   // REV395
          if (page === 0) setPeerHolat({ matn: d.boshqa_holat || "", yozmoqda: Boolean(d.yozmoqda), kimlar: Array.isArray(d.yozmoqdalar) ? d.yozmoqdalar : [] });   // REV391
          if (!incremental && page === 0) setHasOlder(Boolean(d.yana_bormi));
          collected.push(...rows);
          const previous = newest;
          newest = Math.max(newest, ...rows.map(x => Number(x.id) || 0));
          if (!incremental || !d.yana_bormi || !rows.length || newest <= previous) break;
        }
        setMessageError("");
        setPeerSeenId(seenId);
        if (collected.length) {
          const overWindow = incremental && messagesRef.current.length + collected.length > KABUTAR_MESSAGE_WINDOW;
          if (overWindow) setHasOlder(true);
          if (followBottom) scrollIntent.current = { key, mode: "bottom" };
          else setNewMessages(count => count + collected.filter(row => !row.meniki && Number(row.id) > lastIdRef.current).length);
          if (overWindow && !followBottom && !readingSubsetRef.current) { historyModeRef.current = true; setHistoryMode(true); }
          else setMessages(old => chatMessageWindow(incremental ? old : [], collected));
          lastIdRef.current = newest;
          if (followBottom && collected.some(x => !x.meniki)) {
            await markSeen(peerId, newest, groupId, controller.signal);
            if (!controller.signal.aborted && isCurrent()) loadDirectory();
          }
          if (followBottom) setNewMessages(0);
        } else if (!incremental) setMessages([]);
        return true;
      } catch (e) {
        if (!controller.signal.aborted && foregroundRef.current && isCurrent()) {
          if ([401, 403, 404, 410].includes(e.status)) { setMessages([]); setPeer(null); peerRef.current = null; setDirError(e.message); }
          else setMessageError(e.message);
        }
        return false;
      } finally {
        signal?.removeEventListener("abort", abort);
        if (requestsRef.current.messages === entry) { requestsRef.current.messages = null; setMessageLoading(false); }
      }
    })();
    requestsRef.current.messages = entry;
    return entry.promise;
  }, [apiBase, token, maktabId, markSeen, loadDirectory]);

  const loadThread = useCallback(async ({ append = false, poll = false, signal } = {}) => {
    const state = threadState.current, target = peerRef.current;
    if (!target?.guruh_id || !state.id || !foregroundRef.current || signal?.aborted) return false;

    if (requestsRef.current.thread && !requestsRef.current.thread.controller.signal.aborted) return false;
    const key = peerKey(target), id = state.id;
    const controller = new AbortController(), abort = () => controller.abort();
    signal?.addEventListener("abort", abort, { once: true });
    const entry = { controller, key, id }; requestsRef.current.thread = entry;
    const isCurrent = () => !controller.signal.aborted && foregroundRef.current && peerKey(peerRef.current) === key && Number(threadState.current.id) === Number(id);
    const after = append || poll ? state.cursor : 0;
    if (!poll) setThreadBusy(true);
    try {
      // While older pages remain, do not skip them by advancing the cursor.
      // Refresh a bounded visible page periodically so edits/deletions arrive.
      const refreshVisible = poll && (state.hasMore || ++threadPollCount.current % 3 === 0) && threadMessagesRef.current.length > 0;
      const offset = refreshVisible ? threadRefreshOffset.current % threadMessagesRef.current.length : 0;
      const refreshAfter = refreshVisible ? Math.max(0, Number(threadMessagesRef.current[offset]?.id || 1) - 1) : after;
      const params = new URLSearchParams({ message_id: String(id), limit: "50", after_id: String(refreshAfter || 0) });
      const data = await kabutarRequest(apiBase, `/api/chat/thread?${params}`, token, { signal: controller.signal });
      if (!isCurrent()) return false;
      if (!data.root?.id) throw new Error("Muhokama topilmadi.");
      const rows = Array.isArray(data.xabarlar) ? data.xabarlar : [];
      setThreadRoot(data.root); setMessages(old => old.map(message => Number(message.id) === Number(data.root.id) ? { ...message, reply_count: data.root.reply_count } : message)); setThreadLegacyTruncated(Boolean(data.truncated));
      const incoming = rows.map(row => ({ ...row, sentAhead: false }));
      const currentRows = threadMessagesRef.current;
      const nextRows = append || poll ? mergeKabutarMessages(currentRows, refreshVisible ? incoming.filter(row => currentRows.some(item => Number(item.id) === Number(row.id))) : incoming) : incoming;
      if (nextRows.length > 200) setThreadTruncated(true);
      setThreadMessages(nextRows.slice(-200));
      if (refreshVisible) threadRefreshOffset.current = offset + 50;
      else {
        setThreadCursor(Math.max(after, Number(data.last_id) || 0, ...rows.map(row => Number(row.id) || 0)));
        setThreadHasMore(Boolean(data.has_more));
      }
      setThreadError("");
      return true;
    } catch (error) {
      if (isCurrent()) {
        setThreadError(error.message);
        if ([401, 403, 404, 410].includes(error.status)) { setThreadRoot(null); setThreadMessages([]); }
        if ([401, 403].includes(error.status)) { setPeer(null); peerRef.current = null; setMessages([]); setSelectedMessage(null); setDirError(error.message); }
      }
      return false;
    } finally {
      signal?.removeEventListener("abort", abort);
      if (requestsRef.current.thread === entry) { requestsRef.current.thread = null; setThreadBusy(false); }
    }
  }, [apiBase, token]);
  useEffect(() => {
    if (!foreground || !threadTargetId || !peer?.guruh_id) return undefined;
    return startKabutarPoll(signal => loadThread({ poll: Boolean(threadState.current.cursor), signal }), { interval: 7000 });
  }, [foreground, conversationKey, threadTargetId, threadRefresh, loadThread]);
  useLayoutEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = 0; }, [threadTargetId, selectedMessage?.id, canvasMode]);

  const loadOlder = async () => {
    const current = peerRef.current;
    const oldest = messages[0]?.id;
    if (!current || !oldest || historyBusy || !foregroundRef.current) return;
    const key = peerKey(current);
    const controller = new AbortController();
    requestsRef.current.messages?.controller.abort();
    historyModeRef.current = true; setHistoryMode(true); setHistoryBusy(true);
    const entry = { controller }; requestsRef.current.history = entry;
    try {
      const params = new URLSearchParams({ oxirgidan: String(oldest) });
      if (current.guruh_id) params.set("guruh_id", String(current.guruh_id));
      else params.set("boshqa_user_id", String(current.user_id));
      if (maktabId) params.set("maktab_id", String(maktabId));
      const data = await kabutarRequest(apiBase, `/api/chat/xabarlar?${params}`, token, { signal: controller.signal });
      if (controller.signal.aborted || peerKey(peerRef.current) !== key) return;
      const element = bodyRef.current;
      const anchor = element?.querySelector?.("[data-kb-message-id]");
      scrollIntent.current = { key, mode: "older", height: element?.scrollHeight || 0, top: element?.scrollTop || 0,
        anchorId: anchor?.getAttribute("data-kb-message-id"), offset: anchor ? anchor.getBoundingClientRect().top - element.getBoundingClientRect().top : undefined };
      setMessages(old => chatMessageWindow(old, Array.isArray(data.xabarlar) ? data.xabarlar : [], true));
      setHasOlder(Boolean(data.yana_bormi)); setMessageError("");
    } catch (error) {
      if (!controller.signal.aborted && peerKey(peerRef.current) === key) setMessageError(error.message);
    } finally {
      if (requestsRef.current.history === entry) { requestsRef.current.history = null; setHistoryBusy(false); }
    }
  };
  const showLatest = () => {
    requestsRef.current.history?.controller.abort();
    historyModeRef.current = false; setHistoryMode(false); setHistoryBusy(false); setNewMessages(0);
    if (peerRef.current) loadMessages(peerRef.current.user_id || 0);
  };
  useEffect(() => {
    if (!foreground || !canWrite || directory?.policy?.eligible !== true || call || mediaBusy || meetingGroupId) return undefined;
    return startKabutarPoll(async signal => {
      const data = await kabutarRequest(apiBase, "/api/kabutar/calls/incoming", token, { authInHeader: true, signal });
      if (signal.aborted || !foregroundRef.current || callRef.current) return false;
      const incoming = data.calls?.[0];
      if (incoming) setCall({ callId: incoming.id, mode: incoming.mode || "audio" });
      return true;
    }, { interval: 10000 });
  }, [apiBase, token, foreground, directory?.policy?.eligible, call, mediaBusy, meetingGroupId, canWrite]);

  const messageAction = async (path, options = {}) => {
    if (requestsRef.current.action) return null;
    const controller = new AbortController(), key = peerKey(peerRef.current);
    const entry = { controller }; requestsRef.current.action = entry;
    try {
      const data = await kabutarRequest(apiBase, path, token, { ...options, signal: controller.signal });
      return !controller.signal.aborted && peerKey(peerRef.current) === key ? data : null;
    } catch (error) { if (!controller.signal.aborted && peerKey(peerRef.current) === key) setSendError(error.message); return null; }
    finally { if (requestsRef.current.action === entry) requestsRef.current.action = null; }
  };
  const forwardTo = async item => {
    if (!forwarding || !canWrite) return;
    const royxat = Array.isArray(forwarding.kop) ? forwarding.kop : [forwarding];   // REV396: bir nechta xabar
    for (const fx of royxat) {
      const params = new URLSearchParams({ xabar_id: String(fx.id) });
      if (item.guruh_id) params.set("guruh_id", String(item.guruh_id));
      else params.set("qabul_qiluvchi_user_id", String(item.user_id));
      const data = await messageAction(`/api/chat/xabar_forward?${params}`, { method: "POST" });
      if (!data) return;
    }
    setForwarding(null); setMenuMessage(null); await loadDirectory();
  };
  // REV206: Telegram/Instagram havolasi (?kabutar_tv=en_1-4-sinf) — kerakli TV kanalini o'zi ochadi
  const tvHavola = React.useRef((() => { try { return window.sessionStorage.getItem("kabutar_tv_ochish") || ""; } catch { return ""; } })());
  useEffect(() => {
    const kod = tvHavola.current;
    const guruhlar = (chatDirectory && chatDirectory.guruhlar) || [];
    if (!kod || !guruhlar.length) return;
    const [til, ...qolgan] = kod.split("_");
    const aud = qolgan.join("_");
    const TIL = { en: "Ingliz", de: "Nemis", fr: "Fransuz", es: "Ispan", ru: "Rus" }[til] || "";
    const norm = (x) => String(x || "").toLowerCase().replace(/\s+/g, "");
    const g = guruhlar.find((x) => x.manba_turi === "kabutar_tv" && norm(x.nomi).includes(norm(TIL)) && norm(x.nomi).endsWith(norm(aud)));
    tvHavola.current = "";
    try { window.sessionStorage.removeItem("kabutar_tv_ochish"); } catch { /* */ }
    if (g) openPeer({ guruh_id: g.id, full_name: g.nomi, izoh: "Kabutar TV · har kuni yangi ko‘rsatuv", rol: "guruh", kanal: true });
    else window.alert(__kbUi("Bu Kabutar TV kanali sizning obunangizda yo‘q. Shu til uchun obuna bo‘lsangiz, kanal o‘zi ochiladi."));
  }, [chatDirectory]); // eslint-disable-line react-hooks/exhaustive-deps

  const openPeer = (item, permissionDirectory = directory, direct = false) => {
    if (direct) setForwarding(null);
    if (forwarding && !direct) { forwardTo(item).catch(error => setSendError(error.message)); return; }
    if (permissionDirectory?.policy?.eligible === false) { setSendError(permissionDirectory.policy.message || "Muassasaga a’zolik tasdiqlanmagan."); return; }
    if (peerKey(peerRef.current) === peerKey(item)) return;
    saveDraft(); requestsRef.current.thread?.controller.abort();
    setThreadTargetId(null); setThreadRoot(null); setThreadMessages([]); setThreadError(""); setThreadBusy(false); setSelectedMessage(null);
    requestsRef.current.history?.controller.abort();
    requestsRef.current.action?.controller.abort();
    if (peerKey(peerRef.current) !== peerKey(item)) outgoingRef.current?.controller.abort();
    readingSubsetRef.current = canvasMode || Boolean(item.guruh_id && groupThreads);
    historyModeRef.current = false; setHistoryMode(false); setHistoryBusy(false); setHasOlder(false); setNewMessages(0); setMenuMessage(null);
    setTanlov(null); setQidiruv(null); setQadalgan(null); setGalereya(null);   // REV396
    peerRef.current = item; lastIdRef.current = 0; setPeer(item); setMessages([]); setPeerSeenId(null); setMessageError(""); restoreDraft(`${peerKey(item)}:main`); setSendError(""); loadMessages(item.user_id || 0);
  };
  useEffect(() => {
    const uid = Number(requestedContact?.userId), schoolId = Number(requestedContact?.schoolId || 0);
    if (!foreground || !Number.isSafeInteger(uid) || uid <= 0) return undefined;
    const requestId = `${apiBase}:${token}:${requestedContact.requestId || `${uid}:${schoolId}`}`;
    if (requestedContactRef.current === requestId) return undefined;
    const controller = new AbortController();
    (async () => {
      try {
        // A link from another workspace carries no authorization: obtain the
        // current server-approved directory, then select its real contact card.
        const data = await kabutarRequest(apiBase, "/api/kabutar/aloqalar_umumiy", token, { signal: controller.signal });
        if (controller.signal.aborted) return;
        const institutions = (data.muassasalar || []).filter(item => !schoolId || item.turi === "maktab" && Number(item.muassasa_id) === schoolId);
        const person = institutions.flatMap(item => item.azolar || []).find(item => Number(item.user_id) === uid);
        requestedContactRef.current = requestId;
        if (!person || data.policy?.eligible !== true) {
          setDirError("Bu xodim bilan amaldagi muassasa aloqasi tasdiqlanmadi. Maktab mas’ulidan biriktirishni tekshirishni so‘rang.");
          return;
        }
        setDirectory(data); setDirError("");
        if (schoolId) setScopeKey(`maktab:${schoolId}`);
        openPeer(person, data, true);
      } catch (error) { if (!controller.signal.aborted) setDirError(error.message); }
    })();
    return () => controller.abort();
  }, [apiBase, token, foreground, requestedContact?.requestId, requestedContact?.userId, requestedContact?.schoolId]);
  useEffect(() => {
    if (!foreground || !peer || historyMode) return undefined;
    return startKabutarPoll(signal => loadMessages(peer.user_id || 0, { incremental: lastIdRef.current > 0, signal }), { interval: 6000 });
  }, [foreground, peer, historyMode, loadMessages]);

  const send = async ({ file = null, fileKind = null, caption = "", conversationKey: mediaKey = null, signal } = {}) => {
    const target = peerRef.current;
    const targetKey = peerKey(target);
    if (!target || !canWrite || directory?.policy?.eligible === false || outgoingRef.current || signal?.aborted || (mediaKey && mediaKey !== composerKeyRef.current)) return false;
    const body = file ? String(caption || "").trim() : text.trim();
    if (!body && !file) return false;
    if (target.guruh_id && threadTargetId && !threadRoot) return false;
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal?.addEventListener("abort", abort, { once: true });
    const sendContext = composerKeyRef.current;
    const reply = replyTo || (target.guruh_id && threadTargetId ? threadRoot : null);
    const entry = { key: targetKey, controller };
    outgoingRef.current = entry;
    const timer = setTimeout(abort, file ? 90000 : 20000);
    const stillHere = () => peerKey(peerRef.current) === targetKey && outgoingRef.current === entry && composerKeyRef.current === sendContext;
    setSending(true); setSendError("");
    try {
      if (editing && !file) {
        const r = await fetch(`${apiBase}/api/chat/xabar_tahrirla`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, signal: controller.signal,
          body: JSON.stringify({ token, xabar_id: editing.id, yangi_matn: body }),
        });
        const d = await r.json();
        if (!r.ok || d.detail) throw new Error(d.detail || "Xabar o‘zgartirilmadi");
        if (stillHere()) {
          setMessages(old => old.map(item => item.id === editing.id ? { ...item, matn: body, tahrirlangan: true } : item));
          setThreadMessages(old => old.map(item => item.id === editing.id ? { ...item, matn: body, tahrirlangan: true } : item));
          setThreadRoot(old => old?.id === editing.id ? { ...old, matn: body, tahrirlangan: true } : old);
          setSelectedMessage(old => old?.id === editing.id ? { ...old, matn: body, tahrirlangan: true } : old);
          setText(""); setEditing(null); draftsRef.current.delete(sendContext);
        }
        return true;
      }
      const form = new FormData();
      form.append("token", token);
      if (target.guruh_id) form.append("guruh_id", String(target.guruh_id));
      else form.append("qabul_qiluvchi_user_id", String(target.user_id));
      if (!target.guruh_id && maktabId) form.append("maktab_id", String(maktabId));
      if (!target.guruh_id && target.kabutar_id) form.append("kabutar_id", target.kabutar_id);
      if (body) form.append("matn", body);
      if (reply) form.append("javob_xabar_id", String(reply.id));
      if (file) { form.append("fayl_turi", fileKind); form.append("fayl", file, file.name || `${fileKind}.webm`); }
      const endpoint = "/api/chat/xabar_yubor";
      const r = await fetch(`${apiBase}${endpoint}`, { method: "POST", body: form, signal: controller.signal });
      const d = await r.json();
      if (!r.ok || d.detail) throw new Error(d.detail || "Yuborilmadi");
      if (stillHere()) {
        if (!file) setText(current => current.trim() === body ? "" : current);
        setReplyTo(null); draftsRef.current.delete(sendContext);
        { const k = suhbatKaliti(peerRef.current); clearTimeout(qoralamaT.current); if (k && preferences.settings.drafts?.[k]) { const d = { ...preferences.settings.drafts }; delete d[k]; preferences.updateSettings({ drafts: d }); } }   // REV393
        if (threadTargetId) setThreadRefresh(value => value + 1);
        scrollIntent.current = { key: targetKey, mode: "bottom" };
        if (messagesRef.current.length >= KABUTAR_MESSAGE_WINDOW) setHasOlder(true);
        const acknowledged = { id: d.id, meniki: true, matn: d.matn ?? (body || null), fayl_turi: d.fayl_turi ?? fileKind, fayl_nomi: d.fayl_nomi ?? file?.name, fayl_hajmi_kb: d.fayl_hajmi_kb, yaratilgan_at: d.yaratilgan_at || new Date().toISOString(), yuboruvchi_user_id: directory?.men?.user_id, javob_xabar_id: reply?.id, javob_yuboruvchi_ismi: reply?.yuboruvchi_ismi, javob_matn_qisqa: reply?.matn };
        setMessages(old => chatMessageWindow(old, [acknowledged]));
        if (threadTargetId) {
          setThreadMessages(old => mergeKabutarMessages(old, [{ ...acknowledged, sentAhead: threadHasMore }]).slice(-200));
          setThreadRoot(old => old ? { ...old, reply_count: Number(old.reply_count || 0) + 1 } : old);
        } else if (canvasMode && !target.guruh_id) setSelectedMessage(acknowledged);
        // Only fetched pages advance lastIdRef; own outgoing IDs may be ahead
        // of incoming messages that have not been fetched yet.
        setNewMessages(0);
        if (historyModeRef.current) { historyModeRef.current = false; setHistoryMode(false); loadMessages(target.user_id || 0); }
      }
      loadDirectory();
      return true;
    } catch (e) {
      if (stillHere()) setSendError(controller.signal.aborted ? "Yuborish to‘xtadi. Qayta yuborishdan oldin suhbatni tekshiring." : e.message);
      return false;
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      if (outgoingRef.current === entry) { outgoingRef.current = null; setSending(false); }
    }
  };

  const removeMessage = async message => {
    if (!message?.meniki) return;
    const data = await messageAction(`/api/chat/xabar_ochir?xabar_id=${message.id}`, { method: "DELETE" });
    if (!data) return;
    const tombstone = item => item?.id === message.id ? { ...item, ochirilgan: true, matn: null, fayl_turi: null, fayl_nomi: null, reaksiyalar: [] } : item;
    setMessages(old => old.map(tombstone)); setThreadMessages(old => old.map(tombstone));
    setThreadRoot(tombstone); setSelectedMessage(tombstone); setMenuMessage(null);
  };

  const reactTo = async (message, emoji) => {
    const params = new URLSearchParams({ xabar_id: String(message.id), emoji });
    const data = await messageAction(`/api/chat/reaksiya_qoy?${params}`, { method: "PUT" });
    if (!data) return;
    await loadMessages(peer.user_id || 0); if (threadTargetId) { setThreadCursor(0); setThreadRefresh(value => value + 1); } setMenuMessage(null);
  };

  const q = query.trim().toLocaleLowerCase("uz");
  const allMuassasalar = directory?.muassasalar || [];
  const scopeList = allMuassasalar.map(m => ({ key: `${m.turi}:${m.muassasa_id}`, ...m }));
  const activeScope = scopeKey === "all" ? null : scopeList.find(m => m.key === scopeKey) || null;
  const scopedMuassasalar = activeScope ? [activeScope] : allMuassasalar;
  const scopedIds = activeScope ? new Set((activeScope.azolar || []).map(a => String(a.user_id))) : null;
  const scopedSuhbatlar = (directory?.suhbatlar || []).filter(x => !scopedIds || scopedIds.has(String(x.user_id)));
  const scopeMeta = activeScope ? (KABUTAR_TURI[activeScope.turi] || KABUTAR_TURI.maktab) : null;
  const accent = scopeMeta ? scopeMeta.rang : palette.button;
  // REV393: Telegram kabi — qadash (📌), arxiv (🗄), ovozsiz (🔕), qoralama
  const sozl = preferences.settings;
  const qadalgan = new Set(sozl.pinned || []), arxivda = new Set(sozl.archived || []), ovozsiz = new Set(sozl.muted || []);
  const almashtir = (nom, kalit) => { const ro = new Set(sozl[nom] || []); if (ro.has(kalit)) ro.delete(kalit); else ro.add(kalit); preferences.updateSettings({ [nom]: [...ro] }); };
  const tartibla = (ro, kalitOl) => ro.filter((x) => arxivKorinish === arxivda.has(kalitOl(x))).sort((a, b) => Number(qadalgan.has(kalitOl(b))) - Number(qadalgan.has(kalitOl(a))));
  const qatorBelgi = (kalit) => <>{qadalgan.has(kalit) && <span className="kb-qator-belgi" title={t("Qadalgan")}>📌</span>}{ovozsiz.has(kalit) && <span className="kb-qator-belgi" title={t("Ovozsiz")}>🔕</span>}</>;
  const qatorTegi = (kalit) => ({ onContextMenu: (e) => { e.preventDefault(); setQatorMenyu({ kalit, x: e.clientX, y: e.clientY }); },
    onTouchStart: () => { clearTimeout(uzoqRef.current); uzoqRef.current = setTimeout(() => { navigator.vibrate?.(15); setQatorMenyu({ kalit, x: 60, y: 160 }); }, 500); },
    onTouchEnd: () => clearTimeout(uzoqRef.current), onTouchMove: () => clearTimeout(uzoqRef.current) });
  const arxivSoni = [...(chatDirectory.guruhlar || []).map((g) => `g${g.id}`), ...(directory?.suhbatlar || []).map((x) => `u${x.user_id}`)].filter((k) => arxivda.has(k)).length;
  const visibleGroups = (chatDirectory.guruhlar || []).filter(group => {
    if (KANALLAR_REJIMI && !String(group.manba_turi || "").startsWith("kabutar_tv")) return false;
    if (!tvKorinadi && !toliq && String(group.manba_turi || "").startsWith("kabutar_tv")) return false;
    if (!institutionGroupVisible(group, activeScope)) return false;
    if (listTab === "personal") return false;
    return !q || String(group.nomi || "").toLocaleLowerCase("uz").includes(q);
  });

  const directoryCandidates = useMemo(() => [...new Map([...scopedSuhbatlar, ...scopedMuassasalar.flatMap(institution => institution.azolar || [])].filter(person => !q || `${person.full_name || ""} ${person.izoh || ""}`.toLocaleLowerCase("uz").includes(q)).map(person => [String(person.user_id), person])).values()], [directory, scopeKey, q]);
  const visibleContactIds = new Set(directoryCandidates.slice(0, directoryLimit).map(person => String(person.user_id)));
  const directoryHasMore = (listTab !== "groups" && directoryCandidates.length > directoryLimit) || visibleGroups.length > directoryLimit;
  const totalUnread = directory?.jami_oqilmagan || 0;
  const posts = useMemo(() => peer?.guruh_id && groupThreads ? kabutarConversationPosts(messages) : messages, [messages, peer?.guruh_id, groupThreads]);
  const selectedDirect = messages.find(message => Number(message.id) === Number(selectedMessage?.id)) || selectedMessage;
  const visibleMessages = threadTargetId ? (threadRoot ? [threadRoot, ...threadMessages] : []) : canvasMode ? (selectedDirect ? [selectedDirect] : []) : posts;
  const xabargaOt = (id) => { const el = bodyRef.current?.querySelector(`[data-kb-message-id="${id}"]`); if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.classList.add("is-yoritilgan"); setTimeout(() => el.classList.remove("is-yoritilgan"), 1400); return true; } return false; };
  const qadash = async (m, olib = false) => {
    const fd = new FormData(); fd.append("token", token); fd.append("xabar_id", String(m.id)); if (olib) fd.append("olib_tashlash", "true");
    try { const r = await fetch(`${String(apiBase || "").replace(/\/+$/, "")}/api/chat/xabar_qadash`, { method: "POST", body: fd }); const j = await r.json().catch(() => ({}));
      if (!r.ok) setSendError(j.detail || "Qadab bo‘lmadi"); else setQadalgan(j.qadalgan || null); } catch { setSendError("Qadab bo‘lmadi. Internetni tekshiring."); }
    setMenuMessage(null);
  };
  const onReply = message => {
    if (peer?.guruh_id && groupThreads && !threadTargetId) { selectMessage(message); return; }
    setReplyTo(message); setMenuMessage(null); textareaRef.current?.focus();
  };
  useEffect(() => {
    if (directory?.policy?.eligible === false) { setPeer(null); peerRef.current = null; setMessages([]); setCall(null); setMeetingGroupId(null); outgoingRef.current?.controller.abort(); }
  }, [directory?.policy?.eligible]);

  return <div className={`kb-panel kb-chat45 ${docked ? "kb-chat45--docked" : "kb-chat45--full"} ${peer ? "kb-chat45--conversation" : ""}`} style={{ background: palette.cream }} data-kb-layout={canvasMode ? "canvas" : "classic"}>
    <div className={`kb-panel-header ${docked ? "px-3 py-2.5" : "px-4 md:px-7 py-4"} flex items-center justify-between gap-3 border-b bg-white shrink-0`} style={{ borderColor: palette.line }}>
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onClose} title={t(docked ? "Yig‘ish" : "Yopish")} className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: palette.sky, color: palette.blue }}>{docked ? __kbUi("▾") : <ArrowLeft size={18}/>}</button>
        <div className="min-w-0"><div className="text-[10px] font-black uppercase tracking-[.14em]" style={{ color: palette.blue }}>🕊 {activeScope ? __kbUi(`${scopeMeta.ikon} ${activeScope.muassasa} Kabutari`) : t("Kabutar · barcha muassasalar")}</div>{!docked && <div className="text-lg font-black truncate" style={{ color: palette.ink }}>{activeScope ? __kbUi(`${scopeMeta.nom} — rasmiy aloqa`) : title}</div>}</div>
      </div>
      <div className="kb-header-account flex items-center gap-2"><KabutarAccountButton me={directory?.men} apiBase={apiBase} onProfile={() => setAccountView({ page: "profile" })} onSettings={() => setAccountView({ page: "settings" })}/>{totalUnread > 0 && <span className="px-2.5 py-1 rounded-full text-xs font-black text-white shrink-0" style={{ background: "var(--ui-danger-action, #a23d45)" }}>{totalUnread}{t("yangi")}</span>}</div>
    </div>
    <KabutarTerms key={termsKey} apiBase={apiBase} token={token} onAccepted={() => setTermsAcceptedKey(termsKey)} />
    {forwarding && <div className="px-4 py-2 flex items-center justify-between gap-3 text-xs font-bold text-white" style={{ background: palette.button }}><span><Forward size={14} className="inline mr-1"/>{Array.isArray(forwarding?.kop) ? __kbUi(`${forwarding.kop.length} ${t("ta xabarni uzatish uchun guruh yoki odamni tanlang")}`) : t("Xabarni uzatish uchun guruh yoki odamni tanlang")}</span><button onClick={() => setForwarding(null)} className="px-2 py-1 rounded-lg bg-white/20">{t("Bekor qilish")}</button></div>}
    <div className="kb-chat-layout">
      <aside className="kb-chat-directory" style={{ borderColor: palette.line }}>
        <div className="p-3 sticky top-0 bg-white z-10 border-b" style={{ borderColor: palette.line }}><div className="relative"><Search size={15} className="absolute left-3 top-2.5" style={{ color: palette.muted }}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder={t("Suhbat, guruh yoki ism…")} aria-label={t("Aloqalar ichidan qidirish")} className="w-full pl-9 pr-3 py-2 rounded-xl border text-sm outline-none" style={{ borderColor: palette.line }}/></div><div className="flex gap-1 mt-2 overflow-x-auto">{KANALLAR_REJIMI ? <small className="text-[11px] font-bold" style={{ color: palette.muted }}>{t("📺 Kanallar — ko‘rsatuvlarni ko‘ring va ostiga izoh yozing")}</small> : [["all","Barchasi"],["groups","Guruhlar"],["personal","Shaxsiy"]].map(([key,label]) => <button key={key} onClick={() => setListTab(key)} className={`kb-papka ${listTab === key ? "is-on" : ""} px-3 py-1.5 rounded-full text-[11px] font-black whitespace-nowrap`} style={listTab === key ? { background: accent, color: "#fff" } : { background: palette.sky, color: palette.blue }}>{t(label)}</button>)}</div></div>
        {dirError && <div className="m-3 p-3 rounded-xl text-xs" style={{ background: palette.redBg, color: palette.red }}>{t(dirError)}</div>}
        {!directory && !dirError && <div className="p-6 text-center"><Loader2 className="mx-auto animate-spin" style={{ color: palette.blue }}/></div>}
        {directory && <div className={`kb-institution-notice ${directory.policy?.eligible === false ? "is-restricted" : ""}`}><ShieldCheck size={17}/><span>{directory.policy?.eligible === false ? (directory.policy.message || __kbUi("Muassasadagi a’zoligingiz tasdiqlangach suhbatlar ochiladi.")) : t("Muassasangizdagi ruxsat etilgan aloqalar")}</span></div>}
        {directory && <button type="button" className="kb-blocks-link" onClick={() => setSafetyView({ mode: "blocks" })}>{t("Bloklangan aloqalar")}</button>}
        {directory && showScopeStrip && scopeList.length > 0 && <div className="p-3 border-b" style={{ borderColor: palette.line, background: "var(--ui-surface, #fff)" }}>
          <div className="text-[10px] font-black uppercase tracking-[.12em] mb-1.5" style={{ color: palette.muted }}>{t("Qaysi muassasa Kabutari")}</div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {[{ key: "all", turi: null, muassasa: "Hammasi" }, ...scopeList].map(m => { const meta = m.turi ? (KABUTAR_TURI[m.turi] || KABUTAR_TURI.maktab) : { ikon: "🕊", rang: palette.ink, yengil: palette.cream }; const on = scopeKey === m.key; const unread = m.turi ? (m.azolar || []).reduce((sum, a) => sum + Number(a.oqilmagan || 0), 0) : (directory.jami_oqilmagan || 0); return <button key={m.key} type="button" onClick={() => { leaveConversation(); setScopeKey(m.key); }} className="shrink-0 rounded-xl border px-2.5 py-1.5 text-left transition" style={on ? { background: m.turi ? meta.rang : palette.button, borderColor: m.turi ? meta.rang : palette.button, color: "#fff", transform: "scale(1.04)" } : { background: `var(--ui-accent-soft, ${meta.yengil})`, borderColor: palette.line, color: palette.ink }} title={m.muassasa}><div className="text-[11px] font-black whitespace-nowrap max-w-[150px] truncate">{meta.ikon} {m.turi ? m.muassasa : t(m.muassasa)}{unread > 0 && <span className="ml-1 inline-flex min-w-[16px] h-4 px-1 rounded-full text-[9px] items-center justify-center" style={{ background: on ? "rgba(255,255,255,.25)" : "var(--ui-danger-action, #a23d45)", color: "#fff" }}>{unread}</span>}</div></button>; })}
          </div>
        </div>}
        {directory && directory.policy?.eligible !== false && <details className="kb-directory-find"><summary>{t("KB raqami orqali aloqa topish")}</summary><div className="p-3 border-b" style={{ borderColor: palette.line, background: "var(--ui-bg, #f7faf8)" }}>
          <div className="text-[10px] font-black uppercase tracking-[.12em] mb-1.5" style={{ color: palette.muted }}>{t("Ruxsat etilgan aloqalar ichidan")}</div>
          <div className="flex gap-1.5"><input value={idQuery} onChange={e => setIdQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && searchById()} placeholder={t("KB-123456 · @nik · +998…")} className="min-w-0 flex-1 px-3 py-2 rounded-xl border text-sm outline-none" style={{ borderColor: palette.line }}/><button onClick={searchById} disabled={idBusy} className="px-3 rounded-xl text-sm font-black text-white" style={{ background: palette.button }}>{idBusy ? __kbUi("...") : t("Top")}</button></div>
          {idError && <div className="mt-1.5 text-[11px] font-bold" style={{ color: palette.red }}>{t(idError)}</div>}
          {idResult && <button onClick={() => { setAccountView({ page: "profile", person: { ...idResult, izoh: idResult.qisqa, rol: "suhbat" } }); setIdResult(null); setIdQuery(""); }} className="mt-2 w-full text-left rounded-xl border p-2.5" style={{ borderColor: palette.green, background: palette.mint }}><div className="text-sm font-black" style={{ color: palette.ink }}>{idResult.full_name} <span className="text-[10px]" style={{ color: palette.green }}>✓ {idResult.kabutar_id}</span></div>{(idResult.rollar || []).map((r, i) => <div key={i} className="text-[11px]" style={{ color: palette.muted }}>{__kbUi(r.rol)}{r.muassasa ? __kbUi(` — ${r.muassasa}`) : __kbUi("")}</div>)}<div className="text-[10px] mt-1 font-black" style={{ color: palette.blue }}>{t("Profilini ko‘rish ›")}</div></button>}
        </div></details>}
        {directory && !KANALLAR_REJIMI && (arxivSoni > 0 || arxivKorinish) && <button type="button" className="kb-arxiv-qator" onClick={() => setArxivKorinish((x) => !x)}>
          <span className="kb-arxiv-belgi" aria-hidden="true">{arxivKorinish ? "←" : "🗄"}</span><span>{arxivKorinish ? t("Barcha suhbatlarga qaytish") : t("Arxiv")}</span>{!arxivKorinish && <small>{arxivSoni}</small>}</button>}
        {directory && visibleGroups.length > 0 && <div className="border-b" style={{ borderColor: palette.line }}>
          <div className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-[.12em]" style={{ color: palette.blue }}>{t("Avtomatik guruhlar")}</div>
          {tartibla(visibleGroups, (g) => `g${g.id}`).slice(0, directoryLimit).map(group => <button key={`g-${group.id}`} {...qatorTegi(`g${group.id}`)} onClick={() => openPeer({ guruh_id: group.id, full_name: group.nomi, izoh: String(group.manba_turi || "").startsWith("kabutar_tv") ? (group.manba_turi === "kabutar_tv_markaz" ? "Markaz TV · har kuni yangi ko‘rsatuv" : "Kabutar TV · har kuni yangi ko‘rsatuv") : `${group.turi} · rasmiy guruh`, rol: "guruh", kanal: String(group.manba_turi || "").startsWith("kabutar_tv") })} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50" style={{ background: peer?.guruh_id === group.id ? palette.sky : undefined }}>
            <div className="kb-list-avatar w-10 h-10 rounded-full flex items-center justify-center text-lg text-white shrink-0" style={{ background: avatarRangi(group.nomi) }}>👥</div>
            <div className="min-w-0 flex-1"><div className="text-sm font-black truncate" style={{ color: palette.ink }}>{qatorBelgi(`g${group.id}`)}{group.nomi}</div><div className="text-[11px] truncate" style={{ color: palette.muted }}>{preferences.settings.showPreviews ? (group.oxirgi_matn || (group.oxirgi_fayl_turi ? t("Media xabar") : t("Hali xabar yo‘q"))) : t("Guruh xabarlari")}</div></div>
            {Number(group.okilmagan_soni || 0) > 0 && <span className={`min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-black text-white flex items-center justify-center ${ovozsiz.has(`g${group.id}`) ? "is-ovozsiz" : ""}`} style={{ background: "var(--ui-danger-action, #a23d45)" }}>{group.okilmagan_soni}</span>}
          </button>)}
        </div>}
        {directory && !KANALLAR_REJIMI && listTab !== "groups" && __kbUi((() => { const list = tartibla(scopedSuhbatlar.filter(x => visibleContactIds.has(String(x.user_id))).filter(x => !q || String(x.full_name).toLocaleLowerCase("uz").includes(q) || String(x.izoh || "").toLocaleLowerCase("uz").includes(q)), (x) => `u${x.user_id}`); if (!list.length) return null; return <div>
          <div className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-[.12em]" style={{ color: palette.ink }}>{t("Suhbatlarim")}</div>
          {list.map(item => <button key={`s-${item.user_id}`} {...qatorTegi(`u${item.user_id}`)} onClick={() => openPeer({ ...item, rol: item.tashqi ? "tashqi" : "suhbat" })} className={`kb-list-row w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 ${peer?.user_id === item.user_id ? "is-on" : ""}`} style={{ background: peer?.user_id === item.user_id ? palette.sky : undefined }}>
            <div className="kb-list-avatar w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0" style={{ background: avatarRangi(item.full_name) }}>{__kbUi(kabutarInitials(item.full_name))}</div>
            <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><div className="text-sm font-black truncate" style={{ color: palette.ink }}>{qatorBelgi(`u${item.user_id}`)}{item.full_name}</div>{item.oxirgi_xabar_at && <span className="text-[10px] shrink-0" style={{ color: palette.muted }}>{__kbUi(kabutarTime(item.oxirgi_xabar_at, locale))}</span>}</div><div className="text-[11px] truncate" style={{ color: palette.muted }}>{sozl.drafts?.[`u${item.user_id}`] && peer?.user_id !== item.user_id ? <><span className="kb-qoralama">{t("Qoralama")}:</span> {sozl.drafts[`u${item.user_id}`]}</> : preferences.settings.showPreviews ? __kbUi(`${item.izoh ? item.izoh + " · " : ""}${item.oxirgi_meniki ? "Siz: " : ""}${item.oxirgi_matn || ""}`) : t("Shaxsiy suhbat")}</div></div>
            {item.oqilmagan > 0 && <span className={`min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-black text-white flex items-center justify-center ${ovozsiz.has(`u${item.user_id}`) ? "is-ovozsiz" : ""}`} style={{ background: "var(--ui-danger-action, #a23d45)" }}>{item.oqilmagan}</span>}
          </button>)}
        </div>; })())}
        {directory && !KANALLAR_REJIMI && listTab !== "groups" && scopedMuassasalar.map(m => { const groupsHere = KABUTAR_GROUPS.map(([key, label, color]) => [key, label, color, (m.azolar || []).filter(a => visibleContactIds.has(String(a.user_id)) && a.guruh === key && (!q || String(a.full_name).toLocaleLowerCase("uz").includes(q) || String(a.izoh || "").toLocaleLowerCase("uz").includes(q)))]).filter(g => g[3].length); if (!groupsHere.length) return null; return <div key={`${m.turi}-${m.muassasa_id}`}>
          <div className="px-4 pt-4 pb-1 text-[11px] font-black flex items-center gap-2" style={{ color: (KABUTAR_TURI[m.turi] || KABUTAR_TURI.maktab).rang }}><span>{(KABUTAR_TURI[m.turi] || KABUTAR_TURI.maktab).ikon}</span><span className="truncate">{m.muassasa}</span><span className="text-[10px] font-semibold" style={{ color: palette.muted }}>· {(KABUTAR_TURI[m.turi] || KABUTAR_TURI.maktab).nom}{t("Kabutari")}</span></div>
          {groupsHere.map(([key, label, color, items]) => <div key={key}>
            <div className="px-4 pt-2 pb-1 text-[10px] font-black uppercase tracking-[.12em] flex items-center justify-between" style={{ color }}>{t(label)}<span style={{ color: palette.muted }}>{__kbUi(items.length)}</span></div>
            {items.map(item => <button key={item.user_id} onClick={() => openPeer({ ...item, rol: key })} className={`kb-list-row w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 ${peer?.user_id === item.user_id ? "is-on" : ""}`} style={{ background: peer?.user_id === item.user_id ? palette.sky : undefined }}>
              <div className="kb-list-avatar w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0" style={{ background: avatarRangi(item.full_name) }}>{__kbUi(kabutarInitials(item.full_name))}</div>
              <div className="min-w-0 flex-1"><div className="text-sm font-black truncate" style={{ color: palette.ink }}>{item.full_name} <span className="text-[10px] font-semibold" style={{ color: palette.green }}>✓</span></div><div className="text-[11px] truncate" style={{ color: palette.muted }}>{__kbUi(item.izoh)}</div></div>
              {item.oqilmagan > 0 && <span className="min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-black text-white flex items-center justify-center" style={{ background: "var(--ui-danger-action, #a23d45)" }}>{__kbUi(item.oqilmagan)}</span>}
            </button>)}
          </div>)}
        </div>; })}
        {directory && !scopedSuhbatlar.length && !scopedMuassasalar.some(m => (m.azolar || []).length) && <div className="p-6 text-center text-xs" style={{ color: palette.muted }}>{t("Hozircha ruxsat etilgan aloqa topilmadi. Sinf yoki xodimlar ro‘yxatiga biriktirilganingizni muassasa mas’ulidan tekshirtiring.")}</div>}
        {directoryHasMore && <div className="kb-chat-directory-more"><button type="button" onClick={() => setDirectoryLimit(value => value + 60)}>{t("Yana ko‘rsatish")}</button><small>{t("Kontaktlar sahifalab ko‘rsatiladi.")}</small></div>}
      </aside>
      <section className="kb-chat-conversation" aria-label={peer ? __kbUi(`${peer.full_name} · ${t("Suhbat")}`) : t("Kabutar suhbat oynasi")}>
        {!peer && <div className="flex-1 flex items-center justify-center p-8 text-center"><div><div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-3" style={{ background: palette.sky }}><MessageCircle size={28} style={{ color: palette.blue }}/></div><div className="font-black" style={{ color: palette.ink }}>{t("Suhbatdoshni tanlang")}</div><p className="text-xs mt-1 max-w-xs" style={{ color: palette.muted }}>{t("Sinfdoshlar, hamkasblar va sizga biriktirilgan ta’lim xodimlari bilan aloqa. Matn, rasm, ovoz va video xabar yuboring. Suhbatlar muassasadagi ruxsatlarga bog‘liq.")}</p></div></div>}
        {peer && <>
          <div className="kb-chat-peerbar" style={{ borderColor: palette.line }}>
            <button onClick={leaveConversation} aria-label={t("Suhbatlar ro‘yxatiga qaytish")} className="kb-chat-back kb-icon-button" style={{ background: palette.sky, color: palette.blue }}><ArrowLeft size={16}/></button>
            <button type="button" className="kb-peer-profile" onClick={() => setAccountView({ page: "profile", person: peer })} aria-label={__kbUi(`${peer.full_name} · ${t("Profilini ko‘rish")}`)}><span className="kb-avatar" style={{ background: peer.guruh_id ? avatarRangi(peer.full_name) : avatarRangi(peer.full_name) }}>{__kbUi(kabutarInitials(peer.full_name))}</span><span><strong>{peer.full_name}</strong>{(peerHolat.yozmoqda || peerHolat.kimlar.length > 0)
              ? <small className="kb-yozmoqda">{peerHolat.kimlar.length ? __kbUi(`${peerHolat.kimlar.join(", ")} `) : ""}{t("yozmoqda")}<i /><i /><i /></small>
              : <small className={peerHolat.matn === "onlayn" ? "kb-onlayn" : ""}>{peerHolat.matn ? t(peerHolat.matn) : t(peer.guruh_id ? "Guruh ma’lumotini ko‘rish" : "Profilini ko‘rish")}{peer.izoh ? __kbUi(` · ${peer.izoh}`) : __kbUi("")}</small>}</span></button>
            {!peer.guruh_id && directory?.policy?.eligible === true && <div className="kb-chat-calls"><button type="button" className="kb-icon-button" disabled={!canWrite || Boolean(call) || mediaBusy || Boolean(meetingGroupId)} onClick={() => setCall({ peer: { id: peer.user_id, name: peer.full_name }, mode: "audio" })} aria-label={t("Ovozli qo‘ng‘iroq")} title={t("Ovozli qo‘ng‘iroq")}><Phone size={19}/></button><button type="button" className="kb-icon-button" disabled={!canWrite || Boolean(call) || mediaBusy || Boolean(meetingGroupId)} onClick={() => setCall({ peer: { id: peer.user_id, name: peer.full_name }, mode: "video" })} aria-label={t("Videoqo‘ng‘iroq")} title={t("Videoqo‘ng‘iroq")}><Video size={20}/></button></div>}
            {peer.guruh_id && directory?.policy?.eligible === true && <button type="button" className="kb-icon-button" title={t("Guruh video yig‘ilishi")} aria-label={t("Guruh video yig‘ilishiga kirish")} disabled={!canWrite || Boolean(call) || mediaBusy || Boolean(meetingGroupId)} onClick={() => setMeetingGroupId(peer.guruh_id)}><Video size={20}/></button>}
            <button type="button" className="kb-icon-button" title={t("Suhbatdan qidirish")} aria-label={t("Suhbatdan qidirish")} onClick={() => setQidiruv((x) => (x ? null : { matn: "", i: 0 }))}><Search size={18}/></button>
            {!peer.guruh_id && <button type="button" className="kb-icon-button kb-chat-safety-button" title={t("Shikoyat yoki bloklash")} aria-label={t("Shikoyat yuborish yoki bloklash")} onClick={() => setSafetyView({ mode: "report", person: peer })}><ShieldCheck size={18}/></button>}
          </div>
          {tanlov && (() => { const tanl = messages.filter((x) => tanlov.has(x.id)); const meniki = tanl.filter((x) => x.meniki);
            return <div className="kb-tanlov-bar" role="toolbar" aria-label={t("Tanlangan xabarlar")}>
              <button type="button" onClick={() => setTanlov(null)} aria-label={t("Bekor qilish")}>✕</button>
              <b>{__kbUi(`${tanlov.size} ${t("ta tanlandi")}`)}</b>
              <button type="button" onClick={() => { navigator.clipboard?.writeText(tanl.map((x) => x.matn || "").filter(Boolean).join("\n\n")); setTanlov(null); }}><Copy size={16}/> {t("Nusxalash")}</button>
              {canWrite && <button type="button" onClick={() => { setForwarding({ kop: tanl }); setTanlov(null); leaveConversation(); }}><Forward size={16}/> {t("Uzatish")}</button>}
              <button type="button" disabled={!meniki.length} title={meniki.length < tanl.length ? t("Faqat o‘z xabarlaringiz o‘chadi") : ""}
                onClick={async () => { if (!window.confirm(__kbUi(`${meniki.length} ${t("ta xabar o‘chirilsinmi?")}`))) return; for (const x of meniki) await removeMessage(x); setTanlov(null); }}><Trash2 size={16}/> {t("O‘chirish")}</button>
            </div>; })()}
          {qidiruv && (() => { const q2 = qidiruv.matn.trim().toLocaleLowerCase("uz"); const topil = q2 ? messages.filter((x) => !x.ochirilgan && String(x.matn || "").toLocaleLowerCase("uz").includes(q2)).map((x) => x.id) : [];
            const ot = (i) => { const n = (i + topil.length) % topil.length; setQidiruv({ ...qidiruv, i: n }); xabargaOt(topil[topil.length - 1 - n]); };
            return <div className="kb-qidiruv-bar"><Search size={16}/><input autoFocus value={qidiruv.matn} placeholder={t("Suhbatdan qidirish")} onChange={(e) => setQidiruv({ matn: e.target.value, i: 0 })}
              onKeyDown={(e) => { if (e.key === "Enter" && topil.length) ot(qidiruv.i + (e.shiftKey ? -1 : 1)); if (e.key === "Escape") setQidiruv(null); }} />
              <small>{q2 ? (topil.length ? `${Math.min(qidiruv.i + 1, topil.length)} / ${topil.length}` : t("topilmadi")) : ""}</small>
              <button type="button" disabled={!topil.length} onClick={() => ot(qidiruv.i - 1)} aria-label={t("Oldingi")}>▲</button>
              <button type="button" disabled={!topil.length} onClick={() => ot(qidiruv.i + 1)} aria-label={t("Keyingi")}>▼</button>
              <button type="button" onClick={() => setQidiruv(null)} aria-label={t("Yopish")}>✕</button></div>; })()}
          {qadalganXabar && !threadTargetId && <div className="kb-qadalgan-bar">
            <button type="button" className="kb-qadalgan-matn" onClick={() => { if (!xabargaOt(qadalganXabar.id)) setSendError("Qadalgan xabar eski xabarlar orasida — «Oldingi xabarlar» ni oching."); }}>
              <b>📌 {t("Qadalgan xabar")}</b><span>{qadalganXabar.matn || t("Media xabar")}</span></button>
            <button type="button" className="kb-qadalgan-yop" onClick={() => qadash({ id: qadalganXabar.id }, true)} aria-label={t("Qadashni olib tashlash")}>✕</button></div>}
          <div className="kb-chat-viewbar" aria-label={t("Suhbat ko‘rinishi")}>
            <div className="kb-chat-view-switch"><button type="button" aria-pressed={!canvasMode} disabled={sending || mediaBusy} onClick={() => setDisplayMode("classic")}>{t("Klassik")}</button><button type="button" aria-pressed={canvasMode} disabled={sending || mediaBusy} onClick={() => setDisplayMode("canvas")}>{t("Xabarlar maydoni")}</button></div>
            {peer.guruh_id && <button type="button" className="kb-chat-thread-toggle" aria-pressed={groupThreads} disabled={sending || mediaBusy} onClick={() => { if (threadTargetId) closeDiscussion(); preferences.updateSettings({ groupThreads: !groupThreads }); }}>{t("Izohlarni yig‘ish")}</button>}
            <button type="button" className="kb-chat-layout-settings" onClick={() => setAccountView({ page: "settings" })}>{t("Ko‘rinishni sozlash")}</button>
          </div>
          {canvasMode && <KabutarMessageCanvas key={`${apiBase}:${directory?.men?.user_id}:${conversationKey}`} messages={posts} selectedId={threadRoot?.id || threadTargetId || selectedDirect?.id} onSelect={selectMessage} layout={preferences.settings.canvasShape || "keyboard"} height={preferences.settings.canvasHeight || 30} showPreviews={preferences.settings.showPreviews}/>}
          {threadTargetId && <div className="kb-discussion-bar"><button type="button" onClick={closeDiscussion} disabled={sending || mediaBusy}><ArrowLeft size={15}/>{t("Barcha xabarlar")}</button><span><strong>{t("Muhokama")}</strong><small>{__kbUi(Number(threadRoot?.reply_count || 0))} {t("ta izoh")}</small></span><button type="button" className="kb-discussion-new" onClick={closeDiscussion} disabled={sending || mediaBusy}><Pencil size={14}/>{t("Yangi xabar")}</button></div>}
          <div ref={bodyRef} className="kb-chat-messages" onClick={event => { if (menuMessage && !event.target.closest?.(".kb-message-menu,.kb-message-more")) setMenuMessage(null); }} onScroll={() => { if (!readingSubsetRef.current && !historyModeRef.current && newMessages && chatNearBottom(bodyRef.current)) { setNewMessages(0); markSeen(peer.user_id || 0, lastIdRef.current, peer.guruh_id); } }}>
            {hasOlder && !threadTargetId && <div className="kb-chat-history"><button type="button" onClick={loadOlder} disabled={historyBusy || messageLoading}>{t(historyBusy ? "Yuklanmoqda…" : "Oldingi xabarlar")}</button></div>}
            {messageLoading && !messages.length && <p role="status" className="kb-chat-loading">{t("Xabarlar yuklanmoqda…")}</p>}
            {!threadTargetId && !messageLoading && !messageError && !messages.length && <div className="text-center text-xs py-10" style={{ color: palette.muted }}>{t("Hali xabar yo‘q — birinchisini yozing.")}</div>}
            {threadBusy && !threadRoot && <p role="status" className="kb-chat-loading">{t("Muhokama yuklanmoqda…")}</p>}
            {threadError && <div className="kb-thread-error" role="alert">{t(threadError)}<button type="button" onClick={() => { setThreadCursor(0); setThreadRefresh(value => value + 1); }}>{t("Qayta urinish")}</button></div>}
            {threadLegacyTruncated && <p className="kb-thread-error">{t("Eski muhokamaning ayrim ichki javoblari bu sahifada sig‘madi. Ularni klassik suhbatda oching.")}<button type="button" disabled={sending || mediaBusy} onClick={() => { closeDiscussion(); preferences.updateSettings({ messageLayout: "classic", groupThreads: false }); }}>{t("Barcha xabarlarni ko‘rish")}</button></p>}
            {threadTruncated && <div className="kb-chat-history"><p>{t("Oldingi izohlar sahifalab ochiladi.")}</p><button type="button" disabled={threadBusy} onClick={() => { setThreadCursor(0); setThreadTruncated(false); setThreadRefresh(value => value + 1); }}>{t("Muhokamani boshidan o‘qish")}</button></div>}
            {canvasMode && !threadTargetId && !selectedDirect && messages.length > 0 && <div className="kb-canvas-read-hint"><MessageCircle size={28}/><strong>{t("Yuqoridan xabarni tanlang")}</strong><p>{t("Xabar shu yerda to‘liq ochiladi. Yangi xabar yozish maydoni doim pastda.")}</p></div>}
            {visibleMessages.map((m, index) => <React.Fragment key={m.id}>{threadTargetId && m.sentAhead && threadHasMore && <p className="kb-discussion-gap">{t("Yangi izohingiz yuborildi. Oldingi izohlarni pastdagi tugma orqali oching.")}</p>}{threadTargetId && index === 1 && <div className="kb-discussion-comments-label">{t("Izohlar")}</div>}{chatDateKey(m.yaratilgan_at) !== chatDateKey(visibleMessages[index - 1]?.yaratilgan_at) && <div className="kb-chat-date"><span>{__kbUi(chatDateLabel(m.yaratilgan_at, new Date(), locale, t))}</span></div>}<div data-kb-message-id={m.id} className={`kb-message-row ${tanlov?.has(m.id) ? "is-tanlangan" : ""} ${tanlov ? "is-tanlov" : ""} ${m.meniki ? "kb-message-row--own" : ""} ${threadTargetId && index === 0 ? "kb-message-row--root" : ""} ${canvasMode && !threadTargetId ? "kb-message-row--selected" : ""}`}>
              <div onDoubleClick={() => onReply(m)} onContextMenu={event => { event.preventDefault(); setMenuMessage(menuMessage?.id === m.id ? null : m); }}
                onTouchStart={(e) => { const tch = e.touches?.[0]; surish.current = tch ? { id: m.id, x0: tch.clientX, y0: tch.clientY, dx: 0, el: e.currentTarget } : null;
                  clearTimeout(uzoqRef.current); uzoqRef.current = setTimeout(() => { if (!m.ochirilgan && !tanlov) { navigator.vibrate?.(15); setMenuMessage(m); } }, 450); }}
                onTouchMove={(e) => { clearTimeout(uzoqRef.current); const sv = surish.current, tch = e.touches?.[0]; if (!sv || !tch || tanlov || m.ochirilgan || peer.kanal) return;
                  const dx = tch.clientX - sv.x0, dy = Math.abs(tch.clientY - sv.y0); if (dy > 30 || dx < 0) { sv.el.style.transform = ""; return; }
                  sv.dx = Math.min(80, dx); sv.el.style.transform = `translateX(${sv.dx}px)`; sv.el.classList.toggle("is-surildi", sv.dx > 55); }}
                onTouchEnd={() => { clearTimeout(uzoqRef.current); const sv = surish.current; surish.current = null; if (!sv) return;
                  sv.el.style.transform = ""; sv.el.classList.remove("is-surildi"); if (sv.dx > 55) { navigator.vibrate?.(10); onReply(m); } }}
                onClickCapture={(e) => { if (!tanlov || m.ochirilgan) return; e.preventDefault(); e.stopPropagation();
                  const n = new Set(tanlov); if (n.has(m.id)) n.delete(m.id); else n.add(m.id); setTanlov(n.size ? n : null); }}
                className={`kb-chat-bubble ${m.meniki ? "kb-chat-bubble--own" : ""} ${visibleMessages[index + 1]?.meniki === m.meniki && chatDateKey(visibleMessages[index + 1]?.yaratilgan_at) === chatDateKey(m.yaratilgan_at) ? "is-davomi" : "is-oxirgi"}`} style={{ color: palette.ink }}>
                {peer.guruh_id && !m.meniki && <strong className="kb-chat-sender">{m.yuboruvchi_ismi || t("Guruh a’zosi")}</strong>}
                {m.ochirilgan && <span className="kb-deleted-message">{t("Xabar o‘chirilgan")}</span>}
                {m.javob_xabar_id && !threadTargetId && <div className="kb-reply-quote mb-1.5 pl-2 border-l-2 text-[11px] opacity-75" role="button" tabIndex={0}
                  onClick={() => { const el = bodyRef.current?.querySelector(`[data-kb-message-id="${m.javob_xabar_id}"]`); if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.classList.add("is-yoritilgan"); setTimeout(() => el.classList.remove("is-yoritilgan"), 1400); } }}><b>{m.javob_yuboruvchi_ismi || t("Xabar")}</b><div className="truncate">{m.javob_matn_qisqa || t("Media")}</div></div>}
                {!m.ochirilgan && m.matn && !isPhotoMessage(m) && <div className="whitespace-pre-wrap break-words" style={{ fontSize: preferences.settings.textSize, lineHeight: 1.55 }}>{m.matn}</div>}
                {!m.ochirilgan && m.fayl_turi === "audio" && <div className="kb-ovozli"><audio controls preload="none" className="mt-1 w-56 max-w-full" ref={(el) => { if (el) el.playbackRate = ovozTezlik; }} src={`${apiBase}/api/chat/fayl/${m.id}?token=${encodeURIComponent(token)}`}/>
                  <button type="button" className="kb-ovoz-tezlik" onClick={(e) => { e.stopPropagation(); const n = ovozTezlik === 1 ? 1.5 : ovozTezlik === 1.5 ? 2 : 1; setOvozTezlik(n); bodyRef.current?.querySelectorAll(".kb-ovozli audio").forEach((a) => { a.playbackRate = n; }); }} title={t("Tinglash tezligi")}>{String(ovozTezlik).replace(".", ",")}×</button></div>} 
                {!m.ochirilgan && m.fayl_turi === "video" && <video controls playsInline preload="none" className={`mt-1 ${peer?.kanal ? "w-[560px]" : "w-64"} max-w-full rounded-lg`} src={`${apiBase}/api/chat/fayl/${m.id}?token=${encodeURIComponent(token)}`}/>} 
                {!m.ochirilgan && m.fayl_turi === "video_doira" && <video controls playsInline preload="none" className="mt-1 w-48 h-48 max-w-full rounded-full object-cover border-4 border-white/40" src={`${apiBase}/api/chat/fayl/${m.id}?token=${encodeURIComponent(token)}`}/>} 
                {!m.ochirilgan && isPhotoMessage(m) && <div className="mt-1"><a href={`${apiBase}/api/chat/fayl/${m.id}?token=${encodeURIComponent(token)}`} target="_blank" rel="noreferrer" onClick={(e) => { if (tanlov) return; e.preventDefault(); setGalereya(m.id); }}><img loading="lazy" decoding="async" alt={m.fayl_nomi || t("Yuborilgan rasm")} className="kb-inline-photo" src={`${apiBase}/api/chat/fayl/${m.id}?token=${encodeURIComponent(token)}`}/></a>{m.matn && <div className="mt-2 whitespace-pre-wrap break-words" style={{ fontSize: preferences.settings.textSize, lineHeight: 1.55 }}>{m.matn}</div>}</div>}
                {!m.ochirilgan && m.fayl_turi === "hujjat" && !isPhotoMessage(m) && <a href={`${apiBase}/api/chat/fayl/${m.id}?token=${encodeURIComponent(token)}`} target="_blank" rel="noreferrer" className="mt-1 flex items-center gap-2 text-xs font-black underline"><Download size={14}/> {m.fayl_nomi || t("Hujjat")}{m.fayl_hajmi_kb ? __kbUi(` · ${m.fayl_hajmi_kb} KB`) : __kbUi("")}</a>}
                {!m.ochirilgan && (m.reaksiyalar || []).length > 0 && <div className="flex flex-wrap gap-1 mt-1">{m.reaksiyalar.map(item => <span key={item.emoji} className="px-1.5 py-0.5 rounded-full text-[10px]" style={{ background: palette.sky }}>{item.emoji} {item.soni}</span>)}</div>}
                {peer.guruh_id && !threadTargetId && (groupThreads || peer.kanal) && <button type="button" className="kb-discussion-open" disabled={sending || mediaBusy} onClick={() => selectMessage(m)}><MessageCircle size={15}/>{m.earlierThread ? t("Oldingi muhokamani ochish") : __kbUi(`${Number(m.reply_count || 0)} ${t("ta izoh")}`)}<span>{t("Ochish")} ›</span></button>}
                <div className="mt-1 text-[10px] text-right" style={{ opacity: .75 }}>{m.tahrirlangan ? __kbUi(`${t("tahrirlangan")} · `) : __kbUi("")}{__kbUi(kabutarTime(m.yaratilgan_at, locale))}{m.meniki ? (peerSeenId && m.id <= peerSeenId ? <span className="kb-tick is-korildi" title={t("ko‘rildi")}> ✓✓</span> : <span className="kb-tick"> ✓</span>) : __kbUi("")}</div>
              </div>
              {!m.ochirilgan && <button type="button" className="kb-message-more" onClick={() => setMenuMessage(menuMessage?.id === m.id ? null : m)} aria-label={t("Xabar amallari")} aria-expanded={menuMessage?.id === m.id}><MoreHorizontal size={18}/></button>}
              {menuMessage?.id === m.id && <div className="kb-message-menu" role="group" aria-label={t("Xabar amallari")} style={{ borderColor: palette.line, color: palette.ink }}>
                <div className="flex gap-1 pb-2 mb-1 border-b" style={{ borderColor: palette.line }}>{["❤️","👍","🔥","👏","😁","🤔"].map(emoji => <button key={emoji} onClick={() => reactTo(m, emoji)} className="w-7 h-7 rounded-lg hover:bg-slate-100">{__kbUi(emoji)}</button>)}</div>
                <button onClick={() => onReply(m)} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold hover:bg-slate-50"><Reply size={14}/>{t("Javob berish")}</button>
                {!m.ochirilgan && <button onClick={() => { setTanlov(new Set([m.id])); setMenuMessage(null); }} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold hover:bg-slate-50">☑️ {t("Tanlash")}</button>}
                {!peer.kanal && <button onClick={() => qadash(m, qadalganXabar?.id === m.id)} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold hover:bg-slate-50">📌 {qadalganXabar?.id === m.id ? t("Qadashni olib tashlash") : t("Qadash")}</button>}
                <button disabled={!m.matn} onClick={async () => { const ok = await copyKabutarText(m.matn); if (!ok) setSendError("Nusxalanmadi. Matnni belgilab nusxalang."); setMenuMessage(null); }} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold hover:bg-slate-50"><Copy size={14}/>{t("Nusxalash")}</button>
                <button onClick={() => { setForwarding(m); leaveConversation(); }} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold hover:bg-slate-50"><Forward size={14}/>{t("Boshqaga uzatish")}</button>
                {m.meniki && m.matn && !m.fayl_turi && <button onClick={() => { setEditing(m); setText(m.matn); setMenuMessage(null); }} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold hover:bg-slate-50"><Pencil size={14}/>{t("O‘zgartirish")}</button>}
                {!m.meniki && <button type="button" onClick={() => { setSafetyView({ mode: "report", message: m, person: peer.guruh_id ? null : peer }); setMenuMessage(null); }} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold"><ShieldCheck size={14}/>{t("Shikoyat yuborish")}</button>}
                {m.meniki && <button onClick={() => removeMessage(m)} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold" style={{ color: palette.red }}><Trash2 size={14}/>{t("O‘chirish")}</button>}
              </div>}
            </div></React.Fragment>)}
            {threadTargetId && threadRoot && threadMessages.length === 0 && !threadBusy && !threadError && <p className="kb-discussion-empty">{t("Hali izoh yo‘q. Birinchi izohni yozing.")}</p>}
            {threadTargetId && threadHasMore && <div className="kb-chat-history"><button type="button" disabled={threadBusy} onClick={() => loadThread({ append: true })}>{threadBusy ? t("Yuklanmoqda…") : t("Keyingi izohlar")}</button></div>}
          </div>
          {!threadTargetId && (historyMode || newMessages > 0) && <div className="kb-chat-new"><button type="button" onClick={showLatest}><ArrowDown size={16}/>{historyMode ? t("Oxirgi xabarlarga qaytish") : __kbUi(`${newMessages} ${t("ta yangi xabar")}`)}</button>{historyMode && messages.length >= KABUTAR_MESSAGE_WINDOW && <small>{t("Oldingi xabarlar sahifalab ochiladi.")}</small>}</div>}
          {(sendError || messageError) && <div className="mx-4 mb-2 p-2 rounded-xl text-xs" style={{ background: palette.redBg, color: palette.red }}>{t(sendError || messageError)}</div>}
          {(replyTo || editing) && <div className="px-4 py-2 bg-white border-t flex items-center justify-between gap-2 text-xs" style={{ borderColor: palette.line }}><div className="truncate" style={{ color: palette.blue }}><b>{t(editing ? "O‘zgartirilmoqda" : "Javob")}:</b> {(editing || replyTo)?.matn || t("Media xabar")}</div><button onClick={() => { setReplyTo(null); setEditing(null); if (editing) setText(""); }} className="font-black">✕</button></div>}
          {peer.kanal && !threadTargetId ? <div className="kb-composer" style={{ borderColor: palette.line, justifyContent: "center" }}><small style={{ color: palette.muted }}>{t("📺 Kabutar TV — har kuni yangi ko‘rsatuv. Izoh yozish uchun ko‘rsatuv ostidagi 💬 tugmasini bosing.")}</small></div>
          : <div className={`kb-composer ${threadTargetId ? "kb-composer--comment" : ""}`} style={{ borderColor: palette.line }}>
            {peer.guruh_id && <div className="kb-composer-context"><strong>{threadTargetId ? t("Shu xabarga izoh") : t("Guruhga yangi xabar")}</strong><small>{threadTargetId ? t("Izoh shu muhokama ichida saqlanadi.") : t("Yangi xabar alohida muhokama boshlaydi.")}</small></div>}
            {active && !peer.kanal && <KabutarMediaComposer key={`${apiBase}:${token}:${composerKey}`} conversationKey={composerKey} conversationLabel={peer.full_name} disabled={!canWrite || Boolean(threadTargetId && !threadRoot) || sending || Boolean(editing) || Boolean(call) || Boolean(meetingGroupId) || directory?.policy?.eligible === false} onSend={send} onBusyChange={setMediaBusy}/>}
            <button type="button" className={`kb-emoji-btn ${emojiOchiq ? "is-on" : ""}`} onClick={() => setEmojiOchiq((x) => !x)} aria-label={t("Emoji")} aria-expanded={emojiOchiq}>😊</button>
            {emojiOchiq && <div className="kb-emoji-panel" role="dialog" aria-label={t("Emoji")}>{EMOJILAR.map((e) => <button key={e} type="button" onClick={() => { const el = textareaRef.current; const a = el?.selectionStart ?? text.length, b = el?.selectionEnd ?? text.length; setText(text.slice(0, a) + e + text.slice(b)); setTimeout(() => { el?.focus(); el?.setSelectionRange?.(a + e.length, a + e.length); }, 0); }}>{e}</button>)}</div>}
            <textarea ref={textareaRef} maxLength={peer.kanal ? 500 : 4000} disabled={!canWrite || Boolean(threadTargetId && !threadRoot) || directory?.policy?.eligible === false} value={text} onChange={e => { setText(e.target.value); qoralamaYoz(e.target.value);
              const now = Date.now(); if (peer && !peer.kanal && now - yozmoqdaRef.current > 3000) { yozmoqdaRef.current = now;
                const fd = new FormData(); fd.append("token", token); if (peer.guruh_id) fd.append("guruh_id", String(peer.guruh_id)); else fd.append("boshqa_user_id", String(peer.user_id));
                fetch(`${String(apiBase || "").replace(/\/+$/, "")}/api/chat/yozmoqda`, { method: "POST", body: fd }).catch(() => {}); } }} onKeyDown={e => { if (!mediaBusy && !sending && e.key === "Enter" && !e.shiftKey && !e.nativeEvent?.isComposing && preferences.settings.enterToSend) { e.preventDefault(); send(); } }} rows={1} placeholder={threadTargetId ? t("Izoh yozing…") : preferences.settings.enterToSend ? t("Xabar yozing… Enter — yuborish") : t("Xabar yozing…")} aria-label={t("Xabar matni")} className="flex-1 resize-none px-3 py-2.5 rounded-xl border text-sm outline-none max-h-32" style={{ borderColor: palette.line }}/>
            <button onClick={() => send()} disabled={!canWrite || Boolean(threadTargetId && !threadRoot) || sending || mediaBusy || !text.trim()} className="kb-send-button" aria-label={t(editing ? "O‘zgartirishni saqlash" : "Xabarni yuborish")} title={t("Yuborish")}>{sending ? <Loader2 size={21} className="animate-spin"/> : <Send size={21}/>}</button>
          </div>}
        </>}
      </section>
    </div>
    {galereya && (() => { const rasmlar = messages.filter((x) => !x.ochirilgan && isPhotoMessage(x)); const i = rasmlar.findIndex((x) => x.id === galereya); const r = rasmlar[i];
      if (!r) return null; const url = `${apiBase}/api/chat/fayl/${r.id}?token=${encodeURIComponent(token)}`;
      const ot = (d) => { const n = rasmlar[(i + d + rasmlar.length) % rasmlar.length]; if (n) setGalereya(n.id); };
      return <div className="kb-galereya" role="dialog" aria-modal="true" aria-label={t("Rasm")} tabIndex={-1} ref={(el) => el?.focus()}
        onKeyDown={(e) => { if (e.key === "Escape") setGalereya(null); if (e.key === "ArrowRight") ot(1); if (e.key === "ArrowLeft") ot(-1); }}
        onClick={(e) => { if (e.target === e.currentTarget) setGalereya(null); }}
        onTouchStart={(e) => { e.currentTarget.dataset.x = String(e.touches[0].clientX); }}
        onTouchEnd={(e) => { const x0 = Number(e.currentTarget.dataset.x || 0), dx = (e.changedTouches[0]?.clientX || x0) - x0; if (Math.abs(dx) > 60) ot(dx < 0 ? 1 : -1); }}>
        <div className="kb-galereya-tepa"><span>{r.meniki ? t("Siz") : (r.yuboruvchi_ismi || peer?.full_name || "")} · {__kbUi(kabutarTime(r.yaratilgan_at, locale))}</span>
          <span>{__kbUi(`${i + 1} / ${rasmlar.length}`)}</span>
          <a href={url} download={r.fayl_nomi || "rasm"} aria-label={t("Yuklab olish")} onClick={(e) => e.stopPropagation()}><Download size={20}/></a>
          <button type="button" onClick={() => setGalereya(null)} aria-label={t("Yopish")}>✕</button></div>
        {rasmlar.length > 1 && <button type="button" className="kb-galereya-o is-chap" onClick={() => ot(-1)} aria-label={t("Oldingi")}>‹</button>}
        <img src={url} alt={r.fayl_nomi || t("Rasm")} className="kb-galereya-rasm" />
        {rasmlar.length > 1 && <button type="button" className="kb-galereya-o is-ong" onClick={() => ot(1)} aria-label={t("Keyingi")}>›</button>}
        {r.matn && <div className="kb-galereya-izoh">{r.matn}</div>}
      </div>; })()}
    {qatorMenyu && <><div className="kb-qm-fon" onClick={() => setQatorMenyu(null)} onContextMenu={(e) => { e.preventDefault(); setQatorMenyu(null); }} />
      <div className="kb-qator-menyu" role="menu" style={{ left: Math.min(qatorMenyu.x, (typeof window !== "undefined" ? window.innerWidth : 400) - 230), top: Math.min(qatorMenyu.y, (typeof window !== "undefined" ? window.innerHeight : 600) - 200) }}>
        <button type="button" role="menuitem" disabled={!qadalgan.has(qatorMenyu.kalit) && qadalgan.size >= 10} onClick={() => { almashtir("pinned", qatorMenyu.kalit); setQatorMenyu(null); }}>📌 {qadalgan.has(qatorMenyu.kalit) ? t("Qadashni olib tashlash") : t("Tepaga qadash")}</button>
        <button type="button" role="menuitem" onClick={() => { almashtir("muted", qatorMenyu.kalit); setQatorMenyu(null); }}>{ovozsiz.has(qatorMenyu.kalit) ? `🔔 ${t("Ovozni yoqish")}` : `🔕 ${t("Ovozsiz qilish")}`}</button>
        <button type="button" role="menuitem" onClick={() => { almashtir("archived", qatorMenyu.kalit); setQatorMenyu(null); }}>🗄 {arxivda.has(qatorMenyu.kalit) ? t("Arxivdan chiqarish") : t("Arxivga olish")}</button>
      </div></>}
    {safetyView && <KabutarSafety key={`${apiBase}:${token}:${safetyView.mode}:${safetyView.message?.id || safetyView.person?.user_id || "list"}`} apiBase={apiBase} token={token} view={safetyView} onClose={() => setSafetyView(null)} onBlocked={blockedId => { if (blockedId && Number(peerRef.current?.user_id) === Number(blockedId)) { setPeer(null); peerRef.current = null; setMessages([]); outgoingRef.current?.controller.abort(); } loadDirectory(); }}/>}
    {meetingGroupId && <KabutarMeetingDialog key={`${apiBase}:${token}:${meetingGroupId}`} apiBase={apiBase} token={token} groupId={meetingGroupId} onClose={() => setMeetingGroupId(null)}/>}
    {call && <KabutarCallDialog key={`${apiBase}:${token}:${call.callId || `${call.peer?.id}:${call.mode}`}`} apiBase={apiBase} token={token} {...call} onClose={() => setCall(null)}/>}
    {accountView && <KabutarAccount token={token} apiBase={apiBase} directory={directory} initialPage={accountView.page} person={accountView.person || null} preferences={preferences} onClose={() => setAccountView(null)} onOpenContact={item => { setAccountView(null); openPeer(item); }} onMeUpdated={card => setDirectory(current => current ? { ...current, men: { ...current.men, ...card } } : { men: card, muassasalar: [], suhbatlar: [] })}/>}
  </div>;
}
