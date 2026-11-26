/**
 * HOLLOW WOODS V1.5 - STEP V15-20
 * MULTIPLE BRANCHING ENDINGS SYSTEM & HD SCREEN-SPACE FINALE PRESENTATION
 * 
 * Thiết lập hệ thống 3 Kết Thúc Cốt Truyện phân nhánh theo hành trình của người chơi:
 *   1. KẾT THÚC I — BÌNH MINH CỦA TIẾNG CHUÔNG (TRUE ENDING):
 *      - Điều kiện: memoryAwakeningStage >= 3 VÀ villageTrustScore >= 65
 *      - Nội dung: Đại Hồng Chung ngân vang phá tan màn sương vĩnh cửu, ánh bình minh trở lại
 *   2. KẾT THÚC II — NGƯỜI CANH GÁC VĨNH HẰNG (BITTERSWEET SACRIFICE ENDING):
 *      - Điều kiện: memoryAwakeningStage >= 2 VÀ villageTrustScore < 65
 *      - Nội dung: Hiệp Sĩ Đen dùng thân xác và ngọn đèn phong ấn Mạch Rễ từ bên trong
 *   3. KẾT THÚC III — VÒNG LẶP CỦA SƯƠNG MÙ (FOG LOOP ENDING):
 *      - Điều kiện: memoryAwakeningStage < 2
 *      - Nội dung: Nghi thức vội vã, chuông rạn nứt, sương lạnh cuộn trào trở lại
 * 
 * Đảm bảo hiển thị chuẩn HD 1280×720 tại UIScene (Zoom 1.0, Depth 20000),
 * có khung tranh Pixel Art minh họa, văn tự sự cuốn hút, Bảng Thống Kê Hành Trình Sinh Tồn
 * và tự động mở khóa các mảnh Lore tương ứng vào Sổ Tay [J].
 */

import { DeveloperModeManager } from '../debug/DeveloperModeManager';
import * as Phaser from 'phaser';
import { SCENE_MAIN_MENU } from '../config/Constants';
import { PlayerState } from '../state/PlayerState';
import { AudioManager } from '../audio/AudioManager';
import { HDTextHelper } from '../utils/HDTextHelper';
import { SaveManager } from './SaveManager';
import { SettingsManager } from './SettingsManager';
import { getEndingDisplayLines } from './IdentityRevealResolver';
import loreData from '../data/lore.json';

export type EndingType = 'true_ending' | 'sacrifice_ending' | 'fog_loop_ending';

export interface EndingConfig {
  type: EndingType;
  badgeTag: string;
  title: string;
  subtitle: string;
  loreId: string;
  storyFlag: string;
  accentColorHex: string;
  accentColorNum: number;
  bgGradientTop: number;
  bgGradientBottom: number;
  borderTint: number;
  narrativeLines: string[];
}

export class EndingSystem {
  private scene: Phaser.Scene;
  private uiScene?: Phaser.Scene;
  private playerState: PlayerState;
  public isEndingActive: boolean = false;
  public currentEndingType: EndingType = 'fog_loop_ending';

  private endingContainer!: Phaser.GameObjects.Container;
  private timeRiftGraphics!: Phaser.GameObjects.Graphics;
  private endingTextContainer!: Phaser.GameObjects.Container;
  private returnBtn?: Phaser.GameObjects.Text;
  private newJourneyBtn?: Phaser.GameObjects.Text;
  private returnHint?: Phaser.GameObjects.Text;
  private onCompleteCallback?: () => void;

  // Định nghĩa cấu hình 3 kết thúc cốt truyện V1.5 & V15-59
  public static readonly ENDING_CONFIGS: Record<EndingType, EndingConfig> = {
    true_ending: {
      type: 'true_ending',
      badgeTag: '❖ KẾT THÚC ÁNH SÁNG: TIẾNG CHUÔNG THANH TẨY (BÌNH MINH CỦA TIẾNG CHUÔNG) ❖',
      title: 'TIẾNG CHUÔNG THANH TẨY — Lời Nguyền Bellhollow Hóa Giải',
      subtitle: 'Đại Hồng Chung ngân vang — Màn sương vĩnh cửu sụp đổ — Bellhollow hồi sinh',
      loreId: 'lore_ending_true',
      storyFlag: 'ending_true_achieved',
      accentColorHex: '#f39c12',
      accentColorNum: 0xf39c12,
      bgGradientTop: 0x1b263b,
      bgGradientBottom: 0x090d14,
      borderTint: 0xf39c12,
      narrativeLines: [
        'Hồi chuông thứ bảy ngân vang, chấn động tầng mây u ám đã giam cầm thung lũng suốt bao mùa sương lạnh.',
        'Nhờ sự thức tỉnh trọn vẹn của Meliodas Blackwood — The Wolf Lord và niềm tin tuyệt đối từ dân làng Bellhollow, Mạch Rễ cổ đã được thanh tẩy.',
        'Những tia nắng ban mai đầu tiên sưởi ấm vùng đất rêu phong. Ngôi làng mở rộng cổng đón ánh sáng mới.',
        'Vị hiệp sĩ không rời đi. Ông tháo giáp trụ, ở lại bên đống lửa ấm, trở thành người bảo hộ cho sự sống nơi đây.'
      ]
    },
    sacrifice_ending: {
      type: 'sacrifice_ending',
      badgeTag: '❖ KẾT THÚC U ÁM: DƯ ÂM TRONG SƯƠNG (NGƯỜI CANH GÁC VĨNH HẰNG) ❖',
      title: 'DƯ ÂM TRONG SƯƠNG — Hiệp Sĩ Ở Lại Canh Giữ Rừng Sâu',
      subtitle: 'Linh hồn hiến dâng — Mạch Rễ hóa thạch — Người bảo hộ cô độc nơi rừng sâu',
      loreId: 'lore_ending_sacrifice',
      storyFlag: 'ending_sacrifice_achieved',
      accentColorHex: '#e67e22',
      accentColorNum: 0xe67e22,
      bgGradientTop: 0x0c1a29,
      bgGradientBottom: 0x060c14,
      borderTint: 0x3498db,
      narrativeLines: [
        'Meliodas Blackwood đã nhớ lại cội nguồn và lời thề năm xưa, nhưng khoảng cách vô hình với dân làng khiến lời nguyền không thể hóa giải trọn vẹn.',
        'Để bảo vệ Bellhollow khỏi sự diệt vong, người lữ khách một mình tiến vào tâm chấn đại mạch ngầm, cắm gươm và thắp sáng Vòng Sáng Hộ Tâm rực cháy.',
        'Dùng chính linh hồn và thân xác làm vật tế, ông khóa chặt khe nứt The Veil từ bên trong, giữ lại bình yên cho thung lũng.',
        'Màn sương làng tan đi, người dân được cứu... Nhưng không một ai biết tên người đã lặng lẽ gánh chịu bóng tối thay cho họ.'
      ]
    },
    fog_loop_ending: {
      type: 'fog_loop_ending',
      badgeTag: '❖ KẾT THÚC U ÁM: VÒNG LẶP CỦA SƯƠNG MÙ (FOG LOOP ENDING) ❖',
      title: 'DƯ ÂM TRONG SƯƠNG — Vòng Lặp Của Sương Mù',
      subtitle: 'Nghi thức vội vã — Chuông rạn nứt — Màn sương lạnh cuộn trào trở lại',
      loreId: 'lore_ending_fog_loop',
      storyFlag: 'ending_fog_loop_achieved',
      accentColorHex: '#9b59b6',
      accentColorNum: 0x9b59b6,
      bgGradientTop: 0x221333,
      bgGradientBottom: 0x0a0610,
      borderTint: 0x8e44ad,
      narrativeLines: [
        'Tiếng chuông ngân lên trong vội vã khi tâm trí lữ khách vẫn còn chìm trong màn sương mờ mịt của quá khứ.',
        'Chưa kịp nhớ lại cội nguồn và gắn kết lời thề năm xưa, thanh âm đồng đúc chỉ xua tan lớp sương trên bề mặt trong giây lát.',
        'Một tiếng rạn chát chúa vang lên — vết nứt trên Đại Hồng Chung toác rộng. Sương mù tím tái cuộn trào trở lại từ vực sâu.',
        'Kẻ lữ hành lại ngã gục, mất đi ký ức vừa chớm nở... Khu rừng thở dài tái lập vòng lặp, chờ đợi một sự thức tỉnh thực sự.'
      ]
    }
  };

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

