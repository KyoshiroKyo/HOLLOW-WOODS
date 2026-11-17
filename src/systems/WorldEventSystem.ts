import * as Phaser from 'phaser';
import { WorldEventType, WorldEventDef } from '../types';
import { AudioManager } from '../audio/AudioManager';
import { PlayerState } from '../state/PlayerState';

export interface WorldEventResult {
  type: WorldEventType;
  contentId: string;
  nameVi: string;
  message: string;
  applied: boolean;
}

export class WorldEventSystem {
  private static instance: WorldEventSystem | null = null;
  private scene: Phaser.Scene;

  // Trạng thái Đợt Sương Dâng (Fog Surge)
  private fogSurgeTimer: number = 0;
  private fogSurgeActive: boolean = false;
  private readonly FOG_SURGE_DURATION: number = 25; // 25 giây
  private readonly FOG_VISION_PENALTY: number = 35; // Giảm 35px tầm nhìn
  private readonly FOG_MOISTURE_MULT: number = 1.25; // Tăng 25% ngấm ẩm

  // Bộ đếm thời gian kích hoạt ngẫu nhiên sự kiện thế giới
  private eventIntervalTimer: number = 0;
  private readonly MIN_EVENT_INTERVAL: number = 50; // Ít nhất 50s giữa 2 sự kiện tự động
  private isPaused: boolean = false;

  // Danh mục 5 sự kiện môi trường động chuẩn V1.4
  public static readonly EVENT_DEFS: Record<WorldEventType, WorldEventDef> = {
    event_bell_echo: {
      type: 'event_bell_echo',
      contentId: 'HW-EVT-BELL-000001',
      nameVi: 'Tiếng Chuông Vọng',
      nameEn: 'Bell Echo Event',
      descriptionVi: 'Tiếng chuông trầm ngân vang từ xa xoa dịu Bình Tâm và dẫn hướng.',
      minIntervalSec: 60
    },
    event_fog_surge: {
      type: 'event_fog_surge',
      contentId: 'HW-EVT-FOG-000001',
      nameVi: 'Đợt Sương Dâng',
      nameEn: 'Fog Surge Event',
      descriptionVi: 'Màn sương lạnh bất chợt tràn qua khu rừng, làm giảm tầm nhìn và tăng ẩm.',
      minIntervalSec: 90
    },
    event_crow_alarm: {
      type: 'event_crow_alarm',
      contentId: 'HW-EVT-CROW-000001',
      nameVi: 'Quạ Báo Động',
      nameEn: 'Crow Alarm Event',
      descriptionVi: 'Đàn quạ giật mình kêu thét và phát ra sóng âm báo hiệu tới The Listener.',
      minIntervalSec: 45
    },
    event_false_footsteps: {
      type: 'event_false_footsteps',
      contentId: 'HW-EVT-STEP-000001',
      nameVi: 'Bước Chân Giả',
      nameEn: 'False Footsteps Event',
      descriptionVi: 'Tiếng bước chân vang vọng rỗng tuếch trong sương sâu tạo áp lực tâm lý.',
      minIntervalSec: 60
    },
    event_abandoned_camp: {
      type: 'event_abandoned_camp',
      contentId: 'HW-EVT-CAMP-000001',
      nameVi: 'Dấu Vết Trại Cũ',
      nameEn: 'Abandoned Camp Event',
      descriptionVi: 'Dấu vết lửa tàn của lữ khách xưa để lại than củi và dây thừng rừng.',
      minIntervalSec: 120
    }
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    WorldEventSystem.instance = this;
    this.eventIntervalTimer = 35; // Khởi đầu sau 35s
  }

  public static getInstance(scene?: Phaser.Scene): WorldEventSystem {
    if (!WorldEventSystem.instance && scene) {
      WorldEventSystem.instance = new WorldEventSystem(scene);
    }
    return WorldEventSystem.instance!;
  }

