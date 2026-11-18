/**
 * HOLLOW WOODS V1.4 — TILED PIPELINE
 * MODULE 2: CULLING OPTIMIZATION MODULE (TỐI ƯU RENDER & CULLING TILEMAP LỚN)
 * 
 * Kiểm soát qua: TILED_PIPELINE_CONFIG.enableCullingOptimization
 */

import * as Phaser from 'phaser';
import { TILED_PIPELINE_CONFIG } from '../../config/tiledPipelineConfig';

export interface CullableItem {
  gameObject: any;
  x: number;
  y: number;
  radius: number;
}

export class CullingOptimizationModule {
  private static instance: CullingOptimizationModule;
  private cullableList: CullableItem[] = [];
  private lastLogTime: number = 0;

  public static getInstance(): CullingOptimizationModule {
    if (!CullingOptimizationModule.instance) {
      CullingOptimizationModule.instance = new CullingOptimizationModule();
    }
    return CullingOptimizationModule.instance;
  }

  /**
   * Đăng ký một GameObject vào hệ thống Culling
   */
  public register(gameObject: any, x?: number, y?: number, radius: number = 80): void {
    if (!gameObject || typeof gameObject.setVisible !== 'function') return;

    const posX = x !== undefined ? x : (gameObject.x || 0);
    const posY = y !== undefined ? y : (gameObject.y || 0);

    this.cullableList.push({
      gameObject,
      x: posX,
      y: posY,
      radius
    });
  }

  /**
   * Xóa toàn bộ danh sách đăng ký culling khi đổi Scene hoặc dọn dẹp
   */
  public clear(): void {
    this.cullableList = [];
  }

  /**
   * Ép hiển thị toàn bộ đối tượng khi tắt Culling Optimization
   */
  public forceShowAll(): void {
    for (let i = 0; i < this.cullableList.length; i++) {
      const item = this.cullableList[i];
      if (item.gameObject) {
        if (!item.gameObject.visible) item.gameObject.setVisible(true);
        if (typeof item.gameObject.setActive === 'function' && !item.gameObject.active) {
          item.gameObject.setActive(true);
        }
      }
    }
  }

  /**
   * Cập nhật culling theo khung nhìn camera (Camera Frustum Viewport)
   */
  public update(camera: Phaser.Cameras.Scene2D.Camera, margin: number = 180): { total: number; visible: number; culled: number } {
    const total = this.cullableList.length;

    // Nếu công tắc Culling bị tắt, kích hoạt hiển thị 100% đối tượng và thoát sớm
    if (!TILED_PIPELINE_CONFIG.enableCullingOptimization) {
      this.forceShowAll();
      return { total, visible: total, culled: 0 };
    }

    if (!camera || !camera.worldView) {
      return { total, visible: total, culled: 0 };
    }

    const view = camera.worldView;
    const minX = view.x - margin;
    const maxX = view.right + margin;
    const minY = view.y - margin;
    const maxY = view.bottom + margin;

    let visibleCount = 0;

    for (let i = 0; i < total; i++) {
      const item = this.cullableList[i];
      const obj = item.gameObject;

      // Bảo vệ: Tuyệt đối không cull người chơi hoặc thực thể có cờ isPlayer
      if (obj.isPlayer || obj.name === 'wayfarer_player') {
        visibleCount++;
        continue;
      }

      const isInside = (
        item.x + item.radius >= minX &&
        item.x - item.radius <= maxX &&
        item.y + item.radius >= minY &&
        item.y - item.radius <= maxY
      );

      if (obj.visible !== isInside) {
        obj.setVisible(isInside);
      }

      // Đưa đối tượng ngoài camera vào trạng thái ngủ đông (ngừng tính toán transform)
      if (typeof obj.setActive === 'function' && obj.active !== isInside) {
        obj.setActive(isInside);
      }

      if (isInside) {
        visibleCount++;
      }
    }

    const culledCount = total - visibleCount;

    if (TILED_PIPELINE_CONFIG.debugDrawModuleLogs) {
      const now = Date.now();
      if (now - this.lastLogTime > 4000) {
        this.lastLogTime = now;
        console.log(`[TiledPipeline:Culling] Active objects: ${visibleCount}/${total} visible (${culledCount} culled)`);
      }
    }

    return {
      total,
      visible: visibleCount,
      culled: culledCount
    };
  }

  /**
   * Lấy số liệu thống kê hiện thời
   */
  public getStats(): { total: number; visible: number; culled: number } {
    let visibleCount = 0;
    for (let i = 0; i < this.cullableList.length; i++) {
      if (this.cullableList[i].gameObject.visible) {
        visibleCount++;
      }
    }
    return {
      total: this.cullableList.length,
      visible: visibleCount,
      culled: this.cullableList.length - visibleCount
    };
  }
}
