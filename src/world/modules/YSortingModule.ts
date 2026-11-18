/**
 * HOLLOW WOODS V1.4 — TILED PIPELINE
 * MODULE 1: Y-SORTING MODULE (TỰ ĐỘNG PHÂN LỚP HIỂN THỊ TRƯỚC - SAU THEO TRỤC Y)
 * 
 * Kiểm soát qua: TILED_PIPELINE_CONFIG.enableYSortingModule
 */

import { TILED_PIPELINE_CONFIG } from '../../config/tiledPipelineConfig';

export interface YSortable {
  getFootPosition?(): { x: number; y: number };
  y: number;
  depth: number;
  setDepth(depth: number): this;
  originY?: number;
  displayHeight?: number;
}

export class YSortingModule {
  private static instance: YSortingModule;
  private lastLogTime: number = 0;

  public static getInstance(): YSortingModule {
    if (!YSortingModule.instance) {
      YSortingModule.instance = new YSortingModule();
    }
    return YSortingModule.instance;
  }

  /**
   * Tính toán cao độ chân tiếp xúc mặt đất (Foot Y) của một GameObject
   */
  public calculateFootY(target: YSortable): number {
    if (typeof target.getFootPosition === 'function') {
      const foot = target.getFootPosition();
      if (foot && typeof foot.y === 'number') {
        return foot.y;
      }
    }

    // Nếu là Sprite có origin và displayHeight
    if (typeof target.originY === 'number' && typeof target.displayHeight === 'number') {
      return target.y + (1 - target.originY) * target.displayHeight;
    }

    return target.y;
  }

  /**
   * Phân lớp hiển thị một GameObject duy nhất theo trục Y
   */
  public sortObject(target: YSortable, depthOffset: number = 0): number {
    if (!TILED_PIPELINE_CONFIG.enableYSortingModule) {
      return target.depth;
    }

    const footY = this.calculateFootY(target);
    const targetDepth = Math.floor(footY + depthOffset);

    if (target.depth !== targetDepth) {
      target.setDepth(targetDepth);
    }

    return targetDepth;
  }

  /**
   * Cập nhật Y-Sorting hàng loạt cho danh sách thực thể di động (Player, NPCs, Monsters, Wildlife)
   */
  public updateDynamicEntities(entities: (YSortable | undefined | null)[]): number {
    if (!TILED_PIPELINE_CONFIG.enableYSortingModule) {
      return 0;
    }

    let sortedCount = 0;
    for (let i = 0; i < entities.length; i++) {
      const ent = entities[i];
      if (ent && typeof ent.setDepth === 'function') {
        this.sortObject(ent);
        sortedCount++;
      }
    }

    if (TILED_PIPELINE_CONFIG.debugDrawModuleLogs) {
      const now = Date.now();
      if (now - this.lastLogTime > 3000) {
        this.lastLogTime = now;
        console.log(`[TiledPipeline:YSorting] Sorted ${sortedCount} dynamic entities on depth axis`);
      }
    }

    return sortedCount;
  }

  /**
   * Phân lớp hàng loạt cho danh sách đối tượng tĩnh (Nhà cửa, cây cối, đá tảng) khi khởi tạo bản đồ
   */
  public sortStaticScenery(objects: { gameObject: YSortable; footY?: number; offset?: number }[]): void {
    if (!TILED_PIPELINE_CONFIG.enableYSortingModule) {
      return;
    }

    for (const item of objects) {
      if (!item.gameObject || typeof item.gameObject.setDepth !== 'function') continue;
      const baseFoot = item.footY !== undefined ? item.footY : this.calculateFootY(item.gameObject);
      const targetDepth = Math.floor(baseFoot + (item.offset || 0));
      item.gameObject.setDepth(targetDepth);
    }

    if (TILED_PIPELINE_CONFIG.debugDrawModuleLogs) {
      console.log(`[TiledPipeline:YSorting] Batch sorted ${objects.length} static scenery objects`);
    }
  }
}
