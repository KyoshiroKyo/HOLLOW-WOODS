import { ZoneConnectionRegistry } from '../world/ZoneConnectionRegistry';
import { WorldGatingSystem } from '../world/WorldGatingSystem';
/**
 * HOLLOW WOODS V1.4 - PARCHMENT WORLD MAP MODAL (PHÍM M)
 * Bản đồ Thế giới Giấy Da toàn vùng lấy Làng Bellhollow làm trung tâm.
 * - Tông màu Giấy da cổ, nâu đất, mực tối và ánh vàng hổ phách đậm chất Dark Woodland.
 * - Cơ chế Sương Mù Khám Phá (Fog of War): Các vùng chưa từng đến bị phủ mực sương mù mờ ảo;
 *   khi người chơi đến đâu, bản đồ tự động vén sương tới đó và lưu vào PlayerState.
 * - Tạm dừng di chuyển nhân vật khi đang mở bản đồ.
 * - Hiển thị các địa danh quan trọng (Landmarks) và ghi chú manh mối nhiệm vụ.
 */

import * as Phaser from 'phaser';
import { PlayerState } from '../state/PlayerState';
import { HDTextHelper } from '../utils/HDTextHelper';
import { AudioManager } from '../audio/AudioManager';
import { QuestSystem } from '../systems/QuestSystem';

export interface ParchmentMapNode {
  id: string;
  name: string;
  subTitle: string;
  canvasX: number; // Tọa độ trên bản đồ giấy da (tâm 640, 360)
  canvasY: number;
  width: number;
  height: number;
  color: number;
  borderColor: number;
  landmarks: string[];
  clue: string;
}

export class ParchmentWorldMapModal {
  public static readonly MAP_WIDTH = 980;
  public static readonly MAP_HEIGHT = 600;

  private scene: Phaser.Scene;
  private playerState: PlayerState;
  public container: Phaser.GameObjects.Container;
  public isOpen: boolean = false;

  private backdrop!: Phaser.GameObjects.Graphics;
  private parchmentBg!: Phaser.GameObjects.Graphics;
  private contentContainer!: Phaser.GameObjects.Container;
  private subTitleText!: Phaser.GameObjects.Text;
  private pulseTween?: Phaser.Tweens.Tween;

  public onOpen?: () => void;
  public onClose?: () => void;

