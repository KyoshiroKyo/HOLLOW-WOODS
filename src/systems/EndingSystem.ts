/**
 * HOLLOW WOODS V1.3
 * REPAIRED ENDING SYSTEM & SCREEN-SPACE FINALE PRESENTATION
 * Đảm bảo hiển thị chuẩn HD 1280×720 tại UIScene (Zoom 1.0),
 * triệt tiêu hoàn toàn lỗi lệch viewport, chồng lấn HUD và Soft-lock vĩnh viễn (BUG-10).
 */

import * as Phaser from 'phaser';
import { SCENE_MAIN_MENU } from '../config/Constants';
import { PlayerState } from '../state/PlayerState';
import { AudioManager } from '../audio/AudioManager';
import { HDTextHelper } from '../utils/HDTextHelper';
import { SaveManager } from './SaveManager';

export class EndingSystem {
  private scene: Phaser.Scene;
  private uiScene?: Phaser.Scene;
  private playerState: PlayerState;
  public isEndingActive: boolean = false;

  private endingContainer!: Phaser.GameObjects.Container;
  private timeRiftGraphics!: Phaser.GameObjects.Graphics;
  private endingTextContainer!: Phaser.GameObjects.Container;
  private returnBtn?: Phaser.GameObjects.Text;
  private returnHint?: Phaser.GameObjects.Text;
  private onCompleteCallback?: () => void;

  constructor(scene: Phaser.Scene, uiScene?: Phaser.Scene) {
    this.scene = scene;
    this.uiScene = uiScene;
    this.playerState = PlayerState.getInstance();
    this.setupEndingUI();
  }

  /**
   * Thiết lập UIScene làm View đích chuẩn HD ở Zoom 1.0 cố định
   */
  public setUIScene(uiScene: Phaser.Scene): void {
    this.uiScene = uiScene;
    if (this.endingContainer) {
      this.endingContainer.destroy();
    }
    if (this.timeRiftGraphics) {
      this.timeRiftGraphics.destroy();
    }
    this.setupEndingUI();
  }

  public getTargetScene(): Phaser.Scene {
    return this.uiScene || this.scene;
  }

  public getEndingContainer(): Phaser.GameObjects.Container {
    return this.endingContainer;
  }

  public getTimeRiftGraphics(): Phaser.GameObjects.Graphics {
    return this.timeRiftGraphics;
  }

  public getEndingTextContainer(): Phaser.GameObjects.Container {
    return this.endingTextContainer;
  }

  public getReturnBtn(): Phaser.GameObjects.Text | undefined {
    return this.returnBtn;
  }

  public getReturnHint(): Phaser.GameObjects.Text | undefined {
    return this.returnHint;
  }

  public canReturnToMenu(): boolean {
    return this.isEndingActive && !!this.returnBtn && this.returnBtn.visible;
  }

  private setupEndingUI(): void {
    const target = this.getTargetScene();

    // Container tổng cho màn kết thúc trên UIScene ở Zoom 1.0 cố định (Depth 20000)
    this.endingContainer = target.add.container(0, 0);
    this.endingContainer.setScrollFactor(0);
    this.endingContainer.setDepth(20000);
    this.endingContainer.setVisible(false);

    // Khe nhìn xuyên thời đại (Time Rift) ở Depth 19998
    this.timeRiftGraphics = target.add.graphics();
    this.timeRiftGraphics.setScrollFactor(0);
    this.timeRiftGraphics.setDepth(19998);
    this.timeRiftGraphics.setVisible(false);

    this.endingTextContainer = target.add.container(0, 0);
    this.endingContainer.add(this.endingTextContainer);
  }

