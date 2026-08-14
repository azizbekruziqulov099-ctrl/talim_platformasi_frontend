import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Brain,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flame,
  Layers3,
  Loader2,
  RefreshCw,
  Search,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "https://talimplatformasi-production.up.railway.app";

const CONTEXT_META = {
  platform: { label: "DTS", emoji: "📚", color: "#1B4B7A", soft: "#EAF1F7" },
  school: { label: "Maktab DTS", emoji: "🏫", color: "#1B4B7A", soft: "#EAF1F7" },
  learning_center: { label: "O'quv markazi", emoji: "🎓", color: "#28735A", soft: "#E7F4EE" },
  club_offline: { label: "To'garak", emoji: "🧩", color: "#8A5A1C", soft: "#FDF3E0" },
  club_online: { label: "Online to'garak", emoji: "💻", color: "#5B63A9", soft: "#EFEEFB" },
  club_ai: { label: "AI to'garak", emoji: "🤖", color: "#8B5FBF", soft: "#F3EEFA" },
  kindergarten: { label: "Bog'cha", emoji: "🧸", color: "#A8527A", soft: "#F9EAF1" },
  university: { label: "Universitet", emoji: "🎓", color: "#2D6E8B", soft: "#E8F2F6" },
  personal: { label: "Mustaqil", emoji: "🌱", color: "#6E8B4A", soft: "#EEF4E7" },
};

const EVENT_LABELS = {
  test_attempt: "Test",
  ai_lesson_interaction: "AI dars",
  content_completed: "Kontent tugatildi",
  teacher_grade: "O'qituvchi bahosi",
  written_work: "Yozma ish",
  legacy_skill_snapshot: "Eski natija",
  legacy_topic_result: "Bot natijasi",
};

const EVIDENCE_LABELS = {
  self: "O'zi ishlagan",
  teacher: "O'qituvchi bergan",
  parent: "Ota-ona bergan",
  ai_tutor: "AI ustoz",
  admin: "Admin",
  legacy: "Eski tizim",
  system: "Tizim",
};

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function number(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function dateLabel(value) {
  if (!value) return "Hali faoliyat yo'q";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function contextMeta(type) {
  return CONTEXT_META[type] || {
    label: "Boshqa muhit",
    emoji: "📍",
    color: "#5A5648",
    soft: "#F1EFE9",
  };
}

function LoadingCard({ text = "Tahlil yuklanmoqda..." }) {
  return (
    <div className="rounded-2xl bg-white border p-8 text-center" style={{ borderColor: "#E5E1D8" }}>
      <Loader2 className="animate-spin mx-auto mb-3" size={28} style={{ color: "#1B4B7A" }} />
      <p className="text-sm" style={{ color: "#8A8578" }}>{text}</p>
    </div>
  );
}

function ErrorCard({ message, onRetry }) {
  return (
    <div className="rounded-2xl bg-white border p-5" style={{ borderColor: "#E8C8C2" }}>
      <div className="flex items-start gap-3">
        <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#FCEBEB" }}>
          <AlertTriangle size={19} style={{ color: "#A32D2D" }} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold" style={{ color: "#2B2B2B" }}>Analitika ochilmadi</p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: "#6F6859" }}>{message}</p>
          {onRetry && (
            <button onClick={onRetry} className="mt-3 px-3 py-2 rounded-xl text-xs font-semibold border"
              style={{ borderColor: "#D8D3C7", color: "#1B4B7A", backgroundColor: "#fff" }}>
              Qayta urinish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, suffix, tone = "#1B4B7A", soft = "#EAF1F7", note }) {
  return (
    <div className="rounded-2xl bg-white border p-3.5 min-w-0" style={{ borderColor: "#E5E1D8" }}>
      <div className="flex items-center justify-between gap-2">
        <span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: soft }}>
          <Icon size={16} style={{ color: tone }} />
        </span>
        {note && <span className="text-[10px] truncate" style={{ color: "#8A8578" }}>{note}</span>}
      </div>
      <p className="mt-3 text-[11px] font-medium truncate" style={{ color: "#8A8578" }}>{label}</p>
      <p className="mt-0.5 text-xl font-bold tabular-nums" style={{ color: "#2B2B2B" }}>
        {value}<span className="text-xs font-semibold ml-0.5" style={{ color: "#8A8578" }}>{suffix}</span>
      </p>
    </div>
  );
}

function ScoreBar({ value, color = "#1B4B7A", height = 7 }) {
  const safe = Math.max(0, Math.min(100, number(value)));
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height, backgroundColor: "#ECE9E1" }}>
      <div className="h-full rounded-full transition-all" style={{ width: `${safe}%`, backgroundColor: color }} />
    </div>
  );
}

