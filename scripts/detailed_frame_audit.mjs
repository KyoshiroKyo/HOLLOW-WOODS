import fs from 'fs';
import { PNG } from 'pngjs';

const buf = fs.readFileSync('public/assets/characters/satyr/satyr_sheet.png');
const png = PNG.sync.read(buf);

const COLS = 22;
const ROWS = 4;
const CELL_SIZE = 64;
const rowNames = ['DOWN', 'LEFT', 'RIGHT', 'UP'];

function getFramePixels(r, c) {
  const pixels = [];
  for (let y = 0; y < CELL_SIZE; y++) {
    for (let x = 0; x < CELL_SIZE; x++) {
      const px = c * CELL_SIZE + x;
      const py = r * CELL_SIZE + y;
      const idx = (py * png.width + px) * 4;
      pixels.push({
        x, y,
        r: png.data[idx],
        g: png.data[idx + 1],
        b: png.data[idx + 2],
        a: png.data[idx + 3]
      });
    }
  }
  return pixels;
}

function compareFrames(f1, f2) {
  let diff = 0;
  for (let i = 0; i < f1.length; i++) {
    const p1 = f1[i];
    const p2 = f2[i];
    if (p1.a > 30 || p2.a > 30) {
      diff += Math.abs(p1.r - p2.r) + Math.abs(p1.g - p2.g) + Math.abs(p1.b - p2.b) + Math.abs(p1.a - p2.a);
    }
  }
  return diff;
}

console.log('=== CHI TIẾT TỪNG CỘT & PHÂN TÍCH CHUYỂN ĐỘNG TRÊN CẢ 4 HÀNG ===\n');

for (let r = 0; r < ROWS; r++) {
  console.log(`\n--- HÀNG ${r} (${rowNames[r]}) ---`);
  const frames = [];
  for (let c = 0; c < COLS; c++) {
    frames.push(getFramePixels(r, c));
  }

  // Phân tích chuyển động giữa các frame liên tiếp
  console.log('Độ khác biệt (Motion delta) giữa Frame N và Frame N+1:');
  for (let c = 0; c < COLS - 1; c++) {
    const d = compareFrames(frames[c], frames[c + 1]);
    const fIdx = r * COLS + c;
    console.log(`  Col ${c.toString().padStart(2)} -> Col ${(c+1).toString().padStart(2)} (F${fIdx}->F${fIdx+1}): delta = ${d.toString().padStart(7)}`);
  }
  // So sánh vòng lặp cho các dải nghi vấn:
  // Idle cycle (0 -> 1 -> 2 -> 3 -> 0)
  const idleLoopDelta = compareFrames(frames[3], frames[0]);
  console.log(`  [Vòng lặp Idle] Col 3 -> Col 0: delta = ${idleLoopDelta}`);

  // Walk cycle (Col 4..9) loop: Col 9 -> Col 4
  const walkLoopDelta = compareFrames(frames[9], frames[4]);
  console.log(`  [Vòng lặp Walk 4..9] Col 9 -> Col 4: delta = ${walkLoopDelta}`);

  // Check if walk is 4 frames (Col 4..7)?
  const walk4LoopDelta = compareFrames(frames[7], frames[4]);
  console.log(`  [Nếu Walk là 4..7] Col 7 -> Col 4: delta = ${walk4LoopDelta}`);
}
