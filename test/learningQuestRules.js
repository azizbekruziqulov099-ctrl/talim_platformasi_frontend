export const QUESTS = Object.freeze({
  junior: {
    title: "Bilim sayohati",
    subtitle: "Yo‘lni bilim bilan oching",
    icon: "🧭",
    stages: ["Yo‘l", "Ko‘prik", "Bog‘", "Kutubxona", "Bilim qal’asi"],
  },
  middle: {
    title: "Kashfiyot missiyasi",
    subtitle: "Tadqiqot markazini ishga tushiring",
    icon: "🔬",
    stages: ["Signal", "Laboratoriya", "Tajriba", "Dalil", "Kashfiyot markazi"],
  },
  senior: {
    title: "Kelajak loyihasi",
    subtitle: "Bilimingizdan haqiqiy yechim yarating",
    icon: "◈",
    stages: ["Muammo", "Tahlil", "Yechim", "Sinov", "Yakuniy loyiha"],
  },
});

export function questKey(grade) {
  const value = Number.parseInt(String(grade || "1").replace(/[^0-9]/g, ""), 10) || 1;
  if (value <= 4) return "junior";
  if (value <= 9) return "middle";
  return "senior";
}

export function testResultLevel(percent) {
  const value = Math.max(0, Math.min(100, Number(percent) || 0));
  if (value >= 95) return { key: "master", label: "Mukammal egallandi", tone: "excellent", outcomes: ["Oltin bilim qal’asi", "Buyuk kashfiyot", "Mukammal loyiha"] };
  if (value >= 85) return { key: "expert", label: "Ishonchli bilim", tone: "great", outcomes: ["Yorqin bilim qal’asi", "Aniq kashfiyot", "Ishonchli loyiha"] };
  if (value >= 70) return { key: "steady", label: "Mustahkam natija", tone: "good", outcomes: ["Mustahkam bilim qal’asi", "Ishlaydigan markaz", "Tayyor loyiha"] };
  if (value >= 50) return { key: "growing", label: "Rivojlanmoqda", tone: "warm", outcomes: ["Qurilayotgan qal’a", "Davom etayotgan tajriba", "Rivojlanayotgan loyiha"] };
  return { key: "repair", label: "Qayta mustahkamlash kerak", tone: "retry", outcomes: ["Qal’ani ta’mirlash rejasi", "Kashfiyotni qayta tekshirish", "Loyihani yaxshilash rejasi"] };
}

export function questProgress({ totalQuestions, answeredCount, correctCount }) {
  const total = Math.max(1, Number(totalQuestions) || 25);
  const answered = Math.max(0, Math.min(total, Number(answeredCount) || 0));
  const correct = Math.max(0, Math.min(answered, Number(correctCount) || 0));
  // 20, 25 va 28 savolning barchasida aynan beshta mazmunli bekat.
  // floor formulasi oxirgi notekis savollarni ham beshinchi bekatga kiritadi.
  const openedStages = Math.min(5, Math.floor((answered * 5) / total));
  const activeStage = Math.min(4, openedStages);
  const nextBoundary = Math.ceil(((activeStage + 1) * total) / 5);
  const questionsToNext = openedStages >= 5 ? 0 : Math.max(1, nextBoundary - answered);
  const percent = answered ? Math.round((correct / answered) * 100) : 0;
  return { total, answered, correct, openedStages, activeStage, questionsToNext, percent };
}
