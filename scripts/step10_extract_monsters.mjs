/**
 * HOLLOW WOODS V3.0 - PASS T10
 * Script trích xuất Sprite quái vật bóng đêm (The Listener & The Echo)
 * từ Pixel_Art/Undead executioner.zip
 */

import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const ROOT_DIR = process.cwd();
const TEMP_PNG_DIR = path.join(ROOT_DIR, 'Read', 'V3.0', 'Temp', 'executioner', 'Undead executioner puppet', 'png');
const MONSTERS_DIR = path.join(ROOT_DIR, 'public', 'assets', 'monsters');

if (!fs.existsSync(MONSTERS_DIR)) {
  fs.mkdirSync(MONSTERS_DIR, { recursive: true });
}

// -------------------------------------------------------------
// 1. Trích xuất THE LISTENER (64×64 px) từ idle.png frame 0
// -------------------------------------------------------------
console.log('--- Trích xuất The Listener (64×64 px)...');
const idlePath = path.join(TEMP_PNG_DIR, 'idle.png');
const idlePng = PNG.sync.read(fs.readFileSync(idlePath));

// Frame 0 bbox: x: 34..78 (w: 45), y: 21..82 (h: 62)
const srcX = 34;
const srcY = 21;
const cropW = 45;
const cropH = 62;

const listenerPng = new PNG({ width: 64, height: 64 });
// Căn giữa ngang: (64 - 45) / 2 = 9.5 -> 9
const destX = 9;
// Căn sát đáy: 64 - 62 = 2
const destY = 2;

// Sao chép pixel sang listenerPng
for (let y = 0; y < cropH; y++) {
  for (let x = 0; x < cropW; x++) {
    const sIdx = ((srcY + y) * idlePng.width + (srcX + x)) * 4;
    const dIdx = ((destY + y) * listenerPng.width + (destX + x)) * 4;

    listenerPng.data[dIdx] = idlePng.data[sIdx];
    listenerPng.data[dIdx + 1] = idlePng.data[sIdx + 1];
    listenerPng.data[dIdx + 2] = idlePng.data[sIdx + 2];
    listenerPng.data[dIdx + 3] = idlePng.data[sIdx + 3];
  }
}

const listenerOutPath = path.join(MONSTERS_DIR, 'the_listener.png');
fs.writeFileSync(listenerOutPath, PNG.sync.write(listenerPng));
console.log(`[OK] Đã lưu The Listener: ${listenerOutPath} (64×64 px, ${fs.statSync(listenerOutPath).size} bytes)`);

// -------------------------------------------------------------
// 2. Trích xuất THE ECHO (32×64 px) từ summonAppear.png frame 2
// -------------------------------------------------------------
console.log('--- Trích xuất The Echo (32×64 px)...');
const summonPath = path.join(TEMP_PNG_DIR, 'summonAppear.png');
const summonPng = PNG.sync.read(fs.readFileSync(summonPath));

// summonAppear frame 2 (x từ 100 đến 149):
// Bounding box: x trong frame: 19..28 (tức là 119..128), y: 30..87 (h = 58)
const echoCropX = 118;
const echoCropY = 30;
const echoCropW = 12;
const echoCropH = 58;

const echoPng = new PNG({ width: 32, height: 64 });
const echoDestX = Math.round((32 - echoCropW) / 2); // (32 - 12) / 2 = 10
const echoDestY = 64 - echoCropH - 2; // y = 4..61

for (let y = 0; y < echoCropH; y++) {
  for (let x = 0; x < echoCropW; x++) {
    const sIdx = ((echoCropY + y) * summonPng.width + (echoCropX + x)) * 4;
    const dIdx = ((echoDestY + y) * echoPng.width + (echoDestX + x)) * 4;

    // Giữ nguyên pixel, tạo ánh hào quang nhẹ cho bóng ma (nếu alpha > 0)
    const a = summonPng.data[sIdx + 3];
    if (a > 10) {
      echoPng.data[dIdx] = summonPng.data[sIdx];
      echoPng.data[dIdx + 1] = summonPng.data[sIdx + 1];
      echoPng.data[dIdx + 2] = summonPng.data[sIdx + 2];
      echoPng.data[dIdx + 3] = a;
    }
  }
}

const echoOutPath = path.join(MONSTERS_DIR, 'the_echo.png');
fs.writeFileSync(echoOutPath, PNG.sync.write(echoPng));
console.log(`[OK] Đã lưu The Echo: ${echoOutPath} (32×64 px, ${fs.statSync(echoOutPath).size} bytes)`);

console.log('✅ Hoàn tất trích xuất sprite quái vật bóng đêm!');

