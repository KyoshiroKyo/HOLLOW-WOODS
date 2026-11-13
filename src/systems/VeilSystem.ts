import * as Phaser from 'phaser';
import { PlayerState } from '../state/PlayerState';
import { SPRITE_FOG_SMOOTH } from '../config/Constants';
import { HDTextHelper } from '../utils/HDTextHelper';

export class VeilSystem {
  private scene: Phaser.Scene;
  private playerState: PlayerState;

  // Lớp sương mù gradient mềm mại nhiều tầng (PASS T10 - Smooth Veil Fog)
  private fogLayer1: Phaser.GameObjects.TileSprite;
  private fogLayer2: Phaser.GameObjects.TileSprite;
  
  // Hiệu ứng nhận thức tâm lý (Psychological Horror)
  private whisperText: Phaser.GameObjects.Text;
  private distortionOverlay: Phaser.GameObjects.Graphics;
  private nextWhisperTime: number = 0;

  private whispers: string[] = [
    '“Satyr... quay lại đi... con đường về nhà ở phía sau...”',
    '“Đừng nghe bà lão... tiếng chuông sẽ giết chết tất cả...”',
    '“Có kẻ đang thở ngay sau gáy ngươi...”',
    '“Khu rừng nhớ rõ ngươi... ngươi đã từng ở đây...”',
    '“Chiếc đèn thứ hai... hãy đi theo chiếc đèn thứ hai...”'
  ];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.playerState = PlayerState.getInstance();

    // 1. Lớp sương mù bề mặt cuộn ngang mượt mà trên khung hình HD 1280×720
    this.fogLayer1 = scene.add.tileSprite(0, 0, 1280, 720, SPRITE_FOG_SMOOTH);
    this.fogLayer1.setOrigin(0, 0);
    this.fogLayer1.setScrollFactor(0);
    this.fogLayer1.setDepth(5500);
    this.fogLayer1.setAlpha(0.28);

    // 2. Lớp sương mù chiều sâu chuyển động chậm tạo chiều sâu không gian
    this.fogLayer2 = scene.add.tileSprite(0, 0, 1280, 720, SPRITE_FOG_SMOOTH);
    this.fogLayer2.setOrigin(0, 0);
    this.fogLayer2.setScrollFactor(0);
    this.fogLayer2.setDepth(5501);
    this.fogLayer2.setAlpha(0.18);
    this.fogLayer2.setTileScale(1.4, 1.4);

    this.distortionOverlay = scene.add.graphics();
    this.distortionOverlay.setScrollFactor(0);
    this.distortionOverlay.setDepth(5600);

    // Dòng chữ thì thầm tâm lý ma quái ở góc trên màn hình chuẩn HD 1280×720
    this.whisperText = HDTextHelper.createText(scene, 640, 110, '', {
      fontSize: '16px',
      fontStyle: 'italic',
      color: '#e74c3c',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(9900).setAlpha(0);
  }

  public update(time: number, delta: number, inDeepFogZone: boolean): void {
    const dt = delta / 1000;
    const composure = this.playerState.stats.composure;
    const isLanternOn = this.playerState.stats.isLanternOn;

    // 1. Cuộn sương mù mượt mà liên tục (Không dùng bất kỳ hình tròn đục nào)
    this.fogLayer1.tilePositionX += 16 * dt;
    this.fogLayer1.tilePositionY += 2 * Math.sin(time * 0.001) * dt;

    this.fogLayer2.tilePositionX += 9 * dt;
    this.fogLayer2.tilePositionY += -1.5 * Math.cos(time * 0.0008) * dt;

    // 2. Điều chỉnh độ đậm sương mù mượt mà tùy trạng thái đèn & vùng rừng sâu
    let targetAlpha1 = 0.28;
    let targetAlpha2 = 0.18;

    if (inDeepFogZone) {
      targetAlpha1 += 0.18;
      targetAlpha2 += 0.14;
    }
    if (!isLanternOn) {
      targetAlpha1 += 0.20;
      targetAlpha2 += 0.15;
    }

    // Chuyển dịch alpha mềm mại (Linear interpolation)
    this.fogLayer1.alpha = Phaser.Math.Linear(this.fogLayer1.alpha, targetAlpha1, 0.06);
    this.fogLayer2.alpha = Phaser.Math.Linear(this.fogLayer2.alpha, targetAlpha2, 0.06);

    // 3. Xử lý hiệu ứng Tâm Lý Kinh Dị khi Composure < 50 hoặc ở vùng sương sâu mà tắt đèn
    const isMindUnstable = composure < 50 || (inDeepFogZone && !isLanternOn);
    this.updatePsychologicalEffects(time, isMindUnstable, composure);
  }

  private updatePsychologicalEffects(time: number, unstable: boolean, composure: number): void {
    this.distortionOverlay.clear();

    if (!unstable) {
      this.whisperText.setAlpha(0);
      return;
    }

    // Mức độ hoảng loạn từ 0 -> 1
    const panicSeverity = Math.max(0, (50 - composure) / 50);

    // A. Hiệu ứng viền màn hình đỏ tía rùng rợn (Vignette giật cục) chuẩn HD 1280×720
    if (panicSeverity > 0.15) {
      const pulseAlpha = (Math.sin(time * 0.005) * 0.5 + 0.5) * panicSeverity * 0.45;
      this.distortionOverlay.fillStyle(0x3a0d1a, pulseAlpha);
      // Viền 4 góc
      this.distortionOverlay.fillRect(0, 0, 1280, 32);
      this.distortionOverlay.fillRect(0, 720 - 32, 1280, 32);
      this.distortionOverlay.fillRect(0, 0, 32, 720);
      this.distortionOverlay.fillRect(1280 - 32, 0, 32, 720);
    }

    // B. Xuất hiện tiếng thì thầm ma mị từ sương mù (Quy Tắc 1)
    if (time > this.nextWhisperTime) {
      this.nextWhisperTime = time + Phaser.Math.Between(7000, 12000);
      const chosenWhisper = Phaser.Utils.Array.GetRandom(this.whispers);
      
      this.whisperText.setText(chosenWhisper);
      HDTextHelper.applyHD(this.whisperText);
      this.scene.tweens.add({
        targets: this.whisperText,
        alpha: 0.95,
        y: 100,
        duration: 900,
        hold: 3000,
        yoyo: true,
        ease: 'Power2',
        onComplete: () => {
          this.whisperText.setY(110);
        }
      });
    }
  }
}

