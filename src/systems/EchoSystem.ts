import * as Phaser from 'phaser';
import { TheEcho } from '../entities/TheEcho';
import { PlayerState } from '../state/PlayerState';

export interface EchoSpawnPoint {
  id: string;
  x: number;
  y: number;
  targetClueX: number;
  targetClueY: number;
  message: string;
  triggered: boolean;
}

export class EchoSystem {
  private scene: Phaser.Scene;
  private echoSpawns: EchoSpawnPoint[] = [
    {
      id: 'echo_fog_gate',
      x: 390,
      y: 180,
      targetClueX: 450,
      targetClueY: 180,
      message: 'Một bóng hình lữ khách mờ ảo thì thầm về ngày ngôi làng bị sương mù nuốt chửng: “Khi tiếng chuông câm lặng... sương mù nuốt chửng Bellhollow... đừng để ngọn lửa lụi tàn...”',
      triggered: false
    },
    {
      id: 'echo_crooked_tree',
      x: 1860,
      y: 220,
      targetClueX: 1900,
      targetClueY: 180,
      message: 'Tiếng vọng ký ức thì thào: “Ngày màn sương dâng lên, dân làng chạy vào những thân cây rỗng... Ẩn nấp khi tiếng bước chân cất lên...”',
      triggered: false
    },
    {
      id: 'echo_mire_entrance',
      x: 2750,
      y: 280,
      targetClueX: 2820,
      targetClueY: 280,
      message: 'Hình bóng mờ thì thào về ngày ngôi làng chìm vào bóng tối: “Đừng theo chiếc đèn thứ hai... hãy nhìn ký hiệu cổ nơi miếu chuông để phục hồi phong ấn...”',
      triggered: false
    }
  ];

  public activeEchoContainer: TheEcho | null = null;
  private currentSpawnPoint: EchoSpawnPoint | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public update(
    playerX: number,
    playerY: number,
    onEchoDisappear?: (msg: string) => void,
    playerFacing: string = 'down',
    isLanternLit: boolean = false,
    onGazeNotice?: (msg: string) => void
  ): void {
    // 1. Kiểm tra kích hoạt Echo mới nếu chưa có Echo đang hiển thị
    if (!this.activeEchoContainer) {
      for (const sp of this.echoSpawns) {
        if (!sp.triggered) {
          const dist = Math.hypot(playerX - sp.x, playerY - sp.y);
          // Xuất hiện ở rìa tầm nhìn (~140–200 px)
          if (dist <= 180 && dist >= 80) {
            this.spawnEcho(sp);
            break;
          }
        }
      }
    } else if (this.currentSpawnPoint) {
      // 2. Nếu Satyr tiến lại gần trong bán kính 48px -> Echo tan biến thành tàn tro phát sáng
      const dist = Math.hypot(playerX - this.currentSpawnPoint.x, playerY - this.currentSpawnPoint.y);
      if (dist <= 48) {
        this.dissolveEcho(onEchoDisappear);
      } else {
        // V1.4 - P8-03: Kiểm tra góc nhìn trực diện khi đèn lồng TẮT (-5 Composure)
        if (this.activeEchoContainer.checkDirectGaze(playerX, playerY, playerFacing, isLanternLit)) {
          if (onGazeNotice) {
            onGazeNotice('👁️ Ánh nhìn vào bóng hình trong bóng tối khiến bạn lạnh gáy... (-5 Tĩnh Tâm)');
          }
        }
      }
    }
  }

  private spawnEcho(sp: EchoSpawnPoint): void {
    sp.triggered = true;
    this.currentSpawnPoint = sp;

    // V1.4: Khởi tạo thực thể TheEcho độc lập không gây sát thương vật lý
    this.activeEchoContainer = new TheEcho(this.scene, {
      id: sp.id,
      x: sp.x,
      y: sp.y,
      message: sp.message,
      targetClueX: sp.targetClueX,
      targetClueY: sp.targetClueY
    });
  }

  private dissolveEcho(callback?: (msg: string) => void): void {
    if (!this.activeEchoContainer || !this.currentSpawnPoint) return;

    const sp = this.currentSpawnPoint;
    const echo = this.activeEchoContainer;

    const ps = PlayerState.getInstance();
    if (ps.memoryAwakeningStage < 2) {
      ps.setMemoryAwakeningStage(2);
      this.scene.events.emit('memory_awakening_stage_changed', 2);
    }

    echo.dissolve((msg) => {
      this.activeEchoContainer = null;
      this.currentSpawnPoint = null;
      if (callback) {
        callback(msg || sp.message);
      }
    });
  }
}


