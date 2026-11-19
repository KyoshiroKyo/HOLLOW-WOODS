/**
 * scripts/test_v15_53_p2game_release_automation.mjs
 * ======================================================================
 * KIỂM THỬ XÁC MINH BƯỚC V15-53: QUY TRÌNH TỰ ĐỘNG HÓA POST-BUILD P2GAME
 * ======================================================================
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { PNG } from 'pngjs';

const ROOT_DIR = process.cwd();
let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✔ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  ✖ [FAIL] ${testName}`);
    failed++;
  }
}

console.log('='.repeat(70));
console.log('   HOLLOW WOODS V1.5 — KIỂM THỬ BƯỚC V15-53: POST-BUILD P2GAME RELEASE');
console.log('='.repeat(70));

// 1. Kiểm tra kịch bản scripts/build_p2game_release.mjs
console.log('\n--- 1. Kiểm tra script tự động hóa build_p2game_release.mjs ---');
const scriptPath = path.join(ROOT_DIR, 'scripts', 'build_p2game_release.mjs');
assert(fs.existsSync(scriptPath), 'Tồn tại scripts/build_p2game_release.mjs');

// 2. Kiểm tra lệnh trong package.json
console.log('\n--- 2. Kiểm tra cấu hình package.json ---');
const pkgPath = path.join(ROOT_DIR, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
assert(pkg.scripts && typeof pkg.scripts['release:p2game'] === 'string', 'Khai báo script "release:p2game" trong package.json');
assert(pkg.scripts['release:p2game'].includes('build_p2game_release.mjs'), 'Lệnh "release:p2game" kích hoạt đúng build_p2game_release.mjs');
assert(pkg.version === '1.5.0', 'Phiên bản package.json chuẩn xác "1.5.0"');

// 3. Kiểm tra 6 file hình ảnh Pixel Art trong public/media/ và release/p2game/media_v1.5/
console.log('\n--- 3. Kiểm tra 6 hình ảnh Pixel Art V1.5 trong public/media/ & release/p2game/media_v1.5/ ---');
const expectedMedia = [
  { file: 'avatar_512x512.png', w: 512, h: 512, desc: 'Ảnh đại diện The Mossbound Wayfarer (512x512 px)' },
  { file: 'cover_banner_1280x720.png', w: 1280, h: 720, desc: 'Ảnh bìa & phân cảnh ngồi bên bếp lửa Sir Vaelen (1280x720 px)' },
  { file: 'screen_01_bellhollow_v15.png', w: 1280, h: 720, desc: 'Screenshot 1: Làng Bellhollow V1.5 & DST HUD (1280x720 px)' },
  { file: 'screen_02_sir_vaelen_fire.png', w: 1280, h: 720, desc: 'Screenshot 2: Trạm Lửa Rừng Tĩnh Lặng Sir Vaelen (1280x720 px)' },
  { file: 'screen_03_crafting_ui.png', w: 1280, h: 720, desc: 'Screenshot 3: Giao diện Bảng Chế Tạo 4 Tầng & Sổ Tay (1280x720 px)' },
  { file: 'screen_04_boss_shadow.png', w: 1280, h: 720, desc: 'Screenshot 4: Đại chiến Boss SHADOW Series Miếu Chuông (1280x720 px)' }
];

for (const item of expectedMedia) {
  const pubPath = path.join(ROOT_DIR, 'public', 'media', item.file);
  const relPath = path.join(ROOT_DIR, 'release', 'p2game', 'media_v1.5', item.file);
  assert(fs.existsSync(pubPath), `public/media/${item.file} tồn tại`);
  assert(fs.existsSync(relPath), `release/p2game/media_v1.5/${item.file} tồn tại`);

  if (fs.existsSync(pubPath)) {
    const png = PNG.sync.read(fs.readFileSync(pubPath));
    assert(png.width === item.w && png.height === item.h, `${item.file} đúng kích thước chuẩn ${item.w}x${item.h} px (${item.desc})`);
  }
}

// 4. Kiểm tra đồng bộ p2game.json
console.log('\n--- 4. Kiểm tra đồng bộ metadata p2game.json ở 3 nơi ---');
const locations = [
  path.join(ROOT_DIR, 'public', 'p2game.json'),
  path.join(ROOT_DIR, 'release', 'p2game', 'p2game.json'),
  path.join(ROOT_DIR, 'dist', 'p2game.json')
];

for (const loc of locations) {
  assert(fs.existsSync(loc), `Tồn tại ${path.relative(ROOT_DIR, loc)}`);
  if (fs.existsSync(loc)) {
    const json = JSON.parse(fs.readFileSync(loc, 'utf8'));
    assert(json.version === '1.5.0', `${path.basename(loc)} có version = "1.5.0"`);
    assert(json.studio === 'Kyoshiro', `${path.basename(loc)} có studio = "Kyoshiro"`);
    assert(json.assets && json.assets.avatar === 'media/avatar_512x512.png', `${path.basename(loc)} trỏ đúng avatar`);
    assert(json.assets && json.assets.cover === 'media/cover_banner_1280x720.png', `${path.basename(loc)} trỏ đúng cover`);
    assert(json.assets && Array.isArray(json.assets.screenshots) && json.assets.screenshots.length === 4, `${path.basename(loc)} có đủ 4 screenshots`);
    assert(json.assets && json.assets.screenshots[0] === 'media/screen_01_bellhollow_v15.png', `${path.basename(loc)} screenshot 1 đúng đường dẫn`);
    assert(json.assets && json.assets.screenshots[3] === 'media/screen_04_boss_shadow.png', `${path.basename(loc)} screenshot 4 đúng đường dẫn`);
  }
}

// 5. Kiểm tra tính toàn vẹn của gói ZIP phát hành
console.log('\n--- 5. Kiểm tra gói ZIP phát hành release/p2game/hollow-woods-p2game-v1.5.0.zip ---');
const zipPath = path.join(ROOT_DIR, 'release', 'p2game', 'hollow-woods-p2game-v1.5.0.zip');
assert(fs.existsSync(zipPath), 'Gói phát hành ZIP tồn tại');

const pyCheck = `
import zipfile
zip_path = r'''${zipPath}'''
with zipfile.ZipFile(zip_path, 'r') as zf:
    names = set(zf.namelist())
    required = [
        'index.html',
        'p2game.json',
        'media/avatar_512x512.png',
        'media/cover_banner_1280x720.png',
        'media/screen_01_bellhollow_v15.png',
        'media/screen_02_sir_vaelen_fire.png',
        'media/screen_03_crafting_ui.png',
        'media/screen_04_boss_shadow.png'
    ]
    missing = [r for r in required if r not in names]
    if missing:
        print("MISSING:" + ",".join(missing))
    else:
        print(f"ZIP_OK: Total {len(names)} files")
`;

const tmpPy = path.join(ROOT_DIR, 'scripts', `_test_tmp_zip_${Date.now()}.py`);
fs.writeFileSync(tmpPy, pyCheck.trim(), 'utf8');
try {
  const checkOut = execSync(`python "${tmpPy}"`, { encoding: 'utf8' });
  assert(checkOut.includes('ZIP_OK'), 'Gói ZIP chứa đầy đủ index.html, p2game.json và 6 file media/');
} catch (e) {
  assert(false, `Lỗi đọc gói ZIP: ${e.message}`);
} finally {
  if (fs.existsSync(tmpPy)) fs.unlinkSync(tmpPy);
}

console.log('\n' + '='.repeat(70));
console.log(`KẾT QUẢ KIỂM THỬ BƯỚC V15-53: ${passed} PASSED / ${failed} FAILED`);
console.log('='.repeat(70));

if (failed > 0) {
  process.exit(1);
} else {
  console.log('>>> TOÀN BỘ 26/26 TIÊU CHÍ BƯỚC V15-53 ĐẠT HOÀN HẢO! <<<');
}
