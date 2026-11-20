import fs from 'fs';
import path from 'path';

console.log('========================================================================');
console.log('🧪 HOLLOW WOODS V1.5.2 — KIỂM THỬ BƯỚC V152-02 (AUDIO & SANCTUARY)');
console.log('========================================================================\n');

let pass = 0;
let fail = 0;

function assert(cond, msg) {
  if (cond) {
    console.log(`  ✅ [PASS] ${msg}`);
    pass++;
  } else {
    console.error(`  ❌ [FAIL] ${msg}`);
    fail++;
  }
}

const rootDir = process.cwd();

// 1. Kiểm tra dọn file .bak ở thư mục gốc
console.log('--- 1. Kiểm tra dọn dẹp file .bak ở thư mục gốc ---');
const rootFiles = fs.readdirSync(rootDir);
const bakInRoot = rootFiles.filter(f => f.endsWith('.bak'));
assert(bakInRoot.length === 0, `Không còn file .bak nào ở thư mục gốc (còn: ${bakInRoot.join(', ') || '0'})`);

const backupRootBakDir = path.join(rootDir, 'Backups', 'steps', 'backup_v152_02', 'root_bak');
assert(fs.existsSync(backupRootBakDir), 'Thư mục Backups/steps/backup_v152_02/root_bak/ tồn tại');
assert(fs.existsSync(path.join(backupRootBakDir, 'index.html.v15_48.bak')), 'Backup index.html.v15_48.bak tồn tại');
assert(fs.existsSync(path.join(backupRootBakDir, 'package.json.v15_53.bak')), 'Backup package.json.v15_53.bak tồn tại');
assert(fs.existsSync(path.join(backupRootBakDir, 'README.md.v15_54.bak')), 'Backup README.md.v15_54.bak tồn tại');

// 2. Kiểm tra AudioManager.ts
console.log('\n--- 2. Kiểm tra manifest và các khóa SFX mới trong AudioManager.ts ---');
const audioCode = fs.readFileSync(path.join(rootDir, 'src', 'audio', 'AudioManager.ts'), 'utf-8');

assert(audioCode.includes("herb_gather: 'assets/audio/sfx/herb_gather.wav'"), 'CORE_SFX_MANIFEST chứa herb_gather');
assert(audioCode.includes("monster_step: 'assets/audio/sfx/monster_step.mp3'"), 'CORE_SFX_MANIFEST chứa monster_step');
assert(audioCode.includes("ambience_mire: 'assets/audio/ambience/ambience_mire.mp3'"), 'CORE_SFX_MANIFEST chứa ambience_mire');
assert(audioCode.includes("ambience_crossing: 'assets/audio/ambience/ambience_crossing.mp3'"), 'CORE_SFX_MANIFEST chứa ambience_crossing');

assert(audioCode.includes("runestone: 'assets/audio/sfx/rune_resonance.mp3'"), 'LAZY_SFX_MANIFEST chứa runestone');
assert(audioCode.includes("runestone_err: 'assets/audio/sfx/rune_error.mp3'"), 'LAZY_SFX_MANIFEST chứa runestone_err');

assert(audioCode.includes('silent_mire:') && audioCode.includes("'runestone'") && audioCode.includes("'runestone_err'"), 'ZONE_SFX_MAP silent_mire chứa runestone');
assert(audioCode.includes('ancient_rune_puzzle:') && audioCode.includes("'runestone'"), 'ZONE_SFX_MAP ancient_rune_puzzle tồn tại và chứa runestone');
assert(audioCode.includes('broken_bell_shrine:') && audioCode.includes("'runestone'"), 'ZONE_SFX_MAP broken_bell_shrine chứa runestone');

console.log('\n--- 3. Kiểm tra activeBGMRampInterval & dọn dẹp chống rò rỉ âm thanh ---');
assert(audioCode.includes('private activeBGMRampInterval: number | null = null;'), 'Khai báo activeBGMRampInterval');
assert(audioCode.includes('setSanctuaryMusicOnly('), 'Hàm setSanctuaryMusicOnly tồn tại trong AudioManager');
assert(audioCode.includes('isSanctuaryActive('), 'Hàm isSanctuaryActive tồn tại trong AudioManager');

// Kiểm tra stopAmbience(false) ngắt rainSource
const hasRainCleanupNonImmediate = /stopAmbience[\s\S]*?else[\s\S]*?oldRainSource\.stop\(\)/.test(audioCode);
assert(hasRainCleanupNonImmediate, 'stopAmbience(false) hạ âm và stop/disconnect rainSource sau fade-out');

// 4. Kiểm tra CampSanctuarySystem.ts & GameScene.ts
console.log('\n--- 4. Kiểm tra tích hợp Trạm Lửa Sir Vaelen (#10) ---');
const campCode = fs.readFileSync(path.join(rootDir, 'src', 'systems', 'CampSanctuarySystem.ts'), 'utf-8');
assert(campCode.includes('isSanctuaryMusicOnly('), 'CampSanctuarySystem có isSanctuaryMusicOnly()');
assert(campCode.includes('updateSanctuaryAudio('), 'CampSanctuarySystem có updateSanctuaryAudio()');

const gameCode = fs.readFileSync(path.join(rootDir, 'src', 'scenes', 'GameScene.ts'), 'utf-8');
assert(gameCode.includes('setSanctuaryMusicOnly(true'), 'GameScene gọi setSanctuaryMusicOnly(true) tại Trạm Lửa');
assert(gameCode.includes('setSanctuaryMusicOnly(false'), 'GameScene gọi setSanctuaryMusicOnly(false) khi rời Trạm Lửa');

console.log('\n========================================================================');
console.log(`📊 KẾT QUẢ KIỂM THỬ V152-02: ${pass} PASSED, ${fail} FAILED`);
console.log('========================================================================\n');

if (fail > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
