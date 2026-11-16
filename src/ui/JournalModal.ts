/**
 * HOLLOW WOODS V1.2 - COMMAND C4-12-26
 * TÍCH HỢP HỆ THỐNG BẢN ĐỒ THẾ GIỚI & SỔ TAY LỮ KHÁCH (WORLD MAP & JOURNAL)
 * 
 * Khung chuẩn HD 1280×720 tại UIScene (Zoom 1.0), căn giữa (640, 360), kích thước 840×520 px.
 * 3 Tab Điều Hướng Độc Lập:
 *   [1. TIẾN TRÌNH NHIỆM VỤ]
 *   [2. CỔ THƯ & MANH MỐI]
 *   [3. BẢN ĐỒ THẾ GIỚI]
 * 
 * Bản đồ Thế giới hiển thị toàn diện 9 phân khu thuộc 3 Tầng Thế Giới + 1 phân khu lộ trình V1.3:
 *   - Tầng 1: Core World (Lối Mòn Xuyên Sương, Làng Bellhollow, Nông Trại Trú Ẩn, Rừng Ngoại Vi)
 *   - Tầng 2: Frontier (Đường Mòn Quanh Co, Rừng Sâu)
 *   - Tầng 3: Forbidden Regions (Đầm Lầy Tĩnh Lặng, Khu Vực Câu Đố Cổ Ngữ, Miếu Chuông Phế Tích)
 *   - Lộ trình V1.3: Vực Sâu Cổ Đại (The Ancient Depths)
 * 
 * Phân biệt 4 trạng thái trực quan rõ nét:
 *   1. EXPLORED (Đã khám phá)
 *   2. OPEN (Đang mở — sẵn sàng tiến vào)
 *   3. LOCKED (Đang khóa theo nhiệm vụ/cốt truyện)
 *   4. UNIMPLEMENTED (Chưa triển khai — V1.3)
 *   + CURRENT LOCATION (Vị trí phân khu hiện tại của người chơi có beacon nhấp nháy nổi bật)
 */

import * as Phaser from 'phaser';
import { PlayerState, LoreEntry } from '../state/PlayerState';
import { HDTextHelper } from '../utils/HDTextHelper';
import { ZoneId, WorldTier } from '../types';
import { WorldGatingSystem } from '../world/WorldGatingSystem';
import { ZoneConnectionRegistry } from '../world/ZoneConnectionRegistry';
import { AudioManager } from '../audio/AudioManager';

export type JournalTab = 'quest' | 'lore' | 'map';
export type WorldMapZoneStatus = 'EXPLORED' | 'OPEN' | 'LOCKED' | 'UNIMPLEMENTED';

export interface WorldMapNodeSpec {
  id: string;
  canonicalName: string;
  subTitle: string;
  tier: WorldTier | 'UNIMPLEMENTED';
  tierDisplayName: string;
  canvasX: number; // Tọa độ tương đối trên Canvas Bản đồ (0..500)
  canvasY: number; // Tọa độ tương đối trên Canvas Bản đồ (0..350)
  description: string;
  landmarks: string[];
  connections: string[];
  icon: string;
  isImplemented: boolean;
}

export class JournalModal {
  private scene: Phaser.Scene;
  private playerState: PlayerState;
  private gatingSystem: WorldGatingSystem;
  private zoneRegistry: ZoneConnectionRegistry;

  private container: Phaser.GameObjects.Container;
  private currentTab: JournalTab = 'quest';
  private currentLoreIndex: number = 0;
  private selectedZoneId: string = 'bellhollow';

  private contentContainer: Phaser.GameObjects.Container;
  private tabQuestBtn!: Phaser.GameObjects.Text;
  private tabLoreBtn!: Phaser.GameObjects.Text;
  private tabMapBtn!: Phaser.GameObjects.Text;

  public isOpen: boolean = false;
  private lastToggleTime: number = 0;

  public onOpen?: () => void;
  public onClose?: () => void;