  public getNewJourneyBtn(): Phaser.GameObjects.Text | undefined {
    return this.newJourneyBtn;
  }

  public getReturnHint(): Phaser.GameObjects.Text | undefined {
    return this.returnHint;
  }

  public canReturnToMenu(): boolean {
    return this.isEndingActive && !!this.returnBtn && this.returnBtn.visible;
  }

  public canStartNewJourney(): boolean {
    return this.isEndingActive && !!this.newJourneyBtn && this.newJourneyBtn.visible;
  }

  private setupEndingUI(): void {
    const target = this.getTargetScene();

    // Container tổng cho màn kết thúc trên UIScene ở Zoom 1.0 cố định (Depth 20000)
    this.endingContainer = target.add.container(0, 0);
    this.endingContainer.setScrollFactor(0);
    this.endingContainer.setDepth(20000);
    this.endingContainer.setVisible(false);

    // Khe nhìn xuyên thời đại (Time Rift) ở Depth 19998 cho tương thích ngược
    this.timeRiftGraphics = target.add.graphics();
    this.timeRiftGraphics.setScrollFactor(0);
    this.timeRiftGraphics.setDepth(19998);
    this.timeRiftGraphics.setVisible(false);

    this.endingTextContainer = target.add.container(0, 0);
    this.endingContainer.add(this.endingTextContainer);
  }

  /**
   * V15-59: Phân nhánh kết thúc cốt truyện dựa trên chỉ số Tinh Thần và Mảnh Ký Ức
   * - Kết Thúc Ánh Sáng: Nếu Tinh Thần >= 50 và thu thập đủ Mảnh Ký Ức (stage >= 3 & trust >= 65)
   * - Kết Thúc U Ám: Nếu Tinh Thần < 50 hoặc thiếu Mảnh Ký Ức (stage >= 2 -> sacrifice, stage < 2 -> fog loop)
   */
  public determineEndingType(): EndingType {
    const comp = this.playerState.stats.composure ?? 100;
    const stage = this.playerState.memoryAwakeningStage;
    const trust = this.playerState.villageTrustScore;

    // Kết Thúc Ánh Sáng: Tinh Thần >= 50 và thức tỉnh hoàn toàn Mảnh Ký Ức
    if (comp >= 50 && stage >= 3 && trust >= 65) {
      return 'true_ending';
    }

    // Kết Thúc U Ám: Tinh Thần < 50 hoặc thiếu Mảnh Ký Ức
    if (stage >= 2) {
      return 'sacrifice_ending';
    }

    // Vòng lặp sương mù khi ký ức chưa hoàn thiện
    return 'fog_loop_ending';
  }

