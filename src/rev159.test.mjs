// REV159: pulli kurs — o'qituvchi rekvizitlari (Click havolasi, Paynet, karta) va o'quvchi to'lov usulini tanlaydi.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const src = (p) => fs.readFileSync(new URL(p, import.meta.url), "utf8");

test("student chooses Click / Paynet / card and the method is sent with the receipt", () => {
  const s = src("./courses/CourseWorkspace.jsx");
  assert.match(s, /function PaymentMethods\(/);
  assert.match(s, /\/courses\/\$\{id\}\/payment-details/);
  assert.match(s, /request_key: paymentKey\.current, method: usul/);
  assert.match(s, /rel="noopener noreferrer"/);
});

test("teacher saves payment details and sees the chosen method", () => {
  const s = src("./courses/CourseStudio.jsx");
  assert.match(s, /function TeacherPaymentDetails\(/);
  assert.match(s, /"\/api\/kurslar\/payment-details", \{ method: "PUT", body: form \}/);
  assert.match(s, /To‘lov usuli: /);
});

test("REV160: Click automatic — invoice then redirect to my.click.uz only, no receipt needed", () => {
  const s = src("./courses/CourseWorkspace.jsx");
  assert.match(s, /function AvtoTolov\(/);
  assert.match(s, /\/tolov-buyurtma`/);
  assert.match(s, /click: \/\^https:\\\/\\\/my\\\.click\\\.uz\\\//);
  assert.match(s, /payme: \/\^https:\\\/\\\/checkout/);
});
