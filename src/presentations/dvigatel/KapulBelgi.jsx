import React, { useEffect, useState } from 'react';
import { Coins } from 'lucide-react';

/* Kapul balansi: 1 kapul = 1000 so'm. PPT — 10 slayd = 1 kapul, ochiq dars (AI) = 1 kapul. */
export default function KapulBelgi({ so, yangila, narx }) {
  const [k, setK] = useState(null);
  useEffect(() => {
    let bekor = false;
    so('/kapul').then(r => { if (!bekor) setK(r); }).catch(() => {});
    return () => { bekor = true; };
  }, [yangila]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!k) return null;
  const kam = narx && k.balans < narx;
  return (
    <span className={`dv-kapul${kam ? ' kam' : ''}`} title={`1 kapul = ${k.kapul_som} so‘m · PPT: 10 slayd = ${k.narx.ppt_10_slayd} kapul · ochiq dars (AI) = ${k.narx.ochiq_dars} kapul`}>
      <Coins size={15} /> {k.balans} kapul
    </span>
  );
}
