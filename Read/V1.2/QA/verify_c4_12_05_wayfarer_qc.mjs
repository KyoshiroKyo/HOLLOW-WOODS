import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const ASSET_DIR = 'G:/HOLLOW WOODS/public/assets/characters/mossbound_wayfarer';
const FRAME_W = 64;
const FRAME_H = 64;
const EXPECTED_FOOT_ANCHOR_X = 32;
const EXPECTED_FOOT_ANCHOR_Y = 58;
const DIRECTIONS = ['DOWN', 'UP', 'LEFT', 'RIGHT'];

const SHEETS_SPEC = [
  {
    id: 'idle',
    file: 'wayfarer_idle.png',
    cols: 4,
    rows: 4,
    fps: 6,
    loop: true,
    repeat: -1,
    description: 'Tư thế đứng nghỉ thở nhẹ, áo choàng rêu và ánh đèn lồng nhịp nhàng'
  },
  {
    id: 'walk',
    file: 'wayfarer_walk.png',
    cols: 6,
    rows: 4,
    fps: 10,
    loop: true,
    repeat: -1,
    description: 'Chu kỳ đi bộ 6 nhịp mượt mà kèm nhịp chống gậy gỗ và bước chân xen kẽ'
  },
  {
    id: 'run',
    file: 'wayfarer_run.png',
    cols: 6,
    rows: 4,
    fps: 14,
    loop: true,
    repeat: -1,
    description: 'Chu kỳ chạy nhanh 6 nhịp, thân hơi đổ về trước, tà áo choàng rêu bay nhẹ'
  },
  {
    id: 'attack',
    file: 'wayfarer_attack.png',
    cols: 6,
    rows: 4,
    fps: 12,
    loop: false,
    repeat: 0,
    description: 'Đòn đánh 3 nhịp: lấy đà, vung cây gậy gỗ đang cầm theo vòng cung và thu gậy về'
  },
  {
    id: 'hurt',
    file: 'wayfarer_hurt.png',
    cols: 3,
    rows: 4,
    fps: 8,
    loop: false,
    repeat: 0,
    description: 'Phản ứng giật lùi ngắn 3 nhịp khi va chạm rồi chống gậy lấy lại thăng bằng'
  },
  {
    id: 'death',
    file: 'wayfarer_death.png',
    cols: 6,
    rows: 4,
    fps: 8,
    loop: false,
    repeat: 0,
    description: 'Chuyển động khuỵu gối hạ thấp người xuống đất có kiểm soát, kết thúc ở tư thế nằm nghỉ ổn định'
  },
  {
    id: 'interact',
    file: 'wayfarer_interact.png',
    cols: 4,
    rows: 4,
    fps: 8,
    loop: false,
    repeat: 0,
    description: 'Tư thế đưa tay tương tác tự nhiên khi trò chuyện với NPC, mở vật thể hoặc thao tác tại bàn chế tạo'
  },
  {
    id: 'gather',
    file: 'wayfarer_gather.png',
    cols: 4,
    rows: 4,
    fps: 8,
    loop: false,
    repeat: 0,
    description: 'Tư thế cúi người thu thập tài nguyên trên mặt đất / hái thảo mộc rồi đứng dậy mượt mà'
  },
  {
    id: 'use_item',
    file: 'wayfarer_use_item.png',
    cols: 4,
    rows: 4,
    fps: 8,
    loop: false,
    repeat: 0,
    description: 'Tư thế nâng vật phẩm lên sử dụng (thuốc đắp thảo dược hoặc bình dầu đèn)'
  }
];

function getPixel(png, x, y) {
  const idx = (png.width * y + x) << 2;
  return {
    r: png.data[idx],
    g: png.data[idx + 1],
    b: png.data[idx + 2],
    a: png.data[idx + 3]
  };
}

function setPixel(png, x, y, r, g, b, a = 255) {
  if (x < 0 || x >= png.width || y < 0 || y >= png.height) return;
  const idx = (png.width * y + x) << 2;
  png.data[idx] = r;
  png.data[idx + 1] = g;
  png.data[idx + 2] = b;
  png.data[idx + 3] = a;
}

