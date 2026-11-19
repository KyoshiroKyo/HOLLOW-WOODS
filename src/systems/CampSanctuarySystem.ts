/**
 * HOLLOW WOODS V1.4 — BƯỚC V14-P8-14B
 * HỆ THỐNG VÙNG BẢO VỆ KHU NGHỈ NGƠI LỬA TRẠI (CAMP SANCTUARY SYSTEM)
 * 
 * Quản lý cơ chế canh gác bảo hộ của Hiệp Sĩ Canh Lửa bên Lửa Trại Sanctuary làng Bellhollow:
 * 1. Bán kính bảo hộ an toàn tuyệt đối (Sanctuary Guard Radius: ~180px quanh 798, 275).
 * 2. Đẩy lùi/ngăn chặn mọi quái vật xâm nhập vào ranh giới ánh lửa.
 * 3. Hiệu ứng buff tăng 20% tốc độ hồi phục Bình Tâm và hong khô Độ Ẩm cho người chơi.
 * 4. Điều khiển trạng thái NPC Hiệp Sĩ Canh Lửa: Quỳ canh lửa (pray) <-> Đứng tương tác (idle).
 */

import * as Phaser from 'phaser';
import { NPCEntity } from '../entities/NPCEntity';

export class CampSanctuarySystem {
  private static instance: CampSanctuarySystem | null = null;

  // Tọa độ tâm Bếp Lửa Hồng Trạm Lửa Rừng Tĩnh Lặng (Quiet Forest Bonfire Outpost) của Sir Vaelen (V15-31)
  public readonly campfireX: number = 1470;
  public readonly campfireY: number = 710;

  // Tọa độ vị trí Sir Vaelen — Kỵ Sĩ Trầm Mặc quỳ gác bên bếp lửa (bên trái ngọn lửa)
  public readonly knightX: number = 1435;
  public readonly knightY: number = 705;

  // Bán kính vùng bảo vệ an toàn của Sanctuary Camp (~180px)
  public readonly sanctuaryRadius: number = 180;

  // Tham chiếu tới thực thể NPC Hiệp Sĩ Canh Lửa trong GameScene
  private knightEntity: NPCEntity | null = null;
  private isDialogueActive: boolean = false;

  // V15-38: Quản lý hồi chiêu và hiệu lực của Lời Chúc Bên Đốm Lửa (Hearth Blessing)
  private lastBlessingDay: number = -1;
  private bonfireBlessingTimer: number = 0; // Đếm ngược thời gian (giây), mặc định 120s

  constructor() {
    CampSanctuarySystem.instance = this;
  }

  public static getInstance(): CampSanctuarySystem {
    if (!CampSanctuarySystem.instance) {
      CampSanctuarySystem.instance = new CampSanctuarySystem();
    }
    return CampSanctuarySystem.instance;
  }

  public registerKnightEntity(knight: NPCEntity): void {
    this.knightEntity = knight;
  }

  public getKnightEntity(): NPCEntity | null {
    return this.knightEntity;
  }

  public isGuarding(): boolean {
    return this.knightEntity !== null && (this.knightEntity.active ?? true);
  }

  /**
   * Kiểm tra người chơi có đang đứng trong vòng ánh lửa Sanctuary Camp có Hiệp Sĩ canh giữ hay không
   * V15-31 & V15-37: Bảo hộ tại Trạm Lửa Rừng Tĩnh Lặng giữa Rừng Ngoài và Đường Mòn Quanh Co
   */
  public isPlayerInSanctuary(playerX: number, playerY: number, zoneId?: string): boolean {
    const distToHearth = Math.hypot(playerX - this.campfireX, playerY - this.campfireY);
    const distToKnight = Math.hypot(playerX - this.knightX, playerY - this.knightY);
    const minDistance = Math.min(distToHearth, distToKnight);

    if (minDistance > this.sanctuaryRadius) return false;

    // Cho phép bảo hộ ở Rừng Ngoài (outer_woods) và Đường Mòn Quanh Co (crooked_path)
    if (zoneId && zoneId !== 'outer_woods' && zoneId !== 'crooked_path') {
      return false;
    }
    return true;
  }

  /**
   * Kiểm tra xem một vị trí (quái vật) có nằm trong ranh giới Sanctuary Camp hay không
   */
  public isMonsterInSanctuaryRange(monsterX: number, monsterY: number): boolean {
    const distToHearth = Math.hypot(monsterX - this.campfireX, monsterY - this.campfireY);
    const distToKnight = Math.hypot(monsterX - this.knightX, monsterY - this.knightY);
    return Math.min(distToHearth, distToKnight) <= this.sanctuaryRadius;
  }

  /**
   * Hệ số gia tốc hồi phục Bình Tâm (+20% khi ở trong Sanctuary Camp có Hiệp Sĩ Canh Lửa)
   */
  public getComposureRecoveryMultiplier(): number {
    return 1.20;
  }

