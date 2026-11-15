import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const W = 64;
const H = 64;
const png = new PNG({ width: W, height: H });

// Helper to set pixel
function setPixel(x, y, r, g, b, a = 255) {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const idx = (W * y + x) << 2;
  png.data[idx] = r;
  png.data[idx + 1] = g;
  png.data[idx + 2] = b;
  png.data[idx + 3] = a;
}

function hexToRgb(hex) {
  const num = parseInt(hex.replace('#', ''), 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function fillRect(x0, y0, w, h, hex, a = 255) {
  const [r, g, b] = hexToRgb(hex);
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      setPixel(x, y, r, g, b, a);
    }
  }
}

// 1. Nền u ám khu rừng sương mù (Dark woodland vignette background)
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const distCenter = Math.hypot(x - 32, y - 32);
    // Gradient từ xanh rêu tối (#1e2c24) sang đen rừng (#0d1410)
    const factor = Math.min(1, distCenter / 36);
    const r = Math.round(24 * (1 - factor * 0.6));
    const g = Math.round(38 * (1 - factor * 0.65));
    const b = Math.round(32 * (1 - factor * 0.6));
    setPixel(x, y, r, g, b, 255);
  }
}

// Thêm vài vệt sương mù xanh xám phía sau
fillRect(8, 20, 20, 16, '#263b30', 90);
fillRect(36, 16, 20, 18, '#263b30', 70);

// 2. Viền khung tranh cổ chuẩn Pixel Art (Antique Bronze Frame)
for (let i = 0; i < W; i++) {
  setPixel(i, 0, 30, 25, 18);
  setPixel(i, 1, 140, 105, 55);
  setPixel(i, 62, 140, 105, 55);
  setPixel(i, 63, 30, 25, 18);
  setPixel(0, i, 30, 25, 18);
  setPixel(1, i, 140, 105, 55);
  setPixel(62, i, 140, 105, 55);
  setPixel(63, i, 30, 25, 18);
}
// Góc khung mạ đồng nổi bật
setPixel(2, 2, 212, 175, 55);
setPixel(2, 3, 212, 175, 55);
setPixel(3, 2, 212, 175, 55);
setPixel(61, 2, 212, 175, 55);
setPixel(61, 3, 212, 175, 55);
setPixel(60, 2, 212, 175, 55);
setPixel(2, 61, 212, 175, 55);
setPixel(2, 60, 212, 175, 55);
setPixel(3, 61, 212, 175, 55);
setPixel(61, 61, 212, 175, 55);
setPixel(61, 60, 212, 175, 55);
setPixel(60, 61, 212, 175, 55);

// 3. Phần thân áo choàng rêu phong & Áo thun da (Mossbound Cloak & Woodland Tunic)
// Áo choàng vai trái và phải (Deep teal-green hooded cloak)
fillRect(10, 44, 44, 18, '#182b20');
fillRect(12, 46, 40, 16, '#243e30');
fillRect(14, 48, 36, 14, '#315440');
fillRect(18, 50, 28, 12, '#3f6850');

// Khối áo choàng phủ qua vai
fillRect(12, 42, 14, 16, '#20372a');
fillRect(38, 42, 14, 16, '#294333');
// Nếp viền rêu sáng
fillRect(13, 44, 2, 12, '#4d7c60');
fillRect(49, 44, 2, 12, '#5a8f6f');

// Cổ áo da & Dây nịt chéo ngực (Leather chest strap & tunic collar)
fillRect(24, 48, 16, 14, '#3a271a');
fillRect(26, 50, 12, 12, '#523824');
fillRect(28, 52, 8, 10, '#66472e');

// Dây đai da chéo qua ngực (Leather strap)
for (let d = 0; d < 14; d++) {
  fillRect(22 + d, 48 + d, 4, 3, '#26170d');
  fillRect(23 + d, 49 + d, 2, 2, '#472d1c');
}
// Khóa đồng cài dây đai (Brass buckle)
fillRect(30, 54, 5, 5, '#9c7a2b');
fillRect(31, 55, 3, 3, '#d4af37');
fillRect(32, 56, 1, 1, '#1b1208');

// 4. Cổ & Khuôn mặt nhân vật (Face & Neck)
// Cổ
fillRect(27, 38, 10, 11, '#946648');
fillRect(28, 39, 8, 9, '#b37d59');
fillRect(30, 41, 5, 7, '#c99169');