  /**
   * Kích hoạt chủ động một Sự kiện Môi trường Động (Scripted / Random trigger)
   */
  public triggerEvent(type: WorldEventType): WorldEventResult {
    const def = WorldEventSystem.EVENT_DEFS[type];
    const playerState = PlayerState.getInstance();
    const audio = AudioManager.getInstance();
    let message = '';

    switch (type) {
      case 'event_bell_echo': {
        audio.playBronzeBellToll();
        playerState.modifyComposure(5);
        message = '🔔 Tiếng chuông trầm ngân vang từ tàn tích miếu cổ xa xa... Bình Tâm được xoa dịu (+5).';
        break;
      }

      case 'event_fog_surge': {
        audio.playWindWhoosh();
        this.fogSurgeActive = true;
        this.fogSurgeTimer = this.FOG_SURGE_DURATION;
        message = '🌫️ Một đợt sương lạnh bất chợt tràn qua khu rừng! Tầm nhìn thu hẹp (-35px) và độ ẩm tăng cao!';
        break;
      }

      case 'event_crow_alarm': {
        audio.playCrowCaw();
        message = '🦅 Đàn quạ ngoài rìa rừng giật mình kêu thét hoảng loạn! Kẻ Lắng Nghe đang hướng tai nghe ngóng!';
        break;
      }

      case 'event_false_footsteps': {
        audio.playFalseFootsteps();
        message = '👣 Có tiếng bước chân dồn dập trong sương... nhưng âm sắc rỗng tuếch kỳ lạ.';
        break;
      }

      case 'event_abandoned_camp': {
        playerState.addItem('item_charcoal', 1);
        playerState.addItem('item_forest_rope', 1);
        message = '⛺ Bạn tìm thấy dấu vết trại cũ của một lữ khách xưa: thu được 1 Than Củi & 1 Dây Thừng Rừng.';
        break;
      }
    }

    // Phát sự kiện toàn cảnh ra GameScene
    const result: WorldEventResult = {
      type,
      contentId: def.contentId,
      nameVi: def.nameVi,
      message,
      applied: true
    };
    this.scene.events.emit('world_event_triggered', result);

    return result;
  }

  /**
   * Cập nhật đếm thời gian và quản lý trạng thái sự kiện
   */
  public update(dt: number, currentZoneId: string, timePhase: string): void {
    if (this.isPaused) return;

    // 1. Quản lý thời lượng Đợt Sương Dâng (Fog Surge)
    if (this.fogSurgeActive) {
      this.fogSurgeTimer -= dt;
      if (this.fogSurgeTimer <= 0) {
        this.fogSurgeActive = false;
        this.fogSurgeTimer = 0;
        this.scene.events.emit('fog_surge_ended');
      }
    }

    // 2. Tự động kích hoạt sự kiện ngẫu nhiên trong các phân khu rừng hoang dã
    const isForestZone = currentZoneId === 'outer_woods' || currentZoneId === 'crooked_path' || currentZoneId === 'deep_forest' || currentZoneId === 'silent_mire';
    if (isForestZone && (timePhase === 'DUSK' || timePhase === 'NIGHT')) {
      this.eventIntervalTimer -= dt;
      if (this.eventIntervalTimer <= 0) {
        this.eventIntervalTimer = this.MIN_EVENT_INTERVAL + Math.random() * 35;
        this.triggerRandomEvent();
      }
    }
  }

  private triggerRandomEvent(): void {
    const eventPool: WorldEventType[] = [
      'event_bell_echo',
      'event_fog_surge',
      'event_crow_alarm',
      'event_false_footsteps'
    ];
    const picked = eventPool[Math.floor(Math.random() * eventPool.length)];
    this.triggerEvent(picked);
  }

  public isFogSurgeActive(): boolean {
    return this.fogSurgeActive;
  }

  public getFogVisionReduction(): number {
    return this.fogSurgeActive ? this.FOG_VISION_PENALTY : 0;
  }

  public getFogMoistureMultiplier(): number {
    return this.fogSurgeActive ? this.FOG_MOISTURE_MULT : 1.0;
  }

  public setPaused(paused: boolean): void {
    this.isPaused = paused;
  }

  public destroy(): void {
    this.fogSurgeActive = false;
    this.fogSurgeTimer = 0;
    WorldEventSystem.instance = null;
  }
}