function TrendChart({ points = [], color = "#1B4B7A" }) {
  const clean = points.filter((p) => Number.isFinite(Number(p.score)));
  if (clean.length < 2) {
    return (
      <div className="h-32 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#FAF8F2" }}>
        <p className="text-xs" style={{ color: "#8A8578" }}>Trend uchun kamida 2 kunlik natija kerak</p>
      </div>
    );
  }
  const width = 620;
  const height = 180;
  const padX = 24;
  const padY = 20;
  const xStep = (width - padX * 2) / Math.max(1, clean.length - 1);
  const coords = clean.map((p, i) => ({
    x: padX + i * xStep,
    y: height - padY - (Math.max(0, Math.min(100, Number(p.score))) / 100) * (height - padY * 2),
  }));
  const line = coords.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${padX},${height - padY} ${line} ${coords.at(-1).x},${height - padY}`;
  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36" role="img" aria-label="Natija trendi">
        {[25, 50, 75].map((v) => {
          const y = height - padY - (v / 100) * (height - padY * 2);
          return <line key={v} x1={padX} y1={y} x2={width - padX} y2={y} stroke="#E7E3D9" strokeDasharray="5 7" />;
        })}
        <polygon points={area} fill={color} opacity="0.08" />
        <polyline points={line} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {coords.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4.5" fill="#fff" stroke={color} strokeWidth="3" />
        ))}
      </svg>
      <div className="flex justify-between gap-2 -mt-1">
        <span className="text-[10px]" style={{ color: "#8A8578" }}>{clean[0]?.date}</span>
        <span className="text-[10px]" style={{ color: "#8A8578" }}>{clean.at(-1)?.date}</span>
      </div>
    </div>
  );
}

function ContextTabs({ contexts = [], selected, onSelect, accent = "#1B4B7A" }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
      <button onClick={() => onSelect(null)}
        className="shrink-0 px-3.5 py-2.5 rounded-xl text-xs font-semibold border"
        style={selected == null
          ? { backgroundColor: accent, borderColor: accent, color: "#fff" }
          : { backgroundColor: "#fff", borderColor: "#E5E1D8", color: "#5A5648" }}>
        ✨ Umumiy
      </button>
      {contexts.map((c) => {
        const meta = contextMeta(c.type);
        const active = Number(selected) === Number(c.id);
        return (
          <button key={c.id} onClick={() => onSelect(c.id)}
            className="shrink-0 px-3.5 py-2.5 rounded-xl text-xs font-semibold border whitespace-nowrap"
            style={active
              ? { backgroundColor: meta.color, borderColor: meta.color, color: "#fff" }
              : { backgroundColor: "#fff", borderColor: "#E5E1D8", color: "#5A5648" }}>
            {meta.emoji} {c.name || meta.label}
          </button>
        );
      })}
    </div>
  );
}

function LegacyFallback({ data }) {
  if (!data) return null;
  return (
    <div className="rounded-2xl bg-white border p-5" style={{ borderColor: "#E5E1D8" }}>
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#8A8578" }}>Eski umumiy natija</p>
      <p className="text-4xl font-bold mt-2" style={{ color: "#1B4B7A" }}>{number(data.umumiy_foiz)}%</p>
      <p className="text-xs mt-2" style={{ color: "#8A8578" }}>
        Yangi migratsiya ishga tushgach maktab, markaz va AI natijalari alohida ko'rinadi.
      </p>
    </div>
  );
}

const PATH_STATE_META = {
  upcoming: { label: "Oldinda", color: "#6F6859", soft: "#F1EFE9", icon: "○" },
  current: { label: "Shu hafta", color: "#1B4B7A", soft: "#EAF1F7", icon: "●" },
  expected: { label: "Reja vaqti o'tgan", color: "#8A5A1C", soft: "#FDF3E0", icon: "◷" },
  taught: { label: "O'tildi", color: "#28735A", soft: "#E7F4EE", icon: "✓" },
  delayed: { label: "Kechiktirilgan", color: "#A32D2D", soft: "#FCEBEB", icon: "!" },
  skipped: { label: "Rejadan chiqarilgan", color: "#6F6859", soft: "#F1EFE9", icon: "–" },
};

const KNOWLEDGE_META = {
  unknown: { color: "#6F6859", soft: "#F1EFE9" },
  beginner: { color: "#A32D2D", soft: "#FCEBEB" },
  developing: { color: "#8A5A1C", soft: "#FDF3E0" },
  good: { color: "#1B4B7A", soft: "#EAF1F7" },
  strong: { color: "#28735A", soft: "#E7F4EE" },
};

function shortDate(value) {
  if (!value) return "Sana belgilanmagan";
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("uz-UZ", { day: "numeric", month: "short" }).format(d);
}

function PathMetric({ icon: Icon, label, value, note, color, soft }) {
  return (
    <div className="rounded-2xl border bg-white p-3.5" style={{ borderColor: "#E5E1D8" }}>
      <span className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ color, backgroundColor: soft }}>
        <Icon size={16} />
      </span>
      <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "#8A8578" }}>{label}</p>
      <p className="text-2xl font-bold mt-0.5" style={{ color: "#2B2B2B" }}>{value}</p>
      <p className="text-[10px] mt-1 leading-relaxed" style={{ color: "#8A8578" }}>{note}</p>
    </div>
  );
}

function LearningTopicCard({ topic, isCurrent }) {
  const teaching = PATH_STATE_META[topic.teaching_state?.key] || PATH_STATE_META.upcoming;
  const knowledge = KNOWLEDGE_META[topic.knowledge_status] || KNOWLEDGE_META.unknown;
  return (
    <article className="relative rounded-2xl border bg-white p-4" style={{ borderColor: isCurrent ? "#1B4B7A" : "#E5E1D8", borderWidth: isCurrent ? 2 : 1 }}>
      {isCurrent && (
        <span className="absolute -top-2.5 left-4 px-2.5 py-1 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: "#1B4B7A" }}>
          Siz hozir shu yerdasiz
        </span>
      )}
      <div className={cx("flex items-start gap-3", isCurrent && "pt-1")}>
        <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold" style={{ color: teaching.color, backgroundColor: teaching.soft }}>
          {teaching.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-snug" style={{ color: "#2B2B2B" }}>{topic.topic_name}</p>
          <p className="text-[10px] mt-1" style={{ color: "#8A8578" }}>
            {topic.term_no}-chorak · {topic.week_no}-hafta · {shortDate(topic.planned_start)}–{shortDate(topic.planned_end)}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="rounded-xl p-2.5" style={{ backgroundColor: teaching.soft }}>
          <p className="text-[9px] uppercase font-semibold" style={{ color: teaching.color }}>Dars holati</p>
          <p className="text-[11px] font-semibold mt-0.5 leading-snug" style={{ color: teaching.color }}>{topic.teaching_state?.label || teaching.label}</p>
        </div>
        <div className="rounded-xl p-2.5" style={{ backgroundColor: knowledge.soft }}>
          <p className="text-[9px] uppercase font-semibold" style={{ color: knowledge.color }}>Bilim dalili</p>
          <p className="text-[11px] font-semibold mt-0.5 leading-snug" style={{ color: knowledge.color }}>
            {topic.knowledge_score == null ? "Bilim darajasi noma'lum" : `${topic.knowledge_label} · ${Math.round(number(topic.knowledge_score))}%`}
          </p>
        </div>
      </div>
      {topic.knowledge_score == null ? (
        <div className="mt-2.5 rounded-xl px-3 py-2.5 text-[11px] leading-relaxed" style={{ backgroundColor: "#FAF8F2", color: "#6F6859" }}>
          Dars sanasi o'tgani bilim isboti emas. {topic.can_take_test ? "Test bo'limida shu mavzu bo'yicha bilimingizni tekshirishingiz mumkin." : "Bu mavzu uchun test yoki o'qituvchi bahosi hali yo'q."}
        </div>
      ) : topic.memory ? (
        <div className="mt-2.5 flex items-center justify-between gap-3 rounded-xl px-3 py-2.5" style={{ backgroundColor: "#FAF8F2" }}>
          <span className="text-[11px]" style={{ color: "#5A5648" }}>{topic.memory.memory_status_label}</span>
          <span className="text-[10px] font-semibold" style={{ color: "#8A8578" }}>{topic.memory.forgetting_probability}% xavf</span>
        </div>
      ) : null}
    </article>
  );
}

function LearningSubjectPathPage({ data, subject, term, setTerm, accent, onBack }) {
  const subjectTopics = (data?.topics || []).filter((topic) => topic.subject === subject);
  const termTopics = subjectTopics.filter((topic) => Number(topic.term_no) === Number(term));
  const groupedWeeks = termTopics.reduce((acc, topic) => {
    const key = Number(topic.week_no) || 1;
    if (!acc[key]) acc[key] = [];
    acc[key].push(topic);
    return acc;
  }, {});
  const subjectSummary = data?.subjects?.find((item) => item.name === subject);
  const currentCode = subjectSummary?.current_topic_code;
  const foundIndex = subjectTopics.findIndex((topic) => topic.topic_code === currentCode);
  const currentIndex = foundIndex >= 0 ? foundIndex : 0;
  const routePosition = subjectTopics.length ? {
    previous: currentIndex > 0 ? subjectTopics[currentIndex - 1] : null,
    current: subjectTopics[currentIndex] || null,
    next: currentIndex + 1 < subjectTopics.length ? subjectTopics[currentIndex + 1] : null,
  } : null;
  const olympiad = subjectSummary?.olympiad;
  const isOlympiad = data?.path_type === "olympiad";

  return (
    <div className="px-5 pb-6 space-y-4">
      <section className="rounded-3xl p-5" style={{ background: `linear-gradient(135deg, ${isOlympiad ? "#8A5A1C" : accent}, #173A5B)`, color: "#fff" }}>
        <button onClick={onBack} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold mb-4"
          style={{ backgroundColor: "rgba(255,255,255,.14)", color: "#fff" }}>
          <ChevronLeft size={15} /> Fanlar ro'yxatiga qaytish
        </button>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "#D7E2EA" }}>
          {isOlympiad ? "Olimpiada ta'lim yo'li" : "Fan ta'lim yo'li"}
        </p>
        <h2 className="text-2xl font-bold mt-1">{subject}</h2>
        <p className="text-xs mt-2" style={{ color: "#D7E2EA" }}>
          {data?.selected_grade}-sinf · {data?.academic_year} · {subjectTopics.length} mavzu
        </p>
      </section>

      {isOlympiad && (
        <section className="rounded-2xl border bg-white p-4" style={{ borderColor: "#E5E1D8" }}>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-sm font-bold" style={{ color: "#2B2B2B" }}>4 manbali tayyorgarlik bahosi</p>
              <p className="text-[10px] mt-0.5" style={{ color: "#8A8578" }}>Yo'q dalil bilim deb taxmin qilinmaydi</p>
            </div>
            <span className="text-xl font-bold" style={{ color: "#8A5A1C" }}>
              {olympiad?.confirmed_readiness_percent == null ? "—" : `${number(olympiad.confirmed_readiness_percent)}%`}
            </span>
          </div>
          <div className="space-y-2.5">
            {(olympiad?.components || []).map((component) => (
              <div key={component.key} className="rounded-xl p-3" style={{ backgroundColor: component.has_evidence ? "#FFF8E7" : "#F1EFE9" }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold" style={{ color: "#3D392F" }}>{component.label}</p>
                    <p className="text-[10px] mt-0.5 leading-relaxed" style={{ color: "#8A8578" }}>{component.description}</p>
                  </div>
                  <span className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ backgroundColor: "#fff", color: "#8A5A1C" }}>
                    {component.weight}% ulush
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-[10px] font-semibold" style={{ color: component.has_evidence ? "#28735A" : "#8A8578" }}>
                    {component.has_evidence ? `${number(component.score)}% natija · ${number(component.earned_points)} ball` : "Hali baholanmagan"}
                  </span>
                  <span className="text-[10px]" style={{ color: "#8A8578" }}>{number(component.evidence_count)} dalil</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-xl px-3 py-2.5 text-[11px]" style={{ backgroundColor: "#FAF8F2", color: "#6F6859" }}>
            {olympiad?.label || "Hali baholanmagan"} · dalil qamrovi {number(olympiad?.evidence_coverage_percent)}%
          </div>
        </section>
      )}

      <section className="rounded-2xl border bg-white p-4" style={{ borderColor: "#E5E1D8" }}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-[10px] uppercase font-semibold" style={{ color: "#8A8578" }}>Yillik yo'l</p>
            <h3 className="text-lg font-bold" style={{ color: "#2B2B2B" }}>Chorak va haftalar</h3>
          </div>
          <span className="text-[10px] rounded-full px-2.5 py-1" style={{ backgroundColor: "#F1EFE9", color: "#6F6859" }}>{subjectTopics.length} mavzu</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {[1, 2, 3, 4].map((q) => {
            const count = subjectTopics.filter((topic) => Number(topic.term_no) === q).length;
            return (
              <button key={q} onClick={() => setTerm(q)} className="rounded-xl py-2 text-xs font-semibold"
                style={Number(term) === q ? { backgroundColor: accent, color: "#fff" } : { backgroundColor: "#F1EFE9", color: "#5A5648" }}>
                {q}-chorak<span className="block text-[9px] opacity-70">{count} mavzu</span>
              </button>
            );
          })}
        </div>
      </section>

      {routePosition && (
        <section className="grid grid-cols-3 gap-2">
          {[
            ["Oldingi", routePosition.previous, "#F1EFE9", "#6F6859"],
            ["Hozir", routePosition.current, "#EAF1F7", "#1B4B7A"],
            ["Keyingi", routePosition.next, "#E7F4EE", "#28735A"],
          ].map(([label, topic, soft, color]) => (
            <div key={label} className="rounded-xl p-2.5 min-w-0" style={{ backgroundColor: soft }}>
              <p className="text-[9px] font-bold uppercase" style={{ color }}>{label}</p>
              <p className="text-[10px] font-semibold mt-1 leading-snug line-clamp-2" style={{ color: "#3D392F" }}>{topic?.topic_name || "—"}</p>
            </div>
          ))}
        </section>
      )}

      <section className="space-y-4">
        {Object.keys(groupedWeeks).length === 0 ? (
          <p className="text-xs text-center py-5" style={{ color: "#8A8578" }}>Bu chorakda mavzu yo'q.</p>
        ) : Object.entries(groupedWeeks).map(([week, topics]) => (
          <div key={week}>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: "#EEEAE1", color: "#5A5648" }}>{week}</span>
              <p className="text-xs font-bold" style={{ color: "#3D392F" }}>{week}-hafta</p>
              <span className="text-[10px]" style={{ color: "#8A8578" }}>{shortDate(topics[0]?.planned_start)}–{shortDate(topics[0]?.planned_end)}</span>
              <div className="h-px flex-1" style={{ backgroundColor: "#E5E1D8" }} />
            </div>
            <div className="space-y-2.5 pl-3 border-l-2" style={{ borderColor: "#E5E1D8" }}>
              {topics.map((topic) => <LearningTopicCard key={topic.topic_code} topic={topic} isCurrent={topic.topic_code === currentCode} />)}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export function StudentLearningPathDashboard({
  token,
  studentId = null,
  viewer = "student",
  accent = "#1B4B7A",
}) {
  const [contextId, setContextId] = useState(null);
  const [groupId, setGroupId] = useState(null);
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [term, setTerm] = useState(1);
  const [pathMode, setPathMode] = useState("standard");
  const [view, setView] = useState("overview");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const path = pathMode === "olympiad"
      ? (viewer === "parent" ? "/api/talim-yoli/ota/olimpiada" : "/api/talim-yoli/olimpiada")
      : (viewer === "parent" ? "/api/talim-yoli/ota/farzand" : "/api/talim-yoli/meniki");
    const params = new URLSearchParams({ token });
    if (viewer === "parent") params.set("child_id", String(studentId));
    if (pathMode === "standard" && contextId != null) params.set("context_id", String(contextId));
    if (pathMode === "standard" && groupId != null) params.set("group_id", String(groupId));
    if (grade) params.set("grade", grade);
    setLoading(true);
    setError("");
    fetch(`${API_BASE}${path}?${params}`, { signal: controller.signal })
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(typeof body.detail === "string" ? body.detail : "Ta'lim yo'li yuklanmadi");
        return body;
      })
      .then((body) => {
        setData(body);
        if (body.path_type !== "olympiad") {
          setContextId(body.selected_context?.id ?? null);
          setGroupId(body.selected_group?.id ?? null);
        }
        setGrade(body.selected_grade || "");
        setSubject((old) => body.subjects?.some((x) => x.name === old) ? old : "");
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [token, studentId, viewer, contextId, groupId, grade, pathMode, reloadKey]);

  const selectContext = (context) => {
    setPathMode("standard");
    setData(null);
    setContextId(context.id);
    setGroupId(context.groups?.length === 1 ? context.groups[0].id : null);
    setSubject("");
    setTerm(1);
    setView("overview");
  };

  const selectOlympiad = () => {
    setPathMode("olympiad");
    setData(null);
    setContextId(null);
    setGroupId(null);
    setSubject("");
    setTerm(1);
    setView("overview");
  };

  if (loading && !data) return <div className="px-5 pb-5"><LoadingCard text="Ta'lim yo'li qurilmoqda..." /></div>;
  if (error && !data) return <div className="px-5 pb-5"><ErrorCard message={error} onRetry={() => setReloadKey((x) => x + 1)} /></div>;

  if (view === "subject" && subject) {
    return (
      <LearningSubjectPathPage
        data={data}
        subject={subject}
        term={term}
        setTerm={setTerm}
        accent={pathMode === "olympiad" ? "#8A5A1C" : accent}
        onBack={() => { setView("overview"); setSubject(""); setTerm(1); }}
      />
    );
  }

  const summary = data?.summary || {};
  const olympiadSummary = data?.olympiad_summary || {};
  const isOlympiad = pathMode === "olympiad";
  const heroColor = isOlympiad ? "#8A5A1C" : accent;
  return (
    <div className="px-5 pb-6 space-y-4">
      <section className="rounded-3xl p-5 overflow-hidden relative" style={{ background: `linear-gradient(135deg, ${heroColor}, #173A5B)`, color: "#fff" }}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "#C9D8E4" }}>{isOlympiad ? "Olimpiada GPS" : "Ta'lim GPS"}</p>
        <h2 className="text-2xl font-bold mt-1">{isOlympiad ? "Olimpiadaga qanday tayyorlanyapman?" : "Qayerdaman va keyin nima?"}</h2>
        <p className="text-xs mt-2 max-w-xl leading-relaxed" style={{ color: "#D7E2EA" }}>
          {isOlympiad
            ? "To'rtta mustaqil dalil 20% + 20% + 30% + 30% tartibida baholanadi."
            : "Kalendar, o'qituvchi tasdig'i va bilim natijasi alohida hisoblanadi. Sana o'tishi mavzu o'rganildi degani emas."}
        </p>
        <div className="mt-4 flex items-center gap-2 text-[10px]">
          <span className="rounded-full px-2.5 py-1" style={{ backgroundColor: "rgba(255,255,255,.14)" }}>{data?.selected_grade}-sinf</span>
          <span className="rounded-full px-2.5 py-1" style={{ backgroundColor: "rgba(255,255,255,.14)" }}>{data?.academic_year}</span>
          {viewer === "parent" && <span className="rounded-full px-2.5 py-1" style={{ backgroundColor: "rgba(255,255,255,.14)" }}>Faqat ko'rish</span>}
        </div>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(data?.contexts || []).map((context) => {
          const meta = contextMeta(context.type);
          const active = !isOlympiad && Number(data?.selected_context?.id) === Number(context.id);
          return (
            <button key={context.id} onClick={() => selectContext(context)} className="shrink-0 rounded-xl border px-3 py-2.5 text-xs font-semibold"
              style={active ? { backgroundColor: meta.color, borderColor: meta.color, color: "#fff" } : { backgroundColor: "#fff", borderColor: "#E5E1D8", color: "#5A5648" }}>
              {meta.emoji} {context.type === "platform" ? "Maktab dasturi" : context.name}
            </button>
          );
        })}
        <button onClick={selectOlympiad} className="shrink-0 rounded-xl border px-3 py-2.5 text-xs font-semibold"
          style={isOlympiad ? { backgroundColor: "#8A5A1C", borderColor: "#8A5A1C", color: "#fff" } : { backgroundColor: "#fff", borderColor: "#E4C77D", color: "#8A5A1C" }}>
          🥇 Olimpiada
        </button>
      </div>

      {!isOlympiad && (data?.selected_context?.groups || []).length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {data.selected_context.groups.map((group) => (
            <button key={group.id} onClick={() => setGroupId(group.id)} className="shrink-0 rounded-full px-3 py-2 text-[11px] font-semibold"
              style={Number(groupId) === Number(group.id) ? { backgroundColor: "#2B2B2B", color: "#fff" } : { backgroundColor: "#EEEAE1", color: "#5A5648" }}>
              {group.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase font-semibold" style={{ color: "#8A8578" }}>Ko'rilayotgan bosqich</p>
          <p className="text-sm font-bold" style={{ color: "#2B2B2B" }}>{data?.selected_grade}-sinf · {data?.calendar_source?.label}</p>
        </div>
        <select value={grade} onChange={(e) => { setGrade(e.target.value); setSubject(""); setTerm(1); setView("overview"); }} className="rounded-xl border bg-white px-3 py-2 text-xs font-semibold" style={{ borderColor: "#D8D3C7", color: heroColor }}>
          {(data?.grade_options || []).map((g) => <option key={g} value={g}>{g}-sinf</option>)}
        </select>
      </div>

      {data?.grade_progression?.message && String(data?.selected_grade) === String(data?.student?.current_grade) && (
        <div className="rounded-2xl border p-3.5" style={{ borderColor: data.grade_progression.status === "completed" ? "#E4C77D" : "#C8DDD4", backgroundColor: data.grade_progression.status === "completed" ? "#FFF8E7" : "#EEF7F3" }}>
          <p className="text-xs font-bold" style={{ color: data.grade_progression.status === "completed" ? "#6F5320" : "#28735A" }}>
            {data.grade_progression.status === "completed" ? "✓ Sinf bosqichi yakunlangan" : "● Joriy sinf faol"}
          </p>
          <p className="text-[11px] mt-1" style={{ color: "#6F6859" }}>{data.grade_progression.message}</p>
        </div>
      )}

      <section className="rounded-2xl border bg-white p-4" style={{ borderColor: "#E5E1D8" }}>
        <div className="flex items-start gap-3">
          <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF1F7", color: "#1B4B7A" }}><CalendarDays size={17} /></span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold" style={{ color: "#2B2B2B" }}>{data?.focus_week?.label || "Haftalik reja"}</p>
              {data?.focus_week?.start && <span className="text-[10px]" style={{ color: "#8A8578" }}>{shortDate(data.focus_week.start)}–{shortDate(data.focus_week.end)}</span>}
            </div>
            {(data?.focus_week?.topics || []).length ? (
              <div className="mt-2 space-y-1.5">
                {data.focus_week.topics.slice(0, 8).map((topic) => (
                  <p key={topic.topic_code} className="text-[11px] leading-relaxed" style={{ color: "#5A5648" }}>
                    <b>{topic.subject}:</b> {topic.topic_name}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-[11px] mt-1.5" style={{ color: "#8A8578" }}>{data?.grade_progression?.status === "completed" ? "Bu sinfning reja haftalari tugagan." : "Rejada shu haftaga mavzu topilmadi."}</p>
            )}
          </div>
        </div>
      </section>

      {!isOlympiad && data?.calendar_source?.is_estimate && (
        <div className="rounded-xl border px-3 py-2.5 text-[11px] leading-relaxed" style={{ borderColor: "#E4C77D", backgroundColor: "#FFF8E7", color: "#6F5320" }}>
          Rasmiy kalendar ulanmagan. Hozir mavzular SamTM taxminiy haftalariga joylandi; o'qituvchi yoki admin rejasi kiritilsa, o'sha reja ustun bo'ladi.
        </div>
      )}

      <div className="grid grid-cols-3 gap-2.5">
        {isOlympiad ? (
          <>
            <PathMetric icon={Target} label="Tasdiqlangan tayyorgarlik" value={olympiadSummary.confirmed_readiness_percent == null ? "—" : `${number(olympiadSummary.confirmed_readiness_percent)}%`} note="4 manba yig'indisi" color="#8A5A1C" soft="#FDF3E0" />
            <PathMetric icon={CheckCircle2} label="Dalil qamrovi" value={`${number(olympiadSummary.evidence_coverage_percent)}%`} note={`${number(olympiadSummary.evaluated_subject_count)}/${number(olympiadSummary.subject_count)} fan`} color="#28735A" soft="#E7F4EE" />
            <PathMetric icon={Brain} label="Baholash modeli" value="4" note="20 + 20 + 30 + 30" color="#5B63A9" soft="#EFEEFB" />
          </>
        ) : (
          <>
            <PathMetric icon={CalendarDays} label="Reja yetgan" value={`${number(summary.planned_reached_percent)}%`} note="Sana bo'yicha" color="#8A5A1C" soft="#FDF3E0" />
            <PathMetric icon={CheckCircle2} label="Amalda o'tilgan" value={`${number(summary.taught_percent)}%`} note="O'qituvchi tasdig'i" color="#28735A" soft="#E7F4EE" />
            <PathMetric icon={Brain} label="Tasdiqlangan bilim" value={summary.verified_knowledge_percent == null ? "—" : `${number(summary.verified_knowledge_percent)}%`} note={`${number(summary.verified_topic_count)}/${number(summary.topic_count)} mavzu`} color="#5B63A9" soft="#EFEEFB" />
          </>
        )}
      </div>

      {(data?.subjects || []).length === 0 ? (
        <div className="rounded-2xl bg-white border p-7 text-center" style={{ borderColor: "#E5E1D8" }}>
          <BookOpen size={28} className="mx-auto mb-3" style={{ color: "#8A8578" }} />
          <p className="text-sm font-semibold" style={{ color: "#3D392F" }}>Bu yo'l uchun mavzu rejasi hali yo'q</p>
        </div>
      ) : (
        <section>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold" style={{ color: "#2B2B2B" }}>{isOlympiad ? "Olimpiada fan yo'llari" : "Fan yo'llari"}</p>
            <span className="text-[10px]" style={{ color: "#8A8578" }}>{data.subjects.length} fan · ustiga bosib ichiga kiring</span>
          </div>
          <div className="space-y-2">
            {data.subjects.map((item, index) => {
              const olympiad = item.olympiad;
              const value = isOlympiad ? olympiad?.confirmed_readiness_percent : item.verified_knowledge_percent;
              return (
                <button key={item.name} onClick={() => { setSubject(item.name); setTerm(1); setView("subject"); }} className="w-full rounded-2xl border bg-white p-3.5 text-left" style={{ borderColor: "#E5E1D8" }}>
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold" style={{ backgroundColor: isOlympiad ? "#FDF3E0" : "#EEEAE1", color: isOlympiad ? "#8A5A1C" : "#5A5648" }}>{String(index + 1).padStart(2, "0")}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-bold truncate" style={{ color: "#2B2B2B" }}>{item.name}</p>
                        <span className="text-xs font-semibold" style={{ color: value == null ? "#8A8578" : "#28735A" }}>{value == null ? "Hali baholanmagan" : `${number(value)}%`}</span>
                      </div>
                      <div className="mt-2"><ScoreBar value={isOlympiad ? olympiad?.evidence_coverage_percent : item.planned_reached_percent} color={isOlympiad ? "#8A5A1C" : accent} height={6} /></div>
                      <p className="text-[10px] mt-1" style={{ color: "#8A8578" }}>
                        {isOlympiad ? `${olympiad?.label || "Hali baholanmagan"} · dalil ${number(olympiad?.evidence_coverage_percent)}%` : `${item.topic_count} mavzu · ${item.taught_percent}% o'qituvchi tasdig'i · ${item.unknown_topic_count} noma'lum`}
                      </p>
                    </div>
                    <ChevronRight size={17} style={{ color: "#A7A091" }} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}
      {error && <ErrorCard message={error} onRetry={() => setReloadKey((x) => x + 1)} />}
    </div>
  );
}

export function StudentAnalyticsDashboard({
  token,
  studentId = null,
  viewer = "student",
  lockedContextId = null,
  lockedGroupId = null,
  accent = "#1B4B7A",
  compact = false,
  fallbackData = null,
  onBack = null,
}) {
  const [contextId, setContextId] = useState(lockedContextId);
  const [period, setPeriod] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(
    () => setContextId(lockedContextId ?? null),
    [studentId, lockedContextId]
  );

  useEffect(() => {
    const controller = new AbortController();
    let path = "/api/analitika/meniki";
    const params = new URLSearchParams({ token, kunlar: String(period) });
    if (viewer === "parent") {
      path = "/api/analitika/ota/farzand";
      params.set("child_id", String(studentId));
    } else if (viewer === "admin") {
      path = "/api/analitika/admin/oquvchi";
      params.set("student_id", String(studentId));
    } else if (viewer === "teacher") {
      path = "/api/analitika/oqituvchi/oquvchi";
      params.set("student_id", String(studentId));
      if (lockedGroupId != null) params.set("group_id", String(lockedGroupId));
    }
    if (contextId != null) params.set("context_id", String(contextId));
    setLoading(true);
    setError("");
    fetch(`${API_BASE}${path}?${params}`, { signal: controller.signal })
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(body.detail || `Server xatosi (${r.status})`);
        return body;
      })
      .then(setData)
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message || "Tahlil yuklanmadi");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [token, studentId, viewer, contextId, lockedGroupId, period, reloadKey]);

  const summary = data?.summary || {};
  const student = data?.student || {};
  const hasUniversityStudentAccess = Boolean(
    data?.capabilities?.has_university_student_access
  );
  const visibleContexts = useMemo(
    () => (data?.contexts || []).filter(
      (context) => context.type !== "university" || hasUniversityStudentAccess
    ),
    [data?.contexts, hasUniversityStudentAccess]
  );
  const activeContext = visibleContexts.find((c) => Number(c.id) === Number(contextId));

  useEffect(() => {
    if (data && contextId != null && !visibleContexts.some(
      (context) => Number(context.id) === Number(contextId)
    )) {
      setContextId(null);
    }
  }, [data, contextId, visibleContexts]);

  return (
    <div className={compact ? "analytics-view" : "analytics-view px-5 pt-6 pb-5"}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-2.5 min-w-0">
          {onBack && (
            <button onClick={onBack} className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#EAF1F7", color: "#1B4B7A" }}>
              <ChevronLeft size={17} />
            </button>
          )}
          <div className="min-w-0">
            {!compact && <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: accent }}>O'quvchi analitikasi</p>}
            {!compact && <h1 className="text-2xl font-bold truncate" style={{ color: "#2B2B2B" }}>{student.full_name || "Mening bilimim"}</h1>}
            {compact && activeContext && (
              <p className="text-xs font-medium" style={{ color: "#8A8578" }}>
                {contextMeta(activeContext.type).emoji} {activeContext.name}
              </p>
            )}
            {compact && !activeContext && (
              <p className="text-sm font-semibold" style={{ color: "#2B2B2B" }}>Umumiy tahlil</p>
            )}
          </div>
        </div>
        <select value={period} onChange={(e) => setPeriod(Number(e.target.value))}
          className="rounded-xl border px-2.5 py-2 text-xs bg-white shrink-0"
          style={{ borderColor: "#E5E1D8", color: "#5A5648" }}>
          <option value={7}>7 kun</option>
          <option value={30}>30 kun</option>
          <option value={90}>90 kun</option>
          <option value={365}>1 yil</option>
        </select>
      </div>

      {data?.contexts && lockedContextId == null && (
        <div className="mb-3">
          <ContextTabs contexts={visibleContexts} selected={contextId} onSelect={setContextId} accent={accent} />
        </div>
      )}

      {loading ? <LoadingCard /> : error ? (
        <div className="space-y-3">
          <ErrorCard message={error} onRetry={() => setReloadKey((x) => x + 1)} />
          <LegacyFallback data={fallbackData} />
        </div>
      ) : data ? (
        <div className="student-analytics-grid space-y-3.5">
          <div className="student-score-hero rounded-3xl p-5 text-white overflow-hidden relative"
            style={{ background: `linear-gradient(135deg, ${accent}, #2D6E8B)` }}>
            <div className="absolute -right-8 -top-10 w-36 h-36 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
            <div className="absolute right-14 -bottom-14 w-28 h-28 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
            <p className="text-xs font-semibold opacity-75">{activeContext ? activeContext.name : "Barcha ta'lim muhitlari"}</p>
            <div className="flex items-end gap-2 mt-2">
              <p className="text-5xl font-bold tabular-nums">{Math.round(number(summary.avg_score))}</p>
              <p className="text-lg font-semibold opacity-80 mb-1">%</p>
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs">
              <span className="flex items-center gap-1.5"><Flame size={14} /> {number(summary.streak_days)} kun ketma-ket</span>
              <span className="flex items-center gap-1.5"><CalendarDays size={14} /> {number(summary.active_days)} faol kun</span>
            </div>
          </div>

          <div className="student-kpi-strip premium-kpi-grid grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <MetricCard icon={CheckCircle2} label="O'zlashtirilgan mavzu" value={number(summary.mastered_topics)}
              tone="#28735A" soft="#E7F4EE" />
            <MetricCard icon={AlertTriangle} label="Takrorlash kerak" value={number(summary.needs_review)}
              tone="#A32D2D" soft="#FCEBEB" />
            <MetricCard icon={Brain} label="Esdan chiqish xavfi" value={number(summary.at_risk_topics)}
              tone="#B0553A" soft="#FBEDE8" />
            <MetricCard icon={RefreshCw} label="Qayta tiklangan" value={number(summary.recovered_topics)}
              tone="#28735A" soft="#E7F4EE" />
            <MetricCard icon={BookOpen} label="Bajarilgan faoliyat" value={number(summary.event_count)}
              tone="#8B5FBF" soft="#F3EEFA" />
            <MetricCard icon={Clock3} label="O'qish vaqti" value={number(summary.time_minutes)}
              suffix="daq" tone="#8A5A1C" soft="#FDF3E0" />
          </div>

          <section className="student-trend-card rounded-2xl bg-white border p-4" style={{ borderColor: "#E5E1D8" }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-bold" style={{ color: "#2B2B2B" }}>Natija rivoji</p>
                <p className="text-[11px]" style={{ color: "#8A8578" }}>Har kunlik baholangan faoliyat</p>
              </div>
              <TrendingUp size={20} style={{ color: accent }} />
            </div>
            <TrendChart points={data.trend} color={accent} />
          </section>

          <section className="student-subject-card rounded-2xl bg-white border p-4" style={{ borderColor: "#E5E1D8" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold" style={{ color: "#2B2B2B" }}>Fanlar kesimida</p>
              <BarChart3 size={18} style={{ color: accent }} />
            </div>
            {(data.subjects || []).length === 0 ? (
              <p className="text-xs py-5 text-center" style={{ color: "#8A8578" }}>Hali baholangan fan natijasi yo'q</p>
            ) : (
              <div className="space-y-3.5">
                {data.subjects.map((s, index) => {
                  const color = ["#1B4B7A", "#28735A", "#8B5FBF", "#B0553A", "#C89B3C"][index % 5];
                  return (
                    <div key={s.subject}>
                      <div className="flex items-center justify-between gap-3 mb-1.5">
                        <p className="text-xs font-semibold truncate" style={{ color: "#3D392F" }}>{s.subject}</p>
                        <span className="text-xs font-bold tabular-nums" style={{ color }}>{Math.round(number(s.avg_score))}%</span>
                      </div>
                      <ScoreBar value={s.avg_score} color={color} />
                      <p className="text-[10px] mt-1" style={{ color: "#9A9485" }}>
                        {s.event_count} faoliyat · {s.time_minutes} daqiqa
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <div className="student-focus-grid grid gap-3 md:grid-cols-2">
            <section className="rounded-2xl bg-white border p-4" style={{ borderColor: "#E5E1D8" }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#FCEBEB" }}>
                  <Target size={16} style={{ color: "#A32D2D" }} />
                </span>
                <div>
                  <p className="text-sm font-bold" style={{ color: "#2B2B2B" }}>Xotira va takrorlash</p>
                  <p className="text-[10px]" style={{ color: "#8A8578" }}>Past natija, muddat va unutish ehtimoli</p>
                </div>
              </div>
              {(data.weak_topics || []).length === 0 ? (
                <div className="rounded-xl p-3 flex items-center gap-2.5" style={{ backgroundColor: "#E7F4EE" }}>
                  <CheckCircle2 size={18} style={{ color: "#28735A" }} />
                  <p className="text-xs font-medium" style={{ color: "#28735A" }}>Hozircha qiyin mavzu aniqlanmadi</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.weak_topics.slice(0, 5).map((w) => (
                    <div key={`${w.context_id}-${w.topic_code}`} className="rounded-xl p-3" style={{ backgroundColor: "#FAF8F2" }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate" style={{ color: "#3D392F" }}>{w.topic_name}</p>
                          <p className="text-[10px] mt-0.5 truncate" style={{ color: "#8A8578" }}>{w.subject} · {w.context_name}</p>
                        </div>
                        <span className="text-xs font-bold shrink-0" style={{ color: "#A32D2D" }}>
                          {Math.round(number(w.forgetting_probability))}% xavf
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-2">
                        <span className="text-[10px] font-semibold" style={{
                          color: w.memory_status === "forgotten" ? "#A32D2D" : w.memory_status === "at_risk" ? "#8A5A1C" : "#28735A",
                        }}>
                          {w.memory_status_label}
                        </span>
                        <span className="text-[10px]" style={{ color: "#8A8578" }}>
                          Bilim {Math.round(number(w.mastery_score))}% · {number(w.days_since_assessment)} kun
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {(data.recovered_topics || []).length > 0 && (
                <div className="mt-3 pt-3 border-t" style={{ borderColor: "#EEEAE1" }}>
                  <p className="text-[11px] font-bold mb-2" style={{ color: "#28735A" }}>Qayta testda tiklangan</p>
                  <div className="space-y-1.5">
                    {data.recovered_topics.slice(0, 3).map((topic) => (
                      <div key={`recovered-${topic.context_id}-${topic.topic_code}`} className="flex items-center justify-between gap-3 text-[10px]">
                        <span className="truncate" style={{ color: "#3D392F" }}>{topic.topic_name}</span>
                        <span className="font-bold shrink-0" style={{ color: "#28735A" }}>
                          {Math.round(number(topic.previous_score))}% → {Math.round(number(topic.latest_score))}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-2xl bg-white border p-4" style={{ borderColor: "#E5E1D8" }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#F3EEFA" }}>
                  <Brain size={16} style={{ color: "#8B5FBF" }} />
                </span>
                <div>
                  <p className="text-sm font-bold" style={{ color: "#2B2B2B" }}>Keyingi reja</p>
                  <p className="text-[10px]" style={{ color: "#8A8578" }}>Natijaga qarab tavsiya</p>
                </div>
              </div>
              <div className="space-y-2">
                {(data.next_actions || []).map((a, i) => (
                  <div key={`${a.type}-${i}`} className="rounded-xl border p-3" style={{ borderColor: "#E5E1D8" }}>
                    <p className="text-xs font-semibold" style={{ color: "#3D392F" }}>{a.title}</p>
                    <p className="text-[10px] mt-1 leading-relaxed" style={{ color: "#8A8578" }}>{a.reason}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="student-events-card rounded-2xl bg-white border p-4" style={{ borderColor: "#E5E1D8" }}>
            <p className="text-sm font-bold mb-3" style={{ color: "#2B2B2B" }}>So'nggi faoliyatlar</p>
            {(data.recent_events || []).length === 0 ? (
              <p className="text-xs py-4 text-center" style={{ color: "#8A8578" }}>Hali faoliyat yozilmagan</p>
            ) : (
              <div className="divide-y" style={{ borderColor: "#EEEAE1" }}>
                {data.recent_events.slice(0, 8).map((e) => (
                  <div key={e.id} className="py-3 flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: contextMeta(
                        visibleContexts.find((c) => c.name === e.context_name)?.type
                      ).soft }}>
                      {e.event_type.includes("ai") ? "🤖" : e.event_type.includes("test") ? "✍️" : "📖"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate" style={{ color: "#3D392F" }}>
                        {EVENT_LABELS[e.event_type] || e.event_type}
                        {e.subject ? ` · ${e.subject}` : ""}
                      </p>
                      <p className="text-[10px] mt-0.5 truncate" style={{ color: "#8A8578" }}>
                        {e.context_name} · {EVIDENCE_LABELS[e.evidence_source] || e.evidence_source} · {dateLabel(e.occurred_at)}
                      </p>
                    </div>
                    {e.score != null && (
                      <span className="text-xs font-bold shrink-0" style={{ color: e.score >= 60 ? "#28735A" : "#A32D2D" }}>
                        {Math.round(e.score)}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}

function AdminItemIcon({ type }) {
  if (type === "region" || type === "district") return <Layers3 size={18} />;
  if (type === "context") return <Building2 size={18} />;
  if (type === "group") return <Users size={18} />;
  return <BookOpen size={18} />;
}

export function AdminStatisticsTab({ token }) {
  const [level, setLevel] = useState("tizim");
  const [params, setParams] = useState({});
  const [stack, setStack] = useState([{ level: "tizim", params: {}, label: "Barcha tizim" }]);
  const [period, setPeriod] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [studentId, setStudentId] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (studentId) return undefined;
    const controller = new AbortController();
    const query = new URLSearchParams({
      token,
      bosqich: level,
      kunlar: String(period),
    });
    Object.entries(params).forEach(([k, v]) => {
      if (v != null) query.set(k, String(v));
    });
    setLoading(true);
    setError("");
    fetch(`${API_BASE}/api/analitika/admin/daraxt?${query}`, { signal: controller.signal })
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(body.detail || `Server xatosi (${r.status})`);
        return body;
      })
      .then(setData)
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message || "Statistika yuklanmadi");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [token, level, params, period, reloadKey, studentId]);

  const openLevel = (nextLevel, nextParams, label) => {
    setSearch("");
    setLevel(nextLevel);
    setParams(nextParams);
    setStack((old) => [...old, { level: nextLevel, params: nextParams, label }]);
  };

  const openItem = (item) => {
    if (item.type === "region") {
      openLevel("viloyat", { viloyat: item.name }, item.name);
    } else if (item.type === "district") {
      openLevel("tuman", { ...params, tuman: item.name }, item.name);
    } else if (item.type === "context") {
      openLevel("muassasa", { context_id: item.id }, item.name);
    } else if (item.type === "group") {
      openLevel("guruh", { group_id: item.id }, item.name);
    } else if (item.type === "student") {
      setStudentId(item.id);
    }
  };

  const jumpTo = (index) => {
    const target = stack[index];
    setStack(stack.slice(0, index + 1));
    setLevel(target.level);
    setParams(target.params);
    setStudentId(null);
    setSearch("");
  };

  const sync = async () => {
    setSyncing(true);
    setError("");
    try {
      const r = await fetch(`${API_BASE}/api/admin/analitika/sinxronlash?token=${encodeURIComponent(token)}`, { method: "POST" });
      const body = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(body.detail || "Sinxronlash xatosi");
      setReloadKey((x) => x + 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setSyncing(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data?.items || [];
    return (data?.items || []).filter((x) =>
      [x.name, x.subject, x.grade, x.context_type].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [data, search]);

  if (studentId) {
    return <StudentAnalyticsDashboard
      token={token}
      studentId={studentId}
      viewer="admin"
      onBack={() => setStudentId(null)}
    />;
  }

  return (
    <div className="analytics-view px-5 pt-6 pb-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#1B4B7A" }}>Boshqaruv markazi</p>
          <h1 className="text-2xl font-bold" style={{ color: "#2B2B2B" }}>Statistikalar</h1>
          <p className="text-xs mt-1" style={{ color: "#8A8578" }}>Tizimdan aniq o'quvchigacha ichma-ich tahlil</p>
        </div>
        <button onClick={sync} disabled={syncing}
          className="w-10 h-10 rounded-xl border flex items-center justify-center bg-white"
          style={{ borderColor: "#E5E1D8", color: "#1B4B7A", opacity: syncing ? 0.6 : 1 }}
          title="Eski bazani analitikaga sinxronlash">
          <RefreshCw size={18} className={syncing ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2">
        {stack.map((crumb, index) => (
          <React.Fragment key={`${crumb.level}-${index}`}>
            {index > 0 && <ChevronRight size={13} className="shrink-0" style={{ color: "#B0AA98" }} />}
            <button onClick={() => jumpTo(index)}
              className="shrink-0 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg"
              style={index === stack.length - 1
                ? { backgroundColor: "#EAF1F7", color: "#1B4B7A" }
                : { color: "#8A8578" }}>
              {crumb.label}
            </button>
          </React.Fragment>
        ))}
      </div>

      <div className="premium-kpi-grid grid grid-cols-2 gap-2.5 mb-3">
        <MetricCard icon={Users} label="O'quvchilar" value={number(data?.summary?.student_count)} tone="#1B4B7A" soft="#EAF1F7" />
        <MetricCard icon={TrendingUp} label="O'rtacha bilim" value={Math.round(number(data?.summary?.avg_score))} suffix="%" tone="#28735A" soft="#E7F4EE" />
        <MetricCard icon={BookOpen} label="Faoliyatlar" value={number(data?.summary?.event_count)} tone="#8B5FBF" soft="#F3EEFA" />
        <MetricCard icon={AlertTriangle} label="Yordam kerak" value={number(data?.summary?.needs_help)} tone="#A32D2D" soft="#FCEBEB" />
      </div>

      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9A9485" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border pl-9 pr-3 py-2.5 text-sm"
            style={{ borderColor: "#E5E1D8" }} placeholder="Nom bo'yicha qidirish" />
        </div>
        <select value={period} onChange={(e) => setPeriod(Number(e.target.value))}
          className="rounded-xl border px-2.5 py-2 text-xs bg-white"
          style={{ borderColor: "#E5E1D8", color: "#5A5648" }}>
          <option value={7}>7 kun</option>
          <option value={30}>30 kun</option>
          <option value={90}>90 kun</option>
          <option value={365}>1 yil</option>
        </select>
      </div>

      {loading ? <LoadingCard /> : error ? (
        <ErrorCard message={error} onRetry={() => setReloadKey((x) => x + 1)} />
      ) : (
        <div className="space-y-2.5">
          {filtered.length === 0 ? (
            <div className="rounded-2xl bg-white border p-8 text-center" style={{ borderColor: "#E5E1D8" }}>
              <p className="text-sm font-semibold" style={{ color: "#3D392F" }}>Ma'lumot topilmadi</p>
              <p className="text-xs mt-1" style={{ color: "#8A8578" }}>Sinxronlash tugmasini bosing yoki filtrni tozalang.</p>
            </div>
          ) : filtered.map((item) => {
            const meta = contextMeta(item.context_type);
            return (
              <button key={`${item.type}-${item.id ?? item.key}`} onClick={() => openItem(item)}
                className="w-full rounded-2xl bg-white border p-4 text-left"
                style={{ borderColor: "#E5E1D8" }}>
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: item.type === "context" ? meta.soft : "#F1EFE9", color: item.type === "context" ? meta.color : "#5A5648" }}>
                    <AdminItemIcon type={item.type} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold truncate" style={{ color: "#2B2B2B" }}>{item.name}</p>
                      <span className="text-sm font-bold shrink-0" style={{ color: item.avg_score >= 60 ? "#28735A" : "#A32D2D" }}>
                        {Math.round(number(item.avg_score))}%
                      </span>
                    </div>
                    <p className="text-[10px] mt-1 truncate" style={{ color: "#8A8578" }}>
                      {item.student_count} o'quvchi · {item.event_count} faoliyat
                      {item.needs_help ? ` · ${item.needs_help} yordam kerak` : ""}
                    </p>
                    <div className="mt-2"><ScoreBar value={item.avg_score} color={item.avg_score >= 60 ? "#28735A" : "#B0553A"} height={5} /></div>
                  </div>
                  <ChevronRight size={17} className="shrink-0" style={{ color: "#A7A091" }} />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TeacherLearningPlanManager({ token, groupId }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [term, setTerm] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState("");
  const [message, setMessage] = useState("");

  const load = () => {
    if (!groupId) return;
    setLoading(true);
    setMessage("");
    fetch(`${API_BASE}/api/talim-yoli/oqituvchi/reja?token=${encodeURIComponent(token)}&group_id=${groupId}`)
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(body.detail || "Reja yuklanmadi");
        return body;
      })
      .then(setData)
      .catch((e) => setMessage(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setData(null);
    setOpen(false);
    setTerm(1);
    setMessage("");
  }, [groupId]);

  useEffect(() => {
    if (open && !data && !loading) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, groupId]);

  const updateTopic = (code, field, value) => {
    setData((old) => ({
      ...old,
      topics: (old?.topics || []).map((topic) => topic.topic_code === code ? { ...topic, [field]: value } : topic),
    }));
  };

  const saveTopic = async (topic, status = topic.teaching_status) => {
    setSaving(topic.topic_code);
    setMessage("");
    try {
      const response = await fetch(`${API_BASE}/api/talim-yoli/oqituvchi/reja`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          group_id: groupId,
          academic_year: data.academic_year,
          entries: [{
            topic_code: topic.topic_code,
            subject: topic.subject,
            planned_start: topic.planned_start || null,
            planned_end: topic.planned_end || null,
            term_no: Number(topic.term_no),
            week_no: Number(topic.week_no),
            teaching_status: status,
            note: topic.note || null,
          }],
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.detail || "Reja saqlanmadi");
      updateTopic(topic.topic_code, "teaching_status", status);
      setMessage(status === "taught" ? "Mavzu amalda o'tildi deb tasdiqlandi." : "Reja yangilandi.");
    } catch (e) {
      setMessage(e.message);
    } finally {
      setSaving("");
    }
  };

  const topics = (data?.topics || []).filter((topic) => Number(topic.term_no) === Number(term));
  const taught = (data?.topics || []).filter((topic) => topic.teaching_status === "taught").length;

  return (
    <section className="rounded-2xl bg-white border overflow-hidden" style={{ borderColor: "#E5E1D8" }}>
      <button onClick={() => setOpen((value) => !value)} className="w-full p-4 flex items-center gap-3 text-left">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#EAF1F7", color: "#1B4B7A" }}><CalendarDays size={18} /></span>
        <span className="min-w-0 flex-1">
          <span className="text-sm font-bold block" style={{ color: "#2B2B2B" }}>Mavzu kalendari va “o'tildi” tasdig'i</span>
          <span className="text-[10px] block mt-0.5" style={{ color: "#8A8578" }}>{data ? `${taught}/${data.topics.length} mavzu amalda o'tilgan` : "Reja sanasi bilim natijasidan alohida yuritiladi"}</span>
        </span>
        <ChevronRight size={17} style={{ color: "#A7A091", transform: open ? "rotate(90deg)" : "none" }} />
      </button>
      {open && (
        <div className="border-t p-4" style={{ borderColor: "#EEEAE1" }}>
          {loading ? <LoadingCard text="Guruh rejasi yuklanmoqda..." /> : !data ? (
            <ErrorCard message={message || "Reja topilmadi"} onRetry={load} />
          ) : (
            <>
              <div className="rounded-xl px-3 py-2.5 mb-3 text-[11px] leading-relaxed" style={{ backgroundColor: "#FFF8E7", color: "#6F5320" }}>
                “O'tildi” faqat darsni tasdiqlaydi. O'quvchining bilimi esa shu mavzudagi test yoki mavzuga qo'yilgan bahodan keyin aniqlanadi.
              </div>
              <div className="grid grid-cols-4 gap-1.5 mb-3">
                {[1, 2, 3, 4].map((q) => <button key={q} onClick={() => setTerm(q)} className="rounded-xl py-2 text-xs font-semibold" style={Number(term) === q ? { backgroundColor: "#1B4B7A", color: "#fff" } : { backgroundColor: "#F1EFE9", color: "#5A5648" }}>{q}-chorak</button>)}
              </div>
              <div className="space-y-2 max-h-[34rem] overflow-y-auto pr-1">
                {topics.map((topic) => {
                  const meta = PATH_STATE_META[topic.teaching_status === "taught" ? "taught" : topic.teaching_status] || PATH_STATE_META.upcoming;
                  return (
                    <div key={topic.topic_code} className="rounded-xl border p-3" style={{ borderColor: "#E5E1D8" }}>
                      <div className="flex items-start gap-2.5">
                        <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold" style={{ color: meta.color, backgroundColor: meta.soft }}>{meta.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold" style={{ color: "#3D392F" }}>{topic.topic_name}</p>
                          <p className="text-[9px] mt-0.5" style={{ color: "#8A8578" }}>{topic.week_no}-hafta · {topic.subject}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2.5">
                        <label className="text-[9px]" style={{ color: "#8A8578" }}>Boshlanish<input type="date" value={topic.planned_start || ""} onChange={(e) => updateTopic(topic.topic_code, "planned_start", e.target.value)} className="mt-1 w-full rounded-lg border px-2 py-1.5 text-[10px]" style={{ borderColor: "#D8D3C7", color: "#3D392F" }} /></label>
                        <label className="text-[9px]" style={{ color: "#8A8578" }}>Tugash<input type="date" value={topic.planned_end || ""} onChange={(e) => updateTopic(topic.topic_code, "planned_end", e.target.value)} className="mt-1 w-full rounded-lg border px-2 py-1.5 text-[10px]" style={{ borderColor: "#D8D3C7", color: "#3D392F" }} /></label>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 mt-2.5">
                        <button disabled={saving === topic.topic_code} onClick={() => saveTopic(topic, "planned")} className="rounded-lg py-2 text-[10px] font-semibold" style={{ backgroundColor: "#F1EFE9", color: "#5A5648" }}>Rejada</button>
                        <button disabled={saving === topic.topic_code} onClick={() => saveTopic(topic, "delayed")} className="rounded-lg py-2 text-[10px] font-semibold" style={{ backgroundColor: "#FDF3E0", color: "#8A5A1C" }}>Kechikdi</button>
                        <button disabled={saving === topic.topic_code} onClick={() => saveTopic(topic, "taught")} className="rounded-lg py-2 text-[10px] font-semibold" style={{ backgroundColor: "#E7F4EE", color: "#28735A" }}>{saving === topic.topic_code ? "..." : "✓ O'tildi"}</button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {message && <p className="text-[10px] mt-3" style={{ color: message.includes("saqlan") || message.includes("o'tildi") ? "#28735A" : "#A32D2D" }}>{message}</p>}
            </>
          )}
        </div>
      )}
    </section>
  );
}

export function TeacherAnalyticsPanel({ token, onBack, initialWorkplace = null }) {
  const [contexts, setContexts] = useState([]);
  const [contextId, setContextId] = useState(null);
  const [groupId, setGroupId] = useState(null);
  const [period, setPeriod] = useState(30);
  const [data, setData] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [contextsLoading, setContextsLoading] = useState(true);
  const [groupLoading, setGroupLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setContextsLoading(true);
    fetch(`${API_BASE}/api/analitika/oqituvchi/kontekstlar?token=${encodeURIComponent(token)}`, { signal: controller.signal })
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(body.detail || "Ish joylari yuklanmadi");
        return body;
      })
      .then((body) => {
        const list = body.contexts || [];
        setContexts(list);
        const firstContext =
          list.find((c) =>
            initialWorkplace
            && c.external_type === initialWorkplace.turi
            && Number(c.external_id) === Number(initialWorkplace.muassasa_id)
          )
          || list.find((c) => (c.groups || []).length > 0)
          || list[0];
        setContextId((old) => old || firstContext?.id || null);
        setGroupId((old) => old || firstContext?.groups?.[0]?.id || null);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setContextsLoading(false);
      });
    return () => controller.abort();
  }, [token, initialWorkplace]);

  const selectedContext = contexts.find((c) => Number(c.id) === Number(contextId));
  const groups = selectedContext?.groups || [];
  const selectedGroup = groups.find((g) => Number(g.id) === Number(groupId));

  useEffect(() => {
    if (!groupId) {
      setData(null);
      setError("");
      setGroupLoading(false);
      return undefined;
    }
    const controller = new AbortController();
    setGroupLoading(true);
    setError("");
    const query = new URLSearchParams({ token, group_id: String(groupId), kunlar: String(period) });
    fetch(`${API_BASE}/api/analitika/oqituvchi/guruh?${query}`, { signal: controller.signal })
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(body.detail || "Guruh tahlili yuklanmadi");
        return body;
      })
      .then(setData)
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setGroupLoading(false);
      });
    return () => controller.abort();
  }, [token, groupId, period]);

  const chooseContext = (id) => {
    const c = contexts.find((x) => Number(x.id) === Number(id));
    setContextId(id);
    setGroupId(c?.groups?.[0]?.id || null);
    setStudentId(null);
    setData(null);
    setError("");
  };

  if (studentId) {
    return <StudentAnalyticsDashboard token={token} studentId={studentId} viewer="teacher"
      lockedContextId={selectedGroup?.context_id}
      lockedGroupId={groupId}
      onBack={() => setStudentId(null)} />;
  }

  return (
    <div className="analytics-view px-5 pt-6 pb-5">
      <div className="flex items-start gap-3 mb-4">
        <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: "#EAF1F7", color: "#1B4B7A" }}>
          <ChevronLeft size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#1B4B7A" }}>O'qituvchi paneli</p>
          <h1 className="text-2xl font-bold" style={{ color: "#2B2B2B" }}>Statistikalar</h1>
          <p className="text-xs mt-1" style={{ color: "#8A8578" }}>Ish joyi → guruh → o'quvchi → mavzu</p>
        </div>
        <select value={period} onChange={(e) => setPeriod(Number(e.target.value))}
          className="rounded-xl border px-2.5 py-2 text-xs bg-white"
          style={{ borderColor: "#E5E1D8", color: "#5A5648" }}>
          <option value={7}>7 kun</option>
          <option value={30}>30 kun</option>
          <option value={90}>90 kun</option>
        </select>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-1">
        {contexts.map((c) => {
          const meta = contextMeta(c.type);
          const active = Number(contextId) === Number(c.id);
          return (
            <button key={c.id} onClick={() => chooseContext(c.id)}
              className="shrink-0 rounded-xl px-3.5 py-2.5 text-xs font-semibold border"
              style={active
                ? { backgroundColor: meta.color, borderColor: meta.color, color: "#fff" }
                : { backgroundColor: "#fff", borderColor: "#E5E1D8", color: "#5A5648" }}>
              {meta.emoji} {c.name}
            </button>
          );
        })}
      </div>

      {groups.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
          {groups.map((g) => (
            <button key={g.id} onClick={() => setGroupId(g.id)}
              className="shrink-0 rounded-full px-3 py-2 text-[11px] font-semibold"
              style={Number(groupId) === Number(g.id)
                ? { backgroundColor: "#2B2B2B", color: "#fff" }
                : { backgroundColor: "#EEEAE1", color: "#5A5648" }}>
              {g.name} · {g.student_count}
            </button>
          ))}
        </div>
      )}

      {contextsLoading || (groupId && groupLoading) ? <LoadingCard /> : error ? <ErrorCard message={error} /> : !groupId ? (
        <div className="rounded-2xl bg-white border p-8 text-center" style={{ borderColor: "#E5E1D8" }}>
          <Users size={28} className="mx-auto mb-3" style={{ color: "#8A8578" }} />
          <p className="text-sm font-semibold" style={{ color: "#3D392F" }}>Tahlil qilinadigan guruh yo'q</p>
          <p className="text-xs mt-1" style={{ color: "#8A8578" }}>Avval sinf yoki to'garak a'zolarini sinxronlang.</p>
        </div>
      ) : data ? (
        <div className="teacher-analytics-grid space-y-3.5">
          <div className="teacher-kpi-strip premium-kpi-grid grid grid-cols-2 gap-2.5">
            <MetricCard icon={Users} label="Guruhdagi o'quvchi" value={number(data.summary.student_count)} />
            <MetricCard icon={TrendingUp} label="O'rtacha bilim" value={Math.round(number(data.summary.avg_score))} suffix="%" tone="#28735A" soft="#E7F4EE" />
            <MetricCard icon={BookOpen} label="Faoliyatlar" value={number(data.summary.event_count)} tone="#8B5FBF" soft="#F3EEFA" />
            <MetricCard icon={AlertTriangle} label="Yordam kerak" value={number(data.summary.needs_help)} tone="#A32D2D" soft="#FCEBEB" />
          </div>

          <TeacherLearningPlanManager token={token} groupId={groupId} />

          <section className="teacher-trend-card rounded-2xl bg-white border p-4" style={{ borderColor: "#E5E1D8" }}>
            <p className="text-sm font-bold mb-3" style={{ color: "#2B2B2B" }}>Guruh rivoji</p>
            <TrendChart points={data.trend} color="#1B4B7A" />
          </section>

          {(data.difficult_topics || []).length > 0 && (
            <section className="teacher-difficult-card rounded-2xl bg-white border p-4" style={{ borderColor: "#E5E1D8" }}>
              <p className="text-sm font-bold mb-3" style={{ color: "#2B2B2B" }}>Sinfga qiyin tushayotgan mavzular</p>
              <div className="space-y-2">
                {data.difficult_topics.slice(0, 6).map((t) => (
                  <div key={`${t.subject}-${t.topic_code}`} className="rounded-xl p-3 flex items-center gap-3" style={{ backgroundColor: "#FAF8F2" }}>
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#FCEBEB", color: "#A32D2D" }}>
                      <Target size={15} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate" style={{ color: "#3D392F" }}>{t.subject || t.topic_code}</p>
                      <p className="text-[10px]" style={{ color: "#8A8578" }}>{t.attempts} urinish</p>
                    </div>
                    <span className="text-xs font-bold" style={{ color: "#A32D2D" }}>{Math.round(number(t.avg_score))}%</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="teacher-students-card rounded-2xl bg-white border p-4" style={{ borderColor: "#E5E1D8" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold" style={{ color: "#2B2B2B" }}>O'quvchilar</p>
              <span className="text-[10px]" style={{ color: "#8A8578" }}>Past natija yuqorida</span>
            </div>
            <div className="space-y-2">
              {(data.students || []).map((s) => (
                <button key={s.user_id} onClick={() => setStudentId(s.user_id)}
                  className="w-full rounded-xl border p-3 text-left flex items-center gap-3"
                  style={{ borderColor: s.needs_help ? "#E8C8C2" : "#E5E1D8", backgroundColor: s.needs_help ? "#FFF9F8" : "#fff" }}>
                  <span className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ backgroundColor: s.needs_help ? "#FCEBEB" : "#EAF1F7", color: s.needs_help ? "#A32D2D" : "#1B4B7A" }}>
                    {(s.full_name || "?").split(" ").slice(0, 2).map((x) => x[0]).join("")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold truncate" style={{ color: "#3D392F" }}>{s.full_name}</p>
                      <span className="text-xs font-bold" style={{ color: s.avg_score >= 60 ? "#28735A" : "#A32D2D" }}>
                        {Math.round(number(s.avg_score))}%
                      </span>
                    </div>
                    <p className="text-[10px] mt-0.5" style={{ color: "#8A8578" }}>
                      {s.event_count} faoliyat · {s.time_minutes} daqiqa
                      {s.needs_help ? " · yordam kerak" : ""}
                    </p>
                  </div>
                  <ChevronRight size={16} style={{ color: "#A7A091" }} />
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
