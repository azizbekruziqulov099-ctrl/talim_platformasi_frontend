import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Baby,
  BadgeCheck,
  BellRing,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  Copy,
  LayoutDashboard,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import GuidedAvatar from "../assistant/GuidedAvatar.jsx";
import { HUDUDLAR, VILOYATLAR } from "../hududlar.js";
import { kindergartenApi, queryString } from "./api.js";
import { ONBOARDING_STEPS, tourForRoles } from "./workflow.js";
import "./kindergarten.css";

const ROLE_LABELS = {
  system_admin: "Tizim administratori",
  owner: "Mulkdor",
  founder: "Ta'sischi",
  director: "Direktor",
  deputy_director: "Direktor o'rinbosari",
  methodist: "Metodist",
  educator: "Tarbiyachi",
  assistant_educator: "Tarbiyachi yordamchisi",
  nurse: "Hamshira",
  psychologist: "Psixolog",
  accountant: "Hisobchi",
  administrator: "Administrator",
  cook: "Oshpaz",
  security: "Qo'riqlash xodimi",
};

const MANAGER_ROLES = [
  "owner",
  "founder",
  "director",
  "deputy_director",
  "administrator",
  "system_admin",
];

const DAY_LABELS = [
  { value: 1, label: "Du" },
  { value: 2, label: "Se" },
  { value: 3, label: "Ch" },
  { value: 4, label: "Pa" },
  { value: 5, label: "Ju" },
  { value: 6, label: "Sh" },
  { value: 7, label: "Ya" },
];

function localDateValue(value = new Date()) {
  const local = new Date(value.getTime() - value.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function loadPreferences() {
  try {
    const saved = JSON.parse(localStorage.getItem("samtm-kindergarten-avatar") || "{}");
    return {
      enabled: saved.enabled !== false,
      speechEnabled: saved.speechEnabled !== false,
      variant: ["female", "male", "neutral"].includes(saved.variant)
        ? saved.variant
        : "female",
    };
  } catch {
    return { enabled: true, speechEnabled: true, variant: "female" };
  }
}

function savePreferences(preferences) {
  localStorage.setItem(
    "samtm-kindergarten-avatar",
    JSON.stringify(preferences),
  );
}

function ErrorNotice({ error, onRetry }) {
  if (!error) return null;
  return (
    <div className="kg-error" role="alert">
      <div>
        <b>Amal bajarilmadi</b>
        <p>{error}</p>
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry}>
          <RefreshCw size={15} /> Qayta urinish
        </button>
      )}
    </div>
  );
}

function LoadingBlock({ text = "Yuklanmoqda..." }) {
  return (
    <div className="kg-loading">
      <Loader2 size={24} className="animate-spin" />
      <span>{text}</span>
    </div>
  );
}

function mergeById(current, incoming) {
  const merged = new Map(current.map((item) => [item.id, item]));
  incoming.forEach((item) => merged.set(item.id, item));
  return [...merged.values()];
}

function LoadMoreButton({ hasMore, busy, onClick }) {
  if (!hasMore) return null;
  return (
    <button
      type="button"
      className="kg-secondary-button kg-load-more"
      disabled={busy}
      onClick={onClick}
    >
      {busy && <Loader2 size={15} className="animate-spin" />}
      Yana ko‘rsatish
    </button>
  );
}

function useGroupOptions({ token, apiBase, contextId, enabled = true }) {
  const [groups, setGroups] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadGroups = async (afterId = 0) => {
    if (!enabled) return;
    setBusy(true);
    setError("");
    try {
      const data = await kindergartenApi(
        `/groups?${queryString({
          token,
          context_id: contextId,
          after_id: afterId,
          limit: 100,
        })}`,
        { apiBase },
      );
      setGroups((current) =>
        afterId ? mergeById(current, data.items || []) : data.items || [],
      );
      setNextCursor(data.next_cursor);
      setHasMore(Boolean(data.has_more));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!enabled) {
      setGroups([]);
      setNextCursor(null);
      setHasMore(false);
      return;
    }
    loadGroups(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase, contextId, enabled, token]);

  return {
    groups,
    groupsBusy: busy,
    groupsError: error,
    groupsHasMore: hasMore,
    loadMoreGroups: () => loadGroups(nextCursor),
  };
}

function BackButton({ onClick, label = "Ortga" }) {
  return (
    <button type="button" className="kg-back" onClick={onClick}>
      <ArrowLeft size={17} /> {label}
    </button>
  );
}

function StatusPill({ status }) {
  const labels = {
    active: "Faol",
    pending: "Kutilmoqda",
    pending_verification: "Tekshiruvda",
    draft: "Qoralama",
    verified: "Tasdiqlangan",
    unverified: "Tasdiqlanmagan",
    unpaid: "To'lanmagan",
    partial: "Qisman",
    paid: "To'langan",
    waived: "Bekor qilingan",
    cancelled: "Bekor qilingan",
  };
  return <span className={`kg-status ${status}`}>{labels[status] || status}</span>;
}