  // Dữ liệu chuẩn mực của 10 phân khu trên Bản Đồ Thế Giới (V1.2 Canon)
  private readonly mapNodes: WorldMapNodeSpec[] = [
    // =========================================================================
    // TẦNG 1: CORE WORLD (VÙNG LÕI TỰ DO SINH HOẠT & CHẾ TẠO)
    // =========================================================================
    {
      id: 'fog_crossing',
      canonicalName: 'Lối Mòn Xuyên Sương',
      subTitle: 'Fog Crossing',
      tier: 'LAYER_1_CORE',
      tierDisplayName: 'Tầng 1 — Core World (Vùng Lõi)',
      canvasX: 65,
      canvasY: 210,
      description: 'Lối mòn ban sơ mịt mù sương trắng dẫn lối những kẻ lạc bước tiến vào Khu Rừng Rỗng (The Hollow Woods). Tiếng chuông ngân vang xa xa định hướng người lữ khách.',
      landmarks: [
        'Bờ Vực Sương Mù Khởi Đầu',
        'Đèn Lồng Cổ Dẫn Đường Ban Sơ',
        'Cây Cổ Thụ Đổ Chắn Lối Ven Bờ',
        'Cổng Tây Làng Bellhollow'
      ],
      connections: ['bellhollow'],
      icon: '🌫',
      isImplemented: true
    },
    {
      id: 'bellhollow',
      canonicalName: 'Làng Bellhollow',
      subTitle: 'Bellhollow Village Hub',
      tier: 'LAYER_1_CORE',
      tierDisplayName: 'Tầng 1 — Core World (Trung Tâm Làng)',
      canvasX: 175,
      canvasY: 140,
      description: 'Ngôi làng trú ẩn an toàn của các cư dân còn sống sót. Nơi đặt Tháp Chuông Cổ, bàn chế tạo vật phẩm và nơi sinh sống của Trưởng Làng Thomas cùng Thầy Thuốc Neris.',
      landmarks: [
        'Tháp Chuông Cổ Đại (The Great Bell)',
        'Bàn Chế Tạo Dụng Cụ & Thuốc [Phím I]',
        'Nhà Trưởng Làng Thomas & Thầy Thuốc Neris',
        'Giếng Nước Cổ & Bảng Cáo Thị Làng',
        'Cổng Đông Phong Ấn Dẫn Sang Rừng Cấm'
      ],
      connections: ['fog_crossing', 'sanctuary_farm', 'outer_woods', 'crooked_path'],
      icon: '🏡',
      isImplemented: true
    },
    {
      id: 'sanctuary_farm',
      canonicalName: 'Nông Trại Trú Ẩn',
      subTitle: 'Sanctuary Farm',
      tier: 'LAYER_1_CORE',
      tierDisplayName: 'Tầng 1 — Core World (Vùng Lõi)',
      canvasX: 145,
      canvasY: 280,
      description: 'Trang trại trù phú bình yên nằm ở phía Nam làng Bellhollow. Nơi lữ khách gieo trồng và thu hoạch thảo dược quý giá, phục vụ việc hồi phục sinh lực và chế tạo dược liệu.',
      landmarks: [
        '4 Ô Đất Canh Tác Thảo Dược [Phím E]',
        'Giếng Nước Tưới Tiêu Nông Trại',
        'Bàn Phơi & Sơ Chế Dược Liệu',
        'Chòi Cất Nông Cụ & Hàng Rào Gỗ Ấm Cúng'
      ],
      connections: ['bellhollow', 'outer_woods'],
      icon: '🌾',
      isImplemented: true
    },
    {
      id: 'outer_woods',
      canonicalName: 'Rừng Ngoại Vi',
      subTitle: 'Outer Woods',
      tier: 'LAYER_1_CORE',
      tierDisplayName: 'Tầng 1 — Core World (Vùng Lõi)',
      canvasX: 255,
      canvasY: 250,
      description: 'Khu rừng đệm nằm ven làng Bellhollow. Cung cấp nguồn gỗ khô, đá lửa tự nhiên dồi dào cho người chơi, trước khi mạo hiểm tiến sâu hơn vào vùng rừng cấm.',
      landmarks: [
        'Khoảng Rừng Thưa (Clearing)',
        'Cụm Cây Cổ Thụ Ven Rừng',
        'Mỏ Khai Thác Đá Lửa Tự Nhiên',
        'Đống Củi Gỗ Khô Đầu Rừng'
      ],
      connections: ['bellhollow', 'sanctuary_farm', 'crooked_path'],
      icon: '🌲',
      isImplemented: true
    },

    // =========================================================================
    // TẦNG 2: FRONTIER (VÙNG BIÊN VIỄN MỞ DẦN THEO NHIỆM VỤ)
    // =========================================================================
    {
      id: 'crooked_path',
      canonicalName: 'Đường Mòn Quanh Co',
      subTitle: 'The Crooked Path',
      tier: 'LAYER_2_FRONTIER',
      tierDisplayName: 'Tầng 2 — Frontier (Biên Viễn)',
      canvasX: 300,
      canvasY: 140,
      description: 'Tuyến đường rừng hiểm trở uốn lượn sau Cổng Đông làng. Vách đá cheo leo, rễ cây giăng mắc và là lối duy nhất dẫn tới Rừng Sâu và Đầm Lầy Tĩnh Lặng.',
      landmarks: [
        'Cánh Cổng Đông Phong Ấn (East Gate)',
        'Khúc Quanh Hẻm Đá Tự Nhiên',
        'Cụm Cây Sồi Đổ Lớn Dọc Đường',
        'Dấu Vết Cổ Ngữ Đầu Tiên'
      ],
      connections: ['bellhollow', 'outer_woods', 'deep_forest', 'silent_mire'],
      icon: '🌿',
      isImplemented: true
    },
    {
      id: 'deep_forest',
      canonicalName: 'Rừng Sâu',
      subTitle: 'Deep Forest',
      tier: 'LAYER_2_FRONTIER',
      tierDisplayName: 'Tầng 2 — Frontier (Biên Viễn)',
      canvasX: 290,
      canvasY: 50,
      description: 'Vùng rừng cấm thâm u rậm rạp phía Bắc. Không gian u tối bị ngự trị bởi The Listener (Kẻ Lắng Nghe). Người chơi phải giữ im lặng và ẩn nấp trong các gốc cây rỗng.',
      landmarks: [
        'Lãnh Địa Săn Của The Listener',
        '2 Gốc Cây Rỗng Ẩn Nấp (Hollow Trees)',
        'Cột Mốc Cảnh Báo Gỗ Mục',
        'Vạt Rừng Đom Đóm Âm U'
      ],
      connections: ['crooked_path', 'silent_mire'],
      icon: '👁',
      isImplemented: true
    },

    // =========================================================================
    // TẦNG 3: FORBIDDEN REGIONS (VÙNG CẤM KHÓA THEO CỐT TRUYỆN)
    // =========================================================================
    {
      id: 'silent_mire',
      canonicalName: 'Đầm Lầy Tĩnh Lặng',
      subTitle: 'Silent Mire',
      tier: 'LAYER_3_FORBIDDEN',
      tierDisplayName: 'Tầng 3 — Forbidden (Vùng Cấm)',
      canvasX: 400,
      canvasY: 140,
      description: 'Vùng đầm lầy âm u ngập đầy bùn đen và sương độc huyền bí. Nơi lưu giữ tàn tích cổ xưa của câu đố 3 cột đá phong ấn lối lên Miếu Chuông.',
      landmarks: [
        'Vũng Bùn Lầy & Nước Đen Chìm',
        'Cầu Gỗ Phế Tích Mục Nát',
        'Cổng Đá Dẫn Vào Trận Địa Cổ Ngữ',
        'Lối Đá Dẫn Lên Miếu Chuông Vỡ'
      ],
      connections: ['crooked_path', 'deep_forest', 'ancient_rune_puzzle', 'broken_bell_shrine'],
      icon: '🌫',
      isImplemented: true
    },
    {
      id: 'ancient_rune_puzzle',
      canonicalName: 'Khu Vực Câu Đố Cổ Ngữ',
      subTitle: 'Ancient Rune Puzzle',
      tier: 'LAYER_3_FORBIDDEN',
      tierDisplayName: 'Tầng 3 — Forbidden (Vùng Cấm)',
      canvasX: 400,
      canvasY: 250,
      description: 'Khoảng sân tế đá thiêng liêng nằm giữa đầm lầy. Ba cột đá cổ ngữ đại diện cho Mặt Trăng, Rễ Cây và Con Mắt canh giữ chìa khóa mở đường tới Miếu Chuông.',
      landmarks: [
        'Sân Đá Tế Cổ Xưa Thiêng Liêng',
        'Cột Cổ Ngữ Mặt Trăng (Pillar Moon)',
        'Cột Cổ Ngữ Rễ Cây (Pillar Root)',
        'Cột Cổ Ngữ Con Mắt (Pillar Eye)',
        'Bệ Đá Tế Trung Tâm (Stone Altar)'
      ],
      connections: ['silent_mire'],
      icon: '🔮',
      isImplemented: true
    },
    {
      id: 'broken_bell_shrine',
      canonicalName: 'Miếu Chuông Phế Tích',
      subTitle: 'The Broken Bell Shrine',
      tier: 'LAYER_3_FORBIDDEN',
      tierDisplayName: 'Tầng 3 — Forbidden (Vùng Cấm)',
      canvasX: 465,
      canvasY: 50,
      description: 'Ngôi miếu đổ nát cổ kính ngự trị trên đỉnh phế tích phía Đông Bắc. Nơi phong ấn mảnh Chuông Cổ và Chày Chuông (Clapper) mang theo định mệnh giải thoát khu rừng.',
      landmarks: [
        'Miếu Chuông Cổ Phế Tích',
        'Bệ Thờ Quả Chuông Vỡ (Shrine Altar)',
        'Vòng Tròn Phù Hiệu Đá Phong Ấn',
        'Nơi Thu Thập Chày Chuông (Clapper)'
      ],
      connections: ['silent_mire'],
      icon: '🔔',
      isImplemented: true
    },

    // =========================================================================
    // VÙNG MỞ RỘNG TƯƠNG LAI (CHƯA TRIỂN KHAI — LỘ TRÌNH V1.3)
    // =========================================================================
    {
      id: 'the_depths',
      canonicalName: 'Vực Sâu Cổ Đại',
      subTitle: 'The Ancient Depths (V1.3)',
      tier: 'UNIMPLEMENTED',
      tierDisplayName: 'Chưa Triển Khai (Lộ Trình V1.3)',
      canvasX: 465,
      canvasY: 275,
      description: 'Vết nứt địa chấn sâu thẳm dẫn xuống mạng lưới hang ngầm và di tích cổ xưa bị lãng quên. Khu vực đang nằm trong quy hoạch phát triển cho phiên bản V1.3.',
      landmarks: [
        'Khe Nứt Địa Chấn Phong Ấn',
        'Cổng Vòm Hầm Ngục Đang Đóng Kín',
        'Biển Cảnh Báo Nguy Hiểm V1.3'
      ],
      connections: [],
      icon: '⏳',
      isImplemented: false
    }
  ];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.playerState = PlayerState.getInstance();
    this.gatingSystem = WorldGatingSystem.getInstance();
    this.zoneRegistry = ZoneConnectionRegistry.getInstance();

    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(9600);

