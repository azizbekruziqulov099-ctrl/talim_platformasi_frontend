export const CENTER_TYPES = [
  {
    value: "private_center",
    label: "Xususiy o‘quv markazi",
    ownership: "private",
    operatorModel: "center",
    hint: "Filial, guruh, to‘lov va qarzdorlik nazorati bilan",
  },
  {
    value: "public_center",
    label: "Davlat o‘quv markazi",
    ownership: "public",
    operatorModel: "center",
    hint: "Davlat muassasasiga mos boshqaruv va tasdiqlash",
  },
  {
    value: "independent_tutor",
    label: "Mustaqil repetitor",
    ownership: "private",
    operatorModel: "independent_tutor",
    hint: "Bitta o‘qituvchi uchun sodda guruh va individual darslar",
  },
];

export const CENTER_ROLES = {
  system_admin: "Tizim administratori",
  owner: "Mulkdor",
  founder: "Ta’sischi",
  director: "Direktor",
  administrator: "Administrator",
  academic_manager: "O‘quv ishlari rahbari",
  methodist: "Metodist",
  receptionist: "Qabulxona",
  accountant: "Hisobchi",
  teacher: "O‘qituvchi",
  student: "O‘quvchi",
  parent: "Ota-ona",
};

export const COURSE_FORMATS = [
  { value: "group", label: "Guruh darsi" },
  { value: "individual", label: "Individual dars" },
  { value: "intensive", label: "Intensiv kurs" },
  { value: "club", label: "To‘garak" },
  { value: "exam_prep", label: "Imtihonga tayyorlov" },
];

export const DELIVERY_FORMATS = [
  { value: "offline", label: "Markazda" },
  { value: "online_live", label: "Jonli onlayn" },
  { value: "hybrid", label: "Aralash" },
];

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
export const IELTS_BANDS = Array.from({ length: 19 }, (_, index) =>
  (index * 0.5).toFixed(1),
);
export const IELTS_TYPES = [
  { value: "academic", label: "IELTS Academic" },
  { value: "general", label: "IELTS General Training" },
];

export const WEEK_DAYS = [
  { value: 1, short: "Du", label: "Dushanba" },
  { value: 2, short: "Se", label: "Seshanba" },
  { value: 3, short: "Ch", label: "Chorshanba" },
  { value: 4, short: "Pa", label: "Payshanba" },
  { value: 5, short: "Ju", label: "Juma" },
  { value: 6, short: "Sh", label: "Shanba" },
  { value: 7, short: "Ya", label: "Yakshanba" },
];

export const ONBOARDING_STEPS = [
  {
    key: "identity",
    label: "Markaz",
    anchor: "center-identity",
    message:
      "Markaz turi, nomi va hududini tanlang. Bu ma’lumot raqamli ish maydonini tayyorlaydi; men uni sizning o‘rningizga tasdiqlamayman.",
  },
  {
    key: "branches",
    label: "Filial",
    anchor: "center-branches",
    message:
      "Bosh filial va kerak bo‘lsa boshqa filiallarni kiriting. Har bir xodim, xona va kurs keyin aniq filialga bog‘lanadi.",
  },
  {
    key: "rooms",
    label: "Xonalar",
    anchor: "center-rooms",
    message:
      "Xonalar sig‘imi va turini tanlang. Jadval bir vaqtda bitta xonaga ikki dars qo‘yilishini oldini oladi.",
  },
  {
    key: "subjects",
    label: "Fanlar",
    anchor: "center-subjects",
    message:
      "Ingliz tili, matematika, fizika yoki boshqa fanlarni tanlang. Keyinchalik yangi fan qo‘shish mumkin.",
  },
  {
    key: "staff",
    label: "Jamoa",
    anchor: "center-staff",
    message:
      "Direktor, administrator, o‘qituvchi va hisobchi alohida rol bilan ishlaydi. AI avatar hech kimga o‘zi vakolat bera olmaydi.",
  },
  {
    key: "courses",
    label: "Kurslar",
    anchor: "center-courses",
    message:
      "Guruh, individual, intensiv, to‘garak yoki imtihon kursining jadvali, darajasi, sig‘imi va narxini qoralama qilib belgilang.",
  },
  {
    key: "billing",
    label: "To‘lov",
    anchor: "center-billing",
    message:
      "To‘lov davri va standart muddatni tanlang. Yordamchi hech qachon to‘lovni tasdiqlamaydi yoki pul operatsiyasini bajarmaydi.",
  },
  {
    key: "preview",
    label: "Tekshirish",
    anchor: "center-preview",
    message:
      "Oxirgi tekshiruv. Markaz faqat siz tasdiqlash tugmasini bosganingizdan keyin yaratiladi.",
  },
];

