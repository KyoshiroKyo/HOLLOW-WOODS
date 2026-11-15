/**
 * Trình Tạo Tài Nguyên Pixel Art 3 NPC Dân Làng Bellhollow (C4-12-08)
 * Dự án: HOLLOW WOODS V1.2 (The Fog That Remembers)
 * Nhân vật: Garth (Người gác cổng), Edda (Bà lão giữ chuông), Neris (Người chữa thảo mộc)
 */

import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const ROOT_DIR = process.cwd();
const VILLAGERS_BASE = path.join(ROOT_DIR, 'public', 'assets', 'characters', 'villagers');

// Bảng màu chuẩn Dark Woodland Pixel Art (Phương án A)
const PALETTE = {
  // Chung: Kim loại cổ & bóng
  outline: [24, 20, 18, 255],        // #181412
  shadowDark: [16, 12, 10, 255],     // #100c0a
  bronzeDark: [62, 44, 22, 255],     // #3e2c16
  bronzeMid: [140, 102, 46, 255],    // #8c662e
  bronzeLight: [212, 172, 13, 255],  // #d4ac0d
  bronzeGleam: [254, 249, 231, 255], // #fef9e7

  // Garth: Giáp sắt, áo da, giáo dài, râu bạc
  garthSkin: [215, 180, 150, 255],
  garthSkinShadow: [160, 120, 95, 255],
  garthHair: [58, 45, 38, 255],
  garthBeardSilver: [180, 190, 195, 255],
  garthBeardShadow: [110, 120, 128, 255],
  garthArmorIron: [95, 110, 122, 255],
  garthArmorHighlight: [155, 172, 185, 255],
  garthArmorShadow: [50, 60, 70, 255],
  garthLeatherTunic: [75, 48, 30, 255],
  garthLeatherHighlight: [115, 75, 45, 255],
  garthLeatherShadow: [45, 28, 16, 255],
  garthPants: [38, 42, 46, 255],
  garthBoots: [35, 25, 20, 255],
  garthSpearWood: [90, 60, 40, 255],
  garthSpearIron: [176, 190, 197, 255],
  garthSpearGleam: [236, 239, 241, 255],

  // Edda: Lễ phục giữ chuông màu mận chín, tóc bạc, gậy liễu & bùa chuông đồng
  eddaSkin: [225, 195, 175, 255],
  eddaSkinWrinkle: [175, 140, 120, 255],
  eddaHairSilver: [220, 224, 226, 255],
  eddaHairShadow: [150, 155, 160, 255],
  eddaCloakPlum: [106, 27, 50, 255],      // #6a1b32
  eddaCloakHighlight: [142, 40, 70, 255], // #8e2846
  eddaCloakShadow: [65, 16, 32, 255],     // #411020
  eddaGownLinen: [195, 185, 170, 255],
  eddaGownShadow: [140, 130, 115, 255],
  eddaWillowWood: [145, 125, 105, 255],
  eddaWillowShadow: [95, 80, 65, 255],
  eddaBellGold: [218, 165, 32, 255],
  eddaBellHighlight: [255, 230, 120, 255],
  eddaBoots: [50, 35, 30, 255],

  // Neris: Áo trắng ngà, tạp dề xanh ngọc lục bảo, tóc nâu hạt dẻ, giỏ thảo dược
  nerisSkin: [240, 205, 185, 255],
  nerisSkinShadow: [195, 155, 135, 255],
  nerisBlush: [230, 160, 150, 255],
  nerisHairAuburn: [110, 65, 42, 255],
  nerisHairHighlight: [155, 95, 65, 255],
  nerisHairShadow: [70, 40, 25, 255],
  nerisBlouseIvory: [245, 242, 230, 255],
  nerisBlouseShadow: [195, 190, 175, 255],
  nerisApronGreen: [45, 106, 79, 255],     // #2d6a4f
  nerisApronHighlight: [64, 145, 108, 255],// #40916c
  nerisApronShadow: [27, 67, 50, 255],     // #1b4332
  nerisSatchelBrown: [120, 85, 55, 255],
  nerisHerbLeaf: [116, 198, 157, 255],    // #74c69d
  nerisHerbBright: [183, 228, 199, 255],
  nerisPotionCyan: [0, 180, 216, 255],
  nerisPotionAmber: [255, 183, 3, 255],
  nerisBoots: [65, 45, 35, 255]
};

// Hàm tiện ích vẽ pixel an toàn
function setPixel(png, x, y, color) {
  if (x < 0 || x >= png.width || y < 0 || y >= png.height) return;
  const idx = (png.width * Math.floor(y) + Math.floor(x)) << 2;
  const [r, g, b, a = 255] = color;
  if (a === 0) return;
  if (a === 255) {
    png.data[idx] = r;
    png.data[idx + 1] = g;
    png.data[idx + 2] = b;
    png.data[idx + 3] = 255;
  } else {
    // Trộn Alpha
    const prevA = png.data[idx + 3] / 255;
    const curA = a / 255;
    const outA = curA + prevA * (1 - curA);
    if (outA > 0) {
      png.data[idx] = Math.round((r * curA + png.data[idx] * prevA * (1 - curA)) / outA);
      png.data[idx + 1] = Math.round((g * curA + png.data[idx + 1] * prevA * (1 - curA)) / outA);
      png.data[idx + 2] = Math.round((b * curA + png.data[idx + 2] * prevA * (1 - curA)) / outA);
      png.data[idx + 3] = Math.round(outA * 255);
    }
  }
}

