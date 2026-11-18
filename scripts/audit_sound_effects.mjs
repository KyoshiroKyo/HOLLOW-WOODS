import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    try {
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(walk(fullPath));
      } else {
        results.push({ fullPath, size: stat.size, name: file });
      }
    } catch (e) {
      // ignore
    }
  }
  return results;
}

const seDir = path.resolve('Sound_Effects');
const allFiles = walk(seDir);
console.log('Total files in Sound_Effects:', allFiles.length);

const extCount = {};
for (const f of allFiles) {
  const ext = path.extname(f.name).toLowerCase();
  extCount[ext] = (extCount[ext] || 0) + 1;
}
console.log('Extension counts:', extCount);

const zips = allFiles.filter(f => f.name.endsWith('.zip') || f.name.endsWith('.rar'));
console.log('Zip/Rar archives:', JSON.stringify(zips.map(z => ({ name: z.name, size: z.size, path: path.relative(seDir, z.fullPath) })), null, 2));

// Top-level directory file counts
const topDirs = fs.readdirSync(seDir);
for (const item of topDirs) {
  const full = path.join(seDir, item);
  const st = fs.statSync(full);
  if (st.isDirectory()) {
    const subFiles = walk(full);
    console.log(`Directory [${item}]: ${subFiles.length} files`);
  } else {
    console.log(`Top file: ${item} (${st.size} bytes)`);
  }
}
