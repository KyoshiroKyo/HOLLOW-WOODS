import * as Phaser from 'phaser';
import { PlayerState } from '../state/PlayerState';
import { ZoneAtmosphere } from '../types';
import { HDTextHelper } from '../utils/HDTextHelper';
import { IDialogueView } from '../systems/DialogueSystem';
import { CraftingModal } from '../ui/CraftingModal';
import { JournalModal } from '../ui/JournalModal';
import { PauseModal } from '../ui/PauseModal';
import { GameOverModal } from '../ui/GameOverModal';
import { StorageChestModal } from '../ui/StorageChestModal';
import { CampfireModal } from '../ui/CampfireModal';
import { CauldronModal } from '../ui/CauldronModal';
import { EquipmentModal } from '../ui/EquipmentModal';
import { AudioManager } from '../audio/AudioManager';
import { HUDIconGenerator, HUD_ICON_HEALTH, HUD_ICON_STAMINA, HUD_ICON_OIL, HUD_ICON_COMPOSURE } from '../utils/HUDIconGenerator';
import { TimePhase, TIME_CONFIG } from '../config/TimeConfig';

export interface QuickSlotRef {
  id: string;
  key: string;
  bg: Phaser.GameObjects.Graphics;
  label: Phaser.GameObjects.Text;
  x: number;
}

export class UIScene extends Phaser.Scene implements IDialogueView {
  private playerState!: PlayerState;

  // Khung nền chỉ số sinh tồn bán trong suốt (C4-13-07)
  private statCardBg!: Phaser.GameObjects.Graphics;

  // Tiêu đề nhân vật góc trên trái
  private playerNameText!: Phaser.GameObjects.Text;

  // Đồ họa 4 thanh chỉ số pixel và nhãn số lượng
  private statBarsGraphics!: Phaser.GameObjects.Graphics;
  private statIconsGraphics!: Phaser.GameObjects.Graphics;
  private statIconImages: Phaser.GameObjects.Image[] = [];
  private healthValText!: Phaser.GameObjects.Text;
  private staminaValText!: Phaser.GameObjects.Text;
  private oilValText!: Phaser.GameObjects.Text;
  private composureValText!: Phaser.GameObjects.Text;
  private lanternStatusBg!: Phaser.GameObjects.Graphics;
  private lanternStatusText!: Phaser.GameObjects.Text;

  // Banner phân khu
  private zoneBannerContainer!: Phaser.GameObjects.Container;
  private zoneTitleText!: Phaser.GameObjects.Text;
  private zoneSubtitleText!: Phaser.GameObjects.Text;
  // C4-13-19: Bộ đệm thời gian chống nháy banner phân khu
  private lastBannerShownTime: number = 0;
  private lastBannerZoneTitle: string = '';

  // Bảng nhiệm vụ góc trên phải
  private questBg!: Phaser.GameObjects.Graphics;
  private questHeaderText!: Phaser.GameObjects.Text;
  private questTitleText!: Phaser.GameObjects.Text;
  private questTrackerText!: Phaser.GameObjects.Text;

  // V1.4: Widget Thời gian & Chu kỳ Ngày / Đêm thế giới
  private timeWidgetBg!: Phaser.GameObjects.Graphics;
  private timeClockGfx!: Phaser.GameObjects.Graphics; // V14-P8-02: Mặt đồng hồ tròn 3 múi màu
  private timeIconText!: Phaser.GameObjects.Text;
  private timeDayText!: Phaser.GameObjects.Text;
  private timePhaseText!: Phaser.GameObjects.Text;
  private timeTimerText!: Phaser.GameObjects.Text;
  private timeProgressBar!: Phaser.GameObjects.Graphics;
  private quickActionButtonsContainer!: Phaser.GameObjects.Container; // V14-P8-02: Cụm nút nhanh góc dưới trái
  private lastRenderedPhase: string = '';
  private lastRenderedDay: number = -1;
  private lastRenderedTimeSec: number = -1;

  // V1.4: 2 Huy hiệu trạng thái phụ (Moisture & Temperature Badges)
  private moistureBadgeBg!: Phaser.GameObjects.Graphics;
  private moistureBadgeText!: Phaser.GameObjects.Text;
  private temperatureBadgeBg!: Phaser.GameObjects.Graphics;
  private temperatureBadgeText!: Phaser.GameObjects.Text;
  private lastRenderedMoisture: number = -1;
  private lastRenderedTemperature: number = -1;

  // Thanh vật phẩm nhanh (Quick Slot)
  private quickSlotContainer!: Phaser.GameObjects.Container;
  private quickSlotRefs: QuickSlotRef[] = [];
  public selectedQuickSlotIndex: number = 0;
  private slotHighlightGraphics!: Phaser.GameObjects.Graphics;
  private poulticeCountBadge?: Phaser.GameObjects.Graphics;
  private poulticeCountText!: Phaser.GameObjects.Text;
  private oilCountBadge?: Phaser.GameObjects.Graphics;
  private oilCountText!: Phaser.GameObjects.Text;
  private lureCountBadge?: Phaser.GameObjects.Graphics;
  private lureCountText!: Phaser.GameObjects.Text;

  // Lời nhắc tương tác bán trong suốt (C4-13-07)
  private promptContainer!: Phaser.GameObjects.Container;
  private promptBg!: Phaser.GameObjects.Graphics;
  private promptText!: Phaser.GameObjects.Text;
  private promptWorldTarget: { x: number; y: number } | null = null;

  // Khung hộp thoại chuẩn HD 1280×720 (GATE 1A - Presentation in UIScene at Zoom 1.0)
  private dialogueContainer!: Phaser.GameObjects.Container;
  private dialogueSpeakerText!: Phaser.GameObjects.Text;
  private dialogueContentText!: Phaser.GameObjects.Text;
  private dialogueContinuePrompt!: Phaser.GameObjects.Text;
  private dialoguePortraitSprite!: Phaser.GameObjects.Image;
  private dialogueAdvanceHandler?: () => void;

  // Quản lý Modal tập trung (GATE 1B & 1C - Screen Space at Zoom 1.0)
  public craftingModal!: CraftingModal;
  public journalModal!: JournalModal;
  public pauseModal!: PauseModal;
  public gameOverModal!: GameOverModal;
  public storageChestModal!: StorageChestModal;
  public campfireModal!: CampfireModal;
  public cauldronModal!: CauldronModal;
  public equipmentModal!: EquipmentModal;

  // V1.4 - P6: Thanh Độ Ổn Định Phong Ấn (Boss Seal Bar)
  private bossSealContainer!: Phaser.GameObjects.Container;
  private bossSealTitleText!: Phaser.GameObjects.Text;
  private bossSealBg!: Phaser.GameObjects.Graphics;
  private bossSealNodes: Phaser.GameObjects.Text[] = [];

  // Bộ nhớ đệm đồ họa chỉ số (Dirty Checking Cache - GATE 3B)
  private lastHealthW: number = -1;
  private lastStaminaW: number = -1;
  private lastOilW: number = -1;
  private lastComposureW: number = -1;
  private lastLanternState: boolean | null = null;

  // C4-13-09: Bộ nhớ đệm kiểm tra thay đổi nhãn văn bản (Text Canvas Dirty Checking)
  private lastCurH: number = -1;
  private lastMaxH: number = -1;
  private lastCurS: number = -1;
  private lastMaxS: number = -1;
  private lastCurO: number = -1;
  private lastMaxO: number = -1;
  private lastCurC: number = -1;
  private lastMaxC: number = -1;
  private lastQuestTitle: string = '';
  private lastQuestTaskText: string = '';
  private lastPoulticeCount: number = -1;
  private lastOilCount: number = -1;
  private lastLureCount: number = -1;

  // C4-13-09: Bộ nhớ đệm kiểm tra thay đổi lời nhắc tương tác (Interaction Prompt Dirty Checking)
  private lastPromptText: string | null = null;
  private lastPromptAlpha: number = -1;

  // Quản lý Popup duy nhất tránh tích tụ Tween và cấp phát rác (GATE 3B, C4-13-09)
  private activePopup?: Phaser.GameObjects.Text;
  private activePopupTween?: Phaser.Tweens.Tween;
  private pooledPopupText?: Phaser.GameObjects.Text;
  private lastPoulticeTime: number = 0;
  private lastOilTime: number = 0;

  // C4-13-18 & C4-132-07: Hiệu ứng viền tối/đỏ hoảng loạn khi cạn kiệt Bình Tâm
  private panicVignetteGraphics!: Phaser.GameObjects.Graphics;
  private isPanicVignetteActive: boolean = false;
  private lastPanicWarningTime: number = 0;
  private lastDarknessWarningTime: number = 0;

  // C4-132-07: Lớp phủ hướng dẫn khi iframe mất Focus
  private focusOverlayContainer?: Phaser.GameObjects.Container;
  private boundWindowBlur?: () => void;
  private boundWindowFocus?: () => void;

  constructor() {
    super({ key: 'UIScene' });
  }