function fillRect(png, x, y, w, h, color) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      setPixel(png, x + dx, y + dy, color);
    }
  }
}

// =============================================================================
// KHỞI TẠO BỘ VẼ CHO GARTH — NGƯỜI GÁC CỔNG
// =============================================================================
function drawGarthFrame(png, ox, oy, dir, frameIdx, isWalk) {
  const cx = ox + 32;
  let cy = oy + 58; // Foot anchor at (32, 58)

  // Nhịp bước chân & độ nảy thân
  let bobY = 0;
  let legOffset = 0;
  if (isWalk) {
    const bobs = [0, -1, 0, 1];
    bobY = bobs[frameIdx % 4];
    legOffset = (frameIdx === 1 ? -2 : (frameIdx === 3 ? 2 : 0));
  } else {
    // Idle thở nhẹ
    bobY = (frameIdx === 1 || frameIdx === 2) ? -0.5 : 0;
  }

  const torsoY = oy + 38 + bobY;
  const headY = oy + 27 + bobY;

  // 1. Chân & Ủng bảo hộ
  if (dir === 'down' || dir === 'up') {
    // Chân trái & phải
    const leftLegY = cy - 8 + (legOffset > 0 ? -1 : 0);
    const rightLegY = cy - 8 + (legOffset < 0 ? -1 : 0);
    // Quần tối màu
    fillRect(png, cx - 6, leftLegY, 4, 5, PALETTE.garthPants);
    fillRect(png, cx + 2, rightLegY, 4, 5, PALETTE.garthPants);
    // Ủng da nặng
    fillRect(png, cx - 7, cy - 4, 5, 4, PALETTE.garthBoots);
    fillRect(png, cx + 2, cy - 4, 5, 4, PALETTE.garthBoots);
  } else if (dir === 'left') {
    fillRect(png, cx - 4 + legOffset, cy - 8, 5, 5, PALETTE.garthPants);
    fillRect(png, cx + 1 - legOffset, cy - 7, 4, 4, PALETTE.garthLeatherShadow);
    fillRect(png, cx - 5 + legOffset, cy - 4, 6, 4, PALETTE.garthBoots);
  } else if (dir === 'right') {
    fillRect(png, cx - 1 + legOffset, cy - 8, 5, 5, PALETTE.garthPants);
    fillRect(png, cx - 5 - legOffset, cy - 7, 4, 4, PALETTE.garthLeatherShadow);
    fillRect(png, cx - 1 + legOffset, cy - 4, 6, 4, PALETTE.garthBoots);
  }

  // 2. Thân & Giáp da lót sắt (Brigandine)
  if (dir === 'down') {
    // Áo giáp da dập đinh sắt
    fillRect(png, cx - 8, torsoY, 16, 12, PALETTE.garthLeatherTunic);
    fillRect(png, cx - 6, torsoY + 1, 12, 6, PALETTE.garthArmorIron);
    // Tấm che ngực thép điểm sáng
    fillRect(png, cx - 4, torsoY + 2, 8, 3, PALETTE.garthArmorHighlight);
    // Thắt lưng bản to với khóa đồng
    fillRect(png, cx - 7, torsoY + 9, 14, 3, PALETTE.garthLeatherShadow);
    fillRect(png, cx - 2, torsoY + 9, 4, 3, PALETTE.bronzeMid);
    // Cầu vai thép
    fillRect(png, cx - 10, torsoY - 1, 4, 5, PALETTE.garthArmorIron);
    fillRect(png, cx + 6, torsoY - 1, 4, 5, PALETTE.garthArmorIron);

    // 3. Đầu, Râu bạc và Mũ/Mặt
    // Cổ
    fillRect(png, cx - 3, headY + 8, 6, 3, PALETTE.garthSkinShadow);
    // Khuôn mặt
    fillRect(png, cx - 5, headY, 10, 8, PALETTE.garthSkin);
    // Mái tóc nâu trầm cắt gọn
    fillRect(png, cx - 6, headY - 2, 12, 4, PALETTE.garthHair);
    // Bộ râu quai nón râm hoa tiêu (Grizzled Beard)
    fillRect(png, cx - 5, headY + 5, 10, 5, PALETTE.garthBeardSilver);
    fillRect(png, cx - 3, headY + 8, 6, 3, PALETTE.garthBeardShadow);
    // Mắt gác cổng kiên nghị
    setPixel(png, cx - 3, headY + 3, PALETTE.shadowDark);
    setPixel(png, cx + 2, headY + 3, PALETTE.shadowDark);

    // 4. Tay & Cây giáo canh gác (Watchman's Spear)
    // Tay trái xuôi bên sườn
    fillRect(png, cx - 10, torsoY + 3, 3, 7, PALETTE.garthLeatherHighlight);
    // Tay phải cầm cán giáo
    fillRect(png, cx + 6, torsoY + 3, 3, 6, PALETTE.garthLeatherHighlight);
    fillRect(png, cx + 8, torsoY + 5, 3, 3, PALETTE.garthSkin);

    // Thân cây giáo gỗ dài (x = cx + 10, cao từ y = 14 đến y = 56)
    fillRect(png, cx + 9, oy + 18, 2, 38, PALETTE.garthSpearWood);
    // Mũi giáo sắt nhọn và ngạnh
    fillRect(png, cx + 8, oy + 12, 4, 6, PALETTE.garthSpearIron);
    fillRect(png, cx + 9, oy + 8, 2, 5, PALETTE.garthSpearGleam);
    setPixel(png, cx + 9, oy + 7, PALETTE.outline);
  } else if (dir === 'up') {
    // Nhìn từ sau lưng
    fillRect(png, cx - 8, torsoY, 16, 12, PALETTE.garthLeatherShadow);
    fillRect(png, cx - 6, torsoY + 1, 12, 8, PALETTE.garthArmorShadow);
    // Tóc phía sau
    fillRect(png, cx - 6, headY - 2, 12, 10, PALETTE.garthHair);
    fillRect(png, cx - 4, headY + 6, 8, 3, PALETTE.garthBeardShadow);
    // Cầu vai
    fillRect(png, cx - 10, torsoY - 1, 4, 5, PALETTE.garthArmorShadow);
    fillRect(png, cx + 6, torsoY - 1, 4, 5, PALETTE.garthArmorShadow);
    // Giáo cầm bên tay phải
    fillRect(png, cx + 9, oy + 18, 2, 38, PALETTE.garthSpearWood);
    fillRect(png, cx + 8, oy + 12, 4, 6, PALETTE.garthSpearIron);
    fillRect(png, cx + 9, oy + 8, 2, 5, PALETTE.garthSpearGleam);
  } else if (dir === 'left') {
    // Nhìn nghiêng trái
    fillRect(png, cx - 6, torsoY, 12, 12, PALETTE.garthLeatherTunic);
    fillRect(png, cx - 5, torsoY + 1, 6, 7, PALETTE.garthArmorIron);
    // Đầu & Râu
    fillRect(png, cx - 6, headY, 9, 8, PALETTE.garthSkin);
    fillRect(png, cx - 7, headY - 2, 10, 4, PALETTE.garthHair);
    fillRect(png, cx - 8, headY + 4, 5, 6, PALETTE.garthBeardSilver);
    setPixel(png, cx - 4, headY + 3, PALETTE.shadowDark);
    // Cánh tay trái cầm giáo đưa ra phía trước
    fillRect(png, cx - 8, torsoY + 3, 5, 5, PALETTE.garthLeatherHighlight);
    fillRect(png, cx - 9, torsoY + 5, 3, 3, PALETTE.garthSkin);
    // Giáo
    fillRect(png, cx - 11, oy + 18, 2, 38, PALETTE.garthSpearWood);
    fillRect(png, cx - 12, oy + 12, 4, 6, PALETTE.garthSpearIron);
    fillRect(png, cx - 11, oy + 8, 2, 5, PALETTE.garthSpearGleam);
  } else if (dir === 'right') {
    // Nhìn nghiêng phải
    fillRect(png, cx - 6, torsoY, 12, 12, PALETTE.garthLeatherTunic);
    fillRect(png, cx - 1, torsoY + 1, 6, 7, PALETTE.garthArmorIron);
    // Đầu & Râu
    fillRect(png, cx - 3, headY, 9, 8, PALETTE.garthSkin);
    fillRect(png, cx - 3, headY - 2, 10, 4, PALETTE.garthHair);
    fillRect(png, cx + 3, headY + 4, 5, 6, PALETTE.garthBeardSilver);
    setPixel(png, cx + 4, headY + 3, PALETTE.shadowDark);
    // Cánh tay phải cầm giáo đưa ra trước
    fillRect(png, cx + 3, torsoY + 3, 5, 5, PALETTE.garthLeatherHighlight);
    fillRect(png, cx + 6, torsoY + 5, 3, 3, PALETTE.garthSkin);
    // Giáo
    fillRect(png, cx + 9, oy + 18, 2, 38, PALETTE.garthSpearWood);
    fillRect(png, cx + 8, oy + 12, 4, 6, PALETTE.garthSpearIron);
    fillRect(png, cx + 9, oy + 8, 2, 5, PALETTE.garthSpearGleam);
  }
}

