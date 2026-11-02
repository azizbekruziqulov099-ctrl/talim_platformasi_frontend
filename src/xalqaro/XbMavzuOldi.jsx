import React, { useEffect, useState } from "react";
import { uiText as T } from "../interface/interfaceRuntime.js";
import { ustozFor } from "../kid/ustozRules.js";
import XbMavzu from "./XbMavzu.jsx";
import XbMashq from "./XbMashq.jsx";
import { xbFetch } from "./xbOvoz.js";
import "./xalqaro.css";

/** Maktab fanlaridan qaysilari xalqaro baholashga bog'lanadi. */
export const XB_FAN = /matem|algebra|geometr|fizika|kimyo|biolog|geograf|tabiiy|tabiat|atrof/i;

/**
 * REV260: maktab mavzusi ochilishidan oldin — shu mavzu xalqaro baholashda (TIMSS) qanday so'ralishi, dunyo natijalari,
 * o'quvchining darajasi va sinfdoshlar orasidagi o'rni, ustozning gapi (maqtov/eslatma/tanbeh), namuna savollar va yechish yo'llari.
 * Mos xalqaro mavzu topilmasa — darhol maktab darsiga o'tadi.
 */
export default function XbMavzuOldi({ apiBase, token, jins = "qiz", fan = "", sinf = "", mavzuNomi = "", onDavom, onDars, onYopish }) {
  const [d, setD] = useState(null);
  const [mashq, setMashq] = useState(false);
  useEffect(() => {
    let tirik = true;
    xbFetch(apiBase, "/api/xalqaro/mavzu_oldi", token, { params: { fan, sinf, mavzu_nomi: mavzuNomi } })
      .then((r) => { if (!tirik) return; if (r.topildi) setD(r); else onDavom?.(); })
      .catch(() => tirik && onDavom?.());
    return () => { tirik = false; };
  }, [fan, sinf, mavzuNomi]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!d) return <div className="xb-root"><p className="xb-muted">⏳ {T("Dars tayyorlanmoqda…")}</p></div>;
  const ustoz = ustozFor(d.toplam_nomi?.ustoz_fan || fan);
  if (mashq) return <div className="xb-root"><XbMashq apiBase={apiBase} token={token} jins={jins} ustoz={ustoz} manba={{ mavzu: d.kalit, soni: 5 }}
    sarlavha={`Xalqaro mashq: ${d.nom}`} onYopish={() => setMashq(false)} onTugadi={() => {}} /></div>;
  return <div className="xb-root"><XbMavzu apiBase={apiBase} token={token} jins={jins} ustoz={ustoz} kalit={d.kalit} malumot={d} oldi
    onYopish={onYopish} onDavom={onDavom} onDars={onDars ? (m) => onDars(m.dars_kodi, d.toplam_nomi?.ustoz_fan || fan) : null} onMashq={() => setMashq(true)} /></div>;
}
