import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

// Đảm bảo thư mục tồn tại
const DIRS = [
  'public/assets/environment/pickups',
  'public/assets/environment/props',
  'public/assets/environment/sprites'
];
for (const d of DIRS) {
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true });
  }
}

class PixelCanvas {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.png = new PNG({ width, height });
    // Khởi tạo nền trong suốt hoàn toàn
    for (let i = 0; i < this.png.data.length; i += 4) {
      this.png.data[i] = 0;
      this.png.data[i + 1] = 0;
      this.png.data[i + 2] = 0;
      this.png.data[i + 3] = 0;
    }
  }

  parseHex(hex) {
    if (typeof hex === 'number') {
      const r = (hex >> 16) & 0xff;
      const g = (hex >> 8) & 0xff;
      const b = hex & 0xff;
      return [r, g, b];
    }
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    const num = parseInt(hex, 16);
    return [(num >> 16) & 0xff, (num >> 8) & 0xff, num & 0xff];
  }

  set(x, y, hex, alpha = 1.0) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    const [r, g, b] = this.parseHex(hex);
    const idx = (y * this.width + x) * 4;

    if (alpha >= 0.99) {
      this.png.data[idx] = r;
      this.png.data[idx + 1] = g;
      this.png.data[idx + 2] = b;
      this.png.data[idx + 3] = 255;
    } else {
      const srcA = alpha;
      const dstA = this.png.data[idx + 3] / 255;
      const outA = srcA + dstA * (1 - srcA);
      if (outA > 0) {
        this.png.data[idx] = Math.round((r * srcA + this.png.data[idx] * dstA * (1 - srcA)) / outA);
        this.png.data[idx + 1] = Math.round((g * srcA + this.png.data[idx + 1] * dstA * (1 - srcA)) / outA);
        this.png.data[idx + 2] = Math.round((b * srcA + this.png.data[idx + 2] * dstA * (1 - srcA)) / outA);
        this.png.data[idx + 3] = Math.round(outA * 255);
      }
    }
  }

  fillRect(x, y, w, h, hex) {
    for (let py = y; py < y + h; py++) {
      for (let px = x; px < x + w; px++) {
        this.set(px, py, hex, 1.0);
      }
    }
  }

  fillRectBlend(x, y, w, h, hex, alpha) {
    for (let py = y; py < y + h; py++) {
      for (let px = x; px < x + w; px++) {
        this.set(px, py, hex, alpha);
      }
    }
  }

  fillEllipse(cx, cy, rx, ry, hex, alpha = 1.0) {
    const minX = Math.floor(cx - rx);
    const maxX = Math.ceil(cx + rx);
    const minY = Math.floor(cy - ry);
    const maxY = Math.ceil(cy + ry);

    for (let py = minY; py <= maxY; py++) {
      for (let px = minX; px <= maxX; px++) {
        const dx = (px - cx) / rx;
        const dy = (py - cy) / ry;
        if (dx * dx + dy * dy <= 1.0) {
          this.set(px, py, hex, alpha);
        }
      }
    }
  }

  drawLine(x0, y0, x1, y1, hex, alpha = 1.0) {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    let cx = x0;
    let cy = y0;
    while (true) {
      this.set(cx, cy, hex, alpha);
      if (cx === x1 && cy === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        cx += sx;
      }
      if (e2 < dx) {
        err += dx;
        cy += sy;
      }
    }
  }

  save(filePath) {
    const buffer = PNG.sync.write(this.png);
    fs.writeFileSync(filePath, buffer);
    console.log(`[SAVED] ${filePath} (${this.width}x${this.height})`);
  }
}

console.log('=== V15-12: TẠO BỘ ASSET WORLD PICKUPS, SANCTUARY CAMP & VILLAGE PROPS ===\n');

// =========================================================================
// 1. WORLD PICKUPS (24x24 px)
// =========================================================================

// 1.1 Gỗ Khô (res_dry_wood.png)
// Bó cành cây khô phủ rêu nhỏ nằm tự nhiên trên cỏ
{
  const c = new PixelCanvas(24, 24);
  // Bóng đổ mờ ở đáy
  c.fillEllipse(12, 20, 8, 2.5, '#000000', 0.28);

  // Cành 1: Nằm xiên từ trái dưới lên phải trên (3, 17) -> (20, 9)
  c.drawLine(3, 17, 20, 9, '#1a110a', 1.0);
  c.drawLine(4, 18, 21, 10, '#1a110a', 0.8);
  c.drawLine(4, 17, 19, 9, '#4a321e', 1.0);
  c.drawLine(4, 16, 18, 8, '#6b4a2e', 1.0);
  c.drawLine(6, 15, 16, 8, '#8c623d', 1.0);

  // Cành 2: Nằm xiên chéo đè lên (6, 10) -> (19, 18)
  c.drawLine(6, 10, 19, 18, '#1a110a', 1.0);
  c.drawLine(5, 11, 18, 19, '#1a110a', 0.8);
  c.drawLine(6, 11, 19, 17, '#422d1b', 1.0);
  c.drawLine(7, 10, 18, 17, '#5e3f26', 1.0);
  c.drawLine(8, 10, 16, 16, '#7d5535', 1.0);

  // Nhánh nhỏ phụ tẽ ra
  c.drawLine(15, 12, 19, 7, '#382516', 1.0);
  c.drawLine(16, 12, 18, 8, '#5e3f26', 1.0);

  // Mắt cành và đốm rêu xanh nhỏ bám trên cành
  c.set(8, 13, '#324a25');
  c.set(9, 13, '#4d7339');
  c.set(9, 12, '#6ea352');
  c.set(13, 14, '#3e5c2e');
  c.set(14, 14, '#5b8744');
  c.set(14, 13, '#7ab35c');

  // Viền sáng phía trên cành
  c.set(11, 10, '#a6774c', 0.8);
  c.set(12, 11, '#b88656', 0.8);

  c.save('public/assets/environment/pickups/res_dry_wood.png');
  c.save('public/assets/environment/sprites/res_dry_wood.png');
}

