/**
 * HOLLOW WOODS V1.4 — V14-UIUX-POLISH
 * HD MAIN MENU WITH BALANCED 2-COLUMN LAYOUT & 100% PRECISE HITBOX SYSTEM
 * 
 * Chuẩn HD 1280×720:
 * - Bố cục đối xứng 2 cột hoàn hảo: Cột Trái Menu (tâm X = 390) & Cột Phải Showcase (tâm X = 890)
 * - Khắc phục dứt điểm lỗi hitbox: Dùng hitZone chuyên dụng với useHandCursor, không jitter, phản hồi click tactile
 * - Hiệu ứng quầng sáng đèn lồng hổ phách mịn màng (Radial Gradient mượt mà, loại bỏ triệt để dĩa tròn cứng)
 * - Nhân vật The Mossbound Wayfarer đứng vững trên mặt đất, bàn chân tiếp xúc chính xác tâm bóng đổ elip
 * - Hộp hướng dẫn điều khiển cân đối đáy màn hình (X = 160..1120, tâm X = 640)
 */

import * as Phaser from 'phaser';
import {
  SCENE_MAIN_MENU,
  SCENE_GAME,
  SPRITE_FOG_SMOOTH,
  SPRITE_TREE_OAK_1,
  SPRITE_TREE_DEAD,
  SATYR_SHEET_KEY,
  WAYFARER_IDLE_KEY,
  WAYFARER_ORIGIN_X,
  WAYFARER_ORIGIN_Y
} from '../config/Constants';
import { registerWayfarerAnimations } from '../animation/SatyrAnimations';
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
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.setZoom(1.0);

    // Đăng ký hoạt ảnh Wayfarer nếu chưa tồn tại
    try {
      if (!this.anims.exists('wayfarer_idle_down')) {
        registerWayfarerAnimations(this.anims);
      }
    } catch (e) {
      console.warn('[MainMenuScene] Could not register wayfarer animations:', e);
    }

    // =========================================================================
    // 1. BẦU KHÔNG KHÍ RỪNG ĐÊM U TỊCH & HẬU CẢNH CÓ CHIỀU SÂU (HD 1280×720)
    // =========================================================================
    const bg = this.add.graphics();
    // Gradient rừng đêm sẫm màu tự nhiên (xanh rêu than -> chàm đêm -> đất ẩm)
    bg.fillGradientStyle(0x06090e, 0x06090e, 0x0f151c, 0x0b1114, 1);
    bg.fillRect(0, 0, 1280, 720);

    // Hậu cảnh cây cổ thụ rừng sâu mờ ảo đa tầng
    if (this.textures.exists(SPRITE_TREE_OAK_1)) {
      // Cây đại thụ xa xôi phía sau bên trái
      const treeBackLeft = this.add.image(70, 390, SPRITE_TREE_OAK_1);
      treeBackLeft.setScale(1.4).setTint(0x080d12).setAlpha(0.28);

      // Cây cổ thụ tiền cảnh bên trái
      const treeLeft = this.add.image(140, 425, SPRITE_TREE_OAK_1);
      treeLeft.setScale(1.85).setTint(0x0c131a).setAlpha(0.44);
    }
    if (this.textures.exists(SPRITE_TREE_DEAD)) {
      // Cây khô gai góc bên phải
      const treeRight = this.add.image(1185, 410, SPRITE_TREE_DEAD);
      treeRight.setScale(2.25).setTint(0x111720).setAlpha(0.38);
    }

    // =========================================================================
    // 2. HAI TẦNG SƯƠNG MÙ TRÔI CHẬM HUYỀN ẢO PHÍA CHÂN TRỜI
    // =========================================================================
    if (this.textures.exists(SPRITE_FOG_SMOOTH)) {
      // Tầng sương hậu cảnh trôi sang phải
      const fogBack = this.add.tileSprite(0, 380, 1280, 340, SPRITE_FOG_SMOOTH);
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
      fogFront.setAlpha(0.22);
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
    // 4. CỘT TRÁI (TÂM X = 390): TIÊU ĐỀ, PHỤ ĐỀ, HOA VĂN & CÁC NÚT MENU
    // =========================================================================
    const menuCenterX = 390;

    // Tiêu đề HOLLOW WOODS ánh hổ phách trầm uy nghi với bóng đổ sâu
    HDTextHelper.createText(this, menuCenterX + 2, 102, 'HOLLOW WOODS', {
      fontSize: '54px',
      fontStyle: 'bold',
      color: '#080503'
    }).setOrigin(0.5, 0.5).setAlpha(0.7);

    HDTextHelper.createText(this, menuCenterX, 100, 'HOLLOW WOODS', {
      fontSize: '54px',
      fontStyle: 'bold',
      color: '#e5a93c',
      stroke: '#140d06',
      strokeThickness: 6
    }).setOrigin(0.5, 0.5);

    // Phụ đề kem ấm thanh thoát
    HDTextHelper.createText(this, menuCenterX, 152, 'DỊ CẢNH RỪNG LIỄU — THE FOG THAT REMEMBERS', {
      fontSize: '14.5px',
      fontStyle: 'bold',
      color: '#f3ebe0',
      stroke: '#0e0905',
      strokeThickness: 2.5
    }).setOrigin(0.5, 0.5);

    // Tagline trích dẫn kinh điển sắc màu giấy cũ
    HDTextHelper.createText(this, menuCenterX, 182, '“Sương mù đưa anh đến đây. Khu rừng đã ghi nhớ anh từ trước.”', {
      fontSize: '12px',
      fontStyle: 'italic',
      color: '#ab9f8e'
    }).setOrigin(0.5, 0.5);

    // Đường chỉ hoa văn cổ điển ngăn cách tiêu đề và danh sách nút (Bronze Ornament Divider)
    const divider = this.add.graphics();
    // Đường kẻ chuyển sắc đồng xỉn
    divider.lineStyle(1.5, 0x6e5233, 0.7);
    divider.lineBetween(menuCenterX - 180, 206, menuCenterX + 180, 206);
    divider.lineStyle(1, 0xb89058, 0.4);
    divider.lineBetween(menuCenterX - 100, 206, menuCenterX + 100, 206);

    // Viên ngọc hổ phách hình thoi chính giữa đường kẻ
    const diamond = this.add.graphics();
    diamond.fillStyle(0xe5a93c, 0.9);
    diamond.beginPath();
    diamond.moveTo(menuCenterX, 202);
    diamond.lineTo(menuCenterX + 4, 206);
    diamond.lineTo(menuCenterX, 210);
    diamond.lineTo(menuCenterX - 4, 206);
    diamond.closePath();
    diamond.fillPath();

    // =========================================================================
    // 5. CÁC NÚT BẤM MENU GỖ TỐI VIỀN ĐỒNG XỈN (HITBOX CHUẨN XÁC 100%)
    // =========================================================================
    const hasSaveGame = SaveManager.hasSave();
    const saveSummary = SaveManager.getSaveSummary();

    let currentY = 246;
    const btnSpacing = 62;

    // Nút 1: BƯỚC VÀO MÀN SƯƠNG (New Game)
    this.createMenuButton(
      menuCenterX,
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
        menuCenterX,
        currentY,
        '► TIẾP TỤC HÀNH TRÌNH',
        checkpointDesc,
        '#e5a93c',
        true,
        () => this.continueGame()
      );

      this.tweens.add({
        targets: continueBtn,
        alpha: 0.90,
        duration: 1200,
        yoyo: true,
        repeat: -1
      });
    } else {
      this.createMenuButton(
        menuCenterX,
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
      menuCenterX,
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
      menuCenterX,
      currentY,
      'ℹ THÔNG TIN & CỐT TRUYỆN',
      null,
      '#b8860b',
      true,
      () => this.showCreditsModal()
    );

    // =========================================================================
    // 6. CỘT PHẢI (TÂM X = 890): SHOWCASE NHÂN VẬT & QUẦNG SÁNG ĐÈN LỒNG
    // =========================================================================
    const showcaseCenterX = 890;
    const groundY = 485; // Cao độ mặt đất phẳng chuẩn xác

    // Nền đất ẩm và mảng rêu tối dưới chân nhân vật
    const soilGround = this.add.graphics();
    soilGround.fillStyle(0x080c10, 0.55);
    soilGround.fillEllipse(showcaseCenterX, groundY + 2, 160, 30);
    soilGround.fillStyle(0x0c1218, 0.35);
    soilGround.fillEllipse(showcaseCenterX, groundY + 1, 110, 20);

    // Bóng đổ elip mềm mại chạm chân dưới mặt đất
    const shadow = this.add.graphics();
    shadow.fillStyle(0x030507, 0.78);
    shadow.fillEllipse(showcaseCenterX, groundY, 84, 20);

    // Tạo CanvasTexture quầng sáng đèn lồng tỏa tròn mịn màng (Smooth Multi-stop Radial Gradient)
    const glowKey = 'menu_lantern_glow_smooth_v14';
    if (!this.textures.exists(glowKey)) {
      const glowCanvas = this.textures.createCanvas(glowKey, 380, 380);
      if (glowCanvas) {
        const ctx = glowCanvas.getContext();
        const radGrad = ctx.createRadialGradient(190, 190, 0, 190, 190, 190);
        radGrad.addColorStop(0.00, 'rgba(255, 242, 195, 0.52)'); // Tâm sáng vàng ấm
        radGrad.addColorStop(0.18, 'rgba(245, 175, 40, 0.32)');  // Quầng hổ phách rực rỡ
        radGrad.addColorStop(0.42, 'rgba(215, 105, 15, 0.15)');  // Viền đồng cam ấm
        radGrad.addColorStop(0.68, 'rgba(130, 50, 5, 0.05)');   // Khói ấm mờ dần
        radGrad.addColorStop(0.88, 'rgba(60, 20, 2, 0.015)');   // Chuyển tiếp êm dịu
        radGrad.addColorStop(1.00, 'rgba(0, 0, 0, 0)');          // Trong suốt hoàn toàn
        ctx.fillStyle = radGrad;
        ctx.fillRect(0, 0, 380, 380);
        glowCanvas.refresh();
      }
    }

    // Quầng sáng đèn lồng tỏa tròn êm dịu bao quanh nhân vật (đặt tại ngang ngực nhân vật)
    const lanternGlow = this.add.image(showcaseCenterX, groundY - 60, glowKey);
    lanternGlow.setOrigin(0.5, 0.5);
    lanternGlow.setAlpha(0.92);

    // Hiệu ứng ánh lửa bập bùng nhẹ nhàng, mờ ảo
    this.tweens.add({
      targets: lanternGlow,
      alpha: 0.76,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Sprite nhân vật chính (The Mossbound Wayfarer)
    // Đặt origin đúng chuẩn WAYFARER_ORIGIN_X (0.5) và WAYFARER_ORIGIN_Y (0.90625)
    // để bàn chân chạm trực tiếp lên tâm bóng đổ elip trên mặt đất
    const heroTexture = this.textures.exists(WAYFARER_IDLE_KEY) ? WAYFARER_IDLE_KEY : SATYR_SHEET_KEY;
    if (this.textures.exists(heroTexture)) {
      const darkRogue = this.add.sprite(showcaseCenterX, groundY, heroTexture, 0);
      darkRogue.setScale(2.55);
      darkRogue.setOrigin(WAYFARER_ORIGIN_X, WAYFARER_ORIGIN_Y);

      // Thử phát hoạt ảnh nhàn rỗi chuẩn nếu đã đăng ký, nếu chưa thì dùng hiệu ứng thở êm
      if (this.anims.exists('wayfarer_idle_down')) {
        darkRogue.play('wayfarer_idle_down');
      } else {
        this.tweens.add({
          targets: darkRogue,
          scaleY: 2.58,
          duration: 1500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    }

    // Nhãn danh xưng nhân vật trang trọng phía dưới chân
    HDTextHelper.createText(this, showcaseCenterX, groundY + 34, '✦ LỮ KHÁCH VÙNG ĐẦM RÊU ✦', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#d4ab68',
      stroke: '#0d0905',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);

    HDTextHelper.createText(this, showcaseCenterX, groundY + 52, 'The Mossbound Wayfarer • Ngọn Đèn Hổ Phách', {
      fontSize: '10.5px',
      fontStyle: 'italic',
      color: '#7e7364'
    }).setOrigin(0.5, 0.5);

    // =========================================================================
    // 7. LẮNG NGHE PHÍM TẮT & ÂM THANH NỀN
    // =========================================================================
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
    // 8. BẢNG HƯỚNG DẪN ĐIỀU KHIỂN GỖ TỐI ĐỒNG XỈN CÂN ĐỐI Ở ĐÁY MÀN HÌNH
    // =========================================================================
    const guideBox = this.add.graphics();
    guideBox.fillStyle(0x100c08, 0.92);
    guideBox.fillRoundedRect(160, 574, 960, 88, 8);
    // Viền ngoài đồng xỉn
    guideBox.lineStyle(1.5, 0x5c4627, 0.85);
    guideBox.strokeRoundedRect(160, 574, 960, 88, 8);
    // Đường chỉ ấm bên trong
    guideBox.lineStyle(1, 0x8a6d3b, 0.35);
    guideBox.strokeRoundedRect(162, 576, 956, 84, 6);

    HDTextHelper.createText(
      this,
      640,
      590,
      '✦ HƯỚNG DẪN ĐIỀU KHIỂN & PHÍM TẮT ✦',
      {
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#d1a858',
        align: 'center'
      }
    ).setOrigin(0.5, 0.5);

    HDTextHelper.createText(
      this,
      640,
      624,
      '[W, A, S, D] / [Mũi tên]: Di chuyển Lữ Khách   |   [Shift]: Chạy nhanh   |   [F]: Bật / Tắt Đèn Lồng   |   [E]: Tương tác / Trò chuyện\n' +
      '[Q]: Ném Mồi Tiếng Động   |   [C / I]: Bàn Chế Tạo   |   [J]: Sổ Tay   |   [M]: Bật / Tắt Âm Thanh   |   [ESC]: Tạm Dừng & Lưu Game   |   [F4]: Khung Kiểm Toán   |   [F9]: Kiểm Tra Hitbox',
      {
        fontSize: '11.5px',
        color: '#aba08f',
        align: 'center',
        lineSpacing: 5
      }
    ).setOrigin(0.5, 0.5);

    // Phiên bản V1.4.0 hiển thị tinh tế ở góc dưới phải
    HDTextHelper.createText(
      this,
      1265,
      706,
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
    const emberCount = 32;

    for (let i = 0; i < emberCount; i++) {
      const rx = Phaser.Math.Between(40, 1240);
      const ry = Phaser.Math.Between(160, 680);
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
   * Dựng nút Menu chuẩn phong cách gỗ tối viền đồng xỉn với hitbox 100% chuẩn xác
   * Sử dụng vùng tương tác độc lập (hitZone), loại bỏ hiện tượng lệch tọa độ và phản hồi chuột chập chờn.
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
    const btnW = 440;
    const btnH = hasSub ? 52 : 44;

    const bg = this.add.graphics();
    const renderButtonState = (isHover: boolean) => {
      bg.clear();
      if (!isEnabled) {
        // Nút bị vô hiệu hóa (Disabled state)
        bg.fillStyle(0x0e0a07, 0.78);
        bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
        bg.lineStyle(1, 0x3d3020, 0.65);
        bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
        return;
      }

      if (isHover) {
        // Trạng thái khi di chuột: Gỗ ấm sáng viền hổ phách rực rỡ
        bg.fillStyle(0x23190f, 0.98);
        bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
        // Viền sáng vàng hổ phách nổi bật
        bg.lineStyle(2.0, 0xe5a93c, 1.0);
        bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
        // Đường viền bên trong ấm áp
        bg.lineStyle(1, 0xf1c40f, 0.45);
        bg.strokeRoundedRect(-btnW / 2 + 2, -btnH / 2 + 2, btnW - 4, btnH - 4, 4);
      } else {
        // Trạng thái bình thường: Gỗ tối viền đồng xỉn mộc mạc
        bg.fillStyle(0x140e09, 0.90);
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
      stroke: '#0e0905',
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

    // HITBOX CHUẨN XÁC: Tạo hitZone nằm trên cùng của Container với kích thước chuẩn btnW x btnH
    const hitZone = this.add.zone(0, 0, btnW, btnH);
    hitZone.setInteractive({ useHandCursor: isEnabled });
    btn.add(hitZone);

    if (isEnabled) {
      hitZone.on('pointerover', () => {
        renderButtonState(true);
        txtMain.setColor('#fff6e0');
        if (txtSub) txtSub.setColor('#edd8be');
        this.tweens.add({
          targets: btn,
          scaleX: 1.02,
          scaleY: 1.02,
          duration: 100,
          ease: 'Quad.easeOut'
        });
      });

      hitZone.on('pointerout', () => {
        renderButtonState(false);
        txtMain.setColor(defaultColor);
        if (txtSub) txtSub.setColor('#baa892');
        this.tweens.add({
          targets: btn,
          scaleX: 1.0,
          scaleY: 1.0,
          duration: 100,
          ease: 'Quad.easeOut'
        });
      });

      hitZone.on('pointerdown', () => {
        this.tweens.add({
          targets: btn,
          scaleX: 0.985,
          scaleY: 0.985,
          duration: 60,
          ease: 'Quad.easeIn'
        });
      });

      hitZone.on('pointerup', () => {
        this.tweens.add({
          targets: btn,
          scaleX: 1.02,
          scaleY: 1.02,
          duration: 80,
          ease: 'Quad.easeOut'
        });
        AudioManager.getInstance().playInteract();
        onClick();
      });
    } else {
      btn.setAlpha(0.65);
      hitZone.on('pointerdown', () => {
        onClick();
      });
    }

    return btn;
  }

  private async continueGame(): Promise<void> {
    AudioManager.getInstance().playInteract();
    const saveData = await SaveManager.loadGameAsync();
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
   * Hộp thoại Cài Đặt (Settings Modal) theo phong cách gỗ tối và đồng xỉn với hitbox chuẩn
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
    
    // HitZone đóng modal khi nhấn ra ngoài
    const overlayHit = this.add.zone(0, 0, 1280, 720).setInteractive();
    overlayHit.on('pointerdown', () => this.closeActiveMenuModal());

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

    const renderAudioBtn = (muted: boolean, isHover: boolean = false) => {
      audioBg.clear();
      audioBg.fillStyle(muted ? (isHover ? 0x30181c : 0x241416) : (isHover ? 0x1a3325 : 0x14221a), 0.95);
      audioBg.fillRoundedRect(-160, -18, 320, 36, 6);
      audioBg.lineStyle(1.5, muted ? (isHover ? 0xe74c3c : 0xc0392b) : (isHover ? 0x2ecc71 : 0x27ae60), 0.9);
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

    const audioHit = this.add.zone(0, 0, 320, 36).setInteractive({ useHandCursor: true });
    audioHit.on('pointerover', () => renderAudioBtn(audio.isMuted, true));
    audioHit.on('pointerout', () => renderAudioBtn(audio.isMuted, false));
    audioHit.on('pointerdown', () => {
      const nowMuted = audio.toggleMute();
      renderAudioBtn(nowMuted, true);
      audioText.setText(nowMuted ? '🔇 ÂM THANH: ĐANG TẮT (BẤM ĐỂ BẬT)' : '🔊 ÂM THANH: ĐANG BẬT (BẤM ĐỂ TẮT)');
      audioText.setColor(nowMuted ? '#e74c3c' : '#2ecc71');
    });

    audioBtn.add([audioBg, audioText, audioHit]);

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
    const renderCloseBtn = (isHover: boolean) => {
      closeBg.clear();
      closeBg.fillStyle(isHover ? 0x2e2017 : 0x1e1610, 0.95);
      closeBg.fillRoundedRect(-90, -16, 180, 32, 6);
      closeBg.lineStyle(1.4, isHover ? 0xe5a93c : 0x6e5233, 0.9);
      closeBg.strokeRoundedRect(-90, -16, 180, 32, 6);
    };
    renderCloseBtn(false);

    const closeText = HDTextHelper.createText(this, 0, 0, '✕ ĐÓNG [ESC]', {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#f5eedc'
    }).setOrigin(0.5, 0.5);

    const closeHit = this.add.zone(0, 0, 180, 32).setInteractive({ useHandCursor: true });
    closeHit.on('pointerover', () => {
      renderCloseBtn(true);
      closeText.setColor('#fff4da');
    });
    closeHit.on('pointerout', () => {
      renderCloseBtn(false);
      closeText.setColor('#f5eedc');
    });
    closeHit.on('pointerdown', () => this.closeActiveMenuModal());

    closeBtn.add([closeBg, closeText, closeHit]);

    modal.add([overlay, overlayHit, box, title, audioBtn, infoText, closeBtn]);
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

    // HitZone đóng modal khi nhấn ra ngoài
    const overlayHit = this.add.zone(0, 0, 1280, 720).setInteractive();
    overlayHit.on('pointerdown', () => this.closeActiveMenuModal());

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
    const renderCloseBtn = (isHover: boolean) => {
      closeBg.clear();
      closeBg.fillStyle(isHover ? 0x2e2017 : 0x1e1610, 0.95);
      closeBg.fillRoundedRect(-90, -16, 180, 32, 6);
      closeBg.lineStyle(1.4, isHover ? 0xe5a93c : 0x6e5233, 0.9);
      closeBg.strokeRoundedRect(-90, -16, 180, 32, 6);
    };
    renderCloseBtn(false);

    const closeText = HDTextHelper.createText(this, 0, 0, '✕ ĐÓNG [ESC]', {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#f5eedc'
    }).setOrigin(0.5, 0.5);

    const closeHit = this.add.zone(0, 0, 180, 32).setInteractive({ useHandCursor: true });
    closeHit.on('pointerover', () => {
      renderCloseBtn(true);
      closeText.setColor('#fff4da');
    });
    closeHit.on('pointerout', () => {
      renderCloseBtn(false);
      closeText.setColor('#f5eedc');
    });
    closeHit.on('pointerdown', () => this.closeActiveMenuModal());

    closeBtn.add([closeBg, closeText, closeHit]);

    modal.add([overlay, overlayHit, box, title, contentText, closeBtn]);
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
    const toast = HDTextHelper.createText(this, 390, 500, message, {
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
      y: 476,
      duration: 2200,
      ease: 'Power2',
      onComplete: () => toast.destroy()
    });
  }
}
