import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const stagingRoot = path.resolve('staging/monster_audit');

function inspectPng(filePath) {
  const buf = fs.readFileSync(filePath);
  const png = PNG.sync.read(buf);
  let opaqueCount = 0;
  let minX = png.width, maxX = 0, minY = png.height, maxY = 0;
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const idx = (y * png.width + x) * 4;
      if (png.data[idx + 3] > 10) {
        opaqueCount++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return {
    width: png.width,
    height: png.height,
    opaquePixels: opaqueCount,
    bounds: opaqueCount > 0 ? { minX, minY, maxX, maxY, w: maxX - minX + 1, h: maxY - minY + 1 } : null
  };
}

console.log('=== PACK 1: N3XUS STARTER (BAT & GHOST FOCUS) ===');

function inspectNexusMonster(name) {
  const dir = path.join(stagingRoot, '01_nexus_starter/N3XUS-Starter-FREE-v1.1/monsters', name);
  const jsonPath = path.join(dir, `${name}-sheet.json`);
  const pngPath = path.join(dir, `${name}-sheet.png`);
  
  if (fs.existsSync(jsonPath)) {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`\nMonster: ${name.toUpperCase()}`);
    console.log(`  Atlas size: ${data.meta?.size?.w}x${data.meta?.size?.h}`);
    console.log(`  Frame tags: ${data.meta?.frameTags ? data.meta.frameTags.length : 0} tags:`);
    if (data.meta?.frameTags) {
      for (const t of data.meta.frameTags) {
        console.log(`    Tag "${t.name}": frames ${t.from}..${t.to} (${t.to - t.from + 1} frames), direction: ${t.direction}`);
      }
    }
    const frames = Array.isArray(data.frames) ? data.frames : Object.entries(data.frames);
    console.log(`  Total frames: ${frames.length}`);
    if (frames.length > 0) {
      const first = Array.isArray(data.frames) ? data.frames[0] : frames[0][1];
      console.log(`  Frame sample size: ${first.frame?.w}x${first.frame?.h}`);
    }
  }
  if (fs.existsSync(pngPath)) {
    const info = inspectPng(pngPath);
    console.log(`  PNG info: ${info.width}x${info.height}, opaque: ${info.opaquePixels}`);
  }
}

inspectNexusMonster('bat');
inspectNexusMonster('ghost');
inspectNexusMonster('acid-slime');
inspectNexusMonster('goblin');
inspectNexusMonster('skeleton');
inspectNexusMonster('zombie');

console.log('\n=== PACK 2: GOBLIN SCOUT ===');
const goblinDir = path.join(stagingRoot, '02_goblin_scout');
const goblinFiles = fs.readdirSync(goblinDir);
console.log('Files in goblin_scout_v5_silhouette_free:');
for (const f of goblinFiles) {
  const fp = path.join(goblinDir, f);
  const stat = fs.statSync(fp);
  console.log(`  ${f} (${stat.size} bytes)`);
}
const goblinJsonPath = path.join(goblinDir, 'goblin_scout_v5_weapons_dagger_1_silhouette.json');
if (fs.existsSync(goblinJsonPath)) {
  const data = JSON.parse(fs.readFileSync(goblinJsonPath, 'utf8'));
  console.log(`Goblin Dagger JSON:`);
  console.log(`  Image: ${data.meta?.image}, Size: ${data.meta?.size?.w}x${data.meta?.size?.h}`);
  console.log(`  Tags (${data.meta?.frameTags?.length || 0}):`);
  if (data.meta?.frameTags) {
    for (const t of data.meta.frameTags) {
      console.log(`    Tag "${t.name}": frames ${t.from}..${t.to} (${t.to - t.from + 1} frames)`);
    }
  }
  const frames = Array.isArray(data.frames) ? data.frames : Object.entries(data.frames);
  console.log(`  Total frames: ${frames.length}`);
}
const goblinPngPath = path.join(goblinDir, 'goblin_scout_v5_weapons_dagger_1_silhouette.png');
if (fs.existsSync(goblinPngPath)) {
  const info = inspectPng(goblinPngPath);
  console.log(`  Goblin Dagger PNG info: ${info.width}x${info.height}, bounds:`, info.bounds);
}

console.log('\n=== PACK 3: SHADOW SERIES (MONSTERS / CREATURES / BOSSES) ===');
const shadowEntities = [
  { name: 'Hallokin', dir: 'SHADOW Series - Hallokin (free)' },
  { name: 'Shadeflit', dir: 'SHADOW Series - Shadeflit (Free)' },
  { name: 'The Blind Huntress', dir: 'SHADOW Series - The Blind Huntress' },
  { name: 'The Shadowed Wetlands Boss', dir: 'SHADOW Series - The Shadowed Wetlands Boss v1.1' }
];

for (const ent of shadowEntities) {
  const entDir = path.join(stagingRoot, '03_shadow_series', ent.dir);
  console.log(`\nEntity: ${ent.name}`);
  if (!fs.existsSync(entDir)) {
    console.log(`  Directory not found: ${entDir}`);
    continue;
  }
  const files = [];
  function scan(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) scan(full);
      else if (e.name.endsWith('.png')) files.push(full);
    }
  }
  scan(entDir);
  for (const f of files) {
    const rel = path.relative(entDir, f);
    const info = inspectPng(f);
    console.log(`  PNG: ${rel} | ${info.width}x${info.height} | opaque: ${info.opaquePixels} | bounds: ${info.bounds ? `${info.bounds.w}x${info.bounds.h} at (${info.bounds.minX},${info.bounds.minY})` : 'empty'}`);
  }
}
