import * as Phaser from 'phaser';

export const HUD_ICON_HEALTH = 'hud_icon_health';
export const HUD_ICON_STAMINA = 'hud_icon_stamina';
export const HUD_ICON_OIL = 'hud_icon_oil';
export const HUD_ICON_COMPOSURE = 'hud_icon_composure';
export const HUD_ICON_WOOD = 'hud_icon_wood';

// UI Frame Caching Keys (V15-FIX-08)
export const UI_TEX_QC_SLOT_HOVER = 'ui_tex_qc_slot_hover';
export const UI_TEX_QC_SLOT_READY = 'ui_tex_qc_slot_ready';
export const UI_TEX_QC_SLOT_IDLE = 'ui_tex_qc_slot_idle';

export const UI_TEX_CRAFT_TILE_SELECTED = 'ui_tex_craft_tile_selected';
export const UI_TEX_CRAFT_TILE_READY = 'ui_tex_craft_tile_ready';
export const UI_TEX_CRAFT_TILE_LOCKED = 'ui_tex_craft_tile_locked';
export const UI_TEX_CRAFT_TILE_IDLE = 'ui_tex_craft_tile_idle';

/**
 * HOLLOW WOODS V1.3 — BỘ SINH BIỂU TƯỢNG THUỘC TÍNH HUD CHUẨN PIXEL ART (16×16 PX)
 * C4-13-15: Thay thế các khối chữ nhật/chữ thập thô sơ bằng 4 icon sắc nét:
 * 1. Sinh Lực: Trái tim đỏ tươi viền tối, phản quang trắng hồng.
 * 2. Thể Lực: Tia sấm sét vàng hoàng kim sắc nhọn, gờ phản quang trắng vàng.
 * 3. Dầu Đèn: Đèn lồng / ngọn lửa cam hổ phách ấm áp, tim lửa vàng và đế đèn kim loại.
 * 4. Bình Tâm: Con mắt tinh thần / pha lê tâm trí tím thạch anh, con ngươi phát quang và điểm sáng phản chiếu.
 */

// Định nghĩa bảng mã màu Pixel Art 16x16
// . = Trong suốt
const HEALTH_PALETTE: Record<string, number | null> = {
  '.': null,
  'B': 0x2b0609, // Viền tối đậm
  'D': 0x962d22, // Đỏ sẫm chuyển bóng
  'R': 0xe74c3c, // Đỏ tươi thân tim
  'P': 0xff7675, // Hồng phấn bóng sáng
  'W': 0xffffff  // Điểm sáng phản quang
};

const HEALTH_GRID: string[] = [
  '................',
  '..BBB....BBB....',
  '.BRRRB..BRRRB...',
  'BRWWRRBBRRRRRB..',
  'BRWRRRRRRRRRRB..',
  'BRRRRRRRRRRRRB..',
  'BRRRRRRRRRRRDB..',
  '.BRRRRRRRRRDB...',
  '.BRRRRRRRRDB....',
  '..BRRRRRRDB.....',
  '..BRRRRRDB......',
  '...BRRRDB.......',
  '...BRRDB........',
  '....BDB.........',
  '.....B..........',
  '................'
];

const STAMINA_PALETTE: Record<string, number | null> = {
  '.': null,
  'B': 0x362402, // Viền tối
  'D': 0xb7950b, // Vàng sẫm đổ bóng
  'Y': 0xf1c40f, // Vàng tươi hoàng kim
  'L': 0xf9e79f, // Vàng nhạt viền sáng
  'W': 0xffffff  // Điểm phản quang chóp
};

const STAMINA_GRID: string[] = [
  '.......BB.......',
  '......BWYB......',
  '.....BWYYB......',
  '....BWYYB.......',
  '...BWYYB........',
  '..BWYYYYYBB.....',
  '.BWYYYYYYYDB....',
  '..BBBWYYBBBB....',
  '....BWYYB.......',
  '...BWYYB........',
  '..BWYYB.........',
  '.BWYYB..........',
  '.BYYB...........',
  '..BB............',
  '................',
  '................'
];