// =============================================================================
// KHỞI TẠO BỘ VẼ CHO EDDA — BÀ LÃO GIỮ CHUÔNG
// =============================================================================
function drawEddaFrame(png, ox, oy, dir, frameIdx, isWalk) {
  const cx = ox + 32;
  const cy = oy + 58;

  let bobY = 0;
  let legOffset = 0;
  if (isWalk) {
    const bobs = [0, -0.7, 0, 0.7];
    bobY = bobs[frameIdx % 4];
    legOffset = (frameIdx === 1 ? -1.5 : (frameIdx === 3 ? 1.5 : 0));
  } else {
    bobY = (frameIdx === 1 || frameIdx === 2) ? -0.5 : 0;
  }

  // Dáng người lưng còng cao tuổi (Hunched posture)
  const torsoY = oy + 40 + bobY;
  const headY = oy + 30 + bobY;

  // 1. Tà váy áo dài chạm đất
  fillRect(png, cx - 7, cy - 7, 14, 6, PALETTE.eddaGownLinen);
  fillRect(png, cx - 8, cy - 3, 16, 3, PALETTE.eddaGownShadow);
  // Mũi giày tối màu lấp ló dưới tà áo
  fillRect(png, cx - 5 + legOffset, cy - 2, 3, 2, PALETTE.eddaBoots);
  fillRect(png, cx + 2 - legOffset, cy - 2, 3, 2, PALETTE.eddaBoots);

  // 2. Áo choàng giữ chuông nhiều lớp màu mận chín (Plum Robe)
  if (dir === 'down') {
    // Áo choàng mận chín
    fillRect(png, cx - 8, torsoY - 2, 16, 14, PALETTE.eddaCloakPlum);
    fillRect(png, cx - 6, torsoY - 1, 12, 11, PALETTE.eddaCloakHighlight);
    fillRect(png, cx - 2, torsoY + 1, 4, 9, PALETTE.eddaGownLinen);
    // Bùa Chuông Đồng (Bronze Bell Charm) đeo trước ngực
    fillRect(png, cx - 1, torsoY + 4, 3, 4, PALETTE.eddaBellGold);
    setPixel(png, cx, torsoY + 5, PALETTE.eddaBellHighlight);
    setPixel(png, cx, torsoY + 3, PALETTE.outline); // dây đeo

    // 3. Khuôn mặt bà lão & Búi tóc bạc
    fillRect(png, cx - 4, headY, 8, 8, PALETTE.eddaSkin);
    // Nếp nhăn hiền từ
    fillRect(png, cx - 3, headY + 3, 2, 1, PALETTE.eddaSkinWrinkle);
    fillRect(png, cx + 1, headY + 3, 2, 1, PALETTE.eddaSkinWrinkle);
    // Búi tóc bạc trắng cài cành liễu
    fillRect(png, cx - 6, headY - 3, 12, 5, PALETTE.eddaHairSilver);
    fillRect(png, cx - 3, headY - 5, 6, 3, PALETTE.eddaHairSilver);
    // Cành liễu xanh cài tóc
    setPixel(png, cx + 3, headY - 4, PALETTE.nerisHerbLeaf);
    setPixel(png, cx + 4, headY - 3, PALETTE.nerisHerbLeaf);

    // 4. Cây gậy gỗ liễu uốn cong bên tay phải (Willow Cane)
    // Tay áo mận chín
    fillRect(png, cx + 6, torsoY + 2, 3, 5, PALETTE.eddaCloakHighlight);
    fillRect(png, cx + 7, torsoY + 5, 2, 2, PALETTE.eddaSkin);
    // Thân gậy liễu cong tự nhiên
    fillRect(png, cx + 9, oy + 26, 2, 32, PALETTE.eddaWillowWood);
    fillRect(png, cx + 8, oy + 24, 3, 3, PALETTE.eddaWillowShadow);
    // Quả chuông đồng nhỏ gắn đầu gậy
    fillRect(png, cx + 11, oy + 27, 2, 3, PALETTE.eddaBellGold);
    setPixel(png, cx + 11, oy + 28, PALETTE.eddaBellHighlight);
  } else if (dir === 'up') {
    // Lưng còng nhìn từ phía sau
    fillRect(png, cx - 8, torsoY - 2, 16, 14, PALETTE.eddaCloakShadow);
    fillRect(png, cx - 6, torsoY - 1, 12, 10, PALETTE.eddaCloakPlum);
    // Búi tóc bạc nhìn từ sau
    fillRect(png, cx - 5, headY - 4, 10, 8, PALETTE.eddaHairSilver);
    fillRect(png, cx - 3, headY - 5, 6, 3, PALETTE.eddaHairShadow);
    // Cành liễu
    setPixel(png, cx + 2, headY - 4, PALETTE.nerisHerbLeaf);
    // Gậy liễu
    fillRect(png, cx + 9, oy + 26, 2, 32, PALETTE.eddaWillowWood);
  } else if (dir === 'left') {
    // Nghiêng trái: Lưng còng rõ nét
    fillRect(png, cx - 5, torsoY - 2, 11, 14, PALETTE.eddaCloakPlum);
    fillRect(png, cx + 2, torsoY - 1, 4, 10, PALETTE.eddaCloakShadow);
    // Đầu hơi chúi về trước
    fillRect(png, cx - 6, headY, 7, 7, PALETTE.eddaSkin);
    fillRect(png, cx - 6, headY - 3, 9, 5, PALETTE.eddaHairSilver);
    fillRect(png, cx + 1, headY - 4, 4, 4, PALETTE.eddaHairSilver); // búi tóc sau
    // Gậy liễu chống phía trước
    fillRect(png, cx - 9, oy + 26, 2, 32, PALETTE.eddaWillowWood);
    fillRect(png, cx - 11, oy + 27, 2, 3, PALETTE.eddaBellGold);
  } else if (dir === 'right') {
    // Nghiêng phải
    fillRect(png, cx - 6, torsoY - 2, 11, 14, PALETTE.eddaCloakPlum);
    fillRect(png, cx - 6, torsoY - 1, 4, 10, PALETTE.eddaCloakShadow);
    // Đầu
    fillRect(png, cx - 1, headY, 7, 7, PALETTE.eddaSkin);
    fillRect(png, cx - 3, headY - 3, 9, 5, PALETTE.eddaHairSilver);
    fillRect(png, cx - 5, headY - 4, 4, 4, PALETTE.eddaHairSilver);
    // Gậy liễu phía trước
    fillRect(png, cx + 8, oy + 26, 2, 32, PALETTE.eddaWillowWood);
    fillRect(png, cx + 10, oy + 27, 2, 3, PALETTE.eddaBellGold);
  }
}

