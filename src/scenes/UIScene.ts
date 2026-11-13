import * as Phaser from 'phaser';
import { PlayerState } from '../state/PlayerState';
import { ZoneAtmosphere } from '../types';
import { HDTextHelper } from '../utils/HDTextHelper';

export class UIScene extends Phaser.Scene {
  private playerState!: PlayerState;

  // Đồ họa 4 thanh chỉ số pixel
  private statBarsGraphics!: Phaser.GameObjects.Graphics;
  private statIconsGraphics!: Phaser.GameObjects.Graphics;
  private lanternStatusText!: Phaser.GameObjects.Text;

  // Banner phân khu
  private zoneBannerContainer!: Phaser.GameObjects.Container;
  private zoneTitleText!: Phaser.GameObjects.Text;
  private zoneSubtitleText!: Phaser.GameObjects.Text;

  // Bảng nhiệm vụ góc trên phải
  private questTrackerText!: Phaser.GameObjects.Text;

  // Thanh vật phẩm nhanh (Quick Slot)
  private quickSlotContainer!: Phaser.GameObjects.Container;
  private poulticeCountText!: Phaser.GameObjects.Text;
  private lureCountText!: Phaser.GameObjects.Text;

  // Lời nhắc tương tác
  private promptText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'UIScene' });
  }

  public create(): void {
    // Đảm bảo Camera UI luôn hiển thị ở tỉ lệ chuẩn zoom = 1.0 không bị phóng to
    this.cameras.main.setZoom(1.0);

    this.playerState = PlayerState.getInstance();

    this.statBarsGraphics = this.add.graphics();
    this.statIconsGraphics = this.add.graphics();

    // 1. Dựng 4 icon pixel cho 4 chỉ số (Góc trên trái chuẩn HD 1280×720)
    this.drawPixelIcons();

    // 2. Chữ trạng thái Đèn lồng chuẩn HD đặt cạnh thanh Dầu Đèn
    this.lanternStatusText = HDTextHelper.createText(this, 274, 57, 'ĐÈN: TẮT [F]', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#95a5a6',
      stroke: '#000000',
      strokeThickness: 2
    });

    // 3. Khung bảng theo dõi nhiệm vụ góc trên phải (x: 1250, y: 24, rộng 360px, cao 84px)
    const questBoxW = 360;
    const questBoxH = 84;
    const questBoxX = 1250 - questBoxW; // 890
    const questBoxY = 24;

    const questBg = this.add.graphics();
    questBg.fillStyle(0x0b0e14, 0.90);
    questBg.fillRoundedRect(questBoxX, questBoxY, questBoxW, questBoxH, 8);
    questBg.lineStyle(2, 0x8a6d3b, 1);
    questBg.strokeRoundedRect(questBoxX, questBoxY, questBoxW, questBoxH, 8);
    questBg.lineStyle(1, 0xd4af37, 0.6);
    questBg.strokeRoundedRect(questBoxX + 3, questBoxY + 3, questBoxW - 6, questBoxH - 6, 6);

    HDTextHelper.createText(this, questBoxX + 16, questBoxY + 12, 'MỤC TIÊU HIỆN TẠI [J]:', {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#f39c12',
      stroke: '#000000',
      strokeThickness: 2
    });

    this.questTrackerText = HDTextHelper.createText(this, questBoxX + 16, questBoxY + 34, '', {
      fontSize: '13px',
      color: '#f8f9fa',
      wordWrap: { width: questBoxW - 32 },
      lineSpacing: 5
    });

    // 4. Banner tên phân khu có nền tối chống chìm chữ (Tâm tại 640, 85)
    this.zoneBannerContainer = this.add.container(640, 85);
    const bannerBg = this.add.graphics();
    bannerBg.fillStyle(0x000000, 0.85);
    bannerBg.fillRoundedRect(-240, -28, 480, 56, 8);
    bannerBg.lineStyle(2, 0xd4af37, 0.9);
    bannerBg.strokeRoundedRect(-240, -28, 480, 56, 8);

    this.zoneTitleText = HDTextHelper.createText(this, 0, -10, '', {
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5);

    this.zoneSubtitleText = HDTextHelper.createText(this, 0, 12, '', {
      fontSize: '13px',
      fontStyle: 'italic',
      color: '#bdc3c7'
    }).setOrigin(0.5, 0.5);

    this.zoneBannerContainer.add([bannerBg, this.zoneTitleText, this.zoneSubtitleText]);
    this.zoneBannerContainer.setAlpha(0);

    // 5. Thanh vật phẩm nhanh dưới đáy màn hình đặt tại (640, 685)
    this.buildQuickSlots();

    // 6. Lời nhắc tương tác [E] chuẩn HD đặt tại (640, 630)
    this.promptText = HDTextHelper.createText(this, 640, 630, '', {
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#f1c40f',
      backgroundColor: '#0a0d14ee',
      padding: { x: 14, y: 6 },
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5).setAlpha(0);

    // 7. Lắng nghe sự kiện từ PlayerState
    this.playerState.on('stats_changed', () => this.redrawStats());
    this.playerState.on('quest_changed', () => this.updateQuestTracker());
    this.playerState.on('quest_updated', () => this.updateQuestTracker());
    this.playerState.on('inventory_changed', () => this.updateQuickSlotCounts());

    // Cập nhật ban đầu
    this.redrawStats();
    this.updateQuestTracker();
    this.updateQuickSlotCounts();

    // Lắng nghe phím số 1 để dùng Thuốc Đắp
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-ONE', () => {
        if (this.playerState.useItem('item_herbal_poultice')) {
          this.showPopupMessage('Đã dùng Thuốc Đắp (+40 Máu, +25 Bình Tâm)');
        }
      });
    }
  }

  private drawPixelIcons(): void {
    const g = this.statIconsGraphics;
    g.clear();

    // 1. Icon Máu: Trái tim đỏ HD (X: 16, Y: 18)
    g.fillStyle(0xe74c3c, 1);
    g.fillRect(16, 20, 18, 12);
    g.fillRect(18, 18, 5, 3);
    g.fillRect(27, 18, 5, 3);

    // 2. Icon Thể lực: Sấm sét vàng HD (X: 16, Y: 38)
    g.fillStyle(0xf1c40f, 1);
    g.fillRect(23, 37, 6, 4);
    g.fillRect(19, 41, 10, 4);
    g.fillRect(22, 45, 5, 5);

    // 3. Icon Dầu đèn: Ngọn lửa cam HD (X: 16, Y: 56)
    g.fillStyle(0xe67e22, 1);
    g.fillRect(22, 55, 6, 4);
    g.fillRect(19, 59, 12, 6);
    g.fillRect(22, 65, 6, 3);

    // 4. Icon Bình tâm: Mắt tím HD (X: 16, Y: 74)
    g.fillStyle(0x9b59b6, 1);
    g.fillRect(18, 75, 14, 9);
    g.fillStyle(0x2c3e50, 1);
    g.fillRect(22, 77, 6, 5);
  }

  public redrawStats(): void {
    const stats = this.playerState.stats;
    const g = this.statBarsGraphics;
    g.clear();

    const barX = 42;
    const barWidth = 220;

    // 1. Thanh Máu (Đỏ 3D, Cao 14px)
    this.drawThickBar(g, barX, 18, barWidth, 14, stats.health, stats.maxHealth, 0x962d22, 0xe74c3c);

    // 2. Thanh Thể Lực (Vàng 3D, Cao 11px)
    this.drawThickBar(g, barX, 37, barWidth, 11, stats.stamina, stats.maxStamina, 0xb7950b, 0xf1c40f);

    // 3. Thanh Dầu Đèn (Cam 3D, Cao 11px)
    this.drawThickBar(g, barX, 55, barWidth, 11, stats.lanternOil, stats.maxLanternOil, 0xa04000, 0xe67e22);

    // 4. Thanh Bình Tâm (Tím 3D, Cao 11px)
    this.drawThickBar(g, barX, 73, barWidth, 11, stats.composure, stats.maxComposure, 0x5b2c6f, 0x9b59b6);

    // Cập nhật trạng thái chữ đèn
    if (stats.isLanternOn) {
      this.lanternStatusText.setText('ĐÈN: BẬT [F]');
      this.lanternStatusText.setColor('#f1c40f');
    } else {
      this.lanternStatusText.setText('ĐÈN: TẮT [F]');
      this.lanternStatusText.setColor('#7f8c8d');
    }
  }

  private drawThickBar(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, val: number, max: number, darkColor: number, lightColor: number): void {
    // Nền rãnh thanh chuẩn HD
    g.fillStyle(0x0e1118, 0.95);
    g.fillRoundedRect(x - 2, y - 2, w + 4, h + 4, 3);
    g.lineStyle(1, 0x3d4a5d, 0.9);
    g.strokeRoundedRect(x - 2, y - 2, w + 4, h + 4, 3);

    const fillW = Math.max(0, Math.min(w, (val / max) * w));
    if (fillW > 0) {
      // Thân thanh
      g.fillStyle(darkColor, 1);
      g.fillRoundedRect(x, y, fillW, h, 2);
      // Ánh sáng nổi 3D ở mép trên
      g.fillStyle(lightColor, 0.9);
      g.fillRect(x + 1, y, fillW - 2, Math.max(2, Math.floor(h * 0.35)));
    }
  }

  private buildQuickSlots(): void {
    // Đặt Thanh Phím Tắt Đáy tại (x: 640, y: 685) với khoảng cách nút thoáng đãng chuẩn HD
    this.quickSlotContainer = this.add.container(640, 685);

    const slotNames = [
      { key: '[1] Thuốc Đắp', id: 'poultice' },
      { key: '[Q] Mồi Ném', id: 'lure' },
      { key: '[F] Đèn Lồng', id: 'lantern' },
      { key: '[I] Chế Tạo', id: 'craft' },
      { key: '[J] Sổ Tay', id: 'journal' },
      { key: '[ESC] Tạm Dừng', id: 'pause' }
    ];

    let startX = -320;
    const btnW = 116;
    const btnH = 32;

    for (const slot of slotNames) {
      const g = this.add.graphics();
      g.fillStyle(0x0b0e14, 0.90);
      g.fillRoundedRect(startX - btnW / 2, -btnH / 2, btnW, btnH, 6);
      g.lineStyle(1, 0x4a5568, 0.85);
      g.strokeRoundedRect(startX - btnW / 2, -btnH / 2, btnW, btnH, 6);

      const label = HDTextHelper.createText(this, startX, 0, slot.key, {
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#ecf0f1'
      }).setOrigin(0.5, 0.5);

      this.quickSlotContainer.add([g, label]);

      if (slot.id === 'poultice') {
        this.poulticeCountText = HDTextHelper.createText(this, startX + btnW / 2 - 8, -btnH / 2 + 3, 'x0', {
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#2ecc71',
          stroke: '#000000',
          strokeThickness: 2
        }).setOrigin(1, 0);
        this.quickSlotContainer.add(this.poulticeCountText);
      } else if (slot.id === 'lure') {
        this.lureCountText = HDTextHelper.createText(this, startX + btnW / 2 - 8, -btnH / 2 + 3, 'x0', {
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#e67e22',
          stroke: '#000000',
          strokeThickness: 2
        }).setOrigin(1, 0);
        this.quickSlotContainer.add(this.lureCountText);
      }

      startX += 128;
    }
  }

  public updateQuickSlotCounts(): void {
    const poulticeCount = this.playerState.getItemCount('item_herbal_poultice');
    const lureCount = this.playerState.getItemCount('item_noise_lure');

    if (this.poulticeCountText) this.poulticeCountText.setText(`x${poulticeCount}`);
    if (this.lureCountText) this.lureCountText.setText(`x${lureCount}`);
  }

  public updateQuestTracker(): void {
    const q = this.playerState.getCurrentQuest();
    if (q) {
      const activeTask = q.tasks.find(t => !t.done);
      const taskStr = activeTask ? activeTask.text : 'Đã hoàn thành phân đoạn này';
      this.questTrackerText.setText(`${q.title}\n▶ ${taskStr}`);
    }
  }

  public showZoneBanner(atmosphere: ZoneAtmosphere): void {
    this.zoneTitleText.setText(atmosphere.titleVietnamese);
    this.zoneSubtitleText.setText(atmosphere.subTitleVietnamese);

    this.tweens.killTweensOf(this.zoneBannerContainer);
    this.zoneBannerContainer.setAlpha(0);

    this.tweens.add({
      targets: this.zoneBannerContainer,
      alpha: 1,
      duration: 600,
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
   * Ẩn/Hiện thanh phím tắt và nhãn tương tác khi hộp thoại mở/đóng (PASS T13)
   */
  public setDialogueActive(active: boolean): void {
    if (this.quickSlotContainer) {
      this.quickSlotContainer.setVisible(!active);
    }
    if (active) {
      this.setInteractionPrompt(null);
    }
  }

  public showPopupMessage(msg: string): void {
    const popup = HDTextHelper.createText(this, 640, 140, msg, {
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#2ecc71',
      backgroundColor: '#0b0e14ee',
      padding: { x: 16, y: 8 },
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5).setDepth(10000);

    this.tweens.add({
      targets: popup,
      y: 110,
      alpha: 0,
      duration: 2200,
      ease: 'Power2',
      onComplete: () => popup.destroy()
    });
  }
}