// 1.2 Nhựa Thông (res_tree_resin.png)
// Giọt nhựa hổ phách óng ánh bám trên khúc vỏ thông nhỏ
{
  const c = new PixelCanvas(24, 24);
  // Bóng đổ mờ
  c.fillEllipse(12, 20, 7, 2.5, '#000000', 0.28);

  // Khúc vỏ thông xám nâu sần sùi làm đế
  c.fillRect(6, 15, 12, 5, '#1e140d');
  c.fillRect(7, 14, 10, 4, '#382619');
  c.fillRect(8, 15, 8, 3, '#4f3624');
  c.set(7, 17, '#24180f');
  c.set(12, 16, '#24180f');
  c.set(15, 17, '#24180f');

  // Giọt nhựa hổ phách hình giọt nước tròn (tâm tại 12, 12)
  c.fillEllipse(12, 12, 5, 6, '#5c2d00'); // Viền hổ phách sẫm
  c.fillEllipse(12, 12, 4, 5, '#995000');
  c.fillEllipse(12, 12, 3, 4, '#cc7000');
  c.fillEllipse(11.5, 11.5, 2.5, 3, '#e68a00');
  c.fillEllipse(11, 11, 1.8, 2, '#ffaa1d');

  // Hạt sáng óng ánh li ti dịu mắt (Highlights)
  c.set(10, 9, '#fff2cc', 0.95);
  c.set(11, 9, '#ffffff', 1.0);
  c.set(10, 10, '#ffffff', 0.9);
  c.set(13, 14, '#ffc04d', 0.7); // Phản quang đáy giọt nhựa

  // Vệt nhựa rỉ xuống vỏ thông
  c.set(12, 16, '#e68a00');
  c.set(13, 17, '#cc7000');

  c.save('public/assets/environment/pickups/res_tree_resin.png');
  c.save('public/assets/environment/sprites/res_tree_resin.png');
}

// 1.3 Thảo Dược Bạc (res_herbs.png)
// Khóm lá bạc thanh mảnh nở nụ sáng mờ
{
  const c = new PixelCanvas(24, 24);
  // Bóng gốc
  c.fillEllipse(12, 20, 6, 2, '#000000', 0.25);

  // Cuống thân cây thanh mảnh
  c.drawLine(12, 19, 12, 11, '#1b382b', 1.0);
  c.drawLine(12, 18, 12, 12, '#28523f', 1.0);

  // Cặp lá dưới (xòe ngang)
  c.drawLine(12, 17, 7, 15, '#1b382b', 1.0);
  c.drawLine(12, 16, 7, 14, '#3b6e57', 1.0);
  c.drawLine(11, 16, 8, 14, '#5c967d', 1.0);
  c.drawLine(10, 15, 8, 14, '#8bbfa8', 1.0); // Gân lá ánh bạc

  c.drawLine(12, 17, 17, 15, '#1b382b', 1.0);
  c.drawLine(12, 16, 17, 14, '#3b6e57', 1.0);
  c.drawLine(13, 16, 16, 14, '#5c967d', 1.0);
  c.drawLine(14, 15, 16, 14, '#8bbfa8', 1.0);

  // Cặp lá giữa (hướng chếch lên)
  c.drawLine(12, 14, 8, 10, '#28523f', 1.0);
  c.drawLine(12, 13, 8, 9, '#4d856d', 1.0);
  c.drawLine(11, 13, 9, 9, '#7cb89f', 1.0);
  c.set(9, 10, '#b2ded0'); // Đốm bạc sáng

  c.drawLine(12, 14, 16, 10, '#28523f', 1.0);
  c.drawLine(12, 13, 16, 9, '#4d856d', 1.0);
  c.drawLine(13, 13, 15, 9, '#7cb89f', 1.0);
  c.set(15, 10, '#b2ded0');

  // Nụ hoa thảo dược bạc nở ở đỉnh (tâm 12, 8)
  c.fillEllipse(12, 8, 3, 3, '#2a5946', 0.8);
  c.fillEllipse(12, 8, 2, 2, '#62ab8f', 1.0);
  c.fillEllipse(12, 7.5, 1.5, 1.5, '#a4dbca', 1.0);
  c.set(12, 7, '#e0f7f1'); // Nhuỵ hoa sáng mờ huyền ảo
  c.set(11, 6, '#bbf0e2', 0.6);
  c.set(13, 6, '#bbf0e2', 0.6);

  c.save('public/assets/environment/pickups/res_herbs.png');
  c.save('public/assets/environment/sprites/res_herbs.png');
}