// =============================================================================
// KHỞI TẠO BỘ VẼ CHO NERIS — THẦY THUỐC THẢO MỘC
// =============================================================================
function drawNerisFrame(png, ox, oy, dir, frameIdx, isWalk) {
  const cx = ox + 32;
  const cy = oy + 58;

  let bobY = 0;
  let legOffset = 0;
  if (isWalk) {
    const bobs = [0, -1, 0, 1];
    bobY = bobs[frameIdx % 4];
    legOffset = (frameIdx === 1 ? -2 : (frameIdx === 3 ? 2 : 0));
  } else {
    bobY = (frameIdx === 1 || frameIdx === 2) ? -0.5 : 0;
  }

  const torsoY = oy + 38 + bobY;
  const headY = oy + 27 + bobY;

  // 1. Chân & Ủng đi rừng
  if (dir === 'down' || dir === 'up') {
    fillRect(png, cx - 5 + legOffset, cy - 6, 3, 4, PALETTE.nerisBoots);
    fillRect(png, cx + 2 - legOffset, cy - 6, 3, 4, PALETTE.nerisBoots);
    fillRect(png, cx - 5 + legOffset, cy - 2, 4, 2, PALETTE.outline);
    fillRect(png, cx + 2 - legOffset, cy - 2, 4, 2, PALETTE.outline);
  } else if (dir === 'left') {
    fillRect(png, cx - 3 + legOffset, cy - 6, 4, 6, PALETTE.nerisBoots);
  } else if (dir === 'right') {
    fillRect(png, cx - 1 + legOffset, cy - 6, 4, 6, PALETTE.nerisBoots);
  }

  // 2. Váy & Tạp dề xanh ngọc lục bảo (Emerald Herbalist Apron)
  if (dir === 'down') {
    // Váy áo ngà bên trong
    fillRect(png, cx - 6, torsoY, 12, 13, PALETTE.nerisBlouseIvory);
    // Tạp dề xanh ngọc lục bảo che ngực & thân
    fillRect(png, cx - 5, torsoY + 2, 10, 11, PALETTE.nerisApronGreen);
    fillRect(png, cx - 4, torsoY + 3, 8, 8, PALETTE.nerisApronHighlight);
    // Thắt lưng dây da
    fillRect(png, cx - 6, torsoY + 7, 12, 2, PALETTE.nerisSatchelBrown);

    // Túi đựng thảo dược bên hông trái (Herb Satchel)
    fillRect(png, cx - 9, torsoY + 7, 4, 5, PALETTE.nerisSatchelBrown);
    // Nhánh thảo dược xanh tươi nhô ra khỏi túi
    setPixel(png, cx - 9, torsoY + 6, PALETTE.nerisHerbLeaf);
    setPixel(png, cx - 8, torsoY + 5, PALETTE.nerisHerbBright);
    setPixel(png, cx - 7, torsoY + 6, PALETTE.nerisHerbLeaf);

    // Lọ thuốc thủy tinh bên hông phải (Potion Vials)
    fillRect(png, cx + 6, torsoY + 8, 2, 3, PALETTE.nerisPotionCyan);
    setPixel(png, cx + 6, torsoY + 7, PALETTE.outline); // nút bần
    fillRect(png, cx + 8, torsoY + 8, 2, 3, PALETTE.nerisPotionAmber);
    setPixel(png, cx + 8, torsoY + 7, PALETTE.outline);

    // 3. Cổ, Mặt & Mái tóc hạt dẻ buộc bím
    fillRect(png, cx - 2, headY + 8, 4, 2, PALETTE.nerisSkinShadow);
    fillRect(png, cx - 4, headY, 8, 8, PALETTE.nerisSkin);
    // Má hồng nhẹ nhàng
    setPixel(png, cx - 3, headY + 5, PALETTE.nerisBlush);
    setPixel(png, cx + 2, headY + 5, PALETTE.nerisBlush);
    // Đôi mắt ấm áp
    setPixel(png, cx - 2, headY + 3, PALETTE.shadowDark);
    setPixel(png, cx + 1, headY + 3, PALETTE.shadowDark);
    // Mái tóc nâu hạt dẻ
    fillRect(png, cx - 5, headY - 2, 10, 4, PALETTE.nerisHairAuburn);
    fillRect(png, cx - 4, headY - 1, 8, 2, PALETTE.nerisHairHighlight);
    // Hai lọn tóc tết thấp buông nhẹ hai bên vai
    fillRect(png, cx - 6, headY + 4, 2, 6, PALETTE.nerisHairAuburn);
    fillRect(png, cx + 4, headY + 4, 2, 6, PALETTE.nerisHairAuburn);
    setPixel(png, cx - 6, headY + 9, PALETTE.nerisApronGreen); // nơ buộc tóc
    setPixel(png, cx + 5, headY + 9, PALETTE.nerisApronGreen);

    // 4. Đôi tay cầm bát giã thảo dược nhỏ
    fillRect(png, cx - 2, torsoY + 8, 4, 3, PALETTE.eddaWillowWood); // bát gỗ
    setPixel(png, cx - 1, torsoY + 8, PALETTE.nerisHerbLeaf);        // lá thuốc xanh
    fillRect(png, cx - 4, torsoY + 7, 2, 2, PALETTE.nerisSkin);       // bàn tay
    fillRect(png, cx + 2, torsoY + 7, 2, 2, PALETTE.nerisSkin);
  } else if (dir === 'up') {
    // Nhìn từ sau lưng
    fillRect(png, cx - 6, torsoY, 12, 13, PALETTE.nerisBlouseShadow);
    fillRect(png, cx - 5, torsoY + 2, 10, 11, PALETTE.nerisApronShadow);
    // Dây nơ buộc tạp dề sau lưng
    fillRect(png, cx - 2, torsoY + 7, 4, 2, PALETTE.nerisApronHighlight);
    // Tóc bím sau gáy
    fillRect(png, cx - 5, headY - 2, 10, 8, PALETTE.nerisHairAuburn);
    fillRect(png, cx - 2, headY + 6, 4, 5, PALETTE.nerisHairShadow);
  } else if (dir === 'left') {
    // Nhìn nghiêng trái
    fillRect(png, cx - 5, torsoY, 10, 13, PALETTE.nerisApronGreen);
    fillRect(png, cx - 4, torsoY + 1, 6, 10, PALETTE.nerisApronHighlight);
    // Khuôn mặt
    fillRect(png, cx - 5, headY, 7, 8, PALETTE.nerisSkin);
    fillRect(png, cx - 5, headY - 2, 9, 4, PALETTE.nerisHairAuburn);
    setPixel(png, cx - 3, headY + 3, PALETTE.shadowDark);
    setPixel(png, cx - 4, headY + 5, PALETTE.nerisBlush);
    // Bím tóc
    fillRect(png, cx + 1, headY + 3, 2, 7, PALETTE.nerisHairAuburn);
    // Túi thảo dược phía trước
    fillRect(png, cx - 7, torsoY + 6, 4, 5, PALETTE.nerisSatchelBrown);
    setPixel(png, cx - 7, torsoY + 5, PALETTE.nerisHerbBright);
  } else if (dir === 'right') {
    // Nhìn nghiêng phải
    fillRect(png, cx - 5, torsoY, 10, 13, PALETTE.nerisApronGreen);
    fillRect(png, cx - 2, torsoY + 1, 6, 10, PALETTE.nerisApronHighlight);
    // Khuôn mặt
    fillRect(png, cx - 2, headY, 7, 8, PALETTE.nerisSkin);
    fillRect(png, cx - 4, headY - 2, 9, 4, PALETTE.nerisHairAuburn);
    setPixel(png, cx + 2, headY + 3, PALETTE.shadowDark);
    setPixel(png, cx + 3, headY + 5, PALETTE.nerisBlush);
    // Bím tóc
    fillRect(png, cx - 3, headY + 3, 2, 7, PALETTE.nerisHairAuburn);
    // Lọ thuốc phía trước
    fillRect(png, cx + 3, torsoY + 6, 2, 4, PALETTE.nerisPotionCyan);
  }
}

