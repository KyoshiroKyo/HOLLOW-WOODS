import * as Phaser from 'phaser';
import { TheListener } from './TheListener';
import { Waypoint } from '../systems/ListenerAI';

/**
 * HOLLOW WOODS V1.4 — THỰC THỂ THE LISTENER (LISTENER MONSTER)
 * File: src/entities/ListenerMonster.ts
 *
 * Nhiệm vụ & Nâng cấp trí tuệ nhân tạo (Bước 5.3):
 * 1. Nâng cấp trí nhớ ngắn hạn cho The Listener:
 *    - Cơ chế chống lừa lặp lại (Anti-Repeat Lure Memory): Nếu người chơi ném Mồi Tiếng Động [Q]
 *      tại cùng một vị trí quá 2 lần trong vòng 40 giây (40,000ms), The Listener sẽ không bị mắc lừa nữa
 *      mà sẽ lập tức quay sang tìm kiếm nguồn phát ra cú ném (vị trí người chơi).
 *    - Bổ sung trạng thái nghi ngờ: Dừng lại quay đầu lắng nghe 2 giây trước khi lao đến điểm phát ra tiếng động.
 * 2. Phân tách rạch ròi với Bóng Ma Ký Ức (The Echo).
 */
export class ListenerMonster extends TheListener {
  public static readonly ANTI_REPEAT_WINDOW_MS: number = 40000; // 40 giây
  public static readonly SUSPECT_LISTEN_DURATION_MS: number = 2000; // 2 giây nghi ngờ lắng nghe

  constructor(scene: Phaser.Scene, x: number, y: number, waypoints: Waypoint[]) {
    super(scene, x, y, waypoints);
  }

  /**
   * Tiếp nhận âm thanh mồi nhử [Q] kèm tọa độ người ném
   */
  public receiveLureNoise(soundX: number, soundY: number, originX: number, originY: number): void {
    this.hearSound(soundX, soundY, 2.5, originX, originY);
  }

  /**
   * Kiểm tra xem The Listener có đang trong trạng thái nghi ngờ lắng nghe 2 giây hay không
   */
  public isSuspecting(): boolean {
    return this.ai.state === 'ALERT';
  }

  /**
   * Truy vấn lịch sử trí nhớ ngắn hạn về các điểm phát âm thanh
   */
  public getSoundMemoryEntries() {
    return this.ai.getSoundMemories();
  }
}

export { TheListener };
