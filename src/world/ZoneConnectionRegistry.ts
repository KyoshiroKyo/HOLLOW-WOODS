import zonesData from '../data/zones.json';
import type {
  ZoneId,
  WorldTier,
  Point2D,
  ConnectionStatus,
  ZoneNeighborInfo,
  ZoneNodeMetadata,
  TransitionZone,
  ZoneConnectionDescriptor
} from '../types';
import { PlayerState } from '../state/PlayerState';
import { WorldGatingSystem } from './WorldGatingSystem';

export interface TraversalResult {
  allowed: boolean;
  status: ConnectionStatus;
  targetZoneId: ZoneId;
  spawnPoint: Point2D;
  isSafePending?: boolean;
  reason?: string;
  hint?: string;
  notice?: string;
}

export interface TopologyValidationResult {
  valid: boolean;
  nodeCount: number;
  connectionCount: number;
  activeCount: number;
  pendingCount: number;
  errors: string[];
  warnings: string[];
}

/**
 * ZoneConnectionRegistry – Sổ Đăng Ký Kết Nối Phân Khu Dùng Chung (Shared Zone Connection Registry)
 * Quản lý tập trung toàn bộ topology mạng lưới phân khu, điểm vào/quay về, trạng thái mở/chờ
 * và cơ chế rào chắn/chuyển cảnh an toàn theo Mô hình C (Hybrid Open World) - HOLLOW WOODS V1.2.
 */
export class ZoneConnectionRegistry {
  private static instance: ZoneConnectionRegistry | null = null;
  private zoneNodes: Map<ZoneId, ZoneNodeMetadata> = new Map();
  private connections: Map<string, ZoneConnectionDescriptor> = new Map();
  private connectionsByOrigin: Map<ZoneId, ZoneConnectionDescriptor[]> = new Map();

  private constructor() {
    this.registerAllNodes();
    this.registerAllConnections();
  }

  public static getInstance(): ZoneConnectionRegistry {
    if (!ZoneConnectionRegistry.instance) {
      ZoneConnectionRegistry.instance = new ZoneConnectionRegistry();
    }
    return ZoneConnectionRegistry.instance;
  }

