import { isVillageSanctuary } from '../world/ZoneSafety';
import * as Phaser from 'phaser';
import { PlayerState } from '../state/PlayerState';
import { ZoneAtmosphere, ZoneData, TransitionZone } from '../types';
import { HDTextHelper } from '../utils/HDTextHelper';
import { IDialogueView } from '../systems/DialogueSystem';
import { CraftingModal } from '../ui/CraftingModal';
import { JournalModal } from '../ui/JournalModal';
import { PauseModal } from '../ui/PauseModal';
import { GameOverModal } from '../ui/GameOverModal';
import { SubmitScoreParams } from '../services/LeaderboardService';
import { StorageChestModal } from '../ui/StorageChestModal';
import { CampfireModal } from '../ui/CampfireModal';
import { CauldronModal } from '../ui/CauldronModal';
import { EquipmentModal } from '../ui/EquipmentModal';
import { MiniMapWidget } from '../ui/MiniMapWidget';
import { ParchmentWorldMapModal } from '../ui/ParchmentWorldMapModal';
import { TornPageModal } from '../ui/TornPageModal';
import { TornPageEntry } from '../data/tornPagesData';
import { AudioManager } from '../audio/AudioManager';
import { HUDIconGenerator, HUD_ICON_HEALTH, HUD_ICON_STAMINA, HUD_ICON_COMPOSURE, HUD_ICON_WOOD } from '../utils/HUDIconGenerator';
import { TimePhase, TIME_CONFIG } from '../config/TimeConfig';
import itemsData from '../data/items.json';
import { EquipmentSystem } from '../systems/EquipmentSystem';
import { EquipmentSlot } from '../types';
import { ItemTooltipHelper } from '../ui/ItemTooltipHelper';
import { ItemIconHelper } from '../utils/ItemIconHelper';
import { QuickCraftSidebar } from '../ui/QuickCraftSidebar';
import { CampSanctuarySystem } from '../systems/CampSanctuarySystem';
import { QuestSystem } from '../systems/QuestSystem';
import { SettingsManager } from '../systems/SettingsManager';
import { lerpColor } from '../systems/TimeSystem';
import type { GameScene } from './GameScene';

const RUNNING_LABELS = {
  normal: { text: 'Bình thường', color: '#C8CFC2' },
  sprinting: { text: 'Đang chạy', color: '#E8DFC8' },
  low_stamina: { text: 'Sắp hụt sức', color: '#feca57' },
  exhausted: { text: 'Hồi sức', color: '#ff9f75' },
} as const;
const DIALOGUE_BOTTOM = 685;
const DIALOGUE_HEIGHT = 240;

export interface QuickSlotRef {
  id: string;
  key: string;
  bg: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics;
  label: Phaser.GameObjects.Text;
  x: number;
}

export class UIScene extends Phaser.Scene implements IDialogueView {
  private playerState!: PlayerState;
  private hudVisible = true;

  // Khung nền chỉ số sinh tồn bán trong suốt (C4-13-07, cache texture Image thay vì Graphics)
  private statCardBg!: Phaser.GameObjects.Image;
  private statCardSprite?: Phaser.GameObjects.Image;

  // Tiêu đề nhân vật góc trên trái
  private playerNameText!: Phaser.GameObjects.Text;

  // Đồ họa 4 thanh chỉ số pixel và nhãn số lượng
  private statBarsGraphics!: Phaser.GameObjects.Graphics;
  private statIconImages: Phaser.GameObjects.Image[] = [];
  private healthValText!: Phaser.GameObjects.Text;
  private staminaValText!: Phaser.GameObjects.Text;
  private runningStateText!: Phaser.GameObjects.Text;
  private oilValText!: Phaser.GameObjects.Text;
  private composureValText!: Phaser.GameObjects.Text;
  private lanternStatusBg!: Phaser.GameObjects.Image;
  private lanternStatusText!: Phaser.GameObjects.Text;

  // Banner phân khu
  private zoneBannerContainer!: Phaser.GameObjects.Container;
  private zoneBannerBg!: Phaser.GameObjects.Graphics;
  private zoneTitleText!: Phaser.GameObjects.Text;
  private zoneSubtitleText!: Phaser.GameObjects.Text;
  // C4-13-19 & BUG-028: Bộ đệm thời gian chống nháy banner phân khu và hàng chờ chuyển vùng
  private lastBannerShownTime: number = 0;
  private lastBannerZoneTitle: string = '';
  private zoneBannerTween?: Phaser.Tweens.Tween;
  private pendingBannerTimer?: Phaser.Time.TimerEvent;

  // Bảng nhiệm vụ góc trên phải
  private questBg!: Phaser.GameObjects.Image;
  private questBgSprite?: Phaser.GameObjects.Image;
  private questHeaderText!: Phaser.GameObjects.Text;
  private questTitleText!: Phaser.GameObjects.Text;
  private questTrackerText!: Phaser.GameObjects.Text;

  // V1.4: Widget Thời gian & Chu kỳ Ngày / Đêm thế giới
  private timeWidgetBg!: Phaser.GameObjects.Image;
  private timeClockDialImg?: Phaser.GameObjects.Image;
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
  private moistureBadgeBg!: Phaser.GameObjects.Image;
  private moistureBadgeText!: Phaser.GameObjects.Text;
  private temperatureBadgeBg!: Phaser.GameObjects.Image;
  private temperatureBadgeText!: Phaser.GameObjects.Text;

  // V15-29: Thông báo Debug góc màn hình
  private debugToastContainer?: Phaser.GameObjects.Container;
  private debugToastBg?: Phaser.GameObjects.Graphics;
  private debugToastText?: Phaser.GameObjects.Text;
  private debugToastTween?: Phaser.Tweens.Tween;
  private lastRenderedMoisture: number = -1;
  private lastRenderedTemperature: number = -1;

  // Thanh vật phẩm nhanh (Quick Slot)
  private quickSlotContainer!: Phaser.GameObjects.Container;
  private quickSlotRefs: QuickSlotRef[] = [];
  public selectedQuickSlotIndex: number = 0;
  private slotHighlightImg?: Phaser.GameObjects.Image;
  public poulticeCountBadge?: Phaser.GameObjects.Graphics;
  public poulticeCountText?: Phaser.GameObjects.Text;
  public oilCountBadge?: Phaser.GameObjects.Graphics;
  public oilCountText?: Phaser.GameObjects.Text;
  public lureCountBadge?: Phaser.GameObjects.Graphics;
  public lureCountText?: Phaser.GameObjects.Text;
  public emergencyCountBadge?: Phaser.GameObjects.Graphics;
  public emergencyCountText?: Phaser.GameObjects.Text;
  public lastEmergencyCount: number = -1;
  public lastEmergencyTime: number = 0;

  // V15-50: Quản lý 8 ô Túi Đồ & 4 ô Trang Bị ở đáy màn hình (Don't Starve Style)
  private inventorySlotData: Array<{ itemId: string | null; count: number }> = [];
  private inventorySlotGfx: Phaser.GameObjects.Image[] = [];
  private inventorySlotBaseImages: Phaser.GameObjects.Image[] = [];
  private inventorySlotIcons: Phaser.GameObjects.Text[] = [];
  private inventorySlotImages: Phaser.GameObjects.Image[] = [];
  private inventorySlotCounts: Phaser.GameObjects.Text[] = [];
  private inventorySlotKeyTexts: Phaser.GameObjects.Text[] = [];
  private inventorySlotZones: Phaser.GameObjects.Zone[] = [];

  private equipmentSlotGfx: Record<string, Phaser.GameObjects.Image> = {};
  private equipmentSlotBaseImages: Record<string, Phaser.GameObjects.Image> = {};
  private equipmentSlotDefaultIcons: Record<string, Phaser.GameObjects.Image> = {};
  private equipmentSlotIcons: Record<string, Phaser.GameObjects.Text> = {};
  private equipmentSlotZones: Record<string, Phaser.GameObjects.Zone> = {};

  // V15-50: Taskbar Biểu Tượng Dọc mép trái màn hình
  public verticalTaskbarContainer!: Phaser.GameObjects.Container;
  private verticalTaskbarBg!: Phaser.GameObjects.Image;
  private taskbarButtonGfx: Phaser.GameObjects.Image[] = [];
  private taskbarButtonsData: Array<{ id: string; g: Phaser.GameObjects.Image; btnY: number; btnSize: number; title: string; shortcut: string; desc: string }> = [];
  private taskbarLanternGlow?: Phaser.GameObjects.Image;
  private taskbarLanternIcon?: Phaser.GameObjects.Text;
  private taskbarTooltipContainer?: Phaser.GameObjects.Container;
  private bottomTooltipContainer?: Phaser.GameObjects.Container;
  // V15-50A: Thanh Ghim Nhanh Dọc (Pinned Pages Quick Craft Sidebar)
  public quickCraftSidebar?: QuickCraftSidebar;

  // Thu gọn / Mở rộng bảng nhiệm vụ góc trên phải (V15-24)
  public isQuestCollapsed: boolean = false;
  private questToggleBtn?: Phaser.GameObjects.Text;
  private questToggleZone?: Phaser.GameObjects.Zone;

  // V152-06A: Huy hiệu tên khu vực nhỏ gọn dưới khung Nhiệm Vụ thay thế Mini-map
  public zoneBadgeContainer?: Phaser.GameObjects.Container;
  private zoneBadgeBg?: Phaser.GameObjects.Image;
  private zoneBadgeText?: Phaser.GameObjects.Text;
  private zoneBadgeMapBtn?: Phaser.GameObjects.Text;
  private lastZoneBadgeName: string = '';
  private lastPanicRenderKey: string = '';

  // Lời nhắc tương tác bán trong suốt (C4-13-07)
  private promptContainer!: Phaser.GameObjects.Container;
  private promptBg!: Phaser.GameObjects.Graphics;
  private promptText!: Phaser.GameObjects.Text;
  private promptWorldTarget: { x: number; y: number } | null = null;

  // Khung hộp thoại chuẩn HD 1280×720 (GATE 1A - Presentation in UIScene at Zoom 1.0)
  private dialogueContainer!: Phaser.GameObjects.Container;
  private dialogueSpeakerText!: Phaser.GameObjects.Text;
  private dialogueSpeakerTitleText?: Phaser.GameObjects.Text;
  private dialogueSpeakerBadgeGfx?: Phaser.GameObjects.Graphics;
  private dialogueNameDivider?: Phaser.GameObjects.Graphics;
  private dialogueContentText!: Phaser.GameObjects.Text;
  private dialogueContinuePrompt!: Phaser.GameObjects.Text;
  private dialoguePortraitSprite!: Phaser.GameObjects.Image;
  private dialogueAdvanceHandler?: () => void;
  // V1.5 - V15-16: Hộp hiển thị Lựa Chọn Hội Thoại Tương Tác
  private dialogueChoicesContainer?: Phaser.GameObjects.Container;

  // Quản lý Modal tập trung (GATE 1B & 1C - Screen Space at Zoom 1.0)
  public craftingModal!: CraftingModal;
  public journalModal!: JournalModal;
  public pauseModal!: PauseModal;
  public gameOverModal!: GameOverModal;
  public storageChestModal!: StorageChestModal;
  public campfireModal!: CampfireModal;
  public cauldronModal!: CauldronModal;
  public equipmentModal!: EquipmentModal;
  public miniMapWidget!: MiniMapWidget;
  public parchmentWorldMapModal!: ParchmentWorldMapModal;
  public tornPageModal!: TornPageModal;
  public lastModalCloseTime: number = 0;

  // V1.4 - P6: Thanh Độ Ổn Định Phong Ấn (Boss Seal Bar)
  private bossSealContainer!: Phaser.GameObjects.Container;
  private bossSealTitleText!: Phaser.GameObjects.Text;
  private bossSealBg!: Phaser.GameObjects.Graphics;
  private bossSealNodes: Phaser.GameObjects.Text[] = [];

  // Bộ nhớ đệm đồ họa chỉ số (Dirty Checking Cache - GATE 3B)
  private lastHealthW: number = -1;
  private lastStaminaW: number = -1;
  private lastComposureW: number = -1;
  private lastLanternState: boolean | null = null;

  // C4-13-09: Bộ nhớ đệm kiểm tra thay đổi nhãn văn bản (Text Canvas Dirty Checking)
  private lastCurH: number = -1;
  private lastMaxH: number = -1;
  private lastCurS: number = -1;
  private lastMaxS: number = -1;
  private lastCurC: number = -1;
  private lastMaxC: number = -1;
  private lastQuestTitle: string = '';
  private lastQuestTaskText: string = '';
  public lastPoulticeCount: number = -1;
  public lastOilCount: number = -1;
  public lastLureCount: number = -1;

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
  private redDangerGraphics!: Phaser.GameObjects.Graphics;
  private activeRedDangerTween?: Phaser.Tweens.Tween;
  private activePanicFadeTween?: Phaser.Tweens.Tween;
  private sanctuaryGlowGraphics?: Phaser.GameObjects.Graphics;
  private isPanicVignetteActive: boolean = false;
  private lastPanicWarningTime: number = 0;
  private lastDarknessWarningTime: number = 0;

  // C4-132-07: Lớp phủ hướng dẫn khi iframe mất Focus
  private focusOverlayContainer?: Phaser.GameObjects.Container;
  private boundWindowBlur?: () => void;
  private boundWindowFocus?: () => void;

  // V15-44: Chống debounce kích hoạt đúp cho World Map
  private lastWorldMapToggleTime: number = 0;

  public get paperNoteModal(): TornPageModal | null {
    return this.tornPageModal;
  }

  constructor() {
    super({ key: 'UIScene' });
  }

  private ensureBakedUITexture(
    key: string,
    width: number,
    height: number,
    draw: (g: Phaser.GameObjects.Graphics, pad: number) => void,
    pad: number = 2
  ): string {
    if (!this.textures.exists(key)) {
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      draw(g, pad);
      g.generateTexture(key, Math.ceil(width + pad * 2), Math.ceil(height + pad * 2));
      g.destroy();
      if (this.textures.exists(key)) {
        this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
      }
    }
    return key;
  }

