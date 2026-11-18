import fs from 'fs';
import path from 'path';

const root = path.resolve('staging/monster_audit');

function scan(dir) {
  const list = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      list.push(...scan(full));
    } else {
      list.push(full);
    }
  }
  return list;
}

const packs = ['01_nexus_starter', '02_goblin_scout', '03_shadow_series'];

for (const pack of packs) {
  console.log(`\n======================================================`);
  console.log(`PACK: ${pack}`);
  console.log(`======================================================`);
  const packDir = path.join(root, pack);
  if (!fs.existsSync(packDir)) continue;
  const files = scan(packDir);
  for (const f of files) {
    const rel = path.relative(packDir, f);
    const stat = fs.statSync(f);
    console.log(`  ${rel} (${(stat.size / 1024).toFixed(1)} KB)`);
  }
}
