export const SCHOOL_TYPES = [
  {
    value: "public_general",
    label: "Oddiy davlat maktabi",
    ownership: "public",
    hint: "Umumta'lim maktabining standart 45 daqiqalik tartibi",
  },
  {
    value: "public_idum",
    label: "IDUM",
    ownership: "public",
    hint: "Ixtisoslashtirilgan davlat umumta'lim maktabi",
  },
  {
    value: "public_presidential",
    label: "Prezident maktabi",
    ownership: "public",
    hint: "Maxsus ta'lim modeli va kengaytirilgan resurslar",
  },
  {
    value: "private_general",
    label: "Xususiy maktab",
    ownership: "private",
    hint: "Dars va tanaffus vaqtini maktab o'zi belgilaydi",
  },
];

export const SCHOOL_ROLES = {
  system_admin: "Tizim administratori",
  owner: "Mulkdor",
  founder: "Ta'sischi",
  director: "Direktor",
  academic_deputy: "O'quv ishlari bo'yicha direktor o'rinbosari",
  spiritual_deputy: "Ma'naviy-ma'rifiy ishlar bo'yicha direktor o'rinbosari",
  administrator: "Administrator",
  methodist: "Metodist",
  teacher: "O'qituvchi",
  homeroom_teacher: "Sinf rahbari",
  psychologist: "Psixolog",
  social_pedagogue: "Ijtimoiy pedagog",
  librarian: "Kutubxonachi",
  nurse: "Hamshira",
  accountant: "Hisobchi",
  it_admin: "IT administrator",
  laboratory_assistant: "Laborant",
  security: "Qo'riqlash xodimi",
};

export const ONBOARDING_STEPS = [
  {
    key: "identity",
    label: "Maktab",
    anchor: "school-name",
    message:
      "Maktab turi, nomi va hududini tanlang. Men maydonlarni tushuntiraman, lekin ma'lumotni sizning o'rningizga tasdiqlamayman.",
  },
  {
    key: "shifts",
    label: "Smena",
    anchor: "school-shifts",
    message:
      "Bir yoki ikki smenani tanlang. Davlat maktabida 45 daqiqalik dars, 5 daqiqalik tanaffus va uchinchi darsdan keyin 10 daqiqa tavsiya etiladi.",
  },
  {
    key: "buildings",
    label: "Bino va xona",
    anchor: "school-buildings",
    message:
      "Bino, qavat va xonalarni kiriting. Dars jadvali bir vaqtda bitta xonaga ikki sinfni qo'ymaslik uchun shu ma'lumotdan foydalanadi.",
  },
  {
    key: "classes",
    label: "Sinf va parallel",
    anchor: "school-classes",
    message:
      "Maktabdagi sinflar va A, B, D kabi parallellarni belgilang. Keyin o'quvchilar shu sinflarga biriktiriladi.",
  },
  {
    key: "staff",
    label: "Xodimlar",
    anchor: "school-staff",
    message:
      "Rahbariyat va o'qituvchilar keyin taklif orqali qo'shiladi. Har kim faqat lavozimiga mos menyuni ko'radi.",
  },
  {
    key: "workload",
    label: "Fan va yuklama",
    anchor: "school-workload",
    message:
      "Fanlar, sinflar va haftalik soatlarni tekshiring. O'qituvchi, sinf va xona yuklamasi dars jadvalining asosidir.",
  },
  {
    key: "calendar",
    label: "O'quv kalendari",
    anchor: "school-calendar",
    message:
      "O'quv yili, ish kunlari, sanasi qat'iy bayram va ta'tillarni belgilang. Bekor bo'lgan darsning aniq sanasi alohida istisno sifatida saqlanadi.",
  },
  {
    key: "review",
    label: "Tekshirish",
    anchor: "school-review",
    message:
      "Hamma sozlamani tekshiring. Maktab faqat siz tasdiqlash tugmasini bosganingizdan keyin yaratiladi.",
  },
];

const MANAGEMENT_MENU = [
  "overview",
  "timetable",
  "calendar",
  "attendance",
  "grades",
  "classes",
  "teachers",
  "workloads",
  "buildings",
  "payments",
  "settings",
];