function blendPixel(png, x, y, r, g, b, a) {
  if (x < 0 || x >= png.width || y < 0 || y >= png.height || a <= 0) return;
  const idx = (png.width * y + x) << 2;
  const dstR = png.data[idx];
  const dstG = png.data[idx + 1];
  const dstB = png.data[idx + 2];
  const dstA = png.data[idx + 3] / 255;
  const srcA = a / 255;
  const outA = srcA + dstA * (1 - srcA);
  if (outA <= 0) return;
  png.data[idx] = Math.round((r * srcA + dstR * dstA * (1 - srcA)) / outA);
  png.data[idx + 1] = Math.round((g * srcA + dstG * dstA * (1 - srcA)) / outA);
  png.data[idx + 2] = Math.round((b * srcA + dstB * dstA * (1 - srcA)) / outA);
  png.data[idx + 3] = Math.round(outA * 255);
}

console.log('=== C4-12-05 QUALITY CONTROL (PNGJS) ===');

const loadedSheets = new Map();
const qcSummary = [];
let totalFramesChecked = 0;
let totalErrors = 0;

for (const spec of SHEETS_SPEC) {
  const filePath = path.join(ASSET_DIR, spec.file);
  if (!fs.existsSync(filePath)) {
    console.error(`[FAIL] Missing file: ${filePath}`);
    totalErrors++;
    continue;
  }

  const buffer = fs.readFileSync(filePath);
  const png = PNG.sync.read(buffer);
  loadedSheets.set(spec.id, png);

  const expectedW = spec.cols * FRAME_W;
  const expectedH = spec.rows * FRAME_H;
  const dimOk = png.width === expectedW && png.height === expectedH;

  let emptyFrames = 0;
  let borderBleedPixels = 0;
  let footAnchorMismatches = 0;
  let nonTransparentCornerFrames = 0;
  let minOpaquePix = Infinity;
  let maxOpaquePix = 0;

  for (let r = 0; r < spec.rows; r++) {
    for (let c = 0; c < spec.cols; c++) {
      totalFramesChecked++;
      const ox = c * FRAME_W;
      const oy = r * FRAME_H;

      let opaqueCount = 0;
      let anyAlphaCount = 0;
      let maxOpaqueY = -1;
      let minOpaqueY = 64;
      let minOpaqueX = 64;
      let maxOpaqueX = -1;

      // Kiểm tra 4 góc của ô frame phải trong suốt (RGBA alpha == 0)
      const corners = [
        getPixel(png, ox, oy),
        getPixel(png, ox + 63, oy),
        getPixel(png, ox, oy + 63),
        getPixel(png, ox + 63, oy + 63)
      ];
      if (corners.some((p) => p.a !== 0)) {
        nonTransparentCornerFrames++;
      }

      for (let y = 0; y < FRAME_H; y++) {
        for (let x = 0; x < FRAME_W; x++) {
          const p = getPixel(png, ox + x, oy + y);
          if (p.a > 0) {
            anyAlphaCount++;
            // Kiểm tra không tràn/chạm viền 2px ngoài cùng của từng ô 64x64
            if (x <= 1 || x >= 62 || y <= 1 || y >= 62) {
              borderBleedPixels++;
            }
          }
          if (p.a === 255) {
            opaqueCount++;
            if (y > maxOpaqueY) maxOpaqueY = y;
            if (y < minOpaqueY) minOpaqueY = y;
            if (x < minOpaqueX) minOpaqueX = x;
            if (x > maxOpaqueX) maxOpaqueX = x;
          }
        }
      }

      if (anyAlphaCount === 0 || opaqueCount < 80) {
        emptyFrames++;
      }
      if (maxOpaqueY !== EXPECTED_FOOT_ANCHOR_Y) {
        footAnchorMismatches++;
      }
      if (opaqueCount < minOpaquePix) minOpaquePix = opaqueCount;
      if (opaqueCount > maxOpaquePix) maxOpaquePix = opaqueCount;
    }
  }

  const sheetPass =
    dimOk &&
    emptyFrames === 0 &&
    borderBleedPixels === 0 &&
    footAnchorMismatches === 0 &&
    nonTransparentCornerFrames === 0;

  if (!sheetPass) totalErrors++;

  const rowReport = {
    file: spec.file,
    dimensions: `${png.width}x${png.height}`,
    grid: `${spec.cols}x${spec.rows}`,
    frames: spec.cols * spec.rows,
    rgbaTransparent: nonTransparentCornerFrames === 0,
    emptyFrames,
    borderBleedPixels,
    footAnchorMismatches,
    opaquePixelsRange: `${minOpaquePix}..${maxOpaquePix}`,
    status: sheetPass ? 'PASS' : 'FAIL'
  };
  qcSummary.push(rowReport);

  console.log(
    `[${rowReport.status}] ${spec.file.padEnd(22)} | ${rowReport.dimensions} | Grid ${rowReport.grid} (${String(rowReport.frames).padStart(2)}f) | RGBA_BG: ${rowReport.rgbaTransparent} | Empty: ${emptyFrames} | Bleed: ${borderBleedPixels} | FootAnchor(y=58): ${footAnchorMismatches === 0 ? 'LOCKED' : 'MISMATCH'}`
  );
}

