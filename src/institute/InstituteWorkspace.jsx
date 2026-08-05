import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  FileBadge,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  Menu,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  UserPlus,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import GuidedAvatar from "../assistant/GuidedAvatar.jsx";
import { HUDUDLAR, VILOYATLAR } from "../hududlar.js";
import {
  instituteApi,
  instituteRoutes,
  makeIdempotencyKey,
  mergePage,
  pageQuery,
  unwrapItems,
} from "./api.js";
import {
  buildAcademicYearPayload,
  buildAssessmentPayload,
  buildAttendancePayload,
  buildCohortPayload,
  buildContractPayload,
  buildCoursePayload,
  buildCurriculumCoursePayload,
  buildCurriculumPayload,
  buildDepartmentPayload,
  buildDraftPatchPayload,
  buildDraftStartPayload,
  buildEnrollmentPayload,
  buildFacultyPayload,
  buildGradePayload,
  buildInstallmentsPayload,
  buildPaymentPayload,
  buildProgramPayload,
  buildSchedulePayload,
  buildSectionPayload,
  buildTermPayload,
  attendanceWarnings,
} from "./contracts.js";
import {
  ASSISTANT_DRAFT_FIELDS,
  ASSISTANT_SAFE_ACTIONS,
  DEGREE_LEVELS,
  GRADING_SYSTEMS,
  INSTITUTE_KINDS,
  INSTITUTE_ROLES,
  ONBOARDING_STEPS,
  OWNERSHIP_TYPES,
  STUDY_FORMS,
  STUDENT_STATUS_LABELS,
  TERM_SYSTEMS,
  hasPermission,
  menuForRoles,
  normalizeMenu,
  tourForRoles,
} from "./workflow.js";
import "./institute.css";

const MENU_META = {
  overview: ["Bosh sahifa", LayoutDashboard],
  structure: ["Tuzilma", Building2],
  curriculum: ["O‘quv reja", BookOpen],
  schedule: ["Jadval", CalendarDays],
  attendance: ["Davomat", ClipboardCheck],
  gradebook: ["Baholar", FileBadge],
  exams: ["Imtihonlar", GraduationCap],
  students: ["Talabalar", Users],
  transcripts: ["Transkript", FileBadge],
  finance: ["Kontrakt va to‘lov", WalletCards],
  analytics: ["Analitika", BarChart3],
  staff: ["Xodimlar", UserPlus],
  settings: ["Sozlamalar", Settings],
};

const STATUS_LABELS = {
  active: "Faol",
  pending: "Kutilmoqda",
  pending_verification: "Tekshiruv kutilmoqda",
  verified: "Tasdiqlangan",
  rejected: "Rad etilgan",
  draft: "Qoralama",
  published: "E’lon qilingan",
  planned: "Rejalashtirilgan",
  registration: "Fan tanlash",
  grade_entry: "Baho kiritish",
  closed: "Yopilgan",
  archived: "Arxiv",
  enrolled: "Qabul qilingan",
  waitlisted: "Kutish ro‘yxati",
  completed: "Yakunlangan",
  withdrawn: "Chiqdi",
  paid: "To‘langan",
  partial: "Qisman",
  unpaid: "To‘lanmagan",
  overdue: "Muddati o‘tgan",
  present: "Keldi",
  absent: "Kelmadi",
  late: "Kechikdi",
  excused: "Sababli",
  sick: "Betob",
  ...STUDENT_STATUS_LABELS,
};

const WRITE_PERMISSIONS = {
  structure: "structure.manage",
  staff: "staff.manage",
  academics: "academics.manage",
  terms: "terms.manage",
  enrollments: "enrollments.manage",
  schedule: "schedule.manage",
  attendance: "attendance.write",
  grades: "grades.write",
  finalize: "grades.finalize",
  transcripts: "transcripts.issue",
  finance: "finance.manage",
  workload: "workload.manage",
};

function canWrite(permissions, key) {
  return hasPermission(permissions, WRITE_PERMISSIONS[key]);
}

function todayValue() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function currentAcademicYear() {
  const now = new Date();
  const start = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  return `${start}-${start + 1}`;
}