  /**
   * Đăng ký danh mục 9 phân khu theo 3 tầng thế giới (C4-12-10 & C4-12-11)
   */
  private registerAllNodes(): void {
    // =========================================================================
    // TẦNG 1: CORE WORLD (VÙNG LÕI TỰ DO KHÁM PHÁ & SINH HOẠT)
    // =========================================================================
    this.zoneNodes.set('fog_crossing', {
      id: 'fog_crossing',
      displayName: 'Fog Crossing',
      titleVietnamese: 'Lối Mòn Xuyên Sương',
      tier: 'LAYER_1_CORE',
      tierName: 'Tầng 1 — Core World',
      bounds: { x: 0, y: 0, width: 480, height: 360 },
      defaultSpawn: { x: 80, y: 180 },
      status: 'active',
      neighbors: [
        {
          zoneId: 'bellhollow',
          direction: 'east',
          connectionId: 'conn_fog_to_bellhollow',
          status: 'active',
          displayLabel: 'Cổng Tây Làng Bellhollow'
        }
      ]
    });

    this.zoneNodes.set('bellhollow', {
      id: 'bellhollow',
      displayName: 'Bellhollow',
      titleVietnamese: 'Làng Chuông Cổ',
      tier: 'LAYER_1_CORE',
      tierName: 'Tầng 1 — Core World',
      bounds: { x: 480, y: -200, width: 1120, height: 960 },
      defaultSpawn: { x: 560, y: 260 },
      status: 'active',
      neighbors: [
        {
          zoneId: 'fog_crossing',
          direction: 'west',
          connectionId: 'conn_bellhollow_to_fog',
          status: 'active',
          displayLabel: 'Lối Mòn Xuyên Sương'
        },
        {
          zoneId: 'sanctuary_farm',
          direction: 'south',
          connectionId: 'conn_bellhollow_to_farm',
          status: 'active',
          displayLabel: 'Nông Trại Trú Ẩn (Sanctuary Farm)'
        },
        {
          zoneId: 'outer_woods',
          direction: 'south',
          connectionId: 'conn_bellhollow_to_outer_woods',
          status: 'active',
          displayLabel: 'Rừng Ngoại Vi (Outer Woods)'
        },
        {
          zoneId: 'crooked_path',
          direction: 'east',
          connectionId: 'conn_bellhollow_to_crooked_path',
          status: 'active',
          displayLabel: 'Cổng Đông — Đường Mòn Quanh Co'
        }
      ]
    });

    this.zoneNodes.set('sanctuary_farm', {
      id: 'sanctuary_farm',
      displayName: 'Sanctuary Farm',
      titleVietnamese: 'Nông Trại Trú Ẩn',
      tier: 'LAYER_1_CORE',
      tierName: 'Tầng 1 — Core World',
      bounds: { x: 480, y: 560, width: 640, height: 480 },
      defaultSpawn: { x: 650, y: 620 },
      status: 'active',
      neighbors: [
        {
          zoneId: 'bellhollow',
          direction: 'north',
          connectionId: 'conn_farm_to_bellhollow',
          status: 'active',
          displayLabel: 'Làng Bellhollow'
        },
        {
          zoneId: 'outer_woods',
          direction: 'east',
          connectionId: 'conn_farm_to_outer_woods',
          status: 'active',
          displayLabel: 'Rừng Ngoại Vi (Outer Woods)'
        }
      ]
    });

    this.zoneNodes.set('outer_woods', {
      id: 'outer_woods',
      displayName: 'Outer Woods',
      titleVietnamese: 'Rừng Ngoại Vi',
      tier: 'LAYER_1_CORE',
      tierName: 'Tầng 1 — Core World',
      bounds: { x: 1120, y: 560, width: 480, height: 480 },
      defaultSpawn: { x: 1210, y: 620 },
      status: 'active',
      neighbors: [
        {
          zoneId: 'bellhollow',
          direction: 'north',
          connectionId: 'conn_outer_woods_to_bellhollow',
          status: 'active',
          displayLabel: 'Làng Bellhollow'
        },
        {
          zoneId: 'sanctuary_farm',
          direction: 'west',
          connectionId: 'conn_outer_woods_to_farm',
          status: 'active',
          displayLabel: 'Nông Trại Trú Ẩn (Sanctuary Farm)'
        },
        {
          zoneId: 'crooked_path',
          direction: 'east',
          connectionId: 'conn_outer_woods_to_crooked_path',
          status: 'active',
          displayLabel: 'Lối mòn sang Đường Mòn Quanh Co'
        },
        {
          zoneId: 'sub_bell_workshop',
          direction: 'south',
          connectionId: 'conn_outer_woods_to_bell_workshop',
          status: 'active',
          displayLabel: 'Xưởng Chuông Bỏ Hoang'
        }
      ]
    });

    this.zoneNodes.set('sub_bell_workshop', {
      id: 'sub_bell_workshop',
      displayName: 'Abandoned Bell Workshop',
      titleVietnamese: 'Xưởng Chuông Bỏ Hoang',
      tier: 'LAYER_1_CORE',
      tierName: 'Tiểu khu — Rừng Ngoại Vi',
      bounds: { x: 1120, y: 1040, width: 480, height: 400 },
      defaultSpawn: { x: 1360, y: 1100 },
      status: 'active',
      neighbors: [
        {
          zoneId: 'outer_woods',
          direction: 'north',
          connectionId: 'conn_bell_workshop_to_outer_woods',
          status: 'active',
          displayLabel: 'Rừng Ngoại Vi'
        }
      ]
    });

    // =========================================================================
    // TẦNG 2: FRONTIER (VÙNG BIÊN VIỄN MỞ DẦN THEO NHIỆM VỤ)
    // =========================================================================
    this.zoneNodes.set('crooked_path', {
      id: 'crooked_path',
      displayName: 'The Crooked Path',
      titleVietnamese: 'Đường Mòn Quanh Co',
      tier: 'LAYER_2_FRONTIER',
      tierName: 'Tầng 2 — Frontier',
      bounds: { x: 1600, y: 0, width: 1280, height: 640 },
      defaultSpawn: { x: 1640, y: 280 },
      status: 'active',
      neighbors: [
        {
          zoneId: 'bellhollow',
          direction: 'west',
          connectionId: 'conn_crooked_path_to_bellhollow',
          status: 'active',
          displayLabel: 'Cổng Đông Làng Bellhollow'
        },
        {
          zoneId: 'outer_woods',
          direction: 'south',
          connectionId: 'conn_crooked_path_to_outer_woods',
          status: 'active',
          displayLabel: 'Lối mòn phụ Rừng Ven'
        },
        {
          zoneId: 'deep_forest',
          direction: 'north',
          connectionId: 'conn_crooked_path_to_deep_forest',
          status: 'active',
          displayLabel: 'Rừng Sâu (Deep Forest)'
        },
        {
          zoneId: 'silent_mire',
          direction: 'east',
          connectionId: 'conn_crooked_path_to_silent_mire',
          status: 'active',
          displayLabel: 'Đầm Lầy Tĩnh Lặng (Silent Mire)'
        }
      ]
    });

    this.zoneNodes.set('deep_forest', {
      id: 'deep_forest',
      displayName: 'Deep Forest',
      titleVietnamese: 'Rừng Sâu',
      tier: 'LAYER_2_FRONTIER',
      tierName: 'Tầng 2 — Frontier',
      bounds: { x: 1600, y: -640, width: 1280, height: 640 },
      defaultSpawn: { x: 2080, y: -80 },
      status: 'active',
      neighbors: [
        {
          zoneId: 'crooked_path',
          direction: 'south',
          connectionId: 'conn_deep_forest_to_crooked_path',
          status: 'active',
          displayLabel: 'Đường Mòn Quanh Co'
        },
        {
          zoneId: 'silent_mire',
          direction: 'east',
          connectionId: 'conn_deep_forest_to_silent_mire',
          status: 'active',
          displayLabel: 'Đầm Lầy Tĩnh Lặng (Silent Mire)'
        }
      ]
    });

    // =========================================================================
    // TẦNG 3: FORBIDDEN REGIONS (VÙNG CẤM KHÓA THEO CỐT TRUYỆN)
    // =========================================================================
    this.zoneNodes.set('silent_mire', {
      id: 'silent_mire',
      displayName: 'Silent Mire',
      titleVietnamese: 'Đầm Lầy Tĩnh Lặng',
      tier: 'LAYER_3_FORBIDDEN',
      tierName: 'Tầng 3 — Forbidden',
      bounds: { x: 2880, y: 100, width: 1120, height: 640 },
      defaultSpawn: { x: 2940, y: 320 },
      status: 'active',
      neighbors: [
        {
          zoneId: 'crooked_path',
          direction: 'west',
          connectionId: 'conn_silent_mire_to_crooked_path',
          status: 'active',
          displayLabel: 'Đường Mòn Quanh Co'
        },
        {
          zoneId: 'deep_forest',
          direction: 'north',
          connectionId: 'conn_silent_mire_to_deep_forest',
          status: 'active',
          displayLabel: 'Rừng Sâu'
        },
        {
          zoneId: 'ancient_rune_puzzle',
          direction: 'inward',
          connectionId: 'conn_silent_mire_to_rune_puzzle',
          status: 'active',
          displayLabel: 'Trận Địa Cổ Ngữ (Rune Puzzle)'
        },
        {
          zoneId: 'broken_bell_shrine',
          direction: 'east',
          connectionId: 'conn_silent_mire_to_shrine',
          status: 'active',
          displayLabel: 'Miếu Chuông Phế Tích'
        }
      ]
    });

    this.zoneNodes.set('ancient_rune_puzzle', {
      id: 'ancient_rune_puzzle',
      displayName: 'Ancient Rune Puzzle',
      titleVietnamese: 'Trận Địa Cổ Ngữ',
      tier: 'LAYER_3_FORBIDDEN',
      tierName: 'Tầng 3 — Forbidden',
      bounds: { x: 3350, y: 150, width: 350, height: 280 },
      defaultSpawn: { x: 3420, y: 260 },
      status: 'active',
      neighbors: [
        {
          zoneId: 'silent_mire',
          direction: 'south',
          connectionId: 'conn_rune_puzzle_to_silent_mire',
          status: 'active',
          displayLabel: 'Đầm Lầy Tĩnh Lặng'
        }
      ]
    });

    this.zoneNodes.set('broken_bell_shrine', {
      id: 'broken_bell_shrine',
      displayName: 'The Broken Bell Shrine',
      titleVietnamese: 'Miếu Chuông Phế Tích',
      tier: 'LAYER_3_FORBIDDEN',
      tierName: 'Tầng 3 — Forbidden',
      bounds: { x: 4000, y: 0, width: 960, height: 600 },
      defaultSpawn: { x: 4050, y: 280 },
      status: 'active',
      neighbors: [
        {
          zoneId: 'silent_mire',
          direction: 'west',
          connectionId: 'conn_shrine_to_silent_mire',
          status: 'active',
          displayLabel: 'Đầm Lầy Tĩnh Lặng'
        }
      ]
    });
  }