// 1.4 Đá Lửa (res_flint.png)
// Cụm đá xám sắc cạnh gõ vào nhau tạo ra tia lửa sáng
{
  const c = new PixelCanvas(24, 24);
  // Bóng đổ đáy
  c.fillEllipse(12, 19, 7.5, 2.5, '#000000', 0.28);

  // Khối đá chính lớn (bên trái, tâm khoảng 10, 13)
  // Viền đá than chì
  c.fillRect(7, 11, 8, 7, '#13191c');
  c.fillRect(6, 12, 9, 5, '#13191c');
  c.fillRect(8, 10, 6, 8, '#13191c');

  // Thân đá xám đậm nhiều mặt cắt sắc cạnh
  c.fillRect(7, 12, 7, 5, '#283138');
  c.fillRect(8, 11, 5, 6, '#39464f');

  // Mặt vát phẳng phản quang ánh sáng góc trên bên trái
  c.drawLine(7, 12, 11, 10, '#667885');
  c.drawLine(8, 13, 12, 11, '#8195a3');
  c.set(9, 12, '#a5b8c7');
  c.set(10, 11, '#c8d9e6'); // Điểm gờ sắc cạnh nhọn

  // Mặt bóng tối góc dưới bên phải
  c.fillRect(11, 14, 3, 3, '#1c2226');

  // Viên đá nhỏ phụ bên cạnh (bên phải, tâm 15, 15)
  c.fillRect(13, 13, 5, 5, '#182024');
  c.fillRect(14, 14, 3, 3, '#35414a');
  c.set(14, 13, '#6f8391');
  c.set(15, 14, '#9cb0bf');

  // Hạt tia lửa nhỏ li ti le lói vừa gõ ra
  c.set(12, 7, '#ffcc00', 0.8);
  c.set(11, 6, '#fff4cc', 0.9);
  c.set(14, 8, '#ff9900', 0.6);

  c.save('public/assets/environment/pickups/res_flint.png');
  c.save('public/assets/environment/sprites/res_flint.png');
}

// 1.5 Phôi Sắt Cổ (res_runed_iron.png)
// Mảnh sắt rèn khắc cổ ngữ phát sáng dịu
{
  const c = new PixelCanvas(24, 24);
  // Bóng đáy
  c.fillEllipse(12, 19, 8, 2.5, '#000000', 0.28);

  // Hình dáng mảnh sắt rèn góc cạnh (dày dặn, vát góc)
  c.fillRect(6, 8, 12, 10, '#101417');
  c.fillRect(5, 9, 14, 8, '#101417');

  // Lớp kim loại thép nguội
  c.fillRect(6, 9, 12, 8, '#262f36');
  c.fillRect(7, 10, 10, 6, '#3a4650');

  // Vết rỉ đồng/sắt cổ màu nâu cam ven mép
  c.fillRect(5, 14, 3, 2, '#5e381f');
  c.fillRect(16, 10, 2, 3, '#5e381f');
  c.set(7, 15, '#8c522d');

  // Gờ vát trên kim loại phản xạ ánh sáng lạnh
  c.drawLine(6, 9, 17, 9, '#607280');
  c.drawLine(6, 10, 7, 10, '#869bad');
  c.set(7, 9, '#b2c8db');

  // Cổ ngữ khắc phát sáng lam ngọc mờ mộng ảo (Rune Glyphs)
  c.drawLine(10, 11, 10, 15, '#1e6b66');
  c.drawLine(10, 11, 13, 13, '#1e6b66');
  c.drawLine(13, 13, 10, 15, '#1e6b66');

  c.drawLine(10, 12, 10, 14, '#38b2ac');
  c.set(11, 12, '#4fd1c5');
  c.set(12, 13, '#81e6d9');
  c.set(10, 13, '#e6fffa'); // Lõi cổ ngữ phát sáng

  // Đinh tán sắt nhỏ ở 2 góc
  c.set(7, 11, '#182024');
  c.set(16, 15, '#182024');

  c.save('public/assets/environment/pickups/res_runed_iron.png');
  c.save('public/assets/environment/sprites/res_runed_iron.png');
}

// =========================================================================
// 2. SANCTUARY CAMP & VILLAGE PROPS
// =========================================================================

// 2.1 Lửa Trại 3 Cấp (Campfire Tiers - 48x48 px)
// Helper vẽ bệ đá cuội tròn và than củi làm nền cho mọi cấp
function drawCampfireHearth(c) {
  // Quầng bóng đổ tiếp xúc mặt đất
  c.fillEllipse(24, 38, 18, 7, '#000000', 0.4);

  // Vòng đá cuội tròn xếp quanh (Hearth Stones: 10 viên đá)
  const stones = [
    { x: 10, y: 35, rx: 4, ry: 3, col: '#3a3f42', hi: '#555d61' },
    { x: 14, y: 40, rx: 4.5, ry: 3, col: '#32373a', hi: '#4b5257' },
    { x: 21, y: 42, rx: 5, ry: 3.5, col: '#3d4447', hi: '#5a6369' },
    { x: 28, y: 42, rx: 4.5, ry: 3.5, col: '#353a3d', hi: '#51595e' },
    { x: 35, y: 39, rx: 4.5, ry: 3, col: '#3a3f42', hi: '#575f63' },
    { x: 38, y: 34, rx: 4, ry: 3, col: '#2d3133', hi: '#454b4f' },
    { x: 34, y: 30, rx: 4, ry: 2.5, col: '#353a3d', hi: '#4e5559' },
    { x: 26, y: 28, rx: 4.5, ry: 2.5, col: '#282b2d', hi: '#3e4447' },
    { x: 18, y: 28, rx: 4.5, ry: 2.5, col: '#2f3336', hi: '#484e52' },
    { x: 12, y: 31, rx: 4, ry: 2.5, col: '#363b3e', hi: '#50575c' },
  ];
  for (const s of stones) {
    c.fillEllipse(s.x, s.y, s.rx + 0.8, s.ry + 0.8, '#111416');
    c.fillEllipse(s.x, s.y, s.rx, s.ry, s.col);
    c.fillEllipse(s.x - 0.5, s.y - 0.8, s.rx * 0.6, s.ry * 0.5, s.hi, 0.8);
  }

  // Nền tro than củi xám đen trong lòng bếp
  c.fillEllipse(24, 35, 12, 6, '#151515');
  c.fillEllipse(24, 35, 10, 4.5, '#241b14');

  // Khúc củi gỗ sồi xếp chéo nhau
  // Củi 1: góc chéo trái qua phải
  c.drawLine(15, 38, 33, 31, '#1b120c', 1.0);
  c.drawLine(15, 37, 33, 30, '#382517', 1.0);
  c.drawLine(16, 36, 32, 29, '#523722', 1.0);

  // Củi 2: góc chéo phải qua trái
  c.drawLine(33, 38, 15, 31, '#1b120c', 1.0);
  c.drawLine(33, 37, 15, 30, '#382517', 1.0);
  c.drawLine(32, 36, 16, 29, '#4a311e', 1.0);
}

