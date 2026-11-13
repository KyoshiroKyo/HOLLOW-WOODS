import * as Phaser from 'phaser';
import { SCENE_MAIN_MENU } from '../config/Constants';
import { PlayerState } from '../state/PlayerState';
import { AudioManager } from '../audio/AudioManager';
import { HDTextHelper } from '../utils/HDTextHelper';

export class EndingSystem {
  private scene: Phaser.Scene;
  private playerState: PlayerState;
  public isEndingActive: boolean = false;

  private endingContainer!: Phaser.GameObjects.Container;
  private timeRiftGraphics!: Phaser.GameObjects.Graphics;
  private endingTextContainer!: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.playerState = PlayerState.getInstance();
    this.setupEndingUI();
  }

  private setupEndingUI(): void {
    this.endingContainer = this.scene.add.container(0, 0);
    this.endingContainer.setScrollFactor(0);
    this.endingContainer.setDepth(9999);
    this.endingContainer.setVisible(false);

    // Khe nhìn xuyên thời đại (Time Rift)
    this.timeRiftGraphics = this.scene.add.graphics();
    this.timeRiftGraphics.setScrollFactor(0);
    this.timeRiftGraphics.setDepth(9998);
    this.timeRiftGraphics.setVisible(false);

    this.endingTextContainer = this.scene.add.container(0, 0);
    this.endingContainer.add(this.endingTextContainer);
  }

  public triggerTheFirstTollFinale(onComplete?: () => void): void {
    if (this.isEndingActive) return;
    this.isEndingActive = true;

    const cam = this.scene.cameras.main;

    // GIAI ĐOẠN 1: TIẾNG CHUÔNG ĐỒNG ĐẦU TIÊN (THE FIRST TOLL)
    cam.shake(1500, 0.025);
    cam.flash(1800, 255, 255, 255);
    AudioManager.getInstance().playBronzeBellToll();

    // Kích hoạt cờ chuông rung và hoàn thành nhiệm vụ Act 6
    this.playerState.setFlag('bell_rung');
    this.playerState.completeQuestTask('Q06_RETRIEVE_CLAPPER', 't2');

    // GIAI ĐOẠN 2: KHE NHÌN XUYÊN THỜI ĐẠI (TIME RIFT)
    this.scene.time.delayedCall(1800, () => {
      this.playTimeRiftCutscene(() => {
        // GIAI ĐOẠN 3: BÍ MẬT CUỐN SỔ DA CỦA SATYR & MÀN HÌNH KẾT THÚC
        this.playFinalCreditsCutscene(onComplete);
      });
    });
  }

  private playTimeRiftCutscene(onRiftClosed: () => void): void {
    this.timeRiftGraphics.setVisible(true);
    this.timeRiftGraphics.clear();

    const riftX = 640;
    const riftY = 300;

    // Dựng khe nứt không gian đa tầng phát sáng huyền ảo màu xanh lam hiện đại trên chuẩn HD 1280×720
    const g = this.timeRiftGraphics;
    
    // Quầng sáng năng lượng thời gian tỏa rộng
    g.fillStyle(0x2980b9, 0.25);
    g.fillEllipse(riftX, riftY, 420, 220);

    g.fillStyle(0x3498db, 0.45);
    g.fillEllipse(riftX, riftY, 320, 160);

    g.fillStyle(0x5dade2, 0.70);
    g.fillEllipse(riftX, riftY, 220, 100);

    g.fillStyle(0xebf5fb, 0.95);
    g.fillEllipse(riftX, riftY, 150, 60);

    // Hình bóng con đường nhựa quốc lộ ven rừng và đèn pha ô tô thế giới hiện đại
    g.fillStyle(0x1a252f, 1);
    g.fillRect(riftX - 70, riftY - 18, 140, 36);

    // Đèn pha ô tô rực rỡ màu vàng kim
    g.fillStyle(0xf1c40f, 0.35);
    g.fillCircle(riftX - 35, riftY, 16);
    g.fillCircle(riftX + 35, riftY, 16);

    g.fillStyle(0xfff9c4, 1.0);
    g.fillCircle(riftX - 35, riftY, 8);
    g.fillCircle(riftX + 35, riftY, 8);

    // Lời thoại Satyr thảng thốt chuẩn HD 1280×720
    const riftDialogue = HDTextHelper.createText(
      this.scene,
      640, 
      610, 
      'Satyr: “Ánh đèn pha ô tô... quốc lộ ven rừng?! Thế giới của mình... con đường về nhà có thật!”', 
      {
        fontSize: '18px',
        fontStyle: 'italic',
        color: '#58d68d',
        backgroundColor: '#0a0e14f0',
        padding: { x: 28, y: 14 },
        stroke: '#000000',
        strokeThickness: 3
      }
    ).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(10000);

    // Khe nứt co lại và đóng sầm sau 4.8 giây
    this.scene.time.delayedCall(4800, () => {
      this.scene.tweens.add({
        targets: [this.timeRiftGraphics, riftDialogue],
        alpha: 0,
        scaleY: 0.05,
        duration: 900,
        onComplete: () => {
          this.timeRiftGraphics.setVisible(false);
          riftDialogue.destroy();
          onRiftClosed();
        }
      });
    });
  }

  private playFinalCreditsCutscene(onComplete?: () => void): void {
    this.endingContainer.setVisible(true);

    // 1. Màn đen tối sầm phủ toàn màn hình HD 1280×720
    const blackBg = this.scene.add.graphics();
    blackBg.fillStyle(0x05070a, 1);
    blackBg.fillRect(0, 0, 1280, 720);
    blackBg.setAlpha(0);

    this.endingContainer.add(blackBg);

    this.scene.tweens.add({
      targets: blackBg,
      alpha: 1,
      duration: 1600,
      onComplete: () => {
        this.renderFinalTextLines(onComplete);
      }
    });
  }

  private renderFinalTextLines(onComplete?: () => void): void {
    const lines = [
      { text: 'Dưới chân bệ chuông, một cuốn sổ da cũ rơi ra từ khe đá...', delay: 600, size: '18px', color: '#95a5a6' },
      { text: 'Trang giấy ố vàng phác họa chân dung một kẻ lữ khách từ hàng trăm năm trước...', delay: 2800, size: '18px', color: '#bdc3c7' },
      { text: 'Gương mặt ấy... đôi sừng ấy... giống hệt Satyr từng nét vẽ.', delay: 5200, size: '20px', color: '#e74c3c' },
      { text: '“Khu rừng không chỉ đưa ta đến đây. Có lẽ nó đã chờ ta từ rất lâu.”', delay: 7800, size: '22px', color: '#f39c12', italic: true },
      { text: 'HOLLOW WOODS V3.0', delay: 10500, size: '36px', color: '#ffffff', bold: true },
      { text: 'TẬP 1: THE FIRST TOLL (TIẾNG CHUÔNG ĐẦU TIÊN) — HOÀN THÀNH', delay: 12200, size: '18px', color: '#2ecc71', bold: true },
      { text: 'THE FOREST REMEMBERS. TO BE CONTINUED...', delay: 13900, size: '16px', color: '#7f8c8d' }
    ];

    let currentY = 85;
    const yOffsets = [0, 48, 50, 56, 75, 48, 42];

    lines.forEach((item, index) => {
      currentY += yOffsets[index];
      const targetY = currentY;

      this.scene.time.delayedCall(item.delay, () => {
        const textObj = HDTextHelper.createText(this.scene, 640, targetY, item.text, {
          fontSize: item.size,
          fontStyle: item.bold ? 'bold' : (item.italic ? 'italic' : 'normal'),
          color: item.color,
          align: 'center',
          stroke: '#000000',
          strokeThickness: item.bold ? 4 : 2
        }).setOrigin(0.5, 0.5).setAlpha(0);

        this.endingTextContainer.add(textObj);

        this.scene.tweens.add({
          targets: textObj,
          alpha: 1,
          duration: 1000
        });
      });
    });

    // Nút quay về Menu Chính chuẩn HD 1280×720 sau khi chạy xong credits
    this.scene.time.delayedCall(15600, () => {
      const returnBtn = HDTextHelper.createText(this.scene, 640, 645, '▶ QUAY VỀ MENU CHÍNH', {
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#f39c12',
        backgroundColor: '#111620',
        padding: { x: 28, y: 12 },
        stroke: '#f39c12',
        strokeThickness: 1
      }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });

      returnBtn.on('pointerover', () => {
        returnBtn.setStyle({ color: '#ffffff', backgroundColor: '#d35400' });
      });
      returnBtn.on('pointerout', () => {
        returnBtn.setStyle({ color: '#f39c12', backgroundColor: '#111620' });
      });

      returnBtn.on('pointerdown', () => {
        this.scene.scene.stop('UIScene');
        this.scene.scene.start(SCENE_MAIN_MENU);
        if (onComplete) onComplete();
      });

      this.endingTextContainer.add(returnBtn);
    });
  }
}