  /**
   * Đăng ký danh mục 18 kết nối (connections) đầy đủ giữa các phân khu
   */
  private registerAllConnections(): void {
    const list: ZoneConnectionDescriptor[] = [
      // -----------------------------------------------------------------------
      // 1. Fog Crossing <--> Bellhollow (Tầng 1)
      // -----------------------------------------------------------------------
      {
        id: 'conn_fog_to_bellhollow',
        fromZone: 'fog_crossing',
        toZone: 'bellhollow',
        status: 'active',
        barrierType: 'open',
        displayLabel: 'Tiến vào Cổng Tây làng Bellhollow',
        triggerRect: { x: 460, y: 100, width: 20, height: 160 },
        entryPoint: { x: 520, y: 260, direction: 'right' },
        returnPoint: { x: 440, y: 180, direction: 'left' },
        description: 'Lối mòn sương mù nối thẳng vào cổng phía Tây làng Bellhollow.'
      },
      {
        id: 'conn_bellhollow_to_fog',
        fromZone: 'bellhollow',
        toZone: 'fog_crossing',
        status: 'active',
        barrierType: 'open',
        displayLabel: 'Quay lại Lối Mòn Xuyên Sương',
        triggerRect: { x: 480, y: 200, width: 20, height: 120 },
        entryPoint: { x: 440, y: 180, direction: 'left' },
        returnPoint: { x: 520, y: 260, direction: 'right' },
        description: 'Lối đi phía Tây quay trở lại vùng sương mù ban sơ.'
      },

      // -----------------------------------------------------------------------
      // 2. Bellhollow <--> Sanctuary Farm (Tầng 1)
      // -----------------------------------------------------------------------
      {
        id: 'conn_bellhollow_to_farm',
        fromZone: 'bellhollow',
        toZone: 'sanctuary_farm',
        status: 'active',
        barrierType: 'open',
        displayLabel: 'Lối Nam dẫn ra Nông Trại Trú Ẩn',
        triggerRect: { x: 610, y: 535, width: 100, height: 25 },
        entryPoint: { x: 650, y: 580, direction: 'down' },
        returnPoint: { x: 650, y: 510, direction: 'up' },
        description: 'Con đường rải đá phía Nam dẫn tới khu đất canh tác thảo mộc và nhà kho trữ đồ.'
      },
      {
        id: 'conn_farm_to_bellhollow',
        fromZone: 'sanctuary_farm',
        toZone: 'bellhollow',
        status: 'active',
        barrierType: 'open',
        displayLabel: 'Trở về trung tâm làng Bellhollow',
        triggerRect: { x: 610, y: 560, width: 100, height: 20 },
        entryPoint: { x: 650, y: 510, direction: 'up' },
        returnPoint: { x: 650, y: 580, direction: 'down' },
        description: 'Lối Bắc từ nông trại quay về giếng nước và tháp chuông làng.'
      },

      // -----------------------------------------------------------------------
      // 3. Bellhollow <--> Outer Woods (Tầng 1)
      // -----------------------------------------------------------------------
      {
        id: 'conn_bellhollow_to_outer_woods',
        fromZone: 'bellhollow',
        toZone: 'outer_woods',
        status: 'active',
        barrierType: 'open',
        displayLabel: 'Lối Đông Nam ra Rừng Ngoại Vi',
        triggerRect: { x: 1150, y: 535, width: 120, height: 25 },
        entryPoint: { x: 1210, y: 580, direction: 'down' },
        returnPoint: { x: 1210, y: 510, direction: 'up' },
        description: 'Lối đi qua hàng rào phía Đông Nam làng dẫn ra vành đai rừng ven khai thác tài nguyên tự do.'
      },
      {
        id: 'conn_outer_woods_to_bellhollow',
        fromZone: 'outer_woods',
        toZone: 'bellhollow',
        status: 'active',
        barrierType: 'open',
        displayLabel: 'Quay lại làng Bellhollow',
        triggerRect: { x: 1150, y: 560, width: 120, height: 20 },
        entryPoint: { x: 1210, y: 510, direction: 'up' },
        returnPoint: { x: 1210, y: 580, direction: 'down' },
        description: 'Lối quay trở lại làng Bellhollow từ vành đai rừng ven.'
      },

      // -----------------------------------------------------------------------
      // 3B. Sanctuary Farm <--> Outer Woods (Liên thông Vùng Lõi Tầng 1)
      // -----------------------------------------------------------------------
      {
        id: 'conn_farm_to_outer_woods',
        fromZone: 'sanctuary_farm',
        toZone: 'outer_woods',
        status: 'active',
        barrierType: 'open',
        displayLabel: 'Lối sang Rừng Ngoại Vi',
        triggerRect: { x: 1100, y: 680, width: 20, height: 140 },
        entryPoint: { x: 1140, y: 750, direction: 'right' },
        returnPoint: { x: 1080, y: 750, direction: 'left' },
        description: 'Lối mòn liên thông mở giữa Nông Trại Trú Ẩn và Rừng Ngoại Vi.'
      },
      {
        id: 'conn_outer_woods_to_farm',
        fromZone: 'outer_woods',
        toZone: 'sanctuary_farm',
        status: 'active',
        barrierType: 'open',
        displayLabel: 'Lối về Nông Trại Trú Ẩn',
        triggerRect: { x: 1120, y: 680, width: 20, height: 140 },
        entryPoint: { x: 1080, y: 750, direction: 'left' },
        returnPoint: { x: 1140, y: 750, direction: 'right' },
        description: 'Lối mòn liên thông mở từ Rừng Ngoại Vi trở về Nông Trại Trú Ẩn.'
      },

      // -----------------------------------------------------------------------
      // 4. Bellhollow <--> Crooked Path (Tầng 1 <--> Tầng 2: Cổng Đông cốt lõi)
      // -----------------------------------------------------------------------
      {
        id: 'conn_bellhollow_to_crooked_path',
        fromZone: 'bellhollow',
        toZone: 'crooked_path',
        status: 'active',
        barrierType: 'gate',
        gatingCondition: 'Q03_PREPARE_RESOURCES / East Gate',
        displayLabel: 'Cổng Đông — Lối vào Rừng Cấm (The Hollow Woods)',
        triggerRect: { x: 1580, y: 200, width: 20, height: 160 },
        entryPoint: { x: 1640, y: 280, direction: 'right' },
        returnPoint: { x: 1540, y: 280, direction: 'left' },
        description: 'Cánh cổng gỗ đồ sộ khóa xích sắt kiên cố do Người Canh Cổng Garth quản lý.'
      },
      {
        id: 'conn_crooked_path_to_bellhollow',
        fromZone: 'crooked_path',
        toZone: 'bellhollow',
        status: 'active',
        barrierType: 'gate',
        displayLabel: 'Quay về làng Bellhollow qua Cổng Đông',
        triggerRect: { x: 1600, y: 220, width: 20, height: 140 },
        entryPoint: { x: 1540, y: 280, direction: 'left' },
        returnPoint: { x: 1640, y: 280, direction: 'right' },
        description: 'Lối rút lui an toàn về làng Bellhollow khi bị quái vật săn đuổi.'
      },

      // -----------------------------------------------------------------------
      // 5. Outer Woods <--> Crooked Path (Tầng 1 <--> Tầng 2: Lối phụ liên thông C4-12-21)
      // -----------------------------------------------------------------------
      {
        id: 'conn_outer_woods_to_crooked_path',
        fromZone: 'outer_woods',
        toZone: 'crooked_path',
        status: 'active',
        barrierType: 'open',
        displayLabel: 'Lối mòn phụ Rừng Ven sang Đường Mòn Quanh Co',
        triggerRect: { x: 1560, y: 720, width: 40, height: 120 },
        entryPoint: { x: 1640, y: 500, direction: 'right' },
        returnPoint: { x: 1540, y: 780, direction: 'left' },
        description: 'Lối mòn tự nhiên hai chiều kết nối Rừng Ven với Lối Mòn Quanh Co.'
      },
      {
        id: 'conn_crooked_path_to_outer_woods',
        fromZone: 'crooked_path',
        toZone: 'outer_woods',
        status: 'active',
        barrierType: 'open',
        displayLabel: 'Lối rẽ từ Đường Mòn về Rừng Ven',
        triggerRect: { x: 1600, y: 440, width: 30, height: 120 },
        entryPoint: { x: 1540, y: 780, direction: 'left' },
        returnPoint: { x: 1640, y: 500, direction: 'right' },
        description: 'Lối rẽ tự nhiên né tránh quái vật quay về vành đai Rừng Ngoại Vi an toàn.'
      },

      // -----------------------------------------------------------------------
      // 5B. Outer Woods <--> Abandoned Bell Workshop (Tầng 1 Core <--> Tiểu khu D)
      // -----------------------------------------------------------------------
      {
        id: 'conn_outer_woods_to_bell_workshop',
        fromZone: 'outer_woods',
        toZone: 'sub_bell_workshop',
        status: 'active',
        barrierType: 'open',
        displayLabel: 'Lối vào Xưởng Chuông Bỏ Hoang',
        triggerRect: { x: 1320, y: 1000, width: 80, height: 40 },
        entryPoint: { x: 1360, y: 1100, direction: 'down' },
        returnPoint: { x: 1360, y: 960, direction: 'up' },
        description: 'Lối mòn phủ rêu dẫn tới phế tích xưởng đúc chuông ven rừng.'
      },
      {
        id: 'conn_bell_workshop_to_outer_woods',
        fromZone: 'sub_bell_workshop',
        toZone: 'outer_woods',
        status: 'active',
        barrierType: 'open',
        displayLabel: 'Quay lại Rừng Ngoại Vi',
        triggerRect: { x: 1320, y: 1040, width: 80, height: 30 },
        entryPoint: { x: 1360, y: 980, direction: 'up' },
        returnPoint: { x: 1360, y: 1100, direction: 'down' },
        description: 'Đường mòn quay về vành đai Rừng Ngoại Vi.'
      },

      // -----------------------------------------------------------------------
      // 6. Crooked Path <--> Deep Forest (Tầng 2)
      // -----------------------------------------------------------------------
      {
        id: 'conn_crooked_path_to_deep_forest',
        fromZone: 'crooked_path',
        toZone: 'deep_forest',
        status: 'active',
        barrierType: 'open',
        displayLabel: 'Lối Bắc rẽ vào Rừng Sâu (Lãnh địa The Listener)',
        triggerRect: { x: 2000, y: 10, width: 160, height: 35 },
        entryPoint: { x: 2080, y: -80, direction: 'up' },
        returnPoint: { x: 2080, y: 60, direction: 'down' },
        description: 'Lối mòn âm u rậm rạp phía Bắc dẫn sâu vào lãnh địa cổ sơ của Kẻ Lắng Nghe.'
      },
      {
        id: 'conn_deep_forest_to_crooked_path',
        fromZone: 'deep_forest',
        toZone: 'crooked_path',
        status: 'active',
        barrierType: 'open',
        displayLabel: 'Quay lại Đường Mòn Quanh Co',
        triggerRect: { x: 2000, y: -30, width: 160, height: 30 },
        entryPoint: { x: 2080, y: 60, direction: 'down' },
        returnPoint: { x: 2080, y: -80, direction: 'up' },
        description: 'Lối thoát phía Nam an toàn quay về Đường Mòn Quanh Co.'
      },
      {
        id: 'conn_deep_forest_to_silent_mire',
        fromZone: 'deep_forest',
        toZone: 'silent_mire',
        status: 'active',
        barrierType: 'dense_thorns',
        gatingCondition: 'Q04_ANCIENT_RUNES',
        displayLabel: 'Lối mòn Đông Bắc dẫn sang Đầm Lầy Tĩnh Lặng',
        triggerRect: { x: 2840, y: -320, width: 40, height: 120 },
        entryPoint: { x: 2920, y: 200, direction: 'right' },
        returnPoint: { x: 2800, y: -260, direction: 'left' },
        description: 'Ranh giới chuyển tiếp hiểm trở từ Rừng Sâu sang Đầm Lầy Tĩnh Lặng.'
      },
      {
        id: 'conn_silent_mire_to_deep_forest',
        fromZone: 'silent_mire',
        toZone: 'deep_forest',
        status: 'active',
        barrierType: 'open',
        displayLabel: 'Lối mòn Tây Bắc dẫn lên Rừng Sâu',
        triggerRect: { x: 2880, y: 160, width: 20, height: 80 },
        entryPoint: { x: 2800, y: -260, direction: 'left' },
        returnPoint: { x: 2920, y: 200, direction: 'right' },
        description: 'Lối mòn dốc đá rời đầm lầy bước lên tầng rừng nguyên sinh cổ sơ.'
      },

      // -----------------------------------------------------------------------
      // 7. Crooked Path <--> Silent Mire (Tầng 2 <--> Tầng 3)
      // -----------------------------------------------------------------------
      {
        id: 'conn_crooked_path_to_silent_mire',
        fromZone: 'crooked_path',
        toZone: 'silent_mire',
        status: 'active',
        barrierType: 'dense_thorns',
        gatingCondition: 'Q04_ANCIENT_RUNES:t1',
        displayLabel: 'Tiến vào Đầm Lầy Tĩnh Lặng',
        triggerRect: { x: 2860, y: 240, width: 20, height: 160 },
        entryPoint: { x: 2940, y: 320, direction: 'right' },
        returnPoint: { x: 2820, y: 280, direction: 'left' },
        description: 'Cửa ngõ dẫn xuống vùng đất ngập nước sương độc ăn mòn tâm trí.'
      },
      {
        id: 'conn_silent_mire_to_crooked_path',
        fromZone: 'silent_mire',
        toZone: 'crooked_path',
        status: 'active',
        barrierType: 'open',
        displayLabel: 'Quay lại Đường Mòn Quanh Co',
        triggerRect: { x: 2880, y: 260, width: 20, height: 140 },
        entryPoint: { x: 2820, y: 280, direction: 'left' },
        returnPoint: { x: 2940, y: 320, direction: 'right' },
        description: 'Lối dốc đá bước lên khỏi vũng lầy đen kịt.'
      },

      // -----------------------------------------------------------------------
      // 8. Silent Mire <--> Ancient Rune Puzzle (Tầng 3 Sub-Zone)
      // -----------------------------------------------------------------------
      {
        id: 'conn_silent_mire_to_rune_puzzle',
        fromZone: 'silent_mire',
        toZone: 'ancient_rune_puzzle',
        status: 'active',
        barrierType: 'rune_ward',
        gatingCondition: 'Q04_ANCIENT_RUNES',
        displayLabel: 'Tiến vào Trận Địa 3 Cột Đá Cổ Ngữ',
        triggerRect: { x: 3350, y: 220, width: 40, height: 120 },
        entryPoint: { x: 3420, y: 260, direction: 'right' },
        returnPoint: { x: 3300, y: 260, direction: 'left' },
        description: 'Gò đất cổ nổi giữa đầm lầy, nơi đặt 3 cột đá phong ấn Mặt Trăng, Rễ Cây, Con Mắt.'
      },
      {
        id: 'conn_rune_puzzle_to_silent_mire',
        fromZone: 'ancient_rune_puzzle',
        toZone: 'silent_mire',
        status: 'active',
        barrierType: 'open',
        displayLabel: 'Rời bệ cổ ngữ ra đầm lầy',
        triggerRect: { x: 3350, y: 250, width: 20, height: 60 },
        entryPoint: { x: 3300, y: 260, direction: 'left' },
        returnPoint: { x: 3420, y: 260, direction: 'right' },
        description: 'Bước khỏi gò đất linh thiêng trở lại vùng sương mù lầy lội.'
      },

      // -----------------------------------------------------------------------
      // 9. Silent Mire <--> Broken Bell Shrine (Tầng 3 Miếu Chuông)
      // -----------------------------------------------------------------------
      {
        id: 'conn_silent_mire_to_shrine',
        fromZone: 'silent_mire',
        toZone: 'broken_bell_shrine',
        status: 'active',
        barrierType: 'rune_ward',
        gatingCondition: 'mire_puzzle_solved',
        displayLabel: 'Bước qua Rào Ấn tiến vào Miếu Chuông Phế Tích',
        triggerRect: { x: 3980, y: 240, width: 20, height: 120 },
        entryPoint: { x: 4050, y: 280, direction: 'right' },
        returnPoint: { x: 3940, y: 320, direction: 'left' },
        description: 'Cánh cổng cổ sừng sững mở ra sau khi kích hoạt thành công chuỗi 3 cột đá cổ ngữ.'
      },
      {
        id: 'conn_shrine_to_silent_mire',
        fromZone: 'broken_bell_shrine',
        toZone: 'silent_mire',
        status: 'active',
        barrierType: 'open',
        displayLabel: 'Trở lại Đầm Lầy Tĩnh Lặng',
        triggerRect: { x: 4000, y: 220, width: 20, height: 140 },
        entryPoint: { x: 3940, y: 320, direction: 'left' },
        returnPoint: { x: 4050, y: 280, direction: 'right' },
        description: 'Lối mòn đá rời khỏi miếu chuông cổ kính.'
      }
    ];

    for (const c of list) {
      this.connections.set(c.id, c);

      const existing = this.connectionsByOrigin.get(c.fromZone) || [];
      existing.push(c);
      this.connectionsByOrigin.set(c.fromZone, existing);
    }
  }

