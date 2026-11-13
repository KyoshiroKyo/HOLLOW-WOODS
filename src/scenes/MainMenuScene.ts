/**
 * HOLLOW WOODS V3.0 - PASS T16
 * HD MAIN MENU WITH DARK ROGUE SHOWCASE
 * Chuẩn HD 1280×720, cảnh rừng đêm mờ ảo, Dark Rogue đứng dưới ánh đèn lồng ấm áp
 */

import * as Phaser from 'phaser';
import { SCENE_MAIN_MENU, SCENE_GAME, SPRITE_FOG_SMOOTH, SPRITE_TREE_OAK_1, SPRITE_TREE_DEAD, SATYR_SHEET_KEY } from '../config/Constants';
import { SaveManager } from '../systems/SaveManager';
import { HDTextHelper } from '../utils/HDTextHelper';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_MAIN_MENU });
  }

  public create(): void {
    this.cameras.main.setZoom(1.0);

    // 1. Nền rừng đêm u tối huyền bí chuẩn HD (1280×720)
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x05070a, 0x05070a, 0x0d1218, 0x0d1218, 1);
    bg.fillRect(0, 0, 1280, 720);

    // Hậu cảnh cây cổ thụ rừng sâu mờ ảo
    if (this.textures.exists(SPRITE_TREE_OAK_1)) {
      const treeLeft = this.add.image(120, 420, SPRITE_TREE_OAK_1);
      treeLeft.setScale(1.8).setTint(0x111620).setAlpha(0.4);
    }
    if (this.textures.exists(SPRITE_TREE_DEAD)) {
      const treeRight = this.add.image(1180, 400, SPRITE_TREE_DEAD);
      treeRight.setScale(2.2).setTint(0x161c26).setAlpha(0.35);
    }

    // 2. Lớp sương mù trôi mượt mà phía chân trời (Thay thế hoàn toàn các hình tròn xám thô)
    if (this.textures.exists(SPRITE_FOG_SMOOTH)) {
      const fogLayer = this.add.tileSprite(0, 450, 1280, 270, SPRITE_FOG_SMOOTH);
      fogLayer.setOrigin(0, 0);
      fogLayer.setAlpha(0.25);
      this.tweens.add({
        targets: fogLayer,
        tilePositionX: 512,
        duration: 25000,
        repeat: -1,
        ease: 'Linear'
      });
    }

    // 3. SHOWCASE NHÂN VẬT DARK ROGUE DƯỚI ÁNH ĐÈN LỒNG ẤM ÁP
    const rogueX = 960;
    const rogueY = 460;

    // Vầng hào quang ánh đèn lồng vàng ấm áp (Warm Lantern Glow)
    const lanternGlow = this.add.graphics();
    // Hào quang ngoài mờ
    lanternGlow.fillStyle(0xf39c12, 0.12);
    lanternGlow.fillCircle(rogueX, rogueY - 30, 180);
    // Hào quang giữa vàng hổ phách
    lanternGlow.fillStyle(0xf1c40f, 0.22);
    lanternGlow.fillCircle(rogueX, rogueY - 30, 100);
    // Tâm sáng ấm áp
    lanternGlow.fillStyle(0xfff5d7, 0.45);
    lanternGlow.fillCircle(rogueX, rogueY - 30, 45);

    // Hiệu ứng bập bùng êm đềm của ánh đèn
    this.tweens.add({
      targets: lanternGlow,
      alpha: 0.82,
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Bóng đổ tiếp đất dưới chân Dark Rogue
    const shadow = this.add.graphics();
    shadow.fillStyle(0x040608, 0.7);
    shadow.fillEllipse(rogueX, rogueY + 54, 80, 22);

    // Sprite nhân vật Dark Rogue đứng uy dũng dưới ánh đèn (Frame 0 - Down Idle)
    if (this.textures.exists(SATYR_SHEET_KEY)) {
      const darkRogue = this.add.sprite(rogueX, rogueY, SATYR_SHEET_KEY, 0);
      darkRogue.setScale(2.5); // Phóng to 2.5x chuẩn pixel art HD
      darkRogue.setOrigin(0.5, 0.90);

      // Hiệu ứng thở nhẹ nhàng (Breathing idle)
      this.tweens.add({
        targets: darkRogue,
        scaleY: 2.53,
        duration: 1400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // 4. TIÊU ĐỀ CHÍNH CHUẨN HD SẮC NÉT
    HDTextHelper.createText(this, 480, 120, 'HOLLOW WOODS', {
      fontSize: '56px',
      fontStyle: 'bold',
      color: '#e74c3c',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5, 0.5);

    HDTextHelper.createText(this, 480, 175, 'THE FOG THAT REMEMBERS (SƯƠNG MÙ GHI NHỚ)', {
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ecf0f1',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5);

    // Tagline Canon V3.0
    HDTextHelper.createText(this, 480, 215, '“Sương mù đưa anh đến đây. Khu rừng đã ghi nhớ anh từ trước.”', {
      fontSize: '14px',
      fontStyle: 'italic',
      color: '#95a5a6'
    }).setOrigin(0.5, 0.5);

    // 5. CÁC NÚT BẤM MENU CHÍNH CHUẨN HD
    const hasSaveGame = SaveManager.hasSave();
    const saveSummary = SaveManager.getSaveSummary();

    let startY = 285;

    if (hasSaveGame && saveSummary) {
      // Nút Tiếp tục hành trình
      const continueBtn = this.createMenuButton(
        480, 
        startY, 
        `▶ TIẾP TỤC HÀNH TRÌNH (${saveSummary.checkpoint})`, 
        '#2ecc71',
        () => this.continueGame()
      );

      this.tweens.add({
        targets: continueBtn,
        alpha: 0.82,
        duration: 1000,
        yoyo: true,
        repeat: -1
      });

      startY += 62;

      // Nút Bắt đầu mới
      this.createMenuButton(
        480, 
        startY, 
        '▶ BƯỚC VÀO MÀN SƯƠNG (BẮT ĐẦU MỚI)', 
        '#f39c12',
        () => this.startNewGame()
      );
    } else {
      // Nút Bắt đầu hành trình
      const startButton = this.createMenuButton(
        480, 
        startY + 20, 
        '▶ BƯỚC VÀO MÀN SƯƠNG (BẮT ĐẦU HÀNH TRÌNH)', 
        '#f39c12',
        () => this.startNewGame()
      );

      this.tweens.add({
        targets: startButton,
        alpha: 0.85,
        duration: 1000,
        yoyo: true,
        repeat: -1
      });
    }

    // Bắt phím Space hoặc Enter để bắt đầu
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-ENTER', () => {
        if (hasSaveGame) this.continueGame();
        else this.startNewGame();
      });
      this.input.keyboard.on('keydown-SPACE', () => {
        if (hasSaveGame) this.continueGame();
        else this.startNewGame();
      });
    }

    // 6. BẢNG HƯỚNG DẪN ĐIỀU KHIỂN CHUẨN HD Ở ĐÁY MÀN HÌNH
    const guideBox = this.add.graphics();
    guideBox.fillStyle(0x090c12, 0.85);
    guideBox.fillRoundedRect(160, 580, 960, 95, 8);
    guideBox.lineStyle(1, 0x2c3545, 0.8);
    guideBox.strokeRoundedRect(160, 580, 960, 95, 8);

    HDTextHelper.createText(
      this, 
      640, 
      628, 
      'HƯỚNG DẪN ĐIỀU KHIỂN:\n[W, A, S, D] / [Mũi tên]: Di chuyển Satyr   |   [Shift]: Chạy nhanh (tiêu hao Thể lực)   |   [F]: Bật/Tắt Đèn Lồng\n[E]: Tương tác / Trò chuyện / Ẩn nấp   |   [Q]: Ném Mồi Tiếng Động   |   [I]: Bàn Chế Tạo   |   [J]: Sổ Tay\n[ESC]: Tạm Dừng & Lưu Game   |   [F4]: Bật/Tắt Khung Kiểm Toán (Debug)',
      {
        fontSize: '12.5px',
        color: '#a0aec0',
        align: 'center',
        lineSpacing: 5
      }
    ).setOrigin(0.5, 0.5);

    // Phiên bản & Engine góc dưới phải
    HDTextHelper.createText(
      this, 
      1265, 
      705, 
      'V3.0.0 (PASS G4 FINALE) | Phaser 4 + TypeScript (strict) | 1280×720 HD', 
      {
        fontSize: '11px',
        color: '#4a5568'
      }
    ).setOrigin(1, 1);
  }

  private createMenuButton(x: number, y: number, text: string, defaultColor: string, onClick: () => void): Phaser.GameObjects.Container {
    const btn = this.add.container(x, y);
    const btnW = 420;
    const btnH = 46;

    const bg = this.add.graphics();
    bg.fillStyle(0x0f141d, 0.95);
    bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
    bg.lineStyle(1.5, 0x4a5568, 0.9);
    bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);

    const txt = HDTextHelper.createText(this, 0, 0, text, {
      fontSize: '15px',
      fontStyle: 'bold',
      color: defaultColor,
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);

    btn.add([bg, txt]);
    btn.setSize(btnW, btnH);
    btn.setInteractive(new Phaser.Geom.Rectangle(-btnW / 2, -btnH / 2, btnW, btnH), Phaser.Geom.Rectangle.Contains);

    btn.on('pointerdown', onClick);
    btn.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x1c2432, 1);
      bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
      bg.lineStyle(2, 0xd4af37, 1);
      bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
      txt.setColor('#ffffff');
    });

    btn.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x0f141d, 0.95);
      bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
      bg.lineStyle(1.5, 0x4a5568, 0.9);
      bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
      txt.setColor(defaultColor);
    });

    return btn;
  }

  private continueGame(): void {
    const saveData = SaveManager.loadGame();
    this.cameras.main.fade(500, 0, 0, 0);
    this.time.delayedCall(500, () => {
      this.scene.start(SCENE_GAME, { isContinue: true, saveData });
    });
  }

  private startNewGame(): void {
    SaveManager.clearSave();
    this.cameras.main.fade(500, 0, 0, 0);
    this.time.delayedCall(500, () => {
      this.scene.start(SCENE_GAME, { isContinue: false });
    });
  }
}
