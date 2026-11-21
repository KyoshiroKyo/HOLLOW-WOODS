/**
 * HOLLOW WOODS V1.5.3 — ITEM ICON HELPER & ASSET REGISTRY (BUG-025 / HW-BUG-#7)
 * Cung cấp giải pháp phân giải và kết xuất biểu tượng Pixel Art thật 16x16 cho toàn bộ
 * 43 vật phẩm thực tế trong registry (src/data/items.json).
 * 
 * - Tuyệt đối không dùng emoji, ký tự Unicode hay ô vuông chữ nhật thay thế.
 * - Tương thích 100% với Texture Atlas public/assets/atlases/item_icons_atlas.png & .json
 * - Hỗ trợ ánh xạ ngược các Save/Legacy aliases (item_runed_iron_part, food_root_soup, quest_corrupted_knight_crest)
 */

import * as Phaser from 'phaser';
import itemsData from '../data/items.json';

export const ATLAS_ITEM_ICONS_KEY = 'item_icons_atlas';
export const ATLAS_ITEM_ICONS_PNG = 'assets/atlases/item_icons_atlas.png';
export const ATLAS_ITEM_ICONS_JSON = 'assets/atlases/item_icons_atlas.json';

export interface ItemIconResolution {
  texture: string;
  frame?: string;
  isRealPixelArt: boolean;
}

export class ItemIconHelper {
  // Bảng ánh xạ bí danh lưu trữ lịch sử sang ID vật phẩm chuẩn
  private static readonly ITEM_ALIASES: Record<string, string> = {
    item_runed_iron_part: 'mat_runed_iron',
    food_root_soup: 'food_forest_root_soup',
    quest_corrupted_knight_crest: 'quest_corrupted_crest'
  };

  // Tập hợp 43 Item ID chuẩn trong hệ thống game
  private static readonly KNOWN_ITEM_IDS: Set<string> = new Set(
    (itemsData.items as Array<{ id: string }>).map(it => it.id)
  );

  /**
   * Chuẩn hóa Item ID (xử lý khoảng trắng và ánh xạ bí danh Save cũ)
   */
  public static normalizeItemId(itemId: string): string {
    if (!itemId) return '';
    const trimmed = itemId.trim();
    return this.ITEM_ALIASES[trimmed] || trimmed;
  }

  /**
   * Phân giải texture và frame cho bất kỳ Item ID nào
   */
  public static resolveItemIcon(scene: Phaser.Scene, itemId: string): ItemIconResolution {
    const normId = this.normalizeItemId(itemId);

    // 1. Kiểm tra ưu tiên trong Item Icons Atlas
    if (scene.textures.exists(ATLAS_ITEM_ICONS_KEY)) {
      const atlas = scene.textures.get(ATLAS_ITEM_ICONS_KEY);
      if (atlas.has(normId)) {
        return {
          texture: ATLAS_ITEM_ICONS_KEY,
          frame: normId,
          isRealPixelArt: true
        };
      }
    }

    // 2. Fallback độc lập cho các texture đơn lẻ đã nạp trong PreloadScene
    if (normId === 'mat_runed_iron' && scene.textures.exists('res_runed_iron')) {
      return { texture: 'res_runed_iron', isRealPixelArt: true };
    }
    if (normId === 'res_dry_wood' && scene.textures.exists('hud_icon_wood')) {
      return { texture: 'hud_icon_wood', isRealPixelArt: true };
    }
    if (normId.startsWith('eqp_')) {
      const equipSlot = normId.replace('eqp_', '').split('_')[0];
      const equipTex = `ui_pack_equip_${equipSlot}`;
      if (scene.textures.exists(equipTex)) {
        return { texture: equipTex, isRealPixelArt: true };
      }
    }

    // 3. Fallback an toàn (chống crash nếu thiếu atlas trong môi trường cô lập test)
    if (scene.textures.exists('hud_icon_wood')) {
      return { texture: 'hud_icon_wood', isRealPixelArt: false };
    }

    return { texture: '__DEFAULT', isRealPixelArt: false };
  }

  /**
   * Tạo nhanh một Game Object Image biểu tượng vật phẩm Pixel Art
   */
  public static createItemIconImage(
    scene: Phaser.Scene,
    x: number,
    y: number,
    itemId: string,
    displaySize: number = 22
  ): Phaser.GameObjects.Image {
    const res = this.resolveItemIcon(scene, itemId);
    const img = res.frame
      ? scene.add.image(x, y, res.texture, res.frame)
      : scene.add.image(x, y, res.texture);

    img.setDisplaySize(displaySize, displaySize);
    img.setOrigin(0.5, 0.5);
    return img;
  }

  /**
   * Cập nhật texture & frame của một Image hiện có sang Item ID mới
   */
  public static setItemIconTexture(
    scene: Phaser.Scene,
    image: Phaser.GameObjects.Image,
    itemId: string,
    displaySize?: number
  ): boolean {
    if (!image) return false;
    const res = this.resolveItemIcon(scene, itemId);
    if (res.frame) {
      image.setTexture(res.texture, res.frame);
    } else {
      image.setTexture(res.texture);
    }
    if (displaySize !== undefined) {
      image.setDisplaySize(displaySize, displaySize);
    }
    return res.isRealPixelArt;
  }

  /**
   * Lấy danh sách toàn bộ 43 Item ID trong registry
   */
  public static getAllRegistryItemIds(): string[] {
    return Array.from(this.KNOWN_ITEM_IDS);
  }

  /**
   * Kiểm tra xem một Item ID có thuộc registry chính thức không
   */
  public static isValidItemId(itemId: string): boolean {
    const normId = this.normalizeItemId(itemId);
    return this.KNOWN_ITEM_IDS.has(normId);
  }
}
