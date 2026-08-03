export const INSTITUTE_KINDS = [
  { value: "university", label: "Universitet" },
  { value: "institute", label: "Institut" },
  { value: "academy", label: "Akademiya" },
  { value: "branch", label: "Filial" },
];

export const OWNERSHIP_TYPES = [
  {
    value: "public",
    label: "Davlat",
    hint: "Davlat OTM uchun tashkilotning amaldagi nizomi va vakolatlari asosida",
  },
  {
    value: "private",
    label: "Nodavlat",
    hint: "Nodavlat OTMning litsenziyasi va ichki qoidalariga mos sozlanadi",
  },
];

export const GRADING_SYSTEMS = [
  {
    value: "credit_modular",
    label: "Kredit-modul",
    hint: "Kredit, harfli baho va GPA mezonlari dastur versiyasida belgilanadi",
  },
  {
    value: "five_point",
    label: "5 ballik",
    hint: "5–4–3–2 mezonlari qo‘llanadigan dasturlar uchun",
  },
  {
    value: "custom",
    label: "OTMga xos — keyingi bosqich",
    hint: "Maxsus baho shkalasi muharriri ulanmaguncha tanlab bo‘lmaydi",
  },
];

export const TERM_SYSTEMS = [
  { value: "semester", label: "Semestr" },
  { value: "trimester", label: "Trimestr" },
  { value: "quarter", label: "Chorak" },
  { value: "summer", label: "Yozgi davr" },
  { value: "custom", label: "OTMga xos davr" },
];

export const DEGREE_LEVELS = [
  { value: "foundation", label: "Tayyorlov dasturi" },
  { value: "bachelor", label: "Bakalavriat" },
  { value: "master", label: "Magistratura" },
  { value: "doctoral", label: "Doktorantura" },
  { value: "professional", label: "Kasbiy dastur" },
  { value: "custom", label: "OTMga xos dastur" },
];

export const STUDY_FORMS = [
  { value: "full_time", label: "Kunduzgi" },
  { value: "evening", label: "Kechki" },
  { value: "part_time", label: "Sirtqi" },
  { value: "distance", label: "Masofaviy" },
  { value: "dual", label: "Dual ta’lim" },
  { value: "custom", label: "OTMga xos shakl" },
];

export const INSTITUTE_ROLES = Object.freeze({
  owner: "Mulkdor",
  founder: "Ta’sischi",
  rector: "Rektor",
  vice_rector_academic: "O‘quv ishlari bo‘yicha prorektor",
  administrator: "Administrator",
  registrar: "Registrator ofisi",
  dean: "Dekan",
  deputy_dean: "Dekan o‘rinbosari",
  department_head: "Kafedra mudiri",
  finance_manager: "Moliya rahbari",
  accountant: "Hisobchi",
  hr_manager: "Kadrlar bo‘limi",
  methodist: "Metodist",
  lecturer: "O‘qituvchi / professor",
  advisor: "Tyutor / akademik maslahatchi",
  student: "Talaba",
});

export const STUDENT_STATUS_LABELS = Object.freeze({
  active: "Faol",
  academic_leave: "Akademik ta’til",
  retained: "Kursda qoldirilgan",
  transferred: "Ko‘chirilgan",
  expelled: "Chetlashtirilgan",
  reinstated: "Tiklangan",
  graduated: "Bitirgan",
});

