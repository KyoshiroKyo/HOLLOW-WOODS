/**
 * HOLLOW WOODS V1.5 - BỘ TỰ ĐỘNG DÒ VỊ TRÍ ĐỨNG AN TOÀN KHI NẠP SAVE (SAFE SPAWN RESOLVER)
 * File: src/systems/SafeSpawnResolver.ts
 * 
 * Nhiệm vụ:
 * 1. Kiểm tra va chạm hộp chân nhân vật (foot hitbox) với mọi vật thể cứng trong colliderGroup và ranh giới thế giới.
 * 2. Tự động quét vòng tròn mở rộng (16px -> 160px theo 16 hướng) để tìm vị trí trống trải gần nhất nếu bị kẹt.
 * 3. Tự động đưa về điểm Sanctuary an toàn (Cổng làng Bellhollow / Trạm lửa Sir Vaelen) nếu khu vực bị cô lập.
 * 4. Hỗ trợ tính toán điểm bước ra an toàn khỏi chỗ trốn (hiding spot), tránh tuyệt đối cổng sắt và vật cản.
 */

import * as Phaser from 'phaser';
import {
  WAYFARER_BODY_WIDTH,
  WAYFARER_BODY_HEIGHT,
  WAYFARER_BODY_OFFSET_X,
  WAYFARER_BODY_OFFSET_Y,
  WAYFARER_FRAME_WIDTH,
  WAYFARER_FRAME_HEIGHT,
  WAYFARER_ORIGIN_X,
  WAYFARER_ORIGIN_Y
} from '../config/Constants';

export interface SafeSpawnResult {
  x: number;
  y: number;
  adjusted: boolean;
  fallback: boolean;
  reason?: string;
}

export class SafeSpawnResolver {
  public static readonly WORLD_BOUNDS = {
    minX: 20,
    maxX: 4980,
    minY: -1300,
    maxY: 2100
  };

  /**
   * Tính toán AABB hộp va chạm chân của nhân vật tại vị trí (x, y)
   */
  public static getFootBoundingBox(x: number, y: number, padding: number = 0) {
    const frameLeft = x - WAYFARER_FRAME_WIDTH * WAYFARER_ORIGIN_X;
    const frameTop = y - WAYFARER_FRAME_HEIGHT * WAYFARER_ORIGIN_Y;
    const bodyX = frameLeft + WAYFARER_BODY_OFFSET_X;
    const bodyY = frameTop + WAYFARER_BODY_OFFSET_Y;

    return {
      left: bodyX - padding,
      top: bodyY - padding,
      right: bodyX + WAYFARER_BODY_WIDTH + padding,
      bottom: bodyY + WAYFARER_BODY_HEIGHT + padding,
      width: WAYFARER_BODY_WIDTH + padding * 2,
      height: WAYFARER_BODY_HEIGHT + padding * 2
    };
  }

