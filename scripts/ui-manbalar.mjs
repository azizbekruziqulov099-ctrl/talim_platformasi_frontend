// REV317: interfeys matnlari ro'yxatini (interfaceSources.json) koddagi hamma uiText/__kbUi/T("…") matnlari bilan
// to'ldiradi — yangi qo'shilgan tugma va sarlavhalar ham tarjima qilinadi (ro'yxatda bo'lmasa — o'zbekcha qolardi).
// Ishlatish: node scripts/ui-manbalar.mjs   (tekshirish: node scripts/ui-manbalar.mjs --check)
import fs from "node:fs";
import path from "node:path";
const SRC = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../src");
const PAT = /(?:(?:__kbUi|__kbM)|uiText|\bT|uiSpeech)\(\s*(?:"((?:[^"\\\n]|\\.)*)"|'((?:[^'\\\n]|\\.)*)'|`((?:[^`\\$]|\\.)*)`)\s*[,)]/g;
const norm = (x) => String(x).trim().replace(/[‘’ʻʼ`]/g, "'").replace(/\s+/g, " ");
export function koddagiMatnlar() {
  const out = new Set();
  const yur = (d) => { for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) { if (f.name !== "locales" && f.name !== "node_modules") yur(p); continue; }
    if (!/\.(jsx?|mjs)$/.test(f.name) || /\.test\./.test(f.name)) continue;
    const s = fs.readFileSync(p, "utf8");
    for (const m of s.matchAll(PAT)) {
      let t = m[1] ?? m[2] ?? m[3];
      if (t.includes("\\")) { try { t = JSON.parse(`"${t.replace(/"/g, '\\"')}"`); } catch { continue; } }
      t = norm(t);
      if (t.length >= 2 && /[A-Za-zА-Яа-я]/.test(t)) out.add(t);
    }
  } };
  yur(SRC);
  return out;
}
const fayl = path.join(SRC, "interface/interfaceSources.json");
const bor = JSON.parse(fs.readFileSync(fayl, "utf8"));
const borNorm = new Set(bor.map(norm));
const yangi = [...koddagiMatnlar()].filter((x) => !borNorm.has(x)).sort();
if (process.argv.includes("--check")) { console.log(yangi.length ? `Ro'yxatda yo'q: ${yangi.length}\n${yangi.slice(0, 20).join("\n")}` : "OK"); process.exit(yangi.length ? 1 : 0); }
fs.writeFileSync(fayl, JSON.stringify([...bor, ...yangi]));
console.log(`qo'shildi: ${yangi.length}, jami: ${bor.length + yangi.length}`);
