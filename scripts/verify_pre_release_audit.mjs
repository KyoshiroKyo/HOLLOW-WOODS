/**
 * HOLLOW WOODS V1.4 - PRE-RELEASE INTEGRITY & PLATFORM AUDIT SCRIPT
 * Kiểm tra toàn diện mã nguồn, tài nguyên, SDK p2game và cấu hình trước khi phát hành
 */

import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const SRC_DIR = path.join(ROOT_DIR, 'src');

console.log('================================================================');
console.log('🔍 HOLLOW WOODS V1.4: KIỂM TRA TOÀN DIỆN MÃ NGUỒN TRƯỚC KHI PHÁT HÀNH');
console.log('================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  ❌ [FAIL] ${testName} - ${details}`);
  }
}

// -----------------------------------------------------------------
// 1. KIỂM TRA TÍCH HỢP P2GAME SDK
// -----------------------------------------------------------------
console.log('--- 1. KIỂM TRA TÍCH HỢP P2GAME SDK ---');

// 1.1 Kiểm tra index.html
const indexHtmlPath = path.join(ROOT_DIR, 'index.html');
assert(fs.existsSync(indexHtmlPath), 'File index.html tồn tại');
const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf-8');

const sdkScriptTag = '<script src="https://games.p2game.io/sdk/p2game-sdk.v1.js"></script>';
const hasSdkScript = indexHtmlContent.includes('games.p2game.io/sdk/p2game-sdk.v1.js');
assert(hasSdkScript, 'index.html đã nhúng script p2game-sdk.v1.js');

const sdkScriptPos = indexHtmlContent.indexOf('games.p2game.io/sdk/p2game-sdk.v1.js');
const mainScriptPos = indexHtmlContent.indexOf('/src/main.ts');
assert(sdkScriptPos < mainScriptPos, 'SDK p2game được nhúng TRƯỚC script chính của game');

// Kiểm tra quy tắc cấm trong index.html
assert(!indexHtmlContent.includes('window.top'), 'index.html không truy cập window.top');
assert(!indexHtmlContent.includes('serviceWorker'), 'index.html không đăng ký Service Worker');
assert(!indexHtmlContent.includes('<form'), 'index.html không tự dựng form đăng nhập');
assert(!indexHtmlContent.includes('type="password"'), 'index.html không chứa ô nhập password');

// 1.2 Kiểm tra src/main.ts
const mainTsPath = path.join(SRC_DIR, 'main.ts');
assert(fs.existsSync(mainTsPath), 'File src/main.ts tồn tại');
const mainTsContent = fs.readFileSync(mainTsPath, 'utf-8');

assert(mainTsContent.includes('window.p2.init'), 'src/main.ts gọi await window.p2.init() khi khởi động');
assert(mainTsContent.includes('window.p2.onPause'), 'src/main.ts gắn listener window.p2.onPause');
assert(mainTsContent.includes('window.p2.onResume'), 'src/main.ts gắn listener window.p2.onResume');

// 1.3 Kiểm tra BootScene.ts (p2.ready() ở khung hình đầu tiên)
const bootScenePath = path.join(SRC_DIR, 'scenes', 'BootScene.ts');
assert(fs.existsSync(bootScenePath), 'File src/scenes/BootScene.ts tồn tại');
const bootSceneContent = fs.readFileSync(bootScenePath, 'utf-8');

assert(bootSceneContent.includes('window.p2.ready()'), 'BootScene gọi window.p2.ready() ngay ở khung hình đầu tiên');
assert(bootSceneContent.includes('hasNotifiedReady'), 'BootScene đảm bảo p2.ready() chỉ được gọi duy nhất 1 lần');

// 1.4 Kiểm tra CloudSaveService.ts (p2.onBeforeUnload & auth.onChange)
const cloudSaveServicePath = path.join(SRC_DIR, 'services', 'CloudSaveService.ts');
assert(fs.existsSync(cloudSaveServicePath), 'File src/services/CloudSaveService.ts tồn tại');
const cloudSaveContent = fs.readFileSync(cloudSaveServicePath, 'utf-8');

assert(cloudSaveContent.includes('p2.onBeforeUnload'), 'CloudSaveService gắn p2.onBeforeUnload');
assert(cloudSaveContent.includes('p2.auth.onChange'), 'CloudSaveService gắn p2.auth.onChange');