export const ONBOARDING_STEPS = [
  {
    key: "identity",
    label: "OTM",
    anchor: "institute-identity",
    message:
      "OTM turi, mulkchilik shakli, nomi va hududini tanlang. Men maydonlarni tushuntiraman, lekin vakolat yoki hujjatni sizning o‘rningizga tasdiqlamayman.",
  },
  {
    key: "academic_policy",
    label: "Akademik tartib",
    anchor: "institute-academic-policy",
    message:
      "Kredit-modul, 5 ballik yoki OTMga xos baholashni tanlang. Kredit soati, GPA chegarasi va davrlar barcha OTM uchun bir xil emas, shuning uchun ular versiyalanadi.",
  },
  {
    key: "structure",
    label: "Tuzilma",
    anchor: "institute-structure",
    message:
      "Birinchi fakultet va kafedrani kiriting. Keyin boshqa fakultet va kafedralarni alohida qo‘sha olasiz.",
  },
  {
    key: "program",
    label: "Dastur",
    anchor: "institute-program",
    message:
      "Ta’lim yo‘nalishi, daraja, ta’lim shakli va davomiyligini kiriting. O‘quv reja shu dastur versiyasiga bog‘lanadi.",
  },
  {
    key: "calendar",
    label: "O‘quv yili",
    anchor: "institute-calendar",
    message:
      "O‘quv yili va birinchi davr sanalarini belgilang. Ro‘yxatdan o‘tish, imtihon va ta’til oynalari keyin kalendarda boshqariladi.",
  },
  {
    key: "team",
    label: "Jamoa",
    anchor: "institute-team",
    message:
      "Rektor, registrator, dekan, kafedra mudiri, o‘qituvchi, tyutor va hisobchi alohida vakolat bilan ishlaydi. AI avatar hech kimga rol bera olmaydi.",
  },
  {
    key: "finance",
    label: "Kontrakt",
    anchor: "institute-finance",
    message:
      "Kontrakt ishlatiladimi va to‘lov davri qandayligini belgilang. HEMIS, kontrakt.edu.uz va Billing faqat haqiqiy integratsiya o‘rnatilgandan keyin ulanadi.",
  },
  {
    key: "review",
    label: "Tekshirish",
    anchor: "institute-review",
    message:
      "Oxirgi tekshiruv. Institut faqat siz tasdiqlash tugmasini bosganingizdan keyin yaratiladi; qoralama o‘zi e’lon qilinmaydi.",
  },
];

export const MANAGEMENT_MENU = [
  "overview",
  "structure",
  "curriculum",
  "schedule",
  "attendance",
  "gradebook",
  "exams",
  "students",
  "transcripts",
  "finance",
  "analytics",
  "staff",
  "settings",
];

const ACADEMIC_MANAGEMENT = [
  "overview",
  "structure",
  "curriculum",
  "schedule",
  "attendance",
  "gradebook",
  "exams",
  "students",
  "transcripts",
  "analytics",
  "staff",
  "settings",
];

const ROLE_MENU = {
  owner: ["overview", "finance", "analytics", "staff", "settings"],
  founder: ["overview", "finance", "analytics", "staff", "settings"],
  rector: MANAGEMENT_MENU,
  vice_rector_academic: ACADEMIC_MANAGEMENT,
  administrator: [
    "overview",
    "structure",
    "schedule",
    "students",
    "staff",
    "settings",
  ],
  registrar: [
    "overview",
    "curriculum",
    "schedule",
    "attendance",
    "gradebook",
    "exams",
    "students",
    "transcripts",
    "analytics",
  ],
  dean: ACADEMIC_MANAGEMENT,
  deputy_dean: ACADEMIC_MANAGEMENT,
  department_head: [
    "overview",
    "curriculum",
    "schedule",
    "attendance",
    "gradebook",
    "exams",
    "students",
    "analytics",
    "staff",
  ],
  finance_manager: ["overview", "students", "finance", "analytics"],
  accountant: ["overview", "students", "finance", "analytics"],
  hr_manager: ["overview", "staff", "analytics"],
  methodist: [
    "overview",
    "curriculum",
    "schedule",
    "gradebook",
    "exams",
    "analytics",
  ],
  lecturer: [
    "overview",
    "curriculum",
    "schedule",
    "attendance",
    "gradebook",
    "exams",
    "analytics",
  ],
  advisor: [
    "overview",
    "schedule",
    "attendance",
    "students",
    "transcripts",
    "analytics",
  ],
  student: [
    "overview",
    "curriculum",
    "schedule",
    "attendance",
    "gradebook",
    "exams",
    "transcripts",
    "finance",
  ],
};

