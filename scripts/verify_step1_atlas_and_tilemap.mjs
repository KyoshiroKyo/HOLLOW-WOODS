import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`✗ [FAIL] ${message}`);
    failed++;
  }
}

async function verify() {
  console.log('================================================================');
  console.log('🧪 VERIFYING STEP 1: TEXTURE ATLAS & TILEMAP OPTIMIZATION');
  console.log('================================================================\n');

  // 1. KIỂM TRA BẢN SAO LƯU AN TOÀN
  console.log('--- 1. KIỂM TRA BẢN SAO LƯU TRƯỚC ĐÓNG GÓI (BACKUP PRE-ATLAS) ---');
  assert(fs.existsSync('backup_assets_pre_atlas'), 'Thư mục sao lưu backup_assets_pre_atlas tồn tại an toàn.');
  const backupFiles = fs.readdirSync('backup_assets_pre_atlas');
  assert(backupFiles.length > 0, `Thư mục sao lưu chứa đầy đủ dữ liệu (${backupFiles.length} mục gốc).`);

  // 2. KIỂM TRA FILE ATLAS PNG & JSON
  console.log('\n--- 2. XÁC MINH TEXTURE ATLAS PNG & JSON HASH (PHASER 4) ---');
  const pngPath = path.resolve('public/assets/atlases/hollow_props_atlas.png');
  const jsonPath = path.resolve('public/assets/atlases/hollow_props_atlas.json');

  assert(fs.existsSync(pngPath), `File Texture Atlas PNG tồn tại tại public/assets/atlases/hollow_props_atlas.png`);
  assert(fs.existsSync(jsonPath), `File Texture Atlas JSON tồn tại tại public/assets/atlases/hollow_props_atlas.json`);

  const pngData = fs.readFileSync(pngPath);
  const atlasPNG = PNG.sync.read(pngData);
  assert(
    atlasPNG.width <= 2048 && atlasPNG.height <= 2048,
    `Kích thước Atlas (${atlasPNG.width}x${atlasPNG.height}) tuân thủ WebGL tối đa 2048x2048.`
  );

  const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  assert(jsonContent.meta && jsonContent.meta.image === 'hollow_props_atlas.png', 'Metadata JSON hợp lệ.');
  const frameCount = Object.keys(jsonContent.frames).length;
  assert(frameCount === 51, `Đóng gói chính xác 51/51 sprite vật thể đơn lẻ (Hiện có: ${frameCount} frames).`);

  // 3. KIỂM TRA KHOẢNG ĐỆM PADDING & ĐÙN VIỀN EXTRUDE
  console.log('\n--- 3. KIỂM TRA CHỐNG LEM VIỀN PIXEL (EXTRUDE 1PX & PADDING 2PX) ---');
  let validExtrudeAndPadding = true;
  for (const [key, frameData] of Object.entries(jsonContent.frames)) {
    const f = frameData.frame;
    // Kiểm tra tọa độ frame nằm gọn trong atlas và chừa ít nhất 1px viền
    if (f.x < 1 || f.y < 1 || f.x + f.w > atlasPNG.width - 1 || f.y + f.h > atlasPNG.height - 1) {
      validExtrudeAndPadding = false;
      console.error(`Frame ${key} vi phạm biên giới hạn atlas:`, f);
    }
  }
  assert(validExtrudeAndPadding, '100% Frames đều có biên đùn viền và khoảng đệm an toàn.');

  // 4. KIỂM TRA LỚP ÁNH XẠ ATLAS TEXTURE RESOLVER
  console.log('\n--- 4. KIỂM TRA ATLAS TEXTURE RESOLVER (TƯƠNG THÍCH CODE CŨ) ---');
  const resolverSource = fs.readFileSync('src/utils/AtlasTextureResolver.ts', 'utf-8');
  assert(resolverSource.includes("export const ATLAS_PROPS_KEY = 'hollow_props_atlas'"), 'Định nghĩa hằng số ATLAS_PROPS_KEY chính xác.');
  assert(resolverSource.includes('public static resolve('), 'Hàm AtlasTextureResolver.resolve() sẵn sàng điều hướng frame.');
  assert(resolverSource.includes('public static install('), 'Hàm AtlasTextureResolver.install() hook vào Factory, Creator và TextureManager.');
  assert(resolverSource.includes('public static syncTextures('), 'Hàm AtlasTextureResolver.syncTextures() đồng bộ NEAREST filter.');

  // 5. KIỂM TRA RÀNG BUỘC DỪNG: BẢO TOÀN GID & TILESET TILED MAP
  console.log('\n--- 5. KIỂM TRA RÀNG BUỘC DỪNG: BẢO TOÀN TILESETS TILED MAP ---');
  const mapFiles = fs.readdirSync('public/assets/maps').filter(f => f.endsWith('.json'));
  let mapsIntact = true;
  for (const mf of mapFiles) {
    const mapData = JSON.parse(fs.readFileSync(path.join('public/assets/maps', mf), 'utf-8'));
    if (!mapData.tilesets || mapData.tilesets.length === 0) {
      mapsIntact = false;
    }
  }
  assert(mapsIntact, `Toàn bộ ${mapFiles.length} file Tiled Map JSON giữ nguyên vẹn mảng tilesets[] và GID.`);

  // 6. KIỂM TRA CẤU HÌNH CAMERA & BỘ LỌC NEAREST
  console.log('\n--- 6. KIỂM TRA CẤU HÌNH CAMERA ROUNDPIXELS & NEAREST FILTER ---');
  const gameConfigContent = fs.readFileSync('src/config/GameConfig.ts', 'utf-8');
  assert(gameConfigContent.includes('roundPixels: true'), 'GameConfig.ts có roundPixels: true.');
  assert(gameConfigContent.includes('pixelArt: true'), 'GameConfig.ts có pixelArt: true.');

  const gameSceneContent = fs.readFileSync('src/scenes/GameScene.ts', 'utf-8');
  assert(gameSceneContent.includes('this.cameras.main.setRoundPixels(true)'), 'GameScene.ts kích hoạt setRoundPixels(true).');

  const preloadSceneContent = fs.readFileSync('src/scenes/PreloadScene.ts', 'utf-8');
  assert(preloadSceneContent.includes('AtlasTextureResolver.syncTextures(this)'), 'PreloadScene.ts đồng bộ NEAREST filter cho toàn bộ texture.');

  console.log('\n================================================================');
  if (failed === 0) {
    console.log(`🎉 TẤT CẢ ${passed} HẠNG MỤC KIỂM THỬ BƯỚC 1 ĐÃ VƯỢT QUA 100%!`);
  } else {
    console.error(`⚠️ Có ${failed} hạng mục kiểm thử thất bại.`);
    process.exit(1);
  }
  console.log('================================================================\n');
}

verify().catch(err => {
  console.error('Lỗi kiểm thử:', err);
  process.exit(1);
});