  // ===========================================================================
  // CÁC HÀM TRUY VẤN NODE PHÂN KHU (ZONE NODES)
  // ===========================================================================

  public getZoneNode(zoneId: ZoneId): ZoneNodeMetadata | undefined {
    return this.zoneNodes.get(zoneId);
  }

  public getAllZoneNodes(): ZoneNodeMetadata[] {
    return Array.from(this.zoneNodes.values());
  }

  public getNeighbors(zoneId: ZoneId): ZoneNeighborInfo[] {
    const node = this.zoneNodes.get(zoneId);
    return node ? node.neighbors : [];
  }

  public getNodesByTier(tier: WorldTier): ZoneNodeMetadata[] {
    return Array.from(this.zoneNodes.values()).filter(n => n.tier === tier);
  }

  // ===========================================================================
  // CÁC HÀM TRUY VẤN KẾT NỐI (CONNECTIONS)
  // ===========================================================================

  public getConnection(id: string): ZoneConnectionDescriptor | undefined {
    return this.connections.get(id);
  }

  /** The map uses the same outgoing exits as WorldBuilder, including one-way shortcuts. */
  public getRuntimeExits(zoneId: string): readonly TransitionZone[] {
    return (zonesData.zones.find(zone => zone.id === zoneId)?.transitions ?? []) as TransitionZone[];
  }

