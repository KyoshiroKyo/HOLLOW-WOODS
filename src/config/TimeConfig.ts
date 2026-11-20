/**
 * HOLLOW WOODS V1.4 — CẤU HÌNH THỜI GIAN VÀ KHÍ QUYỂN THẾ GIỚI (WORLD TIME CONFIG)
 * Chu kỳ thử nghiệm: 360 giây / ngày thực (6 phút)
 * Phân chia 3 pha rõ rệt:
 *  - DAY (Ban Ngày — 180 giây): Ánh sáng tự nhiên dịu mát (tầm nhìn ~220px), Bình Tâm ổn định ngay cả khi tắt đèn.
 *  - DUSK (Hoàng Hôn — 90 giây): Cam tím trầm (tầm nhìn ~150px), áp lực nhẹ khi tắt đèn, gió lạnh bắt đầu thổi.
 *  - NIGHT (Đêm Sương — 90 giây): Bóng tối bao trùm (tầm nhìn ~55px), nguy cơ cao, đèn lồng và lửa trại là điểm tựa.
 */

export type TimePhase = 'DAY' | 'DUSK' | 'NIGHT';

export interface PhaseVisualConfig {
  name: TimePhase;
  vietnameseName: string;
  icon: string;
  colorHex: string;
  duration: number; // Thời lượng pha (giây)
  visionRadiusUnlit: number; // Tầm nhìn không đèn (px)
  visionRadiusLit: number; // Tầm nhìn có đèn lồng (px)
  ambientColor: number; // Màu ánh sáng môi trường
  fogColor: number; // Màu sắc sương mù
  fogAlphaMultiplier: number; // Hệ số nhân alpha sương mù
  windIntensity: number; // Cường độ gió nền
  composureDrainNormal: number; // Tụt bình tâm mỗi giây khi tắt đèn ở vùng thường
  composureDrainDeepFog: number; // Tụt bình tâm mỗi giây khi tắt đèn ở sương sâu
  composureRecoveryLit: number; // Hồi bình tâm mỗi giây khi bật đèn lồng
  transitionAlert: string; // Thông báo khi bước vào pha
}

export interface TimeSystemConfig {
  totalDayDuration: number;
  transitionBlendDuration: number; // Thời gian chuyển tiếp mượt (giây) giữa 2 pha
  phases: Record<TimePhase, PhaseVisualConfig>;
}

export const TIME_CONFIG: TimeSystemConfig = {
  totalDayDuration: 360,
  transitionBlendDuration: 8, // Chuyển tiếp mượt trong 8 giây
  phases: {
    DAY: {
      name: 'DAY',
      vietnameseName: 'Ban Ngày',
      icon: '☀️',
      colorHex: '#9ab0c4',
      duration: 180,
      visionRadiusUnlit: 210,
      visionRadiusLit: 250,
      ambientColor: 0x9ab0c4, // V152-07 (#16): Bầu trời u ám rợp bóng mây (overcast dark shadow tông xanh xám lạnh)
      fogColor: 0x16202a,     // Sắc xanh xám lạnh gothic giúp ánh lửa và nấm dạ quang nổi bật
      fogAlphaMultiplier: 0.52,
      windIntensity: 0.35,
      composureDrainNormal: 0.0, // Bình Tâm hoàn toàn ổn định khi tắt đèn ban ngày
      composureDrainDeepFog: 0.35,
      composureRecoveryLit: 2.2,
      transitionAlert: '☀️ Ánh bình minh âm u xuyên qua tán lá, sương mù rợp bóng.'
    },
    DUSK: {
      name: 'DUSK',
      vietnameseName: 'Hoàng Hôn',
      icon: '🌅',
      colorHex: '#8c4838',
      duration: 90,
      visionRadiusUnlit: 130,
      visionRadiusLit: 180,
      ambientColor: 0x6a3e3c, // V152-07 (#16): Tối sậm nhanh, sắc cam tím sẫm dark shadow
      fogColor: 0x24141e,     // Tím sẫm hoàng hôn ma quái
      fogAlphaMultiplier: 1.22,
      windIntensity: 0.65,
      composureDrainNormal: 0.6, // Áp lực nhẹ khi tắt đèn quá lâu
      composureDrainDeepFog: 1.5,
      composureRecoveryLit: 1.8,
      transitionAlert: '🌅 Hoàng hôn cam tím buông xuống... Gió lạnh bắt đầu thổi qua rặng thông.'
    },
    NIGHT: {
      name: 'NIGHT',
      vietnameseName: 'Đêm Sương',
      icon: '🌙',
      colorHex: '#4a6984',
      duration: 90,
      visionRadiusUnlit: 50, // Thu hẹp còn ~50px trong đêm
      visionRadiusLit: 135,
      ambientColor: 0x080c14, // V152-07 (#16): Bóng tối sâu bao trùm, đen xanh sẫm
      fogColor: 0x060910,     // Bóng tối thẳm sâu huyền bí
      fogAlphaMultiplier: 1.45,
      windIntensity: 1.10,
      composureDrainNormal: 1.8, // Nguy hiểm cao nếu không có đèn
      composureDrainDeepFog: 3.2,
      composureRecoveryLit: 1.2,
      transitionAlert: '🌙 Đêm sương lạnh giá đã bao trùm khu rừng! Hãy giữ lấy ánh sáng.'
    }
  }
};
