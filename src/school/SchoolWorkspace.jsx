import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  BellRing,
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  DoorOpen,
  GraduationCap,
  LayoutDashboard,
  Layers3,
  Loader2,
  MapPin,
  Menu,
  Plus,
  RefreshCw,
  Save,
  School,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  TableProperties,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import GuidedAvatar from "../assistant/GuidedAvatar.jsx";
import { HUDUDLAR, VILOYATLAR } from "../hududlar.js";
import {
  pageQuery,
  schoolApi,
  schoolRoutes,
  unwrapItems,
} from "./api.js";
import {
  defaultBellSchedule,
  normalizeSectionLetters,
  ONBOARDING_STEPS,
  SCHOOL_ROLES,
  SCHOOL_TYPES,
  tourForSchoolRoles,
  visibleMenuForWorkspace,
} from "./workflow.js";
import "./school.css";

const MENU = {
  overview: { label: "Bosh sahifa", icon: LayoutDashboard },
  timetable: { label: "Aqlli dars jadvali", icon: TableProperties },
  calendar: { label: "Maktab kalendari", icon: CalendarDays },
  attendance: { label: "Davomat", icon: UserCheck },
  grades: { label: "Baholar", icon: ClipboardCheck },
  classes: { label: "Sinf va o'quvchilar", icon: GraduationCap },
  teachers: { label: "Xodimlar va bandlik", icon: Users },
  workloads: { label: "Fan va yuklama", icon: BookOpen },
  buildings: { label: "Bino va xonalar", icon: Building2 },
  payments: { label: "To'lovlar", icon: CircleDollarSign },
  settings: { label: "Sozlamalar", icon: Settings },
};

const WEEKDAYS = [
  { value: 1, label: "Dushanba", short: "Du" },
  { value: 2, label: "Seshanba", short: "Se" },
  { value: 3, label: "Chorshanba", short: "Ch" },
  { value: 4, label: "Payshanba", short: "Pa" },
  { value: 5, label: "Juma", short: "Ju" },
  { value: 6, label: "Shanba", short: "Sh" },
];

const TIMETABLE_SOURCE_LABELS = {
  recurring: "Haftalik",
  substitution: "O‘rinbosar",
  makeup_extra: "Qoplov darsi",
  published_makeup_event: "Qoplov darsi",
};

const TIMETABLE_EXCEPTION_LABELS = {
  substitution: "O‘rinbosar",
  cancellation: "Bekor qilingan dars",
  cancelled: "Bekor qilingan dars",
  makeup_extra: "Qoplov darsi",
};

const SCHOOL_MANAGER_ROLES = new Set([
  "owner",
  "founder",
  "director",
  "academic_deputy",
  "spiritual_deputy",
  "administrator",
  "system_admin",
]);
const SCHOOL_ACADEMIC_ROLES = new Set([
  ...SCHOOL_MANAGER_ROLES,
  "methodist",
]);

const SUBJECTS = [
  "Ona tili",
  "Adabiyot",
  "Matematika",
  "Algebra",
  "Geometriya",
  "Ingliz tili",
  "Rus tili",
  "Tarix",
  "Biologiya",
  "Geografiya",
  "Fizika",
  "Kimyo",
  "Informatika",
  "Jismoniy tarbiya",
  "Musiqa",
  "Tasviriy san'at",
  "Texnologiya",
  "Tarbiya",
];

const todayValue = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

function initialAcademicDate(academicYear) {
  const match = String(academicYear || "").match(/^(\d{4})-(\d{4})$/);
  if (!match) return todayValue();
  const today = todayValue();
  const approximateStart = `${match[1]}-09-02`;
  const approximateEnd = `${match[2]}-05-25`;
  if (today >= approximateStart && today <= approximateEnd) return today;
  // Yozgi tanaffusda endpointga kalendardan tashqari sana yubormaymiz.
  return `${match[2]}-01-15`;
}

function loadAvatarPreferences() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("samtm-school-avatar") || "{}",
    );
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

function mergeById(current, incoming) {
  const merged = new Map(current.map((item) => [item.id, item]));
  incoming.forEach((item) => merged.set(item.id, item));
  return [...merged.values()];
}

async function runInBatches(items, batchSize, worker) {
  for (let index = 0; index < items.length; index += batchSize) {
    await Promise.all(items.slice(index, index + batchSize).map(worker));
  }
}

async function fetchAllById(
  path,
  {
    apiBase,
    token,
    contextId,
    query,
    limit = 500,
    maxPages = 20,
  },
) {
  const items = [];
  let cursor = {};
  for (let page = 0; page < maxPages; page += 1) {
    const data = await schoolApi(path, {
      apiBase,
      token,
      contextId,
      query: { ...query, limit, ...cursor },
    });
    items.push(...(data?.items || data?.workspaces || []));
    if (!data?.next_cursor) {
      return { items, complete: true };
    }
    cursor =
      typeof data.next_cursor === "object"
        ? data.next_cursor
        : { after_id: data.next_cursor };
    if (!cursor.after_id) return { items, complete: false };
  }
  return { items, complete: false };
}

function stableFingerprint(value) {
  let hash = 0xcbf29ce484222325n;
  for (const character of String(value || "")) {
    hash ^= BigInt(character.codePointAt(0));
    hash = BigInt.asUintN(64, hash * 0x100000001b3n);
  }
  return hash.toString(36).padStart(13, "0");
}

function enrichTimetableSlots(slots, teachers, sections) {
  const teacherNames = new Map(
    (teachers || []).map((item) => [
      Number(item.user_id),
      item.full_name || item.name,
    ]),
  );
  const sectionNames = new Map(
    (sections || []).map((item) => [
      Number(item.id),
      item.name || `${item.grade_no}-${item.section_name}`,
    ]),
  );
  return (slots || []).map((slot) => ({
    ...slot,
    day_label:
      WEEKDAYS.find((day) => day.value === Number(slot.weekday))?.label ||
      `${slot.weekday}-kun`,
    period_label: `${slot.period_no}-soat`,
    class_name:
      slot.class_name ||
      (slot.grade_no && slot.section_name
        ? `${slot.grade_no}-${slot.section_name}`
        : null) ||
      sectionNames.get(Number(slot.section_id)),
    teacher_name:
      slot.teacher_name ||
      teacherNames.get(Number(slot.teacher_user_id)),
  }));
}

function timetableDraftReview(slots, expectedCount) {
  const expected = Number(expectedCount || slots?.length || 0);
  const incomplete = (slots || []).filter(
    (slot) =>
      !slot.section_id ||
      !slot.teacher_user_id ||
      !slot.subject_id ||
      !slot.subject_name ||
      !slot.shift_no ||
      !slot.starts_at ||
      !slot.ends_at ||
      !Number.isInteger(Number(slot.weekday)) ||
      !Number.isInteger(Number(slot.period_no)) ||
      !slot.class_name ||
      !slot.teacher_name,
  );
  return {
    expected,
    incomplete,
    complete:
      expected > 0 &&
      slots?.length === expected &&
      incomplete.length === 0,
  };
}

function schoolTypeLabel(value) {
  return SCHOOL_TYPES.find((item) => item.value === value)?.label || value;
}

function StatusPill({ status }) {
  const labels = {
    active: "Faol",
    draft: "Qoralama",
    pending: "Kutilmoqda",
    pending_verification: "Tekshiruvda",
    published: "E'lon qilingan",
    conflict: "To'qnashuv",
    disabled: "O'chirilgan",
  };
  return (
    <span className={`school-status ${status || "draft"}`}>
      {labels[status] || status || "Qoralama"}
    </span>
  );
}

function BackButton({ onClick, label = "Ortga" }) {
  return (
    <button type="button" className="school-back" onClick={onClick}>
      <ArrowLeft size={17} /> {label}
    </button>
  );
}

