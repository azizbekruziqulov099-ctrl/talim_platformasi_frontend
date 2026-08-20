import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Archive,
  Building2,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";


const TYPE_ORDER = ["maktab", "bogcha", "markaz", "universitet"];


function errorMessage(payload, fallback = "Amal bajarilmadi") {
  if (!payload) return fallback;
  if (typeof payload === "string") return payload;
  if (typeof payload.detail === "string") return payload.detail;
  if (typeof payload.message === "string") return payload.message;
  return fallback;
}


async function securityRequest(apiBase, path, token, options = {}) {
  const isGet = !options.method || options.method === "GET";
  const url = new URL(`${apiBase}/api/admin/muassasa-xavfsizligi${path}`);
  if (isGet) url.searchParams.set("token", token);
  const response = await fetch(url.toString(), {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(errorMessage(payload, `Server xatosi (${response.status})`));
    error.status = response.status;
    throw error;
  }
  return payload || {};
}


function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("uz-UZ", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}


function PasswordField({ label, value, onChange, placeholder, visible, onToggle, autoComplete }) {
  return (
    <label className="block">
      <span className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>{label}</span>
      <span className="relative block">
        <input
          type={visible ? "text" : "password"}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          value={value}
          onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 4))}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full px-3.5 py-2.5 pr-11 rounded-xl border text-sm tracking-[0.35em]"
          style={{ borderColor: "#E5E1D8" }}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 right-0 w-10 flex items-center justify-center"
          aria-label={visible ? "Parolni yashirish" : "Parolni ko'rsatish"}
          style={{ color: "#8A8578" }}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </span>
    </label>
  );
}


function ActionDialog({ target, mode, onClose, onSuccess, token, apiBase }) {
  const [password, setPassword] = useState("");
  const [reason, setReason] = useState("");
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setPassword("");
    setReason("");
    setVisible(false);
    setSaving(false);
    setError("");
  }, [target, mode]);

  if (!target) return null;
  const restore = mode === "restore";

  const submit = async () => {
    if (password.length !== 4 || saving) return;
    setSaving(true);
    setError("");
    try {
      const payload = restore
        ? { token, archive_id: target.archive_id, ochirish_paroli: password }
        : {
            token,
            muassasa_turi: target.muassasa_turi,
            muassasa_id: target.muassasa_id,
            ochirish_paroli: password,
            sabab: reason.trim() || undefined,
          };
      await securityRequest(
        apiBase,
        restore ? "/tiklash" : "/arxivlash",
        token,
        { method: "POST", body: JSON.stringify(payload) },
      );
      onSuccess(restore ? "Muassasa arxivdan tiklandi" : "Muassasa 1 yillik arxivga olindi");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-5" style={{ backgroundColor: "rgba(18,25,31,0.55)" }}>
      <section className="w-full max-w-md rounded-2xl p-5 bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="institution-security-action-title">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-[11px] font-bold tracking-[0.16em] mb-1" style={{ color: restore ? "#2D8B8B" : "#B0553A" }}>
              {restore ? "ARXIVDAN TIKLASH" : "XAVFSIZ ARXIVLASH"}
            </p>
            <h3 id="institution-security-action-title" className="text-lg font-bold" style={{ color: "#2B2B2B" }}>{target.nomi}</h3>
            <p className="text-xs mt-1" style={{ color: "#8A8578" }}>{target.turi_nomi} · ID {target.muassasa_id}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Yopish" className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#F7F5F0", color: "#5A5648" }}><X size={17} /></button>
        </div>

        <div className="rounded-xl p-3 mb-4 text-xs leading-relaxed" style={{ backgroundColor: restore ? "#EEF7F5" : "#FDF0EC", color: restore ? "#246D6D" : "#8E3E2B" }}>
          {restore
            ? "Muassasa barcha saqlangan bog'lanishlari bilan yana faol ro'yxatga qaytadi."
            : "Muassasa darhol faol ro'yxatdan olinadi, 365 kun arxivda saqlanadi va shu muddat ichida tiklanishi mumkin."}
        </div>

        {!restore && (
          <label className="block mb-3">
            <span className="text-xs font-medium mb-1.5 block" style={{ color: "#5A5648" }}>Sabab · ixtiyoriy</span>
            <input value={reason} onChange={(event) => setReason(event.target.value.slice(0, 500))} placeholder="Masalan: xato yaratilgan" className="w-full px-3.5 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }} />
          </label>
        )}

        <PasswordField
          label="Adminning 4 xonali o'chirish paroli"
          value={password}
          onChange={setPassword}
          placeholder="••••"
          visible={visible}
          onToggle={() => setVisible((current) => !current)}
          autoComplete="current-password"
        />
        {error && <p className="text-sm mt-3" role="alert" style={{ color: "#B0553A" }}>{error}</p>}

        <div className="grid grid-cols-2 gap-2.5 mt-5">
          <button type="button" onClick={onClose} className="py-2.5 rounded-xl border text-sm font-semibold" style={{ borderColor: "#E5E1D8", color: "#5A5648" }}>Bekor qilish</button>
          <button
            type="button"
            onClick={submit}
            disabled={password.length !== 4 || saving}
            className="py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
            style={{ backgroundColor: restore ? "#2D8B8B" : "#B0553A", opacity: password.length !== 4 || saving ? 0.55 : 1 }}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : restore ? <RotateCcw size={16} /> : <Archive size={16} />}
            {saving ? "..." : restore ? "Tiklash" : "Arxivlash"}
          </button>
        </div>
      </section>
    </div>
  );
}


