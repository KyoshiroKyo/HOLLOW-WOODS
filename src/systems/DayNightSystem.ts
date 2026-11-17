/**
 * HOLLOW WOODS V1.4 - PHẦN 8: BƯỚC V14-P8-02
 * HỆ THỐNG THỜI GIAN NGÀY / ĐÊM & ĐỒNG HỒ 3 MÚI GIỜ (DAY-NIGHT SYSTEM)
 * Chu kỳ 360s:
 *   - BAN NGÀY (DAY — 180s, 50%): Vàng hổ phách (0xf1c40f)
 *   - HOÀNG HÔN (DUSK — 90s, 25%): Cam hoàng hôn (0xe67e22)
 *   - ĐÊM SƯƠNG (NIGHT — 90s, 25%): Xanh tím đêm (0x5b4a8e)
 */

import { TimeSystem, TimeTickEvent, PhaseChangeEvent } from './TimeSystem';
import { TIME_CONFIG, TimePhase, PhaseVisualConfig, TimeSystemConfig } from '../config/TimeConfig';

export interface ClockWedgeConfig {
  phase: TimePhase;
  name: string;
  duration: number;
  startAngle: number; // Radian
  endAngle: number;   // Radian
  color: number;
}

export class DayNightSystem extends TimeSystem {
  public static readonly SEASON_NAME = 'Mùa Sương Lạnh';

  /**
   * Tính toán góc quay của kim đồng hồ thời gian thực (từ -PI/2 tại 0s đến 3PI/2 tại 360s)
   */
  public static getClockHandAngle(timeOfDay: number, totalDuration: number = 360): number {
    const progress = Math.max(0, Math.min(1, timeOfDay / totalDuration));
    return -Math.PI / 2 + progress * (Math.PI * 2);
  }

  /**
   * Cung cấp thông số cấu hình 3 múi màu của mặt đồng hồ tròn
   */
  public static getClockWedges(): ClockWedgeConfig[] {
    // Mặt đồng hồ 360 độ (2PI):
    // 12 giờ là -PI/2 (-90 độ)
    // Ban Ngày (180s = 50% = 180 độ): từ -PI/2 đến PI/2
    // Hoàng Hôn (90s = 25% = 90 độ): từ PI/2 đến PI
    // Đêm Sương (90s = 25% = 90 độ): từ PI đến 3PI/2 (-PI/2)
    return [
      {
        phase: 'DAY',
        name: 'Ban Ngày',
        duration: 180,
        startAngle: -Math.PI / 2,
        endAngle: Math.PI / 2,
        color: 0xf1c40f
      },
      {
        phase: 'DUSK',
        name: 'Hoàng Hôn',
        duration: 90,
        startAngle: Math.PI / 2,
        endAngle: Math.PI,
        color: 0xe67e22
      },
      {
        phase: 'NIGHT',
        name: 'Đêm Sương',
        duration: 90,
        startAngle: Math.PI,
        endAngle: (3 * Math.PI) / 2,
        color: 0x5b4a8e
      }
    ];
  }

  /**
   * Chuỗi nhãn trạng thái thời gian hiển thị trên HUD
   */
  public static getSeasonLabel(dayCount: number): string {
    return `Ngày ${dayCount} — ${DayNightSystem.SEASON_NAME}`;
  }
}

export { TimeSystem, TIME_CONFIG };
export type { TimePhase, PhaseVisualConfig, TimeSystemConfig, TimeTickEvent, PhaseChangeEvent };