// 2.1A Lửa Trại Chưa Thắp (campfire_unlit.png)
{
  const c = new PixelCanvas(48, 48);
  drawCampfireHearth(c);
  // Tro tàn xám
  c.fillEllipse(24, 34, 7, 3, '#2b2b2b', 0.9);
  c.set(23, 33, '#404040');
  c.set(25, 34, '#383838');
  c.save('public/assets/environment/props/campfire_unlit.png');
  c.save('public/assets/environment/sprites/campfire_unlit.png');
}

// 2.1B Lửa Trại Cấp 1 (campfire_tier1.png) - Duy Trì: Ngọn lửa nhỏ liu riu ấm cúng
{
  const c = new PixelCanvas(48, 48);
  // Quầng sáng ấm nhẹ dịu
  c.fillEllipse(24, 32, 20, 12, '#f39c12', 0.08);
  c.fillEllipse(24, 32, 14, 8, '#e67e22', 0.14);

  drawCampfireHearth(c);

  // Than hồng âm ỉ giữa các khúc củi
  c.fillEllipse(24, 34, 6, 3, '#8a1f05', 0.9);
  c.fillEllipse(24, 34, 4, 2, '#d35400', 0.95);
  c.fillEllipse(24, 33.5, 2.5, 1.2, '#f39c12', 1.0);

  // Ngọn lửa nhỏ cấp 1 (cao 10-12px)
  c.fillEllipse(24, 29, 3.5, 5, '#e64a19');
  c.fillEllipse(24, 28, 2.5, 4, '#ff9800');
  c.fillEllipse(24, 27, 1.5, 2.5, '#ffeb3b');
  c.set(24, 26, '#ffffff');

  // Đốm than đỏ nhỏ
  c.set(20, 34, '#ff5722');
  c.set(28, 33, '#ff5722');

  c.save('public/assets/environment/props/campfire_tier1.png');
  c.save('public/assets/environment/sprites/campfire_tier1.png');
}

// 2.1C Lửa Trại Cấp 2 (campfire_tier2.png) - Cháy Đều: Ngọn lửa bập bùng vừa phải
{
  const c = new PixelCanvas(48, 48);
  // Quầng sáng ấm vừa
  c.fillEllipse(24, 30, 23, 14, '#f39c12', 0.12);
  c.fillEllipse(24, 30, 16, 10, '#e67e22', 0.18);
  c.fillEllipse(24, 28, 10, 6, '#ffeb3b', 0.15);

  drawCampfireHearth(c);

  // Đống than hồng rực rỡ
  c.fillEllipse(24, 33, 8, 4, '#b71c1c', 0.9);
  c.fillEllipse(24, 33, 6, 3, '#e65100', 1.0);
  c.fillEllipse(24, 32, 4, 2, '#ff9800', 1.0);
  c.fillEllipse(24, 32, 2, 1, '#fff59d', 1.0);

  // Ngọn lửa bập bùng cấp 2 (cao 18-20px)
  // Lớp ngoài đỏ cam
  c.fillEllipse(24, 25, 6, 8, '#d84315');
  c.fillEllipse(22, 26, 4, 6, '#e64a19');
  c.fillEllipse(26, 26, 4, 6, '#e64a19');

  // Lớp giữa vàng cam
  c.fillEllipse(24, 24, 4, 6, '#ff9800');
  c.fillEllipse(23, 24, 3, 5, '#ffa726');
  c.fillEllipse(25, 24, 3, 5, '#ffa726');

  // Lõi lửa vàng sáng & trắng
  c.fillEllipse(24, 23, 2.5, 4, '#ffeb3b');
  c.fillEllipse(24, 22, 1.5, 2.5, '#fff9c4');
  c.set(24, 20, '#ffffff');
  c.set(23, 19, '#ffffff');

  // Tia tàn lửa nhỏ
  c.set(21, 17, '#ffb74d');
  c.set(27, 18, '#ff9800');

  c.save('public/assets/environment/props/campfire_tier2.png');
  c.save('public/assets/environment/sprites/campfire_tier2.png');
}