  /**
   * KÍCH HOẠT HỒI KẾT: TIẾNG CHUÔNG ĐỒNG ĐẦU TIÊN (THE FIRST TOLL FINALE)
   */
  public triggerTheFirstTollFinale(onComplete?: () => void): void {
    if (this.isEndingActive) return;
    this.isEndingActive = true;
    this.onCompleteCallback = onComplete;

    // 1. Tắt toàn bộ HUD của UIScene ngay lập tức để chống chìm và chống đè hình ảnh
    if (this.uiScene && typeof (this.uiScene as any).setHUDVisible === 'function') {
      (this.uiScene as any).setHUDVisible(false);
    }

    // 2. Dừng chuyển động nhân vật Satyr và quái vật
    const gameScene = this.scene as any;
    if (gameScene.player) {
      gameScene.player.setVelocity(0, 0);
      gameScene.player.playIdle();
    }
    if (gameScene.listenerMonster) {
      gameScene.listenerMonster.setVelocity(0, 0);
    }
    if (gameScene.audioManager) {
      gameScene.audioManager.setHeartbeatActive(false);
    }

    const cam = this.scene.cameras.main;

    // GIAI ĐOẠN 1: TIẾNG CHUÔNG ĐỒNG ĐẦU TIÊN (THE FIRST TOLL)
    cam.shake(1500, 0.025);
    cam.flash(1800, 255, 255, 255);
    if (this.uiScene) {
      this.uiScene.cameras.main.flash(1800, 255, 255, 255);
    }
    AudioManager.getInstance().playBronzeBellToll();

    // Kích hoạt cờ chuông rung và hoàn thành nhiệm vụ Act 6
    this.playerState.setFlag('bell_rung');
    this.playerState.completeQuestTask('Q06_RETRIEVE_CLAPPER', 't2');

    // Lưu checkpoint hoàn tất cốt truyện an toàn
    const playerX = gameScene.player ? gameScene.player.x : 840;
    const playerY = gameScene.player ? gameScene.player.y : 350;
    SaveManager.saveGame('KẾT THÚC: TIẾNG CHUÔNG ĐẦU TIÊN (HOÀN THÀNH)', 'bellhollow', playerX, playerY);

    // GIAI ĐOẠN 2: KHE NHÌN XUYÊN THỜI ĐẠI (TIME RIFT)
    const target = this.getTargetScene();
    target.time.delayedCall(1800, () => {
      this.playTimeRiftCutscene(() => {
        // GIAI ĐOẠN 3: BÍ MẬT CUỐN SỔ DA CỦA SATYR & MÀN HÌNH KẾT THÚC
        this.playFinalCreditsCutscene();
      });
    });
  }

