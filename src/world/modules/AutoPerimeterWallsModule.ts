/**
 * HOLLOW WOODS V1.4 — TILED PIPELINE
 * MODULE 3: AUTO PERIMETER WALLS MODULE (TỰ ĐỘNG DỰNG TƯỜNG CHẶN CHU VI BẢN ĐỒ)
 * 
 * Kiểm soát qua: TILED_PIPELINE_CONFIG.enableAutoPerimeterWalls
 */

import * as Phaser from 'phaser';
import { TILED_PIPELINE_CONFIG } from '../../config/tiledPipelineConfig';

export interface PerimeterBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TransitionPortal {
  id?: string;
  triggerRect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export class AutoPerimeterWallsModule {
  private static instance: AutoPerimeterWallsModule;

  public static getInstance(): AutoPerimeterWallsModule {
    if (!AutoPerimeterWallsModule.instance) {
      AutoPerimeterWallsModule.instance = new AutoPerimeterWallsModule();
    }
    return AutoPerimeterWallsModule.instance;
  }

  /**
   * Tạo một Static Collider Box chuẩn xác không lệch offset 16px
   */
  private createWallSegment(
    colliderGroup: Phaser.Physics.Arcade.StaticGroup,
    minX: number,
    minY: number,
    width: number,
    height: number,
    name: string
  ): Phaser.Physics.Arcade.Sprite {
    const wall = colliderGroup.create(minX, minY, undefined) as Phaser.Physics.Arcade.Sprite;
    wall.setOrigin(0, 0);
    wall.setVisible(false);
    const body = wall.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(width, height, false);
    body.reset(minX, minY);
    wall.setName(name);
    return wall;
  }

  /**
   * Tự động tính toán và dựng 4 bức tường chu vi kín khít quanh phân khu,
   * khoét rãnh chính xác tại các cổng chuyển vùng (0px seam gap).
   */
  public generatePerimeterWalls(
    colliderGroup: Phaser.Physics.Arcade.StaticGroup,
    bounds: PerimeterBounds,
    transitions: TransitionPortal[] = [],
    zoneId: string = 'unknown_zone',
    wallThickness: number = 32
  ): Phaser.Physics.Arcade.Sprite[] {
    if (!TILED_PIPELINE_CONFIG.enableAutoPerimeterWalls) {
      if (TILED_PIPELINE_CONFIG.debugDrawModuleLogs) {
        console.log(`[TiledPipeline:PerimeterWalls] Skipped for zone '${zoneId}' (enableAutoPerimeterWalls is false)`);
      }
      return [];
    }

    const createdWalls: Phaser.Physics.Arcade.Sprite[] = [];
    const minX = bounds.x;
    const maxX = bounds.x + bounds.width;
    const minY = bounds.y;
    const maxY = bounds.y + bounds.height;

    // 1. BIÊN BẮC (North Perimeter): Y = minY
    // Tìm các transition chạm sát mép Bắc (|rect.y - minY| <= wallThickness)
    const northPortals = transitions
      .filter(t => Math.abs(t.triggerRect.y - minY) <= wallThickness)
      .sort((a, b) => a.triggerRect.x - b.triggerRect.x);

    let curX = minX;
    for (let i = 0; i < northPortals.length; i++) {
      const portal = northPortals[i];
      const portalLeft = Math.max(minX, portal.triggerRect.x);
      const portalRight = Math.min(maxX, portal.triggerRect.x + portal.triggerRect.width);

      if (portalLeft > curX) {
        const segW = portalLeft - curX;
        createdWalls.push(
          this.createWallSegment(colliderGroup, curX, minY - wallThickness / 2, segW, wallThickness, `auto_north_${zoneId}_seg_${i}`)
        );
      }
      curX = portalRight;
    }
    if (curX < maxX) {
      createdWalls.push(
        this.createWallSegment(colliderGroup, curX, minY - wallThickness / 2, maxX - curX, wallThickness, `auto_north_${zoneId}_seg_end`)
      );
    }

    // 2. BIÊN NAM (South Perimeter): Y = maxY
    const southPortals = transitions
      .filter(t => Math.abs((t.triggerRect.y + t.triggerRect.height) - maxY) <= wallThickness)
      .sort((a, b) => a.triggerRect.x - b.triggerRect.x);

    curX = minX;
    for (let i = 0; i < southPortals.length; i++) {
      const portal = southPortals[i];
      const portalLeft = Math.max(minX, portal.triggerRect.x);
      const portalRight = Math.min(maxX, portal.triggerRect.x + portal.triggerRect.width);

      if (portalLeft > curX) {
        const segW = portalLeft - curX;
        createdWalls.push(
          this.createWallSegment(colliderGroup, curX, maxY - wallThickness / 2, segW, wallThickness, `auto_south_${zoneId}_seg_${i}`)
        );
      }
      curX = portalRight;
    }
    if (curX < maxX) {
      createdWalls.push(
        this.createWallSegment(colliderGroup, curX, maxY - wallThickness / 2, maxX - curX, wallThickness, `auto_south_${zoneId}_seg_end`)
      );
    }

    // 3. BIÊN TÂY (West Perimeter): X = minX
    const westPortals = transitions
      .filter(t => Math.abs(t.triggerRect.x - minX) <= wallThickness)
      .sort((a, b) => a.triggerRect.y - b.triggerRect.y);

    let curY = minY;
    for (let i = 0; i < westPortals.length; i++) {
      const portal = westPortals[i];
      const portalTop = Math.max(minY, portal.triggerRect.y);
      const portalBottom = Math.min(maxY, portal.triggerRect.y + portal.triggerRect.height);

      if (portalTop > curY) {
        const segH = portalTop - curY;
        createdWalls.push(
          this.createWallSegment(colliderGroup, minX - wallThickness / 2, curY, wallThickness, segH, `auto_west_${zoneId}_seg_${i}`)
        );
      }
      curY = portalBottom;
    }
    if (curY < maxY) {
      createdWalls.push(
        this.createWallSegment(colliderGroup, minX - wallThickness / 2, curY, wallThickness, maxY - curY, `auto_west_${zoneId}_seg_end`)
      );
    }

    // 4. BIÊN ĐÔNG (East Perimeter): X = maxX
    const eastPortals = transitions
      .filter(t => Math.abs((t.triggerRect.x + t.triggerRect.width) - maxX) <= wallThickness)
      .sort((a, b) => a.triggerRect.y - b.triggerRect.y);

    curY = minY;
    for (let i = 0; i < eastPortals.length; i++) {
      const portal = eastPortals[i];
      const portalTop = Math.max(minY, portal.triggerRect.y);
      const portalBottom = Math.min(maxY, portal.triggerRect.y + portal.triggerRect.height);

      if (portalTop > curY) {
        const segH = portalTop - curY;
        createdWalls.push(
          this.createWallSegment(colliderGroup, maxX - wallThickness / 2, curY, wallThickness, segH, `auto_east_${zoneId}_seg_${i}`)
        );
      }
      curY = portalBottom;
    }
    if (curY < maxY) {
      createdWalls.push(
        this.createWallSegment(colliderGroup, maxX - wallThickness / 2, curY, wallThickness, maxY - curY, `auto_east_${zoneId}_seg_end`)
      );
    }

    if (TILED_PIPELINE_CONFIG.debugDrawModuleLogs) {
      console.log(`[TiledPipeline:PerimeterWalls] Built ${createdWalls.length} watertight perimeter walls for '${zoneId}' (Bounds: ${bounds.width}x${bounds.height})`);
    }

    return createdWalls;
  }
}