// 1.5 Kiểm tra quy tắc cấm SDK trong mã nguồn src/
let windowTopViolations = [];
let serviceWorkerViolations = [];
function scanForbiddenInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const fullPath = path.join(dir, f);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanForbiddenInDir(fullPath);
    } else if (f.endsWith('.ts') || f.endsWith('.js')) {
      const code = fs.readFileSync(fullPath, 'utf-8');
      if (code.includes('window.top') || code.includes('top.location')) {
        windowTopViolations.push(path.relative(ROOT_DIR, fullPath));
      }
      if (code.includes('serviceWorker.register') || code.includes('navigator.serviceWorker')) {
        serviceWorkerViolations.push(path.relative(ROOT_DIR, fullPath));
      }
    }
  }
}
scanForbiddenInDir(SRC_DIR);
assert(windowTopViolations.length === 0, 'Mã nguồn src/ không vi phạm truy cập window.top/top.location', windowTopViolations.join(', '));
assert(serviceWorkerViolations.length === 0, 'Mã nguồn src/ không đăng ký Service Worker', serviceWorkerViolations.join(', '));

// -----------------------------------------------------------------
// 2. KIỂM TRA FILE P2GAME.JSON
// -----------------------------------------------------------------
console.log('\n--- 2. KIỂM TRA CẤU HÌNH P2GAME.JSON ---');

const rootP2JsonPath = path.join(ROOT_DIR, 'p2game.json');
const publicP2JsonPath = path.join(PUBLIC_DIR, 'p2game.json');
assert(fs.existsSync(rootP2JsonPath), 'p2game.json tồn tại ở thư mục gốc');
assert(fs.existsSync(publicP2JsonPath), 'p2game.json tồn tại trong public/ (được tự động copy vào dist/)');

const p2Json = JSON.parse(fs.readFileSync(rootP2JsonPath, 'utf-8'));
assert(p2Json.schemaVersion === 1, 'p2game.json có schemaVersion: 1');
assert(p2Json.id === 'hollow-woods', 'p2game.json có id: "hollow-woods"');
assert(p2Json.version === '1.4.0', 'p2game.json có version: "1.4.0"');

assert(p2Json.sdk && p2Json.sdk.version === '1.1', 'sdk.version là "1.1"');
assert(p2Json.sdk && p2Json.sdk.cloudSave === true, 'sdk.cloudSave là true');

assert(Array.isArray(p2Json.permissions) && p2Json.permissions.includes('persistent-storage'), 'permissions bao gồm "persistent-storage"');
assert(p2Json.permissions.includes('fullscreen'), 'permissions bao gồm "fullscreen"');
assert(p2Json.permissions.includes('audio'), 'permissions bao gồm "audio"');

const hasSurvivalLeaderboard = Array.isArray(p2Json.leaderboards) && p2Json.leaderboards.some(lb => lb.id === 'survival-score');
assert(hasSurvivalLeaderboard, 'leaderboards đã khai báo bảng xếp hạng "survival-score"');

// Kiểm tra các file store assets
const storeAssets = [
  p2Json.assets?.icon,
  p2Json.assets?.cover,
  ...(p2Json.assets?.screenshots || [])
];
for (const assetPath of storeAssets) {
  if (assetPath) {
    const fullAssetPath = path.join(PUBLIC_DIR, assetPath);
    assert(fs.existsSync(fullAssetPath), `Store asset tồn tại: ${assetPath}`);
  }
}

// -----------------------------------------------------------------
// 3. KIỂM TRA TÀI NGUYÊN (PRELOADSCENE, MAPS, ATLAS, SFX)
// -----------------------------------------------------------------
console.log('\n--- 3. KIỂM TRA TÀI NGUYÊN GAME (ASSET INTEGRITY) ---');

// 3.1 Quét tất cả file asset được load trong PreloadScene.ts
const preloadTsPath = path.join(SRC_DIR, 'scenes', 'PreloadScene.ts');
const preloadContent = fs.readFileSync(preloadTsPath, 'utf-8');