  public getAllConnections(): ZoneConnectionDescriptor[] {
    return Array.from(this.connections.values());
  }

  public getConnectionsFrom(zoneId: ZoneId): ZoneConnectionDescriptor[] {
    return this.connectionsByOrigin.get(zoneId) || [];
  }

  public getConnectionBetween(fromZone: ZoneId, toZone: ZoneId): ZoneConnectionDescriptor | undefined {
    const fromList = this.connectionsByOrigin.get(fromZone);
    if (!fromList) return undefined;
    return fromList.find(c => c.toZone === toZone);
  }

  // ===========================================================================
  // CƠ CHẾ KIỂM TRA CHUYỂN VÙNG VÀ BẢO ĐẢM AN TOÀN TRÁNH VOID RƠI TỰ DO
  // ===========================================================================

  /**
   * Đánh giá an toàn và khả năng di chuyển qua một kết nối
   */
  public evaluateConnectionTraversal(
    connectionId: string,
    playerState: PlayerState
  ): TraversalResult {
    const conn = this.connections.get(connectionId);
    if (!conn) {
      return {
        allowed: false,
        status: 'pending_construction',
        targetZoneId: 'bellhollow',
        spawnPoint: { x: 560, y: 260 },
        reason: 'Kết nối không tồn tại trong sổ đăng ký.'
      };
    }

    const targetNode = this.zoneNodes.get(conn.toZone);
    if (!targetNode) {
      return {
        allowed: false,
        status: 'pending_construction',
        targetZoneId: conn.fromZone,
        spawnPoint: conn.returnPoint,
        reason: 'Phân khu đích không hợp lệ.'
      };
    }

    // 1. Kiểm tra trạng thái pending_construction (Bảo vệ an toàn chống rơi vào void)
    if (conn.status === 'pending_construction' || targetNode.status === 'pending_construction') {
      return {
        allowed: false,
        status: 'pending_construction',
        targetZoneId: conn.toZone,
        spawnPoint: conn.returnPoint, // Đặt người chơi an toàn tại điểm quay về của vùng hiện tại
        isSafePending: true,
        reason: 'Khu vực đang trong giai đoạn xây dựng hoàn thiện.',
        notice: conn.pendingNotice || `Khu vực ${targetNode.titleVietnamese} đang được chuẩn bị bản đồ chi tiết.`
      };
    }

    // 2. Kiểm tra điều kiện mở khóa cốt truyện qua WorldGatingSystem
    const gatingEval = WorldGatingSystem.getInstance().evaluateTransition(conn.fromZone, conn.toZone, playerState);
    if (!gatingEval.allowed) {
      return {
        allowed: false,
        status: 'active',
        targetZoneId: conn.toZone,
        spawnPoint: conn.returnPoint,
        reason: gatingEval.reason,
        hint: gatingEval.hint
      };
    }

    // 3. Cho phép chuyển vùng an toàn
    return {
      allowed: true,
      status: 'active',
      targetZoneId: conn.toZone,
      spawnPoint: conn.entryPoint
    };
  }

