import * as Phaser from 'phaser';
import {
  MireWardenBoss,
  MireWardenState,
  RunePillarTarget,
  BrazierTarget
} from './MireWardenBoss';

/**
 * HOLLOW WOODS V1.4 — BOSS MIRE WARDEN (KẺ NUỐT TIẾNG CHUÔNG)
 * File: src/entities/BossMireWarden.ts
 *
 * Thực thể Trùm Chiến Thuật Giải Đố (Tactical Puzzle Boss):
 * 1. Không thể chém chết trực diện bằng thanh máu đỏ thông thường.
 *    Thay bằng thanh tiến trình "Độ Ổn Định Phong Ấn" (Seal Stability Bar).
 * 2. Pha 1 (100% ➔ 50%): Săn mồi bằng tiếng động.
 *    - Boss mù hoàn toàn, định vị và lao húc cực nhanh theo đường thẳng hướng về tiếng động [Q] hoặc bước chạy.
 *    - Khi húc trúng Trụ Lửa Cổ Ngữ, trụ bùng cháy làm Boss bị choáng (Stun 3.5s) và nứt giáp sương mù.
 *    - Người chơi tấn công điểm yếu bằng Giáo Gỗ hoặc Gậy Gỗ để tăng nấc phong ấn.
 * 3. Pha 2 (< 50%): Cơn ác mộng sương đêm.
 *    - Boss dập tắt 2 trụ lửa, gọi sương mù dày đặc và 2 ảo ảnh Echo.
 *    - Dùng Đèn Lồng [F] hoặc Đuốc Nhựa Thông thắp sáng lại các trụ, né đòn quét bóng đêm và tung đòn thanh tẩy kết liễu.
 * 4. Phần thưởng & Kết cục:
 *    - Tiếng chuông lớn ngân vang xua tan vĩnh viễn màn sương độc, mở khóa di vật Trái Tim Mạch Rễ Cổ.
 */
export class BossMireWarden extends MireWardenBoss {
  public static readonly STUN_DURATION_MS: number = 3500; // 3.5 giây làm choáng
  public static readonly WEAK_POINT_INTERACT_KEY: string = 'E';

  // Trạng thái giáp sương mù
  public mistArmorCracked: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
  }

  /**
   * Làm nứt lớp giáp sương mù khi húc trúng Trụ Lửa Cổ Ngữ
   */
  public crackMistArmor(): void {
    this.mistArmorCracked = true;
    this.stagger();
  }

  /**
   * Khôi phục giáp sương mù sau khi hết thời gian choáng
   */
  public restoreMistArmor(): void {
    this.mistArmorCracked = false;
  }

  /**
   * Kiểm tra xem Boss có đang trong trạng thái dễ bị tổn thương (Stun 3.5s) hay không
   */
  public isVulnerable(): boolean {
    return this.isStaggered;
  }
}

export {
  MireWardenBoss,
  type MireWardenState,
  type RunePillarTarget,
  type BrazierTarget
};
