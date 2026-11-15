import * as Phaser from 'phaser';
import { 
  SCENE_GAME, 
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
import { NPCEntity } from '../entities/NPCEntity';
import { VeilSystem } from '../systems/VeilSystem';
import { EchoSystem } from '../systems/EchoSystem';
import { TheListener } from '../entities/TheListener';
import { PuzzleSystem } from '../systems/PuzzleSystem';
import { EndingSystem } from '../systems/EndingSystem';
import { SaveManager, SaveData } from '../systems/SaveManager';
import { AudioManager, TerrainType } from '../audio/AudioManager';
import { ZoneId } from '../types';

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
  private endingSystem!: EndingSystem;

  // Hệ thống Kinh Dị & AI (PASS G3 + G4)
  private veilSystem!: VeilSystem;
  private echoSystem!: EchoSystem;
  private listenerMonster!: TheListener;
  private puzzleSystem!: PuzzleSystem;

  private npcs: NPCEntity[] = [];
  private fogOfWarLayer!: Phaser.GameObjects.RenderTexture;
  private lightMaskGfx!: Phaser.GameObjects.Graphics;
  private lastFowScreenX: number = -9999;
  private lastFowScreenY: number = -9999;
  private lastFowRadius: number = -9999;
  private lastFowColor: number = -9999;
  private lastFowAlpha: number = -9999;
  private lanternGlowGfx!: Phaser.GameObjects.Graphics;
  private fireflyGfx!: Phaser.GameObjects.Graphics;
  private fireflies: Firefly[] = [];
  private currentZoneId: ZoneId = 'fog_crossing';
  private previousZoneId: ZoneId = 'fog_crossing';

  private keyQ!: Phaser.Input.Keyboard.Key;
  private keyESC!: Phaser.Input.Keyboard.Key;
  private keyM!: Phaser.Input.Keyboard.Key;
  private stepNoiseTimer: number = 0;

  // Hệ thống âm thanh (Web Audio API)
  private audioManager!: AudioManager;
  private footstepTimer: number = 0;
  private lastLanternState: boolean = false;

  // Dữ liệu chuyển giao phiên & cốt truyện
  private isContinueMode: boolean = false;
  private continueSaveData: SaveData | null = null;
  private isAct0IntroPending: boolean = false;
  private act0TutorialDone: boolean = false;
  private act0EchoGfx?: Phaser.GameObjects.Graphics;
  private isAct5ChaseActive: boolean = false;

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

    // 4. Khởi tạo Satyr tại điểm xuất phát hoặc điểm tải lưu
    const initialZone = this.worldBuilder.getActiveZone();
    let spawnX = initialZone.defaultSpawn.x;
    let spawnY = initialZone.defaultSpawn.y;

    if (this.isContinueMode && this.continueSaveData) {
      spawnX = this.continueSaveData.playerPos.x;
      spawnY = this.continueSaveData.playerPos.y;
    }

    this.player = new SatyrPlayer(this, spawnX, spawnY);
    this.player.stats.isLanternOn = this.playerState.stats.isLanternOn;

    // 5. Thiết lập va chạm vật lý với thế giới
    this.physics.add.collider(this.player, this.worldBuilder.colliderGroup);

    // 6. Khởi tạo hệ thống Camera (Chuẩn HD 1280×720 & Zoom 2.2x cho thế giới pixel art)
    this.cameras.main.setZoom(2.2);
    this.cameraSystem = new CameraSystem(this);
    this.cameraSystem.follow(this.player);
    this.cameraSystem.setWorldBounds({
      x: 0,
      y: -250,
      width: 5000,
      height: 1100
    });

    // 7. Tạo các thực thể NPC làng Bellhollow
    this.spawnNPCs();

    // 8. Khởi tạo các hệ thống G2 & G4 (Đối thoại, Túi đồ, Chế tạo, Nhật ký, Tạm dừng, Ending)
    this.dialogueSystem = new DialogueSystem(this);
    this.dialogueSystem.onDialogueStart = () => {
      if (this.uiScene) {
        this.uiScene.setDialogueActive(true);
      }
      for (const npc of this.npcs) {
        npc.setNearby(false);
      }
    };
    this.dialogueSystem.onDialogueEnd = () => {
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

    // GATE 1C: Khởi tạo PauseModal trên UIScene ở Zoom 1.0 cố định
    this.pauseModal = new PauseModal(this.uiScene, {
      onResume: () => {},
      onSaveManual: () => this.handleSaveManual(),
      onReloadCheckpoint: () => this.handleReloadCheckpoint()
    });
    this.pauseModal.onOpen = () => {
      this.uiScene.setDialogueActive(true);
    };
    this.pauseModal.onClose = () => {
      this.uiScene.setDialogueActive(false);
    };
    this.uiScene.pauseModal = this.pauseModal;

    // 11. Công cụ kiểm toán kỹ thuật F4 Debug (Graphics trên GameScene, Text trên UIScene Zoom 1.0)
    this.debugOverlay = new DebugOverlay(this, this.player, this.uiScene);

    // 12. Tạo lớp phủ Sương Mù Động (Dynamic Fog of War) & Đom Đóm Lập Lòe (PASS T17)
    this.setupFogOfWar();
    this.setupFireflies();

    // 13. Khởi tạo hệ thống Âm thanh Khí quyển (PASS G5)
    this.audioManager = AudioManager.getInstance();
    this.audioManager.startWindAmbience();

    // Dọn dẹp âm thanh khi tắt scene
    this.events.on('shutdown', () => {
      this.audioManager.setHeartbeatActive(false);
    });

    // Cài đặt các phím tắt
    if (this.input && this.input.keyboard) {
      this.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
      this.keyESC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
      this.keyESC.on('down', () => this.handleESCPress());

      // Phím M bật/tắt âm thanh
      this.keyM = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
      this.keyM.on('down', () => {
        const muted = this.audioManager.toggleMute();
        if (this.uiScene) {
          this.uiScene.showPopupMessage(muted ? '🔇 Đã tắt toàn bộ âm thanh [Phím M]' : '🔊 Đã bật âm thanh [Phím M]');
        }
      });
    }

    // 14. Xử lý mở đầu Act 0 hoặc hiển thị tiếp tục
    if (this.isAct0IntroPending) {
      this.startAct0Intro();
    } else {
      this.time.delayedCall(500, () => {
        if (this.uiScene) {
          const zone = this.worldBuilder.getActiveZone();
          this.uiScene.showZoneBanner(zone.atmosphere);
          this.uiScene.showPopupMessage('▶ Đã tiếp tục chuyến hành trình!');
        }
      });
    }
  }

  private handleESCPress(): void {
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

  private handleSaveManual(): boolean {
    const zone = this.worldBuilder.getActiveZone();
    const zoneName = zone ? zone.atmosphere.titleVietnamese : this.currentZoneId;
    return SaveManager.saveGame(`LƯU THỦ CÔNG (${zoneName})`, this.currentZoneId, this.player.x, this.player.y);
  }

  private handleReloadCheckpoint(): void {
    const data = SaveManager.loadGame();
    if (data) {
      this.player.setPosition(data.playerPos.x, data.playerPos.y);
      this.player.stats.isLanternOn = data.stats.isLanternOn;
      this.handleZoneLogic();
      if (this.uiScene) {
        this.uiScene.showPopupMessage('↺ Đã nạp lại điểm lưu gần nhất!');
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
    const garth = new NPCEntity(this, {
      id: 'npc_garth',
      name: 'Garth (Dân Làng)',
      title: 'Dân Làng Cảnh Giác',
      x: 530,
      y: 220,
      dialogueKey: 'garth_warning',
      robeColor: 0x3e4a3d,
      hoodColor: 0x5a3e28
    });

    const edda = new NPCEntity(this, {
      id: 'npc_edda',
      name: 'Bà Lão Edda',
      title: 'Người Giữ Chuông',
      x: 790,
      y: 330,
      dialogueKey: 'edda_intro',
      robeColor: 0x4a4f56,
      hoodColor: 0x8a7355
    });

    const neris = new NPCEntity(this, {
      id: 'npc_neris',
      name: 'Neris',
      title: 'Người Chữa Thảo Mộc',
      x: 970,
      y: 130,
      dialogueKey: 'neris_intro',
      robeColor: 0x27493a,
      hoodColor: 0x3d7055
    });

    this.npcs.push(garth, edda, neris);
  }

  private spawnTheListener(): void {
    // Lộ trình tuần tra của The Listener trong rừng The Crooked Path và ranh giới đầm lầy
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
      if (!this.player.stats.isHiding && !this.player.isHurt() && !this.player.isDead()) {
        // Tấn công gây sát thương và hoảng loạn
        this.playerState.stats.health = Math.max(0, this.playerState.stats.health - 25);
        this.playerState.stats.composure = Math.max(5, this.playerState.stats.composure - 30);
        this.cameraSystem.shake(250, 0.015);
        this.cameraSystem.flash(200, 180, 0, 0);

        if (this.uiScene) {
          this.uiScene.showPopupMessage('⚠️ BẠN ĐÃ BỊ KẺ LẮNG NGHE TẤN CÔNG! Hãy nấp ngay vào Thân Cây Rỗng!');
        }

        // Đẩy Satyr lùi lại
        const pushAngle = Math.atan2(this.player.y - this.listenerMonster.y, this.player.x - this.listenerMonster.x);
        this.player.setPosition(this.player.x + Math.cos(pushAngle) * 45, this.player.y + Math.sin(pushAngle) * 45);

        if (this.playerState.stats.health <= 0) {
          this.player.die();
        } else {
          this.player.playHurt();
        }
      }
    });
  }

  private setupFogOfWar(): void {
    // Lớp sương mù động bao phủ toàn màn hình HD 1280×720
    this.fogOfWarLayer = this.add.renderTexture(0, 0, 1280, 720);
    this.fogOfWarLayer.setScrollFactor(0);
    this.fogOfWarLayer.setDepth(5000);

    // Đối tượng Graphics mặt nạ ánh sáng tái sử dụng duy nhất (BUG-06 Fix - Không cấp phát rác mỗi frame)
    this.lightMaskGfx = this.make.graphics();

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
    this.fireflyGfx.clear();

    const cam = this.cameras.main;
    const viewLeft = cam.worldView.x - 60;
    const viewRight = cam.worldView.right + 60;
    const viewTop = cam.worldView.y - 60;
    const viewBottom = cam.worldView.bottom + 60;

    for (let i = 0; i < this.fireflies.length; i++) {
      const f = this.fireflies[i];

      // Chuyển động lơ lửng hình sin mượt mà
      f.x = f.anchorX + Math.sin(time * 0.001 * f.speed + f.phaseX) * f.radius;
      f.y = f.anchorY + Math.cos(time * 0.0013 * f.speed + f.phaseY) * (f.radius * 0.65);

      // Bỏ qua nếu nằm ngoài tầm nhìn camera
      if (f.x < viewLeft || f.x > viewRight || f.y < viewTop || f.y > viewBottom) {
        continue;
      }

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
  }

  public update(time: number, delta: number): void {
    const dt = delta / 1000;

    // GATE 1C: Đóng băng toàn bộ thế giới trò chơi khi Pause Menu đang mở
    if (this.pauseModal && this.pauseModal.isOpen) {
      if (this.player && this.player.body) {
        (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
        this.player.playIdle();
      }
      if (this.debugOverlay) {
        this.debugOverlay.update(this.currentZoneId);
      }
      return;
    }

    // Khóa điều khiển nếu Ending đang chạy hoặc UI modal mở
    const isUIBusy = 
      this.endingSystem.isEndingActive ||
      this.dialogueSystem.isActive || 
      this.craftingModal.isOpen || 
      this.journalModal.isOpen;

    if (!isUIBusy) {
      this.player.update(time, delta);
    } else {
      (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
      this.player.playIdle();
    }

    // Cập nhật camera
    this.cameraSystem.update();

    // Cập nhật hệ thống sinh tồn
    const inDeepFog = this.currentZoneId === 'fog_crossing' || this.currentZoneId === 'silent_mire' || this.isAct5ChaseActive;
    this.survivalSystem.update(dt, this.player.x, this.player.y, inDeepFog);

    this.playerState.stats.isLanternOn = this.player.stats.isLanternOn;
    this.playerState.stats.isSprinting = this.player.stats.isSprinting;

    // Cập nhật The Veil (Màn Sương) và hiệu ứng tâm lý (PASS G3)
    if (!this.endingSystem || !this.endingSystem.isEndingActive) {
      this.veilSystem.update(time, delta, inDeepFog);
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
        let terrain: TerrainType = 'grass';
        if (this.currentZoneId === 'silent_mire') terrain = 'mud';
        else if (this.currentZoneId === 'bellhollow') terrain = 'dirt';
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

    // Nhịp tim hoảng loạn khi Bình Tâm suy giảm nghiêm trọng
    if (this.playerState.stats.composure < 40 && !this.isAct5ChaseActive) {
      this.audioManager.setHeartbeatActive(true, 750);
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

    // Phát hiện và xử lý phân khu
    this.handleZoneLogic();

    // Kiểm tra NPC và tương tác gần
    this.handleInteractions();

    // Cập nhật hiệu ứng sương mù động & đom đóm (PASS T17)
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
    if (this.endingSystem && this.endingSystem.isEndingActive) {
      this.listenerMonster.setVelocity(0, 0);
      return;
    }

    this.listenerMonster.update(delta, this.player.x, this.player.y, this.player.stats.isHiding);

    // Nếu người chơi chạy nhanh (Sprint) tạo ra tiếng ồn bước chân
    if (this.player.stats.isSprinting) {
      this.stepNoiseTimer += delta;
      if (this.stepNoiseTimer >= 350) {
        this.stepNoiseTimer = 0;
        this.emitNoiseWave(this.player.x, this.player.y, 1.0);
        this.listenerMonster.hearSound(this.player.x, this.player.y, 1.0);
      }
    }
  }

  private emitNoiseWave(x: number, y: number, _vol: number): void {
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
      onComplete: () => wave.destroy()
    });
  }

  private handleNoiseLureThrow(): void {
    if (this.keyQ && Phaser.Input.Keyboard.JustDown(this.keyQ)) {
      if (this.playerState.getItemCount('item_noise_lure') > 0) {
        this.playerState.removeItem('item_noise_lure', 1);
        this.throwNoiseLure();
      } else {
        if (this.uiScene) {
          this.uiScene.showPopupMessage('Không có Mồi Tạo Tiếng Động! Hãy chế tạo bằng [Phím I]');
        }
      }
    }
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
      onComplete: () => spark.destroy()
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

  private handleZoneLogic(): void {
    const footPos = this.player.getFootPosition();
    this.currentZoneId = this.worldBuilder.detectCurrentZone(footPos);

    if (this.currentZoneId !== this.previousZoneId) {
      this.previousZoneId = this.currentZoneId;
      const zoneData = this.worldBuilder.getActiveZone();
      if (zoneData && this.uiScene) {
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

  private handleInteractions(): void {
    // PASS T13, T15, T16: Khi hộp thoại đang mở hoặc Modal (Chế tạo, Sổ tay, Tạm dừng) mở, BẮT BUỘC ẩn ngay lập tức nhãn gợi ý và nhãn NPC
    if (this.dialogueSystem.isActive || this.craftingModal.isOpen || this.journalModal.isOpen || this.pauseModal.isOpen) {
      if (this.uiScene) {
        this.uiScene.setDialogueActive(true);
      }
      for (const npc of this.npcs) {
        npc.setNearby(false);
      }
      return;
    }

    const px = this.player.x;
    const py = this.player.y;

    // 1. Kiểm tra NPC gần
    let nearbyNPC: NPCEntity | null = null;
    for (const npc of this.npcs) {
      const dist = Math.hypot(px - npc.spec.x, py - npc.spec.y);
      const isNear = dist <= 42;
      npc.setNearby(isNear);
      if (isNear) {
        nearbyNPC = npc;
      }
    }

    if (nearbyNPC) {
      if (this.uiScene) {
        this.uiScene.setInteractionPrompt(`[E] Trò chuyện với ${nearbyNPC.spec.name}`);
      }

      if (this.player.isInteractRequested() && !this.dialogueSystem.isActive) {
        let dKey = nearbyNPC.spec.dialogueKey;
        if (nearbyNPC.spec.id === 'npc_edda' && this.playerState.hasFlag('talked_to_edda')) {
          dKey = 'edda_reminder';
        } else if (nearbyNPC.spec.id === 'npc_neris' && this.playerState.hasFlag('talked_to_neris')) {
          dKey = 'neris_heal';
        }
        this.dialogueSystem.startDialogue(dKey);
      }
      return;
    }

    // 2. Kiểm tra thu hoạch tài nguyên (InventorySystem)
    if (this.player.isInteractRequested()) {
      const harvestResult = this.inventorySystem.checkHarvestNearby(px, py, 34);
      if (harvestResult) {
        if (this.uiScene) {
          this.uiScene.showPopupMessage(`Đã thu thập: ${harvestResult.itemName}`);
        }
        return;
      }
    }

    // 3. Kiểm tra các vật thể và câu đố trên bản đồ
    const nearby = this.worldBuilder.checkInteractableNearby(this.player.getFootPosition(), 42);
    if (nearby) {
      if (this.uiScene) {
        this.uiScene.setInteractionPrompt(nearby.promptText);
      }

      if (this.player.isInteractRequested()) {
        this.executeMapInteraction(nearby.actionId, nearby.name);
      }
    } else {
      if (this.uiScene) {
        this.uiScene.setInteractionPrompt(null);
      }
    }
  }

  private executeMapInteraction(actionId: string, name: string): void {
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
          this.uiScene.showPopupMessage('🔔 Satyr gắn Lưỡi Chuông Đồng vào quả chuông cổ làng Bellhollow...');
        }
        this.endingSystem.triggerTheFirstTollFinale();
      } else {
        if (this.uiScene) {
          this.uiScene.showPopupMessage('Quả chuông làng câm lặng vì thiếu Lưỡi Chuông Đồng!');
        }
      }
    } else if (actionId === 'hide_player') {
      this.player.stats.isHiding = !this.player.stats.isHiding;
      this.player.setVisible(!this.player.stats.isHiding);
      if (this.uiScene) {
        this.uiScene.showPopupMessage(
          this.player.stats.isHiding 
            ? '🌿 Đang ẩn nấp an toàn trong Thân Cây / Bụi Rậm! Kẻ Lắng Nghe sẽ không thể nghe thấy bạn.' 
            : 'Đã bước ra khỏi chỗ trốn.'
        );
      }
    } else {
      if (this.uiScene) {
        this.uiScene.showPopupMessage(`Đã tương tác với: ${name}`);
      }
    }
  }

  private handlePillarInteraction(pillarId: string): void {
    let noteIdx = 0;
    if (pillarId === 'pillar_root') noteIdx = 1;
    else if (pillarId === 'pillar_eye') noteIdx = 2;
    this.audioManager.playRunestoneResonance(noteIdx);

    const res = this.puzzleSystem.interactPillar(pillarId);
    if (this.uiScene) {
      this.uiScene.showPopupMessage(res.msg);
    }

    if (res.failed) {
      // Báo động The Listener lao đến kiểm tra tiếng gầm cột đá
      if (this.listenerMonster) {
        this.listenerMonster.hearSound(3520, 280, 2.5);
      }
      this.cameraSystem.shake(200, 0.01);
    } else if (res.solved) {
      this.cameraSystem.flash(400, 93, 173, 226);
      this.playerState.setFlag('mire_drained');
      this.playerState.completeQuestTask('Q05_SOLVE_MIRE', 't1');
      this.playerState.completeQuestTask('Q05_SOLVE_MIRE', 't2');
      this.playerState.completeQuestTask('Q05_SOLVE_MIRE', 't3');
      this.playerState.setCurrentQuest('Q06_RETRIEVE_CLAPPER');
      SaveManager.saveGame('HỒI 4: ĐẦM LẦY TĨNH LẶNG (ĐÃ GIẢI MÃ CỘT ĐÁ)', 'silent_mire', this.player.x, this.player.y);
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
    }

    // Tính toán tọa độ chiếu chuẩn xác trên màn hình HD 1280×720 với Camera Zoom 2.2x
    const cam = this.cameras.main;
    const screenX = (this.player.x - cam.worldView.x) * cam.zoom;
    const screenY = (this.player.y - 26 - cam.worldView.y) * cam.zoom;

    const isLanternOn = this.player.stats.isLanternOn;
    const baseRadius = isLanternOn ? LANTERN_RADIUS_NORMAL : LANTERN_RADIUS_DIM;
    // Bán kính ánh sáng chuẩn HD 1280×720 zoom 2.2x
    const radius = baseRadius * cam.zoom * 0.82;

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

      // Tái sử dụng đối tượng Graphics duy nhất thay vì cấp phát & hủy 60 lần/giây (BUG-06 Fix)
      this.lightMaskGfx.clear();
      // 4 tầng ánh sáng gradient mềm mại, không bao giờ để lại viền sắc cạnh
      this.lightMaskGfx.fillStyle(0xffffff, 1.0);
      this.lightMaskGfx.fillCircle(screenX, screenY, radius * 0.65);

      this.lightMaskGfx.fillStyle(0xffffff, 0.72);
      this.lightMaskGfx.fillCircle(screenX, screenY, radius * 0.90);

      this.lightMaskGfx.fillStyle(0xffffff, 0.40);
      this.lightMaskGfx.fillCircle(screenX, screenY, radius * 1.18);

      this.lightMaskGfx.fillStyle(0xffffff, 0.15);
      this.lightMaskGfx.fillCircle(screenX, screenY, radius * 1.45);

      this.fogOfWarLayer.erase(this.lightMaskGfx);
    }

    // Hiệu ứng ánh sáng đèn lồng ấm áp (Dynamic Warm Lantern Glow - PASS T17)
    this.lanternGlowGfx.clear();
    if (isLanternOn) {
      // Ngọn lửa đèn dầu rung rinh tự nhiên trong gió sương
      const flicker = Math.sin(this.time.now * 0.007) * 0.03 + Math.cos(this.time.now * 0.013) * 0.02;
      const glowAlpha = Math.max(0.08, Math.min(0.24, 0.16 + flicker));

      // Quầng sáng màu hổ phách vàng cam ấm áp
      this.lanternGlowGfx.fillStyle(0xf39c12, glowAlpha);
      this.lanternGlowGfx.fillCircle(screenX, screenY, radius * 0.75);

      this.lanternGlowGfx.fillStyle(0xe67e22, glowAlpha * 0.45);
      this.lanternGlowGfx.fillCircle(screenX, screenY, radius * 1.15);
    }
  }
}