    this.contentContainer = scene.add.container(0, 0);

    this.buildUI();
    this.container.setVisible(false);

    // Lắng nghe phím bấm J, ESC và số 1, 2, 3 chuyển tab (tương thích UniKey/EVKey)
    if (scene.input && scene.input.keyboard) {
      scene.input.keyboard.on('keydown-J', () => this.toggle());
      scene.input.keyboard.on('keydown-ESC', () => {
        if (this.isOpen) this.close();
      });
      scene.input.keyboard.on('keydown-ONE', () => {
        if (this.isOpen) {
          this.currentTab = 'quest';
          this.refresh();
        }
      });
      scene.input.keyboard.on('keydown-TWO', () => {
        if (this.isOpen) {
          this.currentTab = 'lore';
          this.refresh();
        }
      });
      scene.input.keyboard.on('keydown-THREE', () => {
        if (this.isOpen) {
          this.currentTab = 'map';
          this.refresh();
        }
      });
      scene.input.keyboard.on('keydown-M', () => {
        if (this.isOpen) {
          this.currentTab = 'map';
          this.refresh();
        }
      });
    }
  }

  private buildUI(): void {
    const modalW = 840;
    const modalH = 520;
    const modalX = (1280 - modalW) / 2; // 220
    const modalY = (720 - modalH) / 2;  // 100

    // 1. Lớp phủ đen mờ nền toàn màn hình HD 1280×720
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 0.78);
    overlay.fillRect(0, 0, 1280, 720);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, 1280, 720), Phaser.Geom.Rectangle.Contains);

    // 2. Khung sổ nhật ký giấy da sẫm màu chuẩn HD (840×520 px)
    const book = this.scene.add.graphics();
    book.fillStyle(0x151310, 0.98); // Nền giấy da cổ tối
    book.fillRoundedRect(modalX, modalY, modalW, modalH, 10);
    book.lineStyle(2, 0xa08149, 1);
    book.strokeRoundedRect(modalX, modalY, modalW, modalH, 10);
    book.lineStyle(1, 0x4a3c22, 0.8);
    book.strokeRoundedRect(modalX + 4, modalY + 4, modalW - 8, modalH - 8, 8);

    // Tiêu đề chính
    const title = HDTextHelper.createText(this.scene, modalX + 25, modalY + 20, '📖 SỔ TAY LỮ KHÁCH [Phím J]', {
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#d4af37',
      stroke: '#000000',
      strokeThickness: 3
    });

    // Nút đóng [✕]
    const closeBtn = HDTextHelper.createText(this.scene, modalX + modalW - 30, modalY + 22, '✕', {
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#e74c3c'
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      AudioManager.getInstance().playInteract();
      this.close();
    });

    // 3. Ba Tab điều hướng chuẩn HD: [1. NHIỆM VỤ], [2. CỔ THƯ], [3. BẢN ĐỒ THẾ GIỚI]
    this.tabQuestBtn = HDTextHelper.createText(this.scene, modalX + 270, modalY + 22, '[1. NHIỆM VỤ]', {
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#f39c12'
    }).setInteractive({ useHandCursor: true });
    this.tabQuestBtn.on('pointerdown', () => {
      AudioManager.getInstance().playInteract();
      this.currentTab = 'quest';
      this.refresh();
    });

    this.tabLoreBtn = HDTextHelper.createText(this.scene, modalX + 410, modalY + 22, '[2. CỔ THƯ & MANH MỐI]', {
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#7f8c8d'
    }).setInteractive({ useHandCursor: true });
    this.tabLoreBtn.on('pointerdown', () => {
      AudioManager.getInstance().playInteract();
      this.currentTab = 'lore';
      this.refresh();
    });

    this.tabMapBtn = HDTextHelper.createText(this.scene, modalX + 630, modalY + 22, '[3. BẢN ĐỒ THẾ GIỚI]', {
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#7f8c8d'
    }).setInteractive({ useHandCursor: true });
    this.tabMapBtn.on('pointerdown', () => {
      AudioManager.getInstance().playInteract();
      this.currentTab = 'map';
      this.selectedZoneId = this.playerState.getCurrentZone();
      this.refresh();
    });

    this.container.add([overlay, book, title, closeBtn, this.tabQuestBtn, this.tabLoreBtn, this.tabMapBtn, this.contentContainer]);
  }

  public toggle(): void {
    const now = performance.now();
    if (now - this.lastToggleTime < 250) return;
    this.lastToggleTime = now;

    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  public open(): void {
    const ui = this.scene as any;
    // Ngăn chặn mở khi đối thoại đang chạy (GATE 1B Mutual Exclusion)
    if (ui && ui.isDialogueActive && !this.isOpen) {
      return;
    }
    // Đóng Crafting nếu đang mở
    if (ui && ui.craftingModal && ui.craftingModal.isOpen) {
      ui.craftingModal.close();
    }

    this.isOpen = true;
    this.selectedZoneId = this.playerState.getCurrentZone();
    this.refresh();
    this.container.setVisible(true);
    if (this.onOpen) {
      this.onOpen();
    }
  }

  public openTab(tab: JournalTab): void {
    this.currentTab = tab;
    this.open();
  }

  public openMap(): void {
    this.openTab('map');
  }

  public close(): void {
    this.isOpen = false;
    this.container.setVisible(false);
    if (this.onClose) {
      this.onClose();
    }
  }

  public refresh(): void {
    this.contentContainer.removeAll(true);

    const modalW = 840;
    const modalH = 520;
    const modalX = (1280 - modalW) / 2; // 220
    const modalY = (720 - modalH) / 2;  // 100

    // Cập nhật màu sắc 3 Tab
    this.tabQuestBtn.setColor(this.currentTab === 'quest' ? '#f39c12' : '#7f8c8d');
    this.tabLoreBtn.setColor(this.currentTab === 'lore' ? '#f39c12' : '#7f8c8d');
    this.tabMapBtn.setColor(this.currentTab === 'map' ? '#f39c12' : '#7f8c8d');

    if (this.currentTab === 'quest') {
      this.renderQuestTab(modalX, modalY, modalW, modalH);
    } else if (this.currentTab === 'lore') {
      this.renderLoreTab(modalX, modalY, modalW, modalH);
    } else {
      this.renderMapTab(modalX, modalY, modalW, modalH);
    }
  }

  // ===========================================================================
  // TAB 1: TIẾN TRÌNH NHIỆM VỤ (QUEST TAB)
  // ===========================================================================
  private renderQuestTab(mx: number, my: number, mw: number, mh: number): void {
    // Đường gáy sổ phân 2 trang
    const spine = this.scene.add.graphics();
    spine.lineStyle(2, 0x4a3c22, 0.7);
    spine.lineBetween(mx + mw / 2, my + 60, mx + mw / 2, my + mh - 25);
    this.contentContainer.add(spine);

    const currentQ = this.playerState.getCurrentQuest();
    if (!currentQ) {
      const emptyQ = HDTextHelper.createText(this.scene, mx + mw / 4, my + 150, 'Hiện tại chưa có nhiệm vụ nào được kích hoạt.', {
        fontSize: '14px',
        fontStyle: 'italic',
        color: '#95a5a6',
        wordWrap: { width: mw / 2 - 50 }
      });
      this.contentContainer.add(emptyQ);
      return;
    }

    // Cột bên trái: Chi tiết nhiệm vụ chính hiện tại
    const qTitle = HDTextHelper.createText(this.scene, mx + 30, my + 70, currentQ.title, {
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#e67e22',
      stroke: '#000000',
      strokeThickness: 2
    });

    const qDesc = HDTextHelper.createText(this.scene, mx + 30, my + 105, currentQ.description, {
      fontSize: '13px',
      color: '#bdc3c7',
      wordWrap: { width: mw / 2 - 50 },
      lineSpacing: 5
    });

    const taskTitle = HDTextHelper.createText(this.scene, mx + 30, my + 175, 'MỤC TIÊU CẦN LÀM:', {
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#f1c40f'
    });

    let taskY = my + 205;
    for (const task of currentQ.tasks) {
      const mark = task.done ? '☑' : '☐';
      const color = task.done ? '#2ecc71' : '#f8f9fa';
      const t = HDTextHelper.createText(this.scene, mx + 30, taskY, `${mark} ${task.text}`, {
        fontSize: '13px',
        color: color,
        wordWrap: { width: mw / 2 - 50 },
        lineSpacing: 4
      });
      this.contentContainer.add(t);
      taskY += 34;
    }

    // Cột bên phải: Danh mục các Hồi đã mở khóa
    const histTitle = HDTextHelper.createText(this.scene, mx + mw / 2 + 30, my + 70, 'DANH SÁCH CÁC HỒI:', {
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#3498db'
    });

    let histY = my + 108;
    for (const q of this.playerState.quests.values()) {
      const isCurrent = q.id === currentQ.id;
      const marker = isCurrent ? '▶ ' : '• ';
      const color = isCurrent ? '#f39c12' : '#95a5a6';

      const row = HDTextHelper.createText(this.scene, mx + mw / 2 + 30, histY, `${marker}${q.title}`, {
        fontSize: '14px',
        fontStyle: isCurrent ? 'bold' : 'normal',
        color: color
      });
      this.contentContainer.add(row);
      histY += 32;
    }

    this.contentContainer.add([qTitle, qDesc, taskTitle, histTitle]);
  }

  // ===========================================================================
  // TAB 2: CỔ THƯ & MANH MỐI (LORE TAB)
  // ===========================================================================
  private renderLoreTab(mx: number, my: number, mw: number, mh: number): void {
    // Đường gáy sổ phân 2 trang
    const spine = this.scene.add.graphics();
    spine.lineStyle(2, 0x4a3c22, 0.7);
    spine.lineBetween(mx + mw / 2, my + 60, mx + mw / 2, my + mh - 25);
    this.contentContainer.add(spine);

    const list = this.playerState.unlockedLore;
    if (list.length === 0) {
      const emptyText = HDTextHelper.createText(this.scene, mx + mw / 2, my + mh / 2, 'Chưa tìm thấy cổ thư hay manh mối nào trong Khu Rừng Rỗng (The Hollow Woods)...\nHãy khám phá các miếu thờ và tàn tích cổ.', {
        fontSize: '16px',
        fontStyle: 'italic',
        color: '#7f8c8d',
        align: 'center'
      }).setOrigin(0.5, 0.5);
      this.contentContainer.add(emptyText);
      return;
    }

    if (this.currentLoreIndex >= list.length) {
      this.currentLoreIndex = 0;
    }

    const entry: LoreEntry = list[this.currentLoreIndex];

    const lTitle = HDTextHelper.createText(this.scene, mx + 40, my + 70, entry.title, {
      fontSize: '19px',
      fontStyle: 'bold',
      color: '#d4af37',
      stroke: '#000000',
      strokeThickness: 2
    });

    const lAuthor = HDTextHelper.createText(this.scene, mx + 40, my + 102, `Ghi lại bởi: ${entry.author}`, {
      fontSize: '13px',
      fontStyle: 'italic',
      color: '#95a5a6'
    });

    const lContent = HDTextHelper.createText(this.scene, mx + 40, my + 135, entry.content, {
      fontSize: '15px',
      color: '#f0e6d2',
      wordWrap: { width: mw - 80 },
      lineSpacing: 8
    });

    const prevBtn = HDTextHelper.createText(this.scene, mx + mw / 2 - 130, my + mh - 30, '◀ Trang Trước', {
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#f39c12'
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });
    prevBtn.on('pointerdown', () => {
      AudioManager.getInstance().playInteract();
      this.currentLoreIndex = (this.currentLoreIndex - 1 + list.length) % list.length;
      this.refresh();
    });

    const pageIndicator = HDTextHelper.createText(this.scene, mx + mw / 2, my + mh - 30, `Trang ${this.currentLoreIndex + 1} / ${list.length}`, {
      fontSize: '14px',
      color: '#bdc3c7'
    }).setOrigin(0.5, 0.5);

    const nextBtn = HDTextHelper.createText(this.scene, mx + mw / 2 + 130, my + mh - 30, 'Trang Sau ▶', {
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#f39c12'
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });
    nextBtn.on('pointerdown', () => {
      AudioManager.getInstance().playInteract();
      this.currentLoreIndex = (this.currentLoreIndex + 1) % list.length;
      this.refresh();
    });

    this.contentContainer.add([lTitle, lAuthor, lContent, prevBtn, pageIndicator, nextBtn]);
  }

  // ===========================================================================
  // TAB 3: BẢN ĐỒ THẾ GIỚI TÍCH HỢP TOÀN PHẦN (WORLD MAP TAB)
  // ===========================================================================
  private renderMapTab(mx: number, my: number, _mw: number, _mh: number): void {
    const currentZone = this.playerState.getCurrentZone();

    // 1. Kích thước & Tọa độ 2 khung hiển thị
    const mapCanvasX = mx + 20;   // 240
    const mapCanvasY = my + 60;   // 160
    const mapCanvasW = 515;       // Chiều rộng bản đồ bên trái
    const mapCanvasH = 435;       // Chiều cao bản đồ bên trái

    const inspX = mapCanvasX + mapCanvasW + 15; // 770
    const inspY = mapCanvasY;                   // 160
    const inspW = 250;                          // Chiều rộng bảng thanh tra bên phải
    const inspH = mapCanvasH;                   // 435

    // 2. Vẽ khung nền bản đồ bên trái
    const mapBg = this.scene.add.graphics();
    mapBg.fillStyle(0x0e131b, 0.96); // Nền lam đen huyền bí
    mapBg.fillRoundedRect(mapCanvasX, mapCanvasY, mapCanvasW, mapCanvasH, 8);
    mapBg.lineStyle(1.5, 0x3d4b60, 0.9);
    mapBg.strokeRoundedRect(mapCanvasX, mapCanvasY, mapCanvasW, mapCanvasH, 8);

    // Lưới tọa độ địa hình mờ tinh tế
    mapBg.lineStyle(1, 0x182434, 0.4);
    for (let lx = mapCanvasX + 40; lx < mapCanvasX + mapCanvasW; lx += 45) {
      mapBg.lineBetween(lx, mapCanvasY + 40, lx, mapCanvasY + mapCanvasH - 30);
    }
    for (let ly = mapCanvasY + 40; ly < mapCanvasY + mapCanvasH - 20; ly += 45) {
      mapBg.lineBetween(mapCanvasX + 15, ly, mapCanvasX + mapCanvasW - 15, ly);
    }

    // Header bản đồ: Tiêu đề + Thống kê khám phá
    const exploredCount = this.mapNodes
      .filter(n => n.id !== 'the_depths')
      .filter(n => this.playerState.hasVisitedZone(n.id)).length;

    const mapTitle = HDTextHelper.createText(this.scene, mapCanvasX + 16, mapCanvasY + 12, '🗺 BẢN ĐỒ THẾ GIỚI — KHU RỪNG RỖNG (THE HOLLOW WOODS)', {
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#f1c40f'
    });

    const mapStats = HDTextHelper.createText(this.scene, mapCanvasX + mapCanvasW - 16, mapCanvasY + 12, `Đã Khai Mở: ${exploredCount}/9 Vùng`, {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#3498db'
    }).setOrigin(1, 0);

    // Chú giải nhanh phía dưới bản đồ (Mini Legend)
    const legendText = HDTextHelper.createText(this.scene, mapCanvasX + 16, mapCanvasY + mapCanvasH - 22, '🟡 Vùng Lõi   🟢 Biên Viễn   🟣 Vùng Cấm   📍 Bạn Ở Đây   🔒 Đang Khóa', {
      fontSize: '11px',
      color: '#95a5a6'
    });

    this.contentContainer.add([mapBg, mapTitle, mapStats, legendText]);

    // 3. Vẽ các tuyến kết nối (Connections) giữa các node
    const connGraphics = this.scene.add.graphics();
    const renderedPairs = new Set<string>();

    for (const node of this.mapNodes) {
      const fromStatus = this.getNodeStatus(node.id);
      const x1 = mapCanvasX + node.canvasX;
      const y1 = mapCanvasY + node.canvasY + 15;

      for (const targetId of node.connections) {
        const pairKey = node.id < targetId ? `${node.id}-${targetId}` : `${targetId}-${node.id}`;
        if (renderedPairs.has(pairKey)) continue;
        renderedPairs.add(pairKey);

        const targetNode = this.mapNodes.find(n => n.id === targetId);
        if (!targetNode) continue;

        const toStatus = this.getNodeStatus(targetId);
        const x2 = mapCanvasX + targetNode.canvasX;
        const y2 = mapCanvasY + targetNode.canvasY + 15;

        // Xác định kiểu đường kết nối
        const bothOpenOrExplored = (fromStatus === 'EXPLORED' || fromStatus === 'OPEN') &&
                                   (toStatus === 'EXPLORED' || toStatus === 'OPEN');

        if (node.id === 'the_depths' || targetId === 'the_depths') {
          // Tuyến chưa triển khai: nét đứt xám mờ
          connGraphics.lineStyle(1.5, 0x444444, 0.4);
          this.drawDashedLine(connGraphics, x1, y1, x2, y2, 5, 4);
        } else if (bothOpenOrExplored) {
          // Tuyến đường đã thông suốt: nét liền sáng màu vàng kim hoặc lam ngọc
          if (fromStatus === 'EXPLORED' && toStatus === 'EXPLORED') {
            connGraphics.lineStyle(2, 0xd4af37, 0.85);
          } else {
            connGraphics.lineStyle(2, 0x3498db, 0.75);
          }
          connGraphics.lineBetween(x1, y1, x2, y2);
        } else {
          // Tuyến đường đang bị khóa/phong ấn: nét đứt đỏ cam
          connGraphics.lineStyle(1.5, 0xc0392b, 0.7);
          this.drawDashedLine(connGraphics, x1, y1, x2, y2, 6, 4);
        }
      }
    }
    this.contentContainer.add(connGraphics);

    // 4. Vẽ các Nút Phân Khu (Zone Nodes)
    const nodeWidth = 62;
    const nodeHeight = 36;

    for (const node of this.mapNodes) {
      const status = this.getNodeStatus(node.id);
      const isCurrent = (node.id === currentZone);
      const isSelected = (node.id === this.selectedZoneId);

      const nx = mapCanvasX + node.canvasX;
      const ny = mapCanvasY + node.canvasY + 15;
      const bx = nx - nodeWidth / 2;
      const by = ny - nodeHeight / 2;

      const nodeG = this.scene.add.graphics();

      // Hiệu ứng Vòng Hào Quang Nhấp Nháy cho Vị Trí Hiện Tại (Current Beacon)
      if (isCurrent) {
        nodeG.lineStyle(2, 0xffd700, 0.9);
        nodeG.strokeCircle(nx, ny, 26);
        nodeG.lineStyle(1, 0xffeaa7, 0.4);
        nodeG.strokeCircle(nx, ny, 30);
      }

      // Màu nền & viền của Nút dựa theo trạng thái và tầng
      let fillColor = 0x161616;
      let strokeColor = 0x4f4f4f;
      let strokeAlpha = 0.8;
      let fillAlpha = 0.95;

      if (status === 'EXPLORED') {
        if (node.tier === 'LAYER_1_CORE') {
          fillColor = 0x2a210d;
          strokeColor = 0xf1c40f;
        } else if (node.tier === 'LAYER_2_FRONTIER') {
          fillColor = 0x0c2518;
          strokeColor = 0x2ecc71;
        } else if (node.tier === 'LAYER_3_FORBIDDEN') {
          fillColor = 0x261033;
          strokeColor = 0x9b59b6;
        }
      } else if (status === 'OPEN') {
        fillColor = 0x0a2233;
        strokeColor = 0x00d2d3; // Xanh cyan sáng rực
        strokeAlpha = 1.0;
      } else if (status === 'LOCKED') {
        fillColor = 0x151515;
        strokeColor = 0x555555;
      } else if (status === 'UNIMPLEMENTED') {
        fillColor = 0x111111;
        strokeColor = 0x333333;
        strokeAlpha = 0.5;
      }

      // Nếu đang được chọn (Selected): viền trắng sáng nổi bật
      if (isSelected) {
        strokeColor = 0xffffff;
        strokeAlpha = 1.0;
      }

      nodeG.fillStyle(fillColor, fillAlpha);
      nodeG.fillRoundedRect(bx, by, nodeWidth, nodeHeight, 6);
      nodeG.lineStyle(isSelected ? 2.5 : 1.5, strokeColor, strokeAlpha);
      nodeG.strokeRoundedRect(bx, by, nodeWidth, nodeHeight, 6);

      // Icon và Tên hiển thị trên nút
      let iconStr = node.icon;
      if (status === 'LOCKED') iconStr = '🔒';
      else if (status === 'OPEN') iconStr = '🔓';
      else if (status === 'UNIMPLEMENTED') iconStr = '⏳';

      const shortName = this.getShortZoneName(node.id);
      let textColor = '#ffffff';
      if (status === 'OPEN') textColor = '#00d2d3';
      else if (status === 'LOCKED') textColor = '#888888';
      else if (status === 'UNIMPLEMENTED') textColor = '#555555';

      const nodeText = HDTextHelper.createText(this.scene, nx, ny - 6, iconStr, {
        fontSize: '12px'
      }).setOrigin(0.5, 0.5);

      const nameText = HDTextHelper.createText(this.scene, nx, ny + 8, shortName, {
        fontSize: '9.5px',
        fontStyle: isSelected ? 'bold' : 'normal',
        color: textColor
      }).setOrigin(0.5, 0.5);

      // Nhãn "[📍 BẠN Ở ĐÂY]" phía trên đỉnh nếu là vị trí hiện tại
      let currentBadge: Phaser.GameObjects.Text | null = null;
      if (isCurrent) {
        currentBadge = HDTextHelper.createText(this.scene, nx, by - 8, '📍 BẠN Ở ĐÂY', {
          fontSize: '9px',
          fontStyle: 'bold',
          color: '#ffd700',
          stroke: '#000000',
          strokeThickness: 2
        }).setOrigin(0.5, 0.5);
      }

      // Vùng tương tác chọn nút
      const hitZone = this.scene.add.zone(nx, ny, nodeWidth + 6, nodeHeight + 6);
      hitZone.setInteractive({ useHandCursor: true });
      hitZone.on('pointerdown', () => {
        AudioManager.getInstance().playInteract();
        this.selectedZoneId = node.id;
        this.refresh();
      });
      hitZone.on('pointerover', () => {
        if (this.selectedZoneId !== node.id) {
          this.selectedZoneId = node.id;
          this.refresh();
        }
      });

      this.contentContainer.add([nodeG, nodeText, nameText, hitZone]);
      if (currentBadge) {
        this.contentContainer.add(currentBadge);
      }
    }

    // 5. Vẽ Bảng Chi Tiết Phân Khu Bên Phải (Zone Inspector Panel)
    this.renderZoneInspector(inspX, inspY, inspW, inspH, currentZone);
  }

  // ===========================================================================
  // BẢNG CHI TIẾT PHÂN KHU (ZONE INSPECTOR PANEL)
  // ===========================================================================
  private renderZoneInspector(ix: number, iy: number, iw: number, ih: number, currentZone: string): void {
    const selectedNode = this.mapNodes.find(n => n.id === this.selectedZoneId) || this.mapNodes[1];
    const status = this.getNodeStatus(selectedNode.id);
    const isCurrent = (selectedNode.id === currentZone);

    // Khung nền bảng thanh tra bên phải
    const panelBg = this.scene.add.graphics();
    panelBg.fillStyle(0x14120f, 0.98);
    panelBg.fillRoundedRect(ix, iy, iw, ih, 8);
    panelBg.lineStyle(1.5, 0xa08149, 0.9);
    panelBg.strokeRoundedRect(ix, iy, iw, ih, 8);

    // Tiêu đề bảng thanh tra
    const panelHeader = HDTextHelper.createText(this.scene, ix + 14, iy + 14, '📜 CHI TIẾT ĐỊA DANH', {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#d4af37'
    });

    // Đường gạch ngang phân cách
    panelBg.lineStyle(1, 0x4a3c22, 0.8);
    panelBg.lineBetween(ix + 12, iy + 34, ix + iw - 12, iy + 34);

    // Tên phân khu in hoa nổi bật
    const zoneTitle = HDTextHelper.createText(this.scene, ix + 14, iy + 42, selectedNode.canonicalName.toUpperCase(), {
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#f39c12',
      wordWrap: { width: iw - 28 }
    });

    const subTitle = HDTextHelper.createText(this.scene, ix + 14, iy + 64, selectedNode.subTitle, {
      fontSize: '11px',
      fontStyle: 'italic',
      color: '#95a5a6'
    });

    // Huy hiệu Tầng Thế Giới
    let tierColor = '#f1c40f';
    if (selectedNode.tier === 'LAYER_2_FRONTIER') tierColor = '#2ecc71';
    else if (selectedNode.tier === 'LAYER_3_FORBIDDEN') tierColor = '#9b59b6';
    else if (selectedNode.tier === 'UNIMPLEMENTED') tierColor = '#7f8c8d';

    const tierBadge = HDTextHelper.createText(this.scene, ix + 14, iy + 82, selectedNode.tierDisplayName, {
      fontSize: '10.5px',
      fontStyle: 'bold',
      color: tierColor
    });

    // Trạng thái trực quan 4 loại
    let statusText = '🌟 ĐÃ KHÁM PHÁ';
    let statusColor = '#2ecc71';
    if (status === 'OPEN') {
      statusText = '🔓 ĐANG MỞ — SẴN SÀNG TIẾN VÀO';
      statusColor = '#3498db';
    } else if (status === 'LOCKED') {
      statusText = '🔒 ĐANG KHÓA THEO CỐT TRUYỆN';
      statusColor = '#e74c3c';
    } else if (status === 'UNIMPLEMENTED') {
      statusText = '⏳ CHƯA TRIỂN KHAI (V1.3)';
      statusColor = '#7f8c8d';
    }

    const statusBadge = HDTextHelper.createText(this.scene, ix + 14, iy + 102, statusText, {
      fontSize: '11px',
      fontStyle: 'bold',
      color: statusColor
    });

    // Huy hiệu nếu nhân vật đang có mặt tại đây
    let curLocText: Phaser.GameObjects.Text | null = null;
    let nextY = iy + 124;
    if (isCurrent) {
      curLocText = HDTextHelper.createText(this.scene, ix + 14, nextY, '📍 BẠN ĐANG CÓ MẶT TẠI ĐÂY', {
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#ffd700',
        stroke: '#000000',
        strokeThickness: 2
      });
      nextY += 20;
    }

    // Mô tả không gian phân khu
    const descText = HDTextHelper.createText(this.scene, ix + 14, nextY, selectedNode.description, {
      fontSize: '11px',
      color: '#bdc3c7',
      wordWrap: { width: iw - 28 },
      lineSpacing: 3
    });
    nextY += descText.height + 10;

    // Danh sách điểm mốc quan trọng (Landmarks)
    const landmarkHeader = HDTextHelper.createText(this.scene, ix + 14, nextY, '• ĐIỂM MỐC NỔI BẬT:', {
      fontSize: '11.5px',
      fontStyle: 'bold',
      color: '#f1c40f'
    });
    nextY += 18;

    const landmarkLines = selectedNode.landmarks.slice(0, 4).map(lm => `– ${lm}`).join('\n');
    const landmarksText = HDTextHelper.createText(this.scene, ix + 14, nextY, landmarkLines, {
      fontSize: '10.5px',
      color: '#ecf0f1',
      wordWrap: { width: iw - 28 },
      lineSpacing: 2
    });
    nextY += landmarksText.height + 8;

    // Tuyến kết nối liên vùng (Exits & Routes từ ZoneConnectionRegistry)
    if (selectedNode.id !== 'the_depths') {
      const neighbors = this.zoneRegistry.getNeighbors(selectedNode.id as ZoneId);
      if (neighbors && neighbors.length > 0) {
        const exitHeader = HDTextHelper.createText(this.scene, ix + 14, nextY, '• LỐI THÔNG LIÊN VÙNG:', {
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#3498db'
        });
        nextY += 16;
        const exitLines = neighbors.slice(0, 3).map(n => `→ ${n.displayLabel}`).join('\n');
        const exitsText = HDTextHelper.createText(this.scene, ix + 14, nextY, exitLines, {
          fontSize: '9.5px',
          color: '#bdc3c7',
          wordWrap: { width: iw - 28 },
          lineSpacing: 2
        });
        nextY += exitsText.height + 8;
        this.contentContainer.add([exitHeader, exitsText]);
      }
    }

    // Gợi ý / Cảnh báo Khóa đường (Gating Condition & Hint)
    let gatingText: Phaser.GameObjects.Text | null = null;
    if (status === 'LOCKED') {
      const rule = this.gatingSystem.getRule(selectedNode.id as ZoneId);
      const reason = rule?.lockedReasonVietnamese || 'Khu vực này hiện đang bị niêm phong.';
      const hint = rule?.hintVietnamese || 'Tiếp tục chuỗi nhiệm vụ để mở khóa.';

      gatingText = HDTextHelper.createText(this.scene, ix + 14, nextY, `⚠️ RÀO CHẮN:\n${reason}\n💡 GỢI Ý:\n${hint}`, {
        fontSize: '10px',
        color: '#e67e22',
        wordWrap: { width: iw - 28 },
        lineSpacing: 2
      });
    } else if (status === 'OPEN') {
      gatingText = HDTextHelper.createText(this.scene, ix + 14, nextY, '✔ Tuyến đường đã thông suốt! Người chơi có thể tự do tiến vào khám phá.', {
        fontSize: '10.5px',
        color: '#2ecc71',
        wordWrap: { width: iw - 28 }
      });
    } else if (status === 'UNIMPLEMENTED') {
      gatingText = HDTextHelper.createText(this.scene, ix + 14, nextY, '⏳ Khu vực này thuộc phân kỳ phát triển tiếp theo của thế giới Hollow Woods.', {
        fontSize: '10.5px',
        color: '#95a5a6',
        wordWrap: { width: iw - 28 }
      });
    }

    this.contentContainer.add([panelBg, panelHeader, zoneTitle, subTitle, tierBadge, statusBadge, descText, landmarkHeader, landmarksText]);
    if (curLocText) this.contentContainer.add(curLocText);
    if (gatingText) this.contentContainer.add(gatingText);
  }

  // ===========================================================================
  // CÁC HÀM TIỆN ÍCH TÍNH TOÁN TRẠNG THÁI VÀ ĐỒ HỌA
  // ===========================================================================
  public getNodeStatus(zoneId: string): WorldMapZoneStatus {
    if (zoneId === 'the_depths') {
      return 'UNIMPLEMENTED';
    }

    if (this.playerState.hasVisitedZone(zoneId)) {
      return 'EXPLORED';
    }

    if (this.gatingSystem.isZoneUnlocked(zoneId as ZoneId, this.playerState)) {
      return 'OPEN';
    }

    return 'LOCKED';
  }

  private getShortZoneName(id: string): string {
    switch (id) {
      case 'fog_crossing': return 'Lối Mòn';
      case 'bellhollow': return 'Làng';
      case 'sanctuary_farm': return 'Nông Trại';
      case 'outer_woods': return 'Rừng Ven';
      case 'crooked_path': return 'Đường Quanh';
      case 'deep_forest': return 'Rừng Sâu';
      case 'silent_mire': return 'Đầm Lầy';
      case 'ancient_rune_puzzle': return 'Cổ Ngữ';
      case 'broken_bell_shrine': return 'Miếu Chuông';
      case 'the_depths': return 'Vực Sâu';
      default: return id;
    }
  }

  private drawDashedLine(
    g: Phaser.GameObjects.Graphics,
    x1: number, y1: number,
    x2: number, y2: number,
    dashLen: number = 6,
    gapLen: number = 4
  ): void {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy);
    if (dist === 0) return;

    let curDist = 0;
    while (curDist < dist) {
      const startX = x1 + (dx / dist) * curDist;
      const startY = y1 + (dy / dist) * curDist;
      const segmentEndDist = Math.min(curDist + dashLen, dist);
      const endX = x1 + (dx / dist) * segmentEndDist;
      const endY = y1 + (dy / dist) * segmentEndDist;

      g.lineBetween(startX, startY, endX, endY);
      curDist += dashLen + gapLen;
    }
  }

  /**
   * C4-13-09: Dọn dẹp đối tượng hiển thị Modal tránh rò rỉ bộ nhớ
   */
  public destroy(): void {
    if (this.contentContainer) {
      this.contentContainer.removeAll(true);
      this.contentContainer.destroy();
    }
    if (this.container) {
      this.container.removeAll(true);
      this.container.destroy();
    }
  }
}