  /**
   * Hệ số gia tốc hong khô Độ Ẩm (+20% khi ở trong Sanctuary Camp có Hiệp Sĩ Canh Lửa)
   */
  public getMoistureDryingMultiplier(): number {
    return 1.20;
  }

  /**
   * Xử lý khi bắt đầu đối thoại: Hiệp sĩ tạm chuyển sang dáng đứng tương tác (anim_campfire_knight_idle)
   */
  public onDialogueStart(playerX?: number): void {
    this.isDialogueActive = true;
    if (this.knightEntity) {
      this.knightEntity.setInteracting(true, playerX);
    }
  }

  /**
   * Xử lý khi kết thúc đối thoại: Hiệp sĩ trở về tư thế quỳ chống kiếm canh lửa (anim_campfire_knight_pray)
   */
  public onDialogueEnd(): void {
    this.isDialogueActive = false;
    if (this.knightEntity) {
      this.knightEntity.setInteracting(false);
    }
  }

  public isTalking(): boolean {
    return this.isDialogueActive;
  }

  /**
   * Cơ chế phòng thủ: Tự động đẩy lùi bất kỳ quái vật nào dám xâm nhập vào vòng bảo hộ của Sanctuary Camp
   */
  public applySanctuaryRepulsion(monsters: (Phaser.GameObjects.GameObject | { x: number; y: number; active?: boolean; body?: any })[]): void {
    const cx = this.campfireX;
    const cy = this.campfireY;
    const r = this.sanctuaryRadius;

    for (const m of monsters) {
      if (!m) continue;
      const ent = m as any;
      if (ent.active === false || ent.x === undefined || ent.y === undefined) continue;

      const dist = Math.hypot(ent.x - cx, ent.y - cy);
      if (dist < r) {
        // Đẩy quái vật dạt ra phía ngoài ranh giới lửa trại
        const angle = Math.atan2(ent.y - cy, ent.x - cx);
        const pushDist = r + 20;
        ent.x = cx + Math.cos(angle) * pushDist;
        ent.y = cy + Math.sin(angle) * pushDist;
        if (ent.body) {
          if (typeof ent.body.setVelocity === 'function') {
            ent.body.setVelocity(0, 0);
          } else if (ent.body.velocity) {
            ent.body.velocity.x = 0;
            ent.body.velocity.y = 0;
          }
        }
        // Nếu quái vật có trạng thái tấn công/rình rập, hủy trạng thái đó
        if (ent.wolfState === 'lunge' || ent.wolfState === 'stalk') {
          ent.wolfState = 'fear_light';
        }
        if (ent.crowState === 'dive_attack') {
          ent.crowState = 'perch';
        }
        if (ent.knightState === 'attack' || ent.knightState === 'charge') {
          ent.knightState = 'idle';
        }
      }
    }
  }

  // ===========================================================================
  // V15-38: CƠ CHẾ LỜI CHÚC BÊN ĐỐM LỬA (HEARTH BLESSING)
  // ===========================================================================

  /**
   * Kiểm tra xem người chơi có thể nhận lời chúc nghỉ ngơi bên bếp lửa hôm nay không
   * Hồi chiêu: 1 lần mỗi chu kỳ ngày/đêm (dựa trên dayCount)
   */
  public canReceiveBlessing(currentDay: number): boolean {
    return this.lastBlessingDay !== currentDay;
  }

  /**
   * Ghi nhận đã nhận lời chúc trong ngày hôm nay
   */
  public recordBlessingReceived(currentDay: number): void {
    this.lastBlessingDay = currentDay;
  }

  /**
   * Kích hoạt hiệu ứng "Lời Chúc Bên Đốm Lửa": Giảm 20% tốc độ tụt Tinh Thần trong 120s
   */
  public applyCampfireBlessing(durationSeconds: number = 120): void {
    this.bonfireBlessingTimer = Math.max(this.bonfireBlessingTimer, durationSeconds);
  }

  /**
   * Cập nhật đếm lùi thời gian hiệu lực của Lời Chúc Bên Đốm Lửa
   */
  public update(dt: number): void {
    if (this.bonfireBlessingTimer > 0) {
      this.bonfireBlessingTimer = Math.max(0, this.bonfireBlessingTimer - dt);
    }
  }

  /**
   * Kiểm tra hiệu ứng Lời Chúc Bên Đốm Lửa có đang hoạt động hay không
   */
  public isCampfireBlessingActive(): boolean {
    return this.bonfireBlessingTimer > 0;
  }

  /**
   * Hệ số giảm tốc độ tụt Tinh Thần khi đi vào rừng sâu (-20% => nhân 0.80)
   */
  public getBlessingDrainMultiplier(): number {
    return this.bonfireBlessingTimer > 0 ? 0.80 : 1.0;
  }

  /**
   * Thời gian hiệu lực còn lại (làm tròn lên giây)
   */
  public getBlessingRemainingTime(): number {
    return Math.max(0, Math.ceil(this.bonfireBlessingTimer));
  }
}
