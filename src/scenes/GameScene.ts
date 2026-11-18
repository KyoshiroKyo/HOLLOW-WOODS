import * as Phaser from 'phaser';
import { 
  SCENE_GAME, 
  SCENE_MAIN_MENU,
  LANTERN_RADIUS_NORMAL, 
  LANTERN_RADIUS_DIM 
} from '../config/Constants';
import { SatyrPlayer } from '../entities/SatyrPlayer';
import { registerSatyrAnimations } from '../animation/SatyrAnimations';
import { WorldBuilder } from '../world/WorldBuilder';
import { CameraSystem } from '../systems/camera/CameraSystem';
import { DebugOverlay } from '../utils/DebugOverlay';
import { HitboxDebugInspector } from '../utils/HitboxDebugInspector';
import { UIScene } from './UIScene';
import { PlayerState } from '../state/PlayerState';
import { SurvivalSystem } from '../systems/SurvivalSystem';
import { DialogueSystem } from '../systems/DialogueSystem';
import { InventorySystem } from '../systems/InventorySystem';
import { CraftingModal } from '../ui/CraftingModal';
import { JournalModal } from '../ui/JournalModal';
import { PauseModal } from '../ui/PauseModal';
import { GameOverModal } from '../ui/GameOverModal';
import { LeaderboardService, SubmitScoreParams } from '../services/LeaderboardService';
import { NPCEntity } from '../entities/NPCEntity';
import { VeilSystem } from '../systems/VeilSystem';
import { EchoSystem } from '../systems/EchoSystem';
import { TheListener } from '../entities/TheListener';
import { PuzzleSystem } from '../systems/PuzzleSystem';
import { EndingSystem } from '../systems/EndingSystem';
import { SaveManager, SaveData } from '../systems/SaveManager';
import { bindCloudSaveLifecycle, scheduleDebouncedSave } from '../services/CloudSaveService';
import { AudioManager, TerrainType } from '../audio/AudioManager';
import { ZoneConnectionRegistry } from '../world/ZoneConnectionRegistry';
import { WorldGatingSystem } from '../world/WorldGatingSystem';
import { FarmingSystem } from '../systems/FarmingSystem';
import { TimeSystem, lerpColor } from '../systems/TimeSystem';
import { WeatherSystem } from '../systems/WeatherSystem';
import { CampSystem } from '../systems/CampSystem';
import { CampSanctuarySystem } from '../systems/CampSanctuarySystem';
import { EquipmentSystem } from '../systems/EquipmentSystem';
import { WildlifeSystem } from '../systems/WildlifeSystem';
import { WorldEventSystem } from '../systems/WorldEventSystem';
import { TheEcho } from '../entities/TheEcho';
import { MireWardenBoss, RunePillarTarget, BrazierTarget, BossMireWarden } from '../entities/BossMireWarden';
import { BossEncounterSystem } from '../systems/BossEncounterSystem';
import { ZoneId, TransitionZone, FacingDirection, WeaponDef, WildlifeSpookEvent } from '../types';
import { TILED_PIPELINE_CONFIG } from '../config/tiledPipelineConfig';
import { YSortingModule } from '../world/modules/YSortingModule';
import { GraphicsQualitySystem, GraphicsQualitySettings } from '../systems/GraphicsQualitySystem';

export interface PlantedResinFlare {
  id: string;
  x: number;
  y: number;
  radius: number;
  startTime: number;
  duration: number;
  torchGfx?: Phaser.GameObjects.Graphics;
  flameGfx?: Phaser.GameObjects.Graphics;
  glowGfx?: Phaser.GameObjects.Graphics;
}

interface Firefly {
  anchorX: number;
  anchorY: number;
  x: number;
  y: number;
  color: number;
  baseAlpha: number;
  size: number;
  radius: number;
  speed: number;
  phaseX: number;
  phaseY: number;
  phaseAlpha: number;
}

export class GameScene extends Phaser.Scene {
  private player!: SatyrPlayer;
  private worldBuilder!: WorldBuilder;
  private cameraSystem!: CameraSystem;
  private debugOverlay!: DebugOverlay;
  private hitboxInspector!: HitboxDebugInspector;
  private uiScene!: UIScene;

  private playerState!: PlayerState;
  private survivalSystem!: SurvivalSystem;
  private dialogueSystem!: DialogueSystem;
  private inventorySystem!: InventorySystem;
  private craftingModal!: CraftingModal;
  private journalModal!: JournalModal;
  private pauseModal!: PauseModal;
  private gameOverModal!: GameOverModal;
  private endingSystem!: EndingSystem;
  private isGameOverPending: boolean = false;

  // Hệ thống Kinh Dị & AI (PASS G3 + G4)
  private veilSystem!: VeilSystem;
  private echoSystem!: EchoSystem;
  private listenerMonster!: TheListener;
  private puzzleSystem!: PuzzleSystem;

  private npcs: NPCEntity[] = [];
  // C4-13-17: Va chạm vật lý giữa người chơi và danh sách NPC làng Bellhollow
  private npcCollider?: Phaser.Physics.Arcade.Collider;
  private fogOfWarLayer!: Phaser.GameObjects.RenderTexture;
  private lastFowScreenX: number = -9999;
  private lastFowScreenY: number = -9999;
  private lastFowRadius: number = -9999;
  private lastFowColor: number = -9999;
  private lastFowAlpha: number = -9999;
  private currentLanternRadius: number = LANTERN_RADIUS_DIM;
  private lanternGlowGfx!: Phaser.GameObjects.Graphics;
  private lanternGlowImage!: Phaser.GameObjects.Image;
  private cachedLightMaskImage!: Phaser.GameObjects.Image;
  private fireflyGfx!: Phaser.GameObjects.Graphics;
  private fireflies: Firefly[] = [];
  private currentZoneId: ZoneId = 'fog_crossing';
  private previousZoneId: ZoneId = 'fog_crossing';

  // C4-13-16: Thời điểm kích hoạt gần nhất dòng suy nghĩ kể chuyện ở rào chắn phía Tây (cooldown 6 giây)
  private lastWestBarrierThoughtTime: number = 0;
  // V14-P8-13: Thời điểm kích hoạt suy nghĩ dẫn hướng khi lại gần Cầu Đá Bị Sập chặn lối thẳng
  private lastCollapsedBridgeThoughtTime: number = 0;

  // V1.5 (BƯỚC V15-05): Timer hiệu ứng rung camera và tiếng thở nhẹ cảnh báo
  private panicCameraShakeTimer: number = 0;
  private uneasyBreathingTimer: number = 0;

  private keyQ!: Phaser.Input.Keyboard.Key;
  private key3!: Phaser.Input.Keyboard.Key;
  private keyESC!: Phaser.Input.Keyboard.Key;
  private keyM!: Phaser.Input.Keyboard.Key;
  private keyN!: Phaser.Input.Keyboard.Key;
  private lastESCTime: number = 0;
  private lastMuteTime: number = 0;
  private stepNoiseTimer: number = 0;

  // Hệ thống âm thanh (Web Audio API)
  private audioManager!: AudioManager;
  private footstepTimer: number = 0;
  private lastLanternState: boolean = false;

  // C4-12-16: Hệ thống nông trại thảo dược Sanctuary Farm
  private farmingSystem!: FarmingSystem;

  // Dữ liệu chuyển giao phiên & cốt truyện
  private isContinueMode: boolean = false;
  private continueSaveData: SaveData | null = null;
  private isAct0IntroPending: boolean = false;
  private act0TutorialDone: boolean = false;
  private act0EchoGfx?: Phaser.GameObjects.Graphics;
  private isAct5ChaseActive: boolean = false;

  // C4-12-27: Quản lý chuyển vùng thế giới, chống kích hoạt lặp (debounce/cooldown) và ổn định camera
  private transitionCooldown: number = 0;
  private transitionCooldownUntil: number = 0;
  private isTransitioning: boolean = false;
  private lastTransitionId: string | null = null;
  // C4-13-19: Khống chế thời gian chờ (cooldown 4 giây) và chống nháy/chống lặp banner phân khu
  private lastZoneBannerTime: number = 0;
  private lastBannerZoneId: string = '';

  // C4-12-29: Quản lý tối ưu hóa hiệu năng (Throttled Camera Culling & Graphics Redraw guards)
  private cullingTimer: number = 0;
  private isLanternGlowDrawn: boolean = false;
  private firefliesDrawnCount: number = 0;
  private lastMonsterStaggerTime: number = 0;

  // C4-132-02: Bộ đệm phím [E] và phản hồi sưởi ấm Lửa Trại
  private lastEKeyPressTime: number = 0;
  private lastWarmthFeedbackTime: number = 0;
  private lastInDeepFog: boolean | null = null;

  // C4-14-B04: Điểm hút mở đầu 30-60s & Nhịp độ sinh tồn kinh dị
  private hasTriggeredAct0Telegraph: boolean = false;
  private unlitWildernessTimer: number = 0;
  private lastPeripheralShadowTime: number = 0;
  private wasInSanctuary: boolean = false;
  private cloudSaveCleanup?: () => void;

  // V1.4: Môi Trường, Thời Tiết & Sinh Thái Rừng
  public timeSystem!: TimeSystem;
  public weatherSystem!: WeatherSystem;
  public campSystem!: CampSystem;
  public wildlifeSystem!: WildlifeSystem;
  public worldEventSystem!: WorldEventSystem;
  private rainGfx!: Phaser.GameObjects.Graphics;
  private interactionOutlineGfx!: Phaser.GameObjects.Graphics;
  private lastCharmEchoVibrateTime: number = 0;

  // V1.4 - P6: Trận Chạm Trán Đấu Trùm Kẻ Nuốt Tiếng Chuông (Mire Warden Boss)
  public mireWardenBoss: MireWardenBoss | null = null;
  public isBossFightActive: boolean = false;
  public runePillarTargets: RunePillarTarget[] = [];
  public brazierTargets: BrazierTarget[] = [];
  public bossArenaBarrier: Phaser.GameObjects.Graphics | null = null;
  public bossArenaEchoes: TheEcho[] = [];

  // V1.4 - P8-03: Cơ chế Đuốc Nhựa Thông Cắm Đất (Resin Flare)
  public plantedFlares: PlantedResinFlare[] = [];
  private batLanternFlickerTimer: number = 0;

  constructor() {
    super({ key: SCENE_GAME });
  }

  public init(data: { isContinue?: boolean; saveData?: SaveData }): void {
    if (data && data.isContinue && data.saveData) {
      this.isContinueMode = true;
      this.continueSaveData = data.saveData;
      this.isAct0IntroPending = false;
    } else {
      this.isContinueMode = false;
      this.continueSaveData = null;
      this.isAct0IntroPending = true;
    }

    // C4-13-11: Tái lập trình toàn diện các biến trạng thái vòng đời GameScene để chống rò rỉ khi Restart / Reload
    this.isGameOverPending = false;
    this.isAct5ChaseActive = false;
    this.isTransitioning = false;
    this.transitionCooldown = 0;
    this.lastTransitionId = null;
    this.lastWestBarrierThoughtTime = 0;
    this.lastCollapsedBridgeThoughtTime = 0;
    this.lastZoneBannerTime = 0;
    this.lastBannerZoneId = '';
    this.cullingTimer = 0;
    this.isLanternGlowDrawn = false;
    this.firefliesDrawnCount = 0;
    this.lastFowScreenX = -9999;
    this.batLanternFlickerTimer = 0;
    this.lastFowScreenY = -9999;
    this.lastFowRadius = -9999;
    this.lastFowColor = -9999;
    this.lastFowAlpha = -9999;
    this.currentLanternRadius = LANTERN_RADIUS_DIM;
    this.npcs = [];
    this.fireflies = [];
    this.act0TutorialDone = false;
    this.footstepTimer = 0;
    this.stepNoiseTimer = 0;
    this.lastESCTime = 0;
    this.lastMuteTime = 0;
    this.lastMonsterStaggerTime = 0;
    this.lastEKeyPressTime = 0;
    this.lastWarmthFeedbackTime = 0;
    this.hasTriggeredAct0Telegraph = false;
    this.unlitWildernessTimer = 0;
    this.lastPeripheralShadowTime = 0;
    this.wasInSanctuary = false;
  }

  public create(): void {
    // 1. Khởi tạo trạng thái dữ liệu & hệ thống sinh tồn
    this.playerState = PlayerState.getInstance();
    if (!this.isContinueMode) {
      this.playerState.reset();
    }
    this.survivalSystem = new SurvivalSystem();
    this.cameraSystem = new CameraSystem(this);

    // 2. Đăng ký hoạt ảnh Satyr
    registerSatyrAnimations(this.anims);

    // 3. Dựng 5 phân khu thế giới kết nối
    this.worldBuilder = new WorldBuilder(this);
    this.worldBuilder.buildWorld();

    // C4-12-28: Đồng bộ toàn bộ các cổng chặn thế giới tập trung theo PlayerState
    this.worldBuilder.syncAllWorldGates(this.playerState);

    // C4-12-28: Lắng nghe sự kiện thay đổi trạng thái mở khóa thế giới tập trung
    const onWorldUnlockChanged = (data: { unlockedZones: ZoneId[]; newlyUnlocked: ZoneId[] }) => {
      this.worldBuilder.syncAllWorldGates(this.playerState);
      for (const z of data.newlyUnlocked) {
        if (z === 'crooked_path') {
          if (this.uiScene) {
            this.uiScene.showPopupMessage('🔔 Cổng Đông làng Bellhollow đã mở khóa! Lối vào Khu Rừng Rỗng (The Hollow Woods) đã thông suốt.');
          }
          this.cameraSystem?.shake(200, 0.004);
        } else if (z === 'silent_mire') {
          if (this.uiScene) {
            this.uiScene.showPopupMessage('🌫️ Lối vào Đầm Lầy Tĩnh Lặng (Silent Mire) đã khai mở!');
          }
        } else if (z === 'broken_bell_shrine') {
          if (this.uiScene) {
            this.uiScene.showPopupMessage('✨ Phong ấn Kết Giới Miếu Chuông đã tan biến! Lối vào Miếu Chuông Phế Tích đã mở.');
          }
          this.cameraSystem?.shake(250, 0.005);
        }
      }
    };
    this.playerState.on('world_unlock_changed', onWorldUnlockChanged);

    // HW-V14-CLOUDSAVE: Đăng ký các sự kiện vòng đời P2Game SDK (onBeforeUnload & auth.onChange)
    this.cloudSaveCleanup = bindCloudSaveLifecycle(() => this.captureCurrentSaveState());

    // Lắng nghe thay đổi túi đồ để gom nhóm lưu đám mây tự động (Debounce 2.5s)
    const onInventoryChanged = () => {
      this.scheduleDebouncedCloudSave();
    };
    this.playerState.on('inventory_changed', onInventoryChanged);

    this.events.once('shutdown', () => {
      this.playerState.off('world_unlock_changed', onWorldUnlockChanged);
      this.playerState.off('inventory_changed', onInventoryChanged);
      if (this.cloudSaveCleanup) {
        this.cloudSaveCleanup();
        this.cloudSaveCleanup = undefined;
      }
    });

    // 4. Khởi tạo Satyr tại điểm xuất phát hoặc điểm tải lưu
    const initialZone = this.worldBuilder.getActiveZone();
    let spawnX = initialZone.defaultSpawn.x;
    let spawnY = initialZone.defaultSpawn.y;

    // Hỗ trợ tham số URL QA/Testing (?zone=bellhollow&x=780&y=310) cho phép điều hướng trực tiếp không cần savegame
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const devZone = urlParams?.get('zone');
    const devX = urlParams?.get('x');
    const devY = urlParams?.get('y');

    if (devZone && this.worldBuilder.getZone(devZone as ZoneId)) {
      const targetZ = this.worldBuilder.getZone(devZone as ZoneId)!;
      spawnX = devX ? Number(devX) : targetZ.defaultSpawn.x;
      spawnY = devY ? Number(devY) : targetZ.defaultSpawn.y;
      this.currentZoneId = devZone as ZoneId;
      this.previousZoneId = devZone as ZoneId;
      this.playerState.setCurrentZone(devZone as ZoneId);
      this.worldBuilder.setActiveZone(devZone as ZoneId);
      // Mở khóa phân khu kiểm thử để không bị cản bởi kết giới phong ấn nhiệm vụ
      this.playerState.setFlag('east_gate_unlocked');
      this.playerState.setFlag('entered_silent_mire');
      this.playerState.setFlag('mire_unlocked');
      this.playerState.setFlag('shrine_unlocked');
    } else if (this.isContinueMode && this.continueSaveData) {
      spawnX = this.continueSaveData.playerPos.x;
      spawnY = this.continueSaveData.playerPos.y;
      // C4-13-11: Xác định chính xác phân khu thực tế từ tọa độ và cập nhật ngay lập tức cho GameScene & Camera
      const detectedZone = this.worldBuilder.detectCurrentZone({ x: spawnX, y: spawnY }) || (this.continueSaveData.zoneId as ZoneId) || 'fog_crossing';
      this.currentZoneId = detectedZone;
      this.previousZoneId = detectedZone;
      this.playerState.setCurrentZone(detectedZone);
    }

    this.player = new SatyrPlayer(this, spawnX, spawnY);
    this.player.stats.isLanternOn = this.playerState.stats.isLanternOn;
    // C4-13-01: Luôn giải phóng trạng thái ẩn nấp, bật hiển thị và mở khóa điều khiển khi tạo mới/nạp nhân vật
    this.player.stats.isHiding = false;
    this.player.setVisible(true);
    this.player.lastSafePosition = { x: spawnX, y: spawnY };
    this.player.resetAllInputState();

    // C4-132-01: Lắng nghe sự kiện vung gậy của nhân vật để xử lý âm thanh cảnh báo và quét va chạm thực thể
    this.player.on('player_attack', (hitbox: { x: number; y: number; radius: number; facing: string; playerX: number; playerY: number }) => {
      this.handlePlayerAttackHitbox(hitbox);
    });

    // V1.4 - Bước 9: Lắng nghe hiệu ứng chao đảo ánh sáng đèn lồng khi bị Dơi Sương Mù phục kích
    this.events.on('lantern_flicker', (data?: { duration?: number }) => {
      this.batLanternFlickerTimer = data?.duration || 2500;
    });

    // 5. Thiết lập va chạm vật lý với thế giới & mở rộng giới hạn không gian Vùng Lõi (C4-12-17)
    this.physics.world.setBounds(0, -250, 5000, 1400);
    this.physics.add.collider(this.player, this.worldBuilder.colliderGroup, (_playerObj, obstacleObj) => {
      if (this.player && typeof this.player.applyCornerAssistWith === 'function') {
        this.player.applyCornerAssistWith(obstacleObj as Phaser.Physics.Arcade.Sprite);
      }
    });
    if (this.isContinueMode) {
      this.unstuckPlayerFromColliders();
    }

    // 6. Khởi tạo hệ thống Camera (Chuẩn HD 1280×720 & Zoom 2.2x cho thế giới pixel art, triệt tiêu rách khe tile)
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.setZoom(2.2);
    if (!this.cameraSystem) {
      this.cameraSystem = new CameraSystem(this);
    }
    this.cameraSystem.follow(this.player);
    this.applyCameraBoundsForZone(this.currentZoneId);
    this.cameraSystem.centerOn(this.player.x, this.player.y);

    // 7. Tạo các thực thể NPC làng Bellhollow
    this.spawnNPCs();

    // 8. Khởi tạo các hệ thống G2 & G4 (Đối thoại, Túi đồ, Chế tạo, Nhật ký, Tạm dừng, Ending)
    this.dialogueSystem = new DialogueSystem(this);
    this.dialogueSystem.onDialogueStart = () => {
      if (this.player) {
        this.player.resetAllInputState();
      }
      if (this.uiScene) {
        this.uiScene.setDialogueActive(true);
      }
      for (const npc of this.npcs) {
        npc.setNearby(false);
      }
    };
    this.dialogueSystem.onDialogueEnd = () => {
      if (this.player) {
        this.player.forceUnlockActionState();
        this.player.resetAllInputState();
      }
      if (this.uiScene) {
        this.uiScene.setDialogueActive(false);
      }
      CampSanctuarySystem.getInstance().onDialogueEnd();
    };
    this.inventorySystem = new InventorySystem(this);
    this.endingSystem = new EndingSystem(this);

    // 9. Khởi tạo các hệ thống Kinh Dị & AI của PASS G3
    this.veilSystem = new VeilSystem(this);
    this.echoSystem = new EchoSystem(this);
    this.puzzleSystem = new PuzzleSystem(this);

    // Khởi tạo thực thể The Listener (Kẻ Lắng Nghe) tại khu rừng The Crooked Path
    this.spawnTheListener();

    // 10. Khởi động UIScene pixel sắc nét (Overlay)
    this.scene.launch('UIScene');
    this.uiScene = this.scene.get('UIScene') as UIScene;
    this.dialogueSystem.setView(this.uiScene);
    // GATE 3C: Kết nối UIScene (Zoom 1.0) cho EndingSystem
    this.endingSystem.setUIScene(this.uiScene);

    // GATE 1B: Kết nối CraftingModal & JournalModal từ UIScene ở Zoom 1.0 cố định
    this.craftingModal = this.uiScene.getCraftingModal();
    this.journalModal = this.uiScene.getJournalModal();
    this.craftingModal.onOpen = () => {
      if (this.player) {
        this.player.resetAllInputState();
      }
      this.uiScene.handleModalOpened();
    };
    this.craftingModal.onClose = () => {
      if (this.player) {
        this.player.resetAllInputState();
      }
      this.uiScene.handleModalClosed();
    };
    this.journalModal.onOpen = () => {
      if (this.player) {
        this.player.resetAllInputState();
      }
      this.uiScene.handleModalOpened();
    };
    this.journalModal.onClose = () => {
      if (this.player) {
        this.player.resetAllInputState();
      }
      this.uiScene.handleModalClosed();
    };

    // GATE 1C: Khởi tạo PauseModal trên UIScene ở Zoom 1.0 cố định
    this.pauseModal = new PauseModal(this.uiScene, {
      onResume: () => {},
      onSaveManual: () => this.handleSaveManual(),
      onReloadCheckpoint: () => this.handleReloadCheckpoint()
    });
    this.pauseModal.onOpen = () => {
      if (this.player) {
        this.player.resetAllInputState();
      }
      this.uiScene.handleModalOpened();
    };
    this.pauseModal.onClose = () => {
      if (this.player) {
        this.player.resetAllInputState();
      }
      this.uiScene.handleModalClosed();
    };
    this.uiScene.pauseModal = this.pauseModal;

    // C4-13-03: Khởi tạo GameOverModal trên UIScene ở Zoom 1.0 cố định
    this.gameOverModal = new GameOverModal(this.uiScene, {
      onLoadCheckpoint: () => this.handleLoadCheckpoint(),
      onRestart: () => this.handleRestartGame(),
      onMainMenu: () => this.handleReturnToMainMenu()
    });
    this.gameOverModal.onOpen = () => {
      if (this.player) {
        this.player.resetAllInputState();
      }
      this.uiScene.handleModalOpened();
    };
    this.gameOverModal.onClose = () => {
      if (this.player) {
        this.player.resetAllInputState();
      }
      this.uiScene.handleModalClosed();
    };
    this.uiScene.gameOverModal = this.gameOverModal;

    // C4-13-03: Lắng nghe sự kiện cạn kiệt sinh lực từ SurvivalSystem
    this.playerState.on('player_health_depleted', () => {
      this.triggerPlayerDeath('Sinh lực đã cạn kiệt trong màn sương mù u tối...');
    });

    // 11. Công cụ kiểm toán kỹ thuật F4 Debug (Graphics trên GameScene, Text trên UIScene Zoom 1.0)
    this.debugOverlay = new DebugOverlay(this, this.player, this.uiScene);
    // V1.5 (BƯỚC V15-04): Chế độ Kiểm tra Kỹ thuật Hitbox & Performance Profiler (Phím F9)
    // Tách biệt hoàn toàn khỏi giao diện người chơi thường, mặc định TẮT hoàn toàn (false)
    this.hitboxInspector = new HitboxDebugInspector(this, this.player, this.uiScene);
    if (this.physics && this.physics.world) {
      this.physics.world.drawDebug = false;
      if (this.physics.world.debugGraphic) {
        this.physics.world.debugGraphic.clear();
        this.physics.world.debugGraphic.setVisible(false);
      }
    }

    // 12. Tạo lớp phủ Sương Mù Động (Dynamic Fog of War) & Đom Đóm Lập Lòe (PASS T17)
    this.setupFogOfWar();
    this.setupFireflies();

    // 13. Khởi tạo hệ thống Âm thanh Khí quyển (C4-12-15)
    this.audioManager = AudioManager.getInstance();
    this.audioManager.setAmbienceZone(this.currentZoneId);
    this.playerState.setCurrentZone(this.currentZoneId);
    this.applyCameraBoundsForZone(this.currentZoneId);

    // 14. Khởi tạo Hệ thống Nông trại Thảo dược Sanctuary Farm (C4-12-16)
    this.farmingSystem = new FarmingSystem(this);

    // 15. Khởi tạo các hệ thống V1.4: Thời Gian, Thời Tiết, Trại Làng & Hệ Sinh Thái
    this.campSystem = CampSystem.getInstance();
    const savedDay = (this.playerState as any).rawSaveData?.dayNumber ?? (this.continueSaveData as any)?.dayCount ?? 1;
    const savedTime = (this.playerState as any).rawSaveData?.timeOfDay ?? (this.continueSaveData as any)?.timeOfDay ?? 0;
    this.timeSystem = new TimeSystem(savedDay, savedTime);

    // V1.5 - BƯỚC V15-07: Lắng nghe chuyển giao chu kỳ Ngày / Đêm và kích hoạt cảnh báo đêm xuống
    this.timeSystem.on('phase_changed', (evt: any) => {
      const newPhase = evt && evt.to ? evt.to : 'DAY';
      if (this.listenerMonster) {
        this.listenerMonster.setTimePhase(newPhase);
      }
      if (newPhase === 'NIGHT') {
        // Tín hiệu cảnh báo công bằng khi đêm xuống: Chuông nứt ngân trầm + tiếng sói hú xa xăm
        this.audioManager.playNightfallWarningSound();
        if (this.uiScene) {
          this.uiScene.showPopupMessage('🌙 ĐÊM SƯƠNG BUÔNG XUỐNG! Tiếng sói hú xa xăm... Kẻ Lắng Nghe và bầy quái vật bước vào trạng thái Săn Đêm!');
        }
        this.cameras.main.shake(350, 0.0025);
        if (this.listenerMonster) {
          this.listenerMonster.onNightfall();
        }
      }
    });

    this.weatherSystem = new WeatherSystem();
    this.rainGfx = this.add.graphics();
    this.rainGfx.setScrollFactor(0);
    this.rainGfx.setDepth(5010);
    this.interactionOutlineGfx = this.add.graphics();
    this.interactionOutlineGfx.setDepth(999);
    this.wildlifeSystem = new WildlifeSystem(this);
    this.wildlifeSystem.switchZone(this.currentZoneId);
    this.triggerCreatureObservationsForZone(this.currentZoneId);
    this.worldEventSystem = new WorldEventSystem(this);

    // Lắng nghe sự kiện đàn quạ giật mình bay lên đánh động The Listener
    this.events.on('wildlife_spooked', (evt: WildlifeSpookEvent) => {
      this.playerState.observeCreature('crow');
      if (this.listenerMonster && this.listenerMonster.ai) {
        this.listenerMonster.ai.triggerSoundAlert(evt.x, evt.y, 0.75);
      }
    });

    // V1.4 - P8-08: Lắng nghe sự kiện hạ gục Sói Xương (Skull Wolf)
    this.events.on('skull_wolf_defeated', () => {
      if (this.uiScene) {
        this.uiScene.showPopupMessage('🦴 Sói Xương tan biến thành tro tàn! Nhận được Nanh Xương Cổ!');
      }
    });

    // V1.4 - P8-09: Lắng nghe các sự kiện Quái Vật Bóng Tối (Shadow Monsters)
    this.events.on('shadow_crow_alarm', () => {
      if (this.uiScene) {
        this.uiScene.showPopupMessage('⚠️ Tiếng Quạ Bóng Tối rít xé gió! Kẻ Lắng Nghe đang hướng về đây!');
      }
    });
    this.events.on('shadow_crow_defeated', () => {
      if (this.uiScene) {
        this.uiScene.showPopupMessage('💀 Quạ Bóng Tối đã bị đánh rơi!');
      }
    });
    this.events.on('shadow_eyes_drain', () => {
      if (this.uiScene) {
        this.uiScene.showPopupMessage('👁️ Cặp mắt trong sương rút cạn Bình Tâm! Bật Đèn Lồng [F] ngay!');
      }
    });
    this.events.on('shadow_eyes_vanished', () => {
      if (this.uiScene) {
        this.uiScene.showPopupMessage('✨ Ánh sáng đèn lồng đã xua tan Bóng Mắt Sương Mù!');
      }
    });
    this.events.on('behemoth_slam_warning', () => {
      this.cameraSystem.shake(250, 0.015);
      if (this.uiScene) {
        this.uiScene.showPopupMessage('⚠️ MẶT ĐẤT CHẤN ĐỘNG! Trùm Bóng Tối đang chuẩn bị đập đất!');
      }
    });
    this.events.on('shadow_behemoth_defeated', () => {
      if (this.uiScene) {
        this.uiScene.showPopupMessage('👑 TRÙM BÓNG TỐI ĐÃ BỊ HẠ GỤC! Nhận được Mảnh Tinh Chất Bóng Tối!');
      }
    });

    // V1.4 - P8-10: Lắng nghe các sự kiện Nhóm Hiệp Sĩ Tà Ác (Evil Knights Faction)
    this.events.on('fallen_knight_defeated', () => {
      if (this.uiScene) {
        this.uiScene.showPopupMessage('⚔ Hiệp Sĩ Sa Ngã đã gục ngã! Thu được Gỗ Khô!');
      }
    });
    this.events.on('dread_horseman_defeated', () => {
      if (this.uiScene) {
        this.uiScene.showPopupMessage('🐎 Kỵ Binh Hắc Ám đã bị đánh bại! Thu được Đá Lửa!');
      }
    });
    this.events.on('hooded_knight_powerup_start', () => {
      if (this.uiScene) {
        this.uiScene.showPopupMessage('⚠️ CHỈ HUY HIỆP SĨ ĐANG TỤ TÀ KHÍ! Áp sát rọi Đèn Lồng [F] để phá chiêu!');
      }
    });
    this.events.on('hooded_knight_interrupted', () => {
      this.cameraSystem.shake(180, 0.01);
      if (this.uiScene) {
        this.uiScene.showPopupMessage('⚡ ĐÃ PHÁ CHIÊU! Chỉ Huy Hiệp Sĩ bị Choáng Váng (Stagger), nhận x2 sát thương!');
      }
    });
    this.events.on('hooded_knight_defeated', () => {
      this.playerState.setFlag('boss_hooded_knight_defeated');
      if (this.uiScene) {
        this.uiScene.showPopupMessage('👑 CHỈ HUY HIỆP SĨ TRÙM MŨ ĐÃ BỊ HẠ GỤC! Thu được Huy Hiệu Hiệp Sĩ Tha Hóa!');
      }
    });

    // Lắng nghe các Sự Kiện Thế Giới (World Events)
    this.events.on('world_event_triggered', (evt: any) => {
      if (this.uiScene && evt && evt.message) {
        this.uiScene.showPopupMessage(evt.message);
      }
      if (evt && evt.type === 'event_crow_alarm' && this.listenerMonster && this.listenerMonster.ai) {
        const alertX = this.player.x + (Math.random() > 0.5 ? 240 : -240);
        const alertY = this.player.y + (Math.random() > 0.5 ? 180 : -180);
        this.listenerMonster.ai.triggerSoundAlert(alertX, alertY, 0.65);
      }
    });

    // Lắng nghe thông báo nhiệm vụ & sinh tồn từ PlayerState và Quickbar UIScene
    const onQ03ResourcesReady = () => {
      if (this.uiScene && this.playerState.currentQuestId === 'Q03_PREPARE_RESOURCES') {
        this.uiScene.showPopupMessage('✔ Đã đủ Gỗ Khô & Nhựa Cây! Nhấn [I] hoặc đến Bàn Chế Tạo để pha Dầu Đèn.');
      }
    };
    const onLanternEmpty = () => {
      if (this.uiScene) {
        this.uiScene.showPopupMessage('⚠️ Đèn lồng đã cạn sạch dầu! Nhấn [2] để nạp Bình Dầu Đèn.');
      }
    };
    const onUIToggleLantern = () => {
      if (this.isGameplayInputLocked()) return;
      this.player.toggleLantern();
      if (this.uiScene) {
        this.uiScene.selectQuickSlot(3);
      }
    };
    const onUIThrowLure = () => {
      if (this.isGameplayInputLocked()) return;
      this.tryThrowNoiseLure();
      if (this.uiScene) {
        this.uiScene.selectQuickSlot(2);
      }
    };

    this.playerState.on('q03_resources_ready', onQ03ResourcesReady);
    this.playerState.on('lantern_empty', onLanternEmpty);
    this.uiScene.events.on('ui_toggle_lantern', onUIToggleLantern);
    this.uiScene.events.on('ui_throw_lure', onUIThrowLure);

    // Dọn dẹp âm thanh, thực thể, đồ họa & listener khi tắt scene (C4-13-09)
    this.events.once('shutdown', () => {
      this.audioManager.cleanupAudioLoops();
      this.audioManager.setHeartbeatActive(false);
      this.audioManager.stopAmbience();
      if (this.farmingSystem) {
        this.farmingSystem.destroy();
      }
      if (this.worldBuilder) {
        this.worldBuilder.destroy();
      }
      if (this.veilSystem) {
        this.veilSystem.destroy();
      }
      if (this.npcCollider) {
        this.npcCollider.destroy();
        this.npcCollider = undefined;
      }
      for (const npc of this.npcs) {
        npc.destroy();
      }
      this.npcs = [];
      if (this.listenerMonster) {
        this.listenerMonster.destroy();
      }
      if (this.player) {
        this.player.destroy();
      }
      if (this.fireflyGfx) {
        this.fireflyGfx.destroy();
      }
      if (this.lanternGlowGfx) {
        this.lanternGlowGfx.destroy();
      }
      if (this.lanternGlowImage) {
        this.lanternGlowImage.destroy();
      }
      if (this.fogOfWarLayer) {
        this.fogOfWarLayer.destroy();
        this.fogOfWarLayer = undefined as any;
      }
      if (this.cachedLightMaskImage) {
        this.cachedLightMaskImage.destroy();
        this.cachedLightMaskImage = undefined as any;
      }
      if (this.pauseModal) {
        this.pauseModal = undefined as any;
      }
      if (this.gameOverModal) {
        this.gameOverModal = undefined as any;
      }
      this.craftingModal = undefined as any;
      this.journalModal = undefined as any;
      if (this.timeSystem) {
        this.timeSystem.destroy();
      }
      if (this.weatherSystem) {
        this.weatherSystem.destroy();
      }
      if (this.wildlifeSystem) {
        this.wildlifeSystem.destroy();
      }
      if (this.worldEventSystem) {
        this.worldEventSystem.destroy();
      }
      if (this.rainGfx) {
        this.rainGfx.destroy();
      }
      if (this.interactionOutlineGfx) {
        this.interactionOutlineGfx.destroy();
      }
      this.tweens.killAll();
      this.time.removeAllEvents();
      this.playerState.off('q03_resources_ready', onQ03ResourcesReady);
      this.playerState.off('lantern_empty', onLanternEmpty);
      if (this.keyESC) this.keyESC.removeAllListeners();
      if (this.keyM) this.keyM.removeAllListeners();
      if (this.keyN) this.keyN.removeAllListeners();
      if (this.keyQ) this.keyQ.removeAllListeners();
      if (this.key3) this.key3.removeAllListeners();
      for (const flare of this.plantedFlares) {
        if (flare.torchGfx) flare.torchGfx.destroy();
        if (flare.flameGfx) flare.flameGfx.destroy();
        if (flare.glowGfx) flare.glowGfx.destroy();
      }
      this.plantedFlares = [];
      if (this.uiScene && this.uiScene.events) {
        this.uiScene.events.off('ui_toggle_lantern', onUIToggleLantern);
        this.uiScene.events.off('ui_throw_lure', onUIThrowLure);
      }
    });

    // Cài đặt các phím tắt
    if (this.input && this.input.keyboard) {
      this.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
      this.key3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
      this.key3.on('down', () => this.tryPlantResinFlare());
      this.keyESC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
      this.keyESC.on('down', () => this.handleESCPress());

      // Phím M mở Bản đồ Thế giới Giấy Da (Parchment World Map)
      this.keyM = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
      this.keyM.on('down', () => {
        if (this.uiScene) {
          this.uiScene.toggleWorldMap();
        }
      });

      // Phím N bật/tắt Mini-map góc trên phải (Woodland Compact Compass Map)
      this.keyN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N);
      this.keyN.on('down', () => {
        if (this.uiScene) {
          this.uiScene.toggleMiniMap();
        }
      });
    }

