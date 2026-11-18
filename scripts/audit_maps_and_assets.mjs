import fs from 'fs';
import path from 'path';

console.log('=== BẮT ĐẦU AUDIT CHI TIẾT TỪNG BẢN ĐỒ & ASSET HOLLOW WOODS V1.4 ===\n');

// 1. Kiểm tra zones.json
const zonesFile = JSON.parse(fs.readFileSync('src/data/zones.json', 'utf8'));
const zones = zonesFile.zones;
console.log(`[1] Đã nạp ${zones.length} phân khu từ zones.json.`);

// 2. Rà soát Asset & Path Integrity trong PreloadScene.ts
const preloadContent = fs.readFileSync('src/scenes/PreloadScene.ts', 'utf8');
const assetRegex = /this\.load\.(?:image|spritesheet|audio)\s*\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]/g;
let match;
let totalAssets = 0;
let missingAssets = 0;
const missingList = [];

while ((match = assetRegex.exec(preloadContent)) !== null) {
  totalAssets++;
  const key = match[1];
  let relPath = match[2];
  
  // Public directory in Vite is served at root
  const diskPath = path.join('public', relPath);
  if (!fs.existsSync(diskPath)) {
    missingAssets++;
    missingList.push({ key, relPath, diskPath });
  }
}

console.log(`[2] Kiểm tra PreloadScene: ${totalAssets} assets được nạp. Thiếu trên đĩa: ${missingAssets}`);
if (missingAssets > 0) {
  console.error('Danh sách assets thiếu:');
  missingList.forEach(m => console.error(`  - Key: ${m.key} -> Path: ${m.relPath}`));
} else {
  console.log('  -> PASS: 100% assets trong PreloadScene tồn tại trên đĩa.');
}

// 3. Rà soát AudioManager manifest
const audioContent = fs.readFileSync('src/audio/AudioManager.ts', 'utf8');
const audioSampleRegex = /{\s*key:\s*['"]([^'"]+)['"]\s*,\s*path:\s*['"]([^'"]+)['"]/g;
let audioTotal = 0;
let audioMissing = 0;
const missingAudioList = [];

while ((match = audioSampleRegex.exec(audioContent)) !== null) {
  audioTotal++;
  const key = match[1];
  let relPath = match[2];
  const diskPath = path.join('public', relPath);
  if (!fs.existsSync(diskPath)) {
    audioMissing++;
    missingAudioList.push({ key, relPath, diskPath });
  }
}
console.log(`[3] Kiểm tra AudioManager manifest: ${audioTotal} audio samples. Thiếu: ${audioMissing}`);
if (audioMissing > 0) {
  missingAudioList.forEach(m => console.error(`  - Missing Audio: ${m.key} -> ${m.relPath}`));
} else {
  console.log('  -> PASS: 100% audio samples tồn tại trên đĩa.');
}

// 4. Rà soát từng khu vực bản đồ
console.log('\n[4] RÀ SOÁT TỪNG PHÂN KHU BẢN ĐỒ:');
for (const z of zones) {
  console.log(`\nPhân khu: [${z.id}] (${z.name})`);
  console.log(`  - Kích thước bounds: x=${z.bounds.x}, y=${z.bounds.y}, w=${z.bounds.width}, h=${z.bounds.height}`);
  console.log(`  - Điểm xuất phát (defaultSpawn): (${z.defaultSpawn.x}, ${z.defaultSpawn.y})`);
  console.log(`  - Số lượng transitions: ${z.transitions ? z.transitions.length : 0}`);
  if (z.transitions) {
    z.transitions.forEach(t => {
      console.log(`    * Cổng sang [${t.toZone}] tại (${t.x}, ${t.y}) kích thước ${t.width}x${t.height}`);
    });
  }
  console.log(`  - Colliders: ${z.colliders ? z.colliders.length : 0}`);
  console.log(`  - Props: ${z.props ? z.props.length : 0}`);
  console.log(`  - Spawns: npcs=${z.spawns?.npcs?.length || 0}, monsters=${z.spawns?.monsters?.length || 0}, items=${z.spawns?.items?.length || 0}`);
  console.log(`  - Atmosphere: tint=${z.atmosphere?.tint || 'none'}, darkness=${z.atmosphere?.darkness ?? 'none'}, fogDensity=${z.atmosphere?.fogDensity ?? 'none'}`);
}
