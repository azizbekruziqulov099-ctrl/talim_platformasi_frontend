import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  BarChart3,
  BookMarked,
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  DoorOpen,
  Eye,
  FileQuestion,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import GuidedAvatar from "../assistant/GuidedAvatar.jsx";
import "katex/dist/katex.min.css";
import { HUDUDLAR, VILOYATLAR } from "../hududlar.js";
import {
  centerApi,
  centerDownload,
  centerRoutes,
  makeIdempotencyKey,
  mergePage,
  pageQuery,
  unwrapItems,
} from "./api.js";
import {
  CEFR_LEVELS,
  CENTER_ROLES,
  CENTER_TYPES,
  COURSE_FORMATS,
  DELIVERY_FORMATS,
  IELTS_BANDS,
  IELTS_TYPES,
  ONBOARDING_STEPS,
  SUBJECT_PRESETS,
  WEEK_DAYS,
  hasPermission,
  menuForRoles,
  normalizeMenu,
  tourForRoles,
} from "./workflow.js";
import {
  buildAssessmentPayload,
  buildAttemptDraftPayload,
  buildAttemptSubmitPayload,
  buildAttendancePayload,
  buildCoursePayload,
  buildEnrollmentDecision,
  buildEnrollmentPayload,
  buildGradePayload,
  buildHomeworkPayload,
  buildLessonPlanPayload,
  buildPaymentPayload,
  buildSchedulePayload,
} from "./contracts.js";
import "./center.css";

const MENU_META = {
  overview: ["Bosh sahifa", LayoutDashboard],
  courses: ["Kurslar", GraduationCap],
  groups: ["Guruhlar", Users],
  students: ["O‘quvchilar", UserPlus],
  schedule: ["Jadval", CalendarDays],
  lessons: ["Dars va vazifa", BookOpen],
  attendance: ["Davomat va baho", BadgeCheck],
  assessments: ["Test va imtihon", FileQuestion],
  payments: ["To‘lovlar", WalletCards],
  analytics: ["Analitika", BarChart3],
  staff: ["Xodimlar", Users],
  settings: ["Sozlamalar", Settings],
};

const STATUS_LABELS = {
  active: "Faol",
  pending: "Kutilmoqda",
  pending_verification: "Tekshiruv kutilmoqda",
  suspended: "Vaqtincha to‘xtatilgan",
  ended: "Yakunlangan",
  waitlisted: "Kutish ro‘yxati",
  paused: "Pauzada",
  withdrawn: "Kursdan chiqarilgan",
  draft: "Qoralama",
  published: "E’lon qilingan",
  paid: "To‘langan",
  partial: "Qisman",
  unpaid: "To‘lanmagan",
  overdue: "Muddati o‘tgan",
  rejected: "Rad etilgan",
  completed: "Yakunlangan",
  expired: "Vaqti tugagan",
  submitted: "Topshirilgan",
  graded: "Baholangan",
  returned: "Tuzatishga qaytarilgan",
};

const EDIT_PERMISSIONS = {
  courses: ["courses.manage"],
  enrollments: ["enrollments.manage"],
  schedule: ["schedule.manage"],
  lessons: ["plans.write"],
  homework: ["homework.write"],
  attendance: ["attendance.write"],
  grades: ["grades.write"],
  assessments: ["assessments.write"],
  payments: ["billing.manage"],
  billing: ["billing.manage"],
  staff: ["staff.manage"],
  branches: ["branches.manage"],
  rooms: ["rooms.manage"],
  subjects: ["subjects.manage"],
};

function canAny(permissions, key) {
  return (EDIT_PERMISSIONS[key] || []).some((permission) =>
    hasPermission(permissions, permission),
  );
}

function todayValue() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function attemptAnswersFromDraft(rows = []) {
  return Object.fromEntries(
    (Array.isArray(rows) ? rows : []).map((row) => {
      const response = row?.response || {};
      return [
        String(row.assessment_item_id),
        response.selected ??
          response.selected_index ??
          response.text ??
          response.value ??
          response.answer ??
          "",
      ];
    }),
  );
}

function analyticsPeriodRange(period) {
  const end = new Date(`${todayValue()}T12:00:00`);
  let start;
  if (period === "year") {
    start = new Date(
      end.getFullYear() - (end.getMonth() < 8 ? 1 : 0),
      8,
      1,
      12,
    );
  } else {
    const days = { "7d": 7, "30d": 30, "90d": 90 }[period] || 30;
    start = new Date(end);
    start.setDate(start.getDate() - days + 1);
  }
  const normalize = (date) => {
    const adjusted = new Date(date);
    adjusted.setMinutes(
      adjusted.getMinutes() - adjusted.getTimezoneOffset(),
    );
    return adjusted.toISOString().slice(0, 10);
  };
  return { from_date: normalize(start), to_date: normalize(end) };
}

function loadAvatarPreferences() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("samtm-center-avatar") || "{}",
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

function saveAvatarPreferences(value) {
  localStorage.setItem("samtm-center-avatar", JSON.stringify(value));
}

function BackButton({ onClick, label = "Ortga" }) {
  return (
    <button type="button" className="lc-back" onClick={onClick}>
      <ArrowLeft size={17} /> {label}
    </button>
  );
}

function LoadingBlock({ text = "Yuklanmoqda..." }) {
  return (
    <div className="lc-loading">
      <Loader2 size={24} className="animate-spin" />
      <span>{text}</span>
    </div>
  );
}

function ErrorNotice({ error, onRetry }) {
  if (!error) return null;
  return (
    <div className="lc-error" role="alert">
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
    <div className={`lc-info ${tone}`}>
      <ShieldCheck size={18} />
      <span>{children}</span>
    </div>
  );
}

function EmptyState({ icon: Icon = Search, title, text }) {
  return (
    <div className="lc-empty">
      <Icon size={28} />
      <b>{title}</b>
      <p>{text}</p>
    </div>
  );
}

