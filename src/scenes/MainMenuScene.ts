/**
 * HOLLOW WOODS V1.5 — BƯỚC V15-22
 * ĐẠI TU TOÀN DIỆN MÀN HÌNH MENU CHÍNH (MAIN MENU SCENE)
 * 
 * Chuẩn HD 1280×720:
 * 1. Animated Diorama Background:
 *    - 3 lớp chiều sâu rừng đêm sương mù chuyển động chậm:
 *      + Hậu cảnh xa: Bóng Tháp Chuông Cổ ẩn hiện mờ ảo sừng sững trong sương đêm.
 *      + Trung cảnh: Rặng thông sương mù phân tầng với sắc xanh đen sương lạnh trôi ngược chiều.
 *      + Tiền cảnh: Dải sương là là mặt đất lướt ngang qua chân đế.
 *    - Góc phải màn hình: Tiểu cảnh sinh tồn hoàn chỉnh gồm Bếp Lửa Trại 3 tầng bập bùng với quầng sáng tỏa mịn ấm áp
 *      (smooth multi-stop radial gradient không vòng tròn cắt cứng), bóng đổ tiếp xúc thực tế,
 *      và Nhân vật chính (The Mossbound Wayfarer) đứng vững chãi trên nền đất rêu, triệt tiêu 100% lỗi bay lơ lửng.
 * 2. Cụm Tiêu Đề & Hệ Thống Nút Bấm Sang Trọng:
 *    - Cụm Logo "HOLLOW WOODS": Kiểu chữ serif cổ điển uy nghiêm tông vàng đồng pha cam lửa trầm, đổ bóng sâu sắc nét,
 *      kèm dòng phụ đề "DỊ CẢNH RỪNG SƯƠNG — THE FOG THAT REMEMBERS" cân đối.
 *    - 4 Nút điều hướng chuẩn mực: Bước Vào Màn Sương, Tiếp Tục Hành Trình, Cài Đặt Trò Chơi, Biên Niên Sử & Hướng Dẫn.
 *      + Thẻ gỗ tối khắc viền đồng cổ đồng nhất (rộng 460px thoáng đãng, hiển thị bản lưu 2 dòng không tràn viền).
 *      + Hiệu ứng Hover & Click: Viền đồng sáng rực hổ phách, xuất hiện mũi tên cổ ngữ hai bên và phát âm thanh gõ gỗ trầm êm tai.
 */