// =============================================================================
// VẼ CHÂN DUNG HỘI THOẠI 64x64 PX (PORTRAIT)
// =============================================================================
function drawPortrait(npcId) {
  const png = new PNG({ width: 64, height: 64 });

  // Khung đồng cổ (Antique Bronze Frame)
  fillRect(png, 0, 0, 64, 64, PALETTE.shadowDark);
  fillRect(png, 2, 2, 60, 60, PALETTE.bronzeDark);
  fillRect(png, 3, 3, 58, 58, PALETTE.bronzeMid);
  fillRect(png, 4, 4, 56, 56, PALETTE.bronzeDark);
  fillRect(png, 5, 5, 54, 54, [21, 27, 36, 255]); // Nền chân dung tối màu

  // 4 góc khung kim loại chạm khắc đồng vàng
  const corners = [[3, 3], [57, 3], [3, 57], [57, 57]];
  for (const [cx, cy] of corners) {
    fillRect(png, cx - 1, cy - 1, 4, 4, PALETTE.bronzeLight);
    setPixel(png, cx, cy, PALETTE.bronzeGleam);
  }

  const cx = 32;

  if (npcId === 'garth') {
    // Garth Portrait: Chiến binh râu bạc, giáp sắt, quàng khăn da
    // Giáp vai & ngực
    fillRect(png, 14, 44, 36, 15, PALETTE.garthLeatherTunic);
    fillRect(png, 18, 42, 28, 12, PALETTE.garthArmorIron);
    fillRect(png, 22, 43, 20, 6, PALETTE.garthArmorHighlight);
    // Mũi giáo sau lưng
    fillRect(png, 48, 12, 3, 36, PALETTE.garthSpearWood);
    fillRect(png, 47, 8, 5, 6, PALETTE.garthSpearIron);

    // Khuôn mặt
    fillRect(png, 21, 20, 22, 22, PALETTE.garthSkin);
    // Mái tóc hoa râm
    fillRect(png, 19, 14, 26, 9, PALETTE.garthHair);
    fillRect(png, 20, 15, 8, 3, PALETTE.garthBeardSilver); // vệt bạc thái dương
    // Bộ râu quai nón bạc oai vệ
    fillRect(png, 19, 31, 26, 12, PALETTE.garthBeardSilver);
    fillRect(png, 23, 36, 18, 6, PALETTE.garthBeardShadow);
    // Mắt & lông mày rậm
    fillRect(png, 24, 23, 4, 2, PALETTE.garthHair);
    fillRect(png, 36, 23, 4, 2, PALETTE.garthHair);
    setPixel(png, 25, 26, PALETTE.shadowDark);
    setPixel(png, 38, 26, PALETTE.shadowDark);
  } else if (npcId === 'edda') {
    // Edda Portrait: Bà lão giữ chuông hiền từ, áo mận chín, tóc búi bạc
    // Áo choàng mận chín
    fillRect(png, 14, 43, 36, 16, PALETTE.eddaCloakPlum);
    fillRect(png, 18, 42, 28, 12, PALETTE.eddaCloakHighlight);
    // Bùa chuông đồng trước ngực
    fillRect(png, 29, 45, 6, 8, PALETTE.eddaBellGold);
    fillRect(png, 31, 47, 2, 4, PALETTE.eddaBellHighlight);

    // Khuôn mặt phúc hậu
    fillRect(png, 22, 22, 20, 20, PALETTE.eddaSkin);
    // Nếp nhăn khóe mắt
    fillRect(png, 23, 29, 4, 1, PALETTE.eddaSkinWrinkle);
    fillRect(png, 37, 29, 4, 1, PALETTE.eddaSkinWrinkle);
    // Mái tóc bạc búi cao
    fillRect(png, 18, 14, 28, 11, PALETTE.eddaHairSilver);
    fillRect(png, 25, 8, 14, 8, PALETTE.eddaHairSilver);
    fillRect(png, 27, 9, 10, 5, PALETTE.eddaHairShadow);
    // Cành liễu xanh cài tóc
    fillRect(png, 38, 11, 4, 2, PALETTE.nerisHerbLeaf);
    setPixel(png, 41, 10, PALETTE.nerisHerbBright);
    // Đôi mắt cười hiền hòa
    fillRect(png, 26, 27, 3, 2, PALETTE.shadowDark);
    fillRect(png, 35, 27, 3, 2, PALETTE.shadowDark);
  } else if (npcId === 'neris') {
    // Neris Portrait: Thầy thuốc trẻ, má ửng hồng, bím tóc nâu hạt dẻ
    // Áo trắng & tạp dề xanh ngọc lục bảo
    fillRect(png, 16, 44, 32, 15, PALETTE.nerisBlouseIvory);
    fillRect(png, 20, 43, 24, 14, PALETTE.nerisApronGreen);
    fillRect(png, 23, 44, 18, 10, PALETTE.nerisApronHighlight);
    // Nhánh lá thảo dược cài trước ngực
    fillRect(png, 29, 46, 5, 2, PALETTE.nerisHerbLeaf);
    setPixel(png, 33, 45, PALETTE.nerisHerbBright);

    // Khuôn mặt thanh tú
    fillRect(png, 23, 20, 18, 22, PALETTE.nerisSkin);
    // Má hồng
    fillRect(png, 24, 31, 4, 2, PALETTE.nerisBlush);
    fillRect(png, 36, 31, 4, 2, PALETTE.nerisBlush);
    // Đôi mắt to sáng long lanh
    fillRect(png, 26, 26, 3, 3, PALETTE.shadowDark);
    setPixel(png, 26, 26, [255, 255, 255, 255]);
    fillRect(png, 35, 26, 3, 3, PALETTE.shadowDark);
    setPixel(png, 35, 26, [255, 255, 255, 255]);
    // Mái tóc nâu hạt dẻ mềm mại
    fillRect(png, 20, 13, 24, 10, PALETTE.nerisHairAuburn);
    fillRect(png, 22, 14, 18, 4, PALETTE.nerisHairHighlight);
    // Hai lọn tóc tết buông hai bên
    fillRect(png, 18, 22, 4, 16, PALETTE.nerisHairAuburn);
    fillRect(png, 42, 22, 4, 16, PALETTE.nerisHairAuburn);
    setPixel(png, 19, 36, PALETTE.nerisApronGreen); // nơ xanh
    setPixel(png, 43, 36, PALETTE.nerisApronGreen);
  }

  return png;
}