  public create(): void {
    // Đảm bảo Camera UI luôn hiển thị ở tỉ lệ chuẩn zoom = 1.0 không bị phóng to
    this.cameras.main.setZoom(1.0);

    this.playerState = PlayerState.getInstance();

    // C4-13-18: Hiệu ứng viền tối/đỏ hoảng loạn khi Bình Tâm cạn kiệt (depth: 900)
    this.panicVignetteGraphics = this.add.graphics();
    this.panicVignetteGraphics.setDepth(900);
    this.panicVignetteGraphics.setScrollFactor(0);

    // 1. Khung chứa 4 thanh chỉ số sinh tồn tinh gọn, bán trong suốt (C4-13-07)
    this.statCardBg = this.add.graphics();
    this.statCardBg.fillStyle(0x080d14, 0.72);
    this.statCardBg.fillRoundedRect(12, 8, 308, 92, 6);
    this.statCardBg.lineStyle(1, 0x2c3e50, 0.6);
    this.statCardBg.strokeRoundedRect(12, 8, 308, 92, 6);

    // Tên nhân vật chính hiển thị góc trên trái
    this.playerNameText = HDTextHelper.createText(this, 22, 12, '🌲 The Mossbound Wayfarer', {
      fontSize: '11.5px',
      fontStyle: 'bold',
      color: '#f39c12',
      stroke: '#000000',
      strokeThickness: 2
    });

    this.statBarsGraphics = this.add.graphics();
    this.statIconsGraphics = this.add.graphics();

    // 1b. Dựng 4 icon pixel cho 4 chỉ số (Góc trên trái chuẩn HD 1280×720)
    this.drawPixelIcons();

    // 1c. Bổ sung các nhãn số liệu rõ nét cho 4 thanh chỉ số sinh tồn
    this.healthValText = HDTextHelper.createText(this, 194, 31, 'Sinh Lực: 100/100', {
      fontSize: '10.5px',
      fontStyle: 'bold',
      color: '#ff7675',
      stroke: '#000000',
      strokeThickness: 2
    });

    this.staminaValText = HDTextHelper.createText(this, 194, 47, 'Thể Lực: 80/80', {
      fontSize: '10.5px',
      fontStyle: 'bold',
      color: '#feca57',
      stroke: '#000000',
      strokeThickness: 2
    });

    this.oilValText = HDTextHelper.createText(this, 194, 63, 'Dầu Đèn: 60/60', {
      fontSize: '10.5px',
      fontStyle: 'bold',
      color: '#ff9f43',
      stroke: '#000000',
      strokeThickness: 2
    });

    this.composureValText = HDTextHelper.createText(this, 194, 79, 'Bình Tâm: 40/40', {
      fontSize: '10.5px',
      fontStyle: 'bold',
      color: '#a29bfe',
      stroke: '#000000',
      strokeThickness: 2
    });

    // 2. Chữ trạng thái Đèn lồng chuẩn HD đặt cạnh thanh Dầu Đèn với nền badge bán trong suốt (V14-P8-01: dịch x=308 để không đè chữ Dầu Đèn)
    this.lanternStatusBg = this.add.graphics();
    this.lanternStatusText = HDTextHelper.createText(this, 308, 68, 'ĐÈN: TẮT [F]', {
      fontSize: '9.5px',
      fontStyle: 'bold',
      color: '#95a5a6',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);

    // 2b. V1.4: 2 Huy hiệu trạng thái phụ (Độ Ẩm & Thân Nhiệt)
    this.moistureBadgeBg = this.add.graphics();
    this.moistureBadgeText = HDTextHelper.createText(this, 24, 107, '💧 Khô ráo', {
      fontSize: '9.5px',
      fontStyle: 'bold',
      color: '#1abc9c',
      stroke: '#000000',
      strokeThickness: 2
    });

    this.temperatureBadgeBg = this.add.graphics();
    this.temperatureBadgeText = HDTextHelper.createText(this, 172, 107, '🔥 Ấm áp', {
      fontSize: '9.5px',
      fontStyle: 'bold',
      color: '#f39c12',
      stroke: '#000000',
      strokeThickness: 2
    });

    this.updateStatusBadges(0, 80);

    // 3. Khung bảng theo dõi nhiệm vụ góc trên phải bán trong suốt (C4-13-07)
    const questBoxW = 340;
    const questBoxH = 78;
    const questBoxX = 1260 - questBoxW; // 920
    const questBoxY = 16;

    this.questBg = this.add.graphics();
    this.questBg.fillStyle(0x080d14, 0.75);
    this.questBg.fillRoundedRect(questBoxX, questBoxY, questBoxW, questBoxH, 6);
    this.questBg.lineStyle(1, 0xd4af37, 0.6);
    this.questBg.strokeRoundedRect(questBoxX, questBoxY, questBoxW, questBoxH, 6);
    // Vạch nhấn vàng kim dọc mép trái
    this.questBg.fillStyle(0xd4af37, 0.4);
    this.questBg.fillRect(questBoxX, questBoxY + 4, 3, questBoxH - 8);

    this.questHeaderText = HDTextHelper.createText(this, questBoxX + 12, questBoxY + 8, '📜 NHIỆM VỤ HIỆN TẠI [J]:', {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#f39c12',
      stroke: '#000000',
      strokeThickness: 2
    });

    this.questTitleText = HDTextHelper.createText(this, questBoxX + 12, questBoxY + 26, '', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#f1c40f',
      stroke: '#000000',
      strokeThickness: 2
    });

    this.questTrackerText = HDTextHelper.createText(this, questBoxX + 12, questBoxY + 45, '', {
      fontSize: '11.5px',
      color: '#ecf0f1',
      wordWrap: { width: questBoxW - 24 },
      lineSpacing: 2,
      stroke: '#000000',
      strokeThickness: 1
    });

    // 3B. V1.4 - P8: Widget Đồng Hồ Tròn 3 Múi Thời Gian (DAY-NIGHT CIRCULAR CLOCK)
    const timeBoxW = 210;
    const timeBoxX = questBoxX - timeBoxW - 12; // 920 - 210 - 12 = 698
    const timeBoxY = 16;

    this.timeWidgetBg = this.add.graphics();
    this.timeWidgetBg.setDepth(8000);

    this.timeClockGfx = this.add.graphics();
    this.timeClockGfx.setDepth(8001);

    this.timeProgressBar = this.add.graphics();
    this.timeProgressBar.setDepth(8001);

    this.timeDayText = HDTextHelper.createText(this, timeBoxX + 74, timeBoxY + 12, 'Ngày 1 — Mùa Sương Lạnh', {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#f6ad55',
      stroke: '#000000',
      strokeThickness: 2
    }).setDepth(8002);

    this.timePhaseText = HDTextHelper.createText(this, timeBoxX + 74, timeBoxY + 31, '☀️ BAN NGÀY', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#f1c40f',
      stroke: '#000000',
      strokeThickness: 2
    }).setDepth(8002);

    this.timeTimerText = HDTextHelper.createText(this, timeBoxX + 74, timeBoxY + 50, '0:00 / 3:00', {
      fontSize: '10.5px',
      color: '#bdc3c7',
      stroke: '#000000',
      strokeThickness: 1
    }).setDepth(8002);

    this.timeIconText = HDTextHelper.createText(this, 0, 0, '').setVisible(false);

    this.updateTimeWidget(1, 0, 'DAY', 0);

    // 4. Banner tên phân khu có nền tối chống chìm chữ (Tâm tại 640, 85)
    this.zoneBannerContainer = this.add.container(640, 85);
    this.zoneBannerContainer.setDepth(8500);
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

    // V1.4 - P6: Dựng Thanh Độ Ổn Định Phong Ấn tại đỉnh màn hình (640, 42)
    this.buildBossSealBar();

    // 5. Thanh vật phẩm nhanh dưới đáy màn hình đặt tại (640, 684)
    this.buildQuickSlots();
    // V14-P8-02: Cụm nút chức năng nhanh ở góc dưới bên trái HUD
    this.buildQuickActionButtons();

    // 5b. Dựng khung hộp thoại HD 1280×720 tại (640, 590) (GATE 1A)
    this.buildDialogueUI();

    // 5c. Dựng Bàn Chế Tạo & Sổ Tay chuẩn HD 1280×720 tại UIScene Zoom 1.0 (GATE 1B)
    this.getCraftingModal();
    this.getJournalModal();

    // 6. Lời nhắc tương tác [E] chuẩn HD bán trong suốt (C4-13-07)
    this.promptContainer = this.add.container(640, 616);
    this.promptContainer.setDepth(8200);
    this.promptContainer.setAlpha(0);

    this.promptBg = this.add.graphics();
    this.promptContainer.add(this.promptBg);

    this.promptText = HDTextHelper.createText(this, 0, 0, '', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#f1c40f',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);
    this.promptContainer.add(this.promptText);

    // 7. Lắng nghe sự kiện từ PlayerState (dọn dẹp listener khi tắt scene để chống rò rỉ)
    const onStatsChanged = () => this.redrawStats();
    const onQuestChanged = () => {
      this.updateQuestTracker();
      AudioManager.getInstance().playQuestUpdate();
    };
    const onQuestUpdated = () => {
      this.updateQuestTracker();
      AudioManager.getInstance().playQuestUpdate();
    };
    const onInventoryChanged = () => this.updateQuickSlotCounts();

    this.playerState.on('stats_changed', onStatsChanged);
    this.playerState.on('quest_changed', onQuestChanged);
    this.playerState.on('quest_updated', onQuestUpdated);
    this.playerState.on('inventory_changed', onInventoryChanged);

    this.events.once('shutdown', () => {
      this.playerState.off('stats_changed', onStatsChanged);
      this.playerState.off('quest_changed', onQuestChanged);
      this.playerState.off('quest_updated', onQuestUpdated);
      this.playerState.off('inventory_changed', onInventoryChanged);
      // C4-13-09: Dọn dẹp triệt để tweens, timer events và keyboard listeners khi tắt/chuyển scene
      this.tweens.killAll();
      this.time.removeAllEvents();
      if (this.input && this.input.keyboard) {
        this.input.keyboard.removeAllListeners();
      }
      if (typeof window !== 'undefined') {
        if (this.boundWindowBlur) window.removeEventListener('blur', this.boundWindowBlur);
        if (this.boundWindowFocus) window.removeEventListener('focus', this.boundWindowFocus);
      }
      if (this.focusOverlayContainer) this.focusOverlayContainer.destroy();
      if (this.craftingModal) this.craftingModal.destroy();
      if (this.journalModal) this.journalModal.destroy();
      if (this.pauseModal) this.pauseModal.destroy();
      if (this.gameOverModal) this.gameOverModal.destroy();
      if (this.storageChestModal) this.storageChestModal.destroy();
      if (this.campfireModal) this.campfireModal.destroy();
      if (this.cauldronModal) this.cauldronModal.destroy();
      if (this.equipmentModal) this.equipmentModal.destroy();
      if (this.pooledPopupText) this.pooledPopupText.destroy();
      if (this.panicVignetteGraphics) this.panicVignetteGraphics.clear();
      if (this.timeWidgetBg) this.timeWidgetBg.destroy();
      if (this.timeClockGfx) this.timeClockGfx.destroy();
      if (this.quickActionButtonsContainer) this.quickActionButtonsContainer.destroy();
      if (this.timeProgressBar) this.timeProgressBar.destroy();
      if (this.timeIconText) this.timeIconText.destroy();
      if (this.timeDayText) this.timeDayText.destroy();
      if (this.timePhaseText) this.timePhaseText.destroy();
      if (this.timeTimerText) this.timeTimerText.destroy();
      if (this.moistureBadgeBg) this.moistureBadgeBg.destroy();
      if (this.moistureBadgeText) this.moistureBadgeText.destroy();
      if (this.temperatureBadgeBg) this.temperatureBadgeBg.destroy();
      if (this.temperatureBadgeText) this.temperatureBadgeText.destroy();
    });

    // C4-132-07: Lớp phủ chỉ dẫn bán trong suốt khi cửa sổ/iframe mất tiêu điểm (window.blur)
    this.focusOverlayContainer = this.add.container(640, 50).setDepth(99999).setVisible(false);
    const focusBg = this.add.graphics();
    focusBg.fillStyle(0x0a0f18, 0.88);
    focusBg.fillRoundedRect(-230, -18, 460, 36, 6);
    focusBg.lineStyle(1.5, 0xf39c12, 0.9);
    focusBg.strokeRoundedRect(-230, -18, 460, 36, 6);

    const focusText = HDTextHelper.createText(this, 0, 0, '🖱️ Nhấp chuột vào màn hình để tiếp tục điều khiển', {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#f1c40f',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);

    this.focusOverlayContainer.add([focusBg, focusText]);

    this.boundWindowBlur = () => {
      if (this.focusOverlayContainer) {
        this.focusOverlayContainer.setVisible(true);
      }
    };

    this.boundWindowFocus = () => {
      if (this.focusOverlayContainer) {
        this.focusOverlayContainer.setVisible(false);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('blur', this.boundWindowBlur);
      window.addEventListener('focus', this.boundWindowFocus);
    }

    this.input.on('pointerdown', () => {
      if (this.focusOverlayContainer && this.focusOverlayContainer.visible) {
        this.focusOverlayContainer.setVisible(false);
      }
    });

    // Cập nhật ban đầu
    this.redrawStats();
    this.updateQuestTracker();
    this.updateQuickSlotCounts();

    // Lắng nghe phím số [1]..[2], [Q], [F], [I], [J], [ESC] để chọn ô và thực thi nhanh
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-ONE', () => {
        if (this.isAnyModalOpen) return;
        this.selectQuickSlot(0);
        this.tryConsumePoultice();
      });
      this.input.keyboard.on('keydown-TWO', () => {
        if (this.isAnyModalOpen) return;
        this.selectQuickSlot(1);
        this.tryConsumeLanternOil();
      });
      this.input.keyboard.on('keydown-THREE', () => {
        if (this.isAnyModalOpen) return;
        this.tryPlantResinFlare();
      });
      this.input.keyboard.on('keydown-Q', () => {
        if (this.isAnyModalOpen) return;
        this.selectQuickSlot(2);
      });
      this.input.keyboard.on('keydown-F', () => {
        if (this.isAnyModalOpen) return;
        this.selectQuickSlot(3);
      });
      this.input.keyboard.on('keydown-E', () => {
        if (this.isAnyModalOpen) return;
        this.selectQuickSlot(4);
      });
      this.input.keyboard.on('keydown-C', () => {
        if (this.isAnyModalOpen) return;
        this.selectQuickSlot(5);
        this.toggleCrafting();
      });
      this.input.keyboard.on('keydown-I', () => {
        if (this.isAnyModalOpen) return;
        this.selectQuickSlot(5);
        this.toggleCrafting();
      });
      this.input.keyboard.on('keydown-J', () => {
        if (this.isAnyModalOpen) return;
        this.selectQuickSlot(6);
        this.toggleJournal();
      });
      this.input.keyboard.on('keydown-ESC', () => {
        if (this.isAnyModalOpen) return;
        this.selectQuickSlot(7);
      });
      this.input.keyboard.on('keydown-B', () => {
        if (this.gameOverModal && this.gameOverModal.isOpen) return;
        this.toggleEquipment();
      });
    }
  }

