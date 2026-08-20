import React, { useEffect, useMemo, useState } from "react";

const CLASS_GRADES = Array.from({ length: 11 }, (_, index) => String(index + 1));
const CLASS_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const DEFAULT_GRADE_CONFIG = CLASS_GRADES.map((grade) => ({ grade, count: 1 }));
const uniqueKey = (prefix, index = 0) => `${prefix}-${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`;
const cleanInteger = (value, minimum, maximum, fallback = minimum) => {
  const parsed = Number.parseInt(String(value ?? "").replace(/[^0-9]/g, ""), 10);
  return Math.max(minimum, Math.min(maximum, Number.isFinite(parsed) ? parsed : fallback));
};

const emptyBuilding = (index = 0) => ({
  key: uniqueKey("building", index), name: index === 0 ? "Asosiy bino" : `${index + 1}-bino`,
  floors: 2, roomsPerFloor: 10, floorRoomCounts: { 1: 10, 2: 10 }, scheme: "floor", customRooms: "", rooms: [],
});

const emptyClass = ({ grade = "", letter = "A", shift = 1 } = {}) => ({
  key: uniqueKey("class", `${grade}-${letter}`), grade, letter, shift,
  leader: null, psychologist: null, buildingKey: "", roomNumber: "",
});

export function normalizeSchoolClassName(value) {
  const match = String(value || "").trim().match(/^(1[01]|[1-9])\s*[-–—_ ]?\s*([A-Za-zА-Яа-я])$/);
  return match ? `${match[1]}-${match[2].toUpperCase()}` : "";
}

function classNameOf(item) { return normalizeSchoolClassName(`${item.grade}-${item.letter}`); }
function sortedClasses(items) { return [...items].sort((a, b) => Number(a.grade) - Number(b.grade) || a.letter.localeCompare(b.letter)); }