  /**
   * Lấy vị trí hồi sinh/spawn an toàn khi vào phân khu
   */
  public getSafeSpawnPosition(toZone: ZoneId, fromZone?: ZoneId): Point2D {
    if (fromZone) {
      const conn = this.getConnectionBetween(fromZone, toZone);
      if (conn && conn.status === 'active') {
        return { x: conn.entryPoint.x, y: conn.entryPoint.y };
      }
    }

    const node = this.zoneNodes.get(toZone);
    if (node) {
      return { x: node.defaultSpawn.x, y: node.defaultSpawn.y };
    }

    // Fallback mặc định an toàn tuyệt đối tại trung tâm làng Bellhollow
    return { x: 560, y: 260 };
  }

  // ===========================================================================
  // KIỂM ĐỊNH TOÀN VẸN MẠNG LƯỚI TOPOLOGY (SELF-VALIDATION)
  // ===========================================================================

  /**
   * Kiểm tra tự động tính hợp lệ của toàn bộ mạng lưới phân khu
   */
  public validateTopology(): TopologyValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    let activeCount = 0;
    let pendingCount = 0;

    // 1. Kiểm tra các Zone Nodes
    for (const [id, node] of this.zoneNodes.entries()) {
      if (node.bounds.width <= 0 || node.bounds.height <= 0) {
        errors.push(`Zone [${id}] có kích thước bounds không hợp lệ.`);
      }

      // Default spawn phải nằm trong bounds
      const b = node.bounds;
      const s = node.defaultSpawn;
      if (s.x < b.x || s.x > b.x + b.width || s.y < b.y || s.y > b.y + b.height) {
        errors.push(`Zone [${id}] defaultSpawn (${s.x}, ${s.y}) nằm ngoài phạm vi bounds.`);
      }

      // Kiểm tra neighbors có trỏ tới node hợp lệ
      for (const nb of node.neighbors) {
        if (!this.zoneNodes.has(nb.zoneId)) {
          errors.push(`Zone [${id}] chứa láng giềng không tồn tại: ${nb.zoneId}`);
        }
        if (!this.connections.has(nb.connectionId)) {
          errors.push(`Zone [${id}] láng giềng [${nb.zoneId}] trỏ tới connection không tồn tại: ${nb.connectionId}`);
        }
      }
    }

