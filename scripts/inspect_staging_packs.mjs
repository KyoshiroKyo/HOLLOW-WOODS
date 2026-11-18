import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

function walk(dir) {
  let res = [];
  if (!fs.existsSync(dir)) return res;
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    let s = fs.statSync(p);
    if (s.isDirectory()) res = res.concat(walk(p));
    else res.push(p);
  });
  return res;
}

const stagingDir = 'staging/env_audit';
const packs = fs.readdirSync(stagingDir);

for (const pack of packs) {
  console.log(`\n======================================================`);
  console.log(`PACK: ${pack}`);
  console.log(`======================================================`);
  const full = path.join(stagingDir, pack);
  const files = walk(full);
  
  for (const f of files) {
    const rel = path.relative(full, f).replace(/\\/g, '/');
    const ext = path.extname(f).toLowerCase();
    const sizeKb = (fs.statSync(f).size / 1024).toFixed(1);
    
    if (ext === '.png') {
      try {
        const buf = fs.readFileSync(f);
        const png = PNG.sync.read(buf);
        console.log(`  [PNG] ${rel} | ${png.width}x${png.height} | ${sizeKb} KB`);
      } catch (err) {
        console.log(`  [PNG-ERR] ${rel} | ${sizeKb} KB | Error: ${err.message}`);
      }
    } else {
      console.log(`  [FILE] ${rel} | ${sizeKb} KB`);
    }
  }
}
