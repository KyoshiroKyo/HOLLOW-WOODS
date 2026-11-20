import fs from 'fs';
import path from 'path';

console.log('========================================================================');
console.log('🧪 HOLLOW WOODS V152-09 — KIỂM TRA TỐI ƯU HÓA ASSET VÀ TÁCH CHUNK BUNDLE');
console.log('========================================================================\n');

let passCount = 0;
let totalCount = 0;

function assert(condition, message) {
  totalCount++;
  if (condition) {
    console.log(`✅ [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`❌ [FAIL] ${message}`);
  }
}

// 1. Kiểm tra vite.config.ts
const viteConfig = fs.readFileSync('vite.config.ts', 'utf8');
assert(viteConfig.includes('manualChunks'), 'vite.config.ts có cấu hình manualChunks');
assert(viteConfig.includes('vendor-phaser'), 'vite.config.ts tách chunk vendor-phaser');
assert(viteConfig.includes('game-data'), 'vite.config.ts tách chunk game-data');

// 2. Kiểm tra dist build chunks
const distAssets = fs.existsSync('dist/assets') ? fs.readdirSync('dist/assets') : [];
const hasVendorPhaser = distAssets.some(f => f.startsWith('vendor-phaser') && f.endsWith('.js'));
const hasGameData = distAssets.some(f => f.startsWith('game-data') && f.endsWith('.js'));
const hasIndex = distAssets.some(f => f.startsWith('index') && f.endsWith('.js'));
assert(hasVendorPhaser, 'dist/assets/ chứa chunk vendor-phaser');
assert(hasGameData, 'dist/assets/ chứa chunk game-data');
assert(hasIndex, 'dist/assets/ chứa chunk index (game logic)');

// 3. Kiểm tra dọn dẹp PNG trùng lặp
const spritesDir = path.join('public', 'assets', 'environment', 'sprites');
const remainingSprites = fs.existsSync(spritesDir) ? fs.readdirSync(spritesDir) : [];
assert(remainingSprites.length === 1 && remainingSprites[0] === 'fog_smooth.png', 'public/assets/environment/sprites chỉ còn lại fog_smooth.png');

const backupRedundantDir = path.join('Backups', 'steps', 'backup_v152_09', 'redundant_assets');
assert(fs.existsSync(backupRedundantDir), 'Thư mục Backups/steps/backup_v152_09/redundant_assets/ tồn tại an toàn');

// 4. Kiểm tra script nén audio ffmpeg
const compressScript = path.join('scripts', 'compress_audio_ffmpeg.ps1');
assert(fs.existsSync(compressScript), 'Script nén audio ffmpeg scripts/compress_audio_ffmpeg.ps1 tồn tại');
if (fs.existsSync(compressScript)) {
  const scriptContent = fs.readFileSync(compressScript, 'utf8');
  assert(scriptContent.includes('ffmpeg'), 'compress_audio_ffmpeg.ps1 chứa lệnh gọi ffmpeg');
  assert(scriptContent.includes('beyond_the_hills'), 'compress_audio_ffmpeg.ps1 bao gồm BGM beyond_the_hills');
  assert(scriptContent.includes('behemoth_thud'), 'compress_audio_ffmpeg.ps1 bao gồm SFX nặng behemoth_thud');
}

// 5. Kiểm tra ASSETS_MANIFEST.json
assert(fs.existsSync('ASSETS_MANIFEST.json'), 'ASSETS_MANIFEST.json tồn tại');
const manifest = JSON.parse(fs.readFileSync('ASSETS_MANIFEST.json', 'utf8'));
assert(manifest.totalFiles > 0, `ASSETS_MANIFEST.json có ${manifest.totalFiles} files`);
assert(manifest.totalBytes > 0, `ASSETS_MANIFEST.json tổng dung lượng: ${(manifest.totalBytes / (1024*1024)).toFixed(2)} MB`);

console.log('\n------------------------------------------------------------------------');
console.log(`KẾT QUẢ TEST V152-09: ${passCount}/${totalCount} TIÊU CHÍ ĐẠT`);
console.log('------------------------------------------------------------------------');

if (passCount === totalCount) {
  console.log('🎉 TOÀN BỘ CÁC TIÊU CHÍ V152-09 ĐÃ ĐẠT CHUẨN 100%!');
  process.exit(0);
} else {
  console.error('⚠️ MỘT SỐ TIÊU CHÍ CHƯA ĐẠT!');
  process.exit(1);
}