export default function AdminInstitutionSecurity({ token, apiBase }) {
  const [status, setStatus] = useState(null);
  const [active, setActive] = useState([]);
  const [archived, setArchived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState("active");

  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [action, setAction] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [statusData, activeData, archiveData] = await Promise.all([
        securityRequest(apiBase, "/holat", token),
        securityRequest(apiBase, "/faol", token),
        securityRequest(apiBase, "/arxiv", token),
      ]);
      setStatus(statusData);
      setActive(activeData.muassasalar || []);
      setArchived(archiveData.arxiv || []);
    } catch (requestError) {
      setLoadError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [apiBase, token]);

  useEffect(() => { load(); }, [load]);

  const groupedActive = useMemo(() => {
    const groups = new Map();
    TYPE_ORDER.forEach((type) => groups.set(type, []));
    active.forEach((institution) => {
      if (!groups.has(institution.muassasa_turi)) groups.set(institution.muassasa_turi, []);
      groups.get(institution.muassasa_turi).push(institution);
    });
    return [...groups.entries()].filter(([, institutions]) => institutions.length > 0);
  }, [active]);

  const savePassword = async () => {
    if (newPassword.length !== 4 || repeatPassword.length !== 4 || passwordSaving) return;
    setPasswordSaving(true);
    setPasswordError("");
    setMessage("");
    try {
      await securityRequest(apiBase, "/parol", token, {
        method: "PUT",
        body: JSON.stringify({
          token,
          yangi_parol: newPassword,
          yangi_parol_takror: repeatPassword,
        }),
      });
      setNewPassword("");
      setRepeatPassword("");
      setMessage("O'chirish paroli yangilandi");
      await load();
    } catch (requestError) {
      setPasswordError(requestError.message);
    } finally {
      setPasswordSaving(false);
    }
  };

  const actionCompleted = async (text) => {
    setAction(null);
    setMessage(text);
    await load();
  };

  return (
    <section className="rounded-2xl p-4 bg-white border mb-4 shadow-sm" style={{ borderColor: "#E5E1D8" }} aria-labelledby="admin-institution-security-title">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#FDF3E0", color: "#8A5A1C" }}><ShieldCheck size={20} /></span>
          <div>
            <h2 id="admin-institution-security-title" className="text-sm font-bold" style={{ color: "#2B2B2B" }}>Muassasa xavfsizligi va arxivi</h2>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: "#8A8578" }}>Kim yaratganidan qat'i nazar, admin 4 xonali parol bilan istalgan muassasani arxivlaydi.</p>
          </div>
        </div>
        <button type="button" onClick={load} disabled={loading} className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#F7F5F0", color: "#5A5648" }} aria-label="Yangilash"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /></button>
      </div>

      {loadError && <div className="rounded-xl p-3 mb-3 text-sm" role="alert" style={{ backgroundColor: "#FDF0EC", color: "#B0553A" }}>{loadError}</div>}
      {message && <div className="rounded-xl p-3 mb-3 text-sm" role="status" style={{ backgroundColor: "#EAF3DE", color: "#3B6D11" }}>✓ {message}</div>}

      <div className="rounded-xl p-3.5 mb-4" style={{ backgroundColor: "#F7F5F0" }}>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <p className="text-xs font-bold" style={{ color: "#2B2B2B" }}>O'chirish parolini yangilash</p>
            <p className="text-[11px] mt-0.5" style={{ color: "#8A8578" }}>
              {status?.source === "settings"
                ? `Sozlamadagi parol faol · ${formatDate(status.updated_at)}`
                : status?.source === "railway"
                  ? "Eski Railway paroli faol — u o'zgartirilmaguncha saqlanadi"
                  : "Parol hali belgilanmagan"}
            </p>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ backgroundColor: status?.configured ? "#EAF3DE" : "#FDF0EC", color: status?.configured ? "#3B6D11" : "#B0553A" }}>{status?.configured ? "FAOL" : "SOZLANMAGAN"}</span>
        </div>

        <p className="text-[11px] mb-2.5" style={{ color: "#8A8578" }}>Admin akkaunti tasdiqlangani uchun yangi parolni istalgan payt to'g'ridan-to'g'ri belgilash mumkin.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <PasswordField label="Yangi 4 raqam" value={newPassword} onChange={setNewPassword} placeholder="••••" visible={showNew} onToggle={() => setShowNew((value) => !value)} autoComplete="new-password" />
          <PasswordField label="Yangi parolni takrorlang" value={repeatPassword} onChange={setRepeatPassword} placeholder="••••" visible={showRepeat} onToggle={() => setShowRepeat((value) => !value)} autoComplete="new-password" />
        </div>
        {passwordError && <p className="text-xs mt-2" role="alert" style={{ color: "#B0553A" }}>{passwordError}</p>}
        <button type="button" onClick={savePassword} disabled={passwordSaving || newPassword.length !== 4 || repeatPassword.length !== 4} className="w-full mt-3 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2" style={{ backgroundColor: "#1B4B7A", opacity: passwordSaving || newPassword.length !== 4 || repeatPassword.length !== 4 ? 0.5 : 1 }}>
          {passwordSaving ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
          {passwordSaving ? "Saqlanmoqda..." : "Parolni yangilash"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3" role="tablist" aria-label="Muassasa holati">
        <button type="button" role="tab" aria-selected={tab === "active"} onClick={() => setTab("active")} className="py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2" style={tab === "active" ? { backgroundColor: "#1B4B7A", color: "#fff" } : { backgroundColor: "#F7F5F0", color: "#5A5648" }}><Building2 size={15} /> Faol · {active.length}</button>
        <button type="button" role="tab" aria-selected={tab === "archive"} onClick={() => setTab("archive")} className="py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2" style={tab === "archive" ? { backgroundColor: "#8A5A1C", color: "#fff" } : { backgroundColor: "#F7F5F0", color: "#5A5648" }}><Archive size={15} /> Arxiv · {archived.length}</button>
      </div>

      {loading ? (
        <div className="py-8 flex items-center justify-center"><Loader2 size={22} className="animate-spin" style={{ color: "#1B4B7A" }} /></div>
      ) : tab === "active" ? (
        groupedActive.length === 0 ? (
          <div className="rounded-xl p-5 text-center" style={{ backgroundColor: "#F7F5F0", color: "#8A8578" }}><p className="text-sm">Faol muassasa topilmadi.</p></div>
        ) : (
          <div className="space-y-3">
            {groupedActive.map(([type, institutions]) => (
              <div key={type}>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] mb-1.5" style={{ color: "#8A8578" }}>{institutions[0]?.turi_nomi}</p>
                <div className="space-y-1.5">
                  {institutions.map((institution) => (
                    <div key={`${institution.muassasa_turi}-${institution.muassasa_id}`} className="rounded-xl p-3 flex items-center justify-between gap-3" style={{ backgroundColor: "#FAF8F2" }}>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: "#2B2B2B" }}>{institution.nomi}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: "#8A8578" }}>ID {institution.muassasa_id}</p>
                      </div>
                      <button type="button" onClick={() => setAction({ mode: "archive", target: institution })} disabled={!status?.configured} className="px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0" style={{ backgroundColor: "#FDF0EC", color: "#B0553A", opacity: status?.configured ? 1 : 0.45 }}><Trash2 size={14} /> Arxivlash</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      ) : archived.length === 0 ? (
        <div className="rounded-xl p-5 text-center" style={{ backgroundColor: "#F7F5F0", color: "#8A8578" }}><Archive size={24} className="mx-auto mb-2" /><p className="text-sm">Arxiv bo'sh.</p></div>
      ) : (
        <div className="space-y-2">
          {archived.map((institution) => (
            <div key={institution.archive_id} className="rounded-xl p-3.5" style={{ backgroundColor: "#F7F5F0" }}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "#2B2B2B" }}>{institution.nomi}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "#8A8578" }}>{institution.turi_nomi} · arxivlandi {formatDate(institution.archived_at)}</p>
                  <p className="text-[11px] mt-1 font-medium" style={{ color: institution.days_remaining <= 30 ? "#B0553A" : "#8A5A1C" }}>{institution.days_remaining} kun qoldi · {formatDate(institution.purge_after)} dan keyin butunlay o'chadi</p>
                  {institution.sababi && <p className="text-[11px] mt-1" style={{ color: "#5A5648" }}>Sabab: {institution.sababi}</p>}
                </div>
                <button type="button" onClick={() => setAction({ mode: "restore", target: institution })} className="px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0" style={{ backgroundColor: "#EEF7F5", color: "#246D6D" }}><RotateCcw size={14} /> Tiklash</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[11px] mt-3 leading-relaxed" style={{ color: "#8A8578" }}>Arxivdagi muassasa 365 kun ichida tiklanadi. Muddat tugagach avtomatik tozalash ishga tushadi va tiklash yopiladi.</p>

      <ActionDialog
        target={action?.target}
        mode={action?.mode}
        onClose={() => setAction(null)}
        onSuccess={actionCompleted}
        token={token}
        apiBase={apiBase}
      />
    </section>
  );
}
