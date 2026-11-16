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
import { UIScene } from './UIScene';
import { PlayerState } from '../state/PlayerState';
import { SurvivalSystem } from '../systems/SurvivalSystem';
import { DialogueSystem } from '../systems/DialogueSystem';
import { InventorySystem } from '../systems/InventorySystem';
import { CraftingModal } from '../ui/CraftingModal';
import { JournalModal } from '../ui/JournalModal';
import { PauseModal } from '../ui/PauseModal';
import { GameOverModal } from '../ui/GameOverModal';
import { NPCEntity } from '../entities/NPCEntity';
import { VeilSystem } from '../systems/VeilSystem';
import { EchoSystem } from '../systems/EchoSystem';
import { TheListener } from '../entities/TheListener';
import { PuzzleSystem } from '../systems/PuzzleSystem';
import { EndingSystem } from '../systems/EndingSystem';
import { SaveManager, SaveData } from '../systems/SaveManager';
import { AudioManager, TerrainType } from '../audio/AudioManager';
import { ZoneConnectionRegistry } from '../world/ZoneConnectionRegistry';
import { WorldGatingSystem } from '../world/WorldGatingSystem';
import { FarmingSystem } from '../systems/FarmingSystem';
import { ZoneId, TransitionZone, FacingDirection } from '../types';

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
  private cachedLightMaskImage!: Phaser.GameObjects.Image;
  private fireflyGfx!: Phaser.GameObjects.Graphics;
  private fireflies: Firefly[] = [];
  private currentZoneId: ZoneId = 'fog_crossing';
  private previousZoneId: ZoneId = 'fog_crossing';

  // C4-13-16: Thời điểm kích hoạt gần nhất dòng suy nghĩ kể chuyện ở rào chắn phía Tây (cooldown 6 giây)
  private lastWestBarrierThoughtTime: number = 0;

  private keyQ!: Phaser.Input.Keyboard.Key;
  private keyESC!: Phaser.Input.Keyboard.Key;
  private keyM!: Phaser.Input.Keyboard.Key;
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

  // C4-132-05: Cảnh báo Bình Tâm sớm
  private lastEarlyComposureWarningTime: number = 0;

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
    this.lastZoneBannerTime = 0;
    this.lastBannerZoneId = '';
    this.cullingTimer = 0;
    this.isLanternGlowDrawn = false;
    this.firefliesDrawnCount = 0;
    this.lastFowScreenX = -9999;
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
  }

  public create(): void {
    // 1. Khởi tạo trạng thái dữ liệu & hệ thống sinh tồn
    this.playerState = PlayerState.getInstance();
    if (!this.isContinueMode) {
      this.playerState.reset();
    }
    this.survivalSystem = new SurvivalSystem();

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
          this.cameraSystem.shake(200, 0.004);
        } else if (z === 'silent_mire') {
          if (this.uiScene) {
            this.uiScene.showPopupMessage('🌫️ Lối vào Đầm Lầy Tĩnh Lặng (Silent Mire) đã khai mở!');
          }
        } else if (z === 'broken_bell_shrine') {
          if (this.uiScene) {
            this.uiScene.showPopupMessage('✨ Phong ấn Kết Giới Miếu Chuông đã tan biến! Lối vào Miếu Chuông Phế Tích đã mở.');
          }
          this.cameraSystem.shake(250, 0.005);
        }
      }
    };
    this.playerState.on('world_unlock_changed', onWorldUnlockChanged);
    this.events.once('shutdown', () => {
      this.playerState.off('world_unlock_changed', onWorldUnlockChanged);
    });

    // 4. Khởi tạo Satyr tại điểm xuất phát hoặc điểm tải lưu
    const initialZone = this.worldBuilder.getActiveZone();
    let spawnX = initialZone.defaultSpawn.x;
    let spawnY = initialZone.defaultSpawn.y;

    if (this.isContinueMode && this.continueSaveData) {
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

    // 5. Thiết lập va chạm vật lý với thế giới & mở rộng giới hạn không gian Vùng Lõi (C4-12-17)
    this.physics.world.setBounds(0, -250, 5000, 1400);
    this.physics.add.collider(this.player, this.worldBuilder.colliderGroup);
    if (this.isContinueMode) {
      this.unstuckPlayerFromColliders();
    }

    // 6. Khởi tạo hệ thống Camera (Chuẩn HD 1280×720 & Zoom 2.2x cho thế giới pixel art)
    this.cameras.main.setZoom(2.2);
    this.cameraSystem = new CameraSystem(this);
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
        this.player.resetAllInputState();
      }
      if (this.uiScene) {
        this.uiScene.setDialogueActive(false);
      }
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
      if (this.fogOfWarLayer) {
        this.fogOfWarLayer.destroy();
      }
      if (this.cachedLightMaskImage) {
        this.cachedLightMaskImage.destroy();
      }
      this.tweens.killAll();
      this.time.removeAllEvents();
      this.playerState.off('q03_resources_ready', onQ03ResourcesReady);
      this.playerState.off('lantern_empty', onLanternEmpty);
      if (this.keyESC) this.keyESC.removeAllListeners();
      if (this.keyM) this.keyM.removeAllListeners();
      if (this.keyQ) this.keyQ.removeAllListeners();
      if (this.uiScene && this.uiScene.events) {
        this.uiScene.events.off('ui_toggle_lantern', onUIToggleLantern);
        this.uiScene.events.off('ui_throw_lure', onUIThrowLure);
      }
    });

    // Cài đặt các phím tắt
    if (this.input && this.input.keyboard) {
      this.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
      this.keyESC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
      this.keyESC.on('down', () => this.handleESCPress());

      // Phím M bật/tắt âm thanh
      this.keyM = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
      this.keyM.on('down', () => this.handleMutePress());
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

    // 5. Hiển thị bảng Game Over sau 800ms khi hoạt ảnh ngã xuống kết thúc
    this.time.delayedCall(800, () => {
      if (this.uiScene) {
        this.uiScene.showGameOverModal(reason || 'Sinh lực đã cạn kiệt trong màn sương u ám...');
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
        if (this.playerState.stats.health <= 0) {
          this.playerState.stats.health = Math.max(50, this.playerState.stats.maxHealth * 0.5);
        }
        if (this.playerState.stats.composure <= 0) {
          this.playerState.stats.composure = Math.max(40, this.playerState.stats.maxComposure * 0.4);
        }
        this.playerState.emit('stats_changed', this.playerState.stats);

        // Khôi phục nhân vật
        this.player.respawn(data.playerPos.x, data.playerPos.y);
        this.player.stats.isLanternOn = data.stats.isLanternOn;
        this.player.stats.isHiding = false;
        this.player.lastSafePosition = { x: data.playerPos.x, y: data.playerPos.y };
        this.player.resetAllInputState();
        this.unstuckPlayerFromColliders();

        this.inventorySystem.syncDepletedState();
        this.worldBuilder.syncAllWorldGates(this.playerState);

        // Đưa thực thể AI về vị trí tuần tra mặc định
        if (this.listenerMonster) {
          this.listenerMonster.resetToPatrol();
          this.listenerMonster.setVelocity(0, 0);
        }

        // Đồng bộ phân khu & camera
        this.handleZoneLogic();
        this.cameraSystem.centerOn(data.playerPos.x, data.playerPos.y);
        this.worldBuilder.updateCameraCulling(this.cameras.main);

        // Đóng Game Over Modal
        if (this.uiScene) {
          this.uiScene.closeGameOverModal();
          this.uiScene.showPopupMessage('↺ Đã nạp lại điểm lưu gần nhất!');
        }
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
        this.uiScene.showPopupMessage('🔔 Một tiếng chuông đồng mơ hồ ngân vang từ phía Tây màn sương...');
      }
      this.cameraSystem.shake(400, 0.005);
    });

    this.time.delayedCall(2400, () => {
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

    // 2. Bà Lão Edda — Người Giữ Chuông: đứng tại khoảng sân thoáng bên trái Tháp Chuông (x: 710, y: 380)
    const edda = new NPCEntity(this, {
      id: 'npc_edda',
      name: 'Bà Lão Edda',
      title: 'Bà lão giữ chuông',
      x: 710,
      y: 380,
      dialogueKey: 'edda_intro',
      robeColor: 0x4a4f56,
      hoodColor: 0x8a7355
    });

    // 3. Neris — Thầy Thuốc Thảo Mộc: đứng trên mặt đất trước cửa nhà Thảo Mộc (x: 970, y: 215)
    const neris = new NPCEntity(this, {
      id: 'npc_neris',
      name: 'Neris',
      title: 'Người chữa thảo mộc',
      x: 970,
      y: 215,
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

    // 5. Finn — Cậu Bé Đưa Tin: đi lại nhẹ quanh rìa quảng trường Tháp Chuông (x: 760, y: 260)
    const finn = new NPCEntity(this, {
      id: 'npc_finn',
      name: 'Finn',
      title: 'Cậu bé đưa tin',
      x: 760,
      y: 260,
      dialogueKey: 'finn_chat',
      patrolMinX: 745,
      patrolMaxX: 775,
      patrolSpeed: 25
    });

    this.npcs.push(garth, edda, neris, bram, finn);

    // C4-13-17 & C4-132-03: Thiết lập va chạm vật lý giữa SatyrPlayer và toàn bộ 5 NPC làng Bellhollow (hộp chân gọn 22x14 px)
    if (this.npcCollider) {
      this.npcCollider.destroy();
      this.npcCollider = undefined;
    }
    if (this.player) {
      this.npcCollider = this.physics.add.collider(this.player, this.npcs);
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
    // Lớp sương mù động bao phủ toàn màn hình HD 1280×720
    this.fogOfWarLayer = this.add.renderTexture(0, 0, 1280, 720);
    this.fogOfWarLayer.setScrollFactor(0);
    this.fogOfWarLayer.setDepth(5000);

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

    // Image GameObject trung gian để erase sương mù bằng texture lưu đệm mà không tạo mới mỗi khung hình
    this.cachedLightMaskImage = new Phaser.GameObjects.Image(this, 0, 0, 'cached_light_mask_normal');

    // Quầng sáng ấm áp phát ra từ Đèn Lồng của Satyr
    this.lanternGlowGfx = this.add.graphics();
    this.lanternGlowGfx.setScrollFactor(0);
    this.lanternGlowGfx.setDepth(5020);
  }

  private setupFireflies(): void {
    this.fireflyGfx = this.add.graphics();
    this.fireflyGfx.setDepth(5050); // Nằm trên sương mù nhẹ để người chơi định vị trong đêm

    this.fireflies = [];

    // Danh sách các điểm tụ đom đóm chính
    const clusters: Array<{ x: number; y: number; count: number; colors: number[]; radius: number }> = [
      // 1. Ba Cột Đá Cổ Ngữ (Silent Mire) - Ánh sáng dạ quang huyền bí
      { x: 3400, y: 220, count: 8, colors: [0x5dade2, 0x85c1e9], radius: 36 }, // Cột Trăng
      { x: 3520, y: 360, count: 8, colors: [0x58d68d, 0x82e0aa], radius: 36 }, // Cột Rễ
      { x: 3640, y: 220, count: 8, colors: [0xaf7ac5, 0xbb8fce], radius: 36 }, // Cột Con Mắt

      // 2. Lửa Trại & Giếng Làng Bellhollow - Tàn lửa ấm áp & đom đóm ven nước
      { x: 850, y: 260, count: 10, colors: [0xf39c12, 0xf1c40f, 0xe67e22], radius: 42 },
      { x: 720, y: 380, count: 4, colors: [0x76d7c4, 0xa3e4d7], radius: 28 },

      // 3. Các điểm tài nguyên thảo dược & nhựa cây (Bellhollow & Crooked Path)
      { x: 1040, y: 180, count: 4, colors: [0x2ecc71, 0x58d68d], radius: 25 },
      { x: 880, y: 200, count: 4, colors: [0xf4d03f, 0xf7dc6f], radius: 25 },
      { x: 1900, y: 180, count: 3, colors: [0xa2d9ce, 0x73c6b6], radius: 22 },
      { x: 2350, y: 420, count: 3, colors: [0xa2d9ce, 0x73c6b6], radius: 22 },

      // 4. Các điểm tài nguyên đầm lầy hoang vu
      { x: 3050, y: 280, count: 4, colors: [0x48c9b0, 0x1abc9c], radius: 26 },
      { x: 3350, y: 380, count: 4, colors: [0x48c9b0, 0x1abc9c], radius: 26 }
    ];

    for (const cluster of clusters) {
      for (let i = 0; i < cluster.count; i++) {
        const angle = (i / cluster.count) * Math.PI * 2 + Math.random() * 0.5;
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
      }
    }
  }

  private updateFireflies(time: number): void {
    if (!this.fireflyGfx) return;

    const cam = this.cameras.main;
    const viewLeft = cam.worldView.x - 60;
    const viewRight = cam.worldView.right + 60;
    const viewTop = cam.worldView.y - 60;
    const viewBottom = cam.worldView.bottom + 60;

    let drawnCount = 0;

    for (let i = 0; i < this.fireflies.length; i++) {
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
      (this.gameOverModal && this.gameOverModal.isOpen);

    if (!isUIBusy) {
      this.player.update(time, delta);

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
          }
        }
        if (this.journalModal && this.journalModal.isOpen) {
          if (this.player.isJournalRequested() || this.player.isPauseRequested()) {
            this.journalModal.close();
          }
        }
      }
    }

    // Cập nhật camera
    this.cameraSystem.update();

    // Cập nhật hệ thống sinh tồn (PlayerState.stats là nguồn dữ liệu duy nhất)
    const inDeepFog = this.currentZoneId === 'fog_crossing' || this.currentZoneId === 'silent_mire' || this.currentZoneId === 'deep_forest' || this.isAct5ChaseActive;
    this.survivalSystem.update(dt, this.player.x, this.player.y, inDeepFog);

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
      this.veilSystem.update(time, delta, inDeepFog, this.currentZoneId, this.player ? this.player.x : undefined);
    }

    // Cập nhật âm thanh khí quyển & hiệu ứng lọc The Veil (PASS G5)
    this.audioManager.updateVeilFilter(inDeepFog, this.playerState.stats.composure);
    this.audioManager.setWindIntensity(inDeepFog ? 1.4 : 0.6);

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

    // Xử lý âm thanh bật/tắt đèn lồng
    if (this.player.stats.isLanternOn !== this.lastLanternState) {
      this.lastLanternState = this.player.stats.isLanternOn;
      this.audioManager.playLanternToggle(this.lastLanternState);
    }

    // C4-132-05: Nhịp tim & cảnh báo Bình Tâm sớm khi suy giảm xuống mức nguy hiểm
    if (this.playerState.stats.composure < 40 && !this.isAct5ChaseActive) {
      this.audioManager.setHeartbeatActive(true, 750);
      if (this.playerState.stats.composure <= 25 && this.playerState.stats.composure > 0) {
        const now = Date.now();
        if (now - this.lastEarlyComposureWarningTime > 12000) {
          this.lastEarlyComposureWarningTime = now;
          if (this.uiScene) {
            this.uiScene.showPopupMessage('⚠️ Bình Tâm đang xuống thấp! Hãy bật Đèn Lồng [F] hoặc tìm nguồn lửa ấm áp.');
          }
        }
      }
    } else if (!this.isAct5ChaseActive && this.playerState.stats.composure >= 50) {
      this.audioManager.setHeartbeatActive(false);
    }

    // Cập nhật hiện tượng The Echo (Tiếng Vọng) (PASS G3)
    this.echoSystem.update(this.player.x, this.player.y, (msg: string) => {
      if (this.uiScene) {
        this.uiScene.showPopupMessage(msg);
      }
    });

    // Cập nhật Act 0 tutorial / mở đầu
    this.updateAct0Progression();

    // Cập nhật AI của The Listener (PASS G3 & G4 Chase)
    this.updateTheListenerAI(delta);

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

    // C4-13-02: Luôn bảo đảm thuộc tính visible và active của nhân vật được giữ bật khi không ẩn nấp
    if (this.player && !this.player.stats.isHiding) {
      if (!this.player.visible) this.player.setVisible(true);
      if (!this.player.active) this.player.setActive(true);
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

    // Kiểm tra NPC và tương tác gần
    this.handleInteractions(delta);

    // Cập nhật hiệu ứng sương mù động & đom đóm (PASS T17 & C4-12-29)
    this.updateFogOfWar();
    this.updateFireflies(time);

    // Cập nhật F4 Debug Overlay
    this.debugOverlay.update(this.currentZoneId);
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
    if (!this.listenerMonster) return;
    if ((this.endingSystem && this.endingSystem.isEndingActive) || this.isGameOverPending || (this.player && this.player.isDead())) {
      this.listenerMonster.setVelocity(0, 0);
      this.listenerMonster.ai.resetToPatrol();
      return;
    }

    this.listenerMonster.update(delta, this.player.x, this.player.y, this.player.stats.isHiding, this.player.isDead());

    // C4-13-05 & C4-132-05: Toàn bộ Làng Bellhollow và khu vực cổng làng là Khu Vực An Toàn (Safe Zone)
    const isPlayerInSafeZone = (this.currentZoneId === 'bellhollow' && this.player.x <= 1620) || this.currentZoneId === 'sanctuary_farm' || this.currentZoneId === 'fog_crossing';

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
        this.emitNoiseWave(this.player.x, this.player.y, 1.0);
        this.listenerMonster.hearSound(this.player.x, this.player.y, 1.0);
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

  // C4-132-01: Xử lý tác động thực tế của đòn vung gậy (phát âm thanh cảnh báo & quét trúng quái vật)
  private handlePlayerAttackHitbox(hitbox: { x: number; y: number; radius: number; facing: string; playerX: number; playerY: number }): void {
    // 1. Phát xung âm thanh cảnh báo để The Listener trong phạm vi nghe thấy
    this.emitNoiseWave(hitbox.playerX, hitbox.playerY, 1.2);
    if (this.listenerMonster && typeof this.listenerMonster.hearSound === 'function') {
      this.listenerMonster.hearSound(hitbox.playerX, hitbox.playerY, 1.2);
    }

    // 2. Quét thực thể The Listener trong tầm quét bán kính 42px
    if (this.listenerMonster && this.listenerMonster.active && this.listenerMonster.body) {
      const distToListener = Math.hypot(this.listenerMonster.x - hitbox.x, this.listenerMonster.y - hitbox.y);
      if (distToListener <= hitbox.radius + 24) {
        const now = Date.now();
        // Cooldown chống spam stagger 5 giây
        if (now - this.lastMonsterStaggerTime >= 5000) {
          this.lastMonsterStaggerTime = now;

          // Hiệu ứng tia sáng va chạm (Clash hit spark)
          this.createHitSpark(hitbox.x, hitbox.y);

          // Đẩy lùi nhẹ (Knockback) và làm khựng (Stagger 500ms)
          const angle = Math.atan2(this.listenerMonster.y - hitbox.playerY, this.listenerMonster.x - hitbox.playerX);
          const knockbackSpeed = 120;
          const body = this.listenerMonster.body as Phaser.Physics.Arcade.Body;
          body.setVelocity(Math.cos(angle) * knockbackSpeed, Math.sin(angle) * knockbackSpeed);

          // Kích hoạt hồi chiêu tấn công để quái vật không phản đòn ngay
          this.listenerMonster.triggerAttackCooldown(1800);

          // Sau 500ms dừng khựng lại
          this.time.delayedCall(500, () => {
            if (this.listenerMonster && this.listenerMonster.active && this.listenerMonster.body) {
              (this.listenerMonster.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
            }
          });

          if (this.uiScene) {
            this.uiScene.showPopupMessage('Đòn gậy trúng đích! Kẻ Lắng Nghe bị khựng lại!');
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

    // Báo động The Listener chạy tới vị trí mồi ném
    if (this.listenerMonster) {
      this.listenerMonster.hearSound(x, y, 2.5);
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
    if (zoneId === 'deep_forest') {
      this.physics.world.setBounds(0, -700, 5000, 1850);
      this.cameraSystem.setWorldBounds({ x: 0, y: -700, width: 5000, height: 1850 });
    } else {
      this.physics.world.setBounds(0, -250, 5000, 1400);
      this.cameraSystem.setWorldBounds({ x: 0, y: -250, width: 5000, height: 1400 });
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

      if (this.veilSystem) {
        this.veilSystem.triggerZoneTransitionMist(350);
      }
      this.worldBuilder.hibernateDistantZoneObjects(trans.toZone);

      this.applyCameraBoundsForZone(trans.toZone);
      this.worldBuilder.updateCameraCulling(this.cameras.main);

      if (!this.player.stats.isHiding) {
        this.player.setVisible(true);
        this.player.setActive(true);
      }

      this.currentZoneId = trans.toZone;
      this.previousZoneId = trans.toZone;
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

    // C4-13-20: Màn sương chuyển cảnh mượt mà (Mist Fade Transition 0.35s)
    if (this.veilSystem) {
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

    // C4-13-02: Bảo đảm thuộc tính visible và active của nhân vật luôn được giữ bật khi đi qua mọi ranh giới vùng
    if (!this.player.stats.isHiding) {
      this.player.setVisible(true);
      this.player.setActive(true);
    }

    // Cập nhật âm thanh & phân khu
    this.currentZoneId = trans.toZone;
    this.previousZoneId = trans.toZone;
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
    if (zoneId === 'broken_bell_shrine') {
      if (x >= 800 && x <= 1120 && y >= 320 && y <= 500) return 'stone';
      return 'dirt';
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
    if (zoneId === 'crooked_path' || zoneId === 'outer_woods' || zoneId === 'deep_forest') {
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
      for (const npc of this.npcs) {
        npc.setNearby(false);
      }
      return;
    }

    // C4-13-01: Ưu tiên tối thượng cho trạng thái ẩn nấp (Hiding & Stealth Stance)
    // Khi đang núp, người chơi bấm [E] hoặc phím di chuyển WASD/Mũi tên (sau 0.3s) sẽ thoát ra ngay lập tức
    if (this.player.stats.isHiding) {
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
          y: npc.y - 50,
          proximityAlpha,
          action: () => {
            this.player.playInteract();
            let dKey = npc.spec.dialogueKey;
            if (npc.spec.id === 'npc_garth') {
              if (!this.playerState.hasFlag('talked_to_villagers')) {
                dKey = 'garth_warning';
              } else if (!this.playerState.hasFlag('talked_to_edda')) {
                dKey = 'garth_reminder_edda';
              } else if (!this.playerState.isEastGateUnlocked()) {
                dKey = 'garth_reminder_gate_locked';
              } else {
                dKey = 'garth_east_gate_open';
              }
            } else if (npc.spec.id === 'npc_edda') {
              if (!this.playerState.hasFlag('talked_to_edda')) {
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
              if (!this.playerState.hasFlag('talked_to_neris')) {
                dKey = 'neris_intro';
              } else if (!this.playerState.isEastGateUnlocked()) {
                dKey = 'neris_heal_locked';
              } else {
                dKey = 'neris_heal_open';
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
      const baseWorldName = rawPrompt.replace(/^\[E\]\s*/, '');
      const promptText = isWithinActionRange ? `[E] ${baseWorldName}` : baseWorldName;
      candidates.push({
        dist,
        triggerDist: worldTriggerDist,
        promptText,
        x: nearby.x,
        y: nearby.y,
        proximityAlpha: isWithinActionRange ? 0.9 : 0.35,
        action: () => {
          this.executeMapInteraction(nearby.actionId, nearby.name);
        }
      });
    }

    // C4-13-11: Chọn duy nhất ứng viên có khoảng cách gần người chơi nhất (Nearest-Neighbor Candidate)
    if (candidates.length === 0) {
      if (this.uiScene) {
        this.uiScene.setInteractionPrompt(null);
      }
      return;
    }

    candidates.sort((a, b) => a.dist - b.dist);
    const best = candidates[0];
    const isWithinActionRange = best.dist <= best.triggerDist;

    if (this.uiScene) {
      this.uiScene.setInteractionPrompt(best.promptText, best.x, best.y, best.proximityAlpha);
    }

    if (isWithinActionRange && isEBuffered && !this.dialogueSystem.isActive) {
      this.lastEKeyPressTime = 0;
      best.action();
    }
  }

  private executeMapInteraction(actionId: string, name: string): void {
    this.audioManager.playInteract();
    if (actionId === 'collect_bell_tongue') {
      this.player.playGather();
    } else if (actionId !== 'hide_player') {
      this.player.playInteract();
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
          this.uiScene.showPopupMessage('✔ Cổng Đông đã mở! Đường Mòn Quanh Co (The Crooked Path) đang ở ngay phía trước.');
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

    if (actionId === 'open_storage') {
      if (this.uiScene) {
        this.uiScene.showPopupMessage('📦 Rương Trú Ẩn Nông Trại: Chứa hạt giống thảo dược và nông cụ dự trữ.');
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
    const isLanternLit = this.player.stats.isLanternOn && this.player.stats.lanternOil > 0;
    const targetBaseRadius = isLanternLit ? LANTERN_RADIUS_NORMAL : LANTERN_RADIUS_DIM;

    // Chuyển đổi bán kính mượt mà (smooth lerp 0.18) chống giật nấc/nhấp nháy khi bấm [F] liên tục
    this.currentLanternRadius = Phaser.Math.Linear(this.currentLanternRadius, targetBaseRadius, 0.18);
    if (Math.abs(this.currentLanternRadius - targetBaseRadius) < 0.4) {
      this.currentLanternRadius = targetBaseRadius;
    }

    // Bán kính ánh sáng chuẩn HD 1280×720 zoom 2.2x
    const radius = this.currentLanternRadius * cam.zoom * 0.82;

    const lanternWorld = this.player.getLanternWorldPosition();
    const lightWorldX = (isLanternLit && lanternWorld.isVisible) ? lanternWorld.x : this.player.x;
    const lightWorldY = (isLanternLit && lanternWorld.isVisible) ? lanternWorld.y : (this.player.y - 22);

    // Tính toán tọa độ chiếu chuẩn xác tuyệt đối trên màn hình dựa trực tiếp trên camera scroll và zoom
    // (Khắc phục triệt để lỗi lệnh vùng sáng lệch sang góc màn hình khi chuyển vùng hoặc giới hạn camera)
    const screenX = Math.round(cam.width * 0.5 + (lightWorldX - (cam.scrollX + cam.width * 0.5)) * cam.zoom);
    const screenY = Math.round(cam.height * 0.5 + (lightWorldY - (cam.scrollY + cam.height * 0.5)) * cam.zoom);

    // Kiểm tra thay đổi (Dirty Checking) để tránh clear/fill/erase RenderTexture 1280×720 liên tục khi đứng yên
    const isFowDirty =
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

      this.fogOfWarLayer.clear();
      this.fogOfWarLayer.fill(fogColor, fogAlpha);

      // C4-12-07 / C4-13-04: Tối ưu hiệu năng bằng mặt nạ ánh sáng lưu đệm (Cached Light Mask - GPU Stamp)
      const maskKey = isLanternLit ? 'cached_light_mask_normal' : 'cached_light_mask_dim';
      if (this.cachedLightMaskImage.texture.key !== maskKey) {
        this.cachedLightMaskImage.setTexture(maskKey);
      }
      const maskBaseSize = isLanternLit ? 512 : 256;
      const targetScale = (radius * 2.8) / maskBaseSize;
      this.cachedLightMaskImage.setScale(targetScale);
      this.cachedLightMaskImage.setPosition(screenX, screenY);

      this.fogOfWarLayer.erase(this.cachedLightMaskImage);
    }

    // Hiệu ứng ánh sáng đèn lồng hổ phách ấm áp (C4-13-06: Chuyển sắc mềm mại 3 tầng, loại bỏ viền cắt gắt)
    if (isLanternLit && this.currentLanternRadius > LANTERN_RADIUS_DIM + 3) {
      this.lanternGlowGfx.clear();
      const flicker = Math.sin(this.time.now * 0.007) * 0.02 + Math.cos(this.time.now * 0.013) * 0.015;
      const glowFactor = (this.currentLanternRadius - LANTERN_RADIUS_DIM) / (LANTERN_RADIUS_NORMAL - LANTERN_RADIUS_DIM);
      const glowAlpha = Math.max(0.03, Math.min(0.14, (0.09 + flicker) * glowFactor));

      // Tầng 1: Quầng ấm ngoài cùng mờ ảo
      this.lanternGlowGfx.fillStyle(0xe67e22, glowAlpha * 0.22);
      this.lanternGlowGfx.fillCircle(screenX, screenY, radius * 0.82);

      // Tầng 2: Vùng sáng hổ phách trung tâm
      this.lanternGlowGfx.fillStyle(0xf39c12, glowAlpha * 0.38);
      this.lanternGlowGfx.fillCircle(screenX, screenY, radius * 0.50);

      // Tầng 3: Lõi sáng ấm dịu gần thân đèn
      this.lanternGlowGfx.fillStyle(0xffe082, glowAlpha * 0.55);
      this.lanternGlowGfx.fillCircle(screenX, screenY, radius * 0.24);
      this.isLanternGlowDrawn = true;
    } else if (this.isLanternGlowDrawn) {
      this.lanternGlowGfx.clear();
      this.isLanternGlowDrawn = false;
    }
  }
}