const ROLE_MENU = {
  director: MANAGEMENT_MENU,
  academic_deputy: MANAGEMENT_MENU,
  administrator: MANAGEMENT_MENU,
  owner: MANAGEMENT_MENU,
  founder: MANAGEMENT_MENU,
  system_admin: MANAGEMENT_MENU,
  methodist: [
    "overview",
    "timetable",
    "calendar",
    "grades",
    "teachers",
    "workloads",
  ],
  spiritual_deputy: [
    "overview",
    "calendar",
    "attendance",
    "classes",
    "teachers",
  ],
  teacher: ["overview", "timetable", "calendar", "attendance", "grades"],
  homeroom_teacher: [
    "overview",
    "timetable",
    "calendar",
    "attendance",
    "grades",
    "classes",
  ],
  psychologist: ["overview", "calendar", "attendance", "classes"],
  librarian: ["overview", "calendar"],
  nurse: ["overview", "calendar", "attendance", "classes"],
  accountant: ["overview", "calendar", "payments", "settings"],
  security: ["overview", "calendar"],
};

export function menuForRoles(roles = []) {
  const allowed = new Set(["overview"]);
  roles.forEach((role) => {
    (ROLE_MENU[role] || ["overview", "calendar"]).forEach((item) =>
      allowed.add(item),
    );
  });
  return MANAGEMENT_MENU.filter((item) => allowed.has(item));
}

export function visibleMenuForWorkspace(roles = [], workspace = {}) {
  return menuForRoles(roles).filter(
    (key) =>
      key !== "payments" ||
      workspace.ownership_type === "private" ||
      workspace.school_type === "private_general",
  );
}

const TOUR_MESSAGES = {
  overview:
    "Bosh sahifada smena, bugungi dars, davomat va jadval ogohlantirishlari jamlanadi.",
  timetable:
    "Jadval avval qoralama yaratiladi. To'qnashuvlar tekshirilgach vakolatli rahbar alohida tasdiqlab e'lon qiladi.",
  calendar:
    "Kalendar dars, bayram, ta'til, nazorat va qo'shimcha mashg'ulotlarni bitta vaqt tizimiga bog'laydi.",
  attendance:
    "Davomat sinf va sana bo'yicha belgilanadi. Siz faqat vakolatingizdagi sinflarni ko'rasiz.",
  grades:
    "Baholar fan, sinf, davr va topshiriq bilan yoziladi; har bir o'zgarish tarixda saqlanadi.",
  classes:
    "Sinf va parallel, sinf rahbari, smena va o'quvchilar shu bo'limda boshqariladi.",
  teachers:
    "O'qituvchining bo'sh vaqti, metod kuni va ketma-ket dars cheklovlari shu yerda belgilanadi.",
  workloads:
    "Fan yuklamasini o'qituvchi va sinfga bog'lang. Haftalik soat jadval generatoriga uzatiladi.",
  buildings:
    "Bino, qavat va xonalar jadvaldagi xona to'qnashuvini oldini oladi.",
  payments:
    "To'lovlar faqat xususiy maktabda ko'rinadi. Yangi v2 hisob-kitobi tayyor bo'lmaguncha eski moliya alohida Legacy oynasida qoladi.",
  settings:
    "Maktabning asosiy sozlamalari faqat vakolatli foydalanuvchi tasdig'i bilan o'zgaradi.",
};

export function tourForSchoolRoles(roles = []) {
  return menuForRoles(roles).map((key) => ({
    key,
    anchor: `school-menu-${key}`,
    message: TOUR_MESSAGES[key],
  }));
}

export function defaultBellSchedule({
  ownershipType = "public",
  shifts = 1,
} = {}) {
  const isPublic = ownershipType === "public";
  return {
    lesson_minutes: 45,
    short_break_minutes: 5,
    long_break_after_lesson: 3,
    long_break_minutes: 10,
    custom_times_enabled: !isPublic,
    shifts: [
      {
        number: 1,
        starts_at: "08:00",
        max_lessons: Number(shifts) === 2 ? 6 : 7,
      },
      ...(Number(shifts) === 2
        ? [{ number: 2, starts_at: "13:10", max_lessons: 6 }]
        : []),
    ],
  };
}

export function normalizeSectionLetters(value) {
  const letters = String(value || "")
    .toUpperCase()
    .split(/[\s,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
  return [...new Set(letters)].slice(0, 20);
}
