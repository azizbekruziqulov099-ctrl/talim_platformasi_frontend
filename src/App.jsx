useEffect(() => {
  // Maktablar bo‘limi ochilganda yaratish formasi avtomatik ochilmaydi.
  // Avval mavjud maktablar ro‘yxati ko‘rinadi.
  setFormOchiq(false);
  maktablarniYukla();
}, [token]);

// Eski tugma o‘rniga:
<button
  type="button"
  onClick={() => setFormOchiq((ochiq) => !ochiq)}
  className="text-xs font-semibold px-3.5 py-1.5 rounded-full"
  style={{ backgroundColor: "#1B4B7A", color: "#fff" }}
>
  {formOchiq ? "✕ Yopish" : "+ Yangi maktab"}
</button>
