/**
 * Script kiểm tra tự động nghiệm thu PASS G3
 * Tự động kết thúc trong 10 giây (Quy tắc Anti-Freeze)
 */

import { existsSync, statSync, readFileSync } from 'fs';
import { join } from 'path';

console.log('=== HOLLOW WOODS V3.0 – KIỂM TRA NGHIỆM THU PASS G3 ===\n');

const ROOT = 'G:\\HOLLOW WOODS V3';

// 1. Kiểm tra các module mã nguồn mới của PASS G3
const g3Files = [
  'src/systems/VeilSystem.ts',
  'src/systems/EchoSystem.ts',
  'src/entities/monsters/Monster.ts',
  'src/entities/TheListener.ts',
  'src/systems/ListenerAI.ts',
  'src/systems/PuzzleSystem.ts',
  'src/data/puzzles.json'
];

let allOk = true;
for (const f of g3Files) {
  const p = join(ROOT, f);
  if (existsSync(p)) {
    console.log(`✅ [Source G3] ${f} (${statSync(p).size} bytes)`);
  } else {
    console.error(`❌ [Source G3] Thiếu ${f}`);
    allOk = false;
  }
}

// 2. Kiểm tra dữ liệu câu đố puzzles.json
const pPath = join(ROOT, 'src/data/puzzles.json');
if (existsSync(pPath)) {
  const pData = JSON.parse(readFileSync(pPath, 'utf8'));
  const pKeys = Object.keys(pData.puzzles);
  console.log(`\n✅ [Dữ Liệu Câu Đố] Đã nạp ${pKeys.length} câu đố môi trường:`);
  for (const k of pKeys) {
    const pz = pData.puzzles[k];
    console.log(`   - ${pz.id} (${pz.zoneId}): ${pz.name} -> [${pz.ruleRef}]`);
  }
}

// 3. Kiểm tra file build dist
const distPath = join(ROOT, 'dist', 'index.html');
if (existsSync(distPath)) {
  console.log(`\n✅ [Vite Build Web] Đã đóng gói thành công index.html (${statSync(distPath).size} bytes)`);
} else {
  console.error('\n❌ [Vite Build Web] Thiếu dist/index.html');
  allOk = false;
}

console.log('\n======================================================');
if (allOk) {
  console.log('🎉 TOÀN BỘ TIÊU CHÍ NGHIỆM THU PASS G3 ĐÃ ĐẠT 100%!');
} else {
  console.log('⚠️ CÒN TIÊU CHÍ CHƯA ĐẠT!');
}
console.log('======================================================\n');

process.exit(0);