export default function KindergartenWorkspace({
  token,
  apiBase,
  initialWorkspace,
  onBack,
  onLegacy,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workspaces, setWorkspaces] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [screen, setScreen] = useState("home");
  const [selected, setSelected] = useState(null);
  const [preferences, setPreferences] = useState(loadPreferences);

  const updatePreferences = (patch) => {
    setPreferences((current) => {
      const next = { ...current, ...patch };
      savePreferences(next);
      return next;
    });
  };

  const loadWorkspaces = async (preferredContextId) => {
    setLoading(true);
    setError("");
    try {
      const data = await kindergartenApi(
        `/workspaces?${queryString({ token })}`,
        { apiBase },
      );
      const nextWorkspaces = data.workspaces || [];
      setWorkspaces(nextWorkspaces);
      setPendingRequests(data.pending_requests || []);
      const wantedId =
        preferredContextId ||
        initialWorkspace?.context_id ||
        initialWorkspace?.muassasa_id;
      const wanted = nextWorkspaces.find(
        (workspace) =>
          workspace.context_id === Number(wantedId) ||
          workspace.legacy_bogcha_id === Number(wantedId),
      );
      if (wanted?.role_status === "active") {
        setSelected(wanted);
        setScreen("dashboard");
      } else if (wanted) {
        setSelected(null);
        setScreen("home");
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, apiBase]);

  if (loading) {
    return (
      <div className="kg-shell">
        <BackButton onClick={onBack} />
        <LoadingBlock text="Bog'cha ish maydoni yuklanmoqda..." />
      </div>
    );
  }

  if (screen === "create") {
    return (
      <OnboardingWizard
        token={token}
        apiBase={apiBase}
        preferences={preferences}
        onPreferences={updatePreferences}
        onBack={() => setScreen("home")}
        onJoin={() => setScreen("join")}
        onCreated={(contextId) => loadWorkspaces(contextId)}
      />
    );
  }

  if (screen === "join") {
    return (
      <JoinKindergarten
        token={token}
        apiBase={apiBase}
        onBack={() => setScreen("home")}
        onRequested={() => loadWorkspaces()}
      />
    );
  }

  if (screen === "dashboard" && selected) {
    return (
      <KindergartenDashboard
        key={selected.context_id}
        token={token}
        apiBase={apiBase}
        workspace={selected}
        preferences={preferences}
        onPreferences={updatePreferences}
        onBack={() => {
          setSelected(null);
          setScreen("home");
          loadWorkspaces();
        }}
        onLegacy={onLegacy}
      />
    );
  }

  return (
    <div className="kg-shell">
      <BackButton onClick={onBack} label="Ish maydoniga qaytish" />
      <header className="kg-hero">
        <div className="kg-hero-icon">
          <Baby size={28} />
        </div>
        <div>
          <span className="kg-eyebrow">BOG‘CHA BOSHQARUVI</span>
          <h1>Bog‘chani tartibli ishga tushiring</h1>
          <p>
            Yangi bog‘cha oching yoki mavjud muassasaga lavozimingiz bilan
            qo‘shiling. Har bir xodim faqat o‘ziga kerakli menyularni ko‘radi.
          </p>
        </div>
      </header>

      <ErrorNotice error={error} onRetry={() => loadWorkspaces()} />

      <div className="kg-start-actions">
        <button type="button" onClick={() => setScreen("create")}>
          <span className="kg-action-icon primary">
            <Plus size={20} />
          </span>
          <span>
            <b>Yangi bog‘cha yaratish</b>
            <small>Xususiy yoki davlat bog‘chasi uchun raqamli ish maydoni</small>
          </span>
          <ChevronRight size={18} />
        </button>
        <button type="button" onClick={() => setScreen("join")}>
          <span className="kg-action-icon">
            <Search size={20} />
          </span>
          <span>
            <b>Mavjud bog‘chaga qo‘shilish</b>
            <small>Nom bo‘yicha toping yoki xodim taklif kodini kiriting</small>
          </span>
          <ChevronRight size={18} />
        </button>
      </div>

      {workspaces.length > 0 && (
        <section className="kg-section">
          <div className="kg-section-title">
            <div>
              <span className="kg-eyebrow">MUASSASALARIM</span>
              <h2>Ulangan bog‘chalar</h2>
            </div>
            <span>{workspaces.length} ta</span>
          </div>
          <div className="kg-workspace-grid">
            {workspaces.map((workspace) => (
              <button
                type="button"
                key={workspace.context_id}
                className={`kg-workspace-card ${
                  workspace.role_status !== "active" ? "pending-card" : ""
                }`}
                onClick={() => {
                  if (workspace.role_status !== "active") {
                    setError(
                      "Bu bog'cha hali tekshiruvda yoki qo'shilish rolingiz tasdiqlanmagan.",
                    );
                    return;
                  }
                  setSelected(workspace);
                  setScreen("dashboard");
                }}
              >
                <div className="kg-workspace-card-top">
                  <span className="kg-workspace-logo">
                    <Building2 size={21} />
                  </span>
                  <StatusPill status={workspace.onboarding_status} />
                </div>
                <h3>{workspace.name}</h3>
                <p>
                  {[workspace.region, workspace.district].filter(Boolean).join(", ") ||
                    "Hudud kiritilmagan"}
                </p>
                <div className="kg-role-list">
                  {(workspace.roles || []).map((role) => (
                    <span key={role}>{ROLE_LABELS[role] || role}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {pendingRequests.length > 0 && (
        <section className="kg-section">
          <div className="kg-section-title">
            <div>
              <span className="kg-eyebrow">SO‘ROVLAR</span>
              <h2>Javob kutilmoqda</h2>
            </div>
          </div>
          <div className="kg-compact-list">
            {pendingRequests.map((request) => (
              <div key={request.id}>
                <span className="kg-list-icon">
                  <Clock3 size={17} />
                </span>
                <span>
                  <b>{request.name}</b>
                  <small>{ROLE_LABELS[request.requested_role]}</small>
                </span>
                <StatusPill status="pending" />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="kg-safety-note">
        <ShieldCheck size={21} />
        <div>
          <b>Vakolatlar muassasa ichida ajratiladi</b>
          <p>
            Bitta hisob bir nechta bog‘chaga va har birida boshqa lavozimga ega
            bo‘lishi mumkin. AI yordamchi ruxsatni chetlab o‘tmaydi.
          </p>
        </div>
      </section>
    </div>
  );
}

function OnboardingWizard({
  token,
  apiBase,
  preferences,
  onPreferences,
  onBack,
  onJoin,
  onCreated,
}) {
  const [selection, setSelection] = useState({
    ownership_type: "private",
    relationship: "owner",
    setup_mode: "assistant",
  });
  const [draft, setDraft] = useState(null);
  const [step, setStep] = useState("basics");
  const [basic, setBasic] = useState({
    name: "",
    region: "",
    district: "",
    address: "",
    phone: "",
    work_start: "08:00",
    work_end: "18:00",
    work_days: [1, 2, 3, 4, 5],
    capacity: "",
    language: "uz",
    payment_enabled: false,
    monthly_fee: "",
  });
  const [groups, setGroups] = useState([
    {
      localId: 1,
      name: "",
      age_min_months: 36,
      age_max_months: 48,
      capacity: 20,
      room_name: "",
    },
  ]);
  const [preview, setPreview] = useState(null);
  const [assistantSession, setAssistantSession] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const startDraft = async () => {
    if (selection.relationship === "educator") {
      onJoin();
      return;
    }
    setBusy(true);
    setError("");
    try {
      const data = await kindergartenApi("/onboarding/start", {
        apiBase,
        method: "POST",
        body: {
          token,
          ...selection,
          avatar_enabled: preferences.enabled,
          speech_enabled: preferences.speechEnabled,
          avatar_variant: preferences.variant,
        },
      });
      setDraft(data.draft);
      setStep("basics");
      if (selection.setup_mode === "assistant") {
        const assistant = await kindergartenApi("/assistant/sessions", {
          apiBase,
          method: "POST",
          body: {
            token,
            workflow_key: "kindergarten_onboarding",
            draft_id: data.draft.id,
            avatar_enabled: preferences.enabled,
            speech_enabled: preferences.speechEnabled,
            avatar_variant: preferences.variant,
          },
        });
        setAssistantSession(assistant.session);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const logAssistantAction = async (actionId, targetStep, payload = {}) => {
    if (!assistantSession) return;
    try {
      await kindergartenApi(
        `/assistant/sessions/${assistantSession.id}/actions`,
        {
          apiBase,
          method: "POST",
          body: {
            token,
            action_id: actionId,
            ui_anchor: targetStep?.anchor,
            payload: {
              ...(actionId === "NEXT_STEP"
                ? { next_step: targetStep?.key }
                : {}),
              ...(actionId === "PREVIOUS_STEP"
                ? { previous_step: targetStep?.key }
                : {}),
              ...payload,
            },
          },
        },
      );
    } catch {
      // Avatar auditi asosiy formani to'xtatmasligi kerak.
    }
  };

  const save = async (targetStep, patch) => {
    const data = await kindergartenApi(`/onboarding/${draft.id}/step`, {
      apiBase,
      method: "PUT",
      body: {
        token,
        step: targetStep,
        payload: patch,
        expected_version: draft.version,
      },
    });
    setDraft((current) => ({ ...current, ...data.draft }));
    return data.draft;
  };

  const nextStep = async () => {
    const currentIndex = ONBOARDING_STEPS.findIndex((item) => item.key === step);
    const next = ONBOARDING_STEPS[Math.min(currentIndex + 1, ONBOARDING_STEPS.length - 1)];
    setBusy(true);
    setError("");
    try {
      let updatedDraft = draft;
      if (step === "basics" || step === "schedule") {
        if (!basic.name.trim()) throw new Error("Bog'cha nomini kiriting");
        if (step === "schedule" && basic.work_days.length === 0) {
          throw new Error("Kamida bitta ish kunini tanlang");
        }
        updatedDraft = await save(next.key, { basic });
      } else if (step === "groups") {
        const cleanGroups = groups
          .filter((group) => group.name.trim())
          .map(({ localId, ...group }) => group);
        updatedDraft = await save(next.key, { groups: cleanGroups });
      } else {
        updatedDraft = await save(next.key, {});
      }
      setStep(next.key);
      await logAssistantAction("NEXT_STEP", next);
      if (next.key === "preview") {
        const previewData = await kindergartenApi(
          `/onboarding/${draft.id}/preview?${queryString({ token })}`,
          { apiBase, method: "POST" },
        );
        setPreview(previewData);
        setDraft((current) => ({ ...current, version: updatedDraft.version }));
      }
    } catch (requestError) {
      const errors = requestError.detail?.errors;
      setError(
        Array.isArray(errors)
          ? errors.join(" · ")
          : requestError.message,
      );
    } finally {
      setBusy(false);
    }
  };

  const previousStep = () => {
    const currentIndex = ONBOARDING_STEPS.findIndex((item) => item.key === step);
    const previous = ONBOARDING_STEPS[Math.max(0, currentIndex - 1)];
    setStep(previous.key);
    logAssistantAction("PREVIOUS_STEP", previous);
  };

  const confirm = async () => {
    setBusy(true);
    setError("");
    try {
      const result = await kindergartenApi(
        `/onboarding/${draft.id}/confirm`,
        {
          apiBase,
          method: "POST",
          body: {
            token,
            expected_version: draft.version,
            confirmation: true,
          },
        },
      );
      await logAssistantAction("COMPLETE_TOUR", ONBOARDING_STEPS.at(-1));
      onCreated(result.context_id);
    } catch (requestError) {
      const errors = requestError.detail?.errors;
      setError(Array.isArray(errors) ? errors.join(" · ") : requestError.message);
    } finally {
      setBusy(false);
    }
  };

  if (!draft) {
    return (
      <div className="kg-shell">
        <BackButton onClick={onBack} />
        <header className="kg-page-header">
          <span className="kg-eyebrow">1-QADAM</span>
          <h1>Siz bog‘chaga kim bo‘lib ulanasiz?</h1>
          <p>Bu tanlov keyingi menyu va ruxsatlarni belgilaydi.</p>
        </header>
        <ErrorNotice error={error} />

        <section className="kg-form-card">
          <label className="kg-label">Bog‘cha turi</label>
          <div className="kg-choice-grid two">
            {[
              {
                value: "private",
                title: "Xususiy bog‘cha",
                text: "Mulkdor, ta'sischi yoki direktor yaratishi mumkin",
              },
              {
                value: "public",
                title: "Davlat bog‘chasi",
                text: "Profil tekshiruvdan keyin faollashadi",
              },
            ].map((choice) => (
              <button
                type="button"
                key={choice.value}
                className={
                  selection.ownership_type === choice.value ? "selected" : ""
                }
                onClick={() =>
                  setSelection((current) => ({
                    ...current,
                    ownership_type: choice.value,
                    relationship:
                      choice.value === "public" && current.relationship === "owner"
                        ? "director"
                        : current.relationship,
                  }))
                }
              >
                <Building2 size={20} />
                <b>{choice.title}</b>
                <small>{choice.text}</small>
              </button>
            ))}
          </div>

          <label className="kg-label">Sizning munosabatingiz</label>
          <div className="kg-choice-grid">
            {[
              {
                value: "owner",
                title: "Mulkdor / ta'sischi",
                text: "Faqat xususiy bog'cha",
                disabled: selection.ownership_type === "public",
              },
              {
                value: "director",
                title: "Direktor",
                text: "Yaratish yoki mavjudiga qo'shilish",
              },
              {
                value: "administrator",
                title: "Administrator",
                text: "Boshqaruv ishlarini yuritadi",
              },
              {
                value: "educator",
                title: "Tarbiyachi / xodim",
                text: "Mavjud bog'chaga so'rov yuboradi",
              },
            ].map((choice) => (
              <button
                type="button"
                key={choice.value}
                disabled={choice.disabled}
                className={
                  selection.relationship === choice.value ? "selected" : ""
                }
                onClick={() =>
                  setSelection((current) => ({
                    ...current,
                    relationship: choice.value,
                  }))
                }
              >
                <Users size={19} />
                <b>{choice.title}</b>
                <small>{choice.text}</small>
              </button>
            ))}
          </div>

          {selection.relationship !== "educator" && (
            <>
              <label className="kg-label">Sozlash usuli</label>
              <div className="kg-segmented">
                {[
                  ["assistant", "AI avatar bilan"],
                  ["guided", "Bosqichma-bosqich"],
                  ["manual", "O'zim"],
                ].map(([value, label]) => (
                  <button
                    type="button"
                    key={value}
                    className={selection.setup_mode === value ? "selected" : ""}
                    onClick={() =>
                      setSelection((current) => ({
                        ...current,
                        setup_mode: value,
                      }))
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>

              {selection.setup_mode === "assistant" && (
                <div className="kg-avatar-picker">
                  <div>
                    <b>AI yo‘lko‘rsatuvchi</b>
                    <small>
                      Menyularni ko‘rsatadi, tushuntiradi va qoralama tayyorlaydi
                    </small>
                  </div>
                  <div className="kg-avatar-options">
                    {[
                      ["female", "Ziyo"],
                      ["male", "Temur"],
                      ["neutral", "Hamroh"],
                    ].map(([value, label]) => (
                      <button
                        type="button"
                        key={value}
                        className={preferences.variant === value ? "selected" : ""}
                        onClick={() => onPreferences({ variant: value })}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <label className="kg-switch-row">
                    <input
                      type="checkbox"
                      checked={preferences.speechEnabled}
                      onChange={(event) =>
                        onPreferences({ speechEnabled: event.target.checked })
                      }
                    />
                    Matn bilan birga ovoz chiqarib tushuntirsin
                  </label>
                </div>
              )}
            </>
          )}

          <div className="kg-legal-note">
            <ShieldCheck size={18} />
            <span>
              Bu amal platformadagi raqamli profilni yaratadi. Litsenziya yoki
              davlat ro‘yxatidan o‘tkazish o‘rnini bosmaydi.
            </span>
          </div>

          <button
            type="button"
            className="kg-primary-button"
            onClick={startDraft}
            disabled={busy}
          >
            {busy ? <Loader2 size={17} className="animate-spin" /> : null}
            {selection.relationship === "educator"
              ? "Bog'chani topish"
              : "Sozlashni boshlash"}
            <ChevronRight size={17} />
          </button>
        </section>
      </div>
    );
  }

  const stepIndex = ONBOARDING_STEPS.findIndex((item) => item.key === step);
  return (
    <div className="kg-shell kg-with-avatar">
      <BackButton
        onClick={stepIndex === 0 ? onBack : previousStep}
        label={stepIndex === 0 ? "Bekor qilish" : "Oldingi qadam"}
      />
      <div className="kg-wizard-progress">
        {ONBOARDING_STEPS.map((item, index) => (
          <button
            type="button"
            key={item.key}
            className={`${item.key === step ? "active" : ""} ${
              index < stepIndex ? "done" : ""
            }`}
            onClick={() => index <= stepIndex && setStep(item.key)}
          >
            <i>{index < stepIndex ? <Check size={13} /> : index + 1}</i>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <ErrorNotice error={error} />

      {step === "basics" && (
        <section className="kg-form-card">
          <header>
            <span className="kg-eyebrow">ASOSIY MA’LUMOT</span>
            <h2>Bog‘chani aniqlab olamiz</h2>
            <p>Faqat bilgan ma’lumotingizni kiriting; rasmiy ma’lumot taxmin qilinmaydi.</p>
          </header>
          <div className="kg-field">
            <label>Bog‘cha nomi *</label>
            <input
              data-ai-anchor="kg-name"
              value={basic.name}
              onChange={(event) =>
                setBasic((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Masalan: Mehribon bolajon bog'chasi"
              maxLength={180}
            />
          </div>
          <div className="kg-form-grid two">
            <div className="kg-field">
              <label>Viloyat</label>
              <select
                value={basic.region}
                onChange={(event) =>
                  setBasic((current) => ({
                    ...current,
                    region: event.target.value,
                    district: "",
                  }))
                }
              >
                <option value="">Tanlang</option>
                {VILOYATLAR.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
            <div className="kg-field">
              <label>Tuman / shahar</label>
              <select
                value={basic.district}
                disabled={!basic.region}
                onChange={(event) =>
                  setBasic((current) => ({
                    ...current,
                    district: event.target.value,
                  }))
                }
              >
                <option value="">Tanlang</option>
                {(HUDUDLAR[basic.region] || []).map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="kg-form-grid two">
            <div className="kg-field">
              <label>Manzil</label>
              <input
                value={basic.address}
                onChange={(event) =>
                  setBasic((current) => ({
                    ...current,
                    address: event.target.value,
                  }))
                }
                placeholder="Ko'cha, uy raqami"
              />
            </div>
            <div className="kg-field">
              <label>Aloqa telefoni</label>
              <input
                value={basic.phone}
                onChange={(event) =>
                  setBasic((current) => ({ ...current, phone: event.target.value }))
                }
                placeholder="+998 __ ___ __ __"
              />
            </div>
          </div>
        </section>
      )}

      {step === "schedule" && (
        <section className="kg-form-card">
          <header>
            <span className="kg-eyebrow">ISH TARTIBI</span>
            <h2>Kalendar uchun asosiy vaqtlar</h2>
            <p>Bu vaqtlar keyingi davomat, mashg‘ulot va xodimlar jadvaliga asos bo‘ladi.</p>
          </header>
          <label className="kg-label">Ish kunlari</label>
          <div className="kg-day-picker">
            {DAY_LABELS.map((day) => (
              <button
                type="button"
                key={day.value}
                className={basic.work_days.includes(day.value) ? "selected" : ""}
                onClick={() =>
                  setBasic((current) => ({
                    ...current,
                    work_days: current.work_days.includes(day.value)
                      ? current.work_days.filter((value) => value !== day.value)
                      : [...current.work_days, day.value].sort(),
                  }))
                }
              >
                {day.label}
              </button>
            ))}
          </div>
          <div className="kg-form-grid three">
            <div className="kg-field">
              <label>Ochilish vaqti</label>
              <input
                data-ai-anchor="kg-work-start"
                type="time"
                value={basic.work_start}
                onChange={(event) =>
                  setBasic((current) => ({
                    ...current,
                    work_start: event.target.value,
                  }))
                }
              />
            </div>
            <div className="kg-field">
              <label>Yopilish vaqti</label>
              <input
                type="time"
                value={basic.work_end}
                onChange={(event) =>
                  setBasic((current) => ({
                    ...current,
                    work_end: event.target.value,
                  }))
                }
              />
            </div>
            <div className="kg-field">
              <label>Umumiy sig‘im</label>
              <input
                type="number"
                min="1"
                value={basic.capacity}
                onChange={(event) =>
                  setBasic((current) => ({
                    ...current,
                    capacity: event.target.value,
                  }))
                }
                placeholder="Masalan: 120"
              />
            </div>
          </div>
          {selection.ownership_type === "private" && (
            <div className="kg-payment-setup">
              <label className="kg-switch-row">
                <input
                  type="checkbox"
                  checked={basic.payment_enabled}
                  onChange={(event) =>
                    setBasic((current) => ({
                      ...current,
                      payment_enabled: event.target.checked,
                    }))
                  }
                />
                Oylik to‘lov nazoratini yoqish
              </label>
              {basic.payment_enabled && (
                <div className="kg-field">
                  <label>Standart oylik to‘lov (so‘m)</label>
                  <input
                    type="number"
                    min="0"
                    value={basic.monthly_fee}
                    onChange={(event) =>
                      setBasic((current) => ({
                        ...current,
                        monthly_fee: event.target.value,
                      }))
                    }
                    placeholder="Masalan: 800000"
                  />
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {step === "groups" && (
        <section className="kg-form-card">
          <header>
            <span className="kg-eyebrow">GURUHLAR</span>
            <h2>Birinchi guruhlarni kiriting</h2>
            <p>Hozir bo‘sh qoldirib, keyin ish maydonidan ham yaratishingiz mumkin.</p>
          </header>
          <div className="kg-group-builder">
            {groups.map((group, index) => (
              <div className="kg-group-draft" key={group.localId}>
                <div className="kg-group-draft-title">
                  <b>{index + 1}-guruh</b>
                  {groups.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setGroups((current) =>
                          current.filter((item) => item.localId !== group.localId),
                        )
                      }
                    >
                      <X size={15} /> Olib tashlash
                    </button>
                  )}
                </div>
                <div className="kg-field">
                  <label>Guruh nomi</label>
                  <input
                    data-ai-anchor={index === 0 ? "kg-group-name" : undefined}
                    value={group.name}
                    onChange={(event) =>
                      setGroups((current) =>
                        current.map((item) =>
                          item.localId === group.localId
                            ? { ...item, name: event.target.value }
                            : item,
                        ),
                      )
                    }
                    placeholder="Masalan: Quyoshcha"
                  />
                </div>
                <div className="kg-form-grid four">
                  <div className="kg-field">
                    <label>Min. yosh (oy)</label>
                    <input
                      type="number"
                      min="0"
                      max="120"
                      value={group.age_min_months}
                      onChange={(event) =>
                        setGroups((current) =>
                          current.map((item) =>
                            item.localId === group.localId
                              ? { ...item, age_min_months: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </div>
                  <div className="kg-field">
                    <label>Maks. yosh (oy)</label>
                    <input
                      type="number"
                      min="0"
                      max="120"
                      value={group.age_max_months}
                      onChange={(event) =>
                        setGroups((current) =>
                          current.map((item) =>
                            item.localId === group.localId
                              ? { ...item, age_max_months: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </div>
                  <div className="kg-field">
                    <label>Sig‘im</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={group.capacity}
                      onChange={(event) =>
                        setGroups((current) =>
                          current.map((item) =>
                            item.localId === group.localId
                              ? { ...item, capacity: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </div>
                  <div className="kg-field">
                    <label>Xona</label>
                    <input
                      value={group.room_name}
                      onChange={(event) =>
                        setGroups((current) =>
                          current.map((item) =>
                            item.localId === group.localId
                              ? { ...item, room_name: event.target.value }
                              : item,
                          ),
                        )
                      }
                      placeholder="1-xona"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="kg-secondary-button"
            onClick={() =>
              setGroups((current) => [
                ...current,
                {
                  localId: Date.now(),
                  name: "",
                  age_min_months: 48,
                  age_max_months: 60,
                  capacity: 20,
                  room_name: "",
                },
              ])
            }
          >
            <Plus size={16} /> Yana guruh
          </button>
        </section>
      )}

      {step === "team" && (
        <section className="kg-form-card" data-ai-anchor="kg-team-info">
          <header>
            <span className="kg-eyebrow">JAMOA VA ROLLAR</span>
            <h2>Xodimlar bog‘cha ochilgandan keyin ulanadi</h2>
            <p>Har bir xodim uchun alohida hisob va muassasa ichidagi lavozim bo‘ladi.</p>
          </header>
          <div className="kg-process-list">
            {[
              ["1", "Xodim ismi va lavozimini tanlaysiz"],
              ["2", "Tizim bir martalik taklif kodi yaratadi"],
              ["3", "Xodim o‘z hisobida kodni kiritadi"],
              ["4", "Faqat lavozimiga mos menyular ochiladi"],
            ].map(([number, text]) => (
              <div key={number}>
                <i>{number}</i>
                <span>{text}</span>
              </div>
            ))}
          </div>
          <div className="kg-safety-note compact">
            <ShieldCheck size={20} />
            <div>
              <b>AI avatar rol bera olmaydi</b>
              <p>U formani tushuntiradi, lekin yuqori vakolatni faqat rahbar tasdiqlaydi.</p>
            </div>
          </div>
        </section>
      )}

      {step === "preview" && (
        <section className="kg-form-card" data-ai-anchor="kg-preview">
          <header>
            <span className="kg-eyebrow">YAKUNIY TEKSHIRUV</span>
            <h2>Raqamli ish maydoni tayyor</h2>
            <p>Quyidagi ma’lumotni tekshiring. Tasdiqlashdan oldin ortga qaytib o‘zgartira olasiz.</p>
          </header>
          {!preview ? (
            <LoadingBlock text="Ma'lumot tekshirilmoqda..." />
          ) : (
            <>
              <div className="kg-preview-grid">
                <div>
                  <small>Bog‘cha</small>
                  <b>{preview.summary.name}</b>
                </div>
                <div>
                  <small>Turi</small>
                  <b>
                    {preview.summary.ownership_type === "private"
                      ? "Xususiy"
                      : "Davlat"}
                  </b>
                </div>
                <div>
                  <small>Ish vaqti</small>
                  <b>
                    {preview.summary.work_start || "—"} –{" "}
                    {preview.summary.work_end || "—"}
                  </b>
                </div>
                <div>
                  <small>Guruhlar</small>
                  <b>{preview.summary.group_count} ta</b>
                </div>
                <div>
                  <small>Sig‘im</small>
                  <b>{preview.summary.capacity || "Kiritilmagan"}</b>
                </div>
                <div>
                  <small>Sizning rolingiz</small>
                  <b>{ROLE_LABELS[preview.summary.relationship]}</b>
                </div>
              </div>
              {preview.summary.groups.length > 0 && (
                <div className="kg-preview-groups">
                  {preview.summary.groups.map((group) => (
                    <span key={group.name}>
                      {group.name}
                      {group.capacity ? ` · ${group.capacity} bola` : ""}
                    </span>
                  ))}
                </div>
              )}
              {(preview.warnings || []).map((warning) => (
                <div className="kg-warning" key={warning}>
                  <BellRing size={17} /> {warning}
                </div>
              ))}
              <div className="kg-legal-note">
                <ShieldCheck size={18} />
                <span>{preview.legal_notice}</span>
              </div>
            </>
          )}
        </section>
      )}

      <div className="kg-wizard-actions">
        {stepIndex > 0 && (
          <button type="button" className="kg-secondary-button" onClick={previousStep}>
            <ArrowLeft size={16} /> Ortga
          </button>
        )}
        {step !== "preview" ? (
          <button
            type="button"
            className="kg-primary-button"
            onClick={nextStep}
            disabled={busy}
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            Saqlash va davom etish <ChevronRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            className="kg-primary-button"
            onClick={confirm}
            disabled={busy || !preview}
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            Men tekshirdim — bog‘chani yaratish
          </button>
        )}
      </div>

      {selection.setup_mode === "assistant" && (
        <GuidedAvatar
          enabled={preferences.enabled}
          variant={preferences.variant}
          speechEnabled={preferences.speechEnabled}
          steps={ONBOARDING_STEPS}
          activeKey={step}
          onNavigate={(nextKey) => {
            const nextIndex = ONBOARDING_STEPS.findIndex(
              (item) => item.key === nextKey,
            );
            if (nextIndex <= stepIndex) setStep(nextKey);
            else nextStep();
          }}
          onUndo={() => {
            if (stepIndex > 0) {
              setStep(ONBOARDING_STEPS[stepIndex - 1].key);
            }
          }}
          onAction={logAssistantAction}
          onSpeechChange={(speechEnabled) => onPreferences({ speechEnabled })}
          onEnabledChange={(enabled) => onPreferences({ enabled })}
        />
      )}
    </div>
  );
}

function JoinKindergarten({ token, apiBase, onBack, onRequested }) {
  const [tab, setTab] = useState("search");
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("");
  const [role, setRole] = useState("educator");
  const [results, setResults] = useState([]);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const search = async () => {
    if (query.trim().length < 2) {
      setError("Bog'cha nomidan kamida 2 ta harf yozing");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const data = await kindergartenApi(
        `/search?${queryString({ token, q: query.trim(), region })}`,
        { apiBase },
      );
      setResults(data.results || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const requestJoin = async (contextId) => {
    setBusy(true);
    setError("");
    try {
      await kindergartenApi("/join-requests", {
        apiBase,
        method: "POST",
        body: { token, context_id: contextId, requested_role: role },
      });
      setSuccess("So'rov yuborildi. Bog'cha rahbari tasdiqlagach menyular ochiladi.");
      onRequested?.();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const acceptCode = async () => {
    setBusy(true);
    setError("");
    try {
      await kindergartenApi("/staff/accept-invite", {
        apiBase,
        method: "POST",
        body: { token, invite_code: code.trim() },
      });
      setSuccess("Taklif qabul qilindi. Bog'cha ish maydoni hisobingizga qo'shildi.");
      onRequested?.();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="kg-shell">
      <BackButton onClick={onBack} />
      <header className="kg-page-header">
        <span className="kg-eyebrow">BOG‘CHAGA QO‘SHILISH</span>
        <h1>Mavjud muassasani toping</h1>
        <p>Rahbar tasdig‘i yoki maxsus taklif kodi orqali xavfsiz ulanasiz.</p>
      </header>
      <div className="kg-segmented kg-tabs">
        <button
          type="button"
          className={tab === "search" ? "selected" : ""}
          onClick={() => setTab("search")}
        >
          Nom bo‘yicha
        </button>
        <button
          type="button"
          className={tab === "code" ? "selected" : ""}
          onClick={() => setTab("code")}
        >
          Taklif kodi
        </button>
      </div>
      <ErrorNotice error={error} />
      {success && (
        <div className="kg-success">
          <BadgeCheck size={19} /> {success}
        </div>
      )}

      {tab === "search" ? (
        <section className="kg-form-card">
          <div className="kg-form-grid search">
            <div className="kg-field">
              <label>Bog‘cha nomi</label>
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setResults([]);
                }}
                onKeyDown={(event) => event.key === "Enter" && search()}
                placeholder="Masalan: Quyoshcha"
              />
            </div>
            <div className="kg-field">
              <label>Viloyat (ixtiyoriy)</label>
              <select value={region} onChange={(event) => {
                setRegion(event.target.value);
                setResults([]);
              }}>
                <option value="">Barchasi</option>
                {VILOYATLAR.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" className="kg-primary-button" onClick={search}>
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              Qidirish
            </button>
          </div>

          <label className="kg-label">So‘raladigan lavozim</label>
          <select
            className="kg-wide-select"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            {Object.entries(ROLE_LABELS)
              .filter(([key]) => !["owner", "founder"].includes(key))
              .map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
          </select>

          <div className="kg-search-results">
            {results.map((item) => (
              <div key={item.context_id}>
                <span className="kg-workspace-logo">
                  <Building2 size={19} />
                </span>
                <span>
                  <b>{item.name}</b>
                  <small>
                    {[item.region, item.district].filter(Boolean).join(", ")} ·{" "}
                    {item.ownership_type === "private" ? "Xususiy" : "Davlat"}
                  </small>
                </span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => requestJoin(item.context_id)}
                >
                  So‘rov yuborish
                </button>
              </div>
            ))}
            {!busy && query && results.length === 0 && (
              <p className="kg-empty-text">Mos bog‘cha topilmadi.</p>
            )}
          </div>
        </section>
      ) : (
        <section className="kg-form-card compact-card">
          <div className="kg-field">
            <label>Rahbar bergan taklif kodi</label>
            <input
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              placeholder="AB12-CD34"
              maxLength={9}
            />
          </div>
          <button
            type="button"
            className="kg-primary-button"
            disabled={busy || code.trim().length < 8}
            onClick={acceptCode}
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            Kod bilan ulanish
          </button>
        </section>
      )}
    </div>
  );
}

function KindergartenDashboard({
  token,
  apiBase,
  workspace,
  preferences,
  onPreferences,
  onBack,
  onLegacy,
}) {
  const [dashboard, setDashboard] = useState(null);
  const [section, setSection] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assistantSession, setAssistantSession] = useState(null);
  const assistantStarted = useRef(false);
  const sectionHistory = useRef([]);

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await kindergartenApi(
        `/dashboard?${queryString({
          token,
          context_id: workspace.context_id,
        })}`,
        { apiBase },
      );
      setDashboard(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace.context_id, token]);

  useEffect(() => {
    if (!dashboard || assistantStarted.current || !preferences.enabled) return;
    assistantStarted.current = true;
    const manager = dashboard.roles.some((role) => MANAGER_ROLES.includes(role));
    const educator = dashboard.roles.some((role) =>
      ["educator", "assistant_educator", "methodist"].includes(role),
    );
    const accountant = dashboard.roles.includes("accountant");
    const nurse = dashboard.roles.includes("nurse");
    kindergartenApi("/assistant/sessions", {
      apiBase,
      method: "POST",
      body: {
        token,
        context_id: workspace.context_id,
        workflow_key: manager
          ? "kindergarten_director_tour"
          : educator
            ? "kindergarten_educator_tour"
            : accountant
              ? "kindergarten_accountant_tour"
              : nurse
                ? "kindergarten_nurse_tour"
                : "kindergarten_staff_tour",
        avatar_enabled: preferences.enabled,
        speech_enabled: preferences.speechEnabled,
        avatar_variant: preferences.variant,
      },
    })
      .then((data) => setAssistantSession(data.session))
      .catch(() => {});
  }, [apiBase, dashboard, preferences, token, workspace.context_id]);

  const assistantAction = async (actionId, target) => {
    if (!assistantSession) return;
    try {
      await kindergartenApi(
        `/assistant/sessions/${assistantSession.id}/actions`,
        {
          apiBase,
          method: "POST",
          body: {
            token,
            action_id: actionId,
            ui_anchor: target?.anchor,
            payload:
              actionId === "NEXT_STEP"
                ? { next_step: target?.key }
                : actionId === "PREVIOUS_STEP"
                  ? { previous_step: target?.key }
                  : {},
          },
        },
      );
    } catch {
      // Ko'rsatma ishlashi audit tarmog'iga bog'liq emas.
    }
  };

  const selectSection = (key) => {
    if (key === section) return;
    sectionHistory.current = [...sectionHistory.current.slice(-19), section];
    setSection(key);
    const target = tourForRoles(dashboard?.roles).find((item) => item.key === key);
    assistantAction("SHOW_MENU", target || { key, anchor: `kg-menu-${key}` });
  };

  const undoSection = () => {
    const previous = sectionHistory.current.pop();
    if (previous) setSection(previous);
  };

  if (loading) {
    return (
      <div className="kg-shell">
        <BackButton onClick={onBack} />
        <LoadingBlock text="Bog'cha boshqaruvi yuklanmoqda..." />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="kg-shell">
        <BackButton onClick={onBack} />
        <ErrorNotice error={error} onRetry={loadDashboard} />
      </div>
    );
  }

  const manager = dashboard.roles.some((role) => MANAGER_ROLES.includes(role));
  const menu = dashboard.menu || [];
  const allowedMenuKeys = new Set(menu.map((item) => item.key));
  const tour = tourForRoles(dashboard.roles).filter((item) =>
    allowedMenuKeys.has(item.key),
  );
  const activeMenu = menu.find((item) => item.key === section);
  const customMessage = tour.some((item) => item.key === section)
    ? undefined
    : activeMenu
      ? `${activeMenu.label} bo'limi ochildi. Bu yerda faqat lavozimingizga ruxsat berilgan ma'lumot va amallar ko'rsatiladi.`
      : undefined;

  return (
    <div className="kg-dashboard-shell kg-with-avatar">
      <header className="kg-dashboard-header">
        <button type="button" className="kg-back" onClick={onBack}>
          <ArrowLeft size={17} /> Bog‘chalarim
        </button>
        <div className="kg-dashboard-brand">
          <span className="kg-workspace-logo">
            <Building2 size={22} />
          </span>
          <div>
            <h1>{dashboard.profile.name}</h1>
            <p>
              {dashboard.profile.ownership_type === "private" ? "Xususiy" : "Davlat"}{" "}
              bog‘chasi · {dashboard.role_labels.join(", ")}
            </p>
          </div>
        </div>
        <div className="kg-dashboard-statuses">
          <StatusPill status={dashboard.profile.onboarding_status} />
          <button
            type="button"
            className="kg-avatar-setting"
            onClick={() => onPreferences({ enabled: !preferences.enabled })}
          >
            AI {preferences.enabled ? "yoqilgan" : "o‘chirilgan"}
          </button>
        </div>
      </header>

      <nav className="kg-dashboard-nav">
        {menu.map((item) => {
          const Icon =
            {
              overview: LayoutDashboard,
              groups: Users,
              children: Baby,
              attendance: BadgeCheck,
              daily_reports: ClipboardCheck,
              calendar: CalendarDays,
              staff: UserPlus,
              payments: CircleDollarSign,
              settings: Settings,
            }[item.key] || LayoutDashboard;
          return (
            <button
              type="button"
              key={item.key}
              data-ai-anchor={`kg-menu-${item.key}`}
              className={section === item.key ? "active" : ""}
              onClick={() => selectSection(item.key)}
            >
              <Icon size={17} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <main className="kg-dashboard-content">
        <ErrorNotice error={error} onRetry={loadDashboard} />
        {section === "overview" && (
          <OverviewPanel
            dashboard={dashboard}
            manager={manager}
            onOpen={selectSection}
          />
        )}
        {section === "groups" && (
          <GroupsPanel
            token={token}
            apiBase={apiBase}
            contextId={workspace.context_id}
            manager={manager}
          />
        )}
        {section === "staff" && (
          <StaffPanel
            token={token}
            apiBase={apiBase}
            contextId={workspace.context_id}
          />
        )}
        {section === "children" && (
          <ChildrenPanel
            token={token}
            apiBase={apiBase}
            contextId={workspace.context_id}
            canEdit={dashboard.roles.some((role) =>
              [...MANAGER_ROLES, "methodist", "educator", "assistant_educator"].includes(
                role,
              ),
            )}
          />
        )}
        {section === "attendance" && (
          <AttendancePanel
            token={token}
            apiBase={apiBase}
            contextId={workspace.context_id}
          />
        )}
        {section === "daily_reports" && (
          <DailyReportsPanel
            token={token}
            apiBase={apiBase}
            contextId={workspace.context_id}
          />
        )}
        {section === "calendar" && (
          <CalendarPanel
            token={token}
            apiBase={apiBase}
            contextId={workspace.context_id}
            canEdit={dashboard.roles.some((role) =>
              [...MANAGER_ROLES, "methodist", "educator"].includes(role),
            )}
          />
        )}
        {section === "payments" && (
          <PaymentsPanel
            token={token}
            apiBase={apiBase}
            contextId={workspace.context_id}
            profile={dashboard.profile}
          />
        )}
        {section === "settings" && (
          <SettingsPanel
            token={token}
            apiBase={apiBase}
            profile={dashboard.profile}
            onSaved={(profile) =>
              setDashboard((current) => ({ ...current, profile }))
            }
            preferences={preferences}
            onPreferences={onPreferences}
          />
        )}
        {onLegacy && dashboard.profile.legacy_bogcha_id && (
          <button type="button" className="kg-legacy-link" onClick={onLegacy}>
            Eski guruh ekranini ochish
          </button>
        )}
      </main>

      <GuidedAvatar
        enabled={preferences.enabled}
        variant={preferences.variant}
        speechEnabled={preferences.speechEnabled}
        steps={tour}
        activeKey={section}
        message={customMessage}
        onNavigate={selectSection}
        onUndo={undoSection}
        onAction={assistantAction}
        onSpeechChange={(speechEnabled) => onPreferences({ speechEnabled })}
        onEnabledChange={(enabled) => onPreferences({ enabled })}
      />
    </div>
  );
}

function OverviewPanel({ dashboard, manager, onOpen }) {
  const allowedKeys = new Set((dashboard.menu || []).map((item) => item.key));
  const metrics = [
    ["groups", "Guruhlar", dashboard.metrics.groups, Users],
    ["staff", "Xodimlar", dashboard.metrics.staff, UserPlus],
    ["children", "Bolalar", dashboard.metrics.children, Baby],
    ["attendance", "Bugun kelgan", dashboard.metrics.present_today, BadgeCheck],
    ["calendar", "7 kunlik tadbir", dashboard.metrics.events_week, CalendarDays],
    ["payments", "Muddati o'tgan", dashboard.metrics.overdue_invoices, CircleDollarSign],
  ];
  return (
    <div>
      <section className="kg-metric-grid">
        {metrics
          .filter(([key]) => allowedKeys.has(key) && (key !== "staff" || manager))
          .map(([key, label, value, Icon]) => (
            <button type="button" key={key} onClick={() => onOpen(key)}>
              <span><Icon size={19} /></span>
              <small>{label}</small>
              <b>{value || 0}</b>
            </button>
          ))}
      </section>
      {dashboard.checklist.length > 0 && <section className="kg-dashboard-card">
        <div className="kg-section-title">
          <div>
            <span className="kg-eyebrow">ISHGA TUSHIRISH</span>
            <h2>Bog‘cha tayyorlik ro‘yxati</h2>
          </div>
          <span>
            {dashboard.checklist.filter((item) => item.done).length}/
            {dashboard.checklist.length}
          </span>
        </div>
        <div className="kg-checklist">
          {dashboard.checklist.map((item) => (
            <button type="button" key={item.key} onClick={() => onOpen(item.key)}>
              <i className={item.done ? "done" : ""}>
                {item.done && <Check size={14} />}
              </i>
              <span>{item.label}</span>
              <ChevronRight size={16} />
            </button>
          ))}
        </div>
      </section>}
      <section className="kg-dashboard-card kg-today">
        <div>
          <span className="kg-eyebrow">BUGUN</span>
          <h2>
            {dashboard.profile.work_start?.slice(0, 5) || "08:00"} –{" "}
            {dashboard.profile.work_end?.slice(0, 5) || "18:00"}
          </h2>
          <p>Kalendar va davomat shu ish tartibiga tayangan holda ko‘rsatiladi.</p>
        </div>
        <Clock3 size={34} />
      </section>
    </div>
  );
}

function GroupsPanel({ token, apiBase, contextId, manager }) {
  const [items, setItems] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    age_min_months: 36,
    age_max_months: 48,
    capacity: 20,
    room_name: "",
  });
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const load = async (afterId = 0) => {
    setBusy(true);
    setError("");
    try {
      const data = await kindergartenApi(
        `/groups?${queryString({
          token,
          context_id: contextId,
          after_id: afterId,
          limit: 100,
        })}`,
        { apiBase },
      );
      setItems((current) =>
        afterId ? mergeById(current, data.items || []) : data.items || [],
      );
      setNextCursor(data.next_cursor);
      setHasMore(Boolean(data.has_more));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextId]);

  const create = async () => {
    setBusy(true);
    setError("");
    try {
      await kindergartenApi("/groups", {
        apiBase,
        method: "POST",
        body: { token, context_id: contextId, ...form },
      });
      setForm({ name: "", age_min_months: 36, age_max_months: 48, capacity: 20, room_name: "" });
      setFormOpen(false);
      await load(0);
    } catch (requestError) {
      setError(requestError.message);
      setBusy(false);
    }
  };

  return (
    <section className="kg-dashboard-card">
      <div className="kg-section-title">
        <div>
          <span className="kg-eyebrow">GURUHLAR</span>
          <h2>Yosh va xona bo‘yicha guruhlar</h2>
        </div>
        {manager && (
          <button type="button" className="kg-small-primary" onClick={() => setFormOpen(!formOpen)}>
            <Plus size={15} /> Yangi guruh
          </button>
        )}
      </div>
      <ErrorNotice error={error} />
      {formOpen && (
        <div className="kg-inline-form">
          <div className="kg-field"><label>Nomi</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="kg-field"><label>Min. yosh (oy)</label><input type="number" value={form.age_min_months} onChange={(e) => setForm({ ...form, age_min_months: Number(e.target.value) })} /></div>
          <div className="kg-field"><label>Maks. yosh (oy)</label><input type="number" value={form.age_max_months} onChange={(e) => setForm({ ...form, age_max_months: Number(e.target.value) })} /></div>
          <div className="kg-field"><label>Sig‘im</label><input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} /></div>
          <div className="kg-field"><label>Xona</label><input value={form.room_name} onChange={(e) => setForm({ ...form, room_name: e.target.value })} /></div>
          <button type="button" onClick={create} disabled={busy || !form.name.trim()}>Saqlash</button>
        </div>
      )}
      {busy && items.length === 0 ? <LoadingBlock /> : (
        <div className="kg-entity-grid">
          {items.map((group) => (
            <article key={group.id}>
              <span className="kg-list-icon"><Users size={18} /></span>
              <div>
                <h3>{group.name}</h3>
                <p>
                  {group.age_min_months != null && group.age_max_months != null
                    ? `${group.age_min_months}–${group.age_max_months} oy`
                    : "Yosh belgilanmagan"}
                  {group.room_name ? ` · ${group.room_name}` : ""}
                </p>
                <small>{group.teacher_name || "Tarbiyachi biriktirilmagan"}</small>
              </div>
              <b>{group.child_count}/{group.capacity || "∞"}</b>
            </article>
          ))}
          {!busy && items.length === 0 && <p className="kg-empty-text">Hali guruh yaratilmagan.</p>}
        </div>
      )}
      <LoadMoreButton
        hasMore={hasMore}
        busy={busy}
        onClick={() => load(nextCursor)}
      />
    </section>
  );
}

function StaffPanel({ token, apiBase, contextId }) {
  const [staff, setStaff] = useState([]);
  const [requests, setRequests] = useState([]);
  const {
    groups,
    groupsBusy,
    groupsError,
    groupsHasMore,
    loadMoreGroups,
  } = useGroupOptions({ token, apiBase, contextId });
  const [invite, setInvite] = useState({ role_key: "educator", group_id: "", invited_name: "", invited_contact: "" });
  const [generatedCode, setGeneratedCode] = useState("");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [staffCursor, setStaffCursor] = useState(null);
  const [requestCursor, setRequestCursor] = useState(null);
  const [staffMore, setStaffMore] = useState(false);
  const [requestMore, setRequestMore] = useState(false);

  const load = async () => {
    setBusy(true);
    setError("");
    try {
      const [staffData, requestData] = await Promise.all([
        kindergartenApi(`/staff?${queryString({ token, context_id: contextId, limit: 100 })}`, { apiBase }),
        kindergartenApi(`/join-requests?${queryString({ token, context_id: contextId, limit: 100 })}`, { apiBase }),
      ]);
      setStaff(staffData.items || []);
      setRequests(requestData.items || []);
      setStaffCursor(staffData.next_cursor);
      setRequestCursor(requestData.next_cursor);
      setStaffMore(Boolean(staffData.has_more));
      setRequestMore(Boolean(requestData.has_more));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextId]);

  const loadMoreStaff = async () => {
    setBusy(true);
    try {
      const data = await kindergartenApi(
        `/staff?${queryString({
          token,
          context_id: contextId,
          after_id: staffCursor,
          limit: 100,
        })}`,
        { apiBase },
      );
      setStaff((current) => mergeById(current, data.items || []));
      setStaffCursor(data.next_cursor);
      setStaffMore(Boolean(data.has_more));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const loadMoreRequests = async () => {
    setBusy(true);
    try {
      const data = await kindergartenApi(
        `/join-requests?${queryString({
          token,
          context_id: contextId,
          after_id: requestCursor,
          limit: 100,
        })}`,
        { apiBase },
      );
      setRequests((current) => mergeById(current, data.items || []));
      setRequestCursor(data.next_cursor);
      setRequestMore(Boolean(data.has_more));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const makeInvite = async () => {
    setBusy(true);
    setError("");
    try {
      const data = await kindergartenApi("/staff/invite", {
        apiBase,
        method: "POST",
        body: {
          token,
          context_id: contextId,
          ...invite,
          group_id: invite.group_id ? Number(invite.group_id) : null,
        },
      });
      setGeneratedCode(data.invite_code);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const decide = async (requestId, approve) => {
    setBusy(true);
    try {
      await kindergartenApi("/join-requests/decision", {
        apiBase,
        method: "POST",
        body: { token, request_id: requestId, approve },
      });
      await load();
    } catch (requestError) {
      setError(requestError.message);
      setBusy(false);
    }
  };

  return (
    <div className="kg-two-column">
      <section className="kg-dashboard-card">
        <div className="kg-section-title"><div><span className="kg-eyebrow">XODIMLAR</span><h2>Faol jamoa</h2></div><span>{staff.length} ta</span></div>
        <ErrorNotice error={error || groupsError} />
        {busy && staff.length === 0 ? <LoadingBlock /> : (
          <div className="kg-compact-list">
            {staff.map((person) => (
              <div key={person.id}>
                <span className="kg-list-icon"><Users size={17} /></span>
                <span><b>{person.full_name}</b><small>{person.role_label}{person.group_name ? ` · ${person.group_name}` : ""}</small></span>
                <StatusPill status={person.status} />
              </div>
            ))}
            <LoadMoreButton
              hasMore={staffMore}
              busy={busy}
              onClick={loadMoreStaff}
            />
          </div>
        )}
      </section>
      <div>
        <section className="kg-dashboard-card">
          <span className="kg-eyebrow">TAKLIF KODI</span>
          <h2>Yangi xodimni ulash</h2>
          <div className="kg-field"><label>F.I.Sh. (ixtiyoriy)</label><input value={invite.invited_name} onChange={(e) => setInvite({ ...invite, invited_name: e.target.value })} /></div>
          <div className="kg-field"><label>Lavozim</label><select value={invite.role_key} onChange={(e) => setInvite({ ...invite, role_key: e.target.value, group_id: "" })}>{Object.entries(ROLE_LABELS).filter(([key]) => !["owner", "founder", "system_admin"].includes(key)).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div>
          {!MANAGER_ROLES.includes(invite.role_key) && (
            <div className="kg-field">
              <label>Guruh doirasi</label>
              <select
                value={invite.group_id}
                onChange={(event) =>
                  setInvite({ ...invite, group_id: event.target.value })
                }
              >
                <option value="">Barcha guruhlar</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
              <LoadMoreButton
                hasMore={groupsHasMore}
                busy={groupsBusy}
                onClick={loadMoreGroups}
              />
            </div>
          )}
          <div className="kg-field"><label>Telefon / email (ixtiyoriy)</label><input value={invite.invited_contact} onChange={(e) => setInvite({ ...invite, invited_contact: e.target.value })} /></div>
          <button type="button" className="kg-primary-button" onClick={makeInvite} disabled={busy}><UserPlus size={16} /> Kod yaratish</button>
          {generatedCode && (
            <div className="kg-invite-code">
              <small>Bir martalik kod</small><b>{generatedCode}</b>
              <button type="button" onClick={() => navigator.clipboard?.writeText(generatedCode)}><Copy size={15} /> Nusxalash</button>
            </div>
          )}
        </section>
        {requests.length > 0 && (
          <section className="kg-dashboard-card">
            <span className="kg-eyebrow">QO‘SHILISH SO‘ROVLARI</span>
            <h2>Rahbar tasdig‘i</h2>
            <div className="kg-request-list">
              {requests.map((request) => (
                <div key={request.id}>
                  <span><b>{request.full_name}</b><small>{ROLE_LABELS[request.requested_role]}</small></span>
                  <button type="button" aria-label={`${request.full_name} so'rovini tasdiqlash`} onClick={() => decide(request.id, true)}><Check size={14} /></button>
                  <button type="button" aria-label={`${request.full_name} so'rovini rad etish`} className="reject" onClick={() => decide(request.id, false)}><X size={14} /></button>
                </div>
              ))}
              <LoadMoreButton
                hasMore={requestMore}
                busy={busy}
                onClick={loadMoreRequests}
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function ChildrenPanel({ token, apiBase, contextId, canEdit }) {
  const [children, setChildren] = useState([]);
  const {
    groups,
    groupsBusy,
    groupsError,
    groupsHasMore,
    loadMoreGroups,
  } = useGroupOptions({ token, apiBase, contextId, enabled: canEdit });
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ full_name: "", group_id: "", birth_date: "", gender: "unspecified", allergies: "", guardian_name: "", guardian_phone: "", guardian_relationship: "Ona" });
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const load = async (afterId = 0) => {
    setBusy(true);
    try {
      const childData = await kindergartenApi(
        `/children?${queryString({
          token,
          context_id: contextId,
          after_id: afterId,
          limit: 100,
        })}`,
        { apiBase },
      );
      setChildren((current) =>
        afterId
          ? mergeById(current, childData.items || [])
          : childData.items || [],
      );
      setNextCursor(childData.next_cursor);
      setHasMore(Boolean(childData.has_more));
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextId]);

  const create = async () => {
    setBusy(true);
    try {
      await kindergartenApi("/children", {
        apiBase,
        method: "POST",
        body: {
          token,
          context_id: contextId,
          ...form,
          group_id: form.group_id ? Number(form.group_id) : null,
          birth_date: form.birth_date || null,
        },
      });
      setForm({ full_name: "", group_id: "", birth_date: "", gender: "unspecified", allergies: "", guardian_name: "", guardian_phone: "", guardian_relationship: "Ona" });
      setFormOpen(false);
      await load(0);
    } catch (requestError) {
      setError(requestError.message);
      setBusy(false);
    }
  };

  return (
    <section className="kg-dashboard-card">
      <div className="kg-section-title">
        <div><span className="kg-eyebrow">BOLALAR</span><h2>Guruh va ota-ona aloqasi</h2></div>
        {canEdit && <button type="button" className="kg-small-primary" onClick={() => setFormOpen(!formOpen)}><Plus size={15} /> Bola qo‘shish</button>}
      </div>
      <ErrorNotice error={error || groupsError} />
      {formOpen && (
        <div className="kg-child-form">
          <div className="kg-field"><label>Bola F.I.Sh. *</label><input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
          <div className="kg-form-grid three">
            <div className="kg-field">
              <label>Guruh</label>
              <select value={form.group_id} onChange={(e) => setForm({ ...form, group_id: e.target.value })}>
                <option value="">Tanlanmagan</option>
                {groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
              </select>
              <LoadMoreButton
                hasMore={groupsHasMore}
                busy={groupsBusy}
                onClick={loadMoreGroups}
              />
            </div>
            <div className="kg-field"><label>Tug‘ilgan sana</label><input type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} /></div>
            <div className="kg-field"><label>Jinsi</label><select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}><option value="unspecified">Ko‘rsatilmagan</option><option value="female">Qiz</option><option value="male">O‘g‘il</option></select></div>
          </div>
          <div className="kg-form-grid three">
            <div className="kg-field"><label>Ota-ona F.I.Sh.</label><input value={form.guardian_name} onChange={(e) => setForm({ ...form, guardian_name: e.target.value })} /></div>
            <div className="kg-field"><label>Aloqa telefoni</label><input value={form.guardian_phone} onChange={(e) => setForm({ ...form, guardian_phone: e.target.value })} /></div>
            <div className="kg-field"><label>Qarindoshligi</label><input value={form.guardian_relationship} onChange={(e) => setForm({ ...form, guardian_relationship: e.target.value })} /></div>
          </div>
          <div className="kg-field"><label>Allergiya (bo‘lsa)</label><input value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} /></div>
          <button type="button" className="kg-primary-button" onClick={create} disabled={busy || !form.full_name.trim()}>Saqlash</button>
        </div>
      )}
      {busy && children.length === 0 ? <LoadingBlock /> : (
        <div className="kg-table-wrap">
          <table className="kg-table">
            <thead><tr><th>F.I.Sh.</th><th>Guruh</th><th>Tug‘ilgan sana</th><th>Ota-ona</th><th>Telefon</th></tr></thead>
            <tbody>{children.map((child) => <tr key={child.id}><td><b>{child.full_name}</b>{child.allergies && <small className="kg-alert-small">Allergiya: {child.allergies}</small>}</td><td>{child.group_name || "—"}</td><td>{child.birth_date || "—"}</td><td>{child.guardian_name || "—"}</td><td>{child.guardian_phone || "—"}</td></tr>)}</tbody>
          </table>
          {!busy && children.length === 0 && <p className="kg-empty-text">Hali bola kiritilmagan.</p>}
        </div>
      )}
      <LoadMoreButton
        hasMore={hasMore}
        busy={busy}
        onClick={() => load(nextCursor)}
      />
    </section>
  );
}

function AttendancePanel({ token, apiBase, contextId }) {
  const {
    groups,
    groupsBusy,
    groupsError,
    groupsHasMore,
    loadMoreGroups,
  } = useGroupOptions({ token, apiBase, contextId });
  const [groupId, setGroupId] = useState("");
  const [dateValue, setDateValue] = useState(() => localDateValue());
  const [items, setItems] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const loadSequence = useRef(0);

  useEffect(() => {
    if (!groupId && groups.length) setGroupId(String(groups[0].id));
  }, [groupId, groups]);

  const load = async () => {
    if (!groupId) return;
    const sequence = ++loadSequence.current;
    try {
      const data = await kindergartenApi(`/attendance?${queryString({ token, context_id: contextId, group_id: groupId, attendance_date: dateValue })}`, { apiBase });
      if (sequence !== loadSequence.current) return;
      setItems(data.items || []);
      setError("");
    } catch (requestError) {
      if (sequence === loadSequence.current) {
        setError(requestError.message);
      }
    }
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, dateValue]);

  const mark = async (childId, status) => {
    setBusyId(childId);
    try {
      await kindergartenApi("/attendance", {
        apiBase,
        method: "POST",
        body: { token, context_id: contextId, group_id: Number(groupId), child_id: childId, attendance_date: dateValue, status },
      });
      setItems((current) => current.map((item) => item.child_id === childId ? { ...item, status } : item));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="kg-dashboard-card">
      <div className="kg-section-title"><div><span className="kg-eyebrow">DAVOMAT</span><h2>Kunlik kelish holati</h2></div></div>
      <ErrorNotice error={error || groupsError} />
      <div className="kg-filter-row">
        <select value={groupId} onChange={(e) => setGroupId(e.target.value)}><option value="">Guruhni tanlang</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select>
        <input type="date" value={dateValue} onChange={(e) => setDateValue(e.target.value)} />
      </div>
      <LoadMoreButton
        hasMore={groupsHasMore}
        busy={groupsBusy}
        onClick={loadMoreGroups}
      />
      <div className="kg-attendance-list">
        {items.map((item) => (
          <div key={item.child_id}>
            <span><b>{item.full_name}</b><small>{item.status ? `Holat: ${item.status}` : "Belgilanmagan"}</small></span>
            <div>{[["present", "Keldi"], ["late", "Kech"], ["absent", "Kelmadi"], ["sick", "Kasal"]].map(([status, label]) => <button type="button" key={status} disabled={busyId === item.child_id} className={item.status === status ? `active ${status}` : ""} onClick={() => mark(item.child_id, status)}>{label}</button>)}</div>
          </div>
        ))}
        {groupId && items.length === 0 && <p className="kg-empty-text">Bu guruhda faol bola yo‘q.</p>}
      </div>
    </section>
  );
}

function DailyReportsPanel({ token, apiBase, contextId }) {
  const {
    groups,
    groupsBusy,
    groupsError,
    groupsHasMore,
    loadMoreGroups,
  } = useGroupOptions({ token, apiBase, contextId });
  const [groupId, setGroupId] = useState("");
  const [dateValue, setDateValue] = useState(() => localDateValue());
  const [items, setItems] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [form, setForm] = useState({
    mood: "yaxshi",
    breakfast: "",
    lunch: "",
    snack: "",
    sleep_minutes: "",
    sleep_quality: "",
    activities: "",
    educator_note: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const loadSequence = useRef(0);

  useEffect(() => {
    if (!groupId && groups.length) setGroupId(String(groups[0].id));
  }, [groupId, groups]);

  const load = async () => {
    if (!groupId) return;
    const sequence = ++loadSequence.current;
    setBusy(true);
    setError("");
    try {
      const data = await kindergartenApi(
        `/daily-reports?${queryString({
          token,
          context_id: contextId,
          group_id: groupId,
          report_date: dateValue,
        })}`,
        { apiBase },
      );
      if (sequence !== loadSequence.current) return;
      setItems(data.items || []);
      setSelectedChild(null);
    } catch (requestError) {
      if (sequence === loadSequence.current) {
        setError(requestError.message);
      }
    } finally {
      if (sequence === loadSequence.current) setBusy(false);
    }
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, dateValue]);

  const openChild = (child) => {
    setSelectedChild(child);
    setSaved(false);
    setForm({
      mood: child.mood || "yaxshi",
      breakfast: child.meals?.breakfast || "",
      lunch: child.meals?.lunch || "",
      snack: child.meals?.snack || "",
      sleep_minutes: child.sleep?.minutes || "",
      sleep_quality: child.sleep?.quality || "",
      activities: child.activities || "",
      educator_note: child.educator_note || "",
    });
  };

  const save = async () => {
    if (!selectedChild) return;
    setBusy(true);
    setError("");
    try {
      await kindergartenApi("/daily-reports", {
        apiBase,
        method: "POST",
        body: {
          token,
          context_id: contextId,
          group_id: Number(groupId),
          child_id: selectedChild.child_id,
          report_date: dateValue,
          mood: form.mood,
          meals: {
            breakfast: form.breakfast,
            lunch: form.lunch,
            snack: form.snack,
          },
          sleep: {
            minutes: form.sleep_minutes ? Number(form.sleep_minutes) : null,
            quality: form.sleep_quality,
          },
          activities: form.activities,
          educator_note: form.educator_note,
        },
      });
      const updatedChild = {
        ...selectedChild,
        mood: form.mood,
        meals: {
          breakfast: form.breakfast,
          lunch: form.lunch,
          snack: form.snack,
        },
        sleep: {
          minutes: form.sleep_minutes ? Number(form.sleep_minutes) : null,
          quality: form.sleep_quality,
        },
        activities: form.activities,
        educator_note: form.educator_note,
      };
      setItems((current) =>
        current.map((child) =>
          child.child_id === updatedChild.child_id ? updatedChild : child
        ),
      );
      setSelectedChild(updatedChild);
      setSaved(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="kg-two-column kg-reports-layout">
      <section className="kg-dashboard-card">
        <div className="kg-section-title">
          <div>
            <span className="kg-eyebrow">KUNLIK HISOBOT</span>
            <h2>Bola holati va faoliyati</h2>
          </div>
        </div>
        <ErrorNotice error={error || groupsError} />
        <div className="kg-filter-row">
          <select value={groupId} onChange={(event) => setGroupId(event.target.value)}>
            <option value="">Guruhni tanlang</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
          <input type="date" value={dateValue} onChange={(event) => setDateValue(event.target.value)} />
        </div>
        <LoadMoreButton
          hasMore={groupsHasMore}
          busy={groupsBusy}
          onClick={loadMoreGroups}
        />
        {busy && items.length === 0 ? <LoadingBlock /> : (
          <div className="kg-report-child-list">
            {items.map((child) => (
              <button
                type="button"
                key={child.child_id}
                className={selectedChild?.child_id === child.child_id ? "active" : ""}
                onClick={() => openChild(child)}
              >
                <span className="kg-list-icon"><Baby size={17} /></span>
                <span>
                  <b>{child.full_name}</b>
                  <small>
                    {child.report_id
                      ? `${child.mood || "Holat kiritilgan"} · hisobot saqlangan`
                      : "Hisobot kiritilmagan"}
                  </small>
                </span>
                {child.report_id ? <BadgeCheck size={18} /> : <ChevronRight size={16} />}
              </button>
            ))}
            {!busy && groupId && items.length === 0 && (
              <p className="kg-empty-text">Bu guruhda faol bola yo‘q.</p>
            )}
          </div>
        )}
      </section>

      <section className="kg-dashboard-card">
        {!selectedChild ? (
          <div className="kg-report-placeholder">
            <ClipboardCheck size={29} />
            <h2>Bolani tanlang</h2>
            <p>Ovqatlanish, uyqu, kayfiyat va mashg‘ulotni bitta shaklda saqlaysiz.</p>
          </div>
        ) : (
          <>
            <span className="kg-eyebrow">HISOBOT</span>
            <h2>{selectedChild.full_name}</h2>
            {saved && <div className="kg-success"><Check size={16} /> Hisobot saqlandi</div>}
            <div className="kg-field">
              <label>Kayfiyati</label>
              <select value={form.mood} onChange={(event) => setForm({ ...form, mood: event.target.value })}>
                <option value="a'lo">A’lo</option>
                <option value="yaxshi">Yaxshi</option>
                <option value="tinch">Tinch</option>
                <option value="charchagan">Charchagan</option>
                <option value="bezovta">Bezovta</option>
              </select>
            </div>
            <div className="kg-form-grid three">
              <div className="kg-field"><label>Nonushta</label><input value={form.breakfast} onChange={(event) => setForm({ ...form, breakfast: event.target.value })} placeholder="Yaxshi / ozroq..." /></div>
              <div className="kg-field"><label>Tushlik</label><input value={form.lunch} onChange={(event) => setForm({ ...form, lunch: event.target.value })} /></div>
              <div className="kg-field"><label>Tamaddi</label><input value={form.snack} onChange={(event) => setForm({ ...form, snack: event.target.value })} /></div>
            </div>
            <div className="kg-form-grid two">
              <div className="kg-field"><label>Uyqu (daqiqa)</label><input type="number" min="0" value={form.sleep_minutes} onChange={(event) => setForm({ ...form, sleep_minutes: event.target.value })} /></div>
              <div className="kg-field"><label>Uyqu sifati</label><select value={form.sleep_quality} onChange={(event) => setForm({ ...form, sleep_quality: event.target.value })}><option value="">Tanlanmagan</option><option value="yaxshi">Yaxshi</option><option value="qisqa">Qisqa</option><option value="uxlamadi">Uxlamadi</option></select></div>
            </div>
            <div className="kg-field"><label>Bugungi faoliyat</label><textarea value={form.activities} onChange={(event) => setForm({ ...form, activities: event.target.value })} /></div>
            <div className="kg-field"><label>Tarbiyachi izohi</label><textarea value={form.educator_note} onChange={(event) => setForm({ ...form, educator_note: event.target.value })} /></div>
            <button type="button" className="kg-primary-button" onClick={save} disabled={busy}>
              {busy && <Loader2 size={15} className="animate-spin" />} Hisobotni saqlash
            </button>
          </>
        )}
      </section>
    </div>
  );
}

function CalendarPanel({ token, apiBase, contextId, canEdit }) {
  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setDate(today.getDate() + 30);
  const [dateFrom, setDateFrom] = useState(localDateValue(today));
  const [dateTo, setDateTo] = useState(localDateValue(nextMonth));
  const [events, setEvents] = useState([]);
  const {
    groups,
    groupsBusy,
    groupsError,
    groupsHasMore,
    loadMoreGroups,
  } = useGroupOptions({ token, apiBase, contextId, enabled: canEdit });
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ group_id: "", event_type: "activity", title: "", description: "", starts_at: `${localDateValue(today)}T09:00`, ends_at: `${localDateValue(today)}T10:00` });
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const loadSequence = useRef(0);

  const load = async (cursor = null, append = false) => {
    const sequence = ++loadSequence.current;
    setBusy(true);
    try {
      const eventData = await kindergartenApi(
        `/calendar?${queryString({
          token,
          context_id: contextId,
          date_from: dateFrom,
          date_to: dateTo,
          after_start: cursor?.starts_at,
          after_id: cursor?.id,
          limit: 100,
        })}`,
        { apiBase },
      );
      if (sequence !== loadSequence.current) return;
      setEvents((current) =>
        append
          ? mergeById(current, eventData.items || [])
          : eventData.items || [],
      );
      setNextCursor(eventData.next_cursor || null);
      setHasMore(Boolean(eventData.has_more));
      setError("");
    } catch (requestError) {
      if (sequence === loadSequence.current) {
        setError(requestError.message);
      }
    } finally {
      if (sequence === loadSequence.current) setBusy(false);
    }
  };
  useEffect(() => {
    load(null, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo, contextId]);

  const create = async () => {
    if (!window.confirm("Kalendar voqeasini e'lon qilasizmi?")) return;
    setBusy(true);
    try {
      await kindergartenApi("/calendar", {
        apiBase,
        method: "POST",
        body: { token, context_id: contextId, ...form, group_id: form.group_id ? Number(form.group_id) : null, starts_at: new Date(form.starts_at).toISOString(), ends_at: new Date(form.ends_at).toISOString(), status: "published", confirmation: true },
      });
      setFormOpen(false);
      setForm((current) => ({ ...current, title: "", description: "" }));
      await load(null, false);
    } catch (requestError) {
      setError(requestError.message);
      setBusy(false);
    }
  };

  return (
    <section className="kg-dashboard-card">
      <div className="kg-section-title"><div><span className="kg-eyebrow">KALENDAR</span><h2>Bog‘cha va guruh tadbirlari</h2></div>{canEdit && <button type="button" className="kg-small-primary" onClick={() => setFormOpen(!formOpen)}><Plus size={15} /> Voqea</button>}</div>
      <ErrorNotice error={error || groupsError} />
      <div className="kg-filter-row"><input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} /><span>—</span><input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} /></div>
      {formOpen && (
        <div className="kg-calendar-form">
          <div className="kg-form-grid three">
            <div className="kg-field"><label>Turi</label><select value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })}>{[["activity", "Mashg‘ulot"], ["holiday", "Bayram"], ["meeting", "Uchrashuv"], ["meal", "Ovqatlanish"], ["sleep", "Uyqu"], ["medical", "Tibbiy"], ["other", "Boshqa"]].map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div>
            <div className="kg-field">
              <label>Guruh</label>
              <select value={form.group_id} onChange={(e) => setForm({ ...form, group_id: e.target.value })}>
                <option value="">Butun bog‘cha</option>
                {groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
              </select>
              <LoadMoreButton
                hasMore={groupsHasMore}
                busy={groupsBusy}
                onClick={loadMoreGroups}
              />
            </div>
            <div className="kg-field"><label>Nomi</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          </div>
          <div className="kg-form-grid two"><div className="kg-field"><label>Boshlanish</label><input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} /></div><div className="kg-field"><label>Tugash</label><input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} /></div></div>
          <div className="kg-field"><label>Izoh</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <button type="button" className="kg-primary-button" onClick={create} disabled={busy || !form.title.trim()}>Tekshirdim — e’lon qilish</button>
        </div>
      )}
      {busy && events.length === 0 ? <LoadingBlock /> : (
        <div className="kg-timeline">
          {events.map((event) => (
            <article key={event.id}><time>{new Date(event.starts_at).toLocaleDateString("uz-UZ", { day: "2-digit", month: "short" })}<b>{new Date(event.starts_at).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}</b></time><i /><div><h3>{event.title}</h3><p>{event.group_name || "Butun bog‘cha"} · {event.event_type}</p>{event.description && <small>{event.description}</small>}</div></article>
          ))}
          {!busy && events.length === 0 && <p className="kg-empty-text">Bu davrda kalendar voqeasi yo‘q.</p>}
        </div>
      )}
      <LoadMoreButton
        hasMore={hasMore}
        busy={busy}
        onClick={() => load(nextCursor, true)}
      />
    </section>
  );
}

function PaymentsPanel({ token, apiBase, contextId, profile }) {
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const defaultDue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-05`;
  const [plans, setPlans] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [planForm, setPlanForm] = useState({
    name: "Standart oylik to'lov",
    amount: profile.monthly_fee || "",
    billing_day: 5,
  });
  const [generateForm, setGenerateForm] = useState({
    plan_id: "",
    period_month: monthStart,
    due_date: defaultDue,
  });
  const [payment, setPayment] = useState(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [billingSummary, setBillingSummary] = useState({
    paid_total: 0,
    outstanding_total: 0,
    invoice_count: 0,
  });

  useEffect(() => {
    if (!payment) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setPayment(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [payment]);

  const load = async (afterId = 0) => {
    setBusy(true);
    setError("");
    try {
      const [planData, invoiceData] = await Promise.all([
        kindergartenApi(
          `/billing/plans?${queryString({ token, context_id: contextId })}`,
          { apiBase },
        ),
        kindergartenApi(
          `/billing/invoices?${queryString({
            token,
            context_id: contextId,
            after_id: afterId,
            limit: 100,
          })}`,
          { apiBase },
        ),
      ]);
      const nextPlans = planData.items || [];
      setPlans(nextPlans);
      setInvoices((current) =>
        afterId
          ? mergeById(current, invoiceData.items || [])
          : invoiceData.items || [],
      );
      setNextCursor(invoiceData.next_cursor);
      setHasMore(Boolean(invoiceData.has_more));
      setBillingSummary(invoiceData.summary || {
        paid_total: 0,
        outstanding_total: 0,
        invoice_count: 0,
      });
      setGenerateForm((current) => ({
        ...current,
        plan_id: current.plan_id || (nextPlans[0]?.id ? String(nextPlans[0].id) : ""),
      }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextId]);

  const createPlan = async () => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await kindergartenApi("/billing/plans", {
        apiBase,
        method: "POST",
        body: {
          token,
          context_id: contextId,
          name: planForm.name,
          amount: Number(planForm.amount),
          billing_day: Number(planForm.billing_day),
        },
      });
      setNotice("To'lov rejasi yaratildi");
      await load(0);
    } catch (requestError) {
      setError(requestError.message);
      setBusy(false);
    }
  };

  const generateInvoices = async () => {
    if (!window.confirm("Tanlangan oy uchun barcha faol bolalarga hisob yaratasizmi?")) {
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await kindergartenApi("/billing/invoices/generate", {
        apiBase,
        method: "POST",
        body: {
          token,
          context_id: contextId,
          plan_id: Number(generateForm.plan_id),
          period_month: generateForm.period_month,
          due_date: generateForm.due_date,
          confirmation: true,
        },
      });
      setNotice(`${result.created_count} ta yangi hisob yaratildi`);
      await load(0);
    } catch (requestError) {
      setError(requestError.message);
      setBusy(false);
    }
  };

  const recordPayment = async () => {
    if (!payment || !window.confirm(`${payment.full_name} uchun to'lovni tasdiqlaysizmi?`)) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      await kindergartenApi(`/billing/invoices/${payment.id}/payments`, {
        apiBase,
        method: "POST",
        body: {
          token,
          amount: Number(payment.payment_amount),
          payment_method: payment.payment_method,
          reference: payment.reference,
          idempotency_key: payment.idempotency_key,
          confirmation: true,
        },
      });
      setPayment(null);
      setNotice("To'lov yozildi");
      await load(0);
    } catch (requestError) {
      setError(requestError.message);
      setBusy(false);
    }
  };

  const unpaidTotal = Number(billingSummary.outstanding_total || 0);
  const paidTotal = Number(billingSummary.paid_total || 0);

  return (
    <div>
      <ErrorNotice error={error} />
      {notice && <div className="kg-success"><Check size={17} /> {notice}</div>}
      <section className="kg-payment-metrics">
        <div><small>Rejalar</small><b>{plans.length}</b></div>
        <div><small>Kelgan to‘lov</small><b>{paidTotal.toLocaleString("uz-UZ")} so‘m</b></div>
        <div><small>Qoldiq</small><b>{unpaidTotal.toLocaleString("uz-UZ")} so‘m</b></div>
      </section>

      <div className="kg-two-column">
        <section className="kg-dashboard-card">
          <span className="kg-eyebrow">TO‘LOV REJASI</span>
          <h2>Standart summa va sana</h2>
          <div className="kg-field"><label>Reja nomi</label><input value={planForm.name} onChange={(event) => setPlanForm({ ...planForm, name: event.target.value })} /></div>
          <div className="kg-form-grid two">
            <div className="kg-field"><label>Summa (so‘m)</label><input type="number" min="1" value={planForm.amount} onChange={(event) => setPlanForm({ ...planForm, amount: event.target.value })} /></div>
            <div className="kg-field"><label>Har oyning kuni</label><input type="number" min="1" max="28" value={planForm.billing_day} onChange={(event) => setPlanForm({ ...planForm, billing_day: event.target.value })} /></div>
          </div>
          <button type="button" className="kg-primary-button" disabled={busy || !planForm.name.trim() || Number(planForm.amount) <= 0} onClick={createPlan}>
            {busy && <Loader2 size={15} className="animate-spin" />} Reja yaratish
          </button>
          {plans.length > 0 && (
            <div className="kg-plan-list">
              {plans.map((plan) => (
                <div key={plan.id}>
                  <span><b>{plan.name}</b><small>Har oyning {plan.billing_day}-kuni</small></span>
                  <strong>{Number(plan.amount).toLocaleString("uz-UZ")} so‘m</strong>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="kg-dashboard-card">
          <span className="kg-eyebrow">OYLIK HISOBLAR</span>
          <h2>Faol bolalarga hisob chiqarish</h2>
          <div className="kg-field">
            <label>To‘lov rejasi</label>
            <select value={generateForm.plan_id} onChange={(event) => setGenerateForm({ ...generateForm, plan_id: event.target.value })}>
              <option value="">Rejani tanlang</option>
              {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name} · {Number(plan.amount).toLocaleString("uz-UZ")}</option>)}
            </select>
          </div>
          <div className="kg-form-grid two">
            <div className="kg-field"><label>Hisob oyi</label><input type="date" value={generateForm.period_month} onChange={(event) => setGenerateForm({ ...generateForm, period_month: event.target.value })} /></div>
            <div className="kg-field"><label>To‘lash muddati</label><input type="date" value={generateForm.due_date} onChange={(event) => setGenerateForm({ ...generateForm, due_date: event.target.value })} /></div>
          </div>
          <button type="button" className="kg-primary-button" disabled={busy || !generateForm.plan_id} onClick={generateInvoices}>
            Hisoblarni ko‘rib, yaratish
          </button>
          <div className="kg-legal-note"><ShieldCheck size={17} /><span>Tizim mavjud oy hisobini takrorlamaydi. Yaratishdan oldin alohida tasdiq so‘raladi.</span></div>
        </section>
      </div>

      <section className="kg-dashboard-card">
        <div className="kg-section-title">
          <div><span className="kg-eyebrow">HISOBLAR</span><h2>Bola kesimidagi holat</h2></div>
          <span>{billingSummary.invoice_count || invoices.length} ta</span>
        </div>
        {busy && invoices.length === 0 ? <LoadingBlock /> : (
          <div className="kg-table-wrap">
            <table className="kg-table kg-invoice-table">
              <thead><tr><th>Bola</th><th>Oy</th><th>Hisob</th><th>To‘langan</th><th>Qoldiq</th><th>Holat</th><th /></tr></thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td><b>{invoice.full_name}</b><small>{invoice.plan_name}</small></td>
                    <td>{String(invoice.period_month).slice(0, 7)}</td>
                    <td>{Number(invoice.amount_due).toLocaleString("uz-UZ")}</td>
                    <td>{Number(invoice.amount_paid).toLocaleString("uz-UZ")}</td>
                    <td>{Number(invoice.remaining).toLocaleString("uz-UZ")}</td>
                    <td><StatusPill status={invoice.status} /></td>
                    <td>
                      {["unpaid", "partial"].includes(invoice.status) && (
                        <button
                          type="button"
                          className="kg-pay-button"
                          onClick={() => setPayment({
                            ...invoice,
                            payment_amount: String(invoice.remaining),
                            payment_method: "cash",
                            reference: "",
                            idempotency_key:
                              globalThis.crypto?.randomUUID?.() ||
                              `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                          })}
                        >
                          To‘lov
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!busy && invoices.length === 0 && <p className="kg-empty-text">Hali hisob yaratilmagan.</p>}
          </div>
        )}
        <LoadMoreButton
          hasMore={hasMore}
          busy={busy}
          onClick={() => load(nextCursor)}
        />
      </section>

      {payment && (
        <div className="kg-modal-backdrop" onClick={() => setPayment(null)}>
          <div className="kg-modal" role="dialog" aria-modal="true" aria-labelledby="kg-payment-title" onClick={(event) => event.stopPropagation()}>
            <button type="button" aria-label="To'lov oynasini yopish" className="kg-modal-close" onClick={() => setPayment(null)}><X size={16} /></button>
            <span className="kg-eyebrow">TO‘LOVNI YOZISH</span>
            <h2 id="kg-payment-title">{payment.full_name}</h2>
            <p>Qoldiq: {Number(payment.remaining).toLocaleString("uz-UZ")} so‘m</p>
            <div className="kg-field"><label>Kelgan summa</label><input type="number" min="1" max={payment.remaining} value={payment.payment_amount} onChange={(event) => setPayment({ ...payment, payment_amount: event.target.value })} /></div>
            <div className="kg-field"><label>Usuli</label><select value={payment.payment_method} onChange={(event) => setPayment({ ...payment, payment_method: event.target.value })}><option value="cash">Naqd</option><option value="card">Karta</option><option value="bank_transfer">Bank o‘tkazmasi</option><option value="online">Onlayn</option><option value="other">Boshqa</option></select></div>
            <div className="kg-field"><label>Chek / izoh raqami</label><input value={payment.reference} onChange={(event) => setPayment({ ...payment, reference: event.target.value })} /></div>
            <button type="button" className="kg-primary-button" onClick={recordPayment} disabled={busy || Number(payment.payment_amount) <= 0}>Tekshirdim — to‘lovni tasdiqlash</button>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsPanel({ token, apiBase, profile, onSaved, preferences, onPreferences }) {
  const [form, setForm] = useState({
    work_start: profile.work_start?.slice(0, 5) || "08:00",
    work_end: profile.work_end?.slice(0, 5) || "18:00",
    work_days: profile.work_days || [1, 2, 3, 4, 5],
    capacity: profile.capacity || "",
    language: profile.language || "uz",
    payment_enabled: profile.payment_enabled,
    monthly_fee: profile.monthly_fee || "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setBusy(true);
    setError("");
    try {
      const result = await kindergartenApi("/settings", {
        apiBase,
        method: "PUT",
        body: { token, context_id: profile.id, ...form, capacity: form.capacity ? Number(form.capacity) : null, monthly_fee: form.monthly_fee !== "" ? Number(form.monthly_fee) : null },
      });
      setSaved(true);
      onSaved(result.profile);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="kg-two-column">
      <section className="kg-dashboard-card">
        <span className="kg-eyebrow">BOG‘CHA SOZLAMALARI</span>
        <h2>Ish tartibi</h2>
        <ErrorNotice error={error} />
        {saved && <div className="kg-success"><Check size={17} /> Saqlandi</div>}
        <div className="kg-day-picker">{DAY_LABELS.map((day) => <button type="button" key={day.value} className={form.work_days.includes(day.value) ? "selected" : ""} onClick={() => setForm({ ...form, work_days: form.work_days.includes(day.value) ? form.work_days.filter((value) => value !== day.value) : [...form.work_days, day.value].sort() })}>{day.label}</button>)}</div>
        <div className="kg-form-grid two"><div className="kg-field"><label>Ochilish</label><input type="time" value={form.work_start} onChange={(e) => setForm({ ...form, work_start: e.target.value })} /></div><div className="kg-field"><label>Yopilish</label><input type="time" value={form.work_end} onChange={(e) => setForm({ ...form, work_end: e.target.value })} /></div></div>
        <div className="kg-field"><label>Umumiy sig‘im</label><input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} /></div>
        {profile.ownership_type === "private" && <><label className="kg-switch-row"><input type="checkbox" checked={form.payment_enabled} onChange={(e) => setForm({ ...form, payment_enabled: e.target.checked })} /> To‘lov nazoratini yoqish</label>{form.payment_enabled && <div className="kg-field"><label>Oylik summa</label><input type="number" value={form.monthly_fee} onChange={(e) => setForm({ ...form, monthly_fee: e.target.value })} /></div>}</>}
        <button type="button" className="kg-primary-button" onClick={save} disabled={busy}>{busy && <Loader2 size={15} className="animate-spin" />} Saqlash</button>
      </section>
      <section className="kg-dashboard-card">
        <span className="kg-eyebrow">AI AVATAR</span>
        <h2>Shaxsiy yordamchi</h2>
        <label className="kg-switch-row"><input type="checkbox" checked={preferences.enabled} onChange={(e) => onPreferences({ enabled: e.target.checked })} /> Yordamchini ko‘rsatish</label>
        <label className="kg-switch-row"><input type="checkbox" checked={preferences.speechEnabled} onChange={(e) => onPreferences({ speechEnabled: e.target.checked })} /> Ovoz chiqarib tushuntirish</label>
        <label className="kg-label">Ko‘rinishi</label>
        <div className="kg-segmented">{[["female", "Ziyo"], ["male", "Temur"], ["neutral", "Hamroh"]].map(([value, label]) => <button type="button" key={value} className={preferences.variant === value ? "selected" : ""} onClick={() => onPreferences({ variant: value })}>{label}</button>)}</div>
        <div className="kg-safety-note compact"><ShieldCheck size={19} /><div><b>Yordamchi ruxsatni oshirmaydi</b><p>U faqat siz ko‘ra oladigan menyularni tushuntiradi.</p></div></div>
      </section>
    </div>
  );
}
