import fs from 'fs';
import path from 'path';

console.log('========================================================================');
console.log('🔍 HOLLOW WOODS V1.5 — KIỂM TRA TOÀN VẸN TÀI NGUYÊN (ZERO 404 ASSET AUDIT)');
console.log('========================================================================\n');

const rootDir = process.cwd();
const publicDir = path.join(rootDir, 'public');

const preloadFile = path.join(rootDir, 'src', 'scenes', 'PreloadScene.ts');
const audioFile = path.join(rootDir, 'src', 'audio', 'AudioManager.ts');

const preloadContent = fs.readFileSync(preloadFile, 'utf8');
const audioContent = fs.readFileSync(audioFile, 'utf8');

// Thu thập mọi đường dẫn tài nguyên assets/... được nạp
const assetPaths = new Set();

// Quét PreloadScene: load.image, load.spritesheet, load.audio, load.json, load.atlas, load.text
const lines = preloadContent.split('\n');
for (const line of lines) {
  const trimmed = line.trim();
  // Bỏ qua dòng chú thích
  if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue;
  const match = trimmed.match(/['"](assets\/[^'"]+)['"]/);
  if (match) {
    assetPaths.add(match[1]);
  }
}

// Quét AudioManager
const audioLines = audioContent.split('\n');
for (const line of audioLines) {
  const trimmed = line.trim();
  if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue;
  const match = trimmed.match(/['"](assets\/[^'"]+)['"]/);
  if (match) {
    assetPaths.add(match[1]);
  }
}

console.log(`Đã phát hiện tổng cộng ${assetPaths.size} đường dẫn tài nguyên trong PreloadScene và AudioManager.\n`);

let missingCount = 0;
let validCount = 0;

for (const relPath of Array.from(assetPaths).sort()) {
  const fullPath = path.join(publicDir, relPath);
  if (fs.existsSync(fullPath)) {
    validCount++;
  } else {
    console.error(`  ❌ [404 NOT FOUND] ${relPath}`);
    missingCount++;
  }
}

console.log('\n------------------------------------------------------------------------');
console.log(`KẾT QUẢ KIỂM TRA: ${validCount} HỢP LỆ, ${missingCount} THIẾU (404)`);
console.log('------------------------------------------------------------------------');

if (missingCount === 0) {
  console.log('🎉 100% TÀI NGUYÊN ĐỀU TỒN TẠI VẬT LÝ TRONG PUBLIC/ — ĐẠT CHUẨN ZERO 404!\n');
  process.exit(0);
} else {
  console.error(`⚠️ CÓ ${missingCount} ĐƯỜNG DẪN BỊ LỖI 404! HÃY SỬA LẠI!\n`);
  process.exit(1);
}