const OIL_PALETTE: Record<string, number | null> = {
  '.': null,
  'B': 0x2a1403, // Viền tối
  'D': 0xa04000, // Cam cháy đổ bóng
  'O': 0xe67e22, // Cam hổ phách
  'Y': 0xf39c12, // Vàng ấm tim lửa
  'W': 0xfff5d7, // Trắng ấm phản quang
  'M': 0x3d3d3d, // Đế đèn kim loại
  'H': 0x636e72  // Viền sáng kim loại
};

const OIL_GRID: string[] = [
  '......BB........',
  '.....BWYB.......',
  '....BWYOB.......',
  '....BWYOB.......',
  '...BWYYODB......',
  '..BWWYYODB......',
  '.BWYYYOODDB.....',
  '.BWYYOOODDB.....',
  'BWYYOOOODDB.....',
  'BWYOOOODDDB.....',
  'BYOOOODDDB......',
  '.BOOODDDB.......',
  '..BBBBBB........',
  '..BMHMMB........',
  '.BBBBBBBB.......',
  '................'
];

const COMPOSURE_PALETTE: Record<string, number | null> = {
  '.': null,
  'B': 0x1f0b2b, // Viền tối
  'D': 0x5b2c6f, // Tím sẫm
  'P': 0x9b59b6, // Tím thạch anh
  'C': 0xa29bfe, // Con ngươi phát quang
  'W': 0xffffff  // Điểm sáng phản chiếu
};

const COMPOSURE_GRID: string[] = [
  '................',
  '......BB........',
  '....BBPPBB......',
  '..BBPPPPPPBB....',
  '.BPPPCCCCPPPB...',
  'BPPCWWCCCCPPB...',
  'BPCWCCCCCCCDB...',
  'BPCCCCCCCCCDDB..',
  'BPCCCCCCCCDDDB..',
  'BPPCCCCCCDDPB...',
  '.BPPPDDDDPPPB...',
  '..BBPPPPPPBB....',
  '....BBPPBB......',
  '......BB........',
  '................',
  '................'
];

// V152-06A: Biểu tượng Khúc Gỗ Khô (16x16 Pixel Art) triệt tiêu ô vuông trắng □ trên hotbar
const WOOD_PALETTE: Record<string, number | null> = {
  '.': null,
  'B': 0x241208, // Viền vỏ cây sẫm
  'D': 0x5a3818, // Vỏ thân cây
  'M': 0x8a5528, // Mặt gỗ nâu ấm
  'L': 0xb87d45, // Thớ gỗ sáng
  'C': 0xd9a46a, // Vòng năm gỗ
  'W': 0xf5cf9b  // Tâm lõi gỗ sáng
};

const WOOD_GRID: string[] = [
  '................',
  '....BBBBB.......',
  '...BLLLLLBBD....',
  '..BLCCCCCLDDDD..',
  '..BLCWWWCLDMMD..',
  '..BLCWWWCLDMMDB.',
  '..BLCCCCCLDMMDB.',
  '..BLLLLLBBDMMDB.',
  '...BBBBBDDDMMDB.',
  '..BBBBBBDDDMMDB.',
  '.BLLLLLBBDDMMDB.',
  'BLCCCCCLDDMMDDB.',
  'BLCWWWCLDDMMDB..',
  'BLCCCCCLDDMDDB..',
  '.BLLLLLBBDMDB...',
  '..BBBBBB..BB....'
];