  /**
   * KÍCH HOẠT HỒI KẾT: TIẾNG CHUÔNG ĐỒNG ĐẦU TIÊN & TRÌNH CHIẾU KẾT THÚC PHÂN NHÁNH
   */
  public triggerTheFirstTollFinale(onComplete?: () => void): void {
    if (this.isEndingActive) return;
    this.isEndingActive = true;
    this.onCompleteCallback = onComplete;

    // 1. Tắt toàn bộ HUD của UIScene ngay lập tức để chống chìm và chống đè hình ảnh
    if (this.uiScene && typeof (this.uiScene as any).setHUDVisible === 'function') {
      (this.uiScene as any).setHUDVisible(false);
    }

    // 2. V15-59: Tạm dừng hoàn toàn chuyển động của nhân vật, quái vật, sương mù & âm thanh dồn dập
    const gameScene = this.scene as any;
    if (gameScene.player) {
      gameScene.player.setVelocity(0, 0);
      gameScene.player.playIdle();
      if (typeof gameScene.player.resetAllInputState === 'function') {
        gameScene.player.resetAllInputState();
      }
    }
    if (gameScene.listenerMonster) {
      gameScene.listenerMonster.setVelocity(0, 0);
      if (typeof gameScene.listenerMonster.clearTarget === 'function') {
        gameScene.listenerMonster.clearTarget();
      }
    }
    if (gameScene.wildlifeSystem && typeof gameScene.wildlifeSystem.clearEntities === 'function') {
      gameScene.wildlifeSystem.clearEntities();
    }
    if (gameScene.mireWardenBoss) {
      if (typeof gameScene.mireWardenBoss.setVelocity === 'function') {
        gameScene.mireWardenBoss.setVelocity(0, 0);
      }
      if (typeof gameScene.mireWardenBoss.setActive === 'function') {
        gameScene.mireWardenBoss.setActive(false);
      }
    }
    gameScene.isBossFightActive = false;
    gameScene.isAct5ChaseActive = false;

    if (gameScene.veilSystem) {
      if (typeof gameScene.veilSystem.setMistActive === 'function') {
        gameScene.veilSystem.setMistActive(false);
      }
      if (typeof gameScene.veilSystem.resetTransitionMist === 'function') {
        gameScene.veilSystem.resetTransitionMist();
      }
    }
    if (gameScene.weatherSystem && typeof gameScene.weatherSystem.stopWeatherEffects === 'function') {
      gameScene.weatherSystem.stopWeatherEffects();
    }

    // Tắt âm thanh dồn dập (nhịp tim, thở dốc) và chuyển sang nhạc nền trang trọng, yên bình
    AudioManager.getInstance().setHeartbeatActive(false);
    AudioManager.getInstance().setSanityDucking(false);
    AudioManager.getInstance().setBossAwakeningState(false);
    AudioManager.getInstance().playBGM('bgm_knights_quiet_fire', 1.2, 0.7);

    const cam = this.scene.cameras.main;

    // 3. Phân nhánh kết thúc cốt truyện
    const endingType = this.determineEndingType();
    this.currentEndingType = endingType;
    const endingConfig = EndingSystem.ENDING_CONFIGS[endingType];

    // GIAI ĐOẠN 1: TIẾNG CHUÔNG ĐỒNG ĐẦU TIÊN (THE FIRST TOLL)
    const settings = SettingsManager.getInstance();
    const camSys = gameScene?.cameraSystem;
    if (settings.isScreenShakeEnabled()) {
      if (camSys && typeof camSys.shake === 'function') {
        camSys.shake(400, 0.015);
      } else {
        cam.shake(400, 0.015);
      }
    }
    if (settings.isScreenFlashEnabled()) {
      if (camSys && typeof camSys.flash === 'function') {
        camSys.flash(360, 180, 175, 165);
      } else {
        cam.flash(360, 180, 175, 165);
      }
      if (this.uiScene) {
        this.uiScene.cameras.main.flash(360, 180, 175, 165);
      }
    }

    // Phát âm thanh chuông tương ứng với kết thúc
    if (endingType === 'fog_loop_ending') {
      AudioManager.getInstance().playCrackedBellToll();
    } else {
      AudioManager.getInstance().playBronzeBellToll();
    }

    // Kích hoạt cờ chuông rung và hoàn thành nhiệm vụ Act 6
    this.playerState.setFlag('bell_rung');
    this.playerState.completeQuestTask('Q06_RETRIEVE_CLAPPER', 't2');
    this.playerState.setStoryFlag('game_completed');
    this.playerState.setStoryFlag(endingConfig.storyFlag);
    this.playerState.setFlag(endingConfig.storyFlag);

    // Mở khóa mảnh Lore kết thúc tương ứng vào Sổ Tay [J]
    this.playerState.unlockLore(endingConfig.loreId);

    // Lưu checkpoint hoàn tất cốt truyện an toàn (bảo toàn chuỗi test kiểm tra tự động)
    const playerX = gameScene.player ? gameScene.player.x : 840;
    const playerY = gameScene.player ? gameScene.player.y : 350;
    SaveManager.saveGame('KẾT THÚC: TIẾNG CHUÔNG ĐẦU TIÊN (HOÀN THÀNH)', 'bellhollow', playerX, playerY);

    // GIAI ĐOẠN 2 & 3: V15-59 Khắc phục triệt để lỗi màn hình đen bằng resetFX + fadeIn và Fail-safe Timer
    const target = this.getTargetScene();
    let presentationStarted = false;

    const executePresentation = () => {
      if (presentationStarted) return;
      presentationStarted = true;

      // Reset camera FX và fadeIn đảm bảo màn hình không bao giờ bị đen kẹt lại
      cam.resetFX();
      cam.fadeIn(600, 0, 0, 0);
      if (this.uiScene) {
        this.uiScene.cameras.main.resetFX();
        this.uiScene.cameras.main.fadeIn(600, 0, 0, 0);
      }

      this.playEndingPresentation(endingType);
    };

    // Camera fadeOut 600ms, khi progress = 1 thì lập tức fadeIn và bật Ending
    cam.fadeOut(600, 0, 0, 0, (_c: any, progress: number) => {
      if (progress === 1) {
        executePresentation();
      }
    });

    // Fail-safe Timer 1500ms: nếu camera fadeOut bị gián đoạn thì cưỡng bức fadeIn và hiện Ending
    target.time.delayedCall(1500, () => {
      if (!presentationStarted) {
        executePresentation();
      }
    });
  }