import * as Phaser from 'phaser';
import {
  SCENE_MAIN_MENU,
  SCENE_GAME,
  SPRITE_FOG_SMOOTH,
  SPRITE_TREE_OAK_1,
  SPRITE_TREE_DEAD,
  SPRITE_BELL_TOWER_GRAND_V15,
  SPRITE_BELL_TOWER,
  SPRITE_TREE_MIST_PINE_V15,
  SPRITE_CAMPFIRE_TIER2_V15,
  SPRITE_CAMPFIRE_TIER1_V15,
  SPRITE_DECAL_WILD_GRASS_V15,
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
  private campfireEmbers: Phaser.GameObjects.Arc[] = [];

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
    // 1. ANIMATED DIORAMA BACKGROUND: 3 LỚP CHIỀU SÂU RỪNG ĐÊM SƯƠNG MÙ
    // =========================================================================

    // Nền trời đêm rừng sương thẫm có chiều sâu điện ảnh (#0b0e14)
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x05080c, 0x05080c, 0x0c131a, 0x080e12, 1);
    bg.fillRect(0, 0, 1280, 720);

    // --- LỚP 1: HẬU CẢNH XA (DEEP BACKGROUND) ---
    // Bóng Tháp Chuông Cổ ẩn hiện xa xa phía sau (Ancient Bell Tower silhouette)
    const bellTowerKey = this.textures.exists(SPRITE_BELL_TOWER_GRAND_V15)
      ? SPRITE_BELL_TOWER_GRAND_V15
      : (this.textures.exists(SPRITE_BELL_TOWER) ? SPRITE_BELL_TOWER : null);

    if (bellTowerKey) {
      const distantTower = this.add.image(680, 360, bellTowerKey);
      distantTower.setOrigin(0.5, 1.0);
      distantTower.setScale(0.72);
      distantTower.setTint(0x080f14);
      distantTower.setAlpha(0.24);

      // Tháp chuông mờ ảo với ánh trăng lạnh, sương mù trôi qua lấp ló
      this.tweens.add({
        targets: distantTower,
        alpha: 0.32,
        duration: 9000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Tầng sương mù hậu cảnh trôi cực chậm sang phải
    if (this.textures.exists(SPRITE_FOG_SMOOTH)) {
      const fogBack = this.add.tileSprite(0, 240, 1280, 480, SPRITE_FOG_SMOOTH);
      fogBack.setOrigin(0, 0);
      fogBack.setAlpha(0.14);
      this.tweens.add({
        targets: fogBack,
        tilePositionX: 512,
        duration: 48000,
        repeat: -1,
        ease: 'Linear'
      });
    }

    // --- LỚP 2: TRUNG CẢNH (MIDGROUND) ---
    // Rặng thông sương mù phân tầng với sắc xanh đen sương lạnh
    const pineKey = this.textures.exists(SPRITE_TREE_MIST_PINE_V15)
      ? SPRITE_TREE_MIST_PINE_V15
      : (this.textures.exists(SPRITE_TREE_OAK_1) ? SPRITE_TREE_OAK_1 : null);

    if (pineKey) {
      // Rặng thông bên trái phía sau tiêu đề
      const treeBackLeft = this.add.image(80, 390, pineKey);
      treeBackLeft.setScale(1.45).setTint(0x091118).setAlpha(0.42);

      const treeLeft = this.add.image(160, 430, pineKey);
      treeLeft.setScale(1.85).setTint(0x0c151f).setAlpha(0.52);

      // Rặng thông trung cảnh phía sau khu trại bên phải
      const treeCampBack = this.add.image(1110, 430, pineKey);
      treeCampBack.setScale(1.65).setTint(0x0d141b).setAlpha(0.44);
    }

    if (this.textures.exists(SPRITE_TREE_DEAD)) {
      // Cây khô gai góc tiền trung cảnh bên phải
      const treeRight = this.add.image(1190, 400, SPRITE_TREE_DEAD);
      treeRight.setScale(2.15).setTint(0x0f1720).setAlpha(0.46);
    }

    // Tầng sương mù trung cảnh trôi chậm ngược chiều sang trái
    if (this.textures.exists(SPRITE_FOG_SMOOTH)) {
      const fogMid = this.add.tileSprite(0, 360, 1280, 360, SPRITE_FOG_SMOOTH);
      fogMid.setOrigin(0, 0);
      fogMid.setAlpha(0.18);
      this.tweens.add({
        targets: fogMid,
        tilePositionX: -512,
        duration: 32000,
        repeat: -1,
        ease: 'Linear'
      });
    }

    // --- LỚP 3: TIỀN CẢNH (FOREGROUND) ---
    // Dải sương là là mặt đất ở tiền cảnh (low-lying rolling mist)
    if (this.textures.exists(SPRITE_FOG_SMOOTH)) {
      const fogFront = this.add.tileSprite(0, 490, 1280, 230, SPRITE_FOG_SMOOTH);
      fogFront.setOrigin(0, 0);
      fogFront.setAlpha(0.24);
      this.tweens.add({
        targets: fogFront,
        tilePositionX: 384,
        duration: 22000,
        repeat: -1,
        ease: 'Linear'
      });
    }

    // Đom đóm & tàn lửa hổ phách bay lượn trong không gian
    this.createAmbientEmbers();

    // =========================================================================
    // 2. GÓC PHẢI MÀN HÌNH: TIỂU CẢNH SINH TỒN HOÀN CHỈNH (CAMP DIORAMA)
    // =========================================================================
    this.createSurvivalCampDiorama();

    // =========================================================================
    // 3. CỘT TRÁI (TÂM X = 390): CỤM TIÊU ĐỀ LOGO VÀ HỆ THỐNG NÚT BẤM SANG TRỌNG
    // =========================================================================
    const menuCenterX = 390;

    // Cụm Logo "HOLLOW WOODS": Kiểu chữ serif cổ điển uy nghiêm tông vàng đồng pha cam lửa trầm
    // Đổ bóng sâu sắc nét phía sau
    HDTextHelper.createText(this, menuCenterX + 3, 102, 'HOLLOW WOODS', {
      fontFamily: 'Cinzel, Georgia, "Times New Roman", serif',
      fontSize: '54px',
      fontStyle: 'bold',
      color: '#060402'
    }).setOrigin(0.5, 0.5).setAlpha(0.85);

    // Chữ chính tông vàng đồng pha cam lửa trầm rực sáng
    HDTextHelper.createText(this, menuCenterX, 98, 'HOLLOW WOODS', {
      fontFamily: 'Cinzel, Georgia, "Times New Roman", serif',
      fontSize: '54px',
      fontStyle: 'bold',
      color: '#e5a93c',
      stroke: '#1a0f07',
      strokeThickness: 6
    }).setOrigin(0.5, 0.5);

    // Dòng phụ đề cân đối sắc kem sương ấm
    HDTextHelper.createText(this, menuCenterX, 150, 'DỊ CẢNH RỪNG SƯƠNG — THE FOG THAT REMEMBERS', {
      fontFamily: 'Cinzel, Georgia, "Times New Roman", serif',
      fontSize: '14.5px',
      fontStyle: 'bold',
      color: '#f5ebd7',
      stroke: '#0e0905',
      strokeThickness: 2.5
    }).setOrigin(0.5, 0.5);

    // Tagline trích dẫn kinh điển sắc màu giấy da cũ
    HDTextHelper.createText(this, menuCenterX, 180, '“Sương mù đưa anh đến đây. Khu rừng đã ghi nhớ anh từ trước.”', {
      fontSize: '12px',
      fontStyle: 'italic',
      color: '#a89c8b'
    }).setOrigin(0.5, 0.5);

    // Đường chỉ hoa văn cổ điển ngăn cách tiêu đề và danh sách nút (Bronze Ornament Divider)
    const divider = this.add.graphics();
    divider.lineStyle(1.5, 0x6e5233, 0.7);
    divider.lineBetween(menuCenterX - 190, 204, menuCenterX + 190, 204);
    divider.lineStyle(1, 0xb89058, 0.4);
    divider.lineBetween(menuCenterX - 110, 204, menuCenterX + 110, 204);

    // Viên ngọc hổ phách hình thoi chính giữa đường kẻ
    const diamond = this.add.graphics();
    diamond.fillStyle(0xe5a93c, 0.95);
    diamond.beginPath();
    diamond.moveTo(menuCenterX, 200);
    diamond.lineTo(menuCenterX + 4, 204);
    diamond.lineTo(menuCenterX, 208);
    diamond.lineTo(menuCenterX - 4, 204);
    diamond.closePath();
    diamond.fillPath();

    // =========================================================================
    // 4. HỆ THỐNG 4 NÚT ĐIỀU HƯỚNG SANG TRỌNG DẠNG THẺ GỖ KHẮC VIỀN ĐỒNG
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

    // Nút 2: TIẾP TỤC HÀNH TRÌNH (Continue Game - 2 dòng thông tin gọn gàng không tràn viền)
    if (hasSaveGame && saveSummary) {
      const checkpointDesc = saveSummary.checkpoint || 'Hồi 0 • Cổng Làng Bellhollow • Ngày 1';
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
        duration: 1300,
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

    // Nút 4: BIÊN NIÊN SỬ & HƯỚNG DẪN (Chronicle / Lore & Controls Guide)
    this.createMenuButton(
      menuCenterX,
      currentY,
      '📜 BIÊN NIÊN SỬ & HƯỚNG DẪN',
      null,
      '#b8860b',
      true,
      () => this.showChronicleAndGuideModal()
    );

    // =========================================================================
    // 5. BẢNG HƯỚNG DẪN ĐIỀU KHIỂN TINH TẾ Ở ĐÁY MÀN HÌNH
    // =========================================================================
    const guideBox = this.add.graphics();
    guideBox.fillStyle(0x100c08, 0.92);
    guideBox.fillRoundedRect(180, 576, 920, 84, 8);
    guideBox.lineStyle(1.5, 0x5c4627, 0.85);
    guideBox.strokeRoundedRect(180, 576, 920, 84, 8);
    guideBox.lineStyle(1, 0x8a6d3b, 0.35);
    guideBox.strokeRoundedRect(182, 578, 916, 80, 6);

    HDTextHelper.createText(
      this,
      640,
      592,
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
      '[Q]: Ném Mồi Tiếng Động   |   [C / I]: Bàn Chế Tạo   |   [J]: Sổ Tay   |   [M]: Bật / Tắt Âm Thanh   |   [ESC]: Tạm Dừng & Lưu Game   |   [F9]: Hitbox Debug',
      {
        fontSize: '11.5px',
        color: '#aba08f',
        align: 'center',
        lineSpacing: 5
      }
    ).setOrigin(0.5, 0.5);

    // Phiên bản V1.5 hiển thị ở góc dưới phải
    HDTextHelper.createText(
      this,
      1265,
      706,
      'V1.5.0 (Visual & Gameplay Overhaul) | Phaser 4 + TypeScript | 1280×720 HD',
      {
        fontSize: '11px',
        color: '#6e5e4d'
      }
    ).setOrigin(1, 1);

    // =========================================================================
    // 6. LẮNG NGHE PHÍM TẮT & ÂM THANH NỀN
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

    // Mở khóa âm thanh khi tương tác
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
  }

  /**
   * Dựng tiểu cảnh sinh tồn hoàn chỉnh ở góc phải màn hình:
   * Bếp lửa trại bập bùng, quầng sáng tỏa mịn ấm áp không vòng tròn cứng,
   * nền đất rêu có bóng đổ thật, nhân vật chính đứng vững chãi không bay lơ lửng.
   */
  private createSurvivalCampDiorama(): void {
    const showcaseCenterX = 890;
    const groundY = 485;
    const fireX = showcaseCenterX - 60; // 830
    const heroX = showcaseCenterX + 50; // 940

    // 1. Nền đất rêu tối dưới chân tiểu cảnh
    const soilGround = this.add.graphics();
    // Đất ẩm sâu
    soilGround.fillStyle(0x06090c, 0.68);
    soilGround.fillEllipse(showcaseCenterX, groundY + 4, 300, 44);
    // Vạt đất rêu xanh sẫm
    soilGround.fillStyle(0x0f1813, 0.48);
    soilGround.fillEllipse(showcaseCenterX, groundY + 2, 240, 30);
    soilGround.fillStyle(0x16241c, 0.35);
    soilGround.fillEllipse(showcaseCenterX, groundY, 170, 20);

    // Điểm xuyết khóm cỏ dại nhỏ hai bên rìa nền đất nếu có
    if (this.textures.exists(SPRITE_DECAL_WILD_GRASS_V15)) {
      const grassLeft = this.add.image(showcaseCenterX - 110, groundY - 2, SPRITE_DECAL_WILD_GRASS_V15);
      grassLeft.setScale(0.85).setAlpha(0.55).setTint(0x405540);
      const grassRight = this.add.image(showcaseCenterX + 120, groundY - 1, SPRITE_DECAL_WILD_GRASS_V15);
      grassRight.setScale(0.85).setAlpha(0.55).setTint(0x405540);
    }

    // 2. Bóng đổ thật chạm đất (Realistic Contact Shadows)
    const shadow = this.add.graphics();
    // Bóng đổ dưới chân bếp lửa trại
    shadow.fillStyle(0x030507, 0.78);
    shadow.fillEllipse(fireX, groundY + 1, 74, 18);
    // Bóng đổ elip mềm mại khít dưới bàn chân nhân vật
    shadow.fillStyle(0x030507, 0.85);
    shadow.fillEllipse(heroX, groundY, 78, 18);

    // 3. Quầng sáng lửa trại tỏa tròn mịn màng ấm áp (Smooth Multi-stop Radial Gradient)
    // Loại bỏ triệt để các vòng tròn đồng tâm cắt cứng
    const glowKey = 'menu_campfire_glow_smooth_v15';
    if (!this.textures.exists(glowKey)) {
      const glowCanvas = this.textures.createCanvas(glowKey, 440, 440);
      if (glowCanvas) {
        const ctx = glowCanvas.getContext();
        const radGrad = ctx.createRadialGradient(220, 220, 0, 220, 220, 220);
        radGrad.addColorStop(0.00, 'rgba(255, 246, 205, 0.58)'); // Tâm sáng vàng chanh ấm
        radGrad.addColorStop(0.14, 'rgba(255, 185, 45, 0.40)');  // Quầng hổ phách rực rỡ
        radGrad.addColorStop(0.30, 'rgba(230, 115, 20, 0.22)');  // Sắc cam lửa rừng
        radGrad.addColorStop(0.50, 'rgba(155, 55, 10, 0.10)');   // Khói ấm lan tỏa êm ái
        radGrad.addColorStop(0.72, 'rgba(75, 25, 5, 0.035)');    // Viền chuyển tiếp mờ dần
        radGrad.addColorStop(1.00, 'rgba(0, 0, 0, 0)');          // Trong suốt hoàn toàn
        ctx.fillStyle = radGrad;
        ctx.fillRect(0, 0, 440, 440);
        glowCanvas.refresh();
      }
    }

    const campfireGlow = this.add.image(fireX, groundY - 32, glowKey);
    campfireGlow.setOrigin(0.5, 0.5);
    campfireGlow.setAlpha(0.92);

    // Hiệu ứng ánh lửa bập bùng thở nhẹ nhàng, êm ái
    this.tweens.add({
      targets: campfireGlow,
      alpha: 0.78,
      scaleX: 1.07,
      scaleY: 1.07,
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 4. Bếp Lửa Trại (Campfire): Đồ họa chi tiết vòng đá, củi khô và ngọn lửa bập bùng
    const campfireSpriteKey = this.textures.exists(SPRITE_CAMPFIRE_TIER2_V15)
      ? SPRITE_CAMPFIRE_TIER2_V15
      : (this.textures.exists(SPRITE_CAMPFIRE_TIER1_V15) ? SPRITE_CAMPFIRE_TIER1_V15 : null);

    if (campfireSpriteKey) {
      const campImg = this.add.image(fireX, groundY + 2, campfireSpriteKey);
      campImg.setOrigin(0.5, 0.88);
      campImg.setScale(1.4);

      // Hiệu ứng bập bùng nhẹ của sprite lửa trại
      this.tweens.add({
        targets: campImg,
        scaleY: 1.45,
        alpha: 0.95,
        duration: 220,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    } else {
      // Procedural Campfire chi tiết nếu thiếu sprite
      const fireGfx = this.add.graphics();
      // Vòng đá cuội xám rêu phong
      fireGfx.fillStyle(0x353d38, 1);
      fireGfx.fillCircle(fireX - 16, groundY - 2, 7);
      fireGfx.fillCircle(fireX + 16, groundY - 2, 7);
      fireGfx.fillCircle(fireX - 10, groundY + 3, 6);
      fireGfx.fillCircle(fireX + 10, groundY + 3, 6);
      fireGfx.fillCircle(fireX, groundY + 4, 6);

      // Thanh củi sồi bắt chéo
      fireGfx.fillStyle(0x2d1a0e, 1);
      fireGfx.fillRect(fireX - 14, groundY - 4, 28, 5);
      fireGfx.fillRect(fireX - 10, groundY - 8, 20, 5);
    }

    // Ngọn lửa 3 tầng bập bùng sống động
    const flameCore = this.add.graphics();
    flameCore.fillStyle(0xd35400, 0.9);
    flameCore.fillTriangle(fireX - 10, groundY - 4, fireX + 10, groundY - 4, fireX, groundY - 28);
    flameCore.fillStyle(0xf39c12, 0.95);
    flameCore.fillTriangle(fireX - 7, groundY - 5, fireX + 7, groundY - 5, fireX, groundY - 24);
    flameCore.fillStyle(0xfff176, 0.98);
    flameCore.fillTriangle(fireX - 4, groundY - 5, fireX + 4, groundY - 5, fireX, groundY - 18);

    this.tweens.add({
      targets: flameCore,
      scaleY: 1.15,
      scaleX: 0.95,
      alpha: 0.88,
      duration: 180,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Các hạt tàn lửa bay lên từ bếp lửa trại (Campfire Embers)
    this.createCampfireEmbers(fireX, groundY - 16);

    // 5. Nhân vật chính (The Mossbound Wayfarer)
    // Đặt origin đúng chuẩn WAYFARER_ORIGIN_X (0.5) và WAYFARER_ORIGIN_Y (0.90625)
    // để bàn chân chạm trực tiếp lên tâm bóng đổ elip trên mặt đất
    const heroTexture = this.textures.exists(WAYFARER_IDLE_KEY) ? WAYFARER_IDLE_KEY : SATYR_SHEET_KEY;
    if (this.textures.exists(heroTexture)) {
      const hero = this.add.sprite(heroX, groundY, heroTexture, 0);
      hero.setScale(2.55);
      hero.setOrigin(WAYFARER_ORIGIN_X, WAYFARER_ORIGIN_Y);

      if (this.anims.exists('wayfarer_idle_down')) {
        hero.play('wayfarer_idle_down');
      } else {
        this.tweens.add({
          targets: hero,
          scaleY: 2.58,
          duration: 1500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    }

    // Nhãn danh xưng nhân vật và bối cảnh sinh tồn phía dưới chân
    HDTextHelper.createText(this, showcaseCenterX, groundY + 34, '✦ LỮ KHÁCH VÙNG ĐẦM RÊU ✦', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#d4af37',
      stroke: '#0d0905',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);

    HDTextHelper.createText(this, showcaseCenterX, groundY + 52, 'The Mossbound Wayfarer • Bên Ngọn Lửa Trại Bellhollow', {
      fontSize: '10.5px',
      fontStyle: 'italic',
      color: '#8a7d6d'
    }).setOrigin(0.5, 0.5);
  }

  /**
   * Tạo tàn lửa bốc lên trực tiếp từ ngọn lửa trại
   */
  private createCampfireEmbers(sourceX: number, sourceY: number): void {
    const emberColors = [0xfff176, 0xf39c12, 0xe67e22, 0xd35400];
    const emberCount = 12;

    for (let i = 0; i < emberCount; i++) {
      const ember = this.add.circle(sourceX, sourceY, Phaser.Math.FloatBetween(1.0, 2.2), Phaser.Utils.Array.GetRandom(emberColors));
      ember.setAlpha(0);
      this.campfireEmbers.push(ember);

      const emitEmber = () => {
        const startX = sourceX + Phaser.Math.Between(-8, 8);
        const startY = sourceY + Phaser.Math.Between(-4, 4);
        ember.setPosition(startX, startY);
        ember.setAlpha(Phaser.Math.FloatBetween(0.6, 1.0));

        const targetY = startY - Phaser.Math.Between(55, 120);
        const driftX = startX + Phaser.Math.Between(-16, 24);
        const duration = Phaser.Math.Between(1200, 2400);

        this.tweens.add({
          targets: ember,
          x: driftX,
          y: targetY,
          alpha: 0,
          scale: 0.4,
          duration,
          ease: 'Power1',
          onComplete: () => {
            this.time.delayedCall(Phaser.Math.Between(200, 1000), emitEmber);
          }
        });
      };

      this.time.delayedCall(i * 180, emitEmber);
    }
  }

  /**
   * Tạo đàn đom đóm và tàn lửa hổ phách bập bùng lượn bay tự nhiên trong rừng sương
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
   * Dựng nút Menu chuẩn phong cách thẻ gỗ khắc viền đồng cổ đồng nhất (chiều rộng 460px thoáng đãng)
   * Hiệu ứng Hover & Click: Viền đồng sáng sắc hổ phách, xuất hiện mũi tên cổ ngữ hai bên và phát âm thanh gõ gỗ trầm êm tai.
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
    const btnH = hasSub ? 54 : 46;

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
        // Trạng thái khi di chuột: Gỗ sồi ấm viền đồng sáng sắc hổ phách rực rỡ
        bg.fillStyle(0x24180e, 0.98);
        bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
        // Viền đồng sáng hổ phách nổi bật
        bg.lineStyle(2.0, 0xe5a93c, 1.0);
        bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
        // Đường chỉ viền bên trong ấm áp
        bg.lineStyle(1, 0xf1c40f, 0.5);
        bg.strokeRoundedRect(-btnW / 2 + 2, -btnH / 2 + 2, btnW - 4, btnH - 4, 4);

        // 4 đinh tán đồng phát sáng vàng hổ phách
        bg.fillStyle(0xf1c40f, 0.95);
        bg.fillRect(-btnW / 2 + 3, -btnH / 2 + 3, 3, 3);
        bg.fillRect(btnW / 2 - 6, -btnH / 2 + 3, 3, 3);
        bg.fillRect(-btnW / 2 + 3, btnH / 2 - 6, 3, 3);
        bg.fillRect(btnW / 2 - 6, btnH / 2 - 6, 3, 3);
      } else {
        // Trạng thái bình thường: Gỗ tối viền đồng xỉn mộc mạc
        bg.fillStyle(0x140e09, 0.92);
        bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
        // Viền đồng cổ
        bg.lineStyle(1.6, 0x6e5233, 0.88);
        bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 6);
        // Đường bóng kim loại bên trong
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

    // Mũi tên cổ ngữ nhỏ hai bên (Rune Arrows - ẩn ở trạng thái thường, xuất hiện rực sáng khi hover)
    const txtRuneLeft = HDTextHelper.createText(this, -btnW / 2 + 22, mainY, '᛫ ᚱ ‹', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#f1c40f',
      stroke: '#0e0905',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5).setAlpha(0);

    const txtRuneRight = HDTextHelper.createText(this, btnW / 2 - 22, mainY, '› ᚱ ᛫', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#f1c40f',
      stroke: '#0e0905',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5).setAlpha(0);

    btn.add([bg, txtMain, txtRuneLeft, txtRuneRight]);

    // Dòng chữ phụ (thông tin bản lưu 2 dòng rõ ràng, không bao giờ tràn viền)
    let txtSub: Phaser.GameObjects.Text | undefined;
    if (hasSub && subText) {
      txtSub = HDTextHelper.createText(this, 0, 12, subText, {
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

        // Mũi tên cổ ngữ xuất hiện rực sáng và trượt nhẹ vào trong
        txtRuneLeft.setAlpha(1.0);
        txtRuneRight.setAlpha(1.0);
        this.tweens.add({
          targets: [txtRuneLeft, txtRuneRight],
          alpha: 1.0,
          duration: 120,
          ease: 'Quad.easeOut'
        });

        this.tweens.add({
          targets: btn,
          scaleX: 1.025,
          scaleY: 1.025,
          duration: 100,
          ease: 'Quad.easeOut'
        });

        // Phát âm thanh gõ gỗ trầm êm tai khi di chuột vào thẻ gỗ
        AudioManager.getInstance().playWoodTap(0.45);
      });

      hitZone.on('pointerout', () => {
        renderButtonState(false);
        txtMain.setColor(defaultColor);
        if (txtSub) txtSub.setColor('#baa892');

        txtRuneLeft.setAlpha(0);
        txtRuneRight.setAlpha(0);

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
          scaleX: 1.025,
          scaleY: 1.025,
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
   * Hộp thoại Cài Đặt (Settings Modal)
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
   * Hộp thoại Biên Niên Sử & Hướng Dẫn (Chronicle, Lore & Controls Guide Modal)
   */
  private showChronicleAndGuideModal(): void {
    this.closeActiveMenuModal();

    const modal = this.add.container(640, 360).setDepth(9000);
    const modalW = 660;
    const modalH = 460;

    // Lớp phủ mờ nền
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.68);
    overlay.fillRect(-640, -360, 1280, 720);

    // HitZone đóng modal khi nhấn ra ngoài
    const overlayHit = this.add.zone(0, 0, 1280, 720).setInteractive();
    overlayHit.on('pointerdown', () => this.closeActiveMenuModal());

    // Khung hộp thoại gỗ tối viền đồng xỉn
    const box = this.add.graphics();
    box.fillStyle(0x120d09, 0.96);
    box.fillRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 10);
    box.lineStyle(1.8, 0x8a6d3b, 0.9);
    box.strokeRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 10);
    box.lineStyle(1, 0x5c4627, 0.5);
    box.strokeRoundedRect(-modalW / 2 + 3, -modalH / 2 + 3, modalW - 6, modalH - 6, 8);

    const title = HDTextHelper.createText(this, 0, -modalH / 2 + 34, '📜 BIÊN NIÊN SỬ & HƯỚNG DẪN', {
      fontFamily: 'Cinzel, Georgia, "Times New Roman", serif',
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
      'HOLLOW WOODS: DỊ CẢNH RỪNG SƯƠNG (THE FOG THAT REMEMBERS)\n\n' +
      'Ngươi tỉnh giấc nơi rìa làng cổ Bellhollow — một thánh địa hoang phế bị giam hãm trong Màn Sương Ký Ức.\n' +
      'Đại Hồng Chung bị nứt đôi khiến mạch rễ tha hóa trỗi dậy, giam cầm thung lũng trong vòng lặp thời gian vĩnh cửu.\n\n' +
      '• ĐÈN LỒNG HỔ PHÁCH [F]: Nguồn sáng thiêng liêng duy nhất duy trì Bình Tâm và xua đuổi Màn Sương.\n' +
      '• KẺ LẮNG NGHE (THE LISTENER): Quái vật mù lòa săn mồi bằng âm thanh — hãy đi khẽ hoặc ném mồi [Q].\n' +
      '• LỬA TRẠI SANCTUARY: Điểm dừng chân phục hồi Bình Tâm, hồi phục thể lực và liên kết với linh hồn kỵ sĩ.\n' +
      '• 3 KẾT THÚC CỐT TRUYỆN: Tùy thuộc vào mức độ thức tỉnh thân phận Hiệp Sĩ Đen và sự gắn kết với dân làng.\n\n' +
      '──────────────────────────────────────────────────────────\n' +
      '• Phím điều khiển: [WASD] Di chuyển  |  [Shift] Chạy  |  [E] Tương tác  |  [I/C] Chế Tạo  |  [J] Sổ Tay\n' +
      '• Engine: Phaser 4 + TypeScript | Độ phân giải chuẩn HD 1280×720 | Phiên bản V1.5.0',
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
