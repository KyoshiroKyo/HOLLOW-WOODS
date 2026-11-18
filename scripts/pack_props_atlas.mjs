import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const PADDING = 2; // Khoảng đệm giữa các sprite
const EXTRUDE = 1; // Số pixel đùn viền chống lem pixel (edge bleeding)
const MAX_ATLAS_SIZE = 2048;

const PROP_DIRS = [
  'public/assets/environment/sprites',
  'public/assets/environment/v14/buildings',
  'public/assets/environment/v14/foliage',
  'public/assets/environment/v14/props',
  'public/assets/environment/v14/trees',
  'public/assets/environment/v14/village',
];

const OUTPUT_DIR = 'public/assets/atlases';
const OUTPUT_PNG = path.join(OUTPUT_DIR, 'hollow_props_atlas.png');
const OUTPUT_JSON = path.join(OUTPUT_DIR, 'hollow_props_atlas.json');

// Thuật toán đóng gói Shelf / Guillotine 2D Bin Packing
function packSprites(sprites, maxWidth, maxHeight) {
  // Sắp xếp giảm dần theo chiều cao để xếp hàng (shelf) tối ưu nhất
  const sorted = [...sprites].sort((a, b) => {
    const hDiff = (b.height + (EXTRUDE * 2) + PADDING) - (a.height + (EXTRUDE * 2) + PADDING);
    if (hDiff !== 0) return hDiff;
    return (b.width + (EXTRUDE * 2) + PADDING) - (a.width + (EXTRUDE * 2) + PADDING);
  });

  let currentX = PADDING;
  let currentY = PADDING;
  let shelfHeight = 0;
  let maxUsedWidth = 0;
  let maxUsedHeight = 0;

  const placements = [];

  for (const sprite of sorted) {
    const totalW = sprite.width + (EXTRUDE * 2) + PADDING;
    const totalH = sprite.height + (EXTRUDE * 2) + PADDING;

    if (currentX + totalW > maxWidth) {
      // Sang hàng tiếp theo
      currentY += shelfHeight + PADDING;
      currentX = PADDING;
      shelfHeight = 0;
    }

    if (currentY + totalH > maxHeight) {
      throw new Error(`Atlas size exceeded ${maxWidth}x${maxHeight}! Cannot fit sprite ${sprite.name}`);
    }

    // Tọa độ vùng đùn viền (Extruded area)
    const extrudeX = currentX;
    const extrudeY = currentY;

    // Tọa độ sprite thực tế (Phaser frame)
    const spriteX = extrudeX + EXTRUDE;
    const spriteY = extrudeY + EXTRUDE;

    placements.push({
      sprite,
      extrudeX,
      extrudeY,
      spriteX,
      spriteY,
      width: sprite.width,
      height: sprite.height,
    });

    currentX += totalW;
    shelfHeight = Math.max(shelfHeight, sprite.height + (EXTRUDE * 2));
    maxUsedWidth = Math.max(maxUsedWidth, currentX);
    maxUsedHeight = Math.max(maxUsedHeight, currentY + shelfHeight);
  }

  return { placements, maxUsedWidth, maxUsedHeight };
}

// Hàm tính kích thước Power of Two (POT) nhỏ nhất đủ chứa
function nextPowerOfTwo(n) {
  let p = 2;
  while (p < n) p *= 2;
  return p;
}