    // 2. Kiểm tra các Connections
    for (const [id, conn] of this.connections.entries()) {
      if (!this.zoneNodes.has(conn.fromZone)) {
        errors.push(`Connection [${id}] có fromZone không tồn tại: ${conn.fromZone}`);
      }
      if (!this.zoneNodes.has(conn.toZone)) {
        errors.push(`Connection [${id}] có toZone không tồn tại: ${conn.toZone}`);
      }

      if (conn.status === 'active') {
        activeCount++;
      } else {
        pendingCount++;
        if (!conn.pendingNotice) {
          warnings.push(`Connection pending [${id}] thiếu thông điệp cảnh báo pendingNotice.`);
        }
      }

      // TriggerRect phải có kích thước dương
      if (conn.triggerRect.width <= 0 || conn.triggerRect.height <= 0) {
        errors.push(`Connection [${id}] triggerRect có kích thước <= 0.`);
      }

      // Check returnPoint
      const fromNode = this.zoneNodes.get(conn.fromZone);
      if (fromNode) {
        const fb = fromNode.bounds;
        const rp = conn.returnPoint;
        if (rp.x < fb.x || rp.x > fb.x + fb.width || rp.y < fb.y || rp.y > fb.y + fb.height) {
          warnings.push(`Connection [${id}] returnPoint (${rp.x}, ${rp.y}) nằm ngoài bounds fromZone.`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      nodeCount: this.zoneNodes.size,
      connectionCount: this.connections.size,
      activeCount,
      pendingCount,
      errors,
      warnings
    };
  }
}