  // Sơ đồ topology 10 vùng đất lấy Làng Bellhollow (460, 280) làm trung tâm
  private readonly nodes: ParchmentMapNode[] = [
    {
      id: 'bellhollow',
      name: 'Làng Bellhollow',
      subTitle: 'Vùng Lõi Bình Yên • Khu Dân Cư',
      canvasX: 470,
      canvasY: 280,
      width: 140,
      height: 90,
      color: 0x3d301f,
      borderColor: 0xd4af37, // Viền vàng hoàng kim
      landmarks: ['Tháp Chuông Cổ', 'Bảng Tin Dị Thường', 'Lò Rèn Bram', 'Giếng Nước Cổ'],
      clue: 'Nơi cư ngụ của dân làng. Lưỡi Chuông Đồng bảo vệ làng đã bị Kẻ Lắng Nghe đánh cắp.'
    },
    {
      id: 'outer_woods',
      name: 'Rìa Rừng Ngoài',
      subTitle: 'Rừng Thưa Tây Bắc',
      canvasX: 250,
      canvasY: 180,
      width: 130,
      height: 75,
      color: 0x242e20,
      borderColor: 0x5a7d52,
      landmarks: ['Nhà Trạm Kiểm Lâm', 'Rương Tiếp Tế', 'Gốc Sồi Mục'],
      clue: 'Trạm kiểm lâm bỏ hoang chứa rương quân lương và lối tắt thân cây đổ nối sang Đầm Lầy.'
    },
    {
      id: 'crooked_path',
      name: 'Đường Mòn Quanh Co',
      subTitle: 'Tiền Tuyến Phía Bắc',
      canvasX: 470,
      canvasY: 160,
      width: 130,
      height: 65,
      color: 0x2f281e,
      borderColor: 0x7a6344,
      landmarks: ['Ổ Đá Canh Gác', 'Biển Cảnh Báo'],
      clue: 'Tuyến đường huyết mạch hiểm trở nối thẳng lên Rừng Sâu u tối.'
    },
    {
      id: 'deep_forest',
      name: 'Rừng Sâu',
      subTitle: 'Lãnh Địa Cổ Thụ • Quái Vật',
      canvasX: 690,
      canvasY: 160,
      width: 130,
      height: 80,
      color: 0x1b281f,
      borderColor: 0x3e6848,
      landmarks: ['Cột Vật Tổ Thì Thầm', 'Cổng Hư Không', 'Bụi Gai Đầm Lầy'],
      clue: 'Cột vật tổ thì thầm cảnh báo lũ Kỵ Binh Hắc Ám và Sói Xương rình rập.'
    },
    {
      id: 'fog_crossing',
      name: 'Lối Mòn Xuyên Sương',
      subTitle: 'Cửa Ngõ Tây Nam',
      canvasX: 230,
      canvasY: 390,
      width: 130,
      height: 70,
      color: 0x22262d,
      borderColor: 0x5d6878,
      landmarks: ['Bờ Vực Sương Mù', 'Lửa Trại Tàn Tích'],
      clue: 'Điểm khởi đầu nơi người lữ khách lần đầu lạc bước vào Khu Rừng Rỗng.'
    },
    {
      id: 'sanctuary_farm',
      name: 'Nông Trại Trú Ẩn',
      subTitle: 'Nông Trại Thảo Dược Nam',
      canvasX: 470,
      canvasY: 410,
      width: 130,
      height: 65,
      color: 0x33281c,
      borderColor: 0x826945,
      landmarks: ['Vườn Thảo Dược Edda', 'Hàng Rào Gỗ'],
      clue: 'Vườn thuốc an lành thu hoạch Thảo Dược Quý chế tạo Cao Dược.'
    },
    {
      id: 'silent_mire',
      name: 'Đầm Lầy Sương Mù',
      subTitle: 'Vùng Trũng Nước Đông Nam',
      canvasX: 690,
      canvasY: 340,
      width: 130,
      height: 80,
      color: 0x1d2e2b,
      borderColor: 0x3d7066,
      landmarks: ['Miếu Thờ Chìm', 'Chuông Đồng Chìm', 'Cầu Ván Gỗ'],
      clue: 'Cầu ván gỗ mục dẫn tới Miếu Thờ Chìm phong ấn Lưỡi Chuông Đồng linh thiêng.'
    },
    {
      id: 'ancient_rune_puzzle',
      name: 'Miếu Cổ Ngữ',
      subTitle: 'Ba Trụ Đá Thần Bí Đông',
      canvasX: 860,
      canvasY: 230,
      width: 120,
      height: 75,
      color: 0x291f33,
      borderColor: 0x7d5ea6,
      landmarks: ['Cột Ngữ Trăng Khuyết', 'Cột Ngữ Rễ Cây', 'Cột Ngữ Con Mắt'],
      clue: 'Giải mã quy luật cổ ngữ thắp sáng 3 trụ đá để phá vỡ kết giới vào Miếu Chuông.'
    },
    {
      id: 'broken_bell_shrine',
      name: 'Miếu Chuông Phế Tích',
      subTitle: 'Thánh Địa Phong Ấn Cuối Cùng',
      canvasX: 860,
      canvasY: 380,
      width: 125,
      height: 80,
      color: 0x361c20,
      borderColor: 0xa8434f,
      landmarks: ['Quả Chuông Khổng Lồ', 'Tế Đàn Mạch Rễ', 'Đài Lửa Cổ Ngữ'],
      clue: 'Nơi ngủ say của Kẻ Nuốt Tiếng Chuông — Trùm tối thượng phong tỏa Khu Rừng Rỗng.'
    },
    {
      id: 'abyssal_chasm',
      name: 'Vực Thẳm Hư Không',
      subTitle: 'Vực Sâu Cổ Đại Cực Tây',
      canvasX: 90,
      canvasY: 260,
      width: 110,
      height: 75,
      color: 0x17121b,
      borderColor: 0x4d3b59,
      landmarks: ['Rìa Vực Thẳm', 'Cổng Hư Vô'],
      clue: 'Khe nứt không gian thăm thẳm dẫn tới cội nguồn tà ác của Màn Sương The Veil.'
    }
  ];