console.log(`Total Frames Audited: ${totalFramesChecked} | Total Errors: ${totalErrors}`);

// ============================================================================
// 2. TẠO FILE MANIFEST: wayfarer_animation_manifest.json
// ============================================================================
const manifest = {
  characterId: 'mossbound_wayfarer',
  characterName: 'The Mossbound Wayfarer',
  version: '1.2.0',
  commandRef: 'C4-12-05',
  visualDirection: 'Direction A — Dark Woodland Pixel Art',
  frameCell: {
    width: FRAME_W,
    height: FRAME_H,
    footAnchor: {
      x: EXPECTED_FOOT_ANCHOR_X,
      y: EXPECTED_FOOT_ANCHOR_Y,
      originX: 0.5,
      originY: 0.90625
    },
    standingBodyHeightPx: 30,
    scaleVsLegacySatyr: 1.58
  },
  directionOrder: DIRECTIONS,
  rowMapping: {
    DOWN: 0,
    UP: 1,
    LEFT: 2,
    RIGHT: 3
  },
  sheets: SHEETS_SPEC.map((spec) => {
    const directionalAnimations = {};
    DIRECTIONS.forEach((dir, rowIdx) => {
      const startFrame = rowIdx * spec.cols;
      const frames = Array.from({ length: spec.cols }, (_, i) => startFrame + i);
      directionalAnimations[dir] = {
        key: `wayfarer_${spec.id}_${dir.toLowerCase()}`,
        row: rowIdx,
        frameCount: spec.cols,
        frames,
        fps: spec.fps,
        loop: spec.loop,
        phaserRepeat: spec.repeat
      };
    });

    return {
      id: spec.id,
      file: spec.file,
      path: `assets/characters/mossbound_wayfarer/${spec.file}`,
      imageWidth: spec.cols * FRAME_W,
      imageHeight: spec.rows * FRAME_H,
      frameWidth: FRAME_W,
      frameHeight: FRAME_H,
      directions: DIRECTIONS,
      framesPerDirection: spec.cols,
      totalFrames: spec.cols * spec.rows,
      suggestedFps: spec.fps,
      loop: spec.loop,
      description: spec.description,
      animationsByDirection: directionalAnimations
    };
  })
};