function generateRooms(building) {
  const floors = cleanInteger(building.floors, 1, 20, 1);
  const generated = [];
  let sequential = 1;
  for (let floor = 1; floor <= floors; floor += 1) {
    const perFloor = cleanInteger(building.floorRoomCounts?.[floor], 0, 100, cleanInteger(building.roomsPerFloor, 0, 100, 10));
    for (let index = 1; index <= perFloor; index += 1) {
      const number = building.scheme === "floor" ? `${floor}${String(index).padStart(2, "0")}` : String(sequential);
      generated.push({ number, floor });
      sequential += 1;
    }
  }
  const custom = String(building.customRooms || "").split(/[,;\n]+/).map((item) => item.trim()).filter(Boolean).map((number) => {
    const numeric = Number.parseInt(number, 10);
    const guessedFloor = Number.isFinite(numeric) && numeric >= 100 ? Math.floor(numeric / 100) : 1;
    return { number, floor: Math.max(1, Math.min(floors, guessedFloor)) };
  });
  const unique = new Map();
  [...generated, ...custom].forEach((room) => unique.set(room.number.toLocaleLowerCase("uz"), room));
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
  const [classes, setClasses] = useState([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const roomPool = useMemo(() => skipBuildings ? [] : buildings.flatMap((building) => building.rooms.map((room) => ({
    ...room, buildingKey: building.key, buildingName: building.name,
    poolKey: `${building.key}|${room.number.toLocaleLowerCase("uz")}`,
  }))), [buildings, skipBuildings]);
  const buildingByKey = useMemo(() => new Map(buildings.map((item) => [item.key, item])), [buildings]);
  const requestedClassCount = useMemo(() => gradeConfig.reduce((total, item) => total + item.count, 0), [gradeConfig]);

  const validateSchool = () => {
    if (name.trim().length < 2) return "Maktab nomini kiriting";
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
    const normalized = classes.map(classNameOf);
    if (normalized.some((item) => !item)) return "Sinf darajasi va parallelini tanlang";
    if (new Set(normalized).size !== normalized.length) return "Bir xil sinf ikki marta kiritilgan";
    const occupiedRooms = new Set();
    for (const item of classes) {
      if (item.roomNumber && !item.buildingKey) return `${classNameOf(item)} uchun binoni tanlang`;
      if (item.buildingKey && !buildingByKey.has(item.buildingKey)) return `${classNameOf(item)} uchun tanlangan bino topilmadi`;
      if (item.roomNumber && !buildingByKey.get(item.buildingKey)?.rooms.some((room) => room.number === item.roomNumber)) return `${classNameOf(item)} uchun tanlangan xona topilmadi`;
      if (item.buildingKey && item.roomNumber) {
        const roomShiftKey = `${Number(item.shift) || 1}|${item.buildingKey}|${item.roomNumber.toLocaleLowerCase("uz")}`;
        if (occupiedRooms.has(roomShiftKey)) return `${item.roomNumber}-xona ${item.shift}-smenada boshqa sinfga allaqachon biriktirilgan`;
        occupiedRooms.add(roomShiftKey);
      }
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
    const floors = cleanInteger(rawFloors, 1, 20, 1);
    setBuildings((current) => current.map((item) => {
      if (item.key !== key) return item;
      const floorRoomCounts = {};
      for (let floor = 1; floor <= floors; floor += 1) floorRoomCounts[floor] = cleanInteger(item.floorRoomCounts?.[floor], 0, 100, cleanInteger(item.roomsPerFloor, 0, 100, 10));
      return { ...item, floors, floorRoomCounts, rooms: [] };
    }));
    setError("");
  };
  const updateDefaultRoomCount = (key, rawCount) => updateBuilding(key, { roomsPerFloor: cleanInteger(rawCount, 0, 100, 0), rooms: [] });
  const applyRoomCountToAllFloors = (key) => {
    setBuildings((current) => current.map((item) => {
      if (item.key !== key) return item;
      const count = cleanInteger(item.roomsPerFloor, 0, 100, 0);
      const floorRoomCounts = {};
      for (let floor = 1; floor <= item.floors; floor += 1) floorRoomCounts[floor] = count;
      return { ...item, floorRoomCounts, rooms: [] };
    }));
    setNotice("Standart xona soni barcha qavatlarga qo‘llandi. Har bir qavatni alohida ham o‘zgartirish mumkin."); setError("");
  };
  const updateFloorRoomCount = (key, floor, rawCount) => {
    const count = cleanInteger(rawCount, 0, 100, 0);
    setBuildings((current) => current.map((item) => item.key === key ? {
      ...item, floorRoomCounts: { ...item.floorRoomCounts, [floor]: count }, rooms: [],
    } : item));
    setError("");
  };
  const createRooms = (key) => { setBuildings((current) => current.map((item) => item.key === key ? { ...item, rooms: generateRooms(item) } : item)); setNotice("Xonalar tayyorlandi. Kerak bo‘lsa parametrlarni o‘zgartirib qayta yarating."); setError(""); };
  const removeBuilding = (key) => { setBuildings((current) => current.filter((item) => item.key !== key)); setClasses((current) => current.map((item) => item.buildingKey === key ? { ...item, buildingKey: "", roomNumber: "" } : item)); };
  const updateGradeCount = (grade, rawCount) => {
    const count = cleanInteger(rawCount, 0, CLASS_LETTERS.length, 0);
    setGradeConfig((current) => current.map((item) => item.grade === grade ? { ...item, count } : item));
    setError("");
  };
  const applyParallelPreset = (count) => {
    setGradeConfig(CLASS_GRADES.map((grade) => ({ grade, count })));
    setError(""); setNotice("Parallel sonlari yangilandi. Pastdagi tugma orqali sinflarni qayta hisoblang.");
  };

  const assignRooms = (items, reset = false) => {
    if (skipBuildings || roomPool.length === 0) return { items, unassigned: 0 };
    const used = { 1: new Set(), 2: new Set() };
    if (!reset) items.forEach((item) => { if (item.buildingKey && item.roomNumber) used[Number(item.shift) || 1].add(`${item.buildingKey}|${item.roomNumber.toLocaleLowerCase("uz")}`); });
    let unassigned = 0;
    const assigned = sortedClasses(items).map((item) => {
      if (!reset && item.buildingKey && item.roomNumber) return item;
      const shift = shiftCount === 1 ? 1 : Number(item.shift) || 1;
      const room = roomPool.find((candidate) => !used[shift].has(candidate.poolKey));
      if (!room) { unassigned += 1; return { ...item, buildingKey: "", roomNumber: "" }; }
      used[shift].add(room.poolKey);
      return { ...item, buildingKey: room.buildingKey, roomNumber: room.number };
    });
    return { items: assigned, unassigned };
  };

  const generateClasses = () => {
    if (!requestedClassCount) { setError("Kamida bitta sinf darajasiga parallel sonini kiriting"); return; }
    const existing = new Map(classes.map((item) => [classNameOf(item), item]));
    const desired = [];
    gradeConfig.forEach(({ grade, count }) => {
      CLASS_LETTERS.slice(0, count).forEach((letter, index) => {
        const normalized = `${grade}-${letter}`;
        const shift = shiftCount === 1 ? 1 : (index % 2) + 1;
        const oldItem = existing.get(normalized);
        desired.push(oldItem ? (Number(oldItem.shift) === shift ? oldItem : { ...oldItem, shift, buildingKey: "", roomNumber: "" }) : emptyClass({ grade, letter, shift }));
      });
    });
    const result = assignRooms(desired);
    setClasses(result.items); setError("");
    setNotice(`11 ta sinf darajasi qayta hisoblandi. Jami ${result.items.length} ta sinf${result.unassigned ? `; ${result.unassigned} tasiga xona yetmadi` : roomPool.length ? " va xonalar avtomatik biriktirildi" : ""}.`);
  };
  const autoAssignAllRooms = () => { const result = assignRooms(classes, true); setClasses(result.items); setError(""); setNotice(result.unassigned ? `${result.unassigned} ta sinfga xona yetmadi; ular xonasiz qoldirildi.` : "Barcha sinflarga smena bo‘yicha takrorlanmaydigan xonalar biriktirildi."); };
  const updateClass = (key, patch) => { setClasses((current) => current.map((item) => item.key === key ? { ...item, ...patch } : item)); setError(""); };

  const createSchool = async () => {
    const message = validateSchool() || validateBuildings() || validateClasses();
    if (message || saving) { setError(message); return; }
    setSaving(true); setError("");
    try {
      const response = await fetch(`${apiBase}/api/admin/maktab-yaratish-v2`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token, name: name.trim(), school_number: schoolNumber.trim() || null, region, district,
          shift_count: shiftCount, director_user_id: director?.user_id || null,
          buildings: skipBuildings ? [] : buildings.map((building) => ({ key: building.key, name: building.name.trim(), floors: Number(building.floors), rooms: building.rooms.map((room) => ({ number: room.number, floor: room.floor })) })),
          classes: sortedClasses(classes).map((item) => ({
            name: classNameOf(item), shift: shiftCount === 1 ? 1 : Number(item.shift),
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
        <label className="text-xs font-semibold" style={{ color: "#5A5648" }}>Maktab nomi *<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Masalan: Ziyo maktabi" className="block w-full mt-1.5 px-3.5 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }} /></label>
        <label className="text-xs font-semibold" style={{ color: "#5A5648" }}>Maktab raqami · ixtiyoriy<input value={schoolNumber} onChange={(event) => setSchoolNumber(event.target.value)} placeholder="Masalan: 21" className="block w-full mt-1.5 px-3.5 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }} /></label>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <label className="text-xs font-semibold" style={{ color: "#5A5648" }}>Viloyat *<select value={region} onChange={(event) => { setRegion(event.target.value); setDistrict(""); }} className="block w-full mt-1.5 px-3.5 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }}><option value="">Tanlang</option>{(regions || []).map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label className="text-xs font-semibold" style={{ color: "#5A5648" }}>Tuman/shahar *<select value={district} onChange={(event) => setDistrict(event.target.value)} disabled={!region} className="block w-full mt-1.5 px-3.5 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8", opacity: region ? 1 : 0.55 }}><option value="">Tanlang</option>{((districtsByRegion || {})[region] || []).map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      </div>
      <div><p className="text-xs font-semibold mb-1.5" style={{ color: "#5A5648" }}>Maktabdagi smena soni *</p><div className="grid grid-cols-2 gap-2">{[1, 2].map((number) => <button type="button" key={number} onClick={() => { setShiftCount(number); setClasses((current) => sortedClasses(current).map((item, index) => ({ ...item, shift: number === 1 ? 1 : (index % 2) + 1, buildingKey: "", roomNumber: "" }))); }} className="py-2.5 rounded-xl border text-sm font-bold" style={shiftCount === number ? { background: "#1B4B7A", color: "white", borderColor: "#1B4B7A" } : { background: "white", color: "#5A5648", borderColor: "#E5E1D8" }}>{number} smenali</button>)}</div></div>
      <label className="text-xs font-semibold block" style={{ color: "#5A5648" }}>Direktor · ixtiyoriy<div className="mt-1.5"><PersonPicker token={token} apiBase={apiBase} value={director} onChange={setDirector} placeholder="Mavjud foydalanuvchidan direktor tanlang..." /></div></label>
      <div className="rounded-xl px-3.5 py-3 text-xs" style={{ background: "#EEF6F1", color: "#2E6C55" }}>Admin yaratmoqda: platforma to‘lovi, balans va sinov muddati so‘ralmaydi.</div>
    </div>}

    {step === 2 && <div className="space-y-3">
      <label className="flex items-start gap-2.5 rounded-xl px-3.5 py-3 cursor-pointer" style={{ background: skipBuildings ? "#FDF3E0" : "#F7F5F0" }}><input type="checkbox" checked={skipBuildings} onChange={(event) => setSkipBuildings(event.target.checked)} className="mt-0.5" /><span className="text-xs" style={{ color: "#5A5648" }}><b>Bino va xonalarni keyin kiritaman</b><small className="block mt-0.5">Belgilanmasa, hozir bino va xonalar to‘liq yaratiladi.</small></span></label>
      {!skipBuildings && buildings.map((building, index) => <article key={building.key} className="rounded-2xl border p-4" style={{ borderColor: "#E5E1D8", background: "#FCFBF8" }}>
        <div className="flex items-center justify-between mb-3"><b className="text-sm" style={{ color: "#21384C" }}>{building.name.trim() || `${index + 1}-bino`}</b>{buildings.length > 1 && <button type="button" onClick={() => removeBuilding(building.key)} className="text-xs" style={{ color: "#B0553A" }}>Olib tashlash</button>}</div>
        <div className="grid md:grid-cols-4 gap-3">
          <label className="text-xs font-semibold md:col-span-2" style={{ color: "#5A5648" }}>Bino nomi *<input value={building.name} onChange={(event) => updateBuilding(building.key, { name: event.target.value, rooms: [] })} placeholder="Masalan: Asosiy bino" className="block w-full mt-1.5 px-3 py-2 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }} /></label>
          <label className="text-xs font-semibold" style={{ color: "#5A5648" }}>Qavat soni *<input type="number" min="1" max="20" value={building.floors} onChange={(event) => updateBuildingFloors(building.key, event.target.value)} className="block w-full mt-1.5 px-3 py-2 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }} /></label>
          <label className="text-xs font-semibold" style={{ color: "#5A5648" }}>Standart xona soni<input type="number" min="0" max="100" value={building.roomsPerFloor} onChange={(event) => updateDefaultRoomCount(building.key, event.target.value)} className="block w-full mt-1.5 px-3 py-2 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }} /></label>
          <label className="text-xs font-semibold md:col-span-2" style={{ color: "#5A5648" }}>Xona raqamlash usuli<select value={building.scheme} onChange={(event) => updateBuilding(building.key, { scheme: event.target.value, rooms: [] })} className="block w-full mt-1.5 px-3 py-2 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }}><option value="floor">Qavat bo‘yicha: 101, 102… 201, 202…</option><option value="sequential">Oddiy ketma-ket: 1, 2, 3…</option></select></label>
          <label className="text-xs font-semibold md:col-span-2" style={{ color: "#5A5648" }}>Qo‘shimcha xona raqamlari · ixtiyoriy<input value={building.customRooms} onChange={(event) => updateBuilding(building.key, { customRooms: event.target.value, rooms: [] })} placeholder="Masalan: Sportzal, Lab-1, 305" className="block w-full mt-1.5 px-3 py-2 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }} /></label>
        </div>
        <div className="mt-3 rounded-xl border p-3" style={{ borderColor: "#E5E1D8", background: "white" }}><div className="flex items-center justify-between gap-2 mb-2"><div><b className="text-xs" style={{ color: "#21384C" }}>Har bir qavatdagi xona soni</b><p className="text-[10px] mt-0.5" style={{ color: "#8A8578" }}>Qavatlarda xona soni har xil bo‘lishi mumkin.</p></div><button type="button" onClick={() => applyRoomCountToAllFloors(building.key)} className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap" style={{ background: "#EAF1F7", color: "#1B4B7A" }}>Standartni barchasiga</button></div><div className="grid grid-cols-2 md:grid-cols-4 gap-2">{Array.from({ length: building.floors }, (_, floorIndex) => floorIndex + 1).map((floor) => <label key={floor} className="text-[11px] font-semibold" style={{ color: "#5A5648" }}>{floor}-qavat<input aria-label={`${floor}-qavat xona soni`} type="number" min="0" max="100" value={building.floorRoomCounts?.[floor] ?? building.roomsPerFloor} onChange={(event) => updateFloorRoomCount(building.key, floor, event.target.value)} className="block w-full mt-1 px-2.5 py-1.5 rounded-lg border text-sm font-bold" style={{ borderColor: "#D9D4C8", color: "#1B4B7A" }} /></label>)}</div></div>
        <button type="button" onClick={() => createRooms(building.key)} className="w-full mt-3 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: "#1B4B7A" }}>⚡ {building.rooms.length ? "Xonalarni qayta yaratish" : "Xonalarni avtomatik yaratish"}</button>
        {building.rooms.length > 0 && <div className="mt-3 rounded-xl p-3" style={{ background: "#F1F7FB" }}><p className="text-xs font-bold mb-2" style={{ color: "#1B4B7A" }}>{building.rooms.length} ta xona tayyor</p><div className="flex flex-wrap gap-1.5 max-h-24 overflow-auto">{building.rooms.map((room) => <span key={`${building.key}-${room.number}`} className="px-2 py-1 rounded-lg text-[11px]" style={{ background: "white", color: "#5A5648" }}>{room.number}</span>)}</div></div>}
      </article>)}
      {!skipBuildings && <button type="button" onClick={() => setBuildings((current) => [...current, emptyBuilding(current.length)])} className="w-full py-3 rounded-xl border-2 border-dashed text-sm font-bold" style={{ borderColor: "#B9CCDC", color: "#1B4B7A" }}>＋ Yana bino qo‘shish</button>}
    </div>}

    {step === 3 && <div className="space-y-4">
      <section className="rounded-2xl border p-4" style={{ borderColor: "#D9D4C8", background: "#FCFBF8" }}>
        <div className="flex items-start justify-between gap-3 mb-3"><div><b className="text-sm" style={{ color: "#21384C" }}>⚡ 11 ta daraja bo‘yicha tez yaratish</b><p className="text-xs mt-1" style={{ color: "#8A8578" }}>Har bir sinf darajasining parallel sonini alohida yozing. 0 bo‘lsa, o‘sha daraja yaratilmaydi.</p></div><span className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: "#EAF1F7", color: "#1B4B7A" }}>{requestedClassCount} ta reja</span></div>
        <div className="flex flex-wrap items-center gap-1.5 mb-3"><span className="text-[11px] font-semibold mr-1" style={{ color: "#5A5648" }}>Barchasiga tez qo‘yish:</span>{[1, 2, 3, 5, 8].map((count) => <button type="button" key={count} onClick={() => applyParallelPreset(count)} className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold" style={{ background: "#EAF1F7", color: "#1B4B7A" }}>{count} tadan</button>)}<button type="button" onClick={() => applyParallelPreset(0)} className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold" style={{ background: "#FFF0EC", color: "#B0553A" }}>Tozalash</button></div>
        <div className="rounded-xl border overflow-hidden mb-3" style={{ borderColor: "#E5E1D8" }}>
          <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[10px] font-bold" style={{ background: "#F1F7FB", color: "#5A5648" }}><span className="col-span-2">DARAJA</span><span className="col-span-2">PARALLEL</span><span className="col-span-8">SINF VA SMENA</span></div>
          {gradeConfig.map((item) => <div key={item.grade} className="grid grid-cols-12 gap-2 items-center px-3 py-2 border-t" style={{ borderColor: "#F0ECE3", background: item.count ? "white" : "#FAF9F6" }}>
              <b className="col-span-2 text-xs" style={{ color: "#21384C" }}>{item.grade}-sinf</b>
              <input aria-label={`${item.grade}-sinf parallel soni`} type="number" min="0" max={CLASS_LETTERS.length} value={item.count} onChange={(event) => updateGradeCount(item.grade, event.target.value)} className="col-span-2 min-w-0 px-2 py-1.5 rounded-lg border text-sm font-bold text-center" style={{ borderColor: "#D9D4C8", color: "#1B4B7A" }} />
              <span className="col-span-8 text-[11px] truncate" style={{ color: item.count ? "#5A5648" : "#A8A397" }}>{item.count ? CLASS_LETTERS.slice(0, item.count).map((letter, index) => `${item.grade}-${letter}${shiftCount === 2 ? ` (${(index % 2) + 1}-smena)` : ""}`).join(", ") : "Yaratilmaydi"}</span>
            </div>)}
        </div>
        <p className="text-[11px] mb-3" style={{ color: "#8A8578" }}>{shiftCount === 2 ? "Smena faqat 1 yoki 2 bo‘ladi: A — 1-smena, B — 2-smena, C — 1-smena tarzida teng taqsimlanadi. Pastda har birini alohida o‘zgartirish mumkin." : "Har bir qatordagi sonni xohlagan payt o‘zgartirib, ro‘yxatni qayta hisoblash mumkin."}</p>
        <button type="button" onClick={generateClasses} className="w-full py-3 rounded-xl text-sm font-bold text-white" style={{ background: "#1B4B7A" }}>⚡ {requestedClassCount} ta sinfni qayta hisoblash va yaratish</button>
      </section>
      {classes.length > 0 && <>
        {!skipBuildings && roomPool.length > 0 && <button type="button" onClick={autoAssignAllRooms} className="w-full py-2.5 rounded-xl text-sm font-bold" style={{ background: "#EEF6F1", color: "#2E6C55" }}>🏫 Xonalarni smena bo‘yicha avtomatik taqsimlash</button>}
        <div className="flex items-center justify-between gap-2"><div><b className="text-sm" style={{ color: "#21384C" }}>Yaratiladigan sinflar</b><p className="text-[11px] mt-0.5" style={{ color: "#8A8578" }}>Kerakli sinfni bosing: uning smena, bino, xona, rahbar va psixologi alohida ochiladi.</p></div><button type="button" onClick={() => { setClasses([]); setNotice(""); }} className="text-xs whitespace-nowrap" style={{ color: "#B0553A" }}>Ro‘yxatni tozalash</button></div>
        <div className="space-y-2">{sortedClasses(classes).map((item) => {
          const selectedBuilding = buildingByKey.get(item.buildingKey);
          const availableRooms = (selectedBuilding?.rooms || []).filter((room) => room.number === item.roomNumber || !classes.some((other) => other.key !== item.key && Number(other.shift) === Number(item.shift) && other.buildingKey === item.buildingKey && other.roomNumber.toLocaleLowerCase("uz") === room.number.toLocaleLowerCase("uz")));
          return <details key={item.key} className="rounded-xl border bg-white overflow-visible" style={{ borderColor: "#E5E1D8" }}><summary className="px-3.5 py-3 flex items-center gap-3 cursor-pointer [&::-webkit-details-marker]:hidden" style={{ listStyle: "none" }}><b className="w-12 text-sm" style={{ color: "#21384C" }}>{classNameOf(item)}</b><span className="flex-1 text-xs truncate" style={{ color: "#8A8578" }}>{item.shift}-smena · {selectedBuilding ? `${selectedBuilding.name}, ${item.roomNumber || "xona tanlanmagan"}` : "bino/xona tanlanmagan"}</span><span style={{ color: "#8A8578" }}>⌄</span></summary>
            <div className="border-t p-3.5 grid md:grid-cols-3 gap-3" style={{ borderColor: "#F0ECE3" }}>
              {shiftCount === 2 && <label className="text-xs font-semibold" style={{ color: "#5A5648" }}>Smena *<select value={item.shift} onChange={(event) => updateClass(item.key, { shift: Number(event.target.value), buildingKey: "", roomNumber: "" })} className="block w-full mt-1.5 px-3 py-2 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }}><option value={1}>1-smena</option><option value={2}>2-smena</option></select></label>}
              {!skipBuildings && <label className="text-xs font-semibold" style={{ color: "#5A5648" }}>Bino · ixtiyoriy<select value={item.buildingKey} onChange={(event) => updateClass(item.key, { buildingKey: event.target.value, roomNumber: "" })} className="block w-full mt-1.5 px-3 py-2 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }}><option value="">Tanlanmagan</option>{buildings.map((building) => <option key={building.key} value={building.key}>{building.name}</option>)}</select></label>}
              {!skipBuildings && <label className="text-xs font-semibold" style={{ color: "#5A5648" }}>Xona · shu smenada bo‘sh<select value={item.roomNumber} onChange={(event) => updateClass(item.key, { roomNumber: event.target.value })} disabled={!selectedBuilding} className="block w-full mt-1.5 px-3 py-2 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8", opacity: selectedBuilding ? 1 : 0.55 }}><option value="">Tanlanmagan</option>{availableRooms.map((room) => <option key={room.number} value={room.number}>{room.number}-xona</option>)}</select></label>}
              <label className="text-xs font-semibold" style={{ color: "#5A5648" }}>Sinf rahbari · ixtiyoriy<div className="mt-1.5"><PersonPicker token={token} apiBase={apiBase} value={item.leader} onChange={(person) => updateClass(item.key, { leader: person })} placeholder="Rahbar ismi..." /></div></label>
              <label className="text-xs font-semibold" style={{ color: "#5A5648" }}>Psixolog · ixtiyoriy<div className="mt-1.5"><PersonPicker token={token} apiBase={apiBase} value={item.psychologist} onChange={(person) => updateClass(item.key, { psychologist: person })} placeholder="Psixolog ismi..." /></div></label>
              <button type="button" onClick={() => setClasses((current) => current.filter((row) => row.key !== item.key))} className="self-end py-2 rounded-xl text-xs font-semibold" style={{ background: "#FFF0EC", color: "#B0553A" }}>Sinfni olib tashlash</button>
            </div></details>;
        })}</div>
      </>}
    </div>}

    {step === 4 && <div className="space-y-4">
      <div className="rounded-2xl p-4" style={{ background: "#F7F5F0" }}><h3 className="font-bold" style={{ color: "#21384C" }}>{schoolNumber.trim() ? `${schoolNumber.trim()}-sonli ` : ""}{name.trim()}</h3><p className="text-xs mt-1" style={{ color: "#5A5648" }}>{region}, {district} · {shiftCount} smenali · {director ? `Direktor: ${director.full_name}` : "Direktor keyin belgilanadi"}</p></div>
      <div className="grid grid-cols-3 gap-2"><div className="rounded-xl p-3 text-center" style={{ background: "#F1F7FB" }}><b className="block text-lg" style={{ color: "#1B4B7A" }}>{skipBuildings ? 0 : buildings.length}</b><span className="text-xs" style={{ color: "#5A5648" }}>bino</span></div><div className="rounded-xl p-3 text-center" style={{ background: "#F1F7FB" }}><b className="block text-lg" style={{ color: "#1B4B7A" }}>{roomPool.length}</b><span className="text-xs" style={{ color: "#5A5648" }}>xona</span></div><div className="rounded-xl p-3 text-center" style={{ background: "#FDF3E0" }}><b className="block text-lg" style={{ color: "#8A5A1C" }}>{classes.length}</b><span className="text-xs" style={{ color: "#5A5648" }}>sinf</span></div></div>
      {!skipBuildings && buildings.map((building) => <div key={building.key} className="rounded-xl border px-3.5 py-3" style={{ borderColor: "#E5E1D8" }}><b className="text-sm">{building.name}</b><p className="text-xs mt-1" style={{ color: "#8A8578" }}>{building.floors} qavat · {building.rooms.length} xona</p></div>)}
      <div className="rounded-xl border max-h-72 overflow-auto" style={{ borderColor: "#E5E1D8" }}>{sortedClasses(classes).map((item) => { const building = buildingByKey.get(item.buildingKey); return <div key={item.key} className="px-3.5 py-2.5 border-b last:border-b-0 flex items-center gap-3" style={{ borderColor: "#F0ECE3" }}><b className="w-12 text-sm">{classNameOf(item)}</b><span className="text-xs flex-1" style={{ color: "#8A8578" }}>{item.shift}-smena · {building ? `${building.name}, ${item.roomNumber || "xonasiz"}` : "bino/xonasiz"}</span><span className="text-[11px]" style={{ color: "#5A5648" }}>{item.leader?.full_name || "rahbarsiz"}</span></div>; })}</div>
      <div className="rounded-xl px-3.5 py-3 text-xs font-semibold" style={{ background: "#EEF6F1", color: "#2E6C55" }}>Maktab, binolar, xonalar va sinflar bitta xavfsiz amalda yaratiladi. Platforma to‘lovi: 0 so‘m.</div>
    </div>}

    {notice && <div className="mt-4 rounded-xl px-3.5 py-3 text-xs" role="status" style={{ background: "#EEF6F1", color: "#2E6C55" }}>✓ {notice}</div>}
    {error && <div className="mt-4 rounded-xl px-3.5 py-3 text-sm" role="alert" style={{ background: "#FFF0EC", color: "#A04431" }}>{error}</div>}
    <div className="grid grid-cols-2 gap-2 mt-5"><button type="button" onClick={() => step === 1 ? onCancel?.() : setStep((current) => current - 1)} disabled={saving} className="py-3 rounded-xl font-bold text-sm" style={{ background: "#F7F5F0", color: "#5A5648" }}>{step === 1 ? "Bekor qilish" : "← Orqaga"}</button>{step < 4 ? <button type="button" onClick={goNext} className="py-3 rounded-xl font-bold text-sm text-white" style={{ background: "#1B4B7A" }}>Davom etish →</button> : <button type="button" onClick={createSchool} disabled={saving} className="py-3 rounded-xl font-bold text-sm text-white" style={{ background: "#1B4B7A", opacity: saving ? 0.65 : 1 }}>{saving ? "Yaratilmoqda..." : "Hammasini yaratish"}</button>}</div>
  </section>;
}
