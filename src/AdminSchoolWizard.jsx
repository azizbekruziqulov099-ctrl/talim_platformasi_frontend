// SAMTM SCHOOL WIZARD V22.42 — bir xona 1- va 2-smenada navbat bilan ishlatiladi.
import React, { useEffect, useMemo, useState } from "react";

// Release: SAMTM-ADMIN-SCHOOL-WIZARD-V21.0-PLAN-SAFE
const CLASS_GRADES = Array.from({ length: 11 }, (_, index) => String(index + 1));
const CLASS_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export const CLASS_LANGUAGES = [
  { code: "uz", label: "O‘zbek", short: "UZ" },
  { code: "ru", label: "Rus", short: "RU" },
  { code: "en", label: "Ingliz", short: "EN" },
];
const languageLabel = (code) => (CLASS_LANGUAGES.find((item) => item.code === code) || CLASS_LANGUAGES[0]).label;
const emptyLanguageCounts = (uz = 0) => ({ uz, ru: 0, en: 0 });
const DEFAULT_GRADE_CONFIG = CLASS_GRADES.map((grade) => ({
  grade,
  counts: { 1: emptyLanguageCounts(1), 2: emptyLanguageCounts(0) },
}));
// Daraja rejasi: 1-smena (uz, ru, en) keyin 2-smena (uz, ru, en). Harflar A dan uzluksiz.
function gradePlan(item, shiftCount) {
  const plan = [];
  [1, 2].forEach((shift) => {
    if (shift === 2 && shiftCount !== 2) return;
    CLASS_LANGUAGES.forEach((lang) => {
      const count = Math.max(0, Number(item?.counts?.[shift]?.[lang.code]) || 0);
      for (let i = 0; i < count; i += 1) plan.push({ shift, language: lang.code });
    });
  });
  return plan.slice(0, CLASS_LETTERS.length);
}
const uniqueKey = (prefix, index = 0) => `${prefix}-${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`;

const emptyBuilding = (index = 0) => ({
  key: uniqueKey("building", index), name: index === 0 ? "Asosiy bino" : `${index + 1}-bino`,
  floors: 2, roomsPerFloor: 10, floorRoomCounts: [10, 10], scheme: "floor", customRooms: "", rooms: [],
});

const emptyClass = ({ grade = "", letter = "A", shift = 1, language = "uz" } = {}) => ({
  key: uniqueKey("class", `${grade}-${letter}`), grade, letter, shift, language,
  leader: null, psychologist: null, buildingKey: "", roomNumber: "",
});

export function normalizeSchoolClassName(value) {
  const match = String(value || "").trim().match(/^(1[01]|[1-9])\s*[-–—_ ]?\s*([A-Za-z])$/);
  return match ? `${match[1]}-${match[2].toUpperCase()}` : "";
}

function classNameOf(item) { return normalizeSchoolClassName(`${item.grade}-${item.letter}`); }
function sortedClasses(items) { return [...items].sort((a, b) => Number(a.grade) - Number(b.grade) || a.letter.localeCompare(b.letter)); }
function roomPoolKey(buildingKey, roomNumber) {
  return `${buildingKey}|${String(roomNumber || "").trim().toLocaleLowerCase("uz")}`;
}
function isTeachingRoom(room) {
  return Boolean(room) && room.darsga_yaroqli !== false && room.turi !== "non_teaching";
}

export function validateSchoolClassSequence(items, shiftCount) {
  const rows = (items || []).map((item) => ({
    item,
    name: classNameOf(item),
  }));
  if (rows.some((row) => !row.name)) return "Sinf parallelini bitta lotin harfi bilan kiriting: A–Z";
  if (new Set(rows.map((row) => row.name)).size !== rows.length) return "Bir xil sinf ikki marta kiritilgan";

  const byGrade = new Map();
  rows.forEach((row) => {
    const [grade, letter] = row.name.split("-");
    if (!byGrade.has(grade)) byGrade.set(grade, []);
    byGrade.get(grade).push({ ...row, grade, letter, shift: Number(row.item.shift) });
  });
  for (const [grade, gradeRows] of [...byGrade.entries()].sort((a, b) => Number(a[0]) - Number(b[0]))) {
    const ordered = [...gradeRows].sort((a, b) => a.letter.localeCompare(b.letter));
    const expected = CLASS_LETTERS.slice(0, ordered.length);
    const actual = ordered.map((row) => row.letter);
    if (actual.some((letter, index) => letter !== expected[index])) {
      return `${grade}-sinf parallellari A dan boshlab uzluksiz bo‘lishi kerak: ${expected.join(", ")}.`;
    }
    let secondShiftStarted = false;
    for (const row of ordered) {
      if (![1, 2].includes(row.shift) || (Number(shiftCount) === 1 && row.shift !== 1)) {
        return `${row.name} uchun smena maktab sozlamasiga mos emas.`;
      }
      if (row.shift === 2) secondShiftStarted = true;
      else if (secondShiftStarted) {
        return `${grade}-sinfda avval 1-smena parallellari, keyin 2-smena parallellari kelishi kerak.`;
      }
    }
  }
  return "";
}

function generateRooms(building) {
  const floors = Math.max(1, Math.min(20, Number(building.floors) || 1));
  const floorRoomCounts = Array.from({ length: floors }, (_, index) => Math.max(0, Math.min(100,
    Number(building.floorRoomCounts?.[index] ?? building.roomsPerFloor) || 0,
  )));
  const generated = [];
  let sequential = 1;
  for (let floor = 1; floor <= floors; floor += 1) {
    for (let index = 1; index <= floorRoomCounts[floor - 1]; index += 1) {
      const number = building.scheme === "floor" ? `${floor}${String(index).padStart(2, "0")}` : String(sequential);
      generated.push({ number, floor, turi: "classroom", darsga_yaroqli: true });
      sequential += 1;
    }
  }
  const custom = String(building.customRooms || "").split(/[,;\n]+/).map((item) => item.trim()).filter(Boolean).map((number) => {
    const numeric = Number.parseInt(number, 10);
    const guessedFloor = Number.isFinite(numeric) && numeric >= 100 ? Math.floor(numeric / 100) : 1;
    return {
      number,
      floor: Math.max(1, Math.min(floors, guessedFloor)),
      turi: "non_teaching",
      darsga_yaroqli: false,
    };
  });
  const unique = new Map();
  generated.forEach((room) => unique.set(room.number.toLocaleLowerCase("uz"), room));
  // Qo‘shimcha maydonga kiritilgan har qanday nom qat’iy ravishda xizmat
  // xonasi hisoblanadi; bir xil raqam bo‘lsa ham sinfga biriktirilmaydi.
  custom.forEach((room) => unique.set(room.number.toLocaleLowerCase("uz"), room));
  return [...unique.values()];
}