const manifestPath = path.join(ASSET_DIR, 'wayfarer_animation_manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
console.log(`Generated Manifest: ${manifestPath}`);

// ============================================================================
// 3. TẠO BẢNG ẢNH PREVIEW TỔNG HỢP: wayfarer_sprite_preview.png
// Ghép toàn bộ 9 bộ hoạt ảnh (xếp lưới 3 cột x 3 hàng bảng = 9 bảng) và 4 hướng
// ============================================================================
const PANEL_W = 6 * FRAME_W + 16; // 400 px
const PANEL_H = 4 * FRAME_H + 20; // 276 px
const GRID_COLS = 3;
const GRID_ROWS = 3;
const PADDING = 12;

const PREVIEW_W = PADDING + GRID_COLS * (PANEL_W + PADDING);
const PREVIEW_H = PADDING + GRID_ROWS * (PANEL_H + PADDING);

const previewPng = new PNG({ width: PREVIEW_W, height: PREVIEW_H });

// Nền tối Dark Woodland Slate (#121816) để làm nổi bật viền và nhân vật
for (let y = 0; y < PREVIEW_H; y++) {
  for (let x = 0; x < PREVIEW_W; x++) {
    setPixel(previewPng, x, y, 18, 24, 22, 255);
  }
}

SHEETS_SPEC.forEach((spec, idx) => {
  const pCol = idx % GRID_COLS;
  const pRow = Math.floor(idx / GRID_COLS);
  const px0 = PADDING + pCol * (PANEL_W + PADDING);
  const py0 = PADDING + pRow * (PANEL_H + PADDING);

  // Vẽ khung nền từng bảng (#1b2420) và thanh tiêu đề (#254d3e)
  for (let y = py0; y < py0 + PANEL_H; y++) {
    for (let x = px0; x < px0 + PANEL_W; x++) {
      const isBorder = x === px0 || x === px0 + PANEL_W - 1 || y === py0 || y === py0 + PANEL_H - 1;
      const isHeader = y > py0 && y < py0 + 12;
      if (isBorder) {
        setPixel(previewPng, x, y, 110, 145, 115, 255);
      } else if (isHeader) {
        setPixel(previewPng, x, y, 37, 77, 62, 255);
      } else {
        setPixel(previewPng, x, y, 24, 32, 29, 255);
      }
    }
  }

  const sheetPng = loadedSheets.get(spec.id);
  const sheetOffsetX = px0 + Math.floor((PANEL_W - sheetPng.width) / 2);
  const sheetOffsetY = py0 + 16;

  // Vẽ lưới từng ô 64x64 và nền caro tinh tế + vạch chuẩn điểm neo bàn chân y=58
  for (let r = 0; r < spec.rows; r++) {
    for (let c = 0; c < spec.cols; c++) {
      const cellX = sheetOffsetX + c * FRAME_W;
      const cellY = sheetOffsetY + r * FRAME_H;

      for (let y = 0; y < FRAME_H; y++) {
        for (let x = 0; x < FRAME_W; x++) {
          const isCellEdge = x === 0 || y === 0 || x === FRAME_W - 1 || y === FRAME_H - 1;
          const isFootLine = y === EXPECTED_FOOT_ANCHOR_Y && x >= 16 && x <= 48;
          const checker = ((x >> 3) + (y >> 3)) % 2 === 0;
          if (isCellEdge) {
            setPixel(previewPng, cellX + x, cellY + y, 42, 58, 52, 255);
          } else if (isFootLine) {
            setPixel(previewPng, cellX + x, cellY + y, 52, 85, 68, 255);
          } else if (checker) {
            setPixel(previewPng, cellX + x, cellY + y, 28, 37, 34, 255);
          } else {
            setPixel(previewPng, cellX + x, cellY + y, 23, 31, 28, 255);
          }

          const sp = getPixel(sheetPng, c * FRAME_W + x, r * FRAME_H + y);
          if (sp.a > 0) {
            blendPixel(previewPng, cellX + x, cellY + y, sp.r, sp.g, sp.b, sp.a);
          }
        }
      }
    }
  }
});

const previewPath = path.join(ASSET_DIR, 'wayfarer_sprite_preview.png');
fs.writeFileSync(previewPath, PNG.sync.write(previewPng));
console.log(`Generated Preview Sheet: ${previewPath} (${PREVIEW_W}x${PREVIEW_H} px)`);

if (totalErrors > 0) {
  process.exit(1);
}