  /**
   * Kiểm tra xem vị trí (x, y) có bị chặn bởi collider cứng hay nằm ngoài bản đồ không
   */
  public static isPositionBlocked(
    scene: any,
    x: number,
    y: number,
    padding: number = 0
  ): boolean {
    const foot = SafeSpawnResolver.getFootBoundingBox(x, y, padding);

    // 1. Kiểm tra giới hạn thế giới
    if (
      foot.left < SafeSpawnResolver.WORLD_BOUNDS.minX ||
      foot.right > SafeSpawnResolver.WORLD_BOUNDS.maxX ||
      foot.top < SafeSpawnResolver.WORLD_BOUNDS.minY ||
      foot.bottom > SafeSpawnResolver.WORLD_BOUNDS.maxY
    ) {
      return true;
    }

    // 2. Kiểm tra colliderGroup trong worldBuilder
    if (!scene || !scene.worldBuilder || !scene.worldBuilder.colliderGroup) {
      return false;
    }

    const colliders = scene.worldBuilder.colliderGroup.getChildren() as Phaser.Physics.Arcade.Sprite[];
    for (const col of colliders) {
      if (!col || !col.body) continue;
      const b = col.body as Phaser.Physics.Arcade.Body;
      if (!b.enable || (b as any).checkCollision?.none) continue;

      // Kiểm tra AABB Overlap
      if (
        foot.left < b.x + b.width &&
        foot.right > b.x &&
        foot.top < b.y + b.height &&
        foot.bottom > b.y
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Tìm vị trí an toàn gần nhất bằng phương pháp quét xoắn ốc vòng tròn mở rộng
   * Bán kính từ 16px đến 160px theo 16 hướng phân bố đều
   */
  public static findNearestSafePosition(
    scene: any,
    startX: number,
    startY: number,
    maxRadius: number = 160,
    step: number = 16
  ): { x: number; y: number } | null {
    // Nếu vị trí hiện tại đã an toàn tuyệt đối
    if (!SafeSpawnResolver.isPositionBlocked(scene, startX, startY, 2)) {
      return { x: startX, y: startY };
    }

    // 16 hướng quét (bắt đầu từ các hướng dẫn ra đường mở: Nam, Đông Nam, Tây Nam, Đông, Tây, ...)
    const preferredAngles = [
      Math.PI / 2,        // 90 deg: Nam (xuống dưới mặt đường)
      Math.PI / 4,        // 45 deg: Đông Nam
      (3 * Math.PI) / 4,  // 135 deg: Tây Nam
      0,                  // 0 deg: Đông
      Math.PI,            // 180 deg: Tây
      (3 * Math.PI) / 8,  // 67.5 deg
      (5 * Math.PI) / 8,  // 112.5 deg
      Math.PI / 8,        // 22.5 deg
      (7 * Math.PI) / 8,  // 157.5 deg
      -Math.PI / 4,       // -45 deg: Đông Bắc
      -(3 * Math.PI) / 4, // -135 deg: Tây Bắc
      -Math.PI / 2,       // -90 deg: Bắc
      -Math.PI / 8,       // -22.5 deg
      -(3 * Math.PI) / 8, // -67.5 deg
      -(5 * Math.PI) / 8, // -112.5 deg
      -(7 * Math.PI) / 8  // -157.5 deg
    ];

    for (let r = step; r <= maxRadius; r += step) {
      for (const angle of preferredAngles) {
        const candX = Math.round(startX + r * Math.cos(angle));
        const candY = Math.round(startY + r * Math.sin(angle));

        if (!SafeSpawnResolver.isPositionBlocked(scene, candX, candY, 2)) {
          return { x: candX, y: candY };
        }
      }
    }

    return null;
  }

  /**
   * Điểm hồi phục an toàn chuẩn theo từng phân khu (Sanctuary Checkpoints - V15-57)
   * Tọa độ trung tâm trục đường mòn thông thoáng, cách xa mọi collider và mép vực.
   */
  public static getSanctuaryFallback(zoneId?: string): { x: number; y: number } {
    switch (zoneId) {
      case 'fog_crossing':
        // Cửa Ải Sương Mù (bờ hồ nước thanh tịnh)
        return { x: 240, y: 180 };
      case 'bellhollow':
        // Làng Bellhollow (sân trung tâm trước lò rèn Bram & Bếp lửa làng)
        return { x: 750, y: 260 };
      case 'sanctuary_farm':
        // Nông Trại Trú Ẩn (đường mòn trước nông trang & cối xay)
        return { x: 800, y: 750 };
      case 'sub_root_cellar':
        // Hầm Rễ Cổ (lòng hầm trú ẩn bằng phẳng)
        return { x: 800, y: 1150 };
      case 'veil_origin_cavern':
        // Hang Nguồn Cội Của Sương Mù (lòng hang râm mát trung tâm)
        return { x: 800, y: 1520 };
      case 'outer_woods':
        // Rừng Ngoài (trục đường mòn chính trước Trạm Lửa Sir Vaelen)
        return { x: 1360, y: 620 };
      case 'sub_bell_workshop':
        // Xưởng Chuông Bỏ Hoang (sân thợ đúc chuông cổ)
        return { x: 1360, y: 1150 };
      case 'crooked_path':
        // Đường Mòn Quanh Co (trục đường chính thông thoáng)
        return { x: 2140, y: 200 };
      case 'sub_whispering_clearing':
        // Khoảng Trống Thì Thầm (khu đất thưa giữa rừng rậm)
        return { x: 1840, y: -80 };
      case 'deep_forest':
        // Rừng Sâu (trục đường mòn an toàn Hồi 3)
        return { x: 2080, y: -80 };
      case 'whispering_grove_sanctum':
        // Thánh Điạ Rừng Thì Thầm Cổ Thụ
        return { x: 960, y: -580 };
      case 'abyssal_chasm':
        // Vực Sâu Thăm Thẳm (mặt cầu đá vững chãi trước miệng vực)
        return { x: 2240, y: -720 };
      case 'silent_mire':
        // Đầm Lầy Tĩnh Lặng (đường ván gỗ bắc qua đầm)
        return { x: 3000, y: 260 };
      case 'drowned_mire_depths':
        // Đầm Lầy Chìm Sâu (cồn đất cao ráo)
        return { x: 3380, y: 840 };
      case 'ancient_rune_puzzle':
        // Quảng Trường Cổ Ngữ (trục đường trung tâm câu đố)
        return { x: 3520, y: 260 };
      case 'sunken_crypt_ruins':
        // Phế Tích Hầm Mộ Cổ Ngữ Chìm
        return { x: 3600, y: -200 };
      case 'broken_bell_shrine':
        // Miếu Chuông Phế Tích (sân tế lễ trước tháp chuông rạn nứt)
        return { x: 4200, y: 280 };
      default:
        // Cổng Làng Bellhollow mặc định
        return { x: 750, y: 260 };
    }
  }

  /**
   * Giải quyết vị trí nạp game an toàn toàn diện (Safe Spawn Resolver)
   */
  public static resolveSafeSpawn(
    scene: any,
    rawX: number,
    rawY: number,
    zoneId?: string
  ): SafeSpawnResult {
    // 1. Kiểm tra vị trí gốc
    if (!SafeSpawnResolver.isPositionBlocked(scene, rawX, rawY, 1)) {
      return { x: rawX, y: rawY, adjusted: false, fallback: false };
    }

    console.warn(`[SafeSpawnResolver] Vị trí ban đầu (${rawX}, ${rawY}) bị kẹt va chạm! Đang quét vị trí an toàn lân cận...`);

    // 2. Quét xoắn ốc trong bán kính 16px -> 160px
    const nearbySafe = SafeSpawnResolver.findNearestSafePosition(scene, rawX, rawY, 160, 16);
    if (nearbySafe) {
      console.log(`[SafeSpawnResolver] Đã tìm thấy vị trí an toàn lân cận tại (${nearbySafe.x}, ${nearbySafe.y})`);
      return {
        x: nearbySafe.x,
        y: nearbySafe.y,
        adjusted: true,
        fallback: false,
        reason: 'nearby_scan'
      };
    }

    // 3. Fallback về điểm Sanctuary an toàn của phân khu
    const fallback = SafeSpawnResolver.getSanctuaryFallback(zoneId);
    // Xác minh vị trí fallback không bị kẹt (nếu kẹt nhẹ thì quét lân cận fallback)
    const verifiedFallback = SafeSpawnResolver.findNearestSafePosition(scene, fallback.x, fallback.y, 80, 16) || fallback;
    console.warn(`[SafeSpawnResolver] Không tìm thấy ô trống quanh (${rawX}, ${rawY}). Dịch chuyển về Sanctuary Fallback: (${verifiedFallback.x}, ${verifiedFallback.y})`);

    return {
      x: verifiedFallback.x,
      y: verifiedFallback.y,
      adjusted: true,
      fallback: true,
      reason: 'sanctuary_fallback'
    };
  }

  /**
   * Tính toán điểm bước ra an toàn khỏi chỗ trốn (hiding spot)
   * Tránh tuyệt đối các hướng có cổng sắt, cầu sập hoặc tường đá
   */
  public static findSafeExitFromHiding(
    scene: any,
    currentX: number,
    currentY: number,
    movementInputDirection?: { x: number; y: number }
  ): { x: number; y: number } {
    // Các hướng bước ra ưu tiên (hướng xuống mặt đường hoặc theo input di chuyển)
    const testOffsets: Array<{ x: number; y: number }> = [];

    // Nếu người chơi đang bấm phím di chuyển, ưu tiên hướng đó trước
    if (movementInputDirection && (movementInputDirection.x !== 0 || movementInputDirection.y !== 0)) {
      testOffsets.push({
        x: movementInputDirection.x * 28,
        y: movementInputDirection.y * 28
      });
      testOffsets.push({
        x: movementInputDirection.x * 40,
        y: movementInputDirection.y * 40
      });
    }

    // Các hướng chuẩn (xuống dưới là trục đường, sang trái/phải, lên trên)
    testOffsets.push(
      { x: 0, y: 28 },   // Nam (xuống dưới mặt đường)
      { x: 0, y: 40 },
      { x: -28, y: 16 }, // Tây Nam
      { x: 28, y: 16 },  // Đông Nam
      { x: -28, y: 0 },  // Tây
      { x: 28, y: 0 },   // Đông
      { x: 0, y: -28 },  // Bắc
      { x: -28, y: -20 },
      { x: 28, y: -20 }
    );

    for (const off of testOffsets) {
      const targetX = currentX + off.x;
      const targetY = currentY + off.y;
      if (!SafeSpawnResolver.isPositionBlocked(scene, targetX, targetY, 2)) {
        return { x: targetX, y: targetY };
      }
    }

    // Quét mở rộng nếu các hướng cố định đều vướng
    const scan = SafeSpawnResolver.findNearestSafePosition(scene, currentX, currentY, 120, 16);
    if (scan) {
      return scan;
    }

    return { x: currentX, y: currentY + 32 };
  }

  /**
   * Xử lý gỡ kẹt khẩn cấp (Emergency Unstuck - Phím F8 hoặc Nút trong Menu Tạm Dừng)
   */
  public static resolveEmergencySafePosition(scene: any): { x: number; y: number } {
    const player = scene.player;
    if (!player) {
      return SafeSpawnResolver.getSanctuaryFallback(scene.currentZoneId);
    }

    // 1. Thử quét gần trước (bán kính 80px)
    const nearby = SafeSpawnResolver.findNearestSafePosition(scene, player.x, player.y, 80, 16);
    if (nearby && (nearby.x !== player.x || nearby.y !== player.y)) {
      return nearby;
    }

    // 2. Nếu vẫn kẹt hoặc quá gần điểm kẹt, đưa về Sanctuary Fallback
    return SafeSpawnResolver.getSanctuaryFallback(scene.currentZoneId);
  }
}
