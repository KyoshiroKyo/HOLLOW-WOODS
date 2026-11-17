import * as Phaser from 'phaser';
import { TheEcho } from './TheEcho';
import { EchoSpec } from '../types';

/**
 * HOLLOW WOODS V1.4 — BÓNG MA KÝ ỨC (THE ECHO / ECHO APPARITION)
 * File: src/entities/EchoApparition.ts
 *
 * Phân tách rõ ràng với Thực thể Săn đuổi (The Listener):
 * 1. The Echo KHÔNG PHẢI quái vật săn mồi:
 *    - Không có hitbox gây sát thương vật lý (hasPhysicalDamage() === false).
 *    - Không kích hoạt Game Over hay làm tổn hại máu của người chơi.
 * 2. Xuất hiện mờ ảo ở rìa màn hình vào ban đêm / hoàng hôn:
 *    - Khi người chơi tiến lại gần trong bán kính 48px, nghe tiếng thì thầm
 *      kể lại các mảnh ký ức về ngày ngôi làng Bellhollow bị sương mù nuốt chửng.
 *    - Tan biến thành những đốm sáng tro tàn (Glowing Ash Particles).
 * 3. Tác động tâm lý duy nhất:
 *    - Chỉ làm giảm nhẹ Bình Tâm (-5 Composure) nếu người chơi đứng nhìn thẳng vào nó
 *      trong bóng tối mà KHÔNG bật đèn lồng (ánh sáng đèn lồng bảo vệ tâm trí).
 */
export class EchoApparition extends TheEcho {
  public static readonly DIRECT_GAZE_COMPOSURE_DRAIN: number = 5;

  constructor(scene: Phaser.Scene, spec: EchoSpec) {
    super(scene, spec);
  }

  /**
   * Khẳng định The Echo không phải quái vật săn mồi
   */
  public isPredatorMonster(): boolean {
    return false;
  }

  /**
   * Khẳng định The Echo không kích hoạt Game Over
   */
  public canTriggerGameOver(): boolean {
    return false;
  }

  /**
   * The Echo tuyệt đối không có sát thương vật lý trực tiếp
   */
  public override hasPhysicalDamage(): boolean {
    return false;
  }

  /**
   * Trả về mảnh ký ức về ngày ngôi làng bị sương mù nuốt chửng
   */
  public getSwallowedVillageMemory(): string {
    return this.spec.message || 'Mảnh ký ức thì thầm: “Ngày màn sương nuốt chửng Bellhollow... tiếng chuông tắt dần trong lòng đất...”';
  }
}

export { TheEcho };