// Regex tìm tất cả các đường dẫn file trong các hàm load
const loadRegex = /this\.load\.(image|spritesheet|audio|tilemapTiledJSON|atlas)\s*\(\s*[^,]+,\s*['"]([^'"]+)['"]/g;
let match;
let missingAssets = [];
let checkedAssetsCount = 0;

while ((match = loadRegex.exec(preloadContent)) !== null) {
  const assetType = match[1];
  const relativeAssetPath = match[2];
  checkedAssetsCount++;
  
  const fullDiskPath = path.join(PUBLIC_DIR, relativeAssetPath);
  if (!fs.existsSync(fullDiskPath)) {
    missingAssets.push(`${assetType}: ${relativeAssetPath}`);
  }
}

assert(missingAssets.length === 0, `Toàn bộ ${checkedAssetsCount} tài nguyên trong PreloadScene tồn tại trên đĩa`, missingAssets.join('\n'));

// 3.2 Kiểm tra 17 file Tiled Map .json
const mapsDir = path.join(PUBLIC_DIR, 'assets', 'maps');
assert(fs.existsSync(mapsDir), 'Thư mục public/assets/maps/ tồn tại');
const mapFiles = fs.readdirSync(mapsDir).filter(f => f.endsWith('.json'));
assert(mapFiles.length === 17, `Đủ 17 file Tiled Map .json trong public/assets/maps/ (hiện có: ${mapFiles.length})`);

// Kiểm tra tính toàn vẹn của từng file JSON map
let invalidMaps = [];
for (const mapFile of mapFiles) {
  try {
    const mapData = JSON.parse(fs.readFileSync(path.join(mapsDir, mapFile), 'utf-8'));
    if (!mapData.width || !mapData.height || !Array.isArray(mapData.layers)) {
      invalidMaps.push(`${mapFile}: Thiếu trường width/height/layers chuẩn của Tiled`);
    }
  } catch (err) {
    invalidMaps.push(`${mapFile}: Lỗi JSON parse - ${err.message}`);
  }
}
assert(invalidMaps.length === 0, 'Toàn bộ 17 file Tiled Map .json có cú pháp hợp lệ', invalidMaps.join('\n'));

// 3.3 Kiểm tra Texture Atlas
const atlasJsonPath = path.join(PUBLIC_DIR, 'assets', 'atlases', 'hollow_props_atlas.json');
const atlasPngPath = path.join(PUBLIC_DIR, 'assets', 'atlases', 'hollow_props_atlas.png');
assert(fs.existsSync(atlasJsonPath), 'Texture Atlas JSON tồn tại: hollow_props_atlas.json');
assert(fs.existsSync(atlasPngPath), 'Texture Atlas PNG tồn tại: hollow_props_atlas.png');

if (fs.existsSync(atlasJsonPath)) {
  const atlasData = JSON.parse(fs.readFileSync(atlasJsonPath, 'utf-8'));
  const frameCount = Array.isArray(atlasData.frames) ? atlasData.frames.length : Object.keys(atlasData.frames || {}).length;
  assert(frameCount > 50, `Texture Atlas chứa ${frameCount} frames vật thể môi trường`);
}

// -----------------------------------------------------------------
// 4. KIỂM TRA CHẾ ĐỘ DEBUG MẶC ĐỊNH
// -----------------------------------------------------------------
console.log('\n--- 4. KIỂM TRA THIẾT LẬP DEBUG MẶC ĐỊNH ---');

// 4.1 HitboxDebugInspector (F9)
const hitboxInspectorPath = path.join(SRC_DIR, 'utils', 'HitboxDebugInspector.ts');
const hitboxContent = fs.readFileSync(hitboxInspectorPath, 'utf-8');
assert(hitboxContent.includes('private isEnabled: boolean = false'), 'HitboxDebugInspector (F9): isEnabled mặc định là false');

// 4.2 DebugOverlay (F4)
const debugOverlayPath = path.join(SRC_DIR, 'utils', 'DebugOverlay.ts');
const debugOverlayContent = fs.readFileSync(debugOverlayPath, 'utf-8');
assert(debugOverlayContent.includes('private isVisible: boolean = false'), 'DebugOverlay (F4): isVisible mặc định là false');

// 4.3 GameConfig (Arcade Physics debug)
const gameConfigPath = path.join(SRC_DIR, 'config', 'GameConfig.ts');
const gameConfigContent = fs.readFileSync(gameConfigPath, 'utf-8');
assert(gameConfigContent.includes('debug: false'), 'GameConfig.ts: physics.arcade.debug mặc định là false');

// 4.4 Tiled Pipeline debug logs
const tiledPipelineConfigPath = path.join(SRC_DIR, 'config', 'tiledPipelineConfig.ts');
const tiledConfigContent = fs.readFileSync(tiledPipelineConfigPath, 'utf-8');
assert(tiledConfigContent.includes('debugDrawModuleLogs: false'), 'tiledPipelineConfig.ts: debugDrawModuleLogs mặc định là false');

// -----------------------------------------------------------------
// TỔNG KẾT
// -----------------------------------------------------------------
console.log('\n================================================================');
console.log(`📊 TỔNG KẾT KIỂM THỬ: ${passedTests}/${totalTests} KIỂM THỬ ĐẠT (${Math.round((passedTests/totalTests)*100)}%)`);
if (failedTests === 0) {
  console.log('🎉 TẤT CẢ TIÊU CHUẨN CỦA NỀN TẢNG P2GAME.IO ĐÃ ĐƯỢC ĐÁP ỨNG 100%!');
} else {
  console.error(`⚠️ PHÁT HIỆN ${failedTests} LỖI CẦN KHẮC PHỤC TRƯỚC KHI BUILD!`);
}
console.log('================================================================');

process.exit(failedTests === 0 ? 0 : 1);