function loadAvatarPreferences() {
  try {
    const saved = JSON.parse(
      globalThis.localStorage?.getItem("samtm-institute-avatar") || "{}",
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
  try {
    globalThis.localStorage?.setItem(
      "samtm-institute-avatar",
      JSON.stringify(value),
    );
  } catch {
    // Brauzer xotirasi yopiq bo‘lsa joriy sessiyadagi sozlama ishlaydi.
  }
}

function BackButton({ onClick, label = "Ortga" }) {
  return (
    <button type="button" className="inst-back" onClick={onClick}>
      <ArrowLeft size={17} /> {label}
    </button>
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
      className={`inst-action ${secondary ? "secondary" : ""} ${
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

function LoadingBlock({ text = "Yuklanmoqda..." }) {
  return (
    <div className="inst-loading" role="status">
      <Loader2 size={24} className="animate-spin" />
      <span>{text}</span>
    </div>
  );
}

function ErrorNotice({ error, onRetry }) {
  if (!error) return null;
  return (
    <div className="inst-error" role="alert">
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
    <div className={`inst-info ${tone}`}>
      <ShieldCheck size={18} />
      <span>{children}</span>
    </div>
  );
}

function EmptyState({ title, text, icon: Icon = Search }) {
  return (
    <div className="inst-empty">
      <Icon size={27} />
      <b>{title}</b>
      <p>{text}</p>
    </div>
  );
}

function StatusPill({ status }) {
  if (!status) return null;
  return (
    <span className={`inst-status ${status}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function Field({ label, hint, children, wide = false, aiField }) {
  return (
    <label
      className={`inst-field ${wide ? "wide" : ""}`}
      data-ai-field={aiField || undefined}
    >
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("uz-UZ");
}

function formatMoney(value, currency = "UZS") {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(number);
}

function itemId(item) {
  return (
    item?.id ??
    item?.context_id ??
    item?.assignment_id ??
    item?.enrollment_id ??
    item?.contract_id
  );
}

function itemName(item) {
  return (
    item?.name ||
    item?.title ||
    item?.code ||
    item?.full_name ||
    item?.student_name ||
    item?.course_title ||
    `#${itemId(item)}`
  );
}

function usePagedResource({
  apiBase,
  token,
  contextId,
  path,
  query,
  enabled = true,
  key = itemId,
}) {
  const [items, setItems] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [capped, setCapped] = useState(false);
  const generationRef = useRef(0);
  const controllerRef = useRef(null);
  const loadingRef = useRef(false);
  const seenCursorsRef = useRef(new Set());
  const queryKey = JSON.stringify(query || {});

  const load = useCallback(
    async (afterId = null, generation = generationRef.current) => {
      if (!enabled || loadingRef.current) return;
      loadingRef.current = true;
      setBusy(true);
      setError("");
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      try {
        const data = await instituteApi(path, {
          apiBase,
          token,
          contextId,
          query: pageQuery({ ...(query || {}), afterId, limit: 100 }),
          signal: controller.signal,
        });
        if (generation !== generationRef.current) return;
        const page = unwrapItems(data);
        setItems((current) =>
          afterId ? mergePage(current, page.items, key) : page.items,
        );
        const cursorKey =
          page.nextCursor == null ? null : String(page.nextCursor);
        const advanced =
          cursorKey != null &&
          cursorKey !== String(afterId ?? "") &&
          !seenCursorsRef.current.has(cursorKey);
        if (page.hasMore && !advanced) {
          setNextCursor(null);
          setHasMore(false);
          setCapped(true);
          setError(
            "Server keyingi sahifa cursorini takrorladi. Takroriy so‘rov xavfsiz to‘xtatildi.",
          );
        } else {
          if (cursorKey != null) seenCursorsRef.current.add(cursorKey);
          setNextCursor(page.nextCursor);
          setHasMore(page.hasMore);
          setCapped(false);
        }
      } catch (requestError) {
        if (requestError?.name !== "AbortError" && generation === generationRef.current) {
          setError(requestError.message);
        }
      } finally {
        if (generation === generationRef.current) {
          loadingRef.current = false;
          setBusy(false);
        }
      }
    },
    [apiBase, contextId, enabled, key, path, queryKey, token],
  );

  useEffect(() => {
    generationRef.current += 1;
    const generation = generationRef.current;
    controllerRef.current?.abort();
    loadingRef.current = false;
    seenCursorsRef.current = new Set();
    setItems([]);
    setNextCursor(null);
    setHasMore(false);
    setCapped(false);
    if (enabled) load(null, generation);
    return () => controllerRef.current?.abort();
  }, [load, enabled]);

  const reload = () => {
    generationRef.current += 1;
    const generation = generationRef.current;
    controllerRef.current?.abort();
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

function LoadMore({ resource, label = "Yana 100 ta ko‘rsatish" }) {
  return (
    <>
      {resource.capped && (
        <div className="inst-truncation">
          Sahifalash xavfsiz to‘xtatildi. Qidiruv yoki filtrdan foydalaning.
        </div>
      )}
      {resource.hasMore && (
        <ActionButton secondary busy={resource.busy} onClick={resource.loadMore}>
          {label}
        </ActionButton>
      )}
    </>
  );
}

function SelectorPagination({ resources = [] }) {
  const pending = resources.filter(([, resource]) => resource?.hasMore);
  if (!pending.length) return null;
  return (
    <div className="inst-row-actions">
      {pending.map(([label, resource]) => (
        <ActionButton
          key={label}
          secondary
          busy={resource.busy}
          onClick={resource.loadMore}
        >
          {label}: yana 100 ta
        </ActionButton>
      ))}
    </div>
  );
}

function ResourceList({ resource, emptyTitle, emptyText, renderMeta, actions }) {
  return (
    <>
      <ErrorNotice error={resource.error} onRetry={resource.reload} />
      {resource.busy && resource.items.length === 0 ? (
        <LoadingBlock />
      ) : resource.items.length === 0 ? (
        <EmptyState title={emptyTitle} text={emptyText} />
      ) : (
        <div className="inst-list">
          {resource.items.map((item) => (
            <article key={String(itemId(item))}>
              <span className="inst-list-icon">
                <GraduationCap size={18} />
              </span>
              <div>
                <h3>{itemName(item)}</h3>
                <p>{renderMeta?.(item) || item.description || ""}</p>
              </div>
              <StatusPill status={item.status || item.verification_status} />
              {actions?.(item)}
            </article>
          ))}
        </div>
      )}
      <LoadMore resource={resource} />
    </>
  );
}

function askHuman(message) {
  return globalThis.confirm?.(message) === true;
}

export default function InstituteWorkspace({
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
  const [meta, setMeta] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceCursor, setWorkspaceCursor] = useState(null);
  const [workspaceHasMore, setWorkspaceHasMore] = useState(false);
  const [workspaceBusy, setWorkspaceBusy] = useState(false);
  const [verifications, setVerifications] = useState([]);
  const [verificationCursor, setVerificationCursor] = useState(null);
  const [verificationHasMore, setVerificationHasMore] = useState(false);
  const [verificationBusy, setVerificationBusy] = useState(false);
  const [screen, setScreen] = useState("home");
  const [selected, setSelected] = useState(null);
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
        instituteApi(instituteRoutes.workspaces, {
          apiBase,
          token,
          query: pageQuery({ limit: 100 }),
        }),
        instituteApi(instituteRoutes.meta, { apiBase, token }),
      ]);
      const workspacePage = unwrapItems(workspaceData);
      setWorkspaces(workspacePage.items);
      setWorkspaceCursor(workspacePage.nextCursor);
      setWorkspaceHasMore(workspacePage.hasMore);
      setMeta(metaData);
      const isSystemAdmin =
        metaData?.is_system_admin === true ||
        workspacePage.items.some((item) =>
          (item.roles || []).includes("system_admin"),
        );
      if (isSystemAdmin) {
        const pendingData = await instituteApi(
          instituteRoutes.adminVerifications,
          {
            apiBase,
            token,
            query: pageQuery({ status: "pending", limit: 100 }),
          },
        );
        const pending = unwrapItems(pendingData);
        setVerifications(pending.items);
        setVerificationCursor(pending.nextCursor);
        setVerificationHasMore(pending.hasMore);
      } else {
        setVerifications([]);
        setVerificationCursor(null);
        setVerificationHasMore(false);
      }
      const wantedId =
        preferredContextId ||
        initialWorkspace?.context_id ||
        initialWorkspace?.muassasa_id;
      const wanted = workspacePage.items.find(
        (item) =>
          Number(item.context_id) === Number(wantedId) ||
          Number(item.legacy_university_id) === Number(wantedId),
      );
      if (
        wanted &&
        (wanted.onboarding_status || "active") === "active" &&
        !["pending", "rejected"].includes(wanted.verification_status)
      ) {
        setSelected(wanted);
        setScreen("dashboard");
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
    if (!workspaceHasMore || !workspaceCursor || workspaceBusy) return;
    setWorkspaceBusy(true);
    setError("");
    try {
      const data = await instituteApi(instituteRoutes.workspaces, {
        apiBase,
        token,
        query: pageQuery({ afterId: workspaceCursor, limit: 100 }),
      });
      const page = unwrapItems(data);
      if (
        page.hasMore &&
        String(page.nextCursor) === String(workspaceCursor)
      ) {
        throw new Error("Institutlar cursorida takrorlanish aniqlandi.");
      }
      setWorkspaces((current) =>
        mergePage(current, page.items, (item) => item.context_id),
      );
      setWorkspaceCursor(page.nextCursor);
      setWorkspaceHasMore(page.hasMore);
    } catch (requestError) {
      setError(requestError.message);
      setWorkspaceHasMore(false);
    } finally {
      setWorkspaceBusy(false);
    }
  };

  const loadMoreVerifications = async () => {
    if (!verificationHasMore || !verificationCursor || verificationBusy) return;
    setVerificationBusy(true);
    setError("");
    try {
      const data = await instituteApi(instituteRoutes.adminVerifications, {
        apiBase,
        token,
        query: pageQuery({
          afterId: verificationCursor,
          status: "pending",
          limit: 100,
        }),
      });
      const page = unwrapItems(data);
      if (
        page.hasMore &&
        String(page.nextCursor) === String(verificationCursor)
      ) {
        throw new Error("Tasdiqlash arizalari cursorida takrorlanish aniqlandi.");
      }
      setVerifications((current) =>
        mergePage(current, page.items, (item) => item.context_id),
      );
      setVerificationCursor(page.nextCursor);
      setVerificationHasMore(page.hasMore);
    } catch (requestError) {
      setError(requestError.message);
      setVerificationHasMore(false);
    } finally {
      setVerificationBusy(false);
    }
  };

  const decideVerification = async (contextId, decision) => {
    const label = decision === "verified" ? "tasdiqlash" : "rad etish";
    if (
      !askHuman(
        `Hujjat va vakolatni platformadan tashqarida tekshirdingizmi? Arizani ${label}ni tasdiqlang.`,
      )
    ) {
      return;
    }
    setVerificationBusy(true);
    setError("");
    try {
      await instituteApi(
        instituteRoutes.adminVerificationDecision(contextId),
        {
          apiBase,
          token,
          method: "POST",
          allowed: true,
          body: {
            decision,
            note:
              decision === "verified"
                ? "Tizim administratori vakolat va hujjatni tekshirdi."
                : "Tizim administratori tekshiruvdan so‘ng rad etdi.",
            confirmation: true,
          },
        },
      );
      await load();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setVerificationBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="inst-shell">
        <BackButton onClick={onBack} />
        <LoadingBlock text="Institut ish maydoni yuklanmoqda..." />
      </div>
    );
  }

  if (screen === "create" && canCreateInstitution) {
    return (
      <InstituteOnboarding
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
      <InstituteDashboard
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
    <div className="inst-shell">
      <BackButton onClick={onBack} label="Asosiy platforma" />
      <header className="inst-hero">
        <div>
          <span className="inst-eyebrow">INSTITUT / UNIVERSITET</span>
          <h1>Akademik boshqaruv — rahbariyatdan talabaga qadar</h1>
          <p>
            O‘quv reja, kredit, jadval, davomat, baho, transkript va kontrakt
            har bir rolga mos, xavfsiz ish maydonida boshqariladi.
          </p>
        </div>
        <span className="inst-hero-icon">
          <GraduationCap size={44} />
        </span>
      </header>
      <ErrorNotice error={error} onRetry={load} />

      {canCreateInstitution && <section className="inst-start-grid">
        <button
          type="button"
          className="inst-start-card primary"
          onClick={() => setScreen("create")}
        >
          <span><Plus size={23} /></span>
          <b>Yangi institut ochish</b>
          <p>AI avatar bilan bosqichma-bosqich sozlang</p>
          <ChevronRight size={18} />
        </button>
      </section>}

      {assignedOnly && workspaces.length === 0 && (
        <InfoNotice>
          <b>Institut ish joyi ulanmagan</b>
          <p>Yangi OTMni faqat Administrator markazi ochadi. Rektor yoki registrator sizga vakolat bergach, shu yerda o‘zingizga tegishli akademik ish maydoni ochiladi.</p>
        </InfoNotice>
      )}

      {verifications.length > 0 && (
        <section className="inst-section">
          <div className="inst-section-head">
            <div>
              <span className="inst-eyebrow">TIZIM TEKSHIRUVI</span>
              <h2>Davlat OTM arizalari</h2>
            </div>
          </div>
          <InfoNotice tone="warning">
            Qaror faqat haqiqiy hujjat va vakolat tekshirilgandan keyin inson
            tomonidan beriladi.
          </InfoNotice>
          <div className="inst-list">
            {verifications.map((item) => (
              <article key={item.context_id}>
                <span className="inst-list-icon"><ShieldCheck size={18} /></span>
                <div>
                  <h3>{item.name}</h3>
                  <p>{[item.region, item.district].filter(Boolean).join(", ")}</p>
                </div>
                <div className="inst-row-actions">
                  <ActionButton
                    busy={verificationBusy}
                    onClick={() => decideVerification(item.context_id, "verified")}
                  >
                    Tekshirdim — tasdiqlash
                  </ActionButton>
                  <ActionButton
                    danger
                    busy={verificationBusy}
                    onClick={() => decideVerification(item.context_id, "rejected")}
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
              busy={verificationBusy}
              onClick={loadMoreVerifications}
            >
              Yana 100 ta arizani ko‘rsatish
            </ActionButton>
          )}
        </section>
      )}

      <section className="inst-section">
        <div className="inst-section-head">
          <div>
            <span className="inst-eyebrow">ISH MAYDONLARIM</span>
            <h2>Ulangan institutlar</h2>
          </div>
        </div>
        {workspaces.length === 0 ? (
          <EmptyState
            icon={Building2}
            title={assignedOnly ? "Ulangan institut yo‘q" : "Hali institut yo‘q"}
            text={assignedOnly ? "Institut rahbari yoki registrator vakolat berishi kerak." : "Administrator markazidan yangi ish maydoni yarating."}
          />
        ) : (
          <div className="inst-workspace-grid">
            {workspaces.map((workspace) => {
              const blocked =
                (workspace.onboarding_status || "active") !== "active" ||
                ["pending", "rejected"].includes(workspace.verification_status);
              return (
                <button
                  type="button"
                  key={workspace.context_id}
                  disabled={blocked}
                  onClick={() => {
                    setSelected(workspace);
                    setScreen("dashboard");
                  }}
                >
                  <span className="inst-workspace-logo"><GraduationCap size={21} /></span>
                  <span>
                    <b>{workspace.name}</b>
                    <small>
                      {INSTITUTE_KINDS.find(
                        (item) => item.value === workspace.institution_type,
                      )?.label || "Institut"}
                    </small>
                    <em>
                      {(workspace.roles || [])
                        .map((role) => INSTITUTE_ROLES[role] || role)
                        .join(", ")}
                    </em>
                  </span>
                  <StatusPill
                    status={
                      blocked
                        ? workspace.verification_status || workspace.onboarding_status
                        : "active"
                    }
                  />
                </button>
              );
            })}
          </div>
        )}
        {workspaceHasMore && (
          <ActionButton secondary busy={workspaceBusy} onClick={loadMoreWorkspaces}>
            Yana 100 ta institutni ko‘rsatish
          </ActionButton>
        )}
      </section>
    </div>
  );
}

function InstituteOnboarding({
  apiBase,
  token,
  preferences,
  onPreferences,
  onBack,
  onCreated,
}) {
  const [step, setStep] = useState("identity");
  const [furthest, setFurthest] = useState(0);
  const [draft, setDraft] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [identity, setIdentity] = useState({
    relationship: "rector",
    ownership_type: "public",
    institution_type: "institute",
    setup_mode: "guided",
    grading_system: "credit_modular",
    name: "",
    region: "",
    district: "",
  });
  const [academicPolicy, setAcademicPolicy] = useState({
    grading_system: "credit_modular",
    term_system: "semester",
    credit_hours: "30",
    gpa_threshold: "2.4",
    version_label: currentAcademicYear(),
  });
  const [structure, setStructure] = useState({
    campus_code: "MAIN",
    campus_name: "Asosiy kampus",
    campus_address: "",
    faculty_code: "",
    faculty_name: "",
    department_code: "",
    department_name: "",
  });
  const [program, setProgram] = useState({
    code: "",
    name: "",
    degree_level: "bachelor",
    study_form: "full_time",
    language: "uz",
    duration_terms: "8",
    target_credits: "240",
  });
  const [calendar, setCalendar] = useState(() => {
    const year = currentAcademicYear().split("-").map(Number);
    return {
      academic_year_code: currentAcademicYear(),
      starts_on: `${year[0]}-09-01`,
      ends_on: `${year[1]}-06-30`,
      first_term_name: "1-semestr",
      first_term_starts_on: `${year[0]}-09-01`,
      first_term_ends_on: `${year[0]}-12-31`,
      registration_opens_at: `${year[0]}-08-20T09:00`,
      registration_closes_at: `${year[0]}-09-07T18:00`,
      change_deadline: `${year[0]}-09-14T18:00`,
    };
  });
  const [team, setTeam] = useState({
    planned_roles: [
      "rector",
      "registrar",
      "dean",
      "department_head",
      "lecturer",
      "advisor",
      "accountant",
    ],
  });
  const [finance, setFinance] = useState({
    contracts_enabled: true,
    default_currency: "UZS",
    installment_count: "4",
    external_integration: "none",
  });

  const draftId = draft?.id || draft?.draft_id;
  const draftVersion = draft?.version ?? draft?.draft_version ?? 1;
  const activeIndex = ONBOARDING_STEPS.findIndex((item) => item.key === step);

  useEffect(() => {
    // DraftStart'dagi institut turi va munosabat foydalanuvchi birinchi
    // bosqichni tasdiqlagandan keyingina yuboriladi.
    setBusy(false);
  }, []);

  const payloadForStep = (key) => {
    if (key === "identity") return { identity };
    if (key === "academic_policy") {
      return {
        grading_system: academicPolicy.grading_system,
        academic_policy: {
          ...academicPolicy,
          hours_per_credit: Number(academicPolicy.credit_hours),
          promotion_gpa: Number(academicPolicy.gpa_threshold),
        },
      };
    }
    if (key === "structure") {
      return {
        structure,
        campus: {
          code: structure.campus_code,
          name: structure.campus_name,
          address: structure.campus_address || null,
        },
      };
    }
    if (key === "program") return { program };
    if (key === "calendar") return { calendar };
    if (key === "team") return { team };
    if (key === "finance") return { finance };
    return {
      review: {
        acknowledged: true,
        review_version: draftVersion,
      },
    };
  };

  const validateStep = (key) => {
    if (key === "identity") {
      if (!identity.name.trim()) return "OTM nomini kiriting.";
      if (!identity.region) return "Viloyatni tanlang.";
    }
    if (key === "academic_policy") {
      if (
        academicPolicy.grading_system === "credit_modular" &&
        (!(Number(academicPolicy.credit_hours) > 0) ||
          !(Number(academicPolicy.gpa_threshold) > 0))
      ) {
        return "Kredit soati va GPA chegarasini OTM hujjatiga ko‘ra kiriting.";
      }
    }
    if (key === "structure") {
      if (!structure.campus_code.trim() || !structure.campus_name.trim()) {
        return "Kampus kodi va nomini kiriting.";
      }
      if (!structure.faculty_code.trim() || !structure.faculty_name.trim()) {
        return "Birinchi fakultet kodi va nomini kiriting.";
      }
      if (
        !structure.department_code.trim() ||
        !structure.department_name.trim()
      ) {
        return "Birinchi kafedra kodi va nomini kiriting.";
      }
    }
    if (key === "program") {
      if (!program.code.trim() || !program.name.trim()) {
        return "Ta’lim dasturi kodi va nomini kiriting.";
      }
      if (
        !(Number(program.duration_terms) > 0) ||
        !(Number(program.target_credits) > 0)
      ) {
        return "Davrlar va maqsad kreditini tasdiqlangan reja bo‘yicha kiriting.";
      }
    }
    if (key === "calendar") {
      if (!calendar.starts_on || !calendar.ends_on) {
        return "O‘quv yili sanalarini kiriting.";
      }
      if (calendar.starts_on >= calendar.ends_on) {
        return "O‘quv yili tugash sanasi boshlanishidan keyin bo‘lsin.";
      }
    }
    if (key === "finance" && finance.contracts_enabled) {
      if (!(Number(finance.installment_count) > 0)) {
        return "Kontrakt bo‘lib to‘lash sonini kiriting.";
      }
    }
    return "";
  };

  const saveCurrent = async () => {
    const validationError = validateStep(step);
    if (validationError) throw new Error(validationError);
    let workingDraft = draft;
    let workingId = draftId;
    let workingVersion = draftVersion;
    if (!workingId) {
      const started = await instituteApi(instituteRoutes.onboardingDrafts, {
        apiBase,
        token,
        method: "POST",
        allowed: true,
        idempotencyKey: makeIdempotencyKey("institute-onboarding", [
          identity.relationship,
          identity.ownership_type,
          identity.institution_type,
        ]),
        body: buildDraftStartPayload(identity),
      });
      workingDraft = started.item || started.draft || started;
      workingId = workingDraft.id || workingDraft.draft_id;
      workingVersion = workingDraft.version ?? workingDraft.draft_version ?? 1;
      if (!workingId) throw new Error("Server qoralama raqamini qaytarmadi.");
      setDraft(workingDraft);
    }
    const data = await instituteApi(instituteRoutes.onboardingDraft(workingId), {
      apiBase,
      token,
      method: "PATCH",
      allowed: true,
      body: buildDraftPatchPayload(step, payloadForStep(step), workingVersion),
    });
    const nextDraft = data.item || data.draft || data;
    const mergedDraft = { ...workingDraft, ...nextDraft };
    setDraft(mergedDraft);
    return mergedDraft;
  };

  const move = async (direction) => {
    if (busy) return;
    const nextIndex = Math.min(
      Math.max(activeIndex + direction, 0),
      ONBOARDING_STEPS.length - 1,
    );
    if (direction < 0) {
      setStep(ONBOARDING_STEPS[nextIndex].key);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const savedDraft = await saveCurrent();
      const nextKey = ONBOARDING_STEPS[nextIndex].key;
      setFurthest((current) => Math.max(current, nextIndex));
      setStep(nextKey);
      if (nextKey === "review") {
        const data = await instituteApi(
          instituteRoutes.onboardingPreview(savedDraft.id || savedDraft.draft_id),
          { apiBase, token },
        );
        setPreview({ ...(data.item || {}), ...data });
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const commit = async () => {
    if (!draftId || busy) return;
    if (
      !askHuman(
        "Kiritilgan ma’lumotlarni tekshirdingizmi? Institut ish maydoni yaratiladi, ammo akademik reja va jadval hali alohida e’lon qilinmaydi.",
      )
    ) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      const savedDraft = await saveCurrent();
      const savedVersion =
        savedDraft.version ?? savedDraft.draft_version ?? draftVersion;
      const data = await instituteApi(
        instituteRoutes.onboardingCommit(draftId),
        {
          apiBase,
          token,
          method: "POST",
          allowed: true,
          idempotencyKey: makeIdempotencyKey("institute-commit", [draftId]),
          body: {
            expected_version: savedVersion,
            confirmation: true,
          },
        },
      );
      onCreated(data.context_id || data.institute?.context_id || data.id);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const askAssistant = async (question) => {
    const lower = question.toLocaleLowerCase("uz");
    if (/(baho|chetlashtir|tikla|to['‘’]?lov|rol ber|buyruq)/i.test(lower)) {
      return {
        message:
          "Men baho, talaba maqomi, pul, rol yoki buyruqni o‘zgartirmayman. Bu amallar hujjat va vakolatli inson tasdig‘ini talab qiladi.",
      };
    }
    if (step === "academic_policy" && /gpa|kredit/i.test(lower)) {
      return {
        message:
          "GPA chegarasi va bir kreditga to‘g‘ri keladigan soat OTM hamda dastur hujjatiga bog‘liq. Ko‘rsatilgan qiymatlarni hujjatingiz bilan solishtirib tahrirlang.",
      };
    }
    if (step === "finance" && /hemis|billing|kontrakt/i.test(lower)) {
      return {
        message:
          "Hozir bu ichki hisob moduli. HEMIS, kontrakt.edu.uz yoki Billing nomini faqat haqiqiy texnik integratsiya o‘rnatilgach ‘ulangan’ deb ko‘rsatish mumkin.",
      };
    }
    return {
      message:
        ONBOARDING_STEPS.find((item) => item.key === step)?.message ||
        "Shu bosqichdagi maydonlarni tushuntirib beraman.",
    };
  };

  const roleOptions = [
    "rector",
    "registrar",
    "dean",
    "department_head",
    "lecturer",
    "advisor",
    "accountant",
  ];

  return (
    <div className="inst-shell inst-with-avatar">
      <div className="inst-page-head">
        <BackButton onClick={onBack} label="Institutlar" />
        <div>
          <span className="inst-eyebrow">YANGI ISH MAYDONI</span>
          <h1>Institutni bosqichma-bosqich sozlash</h1>
          <p>Har qadam serverdagi qoralamaga saqlanadi; nashr va tasdiq alohida.</p>
        </div>
      </div>
      <ErrorNotice error={error} />
      <div className="inst-stepper" aria-label="Institut yaratish bosqichlari">
        {ONBOARDING_STEPS.map((item, index) => (
          <button
            key={item.key}
            type="button"
            disabled={index > furthest}
            className={step === item.key ? "active" : index < activeIndex ? "done" : ""}
            onClick={() => index <= furthest && setStep(item.key)}
          >
            <span>{index + 1}</span>
            {item.label}
          </button>
        ))}
      </div>

      {busy && !draft ? (
        <LoadingBlock text="Xavfsiz qoralama yaratilmoqda..." />
      ) : (
        <>
          {step === "identity" && (
            <section className="inst-form-card" data-ai-anchor="institute-identity">
              <h2>OTMning asosiy ma’lumoti</h2>
              <div className="inst-form-grid">
                <Field label="Sizning munosabatingiz">
                  <select
                    value={identity.relationship}
                    onChange={(event) =>
                      setIdentity((current) => ({ ...current, relationship: event.target.value }))
                    }
                  >
                    {[
                      ["owner", "Mulkdor"],
                      ["founder", "Ta’sischi"],
                      ["rector", "Rektor"],
                      ["administrator", "Administrator"],
                    ].map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </Field>
                <Field label="OTM turi">
                  <select
                    value={identity.institution_type}
                    onChange={(event) =>
                      setIdentity((current) => ({ ...current, institution_type: event.target.value }))
                    }
                  >
                    {INSTITUTE_KINDS.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Mulkchilik shakli">
                  <select
                    value={identity.ownership_type}
                    onChange={(event) =>
                      setIdentity((current) => ({ ...current, ownership_type: event.target.value }))
                    }
                  >
                    {OWNERSHIP_TYPES.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Institut nomi" wide>
                  <input
                    value={identity.name}
                    maxLength={180}
                    placeholder="Masalan: Samarqand pedagogika instituti"
                    onChange={(event) =>
                      setIdentity((current) => ({ ...current, name: event.target.value }))
                    }
                  />
                </Field>
                <Field label="Viloyat">
                  <select
                    value={identity.region}
                    onChange={(event) =>
                      setIdentity((current) => ({
                        ...current,
                        region: event.target.value,
                        district: "",
                      }))
                    }
                  >
                    <option value="">Tanlang</option>
                    {VILOYATLAR.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </Field>
                <Field label="Tuman / shahar">
                  <select
                    value={identity.district}
                    disabled={!identity.region}
                    onChange={(event) =>
                      setIdentity((current) => ({ ...current, district: event.target.value }))
                    }
                  >
                    <option value="">Tanlang</option>
                    {(HUDUDLAR[identity.region] || []).map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </section>
          )}

          {step === "academic_policy" && (
            <section className="inst-form-card" data-ai-anchor="institute-academic-policy">
              <h2>Akademik siyosat versiyasi</h2>
              <InfoNotice tone="warning">
                60 kredit, 30 soat yoki 2.4 GPA barcha OTMga avtomatik qo‘llanmaydi.
                Quyidagi qiymatlarni OTMning tasdiqlangan hujjati bilan tekshiring.
              </InfoNotice>
              <div className="inst-choice-grid">
                {GRADING_SYSTEMS.map((item) => (
                  <button
                    type="button"
                    key={item.value}
                    disabled={item.value === "custom"}
                    className={academicPolicy.grading_system === item.value ? "selected" : ""}
                    onClick={() =>
                      setAcademicPolicy((current) => ({ ...current, grading_system: item.value }))
                    }
                  >
                    <b>{item.label}</b><small>{item.hint}</small>
                  </button>
                ))}
              </div>
              <div className="inst-form-grid">
                <Field label="Davr tizimi">
                  <select
                    value={academicPolicy.term_system}
                    onChange={(event) =>
                      setAcademicPolicy((current) => ({ ...current, term_system: event.target.value }))
                    }
                  >
                    {TERM_SYSTEMS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </Field>
                <Field label="Siyosat versiyasi">
                  <input
                    value={academicPolicy.version_label}
                    onChange={(event) =>
                      setAcademicPolicy((current) => ({ ...current, version_label: event.target.value }))
                    }
                  />
                </Field>
                {academicPolicy.grading_system === "credit_modular" && (
                  <>
                    <Field label="1 kredit uchun akademik soat" hint="OTM hujjatiga ko‘ra o‘zgartiring">
                      <input
                        type="number"
                        min="1"
                        step="0.5"
                        value={academicPolicy.credit_hours}
                        onChange={(event) =>
                          setAcademicPolicy((current) => ({ ...current, credit_hours: event.target.value }))
                        }
                      />
                    </Field>
                    <Field label="Kursdan kursga GPA chegarasi" hint="Faqat ogohlantirish va hisob uchun">
                      <input
                        type="number"
                        min="0"
                        max="4"
                        step="0.1"
                        value={academicPolicy.gpa_threshold}
                        onChange={(event) =>
                          setAcademicPolicy((current) => ({ ...current, gpa_threshold: event.target.value }))
                        }
                      />
                    </Field>
                  </>
                )}
              </div>
            </section>
          )}

          {step === "structure" && (
            <section className="inst-form-card" data-ai-anchor="institute-structure">
              <h2>Birinchi kampus, fakultet va kafedra</h2>
              <div className="inst-form-grid">
                {[
                  ["campus_code", "Kampus kodi", "MAIN"],
                  ["campus_name", "Kampus nomi", "Asosiy kampus"],
                  ["campus_address", "Manzil", "Ko‘cha va bino"],
                  ["faculty_code", "Fakultet kodi", "PED"],
                  ["faculty_name", "Fakultet nomi", "Pedagogika fakulteti"],
                  ["department_code", "Kafedra kodi", "BT"],
                  ["department_name", "Kafedra nomi", "Boshlang‘ich ta’lim kafedrasi"],
                ].map(([key, label, placeholder]) => (
                  <Field key={key} label={label} wide={key === "campus_address"}>
                    <input
                      value={structure[key]}
                      placeholder={placeholder}
                      onChange={(event) =>
                        setStructure((current) => ({ ...current, [key]: event.target.value }))
                      }
                    />
                  </Field>
                ))}
              </div>
            </section>
          )}

          {step === "program" && (
            <section className="inst-form-card" data-ai-anchor="institute-program">
              <h2>Birinchi ta’lim dasturi</h2>
              <div className="inst-form-grid">
                <Field label="Dastur kodi">
                  <input value={program.code} placeholder="60110500" onChange={(event) => setProgram((current) => ({ ...current, code: event.target.value }))} />
                </Field>
                <Field label="Dastur nomi" wide>
                  <input value={program.name} placeholder="Boshlang‘ich ta’lim" onChange={(event) => setProgram((current) => ({ ...current, name: event.target.value }))} />
                </Field>
                <Field label="Daraja">
                  <select value={program.degree_level} onChange={(event) => setProgram((current) => ({ ...current, degree_level: event.target.value }))}>
                    {DEGREE_LEVELS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </Field>
                <Field label="Ta’lim shakli">
                  <select value={program.study_form} onChange={(event) => setProgram((current) => ({ ...current, study_form: event.target.value }))}>
                    {STUDY_FORMS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </Field>
                <Field label="Ta’lim tili">
                  <select value={program.language} onChange={(event) => setProgram((current) => ({ ...current, language: event.target.value }))}>
                    <option value="uz">O‘zbek</option><option value="ru">Rus</option><option value="en">Ingliz</option><option value="other">Boshqa</option>
                  </select>
                </Field>
                <Field label="Davrlar soni" hint="Masalan, 8 semestr">
                  <input type="number" min="1" value={program.duration_terms} onChange={(event) => setProgram((current) => ({ ...current, duration_terms: event.target.value }))} />
                </Field>
                <Field label="Maqsad kredit" hint="Tasdiqlangan o‘quv reja bo‘yicha">
                  <input type="number" min="1" value={program.target_credits} onChange={(event) => setProgram((current) => ({ ...current, target_credits: event.target.value }))} />
                </Field>
              </div>
            </section>
          )}

          {step === "calendar" && (
            <section className="inst-form-card" data-ai-anchor="institute-calendar">
              <h2>O‘quv yili va ro‘yxatdan o‘tish oynasi</h2>
              <div className="inst-form-grid">
                {[
                  ["academic_year_code", "O‘quv yili", "text"],
                  ["starts_on", "O‘quv yili boshlanishi", "date"],
                  ["ends_on", "O‘quv yili tugashi", "date"],
                  ["first_term_name", "Birinchi davr nomi", "text"],
                  ["first_term_starts_on", "Davr boshlanishi", "date"],
                  ["first_term_ends_on", "Davr tugashi", "date"],
                  ["registration_opens_at", "Fan tanlash ochiladi", "datetime-local"],
                  ["registration_closes_at", "Fan tanlash yopiladi", "datetime-local"],
                  ["change_deadline", "Tanlovni o‘zgartirish muddati", "datetime-local"],
                ].map(([key, label, type]) => (
                  <Field key={key} label={label}>
                    <input type={type} value={calendar[key]} onChange={(event) => setCalendar((current) => ({ ...current, [key]: event.target.value }))} />
                  </Field>
                ))}
              </div>
              <InfoNotice>
                Majburiy va tanlov fanlari ro‘yxatdan o‘tish oynasida tanlanadi;
                tyutor maslahat beradi, yakuniy tanlov talabaga ko‘rsatiladi.
              </InfoNotice>
            </section>
          )}

          {step === "team" && (
            <section className="inst-form-card" data-ai-anchor="institute-team">
              <h2>Rejalashtirilgan rollar</h2>
              <p className="inst-muted">Bu bosqich faqat rollar rejasini saqlaydi. Haqiqiy foydalanuvchiga vakolat institut ochilgach, alohida tasdiq bilan beriladi.</p>
              <div className="inst-check-grid">
                {roleOptions.map((role) => (
                  <label key={role}>
                    <input
                      type="checkbox"
                      checked={team.planned_roles.includes(role)}
                      onChange={() =>
                        setTeam((current) => ({
                          planned_roles: current.planned_roles.includes(role)
                            ? current.planned_roles.filter((item) => item !== role)
                            : [...current.planned_roles, role],
                        }))
                      }
                    />
                    <span>{INSTITUTE_ROLES[role]}</span>
                  </label>
                ))}
              </div>
            </section>
          )}

          {step === "finance" && (
            <section className="inst-form-card" data-ai-anchor="institute-finance">
              <h2>Kontrakt va to‘lov tartibi</h2>
              <label className="inst-toggle">
                <input type="checkbox" checked={finance.contracts_enabled} onChange={(event) => setFinance((current) => ({ ...current, contracts_enabled: event.target.checked }))} />
                <span>Kontrakt moduli ishlatiladi</span>
              </label>
              {finance.contracts_enabled && (
                <div className="inst-form-grid">
                  <Field label="Valyuta"><select value={finance.default_currency} onChange={(event) => setFinance((current) => ({ ...current, default_currency: event.target.value }))}><option value="UZS">UZS</option><option value="USD">USD</option></select></Field>
                  <Field label="Bo‘lib to‘lash soni"><input type="number" min="1" max="24" value={finance.installment_count} onChange={(event) => setFinance((current) => ({ ...current, installment_count: event.target.value }))} /></Field>
                </div>
              )}
              <InfoNotice tone="warning">
                HEMIS, kontrakt.edu.uz va Billing hozir ulanmagan. Bu nomlar faqat
                “kelajakdagi integratsiya” sifatida ko‘rsatiladi.
              </InfoNotice>
            </section>
          )}

          {step === "review" && (
            <section className="inst-form-card" data-ai-anchor="institute-review">
              <h2>Yakuniy tekshiruv</h2>
              {preview?.errors?.length > 0 && (
                <div className="inst-error" role="alert"><div><b>Tuzatish kerak</b>{preview.errors.map((item) => <p key={String(item)}>{String(item)}</p>)}</div></div>
              )}
              {preview?.warnings?.length > 0 && (
                <InfoNotice tone="warning">{preview.warnings.map((item) => String(item)).join(" · ")}</InfoNotice>
              )}
              <div className="inst-review-grid">
                <article><b>OTM</b><p>{identity.name}</p><small>{identity.region} {identity.district}</small></article>
                <article><b>Akademik siyosat</b><p>{GRADING_SYSTEMS.find((item) => item.value === academicPolicy.grading_system)?.label}</p><small>{academicPolicy.version_label}</small></article>
                <article><b>Tuzilma</b><p>{structure.faculty_name}</p><small>{structure.department_name}</small></article>
                <article><b>Dastur</b><p>{program.name}</p><small>{program.duration_terms} davr · {program.target_credits} kredit</small></article>
                <article><b>O‘quv yili</b><p>{calendar.academic_year_code}</p><small>{formatDate(calendar.starts_on)} — {formatDate(calendar.ends_on)}</small></article>
                <article><b>Kontrakt</b><p>{finance.contracts_enabled ? "Ishlatiladi" : "Ishlatilmaydi"}</p><small>Tashqi integratsiya ulanmagan</small></article>
              </div>
              <InfoNotice>
                Davomat chegarasi faqat ogohlantiradi. Talabani chetlashtirish,
                tiklash yoki ko‘chirish avtomatik bajarilmaydi va buyruq talab qiladi.
              </InfoNotice>
            </section>
          )}

          <div className="inst-wizard-actions">
            <ActionButton secondary disabled={activeIndex === 0} onClick={() => move(-1)}>Oldingi</ActionButton>
            {step === "review" ? (
              <ActionButton busy={busy} disabled={preview?.errors?.length > 0} onClick={commit}>
                Tekshirdim — institutni yaratish
              </ActionButton>
            ) : (
              <ActionButton busy={busy} onClick={() => move(1)}>Saqlash va davom etish</ActionButton>
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
        onNavigate={(next) => {
          const index = ONBOARDING_STEPS.findIndex((item) => item.key === next);
          if (index <= furthest) setStep(next);
        }}
        onQuestion={askAssistant}
        onSpeechChange={(speechEnabled) => onPreferences({ speechEnabled })}
        onEnabledChange={(enabled) => onPreferences({ enabled })}
      />
    </div>
  );
}

function InstituteDashboard({
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [assistantSession, setAssistantSession] = useState(null);
  const assistantStarted = useRef(false);
  const history = useRef([]);
  const pendingAssistantAction = useRef(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await instituteApi(instituteRoutes.dashboard, {
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
      !hasPermission(dashboard.permissions, "assistant.use")
    ) {
      return;
    }
    assistantStarted.current = true;
    const roles = dashboard.roles || [];
    const workflowKey = roles.includes("student")
      ? "institute_student_tour"
      : roles.includes("lecturer")
        ? "institute_lecturer_tour"
        : roles.includes("advisor")
          ? "institute_advisor_tour"
          : "institute_management_tour";
    instituteApi(instituteRoutes.assistantSessions, {
      apiBase,
      token,
      contextId: workspace.context_id,
      method: "POST",
      allowed: true,
      body: {
        workflow_key: workflowKey,
        avatar_enabled: true,
        speech_enabled: preferences.speechEnabled,
        avatar_variant: preferences.variant,
      },
    })
      .then((data) => setAssistantSession(data.item || data.session || data))
      .catch(() => {});
  }, [apiBase, dashboard, preferences, token, workspace.context_id]);

  const assistantAction = (actionId, target) => {
    const effectiveAction =
      actionId === "SET_DRAFT_VALUE" && pendingAssistantAction.current
        ? pendingAssistantAction.current
        : actionId;
    if (actionId === "SET_DRAFT_VALUE") pendingAssistantAction.current = null;
    if (!assistantSession?.id || !ASSISTANT_SAFE_ACTIONS.has(effectiveAction)) return;
    instituteApi(instituteRoutes.assistantActions(assistantSession.id), {
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

  if (loading) {
    return (
      <div className="inst-shell"><BackButton onClick={onBack} /><LoadingBlock text="Institut boshqaruvi yuklanmoqda..." /></div>
    );
  }
  if (!dashboard) {
    return (
      <div className="inst-shell"><BackButton onClick={onBack} /><ErrorNotice error={error} onRetry={load} /></div>
    );
  }

  const institute = dashboard.institute || workspace;
  const roles = dashboard.roles || workspace.roles || [];
  const permissions = dashboard.permissions || workspace.permissions || [];
  const normalized = normalizeMenu(dashboard.menus || dashboard.menu, roles);
  const menu = normalized.length
    ? normalized
    : menuForRoles(roles).map((key) => ({ key, label: MENU_META[key]?.[0] || key }));
  const safeSection = menu.some((item) => item.key === section)
    ? section
    : menu[0]?.key || "overview";
  const tour = tourForRoles(roles, menu.map((item) => item.key));
  const capabilities = dashboard.capabilities || {};
  const shared = {
    apiBase,
    token,
    contextId: workspace.context_id,
    permissions,
    roles,
    currentUserId: dashboard.current_user_id,
    capabilities,
    institute,
  };

  const selectSection = (next) => {
    if (!menu.some((item) => item.key === next) || next === safeSection) {
      setMenuOpen(false);
      return;
    }
    history.current = [...history.current.slice(-19), safeSection];
    setSection(next);
    setMenuOpen(false);
    assistantAction("SHOW_MENU", {
      key: next,
      anchor: `institute-menu-${next}`,
    });
  };

  const askAssistant = async (question) => {
    const lower = question.toLocaleLowerCase("uz");
    if (
      /(baho.*(qo['‘’]?y|tasdiq)|to['‘’]?lov.*(qil|yoz)|chetlashtir|tikla|ko['‘’]?chir|rol ber|buyruq|transkript.*chiqar)/i.test(
        lower,
      )
    ) {
      return {
        message:
          "Men baho, to‘lov, talaba maqomi, rol, buyruq yoki rasmiy transkriptni o‘zim tasdiqlamayman. Kerakli bo‘limni ko‘rsataman; yakuniy amal vakolatli inson tasdig‘ida qoladi.",
      };
    }
    if (safeSection === "schedule" && /(vaqt|soat)/i.test(lower)) {
      return {
        message:
          "Jadvaldagi boshlanish vaqtini ko‘rsataman. Men faqat maydonni fokuslayman, jadvalni saqlamayman yoki e’lon qilmayman.",
        action: {
          type: "FOCUS_FIELD",
          section: "schedule",
          field: "starts_at",
        },
        actionLabel: "Vaqt maydonini ko‘rsatish",
      };
    }
    if (safeSection === "curriculum" && /(o['‘’]?quv reja|nom)/i.test(lower)) {
      return {
        message:
          "O‘quv reja nomi maydonini ko‘rsataman. Rejani yaratish yoki nashr qilishni o‘zim bajarmayman.",
        action: {
          type: "FOCUS_FIELD",
          section: "curriculum",
          field: "title",
        },
        actionLabel: "Reja nomini ko‘rsatish",
      };
    }
    return {
      message:
        tour.find((item) => item.key === safeSection)?.message ||
        "Bu bo‘limda faqat rolingiz va server ruxsati doirasidagi ma’lumot ko‘rsatiladi.",
    };
  };

  const applyAssistantSuggestion = (action) => {
    if (
      !action ||
      !["FOCUS_FIELD", "SET_DRAFT_VALUE"].includes(action.type) ||
      action.section !== safeSection ||
      !ASSISTANT_DRAFT_FIELDS[action.section]
    ) {
      return;
    }
    const fields = ASSISTANT_DRAFT_FIELDS[action.section];
    if (action.type === "FOCUS_FIELD" && !fields.has(action.field)) return;
    let safeAction = action;
    if (action.type === "SET_DRAFT_VALUE") {
      const values = Object.fromEntries(
        Object.entries(action.values || {}).filter(([key]) => fields.has(key)),
      );
      if (!Object.keys(values).length) return;
      safeAction = { ...action, values };
    }
    pendingAssistantAction.current = safeAction.type;
    window.dispatchEvent(
      new CustomEvent("samtm:institute-avatar-action", { detail: safeAction }),
    );
    if (safeAction.type === "FOCUS_FIELD") {
      window.setTimeout(() => {
        const field = document.querySelector(
          `[data-ai-field="${safeAction.field}"]`,
        );
        field?.scrollIntoView({ behavior: "smooth", block: "center" });
        field?.querySelector("input, select, textarea, button")?.focus();
      }, 80);
    }
  };

  return (
    <div className="inst-dashboard-shell inst-with-avatar">
      <header className="inst-dashboard-header">
        <button
          type="button"
          className="inst-mobile-menu"
          aria-label="Menyuni ochish"
          aria-expanded={menuOpen}
          aria-controls="institute-navigation"
          onClick={() => setMenuOpen(true)}
        >
          <Menu size={20} />
        </button>
        <BackButton onClick={onBack} label="Institutlarim" />
        <div className="inst-dashboard-brand">
          <span className="inst-workspace-logo"><GraduationCap size={21} /></span>
          <div>
            <h1>{institute.name}</h1>
            <p>{roles.map((role) => INSTITUTE_ROLES[role] || role).join(", ")}</p>
          </div>
        </div>
        <div className="inst-dashboard-tools">
          <StatusPill status={institute.onboarding_status || "active"} />
          <button type="button" onClick={() => onPreferences({ enabled: !preferences.enabled })}>
            AI {preferences.enabled ? "yoqilgan" : "o‘chirilgan"}
          </button>
        </div>
      </header>
      <div className="inst-dashboard-layout">
        {menuOpen && (
          <button
            type="button"
            className="inst-sidebar-overlay"
            aria-label="Menyuni yopish"
            onClick={() => setMenuOpen(false)}
          />
        )}
        <aside id="institute-navigation" className={`inst-sidebar ${menuOpen ? "open" : ""}`}>
          <div className="inst-sidebar-head">
            <b>Institut menyusi</b>
            <button type="button" aria-label="Menyuni yopish" onClick={() => setMenuOpen(false)}><X size={18} /></button>
          </div>
          <nav aria-label="Institut boshqaruv menyusi">
            {menu.map((item) => {
              const [fallbackLabel, Icon] = MENU_META[item.key] || [item.key, LayoutDashboard];
              return (
                <button
                  type="button"
                  key={item.key}
                  data-ai-anchor={`institute-menu-${item.key}`}
                  className={safeSection === item.key ? "active" : ""}
                  onClick={() => selectSection(item.key)}
                >
                  <Icon size={17} />
                  <span>{item.label && item.label !== item.key ? item.label : fallbackLabel}</span>
                </button>
              );
            })}
          </nav>
          <div className="inst-scope-note">
            <ShieldCheck size={16} />
            <span>
              {capabilities.scope?.global
                ? "Butun institut doirasi"
                : "Fakultet/kafedra doirasi"}
            </span>
          </div>
        </aside>
        <main className="inst-dashboard-content">
          <div className="inst-content-toolbar">
            <div>
              <span className="inst-eyebrow">ISH MAYDONI</span>
              <h2>{MENU_META[safeSection]?.[0] || safeSection}</h2>
            </div>
            <button type="button" aria-label="Ma’lumotni yangilash" onClick={load}><RefreshCw size={17} /></button>
          </div>
          <ErrorNotice error={error} onRetry={load} />
          {safeSection === "overview" && <OverviewPanel dashboard={dashboard} onOpen={selectSection} />}
          {safeSection === "structure" && <StructurePanel {...shared} />}
          {safeSection === "curriculum" && <CurriculumPanel {...shared} />}
          {safeSection === "schedule" && <SchedulePanel {...shared} />}
          {safeSection === "attendance" && <AttendancePanel {...shared} />}
          {safeSection === "gradebook" && <GradebookPanel {...shared} />}
          {safeSection === "exams" && <ExamsPanel {...shared} />}
          {safeSection === "students" && <StudentsPanel {...shared} />}
          {safeSection === "transcripts" && <TranscriptsPanel {...shared} />}
          {safeSection === "finance" && <FinancePanel {...shared} />}
          {safeSection === "analytics" && <AnalyticsPanel {...shared} />}
          {safeSection === "staff" && <StaffPanel {...shared} />}
          {safeSection === "settings" && (
            <SettingsPanel
              {...shared}
              institute={institute}
              preferences={preferences}
              onPreferences={onPreferences}
            />
          )}
          {onLegacy && (
            <button type="button" className="inst-legacy" onClick={onLegacy}>
              Eski kurator guruhlari oynasini ochish
            </button>
          )}
        </main>
      </div>
      {hasPermission(permissions, "assistant.use") && (
        <GuidedAvatar
          enabled={preferences.enabled}
          variant={preferences.variant}
          speechEnabled={preferences.speechEnabled}
          apiBase={apiBase}
          steps={tour}
          activeKey={safeSection}
          onNavigate={selectSection}
          onUndo={() => {
            const previous = history.current.pop();
            if (previous) setSection(previous);
          }}
          onQuestion={askAssistant}
          onApplySuggestion={applyAssistantSuggestion}
          onAction={assistantAction}
          onSpeechChange={(speechEnabled) => onPreferences({ speechEnabled })}
          onEnabledChange={(enabled) => onPreferences({ enabled })}
        />
      )}
    </div>
  );
}

function OverviewPanel({ dashboard, onOpen }) {
  const counts = dashboard.counts || {};
  const metrics = [
    ["structure", "Fakultetlar", counts.faculties, Building2],
    ["structure", "Kafedralar", counts.departments, Building2],
    ["curriculum", "Ta’lim dasturlari", counts.programs, BookOpen],
    ["students", "Faol talabalar", counts.active_students ?? counts.students, Users],
    ["schedule", "Faol fan guruhlari", counts.active_sections, CalendarDays],
    ["finance", "Qarzdorlik summasi", counts.debt != null ? formatMoney(counts.debt, dashboard.institute?.default_currency || "UZS") : null, CircleDollarSign],
  ];
  return (
    <section>
      <div className="inst-metric-grid">
        {metrics.map(([key, label, value, Icon]) => (
          <button type="button" key={`${key}-${label}`} onClick={() => onOpen(key)}>
            <span><Icon size={19} /></span>
            <b>{value ?? "—"}</b>
            <small>{label}</small>
          </button>
        ))}
      </div>
      <InfoNotice tone="warning">
        Davomat 25% yoki semestr bo‘yicha 74 soatga yetishi faqat ogohlantirishdir.
        Tizim talabani avtomatik imtihondan qoldirmaydi yoki chetlashtirmaydi.
      </InfoNotice>
      <div className="inst-two-columns">
        <article className="inst-card">
          <h3>Bugungi ustuvor ishlar</h3>
          {(dashboard.alerts || dashboard.tasks || []).length ? (
            <ul>{(dashboard.alerts || dashboard.tasks).slice(0, 8).map((item, index) => <li key={item.id || index}>{item.message || item.title || String(item)}</li>)}</ul>
          ) : <p className="inst-muted">Sizning rolingiz uchun yangi ogohlantirish yo‘q.</p>}
        </article>
        <article className="inst-card">
          <h3>Akademik tartib</h3>
          <p className="inst-muted">
            GPA va transkript faqat serverdagi yopilgan baholar hamda o‘quv reja
            kreditlari asosida hisoblanadi. Brauzer natijani rasmiy hisoblamaydi.
          </p>
        </article>
      </div>
    </section>
  );
}

function StructurePanel({ apiBase, token, contextId, permissions, capabilities }) {
  const canManage = canWrite(permissions, "structure");
  const [tab, setTab] = useState("faculties");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    campus_id: "",
    building_id: "",
    code: "",
    name: "",
    address: "",
    phone: "",
    faculty_id: "",
    department_id: "",
    dean_user_id: "",
    head_user_id: "",
    degree_level: "bachelor",
    study_form: "full_time",
    language: "uz",
    duration_terms: "8",
    target_credits: "240",
    room_type: "classroom",
    capacity: "30",
  });
  const campuses = usePagedResource({
    apiBase,
    token,
    contextId,
    path: instituteRoutes.campuses,
    enabled: ["campuses", "faculties", "rooms"].includes(tab),
  });
  const rooms = usePagedResource({ apiBase, token, contextId, path: instituteRoutes.rooms, enabled: tab === "rooms" });
  const faculties = usePagedResource({
    apiBase,
    token,
    contextId,
    path: instituteRoutes.faculties,
    enabled: ["faculties", "departments"].includes(tab),
  });
  const departments = usePagedResource({
    apiBase,
    token,
    contextId,
    path: instituteRoutes.departments,
    enabled: ["departments", "programs"].includes(tab),
  });
  const programs = usePagedResource({ apiBase, token, contextId, path: instituteRoutes.programs, enabled: tab === "programs" });
  const resources = { campuses, rooms, faculties, departments, programs };
  const labels = {
    campuses: "Kampuslar",
    rooms: "Xonalar",
    faculties: "Fakultetlar",
    departments: "Kafedralar",
    programs: "Ta’lim dasturlari",
  };

  const reset = () => {
    setForm({
      campus_id: "",
      building_id: "",
      code: "",
      name: "",
      address: "",
      phone: "",
      faculty_id: "",
      department_id: "",
      dean_user_id: "",
      head_user_id: "",
      degree_level: "bachelor",
      study_form: "full_time",
      language: "uz",
      duration_terms: "8",
      target_credits: "240",
      room_type: "classroom",
      capacity: "30",
    });
    setOpen(false);
    setError("");
  };

  const create = async () => {
    if (!canManage || !form.code.trim() || !form.name.trim()) {
      setError("Kod va nomni kiriting.");
      return;
    }
    let path = instituteRoutes[tab];
    let body;
    if (tab === "campuses") {
      body = {
        code: form.code.trim(),
        name: form.name.trim(),
        address: form.address.trim() || undefined,
        phone: form.phone.trim() || undefined,
      };
    } else if (tab === "rooms") {
      if (!form.campus_id) return setError("Kampusni tanlang.");
      body = {
        campus_id: Number(form.campus_id),
        building_id: form.building_id ? Number(form.building_id) : undefined,
        code: form.code.trim(),
        name: form.name.trim(),
        room_type: form.room_type || undefined,
        capacity: form.capacity ? Number(form.capacity) : undefined,
        metadata: {},
      };
    } else if (tab === "faculties") {
      if (!form.campus_id) return setError("Kampusni tanlang.");
      body = buildFacultyPayload(form);
    } else if (tab === "departments") {
      if (!form.faculty_id) return setError("Fakultetni tanlang.");
      body = buildDepartmentPayload(form);
    } else {
      if (!form.department_id) return setError("Kafedrani tanlang.");
      body = buildProgramPayload(form);
    }
    setBusy(true);
    setError("");
    try {
      await instituteApi(path, {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canManage,
        idempotencyKey: makeIdempotencyKey(`institute-${tab}`, [form.code, form.name, contextId]),
        body,
      });
      reset();
      resources[tab].reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const active = resources[tab];
  return (
    <section>
      <div className="inst-module-toolbar">
        <div>
          <h3>Institut tuzilmasi</h3>
          <p>Server doirasi: {capabilities.scope?.global ? "butun institut" : "faqat biriktirilgan fakultet/kafedra"}</p>
        </div>
        {canManage && <ActionButton onClick={() => setOpen((value) => !value)}><Plus size={15} /> Yangi</ActionButton>}
      </div>
      <div className="inst-tabs" role="tablist">
        {Object.entries(labels).map(([key, label]) => (
          <button type="button" role="tab" aria-selected={tab === key} className={tab === key ? "active" : ""} key={key} onClick={() => { setTab(key); reset(); }}>{label}</button>
        ))}
      </div>
      <ErrorNotice error={error} />
      {open && canManage && (
        <div className="inst-card inst-form-card compact">
          <h3>Yangi {labels[tab].toLocaleLowerCase("uz")}</h3>
          <div className="inst-form-grid">
            {tab === "rooms" && (
              <Field label="Kampus"><select value={form.campus_id} onChange={(event) => setForm((current) => ({ ...current, campus_id: event.target.value }))}><option value="">Tanlang</option>{campuses.items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
            )}
            {tab === "faculties" && (
              <Field label="Kampus"><select value={form.campus_id} onChange={(event) => setForm((current) => ({ ...current, campus_id: event.target.value }))}><option value="">Tanlang</option>{campuses.items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
            )}
            {tab === "departments" && (
              <Field label="Fakultet"><select value={form.faculty_id} onChange={(event) => setForm((current) => ({ ...current, faculty_id: event.target.value }))}><option value="">Tanlang</option>{faculties.items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
            )}
            {tab === "programs" && (
              <Field label="Kafedra"><select value={form.department_id} onChange={(event) => setForm((current) => ({ ...current, department_id: event.target.value }))}><option value="">Tanlang</option>{departments.items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
            )}
            <Field label="Kod"><input value={form.code} maxLength={40} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} /></Field>
            <Field label="Nomi" wide><input value={form.name} maxLength={180} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></Field>
            {tab === "campuses" && <><Field label="Manzil" wide><input value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} /></Field><Field label="Telefon"><input type="tel" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} /></Field></>}
            {tab === "rooms" && <><Field label="Xona turi"><select value={form.room_type} onChange={(event) => setForm((current) => ({ ...current, room_type: event.target.value }))}><option value="classroom">Auditoriya</option><option value="lecture_hall">Ma’ruza zali</option><option value="laboratory">Laboratoriya</option><option value="computer">Kompyuter xona</option><option value="language">Til xonasi</option><option value="online">Onlayn</option><option value="other">Boshqa</option></select></Field><Field label="Sig‘im"><input type="number" min="1" value={form.capacity} onChange={(event) => setForm((current) => ({ ...current, capacity: event.target.value }))} /></Field></>}
            {tab === "faculties" && <Field label="Dekan user ID (ixtiyoriy)"><input type="number" value={form.dean_user_id} onChange={(event) => setForm((current) => ({ ...current, dean_user_id: event.target.value }))} /></Field>}
            {tab === "departments" && <Field label="Mudir user ID (ixtiyoriy)"><input type="number" value={form.head_user_id} onChange={(event) => setForm((current) => ({ ...current, head_user_id: event.target.value }))} /></Field>}
            {tab === "programs" && <><Field label="Daraja"><select value={form.degree_level} onChange={(event) => setForm((current) => ({ ...current, degree_level: event.target.value }))}>{DEGREE_LEVELS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></Field><Field label="Ta’lim shakli"><select value={form.study_form} onChange={(event) => setForm((current) => ({ ...current, study_form: event.target.value }))}>{STUDY_FORMS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></Field><Field label="Davr soni"><input type="number" min="1" value={form.duration_terms} onChange={(event) => setForm((current) => ({ ...current, duration_terms: event.target.value }))} /></Field><Field label="Maqsad kredit"><input type="number" min="1" value={form.target_credits} onChange={(event) => setForm((current) => ({ ...current, target_credits: event.target.value }))} /></Field></>}
          </div>
          <SelectorPagination resources={[["Kampuslar", campuses], ["Fakultetlar", faculties], ["Kafedralar", departments]]} />
          <div className="inst-row-actions"><ActionButton secondary onClick={reset}>Bekor qilish</ActionButton><ActionButton busy={busy} onClick={create}>Qoralamani saqlash</ActionButton></div>
        </div>
      )}
      <ResourceList
        resource={active}
        emptyTitle={`${labels[tab]} topilmadi`}
        emptyText="Yangi yozuv qo‘shilgach shu yerda ko‘rinadi."
        renderMeta={(item) => [item.code, item.faculty_name, item.department_name, item.campus_name, item.degree_level].filter(Boolean).join(" · ")}
      />
    </section>
  );
}

function CurriculumPanel({ apiBase, token, contextId, permissions }) {
  const canManage = canWrite(permissions, "academics");
  const [tab, setTab] = useState("curricula");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [courseTarget, setCourseTarget] = useState(null);
  const [form, setForm] = useState({
    department_id: "",
    program_id: "",
    curriculum_id: "",
    term_id: "",
    course_id: "",
    curriculum_course_id: "",
    code: "",
    title: "",
    name: "",
    credit_value: "4",
    lecture_hours: "30",
    practice_hours: "30",
    laboratory_hours: "0",
    independent_hours: "60",
    supports_latex: false,
    description: "",
    admission_year: String(new Date().getFullYear()),
    version: "1",
    recommended_term: "1",
    requirement_type: "required",
    elective_block: "",
    credits_override: "",
    current_level: "1",
    study_language: "uz",
    advisor_user_id: "",
    primary_lecturer_user_id: "",
    delivery_mode: "offline",
    section_type: "regular",
    capacity: "30",
    cohort_ids: [],
  });
  const departments = usePagedResource({ apiBase, token, contextId, path: instituteRoutes.departments, enabled: tab === "courses" });
  const programs = usePagedResource({ apiBase, token, contextId, path: instituteRoutes.programs, enabled: ["curricula", "cohorts"].includes(tab) });
  const curricula = usePagedResource({ apiBase, token, contextId, path: instituteRoutes.curricula, enabled: ["curricula", "cohorts"].includes(tab) || Boolean(courseTarget) });
  const courses = usePagedResource({ apiBase, token, contextId, path: instituteRoutes.courseCatalog, enabled: ["courses", "sections"].includes(tab) || Boolean(courseTarget) });
  const cohorts = usePagedResource({ apiBase, token, contextId, path: instituteRoutes.cohorts, enabled: ["cohorts", "sections"].includes(tab) });
  const terms = usePagedResource({ apiBase, token, contextId, path: instituteRoutes.terms, enabled: tab === "sections" });
  const sections = usePagedResource({ apiBase, token, contextId, path: instituteRoutes.sections, enabled: tab === "sections" });
  const resources = { courses, curricula, cohorts, sections };
  const labels = {
    courses: "Fanlar katalogi",
    curricula: "O‘quv rejalar",
    cohorts: "Qabul oqimlari",
    sections: "Fan guruhlari",
  };

  const close = () => {
    setOpen(false);
    setCourseTarget(null);
    setError("");
  };

  const create = async () => {
    if (!canManage) return;
    let path;
    let body;
    if (tab === "courses") {
      if (!form.department_id || !form.code.trim() || !form.title.trim()) return setError("Kafedra, fan kodi va nomini kiriting.");
      path = instituteRoutes.courseCatalog;
      body = buildCoursePayload(form);
    } else if (tab === "curricula") {
      if (!form.program_id || !form.name.trim()) return setError("Dastur va o‘quv reja nomini kiriting.");
      path = instituteRoutes.curricula;
      body = buildCurriculumPayload(form);
    } else if (tab === "cohorts") {
      if (!form.program_id || !form.curriculum_id || !form.code.trim()) return setError("Dastur, o‘quv reja va oqim kodini kiriting.");
      path = instituteRoutes.cohorts;
      body = buildCohortPayload(form);
    } else {
      if (!form.term_id || !form.course_id || !form.code.trim() || !form.name.trim()) return setError("Davr, fan, kod va guruh nomini kiriting.");
      path = instituteRoutes.sections;
      body = buildSectionPayload(form);
    }
    setBusy(true);
    setError("");
    try {
      await instituteApi(path, {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canManage,
        idempotencyKey: makeIdempotencyKey(`institute-academic-${tab}`, [form.code, form.name || form.title, contextId]),
        body,
      });
      setOpen(false);
      resources[tab].reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const addCurriculumCourse = async () => {
    if (!canManage || !courseTarget || !form.course_id) return;
    setBusy(true);
    setError("");
    try {
      await instituteApi(instituteRoutes.curriculumCourses(courseTarget.id), {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canManage,
        idempotencyKey: makeIdempotencyKey("curriculum-course", [courseTarget.id, form.course_id, form.recommended_term]),
        body: buildCurriculumCoursePayload(form),
      });
      setCourseTarget(null);
      curricula.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const publishCurriculum = async (item) => {
    if (!canManage || !askHuman("O‘quv reja tarkibini tekshirdingizmi? Nashr qilingach o‘zgartirish uchun yangi versiya yaratiladi.")) return;
    setBusy(true);
    setError("");
    try {
      await instituteApi(instituteRoutes.curriculumPublish(item.id), {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canManage,
        body: { confirmation: true },
      });
      curricula.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const activateSection = async (item) => {
    if (!canManage || !askHuman("Fan guruhi, o‘qituvchi, sig‘im va davrni tekshirdingizmi?")) return;
    setBusy(true);
    try {
      await instituteApi(instituteRoutes.sectionActivate(item.id), {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canManage,
        body: { confirmation: true },
      });
      sections.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const active = resources[tab];
  return (
    <section>
      <div className="inst-module-toolbar">
        <div><h3>O‘quv reja va fanlar</h3><p>Har bir reja dastur va qabul yiliga bog‘langan alohida versiya.</p></div>
        {canManage && <ActionButton onClick={() => setOpen((value) => !value)}><Plus size={15} /> Yangi</ActionButton>}
      </div>
      <div className="inst-tabs" role="tablist">
        {Object.entries(labels).map(([key, label]) => <button type="button" role="tab" aria-selected={tab === key} className={tab === key ? "active" : ""} key={key} onClick={() => { setTab(key); close(); }}>{label}</button>)}
      </div>
      <InfoNotice>
        Majburiy va tanlov fanlari, prerekvizit, kredit va soatlar reja versiyasida saqlanadi. GPA brauzerda emas, yopilgan natijalar asosida serverda hisoblanadi.
      </InfoNotice>
      <ErrorNotice error={error} />
      {open && canManage && (
        <div className="inst-card inst-form-card compact">
          <h3>Yangi {labels[tab].toLocaleLowerCase("uz")}</h3>
          <div className="inst-form-grid">
            {tab === "courses" && <><Field label="Kafedra"><select value={form.department_id} onChange={(event) => setForm((current) => ({ ...current, department_id: event.target.value }))}><option value="">Tanlang</option>{departments.items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field><Field label="Fan kodi"><input value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} /></Field><Field label="Fan nomi" wide><input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} /></Field><Field label="Kredit"><input type="number" min="0" step="0.5" value={form.credit_value} onChange={(event) => setForm((current) => ({ ...current, credit_value: event.target.value }))} /></Field>{[["lecture_hours", "Ma’ruza"], ["practice_hours", "Amaliy"], ["laboratory_hours", "Laboratoriya"], ["independent_hours", "Mustaqil ta’lim"]].map(([key, label]) => <Field key={key} label={`${label} soati`}><input type="number" min="0" value={form[key]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} /></Field>)}<label className="inst-toggle"><input type="checkbox" checked={form.supports_latex} onChange={(event) => setForm((current) => ({ ...current, supports_latex: event.target.checked }))} /><span>LaTeX formulalari ishlatiladi</span></label></>}
            {tab === "curricula" && <><Field label="Ta’lim dasturi"><select value={form.program_id} onChange={(event) => setForm((current) => ({ ...current, program_id: event.target.value }))}><option value="">Tanlang</option>{programs.items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field><Field label="Qabul yili"><input type="number" value={form.admission_year} onChange={(event) => setForm((current) => ({ ...current, admission_year: event.target.value }))} /></Field><Field label="Versiya"><input type="number" min="1" value={form.version} onChange={(event) => setForm((current) => ({ ...current, version: event.target.value }))} /></Field><Field label="O‘quv reja nomi" wide aiField="title"><input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></Field></>}
            {tab === "cohorts" && <><Field label="Ta’lim dasturi"><select value={form.program_id} onChange={(event) => setForm((current) => ({ ...current, program_id: event.target.value }))}><option value="">Tanlang</option>{programs.items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field><Field label="O‘quv reja"><select value={form.curriculum_id} onChange={(event) => setForm((current) => ({ ...current, curriculum_id: event.target.value }))}><option value="">Tanlang</option>{curricula.items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field><Field label="Oqim kodi"><input value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} /></Field><Field label="Qabul yili"><input type="number" value={form.admission_year} onChange={(event) => setForm((current) => ({ ...current, admission_year: event.target.value }))} /></Field><Field label="Bosqich"><input type="number" min="1" value={form.current_level} onChange={(event) => setForm((current) => ({ ...current, current_level: event.target.value }))} /></Field><Field label="Tyutor user ID"><input type="number" value={form.advisor_user_id} onChange={(event) => setForm((current) => ({ ...current, advisor_user_id: event.target.value }))} /></Field></>}
            {tab === "sections" && <><Field label="Davr"><select value={form.term_id} onChange={(event) => setForm((current) => ({ ...current, term_id: event.target.value }))}><option value="">Tanlang</option>{terms.items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field><Field label="Fan"><select value={form.course_id} onChange={(event) => setForm((current) => ({ ...current, course_id: event.target.value }))}><option value="">Tanlang</option>{courses.items.map((item) => <option key={item.id} value={item.id}>{item.title || item.name}</option>)}</select></Field><Field label="Guruh kodi"><input value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} /></Field><Field label="Guruh nomi" wide><input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></Field><Field label="O‘qituvchi user ID"><input type="number" value={form.primary_lecturer_user_id} onChange={(event) => setForm((current) => ({ ...current, primary_lecturer_user_id: event.target.value }))} /></Field><Field label="Dars shakli"><select value={form.delivery_mode} onChange={(event) => setForm((current) => ({ ...current, delivery_mode: event.target.value }))}><option value="offline">Auditoriyada</option><option value="online_live">Jonli onlayn</option><option value="hybrid">Aralash</option><option value="self_paced">Mustaqil sur’atda</option></select></Field><Field label="Sig‘im"><input type="number" min="1" value={form.capacity} onChange={(event) => setForm((current) => ({ ...current, capacity: event.target.value }))} /></Field><Field label="Oqimlar" hint="Ctrl bilan bir nechta tanlang"><select multiple value={form.cohort_ids.map(String)} onChange={(event) => setForm((current) => ({ ...current, cohort_ids: [...event.target.selectedOptions].map((option) => Number(option.value)) }))}>{cohorts.items.map((item) => <option key={item.id} value={item.id}>{item.code || item.name}</option>)}</select></Field></>}
          </div>
          <SelectorPagination resources={[["Kafedralar", departments], ["Dasturlar", programs], ["Rejalar", curricula], ["Fanlar", courses], ["Oqimlar", cohorts], ["Davrlar", terms]]} />
          <div className="inst-row-actions"><ActionButton secondary onClick={close}>Bekor qilish</ActionButton><ActionButton busy={busy} onClick={create}>Qoralamani saqlash</ActionButton></div>
        </div>
      )}
      {courseTarget && (
        <div className="inst-card inst-form-card compact">
          <h3>{courseTarget.name} rejasiga fan qo‘shish</h3>
          <div className="inst-form-grid">
            <Field label="Fan"><select value={form.course_id} onChange={(event) => setForm((current) => ({ ...current, course_id: event.target.value }))}><option value="">Tanlang</option>{courses.items.map((item) => <option key={item.id} value={item.id}>{item.title || item.name}</option>)}</select></Field>
            <Field label="Tavsiya etilgan davr"><input type="number" min="1" value={form.recommended_term} onChange={(event) => setForm((current) => ({ ...current, recommended_term: event.target.value }))} /></Field>
            <Field label="Turi"><select value={form.requirement_type} onChange={(event) => setForm((current) => ({ ...current, requirement_type: event.target.value }))}><option value="required">Majburiy</option><option value="elective">Tanlov</option><option value="optional">Qo‘shimcha</option></select></Field>
            {form.requirement_type === "elective" && <Field label="Tanlov bloki"><input value={form.elective_block} onChange={(event) => setForm((current) => ({ ...current, elective_block: event.target.value }))} /></Field>}
          </div>
          <SelectorPagination resources={[["Fanlar", courses]]} />
          <div className="inst-row-actions"><ActionButton secondary onClick={() => setCourseTarget(null)}>Bekor qilish</ActionButton><ActionButton busy={busy} onClick={addCurriculumCourse}>Fan qo‘shish</ActionButton></div>
        </div>
      )}
      <ResourceList
        resource={active}
        emptyTitle={`${labels[tab]} topilmadi`}
        emptyText="Bu bo‘limga hali yozuv qo‘shilmagan."
        renderMeta={(item) => [item.code, item.program_name, item.department_name, item.credit_value != null ? `${item.credit_value} kredit` : null, item.admission_year].filter(Boolean).join(" · ")}
        actions={(item) => canManage ? <div className="inst-row-actions">{tab === "curricula" && item.status !== "published" && <><ActionButton secondary onClick={() => setCourseTarget(item)}>Fan qo‘shish</ActionButton><ActionButton busy={busy} onClick={() => publishCurriculum(item)}>Nashr qilish</ActionButton></>}{tab === "sections" && item.status !== "active" && <ActionButton busy={busy} onClick={() => activateSection(item)}>Faollashtirish</ActionButton>}</div> : null}
      />
    </section>
  );
}

function SchedulePanel({ apiBase, token, contextId, permissions }) {
  const canManage = canWrite(permissions, "schedule");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    section_id: "",
    teacher_user_id: "",
    room_id: "",
    schedule_kind: "weekly",
    weekday: "1",
    lesson_date: todayValue(),
    effective_from: todayValue(),
    effective_to: "",
    starts_at: "09:00",
    ends_at: "10:20",
    lesson_kind: "lecture",
    topic: "",
  });
  const schedule = usePagedResource({
    apiBase,
    token,
    contextId,
    path: instituteRoutes.schedule,
  });
  const sections = usePagedResource({
    apiBase,
    token,
    contextId,
    path: instituteRoutes.sections,
    enabled: open,
  });
  const rooms = usePagedResource({
    apiBase,
    token,
    contextId,
    path: instituteRoutes.rooms,
    enabled: open,
  });
  const staff = usePagedResource({
    apiBase,
    token,
    contextId,
    path: instituteRoutes.staff,
    enabled: open,
  });

  const create = async () => {
    if (!form.section_id || !form.teacher_user_id) {
      setError("Fan guruhi va o‘qituvchini tanlang.");
      return;
    }
    if (!form.starts_at || !form.ends_at || form.starts_at >= form.ends_at) {
      setError("Dars boshlanishi tugashidan oldin bo‘lishi kerak.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await instituteApi(instituteRoutes.schedule, {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canManage,
        idempotencyKey: makeIdempotencyKey("institute-schedule", [
          contextId,
          form.section_id,
          form.schedule_kind,
          form.weekday || form.lesson_date,
          form.starts_at,
        ]),
        body: buildSchedulePayload(form),
      });
      setOpen(false);
      await schedule.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const publish = async (item) => {
    const id = item.id || item.slot_id;
    if (
      !id ||
      !canManage ||
      !askHuman(
        "Xona, o‘qituvchi, vaqt va to‘qnashuvlarni tekshirdingizmi? Jadvalni e’lon qilishni tasdiqlang.",
      )
    ) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      await instituteApi(instituteRoutes.schedulePublish(id), {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canManage,
        body: { confirmation: true },
      });
      await schedule.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section data-ai-anchor="institute-schedule">
      <div className="inst-module-toolbar">
        <div>
          <h3>Dars jadvali</h3>
          <p>Haftalik yoki aniq sanali dars; e’lon qilish alohida tasdiqlanadi.</p>
        </div>
        {canManage && (
          <ActionButton onClick={() => setOpen((value) => !value)}>
            <Plus size={15} /> Dars qo‘shish
          </ActionButton>
        )}
      </div>
      <InfoNotice tone="warning">
        Server xona, o‘qituvchi va guruh vaqtlaridagi to‘qnashuvni tekshiradi.
        AI avatar jadvalni o‘zi e’lon qilmaydi.
      </InfoNotice>
      <ErrorNotice error={error || schedule.error} onRetry={schedule.reload} />
      {open && canManage && (
        <div className="inst-card inst-form-card compact">
          <h3>Jadval qoralamasi</h3>
          <div className="inst-form-grid">
            <Field label="Fan guruhi">
              <select
                value={form.section_id}
                onChange={(event) =>
                  setForm((current) => ({ ...current, section_id: event.target.value }))
                }
              >
                <option value="">Tanlang</option>
                {sections.items.map((item) => (
                  <option key={item.id} value={item.id}>{item.name || item.code}</option>
                ))}
              </select>
            </Field>
            <Field label="O‘qituvchi">
              <select
                value={form.teacher_user_id}
                onChange={(event) =>
                  setForm((current) => ({ ...current, teacher_user_id: event.target.value }))
                }
              >
                <option value="">Tanlang</option>
                {staff.items.map((item) => (
                  <option key={item.id || item.user_id} value={item.user_id || item.id}>
                    {item.full_name || item.name || `User #${item.user_id || item.id}`}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Auditoriya">
              <select
                value={form.room_id}
                onChange={(event) =>
                  setForm((current) => ({ ...current, room_id: event.target.value }))
                }
              >
                <option value="">Auditoriyasiz / onlayn</option>
                {rooms.items.map((item) => (
                  <option key={item.id} value={item.id}>{item.name || item.code}</option>
                ))}
              </select>
            </Field>
            <Field label="Takrorlanishi">
              <select
                value={form.schedule_kind}
                onChange={(event) =>
                  setForm((current) => ({ ...current, schedule_kind: event.target.value }))
                }
              >
                <option value="weekly">Har hafta</option>
                <option value="dated">Aniq sana</option>
              </select>
            </Field>
            {form.schedule_kind === "weekly" ? (
              <>
                <Field label="Hafta kuni">
                  <select
                    value={form.weekday}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, weekday: event.target.value }))
                    }
                  >
                    {["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"].map((label, index) => (
                      <option key={label} value={index + 1}>{label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Amal qilish boshlanishi">
                  <input type="date" value={form.effective_from} onChange={(event) => setForm((current) => ({ ...current, effective_from: event.target.value }))} />
                </Field>
                <Field label="Amal qilish tugashi">
                  <input type="date" value={form.effective_to} onChange={(event) => setForm((current) => ({ ...current, effective_to: event.target.value }))} />
                </Field>
              </>
            ) : (
              <Field label="Dars sanasi">
                <input type="date" value={form.lesson_date} onChange={(event) => setForm((current) => ({ ...current, lesson_date: event.target.value }))} />
              </Field>
            )}
            <Field label="Boshlanish" aiField="starts_at">
              <input type="time" value={form.starts_at} onChange={(event) => setForm((current) => ({ ...current, starts_at: event.target.value }))} />
            </Field>
            <Field label="Tugash">
              <input type="time" value={form.ends_at} onChange={(event) => setForm((current) => ({ ...current, ends_at: event.target.value }))} />
            </Field>
            <Field label="Dars turi">
              <select value={form.lesson_kind} onChange={(event) => setForm((current) => ({ ...current, lesson_kind: event.target.value }))}>
                <option value="lecture">Ma’ruza</option>
                <option value="practice">Amaliy</option>
                <option value="laboratory">Laboratoriya</option>
                <option value="seminar">Seminar</option>
                <option value="consultation">Konsultatsiya</option>
                <option value="exam">Imtihon</option>
                <option value="other">Boshqa</option>
              </select>
            </Field>
            <Field label="Mavzu" wide>
              <input value={form.topic} onChange={(event) => setForm((current) => ({ ...current, topic: event.target.value }))} />
            </Field>
          </div>
          <SelectorPagination resources={[["Guruhlar", sections], ["Xonalar", rooms], ["Xodimlar", staff]]} />
          <div className="inst-row-actions">
            <ActionButton secondary onClick={() => setOpen(false)}>Bekor qilish</ActionButton>
            <ActionButton busy={busy} onClick={create}>Qoralamani saqlash</ActionButton>
          </div>
        </div>
      )}
      <ResourceList
        resource={schedule}
        emptyTitle="Jadval hali tuzilmagan"
        emptyText="Ruxsatli xodim dars qoralamasini qo‘shishi mumkin."
        renderMeta={(item) => [
          item.section_name || item.course_title,
          item.lesson_date || item.weekday_label,
          item.starts_at && item.ends_at ? `${item.starts_at}–${item.ends_at}` : null,
          item.room_name,
          item.teacher_name,
        ].filter(Boolean).join(" · ")}
        actions={(item) => canManage && item.status !== "published" ? (
          <ActionButton busy={busy} onClick={() => publish(item)}>E’lon qilish</ActionButton>
        ) : null}
      />
    </section>
  );
}

function AttendancePanel({ apiBase, token, contextId, permissions }) {
  const canMark = canWrite(permissions, "attendance");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    section_id: "",
    cohort_id: "",
    student_user_id: "",
    schedule_slot_id: "",
    lesson_date: todayValue(),
    scheduled_minutes: "80",
    absent_minutes: "0",
    semester_unexcused_minutes: "0",
    status: "present",
    note: "",
  });
  const attendance = usePagedResource({
    apiBase,
    token,
    contextId,
    path: instituteRoutes.attendance,
    query: form.section_id ? { section_id: Number(form.section_id) } : undefined,
    enabled: Boolean(form.section_id),
  });
  const sections = usePagedResource({ apiBase, token, contextId, path: instituteRoutes.sections });
  const enrollments = usePagedResource({
    apiBase,
    token,
    contextId,
    path: instituteRoutes.enrollments,
    query: form.section_id ? { section_id: Number(form.section_id) } : undefined,
    enabled: open && Boolean(form.section_id),
  });
  const slots = usePagedResource({
    apiBase,
    token,
    contextId,
    path: instituteRoutes.schedule,
    query: form.section_id ? { section_id: Number(form.section_id) } : undefined,
    enabled: open && Boolean(form.section_id),
  });
  const warnings = attendanceWarnings({
    scheduledMinutes: form.scheduled_minutes,
    absentMinutes: form.absent_minutes,
    semesterUnexcusedMinutes: form.semester_unexcused_minutes,
  });

  const mark = async () => {
    if (!form.section_id || !form.student_user_id || !form.lesson_date) {
      setError("Fan guruhi, talaba va sanani tanlang.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await instituteApi(instituteRoutes.attendance, {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canMark,
        idempotencyKey: makeIdempotencyKey("institute-attendance", [contextId, form.section_id, form.student_user_id, form.lesson_date]),
        body: buildAttendancePayload(form),
      });
      setOpen(false);
      await attendance.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <div className="inst-module-toolbar">
        <div><h3>Davomat</h3><p>Har bir dars va talaba bo‘yicha serverda saqlanadi.</p></div>
        {canMark && <ActionButton onClick={() => setOpen((value) => !value)}><Plus size={15} /> Davomat belgilash</ActionButton>}
      </div>
      <div className="inst-card inst-inline-form">
        <Field label="Ko‘riladigan fan guruhi">
          <select
            value={form.section_id}
            onChange={(event) => setForm((current) => ({
              ...current,
              section_id: event.target.value,
              student_user_id: "",
              schedule_slot_id: "",
            }))}
          >
            <option value="">Fan guruhini tanlang</option>
            {sections.items.map((item) => <option key={item.id} value={item.id}>{item.name || item.code}</option>)}
          </select>
        </Field>
        <LoadMore resource={sections} />
      </div>
      <InfoNotice tone="warning">
        25% fan davomati va 74 soatlik semestr ko‘rsatkichi faqat ogohlantirish.
        Chetlashtirish, imtihondan qoldirish yoki boshqa huquqiy qaror avtomatik emas.
      </InfoNotice>
      <ErrorNotice error={error || attendance.error} onRetry={attendance.reload} />
      {open && canMark && (
        <div className="inst-card inst-form-card compact">
          <h3>Dars davomatini belgilash</h3>
          <div className="inst-form-grid">
            <Field label="Fan guruhi">
              <select value={form.section_id} onChange={(event) => setForm((current) => ({ ...current, section_id: event.target.value, student_user_id: "", schedule_slot_id: "" }))}>
                <option value="">Tanlang</option>
                {sections.items.map((item) => <option key={item.id} value={item.id}>{item.name || item.code}</option>)}
              </select>
            </Field>
            <Field label="Talaba">
              <select value={form.student_user_id} disabled={!form.section_id} onChange={(event) => setForm((current) => ({ ...current, student_user_id: event.target.value }))}>
                <option value="">Tanlang</option>
                {enrollments.items.map((item) => <option key={item.id} value={item.student_user_id}>{item.student_name || item.student_number || `User #${item.student_user_id}`}</option>)}
              </select>
            </Field>
            <Field label="Jadval darsi (ixtiyoriy)">
              <select value={form.schedule_slot_id} disabled={!form.section_id} onChange={(event) => setForm((current) => ({ ...current, schedule_slot_id: event.target.value }))}>
                <option value="">Tanlanmagan</option>
                {slots.items.map((item) => <option key={item.id} value={item.id}>{[item.lesson_date || item.weekday_label, item.starts_at].filter(Boolean).join(" · ") || `#${item.id}`}</option>)}
              </select>
            </Field>
            <Field label="Dars sanasi"><input type="date" value={form.lesson_date} onChange={(event) => setForm((current) => ({ ...current, lesson_date: event.target.value }))} /></Field>
            <Field label="Holat">
              <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value, absent_minutes: event.target.value === "present" ? "0" : current.absent_minutes }))}>
                <option value="present">Keldi</option><option value="absent">Kelmadi</option><option value="late">Kechikdi</option><option value="excused">Sababli</option><option value="sick">Betob</option>
              </select>
            </Field>
            <Field label="Rejalashtirilgan daqiqa"><input type="number" min="1" value={form.scheduled_minutes} onChange={(event) => setForm((current) => ({ ...current, scheduled_minutes: event.target.value }))} /></Field>
            <Field label="Qoldirilgan daqiqa"><input type="number" min="0" value={form.absent_minutes} onChange={(event) => setForm((current) => ({ ...current, absent_minutes: event.target.value }))} /></Field>
            <Field label="Semestrdagi uzrsiz daqiqa" hint="Faqat ogohlantirishni oldindan ko‘rish uchun"><input type="number" min="0" value={form.semester_unexcused_minutes} onChange={(event) => setForm((current) => ({ ...current, semester_unexcused_minutes: event.target.value }))} /></Field>
            <Field label="Izoh" wide><input value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} /></Field>
          </div>
          {(warnings.course_warning || warnings.semester_warning) && (
            <InfoNotice tone="warning">
              {warnings.course_warning ? `Ushbu hisobda qoldirish ${warnings.absence_percent.toFixed(1)}%. ` : ""}
              {warnings.semester_warning ? `Semestr bo‘yicha ${warnings.semester_hours.toFixed(1)} soat. ` : ""}
              Bu faqat ogohlantirish; avtomatik amal: yo‘q.
            </InfoNotice>
          )}
          <SelectorPagination resources={[["Guruhlar", sections], ["Talabalar", enrollments], ["Jadval", slots]]} />
          <div className="inst-row-actions"><ActionButton secondary onClick={() => setOpen(false)}>Bekor qilish</ActionButton><ActionButton busy={busy} onClick={mark}>Saqlash</ActionButton></div>
        </div>
      )}
      <ResourceList
        resource={attendance}
        emptyTitle="Davomat yozuvi yo‘q"
        emptyText="Dars o‘tilgach davomat belgilanadi."
        renderMeta={(item) => [item.student_name || item.student_number, item.section_name || item.course_title, formatDate(item.lesson_date), item.absent_minutes != null ? `${item.absent_minutes} daqiqa` : null].filter(Boolean).join(" · ")}
      />
    </section>
  );
}

function GradebookPanel({ apiBase, token, contextId, permissions, roles }) {
  const canEnter = canWrite(permissions, "grades");
  const canFinalize = canWrite(permissions, "finalize");
  const isStudent = roles.includes("student");
  const [mode, setMode] = useState("grade");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [form, setForm] = useState({ assessment_id: "", enrollment_id: "", score: "", feedback: "" });
  const sections = usePagedResource({ apiBase, token, contextId, path: instituteRoutes.sections });
  const grades = usePagedResource({
    apiBase,
    token,
    contextId,
    path: instituteRoutes.grades,
    query: sectionId ? { section_id: Number(sectionId) } : undefined,
    enabled: Boolean(sectionId),
  });
  const results = usePagedResource({ apiBase, token, contextId, path: instituteRoutes.courseResults, enabled: mode === "results" || canFinalize });
  const transcripts = usePagedResource({ apiBase, token, contextId, path: instituteRoutes.transcripts, enabled: isStudent });
  const assessments = usePagedResource({
    apiBase,
    token,
    contextId,
    path: instituteRoutes.assessments,
    query: sectionId ? { section_id: Number(sectionId) } : undefined,
    enabled: Boolean(sectionId) && open,
  });
  const enrollments = usePagedResource({
    apiBase,
    token,
    contextId,
    path: instituteRoutes.enrollments,
    query: sectionId ? { section_id: Number(sectionId) } : undefined,
    enabled: Boolean(sectionId) && (open || canFinalize),
  });

  const saveGrade = async () => {
    if (!form.assessment_id || !form.enrollment_id || form.score === "") {
      setError("Baholash, talaba yozuvi va ballni kiriting.");
      return;
    }
    const selectedAssessment = assessments.items.find((item) => String(item.id) === String(form.assessment_id));
    if (selectedAssessment && Number(form.score) > Number(selectedAssessment.max_score)) {
      setError(`Ball ${selectedAssessment.max_score} dan oshmasligi kerak.`);
      return;
    }
    const idempotencyKey = makeIdempotencyKey("institute-grade", [contextId, form.assessment_id, form.enrollment_id]);
    setBusy(true);
    setError("");
    try {
      await instituteApi(instituteRoutes.grades, {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canEnter,
        idempotencyKey,
        body: buildGradePayload(form, idempotencyKey),
      });
      setOpen(false);
      await grades.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const finalize = async (enrollmentId) => {
    if (!enrollmentId || !canFinalize || !askHuman("Barcha e’lon qilingan baholashlar va ballarni tekshirdingizmi? Yakuniy natijani inson sifatida tasdiqlang.")) return;
    const idempotencyKey = makeIdempotencyKey("institute-final-result", [contextId, enrollmentId]);
    setBusy(true);
    setError("");
    try {
      await instituteApi(instituteRoutes.courseResultFinalize(enrollmentId), {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canFinalize,
        idempotencyKey,
        body: { idempotency_key: idempotencyKey, confirmation: true },
      });
      await Promise.all([results.reload(), grades.reload()]);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const active = mode === "results" ? results : grades;
  return (
    <section>
      <div className="inst-module-toolbar">
        <div><h3>Elektron baho daftari</h3><p>Ballni o‘qituvchi kiritadi; yakuniy natijani alohida vakolatli inson tasdiqlaydi.</p></div>
        {canEnter && <ActionButton onClick={() => setOpen((value) => !value)}><Plus size={15} /> Ball kiritish</ActionButton>}
      </div>
      <div className="inst-card inst-inline-form">
        <Field label="Fan guruhi">
          <select
            value={sectionId}
            onChange={(event) => {
              setSectionId(event.target.value);
              setForm({ assessment_id: "", enrollment_id: "", score: "", feedback: "" });
            }}
          >
            <option value="">Fan guruhini tanlang</option>
            {sections.items.map((item) => <option key={item.id} value={item.id}>{item.name || item.code}</option>)}
          </select>
        </Field>
        <LoadMore resource={sections} />
      </div>
      <div className="inst-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={mode === "grade"} className={mode === "grade" ? "active" : ""} onClick={() => setMode("grade")}>Baholar</button>
        <button type="button" role="tab" aria-selected={mode === "results"} className={mode === "results" ? "active" : ""} onClick={() => setMode("results")}>Yakuniy natijalar</button>
      </div>
      <InfoNotice>GPA va kredit natijasi faqat serverdagi yopilgan baholashlar hamda siyosat versiyasidan hisoblanadi.</InfoNotice>
      <ErrorNotice error={error || active.error} onRetry={active.reload} />
      {open && canEnter && (
        <div className="inst-card inst-form-card compact">
          <h3>Ball kiritish</h3>
          <div className="inst-form-grid">
            <Field label="Baholash">
              <select value={form.assessment_id} onChange={(event) => setForm((current) => ({ ...current, assessment_id: event.target.value }))}>
                <option value="">Tanlang</option>{assessments.items.map((item) => <option key={item.id} value={item.id}>{item.title} · {item.max_score} ball</option>)}
              </select>
            </Field>
            <Field label="Talaba yozuvi">
              <select value={form.enrollment_id} onChange={(event) => setForm((current) => ({ ...current, enrollment_id: event.target.value }))}>
                <option value="">Tanlang</option>{enrollments.items.map((item) => <option key={item.id} value={item.id}>{item.student_name || item.student_number || `#${item.id}`} · {item.section_name || "guruh"}</option>)}
              </select>
            </Field>
            <Field label="Ball"><input type="number" min="0" step="0.01" value={form.score} onChange={(event) => setForm((current) => ({ ...current, score: event.target.value }))} /></Field>
            <Field label="Izoh" wide><textarea rows="3" value={form.feedback} onChange={(event) => setForm((current) => ({ ...current, feedback: event.target.value }))} /></Field>
          </div>
          <SelectorPagination resources={[["Guruhlar", sections], ["Baholashlar", assessments], ["Talabalar", enrollments]]} />
          <div className="inst-row-actions"><ActionButton secondary onClick={() => setOpen(false)}>Bekor qilish</ActionButton><ActionButton busy={busy} onClick={saveGrade}>Ballni saqlash</ActionButton></div>
        </div>
      )}
      <ResourceList
        resource={active}
        emptyTitle={mode === "results" ? "Yakuniy natija yo‘q" : "Baho kiritilmagan"}
        emptyText="Server faqat rolingiz doirasidagi yozuvlarni ko‘rsatadi."
        renderMeta={(item) => mode === "results"
          ? [item.student_name || item.student_number, item.course_title, item.final_percent != null ? `${item.final_percent}%` : null, item.letter_grade, item.credits != null ? `${item.credits} kredit` : null].filter(Boolean).join(" · ")
          : [item.student_name || item.student_number, item.assessment_title, item.score != null && item.max_score != null ? `${item.score}/${item.max_score}` : item.score, item.feedback].filter(Boolean).join(" · ")}
        actions={(item) => mode === "results" && canFinalize && item.status !== "finalized" ? <ActionButton busy={busy} onClick={() => finalize(item.enrollment_id || item.id)}>Yakunlash</ActionButton> : null}
      />
      {canFinalize && mode === "grade" && enrollments.items.length > 0 && (
        <div className="inst-card inst-compact-section">
          <h3>Natijani yakunlash</h3>
          <p className="inst-muted">Faqat barcha e’lon qilingan baholashlar to‘ldirilgach ishlaydi.</p>
          <div className="inst-chip-list">
            {enrollments.items.slice(0, 20).map((item) => <ActionButton key={item.id} secondary busy={busy} onClick={() => finalize(item.id)}>{item.student_name || item.student_number || `#${item.id}`}</ActionButton>)}
          </div>
          <LoadMore resource={enrollments} />
        </div>
      )}
      {isStudent && (
        <div className="inst-card inst-compact-section">
          <h3>Mening transkriptlarim</h3>
          <ResourceList resource={transcripts} emptyTitle="Transkript hali chiqarilmagan" emptyText="Rasmiy transkriptni vakolatli registrator chiqaradi." renderMeta={(item) => [item.issue_no || item.transcript_no, (item.gpa ?? item.cumulative_gpa) != null ? `GPA ${item.gpa ?? item.cumulative_gpa}` : null, (item.total_credits ?? item.earned_credits ?? item.attempted_credits) != null ? `${item.total_credits ?? item.earned_credits ?? item.attempted_credits} kredit` : null, formatDate(item.issued_at)].filter(Boolean).join(" · ")} />
        </div>
      )}
    </section>
  );
}

function ExamsPanel({ apiBase, token, contextId, permissions }) {
  const canManage = canWrite(permissions, "grades") || canWrite(permissions, "academics");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ section_id: "", assessment_type: "quiz", title: "", max_score: "100", weight_percent: "100", due_at: "", settings: {} });
  const assessments = usePagedResource({
    apiBase,
    token,
    contextId,
    path: instituteRoutes.assessments,
    query: form.section_id ? { section_id: Number(form.section_id) } : undefined,
    enabled: Boolean(form.section_id),
  });
  const sections = usePagedResource({ apiBase, token, contextId, path: instituteRoutes.sections });

  const create = async () => {
    if (!form.section_id || !form.title.trim() || !(Number(form.max_score) > 0) || !(Number(form.weight_percent) > 0)) {
      setError("Fan guruhi, nom, maksimal ball va ulushni kiriting.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await instituteApi(instituteRoutes.assessments, {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canManage,
        idempotencyKey: makeIdempotencyKey("institute-assessment", [contextId, form.section_id, form.title]),
        body: buildAssessmentPayload(form),
      });
      setOpen(false);
      await assessments.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const publish = async (item) => {
    if (!canManage || !askHuman("Baholash nomi, maksimal balli, ulushi va muddatini tekshirdingizmi?")) return;
    setBusy(true);
    setError("");
    try {
      await instituteApi(instituteRoutes.assessmentPublish(item.id), {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canManage,
        body: { confirmation: true },
      });
      await assessments.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <div className="inst-module-toolbar">
        <div><h3>Nazorat va imtihonlar</h3><p>Joriy, oraliq va yakuniy baholash mezonlari.</p></div>
        {canManage && <ActionButton onClick={() => setOpen((value) => !value)}><Plus size={15} /> Baholash yaratish</ActionButton>}
      </div>
      <div className="inst-card inst-inline-form">
        <Field label="Ko‘riladigan fan guruhi">
          <select
            value={form.section_id}
            onChange={(event) => setForm((current) => ({ ...current, section_id: event.target.value }))}
          >
            <option value="">Fan guruhini tanlang</option>
            {sections.items.map((item) => <option key={item.id} value={item.id}>{item.name || item.code}</option>)}
          </select>
        </Field>
        <LoadMore resource={sections} />
      </div>
      <InfoNotice>
        Bu v1 baholash rejasini va natijalarni boshqaradi. Mustaqil test topshirish uchun alohida, serverda vaqt va urinishni tekshiradigan endpoint qo‘shilmaguncha brauzer soxta urinish yaratmaydi.
      </InfoNotice>
      <ErrorNotice error={error || assessments.error} onRetry={assessments.reload} />
      {open && canManage && (
        <div className="inst-card inst-form-card compact">
          <h3>Baholash qoralamasi</h3>
          <div className="inst-form-grid">
            <Field label="Fan guruhi"><select value={form.section_id} onChange={(event) => setForm((current) => ({ ...current, section_id: event.target.value }))}><option value="">Tanlang</option>{sections.items.map((item) => <option key={item.id} value={item.id}>{item.name || item.code}</option>)}</select></Field>
            <Field label="Nazorat turi"><select value={form.assessment_type} onChange={(event) => setForm((current) => ({ ...current, assessment_type: event.target.value }))}><option value="attendance">Davomat balli</option><option value="assignment">Topshiriq</option><option value="quiz">Qisqa test</option><option value="project">Loyiha</option><option value="midterm">Oraliq</option><option value="final">Yakuniy</option><option value="other">Boshqa</option></select></Field>
            <Field label="Nomi" wide><input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} /></Field>
            <Field label="Maksimal ball"><input type="number" min="1" step="0.01" value={form.max_score} onChange={(event) => setForm((current) => ({ ...current, max_score: event.target.value }))} /></Field>
            <Field label="Yakuniy natijadagi ulushi, %"><input type="number" min="0.01" max="100" step="0.01" value={form.weight_percent} onChange={(event) => setForm((current) => ({ ...current, weight_percent: event.target.value }))} /></Field>
            <Field label="Topshirish muddati"><input type="datetime-local" value={form.due_at} onChange={(event) => setForm((current) => ({ ...current, due_at: event.target.value }))} /></Field>
          </div>
          <SelectorPagination resources={[["Guruhlar", sections]]} />
          <div className="inst-row-actions"><ActionButton secondary onClick={() => setOpen(false)}>Bekor qilish</ActionButton><ActionButton busy={busy} onClick={create}>Qoralamani saqlash</ActionButton></div>
        </div>
      )}
      <ResourceList
        resource={assessments}
        emptyTitle="Baholash yo‘q"
        emptyText="Fan guruhiga nazorat turi qo‘shilmagan."
        renderMeta={(item) => [item.section_name || item.course_title, item.assessment_type, item.max_score != null ? `${item.max_score} ball` : null, item.weight_percent != null ? `${item.weight_percent}% ulush` : null, item.due_at ? formatDate(item.due_at) : null].filter(Boolean).join(" · ")}
        actions={(item) => canManage && item.status !== "published" ? <ActionButton busy={busy} onClick={() => publish(item)}>E’lon qilish</ActionButton> : null}
      />
    </section>
  );
}

function StudentsPanel({ apiBase, token, contextId, permissions }) {
  const canManage = canWrite(permissions, "enrollments");
  const canIssue = canWrite(permissions, "transcripts");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [studentForTranscript, setStudentForTranscript] = useState("");
  const [form, setForm] = useState({
    section_id: "",
    cohort_id: "",
    student_user_id: "",
    student_number: "",
    enrollment_type: "regular",
    status: "pending",
    note: "",
  });
  const enrollments = usePagedResource({ apiBase, token, contextId, path: instituteRoutes.enrollments });
  const sections = usePagedResource({ apiBase, token, contextId, path: instituteRoutes.sections, enabled: open });
  const cohorts = usePagedResource({ apiBase, token, contextId, path: instituteRoutes.cohorts, enabled: open });
  const transcriptStudents = useMemo(
    () => [...new Map(
      enrollments.items
        .filter((item) => item.student_record_id)
        .map((item) => [String(item.student_record_id), item]),
    ).values()],
    [enrollments.items],
  );

  const create = async () => {
    if (!form.section_id || !form.student_user_id || !form.student_number.trim()) {
      setError("Fan guruhi, talaba user ID va talaba raqamini kiriting.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await instituteApi(instituteRoutes.enrollments, {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canManage,
        idempotencyKey: makeIdempotencyKey("institute-enrollment", [contextId, form.section_id, form.student_user_id]),
        body: buildEnrollmentPayload(form),
      });
      setOpen(false);
      await enrollments.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const decide = async (item, status) => {
    const labels = { enrolled: "qabul qilish", waitlisted: "kutish ro‘yxatiga olish", completed: "yakunlangan deb belgilash", withdrawn: "chiqarish", rejected: "rad etish" };
    if (!canManage || !askHuman(`${item.student_name || item.student_number || "Talaba"} yozuvini ${labels[status]}ni hujjatlar asosida tasdiqlaysizmi?`)) return;
    setBusy(true);
    setError("");
    try {
      await instituteApi(instituteRoutes.enrollmentDecision(item.id), {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canManage,
        body: { status, confirmation: true },
      });
      await enrollments.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const issueTranscript = async (studentId) => {
    if (!studentId || !canIssue || !askHuman("Talabaning yakuniy natijalari, shaxsiy ma’lumoti va rasmiy chiqarish vakolatini tekshirdingizmi?")) return;
    const idempotencyKey = makeIdempotencyKey("institute-transcript", [contextId, studentId]);
    setBusy(true);
    setError("");
    try {
      await instituteApi(instituteRoutes.transcriptIssue(studentId), {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canIssue,
        idempotencyKey,
        body: { confirmation: true, idempotency_key: idempotencyKey },
      });
      setStudentForTranscript("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <div className="inst-module-toolbar">
        <div><h3>Talabalar va fanlarga yozilish</h3><p>Majburiy yoki tanlov fani, ro‘yxatdan o‘tish holati va tyutor nazorati.</p></div>
        {canManage && <ActionButton onClick={() => setOpen((value) => !value)}><Plus size={15} /> Talabani fanga yozish</ActionButton>}
      </div>
      <InfoNotice tone="warning">
        Chetlashtirish, tiklash va ko‘chirish uchun alohida buyruq hamda inson qarori talab qilinadi. Bu bo‘lim faqat fan guruhiga yozilish holatini boshqaradi.
      </InfoNotice>
      <ErrorNotice error={error || enrollments.error} onRetry={enrollments.reload} />
      {open && canManage && (
        <div className="inst-card inst-form-card compact">
          <h3>Fan guruhiga yozish</h3>
          <div className="inst-form-grid">
            <Field label="Fan guruhi"><select value={form.section_id} onChange={(event) => setForm((current) => ({ ...current, section_id: event.target.value, cohort_id: "" }))}><option value="">Tanlang</option>{sections.items.map((item) => <option key={item.id} value={item.id}>{item.name || item.code}</option>)}</select></Field>
            <Field label="Akademik guruh" hint="Oqimda bir nechta guruh bo‘lsa majburiy">
              <select value={form.cohort_id} onChange={(event) => setForm((current) => ({ ...current, cohort_id: event.target.value }))}>
                <option value="">Server bitta guruhni aniqlasin</option>
                {cohorts.items.map((item) => <option key={item.id} value={item.id}>{item.code || item.name} · {item.program_name || "dastur"}</option>)}
              </select>
            </Field>
            <Field label="Talaba user ID"><input type="number" min="1" value={form.student_user_id} onChange={(event) => setForm((current) => ({ ...current, student_user_id: event.target.value }))} /></Field>
            <Field label="Talaba raqami"><input value={form.student_number} onChange={(event) => setForm((current) => ({ ...current, student_number: event.target.value }))} /></Field>
            <Field label="Yozilish turi"><select value={form.enrollment_type} onChange={(event) => setForm((current) => ({ ...current, enrollment_type: event.target.value }))}><option value="regular">Oddiy</option><option value="retake">Qayta o‘qish</option><option value="audit">Tinglovchi</option><option value="summer">Yozgi semestr</option></select></Field>
            <Field label="Izoh" wide><textarea rows="3" value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} /></Field>
          </div>
          <SelectorPagination resources={[["Fan guruhlari", sections], ["Akademik guruhlar", cohorts]]} />
          <div className="inst-row-actions"><ActionButton secondary onClick={() => setOpen(false)}>Bekor qilish</ActionButton><ActionButton busy={busy} onClick={create}>Arizani saqlash</ActionButton></div>
        </div>
      )}
      {canIssue && (
        <div className="inst-card inst-inline-form">
          <div><h3>Rasmiy transkript chiqarish</h3><p className="inst-muted">Faqat registrator vakolati va inson tasdig‘i bilan.</p></div>
          <Field label="Talaba">
            <select value={studentForTranscript} onChange={(event) => setStudentForTranscript(event.target.value)}>
              <option value="">Talabani tanlang</option>
              {transcriptStudents.map((item) => (
                <option key={item.student_record_id} value={item.student_record_id}>
                  {item.student_name || item.student_number || `Talaba #${item.student_record_id}`}
                </option>
              ))}
            </select>
          </Field>
          <ActionButton busy={busy} onClick={() => issueTranscript(studentForTranscript)}>Tekshirdim — chiqarish</ActionButton>
          <LoadMore resource={enrollments} />
        </div>
      )}
      <ResourceList
        resource={enrollments}
        emptyTitle="Talaba yozuvi yo‘q"
        emptyText="Fan guruhiga hali talaba yozilmagan."
        renderMeta={(item) => [item.student_name || item.student_number, item.section_name || item.course_title, item.enrollment_type].filter(Boolean).join(" · ")}
        actions={(item) => canManage ? (
          <div className="inst-row-actions">
            {item.status === "pending" && <><ActionButton busy={busy} onClick={() => decide(item, "enrolled")}>Qabul qilish</ActionButton><ActionButton secondary busy={busy} onClick={() => decide(item, "waitlisted")}>Kutish</ActionButton><ActionButton danger busy={busy} onClick={() => decide(item, "rejected")}>Rad etish</ActionButton></>}
            {item.status === "enrolled" && <ActionButton secondary busy={busy} onClick={() => decide(item, "withdrawn")}>Fan guruhidan chiqarish</ActionButton>}
          </div>
        ) : null}
      />
    </section>
  );
}

function TranscriptsPanel({ apiBase, token, contextId, permissions, roles }) {
  const canIssue = canWrite(permissions, "transcripts");
  const isStudent = roles.includes("student");
  const [studentId, setStudentId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const transcripts = usePagedResource({ apiBase, token, contextId, path: instituteRoutes.transcripts });
  const enrollments = usePagedResource({
    apiBase,
    token,
    contextId,
    path: instituteRoutes.enrollments,
    enabled: canIssue,
  });
  const transcriptStudents = useMemo(
    () => [...new Map(
      enrollments.items
        .filter((item) => item.student_record_id)
        .map((item) => [String(item.student_record_id), item]),
    ).values()],
    [enrollments.items],
  );

  const issue = async () => {
    if (!studentId || !canIssue || !askHuman("Transkript faqat yopilgan natijalardan tuziladi. Talaba va vakolatni tekshirdingizmi?")) return;
    const idempotencyKey = makeIdempotencyKey("institute-transcript", [contextId, studentId]);
    setBusy(true);
    setError("");
    try {
      await instituteApi(instituteRoutes.transcriptIssue(studentId), {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canIssue,
        idempotencyKey,
        body: { confirmation: true, idempotency_key: idempotencyKey },
      });
      setStudentId("");
      await transcripts.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <div className="inst-module-toolbar"><div><h3>{isStudent ? "Mening transkriptim" : "Rasmiy transkriptlar"}</h3><p>Fan, kredit, baho, GPA va chiqarilgan sana serverdan olinadi.</p></div></div>
      <InfoNotice>Talaba ko‘rinishida server faqat o‘z transkriptini qaytaradi; URL orqali boshqa student_id yuborilmaydi.</InfoNotice>
      <ErrorNotice error={error || transcripts.error} onRetry={transcripts.reload} />
      {canIssue && (
        <div className="inst-card inst-inline-form">
          <Field label="Talaba">
            <select value={studentId} onChange={(event) => setStudentId(event.target.value)}>
              <option value="">Talabani tanlang</option>
              {transcriptStudents.map((item) => (
                <option key={item.student_record_id} value={item.student_record_id}>
                  {item.student_name || item.student_number || `Talaba #${item.student_record_id}`}
                </option>
              ))}
            </select>
          </Field>
          <ActionButton busy={busy} onClick={issue}>Tekshirdim — transkript chiqarish</ActionButton>
          <LoadMore resource={enrollments} />
        </div>
      )}
      <ResourceList
        resource={transcripts}
        emptyTitle="Transkript topilmadi"
        emptyText="Yakuniy natijalar yopilgach registrator rasmiy transkript chiqaradi."
        renderMeta={(item) => [item.student_name || item.student_number, item.issue_no || item.transcript_no, (item.gpa ?? item.cumulative_gpa) != null ? `GPA ${item.gpa ?? item.cumulative_gpa}` : null, (item.total_credits ?? item.earned_credits ?? item.attempted_credits) != null ? `${item.total_credits ?? item.earned_credits ?? item.attempted_credits} kredit` : null, formatDate(item.issued_at)].filter(Boolean).join(" · ")}
      />
    </section>
  );
}

function FinancePanel({ apiBase, token, contextId, permissions, institute }) {
  const canManage = canWrite(permissions, "finance");
  const defaultCurrency = institute?.default_currency || "UZS";
  const [tab, setTab] = useState("contracts");
  const [formMode, setFormMode] = useState("");
  const [installmentTarget, setInstallmentTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [contractForm, setContractForm] = useState({
    student_user_id: "", program_id: "", academic_year_id: "", contract_no: "",
    contract_type: "paid", total_amount: "", scholarship_amount: "0", currency: defaultCurrency,
    payer_user_id: "", starts_on: todayValue(), ends_on: "",
  });
  const [paymentForm, setPaymentForm] = useState({ contract_id: "", installment_id: "", amount: "", currency: defaultCurrency, payment_method: "bank_transfer", reference: "", paid_at: "" });
  const [installment, setInstallment] = useState({ installment_no: "1", due_date: todayValue(), amount: "" });
  const contracts = usePagedResource({ apiBase, token, contextId, path: instituteRoutes.contracts });
  const debts = usePagedResource({ apiBase, token, contextId, path: instituteRoutes.debts, enabled: tab === "debts" || formMode === "payment" });
  const programs = usePagedResource({ apiBase, token, contextId, path: instituteRoutes.programs, enabled: formMode === "contract" });
  const academicYears = usePagedResource({ apiBase, token, contextId, path: instituteRoutes.academicYears, enabled: formMode === "contract" });

  const createContract = async () => {
    if (!contractForm.student_user_id || !contractForm.program_id || !contractForm.academic_year_id || !contractForm.contract_no.trim() || !(Number(contractForm.total_amount) > 0) || !contractForm.ends_on) {
      setError("Talaba, dastur, o‘quv yili, kontrakt raqami, summa va muddatni kiriting.");
      return;
    }
    if (!askHuman("Kontrakt raqami, tomonlar, summa va muddatni hujjat bilan tekshirdingizmi?")) return;
    setBusy(true);
    setError("");
    try {
      await instituteApi(instituteRoutes.contracts, {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canManage,
        idempotencyKey: makeIdempotencyKey("institute-contract", [contextId, contractForm.contract_no]),
        body: buildContractPayload(contractForm),
      });
      setFormMode("");
      await contracts.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const recordPayment = async () => {
    if (!paymentForm.contract_id || !paymentForm.installment_id || !(Number(paymentForm.amount) > 0) || !paymentForm.payment_method) {
      setError("To‘lov bosqichi, summa va to‘lov usulini kiriting.");
      return;
    }
    if (!askHuman("Bank/kassa hujjatini ko‘rdingizmi? To‘lovni inson sifatida qayd etishni tasdiqlang.")) return;
    const idempotencyKey = makeIdempotencyKey("institute-payment", [contextId, paymentForm.contract_id, paymentForm.reference, paymentForm.amount]);
    setBusy(true);
    setError("");
    try {
      await instituteApi(instituteRoutes.payments, {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canManage,
        idempotencyKey,
        body: buildPaymentPayload(paymentForm, idempotencyKey),
      });
      setFormMode("");
      await contracts.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const addInstallment = async () => {
    if (!installmentTarget || !installment.due_date || !(Number(installment.amount) > 0) || !askHuman("Bo‘lib to‘lash sanasi va summasini kontrakt bilan tekshirdingizmi?")) return;
    setBusy(true);
    setError("");
    try {
      await instituteApi(instituteRoutes.contractInstallments(installmentTarget.id), {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canManage,
        body: buildInstallmentsPayload([installment]),
      });
      setInstallmentTarget(null);
      await contracts.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const active = tab === "contracts" ? contracts : debts;
  return (
    <section>
      <div className="inst-module-toolbar">
        <div><h3>Kontrakt va to‘lovlar</h3><p>Shartnoma, bo‘lib to‘lash, tushum va qarzdorlik.</p></div>
        {canManage && <div className="inst-row-actions"><ActionButton secondary onClick={() => setFormMode("payment")}>To‘lov qayd etish</ActionButton><ActionButton onClick={() => setFormMode("contract")}><Plus size={15} /> Kontrakt</ActionButton></div>}
      </div>
      <div className="inst-tabs" role="tablist"><button type="button" role="tab" aria-selected={tab === "contracts"} className={tab === "contracts" ? "active" : ""} onClick={() => setTab("contracts")}>Kontraktlar</button><button type="button" role="tab" aria-selected={tab === "debts"} className={tab === "debts" ? "active" : ""} onClick={() => setTab("debts")}>Qarzdorlik</button></div>
      <InfoNotice tone="warning">HEMIS, kontrakt.edu.uz va Billing bilan integratsiya hozir ulanmagan. Bu ichki hisob; tashqi holat deb ko‘rsatilmaydi.</InfoNotice>
      <ErrorNotice error={error || active.error} onRetry={active.reload} />
      {formMode === "contract" && canManage && (
        <div className="inst-card inst-form-card compact">
          <h3>Yangi kontrakt</h3>
          <div className="inst-form-grid">
            <Field label="Talaba user ID"><input type="number" min="1" value={contractForm.student_user_id} onChange={(event) => setContractForm((current) => ({ ...current, student_user_id: event.target.value }))} /></Field>
            <Field label="Ta’lim dasturi"><select value={contractForm.program_id} onChange={(event) => setContractForm((current) => ({ ...current, program_id: event.target.value }))}><option value="">Tanlang</option>{programs.items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
            <Field label="O‘quv yili"><select value={contractForm.academic_year_id} onChange={(event) => setContractForm((current) => ({ ...current, academic_year_id: event.target.value }))}><option value="">Tanlang</option>{academicYears.items.map((item) => <option key={item.id} value={item.id}>{item.code}</option>)}</select></Field>
            <Field label="Kontrakt raqami"><input value={contractForm.contract_no} onChange={(event) => setContractForm((current) => ({ ...current, contract_no: event.target.value }))} /></Field>
            <Field label="Jami summa"><input type="number" min="0" value={contractForm.total_amount} onChange={(event) => setContractForm((current) => ({ ...current, total_amount: event.target.value }))} /></Field>
            <Field label="Valyuta"><input value={defaultCurrency} readOnly /></Field>
            <Field label="Stipendiya/chegirma"><input type="number" min="0" value={contractForm.scholarship_amount} onChange={(event) => setContractForm((current) => ({ ...current, scholarship_amount: event.target.value }))} /></Field>
            <Field label="Boshlanish"><input type="date" value={contractForm.starts_on} onChange={(event) => setContractForm((current) => ({ ...current, starts_on: event.target.value }))} /></Field>
            <Field label="Tugash"><input type="date" value={contractForm.ends_on} onChange={(event) => setContractForm((current) => ({ ...current, ends_on: event.target.value }))} /></Field>
          </div>
          <SelectorPagination resources={[["Dasturlar", programs], ["O‘quv yillari", academicYears]]} />
          <div className="inst-row-actions"><ActionButton secondary onClick={() => setFormMode("")}>Bekor qilish</ActionButton><ActionButton busy={busy} onClick={createContract}>Tekshirdim — yaratish</ActionButton></div>
        </div>
      )}
      {formMode === "payment" && canManage && (
        <div className="inst-card inst-form-card compact">
          <h3>To‘lovni qayd etish</h3>
          <div className="inst-form-grid">
            <Field label="To‘lov bosqichi"><select value={paymentForm.installment_id} onChange={(event) => { const selectedDebt = debts.items.find((item) => String(item.installment_id || item.id) === event.target.value); setPaymentForm((current) => ({ ...current, installment_id: event.target.value, contract_id: selectedDebt?.contract_id || "", amount: selectedDebt?.remaining_amount ?? selectedDebt?.debt_amount ?? selectedDebt?.debt ?? current.amount, currency: selectedDebt?.currency || current.currency })); }}><option value="">Tanlang</option>{debts.items.map((item) => <option key={item.installment_id || item.id} value={item.installment_id || item.id}>{item.contract_no || `Kontrakt #${item.contract_id}`} · {item.student_name || item.student_number || "talaba"} · {formatMoney(item.remaining_amount ?? item.debt_amount ?? item.debt ?? item.balance, item.currency || "UZS")}</option>)}</select></Field>
            <Field label="To‘lov summasi"><input type="number" min="0.01" value={paymentForm.amount} onChange={(event) => setPaymentForm((current) => ({ ...current, amount: event.target.value }))} /></Field>
            <Field label="To‘lov usuli"><select value={paymentForm.payment_method} onChange={(event) => setPaymentForm((current) => ({ ...current, payment_method: event.target.value }))}><option value="bank_transfer">Bank o‘tkazmasi</option><option value="cash">Naqd</option><option value="card">Karta</option><option value="online">Onlayn</option><option value="other">Boshqa</option></select></Field>
            <Field label="Hujjat/reference"><input value={paymentForm.reference} onChange={(event) => setPaymentForm((current) => ({ ...current, reference: event.target.value }))} /></Field>
            <Field label="To‘langan vaqt"><input type="datetime-local" value={paymentForm.paid_at} onChange={(event) => setPaymentForm((current) => ({ ...current, paid_at: event.target.value }))} /></Field>
          </div>
          <LoadMore resource={debts} label="Yana 100 ta to‘lov bosqichi" />
          <div className="inst-row-actions"><ActionButton secondary onClick={() => setFormMode("")}>Bekor qilish</ActionButton><ActionButton busy={busy} onClick={recordPayment}>Tekshirdim — qayd etish</ActionButton></div>
        </div>
      )}
      {installmentTarget && (
        <div className="inst-card inst-form-card compact">
          <h3>{installmentTarget.contract_no || `#${installmentTarget.id}`} uchun to‘lov qismi</h3>
          <div className="inst-form-grid"><Field label="Qism raqami"><input type="number" min="1" value={installment.installment_no} onChange={(event) => setInstallment((current) => ({ ...current, installment_no: event.target.value }))} /></Field><Field label="To‘lov sanasi"><input type="date" value={installment.due_date} onChange={(event) => setInstallment((current) => ({ ...current, due_date: event.target.value }))} /></Field><Field label="Summa"><input type="number" min="0.01" value={installment.amount} onChange={(event) => setInstallment((current) => ({ ...current, amount: event.target.value }))} /></Field></div>
          <div className="inst-row-actions"><ActionButton secondary onClick={() => setInstallmentTarget(null)}>Bekor qilish</ActionButton><ActionButton busy={busy} onClick={addInstallment}>Tekshirdim — qo‘shish</ActionButton></div>
        </div>
      )}
      <ResourceList
        resource={active}
        emptyTitle={tab === "contracts" ? "Kontrakt yo‘q" : "Qarzdorlik yo‘q"}
        emptyText="Server faqat ruxsat doirasidagi moliyaviy yozuvlarni ko‘rsatadi."
        renderMeta={(item) => [item.student_name || item.student_number, item.contract_no, formatMoney(item.total_amount ?? item.debt_amount ?? item.debt ?? item.balance, item.currency || "UZS"), item.due_date ? `muddat ${formatDate(item.due_date)}` : null].filter(Boolean).join(" · ")}
        actions={(item) => tab === "contracts" && canManage ? <ActionButton secondary onClick={() => setInstallmentTarget(item)}>Bo‘lib to‘lash</ActionButton> : null}
      />
    </section>
  );
}

function AnalyticsPanel({ apiBase, token, contextId, permissions }) {
  const allowed = hasPermission(permissions, "analytics.view");
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    if (!allowed) return;
    setBusy(true);
    setError("");
    try {
      const next = await instituteApi(instituteRoutes.analyticsSummary, { apiBase, token, contextId });
      setData(next);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }, [allowed, apiBase, contextId, token]);
  useEffect(() => { load(); }, [load]);
  if (!allowed) return <EmptyState icon={ShieldCheck} title="Ruxsat yo‘q" text="Analitikani ko‘rish uchun server ruxsati kerak." />;
  if (busy && !data) return <LoadingBlock text="Analitika hisoboti yuklanmoqda..." />;
  const summary = data?.summary || data || {};
  const averageLabel = summary.average_gpa != null ? "O‘rtacha GPA" : "O‘rtacha natija";
  const averageValue = summary.average_gpa != null
    ? summary.average_gpa
    : summary.average_percent != null
      ? `${Number(summary.average_percent).toFixed(1)}%`
      : null;
  const metrics = [
    ["Talabalar", summary.students ?? summary.active_students],
    ["Fan guruhlari", summary.sections ?? summary.active_sections],
    ["O‘rtacha davomat", summary.attendance_percent != null ? `${Number(summary.attendance_percent).toFixed(1)}%` : null],
    [averageLabel, averageValue],
    ["Uzrsiz qoldirilgan daqiqa", summary.unexcused_minutes],
    ["Yig‘ilgan to‘lov", summary.paid_amount != null ? formatMoney(summary.paid_amount, summary.currency || "UZS") : null],
    ["Qarzdorlik", (summary.debt_amount ?? summary.debt) != null ? formatMoney(summary.debt_amount ?? summary.debt, summary.currency || "UZS") : null],
  ];
  return (
    <section>
      <div className="inst-module-toolbar"><div><h3>Institut analitikasi</h3><p>Faqat serverda hisoblangan va rol doirasida filtrlab qaytarilgan ko‘rsatkichlar.</p></div><ActionButton secondary busy={busy} onClick={load}><RefreshCw size={15} /> Yangilash</ActionButton></div>
      <ErrorNotice error={error} onRetry={load} />
      <div className="inst-metric-grid">{metrics.map(([label, value]) => <article key={label}><span><BarChart3 size={19} /></span><b>{value ?? "—"}</b><small>{label}</small></article>)}</div>
      <div className="inst-two-columns">
        <article className="inst-card"><h3>Akademik ko‘rsatkichlar</h3><p className="inst-muted">{summary.academic_note || "GPA faqat yakunlangan fan natijalari va kreditlar bilan hisoblanadi."}</p></article>
        <article className="inst-card"><h3>Doira</h3><p className="inst-muted">{summary.scope_label || "Ko‘rsatilgan sonlar server bergan fakultet/kafedra doirasidan tashqariga chiqmaydi."}</p></article>
      </div>
    </section>
  );
}

function StaffPanel({ apiBase, token, contextId, permissions }) {
  const canManageStaff = canWrite(permissions, "staff");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ user_id: "", role_key: "lecturer", campus_id: "", faculty_id: "", department_id: "" });
  const staff = usePagedResource({ apiBase, token, contextId, path: instituteRoutes.staff });
  const campuses = usePagedResource({ apiBase, token, contextId, path: instituteRoutes.campuses, enabled: open });
  const faculties = usePagedResource({ apiBase, token, contextId, path: instituteRoutes.faculties, enabled: open });
  const departments = usePagedResource({ apiBase, token, contextId, path: instituteRoutes.departments, enabled: open });

  const assign = async () => {
    if (!form.user_id || !INSTITUTE_ROLES[form.role_key]) {
      setError("Foydalanuvchi ID va rolni tanlang.");
      return;
    }
    if (!askHuman(`${INSTITUTE_ROLES[form.role_key]} rolini va uning kampus/fakultet/kafedra doirasini tekshirdingizmi?`)) return;
    setBusy(true);
    setError("");
    try {
      await instituteApi(instituteRoutes.staff, {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canManageStaff,
        idempotencyKey: makeIdempotencyKey("institute-staff", [contextId, form.user_id, form.role_key, form.campus_id, form.faculty_id, form.department_id]),
        body: {
          user_id: Number(form.user_id),
          role_key: form.role_key,
          campus_id: form.campus_id ? Number(form.campus_id) : undefined,
          faculty_id: form.faculty_id ? Number(form.faculty_id) : undefined,
          department_id: form.department_id ? Number(form.department_id) : undefined,
          confirmation: true,
        },
      });
      setOpen(false);
      await staff.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const endAssignment = async (item) => {
    const reason = globalThis.prompt?.(
      `${item.full_name || "Xodim"} vakolatini tugatish sababini yozing:`,
      "Mehnat munosabati tugadi",
    );
    if (reason == null) return;
    if (reason.trim().length < 3) {
      setError("Vakolatni tugatish sababini kamida 3 belgi bilan yozing.");
      return;
    }
    if (!askHuman(`${item.full_name || "Xodim"} uchun “${INSTITUTE_ROLES[item.role_key] || item.role_key}” vakolatini tugatishni tasdiqlaysizmi?`)) return;
    setBusy(true);
    setError("");
    try {
      await instituteApi(instituteRoutes.staffEnd(item.id), {
        apiBase,
        token,
        contextId,
        method: "POST",
        allowed: canManageStaff,
        body: {
          context_id: contextId,
          confirmation: true,
          reason: reason.trim(),
        },
      });
      await staff.reload();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <div className="inst-module-toolbar"><div><h3>Xodimlar va vakolat doirasi</h3><p>Har bir rol butun institut, kampus, fakultet yoki kafedra doirasida beriladi.</p></div>{canManageStaff && <ActionButton onClick={() => setOpen((value) => !value)}><UserPlus size={15} /> Rol biriktirish</ActionButton>}</div>
      <InfoNotice tone="warning">AI avatar rol bermaydi. Vakolat faqat server ruxsati va mas’ul insonning aniq tasdig‘i bilan biriktiriladi.</InfoNotice>
      <ErrorNotice error={error || staff.error} onRetry={staff.reload} />
      {open && canManageStaff && (
        <div className="inst-card inst-form-card compact">
          <h3>Xodimga rol biriktirish</h3>
          <div className="inst-form-grid">
            <Field label="Foydalanuvchi ID"><input type="number" min="1" value={form.user_id} onChange={(event) => setForm((current) => ({ ...current, user_id: event.target.value }))} /></Field>
            <Field label="Rol"><select value={form.role_key} onChange={(event) => setForm((current) => ({ ...current, role_key: event.target.value }))}>{Object.entries(INSTITUTE_ROLES).filter(([role]) => role !== "student").map(([role, label]) => <option key={role} value={role}>{label}</option>)}</select></Field>
            <Field label="Kampus doirasi"><select value={form.campus_id} onChange={(event) => setForm((current) => ({ ...current, campus_id: event.target.value }))}><option value="">Butun institut / belgilanmagan</option>{campuses.items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
            <Field label="Fakultet doirasi"><select value={form.faculty_id} onChange={(event) => setForm((current) => ({ ...current, faculty_id: event.target.value }))}><option value="">Belgilanmagan</option>{faculties.items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
            <Field label="Kafedra doirasi"><select value={form.department_id} onChange={(event) => setForm((current) => ({ ...current, department_id: event.target.value }))}><option value="">Belgilanmagan</option>{departments.items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
          </div>
          <SelectorPagination resources={[["Kampuslar", campuses], ["Fakultetlar", faculties], ["Kafedralar", departments]]} />
          <div className="inst-row-actions"><ActionButton secondary onClick={() => setOpen(false)}>Bekor qilish</ActionButton><ActionButton busy={busy} onClick={assign}>Tekshirdim — rol berish</ActionButton></div>
        </div>
      )}
      <ResourceList
        resource={staff}
        emptyTitle="Xodim topilmadi"
        emptyText="Institut xodimlari shu yerda ko‘rinadi."
        renderMeta={(item) => [INSTITUTE_ROLES[item.role_key] || item.role_label || item.role_key, item.campus_name, item.faculty_name, item.department_name, item.status === "ended" ? "Vakolati tugagan" : null].filter(Boolean).join(" · ")}
        actions={(item) => canManageStaff && item.status === "active" && item.role_key !== "owner" ? (
          <ActionButton danger busy={busy} onClick={() => endAssignment(item)}>Vakolatni tugatish</ActionButton>
        ) : null}
      />
    </section>
  );
}

function SettingsPanel({ apiBase, token, contextId, permissions, institute, preferences, onPreferences }) {
  const canManageTerms = canWrite(permissions, "terms");
  const [tab, setTab] = useState("calendar");
  const [open, setOpen] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const yearNow = currentAcademicYear().split("-").map(Number);
  const [yearForm, setYearForm] = useState({ code: currentAcademicYear(), starts_on: `${yearNow[0]}-09-01`, ends_on: `${yearNow[1]}-06-30` });
  const [termForm, setTermForm] = useState({ academic_year_id: "", term_no: "1", term_type: "semester", name: "1-semestr", starts_on: `${yearNow[0]}-09-01`, ends_on: `${yearNow[0]}-12-31`, registration_opens_at: "", registration_closes_at: "", change_deadline: "" });
  const years = usePagedResource({ apiBase, token, contextId, path: instituteRoutes.academicYears, enabled: tab === "calendar" });
  const terms = usePagedResource({ apiBase, token, contextId, path: instituteRoutes.terms, enabled: tab === "calendar" });

  const createYear = async () => {
    if (!yearForm.code.trim() || !yearForm.starts_on || !yearForm.ends_on) return setError("O‘quv yili kodi va sanalarini kiriting.");
    setBusy(true); setError("");
    try {
      await instituteApi(instituteRoutes.academicYears, { apiBase, token, contextId, method: "POST", allowed: canManageTerms, body: buildAcademicYearPayload(yearForm) });
      setOpen(""); await years.reload();
    } catch (requestError) { setError(requestError.message); } finally { setBusy(false); }
  };
  const createTerm = async () => {
    if (!termForm.academic_year_id || !termForm.name.trim() || !termForm.starts_on || !termForm.ends_on) return setError("O‘quv yili, davr nomi va sanalarini kiriting.");
    setBusy(true); setError("");
    try {
      await instituteApi(instituteRoutes.terms, { apiBase, token, contextId, method: "POST", allowed: canManageTerms, body: buildTermPayload(termForm) });
      setOpen(""); await terms.reload();
    } catch (requestError) { setError(requestError.message); } finally { setBusy(false); }
  };
  const setTermStatus = async (item, status) => {
    if (!canManageTerms || !askHuman(`${item.name || "Davr"} holatini “${STATUS_LABELS[status] || status}”ga o‘tkazishni tasdiqlaysizmi?`)) return;
    setBusy(true); setError("");
    try {
      await instituteApi(instituteRoutes.termStatus(item.id), { apiBase, token, contextId, method: "POST", allowed: canManageTerms, body: { status, confirmation: true } });
      await terms.reload();
    } catch (requestError) { setError(requestError.message); } finally { setBusy(false); }
  };

  return (
    <section>
      <div className="inst-module-toolbar"><div><h3>Institut sozlamalari</h3><p>Akademik taqvim, siyosat versiyasi va AI yordamchi ko‘rinishi.</p></div></div>
      <div className="inst-tabs" role="tablist"><button type="button" role="tab" aria-selected={tab === "calendar"} className={tab === "calendar" ? "active" : ""} onClick={() => setTab("calendar")}>Akademik taqvim</button><button type="button" role="tab" aria-selected={tab === "policy"} className={tab === "policy" ? "active" : ""} onClick={() => setTab("policy")}>Siyosat</button><button type="button" role="tab" aria-selected={tab === "avatar"} className={tab === "avatar" ? "active" : ""} onClick={() => setTab("avatar")}>AI yordamchi</button></div>
      <ErrorNotice error={error} />
      {tab === "calendar" && <>
        <div className="inst-module-toolbar compact"><div><h3>O‘quv yillari va davrlar</h3></div>{canManageTerms && <div className="inst-row-actions"><ActionButton secondary onClick={() => setOpen("year")}>O‘quv yili</ActionButton><ActionButton onClick={() => setOpen("term")}>Davr qo‘shish</ActionButton></div>}</div>
        {open === "year" && <div className="inst-card inst-form-card compact"><h3>Yangi o‘quv yili</h3><div className="inst-form-grid"><Field label="Kodi"><input value={yearForm.code} onChange={(event) => setYearForm((current) => ({ ...current, code: event.target.value }))} /></Field><Field label="Boshlanish"><input type="date" value={yearForm.starts_on} onChange={(event) => setYearForm((current) => ({ ...current, starts_on: event.target.value }))} /></Field><Field label="Tugash"><input type="date" value={yearForm.ends_on} onChange={(event) => setYearForm((current) => ({ ...current, ends_on: event.target.value }))} /></Field></div><div className="inst-row-actions"><ActionButton secondary onClick={() => setOpen("")}>Bekor qilish</ActionButton><ActionButton busy={busy} onClick={createYear}>Saqlash</ActionButton></div></div>}
        {open === "term" && (
          <div className="inst-card inst-form-card compact">
            <h3>Yangi akademik davr</h3>
            <div className="inst-form-grid">
              <Field label="O‘quv yili"><select value={termForm.academic_year_id} onChange={(event) => setTermForm((current) => ({ ...current, academic_year_id: event.target.value }))}><option value="">Tanlang</option>{years.items.map((item) => <option key={item.id} value={item.id}>{item.code}</option>)}</select></Field>
              <Field label="Davr raqami"><input type="number" min="1" value={termForm.term_no} onChange={(event) => setTermForm((current) => ({ ...current, term_no: event.target.value }))} /></Field>
              <Field label="Turi"><select value={termForm.term_type} onChange={(event) => setTermForm((current) => ({ ...current, term_type: event.target.value }))}><option value="semester">Semestr</option><option value="trimester">Trimestr</option><option value="quarter">Chorak</option><option value="summer">Yozgi davr</option><option value="custom">Boshqa</option></select></Field>
              <Field label="Nomi"><input value={termForm.name} onChange={(event) => setTermForm((current) => ({ ...current, name: event.target.value }))} /></Field>
              <Field label="Boshlanish"><input type="date" value={termForm.starts_on} onChange={(event) => setTermForm((current) => ({ ...current, starts_on: event.target.value }))} /></Field>
              <Field label="Tugash"><input type="date" value={termForm.ends_on} onChange={(event) => setTermForm((current) => ({ ...current, ends_on: event.target.value }))} /></Field>
              <Field label="Fan tanlash ochiladi"><input type="datetime-local" value={termForm.registration_opens_at} onChange={(event) => setTermForm((current) => ({ ...current, registration_opens_at: event.target.value }))} /></Field>
              <Field label="Fan tanlash yopiladi"><input type="datetime-local" value={termForm.registration_closes_at} onChange={(event) => setTermForm((current) => ({ ...current, registration_closes_at: event.target.value }))} /></Field>
              <Field label="O‘zgartirish muddati"><input type="datetime-local" value={termForm.change_deadline} onChange={(event) => setTermForm((current) => ({ ...current, change_deadline: event.target.value }))} /></Field>
            </div>
            <LoadMore resource={years} />
            <div className="inst-row-actions"><ActionButton secondary onClick={() => setOpen("")}>Bekor qilish</ActionButton><ActionButton busy={busy} onClick={createTerm}>Saqlash</ActionButton></div>
          </div>
        )}
        <div className="inst-two-columns"><article className="inst-card"><h3>O‘quv yillari</h3><ResourceList resource={years} emptyTitle="O‘quv yili yo‘q" emptyText="Birinchi o‘quv yilini yarating." renderMeta={(item) => `${formatDate(item.starts_on)} — ${formatDate(item.ends_on)}`} /></article><article className="inst-card"><h3>Davrlar</h3><ResourceList resource={terms} emptyTitle="Davr yo‘q" emptyText="Semestr yoki boshqa davrni yarating." renderMeta={(item) => `${formatDate(item.starts_on)} — ${formatDate(item.ends_on)}`} actions={(item) => canManageTerms ? <div className="inst-row-actions">{item.status === "planned" && <ActionButton secondary busy={busy} onClick={() => setTermStatus(item, "registration")}>Fan tanlashni ochish</ActionButton>}{["registration", "planned"].includes(item.status) && <ActionButton busy={busy} onClick={() => setTermStatus(item, "active")}>Faollashtirish</ActionButton>}{item.status === "active" && <ActionButton busy={busy} onClick={() => setTermStatus(item, "grade_entry")}>Baho davri</ActionButton>}{item.status === "grade_entry" && <ActionButton danger busy={busy} onClick={() => setTermStatus(item, "closed")}>Yopish</ActionButton>}</div> : null} /></article></div>
      </>}
      {tab === "policy" && <div className="inst-two-columns"><article className="inst-card"><h3>Joriy siyosat</h3><dl className="inst-data-list"><div><dt>Baholash</dt><dd>{institute.grading_system || institute.policy?.grading_system || "Server siyosati"}</dd></div><div><dt>Versiya</dt><dd>{institute.policy_version || institute.policy?.version || "—"}</dd></div><div><dt>OTM turi</dt><dd>{institute.institution_type || "—"}</dd></div><div><dt>Mulkchilik</dt><dd>{institute.ownership_type || "—"}</dd></div></dl></article><article className="inst-card"><h3>Qoidalar</h3><p className="inst-muted">Kredit soati, GPA chegarasi va taqvim barcha OTMga bitta qat’iy qiymat emas. Har bir o‘zgarish yangi siyosat versiyasi va vakolatli tasdiq bilan kiritiladi.</p></article></div>}
      {tab === "avatar" && <div className="inst-card inst-form-card compact"><h3>AI yordamchi ko‘rinishi</h3><div className="inst-form-grid"><Field label="Avatar"><select value={preferences.variant} onChange={(event) => onPreferences({ variant: event.target.value })}><option value="female">Ayol avatar</option><option value="male">Erkak avatar</option><option value="neutral">Neytral avatar</option></select></Field><label className="inst-toggle"><input type="checkbox" checked={preferences.enabled} onChange={(event) => onPreferences({ enabled: event.target.checked })} /><span>AI yordamchini ko‘rsatish</span></label><label className="inst-toggle"><input type="checkbox" checked={preferences.speechEnabled} onChange={(event) => onPreferences({ speechEnabled: event.target.checked })} /><span>Ovozli tushuntirish</span></label></div><InfoNotice>Avatar menyuni ko‘rsatadi va qoralama maydonini tushuntiradi; baho, to‘lov, rol, buyruq yoki transkriptni tasdiqlamaydi.</InfoNotice></div>}
    </section>
  );
}