function StatusPill({ status }) {
  if (!status) return null;
  return (
    <span className={`lc-status ${status}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function Field({ label, hint, children, wide = false, aiField }) {
  return (
    <label
      className={`lc-field ${wide ? "wide" : ""}`}
      data-ai-field={aiField || undefined}
    >
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

function WeekdayPicker({ value = [], onChange }) {
  const selected = new Set((value || []).map(Number));
  return (
    <div className="lc-weekdays">
      {WEEK_DAYS.map((day) => (
        <button
          type="button"
          key={day.value}
          className={selected.has(day.value) ? "active" : ""}
          onClick={() => {
            const next = new Set(selected);
            if (next.has(day.value)) next.delete(day.value);
            else next.add(day.value);
            onChange([...next].sort());
          }}
          title={day.label}
        >
          {day.short}
        </button>
      ))}
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  busy,
  secondary = false,
  danger = false,
  type = "button",
}) {
  return (
    <button
      type={type}
      className={`lc-action ${secondary ? "secondary" : ""} ${
        danger ? "danger" : ""
      }`}
      disabled={disabled || busy}
      onClick={onClick}
    >
      {busy && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  );
}

function TruncationNotice({ count, capped, hasMore }) {
  if (!capped && !hasMore) return null;
  return (
    <div className="lc-truncation">
      {capped
        ? "Ko‘rsatish chegarasiga yetildi. Qidiruv yoki filtrdan foydalaning."
        : `${count} ta yozuv yuklandi. Qolganini “Yana ko‘rsatish” orqali oling.`}
    </div>
  );
}

function usePagedResource({
  apiBase,
  token,
  contextId,
  path,
  query,
  enabled = true,
}) {
  const [items, setItems] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [capped, setCapped] = useState(false);
  const loadingRef = useRef(false);
  const generationRef = useRef(0);
  const seenCursorsRef = useRef(new Set());
  const queryKey = JSON.stringify(query || {});

  const load = async (afterId = null, generation = generationRef.current) => {
    if (!enabled || loadingRef.current) return;
    loadingRef.current = true;
    setBusy(true);
    setError("");
    try {
      const data = await centerApi(path, {
        apiBase,
        token,
        contextId,
        query: pageQuery({
          ...(query || {}),
          afterId,
          limit: 100,
        }),
      });
      if (generation !== generationRef.current) return;
      const page = unwrapItems(data);
      setItems((current) =>
        afterId ? mergePage(current, page.items) : page.items,
      );
      const cursorKey =
        page.nextCursor == null ? null : String(page.nextCursor);
      const cursorAdvanced =
        cursorKey != null &&
        cursorKey !== String(afterId ?? "") &&
        !seenCursorsRef.current.has(cursorKey);
      if (page.hasMore && !cursorAdvanced) {
        setNextCursor(null);
        setHasMore(false);
        setCapped(true);
        setError(
          "Server keyingi sahifa cursorini takrorladi. Takroriy so‘rov to‘xtatildi.",
        );
      } else {
        if (cursorKey != null) seenCursorsRef.current.add(cursorKey);
        setNextCursor(page.nextCursor);
        setHasMore(page.hasMore);
        setCapped(false);
      }
    } catch (requestError) {
      if (generation === generationRef.current) {
        setError(requestError.message);
      }
    } finally {
      if (generation === generationRef.current) {
        setBusy(false);
        loadingRef.current = false;
      }
    }
  };

  useEffect(() => {
    generationRef.current += 1;
    const generation = generationRef.current;
    loadingRef.current = false;
    seenCursorsRef.current = new Set();
    setItems([]);
    setNextCursor(null);
    setHasMore(false);
    setCapped(false);
    if (enabled) load(null, generation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase, contextId, enabled, path, queryKey, token]);

  const reload = () => {
    generationRef.current += 1;
    const generation = generationRef.current;
    loadingRef.current = false;
    seenCursorsRef.current = new Set();
    setItems([]);
    setNextCursor(null);
    setHasMore(false);
    setCapped(false);
    return load(null, generation);
  };

  return {
    items,
    busy,
    error,
    capped,
    hasMore,
    reload,
    loadMore: () => load(nextCursor),
  };
}

function SelectorPagination({ resources = [] }) {
  const pending = resources.filter(
    ([, resource]) => resource?.hasMore || resource?.capped,
  );
  if (!pending.length) return null;
  return (
    <div className="lc-filter-row">
      {pending.map(([label, resource]) =>
        resource.hasMore ? (
          <ActionButton
            key={label}
            secondary
            busy={resource.busy}
            onClick={resource.loadMore}
          >
            {label}: yana 100 ta
          </ActionButton>
        ) : (
          <small key={label}>{label}: sahifalash xavfsiz to‘xtatildi.</small>
        ),
      )}
    </div>
  );
}

function LoadMore({ resource }) {
  return (
    <>
      <TruncationNotice
        count={resource.items.length}
        capped={resource.capped}
        hasMore={resource.hasMore}
      />
      {resource.hasMore && (
        <ActionButton
          secondary
          busy={resource.busy}
          onClick={resource.loadMore}
        >
          Yana ko‘rsatish
        </ActionButton>
      )}
    </>
  );
}

export default function LearningCenterWorkspace({
  token,
  apiBase,
  initialWorkspace,
  onBack,
  onLegacy,
  assignedOnly = false,
  canCreateInstitution = true,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceNextCursor, setWorkspaceNextCursor] = useState(null);
  const [workspaceHasMore, setWorkspaceHasMore] = useState(false);
  const [workspaceMoreBusy, setWorkspaceMoreBusy] = useState(false);
  const [verifications, setVerifications] = useState([]);
  const [verificationBusy, setVerificationBusy] = useState(false);
  const [verificationNextCursor, setVerificationNextCursor] = useState(null);
  const [verificationHasMore, setVerificationHasMore] = useState(false);
  const [verificationMoreBusy, setVerificationMoreBusy] = useState(false);
  const [screen, setScreen] = useState("home");
  const [selected, setSelected] = useState(null);
  const [meta, setMeta] = useState(null);
  const [preferences, setPreferences] = useState(loadAvatarPreferences);

  const updatePreferences = (patch) => {
    setPreferences((current) => {
      const next = { ...current, ...patch };
      saveAvatarPreferences(next);
      return next;
    });
  };

  const load = async (preferredContextId) => {
    setLoading(true);
    setError("");
    try {
      const [workspaceData, metaData] = await Promise.all([
        centerApi(centerRoutes.workspaces, {
          apiBase,
          token,
          query: pageQuery({ limit: 100 }),
        }),
        centerApi(centerRoutes.meta, { apiBase, token }),
      ]);
      const workspacePage = unwrapItems(workspaceData);
      const next = workspacePage.items;
      setWorkspaces(next);
      setWorkspaceNextCursor(workspacePage.nextCursor);
      setWorkspaceHasMore(workspacePage.hasMore);
      setMeta(metaData);
      const isSystemAdmin = next.some(
        (item) =>
          Array.isArray(item.roles) && item.roles.includes("system_admin"),
      );
      if (isSystemAdmin) {
        const pending = await centerApi(centerRoutes.adminVerifications, {
          apiBase,
          token,
          query: { status: "pending", limit: 100 },
        });
        const pendingPage = unwrapItems(pending);
        setVerifications(pendingPage.items);
        setVerificationNextCursor(pendingPage.nextCursor);
        setVerificationHasMore(pendingPage.hasMore);
      } else {
        setVerifications([]);
        setVerificationNextCursor(null);
        setVerificationHasMore(false);
      }
      const wantedId =
        preferredContextId ||
        initialWorkspace?.context_id ||
        initialWorkspace?.muassasa_id;
      const wanted = next.find(
        (item) =>
          Number(item.context_id) === Number(wantedId) ||
          Number(item.legacy_center_id) === Number(wantedId),
      );
      if (
        wanted &&
        wanted.role_status !== "pending" &&
        (wanted.onboarding_status || "active") === "active"
      ) {
        setSelected(wanted);
        setScreen("dashboard");
      } else {
        setSelected((current) => {
          if (!current) return current;
          return (
            next.find(
              (item) =>
                Number(item.context_id) === Number(current.context_id),
            ) || current
          );
        });
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase, token]);

  const loadMoreWorkspaces = async () => {
    if (!workspaceHasMore || !workspaceNextCursor || workspaceMoreBusy) return;
    setWorkspaceMoreBusy(true);
    setError("");
    try {
      const data = await centerApi(centerRoutes.workspaces, {
        apiBase,
        token,
        query: pageQuery({
          afterId: workspaceNextCursor,
          limit: 100,
        }),
      });
      const page = unwrapItems(data);
      setWorkspaces((current) => {
        const merged = new Map(
          current.map((item) => [Number(item.context_id), item]),
        );
        page.items.forEach((item) =>
          merged.set(Number(item.context_id), item),
        );
        return [...merged.values()];
      });
      const advanced =
        page.nextCursor == null ||
        String(page.nextCursor) !== String(workspaceNextCursor);
      if (page.hasMore && !advanced) {
        setWorkspaceHasMore(false);
        setWorkspaceNextCursor(null);
        setError(
          "Markazlar sahifasida server cursorni takrorladi. Takroriy yuklash to‘xtatildi.",
        );
      } else {
        setWorkspaceNextCursor(page.nextCursor);
        setWorkspaceHasMore(page.hasMore);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setWorkspaceMoreBusy(false);
    }
  };

  const decideVerification = async (contextId, decision) => {
    setVerificationBusy(true);
    setError("");
    try {
      await centerApi(centerRoutes.adminVerificationDecision(contextId), {
        apiBase,
        token,
        method: "POST",
        allowed: true,
        body: {
          decision,
          note:
            decision === "verified"
              ? "Tizim administratori hujjatlarni tekshirib tasdiqladi."
              : "Tizim administratori tekshiruvdan keyin rad etdi.",
          confirmation: true,
        },
      });
      await load();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setVerificationBusy(false);
    }
  };

  const loadMoreVerifications = async () => {
    if (
      !verificationHasMore ||
      !verificationNextCursor ||
      verificationMoreBusy
    ) {
      return;
    }
    setVerificationMoreBusy(true);
    setError("");
    try {
      const data = await centerApi(centerRoutes.adminVerifications, {
        apiBase,
        token,
        query: pageQuery({
          afterId: verificationNextCursor,
          limit: 100,
          status: "pending",
        }),
      });
      const page = unwrapItems(data);
      setVerifications((current) => {
        const merged = new Map(
          current.map((item) => [Number(item.context_id), item]),
        );
        page.items.forEach((item) =>
          merged.set(Number(item.context_id), item),
        );
        return [...merged.values()];
      });
      const advanced =
        page.nextCursor == null ||
        String(page.nextCursor) !== String(verificationNextCursor);
      if (page.hasMore && !advanced) {
        setVerificationHasMore(false);
        setVerificationNextCursor(null);
        setError(
          "Arizalar sahifasida server cursorni takrorladi. Takroriy yuklash to‘xtatildi.",
        );
      } else {
        setVerificationNextCursor(page.nextCursor);
        setVerificationHasMore(page.hasMore);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setVerificationMoreBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="lc-shell">
        <BackButton onClick={onBack} />
        <LoadingBlock text="O‘quv markazi ish maydoni yuklanmoqda..." />
      </div>
    );
  }

  if (screen === "create" && canCreateInstitution) {
    return (
      <CenterOnboarding
        apiBase={apiBase}
        token={token}
        meta={meta}
        preferences={preferences}
        onPreferences={updatePreferences}
        onBack={() => setScreen("home")}
        onCreated={(contextId) => load(contextId)}
      />
    );
  }

  if (screen === "dashboard" && selected) {
    return (
      <CenterDashboard
        key={selected.context_id}
        apiBase={apiBase}
        token={token}
        workspace={selected}
        preferences={preferences}
        onPreferences={updatePreferences}
        onBack={() => {
          setSelected(null);
          setScreen("home");
        }}
        onLegacy={onLegacy}
      />
    );
  }

  return (
    <div className="lc-shell">
      <BackButton onClick={onBack} label="Asosiy platforma" />
      <header className="lc-hero">
        <div>
          <span className="lc-eyebrow">O‘QUV MARKAZI</span>
          <h1>Repetitor va markaz boshqaruvi — bitta sodda ish maydonida</h1>
          <p>
            Direktor, administrator, o‘qituvchi, o‘quvchi va ota-ona o‘z
            vazifasiga mos ko‘rinishda ishlaydi.
          </p>
        </div>
        <span className="lc-hero-icon">
          <GraduationCap size={42} />
        </span>
      </header>
      <ErrorNotice error={error} onRetry={load} />

      {canCreateInstitution && <section className="lc-start-grid">
        <button
          type="button"
          className="lc-start-card primary"
          onClick={() => setScreen("create")}
        >
          <span><Plus size={23} /></span>
          <b>Yangi markaz ochish</b>
          <p>AI avatar bilan bosqichma-bosqich sozlang</p>
          <ChevronRight size={18} />
        </button>
      </section>}

      {assignedOnly && workspaces.length === 0 && (
        <InfoNotice>
          <b>Markaz ish joyi ulanmagan</b>
          <p>Oddiy o‘qituvchi markaz ochmaydi. Administrator sizni markazga biriktirgach, ish maydoni shu yerda ko‘rinadi; shaxsiy dars uchun esa “Repetitorlik ochish”dan foydalaning.</p>
        </InfoNotice>
      )}

      {verifications.length > 0 && (
        <section className="lc-workspaces">
          <div className="lc-section-heading">
            <div>
              <span className="lc-eyebrow">TIZIM TEKSHIRUVI</span>
              <h2>Davlat markazi arizalari</h2>
            </div>
          </div>
          <InfoNotice tone="warning">
            Qarorni faqat hujjat va vakolatni platformadan tashqarida haqiqiy
            tekshirgan tizim administratori beradi.
          </InfoNotice>
          <div className="lc-entity-grid">
            {verifications.map((item) => (
              <article key={item.context_id}>
                <span className="lc-list-icon">
                  <ShieldCheck size={18} />
                </span>
                <div>
                  <h3>{item.name}</h3>
                  <p>
                    {[item.region, item.district].filter(Boolean).join(", ") ||
                      "Hudud kiritilmagan"}
                  </p>
                  <small>Ariza #{item.context_id}</small>
                </div>
                <div className="lc-row-actions">
                  <ActionButton
                    busy={verificationBusy}
                    onClick={() =>
                      decideVerification(item.context_id, "verified")
                    }
                  >
                    Tekshirdim — tasdiqlash
                  </ActionButton>
                  <ActionButton
                    danger
                    busy={verificationBusy}
                    onClick={() =>
                      decideVerification(item.context_id, "rejected")
                    }
                  >
                    Rad etish
                  </ActionButton>
                </div>
              </article>
            ))}
          </div>
          {verificationHasMore && (
            <ActionButton
              secondary
              busy={verificationMoreBusy}
              onClick={loadMoreVerifications}
            >
              Yana 100 ta arizani ko‘rsatish
            </ActionButton>
          )}
        </section>
      )}

      <section className="lc-workspaces">
        <div className="lc-section-heading">
          <div>
            <span className="lc-eyebrow">ISH MAYDONLARIM</span>
            <h2>Ulangan markazlar</h2>
          </div>
        </div>
        {workspaces.length === 0 ? (
          <EmptyState
            icon={Building2}
            title={assignedOnly ? "Ulangan markaz yo‘q" : "Hali markaz yo‘q"}
            text={assignedOnly ? "Markaz rahbari xodim taklifini yuborishi kerak." : "Direktor sifatida yangi markaz yarating."}
          />
        ) : (
          <div className="lc-workspace-grid">
            {workspaces.map((workspace) => (
              <button
                type="button"
                key={workspace.context_id}
                disabled={
                  workspace.role_status === "pending" ||
                  (workspace.onboarding_status || "active") !== "active"
                }
                onClick={() => {
                  setSelected(workspace);
                  setScreen("dashboard");
                }}
              >
                <span className="lc-workspace-logo">
                  <GraduationCap size={21} />
                </span>
                <span>
                  <b>{workspace.name || workspace.center_name}</b>
                  <small>
                    {workspace.center_type_label ||
                      CENTER_TYPES.find(
                        (item) => item.value === workspace.center_type,
                      )?.label ||
                      "O‘quv markazi"}
                  </small>
                  <em>
                    {(workspace.role_labels || workspace.roles || [])
                      .map((role) => CENTER_ROLES[role] || role)
                      .join(", ")}
                  </em>
                </span>
                <StatusPill
                  status={
                    (workspace.onboarding_status || "active") === "active"
                      ? workspace.role_status || "active"
                      : workspace.onboarding_status || "pending"
                  }
                />
              </button>
            ))}
          </div>
        )}
        {workspaceHasMore && (
          <div className="lc-row-actions">
            <ActionButton
              secondary
              busy={workspaceMoreBusy}
              onClick={loadMoreWorkspaces}
            >
              Yana 100 ta markazni ko‘rsatish
            </ActionButton>
          </div>
        )}
      </section>
    </div>
  );
}

function CenterOnboarding({
  apiBase,
  token,
  meta,
  preferences,
  onPreferences,
  onBack,
  onCreated,
}) {
  const [step, setStep] = useState("identity");
  const [draft, setDraft] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [assistantSession, setAssistantSession] = useState(null);
  const [identity, setIdentity] = useState({
    center_type: "private_center",
    ownership_type: "private",
    operator_model: "center",
    name: "",
    region: "Samarqand viloyati",
    district: "",
    address: "",
    phone: "",
    setup_mode: "assistant",
  });
  const [branches, setBranches] = useState([
    {
      local_id: 1,
      name: "Bosh filial",
      address: "",
      work_start: "08:00",
      work_end: "20:00",
      work_days: [1, 2, 3, 4, 5, 6],
    },
  ]);
  const [rooms, setRooms] = useState([
    {
      local_id: 1,
      branch_index: 0,
      name: "1-xona",
      room_type: "classroom",
      capacity: 16,
    },
  ]);
  const [subjects, setSubjects] = useState(["Ingliz tili", "Matematika"]);
  const [staff, setStaff] = useState({
    relationship: "director",
    invite_after_create: true,
  });
  const [course, setCourse] = useState({
    create_now: true,
    name: "Ingliz tili",
    subject_name: "Ingliz tili",
    course_type: "group",
    delivery_mode: "offline",
    target_framework: "cefr",
    cefr_level: "A1",
    capacity: 12,
    sessions_per_week: 3,
    duration_minutes: 90,
    weekdays: [1, 3, 5],
    starts_at: "17:00",
    monthly_price: 400000,
  });
  const [billing, setBilling] = useState({
    enabled: true,
    billing_period: "monthly",
    due_day: 10,
    currency: "UZS",
  });

  const currentIndex = ONBOARDING_STEPS.findIndex(
    (item) => item.key === step,
  );

  useEffect(() => {
    let cancelled = false;
    const start = async () => {
      setBusy(true);
      setError("");
      try {
        const data = await centerApi(centerRoutes.onboardingDrafts, {
          apiBase,
          token,
          method: "POST",
          allowed: true,
          body: {
            relationship: "director",
            ownership_type: "private",
            operator_model: "center",
            setup_mode: "assistant",
          },
        });
        if (cancelled) return;
        setDraft(data.draft || data);
        if (preferences.enabled) {
          centerApi(centerRoutes.assistantSessions, {
            apiBase,
            token,
            method: "POST",
            allowed: true,
            body: {
              workflow_key: "center_onboarding",
              draft_id: data.draft?.id || data.id,
              avatar_enabled: true,
              speech_enabled: preferences.speechEnabled,
              avatar_variant: preferences.variant,
            },
          })
            .then((result) =>
              !cancelled && setAssistantSession(result.session || result),
            )
            .catch(() => {});
        }
      } catch (requestError) {
        if (!cancelled) setError(requestError.message);
      } finally {
        if (!cancelled) setBusy(false);
      }
    };
    start();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase, token]);

  const stepPayload = (key) => {
    if (key === "identity") return identity;
    if (key === "branches") return { branches };
    if (key === "rooms") return { rooms };
    if (key === "subjects") return { subjects };
    if (key === "staff") return staff;
    if (key === "courses") {
      if (!course.create_now) return { courses: [] };
      if (identity.operator_model === "independent_tutor") {
        return { courses: [course] };
      }
      const {
        weekdays: _deferredWeekdays,
        starts_at: _deferredStartsAt,
        ...courseWithoutSchedule
      } = course;
      return { courses: [courseWithoutSchedule] };
    }
    if (key === "billing") return billing;
    return {};
  };

  const validate = (key) => {
    if (key === "identity" && identity.name.trim().length < 3) {
      return "Markaz nomini kamida 3 ta belgi bilan kiriting.";
    }
    if (key === "identity" && !identity.region) {
      return "Viloyatni tanlang.";
    }
    if (
      key === "branches" &&
      branches.some((branch) => !branch.name.trim() || !branch.work_days.length)
    ) {
      return "Har bir filial nomi va kamida bir ish kunini kiriting.";
    }
    if (
      key === "rooms" &&
      rooms.some(
        (room) =>
          !room.name.trim() ||
          Number(room.capacity) < 1 ||
          Number(room.capacity) > 200,
      )
    ) {
      return "Xona nomi va 1–200 oralig‘idagi sig‘imni tekshiring.";
    }
    if (key === "subjects" && !subjects.length) {
      return "Kamida bitta fan tanlang.";
    }
    if (
      key === "courses" &&
      course.create_now &&
      (!course.name.trim() ||
        (identity.operator_model === "independent_tutor" &&
          !course.weekdays.length) ||
        Number(course.capacity) < 1)
    ) {
      return "Kurs nomi, kunlari va sig‘imini tekshiring.";
    }
    return "";
  };

  const saveStep = async (key) => {
    if (!draft?.id) throw new Error("Qoralama hali tayyor emas.");
    const validationError = validate(key);
    if (validationError) throw new Error(validationError);
    return centerApi(centerRoutes.onboardingDraft(draft.id), {
      apiBase,
      token,
      method: "PATCH",
      allowed: true,
      body: {
        step: key,
        payload: stepPayload(key),
        expected_version: draft.version,
      },
    }).then((data) => {
      setDraft(data.draft || data);
      return data;
    });
  };

  const next = async () => {
    setBusy(true);
    setError("");
    try {
      if (step !== "preview") await saveStep(step);
      const nextStep = ONBOARDING_STEPS[currentIndex + 1]?.key;
      if (nextStep === "preview") {
        const data = await centerApi(
          centerRoutes.onboardingPreview(draft.id),
          { apiBase, token },
        );
        setPreview(data.preview || data);
        if (data.version != null) {
          setDraft((current) => ({ ...current, version: data.version }));
        }
      }
      if (nextStep) setStep(nextStep);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    if (!draft?.id || !preview) return;
    setBusy(true);
    setError("");
    try {
      const data = await centerApi(
        centerRoutes.onboardingCommit(draft.id),
        {
          apiBase,
          token,
          method: "POST",
          allowed: true,
          body: {
            confirmation: true,
            expected_version: draft.version,
          },
        },
      );
      onCreated(data.context_id || data.workspace?.context_id);
    } catch (requestError) {
      setError(requestError.message);
      setBusy(false);
    }
  };

  const assistantAction = async (actionId, target) => {
    if (!assistantSession?.id) return;
    const safeActions = new Set([
      "NEXT_STEP",
      "PREVIOUS_STEP",
      "SHOW_MENU",
      "MINIMIZE",
      "RESTORE",
      "PAUSE",
      "RESUME",
      "SPEAK",
      "UNDO",
      "SET_DRAFT_VALUE",
    ]);
    if (!safeActions.has(actionId)) return;
    centerApi(centerRoutes.assistantActions(assistantSession.id), {
      apiBase,
      token,
      method: "POST",
      allowed: true,
      body: {
        action_id: actionId,
        ui_anchor: target?.anchor,
        payload: { step_key: target?.key },
      },
    }).catch(() => {});
  };

  const askAssistant = async (question, activeStep) => {
    const lower = question.toLocaleLowerCase("uz");
    if (/(to['‘’]?lov|pul|tasdiq|e’lon|rol ber)/i.test(lower)) {
      return {
        message:
          "Men bu amalni bajarmayman. To‘lov, e’lon, qabul va rol berishni faqat vakolatli inson alohida tugma bilan tasdiqlaydi.",
      };
    }
    if (activeStep?.key === "identity" && lower.includes("xususiy")) {
      return {
        message:
          "Xususiy markaz filial, kurs, xodim va to‘lov nazorati bilan ishlaydi. Xohlasangiz shu turini faqat qoralama maydoniga tanlayman.",
        action: { type: "SET_IDENTITY_PRESET", value: "private_center" },
        actionLabel: "Xususiy markazni tanlash",
      };
    }
    if (
      activeStep?.key === "identity" &&
      (lower.includes("repetitor") || lower.includes("mustaqil"))
    ) {
      return {
        message:
          "Mustaqil repetitor rejimi bitta o‘qituvchi uchun soddalashtirilgan. Uni qoralamada tanlashim mumkin.",
        action: { type: "SET_IDENTITY_PRESET", value: "independent_tutor" },
        actionLabel: "Repetitor rejimini tanlash",
      };
    }
    if (activeStep?.key === "identity" && lower.includes("davlat")) {
      return {
        message:
          "Davlat o‘quv markazi tekshiruvdan o‘tib faollashadi. Uni qoralamada tanlashim mumkin.",
        action: { type: "SET_IDENTITY_PRESET", value: "public_center" },
        actionLabel: "Davlat markazini tanlash",
      };
    }
    if (
      activeStep?.key === "branches" &&
      /(standart|odatdagi|ish vaqt)/i.test(lower)
    ) {
      return {
        message:
          "Standart qoralama: dushanba–shanba, 08:00–20:00. Bu faqat formani to‘ldiradi, saqlamaydi.",
        action: { type: "SET_DEFAULT_BRANCH" },
        actionLabel: "Standart vaqtni qo‘llash",
      };
    }
    if (activeStep?.key === "courses" && lower.includes("cefr")) {
      return {
        message:
          "CEFR kursini A1 boshlang‘ich maqsadida qoralama qilaman. Keyin A2–C2 dan istalganini o‘zingiz tanlaysiz.",
        action: { type: "SET_CEFR_A1" },
        actionLabel: "CEFR A1 ni tanlash",
      };
    }
    const messages = {
      identity:
        "Mustaqil repetitor bitta o‘qituvchi uchun soddaroq, xususiy markaz esa filial, xodim va to‘lov boshqaruvi bilan ishlaydi.",
      branches:
        "Bitta joyda ishlasangiz faqat Bosh filialni qoldiring. Yangi filialni keyin ham qo‘shish mumkin.",
      rooms:
        "Sig‘im guruhdagi o‘quvchi sonidan kam bo‘lmasin. Onlayn kurs uchun virtual xona tanlanadi.",
      subjects:
        "Hozir asosiy fanlarni belgilang. Barcha fanlar keyin sozlamadan qo‘shiladi.",
      staff:
        "Har xodim alohida hisob bilan kiradi. O‘qituvchi faqat o‘z kursi va guruhini ko‘radi.",
      courses:
        "CEFR A1–C2 va IELTS 0–9 maqsadlari alohida saqlanadi; ular avtomatik tenglashtirilmaydi.",
      billing:
        "To‘lov nazoratini o‘chirishingiz mumkin. Yoqilsa ham yordamchi pulni o‘zi qabul qilmaydi.",
      preview:
        "Xatoni ko‘rsangiz ortga qayting. Yakuniy yaratishni faqat siz bosasiz.",
    };
    return {
      message:
        messages[activeStep?.key] ||
        "Men shu qadamdagi maydonlarni tushuntiraman, lekin tasdiqlashni siz bajarasiz.",
    };
  };

  const applyAssistantSuggestion = (action) => {
    if (!action || typeof action !== "object") return;
    if (action.type === "SET_IDENTITY_PRESET") {
      const preset = CENTER_TYPES.find((item) => item.value === action.value);
      if (!preset) return;
      setIdentity((current) => ({
        ...current,
        center_type: preset.value,
        ownership_type: preset.ownership,
        operator_model: preset.operatorModel,
      }));
      setStaff((current) => ({
        ...current,
        relationship:
          preset.operatorModel === "independent_tutor"
            ? "teacher"
            : current.relationship === "teacher"
              ? "director"
              : current.relationship,
      }));
      return;
    }
    if (action.type === "SET_DEFAULT_BRANCH") {
      setBranches((current) =>
        current.map((branch, index) =>
          index === 0
            ? {
                ...branch,
                work_start: "08:00",
                work_end: "20:00",
                work_days: [1, 2, 3, 4, 5, 6],
              }
            : branch,
        ),
      );
      return;
    }
    if (action.type === "SET_CEFR_A1") {
      setCourse((current) => ({
        ...current,
        target_framework: "cefr",
        cefr_level: "A1",
      }));
    }
  };

  const districts = identity.region ? HUDUDLAR[identity.region] || [] : [];
  const courseFramework =
    course.target_framework === "cefr"
      ? `CEFR ${course.cefr_level}`
      : course.target_framework === "ielts"
        ? `IELTS ${course.ielts_overall_target || "—"}`
        : "Umumiy";

  return (
    <div className="lc-shell lc-with-avatar">
      <BackButton onClick={onBack} label="Markazlarim" />
      <header className="lc-page-header">
        <span className="lc-eyebrow">YANGI MARKAZ</span>
        <h1>Markazni bosqichma-bosqich sozlang</h1>
        <p>
          AI avatar maydonlarni tushuntiradi. Saqlash va yakuniy tasdiq doim
          sizda qoladi.
        </p>
      </header>
      <div className="lc-stepper" aria-label="Sozlash bosqichlari">
        {ONBOARDING_STEPS.map((item, index) => (
          <button
            type="button"
            key={item.key}
            className={
              item.key === step ? "active" : index < currentIndex ? "done" : ""
            }
            disabled={index > currentIndex}
            onClick={() => index <= currentIndex && setStep(item.key)}
          >
            <i>{index < currentIndex ? <Check size={13} /> : index + 1}</i>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
      <ErrorNotice error={error} />
      {busy && !draft ? (
        <LoadingBlock text="Xavfsiz qoralama yaratilmoqda..." />
      ) : (
        <>
          {step === "identity" && (
            <section
              className="lc-form-card"
              data-ai-anchor="center-identity"
            >
              <div className="lc-section-heading">
                <div>
                  <span className="lc-eyebrow">1. MARKAZ</span>
                  <h2>Qaysi shaklda ishlaysiz?</h2>
                </div>
              </div>
              <div className="lc-choice-grid">
                {CENTER_TYPES.map((item) => (
                  <button
                    type="button"
                    key={item.value}
                    className={
                      identity.center_type === item.value ? "selected" : ""
                    }
                    onClick={() => {
                      setIdentity((current) => ({
                        ...current,
                        center_type: item.value,
                        ownership_type: item.ownership,
                        operator_model: item.operatorModel,
                      }));
                      setStaff((current) => ({
                        ...current,
                        relationship:
                          item.operatorModel === "independent_tutor"
                            ? "teacher"
                            : current.relationship === "teacher"
                              ? "director"
                              : current.relationship,
                      }));
                    }}
                  >
                    <Building2 size={22} />
                    <b>{item.label}</b>
                    <small>{item.hint}</small>
                  </button>
                ))}
              </div>
              <div className="lc-form-grid">
                <Field label="Markaz nomi" wide>
                  <input
                    value={identity.name}
                    maxLength={160}
                    onChange={(event) =>
                      setIdentity({ ...identity, name: event.target.value })
                    }
                    placeholder="Masalan: Ziyo Education"
                  />
                </Field>
                <Field label="Viloyat">
                  <select
                    value={identity.region}
                    onChange={(event) =>
                      setIdentity({
                        ...identity,
                        region: event.target.value,
                        district: "",
                      })
                    }
                  >
                    <option value="">Tanlang</option>
                    {VILOYATLAR.map((region) => (
                      <option key={region}>{region}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Tuman/shahar">
                  <select
                    value={identity.district}
                    onChange={(event) =>
                      setIdentity({ ...identity, district: event.target.value })
                    }
                  >
                    <option value="">Tanlang</option>
                    {districts.map((district) => (
                      <option key={district}>{district}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Manzil">
                  <input
                    value={identity.address}
                    maxLength={240}
                    onChange={(event) =>
                      setIdentity({ ...identity, address: event.target.value })
                    }
                    placeholder="Ko‘cha va bino"
                  />
                </Field>
                <Field label="Telefon">
                  <input
                    type="tel"
                    value={identity.phone}
                    maxLength={24}
                    onChange={(event) =>
                      setIdentity({ ...identity, phone: event.target.value })
                    }
                    placeholder="+998 ..."
                  />
                </Field>
              </div>
            </section>
          )}

          {step === "branches" && (
            <section
              className="lc-form-card"
              data-ai-anchor="center-branches"
            >
              <div className="lc-section-heading">
                <div>
                  <span className="lc-eyebrow">2. FILIALLAR</span>
                  <h2>Dars o‘tiladigan joylar</h2>
                </div>
                <ActionButton
                  secondary
                  onClick={() =>
                    setBranches((current) => [
                      ...current,
                      {
                        local_id: Date.now(),
                        name: `${current.length + 1}-filial`,
                        address: "",
                        work_start: "08:00",
                        work_end: "20:00",
                        work_days: [1, 2, 3, 4, 5, 6],
                      },
                    ])
                  }
                >
                  <Plus size={15} /> Filial
                </ActionButton>
              </div>
              <div className="lc-draft-list">
                {branches.map((branch, index) => (
                  <article key={branch.local_id}>
                    <header>
                      <b>{index + 1}-filial</b>
                      {branches.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setBranches((current) =>
                              current.filter(
                                (item) => item.local_id !== branch.local_id,
                              ),
                            )
                          }
                        >
                          <X size={15} /> Olib tashlash
                        </button>
                      )}
                    </header>
                    <div className="lc-form-grid">
                      <Field label="Nomi">
                        <input
                          value={branch.name}
                          onChange={(event) =>
                            setBranches((current) =>
                              current.map((item) =>
                                item.local_id === branch.local_id
                                  ? { ...item, name: event.target.value }
                                  : item,
                              ),
                            )
                          }
                        />
                      </Field>
                      <Field label="Manzil">
                        <input
                          value={branch.address}
                          onChange={(event) =>
                            setBranches((current) =>
                              current.map((item) =>
                                item.local_id === branch.local_id
                                  ? { ...item, address: event.target.value }
                                  : item,
                              ),
                            )
                          }
                        />
                      </Field>
                      <Field label="Ochilish">
                        <input
                          type="time"
                          value={branch.work_start}
                          onChange={(event) =>
                            setBranches((current) =>
                              current.map((item) =>
                                item.local_id === branch.local_id
                                  ? { ...item, work_start: event.target.value }
                                  : item,
                              ),
                            )
                          }
                        />
                      </Field>
                      <Field label="Yopilish">
                        <input
                          type="time"
                          value={branch.work_end}
                          onChange={(event) =>
                            setBranches((current) =>
                              current.map((item) =>
                                item.local_id === branch.local_id
                                  ? { ...item, work_end: event.target.value }
                                  : item,
                              ),
                            )
                          }
                        />
                      </Field>
                      <Field label="Ish kunlari" wide>
                        <WeekdayPicker
                          value={branch.work_days}
                          onChange={(workDays) =>
                            setBranches((current) =>
                              current.map((item) =>
                                item.local_id === branch.local_id
                                  ? { ...item, work_days: workDays }
                                  : item,
                              ),
                            )
                          }
                        />
                      </Field>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {step === "rooms" && (
            <section className="lc-form-card" data-ai-anchor="center-rooms">
              <div className="lc-section-heading">
                <div>
                  <span className="lc-eyebrow">3. XONALAR</span>
                  <h2>Xona va sig‘im</h2>
                </div>
                <ActionButton
                  secondary
                  onClick={() =>
                    setRooms((current) => [
                      ...current,
                      {
                        local_id: Date.now(),
                        branch_index: 0,
                        name: `${current.length + 1}-xona`,
                        room_type: "classroom",
                        capacity: 16,
                      },
                    ])
                  }
                >
                  <Plus size={15} /> Xona
                </ActionButton>
              </div>
              <div className="lc-room-grid">
                {rooms.map((room) => (
                  <article key={room.local_id}>
                    <DoorOpen size={20} />
                    <Field label="Filial">
                      <select
                        value={room.branch_index}
                        onChange={(event) =>
                          setRooms((current) =>
                            current.map((item) =>
                              item.local_id === room.local_id
                                ? {
                                    ...item,
                                    branch_index: Number(event.target.value),
                                  }
                                : item,
                            ),
                          )
                        }
                      >
                        {branches.map((branch, index) => (
                          <option key={branch.local_id} value={index}>
                            {branch.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Xona nomi">
                      <input
                        value={room.name}
                        onChange={(event) =>
                          setRooms((current) =>
                            current.map((item) =>
                              item.local_id === room.local_id
                                ? { ...item, name: event.target.value }
                                : item,
                            ),
                          )
                        }
                      />
                    </Field>
                    <Field label="Turi">
                      <select
                        value={room.room_type}
                        onChange={(event) =>
                          setRooms((current) =>
                            current.map((item) =>
                              item.local_id === room.local_id
                                ? { ...item, room_type: event.target.value }
                                : item,
                            ),
                          )
                        }
                      >
                        <option value="classroom">Oddiy sinfxona</option>
                        <option value="computer">Kompyuter xonasi</option>
                        <option value="laboratory">Laboratoriya</option>
                        <option value="online">Virtual xona</option>
                      </select>
                    </Field>
                    <Field label="Sig‘im">
                      <input
                        type="number"
                        min="1"
                        max="200"
                        value={room.capacity}
                        onChange={(event) =>
                          setRooms((current) =>
                            current.map((item) =>
                              item.local_id === room.local_id
                                ? {
                                    ...item,
                                    capacity: Number(event.target.value),
                                  }
                                : item,
                            ),
                          )
                        }
                      />
                    </Field>
                    {rooms.length > 1 && (
                      <button
                        type="button"
                        className="lc-text-danger"
                        onClick={() =>
                          setRooms((current) =>
                            current.filter(
                              (item) => item.local_id !== room.local_id,
                            ),
                          )
                        }
                      >
                        Olib tashlash
                      </button>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {step === "subjects" && (
            <section
              className="lc-form-card"
              data-ai-anchor="center-subjects"
            >
              <span className="lc-eyebrow">4. FANLAR</span>
              <h2>Markaz o‘qitadigan fanlarni tanlang</h2>
              <div className="lc-subject-picker">
                {(meta?.subjects || SUBJECT_PRESETS).map((subject) => {
                  const name =
                    typeof subject === "string" ? subject : subject.label;
                  const selected = subjects.includes(name);
                  return (
                    <button
                      type="button"
                      key={name}
                      className={selected ? "selected" : ""}
                      onClick={() =>
                        setSubjects((current) =>
                          selected
                            ? current.filter((item) => item !== name)
                            : [...current, name],
                        )
                      }
                    >
                      {selected && <Check size={14} />} {name}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {step === "staff" && (
            <section className="lc-form-card" data-ai-anchor="center-staff">
              <span className="lc-eyebrow">5. JAMOA</span>
              <h2>Siz markazda qanday ishlaysiz?</h2>
              <div className="lc-choice-grid compact">
                {(identity.operator_model === "independent_tutor"
                  ? [
                      [
                        "teacher",
                        "Mustaqil o‘qituvchi",
                        "Mulkdor va o‘qituvchi sifatida kurslarni boshqarasiz",
                      ],
                    ]
                  : [
                      [
                        "director",
                        "Direktor / markaz rahbari",
                        "Markaz yaratilgach administrator va boshqa xodimlarni biriktirasiz",
                      ],
                    ]
                ).map(([value, label, hint]) => (
                  <button
                    type="button"
                    key={value}
                    className={
                      staff.relationship === value ? "selected" : ""
                    }
                    onClick={() =>
                      setStaff({ ...staff, relationship: value })
                    }
                  >
                    <Users size={21} />
                    <b>{label}</b>
                    <small>{hint}</small>
                  </button>
                ))}
              </div>
              <InfoNotice>
                Boshqa xodimlar markaz yaratilgach alohida hisob va aniq rol
                bilan ulanadi. AI avatar rol bera olmaydi.
              </InfoNotice>
            </section>
          )}

          {step === "courses" && (
            <section className="lc-form-card" data-ai-anchor="center-courses">
              <div className="lc-section-heading">
                <div>
                  <span className="lc-eyebrow">6. BIRINCHI KURS</span>
                  <h2>Kurs qoralamasini tayyorlang</h2>
                </div>
                <label className="lc-switch">
                  <input
                    type="checkbox"
                    checked={course.create_now}
                    onChange={(event) =>
                      setCourse({ ...course, create_now: event.target.checked })
                    }
                  />
                  Hozir yaratish
                </label>
              </div>
              {course.create_now && (
                <div className="lc-form-grid">
                  <Field label="Kurs nomi" wide>
                    <input
                      value={course.name}
                      onChange={(event) =>
                        setCourse({ ...course, name: event.target.value })
                      }
                    />
                  </Field>
                  <Field label="Fan">
                    <select
                      value={course.subject_name}
                      onChange={(event) =>
                        setCourse({
                          ...course,
                          subject_name: event.target.value,
                        })
                      }
                    >
                      {subjects.map((subject) => (
                        <option key={subject}>{subject}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Kurs shakli">
                    <select
                      value={course.course_type}
                      onChange={(event) => {
                        const courseType = event.target.value;
                        setCourse({
                          ...course,
                          course_type: courseType,
                          capacity:
                            courseType === "individual" ? 1 : course.capacity,
                        });
                      }}
                    >
                      {COURSE_FORMATS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="O‘qitish usuli">
                    <select
                      value={course.delivery_mode}
                      onChange={(event) =>
                        setCourse({
                          ...course,
                          delivery_mode: event.target.value,
                        })
                      }
                    >
                      {DELIVERY_FORMATS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field
                    label="Maqsad tizimi"
                    hint="CEFR va IELTS avtomatik tenglashtirilmaydi."
                  >
                    <select
                      value={course.target_framework}
                      onChange={(event) =>
                        setCourse({
                          ...course,
                          target_framework: event.target.value,
                        })
                      }
                    >
                      <option value="general">Umumiy fan darajasi</option>
                      <option value="cefr">CEFR</option>
                      <option value="ielts">IELTS</option>
                      <option value="school">Maktab/sinf dasturi</option>
                    </select>
                  </Field>
                  {course.target_framework === "cefr" && (
                    <Field label="CEFR maqsadi">
                      <select
                        value={course.cefr_level}
                        onChange={(event) =>
                          setCourse({
                            ...course,
                            cefr_level: event.target.value,
                          })
                        }
                      >
                        {CEFR_LEVELS.map((level) => (
                          <option key={level}>{level}</option>
                        ))}
                      </select>
                    </Field>
                  )}
                  {course.target_framework === "ielts" && (
                    <>
                      <Field label="IELTS turi">
                        <select
                          value={course.ielts_type || "academic"}
                          onChange={(event) =>
                            setCourse({
                              ...course,
                              ielts_type: event.target.value,
                            })
                          }
                        >
                          {IELTS_TYPES.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Overall maqsad">
                        <select
                          value={course.ielts_overall_target || "6.0"}
                          onChange={(event) =>
                            setCourse({
                              ...course,
                              ielts_overall_target: event.target.value,
                            })
                          }
                        >
                          {IELTS_BANDS.map((band) => (
                            <option key={band}>{band}</option>
                          ))}
                        </select>
                      </Field>
                    </>
                  )}
                  <Field label="Sig‘im">
                    <input
                      type="number"
                      min="1"
                      max="200"
                      value={course.capacity}
                      disabled={course.course_type === "individual"}
                      onChange={(event) =>
                        setCourse({
                          ...course,
                          capacity: Number(event.target.value),
                        })
                      }
                    />
                  </Field>
                  <Field label="Oyiga narx (so‘m)">
                    <input
                      type="number"
                      min="0"
                      step="10000"
                      value={course.monthly_price}
                      onChange={(event) =>
                        setCourse({
                          ...course,
                          monthly_price: Number(event.target.value),
                        })
                      }
                    />
                  </Field>
                  <Field label="Haftasiga">
                    <select
                      value={course.sessions_per_week}
                      onChange={(event) =>
                        setCourse({
                          ...course,
                          sessions_per_week: Number(event.target.value),
                        })
                      }
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map((number) => (
                        <option key={number} value={number}>
                          {number} kun
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Dars davomiyligi">
                    <select
                      value={course.duration_minutes}
                      onChange={(event) =>
                        setCourse({
                          ...course,
                          duration_minutes: Number(event.target.value),
                        })
                      }
                    >
                      {[45, 60, 80, 90, 120].map((minutes) => (
                        <option key={minutes} value={minutes}>
                          {minutes} daqiqa
                        </option>
                      ))}
                    </select>
                  </Field>
                  {identity.operator_model === "independent_tutor" ? (
                    <>
                      <Field label="Boshlanish vaqti">
                        <input
                          type="time"
                          value={course.starts_at}
                          onChange={(event) =>
                            setCourse({
                              ...course,
                              starts_at: event.target.value,
                            })
                          }
                        />
                      </Field>
                      <Field label="Hafta kunlari" wide>
                        <WeekdayPicker
                          value={course.weekdays}
                          onChange={(weekdays) =>
                            setCourse({ ...course, weekdays })
                          }
                        />
                      </Field>
                    </>
                  ) : (
                    <InfoNotice>
                      Dars kunlari va vaqtini hozir tanlamaysiz. Markaz
                      ochilgach avval o‘qituvchini kursga biriktiring, keyin
                      Jadval bo‘limida uning bo‘sh vaqti va xona bilan
                      to‘qnashmasdan saqlang.
                    </InfoNotice>
                  )}
                  <div className="lc-course-summary">
                    <Sparkles size={18} />
                    <span>
                      <b>{course.name || "Kurs"}</b>
                      {courseFramework} ·{" "}
                      {identity.operator_model === "independent_tutor"
                        ? `${course.weekdays.length} kun · `
                        : "jadval keyin · "}
                      {course.duration_minutes} daqiqa
                    </span>
                  </div>
                </div>
              )}
            </section>
          )}

          {step === "billing" && (
            <section className="lc-form-card" data-ai-anchor="center-billing">
              <div className="lc-section-heading">
                <div>
                  <span className="lc-eyebrow">7. TO‘LOV NAZORATI</span>
                  <h2>Hisob-kitob tartibi</h2>
                </div>
                <label className="lc-switch">
                  <input
                    type="checkbox"
                    checked={billing.enabled}
                    onChange={(event) =>
                      setBilling({ ...billing, enabled: event.target.checked })
                    }
                  />
                  Yoqilgan
                </label>
              </div>
              {billing.enabled && (
                <div className="lc-form-grid">
                  <Field label="Hisob davri">
                    <select
                      value={billing.billing_period}
                      onChange={(event) =>
                        setBilling({
                          ...billing,
                          billing_period: event.target.value,
                        })
                      }
                    >
                      <option value="monthly">Oylik</option>
                      <option value="course">Kurs uchun</option>
                      <option value="lesson">Har dars uchun</option>
                    </select>
                  </Field>
                  <Field label="Oylik to‘lov muddati">
                    <select
                      value={billing.due_day}
                      onChange={(event) =>
                        setBilling({
                          ...billing,
                          due_day: Number(event.target.value),
                        })
                      }
                    >
                      {Array.from({ length: 28 }, (_, index) => index + 1).map(
                        (day) => (
                          <option key={day} value={day}>
                            Har oyning {day}-kuni
                          </option>
                        ),
                      )}
                    </select>
                  </Field>
                </div>
              )}
              <InfoNotice tone="warning">
                AI avatar to‘lovni yozmaydi, tasdiqlamaydi va qarzdorlikni
                o‘zgartirmaydi. Bu amallar hisobchi yoki rahbarning aniq
                tasdig‘i bilan bajariladi.
              </InfoNotice>
            </section>
          )}

          {step === "preview" && (
            <section className="lc-form-card" data-ai-anchor="center-preview">
              <span className="lc-eyebrow">8. YAKUNIY TEKSHIRUV</span>
              <h2>Markaz ish maydoni tayyor</h2>
              {!preview ? (
                <LoadingBlock text="Server tekshiruvi bajarilmoqda..." />
              ) : (
                <>
                  <div className="lc-preview-grid">
                    <div>
                      <small>Markaz</small>
                      <b>{preview.summary?.name || identity.name}</b>
                    </div>
                    <div>
                      <small>Filial</small>
                      <b>
                        {preview.summary?.branch_count ?? branches.length} ta
                      </b>
                    </div>
                    <div>
                      <small>Xona</small>
                      <b>{preview.summary?.room_count ?? rooms.length} ta</b>
                    </div>
                    <div>
                      <small>Fan</small>
                      <b>
                        {preview.summary?.subject_count ?? subjects.length} ta
                      </b>
                    </div>
                    <div>
                      <small>Birinchi kurs</small>
                      <b>{course.create_now ? course.name : "Keyin yaratiladi"}</b>
                    </div>
                    <div>
                      <small>To‘lov nazorati</small>
                      <b>{billing.enabled ? "Yoqilgan" : "O‘chirilgan"}</b>
                    </div>
                  </div>
                  {(preview.warnings || []).map((warning) => (
                    <InfoNotice key={warning} tone="warning">
                      {warning}
                    </InfoNotice>
                  ))}
                  <InfoNotice>
                    Bu platformadagi raqamli ish maydoni. Davlat litsenziyasi
                    yoki yuridik ro‘yxatdan o‘tish o‘rnini bosmaydi.
                  </InfoNotice>
                </>
              )}
            </section>
          )}

          <div className="lc-wizard-actions">
            {currentIndex > 0 && (
              <ActionButton
                secondary
                onClick={() =>
                  setStep(ONBOARDING_STEPS[currentIndex - 1].key)
                }
              >
                <ArrowLeft size={15} /> Ortga
              </ActionButton>
            )}
            {step !== "preview" ? (
              <ActionButton busy={busy} onClick={next}>
                Saqlash va davom etish <ChevronRight size={15} />
              </ActionButton>
            ) : (
              <ActionButton busy={busy} disabled={!preview} onClick={confirm}>
                Men tekshirdim — markazni yaratish
              </ActionButton>
            )}
          </div>
        </>
      )}
      <GuidedAvatar
        enabled={preferences.enabled}
        variant={preferences.variant}
        speechEnabled={preferences.speechEnabled}
        apiBase={apiBase}
        steps={ONBOARDING_STEPS}
        activeKey={step}
        onNavigate={(nextKey) => {
          const nextIndex = ONBOARDING_STEPS.findIndex(
            (item) => item.key === nextKey,
          );
          if (nextIndex <= currentIndex) setStep(nextKey);
          else next();
        }}
        onUndo={() => {
          if (currentIndex > 0) {
            setStep(ONBOARDING_STEPS[currentIndex - 1].key);
          }
        }}
        onQuestion={askAssistant}
        onApplySuggestion={applyAssistantSuggestion}
        onAction={assistantAction}
        onSpeechChange={(speechEnabled) =>
          onPreferences({ speechEnabled })
        }
        onEnabledChange={(enabled) => onPreferences({ enabled })}
      />
    </div>
  );
}

function CenterDashboard({
  apiBase,
  token,
  workspace,
  preferences,
  onPreferences,
  onBack,
  onLegacy,
}) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [section, setSection] = useState("overview");
  const [assistantSession, setAssistantSession] = useState(null);
  const history = useRef([]);
  const assistantStarted = useRef(false);
  const pendingAssistantAction = useRef(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await centerApi(centerRoutes.dashboard, {
        apiBase,
        token,
        contextId: workspace.context_id,
      });
      setDashboard(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase, token, workspace.context_id]);

  useEffect(() => {
    if (
      !dashboard ||
      !preferences.enabled ||
      assistantStarted.current ||
      !dashboard.permissions?.includes("assistant.use")
    ) {
      return;
    }
    assistantStarted.current = true;
    centerApi(centerRoutes.assistantSessions, {
      apiBase,
      token,
      contextId: workspace.context_id,
      method: "POST",
      allowed: true,
      body: {
        workflow_key: dashboard.roles?.includes("teacher")
          ? "center_teacher_tour"
          : dashboard.roles?.includes("student")
            ? "center_student_tour"
            : dashboard.roles?.includes("parent")
              ? "center_parent_tour"
              : "center_management_tour",
        avatar_enabled: true,
        speech_enabled: preferences.speechEnabled,
        avatar_variant: preferences.variant,
      },
    })
      .then((data) => setAssistantSession(data.session || data))
      .catch(() => {});
  }, [
    apiBase,
    dashboard,
    preferences.enabled,
    preferences.speechEnabled,
    preferences.variant,
    token,
    workspace.context_id,
  ]);

  const assistantAction = async (actionId, target) => {
    const effectiveAction =
      actionId === "SET_DRAFT_VALUE" && pendingAssistantAction.current
        ? pendingAssistantAction.current
        : actionId;
    if (actionId === "SET_DRAFT_VALUE") {
      pendingAssistantAction.current = null;
    }
    if (!assistantSession?.id) return;
    const safeActions = new Set([
      "NEXT_STEP",
      "PREVIOUS_STEP",
      "SHOW_MENU",
      "MINIMIZE",
      "RESTORE",
      "PAUSE",
      "RESUME",
      "SPEAK",
      "UNDO",
      "FOCUS_FIELD",
      "SET_DRAFT_VALUE",
    ]);
    if (!safeActions.has(effectiveAction)) return;
    centerApi(centerRoutes.assistantActions(assistantSession.id), {
      apiBase,
      token,
      contextId: workspace.context_id,
      method: "POST",
      allowed: true,
      body: {
        action_id: effectiveAction,
        ui_anchor: target?.anchor,
        payload: { target_key: target?.key },
      },
    }).catch(() => {});
  };

  const selectSection = (next) => {
    if (next === section) return;
    history.current = [...history.current.slice(-19), section];
    setSection(next);
    assistantAction("SHOW_MENU", {
      key: next,
      anchor: `center-menu-${next}`,
    });
  };

  if (loading) {
    return (
      <div className="lc-shell">
        <BackButton onClick={onBack} />
        <LoadingBlock text="Markaz boshqaruvi yuklanmoqda..." />
      </div>
    );
  }
  if (!dashboard) {
    return (
      <div className="lc-shell">
        <BackButton onClick={onBack} />
        <ErrorNotice error={error} onRetry={load} />
      </div>
    );
  }

  const center = dashboard.center || dashboard.profile || workspace;
  const roles = dashboard.roles || workspace.roles || [];
  const permissions = dashboard.permissions || workspace.permissions || [];
  const serverMenu = dashboard.menus || dashboard.menu;
  const normalizedServerMenu = normalizeMenu(serverMenu, roles);
  const menu = normalizedServerMenu.length
    ? normalizedServerMenu
    : menuForRoles(roles).map((key) => ({
        key,
        label: MENU_META[key]?.[0] || key,
      }));
  if (!menu.some((item) => item.key === section)) {
    queueMicrotask(() => setSection(menu[0]?.key || "overview"));
  }
  const tour = tourForRoles(
    roles,
    menu.map((item) => item.key),
  );
  const activeMeta = MENU_META[section];

  const askAssistant = async (question) => {
    const lower = question.toLocaleLowerCase("uz");
    if (
      /(to['‘’]?lov.*(qil|yoz)|e’lon qil|rol ber|baho qo['‘’]?y|qabul qil)/i.test(
        lower,
      )
    ) {
      return {
        message:
          "Men xavfli yoki yakuniy amalni bajarmayman. Menyuni ko‘rsataman va qoralama maydonini tushuntiraman; tasdiqni vakolatli inson bosadi.",
      };
    }
    if (section === "courses") {
      const focusFields = [
        [/(kurs.*nom|nom.*kurs)/i, "name", "Kurs nomi maydonini ko‘rsataman."],
        [/(fan|subject)/i, "subject_id", "Fan tanlash maydonini ko‘rsataman."],
        [/(filial|branch)/i, "branch_id", "Vakolatingizdagi filial maydonini ko‘rsataman."],
        [/(o['‘’]?qituvchi|ustoz)/i, "teacher_user_id", "O‘qituvchi maydonini ko‘rsataman."],
      ];
      const focus = focusFields.find(([pattern]) => pattern.test(lower));
      if (focus && /(qayer|ko['‘’]?rsat|och|top)/i.test(lower)) {
        return {
          message: `${focus[2]} Tugmani bossangiz forma ochiladi va faqat shu maydon fokuslanadi.`,
          action: {
            type: "FOCUS_FIELD",
            section: "courses",
            field: focus[1],
          },
          actionLabel: "Maydonni ko‘rsatish",
        };
      }
      if (/\bielts\b/i.test(lower)) {
        return {
          message:
            "IELTS uchun imtihonga tayyorlov va IELTS maqsadini faqat kurs qoralamasiga qo‘yaman. Kursni saqlash yoki e’lon qilishni siz bajarasiz.",
          action: {
            type: "SET_DRAFT_VALUE",
            section: "courses",
            values: {
              course_type: "exam_prep",
              target_framework: "ielts",
            },
          },
          actionLabel: "IELTS qoralamasini qo‘llash",
        };
      }
      if (/\bcefr\b/i.test(lower)) {
        return {
          message:
            "CEFR maqsadini A1 boshlang‘ich qoralama sifatida tanlayman. Darajani keyin o‘zingiz o‘zgartira olasiz.",
          action: {
            type: "SET_DRAFT_VALUE",
            section: "courses",
            values: { target_framework: "cefr", cefr_level: "A1" },
          },
          actionLabel: "CEFR A1 qoralamasini qo‘llash",
        };
      }
      if (/(individual|yakka)/i.test(lower)) {
        return {
          message:
            "Yakka dars shakli sig‘imni 1 ga tushiradi. Bu faqat qoralama, saqlashni siz tasdiqlaysiz.",
          action: {
            type: "SET_DRAFT_VALUE",
            section: "courses",
            values: { course_type: "individual", capacity: 1 },
          },
          actionLabel: "Yakka dars qoralamasini qo‘llash",
        };
      }
      if (/(onlayn|online)/i.test(lower)) {
        return {
          message:
            "Jonli onlayn shaklini qoralamada tanlayman. Filial vakolati cheklangan bo‘lsa xavfsizlik uchun vakolatli filial bog‘lanishi saqlanadi.",
          action: {
            type: "SET_DRAFT_VALUE",
            section: "courses",
            values: { delivery_mode: "online_live" },
          },
          actionLabel: "Onlayn shaklni qo‘llash",
        };
      }
    }
    if (section === "schedule") {
      if (/(vaqt|soat)/i.test(lower) && /(qayer|ko['‘’]?rsat|och|top)/i.test(lower)) {
        return {
          message:
            "Dars boshlanish vaqti maydonini ko‘rsataman; jadvalni saqlamayman.",
          action: {
            type: "FOCUS_FIELD",
            section: "schedule",
            field: "starts_at",
          },
          actionLabel: "Vaqt maydonini ko‘rsatish",
        };
      }
      if (/(haftalik|takror)/i.test(lower)) {
        return {
          message:
            "Har hafta takrorlanadigan jadval turini qoralamada tanlayman. Kun, xona va o‘qituvchini siz tekshirasiz.",
          action: {
            type: "SET_DRAFT_VALUE",
            section: "schedule",
            values: { schedule_kind: "weekly" },
          },
          actionLabel: "Haftalik qoralamani qo‘llash",
        };
      }
    }
    if (
      section === "staff" &&
      canAny(permissions, "staff") &&
      /(filial|branch)/i.test(lower) &&
      /(qayer|ko['‘’]?rsat|och|top)/i.test(lower)
    ) {
      return {
        message:
          "Xodim formasidagi filial maydonini ko‘rsataman. Rolni yoki xodimni o‘zim biriktirmayman.",
        action: {
          type: "FOCUS_FIELD",
          section: "staff",
          field: "branch_id",
        },
        actionLabel: "Filial maydonini ko‘rsatish",
      };
    }
    if (section === "lessons" && canAny(permissions, "lessons")) {
      if (/(sarlavha|dars nom)/i.test(lower)) {
        return {
          message:
            "Dars sarlavhasi maydonini ko‘rsataman; matnni saqlamayman.",
          action: {
            type: "FOCUS_FIELD",
            section: "lessons",
            field: "title",
          },
          actionLabel: "Sarlavhani ko‘rsatish",
        };
      }
      if (/(45\s*daqiqa|45\s*minut)/i.test(lower)) {
        return {
          message:
            "Dars davomiyligini qoralamada 45 daqiqaga o‘zgartiraman. Saqlash va Word olish sizning tasdig‘ingizda.",
          action: {
            type: "SET_DRAFT_VALUE",
            section: "lessons",
            values: { duration_minutes: 45 },
          },
          actionLabel: "45 daqiqani qo‘llash",
        };
      }
    }
    if (
      section === "assessments" &&
      canAny(permissions, "assessments")
    ) {
      if (/(test nom|sarlavha)/i.test(lower)) {
        return {
          message:
            "Test nomi maydonini ko‘rsataman; testni yaratmayman yoki e’lon qilmayman.",
          action: {
            type: "FOCUS_FIELD",
            section: "assessments",
            field: "title",
          },
          actionLabel: "Test nomini ko‘rsatish",
        };
      }
      if (/\bielts\b/i.test(lower)) {
        return {
          message:
            "Baholash tizimini IELTS va davomiylikni 60 daqiqa qilib faqat qoralamada tanlayman.",
          action: {
            type: "SET_DRAFT_VALUE",
            section: "assessments",
            values: {
              assessment_type: "ielts_mock",
              framework: "ielts",
              duration_minutes: 60,
            },
          },
          actionLabel: "IELTS qoralamasini qo‘llash",
        };
      }
      if (/\bcefr\b/i.test(lower)) {
        return {
          message:
            "Baholash tizimini CEFR qilib faqat qoralamada tanlayman. Savollarni va to‘g‘ri javobni siz kiritasiz.",
          action: {
            type: "SET_DRAFT_VALUE",
            section: "assessments",
            values: {
              assessment_type: "cefr_mock",
              framework: "cefr",
            },
          },
          actionLabel: "CEFR qoralamasini qo‘llash",
        };
      }
    }
    return {
      message:
        tour.find((item) => item.key === section)?.message ||
        `${activeMeta?.[0] || "Bu"} bo‘limida faqat rolingizga ruxsat berilgan ma’lumotlar ko‘rsatiladi.`,
    };
  };

  const applyAssistantSuggestion = (action) => {
    if (
      !action ||
      !["FOCUS_FIELD", "SET_DRAFT_VALUE"].includes(action.type) ||
      action.section !== section ||
      action.section === "payments" ||
      (action.section === "staff" && action.type !== "FOCUS_FIELD")
    ) {
      return;
    }
    const allowedFields = {
      courses: new Set([
        "name",
        "subject_id",
        "branch_id",
        "teacher_user_id",
        "course_type",
        "delivery_mode",
        "target_framework",
        "cefr_level",
        "capacity",
      ]),
      schedule: new Set([
        "course_id",
        "schedule_kind",
        "starts_at",
        "duration_minutes",
        "weekdays",
      ]),
      staff: new Set(["branch_id"]),
      lessons: new Set([
        "course_id",
        "title",
        "duration_minutes",
      ]),
      assessments: new Set([
        "course_id",
        "title",
        "assessment_type",
        "duration_minutes",
        "framework",
      ]),
    };
    const sectionFields = allowedFields[action.section];
    if (!sectionFields) return;
    if (
      action.type === "FOCUS_FIELD" &&
      !sectionFields.has(action.field)
    ) {
      return;
    }
    if (action.type === "SET_DRAFT_VALUE") {
      const values = Object.fromEntries(
        Object.entries(action.values || {}).filter(([key]) =>
          sectionFields.has(key),
        ),
      );
      if (!Object.keys(values).length) return;
      action = { ...action, values };
    }
    pendingAssistantAction.current = action.type;
    window.dispatchEvent(
      new CustomEvent("samtm:center-avatar-action", {
        detail: action,
      }),
    );
    if (action.type === "FOCUS_FIELD") {
      window.setTimeout(() => {
        const field = document.querySelector(
          `[data-ai-field="${action.field}"]`,
        );
        const control = field?.querySelector("input, select, textarea, button");
        field?.scrollIntoView({ behavior: "smooth", block: "center" });
        control?.focus();
      }, 80);
    }
  };

  const shared = {
    apiBase,
    token,
    contextId: workspace.context_id,
    permissions,
    roles,
    currentUserId: dashboard.current_user_id,
    capabilities: dashboard.capabilities || {},
    linkedChildren: dashboard.linked_children || [],
  };

  return (
    <div className="lc-dashboard-shell lc-with-avatar">
      <header className="lc-dashboard-header">
        <BackButton onClick={onBack} label="Markazlarim" />
        <div className="lc-dashboard-brand">
          <span className="lc-workspace-logo">
            <GraduationCap size={22} />
          </span>
          <div>
            <h1>{center.name}</h1>
            <p>
              {center.operator_model === "independent_tutor"
                ? "Mustaqil repetitor"
                : center.ownership_type === "public"
                  ? "Davlat o‘quv markazi"
                  : "Xususiy o‘quv markazi"}
              {" · "}
              {roles.map((role) => CENTER_ROLES[role] || role).join(", ")}
            </p>
          </div>
        </div>
        <div className="lc-dashboard-tools">
          <StatusPill status={center.onboarding_status || "active"} />
          <button
            type="button"
            onClick={() => onPreferences({ enabled: !preferences.enabled })}
          >
            AI {preferences.enabled ? "yoqilgan" : "o‘chirilgan"}
          </button>
        </div>
      </header>
      <nav className="lc-dashboard-nav" aria-label="Markaz menyusi">
        {menu.map((item) => {
          const [fallbackLabel, Icon] =
            MENU_META[item.key] || [item.key, LayoutDashboard];
          return (
            <button
              type="button"
              key={item.key}
              data-ai-anchor={`center-menu-${item.key}`}
              className={section === item.key ? "active" : ""}
              onClick={() => selectSection(item.key)}
            >
              <Icon size={17} />
              {item.label && item.label !== item.key
                ? item.label
                : fallbackLabel}
            </button>
          );
        })}
      </nav>
      <main className="lc-dashboard-content">
        <ErrorNotice error={error} onRetry={load} />
        {section === "overview" && (
          <OverviewPanel
            dashboard={dashboard}
            permissions={permissions}
            onOpen={selectSection}
          />
        )}
        {section === "courses" && <CoursesPanel {...shared} />}
        {section === "groups" && <GroupsPanel {...shared} />}
        {section === "students" && <StudentsPanel {...shared} />}
        {section === "schedule" && <SchedulePanel {...shared} />}
        {section === "lessons" && <LessonsPanel {...shared} />}
        {section === "attendance" && <AttendanceGradesPanel {...shared} />}
        {section === "assessments" && <AssessmentsPanel {...shared} />}
        {section === "payments" && <PaymentsPanel {...shared} />}
        {section === "analytics" && <AnalyticsPanel {...shared} />}
        {section === "staff" && <StaffPanel {...shared} />}
        {section === "settings" && (
          <SettingsPanel
            {...shared}
            center={center}
            preferences={preferences}
            onPreferences={onPreferences}
          />
        )}
        {onLegacy && center.legacy_center_id && (
          <button type="button" className="lc-legacy" onClick={onLegacy}>
            Eski markaz oynasini ochish
          </button>
        )}
      </main>
      <GuidedAvatar
        enabled={preferences.enabled}
        variant={preferences.variant}
        speechEnabled={preferences.speechEnabled}
        apiBase={apiBase}
        steps={tour}
        activeKey={section}
        onNavigate={selectSection}
        onUndo={() => {
          const previous = history.current.pop();
          if (previous) setSection(previous);
        }}
        onQuestion={askAssistant}
        onApplySuggestion={applyAssistantSuggestion}
        onAction={assistantAction}
        onSpeechChange={(speechEnabled) =>
          onPreferences({ speechEnabled })
        }
        onEnabledChange={(enabled) => onPreferences({ enabled })}
      />
    </div>
  );
}

function OverviewPanel({ dashboard, permissions, onOpen }) {
  const counts = dashboard.counts || dashboard.metrics || {};
  const metrics = [
    ["courses", "Faol kurslar", counts.active_courses ?? counts.courses, GraduationCap],
    ["groups", "Guruhlar", counts.groups ?? counts.course_groups ?? counts.active_courses, Users],
    ["students", "O‘quvchilar", counts.students ?? counts.active_students, UserPlus],
    ["schedule", "Bugungi darslar", counts.lessons_today, CalendarDays],
    ["attendance", "Bugungi davomat", counts.present_today, BadgeCheck],
    ["payments", "Qarzdor hisoblar", counts.overdue_invoices ?? counts.debts ?? counts.debt, CircleDollarSign],
  ];
  return (
    <>
      <section className="lc-metric-grid">
        {metrics.map(([key, label, value, Icon]) => (
          <button type="button" key={key} onClick={() => onOpen(key)}>
            <span><Icon size={19} /></span>
            <small>{label}</small>
            <b>{Number(value) || 0}</b>
          </button>
        ))}
      </section>
      <section className="lc-dashboard-card lc-today-card">
        <div>
          <span className="lc-eyebrow">BUGUNGI ISH</span>
          <h2>Dars, qabul va to‘lovlar bitta kalendarda</h2>
          <p>
            Har bir rol faqat o‘z vazifasini ko‘radi. O‘qituvchi o‘z
            guruhlariga, ota-ona esa bog‘langan farzandiga kiradi.
          </p>
        </div>
        <Clock3 size={38} />
      </section>
      {!permissions.length && (
        <InfoNotice tone="warning">
          Server aniq yozish ruxsatlarini bermadi. Xavfsizlik uchun barcha
          o‘zgartirish tugmalari yopiq, ma’lumot faqat ko‘rish rejimida.
        </InfoNotice>
      )}
    </>
  );
}

function ResourceHeader({ eyebrow, title, text, canCreate, onCreate, label }) {
  return (
    <div className="lc-section-heading">
      <div>
        <span className="lc-eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {text && <p>{text}</p>}
      </div>
      {canCreate && (
        <ActionButton onClick={onCreate}>
          <Plus size={15} /> {label}
        </ActionButton>
      )}
    </div>
  );
}

function OptionResources({ apiBase, token, contextId, enabled = true }) {
  const branches = usePagedResource({
    apiBase,
    token,
    contextId,
    path: centerRoutes.branches,
    enabled,
  });
  const rooms = usePagedResource({
    apiBase,
    token,
    contextId,
    path: centerRoutes.rooms,
    enabled,
  });
  const subjects = usePagedResource({
    apiBase,
    token,
    contextId,
    path: centerRoutes.subjects,
    enabled,
  });
  const staff = usePagedResource({
    apiBase,
    token,
    contextId,
    path: centerRoutes.staff,
    query: { role: "teacher" },
    enabled,
  });
  return { branches, rooms, subjects, staff };
}

function CoursesPanel({
  apiBase,
  token,
  contextId,
  permissions,
  roles,
  capabilities,
}) {
  const canCreate = canAny(permissions, "courses");
  const studentCatalogMode = roles.includes("student") && !canCreate;
  const branchScope = capabilities?.branch_scope || {};
  const branchRestricted = branchScope.global === false;
  const authorizedBranchIds = (branchScope.branch_ids || []).map(Number);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [applicationNotice, setApplicationNotice] = useState("");
  const [activationTeachers, setActivationTeachers] = useState({});
  const [form, setForm] = useState({
    name: "",
    subject_id: "",
    branch_id: "",
    teacher_user_id: "",
    course_type: "group",
    delivery_mode: "offline",
    target_framework: "general",
    cefr_level: "A1",
    ielts_test_type: "academic",
    ielts_overall_target: "6.0",
    ielts_listening_target: "6.0",
    ielts_reading_target: "6.0",
    ielts_writing_target: "6.0",
    ielts_speaking_target: "6.0",
    level_label: "",
    capacity: 12,
    monthly_price: 400000,
    duration_minutes: 90,
    sessions_per_week: 3,
    weekdays: [1, 3, 5],
    starts_at: "17:00",
    start_date: todayValue(),
    end_date: "",
  });
  const resource = usePagedResource({
    apiBase,
    token,
    contextId,
    path: studentCatalogMode
      ? centerRoutes.courseCatalog
      : centerRoutes.courses,
  });
  const options = OptionResources({
    apiBase,
    token,
    contextId,
    enabled: canCreate,
  });

  useEffect(() => {
    if (!branchRestricted) return;
    const visible = options.branches.items.filter((branch) =>
      authorizedBranchIds.includes(Number(branch.id)),
    );
    const defaultBranchId = visible[0]?.id || authorizedBranchIds[0];
    setForm((current) => {
      const currentAllowed = authorizedBranchIds.includes(
        Number(current.branch_id),
      );
      if (currentAllowed || !defaultBranchId) return current;
      return { ...current, branch_id: String(defaultBranchId) };
    });
  }, [
    branchRestricted,
    authorizedBranchIds.join(","),
    options.branches.items.map((item) => item.id).join(","),
  ]);

  useEffect(() => {
    const handleAvatarAction = (event) => {
      const action = event.detail;
      if (action?.section !== "courses") return;
      setOpen(true);
      if (action.type !== "SET_DRAFT_VALUE") return;
      const values = action.values || {};
      setForm((current) => {
        const next = { ...current };
        if (
          COURSE_FORMATS.some((item) => item.value === values.course_type)
        ) {
          next.course_type = values.course_type;
          if (values.course_type === "individual") next.capacity = 1;
        }
        if (
          DELIVERY_FORMATS.some(
            (item) => item.value === values.delivery_mode,
          )
        ) {
          next.delivery_mode = values.delivery_mode;
        }
        if (
          ["general", "cefr", "ielts", "school", "national_exam"].includes(
            values.target_framework,
          )
        ) {
          next.target_framework = values.target_framework;
        }
        if (CEFR_LEVELS.includes(values.cefr_level)) {
          next.cefr_level = values.cefr_level;
        }
        return next;
      });
    };
    window.addEventListener(
      "samtm:center-avatar-action",
      handleAvatarAction,
    );
    return () =>
      window.removeEventListener(
        "samtm:center-avatar-action",
        handleAvatarAction,
      );
  }, []);

  const create = async () => {
    if (!canCreate || !form.name.trim() || !form.subject_id) return;
    if (
      (branchRestricted ||
        ["offline", "hybrid"].includes(form.delivery_mode)) &&
      !form.branch_id
    ) {
      setError(
        branchRestricted
          ? "Filial vakolatidagi boshqaruvchi kursni o‘z filialiga bog‘lashi shart."
          : "Markazda yoki aralash kurs uchun filialni tanlang.",
      );
      return;
    }
    if (
      branchRestricted &&
      !authorizedBranchIds.includes(Number(form.branch_id))
    ) {
      setError("Faqat vakolatingizdagi filialni tanlashingiz mumkin.");
      return;
    }
    const eligibleTeacher = options.staff.items.find(
      (item) =>
        item.role_key === "teacher" &&
        Number(item.user_id || item.id) === Number(form.teacher_user_id) &&
        (!item.branch_id ||
          Number(item.branch_id) === Number(form.branch_id)) &&
        (!item.subject_ids?.length ||
          item.subject_ids.some(
            (subjectId) => Number(subjectId) === Number(form.subject_id),
          )),
    );
    if (form.teacher_user_id && !eligibleTeacher) {
      setError(
        "Tanlangan o‘qituvchi kurs filiali yoki faniga biriktirilmagan.",
      );
      return;
    }
    if (
      form.teacher_user_id &&
      (!form.weekdays.length || !form.starts_at)
    ) {
      setError("O‘qituvchi tanlansa, dars kunlari va vaqtini ham kiriting.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const payloadForm = form.teacher_user_id
        ? {
            ...form,
            sessions_per_week: form.weekdays.length,
          }
        : {
            ...form,
            weekdays: [],
            starts_at: "",
          };
      await centerApi(centerRoutes.courses, {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canCreate,
        idempotencyKey: makeIdempotencyKey("course", [
          contextId,
          form.name,
        ]),
        body: buildCoursePayload(payloadForm),
      });
      setOpen(false);
      setForm((current) => ({ ...current, name: "" }));
      resource.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const applyToCourse = async (item) => {
    if (!studentCatalogMode || item.available_seats < 1) return;
    setBusy(true);
    setError("");
    setApplicationNotice("");
    try {
      await centerApi(centerRoutes.enrollments, {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: true,
        idempotencyKey: makeIdempotencyKey("self-enrollment", [
          contextId,
          item.id,
        ]),
        body: {
          course_id: Number(item.id),
          student_user_id: null,
          requested_status: "pending",
          note: null,
          start_date: todayValue(),
          confirmation: false,
        },
      });
      setApplicationNotice(
        `${item.name} kursiga ariza yuborildi. Qabulxona tasdiqlagach faol bo‘ladi.`,
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const activate = async (item) => {
    if (!canCreate) return;
    const teacherId =
      activationTeachers[item.id] || item.teacher_user_id || null;
    setBusy(true);
    setError("");
    try {
      await centerApi(centerRoutes.courseActivate(item.id), {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canCreate,
        body: {
          teacher_user_id: teacherId ? Number(teacherId) : null,
          confirmation: true,
        },
      });
      resource.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="lc-dashboard-card">
      <ResourceHeader
        eyebrow="KURSLAR"
        title="Repetitorlik, to‘garak va imtihonga tayyorlov"
        text={
          studentCatalogMode
            ? "Faol kursni tanlab qabulxonaga ariza yuboring."
            : roles.includes("teacher")
            ? "Server faqat sizga biriktirilgan kurslarni qaytaradi."
            : "Fan, o‘qituvchi, format, maqsad va narx bir joyda."
        }
        canCreate={canCreate}
        onCreate={() => setOpen((value) => !value)}
        label="Yangi kurs"
      />
      <ErrorNotice error={error || resource.error} onRetry={resource.reload} />
      {applicationNotice && <InfoNotice>{applicationNotice}</InfoNotice>}
      {open && (
        <div className="lc-inline-form">
          <div className="lc-form-grid">
            <Field label="Kurs nomi" wide aiField="name">
              <input
                value={form.name}
                maxLength={180}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                placeholder="Masalan: IELTS Foundation"
              />
            </Field>
            <Field label="Fan" aiField="subject_id">
              <select
                value={form.subject_id}
                onChange={(event) =>
                  setForm({ ...form, subject_id: event.target.value })
                }
              >
                <option value="">Tanlang</option>
                {options.subjects.items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Kurs turi" aiField="course_type">
              <select
                value={form.course_type}
                onChange={(event) => {
                  const courseType = event.target.value;
                  setForm({
                    ...form,
                    course_type: courseType,
                    capacity: courseType === "individual" ? 1 : form.capacity,
                  });
                }}
              >
                {COURSE_FORMATS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="O‘qitish shakli" aiField="delivery_mode">
              <select
                value={form.delivery_mode}
                onChange={(event) =>
                  setForm({ ...form, delivery_mode: event.target.value })
                }
              >
                {DELIVERY_FORMATS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Filial"
              aiField="branch_id"
              hint={
                ["offline", "hybrid"].includes(form.delivery_mode)
                  ? "Bu o‘qitish shaklida filial majburiy."
                  : "Jonli onlayn kurs filialsiz bo‘lishi mumkin."
              }
            >
              <select
                value={form.branch_id}
                onChange={(event) =>
                  setForm({ ...form, branch_id: event.target.value })
                }
              >
                {!branchRestricted && (
                  <option value="">
                    {["offline", "hybrid"].includes(form.delivery_mode)
                      ? "Filialni tanlang"
                      : "Filialsiz/onlayn"}
                  </option>
                )}
                {branchRestricted && !form.branch_id && (
                  <option value="" disabled>
                    Vakolatli filial yuklanmoqda
                  </option>
                )}
                {options.branches.items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="O‘qituvchi" aiField="teacher_user_id">
              <select
                value={form.teacher_user_id}
                onChange={(event) =>
                  setForm({ ...form, teacher_user_id: event.target.value })
                }
              >
                <option value="">Keyin biriktirish</option>
                {options.staff.items
                  .filter(
                    (item) =>
                      item.role_key === "teacher" &&
                      (!item.branch_id ||
                        Number(item.branch_id) ===
                          Number(form.branch_id)) &&
                      (!form.subject_id ||
                        !item.subject_ids?.length ||
                        item.subject_ids.some(
                          (subjectId) =>
                            Number(subjectId) ===
                            Number(form.subject_id),
                        )),
                  )
                  .map((item) => (
                  <option
                    key={item.user_id || item.id}
                    value={item.user_id || item.id}
                  >
                    {item.full_name || item.name}
                  </option>
                  ))}
              </select>
            </Field>
            <Field
              label="Maqsad"
              aiField="target_framework"
              hint="CEFR va IELTS o‘rtasida avtomatik tenglik yo‘q."
            >
              <select
                value={form.target_framework}
                onChange={(event) =>
                  setForm({ ...form, target_framework: event.target.value })
                }
              >
                <option value="general">Umumiy daraja</option>
                <option value="cefr">CEFR</option>
                <option value="ielts">IELTS</option>
                <option value="school">Maktab/sinf</option>
                <option value="national_exam">Milliy imtihon</option>
              </select>
            </Field>
            {form.target_framework === "cefr" && (
              <Field label="CEFR" aiField="cefr_level">
                <select
                  value={form.cefr_level}
                  onChange={(event) =>
                    setForm({ ...form, cefr_level: event.target.value })
                  }
                >
                  {CEFR_LEVELS.map((level) => (
                    <option key={level}>{level}</option>
                  ))}
                </select>
              </Field>
            )}
            {form.target_framework === "ielts" && (
              <IeltsTargetFields form={form} setForm={setForm} />
            )}
            {!["cefr", "ielts"].includes(form.target_framework) && (
              <Field label="Daraja/sinf">
                <input
                  value={form.level_label}
                  maxLength={80}
                  onChange={(event) =>
                    setForm({ ...form, level_label: event.target.value })
                  }
                  placeholder="Masalan: 9-sinf yoki boshlang‘ich"
                />
              </Field>
            )}
            <Field label="Sig‘im" aiField="capacity">
              <input
                type="number"
                min="1"
                max="200"
                value={form.capacity}
                disabled={form.course_type === "individual"}
                onChange={(event) =>
                  setForm({ ...form, capacity: Number(event.target.value) })
                }
              />
            </Field>
            <Field label="Oyiga narx">
              <input
                type="number"
                min="0"
                step="10000"
                value={form.monthly_price}
                onChange={(event) =>
                  setForm({
                    ...form,
                    monthly_price: Number(event.target.value),
                  })
                }
              />
            </Field>
            <Field label="Haftasiga">
              <select
                value={form.sessions_per_week}
                onChange={(event) =>
                  setForm({
                    ...form,
                    sessions_per_week: Number(event.target.value),
                  })
                }
              >
                {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                  <option key={value} value={value}>
                    {value} dars
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Davomiyligi">
              <select
                value={form.duration_minutes}
                onChange={(event) =>
                  setForm({
                    ...form,
                    duration_minutes: Number(event.target.value),
                  })
                }
              >
                {[45, 60, 80, 90, 120, 180].map((value) => (
                  <option key={value} value={value}>
                    {value} daqiqa
                  </option>
                ))}
              </select>
            </Field>
            {form.teacher_user_id ? (
              <Field label="Boshlanish vaqti">
                <input
                  type="time"
                  value={form.starts_at}
                  onChange={(event) =>
                    setForm({ ...form, starts_at: event.target.value })
                  }
                />
              </Field>
            ) : (
              <InfoNotice>
                O‘qituvchi hali tanlanmasa aniq kun va vaqt saqlanmaydi.
                Keyin Jadval bo‘limida o‘qituvchi hamda xona bilan birga
                kiriting.
              </InfoNotice>
            )}
            <Field label="Boshlanish sanasi">
              <input
                type="date"
                value={form.start_date}
                onChange={(event) =>
                  setForm({ ...form, start_date: event.target.value })
                }
              />
            </Field>
            <Field label="Tugash sanasi">
              <input
                type="date"
                value={form.end_date}
                onChange={(event) =>
                  setForm({ ...form, end_date: event.target.value })
                }
              />
            </Field>
            {form.teacher_user_id && (
              <Field label="Hafta kunlari" wide>
                <WeekdayPicker
                  value={form.weekdays}
                  onChange={(weekdays) =>
                    setForm({
                      ...form,
                      weekdays,
                      sessions_per_week:
                        weekdays.length || form.sessions_per_week,
                    })
                  }
                />
              </Field>
            )}
          </div>
          <SelectorPagination
            resources={[
              ["Fanlar", options.subjects],
              ["Filiallar", options.branches],
              ["O‘qituvchilar", options.staff],
            ]}
          />
          <InfoNotice>
            Yangi kurs qoralama yaratiladi. E’lon qilish, o‘quvchi qabul qilish
            va to‘lov yozish alohida inson tasdig‘idir.
          </InfoNotice>
          <ActionButton
            busy={busy}
            disabled={!form.name.trim() || !form.subject_id}
            onClick={create}
          >
            Kurs qoralamasini saqlash
          </ActionButton>
        </div>
      )}
      {resource.busy && !resource.items.length ? (
        <LoadingBlock />
      ) : resource.items.length ? (
        <div className="lc-entity-grid">
          {resource.items.map((item) => (
            <article key={item.id}>
              <span className="lc-list-icon"><GraduationCap size={18} /></span>
              <div>
                <h3>{item.name}</h3>
                <p>
                  {item.subject_name || "Fan"} ·{" "}
                  {COURSE_FORMATS.find(
                    (option) =>
                      option.value === (item.course_type || item.format_key),
                  )?.label || item.course_type}
                </p>
                <small>
                  {item.target_framework === "cefr"
                    ? `CEFR ${item.cefr_level || item.level_from || ""}`
                    : item.target_framework === "ielts"
                      ? `IELTS ${item.ielts_overall_target || item.target_score || ""}`
                      : item.level_label || "Umumiy"}
                  {" · "}
                  {item.teacher_name || "O‘qituvchi biriktirilmagan"}
                </small>
              </div>
              <div className="lc-entity-end">
                <StatusPill status={item.status || "draft"} />
                <b>{item.enrolled_count ?? item.student_count ?? 0}/{item.capacity || "∞"}</b>
                {studentCatalogMode && (
                  <button
                    type="button"
                    disabled={busy || Number(item.available_seats) < 1}
                    onClick={() => applyToCourse(item)}
                  >
                    {Number(item.available_seats) < 1
                      ? "Joy qolmagan"
                      : "Kursga ariza berish"}
                  </button>
                )}
                {canCreate && item.status === "draft" && (
                  <>
                    {!item.teacher_user_id && (
                      <select
                        aria-label={`${item.name} uchun o‘qituvchi`}
                        value={activationTeachers[item.id] || ""}
                        onChange={(event) =>
                          setActivationTeachers((current) => ({
                            ...current,
                            [item.id]: event.target.value,
                          }))
                        }
                      >
                        <option value="">O‘qituvchini tanlang</option>
                        {options.staff.items
                          .filter((staff) => staff.role_key === "teacher")
                          .map((staff) => (
                            <option
                              key={staff.user_id || staff.id}
                              value={staff.user_id || staff.id}
                            >
                              {staff.full_name || staff.name}
                            </option>
                          ))}
                      </select>
                    )}
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => activate(item)}
                    >
                      Men tekshirdim — jadval o‘qituvchisi bilan faollashtirish
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={GraduationCap}
          title="Kurs topilmadi"
          text="Vakolatingiz bo‘lsa birinchi kurs qoralamasini yarating."
        />
      )}
      {canCreate && (
        <SelectorPagination
          resources={[["O‘qituvchilar", options.staff]]}
        />
      )}
      <LoadMore resource={resource} />
    </section>
  );
}

function IeltsTargetFields({ form, setForm }) {
  const targets = [
    ["ielts_overall_target", "Overall"],
    ["ielts_listening_target", "Listening"],
    ["ielts_reading_target", "Reading"],
    ["ielts_writing_target", "Writing"],
    ["ielts_speaking_target", "Speaking"],
  ];
  return (
    <>
      <Field label="IELTS turi">
        <select
          value={form.ielts_test_type}
          onChange={(event) =>
            setForm({ ...form, ielts_test_type: event.target.value })
          }
        >
          {IELTS_TYPES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </Field>
      {targets.map(([key, label]) => (
        <Field label={`${label} maqsadi`} key={key}>
          <select
            value={form[key]}
            onChange={(event) =>
              setForm({ ...form, [key]: event.target.value })
            }
          >
            {IELTS_BANDS.map((band) => (
              <option key={band}>{band}</option>
            ))}
          </select>
        </Field>
      ))}
    </>
  );
}

function GroupsPanel(props) {
  const resource = usePagedResource({
    apiBase: props.apiBase,
    token: props.token,
    contextId: props.contextId,
    path: centerRoutes.courses,
    query: { view: "groups" },
  });
  return (
    <section className="lc-dashboard-card">
      <ResourceHeader
        eyebrow="GURUHLAR"
        title="O‘qituvchi, xona va o‘quvchilar bog‘lanishi"
        text={
          props.roles.includes("teacher")
            ? "Faqat sizga biriktirilgan guruhlar."
            : "Kurs ichidagi faol guruhlar va bo‘sh joylar."
        }
      />
      <ErrorNotice error={resource.error} onRetry={resource.reload} />
      {resource.busy && !resource.items.length ? (
        <LoadingBlock />
      ) : resource.items.length ? (
        <div className="lc-group-grid">
          {resource.items.map((item) => (
            <article key={item.id}>
              <header>
                <span><Users size={18} /></span>
                <StatusPill status={item.status || "active"} />
              </header>
              <h3>{item.group_name || item.name}</h3>
              <p>{item.subject_name || "Fan"} · {item.teacher_name || "O‘qituvchi"}</p>
              <div>
                <small>O‘quvchi</small>
                <b>
                  {item.enrolled_count ?? item.student_count ?? 0}/
                  {item.capacity || "∞"}
                </b>
              </div>
              <div>
                <small>Jadval</small>
                <b>{item.schedule_label || "Belgilanmagan"}</b>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="Guruh yo‘q"
          text="Guruh kurs ochilganda yoki o‘quvchilar qabul qilinganda ko‘rinadi."
        />
      )}
      <LoadMore resource={resource} />
    </section>
  );
}

function StudentsPanel({
  apiBase,
  token,
  contextId,
  permissions,
  roles,
  capabilities,
}) {
  const canManage = canAny(permissions, "enrollments");
  const canManageParentLinks =
    capabilities?.can_manage_parent_links === true;
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [parentLinkTarget, setParentLinkTarget] = useState(null);
  const [parentQuery, setParentQuery] = useState("");
  const [parentResults, setParentResults] = useState([]);
  const [parentUserId, setParentUserId] = useState("");
  const [parentLinks, setParentLinks] = useState([]);
  const [parentLinksBusy, setParentLinksBusy] = useState(false);
  const [form, setForm] = useState({
    course_id: "",
    student_user_id: "",
    start_date: todayValue(),
    entry_status: "pending",
    notes: "",
  });
  const resource = usePagedResource({
    apiBase,
    token,
    contextId,
    path: centerRoutes.enrollments,
    query: { status },
  });
  const courses = usePagedResource({
    apiBase,
    token,
    contextId,
    path: centerRoutes.courses,
    query: { status: "active" },
  });
  const create = async () => {
    if (!canManage || !form.course_id || !form.student_user_id) return;
    setBusy(true);
    setError("");
    try {
      await centerApi(centerRoutes.enrollments, {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canManage,
        idempotencyKey: makeIdempotencyKey("enrollment", [
          form.course_id,
          form.student_user_id,
        ]),
        body: buildEnrollmentPayload(form),
      });
      setOpen(false);
      setForm((current) => ({
        ...current,
        student_user_id: "",
        notes: "",
      }));
      setUserQuery("");
      setUserResults([]);
      resource.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const searchUsers = async () => {
    if (userQuery.trim().length < 3) {
      setError("O‘quvchi ismi yoki hisob ID sidan kamida 3 ta belgi yozing.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const data = await centerApi(centerRoutes.userSearch, {
        apiBase,
        token,
        contextId,
        query: { q: userQuery.trim(), limit: 20 },
      });
      setUserResults(data.items || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const searchParents = async () => {
    if (parentQuery.trim().length < 3) {
      setError("Ota-ona ismi yoki hisob ID sidan kamida 3 ta belgi yozing.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const data = await centerApi(centerRoutes.userSearch, {
        apiBase,
        token,
        contextId,
        query: { q: parentQuery.trim(), limit: 20 },
      });
      setParentResults(data.items || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const loadParentLinks = async (studentUserId) => {
    if (!canManageParentLinks || !studentUserId) return;
    setParentLinksBusy(true);
    try {
      const data = await centerApi(centerRoutes.parentLinks, {
        apiBase,
        token,
        contextId,
        query: {
          student_user_id: Number(studentUserId),
          status: "active",
          limit: 100,
        },
      });
      setParentLinks(data.items || []);
    } catch (requestError) {
      setError(requestError.message);
      setParentLinks([]);
    } finally {
      setParentLinksBusy(false);
    }
  };

  const linkParent = async () => {
    if (
      !canManageParentLinks ||
      !parentLinkTarget ||
      !parentUserId
    ) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      await centerApi(centerRoutes.parentLinks, {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canManage,
        body: {
          parent_user_id: Number(parentUserId),
          student_user_id: Number(parentLinkTarget.student_user_id),
          branch_id: null,
          confirmation: true,
        },
      });
      setParentQuery("");
      setParentResults([]);
      setParentUserId("");
      await loadParentLinks(parentLinkTarget.student_user_id);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const revokeParent = async (link) => {
    if (
      !canManageParentLinks ||
      !link?.parent_user_id ||
      !link?.student_user_id
    ) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      await centerApi(
        centerRoutes.parentLinkRevoke(
          link.parent_user_id,
          link.student_user_id,
        ),
        {
          apiBase,
          token,
          contextId,
          method: "POST",
          allowed: canManage,
          body: { confirmation: true },
        },
      );
      await loadParentLinks(link.student_user_id);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const decide = async (item, decision) => {
    if (!canManage) return;
    setBusy(true);
    setError("");
    try {
      await centerApi(centerRoutes.enrollmentDecision(item.id), {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canManage,
        body: buildEnrollmentDecision(decision),
      });
      resource.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="lc-dashboard-card">
      <ResourceHeader
        eyebrow="O‘QUVCHILAR"
        title="Qabul, faol o‘quvchi va kutish ro‘yxati"
        text={
          roles.includes("parent")
            ? "Faqat hisobingizga bog‘langan farzandlar."
            : roles.includes("student")
              ? "Faqat o‘zingizga tegishli kurslar."
              : "Kursga qabul serverda foydalanuvchi va sig‘imni tekshiradi."
        }
        canCreate={canManage}
        onCreate={() => setOpen((value) => !value)}
        label="Kursga yozish"
      />
      <div className="lc-filter-row">
        <Field label="Holat">
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">Barchasi</option>
            <option value="pending">Kutilmoqda</option>
            <option value="active">Faol</option>
            <option value="waitlisted">Kutish ro‘yxati</option>
            <option value="paused">Pauzada</option>
            <option value="rejected">Rad etilgan</option>
            <option value="withdrawn">Chiqarilgan</option>
            <option value="completed">Yakunlangan</option>
          </select>
        </Field>
      </div>
      <ErrorNotice error={error || resource.error} onRetry={resource.reload} />
      {canManage && !canManageParentLinks && (
        <InfoNotice>
          Ota-ona bog‘lanishini faqat markaz miqyosidagi qabul
          administratori boshqaradi. Filial vakolati bilan o‘quvchi qabulini
          davom ettirishingiz mumkin.
        </InfoNotice>
      )}
      {parentLinkTarget && canManageParentLinks && (
        <div className="lc-inline-form">
          <div className="lc-section-heading">
            <div>
              <span className="lc-eyebrow">OTA-ONA BOG‘LANISHI</span>
              <h3>{parentLinkTarget.student_name}</h3>
            </div>
            <button
              type="button"
              className="lc-text-danger"
              onClick={() => setParentLinkTarget(null)}
            >
              <X size={14} /> Yopish
            </button>
          </div>
          <Field
            label="Ota-onani ism yoki hisob ID bilan topish"
            hint="Bog‘lanishdan keyin ota-ona faqat shu farzand ma’lumotini ko‘radi."
            wide
          >
            <div className="lc-search-control">
              <input
                value={parentQuery}
                maxLength={100}
                onChange={(event) => {
                  setParentQuery(event.target.value);
                  setParentResults([]);
                  setParentUserId("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    searchParents();
                  }
                }}
                placeholder="Kamida 3 ta belgi"
              />
              <ActionButton secondary busy={busy} onClick={searchParents}>
                <Search size={14} /> Qidirish
              </ActionButton>
            </div>
          </Field>
          <div>
            <span className="lc-eyebrow">FAOL BOG‘LANISHLAR</span>
            {parentLinksBusy ? (
              <LoadingBlock text="Ota-onalar yuklanmoqda..." />
            ) : parentLinks.length ? (
              <div className="lc-user-results">
                {parentLinks.map((link) => (
                  <div
                    key={`${link.parent_user_id}-${link.student_user_id}`}
                    className="lc-linked-user"
                  >
                    <span>
                      <b>
                        {link.parent_name ||
                          `Ota-ona #${link.parent_user_id}`}
                      </b>
                      <small>Faol ota-ona bog‘lanishi</small>
                    </span>
                    <ActionButton
                      danger
                      busy={busy}
                      onClick={() => revokeParent(link)}
                    >
                      Bekor qilish
                    </ActionButton>
                  </div>
                ))}
              </div>
            ) : (
              <InfoNotice>Bu o‘quvchiga faol ota-ona bog‘lanmagan.</InfoNotice>
            )}
          </div>
          {parentResults.length > 0 && (
            <div className="lc-user-results">
              {parentResults.map((user) => (
                <button
                  type="button"
                  key={user.user_id}
                  className={
                    Number(parentUserId) === Number(user.user_id)
                      ? "selected"
                      : ""
                  }
                  onClick={() => setParentUserId(String(user.user_id))}
                >
                  <span>
                    <b>{user.full_name}</b>
                    <small>
                      {user.account_identifier ||
                        `Hisob #${user.user_id}`}
                    </small>
                  </span>
                  {Number(parentUserId) === Number(user.user_id) && (
                    <Check size={15} />
                  )}
                </button>
              ))}
            </div>
          )}
          <ActionButton
            busy={busy}
            disabled={!parentUserId}
            onClick={linkParent}
          >
            Men tekshirdim — ota-onani bog‘lash
          </ActionButton>
        </div>
      )}
      {open && (
        <div className="lc-inline-form">
          <div className="lc-form-grid">
            <Field label="Kurs" aiField="course_id">
              <select
                value={form.course_id}
                onChange={(event) =>
                  setForm({ ...form, course_id: event.target.value })
                }
              >
                <option value="">Tanlang</option>
                {courses.items.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="O‘quvchini ism yoki hisob ID bilan topish"
              hint="Faqat qidiruvdan chiqqan tasdiqlangan hisobni tanlang."
              wide
            >
              <div className="lc-search-control">
                <input
                  value={userQuery}
                  maxLength={100}
                  onChange={(event) => {
                    setUserQuery(event.target.value);
                    setUserResults([]);
                    setForm({ ...form, student_user_id: "" });
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      searchUsers();
                    }
                  }}
                  placeholder="Kamida 3 ta belgi"
                />
                <ActionButton
                  secondary
                  busy={busy}
                  onClick={searchUsers}
                >
                  <Search size={14} /> Qidirish
                </ActionButton>
              </div>
            </Field>
            {userResults.length > 0 && (
              <div className="lc-user-results">
                {userResults.map((user) => (
                  <button
                    type="button"
                    key={user.user_id}
                    className={
                      Number(form.student_user_id) === Number(user.user_id)
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      setForm({
                        ...form,
                        student_user_id: String(user.user_id),
                      })
                    }
                  >
                    <span>
                      <b>{user.full_name}</b>
                      <small>
                        {user.account_identifier ||
                          `Hisob #${user.user_id}`}
                      </small>
                    </span>
                    {Number(form.student_user_id) === Number(user.user_id) && (
                      <Check size={15} />
                    )}
                  </button>
                ))}
              </div>
            )}
            <Field label="Boshlanish sanasi">
              <input
                type="date"
                value={form.start_date}
                onChange={(event) =>
                  setForm({ ...form, start_date: event.target.value })
                }
              />
            </Field>
            <Field label="Qabul turi">
              <select
                value={form.entry_status}
                onChange={(event) =>
                  setForm({ ...form, entry_status: event.target.value })
                }
              >
                <option value="pending">Avval tekshirish</option>
                <option value="waitlisted">Kutish ro‘yxati</option>
              </select>
            </Field>
            <Field label="Izoh" wide>
              <textarea
                maxLength={500}
                value={form.notes}
                onChange={(event) =>
                  setForm({ ...form, notes: event.target.value })
                }
              />
            </Field>
          </div>
          <SelectorPagination
            resources={[["Kurslar", courses]]}
          />
          <ActionButton busy={busy} onClick={create}>
            Qabul so‘rovini saqlash
          </ActionButton>
        </div>
      )}
      {resource.busy && !resource.items.length ? (
        <LoadingBlock />
      ) : resource.items.length ? (
        <div className="lc-table-wrap">
          <table className="lc-table">
            <thead>
              <tr>
                <th>O‘quvchi</th>
                <th>Kurs</th>
                <th>Boshlangan</th>
                <th>Holat</th>
                <th>Amal</th>
              </tr>
            </thead>
            <tbody>
              {resource.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.student_name || `O‘quvchi #${item.student_user_id}`}</td>
                  <td>{item.course_name || "—"}</td>
                  <td>{item.start_date || "—"}</td>
                  <td><StatusPill status={item.status} /></td>
                  <td>
                    {canManage ? (
                      <div className="lc-row-actions">
                        {["pending", "waitlisted", "paused"].includes(
                          item.status,
                        ) && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => decide(item, "approve")}
                          >
                            {item.status === "paused"
                              ? "Qayta faollashtirish"
                              : "Qabul qilish"}
                          </button>
                        )}
                        {item.status === "pending" && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => decide(item, "waitlist")}
                          >
                            Kutishga
                          </button>
                        )}
                        {item.status === "active" &&
                          canManageParentLinks && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => decide(item, "pause")}
                          >
                            Pauza
                          </button>
                        )}
                        {["pending", "waitlisted"].includes(item.status) && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => decide(item, "reject")}
                          >
                            Rad etish
                          </button>
                        )}
                        {["active", "paused", "waitlisted"].includes(
                          item.status,
                        ) && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => decide(item, "withdraw")}
                          >
                            Kursdan chiqarish
                          </button>
                        )}
                        {item.status === "active" && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => {
                              setParentLinkTarget(item);
                              setParentQuery("");
                              setParentResults([]);
                              setParentUserId("");
                              setParentLinks([]);
                              loadParentLinks(item.student_user_id);
                            }}
                          >
                            Ota-ona bog‘lash
                          </button>
                        )}
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={UserPlus}
          title="O‘quvchi topilmadi"
          text="Tanlangan holatda qabul yozuvi yo‘q."
        />
      )}
      <LoadMore resource={resource} />
    </section>
  );
}