const MANAGEMENT_MENU = [
  "overview",
  "courses",
  "groups",
  "students",
  "schedule",
  "lessons",
  "attendance",
  "assessments",
  "payments",
  "analytics",
  "staff",
  "settings",
];

const ROLE_MENU = {
  owner: MANAGEMENT_MENU,
  founder: MANAGEMENT_MENU,
  director: MANAGEMENT_MENU,
  administrator: MANAGEMENT_MENU,
  academic_manager: [
    "overview",
    "courses",
    "groups",
    "students",
    "schedule",
    "lessons",
    "attendance",
    "assessments",
    "analytics",
    "staff",
  ],
  methodist: [
    "overview",
    "courses",
    "groups",
    "schedule",
    "lessons",
    "assessments",
    "analytics",
  ],
  receptionist: [
    "overview",
    "groups",
    "students",
    "schedule",
    "payments",
  ],
  accountant: ["overview", "students", "payments", "analytics"],
  teacher: [
    "overview",
    "courses",
    "groups",
    "schedule",
    "lessons",
    "attendance",
    "assessments",
  ],
  student: [
    "overview",
    "courses",
    "schedule",
    "lessons",
    "attendance",
    "assessments",
    "payments",
  ],
  parent: [
    "overview",
    "courses",
    "schedule",
    "attendance",
    "assessments",
    "payments",
  ],
};

const TOUR_MESSAGES = {
  overview:
    "Bosh sahifa bugungi darslar, faol guruhlar, davomat va qarzdorlikning sizga ruxsat etilgan qismini jamlaydi.",
  courses:
    "Kursda fan, shakl, daraja yoki maqsad, narx va sig‘im belgilanadi. IELTS va CEFR alohida maqsad sifatida saqlanadi.",
  groups:
    "Guruhlar o‘qituvchi, kurs, filial va jadvalni o‘quvchilar bilan bog‘laydi.",
  students:
    "Qabul, faol o‘quvchi va kutish ro‘yxati shu yerda. Ota-ona faqat bog‘langan farzand ma’lumotini ko‘radi.",
  schedule:
    "Hafta kunlari va vaqtlarni tanlang. Xona, o‘qituvchi va guruh to‘qnashuvi serverda tekshiriladi.",
  lessons:
    "Dars reja va uy vazifasida oddiy matn bilan birga LaTeX formulalarini ham saqlash va ko‘rsatish mumkin.",
  attendance:
    "Davomat dars va sana bo‘yicha belgilanadi; yozish faqat vakolatli xodimga ochiladi.",
  assessments:
    "Test va imtihon avval qoralama bo‘ladi. O‘qituvchi alohida tasdiqlagach o‘quvchiga e’lon qilinadi.",
  payments:
    "Hisob, to‘lov va qarzdorlik alohida yuritiladi. AI yordamchi pul operatsiyasini bajarmaydi.",
  analytics:
    "Natija, davomat, o‘sish va moliyaviy ko‘rsatkichlar faqat rol doirasida jamlanadi.",
  staff:
    "Xodimlarga aniq rol bering. Har bir rol faqat o‘z ishiga tegishli menyu va amalni oladi.",
  settings:
    "Filial, xona, AI yordamchi va asosiy markaz sozlamalarini boshqarasiz.",
};

export function menuForRoles(roles = []) {
  const allowed = new Set(["overview"]);
  roles.forEach((role) => {
    (ROLE_MENU[role] || ["overview"]).forEach((key) => allowed.add(key));
  });
  return MANAGEMENT_MENU.filter((key) => allowed.has(key));
}

export function tourForRoles(roles = [], menuKeys) {
  const allowed = new Set(menuKeys || menuForRoles(roles));
  return MANAGEMENT_MENU.filter((key) => allowed.has(key)).map((key) => ({
    key,
    anchor: `center-menu-${key}`,
    message: TOUR_MESSAGES[key],
  }));
}

export const SUBJECT_PRESETS = [
  "Ingliz tili",
  "Ona tili",
  "Rus tili",
  "Matematika",
  "Algebra",
  "Geometriya",
  "Fizika",
  "Kimyo",
  "Biologiya",
  "Tarix",
  "Geografiya",
  "Informatika",
  "Boshlang‘ich ta’lim",
];

export function hasPermission(permissions, key) {
  return Array.isArray(permissions) && permissions.includes(key);
}

export function normalizeMenu(serverMenu, roles) {
  if (Array.isArray(serverMenu) && serverMenu.length) {
    const aliases = {
      branches: "settings",
      rooms: "settings",
      subjects: "settings",
      enrollments: "students",
      grades: "attendance",
      plans: "lessons",
      lesson_plans: "lessons",
      homework: "lessons",
      billing: "payments",
      workload: "analytics",
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
  return menuForRoles(roles).map((key) => ({ key, label: key }));
}
