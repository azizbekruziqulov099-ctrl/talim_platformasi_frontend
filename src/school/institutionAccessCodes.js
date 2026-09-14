const ROLE_LABELS = Object.freeze({
  oquvchi: 'O‘quvchi', student: 'O‘quvchi', talaba: 'Talaba',
  'ota-ona': 'Ota-ona', ota_ona: 'Ota-ona', parent: 'Ota-ona',
  oqituvchi: 'O‘qituvchi', fan_oqituvchisi: 'Fan o‘qituvchisi',
  direktor: 'Direktor', psixolog: 'Psixolog', kotib: 'Kotib',
  zam_direktor_uquv: 'O‘quv ishlari bo‘yicha direktor o‘rinbosari',
  zam_direktor_tarbiya: 'Ma’naviy ishlar bo‘yicha direktor o‘rinbosari',
});

export function accessCodeRole(item) {
  return ROLE_LABELS[item?.role] || item?.role_label || item?.role || 'Xodim';
}

export function accessCodeFile(result) {
  const items = Array.isArray(result?.access_codes) ? result.access_codes : [];
  if (!items.length) return null;
  const lines = [
    'MUASSASAGA SHAXSIY ULANISH KODLARI', '',
    'Avval saytga Telegram yoki Google orqali kiring.',
    'Ta’lim maydoni → Admin bergan ulanish kodim bor.',
    'Ta’lim ochilgan bo‘lsa: Profil → Muassasaga ulanish.',
    'Har bir kod faqat yonida ko‘rsatilgan kishiga beriladi. Bu shaxsiy hisob paroli emas.', '',
  ];
  for (const item of items) {
    if (typeof item?.name !== 'string' || !item.name.trim() || typeof item?.code !== 'string' || !/^[A-Z0-9]{12}$/.test(item.code)) {
      throw new Error('Ayrim ulanish kodlari to‘liq qaytmadi. Natijani yopmasdan administratorga murojaat qiling.');
    }
    lines.push(`F.I.Sh.: ${item.name}`, `Kim uchun: ${accessCodeRole(item)}`, `Ulanish kodi: ${item.code}`, '');
  }
  return { filename: 'muassasa_shaxsiy_ulanish_kodlari.txt', text: '\uFEFF' + lines.join('\r\n'), count: items.length };
}
