/**
 * HOLLOW WOODS V1.4 — V14-P8-12
 * HD MAIN MENU WITH DARK WOODLAND ATMOSPHERE & AMBER LANTERN SHOWCASE
 * Chuẩn HD 1280×720: Bầu không khí rừng đêm u tịch, đom đóm hổ phách lượn bay,
 * sương mù trôi nhẹ, phong cách gỗ tối viền đồng xỉn và nhân vật đứng vững trên mặt đất.
 */

import * as Phaser from 'phaser';
import {
  SCENE_MAIN_MENU,
  SCENE_GAME,
  SPRITE_FOG_SMOOTH,
  SPRITE_TREE_OAK_1,
  SPRITE_TREE_DEAD,
  SATYR_SHEET_KEY,
  WAYFARER_IDLE_KEY
} from '../config/Constants';
import { SaveManager } from '../systems/SaveManager';
import { HDTextHelper } from '../utils/HDTextHelper';
import { AudioManager } from '../audio/AudioManager';

export class MainMenuScene extends Phaser.Scene {
  private activeMenuModal?: Phaser.GameObjects.Container;
  private emberParticles: Phaser.GameObjects.Arc[] = [];

  constructor() {
    super({ key: SCENE_MAIN_MENU });
  }

  public create(): void {
    this.cameras.main.setZoom(1.0);

    // =========================================================================
    // 1. BẦU KHÔNG KHÍ RỪNG ĐÊM U TỊCH & HẬU CẢNH CÓ CHIỀU SÂU (HD 1280×720)
    // =========================================================================
    const bg = this.add.graphics();
    // Gradient rừng đêm sẫm màu tự nhiên (xanh rêu than -> chàm đêm -> đất ẩm)
    bg.fillGradientStyle(0x06090d, 0x06090d, 0x10151a, 0x0c1214, 1);
    bg.fillRect(0, 0, 1280, 720);

    // Hậu cảnh cây cổ thụ rừng sâu mờ ảo đa tầng
    if (this.textures.exists(SPRITE_TREE_OAK_1)) {
      // Cây đại thụ xa xôi phía sau bên trái
      const treeBackLeft = this.add.image(60, 390, SPRITE_TREE_OAK_1);
      treeBackLeft.setScale(1.4).setTint(0x080d11).setAlpha(0.28);

      // Cây cổ thụ tiền cảnh bên trái
      const treeLeft = this.add.image(130, 425, SPRITE_TREE_OAK_1);
      treeLeft.setScale(1.85).setTint(0x0d1318).setAlpha(0.44);
    }
    if (this.textures.exists(SPRITE_TREE_DEAD)) {
      // Cây khô gai góc bên phải
      const treeRight = this.add.image(1175, 410, SPRITE_TREE_DEAD);
      treeRight.setScale(2.25).setTint(0x121820).setAlpha(0.38);
    }

    // =========================================================================
    // 2. HAI TẦNG SƯƠNG MÙ TRÔI CHẬM HUYỀN ẢO PHÍA CHÂN TRỜI
    // =========================================================================
    if (this.textures.exists(SPRITE_FOG_SMOOTH)) {
      // Tầng sương hậu cảnh trôi sang phải
      const fogBack = this.add.tileSprite(0, 390, 1280, 330, SPRITE_FOG_SMOOTH);
      fogBack.setOrigin(0, 0);
      fogBack.setAlpha(0.16);
      this.tweens.add({
        targets: fogBack,
        tilePositionX: 512,
        duration: 38000,
        repeat: -1,
        ease: 'Linear'
      });

      // Tầng sương tiền cảnh trôi nhịp nhàng sang trái
      const fogFront = this.add.tileSprite(0, 440, 1280, 280, SPRITE_FOG_SMOOTH);
      fogFront.setOrigin(0, 0);
      fogFront.setAlpha(0.24);
      this.tweens.add({
        targets: fogFront,
        tilePositionX: -512,
        duration: 26000,
        repeat: -1,
        ease: 'Linear'
      });
    }

    // =========================================================================
    // 3. ĐOM ĐÓM & TÀN LỬA HỔ PHÁCH BAY LỮNG LỜ TRONG ĐÊM (AMBER EMBERS)
    // =========================================================================
    this.createAmbientEmbers();

    // =========================================================================
    // 4. SHOWCASE NHÂN VẬT THE MOSSBOUND WAYFARER DƯỚI QUẦNG SÁNG MỊN
    // =========================================================================
    const rogueX = 990;
    const groundY = 502; // Tọa độ mặt đất phẳng nơi nhân vật đặt chân

    // Tạo CanvasTexture quầng sáng đèn lồng tỏa tròn mịn màng (Smooth Radial Gradient)
    const glowKey = 'menu_lantern_glow_smooth';
    if (!this.textures.exists(glowKey)) {
      const glowCanvas = this.textures.createCanvas(glowKey, 340, 340);
      if (glowCanvas) {
        const ctx = glowCanvas.getContext();
        const radGrad = ctx.createRadialGradient(170, 170, 0, 170, 170, 170);
        radGrad.addColorStop(0.0, 'rgba(255, 235, 170, 0.46)'); // Tâm sáng vàng ấm
        radGrad.addColorStop(0.22, 'rgba(243, 156, 18, 0.28)'); // Quầng hổ phách rực rỡ
        radGrad.addColorStop(0.50, 'rgba(211, 84, 0, 0.12)');  // Viền đồng cam ấm
        radGrad.addColorStop(0.78, 'rgba(130, 45, 0, 0.04)');  // Khói ấm mờ dần
        radGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');          // Trong suốt hoàn toàn
        ctx.fillStyle = radGrad;
        ctx.fillRect(0, 0, 340, 340);
        glowCanvas.refresh();
      }
    }

    // Quầng sáng đèn lồng tỏa tròn êm dịu bao quanh nhân vật
    const lanternGlow = this.add.image(rogueX, groundY - 58, glowKey);
    lanternGlow.setOrigin(0.5, 0.5);
    lanternGlow.setAlpha(0.92);

    // Hiệu ứng ánh lửa bập bùng nhẹ nhàng, mờ ảo
    this.tweens.add({
      targets: lanternGlow,
      alpha: 0.74,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Bóng đổ elip mềm mại chạm chân dưới mặt đất
    const shadow = this.add.graphics();
    shadow.fillStyle(0x040608, 0.72);
    shadow.fillEllipse(rogueX, groundY, 78, 20);

    // Sprite nhân vật chính (Black Knight / The Mossbound Wayfarer)
    // Đặt origin (0.5, 1.0) để bàn chân chạm trực tiếp lên tâm bóng đổ elip, không bị bay lơ lửng
    const heroTexture = this.textures.exists(WAYFARER_IDLE_KEY) ? WAYFARER_IDLE_KEY : SATYR_SHEET_KEY;
    if (this.textures.exists(heroTexture)) {
      const darkRogue = this.add.sprite(rogueX, groundY, heroTexture, 0);
      darkRogue.setScale(2.5);
      darkRogue.setOrigin(0.5, 1.0);

      // Hiệu ứng thở nhẹ nhàng khi đứng nghỉ (Breathing idle)
      this.tweens.add({
        targets: darkRogue,
        scaleY: 2.525,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // =========================================================================
    // 5. TIÊU ĐỀ CHÍNH SANG TRỌNG THEO PHONG CÁCH GỖ TỐI & HỔ PHÁCH TRẦM
    // =========================================================================
    // Tiêu đề HOLLOW WOODS ánh hổ phách trầm uy nghi
    HDTextHelper.createText(this, 480, 102, 'HOLLOW WOODS', {
      fontSize: '56px',
      fontStyle: 'bold',
      color: '#e5a93c',
      stroke: '#140d06',
      strokeThickness: 6
    }).setOrigin(0.5, 0.5);

    // Phụ đề kem ấm thanh thoát
    HDTextHelper.createText(this, 480, 158, 'DỊ CẢNH RỪNG LIỄU — THE FOG THAT REMEMBERS', {
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#e8dfcf',
      stroke: '#0f0a06',
      strokeThickness: 2.5
    }).setOrigin(0.5, 0.5);

    // Tagline trích dẫn kinh điển sắc màu giấy cũ
    HDTextHelper.createText(this, 480, 194, '“Sương mù đưa anh đến đây. Khu rừng đã ghi nhớ anh từ trước.”', {
      fontSize: '12.5px',
      fontStyle: 'italic',
      color: '#a89f8c'
    }).setOrigin(0.5, 0.5);

    // =========================================================================
    // 6. CÁC NÚT BẤM MENU GỖ TỐI VIỀN ĐỒNG XỈN (DARK WOOD & TARNISHED BRONZE)
    // =========================================================================
    const hasSaveGame = SaveManager.hasSave();
    const saveSummary = SaveManager.getSaveSummary();

    const startX = 480;
    let currentY = 248;
    const btnSpacing = 58;

    // Nút 1: BƯỚC VÀO MÀN SƯƠNG (New Game)
    this.createMenuButton(
      startX,
      currentY,
      '► BƯỚC VÀO MÀN SƯƠNG',
      null,
      '#e5a93c',
      true,
      () => this.startNewGame()
    );
    currentY += btnSpacing;

    // Nút 2: TIẾP TỤC HÀNH TRÌNH (Continue Game - Tách 2 dòng chống tràn chữ)
    if (hasSaveGame && saveSummary) {
      const checkpointDesc = saveSummary.checkpoint || 'Hồi 0 • Cổng Làng Bellhollow';
      const continueBtn = this.createMenuButton(
        startX,
        currentY,
        '► TIẾP TỤC HÀNH TRÌNH',
        checkpointDesc,
        '#e5a93c',
        true,
        () => this.continueGame()
      );

      this.tweens.add({
        targets: continueBtn,
        alpha: 0.88,
        duration: 1200,
        yoyo: true,
        repeat: -1
      });
    } else {
      this.createMenuButton(
        startX,
        currentY,
        '▷ TIẾP TỤC (CHƯA CÓ BẢN LƯU)',
        'Chưa có bản lưu hành trình',
        '#685d50',
        false,
        () => this.showNoticeToast('⚠️ Chưa có bản lưu hành trình! Vui lòng chọn Bước Vào Màn Sương.')
      );
    }
    currentY += btnSpacing;

    // Nút 3: CÀI ĐẶT TRÒ CHƠI (Settings)
    this.createMenuButton(
      startX,
      currentY,
      '⚙ CÀI ĐẶT TRÒ CHƠI',
      null,
      '#c8963e',
      true,
      () => this.showSettingsModal()
    );
    currentY += btnSpacing;

    // Nút 4: THÔNG TIN & CỐT TRUYỆN (Credits / Lore)
    this.createMenuButton(
      startX,
      currentY,
      'ℹ THÔNG TIN & CỐT TRUYỆN',
      null,
      '#b8860b',
      true,
      () => this.showCreditsModal()
    );

    // Lắng nghe phím tắt điều khiển nhanh tại Menu chính
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

    // Kích hoạt Web Audio Context khi người chơi tương tác chuột hoặc phím
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

    // =========================================================================
    // 7. BẢNG HƯỚNG DẪN ĐIỀU KHIỂN GỖ TỐI ĐỒNG XỈN Ở ĐÁY MÀN HÌNH
    // =========================================================================
    const guideBox = this.add.graphics();
    guideBox.fillStyle(0x120d09, 0.85);
    guideBox.fillRoundedRect(160, 584, 960, 90, 8);
    // Viền đồng xỉn
    guideBox.lineStyle(1.5, 0x5c4627, 0.8);
    guideBox.strokeRoundedRect(160, 584, 960, 90, 8);
    // Đường chỉ ấm bên trong
    guideBox.lineStyle(1, 0x8a6d3b, 0.35);
    guideBox.strokeRoundedRect(162, 586, 956, 86, 6);

    HDTextHelper.createText(
      this,
      640,
      629,
      'HƯỚNG DẪN ĐIỀU KHIỂN:\n' +
      '[W, A, S, D] / [Mũi tên]: Di chuyển Lữ Khách   |   [Shift]: Chạy nhanh   |   [F]: Bật / Tắt Đèn Lồng\n' +
      '[E]: Tương tác / Trò chuyện / Thu thập   |   [Q]: Ném Mồi Tiếng Động   |   [C / I]: Bàn Chế Tạo   |   [J]: Sổ Tay\n' +
      '[M]: Bật / Tắt Âm Thanh   |   [ESC]: Tạm Dừng & Lưu Game   |   [F4]: Bật / Tắt Khung Kiểm Toán',
      {
        fontSize: '12px',
        color: '#a89f8c',
        align: 'center',
        lineSpacing: 5
      }
    ).setOrigin(0.5, 0.5);

    // Phiên bản V1.4.0 hiển thị tinh tế ở góc dưới phải
    HDTextHelper.createText(
      this,
      1265,
      705,
      'V1.4.0 (Visual Direction A • Gothic Woodland) | Phaser 4 + TypeScript | 1280×720 HD',
      {
        fontSize: '11px',
        color: '#6e5e4d'
      }
    ).setOrigin(1, 1);
  }

  /**
   * Tạo đàn đom đóm và tàn lửa hổ phách bập bùng lượn bay tự nhiên
   */
  private createAmbientEmbers(): void {
    const emberColors = [0xf39c12, 0xf1c40f, 0xffd37f, 0xe67e22];
    const emberCount = 30;

    for (let i = 0; i < emberCount; i++) {
      const rx = Phaser.Math.Between(40, 1240);
      const ry = Phaser.Math.Between(180, 680);
      const radius = Phaser.Math.FloatBetween(1.2, 2.5);
      const color = Phaser.Utils.Array.GetRandom(emberColors);

      const ember = this.add.circle(rx, ry, radius, color);
      ember.setAlpha(Phaser.Math.FloatBetween(0.2, 0.75));
      this.emberParticles.push(ember);

      // Hiệu ứng trôi lượn tự nhiên theo trục Y (bay lên nhẹ) và dao động ngang hình sin
      const floatDuration = Phaser.Math.Between(3500, 7000);
      const driftY = Phaser.Math.Between(-35, -75);
      const driftX = Phaser.Math.Between(-18, 18);

      this.tweens.add({
        targets: ember,
        y: ry + driftY,
        x: rx + driftX,
        alpha: { from: ember.alpha, to: Phaser.Math.FloatBetween(0.1, 0.9) },
        duration: floatDuration,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  /**
   * Dựng nút Menu chuẩn phong cách gỗ tối viền đồng xỉn với hiệu ứng sáng hổ phách khi hover
   */
  private createMenuButton(
    x: number,
    y: number,
    mainText: string,
    subText: string | null,
    defaultColor: string,
    isEnabled: boolean,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const btn = this.add.container(x, y);
    const hasSub = Boolean(subText);
    const btnW = 460;
    const btnH = hasSub ? 52 : 44;

    const bg = this.add.graphics();
    const renderButtonState = (isHover: boolean) => {
      bg.clear();
      if (!isEnabled) {
        // Nút bị vô hiệu hóa (Disabled state)
        bg.fillStyle(0x0f0b08, 0.75);
        bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
        bg.lineStyle(1, 0x3d3020, 0.65);
        bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
        return;
      }

      if (isHover) {
        // Trạng thái khi di chuột: Gỗ ấm sáng viền hổ phách rực rỡ
        bg.fillStyle(0x22180e, 0.96);
        bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
        // Viền sáng vàng hổ phách
        bg.lineStyle(1.8, 0xe5a93c, 1.0);
        bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
        // Đường viền bên trong ấm áp
        bg.lineStyle(1, 0xf1c40f, 0.4);
        bg.strokeRoundedRect(-btnW / 2 + 2, -btnH / 2 + 2, btnW - 4, btnH - 4, 4);
      } else {
        // Trạng thái bình thường: Gỗ tối viền đồng xỉn mộc mạc
        bg.fillStyle(0x15100b, 0.88);
        bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
        // Viền đồng xỉn
        bg.lineStyle(1.5, 0x6e5233, 0.85);
        bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
        // Đường bóng kim loại
        bg.lineStyle(1, 0x9c774b, 0.35);
        bg.strokeRoundedRect(-btnW / 2 + 1, -btnH / 2 + 1, btnW - 2, btnH - 2, 4);

        // 4 đinh tán đồng ở 4 góc
        bg.fillStyle(0xb89058, 0.8);
        bg.fillRect(-btnW / 2 + 3, -btnH / 2 + 3, 2, 2);
        bg.fillRect(btnW / 2 - 5, -btnH / 2 + 3, 2, 2);
        bg.fillRect(-btnW / 2 + 3, btnH / 2 - 5, 2, 2);
        bg.fillRect(btnW / 2 - 5, btnH / 2 - 5, 2, 2);
      }
    };

    renderButtonState(false);

    // Dòng chữ chính
    const mainY = hasSub ? -8 : 0;
    const txtMain = HDTextHelper.createText(this, 0, mainY, mainText, {
      fontSize: hasSub ? '14px' : '14.5px',
      fontStyle: 'bold',
      color: defaultColor,
      stroke: '#0f0a06',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);

    btn.add([bg, txtMain]);

    // Dòng chữ phụ (nếu có, ví dụ: checkpoint Hồi 0 • Cổng Làng Bellhollow)
    let txtSub: Phaser.GameObjects.Text | undefined;
    if (hasSub && subText) {
      txtSub = HDTextHelper.createText(this, 0, 11, subText, {
        fontSize: '11px',
        color: isEnabled ? '#baa892' : '#685d50',
        stroke: '#0c0805',
        strokeThickness: 1
      }).setOrigin(0.5, 0.5);
      btn.add(txtSub);
    }

    btn.setSize(btnW, btnH);

    if (isEnabled) {
      btn.setInteractive(new Phaser.Geom.Rectangle(-btnW / 2, -btnH / 2, btnW, btnH), Phaser.Geom.Rectangle.Contains);
      btn.on('pointerdown', () => {
        AudioManager.getInstance().playInteract();
        onClick();
      });
      btn.on('pointerover', () => {
        renderButtonState(true);
        txtMain.setColor('#fff5db');
        if (txtSub) txtSub.setColor('#edd8be');
      });
      btn.on('pointerout', () => {
        renderButtonState(false);
        txtMain.setColor(defaultColor);
        if (txtSub) txtSub.setColor('#baa892');
      });
    } else {
      btn.setInteractive(new Phaser.Geom.Rectangle(-btnW / 2, -btnH / 2, btnW, btnH), Phaser.Geom.Rectangle.Contains);
      btn.on('pointerdown', () => {
        onClick();
      });
      btn.setAlpha(0.65);
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
   * Hộp thoại Cài Đặt (Settings Modal) theo phong cách gỗ tối và đồng xỉn
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

    // Khung hộp thoại gỗ tối viền đồng xỉn
    const box = this.add.graphics();
    box.fillStyle(0x120d09, 0.95);
    box.fillRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 10);
    box.lineStyle(1.8, 0x8a6d3b, 0.9);
    box.strokeRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 10);
    box.lineStyle(1, 0x5c4627, 0.5);
    box.strokeRoundedRect(-modalW / 2 + 3, -modalH / 2 + 3, modalW - 6, modalH - 6, 8);

    const title = HDTextHelper.createText(this, 0, -modalH / 2 + 34, '⚙ CÀI ĐẶT TRÒ CHƠI', {
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#e5a93c',
      stroke: '#140d06',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5);

    // Nút Bật/Tắt Âm Thanh
    const audio = AudioManager.getInstance();
    const audioBtn = this.add.container(0, -modalH / 2 + 95);
    const audioBg = this.add.graphics();
    const isMuted = audio.isMuted;

    const renderAudioBtn = (muted: boolean) => {
      audioBg.clear();
      audioBg.fillStyle(muted ? 0x241416 : 0x14221a, 0.95);
      audioBg.fillRoundedRect(-160, -18, 320, 36, 6);
      audioBg.lineStyle(1.2, muted ? 0xc0392b : 0x27ae60, 0.9);
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
        color: isMuted ? '#e74c3c' : '#2ecc71',
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
      audioText.setColor(nowMuted ? '#e74c3c' : '#2ecc71');
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
        color: '#d4cbbe',
        lineSpacing: 6,
        align: 'left'
      }
    ).setOrigin(0.5, 0.5);

    // Nút Đóng
    const closeBtn = this.add.container(0, modalH / 2 - 36);
    const closeBg = this.add.graphics();
    closeBg.fillStyle(0x1e1610, 0.95);
    closeBg.fillRoundedRect(-90, -16, 180, 32, 6);
    closeBg.lineStyle(1.2, 0x6e5233, 0.9);
    closeBg.strokeRoundedRect(-90, -16, 180, 32, 6);

    const closeText = HDTextHelper.createText(this, 0, 0, '✕ ĐÓNG [ESC]', {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#f5eedc'
    }).setOrigin(0.5, 0.5);

    closeBtn.add([closeBg, closeText]);
    closeBtn.setSize(180, 32);
    closeBtn.setInteractive(new Phaser.Geom.Rectangle(-90, -16, 180, 32), Phaser.Geom.Rectangle.Contains);
    closeBtn.on('pointerdown', () => this.closeActiveMenuModal());

    modal.add([overlay, box, title, audioBtn, infoText, closeBtn]);
    this.activeMenuModal = modal;
  }

  /**
   * Hộp thoại Thông Tin & Cốt Truyện (Credits / Lore Modal)
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

    // Khung hộp thoại gỗ tối viền đồng xỉn
    const box = this.add.graphics();
    box.fillStyle(0x120d09, 0.95);
    box.fillRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 10);
    box.lineStyle(1.8, 0x8a6d3b, 0.9);
    box.strokeRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 10);
    box.lineStyle(1, 0x5c4627, 0.5);
    box.strokeRoundedRect(-modalW / 2 + 3, -modalH / 2 + 3, modalW - 6, modalH - 6, 8);

    const title = HDTextHelper.createText(this, 0, -modalH / 2 + 34, '📜 THÔNG TIN & CỐT TRUYỆN', {
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#e5a93c',
      stroke: '#140d06',
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
      '• Phiên bản: V1.4.0 (Gói Mở Rộng Sinh Mệnh Rừng Sâu & Faction Hiệp Sĩ)',
      {
        fontSize: '11.5px',
        color: '#d8cfbe',
        lineSpacing: 5,
        align: 'center',
        wordWrap: { width: modalW - 48 }
      }
    ).setOrigin(0.5, 0.5);

    // Nút Đóng
    const closeBtn = this.add.container(0, modalH / 2 - 34);
    const closeBg = this.add.graphics();
    closeBg.fillStyle(0x1e1610, 0.95);
    closeBg.fillRoundedRect(-90, -16, 180, 32, 6);
    closeBg.lineStyle(1.2, 0x6e5233, 0.9);
    closeBg.strokeRoundedRect(-90, -16, 180, 32, 6);

    const closeText = HDTextHelper.createText(this, 0, 0, '✕ ĐÓNG [ESC]', {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#f5eedc'
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
      color: '#e5a93c',
      backgroundColor: '#120d09ee',
      padding: { x: 14, y: 8 },
      stroke: '#0f0a06',
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