  private drawPixelIcons(): void {
    // C4-13-15: Đảm bảo 4 texture Pixel Art 16×16 px chuẩn Nearest-Neighbor đã được tạo
    HUDIconGenerator.generateAllHUDIcons(this);

    // Vẽ trực tiếp 4 biểu tượng Pixel Art sắc nét có viền tối và điểm sáng phản quang lên Graphics
    HUDIconGenerator.drawIconsToGraphics(this.statIconsGraphics, 18, [28, 44, 60, 76]);

    // Khởi tạo/cập nhật 4 Sprite Image độc lập từ các Texture Pixel Art 16×16 px
    if (this.statIconImages.length === 0) {
      const heartIcon = this.add.image(26, 36, HUD_ICON_HEALTH).setDisplaySize(16, 16).setOrigin(0.5, 0.5);
      const staminaIcon = this.add.image(26, 52, HUD_ICON_STAMINA).setDisplaySize(16, 16).setOrigin(0.5, 0.5);
      const oilIcon = this.add.image(26, 68, HUD_ICON_OIL).setDisplaySize(16, 16).setOrigin(0.5, 0.5);
      const composureIcon = this.add.image(26, 84, HUD_ICON_COMPOSURE).setDisplaySize(16, 16).setOrigin(0.5, 0.5);

      this.statIconImages = [heartIcon, staminaIcon, oilIcon, composureIcon];
    }
  }

  public redrawStats(): void {
    const stats = this.playerState.stats;
    const barX = 38;
    const barWidth = 145;

    const healthW = Math.round(Math.max(0, Math.min(barWidth, (stats.health / stats.maxHealth) * barWidth)));
    const staminaW = Math.round(Math.max(0, Math.min(barWidth, (stats.stamina / stats.maxStamina) * barWidth)));
    const oilW = Math.round(Math.max(0, Math.min(barWidth, (stats.lanternOil / stats.maxLanternOil) * barWidth)));
    const composureW = Math.round(Math.max(0, Math.min(barWidth, (stats.composure / stats.maxComposure) * barWidth)));

    const isBarsDirty =
      healthW !== this.lastHealthW ||
      staminaW !== this.lastStaminaW ||
      oilW !== this.lastOilW ||
      composureW !== this.lastComposureW;

    if (isBarsDirty) {
      this.lastHealthW = healthW;
      this.lastStaminaW = staminaW;
      this.lastOilW = oilW;
      this.lastComposureW = composureW;

      const g = this.statBarsGraphics;
      g.clear();

      // 1. Thanh Máu (Đỏ 3D, Cao 10px)
      this.drawThickBar(g, barX, 31, barWidth, 10, stats.health, stats.maxHealth, 0x962d22, 0xe74c3c);

      // 2. Thanh Thể Lực (Vàng 3D, Cao 9px)
      this.drawThickBar(g, barX, 47, barWidth, 9, stats.stamina, stats.maxStamina, 0xb7950b, 0xf1c40f);

      // 3. Thanh Dầu Đèn (Cam 3D, Cao 9px)
      this.drawThickBar(g, barX, 63, barWidth, 9, stats.lanternOil, stats.maxLanternOil, 0xa04000, 0xe67e22);

      // 4. Thanh Bình Tâm (Tím 3D, Cao 9px)
      this.drawThickBar(g, barX, 79, barWidth, 9, stats.composure, stats.maxComposure, 0x5b2c6f, 0x9b59b6);
    }

    // C4-13-09: Tối ưu Dirty-Checking cho các chỉ số HUD - chỉ set text và màu khi giá trị số thay đổi
    const curH = Math.round(stats.health);
    const maxH = Math.round(stats.maxHealth);
    if (this.healthValText && (this.lastCurH !== curH || this.lastMaxH !== maxH)) {
      this.lastCurH = curH;
      this.lastMaxH = maxH;
      this.healthValText.setText(`Sinh Lực: ${curH}/${maxH}`);
      this.healthValText.setColor(curH <= maxH * 0.3 ? '#ff4757' : '#ff7675');
    }

    const curS = Math.round(stats.stamina);
    const maxS = Math.round(stats.maxStamina);
    if (this.staminaValText && (this.lastCurS !== curS || this.lastMaxS !== maxS)) {
      this.lastCurS = curS;
      this.lastMaxS = maxS;
      this.staminaValText.setText(`Thể Lực: ${curS}/${maxS}`);
    }

    const curO = Math.round(stats.lanternOil);
    const maxO = Math.round(stats.maxLanternOil);
    if (this.oilValText && (this.lastCurO !== curO || this.lastMaxO !== maxO)) {
      this.lastCurO = curO;
      this.lastMaxO = maxO;
      this.oilValText.setText(`Dầu Đèn: ${curO}/${maxO}`);
      this.oilValText.setColor(curO <= maxO * 0.2 ? '#e74c3c' : '#ff9f43');
    }

    const curC = Math.round(stats.composure);
    const maxC = Math.round(stats.maxComposure);
    if (this.composureValText && (this.lastCurC !== curC || this.lastMaxC !== maxC)) {
      this.lastCurC = curC;
      this.lastMaxC = maxC;
      this.composureValText.setText(`Bình Tâm: ${curC}/${maxC}`);
      this.composureValText.setColor(curC <= 0 ? '#ff3838' : curC <= maxC * 0.3 ? '#fd79a8' : '#a29bfe');
    }

    // Cập nhật trạng thái đèn lồng
    if (this.lastLanternState !== stats.isLanternOn) {
      this.lastLanternState = stats.isLanternOn;
      if (this.lanternStatusBg && this.lanternStatusText) {
        this.lanternStatusBg.clear();
        if (stats.isLanternOn) {
          this.lanternStatusBg.fillStyle(0x3d2800, 0.85);
          this.lanternStatusBg.fillRoundedRect(280, 59, 58, 18, 4);
          this.lanternStatusBg.lineStyle(1, 0xf39c12, 0.9);
          this.lanternStatusBg.strokeRoundedRect(280, 59, 58, 18, 4);
          this.lanternStatusText.setText('🔥 [F] BẬT');
          this.lanternStatusText.setColor('#f1c40f');
        } else {
          this.lanternStatusBg.fillStyle(0x0e1118, 0.75);
          this.lanternStatusBg.fillRoundedRect(280, 59, 58, 18, 4);
          this.lanternStatusBg.lineStyle(1, 0x4a5568, 0.7);
          this.lanternStatusBg.strokeRoundedRect(280, 59, 58, 18, 4);
          this.lanternStatusText.setText('[F] TẮT');
          this.lanternStatusText.setColor('#7f8c8d');
        }
      }
    }

    // V1.4: Cập nhật 2 huy hiệu trạng thái phụ (Độ Ẩm & Thân Nhiệt)
    this.updateStatusBadges(stats.moisture ?? 0, stats.temperature ?? 80);
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
    // Đặt Thanh Phím Tắt Đáy tại (x: 640, y: 684) cân đối chuẩn HD 1280×720 với depth 8000
    this.quickSlotContainer = this.add.container(640, 684);
    this.quickSlotContainer.setDepth(8000);
    this.slotHighlightGraphics = this.add.graphics();
    this.quickSlotContainer.add(this.slotHighlightGraphics);

    // V1.4: 8 Ô phím tắt sinh tồn & tương tác chuẩn Canon Bellhollow
    const slotNames = [
      { key: '[1] Thuốc Đắp', id: 'poultice' },
      { key: '[2] Dầu Đèn', id: 'oil' },
      { key: '[Q] Mồi Ném', id: 'lure' },
      { key: '[F] Đèn Lồng', id: 'lantern' },
      { key: '[E] Tương Tác', id: 'interact' },
      { key: '[I] Chế Tạo', id: 'craft' },
      { key: '[J] Sổ Tay', id: 'journal' },
      { key: '[ESC] Tạm Dừng', id: 'pause' }
    ];

    const btnW = 98;
    const btnH = 36;
    const gap = 8;
    const totalW = slotNames.length * btnW + (slotNames.length - 1) * gap; // 8 * 98 + 7 * 8 = 840
    let startX = -totalW / 2 + btnW / 2; // -371

    this.quickSlotRefs = [];

    for (let i = 0; i < slotNames.length; i++) {
      const slot = slotNames[i];
      const slotX = startX;

      const g = this.add.graphics();
      // Ngôn ngữ gỗ tối, da cũ và đồng xỉn
      g.fillStyle(0x18110b, 0.88);
      g.fillRoundedRect(slotX - btnW / 2, -btnH / 2, btnW, btnH, 5);

      // Viền kim loại đồng xỉn mộc mạc
      g.lineStyle(1.5, 0x6e5233, 0.85);
      g.strokeRoundedRect(slotX - btnW / 2, -btnH / 2, btnW, btnH, 5);

      // Vạch bóng kim loại trong
      g.lineStyle(1, 0x9c774b, 0.35);
      g.strokeRoundedRect(slotX - btnW / 2 + 1, -btnH / 2 + 1, btnW - 2, btnH - 2, 4);

      // 4 đinh tán đồng ở góc
      g.fillStyle(0xb89058, 0.9);
      g.fillRect(slotX - btnW / 2 + 2, -btnH / 2 + 2, 2, 2);
      g.fillRect(slotX + btnW / 2 - 4, -btnH / 2 + 2, 2, 2);
      g.fillRect(slotX - btnW / 2 + 2, btnH / 2 - 4, 2, 2);
      g.fillRect(slotX + btnW / 2 - 4, btnH / 2 - 4, 2, 2);

      const label = HDTextHelper.createText(this, slotX, 0, slot.key, {
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#f5eedc',
        stroke: '#0c0805',
        strokeThickness: 2
      }).setOrigin(0.5, 0.5);

      this.quickSlotContainer.add([g, label]);

      const slotRef: QuickSlotRef = {
        id: slot.id,
        key: slot.key,
        bg: g,
        label,
        x: slotX
      };
      this.quickSlotRefs.push(slotRef);

      // Vùng bấm chuột cho từng nút phím tắt
      const hitZone = this.add.zone(slotX, 0, btnW, btnH).setInteractive({ useHandCursor: true });
      hitZone.on('pointerdown', () => {
        this.selectQuickSlot(i);
        if (slot.id === 'craft') {
          this.toggleCrafting();
        } else if (slot.id === 'journal') {
          this.toggleJournal();
        } else if (slot.id === 'pause') {
          this.togglePause();
        } else if (slot.id === 'poultice') {
          this.tryConsumePoultice();
        } else if (slot.id === 'oil') {
          this.tryConsumeLanternOil();
        } else if (slot.id === 'lantern') {
          this.events.emit('ui_toggle_lantern');
        } else if (slot.id === 'lure') {
          this.events.emit('ui_throw_lure');
        } else if (slot.id === 'interact') {
          const gameScene = this.scene.get('GameScene') as any;
          if (gameScene && typeof gameScene.triggerInteractionFromUI === 'function') {
            gameScene.triggerInteractionFromUI();
          }
        }
      });
      this.quickSlotContainer.add(hitZone);

      if (slot.id === 'poultice') {
        this.poulticeCountBadge = this.add.graphics();
        this.poulticeCountText = HDTextHelper.createText(this, slotX + btnW / 2 - 6, -btnH / 2 + 3, 'x0', {
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#2ecc71',
          stroke: '#000000',
          strokeThickness: 2
        }).setOrigin(1, 0);
        this.quickSlotContainer.add([this.poulticeCountBadge, this.poulticeCountText]);
      } else if (slot.id === 'oil') {
        this.oilCountBadge = this.add.graphics();
        this.oilCountText = HDTextHelper.createText(this, slotX + btnW / 2 - 6, -btnH / 2 + 3, 'x0', {
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#f39c12',
          stroke: '#000000',
          strokeThickness: 2
        }).setOrigin(1, 0);
        this.quickSlotContainer.add([this.oilCountBadge, this.oilCountText]);
      } else if (slot.id === 'lure') {
        this.lureCountBadge = this.add.graphics();
        this.lureCountText = HDTextHelper.createText(this, slotX + btnW / 2 - 6, -btnH / 2 + 3, 'x0', {
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#e67e22',
          stroke: '#000000',
          strokeThickness: 2
        }).setOrigin(1, 0);
        this.quickSlotContainer.add([this.lureCountBadge, this.lureCountText]);
      }

      startX += (btnW + gap);
    }

    this.redrawQuickSlotHighlights();
  }