  public create(): void {
    this.hudVisible = true;
    // Đảm bảo Camera UI luôn hiển thị ở tỉ lệ chuẩn zoom = 1.0 không bị phóng to
    this.cameras.main.setZoom(1.0);

    this.playerState = PlayerState.getInstance();

    // C4-13-18: Hiệu ứng viền tối/đỏ hoảng loạn khi Bình Tâm cạn kiệt (depth: 900)
    this.panicVignetteGraphics = this.add.graphics();
    this.panicVignetteGraphics.setDepth(900);
    this.panicVignetteGraphics.setScrollFactor(0);

    // V1.5.3 (BUG-023 FIX): Lớp đồ họa cảnh báo nguy hiểm độc lập (depth: 901) tránh xung đột vẽ với panicVignette
    this.redDangerGraphics = this.add.graphics();
    this.redDangerGraphics.setDepth(901);
    this.redDangerGraphics.setScrollFactor(0);

    // C4-14-B04: Viền hào quang vàng ấm áp khi trở về Sanctuary làng an toàn (depth: 895)
    this.sanctuaryGlowGraphics = this.add.graphics();
    this.sanctuaryGlowGraphics.setDepth(895);
    this.sanctuaryGlowGraphics.setScrollFactor(0);

    // 1. Khung chứa 3 thanh chỉ số sinh tồn tinh gọn chuẩn V15-54, gỗ tối viền đồng xỉn
    if (this.textures.exists('ui_pack_panel_hud')) {
      this.statCardSprite = this.add.image(202, 50, 'ui_pack_panel_hud');
      this.statCardSprite.setDisplaySize(376, 80);
      this.statCardSprite.setDepth(8049);
      this.statCardSprite.setTint(0x7a6042);
      this.statCardSprite.setAlpha(0.65);
    }

    const statCardTexKey = this.ensureBakedUITexture('ui_hw_stat_card_bg_v1', 376, 80, (g, pad) => {
      g.fillStyle(0x140f0c, 0.88);
      g.fillRoundedRect(pad, pad, 376, 80, 6);
      g.lineStyle(1.5, 0x6e5228, 0.85);
      g.strokeRoundedRect(pad, pad, 376, 80, 6);
      g.lineStyle(1, 0x8c6d3b, 0.35);
      g.strokeRoundedRect(pad + 2, pad + 2, 372, 76, 5);
      // 4 đinh tán đồng ở góc khung chính
      g.fillStyle(0xb89058, 0.85);
      g.fillRect(pad + 3, pad + 3, 2, 2);
      g.fillRect(pad + 373, pad + 3, 2, 2);
      g.fillRect(pad + 3, pad + 77, 2, 2);
      g.fillRect(pad + 373, pad + 77, 2, 2);
    });
    this.statCardBg = this.add.image(202, 50, statCardTexKey).setDepth(8050);

    // Tên nhân vật chính hiển thị góc trên trái (V14-P8-15B: Đồng bộ theo memoryAwakeningStage)
    const isAwakened = (this.playerState.memoryAwakeningStage >= 3);
    this.playerNameText = HDTextHelper.createText(this, 26, 15, isAwakened ? '⚔️ Hiệp Sĩ Đen (Black Knight)' : '🌲 The Mossbound Wayfarer', {
      fontSize: '11.5px',
      fontStyle: 'bold',
      color: isAwakened ? '#ffc048' : '#e5a93c',
      stroke: isAwakened ? '#3d1a04' : '#000000',
      strokeThickness: isAwakened ? 3 : 2
    }).setDepth(8053);

    this.statBarsGraphics = this.add.graphics();
    this.statBarsGraphics.setDepth(8051);

    // 1b. Dựng 3 icon pixel cho 3 chỉ số (Góc trên trái chuẩn HD 1280×720)
    this.drawPixelIcons();

    // 1c. Bổ sung các nhãn số liệu rõ nét cho 3 thanh chỉ số sinh tồn (Căn lề chuẩn x: 228)
    this.healthValText = HDTextHelper.createText(this, 228, 32, 'Sinh Lực: 100/100', {
      fontSize: '11.5px',
      fontStyle: 'bold',
      color: '#ff7675',
      stroke: '#000000',
      strokeThickness: 1
    }).setDepth(8053);

    this.staminaValText = HDTextHelper.createText(this, 228, 48, 'Thể Lực: 100/100', {
      fontSize: '11.5px',
      fontStyle: 'bold',
      color: '#feca57',
      stroke: '#000000',
      strokeThickness: 1
    }).setDepth(8053);

    this.runningStateText = HDTextHelper.createText(this, 377, 15, RUNNING_LABELS.normal.text, {
      fontSize: '11.5px',
      fontStyle: 'bold',
      color: RUNNING_LABELS.normal.color
    }).setOrigin(1, 0).setDepth(8053);

    this.oilValText = HDTextHelper.createText(this, -999, -999, '', {
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#ff9f43',
      stroke: '#000000',
      strokeThickness: 2
    }).setVisible(false).setDepth(8053);

    this.composureValText = HDTextHelper.createText(this, 228, 64, 'Tinh Thần: 100/100', {
      fontSize: '11.5px',
      fontStyle: 'bold',
      color: '#a29bfe',
      stroke: '#000000',
      strokeThickness: 1
    }).setDepth(8053);

    // 2. Hàng phụ bên dưới khung chính (y: 98, h: 22): Hào quang [F] + Độ Ẩm + Thân Nhiệt (V15-54)
    const lanternOffKey = this.ensureBakedUITexture('ui_hw_lantern_off_v1', 96, 22, (g, pad) => {
      g.fillStyle(0x13110e, 0.85);
      g.fillRoundedRect(pad, pad, 96, 22, 4);
      g.lineStyle(1, 0x6e5832, 0.75);
      g.strokeRoundedRect(pad, pad, 96, 22, 4);
    });
    this.lanternStatusBg = this.add.image(14 + 48, 98 + 11, lanternOffKey).setDepth(8050);
    this.lanternStatusText = HDTextHelper.createText(this, 14 + 48, 98 + 11, '🌑 [F] SÁNG: TẮT', {
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#8a8275',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5).setDepth(8053);

    // Vùng bấm chuột cho nút Hào quang [F] tại hàng phụ
    const lanternHit = this.add.zone(14 + 48, 98 + 11, 96, 22).setInteractive({ useHandCursor: true });
    lanternHit.on('pointerdown', () => {
      this.selectQuickSlot(4);
      this.events.emit('ui_toggle_lantern');
    });

    const initMoistKey = this.ensureBakedUITexture('ui_hw_moist_0f221c_1abc9c_v1', 126, 22, (g, pad) => {
      g.fillStyle(0x0f221c, 0.88);
      g.fillRoundedRect(pad, pad, 126, 22, 4);
      g.lineStyle(1, 0x1abc9c, 0.75);
      g.strokeRoundedRect(pad, pad, 126, 22, 4);
    });
    this.moistureBadgeBg = this.add.image(116 + 63, 98 + 11, initMoistKey).setDepth(8050);
    this.moistureBadgeText = HDTextHelper.createText(this, 116 + 63, 98 + 11, '💧 Khô ráo (0%)', {
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#1abc9c',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5).setDepth(8053);

    const initTempKey = this.ensureBakedUITexture('ui_hw_temp_2b1c0a_f39c12_v1', 142, 22, (g, pad) => {
      g.fillStyle(0x2b1c0a, 0.88);
      g.fillRoundedRect(pad, pad, 142, 22, 4);
      g.lineStyle(1, 0xf39c12, 0.75);
      g.strokeRoundedRect(pad, pad, 142, 22, 4);
    });
    this.temperatureBadgeBg = this.add.image(248 + 71, 98 + 11, initTempKey).setDepth(8050);
    this.temperatureBadgeText = HDTextHelper.createText(this, 248 + 71, 98 + 11, '🔥 Ấm áp (80°)', {
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#f39c12',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5).setDepth(8053);

    this.updateStatusBadges(0, 80);

    // 3. Khung bảng theo dõi nhiệm vụ góc trên phải gỗ tối viền đồng xỉn (V15-24: Có thể thu gọn/mở rộng)
    const questBoxW = 340;
    const questBoxX = 1260 - questBoxW; // 920
    const questBoxY = 16;

    const initQuestKey = this.ensureBakedUITexture(`ui_hw_quest_bg_${questBoxW}x86_v1`, questBoxW, 86, (g, pad) => {
      g.fillStyle(0x0e1118, 0.85);
      g.fillRoundedRect(pad, pad, questBoxW, 86, 6);
      g.lineStyle(1.5, 0x6e5228, 0.85);
      g.strokeRoundedRect(pad, pad, questBoxW, 86, 6);
      g.lineStyle(1, 0x8a6d3b, 0.3);
      g.strokeRoundedRect(pad + 2, pad + 2, questBoxW - 4, 82, 5);
      g.fillStyle(0xc68a2e, 0.75);
      g.fillRect(pad, pad + 4, 3.5, 78);
    });
    this.questBg = this.add.image(questBoxX - 2, questBoxY - 2, initQuestKey).setOrigin(0, 0).setDepth(8000);

    this.questHeaderText = HDTextHelper.createText(this, questBoxX + 12, questBoxY + 8, '📜 NHIỆM VỤ HIỆN TẠI [J]:', {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#e5a93c',
      stroke: '#0c0805',
      strokeThickness: 2
    }).setDepth(8002);

    this.questTitleText = HDTextHelper.createText(this, questBoxX + 12, questBoxY + 26, '', {
      fontSize: '12.5px',
      fontStyle: 'bold',
      color: '#f5eedc',
      wordWrap: { width: questBoxW - 32, useAdvancedWrap: true },
      maxLines: 2,
      stroke: '#0c0805',
      strokeThickness: 2
    }).setDepth(8002);

    this.questTrackerText = HDTextHelper.createText(this, questBoxX + 12, questBoxY + 45, '', {
      fontSize: '12px',
      color: '#d8cfbe',
      wordWrap: { width: questBoxW - 32, useAdvancedWrap: true },
      maxLines: 6,
      lineSpacing: 3,
      stroke: '#0c0805',
      strokeThickness: 1
    }).setDepth(8002);

    this.questToggleBtn = HDTextHelper.createText(this, questBoxX + questBoxW - 18, questBoxY + 12, '▲', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#baa892',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5).setDepth(8002);

    this.questToggleZone = this.add.zone(questBoxX + questBoxW / 2, questBoxY + 15, questBoxW, 30).setInteractive({ useHandCursor: true });
    this.questToggleZone.on('pointerdown', () => {
      this.toggleQuestCollapse();
    });

    // 3A. Huy hiệu Tên Phân Khu & Nút Mở Bản Đồ [N] (V152-06A: Thay thế hoàn toàn Mini-map góc màn hình)
    this.zoneBadgeContainer = this.add.container(questBoxX, questBoxY + 92);
    this.zoneBadgeContainer.setDepth(8000);

    const zoneBadgeTexKey = this.ensureBakedUITexture(`ui_hw_zone_badge_${questBoxW}x26_v1`, questBoxW, 26, (g, pad) => {
      g.fillStyle(0x0e1118, 0.88);
      g.fillRoundedRect(pad, pad, questBoxW, 26, 4);
      g.lineStyle(1.2, 0x6e5228, 0.85);
      g.strokeRoundedRect(pad, pad, questBoxW, 26, 4);
    });
    this.zoneBadgeBg = this.add.image(-2, -2, zoneBadgeTexKey).setOrigin(0, 0);

    this.zoneBadgeText = HDTextHelper.createText(this, 12, 13, '🧭 Làng Bellhollow', {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#f5eedc',
      stroke: '#080503',
      strokeThickness: 2
    }).setOrigin(0, 0.5);

    this.zoneBadgeMapBtn = HDTextHelper.createText(this, questBoxW - 12, 13, '🗺️ [N] Bản Đồ', {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#f1c40f',
      stroke: '#080503',
      strokeThickness: 2
    }).setOrigin(1, 0.5);

    const zoneBadgeHit = this.add.zone(questBoxW - 45, 13, 90, 24).setInteractive({ useHandCursor: true });
    zoneBadgeHit.on('pointerdown', () => {
      this.toggleWorldMap();
    });

    this.zoneBadgeContainer.add([this.zoneBadgeBg, this.zoneBadgeText, this.zoneBadgeMapBtn, zoneBadgeHit]);

    this.redrawQuestBox();

    // 3B. V1.4 - P8 & V15-48: Widget Đồng Hồ Tròn 3 Múi Thời Gian (DAY-NIGHT CIRCULAR CLOCK)
    // Dời timeBoxX sang 668px để mép phải giữ 912px (cách Quest box 8px, chứa trọn nhãn Ngày 1 — Mùa Sương Lạnh)
    const timeBoxX = 668;
    const timeBoxY = 16;

    const timeBgTexKey = this.ensureBakedUITexture('ui_hw_time_bg_244x78_v1', 244, 78, (g, pad) => {
      g.fillStyle(0x080d14, 0.82);
      g.fillRoundedRect(pad, pad, 244, 78, 6);
      g.lineStyle(1.5, 0x8a6d3b, 0.75);
      g.strokeRoundedRect(pad, pad, 244, 78, 6);
      g.lineStyle(1, 0x4a3b20, 0.45);
      g.strokeRoundedRect(pad + 2, pad + 2, 240, 74, 5);
    });
    this.timeWidgetBg = this.add.image(timeBoxX + 122, timeBoxY + 39, timeBgTexKey).setDepth(8000);

    const clockR = 25;
    const dialTexSize = (clockR + 4) * 2 + 4; // 62x62
    const dialCx = dialTexSize / 2;
    const dialCy = dialTexSize / 2;
    const dialTexKey = this.ensureBakedUITexture('ui_hw_clock_dial_v1', dialTexSize, dialTexSize, (g) => {
      g.fillStyle(0x0a0f18, 0.95);
      g.fillCircle(dialCx, dialCy, clockR + 3);
      g.lineStyle(2, 0x8a6d3b, 0.9);
      g.strokeCircle(dialCx, dialCy, clockR + 3);
      g.lineStyle(1, 0x4a3b20, 0.6);
      g.strokeCircle(dialCx, dialCy, clockR + 1);
      g.fillStyle(0xf1c40f, 0.85);
      g.beginPath();
      g.moveTo(dialCx, dialCy);
      g.arc(dialCx, dialCy, clockR, -Math.PI / 2, Math.PI / 2, false);
      g.closePath();
      g.fillPath();
      g.fillStyle(0xe67e22, 0.85);
      g.beginPath();
      g.moveTo(dialCx, dialCy);
      g.arc(dialCx, dialCy, clockR, Math.PI / 2, Math.PI, false);
      g.closePath();
      g.fillPath();
      g.fillStyle(0x5b4a8e, 0.85);
      g.beginPath();
      g.moveTo(dialCx, dialCy);
      g.arc(dialCx, dialCy, clockR, Math.PI, (3 * Math.PI) / 2, false);
      g.closePath();
      g.fillPath();
      g.lineStyle(1, 0x131a16, 0.9);
      g.lineBetween(dialCx, dialCy, dialCx, dialCy - clockR);
      g.lineBetween(dialCx, dialCy, dialCx, dialCy + clockR);
      g.lineBetween(dialCx, dialCy, dialCx - clockR, dialCy);
    }, 0);
    this.timeClockDialImg = this.add.image(timeBoxX + 38, timeBoxY + 39, dialTexKey).setDepth(8001);

    this.timeClockGfx = this.add.graphics();
    this.timeClockGfx.setDepth(8002);

    this.timeProgressBar = this.add.graphics();
    this.timeProgressBar.setDepth(8001);

    this.timeDayText = HDTextHelper.createText(this, timeBoxX + 74, timeBoxY + 12, 'Ngày 1 — Mùa Sương Lạnh', {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#f6ad55',
      stroke: '#000000',
      strokeThickness: 2,
      wordWrap: { width: 162 }
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

    // 4. Banner tên phân khu có nền gỗ tối viền đồng xỉn co giãn động (BUG-028: Tâm tại 640, 138 - hoàn toàn nằm dưới HUD đồng hồ Y:16-94 và tách biệt khỏi popup toast Y:205)
    this.zoneBannerContainer = this.add.container(640, 138);
    this.zoneBannerContainer.setDepth(8500);
    this.zoneBannerBg = this.add.graphics();

    this.zoneTitleText = HDTextHelper.createText(this, 0, -10, '', {
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#f5eedc',
      stroke: '#0f0a06',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5);

    this.zoneSubtitleText = HDTextHelper.createText(this, 0, 12, '', {
      fontSize: '13px',
      fontStyle: 'italic',
      color: '#baa892',
      wordWrap: { width: 720 },
      align: 'center'
    }).setOrigin(0.5, 0.5);

    this.zoneBannerContainer.add([this.zoneBannerBg, this.zoneTitleText, this.zoneSubtitleText]);
    this.zoneBannerContainer.setAlpha(0);

    // V1.4 - P6: Dựng Thanh Độ Ổn Định Phong Ấn tại đỉnh màn hình (640, 42)
    this.buildBossSealBar();

    // 5. Thanh vật phẩm nhanh dưới đáy màn hình đặt tại (640, 688)
    this.buildQuickSlots();
    // V15-50: Taskbar Biểu Tượng Dọc mép trái phong cách Don't Starve
    this.buildVerticalTaskbar();
    // V15-50A: Thanh Ghim Nhanh Dọc (Quick Craft Pinned Pages Bar - DST Style)
    this.quickCraftSidebar = new QuickCraftSidebar(this);
    // V14-P8-02: Cụm nút chức năng nhanh ở góc dưới bên trái HUD
    this.buildQuickActionButtons();

    // 5b. Dựng khung hộp thoại HD 1280×720 tại (640, 590) (GATE 1A)
    this.buildDialogueUI();

    // 5c. Dựng Bàn Chế Tạo & Sổ Tay & Mini-map & Bản Đồ Giấy Da & Trang Giấy Cổ chuẩn HD 1280×720 tại UIScene Zoom 1.0 (GATE 1B)
    this.getCraftingModal();
    this.getJournalModal();
    this.getMiniMapWidget();
    this.getParchmentWorldMapModal();
    this.getTornPageModal();

    // 6. Lời nhắc tương tác [E] chuẩn HD bán trong suốt (C4-13-07)
    this.promptContainer = this.add.container(640, 616);
    this.promptContainer.setDepth(8200);
    this.promptContainer.setAlpha(0);

    this.promptBg = this.add.graphics();
    this.promptContainer.add(this.promptBg);

    this.promptText = HDTextHelper.createText(this, 0, 0, '', {
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffe3a6',
      wordWrap: { width: 308, useAdvancedWrap: true },
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);
    this.promptContainer.add(this.promptText);

    // 7. Lắng nghe sự kiện từ PlayerState (dọn dẹp listener khi tắt scene để chống rò rỉ)
    const onStatsChanged = () => {
      this.redrawStats();
      this.updateTaskbarLanternState();
    };
    const onQuestChanged = () => {
      this.updateQuestTracker();
      if (this.journalModal?.isOpen) this.journalModal.refresh();
      this.parchmentWorldMapModal?.refreshTrackedQuest();
      AudioManager.getInstance().playQuestUpdate();
    };
    const onInventoryChanged = () => this.updateQuickSlotCounts();
    const onEquipmentChanged = () => this.updateBottomBarEquipment();
    const onMemoryAwakened = () => this.redrawStats();

    this.playerState.on('stats_changed', onStatsChanged);
    this.playerState.on('quest_changed', onQuestChanged);
    this.playerState.on('quest_updated', onQuestChanged);
    this.playerState.on('inventory_changed', onInventoryChanged);
    this.playerState.on('equipment_changed', onEquipmentChanged);
    this.playerState.on('memory_awakening_changed', onMemoryAwakened);

    this.events.once('shutdown', () => {
      this.playerState.off('stats_changed', onStatsChanged);
      this.playerState.off('quest_changed', onQuestChanged);
      this.playerState.off('quest_updated', onQuestChanged);
      this.playerState.off('inventory_changed', onInventoryChanged);
      this.playerState.off('equipment_changed', onEquipmentChanged);
      this.playerState.off('memory_awakening_changed', onMemoryAwakened);
      // C4-13-09: Dọn dẹp triệt để tweens, timer events và keyboard listeners khi tắt/chuyển scene
      this.tweens.killAll();
      this.time.removeAllEvents();
      if (this.input) {
        if (this.input.keyboard) this.input.keyboard.removeAllListeners();
        this.input.removeAllListeners();
      }
      if (typeof window !== 'undefined') {
        if (this.boundWindowBlur) window.removeEventListener('blur', this.boundWindowBlur);
        if (this.boundWindowFocus) window.removeEventListener('focus', this.boundWindowFocus);
      }
      if (this.focusOverlayContainer) { this.focusOverlayContainer.destroy(); this.focusOverlayContainer = undefined as any; }
      if (this.craftingModal) { this.craftingModal.destroy(); this.craftingModal = undefined as any; }
      if (this.journalModal) { this.journalModal.destroy(); this.journalModal = undefined as any; }
      if (this.pauseModal) { this.pauseModal.destroy(); this.pauseModal = undefined as any; }
      if (this.gameOverModal) { this.gameOverModal.destroy(); this.gameOverModal = undefined as any; }
      if (this.storageChestModal) { this.storageChestModal.destroy(); this.storageChestModal = undefined as any; }
      if (this.campfireModal) { this.campfireModal.destroy(); this.campfireModal = undefined as any; }
      if (this.cauldronModal) { this.cauldronModal.destroy(); this.cauldronModal = undefined as any; }
      if (this.equipmentModal) { this.equipmentModal.destroy(); this.equipmentModal = undefined as any; }
      if (this.miniMapWidget) { this.miniMapWidget.destroy(); this.miniMapWidget = undefined as any; }
      this.zoneBadgeContainer = undefined;
      this.zoneBadgeBg = undefined;
      this.zoneBadgeText = undefined;
      this.zoneBadgeMapBtn = undefined;
      if (this.parchmentWorldMapModal) { this.parchmentWorldMapModal.destroy(); this.parchmentWorldMapModal = undefined as any; }
      if (this.tornPageModal) { this.tornPageModal.destroy(); this.tornPageModal = undefined as any; }
      if (this.pooledPopupText) { this.pooledPopupText.destroy(); this.pooledPopupText = undefined as any; }
      if (this.activePanicFadeTween) { this.activePanicFadeTween.stop(); this.activePanicFadeTween = undefined; }
      if (this.panicVignetteGraphics) { this.panicVignetteGraphics.clear(); this.panicVignetteGraphics = undefined as any; }
      if (this.activeRedDangerTween) { this.activeRedDangerTween.stop(); this.activeRedDangerTween = undefined; }
      if (this.redDangerGraphics) { this.redDangerGraphics.clear(); this.redDangerGraphics = undefined as any; }
      if (this.timeWidgetBg) { this.timeWidgetBg.destroy(); this.timeWidgetBg = undefined as any; }
      if (this.timeClockDialImg) { this.timeClockDialImg.destroy(); this.timeClockDialImg = undefined; }
      if (this.timeClockGfx) { this.timeClockGfx.destroy(); this.timeClockGfx = undefined as any; }
      if (this.quickActionButtonsContainer) { this.quickActionButtonsContainer.destroy(); this.quickActionButtonsContainer = undefined as any; }
      if (this.timeProgressBar) { this.timeProgressBar.destroy(); this.timeProgressBar = undefined as any; }
      if (this.timeIconText) { this.timeIconText.destroy(); this.timeIconText = undefined as any; }
      if (this.timeDayText) { this.timeDayText.destroy(); this.timeDayText = undefined as any; }
      if (this.timePhaseText) { this.timePhaseText.destroy(); this.timePhaseText = undefined as any; }
      if (this.timeTimerText) { this.timeTimerText.destroy(); this.timeTimerText = undefined as any; }
      if (this.moistureBadgeBg) { this.moistureBadgeBg.destroy(); this.moistureBadgeBg = undefined as any; }
      if (this.moistureBadgeText) { this.moistureBadgeText.destroy(); this.moistureBadgeText = undefined as any; }
      if (this.temperatureBadgeBg) { this.temperatureBadgeBg.destroy(); this.temperatureBadgeBg = undefined as any; }
      if (this.temperatureBadgeText) { this.temperatureBadgeText.destroy(); this.temperatureBadgeText = undefined as any; }
      if (this.dialogueContainer) { this.dialogueContainer.destroy(); this.dialogueContainer = undefined as any; }
      if (this.dialogueChoicesContainer) { this.dialogueChoicesContainer.destroy(); this.dialogueChoicesContainer = undefined as any; }
      if (this.promptContainer) { this.promptContainer.destroy(); this.promptContainer = undefined as any; }
      if (this.pendingBannerTimer) { this.pendingBannerTimer.remove(); this.pendingBannerTimer = undefined; }
      if (this.zoneBannerTween) { this.zoneBannerTween.stop(); this.zoneBannerTween = undefined; }
      if (this.activePopupTween) { this.activePopupTween.stop(); this.activePopupTween = undefined; }
      if (this.zoneBannerContainer) {
        this.tweens.killTweensOf(this.zoneBannerContainer);
        this.zoneBannerContainer.destroy();
        this.zoneBannerContainer = undefined as any;
      }
      if (this.bossSealContainer) { this.bossSealContainer.destroy(); this.bossSealContainer = undefined as any; }
      if (this.quickSlotContainer) { this.quickSlotContainer.destroy(); this.quickSlotContainer = undefined as any; }
      if (this.verticalTaskbarContainer) { this.verticalTaskbarContainer.destroy(); this.verticalTaskbarContainer = undefined as any; }
      if (this.quickCraftSidebar) { this.quickCraftSidebar.destroy(); this.quickCraftSidebar = undefined; }
      if (this.taskbarTooltipContainer) { this.taskbarTooltipContainer.destroy(); this.taskbarTooltipContainer = undefined; }
      if (this.bottomTooltipContainer) { this.bottomTooltipContainer.destroy(); this.bottomTooltipContainer = undefined; }
      if (this.questToggleBtn) { this.questToggleBtn.destroy(); this.questToggleBtn = undefined as any; }
      if (this.questToggleZone) { this.questToggleZone.destroy(); this.questToggleZone = undefined as any; }
      if (this.emergencyCountBadge) { this.emergencyCountBadge.destroy(); this.emergencyCountBadge = undefined as any; }
      if (this.emergencyCountText) { this.emergencyCountText.destroy(); this.emergencyCountText = undefined as any; }
      if (this.debugToastTween) { this.debugToastTween.stop(); this.debugToastTween = undefined; }
      if (this.debugToastContainer) { this.debugToastContainer.destroy(); this.debugToastContainer = undefined; }
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

    // Lắng nghe phím số [1]..[8], [Q], [F], [C], [I], [J], [ESC] để chọn ô và thực thi nhanh (V15-50)
    if (this.input.keyboard) {
      const numKeyNames = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT'];
      for (let i = 0; i < 8; i++) {
        this.input.keyboard.on(`keydown-${numKeyNames[i]}`, () => {
          if (this.isAnyModalOpen) return;
          this.useOrSelectSlot(i);
        });
      }
      this.input.keyboard.on('keydown-Q', () => {
        if (this.isAnyModalOpen) return;
        this.selectQuickSlot(3);
        this.events.emit('ui_throw_lure');
      });
      this.input.keyboard.on('keydown-F', () => {
        if (this.isAnyModalOpen) return;
        this.selectQuickSlot(4);
        this.events.emit('ui_toggle_lantern');
      });
      // V15-44: Xử lý phím tắt toggle giao diện không bị chặn bởi isAnyModalOpen
      this.input.keyboard.on('keydown-C', () => {
        if (this.isDialogueActive) return;
        if (this.craftingModal && this.craftingModal.isOpen) {
          this.craftingModal.close();
          return;
        }
        if (this.journalModal && this.journalModal.isOpen) this.journalModal.close();
        if (this.tornPageModal && this.tornPageModal.isOpen) this.tornPageModal.close();
        this.selectQuickSlot(5);
        this.toggleCrafting();
      });
      this.input.keyboard.on('keydown-I', () => {
        if (this.isDialogueActive) return;
        if (this.craftingModal && this.craftingModal.isOpen) {
          this.craftingModal.close();
          return;
        }
        if (this.journalModal && this.journalModal.isOpen) this.journalModal.close();
        if (this.tornPageModal && this.tornPageModal.isOpen) this.tornPageModal.close();
        this.selectQuickSlot(5);
        this.toggleCrafting();
      });
      this.input.keyboard.on('keydown-J', () => {
        if (this.isDialogueActive) return;
        if (this.journalModal && this.journalModal.isOpen) {
          this.journalModal.close();
          return;
        }
        if (this.craftingModal && this.craftingModal.isOpen) this.craftingModal.close();
        if (this.tornPageModal && this.tornPageModal.isOpen) this.tornPageModal.close();
        this.selectQuickSlot(6);
        this.toggleJournal();
      });
      this.input.keyboard.on('keydown-ESC', () => {
        this.handleESC();
      });
      this.input.keyboard.on('keydown-B', () => {
        if (this.gameOverModal && this.gameOverModal.isOpen) return;
        this.toggleEquipment();
      });
      this.input.keyboard.on('keydown-N', () => {
        this.toggleMiniMap();
      });
      this.input.keyboard.on('keydown-M', () => {
        this.toggleWorldMap();
      });
    }
  }

  private drawPixelIcons(): void {
    // C4-13-15: Đảm bảo các texture Pixel Art 16×16 px chuẩn Nearest-Neighbor đã được tạo
    HUDIconGenerator.generateAllHUDIcons(this);
    // V15-FIX-08: Pre-bake toàn bộ texture khung ô UI cho QuickCraft & CraftingModal
    HUDIconGenerator.generateUIFrameTextures(this);

    // Khởi tạo/cập nhật 3 Sprite Image độc lập từ các Texture Pixel Art 16×16 px (Depth 8052)
    if (this.statIconImages.length === 0) {
      const heartIcon = this.add.image(26, 37, HUD_ICON_HEALTH).setDisplaySize(16, 16).setOrigin(0.5, 0.5).setDepth(8052);
      const staminaIcon = this.add.image(26, 53, HUD_ICON_STAMINA).setDisplaySize(16, 16).setOrigin(0.5, 0.5).setDepth(8052);
      const composureIcon = this.add.image(26, 69, HUD_ICON_COMPOSURE).setDisplaySize(16, 16).setOrigin(0.5, 0.5).setDepth(8052);

      this.statIconImages = [heartIcon, staminaIcon, composureIcon];
    }
  }

  public redrawStats(): void {
    const stats = this.playerState.stats;
    const barX = 42;
    const barWidth = 175;

    const healthW = Math.round(Math.max(0, Math.min(barWidth, (stats.health / stats.maxHealth) * barWidth)));
    const staminaW = Math.round(Math.max(0, Math.min(barWidth, (stats.stamina / stats.maxStamina) * barWidth)));
    const composureW = Math.round(Math.max(0, Math.min(barWidth, (stats.composure / stats.maxComposure) * barWidth)));

    const isBarsDirty =
      healthW !== this.lastHealthW ||
      staminaW !== this.lastStaminaW ||
      composureW !== this.lastComposureW;

    if (isBarsDirty) {
      this.lastHealthW = healthW;
      this.lastStaminaW = staminaW;
      this.lastComposureW = composureW;

      const g = this.statBarsGraphics;
      g.clear();

      // 1. Thanh Máu (Đỏ 3D, Cao 10px, chuyển màu mượt khi tụt/hồi)
      const hRatio = stats.health / stats.maxHealth;
      let hDark = 0x8b1e16;
      let hLight = 0xe74c3c;
      if (hRatio <= 0.25) {
        hDark = 0x5a100d;
        hLight = 0xc0392b;
      } else if (hRatio <= 0.5) {
        hDark = 0x935116;
        hLight = 0xe67e22;
      }
      this.drawThickBar(g, barX, 32, barWidth, 10, stats.health, stats.maxHealth, hDark, hLight);

      // 2. Thanh Thể Lực (Vàng Hoàng Kim 3D, Cao 9px)
      const sRatio = stats.stamina / stats.maxStamina;
      let sDark = 0xb7950b;
      let sLight = 0xf1c40f;
      if (sRatio <= 0.3) {
        sDark = 0x7d6608;
        sLight = 0xd4ac0d;
      }
      this.drawThickBar(g, barX, 48, barWidth, 9, stats.stamina, stats.maxStamina, sDark, sLight);

      // 3. Thanh Tinh Thần (Tím Thạch Anh / Tím Xanh 3D, Cao 9px - V15-54)
      const cRatio = stats.composure / stats.maxComposure;
      let cDark = 0x4a235a;
      let cLight = 0x9b59b6;
      if (cRatio <= 0.2) {
        cDark = 0x2c1038;
        cLight = 0xe74c3c;
      } else if (cRatio <= 0.5) {
        cDark = 0x3d1c4b;
        cLight = 0x8e44ad;
      }
      this.drawThickBar(g, barX, 64, barWidth, 9, stats.composure, stats.maxComposure, cDark, cLight);
    }

    // C4-13-09: Tối ưu Dirty-Checking cho các chỉ số HUD - chỉ set text và màu khi giá trị số thay đổi
    const curH = Math.round(stats.health);
    const maxH = Math.round(stats.maxHealth);
    if (this.healthValText && (this.lastCurH !== curH || this.lastMaxH !== maxH)) {
      this.lastCurH = curH;
      this.lastMaxH = maxH;
      this.healthValText.setText(`Sinh Lực: ${curH}/${maxH}`);
      this.healthValText.setColor(curH <= maxH * 0.3 ? '#ff4757' : '#ff7675');
      this.healthValText.setPosition(228, 32);
    }

    const curS = Math.round(stats.stamina);
    const maxS = Math.round(stats.maxStamina);
    if (this.staminaValText && (this.lastCurS !== curS || this.lastMaxS !== maxS)) {
      this.lastCurS = curS;
      this.lastMaxS = maxS;
      this.staminaValText.setText(`Thể Lực: ${curS}/${maxS}`);
      this.staminaValText.setPosition(228, 48);
    }
    const runningState = (this.scene.get('GameScene') as GameScene | null)?.getRunningState() ?? 'normal';
    const runningLabel = RUNNING_LABELS[runningState];
    if (this.runningStateText && this.runningStateText.text !== runningLabel.text) {
      this.runningStateText.setText(runningLabel.text).setColor(runningLabel.color);
    }

    const curC = Math.round(stats.composure);
    const maxC = Math.round(stats.maxComposure);
    if (this.composureValText && (this.lastCurC !== curC || this.lastMaxC !== maxC)) {
      this.lastCurC = curC;
      this.lastMaxC = maxC;
      this.composureValText.setText(`Tinh Thần: ${curC}/${maxC}`);
      this.composureValText.setColor(curC <= 0 ? '#ff3838' : curC <= maxC * 0.3 ? '#fd79a8' : '#a29bfe');
      this.composureValText.setPosition(228, 64);
    }

    // Cập nhật trạng thái hào quang sáng tại Hàng phụ dưới khung chính (x: 14, y: 98, w: 96, h: 22)
    const isLit = Boolean(stats.isLanternOn && stats.stamina >= 5);
    if (this.lastLanternState !== isLit) {
      this.lastLanternState = isLit;
      if (this.lanternStatusBg && this.lanternStatusText) {
        const badgeX = 14;
        const badgeY = 98;
        const badgeW = 96;
        const badgeH = 22;
        if (isLit) {
          const litKey = this.ensureBakedUITexture('ui_hw_lantern_lit_v1', badgeW, badgeH, (g, pad) => {
            g.fillStyle(0x241808, 0.94);
            g.fillRoundedRect(pad, pad, badgeW, badgeH, 4);
            g.lineStyle(1.5, 0xe5a93c, 0.95);
            g.strokeRoundedRect(pad, pad, badgeW, badgeH, 4);
          });
          this.lanternStatusBg.setTexture(litKey);
          this.lanternStatusText.setText('✨ [F] SÁNG: BẬT');
          this.lanternStatusText.setColor('#ffdc73');
        } else {
          const offKey = this.ensureBakedUITexture('ui_hw_lantern_off_v1', badgeW, badgeH, (g, pad) => {
            g.fillStyle(0x13110e, 0.85);
            g.fillRoundedRect(pad, pad, badgeW, badgeH, 4);
            g.lineStyle(1, 0x6e5832, 0.75);
            g.strokeRoundedRect(pad, pad, badgeW, badgeH, 4);
          });
          this.lanternStatusBg.setTexture(offKey);
          this.lanternStatusText.setText('🌑 [F] SÁNG: TẮT');
          this.lanternStatusText.setColor('#8a8275');
        }
        this.lanternStatusText.setPosition(badgeX + badgeW / 2, badgeY + badgeH / 2);
        this.lanternStatusText.setOrigin(0.5, 0.5);
      }
    }

    // V1.4: Cập nhật 2 huy hiệu trạng thái phụ (Độ Ẩm & Thân Nhiệt)
    this.updateStatusBadges(stats.moisture ?? 0, stats.temperature ?? 80);

    // V14-P8-15B: Cập nhật danh hiệu người chơi khi thức tỉnh ký ức (Giai đoạn 3: Hiệp Sĩ Đen)
    if (this.playerNameText) {
      if (this.playerState.memoryAwakeningStage >= 3) {
        const title = '⚔️ Hiệp Sĩ Đen (Black Knight)';
        if (this.playerNameText.text !== title) {
          this.playerNameText.setText(title);
          this.playerNameText.setColor('#ffc048');
          this.playerNameText.setStroke('#3d1a04', 3);
        }
      } else {
        const title = '🌲 The Mossbound Wayfarer';
        if (this.playerNameText.text !== title) {
          this.playerNameText.setText(title);
          this.playerNameText.setColor('#e5a93c');
          this.playerNameText.setStroke('#000000', 2);
        }
      }
    }
  }

  private drawThickBar(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, val: number, max: number, darkColor: number, lightColor: number): void {
    // Nền rãnh thanh tối chuẩn HD Pixel Art (V152-06A: Hiển thị 100% sắc nét ổn định)
    g.fillStyle(0x0a0d14, 0.95);
    g.fillRect(x - 2, y - 2, w + 4, h + 4);
    g.lineStyle(1, 0x3d4a5d, 0.9);
    g.strokeRect(x - 2.5, y - 2.5, w + 5, h + 5);

    const safeMax = Math.max(1, max);
    const safeVal = Math.max(0, Math.min(safeMax, val));
    const fillW = Math.round((safeVal / safeMax) * w);

    if (fillW > 0) {
      // Thân thanh màu sắc nét
      g.fillStyle(darkColor, 1);
      g.fillRect(x, y, fillW, h);
      // Ánh sáng nổi 3D ở mép trên
      g.fillStyle(lightColor, 0.9);
      g.fillRect(x, y, fillW, Math.max(2, Math.floor(h * 0.35)));
    }
  }

  private buildQuickSlots(): void {
    // V15-50: Đặt Thanh Túi Đồ & Trang Bị Đáy tại (x: 640, y: 688) cân đối chuẩn HD 1280×720 với depth 8000
    this.quickSlotContainer = this.add.container(640, 688);
    this.quickSlotContainer.setDepth(8000);

    const totalW = 574;
    const totalH = 52;

    // 1. Nền khung gỗ tối viền đồng cổ bao trọn toàn bộ thanh đáy (Don't Starve Pixel Art)
    if (this.textures.exists('ui_pack_hotbar_bg')) {
      const hotbarBgImg = this.add.image(0, 0, 'ui_pack_hotbar_bg');
      hotbarBgImg.setDisplaySize(totalW + 16, totalH + 12);
      hotbarBgImg.setTint(0xbaa187);
      hotbarBgImg.setAlpha(0.65);
      this.quickSlotContainer.add(hotbarBgImg);
    }

    // 1. Nền khung gỗ tối viền đồng cổ + Vách ngăn chạm khắc (cache 1 Image duy nhất thay vì 2 Graphics)
    const hotbarFrameKey = this.ensureBakedUITexture('ui_hw_hotbar_frame_v1', totalW, totalH, (g, pad) => {
      const cx = totalW / 2 + pad;
      const cy = totalH / 2 + pad;
      g.fillStyle(0x140e09, 0.94);
      g.fillRoundedRect(pad, pad, totalW, totalH, 6);
      g.lineStyle(1.5, 0x5c4224, 0.9);
      g.strokeRoundedRect(pad, pad, totalW, totalH, 6);
      g.lineStyle(1, 0x8c6d3b, 0.35);
      g.strokeRoundedRect(pad + 1.5, pad + 1.5, totalW - 3, totalH - 3, 5);

      // 4 đinh tán đồng ở 4 góc khung chính
      g.fillStyle(0xb89058, 0.9);
      g.fillRect(pad + 3, pad + 3, 2, 2);
      g.fillRect(pad + totalW - 5, pad + 3, 2, 2);
      g.fillRect(pad + 3, pad + totalH - 5, 2, 2);
      g.fillRect(pad + totalW - 5, pad + totalH - 5, 2, 2);

      // Vách gỗ chạm khắc phân cách cụm Túi Đồ & Trang Bị (relative x = 88..96)
      g.fillStyle(0x2d1e12, 0.95);
      g.fillRoundedRect(cx + 88, cy - 20, 8, 40, 2);
      g.lineStyle(1.2, 0x5c4224, 0.9);
      g.strokeRoundedRect(cx + 88, cy - 20, 8, 40, 2);
      g.lineStyle(1.5, 0x8a6d3b, 0.85);
      g.lineBetween(cx + 92, cy - 18, cx + 92, cy + 18);
      g.lineBetween(cx + 102, cy - 14, cx + 102, cy + 14);
      g.fillStyle(0xd4af37, 0.95);
      g.fillCircle(cx + 92, cy, 2.5);
      g.fillStyle(0xb89058, 0.9);
      g.fillRect(cx + 90, cy - 18, 4, 2);
      g.fillRect(cx + 90, cy + 16, 4, 2);
    });
    const frameImg = this.add.image(0, 0, hotbarFrameKey);
    this.quickSlotContainer.add(frameImg);

    const hlKey = this.ensureBakedUITexture('ui_hw_slot_highlight_v1', 46, 46, (g, pad) => {
      const btnW = 42;
      const btnH = 42;
      const cx = 23 + pad;
      const cy = 23 + pad;
      g.lineStyle(2, 0xf39c12, 1);
      g.strokeRoundedRect(cx - btnW / 2 - 2, cy - btnH / 2 - 2, btnW + 4, btnH + 4, 6);
      g.lineStyle(1, 0xffe082, 0.85);
      g.strokeRoundedRect(cx - btnW / 2, cy - btnH / 2, btnW, btnH, 5);
      g.fillStyle(0xf39c12, 0.22);
      g.fillRoundedRect(cx - btnW / 2, cy - btnH / 2, btnW, btnH, 5);
      g.fillStyle(0xfff3d1, 1);
      g.fillRect(cx - btnW / 2 - 1, cy - btnH / 2 - 1, 3, 3);
      g.fillRect(cx + btnW / 2 - 2, cy - btnH / 2 - 1, 3, 3);
      g.fillRect(cx - btnW / 2 - 1, cy + btnH / 2 - 2, 3, 3);
      g.fillRect(cx + btnW / 2 - 2, cy + btnH / 2 - 2, 3, 3);
    });
    this.slotHighlightImg = this.add.image(0, 0, hlKey).setVisible(false);
    this.quickSlotContainer.add(this.slotHighlightImg);

    this.quickSlotRefs = [];
    this.inventorySlotGfx = [];
    this.inventorySlotBaseImages = [];
    this.inventorySlotIcons = [];
    this.inventorySlotImages = [];
    this.inventorySlotCounts = [];
    this.inventorySlotKeyTexts = [];
    this.inventorySlotZones = [];

    const slotSize = 42;
    const gap = 4;
    const invStartX = -258;

    const invIdleKey = this.ensureBakedUITexture('ui_hw_inv_slot_idle_v1', slotSize, slotSize, (g, pad) => {
      g.fillStyle(0x18110b, 0.9);
      g.fillRoundedRect(pad, pad, slotSize, slotSize, 4);
      g.lineStyle(1.2, 0x4a3722, 0.85);
      g.strokeRoundedRect(pad, pad, slotSize, slotSize, 4);
      g.lineStyle(1, 0x6e5233, 0.25);
      g.strokeRoundedRect(pad + 1, pad + 1, slotSize - 2, slotSize - 2, 3);
      g.fillStyle(0xdfd3b6, 0.95);
      g.fillRoundedRect(pad + 2, pad + 2, slotSize - 4, slotSize - 4, 3);
      g.lineStyle(0.8, 0x8c7853, 0.4);
      g.strokeRoundedRect(pad + 2, pad + 2, slotSize - 4, slotSize - 4, 3);
      g.fillStyle(0x8c6d3b, 0.7);
      g.fillRect(pad + 1, pad + 1, 1.5, 1.5);
      g.fillRect(pad + slotSize - 2.5, pad + 1, 1.5, 1.5);
      g.fillRect(pad + 1, pad + slotSize - 2.5, 1.5, 1.5);
      g.fillRect(pad + slotSize - 2.5, pad + slotSize - 2.5, 1.5, 1.5);
    });
    const invHoverKey = this.ensureBakedUITexture('ui_hw_inv_slot_hover_v1', slotSize, slotSize, (g, pad) => {
      g.fillStyle(0x281d13, 0.98);
      g.fillRoundedRect(pad, pad, slotSize, slotSize, 4);
      g.lineStyle(1.8, 0xf1c40f, 0.98);
      g.strokeRoundedRect(pad, pad, slotSize, slotSize, 4);
      g.fillStyle(0xf7f0dd, 0.98);
      g.fillRoundedRect(pad + 2, pad + 2, slotSize - 4, slotSize - 4, 3);
    });

    // Khởi tạo 8 ô Túi Đồ bên trái
    for (let i = 0; i < 8; i++) {
      const slotX = invStartX + i * (slotSize + gap);

      // V152-06B: Khung ô Pixel Art thật từ UI Pack
      if (this.textures.exists('ui_pack_slot_idle')) {
        const slotBase = this.add.image(slotX, 0, 'ui_pack_slot_idle').setDisplaySize(slotSize, slotSize);
        this.quickSlotContainer.add(slotBase);
        this.inventorySlotBaseImages.push(slotBase);
      }

      const g = this.add.image(slotX, 0, invIdleKey);
      this.quickSlotContainer.add(g);
      this.inventorySlotGfx.push(g);

      // Nhãn phím tắt góc trên trái [1]..[8]
      const keyLabel = `[${i + 1}]`;
      const keyText = HDTextHelper.createText(this, slotX - slotSize / 2 + 2, -slotSize / 2 + 2, keyLabel, {
        fontSize: '9px',
        fontStyle: 'bold',
        color: '#baa892',
        stroke: '#000000',
        strokeThickness: 1.5
      });
      this.quickSlotContainer.add(keyText);
      this.inventorySlotKeyTexts.push(keyText);

      // Icon Sprite Pixel Art ở tâm (V152-06A: Chống ô vuông trắng □)
      const iconImg = this.add.image(slotX, 0, HUD_ICON_WOOD).setDisplaySize(22, 22).setOrigin(0.5, 0.5).setVisible(false);
      this.quickSlotContainer.add(iconImg);
      this.inventorySlotImages.push(iconImg);

      // Icon Text Unicode/Emoji ở tâm (dự phòng)
      const iconText = HDTextHelper.createText(this, slotX, 0, '', {
        fontSize: '18px'
      }).setOrigin(0.5, 0.5);
      this.quickSlotContainer.add(iconText);
      this.inventorySlotIcons.push(iconText);

      // Số lượng xếp chồng ở góc dưới phải (x2, x10)
      const countText = HDTextHelper.createText(this, slotX + slotSize / 2 - 2, slotSize / 2 - 2, '', {
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#f3eddc',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(1, 1);
      this.quickSlotContainer.add(countText);
      this.inventorySlotCounts.push(countText);

      // Lưu tham chiếu slot cho quickSlotRefs
      const slotId = i === 0 ? 'poultice' : (i === 1 ? 'oil' : (i === 2 ? 'emergency' : (i === 3 ? 'lure' : `slot_${i + 1}`)));
      this.quickSlotRefs.push({
        id: slotId,
        key: `[${i + 1}]`,
        bg: g,
        label: keyText,
        x: slotX
      });

      // Vùng tương tác chuột Zone
      const hitZone = this.add.zone(slotX, 0, slotSize, slotSize).setInteractive({ useHandCursor: true });
      hitZone.on('pointerdown', () => {
        this.useOrSelectSlot(i);
      });
      hitZone.on('pointerover', () => {
        if (this.inventorySlotBaseImages[i]) {
          this.inventorySlotBaseImages[i].setTexture('ui_pack_slot_hover');
        }
        g.setTexture(invHoverKey);

        const curItem = this.inventorySlotData[i];
        if (curItem && curItem.itemId) {
          ItemTooltipHelper.getInstance().show(this, 640 + slotX, 688 - 140, curItem.itemId);
        } else {
          this.showCompactBottomTooltip(640 + slotX, 688 - 60, `Ô Túi Đồ [${i + 1}]`, 'Ô đang trống', '#a0aec0');
        }
      });
      hitZone.on('pointerout', () => {
        if (this.inventorySlotBaseImages[i]) {
          this.inventorySlotBaseImages[i].setTexture(
            i === this.selectedQuickSlotIndex ? 'ui_pack_slot_selected' : 'ui_pack_slot_idle'
          );
        }
        g.setTexture(invIdleKey);

        ItemTooltipHelper.getInstance().hide();
        this.hideCompactBottomTooltip();
      });

      this.quickSlotContainer.add(hitZone);
      this.inventorySlotZones.push(hitZone);
    }

    // Gán biến tham chiếu backward compatibility
    this.poulticeCountText = this.inventorySlotCounts[0];
    this.oilCountText = this.inventorySlotCounts[1];
    this.emergencyCountText = this.inventorySlotCounts[2];
    this.lureCountText = this.inventorySlotCounts[3];

    // 3. 4 Ô Trang Bị Cá Nhân bên phải (BODY, FEET, BACK, CHARM)
    const equipSlots: Array<{ slot: EquipmentSlot; label: string; defaultIcon: string }> = [
      { slot: 'body', label: 'BODY', defaultIcon: '🧥' },
      { slot: 'feet', label: 'FEET', defaultIcon: '👢' },
      { slot: 'back', label: 'BACK', defaultIcon: '🎒' },
      { slot: 'charm', label: 'CHARM', defaultIcon: '🔔' }
    ];

    const equipStartX = 120;
    this.equipmentSlotGfx = {};
    this.equipmentSlotBaseImages = {};
    this.equipmentSlotDefaultIcons = {};
    this.equipmentSlotIcons = {};
    this.equipmentSlotZones = {};

    const eqIdleKey = this.ensureBakedUITexture('ui_hw_eq_slot_idle_v1', slotSize, slotSize, (g, pad) => {
      g.fillStyle(0x141018, 0.9);
      g.fillRoundedRect(pad, pad, slotSize, slotSize, 4);
      g.lineStyle(1.2, 0x524336, 0.85);
      g.strokeRoundedRect(pad, pad, slotSize, slotSize, 4);
    });
    const eqHoverKey = this.ensureBakedUITexture('ui_hw_eq_slot_hover_v1', slotSize, slotSize, (g, pad) => {
      g.fillStyle(0x241d28, 0.98);
      g.fillRoundedRect(pad, pad, slotSize, slotSize, 4);
      g.lineStyle(1.5, 0xf1c40f, 0.95);
      g.strokeRoundedRect(pad, pad, slotSize, slotSize, 4);
    });

    for (let i = 0; i < equipSlots.length; i++) {
      const eq = equipSlots[i];
      const slotX = equipStartX + i * (slotSize + gap);

      // V152-06B: Khung ô trang bị Pixel Art thật từ UI Pack
      if (this.textures.exists('ui_pack_slot_equip')) {
        const eqBase = this.add.image(slotX, 0, 'ui_pack_slot_equip').setDisplaySize(slotSize, slotSize);
        this.quickSlotContainer.add(eqBase);
        this.equipmentSlotBaseImages[eq.slot] = eqBase;
      }

      const g = this.add.image(slotX, 0, eqIdleKey);
      this.quickSlotContainer.add(g);
      this.equipmentSlotGfx[eq.slot] = g;

      // Nhãn loại trang bị mờ ở đỉnh ô
      const labelText = HDTextHelper.createText(this, slotX, -slotSize / 2 + 5, eq.label, {
        fontSize: '7.5px',
        fontStyle: 'bold',
        color: '#7a6855'
      }).setOrigin(0.5, 0);
      this.quickSlotContainer.add(labelText);

      // Icon trang bị ở giữa
      const iconText = HDTextHelper.createText(this, slotX, 3, eq.defaultIcon, {
        fontSize: '17px'
      }).setOrigin(0.5, 0.5);
      iconText.setAlpha(0.35);
      this.quickSlotContainer.add(iconText);
      this.equipmentSlotIcons[eq.slot] = iconText;

      // V152-06B: Icon trang bị Pixel Art thật từ UI Pack
      if (this.textures.exists(`ui_pack_equip_${eq.slot}`)) {
        const eqIcon = this.add.image(slotX, 3, `ui_pack_equip_${eq.slot}`).setDisplaySize(20, 20).setOrigin(0.5, 0.5).setAlpha(0.5);
        this.quickSlotContainer.add(eqIcon);
        this.equipmentSlotDefaultIcons[eq.slot] = eqIcon;
      }

      // Lưu tham chiếu slot
      this.quickSlotRefs.push({
        id: `equip_${eq.slot}`,
        key: eq.label,
        bg: g,
        label: labelText,
        x: slotX
      });

      // Vùng tương tác chuột
      const hitZone = this.add.zone(slotX, 0, slotSize, slotSize).setInteractive({ useHandCursor: true });
      hitZone.on('pointerdown', () => {
        AudioManager.getInstance().playInteract();
        this.toggleEquipment();
      });
      hitZone.on('pointerover', () => {
        g.setTexture(eqHoverKey);

        const equippedId = EquipmentSystem.getInstance().getEquipped(eq.slot);
        if (equippedId) {
          ItemTooltipHelper.getInstance().show(this, 640 + slotX, 688 - 140, equippedId);
        } else {
          this.showCompactBottomTooltip(
            640 + slotX,
            688 - 60,
            `Ô Trang Bị [${eq.label}]`,
            'Đang trống. Nhấp để mở Bảng Trang Bị [B]',
            '#baa892'
          );
        }
      });
      hitZone.on('pointerout', () => {
        this.updateBottomBarEquipment();
        ItemTooltipHelper.getInstance().hide();
        this.hideCompactBottomTooltip();
      });

      this.quickSlotContainer.add(hitZone);
      this.equipmentSlotZones[eq.slot] = hitZone;
    }

    this.redrawQuickSlotHighlights();
  }

  /**
   * V15-50: Taskbar Biểu Tượng Dọc mép trái màn hình (phong cách Don't Starve)
   * 6 ô biểu tượng vuông kết nối với nhau:
   * 1. [I / C] Chế Tạo (Icon búa & rìu)
   * 2. [J] Sổ Tay Lữ Khách (Icon cuốn sổ da)
   * 3. [F] Bật/Tắt Đèn Lồng (Icon đèn lồng phát sáng khi bật)
   * 4. [N] Mở Rộng La Bàn / Bản Đồ (Icon la bàn)
   * 5. [F8] Thoát Kẹt An Toàn (Icon đôi giày/mũi tên)
   * 6. [ESC] Hệ Thống & Tạm Dừng (Icon bánh răng)
   */
  private buildVerticalTaskbar(): void {
    this.verticalTaskbarContainer = this.add.container(37, 266);
    this.verticalTaskbarContainer.setDepth(8000);

    const barW = 42;
    const barH = 256;

    const btnSize = 36;
    const gap = 5;
    const startY = -barH / 2 + 6 + btnSize / 2;

    // Nền cột gỗ tối nối liền 6 ô + các khớp nối kim loại (cache 1 Image duy nhất thay vì 6 Graphics)
    const vbarTexKey = this.ensureBakedUITexture('ui_hw_vbar_frame_v1', barW, barH, (g, pad) => {
      const cx = barW / 2 + pad;
      const cy = barH / 2 + pad;
      g.fillStyle(0x140e09, 0.94);
      g.fillRoundedRect(pad, pad, barW, barH, 6);
      g.lineStyle(1.5, 0x5c4224, 0.9);
      g.strokeRoundedRect(pad, pad, barW, barH, 6);
      g.lineStyle(1, 0x8c6d3b, 0.35);
      g.strokeRoundedRect(pad + 1.5, pad + 1.5, barW - 3, barH - 3, 5);

      g.fillStyle(0xb89058, 0.9);
      g.fillRect(pad + 3, pad + 3, 2, 2);
      g.fillRect(pad + barW - 5, pad + 3, 2, 2);
      g.fillRect(pad + 3, pad + barH - 5, 2, 2);
      g.fillRect(pad + barW - 5, pad + barH - 5, 2, 2);

      for (let i = 0; i < 5; i++) {
        const btnY = startY + i * (btnSize + gap);
        const linkY = cy + btnY + btnSize / 2 + gap / 2;
        g.fillStyle(0x4a351f, 0.9);
        g.fillRect(cx - 3, linkY - 1.5, 6, 3);
        g.fillStyle(0xb89058, 0.9);
        g.fillCircle(cx, linkY, 1.2);
      }
    });
    this.verticalTaskbarBg = this.add.image(0, 0, vbarTexKey);
    this.verticalTaskbarContainer.add(this.verticalTaskbarBg);

    // 6 nút chức năng chuẩn xác
    const taskbarButtons = [
      {
        id: 'craft',
        icon: '⚒️',
        key: 'I',
        title: '🔨 [I] Chế Tạo',
        shortcut: '[I] / [C]',
        desc: 'Bàn Chế Tạo: giã thảo dược, luyện hương trầm, mồi ném và trang bị.',
        action: () => this.toggleCrafting()
      },
      {
        id: 'journal',
        icon: '📖',
        key: 'J',
        title: '📖 Sổ Tay Lữ Khách',
        shortcut: '[J]',
        desc: 'Theo dõi nhiệm vụ, mảnh ký ức thức tỉnh, sinh vật rừng và bản đồ.',
        action: () => this.toggleJournal()
      },
      {
        id: 'lantern',
        icon: '✨',
        key: 'F',
        title: '✨ Hào Quang Hộ Tâm',
        shortcut: '[F]',
        desc: 'Bật/Tắt quầng sáng ấm áp để xua tan bóng tối và bảo vệ Tinh Thần (Tiêu hao Thể Lực).',
        action: () => this.events.emit('ui_toggle_lantern')
      },
      {
        id: 'map',
        icon: '🧭',
        key: 'N',
        title: '🧭 La Bàn & Bản Đồ',
        shortcut: '[N] / [M]',
        desc: 'Mở rộng la bàn định vị hoặc bản đồ giấy da thế giới.',
        action: () => this.toggleWorldMap()
      },
      {
        id: 'unstuck',
        icon: '🥾',
        key: 'F8',
        title: '🥾 Thoát Kẹt An Toàn',
        shortcut: '[F8]',
        desc: 'Dịch chuyển khẩn cấp về vị trí an toàn gần nhất nếu bị kẹt vào vật cản.',
        action: () => {
          const gameScene = this.scene.get('GameScene') as any;
          if (gameScene && typeof gameScene.emergencyUnstuckPlayer === 'function') {
            gameScene.emergencyUnstuckPlayer();
          } else {
            this.showPopupMessage('Đang kiểm tra gỡ kẹt an toàn...');
          }
        }
      },
      {
        id: 'pause',
        icon: '⚙️',
        key: 'ESC',
        title: '⚙️ Hệ Thống & Tạm Dừng',
        shortcut: '[ESC]',
        desc: 'Tạm dừng cuộc chơi, lưu dữ liệu, điều chỉnh âm lượng và đồ họa.',
        action: () => this.togglePause()
      }
    ];

    const tbBtnIdleKey = this.ensureBakedUITexture('ui_hw_tb_btn_idle_v1', btnSize, btnSize, (g, pad) => {
      g.fillStyle(0x18110b, 0.88);
      g.fillRoundedRect(pad, pad, btnSize, btnSize, 4);
      g.lineStyle(1.2, 0x5c4224, 0.85);
      g.strokeRoundedRect(pad, pad, btnSize, btnSize, 4);
    });
    const tbBtnActiveKey = this.ensureBakedUITexture('ui_hw_tb_btn_active_v1', btnSize, btnSize, (g, pad) => {
      g.fillStyle(0x281d13, 0.98);
      g.fillRoundedRect(pad, pad, btnSize, btnSize, 4);
      g.lineStyle(1.6, 0xf1c40f, 0.98);
      g.strokeRoundedRect(pad, pad, btnSize, btnSize, 4);
    });
    const tbLanternGlowKey = this.ensureBakedUITexture('ui_hw_tb_lantern_glow_v1', btnSize, btnSize, (g, pad) => {
      g.fillStyle(0xf39c12, 0.35);
      g.fillRoundedRect(pad, pad, btnSize, btnSize, 4);
      g.lineStyle(1.5, 0xf39c12, 0.95);
      g.strokeRoundedRect(pad, pad, btnSize, btnSize, 4);
    });

    this.taskbarButtonGfx = [];
    this.taskbarButtonsData = [];

    for (let i = 0; i < taskbarButtons.length; i++) {
      const btn = taskbarButtons[i];
      const btnY = startY + i * (btnSize + gap);

      const g = this.add.image(0, btnY, tbBtnIdleKey);
      this.verticalTaskbarContainer.add(g);
      this.taskbarButtonGfx.push(g);
      this.taskbarButtonsData.push({
        id: btn.id,
        g,
        btnY,
        btnSize,
        title: btn.title,
        shortcut: btn.shortcut,
        desc: btn.desc
      });

      if (btn.id === 'lantern') {
        this.taskbarLanternGlow = this.add.image(0, btnY, tbLanternGlowKey).setVisible(false);
        this.verticalTaskbarContainer.add(this.taskbarLanternGlow);
      }

      // Icon ở giữa
      const icon = HDTextHelper.createText(this, 0, btnY, btn.icon, {
        fontSize: '16px'
      }).setOrigin(0.5, 0.5);
      this.verticalTaskbarContainer.add(icon);

      if (btn.id === 'lantern') {
        this.taskbarLanternIcon = icon;
      }

      // Nhãn phím tắt góc trên phải
      const keyLabel = HDTextHelper.createText(this, btnSize / 2 - 2, btnY - btnSize / 2 + 1, btn.key, {
        fontSize: '7.5px',
        fontStyle: 'bold',
        color: '#e5a93c',
        stroke: '#000000',
        strokeThickness: 1.5
      }).setOrigin(1, 0);
      this.verticalTaskbarContainer.add(keyLabel);

      // Vùng click & hover
      const hitZone = this.add.zone(0, btnY, btnSize, btnSize).setInteractive({ useHandCursor: true });
      hitZone.on('pointerdown', () => {
        AudioManager.getInstance().playInteract();
        btn.action();
      });
      hitZone.on('pointerover', () => {
        g.setTexture(tbBtnActiveKey);

        this.showTaskbarTooltip(62, 266 + btnY - 25, btn.title, btn.shortcut, btn.desc);
      });
      hitZone.on('pointerout', () => {
        const isActive = this.isTaskbarButtonActive(btn.id);
        g.setTexture(isActive ? tbBtnActiveKey : tbBtnIdleKey);

        this.hideTaskbarTooltip();
      });

      this.verticalTaskbarContainer.add(hitZone);
    }

    this.updateTaskbarLanternState();
    this.updateVerticalTaskbarStates();
  }

  public isTaskbarButtonActive(id: string): boolean {
    switch (id) {
      case 'craft':
        return !!this.craftingModal && this.craftingModal.isOpen;
      case 'journal':
        return !!this.journalModal && this.journalModal.isOpen;
      case 'lantern':
        return !!this.playerState?.stats?.isLanternOn;
      case 'map':
        return !!this.parchmentWorldMapModal && this.parchmentWorldMapModal.isOpen;
      case 'pause':
        return !!this.pauseModal && this.pauseModal.isOpen;
      default:
        return false;
    }
  }

  public updateVerticalTaskbarStates(): void {
    if (!this.taskbarButtonsData || this.taskbarButtonsData.length === 0) return;
    for (const b of this.taskbarButtonsData) {
      const isActive = this.isTaskbarButtonActive(b.id);
      const texKey = isActive ? 'ui_hw_tb_btn_active_v1' : 'ui_hw_tb_btn_idle_v1';
      if (b.g.texture?.key !== texKey && this.textures.exists(texKey)) {
        b.g.setTexture(texKey);
      }
    }
    this.updateTaskbarLanternState();
  }

  /**
   * Cập nhật hào quang phát sáng của Đèn Lồng [F] trên Taskbar dọc khi bật/tắt
   */
  public updateTaskbarLanternState(): void {
    if (!this.taskbarLanternGlow || !this.playerState) return;
    const isLanternOn = !!this.playerState.stats.isLanternOn;
    if (this.taskbarLanternGlow.visible !== isLanternOn) {
      this.taskbarLanternGlow.setVisible(isLanternOn);
    }
    if (isLanternOn) {
      if (this.taskbarLanternIcon) this.taskbarLanternIcon.setAlpha(1.0);
    } else {
      if (this.taskbarLanternIcon) this.taskbarLanternIcon.setAlpha(0.6);
    }
  }

  /**
   * Hiển thị Tooltip thẻ gỗ nẹp đồng cho nút Taskbar dọc mép trái
   */
  public showTaskbarTooltip(x: number, y: number, title: string, shortcut: string, desc: string): void {
    this.hideTaskbarTooltip();
    const tooltipW = 230;
    const pad = 10;

    this.taskbarTooltipContainer = this.add.container(x, y);
    this.taskbarTooltipContainer.setScrollFactor(0);
    this.taskbarTooltipContainer.setDepth(9999);

    const titleText = HDTextHelper.createText(this, pad, pad, title, {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#f1c40f',
      stroke: '#000000',
      strokeThickness: 2
    });

    const keyText = HDTextHelper.createText(this, tooltipW - pad, pad, shortcut, {
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#e67e22',
      stroke: '#000000',
      strokeThickness: 1.5
    }).setOrigin(1, 0);

    const descText = HDTextHelper.createText(this, pad, pad + 20, desc, {
      fontSize: '10.5px',
      color: '#d8cfbe',
      wordWrap: { width: tooltipW - pad * 2 },
      lineSpacing: 2
    });

    const tooltipH = pad + 20 + descText.height + pad;

    const bg = this.add.graphics();
    bg.fillStyle(0x100c08, 0.96);
    bg.fillRoundedRect(0, 0, tooltipW, tooltipH, 5);
    bg.lineStyle(1.5, 0x8c6d3b, 0.95);
    bg.strokeRoundedRect(0, 0, tooltipW, tooltipH, 5);
    bg.lineStyle(0.5, 0xd4af37, 0.4);
    bg.strokeRoundedRect(2, 2, tooltipW - 4, tooltipH - 4, 4);

    bg.fillStyle(0xb89058, 0.85);
    bg.fillRect(3, 3, 2, 2);
    bg.fillRect(tooltipW - 5, 3, 2, 2);
    bg.fillRect(3, tooltipH - 5, 2, 2);
    bg.fillRect(tooltipW - 5, tooltipH - 5, 2, 2);

    this.taskbarTooltipContainer.add([bg, titleText, keyText, descText]);
  }

  public hideTaskbarTooltip(): void {
    if (this.taskbarTooltipContainer) {
      this.taskbarTooltipContainer.destroy();
      this.taskbarTooltipContainer = undefined;
    }
  }

  /**
   * Hiển thị Tooltip thu gọn cho ô đáy màn hình khi ô trống
   */
  public showCompactBottomTooltip(screenX: number, screenY: number, title: string, subtitle: string, color: string = '#2ecc71'): void {
    this.hideCompactBottomTooltip();
    const tooltipW = 200;
    const pad = 8;

    this.bottomTooltipContainer = this.add.container(screenX - tooltipW / 2, screenY);
    this.bottomTooltipContainer.setScrollFactor(0);
    this.bottomTooltipContainer.setDepth(9999);

    const titleText = HDTextHelper.createText(this, tooltipW / 2, pad, title, {
      fontSize: '11.5px',
      fontStyle: 'bold',
      color: '#f1c40f',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0);

    const subText = HDTextHelper.createText(this, tooltipW / 2, pad + 18, subtitle, {
      fontSize: '10px',
      color: color,
      stroke: '#000000',
      strokeThickness: 1.5,
      wordWrap: { width: tooltipW - pad * 2 },
      align: 'center'
    }).setOrigin(0.5, 0);

    const tooltipH = pad + 18 + subText.height + pad;

    const bg = this.add.graphics();
    bg.fillStyle(0x100c08, 0.95);
    bg.fillRoundedRect(0, 0, tooltipW, tooltipH, 5);
    bg.lineStyle(1.2, 0x8c6d3b, 0.9);
    bg.strokeRoundedRect(0, 0, tooltipW, tooltipH, 5);

    this.bottomTooltipContainer.add([bg, titleText, subText]);
  }

  public hideCompactBottomTooltip(): void {
    if (this.bottomTooltipContainer) {
      this.bottomTooltipContainer.destroy();
      this.bottomTooltipContainer = undefined;
    }
  }

  /**
   * V15-50: Kích hoạt hoặc chọn ô Túi Đồ [1]..[8]
   */
  public useOrSelectSlot(index: number): void {
    this.selectQuickSlot(index);
    const slot = this.inventorySlotData[index];
    if (!slot || !slot.itemId) return;

    const itemId = slot.itemId;
    if (itemId === 'item_herbal_poultice') {
      this.tryConsumePoultice();
    } else if (itemId === 'item_lantern_oil') {
      this.tryConsumeLanternOil();
    } else if (itemId === 'food_calming_tea' || itemId === 'item_resin_flare') {
      this.tryUseEmergencySurvivalItem();
    } else if (itemId === 'item_noise_lure') {
      this.events.emit('ui_throw_lure');
    } else if (itemId === 'food_roasted_mushroom') {
      if (this.playerState.useItem('food_roasted_mushroom')) {
        AudioManager.getInstance().playPoulticeHeal();
        this.playerState.stats.health = Math.min(this.playerState.stats.maxHealth, this.playerState.stats.health + 15);
        this.playerState.stats.stamina = Math.min(this.playerState.stats.maxStamina, this.playerState.stats.stamina + 20);
        this.playerState.emit('stats_changed');
        this.showPopupMessage('✔ Đã ăn Nấm Nướng (+15 Máu, +20 Thể Lực)');
        this.updateQuickSlotCounts();
      }
    } else if (itemId === 'food_forest_root_soup') {
      if (this.playerState.useItem('food_forest_root_soup')) {
        AudioManager.getInstance().playPoulticeHeal();
        this.playerState.stats.health = Math.min(this.playerState.stats.maxHealth, this.playerState.stats.health + 30);
        this.playerState.stats.stamina = Math.min(this.playerState.stats.maxStamina, this.playerState.stats.stamina + 30);
        this.playerState.emit('stats_changed');
        this.showPopupMessage('✔ Đã dùng Súp Rễ Rừng (+30 Máu, +30 Thể Lực)');
        this.updateQuickSlotCounts();
      }
    } else if (itemId.startsWith('eqp_')) {
      const equipDef = EquipmentSystem.getInstance().getEquipmentDef(itemId);
      if (equipDef) {
        EquipmentSystem.getInstance().equip(equipDef.slot, itemId);
        this.showPopupMessage(`✔ Đã trang bị: ${equipDef.name}`);
        AudioManager.getInstance().playInteract();
        this.updateQuickSlotCounts();
      }
    } else {
      const meta = itemsData.items.find(i => i.id === itemId);
      const count = this.playerState.getItemCount(itemId);
      this.showPopupMessage(`📦 [${index + 1}] ${meta?.name || itemId} (x${count})`);
      AudioManager.getInstance().playUISelect();
    }
  }

  /**
   * V14-P8-02 / V15-24: Cụm nút nhanh đáy trái đã sáp nhập toàn diện vào thanh QuickSlot đáy duy nhất
   * Container giữ lại an toàn để tránh lỗi tham chiếu null
   */
  private buildQuickActionButtons(): void {
    this.quickActionButtonsContainer = this.add.container(0, 0);
    this.quickActionButtonsContainer.setDepth(8000);
  }

  public selectQuickSlot(target: number | string): void {
    let index = -1;
    if (typeof target === 'string') {
      index = this.quickSlotRefs.findIndex(s => s.id === target);
    } else {
      index = target;
    }
    if (index < 0 || index >= this.quickSlotRefs.length) return;
    this.selectedQuickSlotIndex = index;
    this.redrawQuickSlotHighlights();
  }

  public redrawQuickSlotHighlights(): void {
    if (!this.slotHighlightImg || this.quickSlotRefs.length === 0) return;
    const activeSlot = this.quickSlotRefs[this.selectedQuickSlotIndex];
    if (!activeSlot) {
      this.slotHighlightImg.setVisible(false);
      return;
    }

    this.slotHighlightImg.setPosition(activeSlot.x, 0).setVisible(true);

    // V152-06B: Cập nhật texture pixel art ô được chọn và ô thường
    for (let i = 0; i < this.inventorySlotBaseImages.length; i++) {
      const img = this.inventorySlotBaseImages[i];
      if (img) {
        img.setTexture(i === this.selectedQuickSlotIndex ? 'ui_pack_slot_selected' : 'ui_pack_slot_idle');
      }
    }
  }

  public update(time: number = 0, _delta: number = 0): void {
    if (this.promptWorldTarget && this.promptContainer && this.promptContainer.alpha > 0) {
      this.updatePromptPosition();
    }
    this.updatePanicVignette(time);
    this.redrawStats(); // V152-06A: Cập nhật thể lực mượt mà theo thời gian thực khi chạy/hồi
  }

  private updatePanicVignette(time: number = 0): void {
    if (!this.panicVignetteGraphics || !this.playerState) return;

    const sm = SettingsManager.getInstance();
    const isPanicEnabled = sm.isPanicEffectsEnabled();
    const isLightMotion = sm.isLightMotionEnabled();
    if (!isPanicEnabled && this.activeRedDangerTween) {
      this.activeRedDangerTween.stop();
      this.activeRedDangerTween = undefined;
      this.redDangerGraphics.clear();
    }

    const stats = this.playerState.stats;
    const composure = stats.composure;

    // V1.5.4 (HW-FIX-23 & HW-FX-31): Kiểm tra điều kiện An toàn: Làng an toàn, Fog Crossing hoặc Gần nguồn nhiệt / Lửa trại Sir Vaelen
    // Ban ngày (DAY) KHÔNG còn tự động được xem là vùng an toàn ngoài tự nhiên!
    const gameScene = this.scene.get('GameScene') as any;
    const playerX = gameScene?.player?.x ?? 0;
    const playerY = gameScene?.player?.y ?? 0;
    const currentZone = gameScene?.currentZoneId;

    const isNearWarmth = gameScene?.survivalSystem?.isNearWarmth
      ? gameScene.survivalSystem.isNearWarmth(playerX, playerY, currentZone)
      : false;
    const isSanctuaryCamp = CampSanctuarySystem.getInstance().isPlayerInSanctuary(playerX, playerY, currentZone);
    const isSafeVillageZone = isVillageSanctuary(currentZone) || (currentZone === 'fog_crossing');
    const isProtectedZone = isSafeVillageZone || isNearWarmth || isSanctuaryCamp;

    // Kiểm tra điều kiện trong trận Boss Miếu Chuông Phế Tích
    const isBossFight = gameScene?.isBossFightActive && currentZone === 'broken_bell_shrine';
    const panicThreshold = isBossFight ? 50 : 40;
    const isSafeState = !isPanicEnabled || (!isBossFight && isProtectedZone) || composure >= panicThreshold;

    if (isSafeState) {
      this.lastPanicRenderKey = '';
      if (!isPanicEnabled || !isLightMotion) {
        if (this.isPanicVignetteActive || this.activePanicFadeTween) {
          this.activePanicFadeTween?.stop();
          this.activePanicFadeTween = undefined;
          this.panicVignetteGraphics.clear();
          this.panicVignetteGraphics.setAlpha(1);
        }
      } else if (this.isPanicVignetteActive) {
        this.activePanicFadeTween = this.tweens.add({
          targets: this.panicVignetteGraphics,
          alpha: 0,
          duration: 280,
          ease: 'Quad.easeOut',
          onComplete: () => {
            this.panicVignetteGraphics?.clear().setAlpha(1);
            this.activePanicFadeTween = undefined;
          }
        });
      }
      this.isPanicVignetteActive = false;
      return;
    }

    // Nếu quay lại trạng thái bất an khi đang trong quá trình fade-out: dừng tween và khôi phục alpha
    if (this.activePanicFadeTween) {
      this.activePanicFadeTween.stop();
      this.activePanicFadeTween = undefined;
      this.panicVignetteGraphics.setAlpha(1);
      this.lastPanicRenderKey = '';
    }

    const intensity = sm.getPanicIntensityMultiplier();
    const breath = isLightMotion ? Math.sin(time * 0.0022) * 0.5 : 0;
    const panicRenderKey = `${Math.round(composure * 100)}_${panicThreshold}_${intensity}_${isLightMotion ? Math.round(breath * 400) : 's'}`;
    if (this.isPanicVignetteActive && this.lastPanicRenderKey === panicRenderKey) {
      return;
    }
    this.lastPanicRenderKey = panicRenderKey;

    this.isPanicVignetteActive = true;
    this.panicVignetteGraphics.clear();

    // V15-06 & QA (0ceffa5): original UI palette and pulse levels, blended
    // over Sanity points at each threshold to avoid sudden changes.
    const fear = Phaser.Math.SmoothStep(30 - composure, 0, 3);
    const dread = Phaser.Math.SmoothStep(15 - composure, 0, 3);
    const pulseBase = Phaser.Math.Linear(Phaser.Math.Linear(0.10, 0.22, fear), 0.40, dread);
    const pulseAmp = Phaser.Math.Linear(Phaser.Math.Linear(0.04, 0.09, fear), 0.18, dread);
    // Bảng màu viền mép QA gốc: 0x0f040d (<45) -> 0x1c0612 (<30) -> 0x2e0610 (<15)
    const edgeColor = lerpColor(lerpColor(0x0f040d, 0x1c0612, fear), 0x2e0610, dread);

    // BUG-023: one slow phase at all Sanity levels, with half the original swing.
    const pulse = Math.max(0.04, pulseBase + pulseAmp * breath);
    const visibility = Phaser.Math.SmoothStep(panicThreshold - composure, 0, 2);
    const w = 1280;
    const h = 720;
    const g = this.panicVignetteGraphics;

    // Original five bands. The strongest band is only 14 px wide, and
    // inner bands fade toward the play area as in V15-06.
    const layers = [
      { inset: 0, thick: 14, alphaMult: 1.4 },
      { inset: 14, thick: 20, alphaMult: 1.0 },
      { inset: 34, thick: 26, alphaMult: 0.65 },
      { inset: 60, thick: 32, alphaMult: 0.35 },
      { inset: 92, thick: 38, alphaMult: 0.15 }
    ];
    for (const { inset, thick, alphaMult } of layers) {
      g.fillStyle(edgeColor, Math.min(0.72, pulse * alphaMult * intensity) * visibility);
      g.fillRect(inset, inset, w - inset * 2, thick);
      g.fillRect(inset, h - inset - thick, w - inset * 2, thick);
      g.fillRect(inset, inset + thick, thick, h - (inset + thick) * 2);
      g.fillRect(w - inset - thick, inset + thick, thick, h - (inset + thick) * 2);
    }

    // HW-TASK-2 / Classic Sanity 2.1: Phục hồi hình học ba tầng tam giác đa sắc từ QA (0ceffa5)
    // Tầng 1: Outer Crimson (0x280712)
    // Tầng 2: Mid Crimson-Black (0x18030b)
    // Tầng 3: Deep Corner Void (0x0a0105)
    // Thay thế 1 tam giác phẳng đơn sắc bằng cấu trúc 3 tầng quang học có chiều sâu,
    // kết hợp SmoothStep chống pop-in, tôn trọng Reduced Motion và Light Motion.
    if (composure < 38) {
      const tProg = Phaser.Math.Clamp((38 - composure) / 28, 0, 1);
      const tendrilFactor = Math.pow(tProg, 0.72);
      const cornerVisibility = Phaser.Math.SmoothStep(38 - composure, 0, 2);

      // Độ vươn góc tái tạo chuẩn xác QA (từ 75px lên 225px tại Sanity 11 và tối đa 245px tại Sanity 0)
      const baseCorner = Math.round(Phaser.Math.Linear(75, 245, tendrilFactor));
      const pulseCorner = isLightMotion ? baseCorner + Math.round(pulse * 18 * tendrilFactor) : baseCorner;

      // Tầng 1: Quầng đỏ thẫm ngoài cùng (Outer Crimson Glow - 0x280712)
      const c1Size = pulseCorner;
      const c1Alpha = Math.min(0.60, (0.18 + tendrilFactor * 0.36) * intensity) * cornerVisibility;
      g.fillStyle(0x280712, c1Alpha);
      g.fillTriangle(0, 0, c1Size, 0, 0, c1Size);
      g.fillTriangle(w, 0, w - c1Size, 0, w, c1Size);
      g.fillTriangle(0, h, c1Size, h, 0, h - c1Size);
      g.fillTriangle(w, h, w - c1Size, h, w, h - c1Size);

      // Tầng 2: Khối bóng tối đỏ đen thẫm (Mid Crimson-Black - 0x18030b, 72% size)
      const c2Size = Math.round(pulseCorner * 0.72);
      const c2Alpha = Math.min(0.80, (0.30 + tendrilFactor * 0.48) * intensity) * cornerVisibility;
      g.fillStyle(0x18030b, c2Alpha);
      g.fillTriangle(0, 0, c2Size, 0, 0, c2Size);
      g.fillTriangle(w, 0, w - c2Size, 0, w, c2Size);
      g.fillTriangle(0, h, c2Size, h, 0, h - c2Size);
      g.fillTriangle(w, h, w - c2Size, h, w, h - c2Size);

      // Tầng 3: Tâm điểm đen sâu thẳm ở 4 góc (Deep Corner Void - 0x0a0105, 45% size)
      const c3Size = Math.round(pulseCorner * 0.45);
      const c3Alpha = Math.min(0.96, (0.45 + tendrilFactor * 0.50) * intensity) * cornerVisibility;
      g.fillStyle(0x0a0105, c3Alpha);
      g.fillTriangle(0, 0, c3Size, 0, 0, c3Size);
      g.fillTriangle(w, 0, w - c3Size, 0, w, c3Size);
      g.fillTriangle(0, h, c3Size, h, 0, h - c3Size);
      g.fillTriangle(w, h, w - c3Size, h, w, h - c3Size);
    }

    // Cảnh báo HUD khi bước vào các ngưỡng nguy hiểm (quản lý tập trung, cooldown rõ ràng)
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (composure < 15) {
      // Ngưỡng Hoảng Loạn Nguy Kịch (<15/100): Cảnh báo tâm trí rạn nứt
      if (now - this.lastPanicWarningTime > 16000) {
        this.lastPanicWarningTime = now;
        this.showPopupMessage('⚠️ Tâm trí đang rạn nứt... Hãy tìm ánh lửa ngay!');
      }
    } else if (composure < 35) {
      // Ngưỡng Bất An & Sợ Hãi (15..34/100)
      if (now - this.lastDarknessWarningTime > 18000) {
        this.lastDarknessWarningTime = now;
        this.showPopupMessage('⚠️ Bóng tối đang gặm nhấm Tinh Thần! Hãy bật Vòng Sáng [F] hoặc tìm nguồn lửa!');
      }
    }
  }

  /**
   * V1.5 (BƯỚC V15-06): Tính toán hệ số tầm nhìn theo Bình Tâm (1.0 khi >= 50%, giảm dần về 0.45 khi chạm 0%)
   */
  public getComposureVisionFactor(): number {
    const comp = this.playerState?.stats?.composure ?? 100;
    if (comp >= 50) return 1.0;
    return Phaser.Math.Linear(0.45, 1.0, Math.max(0, comp / 50));
  }

  /**
   * V15-47 & V1.5.3 (BUG-023 FIX): Kích hoạt viền đỏ cảnh báo nguy hiểm độc lập (Red Danger Vignette Flash)
   * Sử dụng tween mượt mà trên redDangerGraphics riêng biệt, triệt tiêu hoàn toàn nhấp nháy strobe đỏ-đen.
   */
  public triggerRedDangerVignetteFlash(): void {
    const settings = SettingsManager.getInstance();
    if (!this.redDangerGraphics || !settings.isPanicEffectsEnabled()) return;
    const g = this.redDangerGraphics;
    const w = 1280;
    const h = 720;

    // Hủy tween cũ nếu có để chống chồng chéo
    if (this.activeRedDangerTween) {
      this.activeRedDangerTween.stop();
      this.activeRedDangerTween = undefined;
    }

    g.clear();
    g.setAlpha(1);

    // Vẽ viền đỏ cảnh báo dịu mắt một lần duy nhất
    const edgeThickness = 36;
    g.fillStyle(0x8b101e, 0.42);
    g.fillRect(0, 0, w, edgeThickness);
    g.fillRect(0, h - edgeThickness, w, edgeThickness);
    g.fillRect(0, edgeThickness, edgeThickness, h - edgeThickness * 2);
    g.fillRect(w - edgeThickness, edgeThickness, edgeThickness, h - edgeThickness * 2);

    // 4 góc tam giác mềm
    g.fillStyle(0x6b0a14, 0.52);
    const cSize = 110;
    g.fillTriangle(0, 0, cSize, 0, 0, cSize);
    g.fillTriangle(w, 0, w - cSize, 0, w, cSize);
    g.fillTriangle(0, h, cSize, h, 0, h - cSize);
    g.fillTriangle(w, h, w - cSize, h, w, h - cSize);

    const duration = settings.isReducedMotionPreferred() ? 180 : 380;

    this.activeRedDangerTween = this.tweens.add({
      targets: g,
      alpha: 0,
      duration: duration,
      ease: 'Quad.easeOut',
      onComplete: () => {
        if (g) g.clear();
        this.activeRedDangerTween = undefined;
      }
    });
  }

  /**
   * C4-14-B04: Hiệu ứng viền vàng ấm áp khi trở về Sanctuary làng Bellhollow an toàn
   */
  public triggerSanctuaryReliefGlow(): void {
    if (!this.sanctuaryGlowGraphics) return;
    this.sanctuaryGlowGraphics.clear();
    const w = 1280;
    const h = 720;
    this.sanctuaryGlowGraphics.lineStyle(18, 0xf39c12, 0.22);
    this.sanctuaryGlowGraphics.strokeRect(9, 9, w - 18, h - 18);
    this.sanctuaryGlowGraphics.lineStyle(8, 0xffe082, 0.35);
    this.sanctuaryGlowGraphics.strokeRect(4, 4, w - 8, h - 8);

    this.tweens.add({
      targets: this.sanctuaryGlowGraphics,
      alpha: { from: 1, to: 0 },
      duration: 1600,
      ease: 'Quad.easeOut',
      onComplete: () => {
        if (this.sanctuaryGlowGraphics) {
          this.sanctuaryGlowGraphics.clear();
        }
      }
    });
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
    // C4-12-04: Kiểm tra nếu Máu và Tinh Thần đã đầy 100% thì không tiêu hao lãng phí
    if (
      this.playerState.stats.health >= this.playerState.stats.maxHealth &&
      this.playerState.stats.composure >= this.playerState.stats.maxComposure
    ) {
      this.showPopupMessage('💚 Máu và Tinh Thần đã đầy (100%), không cần dùng Thuốc Đắp!');
      return false;
    }
    if (this.playerState.useItem('item_herbal_poultice')) {
      AudioManager.getInstance().playPoulticeHeal();
      this.showPopupMessage('✔ Đã dùng Thuốc Đắp (+40 Máu, +25 Tinh Thần)');
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
      this.showPopupMessage('⚠️ Chưa có Hương Trầm Tinh Thần! Hãy chế tạo bằng [Phím I] hoặc tại Bàn Chế Tạo.');
      return false;
    }
    // V15-54: Kiểm tra nếu Tinh Thần đã đầy 100% thì không tiêu hao lãng phí
    if (this.playerState.stats.composure >= this.playerState.stats.maxComposure) {
      this.showPopupMessage('✨ Tinh Thần đã đạt mức tối đa (100%), không cần dùng thêm!');
      return false;
    }
    if (this.playerState.useItem('item_lantern_oil')) {
      AudioManager.getInstance().playOilRefill();
      this.playerState.stats.composure = Math.min(
        this.playerState.stats.maxComposure,
        this.playerState.stats.composure + 25
      );
      this.playerState.emit('stats_changed');
      const nowC = Math.round(this.playerState.stats.composure);
      this.showPopupMessage(`✔ Đã thắp Hương Trầm Tinh Thần (+25 Tinh Thần • Hiện tại: ${nowC})`);
      this.updateQuickSlotCounts();
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

  /**
   * V15-24: Sử dụng vật phẩm khẩn cấp ô số [3] (Trà Thảo Dược An Thần hoặc Đuốc Nhựa Thông)
   */
  public tryUseEmergencySurvivalItem(): boolean {
    const now = performance.now();
    if (now - this.lastEmergencyTime < 250) return false;
    this.lastEmergencyTime = now;

    const teaCount = this.playerState.getItemCount('food_calming_tea');
    const flareCount = this.playerState.getItemCount('item_resin_flare');

    if (teaCount <= 0 && flareCount <= 0) {
      this.showPopupMessage('⚠️ Chưa có Trà An Thần hoặc Đuốc Nhựa Thông!');
      return false;
    }

    // Nếu có Trà An Thần và người chơi cần hồi phục Tinh Thần (hoặc không có Đuốc)
    if (teaCount > 0 && (this.playerState.stats.composure < this.playerState.stats.maxComposure || flareCount <= 0)) {
      if (this.playerState.stats.composure >= this.playerState.stats.maxComposure) {
        this.showPopupMessage('🍵 Tinh Thần đã đầy (100%), không cần uống Trà!');
        return false;
      }
      if (this.playerState.useItem('food_calming_tea')) {
        AudioManager.getInstance().playPoulticeHeal();
        if (this.playerState.stats.temperature !== undefined) {
          this.playerState.stats.temperature = Math.min(100, (this.playerState.stats.temperature || 80) + 15);
        }
        this.showPopupMessage('🍵 Đã dùng Trà Thảo Dược (+40 Tinh Thần, +15° Thân Nhiệt)');
        const gameScene = this.scene.get('GameScene') as any;
        if (gameScene && gameScene.player && typeof gameScene.player.playUseItem === 'function') {
          gameScene.player.playUseItem();
        }
        this.redrawStats();
        this.updateQuickSlotCounts();
        return true;
      }
    }

    // Nếu có Đuốc Nhựa Thông Khẩn Cấp: cắm đuốc tạo quầng sáng cứu nạn
    if (flareCount > 0) {
      if (this.tryPlantResinFlare()) {
        this.updateQuickSlotCounts();
        return true;
      }
    }

    return false;
  }

  public updateQuickSlotCounts(): void {
    if (!this.playerState) return;

    const poulticeCount = this.playerState.getItemCount('item_herbal_poultice');
    const oilCount = this.playerState.getItemCount('item_lantern_oil');
    const lureCount = this.playerState.getItemCount('item_noise_lure');
    const teaCount = this.playerState.getItemCount('food_calming_tea');
    const flareCount = this.playerState.getItemCount('item_resin_flare');
    const emergencyTotal = teaCount + flareCount;

    // 1. Cập nhật dữ liệu 8 ô Túi Đồ
    this.inventorySlotData = this.getInventorySlotItems();

    for (let i = 0; i < 8; i++) {
      const slot = this.inventorySlotData[i];
      const iconTxt = this.inventorySlotIcons[i];
      const iconImg = this.inventorySlotImages[i];
      const countTxt = this.inventorySlotCounts[i];
      const keyTxt = this.inventorySlotKeyTexts[i];

      if (!slot || !slot.itemId) {
        if (iconTxt) iconTxt.setText('').setAlpha(1.0);
        if (iconImg) iconImg.setVisible(false);
        if (countTxt) countTxt.setText('');
        if (keyTxt) keyTxt.setColor('#7a6855');
      } else {
        // BUG-025: Hiển thị 100% biểu tượng Pixel Art sắc nét từ ItemIconHelper (chống emoji □)
        const iconRes = ItemIconHelper.resolveItemIcon(this, slot.itemId);
        if (iconImg) {
          if (iconRes.frame) {
            iconImg.setTexture(iconRes.texture, iconRes.frame);
          } else {
            iconImg.setTexture(iconRes.texture);
          }
          iconImg.setDisplaySize(22, 22);
          iconImg.setVisible(true);
          iconImg.setAlpha(slot.count > 0 ? 1.0 : 0.4);
        }
        if (iconTxt) iconTxt.setText('');
        if (countTxt) {
          // Ô [1] và [2] hiện x0 nếu hết đồ để người chơi nhận biết; các ô khác hiện nếu > 0
          if (slot.count > 0) {
            countTxt.setText(`x${slot.count}`);
            countTxt.setColor('#2ecc71');
          } else if (i < 2) {
            countTxt.setText('x0');
            countTxt.setColor('#7f8c8d');
          } else {
            countTxt.setText('');
          }
        }
        if (keyTxt) {
          keyTxt.setColor(slot.count > 0 ? '#f1c40f' : '#baa892');
        }
      }
    }

    // 2. Cập nhật 4 ô Trang Bị Cá Nhân
    this.updateBottomBarEquipment();

    // 3. Cập nhật trạng thái đèn lồng trên Taskbar dọc
    this.updateTaskbarLanternState();

    // 4. V15-50A: Đồng bộ lại trạng thái công thức ghim và thẻ nổi
    if (this.quickCraftSidebar) {
      this.quickCraftSidebar.refresh();
    }

    // Đồng bộ biến đếm backward compatibility
    this.lastPoulticeCount = poulticeCount;
    this.lastOilCount = oilCount;
    this.lastEmergencyCount = emergencyTotal;
    this.lastLureCount = lureCount;
  }

  /**
   * V15-50: Lấy danh sách 8 vật phẩm cho Hotbar túi đồ
   * Ưu tiên các dược phẩm sinh tồn cơ bản ở các ô đầu, các vật phẩm khác điền vào tiếp theo
   */
  private getInventorySlotItems(): Array<{ itemId: string | null; count: number }> {
    const slots: Array<{ itemId: string | null; count: number }> = [];
    if (!this.playerState) return slots;

    const invMap = this.playerState.inventory;
    const activeItems: Array<{ itemId: string; count: number }> = [];
    invMap.forEach((count, id) => {
      if (count > 0) {
        activeItems.push({ itemId: id, count });
      }
    });

    const priorityIds = [
      'item_herbal_poultice',
      'item_lantern_oil',
      'food_calming_tea',
      'item_resin_flare',
      'item_noise_lure'
    ];

    const assignedIds = new Set<string>();

    // Ô 0: Thuốc Đắp Thảo Mộc (luôn hiện diện ở ô [1])
    const poulticeCount = this.playerState.getItemCount('item_herbal_poultice');
    slots.push({ itemId: 'item_herbal_poultice', count: poulticeCount });
    assignedIds.add('item_herbal_poultice');

    // Ô 1: Hương Trầm Tinh Thần (luôn hiện diện ở ô [2])
    const oilCount = this.playerState.getItemCount('item_lantern_oil');
    slots.push({ itemId: 'item_lantern_oil', count: oilCount });
    assignedIds.add('item_lantern_oil');

    // Các vật phẩm ưu tiên khác nếu đang có trong túi đồ
    for (const pId of priorityIds) {
      if (slots.length >= 8) break;
      if (!assignedIds.has(pId)) {
        const count = this.playerState.getItemCount(pId);
        if (count > 0) {
          slots.push({ itemId: pId, count });
          assignedIds.add(pId);
        }
      }
    }

    // Điền các vật phẩm còn lại trong túi đồ vào các ô tiếp theo
    for (const item of activeItems) {
      if (slots.length >= 8) break;
      if (!assignedIds.has(item.itemId)) {
        slots.push(item);
        assignedIds.add(item.itemId);
      }
    }

    // Nếu chưa đủ 8 ô, điền ô trống
    while (slots.length < 8) {
      slots.push({ itemId: null, count: 0 });
    }

    return slots;
  }

  /**
   * V15-50: Cập nhật 4 ô Trang Bị Cá Nhân (BODY, FEET, BACK, CHARM) ở đáy màn hình
   */
  public updateBottomBarEquipment(): void {
    if (!this.equipmentSlotGfx) return;

    const equipSlots: Array<{ slot: EquipmentSlot; label: string; defaultIcon: string }> = [
      { slot: 'body', label: 'BODY', defaultIcon: '🧥' },
      { slot: 'feet', label: 'FEET', defaultIcon: '👢' },
      { slot: 'back', label: 'BACK', defaultIcon: '🎒' },
      { slot: 'charm', label: 'CHARM', defaultIcon: '🔔' }
    ];

    const slotSize = 42;
    const eqEquippedKey = this.ensureBakedUITexture('ui_hw_eq_slot_equipped_v1', slotSize, slotSize, (g, pad) => {
      g.fillStyle(0x241d15, 0.95);
      g.fillRoundedRect(pad, pad, slotSize, slotSize, 4);
      g.lineStyle(1.5, 0xd4af37, 0.95);
      g.strokeRoundedRect(pad, pad, slotSize, slotSize, 4);
    });
    const eqIdleKey = this.ensureBakedUITexture('ui_hw_eq_slot_idle_v1', slotSize, slotSize, (g, pad) => {
      g.fillStyle(0x141018, 0.9);
      g.fillRoundedRect(pad, pad, slotSize, slotSize, 4);
      g.lineStyle(1.2, 0x524336, 0.85);
      g.strokeRoundedRect(pad, pad, slotSize, slotSize, 4);
    });

    for (let i = 0; i < equipSlots.length; i++) {
      const eq = equipSlots[i];
      const g = this.equipmentSlotGfx[eq.slot];
      const iconTxt = this.equipmentSlotIcons[eq.slot];
      if (!g || !iconTxt) continue;

      const equippedId = EquipmentSystem.getInstance().getEquipped(eq.slot);
      const def = equippedId ? EquipmentSystem.getInstance().getEquipmentDef(equippedId) : undefined;

      if (def) {
        // Đang mặc trang bị: viền vàng kim hổ phách rực rỡ
        if (g.texture?.key !== eqEquippedKey) g.setTexture(eqEquippedKey);

        iconTxt.setText(eq.defaultIcon);
        iconTxt.setAlpha(1.0);
        if (this.equipmentSlotDefaultIcons[eq.slot]) {
          this.equipmentSlotDefaultIcons[eq.slot].setAlpha(1.0).setTint(0xffe082);
        }
        if (this.equipmentSlotBaseImages[eq.slot]) {
          this.equipmentSlotBaseImages[eq.slot].setTexture('ui_pack_slot_selected');
        }
      } else {
        // Ô đang trống: viền đồng tối mờ
        if (g.texture?.key !== eqIdleKey) g.setTexture(eqIdleKey);

        iconTxt.setText(eq.defaultIcon);
        iconTxt.setAlpha(0.35);
        if (this.equipmentSlotDefaultIcons[eq.slot]) {
          this.equipmentSlotDefaultIcons[eq.slot].setAlpha(0.4).clearTint();
        }
        if (this.equipmentSlotBaseImages[eq.slot]) {
          this.equipmentSlotBaseImages[eq.slot].setTexture('ui_pack_slot_equip');
        }
      }
    }
  }

  /**
   * V15-50: Bản đồ biểu tượng emoji/pixel art sắc nét cho từng vật phẩm
   */
  public getItemIconChar(itemId: string): string {
    const iconMap: Record<string, string> = {
      item_herbal_poultice: '🌿',
      item_lantern_oil: '🪔',
      food_calming_tea: '🍵',
      item_resin_flare: '🌲',
      item_noise_lure: '🔔',
      food_roasted_mushroom: '🍄',
      food_forest_root_soup: '🍲',
      res_dry_wood: '🌲',
      res_flint: '🪨',
      res_tree_resin: '💧',
      res_herbs: '🌱',
      seed_herbs: '🌰',
      seed_roots: '🌰',
      seed_mushroom: '🍄',
      seed_fiber: '🌾',
      res_forest_roots: '🥔',
      res_forest_mushroom: '🍄',
      res_tough_fiber: '🌾',
      mat_forest_rope: '🪢',
      mat_charcoal: '⬛',
      mat_runed_iron: '⚙️',
      mat_skull_fang: '🦴',
      mat_shadow_essence: '🔮',
      eqp_moss_cloak: '🧥',
      eqp_trail_boots: '👢',
      eqp_field_backpack: '🎒',
      eqp_bell_ward_charm: '🔔',
      wpn_walking_staff: '🦯',
      wpn_iron_spear: '🗡️',
      wpn_hunting_hatchet: '🪓',
      quest_bronze_clapper: '🔔',
      quest_corrupted_crest: '👑',
      lore_satyr_journal: '📜',
      item_knight_journal_page: '📜',
      relic_heart_of_roots: '💎'
    };

    if (iconMap[itemId]) return iconMap[itemId];
    const meta = itemsData.items.find((it: any) => it.id === itemId);
    if (!meta) return '📦';
    if (meta.category === 'consumable' || meta.category === 'food') return '🌿';
    if (meta.category === 'resource') return '🪵';
    if (meta.category === 'tool') return '🔧';
    if (meta.category === 'quest') return '👑';
    if (meta.category === 'lore') return '📜';
    return '📦';
  }

  /**
   * V15-24: Thu gọn hoặc mở rộng khung Nhiệm Vụ hiện tại góc trên phải
   */
  public toggleQuestCollapse(): void {
    this.isQuestCollapsed = !this.isQuestCollapsed;
    this.redrawQuestBox();
    this.updateQuestTracker();
  }

  public redrawQuestBox(): void {
    if (!this.questBg) return;
    const questBoxW = 340;
    const questBoxX = 1260 - questBoxW; // 920
    const questBoxY = 16;

    // V152-06A: Tự động tính toán chiều cao khung theo số dòng thực tế (padding đáy >= 14px)
    let dynamicH = 86;
    if (this.questTrackerText && this.questTrackerText.height > 0) {
      dynamicH = Math.max(86, Math.ceil((this.questTrackerText.y + this.questTrackerText.height) - questBoxY + 14));
    }
    const questBoxH = this.isQuestCollapsed ? 30 : dynamicH;

    // V152-06B: Khung giấy da nhiệm vụ cổ kính từ UI Pack
    if (this.textures.exists('ui_pack_panel_quest')) {
      if (!this.questBgSprite) {
        this.questBgSprite = this.add.image(questBoxX + questBoxW / 2, questBoxY + questBoxH / 2, 'ui_pack_panel_quest');
        this.questBgSprite.setDepth(7999);
        this.questBgSprite.setTint(0x8a7052);
        this.questBgSprite.setAlpha(0.6);
      }
      this.questBgSprite.setPosition(questBoxX + questBoxW / 2, questBoxY + questBoxH / 2);
      this.questBgSprite.setDisplaySize(questBoxW, questBoxH);
      this.questBgSprite.setVisible(this.hudVisible);
    }

    const questTexKey = this.ensureBakedUITexture(`ui_hw_quest_bg_${questBoxW}x${questBoxH}_v1`, questBoxW, questBoxH, (g, pad) => {
      // Nền bán trong suốt dịu mắt, hòa nhịp với bối cảnh rừng sương
      g.fillStyle(0x0e1118, 0.85);
      g.fillRoundedRect(pad, pad, questBoxW, questBoxH, 6);
      g.lineStyle(1.5, 0x6e5228, 0.85);
      g.strokeRoundedRect(pad, pad, questBoxW, questBoxH, 6);
      g.lineStyle(1, 0x8a6d3b, 0.3);
      g.strokeRoundedRect(pad + 2, pad + 2, questBoxW - 4, questBoxH - 4, 5);
      // Vạch nhấn vàng hổ phách dọc mép trái
      g.fillStyle(0xc68a2e, 0.75);
      g.fillRect(pad, pad + 4, 3.5, questBoxH - 8);
    });
    if (this.questBg.texture?.key !== questTexKey) {
      this.questBg.setTexture(questTexKey);
    }
    this.questBg.setPosition(questBoxX - 2, questBoxY - 2);

    if (this.questToggleBtn) {
      this.questToggleBtn.setText(this.isQuestCollapsed ? '▼' : '▲');
      this.questToggleBtn.setColor(this.isQuestCollapsed ? '#f1c40f' : '#baa892');
    }

    if (this.zoneBadgeContainer) {
      this.zoneBadgeContainer.setPosition(questBoxX, questBoxY + questBoxH + 6);
    }

    const quest = QuestSystem.getInstance().getHUDQuestDisplay(this.playerState);

    if (this.isQuestCollapsed) {
      if (this.questTitleText) this.questTitleText.setVisible(false);
      if (this.questTrackerText) this.questTrackerText.setVisible(false);
      if (this.questHeaderText) {
        this.questHeaderText.setText(`📜 [J] ${quest.title}`);
        this.questHeaderText.setPosition(questBoxX + 12, questBoxY + 8);
      }
    } else {
      if (this.questHeaderText) {
        this.questHeaderText.setText(quest.header);
        this.questHeaderText.setPosition(questBoxX + 12, questBoxY + 8);
      }
      if (this.questTitleText) this.questTitleText.setVisible(this.hudVisible);
      if (this.questTrackerText) this.questTrackerText.setVisible(this.hudVisible);
    }
  }

  public updateQuestTracker(): void {
    const quest = QuestSystem.getInstance().getHUDQuestDisplay(this.playerState);

    if (this.isQuestCollapsed) {
      if (this.questHeaderText) {
        this.questHeaderText.setText(`📜 [J] ${quest.title}`);
      }
      return;
    }

    if (this.questHeaderText) {
      this.questHeaderText.setText(quest.header);
    }

    let layoutChanged = false;
    if (this.questTitleText) {
      const fullTitle = quest.title;
      if (this.lastQuestTitle !== fullTitle) {
        this.lastQuestTitle = fullTitle;
        this.questTitleText.setText(fullTitle);
        layoutChanged = true;
      }
    }

    if (this.questTrackerText) {
      const fullTaskText = [quest.taskText, quest.directionHint].filter(Boolean).join('\n');

      if (this.lastQuestTaskText !== fullTaskText) {
        this.lastQuestTaskText = fullTaskText;
        this.questTrackerText.setText(fullTaskText);
        layoutChanged = true;
      }
    }
    if (layoutChanged && this.questTitleText && this.questTrackerText) {
      this.questTrackerText.setY(this.questTitleText.y + this.questTitleText.height + 4);
      this.redrawQuestBox();
    }
  }

  /**
   * V14-P8-02 / V15-24: Hoàn thiện widget Đồng Hồ Tròn 3 múi màu (DAY-NIGHT CIRCULAR CLOCK)
   * - Đặt tại (x: 704, y: 16, w: 208, h: 78) - giải phóng hoàn toàn tầm nhìn trung tâm đi lên phía Bắc
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

    // V15-48: Dời timeBoxX sang 668px để giữ bố cục đồng bộ bên cạnh Quest box
    const timeBoxX = 668;
    const timeBoxY = 16;

    const cfg = TIME_CONFIG.phases[phase] || TIME_CONFIG.phases.DAY;

    // 1. Cập nhật nhãn trạng thái Ngày X — Mùa Sương Lạnh (nền TimeWidget đã cache trong timeWidgetBg Image)
    if (phaseChanged || dayChanged) {
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

    // 3. Kim Đồng Hồ Xoay Mượt Theo Thời Gian Thực trên mặt đồng hồ đã pre-bake (timeClockDialImg)
    const clockCx = timeBoxX + 38;
    const clockCy = timeBoxY + 39;
    const clockR = 25;

    this.timeClockGfx.clear();

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

    // 1. Huy hiệu Độ Ẩm (Moisture) tại Hàng phụ dưới khung chính (V15-54: x: 116, y: 98, w: 126, h: 22)
    // 0–29%: DRY (Khô ráo), 30–69%: DAMP (Ẩm ướt), 70–100%: SOAKED (Ướt sũng)
    const bX = 116;
    const bY = 98;
    const bW = 126;
    const bH = 22;

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

    const mTexKey = this.ensureBakedUITexture(`ui_hw_moist_${mBgColor.toString(16)}_${mBorderColor.toString(16)}_v1`, bW, bH, (g, pad) => {
      g.fillStyle(mBgColor, 0.88);
      g.fillRoundedRect(pad, pad, bW, bH, 4);
      g.lineStyle(1, mBorderColor, 0.75);
      g.strokeRoundedRect(pad, pad, bW, bH, 4);
    });
    if (this.moistureBadgeBg.texture?.key !== mTexKey) {
      this.moistureBadgeBg.setTexture(mTexKey);
    }

    if (this.moistureBadgeText) {
      this.moistureBadgeText.setText(mLabel);
      this.moistureBadgeText.setColor(mColorHex);
      this.moistureBadgeText.setPosition(bX + bW / 2, bY + bH / 2);
      this.moistureBadgeText.setOrigin(0.5, 0.5);
    }

    // 2. Huy hiệu Thân Nhiệt (Temperature) tại Hàng phụ dưới khung chính (V15-54: x: 248, y: 98, w: 142, h: 22)
    // >= 70: WARM (Ấm áp), 35–69: CHILLY (Se lạnh), <= 34: FREEZING (Lạnh cóng)
    const tX = 248;
    const tY = 98;
    const tW = 142;
    const tH = 22;

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

    const tTexKey = this.ensureBakedUITexture(`ui_hw_temp_${tBgColor.toString(16)}_${tBorderColor.toString(16)}_v1`, tW, tH, (g, pad) => {
      g.fillStyle(tBgColor, 0.88);
      g.fillRoundedRect(pad, pad, tW, tH, 4);
      g.lineStyle(1, tBorderColor, 0.75);
      g.strokeRoundedRect(pad, pad, tW, tH, 4);
    });
    if (this.temperatureBadgeBg.texture?.key !== tTexKey) {
      this.temperatureBadgeBg.setTexture(tTexKey);
    }

    if (this.temperatureBadgeText) {
      this.temperatureBadgeText.setText(tLabel);
      this.temperatureBadgeText.setColor(tColorHex);
      this.temperatureBadgeText.setPosition(tX + tW / 2, tY + tH / 2);
      this.temperatureBadgeText.setOrigin(0.5, 0.5);
    }
  }

  public showZoneBanner(atmosphere: ZoneAtmosphere, force: boolean = false): void {
    const now = performance.now();
    // BUG-028: Chống nhấp nháy 2 banner liên tiếp khi đứng sát ranh giới (< 3500ms)
    if (!force && now - this.lastBannerShownTime < 3500) {
      if (this.lastBannerZoneTitle === atmosphere.titleVietnamese) {
        return;
      }
      // Đứng sát ranh giới đổi zone liên tục: Lên lịch hoãn để hiện banner sau khi người chơi dừng ổn định
      if (this.pendingBannerTimer) {
        this.pendingBannerTimer.remove();
      }
      const remainingCooldown = Math.max(200, 3600 - (now - this.lastBannerShownTime));
      this.pendingBannerTimer = this.time.delayedCall(remainingCooldown, () => {
        this.pendingBannerTimer = undefined;
        if (this.lastBannerZoneTitle !== atmosphere.titleVietnamese) {
          this.showZoneBanner(atmosphere);
        }
      });
      return;
    }

    if (this.pendingBannerTimer) {
      this.pendingBannerTimer.remove();
      this.pendingBannerTimer = undefined;
    }

    this.lastBannerShownTime = now;
    this.lastBannerZoneTitle = atmosphere.titleVietnamese;

    this.zoneTitleText.setText(atmosphere.titleVietnamese);
    this.zoneSubtitleText.setText(atmosphere.subTitleVietnamese);
    this.updateZoneBadge(atmosphere.titleVietnamese);

    // V14-P8-12: Tự động tính chiều rộng khung viền dựa theo độ dài thực tế của chữ + lề an toàn >= 32px mỗi bên
    const maxTextW = Math.max(this.zoneTitleText.width, this.zoneSubtitleText.width);
    const bannerW = Math.max(420, maxTextW + 64);
    const bannerH = 54;

    this.zoneBannerBg.clear();
    // Nền gỗ tối bán trong suốt
    this.zoneBannerBg.fillStyle(0x120d09, 0.88);
    this.zoneBannerBg.fillRoundedRect(-bannerW / 2, -bannerH / 2, bannerW, bannerH, 8);
    // Viền đồng xỉn
    this.zoneBannerBg.lineStyle(1.6, 0x7a5e30, 0.95);
    this.zoneBannerBg.strokeRoundedRect(-bannerW / 2, -bannerH / 2, bannerW, bannerH, 8);
    // Đường viền bên trong ấm áp
    this.zoneBannerBg.lineStyle(1, 0x8a6d3b, 0.35);
    this.zoneBannerBg.strokeRoundedRect(-bannerW / 2 + 2, -bannerH / 2 + 2, bannerW - 4, bannerH - 4, 6);

    // 4 đinh tán đồng ở góc
    this.zoneBannerBg.fillStyle(0xb89058, 0.85);
    this.zoneBannerBg.fillRect(-bannerW / 2 + 3, -bannerH / 2 + 3, 2, 2);
    this.zoneBannerBg.fillRect(bannerW / 2 - 5, -bannerH / 2 + 3, 2, 2);
    this.zoneBannerBg.fillRect(-bannerW / 2 + 3, bannerH / 2 - 5, 2, 2);
    this.zoneBannerBg.fillRect(bannerW / 2 - 5, bannerH / 2 - 5, 2, 2);

    if (this.zoneBannerTween) {
      this.zoneBannerTween.stop();
      this.zoneBannerTween = undefined;
    }
    this.tweens.killTweensOf(this.zoneBannerContainer);
    this.zoneBannerContainer.setAlpha(0);

    this.zoneBannerTween = this.tweens.add({
      targets: this.zoneBannerContainer,
      alpha: 1,
      duration: 500,
      hold: 2400,
      yoyo: true,
      ease: 'Power2',
      onComplete: () => {
        this.zoneBannerTween = undefined;
      }
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
        // V14-P8-12: Gỗ tối viền đồng xỉn với đường chỉ ấm bên trong
        this.promptBg.fillStyle(0x15110d, 0.88);
        this.promptBg.fillRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 6);
        this.promptBg.lineStyle(1.5, 0x7a5e30, 0.9);
        this.promptBg.strokeRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 6);
        this.promptBg.lineStyle(1, 0x9c774b, 0.35);
        this.promptBg.strokeRoundedRect(-pillW / 2 + 1, -pillH / 2 + 1, pillW - 2, pillH - 2, 5);
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
    if (this.verticalTaskbarContainer) {
      this.verticalTaskbarContainer.setVisible(shouldShowHUD);
    }
    if (this.quickCraftSidebar) {
      this.quickCraftSidebar.setVisible(shouldShowHUD);
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
      this.focusGameCanvas();
    }
  }

  /**
   * V15-48: Trả lại tiêu điểm cho canvas game khi người chơi đóng modal hoặc hội thoại
   */
  public focusGameCanvas(): void {
    try {
      window.focus();
      if (this.game && this.game.canvas) {
        this.game.canvas.focus();
      }
    } catch {}
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
      (!!this.equipmentModal && this.equipmentModal.isOpen) ||
      (!!this.parchmentWorldMapModal && this.parchmentWorldMapModal.isOpen) ||
      (!!this.tornPageModal && this.tornPageModal.isOpen);
  }

  /**
   * C4-13-03: Kích hoạt giao diện Game Over trên UIScene, ẩn toàn bộ prompt và đóng các modal khác
   */
  public showGameOverModal(reason?: string, scoreParams?: SubmitScoreParams): void {
    if (this.craftingModal && this.craftingModal.isOpen) this.craftingModal.close();
    if (this.journalModal && this.journalModal.isOpen) this.journalModal.close();
    if (this.pauseModal && this.pauseModal.isOpen) this.pauseModal.close();
    if (this.storageChestModal && this.storageChestModal.isOpen) this.storageChestModal.close();
    if (this.campfireModal && this.campfireModal.isOpen) this.campfireModal.close();
    if (this.cauldronModal && this.cauldronModal.isOpen) this.cauldronModal.close();
    if (this.equipmentModal && this.equipmentModal.isOpen) this.equipmentModal.close();
    if (this.parchmentWorldMapModal && this.parchmentWorldMapModal.isOpen) this.parchmentWorldMapModal.close();
    if (this.tornPageModal && this.tornPageModal.isOpen) this.tornPageModal.close();
    this.hideDialogue();
    this.handleModalOpened();
    this.setInteractionPrompt(null);
    if (this.gameOverModal) {
      this.gameOverModal.open(reason, scoreParams);
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
    this.hudVisible = visible;
    if (this.statCardSprite) this.statCardSprite.setVisible(visible);
    if (this.statCardBg) this.statCardBg.setVisible(visible);
    if (this.playerNameText) this.playerNameText.setVisible(visible);
    if (this.statBarsGraphics) this.statBarsGraphics.setVisible(visible);
    for (const iconImg of this.statIconImages) {
      if (iconImg) iconImg.setVisible(visible);
    }
    if (this.healthValText) this.healthValText.setVisible(visible);
    if (this.staminaValText) this.staminaValText.setVisible(visible);
    if (this.runningStateText) this.runningStateText.setVisible(visible);
    if (this.oilValText) this.oilValText.setVisible(visible);
    if (this.composureValText) this.composureValText.setVisible(visible);
    if (this.lanternStatusBg) this.lanternStatusBg.setVisible(visible);
    if (this.lanternStatusText) this.lanternStatusText.setVisible(visible);
    if (this.questBg) this.questBg.setVisible(visible);
    if (this.questBgSprite) this.questBgSprite.setVisible(visible);
    if (this.questHeaderText) this.questHeaderText.setVisible(visible);
    if (this.questTitleText) this.questTitleText.setVisible(visible && !this.isQuestCollapsed);
    if (this.questTrackerText) this.questTrackerText.setVisible(visible && !this.isQuestCollapsed);
    if (this.questToggleBtn) this.questToggleBtn.setVisible(visible);
    if (this.questToggleZone?.input) this.questToggleZone.input.enabled = visible;
    if (this.zoneBadgeContainer) this.zoneBadgeContainer.setVisible(visible);
    if (this.quickSlotContainer) this.quickSlotContainer.setVisible(visible);
    if (this.verticalTaskbarContainer) this.verticalTaskbarContainer.setVisible(visible);
    if (this.quickCraftSidebar) this.quickCraftSidebar.setVisible(visible);
    if (this.promptContainer) this.promptContainer.setVisible(visible);
    if (this.promptText) this.promptText.setVisible(visible);
    if (this.zoneBannerContainer) this.zoneBannerContainer.setVisible(visible);
    if (this.activePopup) this.activePopup.setVisible(visible);
    // V1.4: Widget thời gian & Huy hiệu trạng thái phụ
    if (this.quickActionButtonsContainer) this.quickActionButtonsContainer.setVisible(visible);
    if (this.timeWidgetBg) this.timeWidgetBg.setVisible(visible);
    if (this.timeClockDialImg) this.timeClockDialImg.setVisible(visible);
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
    if (this.quickCraftSidebar) this.quickCraftSidebar.hideFlyout();
    this.setHUDVisible(false);
    this.setDialogueActive(true);
    this.updateVerticalTaskbarStates();
  }

  public handleModalClosed(): void {
    this.lastModalCloseTime = Date.now();
    this.updateVerticalTaskbarStates();
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
      this.focusGameCanvas();
    }
  }

  public handleESC(): void {
    if (this.gameOverModal && this.gameOverModal.isOpen) return;
    const gameScene = this.scene.get('GameScene') as any;
    if (gameScene && gameScene.endingSystem && gameScene.endingSystem.isEndingActive) {
      if (gameScene.endingSystem.canReturnToMenu()) {
        gameScene.endingSystem.returnToMainMenu();
      }
      return;
    }
    if (gameScene && gameScene.hitboxInspector && gameScene.hitboxInspector.isBenchmarkModalOpen()) {
      gameScene.hitboxInspector.closeBenchmarkModal();
      this.lastModalCloseTime = Date.now();
      return;
    }
    if (this.isDialogueActive) {
      if (gameScene && gameScene.dialogueSystem && gameScene.dialogueSystem.isActive) {
        gameScene.dialogueSystem.cancelDialogue();
      } else {
        this.hideDialogue();
      }
      this.lastModalCloseTime = Date.now();
      return;
    }
    if (this.craftingModal && this.craftingModal.isOpen) { this.craftingModal.close(); return; }
    if (this.journalModal && this.journalModal.isOpen) { this.journalModal.close(); return; }
    if (this.tornPageModal && this.tornPageModal.isOpen) { this.tornPageModal.close(); return; }
    if (this.equipmentModal && this.equipmentModal.isOpen) { this.equipmentModal.close(); return; }
    if (this.storageChestModal && this.storageChestModal.isOpen) { this.storageChestModal.close(); return; }
    if (this.campfireModal && this.campfireModal.isOpen) { this.campfireModal.close(); return; }
    if (this.cauldronModal && this.cauldronModal.isOpen) { this.cauldronModal.close(); return; }
    if (this.parchmentWorldMapModal && this.parchmentWorldMapModal.isOpen) { this.parchmentWorldMapModal.close(); return; }

    const now = Date.now();
    if (now - (this.lastModalCloseTime || 0) < 250) return;
    if (gameScene && now - (gameScene.lastModalCloseTime || 0) < 250) return;

    this.selectQuickSlot(7);
    this.togglePause();
  }

  public toggleCrafting(): void {
    if (this.gameOverModal && this.gameOverModal.isOpen) return;
    if (this.isDialogueActive) return;
    AudioManager.getInstance().playInteract();
    if (this.pauseModal && this.pauseModal.isOpen) {
      this.pauseModal.close();
    }
    if (this.journalModal && this.journalModal.isOpen) {
      this.journalModal.close();
    }
    if (this.tornPageModal && this.tornPageModal.isOpen) {
      this.tornPageModal.close();
    }
    const modal = this.getCraftingModal();
    modal.toggle();
  }

  public openCraftingBench(): void {
    if (this.gameOverModal && this.gameOverModal.isOpen) return;
    if (this.isDialogueActive) return;
    AudioManager.getInstance().playInteract();
    if (this.pauseModal && this.pauseModal.isOpen) {
      this.pauseModal.close();
    }
    if (this.journalModal && this.journalModal.isOpen) {
      this.journalModal.close();
    }
    if (this.tornPageModal && this.tornPageModal.isOpen) {
      this.tornPageModal.close();
    }
    const modal = this.getCraftingModal();
    if (!modal.isOpen) {
      modal.open();
    }
  }

  public toggleJournal(): void {
    if (this.gameOverModal && this.gameOverModal.isOpen) return;
    if (this.isDialogueActive) return;
    AudioManager.getInstance().playInteract();
    if (this.pauseModal && this.pauseModal.isOpen) {
      this.pauseModal.close();
    }
    if (this.craftingModal && this.craftingModal.isOpen) {
      this.craftingModal.close();
    }
    if (this.tornPageModal && this.tornPageModal.isOpen) {
      this.tornPageModal.close();
    }
    if (this.journalModal) {
      this.journalModal.toggle();
    }
  }

  public openWorldMap(): void {
    if (this.gameOverModal && this.gameOverModal.isOpen) return;
    if (this.isDialogueActive) return;
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
    if (this.isDialogueActive) return;
    if (Date.now() - this.lastModalCloseTime < 300) return;
    AudioManager.getInstance().playInteract();
    if (this.craftingModal && this.craftingModal.isOpen) {
      this.craftingModal.close();
      return;
    }
    if (this.journalModal && this.journalModal.isOpen) {
      this.journalModal.close();
      return;
    }
    if (this.equipmentModal && this.equipmentModal.isOpen) {
      this.equipmentModal.close();
      return;
    }
    if (this.storageChestModal && this.storageChestModal.isOpen) {
      this.storageChestModal.close();
      return;
    }
    if (this.campfireModal && this.campfireModal.isOpen) {
      this.campfireModal.close();
      return;
    }
    if (this.cauldronModal && this.cauldronModal.isOpen) {
      this.cauldronModal.close();
      return;
    }
    if (this.parchmentWorldMapModal && this.parchmentWorldMapModal.isOpen) {
      this.parchmentWorldMapModal.close();
      return;
    }
    if (this.tornPageModal && this.tornPageModal.isOpen) {
      this.tornPageModal.close();
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
    if (this.isDialogueActive) return;
    const modal = this.getEquipmentModal();
    modal.toggle();
  }

  public getMiniMapWidget(): MiniMapWidget {
    if (!this.miniMapWidget) {
      if (!this.playerState) {
        this.playerState = PlayerState.getInstance();
      }
      this.miniMapWidget = new MiniMapWidget(this, this.playerState);
    }
    return this.miniMapWidget;
  }

  public getParchmentWorldMapModal(): ParchmentWorldMapModal {
    if (!this.parchmentWorldMapModal) {
      if (!this.playerState) {
        this.playerState = PlayerState.getInstance();
      }
      this.parchmentWorldMapModal = new ParchmentWorldMapModal(this, this.playerState);
      this.parchmentWorldMapModal.onOpen = () => this.handleModalOpened();
      this.parchmentWorldMapModal.onClose = () => this.handleModalClosed();
    }
    return this.parchmentWorldMapModal;
  }

  public getTornPageModal(): TornPageModal {
    if (!this.tornPageModal) {
      this.tornPageModal = new TornPageModal(this);
      this.tornPageModal.onOpen = () => this.handleModalOpened();
      this.tornPageModal.onClose = () => this.handleModalClosed();
    }
    return this.tornPageModal;
  }

  public openTornPage(entry: TornPageEntry, onStowCallback?: () => void): void {
    if (this.gameOverModal && this.gameOverModal.isOpen) return;
    if (this.isDialogueActive) return;
    if (this.pauseModal && this.pauseModal.isOpen) this.pauseModal.close();
    if (this.craftingModal && this.craftingModal.isOpen) this.craftingModal.close();
    if (this.journalModal && this.journalModal.isOpen) this.journalModal.close();
    if (this.equipmentModal && this.equipmentModal.isOpen) this.equipmentModal.close();
    if (this.storageChestModal && this.storageChestModal.isOpen) this.storageChestModal.close();
    if (this.campfireModal && this.campfireModal.isOpen) this.campfireModal.close();
    if (this.cauldronModal && this.cauldronModal.isOpen) this.cauldronModal.close();
    if (this.parchmentWorldMapModal && this.parchmentWorldMapModal.isOpen) this.parchmentWorldMapModal.close();

    this.handleModalOpened();
    this.setInteractionPrompt(null);

    const modal = this.getTornPageModal();
    modal.onStow = (stowedEntry) => {
      if (stowedEntry.loreId) {
        this.showPopupMessage(`📜 Đã cất vào Sổ Tay [J]: "${stowedEntry.title}"`);
      }
      if (onStowCallback) onStowCallback();
    };
    modal.open(entry);
  }

  public openPaperNote(entry: TornPageEntry, onStowCallback?: () => void): void {
    this.openTornPage(entry, onStowCallback);
  }

  public toggleMiniMap(): boolean {
    // V152-06A: Phím [N] mở trực tiếp Bản Đồ Giấy Da ParchmentWorldMapModal, không thông báo tắt mini-map
    return this.toggleWorldMap();
  }

  public toggleWorldMap(): boolean {
    if (this.isDialogueActive) return false;
    const now = performance.now();
    if (now - this.lastWorldMapToggleTime < 250) {
      return this.parchmentWorldMapModal ? this.parchmentWorldMapModal.isOpen : false;
    }
    this.lastWorldMapToggleTime = now;
    if (this.gameOverModal && this.gameOverModal.isOpen) return false;
    if (this.pauseModal && this.pauseModal.isOpen) this.pauseModal.close();
    if (this.craftingModal && this.craftingModal.isOpen) this.craftingModal.close();
    if (this.journalModal && this.journalModal.isOpen) this.journalModal.close();
    if (this.equipmentModal && this.equipmentModal.isOpen) this.equipmentModal.close();
    if (this.storageChestModal && this.storageChestModal.isOpen) this.storageChestModal.close();
    if (this.campfireModal && this.campfireModal.isOpen) this.campfireModal.close();
    if (this.cauldronModal && this.cauldronModal.isOpen) this.cauldronModal.close();
    if (this.tornPageModal && this.tornPageModal.isOpen) this.tornPageModal.close();
    const mapModal = this.getParchmentWorldMapModal();
    return mapModal.toggle();
  }

  public updateMiniMapZone(
    zone: ZoneData,
    colliders?: { x: number; y: number; width: number; height: number }[],
    transitions?: TransitionZone[]
  ): void {
    const mm = this.getMiniMapWidget();
    mm.updateZoneTerrain(zone, colliders, transitions);
    this.updateZoneBadge(zone.name);
  }

  public updateZoneBadge(zoneName?: string): void {
    if (!this.zoneBadgeText) return;
    const name = zoneName || this.lastZoneBadgeName || 'Làng Bellhollow';
    this.lastZoneBadgeName = name;
    this.zoneBadgeText.setText(`🧭 ${name}`);
  }

  public updateMiniMap(
    playerX: number,
    playerY: number,
    facing: string,
    litLanterns: { x: number; y: number }[] = [],
    campfires: { x: number; y: number }[] = []
  ): void {
    if (this.miniMapWidget) {
      this.miniMapWidget.updateDynamicMarkers(playerX, playerY, facing, litLanterns, campfires);
    }
  }

  public showPopupMessage(msg: string): void {
    if (this.activePopupTween) {
      this.activePopupTween.stop();
      this.activePopupTween = undefined;
    }

    // BUG-028: Tái sử dụng Text pooled đặt tại Y=205 trôi nhẹ lên Y=195 -> Y=185, hoàn toàn tách biệt khỏi Zone Banner (Y=138, đáy 165)
    if (!this.pooledPopupText) {
      this.pooledPopupText = HDTextHelper.createText(this, 640, 205, '', {
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
    popup.setPosition(640, 205);
    popup.setAlpha(1);
    popup.setVisible(true);

    this.activePopup = popup;

    // V152-06A: Tăng thời lượng hiển thị thông báo lên 4.5 đến 6.0 giây (+40ms/ký tự, tối đa 7.5s) kèm fade-out 0.5s
    const holdDuration = Math.min(7000, Math.max(4000, 4000 + msg.length * 40));
    const fadeDuration = 500;

    this.activePopupTween = this.tweens.add({
      targets: popup,
      y: 195,
      duration: 250,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.activePopupTween = this.tweens.add({
          targets: popup,
          alpha: 0,
          y: 185,
          delay: holdDuration,
          duration: fadeDuration,
          ease: 'Quad.easeIn',
          onComplete: () => {
            popup.setVisible(false);
            if (this.activePopup === popup) {
              this.activePopup = undefined;
              this.activePopupTween = undefined;
            }
          }
        });
      }
    });
  }

  /**
   * V15-29: Hiển thị thông báo nhỏ góc màn hình khi bật/tắt chế độ Debug Quản trị viên [F9]
   */
  public showDebugToast(msg: string): void {
    if (this.debugToastTween) {
      this.debugToastTween.stop();
      this.debugToastTween = undefined;
    }

    const isOn = msg.includes('BẬT');
    const toastW = 340;
    const toastH = 32;
    const posX = 1260 - toastW;
    const posY = 18;

    if (!this.debugToastContainer) {
      this.debugToastContainer = this.add.container(posX, posY);
      this.debugToastContainer.setScrollFactor(0);
      this.debugToastContainer.setDepth(100005);

      this.debugToastBg = this.add.graphics();
      this.debugToastText = HDTextHelper.createText(this, toastW / 2, toastH / 2, '', {
        fontFamily: 'Consolas, "Courier New", monospace',
        fontSize: '12px',
        fontStyle: 'bold',
        color: isOn ? '#00ffcc' : '#ffaa44',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5, 0.5);

      this.debugToastContainer.add([this.debugToastBg, this.debugToastText]);
    }

    if (this.debugToastBg && this.debugToastText) {
      this.debugToastBg.clear();
      // Nền đen bảng tối bán trong suốt
      this.debugToastBg.fillStyle(0x0b1118, 0.92);
      this.debugToastBg.fillRoundedRect(0, 0, toastW, toastH, 6);
      // Viền sáng tương phản: Xanh ngọc neon (BẬT) hoặc Vàng cam hổ phách (TẮT)
      const borderColor = isOn ? 0x00ffcc : 0xe67e22;
      this.debugToastBg.lineStyle(1.5, borderColor, 0.95);
      this.debugToastBg.strokeRoundedRect(0, 0, toastW, toastH, 6);
      this.debugToastBg.lineStyle(1, 0x000000, 0.5);
      this.debugToastBg.strokeRoundedRect(1, 1, toastW - 2, toastH - 2, 5);

      this.debugToastText.setColor(isOn ? '#00ffcc' : '#f39c12');
      this.debugToastText.setText(msg);
    }

    this.debugToastContainer.setPosition(posX, posY);
    this.debugToastContainer.setAlpha(1);
    this.debugToastContainer.setVisible(true);

    this.debugToastTween = this.tweens.add({
      targets: this.debugToastContainer,
      alpha: 0,
      duration: 2500,
      ease: 'Power2',
      delay: 1000,
      onComplete: () => {
        if (this.debugToastContainer) {
          this.debugToastContainer.setVisible(false);
        }
        this.debugToastTween = undefined;
      }
    });
  }

  /**
   * Dựng khung hộp thoại ở đáy Canvas với chỗ trống cho lời thoại dài và lời nhắc tiếp tục.
   */
  private buildDialogueUI(): void {
    if (this.dialogueContainer) return;

    const boxWidth = 1060;
    const boxHeight = DIALOGUE_HEIGHT;
    const halfW = boxWidth / 2;
    const halfH = boxHeight / 2;

    this.dialogueContainer = this.add.container(640, DIALOGUE_BOTTOM - halfH);
    this.dialogueContainer.setDepth(9000);

    // V152-06B: Khung hộp thoại Pixel Art từ UI Pack
    let dialogueBgSprite: Phaser.GameObjects.Image | undefined;
    if (this.textures.exists('ui_pack_panel_dialogue')) {
      dialogueBgSprite = this.add.image(0, 0, 'ui_pack_panel_dialogue');
      dialogueBgSprite.setDisplaySize(boxWidth, boxHeight);
      dialogueBgSprite.setTint(0xbaa187);
      dialogueBgSprite.setAlpha(0.65);
    }

    // Nền hộp thoại giấy da cổ sẫm màu viền đồng cổ kính (V15-25)
    const bg = this.add.graphics();
    bg.fillStyle(0x140e0a, 0.96);
    bg.fillRoundedRect(-halfW, -halfH, boxWidth, boxHeight, 8);
    // Viền đồng kép cổ kính
    bg.lineStyle(2, 0x6e5228, 1);
    bg.strokeRoundedRect(-halfW, -halfH, boxWidth, boxHeight, 8);
    bg.lineStyle(1, 0x8c6d3b, 0.85);
    bg.strokeRoundedRect(-halfW + 3, -halfH + 3, boxWidth - 6, boxHeight - 6, 6);

    // 4 Đinh tán đồng tại 4 góc
    const rivetOffset = 11;
    const drawRivet = (rx: number, ry: number) => {
      bg.fillStyle(0x2d1f14, 0.95);
      bg.fillCircle(rx, ry, 3.5);
      bg.fillStyle(0xb89058, 0.95);
      bg.fillCircle(rx, ry, 2.2);
    };
    drawRivet(-halfW + rivetOffset, -halfH + rivetOffset);
    drawRivet(halfW - rivetOffset, -halfH + rivetOffset);
    drawRivet(-halfW + rivetOffset, halfH - rivetOffset);
    drawRivet(halfW - rivetOffset, halfH - rivetOffset);

    // Vách ngăn kim loại mảnh phân chia khung ảnh chân dung và nội dung thoại
    bg.lineStyle(1, 0x4a361e, 0.65);
    bg.lineBetween(-halfW + 104, -halfH + 16, -halfW + 104, halfH - 16);

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

    // Khung chân dung bên trái đóng viền trang trọng (76×76 px, căn giữa theo trục Y: -38 đến +38)
    const portraitBg = this.add.graphics();
    const pX = -halfW + 56;
    const pY = 0;
    const pSize = 76;
    portraitBg.fillStyle(0x1a1410, 1);
    portraitBg.fillRoundedRect(pX - pSize / 2, pY - pSize / 2, pSize, pSize, 6);
    portraitBg.lineStyle(1.5, 0x8c6d3b, 1);
    portraitBg.strokeRoundedRect(pX - pSize / 2, pY - pSize / 2, pSize, pSize, 6);
    portraitBg.lineStyle(0.5, 0xd4af37, 0.5);
    portraitBg.strokeRoundedRect(pX - pSize / 2 + 2, pY - pSize / 2 + 2, pSize - 4, pSize - 4, 4);

    // Chân dung người nói chuẩn Pixel Art 64×64 px nguyên bản sắc nét
    this.dialoguePortraitSprite = this.add.image(pX, pY, 'satyr_portrait');
    this.dialoguePortraitSprite.setDisplaySize(64, 64);

    // BUG-040: Huy hiệu nền bảng tên người nói (Speaker Nameplate Badge Graphics) căn chỉnh chuẩn xác theo nội dung
    this.dialogueSpeakerBadgeGfx = this.add.graphics();

    // Tên người nói nổi bật chuẩn HD Tiếng Việt (Cỡ 19px bold vàng kim Ember Gold)
    this.dialogueSpeakerText = HDTextHelper.createText(this, -halfW + 126, -halfH + 18, '', {
      fontSize: '19px',
      fontStyle: 'bold',
      color: '#f1c40f',
      stroke: '#000000',
      strokeThickness: 2.5,
      padding: { left: 4, right: 6, top: 2, bottom: 2 }
    });

    // Chức danh / Vai trò người nói (Cỡ 13px bold ngà ấm áp)
    this.dialogueSpeakerTitleText = HDTextHelper.createText(this, -halfW + 126, -halfH + 22, '', {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#d8ccb8',
      stroke: '#000000',
      strokeThickness: 2,
      padding: { left: 2, right: 6, top: 2, bottom: 2 }
    });

    // Vạch đồng kẻ ngang mảnh trang trí dưới tên người nói
    this.dialogueNameDivider = this.add.graphics();
    this.dialogueNameDivider.lineStyle(1, 0x5c4224, 0.7);
    this.dialogueNameDivider.lineBetween(-halfW + 120, -halfH + 48, halfW - 24, -halfH + 48);

    // Nội dung câu thoại chuẩn HD Tiếng Việt (Cỡ 17px ngà ấm, lề đệm an toàn padding chống lẹm chữ 100%)
    this.dialogueContentText = HDTextHelper.createText(this, -halfW + 120, -halfH + 58, '', {
      fontSize: '17px',
      color: '#f5eedc',
      wordWrap: { width: boxWidth - 160, useAdvancedWrap: true },
      lineSpacing: 5,
      stroke: '#000000',
      strokeThickness: 1.5,
      padding: { left: 6, right: 8, top: 4, bottom: 4 }
    });

    // Lời nhắc tiếp tục chuẩn HD Tiếng Việt
    this.dialogueContinuePrompt = HDTextHelper.createText(this, halfW - 28, halfH - 22, '▶ [E / SPACE]', {
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#d8ccb8'
    }).setOrigin(1, 0.5);

    const dialogueElements: Phaser.GameObjects.GameObject[] = [
      ...(dialogueBgSprite ? [dialogueBgSprite] : []),
      bg,
      portraitBg,
      this.dialoguePortraitSprite,
      this.dialogueSpeakerBadgeGfx,
      this.dialogueSpeakerText,
      this.dialogueSpeakerTitleText,
      this.dialogueNameDivider,
      this.dialogueContentText,
      this.dialogueContinuePrompt
    ];
    this.dialogueContainer.add(dialogueElements);

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

    // BUG-040 & BUG-041: Phân tách Tên và Chức danh chuẩn xác, không kéo dãn ribbon
    const parts = speaker.split(/\s*[–—-]\s*/);
    const nameStr = parts[0] ? parts[0].trim() : speaker;
    const titleStr = parts.length > 1 ? parts.slice(1).join(' • ').trim() : '';

    if (this.dialogueSpeakerText) {
      this.dialogueSpeakerText.setText(nameStr);
    }
    if (this.dialogueSpeakerTitleText) {
      if (titleStr) {
        this.dialogueSpeakerTitleText.setText(`• ${titleStr}`);
        this.dialogueSpeakerTitleText.setX(this.dialogueSpeakerText.x + this.dialogueSpeakerText.width + 8);
        this.dialogueSpeakerTitleText.setVisible(true);
      } else {
        this.dialogueSpeakerTitleText.setText('');
        this.dialogueSpeakerTitleText.setVisible(false);
      }
    }

    if (this.dialogueSpeakerBadgeGfx) {
      this.dialogueSpeakerBadgeGfx.clear();
      const halfW = 1060 / 2;
      const halfH = DIALOGUE_HEIGHT / 2;
      const totalTextW = (this.dialogueSpeakerText?.width || 0) + (titleStr ? (this.dialogueSpeakerTitleText?.width || 0) + 8 : 0);
      const badgeW = Math.max(160, totalTextW + 28);
      const badgeH = 30;
      const badgeX = -halfW + 118;
      const badgeY = -halfH + 15;

      this.dialogueSpeakerBadgeGfx.fillStyle(0x1a120c, 0.92);
      this.dialogueSpeakerBadgeGfx.fillRoundedRect(badgeX, badgeY, badgeW, badgeH, 4);
      this.dialogueSpeakerBadgeGfx.lineStyle(1.2, 0x8c6d3b, 0.9);
      this.dialogueSpeakerBadgeGfx.strokeRoundedRect(badgeX, badgeY, badgeW, badgeH, 4);
      this.dialogueSpeakerBadgeGfx.lineStyle(0.5, 0xd4af37, 0.4);
      this.dialogueSpeakerBadgeGfx.strokeRoundedRect(badgeX + 1.5, badgeY + 1.5, badgeW - 3, badgeH - 3, 3);
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
        else if (speaker.includes('Canh Lửa') || speaker.includes('Vaelen')) {
          key = this.textures.exists('portrait_campfire_knight') ? 'portrait_campfire_knight' : 'portrait_campfire_knight.png';
        }
        else if (speaker.includes('Trùm Mũ') && this.textures.exists('portrait_hooded_knight')) {
          key = 'portrait_hooded_knight';
        }
        else if (this.textures.exists('wayfarer_portrait')) key = 'wayfarer_portrait';
        else key = 'satyr_portrait';
      }
      if (this.textures.exists(key)) {
        this.dialoguePortraitSprite.setTexture(key);
        const frame = this.dialoguePortraitSprite.frame;
        this.dialoguePortraitSprite.setScale(64 / Math.max(frame.width, frame.height));
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
    this.hideChoices();
    this.setDialogueActive(false);
  }

  /**
   * V1.5 - V15-16 & V15-25: Hiển thị các nút Lựa Chọn Hội Thoại (Interactive Dialogue Choices)
   * Nổi trang nhã ngay phía trên hộp thoại chính, hỗ trợ click chuột hoặc phím số [1], [2], [3]
   */
  public showChoices(choices: Array<{ text: string; index: number }>, onSelect: (index: number) => void): void {
    if (!this.dialogueChoicesContainer) {
      this.dialogueChoicesContainer = this.add.container(640, DIALOGUE_BOTTOM - DIALOGUE_HEIGHT - 20);
      this.dialogueChoicesContainer.setDepth(9100);
    }

    this.dialogueChoicesContainer.removeAll(true);
    this.dialogueChoicesContainer.setVisible(true);

    const btnWidth = 920;
    const btnHeight = 36;
    const spacing = 8;
    const totalCount = choices.length;

    choices.forEach((choice, i) => {
      // Xếp từ dưới lên trên hướng về phía đỉnh hộp thoại
      const yOffset = -((totalCount - 1 - i) * (btnHeight + spacing)) - 14;

      const btnContainer = this.add.container(0, yOffset);

      const bg = this.add.graphics();
      const drawBtn = (isHover: boolean) => {
        bg.clear();
        bg.fillStyle(isHover ? 0x261a12 : 0x140f0c, isHover ? 0.98 : 0.94);
        bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);
        bg.lineStyle(isHover ? 2 : 1.5, isHover ? 0xf1c40f : 0x7a5e35, 1);
        bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);
        bg.lineStyle(0.5, 0x4a361e, 0.7);
        bg.strokeRoundedRect(-btnWidth / 2 + 1.5, -btnHeight / 2 + 1.5, btnWidth - 3, btnHeight - 3, 5);
      };
      drawBtn(false);

      bg.setInteractive(
        new Phaser.Geom.Rectangle(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight),
        Phaser.Geom.Rectangle.Contains
      );
      if (bg.input) {
        bg.input.cursor = 'pointer';
      }

      bg.on('pointerover', () => drawBtn(true));
      bg.on('pointerout', () => drawBtn(false));
      bg.on('pointerdown', () => {
        AudioManager.getInstance().playUISelect();
        onSelect(choice.index);
      });

      const keyBadge = HDTextHelper.createText(this, -btnWidth / 2 + 18, 0, `[${choice.index + 1}]`, {
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#f39c12'
      }).setOrigin(0, 0.5);

      const choiceText = HDTextHelper.createText(this, -btnWidth / 2 + 56, 0, choice.text, {
        fontSize: '15px',
        color: '#f5eedc',
        padding: { left: 4, right: 8, top: 2, bottom: 2 }
      }).setOrigin(0, 0.5);

      btnContainer.add([bg, keyBadge, choiceText]);
      this.dialogueChoicesContainer!.add(btnContainer);
    });
  }

  /**
   * V1.5 - V15-16: Ẩn và dọn dẹp các nút lựa chọn hội thoại
   */
  public hideChoices(): void {
    if (this.dialogueChoicesContainer) {
      this.dialogueChoicesContainer.removeAll(true);
      this.dialogueChoicesContainer.setVisible(false);
    }
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