function ErrorNotice({ error, onRetry }) {
  if (!error) return null;
  return (
    <div className="school-notice error" role="alert">
      <AlertTriangle size={19} />
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

function InfoNotice({ children, tone = "info" }) {
  return (
    <div className={`school-notice ${tone}`}>
      <ShieldCheck size={19} />
      <div>{children}</div>
    </div>
  );
}

function LoadingBlock({ text = "Yuklanmoqda..." }) {
  return (
    <div className="school-loading">
      <Loader2 className="school-spin" size={25} />
      <span>{text}</span>
    </div>
  );
}

function EmptyState({ icon: Icon = Search, title, text }) {
  return (
    <div className="school-empty">
      <span>
        <Icon size={22} />
      </span>
      <b>{title}</b>
      <p>{text}</p>
    </div>
  );
}

function ConfirmDialog({ confirmation, onClose }) {
  const [busy, setBusy] = useState(false);
  if (!confirmation) return null;
  const confirm = async () => {
    setBusy(true);
    try {
      await confirmation.onConfirm();
      onClose();
    } catch {
      // Xato asosiy ekran tomonidan ko'rsatiladi.
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="school-modal-backdrop" role="presentation">
      <div
        className="school-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="school-confirm-title"
      >
        <span className="school-modal-icon">
          <ShieldCheck size={23} />
        </span>
        <h2 id="school-confirm-title">{confirmation.title}</h2>
        <p>{confirmation.detail}</p>
        <div className="school-modal-actions">
          <button type="button" className="school-secondary" onClick={onClose}>
            Bekor qilish
          </button>
          <button
            type="button"
            className="school-primary"
            disabled={busy}
            onClick={confirm}
          >
            {busy && <Loader2 size={15} className="school-spin" />}
            Ha, tasdiqlayman
          </button>
        </div>
      </div>
    </div>
  );
}

function AvatarPreferences({ preferences, onChange }) {
  return (
    <div className="school-avatar-choice">
      <label>
        Yo‘lko‘rsatuvchi yordamchi
        <select
          value={preferences.enabled ? "on" : "off"}
          onChange={(event) =>
            onChange({ enabled: event.target.value === "on" })
          }
        >
          <option value="on">Yoqilgan</option>
          <option value="off">O'chirilgan</option>
        </select>
      </label>
      <label>
        Ko'rinishi
        <select
          value={preferences.variant}
          onChange={(event) => onChange({ variant: event.target.value })}
        >
          <option value="female">Ziyo</option>
          <option value="male">Temur</option>
          <option value="neutral">Hamroh</option>
        </select>
      </label>
      <label className="school-check-row">
        <input
          type="checkbox"
          checked={preferences.speechEnabled}
          onChange={(event) =>
            onChange({ speechEnabled: event.target.checked })
          }
        />
        Ovozli tushuntirish
      </label>
    </div>
  );
}

export default function SchoolWorkspace({
  token,
  apiBase,
  initialWorkspace,
  onBack,
  onLegacy,
  assignedOnly = false,
  canCreateInstitution = true,
}) {
  const [screen, setScreen] = useState("home");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workspaces, setWorkspaces] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [preferences, setPreferences] = useState(loadAvatarPreferences);

  const updatePreferences = useCallback((patch) => {
    setPreferences((current) => {
      const next = { ...current, ...patch };
      localStorage.setItem("samtm-school-avatar", JSON.stringify(next));
      return next;
    });
  }, []);

  const loadWorkspaces = useCallback(
    async (preferredContextId) => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchAllById(schoolRoutes.workspaces, {
          apiBase,
          token,
          limit: 100,
          maxPages: 30,
        });
        const next = (data?.items || []).map((item) => ({
          ...item,
          context_id: item.context_id || item.id,
          status: item.onboarding_status || item.status,
          school_type:
            item.school_type ||
            (item.ownership_type === "private"
              ? "private_general"
              : "public_general"),
        }));
        setWorkspaces(next);
        setPendingRequests([]);
        if (!data.complete) {
          setError(
            "Maktablar ro‘yxatining xavfsiz yuklash chegarasiga yetildi. Qidiruvni aniqroq qiling.",
          );
        }
        const wantedId =
          preferredContextId ||
          initialWorkspace?.context_id ||
          initialWorkspace?.muassasa_id;
        const wanted = next.find(
          (item) =>
            Number(item.context_id) === Number(wantedId) ||
            Number(item.legacy_school_id) === Number(wantedId),
        );
        const verificationBlocksPublic =
          wanted?.ownership_type === "public" &&
          wanted?.verification_status === "pending";
        if (wanted?.status === "active" && !verificationBlocksPublic) {
          setSelected(wanted);
          setScreen("dashboard");
        }
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    },
    [apiBase, initialWorkspace, token],
  );

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  if (loading) {
    return (
      <main className="school-shell">
        <BackButton onClick={onBack} />
        <LoadingBlock text="Maktab ish maydoni yuklanmoqda..." />
      </main>
    );
  }

  if (screen === "create" && canCreateInstitution) {
    return (
      <SchoolOnboarding
        apiBase={apiBase}
        token={token}
        preferences={preferences}
        onPreferences={updatePreferences}
        onBack={() => setScreen("home")}
        onCreated={(contextId) => loadWorkspaces(contextId)}
      />
    );
  }

  if (screen === "join" && !assignedOnly) {
    return (
      <JoinSchool
        apiBase={apiBase}
        token={token}
        onLegacy={onLegacy}
        onBack={() => setScreen("home")}
        onRequested={() => {
          setScreen("home");
          loadWorkspaces();
        }}
      />
    );
  }

  if (screen === "dashboard" && selected) {
    return (
      <SchoolDashboard
        key={selected.context_id}
        apiBase={apiBase}
        token={token}
        workspace={selected}
        preferences={preferences}
        onPreferences={updatePreferences}
        onLegacy={onLegacy}
        onBack={() => {
          setSelected(null);
          setScreen("home");
          loadWorkspaces();
        }}
      />
    );
  }

  if (screen === "verification" && selected) {
    return (
      <AdminSchoolVerification
        apiBase={apiBase}
        token={token}
        workspace={selected}
        onBack={() => {
          setSelected(null);
          setScreen("home");
        }}
        onDecided={() => loadWorkspaces()}
      />
    );
  }

  return (
    <main className="school-shell">
      <BackButton onClick={onBack} label="Ish maydoniga qaytish" />
      <header className="school-hero">
        <span className="school-hero-icon">
          <School size={30} />
        </span>
        <div>
          <span className="school-eyebrow">MAKTAB BOSHQARUVI</span>
          <h1>Maktabni bosqichma-bosqich ishga tushiring</h1>
          <p>
            Davlat yoki xususiy, bir yoki ikki smenali maktab. Yo‘lko‘rsatuvchi
            yordamchi sozlamani tushuntiradi va ruxsat etilgan qoralama
            o‘zgarishini taklif qiladi, lekin muhim amalni bajarmaydi.
          </p>
        </div>
      </header>

      <ErrorNotice error={error} onRetry={() => loadWorkspaces()} />

      {(!assignedOnly || canCreateInstitution) && <div className="school-start-grid">
        {canCreateInstitution && <button type="button" onClick={() => setScreen("create")}>
          <span className="primary">
            <Plus size={21} />
          </span>
          <div>
            <b>Yangi maktab yaratish</b>
            <small>Bino, smena, sinf, xodim, kalendar va jadval poydevori</small>
          </div>
          <ChevronRight size={19} />
        </button>}
        {!assignedOnly && <button type="button" onClick={() => setScreen("join")}>
          <span>
            <Search size={21} />
          </span>
          <div>
            <b>Mavjud maktabga qo‘shilish</b>
            <small>Taklif kodi yoki maktab nomi orqali so‘rov yuborish</small>
          </div>
          <ChevronRight size={19} />
        </button>}
      </div>}

      {assignedOnly && workspaces.length === 0 && (
        <InfoNotice>
          <b>Maktab ish joyi ulanmagan</b>
          <p>Maktabni faqat Administrator markazi ochadi. Maktab rahbari sizga xodim taklifini yuborgach, shu yerda faqat o‘zingizga berilgan ish maydoni ochiladi.</p>
        </InfoNotice>
      )}

      {workspaces.length > 0 && (
        <section className="school-section">
          <div className="school-section-title">
            <div>
              <span className="school-eyebrow">MAKTABLARIM</span>
              <h2>Ulangan ish maydonlari</h2>
            </div>
            <span>{workspaces.length} ta</span>
          </div>
          <div className="school-workspace-grid">
            {workspaces.map((workspace) => {
              const active =
                workspace.status === "active" &&
                !(
                  workspace.ownership_type === "public" &&
                  workspace.verification_status === "pending"
                );
              return (
                <button
                  type="button"
                  key={workspace.context_id}
                  className={!active ? "pending" : ""}
                  onClick={() => {
                    if (!active) {
                      if (
                        (workspace.roles || []).includes("system_admin") &&
                        workspace.ownership_type === "public" &&
                        ["pending", "pending_verification"].includes(
                          workspace.verification_status,
                        )
                      ) {
                        setSelected(workspace);
                        setScreen("verification");
                        return;
                      }
                      setError("Bu maktabdagi rolingiz hali tasdiqlanmagan.");
                      return;
                    }
                    setSelected(workspace);
                    setScreen("dashboard");
                  }}
                >
                  <div className="school-workspace-top">
                    <span>
                      <Building2 size={22} />
                    </span>
                    <StatusPill status={active ? "active" : "pending"} />
                  </div>
                  <h3>{workspace.name}</h3>
                  <p>
                    {schoolTypeLabel(workspace.school_type)}
                    {workspace.shift_count
                      ? ` · ${workspace.shift_count} smena`
                      : ""}
                  </p>
                  <div className="school-role-tags">
                    {(workspace.roles || []).map((role) => (
                      <span key={role}>{SCHOOL_ROLES[role] || role}</span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {pendingRequests.length > 0 && (
        <section className="school-section">
          <div className="school-section-title">
            <h2>Javob kutilayotgan so‘rovlar</h2>
          </div>
          <div className="school-list">
            {pendingRequests.map((request) => (
              <div key={request.id}>
                <Clock3 size={18} />
                <span>
                  <b>{request.name}</b>
                  <small>{SCHOOL_ROLES[request.requested_role]}</small>
                </span>
                <StatusPill status="pending" />
              </div>
            ))}
          </div>
        </section>
      )}

      <InfoNotice>
        <b>Bitta hisobda bir nechta muassasa bo‘lishi mumkin</b>
        <p>
          O‘qituvchi maktab, markaz yoki institutda turli rol bilan ishlasa ham,
          har bir tashkilotning ma’lumoti va vakolati alohida saqlanadi.
        </p>
      </InfoNotice>
    </main>
  );
}

function AdminSchoolVerification({
  apiBase,
  token,
  workspace,
  onBack,
  onDecided,
}) {
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  const decide = (approve) => {
    setConfirmation({
      title: approve
        ? "Davlat maktabi tasdiqlansinmi?"
        : "Maktab arizasi rad etilsinmi?",
      detail: approve
        ? "Tasdiqdan keyin rahbariyat boshqaruv maydoniga kira oladi."
        : "Rad etilgach oddiy foydalanuvchilar bu maktabni boshqara olmaydi.",
      onConfirm: async () => {
        try {
          await schoolApi(
            schoolRoutes.verifyContext(workspace.context_id),
            {
              apiBase,
              token,
              method: "POST",
              body: { approve, confirmation: true, note: note.trim() || null },
            },
          );
          onDecided();
        } catch (requestError) {
          setError(requestError.message);
          throw requestError;
        }
      },
    });
  };

  return (
    <main className="school-shell">
      <BackButton onClick={onBack} />
      <div className="school-page-head">
        <span className="school-eyebrow">TIZIM ADMINISTRATORI</span>
        <h1>Davlat maktabini tekshirish</h1>
        <p>
          Ma’lumotni hujjatlar bilan solishtiring. Yo‘lko‘rsatuvchi bu qarorni
          qabul qilmaydi.
        </p>
      </div>
      <ErrorNotice error={error} />
      <section className="school-card">
        <div className="school-card-title">
          <div>
            <span className="school-eyebrow">ARIZA</span>
            <h2>{workspace.name}</h2>
          </div>
          <StatusPill status="pending_verification" />
        </div>
        <div className="school-summary-list">
          <div>
            <span>Turi</span>
            <b>{schoolTypeLabel(workspace.school_type)}</b>
          </div>
          <div>
            <span>Hudud</span>
            <b>{[workspace.region, workspace.district].filter(Boolean).join(", ")}</b>
          </div>
          <div>
            <span>Smena</span>
            <b>{workspace.shift_count || 1} ta</b>
          </div>
        </div>
        <label>
          Tekshiruv izohi
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Hujjat yoki qaror haqida qisqa izoh"
          />
        </label>
        <div className="school-verification-actions">
          <button
            type="button"
            className="school-secondary school-danger"
            onClick={() => decide(false)}
          >
            <X size={16} /> Rad etish
          </button>
          <button
            type="button"
            className="school-primary"
            onClick={() => decide(true)}
          >
            <BadgeCheck size={16} /> Tekshirdim, tasdiqlash
          </button>
        </div>
      </section>
      <ConfirmDialog
        confirmation={confirmation}
        onClose={() => setConfirmation(null)}
      />
    </main>
  );
}

function JoinSchool({ apiBase, token, onBack, onRequested, onLegacy }) {
  const [query, setQuery] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [requestedRole, setRequestedRole] = useState("teacher");

  const search = async () => {
    if (query.trim().length < 3) {
      setError("Maktab nomidan kamida 3 ta belgi yozing.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const data = await schoolApi(schoolRoutes.joinSearch, {
        apiBase,
        token,
        query: { q: query.trim(), limit: 20 },
      });
      setResults(data?.items || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const requestJoin = (payload, label) => {
    setConfirmation({
      title: "Qo‘shilish so‘rovini yuborilsinmi?",
      detail: `${label} maktabiga so‘rov yuboriladi. Rolni maktab rahbari tasdiqlaydi.`,
      onConfirm: async () => {
        try {
          const data = await schoolApi(schoolRoutes.joinRequest, {
            apiBase,
            token,
            method: "POST",
            body: { ...payload, requested_role: requestedRole },
          });
          setSuccess(
            data?.status === "active"
              ? "Taklif kodi qabul qilindi. Endi maktab ish maydoniga kirishingiz mumkin."
              : "So‘rov yuborildi. Maktab rahbari rolingizni tasdiqlashi kutilmoqda.",
          );
        } catch (requestError) {
          setError(requestError.message);
          throw requestError;
        }
      },
    });
  };

  return (
    <main className="school-shell">
      <BackButton onClick={onBack} />
      <div className="school-page-head">
        <span className="school-eyebrow">MAKTABGA QO‘SHILISH</span>
        <h1>Taklif kodi yoki maktab nomi</h1>
        <p>So‘rov yuborilgach, vakolatli rahbar sizning rolingizni tasdiqlaydi.</p>
      </div>
      <ErrorNotice error={error} />
      {success && (
        <div className="school-notice">
          <CheckCircle2 size={19} />
          <div>
            <b>So‘rov muvaffaqiyatli</b>
            <p>{success}</p>
          </div>
          <button type="button" onClick={onRequested}>
            Maktablarimga qaytish
          </button>
        </div>
      )}
      <div className="school-two-columns">
        <section className="school-card school-join-role">
          <h2>Qo‘shiladigan lavozim</h2>
          <label>
            Rol
            <select
              value={requestedRole}
              onChange={(event) => setRequestedRole(event.target.value)}
            >
              {[
                "teacher",
                "homeroom_teacher",
                "methodist",
                "psychologist",
                "social_pedagogue",
                "nurse",
                "accountant",
                "librarian",
                "security",
              ].map((role) => (
                <option key={role} value={role}>
                  {SCHOOL_ROLES[role] || role}
                </option>
              ))}
            </select>
          </label>
        </section>
        <section className="school-card">
          <h2>Taklif kodi</h2>
          <label>
            Xodim kodi
            <input
              value={inviteCode}
              maxLength={24}
              autoComplete="off"
              onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
              placeholder="Masalan: SCH-AB12-CD34"
            />
          </label>
          <button
            type="button"
            className="school-primary"
            disabled={inviteCode.trim().length < 6}
            onClick={() =>
              requestJoin({ invite_code: inviteCode.trim() }, "Taklifdagi")
            }
          >
            <UserPlus size={16} /> Kod bilan qo‘shilish
          </button>
        </section>
        <section className="school-card">
          <h2>Nom bo‘yicha qidirish</h2>
          <div className="school-search-row">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && search()}
              placeholder="Maktab nomi yoki raqami"
            />
            <button
              type="button"
              className="school-secondary"
              disabled={busy}
              onClick={search}
            >
              {busy ? <Loader2 size={16} className="school-spin" /> : <Search size={16} />}
              Qidirish
            </button>
          </div>
          <div className="school-search-results">
            {results.map((item) => (
              <button
                type="button"
                key={item.context_id}
                onClick={() =>
                  requestJoin({ context_id: item.context_id }, item.name)
                }
              >
                <span>
                  <b>{item.name}</b>
                  <small>
                    {[item.region, item.district].filter(Boolean).join(", ")}
                  </small>
                </span>
                <ChevronRight size={17} />
              </button>
            ))}
          </div>
        </section>
      </div>
      <ConfirmDialog
        confirmation={confirmation}
        onClose={() => setConfirmation(null)}
      />
    </main>
  );
}

function SchoolOnboarding({
  apiBase,
  token,
  preferences,
  onPreferences,
  onBack,
  onCreated,
}) {
  const [step, setStep] = useState("identity");
  const [draft, setDraft] = useState(null);
  const [assistantSession, setAssistantSession] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [relationship, setRelationship] = useState("director");
  const [identity, setIdentity] = useState({
    name: "",
    ownership_type: "public",
    school_type: "public_general",
    region: "",
    district: "",
    address: "",
    phone: "",
    language: "uz",
  });
  const [schedule, setSchedule] = useState(() =>
    defaultBellSchedule({ ownershipType: "public", shifts: 2 }),
  );
  const [shiftCount, setShiftCount] = useState(2);
  const [buildings, setBuildings] = useState([
    {
      local_id: 1,
      name: "Asosiy bino",
      floors: 2,
      entrance_side: "center",
      rooms_per_floor: 8,
      room_prefix: "",
    },
  ]);
  const [classes, setClasses] = useState({
    grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    section_letters: "A, B",
    default_shift: 1,
    capacity: 30,
    grade_shifts: {
      1: 1, 2: 1, 3: 1, 4: 1,
      5: 2, 6: 2, 7: 2, 8: 2, 9: 2, 10: 2, 11: 2,
    },
  });
  const [staffPlan, setStaffPlan] = useState({
    create_invites_after_opening: true,
    teacher_method_day_enabled: true,
    max_lessons_per_teacher: 6,
    absolute_max_lessons: 7,
  });
  const [workload, setWorkload] = useState({
    use_standard_subjects: true,
    subjects: SUBJECTS,
    avoid_math_last_periods: true,
    prefer_physical_first_three: true,
    avoid_single_gap: true,
  });
  const currentYear = new Date().getFullYear();
  const [calendar, setCalendar] = useState({
    academic_year: `${currentYear}-${currentYear + 1}`,
    starts_on: `${currentYear}-09-02`,
    ends_on: `${currentYear + 1}-05-25`,
    work_days: [1, 2, 3, 4, 5, 6],
    use_uzbekistan_holidays: true,
    reschedule_cancelled_lessons: true,
  });

  const stepIndex = ONBOARDING_STEPS.findIndex((item) => item.key === step);

  const updateIdentity = (patch) => {
    setIdentity((current) => ({ ...current, ...patch }));
  };

  const selectSchoolType = (schoolType) => {
    if (draft) {
      setError(
        "Maktab turi qoralama yaratilgach o‘zgarmaydi. Boshqa tur uchun yangi qoralama boshlang.",
      );
      return;
    }
    const type = SCHOOL_TYPES.find((item) => item.value === schoolType);
    const ownershipType = type?.ownership || "public";
    updateIdentity({
      school_type: schoolType,
      ownership_type: ownershipType,
    });
    if (
      ownershipType === "public" &&
      ["owner", "founder"].includes(relationship)
    ) {
      setRelationship("director");
    }
    setSchedule((current) => ({
      ...defaultBellSchedule({
        ownershipType,
        shifts: shiftCount,
      }),
      shifts: current.shifts.slice(0, shiftCount),
    }));
  };

  const selectRelationship = (nextRelationship) => {
    if (draft) {
      setError(
        "Maktabdagi boshlang‘ich rolingiz qoralama yaratilgach o‘zgarmaydi. Boshqa rol uchun yangi qoralama boshlang.",
      );
      return;
    }
    setRelationship(nextRelationship);
  };

  const changeShiftCount = (count) => {
    setShiftCount(count);
    if (count === 1) {
      setClasses((current) => ({
        ...current,
        grade_shifts: Object.fromEntries(
          current.grades.map((grade) => [grade, 1]),
        ),
      }));
    }
    setSchedule((current) => ({
      ...current,
      shifts:
        count === 1
          ? [{ ...(current.shifts[0] || {}), number: 1, starts_at: current.shifts[0]?.starts_at || "08:00", max_lessons: current.shifts[0]?.max_lessons || 7 }]
          : [
              { ...(current.shifts[0] || {}), number: 1, starts_at: current.shifts[0]?.starts_at || "08:00", max_lessons: Math.min(current.shifts[0]?.max_lessons || 6, 6) },
              { ...(current.shifts[1] || {}), number: 2, starts_at: current.shifts[1]?.starts_at || "13:10", max_lessons: Math.min(current.shifts[1]?.max_lessons || 6, 6) },
            ],
    }));
  };

  const basicPayload = () => ({
    name: identity.name.trim(),
    region: identity.region,
    district: identity.district,
    address: identity.address,
    school_type: identity.school_type,
    shift_count: shiftCount,
    lesson_minutes: Number(schedule.lesson_minutes),
    work_days: calendar.work_days,
    billing_enabled: identity.ownership_type === "private",
    academic_year: calendar.academic_year,
    first_shift_start: schedule.shifts[0]?.starts_at || "08:00",
    second_shift_start: schedule.shifts[1]?.starts_at || "13:10",
    short_break_minutes: Number(schedule.short_break_minutes),
    long_break_after: Number(schedule.long_break_after_lesson),
    long_break_minutes: Number(schedule.long_break_minutes),
    max_periods_by_shift: Object.fromEntries(
      schedule.shifts.map((shift) => [
        String(shift.number),
        Number(shift.max_lessons),
      ]),
    ),
  });

  const payloadForStep = (key) => {
    if (key === "identity") return { basic: basicPayload() };
    if (key === "shifts") {
      return { basic: basicPayload(), bell_schedule: schedule };
    }
    if (key === "buildings") {
      return {
        buildings: buildings.map(({ local_id: _localId, ...item }) => item),
      };
    }
    if (key === "classes") {
      return {
        classes: {
          ...classes,
          section_letters: normalizeSectionLetters(classes.section_letters),
        },
      };
    }
    if (key === "staff") return { staff_plan: staffPlan };
    if (key === "workload") return { workload };
    if (key === "calendar")
      return { basic: basicPayload(), calendar };
    if (key === "review") {
      return {
        basic: basicPayload(),
        bell_schedule: schedule,
        buildings: buildings.map(({ local_id: _localId, ...item }) => item),
        classes: {
          ...classes,
          section_letters: normalizeSectionLetters(classes.section_letters),
        },
        staff_plan: staffPlan,
        workload,
        calendar,
      };
    }
    return { basic: basicPayload() };
  };

  const validateStep = (key) => {
    if (key === "identity") {
      if (identity.name.trim().length < 3)
        throw new Error("Maktab nomini to‘liq kiriting.");
      if (!identity.region || !identity.district)
        throw new Error("Viloyat va tumanni tanlang.");
    }
    if (key === "shifts") {
      if (!schedule.shifts.every((item) => item.starts_at))
        throw new Error("Har bir smena boshlanish vaqtini kiriting.");
      if (
        schedule.shifts.some(
          (item) =>
            Number(item.max_lessons) < 1 ||
            Number(item.max_lessons) >
              (identity.ownership_type === "public" ? 7 : 12),
        )
      ) {
        throw new Error(
          `Smenadagi darslar soni 1–${
            identity.ownership_type === "public" ? 7 : 12
          } oralig‘ida bo‘lsin.`,
        );
      }
      if (
        identity.ownership_type === "private" &&
        (Number(schedule.lesson_minutes) < 20 ||
          Number(schedule.lesson_minutes) > 90)
      ) {
        throw new Error("Dars davomiyligi 20–90 daqiqa oralig‘ida bo‘lsin.");
      }
    }
    if (key === "buildings") {
      if (!buildings.length) throw new Error("Kamida bitta bino kiriting.");
      if (
        buildings.some(
          (item) =>
            !item.name.trim() ||
            Number(item.floors) < 1 ||
            Number(item.rooms_per_floor) < 1,
        )
      ) {
        throw new Error("Bino nomi, qavati va xonalar sonini tekshiring.");
      }
    }
    if (key === "classes") {
      if (!classes.grades.length) throw new Error("Kamida bitta sinfni tanlang.");
      if (!normalizeSectionLetters(classes.section_letters).length)
        throw new Error("Kamida bitta parallel harfini kiriting.");
    }
    if (key === "calendar" && calendar.starts_on >= calendar.ends_on) {
      throw new Error("O‘quv yilining tugash sanasi boshlanishdan keyin bo‘lsin.");
    }
  };

  const createDraft = async () => {
    const data = await schoolApi(schoolRoutes.onboardingDrafts, {
      apiBase,
      token,
      method: "POST",
      body: {
        relationship,
        ownership_type: identity.ownership_type,
        setup_mode: "assistant",
      },
    });
    const nextDraft = data?.draft || data;
    setDraft(nextDraft);
    try {
      const assistant = await schoolApi(schoolRoutes.assistantSessions, {
        apiBase,
        token,
        method: "POST",
        body: {
          workflow_key: "school_onboarding",
          draft_id: nextDraft.id,
          avatar_enabled: preferences.enabled,
          speech_enabled: preferences.speechEnabled,
          avatar_variant: preferences.variant,
        },
      });
      setAssistantSession(assistant?.session || assistant);
    } catch {
      // Avatar audit xatosi onboardingni to'xtatmaydi.
    }
    return nextDraft;
  };

  const saveStep = async (currentDraft, key) => {
    const data = await schoolApi(schoolRoutes.onboardingDraft(currentDraft.id), {
      apiBase,
      token,
      method: "PATCH",
      body: {
        step: key,
        payload: payloadForStep(key),
        expected_version: currentDraft.version,
      },
    });
    const updated = data?.draft || data;
    setDraft((existing) => ({ ...existing, ...updated }));
    return updated;
  };

  const logAvatarAction = useCallback(
    async (actionId, target) => {
      if (!assistantSession?.id) return;
      try {
        await schoolApi(schoolRoutes.assistantActions(assistantSession.id), {
          apiBase,
          token,
          method: "POST",
          body: {
            action_id: actionId,
            ui_anchor: target?.anchor,
            payload: target?.key ? { target_step: target.key } : {},
          },
        });
      } catch {
        // Audit ixtiyoriy, formaning asosiy ishiga ta'sir qilmaydi.
      }
    },
    [apiBase, assistantSession?.id, token],
  );

  const goNext = async () => {
    setBusy(true);
    setError("");
    try {
      validateStep(step);
      let currentDraft = draft;
      if (!currentDraft) currentDraft = await createDraft();
      currentDraft = await saveStep(currentDraft, step);
      const next =
        ONBOARDING_STEPS[
          Math.min(stepIndex + 1, ONBOARDING_STEPS.length - 1)
        ];
      setStep(next.key);
      await logAvatarAction("NEXT_STEP", next);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const commit = () => {
    if (!confirmed) {
      setError("Avval yakuniy ma’lumotni tekshirganingizni belgilang.");
      return;
    }
    setConfirmation({
      title: "Maktab ish maydoni yaratilsinmi?",
      detail:
        "Bu amal bino, sinf, smena va kalendar poydevorini yaratadi. Keyingi xodim takliflari alohida tasdiqlanadi.",
      onConfirm: async () => {
        setError("");
        try {
          const currentDraft = await saveStep(draft, "review");
          const data = await schoolApi(
            schoolRoutes.onboardingCommit(currentDraft.id),
            {
              apiBase,
              token,
              method: "POST",
              body: {
                expected_version: currentDraft.version,
                confirmation: true,
              },
              idempotencyKey: `school-create-${currentDraft.id}-${currentDraft.version}`,
            },
          );
          onCreated(data?.context_id || data?.workspace?.context_id);
        } catch (requestError) {
          setError(requestError.message);
          throw requestError;
        }
      },
    });
  };

  const navigateFromAvatar = (targetKey) => {
    const targetIndex = ONBOARDING_STEPS.findIndex(
      (item) => item.key === targetKey,
    );
    // Avatar faqat o'tilgan qadamga qaytadi; keyingi qadamni tasdiqsiz o'tkazmaydi.
    if (targetIndex <= stepIndex) setStep(targetKey);
  };

  const answerOnboardingQuestion = (rawQuestion) => {
    const question = rawQuestion.toLocaleLowerCase("uz");
    const guard = {
      expectedDraftVersion: draft?.version || 0,
      expectedStep: step,
    };
    if (/\b(ikki|2)\s*[- ]?smena\b/.test(question)) {
      return {
        message:
          "Ikki smena tanlansa, har bir sinfning smenasi alohida belgilanadi va jadval smenalar ustma-ust tushmasligini tekshiradi.",
        actionLabel: "2 smenani qoralamaga qo‘llash",
        action: { type: "SET_SHIFT_COUNT", value: 2, ...guard },
      };
    }
    if (/\b(bir|1)\s*[- ]?smena\b/.test(question)) {
      return {
        message:
          "Bir smenada barcha tanlangan sinflar 1-smenaga o‘tadi. Bu faqat qoralamani o‘zgartiradi.",
        actionLabel: "1 smenani qoralamaga qo‘llash",
        action: { type: "SET_SHIFT_COUNT", value: 1, ...guard },
      };
    }
    if (question.includes("xususiy")) {
      if (draft) {
        return {
          message:
            "Maktab turi qoralama yaratilgach o‘zgarmaydi. Davlat yoki xususiy turini almashtirish uchun bu qoralamadan chiqib, yangi maktab qoralamasini boshlang.",
        };
      }
      return {
        message:
          "Xususiy maktabda qo‘ng‘iroq va to‘lov sozlamalari moslashtiriladi. Maktab turi o‘zgarishini siz ko‘rib, keyin saqlaysiz.",
        actionLabel: "Xususiy maktabni tanlash",
        action: {
          type: "SET_SCHOOL_TYPE",
          value: "private_general",
          ...guard,
        },
      };
    }
    if (question.includes("davlat")) {
      if (draft) {
        return {
          message:
            "Maktab turi qoralama yaratilgach o‘zgarmaydi. Davlat yoki xususiy turini almashtirish uchun bu qoralamadan chiqib, yangi maktab qoralamasini boshlang.",
        };
      }
      return {
        message:
          "Oddiy davlat maktabida 45 daqiqalik standart tartib qo‘llanadi va maktab tizim administratori tekshiruvidan o‘tadi.",
        actionLabel: "Davlat maktabini tanlash",
        action: {
          type: "SET_SCHOOL_TYPE",
          value: "public_general",
          ...guard,
        },
      };
    }
    const lessonMatch = question.match(/\b(\d{1,2})\s*(?:ta\s*)?dars\b/);
    if (step === "shifts" && lessonMatch) {
      const requested = Number(lessonMatch[1]);
      const maximum = identity.ownership_type === "public" ? 7 : 12;
      if (requested < 1 || requested > maximum) {
        return {
          message: `Bu maktab turi uchun smenadagi dars soni 1–${maximum} oralig‘ida bo‘lishi kerak.`,
        };
      }
      const shiftNumber = question.includes("2-smena") ? 2 : 1;
      return {
        message: `${shiftNumber}-smenadagi eng ko‘p dars ${requested} qilib taklif qilindi. Smena vaqti ustma-ust tushsa server saqlashni rad etadi.`,
        actionLabel: `${requested} ta darsni qoralamaga qo‘llash`,
        action: {
          type: "SET_SHIFT_MAX",
          shiftNumber,
          value: requested,
          ...guard,
        },
      };
    }
    if (step === "calendar" && question.includes("shanba")) {
      const currentlyEnabled = calendar.work_days.includes(6);
      return {
        message: currentlyEnabled
          ? "Shanba hozir ish kuni. Uni olib tashlash qoralamasini taklif qilaman."
          : "Shanbani ish kuni sifatida qo‘shish qoralamasini taklif qilaman.",
        actionLabel: currentlyEnabled
          ? "Shanbani olib tashlash"
          : "Shanbani qo‘shish",
        action: {
          type: "SET_WORKDAY",
          weekday: 6,
          enabled: !currentlyEnabled,
          ...guard,
        },
      };
    }
    const currentHelp =
      ONBOARDING_STEPS.find((item) => item.key === step)?.message;
    return {
      message: `${currentHelp || "Shu qadamdagi maydonlarni tushuntirib beraman."} Men saqlash yoki maktabni yaratish tugmasini sizning o‘rningizga bosmayman.`,
    };
  };

  const applyOnboardingSuggestion = (action) => {
    if (
      action.expectedStep !== step ||
      Number(action.expectedDraftVersion || 0) !== Number(draft?.version || 0)
    ) {
      setError(
        "Qoralama savol berilgandan keyin o‘zgargan. Taklifni qayta so‘rang.",
      );
      return;
    }
    switch (action.type) {
      case "SET_SHIFT_COUNT":
        if ([1, 2].includes(Number(action.value))) {
          changeShiftCount(Number(action.value));
        }
        break;
      case "SET_SCHOOL_TYPE":
        if (draft) {
          setError(
            "Maktab turi qoralama yaratilgach o‘zgarmaydi. Yangi tur uchun yangi qoralama boshlang.",
          );
          break;
        }
        if (
          ["public_general", "private_general"].includes(action.value)
        ) {
          selectSchoolType(action.value);
        }
        break;
      case "SET_SHIFT_MAX":
        setSchedule((current) => ({
          ...current,
          shifts: current.shifts.map((shift) =>
            Number(shift.number) === Number(action.shiftNumber)
              ? { ...shift, max_lessons: Number(action.value) }
              : shift,
          ),
        }));
        break;
      case "SET_WORKDAY":
        if (WEEKDAYS.some((day) => day.value === Number(action.weekday))) {
          setCalendar((current) => ({
            ...current,
            work_days: action.enabled
              ? [...new Set([...current.work_days, Number(action.weekday)])].sort()
              : current.work_days.filter(
                  (day) => day !== Number(action.weekday),
                ),
          }));
        }
        break;
      default:
        setError("Yordamchi taklifi ruxsat etilgan maydonlar ro‘yxatida yo‘q.");
    }
  };

  return (
    <main className="school-shell school-onboarding">
      <BackButton onClick={onBack} label="Maktablar ro‘yxatiga qaytish" />
      <div className="school-page-head">
        <span className="school-eyebrow">YANGI MAKTAB</span>
        <h1>Raqamli maktab poydevori</h1>
        <p>
          Har qadam jadval, kalendar va rollar tizimiga bog‘lanadi. Keyin ham
          sozlamalarni o‘zgartirish mumkin.
        </p>
      </div>

      <div className="school-stepper" aria-label="Maktab yaratish bosqichlari">
        {ONBOARDING_STEPS.map((item, index) => (
          <button
            type="button"
            key={item.key}
            className={
              item.key === step
                ? "active"
                : index < stepIndex
                  ? "complete"
                  : ""
            }
            disabled={index > stepIndex}
            onClick={() => index <= stepIndex && setStep(item.key)}
          >
            <span>{index < stepIndex ? <Check size={14} /> : index + 1}</span>
            {item.label}
          </button>
        ))}
      </div>

      <ErrorNotice error={error} />

      <section className="school-wizard-card">
        {step === "identity" && (
          <IdentityStep
            identity={identity}
            onChange={updateIdentity}
            onSchoolType={selectSchoolType}
            relationship={relationship}
            onRelationship={selectRelationship}
            authorityLocked={Boolean(draft)}
          />
        )}
        {step === "shifts" && (
          <ShiftStep
            identity={identity}
            shiftCount={shiftCount}
            schedule={schedule}
            onShiftCount={changeShiftCount}
            onSchedule={setSchedule}
          />
        )}
        {step === "buildings" && (
          <BuildingsStep buildings={buildings} onChange={setBuildings} />
        )}
        {step === "classes" && (
          <ClassesStep
            classes={classes}
            shiftCount={shiftCount}
            onChange={setClasses}
          />
        )}
        {step === "staff" && (
          <StaffStep plan={staffPlan} onChange={setStaffPlan} />
        )}
        {step === "workload" && (
          <WorkloadStep workload={workload} onChange={setWorkload} />
        )}
        {step === "calendar" && (
          <CalendarStep calendar={calendar} onChange={setCalendar} />
        )}
        {step === "review" && (
          <ReviewStep
            identity={identity}
            shiftCount={shiftCount}
            schedule={schedule}
            buildings={buildings}
            classes={classes}
            staffPlan={staffPlan}
            workload={workload}
            calendar={calendar}
            preferences={preferences}
            onPreferences={onPreferences}
            confirmed={confirmed}
            onConfirmed={setConfirmed}
          />
        )}

        <div className="school-wizard-actions">
          <button
            type="button"
            className="school-secondary"
            disabled={stepIndex === 0 || busy}
            onClick={() => setStep(ONBOARDING_STEPS[stepIndex - 1].key)}
          >
            <ArrowLeft size={16} /> Oldingi
          </button>
          {step === "review" ? (
            <button
              type="button"
              className="school-primary"
              disabled={busy || !confirmed}
              onClick={commit}
            >
              <BadgeCheck size={17} /> Tekshirdim, maktabni yaratish
            </button>
          ) : (
            <button
              type="button"
              className="school-primary"
              disabled={busy}
              onClick={goNext}
            >
              {busy && <Loader2 size={16} className="school-spin" />}
              Saqlash va davom etish <ChevronRight size={16} />
            </button>
          )}
        </div>
      </section>

      <GuidedAvatar
        apiBase={apiBase}
        enabled={preferences.enabled}
        speechEnabled={preferences.speechEnabled}
        variant={preferences.variant}
        steps={ONBOARDING_STEPS}
        activeKey={step}
        onNavigate={navigateFromAvatar}
        onAction={logAvatarAction}
        onQuestion={answerOnboardingQuestion}
        onApplySuggestion={applyOnboardingSuggestion}
        onSpeechChange={(speechEnabled) => onPreferences({ speechEnabled })}
        onEnabledChange={(enabled) => onPreferences({ enabled })}
      />
      <ConfirmDialog
        confirmation={confirmation}
        onClose={() => setConfirmation(null)}
      />
    </main>
  );
}

function IdentityStep({
  identity,
  onChange,
  onSchoolType,
  relationship,
  onRelationship,
  authorityLocked = false,
}) {
  const relationships =
    identity.ownership_type === "private"
      ? ["owner", "founder", "director", "administrator"]
      : ["director", "administrator"];
  return (
    <div data-ai-anchor="school-name">
      <div className="school-card-head">
        <span>
          <School size={22} />
        </span>
        <div>
          <h2>Maktab turi va asosiy ma’lumot</h2>
          <p>Avval tashkilot turini tanlang, so‘ng aniq nom va hududni yozing.</p>
        </div>
      </div>
      <div className="school-choice-grid">
        {SCHOOL_TYPES.map((item) => (
          <button
            type="button"
            key={item.value}
            className={identity.school_type === item.value ? "selected" : ""}
            disabled={authorityLocked}
            onClick={() => onSchoolType(item.value)}
          >
            <span>
              {item.ownership === "public" ? (
                <Building2 size={20} />
              ) : (
                <Sparkles size={20} />
              )}
            </span>
            <b>{item.label}</b>
            <small>{item.hint}</small>
            {identity.school_type === item.value && <CheckCircle2 size={18} />}
          </button>
        ))}
      </div>
      {authorityLocked && (
        <InfoNotice tone="warning">
          <b>Maktab turi va boshlang‘ich rol qulflangan</b>
          <p>
            Bu ikki qiymat qoralamaning vakolatiga bog‘langan. Boshqa tur yoki
            rol kerak bo‘lsa yangi qoralama boshlang.
          </p>
        </InfoNotice>
      )}
      <div className="school-form-grid">
        <label className="wide">
          Sizning bu maktabdagi rolingiz
          <select
            value={relationship}
            disabled={authorityLocked}
            onChange={(event) => onRelationship(event.target.value)}
          >
            {relationships.map((role) => (
              <option key={role} value={role}>
                {SCHOOL_ROLES[role]}
              </option>
            ))}
          </select>
        </label>
        <label className="wide">
          Maktabning to‘liq nomi
          <input
            value={identity.name}
            data-ai-anchor="school-name"
            onChange={(event) => onChange({ name: event.target.value })}
            placeholder="Masalan: Samarqand shahar 24-son umumta'lim maktabi"
          />
        </label>
        <label>
          Viloyat
          <select
            value={identity.region}
            onChange={(event) =>
              onChange({ region: event.target.value, district: "" })
            }
          >
            <option value="">Tanlang</option>
            {VILOYATLAR.map((region) => (
              <option key={region}>{region}</option>
            ))}
          </select>
        </label>
        <label>
          Tuman yoki shahar
          <select
            value={identity.district}
            disabled={!identity.region}
            onChange={(event) => onChange({ district: event.target.value })}
          >
            <option value="">Tanlang</option>
            {(HUDUDLAR[identity.region] || []).map((district) => (
              <option key={district}>{district}</option>
            ))}
          </select>
        </label>
        <label className="wide">
          Manzil
          <input
            value={identity.address}
            onChange={(event) => onChange({ address: event.target.value })}
            placeholder="Ko‘cha, uy yoki mo‘ljal"
          />
        </label>
        <label>
          Telefon
          <input
            value={identity.phone}
            inputMode="tel"
            onChange={(event) => onChange({ phone: event.target.value })}
            placeholder="+998"
          />
        </label>
        <label>
          Asosiy til
          <select
            value={identity.language}
            onChange={(event) => onChange({ language: event.target.value })}
          >
            <option value="uz">O‘zbek tili</option>
            <option value="ru">Rus tili</option>
            <option value="kaa">Qoraqalpoq tili</option>
          </select>
        </label>
      </div>
    </div>
  );
}

function ShiftStep({
  identity,
  shiftCount,
  schedule,
  onShiftCount,
  onSchedule,
}) {
  const isPublic = identity.ownership_type === "public";
  const updateShift = (index, patch) => {
    onSchedule((current) => ({
      ...current,
      shifts: current.shifts.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    }));
  };
  return (
    <div data-ai-anchor="school-shifts">
      <div className="school-card-head">
        <span>
          <Clock3 size={22} />
        </span>
        <div>
          <h2>Smena, dars va tanaffus</h2>
          <p>
            {isPublic
              ? "Davlat maktabi uchun standart vaqtlar qo‘yildi."
              : "Xususiy maktab vaqtlarni o‘z tartibiga moslaydi."}
          </p>
        </div>
      </div>
      <div className="school-segmented" id="school-shifts">
        {[1, 2].map((count) => (
          <button
            type="button"
            key={count}
            className={shiftCount === count ? "active" : ""}
            onClick={() => onShiftCount(count)}
          >
            {count} smena
          </button>
        ))}
      </div>
      <div className="school-form-grid four">
        <label>
          Dars davomiyligi
          <span className="school-number-input">
            <input
              type="number"
              min="20"
              max="90"
              disabled={isPublic}
              value={schedule.lesson_minutes}
              onChange={(event) =>
                onSchedule((current) => ({
                  ...current,
                  lesson_minutes: Number(event.target.value),
                }))
              }
            />
            <small>daq.</small>
          </span>
        </label>
        <label>
          Oddiy tanaffus
          <span className="school-number-input">
            <input
              type="number"
              min="3"
              max="30"
              disabled={isPublic}
              value={schedule.short_break_minutes}
              onChange={(event) =>
                onSchedule((current) => ({
                  ...current,
                  short_break_minutes: Number(event.target.value),
                }))
              }
            />
            <small>daq.</small>
          </span>
        </label>
        <label>
          Katta tanaffusdan oldin
          <select
            disabled={isPublic}
            value={schedule.long_break_after_lesson}
            onChange={(event) =>
              onSchedule((current) => ({
                ...current,
                long_break_after_lesson: Number(event.target.value),
              }))
            }
          >
            {[2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value}-dars
              </option>
            ))}
          </select>
        </label>
        <label>
          Katta tanaffus
          <span className="school-number-input">
            <input
              type="number"
              min="5"
              max="40"
              disabled={isPublic}
              value={schedule.long_break_minutes}
              onChange={(event) =>
                onSchedule((current) => ({
                  ...current,
                  long_break_minutes: Number(event.target.value),
                }))
              }
            />
            <small>daq.</small>
          </span>
        </label>
      </div>
      <div className="school-shift-cards">
        {schedule.shifts.map((shift, index) => (
          <div key={shift.number}>
            <span>{shift.number}</span>
            <label>
              {shift.number}-smena boshlanishi
              <input
                type="time"
                value={shift.starts_at}
                onChange={(event) =>
                  updateShift(index, { starts_at: event.target.value })
                }
              />
            </label>
            <label>
              Eng ko‘p dars
              <input
                type="number"
                min="1"
                max={isPublic ? 7 : 12}
                value={shift.max_lessons}
                onChange={(event) =>
                  updateShift(index, {
                    max_lessons: Number(event.target.value),
                  })
                }
              />
            </label>
          </div>
        ))}
      </div>
      <InfoNotice>
        <b>Jadval va smena to‘qnashmaydi</b>
        <p>
          Bir o‘qituvchi, sinf yoki xona bir vaqtda ikki darsga qo‘yilmaydi.
          Ikki smenada sinflarning qaysi smenada o‘qishi alohida belgilanadi.
        </p>
      </InfoNotice>
    </div>
  );
}

function BuildingsStep({ buildings, onChange }) {
  const update = (localId, patch) => {
    onChange((current) =>
      current.map((item) =>
        item.local_id === localId ? { ...item, ...patch } : item,
      ),
    );
  };
  const add = () => {
    onChange((current) => [
      ...current,
      {
        local_id: Math.max(0, ...current.map((item) => item.local_id)) + 1,
        name: `${current.length + 1}-bino`,
        floors: 1,
        entrance_side: "center",
        rooms_per_floor: 6,
        room_prefix: "",
      },
    ]);
  };
  return (
    <div data-ai-anchor="school-buildings">
      <div className="school-card-head split">
        <span>
          <Building2 size={22} />
        </span>
        <div>
          <h2>Bino, qavat va xonalar</h2>
          <p>Hozir tez tuzilma kiriting; maxsus xonalarni keyin aniqlashtirasiz.</p>
        </div>
        <button type="button" className="school-secondary" onClick={add}>
          <Plus size={15} /> Bino qo‘shish
        </button>
      </div>
      <div className="school-building-editor">
        {buildings.map((building) => (
          <article key={building.local_id}>
            <div className="school-building-editor-head">
              <span>
                <Layers3 size={18} />
              </span>
              <input
                value={building.name}
                aria-label="Bino nomi"
                onChange={(event) =>
                  update(building.local_id, { name: event.target.value })
                }
              />
              <button
                type="button"
                disabled={buildings.length === 1}
                aria-label="Binoni olib tashlash"
                onClick={() =>
                  onChange((current) =>
                    current.filter((item) => item.local_id !== building.local_id),
                  )
                }
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="school-form-grid">
              <label>
                Qavatlar soni
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={building.floors}
                  onChange={(event) =>
                    update(building.local_id, {
                      floors: Number(event.target.value),
                    })
                  }
                />
              </label>
              <label>
                Har qavatdagi xona
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={building.rooms_per_floor}
                  onChange={(event) =>
                    update(building.local_id, {
                      rooms_per_floor: Number(event.target.value),
                    })
                  }
                />
              </label>
              <label>
                Kirish eshigi
                <select
                  value={building.entrance_side}
                  onChange={(event) =>
                    update(building.local_id, {
                      entrance_side: event.target.value,
                    })
                  }
                >
                  <option value="left">Chap tomonda</option>
                  <option value="center">O‘rtada</option>
                  <option value="right">O‘ng tomonda</option>
                </select>
              </label>
              <label>
                Xona raqami old qo‘shimchasi
                <input
                  value={building.room_prefix}
                  maxLength={6}
                  onChange={(event) =>
                    update(building.local_id, {
                      room_prefix: event.target.value,
                    })
                  }
                  placeholder="Masalan: A"
                />
              </label>
            </div>
            <MiniBuilding building={building} />
          </article>
        ))}
      </div>
    </div>
  );
}

function persistedBuildingEntrance(building) {
  if (["left", "center", "right"].includes(building?.entrance_side)) {
    return building.entrance_side;
  }
  if (!Array.isArray(building?.floors)) return "center";
  return (
    building.floors
      .flatMap((floor) => floor.rooms || [])
      .find((room) => ["left", "center", "right"].includes(room.position))
      ?.position || "center"
  );
}

function MiniBuilding({ building, rooms }) {
  const floorRows = Array.isArray(building.floors) ? building.floors : null;
  const floors = Math.min(
    Math.max(floorRows?.length || Number(building.floors) || 1, 1),
    6,
  );
  const largestFloor =
    floorRows?.reduce(
      (largest, floor) => Math.max(largest, floor.rooms?.length || 0),
      0,
    ) || 0;
  const perFloor = Math.min(
    Math.max(
      Number(building.rooms_per_floor) || largestFloor || rooms?.length || 4,
      2,
    ),
    10,
  );
  const entrance = persistedBuildingEntrance(building);
  return (
    <div className="school-mini-building" aria-label={`${building.name} sxemasi`}>
      <div className="school-mini-roof">
        <span>{building.name}</span>
      </div>
      <div className="school-mini-floors">
        {Array.from({ length: floors }, (_, floorIndex) => {
          const floor = floors - floorIndex;
          return (
            <div className="school-mini-floor" key={floor}>
              <small>{floor}-qavat</small>
              <div>
                {Array.from({ length: perFloor }, (_, roomIndex) => {
                  const position =
                    roomIndex < perFloor / 3
                      ? "left"
                      : roomIndex >= (perFloor * 2) / 3
                        ? "right"
                        : "center";
                  const isEntrance =
                    floor === 1 &&
                    position === entrance &&
                    roomIndex ===
                      (entrance === "left"
                        ? 0
                        : entrance === "right"
                          ? perFloor - 1
                          : Math.floor(perFloor / 2));
                  return (
                    <span
                      key={roomIndex}
                      className={isEntrance ? "entrance" : ""}
                      title={
                        isEntrance
                          ? "Kirish"
                          : `${building.room_prefix || ""}${floor}${String(
                              roomIndex + 1,
                            ).padStart(2, "0")}-xona`
                      }
                    >
                      {isEntrance ? <DoorOpen size={12} /> : null}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="school-mini-ground">
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}

function ClassesStep({ classes, shiftCount, onChange }) {
  const toggleGrade = (grade) => {
    onChange((current) => ({
      ...current,
      grades: current.grades.includes(grade)
        ? current.grades.filter((item) => item !== grade)
        : [...current.grades, grade].sort((a, b) => a - b),
    }));
  };
  const letters = normalizeSectionLetters(classes.section_letters);
  return (
    <div data-ai-anchor="school-classes">
      <div className="school-card-head">
        <span>
          <GraduationCap size={22} />
        </span>
        <div>
          <h2>Sinf va parallellar</h2>
          <p>Qaysi sinflar borligini va har sinfdagi parallel harflarni belgilang.</p>
        </div>
      </div>
      <label className="school-field-title">Maktabda mavjud sinflar</label>
      <div className="school-grade-picker">
        {Array.from({ length: 11 }, (_, index) => index + 1).map((grade) => (
          <button
            type="button"
            key={grade}
            className={classes.grades.includes(grade) ? "selected" : ""}
            onClick={() => toggleGrade(grade)}
          >
            {grade}
          </button>
        ))}
      </div>
      <div className="school-form-grid">
        <label>
          Parallel harflari
          <input
            value={classes.section_letters}
            onChange={(event) =>
              onChange((current) => ({
                ...current,
                section_letters: event.target.value,
              }))
            }
            placeholder="A, B, D"
          />
          <small>Vergul bilan ajrating</small>
        </label>
        <label>
          Bir sinfdagi reja sig‘imi
          <input
            type="number"
            min="5"
            max="60"
            value={classes.capacity}
            onChange={(event) =>
              onChange((current) => ({
                ...current,
                capacity: Number(event.target.value),
              }))
            }
          />
        </label>
      </div>
      {shiftCount === 2 && (
        <div className="school-grade-shifts">
          <span className="school-field-title">
            Har bir sinf bosqichining boshlang‘ich smenasi
          </span>
          <div>
            {classes.grades.map((grade) => (
              <label key={grade}>
                <b>{grade}-sinf</b>
                <span>
                  {[1, 2].map((shift) => (
                    <button
                      type="button"
                      key={shift}
                      className={
                        Number(classes.grade_shifts?.[grade] || 1) === shift
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        onChange((current) => ({
                          ...current,
                          grade_shifts: {
                            ...current.grade_shifts,
                            [grade]: shift,
                          },
                        }))
                      }
                    >
                      {shift}-smena
                    </button>
                  ))}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
      <div className="school-class-preview">
        {classes.grades.slice(0, 6).flatMap((grade) =>
          letters.slice(0, 4).map((letter) => (
            <span key={`${grade}-${letter}`}>
              {grade}-{letter}
            </span>
          )),
        )}
        {classes.grades.length * letters.length > 24 && (
          <small>+ yana {classes.grades.length * letters.length - 24} ta</small>
        )}
      </div>
    </div>
  );
}

function StaffStep({ plan, onChange }) {
  return (
    <div data-ai-anchor="school-staff">
      <div className="school-card-head">
        <span>
          <Users size={22} />
        </span>
        <div>
          <h2>Xodimlar va o‘qituvchi bandligi</h2>
          <p>
            Maktab ochilgach xodimlar taklif kodi bilan qo‘shiladi. Hozir jadval
            uchun umumiy me’yorni belgilang.
          </p>
        </div>
      </div>
      <div className="school-role-map">
        {[
          ["director", "Barcha boshqaruv va tasdiqlar"],
          ["academic_deputy", "Dars jadvali, yuklama va o‘quv kalendari"],
          ["spiritual_deputy", "Tadbir, davomat va tarbiyaviy ishlar"],
          ["teacher", "O‘z darsi, sinfi, davomat va baholar"],
        ].map(([role, hint]) => (
          <div key={role}>
            <span>
              <UserCheck size={17} />
            </span>
            <b>{SCHOOL_ROLES[role]}</b>
            <small>{hint}</small>
          </div>
        ))}
      </div>
      <div className="school-form-grid">
        <label>
          Tavsiya etilgan kunlik dars
          <input
            type="number"
            min="1"
            max="7"
            value={plan.max_lessons_per_teacher}
            onChange={(event) =>
              onChange((current) => ({
                ...current,
                max_lessons_per_teacher: Number(event.target.value),
              }))
            }
          />
        </label>
        <label>
          Mutlaq eng ko‘p kunlik dars
          <input
                type="number"
                min="1"
                max="7"
            value={plan.absolute_max_lessons}
            onChange={(event) =>
              onChange((current) => ({
                ...current,
                absolute_max_lessons: Number(event.target.value),
              }))
            }
          />
        </label>
      </div>
      <label className="school-check-row">
        <input
          type="checkbox"
          checked={plan.teacher_method_day_enabled}
          onChange={(event) =>
            onChange((current) => ({
              ...current,
              teacher_method_day_enabled: event.target.checked,
            }))
          }
        />
        Har bir o‘qituvchi uchun metod kunini saqlash
      </label>
      <InfoNotice>
        <b>Metod kuni va bo‘sh vaqt majburiy cheklov bo‘ladi</b>
        <p>
          Generator metod kuniga dars qo‘ymaydi, parallel darsni ogohlantiradi
          va 1–2 soatlik keraksiz bo‘shliqni imkon qadar kamaytiradi.
        </p>
      </InfoNotice>
    </div>
  );
}

function WorkloadStep({ workload, onChange }) {
  return (
    <div data-ai-anchor="school-workload">
      <div className="school-card-head">
        <span>
          <BookOpen size={22} />
        </span>
        <div>
          <h2>Fanlar va jadval mezonlari</h2>
          <p>Haqiqiy haftalik soatlar maktab ochilgandan keyin biriktiriladi.</p>
        </div>
      </div>
      <label className="school-check-row featured">
        <input
          type="checkbox"
          checked={workload.use_standard_subjects}
          onChange={(event) =>
            onChange((current) => ({
              ...current,
              use_standard_subjects: event.target.checked,
            }))
          }
        />
        O‘zbekiston umumta’lim fanlari ro‘yxatini boshlang‘ich qilib olish
      </label>
      <div className="school-subject-cloud">
        {workload.subjects.map((subject) => (
          <span key={subject}>{subject}</span>
        ))}
      </div>
      <div className="school-constraint-list">
        {[
          [
            "avoid_math_last_periods",
            "Matematika va aniq fanlarni imkon qadar 5–7-soatlarga qo‘ymaslik",
          ],
          [
            "prefer_physical_first_three",
            "Jismoniy tarbiyani imkon qadar 1–3-soatlarga joylash",
          ],
          [
            "avoid_single_gap",
            "O‘qituvchida bitta darslik keraksiz tanaffuslarni kamaytirish",
          ],
        ].map(([key, label]) => (
          <label className="school-check-row" key={key}>
            <input
              type="checkbox"
              checked={workload[key]}
              onChange={(event) =>
                onChange((current) => ({
                  ...current,
                  [key]: event.target.checked,
                }))
              }
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}

function CalendarStep({ calendar, onChange }) {
  const toggleDay = (day) => {
    onChange((current) => ({
      ...current,
      work_days: current.work_days.includes(day)
        ? current.work_days.filter((item) => item !== day)
        : [...current.work_days, day].sort(),
    }));
  };
  return (
    <div data-ai-anchor="school-calendar">
      <div className="school-card-head">
        <span>
          <CalendarDays size={22} />
        </span>
        <div>
          <h2>O‘quv yili va maktab kalendari</h2>
          <p>Keyin chorak, ta’til, bayram va tadbirlar shu asosda quriladi.</p>
        </div>
      </div>
      <div className="school-form-grid">
        <label>
          O‘quv yili
          <input
            value={calendar.academic_year}
            onChange={(event) =>
              onChange((current) => ({
                ...current,
                academic_year: event.target.value,
              }))
            }
            placeholder="2026-2027"
          />
        </label>
        <label>
          Boshlanish sanasi
          <input
            type="date"
            value={calendar.starts_on}
            onChange={(event) =>
              onChange((current) => ({
                ...current,
                starts_on: event.target.value,
              }))
            }
          />
        </label>
        <label>
          Tugash sanasi
          <input
            type="date"
            value={calendar.ends_on}
            onChange={(event) =>
              onChange((current) => ({
                ...current,
                ends_on: event.target.value,
              }))
            }
          />
        </label>
      </div>
      <label className="school-field-title">Haftalik o‘qish kunlari</label>
      <div className="school-weekdays">
        {WEEKDAYS.map((day) => (
          <button
            type="button"
            key={day.value}
            className={calendar.work_days.includes(day.value) ? "selected" : ""}
            onClick={() => toggleDay(day.value)}
          >
            {day.short}
          </button>
        ))}
      </div>
      <div className="school-constraint-list">
        <label className="school-check-row">
          <input
            type="checkbox"
            checked={calendar.use_uzbekistan_holidays}
            onChange={(event) =>
              onChange((current) => ({
                ...current,
                use_uzbekistan_holidays: event.target.checked,
              }))
            }
          />
          Sanasi qat’iy O‘zbekiston rasmiy bayramlarini kalendarga yaratish
          (Hayit va Prezident qarori bilan ko‘chadigan qo‘shimcha dam olish
          kunlari keyin qo‘lda tekshiriladi)
        </label>
        <label className="school-check-row">
          <input
            type="checkbox"
            checked={calendar.reschedule_cancelled_lessons}
            onChange={(event) =>
              onChange((current) => ({
                ...current,
                reschedule_cancelled_lessons: event.target.checked,
              }))
            }
          />
          Bekor bo‘lgan darsni o‘chirmay, qayta rejalashtirish navbatiga o‘tkazish
        </label>
      </div>
    </div>
  );
}

function ReviewStep({
  identity,
  shiftCount,
  schedule,
  buildings,
  classes,
  staffPlan,
  workload,
  calendar,
  preferences,
  onPreferences,
  confirmed,
  onConfirmed,
}) {
  const sections = normalizeSectionLetters(classes.section_letters);
  const classCount = classes.grades.length * sections.length;
  return (
    <div data-ai-anchor="school-review">
      <div className="school-card-head">
        <span>
          <BadgeCheck size={22} />
        </span>
        <div>
          <h2>Yakuniy tekshiruv</h2>
          <p>Yo‘lko‘rsatuvchi bu ma’lumotni tasdiqlamaydi. Yakuniy qaror sizniki.</p>
        </div>
      </div>
      <div className="school-review-grid">
        <article>
          <small>Maktab</small>
          <b>{identity.name || "Nom kiritilmagan"}</b>
          <p>{schoolTypeLabel(identity.school_type)}</p>
        </article>
        <article>
          <small>Smena va vaqt</small>
          <b>{shiftCount} smena · {schedule.lesson_minutes} daqiqa</b>
          <p>{schedule.shifts.map((item) => item.starts_at).join(" / ")}</p>
        </article>
        <article>
          <small>Bino va xona</small>
          <b>{buildings.length} ta bino</b>
          <p>
            {buildings.reduce(
              (sum, item) =>
                sum + Number(item.floors) * Number(item.rooms_per_floor),
              0,
            )}{" "}
            ta reja xona
          </p>
        </article>
        <article>
          <small>Sinf va parallel</small>
          <b>{classCount} ta reja sinf</b>
          <p>{classes.grades.length} ta bosqich · {sections.join(", ")}</p>
        </article>
        <article>
          <small>O‘qituvchi me’yori</small>
          <b>Kuniga {staffPlan.max_lessons_per_teacher} ta tavsiya</b>
          <p>Mutlaq eng ko‘pi {staffPlan.absolute_max_lessons} ta</p>
        </article>
        <article>
          <small>O‘quv kalendari</small>
          <b>{calendar.academic_year}</b>
          <p>{calendar.starts_on} — {calendar.ends_on}</p>
        </article>
        <article>
          <small>Fanlar</small>
          <b>{workload.subjects.length} ta boshlang‘ich fan</b>
          <p>Haqiqiy yuklama keyin biriktiriladi</p>
        </article>
      </div>
      <AvatarPreferences preferences={preferences} onChange={onPreferences} />
      <label className="school-final-confirm">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => onConfirmed(event.target.checked)}
        />
        <span>
          <b>Ma’lumotlarni tekshirdim</b>
          <small>
            Maktab ish maydonini yaratishga va keyingi sozlamalarni o‘zim
            tasdiqlashga roziman.
          </small>
        </span>
      </label>
    </div>
  );
}

function SchoolDashboard({
  apiBase,
  token,
  workspace,
  preferences,
  onPreferences,
  onLegacy,
  onBack,
}) {
  const contextId = workspace.context_id;
  const roles = workspace.roles || [];
  const canManage = roles.some((role) => SCHOOL_MANAGER_ROLES.has(role));
  const canAcademic = roles.some((role) => SCHOOL_ACADEMIC_ROLES.has(role));
  const menuKeys = useMemo(
    () => visibleMenuForWorkspace(roles, workspace),
    [roles, workspace],
  );
  const [active, setActive] = useState("overview");
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const tour = useMemo(
    () =>
      tourForSchoolRoles(roles).filter((item) =>
        menuKeys.includes(item.key),
      ),
    [menuKeys, roles],
  );

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await schoolApi(schoolRoutes.dashboard, {
        apiBase,
        token,
        contextId,
      });
      setOverview(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [apiBase, contextId, token]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const openMenu = (key) => {
    if (!menuKeys.includes(key)) return;
    setActive(key);
    setSidebarOpen(false);
  };

  const answerDashboardQuestion = (rawQuestion) => {
    const question = rawQuestion.toLocaleLowerCase("uz");
    const keywords = [
      ["timetable", ["jadval", "dars vaqti", "o‘rinbosar", "orinbosar"]],
      ["calendar", ["kalendar", "bayram", "qoplov", "bekor"]],
      ["attendance", ["davomat", "yo‘qlama", "yoqlama"]],
      ["grades", ["baho", "ball", "nazorat"]],
      ["classes", ["sinf", "o‘quvchi", "ota-ona"]],
      ["teachers", ["xodim", "o‘qituvchi", "metod kuni", "bandlik"]],
      ["workloads", ["yuklama", "fan", "haftalik soat"]],
      ["buildings", ["bino", "xona", "qavat"]],
      ["payments", ["to‘lov", "hisob", "qarzdor"]],
      ["settings", ["sozlama", "avatar", "ovoz"]],
    ];
    const match = keywords.find(
      ([key, values]) =>
        menuKeys.includes(key) &&
        values.some((value) => question.includes(value)),
    );
    if (!match) {
      return {
        message:
          tour.find((item) => item.key === active)?.message ||
          "Menyu nomini yoki bajarmoqchi bo‘lgan ishingizni yozing. Men kerakli bo‘limni taklif qilaman, lekin yozuvni saqlamayman.",
      };
    }
    const [key] = match;
    return {
      message: `${MENU[key].label} bo‘limi siz so‘ragan ishga mos. Uni ochishni taklif qilaman; hech qanday ma’lumot avtomatik saqlanmaydi.`,
      actionLabel: `${MENU[key].label}ni ochish`,
      action: {
        type: "OPEN_MENU",
        key,
        expectedContextId: Number(contextId),
      },
    };
  };

  const applyDashboardSuggestion = (action) => {
    if (
      action.type !== "OPEN_MENU" ||
      Number(action.expectedContextId) !== Number(contextId) ||
      !menuKeys.includes(action.key)
    ) {
      setError("Yordamchi taklifi bu maktab yoki rolingiz uchun ruxsat etilmagan.");
      return;
    }
    openMenu(action.key);
  };

  return (
    <main className="school-dashboard-shell">
      <header className="school-dashboard-topbar">
        <button
          type="button"
          className="school-mobile-menu"
          aria-label="Menyuni ochish"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={20} />
        </button>
        <button type="button" className="school-brand" onClick={onBack}>
          <span>
            <School size={21} />
          </span>
          <div>
            <b>{workspace.name}</b>
            <small>
              {schoolTypeLabel(workspace.school_type)}
              {workspace.shift_count
                ? ` · ${workspace.shift_count} smena`
                : ""}
            </small>
          </div>
        </button>
        <div className="school-topbar-role">
          {(roles || []).slice(0, 2).map((role) => (
            <span key={role}>{SCHOOL_ROLES[role] || role}</span>
          ))}
        </div>
      </header>

      <div className="school-dashboard-layout">
        <aside className={`school-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="school-sidebar-head">
            <span className="school-eyebrow">BOSHQARUV</span>
            <button
              type="button"
              aria-label="Menyuni yopish"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={19} />
            </button>
          </div>
          <nav aria-label="Maktab boshqaruv menyusi">
            {menuKeys.map((key) => {
              const item = MENU[key];
              const Icon = item.icon;
              return (
                <button
                  type="button"
                  key={key}
                  data-ai-anchor={`school-menu-${key}`}
                  className={active === key ? "active" : ""}
                  onClick={() => openMenu(key)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  <ChevronRight size={14} />
                </button>
              );
            })}
          </nav>
          <div className="school-sidebar-foot">
            {onLegacy && (
              <button type="button" onClick={onLegacy}>
                Eski maktab bo‘limini ochish
              </button>
            )}
            <button type="button" onClick={onBack}>
              <ArrowLeft size={15} /> Maktablar ro‘yxati
            </button>
          </div>
        </aside>
        {sidebarOpen && (
          <button
            type="button"
            className="school-sidebar-overlay"
            aria-label="Menyuni yopish"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <section className="school-dashboard-content">
          <div className="school-content-head">
            <div>
              <span className="school-eyebrow">MAKTAB ISH MAYDONI</span>
              <h1>{MENU[active]?.label}</h1>
            </div>
            <button
              type="button"
              className="school-icon-button"
              aria-label="Ma'lumotni yangilash"
              onClick={active === "overview" ? loadOverview : undefined}
            >
              <RefreshCw size={17} />
            </button>
          </div>

          <ErrorNotice error={error} onRetry={loadOverview} />
          {active === "overview" && (
            <OverviewPage
              loading={loading}
              data={overview}
              workspace={workspace}
              onOpen={openMenu}
            />
          )}
          {active === "timetable" && (
            <TimetablePage
              apiBase={apiBase}
              token={token}
              contextId={contextId}
              school={overview?.school || workspace}
              canEdit={canAcademic}
              onConfirm={setConfirmation}
            />
          )}
          {active === "calendar" && (
            <CalendarPage
              apiBase={apiBase}
              token={token}
              contextId={contextId}
              school={overview?.school || workspace}
              canEdit={canAcademic}
              onConfirm={setConfirmation}
            />
          )}
          {active === "attendance" && (
            <AttendancePage
              apiBase={apiBase}
              token={token}
              contextId={contextId}
              onConfirm={setConfirmation}
            />
          )}
          {active === "grades" && (
            <GradesPage
              apiBase={apiBase}
              token={token}
              contextId={contextId}
              onConfirm={setConfirmation}
            />
          )}
          {active === "classes" && (
            <ClassesStudentsPage
              apiBase={apiBase}
              token={token}
              contextId={contextId}
              canManage={canManage}
              onConfirm={setConfirmation}
            />
          )}
          {active === "teachers" && (
            <TeachersPage
              apiBase={apiBase}
              token={token}
              contextId={contextId}
              canInvite={canManage}
              canEditAvailability={canAcademic}
              onConfirm={setConfirmation}
            />
          )}
          {active === "workloads" && (
            <ResourcePage
              apiBase={apiBase}
              token={token}
              contextId={contextId}
              resource="workloads"
              title="Fan va haftalik yuklamalar"
              readOnly={!canAcademic}
              onConfirm={setConfirmation}
            />
          )}
          {active === "buildings" && (
            <BuildingsPage
              apiBase={apiBase}
              token={token}
              contextId={contextId}
              readOnly={!canManage}
              onConfirm={setConfirmation}
            />
          )}
          {active === "payments" && (
            <PaymentsPage
              apiBase={apiBase}
              token={token}
              contextId={contextId}
              onLegacy={onLegacy}
            />
          )}
          {active === "settings" && (
            <SettingsPage
              workspace={workspace}
              preferences={preferences}
              onPreferences={onPreferences}
              onLegacy={onLegacy}
            />
          )}
        </section>
      </div>

      <GuidedAvatar
        apiBase={apiBase}
        enabled={preferences.enabled}
        speechEnabled={preferences.speechEnabled}
        variant={preferences.variant}
        steps={tour}
        activeKey={active}
        onNavigate={openMenu}
        onQuestion={answerDashboardQuestion}
        onApplySuggestion={applyDashboardSuggestion}
        onSpeechChange={(speechEnabled) => onPreferences({ speechEnabled })}
        onEnabledChange={(enabled) => onPreferences({ enabled })}
      />
      <ConfirmDialog
        confirmation={confirmation}
        onClose={() => setConfirmation(null)}
      />
    </main>
  );
}

function OverviewPage({ loading, data, workspace, onOpen }) {
  if (loading) return <LoadingBlock text="Maktab holati olinmoqda..." />;
  const metrics = [
    {
      key: "classes",
      label: "Sinf",
      value: data?.counts?.sections ?? data?.classes_count ?? 0,
      icon: GraduationCap,
    },
    {
      key: "teachers",
      label: "Xodim",
      value: data?.counts?.staff ?? data?.staff_count ?? 0,
      icon: Users,
    },
    {
      key: "attendance",
      label: "O‘quvchi",
      value: data?.counts?.students ?? 0,
      icon: UserCheck,
    },
    {
      key: "timetable",
      label: "Yaqin tadbir",
      value: data?.counts?.week_events ?? 0,
      icon: TableProperties,
    },
  ];
  return (
    <div className="school-overview">
      <div className="school-metric-grid">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <button type="button" key={metric.key} onClick={() => onOpen(metric.key)}>
              <span>
                <Icon size={20} />
              </span>
              <small>{metric.label}</small>
              <b>{metric.value}</b>
            </button>
          );
        })}
      </div>
      <div className="school-overview-grid">
        <section className="school-card">
          <div className="school-card-title">
            <div>
              <span className="school-eyebrow">BUGUN</span>
              <h2>Dars va smena holati</h2>
            </div>
            <Clock3 size={20} />
          </div>
          {(data?.today_lessons || []).length ? (
            <div className="school-timeline">
              {data.today_lessons.slice(0, 8).map((lesson) => (
                <div key={lesson.id}>
                  <time>{lesson.starts_at || lesson.time}</time>
                  <span>
                    <b>{lesson.subject_name || lesson.title}</b>
                    <small>
                      {[lesson.class_name, lesson.room_name]
                        .filter(Boolean)
                        .join(" · ")}
                    </small>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Clock3}
              title="Bugungi darslar hali yo‘q"
              text="Jadval e’lon qilingach darslar shu yerda chiqadi."
            />
          )}
        </section>
        <section className="school-card">
          <div className="school-card-title">
            <div>
              <span className="school-eyebrow">NAZORAT</span>
              <h2>Ogohlantirishlar</h2>
            </div>
            <BellRing size={20} />
          </div>
          {(data?.alerts || []).length ? (
            <div className="school-alert-list">
              {data.alerts.slice(0, 8).map((alert, index) => (
                <div key={alert.id || index}>
                  <AlertTriangle size={16} />
                  <span>
                    <b>{alert.title}</b>
                    <small>{alert.message}</small>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CheckCircle2}
              title="Hozircha jiddiy ogohlantirish yo‘q"
              text="To‘qnashuv yoki bajarilmagan vazifa shu yerda ko‘rsatiladi."
            />
          )}
        </section>
      </div>
      <InfoNotice>
        <b>{workspace.shift_count || 1} smenali ish tartibi</b>
        <p>
          Kalendar, yuklama va e’lon qilingan jadval o‘zaro bog‘langan.
          O‘zgarishlar qoralama sifatida tayyorlanib, keyin alohida tasdiqlanadi.
        </p>
      </InfoNotice>
    </div>
  );
}

function usePagedResource({ apiBase, token, contextId, resource, query }) {
  const [items, setItems] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(
    async (cursor) => {
      setLoading(true);
      setError("");
      try {
        const data = await schoolApi(
          schoolRoutes.resource(contextId, resource),
          {
            apiBase,
            token,
            contextId,
            query: pageQuery(
              cursor && typeof cursor === "object"
                ? {
                    ...query,
                    after_id: cursor.after_id,
                    after_start: cursor.after_start,
                  }
                : { ...query, afterId: cursor },
            ),
          },
        );
        const page = unwrapItems(data);
        setItems((current) =>
          cursor ? mergeById(current, page.items) : page.items,
        );
        setNextCursor(page.nextCursor);
        setHasMore(page.hasMore);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    },
    [apiBase, contextId, query, resource, token],
  );

  useEffect(() => {
    load(null);
  }, [load]);

  return {
    items,
    loading,
    error,
    hasMore,
    reload: () => load(null),
    loadMore: () => load(nextCursor),
  };
}

const RESOURCE_FIELDS = {
  calendar: [
    { key: "title", label: "Voqea nomi", required: true },
    { key: "event_type", label: "Turi", type: "select", options: ["academic", "holiday", "lesson", "exam", "meeting", "club", "substitution", "other"], required: true },
    { key: "starts_at", label: "Boshlanish", type: "datetime-local", required: true },
    { key: "ends_at", label: "Tugash", type: "datetime-local", required: true },
    { key: "description", label: "Izoh" },
  ],
  classes: [
    { key: "grade_no", label: "Sinf bosqichi", type: "number", required: true },
    { key: "section_name", label: "Parallel", required: true },
    { key: "shift_no", label: "Smena", type: "select", options: ["1", "2"], required: true },
    { key: "capacity", label: "Sig‘im", type: "number" },
    { key: "homeroom_teacher_user_id", label: "Sinf rahbari", type: "select", options: [] },
    { key: "default_room_id", label: "Doimiy xona", type: "select", options: [] },
  ],
  workloads: [
    { key: "teacher_user_id", label: "O‘qituvchi", type: "select", options: [], required: true },
    { key: "section_id", label: "Sinf", type: "select", options: [], required: true },
    { key: "subject_id", label: "Fan", type: "select", options: [], required: true },
    { key: "weekly_hours", label: "Haftalik soat", type: "number", required: true },
    { key: "preferred_room_id", label: "Ustuvor xona", type: "select", options: [] },
    { key: "preferred_band", label: "Ustuvor vaqt", type: "select", options: ["early", "late", "any"] },
    { key: "max_per_day", label: "Bir kundagi eng ko‘p", type: "number" },
  ],
};

function ClassesStudentsPage({
  apiBase,
  token,
  contextId,
  canManage = false,
  onConfirm,
}) {
  const [sections, setSections] = useState([]);
  const [sectionId, setSectionId] = useState("");
  const [students, setStudents] = useState([]);
  const [studentQuery, setStudentQuery] = useState("");
  const [studentResults, setStudentResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [parentQuery, setParentQuery] = useState("");
  const [parentResults, setParentResults] = useState([]);
  const [selectedParent, setSelectedParent] = useState(null);
  const [linkedStudentId, setLinkedStudentId] = useState("");
  const [busySearch, setBusySearch] = useState("");
  const [error, setError] = useState("");

  const loadSections = useCallback(async () => {
    if (!canManage) return;
    try {
      const data = await fetchAllById(
        schoolRoutes.resource(contextId, "classes"),
        {
          apiBase,
          token,
          contextId,
          limit: 200,
          maxPages: 5,
        },
      );
      const nextSections = data?.items || [];
      setSections(nextSections);
      setSectionId((current) =>
        nextSections.some((item) => String(item.id) === String(current))
          ? current
          : nextSections[0]
            ? String(nextSections[0].id)
            : "",
      );
    } catch (requestError) {
      setError(requestError.message);
    }
  }, [apiBase, canManage, contextId, token]);

  const loadStudents = useCallback(async () => {
    if (!canManage || !sectionId) {
      setStudents([]);
      return;
    }
    try {
      const data = await fetchAllById(
        schoolRoutes.resource(contextId, "students"),
        {
          apiBase,
          token,
          contextId,
          query: { section_id: sectionId, limit: 300 },
          limit: 300,
          maxPages: 4,
        },
      );
      const nextStudents = data?.items || [];
      setStudents(nextStudents);
      setLinkedStudentId((current) =>
        nextStudents.some(
          (item) =>
            String(item.user_id || item.id) === String(current),
        )
          ? current
          : nextStudents[0]
            ? String(nextStudents[0].user_id || nextStudents[0].id)
            : "",
      );
    } catch (requestError) {
      setError(requestError.message);
    }
  }, [apiBase, canManage, contextId, sectionId, token]);

  useEffect(() => {
    loadSections();
  }, [loadSections]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const searchUsers = async (kind) => {
    const query = kind === "student" ? studentQuery : parentQuery;
    if (query.trim().length < 3) {
      setError("Ism yoki familiyadan kamida 3 ta harf kiriting.");
      return;
    }
    setBusySearch(kind);
    setError("");
    try {
      const data = await schoolApi(schoolRoutes.userSearch, {
        apiBase,
        token,
        contextId,
        query: { q: query.trim(), limit: 20 },
      });
      if (kind === "student") {
        setStudentResults(data?.items || []);
        setSelectedStudent(null);
      } else {
        setParentResults(data?.items || []);
        setSelectedParent(null);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusySearch("");
    }
  };

  const assignStudent = () => {
    if (!sectionId || !selectedStudent?.user_id) {
      setError("Sinf va o‘quvchi hisobini tanlang.");
      return;
    }
    const section = sections.find(
      (item) => String(item.id) === String(sectionId),
    );
    onConfirm({
      title: "O‘quvchi sinfga biriktirilsinmi?",
      detail: `${selectedStudent.full_name} → ${section?.grade_no || ""}-${section?.section_name || ""}. Oldingi faol sinf biriktiruvi bo‘lsa, tarixda yakunlanadi.`,
      onConfirm: async () => {
        try {
          await schoolApi(
            schoolRoutes.resource(contextId, "students"),
            {
              apiBase,
              token,
              contextId,
              method: "POST",
              body: {
                section_id: Number(sectionId),
                user_id: Number(selectedStudent.user_id),
                confirmation: true,
              },
            },
          );
          setSelectedStudent(null);
          setStudentResults([]);
          setStudentQuery("");
          await loadStudents();
        } catch (requestError) {
          setError(requestError.message);
          throw requestError;
        }
      },
    });
  };

  const linkParent = () => {
    if (!linkedStudentId || !selectedParent?.user_id) {
      setError("O‘quvchi va ota-ona hisobini tanlang.");
      return;
    }
    const student = students.find(
      (item) =>
        String(item.user_id || item.id) === String(linkedStudentId),
    );
    onConfirm({
      title: "Ota-ona o‘quvchiga bog‘lansinmi?",
      detail: `${selectedParent.full_name} faqat ${student?.full_name || "tanlangan o‘quvchi"}ga ruxsat etilgan ma’lumotlarni ko‘radi.`,
      onConfirm: async () => {
        try {
          await schoolApi(schoolRoutes.studentParentLinks, {
            apiBase,
            token,
            contextId,
            method: "POST",
            body: {
              parent_user_id: Number(selectedParent.user_id),
              student_user_id: Number(linkedStudentId),
              confirmation: true,
            },
          });
          setSelectedParent(null);
          setParentResults([]);
          setParentQuery("");
        } catch (requestError) {
          setError(requestError.message);
          throw requestError;
        }
      },
    });
  };

  return (
    <div className="school-stacked-sections">
      {canManage && (
        <section className="school-card school-enrollment-card">
          <div className="school-card-title">
            <div>
              <span className="school-eyebrow">QABUL VA BIRIKTIRISH</span>
              <h2>O‘quvchi va ota-onani hisob orqali tanlash</h2>
            </div>
            <ShieldCheck size={20} />
          </div>
          <p className="school-muted">
            Platformadagi ismni qidiring. Tizim telefon yoki boshqa maxfiy
            ma’lumotni ko‘rsatmaydi va raqamni qo‘lda kiritishni talab qilmaydi.
          </p>
          <ErrorNotice error={error} />
          <div className="school-enrollment-grid">
            <div>
              <h3>1. O‘quvchini sinfga biriktirish</h3>
              <label>
                Sinf
                <select
                  value={sectionId}
                  onChange={(event) => setSectionId(event.target.value)}
                >
                  <option value="">Tanlang</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.grade_no}-{section.section_name} ·{" "}
                      {section.shift_no}-smena
                    </option>
                  ))}
                </select>
              </label>
              <div className="school-search-input">
                <input
                  value={studentQuery}
                  onChange={(event) => setStudentQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      searchUsers("student");
                    }
                  }}
                  placeholder="O‘quvchi ismi yoki familiyasi"
                />
                <button
                  type="button"
                  className="school-secondary"
                  disabled={busySearch === "student"}
                  onClick={() => searchUsers("student")}
                >
                  {busySearch === "student" ? (
                    <Loader2 size={15} className="school-spin" />
                  ) : (
                    <Search size={15} />
                  )}
                  Qidirish
                </button>
              </div>
              <UserSearchResults
                items={studentResults}
                selected={selectedStudent}
                onSelect={setSelectedStudent}
              />
              <button
                type="button"
                className="school-primary"
                disabled={!selectedStudent || !sectionId}
                onClick={assignStudent}
              >
                <UserPlus size={16} /> Sinfga biriktirish
              </button>
            </div>
            <div>
              <h3>2. Ota-onani bog‘lash</h3>
              <label>
                O‘quvchi
                <select
                  value={linkedStudentId}
                  onChange={(event) =>
                    setLinkedStudentId(event.target.value)
                  }
                >
                  <option value="">Tanlang</option>
                  {students.map((student) => (
                    <option
                      key={student.user_id || student.id}
                      value={student.user_id || student.id}
                    >
                      {student.full_name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="school-search-input">
                <input
                  value={parentQuery}
                  onChange={(event) => setParentQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      searchUsers("parent");
                    }
                  }}
                  placeholder="Ota-ona ismi yoki familiyasi"
                />
                <button
                  type="button"
                  className="school-secondary"
                  disabled={busySearch === "parent"}
                  onClick={() => searchUsers("parent")}
                >
                  {busySearch === "parent" ? (
                    <Loader2 size={15} className="school-spin" />
                  ) : (
                    <Search size={15} />
                  )}
                  Qidirish
                </button>
              </div>
              <UserSearchResults
                items={parentResults}
                selected={selectedParent}
                onSelect={setSelectedParent}
              />
              <button
                type="button"
                className="school-primary"
                disabled={!selectedParent || !linkedStudentId}
                onClick={linkParent}
              >
                <Users size={16} /> Ota-onani bog‘lash
              </button>
            </div>
          </div>
        </section>
      )}
      <ResourcePage
        apiBase={apiBase}
        token={token}
        contextId={contextId}
        resource="classes"
        title="Sinf va parallellar"
        readOnly={!canManage}
        onConfirm={onConfirm}
      />
    </div>
  );
}

function UserSearchResults({ items, selected, onSelect }) {
  if (!items.length) return null;
  return (
    <div className="school-user-search-results" role="listbox">
      {items.map((item) => {
        const isSelected = item.user_id === selected?.user_id;
        return (
          <button
            type="button"
            role="option"
            aria-selected={isSelected}
            className={isSelected ? "selected" : ""}
            key={item.user_id}
            onClick={() => onSelect(item)}
          >
            <span className="school-avatar-initial">
              {(item.full_name || "?").slice(0, 1)}
            </span>
            <span>
              <b>{item.full_name}</b>
              <small>
                {item.already_in_school
                  ? "Maktabda roli mavjud"
                  : "Biriktirishga tayyor"}
              </small>
            </span>
            {isSelected && <CheckCircle2 size={17} />}
          </button>
        );
      })}
    </div>
  );
}

function ResourcePage({
  apiBase,
  token,
  contextId,
  resource,
  title,
  readOnly = false,
  onConfirm,
}) {
  const baseFields = RESOURCE_FIELDS[resource] || [];
  const { items, loading, error, hasMore, reload, loadMore } = usePagedResource({
    apiBase,
    token,
    contextId,
    resource,
  });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [localError, setLocalError] = useState("");
  const [lookups, setLookups] = useState({
    classes: [],
    staff: [],
    subjects: [],
    rooms: [],
  });
  const [subjectForm, setSubjectForm] = useState({
    code: "",
    name: "",
    grade_from: 1,
    grade_to: 11,
    weekly_hours: "",
    preferred_period_max: "",
  });
  const [showSubjectForm, setShowSubjectForm] = useState(false);

  useEffect(() => {
    if (!["classes", "workloads"].includes(resource)) return undefined;
    let active = true;
    const requests = [
      fetchAllById(schoolRoutes.resource(contextId, "staff"), {
        apiBase,
        token,
        contextId,
        limit: 200,
        maxPages: 10,
      }),
      fetchAllById(schoolRoutes.resource(contextId, "buildings"), {
        apiBase,
        token,
        contextId,
        limit: 100,
        maxPages: 2,
      }),
      ...(resource === "workloads"
        ? [
            fetchAllById(schoolRoutes.resource(contextId, "classes"), {
              apiBase,
              token,
              contextId,
              limit: 200,
              maxPages: 5,
            }),
            fetchAllById(schoolRoutes.resource(contextId, "subjects"), {
              apiBase,
              token,
              contextId,
              limit: 200,
              maxPages: 5,
            }),
          ]
        : []),
    ];
    Promise.all(requests)
      .then(([staffData, buildingData, classData, subjectData]) => {
        if (!active) return;
        const rooms = (buildingData?.items || []).flatMap((building) =>
          (building.floors || []).flatMap((floor) =>
            (floor.rooms || []).map((room) => ({
              ...room,
              building_name: building.name,
              floor_number: floor.floor_number,
            })),
          ),
        );
        setLookups({
          staff: staffData?.items || [],
          rooms,
          classes: classData?.items || [],
          subjects: subjectData?.items || [],
        });
      })
      .catch((requestError) => setLocalError(requestError.message));
    return () => {
      active = false;
    };
  }, [apiBase, contextId, resource, token]);

  const fields = useMemo(
    () =>
      baseFields.map((field) => {
        if (field.key === "homeroom_teacher_user_id") {
          return {
            ...field,
            options: lookups.staff
              .filter((item) =>
                ["teacher", "homeroom_teacher"].includes(item.role_key),
              )
              .map((item) => ({
                value: item.user_id,
                label: item.full_name,
              })),
          };
        }
        if (field.key === "teacher_user_id") {
          return {
            ...field,
            options: lookups.staff
              .filter((item) =>
                ["teacher", "homeroom_teacher"].includes(item.role_key),
              )
              .map((item) => ({
                value: item.user_id,
                label: item.full_name,
              })),
          };
        }
        if (field.key === "section_id") {
          return {
            ...field,
            options: lookups.classes.map((item) => ({
              value: item.id,
              label: `${item.grade_no}-${item.section_name} · ${item.shift_no}-smena`,
            })),
          };
        }
        if (field.key === "subject_id") {
          return {
            ...field,
            options: lookups.subjects.map((item) => ({
              value: item.id,
              label: item.name,
            })),
          };
        }
        if (["default_room_id", "preferred_room_id"].includes(field.key)) {
          return {
            ...field,
            options: lookups.rooms.map((item) => ({
              value: item.id,
              label: `${item.building_name} · ${item.floor_number}-qavat · ${item.name}`,
            })),
          };
        }
        return field;
      }),
    [baseFields, lookups],
  );

  const create = () => {
    const missing = fields.find(
      (field) =>
        field.required &&
        (form[field.key] === undefined || String(form[field.key]).trim() === ""),
    );
    if (missing) {
      setLocalError(`${missing.label} maydonini kiriting.`);
      return;
    }
    onConfirm({
      title: `${title}ga yangi yozuv qo‘shilsinmi?`,
      detail:
        "Ma’lumot serverga yoziladi va vakolatingiz audit jurnalida saqlanadi.",
      onConfirm: async () => {
        try {
          const payload =
            resource === "calendar"
              ? {
                  ...form,
                  starts_at: new Date(form.starts_at).toISOString(),
                  ends_at: new Date(form.ends_at).toISOString(),
                  status: "published",
                  confirmation: true,
                }
              : form;
          await schoolApi(schoolRoutes.resource(contextId, resource), {
            apiBase,
            token,
            contextId,
            method: "POST",
            body: payload,
          });
          setForm({});
          setShowForm(false);
          reload();
        } catch (requestError) {
          setLocalError(requestError.message);
          throw requestError;
        }
      },
    });
  };

  const createSubject = () => {
    if (!subjectForm.code.trim() || !subjectForm.name.trim()) {
      setLocalError("Fan kodi va nomini kiriting.");
      return;
    }
    onConfirm({
      title: "Yangi fan qo‘shilsinmi?",
      detail: `${subjectForm.name} fanlar ro‘yxatiga yoziladi.`,
      onConfirm: async () => {
        try {
          const data = await schoolApi(
            schoolRoutes.resource(contextId, "subjects"),
            {
              apiBase,
              token,
              contextId,
              method: "POST",
              body: {
                code: subjectForm.code.trim(),
                name: subjectForm.name.trim(),
                grade_from: Number(subjectForm.grade_from),
                grade_to: Number(subjectForm.grade_to),
                weekly_hours: subjectForm.weekly_hours
                  ? Number(subjectForm.weekly_hours)
                  : null,
                preferred_period_max: subjectForm.preferred_period_max
                  ? Number(subjectForm.preferred_period_max)
                  : null,
              },
            },
          );
          const subject = data?.subject;
          if (subject) {
            setLookups((current) => ({
              ...current,
              subjects: [...current.subjects, subject],
            }));
            setForm((current) => ({
              ...current,
              subject_id: subject.id,
            }));
          }
          setShowSubjectForm(false);
        } catch (requestError) {
          setLocalError(requestError.message);
          throw requestError;
        }
      },
    });
  };

  return (
    <div>
      <div className="school-module-toolbar">
        <div>
          <h2>{title}</h2>
          <p>{items.length} ta yozuv ko‘rsatilmoqda</p>
        </div>
        {readOnly ? (
          <span className="school-readonly-badge">
            <ShieldCheck size={15} /> Faqat ko‘rish
          </span>
        ) : (
          <button
            type="button"
            className="school-primary"
            onClick={() => setShowForm((value) => !value)}
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? "Yopish" : "Yangi qo‘shish"}
          </button>
        )}
      </div>
      <ErrorNotice error={localError || error} onRetry={reload} />
      {resource === "workloads" && !readOnly && (
        <div className="school-subject-helper">
          <span>
            Fan ro‘yxatda yo‘qmi? Avval fan yarating, so‘ng yuklamaga biriktiring.
          </span>
          <button
            type="button"
            className="school-secondary"
            onClick={() => setShowSubjectForm((value) => !value)}
          >
            <Plus size={15} /> Fan qo‘shish
          </button>
        </div>
      )}
      {resource === "workloads" && !readOnly && showSubjectForm && (
        <section className="school-card school-inline-form">
          <h3>Yangi fan</h3>
          <div className="school-form-grid">
            {[
              ["code", "Fan kodi", "text"],
              ["name", "Fan nomi", "text"],
              ["grade_from", "Qaysi sinfdan", "number"],
              ["grade_to", "Qaysi sinfgacha", "number"],
              ["weekly_hours", "Standart haftalik soat", "number"],
              ["preferred_period_max", "Tavsiya etilgan oxirgi dars", "number"],
            ].map(([key, label, type]) => (
              <label key={key}>
                {label}
                <input
                  type={type}
                  min={type === "number" ? 1 : undefined}
                  value={subjectForm[key]}
                  onChange={(event) =>
                    setSubjectForm((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                />
              </label>
            ))}
          </div>
          <button
            type="button"
            className="school-primary"
            onClick={createSubject}
          >
            <Save size={16} /> Fanni tasdiqlash
          </button>
        </section>
      )}
      {!readOnly && showForm && (
        <section className="school-card school-inline-form">
          <h3>Yangi yozuv</h3>
          <div className="school-form-grid">
            {fields.map((field) => (
              <label key={field.key}>
                {field.label}
                {field.type === "select" ? (
                  <select
                    value={form[field.key] ?? ""}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        [field.key]: event.target.value,
                      }))
                    }
                  >
                    <option value="">Tanlang</option>
                    {field.options.map((option) => (
                      <option
                        key={
                          typeof option === "object"
                            ? option.value
                            : option
                        }
                        value={
                          typeof option === "object"
                            ? option.value
                            : option
                        }
                      >
                        {typeof option === "object" ? option.label : option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type || "text"}
                    value={form[field.key] ?? ""}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        [field.key]:
                          field.type === "number"
                            ? Number(event.target.value)
                            : event.target.value,
                      }))
                    }
                  />
                )}
              </label>
            ))}
          </div>
          <button type="button" className="school-primary" onClick={create}>
            <Save size={16} /> Tasdiqlashga yuborish
          </button>
        </section>
      )}
      {loading && !items.length ? (
        <LoadingBlock />
      ) : !items.length ? (
        <EmptyState
          icon={MENU[resource]?.icon || ClipboardCheck}
          title="Hali ma’lumot yo‘q"
          text="Yangi yozuv qo‘shilgach shu yerda chiqadi."
        />
      ) : (
        <div className="school-data-list">
          {items.map((item) => (
            <article key={item.id}>
              <span className="school-data-icon">
                {resource === "calendar" ? (
                  <CalendarDays size={18} />
                ) : resource === "classes" ? (
                  <GraduationCap size={18} />
                ) : (
                  <BookOpen size={18} />
                )}
              </span>
              <div>
                <b>{resourceItemTitle(resource, item)}</b>
                <small>{resourceItemMeta(resource, item)}</small>
              </div>
              <StatusPill status={item.status || "active"} />
            </article>
          ))}
        </div>
      )}
      {hasMore && (
        <button type="button" className="school-load-more" onClick={loadMore}>
          Yana ko‘rsatish
        </button>
      )}
    </div>
  );
}

function resourceItemTitle(resource, item) {
  if (resource === "calendar") return item.title;
  if (resource === "classes")
    return item.name || `${item.grade_no}-${item.section_name}`;
  if (resource === "workloads")
    return `${item.subject_name || item.subject} · ${item.class_name || `Sinf ${item.class_id}`}`;
  return item.name || item.title || `#${item.id}`;
}

function resourceItemMeta(resource, item) {
  if (resource === "calendar") {
    return [item.event_type, item.starts_at, item.ends_at]
      .filter(Boolean)
      .join(" · ");
  }
  if (resource === "classes") {
    return [
      item.shift_no ? `${item.shift_no}-smena` : null,
      item.student_count !== undefined ? `${item.student_count} o‘quvchi` : null,
      item.room_name,
    ]
      .filter(Boolean)
      .join(" · ");
  }
  if (resource === "workloads") {
    return [
      item.teacher_name,
      item.weekly_hours ? `${item.weekly_hours} soat/hafta` : null,
    ]
      .filter(Boolean)
      .join(" · ");
  }
  return "";
}

function dateRange(
  start,
  end,
  { workDays = [1, 2, 3, 4, 5, 6], excludedDates = new Set() } = {},
) {
  const dates = [];
  const current = new Date(`${start}T12:00:00`);
  const last = new Date(`${end}T12:00:00`);
  while (current <= last && dates.length < 120) {
    const weekday = current.getDay() || 7;
    const local = new Date(
      current.getTime() - current.getTimezoneOffset() * 60_000,
    );
    const dateKey = local.toISOString().slice(0, 10);
    if (workDays.includes(weekday) && !excludedDates.has(dateKey)) {
      dates.push(dateKey);
    }
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function CalendarPage({
  apiBase,
  token,
  contextId,
  school,
  canEdit = false,
  onConfirm,
}) {
  const [slots, setSlots] = useState([]);
  const [holidayDates, setHolidayDates] = useState(new Set());
  const [showMakeup, setShowMakeup] = useState(false);
  const [form, setForm] = useState({
    slot_id: "",
    lesson_date: todayValue(),
    reason: "Bayram yoki uzrli sabab tufayli dars o‘tilmadi",
    candidate_from: todayValue(),
    candidate_to: (() => {
      const date = new Date();
      date.setDate(date.getDate() + 14);
      return date.toISOString().slice(0, 10);
    })(),
    allow_topic_compression: false,
    max_extra_lessons_per_class_per_day: 1,
  });
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const workDays = useMemo(
    () =>
      Array.isArray(school?.work_days) && school.work_days.length
        ? school.work_days.map(Number)
        : [1, 2, 3, 4, 5, 6],
    [school?.work_days],
  );
  const candidateDates = useMemo(
    () =>
      dateRange(form.candidate_from, form.candidate_to, {
        workDays,
        excludedDates: holidayDates,
      }),
    [
      form.candidate_from,
      form.candidate_to,
      holidayDates,
      workDays,
    ],
  );

  useEffect(() => {
    if (!showMakeup || slots.length) return;
    fetchAllById(schoolRoutes.resource(contextId, "timetable"), {
      apiBase,
      token,
      contextId,
      limit: 500,
      maxPages: 12,
    })
      .then((data) => {
        setSlots(data.items || []);
        if (!data.complete) {
          setError(
            "Haftalik jadvalning hammasi yuklanmadi; qoplov uchun aniq darsni topish cheklanishi mumkin.",
          );
        }
      })
      .catch((requestError) => setError(requestError.message));
  }, [apiBase, contextId, showMakeup, slots.length, token]);

  useEffect(() => {
    if (!canEdit) return undefined;
    let active = true;
    fetchAllById(schoolRoutes.resource(contextId, "calendar"), {
      apiBase,
      token,
      contextId,
      limit: 200,
      maxPages: 12,
    })
      .then((data) => {
        if (!active) return;
        setHolidayDates(
          new Set(
            (data.items || [])
              .filter(
                (item) =>
                  item.event_type === "holiday" &&
                  item.status === "published",
              )
              .map((item) =>
                String(item.starts_at || "").slice(0, 10),
              )
              .filter(Boolean),
          ),
        );
        if (!data.complete) {
          setError(
            "Bayramlar ro‘yxatining hammasi olinmadi; qoplov sanasini alohida tekshiring.",
          );
        }
      })
      .catch((requestError) => setError(requestError.message));
    return () => {
      active = false;
    };
  }, [apiBase, canEdit, contextId, token]);

  const requestPayload = (confirmation = false) => ({
    cancellations: [
      {
        slot_id: Number(form.slot_id),
        lesson_date: form.lesson_date,
        reason: form.reason.trim(),
      },
    ],
    candidate_dates: candidateDates,
    allow_topic_compression: false,
    max_extra_lessons_per_class_per_day: Number(
      form.max_extra_lessons_per_class_per_day,
    ),
    confirmation,
  });

  const runPreview = async () => {
    if (!form.slot_id || form.reason.trim().length < 2) {
      setError("Bekor bo‘lgan dars va sababni tanlang.");
      return;
    }
    if (form.candidate_from > form.candidate_to) {
      setError("Qoplov sanalari oralig‘ini tekshiring.");
      return;
    }
    const selectedSlot = slots.find(
      (slot) => Number(slot.id) === Number(form.slot_id),
    );
    const selectedDateWeekday =
      new Date(`${form.lesson_date}T12:00:00`).getDay() || 7;
    if (
      selectedSlot &&
      Number(selectedSlot.weekday) !== Number(selectedDateWeekday)
    ) {
      setError(
        "O‘tilmay qolgan sana tanlangan haftalik dars kuniga mos emas.",
      );
      return;
    }
    if (!candidateDates.length) {
      setError(
        "Tanlangan oraliqda maktabning ish kuni va bayram bo‘lmagan sana topilmadi.",
      );
      return;
    }
    setBusy(true);
    setError("");
    try {
      const data = await schoolApi(schoolRoutes.calendarMakeupPreview, {
        apiBase,
        token,
        contextId,
        method: "POST",
        body: requestPayload(false),
      });
      setPreview(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const publish = () => {
    if (!preview?.ready_to_publish || preview?.hard_conflicts?.length) return;
    onConfirm({
      title: "Qoplov darslari kalendarga e’lon qilinsinmi?",
      detail:
        "Tanlangan sanadagi asl dars “bekor qilingan” istisno sifatida saqlanadi. Qoplov alohida sanali yozuv bo‘ladi; haftalik jadval o‘zgarmaydi.",
      onConfirm: async () => {
        try {
          await schoolApi(schoolRoutes.calendarMakeupConfirm, {
            apiBase,
            token,
            contextId,
            method: "POST",
            body: requestPayload(true),
          });
          setPreview(null);
          setShowMakeup(false);
        } catch (requestError) {
          setError(requestError.message);
          throw requestError;
        }
      },
    });
  };

  return (
    <div>
      {canEdit && (
        <section className="school-card school-makeup-card">
        <div className="school-card-title">
          <div>
            <span className="school-eyebrow">QOPLOV VA TIG‘IZLASHTIRISH</span>
            <h2>Bekor bo‘lgan darslarni qayta joylash</h2>
          </div>
          <button
            type="button"
            className="school-secondary"
            onClick={() => setShowMakeup((value) => !value)}
          >
            {showMakeup ? <X size={15} /> : <Sparkles size={15} />}
            {showMakeup ? "Yopish" : "Reja tayyorlash"}
          </button>
        </div>
        <p className="school-muted">
          Bu amal haftalik jadvalni o‘zgartirmaydi. Asl darsning aniq sanasi,
          qoplovning yangi sanasi va holati alohida saqlanadi.
        </p>
        {showMakeup && (
          <>
            <ErrorNotice error={error} />
            <div className="school-form-grid">
              <label className="wide">
                Bekor bo‘lgan haftalik dars
                <select
                  value={form.slot_id}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      slot_id: event.target.value,
                    }))
                  }
                >
                  <option value="">Tanlang</option>
                  {slots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.weekday}-kun · {slot.period_no}-soat ·{" "}
                      {slot.subject_name} · {slot.section_name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Asl dars o‘tilmay qolgan sana
                <input
                  type="date"
                  value={form.lesson_date}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      lesson_date: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Sababi
                <input
                  value={form.reason}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      reason: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Qoplov izlash: dan
                <input
                  type="date"
                  value={form.candidate_from}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      candidate_from: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Qoplov izlash: gacha
                <input
                  type="date"
                  value={form.candidate_to}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      candidate_to: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <InfoNotice>
              <b>Mavzuni tig‘izlashtirish hozir o‘chiq</b>
              <p>
                Barqaror mavzu identifikatorlari ulanmaguncha tizim faqat
                alohida qoplov sanasini taklif qiladi; mavzularni avtomatik
                birlashtirmaydi.
              </p>
            </InfoNotice>
            <div className="school-calendar-safety">
              <span>
                <b>{candidateDates.length}</b>
                <small>mos ish kuni</small>
              </span>
              <span>
                <b>
                  {workDays
                    .map(
                      (value) =>
                        WEEKDAYS.find((day) => day.value === Number(value))
                          ?.short,
                    )
                    .filter(Boolean)
                    .join(", ")}
                </b>
                <small>maktab ish kunlari</small>
              </span>
              <span>
                <b>{holidayDates.size}</b>
                <small>chiqarib tashlangan bayram sanasi</small>
              </span>
            </div>
            <button
              type="button"
              className="school-primary"
              disabled={busy}
              onClick={runPreview}
            >
              {busy ? (
                <Loader2 size={15} className="school-spin" />
              ) : (
                <Sparkles size={15} />
              )}
              Qoralamani ko‘rish
            </button>
            {preview && (
              <div className="school-makeup-preview">
                <div className="school-draft-stats">
                  <span>
                    <b>{preview.placements?.length || 0}</b>
                    <small>joylashtirish</small>
                  </span>
                  <span>
                    <b>{preview.hard_conflicts?.length || 0}</b>
                    <small>majburiy ziddiyat</small>
                  </span>
                  <span>
                    <b>{preview.warnings?.length || 0}</b>
                    <small>tavsiya</small>
                  </span>
                </div>
                {(preview.placements || []).map((item, index) => (
                  <div className="school-makeup-move" key={index}>
                    <CalendarDays size={16} />
                    <span>
                      <b>{item.subject}</b>
                      <small>
                        Asl sana: {item.original_date} · Qoplov:{" "}
                        {item.target_date} ·{" "}
                        {item.period}-soat ·{" "}
                        {item.mode === "compressed"
                          ? "tig‘izlashtirish"
                          : "qoplov"}
                      </small>
                    </span>
                  </div>
                ))}
                {(preview.hard_conflicts || []).map((item, index) => (
                  <div className="school-makeup-conflict" key={index}>
                    <AlertTriangle size={16} />
                    <span>{item.message || item.code}</span>
                  </div>
                ))}
                <button
                  type="button"
                  className="school-primary"
                  disabled={
                    !preview.ready_to_publish ||
                    Boolean(preview.hard_conflicts?.length)
                  }
                  onClick={publish}
                >
                  <BadgeCheck size={16} /> Tekshirdim, kalendarga e’lon qilish
                </button>
              </div>
            )}
          </>
        )}
        </section>
      )}
      <ResourcePage
        apiBase={apiBase}
        token={token}
        contextId={contextId}
        resource="calendar"
        title="Kalendar voqealari"
        readOnly={!canEdit}
        onConfirm={onConfirm}
      />
    </div>
  );
}

function TeachersPage({
  apiBase,
  token,
  contextId,
  canInvite = false,
  canEditAvailability = false,
  onConfirm,
}) {
  const { items, loading, error, hasMore, reload, loadMore } = usePagedResource({
    apiBase,
    token,
    contextId,
    resource: "staff",
  });
  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    role_key: "teacher",
    group_id: "",
    method_day: "",
    available_shift: "both",
    max_daily_lessons: 6,
  });
  const [inviteCode, setInviteCode] = useState("");
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [localError, setLocalError] = useState("");
  const [availabilityTarget, setAvailabilityTarget] = useState(null);
  const [availabilityLoaded, setAvailabilityLoaded] = useState(false);
  const [qualificationTarget, setQualificationTarget] = useState(null);
  const [qualification, setQualification] = useState({
    subject_ids: [],
    grade_from: 1,
    grade_to: 11,
  });
  const [availability, setAvailability] = useState({
    method_day: "",
    max_daily_periods: 6,
    max_weekly_periods: 36,
    preferred_shift: "",
    avoid_first_period: false,
    rows: [],
  });

  useEffect(() => {
    fetchAllById(schoolRoutes.resource(contextId, "classes"), {
      apiBase,
      token,
      contextId,
      limit: 200,
      maxPages: 5,
    })
      .then((data) => setSections(data?.items || []))
      .catch((requestError) => setLocalError(requestError.message));
  }, [apiBase, contextId, token]);

  const loadManagerData = useCallback(async () => {
    if (!canInvite) return;
    try {
      const [subjectData, requestData] = await Promise.all([
        fetchAllById(schoolRoutes.resource(contextId, "subjects"), {
          apiBase,
          token,
          contextId,
          limit: 200,
          maxPages: 5,
        }),
        fetchAllById(schoolRoutes.joinRequests, {
          apiBase,
          token,
          contextId,
          limit: 200,
          maxPages: 10,
        }),
      ]);
      setSubjects(subjectData?.items || []);
      setJoinRequests(requestData.items || []);
      if (!requestData.complete) {
        setLocalError(
          "Kutilayotgan so‘rovlarning barchasi yuklanmadi; avval ko‘rinayotganlarini ko‘rib chiqing.",
        );
      }
    } catch (requestError) {
      setLocalError(requestError.message);
    }
  }, [apiBase, canInvite, contextId, token]);

  useEffect(() => {
    loadManagerData();
  }, [loadManagerData]);

  const submit = () => {
    if (form.full_name.trim().length < 3) {
      setLocalError("Xodimning F.I.Sh. ma’lumotini kiriting.");
      return;
    }
    onConfirm({
      title: "Xodim taklif kodi yaratilsinmi?",
      detail: `${form.full_name} uchun ${SCHOOL_ROLES[form.role_key] || form.role_key} roli taklif qilinadi. Vakolat faqat kod qabul qilingach faollashadi.`,
      onConfirm: async () => {
        try {
          const data = await schoolApi(schoolRoutes.staffInvites, {
            apiBase,
            token,
            contextId,
            method: "POST",
            body: {
              role_key: form.role_key,
              group_id: form.group_id ? Number(form.group_id) : null,
              full_name: form.full_name.trim(),
              phone: form.phone.trim() || null,
              method_day: form.method_day
                ? Number(form.method_day)
                : null,
              available_shift: form.available_shift,
              max_daily_lessons: Number(form.max_daily_lessons),
              confirmation: true,
            },
          });
          setInviteCode(data?.invite_code || "");
          setForm((current) => ({
            ...current,
            full_name: "",
            phone: "",
            group_id: "",
          }));
          reload();
        } catch (requestError) {
          setLocalError(requestError.message);
          throw requestError;
        }
      },
    });
  };

  const saveAvailability = () => {
    if (!availabilityTarget?.user_id) return;
    if (!availabilityLoaded) {
      setLocalError("Bandlik ma’lumotlari to‘liq yuklanishini kuting.");
      return;
    }
    if (
      availability.rows.some(
        (row) => Number(row.period_to) < Number(row.period_from),
      )
    ) {
      setLocalError("Bandlik qatorida oxirgi dars birinchi darsdan oldin.");
      return;
    }
    onConfirm({
      title: "O‘qituvchining bandligi saqlansinmi?",
      detail:
        "Metod kuni va yuklama cheklovlari keyingi jadval generatsiyasida majburiy hisobga olinadi.",
      onConfirm: async () => {
        try {
          await schoolApi(
            schoolRoutes.staffAvailability(availabilityTarget.user_id),
            {
              apiBase,
              token,
              contextId,
              method: "PUT",
              body: {
                method_day: availability.method_day
                  ? Number(availability.method_day)
                  : null,
                max_daily_periods: Number(availability.max_daily_periods),
                max_weekly_periods: Number(availability.max_weekly_periods),
                preferred_shift: availability.preferred_shift
                  ? Number(availability.preferred_shift)
                  : null,
                avoid_first_period: availability.avoid_first_period,
                rows: availability.rows.map((row) => ({
                  weekday: Number(row.weekday),
                  shift_no: Number(row.shift_no),
                  period_from: Number(row.period_from),
                  period_to: Number(row.period_to),
                  availability: row.availability,
                  note: row.note?.trim() || null,
                })),
              },
            },
          );
          setAvailabilityTarget(null);
        } catch (requestError) {
          setLocalError(requestError.message);
          throw requestError;
        }
      },
    });
  };

  const saveQualification = () => {
    if (!qualificationTarget?.user_id || !qualification.subject_ids.length) {
      setLocalError("O‘qituvchi uchun kamida bitta fan tanlang.");
      return;
    }
    if (Number(qualification.grade_to) < Number(qualification.grade_from)) {
      setLocalError("Sinf oralig‘ini tekshiring.");
      return;
    }
    onConfirm({
      title: "O‘qituvchining fan vakolati saqlansinmi?",
      detail: `${qualificationTarget.full_name} tanlangan fanlarni ${qualification.grade_from}–${qualification.grade_to}-sinflarda o‘ta oladi.`,
      onConfirm: async () => {
        try {
          await schoolApi(schoolRoutes.staffAssign, {
            apiBase,
            token,
            contextId,
            method: "POST",
            body: {
              user_id: Number(qualificationTarget.user_id),
              role_key: qualificationTarget.role_key,
              group_id: qualificationTarget.group_id
                ? Number(qualificationTarget.group_id)
                : null,
              subject_ids: qualification.subject_ids.map(Number),
              grade_from: Number(qualification.grade_from),
              grade_to: Number(qualification.grade_to),
              confirmation: true,
            },
          });
          setQualificationTarget(null);
          setQualification({
            subject_ids: [],
            grade_from: 1,
            grade_to: 11,
          });
          reload();
        } catch (requestError) {
          setLocalError(requestError.message);
          throw requestError;
        }
      },
    });
  };

  const decideJoinRequest = (request, approve) => {
    onConfirm({
      title: approve
        ? "Maktabga qo‘shilish so‘rovi tasdiqlansinmi?"
        : "Maktabga qo‘shilish so‘rovi rad etilsinmi?",
      detail: `${request.full_name} · ${SCHOOL_ROLES[request.role_key] || request.role_key}. Qaror audit tarixida qoladi.`,
      onConfirm: async () => {
        try {
          await schoolApi(
            schoolRoutes.joinRequestDecision(request.id),
            {
              apiBase,
              token,
              contextId,
              method: "POST",
              body: { approve, confirmation: true },
            },
          );
          await Promise.all([loadManagerData(), reload()]);
        } catch (requestError) {
          setLocalError(requestError.message);
          throw requestError;
        }
      },
    });
  };

  return (
    <div>
      <div className="school-module-toolbar">
        <div>
          <h2>Xodimlar, metod kuni va bo‘sh vaqt</h2>
          <p>Jadval generatori faqat tasdiqlangan bandlikdan foydalanadi.</p>
        </div>
        {canInvite ? (
          <button
            type="button"
            className="school-primary"
            onClick={() => setShowInvite((value) => !value)}
          >
            <UserPlus size={16} /> Xodim taklif qilish
          </button>
        ) : (
          <span className="school-readonly-badge">
            <ShieldCheck size={15} /> Faqat ko‘rish
          </span>
        )}
      </div>
      <ErrorNotice error={localError || error} onRetry={reload} />
      {canInvite && showInvite && (
        <section className="school-card school-inline-form">
          <h3>Xodim va boshlang‘ich bandlik</h3>
          <div className="school-form-grid">
            <label>
              F.I.Sh.
              <input
                value={form.full_name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    full_name: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              Telefon (ixtiyoriy)
              <input
                value={form.phone}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              Lavozim
              <select
                value={form.role_key}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    role_key: event.target.value,
                  }))
                }
              >
                {Object.entries(SCHOOL_ROLES)
                  .filter(([value]) => value !== "system_admin")
                  .map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              Sinf (ixtiyoriy)
              <select
                value={form.group_id}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    group_id: event.target.value,
                  }))
                }
              >
                <option value="">Umumiy maktab roli</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.group_id}>
                    {section.grade_no}-{section.section_name} ·{" "}
                    {section.shift_no}-smena
                  </option>
                ))}
              </select>
            </label>
            <label>
              Metod kuni
              <select
                value={form.method_day}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    method_day: event.target.value,
                  }))
                }
              >
                <option value="">Belgilanmagan</option>
                {WEEKDAYS.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Ishlaydigan smena (majburiy)
              <select
                value={form.available_shift}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    available_shift: event.target.value,
                  }))
                }
              >
                <option value="both">Ikkala smena</option>
                <option value="1">Faqat 1-smena</option>
                <option value="2">Faqat 2-smena</option>
              </select>
            </label>
            <label>
              Kunlik eng ko‘p dars
              <input
                type="number"
                min="1"
                max="7"
                value={form.max_daily_lessons}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    max_daily_lessons: Number(event.target.value),
                  }))
                }
              />
            </label>
          </div>
          <button type="button" className="school-primary" onClick={submit}>
            <ShieldCheck size={16} /> Taklifni tekshirish
          </button>
        </section>
      )}
      {inviteCode && (
        <section className="school-card school-invite-code">
          <div>
            <span className="school-eyebrow">BIR MARTALIK TAKLIF KODI</span>
            <h2>{inviteCode}</h2>
            <p>
              Kodni faqat kerakli xodimga yuboring. Serverda kodning o‘zi emas,
              himoyalangan xeshi saqlanadi.
            </p>
          </div>
          <button
            type="button"
            className="school-secondary"
            onClick={() => {
              navigator.clipboard?.writeText(inviteCode);
            }}
          >
            Nusxalash
          </button>
        </section>
      )}
      {canInvite && joinRequests.length > 0 && (
        <section className="school-card">
          <div className="school-card-title">
            <div>
              <span className="school-eyebrow">KUTILAYOTGAN SO‘ROVLAR</span>
              <h2>Maktabga qo‘shilishni tekshirish</h2>
            </div>
            <span className="school-count-badge">{joinRequests.length}</span>
          </div>
          <div className="school-data-list">
            {joinRequests.map((request) => (
              <article key={request.id}>
                <span className="school-avatar-initial">
                  {(request.full_name || "?").slice(0, 1)}
                </span>
                <div>
                  <b>{request.full_name}</b>
                  <small>
                    {SCHOOL_ROLES[request.role_key] || request.role_key}
                  </small>
                </div>
                <div className="school-row-actions">
                  <button
                    type="button"
                    className="school-secondary"
                    onClick={() => decideJoinRequest(request, false)}
                  >
                    Rad etish
                  </button>
                  <button
                    type="button"
                    className="school-primary"
                    onClick={() => decideJoinRequest(request, true)}
                  >
                    <Check size={15} /> Tasdiqlash
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
      {canInvite && qualificationTarget && (
        <section className="school-card school-inline-form">
          <div className="school-card-title">
            <div>
              <span className="school-eyebrow">FAN VAKOLATI</span>
              <h2>{qualificationTarget.full_name}</h2>
            </div>
            <button
              type="button"
              className="school-icon-button"
              aria-label="Fan biriktirish oynasini yopish"
              onClick={() => setQualificationTarget(null)}
            >
              <X size={16} />
            </button>
          </div>
          <p className="school-muted">
            Jadvalga yuklama qo‘shishdan oldin o‘qituvchi qaysi fan va
            sinflarda dars bera olishini belgilang.
          </p>
          <div className="school-form-grid">
            <label>
              Qaysi sinfdan
              <input
                type="number"
                min="1"
                max="11"
                value={qualification.grade_from}
                onChange={(event) =>
                  setQualification((current) => ({
                    ...current,
                    grade_from: Number(event.target.value),
                  }))
                }
              />
            </label>
            <label>
              Qaysi sinfgacha
              <input
                type="number"
                min="1"
                max="11"
                value={qualification.grade_to}
                onChange={(event) =>
                  setQualification((current) => ({
                    ...current,
                    grade_to: Number(event.target.value),
                  }))
                }
              />
            </label>
          </div>
          <div className="school-choice-grid compact">
            {subjects.map((subject) => {
              const checked = qualification.subject_ids.includes(subject.id);
              return (
                <label
                  className={`school-choice-card ${checked ? "selected" : ""}`}
                  key={subject.id}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) =>
                      setQualification((current) => ({
                        ...current,
                        subject_ids: event.target.checked
                          ? [...current.subject_ids, subject.id]
                          : current.subject_ids.filter(
                              (subjectId) => subjectId !== subject.id,
                            ),
                      }))
                    }
                  />
                  <span>
                    <b>{subject.name}</b>
                    <small>
                      {subject.grade_from}–{subject.grade_to}-sinflar
                    </small>
                  </span>
                </label>
              );
            })}
          </div>
          {!subjects.length && (
            <p className="school-muted">
              Avval “Fan va yuklama” bo‘limida fan yarating.
            </p>
          )}
          <button
            type="button"
            className="school-primary"
            onClick={saveQualification}
          >
            <Save size={16} /> Fan vakolatini saqlash
          </button>
        </section>
      )}
      {canEditAvailability && availabilityTarget && (
        <section className="school-card school-inline-form">
          <div className="school-card-title">
            <div>
              <span className="school-eyebrow">BANDLIK</span>
              <h2>{availabilityTarget.full_name}</h2>
            </div>
            <button
              type="button"
              className="school-icon-button"
              onClick={() => setAvailabilityTarget(null)}
            >
              <X size={16} />
            </button>
          </div>
          <div className="school-form-grid">
            <label>
              Metod kuni
              <select
                value={availability.method_day}
                onChange={(event) =>
                  setAvailability((current) => ({
                    ...current,
                    method_day: event.target.value,
                  }))
                }
              >
                <option value="">Belgilanmagan</option>
                {WEEKDAYS.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Ustuvor smena (yumshoq mezon)
              <select
                value={availability.preferred_shift}
                onChange={(event) =>
                  setAvailability((current) => ({
                    ...current,
                    preferred_shift: event.target.value,
                  }))
                }
              >
                <option value="">Farqi yo‘q</option>
                <option value="1">Imkon bo‘lsa 1-smena</option>
                <option value="2">Imkon bo‘lsa 2-smena</option>
              </select>
            </label>
            <label>
              Kunlik eng ko‘p dars
              <input
                type="number"
                min="1"
                max="7"
                value={availability.max_daily_periods}
                onChange={(event) =>
                  setAvailability((current) => ({
                    ...current,
                    max_daily_periods: Number(event.target.value),
                  }))
                }
              />
            </label>
            <label>
              Haftalik eng ko‘p dars
              <input
                type="number"
                min="1"
                max="72"
                value={availability.max_weekly_periods}
                onChange={(event) =>
                  setAvailability((current) => ({
                    ...current,
                    max_weekly_periods: Number(event.target.value),
                  }))
                }
              />
            </label>
          </div>
          <label className="school-check-row">
            <input
              type="checkbox"
              checked={availability.avoid_first_period}
              onChange={(event) =>
                setAvailability((current) => ({
                  ...current,
                  avoid_first_period: event.target.checked,
                }))
              }
            />
            Iloji bo‘lsa 1-soatga dars qo‘ymaslik
          </label>
          <div className="school-availability-head">
            <div>
              <b>Haftalik bo‘sh va band vaqtlar</b>
              <small>
                “Band” qat’iy blok. “Ruxsat etilgan” qatori bo‘lsa, dars faqat
                shu oraliqlarga tushadi. “Ustuvor” yumshoq tavsiya.
              </small>
            </div>
            <button
              type="button"
              className="school-secondary"
              onClick={() =>
                setAvailability((current) => ({
                  ...current,
                  rows: [
                    ...current.rows,
                    {
                      weekday: 1,
                      shift_no: 1,
                      period_from: 1,
                      period_to: 1,
                      availability: "unavailable",
                      note: "",
                    },
                  ],
                }))
              }
            >
              <Plus size={15} /> Vaqt qo‘shish
            </button>
          </div>
          <div className="school-availability-list">
            {availability.rows.map((row, rowIndex) => (
              <div className="school-availability-row" key={row.id || rowIndex}>
                <label>
                  Kun
                  <select
                    value={row.weekday}
                    onChange={(event) =>
                      setAvailability((current) => ({
                        ...current,
                        rows: current.rows.map((item, index) =>
                          index === rowIndex
                            ? { ...item, weekday: Number(event.target.value) }
                            : item,
                        ),
                      }))
                    }
                  >
                    {WEEKDAYS.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Smena
                  <select
                    value={row.shift_no}
                    onChange={(event) =>
                      setAvailability((current) => ({
                        ...current,
                        rows: current.rows.map((item, index) =>
                          index === rowIndex
                            ? { ...item, shift_no: Number(event.target.value) }
                            : item,
                        ),
                      }))
                    }
                  >
                    <option value="1">1-smena</option>
                    <option value="2">2-smena</option>
                  </select>
                </label>
                <label>
                  Dan
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={row.period_from}
                    onChange={(event) =>
                      setAvailability((current) => ({
                        ...current,
                        rows: current.rows.map((item, index) =>
                          index === rowIndex
                            ? {
                                ...item,
                                period_from: Number(event.target.value),
                              }
                            : item,
                        ),
                      }))
                    }
                  />
                </label>
                <label>
                  Gacha
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={row.period_to}
                    onChange={(event) =>
                      setAvailability((current) => ({
                        ...current,
                        rows: current.rows.map((item, index) =>
                          index === rowIndex
                            ? {
                                ...item,
                                period_to: Number(event.target.value),
                              }
                            : item,
                        ),
                      }))
                    }
                  />
                </label>
                <label>
                  Holat
                  <select
                    value={row.availability}
                    onChange={(event) =>
                      setAvailability((current) => ({
                        ...current,
                        rows: current.rows.map((item, index) =>
                          index === rowIndex
                            ? {
                                ...item,
                                availability: event.target.value,
                              }
                            : item,
                        ),
                      }))
                    }
                  >
                    <option value="unavailable">
                      Band — dars qo‘yilmaydi
                    </option>
                    <option value="preferred">
                      Ustuvor — imkon bo‘lsa tanlanadi
                    </option>
                    <option value="available">
                      Ruxsat etilgan — qat’iy vaqt oralig‘i
                    </option>
                  </select>
                </label>
                <label className="school-availability-note">
                  Izoh
                  <input
                    value={row.note || ""}
                    maxLength={300}
                    onChange={(event) =>
                      setAvailability((current) => ({
                        ...current,
                        rows: current.rows.map((item, index) =>
                          index === rowIndex
                            ? { ...item, note: event.target.value }
                            : item,
                        ),
                      }))
                    }
                  />
                </label>
                <button
                  type="button"
                  className="school-icon-button"
                  aria-label="Bandlik qatorini o‘chirish"
                  onClick={() =>
                    setAvailability((current) => ({
                      ...current,
                      rows: current.rows.filter(
                        (_, index) => index !== rowIndex,
                      ),
                    }))
                  }
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="school-primary"
            disabled={!availabilityLoaded}
            onClick={saveAvailability}
          >
            <Save size={16} /> Bandlikni tasdiqlash
          </button>
        </section>
      )}
      {loading && !items.length ? (
        <LoadingBlock />
      ) : !items.length ? (
        <EmptyState
          icon={Users}
          title="Hali xodim qo‘shilmagan"
          text="Xodim uchun himoyalangan taklif kodi yarating; u kodni qabul qilgach roli faollashadi."
        />
      ) : (
        <div className="school-data-list">
          {items.map((teacher) => (
            <article key={teacher.id}>
              <span className="school-avatar-initial">
                {(teacher.full_name || teacher.name || "?").slice(0, 1)}
              </span>
              <div>
                <b>{teacher.full_name || teacher.name}</b>
                <small>
                  {[
                    SCHOOL_ROLES[teacher.role_key] || teacher.role_key,
                    teacher.method_day_label
                      ? `Metod kuni: ${teacher.method_day_label}`
                      : null,
                    teacher.available_shift
                      ? `Smena: ${teacher.available_shift}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </small>
              </div>
              {teacher.status === "active" &&
              ["teacher", "homeroom_teacher"].includes(teacher.role_key) &&
              (canInvite || canEditAvailability) ? (
                <div className="school-row-actions">
                  {canInvite && (
                    <button
                      type="button"
                      className="school-secondary"
                      onClick={() => {
                        setQualificationTarget(teacher);
                        setQualification({
                          subject_ids: [],
                          grade_from: 1,
                          grade_to: 11,
                        });
                      }}
                    >
                      Fanlar
                    </button>
                  )}
                  {canEditAvailability && (
                    <button
                      type="button"
                      className="school-secondary"
                      onClick={() => {
                        setAvailabilityTarget(teacher);
                        setAvailabilityLoaded(false);
                        schoolApi(
                          schoolRoutes.staffAvailability(teacher.user_id),
                          { apiBase, token, contextId },
                        )
                          .then((data) => {
                            const settings = data?.settings || {};
                            setAvailability({
                              method_day: settings.method_day || "",
                              max_daily_periods:
                                settings.max_daily_periods || 6,
                              max_weekly_periods:
                                settings.max_weekly_periods || 36,
                              preferred_shift:
                                settings.preferred_shift || "",
                              avoid_first_period:
                                settings.avoid_first_period || false,
                              rows: data?.rows || [],
                            });
                            setAvailabilityLoaded(true);
                          })
                          .catch((requestError) =>
                            setLocalError(requestError.message),
                          );
                      }}
                    >
                      Bandlik
                    </button>
                  )}
                </div>
              ) : (
                <StatusPill status={teacher.status || "active"} />
              )}
            </article>
          ))}
        </div>
      )}
      {hasMore && (
        <button type="button" className="school-load-more" onClick={loadMore}>
          Yana ko‘rsatish
        </button>
      )}
    </div>
  );
}

function BuildingsPage({
  apiBase,
  token,
  contextId,
  readOnly = false,
  onConfirm,
}) {
  const { items, loading, error, hasMore, reload, loadMore } = usePagedResource({
    apiBase,
    token,
    contextId,
    resource: "buildings",
  });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    floors: 2,
    rooms_per_floor: 8,
    entrance_side: "center",
  });
  const [localError, setLocalError] = useState("");
  const save = () => {
    if (!form.name.trim()) {
      setLocalError("Bino nomini kiriting.");
      return;
    }
    onConfirm({
      title: "Yangi bino va xona sxemasi yaratilsinmi?",
      detail: `${form.name}: ${form.floors} qavat, har qavatda ${form.rooms_per_floor} ta reja xona.`,
      onConfirm: async () => {
        try {
          await schoolApi(schoolRoutes.resource(contextId, "buildings"), {
            apiBase,
            token,
            contextId,
            method: "POST",
            body: {
              name: form.name.trim(),
              building_order: items.length + 1,
              entrance_side: form.entrance_side,
              floors: Array.from(
                { length: Number(form.floors) },
                (_, floorIndex) => {
                  const floorNumber = floorIndex + 1;
                  return {
                    floor_number: floorNumber,
                    name: `${floorNumber}-qavat`,
                    rooms: Array.from(
                      { length: Number(form.rooms_per_floor) },
                      (_, roomIndex) => {
                        const roomNumber =
                          floorNumber * 100 + roomIndex + 1;
                        return {
                          room_number: String(roomNumber),
                          name: `${roomNumber}-xona`,
                          room_type: "classroom",
                          capacity: 30,
                          // Older backends persist only room.position; keeping
                          // the selected entrance on every room preserves the
                          // building-level choice without guessing on reload.
                          position: form.entrance_side,
                        };
                      },
                    ),
                  };
                },
              ),
            },
          });
          setShowForm(false);
          reload();
        } catch (requestError) {
          setLocalError(requestError.message);
          throw requestError;
        }
      },
    });
  };
  return (
    <div>
      <div className="school-module-toolbar">
        <div>
          <h2>Virtual maktab</h2>
          <p>
            WebGLsiz yengil sxema: bino, qavat, xona va kirish joyi ko‘rinadi.
          </p>
        </div>
        {readOnly ? (
          <span className="school-readonly-badge">
            <ShieldCheck size={15} /> Faqat ko‘rish
          </span>
        ) : (
          <button
            type="button"
            className="school-primary"
            onClick={() => setShowForm((value) => !value)}
          >
            <Plus size={16} /> Bino qo‘shish
          </button>
        )}
      </div>
      <ErrorNotice error={localError || error} onRetry={reload} />
      {!readOnly && showForm && (
        <section className="school-card school-inline-form">
          <div className="school-form-grid">
            <label>
              Bino nomi
              <input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
              />
            </label>
            <label>
              Qavat
              <input
                type="number"
                min="1"
                max="12"
                value={form.floors}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    floors: Number(event.target.value),
                  }))
                }
              />
            </label>
            <label>
              Har qavatdagi xona
              <input
                type="number"
                min="1"
                max="50"
                value={form.rooms_per_floor}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    rooms_per_floor: Number(event.target.value),
                  }))
                }
              />
            </label>
            <label>
              Kirish joyi
              <select
                value={form.entrance_side}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    entrance_side: event.target.value,
                  }))
                }
              >
                <option value="left">Chapda</option>
                <option value="center">O‘rtada</option>
                <option value="right">O‘ngda</option>
              </select>
            </label>
          </div>
          <button type="button" className="school-primary" onClick={save}>
            <Save size={16} /> Tasdiqlashga yuborish
          </button>
        </section>
      )}
      {loading && !items.length ? (
        <LoadingBlock />
      ) : (
        <div className="school-virtual-campus">
          {items.map((building) => (
            <article key={building.id}>
              <MiniBuilding building={building} rooms={building.rooms} />
              <div className="school-campus-meta">
                <b>{building.name}</b>
                <small>
                  {Array.isArray(building.floors)
                    ? building.floors.length
                    : building.floors}{" "}
                  qavat ·{" "}
                  {building.room_count ||
                    (Array.isArray(building.floors)
                      ? building.floors.reduce(
                          (sum, floor) => sum + (floor.rooms?.length || 0),
                          0,
                        )
                      : Number(building.floors) *
                        Number(building.rooms_per_floor || 0))}{" "}
                  xona
                  {" · "}kirish:{" "}
                  {{
                    left: "chap",
                    center: "o‘rta",
                    right: "o‘ng",
                  }[persistedBuildingEntrance(building)]}
                </small>
              </div>
            </article>
          ))}
        </div>
      )}
      {!loading && !items.length && (
        <EmptyState
          icon={Building2}
          title="Bino sxemasi hali yo‘q"
          text="Bino qo‘shilgach virtual ko‘rinish avtomatik chiziladi."
        />
      )}
      {hasMore && (
        <button type="button" className="school-load-more" onClick={loadMore}>
          Yana ko‘rsatish
        </button>
      )}
    </div>
  );
}

function savedMaxPeriodsByShift(school) {
  const rows = school?.bell_schedule?.shifts || [];
  if (rows.length) {
    return Object.fromEntries(
      rows.map((row) => [
        Number(row.shift_no || row.number),
        Number(row.max_lessons),
      ]),
    );
  }
  const fallback =
    Number(school?.bell_schedule?.max_periods_per_shift) ||
    (Number(school?.shift_count) === 2 ? 6 : 7);
  return {
    1: fallback,
    ...(Number(school?.shift_count) === 2 ? { 2: fallback } : {}),
  };
}

function TimetablePage({
  apiBase,
  token,
  contextId,
  school,
  canEdit = false,
  onConfirm,
}) {
  const [activeDraft, setActiveDraft] = useState(null);
  const [publishedSlots, setPublishedSlots] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [sections, setSections] = useState([]);
  const [coverage, setCoverage] = useState({
    timetable: true,
    staff: true,
    sections: true,
  });
  const [visiblePublishedCount, setVisiblePublishedCount] = useState(120);
  const [visibleDraftCount, setVisibleDraftCount] = useState(120);
  const [effectiveDate, setEffectiveDate] = useState(() =>
    initialAcademicDate(school?.academic_year),
  );
  const [effectiveLessons, setEffectiveLessons] = useState([]);
  const [effectiveCalendar, setEffectiveCalendar] = useState(null);
  const [effectiveLoading, setEffectiveLoading] = useState(true);
  const [effectiveTruncated, setEffectiveTruncated] = useState(false);
  const [exceptions, setExceptions] = useState([]);
  const [exceptionStatus, setExceptionStatus] = useState("active");
  const [exceptionsLoading, setExceptionsLoading] = useState(false);
  const [exceptionsComplete, setExceptionsComplete] = useState(true);
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [showSubstitution, setShowSubstitution] = useState(false);
  const [substitutionResult, setSubstitutionResult] = useState(null);
  const [substitution, setSubstitution] = useState({
    slot_id: "",
    lesson_date: todayValue(),
    new_teacher_user_id: "",
    reason: "",
  });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState({
    academic_year:
      school?.academic_year ||
      `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    term_no: 1,
    scope_grade: "all",
    max_periods_per_shift:
      school?.bell_schedule?.max_periods_per_shift ||
      (Number(school?.shift_count) === 2 ? 6 : 7),
    max_periods_by_shift: savedMaxPeriodsByShift(school),
    first_shift_start: school?.bell_schedule?.first_shift_start || "08:00",
    second_shift_start: school?.bell_schedule?.second_shift_start || "13:10",
    short_break_minutes: school?.bell_schedule?.short_break_minutes ?? 5,
    long_break_after: school?.bell_schedule?.long_break_after || 3,
    long_break_minutes: school?.bell_schedule?.long_break_minutes ?? 10,
  });

  useEffect(() => {
    if (!school) return;
    setSettings((current) => ({
      ...current,
      academic_year: school.academic_year || current.academic_year,
      max_periods_by_shift:
        savedMaxPeriodsByShift(school),
      first_shift_start:
        school.bell_schedule?.first_shift_start || current.first_shift_start,
      second_shift_start:
        school.bell_schedule?.second_shift_start || current.second_shift_start,
      short_break_minutes:
        school.bell_schedule?.short_break_minutes ??
        current.short_break_minutes,
      long_break_after:
        school.bell_schedule?.long_break_after || current.long_break_after,
      long_break_minutes:
        school.bell_schedule?.long_break_minutes ?? current.long_break_minutes,
    }));
  }, [school]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [data, generations, staffData, sectionData] = await Promise.all([
        fetchAllById(schoolRoutes.resource(contextId, "timetable"), {
          apiBase,
          token,
          contextId,
          limit: 500,
          maxPages: 12,
        }),
        canEdit
          ? schoolApi(schoolRoutes.timetableGenerations, {
              apiBase,
              token,
              contextId,
              query: { status: "draft", limit: 30 },
            })
          : Promise.resolve({ items: [] }),
        canEdit
          ? fetchAllById(schoolRoutes.resource(contextId, "staff"), {
              apiBase,
              token,
              contextId,
              limit: 200,
              maxPages: 10,
            })
          : Promise.resolve({ items: [] }),
        canEdit
          ? fetchAllById(schoolRoutes.resource(contextId, "classes"), {
              apiBase,
              token,
              contextId,
              limit: 200,
              maxPages: 5,
            })
          : Promise.resolve({ items: [] }),
      ]);
      setPublishedSlots(data.items || []);
      const nextTeachers = (staffData?.items || []).filter(
          (item) =>
            item.status === "active" &&
            ["teacher", "homeroom_teacher"].includes(item.role_key),
      );
      const nextSections = sectionData?.items || [];
      setTeachers(nextTeachers);
      setSections(nextSections);
      setCoverage({
        timetable: Boolean(data.complete),
        staff: Boolean(staffData?.complete ?? true),
        sections: Boolean(sectionData?.complete ?? true),
      });
      const latestDraft = (generations?.items || [])[0];
      if (latestDraft) {
        const draftSlots = enrichTimetableSlots(
          latestDraft.candidate_slots || [],
          nextTeachers,
          nextSections,
        );
        setActiveDraft({
          ...latestDraft,
          slots: draftSlots,
          hard_conflicts: latestDraft.conflicts || [],
          ready_to_confirm:
            Number(latestDraft.slot_count) > 0 &&
            !(latestDraft.conflicts || []).length,
        });
      } else {
        setActiveDraft(null);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [apiBase, canEdit, contextId, token]);

  useEffect(() => {
    load();
  }, [load]);

  const loadEffectiveDate = useCallback(
    async (lessonDate) => {
      if (!lessonDate) return;
      setEffectiveLoading(true);
      try {
        const data = await schoolApi(schoolRoutes.timetableEffective, {
          apiBase,
          token,
          contextId,
          query: { lesson_date: lessonDate, limit: 500 },
        });
        setEffectiveLessons(data?.items || []);
        setEffectiveCalendar(data?.calendar || null);
        setEffectiveTruncated(Boolean(data?.truncated));
      } catch (requestError) {
        setEffectiveLessons([]);
        setEffectiveTruncated(false);
        const bounds = requestError.detail;
        if (bounds?.starts_on && bounds?.ends_on) {
          setEffectiveCalendar({
            starts_on: bounds.starts_on,
            ends_on: bounds.ends_on,
          });
          const correctedDate =
            lessonDate < bounds.starts_on
              ? bounds.starts_on
              : bounds.ends_on;
          if (correctedDate !== lessonDate) {
            setEffectiveDate(correctedDate);
            return;
          }
        }
        setError(requestError.message);
      } finally {
        setEffectiveLoading(false);
      }
    },
    [apiBase, contextId, token],
  );

  const loadExceptions = useCallback(async () => {
    if (!canEdit) {
      setExceptions([]);
      setExceptionsComplete(true);
      return;
    }
    setExceptionsLoading(true);
    try {
      const data = await fetchAllById(schoolRoutes.timetableExceptions, {
        apiBase,
        token,
        contextId,
        query: { status: exceptionStatus },
        limit: 200,
        maxPages: 10,
      });
      setExceptions(data.items || []);
      setExceptionsComplete(Boolean(data.complete));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setExceptionsLoading(false);
    }
  }, [apiBase, canEdit, contextId, exceptionStatus, token]);

  useEffect(() => {
    loadEffectiveDate(effectiveDate);
  }, [effectiveDate, loadEffectiveDate]);

  useEffect(() => {
    loadExceptions();
  }, [loadExceptions]);

  const generate = () => {
    if (!coverage.sections) {
      setError(
        "Sinflar ro‘yxati xavfsiz yuklash chegarasiga sig‘madi. Qamrov noto‘g‘ri bo‘lmasligi uchun jadval yaratish bloklandi.",
      );
      return;
    }
    onConfirm({
      title: "Yangi dars jadvali qoralamasi yaratilsinmi?",
      detail:
        "Generator mavjud smena, xona, metod kuni, bandlik va yuklamani tekshiradi. Natija e’lon qilinmaydi — avval ko‘rib chiqasiz.",
      onConfirm: async () => {
        setGenerating(true);
        setError("");
        try {
          const data = await schoolApi(
            schoolRoutes.timetableGenerate,
            {
              apiBase,
              token,
              contextId,
              method: "POST",
              body: {
                academic_year: settings.academic_year,
                term_no: Number(settings.term_no),
                section_ids:
                  settings.scope_grade === "all"
                    ? []
                    : sections
                        .filter(
                          (section) =>
                            Number(section.grade_no) ===
                            Number(settings.scope_grade),
                        )
                        .map((section) => Number(section.id)),
                max_periods_per_shift: Number(
                  settings.max_periods_per_shift,
                ),
                first_shift_start: settings.first_shift_start,
                second_shift_start: settings.second_shift_start,
                short_break_minutes: Number(settings.short_break_minutes),
                long_break_after: Number(settings.long_break_after),
                long_break_minutes: Number(settings.long_break_minutes),
              },
              idempotencyKey: `timetable-${contextId}-${Date.now()}`,
            },
          );
          const slots = enrichTimetableSlots(
            data?.slots || [],
            teachers,
            sections,
          );
          setActiveDraft({
            ...(data?.generation || {}),
            slots,
            slot_count: slots.length,
            conflicts: data?.conflicts || [],
            hard_conflicts: data?.conflicts || [],
            quality_warnings: data?.quality_warnings || [],
            ready_to_confirm: data?.ready_to_confirm,
          });
          load();
        } catch (requestError) {
          setError(requestError.message);
          throw requestError;
        } finally {
          setGenerating(false);
        }
      },
    });
  };

  const publish = () => {
    if (!activeDraft?.id) return;
    if (!coverage.staff || !coverage.sections) {
      setError(
        "Xodim yoki sinf ma’lumotlari to‘liq yuklanmagani uchun qoralamani ishonchli tekshirib e’lon qilib bo‘lmaydi.",
      );
      return;
    }
    const review = timetableDraftReview(
      activeDraft.slots || [],
      activeDraft.slot_count,
    );
    if (!review.complete) {
      setError(
        "Jadval qoralamasining barcha darslari, sinflari va o‘qituvchilari to‘liq ko‘rinmaguncha e’lon qilib bo‘lmaydi.",
      );
      return;
    }
    if (
      (activeDraft.hard_conflicts || []).length > 0 ||
      (activeDraft.conflicts || []).some((item) => item.severity === "error")
    ) {
      setError("Majburiy to‘qnashuvlar tuzatilmaguncha jadval e’lon qilinmaydi.");
      return;
    }
    onConfirm({
      title: "Dars jadvali e’lon qilinsinmi?",
      detail:
        "E’lon qilingach o‘qituvchi va o‘quvchilar jadvalni ko‘radi. Keyingi o‘zgarish yana qoralama orqali qilinadi.",
      onConfirm: async () => {
        try {
          await schoolApi(
            schoolRoutes.timetablePublish(contextId, activeDraft.id),
            {
              apiBase,
              token,
              contextId,
              method: "POST",
              body: {
                expected_version: activeDraft.version,
                confirmation: true,
              },
              idempotencyKey: `timetable-publish-${activeDraft.id}-${activeDraft.version}`,
            },
          );
          setActiveDraft(null);
          load();
        } catch (requestError) {
          setError(requestError.message);
          throw requestError;
        }
      },
    });
  };

  const saveSubstitution = () => {
    if (!coverage.timetable || !coverage.staff) {
      setError(
        "Jadval yoki o‘qituvchilar ro‘yxati to‘liq yuklanmagani uchun o‘rinbosar biriktirish bloklandi.",
      );
      return;
    }
    if (
      !substitution.slot_id ||
      !substitution.lesson_date ||
      !substitution.new_teacher_user_id ||
      substitution.reason.trim().length < 2
    ) {
      setError("Dars, o‘rinbosar o‘qituvchi va sababni kiriting.");
      return;
    }
    const teacher = teachers.find(
      (item) =>
        Number(item.user_id) === Number(substitution.new_teacher_user_id),
    );
    const selectedSlot = publishedSlots.find(
      (item) => Number(item.id) === Number(substitution.slot_id),
    );
    const lessonWeekday =
      new Date(`${substitution.lesson_date}T12:00:00`).getDay() || 7;
    if (
      selectedSlot &&
      Number(selectedSlot.weekday) !== Number(lessonWeekday)
    ) {
      setError("Tanlangan sana darsning hafta kuniga mos emas.");
      return;
    }
    onConfirm({
      title: "Dars boshqa o‘qituvchiga berilsinmi?",
      detail: `${teacher?.full_name || "Tanlangan o‘qituvchi"} uchun shu dars biriktiriladi. Server parallel dars, metod kuni va kunlik yuklamani yana tekshiradi.`,
      onConfirm: async () => {
        try {
          const data = await schoolApi(schoolRoutes.timetableSubstitutions, {
            apiBase,
            token,
            contextId,
            method: "POST",
            body: {
              slot_id: Number(substitution.slot_id),
              lesson_date: substitution.lesson_date,
              new_teacher_user_id: Number(
                substitution.new_teacher_user_id,
              ),
              reason: substitution.reason.trim(),
              confirmation: true,
              idempotency_key:
                `sub-${contextId}-${substitution.slot_id}-${substitution.lesson_date}-${substitution.new_teacher_user_id}`,
            },
          });
          setSubstitutionResult({
            ...(data?.substitution || data?.exception || data || {}),
            lesson_date: substitution.lesson_date,
            teacher_name: teacher?.full_name,
            subject_name: selectedSlot?.subject_name,
            section_name: selectedSlot?.section_name,
            period_no: selectedSlot?.period_no,
            status:
              data?.substitution?.status ||
              data?.exception?.status ||
              "active",
          });
          setShowSubstitution(false);
          setSubstitution({
            slot_id: "",
            lesson_date: todayValue(),
            new_teacher_user_id: "",
            reason: "",
          });
          setEffectiveDate(substitution.lesson_date);
          await Promise.all([
            load(),
            loadEffectiveDate(substitution.lesson_date),
            loadExceptions(),
          ]);
        } catch (requestError) {
          setError(requestError.message);
          throw requestError;
        }
      },
    });
  };

  const revokeException = () => {
    if (!revokeTarget?.id || revokeReason.trim().length < 2) {
      setError("Bekor qilish sababini kamida 2 ta belgi bilan kiriting.");
      return;
    }
    if (!exceptionsComplete) {
      setError(
        "Istisnolar tarixi to‘liq yuklanmadi. Noto‘g‘ri yozuvni bekor qilmaslik uchun amal bloklandi.",
      );
      return;
    }
    const exceptionId = Number(revokeTarget.id);
    const affectedDate =
      revokeTarget.lesson_date ||
      revokeTarget.target_date ||
      effectiveDate;
    onConfirm({
      title: "Jadval istisnosi bekor qilinsinmi?",
      detail:
        "Bekor qilingach shu sanadagi amaldagi jadval qayta hisoblanadi. Haftalik asosiy dars kerak bo‘lsa yana ko‘rinadi.",
      onConfirm: async () => {
        try {
          await schoolApi(
            schoolRoutes.timetableExceptionRevoke(exceptionId),
            {
              apiBase,
              token,
              contextId,
              method: "POST",
              body: {
                reason: revokeReason.trim(),
                confirmation: true,
                idempotency_key:
                  `revoke-${contextId}-${exceptionId}-${Date.now()}`,
              },
            },
          );
          setRevokeTarget(null);
          setRevokeReason("");
          if (affectedDate) setEffectiveDate(affectedDate);
          await Promise.all([
            load(),
            loadEffectiveDate(affectedDate),
            loadExceptions(),
          ]);
        } catch (requestError) {
          setError(requestError.message);
          throw requestError;
        }
      },
    });
  };

  const substitutionWeekday = substitution.lesson_date
    ? new Date(`${substitution.lesson_date}T12:00:00`).getDay() || 7
    : null;
  const substitutionSlots = publishedSlots.filter(
    (slot) => Number(slot.weekday) === Number(substitutionWeekday),
  );
  const draftReview = timetableDraftReview(
    activeDraft?.slots || [],
    activeDraft?.slot_count,
  );
  const coverageWarnings = [
    !coverage.timetable
      ? "Haftalik jadvalning faqat xavfsiz chegaraga sig‘gan qismi ko‘rsatildi; o‘rinbosar biriktirish vaqtincha bloklandi."
      : null,
    !coverage.staff
      ? "O‘qituvchilar ro‘yxati to‘liq yuklanmadi; o‘rinbosar va qoralamani e’lon qilish bloklandi."
      : null,
    !coverage.sections
      ? "Sinflar ro‘yxati to‘liq yuklanmadi; generator va qoralamani e’lon qilish bloklandi."
      : null,
    effectiveTruncated
      ? `${effectiveDate} sanasidagi amaldagi darslarning bir qismi xavfsiz ko‘rsatish chegarasiga sig‘madi.`
      : null,
    !exceptionsComplete
      ? "Jadval istisnolarining faqat bir qismi yuklandi; bekor qilish amali bloklandi."
      : null,
  ].filter(Boolean);
  const substitutionReady = coverage.timetable && coverage.staff;
  const publicationReady = coverage.staff && coverage.sections;

  return (
    <div>
      <div className="school-module-toolbar">
        <div>
          <h2>Aqlli jadval generatori</h2>
          <p>Generator taklif qiladi, vakolatli rahbar tekshiradi va tasdiqlaydi.</p>
        </div>
        {canEdit ? (
          <button
            type="button"
            className="school-primary"
            disabled={generating || !coverage.sections}
            onClick={generate}
          >
            {generating ? (
              <Loader2 size={16} className="school-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            Qoralama yaratish
          </button>
        ) : (
          <span className="school-readonly-badge">
            <ShieldCheck size={15} /> E’lon qilingan jadval
          </span>
        )}
      </div>
      <ErrorNotice error={error} onRetry={load} />
      {coverageWarnings.length > 0 && (
        <InfoNotice tone="warning">
          <b>Ma’lumot qamrovi cheklangan</b>
          {coverageWarnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </InfoNotice>
      )}
      <section className="school-card school-effective-card">
        <div className="school-card-title">
          <div>
            <span className="school-eyebrow">SANADAGI AMALDAGI JADVAL</span>
            <h2>Almashtirish va qoplovlar hisoblangan darslar</h2>
          </div>
          <div className="school-effective-toolbar">
            <input
              type="date"
              value={effectiveDate}
              min={effectiveCalendar?.starts_on || undefined}
              max={effectiveCalendar?.ends_on || undefined}
              onChange={(event) => setEffectiveDate(event.target.value)}
            />
            <button
              type="button"
              className="school-secondary"
              disabled={effectiveLoading}
              onClick={() => loadEffectiveDate(effectiveDate)}
            >
              <RefreshCw
                size={15}
                className={effectiveLoading ? "school-spin" : undefined}
              />
              Yangilash
            </button>
          </div>
        </div>
        <p className="school-muted">
          Shu ko‘rinish sanaga tegishli o‘rinbosar, bekor qilish va qoplov
          qarorlarini haftalik jadvalga qo‘llab ko‘rsatadi.
        </p>
        {effectiveLoading ? (
          <LoadingBlock text="Sanadagi jadval hisoblanmoqda..." />
        ) : effectiveLessons.length ? (
          <div className="school-timetable-preview">
            {effectiveLessons.map((lesson, index) => (
              <div key={lesson.effective_key || `${lesson.slot_id}-${index}`}>
                <span>
                  {TIMETABLE_SOURCE_LABELS[lesson.source_type] ||
                    lesson.source_type ||
                    "Dars"}
                </span>
                <time>{lesson.period_no}-soat</time>
                <b>{lesson.subject_name || `Fan #${lesson.subject_id}`}</b>
                <small>
                  {[
                    lesson.grade_no && lesson.section_name
                      ? `${lesson.grade_no}-${lesson.section_name}`
                      : lesson.section_name,
                    lesson.teacher_name,
                    lesson.room_name,
                    lesson.starts_at && lesson.ends_at
                      ? `${String(lesson.starts_at).slice(0, 5)}–${String(
                          lesson.ends_at,
                        ).slice(0, 5)}`
                      : null,
                    lesson.exception_reason,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </small>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CalendarDays}
            title="Bu sanada amaldagi dars yo‘q"
            text="Ish kuni, haftalik jadval yoki e’lon qilingan qoplov darsi topilmadi."
          />
        )}
      </section>
      {canEdit && (
        <section className="school-card school-exception-history">
          <div className="school-card-title">
            <div>
              <span className="school-eyebrow">JADVAL ISTISNOLARI</span>
              <h2>O‘rinbosar va qoplovlar tarixi</h2>
            </div>
            <div className="school-effective-toolbar">
              <select
                value={exceptionStatus}
                onChange={(event) => {
                  setExceptionStatus(event.target.value);
                  setRevokeTarget(null);
                  setRevokeReason("");
                }}
              >
                <option value="active">Faol</option>
                <option value="revoked">Bekor qilingan</option>
              </select>
              <span className="school-count-badge">{exceptions.length}</span>
            </div>
          </div>
          {exceptionsLoading ? (
            <LoadingBlock text="Istisnolar tarixi yuklanmoqda..." />
          ) : exceptions.length ? (
            <div className="school-data-list">
              {exceptions.map((item) => {
                const itemDate =
                  item.lesson_date || item.source_date || item.target_date;
                const kind =
                  item.exception_kind || item.kind || item.source_type;
                const isRevokeOpen =
                  Number(revokeTarget?.id) === Number(item.id);
                return (
                  <article key={item.id}>
                    <span className="school-avatar-initial">
                      <CalendarDays size={15} />
                    </span>
                    <span>
                      <b>
                        {TIMETABLE_EXCEPTION_LABELS[kind] ||
                          kind ||
                          "Jadval istisnosi"}
                        {itemDate ? ` · ${itemDate}` : ""}
                      </b>
                      <small>
                        {[
                          item.subject_name,
                          item.section_name,
                          item.period_no ? `${item.period_no}-soat` : null,
                          item.replacement_teacher_name ||
                            item.teacher_name,
                          item.reason,
                        ]
                          .filter(Boolean)
                          .join(" · ") || `Dars katagi #${item.slot_id}`}
                      </small>
                      {isRevokeOpen && (
                        <div className="school-revoke-form">
                          <input
                            value={revokeReason}
                            onChange={(event) =>
                              setRevokeReason(event.target.value)
                            }
                            placeholder="Bekor qilish sababi"
                          />
                          <button
                            type="button"
                            className="school-danger"
                            onClick={revokeException}
                          >
                            Bekor qilishni tasdiqlash
                          </button>
                          <button
                            type="button"
                            className="school-secondary"
                            onClick={() => {
                              setRevokeTarget(null);
                              setRevokeReason("");
                            }}
                          >
                            Yopish
                          </button>
                        </div>
                      )}
                    </span>
                    <div className="school-row-actions">
                      {!isRevokeOpen && (
                        <button
                          type="button"
                          className="school-secondary"
                          disabled={
                            !exceptionsComplete ||
                            item.status !== "active"
                          }
                          onClick={() => {
                            setRevokeTarget(item);
                            setRevokeReason("");
                          }}
                        >
                          <X size={14} /> Bekor qilish
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="school-muted">
              Hozir faol o‘rinbosar yoki qoplov istisnosi yo‘q.
            </p>
          )}
        </section>
      )}
      {canEdit && publishedSlots.length > 0 && (
        <section className="school-card school-substitution-card">
          <div className="school-card-title">
            <div>
              <span className="school-eyebrow">O‘QITUVCHI ALMASHTIRISH</span>
              <h2>Kelmagan o‘qituvchining darsini biriktirish</h2>
            </div>
            <button
              type="button"
              className="school-secondary"
              disabled={!substitutionReady}
              onClick={() => setShowSubstitution((value) => !value)}
            >
              {showSubstitution ? <X size={15} /> : <UserPlus size={15} />}
              {showSubstitution ? "Yopish" : "O‘rinbosar tanlash"}
            </button>
          </div>
          {showSubstitution && (
            <>
              <div className="school-form-grid">
                <label>
                  Almashtiriladigan sana
                  <input
                    type="date"
                    value={substitution.lesson_date}
                    onChange={(event) =>
                      setSubstitution((current) => ({
                        ...current,
                        lesson_date: event.target.value,
                        slot_id: "",
                      }))
                    }
                  />
                </label>
                <label>
                  Shu kundagi dars
                  <select
                    value={substitution.slot_id}
                    onChange={(event) =>
                      setSubstitution((current) => ({
                        ...current,
                        slot_id: event.target.value,
                      }))
                    }
                  >
                    <option value="">Tanlang</option>
                    {substitutionSlots.map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {WEEKDAYS.find(
                          (day) => day.value === Number(slot.weekday),
                        )?.label || `${slot.weekday}-kun`}{" "}
                        · {slot.period_no}-soat ·{" "}
                        {slot.subject_name} · {slot.section_name}
                      </option>
                    ))}
                  </select>
                  {!substitutionSlots.length && (
                    <small>Tanlangan kunda haftalik dars topilmadi.</small>
                  )}
                </label>
                <label>
                  O‘rinbosar o‘qituvchi
                  <select
                    value={substitution.new_teacher_user_id}
                    onChange={(event) =>
                      setSubstitution((current) => ({
                        ...current,
                        new_teacher_user_id: event.target.value,
                      }))
                    }
                  >
                    <option value="">Tanlang</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.user_id} value={teacher.user_id}>
                        {teacher.full_name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="wide">
                  Sababi
                  <input
                    value={substitution.reason}
                    onChange={(event) =>
                      setSubstitution((current) => ({
                        ...current,
                        reason: event.target.value,
                      }))
                    }
                    placeholder="Masalan: o‘qituvchi kasalligi sababli"
                  />
                </label>
              </div>
              <p className="school-muted">
                O‘rinbosar faqat tanlangan sanadagi bitta darsga biriktiriladi;
                haftalik asosiy jadvaldagi o‘qituvchi o‘zgarmaydi.
              </p>
              <button
                type="button"
                className="school-primary"
                disabled={!substitutionReady}
                onClick={saveSubstitution}
              >
                <ShieldCheck size={16} /> To‘qnashuvni tekshirish
              </button>
            </>
          )}
          {substitutionResult && (
            <div className="school-dated-exception">
              <CheckCircle2 size={18} />
              <span>
                <b>
                  {substitutionResult.lesson_date} ·{" "}
                  {substitutionResult.period_no}-soat ·{" "}
                  {substitutionResult.subject_name}
                </b>
                <small>
                  {substitutionResult.section_name} · O‘rinbosar:{" "}
                  {substitutionResult.teacher_name} · Holat:{" "}
                  {substitutionResult.status}. Haftalik jadval o‘zgarmadi.
                </small>
              </span>
            </div>
          )}
        </section>
      )}
      {canEdit && (
        <section className="school-card school-timetable-settings">
        <div className="school-card-title">
          <div>
            <span className="school-eyebrow">MEZONLAR</span>
            <h2>Generator qoidalari</h2>
          </div>
        </div>
        <div className="school-form-grid">
          <label>
            O‘quv yili
            <input
              value={settings.academic_year}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  academic_year: event.target.value,
                }))
              }
            />
          </label>
          <label>
            Chorak
            <select
              value={settings.term_no}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  term_no: Number(event.target.value),
                }))
              }
            >
              {[1, 2, 3, 4].map((term) => (
                <option key={term} value={term}>
                  {term}-chorak
                </option>
              ))}
            </select>
          </label>
          <label>
            Jadval qamrovi
            <select
              value={settings.scope_grade}
              disabled={!coverage.sections}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  scope_grade: event.target.value,
                }))
              }
            >
              <option value="all">Barcha sinflar</option>
              {[...new Set(sections.map((item) => Number(item.grade_no)))]
                .sort((a, b) => a - b)
                .map((grade) => (
                  <option key={grade} value={grade}>
                    Faqat {grade}-sinflar
                  </option>
                ))}
            </select>
            <small>
              Juda katta maktabda bosqichma-bosqich yarating; boshqa
              sinflarning e’lon qilingan jadvali saqlanadi.
            </small>
          </label>
          <label>
            1-smenadagi eng ko‘p dars
            <input
              type="number"
              value={
                settings.max_periods_by_shift?.[1] ||
                settings.max_periods_per_shift
              }
              readOnly
              aria-readonly="true"
            />
            <small>Maktabning saqlangan qo‘ng‘iroq jadvalidan olindi</small>
          </label>
          <label>
            1-smena boshlanishi
            <input
              type="time"
              value={settings.first_shift_start}
              readOnly
              aria-readonly="true"
            />
          </label>
          {(school?.shift_count || 1) === 2 && (
            <>
              <label>
                2-smenadagi eng ko‘p dars
                <input
                  type="number"
                  value={
                    settings.max_periods_by_shift?.[2] ||
                    settings.max_periods_per_shift
                  }
                  readOnly
                  aria-readonly="true"
                />
              </label>
              <label>
                2-smena boshlanishi
                <input
                  type="time"
                  value={settings.second_shift_start}
                  readOnly
                  aria-readonly="true"
                />
              </label>
            </>
          )}
        </div>
        <div className="school-constraint-list two">
          {[
            "Metod kuni va “band” vaqtlar — majburiy cheklov",
            "Sinf, xona va o‘qituvchi to‘qnashuvi",
            "Kunlik 7 darsdan oshmaslik",
            "Ustuvor smena va 1-soatdan qochish — imkon bo‘lsa",
            "Fan va o‘qituvchi afzal vaqtlarini yumshoq mezon sifatida hisoblash",
          ].map((label) => (
            <div className="school-check-row" key={label}>
              <CheckCircle2 size={16} />
              {label}
            </div>
          ))}
        </div>
        </section>
      )}
      {loading ? (
        <LoadingBlock />
      ) : canEdit && activeDraft ? (
        <section className="school-card school-timetable-draft">
          <div className="school-card-title">
            <div>
              <span className="school-eyebrow">QORALAMA</span>
              <h2>{activeDraft.name || `Jadval #${activeDraft.id}`}</h2>
            </div>
            <StatusPill status={activeDraft.status} />
          </div>
          <div className="school-draft-stats">
            <span>
              <b>{activeDraft.slots?.length || 0}</b>
              <small>dars</small>
            </span>
            <span>
              <b>{activeDraft.conflict_count ?? activeDraft.conflicts?.length ?? 0}</b>
              <small>ogohlantirish</small>
            </span>
            <span>
              <b>{activeDraft.unassigned_count || 0}</b>
              <small>joylashmagan</small>
            </span>
          </div>
          {(activeDraft.conflicts || []).length > 0 && (
            <div className="school-conflicts">
              {activeDraft.conflicts.slice(0, 10).map((conflict, index) => (
                <div key={conflict.id || index}>
                  <AlertTriangle size={16} />
                  <span>
                    <b>{conflict.title || conflict.code}</b>
                    <small>{conflict.message}</small>
                  </span>
                </div>
              ))}
            </div>
          )}
          {(activeDraft.slots || []).length > 0 && (
            <div className="school-timetable-preview">
              {activeDraft.slots
                .slice(0, visibleDraftCount)
                .map((lesson, index) => (
                  <div key={lesson.id || index}>
                    <span>{lesson.day_label}</span>
                    <time>{lesson.period_label}</time>
                    <b>{lesson.subject_name}</b>
                    <small>
                      {[
                        lesson.class_name,
                        lesson.teacher_name,
                        lesson.room_name,
                        `${lesson.shift_no}-smena`,
                        `${String(lesson.starts_at).slice(0, 5)}–${String(
                          lesson.ends_at,
                        ).slice(0, 5)}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </small>
                  </div>
                ))}
            </div>
          )}
          {activeDraft.slots?.length > visibleDraftCount && (
            <button
              type="button"
              className="school-load-more"
              onClick={() =>
                setVisibleDraftCount((count) =>
                  Math.min(count + 120, activeDraft.slots.length),
                )
              }
            >
              Yana 120 ta darsni ko‘rsatish
            </button>
          )}
          {!draftReview.complete && (
            <div className="school-makeup-conflict">
              <AlertTriangle size={16} />
              <span>
                Qoralama to‘liq tekshirilmagan: {draftReview.expected} ta
                kutilgan darsdan {activeDraft.slots?.length || 0} tasi olindi,
                {draftReview.incomplete.length} tasida sinf yoki o‘qituvchi
                ma’lumoti yetishmaydi. E’lon qilish bloklandi.
              </span>
            </div>
          )}
          {canEdit && activeDraft.status === "draft" && (
            <button
              type="button"
              className="school-primary"
              disabled={
                (activeDraft.hard_conflicts || []).length > 0 ||
                !draftReview.complete ||
                !publicationReady ||
                (activeDraft.conflicts || []).some(
                  (item) => item.severity === "error",
                )
              }
              onClick={publish}
            >
              <BadgeCheck size={16} /> Tekshirdim, jadvalni e’lon qilish
            </button>
          )}
        </section>
      ) : publishedSlots.length ? (
        <section className="school-card school-timetable-draft">
          <div className="school-card-title">
            <div>
              <span className="school-eyebrow">E’LON QILINGAN</span>
              <h2>Amaldagi dars jadvali</h2>
            </div>
            <StatusPill status="published" />
          </div>
          <div className="school-timetable-preview">
            {publishedSlots
              .slice(0, visiblePublishedCount)
              .map((lesson, index) => (
              <div key={lesson.id || index}>
                <span>
                  {WEEKDAYS.find(
                    (day) => day.value === Number(lesson.weekday),
                  )?.label || `${lesson.weekday}-kun`}
                </span>
                <time>{lesson.period_no}-soat</time>
                <b>{lesson.subject_name}</b>
                <small>
                  {[lesson.section_name, lesson.teacher_name, lesson.room_name]
                    .filter(Boolean)
                    .join(" · ")}
                </small>
              </div>
              ))}
          </div>
          {publishedSlots.length > visiblePublishedCount && (
            <button
              type="button"
              className="school-load-more"
              onClick={() =>
                setVisiblePublishedCount((count) =>
                  Math.min(count + 120, publishedSlots.length),
                )
              }
            >
              Yana 120 ta darsni ko‘rsatish
            </button>
          )}
        </section>
      ) : (
        <EmptyState
          icon={TableProperties}
          title="Jadval qoralamasi hali yo‘q"
          text="Avval fan yuklamasi, xodim bandligi va xonalarni to‘ldiring."
        />
      )}
    </div>
  );
}

function AttendancePage({ apiBase, token, contextId, onConfirm }) {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");
  const [date, setDate] = useState(todayValue);
  const [students, setStudents] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetchAllById(schoolRoutes.resource(contextId, "classes"), {
      apiBase,
      token,
      contextId,
      limit: 200,
      maxPages: 5,
    })
      .then((data) => {
        if (!active) return;
        const items = data?.items || [];
        setClasses(items);
        if (items[0]) setClassId(String(items[0].id));
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [apiBase, contextId, token]);

  useEffect(() => {
    if (!classId) {
      setStudents([]);
      return;
    }
    let active = true;
    setLoading(true);
    fetchAllById(schoolRoutes.resource(contextId, "students"), {
      apiBase,
      token,
      contextId,
      query: { section_id: classId, attendance_date: date, limit: 100 },
      limit: 300,
      maxPages: 4,
    })
      .then((data) => {
        if (!active) return;
        const items = data?.items || [];
        setStudents(items);
        setStatuses(
          Object.fromEntries(
            items.map((student) => [
              student.user_id || student.id,
              student.attendance_status || "present",
            ]),
          ),
        );
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [apiBase, classId, contextId, date, token]);

  const save = () => {
    onConfirm({
      title: `${date} kungi davomat saqlansinmi?`,
      detail: `${students.length} nafar o‘quvchining holati yoziladi. O‘zgarish audit tarixida qoladi.`,
      onConfirm: async () => {
        try {
          await runInBatches(
            students,
            8,
            (student) => {
              const studentUserId = student.user_id || student.id;
              return schoolApi(schoolRoutes.attendance, {
                apiBase,
                token,
                contextId,
                method: "POST",
                body: {
                  section_id: Number(classId),
                  student_user_id: Number(studentUserId),
                  attendance_date: date,
                  period_no: null,
                  status: statuses[studentUserId] || "present",
                },
              });
            },
          );
        } catch (requestError) {
          setError(requestError.message);
          throw requestError;
        }
      },
    });
  };
  return (
    <div>
      <div className="school-module-toolbar">
        <div>
          <h2>Sinf davomatini belgilash</h2>
          <p>Kelgan, kechikkan, sababli va sababsiz holatlar alohida saqlanadi.</p>
        </div>
        <button
          type="button"
          className="school-primary"
          disabled={!students.length}
          onClick={save}
        >
          <Save size={16} /> Davomatni saqlash
        </button>
      </div>
      <ErrorNotice error={error} />
      <div className="school-filter-row">
        <label>
          Sana
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <label>
          Sinf
          <select value={classId} onChange={(event) => setClassId(event.target.value)}>
            <option value="">Tanlang</option>
            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name || `${item.grade_no}-${item.section_name}`}
              </option>
            ))}
          </select>
        </label>
      </div>
      {loading ? (
        <LoadingBlock />
      ) : !students.length ? (
        <EmptyState
          icon={UserCheck}
          title="Bu sinfda o‘quvchi topilmadi"
          text="Avval sinf va o‘quvchilarni biriktiring."
        />
      ) : (
        <div className="school-attendance-list">
          {students.map((student) => (
            <article key={student.user_id || student.id}>
              <span className="school-avatar-initial">
                {(student.full_name || student.name || "?").slice(0, 1)}
              </span>
              <b>{student.full_name || student.name}</b>
              <div>
                {[
                  ["present", "Keldi"],
                  ["late", "Kechikdi"],
                  ["excused", "Sababli"],
                  ["absent", "Kelmagan"],
                ].map(([value, label]) => (
                  <button
                    type="button"
                    key={value}
                    className={
                      statuses[student.user_id || student.id] === value
                        ? `active ${value}`
                        : ""
                    }
                    onClick={() =>
                      setStatuses((current) => ({
                        ...current,
                        [student.user_id || student.id]: value,
                      }))
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function GradesPage({ apiBase, token, contextId, onConfirm }) {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [assessment, setAssessment] = useState({
    title: "",
    date: todayValue(),
    max_score: 5,
    period: "quarter_1",
  });
  const [students, setStudents] = useState([]);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchAllById(schoolRoutes.resource(contextId, "classes"), {
        apiBase,
        token,
        contextId,
        limit: 200,
        maxPages: 5,
      }),
      fetchAllById(schoolRoutes.resource(contextId, "subjects"), {
        apiBase,
        token,
        contextId,
        limit: 200,
        maxPages: 5,
      }),
    ])
      .then(([data, subjectData]) => {
        if (!active) return;
        const items = data?.items || [];
        setClasses(items);
        const subjectItems = subjectData?.items || [];
        setSubjects(subjectItems);
        if (items[0]) setClassId(String(items[0].id));
        if (subjectItems[0]) setSubjectId(String(subjectItems[0].id));
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [apiBase, contextId, token]);

  useEffect(() => {
    if (!classId) return;
    let active = true;
    setLoading(true);
    fetchAllById(schoolRoutes.resource(contextId, "students"), {
      apiBase,
      token,
      contextId,
      query: { section_id: classId, limit: 100 },
      limit: 300,
      maxPages: 4,
    })
      .then((data) => {
        if (!active) return;
        const items = data?.items || [];
        setStudents(items);
        setScores(
          Object.fromEntries(
            items.map((item) => [item.user_id || item.id, ""]),
          ),
        );
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [apiBase, classId, contextId, token]);

  const save = () => {
    if (!subjectId || !assessment.title.trim()) {
      setError("Fan va baholash nomini kiriting.");
      return;
    }
    const records = students
      .filter(
        (student) => scores[student.user_id || student.id] !== "",
      )
      .map((student) => ({
        student_user_id: student.user_id || student.id,
        score: Number(scores[student.user_id || student.id]),
      }));
    if (!records.length) {
      setError("Kamida bitta o‘quvchiga ball kiriting.");
      return;
    }
    onConfirm({
      title: "Baholar saqlansinmi?",
      detail: `${assessment.title}: ${records.length} nafar o‘quvchi uchun ball yoziladi.`,
      onConfirm: async () => {
        try {
          const assessmentFingerprint = stableFingerprint(
            JSON.stringify({
              context_id: Number(contextId),
              section_id: Number(classId),
              subject_id: Number(subjectId),
              assessment_date: assessment.date,
              assessment_period: assessment.period,
              title: assessment.title.trim(),
              grade_type: "quiz",
              max_score: Number(assessment.max_score),
            }),
          );
          await runInBatches(
            records,
            8,
            (record) =>
              schoolApi(schoolRoutes.gradeEntries, {
                apiBase,
                token,
                contextId,
                method: "POST",
                body: {
                  section_id: Number(classId),
                  subject_id: Number(subjectId),
                  student_user_id: Number(record.student_user_id),
                  grade_type: "quiz",
                  score: record.score,
                  max_score: Number(assessment.max_score),
                  graded_at: new Date(
                    `${assessment.date}T12:00:00`,
                  ).toISOString(),
                  note: assessment.title,
                  idempotency_key:
                    `grade-v2-${contextId}-${classId}-${subjectId}-${record.student_user_id}-${assessmentFingerprint}`,
                },
              }),
          );
        } catch (requestError) {
          setError(requestError.message);
          throw requestError;
        }
      },
    });
  };

  return (
    <div>
      <div className="school-module-toolbar">
        <div>
          <h2>Fan bo‘yicha baholash</h2>
          <p>Topshiriq, sana, davr va maksimal ball bilan birga yoziladi.</p>
        </div>
        <button
          type="button"
          className="school-primary"
          disabled={!students.length}
          onClick={save}
        >
          <Save size={16} /> Baholarni saqlash
        </button>
      </div>
      <ErrorNotice error={error} />
      <section className="school-card school-grade-filters">
        <div className="school-form-grid">
          <label>
            Sinf
            <select value={classId} onChange={(event) => setClassId(event.target.value)}>
              <option value="">Tanlang</option>
              {classes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name || `${item.grade_no}-${item.section_name}`}
                </option>
              ))}
            </select>
          </label>
          <label>
            Fan
            <select
              value={subjectId}
              onChange={(event) => setSubjectId(event.target.value)}
            >
              <option value="">Tanlang</option>
              {subjects.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Baholash nomi
            <input
              value={assessment.title}
              onChange={(event) =>
                setAssessment((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder="Masalan: 2-mavzu testi"
            />
          </label>
          <label>
            Sana
            <input
              type="date"
              value={assessment.date}
              onChange={(event) =>
                setAssessment((current) => ({
                  ...current,
                  date: event.target.value,
                }))
              }
            />
          </label>
          <label>
            Davr
            <select
              value={assessment.period}
              onChange={(event) =>
                setAssessment((current) => ({
                  ...current,
                  period: event.target.value,
                }))
              }
            >
              {[1, 2, 3, 4].map((quarter) => (
                <option key={quarter} value={`quarter_${quarter}`}>
                  {quarter}-chorak
                </option>
              ))}
            </select>
          </label>
          <label>
            Maksimal ball
            <input
              type="number"
              min="1"
              max="100"
              value={assessment.max_score}
              onChange={(event) =>
                setAssessment((current) => ({
                  ...current,
                  max_score: Number(event.target.value),
                }))
              }
            />
          </label>
        </div>
      </section>
      {loading ? (
        <LoadingBlock />
      ) : (
        <div className="school-score-list">
          {students.map((student) => (
            <label key={student.user_id || student.id}>
              <span className="school-avatar-initial">
                {(student.full_name || student.name || "?").slice(0, 1)}
              </span>
              <b>{student.full_name || student.name}</b>
              <input
                type="number"
                min="0"
                max={assessment.max_score}
                value={scores[student.user_id || student.id] ?? ""}
                onChange={(event) =>
                  setScores((current) => ({
                    ...current,
                    [student.user_id || student.id]: event.target.value,
                  }))
                }
                aria-label={`${student.full_name || student.name} bali`}
              />
              <small>/ {assessment.max_score}</small>
            </label>
          ))}
        </div>
      )}
      {!loading && !students.length && (
        <EmptyState
          icon={ClipboardCheck}
          title="O‘quvchilar ro‘yxati topilmadi"
          text="Avval sinfni va o‘quvchilarni tanlang."
        />
      )}
    </div>
  );
}

function PaymentsPage({ apiBase, token, contextId, onLegacy }) {
  const [state, setState] = useState({
    loading: true,
    available: false,
    data: null,
    error: "",
  });
  useEffect(() => {
    let active = true;
    Promise.all([
      schoolApi(schoolRoutes.billingPlans, { apiBase, token, contextId }),
      fetchAllById(schoolRoutes.billingInvoices, {
        apiBase,
        token,
        contextId,
        limit: 200,
        maxPages: 20,
      }),
    ])
      .then(([plans, invoices]) => {
        if (!active) return;
        const invoiceItems = invoices?.items || [];
        setState({
          loading: false,
          available: true,
          data: {
            plans: plans?.items || [],
            invoices: invoiceItems,
            planned_amount: invoiceItems.reduce(
              (sum, item) => sum + Number(item.amount || 0),
              0,
            ),
            paid_amount: invoiceItems.reduce(
              (sum, item) => sum + Number(item.paid_amount || 0),
              0,
            ),
            outstanding_amount: invoiceItems.reduce(
              (sum, item) =>
                sum +
                Math.max(
                  Number(item.amount || 0) - Number(item.paid_amount || 0),
                  0,
                ),
              0,
            ),
          },
          error: "",
        });
      })
      .catch((requestError) => {
        if (!active) return;
        setState({
          loading: false,
          available: false,
          data: null,
          error:
            [404, 409, 501].includes(requestError.status)
              ? ""
              : requestError.message,
        });
      });
    return () => {
      active = false;
    };
  }, [apiBase, contextId, token]);

  if (state.loading) return <LoadingBlock text="To‘lov tizimi tekshirilmoqda..." />;
  if (!state.available) {
    return (
      <div>
        <div className="school-module-toolbar">
          <div>
            <h2>Xususiy maktab to‘lovlari</h2>
            <p>Yangi v2 hisob-kitob tizimi hali bu serverda yoqilmagan.</p>
          </div>
        </div>
        <ErrorNotice error={state.error} />
        <InfoNotice tone="warning">
          <b>Eski va yangi moliya aralashtirilmaydi</b>
          <p>
            Canonical v2 billing tayyor bo‘lmaguncha bu oynadan to‘lov yozib
            bo‘lmaydi. Mavjud eski moliya faqat Legacy oynasida ko‘riladi.
          </p>
        </InfoNotice>
        {onLegacy && (
          <button type="button" className="school-secondary" onClick={onLegacy}>
            Eski moliya bo‘limini ochish
          </button>
        )}
      </div>
    );
  }
  return (
    <div>
      <div className="school-module-toolbar">
        <div>
          <h2>Xususiy maktab to‘lovlari</h2>
          <p>Yangi v2 billing serverda faol.</p>
        </div>
      </div>
      <div className="school-metric-grid">
        {[
          ["Oylik reja", state.data?.planned_amount || 0],
          ["To‘langan", state.data?.paid_amount || 0],
          ["Qarzdorlik", state.data?.outstanding_amount || 0],
        ].map(([label, value]) => (
          <article key={label}>
            <span>
              <CircleDollarSign size={20} />
            </span>
            <small>{label}</small>
            <b>{Number(value).toLocaleString("uz-UZ")} so‘m</b>
          </article>
        ))}
      </div>
      <InfoNotice>
        <b>Moliyaviy yozuvlar uchun ikki bosqichli tasdiq talab qilinadi</b>
        <p>
          Ushbu frontend hozir billing holatini o‘qiydi. To‘lov yozish tugmalari
          backenddagi canonical v2 shartnomasi tayyor bo‘lgach alohida ulanadi.
        </p>
      </InfoNotice>
    </div>
  );
}

function SettingsPage({ workspace, preferences, onPreferences, onLegacy }) {
  return (
    <div>
      <div className="school-module-toolbar">
        <div>
          <h2>Maktab va yordamchi sozlamalari</h2>
          <p>Muhim maktab sozlamalari alohida tahrirlash oqimida tasdiqlanadi.</p>
        </div>
      </div>
      <section className="school-card">
        <div className="school-card-title">
          <div>
            <span className="school-eyebrow">MAKTAB</span>
            <h2>{workspace.name}</h2>
          </div>
          <StatusPill status={workspace.status || "active"} />
        </div>
        <div className="school-summary-list">
          <div>
            <span>Turi</span>
            <b>{schoolTypeLabel(workspace.school_type)}</b>
          </div>
          <div>
            <span>Smena</span>
            <b>{workspace.shift_count || 1} ta</b>
          </div>
          <div>
            <span>Hudud</span>
            <b>{[workspace.region, workspace.district].filter(Boolean).join(", ")}</b>
          </div>
        </div>
      </section>
      <section className="school-card">
        <div className="school-card-title">
          <div>
            <span className="school-eyebrow">YO‘LKO‘RSATUVCHI</span>
            <h2>Ko‘rinish va ovoz</h2>
          </div>
        </div>
        <AvatarPreferences preferences={preferences} onChange={onPreferences} />
      </section>
      {onLegacy && (
        <section className="school-card">
          <div className="school-card-title">
            <div>
              <span className="school-eyebrow">ESKI TIZIM</span>
              <h2>Legacy ma’lumotlar</h2>
            </div>
          </div>
          <p className="school-muted">
            Eski va yangi boshqaruv yozuvlari aralashtirilmaydi. Kerak bo‘lsa eski
            oynani alohida oching.
          </p>
          <button type="button" className="school-secondary" onClick={onLegacy}>
            Legacy oynani ochish
          </button>
        </section>
      )}
    </div>
  );
}