  /**
   * V14-P8-02: Dựng cụm nút chức năng nhanh ở góc dưới bên trái HUD
   * Đặt kề cạnh Hotbar 8 ô, hỗ trợ cả chuột lẫn phím tắt mở Bảng Chế Tạo [C]/[I] và Sổ Tay [J]
   */
  private buildQuickActionButtons(): void {
    this.quickActionButtonsContainer = this.add.container(0, 0);
    this.quickActionButtonsContainer.setDepth(8000);

    const btnH = 36;
    const btnW = 92;
    const btnY = 684;

    // Nút 1: [C] / [I] Chế Tạo (Crafting - Biểu tượng Búa & Đe)
    const craftX = 66; // spans x = 20 to 112
    const craftBg = this.add.graphics();
    craftBg.fillStyle(0x18110b, 0.92);
    craftBg.fillRoundedRect(craftX - btnW / 2, btnY - btnH / 2, btnW, btnH, 5);
    craftBg.lineStyle(1.5, 0x6e5233, 0.9);
    craftBg.strokeRoundedRect(craftX - btnW / 2, btnY - btnH / 2, btnW, btnH, 5);
    craftBg.lineStyle(1, 0x9c774b, 0.35);
    craftBg.strokeRoundedRect(craftX - btnW / 2 + 1, btnY - btnH / 2 + 1, btnW - 2, btnH - 2, 4);

    // 4 đinh tán đồng
    craftBg.fillStyle(0xb89058, 0.9);
    craftBg.fillRect(craftX - btnW / 2 + 2, btnY - btnH / 2 + 2, 2, 2);
    craftBg.fillRect(craftX + btnW / 2 - 4, btnY - btnH / 2 + 2, 2, 2);
    craftBg.fillRect(craftX - btnW / 2 + 2, btnY + btnH / 2 - 4, 2, 2);
    craftBg.fillRect(craftX + btnW / 2 - 4, btnY + btnH / 2 - 4, 2, 2);

    const craftLabel = HDTextHelper.createText(this, craftX, btnY, '🔨 [C] Chế Tạo', {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#f5eedc',
      stroke: '#0c0805',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);

    const craftHit = this.add.zone(craftX, btnY, btnW, btnH).setInteractive({ useHandCursor: true });
    craftHit.on('pointerdown', () => {
      this.selectQuickSlot(5);
      this.toggleCrafting();
    });
    craftHit.on('pointerover', () => {
      craftBg.clear();
      craftBg.fillStyle(0x281d13, 0.98);
      craftBg.fillRoundedRect(craftX - btnW / 2, btnY - btnH / 2, btnW, btnH, 5);
      craftBg.lineStyle(1.5, 0xf1c40f, 1.0);
      craftBg.strokeRoundedRect(craftX - btnW / 2, btnY - btnH / 2, btnW, btnH, 5);
    });
    craftHit.on('pointerout', () => {
      craftBg.clear();
      craftBg.fillStyle(0x18110b, 0.92);
      craftBg.fillRoundedRect(craftX - btnW / 2, btnY - btnH / 2, btnW, btnH, 5);
      craftBg.lineStyle(1.5, 0x6e5233, 0.9);
      craftBg.strokeRoundedRect(craftX - btnW / 2, btnY - btnH / 2, btnW, btnH, 5);
      craftBg.lineStyle(1, 0x9c774b, 0.35);
      craftBg.strokeRoundedRect(craftX - btnW / 2 + 1, btnY - btnH / 2 + 1, btnW - 2, btnH - 2, 4);
    });

    // Nút 2: [J] Sổ Tay (Journal - Biểu tượng Cuốn Sách Cổ)
    const journalX = 164; // spans x = 118 to 210
    const journalBg = this.add.graphics();
    journalBg.fillStyle(0x18110b, 0.92);
    journalBg.fillRoundedRect(journalX - btnW / 2, btnY - btnH / 2, btnW, btnH, 5);
    journalBg.lineStyle(1.5, 0x6e5233, 0.9);
    journalBg.strokeRoundedRect(journalX - btnW / 2, btnY - btnH / 2, btnW, btnH, 5);
    journalBg.lineStyle(1, 0x9c774b, 0.35);
    journalBg.strokeRoundedRect(journalX - btnW / 2 + 1, btnY - btnH / 2 + 1, btnW - 2, btnH - 2, 4);

    // 4 đinh tán đồng
    journalBg.fillStyle(0xb89058, 0.9);
    journalBg.fillRect(journalX - btnW / 2 + 2, btnY - btnH / 2 + 2, 2, 2);
    journalBg.fillRect(journalX + btnW / 2 - 4, btnY - btnH / 2 + 2, 2, 2);
    journalBg.fillRect(journalX - btnW / 2 + 2, btnY + btnH / 2 - 4, 2, 2);
    journalBg.fillRect(journalX + btnW / 2 - 4, btnY + btnH / 2 - 4, 2, 2);

    const journalLabel = HDTextHelper.createText(this, journalX, btnY, '📖 [J] Sổ Tay', {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#f5eedc',
      stroke: '#0c0805',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);

    const journalHit = this.add.zone(journalX, btnY, btnW, btnH).setInteractive({ useHandCursor: true });
    journalHit.on('pointerdown', () => {
      this.selectQuickSlot(6);
      this.toggleJournal();
    });
    journalHit.on('pointerover', () => {
      journalBg.clear();
      journalBg.fillStyle(0x281d13, 0.98);
      journalBg.fillRoundedRect(journalX - btnW / 2, btnY - btnH / 2, btnW, btnH, 5);
      journalBg.lineStyle(1.5, 0xf1c40f, 1.0);
      journalBg.strokeRoundedRect(journalX - btnW / 2, btnY - btnH / 2, btnW, btnH, 5);
    });
    journalHit.on('pointerout', () => {
      journalBg.clear();
      journalBg.fillStyle(0x18110b, 0.92);
      journalBg.fillRoundedRect(journalX - btnW / 2, btnY - btnH / 2, btnW, btnH, 5);
      journalBg.lineStyle(1.5, 0x6e5233, 0.9);
      journalBg.strokeRoundedRect(journalX - btnW / 2, btnY - btnH / 2, btnW, btnH, 5);
      journalBg.lineStyle(1, 0x9c774b, 0.35);
      journalBg.strokeRoundedRect(journalX - btnW / 2 + 1, btnY - btnH / 2 + 1, btnW - 2, btnH - 2, 4);
    });

    this.quickActionButtonsContainer.add([
      craftBg, craftLabel, craftHit,
      journalBg, journalLabel, journalHit
    ]);
  }

  public selectQuickSlot(index: number): void {
    if (index < 0 || index >= this.quickSlotRefs.length) return;
    this.selectedQuickSlotIndex = index;
    this.redrawQuickSlotHighlights();
  }

  public redrawQuickSlotHighlights(): void {
    if (!this.slotHighlightGraphics || this.quickSlotRefs.length === 0) return;
    const g = this.slotHighlightGraphics;
    g.clear();
    const activeSlot = this.quickSlotRefs[this.selectedQuickSlotIndex];
    if (!activeSlot) return;

    const btnW = 98;
    const btnH = 36;
    const x = activeSlot.x;

    // Viền kép ánh sáng hổ phách nổi bật ô đang được chọn theo thẩm mỹ V1.4
    g.lineStyle(2, 0xf39c12, 1);
    g.strokeRoundedRect(x - btnW / 2 - 2, -btnH / 2 - 2, btnW + 4, btnH + 4, 6);
    g.lineStyle(1, 0xffe082, 0.85);
    g.strokeRoundedRect(x - btnW / 2, -btnH / 2, btnW, btnH, 5);

    // Ánh sáng nổi hổ phách mờ
    g.fillStyle(0xf39c12, 0.22);
    g.fillRoundedRect(x - btnW / 2, -btnH / 2, btnW, btnH, 5);

    // Điểm nhấn 4 góc nẹp đồng vàng sáng
    g.fillStyle(0xfff3d1, 1);
    g.fillRect(x - btnW / 2 - 1, -btnH / 2 - 1, 3, 3);
    g.fillRect(x + btnW / 2 - 2, -btnH / 2 - 1, 3, 3);
    g.fillRect(x - btnW / 2 - 1, btnH / 2 - 2, 3, 3);
    g.fillRect(x + btnW / 2 - 2, btnH / 2 - 2, 3, 3);
  }

  public update(time: number = 0, _delta: number = 0): void {
    if (this.promptWorldTarget && this.promptContainer && this.promptContainer.alpha > 0) {
      this.updatePromptPosition();
    }
    this.updatePanicVignette(time);
  }

  /**
   * C4-13-18: Cập nhật hiệu ứng viền tối/rung nhấp nháy hoảng loạn khi Bình Tâm < 20 và chạm 0/100
   */
  private updatePanicVignette(time: number = 0): void {
    if (!this.panicVignetteGraphics || !this.playerState) return;

    const stats = this.playerState.stats;
    const composure = stats.composure;
    const isLanternOn = stats.isLanternOn;

    // C4-132-07: Cảnh báo khi Bình Tâm giảm xuống dưới 40/100 trong bóng tối (đèn tắt)
    if (composure < 40 && !isLanternOn && composure > 0) {
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      if (now - this.lastDarknessWarningTime > 8000) {
        this.lastDarknessWarningTime = now;
        this.showPopupMessage('Bóng tối đang bào mòn tâm trí! Nhấn [F] để thắp sáng Đèn Lồng!');
      }
    }

    if (composure >= 20 && (composure >= 40 || isLanternOn)) {
      if (this.isPanicVignetteActive) {
        this.panicVignetteGraphics.clear();
        this.isPanicVignetteActive = false;
      }
      return;
    }

    this.isPanicVignetteActive = true;
    this.panicVignetteGraphics.clear();

    const isDepleted = composure <= 0;
    const freq = isDepleted ? 0.007 : 0.0035;
    const baseAlpha = isDepleted ? 0.38 : (composure < 20 ? 0.16 : 0.10);
    const pulse = baseAlpha + (isDepleted ? 0.20 : 0.08) * Math.sin(time * freq);

    const w = 1280;
    const h = 720;
    const thick = isDepleted ? 52 : (composure < 20 ? 30 : 18);

    // Viền đen/tím/đỏ thẫm co giãn nhẹ ở 4 góc màn hình
    const color = isDepleted ? 0x3d0b16 : (composure < 20 ? 0x24112e : 0x160b24);
    this.panicVignetteGraphics.fillStyle(color, Math.max(0.06, pulse));
    this.panicVignetteGraphics.fillRect(0, 0, w, thick);
    this.panicVignetteGraphics.fillRect(0, h - thick, w, thick);
    this.panicVignetteGraphics.fillRect(0, thick, thick, h - thick * 2);
    this.panicVignetteGraphics.fillRect(w - thick, thick, thick, h - thick * 2);

    // Cảnh báo HUD khi chạm đáy 0/100 (định kỳ mỗi 8 giây)
    if (isDepleted) {
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      if (now - this.lastPanicWarningTime > 8000) {
        this.lastPanicWarningTime = now;
        // Hoảng loạn (Bình Tâm 0/100)! Hãy bật Đèn Lồng [F] hoặc tìm ánh lửa!
        this.showPopupMessage('HOẢNG LOẠN! Hãy bật Đèn Lồng [F] hoặc tìm ánh lửa!');
      }
    }
  }

  private updatePromptPosition(): void {
    if (!this.promptWorldTarget || !this.promptContainer) return;
    const gameScene = this.scene.get('GameScene') as any;
    if (gameScene && gameScene.cameras && gameScene.cameras.main) {
      const cam = gameScene.cameras.main;
      const sx = (this.promptWorldTarget.x - cam.worldView.x) * cam.zoom;
      const sy = (this.promptWorldTarget.y - cam.worldView.y) * cam.zoom - 36;
      // C4-12-30: Khoảng cách an toàn tránh mép màn hình, thanh chỉ số HUD trên cùng và Quickslots đáy
      this.promptContainer.setPosition(
        Phaser.Math.Clamp(sx, 180, 1100),
        Phaser.Math.Clamp(sy, 60, 620)
      );
      if (this.promptText) {
        this.promptText.setPosition(0, 0);
      }
    }
  }

  public tryConsumePoultice(): boolean {
    const now = performance.now();
    if (now - this.lastPoulticeTime < 250) return false;
    this.lastPoulticeTime = now;

    if (this.playerState.getItemCount('item_herbal_poultice') <= 0) {
      this.showPopupMessage('⚠️ Chưa có Thuốc Đắp Thảo Mộc! Hãy giã thêm bằng [Phím I].');
      return false;
    }
    // C4-12-04: Kiểm tra nếu Máu và Bình Tâm đã đầy 100% thì không tiêu hao lãng phí
    if (
      this.playerState.stats.health >= this.playerState.stats.maxHealth &&
      this.playerState.stats.composure >= this.playerState.stats.maxComposure
    ) {
      this.showPopupMessage('💚 Máu và Bình Tâm đã đầy (100%), không cần dùng Thuốc Đắp!');
      return false;
    }
    if (this.playerState.useItem('item_herbal_poultice')) {
      AudioManager.getInstance().playPoulticeHeal();
      this.showPopupMessage('✔ Đã dùng Thuốc Đắp (+40 Máu, +25 Bình Tâm)');
      const gameScene = this.scene.get('GameScene') as any;
      if (gameScene && gameScene.player && typeof gameScene.player.playUseItem === 'function') {
        gameScene.player.playUseItem();
      }
      return true;
    }
    return false;
  }

  public tryConsumeLanternOil(): boolean {
    const now = performance.now();
    if (now - this.lastOilTime < 250) return false;
    this.lastOilTime = now;

    if (this.playerState.getItemCount('item_lantern_oil') <= 0) {
      this.showPopupMessage('⚠️ Chưa có Bình Dầu Đèn! Hãy chế tạo bằng [Phím I] hoặc tại Bàn Chế Tạo.');
      return false;
    }
    // C4-12-04: Kiểm tra nếu Dầu Đèn đã đầy 100% thì không tiêu hao lãng phí
    if (this.playerState.stats.lanternOil >= this.playerState.stats.maxLanternOil) {
      this.showPopupMessage('🔥 Bình dầu đèn đã đầy (100%), không cần nạp thêm!');
      return false;
    }
    if (this.playerState.useItem('item_lantern_oil')) {
      AudioManager.getInstance().playOilRefill();
      const nowOil = Math.round(this.playerState.stats.lanternOil);
      this.showPopupMessage(`✔ Đã nạp Bình Dầu Đèn (+50 Dầu • Hiện tại: ${nowOil}%)`);
      const gameScene = this.scene.get('GameScene') as any;
      if (gameScene && gameScene.player && typeof gameScene.player.playUseItem === 'function') {
        gameScene.player.playUseItem();
      }
      return true;
    }
    return false;
  }

  public tryPlantResinFlare(): boolean {
    const gameScene = this.scene.get('GameScene') as any;
    if (gameScene && typeof gameScene.plantResinFlare === 'function') {
      return gameScene.plantResinFlare();
    }
    return false;
  }

  public updateQuickSlotCounts(): void {
    const poulticeCount = this.playerState.getItemCount('item_herbal_poultice');
    const oilCount = this.playerState.getItemCount('item_lantern_oil');
    const lureCount = this.playerState.getItemCount('item_noise_lure');

    if (this.poulticeCountText && this.lastPoulticeCount !== poulticeCount) {
      this.lastPoulticeCount = poulticeCount;
      this.poulticeCountText.setText(`x${poulticeCount}`);
      this.poulticeCountText.setColor(poulticeCount > 0 ? '#2ecc71' : '#7f8c8d');
    }
    if (this.oilCountText && this.lastOilCount !== oilCount) {
      this.lastOilCount = oilCount;
      this.oilCountText.setText(`x${oilCount}`);
      this.oilCountText.setColor(oilCount > 0 ? '#f39c12' : '#7f8c8d');
    }
    if (this.lureCountText && this.lastLureCount !== lureCount) {
      this.lastLureCount = lureCount;
      this.lureCountText.setText(`x${lureCount}`);
      this.lureCountText.setColor(lureCount > 0 ? '#e67e22' : '#7f8c8d');
    }
  }

  public updateQuestTracker(): void {
    const q = this.playerState.getCurrentQuest();
    if (q) {
      if (this.questTitleText && this.lastQuestTitle !== q.title) {
        this.lastQuestTitle = q.title;
        this.questTitleText.setText(q.title);
      }
      const activeTask = q.tasks.find(t => !t.done);
      if (this.questTrackerText) {
        const taskText = activeTask ? `☐ ${activeTask.text}` : '✔ Phân đoạn đã xong. Mở Sổ Tay [J].';
        const taskColor = activeTask ? '#ecf0f1' : '#2ecc71';
        if (this.lastQuestTaskText !== taskText) {
          this.lastQuestTaskText = taskText;
          this.questTrackerText.setText(taskText);
          this.questTrackerText.setColor(taskColor);
        }
      }
    } else {
      if (this.questTitleText && this.lastQuestTitle !== 'Chưa có nhiệm vụ mới') {
        this.lastQuestTitle = 'Chưa có nhiệm vụ mới';
        this.questTitleText.setText('Chưa có nhiệm vụ mới');
      }
      if (this.questTrackerText && this.lastQuestTaskText !== 'Tự do khám phá vùng Bellhollow...') {
        this.lastQuestTaskText = 'Tự do khám phá vùng Bellhollow...';
        this.questTrackerText.setText('Tự do khám phá vùng Bellhollow...');
        this.questTrackerText.setColor('#ecf0f1');
      }
    }
  }

  /**
   * V14-P8-02: Hoàn thiện widget Đồng Hồ Tròn 3 múi màu (DAY-NIGHT CIRCULAR CLOCK)
   * - 3 Múi màu: Ban Ngày 180s (Vàng hổ phách), Hoàng Hôn 90s (Cam hoàng hôn), Đêm Sương 90s (Xanh tím đêm)
   * - Kim đồng hồ xoay mượt theo thời gian thực (360s chu kỳ)
   * - Dòng nhãn trạng thái: "Ngày X — Mùa Sương Lạnh"
   */
  public updateTimeWidget(dayCount: number, timeOfDay: number, phase: TimePhase, _phaseProgress: number): void {
    if (!this.timeWidgetBg || !this.timeDayText || !this.timePhaseText || !this.timeClockGfx) return;

    const timeSec = Math.floor(timeOfDay);
    const dayChanged = dayCount !== this.lastRenderedDay;
    const phaseChanged = phase !== this.lastRenderedPhase;
    const timeChanged = timeSec !== this.lastRenderedTimeSec;

    if (!dayChanged && !phaseChanged && !timeChanged) return;

    this.lastRenderedDay = dayCount;
    this.lastRenderedPhase = phase;
    this.lastRenderedTimeSec = timeSec;

    const timeBoxW = 210;
    const timeBoxH = 78;
    const timeBoxX = (1260 - 340) - timeBoxW - 12; // 698
    const timeBoxY = 16;

    const cfg = TIME_CONFIG.phases[phase] || TIME_CONFIG.phases.DAY;

    // 1. Cập nhật khung nền hộp nếu đổi ngày hoặc đổi pha
    if (phaseChanged || dayChanged) {
      this.timeWidgetBg.clear();
      // Nền đen sẫm mang phong cách da & gỗ tối
      this.timeWidgetBg.fillStyle(0x080d14, 0.82);
      this.timeWidgetBg.fillRoundedRect(timeBoxX, timeBoxY, timeBoxW, timeBoxH, 6);
      this.timeWidgetBg.lineStyle(1.5, 0x8a6d3b, 0.75);
      this.timeWidgetBg.strokeRoundedRect(timeBoxX, timeBoxY, timeBoxW, timeBoxH, 6);
      this.timeWidgetBg.lineStyle(1, 0x4a3b20, 0.45);
      this.timeWidgetBg.strokeRoundedRect(timeBoxX + 2, timeBoxY + 2, timeBoxW - 4, timeBoxH - 4, 5);

      // Cập nhật nhãn trạng thái Ngày X — Mùa Sương Lạnh
      this.timeDayText.setText(`Ngày ${dayCount} — Mùa Sương Lạnh`);
      this.timePhaseText.setText(`${cfg.icon} ${cfg.vietnameseName.toUpperCase()}`);
      this.timePhaseText.setColor(cfg.colorHex);
    }

    // 2. Tính toán thời gian trôi trong pha hiện tại
    const dayDur = TIME_CONFIG.phases.DAY.duration;
    const duskDur = TIME_CONFIG.phases.DUSK.duration;
    let elapsedInPhase = timeOfDay;
    if (phase === 'DUSK') elapsedInPhase = timeOfDay - dayDur;
    else if (phase === 'NIGHT') elapsedInPhase = timeOfDay - dayDur - duskDur;

    const elM = Math.floor(elapsedInPhase / 60);
    const elS = Math.floor(elapsedInPhase % 60);
    const totM = Math.floor(cfg.duration / 60);
    const totS = Math.floor(cfg.duration % 60);
    const elStr = `${elM}:${elS < 10 ? '0' : ''}${elS}`;
    const totStr = `${totM}:${totS < 10 ? '0' : ''}${totS}`;
    this.timeTimerText.setText(`⏳ ${elStr} / ${totStr}`);

    // 3. Vẽ Mặt Đồng Hồ Tròn 3 Múi Màu (Circular 3-Wedge Clock)
    const clockCx = timeBoxX + 38;
    const clockCy = timeBoxY + 39;
    const clockR = 25;

    this.timeClockGfx.clear();

    // Nền kim loại / gỗ sẫm của mặt đồng hồ
    this.timeClockGfx.fillStyle(0x0a0f18, 0.95);
    this.timeClockGfx.fillCircle(clockCx, clockCy, clockR + 3);
    this.timeClockGfx.lineStyle(2, 0x8a6d3b, 0.9);
    this.timeClockGfx.strokeCircle(clockCx, clockCy, clockR + 3);
    this.timeClockGfx.lineStyle(1, 0x4a3b20, 0.6);
    this.timeClockGfx.strokeCircle(clockCx, clockCy, clockR + 1);

    // Múi 1: Ban Ngày (DAY — 180s = 50% = 180° = PI rad)
    // Góc: từ -PI/2 đến PI/2 (nửa bên phải từ đỉnh 12h đến đáy 6h)
    this.timeClockGfx.fillStyle(0xf1c40f, 0.85); // Vàng hổ phách
    this.timeClockGfx.beginPath();
    this.timeClockGfx.moveTo(clockCx, clockCy);
    this.timeClockGfx.arc(clockCx, clockCy, clockR, -Math.PI / 2, Math.PI / 2, false);
    this.timeClockGfx.closePath();
    this.timeClockGfx.fillPath();

    // Múi 2: Hoàng Hôn (DUSK — 90s = 25% = 90° = PI/2 rad)
    // Góc: từ PI/2 đến PI (góc phần tư dưới bên trái từ 6h đến 9h)
    this.timeClockGfx.fillStyle(0xe67e22, 0.85); // Cam hoàng hôn
    this.timeClockGfx.beginPath();
    this.timeClockGfx.moveTo(clockCx, clockCy);
    this.timeClockGfx.arc(clockCx, clockCy, clockR, Math.PI / 2, Math.PI, false);
    this.timeClockGfx.closePath();
    this.timeClockGfx.fillPath();

    // Múi 3: Đêm Sương (NIGHT — 90s = 25% = 90° = PI/2 rad)
    // Góc: từ PI đến 3PI/2 (góc phần tư trên bên trái từ 9h đến 12h)
    this.timeClockGfx.fillStyle(0x5b4a8e, 0.85); // Xanh tím đêm
    this.timeClockGfx.beginPath();
    this.timeClockGfx.moveTo(clockCx, clockCy);
    this.timeClockGfx.arc(clockCx, clockCy, clockR, Math.PI, (3 * Math.PI) / 2, false);
    this.timeClockGfx.closePath();
    this.timeClockGfx.fillPath();

    // Vạch chia múi giờ tinh tế
    this.timeClockGfx.lineStyle(1, 0x131a16, 0.9);
    this.timeClockGfx.lineBetween(clockCx, clockCy, clockCx, clockCy - clockR); // Đỉnh 12h
    this.timeClockGfx.lineBetween(clockCx, clockCy, clockCx, clockCy + clockR); // Đáy 6h
    this.timeClockGfx.lineBetween(clockCx, clockCy, clockCx - clockR, clockCy); // Trái 9h

    // 4. Kim Đồng Hồ Xoay Mượt Theo Thời Gian Thực (Rotating Clock Hand)
    const handAngle = -Math.PI / 2 + (Math.max(0, Math.min(360, timeOfDay)) / 360) * (Math.PI * 2);
    const handLen = clockR - 4;
    const tipX = clockCx + Math.cos(handAngle) * handLen;
    const tipY = clockCy + Math.sin(handAngle) * handLen;
    const tailX = clockCx - Math.cos(handAngle) * 4;
    const tailY = clockCy - Math.sin(handAngle) * 4;

    // Thân kim đồng hồ màu vàng kim sáng
    this.timeClockGfx.lineStyle(2, 0xfff8db, 0.95);
    this.timeClockGfx.lineBetween(tailX, tailY, tipX, tipY);

    // Chốt đồng tâm (Center Brass Pin)
    this.timeClockGfx.fillStyle(0xd4af37, 1.0);
    this.timeClockGfx.fillCircle(clockCx, clockCy, 3.5);
    this.timeClockGfx.fillStyle(0x1a1a1a, 1.0);
    this.timeClockGfx.fillCircle(clockCx, clockCy, 1.5);
  }

  /**
   * V1.4: Cập nhật 2 Huy hiệu trạng thái phụ (Độ Ẩm & Thân Nhiệt)
   * Hiển thị gọn gàng bên dưới cụm chỉ số sinh tồn (không thêm thanh đo mới)
   */
  public updateStatusBadges(moisture: number, temperature: number): void {
    if (!this.moistureBadgeBg || !this.temperatureBadgeBg) return;

    const m = Math.round(moisture);
    const t = Math.round(temperature);

    if (m === this.lastRenderedMoisture && t === this.lastRenderedTemperature) return;
    this.lastRenderedMoisture = m;
    this.lastRenderedTemperature = t;

    // 1. Huy hiệu Độ Ẩm (Moisture)
    // 0–29%: DRY (Khô ráo), 30–69%: DAMP (Ẩm ướt), 70–100%: SOAKED (Ướt sũng)
    this.moistureBadgeBg.clear();
    const bX = 18;
    const bY = 104;
    const bW = 142;
    const bH = 20;

    let mLabel = `💧 Khô ráo (${m}%)`;
    let mColorHex = '#1abc9c';
    let mBgColor = 0x0f221c;
    let mBorderColor = 0x1abc9c;

    if (m >= 70) {
      mLabel = `🌊 Ướt sũng (${m}%)`;
      mColorHex = '#3498db';
      mBgColor = 0x12253a;
      mBorderColor = 0x2980b9;
    } else if (m >= 30) {
      mLabel = `💧 Ẩm ướt (${m}%)`;
      mColorHex = '#00cec9';
      mBgColor = 0x0e282a;
      mBorderColor = 0x00cec9;
    }

    this.moistureBadgeBg.fillStyle(mBgColor, 0.85);
    this.moistureBadgeBg.fillRoundedRect(bX, bY, bW, bH, 4);
    this.moistureBadgeBg.lineStyle(1, mBorderColor, 0.7);
    this.moistureBadgeBg.strokeRoundedRect(bX, bY, bW, bH, 4);

    if (this.moistureBadgeText) {
      this.moistureBadgeText.setText(mLabel);
      this.moistureBadgeText.setColor(mColorHex);
    }

    // 2. Huy hiệu Thân Nhiệt (Temperature)
    // >= 70: WARM (Ấm áp), 35–69: CHILLY (Se lạnh), <= 34: FREEZING (Lạnh cóng)
    this.temperatureBadgeBg.clear();
    const tX = 166;
    const tY = 104;
    const tW = 146;
    const tH = 20;

    let tLabel = `🔥 Ấm áp (${t}°)`;
    let tColorHex = '#f39c12';
    let tBgColor = 0x2b1c0a;
    let tBorderColor = 0xf39c12;

    if (t <= 34) {
      tLabel = `❄️ Cóng lạnh (${t}°)`;
      tColorHex = '#74b9ff';
      tBgColor = 0x0e1c2e;
      tBorderColor = 0x0984e3;
    } else if (t < 70) {
      tLabel = `🌡️ Se lạnh (${t}°)`;
      tColorHex = '#81ecec';
      tBgColor = 0x12242b;
      tBorderColor = 0x81ecec;
    }

    this.temperatureBadgeBg.fillStyle(tBgColor, 0.85);
    this.temperatureBadgeBg.fillRoundedRect(tX, tY, tW, tH, 4);
    this.temperatureBadgeBg.lineStyle(1, tBorderColor, 0.7);
    this.temperatureBadgeBg.strokeRoundedRect(tX, tY, tW, tH, 4);

    if (this.temperatureBadgeText) {
      this.temperatureBadgeText.setText(tLabel);
      this.temperatureBadgeText.setColor(tColorHex);
    }
  }

  public showZoneBanner(atmosphere: ZoneAtmosphere, force: boolean = false): void {
    const now = performance.now();
    if (!force && now - this.lastBannerShownTime < 4000 && this.lastBannerZoneTitle === atmosphere.titleVietnamese) {
      return;
    }
    this.lastBannerShownTime = now;
    this.lastBannerZoneTitle = atmosphere.titleVietnamese;

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

  public setInteractionPrompt(prompt: string | null, worldX?: number, worldY?: number, proximityAlpha: number = 1.0): void {
    if (this.isAnyModalOpen || !prompt) {
      if (this.lastPromptText !== null || (this.promptContainer && this.promptContainer.alpha > 0)) {
        this.promptWorldTarget = null;
        this.lastPromptText = null;
        this.lastPromptAlpha = 0;
        if (this.promptContainer) this.promptContainer.setAlpha(0);
        if (this.promptText) {
          this.promptText.setText('');
          this.promptText.setAlpha(0);
        }
      }
      return;
    }

    if (this.promptText && this.promptContainer && this.promptBg) {
      const clampedAlpha = Phaser.Math.Clamp(proximityAlpha, 0, 1);

      // C4-13-09: Dirty Checking - Chỉ setText và vẽ lại Graphics khi chuỗi prompt thay đổi
      if (this.lastPromptText !== prompt) {
        this.lastPromptText = prompt;
        this.promptText.setText(prompt);
        const textW = this.promptText.width;
        const textH = this.promptText.height;
        const padX = 14;
        const padY = 6;
        const pillW = textW + padX * 2;
        const pillH = textH + padY * 2;

        this.promptBg.clear();
        // Nền bán trong suốt tinh tế (alpha ~0.72) viền vàng hổ phách mảnh
        this.promptBg.fillStyle(0x090e15, 0.72);
        this.promptBg.fillRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 6);
        this.promptBg.lineStyle(1, 0xd4af37, 0.65);
        this.promptBg.strokeRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 6);
      }

      // Chỉ cập nhật alpha khi có chênh lệch đáng kể tránh ghi đè liên tục
      if (Math.abs(this.lastPromptAlpha - clampedAlpha) > 0.015) {
        this.lastPromptAlpha = clampedAlpha;
        this.promptContainer.setAlpha(clampedAlpha);
        this.promptText.setAlpha(clampedAlpha);
      }

      if (worldX !== undefined && worldY !== undefined) {
        this.promptWorldTarget = { x: worldX, y: worldY };
        this.updatePromptPosition();
      } else {
        this.promptWorldTarget = null;
        this.promptContainer.setPosition(640, 616);
      }
    }
  }

  /**
   * Ẩn/Hiện thanh phím tắt, nhãn tương tác và HUD khi hộp thoại hoặc Modal mở/đóng (PASS T13, GATE 1B, C4-13-07)
   */
  public setDialogueActive(active: boolean): void {
    const shouldShowHUD = !active && !this.isAnyModalOpen;
    this.setHUDVisible(shouldShowHUD);
    if (this.quickSlotContainer) {
      this.quickSlotContainer.setVisible(shouldShowHUD);
    }
    if (this.quickActionButtonsContainer) {
      this.quickActionButtonsContainer.setVisible(shouldShowHUD);
    }
    if (active || this.isAnyModalOpen) {
      this.setInteractionPrompt(null);
      if (this.zoneBannerContainer) {
        this.zoneBannerContainer.setAlpha(0);
      }
    } else {
      this.redrawStats();
      this.updateQuestTracker();
      this.updateQuickSlotCounts();
    }
  }

  public get isDialogueActive(): boolean {
    return !!(this.dialogueContainer && this.dialogueContainer.visible);
  }

  public get isAnyModalOpen(): boolean {
    return this.isDialogueActive ||
      (!!this.craftingModal && this.craftingModal.isOpen) ||
      (!!this.journalModal && this.journalModal.isOpen) ||
      (!!this.pauseModal && this.pauseModal.isOpen) ||
      (!!this.gameOverModal && this.gameOverModal.isOpen) ||
      (!!this.storageChestModal && this.storageChestModal.isOpen) ||
      (!!this.campfireModal && this.campfireModal.isOpen) ||
      (!!this.cauldronModal && this.cauldronModal.isOpen) ||
      (!!this.equipmentModal && this.equipmentModal.isOpen);
  }

  /**
   * C4-13-03: Kích hoạt giao diện Game Over trên UIScene, ẩn toàn bộ prompt và đóng các modal khác
   */
  public showGameOverModal(reason?: string): void {
    if (this.craftingModal && this.craftingModal.isOpen) this.craftingModal.close();
    if (this.journalModal && this.journalModal.isOpen) this.journalModal.close();
    if (this.pauseModal && this.pauseModal.isOpen) this.pauseModal.close();
    if (this.storageChestModal && this.storageChestModal.isOpen) this.storageChestModal.close();
    if (this.campfireModal && this.campfireModal.isOpen) this.campfireModal.close();
    if (this.cauldronModal && this.cauldronModal.isOpen) this.cauldronModal.close();
    if (this.equipmentModal && this.equipmentModal.isOpen) this.equipmentModal.close();
    this.hideDialogue();
    this.handleModalOpened();
    this.setInteractionPrompt(null);
    if (this.gameOverModal) {
      this.gameOverModal.open(reason);
    }
  }

  public closeGameOverModal(): void {
    if (this.gameOverModal && this.gameOverModal.isOpen) {
      this.gameOverModal.close();
    }
    this.handleModalClosed();
  }

  /**
   * Ẩn/Hiện toàn bộ các thành phần HUD (Stat card, Stat bars, Icons, Lantern status, Quest Tracker, Quickslots, Prompt)
   * Sử dụng khi mở Modal / Hộp thoại hoặc Cutscene để triệt tiêu đè chữ (C4-13-07)
   */
  public setHUDVisible(visible: boolean): void {
    if (this.statCardBg) this.statCardBg.setVisible(visible);
    if (this.playerNameText) this.playerNameText.setVisible(visible);
    if (this.statBarsGraphics) this.statBarsGraphics.setVisible(visible);
    if (this.statIconsGraphics) this.statIconsGraphics.setVisible(visible);
    for (const iconImg of this.statIconImages) {
      if (iconImg) iconImg.setVisible(visible);
    }
    if (this.healthValText) this.healthValText.setVisible(visible);
    if (this.staminaValText) this.staminaValText.setVisible(visible);
    if (this.oilValText) this.oilValText.setVisible(visible);
    if (this.composureValText) this.composureValText.setVisible(visible);
    if (this.lanternStatusBg) this.lanternStatusBg.setVisible(visible);
    if (this.lanternStatusText) this.lanternStatusText.setVisible(visible);
    if (this.questBg) this.questBg.setVisible(visible);
    if (this.questHeaderText) this.questHeaderText.setVisible(visible);
    if (this.questTitleText) this.questTitleText.setVisible(visible);
    if (this.questTrackerText) this.questTrackerText.setVisible(visible);
    if (this.quickSlotContainer) this.quickSlotContainer.setVisible(visible);
    if (this.promptContainer) this.promptContainer.setVisible(visible);
    if (this.promptText) this.promptText.setVisible(visible);
    if (this.zoneBannerContainer) this.zoneBannerContainer.setVisible(visible);
    if (this.activePopup) this.activePopup.setVisible(visible);
    // V1.4: Widget thời gian & Huy hiệu trạng thái phụ
    if (this.quickActionButtonsContainer) this.quickActionButtonsContainer.setVisible(visible);
    if (this.timeWidgetBg) this.timeWidgetBg.setVisible(visible);
    if (this.timeClockGfx) this.timeClockGfx.setVisible(visible);
    if (this.timeProgressBar) this.timeProgressBar.setVisible(visible);
    if (this.timeIconText) this.timeIconText.setVisible(visible);
    if (this.timeDayText) this.timeDayText.setVisible(visible);
    if (this.timePhaseText) this.timePhaseText.setVisible(visible);
    if (this.timeTimerText) this.timeTimerText.setVisible(visible);
    if (this.moistureBadgeBg) this.moistureBadgeBg.setVisible(visible);
    if (this.moistureBadgeText) this.moistureBadgeText.setVisible(visible);
    if (this.temperatureBadgeBg) this.temperatureBadgeBg.setVisible(visible);
    if (this.temperatureBadgeText) this.temperatureBadgeText.setVisible(visible);
  }

  public handleModalOpened(): void {
    this.setHUDVisible(false);
    this.setDialogueActive(true);
  }

  public handleModalClosed(): void {
    if (!this.isAnyModalOpen) {
      this.setDialogueActive(false);
      this.setHUDVisible(true);
      this.redrawStats();
      this.updateQuestTracker();
      this.updateQuickSlotCounts();
      // C4-13-11: Luôn trả lại quyền điều khiển nhân vật sạch sẽ khi đóng bảng
      const gameScene = this.scene.get('GameScene') as any;
      if (gameScene && gameScene.player && typeof gameScene.player.resetAllInputState === 'function') {
        gameScene.player.resetAllInputState();
      }
    }
  }

  public toggleCrafting(): void {
    if (this.gameOverModal && this.gameOverModal.isOpen) return;
    if (this.isDialogueActive) {
      this.hideDialogue();
    }
    AudioManager.getInstance().playInteract();
    if (this.pauseModal && this.pauseModal.isOpen) {
      this.pauseModal.close();
    }
    if (this.journalModal && this.journalModal.isOpen) {
      this.journalModal.close();
    }
    const modal = this.getCraftingModal();
    modal.toggle();
  }

  public openCraftingBench(): void {
    if (this.gameOverModal && this.gameOverModal.isOpen) return;
    if (this.isDialogueActive) {
      this.hideDialogue();
    }
    AudioManager.getInstance().playInteract();
    if (this.pauseModal && this.pauseModal.isOpen) {
      this.pauseModal.close();
    }
    if (this.journalModal && this.journalModal.isOpen) {
      this.journalModal.close();
    }
    const modal = this.getCraftingModal();
    if (!modal.isOpen) {
      modal.open();
    }
  }

  public toggleJournal(): void {
    if (this.gameOverModal && this.gameOverModal.isOpen) return;
    if (this.isDialogueActive) {
      this.hideDialogue();
    }
    AudioManager.getInstance().playInteract();
    if (this.pauseModal && this.pauseModal.isOpen) {
      this.pauseModal.close();
    }
    if (this.craftingModal && this.craftingModal.isOpen) {
      this.craftingModal.close();
    }
    if (this.journalModal) {
      this.journalModal.toggle();
    }
  }

  public openWorldMap(): void {
    if (this.gameOverModal && this.gameOverModal.isOpen) return;
    if (this.isDialogueActive) {
      this.hideDialogue();
    }
    AudioManager.getInstance().playInteract();
    if (this.pauseModal && this.pauseModal.isOpen) {
      this.pauseModal.close();
    }
    if (this.craftingModal && this.craftingModal.isOpen) {
      this.craftingModal.close();
    }
    const modal = this.getJournalModal();
    modal.openMap();
  }

  public togglePause(): void {
    if (this.gameOverModal && this.gameOverModal.isOpen) return;
    if (this.isDialogueActive) {
      this.hideDialogue();
    }
    AudioManager.getInstance().playInteract();
    if (this.craftingModal && this.craftingModal.isOpen) {
      this.craftingModal.close();
      return;
    }
    if (this.journalModal && this.journalModal.isOpen) {
      this.journalModal.close();
      return;
    }
    if (this.pauseModal) {
      this.pauseModal.toggle();
    }
  }

  public getCraftingModal(): CraftingModal {
    if (!this.craftingModal) {
      this.craftingModal = new CraftingModal(this);
      this.craftingModal.onOpen = () => this.handleModalOpened();
      this.craftingModal.onClose = () => this.handleModalClosed();
    }
    return this.craftingModal;
  }

  public getJournalModal(): JournalModal {
    if (!this.journalModal) {
      this.journalModal = new JournalModal(this);
      this.journalModal.onOpen = () => this.handleModalOpened();
      this.journalModal.onClose = () => this.handleModalClosed();
    }
    return this.journalModal;
  }

  public getStorageChestModal(): StorageChestModal {
    if (!this.storageChestModal) {
      this.storageChestModal = new StorageChestModal(this);
      this.storageChestModal.onOpen = () => this.handleModalOpened();
      this.storageChestModal.onClose = () => this.handleModalClosed();
    }
    return this.storageChestModal;
  }

  public openStorageChest(): void {
    if (this.gameOverModal && this.gameOverModal.isOpen) return;
    if (this.pauseModal && this.pauseModal.isOpen) this.pauseModal.close();
    if (this.craftingModal && this.craftingModal.isOpen) this.craftingModal.close();
    if (this.journalModal && this.journalModal.isOpen) this.journalModal.close();
    if (this.campfireModal && this.campfireModal.isOpen) this.campfireModal.close();
    if (this.cauldronModal && this.cauldronModal.isOpen) this.cauldronModal.close();
    const modal = this.getStorageChestModal();
    modal.open();
  }

  public getCampfireModal(): CampfireModal {
    if (!this.campfireModal) {
      this.campfireModal = new CampfireModal(this);
      this.campfireModal.onOpen = () => this.handleModalOpened();
      this.campfireModal.onClose = () => this.handleModalClosed();
    }
    return this.campfireModal;
  }

  public openCampfireModal(): void {
    if (this.gameOverModal && this.gameOverModal.isOpen) return;
    if (this.pauseModal && this.pauseModal.isOpen) this.pauseModal.close();
    if (this.craftingModal && this.craftingModal.isOpen) this.craftingModal.close();
    if (this.journalModal && this.journalModal.isOpen) this.journalModal.close();
    if (this.storageChestModal && this.storageChestModal.isOpen) this.storageChestModal.close();
    if (this.cauldronModal && this.cauldronModal.isOpen) this.cauldronModal.close();
    const modal = this.getCampfireModal();
    modal.open();
  }

  public getCauldronModal(): CauldronModal {
    if (!this.cauldronModal) {
      this.cauldronModal = new CauldronModal(this);
      this.cauldronModal.onOpen = () => this.handleModalOpened();
      this.cauldronModal.onClose = () => this.handleModalClosed();
    }
    return this.cauldronModal;
  }

  public openCauldronModal(): void {
    if (this.gameOverModal && this.gameOverModal.isOpen) return;
    if (this.pauseModal && this.pauseModal.isOpen) this.pauseModal.close();
    if (this.craftingModal && this.craftingModal.isOpen) this.craftingModal.close();
    if (this.journalModal && this.journalModal.isOpen) this.journalModal.close();
    if (this.storageChestModal && this.storageChestModal.isOpen) this.storageChestModal.close();
    if (this.campfireModal && this.campfireModal.isOpen) this.campfireModal.close();
    if (this.equipmentModal && this.equipmentModal.isOpen) this.equipmentModal.close();
    const modal = this.getCauldronModal();
    modal.open();
  }

  public getEquipmentModal(): EquipmentModal {
    if (!this.equipmentModal) {
      this.equipmentModal = new EquipmentModal(this);
      this.equipmentModal.onOpen = () => this.handleModalOpened();
      this.equipmentModal.onClose = () => this.handleModalClosed();
    }
    return this.equipmentModal;
  }

  public openEquipmentModal(): void {
    if (this.gameOverModal && this.gameOverModal.isOpen) return;
    if (this.pauseModal && this.pauseModal.isOpen) this.pauseModal.close();
    if (this.craftingModal && this.craftingModal.isOpen) this.craftingModal.close();
    if (this.journalModal && this.journalModal.isOpen) this.journalModal.close();
    if (this.storageChestModal && this.storageChestModal.isOpen) this.storageChestModal.close();
    if (this.campfireModal && this.campfireModal.isOpen) this.campfireModal.close();
    if (this.cauldronModal && this.cauldronModal.isOpen) this.cauldronModal.close();
    const modal = this.getEquipmentModal();
    modal.open();
  }

  public toggleEquipment(): void {
    if (this.gameOverModal && this.gameOverModal.isOpen) return;
    const modal = this.getEquipmentModal();
    modal.toggle();
  }

  public showPopupMessage(msg: string): void {
    if (this.activePopupTween) {
      this.activePopupTween.stop();
      this.activePopupTween = undefined;
    }

    // C4-13-09: Tái sử dụng Text pooled duy nhất thay vì cấp phát mới và hủy liên tục
    if (!this.pooledPopupText) {
      this.pooledPopupText = HDTextHelper.createText(this, 640, 140, '', {
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#2ecc71',
        backgroundColor: '#0b0e14ee',
        padding: { x: 16, y: 8 },
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5, 0.5).setDepth(10000);
    }

    const popup = this.pooledPopupText;
    popup.setText(msg);
    popup.setPosition(640, 140);
    popup.setAlpha(1);
    popup.setVisible(true);

    this.activePopup = popup;

    this.activePopupTween = this.tweens.add({
      targets: popup,
      y: 110,
      alpha: 0,
      duration: 2200,
      ease: 'Power2',
      onComplete: () => {
        popup.setVisible(false);
        if (this.activePopup === popup) {
          this.activePopup = undefined;
          this.activePopupTween = undefined;
        }
      }
    });
  }

  /**
   * Dựng khung hộp thoại chuẩn HD 1280×720 đặt tại (640, 590) kích thước 1060×185 px (GATE 1A)
   */
  private buildDialogueUI(): void {
    if (this.dialogueContainer) return;

    const boxWidth = 1060;
    const boxHeight = 185;
    const halfW = boxWidth / 2;
    const halfH = boxHeight / 2;

    this.dialogueContainer = this.add.container(640, 590);
    this.dialogueContainer.setDepth(9000);

    // Nền hộp thoại màu đá đen trung cổ viền vàng mộc sang trọng
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0e14, 0.96);
    bg.fillRoundedRect(-halfW, -halfH, boxWidth, boxHeight, 10);
    bg.lineStyle(2, 0xd4af37, 1);
    bg.strokeRoundedRect(-halfW, -halfH, boxWidth, boxHeight, 10);

    // Viền lót bên trong tăng chiều sâu mỹ thuật
    bg.lineStyle(1, 0x4a3b22, 0.7);
    bg.strokeRoundedRect(-halfW + 4, -halfH + 4, boxWidth - 8, boxHeight - 8, 8);

    // Hỗ trợ click chuột trực tiếp lên hộp thoại để tiếp tục
    bg.setInteractive(
      new Phaser.Geom.Rectangle(-halfW, -halfH, boxWidth, boxHeight),
      Phaser.Geom.Rectangle.Contains
    );
    if (bg.input) {
      bg.input.cursor = 'pointer';
    }
    bg.on('pointerdown', () => {
      if (this.dialogueAdvanceHandler) {
        this.dialogueAdvanceHandler();
      }
    });

    // Khung chân dung bên trái (140×140 px, căn giữa theo trục Y: -70 đến +70)
    const portraitBg = this.add.graphics();
    portraitBg.fillStyle(0x151b24, 1);
    portraitBg.fillRoundedRect(-halfW + 24, -70, 140, 140, 8);
    portraitBg.lineStyle(2, 0xb8860b, 1);
    portraitBg.strokeRoundedRect(-halfW + 24, -70, 140, 140, 8);

    // Chân dung người nói (Tâm tại x = -halfW + 94, y = 0, kích thước hiển thị 124×124 px)
    this.dialoguePortraitSprite = this.add.image(-halfW + 94, 0, 'satyr_portrait');
    this.dialoguePortraitSprite.setDisplaySize(124, 124);

    // Tên người nói chuẩn HD Tiếng Việt (Cỡ 24px, dịch phải 18px & padding 14px chống cắt lẹm nét chữ C4-13-14 / C4-132-07)
    // padding: { left: 12, right: 12, top: 6, bottom: 6 }
    this.dialogueSpeakerText = HDTextHelper.createText(this, -halfW + 202, -halfH + 20, '', {
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#f39c12',
      stroke: '#000000',
      strokeThickness: 3,
      padding: { left: 14, right: 14, top: 8, bottom: 8 }
    });

    // Nội dung câu thoại chuẩn HD Tiếng Việt (Cỡ đúng chuẩn 20px, dịch phải 18px, padding 14px, wrap 810 px)
    // padding: { left: 12, right: 12, top: 6, bottom: 6 }
    this.dialogueContentText = HDTextHelper.createText(this, -halfW + 202, -halfH + 60, '', {
      fontSize: '20px',
      color: '#f8f9fa',
      wordWrap: { width: boxWidth - 250 },
      lineSpacing: 8,
      stroke: '#000000',
      strokeThickness: 1,
      padding: { left: 14, right: 14, top: 8, bottom: 8 }
    });

    // Lời nhắc tiếp tục chuẩn HD Tiếng Việt
    this.dialogueContinuePrompt = HDTextHelper.createText(this, halfW - 25, halfH - 25, '▶ [E / SPACE]', {
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#bdc3c7'
    }).setOrigin(1, 0.5);

    this.dialogueContainer.add([
      bg,
      portraitBg,
      this.dialoguePortraitSprite,
      this.dialogueSpeakerText,
      this.dialogueContentText,
      this.dialogueContinuePrompt
    ]);

    this.dialogueContainer.setVisible(false);

    // Hiệu ứng nhấp nháy chữ Tiếp tục
    this.tweens.add({
      targets: this.dialogueContinuePrompt,
      alpha: 0.35,
      duration: 600,
      yoyo: true,
      repeat: -1
    });
  }

  public showDialogue(speaker: string, portraitKey: string): void {
    if (!this.dialogueContainer) {
      this.buildDialogueUI();
    }

    if (this.dialogueSpeakerText) {
      this.dialogueSpeakerText.setText(speaker);
    }

    if (this.dialoguePortraitSprite) {
      let key = portraitKey;
      if (!key || !this.textures.exists(key)) {
        if (speaker.includes('Edda')) key = 'portrait_edda';
        else if (speaker.includes('Garth')) key = 'portrait_garth';
        else if (speaker.includes('Neris')) key = 'portrait_neris';
        else if (speaker.includes('Bram') || speaker.includes('Thợ Rèn') || speaker.includes('Blacksmith')) {
          key = this.textures.exists('portrait_blacksmith') ? 'portrait_blacksmith' : 'portrait_bram';
        }
        else if (speaker.includes('Finn')) key = 'portrait_finn';
        else if (this.textures.exists('wayfarer_portrait')) key = 'wayfarer_portrait';
        else key = 'satyr_portrait';
      }
      if (this.textures.exists(key)) {
        this.dialoguePortraitSprite.setTexture(key);
        this.dialoguePortraitSprite.setDisplaySize(124, 124);
        this.dialoguePortraitSprite.setVisible(true);
      } else {
        this.dialoguePortraitSprite.setVisible(false);
      }
    }

    if (this.dialogueContentText) {
      this.dialogueContentText.setText('');
    }

    this.setDialogueActive(true);
    if (this.dialogueContainer) {
      this.dialogueContainer.setVisible(true);
    }
  }

  public updateDialogueText(text: string): void {
    if (this.dialogueContentText) {
      this.dialogueContentText.setText(text);
    }
  }

  public hideDialogue(): void {
    if (this.dialogueContainer) {
      this.dialogueContainer.setVisible(false);
    }
    this.setDialogueActive(false);
  }

  public setAdvanceHandler(handler: () => void): void {
    this.dialogueAdvanceHandler = handler;
  }

  // ===========================================================================
  // V1.4 - P6: THANH ĐỘ ỔN ĐỊNH PHONG ẤN (BOSS SEAL PROGRESS BAR)
  // ===========================================================================
  private buildBossSealBar(): void {
    this.bossSealContainer = this.add.container(640, 42);
    this.bossSealContainer.setDepth(8600);
    this.bossSealContainer.setAlpha(0);
    this.bossSealContainer.setVisible(false);

    this.bossSealBg = this.add.graphics();
    this.bossSealContainer.add(this.bossSealBg);

    this.bossSealTitleText = HDTextHelper.createText(this, 0, -10, '᛭ PHONG ẤN MẠCH RỄ — KẺ NUỐT TIẾNG CHUÔNG ᛭', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#d4af37',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);
    this.bossSealContainer.add(this.bossSealTitleText);

    this.bossSealNodes = [];
    const nodeOffsets = [-150, 0, 150];
    const defaultLabels = ['[ 🔒 ᚱ ANH NĂNG CỔ ]', '[ 🔒 ᚦ ĐỊA MẠCH RỄ ]', '[ 🔒 ᛉ BẢO HỘ CHUÔNG ]'];
    for (let i = 0; i < 3; i++) {
      const nodeText = HDTextHelper.createText(this, nodeOffsets[i], 8, defaultLabels[i], {
        fontSize: '10.5px',
        color: '#7f8c8d',
        stroke: '#000000',
        strokeThickness: 1
      }).setOrigin(0.5, 0.5);
      this.bossSealNodes.push(nodeText);
      this.bossSealContainer.add(nodeText);
    }
  }

  public showBossSealBar(title: string = 'PHONG ẤN MẠCH RỄ — KẺ NUỐT TIẾNG CHUÔNG', currentProgress: number = 0, maxProgress: number = 3): void {
    if (!this.bossSealContainer) return;
    this.bossSealTitleText.setText(`᛭ ${title.toUpperCase()} ᛭`);
    this.updateBossSealBar(currentProgress, maxProgress);
    this.bossSealContainer.setVisible(true);
    this.tweens.add({
      targets: this.bossSealContainer,
      alpha: 1,
      duration: 400
    });
  }

  public updateBossSealBar(progress: number, _maxProgress: number = 3): void {
    if (!this.bossSealContainer || !this.bossSealBg) return;
    this.bossSealBg.clear();

    // Nền thanh gỗ sẫm cổ kính và đồng xỉn
    this.bossSealBg.fillStyle(0x120e0a, 0.94);
    this.bossSealBg.fillRoundedRect(-240, -22, 480, 44, 8);
    this.bossSealBg.lineStyle(2, 0xd4af37, 0.95);
    this.bossSealBg.strokeRoundedRect(-240, -22, 480, 44, 8);

    const labels = [
      'ᚱ ANH NĂNG CỔ',
      'ᚦ ĐỊA MẠCH RỄ',
      'ᛉ BẢO HỘ CHUÔNG'
    ];

    const startX = -150;
    const spacing = 150;

    for (let i = 0; i < 3; i++) {
      const isSealed = i < progress;
      const nodeX = startX + i * spacing;
      const nodeText = this.bossSealNodes[i];
      if (nodeText) {
        nodeText.setText(isSealed ? `[ 🌟 ${labels[i]} ]` : `[ 🔒 ${labels[i]} ]`);
        nodeText.setColor(isSealed ? '#00d2d3' : '#7f8c8d');
        nodeText.setFontStyle(isSealed ? 'bold' : 'normal');
      }

      // Vòng tròn ấn rực sáng
      if (isSealed) {
        this.bossSealBg.fillStyle(0x00d2d3, 0.25);
        this.bossSealBg.fillCircle(nodeX, 8, 14);
        this.bossSealBg.lineStyle(1.5, 0x00d2d3, 0.85);
        this.bossSealBg.strokeCircle(nodeX, 8, 14);
      } else {
        this.bossSealBg.fillStyle(0x222222, 0.5);
        this.bossSealBg.fillCircle(nodeX, 8, 12);
        this.bossSealBg.lineStyle(1, 0x555555, 0.5);
        this.bossSealBg.strokeCircle(nodeX, 8, 12);
      }
    }
  }

  public hideBossSealBar(): void {
    if (!this.bossSealContainer) return;
    this.tweens.add({
      targets: this.bossSealContainer,
      alpha: 0,
      duration: 600,
      onComplete: () => {
        this.bossSealContainer.setVisible(false);
      }
    });
  }
}
