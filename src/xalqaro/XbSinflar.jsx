// REV373: Xalqaro baholash — o'qituvchining sinflari va o'quvchining sinfga qo'shilishi.
// O'qituvchi: sinf ochadi (1–11-sinf, nom, ixtiyoriy parol) → har sinfning taklif kodi va havolasi.
// O'quvchi: (1) taklif kodi/havola bilan — darhol; (2) sinf raqamini tanlab, ro'yxatdan sinfni topib, parol bilan.
import React, { useEffect, useState } from "react";
import { xbFetch } from "./xbOvoz.js";
import { T, tf } from "./xbTil.js";

export const TAKLIF_KALIT = "kabutar:xb:taklif";
const havola = (kod) => `${window.location.origin}/?xb_sinf=${encodeURIComponent(kod)}`;
const nusxala = async (s) => { try { await navigator.clipboard.writeText(s); return true; } catch { return false; } };

/* ───────────── o'qituvchi ───────────── */
export function OqituvchiSinflar({ apiBase, token, tanlangan, onTanla }) {
  const [d, setD] = useState(null);
  const [yangi, setYangi] = useState({ nom: "", sinf: "7", parol: "" });
  const [ochiq, setOchiq] = useState(false);
  const [xato, setXato] = useState("");
  const [xabar, setXabar] = useState("");
  const [boshqar, setBoshqar] = useState(null);   // { sinf, azolar }
  const yukla = () => xbFetch(apiBase, "/api/xalqaro/sinflar", token).then(setD).catch((e) => setXato(e.message));
  useEffect(() => { yukla(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (!d) return null;
  if (!d.ochishi_mumkin && !d.meniki.length) return null;
  const yarat = () => { setXato("");
    xbFetch(apiBase, "/api/xalqaro/sinflar", token, { method: "POST", body: { nom: yangi.nom, sinf: Number(yangi.sinf), parol: yangi.parol } })
      .then((r) => { setYangi({ nom: "", sinf: yangi.sinf, parol: "" }); setOchiq(false); setXabar(tf("«{n}» sinfi ochildi. Kodni o‘quvchilarga bering.", { n: r.sinf.nom })); yukla(); onTanla?.(r.sinf.id); })
      .catch((e) => setXato(e.message)); };
  const ozgar = (id, body, ok) => xbFetch(apiBase, `/api/xalqaro/sinflar/${id}`, token, { method: "POST", body })
    .then((r) => { if (r.ochirildi) { setBoshqar(null); if (tanlangan === id) onTanla?.(0); } else setBoshqar(r); ok && setXabar(ok); yukla(); }).catch((e) => setXato(e.message));
  return <div className="xb-panel xb-sinflar">
    <div className="xb-sinf-bosh"><h4>🏫 {T("Mening sinflarim")}</h4>
      <button type="button" className="xb-btn xb-btn-asosiy" onClick={() => setOchiq((x) => !x)}>➕ {T("Yangi sinf ochish")}</button></div>
    {xabar && <p className="xb-ok" role="status">{xabar}</p>}
    {xato && <p className="xb-xato" role="alert">{T(xato)}</p>}
    {ochiq && <div className="xb-sinf-forma">
      <label>{T("Sinf")}: <select value={yangi.sinf} onChange={(e) => setYangi({ ...yangi, sinf: e.target.value })}>
        {Array.from({ length: 11 }, (_, k) => <option key={k} value={String(k + 1)}>{tf("{n}-sinf", { n: k + 1 })}</option>)}</select></label>
      <label>{T("Sinf nomi")}: <input value={yangi.nom} maxLength={60} placeholder={T("masalan: 7-«A» yoki Matematika to‘garagi")} onChange={(e) => setYangi({ ...yangi, nom: e.target.value })} /></label>
      <label>{T("Parol (ixtiyoriy)")}: <input value={yangi.parol} maxLength={32} placeholder={T("o‘quvchilar ro‘yxatdan tanlaganda so‘raladi")} onChange={(e) => setYangi({ ...yangi, parol: e.target.value })} /></label>
      <p className="xb-muted xb-kichik">{T("Taklif kodi yoki havola bilan kelgan o‘quvchi parolsiz qo‘shiladi. Sinfni ro‘yxatdan topgan o‘quvchidan parol so‘raladi (parol qo‘ysangiz).")}</p>
      <button type="button" className="xb-btn xb-btn-asosiy" disabled={!yangi.nom.trim()} onClick={yarat}>✅ {T("Ochish")}</button>
    </div>}
    {!d.meniki.length && !ochiq && <p className="xb-muted">{T("Hali sinf ochmagansiz. «Yangi sinf ochish»ni bosing — o‘quvchilaringiz kod yoki havola bilan qo‘shiladi va natijalarini shu yerda ko‘rasiz.")}</p>}
    <div className="xb-sinf-royxat">{d.meniki.map((s) => <div key={s.id} className={`xb-sinf-karta ${tanlangan === s.id ? "is-on" : ""}`}>
      <button type="button" className="xb-sinf-tanla" onClick={() => onTanla?.(tanlangan === s.id ? 0 : s.id)}>
        <b>{s.nom}</b><small>{tf("{n}-sinf", { n: s.sinf })} · 👥 {s.azolar} {s.parolli ? "· 🔒" : ""}</small></button>
      <div className="xb-sinf-kod" aria-label={T("Taklif kodi")}>{s.kod}</div>
      <div className="xb-sinf-tugmalar">
        <button type="button" className="xb-btn" onClick={async () => setXabar((await nusxala(havola(s.kod))) ? T("Havola nusxalandi — o‘quvchilarga yuboring.") : havola(s.kod))}>🔗 {T("Havola")}</button>
        <button type="button" className="xb-btn" onClick={async () => setXabar((await nusxala(s.kod)) ? T("Kod nusxalandi.") : s.kod)}>📋 {T("Kod")}</button>
        <button type="button" className="xb-btn xb-btn-yengil" onClick={() => ozgar(s.id, {})}>⚙️ {T("Boshqarish")}</button>
      </div>
    </div>)}</div>
    {boshqar && <SinfBoshqaruv b={boshqar} onOzgar={ozgar} onYop={() => setBoshqar(null)} />}
  </div>;
}

function SinfBoshqaruv({ b, onOzgar, onYop }) {
  const s = b.sinf; const [parol, setParol] = useState(""); const [nom, setNom] = useState(s.nom);
  return <div className="xb-sinf-boshqar" role="dialog" aria-label={s.nom}>
    <div className="xb-sinf-bosh"><h4>⚙️ {s.nom}</h4><button type="button" className="xb-btn xb-btn-yengil" onClick={onYop}>✕</button></div>
    <label>{T("Sinf nomi")}: <input value={nom} maxLength={60} onChange={(e) => setNom(e.target.value)} />
      <button type="button" className="xb-btn" onClick={() => onOzgar(s.id, { nom }, T("Saqlandi."))}>💾</button></label>
    <label>{s.parolli ? T("Yangi parol") : T("Parol qo‘yish")}: <input value={parol} maxLength={32} onChange={(e) => setParol(e.target.value)} />
      <button type="button" className="xb-btn" onClick={() => onOzgar(s.id, { parol }, parol ? T("Parol o‘rnatildi.") : T("Parol olib tashlandi."))}>💾</button></label>
    <p className="xb-muted xb-kichik">{T("Kod yoki havola begona odamga tushib qolsa — yangi kod oling: eski kod ishlamay qoladi, qo‘shilgan o‘quvchilar qoladi.")}</p>
    <button type="button" className="xb-btn" onClick={() => { if (s.parolli && !parol) { window.alert(T("Yangi kod uchun parolni ham qayta yozing (yoki bo‘sh qoldirib, parolsiz qiling).")); return; } onOzgar(s.id, { yangi_kod: true, parol }, T("Yangi kod tayyor.")); }}>🔄 {T("Yangi kod")}</button>
    <h5>👥 {T("O‘quvchilar")} ({b.azolar.length})</h5>
    {!b.azolar.length && <p className="xb-muted">{T("Hali hech kim qo‘shilmagan. Kod yoki havolani o‘quvchilarga yuboring.")}</p>}
    <ul className="xb-sinf-azolar">{b.azolar.map((a) => <li key={a.user_id}>{a.ism}
      <button type="button" className="xb-btn xb-btn-yengil" onClick={() => window.confirm(tf("{n} sinfdan chiqarilsinmi?", { n: a.ism })) && onOzgar(s.id, { chiqar: a.user_id }, T("O‘quvchi chiqarildi."))}>✕</button></li>)}</ul>
    <button type="button" className="xb-btn xb-btn-xavf" onClick={() => window.confirm(T("Sinf o‘chirilsinmi? O‘quvchilar natijalari o‘chmaydi, faqat sinf yopiladi.")) && onOzgar(s.id, { ochirish: true }, T("Sinf o‘chirildi."))}>🗑 {T("Sinfni o‘chirish")}</button>
  </div>;
}

/* ───────────── o'quvchi ───────────── */
export function OquvchiSinf({ apiBase, token }) {
  const [d, setD] = useState(null);
  const [oyna, setOyna] = useState(() => { try { return localStorage.getItem(TAKLIF_KALIT) ? "kod" : ""; } catch { return ""; } });
  const [kod, setKod] = useState(() => { try { return localStorage.getItem(TAKLIF_KALIT) || ""; } catch { return ""; } });
  const [korish, setKorish] = useState(null);
  const [raqam, setRaqam] = useState(0);
  const [royxat, setRoyxat] = useState(null);
  const [tanlov, setTanlov] = useState(null);
  const [parol, setParol] = useState("");
  const [xato, setXato] = useState("");
  const [xabar, setXabar] = useState("");
  const yukla = () => xbFetch(apiBase, "/api/xalqaro/sinflar", token).then(setD).catch(() => setD({ meniki: [], azolik: [] }));
  useEffect(() => { yukla(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (kod.length >= 6) xbFetch(apiBase, `/api/xalqaro/taklif/${encodeURIComponent(kod)}`, token).then((r) => setKorish(r.sinf)).catch(() => setKorish(null)); else setKorish(null); }, [kod]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (raqam) { setRoyxat(null); setTanlov(null); xbFetch(apiBase, "/api/xalqaro/sinf_qidir", token, { params: { sinf: raqam } }).then((r) => setRoyxat(r.sinflar)).catch(() => setRoyxat([])); } }, [raqam]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!d || d.meniki?.length) return null;   // o'qituvchiga emas
  const qoshil = (body) => { setXato("");
    xbFetch(apiBase, "/api/xalqaro/sinfga_qoshil", token, { method: "POST", body })
      .then((r) => { try { localStorage.removeItem(TAKLIF_KALIT); } catch { /* */ }
        setXabar(tf("Siz «{n}» sinfiga qo‘shildingiz! O‘qituvchingiz {u} natijalaringizni ko‘radi.", { n: r.sinf.nom, u: r.sinf.oqituvchi || "" })); setOyna(""); setKod(""); setParol(""); yukla(); })
      .catch((e) => setXato(e.message)); };
  return <div className="xb-panel xb-sinflar">
    <div className="xb-sinf-bosh"><h4>🏫 {T("Sinfim")}</h4>
      <button type="button" className="xb-btn xb-btn-asosiy" onClick={() => { setOyna(oyna ? "" : "kod"); setXato(""); }}>➕ {T("Sinfga qo‘shilish")}</button></div>
    {xabar && <p className="xb-ok" role="status">{xabar}</p>}
    {d.azolik.length ? <div className="xb-sinf-royxat">{d.azolik.map((s) => <div key={s.id} className="xb-sinf-karta">
      <div><b>{s.nom}</b><small>{tf("{n}-sinf", { n: s.sinf })} · 👩‍🏫 {s.oqituvchi}</small></div>
      <button type="button" className="xb-btn xb-btn-yengil" onClick={() => window.confirm(tf("«{n}» sinfidan chiqasizmi?", { n: s.nom })) && xbFetch(apiBase, "/api/xalqaro/sinfdan_chiq", token, { method: "POST", body: { sinf_id: s.id } }).then(yukla)}>{T("Chiqish")}</button>
    </div>)}</div> : !oyna && <p className="xb-muted">{T("Siz hali sinfga qo‘shilmagansiz. O‘qituvchingiz bergan kod yoki havola bilan, yoki sinfingizni tanlab qo‘shiling.")}</p>}
    {oyna && <div className="xb-sinf-forma">
      <nav className="xb-tablar">
        <button type="button" className={oyna === "kod" ? "is-on" : ""} onClick={() => setOyna("kod")}>🔑 {T("Taklif kodi bilan")}</button>
        <button type="button" className={oyna === "tanla" ? "is-on" : ""} onClick={() => setOyna("tanla")}>📋 {T("Sinfni tanlab, parol bilan")}</button>
      </nav>
      {xato && <p className="xb-xato" role="alert">{T(xato)}</p>}
      {oyna === "kod" && <div>
        <label>{T("O‘qituvchi bergan 6 belgili kod")}: <input className="xb-kod-input" value={kod} maxLength={8} autoCapitalize="characters" placeholder="M7VAKW"
          onChange={(e) => setKod(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} /></label>
        {korish && <p className="xb-ok">🏫 <b>{korish.nom}</b> · {tf("{n}-sinf", { n: korish.sinf })} · 👩‍🏫 {korish.oqituvchi}</p>}
        <button type="button" className="xb-btn xb-btn-asosiy" disabled={!korish} onClick={() => qoshil({ kod })}>✅ {T("Qo‘shilish")}</button>
      </div>}
      {oyna === "tanla" && <div>
        <p>{T("1. Sinfingizni tanlang:")}</p>
        <div className="xb-sinf-raqamlar">{Array.from({ length: 11 }, (_, k) => <button key={k} type="button" className={`xb-btn ${raqam === k + 1 ? "is-on" : ""}`} onClick={() => setRaqam(k + 1)}>{k + 1}</button>)}</div>
        {raqam > 0 && <><p>{T("2. O‘qituvchingiz ochgan sinfni toping:")}</p>
          {royxat === null ? <p className="xb-muted">…</p> : !royxat.length ? <p className="xb-muted">{tf("{n}-sinfda hali ochiq sinf yo‘q. O‘qituvchingizdan kod so‘rang.", { n: raqam })}</p>
            : <div className="xb-sinf-royxat">{royxat.map((s) => <button key={s.id} type="button" className={`xb-sinf-karta xb-sinf-tanla ${tanlov?.id === s.id ? "is-on" : ""}`} onClick={() => { setTanlov(s); setParol(""); }}>
              <b>{s.nom} {s.parolli ? "🔒" : ""}</b><small>👩‍🏫 {s.oqituvchi}</small></button>)}</div>}</>}
        {tanlov && <>{tanlov.parolli && <label>{T("3. O‘qituvchi aytgan parol")}: <input value={parol} maxLength={32} onChange={(e) => setParol(e.target.value)} /></label>}
          <button type="button" className="xb-btn xb-btn-asosiy" disabled={tanlov.parolli && !parol} onClick={() => qoshil({ sinf_id: tanlov.id, parol })}>✅ {tf("«{n}» sinfiga qo‘shilish", { n: tanlov.nom })}</button></>}
      </div>}
    </div>}
  </div>;
}