export class HUDIconGenerator {
  /**
   * Tạo texture 16×16 px chuẩn Nearest-Neighbor từ bản đồ pixel
   */
  public static generateIconTexture(
    scene: Phaser.Scene,
    key: string,
    grid: string[],
    palette: Record<string, number | null>
  ): void {
    if (scene.textures.exists(key)) return;

    const gfx = scene.make.graphics({ x: 0, y: 0 });
    for (let y = 0; y < 16; y++) {
      const row = grid[y] || '................';
      for (let x = 0; x < 16; x++) {
        const char = row[x] || '.';
        const color = palette[char];
        if (color !== null && color !== undefined) {
          gfx.fillStyle(color, 1);
          gfx.fillRect(x, y, 1, 1);
        }
      }
    }

    gfx.generateTexture(key, 16, 16);
    gfx.destroy();

    // Giữ chế độ lọc Nearest-Neighbor cho đồ họa Pixel Art sắc nét
    if (scene.textures.exists(key)) {
      scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
  }

  /**
   * Khởi tạo toàn bộ 4 icon thuộc tính cho HUD
   */
  public static generateAllHUDIcons(scene: Phaser.Scene): void {
    HUDIconGenerator.generateIconTexture(scene, HUD_ICON_HEALTH, HEALTH_GRID, HEALTH_PALETTE);
    HUDIconGenerator.generateIconTexture(scene, HUD_ICON_STAMINA, STAMINA_GRID, STAMINA_PALETTE);
    HUDIconGenerator.generateIconTexture(scene, HUD_ICON_OIL, OIL_GRID, OIL_PALETTE);
    HUDIconGenerator.generateIconTexture(scene, HUD_ICON_COMPOSURE, COMPOSURE_GRID, COMPOSURE_PALETTE);
    HUDIconGenerator.generateIconTexture(scene, HUD_ICON_WOOD, WOOD_GRID, WOOD_PALETTE);
  }

  /**
   * Vẽ trực tiếp 4 icon pixel lên đối tượng Graphics tại vị trí quy định
   */
  public static drawIconsToGraphics(
    g: Phaser.GameObjects.Graphics,
    startX: number = 18,
    startYList: number[] = [28, 44, 60, 76]
  ): void {
    g.clear();

    const configs = [
      { grid: HEALTH_GRID, palette: HEALTH_PALETTE, y: startYList[0] },
      { grid: STAMINA_GRID, palette: STAMINA_PALETTE, y: startYList[1] },
      { grid: OIL_GRID, palette: OIL_PALETTE, y: startYList[2] },
      { grid: COMPOSURE_GRID, palette: COMPOSURE_PALETTE, y: startYList[3] }
    ];

    for (const cfg of configs) {
      for (let y = 0; y < 16; y++) {
        const row = cfg.grid[y] || '................';
        for (let x = 0; x < 16; x++) {
          const char = row[x] || '.';
          const color = cfg.palette[char];
          if (color !== null && color !== undefined) {
            g.fillStyle(color, 1);
            g.fillRect(startX + x, cfg.y + y, 1, 1);
          }
        }
      }
    }
  }

  /**
   * Tạo sẵn và lưu vào Texture Cache các khung ô UI cho QuickCraftSidebar & CraftingModal (V15-FIX-08)
   * Giúp tránh việc vẽ lại (redraw) bằng Graphics mỗi frame hoặc mỗi khi hover/scroll.
   */
  public static generateUIFrameTextures(scene: Phaser.Scene): void {
    // 1. QuickCraftSidebar Slots (36x36)
    const qcSize = 36;
    if (!scene.textures.exists(UI_TEX_QC_SLOT_HOVER)) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x2d1f14, 0.98);
      g.fillRoundedRect(0, 0, qcSize, qcSize, 4);
      g.lineStyle(1.8, 0xf39c12, 1.0);
      g.strokeRoundedRect(0, 0, qcSize, qcSize, 4);
      g.fillStyle(0xf7f0dd, 0.98);
      g.fillRoundedRect(2, 2, qcSize - 4, qcSize - 4, 3);
      g.generateTexture(UI_TEX_QC_SLOT_HOVER, qcSize, qcSize);
      g.destroy();
      if (scene.textures.exists(UI_TEX_QC_SLOT_HOVER)) {
        scene.textures.get(UI_TEX_QC_SLOT_HOVER).setFilter(Phaser.Textures.FilterMode.NEAREST);
      }
    }

