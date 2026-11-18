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

/**
 * V1.5 - BƯỚC V15-07: Cấu hình Hệ Số Hung Hãn Ban Đêm (Night Aggression Multiplier)
 * Đồng bộ toàn diện giữa chu kỳ thời gian Ngày/Đêm với Kẻ Lắng Nghe và Sói Xương
 */
export interface NightAggressionConfig {
  phase: TimePhase;
  // The Listener
  listenerPatrolSpeed: number;           // DAY: 30 px/s, DUSK: 42 px/s, NIGHT: 42 px/s
  listenerChaseSpeed: number;            // DAY: 90 px/s, DUSK: 105 px/s, NIGHT: 136.5 px/s (+30%)
  listenerHearingRadius: number;         // DAY: 140 px, DUSK: 161 px (+15%), NIGHT: 196 px (+40%)
  listenerSuspicionListenTimeMs: number; // DAY: 2000 ms, DUSK: 1500 ms, NIGHT: 750 ms (-62.5%)
  listenerLostSightTimeMs: number;       // DAY: 1800 ms, DUSK: 2200 ms, NIGHT: 3500 ms (bám vết tích lâu hơn)
  listenerSearchDurationMs: number;      // DAY: 3500 ms, DUSK: 4500 ms, NIGHT: 6500 ms (tìm kiếm dai dẳng hơn)
  // Skull Wolf
  wolfActive: boolean;                   // DAY: false (nghỉ ngơi trong hang), DUSK/NIGHT: true
  wolfLungeSpeed: number;                // Base: 195 px/s, NIGHT: 243.75 px/s (+25%)
  wolfHearingRadiusMultiplier: number;   // DAY: 1.0, DUSK: 1.15 (+15%), NIGHT: 1.40 (+40%)
  wolfLightPerimeterOffset: number;      // DUSK: 45 px, NIGHT: 15 px (thu hẹp khoảng cách gầm gừ ép sát ngay rìa đèn)
  wolfFlankingEnabled: boolean;          // NIGHT: true (săn theo cặp bọc sườn)
  wolfBreachLowComposure: boolean;       // NIGHT: true (Bình Tâm < 25%: Dám lao chồm qua mép sáng cắn)
}

export class DayNightSystem extends TimeSystem {
  public static readonly SEASON_NAME = 'Mùa Sương Lạnh';

  /**
   * V1.5 - BƯỚC V15-07: Cung cấp thông số Hệ Số Hung Hãn Ban Đêm theo từng pha thời gian
   */
  public static getNightAggressionConfig(phase: TimePhase): NightAggressionConfig {
    switch (phase) {
      case 'DAY':
        return {
          phase: 'DAY',
          listenerPatrolSpeed: 30, // Tuần tra chậm rìa rừng sâu
          listenerChaseSpeed: 90,
          listenerHearingRadius: 140, // Bán kính nghe chuẩn
          listenerSuspicionListenTimeMs: 2000, // Đứng nghe ngóng thận trọng 2.0s
          listenerLostSightTimeMs: 1800,
          listenerSearchDurationMs: 3500,
          wolfActive: false, // Rút về hang nghỉ ngơi
          wolfLungeSpeed: 195,
          wolfHearingRadiusMultiplier: 1.0,
          wolfLightPerimeterOffset: 50,
          wolfFlankingEnabled: false,
          wolfBreachLowComposure: false
        };

      case 'DUSK':
        return {
          phase: 'DUSK',
          listenerPatrolSpeed: 42,
          listenerChaseSpeed: 105,
          listenerHearingRadius: 161, // 140 * 1.15 (+15% bán kính nghe)
          listenerSuspicionListenTimeMs: 1500,
          listenerLostSightTimeMs: 2200,
          listenerSearchDurationMs: 4500,
          wolfActive: true, // Bắt đầu thức giấc
          wolfLungeSpeed: 195,
          wolfHearingRadiusMultiplier: 1.15, // +15%
          wolfLightPerimeterOffset: 45,
          wolfFlankingEnabled: false,
          wolfBreachLowComposure: false
        };

      case 'NIGHT':
      default:
        return {
          phase: 'NIGHT',
          listenerPatrolSpeed: 42,
          listenerChaseSpeed: 136.5, // 105 * 1.30 (+30% tốc độ truy đuổi)
          listenerHearingRadius: 196, // 140 * 1.40 (+40% bán kính phát hiện âm thanh)
          listenerSuspicionListenTimeMs: 750, // Giảm từ 2.0s xuống 0.75s là lao tới vồ ngay
          listenerLostSightTimeMs: 3500, // Bám theo dấu vết lâu hơn trước khi bỏ cuộc
          listenerSearchDurationMs: 6500, // Tìm kiếm quanh vị trí mất dấu lâu hơn
          wolfActive: true, // Săn đêm hung hãn
          wolfLungeSpeed: 243.75, // 195 * 1.25 (+25% tốc độ vồ)
          wolfHearingRadiusMultiplier: 1.40, // +40%
          wolfLightPerimeterOffset: 15, // Thu hẹp khoảng cách gầm gừ ép sát ngay rìa quầng sáng
          wolfFlankingEnabled: true, // Đi săn theo cặp 2 con phối hợp bọc sườn
          wolfBreachLowComposure: true // Bình Tâm < 25%: Dám lao chồm qua mép sáng để cắn
        };
    }
  }

  /**
   * Lấy cấu hình hung hãn hiện tại theo pha của instance
   */
  public getCurrentAggressionConfig(): NightAggressionConfig {
    return DayNightSystem.getNightAggressionConfig(this.getCurrentPhase());
  }

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
