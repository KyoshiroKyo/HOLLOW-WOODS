import fs from 'fs';
import path from 'path';

const dir = path.resolve('staging/env_audit/06_shadow_series');

function walk(curr) {
  const entries = fs.readdirSync(curr, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(curr, e.name);
    if (e.isDirectory()) {
      walk(full);
    } else {
      console.log(path.relative(dir, full));
    }
  }
}

walk(dir);