// 2.1D Lửa Trại Cấp 3 (campfire_tier3.png) - Rực Rỡ: Ngọn lửa bốc cao mạnh mẽ, tàn lửa bay
{
  const c = new PixelCanvas(48, 48);
  // Quầng sáng ấm lan tỏa rộng
  c.fillEllipse(24, 28, 24, 16, '#f39c12', 0.16);
  c.fillEllipse(24, 27, 18, 12, '#e67e22', 0.22);
  c.fillEllipse(24, 25, 12, 8, '#ffeb3b', 0.25);

  drawCampfireHearth(c);

  // Đống than hồng cực đại rực sáng
  c.fillEllipse(24, 33, 9, 4.5, '#b71c1c', 1.0);
  c.fillEllipse(24, 32.5, 7, 3.5, '#e65100', 1.0);
  c.fillEllipse(24, 32, 5, 2.5, '#ff9800', 1.0);
  c.fillEllipse(24, 31.5, 3, 1.5, '#ffffff', 1.0);

  // Ngọn lửa cấp 3 bốc cao nhiều nhánh (cao 26-28px)
  // Nhánh trái
  c.fillEllipse(20, 23, 4, 7, '#d84315');
  c.fillEllipse(20, 22, 2.8, 5, '#ff9800');
  c.fillEllipse(19, 21, 1.8, 3.5, '#ffeb3b');
  c.set(18, 18, '#ffffff');

  // Nhánh phải
  c.fillEllipse(28, 23, 4, 7, '#d84315');
  c.fillEllipse(28, 22, 2.8, 5, '#ff9800');
  c.fillEllipse(29, 21, 1.8, 3.5, '#ffeb3b');
  c.set(30, 18, '#ffffff');

  // Cột lửa trung tâm bốc thẳng cao vút
  c.fillEllipse(24, 22, 6, 11, '#bf360c');
  c.fillEllipse(24, 21, 4.8, 9, '#e64a19');
  c.fillEllipse(24, 20, 3.8, 7.5, '#ff9800');
  c.fillEllipse(24, 18, 2.8, 6, '#ffeb3b');
  c.fillEllipse(24, 16, 1.8, 4, '#fff9c4');
  c.set(24, 13, '#ffffff');
  c.set(24, 12, '#ffffff');
  c.set(23, 11, '#ffffff');

  // Tàn lửa bay lên không trung (Sparks)
  c.set(18, 14, '#ffb74d');
  c.set(21, 10, '#ffa726');
  c.set(25, 8, '#ffe082');
  c.set(28, 11, '#ff9800');
  c.set(31, 14, '#ffb74d');
  c.set(24, 6, '#ffffff');

  c.save('public/assets/environment/props/campfire_tier3.png');
  c.save('public/assets/environment/sprites/campfire_tier3.png');
}

// 2.2 Rương Gỗ Đai Đồng (prop_chest_bronze.png - 40x32 px)
// Rương gỗ sồi bo góc, nẹp đai đồng cổ viền đinh tán, ổ khóa đồng
{
  const c = new PixelCanvas(40, 32);
  // Bóng tiếp xúc đáy
  c.fillEllipse(20, 27, 16, 4.5, '#000000', 0.38);

  // Khung viền ngoài rương gỗ
  c.fillRect(5, 10, 30, 18, '#1a100a');
  c.fillRect(4, 11, 32, 16, '#1a100a');

  // Thân gỗ sồi cổ nâu trầm ấm áp
  c.fillRect(5, 11, 30, 16, '#3d2516');
  c.fillRect(6, 12, 28, 14, '#543622');
  c.fillRect(7, 13, 26, 12, '#6b452c');

  // Đường rãnh phân chia nắp rương và đáy rương (y = 17)
  c.fillRect(4, 17, 32, 2, '#140c07');

  // Nắp rương uốn cong nhẹ ở đỉnh
  c.fillRect(6, 10, 28, 2, '#543622');
  c.drawLine(7, 10, 32, 10, '#825638'); // Highlight đỉnh nắp

  // 3 Đai đồng cổ viền đinh tán (trái, giữa, phải)
  const bands = [8, 19, 30];
  for (const bx of bands) {
    // Nẹp đai đồng
    c.fillRect(bx - 1, 10, 4, 18, '#4a3311'); // Viền tối đai
    c.fillRect(bx, 10, 2, 18, '#8c6527');
    c.fillRect(bx, 11, 1, 16, '#b88632'); // Highlight đồng

    // Đinh tán đồng ở nắp và thân
    c.set(bx, 12, '#ffd97d');
    c.set(bx, 15, '#ffd97d');
    c.set(bx, 21, '#ffd97d');
    c.set(bx, 25, '#ffd97d');
  }

  // Ổ khóa đồng cổ điển chính giữa nắp rương (tâm 20, 18)
  c.fillRect(17, 16, 6, 7, '#38250b');
  c.fillRect(18, 16, 4, 6, '#b88632');
  c.fillRect(19, 17, 2, 4, '#ffd97d');
  // Lỗ tra chìa
  c.set(19, 18, '#1a100a');
  c.set(20, 18, '#1a100a');
  c.set(19, 19, '#1a100a');

  // Quai xách bằng đồng 2 bên hông
  c.fillRect(3, 19, 2, 4, '#b88632');
  c.fillRect(35, 19, 2, 4, '#b88632');

  c.save('public/assets/environment/props/prop_chest_bronze.png');
  c.save('public/assets/environment/sprites/prop_chest_bronze.png');
}