  constructor(scene: Phaser.Scene, playerState: PlayerState) {
    this.scene = scene;
    this.playerState = playerState;

    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(1500); // Nằm trên toàn bộ UI thông thường
    this.container.setVisible(false);

    this.buildBaseModal();
  }

  private buildBaseModal(): void {
    // 1. Màn đen phủ viền mờ ảo (Vignette Backdrop)
    this.backdrop = this.scene.add.graphics();
    this.backdrop.fillStyle(0x05070a, 0.85);
    this.backdrop.fillRect(0, 0, 1280, 720);
    this.backdrop.setInteractive(new Phaser.Geom.Rectangle(0, 0, 1280, 720), Phaser.Geom.Rectangle.Contains);

    // 2. Khung Giấy Da Cổ (Aged Parchment Board) kích thước 980x600 px tại tâm (640, 360)
    const px = 150;
    const py = 60;
    const pw = 980;
    const ph = 600;

    // V152-06B: Sprite Cuộn Bản Đồ Giấy Da Cổ từ UI Pack
    let scrollSprite: Phaser.GameObjects.Image | undefined;
    if (this.scene.textures.exists('ui_pack_world_map_scroll')) {
      scrollSprite = this.scene.add.image(640, 360, 'ui_pack_world_map_scroll');
      scrollSprite.setDisplaySize(pw + 30, ph + 30);
      scrollSprite.setTint(0xdfd3b6);
      scrollSprite.setAlpha(0.75);
    }

    this.parchmentBg = this.scene.add.graphics();
    // Nền giấy da ngả vàng nâu cũ kỹ
    this.parchmentBg.fillStyle(0xd9c29e, 1);
    this.parchmentBg.fillRoundedRect(px, py, pw, ph, 10);
    // Viền cháy xém / viền mực sẫm
    this.parchmentBg.lineStyle(4, 0x3d2714, 0.95);
    this.parchmentBg.strokeRoundedRect(px, py, pw, ph, 10);
    // Chỉ viền đôi phong cách cổ
    this.parchmentBg.lineStyle(1.5, 0x8a623a, 0.7);
    this.parchmentBg.strokeRoundedRect(px + 4, py + 4, pw - 8, ph - 8, 8);

    // Lưới hoa văn kinh tuyến vĩ tuyến mờ nhạt trên giấy da
    this.parchmentBg.lineStyle(1, 0xbaa17e, 0.35);
    for (let lx = px + 60; lx < px + pw; lx += 80) {
      this.parchmentBg.lineBetween(lx, py + 20, lx, py + ph - 20);
    }
    for (let ly = py + 60; ly < py + ph; ly += 70) {
      this.parchmentBg.lineBetween(px + 20, ly, px + pw - 20, ly);
    }

    // Tiêu đề cổ điển & Hoa văn La bàn trên đầu bản đồ
    const titleText = HDTextHelper.createText(this.scene, 640, py + 18, '📜 BẢN ĐỒ THẾ GIỚI — KHU RỪNG RỖNG (THE HOLLOW WOODS)', {
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#2a1a0d',
      stroke: '#d9c29e',
      strokeThickness: 1
    }).setOrigin(0.5, 0);

    this.subTitleText = HDTextHelper.createText(this.scene, 640, py + 42, 'Sơ Đồ Tuyến Đường 7 Chặng A -> E -> B -> D -> F -> E -> C • [M] hoặc [ESC] để Gấp Bản Đồ', {
      fontSize: '10.5px',
      fontStyle: 'bold',
      color: '#8a4b12'
    }).setOrigin(0.5, 0);

    // Nút đóng góc trên phải [X]
    const closeBtn = HDTextHelper.createText(this.scene, px + pw - 28, py + 16, '✖ [ESC]', {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#8b2500',
      backgroundColor: '#ebd8bc',
      padding: { x: 8, y: 4 }
    }).setOrigin(1, 0);
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.close());

