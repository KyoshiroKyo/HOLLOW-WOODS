import * as Phaser from 'phaser';
import { SCENE_HUD } from '../config/Constants';
import { PlayerStats, ZoneAtmosphere } from '../types';
import { HDTextHelper } from '../utils/HDTextHelper';

export class HUDScene extends Phaser.Scene {
  private healthBar!: Phaser.GameObjects.Graphics;
  private staminaBar!: Phaser.GameObjects.Graphics;
  private oilBar!: Phaser.GameObjects.Graphics;
  private composureBar!: Phaser.GameObjects.Graphics;

  private zoneTitleText!: Phaser.GameObjects.Text;
  private zoneSubtitleText!: Phaser.GameObjects.Text;
  private promptText!: Phaser.GameObjects.Text;
  private lanternStatusText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: SCENE_HUD });
  }

  public create(): void {
    // Đảm bảo Camera HUD luôn hiển thị ở tỉ lệ chuẩn zoom = 1.0 không bị phóng to
    this.cameras.main.setZoom(1.0);

    // 1. Khởi tạo các thanh đồ họa chỉ số chuẩn HD
    this.healthBar = this.add.graphics();
    this.staminaBar = this.add.graphics();
    this.oilBar = this.add.graphics();
    this.composureBar = this.add.graphics();

    // 2. Trạng thái đèn lồng chuẩn HD đặt cạnh thanh dầu đèn
    this.lanternStatusText = HDTextHelper.createText(this, 274, 57, 'ĐÈN: TẮT [F]', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#bdc3c7',
      stroke: '#000000',
      strokeThickness: 2
    });

    // 3. Banner tiêu đề phân khu khi bước vào khu vực mới (Tâm 640, 85)
    this.zoneTitleText = HDTextHelper.createText(this, 640, 75, '', {
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#ecf0f1',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5).setAlpha(0);

    this.zoneSubtitleText = HDTextHelper.createText(this, 640, 98, '', {
      fontSize: '13px',
      fontStyle: 'italic',
      color: '#bdc3c7',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5).setAlpha(0);

    // 4. Gợi ý tương tác vật thể chuẩn HD (Tâm 640, 630)
    this.promptText = HDTextHelper.createText(this, 640, 630, '', {
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#f39c12',
      backgroundColor: '#0a0d14ee',
      padding: { x: 14, y: 6 },
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5).setAlpha(0);
  }

  public updateStats(stats: PlayerStats): void {
    const barX = 24;
    const barWidth = 220;

    // 1. Thanh Máu (Health - Đỏ HD)
    this.healthBar.clear();
    this.healthBar.fillStyle(0x0e1118, 0.95);
    this.healthBar.fillRoundedRect(barX - 2, 16, barWidth + 4, 18, 3);
    this.healthBar.lineStyle(1, 0x3d4a5d, 0.9);
    this.healthBar.strokeRoundedRect(barX - 2, 16, barWidth + 4, 18, 3);
    this.healthBar.fillStyle(0xc0392b, 1);
    this.healthBar.fillRoundedRect(barX, 18, Math.max(0, (stats.health / stats.maxHealth) * barWidth), 14, 2);

    // 2. Thanh Thể Lực (Stamina - Vàng HD)
    this.staminaBar.clear();
    this.staminaBar.fillStyle(0x0e1118, 0.95);
    this.staminaBar.fillRoundedRect(barX - 2, 35, barWidth + 4, 15, 3);
    this.staminaBar.lineStyle(1, 0x3d4a5d, 0.9);
    this.staminaBar.strokeRoundedRect(barX - 2, 35, barWidth + 4, 15, 3);
    this.staminaBar.fillStyle(0xf1c40f, 1);
    this.staminaBar.fillRoundedRect(barX, 37, Math.max(0, (stats.stamina / stats.maxStamina) * barWidth), 11, 2);

    // 3. Thanh Dầu Đèn (Lantern Oil - Cam HD)
    this.oilBar.clear();
    this.oilBar.fillStyle(0x0e1118, 0.95);
    this.oilBar.fillRoundedRect(barX - 2, 53, barWidth + 4, 15, 3);
    this.oilBar.lineStyle(1, 0x3d4a5d, 0.9);
    this.oilBar.strokeRoundedRect(barX - 2, 53, barWidth + 4, 15, 3);
    this.oilBar.fillStyle(0xd35400, 1);
    this.oilBar.fillRoundedRect(barX, 55, Math.max(0, (stats.lanternOil / stats.maxLanternOil) * barWidth), 11, 2);

    // 4. Thanh Bình Tâm (Composure - Tím HD)
    this.composureBar.clear();
    this.composureBar.fillStyle(0x0e1118, 0.95);
    this.composureBar.fillRoundedRect(barX - 2, 71, barWidth + 4, 15, 3);
    this.composureBar.lineStyle(1, 0x3d4a5d, 0.9);
    this.composureBar.strokeRoundedRect(barX - 2, 71, barWidth + 4, 15, 3);
    this.composureBar.fillStyle(0x8e44ad, 1);
    this.composureBar.fillRoundedRect(barX, 73, Math.max(0, (stats.composure / stats.maxComposure) * barWidth), 11, 2);

    // Cập nhật trạng thái đèn
    if (stats.isLanternOn) {
      this.lanternStatusText.setText('ĐÈN: BẬT [F]');
      this.lanternStatusText.setColor('#f1c40f');
    } else {
      this.lanternStatusText.setText('ĐÈN: TẮT [F]');
      this.lanternStatusText.setColor('#7f8c8d');
    }
  }

  public showZoneBanner(atmosphere: ZoneAtmosphere): void {
    this.zoneTitleText.setText(atmosphere.titleVietnamese);
    this.zoneSubtitleText.setText(atmosphere.subTitleVietnamese);

    this.tweens.killTweensOf(this.zoneTitleText);
    this.tweens.killTweensOf(this.zoneSubtitleText);

    this.zoneTitleText.setAlpha(0);
    this.zoneSubtitleText.setAlpha(0);

    this.tweens.add({
      targets: [this.zoneTitleText, this.zoneSubtitleText],
      alpha: 1,
      duration: 800,
      hold: 2500,
      yoyo: true,
      ease: 'Power2'
    });
  }

  public setInteractionPrompt(prompt: string | null): void {
    if (prompt) {
      this.promptText.setText(prompt);
      this.promptText.setAlpha(1);
    } else {
      this.promptText.setAlpha(0);
    }
  }

  /**
   * Ẩn gợi ý tương tác khi hộp thoại mở (PASS T13)
   */
  public setDialogueActive(active: boolean): void {
    if (active) {
      this.setInteractionPrompt(null);
    }
  }
}