async function run() {
  console.log('=== BẮT ĐẦU ĐÓNG GÓI TEXTURE ATLAS CHO PROPS ===');
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const sprites = [];

  for (const dir of PROP_DIRS) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file.endsWith('.png')) {
        const filePath = path.join(dir, file);
        const name = path.basename(file, '.png');
        const data = fs.readFileSync(filePath);
        const png = PNG.sync.read(data);
        sprites.push({
          name,
          filePath,
          width: png.width,
          height: png.height,
          png,
        });
      }
    }
  }

  console.log(`Đã đọc ${sprites.length} sprite vật thể đơn lẻ.`);

  // Thử đóng gói với 1024 hoặc 2048
  let targetWidth = 1024;
  let targetHeight = 1024;
  let packedResult;

  try {
    packedResult = packSprites(sprites, targetWidth, targetHeight);
    console.log(`Đóng gói thành công trong không gian ${targetWidth}x${targetHeight}.`);
  } catch (err) {
    console.log('Không gian 1024x1024 chưa đủ, nâng lên 2048x2048...');
    targetWidth = MAX_ATLAS_SIZE;
    targetHeight = MAX_ATLAS_SIZE;
    packedResult = packSprites(sprites, targetWidth, targetHeight);
    console.log(`Đóng gói thành công trong không gian ${targetWidth}x${targetHeight}.`);
  }

  const atlasW = Math.min(MAX_ATLAS_SIZE, Math.max(512, nextPowerOfTwo(packedResult.maxUsedWidth + PADDING)));
  const atlasH = Math.min(MAX_ATLAS_SIZE, Math.max(512, nextPowerOfTwo(packedResult.maxUsedHeight + PADDING)));

  console.log(`Kích thước Atlas tối ưu (Power-of-Two): ${atlasW}x${atlasH} px (Giới hạn tối đa: ${MAX_ATLAS_SIZE}x${MAX_ATLAS_SIZE})`);

  // Tạo ảnh Atlas rỗng
  const atlasPNG = new PNG({ width: atlasW, height: atlasH, fill: 0 });

  // Vẽ từng sprite và thực hiện đùn viền (Extrude 1px)
  const jsonFrames = {};

  for (const item of packedResult.placements) {
    const { sprite, spriteX, spriteY, width, height } = item;
    const src = sprite.png;

    // 1. Sao chép nội dung sprite gốc
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcIdx = (width * y + x) << 2;
        const dstIdx = (atlasW * (spriteY + y) + (spriteX + x)) << 2;
        atlasPNG.data[dstIdx] = src.data[srcIdx];
        atlasPNG.data[dstIdx + 1] = src.data[srcIdx + 1];
        atlasPNG.data[dstIdx + 2] = src.data[srcIdx + 2];
        atlasPNG.data[dstIdx + 3] = src.data[srcIdx + 3];
      }
    }

    // 2. Extrude 1px: Đùn cạnh trên (Top edge) lên y - 1
    for (let x = 0; x < width; x++) {
      const srcIdx = x << 2;
      const dstIdx = (atlasW * (spriteY - 1) + (spriteX + x)) << 2;
      atlasPNG.data[dstIdx] = src.data[srcIdx];
      atlasPNG.data[dstIdx + 1] = src.data[srcIdx + 1];
      atlasPNG.data[dstIdx + 2] = src.data[srcIdx + 2];
      atlasPNG.data[dstIdx + 3] = src.data[srcIdx + 3];
    }

    // 3. Extrude 1px: Đùn cạnh dưới (Bottom edge) xuống y + height
    for (let x = 0; x < width; x++) {
      const srcIdx = (width * (height - 1) + x) << 2;
      const dstIdx = (atlasW * (spriteY + height) + (spriteX + x)) << 2;
      atlasPNG.data[dstIdx] = src.data[srcIdx];
      atlasPNG.data[dstIdx + 1] = src.data[srcIdx + 1];
      atlasPNG.data[dstIdx + 2] = src.data[srcIdx + 2];
      atlasPNG.data[dstIdx + 3] = src.data[srcIdx + 3];
    }

    // 4. Extrude 1px: Đùn cạnh trái (Left edge) sang x - 1
    for (let y = 0; y < height; y++) {
      const srcIdx = (width * y) << 2;
      const dstIdx = (atlasW * (spriteY + y) + (spriteX - 1)) << 2;
      atlasPNG.data[dstIdx] = src.data[srcIdx];
      atlasPNG.data[dstIdx + 1] = src.data[srcIdx + 1];
      atlasPNG.data[dstIdx + 2] = src.data[srcIdx + 2];
      atlasPNG.data[dstIdx + 3] = src.data[srcIdx + 3];
    }

    // 5. Extrude 1px: Đùn cạnh phải (Right edge) sang x + width
    for (let y = 0; y < height; y++) {
      const srcIdx = (width * y + (width - 1)) << 2;
      const dstIdx = (atlasW * (spriteY + y) + (spriteX + width)) << 2;
      atlasPNG.data[dstIdx] = src.data[srcIdx];
      atlasPNG.data[dstIdx + 1] = src.data[srcIdx + 1];
      atlasPNG.data[dstIdx + 2] = src.data[srcIdx + 2];
      atlasPNG.data[dstIdx + 3] = src.data[srcIdx + 3];
    }

    // 6. Extrude 1px: 4 Góc chéo (Corners)
    const copyCorner = (sx, sy, dx, dy) => {
      const srcIdx = (width * sy + sx) << 2;
      const dstIdx = (atlasW * dy + dx) << 2;
      atlasPNG.data[dstIdx] = src.data[srcIdx];
      atlasPNG.data[dstIdx + 1] = src.data[srcIdx + 1];
      atlasPNG.data[dstIdx + 2] = src.data[srcIdx + 2];
      atlasPNG.data[dstIdx + 3] = src.data[srcIdx + 3];
    };
    copyCorner(0, 0, spriteX - 1, spriteY - 1); // Top-left
    copyCorner(width - 1, 0, spriteX + width, spriteY - 1); // Top-right
    copyCorner(0, height - 1, spriteX - 1, spriteY + height); // Bottom-left
    copyCorner(width - 1, height - 1, spriteX + width, spriteY + height); // Bottom-right

    // Ghi nhận Frame cho Phaser JSON Hash
    jsonFrames[sprite.name] = {
      frame: { x: spriteX, y: spriteY, w: width, h: height },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: width, h: height },
      sourceSize: { w: width, h: height },
      pivot: { x: 0.5, y: 0.5 }
    };
  }

  // Ghi file PNG
  const pngBuffer = PNG.sync.write(atlasPNG);
  fs.writeFileSync(OUTPUT_PNG, pngBuffer);
  console.log(`Đã xuất PNG Atlas: ${OUTPUT_PNG} (${(pngBuffer.length / 1024).toFixed(1)} KB)`);

  // Ghi file JSON Hash theo chuẩn Phaser
  const atlasJSON = {
    frames: jsonFrames,
    meta: {
      app: 'HollowWoodsAtlasPacker',
      version: '1.0',
      image: 'hollow_props_atlas.png',
      format: 'RGBA8888',
      size: { w: atlasW, h: atlasH },
      scale: '1'
    }
  };

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(atlasJSON, null, 2), 'utf-8');
  console.log(`Đã xuất JSON Atlas: ${OUTPUT_JSON} (${Object.keys(jsonFrames).length} frames)`);

  console.log('=== HOÀN TẤT ĐÓNG GÓI ATLAS CHO HOLLOW WOODS ===');
}

run().catch((err) => {
  console.error('Lỗi đóng gói atlas:', err);
  process.exit(1);
});