// Cằm & Quai hàm
fillRect(23, 26, 18, 13, '#b37d59');
fillRect(24, 27, 16, 12, '#c99169');
fillRect(25, 28, 14, 10, '#dfa880');
fillRect(26, 29, 12, 8, '#ebb68e');

// Má & Ánh sáng ấm từ ngọn đèn lồng (Amber lantern glow on right cheek)
fillRect(33, 29, 5, 6, '#f0c299');
fillRect(35, 30, 3, 4, '#f7d4b2');

// Mũi
fillRect(30, 27, 3, 6, '#b37d59');
fillRect(30, 31, 4, 2, '#9c6644');
fillRect(31, 29, 1, 3, '#f5ceab');

// Môi
fillRect(28, 35, 7, 2, '#8a4e3b');
fillRect(29, 35, 5, 1, '#b86e58');

// Mắt & Lông mày (Determined dark eyes)
// Lông mày
fillRect(24, 23, 6, 2, '#21140e');
fillRect(33, 23, 6, 2, '#21140e');
// Hốc mắt
fillRect(24, 25, 6, 3, '#946648');
fillRect(33, 25, 6, 3, '#946648');
// Tròng trắng
fillRect(25, 26, 5, 2, '#e6e4df');
fillRect(34, 26, 5, 2, '#e6e4df');
// Con ngươi nâu sẫm & đốm sáng
fillRect(27, 26, 2, 2, '#21140e');
fillRect(36, 26, 2, 2, '#21140e');
setPixel(27, 26, 255, 255, 255);
setPixel(36, 26, 255, 255, 255);

// Tai
fillRect(21, 28, 3, 6, '#b37d59');
fillRect(22, 29, 2, 4, '#dfa880');

// 5. Mái tóc nâu bồng bềnh phủ trán & vạt áo choàng phía sau (Tousled dark brown hair & hood rim)
// Khối tóc chính
fillRect(20, 11, 24, 13, '#21140e');
fillRect(22, 12, 20, 11, '#382217');
fillRect(24, 13, 16, 9, '#4d3020');
fillRect(26, 14, 12, 7, '#633e29');

// Lọn tóc lòa xòa trán (Bangs)
fillRect(22, 18, 4, 6, '#382217');
fillRect(25, 20, 4, 4, '#4d3020');
fillRect(28, 19, 5, 5, '#4d3020');
fillRect(32, 20, 4, 4, '#382217');
fillRect(35, 18, 5, 6, '#382217');
fillRect(39, 19, 3, 5, '#21140e');

// Điểm sáng trên lọn tóc (Hair highlights)
fillRect(27, 14, 5, 2, '#7a4e34');
fillRect(34, 15, 4, 2, '#7a4e34');

// Vành mũ trùm áo choàng rêu phong phía sau đầu (Hood rim draped behind hair)
fillRect(17, 14, 5, 22, '#182b20');
fillRect(18, 16, 4, 18, '#243e30');
fillRect(41, 14, 6, 22, '#182b20');
fillRect(42, 16, 4, 18, '#294333');

// 6. Ánh sáng vàng dịu từ ngọn đèn lồng (Lantern reflection highlight)
for (let y = 30; y < 58; y++) {
  for (let x = 44; x < 58; x++) {
    const idx = (W * y + x) << 2;
    png.data[idx] = Math.min(255, png.data[idx] + 25);     // Red boost
    png.data[idx + 1] = Math.min(255, png.data[idx + 1] + 16); // Green boost
  }
}

// Ghi file ra thư mục mossbound_wayfarer và satyr
const targetPath1 = path.resolve('public/assets/characters/mossbound_wayfarer/wayfarer_portrait.png');
const targetPath2 = path.resolve('public/assets/characters/satyr/satyr_portrait.png');
const targetPath3 = path.resolve('public/assets/characters/portrait_wayfarer.png');

const buffer = PNG.sync.write(png);
fs.writeFileSync(targetPath1, buffer);
fs.writeFileSync(targetPath2, buffer);
fs.writeFileSync(targetPath3, buffer);

console.log('✔ Đã tạo chân dung The Mossbound Wayfarer (64×64 px) thành công:');
console.log(' - ' + targetPath1);
console.log(' - ' + targetPath2);
console.log(' - ' + targetPath3);