function PersonPicker({ token, apiBase, value, onChange, placeholder }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (value || query.trim().length < 2) { setResults([]); return undefined; }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`${apiBase}/api/admin/foydalanuvchi_qidir?token=${encodeURIComponent(token)}&ism=${encodeURIComponent(query.trim())}`);
        const data = await response.json();
        setResults(response.ok ? (data.natijalar || []) : []);
      } catch { setResults([]); } finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [apiBase, query, token, value]);

  if (value) return (
    <div className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 border" style={{ borderColor: "#B9CCDC", background: "#F1F7FB" }}>
      <span className="text-xs font-semibold" style={{ color: "#1B4B7A" }}>{value.full_name}</span>
      <button type="button" onClick={() => { onChange(null); setQuery(""); }} className="text-xs" style={{ color: "#8A5A1C" }}>✕</button>
    </div>
  );

  return <div className="relative">
    <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder} className="w-full px-3 py-2 rounded-xl border text-xs" style={{ borderColor: "#E5E1D8" }} />
    {loading && <span className="absolute right-3 top-2 text-xs" style={{ color: "#8A8578" }}>...</span>}
    {results.length > 0 && <div className="absolute z-30 left-0 right-0 mt-1 rounded-xl border bg-white shadow-lg p-1 max-h-44 overflow-auto" style={{ borderColor: "#E5E1D8" }}>
      {results.map((person) => <button type="button" key={person.user_id} onClick={() => { onChange(person); setQuery(""); setResults([]); }} className="w-full text-left rounded-lg px-3 py-2 text-xs hover:bg-slate-50">
        <b>{person.full_name}</b><span className="block" style={{ color: "#8A8578" }}>{person.role} · ID {person.user_id}</span>
      </button>)}
    </div>}
  </div>;
}