// =============================================================================
// TẠO SPRITE SHEET VÀ MANIFEST CHO MỖI NHÂN VẬT
// =============================================================================
const NPCS = [
  { id: 'garth', name: 'Garth', title: 'Người gác cổng làng Bellhollow', draw: drawGarthFrame },
  { id: 'edda', name: 'Edda', title: 'Bà lão giữ chuông làng Bellhollow', draw: drawEddaFrame },
  { id: 'neris', name: 'Neris', title: 'Thầy thuốc thảo mộc làng Bellhollow', draw: drawNerisFrame }
];

const DIRECTIONS = ['down', 'up', 'left', 'right'];

for (const npc of NPCS) {
  const dirPath = path.join(VILLAGERS_BASE, npc.id);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // 1. Tạo Sheet IDLE: 4 frames/hướng x 4 hướng = 16 frames (256x256 px)
  const idleSheet = new PNG({ width: 256, height: 256 });
  for (let row = 0; row < 4; row++) {
    const dir = DIRECTIONS[row];
    for (let col = 0; col < 4; col++) {
      npc.draw(idleSheet, col * 64, row * 64, dir, col, false);
    }
  }
  const idlePath = path.join(dirPath, `${npc.id}_idle.png`);
  fs.writeFileSync(idlePath, PNG.sync.write(idleSheet));
  console.log(`[Generated] ${npc.name} Idle Sheet: ${idlePath} (256x256)`);

  // 2. Tạo Sheet WALK: 4 frames/hướng x 4 hướng = 16 frames (256x256 px)
  const walkSheet = new PNG({ width: 256, height: 256 });
  for (let row = 0; row < 4; row++) {
    const dir = DIRECTIONS[row];
    for (let col = 0; col < 4; col++) {
      npc.draw(walkSheet, col * 64, row * 64, dir, col, true);
    }
  }
  const walkPath = path.join(dirPath, `${npc.id}_walk.png`);
  fs.writeFileSync(walkPath, PNG.sync.write(walkSheet));
  console.log(`[Generated] ${npc.name} Walk Sheet: ${walkPath} (256x256)`);

  // 3. Tạo Portrait 64x64
  const portrait = drawPortrait(npc.id);
  const portraitPath = path.join(dirPath, `${npc.id}_portrait.png`);
  fs.writeFileSync(portraitPath, PNG.sync.write(portrait));
  console.log(`[Generated] ${npc.name} Portrait: ${portraitPath} (64x64)`);

  // 4. Tạo Bảng ảnh Preview tổng hợp (Composite Preview Sheet - 512x256 px)
  const preview = new PNG({ width: 512, height: 256 });
  // Nền xám đen studio
  fillRect(preview, 0, 0, 512, 256, [24, 28, 34, 255]);
  // Khung ngăn cách
  for (let x = 0; x < 512; x++) setPixel(preview, x, 68, PALETTE.bronzeDark);

  // Gắn Portrait vào góc trên trái
  for (let y = 0; y < 64; y++) {
    for (let x = 0; x < 64; x++) {
      const idx = (64 * y + x) << 2;
      setPixel(preview, x + 4, y + 2, [
        portrait.data[idx],
        portrait.data[idx + 1],
        portrait.data[idx + 2],
        portrait.data[idx + 3]
      ]);
    }
  }

  // 4 hướng Idle hàng trên (x = 76, 144, 212, 280)
  for (let d = 0; d < 4; d++) {
    npc.draw(preview, 76 + d * 64, 2, DIRECTIONS[d], 0, false);
  }

  // 4 hướng Walk hàng dưới (x = 76..280, y = 80..200)
  for (let d = 0; d < 4; d++) {
    npc.draw(preview, 76 + d * 64, 80, DIRECTIONS[d], 1, true);
    npc.draw(preview, 76 + d * 64, 150, DIRECTIONS[d], 3, true);
  }

  const previewPath = path.join(dirPath, `${npc.id}_preview.png`);
  fs.writeFileSync(previewPath, PNG.sync.write(preview));
  console.log(`[Generated] ${npc.name} Preview Sheet: ${previewPath} (512x256)`);

  // 5. Tạo Manifest JSON chi tiết
  const manifest = {
    npcId: npc.id,
    npcName: npc.name,
    title: npc.title,
    version: "1.2.0",
    commandRef: "C4-12-08",
    visualDirection: "Direction A — Dark Woodland Pixel Art",
    frameCell: {
      width: 64,
      height: 64,
      footAnchor: {
        x: 32,
        y: 58,
        originX: 0.5,
        originY: 0.90625
      },
      collisionBody: {
        width: 14,
        height: 8,
        offsetX: 25,
        offsetY: 50
      }
    },
    directionOrder: ["DOWN", "UP", "LEFT", "RIGHT"],
    rowMapping: {
      DOWN: 0,
      UP: 1,
      LEFT: 2,
      RIGHT: 3
    },
    sheets: [
      {
        id: `${npc.id}_idle`,
        file: `${npc.id}_idle.png`,
        frameWidth: 64,
        frameHeight: 64,
        framesPerDirection: 4,
        totalFrames: 16,
        fps: 6,
        loop: true,
        animationsByDirection: {
          DOWN: { key: `npc_${npc.id}_idle_down`, frames: [0, 1, 2, 3], fps: 6, repeat: -1 },
          UP: { key: `npc_${npc.id}_idle_up`, frames: [4, 5, 6, 7], fps: 6, repeat: -1 },
          LEFT: { key: `npc_${npc.id}_idle_left`, frames: [8, 9, 10, 11], fps: 6, repeat: -1 },
          RIGHT: { key: `npc_${npc.id}_idle_right`, frames: [12, 13, 14, 15], fps: 6, repeat: -1 }
        }
      },
      {
        id: `${npc.id}_walk`,
        file: `${npc.id}_walk.png`,
        frameWidth: 64,
        frameHeight: 64,
        framesPerDirection: 4,
        totalFrames: 16,
        fps: 8,
        loop: true,
        animationsByDirection: {
          DOWN: { key: `npc_${npc.id}_walk_down`, frames: [0, 1, 2, 3], fps: 8, repeat: -1 },
          UP: { key: `npc_${npc.id}_walk_up`, frames: [4, 5, 6, 7], fps: 8, repeat: -1 },
          LEFT: { key: `npc_${npc.id}_walk_left`, frames: [8, 9, 10, 11], fps: 8, repeat: -1 },
          RIGHT: { key: `npc_${npc.id}_walk_right`, frames: [12, 13, 14, 15], fps: 8, repeat: -1 }
        }
      }
    ],
    portrait: {
      file: `${npc.id}_portrait.png`,
      width: 64,
      height: 64,
      frameStyle: "Antique Bronze"
    }
  };

  const manifestPath = path.join(dirPath, `${npc.id}_animation_manifest.json`);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`[Generated] ${npc.name} Animation Manifest: ${manifestPath}\n`);
}

console.log('✅ HOÀN TẤT KHỞI TẠO TÀI NGUYÊN CHO 3 NPC DÂN LÀNG BELLHOLLOW!');