    // C4-12-24: Khôi phục trạng thái hoàn thành Câu Đố Ba Cột Đá nếu cờ đã lưu
    if (this.playerState.hasFlag('mire_pillars_solved')) {
      this.puzzleSystem.isMirePuzzleSolved = true;
      this.worldBuilder.triggerRunePuzzleSolvedCelebration();
    }

    // C4-12-29: Cập nhật culling ngay khi khởi tạo xong thế giới
    this.worldBuilder.updateCameraCulling(this.cameras.main);

    // 14. Xử lý mở đầu Act 0 hoặc hiển thị tiếp tục
    if (this.isAct0IntroPending) {
      this.startAct0Intro();
    } else {
      this.time.delayedCall(500, () => {
        if (this.uiScene) {
          const zone = this.worldBuilder.getActiveZone();
          this.lastZoneBannerTime = performance.now();
          this.lastBannerZoneId = zone.id;
          this.uiScene.showZoneBanner(zone.atmosphere);
          this.uiScene.showPopupMessage('▶ Đã tiếp tục chuyến hành trình!');
        }
      });
    }
  }

  private handleESCPress(): void {
    if (this.isGameOverPending || (this.gameOverModal && this.gameOverModal.isOpen) || (this.player && this.player.isDead())) {
      return;
    }
    const now = performance.now();
    if (now - this.lastESCTime < 200) return;
    this.lastESCTime = now;

    if (this.endingSystem && this.endingSystem.isEndingActive) {
      if (this.endingSystem.canReturnToMenu()) {
        this.endingSystem.returnToMainMenu();
      }
      return;
    }

    if (this.craftingModal && this.craftingModal.isOpen) {
      this.craftingModal.close();
      return;
    }
    if (this.journalModal && this.journalModal.isOpen) {
      this.journalModal.close();
      return;
    }
    if (this.uiScene && this.uiScene.parchmentWorldMapModal && this.uiScene.parchmentWorldMapModal.isOpen) {
      this.uiScene.parchmentWorldMapModal.close();
      return;
    }
    if (this.hitboxInspector && this.hitboxInspector.isBenchmarkModalOpen()) {
      this.hitboxInspector.closeBenchmarkModal();
      return;
    }
    if (this.dialogueSystem && this.dialogueSystem.isActive) {
      this.dialogueSystem.endDialogue();
      return;
    }

    if (this.pauseModal) {
      this.pauseModal.toggle();
    }
  }

  private handleMutePress(): void {
    const now = performance.now();
    if (now - this.lastMuteTime < 200) return;
    this.lastMuteTime = now;

    const muted = this.audioManager.toggleMute();
    if (this.uiScene) {
      this.uiScene.showPopupMessage(muted ? '🔇 Đã tắt toàn bộ âm thanh [Phím M]' : '🔊 Đã bật âm thanh [Phím M]');
    }
  }

  public captureCurrentSaveState(checkpointName?: string): SaveData {
    const zone = this.worldBuilder ? this.worldBuilder.getActiveZone() : null;
    const zoneName = zone ? zone.atmosphere.titleVietnamese : this.currentZoneId;
    const cpName = checkpointName || `TIẾN TRÌNH (${zoneName})`;
    const px = this.player ? this.player.x : 800;
    const py = this.player ? this.player.y : 700;
    return SaveManager.buildSaveData(cpName, this.currentZoneId, px, py);
  }

  public scheduleDebouncedCloudSave(): void {
    if (!this.player || this.player.isDead() || this.isGameOverPending) return;
    scheduleDebouncedSave(this.captureCurrentSaveState());
  }

  private handleSaveManual(): boolean {
    const zone = this.worldBuilder.getActiveZone();
    const zoneName = zone ? zone.atmosphere.titleVietnamese : this.currentZoneId;
    return SaveManager.saveGame(`LƯU THỦ CÔNG (${zoneName})`, this.currentZoneId, this.player.x, this.player.y);
  }

  private isGameplayInputLocked(): boolean {
    return Boolean(
      (this.player && this.player.isDead()) ||
      this.isGameOverPending ||
      (this.gameOverModal && this.gameOverModal.isOpen) ||
      (this.pauseModal && this.pauseModal.isOpen) ||
      (this.endingSystem && this.endingSystem.isEndingActive) ||
      (this.dialogueSystem && this.dialogueSystem.isActive) ||
      (this.craftingModal && this.craftingModal.isOpen) ||
      (this.journalModal && this.journalModal.isOpen)
    );
  }

  /**
   * C4-13-03: Kích hoạt trạng thái Tử Vong (Death State) và Giao diện Game Over
   */
  public triggerPlayerDeath(reason?: string): void {
    if (this.isGameOverPending || (this.player && this.player.isDead())) return;
    this.isGameOverPending = true;

    // 1. Dừng ngay lập tức chuyển động và thao tác nhân vật
    if (this.player) {
      this.player.die();
      if (this.player.body) {
        (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
      }
      this.player.resetAllInputState();
    }

    // 2. Dừng ngay hành vi truy đuổi của thực thể AI xung quanh
    if (this.listenerMonster) {
      this.listenerMonster.setVelocity(0, 0);
      this.listenerMonster.ai.resetToPatrol();
    }

    // 3. Tắt nhịp tim căng thẳng, phát hiệu ứng rung giật màn hình và âm thanh tử nạn (C4-13-08)
    this.audioManager.setHeartbeatActive(false);
    this.cameraSystem.shake(350, 0.018);
    this.cameraSystem.flash(300, 160, 0, 0);
    this.audioManager.playHurt();
    this.audioManager.playPlayerDeath();
    this.audioManager.stopAmbience();

    // 4. Đóng toàn bộ các modal/dialogue đang mở
    if (this.craftingModal && this.craftingModal.isOpen) this.craftingModal.close();
    if (this.journalModal && this.journalModal.isOpen) this.journalModal.close();
    if (this.pauseModal && this.pauseModal.isOpen) this.pauseModal.close();
    if (this.dialogueSystem && this.dialogueSystem.isActive) this.dialogueSystem.endDialogue();

    if (this.uiScene) {
      this.uiScene.setInteractionPrompt(null);
    }

    const deathReason = reason || 'Sinh lực đã cạn kiệt trong màn sương u ám...';

    // Tính toán điểm sinh tồn và chuẩn bị tham số
    const dayCount = this.timeSystem ? this.timeSystem.getDayCount() : (this.playerState?.dayCount ?? 1);
    const composure = this.playerState ? this.playerState.stats.composure : 0;
    const unlockedLoreCount = this.playerState ? this.playerState.unlockedLore.length : 0;
    const visitedZonesCount = this.playerState ? this.playerState.visitedZones.size : 1;
    let completedQuestsCount = 0;
    if (this.playerState?.quests) {
      for (const q of this.playerState.quests.values()) {
        if (q.tasks && q.tasks.length > 0 && q.tasks.every(t => t.done)) {
          completedQuestsCount++;
        }
      }
    }
    let relicsCount = 0;
    if (this.playerState?.inventory) {
      const relicKeys = [
        'relic_heart_of_roots', 'item_runed_iron_part', 'quest_bronze_clapper',
        'item_bell_mold', 'quest_corrupted_crest', 'item_knight_journal_page'
      ];
      for (const rk of relicKeys) {
        if ((this.playerState.inventory.get(rk) ?? 0) > 0) relicsCount++;
      }
    }

    const scoreParams: SubmitScoreParams = {
      dayCount,
      composure,
      unlockedLoreCount,
      visitedZonesCount,
      completedQuestsCount,
      relicsCount,
      lastZone: this.currentZoneId,
      deathReason
    };

    const calculatedScore = LeaderboardService.getInstance().calculateSurvivalScore(scoreParams);

    // Thông báo cho P2Game SDK biết ván chơi kết thúc
    try {
      if (typeof window !== 'undefined' && window.p2 && typeof window.p2.gameOver === 'function') {
        window.p2.gameOver({
          score: calculatedScore,
          day: dayCount,
          zone: this.currentZoneId,
          deathReason
        });
        console.log(`[P2Game SDK] Đã gửi gameOver (Score: ${calculatedScore})`);
      }
    } catch (sdkErr) {
      console.warn('[P2Game SDK] Lỗi khi gọi p2.gameOver:', sdkErr);
    }

    // Tự động gửi điểm lên Bảng xếp hạng P2Game (chạy ngầm không chặn giao diện)
    LeaderboardService.getInstance().submitSurvivalScore(scoreParams).catch(err => {
      console.warn('[GameScene] Gửi điểm bảng xếp hạng thất bại:', err);
    });

    // 5. Hiển thị bảng Game Over sau 800ms khi hoạt ảnh ngã xuống kết thúc
    this.time.delayedCall(800, () => {
      if (this.uiScene) {
        this.uiScene.showGameOverModal(deathReason, scoreParams);
      }
    });
  }

  /**
   * C4-13-03: Xử lý chức năng [Nạp Điểm Lưu Gần Nhất / Load Checkpoint]
   */
  public handleLoadCheckpoint(): void {
    this.isGameOverPending = false;
    if (SaveManager.hasSave()) {
      const data = SaveManager.loadGame();
      if (data) {
        // Đảm bảo chỉ số sinh lực được khôi phục nếu dữ liệu lưu bị 0 hoặc quá thấp
        if (data.stats.health <= 0) {
          data.stats.health = 50;
        }
        if (data.stats.composure <= 0) {
          data.stats.composure = 40;
        }

        this.audioManager.stopAll();
        if (this.uiScene) {
          this.uiScene.closeGameOverModal();
          this.scene.stop('UIScene');
        }
        this.scene.restart({ isContinue: true, saveData: data });
        return;
      }
    }

    // Nếu chưa có checkpoint thì hồi phục về làng Bellhollow
    this.handleRestartGame();
  }

  /**
   * C4-13-03: Xử lý chức năng [Chơi Lại / Restart]
   */
  public handleRestartGame(): void {
    this.isGameOverPending = false;
    this.audioManager.stopAll();
    this.playerState.reset();
    if (this.uiScene) {
      this.uiScene.closeGameOverModal();
      this.scene.stop('UIScene');
    }
    this.scene.restart({ isContinue: false });
  }

  /**
   * C4-13-03: Xử lý chức năng [Về Màn Hình Chính / Main Menu]
   */
  public handleReturnToMainMenu(): void {
    this.isGameOverPending = false;
    this.audioManager.stopAll();
    if (this.uiScene) {
      this.uiScene.closeGameOverModal();
      this.scene.stop('UIScene');
    }
    this.scene.stop('GameScene');
    this.scene.start(SCENE_MAIN_MENU);
  }

  private handleReloadCheckpoint(): void {
    this.handleLoadCheckpoint();
  }

  /**
   * C4-13-01: Tự động gỡ kẹt cho nhân vật nếu vị trí hiện tại bị đè lên bất kỳ collider nào của thế giới.
   * Thử các vector dịch chuyển ngắn (nudge) sang các hướng thông thoáng gần nhất.
   */
  private unstuckPlayerFromColliders(): void {
    if (!this.player || !this.player.body) return;

    const colliders = this.worldBuilder.colliderGroup.getChildren() as Phaser.Physics.Arcade.Sprite[];
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;

    const checkOverlap = (b1: Phaser.Physics.Arcade.Body, b2: Phaser.Physics.Arcade.Body): boolean => {
      return (
        b1.x < b2.x + b2.width &&
        b1.x + b1.width > b2.x &&
        b1.y < b2.y + b2.height &&
        b1.y + b1.height > b2.y
      );
    };

    let isStuck = false;
    for (const col of colliders) {
      if (!col.body || !(col.body as Phaser.Physics.Arcade.Body).enable) continue;
      const colBody = col.body as Phaser.Physics.Arcade.Body;
      if (checkOverlap(playerBody, colBody)) {
        isStuck = true;
        break;
      }
    }

    if (isStuck) {
      const startX = this.player.x;
      const startY = this.player.y;
      const testOffsets = [
        { x: 0, y: 16 },
        { x: 0, y: -16 },
        { x: 16, y: 0 },
        { x: -16, y: 0 },
        { x: 16, y: 16 },
        { x: -16, y: 16 },
        { x: 16, y: -16 },
        { x: -16, y: -16 },
        { x: 0, y: 32 },
        { x: 0, y: -32 },
        { x: 32, y: 0 },
        { x: -32, y: 0 }
      ];

      for (const off of testOffsets) {
        const testX = startX + off.x;
        const testY = startY + off.y;
        playerBody.reset(testX, testY);

        let stillStuck = false;
        for (const col of colliders) {
          if (!col.body || !(col.body as Phaser.Physics.Arcade.Body).enable) continue;
          const colBody = col.body as Phaser.Physics.Arcade.Body;
          if (checkOverlap(playerBody, colBody)) {
            stillStuck = true;
            break;
          }
        }

        if (!stillStuck) {
          this.player.setPosition(testX, testY);
          this.player.lastSafePosition = { x: testX, y: testY };
          break;
        }
      }
    }
  }

  private startAct0Intro(): void {
    // Mở đầu u ám: làm mờ sương và tiếng chuông đồng vọng lại
    this.cameras.main.fadeIn(2000, 0, 0, 0);

    // Dựng hình bóng The Echo mờ ảo dẫn đường tại X: 350, Y: 220
    this.act0EchoGfx = this.add.graphics();
    this.act0EchoGfx.fillStyle(0x7fb3d5, 0.45);
    this.act0EchoGfx.fillEllipse(350, 220, 16, 32);
    this.act0EchoGfx.fillStyle(0xebf5fb, 0.7);
    this.act0EchoGfx.fillCircle(350, 206, 6);
    this.act0EchoGfx.setDepth(230);

    this.tweens.add({
      targets: this.act0EchoGfx,
      alpha: 0.25,
      y: 216,
      duration: 1200,
      yoyo: true,
      repeat: -1
    });

    this.time.delayedCall(800, () => {
      this.audioManager.playBronzeBellToll();
      if (this.uiScene) {
        this.uiScene.showPopupMessage('🔔 Một tiếng chuông đồng mơ hồ ngân vang từ phía Đông màn sương...');
      }
      this.cameraSystem.shake(400, 0.005);
    });

    this.time.delayedCall(4200, () => {
      const zone = this.worldBuilder.getActiveZone();
      if (this.uiScene && zone) {
        this.uiScene.showZoneBanner(zone.atmosphere);
      }
    });
  }

  private spawnNPCs(): void {
    // C4-12-09: Dọn dẹp an toàn các thực thể NPC cũ nếu có (bảo đảm không sinh trùng lặp)
    for (const npc of this.npcs) {
      npc.destroy();
    }
    this.npcs = [];

    // 1. Garth — Người Canh Cổng: đứng tại cổng Tây làng Bellhollow (x: 520, y: 265), đi tuần ngắn qua lại
    const garth = new NPCEntity(this, {
      id: 'npc_garth',
      name: 'Garth',
      title: 'Người Canh Cổng',
      x: 520,
      y: 265,
      dialogueKey: 'garth_warning',
      robeColor: 0x3e4a3d,
      hoodColor: 0x5a3e28,
      patrolMinX: 505,
      patrolMaxX: 535,
      patrolSpeed: 15
    });

    // 2. Bà Lão Edda — Người Giữ Chuông: đứng tại quảng trường thoáng trước Tháp Chuông (x: 785, y: 345)
    // Cách Giếng Nước (726, 376) > 65px và Lửa Trại (780, 260) > 80px, không bị che khuất hay đè hitbox
    const edda = new NPCEntity(this, {
      id: 'npc_edda',
      name: 'Bà Lão Edda',
      title: 'Bà lão giữ chuông',
      x: 785,
      y: 345,
      dialogueKey: 'edda_intro',
      robeColor: 0x4a4f56,
      hoodColor: 0x8a7355
    });

    // 3. Neris — Thầy Thuốc Thảo Mộc: đứng bên hiên nhà thuốc cạnh bàn phơi thảo mộc (x: 990, y: 145)
    // Cách Nồi Thảo Dược (935, 140) 55px về bên phải, phân tách rạch ròi 2 vùng tương tác
    const neris = new NPCEntity(this, {
      id: 'npc_neris',
      name: 'Neris',
      title: 'Người chữa thảo mộc',
      x: 990,
      y: 145,
      dialogueKey: 'neris_intro',
      robeColor: 0x27493a,
      hoodColor: 0x3d7055
    });

    // 4. Bram — Thợ Rèn Làng (C4-13-21 & C4-132-06): đứng cạnh khu vực Lò Rèn & Bàn Chế Tạo (x: 1045, y: 365)
    const bram = new NPCEntity(this, {
      id: 'npc_bram',
      name: 'Bram',
      title: 'Thợ rèn làng',
      x: 1045,
      y: 365,
      dialogueKey: 'bram_chat'
    });
    const bramBody = bram.body as Phaser.Physics.Arcade.Body;
    if (bramBody) {
      bramBody.setSize(20, 12);
      bramBody.setOffset(-10, -6);
    }

    // 5. Finn — Cậu Bé Đưa Tin: đi lại nhẹ trên lối đi vào quảng trường (x: 685, y: 295)
    // Cách xa Rương Chứa Đồ (735, 255) > 60px và Lều Trú Ẩn (715, 220) > 75px, chấm dứt hoàn toàn hiện tượng đứng đè lên rương
    const finn = new NPCEntity(this, {
      id: 'npc_finn',
      name: 'Finn',
      title: 'Cậu bé đưa tin',
      x: 685,
      y: 295,
      dialogueKey: 'finn_chat',
      patrolMinX: 670,
      patrolMaxX: 705,
      patrolSpeed: 20
    });

    // 6. Hiệp Sĩ Canh Lửa — Người Giữ Lửa Tàn (V14-P8-14B / V14-P8-14C): quỳ canh gác bên Lửa Trại Làng (x: 818, y: 270)
    const campfireKnight = new NPCEntity(this, {
      id: 'npc_campfire_knight',
      name: 'Hiệp Sĩ Canh Lửa',
      title: 'Người giữ lửa tàn',
      x: 818,
      y: 270,
      dialogueKey: 'campfire_knight_intro'
    });
    CampSanctuarySystem.getInstance().registerKnightEntity(campfireKnight);

    this.npcs.push(garth, edda, neris, bram, finn, campfireKnight);

    // C4-13-17 & C4-132-03: Thiết lập va chạm vật lý giữa SatyrPlayer và toàn bộ 5 NPC làng Bellhollow (hộp chân gọn 22x14 px)
    if (this.npcCollider) {
      this.npcCollider.destroy();
      this.npcCollider = undefined;
    }
    if (this.player) {
      this.npcCollider = this.physics.add.collider(this.player, this.npcs, (_playerObj, npcObj) => {
        if (this.player && typeof this.player.applyCornerAssistWith === 'function') {
          this.player.applyCornerAssistWith(npcObj as Phaser.Physics.Arcade.Sprite);
        }
      });
    }
  }

  private spawnTheListener(): void {
    // Lộ trình tuần tra mặc định của The Listener trong rừng The Crooked Path
    const waypoints = [
      { x: 1950, y: 220 },
      { x: 2280, y: 380 },
      { x: 2600, y: 240 },
      { x: 2350, y: 160 }
    ];

    this.listenerMonster = new TheListener(this, 2300, 240, waypoints);
    if (this.timeSystem) {
      this.listenerMonster.setTimePhase(this.timeSystem.getCurrentPhase());
    }

    // Va chạm giữa The Listener và thế giới
    this.physics.add.collider(this.listenerMonster, this.worldBuilder.colliderGroup);

    // Va chạm rượt đuổi: nếu The Listener chạm vào Satyr ngoài chỗ nấp
    this.physics.add.overlap(this.player, this.listenerMonster, () => {
      if (this.isGameOverPending || (this.player && this.player.isDead())) return;

      if (!this.player.stats.isHiding && !this.player.isHurt() && this.listenerMonster.canAttack()) {
        // Kích hoạt hồi chiêu tấn công 1.5s để người chơi có cơ hội chạy trốn hoặc nấp
        this.listenerMonster.triggerAttackCooldown(1500);

        // Tấn công gây sát thương vừa phải (25 HP, 25 Composure)
        this.playerState.stats.health = Math.max(0, this.playerState.stats.health - 25);
        this.playerState.stats.composure = Math.max(5, this.playerState.stats.composure - 25);
        this.cameraSystem.shake(250, 0.015);
        this.cameraSystem.flash(200, 180, 0, 0);

        if (this.playerState.stats.health <= 0) {
          this.triggerPlayerDeath('Bị Kẻ Lắng Nghe bắt kịp và tấn công hạ gục...');
          return;
        }

        if (this.uiScene) {
          this.uiScene.showPopupMessage('⚠️ BẠN ĐÃ BỊ KẺ LẮNG NGHE TẤN CÔNG! Hãy nấp ngay vào Thân Cây Rỗng hoặc ném Mồi Nhử [Q]!');
        }

        // Đẩy Satyr lùi lại 55px tạo khoảng cách phản xạ
        const pushAngle = Math.atan2(this.player.y - this.listenerMonster.y, this.player.x - this.listenerMonster.x);
        this.player.setPosition(this.player.x + Math.cos(pushAngle) * 55, this.player.y + Math.sin(pushAngle) * 55);
        this.player.playHurt();
      }
    });
  }

  private setupFogOfWar(): void {
    const qSettings = GraphicsQualitySystem.getInstance().getSettings();
    const bufW = qSettings.bufferWidth;
    const bufH = qSettings.bufferHeight;

    // Lớp sương mù động bao phủ toàn màn hình HD 1280×720 (Hỗ trợ Half-Res Buffer 0.5x / 0.35x giảm 75%-88% tải GPU fill-rate)
    this.fogOfWarLayer = this.add.renderTexture(0, 0, bufW, bufH);
    this.fogOfWarLayer.setOrigin(0, 0); // V14-P8-01: Khắc phục lệch tâm (RenderTexture origin 0,0 khớp trọn vẹn màn hình)
    this.fogOfWarLayer.setScrollFactor(0);
    this.fogOfWarLayer.setDepth(5000);
    this.fogOfWarLayer.setDisplaySize(1280, 720);

    // C4-12-07: Tạo mặt nạ ánh sáng lưu đệm (Cached Light Mask) tối ưu hiệu năng đồ họa GPU
    if (!this.textures.exists('cached_light_mask_normal')) {
      const maskCanvas = this.textures.createCanvas('cached_light_mask_normal', 512, 512);
      if (maskCanvas) {
        const ctx = maskCanvas.getContext();
        const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
        grad.addColorStop(0.40, 'rgba(255, 255, 255, 0.88)');
        grad.addColorStop(0.70, 'rgba(255, 255, 255, 0.45)');
        grad.addColorStop(0.92, 'rgba(255, 255, 255, 0.12)');
        grad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);
        maskCanvas.refresh();
      }
    }

    if (!this.textures.exists('cached_light_mask_dim')) {
      const maskCanvas = this.textures.createCanvas('cached_light_mask_dim', 256, 256);
      if (maskCanvas) {
        const ctx = maskCanvas.getContext();
        const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        grad.addColorStop(0.45, 'rgba(255, 255, 255, 0.65)');
        grad.addColorStop(0.78, 'rgba(255, 255, 255, 0.22)');
        grad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 256);
        maskCanvas.refresh();
      }
    }

    // V14-P8-01: Tạo quầng sáng chuyển sắc mềm mại (Radial Gradient Amber Glow) thay thế các vòng tròn đồng tâm thô cứng
    if (!this.textures.exists('cached_lantern_glow_radial')) {
      const glowCanvas = this.textures.createCanvas('cached_lantern_glow_radial', 512, 512);
      if (glowCanvas) {
        const ctx = glowCanvas.getContext();
        const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
        grad.addColorStop(0, 'rgba(255, 238, 170, 0.75)');   // Lõi sáng vàng ấm hổ phách gần tim đèn
        grad.addColorStop(0.12, 'rgba(255, 195, 77, 0.55)'); // Quầng lửa ấm
        grad.addColorStop(0.32, 'rgba(243, 156, 18, 0.36)'); // Sắc hổ phách ấm áp
        grad.addColorStop(0.58, 'rgba(230, 126, 34, 0.18)'); // Sắc cam nhạt loang êm dịu
        grad.addColorStop(0.82, 'rgba(180, 80, 15, 0.05)');  // Vùng viền ngoài tản dần
        grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');           // Hòa tan hoàn toàn vào bóng tối
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);
        glowCanvas.refresh();
      }
    }

    // Image GameObject trung gian để erase sương mù bằng texture lưu đệm mà không tạo mới mỗi khung hình
    this.cachedLightMaskImage = new Phaser.GameObjects.Image(this, 0, 0, 'cached_light_mask_normal');
    this.cachedLightMaskImage.setOrigin(0.5, 0.5); // V14-P8-01: Neo tâm chính xác để đục lỗ sương mù đúng tâm nguồn sáng

    // V14-P8-01: Quầng sáng ấm áp phát ra từ Đèn Lồng của Wayfarer (Texture chuyển sắc mềm dạng Image kết hợp ADD blend mode)
    this.lanternGlowImage = this.add.image(0, 0, 'cached_lantern_glow_radial');
    this.lanternGlowImage.setOrigin(0.5, 0.5);
    this.lanternGlowImage.setScrollFactor(0);
    this.lanternGlowImage.setDepth(5020);
    this.lanternGlowImage.setBlendMode(Phaser.BlendModes.ADD);
    this.lanternGlowImage.setVisible(false);

    // Graphics dự phòng
    this.lanternGlowGfx = this.add.graphics();
    this.lanternGlowGfx.setScrollFactor(0);
    this.lanternGlowGfx.setDepth(5020);
  }

  private readonly MAX_FIREFLY_POOL = 30;

  private setupFireflies(): void {
    this.fireflyGfx = this.add.graphics();
    this.fireflyGfx.setDepth(5050); // Nằm trên sương mù nhẹ để người chơi định vị trong đêm

    this.fireflies = [];

    // Danh sách các điểm tụ đom đóm chính (giới hạn tối đa 30 hạt đom đóm trong pool tái sử dụng)
    const clusters: Array<{ x: number; y: number; count: number; colors: number[]; radius: number }> = [
      { x: 3400, y: 220, count: 4, colors: [0x5dade2, 0x85c1e9], radius: 36 }, // Cột Trăng
      { x: 3520, y: 360, count: 4, colors: [0x58d68d, 0x82e0aa], radius: 36 }, // Cột Rễ
      { x: 3640, y: 220, count: 4, colors: [0xaf7ac5, 0xbb8fce], radius: 36 }, // Cột Con Mắt
      { x: 850, y: 260, count: 6, colors: [0xf39c12, 0xf1c40f, 0xe67e22], radius: 42 }, // Lửa Trại Bellhollow
      { x: 720, y: 380, count: 3, colors: [0x76d7c4, 0xa3e4d7], radius: 28 }, // Giếng Làng
      { x: 1040, y: 180, count: 3, colors: [0x2ecc71, 0x58d68d], radius: 25 },
      { x: 880, y: 200, count: 3, colors: [0xf4d03f, 0xf7dc6f], radius: 25 },
      { x: 1900, y: 180, count: 3, colors: [0xa2d9ce, 0x73c6b6], radius: 22 }
    ];

    let totalCreated = 0;
    for (const cluster of clusters) {
      if (totalCreated >= this.MAX_FIREFLY_POOL) break;
      const count = Math.min(cluster.count, this.MAX_FIREFLY_POOL - totalCreated);
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
        const dist = Math.random() * cluster.radius;
        const color = Phaser.Utils.Array.GetRandom(cluster.colors);

        this.fireflies.push({
          anchorX: cluster.x,
          anchorY: cluster.y,
          x: cluster.x + Math.cos(angle) * dist,
          y: cluster.y + Math.sin(angle) * dist,
          color,
          baseAlpha: 0.45 + Math.random() * 0.4,
          size: 1.6 + Math.random() * 1.2,
          radius: cluster.radius * (0.6 + Math.random() * 0.6),
          speed: 0.8 + Math.random() * 0.7,
          phaseX: Math.random() * Math.PI * 2,
          phaseY: Math.random() * Math.PI * 2,
          phaseAlpha: Math.random() * Math.PI * 2
        });
        totalCreated++;
      }
    }
  }

  private updateFireflies(time: number): void {
    if (!this.fireflyGfx) return;

    const maxAllowed = GraphicsQualitySystem.getInstance().getSettings().maxFireflies;
    if (maxAllowed <= 0) {
      if (this.firefliesDrawnCount > 0) {
        this.fireflyGfx.clear();
        this.firefliesDrawnCount = 0;
      }
      return;
    }

    const cam = this.cameras.main;
    const viewLeft = cam.worldView.x - 60;
    const viewRight = cam.worldView.right + 60;
    const viewTop = cam.worldView.y - 60;
    const viewBottom = cam.worldView.bottom + 60;

    let drawnCount = 0;
    const limit = Math.min(this.fireflies.length, maxAllowed);

    for (let i = 0; i < limit; i++) {
      const f = this.fireflies[i];

      // C4-12-29: Kiểm tra anchor sơ bộ trước khi tính toán Math.sin / Math.cos đắt đỏ
      const maxR = f.radius;
      if (
        f.anchorX + maxR < viewLeft ||
        f.anchorX - maxR > viewRight ||
        f.anchorY + maxR < viewTop ||
        f.anchorY - maxR > viewBottom
      ) {
        continue;
      }

      // Chuyển động lơ lửng hình sin mượt mà
      f.x = f.anchorX + Math.sin(time * 0.001 * f.speed + f.phaseX) * f.radius;
      f.y = f.anchorY + Math.cos(time * 0.0013 * f.speed + f.phaseY) * (f.radius * 0.65);

      // Bỏ qua nếu nằm ngoài tầm nhìn camera
      if (f.x < viewLeft || f.x > viewRight || f.y < viewTop || f.y > viewBottom) {
        continue;
      }

      // Chỉ clear graphics khi bắt đầu vẽ con đầu tiên trong khung nhìn
      if (drawnCount === 0) {
        this.fireflyGfx.clear();
      }
      drawnCount++;

      // Ánh sáng lập lòe nhịp nhàng
      const pulse = Math.sin(time * 0.0035 + f.phaseAlpha);
      const alpha = Math.max(0.05, Math.min(1.0, f.baseAlpha + pulse * 0.38));

      // Quầng sáng mờ xung quanh đom đóm
      this.fireflyGfx.fillStyle(f.color, alpha * 0.32);
      this.fireflyGfx.fillCircle(f.x, f.y, f.size * 2.8);

      // Lõi đom đóm sáng rực rỡ
      this.fireflyGfx.fillStyle(f.color, alpha * 0.95);
      this.fireflyGfx.fillCircle(f.x, f.y, f.size);
    }

    // Nếu không có đom đóm nào trong khung nhìn nhưng frame trước có vẽ, dọn sạch 1 lần duy nhất
    if (drawnCount === 0 && this.firefliesDrawnCount > 0) {
      this.fireflyGfx.clear();
    }
    this.firefliesDrawnCount = drawnCount;
  }

  public update(time: number, delta: number): void {
    const dt = delta / 1000;

    // C4-13-03: Khóa toàn bộ điều khiển và xử lý khi nhân vật đã tử vong hoặc Game Over đang kích hoạt
    if (this.isGameOverPending || (this.player && this.player.isDead())) {
      if (this.player && this.player.body) {
        (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
        this.player.resetAllInputState();
      }
      if (this.listenerMonster) {
        this.listenerMonster.setVelocity(0, 0);
        this.listenerMonster.ai.resetToPatrol();
      }
      return;
    }

    // C4-13-03: Kiểm tra an toàn tức thời nếu chỉ số sinh lực chạm đáy (health <= 0)
    if (this.playerState.stats.health <= 0) {
      this.triggerPlayerDeath('Sinh lực đã cạn kiệt trong màn sương lạnh giá...');
      return;
    }

    // GATE 1C: Đóng băng toàn bộ thế giới trò chơi khi Pause Menu đang mở
    if (this.pauseModal && this.pauseModal.isOpen) {
      if (this.player && this.player.body) {
        (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
        this.player.playIdle();
        this.player.resetAllInputState();
        if (this.player.isPauseRequested()) {
          this.handleESCPress();
        }
      }
      if (this.debugOverlay) {
        this.debugOverlay.update(this.currentZoneId);
      }
      if (this.hitboxInspector) {
        this.hitboxInspector.update(this.currentZoneId);
      }
      return;
    }

    // Cập nhật chu kỳ sinh trưởng nông trại thảo dược (C4-12-16)
    if (this.farmingSystem) {
      this.farmingSystem.update();
    }

    // Khóa điều khiển nếu Ending đang chạy hoặc UI modal mở
    const isUIBusy = 
      this.endingSystem.isEndingActive ||
      this.dialogueSystem.isActive || 
      this.craftingModal.isOpen || 
      this.journalModal.isOpen ||
      (this.pauseModal && this.pauseModal.isOpen) ||
      (this.gameOverModal && this.gameOverModal.isOpen) ||
      (this.uiScene && this.uiScene.isAnyModalOpen);

    // V1.4: Cập nhật hệ thống Thời Gian & Thời Tiết
    if (this.timeSystem) {
      this.timeSystem.setPaused(isUIBusy);
      if (!isUIBusy) {
        this.timeSystem.update(dt);
      }
    }

    if (this.weatherSystem) {
      if (!isUIBusy) {
        this.weatherSystem.update(dt, this.currentZoneId, this.timeSystem ? this.timeSystem.getCurrentPhase() : 'DAY');
      }
      if (this.rainGfx) {
        this.weatherSystem.renderRainParticles(this.rainGfx);
      }
    }

    if (!isUIBusy && this.campSystem) {
      this.campSystem.update(dt);
      if (this.survivalSystem) {
        this.survivalSystem.campfireWarmthRadius = this.campSystem.getCampfireRadius();
      }
    }

    if (!isUIBusy && this.worldEventSystem) {
      this.worldEventSystem.update(dt, this.currentZoneId, this.timeSystem ? this.timeSystem.getCurrentPhase() : 'DAY');
    }

    // V1.4 - P6: Cập nhật vòng lặp Đấu Trùm Kẻ Nuốt Tiếng Chuông (Mire Warden Boss)
    if (!isUIBusy && this.isBossFightActive) {
      this.updateMireWardenBossEncounter(time, delta);
    }

    if (!isUIBusy) {
      this.player.update(time, delta);

      // Module 1: Tự động phân lớp hiển thị trước-sau theo Y-Sorting Pipeline
      if (TILED_PIPELINE_CONFIG.enableYSortingModule) {
        YSortingModule.getInstance().updateDynamicEntities([
          this.player,
          ...this.npcs,
          this.listenerMonster,
          this.mireWardenBoss,
          ...this.wildlifeSystem.getEntities()
        ]);
      }

      // Phím tắt thao tác vật lý (tương thích UniKey / EVKey) khi không bận UI
      if (this.player) {
        if (this.player.isPauseRequested()) {
          this.handleESCPress();
        }
        if (this.player.isCraftingRequested() && this.uiScene) {
          this.uiScene.toggleCrafting();
        }
        if (this.player.isJournalRequested() && this.uiScene) {
          this.uiScene.toggleJournal();
        }
        if (this.player.isPoulticeRequested() && this.uiScene) {
          if (this.uiScene.tryConsumePoultice()) {
            this.player.playUseItem();
          }
        }
        if (this.player.isOilRequested() && this.uiScene) {
          if (this.uiScene.tryConsumeLanternOil()) {
            this.player.playUseItem();
          }
        }
        if (this.player.isMuteRequested()) {
          this.handleMutePress();
        }
      }
    } else {
      if (this.player) {
        (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
        this.player.playIdle();
        this.player.resetAllInputState();

        // Xử lý phím đóng UI / tiến trình hội thoại bằng phím vật lý khi UI đang mở
        if (this.dialogueSystem.isActive) {
          if (this.player.isInteractRequested() || this.player.consumeAction('attack')) {
            this.dialogueSystem.handleAdvance();
          }
        }
        if (this.craftingModal && this.craftingModal.isOpen) {
          if (this.player.isCraftingRequested() || this.player.isPauseRequested()) {
            this.craftingModal.close();
            this.player.forceUnlockActionState();
          }
        }
        if (this.journalModal && this.journalModal.isOpen) {
          if (this.player.isJournalRequested() || this.player.isPauseRequested()) {
            this.journalModal.close();
            this.player.forceUnlockActionState();
          }
        }
        if (this.uiScene && this.uiScene.parchmentWorldMapModal && this.uiScene.parchmentWorldMapModal.isOpen) {
          if (this.player.isPauseRequested()) {
            this.uiScene.parchmentWorldMapModal.close();
            this.player.forceUnlockActionState();
          }
        }
      }
    }

    // Cập nhật camera
    this.cameraSystem.update();

    // Cập nhật hệ thống sinh tồn (PlayerState.stats là nguồn dữ liệu duy nhất)
    const inDeepFog = this.currentZoneId === 'fog_crossing' || this.currentZoneId === 'silent_mire' || this.currentZoneId === 'deep_forest' || this.isAct5ChaseActive;
    this.survivalSystem.update(
      dt, 
      this.player.x, 
      this.player.y, 
      inDeepFog,
      this.timeSystem ? this.timeSystem.getCurrentPhase() : undefined,
      this.weatherSystem ? this.weatherSystem.isRaining() : false,
      this.currentZoneId
    );

    // C4-132-02: Thông báo phản hồi nhẹ nhàng khi người chơi đứng sưởi ấm bên lửa trại hồi phục
    if (this.survivalSystem.isNearWarmth(this.player.x, this.player.y)) {
      const now = Date.now();
      if (!this.lastWarmthFeedbackTime || now - this.lastWarmthFeedbackTime > 12000) {
        this.lastWarmthFeedbackTime = now;
        if (this.uiScene) {
          this.uiScene.showPopupMessage('🔥 Hơi ấm lửa trại đang xoa dịu vết thương và tâm trí...');
        }
      }
    }

    // Cập nhật The Veil (Màn Sương) và hiệu ứng tâm lý (PASS G3 & C4-12-30)
    if (!this.endingSystem || !this.endingSystem.isEndingActive) {
      this.veilSystem.update(time, delta, inDeepFog, this.currentZoneId, this.player ? this.player.x : undefined, this.timeSystem);
    }

    // Cập nhật âm thanh khí quyển & hiệu ứng lọc The Veil (PASS G5)
    this.audioManager.updateVeilFilter(inDeepFog, this.playerState.stats.composure);
    if (this.timeSystem) {
      const baseWind = this.timeSystem.getWindIntensity();
      this.audioManager.setWindIntensity(inDeepFog ? baseWind * 1.3 : baseWind);
    } else if (this.lastInDeepFog !== inDeepFog) {
      this.lastInDeepFog = inDeepFog;
      this.audioManager.setWindIntensity(inDeepFog ? 1.4 : 0.6);
    }

    // V1.4: Đồng bộ widget Thời Gian trên UIScene
    if (this.uiScene && this.timeSystem) {
      this.uiScene.updateTimeWidget(
        this.timeSystem.getDayCount(),
        this.timeSystem.getTimeOfDay(),
        this.timeSystem.getCurrentPhase(),
        this.timeSystem.getPhaseProgress()
      );
    }

    // V1.4: Cập nhật Mini-map động (mũi tên hướng nhìn, vị trí đèn lồng, lửa trại)
    if (this.uiScene && this.player) {
      const litLanterns = this.player.stats.isLanternOn ? [{ x: this.player.x, y: this.player.y }] : [];
      const campfires: { x: number; y: number }[] = [];
      if (this.campSystem) {
        const cf = this.campSystem.getCampfirePosition();
        if (cf) campfires.push(cf);
      }
      this.uiScene.updateMiniMap(
        this.player.x,
        this.player.y,
        this.player.facing || 'down',
        litLanterns,
        campfires
      );
    }

    // Xử lý âm thanh bước chân trên từng địa hình
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (body && (body.velocity.x !== 0 || body.velocity.y !== 0)) {
      this.footstepTimer += delta;
      const stepInterval = this.player.stats.isSprinting ? 270 : 400;
      if (this.footstepTimer >= stepInterval) {
        this.footstepTimer = 0;
        const terrain = this.detectCurrentTerrain(this.currentZoneId, this.player.x, this.player.y);
        this.audioManager.playFootstep(terrain);
      }
    } else {
      this.footstepTimer = 0;
    }

    // Xử lý âm thanh bật/tắt đèn lồng & hiệu ứng game feel (Juice)
    if (this.player.stats.isLanternOn !== this.lastLanternState) {
      this.lastLanternState = this.player.stats.isLanternOn;
      this.audioManager.playLanternToggle(this.lastLanternState);
      if (this.lastLanternState) {
        this.createLanternIgniteEffect(this.player.x, this.player.y);
      } else {
        this.createLanternExtinguishEffect(this.player.x, this.player.y);
      }
    }

    // V1.5 (BƯỚC V15-05): Xử lý nhịp tim, rung camera và tiếng thở nhẹ theo 3 cấp độ suy giảm Bình Tâm
    const isDay = Boolean(this.timeSystem && this.timeSystem.getCurrentPhase() === 'DAY');
    const isSafeVillageZone = (this.currentZoneId === 'bellhollow' && this.player.x <= 1620) || this.currentZoneId === 'sanctuary_farm' || this.currentZoneId === 'fog_crossing';
    const isNearWarmth = Boolean(this.survivalSystem && this.survivalSystem.isNearWarmth(this.player.x, this.player.y));
    const isComposureProtected = isDay || isSafeVillageZone || isNearWarmth || Boolean(this.player.stats.isLanternOn && this.player.stats.lanternOil > 0);

    const comp = this.playerState.stats.composure;

    if (isComposureProtected || comp >= 40) {
      // Khi an toàn hoặc Bình Tâm vượt lên trên ngưỡng nguy hiểm (>= 40): Tắt nhịp tim và reset timer
      if (!this.isAct5ChaseActive) {
        this.audioManager.setHeartbeatActive(false);
      }
      this.panicCameraShakeTimer = 0;
      this.uneasyBreathingTimer = 0;
    } else if (!this.isAct5ChaseActive) {
      if (comp < 10) {
        // Cấp độ 3: Ngưỡng Hoảng Loạn Cực Độ (<10/100): Nhịp tim dồn dập (480ms) và rung camera theo nhịp tim
        this.audioManager.setHeartbeatActive(true, 480);
        this.panicCameraShakeTimer += delta;
        if (this.panicCameraShakeTimer >= 1500) {
          this.panicCameraShakeTimer = 0;
          this.cameraSystem.shake(160, 0.0035);
        }
      } else if (comp < 25) {
        // Cấp độ 2: Ngưỡng Sợ Hãi (10..24/100): Nhịp tim vừa phải (750ms), không rung camera
        this.audioManager.setHeartbeatActive(true, 750);
        this.panicCameraShakeTimer = 0;
      } else {
        // Cấp độ 1: Ngưỡng Bất An (25..40/100): Tắt nhịp tim dồn dập, định kỳ phát tiếng thở nhẹ cảnh báo (10s)
        this.audioManager.setHeartbeatActive(false);
        this.panicCameraShakeTimer = 0;
        this.uneasyBreathingTimer += delta;
        if (this.uneasyBreathingTimer >= 10000) {
          this.uneasyBreathingTimer = 0;
          this.audioManager.playUneasyBreathing();
        }
      }
    }

    // C4-14-B04: Điểm hút mở đầu (30-60s) - Telegraph cành cây gãy & bóng ma thoáng qua tại Fog Crossing
    if (this.currentZoneId === 'fog_crossing' && !this.hasTriggeredAct0Telegraph && this.player && this.player.x >= 175) {
      this.triggerAct0AtmosphereTelegraph();
    }

    // C4-14-B04: Cân bằng nhịp độ Sanctuary an toàn vs Rừng Sương Mù nguy hiểm
    this.updateSanctuaryAndWildernessAtmosphere(delta);

    // Cập nhật hiện tượng The Echo (Tiếng Vọng) (PASS G3)
    const isPlayerLanternLit = Boolean(this.player.stats.isLanternOn && this.player.stats.lanternOil > 0);
    this.echoSystem.update(
      this.player.x,
      this.player.y,
      (msg: string) => {
        if (this.uiScene) {
          this.uiScene.showPopupMessage(`✨ Tiếng Vọng thì thầm: "${msg}"`);
        }
      },
      this.player.facing,
      isPlayerLanternLit,
      (gazeMsg: string) => {
        if (this.uiScene) {
          this.uiScene.showPopupMessage(gazeMsg);
        }
      }
    );

    // V1.4: Cảm biến Bùa Chuông Cổ phát hiện Ký Ức Echo gần đây
    if (EquipmentSystem.getInstance().hasEchoDetector()) {
      const activeEcho = this.echoSystem.activeEchoContainer;
      if (activeEcho && activeEcho.visible && Math.hypot(this.player.x - activeEcho.x, this.player.y - activeEcho.y) <= 220) {
        const now = Date.now();
        if (now - this.lastCharmEchoVibrateTime >= 6000) {
          this.lastCharmEchoVibrateTime = now;
          this.cameraSystem.shake(150, 0.003);
          if (this.uiScene) {
            this.uiScene.showPopupMessage('🔔 Bùa Chuông rung nhẹ... Có tàn dư Ký Ức (Echo) gần đây!');
          }
        }
      }
    }

    // V1.4 - P8-03: Cập nhật các bó Đuốc Nhựa Thông Cắm Đất (Resin Flare)
    this.updatePlantedFlares();

    // Cập nhật Act 0 tutorial / mở đầu
    this.updateAct0Progression();

    // Cập nhật AI của The Listener (PASS G3 & G4 Chase)
    this.updateTheListenerAI(delta);

    // V1.4: Cập nhật hệ sinh thái sinh vật hoang dã (Quạ Rừng & Bướm Đêm Hổ Phách)
    if (!isUIBusy && this.wildlifeSystem) {
      const isLanternLit = Boolean(this.player.stats.isLanternOn && this.player.stats.lanternOil > 0);
      const lightPos = this.player.getLanternWorldPosition();
      const playerLight = {
        x: isLanternLit && lightPos.isVisible ? lightPos.x : this.player.x,
        y: isLanternLit && lightPos.isVisible ? lightPos.y : this.player.y - 22,
        active: isLanternLit
      };
      const campfirePos = (this.campSystem && this.campSystem.getCampfireRadius() > 0)
        ? { x: 1050, y: 480, active: true }
        : undefined;
      const isSafeVillageZone = (this.currentZoneId === 'bellhollow' && this.player.x <= 1620) || this.currentZoneId === 'sanctuary_farm' || this.currentZoneId === 'fog_crossing';
      this.wildlifeSystem.update(time, delta, {
        playerX: this.player.x,
        playerY: this.player.y,
        isPlayerSprinting: Boolean(this.player.stats.isSprinting),
        isPlayerAttacking: Boolean(this.player.isAttacking && this.player.isAttacking()),
        timePhase: this.timeSystem ? this.timeSystem.getCurrentPhase() : 'DAY',
        listenerX: this.listenerMonster ? this.listenerMonster.x : undefined,
        listenerY: this.listenerMonster ? this.listenerMonster.y : undefined,
        isListenerActive: (this.currentZoneId === 'crooked_path' || this.currentZoneId === 'deep_forest') && !isSafeVillageZone,
        playerLightPos: playerLight,
        campfirePos: campfirePos,
        camera: this.cameras.main
      });

      // V1.4 - Bước 9: Đồng bộ trạng thái Thức Tỉnh Trùm (Boss Awakening) với VeilSystem & AudioManager
      const bossAwakened = this.isBossFightActive || (this.wildlifeSystem ? this.wildlifeSystem.isBossAwakened() : false);
      if (this.veilSystem) {
        this.veilSystem.setBossAwakened(bossAwakened);
      }
      this.audioManager.setBossAwakeningState(bossAwakened);

      // V14-P8-14B: Đẩy lùi quái vật nếu xâm nhập vòng bảo hộ của Sanctuary Camp
      const campSanctuary = CampSanctuarySystem.getInstance();
      const allMonsters: any[] = [
        ...this.wildlifeSystem.getSkullWolves(),
        ...this.wildlifeSystem.getShadowCrows(),
        ...this.wildlifeSystem.getFallenKnights(),
        ...this.wildlifeSystem.getDreadHorsemen(),
        ...this.wildlifeSystem.getMistBats(),
        ...this.wildlifeSystem.getWanderingShades(),
        ...this.wildlifeSystem.getGoblinScouts()
      ];
      if (this.wildlifeSystem.getShadowBehemoth()) allMonsters.push(this.wildlifeSystem.getShadowBehemoth());
      if (this.wildlifeSystem.getHoodedKnight()) allMonsters.push(this.wildlifeSystem.getHoodedKnight());
      if (this.listenerMonster) allMonsters.push(this.listenerMonster);
      campSanctuary.applySanctuaryRepulsion(allMonsters);

      const isSanctuaryProtected = campSanctuary.isPlayerInSanctuary(this.player.x, this.player.y, this.currentZoneId);

      // V1.4 - P8-08: Kiểm tra va chạm đòn vồ (Lunge) của Sói Xương với người chơi (Bảo vệ tuyệt đối khi trong Sanctuary Camp)
      if (!this.isGameOverPending && !this.player.isDead() && !this.player.stats.isHiding && !isSanctuaryProtected) {
        const wolves = this.wildlifeSystem.getSkullWolves();
        for (const wolf of wolves) {
          if (wolf.active && !wolf.isDefeated && wolf.wolfState === 'lunge' && !wolf.hasHitPlayerInCurrentLunge) {
            const distToPlayer = Math.hypot(this.player.x - wolf.x, this.player.y - wolf.y);
            if (distToPlayer <= 34 && !this.player.isHurt()) {
              wolf.hasHitPlayerInCurrentLunge = true;
              wolf.onLungeHitPlayer();

              // Gây 15 sát thương HP và 15 sát thương Composure
              this.playerState.stats.health = Math.max(0, this.playerState.stats.health - 15);
              this.playerState.stats.composure = Math.max(5, this.playerState.stats.composure - 15);
              this.cameraSystem.shake(220, 0.012);
              this.cameraSystem.flash(180, 160, 20, 20);

              if (this.playerState.stats.health <= 0) {
                this.triggerPlayerDeath('Bị Sói Xương cắn xé trong bóng đêm...');
                return;
              }

              if (this.uiScene) {
                this.uiScene.showPopupMessage('⚠️ SÓI XƯƠNG VỒ TRÚNG! Bật Đèn Lồng [F] hoặc lại gần Lửa Trại để xua đuổi!');
              }

              const pushAngle = Math.atan2(this.player.y - wolf.y, this.player.x - wolf.x);
              this.player.setPosition(this.player.x + Math.cos(pushAngle) * 45, this.player.y + Math.sin(pushAngle) * 45);
              this.player.playHurt();
            }
          }
        }

        // V1.4 - P8-09: Kiểm tra đòn sà mổ (Dive Attack) của Quạ Bóng Tối
        const shadowCrows = this.wildlifeSystem.getShadowCrows();
        for (const crow of shadowCrows) {
          if (crow.active && !crow.isDefeated && crow.crowState === 'dive_attack') {
            const dist = Math.hypot(this.player.x - crow.x, this.player.y - crow.y);
            if (dist <= 30 && !this.player.isHurt()) {
              this.playerState.stats.health = Math.max(0, this.playerState.stats.health - 8);
              this.playerState.stats.composure = Math.max(5, this.playerState.stats.composure - 10);
              this.cameraSystem.shake(160, 0.008);
              this.player.playHurt();
              if (this.uiScene) {
                this.uiScene.showPopupMessage('⚠️ Quạ Bóng Tối sà xuống cắn xé! Bật Đèn Lồng [F] ngay để xua đuổi!');
              }
              crow.takeDamage(0);
            }
          }
        }

        // V1.4 - P8-09: Kiểm tra đòn đập địa chấn (Combo Slam) của Trùm Bóng Tối Khổng Lồ
        const behemoth = this.wildlifeSystem.getShadowBehemoth();
        if (behemoth && behemoth.active && !behemoth.isDefeated && behemoth.bossState === 'combo_slam') {
          const dist = Math.hypot(this.player.x - behemoth.x, this.player.y - behemoth.y);
          if (dist <= 90 && !this.player.isHurt()) {
            this.playerState.stats.health = Math.max(0, this.playerState.stats.health - 25);
            this.playerState.stats.composure = Math.max(5, this.playerState.stats.composure - 20);
            this.cameraSystem.shake(350, 0.02);
            this.cameraSystem.flash(200, 160, 0, 40);
            const pushAngle = Math.atan2(this.player.y - behemoth.y, this.player.x - behemoth.x);
            this.player.setPosition(this.player.x + Math.cos(pushAngle) * 60, this.player.y + Math.sin(pushAngle) * 60);
            this.player.playHurt();
            if (this.playerState.stats.health <= 0) {
              this.triggerPlayerDeath('Bị Trùm Bóng Tối Khổng Lồ nghiền nát trong màn đêm...');
              return;
            }
            if (this.uiScene) {
              this.uiScene.showPopupMessage('⚠️ CHẤN ĐỘNG ĐỊA CHẤN TỪ TRÙM BÓNG TỐI! Hãy lùi xa khi mặt đất chấn động!');
            }
          }
        }

        // V1.4 - P8-10: Kiểm tra đòn chém kiếm của Hiệp Sĩ Sa Ngã
        const fallenKnights = this.wildlifeSystem.getFallenKnights();
        for (const fk of fallenKnights) {
          if (fk.active && !fk.isDefeated && fk.knightState === 'attack' && !fk.hasHitPlayerInCurrentAttack) {
            const dist = Math.hypot(this.player.x - fk.x, this.player.y - fk.y);
            if (dist <= 36 && !this.player.isHurt()) {
              fk.hasHitPlayerInCurrentAttack = true;
              this.playerState.stats.health = Math.max(0, this.playerState.stats.health - 14);
              this.playerState.stats.composure = Math.max(5, this.playerState.stats.composure - 8);
              this.cameraSystem.shake(200, 0.01);
              this.player.playHurt();
              if (this.playerState.stats.health <= 0) {
                this.triggerPlayerDeath('Bị nhát kiếm của Hiệp Sĩ Sa Ngã kết liễu...');
                return;
              }
              if (this.uiScene) {
                this.uiScene.showPopupMessage('⚠️ Nhát chém của Hiệp Sĩ Sa Ngã! Hãy phản công khi hắn hồi sức!');
              }
            }
          }
        }

        // V1.4 - P8-10: Kiểm tra cú húc càn quét của Kỵ Binh Hắc Ám
        const dreadHorsemen = this.wildlifeSystem.getDreadHorsemen();
        for (const dh of dreadHorsemen) {
          if (dh.active && !dh.isDefeated && dh.horseState === 'charge' && !dh.hasHitPlayerInCurrentCharge) {
            const dist = Math.hypot(this.player.x - dh.x, this.player.y - dh.y);
            if (dist <= 44 && !this.player.isHurt()) {
              dh.hasHitPlayerInCurrentCharge = true;
              this.playerState.stats.health = Math.max(0, this.playerState.stats.health - 18);
              this.playerState.stats.composure = Math.max(5, this.playerState.stats.composure - 12);
              this.cameraSystem.shake(260, 0.015);
              const pushX = dh.x < this.player.x ? 50 : -50;
              this.player.setPosition(this.player.x + pushX, this.player.y);
              this.player.playHurt();
              if (this.playerState.stats.health <= 0) {
                this.triggerPlayerDeath('Bị vó ngựa Kỵ Binh Hắc Ám nghiền nát trên đường mòn...');
                return;
              }
              if (this.uiScene) {
                this.uiScene.showPopupMessage('⚠️ Cú tông dữ dội của Kỵ Binh Hắc Ám! Hãy né sang hai bên bụi rậm!');
              }
            }
          }
        }

        // V1.4 - P8-10: Kiểm tra nhát chém cuồng nộ của Chỉ Huy Hiệp Sĩ Trùm Mũ
        const hoodedBoss = this.wildlifeSystem.getHoodedKnight();
        if (hoodedBoss && hoodedBoss.active && !hoodedBoss.isDefeated && hoodedBoss.bossState === 'attack' && !hoodedBoss.hasHitPlayerInCurrentAttack) {
          const dist = Math.hypot(this.player.x - hoodedBoss.x, this.player.y - hoodedBoss.y);
          if (dist <= 75 && !this.player.isHurt()) {
            hoodedBoss.hasHitPlayerInCurrentAttack = true;
            this.playerState.stats.health = Math.max(0, this.playerState.stats.health - 26);
            this.playerState.stats.composure = Math.max(5, this.playerState.stats.composure - 18);
            this.cameraSystem.shake(320, 0.018);
            this.cameraSystem.flash(180, 140, 20, 20);
            const pushAngle = Math.atan2(this.player.y - hoodedBoss.y, this.player.x - hoodedBoss.x);
            this.player.setPosition(this.player.x + Math.cos(pushAngle) * 55, this.player.y + Math.sin(pushAngle) * 55);
            this.player.playHurt();
            if (this.playerState.stats.health <= 0) {
              this.triggerPlayerDeath('Gục ngã trước nhát chém cuồng bạo của Chỉ Huy Hiệp Sĩ...');
              return;
            }
            if (this.uiScene) {
              this.uiScene.showPopupMessage('⚠️ NHÁT CHÉM TÀ ÁC TỪ CHỈ HUY HIỆP SĨ! Rọi Đèn Lồng [F] ngắt chiêu của hắn!');
            }
          }
        }
      }
    }

    // Cập nhật logic truy đuổi Act 5 Climax
    this.updateAct5ChaseLogic();

    // Kiểm tra Câu đố 1: Chiếc Đèn Thứ Hai Trong Sương (Quy Tắc 2)
    this.puzzleSystem.checkFakeLanternProximity(this.player.x, this.player.y, (failMsg: string) => {
      this.cameraSystem.shake(300, 0.01);
      this.cameraSystem.flash(400, 26, 188, 156);
      if (this.uiScene) {
        this.uiScene.showPopupMessage(failMsg);
      }
      // Teleport Satyr trở lại đầu con đường rừng (X: 1660, Y: 280)
      this.player.setPosition(1660, 280);
    });

    // Kiểm tra ném mồi tiếng động [Phím Q]
    this.handleNoiseLureThrow();

    // C4-12-27: Kiểm tra và ổn định các điểm chuyển vùng (Transition Triggers & Debounce)
    this.checkZoneTransitions(delta);

    // C4-12-29: Throttled Camera Frustum Culling (chạy mỗi 75ms thay vì mỗi frame 16ms để tiết kiệm CPU)
    this.cullingTimer += delta;
    if (this.cullingTimer >= 75) {
      this.cullingTimer = 0;
      this.worldBuilder.updateCameraCulling(this.cameras.main);
    }

    // Phát hiện và xử lý phân khu
    this.handleZoneLogic();

    // C4-13-02 / V14-P8-11: Luôn bảo đảm thuộc tính visible và alpha của nhân vật được giữ bật khi không ẩn nấp
    if (this.player && !this.player.stats.isHiding) {
      if (!this.player.visible) this.player.setVisible(true);
      if (!this.player.active) this.player.setActive(true);
      if (!this.player.isHurt() && this.player.alpha < 1) this.player.setAlpha(1);
    }

    // C4-13-02: Tự động giảm độ đậm (alpha = 0.35) của tán cây khi nhân vật đi bên dưới
    this.worldBuilder.updateCanopyTransparency(this.player.x, this.player.y);

    // C4-13-16: Kiểm tra nếu nhân vật đi ngược kịch về rào chắn phía Tây đầu game (fog_crossing)
    if (this.currentZoneId === 'fog_crossing' && this.player) {
      const foot = this.player.getFootPosition();
      if (foot.x <= 75 && foot.y >= 120 && foot.y <= 248) {
        this.triggerWestBarrierThought(false);
      }
    }

    // V14-P8-13: Kiểm tra nếu nhân vật lại gần chướng ngại vật cầu đá sập chặn lối thẳng (crooked_path x ~ 1760, y ~ 280)
    if (this.currentZoneId === 'crooked_path' && this.player) {
      const foot = this.player.getFootPosition();
      if (Math.hypot(foot.x - 1760, foot.y - 280) < 65) {
        this.triggerCollapsedBridgeThought(false);
      }
    }

    // Kiểm tra NPC và tương tác gần
    this.handleInteractions(delta);

    // Cập nhật hiệu ứng sương mù động & đom đóm (PASS T17 & C4-12-29)
    this.updateFogOfWar();
    this.updateFireflies(time);

    // V1.4: Tự động kiểm tra giáng cấp đồ họa (Auto-Fallback) khi FPS < 38 trong 4 giây liên tục
    const autoFallbackResult = GraphicsQualitySystem.getInstance().updateAutoFallback(this.game.loop.actualFps, delta);
    if (autoFallbackResult.fallbackOccurred && autoFallbackResult.newLevel) {
      const newSettings = GraphicsQualitySystem.getInstance().getSettings();
      this.applyGraphicsQuality(newSettings);
      if (this.uiScene) {
        this.uiScene.showPopupMessage(
          `⚙️ TỰ ĐỘNG TỐI ƯU ĐỒ HỌA [${autoFallbackResult.newLevel}]: Đã kích hoạt bộ đệm ánh sáng ${newSettings.lightingScale}x để ổn định 60 FPS!`
        );
      }
    }

    // Cập nhật F4 & F9 Debug Overlays
    this.debugOverlay.update(this.currentZoneId);
    this.hitboxInspector.update(this.currentZoneId, delta);
  }

  /**
   * V1.4: Áp dụng cài đặt chất lượng đồ họa mới (HIGH / MEDIUM / LOW)
   */
  public applyGraphicsQuality(settings: GraphicsQualitySettings): void {
    if (this.fogOfWarLayer) {
      this.fogOfWarLayer.resize(settings.bufferWidth, settings.bufferHeight);
      this.fogOfWarLayer.setDisplaySize(1280, 720);
      this.lastFowScreenX = -9999; // Ép vẽ lại FOW ngay lập tức
    }
    if (this.fireflyGfx && settings.maxFireflies <= 0) {
      this.fireflyGfx.clear();
      this.firefliesDrawnCount = 0;
    }
  }

  private updateAct0Progression(): void {
    if (this.isAct0IntroPending && !this.act0TutorialDone && this.player.x >= 280) {
      this.act0TutorialDone = true;
      if (this.act0EchoGfx) {
        this.tweens.add({
          targets: this.act0EchoGfx,
          alpha: 0,
          duration: 900,
          onComplete: () => {
            this.act0EchoGfx?.destroy();
          }
        });
      }

      if (this.uiScene) {
        this.uiScene.showPopupMessage('Echo: “Đi theo tiếng chuông... Làng Bellhollow ở ngay phía trước...”');
      }

      // Đánh dấu hoàn thành Hồi 0
      this.playerState.completeQuestTask('Q00_WAKE_UP', 't1');
      this.playerState.completeQuestTask('Q00_WAKE_UP', 't2');
      this.playerState.setCurrentQuest('Q01_MEET_EDDA');

      // Tự động lưu checkpoint Act 0
      SaveManager.saveGame('HỒI 0 HOÀN THÀNH (CỔNG LÀNG BELLHOLLOW)', 'bellhollow', this.player.x, this.player.y);
    }
  }

  private updateTheListenerAI(delta: number): void {
    if (!this.listenerMonster) {
      if (this.veilSystem) {
        this.veilSystem.updateRainThreatVisualIndicator(9999, false);
      }
      return;
    }
    if ((this.endingSystem && this.endingSystem.isEndingActive) || this.isGameOverPending || (this.player && this.player.isDead())) {
      this.listenerMonster.setVelocity(0, 0);
      this.listenerMonster.ai.resetToPatrol();
      if (this.veilSystem) {
        this.veilSystem.updateRainThreatVisualIndicator(9999, false);
      }
      return;
    }

    const currentPhase = this.timeSystem ? this.timeSystem.getCurrentPhase() : 'DAY';
    this.listenerMonster.update(delta, this.player.x, this.player.y, this.player.stats.isHiding, this.player.isDead(), currentPhase);

    // C4-13-05 & C4-132-05: Toàn bộ Làng Bellhollow và khu vực cổng làng là Khu Vực An Toàn (Safe Zone)
    const isPlayerInSafeZone = (this.currentZoneId === 'bellhollow' && this.player.x <= 1620) || this.currentZoneId === 'sanctuary_farm' || this.currentZoneId === 'fog_crossing';

    // V14-P7-01: Chỉ báo thị giác nguy hiểm (Visual Threat Accessibility Indicator) khi mưa sương át âm thanh
    if (this.veilSystem) {
      const dist = (this.listenerMonster && !isPlayerInSafeZone)
        ? Math.hypot(this.player.x - this.listenerMonster.x, this.player.y - this.listenerMonster.y)
        : 9999;
      if (dist < 380) {
        this.playerState.observeCreature('listener');
      }
      const isRaining = this.weatherSystem ? this.weatherSystem.isRaining() : false;
      this.veilSystem.updateRainThreatVisualIndicator(dist, isRaining);
    }

    // Cảnh báo âm thanh nhịp tim căng thẳng khi The Listener ở cự ly gần (<260px) trong phân khu rừng
    if ((this.currentZoneId === 'crooked_path' || this.currentZoneId === 'deep_forest') && !this.isAct5ChaseActive && !isPlayerInSafeZone) {
      const dist = Math.hypot(this.player.x - this.listenerMonster.x, this.player.y - this.listenerMonster.y);
      if (dist < 260 && !this.player.stats.isHiding && this.playerState.stats.composure >= 40) {
        if (this.listenerMonster.ai.state !== 'CHASE') {
          this.audioManager.setHeartbeatActive(true, 750);
        }
      } else if (dist >= 320 && this.listenerMonster.ai.state !== 'CHASE' && this.playerState.stats.composure >= 50) {
        this.audioManager.setHeartbeatActive(false);
      }
    } else if (isPlayerInSafeZone && !this.isAct5ChaseActive) {
      // Khi người chơi an toàn trong làng, luôn giữ nhịp tim ổn định và bình yên
      this.audioManager.setHeartbeatActive(false);
    }

    // Nếu người chơi chạy nhanh (Sprint) tạo ra tiếng ồn bước chân trong khu vực rừng
    if (this.player.stats.isSprinting && !isPlayerInSafeZone) {
      this.stepNoiseTimer += delta;
      if (this.stepNoiseTimer >= 350) {
        this.stepNoiseTimer = 0;
        const rainDampening = this.weatherSystem ? this.weatherSystem.getFootstepNoiseDampening() : 1.0;
        const equipMultiplier = EquipmentSystem.getInstance().getNoiseRadiusMultiplier();
        const effectiveVolume = 1.0 * rainDampening * equipMultiplier;
        this.emitNoiseWave(this.player.x, this.player.y, effectiveVolume);
        this.listenerMonster.hearSound(this.player.x, this.player.y, effectiveVolume);
      }
    }

    // Cảnh báo công bằng khi trời Mưa Sương: The Listener ở gần (<220px) kích hoạt nhịp tim cảnh giác
    if (this.weatherSystem && this.weatherSystem.isRaining() && !isPlayerInSafeZone) {
      const dist = Math.hypot(this.player.x - this.listenerMonster.x, this.player.y - this.listenerMonster.y);
      if (dist < 220 && this.listenerMonster.ai.state !== 'CHASE') {
        this.audioManager.setHeartbeatActive(true, 700);
      }
    }
  }

  private emitNoiseWave(x: number, y: number, _vol: number): void {
    // C4-13-18: Tuyệt đối không phát sóng âm vòng tròn xanh dương ở các khu vực an toàn (làng Bellhollow, nông trại)
    // hoặc khi đứng gần NPC để tránh hiển thị ngoài ý muốn dưới chân nhân vật
    if (this.currentZoneId === 'bellhollow' || this.currentZoneId === 'sanctuary_farm') {
      return;
    }

    const wave = this.add.graphics();
    wave.lineStyle(1, 0x3498db, 0.7);
    wave.strokeCircle(x, y, 6);
    wave.setDepth(y);

    this.tweens.add({
      targets: wave,
      alpha: 0,
      scaleX: 2.8,
      scaleY: 2.8,
      duration: 500,
      ease: 'Quad.easeOut',
      onComplete: () => wave.destroy(),
      onStop: () => wave.destroy()
    });

    // C4-132-05: Tự hủy tối đa 800ms
    this.time.delayedCall(800, () => {
      if (wave && wave.active) {
        wave.destroy();
      }
    });
  }

  // C4-132-01: Xử lý tác động thực tế của đòn tấn công tự vệ (Satyr vung vũ khí)
  private handlePlayerAttackHitbox(hitbox: { x: number; y: number; radius: number; facing: string; playerX: number; playerY: number; weapon?: WeaponDef }): void {
    const weaponDef = hitbox.weapon || EquipmentSystem.getInstance().getActiveWeaponDef();
    const noiseRad = weaponDef.noiseRadius || 120;
    const soundVol = noiseRad / 120;

    // 1. V1.4 - P8-03: Mọi cú vung vũ khí đều phát ra sóng âm bán kính 120px báo động The Listener ở gần
    this.emitNoiseWave(hitbox.playerX, hitbox.playerY, soundVol);
    if (this.listenerMonster && typeof this.listenerMonster.hearSound === 'function') {
      this.listenerMonster.hearSound(hitbox.playerX, hitbox.playerY, soundVol, hitbox.playerX, hitbox.playerY);
    }

    // Làm kinh động đàn quạ trong phạm vi tiếng ồn của vũ khí (120px)
    if (this.wildlifeSystem) {
      this.wildlifeSystem.spookCrowsNear(hitbox.playerX, hitbox.playerY, noiseRad, 'player_attack');
    }

    // 2. Quét thực thể The Listener trong tầm quét bán kính hitbox
    if (this.listenerMonster && this.listenerMonster.active && this.listenerMonster.body) {
      const distToListener = Math.hypot(this.listenerMonster.x - hitbox.x, this.listenerMonster.y - hitbox.y);
      if (distToListener <= hitbox.radius + 24) {
        const now = Date.now();
        // Cooldown chống spam stagger (1.0s)
        if (now - this.lastMonsterStaggerTime >= 1000) {
          this.lastMonsterStaggerTime = now;

          // Hiệu ứng tia sáng va chạm (Clash hit spark)
          this.createHitSpark(hitbox.x, hitbox.y);

          // V1.4 - P8-03: Kẻ địch phát hiệu ứng chớp đỏ (hurt flash: setTint(0xff3333) trong 160ms)
          if (typeof (this.listenerMonster as any).setTint === 'function') {
            (this.listenerMonster as any).setTint(0xff3333);
            this.time.delayedCall(160, () => {
              if (this.listenerMonster && this.listenerMonster.active) {
                if (typeof (this.listenerMonster as any).clearTint === 'function') {
                  (this.listenerMonster as any).clearTint();
                }
              }
            });
          }

          // V1.4 - P8-03: Đẩy lùi (Knockback) theo hướng đánh và làm choáng (Stagger) theo chỉ số vũ khí
          const angle = Math.atan2(this.listenerMonster.y - hitbox.playerY, this.listenerMonster.x - hitbox.playerX);
          const knockbackDist = weaponDef.knockbackDistance || weaponDef.knockback || 20;
          const knockbackSpeed = weaponDef.knockback;
          this.listenerMonster.x += Math.cos(angle) * knockbackDist;
          this.listenerMonster.y += Math.sin(angle) * knockbackDist;

          const body = this.listenerMonster.body as Phaser.Physics.Arcade.Body;
          if (body) {
            body.setVelocity(Math.cos(angle) * knockbackSpeed * 6, Math.sin(angle) * knockbackSpeed * 6);
          }

          const staggerDur = weaponDef.staggerDuration;
          this.listenerMonster.triggerAttackCooldown(staggerDur + 800);

          this.time.delayedCall(staggerDur, () => {
            if (this.listenerMonster && this.listenerMonster.active && this.listenerMonster.body) {
              (this.listenerMonster.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
            }
          });

          if (this.uiScene) {
            this.uiScene.showPopupMessage(`Đòn ${weaponDef.name} trúng đích! (${weaponDef.damage} sát thương) — Kẻ Lắng Nghe bị đẩy lùi!`);
          }
        }
      }
    }

    // 3. Quét The Echo nếu đang hiển thị
    if (this.echoSystem) {
      const echoContainer = (this.echoSystem as any).activeEchoContainer as Phaser.GameObjects.Container | undefined;
      if (echoContainer && echoContainer.visible) {
        const distToEcho = Math.hypot(echoContainer.x - hitbox.x, echoContainer.y - hitbox.y);
        if (distToEcho <= hitbox.radius + 20) {
          this.createHitSpark(hitbox.x, hitbox.y);
          this.tweens.add({
            targets: echoContainer,
            alpha: 0,
            duration: 300,
            onComplete: () => {
              echoContainer.setVisible(false);
            }
          });
          if (this.uiScene) {
            this.uiScene.showPopupMessage('Bóng hình Tiếng Vọng tan biến vào màn sương...');
          }
        }
      }
    }

    // 4. V1.4 - P6: Tác động lên Kẻ Nuốt Tiếng Chuông (Mire Warden Boss) khi bị choáng
    if (this.isBossFightActive && this.mireWardenBoss && this.mireWardenBoss.active) {
      if (this.mireWardenBoss.isStaggered) {
        const distToBoss = Math.hypot(this.mireWardenBoss.x - hitbox.x, this.mireWardenBoss.y - hitbox.y);
        if (distToBoss <= hitbox.radius + 36) {
          this.createHitSpark(hitbox.x, hitbox.y);
          this.handleBossSealInteraction();
        }
      } else {
        this.mireWardenBoss.hearSound(hitbox.playerX, hitbox.playerY, false);
      }
    }

    // 5. V1.4 - P8-08: Tác động lên Sói Xương (Skull Wolves) khi trong tầm chém
    if (this.wildlifeSystem) {
      const wolves = this.wildlifeSystem.getSkullWolves();
      for (const wolf of wolves) {
        if (wolf.active && !wolf.isDefeated && wolf.wolfState !== 'dissolve') {
          const distToWolf = Math.hypot(wolf.x - hitbox.x, wolf.y - hitbox.y);
          if (distToWolf <= hitbox.radius + 28) {
            this.createHitSpark(hitbox.x, hitbox.y);
            const dmg = weaponDef.damage || 1;
            wolf.takeDamage(dmg, hitbox.playerX, hitbox.playerY);
            if (this.uiScene) {
              if (wolf.currentHp <= 0) {
                this.uiScene.showPopupMessage('💀 Hạ gục Sói Xương! Thu thập được Nanh Xương Cổ!');
              } else {
                this.uiScene.showPopupMessage(`Đòn ${weaponDef.name} chém trúng Sói Xương! (-${dmg} HP)`);
              }
            }
          }
        }
      }
    }

    // 6. V1.4 - P8-09: Tác động lên Quạ Bóng Tối (Shadow Crow) khi vung chém
    if (this.wildlifeSystem) {
      const shadowCrows = this.wildlifeSystem.getShadowCrows();
      for (const crow of shadowCrows) {
        if (crow.active && !crow.isDefeated && crow.crowState !== 'dissolve') {
          const distToCrow = Math.hypot(crow.x - hitbox.x, crow.y - hitbox.y);
          if (distToCrow <= hitbox.radius + 24) {
            this.createHitSpark(hitbox.x, hitbox.y);
            crow.takeDamage(weaponDef.damage || 1);
            if (this.uiScene) {
              this.uiScene.showPopupMessage('⚔ Đánh trúng Quạ Bóng Tối! Tiếng rít vang vọng màn sương!');
            }
          }
        }
      }
    }

    // 7. V1.4 - P8-09: Tác động lên Trùm Bóng Tối Khổng Lồ (Shadow Behemoth Boss)
    if (this.wildlifeSystem) {
      const behemoth = this.wildlifeSystem.getShadowBehemoth();
      if (behemoth && behemoth.active && !behemoth.isDefeated && behemoth.bossState !== 'death') {
        const distToBoss = Math.hypot(behemoth.x - hitbox.x, behemoth.y - hitbox.y);
        if (distToBoss <= hitbox.radius + 45) {
          this.createHitSpark(hitbox.x, hitbox.y);
          const dmg = weaponDef.damage || 1;
          behemoth.takeDamage(dmg);
          if (this.uiScene) {
            if (behemoth.isVulnerable) {
              this.uiScene.showPopupMessage(`⚡ ĐÁNH VÀO ĐIỂM YẾU! Chí mạng x2 sát thương (-${dmg * 2} HP) lên Trùm Bóng Tối!`);
            } else if (behemoth.currentHp <= 0) {
              this.uiScene.showPopupMessage('👑 Trùm Bóng Tối Khổng Lồ đã bị tiêu diệt! Thu thập Mảnh Tinh Chất Bóng Tối!');
            } else {
              this.uiScene.showPopupMessage(`Đòn ${weaponDef.name} chém vào Trùm Bóng Tối! (-${dmg} HP)`);
            }
          }
        }
      }
    }

    // 8. V1.4 - P8-10: Tác động lên Hiệp Sĩ Sa Ngã (Fallen Knight) khi vung chém
    if (this.wildlifeSystem) {
      const fallenKnights = this.wildlifeSystem.getFallenKnights();
      for (const fk of fallenKnights) {
        if (fk.active && !fk.isDefeated && fk.knightState !== 'death') {
          const distToFk = Math.hypot(fk.x - hitbox.x, fk.y - hitbox.y);
          if (distToFk <= hitbox.radius + 26) {
            this.createHitSpark(hitbox.x, hitbox.y);
            const dmg = weaponDef.damage || 1;
            fk.takeDamage(dmg, this.player.x, this.player.y);
            if (this.uiScene) {
              if (fk.isVulnerable) {
                this.uiScene.showPopupMessage(`⚡ Đòn đánh trúng điểm sơ hở! Sát thương x2 (-${dmg * 2} HP) lên Hiệp Sĩ Sa Ngã!`);
              } else if (fk.hp <= 0) {
                this.uiScene.showPopupMessage('⚔ Đã tiêu diệt Hiệp Sĩ Sa Ngã!');
              } else {
                this.uiScene.showPopupMessage(`Đòn ${weaponDef.name} chém vào Hiệp Sĩ Sa Ngã! (-${dmg} HP)`);
              }
            }
          }
        }
      }
    }

    // 9. V1.4 - P8-10: Tác động lên Kỵ Binh Hắc Ám (Dread Horseman) khi vung chém
    if (this.wildlifeSystem) {
      const dreadHorsemen = this.wildlifeSystem.getDreadHorsemen();
      for (const dh of dreadHorsemen) {
        if (dh.active && !dh.isDefeated && dh.horseState !== 'death') {
          const distToDh = Math.hypot(dh.x - hitbox.x, dh.y - hitbox.y);
          if (distToDh <= hitbox.radius + 34) {
            this.createHitSpark(hitbox.x, hitbox.y);
            const dmg = weaponDef.damage || 1;
            dh.takeDamage(dmg, this.player.x, this.player.y);
            if (this.uiScene) {
              if (dh.isVulnerable) {
                this.uiScene.showPopupMessage(`⚡ Đòn phản công sườn ngựa! Sát thương x2 (-${dmg * 2} HP) lên Kỵ Binh Hắc Ám!`);
              } else if (dh.hp <= 0) {
                this.uiScene.showPopupMessage('🐎 Kỵ Binh Hắc Ám đã bị tiêu diệt!');
              } else {
                this.uiScene.showPopupMessage(`Đòn ${weaponDef.name} đánh trúng Kỵ Binh Hắc Ám! (-${dmg} HP)`);
              }
            }
          }
        }
      }
    }

    // 10. V1.4 - P8-10: Tác động lên Chỉ Huy Hiệp Sĩ Trùm Mũ (Hooded Knight Boss)
    if (this.wildlifeSystem) {
      const hoodedBoss = this.wildlifeSystem.getHoodedKnight();
      if (hoodedBoss && hoodedBoss.active && !hoodedBoss.isDefeated && hoodedBoss.bossState !== 'death') {
        const distToBoss = Math.hypot(hoodedBoss.x - hitbox.x, hoodedBoss.y - hitbox.y);
        if (distToBoss <= hitbox.radius + 48) {
          this.createHitSpark(hitbox.x, hitbox.y);
          const dmg = weaponDef.damage || 1;
          hoodedBoss.takeDamage(dmg);
          if (this.uiScene) {
            if (hoodedBoss.isVulnerable) {
              this.uiScene.showPopupMessage(`⚡ ĐÒN PHẢN KÍCH CHOÁNG VÁNG! Sát thương x2 (-${dmg * 2} HP) lên Chỉ Huy Hiệp Sĩ!`);
            } else if (hoodedBoss.currentHp <= 0) {
              this.uiScene.showPopupMessage('👑 CHỈ HUY HIỆP SĨ TRÙM MŨ ĐÃ BỊ TIÊU DIỆT! Thu nhận Huy Hiệu Hiệp Sĩ Tha Hóa!');
            } else {
              this.uiScene.showPopupMessage(`Đòn ${weaponDef.name} chém vào Chỉ Huy Hiệp Sĩ! (-${dmg} HP)`);
            }
          }
        }
      }
    }

    // 11. V1.4 - Bước 9: Tác động lên Dơi Sương Mù (Mist Bat) khi vung chém
    if (this.wildlifeSystem) {
      const bats = this.wildlifeSystem.getMistBats();
      for (const bat of bats) {
        if (bat.active && !bat.isFinished && bat.batPhase !== 'retreat') {
          const distToBat = Math.hypot(bat.x - hitbox.x, bat.y - hitbox.y);
          if (distToBat <= hitbox.radius + 24) {
            this.createHitSpark(hitbox.x, hitbox.y);
            bat.takeDamage(weaponDef.damage || 1);
            if (this.uiScene) {
              this.uiScene.showPopupMessage('🦇 Đòn đánh trúng Dơi Sương Mù! Đàn dơi thét lên rồi bay tán loạn!');
            }
          }
        }
      }
    }

    // 12. V1.4 - Bước 9: Tác động lên Hồn Ma Phiêu Bạt (Wandering Shade) khi vung chém
    if (this.wildlifeSystem) {
      const shades = this.wildlifeSystem.getWanderingShades();
      for (const shade of shades) {
        if (shade.active && !shade.isFinished) {
          const distToShade = Math.hypot(shade.x - hitbox.x, shade.y - hitbox.y);
          if (distToShade <= hitbox.radius + 24) {
            this.createHitSpark(hitbox.x, hitbox.y);
            shade.takeDamage(weaponDef.damage || 1);
            if (this.uiScene) {
              this.uiScene.showPopupMessage('✨ Vũ khí xua tan Hồn Ma! Linh hồn bốc hơi vào làn sương!');
            }
          }
        }
      }
    }

    // 13. V1.4 - Bước 9: Tác động lên Kẻ Rình Mập Vô Diện (Goblin Scout) khi vung chém
    if (this.wildlifeSystem) {
      const scouts = this.wildlifeSystem.getGoblinScouts();
      for (const scout of scouts) {
        if (scout.active && !scout.isFinished) {
          const distToScout = Math.hypot(scout.x - hitbox.x, scout.y - hitbox.y);
          if (distToScout <= hitbox.radius + 26) {
            this.createHitSpark(hitbox.x, hitbox.y);
            scout.takeDamage(weaponDef.damage || 1);
            if (this.uiScene) {
              this.uiScene.showPopupMessage('🗡 Kẻ Rình Mập Vô Diện trúng đòn, lập tức ném bom khói lẩn mất!');
            }
          }
        }
      }
    }
  }

  private createHitSpark(x: number, y: number): void {
    const spark = this.add.graphics();
    spark.setDepth(9999);
    spark.fillStyle(0xffffff, 1);
    spark.fillCircle(x, y, 4);
    spark.lineStyle(2, 0xffd700, 1);
    spark.beginPath();
    spark.moveTo(x - 14, y); spark.lineTo(x + 14, y);
    spark.moveTo(x, y - 14); spark.lineTo(x, y + 14);
    spark.moveTo(x - 10, y - 10); spark.lineTo(x + 10, y + 10);
    spark.moveTo(x - 10, y + 10); spark.lineTo(x + 10, y - 10);
    spark.strokePath();

    this.tweens.add({
      targets: spark,
      alpha: 0,
      scaleX: 1.8,
      scaleY: 1.8,
      duration: 250,
      ease: 'Quad.easeOut',
      onComplete: () => spark.destroy(),
      onStop: () => spark.destroy()
    });

    // C4-132-05: Tự hủy tối đa 800ms
    this.time.delayedCall(800, () => {
      if (spark && spark.active) {
        spark.destroy();
      }
    });
  }

  /**
   * C4-14-B04: Hiệu ứng bùng sáng hổ phách & tàn lửa khi bật Đèn Lồng (Game Feel / Juice)
   */
  private createLanternIgniteEffect(x: number, y: number): void {
    const flashGfx = this.add.graphics();
    flashGfx.setDepth(this.player.depth + 10);
    flashGfx.fillStyle(0xffb300, 0.45);
    flashGfx.fillCircle(x, y - 8, 38);
    this.tweens.add({
      targets: flashGfx,
      scaleX: 1.4,
      scaleY: 1.4,
      alpha: 0,
      duration: 320,
      ease: 'Quad.easeOut',
      onComplete: () => flashGfx.destroy()
    });

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const dist = 14 + Math.random() * 16;
      const spark = this.add.graphics();
      spark.setDepth(this.player.depth + 11);
      spark.fillStyle(0xffe082, 0.9);
      spark.fillRect(x - 1, y - 8, 2, 2);
      this.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * dist,
        y: y - 8 + Math.sin(angle) * dist - 8,
        alpha: 0,
        duration: 350 + Math.random() * 100,
        ease: 'Cubic.easeOut',
        onComplete: () => spark.destroy()
      });
    }
    this.cameraSystem?.shake(70, 0.002);
  }

  /**
   * C4-14-B04: Hiệu ứng tàn khói tro bay lên khi tắt Đèn Lồng
   */
  private createLanternExtinguishEffect(x: number, y: number): void {
    for (let i = 0; i < 3; i++) {
      const puff = this.add.graphics();
      puff.setDepth(this.player.depth + 10);
      puff.fillStyle(0x7f8c8d, 0.6);
      puff.fillCircle(x + (Math.random() - 0.5) * 8, y - 12, 3 + i);
      this.tweens.add({
        targets: puff,
        y: puff.y - 18,
        alpha: 0,
        scaleX: 1.8,
        scaleY: 1.8,
        duration: 450,
        onComplete: () => puff.destroy()
      });
    }
  }

  /**
   * C4-14-B04: Hiệu ứng hạt xúc giác nảy ra khi thu thập tài nguyên hoặc tương tác thế giới
   */
  public createResourcePopEffect(x: number, y: number, color: number = 0xf39c12, count: number = 6): void {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const dist = 12 + Math.random() * 18;
      const p = this.add.graphics();
      p.setDepth(9999);
      p.fillStyle(color, 0.95);
      const size = 2 + Math.floor(Math.random() * 2);
      p.fillRect(0, 0, size, size);
      p.setPosition(x, y - 10);

      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * dist,
        y: y - 10 + Math.sin(angle) * dist + 10,
        alpha: 0,
        duration: 320 + Math.random() * 120,
        ease: 'Quad.easeOut',
        onComplete: () => p.destroy()
      });
    }
    this.cameraSystem?.shake(80, 0.003);
  }

  /**
   * C4-14-B04: Điểm hút mở đầu (30-60 giây đầu) — Tiếng cành cây gãy & bóng ma thoáng qua
   */
  private triggerAct0AtmosphereTelegraph(): void {
    this.hasTriggeredAct0Telegraph = true;

    // 1. Âm thanh rùng rợn: tiếng cành cây gãy giòn & tiếng động lạ
    this.audioManager?.playFootstep('wood');
    this.audioManager?.playListenerAlert();

    // 2. Rung nhẹ camera tạo cảm giác giật mình tinh tế
    this.cameraSystem?.shake(240, 0.005);

    // 3. Bóng ma thoáng qua lướt nhanh sau rặng cây phía Bắc (240, 95)
    const shadowWisp = this.add.graphics();
    shadowWisp.fillStyle(0x0a0f0d, 0.75);
    shadowWisp.fillEllipse(240, 95, 20, 36);
    shadowWisp.fillStyle(0x8e44ad, 0.4);
    shadowWisp.fillCircle(240, 85, 8);
    shadowWisp.setDepth(90);

    this.tweens.add({
      targets: shadowWisp,
      x: 275,
      alpha: 0,
      duration: 650,
      ease: 'Power2',
      onComplete: () => shadowWisp.destroy()
    });

    // 4. Dòng suy nghĩ nội tâm dẫn dắt mục tiêu tò mò
    if (this.uiScene) {
      this.uiScene.showPopupMessage('🍂 RĂNG RẮC! Có tiếng cành cây gãy sau lưng... Hãy đi theo ánh đèn phía trước!');
    }

    // 5. Tiếng chuông đồng ngân nga từ xa dẫn hướng
    this.time.delayedCall(1200, () => {
      this.audioManager?.playBronzeBellToll();
    });
  }

  /**
   * C4-14-B04: Cân bằng nhịp độ Sanctuary an toàn vs Rừng Sương Mù nguy hiểm
   */
  private updateSanctuaryAndWildernessAtmosphere(delta: number): void {
    if (!this.player || !this.playerState) return;

    const isInSanctuary = this.currentZoneId === 'bellhollow';

    // 1. Phản hồi thị giác khi bước vào Sanctuary an toàn từ vùng nguy hiểm
    if (isInSanctuary && !this.wasInSanctuary) {
      this.wasInSanctuary = true;
      if (this.uiScene) {
        this.uiScene.triggerSanctuaryReliefGlow();
        this.uiScene.showPopupMessage('🕊️ Bạn đã bước vào vùng an toàn của Làng Chuông. Bình Tâm đang hồi phục.');
      }
    } else if (!isInSanctuary && this.wasInSanctuary) {
      this.wasInSanctuary = false;
      if (this.uiScene) {
        this.uiScene.showPopupMessage('🌫️ Bạn đã rời khỏi ranh giới an toàn. Hãy giữ ngọn Đèn Lồng [F] sáng để bảo vệ Bình Tâm!');
      }
    }

    // 2. Bóng quái rình rập ở rìa tầm nhìn (Peripheral Horror Flickers) khi tắt đèn lồng ngoài sương mù
    if (!isInSanctuary && !this.player.stats.isLanternOn && !this.isAct5ChaseActive) {
      this.unlitWildernessTimer += delta;
      const now = performance.now();
      if (this.unlitWildernessTimer >= 9000 && now - this.lastPeripheralShadowTime >= 14000) {
        this.lastPeripheralShadowTime = now;
        this.unlitWildernessTimer = 0;
        this.triggerPeripheralShadowFlicker();
      }
    } else {
      this.unlitWildernessTimer = 0;
    }
  }

  /**
   * C4-14-B04: Cặp mắt ma mị thoáng hiện ở rìa tầm nhìn trong sương tối
   */
  private triggerPeripheralShadowFlicker(): void {
    if (!this.player) return;
    const angle = Math.random() * Math.PI * 2;
    const dist = 140 + Math.random() * 40;
    const eyeX = this.player.x + Math.cos(angle) * dist;
    const eyeY = this.player.y + Math.sin(angle) * dist;

    const eyes = this.add.graphics();
    eyes.fillStyle(0x9b59b6, 0.85);
    eyes.fillEllipse(eyeX - 4, eyeY, 3, 2);
    eyes.fillEllipse(eyeX + 4, eyeY, 3, 2);
    eyes.fillStyle(0xecf0f1, 0.9);
    eyes.fillCircle(eyeX - 4, eyeY, 1);
    eyes.fillCircle(eyeX + 4, eyeY, 1);
    eyes.setDepth(this.player.depth + 10);

    this.tweens.add({
      targets: eyes,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 550,
      ease: 'Sine.easeOut',
      onComplete: () => eyes.destroy()
    });

    this.cameraSystem?.shake(80, 0.002);
  }

  /**
   * V1.4 - P8-03: Cơ chế cắm Đuốc Nhựa Thông xuống đất (Resin Flare — HW-ITM-CNS-000003)
   * Cho phép người chơi cắm Đuốc Nhựa Thông (item_resin_flare) trực tiếp xuống đất tại tọa độ chân nhân vật:
   * - Tạo ngọn đuốc sáng ấm áp tồn tại trong 15 giây (15000ms), xua tan sương mù quanh bán kính 200px.
   * - Tích cực xua đuổi hiện tượng The Echo và ngăn The Listener tiếp cận (repelByFlare).
   */
  public tryPlantResinFlare(): boolean {
    return this.plantResinFlare();
  }

  public plantResinFlare(customX?: number, customY?: number): boolean {
    const px = customX !== undefined ? customX : (this.player ? this.player.x : 0);
    const py = customY !== undefined ? customY : (this.player ? this.player.y : 0);

    if (this.playerState.getItemCount('item_resin_flare') <= 0) {
      if (this.uiScene) {
        this.uiScene.showPopupMessage('⚠️ Chưa có Đuốc Nhựa Thông! Hãy chế tạo bằng [C]/[I].');
      }
      return false;
    }

    // Tiêu hao 1 đơn vị Đuốc Nhựa Thông
    this.playerState.removeItem('item_resin_flare', 1);
    if (this.player && typeof this.player.playUseItem === 'function') {
      this.player.playUseItem();
    }

    // 1. Cắm cọc gỗ xuống đất
    const torchGfx = this.add.graphics();
    torchGfx.fillStyle(0x4a2e18, 1);
    torchGfx.fillRect(px - 2, py - 18, 4, 18);
    torchGfx.fillStyle(0x27190d, 1);
    torchGfx.fillCircle(px, py - 18, 3);
    torchGfx.setDepth(py - 1);

    // 2. Ngọn lửa bập bùng ấm áp
    const flameGfx = this.add.graphics();
    flameGfx.fillStyle(0xf39c12, 0.95);
    flameGfx.fillCircle(px, py - 22, 6);
    flameGfx.fillStyle(0xfff3cd, 1);
    flameGfx.fillCircle(px, py - 23, 3);
    flameGfx.setDepth(py);

    this.tweens.add({
      targets: flameGfx,
      scaleX: 1.25,
      scaleY: 1.35,
      duration: 240,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 3. Vầng hào quang sáng ấm áp màu hổ phách (Bán kính 200px)
    const glowGfx = this.add.graphics();
    glowGfx.fillStyle(0xf39c12, 0.18);
    glowGfx.fillCircle(px, py - 20, 180);
    glowGfx.fillStyle(0xffe082, 0.22);
    glowGfx.fillCircle(px, py - 20, 100);
    glowGfx.setDepth(py - 2);

    this.tweens.add({
      targets: glowGfx,
      alpha: 0.85,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 380,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const flare: PlantedResinFlare = {
      id: `flare_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      x: px,
      y: py,
      radius: 200,
      startTime: Date.now(),
      duration: 15000,
      torchGfx,
      flameGfx,
      glowGfx
    };
    this.plantedFlares.push(flare);

    // 4. Tích cực xua đuổi The Echo nếu ở trong bán kính đuốc
    if (this.echoSystem && this.echoSystem.activeEchoContainer) {
      const echo = this.echoSystem.activeEchoContainer;
      if (Math.hypot(echo.x - px, echo.y - py) <= 200) {
        echo.dissolve();
      }
    }

    // 5. Ngăn The Listener tiếp cận (repelByFlare)
    if (this.listenerMonster) {
      if (typeof (this.listenerMonster as any).repelByFlare === 'function') {
        (this.listenerMonster as any).repelByFlare(px, py, 15000);
      } else if (typeof (this.listenerMonster as any).triggerFlareRepel === 'function') {
        (this.listenerMonster as any).triggerFlareRepel(px, py, 15000);
      }
    }

    if (this.uiScene) {
      this.uiScene.showPopupMessage('🔥 Đã cắm Đuốc Nhựa Thông! Quầng sáng ấm áp bảo vệ trong 15s.');
      this.uiScene.updateQuickSlotCounts();
    }

    return true;
  }

  public updatePlantedFlares(): void {
    if (this.plantedFlares.length === 0) return;
    const now = Date.now();

    for (let i = this.plantedFlares.length - 1; i >= 0; i--) {
      const flare = this.plantedFlares[i];
      const elapsed = now - flare.startTime;

      if (elapsed >= flare.duration) {
        if (flare.flameGfx) flare.flameGfx.destroy();
        if (flare.torchGfx) flare.torchGfx.destroy();
        if (flare.glowGfx) flare.glowGfx.destroy();
        this.plantedFlares.splice(i, 1);
        if (this.uiScene) {
          this.uiScene.showPopupMessage('Đuốc Nhựa Thông đã lụi tàn.');
        }
        continue;
      }

      // Xua đuổi The Echo nếu tiếp cận quầng sáng đuốc
      if (this.echoSystem && this.echoSystem.activeEchoContainer) {
        const echo = this.echoSystem.activeEchoContainer;
        if (Math.hypot(echo.x - flare.x, echo.y - flare.y) <= flare.radius) {
          echo.dissolve();
        }
      }

      // Ngăn The Listener tiếp cận trong suốt 15s
      if (this.listenerMonster && this.listenerMonster.active) {
        const dist = Math.hypot(this.listenerMonster.x - flare.x, this.listenerMonster.y - flare.y);
        if (dist <= flare.radius + 40) {
          if (typeof (this.listenerMonster as any).repelByFlare === 'function') {
            (this.listenerMonster as any).repelByFlare(flare.x, flare.y, 4000);
          } else if (typeof (this.listenerMonster as any).triggerFlareRepel === 'function') {
            (this.listenerMonster as any).triggerFlareRepel(flare.x, flare.y, 4000);
          }
        }
      }
    }
  }

  private handleNoiseLureThrow(): void {
    const phaserQ = Boolean(this.keyQ && Phaser.Input.Keyboard.JustDown(this.keyQ));
    const physicalQ = Boolean(this.player && this.player.isLureRequested());
    if (phaserQ || physicalQ) {
      this.tryThrowNoiseLure();
    }
  }

  private tryThrowNoiseLure(): boolean {
    if (this.playerState.getItemCount('item_noise_lure') > 0) {
      this.playerState.removeItem('item_noise_lure', 1);
      this.throwNoiseLure();
      return true;
    }
    if (this.uiScene) {
      this.uiScene.showPopupMessage('Không có Mồi Tạo Tiếng Động! Hãy chế tạo bằng [Phím I]');
    }
    return false;
  }

  private throwNoiseLure(): void {
    let dirX = 0;
    let dirY = 0;
    if (this.player.facing === 'down') dirY = 1;
    else if (this.player.facing === 'up') dirY = -1;
    else if (this.player.facing === 'left') dirX = -1;
    else if (this.player.facing === 'right') dirX = 1;

    const targetX = this.player.x + dirX * 110;
    const targetY = this.player.y + dirY * 110;

    const lureG = this.add.graphics();
    lureG.fillStyle(0xe67e22, 1);
    lureG.fillCircle(0, 0, 4);
    lureG.setPosition(this.player.x, this.player.y - 10);
    lureG.setDepth(this.player.y + 10);

    this.tweens.add({
      targets: lureG,
      x: targetX,
      y: targetY,
      duration: 350,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.createLureDistraction(targetX, targetY);
        lureG.destroy();
      }
    });
  }

  private createLureDistraction(x: number, y: number): void {
    this.cameraSystem.shake(120, 0.004);

    if (this.uiScene) {
      this.uiScene.showPopupMessage('💥 Mồi nổ phát ra tiếng động lớn! Kẻ Lắng Nghe đang hướng tới vị trí đó!');
    }

    // Báo động The Listener chạy tới vị trí mồi ném (truyền kèm vị trí người chơi ném mồi)
    if (this.listenerMonster) {
      this.listenerMonster.hearSound(x, y, 2.5, this.player.x, this.player.y);
    }

    // V1.4 - P6: Kẻ Nuốt Tiếng Chuông (Mire Warden) nghe thấy mồi nổ -> lao húc CHARGING!
    if (this.isBossFightActive && this.mireWardenBoss) {
      this.mireWardenBoss.hearSound(x, y, true);
    }

    const spark = this.add.graphics();
    spark.fillStyle(0xf39c12, 1);
    spark.fillCircle(x, y, 8);
    spark.setDepth(y);

    this.tweens.add({
      targets: spark,
      alpha: 0,
      scaleX: 3.0,
      scaleY: 3.0,
      duration: 1600,
      onComplete: () => spark.destroy(),
      onStop: () => spark.destroy()
    });

    this.time.delayedCall(2000, () => {
      if (spark && spark.active) {
        spark.destroy();
      }
    });
  }

  public deployResinFlare(x: number, y: number): boolean {
    const flare = this.add.graphics();
    flare.fillStyle(0xf39c12, 0.45);
    flare.fillCircle(x, y, 260);
    flare.fillStyle(0xffe082, 0.7);
    flare.fillCircle(x, y, 140);
    flare.fillStyle(0xffffff, 0.95);
    flare.fillCircle(x, y, 30);
    flare.setDepth(y + 20);

    if (this.wildlifeSystem) {
      this.wildlifeSystem.spookCrowsNear(x, y, 220, 'flare_ignite');
    }

    this.tweens.add({
      targets: flare,
      scaleX: 1.08,
      scaleY: 1.08,
      alpha: 0.88,
      yoyo: true,
      repeat: -1,
      duration: 350
    });

    const repelTimer = this.time.addEvent({
      delay: 500,
      repeat: 30,
      callback: () => {
        if (this.listenerMonster && this.listenerMonster.active) {
          const dist = Math.hypot(this.listenerMonster.x - x, this.listenerMonster.y - y);
          if (dist <= 240) {
            this.listenerMonster.triggerFlareRepel(x, y, 3500);
          }
        }
      }
    });

    this.time.delayedCall(15000, () => {
      repelTimer.remove();
      this.tweens.add({
        targets: flare,
        alpha: 0,
        duration: 800,
        onComplete: () => flare.destroy()
      });
    });

    if (this.uiScene) {
      this.uiScene.showPopupMessage('🔥 Đuốc Nhựa Thông đã thắp sáng! Vùng an toàn khẩn cấp 15 giây!');
    }
    return true;
  }

  private startAct5EscapeChase(): void {
    this.isAct5ChaseActive = true;

    this.audioManager.playListenerAlert();
    this.audioManager.setHeartbeatActive(true, 420);

    this.cameraSystem.shake(900, 0.02);
    this.cameraSystem.flash(600, 160, 20, 20);

    if (this.uiScene) {
      this.uiScene.showPopupMessage('⚠️ TIẾNG CHUÔNG BỊ KHUẤY ĐỘNG! Kẻ Lắng Nghe đang lao tới! HÃY CHẠY VỀ LÀNG HOẶC NẤP TRONG THÂN CÂY!');
    }

    // Đưa The Listener tới gần lối thoát miếu chuông (X: 4200, Y: 260)
    if (this.listenerMonster) {
      this.listenerMonster.setPosition(4200, 260);
      this.listenerMonster.forceChase();
    }
  }

  private updateAct5ChaseLogic(): void {
    if (!this.isAct5ChaseActive) return;

    // Nếu Satyr đã chạy trốn thành công về làng Bellhollow (X <= 1400)
    if (this.player.x <= 1400 || this.currentZoneId === 'bellhollow') {
      this.isAct5ChaseActive = false;
      this.audioManager.setHeartbeatActive(false);

      // The Listener dừng lại ở bìa rừng phía đông làng
      if (this.listenerMonster) {
        this.listenerMonster.setPosition(1550, 280);
        this.listenerMonster.setVelocity(0, 0);
      }

      this.cameraSystem.shake(300, 0.006);
      if (this.uiScene) {
        this.uiScene.showPopupMessage('✔ BẠN ĐÃ THOÁT VỀ LÀNG AN TOÀN! Vòng phong ấn chuông ngăn cản Kẻ Lắng Nghe!');
      }

      this.playerState.completeQuestTask('Q06_RETRIEVE_CLAPPER', 't2');
      SaveManager.saveGame('HỒI 5: THOÁT THÀNH CÔNG VỀ LÀNG', 'bellhollow', this.player.x, this.player.y);
    }
  }

  /**
   * C4-12-27: Cập nhật giới hạn camera và physics bounds theo phân khu đích
   */
  public applyCameraBoundsForZone(zoneId: ZoneId): void {
    if (zoneId === 'abyssal_chasm') {
      this.physics.world.setBounds(0, -1350, 5000, 2500);
      this.cameraSystem.setWorldBounds({ x: 0, y: -1350, width: 5000, height: 2500 });
    } else if (zoneId === 'deep_forest') {
      this.physics.world.setBounds(0, -700, 5000, 1850);
      this.cameraSystem.setWorldBounds({ x: 0, y: -700, width: 5000, height: 1850 });
    } else {
      this.physics.world.setBounds(0, -250, 5000, 1400);
      this.cameraSystem.setWorldBounds({ x: 0, y: -250, width: 5000, height: 1400 });
    }

    if (zoneId === 'deep_forest' && this.worldBuilder) {
      const isAbyssalOpen = WorldGatingSystem.getInstance().isZoneUnlocked('abyssal_chasm', this.playerState);
      const isMireOpen = WorldGatingSystem.getInstance().isZoneUnlocked('silent_mire', this.playerState);
      this.worldBuilder.updateDeepForestBarriers(isAbyssalOpen, isMireOpen);
    }

    // V1.4: Tự động cập nhật nền địa hình tĩnh cho Mini-map khi chuyển phân khu
    if (this.uiScene && this.worldBuilder) {
      const zone = this.worldBuilder.getZone(zoneId) || this.worldBuilder.getActiveZone();
      if (zone) {
        const colliders = this.worldBuilder.getZoneColliders(zoneId);
        this.uiScene.updateMiniMapZone(zone, colliders, this.worldBuilder.transitions);
      }
    }
  }

  /**
   * C4-12-27: Xác định hướng nhìn chuẩn mực tại vùng đích
   */
  public resolveTransitionFacing(trans: TransitionZone): FacingDirection {
    switch (trans.id) {
      case 'to_bellhollow':
      case 'to_outer_woods_from_farm':
      case 'to_crooked_path':
      case 'to_crooked_path_from_ow':
      case 'to_silent_mire':
      case 'to_silent_mire_from_df':
      case 'to_rune_puzzle':
      case 'to_shrine':
        return 'right';

      case 'to_fog_crossing':
      case 'to_bellhollow_from_cp':
      case 'to_outer_woods_from_cp':
      case 'to_crooked_path_from_sm':
      case 'to_deep_forest_from_sm':
      case 'to_silent_mire_from_puzzle':
      case 'to_silent_mire_from_shrine':
      case 'to_farm_from_ow':
        return 'left';

      case 'to_sanctuary_farm':
      case 'to_outer_woods':
      case 'to_crooked_path_from_df':
        return 'down';

      case 'to_bellhollow_from_farm':
      case 'to_bellhollow_from_ow':
      case 'to_deep_forest':
        return 'up';
    }

    const retPoint = trans.returnPoint || { x: trans.triggerRect.x, y: trans.triggerRect.y };
    const dx = trans.targetSpawn.x - retPoint.x;
    const dy = trans.targetSpawn.y - retPoint.y;
    if (Math.abs(dx) >= Math.abs(dy)) {
      return dx >= 0 ? 'right' : 'left';
    } else {
      return dy >= 0 ? 'down' : 'up';
    }
  }

  /**
   * C4-12-27: Lấy mã ID của điểm chuyển tiếp vừa kích hoạt
   */
  public getLastTransitionId(): string | null {
    return this.lastTransitionId;
  }

  /**
   * C4-134-01: Kiểm tra xem 2 phân khu có phải là cặp liền kề liên tục trên bản đồ thế giới hay không
   */
  private isSeamlessAdjacentTransition(fromZone: string, toZone: string): boolean {
    const seamlessPairs = new Set([
      'fog_crossing:bellhollow',
      'bellhollow:fog_crossing',
      'bellhollow:sanctuary_farm',
      'sanctuary_farm:bellhollow',
      'bellhollow:outer_woods',
      'outer_woods:bellhollow',
      'sanctuary_farm:outer_woods',
      'outer_woods:sanctuary_farm',
      'bellhollow:crooked_path',
      'crooked_path:bellhollow',
      'outer_woods:crooked_path',
      'crooked_path:outer_woods',
      'crooked_path:silent_mire',
      'silent_mire:crooked_path',
      'silent_mire:broken_bell_shrine',
      'broken_bell_shrine:silent_mire'
    ]);
    return seamlessPairs.has(`${fromZone}:${toZone}`);
  }

  /**
   * C4-12-27 & C4-134-01: Kiểm tra va chạm với các Trigger chuyển vùng (có cơ chế Debounce/Cooldown & Lockout)
   */
  public checkZoneTransitions(delta: number): void {
    if (this.transitionCooldown > 0) {
      this.transitionCooldown -= delta;
    }

    const now = performance.now();
    if (this.isTransitioning || this.transitionCooldown > 0 || now < this.transitionCooldownUntil) {
      return;
    }

    const isUIBusy = 
      this.endingSystem.isEndingActive ||
      this.dialogueSystem.isActive || 
      this.craftingModal.isOpen || 
      this.journalModal.isOpen;

    if (isUIBusy) return;

    const footPos = this.player.getFootPosition();

    // Duyệt qua tất cả các transitions đã nạp trong WorldBuilder
    for (const trans of this.worldBuilder.transitions) {
      // Chỉ kích hoạt trigger thuộc về phân khu người chơi đang đứng
      if (trans.fromZone !== this.currentZoneId) continue;

      const trig = trans.triggerRect;
      if (
        footPos.x >= trig.x &&
        footPos.x <= trig.x + trig.width &&
        footPos.y >= trig.y &&
        footPos.y <= trig.y + trig.height
      ) {
        this.executeTransition(trans);
        return;
      }
    }
  }

  /**
   * C4-12-27 & C4-134-01: Thực thi chuyển vùng an toàn hoặc đẩy lùi nếu đang khóa
   */
  public executeTransition(trans: TransitionZone): void {
    const now = performance.now();
    if (this.isTransitioning || this.transitionCooldown > 0 || now < this.transitionCooldownUntil) return;

    const gating = WorldGatingSystem.getInstance();
    const isUnlocked = gating.isZoneUnlocked(trans.toZone, this.playerState);
    const evaluation = gating.evaluateTransition(trans.fromZone, trans.toZone, this.playerState);

    // TRƯỜNG HỢP 1: VÙNG ĐÍCH ĐANG KHÓA HOẶC CHỜ HOÀN THIỆN
    if (!isUnlocked || trans.status === 'pending_construction') {
      this.transitionCooldown = 1200; // 1.2s cooldown chống spam
      this.transitionCooldownUntil = performance.now() + 1200;
      const retPoint = trans.returnPoint || this.worldBuilder.getZone(trans.fromZone)?.defaultSpawn || { x: this.player.x, y: this.player.y };
      this.player.setPosition(retPoint.x, retPoint.y);
      this.player.setVelocity(0, 0);

      const reason = evaluation.reason || 'Khu vực này hiện đang bị phong ấn hoặc chưa hoàn thiện lối đi!';
      const hint = evaluation.hint ? `\n💡 ${evaluation.hint}` : '';
      if (this.uiScene) {
        this.uiScene.showPopupMessage(`🔒 ${reason} ${hint}`);
      }
      this.audioManager.playInteract();
      return;
    }

    // TRƯỜNG HỢP 2A: PHÂN KHU LIỀN KỀ LIÊN TỤC (SEAMLESS ADJACENT ZONES)
    // Giữ nguyên vị trí và vận tốc di chuyển tự nhiên của người chơi (TUYỆT ĐỐI KHÔNG setPosition/reset velocity)
    if (this.isSeamlessAdjacentTransition(trans.fromZone, trans.toZone)) {
      this.isTransitioning = true;
      this.transitionCooldown = 1000;
      this.transitionCooldownUntil = performance.now() + 1000;
      this.lastTransitionId = trans.id;

      // V14-P7-01: Thu dọn audio loops và VFX overlay trước khi chuyển cảnh
      this.audioManager.cleanupAudioLoops();
      if (this.veilSystem) {
        this.veilSystem.cleanupTransitionVFX();
        this.veilSystem.triggerZoneTransitionMist(350);
      }
      this.worldBuilder.hibernateDistantZoneObjects(trans.toZone);

      this.applyCameraBoundsForZone(trans.toZone);
      this.worldBuilder.updateCameraCulling(this.cameras.main);

      // V14-P8-11: Tự động thoát trạng thái ẩn nấp và tái xác nhận hiển thị nhân vật 100% khi chuyển sang phân khu mới
      if (this.player.stats.isHiding) {
        this.player.exitHiding();
      }
      this.player.setVisible(true);
      this.player.setActive(true);
      this.player.setAlpha(1);

      this.currentZoneId = trans.toZone;
      this.previousZoneId = trans.toZone;
      if (this.wildlifeSystem) {
        this.wildlifeSystem.switchZone(this.currentZoneId);
      }
      this.triggerCreatureObservationsForZone(this.currentZoneId);
      this.playerState.setCurrentZone(trans.toZone);
      this.audioManager.setAmbienceZone(trans.toZone);

      const targetZoneData = this.worldBuilder.getZone(trans.toZone);
      const currentTime = performance.now();
      if (targetZoneData && this.uiScene && (currentTime - this.lastZoneBannerTime >= 4000) && (trans.toZone !== this.lastBannerZoneId)) {
        this.lastZoneBannerTime = currentTime;
        this.lastBannerZoneId = trans.toZone;
        this.uiScene.showZoneBanner(targetZoneData.atmosphere);
        this.cameraSystem.shake(100, 0.002);
      }

      if (!this.isAct5ChaseActive) {
        const title = targetZoneData?.atmosphere.titleVietnamese || trans.toZone;
        SaveManager.saveGame(`KHU VỰC: ${title}`, trans.toZone, this.player.x, this.player.y);
      }

      // V1.4 - P6: Tự động kích hoạt trận đấu trùm Miếu Chuông khi bước vào phân khu sau khi giải Cổ Ngữ
      if (trans.toZone === 'broken_bell_shrine' && !this.playerState.hasFlag('boss_mire_warden_defeated') && (this.playerState.hasFlag('mire_pillars_solved') || this.playerState.hasFlag('mire_puzzle_solved'))) {
        this.time.delayedCall(800, () => {
          this.triggerMireWardenBossEncounter();
        });
      }

      // V14-P8-15A: Tự động nâng memoryAwakeningStage lên 1 khi khám phá Xưởng Chuông Bỏ Hoang
      if (trans.toZone === 'sub_bell_workshop' && this.playerState.memoryAwakeningStage < 1) {
        this.playerState.memoryAwakeningStage = 1;
        this.playerState.unlockLore('lore_black_knight_chronicle');
        if (this.uiScene) {
          this.uiScene.showPopupMessage('🗡️ [THỨC TỈNH KÝ ỨC - GIAI ĐOẠN 1]: Khám phá Xưởng Chuông Bỏ Hoang gợi lại tàn ảnh về Hiệp Sĩ Đen!');
        }
      }

      this.time.delayedCall(200, () => {
        this.isTransitioning = false;
      });
      return;
    }

    // TRƯỜNG HỢP 2B: CỔNG DỊCH CHUYỂN / PHÂN KHU ĐẶC BIỆT (PORTAL / GATEWAY)
    this.isTransitioning = true;
    this.transitionCooldown = 1500; // 1.5s cooldown chống kích hoạt lặp liên tục
    this.transitionCooldownUntil = performance.now() + 1500;
    this.lastTransitionId = trans.id;

    // V14-P7-01: Thu dọn audio loops và VFX overlay trước khi chuyển cảnh
    this.audioManager.cleanupAudioLoops();
    if (this.veilSystem) {
      this.veilSystem.cleanupTransitionVFX();
      this.veilSystem.triggerZoneTransitionMist(350);
    }

    // C4-13-20: Tự động đặt trạng thái ngủ đông cho các đối tượng phân khu xa
    this.worldBuilder.hibernateDistantZoneObjects(trans.toZone);

    // Hiệu ứng flash nhẹ camera tạo cảm giác chuyển tiếp tự nhiên
    this.cameraSystem.flash(180, 10, 15, 20);

    // Đặt vị trí và hướng nhìn chuẩn xác tại vùng đích
    this.player.setPosition(trans.targetSpawn.x, trans.targetSpawn.y);
    if (this.player.body) {
      (this.player.body as Phaser.Physics.Arcade.Body).reset(trans.targetSpawn.x, trans.targetSpawn.y);
    }
    this.player.setVelocity(0, 0);
    const targetFacing = this.resolveTransitionFacing(trans);
    this.player.setFacing(targetFacing);

    // Cập nhật camera bounds & physics bounds
    this.applyCameraBoundsForZone(trans.toZone);
    // C4-13-02: Canh giữa camera ngay lập tức vào vị trí nhân vật tại vùng mới
    this.cameraSystem.centerOn(trans.targetSpawn.x, trans.targetSpawn.y);
    // C4-12-29: Cập nhật culling ngay lập tức cho vùng đích mới
    this.worldBuilder.updateCameraCulling(this.cameras.main);

    // C4-13-02 / V14-P8-11: Bảo đảm nhân vật thoát trạng thái ẩn nấp và luôn hiển thị rõ ràng khi qua ranh giới cổng dịch chuyển
    if (this.player.stats.isHiding) {
      this.player.exitHiding();
    }
    this.player.setVisible(true);
    this.player.setActive(true);
    this.player.setAlpha(1);

    // Cập nhật âm thanh & phân khu
    this.currentZoneId = trans.toZone;
    this.previousZoneId = trans.toZone;
    if (this.wildlifeSystem) {
      this.wildlifeSystem.switchZone(this.currentZoneId);
    }
    this.triggerCreatureObservationsForZone(this.currentZoneId);
    this.playerState.setCurrentZone(trans.toZone);
    this.audioManager.setAmbienceZone(trans.toZone);

    // Hiển thị banner khu vực mới
    const targetZoneData = this.worldBuilder.getZone(trans.toZone);
    if (targetZoneData && this.uiScene) {
      this.lastZoneBannerTime = performance.now();
      this.lastBannerZoneId = trans.toZone;
      this.uiScene.showZoneBanner(targetZoneData.atmosphere);
      this.cameraSystem.shake(120, 0.003);
    }

    // Tự động lưu checkpoint nếu không trong cuộc rượt đuổi
    if (!this.isAct5ChaseActive) {
      const title = targetZoneData?.atmosphere.titleVietnamese || trans.toZone;
      SaveManager.saveGame(`KHU VỰC: ${title}`, trans.toZone, this.player.x, this.player.y);
    }

    // V1.4 - P6: Tự động kích hoạt trận đấu trùm Miếu Chuông khi bước vào phân khu sau khi giải Cổ Ngữ
    if (trans.toZone === 'broken_bell_shrine' && !this.playerState.hasFlag('boss_mire_warden_defeated') && (this.playerState.hasFlag('mire_pillars_solved') || this.playerState.hasFlag('mire_puzzle_solved'))) {
      this.time.delayedCall(800, () => {
        this.triggerMireWardenBossEncounter();
      });
    }

    // V14-P8-15A: Tự động nâng memoryAwakeningStage lên 1 khi khám phá Xưởng Chuông Bỏ Hoang
    if (trans.toZone === 'sub_bell_workshop' && this.playerState.memoryAwakeningStage < 1) {
      this.playerState.memoryAwakeningStage = 1;
      this.playerState.unlockLore('lore_black_knight_chronicle');
      if (this.uiScene) {
        this.uiScene.showPopupMessage('🗡️ [THỨC TỈNH KÝ ỨC - GIAI ĐOẠN 1]: Khám phá Xưởng Chuông Bỏ Hoang gợi lại tàn ảnh về Hiệp Sĩ Đen!');
      }
    }

    // Mở cờ trạng thái sau một nhịp ngắn
    this.time.delayedCall(200, () => {
      this.isTransitioning = false;
    });
  }

  private handleZoneLogic(): void {
    const footPos = this.player.getFootPosition();
    const detectedZone = this.worldBuilder.detectCurrentZone(footPos);

    // C4-12-27: Kiểm tra an toàn khi di chuyển liên tục qua ranh giới thế giới mở
    if (detectedZone !== this.currentZoneId) {
      const isUnlocked = WorldGatingSystem.getInstance().isZoneUnlocked(detectedZone, this.playerState);
      if (!isUnlocked) {
        const evalResult = WorldGatingSystem.getInstance().evaluateTransition(this.currentZoneId, detectedZone, this.playerState);
        const zoneData = this.worldBuilder.getZone(this.currentZoneId);
        const safeSpawn = zoneData ? zoneData.defaultSpawn : { x: 560, y: 260 };
        this.player.setPosition(safeSpawn.x, safeSpawn.y);
        this.player.setVelocity(0, 0);
        this.transitionCooldown = 1200;
        if (this.uiScene) {
          this.uiScene.showPopupMessage(`🔒 ${evalResult.reason} ${evalResult.hint || ''}`);
        }
        return;
      }

      // C4-13-20: Màn sương chuyển cảnh mượt mà (Mist Fade Transition 0.35s) khi chuyển phân khu
      if (this.veilSystem) {
        this.veilSystem.triggerZoneTransitionMist(350);
      }

      // C4-13-20: Tự động đặt trạng thái ngủ đông cho các đối tượng phân khu xa
      this.worldBuilder.hibernateDistantZoneObjects(detectedZone);
      this.transitionCooldown = 1000;
      this.transitionCooldownUntil = performance.now() + 1000;
    }

    this.currentZoneId = detectedZone;
    this.playerState.setCurrentZone(this.currentZoneId);

    // C4-12-03: Kiểm tra bước qua Cổng Đông làng Bellhollow (gateX = 1485, khi x >= 1500)
    if (this.currentZoneId === 'bellhollow' && footPos.x >= 1500 && this.playerState.isEastGateUnlocked()) {
      const q04 = this.playerState.quests.get('Q04_ANCIENT_RUNES');
      const t1 = q04?.tasks.find(t => t.id === 't1');
      if (t1 && !t1.done) {
        this.playerState.completeQuestTask('Q04_ANCIENT_RUNES', 't1');
        if (this.uiScene) {
          this.uiScene.showPopupMessage('✔ Nhiệm vụ: Đã bước qua Cổng Đông của làng Bellhollow!');
        }
      }
    }

    if (this.currentZoneId === 'crooked_path') {
      if (this.playerState.isEastGateUnlocked()) {
        this.playerState.completeQuestTask('Q04_ANCIENT_RUNES', 't1');
      }
    } else if (this.currentZoneId === 'silent_mire') {
      this.playerState.completeQuestTask('Q04_ANCIENT_RUNES', 't1');
      this.playerState.completeQuestTask('Q04_ANCIENT_RUNES', 't2');
      if (this.playerState.currentQuestId === 'Q04_ANCIENT_RUNES') {
        this.playerState.setCurrentQuest('Q05_SOLVE_MIRE');
      }
    }

    if (this.currentZoneId !== this.previousZoneId) {
      // Điều chỉnh lộ trình tuần tra của The Listener khi chuyển giữa các phân khu rừng Frontier
      if (this.listenerMonster && this.currentZoneId === 'deep_forest' && this.previousZoneId !== 'deep_forest') {
        const dfWaypoints = [
          { x: 2080, y: -140 },
          { x: 1820, y: -230 },
          { x: 2160, y: -320 },
          { x: 2380, y: -480 },
          { x: 2620, y: -280 }
        ];
        this.listenerMonster.ai.setWaypoints(dfWaypoints);
        if (this.listenerMonster.y >= 0) {
          this.listenerMonster.setPosition(2380, -480);
          this.listenerMonster.setVelocity(0, 0);
        }
      } else if (this.listenerMonster && this.currentZoneId === 'crooked_path' && this.previousZoneId === 'deep_forest') {
        const cpWaypoints = [
          { x: 1950, y: 220 },
          { x: 2280, y: 380 },
          { x: 2600, y: 240 },
          { x: 2350, y: 160 }
        ];
        this.listenerMonster.ai.setWaypoints(cpWaypoints);
        if (this.listenerMonster.y < 0) {
          this.listenerMonster.setPosition(2280, 380);
          this.listenerMonster.setVelocity(0, 0);
        }
      }

      this.previousZoneId = this.currentZoneId;
      if (this.wildlifeSystem) {
        this.wildlifeSystem.switchZone(this.currentZoneId);
      }

      // C4-12-22 & C4-12-27: Tự động mở rộng giới hạn thế giới và góc nhìn camera khi tiến vào Rừng Sâu
      this.applyCameraBoundsForZone(this.currentZoneId);

      // C4-12-15: Chuyển đổi nhạc nền êm ái theo vùng mới (Crossfade không chồng lặp)
      this.audioManager.setAmbienceZone(this.currentZoneId);
      // C4-12-10: Ghi nhận phân khu đã khám phá vào PlayerState
      this.playerState.markZoneVisited(this.currentZoneId);

      const zoneData = this.worldBuilder.getActiveZone();
      // C4-13-19: Khống chế thời gian chờ (cooldown 4 giây) và chống lặp zone cho bảng thông báo tên phân khu
      const now = performance.now();
      const isCooldownElapsed = now - this.lastZoneBannerTime >= 4000;
      const isDifferentBannerZone = this.currentZoneId !== this.lastBannerZoneId;

      if (zoneData && this.uiScene && isCooldownElapsed && isDifferentBannerZone) {
        this.lastZoneBannerTime = now;
        this.lastBannerZoneId = this.currentZoneId;
        this.uiScene.showZoneBanner(zoneData.atmosphere);
        this.cameraSystem.shake(150, 0.003);
      }

      // Auto-save checkpoint khi chuyển zone (nếu không đang trong cuộc rượt đuổi)
      if (!this.isAct5ChaseActive) {
        const title = zoneData?.atmosphere.titleVietnamese || this.currentZoneId;
        SaveManager.saveGame(`KHU VỰC: ${title}`, this.currentZoneId, this.player.x, this.player.y);
      }
    }
  }

  /**
   * C4-12-15: Xác định chất liệu bề mặt dưới chân người chơi để phát âm bước chân sống động
   */
  private detectCurrentTerrain(zoneId: ZoneId, x: number, y: number): TerrainType {
    if (zoneId === 'silent_mire') {
      // Ván gỗ lát trên đầm lầy
      if (y >= 470 && y <= 535) return 'wood';
      return 'mud';
    }
    if (zoneId === 'drowned_mire_depths') {
      // Cầu ván gỗ mục nát đầm lầy chìm
      if (x >= 3340 && x <= 3460) return 'wood';
      return 'mud';
    }
    if (zoneId === 'broken_bell_shrine' || zoneId === 'ancient_rune_puzzle' || zoneId === 'sunken_crypt_ruins' || zoneId === 'veil_origin_cavern') {
      if (zoneId === 'broken_bell_shrine' && (x < 800 || x > 1120 || y < 320 || y > 500)) return 'dirt';
      return 'stone';
    }
    if (zoneId === 'sub_root_cellar' || zoneId === 'sub_bell_workshop') {
      return 'wood';
    }
    if (zoneId === 'bellhollow') {
      // Đá lát quảng trường trung tâm, quanh giếng làng và chân tháp chuông
      if (x >= 640 && x <= 1040 && y >= 250 && y <= 450) {
        return 'stone';
      }
      // Các thềm gỗ / hiên nhà
      if (y <= 240 && ((x >= 660 && x <= 750) || (x >= 930 && x <= 1020))) {
        return 'wood';
      }
      // Vùng thảm cỏ ven vườn / rào làng
      if (y >= 520 || x <= 500) {
        return 'grass';
      }
      return 'dirt';
    }
    if (zoneId === 'crooked_path' || zoneId === 'outer_woods' || zoneId === 'deep_forest' || zoneId === 'abyssal_chasm') {
      return 'dirt';
    }
    return 'grass';
  }

  private handleInteractions(delta: number = 16): void {
    // PASS T13, T15, T16 & C4-13-11: Khi hộp thoại đang mở hoặc Modal (Chế tạo, Sổ tay, Tạm dừng) mở, BẮT BUỘC ẩn ngay lập tức nhãn gợi ý và nhãn NPC
    if (
      this.dialogueSystem.isActive ||
      this.craftingModal.isOpen ||
      this.journalModal.isOpen ||
      this.pauseModal.isOpen ||
      (this.uiScene && this.uiScene.isAnyModalOpen) ||
      this.isGameplayInputLocked()
    ) {
      if (this.uiScene) {
        this.uiScene.setInteractionPrompt(null);
      }
      this.clearInteractionOutline();
      for (const npc of this.npcs) {
        npc.setNearby(false);
      }
      return;
    }

    // C4-13-01: Ưu tiên tối thượng cho trạng thái ẩn nấp (Hiding & Stealth Stance)
    // Khi đang núp, người chơi bấm [E] hoặc phím di chuyển WASD/Mũi tên (sau 0.3s) sẽ thoát ra ngay lập tức
    if (this.player.stats.isHiding) {
      this.clearInteractionOutline();
      if (this.uiScene) {
        this.uiScene.setInteractionPrompt('[E] / [WASD] Bước ra khỏi chỗ trốn', this.player.x, this.player.y - 36);
      }
      for (const npc of this.npcs) {
        npc.setNearby(false);
      }
      const timeInHiding = Date.now() - this.player.hidingTimestamp;
      const isExitRequested = this.player.isInteractRequested() || (timeInHiding >= 300 && this.player.hasMovementInput());
      if (isExitRequested) {
        this.executeMapInteraction('hide_player', 'chỗ trốn');
      }
      return;
    }

    const px = this.player.x;
    const py = this.player.y;

    // C4-132-02: Ghi nhận thời điểm bấm [E] với bộ đệm (input buffer) 150ms để vừa chạy tới vừa bấm là kích hoạt ngay
    if (this.player.isInteractRequested()) {
      this.lastEKeyPressTime = Date.now();
    }
    const isEBuffered = (Date.now() - this.lastEKeyPressTime) <= 150;

    interface InteractionCandidate {
      dist: number;
      triggerDist: number;
      promptText: string;
      x: number;
      y: number;
      promptX?: number;
      promptY?: number;
      width?: number;
      height?: number;
      proximityAlpha: number;
      action: () => void;
    }

    const candidates: InteractionCandidate[] = [];

    // 1. Kiểm tra NPC gần (triggerDist: 52px, quét gợi ý: 65px)
    for (const npc of this.npcs) {
      npc.update(delta);
      const dist = Math.hypot(px - npc.x, py - npc.y);
      const isNear = dist <= 65;
      npc.setNearby(isNear, px, py, dist);
      if (isNear) {
        const triggerDist = 52;
        const isWithinInteractRange = dist <= triggerDist;
        const proximityAlpha = isWithinInteractRange ? 0.9 : 0.35; // proximityAlpha = isWithinInteractRange ? 1.0 : 0.45;
        const baseName = `Trò chuyện với ${npc.spec.name} (${npc.spec.title})`;
        const promptText = isWithinInteractRange ? `[E] ${baseName}` : baseName;
        candidates.push({
          dist,
          triggerDist,
          promptText,
          x: npc.x,
          y: npc.y - 16,
          promptX: npc.x,
          promptY: npc.y - 48,
          width: 24,
          height: 34,
          proximityAlpha,
          action: () => {
            this.player.playInteract();
            let dKey = npc.spec.dialogueKey;
            if (npc.spec.id === 'npc_garth') {
              if (this.playerState.hasFlag('inspected_echo_pillar') && !this.playerState.hasFlag('garth_patrol_rewarded')) {
                dKey = 'garth_quest_clearing_patrol';
                this.playerState.setFlag('garth_patrol_rewarded');
                this.playerState.addItem('eqp_trail_boots', 1);
                this.playerState.completeQuestTask('SQ04_CLEARING_PATROL', 't3');
                if (this.uiScene) {
                  this.uiScene.showPopupMessage('🎁 Garth đã tặng bạn: Ủng Đi Rừng (Trail Boots)! Giảm 30% tiếng ồn bước chân.');
                }
              } else if (this.playerState.memoryAwakeningStage >= 3) {
                dKey = 'garth_black_knight_reverence';
              } else if (!this.playerState.hasFlag('talked_to_villagers')) {
                dKey = 'garth_warning';
              } else if (!this.playerState.hasFlag('talked_to_edda')) {
                dKey = 'garth_reminder_edda';
              } else if (!this.playerState.isEastGateUnlocked()) {
                dKey = 'garth_reminder_gate_locked';
              } else {
                dKey = 'garth_east_gate_open';
              }
            } else if (npc.spec.id === 'npc_edda') {
              if (this.playerState.hasFlag('has_bell_mold') && !this.playerState.hasFlag('edda_mold_rewarded')) {
                dKey = 'edda_quest_bell_memory';
                this.playerState.setFlag('edda_mold_rewarded');
                this.playerState.completeQuestTask('SQ02_BELL_MEMORY', 't2');
              } else if (this.playerState.memoryAwakeningStage >= 3) {
                dKey = 'edda_black_knight_reverence';
              } else if (!this.playerState.hasFlag('talked_to_edda')) {
                dKey = 'edda_intro';
              } else if (!this.playerState.isEastGateUnlocked()) {
                dKey = 'edda_reminder_locked';
              } else {
                dKey = 'edda_reminder_open';
              }
            } else if (npc.spec.id === 'npc_neris') {
              // C4-132-05: Kích hoạt cơ chế cứu trợ hạt giống khi trò chuyện với Neris
              if (this.farmingSystem) {
                this.farmingSystem.checkAndGrantEmergencySeeds((msg) => {
                  if (this.uiScene) this.uiScene.showPopupMessage(msg);
                });
              }
              if (this.playerState.hasFlag('has_rare_roots') && !this.playerState.hasFlag('neris_tea_rewarded')) {
                dKey = 'neris_quest_cellar_tea';
                this.playerState.setFlag('neris_tea_rewarded');
                this.playerState.completeQuestTask('SQ03_CELLAR_TEA', 't3');
              } else if (this.playerState.memoryAwakeningStage >= 3) {
                dKey = 'neris_black_knight_reverence';
              } else if (!this.playerState.hasFlag('talked_to_neris')) {
                dKey = 'neris_intro';
              } else if (!this.playerState.isEastGateUnlocked()) {
                dKey = 'neris_heal_locked';
              } else {
                dKey = 'neris_heal_open';
              }
            } else if (npc.spec.id === 'npc_bram') {
              if (this.playerState.hasFlag('has_runed_iron_part') && !this.playerState.hasFlag('bram_iron_rewarded')) {
                dKey = 'bram_quest_runed_iron';
                this.playerState.setFlag('bram_iron_rewarded');
                this.playerState.completeQuestTask('SQ01_RUNED_IRON', 't2');
              } else if (this.playerState.memoryAwakeningStage >= 3) {
                dKey = 'bram_black_knight_reverence';
              } else {
                dKey = 'bram_chat';
              }
            } else if (npc.spec.id === 'npc_finn') {
              if (this.playerState.memoryAwakeningStage >= 3) {
                dKey = 'finn_black_knight_reverence';
              } else {
                dKey = 'finn_rumors';
              }
              this.playerState.completeQuestTask('SQ05_FINN_INTEL', 't1');
            } else if (npc.spec.id === 'npc_campfire_knight') {
              CampSanctuarySystem.getInstance().onDialogueStart(this.player.x);
              if (this.playerState.hasFlag('campfire_knight_q3_completed')) {
                dKey = 'campfire_knight_idle_talk';
              } else if (this.playerState.hasFlag('campfire_knight_q3_accepted')) {
                const hasCorruptedCrest = (this.playerState.getItemCount('quest_corrupted_knight_crest') > 0 ||
                                           this.playerState.getItemCount('quest_corrupted_crest') > 0 ||
                                           this.playerState.hasFlag('boss_hooded_knight_defeated'));
                if (hasCorruptedCrest) {
                  dKey = 'campfire_knight_q3_complete';
                  this.playerState.completeQuestTask('SQ08_PURIFY_FALLEN', 't1');
                  this.playerState.completeQuestTask('SQ08_PURIFY_FALLEN', 't2');
                  this.playerState.completeQuestTask('SQ08_PURIFY_FALLEN', 't3');
                  this.playerState.setFlag('campfire_knight_q3_completed');

                  // V14-P8-15B: Nâng tiến trình Thức Tỉnh Ký Ức lên Giai đoạn 3 (Chân tướng Hiệp Sĩ Đen)
                  this.playerState.setMemoryAwakeningStage(3);
                  this.events.emit('memory_awakening_stage_changed', 3);
                  this.events.emit('memory_awakening_completed');
                  if (this.uiScene) {
                    this.uiScene.redrawStats();
                    this.uiScene.showPopupMessage('⚔️ THỨC TỈNH KÝ ỨC: Bạn chính là Chỉ Huy Hiệp Sĩ Đen (The Black Knight)!');
                  }
                } else {
                  dKey = 'campfire_knight_q3_reminder';
                }
              } else if (this.playerState.hasFlag('campfire_knight_q2_accepted')) {
                const hasRunedIron = (this.playerState.getItemCount('mat_runed_iron') > 0 ||
                                      this.playerState.getItemCount('item_knight_journal_page') > 0 ||
                                      this.playerState.hasFlag('has_runed_iron_part') ||
                                      this.playerState.hasFlag('workshop_visited'));
                if (hasRunedIron) {
                  dKey = 'campfire_knight_q2_complete';
                  this.playerState.completeQuestTask('SQ07_LOST_COMRADES', 't1');
                  this.playerState.completeQuestTask('SQ07_LOST_COMRADES', 't2');
                  this.playerState.completeQuestTask('SQ07_LOST_COMRADES', 't3');
                  this.playerState.setFlag('campfire_knight_q2_completed');
                  if (this.uiScene) {
                    this.uiScene.showPopupMessage('📜 Hiệp Sĩ Canh Lửa đã nhận lại kỷ vật đồng đội và mở khóa Nhiệm Vụ 3!');
                  }
                } else {
                  dKey = 'campfire_knight_q2_reminder';
                }
              } else if (this.playerState.hasFlag('campfire_knight_q1_accepted')) {
                const hasWoodAndResin = (this.playerState.getItemCount('res_dry_wood') >= 2 && this.playerState.getItemCount('res_tree_resin') >= 2) ||
                                        (this.playerState.campfireLevel >= 2) ||
                                        this.playerState.hasFlag('outer_woods_scouted');
                if (hasWoodAndResin) {
                  dKey = 'campfire_knight_q1_complete';
                  this.playerState.completeQuestTask('SQ06_KEEP_FIRE', 't1');
                  this.playerState.completeQuestTask('SQ06_KEEP_FIRE', 't2');
                  this.playerState.completeQuestTask('SQ06_KEEP_FIRE', 't3');
                  this.playerState.setFlag('campfire_knight_q1_completed');
                  if (this.playerState.memoryAwakeningStage < 1) {
                    this.playerState.memoryAwakeningStage = 1;
                    this.playerState.unlockLore('lore_black_knight_chronicle');
                  }
                  if (this.playerState.campfireLevel < 2) {
                    this.playerState.campfireLevel = 2;
                  }
                  if (this.uiScene) {
                    this.uiScene.showPopupMessage('🔥 Hoàn thành: Giữ Lửa Trong Sương! Lửa Trại nâng lên Cấp 2.');
                  }
                } else {
                  dKey = 'campfire_knight_q1_reminder';
                }
              } else {
                dKey = 'campfire_knight_intro';
                this.playerState.setFlag('talked_to_campfire_knight');
              }
            }
            this.audioManager.playInteract();
            this.dialogueSystem.startDialogue(dKey);
          }
        });
      }
    }

    // 2. Kiểm tra mỏ tài nguyên gần (triggerDist: 50px, quét gợi ý: 65px)
    const nearbyResource = this.inventorySystem.getNearbyAvailableNode(px, py, 65);
    if (nearbyResource) {
      const resDist = Math.hypot(px - nearbyResource.x, py - nearbyResource.y);
      const resTriggerDist = 50;
      const isWithinHarvestRange = resDist <= resTriggerDist;
      const proximityAlpha = isWithinHarvestRange ? 0.9 : 0.35; // isWithinHarvestRange ? 1.0 : 0.45
      const baseName = `Thu thập ${nearbyResource.itemName} (x${nearbyResource.count})`;
      const promptText = isWithinHarvestRange ? `[E] ${baseName}` : baseName;
      candidates.push({
        dist: resDist,
        triggerDist: resTriggerDist,
        promptText,
        x: nearbyResource.x,
        y: nearbyResource.y,
        promptX: nearbyResource.x,
        promptY: nearbyResource.y - 20,
        width: 22,
        height: 22,
        proximityAlpha,
        action: () => {
          const wasQ03T1Done =
            this.playerState.quests.get('Q03_PREPARE_RESOURCES')?.tasks.find(t => t.id === 't1')?.done ?? false;
          const harvestResult = this.inventorySystem.checkHarvestNearby(
            px,
            py,
            resTriggerDist
          );
          const nowQ03T1Done =
            this.playerState.quests.get('Q03_PREPARE_RESOURCES')?.tasks.find(t => t.id === 't1')?.done ?? false;

          if (harvestResult && this.uiScene) {
            this.audioManager.playResourceGather(harvestResult.itemId);
            this.player.playGather();
            this.uiScene.setInteractionPrompt(null);
            const milestoneJustFired =
              !wasQ03T1Done && nowQ03T1Done && this.playerState.currentQuestId === 'Q03_PREPARE_RESOURCES';
            if (!milestoneJustFired) {
              this.uiScene.showPopupMessage(`✔ Đã thu thập: +${harvestResult.count} ${harvestResult.itemName}`);
            }
          }
        }
      });
    }

    // 2.5. Kiểm tra các ô đất trồng thảo dược tại Sanctuary Farm (triggerDist: 52px, quét gợi ý: 65px)
    if (this.currentZoneId === 'bellhollow' || this.currentZoneId === 'sanctuary_farm') {
      const nearbyPlot = this.farmingSystem.checkNearbyPlot(px, py, 65);
      if (nearbyPlot) {
        const plotDist = Math.hypot(px - nearbyPlot.x, py - nearbyPlot.y);
        const plotTriggerDist = 52;
        const isWithinPlotRange = plotDist <= plotTriggerDist;

        // C4-132-05: Kiểm tra cơ chế cứu trợ hạt giống khi người chơi đứng tại khu vực ô đất trồng ở Sanctuary Farm
        if (this.currentZoneId === 'sanctuary_farm' && isWithinPlotRange) {
          this.farmingSystem.checkAndGrantEmergencySeeds((msg) => {
            if (this.uiScene) this.uiScene.showPopupMessage(msg);
          });
        }

        const rawPrompt = this.farmingSystem.getPlotPrompt(nearbyPlot);
        const basePlotName = rawPrompt.replace(/^\[E\]\s*/, '');
        const promptText = isWithinPlotRange ? `[E] ${basePlotName}` : basePlotName;
        candidates.push({
          dist: plotDist,
          triggerDist: plotTriggerDist,
          promptText,
          x: nearbyPlot.x,
          y: nearbyPlot.y,
          proximityAlpha: isWithinPlotRange ? 0.9 : 0.35,
          action: () => {
            this.player.playGather();
            this.farmingSystem.interactWithPlot(nearbyPlot.id, (feedbackMsg: string) => {
              if (this.uiScene) {
                this.uiScene.showPopupMessage(feedbackMsg);
              }
            });
          }
        });
      }
    }

    // 3. Kiểm tra các vật thể, Bàn Chế Tạo và câu đố trên bản đồ (triggerDist: 52px, quét gợi ý: 65px)
    const nearbyProximity = this.worldBuilder.checkInteractableProximity(this.player.getFootPosition(), 65);
    if (nearbyProximity) {
      const { item: nearby, dist } = nearbyProximity;
      const worldTriggerDist = 52;
      const isWithinActionRange = dist <= worldTriggerDist;
      const rawPrompt = nearby.promptText;
      // V14-P8-01: Loại bỏ triệt để tiền tố lặp từ như "[E] Nhấn [E] ..." thành chuẩn gọn "[E] <Hành động>"
      const baseWorldName = rawPrompt
        .replace(/^(nhấn\s+)?\[e\]\s*/i, '')
        .replace(/^(nhấn\s+)?\[e\]\s*/i, '')
        .replace(/^nhấn\s+/i, '')
        .trim();
      const cleanPrompt = baseWorldName.charAt(0).toUpperCase() + baseWorldName.slice(1);
      const promptText = isWithinActionRange ? `[E] ${cleanPrompt}` : cleanPrompt;
      // Tính toán tâm chính xác của vật thể tương tác để vẽ khung viền bao quanh đúng vị trí
      const propW = nearby.width || 28;
      const propH = nearby.height || 24;
      const propCenterX = nearby.x + propW / 2;
      const propCenterY = nearby.y + propH / 2;

      candidates.push({
        dist,
        triggerDist: worldTriggerDist,
        promptText,
        x: propCenterX,
        y: propCenterY,
        promptX: propCenterX,
        promptY: nearby.y - 14,
        width: propW,
        height: propH,
        proximityAlpha: isWithinActionRange ? 0.9 : 0.35,
        action: () => {
          this.executeMapInteraction(nearby.actionId, nearby.name);
        }
      });
    }

    // V1.4 - P6: Tương tác với Kẻ Nuốt Tiếng Chuông (Mire Warden Boss) trong trận đấu trùm
    if (this.isBossFightActive && this.mireWardenBoss) {
      if (this.mireWardenBoss.isStaggered) {
        const distBoss = Math.hypot(px - this.mireWardenBoss.x, py - this.mireWardenBoss.y);
        if (distBoss <= 85) {
          candidates.push({
            dist: distBoss,
            triggerDist: 70,
            promptText: '[E] KÍCH HOẠT ẤN PHONG ẤN!',
            x: this.mireWardenBoss.x,
            y: this.mireWardenBoss.y,
            width: 64,
            height: 64,
            proximityAlpha: distBoss <= 70 ? 1.0 : 0.5,
            action: () => {
              this.handleBossSealInteraction();
            }
          });
        }
      }

      // Pha 2: Thắp sáng các Đài Cổ Ngữ
      if (this.mireWardenBoss.phase === 2) {
        for (const b of this.brazierTargets) {
          if (!b.isLit) {
            const distB = Math.hypot(px - b.x, py - b.y);
            if (distB <= 65) {
              const isLanternOn = this.playerState.stats.isLanternOn;
              candidates.push({
                dist: distB,
                triggerDist: 52,
                promptText: isLanternOn ? '[E] Thắp sáng Đài Cổ Ngữ (Đèn Lồng [F])' : '[E] Thắp sáng Đài Cổ Ngữ (Cần bật Đèn Lồng [F])',
                x: b.x,
                y: b.y,
                width: 32,
                height: 32,
                proximityAlpha: distB <= 52 ? 1.0 : 0.5,
                action: () => {
                  this.handleRelightBrazier(b);
                }
              });
            }
          }
        }

        // Nếu cả 3 đài đã sáng và Boss đang choáng ở Tế Đàn Trung Tâm
        const allLit = this.brazierTargets.length > 0 && this.brazierTargets.every(b => b.isLit);
        if (allLit && this.mireWardenBoss.isStaggered) {
          const distAltar = Math.hypot(px - 4500, py - 250);
          if (distAltar <= 85) {
            candidates.push({
              dist: distAltar,
              triggerDist: 70,
              promptText: '[E] HOÀN TẤT KHÓA ẤN MẠCH RỄ TỐI HẬU!',
              x: 4500,
              y: 250,
              width: 80,
              height: 50,
              proximityAlpha: distAltar <= 70 ? 1.0 : 0.6,
              action: () => {
                this.handleBossFinalSeal();
              }
            });
          }
        }
      }
    }

    // C4-13-11: Chọn duy nhất ứng viên có khoảng cách gần người chơi nhất (Nearest-Neighbor Candidate)
    if (candidates.length === 0) {
      if (this.uiScene) {
        this.uiScene.setInteractionPrompt(null);
      }
      this.clearInteractionOutline();
      return;
    }

    candidates.sort((a, b) => a.dist - b.dist);
    const best = candidates[0];
    const isWithinActionRange = best.dist <= best.triggerDist;

    if (this.uiScene) {
      this.uiScene.setInteractionPrompt(best.promptText, best.promptX ?? best.x, best.promptY ?? best.y, best.proximityAlpha);
    }
    this.renderInteractionOutline(best);

    if (isWithinActionRange && isEBuffered && !this.dialogueSystem.isActive) {
      this.lastEKeyPressTime = 0;
      best.action();
    }
  }

  public renderInteractionOutline(target: { x: number; y: number; width?: number; height?: number }): void {
    if (!this.interactionOutlineGfx) return;
    this.interactionOutlineGfx.clear();
    const w = target.width || 36;
    const h = target.height || 36;
    const left = target.x - w / 2;
    const top = target.y - h / 2;

    const time = this.time ? this.time.now : Date.now();
    const pulseAlpha = 0.75 + 0.18 * Math.sin(time * 0.005);

    // Đường viền trắng kem cổ điển 0xfaf8ef nét mảnh 1.5px
    this.interactionOutlineGfx.lineStyle(1.5, 0xfaf8ef, pulseAlpha);
    this.interactionOutlineGfx.strokeRoundedRect(left - 2, top - 2, w + 4, h + 4, 4);

    // Góc nhọn đính kèm
    this.interactionOutlineGfx.lineStyle(2, 0xffffff, Math.min(1.0, pulseAlpha + 0.15));
    const cornerSize = Math.min(6, Math.floor(w / 4));
    this.interactionOutlineGfx.lineBetween(left - 2, top - 2, left - 2 + cornerSize, top - 2);
    this.interactionOutlineGfx.lineBetween(left - 2, top - 2, left - 2, top - 2 + cornerSize);
    this.interactionOutlineGfx.lineBetween(left + w + 2 - cornerSize, top - 2, left + w + 2, top - 2);
    this.interactionOutlineGfx.lineBetween(left + w + 2, top - 2, left + w + 2, top - 2 + cornerSize);
    this.interactionOutlineGfx.lineBetween(left - 2, top + h + 2 - cornerSize, left - 2, top + h + 2);
    this.interactionOutlineGfx.lineBetween(left - 2, top + h + 2, left - 2 + cornerSize, top + h + 2);
    this.interactionOutlineGfx.lineBetween(left + w + 2 - cornerSize, top + h + 2, left + w + 2, top + h + 2);
    this.interactionOutlineGfx.lineBetween(left + w + 2, top + h + 2 - cornerSize, left + w + 2, top + h + 2);
  }

  public clearInteractionOutline(): void {
    if (this.interactionOutlineGfx) {
      this.interactionOutlineGfx.clear();
    }
  }

  public triggerInteractionFromUI(): void {
    this.lastEKeyPressTime = Date.now();
  }

  private executeMapInteraction(actionId: string, name: string): void {
    this.audioManager.playInteract();
    if (actionId === 'collect_bell_tongue') {
      this.player.playGather();
    } else if (actionId !== 'hide_player') {
      this.player.playInteract();
    }

    // C4-14-B04: Juice & Game Feel - Rung nhẹ camera và hiệu ứng hạt xúc giác nảy ra
    let burstColor = 0xf39c12;
    if (actionId.includes('wood')) burstColor = 0x8e5830;
    else if (actionId.includes('resin')) burstColor = 0xf59e0b;
    else if (actionId.includes('herb')) burstColor = 0x48bb78;
    else if (actionId.includes('flint') || actionId.includes('stone') || actionId.includes('rock')) burstColor = 0xbdc3c7;
    else if (actionId.includes('journal') || actionId.includes('clue') || actionId.includes('sign')) burstColor = 0xfdebd0;
    this.createResourcePopEffect(this.player.x, this.player.y, burstColor, 6);

    // C4-14-B04: Điểm hút mở đầu - Mẩu Nhật Ký Rách #1 tại Fog Crossing
    if (actionId === 'inspect_fog_journal_1') {
      this.playerState.unlockLore('lore_fog_journal_1');
      if (this.uiScene) {
        this.uiScene.showPopupMessage('📜 [NHẬT KÝ RÁCH]: "Màn sương nuốt chửng lối về. Hãy đi theo tiếng chuông và ánh đèn bão phía Đông. Đừng tắt đèn lồng quá lâu..."');
      }
      return;
    }

    // V1.4 Blueprint: Bảng Tin Dị Thường (The Anomaly Notice Board) tại Bellhollow
    if (actionId === 'read_bellhollow_notice_board') {
      if (this.uiScene) {
        this.uiScene.showPopupMessage('📜 [BẢNG TIN DỊ THƯỜNG]:\n• Tây Bắc: Khói đen tắt tại Trạm Kiểm Lâm Rừng Ngoài. Dầu đèn dự trữ vẫn còn.\n• Đông Nam: Tiếng chuông chìm đáy Đầm Lầy Sương Mù. Cần người vượt cầu ván khảo sát.\n• Đông Bắc: Cột Vật Tổ Thì Thầm cảnh báo quái vật rình rập ở Rừng Sâu.');
      }
      return;
    }

    // V1.4 Blueprint: Khảo sát Trạm Kiểm Lâm Bỏ Hoang tại Rừng Ngoài
    if (actionId === 'inspect_ranger_outpost') {
      if (this.uiScene) {
        this.uiScene.showPopupMessage('🏚️ [TRẠM KIỂM LÂM BỎ HOANG]: Vết cào sâu trên vách gỗ mục. Mùi tro lạnh và nhựa thông... Người kiểm lâm đã vội vã tháo chạy vào rừng.');
      }
      return;
    }

    // V1.4 Blueprint: Rương Tiếp Tế Kiểm Lâm
    if (actionId === 'open_ranger_outpost_chest') {
      if (!this.playerState.hasFlag('opened_ranger_chest')) {
        this.playerState.setFlag('opened_ranger_chest');
        this.playerState.addItem('flint', 3);
        this.playerState.addItem('dry_wood', 5);
        this.playerState.stats.lanternOil = Math.min(this.playerState.stats.maxLanternOil, this.playerState.stats.lanternOil + 60);
        if (this.uiScene) {
          this.uiScene.showPopupMessage('🎁 Rương Kiểm Lâm: Nhận Dầu Đèn (+60s), 3 Đá Lửa và 5 Cành Gỗ Sồi Khô!');
        }
      } else {
        if (this.uiScene) {
          this.uiScene.showPopupMessage('📦 Rương trống không. Tài nguyên kiểm lâm đã được thu thập.');
        }
      }
      return;
    }

    // V1.4 Blueprint: Cột Vật Tổ Thì Thầm tại Rừng Sâu
    if (actionId === 'listen_whispering_totem') {
      if (this.uiScene) {
        this.uiScene.showPopupMessage('🗿 [VẬT TỔ THÌ THẦM]: "Tiếng gió rít qua hốc đá... Tiếng bước chân rón rén của Kẻ Lắng Nghe và Goblin phục kích. Hãy giữ vững ánh đèn lồng [F]!"');
      }
      return;
    }

    // V1.4 Blueprint: Miếu Thờ Chìm tại Đầm Lầy Sương Mù
    if (actionId === 'inspect_sunken_mire_shrine') {
      if (this.uiScene) {
        this.uiScene.showPopupMessage('🏛️ [MIẾU THỜ CHÌM]: Bệ đá cổ ngập trong làn nước lầy rêu phong. Nơi phong ấn và cất giữ Cổ Vật Chuông Đồng Chìm.');
      }
      return;
    }

    // V1.4 Blueprint: Thu nhận Cổ Vật Chuông Đồng Chìm
    if (actionId === 'collect_sunken_talisman') {
      if (!this.playerState.hasFlag('has_sunken_bell_talisman')) {
        this.playerState.setFlag('has_sunken_bell_talisman');
        this.playerState.addItem('art_sunken_bell_talisman', 1);
        if (this.uiScene) {
          this.uiScene.showPopupMessage('🔔 [CỔ VẬT THU ĐƯỢC]: Bạn nhận được CHUÔNG ĐỒNG CHÌM! Chuông cổ giúp giải trừ sương độc dẫn vào Hầm Mộ Phế Tích phía Bắc!');
        }
      } else {
        if (this.uiScene) {
          this.uiScene.showPopupMessage('Bệ đá đã trống. Quả chuông đồng chìm đã nằm trong hành trang của bạn.');
        }
      }
      return;
    }

    // V1.4 Blueprint: Kích hoạt & Khảo sát Cầu Thân Cây Đổ (Metroidvania-lite Shortcut)
    if (actionId === 'activate_titan_trunk_shortcut') {
      this.playerState.setFlag('titan_trunk_shortcut_unlocked');
      if (this.uiScene) {
        this.uiScene.showPopupMessage('🪵 [MỞ ĐƯỜNG TẮT]: Bạn đã gạt chốt gỗ đẩy đổ Thân Cây Cổ Thụ bắc qua khe vực! Lối tắt nối liền Đầm Lầy và Rừng Ngoài đã mở thông suốt!');
      }
      return;
    }
    if (actionId === 'inspect_titan_trunk_shortcut_outer') {
      const isUnlocked = this.playerState.hasFlag('titan_trunk_shortcut_unlocked');
      if (this.uiScene) {
        this.uiScene.showPopupMessage(isUnlocked
          ? '🪵 Cầu Thân Cây Đổ đã mở thông suốt sang Đầm Lầy Sương Mù (Tuyến đường tắt an toàn rút ngắn thời gian về làng).'
          : '🔒 Thân cây cổ thụ bên kia bờ vực bị xích chặt. Phải mở khóa từ bờ phía Đầm Lầy Sương Mù.');
      }
      return;
    }

    if (actionId === 'open_crafting_bench') {
      if (this.uiScene) {
        this.uiScene.openCraftingBench();
      }
      return;
    }

    if (actionId === 'read_fog_sign') {
      if (this.uiScene) {
        this.uiScene.showPopupMessage('📜 Biển Đá Mòn: "HƯỚNG ĐÔNG — Làng Chuông Bellhollow. Giữ ngọn đèn luôn cháy."');
      }
      return;
    }

    // C4-13-16: Tương tác kiểm tra rào chắn sương mù phía Tây đầu game (fog_crossing)
    if (actionId === 'inspect_west_barrier') {
      this.triggerWestBarrierThought(true);
      return;
    }

    // V14-P8-13: Khảo sát chướng ngại vật Cầu Đá Cổ Bị Sập chặn lối thẳng tới Tháp Chuông
    if (actionId === 'inspect_collapsed_bridge') {
      this.triggerCollapsedBridgeThought(true);
      return;
    }

    // V14-P8-13: Đọc Biển Chỉ Đường Tuyến Vòng (Winding Detour Sign)
    if (actionId === 'read_detour_sign') {
      if (this.uiScene) {
        this.uiScene.showPopupMessage('📜 Biển Chỉ Đường: "◄ Hướng Bắc: Bìa Rừng Sâu & Xưởng Chuông | Lối Vòng Đầm Lầy & Tháp Chuông: Phía Đông Nam ►"');
      }
      return;
    }

    // V14-P8-13: Thu thập nguyên liệu sinh tồn dọc tuyến đường vòng (Gỗ Khô, Nhựa Thông, Thảo Dược)
    if (actionId === 'gather_wood_ow_1' || actionId === 'gather_wood_cp_1') {
      const flag = `gathered_${actionId}`;
      if (this.playerState.hasFlag(flag)) {
        this.uiScene?.showPopupMessage('Cành gỗ này đã được nhặt hết.');
      } else {
        this.playerState.setFlag(flag);
        this.playerState.addItem('res_dry_wood', 2);
        this.audioManager?.playInteract();
        this.uiScene?.showPopupMessage('🪵 Thu nhặt được 2 Gỗ Khô từ cành cây ven đường vòng.');
      }
      return;
    }

    if (actionId === 'gather_resin_ow_1' || actionId === 'gather_resin_cp_1') {
      const flag = `gathered_${actionId}`;
      if (this.playerState.hasFlag(flag)) {
        this.uiScene?.showPopupMessage('Vết nứt trên thân cây đã cạn nhựa.');
      } else {
        this.playerState.setFlag(flag);
        this.playerState.addItem('res_tree_resin', 2);
        this.audioManager?.playInteract();
        this.uiScene?.showPopupMessage('🍯 Thu thập được 2 Nhựa Cây Dính từ thân cổ thụ.');
      }
      return;
    }

    if (actionId === 'gather_herbs_ow_1' || actionId === 'gather_herbs_cp_1') {
      const flag = `gathered_${actionId}`;
      if (this.playerState.hasFlag(flag)) {
        this.uiScene?.showPopupMessage('Bụi thảo dược này đã được hái sạch.');
      } else {
        this.playerState.setFlag(flag);
        this.playerState.addItem('res_herbs', 2);
        this.audioManager?.playInteract();
        this.uiScene?.showPopupMessage('🌿 Hái được 2 Thảo Dược Bạc tươi mát ven lối mòn.');
      }
      return;
    }

    // C4-12-03 & C4-12-10 & C4-12-11: Tương tác kiểm tra Cổng Đông làng Bellhollow qua ZoneConnectionRegistry / WorldGatingSystem
    if (actionId === 'inspect_east_gate') {
      const evaluation = WorldGatingSystem.getInstance().evaluateTransition('bellhollow', 'crooked_path', this.playerState);
      const traversal = ZoneConnectionRegistry.getInstance().evaluateConnectionTraversal('conn_bellhollow_to_crooked_path', this.playerState);
      if (!traversal.allowed || !evaluation.allowed) {
        if (this.uiScene) {
          this.uiScene.showPopupMessage(`🔒 ${traversal.reason || evaluation.reason} ${traversal.hint || evaluation.hint || ''}`);
        }
      } else {
        if (this.uiScene) {
          this.uiScene.showPopupMessage('✔ Cổng Đông đã mở! Cây cầu đá dẫn thẳng tới Tháp Chuông đã sập nát... Mình buộc phải tìm đường vòng qua Rừng Ngoài và Đường Mòn Quanh Co.');
        }
      }
      return;
    }

    // C4-12-11 & C4-12-17: Tương tác kiểm tra các lối rẽ ranh giới phân khu Vùng Lõi
    if (actionId === 'inspect_farm_gate') {
      const traversal = ZoneConnectionRegistry.getInstance().evaluateConnectionTraversal('conn_bellhollow_to_farm', this.playerState);
      if (this.uiScene) {
        if (traversal.allowed) {
          this.uiScene.showPopupMessage('🌱 Lối Nam mở rộng: Dẫn xuống Nông Trại Trú Ẩn (Sanctuary Farm).');
        } else {
          this.uiScene.showPopupMessage(traversal.notice || traversal.reason || 'Khu vực Nông Trại đang được thi công.');
        }
      }
      return;
    }

    if (actionId === 'inspect_outer_woods_gate') {
      const traversal = ZoneConnectionRegistry.getInstance().evaluateConnectionTraversal('conn_bellhollow_to_outer_woods', this.playerState);
      if (this.uiScene) {
        if (traversal.allowed) {
          this.uiScene.showPopupMessage('🌲 Lối Đông Nam mở rộng: Dẫn ra vành đai Rừng Ngoại Vi (Outer Woods).');
        } else {
          this.uiScene.showPopupMessage(traversal.notice || traversal.reason || 'Khu vực Rừng Ngoại Vi đang được phát quang.');
        }
      }
      return;
    }

    if (actionId === 'interact_camp_fire') {
      if (this.uiScene) {
        this.uiScene.openCampfireModal();
      }
      return;
    }

    if (actionId === 'open_camp_chest') {
      if (this.uiScene) {
        this.uiScene.openStorageChest();
      }
      return;
    }

    if (actionId === 'open_herbal_cauldron') {
      if (this.uiScene) {
        this.uiScene.openCauldronModal();
      }
      return;
    }

    if (actionId === 'rest_in_tent') {
      const isDangerous = this.isAct5ChaseActive || Boolean(this.listenerMonster && this.listenerMonster.ai.state === 'CHASE');
      const res = this.campSystem.restInShelter(this.timeSystem, isDangerous);
      if (this.uiScene) {
        this.uiScene.showPopupMessage(res.message);
      }
      if (res.success) {
        this.audioManager.playInteract();
        this.player.playGather();
      }
      return;
    }

    if (actionId === 'open_storage') {
      if (this.uiScene) {
        this.uiScene.openStorageChest();
      }
      return;
    }

    if (actionId === 'inspect_farm_well') {
      if (this.uiScene) {
        this.uiScene.showPopupMessage('💧 Giếng Nước Nông Trại: Nguồn nước trong lành mát lạnh dùng để tưới 4 luống thảo dược.');
      }
      return;
    }

    if (actionId === 'read_farm_sign') {
      if (this.uiScene) {
        this.uiScene.showPopupMessage('📜 Biển Gỗ: "NÔNG TRẠI TRÚ ẨN — Vùng đất bình yên để gieo trồng thảo dược và dự trữ sinh tồn."');
      }
      return;
    }

    if (actionId === 'read_herb_terrace_sign') {
      if (this.uiScene) {
        this.uiScene.showPopupMessage('🌿 Vườn Dược Sanctuary: "4 Ô đất màu mỡ trồng Thảo Dược Bạc. Nhấn [E] khi đứng gần ô đất để gieo hạt hoặc thu hoạch."');
      }
      return;
    }

    if (actionId === 'read_ow_sign') {
      if (this.uiScene) {
        this.uiScene.showPopupMessage('📜 Biển Chỉ Dẫn: "HƯỚNG ĐÔNG NAM — Rừng Ngoại Vi. Thu thập củi khô & thảo mộc rừng."');
      }
      return;
    }

    if (actionId === 'inspect_ow_campfire') {
      if (this.uiScene) {
        this.uiScene.showPopupMessage('🏕️ Bếp Lửa Thợ Săn: Tàn tro than đã nguội lạnh. Rải rác xung quanh là đá lửa và cành củi khô.');
      }
      return;
    }

    if (actionId === 'inspect_ow_fallen_tree') {
      if (this.uiScene) {
        this.uiScene.showPopupMessage('🪵 Thân Cây Cổ Thụ Đổ: Một cây sồi đại ngàn bị quật ngã, rêu ẩm phủ đầy thân cây và nhựa rỉ ra từ kẽ nứt.');
      }
      return;
    }

    if (actionId === 'inspect_ow_willow') {
      if (this.uiScene) {
        this.uiScene.showPopupMessage('🌿 Cây Liễu Cổ Thụ: Tán lá rủ dài chạm đất che chắn cho bãi đất thưa yên bình, rải rác khóm Thảo Dược Bạc hoang dã.');
      }
      return;
    }

    if (actionId === 'inspect_deep_forest_gate') {
      const traversal = ZoneConnectionRegistry.getInstance().evaluateConnectionTraversal('conn_crooked_path_to_deep_forest', this.playerState);
      if (this.uiScene) {
        this.uiScene.showPopupMessage(traversal.notice || traversal.reason || 'Khu vực Rừng Sâu đầy hiểm nguy.');
      }
      return;
    }

    // V1.4 - P6: Tương tác Xưởng Chuông Bỏ Hoang (Abandoned Bell Workshop)
    if (actionId === 'collect_runed_iron_part') {
      this.audioManager.playInteract();
      this.player.playGather();
      this.playerState.addItem('mat_runed_iron', 1);
      this.playerState.setFlag('has_runed_iron_part');
      this.playerState.completeQuestTask('SQ01_RUNED_IRON', 't1');
      if (this.uiScene) {
        this.uiScene.showPopupMessage('⚙️ Đã thu thập: Phụ Kiện Sắt Rèn Cổ Ngữ! Hãy mang về cho Bram tại lò rèn Bellhollow.');
      }
      return;
    }

    if (actionId === 'inspect_bell_mold') {
      this.audioManager.playInteract();
      this.player.playGather();
      this.playerState.addItem('item_bell_mold', 1);
      this.playerState.setFlag('has_bell_mold');
      this.playerState.completeQuestTask('SQ02_BELL_MEMORY', 't1');
      if (this.uiScene) {
        this.uiScene.showPopupMessage('🔔 Đã tìm thấy: Khuôn Đúc Chuông Cũ! Hãy mang về cho bà lão Edda dưới chân tháp chuông.');
      }
      return;
    }

    if (actionId === 'read_black_knight_stele') {
      this.audioManager.playInteract();
      this.playerState.unlockLore('lore_black_knight_chronicle');
      if (this.playerState.memoryAwakeningStage < 1) {
        this.playerState.memoryAwakeningStage = 1;
      }
      if (this.uiScene) {
        this.uiScene.showPopupMessage('🗡️ [VĂN BIA CỔ - HIỆP SĨ ĐEN]: "Hiệp Sĩ Đen — vị chỉ huy duy nhất năm xưa dám tiến vào tâm điểm Mạch Rễ để phong ấn lời nguyền và đánh đổi toàn bộ ký ức của mình."');
      }
      return;
    }

    if (actionId === 'read_blacksmith_journal') {
      this.audioManager.playInteract();
      this.playerState.unlockLore('lore_blacksmith_journal');
      if (this.playerState.memoryAwakeningStage < 1) {
        this.playerState.memoryAwakeningStage = 1;
        this.playerState.unlockLore('lore_black_knight_chronicle');
      }
      if (this.uiScene) {
        this.uiScene.showPopupMessage('📜 [NHẬT KÝ THỢ RÈN]: "Màn sương ngưng tụ từ rễ đại ngàn... Cần một hợp kim đặc biệt để tiếng chuông xuyên thủng The Veil."');
      }
      return;
    }

    if (actionId === 'inspect_ancient_workbench') {
      this.audioManager.playInteract();
      this.player.playGather();
      if (!this.playerState.hasFlag('has_runed_iron_part')) {
        this.playerState.addItem('mat_runed_iron', 1);
        this.playerState.setFlag('has_runed_iron_part');
        this.playerState.completeQuestTask('SQ01_RUNED_IRON', 't2');
      }
      if (this.uiScene) {
        this.uiScene.showPopupMessage('🔨 [BÀN THAO TÁC CỔ]: Bàn rèn phủ rêu phong của thợ đúc chuông, nơi tìm thấy Phôi Sắt Cổ Ngữ!');
      }
      return;
    }

    // V1.4 - P6: Tương tác Hầm Rễ Cổ (Root Cellar)
    if (actionId === 'collect_rare_mushrooms') {
      this.audioManager.playInteract();
      this.player.playGather();
      this.playerState.addItem('res_forest_mushroom', 3);
      this.playerState.addItem('seed_mushroom', 1);
      if (this.uiScene) {
        this.uiScene.showPopupMessage('🍄 Đã thu hoạch Nấm Rừng Quý Hiếm (+3) & Bào Tử Nấm (+1) từ vách đá hầm rễ ẩm ướt!');
      }
      return;
    }

    if (actionId === 'collect_pure_spring') {
      this.audioManager.playInteract();
      this.player.playGather();
      this.player.stats.composure = Math.min(this.player.stats.maxComposure, this.player.stats.composure + 15);
      const currentTemp = this.player.stats.temperature ?? 80;
      this.player.stats.temperature = Math.min(100, currentTemp + 10);
      if (this.uiScene) {
        this.uiScene.showPopupMessage('💧 Dòng nước ngầm thanh khiết len qua vách đá, tinh sạch để nấu Trà An Thần (+15 Bình Tâm)!');
      }
      return;
    }

    if (actionId === 'collect_rare_roots') {
      this.audioManager.playInteract();
      this.player.playGather();
      this.playerState.addItem('item_medicinal_roots', 2);
      this.playerState.setFlag('has_rare_roots');
      this.playerState.completeQuestTask('SQ03_CELLAR_TEA', 't2');
      if (this.uiScene) {
        this.uiScene.showPopupMessage('🌿 Đã thu hoạch: Rễ Thuốc Cổ Quý Hiếm (+2)! Thảo dược ngàn năm dùng để nấu Trà An Thần.');
      }
      return;
    }

    if (actionId === 'solve_cellar_lock') {
      this.audioManager.playInteract();
      if (!this.player.stats.isLanternOn && this.player.stats.lanternOil <= 0) {
        if (this.uiScene) {
          this.uiScene.showPopupMessage('🔒 Ổ khóa cổ ngữ rễ cây cần ánh sáng đèn lồng [Phím F] để kích hoạt các quang thể!');
        }
        return;
      }
      if (this.playerState.hasFlag('cellar_lock_solved')) {
        if (this.uiScene) {
          this.uiScene.showPopupMessage('✨ Cơ quan ánh sáng đã mở, dòng nhựa cổ thụ đang tỏa ánh sáng dịu xua tan ẩm lạnh.');
        }
        return;
      }
      this.playerState.setFlag('cellar_lock_solved');
      this.playerState.addItem('food_calming_tea', 1);
      this.player.stats.composure = Math.min(this.player.stats.maxComposure, this.player.stats.composure + 25);
      if (this.uiScene) {
        this.uiScene.showPopupMessage('✨ Ánh đèn soi rọi rãnh rễ cây! Cơ quan mở khóa hé lộ bình Trà An Thần cổ, hồi 25 Bình Tâm!');
      }
      return;
    }

    if (actionId === 'read_fog_origin_mural') {
      this.audioManager.playInteract();
      this.playerState.unlockLore('lore_fog_origin');
      if (this.uiScene) {
        this.uiScene.showPopupMessage('📜 [BÍCH HỌA CỔ]: "Màn sương The Veil không sinh ra từ bóng tối, mà là hơi thở của Rừng Rỗng khi quả chuông câm lặng..."');
      }
      return;
    }

    // V1.4 - P6: Tương tác Khoảng Trống Thì Thầm (Whispering Clearing)
    if (actionId === 'inspect_echo_pillar_1' || actionId === 'inspect_echo_pillar_2' || actionId === 'inspect_echo_pillar_3') {
      this.audioManager.playInteract();
      this.playerState.observeCreature('echo');
      this.audioManager.playFalseFootsteps();
      this.playerState.setFlag('inspected_echo_pillar');
      this.playerState.completeQuestTask('SQ04_CLEARING_PATROL', 't2');
      if (this.uiScene) {
        this.uiScene.showPopupMessage('🔊 Cột Vọng Âm rung lên tiếng thì thầm: "Đó chỉ là ảo ảnh Ký Ức The Echo... Phân biệt tiếng bước chân giả với tiếng rít của The Listener!"');
      }
      return;
    }

    if (actionId === 'read_cp_frontier_sign') {
      if (this.uiScene) {
        this.uiScene.showPopupMessage('📜 Cột Mốc Tiền Tuyến: "LỐI MÒN QUANH CO — Đi theo vệt đèn lồng. Cẩn thận bước chân khi sương mù đặc lại."');
      }
      return;
    }

    if (actionId === 'inspect_cp_sentinel_rock') {
      if (this.uiScene) {
        this.uiScene.showPopupMessage('🗿 Khối Đá Canh Gác: Vết cào móng vuốt sâu hoắm của Kẻ Lắng Nghe (The Listener) hằn trên mặt đá cổ phủ rêu phong...');
      }
      return;
    }

    if (actionId === 'inspect_cp_hunter_cache') {
      if (this.uiScene) {
        this.uiScene.showPopupMessage('🎒 Bọc Hành Trang Cũ: Bọc da của một thợ rừng đã rách nát, bên trong còn vương lại cành củi khô và vụn đá lửa.');
      }
      return;
    }

    if (actionId === 'inspect_df_entry_sign') {
      if (this.uiScene) {
        this.uiScene.showPopupMessage('📜 Biển Rừng Sâu: "CẢNH BÁO: Lãnh địa nguyên sinh nơi Kẻ Lắng Nghe săn mồi. Giữ ngọn đèn sáng, hạn chế chạy nhanh và nấp vào Thân Cây Rỗng khi nghe thấy tiếng động."');
      }
      return;
    }

    if (actionId === 'inspect_df_listener_nest') {
      if (this.uiScene) {
        this.uiScene.showPopupMessage('🦴 Ổ Đá Kẻ Lắng Nghe: Khối đá lớn với những vết móng vuốt cào xé dữ tợn, rải rác xương thú và mùi ẩm mốc lạnh lẽo.');
      }
      return;
    }

    if (actionId === 'inspect_df_bioluminescent_fungus') {
      if (this.uiScene) {
        this.uiScene.showPopupMessage('🍄 Nấm Phát Quang: Loài nấm rừng sâu phát ra ánh sáng lam lục kỳ dị trong bóng tối. Tinh chất của chúng chứa nguồn dược liệu quý giá.');
      }
      return;
    }

    if (actionId === 'inspect_df_mire_boundary_gate') {
      const isMireUnlocked = this.playerState.isSilentMireUnlocked();
      if (this.uiScene) {
        if (isMireUnlocked) {
          this.uiScene.showPopupMessage('🌲 Lối sang Đầm Lầy Tĩnh Lặng đã thông suốt! Tiến về phía Đông để xuống đầm lầy.');
        } else {
          const evalResult = WorldGatingSystem.getInstance().evaluateTransition('deep_forest', 'silent_mire', this.playerState);
          this.uiScene.showPopupMessage(`🔒 ${evalResult.reason} ${evalResult.hint || ''}`);
        }
      }
      return;
    }

    // C4-12-23: Tương tác các điểm chỉ dẫn môi trường Đầm Lầy Tĩnh Lặng (Silent Mire)
    if (actionId === 'read_sm_entry_sign') {
      if (this.uiScene) {
        this.uiScene.showPopupMessage('📜 Biển Gỗ Đầm Lầy: "CẢNH BÁO: Vùng ngập nước sương độc ăn mòn tâm trí. Đi trên các gờ đất cao và cầu ván gỗ để tránh sụt bùn lầy. Ẩn nấp vào hốc cây cổ hoặc cụm lau sậy rậm rạp khi sương mù cuộn sóng."');
      }
      return;
    }

    if (actionId === 'inspect_sm_boardwalk_pier') {
      if (this.uiScene) {
        this.uiScene.showPopupMessage('🪵 Cầu Ván Gỗ Mục: Những tấm ván gỗ sồi xám xịt phủ đầy rêu ướt được đóng cọc cẩn thận qua vũng nước đen thẳm, dẫn thẳng đến Trận Địa Cổ Ngữ.');
      }
      return;
    }

    if (actionId === 'inspect_sm_sunken_ruins') {
      if (this.uiScene) {
        this.uiScene.showPopupMessage('🏛️ Khối Đá Chìm Cổ Xưa: Khối cự thạch hình lập phương chìm một nửa trong bùn lầy sâu, trên bề mặt phủ đầy rêu phong và những vết khắc hình học bí ẩn của nền văn minh cổ sơ.');
      }
      return;
    }

    if (actionId === 'inspect_sm_dead_willow') {
      if (this.uiScene) {
        this.uiScene.showPopupMessage('🥀 Gốc Cổ Thụ Liễu Héo Tàn: Cây liễu khổng lồ trơ trọi cành khẳng khiu vươn lên giữa đầm lầy, các nhánh cây như những cánh tay đen kịt đang vươn lên khẩn cầu bầu trời u ám.');
      }
      return;
    }

    if (actionId === 'inspect_sm_shrine_gate_ward') {
      const isShrineUnlocked = this.playerState.isShrineUnlocked();
      if (this.uiScene) {
        if (isShrineUnlocked) {
          this.uiScene.showPopupMessage('✨ Phong ấn Kết Giới Miếu Chuông đã giải phóng! Con đường dẫn vào Miếu Chuông Phế Tích (Broken Bell Shrine) đã thông suốt.');
        } else {
          const evalResult = WorldGatingSystem.getInstance().evaluateTransition('silent_mire', 'broken_bell_shrine', this.playerState);
          this.uiScene.showPopupMessage(`🔒 ${evalResult.reason} ${evalResult.hint || ''}`);
        }
      }
      return;
    }

    // Tương tác Bệ Thờ Trung Tâm Trận Địa Cổ Ngữ (C4-12-24)
    if (actionId === 'inspect_rune_altar') {
      if (this.playerState.hasFlag('mire_pillars_solved')) {
        if (this.uiScene) {
          this.uiScene.showPopupMessage('✨ Bệ Thờ Trung Tâm: Ba dòng năng lượng cổ ngữ đang hội tụ rực rỡ, chiếu rọi phong ấn Miếu Chuông đã được giải phóng hoàn toàn!');
        }
      } else {
        const litCount = this.puzzleSystem.getLitPillarsCount();
        if (this.uiScene) {
          this.uiScene.showPopupMessage(`🏛️ Bệ Thờ Trung Tâm: Khắc ba rãnh dẫn năng lượng về Trăng Khuyết (TB), Rễ Rừng (Nam), Con Mắt (ĐB). Tiến trình: ${litCount}/3 cột đá đã kích hoạt.`);
        }
      }
      return;
    }

    // Tương tác Bia Đá Cổ Thư Đầm Lầy (C4-12-24)
    if (actionId === 'read_rune_clue_stele') {
      this.audioManager.playInteract();
      this.playerState.unlockLore('lore_runestones');
      if (this.uiScene) {
        this.uiScene.showPopupMessage('📜 [CỔ THƯ ĐẦM LẦY]: "Khi Trăng Khuyết soi bóng đáy nước (1), Rễ Sâu thức giấc đâm xuyên bùn lầy (2), Con Mắt viễn cổ mở ra dẫn lối qua đầm (3)."');
      }
      return;
    }

    // Tương tác Bia Đá Cổ Miếu Chuông (C4-12-25)
    if (actionId === 'read_shrine_stele') {
      this.audioManager.playInteract();
      this.playerState.unlockLore('lore_clapper_curse');
      if (this.uiScene) {
        this.uiScene.showPopupMessage('📜 [BIA ĐÁ MIẾU CHUÔNG]: "Khi tiếng chuông vỡ câm lặng, Màn Sương sẽ nhớ lại tất cả những gì rừng già đã chôn giấu... Chỉ có tiếng ngân đầu tiên của Lưỡi Chuông Đồng mới có thể triệu hồi lại vòng phong ấn che chở cho Bellhollow."');
      }
      return;
    }

    // Tương tác Quả Chuông Cổ Khổng Lồ (C4-12-25)
    if (actionId === 'inspect_cracked_bell') {
      this.audioManager.playInteract();
      if (!this.playerState.hasFlag('boss_mire_warden_defeated') && (this.playerState.hasFlag('mire_pillars_solved') || this.playerState.hasFlag('mire_puzzle_solved'))) {
        this.triggerMireWardenBossEncounter();
        return;
      }
      if (this.uiScene) {
        this.uiScene.showPopupMessage('🔔 Quả Chuông Cổ Khổng Lồ: Thân chuông đồng đen sứt mẻ với những vết nứt sâu hoắm do búa tạ và thời gian tàn phá. Lưỡi chuông đã bị tháo rời đặt ngay trên Bệ Thờ Đá bên dưới.');
      }
      return;
    }

    this.cameraSystem.shake(100, 0.005);

    // Xử lý 3 Cột Đá Cổ Ngữ tại Silent Mire (Câu đố 2)
    if (actionId === 'touch_pillar_1') {
      this.handlePillarInteraction('pillar_moon');
    } else if (actionId === 'touch_pillar_2') {
      this.handlePillarInteraction('pillar_root');
    } else if (actionId === 'touch_pillar_3') {
      this.handlePillarInteraction('pillar_eye');
    } else if (actionId === 'collect_bell_tongue') {
      if (!this.playerState.hasFlag('boss_mire_warden_defeated') && (this.playerState.hasFlag('mire_pillars_solved') || this.playerState.hasFlag('mire_puzzle_solved'))) {
        this.triggerMireWardenBossEncounter();
        return;
      }
      if (!this.playerState.hasFlag('clapper_collected')) {
        this.audioManager.playBronzeBellToll();
        this.playerState.addItem('quest_bronze_clapper', 1);
        this.playerState.setFlag('clapper_collected');
        this.startAct5EscapeChase();
      } else {
        if (this.uiScene) {
          this.uiScene.showPopupMessage('Bệ đá cổ chỉ còn lại vết bụi đồng hoen rỉ.');
        }
      }
    } else if (actionId === 'inspect_bell') {
      if (this.playerState.hasFlag('bell_rung')) {
        if (this.uiScene) {
          this.uiScene.showPopupMessage('🔔 Quả chuông đồng đã ngân vang, bảo vệ làng Bellhollow an toàn trong màn sương.');
        }
      } else if (this.playerState.getItemCount('quest_bronze_clapper') > 0) {
        if (this.uiScene) {
          this.uiScene.showPopupMessage('🔔 Gắn Lưỡi Chuông Đồng vào quả chuông cổ làng Bellhollow...');
        }
        this.endingSystem.triggerTheFirstTollFinale();
      } else {
        if (this.uiScene) {
          this.uiScene.showPopupMessage('Quả chuông làng câm lặng vì thiếu Lưỡi Chuông Đồng!');
        }
      }
    } else if (actionId === 'hide_player') {
      if (!this.player.stats.isHiding) {
        // C4-13-01: Bắt đầu ẩn nấp — Lưu lại tọa độ an toàn trước khi vào chỗ trốn
        this.player.enterHiding({ x: this.player.x, y: this.player.y });
        this.playerState.completeQuestTask('Q04_ANCIENT_RUNES', 't2');
        if (this.uiScene) {
          this.uiScene.showPopupMessage('🌿 Đang ẩn nấp an toàn trong Thân Cây / Bụi Rậm! Kẻ Lắng Nghe sẽ không thể nghe thấy bạn.');
          this.uiScene.setInteractionPrompt('[E] / [WASD] Bước ra khỏi chỗ trốn', this.player.x, this.player.y - 36);
        }
      } else {
        // C4-13-01: Thoát ẩn nấp — Trả nhân vật về vị trí an toàn ngoài rìa collider, bật hiển thị và mở khóa
        this.player.exitHiding();
        this.unstuckPlayerFromColliders();
        if (this.uiScene) {
          this.uiScene.showPopupMessage('Đã bước ra khỏi chỗ trốn.');
          this.uiScene.setInteractionPrompt(null);
        }
      }
    } else {
      if (this.uiScene) {
        this.uiScene.showPopupMessage(`Đã tương tác với: ${name}`);
      }
    }
  }

  /**
   * V1.4 - P6: Tự động ghi chép Sổ Tay Sinh Vật (Bestiary) khi lữ khách đặt chân tới vùng sinh thái
   */
  public triggerCreatureObservationsForZone(zoneId: string): void {
    if (zoneId === 'outer_woods' || zoneId === 'crooked_path' || zoneId === 'bellhollow') {
      this.playerState.observeCreature('crow');
    }
    if (zoneId === 'sanctuary_farm' || zoneId === 'outer_woods' || zoneId === 'bellhollow') {
      this.playerState.observeCreature('lantern_moth');
    }
    if (zoneId === 'sub_whispering_clearing') {
      this.playerState.observeCreature('echo');
    }
    if (zoneId === 'deep_forest' || zoneId === 'crooked_path') {
      this.playerState.observeCreature('listener');
    }
    if (zoneId === 'broken_bell_shrine') {
      this.playerState.observeCreature('mire_warden');
    }
    const currentPhase = this.timeSystem ? this.timeSystem.getCurrentPhase() : 'DAY';
    if ((zoneId === 'crooked_path' || zoneId === 'deep_forest' || zoneId === 'silent_mire') && (currentPhase === 'DUSK' || currentPhase === 'NIGHT')) {
      this.playerState.observeCreature('skull_wolf');
    }
    // V1.4 - P8-09: Tự động ghi chép Bestiary cho các Quái Vật Bóng Tối
    if ((zoneId === 'outer_woods' || zoneId === 'deep_forest') && (currentPhase === 'DUSK' || currentPhase === 'NIGHT')) {
      this.playerState.observeCreature('shadow_crow');
    }
    if ((zoneId === 'deep_forest' || zoneId === 'silent_mire') && (currentPhase === 'DUSK' || currentPhase === 'NIGHT')) {
      this.playerState.observeCreature('shadow_eyes');
    }
    if (zoneId === 'silent_mire' || zoneId === 'broken_bell_shrine') {
      this.playerState.observeCreature('shadow_behemoth');
    }
  }

  /**
   * C4-13-16: Hiển thị dòng suy nghĩ ngắn kể chuyện của nhân vật khi đi ngược kịch về rào chắn phía Tây hoặc nhấn [E] kiểm tra.
   * Cooldown 6 giây (6000ms) để không hiện lặp liên tục khi di chuyển va chạm vào rào chắn.
   */
  public triggerWestBarrierThought(isManualInspect: boolean = false): boolean {
    const now = Date.now();
    if (!isManualInspect && now - this.lastWestBarrierThoughtTime < 6000) {
      return false;
    }
    this.lastWestBarrierThoughtTime = now;
    if (this.uiScene) {
      this.uiScene.showPopupMessage('Lối mòn phía sau đã bị sương mù đặc quánh nuốt chửng... Không thể quay lại được nữa. Chỉ còn cách tiến sâu vào Bellhollow.');
    }
    return true;
  }

  /**
   * V14-P8-13: Dẫn hướng nhân vật khi lại gần lối tắt cầu đá bị sập hoặc nhấn [E] kiểm tra.
   * Cooldown 6 giây (6000ms) để không spam popup khi người chơi đứng gần bờ vực.
   */
  public triggerCollapsedBridgeThought(isManualInspect: boolean = false): boolean {
    const now = Date.now();
    if (!isManualInspect && now - this.lastCollapsedBridgeThoughtTime < 6000) {
      return false;
    }
    this.lastCollapsedBridgeThoughtTime = now;
    if (this.uiScene) {
      this.uiScene.showPopupMessage('Cây cầu đá dẫn thẳng tới Tháp Chuông đã sập nát... Mình buộc phải tìm đường vòng qua Rừng Ngoài và Đường Mòn Quanh Co.');
    }
    return true;
  }

  private handlePillarInteraction(pillarId: string): void {
    let noteIdx = 0;
    if (pillarId === 'pillar_root') noteIdx = 1;
    else if (pillarId === 'pillar_eye') noteIdx = 2;

    const res = this.puzzleSystem.interactPillar(pillarId);
    if (this.uiScene) {
      this.uiScene.showPopupMessage(res.msg);
    }

    // 1. Chống lặp thao tác/nhận thưởng khi đã giải đố thành công
    if (res.alreadySolved) {
      this.audioManager.playInteract();
      return;
    }

    // 2. Cột đá đã được kích hoạt trong lượt này
    if (res.alreadyLit) {
      this.audioManager.playRunestoneResonance(noteIdx);
      return;
    }

    // 3. Kích hoạt sai thứ tự: âm thanh lỗi, rung chấn, hoàn tác chuỗi và báo động quái vật
    if (res.failed) {
      this.audioManager.playRunestoneError();
      this.worldBuilder.setPillarLit(pillarId, false, true);
      this.worldBuilder.resetAllPillars();
      this.playerState.resetQuestTasks('Q05_SOLVE_MIRE');
      if (this.listenerMonster) {
        this.listenerMonster.hearSound(3520, 280, 2.5);
      }
      this.cameraSystem.shake(250, 0.012);
      return;
    }

    // 4. Hoàn thành toàn bộ câu đố (cả 3 cột): hợp âm khải hoàn, hào quang bệ thờ, flash màn hình, lưu game
    if (res.solved) {
      this.audioManager.playRunestoneChord();
      this.worldBuilder.setPillarLit(pillarId, true, false);
      this.worldBuilder.triggerRunePuzzleSolvedCelebration();
      this.cameraSystem.flash(500, 56, 216, 162);
      this.playerState.setFlag('mire_drained');
      this.playerState.completeQuestTask('Q05_SOLVE_MIRE', 't1');
      this.playerState.completeQuestTask('Q05_SOLVE_MIRE', 't2');
      this.playerState.completeQuestTask('Q05_SOLVE_MIRE', 't3');
      this.playerState.setCurrentQuest('Q06_RETRIEVE_CLAPPER');
      SaveManager.saveGame('HỒI 4: ĐẦM LẦY TĨNH LẶNG (ĐÃ GIẢI MÃ CỘT ĐÁ)', 'ancient_rune_puzzle', this.player.x, this.player.y);
      return;
    }

    // 5. Kích hoạt đúng cột đá kế tiếp (bước 1 hoặc bước 2)
    this.audioManager.playRunestoneResonance(noteIdx);
    this.worldBuilder.setPillarLit(pillarId, true, false);
    if (res.stepIndex === 1) {
      this.playerState.completeQuestTask('Q05_SOLVE_MIRE', 't1');
    } else if (res.stepIndex === 2) {
      this.playerState.completeQuestTask('Q05_SOLVE_MIRE', 't2');
    }
  }

  private updateFogOfWar(): void {
    const activeZone = this.worldBuilder.getActiveZone();
    let fogAlpha = activeZone.atmosphere.fogAlpha;
    let fogColor = activeZone.atmosphere.fogColor;

    // V1.4: Hòa trộn màu sắc sương mù theo chu kỳ Ngày / Hoàng Hôn / Đêm
    if (this.timeSystem) {
      const timeColor = this.timeSystem.getFogColor();
      const timeAlpha = this.timeSystem.getFogAlpha();
      fogColor = lerpColor(fogColor, timeColor, 0.65);
      fogAlpha = Math.max(fogAlpha, timeAlpha);
    }

    // Trong cuộc rượt đuổi Act 5, Màn Sương chuyển sang sắc tím đậm hung bạo
    if (this.isAct5ChaseActive) {
      fogAlpha = 0.88;
      fogColor = 0x2d122b;
    } else if (this.currentZoneId === 'fog_crossing' || this.player.x < 560) {
      // C4-134-01: Hiệu ứng "Con Đường Sương Mù" Doraemon tại Fog Crossing & lối vào làng
      const fogFactor = Phaser.Math.Clamp((560 - this.player.x) / 400, 0, 1);
      if (fogFactor > 0) {
        fogAlpha = Phaser.Math.Linear(activeZone.atmosphere.fogAlpha, 0.48, fogFactor);
        const cr = Math.round(Phaser.Math.Linear((activeZone.atmosphere.fogColor >> 16) & 0xff, 0x32, fogFactor));
        const cg = Math.round(Phaser.Math.Linear((activeZone.atmosphere.fogColor >> 8) & 0xff, 0x18, fogFactor));
        const cb = Math.round(Phaser.Math.Linear(activeZone.atmosphere.fogColor & 0xff, 0x28, fogFactor));
        fogColor = (cr << 16) | (cg << 8) | cb;
      }
    }

    const cam = this.cameras.main;
    const isLanternLit = Boolean(this.player.stats.isLanternOn && this.player.stats.lanternOil > 0);
    let targetBaseRadius = isLanternLit ? LANTERN_RADIUS_NORMAL : LANTERN_RADIUS_DIM;
    if (this.timeSystem) {
      targetBaseRadius = this.timeSystem.getVisionRadius(isLanternLit);
    }
    if (this.worldEventSystem) {
      targetBaseRadius = Math.max(40, targetBaseRadius - this.worldEventSystem.getFogVisionReduction());
    }

    // V1.4 - Bước 9: Biến đổi môi trường khi Boss Thức Tỉnh (Veil Density, Light Radius 0.55x, Tint 0x2a141e)
    const isBossAwakened = this.isBossFightActive || (this.wildlifeSystem ? this.wildlifeSystem.isBossAwakened() : false);
    if (isBossAwakened) {
      targetBaseRadius = Math.max(50, targetBaseRadius * 0.55);
      fogColor = 0x2a141e;
      fogAlpha = Math.max(fogAlpha, 0.85);
    }

    // V1.5 (BƯỚC V15-06): Liên kết trực tiếp chỉ số Bình Tâm vào bán kính chiếu sáng và tầm nhìn
    const composure = this.playerState.stats.composure;
    const compScale = this.veilSystem
      ? this.veilSystem.getComposureVisionScale(composure)
      : (composure >= 50 ? 1.0 : Phaser.Math.Linear(0.45, 1.0, Math.max(0, composure / 50)));
    targetBaseRadius *= compScale;

    // Khi Bình Tâm < 50%, quầng sáng co nhỏ lại và chập chờn mạnh như sắp tắt
    if (composure < 50) {
      const panicFlickerSeverity = (50 - composure) / 50;
      const compFlicker = (Math.sin(Date.now() * 0.016) * 0.07 + Math.cos(Date.now() * 0.029) * 0.05) * panicFlickerSeverity;
      targetBaseRadius *= Math.max(0.65, 1.0 + compFlicker);
    }

    // Hiệu ứng chao đảo ánh sáng khi dơi phục kích cắn trúng
    if (this.batLanternFlickerTimer > 0) {
      this.batLanternFlickerTimer -= 16.6;
      targetBaseRadius *= (0.55 + Math.sin(Date.now() * 0.04) * 0.45);
    }

    // V1.5 (BƯỚC V15-06): Đảm bảo chuyển tiếp êm dịu: Khi người chơi bật đèn, uống thuốc/trà
    // hoặc bước vào vùng Lửa Trại làm Bình Tâm tăng trở lại (targetBaseRadius > currentLanternRadius),
    // vùng nhìn mở rộng mượt mà trong 1.5 giây (lerp factor 0.045) thay vì giật cục.
    const isExpanding = targetBaseRadius > this.currentLanternRadius;
    const lerpFactor = isExpanding ? 0.045 : 0.14;
    this.currentLanternRadius = Phaser.Math.Linear(this.currentLanternRadius, targetBaseRadius, lerpFactor);
    if (Math.abs(this.currentLanternRadius - targetBaseRadius) < 0.4) {
      this.currentLanternRadius = targetBaseRadius;
    }

    // Bán kính ánh sáng chuẩn HD 1280×720 zoom 2.2x
    const radius = this.currentLanternRadius * cam.zoom * 0.82;

    const lanternWorld = this.player.getLanternWorldPosition();
    const lightWorldX = (isLanternLit && lanternWorld.isVisible) ? lanternWorld.x : this.player.x;
    const lightWorldY = (isLanternLit && lanternWorld.isVisible) ? lanternWorld.y : (this.player.y - 20);

    // V14-P8-01: Tính toán tọa độ chiếu chuẩn xác tuyệt đối trên màn hình dựa trực tiếp trên camera scroll và zoom
    // Đảm bảo quầng sáng và lỗ sương mù bám khít tuyệt đối theo vị trí đầu đèn lồng ở mọi vị trí camera
    const camCenterX = cam.width * 0.5;
    const camCenterY = cam.height * 0.5;
    const camWorldCenterX = cam.scrollX + camCenterX;
    const camWorldCenterY = cam.scrollY + camCenterY;
    // C4-13-04: Mathematical projection from world to screen uses (cam.scrollX + cam.width * 0.5)) * cam.zoom directly
    const screenX = Math.round(camCenterX + (lightWorldX - camWorldCenterX) * cam.zoom);
    const screenY = Math.round(camCenterY + (lightWorldY - camWorldCenterY) * cam.zoom);

    // Kiểm tra thay đổi (Dirty Checking) để tránh clear/fill/erase RenderTexture 1280×720 liên tục khi đứng yên
    const isFowDirty =
      this.plantedFlares.length > 0 ||
      Math.abs(screenX - this.lastFowScreenX) > 0.25 ||
      Math.abs(screenY - this.lastFowScreenY) > 0.25 ||
      Math.abs(radius - this.lastFowRadius) > 0.5 ||
      fogColor !== this.lastFowColor ||
      fogAlpha !== this.lastFowAlpha;

    if (isFowDirty) {
      this.lastFowScreenX = screenX;
      this.lastFowScreenY = screenY;
      this.lastFowRadius = radius;
      this.lastFowColor = fogColor;
      this.lastFowAlpha = fogAlpha;

      const qSettings = GraphicsQualitySystem.getInstance().getSettings();
      const lightingScale = qSettings.lightingScale;

      this.fogOfWarLayer.clear();
      this.fogOfWarLayer.fill(fogColor, fogAlpha);

      // C4-12-07 / C4-13-04: Tối ưu hiệu năng bằng mặt nạ ánh sáng lưu đệm (Cached Light Mask - GPU Stamp)
      const maskKey = isLanternLit ? 'cached_light_mask_normal' : 'cached_light_mask_dim';
      if (this.cachedLightMaskImage.texture.key !== maskKey) {
        this.cachedLightMaskImage.setTexture(maskKey);
      }
      this.cachedLightMaskImage.setOrigin(0.5, 0.5);
      const maskBaseSize = isLanternLit ? 512 : 256;
      const targetScale = ((radius * 2.8) / maskBaseSize) * lightingScale;
      this.cachedLightMaskImage.setScale(targetScale);
      this.cachedLightMaskImage.setPosition(screenX * lightingScale, screenY * lightingScale);

      this.fogOfWarLayer.erase(this.cachedLightMaskImage);

      // V1.4 - P8-03: Xua tan sương mù quanh bán kính các Đuốc Nhựa Thông đang cắm
      if (this.plantedFlares.length > 0) {
        if (this.cachedLightMaskImage.texture.key !== 'cached_light_mask_normal') {
          this.cachedLightMaskImage.setTexture('cached_light_mask_normal');
        }
        // Kỹ thuật 2: Light Frustum Culling - Cắt tỉa nguồn sáng ngoài camera (Lề 120px)
        const cullingMargin = 120;
        const viewLeft = cam.worldView.x - cullingMargin;
        const viewRight = cam.worldView.right + cullingMargin;
        const viewTop = cam.worldView.y - cullingMargin;
        const viewBottom = cam.worldView.bottom + cullingMargin;

        for (const flare of this.plantedFlares) {
          if (
            flare.x + flare.radius < viewLeft ||
            flare.x - flare.radius > viewRight ||
            flare.y + flare.radius < viewTop ||
            flare.y - flare.radius > viewBottom
          ) {
            continue;
          }

          const fScreenX = (camCenterX + (flare.x - camWorldCenterX) * cam.zoom) * lightingScale;
          const fScreenY = (camCenterY + (flare.y - 18 - camWorldCenterY) * cam.zoom) * lightingScale;
          const flareScale = ((flare.radius * cam.zoom * 2.6) / 512) * lightingScale;
          this.cachedLightMaskImage.setScale(flareScale);
          this.cachedLightMaskImage.setPosition(fScreenX, fScreenY);
          this.fogOfWarLayer.erase(this.cachedLightMaskImage);
        }
      }
    }

    // V14-P8-01: Hiệu ứng ánh sáng đèn lồng hổ phách ấm áp với chuyển sắc mềm (Radial Gradient)
    if (isLanternLit && this.currentLanternRadius > LANTERN_RADIUS_DIM + 3) {
      const qSettings = GraphicsQualitySystem.getInstance().getSettings();
      const flicker = qSettings.enableAmberFlicker
        ? (Math.sin(this.time.now * 0.007) * 0.02 + Math.cos(this.time.now * 0.013) * 0.015)
        : 0;
      const glowFactor = (this.currentLanternRadius - LANTERN_RADIUS_DIM) / (LANTERN_RADIUS_NORMAL - LANTERN_RADIUS_DIM);
      const glowAlpha = Math.max(0.05, Math.min(0.42, (0.28 + flicker) * glowFactor));

      const targetGlowScale = (radius * 2.2) / 512;

      this.lanternGlowImage.setPosition(screenX, screenY);
      this.lanternGlowImage.setScale(targetGlowScale * (1 + flicker * 0.4));
      this.lanternGlowImage.setAlpha(glowAlpha);
      this.lanternGlowImage.setVisible(true);

      // C4-13-04 & C4-13-06: Quầng sáng ấm chuyển sắc mịn (radius * 0.82, radius * 0.50, radius * 0.24)
      if (this.isLanternGlowDrawn) {
        this.lanternGlowGfx.clear();
        this.isLanternGlowDrawn = false;
      }
    } else {
      if (this.lanternGlowImage && this.lanternGlowImage.visible) {
        this.lanternGlowImage.setVisible(false);
      }
      if (this.isLanternGlowDrawn) {
        this.lanternGlowGfx.clear();
        this.isLanternGlowDrawn = false;
      }
    }
  }

  // ===========================================================================
  // V1.4 - P6: TRẬN CHIẾN ĐẤU TRÙM GIẢI ĐỐ — KẺ NUỐT TIẾNG CHUÔNG (MIRE WARDEN)
  // ===========================================================================

  /**
   * Kích hoạt trận đấu trùm Miếu Chuông / Mạch Rễ
   */
  public triggerMireWardenBossEncounter(): void {
    if (this.isBossFightActive || this.playerState.hasFlag('boss_mire_warden_defeated')) {
      return;
    }

    this.isBossFightActive = true;
    this.audioManager.setBossAwakeningState(true);

    // 1. Checkpoint lưu an toàn tự động ngay trước trận đấu
    SaveManager.saveGame('TRƯỚC MIẾU CHUÔNG — ĐIỂM HỒI SINH AN TOÀN', 'broken_bell_shrine', 4120, 280);
    if (this.uiScene) {
      this.uiScene.showPopupMessage('💾 ĐÃ TỰ ĐỘNG LƯU ĐIỂM HỒI SINH AN TOÀN TRƯỚC MIẾU CHUÔNG!');
    }

    // 2. Dựng rào chắn rễ cây cổ thụ phong tỏa cổng phía Tây (4000..4025, 210..350)
    if (!this.bossArenaBarrier) {
      this.bossArenaBarrier = this.add.graphics();
      this.bossArenaBarrier.setDepth(1500);
      this.bossArenaBarrier.fillStyle(0x1a120c, 0.95);
      this.bossArenaBarrier.fillRect(3995, 210, 30, 140);
      this.bossArenaBarrier.lineStyle(2, 0x4a235a, 0.9);
      this.bossArenaBarrier.strokeRect(3995, 210, 30, 140);

      // Cành gai chằng chịt
      this.bossArenaBarrier.lineStyle(1.5, 0x2e1a2f, 0.8);
      this.bossArenaBarrier.lineBetween(3995, 210, 4025, 350);
      this.bossArenaBarrier.lineBetween(3995, 350, 4025, 210);
      this.bossArenaBarrier.lineBetween(3995, 280, 4025, 280);
    }

    // 3. Khởi tạo thực thể Boss Kẻ Nuốt Tiếng Chuông tại trung tâm tế đàn
    if (!this.mireWardenBoss) {
      this.mireWardenBoss = new BossMireWarden(this, 4500, 240);
    }
    this.mireWardenBoss.setDepth(Math.floor(this.mireWardenBoss.y + 20));
    this.mireWardenBoss.startBossFight();
    this.playerState.observeCreature('mire_warden');
    BossEncounterSystem.getInstance().initArena(this, this.mireWardenBoss as BossMireWarden);

    // 4. Khởi tạo 2 Trụ Cổ Ngữ Pha 1 (Tây Bắc & Đông Bắc)
    this.runePillarTargets.forEach(p => p.graphics?.destroy());
    this.runePillarTargets = [
      { id: 'pillar_nw', x: 4350, y: 180, radius: 45, isLit: true, isShattered: false },
      { id: 'pillar_ne', x: 4650, y: 180, radius: 45, isLit: false, isShattered: false }
    ];
    this.renderRunePillarGlow(this.runePillarTargets[0]);

    // 5. Hiển thị Thanh Độ Ổn Định Phong Ấn trên HUD
    if (this.uiScene) {
      this.uiScene.showBossSealBar('PHONG ẤN MẠCH RỄ — KẺ NUỐT TIẾNG CHUÔNG', 0, 3);
    }

    // 6. Rung chuyển đất trời và âm thanh thức tỉnh
    this.cameraSystem.shake(1200, 0.02);
    this.audioManager.playListenerAlert();

    this.time.delayedCall(1200, () => {
      if (this.uiScene) {
        this.uiScene.showPopupMessage('⚠️ KẺ NUỐT TIẾNG CHUÔNG ĐÃ THỨC TỈNH! Dụ nó lao húc vào Trụ Cổ Ngữ đang phát sáng!');
      }
    });
  }

  /**
   * Cập nhật logic trận đấu trùm theo từng frame
   */
  public updateMireWardenBossEncounter(time: number, delta: number): void {
    if (!this.isBossFightActive || !this.mireWardenBoss) return;

    this.mireWardenBoss.update(time, delta);

    // Người chơi chạy nước rút ồn ào sẽ thu hút Boss
    if (this.player) {
      const pSpeed = Math.hypot(
        (this.player.body as Phaser.Physics.Arcade.Body)?.velocity.x || 0,
        (this.player.body as Phaser.Physics.Arcade.Body)?.velocity.y || 0
      );
      const distToBoss = Math.hypot(this.mireWardenBoss.x - this.player.x, this.mireWardenBoss.y - this.player.y);

      if (pSpeed > 130 && distToBoss < 260) {
        this.mireWardenBoss.hearSound(this.player.x, this.player.y, false);
      }

      // Ngăn người chơi trốn thoát qua cổng rào chắn rễ cây
      if (this.bossArenaBarrier && this.player.x < 4040) {
        this.player.x = 4045;
        if (this.uiScene) {
          this.uiScene.showPopupMessage('⚠️ Mạch rễ cổ thụ phong tỏa lối thoát! Phải hoàn tất phong ấn!');
        }
      }
    }

    // Kiểm tra va chạm khi Boss đang lao húc (CHARGING)
    if (this.mireWardenBoss.currentState === 'CHARGING') {
      for (const pillar of this.runePillarTargets) {
        if (pillar.isLit && !pillar.isShattered) {
          const dist = Math.hypot(this.mireWardenBoss.x - pillar.x, this.mireWardenBoss.y - pillar.y);
          if (dist <= 65) {
            // Boss húc trúng Trụ Cổ Ngữ đang phát sáng -> Bị CHOÁNG 3.5s!
            pillar.isLit = false;
            pillar.isShattered = true;
            if (pillar.graphics) {
              pillar.graphics.clear();
            }

            this.createHitSpark(pillar.x, pillar.y);
            this.cameraSystem.shake(800, 0.025);
            this.audioManager.playInteract();
            this.mireWardenBoss.stagger();

            if (this.uiScene) {
              this.uiScene.showPopupMessage('💥 Boss bị CHOÁNG VÁNG trong 3.5s! Nhấn [E] hoặc dùng Giáo Gỗ phong ấn ngay!');
            }
            break;
          }
        }
      }

      // Va chạm trúng người chơi khi Boss lao húc -> Đẩy lùi và trừ máu
      if (this.player) {
        const distP = Math.hypot(this.mireWardenBoss.x - this.player.x, this.mireWardenBoss.y - this.player.y);
        if (distP <= 36 && !this.mireWardenBoss.isStaggered) {
          this.playerState.stats.health = Math.max(0, this.playerState.stats.health - 15);
          this.playerState.stats.stamina = Math.max(0, this.playerState.stats.stamina - 20);
          this.cameraSystem.shake(300, 0.015);
          const angle = Math.atan2(this.player.y - this.mireWardenBoss.y, this.player.x - this.mireWardenBoss.x);
          this.player.x += Math.cos(angle) * 35;
          this.player.y += Math.sin(angle) * 35;
        }
      }
    }
  }

  /**
   * Vẽ quầng sáng rực rỡ quanh Trụ Cổ Ngữ kích hoạt
   */
  public renderRunePillarGlow(pillar: RunePillarTarget): void {
    if (!pillar.graphics) {
      pillar.graphics = this.add.graphics();
      pillar.graphics.setDepth(pillar.y - 10);
    }
    pillar.graphics.clear();
    if (!pillar.isLit || pillar.isShattered) return;

    pillar.graphics.fillStyle(0x00d2d3, 0.22);
    pillar.graphics.fillCircle(pillar.x, pillar.y, 45);
    pillar.graphics.lineStyle(2, 0x00d2d3, 0.85);
    pillar.graphics.strokeCircle(pillar.x, pillar.y, 45);
    pillar.graphics.lineStyle(1.5, 0xd4af37, 0.95);
    pillar.graphics.strokeCircle(pillar.x, pillar.y, 25);
  }

  /**
   * Người chơi nhấn [E] hoặc tấn công vũ khí khi Boss đang bị choáng
   */
  public handleBossSealInteraction(): void {
    if (!this.isBossFightActive || !this.mireWardenBoss || !this.mireWardenBoss.isStaggered) {
      return;
    }

    const newProgress = this.mireWardenBoss.applySeal();
    if (this.uiScene) {
      this.uiScene.updateBossSealBar(newProgress, 3);
    }
    this.audioManager.playBronzeBellToll();
    this.cameraSystem.flash(500, 0, 210, 211);

    if (newProgress === 1) {
      // Mở khóa Trụ Đông Bắc
      const nePillar = this.runePillarTargets.find(p => p.id === 'pillar_ne');
      if (nePillar) {
        nePillar.isLit = true;
        this.renderRunePillarGlow(nePillar);
      }
      if (this.uiScene) {
        this.uiScene.showPopupMessage('✨ ĐÃ PHONG ẤN NẤC 1 [ᚱ ANH NĂNG CỔ]! Trụ Cổ Ngữ Đông Bắc đã bừng sáng!');
      }
    } else if (newProgress === 2) {
      this.startMireWardenPhase2();
    }
  }

  /**
   * Kích hoạt Pha 2 — Bóng Tối & Thắp Sáng Lại
   */
  public startMireWardenPhase2(): void {
    if (this.uiScene) {
      this.uiScene.showPopupMessage('⚠️ PHA 2: BÓNG TỐI & SƯƠNG ĐẶC! Dùng Đèn Lồng [F] hoặc Đuốc thắp sáng lại 3 Đài Cổ Ngữ!');
    }
    this.cameraSystem.shake(1000, 0.02);

    // Màn sương dày đặc bao trùm
    if (this.veilSystem) {
      this.veilSystem.triggerZoneTransitionMist(800);
    }

    // Triệu hồi 2 ảo ảnh The Echo
    this.bossArenaEchoes.forEach(e => e.destroy());
    const echo1 = new TheEcho(this, {
      id: 'boss_echo_1',
      x: 4320,
      y: 260,
      message: '...tiếng chuông... đã bị nuốt chửng...'
    });
    const echo2 = new TheEcho(this, {
      id: 'boss_echo_2',
      x: 4680,
      y: 260,
      message: '...sương mù... không có lối thoát...'
    });
    this.bossArenaEchoes = [echo1, echo2];

    // Dựng 3 Đài Cổ Ngữ bị dập tắt (Tây, Nam, Đông)
    this.brazierTargets.forEach(b => b.graphics?.destroy());
    this.brazierTargets = [
      { id: 'brazier_w', x: 4280, y: 310, isLit: false },
      { id: 'brazier_s', x: 4500, y: 390, isLit: false },
      { id: 'brazier_e', x: 4720, y: 310, isLit: false }
    ];

    for (const b of this.brazierTargets) {
      b.graphics = this.add.graphics();
      b.graphics.setDepth(b.y - 10);
      b.graphics.fillStyle(0x1a1512, 0.95);
      b.graphics.fillCircle(b.x, b.y, 16);
      b.graphics.lineStyle(1.5, 0x4a3c22, 0.8);
      b.graphics.strokeCircle(b.x, b.y, 16);
    }
  }

  /**
   * Vẽ ngọn lửa bừng sáng trên Đài Cổ Ngữ
   */
  public renderBrazierFlame(brazier: BrazierTarget): void {
    if (!brazier.graphics) return;
    brazier.graphics.clear();
    brazier.graphics.fillStyle(0x1a1512, 0.95);
    brazier.graphics.fillCircle(brazier.x, brazier.y, 16);
    brazier.graphics.lineStyle(1.5, 0xd4af37, 0.9);
    brazier.graphics.strokeCircle(brazier.x, brazier.y, 16);

    // Ngọn lửa hổ phách ấm áp
    brazier.graphics.fillStyle(0xe67e22, 0.95);
    brazier.graphics.fillCircle(brazier.x, brazier.y - 6, 10);
    brazier.graphics.fillStyle(0xf1c40f, 1);
    brazier.graphics.fillCircle(brazier.x, brazier.y - 8, 6);

    // Hào quang tỏa sáng
    brazier.graphics.fillStyle(0xf39c12, 0.25);
    brazier.graphics.fillCircle(brazier.x, brazier.y - 6, 40);
  }

  /**
   * Người chơi thắp sáng lại Đài Cổ Ngữ bằng Đèn Lồng [F] hoặc Đuốc
   */
  public handleRelightBrazier(brazier: BrazierTarget): void {
    if (brazier.isLit) return;
    if (!this.playerState.stats.isLanternOn) {
      if (this.uiScene) {
        this.uiScene.showPopupMessage('⚠️ Cần bật Đèn Lồng [F] hoặc dùng Đuốc Nhựa Thông để thắp sáng đài lửa!');
      }
      return;
    }

    brazier.isLit = true;
    this.renderBrazierFlame(brazier);
    this.audioManager.playInteract();
    this.cameraSystem.shake(150, 0.005);

    const litCount = this.brazierTargets.filter(b => b.isLit).length;
    if (litCount < 3) {
      if (this.uiScene) {
        this.uiScene.showPopupMessage(`🔥 Đã thắp sáng Đài Cổ Ngữ (${litCount}/3)!`);
      }
    } else {
      // Đã thắp đủ 3 đài -> Hóa giải ảo ảnh, làm mù Boss và chiếu rọi Tế Đàn Trung Tâm
      this.bossArenaEchoes.forEach(e => {
        this.tweens.add({
          targets: e,
          alpha: 0,
          duration: 400,
          onComplete: () => e.destroy()
        });
      });
      this.bossArenaEchoes = [];

      this.audioManager.playBronzeBellToll();
      this.cameraSystem.flash(600, 241, 196, 15);

      if (this.mireWardenBoss) {
        this.mireWardenBoss.x = 4500;
        this.mireWardenBoss.y = 250;
        this.mireWardenBoss.stagger();
      }

      if (this.uiScene) {
        this.uiScene.showPopupMessage('🌟 TẾ ĐÀN MẠCH RỄ ĐÃ BỪNG SÁNG! Hãy tiến lại Bệ Thờ Trung Tâm hoàn tất khóa ấn tối hậu!');
      }
    }
  }

  /**
   * Khóa nấc phong ấn thứ 3 tối hậu
   */
  public handleBossFinalSeal(): void {
    if (!this.isBossFightActive || !this.mireWardenBoss) return;

    const finalProgress = this.mireWardenBoss.applySeal();
    if (this.uiScene) {
      this.uiScene.updateBossSealBar(finalProgress, 3);
    }
    this.finishMireWardenDefeat();
  }

  /**
   * Kết thúc nghi thức phong ấn và trao phần thưởng di vật cốt truyện
   */
  public finishMireWardenDefeat(): void {
    if (this.mireWardenBoss) {
      this.mireWardenBoss.defeat();
    }
    this.isBossFightActive = false;
    this.audioManager.setBossAwakeningState(false);

    // Dọn dẹp rào chắn và các đối tượng tạm thời
    if (this.bossArenaBarrier) {
      this.bossArenaBarrier.destroy();
      this.bossArenaBarrier = null;
    }
    this.bossArenaEchoes.forEach(e => e.destroy());
    this.bossArenaEchoes = [];
    this.runePillarTargets.forEach(p => p.graphics?.destroy());
    this.brazierTargets.forEach(b => b.graphics?.destroy());

    this.audioManager.playBronzeBellToll();
    this.cameraSystem.flash(1500, 255, 240, 200);

    // Trao phần thưởng di vật cốt truyện duy nhất (không farm lặp lại)
    this.playerState.addItem('relic_heart_of_roots', 1);
    if (this.playerState.getItemCount('quest_bronze_clapper') === 0) {
      this.playerState.addItem('quest_bronze_clapper', 1);
    }
    this.playerState.setFlag('boss_mire_warden_defeated');
    this.playerState.setFlag('root_seal_restored');
    this.playerState.setFlag('clapper_collected');
    this.playerState.setFlag('title_purifier_of_mist');
    this.playerState.unlockLore('lore_mire_warden_memory');
    BossEncounterSystem.getInstance().completeEncounter();

    // Lưu checkpoint an toàn vĩnh viễn
    SaveManager.saveGame('CHIẾN THẮNG MIẾU CHUÔNG — PHONG ẤN HOÀN TẤT', 'broken_bell_shrine', 4500, 260);

    this.time.delayedCall(1500, () => {
      if (this.uiScene) {
        this.uiScene.hideBossSealBar();
      }
    });

    if (this.uiScene) {
      this.uiScene.showPopupMessage('✨ PHONG ẤN HOÀN TẤT! Kẻ Nuốt Tiếng Chuông đã yên nghỉ. Bạn nhận được [Trái Tim Mạch Rễ Cổ], danh hiệu [Người Thanh Tẩy Màn Sương] & Mảnh Ký Ức Cốt Truyện!');
    }
  }

  public getCurrentZoneId(): ZoneId {
    return this.currentZoneId;
  }

  public getPlayerState(): PlayerState {
    return this.playerState;
  }
}