    if (!scene.textures.exists(UI_TEX_QC_SLOT_READY)) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x18110b, 0.92);
      g.fillRoundedRect(0, 0, qcSize, qcSize, 4);
      g.lineStyle(1.2, 0x2ecc71, 0.9);
      g.strokeRoundedRect(0, 0, qcSize, qcSize, 4);
      g.fillStyle(0xeadecc, 0.92);
      g.fillRoundedRect(2, 2, qcSize - 4, qcSize - 4, 3);
      g.lineStyle(0.8, 0x8c7853, 0.35);
      g.strokeRoundedRect(2, 2, qcSize - 4, qcSize - 4, 3);
      g.generateTexture(UI_TEX_QC_SLOT_READY, qcSize, qcSize);
      g.destroy();
      if (scene.textures.exists(UI_TEX_QC_SLOT_READY)) {
        scene.textures.get(UI_TEX_QC_SLOT_READY).setFilter(Phaser.Textures.FilterMode.NEAREST);
      }
    }

    if (!scene.textures.exists(UI_TEX_QC_SLOT_IDLE)) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x18110b, 0.92);
      g.fillRoundedRect(0, 0, qcSize, qcSize, 4);
      g.lineStyle(1.2, 0x5c4224, 0.85);
      g.strokeRoundedRect(0, 0, qcSize, qcSize, 4);
      g.fillStyle(0xdfd3b6, 0.92);
      g.fillRoundedRect(2, 2, qcSize - 4, qcSize - 4, 3);
      g.lineStyle(0.8, 0x8c7853, 0.35);
      g.strokeRoundedRect(2, 2, qcSize - 4, qcSize - 4, 3);
      g.generateTexture(UI_TEX_QC_SLOT_IDLE, qcSize, qcSize);
      g.destroy();
      if (scene.textures.exists(UI_TEX_QC_SLOT_IDLE)) {
        scene.textures.get(UI_TEX_QC_SLOT_IDLE).setFilter(Phaser.Textures.FilterMode.NEAREST);
      }
    }

    // 2. CraftingModal Grid Tiles (44x44)
    const ctSize = 44;
    if (!scene.textures.exists(UI_TEX_CRAFT_TILE_SELECTED)) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xfbf5e6, 0.98);
      g.fillRoundedRect(0, 0, ctSize, ctSize, 4);
      g.lineStyle(2, 0xf1c40f, 1.0);
      g.strokeRoundedRect(0, 0, ctSize, ctSize, 4);
      g.generateTexture(UI_TEX_CRAFT_TILE_SELECTED, ctSize, ctSize);
      g.destroy();
      if (scene.textures.exists(UI_TEX_CRAFT_TILE_SELECTED)) {
        scene.textures.get(UI_TEX_CRAFT_TILE_SELECTED).setFilter(Phaser.Textures.FilterMode.NEAREST);
      }
    }

    if (!scene.textures.exists(UI_TEX_CRAFT_TILE_READY)) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xdfd3b6, 0.95);
      g.fillRoundedRect(0, 0, ctSize, ctSize, 4);
      g.lineStyle(1.2, 0xd4af37, 0.9);
      g.strokeRoundedRect(0, 0, ctSize, ctSize, 4);
      g.fillStyle(0x2ecc71, 1.0);
      g.fillCircle(ctSize - 4, 4, 2.5);
      g.generateTexture(UI_TEX_CRAFT_TILE_READY, ctSize, ctSize);
      g.destroy();
      if (scene.textures.exists(UI_TEX_CRAFT_TILE_READY)) {
        scene.textures.get(UI_TEX_CRAFT_TILE_READY).setFilter(Phaser.Textures.FilterMode.NEAREST);
      }
    }

    if (!scene.textures.exists(UI_TEX_CRAFT_TILE_LOCKED)) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x140e09, 0.95);
      g.fillRoundedRect(0, 0, ctSize, ctSize, 4);
      g.lineStyle(1.2, 0x3d2b1a, 0.85);
      g.strokeRoundedRect(0, 0, ctSize, ctSize, 4);
      g.generateTexture(UI_TEX_CRAFT_TILE_LOCKED, ctSize, ctSize);
      g.destroy();
      if (scene.textures.exists(UI_TEX_CRAFT_TILE_LOCKED)) {
        scene.textures.get(UI_TEX_CRAFT_TILE_LOCKED).setFilter(Phaser.Textures.FilterMode.NEAREST);
      }
    }

    if (!scene.textures.exists(UI_TEX_CRAFT_TILE_IDLE)) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x26190f, 0.92);
      g.fillRoundedRect(0, 0, ctSize, ctSize, 4);
      g.lineStyle(1, 0x523b26, 0.85);
      g.strokeRoundedRect(0, 0, ctSize, ctSize, 4);
      g.generateTexture(UI_TEX_CRAFT_TILE_IDLE, ctSize, ctSize);
      g.destroy();
      if (scene.textures.exists(UI_TEX_CRAFT_TILE_IDLE)) {
        scene.textures.get(UI_TEX_CRAFT_TILE_IDLE).setFilter(Phaser.Textures.FilterMode.NEAREST);
      }
    }
  }
}