  private playTimeRiftCutscene(onRiftClosed: () => void): void {
    const target = this.getTargetScene();
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

    // Lời thoại Lữ Hành thảng thốt chuẩn HD 1280×720 tại Y = 580 (Zoom 1.0 cố định)
    // Satyr: “Ánh đèn pha ô tô... quốc lộ ven rừng?! Thế giới của mình... con đường về nhà có thật!”
    const riftDialogue = HDTextHelper.createText(
      target,
      640,
      580,
      'Lữ Hành: “Ánh đèn pha ô tô... quốc lộ ven rừng?! Thế giới của mình... con đường về nhà có thật!”', 
      {
        fontSize: '18px',
        fontStyle: 'italic',
        color: '#58d68d',
        backgroundColor: '#0a0e14f0',
        padding: { x: 28, y: 14 },
        stroke: '#000000',
        strokeThickness: 3
      }
    ).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(20005);

    // Khe nứt co lại và đóng sầm sau 4.8 giây
    target.time.delayedCall(4800, () => {
      target.tweens.add({
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

  private playFinalCreditsCutscene(): void {
    const target = this.getTargetScene();
    this.endingContainer.setVisible(true);

    // 1. Màn đen tối sầm phủ toàn màn hình HD 1280×720 (Depth 20000 trên UIScene)
    const blackBg = target.add.graphics();
    blackBg.fillStyle(0x05070a, 1);
    blackBg.fillRect(0, 0, 1280, 720);
    blackBg.setAlpha(0);

    this.endingContainer.add(blackBg);

    target.tweens.add({
      targets: blackBg,
      alpha: 1,
      duration: 1600,
      onComplete: () => {
        this.renderFinalTextLines();
      }
    });
  }

  private renderFinalTextLines(): void {
    const target = this.getTargetScene();
    const lines = [
      { text: 'Dưới chân bệ chuông, một cuốn sổ da cũ rơi ra từ khe đá...', delay: 600, size: '18px', color: '#95a5a6' },
      { text: 'Trang giấy ố vàng phác họa chân dung một kẻ lữ khách từ hàng trăm năm trước...', delay: 2800, size: '18px', color: '#bdc3c7' },
      { text: 'Gương mặt ấy... chiếc áo choàng rêu phong và ngọn đèn cổ... giống hệt The Mossbound Wayfarer từng nét vẽ.', delay: 5200, size: '20px', color: '#e74c3c' },
      { text: '“Khu rừng không chỉ đưa ta đến đây. Có lẽ nó đã chờ ta từ rất lâu.”', delay: 7800, size: '22px', color: '#f39c12', italic: true },
      // HOLLOW WOODS V1.1
      { text: 'HOLLOW WOODS V1.3', delay: 10500, size: '36px', color: '#ffffff', bold: true },
      { text: 'TẬP 1: THE FIRST TOLL (TIẾNG CHUÔNG ĐẦU TIÊN) — HOÀN THÀNH', delay: 12200, size: '18px', color: '#2ecc71', bold: true },
      { text: 'THE FOREST REMEMBERS. TO BE CONTINUED...', delay: 13900, size: '16px', color: '#7f8c8d' }
    ];

    let currentY = 85;
    const yOffsets = [0, 48, 50, 56, 75, 48, 42];

    lines.forEach((item, index) => {
      currentY += yOffsets[index];
      const targetY = currentY;

      target.time.delayedCall(item.delay, () => {
        const textObj = HDTextHelper.createText(target, 640, targetY, item.text, {
          fontSize: item.size,
          fontStyle: item.bold ? 'bold' : (item.italic ? 'italic' : 'normal'),
          color: item.color,
          align: 'center',
          stroke: '#000000',
          strokeThickness: item.bold ? 4 : 2
        }).setOrigin(0.5, 0.5).setAlpha(0);

        this.endingTextContainer.add(textObj);

        target.tweens.add({
          targets: textObj,
          alpha: 1,
          duration: 1000
        });
      });
    });

    // Nút quay về Menu Chính chuẩn HD 1280×720 sau khi chạy xong credits (Y = 580)
    target.time.delayedCall(15600, () => {
      const returnBtn = HDTextHelper.createText(target, 640, 580, '▶ QUAY VỀ MENU CHÍNH', {
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#f39c12',
        backgroundColor: '#111620',
        padding: { x: 32, y: 14 },
        stroke: '#f39c12',
        strokeThickness: 1
      }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });

      const returnHint = HDTextHelper.createText(target, 640, 630, '[Nhấp chuột hoặc nhấn ENTER / SPACE / ESC để về Menu]', {
        fontSize: '13px',
        color: '#7f8c8d',
        fontStyle: 'italic'
      }).setOrigin(0.5, 0.5);

      this.returnBtn = returnBtn;
      this.returnHint = returnHint;

      returnBtn.on('pointerover', () => {
        returnBtn.setStyle({ color: '#ffffff', backgroundColor: '#d35400' });
      });
      returnBtn.on('pointerout', () => {
        returnBtn.setStyle({ color: '#f39c12', backgroundColor: '#111620' });
      });
      returnBtn.on('pointerdown', () => this.returnToMainMenu());

      // Hỗ trợ phím cứng ENTER, SPACE và ESC trên UIScene
      if (target.input && target.input.keyboard) {
        target.input.keyboard.once('keydown-ENTER', () => this.returnToMainMenu());
        target.input.keyboard.once('keydown-SPACE', () => this.returnToMainMenu());
        target.input.keyboard.once('keydown-ESC', () => this.returnToMainMenu());
      }

      this.endingTextContainer.add([returnBtn, returnHint]);

      returnBtn.setAlpha(0);
      returnHint.setAlpha(0);
      target.tweens.add({
        targets: [returnBtn, returnHint],
        alpha: 1,
        duration: 800
      });
    });
  }

  /**
   * Thoát màn kết thúc an toàn, dừng cả GameScene và UIScene, chuyển về MainMenuScene
   */
  public returnToMainMenu(): void {
    this.isEndingActive = false;

    if (this.scene) {
      this.scene.scene.stop('GameScene');
    }
    if (this.uiScene) {
      this.uiScene.scene.stop('UIScene');
    }

    const sm = this.getTargetScene().scene;
    sm.start(SCENE_MAIN_MENU);

    if (this.onCompleteCallback) {
      this.onCompleteCallback();
      this.onCompleteCallback = undefined;
    }
  }
}
