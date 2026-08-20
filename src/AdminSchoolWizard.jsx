import React, { useEffect, useMemo, useState } from "react";

const emptyClass = (index = 0) => ({
  key: `${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`,
  grade: "",
  letter: "A",
  shift: 1,
  leader: null,
  psychologist: null,
  building: "",
  room: "",
});

const CLASS_GRADES = Array.from({ length: 11 }, (_, index) => String(index + 1));
const CLASS_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];

export function normalizeSchoolClassName(value) {
  const match = String(value || "").trim().match(/^(1[01]|[1-9])\s*[-–—_ ]?\s*([A-Za-zА-Яа-я])$/);
  return match ? `${match[1]}-${match[2].toUpperCase()}` : "";
}

function PersonPicker({ token, apiBase, value, onChange, placeholder }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (value || query.trim().length < 2) {
      setResults([]);
      return undefined;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`${apiBase}/api/admin/foydalanuvchi_qidir?token=${encodeURIComponent(token)}&ism=${encodeURIComponent(query.trim())}`);
        const data = await response.json();
        setResults(response.ok ? (data.natijalar || []) : []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [apiBase, query, token, value]);

  if (value) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 border" style={{ borderColor: "#B9CCDC", background: "#F1F7FB" }}>
        <span className="text-xs font-semibold" style={{ color: "#1B4B7A" }}>{value.full_name}</span>
        <button type="button" onClick={() => { onChange(null); setQuery(""); }} className="text-xs" style={{ color: "#8A5A1C" }}>✕</button>
      </div>
    );
  }

  return (
    <div className="relative">
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 rounded-xl border text-xs" style={{ borderColor: "#E5E1D8" }} />
      {loading && <span className="absolute right-3 top-2 text-xs" style={{ color: "#8A8578" }}>...</span>}
      {results.length > 0 && (
        <div className="absolute z-30 left-0 right-0 mt-1 rounded-xl border bg-white shadow-lg p-1 max-h-44 overflow-auto" style={{ borderColor: "#E5E1D8" }}>
          {results.map((person) => (
            <button type="button" key={person.user_id} onClick={() => { onChange(person); setQuery(""); setResults([]); }}
              className="w-full text-left rounded-lg px-3 py-2 text-xs hover:bg-slate-50">
              <b>{person.full_name}</b><span className="block" style={{ color: "#8A8578" }}>{person.role} · ID {person.user_id}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminSchoolWizard({ token, apiBase, regions, districtsByRegion, onCancel, onCreated }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [schoolNumber, setSchoolNumber] = useState("");
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [shiftCount, setShiftCount] = useState(1);
  const [director, setDirector] = useState(null);
  const [classes, setClasses] = useState([emptyClass(0)]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const normalizedClasses = useMemo(
    () => classes.map((item) => normalizeSchoolClassName(`${item.grade}-${item.letter}`)),
    [classes],
  );

  const validateSchool = () => {
    if (name.trim().length < 2) return "Maktab nomini kiriting";
    if (!region) return "Viloyatni tanlang";
    if (!district) return "Tumanni tanlang";
    return "";
  };

  const validateClasses = () => {
    if (!classes.length) return "Kamida bitta haqiqiy sinf kiriting";
    if (normalizedClasses.some((item) => !item)) return "Sinfni 1-A, 5-B yoki 11-D ko‘rinishida yozing";
    if (new Set(normalizedClasses).size !== normalizedClasses.length) return "Bir xil sinf ikki marta kiritilgan";
    if (shiftCount === 2 && classes.some((item) => ![1, 2].includes(Number(item.shift)))) return "Har bir sinf smenasini tanlang";
    return "";
  };

  const goNext = () => {
    const message = step === 1 ? validateSchool() : step === 3 ? validateClasses() : "";
    if (message) { setError(message); return; }
    setError("");
    setStep((current) => Math.min(4, current + 1));
  };

  const updateClass = (key, patch) => {
    setClasses((current) => current.map((item) => item.key === key ? { ...item, ...patch } : item));
    setError("");
  };

  const createSchool = async () => {
    const message = validateSchool() || validateClasses();
    if (message || saving) { setError(message); return; }
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`${apiBase}/api/admin/maktab-yaratish-v2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          name: name.trim(),
          school_number: schoolNumber.trim() || null,
          region,
          district,
          shift_count: shiftCount,
          director_user_id: director?.user_id || null,
          classes: classes.map((item, index) => ({
            name: normalizedClasses[index],
            shift: shiftCount === 1 ? 1 : Number(item.shift),
            leader_user_id: item.leader?.user_id || null,
            psychologist_user_id: item.psychologist?.user_id || null,
            building: item.building.trim() || null,
            room: item.room.trim() || null,
          })),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || "Maktabni yaratib bo‘lmadi");
      onCreated?.(data.school, data);
    } catch (requestError) {
      setError(requestError.message || "Maktabni yaratib bo‘lmadi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl p-5 bg-white border mb-4" style={{ borderColor: "#D9D4C8" }}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-xs font-bold" style={{ color: "#8A5A1C" }}>YANGI MAKTAB · {step}/4 BOSQICH</p>
          <h2 className="text-lg font-bold" style={{ color: "#21384C" }}>
            {step === 1
              ? "Maktab ma’lumoti"
              : step === 2
                ? "Ish tartibi"
                : step === 3
                  ? "Mavjud sinflar"
                  : "Tekshirish va yaratish"}
          </h2>
        </div>
        <button type="button" onClick={onCancel} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: "#F7F5F0", color: "#5A5648" }}>✕ Yopish</button>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-5">
        {[1, 2, 3, 4].map((number) => <div key={number} className="h-1.5 rounded-full" style={{ background: number <= step ? "#C89B3C" : "#E9E4D8" }} />)}
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <label className="text-xs font-semibold" style={{ color: "#5A5648" }}>Maktab nomi *
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Masalan: Ziyo maktabi"
                className="block w-full mt-1.5 px-3.5 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }} />
            </label>
            <label className="text-xs font-semibold" style={{ color: "#5A5648" }}>Maktab raqami · ixtiyoriy
              <input value={schoolNumber} onChange={(event) => setSchoolNumber(event.target.value)} placeholder="Masalan: 21"
                className="block w-full mt-1.5 px-3.5 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }} />
            </label>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <label className="text-xs font-semibold" style={{ color: "#5A5648" }}>Viloyat *
              <select value={region} onChange={(event) => { setRegion(event.target.value); setDistrict(""); }}
                className="block w-full mt-1.5 px-3.5 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }}>
                <option value="">Tanlang</option>
                {(regions || []).map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold" style={{ color: "#5A5648" }}>Tuman/shahar *
              <select value={district} onChange={(event) => setDistrict(event.target.value)} disabled={!region}
                className="block w-full mt-1.5 px-3.5 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8", opacity: region ? 1 : 0.55 }}>
                <option value="">Tanlang</option>
                {((districtsByRegion || {})[region] || []).map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
          </div>
          <div className="rounded-xl px-3.5 py-3 text-xs" style={{ background: "#EEF6F1", color: "#2E6C55" }}>
            Bu bosqichda faqat maktabning rasmiy nomi va hududi olinadi. To‘lov, balans yoki sinov muddati so‘ralmaydi.
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold mb-1.5" style={{ color: "#5A5648" }}>Maktabdagi smena soni *</p>
            <div className="grid grid-cols-2 gap-2">
              {[1, 2].map((number) => <button type="button" key={number} onClick={() => { setShiftCount(number); setClasses((current) => current.map((item) => ({ ...item, shift: 1 }))); }}
                className="py-2.5 rounded-xl border text-sm font-bold" style={shiftCount === number ? { background: "#1B4B7A", color: "white", borderColor: "#1B4B7A" } : { background: "white", color: "#5A5648", borderColor: "#E5E1D8" }}>{number} smenali</button>)}
            </div>
          </div>
          <label className="text-xs font-semibold block" style={{ color: "#5A5648" }}>Direktor · ixtiyoriy
            <div className="mt-1.5"><PersonPicker token={token} apiBase={apiBase} value={director} onChange={setDirector} placeholder="Mavjud foydalanuvchidan direktor tanlang..." /></div>
          </label>
          <div className="rounded-xl px-3.5 py-3 text-xs leading-relaxed" style={{ background: "#F7F5F0", color: "#5A5648" }}>
            Direktor hozir tanlanmasa ham maktab yaratiladi. Uni keyin muassasa boshqaruvidan belgilash mumkin. Ikki smena tanlansa, keyingi bosqichda har bir sinfning smenasi alohida ko‘rsatiladi.
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <div className="rounded-xl px-3.5 py-3 text-xs" style={{ background: "#FDF3E0", color: "#8A5A1C" }}>
            Faqat maktabda haqiqatda mavjud sinflarni bittalab kiriting. Tizim 2–3 ta parallelni o‘zi yaratmaydi.
          </div>
          {classes.map((item, index) => (
            <article key={item.key} className="rounded-2xl border p-4" style={{ borderColor: "#E5E1D8", background: "#FCFBF8" }}>
              <div className="flex items-center justify-between mb-3"><b className="text-sm">{normalizedClasses[index] || `${index + 1}-sinf qatori`}</b>
                {classes.length > 1 && <button type="button" onClick={() => setClasses((current) => current.filter((row) => row.key !== item.key))} className="text-xs" style={{ color: "#B0553A" }}>Olib tashlash</button>}
              </div>
              <div className="grid md:grid-cols-4 gap-3">
                <label className="text-xs font-semibold" style={{ color: "#5A5648" }}>Sinf darajasi *
                  <select value={item.grade} onChange={(event) => updateClass(item.key, { grade: event.target.value })}
                    className="block w-full mt-1.5 px-3 py-2 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }}>
                    <option value="">Tanlang</option>
                    {CLASS_GRADES.map((grade) => <option key={grade} value={grade}>{grade}-sinf</option>)}
                  </select>
                </label>
                <label className="text-xs font-semibold" style={{ color: "#5A5648" }}>Parallel *
                  <select value={item.letter} onChange={(event) => updateClass(item.key, { letter: event.target.value })}
                    className="block w-full mt-1.5 px-3 py-2 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }}>
                    {CLASS_LETTERS.map((letter) => <option key={letter} value={letter}>{letter}</option>)}
                  </select>
                </label>
                {shiftCount === 2 && <label className="text-xs font-semibold" style={{ color: "#5A5648" }}>Smena *
                  <select value={item.shift} onChange={(event) => updateClass(item.key, { shift: Number(event.target.value) })}
                    className="block w-full mt-1.5 px-3 py-2 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }}><option value={1}>1-smena</option><option value={2}>2-smena</option></select>
                </label>}
                <label className="text-xs font-semibold" style={{ color: "#5A5648" }}>Bino · ixtiyoriy
                  <input value={item.building} onChange={(event) => updateClass(item.key, { building: event.target.value })} placeholder="A bino"
                    className="block w-full mt-1.5 px-3 py-2 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }} />
                </label>
                <label className="text-xs font-semibold" style={{ color: "#5A5648" }}>Xona · ixtiyoriy
                  <input value={item.room} onChange={(event) => updateClass(item.key, { room: event.target.value })} placeholder="205"
                    className="block w-full mt-1.5 px-3 py-2 rounded-xl border text-sm" style={{ borderColor: "#E5E1D8" }} />
                </label>
                <label className="text-xs font-semibold" style={{ color: "#5A5648" }}>Sinf rahbari · ixtiyoriy
                  <div className="mt-1.5"><PersonPicker token={token} apiBase={apiBase} value={item.leader} onChange={(person) => updateClass(item.key, { leader: person })} placeholder="Rahbar ismi..." /></div>
                </label>
                <label className="text-xs font-semibold" style={{ color: "#5A5648" }}>Psixolog · ixtiyoriy
                  <div className="mt-1.5"><PersonPicker token={token} apiBase={apiBase} value={item.psychologist} onChange={(person) => updateClass(item.key, { psychologist: person })} placeholder="Psixolog ismi..." /></div>
                </label>
              </div>
            </article>
          ))}
          <button type="button" onClick={() => setClasses((current) => [...current, emptyClass(current.length)])}
            className="w-full py-3 rounded-xl border-2 border-dashed text-sm font-bold" style={{ borderColor: "#B9CCDC", color: "#1B4B7A" }}>＋ Yana mavjud sinfni qo‘shish</button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <div className="rounded-2xl p-4" style={{ background: "#F7F5F0" }}>
            <h3 className="font-bold" style={{ color: "#21384C" }}>{schoolNumber.trim() ? `${schoolNumber.trim()}-sonli ` : ""}{name.trim()}</h3>
            <p className="text-xs mt-1" style={{ color: "#5A5648" }}>{region}, {district} · {shiftCount} smenali · {director ? `Direktor: ${director.full_name}` : "Direktor keyin belgilanadi"}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-2">
            {classes.map((item, index) => <div key={item.key} className="rounded-xl border px-3.5 py-3" style={{ borderColor: "#E5E1D8" }}>
              <b className="text-sm">{normalizedClasses[index]}</b>
              <p className="text-xs mt-1" style={{ color: "#8A8578" }}>{shiftCount === 2 ? `${item.shift}-smena` : "1-smena"}{item.building ? ` · ${item.building}` : ""}{item.room ? ` · ${item.room}-xona` : ""}</p>
              <p className="text-xs" style={{ color: "#8A8578" }}>{item.leader?.full_name || "Rahbar belgilanmagan"} · {item.psychologist?.full_name || "Psixolog belgilanmagan"}</p>
            </div>)}
          </div>
          <div className="rounded-xl px-3.5 py-3 text-xs font-semibold" style={{ background: "#EEF6F1", color: "#2E6C55" }}>Yaratilgach maktab darhol faol bo‘ladi. Platforma to‘lovi: 0 so‘m.</div>
        </div>
      )}

      {error && <div className="mt-4 rounded-xl px-3.5 py-3 text-sm" style={{ background: "#FFF0EC", color: "#A04431" }}>{error}</div>}
      <div className="grid grid-cols-2 gap-2 mt-5">
        <button type="button" onClick={() => step === 1 ? onCancel?.() : setStep((current) => current - 1)} disabled={saving}
          className="py-3 rounded-xl font-bold text-sm" style={{ background: "#F7F5F0", color: "#5A5648" }}>{step === 1 ? "Bekor qilish" : "← Orqaga"}</button>
        {step < 4 ? <button type="button" onClick={goNext} className="py-3 rounded-xl font-bold text-sm text-white" style={{ background: "#1B4B7A" }}>Davom etish →</button>
          : <button type="button" onClick={createSchool} disabled={saving} className="py-3 rounded-xl font-bold text-sm text-white" style={{ background: "#1B4B7A", opacity: saving ? 0.65 : 1 }}>{saving ? "Yaratilmoqda..." : "Maktabni yaratish"}</button>}
      </div>
    </section>
  );
}