    this.contentContainer = this.scene.add.container(0, 0);

    const modalChildren: Phaser.GameObjects.GameObject[] = [
      this.backdrop,
      ...(scrollSprite ? [scrollSprite] : []),
      this.parchmentBg,
      titleText,
      this.subTitleText,
      closeBtn,
      this.contentContainer
    ];
    this.container.add(modalChildren);
  }

  /**
   * Mở Bản đồ Giấy Da và vẽ toàn bộ các phân khu, đường mòn và lớp sương mù Fog of War
   */
  public open(): void {
    if (this.isOpen) return;
    this.isOpen = true;
    this.container.setVisible(true);

    try {
      AudioManager.getInstance().playWorldInteractSFX('journal');
    } catch {
      // Ignored
    }

    this.renderWorldMapContent();

    if (this.onOpen) {
      this.onOpen();
    }
  }

  /**
   * Đóng Bản đồ Giấy Da
   */
  public close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.container.setVisible(false);

    if (this.pulseTween) {
      this.pulseTween.stop();
      this.pulseTween = undefined;
    }

    try {
      AudioManager.getInstance().playUICancel();
    } catch {
      // Ignored
    }

    if (this.onClose) {
      this.onClose();
    }
  }

  public toggle(): boolean {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
    return this.isOpen;
  }

  /**
   * Dựng nội dung bản đồ: Tuyến đường mòn, Các khu vực, Sương mù Fog of War và Điểm đứng
   */
  private renderWorldMapContent(): void {
    if (this.pulseTween) {
      this.pulseTween.stop();
      this.pulseTween = undefined;
    }
    this.contentContainer.removeAll(true);

    const activeZoneId = this.playerState.getCurrentZone() || 'bellhollow';
    const visitedZones = this.playerState.getVisitedZones();
    const discoveredCount = this.nodes.filter(n => visitedZones.includes(n.id)).length;

    // Lấy thông tin chặng nhiệm vụ chính tuyến V1.5 (A -> E -> B -> D -> F -> E -> C)
    const currentStage = QuestSystem.getInstance().getCurrentStageInfo(this.playerState);
    const bridgeSeal = QuestSystem.getInstance().getBridgeSealState(this.playerState);

    // Cập nhật tiêu đề chặng & hướng đi chi tiết
    if (this.subTitleText) {
      this.subTitleText.setText(
        `🎯 [CHẶNG ${currentStage.stageNumber}/7] ${currentStage.title} (${currentStage.route}) • Hướng đi: ${currentStage.directionHint}`
      );
    }

    // Xác định phân khu mục tiêu tiếp theo trên bản đồ
    let targetNodeId = currentStage.targetZone;
    if (targetNodeId === 'sub_bell_workshop') targetNodeId = 'outer_woods';
    else if (targetNodeId === 'sub_root_cellar') targetNodeId = 'sanctuary_farm';

    // 1. Thống kê khám phá & Chú thích phía đáy bản đồ
    const statsText = HDTextHelper.createText(this.scene, 180, 620, `🧭 Đã khai mở: ${discoveredCount}/10 Khu Vực`, {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#2a1a0d'
    });

    const legendText = HDTextHelper.createText(
      this.scene,
      1100,
      620,
      '🟡 Vị trí hiện tại   🎯 Mục tiêu kế tiếp   🔒 Phong ấn   ✨ Vùng đã mở   🌫️ Sương mù',
      {
        fontSize: '10.5px',
        color: '#5c4028'
      }
    ).setOrigin(1, 0);

    this.contentContainer.add([statsText, legendText]);

    // 2. Vẽ các tuyến đường mòn liên kết giữa các khu vực (Trails & Roads)
    const roadGfx = this.scene.add.graphics();
    const drawnEdges = new Set<string>();

    const topology = ZoneConnectionRegistry.getInstance();
    const gates = WorldGatingSystem.getInstance();
    for (const node of this.nodes) {
      const fromDiscovered = this.playerState.hasVisitedZone(node.id);
      for (const route of topology.getRuntimeExits(node.id)) {
        const targetId = route.toZone;
        const edgeKey = node.id < targetId ? `${node.id}-${targetId}` : `${targetId}-${node.id}`;
        if (drawnEdges.has(edgeKey)) continue;
        drawnEdges.add(edgeKey);

        const targetNode = this.nodes.find(n => n.id === targetId);
        if (!targetNode) continue;
        const toDiscovered = this.playerState.hasVisitedZone(targetNode.id);

        // Nét vẽ đường mòn
        if (fromDiscovered && toDiscovered && route.status === 'active' &&
            gates.isZoneUnlocked(route.toZone, this.playerState)) {
          // Tuyến đường đã mở rõ nét: Nét đứt màu nâu sẫm
          roadGfx.lineStyle(2.5, 0x5a3d24, 0.85);
        } else {
          // Tuyến đường mờ ảo trong sương: Nét chì mờ
          roadGfx.lineStyle(1.5, 0x8a7259, 0.4);
        }

        roadGfx.lineBetween(
          node.canvasX + node.width / 2,
          node.canvasY + node.height / 2,
          targetNode.canvasX + targetNode.width / 2,
          targetNode.canvasY + targetNode.height / 2
        );
      }
    }
    this.contentContainer.add(roadGfx);

    // 3. Vẽ chốt chặn Phong Ấn Rễ Cổ / Cầu Cây nối Đầm Lầy (E) -> Miếu Chuông (C)
    const bridgeX = 790;
    const bridgeY = 370;
    const bridgeGfx = this.scene.add.graphics();
    const isBridgeUnlocked = bridgeSeal.isBroken;

    bridgeGfx.fillStyle(isBridgeUnlocked ? 0x0c2d18 : 0x2d0c10, 0.95);
    bridgeGfx.fillRoundedRect(bridgeX - 60, bridgeY - 17, 120, 34, 5);
    bridgeGfx.lineStyle(1.8, isBridgeUnlocked ? 0x2ecc71 : 0xe74c3c, 1.0);
    bridgeGfx.strokeRoundedRect(bridgeX - 60, bridgeY - 17, 120, 34, 5);

    const sealTitle = isBridgeUnlocked ? '🔓 CẦU CÂY ĐÃ HẠ' : '🔒 PHONG ẤN RỄ CỔ';
    const sealDesc = isBridgeUnlocked ? 'Lối thông Miếu Chuông' : 'Cần Chìa Khóa Thanh Tẩy';

    const sealTitleText = HDTextHelper.createText(this.scene, bridgeX, bridgeY - 6, sealTitle, {
      fontSize: '9px',
      fontStyle: 'bold',
      color: isBridgeUnlocked ? '#2ecc71' : '#ff7675',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);

    const sealDescText = HDTextHelper.createText(this.scene, bridgeX, bridgeY + 7, sealDesc, {
      fontSize: '7.5px',
      fontStyle: 'italic',
      color: isBridgeUnlocked ? '#a3e4d7' : '#f5b7b1'
    }).setOrigin(0.5, 0.5);

    this.contentContainer.add([bridgeGfx, sealTitleText, sealDescText]);

    // 4. Vẽ từng Node Khu Vực & Xử lý Cơ Chế Sương Mù Khám Phá (Fog of War)
    const beaconPoints: { x: number; y: number }[] = [];
    const pulsingObjects: Phaser.GameObjects.GameObject[] = [];

    for (const node of this.nodes) {
      const isVisited = this.playerState.hasVisitedZone(node.id);
      const isCurrentZone = (node.id === activeZoneId);
      const isTargetZone = (node.id === targetNodeId);

      const nodeGfx = this.scene.add.graphics();

      if (isVisited) {
        // ==========================================
        // VÙNG ĐÃ KHÁM PHÁ (VÉN SƯƠNG RÕ NÉT)
        // ==========================================
        nodeGfx.fillStyle(node.color, 0.9);
        nodeGfx.fillRoundedRect(node.canvasX, node.canvasY, node.width, node.height, 6);
        nodeGfx.lineStyle(isTargetZone ? 2.5 : 2, isTargetZone ? 0xf1c40f : node.borderColor, 0.95);
        nodeGfx.strokeRoundedRect(node.canvasX, node.canvasY, node.width, node.height, 6);

        if (isTargetZone) {
          nodeGfx.lineStyle(1.5, 0xffeaa7, 0.8);
          nodeGfx.strokeRoundedRect(node.canvasX - 3, node.canvasY - 3, node.width + 6, node.height + 6, 8);
        }

        // Tên phân khu
        const nameText = HDTextHelper.createText(this.scene, node.canvasX + node.width / 2, node.canvasY + 8, node.name, {
          fontSize: '11.5px',
          fontStyle: 'bold',
          color: isTargetZone ? '#f9e79f' : '#f5eedc',
          stroke: '#1a1006',
          strokeThickness: 2
        }).setOrigin(0.5, 0);

        // Phụ đề phân khu
        const subText = HDTextHelper.createText(this.scene, node.canvasX + node.width / 2, node.canvasY + 25, node.subTitle, {
          fontSize: '9px',
          color: isTargetZone ? '#f39c12' : '#d4af37',
          stroke: '#1a1006',
          strokeThickness: 1.5
        }).setOrigin(0.5, 0);

        // Danh sách địa danh tiêu biểu (Landmarks)
        const lmString = node.landmarks.slice(0, 2).map(l => `• ${l}`).join('\n');
        const lmText = HDTextHelper.createText(this.scene, node.canvasX + 8, node.canvasY + 40, lmString, {
          fontSize: '8.5px',
          color: '#c9b79c',
          lineSpacing: 1
        });

        this.contentContainer.add([nodeGfx, nameText, subText, lmText]);

        // Nếu người chơi đang ở vùng này, đánh dấu điểm beacon
        if (isCurrentZone) {
          beaconPoints.push({ x: node.canvasX + node.width / 2, y: node.canvasY + node.height / 2 });
        }
      } else {
        // ==========================================
        // VÙNG CHƯA KHÁM PHÁ (FOG OF WAR - PHỦ MỰC SƯƠNG)
        // ==========================================
        nodeGfx.fillStyle(0x231a12, 0.94);
        nodeGfx.fillRoundedRect(node.canvasX, node.canvasY, node.width, node.height, 6);
        nodeGfx.lineStyle(isTargetZone ? 2.5 : 1.5, isTargetZone ? 0xf1c40f : 0x4d3722, isTargetZone ? 1.0 : 0.6);
        nodeGfx.strokeRoundedRect(node.canvasX, node.canvasY, node.width, node.height, 6);

        // Hoa văn sương mù mực chéo mờ
        nodeGfx.lineStyle(1, 0x3d2919, 0.4);
        for (let i = 0; i < node.width + node.height; i += 12) {
          nodeGfx.lineBetween(
            Math.max(node.canvasX, node.canvasX + i - node.height),
            Math.min(node.canvasY + node.height, node.canvasY + i),
            Math.min(node.canvasX + node.width, node.canvasX + i),
            Math.max(node.canvasY, node.canvasY + i - node.width)
          );
        }

        const fogIcon = HDTextHelper.createText(this.scene, node.canvasX + node.width / 2, node.canvasY + 16, isTargetZone ? '🎯' : '🌫️', {
          fontSize: '16px'
        }).setOrigin(0.5, 0);

        const fogTitle = HDTextHelper.createText(this.scene, node.canvasX + node.width / 2, node.canvasY + 42, isTargetZone ? node.name : 'Chưa Khám Phá', {
          fontSize: '10px',
          fontStyle: 'italic',
          color: isTargetZone ? '#f1c40f' : '#8a6e52'
        }).setOrigin(0.5, 0);

        this.contentContainer.add([nodeGfx, fogIcon, fogTitle]);
      }

      // Đánh dấu nổi bật phân khu mục tiêu tiếp theo (nhấp nháy nhẹ kèm nhãn tên chặng mục tiêu)
      if (isTargetZone) {
        const targetBadge = HDTextHelper.createText(
          this.scene,
          node.canvasX + node.width / 2,
          node.canvasY - 12,
          `🎯 MỤC TIÊU [CHẶNG ${currentStage.stageNumber}]`,
          {
            fontSize: '9px',
            fontStyle: 'bold',
            color: '#f1c40f',
            backgroundColor: '#1b1208ee',
            padding: { x: 5, y: 2 },
            stroke: '#000000',
            strokeThickness: 2
          }
        ).setOrigin(0.5, 0.5);

        this.contentContainer.add(targetBadge);
        pulsingObjects.push(targetBadge);
      }
    }

    // 5. Con trỏ định vị vị trí hiện tại của người chơi (Glowing Amber Beacon & Pixel Map Pin)
    if (beaconPoints.length > 0) {
      const pt = beaconPoints[0];
      if (this.scene.textures.exists('ui_pack_map_pin')) {
        const pinImg = this.scene.add.image(pt.x, pt.y - 12, 'ui_pack_map_pin');
        pinImg.setDisplaySize(18, 28).setOrigin(0.5, 1);
        this.contentContainer.add(pinImg);
        pulsingObjects.push(pinImg);
      } else {
        const beaconGfx = this.scene.add.graphics();
        beaconGfx.fillStyle(0xf39c12, 0.9);
        beaconGfx.fillCircle(pt.x, pt.y, 6);
        beaconGfx.lineStyle(2, 0xffffff, 1);
        beaconGfx.strokeCircle(pt.x, pt.y, 6);
        this.contentContainer.add(beaconGfx);
        pulsingObjects.push(beaconGfx);
      }

      const beaconLabel = HDTextHelper.createText(this.scene, pt.x, pt.y - 28, '📍 BẠN ĐANG Ở ĐÂY', {
        fontSize: '9.5px',
        fontStyle: 'bold',
        color: '#f1c40f',
        backgroundColor: '#1a1006dd',
        padding: { x: 5, y: 2 },
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5, 1);

      this.contentContainer.add(beaconLabel);
    }

    // Hiệu ứng nhấp nháy phát sáng (Pulsing Animation) cho beacon và target badge
    if (pulsingObjects.length > 0) {
      this.pulseTween = this.scene.tweens.add({
        targets: pulsingObjects,
        alpha: 0.5,
        duration: 750,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  /**
   * Dọn dẹp tween, graphics và container khi tắt scene
   */
  public destroy(): void {
    if (this.pulseTween) {
      this.pulseTween.stop();
      this.pulseTween = undefined;
    }
    if (this.container) {
      this.container.destroy(true);
    }
  }
}
