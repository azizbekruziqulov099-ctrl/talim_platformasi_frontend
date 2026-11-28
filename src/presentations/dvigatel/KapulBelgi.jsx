import React from 'react';
import KapulHamyon from '../../kapul/KapulHamyon.jsx';

/* Kapul balansi (v710: bosilsa hamyon oynasi ochiladi). 1 kapul = admin belgilagan so'm; PPT — har 10 slayd, ochiq dars (AI) — narxlar admin panelida. */
export default function KapulBelgi({ apiBase, token, yangila, narx }) {
  return <KapulHamyon apiBase={apiBase} token={token} yangila={yangila} narx={narx} />;
}