// 2.3 Nồi Sắc Thảo Dược Treo Trên Kiềng 3 Chân (prop_cauldron_tripod.png - 36x44 px)
// Kiềng sắt đen 3 chân, dây xích treo nồi gang đen, than hồng, nước thảo dược ngọc bích sủi bọt
{
  const c = new PixelCanvas(36, 44);
  // Bóng đổ tiếp xúc mặt đất
  c.fillEllipse(18, 40, 13, 3.5, '#000000', 0.35);

  // Đống than củi hồng rực bên dưới đáy nồi (tâm 18, 38)
  c.fillEllipse(18, 38, 7, 2.5, '#1e140d');
  c.fillEllipse(18, 38, 5, 1.8, '#b71c1c');
  c.fillEllipse(18, 37.5, 3.5, 1.2, '#e65100');
  c.set(18, 37, '#ffb74d');

  // Chân kiềng sắt 3 chân: Chụm ở đỉnh (18, 6), tẽ ra 3 chân ở đất (7, 40), (29, 40), và chân sau (18, 36)
  // Chân sau
  c.drawLine(18, 8, 18, 36, '#16191d', 1.0);
  // Chân trái
  c.drawLine(18, 7, 8, 40, '#101315', 1.0);
  c.drawLine(18, 8, 9, 39, '#2c333a', 1.0);
  // Chân phải
  c.drawLine(18, 7, 28, 40, '#101315', 1.0);
  c.drawLine(18, 8, 27, 39, '#2c333a', 1.0);

  // Đỉnh kiềng có móc xích treo
  c.fillRect(17, 5, 3, 3, '#101315');
  c.set(18, 6, '#495460');

  // Dây xích sắt treo nồi (từ y=8 xuống y=16)
  c.set(18, 9, '#373f47');
  c.set(18, 11, '#2c333a');
  c.set(18, 13, '#495460');
  c.set(18, 15, '#2c333a');

  // Quai nồi cong bằng sắt (nối vào tai nồi ở y=21)
  c.drawLine(18, 15, 11, 20, '#1c2228', 1.0);
  c.drawLine(18, 15, 25, 20, '#1c2228', 1.0);

  // Thân Nồi Gang Đen Tròn Bầu Bĩnh (tâm 18, 27)
  c.fillEllipse(18, 27, 10.5, 9.5, '#0c0f12'); // Viền ngoài
  c.fillEllipse(18, 27, 9.5, 8.5, '#1e252d');
  c.fillEllipse(18, 28, 8.5, 7.5, '#2a343f');
  // Highlight cong mặt nồi
  c.fillEllipse(16, 26, 6, 5, '#3b4754', 0.8);
  c.fillEllipse(15, 25, 4, 3.5, '#4c5c6d', 0.7);

  // Vành miệng nồi (y = 19..22)
  c.fillEllipse(18, 20, 9, 3.5, '#0c0f12');
  c.fillEllipse(18, 20, 8, 2.5, '#1a222a');

  // Tai nồi 2 bên
  c.fillRect(8, 20, 2, 4, '#1c2228');
  c.fillRect(26, 20, 2, 4, '#1c2228');

  // Nước thảo dược sôi màu ngọc bích sủi bọt trong miệng nồi
  c.fillEllipse(18, 20, 7, 2, '#1b5e20');
  c.fillEllipse(18, 20, 5.5, 1.5, '#2e7d32');
  c.fillEllipse(18, 19.5, 4, 1, '#4caf50');
  // Bọt sủi
  c.set(16, 19, '#a5d6a7');
  c.set(20, 20, '#81c784');
  c.set(18, 19, '#e8f5e9');

  // Làn hơi nước thảo dược mỏng bốc lên
  c.set(16, 16, '#80cbc4', 0.45);
  c.set(19, 14, '#a7ffeb', 0.5);
  c.set(17, 12, '#80cbc4', 0.35);

  c.save('public/assets/environment/props/prop_cauldron_tripod.png');
  c.save('public/assets/environment/sprites/prop_cauldron_tripod.png');
}

