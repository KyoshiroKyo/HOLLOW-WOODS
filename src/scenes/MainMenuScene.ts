/**
 * HOLLOW WOODS V1.3 - C4-13-07
 * HD MAIN MENU WITH DARK ROGUE SHOWCASE & MULTI-TIER INTERACTIVE SYSTEM
 * Chuẩn HD 1280×720, không khí rừng đêm u ám, sương mù trôi nhẹ, ánh đèn ấm áp và 4 nút menu tương tác
 */

import * as Phaser from 'phaser';
import { SCENE_MAIN_MENU, SCENE_GAME, SPRITE_FOG_SMOOTH, SPRITE_TREE_OAK_1, SPRITE_TREE_DEAD, SATYR_SHEET_KEY } from '../config/Constants';
import { SaveManager } from '../systems/SaveManager';
import { HDTextHelper } from '../utils/HDTextHelper';
import { AudioManager } from '../audio/AudioManager';

export class MainMenuScene extends Phaser.Scene {
  private activeMenuModal?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: SCENE_MAIN_MENU });
  }

  public create(): void {
    this.cameras.main.setZoom(1.0);

    // 1. Nền rừng đêm u tối huyền bí chuẩn HD (1280×720)
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x040608, 0x040608, 0x0c1117, 0x0c1117, 1);
    bg.fillRect(0, 0, 1280, 720);

    // Hậu cảnh cây cổ thụ rừng sâu mờ ảo
    if (this.textures.exists(SPRITE_TREE_OAK_1)) {
      const treeLeft = this.add.image(120, 420, SPRITE_TREE_OAK_1);
      treeLeft.setScale(1.8).setTint(0x10151f).setAlpha(0.42);
    }
    if (this.textures.exists(SPRITE_TREE_DEAD)) {
      const treeRight = this.add.image(1180, 400, SPRITE_TREE_DEAD);
      treeRight.setScale(2.2).setTint(0x151c26).setAlpha(0.38);
    }

    // 2. Hai tầng sương mù trôi mượt mà phía chân trời (C4-13-07)
    if (this.textures.exists(SPRITE_FOG_SMOOTH)) {
      // Tầng sương hậu cảnh
      const fogBack = this.add.tileSprite(0, 420, 1280, 300, SPRITE_FOG_SMOOTH);
      fogBack.setOrigin(0, 0);
      fogBack.setAlpha(0.18);
      this.tweens.add({
        targets: fogBack,
        tilePositionX: 512,
        duration: 32000,
        repeat: -1,
        ease: 'Linear'
      });

      // Tầng sương tiền cảnh trôi nhịp nhàng
      const fogFront = this.add.tileSprite(0, 460, 1280, 260, SPRITE_FOG_SMOOTH);
      fogFront.setOrigin(0, 0);
      fogFront.setAlpha(0.28);
      this.tweens.add({
        targets: fogFront,
        tilePositionX: -512,
        duration: 22000,
        repeat: -1,
        ease: 'Linear'
      });
    }

    // 3. SHOWCASE NHÂN VẬT DARK ROGUE DƯỚI ÁNH ĐÈN LỒNG ẤM ÁP
    const rogueX = 980;
    const rogueY = 460;

    // Vầng hào quang ánh đèn lồng vàng ấm áp (Warm Lantern Glow 3 tầng)
    const lanternGlow = this.add.graphics();
    // Hào quang ngoài mờ
    lanternGlow.fillStyle(0xf39c12, 0.12);
    lanternGlow.fillCircle(rogueX, rogueY - 30, 190);
    // Hào quang giữa vàng hổ phách
    lanternGlow.fillStyle(0xf1c40f, 0.24);
    lanternGlow.fillCircle(rogueX, rogueY - 30, 110);
    // Tâm sáng ấm áp
    lanternGlow.fillStyle(0xfff5d7, 0.48);
    lanternGlow.fillCircle(rogueX, rogueY - 30, 48);

    // Hiệu ứng bập bùng êm đềm của ánh đèn
    this.tweens.add({
      targets: lanternGlow,
      alpha: 0.82,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Bóng đổ tiếp đất dưới chân nhân vật
    const shadow = this.add.graphics();
    shadow.fillStyle(0x030508, 0.65);
    shadow.fillEllipse(rogueX, rogueY + 54, 84, 22);

    // Sprite nhân vật The Mossbound Wayfarer đứng uy dũng dưới ánh đèn (Frame 0 - Down Idle)
    if (this.textures.exists(SATYR_SHEET_KEY)) {
      const darkRogue = this.add.sprite(rogueX, rogueY, SATYR_SHEET_KEY, 0);
      darkRogue.setScale(2.5);
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
    HDTextHelper.createText(this, 480, 105, 'HOLLOW WOODS', {
      fontSize: '56px',
      fontStyle: 'bold',
      color: '#e74c3c',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5, 0.5);

    HDTextHelper.createText(this, 480, 160, 'DỊ CẢNH RỪNG LIỄU — THE FOG THAT REMEMBERS', {
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ecf0f1',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5);

    // Tagline Canon V1.3
    HDTextHelper.createText(this, 480, 196, '“Sương mù đưa anh đến đây. Khu rừng đã ghi nhớ anh từ trước.”', {
      fontSize: '13px',
      fontStyle: 'italic',
      color: '#95a5a6'
    }).setOrigin(0.5, 0.5);

    // 5. CÁC NÚT BẤM MENU CHÍNH CHUẨN HD (4 NÚT TƯƠNG TÁC ĐẦY ĐỦ - C4-13-07)
    const hasSaveGame = SaveManager.hasSave();
    const saveSummary = SaveManager.getSaveSummary();

    const startX = 480;
    let currentY = 250;
    const btnSpacing = 56;

    // Nút 1: BẮT ĐẦU MỚI (New Game - C4-132-07: Rút gọn nhãn nút)
    this.createMenuButton(
      startX,
      currentY,
      '► BƯỚC VÀO MÀN SƯƠNG',
      '#f39c12',
      true,
      () => this.startNewGame()
    );
    currentY += btnSpacing;

    // Nút 2: TIẾP TỤC HÀNH TRÌNH (Continue - Có điều kiện kiểm tra Save)
    if (hasSaveGame && saveSummary) {
      const continueBtn = this.createMenuButton(
        startX,
        currentY,
        `▶ TIẾP TỤC HÀNH TRÌNH (${saveSummary.checkpoint})`,
        '#2ecc71',
        true,
        () => this.continueGame()
      );

      this.tweens.add({
        targets: continueBtn,
        alpha: 0.85,
        duration: 1100,
        yoyo: true,
        repeat: -1
      });
    } else {
      this.createMenuButton(
        startX,
        currentY,
        '▷ TIẾP TỤC (CHƯA CÓ BẢN LƯU)',
        '#636e72',
        false,
        () => this.showNoticeToast('⚠️ Chưa có bản lưu hành trình! Vui lòng chọn Bắt Đầu Mới.')
      );
    }
    currentY += btnSpacing;

    // Nút 3: CÀI ĐẶT TRÒ CHƠI (Settings - Âm thanh / Điều khiển)
    this.createMenuButton(
      startX,
      currentY,
      '⚙ CÀI ĐẶT TRÒ CHƠI',
      '#3498db',
      true,
      () => this.showSettingsModal()
    );
    currentY += btnSpacing;

    // Nút 4: THÔNG TIN & CỐT TRUYỆN (Credits - Lore & Engine)
    this.createMenuButton(
      startX,
      currentY,
      'ℹ THÔNG TIN & CỐT TRUYỆN',
      '#9b59b6',
      true,
      () => this.showCreditsModal()
    );

    // Bắt phím Space hoặc Enter để bắt đầu / tiếp tục
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-ENTER', () => {
        if (this.activeMenuModal) return;
        if (hasSaveGame) this.continueGame();
        else this.startNewGame();
      });
      this.input.keyboard.on('keydown-SPACE', () => {
        if (this.activeMenuModal) return;
        if (hasSaveGame) this.continueGame();
        else this.startNewGame();
      });
      this.input.keyboard.on('keydown-ESC', () => {
        if (this.activeMenuModal) {
          this.closeActiveMenuModal();
        }
      });
    }

    // Mở khóa AudioContext và phát nhạc nền rừng huyền bí khi người chơi tương tác (C4-13-08)
    const audio = AudioManager.getInstance();
    if (audio.isAudioUnlocked()) {
      audio.setAmbienceZone('forest', 2.0);
    } else {
      const unlockAndPlayAmbience = () => {
        audio.resumeAudio();
        audio.setAmbienceZone('forest', 2.0);
      };
      this.input.once('pointerdown', unlockAndPlayAmbience);
      if (this.input.keyboard) {
        this.input.keyboard.once('keydown', unlockAndPlayAmbience);
      }
    }

    // 6. BẢNG HƯỚNG DẪN ĐIỀU KHIỂN CHUẨN HD Ở ĐÁY MÀN HÌNH (BÁN TRONG SUỐT)
    const guideBox = this.add.graphics();
    guideBox.fillStyle(0x080d14, 0.75);
    guideBox.fillRoundedRect(160, 584, 960, 90, 8);
    guideBox.lineStyle(1, 0x2c3545, 0.7);
    guideBox.strokeRoundedRect(160, 584, 960, 90, 8);

    HDTextHelper.createText(
      this, 
      640, 
      629, 
      'HƯỚNG DẪN ĐIỀU KHIỂN:\n[W, A, S, D] / [Mũi tên]: Di chuyển Lữ Khách   |   [Shift]: Chạy nhanh   |   [F]: Bật/Tắt Đèn Lồng\n[E]: Tương tác / Trò chuyện / Thu thập   |   [Q]: Ném Mồi Tiếng Động   |   [C / I]: Bàn Chế Tạo   |   [J]: Sổ Tay\n[M]: Bật/Tắt Âm Thanh   |   [ESC]: Tạm Dừng & Lưu Game   |   [F4]: Bật/Tắt Khung Kiểm Toán',
      {
        fontSize: '12px',
        color: '#94a3b8',
        align: 'center',
        lineSpacing: 5
      }
    ).setOrigin(0.5, 0.5);

    // Phiên bản V1.3.0 & Engine góc dưới phải
    HDTextHelper.createText(
      this, 
      1265, 
      705, 
      'V1.3.0 (Visual Direction A + Hybrid Open World) | Phaser 4 + TypeScript | 1280×720 HD', 
      {
        fontSize: '11px',
        color: '#4a5568'
      }
    ).setOrigin(1, 1);
  }

  private createMenuButton(
    x: number, 
    y: number, 
    text: string, 
    defaultColor: string, 
    isEnabled: boolean,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const btn = this.add.container(x, y);
    const btnW = 440;
    const btnH = 44;

    const bg = this.add.graphics();
    bg.fillStyle(0x090e15, 0.85);
    bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
    bg.lineStyle(1, isEnabled ? 0x3d4a5d : 0x242d38, 0.85);
    bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);

    const txt = HDTextHelper.createText(this, 0, 0, text, {
      fontSize: '14.5px',
      fontStyle: 'bold',
      color: defaultColor,
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);

    btn.add([bg, txt]);
    btn.setSize(btnW, btnH);

    if (isEnabled) {
      btn.setInteractive(new Phaser.Geom.Rectangle(-btnW / 2, -btnH / 2, btnW, btnH), Phaser.Geom.Rectangle.Contains);
      btn.on('pointerdown', () => {
        AudioManager.getInstance().playInteract();
        onClick();
      });
      btn.on('pointerover', () => {
        bg.clear();
        bg.fillStyle(0x162030, 0.95);
        bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
        bg.lineStyle(1.5, 0xd4af37, 1);
        bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
        txt.setColor('#ffffff');
      });
      btn.on('pointerout', () => {
        bg.clear();
        bg.fillStyle(0x090e15, 0.85);
        bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
        bg.lineStyle(1, 0x3d4a5d, 0.85);
        bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
        txt.setColor(defaultColor);
      });
    } else {
      btn.setInteractive(new Phaser.Geom.Rectangle(-btnW / 2, -btnH / 2, btnW, btnH), Phaser.Geom.Rectangle.Contains);
      btn.on('pointerdown', () => {
        onClick();
      });
      btn.setAlpha(0.6);
    }

    return btn;
  }

  private continueGame(): void {
    AudioManager.getInstance().playInteract();
    const saveData = SaveManager.loadGame();
    this.cameras.main.fade(500, 0, 0, 0);
    this.time.delayedCall(500, () => {
      this.scene.start(SCENE_GAME, { isContinue: true, saveData });
    });
  }

  private startNewGame(): void {
    AudioManager.getInstance().playInteract();
    SaveManager.clearSave();
    this.cameras.main.fade(500, 0, 0, 0);
    this.time.delayedCall(500, () => {
      this.scene.start(SCENE_GAME, { isContinue: false });
    });
  }

  /**
   * C4-13-07: Hộp thoại Cài Đặt (Settings Modal)
   */
  private showSettingsModal(): void {
    this.closeActiveMenuModal();

    const modal = this.add.container(640, 360).setDepth(9000);
    const modalW = 580;
    const modalH = 400;

    // Lớp phủ mờ nền
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.65);
    overlay.fillRect(-640, -360, 1280, 720);
    overlay.setInteractive(new Phaser.Geom.Rectangle(-640, -360, 1280, 720), Phaser.Geom.Rectangle.Contains);

    // Khung hộp thoại bán trong suốt
    const box = this.add.graphics();
    box.fillStyle(0x080d14, 0.94);
    box.fillRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 10);
    box.lineStyle(1.5, 0xd4af37, 0.9);
    box.strokeRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 10);

    const title = HDTextHelper.createText(this, 0, -modalH / 2 + 34, '⚙ CÀI ĐẶT TRÒ CHƠI', {
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#f1c40f',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5);

    // Nút Bật/Tắt Âm Thanh
    const audio = AudioManager.getInstance();
    const audioBtn = this.add.container(0, -modalH / 2 + 95);
    const audioBg = this.add.graphics();
    const isMuted = audio.isMuted;

    const renderAudioBtn = (muted: boolean) => {
      audioBg.clear();
      audioBg.fillStyle(muted ? 0x2c1417 : 0x14281f, 0.95);
      audioBg.fillRoundedRect(-160, -18, 320, 36, 6);
      audioBg.lineStyle(1, muted ? 0xe74c3c : 0x2ecc71, 0.9);
      audioBg.strokeRoundedRect(-160, -18, 320, 36, 6);
    };
    renderAudioBtn(isMuted);

    const audioText = HDTextHelper.createText(
      this,
      0,
      0,
      isMuted ? '🔇 ÂM THANH: ĐANG TẮT (BẤM ĐỂ BẬT)' : '🔊 ÂM THANH: ĐANG BẬT (BẤM ĐỂ TẮT)',
      {
        fontSize: '13px',
        fontStyle: 'bold',
        color: isMuted ? '#ff7675' : '#2ecc71',
        stroke: '#000000',
        strokeThickness: 2
      }
    ).setOrigin(0.5, 0.5);

    audioBtn.add([audioBg, audioText]);
    audioBtn.setSize(320, 36);
    audioBtn.setInteractive(new Phaser.Geom.Rectangle(-160, -18, 320, 36), Phaser.Geom.Rectangle.Contains);
    audioBtn.on('pointerdown', () => {
      const nowMuted = audio.toggleMute();
      renderAudioBtn(nowMuted);
      audioText.setText(nowMuted ? '🔇 ÂM THANH: ĐANG TẮT (BẤM ĐỂ BẬT)' : '🔊 ÂM THANH: ĐANG BẬT (BẤM ĐỂ TẮT)');
      audioText.setColor(nowMuted ? '#ff7675' : '#2ecc71');
    });

    // Nội dung tóm tắt điều khiển
    const infoText = HDTextHelper.createText(
      this,
      0,
      15,
      'BẢNG PHÍM TẮT ĐIỀU KHIỂN CHÍNH:\n' +
      '• [W, A, S, D] / [Mũi tên]: Di chuyển Lữ Khách\n' +
      '• [Shift]: Chạy nhanh (tiêu hao Thể Lực)\n' +
      '• [F]: Bật / Tắt Đèn Lồng xua tan Màn Sương\n' +
      '• [E]: Tương tác / Trò chuyện NPC / Thu hoạch\n' +
      '• [Q]: Ném Mồi Tiếng Động đánh lạc hướng Quái Vật\n' +
      '• [I / C]: Mở Bàn Chế Tạo | [J]: Mở Sổ Tay Nhiệm Vụ\n' +
      '• [ESC]: Tạm Dừng & Lưu Game',
      {
        fontSize: '12px',
        color: '#cbd5e1',
        lineSpacing: 6,
        align: 'left'
      }
    ).setOrigin(0.5, 0.5);

    // Nút Đóng
    const closeBtn = this.add.container(0, modalH / 2 - 36);
    const closeBg = this.add.graphics();
    closeBg.fillStyle(0x1a2332, 0.95);
    closeBg.fillRoundedRect(-90, -16, 180, 32, 6);
    closeBg.lineStyle(1, 0x4a5568, 0.9);
    closeBg.strokeRoundedRect(-90, -16, 180, 32, 6);

    const closeText = HDTextHelper.createText(this, 0, 0, '✕ ĐÓNG [ESC]', {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ecf0f1'
    }).setOrigin(0.5, 0.5);

    closeBtn.add([closeBg, closeText]);
    closeBtn.setSize(180, 32);
    closeBtn.setInteractive(new Phaser.Geom.Rectangle(-90, -16, 180, 32), Phaser.Geom.Rectangle.Contains);
    closeBtn.on('pointerdown', () => this.closeActiveMenuModal());

    modal.add([overlay, box, title, audioBtn, infoText, closeBtn]);
    this.activeMenuModal = modal;
  }

  /**
   * C4-13-07: Hộp thoại Thông Tin (Credits Modal)
   */
  private showCreditsModal(): void {
    this.closeActiveMenuModal();

    const modal = this.add.container(640, 360).setDepth(9000);
    const modalW = 620;
    const modalH = 430;

    // Lớp phủ mờ nền
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.65);
    overlay.fillRect(-640, -360, 1280, 720);
    overlay.setInteractive(new Phaser.Geom.Rectangle(-640, -360, 1280, 720), Phaser.Geom.Rectangle.Contains);

    // Khung hộp thoại bán trong suốt
    const box = this.add.graphics();
    box.fillStyle(0x080d14, 0.94);
    box.fillRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 10);
    box.lineStyle(1.5, 0x9b59b6, 0.9);
    box.strokeRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 10);

    const title = HDTextHelper.createText(this, 0, -modalH / 2 + 34, '📜 THÔNG TIN & CỐT TRUYỆN', {
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#f1c40f',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5);

    const contentText = HDTextHelper.createText(
      this,
      0,
      12,
      'HOLLOW WOODS: DỊ CẢNH RỪNG LIỄU (THE FOG THAT REMEMBERS)\n\n' +
      'Ngươi tỉnh giấc nơi rìa làng cổ Bellhollow — một thánh địa hoang phế bị giam hãm trong Màn Sương Ký Ức.\n' +
      'Đèn lồng là nguồn sáng thiêng liêng duy nhất duy trì Bình Tâm và xua đuổi Kẻ Lắng Nghe (The Listener) —\n' +
      'thực thể mù lòa săn đuổi bất kỳ ai phát ra tiếng động trong đêm.\n\n' +
      'Hãy lần theo dấu tích của Người Giữ Chuông Edda, rèn giũa vũ khí, giải mã các Thạch Trụ Cổ\n' +
      'và rung lên Hồi Chuông Thứ Ba để giải thoát ngôi làng khỏi màn đêm vĩnh cửu.\n\n' +
      '──────────────────────────────────────────────────────────\n' +
      '• Engine: Phaser 4 + TypeScript | Độ phân giải chuẩn HD 1280×720\n' +
      '• Đồ họa: Visual Direction A — Pixel Art Gothic Rừng Sâu u tịch\n' +
      '• Phiên bản: V1.3.0 (Hybrid Open World Architecture)',
      {
        fontSize: '11.5px',
        color: '#e2e8f0',
        lineSpacing: 5,
        align: 'center',
        wordWrap: { width: modalW - 48 }
      }
    ).setOrigin(0.5, 0.5);

    // Nút Đóng
    const closeBtn = this.add.container(0, modalH / 2 - 34);
    const closeBg = this.add.graphics();
    closeBg.fillStyle(0x1a2332, 0.95);
    closeBg.fillRoundedRect(-90, -16, 180, 32, 6);
    closeBg.lineStyle(1, 0x4a5568, 0.9);
    closeBg.strokeRoundedRect(-90, -16, 180, 32, 6);

    const closeText = HDTextHelper.createText(this, 0, 0, '✕ ĐÓNG [ESC]', {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ecf0f1'
    }).setOrigin(0.5, 0.5);

    closeBtn.add([closeBg, closeText]);
    closeBtn.setSize(180, 32);
    closeBtn.setInteractive(new Phaser.Geom.Rectangle(-90, -16, 180, 32), Phaser.Geom.Rectangle.Contains);
    closeBtn.on('pointerdown', () => this.closeActiveMenuModal());

    modal.add([overlay, box, title, contentText, closeBtn]);
    this.activeMenuModal = modal;
  }

  private closeActiveMenuModal(): void {
    if (this.activeMenuModal) {
      AudioManager.getInstance().playInteract();
      this.activeMenuModal.destroy();
      this.activeMenuModal = undefined;
    }
  }

  private showNoticeToast(message: string): void {
    AudioManager.getInstance().playInteract();
    const toast = HDTextHelper.createText(this, 480, 480, message, {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#f39c12',
      backgroundColor: '#0c1017ee',
      padding: { x: 14, y: 8 },
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5).setDepth(9999);

    this.tweens.add({
      targets: toast,
      alpha: 0,
      y: 460,
      duration: 2200,
      ease: 'Power2',
      onComplete: () => toast.destroy()
    });
  }
}