function SchedulePanel({ apiBase, token, contextId, permissions, roles }) {
  const canManage = canAny(permissions, "schedule");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fromDate, setFromDate] = useState(todayValue());
  const [form, setForm] = useState({
    course_id: "",
    room_id: "",
    teacher_user_id: "",
    schedule_kind: "weekly",
    weekdays: [1, 3, 5],
    lesson_date: todayValue(),
    effective_from: todayValue(),
    effective_to: "",
    starts_at: "17:00",
    duration_minutes: 90,
    topic: "",
  });
  const resource = usePagedResource({
    apiBase,
    token,
    contextId,
    path: centerRoutes.schedule,
    query: { from_date: fromDate },
  });
  const options = OptionResources({ apiBase, token, contextId });
  const courses = usePagedResource({
    apiBase,
    token,
    contextId,
    path: centerRoutes.courses,
  });

  useEffect(() => {
    const handleAvatarAction = (event) => {
      const action = event.detail;
      if (action?.section !== "schedule") return;
      setOpen(true);
      if (action.type !== "SET_DRAFT_VALUE") return;
      const values = action.values || {};
      setForm((current) => ({
        ...current,
        schedule_kind: ["weekly", "dated"].includes(values.schedule_kind)
          ? values.schedule_kind
          : current.schedule_kind,
      }));
    };
    window.addEventListener(
      "samtm:center-avatar-action",
      handleAvatarAction,
    );
    return () =>
      window.removeEventListener(
        "samtm:center-avatar-action",
        handleAvatarAction,
      );
  }, []);

  const create = async () => {
    if (
      !canManage ||
      !form.course_id ||
      (form.schedule_kind === "dated" && !form.lesson_date) ||
      (form.schedule_kind === "weekly" &&
        (!form.effective_from || !form.weekdays.length))
    ) {
      setError("Kurs va jadval sanasi yoki hafta kunlarini to‘liq kiriting.");
      return;
    }
    const selectedCourse = courses.items.find(
      (item) => Number(item.id) === Number(form.course_id),
    );
    const teacherId =
      form.teacher_user_id || selectedCourse?.teacher_user_id || "";
    if (!selectedCourse || !teacherId) {
      setError("Avval kurs va shu fanga biriktirilgan o‘qituvchini tanlang.");
      return;
    }
    if (
      selectedCourse.delivery_mode === "offline" &&
      !form.room_id
    ) {
      setError("Markazdagi dars uchun mos xonani tanlang.");
      return;
    }
    const eligibleTeacher = options.staff.items.find(
      (item) =>
        item.role_key === "teacher" &&
        Number(item.user_id || item.id) === Number(teacherId) &&
        (!item.branch_id ||
          Number(item.branch_id) === Number(selectedCourse.branch_id)) &&
        (!item.subject_ids?.length ||
          item.subject_ids.some(
            (subjectId) =>
              Number(subjectId) === Number(selectedCourse.subject_id),
          )),
    );
    if (!eligibleTeacher) {
      setError(
        "O‘qituvchi kursning filiali va faniga biriktirilmagan.",
      );
      return;
    }
    setBusy(true);
    setError("");
    try {
      const publishNow = selectedCourse.status === "active";
      const weekdays =
        form.schedule_kind === "weekly" ? form.weekdays : [null];
      for (const weekday of weekdays) {
        const payloadForm = {
          ...form,
          weekday,
          teacher_user_id: teacherId,
          status: publishNow ? "published" : "draft",
        };
        await centerApi(centerRoutes.schedule, {
          apiBase,
          token,
          contextId,
          method: "POST",
          allowed: canManage,
          idempotencyKey: makeIdempotencyKey("schedule", [
            form.course_id,
            form.schedule_kind,
            weekday || form.lesson_date,
            form.starts_at,
            form.room_id,
            teacherId,
          ]),
          body: buildSchedulePayload(payloadForm),
        });
        if (form.schedule_kind === "weekly") {
          setForm((current) => ({
            ...current,
            weekdays: current.weekdays.filter(
              (item) => Number(item) !== Number(weekday),
            ),
          }));
        }
      }
      setOpen(false);
      if (form.schedule_kind === "weekly") {
        setForm((current) => ({
          ...current,
          weekdays: [1, 3, 5],
        }));
      }
      resource.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const publishSlot = async (item) => {
    if (!canManage || item.status !== "draft") return;
    setBusy(true);
    setError("");
    try {
      await centerApi(centerRoutes.schedulePublish(item.id), {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canManage,
        body: { confirmation: true },
      });
      resource.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="lc-dashboard-card">
      <ResourceHeader
        eyebrow="JADVAL"
        title="Darslar kalendari"
        text={
          roles.includes("teacher")
            ? "Faqat sizga biriktirilgan darslar."
            : "Xona, o‘qituvchi va guruh to‘qnashuvi serverda tekshiriladi."
        }
        canCreate={canManage}
        onCreate={() => setOpen((value) => !value)}
        label="Dars qo‘shish"
      />
      <div className="lc-filter-row">
        <Field label="Boshlanish sanasi">
          <input
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
          />
        </Field>
      </div>
      <ErrorNotice error={error || resource.error} onRetry={resource.reload} />
      {open && (
        <div className="lc-inline-form">
          <div className="lc-form-grid">
            <Field label="Kurs" aiField="course_id">
              <select
                value={form.course_id}
                onChange={(event) => {
                  const courseId = event.target.value;
                  const course = courses.items.find(
                    (item) => Number(item.id) === Number(courseId),
                  );
                  setForm({
                    ...form,
                    course_id: courseId,
                    teacher_user_id: course?.teacher_user_id
                      ? String(course.teacher_user_id)
                      : "",
                    duration_minutes:
                      course?.duration_minutes || form.duration_minutes,
                    room_id: "",
                  });
                }}
              >
                <option value="">Tanlang</option>
                {courses.items.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name} ·{" "}
                    {course.status === "draft" ? "qoralama" : "faol"}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Jadval turi" aiField="schedule_kind">
              <select
                value={form.schedule_kind}
                onChange={(event) =>
                  setForm({
                    ...form,
                    schedule_kind: event.target.value,
                  })
                }
              >
                <option value="weekly">Har hafta takrorlanadi</option>
                <option value="dated">Bir kunlik qo‘shimcha dars</option>
              </select>
            </Field>
            {form.schedule_kind === "dated" ? (
              <Field label="Sana">
                <input
                  type="date"
                  value={form.lesson_date}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      lesson_date: event.target.value,
                    })
                  }
                />
              </Field>
            ) : (
              <>
                <Field label="Boshlanish sanasi">
                  <input
                    type="date"
                    value={form.effective_from}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        effective_from: event.target.value,
                      })
                    }
                  />
                </Field>
                <Field label="Tugash sanasi">
                  <input
                    type="date"
                    value={form.effective_to}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        effective_to: event.target.value,
                      })
                    }
                  />
                </Field>
                <Field label="Hafta kunlari" wide aiField="weekdays">
                  <WeekdayPicker
                    value={form.weekdays}
                    onChange={(weekdays) =>
                      setForm({ ...form, weekdays })
                    }
                  />
                </Field>
              </>
            )}
            <Field label="Boshlanish" aiField="starts_at">
              <input
                type="time"
                value={form.starts_at}
                onChange={(event) =>
                  setForm({ ...form, starts_at: event.target.value })
                }
              />
            </Field>
            <Field label="Davomiyligi" aiField="duration_minutes">
              <select
                value={form.duration_minutes}
                onChange={(event) =>
                  setForm({
                    ...form,
                    duration_minutes: Number(event.target.value),
                  })
                }
              >
                {[45, 60, 80, 90, 120, 180].map((value) => (
                  <option key={value} value={value}>
                    {value} daqiqa
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Xona">
              <select
                value={form.room_id}
                onChange={(event) =>
                  setForm({ ...form, room_id: event.target.value })
                }
              >
                <option value="">Onlayn/xonasiz</option>
                {options.rooms.items
                  .filter(() => {
                    const course = courses.items.find(
                      (item) =>
                        Number(item.id) === Number(form.course_id),
                    );
                    return course;
                  })
                  .filter((room) => {
                    const course = courses.items.find(
                      (item) =>
                        Number(item.id) === Number(form.course_id),
                    );
                    return (
                      !course?.branch_id ||
                      Number(room.branch_id) === Number(course.branch_id)
                    );
                  })
                  .map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.branch_name ? `${room.branch_name} · ` : ""}
                    {room.name}
                  </option>
                  ))}
              </select>
            </Field>
            <Field label="O‘qituvchi">
              <select
                value={form.teacher_user_id}
                onChange={(event) =>
                  setForm({ ...form, teacher_user_id: event.target.value })
                }
              >
                <option value="">Kurs o‘qituvchisi</option>
                {options.staff.items
                  .filter((item) => {
                    const course = courses.items.find(
                      (entry) =>
                        Number(entry.id) === Number(form.course_id),
                    );
                    return (
                      item.role_key === "teacher" &&
                      (!item.branch_id ||
                        Number(item.branch_id) ===
                          Number(course?.branch_id)) &&
                      (!course?.subject_id ||
                        !item.subject_ids?.length ||
                        item.subject_ids.some(
                          (subjectId) =>
                            Number(subjectId) ===
                            Number(course.subject_id),
                        ))
                    );
                  })
                  .map((item) => (
                  <option
                    key={item.user_id || item.id}
                    value={item.user_id || item.id}
                  >
                    {item.full_name || item.name}
                  </option>
                  ))}
              </select>
            </Field>
            <Field label="Mavzu" wide>
              <input
                value={form.topic}
                maxLength={240}
                onChange={(event) =>
                  setForm({ ...form, topic: event.target.value })
                }
              />
            </Field>
          </div>
          <SelectorPagination
            resources={[
              ["Kurslar", courses],
              ["Xonalar", options.rooms],
              ["O‘qituvchilar", options.staff],
            ]}
          />
          <ActionButton
            busy={busy}
            disabled={!form.course_id}
            onClick={create}
          >
            {courses.items.find(
              (item) => Number(item.id) === Number(form.course_id),
            )?.status === "active"
              ? "Men tekshirdim — jadvalga e’lon qilish"
              : "Qoralama dars vaqtini saqlash"}
          </ActionButton>
        </div>
      )}
      {resource.busy && !resource.items.length ? (
        <LoadingBlock />
      ) : resource.items.length ? (
        <div className="lc-schedule-list">
          {resource.items.map((item) => (
            <article key={item.id}>
              <time>
                <b>{item.starts_at?.slice(0, 5) || "—"}</b>
                <small>{item.lesson_date || item.date}</small>
              </time>
              <span>
                <h3>{item.course_name || item.title}</h3>
                <p>{item.topic || "Mavzu belgilanmagan"}</p>
                <small>
                  {item.teacher_name || "O‘qituvchi"} ·{" "}
                  {item.room_name || "Onlayn/xonasiz"}
                </small>
              </span>
              <div className="lc-entity-end">
                <StatusPill status={item.status || "active"} />
                {canManage && item.status === "draft" && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => publishSlot(item)}
                  >
                    Men tekshirdim — e’lon qilish
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CalendarDays}
          title="Dars topilmadi"
          text="Tanlangan sanadan keyin jadval yozuvi yo‘q."
        />
      )}
      <LoadMore resource={resource} />
    </section>
  );
}

