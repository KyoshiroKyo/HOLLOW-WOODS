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
import { PlayerState } from '../state/PlayerState';
import { HDTextHelper } from '../utils/HDTextHelper';
import { ZoneId, WorldTier } from '../types';
import { WorldGatingSystem } from '../world/WorldGatingSystem';
import { ZoneConnectionRegistry } from '../world/ZoneConnectionRegistry';
import { AudioManager } from '../audio/AudioManager';
import { QuestSystem } from '../systems/QuestSystem';
import { ItemTooltipHelper } from './ItemTooltipHelper';
import { projectLoreEntryForDisplay } from '../systems/IdentityRevealResolver';
import {
  PORTRAIT_SKULL_WOLF,
  PORTRAIT_SHADOW_BIG_BOSS,
  PORTRAIT_FALLEN_KNIGHT,
  PORTRAIT_DREAD_HORSEMAN,
  PORTRAIT_HOODED_KNIGHT
} from '../config/Constants';

export type JournalTab = 'quest' | 'lore' | 'bestiary' | 'map';
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
  private tabBestiaryBtn!: Phaser.GameObjects.Text;
  private tabMapBtn!: Phaser.GameObjects.Text;

  private questFilter: 'all' | 'main' | 'side' = 'all';
  private selectedBestiarySpecies: string = 'crow';

  public isOpen: boolean = false;
  private lastToggleTime: number = 0;
  private keyHandlers: Array<{ key: string; fn: any }> = [];

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
      description: 'Ngôi làng trú ẩn an toàn của các cư dân còn sống sót. Nơi đặt Tháp Chuông Cổ, bàn chế tạo vật phẩm và nơi sinh sống của Bà Lão Edda cùng Thầy Thuốc Neris.',
      landmarks: [
        'Tháp Chuông Cổ Đại (The Great Bell)',
        'Bàn Chế Tạo Dụng Cụ & Thuốc [Phím I]',
        'Nhà Edda & Thầy Thuốc Neris',
        'Giếng Nước Cổ & Bảng Cáo Thị Làng',
        'Cổng Đông Phong Ấn Dẫn Sang Rừng Cấm'
      ],
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
      icon: '🔔',
      isImplemented: true
    },

    // =========================================================================
    // VÙNG MỞ RỘNG TƯƠNG LAI (CHƯA TRIỂN KHAI)
    // =========================================================================
    {
      id: 'the_depths',
      canonicalName: 'Vực Sâu Cổ Đại',
      subTitle: 'The Ancient Depths',
      tier: 'UNIMPLEMENTED',
      tierDisplayName: 'Chưa Triển Khai (Vùng Mở Rộng)',
      canvasX: 465,
      canvasY: 275,
      description: 'Vết nứt địa chấn sâu thẳm dẫn xuống mạng lưới hang ngầm và di tích cổ xưa bị lãng quên. Khu vực đang nằm trong quy hoạch phát triển.',
      landmarks: [
        'Khe Nứt Địa Chấn Phong Ấn',
        'Cổng Vòm Hầm Ngục Đang Đóng Kín',
        'Biển Cảnh Báo Nguy Hiểm'
      ],
      icon: '⏳',
      isImplemented: false
    },

    // =========================================================================
    // TIỂU KHU KHÁM PHÁ MỚI V1.4 (SUB-AREAS)
    // =========================================================================
    {
      id: 'sub_bell_workshop',
      canonicalName: 'Xưởng Chuông Bỏ Hoang',
      subTitle: 'Abandoned Bell Workshop',
      tier: 'LAYER_1_CORE',
      tierDisplayName: 'Tiểu Khu — Rừng Ngoại Vi',
      canvasX: 255,
      canvasY: 340,
      description: 'Tàn tích xưởng đúc chuông bỏ hoang nằm ven rìa Nam Rừng Ngoại Vi. Nơi lưu giữ khuôn đúc chuông và phụ kiện sắt rèn cổ ngữ.',
      landmarks: [
        'Bàn Chế Tác Thợ Rèn Cổ',
        'Bệ Đúc Khuôn Chuông Cũ',
        'Đống Phế Liệu Sắt Rèn Cổ Ngữ',
        'Lối Ra Rừng Ngoại Vi'
      ],
      icon: '⚒️',
      isImplemented: true
    },
    {
      id: 'sub_root_cellar',
      canonicalName: 'Hầm Rễ Cổ',
      subTitle: 'Root Cellar',
      tier: 'LAYER_1_CORE',
      tierDisplayName: 'Tiểu Khu — Nông Trại Trú Ẩn',
      canvasX: 145,
      canvasY: 360,
      description: 'Căn hầm ẩm lạnh dưới nền Nông Trại Sanctuary, rễ đại thụ ngàn năm đan kín vòm đá. Nơi lưu giữ rễ thuốc quý và bích họa nguồn gốc màn sương.',
      landmarks: [
        'Cửa Sập Gỗ Nông Trại',
        'Khóm Rễ Thuốc Cổ Quý Hiếm',
        'Cơ Quan Khóa Ánh Sáng Rễ Cổ',
        'Bích Họa Nguồn Gốc Sương Mù'
      ],
      icon: '🌱',
      isImplemented: true
    },
    {
      id: 'sub_whispering_clearing',
      canonicalName: 'Khoảng Trống Thì Thầm',
      subTitle: 'Whispering Clearing',
      tier: 'LAYER_2_FRONTIER',
      tierDisplayName: 'Tiểu Khu — Vùng Biên Viễn',
      canvasX: 210,
      canvasY: 60,
      description: 'Vạt rừng trũng thâm u giữa Outer Woods và Deep Forest. Ba cột đá cổ ngữ phát ra tiếng vọng âm và ảo ảnh ký ức The Echo.',
      landmarks: [
        'Ba Cột Đá Vọng Âm',
        'Vạt Rừng Đom Đóm Huyền Ảo',
        'Lối Dẫn Vào Rừng Sâu',
        'Lối Về Đường Mòn Quanh Co'
      ],
      icon: '🔊',
      isImplemented: true
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

    // Lắng nghe phím số 1..4 & điều hướng (phím toggle J/I/ESC tập trung tại UIScene để tránh bật/tắt kép)
    const kb = scene.input?.keyboard;
    if (kb) {
      const addKey = (key: string, fn: any) => {
        kb.on(key, fn);
        this.keyHandlers.push({ key, fn });
      };
      addKey('keydown-ONE', () => {
        if (this.isOpen) {
          this.currentTab = 'quest';
          this.refresh();
        }
      });
      addKey('keydown-TWO', () => {
        if (this.isOpen) {
          this.currentTab = 'lore';
          this.refresh();
        }
      });
      addKey('keydown-THREE', () => {
        if (this.isOpen) {
          this.currentTab = 'bestiary';
          this.refresh();
        }
      });
      addKey('keydown-FOUR', () => {
        if (this.isOpen) {
          this.currentTab = 'map';
          this.selectedZoneId = this.playerState.getCurrentZone();
          this.refresh();
        }
      });
      // HW-AG-FIX-11 (H4-NEW-05): Phím M dành riêng cho Mute âm thanh; tab Bản Đồ trong Sổ Tay dùng phím [4] (và [N] ngoài thế giới).
      const handlePrev = () => {
        if (!this.isOpen) return;
        if (this.currentTab === 'lore') {
          this.prevLoreEntry();
        } else if (this.currentTab === 'bestiary') {
          this.prevBestiaryEntry();
        }
      };
      const handleNext = () => {
        if (!this.isOpen) return;
        if (this.currentTab === 'lore') {
          this.nextLoreEntry();
        } else if (this.currentTab === 'bestiary') {
          this.nextBestiaryEntry();
        }
      };
      addKey('keydown-A', handlePrev);
      addKey('keydown-LEFT', handlePrev);
      addKey('keydown-D', handleNext);
      addKey('keydown-RIGHT', handleNext);
    }
  }

  private buildUI(): void {
    const modalW = 840;
    const modalH = 520;
    const modalX = (1280 - modalW) / 2; // 220
    const modalY = (720 - modalH) / 2;  // 100

    // 1. Lớp phủ đen mờ nền toàn màn hình HD 1280×720 (Dark Woodland Dim Overlay)
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 0.75);
    overlay.fillRect(0, 0, 1280, 720);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, 1280, 720), Phaser.Geom.Rectangle.Contains);
    overlay.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Nhấp chuột ra ngoài khung sổ nhật ký để đóng an toàn (BUG-037)
      if (pointer.x < modalX || pointer.x > modalX + modalW || pointer.y < modalY || pointer.y > modalY + modalH) {
        this.close();
      }
    });

    // 2. Khung sổ nhật ký giấy da sẫm màu chuẩn HD (840×520 px) viền nẹp đồng cổ
    let bookSprite: Phaser.GameObjects.Image | undefined;
    if (this.scene.textures.exists('ui_pack_open_book_desk')) {
      bookSprite = this.scene.add.image(640, 360, 'ui_pack_open_book_desk');
      bookSprite.setDisplaySize(modalW + 60, modalH + 60);
      bookSprite.setTint(0xbaa187);
      bookSprite.setAlpha(0.65);
    }

    const book = this.scene.add.graphics();
    book.fillStyle(0x151310, 0.98); // Nền giấy da cổ tối
    book.fillRoundedRect(modalX, modalY, modalW, modalH, 10);
    book.lineStyle(2, 0xa08149, 1);
    book.strokeRoundedRect(modalX, modalY, modalW, modalH, 10);
    book.lineStyle(1, 0x4a3c22, 0.8);
    book.strokeRoundedRect(modalX + 4, modalY + 4, modalW - 8, modalH - 8, 8);

    // Đinh tán nẹp đồng 4 góc (Tarnished Brass Rivets)
    const rivetPositions = [
      { x: modalX + 10, y: modalY + 10 },
      { x: modalX + modalW - 10, y: modalY + 10 },
      { x: modalX + 10, y: modalY + modalH - 10 },
      { x: modalX + modalW - 10, y: modalY + modalH - 10 }
    ];
    book.fillStyle(0xd4af37, 0.9);
    for (const r of rivetPositions) {
      book.fillCircle(r.x, r.y, 2.5);
    }

    // Tiêu đề chính
    // V15-48: Tiêu đề Sổ Tay Lữ Khách [J] gọn gàng, cách xa các thẻ Tab điều hướng
    const title = HDTextHelper.createText(this.scene, modalX + 20, modalY + 20, '📖 SỔ TAY LỮ KHÁCH [J]', {
      fontSize: '13.5px',
      fontStyle: 'bold',
      color: '#d4af37',
      stroke: '#000000',
      strokeThickness: 3
    });

    // Nút đóng thống nhất [✕ J / ESC] viền đồng nẹp góc trên bên phải (V15-44)
    const closeBtnX = modalX + modalW - 58;
    const closeBtnY = modalY + 22;
    const closeBtnContainer = this.scene.add.container(closeBtnX, closeBtnY);

    let closeBtnSprite: Phaser.GameObjects.Image | undefined;
    if (this.scene.textures.exists('ui_pack_btn_wood')) {
      closeBtnSprite = this.scene.add.image(0, 0, 'ui_pack_btn_wood');
      closeBtnSprite.setDisplaySize(88, 24);
      closeBtnContainer.add(closeBtnSprite);
    }

    const closeBg = this.scene.add.graphics();
    const drawCloseBg = (hover: boolean) => {
      closeBg.clear();
      closeBg.fillStyle(hover ? 0x2e1810 : 0x140e0a, 0.95);
      closeBg.fillRoundedRect(-44, -12, 88, 24, 4);
      closeBg.lineStyle(1.2, hover ? 0xf1c40f : 0x7a5e35, 0.9);
      closeBg.strokeRoundedRect(-44, -12, 88, 24, 4);
    };
    drawCloseBg(false);

    const closeTxt = HDTextHelper.createText(this.scene, 0, 0, '✕ [J / ESC]', {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#e2d4b7'
    }).setOrigin(0.5, 0.5);

    closeBtnContainer.add([closeBg, closeTxt]);
    closeBtnContainer.setSize(88, 24);
    closeBtnContainer.setInteractive(new Phaser.Geom.Rectangle(-44, -12, 88, 24), Phaser.Geom.Rectangle.Contains);
    closeBtnContainer.on('pointerover', () => {
      if (closeBtnSprite) closeBtnSprite.setTexture('ui_pack_btn_wood_hover');
      drawCloseBg(true);
      closeTxt.setColor('#f39c12');
    });
    closeBtnContainer.on('pointerout', () => {
      if (closeBtnSprite) closeBtnSprite.setTexture('ui_pack_btn_wood');
      drawCloseBg(false);
      closeTxt.setColor('#e2d4b7');
    });
    closeBtnContainer.on('pointerdown', () => {
      AudioManager.getInstance().playInteract();
      this.close();
    });

    // 3. V15-48: Bốn Tab điều hướng chuẩn HD: [1. NHIỆM VỤ], [2. MẢNH KÝ ỨC], [3. SINH VẬT RỪNG], [4. BẢN ĐỒ THẾ GIỚI]
    // Căn khoảng cách đều đặn, không đè lên tiêu đề góc trái hay nút đóng góc phải
    this.tabQuestBtn = HDTextHelper.createText(this.scene, modalX + 220, modalY + 22, '[1. NHIỆM VỤ]', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#f39c12'
    }).setInteractive({ useHandCursor: true });
    this.tabQuestBtn.on('pointerdown', () => {
      AudioManager.getInstance().playInteract();
      this.currentTab = 'quest';
      this.refresh();
    });

    this.tabLoreBtn = HDTextHelper.createText(this.scene, modalX + 330, modalY + 22, '[2. MẢNH KÝ ỨC]', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#7f8c8d'
    }).setInteractive({ useHandCursor: true });
    this.tabLoreBtn.on('pointerdown', () => {
      AudioManager.getInstance().playInteract();
      this.currentTab = 'lore';
      this.refresh();
    });

    this.tabBestiaryBtn = HDTextHelper.createText(this.scene, modalX + 455, modalY + 22, '[3. SINH VẬT RỪNG]', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#7f8c8d'
    }).setInteractive({ useHandCursor: true });
    this.tabBestiaryBtn.on('pointerdown', () => {
      AudioManager.getInstance().playInteract();
      this.currentTab = 'bestiary';
      this.refresh();
    });

    this.tabMapBtn = HDTextHelper.createText(this.scene, modalX + 590, modalY + 22, '[4. BẢN ĐỒ THẾ GIỚI]', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#7f8c8d'
    }).setInteractive({ useHandCursor: true });
    this.tabMapBtn.on('pointerdown', () => {
      AudioManager.getInstance().playInteract();
      this.currentTab = 'map';
      this.selectedZoneId = this.playerState.getCurrentZone();
      this.refresh();
    });

    const journalElements: Phaser.GameObjects.GameObject[] = [
      overlay,
      ...(bookSprite ? [bookSprite] : []),
      book,
      title,
      closeBtnContainer,
      this.tabQuestBtn,
      this.tabLoreBtn,
      this.tabBestiaryBtn,
      this.tabMapBtn,
      this.contentContainer
    ];
    this.container.add(journalElements);
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

  public openBestiary(): void {
    this.openTab('bestiary');
  }

  public openLore(): void {
    this.openTab('lore');
  }

  public openQuests(): void {
    this.openTab('quest');
  }

  public prevLoreEntry(): void {
    const list = this.playerState.unlockedLore;
    if (!list || list.length === 0) return;
    this.currentLoreIndex = (this.currentLoreIndex - 1 + list.length) % list.length;
    AudioManager.getInstance().playInteract();
    this.refresh();
  }

  public nextLoreEntry(): void {
    const list = this.playerState.unlockedLore;
    if (!list || list.length === 0) return;
    this.currentLoreIndex = (this.currentLoreIndex + 1) % list.length;
    AudioManager.getInstance().playInteract();
    this.refresh();
  }

  public prevBestiaryEntry(): void {
    const entries = this.playerState.getBestiaryEntries();
    if (!entries || entries.length === 0) return;
    const curIdx = entries.findIndex(e => e.species === this.selectedBestiarySpecies);
    const prevIdx = (curIdx - 1 + entries.length) % entries.length;
    this.selectedBestiarySpecies = entries[prevIdx].species;
    AudioManager.getInstance().playInteract();
    this.refresh();
  }

  public nextBestiaryEntry(): void {
    const entries = this.playerState.getBestiaryEntries();
    if (!entries || entries.length === 0) return;
    const curIdx = entries.findIndex(e => e.species === this.selectedBestiarySpecies);
    const nextIdx = (curIdx + 1) % entries.length;
    this.selectedBestiarySpecies = entries[nextIdx].species;
    AudioManager.getInstance().playInteract();
    this.refresh();
  }

  public close(): void {
    ItemTooltipHelper.getInstance().hide();
    this.isOpen = false;
    this.container.setVisible(false);
    if (this.onClose) {
      this.onClose();
    }
    const gameScene = this.scene.scene.get('GameScene') as any;
    if (gameScene && gameScene.player && typeof gameScene.player.forceUnlockActionState === 'function') {
      gameScene.player.forceUnlockActionState();
    }
  }

  public refresh(): void {
    this.contentContainer.removeAll(true);

    const modalW = 840;
    const modalH = 520;
    const modalX = (1280 - modalW) / 2; // 220
    const modalY = (720 - modalH) / 2;  // 100

    // Cập nhật màu sắc 4 Tab
    this.tabQuestBtn.setColor(this.currentTab === 'quest' ? '#f39c12' : '#7f8c8d');
    this.tabLoreBtn.setColor(this.currentTab === 'lore' ? '#f39c12' : '#7f8c8d');
    this.tabBestiaryBtn.setColor(this.currentTab === 'bestiary' ? '#f39c12' : '#7f8c8d');
    this.tabMapBtn.setColor(this.currentTab === 'map' ? '#f39c12' : '#7f8c8d');

    if (this.currentTab === 'quest') {
      this.renderQuestTab(modalX, modalY, modalW, modalH);
    } else if (this.currentTab === 'lore') {
      this.renderLoreTab(modalX, modalY, modalW, modalH);
    } else if (this.currentTab === 'bestiary') {
      this.renderBestiaryTab(modalX, modalY, modalW, modalH);
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

    const tracked = QuestSystem.getInstance().getTrackedQuestDisplay(this.playerState);
    if (!tracked) {
      const emptyQ = HDTextHelper.createText(this.scene, mx + mw / 4, my + 150, 'Hiện tại chưa có nhiệm vụ nào được kích hoạt.', {
        fontSize: '14px',
        fontStyle: 'italic',
        color: '#95a5a6',
        wordWrap: { width: mw / 2 - 50 }
      });
      this.contentContainer.add(emptyQ);
      return;
    }

    const currentQ = tracked.quest;
    const isSide = currentQ.category === 'side';
    const mainTag = tracked.route
      ? `[NHIỆM VỤ CHÍNH — LỘ TRÌNH 7 CHẶNG: CHẶNG ${tracked.route.stageNumber}/7]`
      : '[NHIỆM VỤ CHÍNH]';
    const tagText = isSide ? '[NHIỆM VỤ PHỤ]' : mainTag;
    const tagColor = isSide ? '#00d2d3' : '#f39c12';

    const qTag = HDTextHelper.createText(this.scene, mx + 30, my + 66, tagText, {
      fontSize: '11px',
      fontStyle: 'bold',
      color: tagColor
    });

    // Cột bên trái: Chi tiết nhiệm vụ chính/phụ hiện tại
    const qTitle = HDTextHelper.createText(this.scene, mx + 30, qTag.y + qTag.height + 5, tracked.title, {
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#e67e22',
      stroke: '#000000',
      strokeThickness: 2,
      wordWrap: { width: mw / 2 - 50 }
    });

    const direction = tracked.route ? ` (Hướng ${tracked.route.directionHint})` : '';
    const destinationGuide = tracked.targetName ? `🧭 Mục tiêu: ${tracked.targetName}${direction}` : '☑ Đã hoàn thành';
    const qGuide = HDTextHelper.createText(this.scene, mx + 30, qTitle.y + qTitle.height + 5, destinationGuide, {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#83c6f0',
      wordWrap: { width: mw / 2 - 50, useAdvancedWrap: true }
    });

    const qDesc = HDTextHelper.createText(this.scene, mx + 30, qGuide.y + qGuide.height + 8, tracked.description, {
      fontSize: '12px',
      color: '#bdc3c7',
      wordWrap: { width: mw / 2 - 50 },
      lineSpacing: 4
    });

    const taskTitle = HDTextHelper.createText(this.scene, mx + 30, qDesc.y + qDesc.height + 12, 'MỤC TIÊU CẦN LÀM:', {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#f1c40f'
    });

    this.contentContainer.add([qTag, qTitle, qGuide, qDesc, taskTitle]);

    let taskY = taskTitle.y + taskTitle.height + 6;
    for (const task of tracked.tasks) {
      const mark = task.done ? '☑' : '☐';
      const color = task.done ? '#2ecc71' : '#f8f9fa';
      const t = HDTextHelper.createText(this.scene, mx + 30, taskY, `${mark} ${task.text}`, {
        fontSize: '12.5px',
        color: color,
        wordWrap: { width: mw / 2 - 50 },
        lineSpacing: 4
      });
      this.contentContainer.add(t);
      taskY += t.height + 8;
    }

    // Cột bên phải: Danh mục các Hồi đã mở khóa
    const histTitle = HDTextHelper.createText(this.scene, mx + mw / 2 + 30, my + 64, 'DANH SÁCH CÁC HỒI:', {
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#3498db'
    });

    // Nút lọc [TẤT CẢ] [CHÍNH] [PHỤ] tách hàng dưới tiêu đề để không chồng lấn chữ
    const fAll = HDTextHelper.createText(this.scene, mx + mw / 2 + 30, my + 89, '[TẤT CẢ]', {
      fontSize: '11px',
      fontStyle: 'bold',
      color: this.questFilter === 'all' ? '#f1c40f' : '#7f8c8d'
    }).setInteractive({ useHandCursor: true });
    fAll.on('pointerdown', () => {
      this.questFilter = 'all';
      this.refresh();
    });

    const fMain = HDTextHelper.createText(this.scene, mx + mw / 2 + 115, my + 89, '[CHÍNH]', {
      fontSize: '11px',
      fontStyle: 'bold',
      color: this.questFilter === 'main' ? '#f1c40f' : '#7f8c8d'
    }).setInteractive({ useHandCursor: true });
    fMain.on('pointerdown', () => {
      this.questFilter = 'main';
      this.refresh();
    });

    const fSide = HDTextHelper.createText(this.scene, mx + mw / 2 + 190, my + 89, '[PHỤ]', {
      fontSize: '11px',
      fontStyle: 'bold',
      color: this.questFilter === 'side' ? '#f1c40f' : '#7f8c8d'
    }).setInteractive({ useHandCursor: true });
    fSide.on('pointerdown', () => {
      this.questFilter = 'side';
      this.refresh();
    });

    let histY = my + 114;
    const questsToDisplay = Array.from(this.playerState.quests.values()).filter(q => {
      if (this.questFilter === 'main') return (q.category || 'main') === 'main';
      if (this.questFilter === 'side') return q.category === 'side';
      return true;
    });
    const rowSpacing = Math.min(26, Math.floor((my + mh - 18 - histY) / Math.max(1, questsToDisplay.length)));

    for (const q of questsToDisplay) {
      const isCurrent = q.id === currentQ.id;
      const marker = isCurrent ? '▶ ' : '• ';
      const allDone = q.tasks.length > 0 && q.tasks.every(t => t.done);
      const statusIcon = allDone ? ' [Xong]' : '';
      let color = isCurrent ? '#f39c12' : '#95a5a6';
      if (allDone && !isCurrent) color = '#2ecc71';

      const shortTitle = q.title.length > 32 ? q.title.substring(0, 30) + '...' : q.title;
      const row = HDTextHelper.createText(this.scene, mx + mw / 2 + 30, histY, `${marker}${shortTitle}${statusIcon}`, {
        fontSize: '12.5px',
        fontStyle: isCurrent ? 'bold' : 'normal',
        color: color
      }).setInteractive({ useHandCursor: true });

      row.on('pointerdown', () => {
        AudioManager.getInstance().playInteract();
        this.playerState.trackQuest(q.id);
      });

      this.contentContainer.add(row);
      histY += rowSpacing;
    }

    this.contentContainer.add([histTitle, fAll, fMain, fSide]);
  }

  // ===========================================================================
  // TAB 2: MẢNH KÝ ỨC (LORE TAB) — DẠNG SÁCH CỔ 2 TRANG LẬT MỞ
  // ===========================================================================
  private renderLoreTab(mx: number, my: number, mw: number, mh: number): void {
    // Đường gáy sổ phân 2 trang
    const spine = this.scene.add.graphics();
    spine.lineStyle(2, 0x4a3c22, 0.7);
    spine.lineBetween(mx + mw / 2, my + 60, mx + mw / 2, my + mh - 25);
    this.contentContainer.add(spine);

    const list = this.playerState.unlockedLore;
    if (list.length === 0) {
      const emptyText = HDTextHelper.createText(this.scene, mx + mw / 2, my + mh / 2, 'Chưa tìm thấy cổ thư hay manh mối nào trong Khu Rừng Rỗng (The Hollow Woods)...\nHãy khám phá các miếu thờ, xưởng rèn và tàn tích cổ.', {
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

    // --- TRANG TRÁI: DANH SÁCH CÁC BẢN GHI KÝ ỨC ---
    const leftTitle = HDTextHelper.createText(this.scene, mx + 30, my + 66, '📜 BIÊN NIÊN KÝ ỨC & CỔ THƯ BELLHOLLOW:', {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#d4af37'
    });
    this.contentContainer.add(leftTitle);

    const itemsPerPage = 7;
    const totalPages = Math.ceil(list.length / itemsPerPage);
    const currentPage = Math.floor(this.currentLoreIndex / itemsPerPage);
    const startIdx = currentPage * itemsPerPage;
    const endIdx = Math.min(list.length, startIdx + itemsPerPage);

    let rowY = my + 94;
    for (let i = startIdx; i < endIdx; i++) {
      const { entry: item, status: itemStatus } = projectLoreEntryForDisplay(list[i], this.playerState);
      const isSel = i === this.currentLoreIndex;
      const isMemoryChapter = item.id.startsWith('lore_memory_chapter_') || item.id === 'lore_black_knight_chronicle' || item.id === 'lore_wayfarer_inner_journal';
      const isEcho = item.id.includes('echo');
      const cardW = mw / 2 - 50; // 370px
      const cardH = 46;

      const cardBg = this.scene.add.graphics();
      cardBg.fillStyle(isSel ? 0x2e2417 : (isMemoryChapter ? 0x201a14 : (isEcho ? 0x141e28 : 0x181512)), 0.95);
      cardBg.fillRoundedRect(mx + 30, rowY, cardW, cardH, 6);
      cardBg.lineStyle(1.5, isSel ? 0xf39c12 : (isMemoryChapter ? 0x9c7a28 : (isEcho ? 0x3498db : 0x4a3c22)), 0.85);
      cardBg.strokeRoundedRect(mx + 30, rowY, cardW, cardH, 6);

      const marker = isSel ? '▶ ' : (itemStatus === 'REDACTED' ? '🔒 ' : (isMemoryChapter ? '⚔️ ' : (isEcho ? '✨ ' : '• ')));
      const shortTitle = item.title.length > 28 ? item.title.substring(0, 26) + '...' : item.title;
      const titleTxt = HDTextHelper.createText(this.scene, mx + 42, rowY + 8, `${marker}${shortTitle}`, {
        fontSize: '12px',
        fontStyle: (isSel || isMemoryChapter || isEcho) ? 'bold' : 'normal',
        color: isSel ? '#f39c12' : (isMemoryChapter ? '#ffc048' : (isEcho ? '#88ccff' : '#ecf0f1'))
      });
      const authorSuffix = itemStatus === 'REDACTED' ? ' [Che danh tính]' : '';
      const authorTxt = HDTextHelper.createText(this.scene, mx + 42, rowY + 26, `Bởi: ${item.author}${authorSuffix}`, {
        fontSize: '10px',
        color: isMemoryChapter ? '#f5cd79' : (isEcho ? '#74b9ff' : '#95a5a6')
      });

      const zone = this.scene.add.zone(mx + 30 + cardW / 2, rowY + cardH / 2, cardW, cardH);
      zone.setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => {
        AudioManager.getInstance().playInteract();
        this.currentLoreIndex = i;
        this.refresh();
      });

      this.contentContainer.add([cardBg, titleTxt, authorTxt, zone]);
      rowY += 52;
    }

    if (totalPages > 1) {
      const leftPageIndicator = HDTextHelper.createText(this.scene, mx + 30 + (mw / 4 - 25), my + mh - 30, `Trang ${currentPage + 1} / ${totalPages}`, {
        fontSize: '12px',
        color: '#7f8c8d'
      }).setOrigin(0.5, 0.5);
      this.contentContainer.add(leftPageIndicator);
    }

    // --- TRANG PHẢI: CHI TIẾT NỘI DUNG MẢNH KÝ ỨC ĐƯỢC CHỌN ---
    const { entry, status: entryStatus } = projectLoreEntryForDisplay(list[this.currentLoreIndex], this.playerState);
    const isEntryMemory = entry.id.startsWith('lore_memory_chapter_') || entry.id === 'lore_black_knight_chronicle' || entry.id === 'lore_wayfarer_inner_journal';
    const rightX = mx + mw / 2 + 25;
    const rightW = mw / 2 - 45;

    const isEntryEcho = entry.id.includes('echo');
    const rTitle = HDTextHelper.createText(this.scene, rightX, my + 66, (entryStatus === 'REDACTED' ? '🔒 ' : (isEntryMemory ? '⚔️ ' : (isEntryEcho ? '✨ ' : ''))) + entry.title, {
      fontSize: '14.5px',
      fontStyle: 'bold',
      color: isEntryMemory ? '#ffc048' : (isEntryEcho ? '#88ccff' : '#d4af37'),
      stroke: '#000000',
      strokeThickness: 2,
      wordWrap: { width: rightW }
    });

    const statusTag = entryStatus === 'REDACTED' ? ' [REDACTED]' : (entryStatus === 'REVEALED' ? ' [REVEALED]' : '');
    const rAuthor = HDTextHelper.createText(this.scene, rightX, rTitle.y + rTitle.height + 6, `Ghi lại bởi: ${entry.author}${statusTag}`, {
      fontSize: '12px',
      fontStyle: 'italic',
      color: entryStatus === 'REDACTED' ? '#e67e22' : (isEntryMemory ? '#f5cd79' : '#95a5a6')
    });

    const rContent = HDTextHelper.createText(this.scene, rightX, rAuthor.y + rAuthor.height + 10, entry.content, {
      fontSize: entry.content.length > 500 ? '11px' : '12px',
      color: '#f0e6d2',
      wordWrap: { width: rightW - 10 },
      lineSpacing: 4
    });

    // Điều hướng lật trang ở chân trang phải
    const prevBtn = HDTextHelper.createText(this.scene, rightX + 60, my + mh - 30, '◀ Trước', {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#f39c12'
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });
    prevBtn.on('pointerdown', () => {
      AudioManager.getInstance().playInteract();
      this.currentLoreIndex = (this.currentLoreIndex - 1 + list.length) % list.length;
      this.refresh();
    });

    const pageIndicator = HDTextHelper.createText(this.scene, rightX + rightW / 2, my + mh - 30, `Mảnh ${this.currentLoreIndex + 1} / ${list.length}`, {
      fontSize: '13px',
      color: '#bdc3c7'
    }).setOrigin(0.5, 0.5);

    const nextBtn = HDTextHelper.createText(this.scene, rightX + rightW - 60, my + mh - 30, 'Sau ▶', {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#f39c12'
    }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });
    nextBtn.on('pointerdown', () => {
      AudioManager.getInstance().playInteract();
      this.currentLoreIndex = (this.currentLoreIndex + 1) % list.length;
      this.refresh();
    });

    this.contentContainer.add([rTitle, rAuthor, rContent, prevBtn, pageIndicator, nextBtn]);
  }

  // ===========================================================================
  // TAB 3: SINH VẬT RỪNG (BESTIARY TAB) — DẠNG SÁCH CỔ 2 TRANG LẬT MỞ
  // ===========================================================================
  public renderBestiaryTab(mx: number, my: number, mw: number, mh: number): void {
    // Đường gáy sổ phân 2 trang
    const spine = this.scene.add.graphics();
    spine.lineStyle(2, 0x4a3c22, 0.7);
    spine.lineBetween(mx + mw / 2, my + 60, mx + mw / 2, my + mh - 25);
    this.contentContainer.add(spine);

    const entries = this.playerState.getBestiaryEntries();
    const currentEntry = entries.find(e => e.species === this.selectedBestiarySpecies) || entries[0];
    const observedCount = entries.filter(e => e.observed).length;

    // --- TRANG TRÁI: DANH SÁCH SINH VẬT RỪNG ---
    const listTitle = HDTextHelper.createText(this.scene, mx + 30, my + 66, '🐾 SINH THÁI KHU RỪNG RỖNG:', {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#3498db'
    });
    this.contentContainer.add(listTitle);

    let rowY = my + 94;
    for (const b of entries) {
      const isSel = b.species === currentEntry.species;
      const statusIcon = b.observed ? '🌟' : '❓';
      const rowColor = isSel ? '#f39c12' : (b.observed ? '#ecf0f1' : '#7f8c8d');
      const cardW = mw / 2 - 50; // 370px
      const cardH = 50;

      const cardBtn = this.scene.add.graphics();
      cardBtn.fillStyle(isSel ? 0x2e2417 : 0x181512, 0.95);
      cardBtn.fillRoundedRect(mx + 30, rowY, cardW, cardH, 6);
      cardBtn.lineStyle(1.5, isSel ? 0xf39c12 : 0x4a3c22, 0.8);
      cardBtn.strokeRoundedRect(mx + 30, rowY, cardW, cardH, 6);

      const displayName = b.observed ? b.nameVi : '??? (Chưa quan sát)';
      const nameTxt = HDTextHelper.createText(this.scene, mx + 42, rowY + 9, `${statusIcon} ${displayName}`, {
        fontSize: '13px',
        fontStyle: isSel ? 'bold' : 'normal',
        color: rowColor
      });
      const displayRole = b.observed ? b.roleVi : 'Tiếp cận quan sát trong rừng để mở khóa';
      const roleTxt = HDTextHelper.createText(this.scene, mx + 42, rowY + 28, displayRole, {
        fontSize: '10.5px',
        color: b.observed ? '#95a5a6' : '#7f8c8d'
      });

      const zone = this.scene.add.zone(mx + 30 + cardW / 2, rowY + cardH / 2, cardW, cardH);
      zone.setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => {
        AudioManager.getInstance().playInteract();
        this.selectedBestiarySpecies = b.species;
        this.refresh();
      });

      this.contentContainer.add([cardBtn, nameTxt, roleTxt, zone]);
      rowY += 56;
    }

    // Huy hiệu tiến độ quan sát sinh vật dưới đáy trang trái
    const progText = HDTextHelper.createText(this.scene, mx + 30, my + mh - 32, `📊 Tiến độ Bestiary: ${observedCount} / ${entries.length} loài sinh vật`, {
      fontSize: '12px',
      fontStyle: 'bold',
      color: observedCount === entries.length ? '#2ecc71' : '#f1c40f'
    });
    this.contentContainer.add(progText);

    // --- TRANG PHẢI: HỒ SƠ SINH THÁI CHI TIẾT ---
    const panelX = mx + mw / 2 + 20;
    const panelY = my + 66;
    const panelW = mw / 2 - 40;
    const panelH = mh - 90;

    const panelBg = this.scene.add.graphics();
    panelBg.fillStyle(0x15120f, 0.98);
    panelBg.fillRoundedRect(panelX, panelY, panelW, panelH, 8);
    panelBg.lineStyle(1.5, 0xa08149, 0.85);
    panelBg.strokeRoundedRect(panelX, panelY, panelW, panelH, 8);
    this.contentContainer.add(panelBg);

    if (currentEntry.observed) {
      const bTitle = HDTextHelper.createText(this.scene, panelX + 16, panelY + 14, currentEntry.nameVi.toUpperCase(), {
        fontSize: '15.5px',
        fontStyle: 'bold',
        color: '#d4af37',
        wordWrap: { width: panelW - 80 }
      });

      // V1.4: Hiển thị chân dung minh họa sinh vật nếu có tài nguyên
      let portraitKey: string | null = null;
      if (currentEntry.species === 'skull_wolf' && this.scene.textures.exists(PORTRAIT_SKULL_WOLF)) {
        portraitKey = PORTRAIT_SKULL_WOLF;
      } else if (currentEntry.species === 'shadow_behemoth' && this.scene.textures.exists(PORTRAIT_SHADOW_BIG_BOSS)) {
        portraitKey = PORTRAIT_SHADOW_BIG_BOSS;
      } else if (currentEntry.species === 'fallen_knight' && this.scene.textures.exists(PORTRAIT_FALLEN_KNIGHT)) {
        portraitKey = PORTRAIT_FALLEN_KNIGHT;
      } else if (currentEntry.species === 'dread_horseman' && this.scene.textures.exists(PORTRAIT_DREAD_HORSEMAN)) {
        portraitKey = PORTRAIT_DREAD_HORSEMAN;
      } else if (currentEntry.species === 'hooded_knight' && this.scene.textures.exists(PORTRAIT_HOODED_KNIGHT)) {
        portraitKey = PORTRAIT_HOODED_KNIGHT;
      }

      if (portraitKey) {
        const portX = panelX + panelW - 68;
        const portY = panelY + 12;
        const portBg = this.scene.add.graphics();
        portBg.fillStyle(0x0e1114, 0.95);
        portBg.fillRoundedRect(portX, portY, 52, 52, 6);
        portBg.lineStyle(1.5, 0xd4af37, 0.9);
        portBg.strokeRoundedRect(portX, portY, 52, 52, 6);

        const portImg = this.scene.add.image(portX + 26, portY + 26, portraitKey);
        portImg.setDisplaySize(48, 48);
        this.contentContainer.add([portBg, portImg]);
      }

      const bStatus = HDTextHelper.createText(this.scene, panelX + 16, panelY + 36, '🌟 ĐÃ GHI CHÉP VÀO SỔ TAY', {
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#2ecc71'
      });

      const bHabitat = HDTextHelper.createText(this.scene, panelX + 16, panelY + 58, `📍 ĐỊA BÀN: ${currentEntry.habitatVi}`, {
        fontSize: '11px',
        color: '#3498db',
        wordWrap: { width: panelW - 32 }
      });

      const bBehaviorHdr = HDTextHelper.createText(this.scene, panelX + 16, panelY + 90, '• TẬP TÍNH SINH THÁI:', {
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#f1c40f'
      });

      const bBehavior = HDTextHelper.createText(this.scene, panelX + 16, panelY + 110, currentEntry.behaviorVi, {
        fontSize: '11.5px',
        color: '#ecf0f1',
        wordWrap: { width: panelW - 32 },
        lineSpacing: 4
      });

      const bCounterHdr = HDTextHelper.createText(this.scene, panelX + 16, panelY + 205, '• CHIẾN THUẬT ĐỐI PHÓ & TỰ VỆ:', {
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#e74c3c'
      });

      const bCounter = HDTextHelper.createText(this.scene, panelX + 16, panelY + 225, currentEntry.counterVi, {
        fontSize: '11.5px',
        color: '#f39c12',
        wordWrap: { width: panelW - 32 },
        lineSpacing: 4
      });

      this.contentContainer.add([bTitle, bStatus, bHabitat, bBehaviorHdr, bBehavior, bCounterHdr, bCounter]);
    } else {
      const bTitle = HDTextHelper.createText(this.scene, panelX + 16, panelY + 14, '??? SINH VẬT CHƯA XÁC ĐỊNH', {
        fontSize: '15.5px',
        fontStyle: 'bold',
        color: '#95a5a6',
        wordWrap: { width: panelW - 80 }
      });

      if (
        currentEntry.species === 'skull_wolf' ||
        currentEntry.species === 'shadow_behemoth' ||
        currentEntry.species === 'fallen_knight' ||
        currentEntry.species === 'dread_horseman' ||
        currentEntry.species === 'hooded_knight'
      ) {
        const portX = panelX + panelW - 68;
        const portY = panelY + 12;
        const portBg = this.scene.add.graphics();
        portBg.fillStyle(0x0e1114, 0.95);
        portBg.fillRoundedRect(portX, portY, 52, 52, 6);
        portBg.lineStyle(1.5, 0x4a3c22, 0.6);
        portBg.strokeRoundedRect(portX, portY, 52, 52, 6);

        const qmark = HDTextHelper.createText(this.scene, portX + 26, portY + 26, '❓', {
          fontSize: '18px'
        }).setOrigin(0.5);
        this.contentContainer.add([portBg, qmark]);
      }

      const bStatus = HDTextHelper.createText(this.scene, panelX + 16, panelY + 36, '❓ CHƯA QUAN SÁT TRỰC TIẾP', {
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#e67e22'
      });

      const bHabitat = HDTextHelper.createText(this.scene, panelX + 16, panelY + 58, '📍 KHU VỰC: Khám phá các phân khu trong Khu Rừng Rỗng (The Hollow Woods)', {
        fontSize: '11px',
        color: '#3498db',
        wordWrap: { width: panelW - 32 }
      });

      const bBehaviorHdr = HDTextHelper.createText(this.scene, panelX + 16, panelY + 95, '• CƠ CHẾ MỞ KHÓA TỰ NHIÊN:', {
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#f1c40f'
      });

      const bBehavior = HDTextHelper.createText(this.scene, panelX + 16, panelY + 115, 'Trò chơi tuyệt đối KHÔNG yêu cầu giết hay làm hại động vật.\n\nChỉ cần lữ khách đứng quan sát sinh vật trong phạm vi tầm nhìn hoặc kích hoạt thành công sự kiện môi trường liên quan, thông tin sinh thái sẽ tự động được ghi nhận và sáng lên trong Sổ Tay.', {
        fontSize: '12px',
        color: '#bdc3c7',
        wordWrap: { width: panelW - 32 },
        lineSpacing: 5
      });

      const bHintHdr = HDTextHelper.createText(this.scene, panelX + 16, panelY + 220, '• MẸO LỮ KHÁCH:', {
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#2ecc71'
      });

      const bHint = HDTextHelper.createText(this.scene, panelX + 16, panelY + 240, 'Bật Đèn Lồng [F] và lắng nghe kỹ âm thanh khu rừng. Mỗi loài sinh vật đều mang thông điệp sinh tồn riêng biệt.', {
        fontSize: '11.5px',
        color: '#f39c12',
        wordWrap: { width: panelW - 32 },
        lineSpacing: 4
      });

      this.contentContainer.add([bTitle, bStatus, bHabitat, bBehaviorHdr, bBehavior, bHintHdr, bHint]);
    }
  }

  // Wrapper tương thích ngược
  public renderBestiaryView(mx: number, my: number, mw: number, mh: number): void {
    this.renderBestiaryTab(mx, my, mw, mh);
  }

  // ===========================================================================
  // TAB 3: BẢN ĐỒ THẾ GIỚI TÍCH HỢP TOÀN PHẦN (FANTASY CARTOGRAPHY WORLD MAP)
  // ===========================================================================
  private renderMapTab(mx: number, my: number, _mw: number, _mh: number): void {
    const currentZone = this.playerState.getCurrentZone();
    const tracked = QuestSystem.getInstance().getTrackedQuestDisplay(this.playerState);
    const questTargetZone = (tracked?.quest as { targetZone?: string } | undefined)?.targetZone;

    // 1. Kích thước & Tọa độ 2 khung hiển thị
    const mapCanvasX = mx + 20;   // 240
    const mapCanvasY = my + 60;   // 160
    const mapCanvasW = 515;       // Chiều rộng bản đồ bên trái
    const mapCanvasH = 435;       // Chiều cao bản đồ bên trái

    const inspX = mapCanvasX + mapCanvasW + 15; // 770
    const inspY = mapCanvasY;                   // 160
    const inspW = 250;                          // Chiều rộng bảng thanh tra bên phải
    const inspH = mapCanvasH;                   // 435

    // 2. Nền giấy da cổ & địa hình Fantasy (Dark Moss & Ember Gold)
    const mapBg = this.scene.add.graphics();
    mapBg.fillStyle(0x161a14, 0.98);
    mapBg.fillRoundedRect(mapCanvasX, mapCanvasY, mapCanvasW, mapCanvasH, 8);
    // Viền đôi cổ điển
    mapBg.lineStyle(2, 0x8d6b34, 0.9);
    mapBg.strokeRoundedRect(mapCanvasX, mapCanvasY, mapCanvasW, mapCanvasH, 8);
    mapBg.lineStyle(1, 0x3b4432, 0.75);
    mapBg.strokeRoundedRect(mapCanvasX + 6, mapCanvasY + 6, mapCanvasW - 12, mapCanvasH - 12, 5);

    // Góc trang trí vàng đồng
    const cornerLen = 12;
    mapBg.lineStyle(2, 0xC8963E, 0.95);
    for (const [cx, cy, dx, dy] of [
      [mapCanvasX + 6, mapCanvasY + 6, 1, 1],
      [mapCanvasX + mapCanvasW - 6, mapCanvasY + 6, -1, 1],
      [mapCanvasX + 6, mapCanvasY + mapCanvasH - 6, 1, -1],
      [mapCanvasX + mapCanvasW - 6, mapCanvasY + mapCanvasH - 6, -1, -1]
    ]) {
      mapBg.lineBetween(cx, cy, cx + dx * cornerLen, cy);
      mapBg.lineBetween(cx, cy, cx, cy + dy * cornerLen);
    }

    // Lưới hải đồ / tọa độ mờ
    mapBg.lineStyle(1, 0x283024, 0.35);
    for (let lx = mapCanvasX + 45; lx < mapCanvasX + mapCanvasW - 20; lx += 52) {
      mapBg.lineBetween(lx, mapCanvasY + 38, lx, mapCanvasY + mapCanvasH - 32);
    }
    for (let ly = mapCanvasY + 48; ly < mapCanvasY + mapCanvasH - 32; ly += 52) {
      mapBg.lineBetween(mapCanvasX + 16, ly, mapCanvasX + mapCanvasW - 16, ly);
    }

    // Địa hình Fantasy: Đầm lầy phía Nam-Đông & Rừng rậm phía Đông/Bắc
    mapBg.fillStyle(0x192829, 0.45);
    mapBg.fillEllipse(mapCanvasX + 355, mapCanvasY + 325, 160, 75);
    mapBg.fillEllipse(mapCanvasX + 430, mapCanvasY + 350, 95, 50);

    mapBg.fillStyle(0x1e281b, 0.55);
    const treeClusters: [number, number, number][] = [
      [155, 108, 12], [172, 114, 9], [285, 92, 13], [305, 100, 10],
      [345, 145, 14], [362, 154, 10], [215, 310, 11], [115, 290, 12]
    ];
    for (const [tx, ty, tr] of treeClusters) {
      mapBg.fillCircle(mapCanvasX + tx, mapCanvasY + ty, tr);
    }

    // Đường đồng mức (contours) tinh tế quanh thung lũng Bellhollow
    mapBg.lineStyle(1, 0x2e3727, 0.4);
    mapBg.strokeEllipse(mapCanvasX + 165, mapCanvasY + 215, 130, 82);
    mapBg.strokeEllipse(mapCanvasX + 165, mapCanvasY + 215, 175, 112);

    // La bàn hoa gió (Compass Rose) ở góc phải trên bản đồ (tách thoáng khỏi dòng Khai Mở)
    const compX = mapCanvasX + mapCanvasW - 34;
    const compY = mapCanvasY + 74;
    mapBg.lineStyle(1, 0x8d6b34, 0.65);
    mapBg.strokeCircle(compX, compY, 15);
    mapBg.lineBetween(compX, compY - 19, compX, compY + 19);
    mapBg.lineBetween(compX - 19, compY, compX + 19, compY);
    mapBg.fillStyle(0xC8963E, 0.85);
    mapBg.fillTriangle(compX, compY - 17, compX - 3, compY - 4, compX + 3, compY - 4);
    const compN = HDTextHelper.createText(this.scene, compX, compY - 24, 'B', {
      fontSize: '9px',
      fontStyle: 'bold',
      color: '#C8963E'
    }).setOrigin(0.5, 0.5);

    // Header bản đồ: Tiêu đề + Thống kê khám phá (HW-FIX-21)
    const implementedNodes = this.mapNodes.filter(n => n.isImplemented);
    const totalImplemented = implementedNodes.length;
    const exploredCount = implementedNodes
      .filter(n => this.playerState.hasVisitedZone(n.id)).length;

    const mapTitle = HDTextHelper.createText(this.scene, mapCanvasX + 16, mapCanvasY + 13, '🗺 HẢI ĐỒ VÙNG BELLHOLLOW & RỪNG SƯƠNG', {
      fontSize: '13.5px',
      fontStyle: 'bold',
      color: '#E09F3E'
    });

    const mapStats = HDTextHelper.createText(this.scene, mapCanvasX + mapCanvasW - 16, mapCanvasY + 13, `Khai Mở: ${exploredCount}/${totalImplemented}`, {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#88d4ab'
    }).setOrigin(1, 0);

    // Chú giải nhanh phía dưới bản đồ (nền tối tăng độ tương phản & dễ đọc)
    const legendBg = this.scene.add.graphics();
    legendBg.fillStyle(0x0d100c, 0.88);
    legendBg.fillRoundedRect(mapCanvasX + 10, mapCanvasY + mapCanvasH - 28, mapCanvasW - 20, 20, 4);
    legendBg.lineStyle(1, 0x3b4432, 0.7);
    legendBg.strokeRoundedRect(mapCanvasX + 10, mapCanvasY + mapCanvasH - 28, mapCanvasW - 20, 20, 4);

    const legendText = HDTextHelper.createText(this.scene, mapCanvasX + mapCanvasW / 2, mapCanvasY + mapCanvasH - 18, '🟡 Lõi   🟢 Biên Viễn   🟣 Vùng Cấm   🔓 Đang Mở   ⭐ Mục Tiêu   🌫️ Chưa Khai Mở', {
      fontSize: '10.5px',
      fontStyle: 'bold',
      color: '#dce3d5'
    }).setOrigin(0.5, 0.5);

    this.contentContainer.add([mapBg, compN, mapTitle, mapStats, legendBg, legendText]);

    // 3. Vẽ các tuyến đường mòn Fantasy (Connections) giữa các node
    const connGraphics = this.scene.add.graphics();
    const renderedPairs = new Set<string>();

    for (const node of this.mapNodes) {
      const fromStatus = this.getNodeStatus(node.id);
      const x1 = mapCanvasX + node.canvasX;
      const y1 = mapCanvasY + node.canvasY + 15;

      for (const route of this.zoneRegistry.getRuntimeExits(node.id)) {
        const targetId = route.toZone;
        const pairKey = node.id < targetId ? `${node.id}-${targetId}` : `${targetId}-${node.id}`;
        if (renderedPairs.has(pairKey)) continue;
        renderedPairs.add(pairKey);

        const targetNode = this.mapNodes.find(n => n.id === targetId);
        if (!targetNode) continue;

        const toStatus = this.getNodeStatus(targetId);
        const x2 = mapCanvasX + targetNode.canvasX;
        const y2 = mapCanvasY + targetNode.canvasY + 15;

        // Tạo đường cong nhẹ giữa 2 điểm để giống đường mòn trên bản đồ cổ
        const mxTrail = (x1 + x2) / 2;
        const myTrail = (y1 + y2) / 2 + ((x1 < x2 ? 1 : -1) * 8);
        const bothExplored = fromStatus === 'EXPLORED' && toStatus === 'EXPLORED';
        const bothOpenOrExplored = (fromStatus === 'EXPLORED' || fromStatus === 'OPEN') &&
                                   (toStatus === 'EXPLORED' || toStatus === 'OPEN');

        if (route.status === 'pending_construction') {
          connGraphics.lineStyle(1.5, 0x454d42, 0.35);
          this.drawDashedLine(connGraphics, x1, y1, x2, y2, 4, 5);
        } else if (bothOpenOrExplored) {
          // Viền tối bên dưới tạo chiều sâu đường mòn
          connGraphics.lineStyle(4.5, 0x0b0e0a, 0.65);
          connGraphics.lineBetween(x1, y1, mxTrail, myTrail);
          connGraphics.lineBetween(mxTrail, myTrail, x2, y2);

          connGraphics.lineStyle(2, bothExplored ? 0xC8963E : 0x4ecdc4, 0.9);
          connGraphics.lineBetween(x1, y1, mxTrail, myTrail);
          connGraphics.lineBetween(mxTrail, myTrail, x2, y2);
        } else {
          connGraphics.lineStyle(1.5, 0xa84336, 0.6);
          this.drawDashedLine(connGraphics, x1, y1, x2, y2, 5, 4);
        }
      }
    }
    this.contentContainer.add(connGraphics);

    // 4. Vẽ các Nút Phân Khu (Zone Medallions + Fog of War)
    const nodeWidth = 66;
    const nodeHeight = 38;
    const overlayBadges: Phaser.GameObjects.GameObject[] = [];

    for (const node of this.mapNodes) {
      const status = this.getNodeStatus(node.id);
      const isCurrent = (node.id === currentZone);
      const isSelected = (node.id === this.selectedZoneId);
      const isQuestTarget = Boolean(questTargetZone && questTargetZone === node.id && (status === 'EXPLORED' || status === 'OPEN'));

      const nx = mapCanvasX + node.canvasX;
      const ny = mapCanvasY + node.canvasY + 15;
      const bx = nx - nodeWidth / 2;
      const by = ny - nodeHeight / 2;

      const nodeG = this.scene.add.graphics();

      // Vòng hào quang Vị Trí Hiện Tại
      if (isCurrent) {
        nodeG.lineStyle(2, 0xffd700, 0.95);
        nodeG.strokeCircle(nx, ny, 27);
        nodeG.lineStyle(1, 0xffeaa7, 0.45);
        nodeG.strokeCircle(nx, ny, 31);
      } else if (isQuestTarget) {
        nodeG.lineStyle(1.8, 0xf39c12, 0.85);
        nodeG.strokeCircle(nx, ny, 25);
      }

      // Fog of War cho vùng chưa khai mở
      if (status === 'LOCKED' || status === 'UNIMPLEMENTED') {
        nodeG.fillStyle(0x0c0f0c, 0.72);
        nodeG.fillCircle(nx, ny, 28);
      }

      let fillColor = 0x181c16;
      let strokeColor = 0x4b5346;
      let strokeAlpha = 0.85;
      let fillAlpha = 0.96;

      if (status === 'EXPLORED') {
        if (node.tier === 'LAYER_1_CORE') {
          fillColor = 0x2c2210;
          strokeColor = 0xE09F3E;
        } else if (node.tier === 'LAYER_2_FRONTIER') {
          fillColor = 0x102719;
          strokeColor = 0x38b87c;
        } else if (node.tier === 'LAYER_3_FORBIDDEN') {
          fillColor = 0x261333;
          strokeColor = 0xa864d4;
        }
      } else if (status === 'OPEN') {
        fillColor = 0x0e252e;
        strokeColor = 0x4ecdc4;
        strokeAlpha = 1.0;
      } else if (status === 'LOCKED') {
        fillColor = 0x141714;
        strokeColor = 0x4d524c;
        fillAlpha = 0.85;
      } else if (status === 'UNIMPLEMENTED') {
        fillColor = 0x101210;
        strokeColor = 0x363b36;
        strokeAlpha = 0.55;
        fillAlpha = 0.75;
      }

      if (isSelected) {
        strokeColor = 0xfff3d1;
        strokeAlpha = 1.0;
      }

      nodeG.fillStyle(fillColor, fillAlpha);
      nodeG.fillRoundedRect(bx, by, nodeWidth, nodeHeight, 7);
      nodeG.lineStyle(isSelected ? 2.5 : 1.5, strokeColor, strokeAlpha);
      nodeG.strokeRoundedRect(bx, by, nodeWidth, nodeHeight, 7);

      // Không tiết lộ tên/biểu tượng thật của vùng chưa khám phá (Fog of War)
      let iconStr = node.icon;
      let labelStr = this.getShortZoneName(node.id);
      let textColor = '#E8DFC8';

      if (status === 'OPEN') {
        iconStr = '🔓';
        textColor = '#6ee7df';
      } else if (status === 'LOCKED') {
        iconStr = '🔒';
        labelStr = '???';
        textColor = '#7e867c';
      } else if (status === 'UNIMPLEMENTED') {
        iconStr = '🌫️';
        labelStr = '???';
        textColor = '#5d635c';
      }

      const nodeText = HDTextHelper.createText(this.scene, nx, ny - 7, iconStr, {
        fontSize: '12px'
      }).setOrigin(0.5, 0.5);

      const nameText = HDTextHelper.createText(this.scene, nx, ny + 8, labelStr, {
        fontSize: '9.5px',
        fontStyle: isSelected ? 'bold' : 'normal',
        color: textColor
      }).setOrigin(0.5, 0.5);

      let badgeBg: Phaser.GameObjects.Graphics | null = null;
      let badge: Phaser.GameObjects.Text | null = null;
      if (isCurrent || isQuestTarget) {
        const badgeLabel = isCurrent ? '📍 BẠN Ở ĐÂY' : '⭐ MỤC TIÊU';
        const badgeColor = isCurrent ? '#ffd700' : '#f3b64e';
        const borderHex = isCurrent ? 0xC8963E : 0xb87b28;
        const badgeY = by - 9;

        badge = HDTextHelper.createText(this.scene, nx, badgeY, badgeLabel, {
          fontSize: '8.5px',
          fontStyle: 'bold',
          color: badgeColor
        }).setOrigin(0.5, 0.5);

        const bw = Math.ceil(badge.width) + 10;
        const bh = 14;
        badgeBg = this.scene.add.graphics();
        badgeBg.fillStyle(0x0d100c, 0.94);
        badgeBg.fillRoundedRect(nx - bw / 2, badgeY - bh / 2, bw, bh, 3);
        badgeBg.lineStyle(1, borderHex, 0.9);
        badgeBg.strokeRoundedRect(nx - bw / 2, badgeY - bh / 2, bw, bh, 3);
        overlayBadges.push(badgeBg, badge);
      }

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
    }

    if (overlayBadges.length > 0) {
      this.contentContainer.add(overlayBadges);
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

    // Fog of War: Không tiết lộ tên thật, mô tả hay điểm mốc của vùng chưa khai mở
    const isHiddenFog = status === 'LOCKED' || status === 'UNIMPLEMENTED';
    const displayTitle = isHiddenFog ? 'VÙNG SƯƠNG MÙ CHƯA KHAI MỞ' : selectedNode.canonicalName.toUpperCase();
    const displaySub = isHiddenFog ? 'Uncharted Fog Territory' : selectedNode.subTitle;

    // Tên phân khu in hoa nổi bật
    const zoneTitle = HDTextHelper.createText(this.scene, ix + 14, iy + 42, displayTitle, {
      fontSize: '14.5px',
      fontStyle: 'bold',
      color: isHiddenFog ? '#95a5a6' : '#E09F3E',
      wordWrap: { width: iw - 28 }
    });

    const subTitle = HDTextHelper.createText(this.scene, ix + 14, iy + 64, displaySub, {
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
      statusText = '⏳ CHƯA TRIỂN KHAI';
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

    // Mô tả không gian phân khu (giữ Fog of War nếu chưa mở)
    const descStr = isHiddenFog
      ? 'Màn sương dày đặc vẫn còn che phủ vùng đất này. Hãy hoàn thành lộ trình hiện tại để xua tan sương mù và khám phá bí ẩn phía trước.'
      : selectedNode.description;
    const descText = HDTextHelper.createText(this.scene, ix + 14, nextY, descStr, {
      fontSize: '11px',
      color: '#bdc3c7',
      wordWrap: { width: iw - 28 },
      lineSpacing: 3
    });
    nextY += descText.height + 10;

    // Danh sách điểm mốc quan trọng (ẩn khi chưa mở để không spoil)
    const landmarkHeader = HDTextHelper.createText(this.scene, ix + 14, nextY, isHiddenFog ? '• ĐIỂM MỐC: (Bị che phủ bởi sương mù)' : '• ĐIỂM MỐC NỔI BẬT:', {
      fontSize: '11.5px',
      fontStyle: 'bold',
      color: isHiddenFog ? '#7f8c8d' : '#f1c40f'
    });
    nextY += 18;

    const landmarkLines = isHiddenFog
      ? '– ???\n– ???'
      : selectedNode.landmarks.slice(0, 4).map(lm => `– ${lm}`).join('\n');
    const landmarksText = HDTextHelper.createText(this.scene, ix + 14, nextY, landmarkLines, {
      fontSize: '10.5px',
      color: isHiddenFog ? '#7f8c8d' : '#ecf0f1',
      wordWrap: { width: iw - 28 },
      lineSpacing: 2
    });
    nextY += landmarksText.height + 8;

    // Tuyến kết nối liên vùng (ẩn khi vùng hiện tại đang bị Fog of War)
    if (!isHiddenFog && selectedNode.id !== 'the_depths') {
      const neighbors = this.zoneRegistry.getRuntimeExits(selectedNode.id);
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
      case 'sub_bell_workshop': return 'Xưởng Chuông';
      case 'sub_root_cellar': return 'Hầm Rễ';
      case 'sub_whispering_clearing': return 'Thì Thầm';
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
   * C4-13-09 / V15-27: Dọn dẹp đối tượng hiển thị Modal và gỡ bỏ toàn bộ keyboard listener tránh rò rỉ bộ nhớ
   */
  public destroy(): void {
    if (this.scene.input && this.scene.input.keyboard) {
      for (const kh of this.keyHandlers) {
        this.scene.input.keyboard.off(kh.key, kh.fn);
      }
      this.keyHandlers = [];
    }
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