const TOUR_MESSAGES = {
  overview:
    "Bosh sahifada sizga ruxsat etilgan o‘quv, davomat, moliya va ogohlantirishlar jamlanadi.",
  structure:
    "Fakultet, kafedra, ta’lim dasturi va akademik guruhlar ierarxiyasi shu bo‘limda. Dekan va mudir faqat o‘z doirasini ko‘radi.",
  curriculum:
    "O‘quv reja versiyasi, majburiy yoki tanlov fanlari, prerekvizit, kredit va soatlar shu yerda saqlanadi. Nashr qilingan reja o‘rniga yangi versiya yaratiladi.",
  schedule:
    "Jadval avval qoralama bo‘ladi. Xona, guruh va o‘qituvchi to‘qnashuvi serverda tekshirilgach vakolatli inson e’lon qiladi.",
  attendance:
    "Davomat fan va dars kesimida yuritiladi. 25 foiz va 74 soat chegaralari faqat ogohlantirish beradi; tizim talabani avtomatik chetlashtirmaydi.",
  gradebook:
    "Baholar qoralama, tasdiqlangan va yopilgan holatlarda ajratiladi. Yakuniy baho va GPA serverdagi tasdiqlangan qoidalardan hisoblanadi.",
  exams:
    "Imtihon qoralamasi, e’lon qilish, javoblarni xavfsiz saqlash va tekshirish alohida bosqichlarda bajariladi.",
  students:
    "Talaba, guruh, individual fan tanlovi va holat tarixini ko‘rasiz. Ko‘chirish, ta’til, chetlashtirish yoki tiklash faqat buyruq va inson tasdig‘i bilan amalga oshadi.",
  transcripts:
    "Transkript faqat yopilgan baholar va kreditlar asosida serverda tuziladi. Talaba faqat o‘z transkriptini ko‘radi.",
  finance:
    "Kontrakt, hisob, to‘lov va qarzdorlik shu yerda. AI avatar pul operatsiyasini bajarmaydi.",
  analytics:
    "Akademik o‘sish, davomat va moliyaviy ko‘rsatkichlar rol va fakultet/kafedra doirasida jamlanadi.",
  staff:
    "Xodimning roli va doirasi alohida beriladi. AI avatar vakolat bermaydi va xodimni o‘zi biriktirmaydi.",
  settings:
    "OTMning siyosat versiyasi, davrlar, baholash mezoni va AI yordamchi sozlamalari shu bo‘limda.",
};

export function menuForRoles(roles = []) {
  const allowed = new Set(["overview"]);
  roles.forEach((role) => {
    (ROLE_MENU[role] || ["overview"]).forEach((key) => allowed.add(key));
  });
  return MANAGEMENT_MENU.filter((key) => allowed.has(key));
}

export function normalizeMenu(serverMenu, roles = []) {
  if (!Array.isArray(serverMenu) || !serverMenu.length) {
    return menuForRoles(roles).map((key) => ({ key, label: key }));
  }
  const aliases = {
    faculties: "structure",
    departments: "structure",
    programs: "structure",
    groups: "structure",
    cohorts: "structure",
    academics: "curriculum",
    curricula: "curriculum",
    course_offerings: "curriculum",
    grades: "gradebook",
    transcript: "transcripts",
    contracts: "finance",
    invoices: "finance",
    payments: "finance",
  };
  const normalized = serverMenu
    .map((item) =>
      typeof item === "string"
        ? { key: aliases[item] || item, label: aliases[item] || item }
        : { ...item, key: aliases[item.key] || item.key },
    )
    .filter((item) => MANAGEMENT_MENU.includes(item.key));
  return [...new Map(normalized.map((item) => [item.key, item])).values()];
}

export function tourForRoles(roles = [], menuKeys) {
  const allowed = new Set(menuKeys || menuForRoles(roles));
  return MANAGEMENT_MENU.filter((key) => allowed.has(key)).map((key) => ({
    key,
    anchor: `institute-menu-${key}`,
    message: TOUR_MESSAGES[key],
  }));
}

export function hasPermission(permissions, key) {
  return Array.isArray(permissions) && permissions.includes(key);
}

export const ASSISTANT_DRAFT_FIELDS = Object.freeze({
  curriculum: new Set([
    "title",
    "academic_year_id",
    "term_id",
    "grading_system",
  ]),
  schedule: new Set([
    "course_offering_id",
    "lesson_date",
    "starts_at",
    "duration_minutes",
  ]),
});

export const ASSISTANT_SAFE_ACTIONS = new Set([
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
