import test from "node:test"; import assert from "node:assert/strict";
import { yoshProfil, oqishMatni } from "./yoshOvoz.js";
const foiz = (p) => Number(p.tezlik.replace("%", ""));
test("yoshga mos ovoz: kichiklarga sekinroq, kattalarga tezroq", () => {
  assert.equal(yoshProfil({ yosh: "2-3" }).kim, "kabu"); assert.ok(foiz(yoshProfil({ yosh: "2-3" })) < foiz(yoshProfil({ yosh: "4-5" })) && foiz(yoshProfil({ yosh: "4-5" })) < foiz(yoshProfil({ yosh: "6-7" })));
  assert.ok(foiz(yoshProfil({ sinf: "2" })) < foiz(yoshProfil({ sinf: "6" })) && foiz(yoshProfil({ sinf: "6" })) < foiz(yoshProfil({ sinf: "10" })));
  assert.equal(yoshProfil({ sinf: "3-A" }).tezlik, "-5%"); assert.equal(yoshProfil({ sinf: "" }).tezlik, "+0%"); assert.equal(yoshProfil({ sinf: "11" }).ohang, "-4Hz");
});
test("o'qish matni: belgilar olinadi, amallar so'z bilan", () => {
  assert.equal(oqishMatni("🎉 To‘g‘ri!"), "To‘g‘ri!"); assert.equal(oqishMatni("3 + 4 = ?"), "3 qo‘shuv 4 nechaga teng"); assert.ok(oqishMatni("6 × 2").includes("ko‘paytirish")); assert.equal(oqishMatni("  "), "");
});