// 2.4 Lều Vải Da Thú Của Lữ Khách (prop_wayfarer_tent.png - 64x56 px)
// Khung gỗ chữ A, vải bạt da thú màu rêu ngả nâu, chỉ khâu thủ công, đệm rơm, đèn bão ở đỉnh
{
  const c = new PixelCanvas(64, 56);
  // Bóng tiếp xúc mặt đất dày dặn
  c.fillEllipse(32, 50, 26, 5.5, '#000000', 0.42);

  // Khung cọc gỗ chữ A 2 đầu
  // Cọc gỗ phía sau (đỉnh 32, 10)
  c.drawLine(32, 10, 8, 51, '#1b120c', 1.0);
  c.drawLine(32, 10, 56, 51, '#1b120c', 1.0);

  // Mái bạt vải da thú rêu sẫm (tạo khối tam giác 3D)
  // Mặt nghiêng bên phải (hướng bóng tối)
  for (let py = 12; py <= 49; py++) {
    const progress = (py - 12) / 37;
    const xLeft = 32;
    const xRight = Math.round(32 + progress * 24);
    for (let px = xLeft; px <= xRight; px++) {
      c.set(px, py, '#1f2922');
    }
  }

  // Mặt nghiêng bên trái (hướng sáng nhẹ)
  for (let py = 12; py <= 49; py++) {
    const progress = (py - 12) / 37;
    const xLeft = Math.round(32 - progress * 24);
    const xRight = 32;
    for (let px = xLeft; px <= xRight; px++) {
      c.set(px, py, '#2d3a31');
    }
  }

  // Tấm bạt phủ ngoài đắp vá da thú (Patchwork)
  c.fillRect(18, 26, 10, 14, '#38483d');
  c.fillRect(36, 30, 11, 12, '#28342b');

  // Các đường chỉ khâu gia cố da thú vắt chéo thủ công
  const stitchPoints = [
    { x: 18, y: 26 }, { x: 21, y: 28 }, { x: 24, y: 30 }, { x: 27, y: 32 },
    { x: 36, y: 30 }, { x: 39, y: 32 }, { x: 43, y: 35 }, { x: 46, y: 38 }
  ];
  for (const st of stitchPoints) {
    c.set(st.x, st.y, '#9c824a');
    c.set(st.x + 1, st.y + 1, '#1a140a');
  }

  // Xà gỗ nóc lều nằm ngang ở đỉnh
  c.fillRect(30, 9, 5, 4, '#3d2516');
  c.fillRect(31, 10, 3, 2, '#664126');

  // Cửa lều mở he hé ở mặt trước (khoảng x: 25..39, y: 34..50)
  c.fillEllipse(32, 43, 7, 7, '#0d130e');
  c.fillEllipse(32, 45, 6, 5, '#121a14');

  // Đệm rơm và chăn cuộn bên trong lòng lều
  c.fillEllipse(32, 47, 5, 2.5, '#735722');
  c.fillEllipse(32, 47, 3.5, 1.5, '#a6823c');
  // Chăn len màu nâu ấm
  c.fillRect(29, 44, 4, 3, '#4a2f1c');
  c.set(30, 44, '#6e472d');

  // Cọc lều gỗ chữ A phía trước ôm lấy cửa
  c.drawLine(32, 10, 14, 51, '#2c1a0f', 1.0);
  c.drawLine(33, 11, 15, 51, '#4a2f1c', 1.0);
  c.drawLine(32, 10, 50, 51, '#2c1a0f', 1.0);
  c.drawLine(31, 11, 49, 51, '#422a18', 1.0);

  // Chiếc đèn bão nhỏ treo ở đỉnh cọc lều
  c.set(32, 13, '#1c1c1c'); // Dây treo
  c.set(32, 14, '#1c1c1c');
  c.fillRect(31, 15, 3, 5, '#1a1005');
  c.set(32, 16, '#ff9800');
  c.set(32, 17, '#ffeb3b');
  // Quầng sáng đèn bão nhỏ
  c.fillEllipse(32, 17, 5, 5, '#ffb74d', 0.22);
  c.fillEllipse(32, 17, 2.5, 2.5, '#fff9c4', 0.4);

  c.save('public/assets/environment/props/prop_wayfarer_tent.png');
  c.save('public/assets/environment/sprites/prop_wayfarer_tent.png');
}

// 2.5 Cột Đèn Đường Gỗ Treo Đèn Lồng (prop_lantern_post.png - 32x64 px)
// Cột gỗ sồi sần sùi bám rêu, tay đỡ chữ L có giằng chéo, đèn lồng sắt phát sáng ấm, bóng đáy
{
  const c = new PixelCanvas(32, 64);
  // Bóng chân cột ở đáy
  c.fillEllipse(12, 61, 8, 2.5, '#000000', 0.35);

  // Ụ đá cuội gia cố chân cột (y = 56..61)
  c.fillEllipse(12, 58, 6, 3, '#2b3136');
  c.fillEllipse(12, 57.5, 4.5, 2, '#414a52');
  c.set(11, 57, '#5a6670');
  c.set(14, 58, '#264228'); // Rêu bám chân đá

  // Thân cột gỗ sồi mộc cao thanh thoát (x = 10..13, y = 8..58)
  c.fillRect(10, 8, 4, 50, '#1c130c');
  c.fillRect(11, 9, 2, 48, '#382619');
  c.fillRect(11, 10, 1, 46, '#543b28'); // Highlight thớ gỗ sồi

  // Mảng rêu xanh bám dọc thân cột gỗ
  c.fillRect(10, 42, 2, 5, '#2e4726');
  c.set(11, 43, '#4a6e3e');
  c.fillRect(12, 28, 2, 4, '#2e4726');
  c.set(12, 29, '#4a6e3e');

  // Đỉnh cột tiện tròn
  c.fillRect(10, 5, 4, 3, '#1c130c');
  c.set(11, 6, '#543b28');

  // Tay đỡ chữ L vươn sang phải (x = 13..24, y = 10..12)
  c.fillRect(13, 10, 11, 3, '#1c130c');
  c.fillRect(13, 11, 10, 1, '#4a3221');

  // Thanh giằng gỗ chéo chịu lực (từ 13, 18 lên 19, 12)
  c.drawLine(13, 18, 19, 12, '#1c130c', 1.0);
  c.drawLine(14, 18, 19, 13, '#382619', 1.0);

  // Móc sắt và xích treo đèn lồng tại x = 22, y = 13..17
  c.set(22, 13, '#101417');
  c.set(22, 14, '#38434d');
  c.set(22, 15, '#202830');
  c.set(22, 16, '#38434d');

  // Đèn lồng sắt đen mỹ thuật (tâm tại 22, 23)
  // Mái che đèn lồng kim tự tháp (y = 17..19)
  c.fillRect(19, 18, 7, 2, '#12161a');
  c.fillRect(20, 17, 5, 2, '#20272e');
  c.set(22, 17, '#3d4a57');

  // Khung sắt 4 góc và kính đèn (x = 20..24, y = 20..27)
  c.fillRect(20, 20, 5, 8, '#12161a'); // Khung viền sắt
  c.fillRect(20, 28, 5, 2, '#12161a'); // Đáy đèn lồng

  // Quầng sáng ấm bên trong mặt kính
  c.fillRect(21, 21, 3, 6, '#d35400');
  c.fillRect(21, 22, 3, 4, '#f39c12');
  c.fillRect(21, 23, 2, 2, '#fff59d');
  c.set(22, 23, '#ffffff'); // Tim đèn rực rỡ

  // Quầng sáng ấm lan tỏa quanh đèn lồng
  c.fillEllipse(22, 24, 9, 9, '#f39c12', 0.15);
  c.fillEllipse(22, 24, 6, 6, '#ffeb3b', 0.22);

  c.save('public/assets/environment/props/prop_lantern_post.png');
  c.save('public/assets/environment/sprites/prop_lantern_post.png');
}

