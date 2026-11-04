import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
test('REV317: koddagi hamma interfeys matni tarjima ro‘yxatida (aks holda ru/en/de/es da o‘zbekcha qoladi)', () => {
  const out = execFileSync(process.execPath, [new URL('../../scripts/ui-manbalar.mjs', import.meta.url).pathname, '--check'], { encoding: 'utf8' });
  assert.match(out, /OK/);
});
