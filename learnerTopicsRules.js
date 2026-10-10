// «O'rganish» sahifasining sof qoidalari (brauzersiz sinash mumkin).

const fold = value => String(value ?? '').toLowerCase().replace(/[‘’ʻʼ`']/g, '').replace(/\s+/g, ' ').trim();

// Qidiruv va «Darsi bor / Testi bor» filtri; bo'sh sinf guruhlari tashlanadi.
export function filterTopics(subject, query = '', filter = 'all') {
  const q = fold(query);
  return (subject?.sinflar || []).map(group => ({
    ...group,
    mavzular: group.mavzular.filter(topic =>
      (!q || fold(topic.nomi).includes(q)) &&
      (filter !== 'dars' || topic.dars_bor) &&
      (filter !== 'test' || topic.savol_soni > 0)),
  })).filter(group => group.mavzular.length);
}

export function subjectStats(subject) {
  const topics = (subject?.sinflar || []).flatMap(group => group.mavzular);
  return {
    topics: topics.length,
    lessons: topics.filter(topic => topic.dars_bor).length,
    tested: topics.filter(topic => topic.savol_soni > 0).length,
  };
}

// Dars xonasi aynan darsi bor kodni, test esa mavzuning barcha kodlarini ishlatadi.
export function topicTarget(subject, group, topic, type) {
  const lessonCode = (topic.darsli_kodlar || [])[0] || topic.topic_codes?.[0];
  return {
    ...topic,
    topic_code: lessonCode,
    lesson_code: lessonCode,
    topic_name: topic.nomi,
    subject: subject?.nom,
    fan: subject?.nom,
    grade: group?.sinf,
    institution_type: type,
    dars_turi: subject?.dars_turi,
  };
}

// Sahifa tepasidagi tushuntirish: kim ekaniga qarab.
export function viewerHeadline(viewer, type, typeLabel) {
  if (viewer?.teacher) return 'Ish joyingizga tegishli fan, mavzu, kitob darslari va testlar.';
  const profile = viewer?.profile;
  if (type === 'universitet' && profile?.yonalish_nomi) return `${profile.yonalish_nomi} · ${profile.kurs}-kurs: fanni tanlang, keyin mavzuni oching.`;
  if (type === 'bogcha') return 'Bog‘cha mashg‘ulotlari: mavzuni tanlang va darsni boshlang.';
  if (type === 'markaz') return 'O‘quv markazi kurslari: fanni tanlang, keyin mavzuni oching.';
  return `${typeLabel || 'Maktab'}: fanni tanlang, mavzuni toping — darsni boshlang yoki test ishlang.`;
}