// 2.6 Biển Chỉ Đường Gỗ Khắc Mũi Tên Cổ Điển (prop_signpost_wood.png - 36x48 px)
// Cọc gỗ sồi cắm đất, 2 thanh biển gỗ vát nhọn hình mũi tên chỉ 2 hướng, có khắc chữ cổ ngữ
{
  const c = new PixelCanvas(36, 48);
  // Bóng tiếp xúc đáy
  c.fillEllipse(18, 45, 8, 2.5, '#000000', 0.35);

  // Cọc gỗ sồi cắm nghiêng tự nhiên (x = 16..19, y = 6..44)
  c.fillRect(16, 6, 4, 39, '#1a110a');
  c.fillRect(17, 7, 2, 37, '#382517');
  c.fillRect(17, 8, 1, 35, '#523722');
  // Chóp cọc phủ rêu xanh
  c.set(17, 6, '#3e5c2e');
  c.set(18, 6, '#5b8744');

  // Thanh biển 1: Chỉ sang TRÁI (hướng Tây - Làng Bellhollow) tại y = 11..19
  // Vát nhọn mũi tên về phía trái (x = 4..25)
  // Viền tối ngoài
  c.fillRect(7, 11, 18, 8, '#140c07');
  c.fillEllipse(6, 15, 3, 4, '#140c07');
  c.set(4, 15, '#140c07');
  c.set(5, 14, '#140c07');
  c.set(5, 16, '#140c07');

  // Thân biển gỗ sồi sáng
  c.fillRect(8, 12, 17, 6, '#4a321e');
  c.fillRect(8, 13, 16, 4, '#6b492d');
  c.fillRect(9, 13, 14, 2, '#875d3a'); // Thớ gỗ sáng

  // Mũi nhọn sang trái
  c.set(6, 15, '#6b492d');
  c.set(7, 14, '#6b492d');
  c.set(7, 15, '#875d3a');
  c.set(7, 16, '#4a321e');

  // Chữ / Ký hiệu cổ ngữ khắc chìm trên biển gỗ 1
  c.drawLine(10, 14, 10, 16, '#21150c');
  c.drawLine(12, 14, 14, 14, '#21150c');
  c.drawLine(13, 14, 13, 16, '#21150c');
  c.drawLine(16, 14, 18, 16, '#21150c');
  c.drawLine(20, 14, 20, 16, '#21150c');
  c.set(21, 14, '#21150c');

  // Thanh biển 2: Chỉ sang PHẢI (hướng Đông - Rừng Sâu / Đầm Lầy) tại y = 22..30
  // Vát nhọn mũi tên về phía phải (x = 12..33)
  // Viền tối ngoài
  c.fillRect(12, 22, 18, 8, '#140c07');
  c.fillEllipse(30, 26, 3, 4, '#140c07');
  c.set(32, 26, '#140c07');
  c.set(31, 25, '#140c07');
  c.set(31, 27, '#140c07');

  // Thân biển gỗ
  c.fillRect(12, 23, 17, 6, '#422c1b');
  c.fillRect(12, 24, 16, 4, '#5e3e26');
  c.fillRect(13, 24, 14, 2, '#7a5233');

  // Mũi nhọn sang phải
  c.set(30, 26, '#5e3e26');
  c.set(29, 25, '#7a5233');
  c.set(29, 26, '#5e3e26');
  c.set(29, 27, '#422c1b');

  // Ký hiệu khắc chìm trên biển 2
  c.drawLine(14, 25, 14, 27, '#1c120a');
  c.drawLine(17, 25, 19, 27, '#1c120a');
  c.drawLine(21, 25, 23, 25, '#1c120a');
  c.drawLine(22, 25, 22, 27, '#1c120a');
  c.drawLine(25, 25, 27, 27, '#1c120a');

  // Đinh tán sắt rèn đóng cố định biển vào cột gỗ
  c.set(18, 15, '#a6b8c7');
  c.set(19, 15, '#101417');
  c.set(18, 26, '#a6b8c7');
  c.set(19, 26, '#101417');

  c.save('public/assets/environment/props/prop_signpost_wood.png');
  c.save('public/assets/environment/sprites/prop_signpost_wood.png');
}

console.log('\n>>> ĐÃ TẠO TOÀN BỘ 11 TỆP ASSET PIXEL ART V15-12 THÀNH CÔNG 100%! <<<');