export default function AdminSchoolWizard({ token, apiBase, regions, districtsByRegion, onCancel, onCreated }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [schoolNumber, setSchoolNumber] = useState("");
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [shiftCount, setShiftCount] = useState(1);
  const [director, setDirector] = useState(null);
  const [skipBuildings, setSkipBuildings] = useState(false);
  const [buildings, setBuildings] = useState([emptyBuilding(0)]);
  const [gradeConfig, setGradeConfig] = useState(DEFAULT_GRADE_CONFIG);
  const [presetLanguage, setPresetLanguage] = useState("uz");
  const [classes, setClasses] = useState([]);
  const [classesPlanDirty, setClassesPlanDirty] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const roomPool = useMemo(() => skipBuildings ? [] : buildings.flatMap((building) => building.rooms
    .filter(isTeachingRoom)
    .map((room) => ({
      ...room,
      buildingKey: building.key,
      buildingName: building.name,
      poolKey: roomPoolKey(building.key, room.number),
    }))), [buildings, skipBuildings]);
  const buildingByKey = useMemo(() => new Map(buildings.map((item) => [item.key, item])), [buildings]);
  const requestedClassCount = useMemo(() => gradeConfig.reduce(
    (total, item) => total + gradePlan(item, shiftCount).length,
    0,
  ), [gradeConfig, shiftCount]);
  const roomOwners = useMemo(() => {
    const owners = new Map();
    sortedClasses(classes).forEach((item) => {
      if (!item.buildingKey || !item.roomNumber) return;
      const key = `${Number(item.shift) || 1}:${roomPoolKey(item.buildingKey, item.roomNumber)}`;
      if (!owners.has(key)) owners.set(key, item);
    });
    return owners;
  }, [classes]);

  const validateSchool = () => {
    if (!/^\d+$/.test(schoolNumber.trim())) return "Maktab raqamini faqat raqam bilan kiriting (masalan: 21)";
    if (name.trim() && name.trim().length < 2) return "Maktab nomi juda qisqa";
    if (!region) return "Viloyatni tanlang";
    if (!district) return "Tumanni tanlang";
    return "";
  };
  const validateBuildings = () => {
    if (skipBuildings) return "";
    if (!buildings.length) return "Kamida bitta bino yarating yoki ‘keyin kiritaman’ni belgilang";
    const names = new Set();
    for (const building of buildings) {
      const normalizedName = building.name.trim().toLocaleLowerCase("uz");
      if (!normalizedName) return "Har bir bino nomini kiriting";
      if (names.has(normalizedName)) return `${building.name} ikki marta kiritilgan`;
      names.add(normalizedName);
      if (building.rooms.length === 0) return `${building.name} uchun xonalarni avtomatik yarating`;
    }
    return "";
  };
  const validateClasses = () => {
    if (!classes.length) return "Kamida bitta haqiqiy sinf yarating";
    if (classesPlanDirty) {
      return "Smena yoki parallel sonlari o‘zgargan. Yangilangan ro‘yxatni qo‘llash uchun ‘Sinflarni qayta hisoblash va yaratish’ tugmasini bosing.";
    }
    const sequenceError = validateSchoolClassSequence(classes, shiftCount);
    if (sequenceError) return sequenceError;
    const occupiedRooms = new Map();
    for (const item of sortedClasses(classes)) {
      if (Boolean(item.buildingKey) !== Boolean(item.roomNumber)) {
        return `${classNameOf(item)} uchun bino va xona birga tanlanishi kerak yoki ikkalasi ham bo‘sh qoldirilishi kerak.`;
      }
      if (item.buildingKey && !buildingByKey.has(item.buildingKey)) return `${classNameOf(item)} uchun tanlangan bino topilmadi`;
      if (!item.roomNumber) continue;
      const building = buildingByKey.get(item.buildingKey);
      const room = building?.rooms.find((candidate) => candidate.number === item.roomNumber);
      if (!room) return `${classNameOf(item)} uchun tanlangan xona topilmadi`;
      if (!isTeachingRoom(room)) {
        return `${classNameOf(item)} uchun “${room.number}” o‘quv xonasi emas. Sinfga faqat darsga yaroqli xona biriktiriladi.`;
      }
      const key = `${Number(item.shift) || 1}:${roomPoolKey(item.buildingKey, item.roomNumber)}`;
      const owner = occupiedRooms.get(key);
      if (owner) {
        return `Xona bir smenada takror biriktirilgan: ${building.name}, ${room.number}. Bitta smenada xona faqat bitta sinfga beriladi (${classNameOf(owner)} va ${classNameOf(item)}).`;
      }
      occupiedRooms.set(key, item);
    }
    return "";
  };

  const goNext = () => {
    const message = step === 1 ? validateSchool() : step === 2 ? validateBuildings() : validateClasses();
    if (message) { setError(message); return; }
    setError(""); setNotice(""); setStep((current) => Math.min(4, current + 1));
  };
  const updateBuilding = (key, patch) => { setBuildings((current) => current.map((item) => item.key === key ? { ...item, ...patch } : item)); setError(""); };
  const updateBuildingFloors = (key, rawFloors) => {
    const floors = Math.max(1, Math.min(20, Number.parseInt(rawFloors, 10) || 1));
    setBuildings((current) => current.map((item) => item.key === key ? {
      ...item, floors,
      floorRoomCounts: Array.from({ length: floors }, (_, index) => item.floorRoomCounts?.[index] ?? item.roomsPerFloor ?? 10),
      rooms: [],
    } : item));
    setError("");
  };
  const updateFloorRoomCount = (key, floorIndex, rawCount) => {
    const count = Math.max(0, Math.min(100, Number.parseInt(rawCount, 10) || 0));
    setBuildings((current) => current.map((item) => item.key === key ? {
      ...item,
      floorRoomCounts: Array.from({ length: Number(item.floors) || 1 }, (_, index) => index === floorIndex ? count : (item.floorRoomCounts?.[index] ?? item.roomsPerFloor ?? 10)),
      rooms: [],
    } : item));
    setError("");
  };
  const createRooms = (key) => { setBuildings((current) => current.map((item) => item.key === key ? { ...item, rooms: generateRooms(item) } : item)); setNotice("Xonalar tayyorlandi. Kerak bo‘lsa parametrlarni o‘zgartirib qayta yarating."); setError(""); };
  const removeBuilding = (key) => { setBuildings((current) => current.filter((item) => item.key !== key)); setClasses((current) => current.map((item) => item.buildingKey === key ? { ...item, buildingKey: "", roomNumber: "" } : item)); };
  const updateGradeCount = (grade, shift, language, rawCount) => {
    setGradeConfig((current) => current.map((item) => {
      if (item.grade !== grade) return item;
      const next = { 1: { ...item.counts[1] }, 2: { ...item.counts[2] } };
      const wanted = Math.max(0, Number.parseInt(rawCount, 10) || 0);
      const othersTotal = gradePlan({ counts: next }, shiftCount).length - Math.max(0, Number(next[shift]?.[language]) || 0);
      next[shift][language] = Math.min(wanted, Math.max(0, CLASS_LETTERS.length - othersTotal));
      return { ...item, counts: next };
    }));
    setClassesPlanDirty(true);
    setError("");
  };
  const applyParallelPreset = (count, language = "uz") => {
    setGradeConfig((current) => current.map((item) => {
      if (count === 0) return { ...item, counts: { 1: emptyLanguageCounts(0), 2: emptyLanguageCounts(0) } };
      const next = { 1: { ...item.counts[1], [language]: count }, 2: { ...item.counts[2] } };
      if (shiftCount === 2) next[2][language] = count;
      return { ...item, counts: next };
    }));
    setClassesPlanDirty(true);
    setError("");
    setNotice(count === 0
      ? "Barcha darajalar tozalandi."
      : shiftCount === 2
        ? `Har bir darajaga ${languageLabel(language)} sinfi: 1-smenada ${count} ta, 2-smenada ${count} ta belgilandi.`
        : `Har bir darajaga ${count} ta ${languageLabel(language)} sinfi belgilandi.`);
  };

  const assignRooms = (items, reset = false) => {
    if (skipBuildings) {
      return { items: items.map((item) => ({ ...item, buildingKey: "", roomNumber: "" })), unassigned: 0 };
    }
    const teachingRooms = new Map(roomPool.map((room) => [room.poolKey, room]));
    const used = { 1: new Set(), 2: new Set() };
    const prepared = sortedClasses(items).map((item) => {
      if (reset || !item.buildingKey || !item.roomNumber) return { ...item, buildingKey: "", roomNumber: "" };
      const key = roomPoolKey(item.buildingKey, item.roomNumber);
      const shiftUsed = used[Number(item.shift) === 2 ? 2 : 1];
      if (!teachingRooms.has(key) || shiftUsed.has(key)) return { ...item, buildingKey: "", roomNumber: "" };
      shiftUsed.add(key);
      return item;
    });
    let unassigned = 0;
    const assigned = prepared.map((item) => {
      if (item.buildingKey && item.roomNumber) return item;
      const shiftUsed = used[Number(item.shift) === 2 ? 2 : 1];
      const room = roomPool.find((candidate) => !shiftUsed.has(candidate.poolKey));
      if (!room) { unassigned += 1; return { ...item, buildingKey: "", roomNumber: "" }; }
      shiftUsed.add(room.poolKey);
      return { ...item, buildingKey: room.buildingKey, roomNumber: room.number };
    });
    return { items: assigned, unassigned };
  };

  const generateClasses = () => {
    if (!requestedClassCount) { setError("Kamida bitta sinf darajasiga parallel sonini kiriting"); return; }
    const existing = new Map(classes.map((item) => [classNameOf(item), item]));
    const desired = [];
    gradeConfig.forEach((item) => {
      const { grade } = item;
      gradePlan(item, shiftCount).forEach(({ shift, language }, index) => {
        const letter = CLASS_LETTERS[index];
        const normalized = `${grade}-${letter}`;
        const oldItem = existing.get(normalized);
        if (!oldItem) { desired.push(emptyClass({ grade, letter, shift, language })); return; }
        const shiftChanged = Number(oldItem.shift) !== shift;
        desired.push({ ...oldItem, shift, language, ...(shiftChanged ? { buildingKey: "", roomNumber: "" } : {}) });
      });
    });
    const result = assignRooms(desired);
    setClasses(result.items); setClassesPlanDirty(false); setError("");
    setNotice(result.unassigned
      ? `Xona yetmadi: ${result.unassigned} ta sinf xonasiz qoldi. Yangi o‘quv xonasi yarating yoki sinfni xonasiz saqlang.`
      : `Jami ${result.items.length} ta sinf yaratildi${roomPool.length ? " va har biriga alohida o‘quv xonasi biriktirildi" : ""}.`);
  };
  const autoAssignAllRooms = () => {
    const result = assignRooms(classes, true);
    setClasses(result.items); setError("");
    setNotice(result.unassigned
      ? `Xona yetmadi: ${result.unassigned} ta sinf xonasiz qoldi. Yangi o‘quv xonasi yarating yoki sinfni xonasiz saqlang.`
      : "Har bir smena ichida xonalar takrorlanmaydi; 1- va 2-smena bir xil xonadan navbat bilan foydalanishi mumkin.");
  };
  const updateClass = (key, patch) => { setClasses((current) => current.map((item) => item.key === key ? { ...item, ...patch } : item)); setError(""); };
  const assignClassRoom = (item, roomNumber) => {
    if (!roomNumber) { updateClass(item.key, { roomNumber: "" }); return; }
    const key = `${Number(item.shift) || 1}:${roomPoolKey(item.buildingKey, roomNumber)}`;
    const owner = roomOwners.get(key);
    if (owner && owner.key !== item.key) {
      setError(`“${roomNumber}” xona shu smenada allaqachon ${classNameOf(owner)} ga biriktirilgan. Boshqa smenadagi sinf undan navbat bilan foydalanishi mumkin.`);
      return;
    }
    const room = buildingByKey.get(item.buildingKey)?.rooms.find((candidate) => candidate.number === roomNumber);
    if (!isTeachingRoom(room)) {
      setError(`“${roomNumber}” o‘quv xonasi emas. Sinfga faqat darsga yaroqli xona biriktiriladi.`);
      return;
    }
    updateClass(item.key, { roomNumber });
  };

  const createSchool = async () => {
    const message = validateSchool() || validateBuildings() || validateClasses();
    if (message || saving) { setError(message); return; }
    setSaving(true); setError("");
    try {
      const response = await fetch(`${apiBase}/api/admin/maktab-yaratish-v2`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token, name: name.trim() || `${schoolNumber.trim()}-maktab`, school_number: schoolNumber.trim(), region, district,
          shift_count: shiftCount, director_user_id: director?.user_id || null,
          buildings: skipBuildings ? [] : buildings.map((building) => ({
            key: building.key,
            name: building.name.trim(),
            floors: Number(building.floors),
            rooms: building.rooms.map((room) => ({
              number: room.number,
              floor: room.floor,
              turi: room.turi || "classroom",
              darsga_yaroqli: isTeachingRoom(room),
            })),
          })),
          classes: sortedClasses(classes).map((item) => ({
            name: classNameOf(item), shift: shiftCount === 1 ? 1 : Number(item.shift),
            talim_tili: item.language || "uz",
            leader_user_id: item.leader?.user_id || null, psychologist_user_id: item.psychologist?.user_id || null,
            building_key: item.buildingKey || null, room_number: item.roomNumber || null,
          })),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || "Maktabni yaratib bo‘lmadi");
      onCreated?.(data.school, data);
    } catch (requestError) { setError(requestError.message || "Maktabni yaratib bo‘lmadi"); }
    finally { setSaving(false); }
  };

  return <section className="rounded-2xl p-5 bg-white border mb-4" style={{ borderColor: "#D9D4C8" }}>
    <div className="flex items-start justify-between gap-3 mb-4"><div>
      <p className="text-xs font-bold" style={{ color: "#8A5A1C" }}>YANGI MAKTAB · {step}/4 BOSQICH</p>
      <h2 className="text-lg font-bold" style={{ color: "#21384C" }}>{step === 1 ? "Maktab ma’lumoti" : step === 2 ? "Bino va xonalar" : step === 3 ? "Sinflarni tez yaratish" : "Tekshirish va yaratish"}</h2>
    </div><button type="button" onClick={onCancel} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: "#F7F5F0", color: "#5A5648" }}>✕ Yopish</button></div>
    <div className="grid grid-cols-4 gap-2 mb-5">{[1, 2, 3, 4].map((number) => <div key={number} className="h-1.5 rounded-full" style={{ background: number <= step ? "#C89B3C" : "#E9E4D8" }} />)}</div>

    {step === 1 && <div className="space-y-3">
      <div className="grid md:grid-cols-2 gap-3">
        <label className="text-xs font-semibold" style={{ color: "#5A5648" }}>Maktab nomi · ixtiyoriy<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Masalan: Alisher Navoiy nomidagi / Prezident ixtisoslashgan" className="block w-full mt-1.5 px-3.5 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }} /></label>
        <label className="text-xs font-semibold" style={{ color: "#5A5648" }}>Maktab raqami *<input value={schoolNumber} inputMode="numeric" onChange={(event) => setSchoolNumber(event.target.value.replace(/\D/g, "").slice(0, 5))} placeholder="Masalan: 21" className="block w-full mt-1.5 px-3.5 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }} /></label>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <label className="text-xs font-semibold" style={{ color: "#5A5648" }}>Viloyat *<select value={region} onChange={(event) => { setRegion(event.target.value); setDistrict(""); }} className="block w-full mt-1.5 px-3.5 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }}><option value="">Tanlang</option>{(regions || []).map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label className="text-xs font-semibold" style={{ color: "#5A5648" }}>Tuman/shahar *<select value={district} onChange={(event) => setDistrict(event.target.value)} disabled={!region} className="block w-full mt-1.5 px-3.5 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8", opacity: region ? 1 : 0.55 }}><option value="">Tanlang</option>{((districtsByRegion || {})[region] || []).map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      </div>
      <div><p className="text-xs font-semibold mb-1.5" style={{ color: "#5A5648" }}>Maktabdagi smena soni *</p><div className="grid grid-cols-2 gap-2">{[1, 2].map((number) => <button type="button" key={number} onClick={() => {
        if (number === shiftCount) return;
        setShiftCount(number);
        setGradeConfig((current) => current.map((item) => number === 1 ? {
          ...item,
          counts: {
            1: Object.fromEntries(CLASS_LANGUAGES.map((lang) => [lang.code, (Number(item.counts[1][lang.code]) || 0) + (Number(item.counts[2][lang.code]) || 0)])),
            2: emptyLanguageCounts(0),
          },
        } : item));
        if (number === 1) setClasses((current) => current.map((item) => ({ ...item, shift: 1 })));
        setClassesPlanDirty(true);
      }} className="py-2.5 rounded-xl border text-sm font-bold" style={shiftCount === number ? { background: "#1B4B7A", color: "white", borderColor: "#1B4B7A" } : { background: "white", color: "#5A5648", borderColor: "#E5E1D8" }}>{number} smenali</button>)}</div></div>
      <label className="text-xs font-semibold block" style={{ color: "#5A5648" }}>Direktor · ixtiyoriy<div className="mt-1.5"><PersonPicker token={token} apiBase={apiBase} value={director} onChange={setDirector} placeholder="Mavjud foydalanuvchidan direktor tanlang..." /></div></label>
      <div className="rounded-xl px-3.5 py-3 text-xs" style={{ background: "#EEF6F1", color: "#2E6C55" }}>Admin yaratmoqda: platforma to‘lovi, balans va sinov muddati so‘ralmaydi.</div>
    </div>}

    {step === 2 && <div className="space-y-3">
      <label className="flex items-start gap-2.5 rounded-xl px-3.5 py-3 cursor-pointer" style={{ background: skipBuildings ? "#FDF3E0" : "#F7F5F0" }}><input type="checkbox" checked={skipBuildings} onChange={(event) => {
        const checked = event.target.checked;
        setSkipBuildings(checked);
        if (checked) setClasses((current) => current.map((item) => ({ ...item, buildingKey: "", roomNumber: "" })));
      }} className="mt-0.5" /><span className="text-xs" style={{ color: "#5A5648" }}><b>Bino va xonalarni keyin kiritaman</b><small className="block mt-0.5">Belgilanmasa, hozir bino va xonalar to‘liq yaratiladi.</small></span></label>
      {!skipBuildings && buildings.map((building, index) => <article key={building.key} className="rounded-2xl border p-4" style={{ borderColor: "#E5E1D8", background: "#FCFBF8" }}>
        <div className="flex items-center justify-between mb-3"><b className="text-sm" style={{ color: "#21384C" }}>{building.name.trim() || `${index + 1}-bino`}</b>{buildings.length > 1 && <button type="button" onClick={() => removeBuilding(building.key)} className="text-xs" style={{ color: "#B0553A" }}>Olib tashlash</button>}</div>
        <div className="grid md:grid-cols-4 gap-3">
          <label className="text-xs font-semibold md:col-span-2" style={{ color: "#5A5648" }}>Bino nomi *<input value={building.name} onChange={(event) => updateBuilding(building.key, { name: event.target.value, rooms: [] })} placeholder="Masalan: Asosiy bino" className="block w-full mt-1.5 px-3 py-2 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }} /></label>
          <label className="text-xs font-semibold md:col-span-2" style={{ color: "#5A5648" }}>Qavat soni *<input type="number" min="1" max="20" value={building.floors} onChange={(event) => updateBuildingFloors(building.key, event.target.value)} className="block w-full mt-1.5 px-3 py-2 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }} /></label>
          <div className="md:col-span-4"><p className="text-xs font-semibold mb-2" style={{ color: "#5A5648" }}>Har bir qavatdagi xona soni *</p><div className="grid grid-cols-2 md:grid-cols-4 gap-2">{Array.from({ length: Number(building.floors) || 1 }, (_, floorIndex) => <label key={floorIndex} className="text-[11px] font-semibold rounded-xl border p-2.5" style={{ color: "#5A5648", borderColor: "#E5E1D8", background: "white" }}>{floorIndex + 1}-qavat<input aria-label={`${floorIndex + 1}-qavat xona soni`} type="number" min="0" max="100" value={building.floorRoomCounts?.[floorIndex] ?? building.roomsPerFloor ?? 10} onChange={(event) => updateFloorRoomCount(building.key, floorIndex, event.target.value)} className="block w-full mt-1.5 px-3 py-2 rounded-lg border text-sm" style={{ borderColor: "#D9D4C8" }} /></label>)}</div></div>
          <label className="text-xs font-semibold md:col-span-2" style={{ color: "#5A5648" }}>Xona raqamlash usuli<select value={building.scheme} onChange={(event) => updateBuilding(building.key, { scheme: event.target.value, rooms: [] })} className="block w-full mt-1.5 px-3 py-2 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }}><option value="floor">Qavat bo‘yicha: 101, 102… 201, 202…</option><option value="sequential">Oddiy ketma-ket: 1, 2, 3…</option></select></label>
          <label className="text-xs font-semibold md:col-span-2" style={{ color: "#5A5648" }}>Dars o‘tilmaydigan xonalar · ixtiyoriy<input value={building.customRooms} onChange={(event) => updateBuilding(building.key, { customRooms: event.target.value, rooms: [] })} placeholder="Masalan: Sportzal, Kutubxona, Oshxona" className="block w-full mt-1.5 px-3 py-2 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }} /><small className="block mt-1 font-normal">Vergul, nuqtali vergul yoki yangi qator bilan ajrating. Bu xonalar sinflarga biriktirilmaydi.</small></label>
        </div>
        <button type="button" onClick={() => createRooms(building.key)} className="w-full mt-3 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: "#1B4B7A" }}>⚡ {building.rooms.length ? "Xonalarni qayta yaratish" : "Xonalarni avtomatik yaratish"}</button>
        {building.rooms.length > 0 && <div className="mt-3 rounded-xl p-3" style={{ background: "#F1F7FB" }}><p className="text-xs font-bold mb-1" style={{ color: "#1B4B7A" }}>{building.rooms.filter(isTeachingRoom).length} ta o‘quv xonasi · {building.rooms.filter((room) => !isTeachingRoom(room)).length} ta dars o‘tilmaydigan xona</p><p className="text-[11px] mb-2" style={{ color: "#5A5648" }}>{Array.from({ length: Number(building.floors) || 1 }, (_, floorIndex) => `${floorIndex + 1}-qavat: ${building.rooms.filter((room) => room.floor === floorIndex + 1).length} xona`).join(" · ")}</p><div className="flex flex-wrap gap-1.5 max-h-24 overflow-auto">{building.rooms.map((room) => <span key={`${building.key}-${room.number}`} className="px-2 py-1 rounded-lg text-[11px]" style={{ background: isTeachingRoom(room) ? "white" : "#FFF0EC", color: isTeachingRoom(room) ? "#5A5648" : "#A04431" }}>{room.number}{isTeachingRoom(room) ? "" : " · dars yo‘q"}</span>)}</div></div>}
      </article>)}
      {!skipBuildings && <button type="button" onClick={() => setBuildings((current) => [...current, emptyBuilding(current.length)])} className="w-full py-3 rounded-xl border-2 border-dashed text-sm font-bold" style={{ borderColor: "#B9CCDC", color: "#1B4B7A" }}>＋ Yana bino qo‘shish</button>}
    </div>}

    {step === 3 && <div className="space-y-4">
      <section className="rounded-2xl border p-4" style={{ borderColor: "#D9D4C8", background: "#FCFBF8" }}>
        <div className="flex items-start justify-between gap-3 mb-3"><div><b className="text-sm" style={{ color: "#21384C" }}>⚡ 11 ta daraja bo‘yicha tez yaratish</b><p className="text-xs mt-1" style={{ color: "#8A8578" }}>{shiftCount === 2 ? "Har smena uchun o‘zbek (UZ), rus (RU) va ingliz (EN) sinflari sonini alohida yozing. Harflar A dan uzluksiz davom etadi." : "Har daraja uchun o‘zbek (UZ), rus (RU) va ingliz (EN) sinflari sonini yozing. 0 bo‘lsa, yaratilmaydi."}</p></div><span className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: "#EAF1F7", color: "#1B4B7A" }}>{requestedClassCount} ta reja</span></div>
        <div className="flex flex-wrap items-center gap-1.5 mb-3"><span className="text-[11px] font-semibold mr-1" style={{ color: "#5A5648" }}>{shiftCount === 2 ? "Har smenaga tez qo‘yish:" : "Barchasiga tez qo‘yish:"}</span><select value={presetLanguage} onChange={(event) => setPresetLanguage(event.target.value)} className="px-2 py-1.5 rounded-lg border text-[11px] font-bold" style={{ borderColor: "#D9D4C8", color: "#21384C" }}>{CLASS_LANGUAGES.map((lang) => <option key={lang.code} value={lang.code}>{lang.label} sinfi</option>)}</select>{[1, 2, 3, 5, 8].map((count) => <button type="button" key={count} onClick={() => applyParallelPreset(count, presetLanguage)} className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold" style={{ background: "#EAF1F7", color: "#1B4B7A" }}>{count} tadan</button>)}<button type="button" onClick={() => applyParallelPreset(0)} className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold" style={{ background: "#FFF0EC", color: "#B0553A" }}>Tozalash</button></div>
        <div className="rounded-xl border overflow-hidden mb-3" style={{ borderColor: "#E5E1D8" }}>
          <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[10px] font-bold" style={{ background: "#F1F7FB", color: "#5A5648" }}><span className="col-span-1">DARAJA</span><span className="col-span-3 grid grid-cols-3 gap-1 text-center"><span className="col-span-3">1-SMENA</span>{CLASS_LANGUAGES.map((lang) => <span key={lang.code}>{lang.short}</span>)}</span>{shiftCount === 2 && <span className="col-span-3 grid grid-cols-3 gap-1 text-center"><span className="col-span-3">2-SMENA</span>{CLASS_LANGUAGES.map((lang) => <span key={lang.code}>{lang.short}</span>)}</span>}<span className={shiftCount === 2 ? "col-span-5" : "col-span-8"}>YARATILADIGAN SINFLAR</span></div>
          {gradeConfig.map((item) => {
            const plan = gradePlan(item, shiftCount);
            const totalCount = plan.length;
            const preview = plan.map(({ shift, language }, index) => `${item.grade}-${CLASS_LETTERS[index]} (${(CLASS_LANGUAGES.find((lang) => lang.code === language) || CLASS_LANGUAGES[0]).short}${shiftCount === 2 ? `·${shift}sm` : ""})`).join(", ");
            const countInput = (shift, lang, color) => <input key={`${shift}-${lang.code}`} aria-label={`${item.grade}-sinf ${shift}-smena ${lang.label} sinflari soni`} title={`${shift}-smena · ${lang.label} sinflari`} type="number" min="0" max={CLASS_LETTERS.length} value={item.counts[shift][lang.code]} onChange={(event) => updateGradeCount(item.grade, shift, lang.code, event.target.value)} className="min-w-0 px-1 py-1.5 rounded-lg border text-sm font-bold text-center" style={{ borderColor: "#D9D4C8", color, background: Number(item.counts[shift][lang.code]) ? "white" : "#FAF9F6" }} />;
            return <div key={item.grade} className="grid grid-cols-12 gap-2 items-center px-3 py-2 border-t" style={{ borderColor: "#F0ECE3", background: totalCount ? "white" : "#FAF9F6" }}>
              <b className="col-span-1 text-xs" style={{ color: "#21384C" }}>{item.grade}-sinf</b>
              <div className="col-span-3 grid grid-cols-3 gap-1">{CLASS_LANGUAGES.map((lang) => countInput(1, lang, "#1B4B7A"))}</div>
              {shiftCount === 2 && <div className="col-span-3 grid grid-cols-3 gap-1">{CLASS_LANGUAGES.map((lang) => countInput(2, lang, "#8A5A1C"))}</div>}
              <span className={`${shiftCount === 2 ? "col-span-5" : "col-span-8"} text-[11px] truncate`} title={preview} style={{ color: totalCount ? "#5A5648" : "#A8A397" }}>{totalCount ? preview : "Yaratilmaydi"}</span>
            </div>;
          })}
        </div>
        <p className="text-[11px] mb-3" style={{ color: "#8A8578" }}>{shiftCount === 2 ? "Masalan: 1-smenada UZ 2, RU 1 va 2-smenada UZ 1 yozilsa: A, B — o‘zbek (1-smena); C — rus (1-smena); D — o‘zbek (2-smena) bo‘ladi." : "Masalan: UZ 2, RU 1, EN 1 yozilsa: A, B — o‘zbek; C — rus; D — ingliz bo‘ladi. Har bir sinfning tilini pastdagi ro‘yxatda alohida ham o‘zgartirsa bo‘ladi."}</p>
        <button type="button" onClick={generateClasses} className="w-full py-3 rounded-xl text-sm font-bold text-white" style={{ background: "#1B4B7A" }}>⚡ {requestedClassCount} ta sinfni qayta hisoblash va yaratish</button>
      </section>
      {classes.length > 0 && <>
        {!skipBuildings && roomPool.length > 0 && <button type="button" onClick={autoAssignAllRooms} className="w-full py-2.5 rounded-xl text-sm font-bold" style={{ background: "#EEF6F1", color: "#2E6C55" }}>🏫 Xonalarni smena bo‘yicha biriktirish</button>}
        <div className="flex items-center justify-between gap-2"><div><b className="text-sm" style={{ color: "#21384C" }}>Yaratiladigan sinflar</b><p className="text-[11px] mt-0.5" style={{ color: "#8A8578" }}>Kerakli sinfni bosing: uning smena, bino, xona, rahbar va psixologi alohida ochiladi.</p></div><button type="button" onClick={() => { setClasses([]); setNotice(""); }} className="text-xs whitespace-nowrap" style={{ color: "#B0553A" }}>Ro‘yxatni tozalash</button></div>
        <div className="space-y-2">{sortedClasses(classes).map((item) => {
          const selectedBuilding = buildingByKey.get(item.buildingKey);
          return <details key={item.key} className="rounded-xl border bg-white overflow-visible" style={{ borderColor: "#E5E1D8" }}><summary className="px-3.5 py-3 flex items-center gap-3 cursor-pointer [&::-webkit-details-marker]:hidden" style={{ listStyle: "none" }}><b className="w-12 text-sm" style={{ color: "#21384C" }}>{classNameOf(item)}</b><span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#EAF1F7", color: "#1B4B7A" }}>{languageLabel(item.language)}</span><span className="flex-1 text-xs truncate" style={{ color: "#8A8578" }}>{item.shift}-smena · {selectedBuilding ? `${selectedBuilding.name}, ${item.roomNumber || "xona tanlanmagan"}` : "bino/xona tanlanmagan"}</span><span style={{ color: "#8A8578" }}>⌄</span></summary>
            <div className="border-t p-3.5 grid md:grid-cols-3 gap-3" style={{ borderColor: "#F0ECE3" }}>
              <label className="text-xs font-semibold" style={{ color: "#5A5648" }}>Sinf darajasi *<select value={item.grade} onChange={(event) => updateClass(item.key, { grade: event.target.value })} className="block w-full mt-1.5 px-3 py-2 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }}>{CLASS_GRADES.map((grade) => <option key={grade} value={grade}>{grade}-sinf</option>)}</select></label>
              <label className="text-xs font-semibold" style={{ color: "#5A5648" }}>Sinf parallel harfi *<input value={item.letter} maxLength={1} pattern="[A-Za-z]" onChange={(event) => updateClass(item.key, { letter: event.target.value.replace(/[^A-Za-z]/g, "").slice(0, 1).toUpperCase() })} placeholder="A, B yoki C" className="block w-full mt-1.5 px-3 py-2 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }} /></label>
              <label className="text-xs font-semibold" style={{ color: "#5A5648" }}>Ta‘lim tili *<select value={item.language || "uz"} onChange={(event) => updateClass(item.key, { language: event.target.value })} className="block w-full mt-1.5 px-3 py-2 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }}>{CLASS_LANGUAGES.map((lang) => <option key={lang.code} value={lang.code}>{lang.label}</option>)}</select></label>
              {shiftCount === 2 && <label className="text-xs font-semibold" style={{ color: "#5A5648" }}>Smena *<select value={item.shift} onChange={(event) => updateClass(item.key, { shift: Number(event.target.value), buildingKey: "", roomNumber: "" })} className="block w-full mt-1.5 px-3 py-2 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }}><option value={1}>1-smena</option><option value={2}>2-smena</option></select></label>}
              {!skipBuildings && <label className="text-xs font-semibold" style={{ color: "#5A5648" }}>Bino · xona bilan birga ixtiyoriy<select value={item.buildingKey} onChange={(event) => updateClass(item.key, { buildingKey: event.target.value, roomNumber: "" })} className="block w-full mt-1.5 px-3 py-2 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }}><option value="">Tanlanmagan</option>{buildings.map((building) => <option key={building.key} value={building.key}>{building.name}</option>)}</select></label>}
              {!skipBuildings && <label className="text-xs font-semibold" style={{ color: "#5A5648" }}>Xona · bino bilan birga ixtiyoriy<select value={item.roomNumber} onChange={(event) => assignClassRoom(item, event.target.value)} disabled={!selectedBuilding} className="block w-full mt-1.5 px-3 py-2 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8", opacity: selectedBuilding ? 1 : 0.55 }}><option value="">Tanlanmagan</option>{(selectedBuilding?.rooms || []).map((room) => {
                const owner = roomOwners.get(`${Number(item.shift) || 1}:${roomPoolKey(selectedBuilding.key, room.number)}`);
                const usedByAnotherClass = owner && owner.key !== item.key;
                const unavailable = !isTeachingRoom(room) || usedByAnotherClass;
                return <option key={room.number} value={room.number} disabled={unavailable}>{room.number}-xona{!isTeachingRoom(room) ? " · dars o‘tilmaydi" : usedByAnotherClass ? ` · ${classNameOf(owner)} band` : ""}</option>;
              })}</select></label>}
              <label className="text-xs font-semibold" style={{ color: "#5A5648" }}>Sinf rahbari · ixtiyoriy<div className="mt-1.5"><PersonPicker token={token} apiBase={apiBase} value={item.leader} onChange={(person) => updateClass(item.key, { leader: person })} placeholder="Rahbar ismi..." /></div></label>
              <label className="text-xs font-semibold" style={{ color: "#5A5648" }}>Psixolog · ixtiyoriy<div className="mt-1.5"><PersonPicker token={token} apiBase={apiBase} value={item.psychologist} onChange={(person) => updateClass(item.key, { psychologist: person })} placeholder="Psixolog ismi..." /></div></label>
              <button type="button" onClick={() => setClasses((current) => current.filter((row) => row.key !== item.key))} className="self-end py-2 rounded-xl text-xs font-semibold" style={{ background: "#FFF0EC", color: "#B0553A" }}>Sinfni olib tashlash</button>
            </div></details>;
        })}</div>
      </>}
    </div>}

    {step === 4 && <div className="space-y-4">
      <div className="rounded-2xl p-4" style={{ background: "#F7F5F0" }}><h3 className="font-bold" style={{ color: "#21384C" }}>{name.trim() ? `${schoolNumber.trim()}-sonli ${name.trim()}` : `${schoolNumber.trim()}-maktab`}</h3><p className="text-xs mt-1" style={{ color: "#5A5648" }}>{region}, {district} · {shiftCount} smenali · {director ? `Direktor: ${director.full_name}` : "Direktor keyin belgilanadi"}</p></div>
      <div className="grid grid-cols-3 gap-2"><div className="rounded-xl p-3 text-center" style={{ background: "#F1F7FB" }}><b className="block text-lg" style={{ color: "#1B4B7A" }}>{skipBuildings ? 0 : buildings.length}</b><span className="text-xs" style={{ color: "#5A5648" }}>bino</span></div><div className="rounded-xl p-3 text-center" style={{ background: "#F1F7FB" }}><b className="block text-lg" style={{ color: "#1B4B7A" }}>{roomPool.length}</b><span className="text-xs" style={{ color: "#5A5648" }}>xona</span></div><div className="rounded-xl p-3 text-center" style={{ background: "#FDF3E0" }}><b className="block text-lg" style={{ color: "#8A5A1C" }}>{classes.length}</b><span className="text-xs" style={{ color: "#5A5648" }}>sinf</span></div></div>
      {!skipBuildings && buildings.map((building) => <div key={building.key} className="rounded-xl border px-3.5 py-3" style={{ borderColor: "#E5E1D8" }}><b className="text-sm">{building.name}</b><p className="text-xs mt-1" style={{ color: "#8A8578" }}>{building.floors} qavat · {building.rooms.length} xona</p><p className="text-[11px] mt-1" style={{ color: "#5A5648" }}>{Array.from({ length: Number(building.floors) || 1 }, (_, floorIndex) => `${floorIndex + 1}-qavat: ${building.rooms.filter((room) => room.floor === floorIndex + 1).length} xona`).join(" · ")}</p></div>)}
      <div className="rounded-xl border max-h-72 overflow-auto" style={{ borderColor: "#E5E1D8" }}>{sortedClasses(classes).map((item) => { const building = buildingByKey.get(item.buildingKey); return <div key={item.key} className="px-3.5 py-2.5 border-b last:border-b-0 flex items-center gap-3" style={{ borderColor: "#F0ECE3" }}><b className="w-12 text-sm">{classNameOf(item)}</b><span className="text-xs flex-1" style={{ color: "#8A8578" }}>{languageLabel(item.language)} · {item.shift}-smena · {building ? `${building.name}, ${item.roomNumber || "xonasiz"}` : "bino/xonasiz"}</span><span className="text-[11px]" style={{ color: "#5A5648" }}>{item.leader?.full_name || "rahbarsiz"}</span></div>; })}</div>
      <div className="rounded-xl px-3.5 py-3 text-xs font-semibold" style={{ background: "#EEF6F1", color: "#2E6C55" }}>Maktab, binolar, xonalar va sinflar bitta xavfsiz amalda yaratiladi. Platforma to‘lovi: 0 so‘m.</div>
    </div>}

    {notice && <div className="mt-4 rounded-xl px-3.5 py-3 text-xs" role="status" style={{ background: "#EEF6F1", color: "#2E6C55" }}>✓ {notice}</div>}
    {error && <div className="mt-4 rounded-xl px-3.5 py-3 text-sm" role="alert" style={{ background: "#FFF0EC", color: "#A04431" }}>{error}</div>}
    <div className="grid grid-cols-2 gap-2 mt-5"><button type="button" onClick={() => step === 1 ? onCancel?.() : setStep((current) => current - 1)} disabled={saving} className="py-3 rounded-xl font-bold text-sm" style={{ background: "#F7F5F0", color: "#5A5648" }}>{step === 1 ? "Bekor qilish" : "← Orqaga"}</button>{step < 4 ? <button type="button" onClick={goNext} className="py-3 rounded-xl font-bold text-sm text-white" style={{ background: "#1B4B7A" }}>Davom etish →</button> : <button type="button" onClick={createSchool} disabled={saving} className="py-3 rounded-xl font-bold text-sm text-white" style={{ background: "#1B4B7A", opacity: saving ? 0.65 : 1 }}>{saving ? "Yaratilmoqda..." : "Hammasini yaratish"}</button>}</div>
  </section>;
}
