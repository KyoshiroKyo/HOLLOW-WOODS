/**
 * HOLLOW WOODS V1.1 - GATE 2B
 * Script trích xuất Sprite & Spritesheet quái vật bóng đêm (The Listener & The Echo)
 * từ Pixel_Art/Undead executioner.zip
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { PNG } from 'pngjs';

const ROOT_DIR = process.cwd();
const TEMP_EXTRACT_DIR = path.join(os.tmpdir(), 'hollow_woods_executioner');
const TEMP_PNG_DIR = path.join(TEMP_EXTRACT_DIR, 'Undead executioner puppet', 'png');
const MONSTERS_DIR = path.join(ROOT_DIR, 'public', 'assets', 'monsters');
const ZIP_PATH = path.join(ROOT_DIR, 'Pixel_Art', 'Undead executioner.zip');

if (!fs.existsSync(MONSTERS_DIR)) {
  fs.mkdirSync(MONSTERS_DIR, { recursive: true });
}

// Tự động giải nén từ Pixel_Art nếu thư mục tạm chưa có
if (!fs.existsSync(TEMP_PNG_DIR)) {
  console.log('[GATE 2B] Đang giải nén tài nguyên gốc từ Undead executioner.zip vào os.tmpdir()...');
  if (!fs.existsSync(TEMP_EXTRACT_DIR)) {
    fs.mkdirSync(TEMP_EXTRACT_DIR, { recursive: true });
  }
  execSync(`powershell -Command "Expand-Archive -Path '${ZIP_PATH}' -DestinationPath '${TEMP_EXTRACT_DIR}' -Force"`);
}

// -------------------------------------------------------------
// 1. Trích xuất THE LISTENER: SPRITESHEET 4 FRAMES (256×64 px) từ idle.png
// -------------------------------------------------------------
console.log('--- Trích xuất The Listener Spritesheet (256×64 px, 4 frames)...');
const idlePath = path.join(TEMP_PNG_DIR, 'idle.png');
const idlePng = PNG.sync.read(fs.readFileSync(idlePath));

const numFrames = 4;
const frameW = 64;
const frameH = 64;
const listenerSheet = new PNG({ width: frameW * numFrames, height: frameH });
listenerSheet.data.fill(0);

const cropW = 45;
const cropH = 62;
const destOffsetX = 9;
const destOffsetY = 2;

for (let f = 0; f < numFrames; f++) {
  const srcStartX = f * 100 + 34;
  const srcStartY = 21;
  const dstStartX = f * frameW + destOffsetX;
  const dstStartY = destOffsetY;

  for (let y = 0; y < cropH; y++) {
    for (let x = 0; x < cropW; x++) {
      const sIdx = ((srcStartY + y) * idlePng.width + (srcStartX + x)) << 2;
      const dIdx = ((dstStartY + y) * listenerSheet.width + (dstStartX + x)) << 2;

      listenerSheet.data[dIdx] = idlePng.data[sIdx];
      listenerSheet.data[dIdx + 1] = idlePng.data[sIdx + 1];
      listenerSheet.data[dIdx + 2] = idlePng.data[sIdx + 2];
      listenerSheet.data[dIdx + 3] = idlePng.data[sIdx + 3];
    }
  }
}

const listenerOutPath = path.join(MONSTERS_DIR, 'the_listener.png');
fs.writeFileSync(listenerOutPath, PNG.sync.write(listenerSheet));
console.log(`[OK] Đã lưu The Listener: ${listenerOutPath} (256×64 px, ${fs.statSync(listenerOutPath).size} bytes)`);

// -------------------------------------------------------------
// 2. Trích xuất THE ECHO (32×64 px) từ summonAppear.png frame 2
// -------------------------------------------------------------
console.log('--- Trích xuất The Echo (32×64 px)...');
const summonPath = path.join(TEMP_PNG_DIR, 'summonAppear.png');
const summonPng = PNG.sync.read(fs.readFileSync(summonPath));

// summonAppear frame 2 (x từ 100 đến 149):
// Bounding box: x: 118..129 (w=12), y: 30..87 (h = 58)
const echoCropX = 118;
const echoCropY = 30;
const echoCropW = 12;
const echoCropH = 58;

const echoPng = new PNG({ width: 32, height: 64 });
echoPng.data.fill(0);
const echoDestX = Math.round((32 - echoCropW) / 2); // 10
const echoDestY = 64 - echoCropH - 2; // y = 4

for (let y = 0; y < echoCropH; y++) {
  for (let x = 0; x < echoCropW; x++) {
    const sIdx = ((echoCropY + y) * summonPng.width + (echoCropX + x)) << 2;
    const dIdx = ((echoDestY + y) * echoPng.width + (echoDestX + x)) << 2;

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

console.log('✅ [GATE 2B] Hoàn tất trích xuất sprite & spritesheet quái vật bóng đêm!');
