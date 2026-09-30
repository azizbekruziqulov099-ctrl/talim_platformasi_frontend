export const ONBOARDING_STEPS = [
  {
    key: "basics",
    label: "Asosiy ma'lumot",
    anchor: "kg-name",
    message:
      "Avval bog'chaning platformadagi nomi va hududini kiritamiz. Bu yuridik ro'yxatdan o'tkazish emas, raqamli ish maydonidir.",
  },
  {
    key: "schedule",
    label: "Ish tartibi",
    anchor: "kg-work-start",
    message:
      "Endi ish kunlari va vaqtini tanlaymiz. Kalendar, davomat va xodimlar rejasi keyin shu tartibga tayanadi.",
  },
  {
    key: "groups",
    label: "Guruhlar",
    anchor: "kg-group-name",
    message:
      "Guruhlarni nomi, yosh oralig'i, sig'imi va xonasi bilan kiritamiz. Istasangiz guruhni bog'cha ochilgandan keyin ham qo'shasiz.",
  },
  {
    key: "team",
    label: "Jamoa",
    anchor: "kg-team-info",
    message:
      "Bog'cha ochilgach xodimlarga maxsus taklif kodi beriladi. Har kim faqat o'z lavozimiga mos menyularni ko'radi.",
  },
  {
    key: "preview",
    label: "Tekshirish",
    anchor: "kg-preview",
    message:
      "Oxirgi tekshiruv. Men ma'lumotni o'zgartirmayman va sizning tasdig'ingizsiz bog'chani yaratmayman.",
  },
];

export const ROLE_TOURS = {
  director: [
    {
      key: "overview",
      anchor: "kg-menu-overview",
      message:
        "Bosh sahifada guruh, xodim, bola, bugungi davomat va yaqin kalendar holati jamlanadi.",
    },
    {
      key: "groups",
      anchor: "kg-menu-groups",
      message:
        "Guruhlar bo'limida yosh oralig'i, xona, sig'im va tarbiyachini boshqarasiz.",
    },
    {
      key: "staff",
      anchor: "kg-menu-staff",
      message:
        "Xodimlar bo'limida lavozimga mos taklif kodi yaratasiz va qo'shilish so'rovlarini tasdiqlaysiz.",
    },
    {
      key: "children",
      anchor: "kg-menu-children",
      message:
        "Bolalar bo'limida guruh va ota-ona aloqa ma'lumotlari tartibli saqlanadi.",
    },
    {
      key: "attendance",
      anchor: "kg-menu-attendance",
      message:
        "Davomat bo'limida guruh kesimida kelgan, kechikkan va kelmagan bolalar belgilanadi.",
    },
    {
      key: "daily_reports",
      anchor: "kg-menu-daily_reports",
      message:
        "Kunlik hisobot ovqatlanish, uyqu, kayfiyat va mashg'ulotni bola kesimida saqlaydi.",
    },
    {
      key: "calendar",
      anchor: "kg-menu-calendar",
      message:
        "Kalendar barcha jarayonning tayanchi. Voqea e'lon qilinishidan oldin siz alohida tasdiqlaysiz.",
    },
    {
      key: "payments",
      anchor: "kg-menu-payments",
      message:
        "Xususiy bog'chada to'lov rejasi, oylik hisob va tasdiqlangan to'lov shu bo'limda boshqariladi.",
    },
    {
      key: "settings",
      anchor: "kg-menu-settings",
      message:
        "Sozlamalarda ish vaqti, ish kunlari, sig'im va AI yordamchi ko'rinishini o'zgartirasiz.",
    },
  ],
  educator: [
    {
      key: "overview",
      anchor: "kg-menu-overview",
      message:
        "Bu sizning ish holatingiz: guruhlar, bolalar, bugungi davomat va yaqin tadbirlar.",
    },
    {
      key: "groups",
      anchor: "kg-menu-groups",
      message:
        "Guruhlar bo'limidan o'zingizga biriktirilgan guruh va bolalarni ko'rasiz.",
    },
    {
      key: "children",
      anchor: "kg-menu-children",
      message:
        "Bolalar bo'limida faqat vakolatingiz doirasidagi ro'yxat va zarur aloqa ma'lumoti ko'rinadi.",
    },
    {
      key: "attendance",
      anchor: "kg-menu-attendance",
      message:
        "Davomatni har bola uchun bir bosishda belgilang; xato bo'lsa shu kun ichida tuzatasiz.",
    },
    {
      key: "daily_reports",
      anchor: "kg-menu-daily_reports",
      message:
        "Kunlik hisobotda ovqatlanish, uyqu, kayfiyat va faoliyatni har bir bola uchun saqlaysiz.",
    },
    {
      key: "calendar",
      anchor: "kg-menu-calendar",
      message:
        "Kalendar bugungi mashg'ulot va tadbirlarni ketma-ket ko'rsatadi.",
    },
  ],
  accountant: [
    {
      key: "overview",
      anchor: "kg-menu-overview",
      message:
        "Bosh sahifada sizga tegishli moliyaviy ko'rsatkich va yaqin muddatlar ko'rinadi.",
    },
    {
      key: "payments",
      anchor: "kg-menu-payments",
      message:
        "To'lovlar bo'limida reja yaratasiz, oy hisoblarini chiqarasiz va kelgan to'lovni tasdiqlab yozasiz.",
    },
    {
      key: "calendar",
      anchor: "kg-menu-calendar",
      message:
        "Kalendar to'lov muddati va umumiy bog'cha tadbirlarini ko'rsatadi.",
    },
  ],
  nurse: [
    {
      key: "overview",
      anchor: "kg-menu-overview",
      message: "Sizga bolalar sog'lig'i, davomat va kunlik holat bo'limlari ochilgan.",
    },
    {
      key: "children",
      anchor: "kg-menu-children",
      message:
        "Bolalar bo'limida allergiya va zarur aloqa ma'lumotini ko'rasiz.",
    },
    {
      key: "attendance",
      anchor: "kg-menu-attendance",
      message:
        "Davomatda kelish holati va sog'liq sababli yo'qlikni guruh kesimida ko'rasiz.",
    },
    {
      key: "daily_reports",
      anchor: "kg-menu-daily_reports",
      message:
        "Kunlik hisobotda bolaning kayfiyati, ovqatlanishi va uyqusini tekshirasiz.",
    },
    {
      key: "calendar",
      anchor: "kg-menu-calendar",
      message: "Kalendar tibbiy ko'rik va umumiy tadbirlarni ko'rsatadi.",
    },
  ],
  staff: [
    {
      key: "overview",
      anchor: "kg-menu-overview",
      message:
        "Sizga faqat lavozimingiz uchun ruxsat berilgan bo'limlar ko'rsatiladi.",
    },
    {
      key: "calendar",
      anchor: "kg-menu-calendar",
      message:
        "Kalendar orqali bugungi vazifa va yaqin tadbirlarni ko'rasiz.",
    },
  ],
};

export function tourForRoles(roles = []) {
  if (
    roles.some((role) =>
      [
        "owner",
        "founder",
        "director",
        "deputy_director",
        "administrator",
        "system_admin",
      ].includes(
        role,
      ),
    )
  ) {
    return ROLE_TOURS.director;
  }
  if (
    roles.some((role) =>
      ["educator", "assistant_educator", "methodist"].includes(role),
    )
  ) {
    return ROLE_TOURS.educator;
  }
  if (roles.includes("accountant")) return ROLE_TOURS.accountant;
  if (roles.includes("nurse")) return ROLE_TOURS.nurse;
  return ROLE_TOURS.staff;
}