function SafeFormula({ formula, display = true }) {
  const [html, setHtml] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    const clean = String(formula || "").trim().slice(0, 2000);
    if (!clean) {
      setHtml("");
      setError("");
      return undefined;
    }
    import("katex")
      .then(({ default: katex }) => {
        if (cancelled) return;
        try {
          setHtml(
            katex.renderToString(clean, {
              displayMode: display,
              throwOnError: false,
              trust: false,
              strict: "warn",
              output: "htmlAndMathml",
            }),
          );
          setError("");
        } catch (renderError) {
          setHtml("");
          setError(renderError.message);
        }
      })
      .catch(() => !cancelled && setError("Formula rendereri yuklanmadi."));
    return () => {
      cancelled = true;
    };
  }, [display, formula]);
  if (!formula) return null;
  if (error) {
    return (
      <div className="lc-formula-error">
        <code>{formula}</code>
        <small>{error}</small>
      </div>
    );
  }
  return (
    <div
      className="lc-formula"
      // KaTeX is configured with trust=false; raw user HTML is never inserted.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function LessonsPanel({ apiBase, token, contextId, permissions, roles }) {
  const [tab, setTab] = useState("plans");
  const canPlan = canAny(permissions, "lessons");
  const canHomework = canAny(permissions, "homework");
  const canCreate = tab === "plans" ? canPlan : canHomework;
  const path =
    tab === "plans" ? centerRoutes.lessonPlans : centerRoutes.homework;
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [submissionTarget, setSubmissionTarget] = useState(null);
  const [submission, setSubmission] = useState({
    answer_text: "",
    answer_latex: "",
  });
  const [submissionSummaries, setSubmissionSummaries] = useState({});
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewGrades, setReviewGrades] = useState({});
  const [form, setForm] = useState({
    course_id: "",
    title: "",
    lesson_date: todayValue(),
    objective: "",
    explanation: "",
    formula_latex: "",
    activities: "",
    homework_text: "",
    due_date: todayValue(),
    max_score: 100,
    duration_minutes: 90,
  });
  const resource = usePagedResource({
    apiBase,
    token,
    contextId,
    path,
  });
  const courses = usePagedResource({
    apiBase,
    token,
    contextId,
    path: centerRoutes.courses,
    query: { status: "active" },
  });
  const homeworkSubmissions = usePagedResource({
    apiBase,
    token,
    contextId,
    path: reviewTarget
      ? centerRoutes.homeworkSubmissions(reviewTarget.id)
      : centerRoutes.homework,
    enabled: Boolean(reviewTarget && canHomework),
  });

  useEffect(() => {
    const handleAvatarAction = (event) => {
      const action = event.detail;
      if (action?.section !== "lessons" || !canPlan) return;
      setTab("plans");
      setOpen(true);
      if (
        action.type === "SET_DRAFT_VALUE" &&
        [45, 60, 80, 90, 120, 180].includes(
          Number(action.values?.duration_minutes),
        )
      ) {
        setForm((current) => ({
          ...current,
          duration_minutes: Number(action.values.duration_minutes),
        }));
      }
    };
    window.addEventListener(
      "samtm:center-avatar-action",
      handleAvatarAction,
    );
    return () =>
      window.removeEventListener(
        "samtm:center-avatar-action",
        handleAvatarAction,
      );
  }, [canPlan]);

  const save = async () => {
    if (!canCreate || !form.course_id || !form.title.trim()) return;
    setBusy(true);
    setError("");
    try {
      await centerApi(path, {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canCreate,
        idempotencyKey: makeIdempotencyKey(tab, [
          form.course_id,
          form.title,
          form.lesson_date,
        ]),
        body:
          tab === "plans"
            ? buildLessonPlanPayload(form)
            : buildHomeworkPayload(form),
      });
      setOpen(false);
      resource.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const publish = async (item) => {
    const allowed = tab === "plans" ? canPlan : canHomework;
    if (!allowed) return;
    setBusy(true);
    setError("");
    try {
      await centerApi(
        tab === "plans"
          ? centerRoutes.lessonPlanPublish(item.id)
          : centerRoutes.homeworkPublish(item.id),
        {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed,
        body: { confirmation: true },
        },
      );
      resource.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const submitHomework = async () => {
    if (
      !roles.includes("student") ||
      !submissionTarget ||
      (!submission.answer_text.trim() && !submission.answer_latex.trim())
    ) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      await centerApi(
        centerRoutes.homeworkSubmissions(submissionTarget.id),
        {
          apiBase,
          token,
          contextId,
          method: "POST",
          allowed: true,
          idempotencyKey: makeIdempotencyKey("homework-submit", [
            submissionTarget.id,
            contextId,
          ]),
          body: {
            answer_text: submission.answer_text || null,
            answer_latex: submission.answer_latex || null,
            attachment_refs: [],
          },
        },
      );
      const summary = await centerApi(
        centerRoutes.homeworkMySubmission(submissionTarget.id),
        { apiBase, token, contextId },
      );
      setSubmissionSummaries((current) => ({
        ...current,
        [submissionTarget.id]: summary,
      }));
      setSubmissionTarget(null);
      setSubmission({ answer_text: "", answer_latex: "" });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const openHomeworkSubmission = async (item) => {
    if (!roles.includes("student")) return;
    setBusy(true);
    setError("");
    try {
      const summary = await centerApi(
        centerRoutes.homeworkMySubmission(item.id),
        { apiBase, token, contextId },
      );
      setSubmissionSummaries((current) => ({
        ...current,
        [item.id]: summary,
      }));
      if (!summary.can_submit) {
        setError(
          summary.item?.status === "graded"
            ? `Vazifa baholangan: ${summary.item.score ?? "—"}/${item.max_score ?? "—"}.`
            : "Bu vazifa allaqachon topshirilgan yoki muddati tugagan.",
        );
        return;
      }
      setSubmission({
        answer_text: summary.item?.answer_text || "",
        answer_latex: summary.item?.answer_latex || "",
      });
      setSubmissionTarget(item);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const gradeHomework = async (item) => {
    if (!canHomework || !reviewTarget) return;
    const grade = reviewGrades[item.id] || {};
    const rawScore =
      grade.score ?? (item.score == null ? "" : item.score);
    const score = Number(rawScore);
    if (
      rawScore === "" ||
      !Number.isFinite(score) ||
      score < 0 ||
      score > Number(reviewTarget.max_score || 100)
    ) {
      setError("Ball 0 va vazifaning maksimal bali oralig‘ida bo‘lsin.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await centerApi(centerRoutes.homeworkSubmissionGrade(item.id), {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canHomework,
        body: {
          score,
          feedback: grade.feedback ?? item.feedback ?? null,
          confirmation: true,
        },
      });
      homeworkSubmissions.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const returnHomework = async (item) => {
    if (
      !canHomework ||
      !["submitted", "graded"].includes(item.status)
    ) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      await centerApi(centerRoutes.homeworkSubmissionReturn(item.id), {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canHomework,
        body: { confirmation: true },
      });
      homeworkSubmissions.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const downloadWord = async (item) => {
    setBusy(true);
    setError("");
    try {
      await centerDownload(centerRoutes.lessonPlanDocx(item.id), {
        apiBase,
        token,
        contextId,
        filename: `${item.title || "dars_reja"}.docx`,
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="lc-dashboard-card">
      <div className="lc-tabs">
        <button
          type="button"
          className={tab === "plans" ? "active" : ""}
          onClick={() => {
            setTab("plans");
            setOpen(false);
            setReviewTarget(null);
          }}
        >
          Dars rejalari
        </button>
        <button
          type="button"
          className={tab === "homework" ? "active" : ""}
          onClick={() => {
            setTab("homework");
            setOpen(false);
          }}
        >
          Uy vazifalari
        </button>
      </div>
      <ResourceHeader
        eyebrow={tab === "plans" ? "DARS REJA" : "UY VAZIFASI"}
        title={
          tab === "plans"
            ? "Maqsad, tushuntirish va mashqlar"
            : "Muddat, topshiriq va baholash"
        }
        text={
          roles.includes("student") || roles.includes("parent")
            ? "Bu bo‘lim siz uchun faqat ko‘rish rejimida."
            : "Matn va LaTeX formulalari xavfsiz ko‘rsatiladi."
        }
        canCreate={canCreate}
        onCreate={() => setOpen((value) => !value)}
        label={tab === "plans" ? "Reja qoralamasi" : "Vazifa qoralamasi"}
      />
      <ErrorNotice error={error || resource.error} onRetry={resource.reload} />
      {submissionTarget && (
        <div className="lc-inline-form">
          <div className="lc-section-heading">
            <div>
              <span className="lc-eyebrow">VAZIFANI TOPSHIRISH</span>
              <h3>{submissionTarget.title}</h3>
            </div>
            <button
              type="button"
              className="lc-text-danger"
              onClick={() => setSubmissionTarget(null)}
            >
              <X size={14} /> Yopish
            </button>
          </div>
          <div className="lc-form-grid">
            <Field label="Javob" wide>
              <textarea
                value={submission.answer_text}
                maxLength={50000}
                onChange={(event) =>
                  setSubmission({
                    ...submission,
                    answer_text: event.target.value,
                  })
                }
              />
            </Field>
            <Field label="Formula javobi (LaTeX)" wide>
              <textarea
                value={submission.answer_latex}
                maxLength={20000}
                onChange={(event) =>
                  setSubmission({
                    ...submission,
                    answer_latex: event.target.value,
                  })
                }
              />
            </Field>
            <div className="lc-formula-preview">
              <SafeFormula formula={submission.answer_latex} />
            </div>
          </div>
          <ActionButton busy={busy} onClick={submitHomework}>
            Men tekshirdim — vazifani topshirish
          </ActionButton>
        </div>
      )}
      {reviewTarget && canHomework && (
        <div className="lc-inline-form">
          <div className="lc-section-heading">
            <div>
              <span className="lc-eyebrow">TOPSHIRIQLARNI TEKSHIRISH</span>
              <h3>{reviewTarget.title}</h3>
            </div>
            <button
              type="button"
              className="lc-text-danger"
              onClick={() => setReviewTarget(null)}
            >
              <X size={14} /> Yopish
            </button>
          </div>
          <ErrorNotice
            error={homeworkSubmissions.error}
            onRetry={homeworkSubmissions.reload}
          />
          {homeworkSubmissions.busy &&
          !homeworkSubmissions.items.length ? (
            <LoadingBlock text="O‘quvchi javoblari yuklanmoqda..." />
          ) : homeworkSubmissions.items.length ? (
            <div className="lc-content-list">
              {homeworkSubmissions.items.map((item) => {
                const grade = reviewGrades[item.id] || {};
                return (
                  <article key={item.id}>
                    <header>
                      <span>
                        <ClipboardCheck size={18} />
                        <b>{item.student_name || `O‘quvchi #${item.student_user_id}`}</b>
                      </span>
                      <StatusPill status={item.status || "submitted"} />
                    </header>
                    <p>{item.answer_text || "Matnli javob yo‘q"}</p>
                    <SafeFormula formula={item.answer_latex} />
                    <div className="lc-form-grid">
                      <Field
                        label={`Ball (0–${reviewTarget.max_score || 100})`}
                      >
                        <input
                          type="number"
                          min="0"
                          max={reviewTarget.max_score || 100}
                          step="0.01"
                          value={
                            grade.score ??
                            (item.score == null ? "" : item.score)
                          }
                          onChange={(event) =>
                            setReviewGrades((current) => ({
                              ...current,
                              [item.id]: {
                                ...current[item.id],
                                score: event.target.value,
                              },
                            }))
                          }
                        />
                      </Field>
                      <Field label="Izoh" wide>
                        <textarea
                          maxLength={10000}
                          value={grade.feedback ?? item.feedback ?? ""}
                          onChange={(event) =>
                            setReviewGrades((current) => ({
                              ...current,
                              [item.id]: {
                                ...current[item.id],
                                feedback: event.target.value,
                              },
                            }))
                          }
                        />
                      </Field>
                    </div>
                    <footer>
                      <small>
                        {item.submitted_at
                          ? new Date(item.submitted_at).toLocaleString("uz-UZ")
                          : "Topshirilgan"}
                      </small>
                      <ActionButton
                        busy={busy}
                        onClick={() => gradeHomework(item)}
                      >
                        Men tekshirdim — bahoni saqlash
                      </ActionButton>
                      {["submitted", "graded"].includes(item.status) && (
                        <ActionButton
                          secondary
                          busy={busy}
                          onClick={() => returnHomework(item)}
                        >
                          Tuzatishga qaytarish
                        </ActionButton>
                      )}
                    </footer>
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={ClipboardCheck}
              title="Javob topshirilmagan"
              text="O‘quvchi vazifani topshirgach shu yerda ko‘rinadi."
            />
          )}
          <LoadMore resource={homeworkSubmissions} />
        </div>
      )}
      {open && (
        <div className="lc-inline-form">
          <div className="lc-form-grid">
            <Field label="Kurs" aiField="course_id">
              <select
                value={form.course_id}
                onChange={(event) =>
                  setForm({ ...form, course_id: event.target.value })
                }
              >
                <option value="">Tanlang</option>
                {courses.items.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={tab === "plans" ? "Dars sanasi" : "Topshirish muddati"}>
              <input
                type="date"
                value={
                  tab === "plans" ? form.lesson_date : form.due_date
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    [tab === "plans" ? "lesson_date" : "due_date"]:
                      event.target.value,
                  })
                }
              />
            </Field>
            {tab === "plans" && (
              <Field label="Dars davomiyligi" aiField="duration_minutes">
                <select
                  value={form.duration_minutes}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      duration_minutes: Number(event.target.value),
                    })
                  }
                >
                  {[45, 60, 80, 90, 120, 180].map((minutes) => (
                    <option key={minutes} value={minutes}>
                      {minutes} daqiqa
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <Field label="Sarlavha" wide aiField="title">
              <input
                value={form.title}
                maxLength={240}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
              />
            </Field>
            {tab === "plans" && (
              <>
                <Field label="Dars maqsadi" wide>
                  <textarea
                    value={form.objective}
                    maxLength={2000}
                    onChange={(event) =>
                      setForm({ ...form, objective: event.target.value })
                    }
                  />
                </Field>
                <Field label="Tushuntirish" wide>
                  <textarea
                    value={form.explanation}
                    maxLength={10000}
                    onChange={(event) =>
                      setForm({ ...form, explanation: event.target.value })
                    }
                  />
                </Field>
                <Field label="Faoliyat va mashqlar" wide>
                  <textarea
                    value={form.activities}
                    maxLength={10000}
                    onChange={(event) =>
                      setForm({ ...form, activities: event.target.value })
                    }
                  />
                </Field>
              </>
            )}
            {tab === "homework" && (
              <>
                <Field label="Topshiriq" wide>
                  <textarea
                    value={form.homework_text}
                    maxLength={10000}
                    onChange={(event) =>
                      setForm({ ...form, homework_text: event.target.value })
                    }
                  />
                </Field>
                <Field label="Maksimal ball">
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={form.max_score}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        max_score: Number(event.target.value),
                      })
                    }
                  />
                </Field>
              </>
            )}
            <Field
              label="LaTeX formula"
              hint={"Masalan: \\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}"}
              wide
            >
              <textarea
                value={form.formula_latex}
                maxLength={2000}
                spellCheck={false}
                onChange={(event) =>
                  setForm({ ...form, formula_latex: event.target.value })
                }
              />
            </Field>
            <div className="lc-formula-preview">
              <small>Xavfsiz formula ko‘rinishi</small>
              <SafeFormula formula={form.formula_latex} />
            </div>
          </div>
          <SelectorPagination
            resources={[["Kurslar", courses]]}
          />
          <ActionButton busy={busy} onClick={save}>
            Qoralamani saqlash
          </ActionButton>
        </div>
      )}
      {resource.busy && !resource.items.length ? (
        <LoadingBlock />
      ) : resource.items.length ? (
        <div className="lc-content-list">
          {resource.items.map((item) => {
            const serverSubmissionSummary =
              tab === "homework" && roles.includes("student")
                ? {
                    item: item.my_submission_id
                      ? {
                          id: item.my_submission_id,
                          status: item.my_submission_status,
                          score: item.my_submission_score,
                          feedback: item.my_submission_feedback,
                          submitted_at:
                            item.my_submission_submitted_at,
                          graded_at: item.my_submission_graded_at,
                        }
                      : null,
                    can_submit: item.can_submit === true,
                    can_resubmit: item.can_resubmit === true,
                  }
                : null;
            const mySubmission =
              submissionSummaries[item.id] || serverSubmissionSummary;
            return (
            <article key={item.id}>
              <header>
                <span>
                  <BookMarked size={18} />
                  <b>{item.title}</b>
                </span>
                <StatusPill status={item.status || "draft"} />
              </header>
              <p>
                {item.content_text ||
                  item.instructions ||
                  item.explanation ||
                  "Tavsif yo‘q"}
              </p>
              <SafeFormula
                formula={item.content_latex || item.formula_latex}
              />
              {tab === "homework" &&
                roles.includes("student") &&
                mySubmission?.item && (
                  <InfoNotice>
                    Holat:{" "}
                    {STATUS_LABELS[mySubmission.item.status] ||
                      mySubmission.item.status}
                    {mySubmission.item.score != null
                      ? ` · ${mySubmission.item.score}/${item.max_score || "—"}`
                      : ""}
                    {mySubmission.item.feedback
                      ? ` · Izoh: ${mySubmission.item.feedback}`
                      : ""}
                  </InfoNotice>
                )}
              <footer>
                <small>
                  {item.course_name || "Kurs"} ·{" "}
                  {item.lesson_date ||
                    item.due_date ||
                    item.due_at?.slice(0, 10) ||
                    "Sanasiz"}
                </small>
                <div className="lc-row-actions">
                  {tab === "plans" && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => downloadWord(item)}
                    >
                      Word yuklab olish
                    </button>
                  )}
                  {tab === "plans" &&
                    canPlan &&
                    item.status === "draft" && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => publish(item)}
                    >
                      Men tekshirdim — e’lon qilish
                    </button>
                    )}
                  {tab === "homework" &&
                    canHomework &&
                    item.status === "draft" && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => publish(item)}
                      >
                        Men tekshirdim — e’lon qilish
                      </button>
                    )}
                  {tab === "homework" && canHomework && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        setReviewGrades({});
                        setReviewTarget(item);
                      }}
                    >
                      Javoblarni tekshirish
                    </button>
                  )}
                  {tab === "homework" &&
                    roles.includes("student") &&
                    item.status === "published" && (
                      <button
                        type="button"
                        disabled={
                          busy ||
                          (mySubmission &&
                            !mySubmission.can_submit)
                        }
                        onClick={() => openHomeworkSubmission(item)}
                      >
                        {mySubmission?.can_resubmit
                          ? "Tuzatib qayta topshirish"
                          : mySubmission && !mySubmission.can_submit
                            ? mySubmission.item
                              ? STATUS_LABELS[
                                  mySubmission.item.status
                                ] || "Topshirilgan"
                              : "Muddati tugagan"
                            : "Holatni tekshirish / topshirish"}
                      </button>
                    )}
                </div>
              </footer>
            </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="Material topilmadi"
          text="Hali dars reja yoki uy vazifasi yo‘q."
        />
      )}
      <LoadMore resource={resource} />
    </section>
  );
}

function AttendanceGradesPanel({
  apiBase,
  token,
  contextId,
  permissions,
  roles,
}) {
  const [tab, setTab] = useState("attendance");
  const canAttendance = canAny(permissions, "attendance");
  const canGrades = canAny(permissions, "grades");
  const canWrite = tab === "attendance" ? canAttendance : canGrades;
  const path = tab === "attendance" ? centerRoutes.attendance : centerRoutes.grades;
  const [courseId, setCourseId] = useState("");
  const [date, setDate] = useState(todayValue());
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    student_user_id: "",
    attendance_status: "present",
    score: 100,
    assessment_name: "Joriy baholash",
    note: "",
  });
  const resource = usePagedResource({
    apiBase,
    token,
    contextId,
    path,
    query: {
      course_id: courseId || undefined,
      date,
    },
  });
  const courses = usePagedResource({
    apiBase,
    token,
    contextId,
    path: centerRoutes.courses,
    query: { status: "active" },
  });
  const enrollments = usePagedResource({
    apiBase,
    token,
    contextId,
    path: centerRoutes.enrollments,
    query: { course_id: courseId || undefined, status: "active" },
    enabled: Boolean(courseId),
  });

  const save = async () => {
    if (!canWrite || !courseId || !form.student_user_id) return;
    setBusy(true);
    setError("");
    try {
      const idempotencyKey = makeIdempotencyKey(tab, [
        courseId,
        form.student_user_id,
        date,
        tab === "grades" ? form.assessment_name : form.attendance_status,
      ]);
      await centerApi(path, {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canWrite,
        idempotencyKey,
        body:
          tab === "attendance"
            ? buildAttendancePayload({ courseId, date, form })
            : buildGradePayload({
                courseId,
                date,
                form,
                idempotencyKey,
              }),
      });
      setOpen(false);
      resource.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="lc-dashboard-card">
      <div className="lc-tabs">
        <button
          type="button"
          className={tab === "attendance" ? "active" : ""}
          onClick={() => {
            setTab("attendance");
            setOpen(false);
          }}
        >
          Davomat
        </button>
        <button
          type="button"
          className={tab === "grades" ? "active" : ""}
          onClick={() => {
            setTab("grades");
            setOpen(false);
          }}
        >
          Baholar
        </button>
      </div>
      <ResourceHeader
        eyebrow={tab === "attendance" ? "DAVOMAT" : "BAHOLAR"}
        title={
          tab === "attendance"
            ? "Darsga kelish holati"
            : "Natija va o‘sish ko‘rsatkichi"
        }
        text={
          roles.includes("student") || roles.includes("parent")
            ? "Faqat o‘zingizga yoki bog‘langan farzandga tegishli yozuvlar."
            : "O‘qituvchi faqat o‘z guruhidagi o‘quvchini belgilaydi."
        }
        canCreate={canWrite}
        onCreate={() => setOpen((value) => !value)}
        label={tab === "attendance" ? "Belgilash" : "Baho yozish"}
      />
      <div className="lc-filter-row">
        <Field label="Kurs">
          <select
            value={courseId}
            onChange={(event) => {
              setCourseId(event.target.value);
              setForm({ ...form, student_user_id: "" });
            }}
          >
            <option value="">Barchasi</option>
            {courses.items.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Sana">
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </Field>
      </div>
      <SelectorPagination resources={[["Kurslar", courses]]} />
      <ErrorNotice error={error || resource.error} onRetry={resource.reload} />
      {open && (
        <div className="lc-inline-form">
          <div className="lc-form-grid">
            <Field label="O‘quvchi">
              <select
                value={form.student_user_id}
                onChange={(event) =>
                  setForm({ ...form, student_user_id: event.target.value })
                }
              >
                <option value="">Tanlang</option>
                {enrollments.items.map((item) => (
                  <option
                    key={item.student_user_id || item.id}
                    value={item.student_user_id}
                  >
                    {item.student_name ||
                      `O‘quvchi #${item.student_user_id}`}
                  </option>
                ))}
              </select>
            </Field>
            {tab === "attendance" ? (
              <Field label="Holat">
                <select
                  value={form.attendance_status}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      attendance_status: event.target.value,
                    })
                  }
                >
                  <option value="present">Keldi</option>
                  <option value="late">Kechikdi</option>
                  <option value="excused">Sababli kelmadi</option>
                  <option value="absent">Sababsiz kelmadi</option>
                </select>
              </Field>
            ) : (
              <>
                <Field label="Baholash nomi">
                  <input
                    value={form.assessment_name}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        assessment_name: event.target.value,
                      })
                    }
                  />
                </Field>
                <Field label="Ball (100 dan)">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.score}
                    onChange={(event) =>
                      setForm({ ...form, score: Number(event.target.value) })
                    }
                  />
                </Field>
              </>
            )}
            <Field label="Izoh" wide>
              <textarea
                maxLength={500}
                value={form.note}
                onChange={(event) =>
                  setForm({ ...form, note: event.target.value })
                }
              />
            </Field>
          </div>
          <SelectorPagination
            resources={[["O‘quvchilar", enrollments]]}
          />
          <ActionButton busy={busy} onClick={save}>
            Saqlash
          </ActionButton>
        </div>
      )}
      {resource.busy && !resource.items.length ? (
        <LoadingBlock />
      ) : resource.items.length ? (
        <div className="lc-table-wrap">
          <table className="lc-table">
            <thead>
              <tr>
                <th>O‘quvchi</th>
                <th>Kurs</th>
                <th>Sana</th>
                <th>{tab === "attendance" ? "Holat" : "Natija"}</th>
              </tr>
            </thead>
            <tbody>
              {resource.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.student_name || `#${item.student_user_id}`}</td>
                  <td>{item.course_name || "—"}</td>
                  <td>{item.attendance_date || item.grade_date || item.date}</td>
                  <td>
                    {tab === "attendance"
                      ? item.status_label || item.status
                      : `${item.score ?? "—"}/${item.max_score || 100}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={BadgeCheck}
          title="Yozuv topilmadi"
          text="Tanlangan kurs va sanada ma’lumot yo‘q."
        />
      )}
      <LoadMore resource={resource} />
    </section>
  );
}

function AssessmentsPanel({
  apiBase,
  token,
  contextId,
  permissions,
  roles,
  currentUserId,
  linkedChildren = [],
}) {
  const canManage = canAny(permissions, "assessments");
  const studentMode = roles.includes("student");
  const parentMode = roles.includes("parent");
  const safeLinkedChildren = useMemo(() => {
    const unique = new Map();
    linkedChildren.forEach((child) => {
      const studentId = Number(child?.student_user_id);
      if (studentId > 0) unique.set(studentId, child);
    });
    return [...unique.values()];
  }, [linkedChildren]);
  const [historyStudentId, setHistoryStudentId] = useState(() =>
    parentMode && !studentMode && safeLinkedChildren[0]?.student_user_id
      ? String(safeLinkedChildren[0].student_user_id)
      : "",
  );
  const historyMode =
    studentMode || (parentMode && Boolean(historyStudentId));
  const attemptStorageKey =
    `samtm-center-attempt-${contextId}-${currentUserId || "unknown"}`;
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [activeAttempt, setActiveAttempt] = useState(() => {
    if (!studentMode) return null;
    try {
      const saved = JSON.parse(
        sessionStorage.getItem(`${attemptStorageKey}-data`) || "null",
      );
      if (
        saved?.attempt?.student_user_id != null &&
        Number(saved.attempt.student_user_id) !== Number(currentUserId)
      ) {
        sessionStorage.removeItem(`${attemptStorageKey}-data`);
        sessionStorage.removeItem(`${attemptStorageKey}-answers`);
        return null;
      }
      return saved;
    } catch {
      return null;
    }
  });
  const [attemptAnswers, setAttemptAnswers] = useState(() => {
    try {
      return JSON.parse(
        sessionStorage.getItem(`${attemptStorageKey}-answers`) || "{}",
      );
    } catch {
      return {};
    }
  });
  const [attemptResult, setAttemptResult] = useState(null);
  const [historyResult, setHistoryResult] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [autosaveStatus, setAutosaveStatus] = useState("idle");
  const submitAttemptRef = useRef(null);
  const autoSubmitTriggered = useRef(false);
  const autosaveQueueRef = useRef(Promise.resolve());
  const autosaveRevisionRef = useRef(0);
  const hydratedAttemptRef = useRef(null);
  const submittingAttemptRef = useRef(false);
  const [reviewListOpen, setReviewListOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewScore, setReviewScore] = useState("");
  const [reviewComponentScores, setReviewComponentScores] = useState({
    listening: "",
    reading: "",
    writing: "",
    speaking: "",
  });
  const [form, setForm] = useState({
    course_id: "",
    title: "",
    assessment_type: "quiz",
    framework: "custom",
    duration_minutes: 60,
    max_attempts: 1,
    opens_at: "",
    closes_at: "",
    instructions: "",
  });
  const [questions, setQuestions] = useState([
    {
      local_id: 1,
      question_type: "multiple_choice",
      prompt: "",
      formula_latex: "",
      options: ["", "", "", ""],
      correct_answer: "",
      points: 1,
    },
  ]);
  const resource = usePagedResource({
    apiBase,
    token,
    contextId,
    path: centerRoutes.assessments,
  });
  const courses = usePagedResource({
    apiBase,
    token,
    contextId,
    path: centerRoutes.courses,
    query: { status: "active" },
  });
  const reviewAttempts = usePagedResource({
    apiBase,
    token,
    contextId,
    path: centerRoutes.assessmentAttemptReviews,
    query: { status: "submitted" },
    enabled: Boolean(canManage && reviewListOpen),
  });
  const myAttempts = usePagedResource({
    apiBase,
    token,
    contextId,
    path: centerRoutes.myAssessmentAttempts,
    query: {
      student_user_id: historyStudentId || undefined,
    },
    enabled: historyMode,
  });

  useEffect(() => {
    const handleAvatarAction = (event) => {
      const action = event.detail;
      if (action?.section !== "assessments" || !canManage) return;
      setOpen(true);
      if (action.type !== "SET_DRAFT_VALUE") return;
      const values = action.values || {};
      setForm((current) => {
        const next = { ...current };
        if (
          [
            "quiz",
            "mock_exam",
            "midterm",
            "final",
            "placement",
            "diagnostic",
            "exam",
            "cefr_mock",
            "ielts_mock",
          ].includes(values.assessment_type)
        ) {
          next.assessment_type = values.assessment_type;
        }
        if (
          ["custom", "cefr", "ielts", "national_exam", "school"].includes(
            values.framework,
          )
        ) {
          next.framework = values.framework;
        }
        if (
          [15, 30, 45, 60, 90, 120, 180].includes(
            Number(values.duration_minutes),
          )
        ) {
          next.duration_minutes = Number(values.duration_minutes);
        }
        return next;
      });
    };
    window.addEventListener(
      "samtm:center-avatar-action",
      handleAvatarAction,
    );
    return () =>
      window.removeEventListener(
        "samtm:center-avatar-action",
        handleAvatarAction,
      );
  }, [canManage]);

  useEffect(() => {
    if (
      !parentMode ||
      studentMode ||
      safeLinkedChildren.some(
        (child) =>
          Number(child.student_user_id) === Number(historyStudentId),
      )
    ) {
      return;
    }
    setHistoryStudentId(
      safeLinkedChildren[0]?.student_user_id
        ? String(safeLinkedChildren[0].student_user_id)
        : "",
    );
  }, [
    historyStudentId,
    parentMode,
    safeLinkedChildren,
    studentMode,
  ]);

  useEffect(() => {
    if (!activeAttempt?.attempt?.id) {
      sessionStorage.removeItem(`${attemptStorageKey}-data`);
      sessionStorage.removeItem(`${attemptStorageKey}-answers`);
      return;
    }
    sessionStorage.setItem(
      `${attemptStorageKey}-data`,
      JSON.stringify(activeAttempt),
    );
    sessionStorage.setItem(
      `${attemptStorageKey}-answers`,
      JSON.stringify(attemptAnswers),
    );
  }, [activeAttempt, attemptAnswers, attemptStorageKey]);

  useEffect(() => {
    const attemptId = activeAttempt?.attempt?.id;
    if (
      !studentMode ||
      !attemptId ||
      hydratedAttemptRef.current === attemptId
    ) {
      return undefined;
    }
    hydratedAttemptRef.current = attemptId;
    let cancelled = false;
    centerApi(centerRoutes.attempt(attemptId), {
      apiBase,
      token,
      contextId,
    })
      .then((data) => {
        if (cancelled) return;
        const serverAttempt = data.attempt || activeAttempt.attempt;
        if (serverAttempt?.status !== "in_progress") {
          setActiveAttempt(null);
          setAttemptAnswers({});
          setAutosaveStatus(
            serverAttempt?.status === "expired" ? "expired" : "idle",
          );
          setAttemptResult({
            status: serverAttempt?.status || "closed",
            score: serverAttempt?.score ?? null,
            max_score: serverAttempt?.max_score ?? null,
            component_scores: serverAttempt?.component_scores || {},
          });
          myAttempts.reload();
          setError(
            serverAttempt?.status === "expired"
              ? "Test vaqti tugagan. Urinish serverda yopildi."
              : "Bu test urinishi avval yopilgan. Natija tarixda yangilandi.",
          );
          return;
        }
        const serverAnswers = attemptAnswersFromDraft(
          data.draft_answers || [],
        );
        setActiveAttempt({
          attempt: serverAttempt,
          assessment: data.assessment || activeAttempt.assessment,
          items: data.items || activeAttempt.items || [],
        });
        setAttemptAnswers((localFallback) => ({
          ...serverAnswers,
          ...localFallback,
        }));
      })
      .catch((requestError) => {
        if (cancelled) return;
        if (
          requestError.status === 409 &&
          requestError.code === "attempt_expired"
        ) {
          setActiveAttempt(null);
          setAttemptAnswers({});
          setError("Test vaqti tugagan. Urinish serverda yopildi.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [
    activeAttempt?.attempt?.id,
    apiBase,
    contextId,
    studentMode,
    token,
  ]);

  useEffect(() => {
    const attemptId = activeAttempt?.attempt?.id;
    const items = activeAttempt?.items || [];
    if (
      !studentMode ||
      !attemptId ||
      attemptResult ||
      !items.length ||
      !Object.keys(attemptAnswers).length
    ) {
      setAutosaveStatus("idle");
      return undefined;
    }
    const revision = autosaveRevisionRef.current + 1;
    autosaveRevisionRef.current = revision;
    const payload = buildAttemptDraftPayload(items, attemptAnswers);
    const timer = window.setTimeout(() => {
      if (submittingAttemptRef.current) return;
      setAutosaveStatus("saving");
      autosaveQueueRef.current = autosaveQueueRef.current
        .catch(() => {})
        .then(() =>
          centerApi(centerRoutes.attemptDraft(attemptId), {
            apiBase,
            token,
            contextId,
            method: "PATCH",
            allowed: true,
            body: payload,
          }),
        )
        .then(() => {
          if (revision === autosaveRevisionRef.current) {
            setAutosaveStatus("saved");
          }
        })
        .catch((requestError) => {
          if (revision !== autosaveRevisionRef.current) return;
          if (requestError.status === 409) {
            const expired =
              requestError.code === "attempt_expired" ||
              /muddat|vaqt/i.test(requestError.message);
            setAutosaveStatus(expired ? "expired" : "idle");
            setActiveAttempt(null);
            setAttemptAnswers({});
            setAttemptResult({
              status: expired ? "expired" : "closed",
              score: null,
              max_score: activeAttempt?.attempt?.max_score ?? null,
            });
            myAttempts.reload();
            setError(
              expired
                ? "Test vaqti tugagan. Urinish serverda yopildi."
                : "Bu urinish serverda yopilgan. Natija tarixda yangilandi.",
            );
            return;
          }
          setAutosaveStatus("local");
        });
    }, 700);
    return () => window.clearTimeout(timer);
  }, [
    activeAttempt?.attempt?.id,
    activeAttempt?.items,
    apiBase,
    attemptAnswers,
    attemptResult,
    contextId,
    studentMode,
    token,
  ]);

  useEffect(() => {
    if (!activeAttempt?.attempt?.started_at || attemptResult) {
      setRemainingSeconds(null);
      return undefined;
    }
    autoSubmitTriggered.current = false;
    const startedAt = new Date(activeAttempt.attempt.started_at).getTime();
    const durationMs =
      Number(activeAttempt.assessment?.duration_minutes || 0) * 60_000;
    const closesAt = activeAttempt.assessment?.closes_at
      ? new Date(activeAttempt.assessment.closes_at).getTime()
      : Number.POSITIVE_INFINITY;
    const deadline = Math.min(
      durationMs > 0
        ? startedAt + durationMs
        : Number.POSITIVE_INFINITY,
      closesAt,
    );
    if (!Number.isFinite(deadline)) {
      setRemainingSeconds(null);
      return undefined;
    }
    const tick = () => {
      const remaining = Math.max(
        0,
        Math.ceil((deadline - Date.now()) / 1000),
      );
      setRemainingSeconds(remaining);
      if (
        remaining <= 5 &&
        !autoSubmitTriggered.current &&
        submitAttemptRef.current
      ) {
        autoSubmitTriggered.current = true;
        submitAttemptRef.current(true);
      }
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [activeAttempt, attemptResult]);

  const create = async () => {
    const validQuestions = questions.filter((item) => item.prompt.trim());
    if (
      !canManage ||
      !form.course_id ||
      !form.title.trim() ||
      !validQuestions.length
    ) {
      setError("Kamida bitta mazmunli savol kiriting.");
      return;
    }
    const invalidQuestion = validQuestions.find((question) => {
      if (question.question_type === "multiple_choice") {
        const filled = question.options
          .map((option, index) => ({ option: option.trim(), index }))
          .filter((item) => item.option);
        return (
          filled.length < 2 ||
          !filled.some(
            (item) => String(item.index) === question.correct_answer,
          )
        );
      }
      return !question.correct_answer.trim();
    });
    if (invalidQuestion) {
      setError(
        "Har bir variantli savolda kamida 2 ta to‘ldirilgan variant va to‘g‘ri javob bo‘lsin; qisqa savolda javob kalitini kiriting.",
      );
      return;
    }
    setBusy(true);
    setError("");
    try {
      await centerApi(centerRoutes.assessments, {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canManage,
        idempotencyKey: makeIdempotencyKey("assessment", [
          form.course_id,
          form.title,
        ]),
        body: buildAssessmentPayload(form, validQuestions),
      });
      setOpen(false);
      setQuestions([
        {
          local_id: Date.now(),
          question_type: "multiple_choice",
          prompt: "",
          formula_latex: "",
          options: ["", "", "", ""],
          correct_answer: "",
          points: 1,
        },
      ]);
      resource.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const publish = async (item) => {
    if (!canManage) return;
    setBusy(true);
    setError("");
    try {
      await centerApi(centerRoutes.assessmentPublish(item.id), {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canManage,
        body: { confirmation: true },
      });
      resource.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const startAttempt = async (item) => {
    if (!studentMode || item.status !== "published") return;
    setBusy(true);
    setError("");
    try {
      const data = await centerApi(centerRoutes.assessmentAttempts(item.id), {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: true,
        idempotencyKey: makeIdempotencyKey("attempt", [item.id, contextId]),
        body: { confirmation: true },
      });
      setActiveAttempt({
        attempt: data.attempt || data,
        assessment: data.assessment || null,
        items: data.items || data.attempt?.items || [],
      });
      setAttemptAnswers(
        attemptAnswersFromDraft(data.draft_answers || []),
      );
      setAttemptResult(null);
      autoSubmitTriggered.current = false;
      myAttempts.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const resumeAttempt = async (item) => {
    if (!studentMode || item.status !== "in_progress") return;
    setBusy(true);
    setError("");
    try {
      const data = await centerApi(centerRoutes.attempt(item.id), {
        apiBase,
        token,
        contextId,
      });
      setActiveAttempt({
        attempt: data.attempt || item,
        assessment: data.assessment || {
          title: item.assessment_title,
          duration_minutes: item.duration_minutes,
          closes_at: item.closes_at,
        },
        items: data.items || [],
      });
      setAttemptAnswers(
        attemptAnswersFromDraft(data.draft_answers || []),
      );
      setAttemptResult(null);
      autoSubmitTriggered.current = false;
    } catch (requestError) {
      setError(requestError.message);
      myAttempts.reload();
    } finally {
      setBusy(false);
    }
  };

  const viewHistoryResult = async (item) => {
    if (!historyMode || item.status === "in_progress") return;
    setBusy(true);
    setError("");
    try {
      const data = await centerApi(centerRoutes.attemptResult(item.id), {
        apiBase,
        token,
        contextId,
      });
      setHistoryResult({
        item,
        result: data.result || data.attempt || data,
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const submitAttempt = async (allowIncomplete = false) => {
    if (!activeAttempt?.attempt?.id) return;
    const items = activeAttempt.items || [];
    if (
      !allowIncomplete &&
      items.some((item) => !String(attemptAnswers[item.id] || "").trim())
    ) {
      setError("Har bir savolga javob bering.");
      return;
    }
    setBusy(true);
    setError("");
    submittingAttemptRef.current = true;
    autosaveRevisionRef.current += 1;
    try {
      await autosaveQueueRef.current.catch(() => {});
      const key = makeIdempotencyKey("attempt-submit", [
        activeAttempt.attempt.id,
        contextId,
      ]);
      await centerApi(
        centerRoutes.attemptSubmit(activeAttempt.attempt.id),
        {
          apiBase,
          token,
          contextId,
          method: "POST",
          allowed: true,
          idempotencyKey: key,
          body: buildAttemptSubmitPayload(items, attemptAnswers, key),
        },
      );
      const result = await centerApi(
        centerRoutes.attemptResult(activeAttempt.attempt.id),
        { apiBase, token, contextId },
      );
      setAttemptResult(result.result || result.attempt || result);
      myAttempts.reload();
      sessionStorage.removeItem(`${attemptStorageKey}-data`);
      sessionStorage.removeItem(`${attemptStorageKey}-answers`);
    } catch (requestError) {
      if (
        allowIncomplete &&
        requestError.status === 409 &&
        (requestError.code === "attempt_expired" ||
          /muddat|vaqt/i.test(requestError.message))
      ) {
        setAttemptResult({
          status: "expired",
          score: null,
          max_score: activeAttempt.attempt?.max_score,
        });
        setActiveAttempt(null);
        setAttemptAnswers({});
        sessionStorage.removeItem(`${attemptStorageKey}-data`);
        sessionStorage.removeItem(`${attemptStorageKey}-answers`);
        setError("Test vaqti tugadi. Urinish serverda yopildi.");
      } else {
        setError(requestError.message);
      }
    } finally {
      submittingAttemptRef.current = false;
      setBusy(false);
    }
  };
  submitAttemptRef.current = submitAttempt;

  const openAttemptReview = async (item) => {
    if (!canManage) return;
    setBusy(true);
    setError("");
    try {
      const data = await centerApi(centerRoutes.attemptReview(item.id), {
        apiBase,
        token,
        contextId,
      });
      setReviewTarget({
        ...data,
        attempt: {
          ...(data.attempt || {}),
          student_name:
            data.attempt?.student_name || item.student_name,
        },
      });
      setReviewScore(
        data.attempt?.score == null ? "" : String(data.attempt.score),
      );
      const savedComponents = data.attempt?.component_scores || {};
      setReviewComponentScores({
        listening:
          savedComponents.listening == null
            ? ""
            : String(savedComponents.listening),
        reading:
          savedComponents.reading == null
            ? ""
            : String(savedComponents.reading),
        writing:
          savedComponents.writing == null
            ? ""
            : String(savedComponents.writing),
        speaking:
          savedComponents.speaking == null
            ? ""
            : String(savedComponents.speaking),
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const scoreAttempt = async () => {
    const attempt = reviewTarget?.attempt;
    if (!canManage || !attempt?.id) return;
    const maxScore = Number(
      attempt.max_score ??
        reviewTarget.assessment?.total_points ??
        0,
    );
    const score = Number(reviewScore);
    if (!Number.isFinite(score) || score < 0 || score > maxScore) {
      setError(`Ball 0–${maxScore} oralig‘ida bo‘lsin.`);
      return;
    }
    const isIelts = reviewTarget.assessment?.framework === "ielts";
    const componentScores = Object.fromEntries(
      Object.entries(reviewComponentScores).map(([key, value]) => [
        key,
        Number(value),
      ]),
    );
    if (
      isIelts &&
      (Object.values(reviewComponentScores).some(
        (value) => String(value).trim() === "",
      ) ||
        Object.values(componentScores).some(
          (value) =>
            !Number.isFinite(value) ||
            value < 0 ||
            value > 9 ||
            !Number.isInteger(value * 2),
        ))
    ) {
      setError(
        "IELTS uchun Listening, Reading, Writing va Speaking ballarini 0–9 oralig‘ida 0.5 qadam bilan kiriting.",
      );
      return;
    }
    const idempotencyKey = makeIdempotencyKey("attempt-score", [
      attempt.id,
      score,
      contextId,
    ]);
    setBusy(true);
    setError("");
    try {
      await centerApi(centerRoutes.attemptScore(attempt.id), {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canManage,
        idempotencyKey,
        body: {
          score,
          max_score: maxScore,
          component_scores: isIelts ? componentScores : {},
          idempotency_key: idempotencyKey,
          confirmation: true,
        },
      });
      setReviewTarget(null);
      setReviewScore("");
      setReviewComponentScores({
        listening: "",
        reading: "",
        writing: "",
        speaking: "",
      });
      reviewAttempts.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  if (activeAttempt) {
    return (
      <section className="lc-dashboard-card">
        <BackButton
          onClick={() => {
            setActiveAttempt(null);
            setAttemptResult(null);
            setError("");
          }}
          label="Testlar"
        />
        <div className="lc-section-heading">
          <div>
            <span className="lc-eyebrow">MUSTAQIL TEST</span>
            <h2>
              {activeAttempt.assessment?.title ||
                activeAttempt.attempt.title ||
                "Test savollari"}
            </h2>
          </div>
          <StatusPill status={attemptResult ? "completed" : "active"} />
        </div>
        <ErrorNotice error={error} />
        {attemptResult ? (
          <div className="lc-result-card">
            <BadgeCheck size={34} />
            <h3>Test topshirildi</h3>
            <b>
              {attemptResult.score ?? "Tekshirilmoqda"} /{" "}
              {attemptResult.max_score ?? "—"}
            </b>
            <p>
              {attemptResult.score == null ||
              attemptResult.status === "submitted"
                ? "Yozma javoblarni o‘qituvchi tekshiradi."
                : "Natija hisobingizga saqlandi."}
            </p>
          </div>
        ) : (
          <>
            {remainingSeconds != null && (
              <InfoNotice
                tone={remainingSeconds <= 60 ? "warning" : undefined}
              >
                Qolgan vaqt:{" "}
                {String(Math.floor(remainingSeconds / 60)).padStart(2, "0")}:
                {String(remainingSeconds % 60).padStart(2, "0")}. Vaqt
                tugaganda kiritilgan javoblar avtomatik topshiriladi.
              </InfoNotice>
            )}
            {autosaveStatus !== "idle" && (
              <div className="lc-truncation" aria-live="polite">
                {autosaveStatus === "saving"
                  ? "Javoblar serverga saqlanmoqda…"
                  : autosaveStatus === "saved"
                    ? "Javoblar serverga saqlandi."
                    : autosaveStatus === "local"
                      ? "Serverga saqlash vaqtincha ishlamadi; javoblar shu brauzerda saqlandi va keyingi o‘zgarishda yana urinadi."
                      : "Urinish vaqti tugagan."}
              </div>
            )}
            <div className="lc-attempt-list">
              {(activeAttempt.items || []).map((item, index) => {
                const metadata = item.metadata || {};
                const type =
                  metadata.question_type ||
                  item.question_type ||
                  "short_answer";
                const options = metadata.options || item.options || [];
                return (
                  <article key={item.id}>
                    <span className="lc-question-number">{index + 1}</span>
                    <div>
                      <p>
                        {metadata.prompt ||
                          item.prompt ||
                          item.question_text ||
                          item.question_ref}
                      </p>
                      <SafeFormula
                        formula={
                          metadata.content_latex ||
                          item.content_latex ||
                          item.formula_latex
                        }
                      />
                      {type === "multiple_choice" ? (
                        <div className="lc-answer-options">
                          {options.map((option, optionIndex) => (
                            <label key={`${item.id}-${optionIndex}`}>
                              <input
                                type="radio"
                                name={`answer-${item.id}`}
                                value={String(optionIndex)}
                                checked={
                                  attemptAnswers[item.id] ===
                                  String(optionIndex)
                                }
                                onChange={(event) =>
                                  setAttemptAnswers((current) => ({
                                    ...current,
                                    [item.id]: event.target.value,
                                  }))
                                }
                              />
                              {option}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <textarea
                          value={attemptAnswers[item.id] || ""}
                          maxLength={5000}
                          placeholder="Javobingiz"
                          onChange={(event) =>
                            setAttemptAnswers((current) => ({
                              ...current,
                              [item.id]: event.target.value,
                            }))
                          }
                        />
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
            <ActionButton
              busy={busy}
              onClick={() => submitAttempt(remainingSeconds === 0)}
            >
              {remainingSeconds === 0
                ? "Kiritilgan javoblarni yuborish"
                : "Men tekshirdim — testni topshirish"}
            </ActionButton>
          </>
        )}
      </section>
    );
  }

  return (
    <section className="lc-dashboard-card">
      <ResourceHeader
        eyebrow="TEST VA IMTIHON"
        title="Mustaqil ishlash va natija"
        text={
          studentMode
            ? "Faqat e’lon qilingan testni o‘zingiz boshlab yechasiz."
            : parentMode && !canManage
              ? "Faqat faol bog‘langan farzandingizning test tarixi va natijalarini ko‘rasiz."
              : "Test avval qoralama bo‘ladi, keyin inson tekshiruviga ko‘ra e’lon qilinadi."
        }
        canCreate={canManage}
        onCreate={() => setOpen((value) => !value)}
        label="Test qoralamasi"
      />
      {canManage && (
        <div className="lc-filter-row">
          <ActionButton
            secondary
            onClick={() => {
              setReviewListOpen((current) => !current);
              setReviewTarget(null);
            }}
          >
            <ClipboardCheck size={15} /> Topshirilganlarni tekshirish
          </ActionButton>
        </div>
      )}
      <ErrorNotice error={error || resource.error} onRetry={resource.reload} />
      {(studentMode || parentMode) && (
        <section className="lc-inline-section">
          <div className="lc-section-heading">
            <div>
              <span className="lc-eyebrow">
                {parentMode && !studentMode
                  ? "FARZAND NATIJALARI"
                  : "URINISHLARIM"}
              </span>
              <h3>
                {parentMode && !studentMode
                  ? "Test tarixi va natija"
                  : "Davom ettirish va natijalar"}
              </h3>
            </div>
          </div>
          {parentMode && (
            <Field
              label={
                studentMode
                  ? "Natija egasi"
                  : "Bog‘langan farzand"
              }
            >
              <select
                value={historyStudentId}
                onChange={(event) => {
                  setHistoryStudentId(event.target.value);
                  setHistoryResult(null);
                }}
              >
                {studentMode && <option value="">Mening natijalarim</option>}
                {safeLinkedChildren.map((child) => (
                  <option
                    key={child.student_user_id}
                    value={child.student_user_id}
                  >
                    {child.student_name ||
                      `O‘quvchi #${child.student_user_id}`}
                  </option>
                ))}
              </select>
            </Field>
          )}
          {parentMode && !studentMode && !safeLinkedChildren.length && (
            <InfoNotice>
              Hisobingizga faol bog‘langan farzand topilmadi. Markaz
              administratori bog‘lanishni tekshirishi kerak.
            </InfoNotice>
          )}
          {historyResult && (
            <div className="lc-result-card">
              <BadgeCheck size={28} />
              <h3>{historyResult.item.assessment_title}</h3>
              <b>
                {historyResult.result.score ?? "Tekshirilmoqda"} /{" "}
                {historyResult.result.max_score ?? "—"}
              </b>
              <p>
                <StatusPill status={historyResult.result.status} />
              </p>
              <button type="button" onClick={() => setHistoryResult(null)}>
                Yopish
              </button>
            </div>
          )}
          <ErrorNotice
            error={myAttempts.error}
            onRetry={myAttempts.reload}
          />
          {myAttempts.busy && !myAttempts.items.length ? (
            <LoadingBlock text="Urinishlar yuklanmoqda..." />
          ) : myAttempts.items.length ? (
            <div className="lc-table-wrap">
              <table className="lc-table">
                <thead>
                  <tr>
                    <th>Test</th>
                    <th>Kurs</th>
                    <th>Urinish</th>
                    <th>Holat/natija</th>
                    <th>Amal</th>
                  </tr>
                </thead>
                <tbody>
                  {myAttempts.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.assessment_title}</td>
                      <td>{item.course_name}</td>
                      <td>#{item.attempt_no}</td>
                      <td>
                        <StatusPill status={item.status} />
                        {item.status === "scored" && (
                          <small>
                            {" "}
                            {item.score ?? 0}/{item.max_score ?? "—"}
                          </small>
                        )}
                      </td>
                      <td>
                        {studentMode &&
                        !historyStudentId &&
                        item.status === "in_progress" ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => resumeAttempt(item)}
                          >
                            Davom ettirish
                          </button>
                        ) : item.status === "in_progress" ? (
                          "O‘quvchi davom ettiradi"
                        ) : ["submitted", "scored", "expired"].includes(
                            item.status,
                          ) ? (
                          <button
                            type="button"
                            disabled={busy || item.status === "expired"}
                            onClick={() => viewHistoryResult(item)}
                          >
                            {item.status === "expired"
                              ? "Vaqti tugagan"
                              : item.status === "submitted"
                                ? "Tekshiruv holati"
                                : "Natijani ko‘rish"}
                          </button>
                        ) : (
                          "Natija saqlangan"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <InfoNotice>Hali test urinishi yo‘q.</InfoNotice>
          )}
          <LoadMore resource={myAttempts} />
        </section>
      )}
      {reviewListOpen && canManage && (
        <div className="lc-inline-form">
          <div className="lc-section-heading">
            <div>
              <span className="lc-eyebrow">INSON TEKSHIRUVI</span>
              <h3>Baholash kutilayotgan urinishlar</h3>
            </div>
          </div>
          <ErrorNotice
            error={reviewAttempts.error}
            onRetry={reviewAttempts.reload}
          />
          {reviewTarget ? (
            <>
              <div className="lc-section-heading">
                <div>
                  <small>
                    {reviewTarget.attempt?.student_name ||
                      `O‘quvchi #${reviewTarget.attempt?.student_user_id}`}
                  </small>
                  <h3>{reviewTarget.assessment?.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setReviewTarget(null)}
                >
                  Ro‘yxatga qaytish
                </button>
              </div>
              <div className="lc-content-list">
                {(reviewTarget.answers || []).map((answer) => {
                  const metadata = answer.metadata || {};
                  const questionType =
                    metadata.question_type ||
                    answer.generated_question_type ||
                    "short_answer";
                  const options =
                    metadata.options ||
                    [
                      answer.option_a,
                      answer.option_b,
                      answer.option_c,
                      answer.option_d,
                    ].filter((value) => value != null);
                  const rawResponse =
                    answer.response?.selected ??
                    answer.response?.selected_index ??
                    answer.response?.text ??
                    answer.response?.value ??
                    answer.response?.answer ??
                    answer.response;
                  const rawCorrect =
                    answer.generated_correct_answer ??
                    metadata.correct_answer;
                  const isChoice =
                    questionType === "multiple_choice" ||
                    answer.response?.selected != null ||
                    (options.length > 1 &&
                      questionType !== "write_answer");
                  const readableAnswer = (value) => {
                    if (
                      !isChoice || !options.length
                    ) {
                      return typeof value === "object"
                        ? JSON.stringify(value)
                        : String(value ?? "Javobsiz");
                    }
                    const normalized = String(value ?? "").trim();
                    const letterIndex = ["A", "B", "C", "D"].indexOf(
                      normalized.toUpperCase(),
                    );
                    const numericIndex = /^\d+$/.test(normalized)
                      ? Number(normalized)
                      : -1;
                    const index =
                      letterIndex >= 0 ? letterIndex : numericIndex;
                    return index >= 0 && index < options.length
                      ? `${index + 1}. ${options[index]}`
                      : normalized || "Javobsiz";
                  };
                  return (
                    <article key={answer.assessment_item_id}>
                      <header>
                        <b>{answer.item_order}-savol</b>
                        <small>{answer.points} ball</small>
                      </header>
                      <p>
                        {answer.question ||
                          metadata.prompt ||
                          answer.question_ref}
                      </p>
                      <div className="lc-preview-grid">
                        <div>
                          <small>O‘quvchi javobi</small>
                          <b>{readableAnswer(rawResponse)}</b>
                        </div>
                        <div>
                          <small>Javob kaliti</small>
                          <b>
                            {rawCorrect == null
                              ? "Qo‘lda tekshiriladi"
                              : readableAnswer(rawCorrect)}
                          </b>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
              <Field
                label={`Yakuniy ball (0–${
                  reviewTarget.attempt?.max_score ??
                  reviewTarget.assessment?.total_points ??
                  0
                })`}
              >
                <input
                  type="number"
                  min="0"
                  max={
                    reviewTarget.attempt?.max_score ??
                    reviewTarget.assessment?.total_points ??
                    0
                  }
                  step="0.01"
                  value={reviewScore}
                  onChange={(event) => setReviewScore(event.target.value)}
                />
              </Field>
              {reviewTarget.assessment?.framework === "ielts" && (
                <div className="lc-form-grid">
                  {[
                    ["listening", "Listening"],
                    ["reading", "Reading"],
                    ["writing", "Writing"],
                    ["speaking", "Speaking"],
                  ].map(([key, label]) => (
                    <Field key={key} label={`${label} (0–9)`}>
                      <input
                        type="number"
                        min="0"
                        max="9"
                        step="0.5"
                        value={reviewComponentScores[key]}
                        onChange={(event) =>
                          setReviewComponentScores((current) => ({
                            ...current,
                            [key]: event.target.value,
                          }))
                        }
                      />
                    </Field>
                  ))}
                </div>
              )}
              <ActionButton
                busy={busy}
                disabled={
                  reviewScore === "" ||
                  (reviewTarget.assessment?.framework === "ielts" &&
                    Object.values(reviewComponentScores).some(
                      (value) => value === "",
                    ))
                }
                onClick={scoreAttempt}
              >
                Men tekshirdim — bahoni saqlash
              </ActionButton>
            </>
          ) : reviewAttempts.busy && !reviewAttempts.items.length ? (
            <LoadingBlock text="Topshirilgan testlar yuklanmoqda..." />
          ) : reviewAttempts.items.length ? (
            <div className="lc-table-wrap">
              <table className="lc-table">
                <thead>
                  <tr>
                    <th>O‘quvchi</th>
                    <th>Test</th>
                    <th>Kurs</th>
                    <th>Topshirilgan</th>
                    <th>Amal</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewAttempts.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.student_name}</td>
                      <td>{item.assessment_title}</td>
                      <td>{item.course_name}</td>
                      <td>
                        {item.submitted_at
                          ? new Date(item.submitted_at).toLocaleString("uz-UZ")
                          : "—"}
                      </td>
                      <td>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => openAttemptReview(item)}
                        >
                          Javoblarni ochish
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <InfoNotice>Tekshirish kutilayotgan test yo‘q.</InfoNotice>
          )}
          {!reviewTarget && <LoadMore resource={reviewAttempts} />}
        </div>
      )}
      {open && (
        <div className="lc-inline-form">
          <div className="lc-form-grid">
            <Field label="Kurs" aiField="course_id">
              <select
                value={form.course_id}
                onChange={(event) =>
                  setForm({ ...form, course_id: event.target.value })
                }
              >
                <option value="">Tanlang</option>
                {courses.items.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Turi" aiField="assessment_type">
              <select
                value={form.assessment_type}
                onChange={(event) => {
                  const assessmentType = event.target.value;
                  setForm({
                    ...form,
                    assessment_type: assessmentType,
                    framework:
                      assessmentType === "ielts_mock"
                        ? "ielts"
                        : assessmentType === "cefr_mock"
                          ? "cefr"
                          : form.framework,
                  });
                }}
              >
                <option value="quiz">Mavzu testi</option>
                <option value="mock_exam">Sinov imtihoni</option>
                <option value="midterm">Oraliq imtihon</option>
                <option value="final">Yakuniy imtihon</option>
                <option value="placement">Daraja aniqlash</option>
                <option value="diagnostic">Diagnostika</option>
                <option value="exam">Imtihon</option>
                <option value="cefr_mock">CEFR sinov</option>
                <option value="ielts_mock">IELTS sinov</option>
              </select>
            </Field>
            <Field label="Baholash tizimi" aiField="framework">
              <select
                value={form.framework}
                onChange={(event) =>
                  setForm({ ...form, framework: event.target.value })
                }
              >
                <option value="custom">Markaz mezoni</option>
                <option value="cefr">CEFR</option>
                <option value="ielts">IELTS</option>
                <option value="national_exam">Milliy imtihon</option>
                <option value="school">Maktab dasturi</option>
              </select>
            </Field>
            <Field label="Nomi" wide aiField="title">
              <input
                value={form.title}
                maxLength={240}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
              />
            </Field>
            <Field label="Davomiyligi" aiField="duration_minutes">
              <select
                value={form.duration_minutes}
                onChange={(event) =>
                  setForm({
                    ...form,
                    duration_minutes: Number(event.target.value),
                  })
                }
              >
                {[15, 30, 45, 60, 90, 120, 180].map((value) => (
                  <option key={value} value={value}>
                    {value} daqiqa
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Urinish soni">
              <select
                value={form.max_attempts}
                onChange={(event) =>
                  setForm({
                    ...form,
                    max_attempts: Number(event.target.value),
                  })
                }
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </Field>
            <Field label="Ochiladi">
              <input
                type="datetime-local"
                value={form.opens_at}
                onChange={(event) =>
                  setForm({ ...form, opens_at: event.target.value })
                }
              />
            </Field>
            <Field label="Yopiladi">
              <input
                type="datetime-local"
                value={form.closes_at}
                onChange={(event) =>
                  setForm({ ...form, closes_at: event.target.value })
                }
              />
            </Field>
            <Field label="Ko‘rsatma" wide>
              <textarea
                value={form.instructions}
                maxLength={5000}
                onChange={(event) =>
                  setForm({ ...form, instructions: event.target.value })
                }
              />
            </Field>
          </div>
          <SelectorPagination resources={[["Kurslar", courses]]} />
          <div className="lc-question-builder">
            <div className="lc-section-heading">
              <div>
                <span className="lc-eyebrow">SAVOLLAR</span>
                <h3>Test ichidagi savollar</h3>
              </div>
              <ActionButton
                secondary
                onClick={() =>
                  setQuestions((current) => [
                    ...current,
                    {
                      local_id: Date.now(),
                      question_type: "multiple_choice",
                      prompt: "",
                      formula_latex: "",
                      options: ["", "", "", ""],
                      correct_answer: "",
                      points: 1,
                    },
                  ])
                }
              >
                <Plus size={14} /> Savol
              </ActionButton>
            </div>
            {questions.map((question, questionIndex) => (
              <article key={question.local_id}>
                <header>
                  <b>{questionIndex + 1}-savol</b>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setQuestions((current) =>
                          current.filter(
                            (item) => item.local_id !== question.local_id,
                          ),
                        )
                      }
                    >
                      <X size={14} /> Olib tashlash
                    </button>
                  )}
                </header>
                <div className="lc-form-grid">
                  <Field label="Savol turi">
                    <select
                      value={question.question_type}
                      onChange={(event) =>
                        setQuestions((current) =>
                          current.map((item) =>
                            item.local_id === question.local_id
                              ? {
                                  ...item,
                                  question_type: event.target.value,
                                  correct_answer: "",
                                }
                              : item,
                          ),
                        )
                      }
                    >
                      <option value="multiple_choice">Variantli</option>
                      <option value="short_answer">Qisqa javob</option>
                    </select>
                  </Field>
                  <Field label="Ball">
                    <input
                      type="number"
                      min="0.1"
                      max="1000"
                      step="0.5"
                      value={question.points}
                      onChange={(event) =>
                        setQuestions((current) =>
                          current.map((item) =>
                            item.local_id === question.local_id
                              ? {
                                  ...item,
                                  points: Number(event.target.value),
                                }
                              : item,
                          ),
                        )
                      }
                    />
                  </Field>
                  <Field label="Savol matni" wide>
                    <textarea
                      value={question.prompt}
                      maxLength={5000}
                      onChange={(event) =>
                        setQuestions((current) =>
                          current.map((item) =>
                            item.local_id === question.local_id
                              ? { ...item, prompt: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </Field>
                  <Field label="LaTeX formula" wide>
                    <textarea
                      value={question.formula_latex}
                      maxLength={2000}
                      onChange={(event) =>
                        setQuestions((current) =>
                          current.map((item) =>
                            item.local_id === question.local_id
                              ? {
                                  ...item,
                                  formula_latex: event.target.value,
                                }
                              : item,
                          ),
                        )
                      }
                    />
                  </Field>
                  <div className="lc-formula-preview">
                    <SafeFormula formula={question.formula_latex} />
                  </div>
                  {question.question_type === "multiple_choice" &&
                    question.options.map((option, optionIndex) => (
                      <Field
                        key={`${question.local_id}-${optionIndex}`}
                        label={`${String.fromCharCode(65 + optionIndex)} variant`}
                      >
                        <input
                          value={option}
                          maxLength={1000}
                          onChange={(event) =>
                            setQuestions((current) =>
                              current.map((item) =>
                                item.local_id === question.local_id
                                  ? {
                                      ...item,
                                      options: item.options.map(
                                        (value, index) =>
                                          index === optionIndex
                                            ? event.target.value
                                            : value,
                                      ),
                                    }
                                  : item,
                              ),
                            )
                          }
                        />
                      </Field>
                    ))}
                  <Field label="To‘g‘ri javob" wide>
                    {question.question_type === "multiple_choice" ? (
                      <select
                        value={question.correct_answer}
                        onChange={(event) =>
                          setQuestions((current) =>
                            current.map((item) =>
                              item.local_id === question.local_id
                                ? {
                                    ...item,
                                    correct_answer: event.target.value,
                                  }
                                : item,
                            ),
                          )
                        }
                      >
                        <option value="">Tanlang</option>
                        {question.options.map((option, optionIndex) => (
                          <option
                            key={optionIndex}
                            value={String(optionIndex)}
                            disabled={!option.trim()}
                          >
                            {String.fromCharCode(65 + optionIndex)}.{" "}
                            {option || "Bo‘sh"}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        value={question.correct_answer}
                        maxLength={1000}
                        onChange={(event) =>
                          setQuestions((current) =>
                            current.map((item) =>
                              item.local_id === question.local_id
                                ? {
                                    ...item,
                                    correct_answer: event.target.value,
                                  }
                                : item,
                            ),
                          )
                        }
                      />
                    )}
                  </Field>
                </div>
              </article>
            ))}
          </div>
          <ActionButton busy={busy} onClick={create}>
            Test qoralamasini saqlash
          </ActionButton>
        </div>
      )}
      {resource.busy && !resource.items.length ? (
        <LoadingBlock />
      ) : resource.items.length ? (
        <div className="lc-assessment-grid">
          {resource.items.map((item) => (
            <article key={item.id}>
              <header>
                <FileQuestion size={20} />
                <StatusPill status={item.status} />
              </header>
              <h3>{item.title}</h3>
              <p>{item.course_name || "Kurs"} · {item.duration_minutes || 0} daqiqa</p>
              <small>
                {item.item_count ?? item.question_count ?? 0} savol ·{" "}
                {item.total_points ?? item.total_score ?? 0} ball
              </small>
              {canManage && item.status === "draft" && (
                <ActionButton
                  secondary
                  busy={busy}
                  disabled={!(item.item_count ?? item.question_count)}
                  onClick={() => publish(item)}
                >
                  {item.item_count ?? item.question_count
                    ? "Men tekshirdim — e’lon qilish"
                    : "Avval savol qo‘shing"}
                </ActionButton>
              )}
              {studentMode && item.status === "published" && (
                <ActionButton busy={busy} onClick={() => startAttempt(item)}>
                  Testni boshlash
                </ActionButton>
              )}
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileQuestion}
          title="Test yo‘q"
          text="Hali sizga ochilgan test yoki imtihon topilmadi."
        />
      )}
      <LoadMore resource={resource} />
    </section>
  );
}

function PaymentsPanel({ apiBase, token, contextId, permissions, roles }) {
  const canManage = canAny(permissions, "payments");
  const canView =
    permissions.includes("billing.view") ||
    canManage ||
    roles.includes("student") ||
    roles.includes("parent");
  const [tab, setTab] = useState("invoices");
  const [open, setOpen] = useState(false);
  const [formMode, setFormMode] = useState("payment");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    invoice_id: "",
    amount: "",
    paid_at: todayValue(),
    payment_method: "cash",
    reference: "",
  });
  const [planForm, setPlanForm] = useState({
    course_id: "",
    name: "Oylik kurs to‘lovi",
    amount: "",
    billing_cycle: "monthly",
    billing_day: 10,
  });
  const [invoiceForm, setInvoiceForm] = useState({
    plan_id: "",
    enrollment_id: "",
    period_start: todayValue().slice(0, 8) + "01",
    period_end: todayValue(),
    due_date: todayValue(),
    discount_amount: 0,
  });
  const path =
    tab === "debts" ? centerRoutes.billingDebts : centerRoutes.billingInvoices;
  const resource = usePagedResource({
    apiBase,
    token,
    contextId,
    path,
    enabled: canView,
  });
  const plans = usePagedResource({
    apiBase,
    token,
    contextId,
    path: centerRoutes.billingPlans,
    enabled: canManage,
  });
  const courses = usePagedResource({
    apiBase,
    token,
    contextId,
    path: centerRoutes.courses,
    query: { status: "active" },
    enabled: canManage,
  });
  const enrollments = usePagedResource({
    apiBase,
    token,
    contextId,
    path: centerRoutes.enrollments,
    query: { status: "active" },
    enabled: canManage,
  });

  const pay = async () => {
    if (!canManage || !form.invoice_id || Number(form.amount) <= 0) return;
    setBusy(true);
    setError("");
    try {
      const key = makeIdempotencyKey("payment", [
        form.invoice_id,
        form.amount,
        form.paid_at,
      ]);
      await centerApi(centerRoutes.billingPayments, {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canManage,
        idempotencyKey: key,
        body: buildPaymentPayload(form, key),
      });
      setOpen(false);
      setForm((current) => ({
        ...current,
        invoice_id: "",
        amount: "",
        reference: "",
      }));
      resource.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const createPlan = async () => {
    if (!canManage || !planForm.name.trim() || Number(planForm.amount) <= 0) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      await centerApi(centerRoutes.billingPlans, {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canManage,
        idempotencyKey: makeIdempotencyKey("billing-plan", [
          planForm.course_id,
          planForm.name,
        ]),
        body: {
          course_id: planForm.course_id
            ? Number(planForm.course_id)
            : null,
          name: planForm.name,
          amount: Number(planForm.amount),
          billing_cycle: planForm.billing_cycle,
          currency: "UZS",
          billing_day:
            planForm.billing_cycle === "monthly"
              ? Number(planForm.billing_day)
              : null,
          confirmation: true,
        },
      });
      setOpen(false);
      plans.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const createInvoice = async () => {
    if (
      !canManage ||
      !invoiceForm.plan_id ||
      !invoiceForm.enrollment_id
    ) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      await centerApi(centerRoutes.billingInvoices, {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canManage,
        idempotencyKey: makeIdempotencyKey("invoice", [
          invoiceForm.plan_id,
          invoiceForm.enrollment_id,
          invoiceForm.period_start,
        ]),
        body: {
          plan_id: Number(invoiceForm.plan_id),
          enrollment_id: Number(invoiceForm.enrollment_id),
          period_start: invoiceForm.period_start,
          period_end: invoiceForm.period_end,
          due_date: invoiceForm.due_date,
          discount_amount: Number(invoiceForm.discount_amount) || 0,
          confirmation: true,
        },
      });
      setOpen(false);
      setTab("invoices");
      resource.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  if (!canView) {
    return (
      <section className="lc-dashboard-card">
        <EmptyState
          icon={WalletCards}
          title="Moliyaviy ruxsat yo‘q"
          text="To‘lov ma’lumoti faqat o‘quvchi, bog‘langan ota-ona, hisobchi va vakolatli rahbarga ko‘rinadi."
        />
      </section>
    );
  }

  return (
    <section className="lc-dashboard-card">
      <div className="lc-tabs">
        <button
          type="button"
          className={tab === "invoices" ? "active" : ""}
          onClick={() => setTab("invoices")}
        >
          Hisoblar
        </button>
        <button
          type="button"
          className={tab === "debts" ? "active" : ""}
          onClick={() => setTab("debts")}
        >
          Qarzdorlik
        </button>
      </div>
      <ResourceHeader
        eyebrow="TO‘LOVLAR"
        title="Hisob, kelgan to‘lov va qarzdorlik"
        text={
          roles.includes("student") || roles.includes("parent")
            ? "Faqat o‘zingizga yoki bog‘langan farzandga tegishli hisoblar."
            : "Pul yozuvi faqat alohida inson tasdig‘i va takrorlanmas kalit bilan saqlanadi."
        }
      />
      <ErrorNotice error={error || resource.error} onRetry={resource.reload} />
      {canManage && (
        <div className="lc-billing-actions">
          {[
            ["plan", "1. To‘lov rejasi"],
            ["invoice", "2. Hisob yaratish"],
            ["payment", "3. To‘lovni yozish"],
          ].map(([mode, label]) => (
            <button
              type="button"
              key={mode}
              onClick={() => {
                setFormMode(mode);
                setOpen(true);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {open && formMode === "payment" && (
        <div className="lc-inline-form">
          <div className="lc-form-grid">
            <Field label="Hisob">
              <select
                value={form.invoice_id}
                onChange={(event) =>
                  setForm({ ...form, invoice_id: event.target.value })
                }
              >
                <option value="">Tanlang</option>
                {resource.items
                  .filter((item) => item.status !== "paid")
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.student_name || `#${item.id}`} ·{" "}
                      {Number(item.balance_due ?? item.amount).toLocaleString(
                        "uz-UZ",
                      )}{" "}
                      so‘m
                    </option>
                  ))}
              </select>
            </Field>
            <Field label="Summa">
              <input
                type="number"
                min="1"
                step="1000"
                value={form.amount}
                onChange={(event) =>
                  setForm({ ...form, amount: event.target.value })
                }
              />
            </Field>
            <Field label="Sana">
              <input
                type="date"
                value={form.paid_at}
                onChange={(event) =>
                  setForm({ ...form, paid_at: event.target.value })
                }
              />
            </Field>
            <Field label="Usul">
              <select
                value={form.payment_method}
                onChange={(event) =>
                  setForm({ ...form, payment_method: event.target.value })
                }
              >
                <option value="cash">Naqd</option>
                <option value="card">Karta/terminal</option>
                <option value="bank_transfer">Bank o‘tkazmasi</option>
              </select>
            </Field>
            <Field label="Chek yoki izoh" wide>
              <input
                value={form.reference}
                maxLength={240}
                onChange={(event) =>
                  setForm({ ...form, reference: event.target.value })
                }
              />
            </Field>
          </div>
          <SelectorPagination resources={[["Hisoblar", resource]]} />
          <InfoNotice tone="warning">
            “Tasdiqlash” bosilgach moliyaviy yozuv yaratiladi. AI avatar bu
            tugmani bosa olmaydi.
          </InfoNotice>
          <ActionButton busy={busy} onClick={pay}>
            Men tekshirdim — to‘lovni tasdiqlash
          </ActionButton>
        </div>
      )}
      {open && formMode === "plan" && (
        <div className="lc-inline-form">
          <div className="lc-form-grid">
            <Field label="Kurs">
              <select
                value={planForm.course_id}
                onChange={(event) =>
                  setPlanForm({ ...planForm, course_id: event.target.value })
                }
              >
                <option value="">Barcha kurslar uchun</option>
                {courses.items.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Reja nomi">
              <input
                value={planForm.name}
                maxLength={180}
                onChange={(event) =>
                  setPlanForm({ ...planForm, name: event.target.value })
                }
              />
            </Field>
            <Field label="Summa">
              <input
                type="number"
                min="1"
                step="1000"
                value={planForm.amount}
                onChange={(event) =>
                  setPlanForm({ ...planForm, amount: event.target.value })
                }
              />
            </Field>
            <Field label="Davri">
              <select
                value={planForm.billing_cycle}
                onChange={(event) =>
                  setPlanForm({
                    ...planForm,
                    billing_cycle: event.target.value,
                  })
                }
              >
                <option value="monthly">Oylik</option>
                <option value="weekly">Haftalik</option>
                <option value="per_lesson">Har dars</option>
                <option value="course">Butun kurs</option>
                <option value="one_time">Bir martalik</option>
              </select>
            </Field>
            {planForm.billing_cycle === "monthly" && (
              <Field label="To‘lov kuni">
                <select
                  value={planForm.billing_day}
                  onChange={(event) =>
                    setPlanForm({
                      ...planForm,
                      billing_day: Number(event.target.value),
                    })
                  }
                >
                  {Array.from({ length: 28 }, (_, index) => index + 1).map(
                    (day) => (
                      <option key={day}>{day}</option>
                    ),
                  )}
                </select>
              </Field>
            )}
          </div>
          <SelectorPagination resources={[["Kurslar", courses]]} />
          <ActionButton busy={busy} onClick={createPlan}>
            Men tekshirdim — rejani yaratish
          </ActionButton>
        </div>
      )}
      {open && formMode === "invoice" && (
        <div className="lc-inline-form">
          <div className="lc-form-grid">
            <Field label="To‘lov rejasi">
              <select
                value={invoiceForm.plan_id}
                onChange={(event) =>
                  setInvoiceForm({
                    ...invoiceForm,
                    plan_id: event.target.value,
                  })
                }
              >
                <option value="">Tanlang</option>
                {plans.items.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} ·{" "}
                    {Number(plan.amount).toLocaleString("uz-UZ")} so‘m
                  </option>
                ))}
              </select>
            </Field>
            <Field label="O‘quvchi/kurs qabuli">
              <select
                value={invoiceForm.enrollment_id}
                onChange={(event) =>
                  setInvoiceForm({
                    ...invoiceForm,
                    enrollment_id: event.target.value,
                  })
                }
              >
                <option value="">Tanlang</option>
                {enrollments.items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.student_name || `O‘quvchi #${item.student_user_id}`} ·{" "}
                    {item.course_name || "Kurs"}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Davr boshlanishi">
              <input
                type="date"
                value={invoiceForm.period_start}
                onChange={(event) =>
                  setInvoiceForm({
                    ...invoiceForm,
                    period_start: event.target.value,
                  })
                }
              />
            </Field>
            <Field label="Davr tugashi">
              <input
                type="date"
                value={invoiceForm.period_end}
                onChange={(event) =>
                  setInvoiceForm({
                    ...invoiceForm,
                    period_end: event.target.value,
                  })
                }
              />
            </Field>
            <Field label="To‘lov muddati">
              <input
                type="date"
                value={invoiceForm.due_date}
                onChange={(event) =>
                  setInvoiceForm({
                    ...invoiceForm,
                    due_date: event.target.value,
                  })
                }
              />
            </Field>
            <Field label="Chegirma summasi">
              <input
                type="number"
                min="0"
                step="1000"
                value={invoiceForm.discount_amount}
                onChange={(event) =>
                  setInvoiceForm({
                    ...invoiceForm,
                    discount_amount: Number(event.target.value),
                  })
                }
              />
            </Field>
          </div>
          <SelectorPagination
            resources={[
              ["To‘lov rejalari", plans],
              ["Qabullar", enrollments],
            ]}
          />
          <ActionButton busy={busy} onClick={createInvoice}>
            Men tekshirdim — hisobni yaratish
          </ActionButton>
        </div>
      )}
      {resource.busy && !resource.items.length ? (
        <LoadingBlock />
      ) : resource.items.length ? (
        <div className="lc-table-wrap">
          <table className="lc-table">
            <thead>
              <tr>
                <th>O‘quvchi</th>
                <th>Kurs/oy</th>
                <th>Hisob</th>
                <th>Qoldiq</th>
                <th>Holat</th>
              </tr>
            </thead>
            <tbody>
              {resource.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.student_name || "—"}</td>
                  <td>{item.course_name || item.billing_month || "—"}</td>
                  <td>{Number(item.amount || 0).toLocaleString("uz-UZ")} so‘m</td>
                  <td>
                    {Number(item.balance_due ?? item.debt_amount ?? 0).toLocaleString(
                      "uz-UZ",
                    )}{" "}
                    so‘m
                  </td>
                  <td><StatusPill status={item.status || "unpaid"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={CircleDollarSign}
          title="Moliyaviy yozuv yo‘q"
          text="Tanlangan bo‘limda hisob yoki qarzdorlik topilmadi."
        />
      )}
      <LoadMore resource={resource} />
    </section>
  );
}

function AnalyticsPanel({
  apiBase,
  token,
  contextId,
  permissions,
  roles,
  currentUserId,
}) {
  const [data, setData] = useState(null);
  const [workload, setWorkload] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  const [period, setPeriod] = useState("30d");
  const [worklogOpen, setWorklogOpen] = useState(false);
  const [worklogForm, setWorklogForm] = useState({
    course_id: "",
    schedule_slot_id: "",
    work_date: todayValue(),
    minutes_worked: 90,
    pay_unit: "lesson",
    rate: "",
    note: "",
  });
  const courses = usePagedResource({
    apiBase,
    token,
    contextId,
    path: centerRoutes.courses,
    query: { status: "active" },
  });
  const worklogSchedule = usePagedResource({
    apiBase,
    token,
    contextId,
    path: centerRoutes.schedule,
    query: {
      course_id: worklogForm.course_id || undefined,
      from_date: worklogForm.work_date,
    },
    enabled: Boolean(worklogOpen && worklogForm.course_id),
  });
  const datedWorklogSlots = worklogSchedule.items.filter(
    (item) =>
      String(item.lesson_date || "").slice(0, 10) ===
      worklogForm.work_date,
  );
  const canUseWorkload = hasPermission(permissions, "workload.view");
  const canCreateWorklog = roles.some((role) =>
    [
      "system_admin",
      "owner",
      "founder",
      "director",
      "administrator",
      "academic_manager",
      "methodist",
      "teacher",
    ].includes(role),
  );
  const canApproveWorklog = roles.some((role) =>
    [
      "system_admin",
      "owner",
      "founder",
      "director",
      "administrator",
      "accountant",
    ].includes(role),
  );
  const load = async () => {
    setBusy(true);
    setError("");
    try {
      const workloadRange = analyticsPeriodRange(period);
      const [summary, workloadData] = await Promise.all([
        centerApi(centerRoutes.analyticsSummary, {
          apiBase,
          token,
          contextId,
          query: { period },
        }),
        canUseWorkload
          ? centerApi(centerRoutes.teacherWorkload, {
              apiBase,
              token,
              contextId,
              query: { ...workloadRange, limit: 100 },
            })
          : Promise.resolve({ items: [], summary: {} }),
      ]);
      setData(summary);
      setWorkload(workloadData);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const saveWorklog = async () => {
    const course = courses.items.find(
      (item) => Number(item.id) === Number(worklogForm.course_id),
    );
    if (!course?.teacher_user_id || !worklogForm.schedule_slot_id) {
      setError(
        "Ish yozuvi uchun o‘qituvchisi biriktirilgan kurs va shu kundagi darsni tanlang.",
      );
      return;
    }
    setBusy(true);
    setError("");
    const idempotencyKey = makeIdempotencyKey("worklog", [
      contextId,
      course.id,
      worklogForm.schedule_slot_id,
      worklogForm.work_date,
      worklogForm.minutes_worked,
    ]);
    try {
      await centerApi(centerRoutes.teacherWorklogs, {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canUseWorkload && canCreateWorklog,
        idempotencyKey,
        body: {
          teacher_user_id: Number(course.teacher_user_id),
          course_id: Number(course.id),
          schedule_slot_id: Number(worklogForm.schedule_slot_id),
          work_date: worklogForm.work_date,
          minutes_worked: Number(worklogForm.minutes_worked),
          pay_unit: worklogForm.pay_unit,
          rate:
            worklogForm.rate === "" ? null : Number(worklogForm.rate),
          note: worklogForm.note || null,
          idempotency_key: idempotencyKey,
        },
      });
      setWorklogOpen(false);
      await load();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const decideWorklog = async (item, status) => {
    if (!canApproveWorklog) return;
    setBusy(true);
    setError("");
    try {
      await centerApi(centerRoutes.teacherWorklogDecision(item.id), {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canUseWorkload && canApproveWorklog,
        body: { status, confirmation: true },
      });
      await load();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="lc-dashboard-card">
      <ResourceHeader
        eyebrow="ANALITIKA"
        title="Natija, davomat va o‘sish"
        text={
          roles.includes("teacher")
            ? "Faqat siz o‘qitadigan guruhlar kesimi."
            : "Server rolingiz doirasidagi umumlashtirilgan ko‘rsatkichni qaytaradi."
        }
      />
      <div className="lc-filter-row">
        <Field label="Davr">
          <select value={period} onChange={(event) => setPeriod(event.target.value)}>
            <option value="7d">7 kun</option>
            <option value="30d">30 kun</option>
            <option value="90d">90 kun</option>
            <option value="year">O‘quv yili</option>
          </select>
        </Field>
        {canUseWorkload && canCreateWorklog && (
          <ActionButton
            secondary
            onClick={() => setWorklogOpen((current) => !current)}
          >
            <Plus size={14} /> O‘qituvchi ish vaqtini yozish
          </ActionButton>
        )}
      </div>
      <ErrorNotice
        error={error || (worklogOpen ? worklogSchedule.error : "")}
        onRetry={worklogOpen ? worklogSchedule.reload : load}
      />
      {worklogOpen && (
        <div className="lc-inline-form">
          <div className="lc-form-grid">
            <Field label="Kurs">
              <select
                value={worklogForm.course_id}
                onChange={(event) =>
                  setWorklogForm({
                    ...worklogForm,
                    course_id: event.target.value,
                    schedule_slot_id: "",
                  })
                }
              >
                <option value="">Tanlang</option>
                {courses.items.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name} · {course.teacher_name || "O‘qituvchisiz"}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Sana">
              <input
                type="date"
                value={worklogForm.work_date}
                onChange={(event) =>
                  setWorklogForm({
                    ...worklogForm,
                    work_date: event.target.value,
                    schedule_slot_id: "",
                  })
                }
              />
            </Field>
            <Field
              label="Shu kundagi dars"
              hint="Bir jadval darsi uchun faqat bitta ish yozuvi saqlanadi."
            >
              <select
                value={worklogForm.schedule_slot_id}
                disabled={
                  !worklogForm.course_id ||
                  worklogSchedule.busy ||
                  !datedWorklogSlots.length
                }
                onChange={(event) =>
                  setWorklogForm({
                    ...worklogForm,
                    schedule_slot_id: event.target.value,
                  })
                }
              >
                <option value="">
                  {worklogSchedule.busy
                    ? "Jadval yuklanmoqda..."
                    : datedWorklogSlots.length
                      ? "Darsni tanlang"
                      : "Bu sanada dars yo‘q"}
                </option>
                {datedWorklogSlots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {String(slot.starts_at || "").slice(0, 5)}–
                    {String(slot.ends_at || "").slice(0, 5)} ·{" "}
                    {slot.topic || slot.course_name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Ishlangan daqiqa">
              <input
                type="number"
                min="1"
                max="1440"
                value={worklogForm.minutes_worked}
                onChange={(event) =>
                  setWorklogForm({
                    ...worklogForm,
                    minutes_worked: Number(event.target.value),
                  })
                }
              />
            </Field>
            <Field label="Hisoblash turi">
              <select
                value={worklogForm.pay_unit}
                onChange={(event) =>
                  setWorklogForm({
                    ...worklogForm,
                    pay_unit: event.target.value,
                  })
                }
              >
                <option value="lesson">Dars uchun</option>
                <option value="hour">Soatbay</option>
                <option value="fixed">Belgilangan</option>
              </select>
            </Field>
            <Field label="Stavka (ixtiyoriy)">
              <input
                type="number"
                min="0"
                value={worklogForm.rate}
                onChange={(event) =>
                  setWorklogForm({
                    ...worklogForm,
                    rate: event.target.value,
                  })
                }
              />
            </Field>
            <Field label="Izoh" wide>
              <textarea
                maxLength={1000}
                value={worklogForm.note}
                onChange={(event) =>
                  setWorklogForm({
                    ...worklogForm,
                    note: event.target.value,
                  })
                }
              />
            </Field>
          </div>
          <SelectorPagination
            resources={[
              ["Kurslar", courses],
              ["Darslar", worklogSchedule],
            ]}
          />
          <ActionButton
            busy={busy}
            disabled={
              !worklogForm.course_id || !worklogForm.schedule_slot_id
            }
            onClick={saveWorklog}
          >
            Ish yozuvini saqlash
          </ActionButton>
        </div>
      )}
      {busy ? (
        <LoadingBlock />
      ) : (
        <>
          <div className="lc-metric-grid">
            {[
              ["Faol o‘quvchi", data?.students_active],
              ["O‘rtacha davomat", `${data?.attendance_rate ?? 0}%`],
              ["O‘rtacha natija", `${data?.average_score ?? 0}%`],
              ["Yakunlangan test", data?.assessments_completed],
              ["Yangi qabul", data?.new_enrollments],
              ["Qarzdorlik", `${Number(data?.debt_total || 0).toLocaleString("uz-UZ")} so‘m`],
            ].map(([label, value]) => (
              <article key={label}>
                <small>{label}</small>
                <b>{value ?? 0}</b>
              </article>
            ))}
          </div>
          <div className="lc-progress-list">
            {(data?.course_progress || []).slice(0, 20).map((item) => (
              <div key={item.course_id}>
                <span>
                  <b>{item.course_name}</b>
                  <small>{item.students || 0} o‘quvchi</small>
                </span>
                <i><em style={{ width: `${Math.min(100, item.average_score || 0)}%` }} /></i>
                <strong>{item.average_score || 0}%</strong>
              </div>
            ))}
          </div>
          {!data?.course_progress?.length && (
            <InfoNotice>
              Kurs bo‘yicha yetarli natija yig‘ilgach o‘sish chizig‘i
              ko‘rsatiladi.
            </InfoNotice>
          )}
          <section className="lc-inline-section">
            <div className="lc-section-heading">
              <div>
                <span className="lc-eyebrow">O‘QITUVCHI YUKLAMASI</span>
                <h3>
                  {Number(
                    workload?.summary?.approved_minutes || 0,
                  ).toLocaleString("uz-UZ")}{" "}
                  daqiqa tasdiqlangan
                </h3>
              </div>
            </div>
            {workload?.items?.length ? (
              <div className="lc-table-wrap">
                <table className="lc-table">
                  <thead>
                    <tr>
                      <th>O‘qituvchi</th>
                      <th>Kurs</th>
                      <th>Sana</th>
                      <th>Vaqt</th>
                      <th>Holat</th>
                      <th>Amal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workload.items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.teacher_name}</td>
                        <td>{item.course_name}</td>
                        <td>{item.work_date}</td>
                        <td>{item.minutes_worked} daqiqa</td>
                        <td>
                          <StatusPill status={item.status || "pending"} />
                        </td>
                        <td>
                          {canApproveWorklog &&
                          Number(item.teacher_user_id) !==
                            Number(currentUserId) &&
                          ["draft", "pending"].includes(item.status) ? (
                            <div className="lc-row-actions">
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  decideWorklog(item, "approved")
                                }
                              >
                                Tasdiqlash
                              </button>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  decideWorklog(item, "rejected")
                                }
                              >
                                Rad etish
                              </button>
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <InfoNotice>
                Tanlangan davrda o‘qituvchi ish yozuvi yo‘q.
              </InfoNotice>
            )}
          </section>
        </>
      )}
    </section>
  );
}

function StaffPanel({
  apiBase,
  token,
  contextId,
  permissions,
  roles: actorRoles,
  currentUserId,
  capabilities,
}) {
  const canManage = canAny(permissions, "staff");
  const branchScope = capabilities?.branch_scope || {};
  const branchRestricted = branchScope.global === false;
  const authorizedBranchIds = (branchScope.branch_ids || []).map(Number);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [availabilityTarget, setAvailabilityTarget] = useState(null);
  const [availabilityRows, setAvailabilityRows] = useState([]);
  const [form, setForm] = useState({
    user_id: "",
    role_key: "teacher",
    branch_id: "",
    subject_ids: [],
    employment_type: "part_time",
    weekly_capacity_hours: 24,
  });
  const resource = usePagedResource({
    apiBase,
    token,
    contextId,
    path: centerRoutes.staff,
  });
  const branches = usePagedResource({
    apiBase,
    token,
    contextId,
    path: centerRoutes.branches,
  });
  const subjects = usePagedResource({
    apiBase,
    token,
    contextId,
    path: centerRoutes.subjects,
  });
  const grantMatrix = {
    system_admin: [
      "director",
      "administrator",
      "academic_manager",
      "receptionist",
      "accountant",
      "methodist",
      "teacher",
    ],
    owner: [
      "director",
      "administrator",
      "academic_manager",
      "receptionist",
      "accountant",
      "methodist",
      "teacher",
    ],
    founder: [
      "director",
      "administrator",
      "academic_manager",
      "receptionist",
      "accountant",
      "methodist",
      "teacher",
    ],
    director: [
      "administrator",
      "academic_manager",
      "receptionist",
      "accountant",
      "methodist",
      "teacher",
    ],
    administrator: ["receptionist", "methodist", "teacher"],
    academic_manager: ["methodist", "teacher"],
  };
  const assignableRoles = new Set(
    (actorRoles || []).flatMap((role) => grantMatrix[role] || []),
  );
  const roleOptions = Object.entries(CENTER_ROLES).filter(([key]) =>
    assignableRoles.has(key),
  );

  useEffect(() => {
    if (!branchRestricted) return;
    const visible = branches.items.filter((branch) =>
      authorizedBranchIds.includes(Number(branch.id)),
    );
    const defaultBranchId = visible[0]?.id || authorizedBranchIds[0];
    setForm((current) => {
      const currentAllowed = authorizedBranchIds.includes(
        Number(current.branch_id),
      );
      if (currentAllowed || !defaultBranchId) return current;
      return { ...current, branch_id: String(defaultBranchId) };
    });
  }, [
    branchRestricted,
    authorizedBranchIds.join(","),
    branches.items.map((item) => item.id).join(","),
  ]);

  useEffect(() => {
    const handleAvatarAction = (event) => {
      const action = event.detail;
      if (
        canManage &&
        action?.section === "staff" &&
        action.type === "FOCUS_FIELD"
      ) {
        setOpen(true);
      }
    };
    window.addEventListener(
      "samtm:center-avatar-action",
      handleAvatarAction,
    );
    return () =>
      window.removeEventListener(
        "samtm:center-avatar-action",
        handleAvatarAction,
      );
  }, [canManage]);

  const searchUsers = async () => {
    if (userQuery.trim().length < 3) {
      setError("Xodim ismi yoki hisob ID sidan kamida 3 ta belgi yozing.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const data = await centerApi(centerRoutes.userSearch, {
        apiBase,
        token,
        contextId,
        query: { q: userQuery.trim(), limit: 20 },
      });
      setUserResults(data.items || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (
      !canManage ||
      !assignableRoles.has(form.role_key) ||
      !form.user_id ||
      !form.role_key ||
      (branchRestricted &&
        !authorizedBranchIds.includes(Number(form.branch_id)))
    ) {
      if (
        branchRestricted &&
        !authorizedBranchIds.includes(Number(form.branch_id))
      ) {
        setError("Xodimni faqat vakolatingizdagi filialga biriktiring.");
      }
      return;
    }
    setBusy(true);
    setError("");
    try {
      await centerApi(centerRoutes.staff, {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canManage,
        idempotencyKey: makeIdempotencyKey("staff", [
          form.user_id,
          form.role_key,
        ]),
        body: {
          ...form,
          user_id: Number(form.user_id),
          branch_id: form.branch_id ? Number(form.branch_id) : null,
          subject_ids: form.subject_ids.map(Number),
          weekly_capacity_hours: Number(form.weekly_capacity_hours),
          confirmation: true,
        },
      });
      setOpen(false);
      setForm((current) => ({ ...current, user_id: "", subject_ids: [] }));
      resource.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const changeStaffStatus = async (item, status) => {
    if (!canManage) return;
    setBusy(true);
    setError("");
    try {
      await centerApi(centerRoutes.staffStatus(item.id), {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canManage,
        body: { status, confirmation: true },
      });
      resource.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const openAvailability = async (item) => {
    setBusy(true);
    setError("");
    try {
      const data = await centerApi(
        centerRoutes.staffAvailability(item.user_id),
        {
          apiBase,
          token,
          contextId,
        },
      );
      const rows = (data.items || []).map((row, index) => ({
        local_id: row.id || `${Date.now()}-${index}`,
        weekday: Number(row.weekday),
        starts_at: String(row.starts_at || "09:00").slice(0, 5),
        ends_at: String(row.ends_at || "18:00").slice(0, 5),
        availability: row.availability || "available",
        effective_from: row.effective_from || "",
        effective_to: row.effective_to || "",
        note: row.note || "",
      }));
      setAvailabilityTarget(item);
      setAvailabilityRows(
        rows.length
          ? rows
          : [
              {
                local_id: Date.now(),
                weekday: 1,
                starts_at: "09:00",
                ends_at: "18:00",
                availability: "available",
                effective_from: "",
                effective_to: "",
                note: "",
              },
            ],
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const saveAvailability = async () => {
    const allowed =
      availabilityTarget?.can_edit_availability === true ||
      Number(availabilityTarget?.user_id) === Number(currentUserId);
    if (!availabilityTarget || !allowed) return;
    setBusy(true);
    setError("");
    try {
      await centerApi(
        centerRoutes.staffAvailability(availabilityTarget.user_id),
        {
          apiBase,
          token,
          contextId,
          method: "PUT",
          allowed,
          body: {
            rows: availabilityRows.map((row) => ({
              weekday: Number(row.weekday),
              starts_at: row.starts_at,
              ends_at: row.ends_at,
              availability: row.availability,
              effective_from: row.effective_from || null,
              effective_to: row.effective_to || null,
              note: row.note || null,
            })),
          },
        },
      );
      setAvailabilityTarget(null);
      setAvailabilityRows([]);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="lc-dashboard-card">
      <ResourceHeader
        eyebrow="XODIMLAR"
        title={
          actorRoles?.includes("teacher") && !canManage
            ? "Mening ish vaqtim"
            : "Rol, filial va fan biriktirish"
        }
        text={
          actorRoles?.includes("teacher") && !canManage
            ? "Dars qo‘yish mumkin, afzal va mavjud bo‘lmagan vaqtlaringizni sozlang."
            : "Tasdiqlangan platforma foydalanuvchisini aniq rol bilan ulang. Bir o‘qituvchi bir nechta markazda alohida ish maydoni bilan ishlashi mumkin."
        }
        canCreate={canManage && roleOptions.length > 0}
        onCreate={() => setOpen((value) => !value)}
        label="Xodim biriktirish"
      />
      <ErrorNotice error={error || resource.error} onRetry={resource.reload} />
      {availabilityTarget && (
        <div className="lc-inline-form">
          <div className="lc-section-heading">
            <div>
              <span className="lc-eyebrow">O‘QITUVCHI VAQTI</span>
              <h3>{availabilityTarget.full_name}</h3>
            </div>
            <button
              type="button"
              className="lc-text-danger"
              onClick={() => setAvailabilityTarget(null)}
            >
              <X size={14} /> Yopish
            </button>
          </div>
          <InfoNotice>
            “Mavjud” va “Afzal” vaqtlar jadval tuzishga yordam beradi;
            “Mavjud emas” oralig‘iga dars qo‘yilsa server rad etadi.
          </InfoNotice>
          <div className="lc-content-list">
            {availabilityRows.map((row) => (
              <article key={row.local_id}>
                <div className="lc-form-grid">
                  <Field label="Hafta kuni">
                    <select
                      value={row.weekday}
                      onChange={(event) =>
                        setAvailabilityRows((current) =>
                          current.map((item) =>
                            item.local_id === row.local_id
                              ? {
                                  ...item,
                                  weekday: Number(event.target.value),
                                }
                              : item,
                          ),
                        )
                      }
                    >
                      {WEEK_DAYS.map((day) => (
                        <option key={day.value} value={day.value}>
                          {day.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Boshlanish">
                    <input
                      type="time"
                      value={row.starts_at}
                      onChange={(event) =>
                        setAvailabilityRows((current) =>
                          current.map((item) =>
                            item.local_id === row.local_id
                              ? { ...item, starts_at: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </Field>
                  <Field label="Tugash">
                    <input
                      type="time"
                      value={row.ends_at}
                      onChange={(event) =>
                        setAvailabilityRows((current) =>
                          current.map((item) =>
                            item.local_id === row.local_id
                              ? { ...item, ends_at: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </Field>
                  <Field label="Holat">
                    <select
                      value={row.availability}
                      onChange={(event) =>
                        setAvailabilityRows((current) =>
                          current.map((item) =>
                            item.local_id === row.local_id
                              ? { ...item, availability: event.target.value }
                              : item,
                          ),
                        )
                      }
                    >
                      <option value="available">Mavjud</option>
                      <option value="preferred">Afzal vaqt</option>
                      <option value="unavailable">Mavjud emas</option>
                    </select>
                  </Field>
                  <Field label="Qaysi sanadan">
                    <input
                      type="date"
                      value={row.effective_from}
                      onChange={(event) =>
                        setAvailabilityRows((current) =>
                          current.map((item) =>
                            item.local_id === row.local_id
                              ? { ...item, effective_from: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </Field>
                  <Field label="Qaysi sanagacha">
                    <input
                      type="date"
                      value={row.effective_to}
                      onChange={(event) =>
                        setAvailabilityRows((current) =>
                          current.map((item) =>
                            item.local_id === row.local_id
                              ? { ...item, effective_to: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </Field>
                  <Field label="Izoh" wide>
                    <input
                      value={row.note}
                      maxLength={500}
                      onChange={(event) =>
                        setAvailabilityRows((current) =>
                          current.map((item) =>
                            item.local_id === row.local_id
                              ? { ...item, note: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </Field>
                </div>
                <button
                  type="button"
                  className="lc-text-danger"
                  onClick={() =>
                    setAvailabilityRows((current) =>
                      current.filter(
                        (item) => item.local_id !== row.local_id,
                      ),
                    )
                  }
                >
                  Olib tashlash
                </button>
              </article>
            ))}
          </div>
          <div className="lc-row-actions">
            <ActionButton
              secondary
              onClick={() =>
                setAvailabilityRows((current) => [
                  ...current,
                  {
                    local_id: `${Date.now()}-${current.length}`,
                    weekday: 1,
                    starts_at: "09:00",
                    ends_at: "18:00",
                    availability: "available",
                    effective_from: "",
                    effective_to: "",
                    note: "",
                  },
                ])
              }
            >
              <Plus size={14} /> Vaqt qo‘shish
            </ActionButton>
            <ActionButton busy={busy} onClick={saveAvailability}>
              O‘qituvchi vaqtini saqlash
            </ActionButton>
          </div>
        </div>
      )}
      {open && (
        <div className="lc-inline-form">
          <div className="lc-form-grid">
            <Field label="Xodimni ism yoki hisob ID bo‘yicha topish" wide>
              <div className="lc-search-control">
                <input
                  value={userQuery}
                  maxLength={100}
                  onChange={(event) => {
                    setUserQuery(event.target.value);
                    setUserResults([]);
                    setForm({ ...form, user_id: "" });
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      searchUsers();
                    }
                  }}
                  placeholder="Kamida 3 ta belgi"
                />
                <ActionButton
                  secondary
                  busy={busy}
                  onClick={searchUsers}
                >
                  <Search size={14} /> Qidirish
                </ActionButton>
              </div>
            </Field>
            {userResults.length > 0 && (
              <div className="lc-user-results">
                {userResults.map((user) => (
                  <button
                    type="button"
                    key={user.user_id}
                    className={
                      Number(form.user_id) === Number(user.user_id)
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      setForm({
                        ...form,
                        user_id: String(user.user_id),
                      })
                    }
                  >
                    <span>
                      <b>{user.full_name}</b>
                      <small>
                        {user.already_in_center
                          ? "Markazda boshqa roli bor — yana rol berish mumkin"
                          : user.account_identifier ||
                            `Foydalanuvchi #${user.user_id}`}
                      </small>
                    </span>
                    {Number(form.user_id) === Number(user.user_id) && (
                      <Check size={15} />
                    )}
                  </button>
                ))}
              </div>
            )}
            <Field label="Rol">
              <select
                value={form.role_key}
                onChange={(event) =>
                  setForm({ ...form, role_key: event.target.value })
                }
              >
                {roleOptions.map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Filial" aiField="branch_id">
              <select
                value={form.branch_id}
                onChange={(event) =>
                  setForm({ ...form, branch_id: event.target.value })
                }
              >
                {!branchRestricted && (
                  <option value="">Barcha filial</option>
                )}
                {branchRestricted && !form.branch_id && (
                  <option value="" disabled>
                    Vakolatli filial yuklanmoqda
                  </option>
                )}
                {branches.items.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Ish shakli">
              <select
                value={form.employment_type}
                onChange={(event) =>
                  setForm({ ...form, employment_type: event.target.value })
                }
              >
                <option value="full_time">To‘liq stavka</option>
                <option value="part_time">O‘rindoshlik</option>
                <option value="contract">Shartnoma</option>
                <option value="hourly">Soatbay</option>
              </select>
            </Field>
            <Field label="Haftalik imkoniyat">
              <select
                value={form.weekly_capacity_hours}
                onChange={(event) =>
                  setForm({
                    ...form,
                    weekly_capacity_hours: Number(event.target.value),
                  })
                }
              >
                {[6, 12, 18, 24, 30, 36, 40, 48].map((hour) => (
                  <option key={hour} value={hour}>
                    {hour} soat
                  </option>
                ))}
              </select>
            </Field>
            {form.role_key === "teacher" && (
              <Field label="O‘qitadigan fanlar" wide>
                <div className="lc-subject-picker small">
                  {subjects.items.map((subject) => {
                    const selected = form.subject_ids.includes(
                      String(subject.id),
                    );
                    return (
                      <button
                        type="button"
                        key={subject.id}
                        className={selected ? "selected" : ""}
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            subject_ids: selected
                              ? current.subject_ids.filter(
                                  (id) => id !== String(subject.id),
                                )
                              : [...current.subject_ids, String(subject.id)],
                          }))
                        }
                      >
                        {selected && <Check size={13} />} {subject.name}
                      </button>
                    );
                  })}
                </div>
              </Field>
            )}
          </div>
          <SelectorPagination
            resources={[
              ["Filiallar", branches],
              ["Fanlar", subjects],
            ]}
          />
          <InfoNotice tone="warning">
            Rol berish yuqori vakolatli amal. AI avatar bu formani tushuntiradi,
            lekin xodimni o‘zi biriktirmaydi.
          </InfoNotice>
          <ActionButton busy={busy} onClick={save}>
            Men tekshirdim — xodimni biriktirish
          </ActionButton>
        </div>
      )}
      {resource.busy && !resource.items.length ? (
        <LoadingBlock />
      ) : resource.items.length ? (
        <div className="lc-entity-grid">
          {resource.items.map((item) => (
            <article key={item.id}>
              <span className="lc-list-icon"><Users size={18} /></span>
              <div>
                <h3>{item.full_name || item.name || `Xodim #${item.user_id}`}</h3>
                <p>{CENTER_ROLES[item.role_key] || item.role_key}</p>
                <small>
                  {item.branch_name || "Barcha filial"} ·{" "}
                  {(item.subject_names || []).join(", ") || "Fan belgilanmagan"}
                </small>
              </div>
              <div className="lc-entity-end">
                <StatusPill status={item.status || "active"} />
                {item.role_key === "teacher" &&
                  item.status === "active" &&
                  (item.can_edit_availability === true ||
                    Number(item.user_id) === Number(currentUserId)) && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => openAvailability(item)}
                  >
                    Bo‘sh vaqtini sozlash
                  </button>
                )}
                {canManage &&
                  assignableRoles.has(item.role_key) &&
                  item.status === "active" && (
                  <div className="lc-row-actions">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => changeStaffStatus(item, "suspended")}
                    >
                      Vaqtincha to‘xtatish
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => changeStaffStatus(item, "ended")}
                    >
                      Ishini yakunlash
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="Xodim topilmadi"
          text="Markazga hali alohida xodim biriktirilmagan."
        />
      )}
      <LoadMore resource={resource} />
    </section>
  );
}

function SettingsPanel({
  apiBase,
  token,
  contextId,
  permissions,
  center,
  preferences,
  onPreferences,
}) {
  const [tab, setTab] = useState("branches");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const path =
    tab === "branches"
      ? centerRoutes.branches
      : tab === "rooms"
        ? centerRoutes.rooms
        : centerRoutes.subjects;
  const permissionKey =
    tab === "branches" ? "branches" : tab === "rooms" ? "rooms" : "subjects";
  const canManage = canAny(permissions, permissionKey);
  const resource = usePagedResource({
    apiBase,
    token,
    contextId,
    path,
  });
  const branches = usePagedResource({
    apiBase,
    token,
    contextId,
    path: centerRoutes.branches,
    enabled: tab === "rooms",
  });
  const [form, setForm] = useState({
    name: "",
    address: "",
    work_start: "08:00",
    work_end: "20:00",
    work_days: [1, 2, 3, 4, 5, 6],
    branch_id: "",
    room_type: "classroom",
    capacity: 16,
    subject_code: "",
  });

  const save = async () => {
    if (!canManage || !form.name.trim()) return;
    setBusy(true);
    setError("");
    try {
      const body =
        tab === "branches"
          ? {
              name: form.name,
              address: form.address,
              work_start: form.work_start,
              work_end: form.work_end,
              work_days: form.work_days,
            }
          : tab === "rooms"
            ? {
                name: form.name,
                branch_id: Number(form.branch_id),
                room_type: form.room_type,
                capacity: Number(form.capacity),
              }
            : {
                name: form.name,
                code:
                  form.subject_code ||
                  form.name
                    .trim()
                    .toUpperCase()
                    .replace(/[^A-Z0-9]+/g, "_")
                    .replace(/^_|_$/g, "")
                    .slice(0, 40) ||
                  "SUBJECT",
                supports_latex: false,
              };
      await centerApi(path, {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canManage,
        idempotencyKey: makeIdempotencyKey(tab, [contextId, form.name]),
        body,
      });
      setOpen(false);
      setForm((current) => ({ ...current, name: "", address: "" }));
      resource.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <section className="lc-dashboard-card">
        <span className="lc-eyebrow">MARKAZ SOZLAMALARI</span>
        <h2>{center.name}</h2>
        <div className="lc-settings-summary">
          <div>
            <MapPin size={18} />
            <span>
              <small>Hudud</small>
              <b>{[center.region, center.district].filter(Boolean).join(", ") || "—"}</b>
            </span>
          </div>
          <div>
            <Building2 size={18} />
            <span>
              <small>Model</small>
              <b>
                {center.operator_model === "independent_tutor"
                  ? "Mustaqil repetitor"
                  : center.ownership_type === "public"
                    ? "Davlat markazi"
                    : "Xususiy markaz"}
              </b>
            </span>
          </div>
        </div>
        <div className="lc-avatar-settings">
          <div>
            <Sparkles size={20} />
            <span>
              <b>AI yo‘lko‘rsatuvchi</b>
              <small>Ovozni va ko‘rinishni istalgan vaqtda o‘zgartiring.</small>
            </span>
          </div>
          <label className="lc-switch">
            <input
              type="checkbox"
              checked={preferences.enabled}
              onChange={(event) =>
                onPreferences({ enabled: event.target.checked })
              }
            />
            Yoqilgan
          </label>
          <label className="lc-switch">
            <input
              type="checkbox"
              checked={preferences.speechEnabled}
              onChange={(event) =>
                onPreferences({ speechEnabled: event.target.checked })
              }
            />
            Ovoz
          </label>
          <select
            value={preferences.variant}
            onChange={(event) =>
              onPreferences({ variant: event.target.value })
            }
          >
            <option value="female">Ayol ko‘rinishi</option>
            <option value="male">Erkak ko‘rinishi</option>
            <option value="neutral">Neytral ko‘rinish</option>
          </select>
        </div>
      </section>
      <section className="lc-dashboard-card">
        <div className="lc-tabs">
          {[
            ["branches", "Filiallar"],
            ["rooms", "Xonalar"],
            ["subjects", "Fanlar"],
          ].map(([key, label]) => (
            <button
              type="button"
              key={key}
              className={tab === key ? "active" : ""}
              onClick={() => {
                setTab(key);
                setOpen(false);
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <ResourceHeader
          eyebrow="TUZILMA"
          title={
            tab === "branches"
              ? "Filiallar"
              : tab === "rooms"
                ? "Xonalar"
                : "O‘qitiladigan fanlar"
          }
          canCreate={canManage}
          onCreate={() => setOpen((value) => !value)}
          label="Qo‘shish"
        />
        <ErrorNotice error={error || resource.error} onRetry={resource.reload} />
        {open && (
          <div className="lc-inline-form">
            <div className="lc-form-grid">
              <Field label="Nomi">
                <input
                  value={form.name}
                  maxLength={160}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                />
              </Field>
              {tab === "branches" && (
                <>
                  <Field label="Manzil">
                    <input
                      value={form.address}
                      maxLength={240}
                      onChange={(event) =>
                        setForm({ ...form, address: event.target.value })
                      }
                    />
                  </Field>
                  <Field label="Ish boshlanishi">
                    <input
                      type="time"
                      value={form.work_start}
                      onChange={(event) =>
                        setForm({ ...form, work_start: event.target.value })
                      }
                    />
                  </Field>
                  <Field label="Ish tugashi">
                    <input
                      type="time"
                      value={form.work_end}
                      onChange={(event) =>
                        setForm({ ...form, work_end: event.target.value })
                      }
                    />
                  </Field>
                  <Field label="Ish kunlari" wide>
                    <WeekdayPicker
                      value={form.work_days}
                      onChange={(workDays) =>
                        setForm({ ...form, work_days: workDays })
                      }
                    />
                  </Field>
                </>
              )}
              {tab === "rooms" && (
                <>
                  <Field label="Filial">
                    <select
                      value={form.branch_id}
                      onChange={(event) =>
                        setForm({ ...form, branch_id: event.target.value })
                      }
                    >
                      <option value="">Tanlang</option>
                      {branches.items.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Xona turi">
                    <select
                      value={form.room_type}
                      onChange={(event) =>
                        setForm({ ...form, room_type: event.target.value })
                      }
                    >
                      <option value="classroom">Oddiy sinfxona</option>
                      <option value="computer">Kompyuter xonasi</option>
                      <option value="laboratory">Laboratoriya</option>
                      <option value="online">Virtual xona</option>
                    </select>
                  </Field>
                  <Field label="Sig‘im">
                    <input
                      type="number"
                      min="1"
                      max="200"
                      value={form.capacity}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          capacity: Number(event.target.value),
                        })
                      }
                    />
                  </Field>
                </>
              )}
              {tab === "subjects" && (
                <Field label="Qisqa kod">
                  <input
                    value={form.subject_code}
                    maxLength={32}
                    onChange={(event) =>
                      setForm({ ...form, subject_code: event.target.value })
                    }
                    placeholder="Masalan: MATH"
                  />
                </Field>
              )}
            </div>
            {tab === "rooms" && (
              <SelectorPagination resources={[["Filiallar", branches]]} />
            )}
            <ActionButton
              busy={busy}
              disabled={
                !form.name.trim() ||
                (tab === "rooms" && !form.branch_id)
              }
              onClick={save}
            >
              Saqlash
            </ActionButton>
          </div>
        )}
        {resource.busy && !resource.items.length ? (
          <LoadingBlock />
        ) : resource.items.length ? (
          <div className="lc-entity-grid compact">
            {resource.items.map((item) => (
              <article key={item.id}>
                <span className="lc-list-icon">
                  {tab === "branches" ? (
                    <Building2 size={18} />
                  ) : tab === "rooms" ? (
                    <DoorOpen size={18} />
                  ) : (
                    <BookOpen size={18} />
                  )}
                </span>
                <div>
                  <h3>{item.name}</h3>
                  <p>
                    {tab === "branches"
                      ? item.address || "Manzil kiritilmagan"
                      : tab === "rooms"
                        ? `${item.branch_name || "Filial"} · ${item.capacity || 0} joy`
                        : item.subject_code || "Kod belgilanmagan"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Settings}
            title="Ma’lumot yo‘q"
            text="Vakolatingiz bo‘lsa birinchi yozuvni qo‘shing."
          />
        )}
        <LoadMore resource={resource} />
      </section>
    </>
  );
}