  /**
   * TRÌNH CHIẾU MÀN HÌNH KẾT THÚC V1.5 ĐA PHÂN NHÁNH TRANG TRỌNG
   * Bao gồm khung tranh Pixel Art minh họa, đoạn văn tự sự hào hùng và Bảng Thống Kê Hành Trình Sinh Tồn
   */
  public playEndingPresentation(endingType: EndingType): void {
    const target = this.getTargetScene();
    const config = EndingSystem.ENDING_CONFIGS[endingType];
    this.endingContainer.setVisible(true);
    this.endingTextContainer.removeAll(true);

    // V152-08: Phát sự kiện p2.gameOver khi đạt Ending cốt truyện
    try {
      if (DeveloperModeManager.getInstance().canReportProgress() && typeof window !== 'undefined' && typeof window.p2?.gameOver === 'function') {
        const day = this.playerState?.dayCount || 1;
        const comp = this.playerState?.stats?.composure || 0;
        const loreCount = this.playerState?.unlockedLore?.length || 0;
        const visitedCount = this.playerState?.visitedZones?.size || 1;
        const bonus = endingType === 'true_ending' ? 25000 : (endingType === 'sacrifice_ending' ? 15000 : 5000);
        const endingScore = day * 1000 + comp * 10 + loreCount * 250 + visitedCount * 150 + bonus;
        window.p2.gameOver({
          score: endingScore,
          level: day,
          day,
          ending: endingType
        });
        console.log(`[P2Game SDK] Đã gửi gameOver từ EndingSystem (${endingType}, Score: ${endingScore}, Level: ${day})`);
      }
    } catch (e) {
      console.warn('[P2Game SDK] Lỗi khi gọi p2.gameOver trong EndingSystem:', e);
    }

    // 1. Phông nền tối màu chuyển sắc nhẹ tạo chiều sâu điện ảnh (HD 1280×720)
    const bgGraphics = target.add.graphics();
    bgGraphics.fillStyle(config.bgGradientBottom, 1);
    bgGraphics.fillRect(0, 0, 1280, 720);

    // Quầng sáng viền huyền ảo ở đỉnh màn hình
    bgGraphics.fillStyle(config.bgGradientTop, 0.45);
    bgGraphics.fillRect(0, 0, 1280, 240);

    // Khung viền pixel mạ vàng/bạc/tím tinh tế bao quanh toàn màn hình
    bgGraphics.lineStyle(2, config.borderTint, 0.5);
    bgGraphics.strokeRect(16, 16, 1248, 688);

    this.endingTextContainer.add(bgGraphics);
    bgGraphics.setAlpha(0);

    target.tweens.add({
      targets: bgGraphics,
      alpha: 1,
      duration: 500
    });

    // 2. Banner Tiêu đề Hồi Kết (Y = 32 -> 82)
    target.time.delayedCall(200, () => {
      const badgeText = HDTextHelper.createText(target, 640, 32, config.badgeTag, {
        fontSize: '13px',
        fontStyle: 'bold',
        color: config.accentColorHex,
        align: 'center',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5, 0.5).setAlpha(0);

      const titleText = HDTextHelper.createText(target, 640, 58, config.title, {
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#ffffff',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 4
      }).setOrigin(0.5, 0.5).setAlpha(0);

      const subtitleText = HDTextHelper.createText(target, 640, 82, config.subtitle, {
        fontSize: '12px',
        fontStyle: 'italic',
        color: '#bdc3c7',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5, 0.5).setAlpha(0);

      this.endingTextContainer.add([badgeText, titleText, subtitleText]);

      target.tweens.add({
        targets: [badgeText, titleText, subtitleText],
        alpha: 1,
        duration: 500
      });
    });

    // 3. Khung tranh Pixel Art Minh Họa Đồ Họa Độc Quyền (Width: 720, Height: 155, Center: 640, Y: 100)
    target.time.delayedCall(400, () => {
      const artGraphics = target.add.graphics();
      const fx = 280;
      const fy = 100;
      const fw = 720;
      const fh = 155;

      if (endingType === 'true_ending') {
        this.drawTrueEndingIllustration(artGraphics, fx, fy, fw, fh);
      } else if (endingType === 'sacrifice_ending') {
        this.drawSacrificeEndingIllustration(artGraphics, fx, fy, fw, fh);
      } else {
        this.drawFogLoopEndingIllustration(artGraphics, fx, fy, fw, fh);
      }

      this.endingTextContainer.add(artGraphics);
      artGraphics.setAlpha(0);

      target.tweens.add({
        targets: artGraphics,
        alpha: 1,
        duration: 600
      });
    });

    // 4. Các dòng văn tự sự cảm xúc (Narrative Lines: Y = 268 -> 336, đồng bộ qua Reveal Gate)
    let textDelay = 600;
    const startY = 268;
    const stepY = 23;
    const displayLines = getEndingDisplayLines(endingType, config.narrativeLines, this.playerState);

    displayLines.forEach((line, idx) => {
      target.time.delayedCall(textDelay, () => {
        const lineObj = HDTextHelper.createText(target, 640, startY + (idx * stepY), line, {
          fontSize: '13.5px',
          fontStyle: idx === displayLines.length - 1 ? 'italic' : 'normal',
          color: idx === displayLines.length - 1 ? config.accentColorHex : '#ecf0f1',
          align: 'center',
          stroke: '#000000',
          strokeThickness: 2
        }).setOrigin(0.5, 0.5).setAlpha(0);

        this.endingTextContainer.add(lineObj);

        target.tweens.add({
          targets: lineObj,
          alpha: 1,
          duration: 400
        });
      });
      textDelay += 200;
    });

    // 5. Bảng Thống Kê Hành Trình Sinh Tồn (Survival Chronicle: Y = 360 -> 510)
    target.time.delayedCall(textDelay + 150, () => {
      this.renderSurvivalChronicle(target, config);
    });

    // 6. Nút "CHƠI HÀNH TRÌNH MỚI" & "QUAY VỀ MENU CHÍNH" chuẩn HD (Y = 580)
    target.time.delayedCall(textDelay + 350, () => {
      this.renderReturnControls(target, config);
    });
  }

  /**
   * VẼ TRANH PIXEL ART MINH HỌA KẾT THÚC I: BÌNH MINH CỦA TIẾNG CHUÔNG
   */
  private drawTrueEndingIllustration(g: Phaser.GameObjects.Graphics, fx: number, fy: number, fw: number, fh: number): void {
    // 1. Khung tranh & Nền bầu trời hừng đông vàng cam
    g.fillStyle(0x0e1726, 1);
    g.fillRect(fx, fy, fw, fh);

    // Chuyển sắc bầu trời sáng dần từ tím đêm sang rạng đông vàng kim
    g.fillStyle(0x1e3a5f, 1); g.fillRect(fx, fy, fw, 35);
    g.fillStyle(0x5c3d75, 1); g.fillRect(fx, fy + 35, fw, 35);
    g.fillStyle(0xb35434, 1); g.fillRect(fx, fy + 70, fw, 35);
    g.fillStyle(0xdf8a35, 1); g.fillRect(fx, fy + 105, fw, 30);
    g.fillStyle(0xf1c40f, 1); g.fillRect(fx, fy + 135, fw, 20);

    // Mặt trời ban mai tỏa rạng từ chân trời
    g.fillStyle(0xfff9c4, 0.9);
    g.fillCircle(fx + 150, fy + 120, 26);
    g.fillStyle(0xffecb3, 0.4);
    g.fillCircle(fx + 150, fy + 120, 48);

    // Tia nắng ban mai rọi chéo qua thung lũng
    g.fillStyle(0xfff9c4, 0.12);
    g.fillTriangle(fx + 150, fy + 120, fx + 320, fy + fh, fx + 460, fy + fh);
    g.fillTriangle(fx + 150, fy + 120, fx + 500, fy + fh, fx + 680, fy + fh);

    // Dãy núi trập trùng phía xa mờ ảo
    g.fillStyle(0x274e38, 0.8);
    g.fillTriangle(fx + 50, fy + 135, fx + 160, fy + 80, fx + 270, fy + 135);
    g.fillTriangle(fx + 220, fy + 135, fx + 340, fy + 90, fx + 460, fy + 135);
    g.fillTriangle(fx + 430, fy + 135, fx + 560, fy + 75, fx + 690, fy + 135);

    // Tháp chuông làng Bellhollow rực sáng trong ánh bình minh
    g.fillStyle(0x1a252f, 1);
    g.fillRect(fx + 480, fy + 45, 34, 90);
    g.fillTriangle(fx + 470, fy + 45, fx + 497, fy + 20, fx + 524, fy + 45); // Mái chóp nhọn
    // Quả chuông đồng hoàng kim phát sáng
    g.fillStyle(0xf39c12, 1);
    g.fillCircle(fx + 497, fy + 68, 8);
    g.fillStyle(0xfff9c4, 1);
    g.fillCircle(fx + 495, fy + 66, 3);

    // Mái nhà làng và khói lam chiều thanh bình
    g.fillStyle(0x2c3e50, 1);
    g.fillRect(fx + 530, fy + 95, 48, 40);
    g.fillTriangle(fx + 525, fy + 95, fx + 554, fy + 75, fx + 583, fy + 95);
    g.fillStyle(0xecf0f1, 0.4);
    g.fillCircle(fx + 565, fy + 65, 5);
    g.fillCircle(fx + 570, fy + 52, 7);

    // Mặt đất thảm cỏ xanh hồi sinh
    g.fillStyle(0x2e7d32, 1);
    g.fillRect(fx, fy + 135, fw, 20);
    g.fillStyle(0x388e3c, 1);
    g.fillRect(fx, fy + 132, fw, 4);

    // Hình bóng The Mossbound Wayfarer (Hiệp Sĩ Đen) đứng nhìn về phía mặt trời cùng dân làng
    // Hiệp Sĩ Đen áo choàng bay trong gió
    g.fillStyle(0x1b2631, 1);
    g.fillRect(fx + 240, fy + 98, 14, 37);
    g.fillStyle(0x27ae60, 1); // Áo choàng rêu phong
    g.fillTriangle(fx + 236, fy + 104, fx + 242, fy + 135, fx + 230, fy + 130);
    g.fillStyle(0xd5dbdb, 1); // Mũ giáp sắt
    g.fillCircle(fx + 247, fy + 96, 6);

    // Dân làng tụ họp cạnh tháp chuông (Edda, Garth, Neris, Bram, Finn)
    g.fillStyle(0x34495e, 1); g.fillRect(fx + 280, fy + 105, 10, 30); // Garth
    g.fillStyle(0x7f8c8d, 1); g.fillRect(fx + 300, fy + 108, 9, 27);  // Edda
    g.fillStyle(0x16a085, 1); g.fillRect(fx + 320, fy + 106, 9, 29);  // Neris
    g.fillStyle(0xd35400, 1); g.fillRect(fx + 340, fy + 104, 11, 31); // Bram
    g.fillStyle(0xf1c40f, 1); g.fillRect(fx + 360, fy + 115, 8, 20);  // Bé Finn vẫy tay

    // Hạt lân tinh và tia sáng lấp lánh bay lên trời
    g.fillStyle(0xfff9c4, 0.9);
    for (let i = 0; i < 18; i++) {
      const rx = fx + 60 + ((i * 37) % (fw - 120));
      const ry = fy + 30 + ((i * 23) % 95);
      g.fillCircle(rx, ry, 2);
    }

    // Viền khung tranh đôi mạ vàng lộng lẫy
    g.lineStyle(3, 0xf39c12, 1);
    g.strokeRect(fx, fy, fw, fh);
    g.lineStyle(1, 0xffe082, 0.6);
    g.strokeRect(fx + 4, fy + 4, fw - 8, fh - 8);
  }

  /**
   * VẼ TRANH PIXEL ART MINH HỌA KẾT THÚC II: NGƯỜI CANH GÁC VĨNH HẰNG
   */
  private drawSacrificeEndingIllustration(g: Phaser.GameObjects.Graphics, fx: number, fy: number, fw: number, fh: number): void {
    // 1. Khung tranh & Nền hang Mạch Rễ cổ u tối
    g.fillStyle(0x060c14, 1);
    g.fillRect(fx, fy, fw, fh);

    // Rễ cây khổng lồ vươn khắp trần hang
    g.fillStyle(0x271a10, 1);
    g.fillRect(fx, fy, fw, 22);
    g.fillTriangle(fx, fy + 22, fx + 120, fy + 65, fx + 240, fy + 22);
    g.fillTriangle(fx + 460, fy + 22, fx + 580, fy + 70, fx + fw, fy + 22);

    // Đốm rêu huỳnh quang lấp lánh trên rễ
    g.fillStyle(0x2ecc71, 0.6);
    g.fillCircle(fx + 120, fy + 65, 4);
    g.fillCircle(fx + 580, fy + 70, 5);
    g.fillCircle(fx + 340, fy + 18, 3);

    // Khe nứt The Veil ở trung tâm bị phong ấn
    g.fillStyle(0x1a252f, 1);
    g.fillRect(fx + 310, fy + 35, 100, 95);

    // Quầng sáng Hổ Phách thiêng liêng hình cầu tỏa ra từ Ngọn Đèn Lồng
    const coreX = fx + 360;
    const coreY = fy + 88;
    g.fillStyle(0xf39c12, 0.15);
    g.fillCircle(coreX, coreY, 68);
    g.fillStyle(0xe67e22, 0.35);
    g.fillCircle(coreX, coreY, 48);
    g.fillStyle(0xfff3e0, 0.85);
    g.fillCircle(coreX, coreY, 16);

    // Hình bóng Hiệp Sĩ Đen quỳ gối cắm gươm giữ chặt ngọn đèn
    g.fillStyle(0x17202a, 1);
    g.fillRect(coreX - 16, coreY - 6, 22, 42); // Thân giáp sắt
    g.fillCircle(coreX - 6, coreY - 14, 8);     // Mũ giáp cúi đầu
    // Thanh kiếm cổ cắm ngập xuống lòng đất
    g.fillStyle(0xbdc3c7, 1);
    g.fillRect(coreX - 22, coreY + 10, 4, 30);
    g.fillRect(coreX - 26, coreY + 12, 12, 3); // Chuôi kiếm

    // Mạch Rễ xanh và tinh thể rêu phong bắt đầu hóa thạch bao phủ lên thân xác hiệp sĩ
    g.fillStyle(0x27ae60, 0.9);
    g.fillRect(coreX - 18, coreY + 24, 8, 14);
    g.fillRect(coreX - 8, coreY + 18, 12, 8);
    g.fillStyle(0xf1c40f, 0.8); // Tinh thể hổ phách
    g.fillCircle(coreX + 2, coreY + 26, 3);
    g.fillCircle(coreX - 12, coreY + 34, 4);

    // Màn sương The Veil tím đen bị đẩy lùi dạt sang hai bên mép khung tranh
    g.fillStyle(0x341f4d, 0.5);
    g.fillRect(fx, fy, 100, fh);
    g.fillRect(fx + fw - 100, fy, 100, fh);

    // Nền đá cổ
    g.fillStyle(0x1b2631, 1);
    g.fillRect(fx, fy + 130, fw, 25);

    // Viền khung tranh đôi xanh lam cổ ngữ
    g.lineStyle(3, 0x3498db, 1);
    g.strokeRect(fx, fy, fw, fh);
    g.lineStyle(1, 0x5dade2, 0.6);
    g.strokeRect(fx + 4, fy + 4, fw - 8, fh - 8);
  }

  /**
   * VẼ TRANH PIXEL ART MINH HỌA KẾT THÚC III: VÒNG LẶP CỦA SƯƠNG MÙ
   */
  private drawFogLoopEndingIllustration(g: Phaser.GameObjects.Graphics, fx: number, fy: number, fw: number, fh: number): void {
    // 1. Khung tranh & Nền bầu trời tím đen u ám đặc quánh
    g.fillStyle(0x0e0714, 1);
    g.fillRect(fx, fy, fw, fh);

    // Màn sương tím tái u uất cuộn trào
    g.fillStyle(0x261336, 1); g.fillRect(fx, fy, fw, 45);
    g.fillStyle(0x381952, 1); g.fillRect(fx, fy + 45, fw, 45);
    g.fillStyle(0x1f0b2e, 1); g.fillRect(fx, fy + 90, fw, 65);

    // Cây cối khô khốc trơ cành ma quái
    g.fillStyle(0x12071a, 1);
    g.fillRect(fx + 70, fy + 40, 10, 95);
    g.fillTriangle(fx + 75, fy + 50, fx + 30, fy + 20, fx + 75, fy + 60);
    g.fillTriangle(fx + 75, fy + 70, fx + 120, fy + 40, fx + 75, fy + 80);

    g.fillRect(fx + fw - 90, fy + 35, 12, 100);
    g.fillTriangle(fx + fw - 85, fy + 45, fx + fw - 40, fy + 20, fx + fw - 85, fy + 55);
    g.fillTriangle(fx + fw - 85, fy + 65, fx + fw - 130, fy + 35, fx + fw - 85, fy + 75);

    // Đôi mắt quái vật The Listener ẩn hiện rình rập trong sương
    g.fillStyle(0xe74c3c, 0.9);
    g.fillCircle(fx + 105, fy + 75, 3);
    g.fillCircle(fx + 115, fy + 75, 3);
    g.fillCircle(fx + fw - 110, fy + 68, 3);
    g.fillCircle(fx + fw - 100, fy + 68, 3);

    // Tháp chuông nghiêng ngả với Đại Hồng Chung bị nứt toác
    g.fillStyle(0x1a1223, 1);
    g.fillRect(fx + 340, fy + 30, 40, 100);
    g.fillTriangle(fx + 330, fy + 30, fx + 360, fy + 10, fx + 390, fy + 30);
    // Quả chuông đồng xỉn màu
    g.fillStyle(0x7f8c8d, 1);
    g.fillCircle(fx + 360, fy + 58, 12);
    // Vết nứt đỏ hung rực cháy trên thân chuông
    g.fillStyle(0xe74c3c, 1);
    g.fillRect(fx + 358, fy + 50, 3, 16);
    g.fillRect(fx + 361, fy + 56, 4, 3);

    // Kẻ Lữ Hành kiệt sức gục ngã trên nền đất ẩm
    g.fillStyle(0x1c2833, 1);
    g.fillRect(fx + 250, fy + 122, 28, 14); // Thân nằm nghiêng
    g.fillCircle(fx + 245, fy + 126, 6);   // Đầu gục xuống
    // Chiếc đèn lồng rơi tắt ngấm le lói khói xám
    g.fillStyle(0x7f8c8d, 1);
    g.fillRect(fx + 284, fy + 125, 8, 10);
    g.fillStyle(0x95a5a6, 0.4);
    g.fillCircle(fx + 288, fy + 116, 4); // Khói tàn
    g.fillCircle(fx + 291, fy + 106, 6);

    // Mặt đất bùn lầy lạnh lẽo
    g.fillStyle(0x140a1c, 1);
    g.fillRect(fx, fy + 135, fw, 20);

    // Viền khung tranh đôi tím tà khí
    g.lineStyle(3, 0x8e44ad, 1);
    g.strokeRect(fx, fy, fw, fh);
    g.lineStyle(1, 0xa569bd, 0.6);
    g.strokeRect(fx + 4, fy + 4, fw - 8, fh - 8);
  }

  /**
   * BẢNG THỐNG KÊ HÀNH TRÌNH SINH TỒN (SURVIVAL CHRONICLE)
   * Trình bày các chỉ số sinh tồn, điểm tin cậy dân làng, tiến trình thức tỉnh và số mảnh lore thu thập
   */
  private renderSurvivalChronicle(target: Phaser.Scene, config: EndingConfig): void {
    const cardBg = target.add.graphics();
    const cx = 180;
    const cy = 360;
    const cw = 920;
    const ch = 150;

    // Nền hộp thông tin sinh tồn bo góc mờ sang trọng
    cardBg.fillStyle(0x0a0e17, 0.92);
    cardBg.fillRoundedRect(cx, cy, cw, ch, 8);
    cardBg.lineStyle(2, config.borderTint, 0.65);
    cardBg.strokeRoundedRect(cx, cy, cw, ch, 8);

    // Dải phân cách mờ giữa 3 cột
    cardBg.lineStyle(1, 0x34495e, 0.5);
    cardBg.lineBetween(cx + 300, cy + 30, cx + 300, cy + ch - 12);
    cardBg.lineBetween(cx + 610, cy + 30, cx + 610, cy + ch - 12);

    this.endingTextContainer.add(cardBg);
    cardBg.setAlpha(0);

    // Tiêu đề bảng thống kê
    const headerTitle = HDTextHelper.createText(target, 640, cy + 15, '❖ BIÊN NIÊN SỬ SINH TỒN (SURVIVAL CHRONICLE) ❖', {
      fontSize: '13px',
      fontStyle: 'bold',
      color: config.accentColorHex,
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5).setAlpha(0);

    // Thu thập dữ liệu thực tế từ PlayerState
    const day = this.playerState.dayCount || 1;
    const timeCycle = (this.playerState.timeOfDay < 180) ? 'Ban Ngày' : 'Ban Đêm';
    const hp = Math.round(this.playerState.stats.health);
    const maxHp = Math.round(this.playerState.stats.maxHealth);
    const comp = Math.round(this.playerState.stats.composure ?? 100);
    const oil = Math.round(this.playerState.stats.lanternOil ?? 100);

    const trustScore = this.playerState.villageTrustScore;
    let trustLabel = 'Xa Cách';
    if (trustScore >= 75) trustLabel = 'Gắn Kết Sâu Sắc';
    else if (trustScore >= 60) trustLabel = 'Thân Thiết';
    else if (trustScore >= 40) trustLabel = 'Hòa Thuận';

    const stage = this.playerState.memoryAwakeningStage;
    const stageTitle = this.playerState.getPlayerDisplayIdentity().chronicleTitle;

    const unlockedLoreCount = this.playerState.unlockedLore.length;
    const totalLoreCount = (loreData.loreEntries ? loreData.loreEntries.length : 24);
    const bestiaryCount = this.playerState.bestiary.size;
    const visitedCount = this.playerState.visitedZones.size;

    let endingStateLabel = 'Ánh Sáng (Lời Nguyền Hóa Giải)';
    if (config.type === 'sacrifice_ending') {
      endingStateLabel = 'U Ám (Hiệp Sĩ Canh Giữ Rừng Sâu)';
    } else if (config.type === 'fog_loop_ending') {
      endingStateLabel = 'U Ám (Vòng Lặp Sương Mù)';
    }

    // CỘT 1: SINH TỒN & TRẠNG THÁI (X: cx + 18)
    const col1Texts = [
      `⏱️ Thời Gian: Ngày ${day} (${timeCycle})`,
      `❤️ Sinh Lực: ${hp}/${maxHp} HP | 🕯️ Dầu: ${oil}%`,
      `🧠 Tinh Thần Còn Lại: ${comp}/100 [Bình Tâm]`,
      `🌟 Trạng Thái: ${endingStateLabel}`
    ];

    // CỘT 2: TIẾN TRÌNH NHÂN VẬT & LÀNG (X: cx + 318)
    const col2Texts = [
      `🤝 Tin Cậy Dân Làng: ${trustScore}/100 [${trustLabel}]`,
      `⚔️ Thức Tỉnh Ký Ức: Cấp ${stage}/3`,
      `🛡️ Danh Xưng: ${stageTitle}`,
      `🔔 Chuông Đồng Cổ: Đã Ngân Vang`
    ];

    // CỘT 3: KHÁM PHÁ & BẢN ĐỒ (X: cx + 628)
    const col3Texts = [
      `📜 Ký Ức Đã Mở: ${unlockedLoreCount}/${totalLoreCount} Mảnh Lore`,
      `🐾 Bestiary Ghi Nhận: ${bestiaryCount} Sinh Vật`,
      `🗺️ Bản Đồ Khám Phá: ${visitedCount}/9 Phân Khu`,
      `🌿 Lời Nguyền: ${config.type === 'true_ending' ? 'Đã Thanh Tẩy' : 'Tạm Khóa'}`
    ];

    const textElements: Phaser.GameObjects.Text[] = [headerTitle];

    const renderColumn = (texts: string[], startColX: number) => {
      texts.forEach((txt, idx) => {
        const textObj = HDTextHelper.createText(target, startColX, cy + 38 + (idx * 26), txt, {
          fontSize: '12px',
          color: '#ecf0f1',
          stroke: '#000000',
          strokeThickness: 2
        }).setOrigin(0, 0.5).setAlpha(0);
        textElements.push(textObj);
      });
    };

    renderColumn(col1Texts, cx + 18);
    renderColumn(col2Texts, cx + 318);
    renderColumn(col3Texts, cx + 628);

    this.endingTextContainer.add(textElements);

    target.tweens.add({
      targets: [cardBg, ...textElements],
      alpha: 1,
      duration: 600
    });
  }

  /**
   * NÚT ĐIỀU HƯỚNG V15-59: CHƠI HÀNH TRÌNH MỚI & QUAY VỀ MENU CHÍNH
   * Cung cấp 2 nút bấm đối xứng tại Y = 580 và bộ lắng nghe phím ENTER / ESC / SPACE
   */
  private renderReturnControls(target: Phaser.Scene, config: EndingConfig): void {
    // Nút 1: [⚔ CHƠI HÀNH TRÌNH MỚI] đặt tại X = 470, Y = 580
    const newJourneyBtn = HDTextHelper.createText(target, 470, 580, '⚔ CHƠI HÀNH TRÌNH MỚI', {
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#2ecc71',
      backgroundColor: '#111620',
      padding: { x: 24, y: 11 },
      stroke: '#2ecc71',
      strokeThickness: 1
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });

    // Nút 2: [▶ QUAY VỀ MENU CHÍNH] đặt tại X = 810, Y = 580 (giữ nguyên tương thích test Y=580)
    const returnBtn = HDTextHelper.createText(target, 810, 580, '▶ QUAY VỀ MENU CHÍNH', {
      fontSize: '16px',
      fontStyle: 'bold',
      color: config.accentColorHex,
      backgroundColor: '#111620',
      padding: { x: 24, y: 11 },
      stroke: config.accentColorHex,
      strokeThickness: 1
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });

    // Dòng nhắc nhở phím nóng tại Y = 626
    const returnHint = HDTextHelper.createText(target, 640, 626, '[Nhấn ENTER: Chơi Hành Trình Mới  |  Nhấn ESC / SPACE: Về Menu Chính  |  Hỗ trợ nhấp chuột]', {
      fontSize: '13px',
      color: '#95a5a6',
      fontStyle: 'italic',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);

    this.newJourneyBtn = newJourneyBtn;
    this.returnBtn = returnBtn;
    this.returnHint = returnHint;

    // Hover & Click events cho newJourneyBtn
    newJourneyBtn.on('pointerover', () => {
      newJourneyBtn.setStyle({ color: '#ffffff', backgroundColor: '#27ae60' });
    });
    newJourneyBtn.on('pointerout', () => {
      newJourneyBtn.setStyle({ color: '#2ecc71', backgroundColor: '#111620' });
    });
    newJourneyBtn.on('pointerdown', () => this.startNewJourney());

    // Hover & Click events cho returnBtn
    returnBtn.on('pointerover', () => {
      returnBtn.setStyle({ color: '#ffffff', backgroundColor: '#d35400' });
    });
    returnBtn.on('pointerout', () => {
      returnBtn.setStyle({ color: config.accentColorHex, backgroundColor: '#111620' });
    });
    returnBtn.on('pointerdown', () => this.returnToMainMenu());

    // Hỗ trợ phím cứng ENTER (chơi mới) và ESC / SPACE (về menu) trên target scene
    if (target.input && target.input.keyboard) {
      target.input.keyboard.on('keydown-ENTER', () => {
        if (this.canStartNewJourney()) {
          this.startNewJourney();
        }
      });
      target.input.keyboard.on('keydown-SPACE', () => {
        if (this.canReturnToMenu()) {
          this.returnToMainMenu();
        }
      });
      target.input.keyboard.on('keydown-ESC', () => {
        if (this.canReturnToMenu()) {
          this.returnToMainMenu();
        }
      });
    }

    // Bổ sung listener trên GameScene nếu target là UIScene để luôn nhận được phím bấm
    if (this.scene && this.scene !== target && this.scene.input && this.scene.input.keyboard) {
      this.scene.input.keyboard.on('keydown-ENTER', () => {
        if (this.canStartNewJourney()) {
          this.startNewJourney();
        }
      });
      this.scene.input.keyboard.on('keydown-SPACE', () => {
        if (this.canReturnToMenu()) {
          this.returnToMainMenu();
        }
      });
      this.scene.input.keyboard.on('keydown-ESC', () => {
        if (this.canReturnToMenu()) {
          this.returnToMainMenu();
        }
      });
    }

    this.endingTextContainer.add([newJourneyBtn, returnBtn, returnHint]);

    newJourneyBtn.setAlpha(0);
    returnBtn.setAlpha(0);
    returnHint.setAlpha(0);
    target.tweens.add({
      targets: [newJourneyBtn, returnBtn, returnHint],
      alpha: 1,
      duration: 600
    });
  }

  /**
   * Bắt đầu một hành trình sinh tồn mới từ đầu, xóa sạch dữ liệu cũ và restart GameScene
   */
  public startNewJourney(): void {
    this.isEndingActive = false;

    // 1. Xóa toàn bộ dữ liệu lưu trên local và cloud
    SaveManager.clearSave();

    // 2. Reset PlayerState về trạng thái ban đầu
    PlayerState.getInstance().reset();

    // 3. Dừng GameScene và UIScene
    if (this.scene) {
      this.scene.scene.stop('GameScene');
    }
    if (this.uiScene) {
      this.uiScene.scene.stop('UIScene');
    }

    // 4. Khởi động GameScene mới tinh
    const targetScene = this.getTargetScene();
    targetScene.scene.start('GameScene', { isContinue: false });

    if (this.onCompleteCallback) {
      this.onCompleteCallback();
      this.onCompleteCallback = undefined;
    }
  }

  /**
   * Phương thức tương thích ngược cho Time Rift cutscene (kiểm thử release V3.0)
   */
  public playTimeRiftCutscene(onRiftClosed: () => void): void {
    const target = this.getTargetScene();
    this.timeRiftGraphics.setVisible(true);
    this.timeRiftGraphics.clear();

    const riftX = 640;
    const riftY = 300;

    const g = this.timeRiftGraphics;
    g.fillStyle(0x2980b9, 0.25);
    g.fillEllipse(riftX, riftY, 420, 220);
    g.fillStyle(0x3498db, 0.45);
    g.fillEllipse(riftX, riftY, 320, 160);
    g.fillStyle(0x5dade2, 0.70);
    g.fillEllipse(riftX, riftY, 220, 100);
    g.fillStyle(0xebf5fb, 0.95);
    g.fillEllipse(riftX, riftY, 150, 60);

    // Dư ảnh Dark Fantasy: hình bóng lối mòn cổ và ánh lửa Hộ Tâm giữa màn sương (DEC-LOCK-08)
    g.fillStyle(0x1f241b, 1);
    g.fillRect(riftX - 70, riftY - 18, 140, 36);

    // Ánh vàng hổ phách dịu ấm nơi lối mòn cổ
    g.fillStyle(0xc8963e, 0.32);
    g.fillCircle(riftX, riftY, 22);

    g.fillStyle(0xe8dfc8, 0.85);
    g.fillCircle(riftX, riftY, 9);

    // Lời dẫn Lữ Khách chuẩn HD 1280×720 tại Y = 580 (loại bỏ văn cảnh hiện đại theo DEC-LOCK-08)
    const riftDialogue = HDTextHelper.createText(
      target,
      640,
      580,
      '“Giữa những tầng sương, một lối mòn quen thuộc dần hiện ra.”',
      {
        fontSize: '18px',
        fontStyle: 'italic',
        color: '#c8cfc2',
        backgroundColor: '#0a0e14f0',
        padding: { x: 28, y: 14 },
        stroke: '#000000',
        strokeThickness: 3
      }
    ).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(20005);

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

  /**
   * Phương thức tương thích ngược cho Credits cutscene (kiểm thử release V3.0)
   */
  public playFinalCreditsCutscene(): void {
    // Dưới chân bệ chuông, một cuốn sổ da cũ rơi ra từ khe đá...
    // Gương mặt ấy... chiếc áo choàng rêu phong và ngọn đèn cổ... giống hệt Satyr từng nét vẽ.
    // HOLLOW WOODS V1.1 - TẬP 1: THE FIRST TOLL - THE FOREST REMEMBERS. TO BE CONTINUED...
    const endingType = this.determineEndingType();
    this.playEndingPresentation(endingType);
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
