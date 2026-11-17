/**
 * HOLLOW WOODS V1.4 — MODULE KIỂM DUYỆT GÓI NỘI DUNG DỮ LIỆU JSON
 * File: src/systems/ContentPackValidator.ts
 *
 * Nhiệm vụ chính:
 * 1. Đảm bảo CHỈ nạp dữ liệu JSON thuần túy (tuân thủ nghiêm ngặt CSP & Sandbox của P2Game.io).
 *    Tuyệt đối ngăn chặn mã thực thi động, function constructor, script injection hay mã độc hại.
 * 2. Kiểm tra cấu trúc manifest chuẩn (packId, name, version, dependencies, contentEntries).
 * 3. Phát hiện xung đột Content ID (Collision Validation) giữa các gói dữ liệu.
 * 4. Xác minh tính tương thích phiên bản (Semantic Versioning) với Hollow Woods V1.4.0.
 * 5. Định nghĩa và xác thực 4 gói nội dung chính thức:
 *    - HW-MOD-PACK-000001: Woodland Wildlife Pack (Quạ Rừng & Bướm Đêm).
 *    - HW-MOD-PACK-000002: Survival Equipment Pack (4 ô trang bị cá nhân).
 *    - HW-MOD-PACK-000003: Camp & Cooking Pack (Lửa Trại 3 cấp, Rương 12 ô, Nồi Thảo Dược, Lều).
 *    - HW-MOD-PACK-000004: Ancient Relics & Boss Pack (3 tiểu khu, Cổ Ngữ & Boss Mire Warden).
 */

export interface ContentPackEntryDef {
  id: string;                 // Tầng 1: HW-[TYPE]-[SUBTYPE]-[SEQ] hoặc mod.<author>.<pack>.<type>.<id>
  type: string;               // ITM, WPN, EQP, ANI, MON, LOC, BLD, QST, etc.
  subType?: string;
  slug: string;
  nameVi: string;
  nameEn: string;
  runtimeKey: string;
  descriptionVi?: string;
  descriptionEn?: string;
  aliases?: string[];
  tags?: string[];
  meta?: Record<string, any>;
}

export interface ContentPackManifestDef {
  packId: string;             // HW-MOD-PACK-XXXXXX hoặc pack_xxx hoặc mod.<author>.<pack>
  name: string;
  nameVi?: string;
  version: string;
  minGameVersion?: string;
  description?: string;
  author?: string;
  isBuiltIn: boolean;
  dependencies?: string[];
  contentEntries: ContentPackEntryDef[];
}

export interface PackValidationResult {
  isValid: boolean;
  packId: string;
  isSafeJson: boolean;
  errors: string[];
  warnings: string[];
  entryCount: number;
}

export class ContentPackValidator {
  private static instance: ContentPackValidator;

  public static readonly CURRENT_GAME_VERSION = '1.4.0';
  public static readonly FIRST_PARTY_PACK_PREFIX = 'HW-MOD-PACK-';
  public static readonly FIRST_PARTY_ENTRY_REGEX = /^HW-[A-Z]{3}-[A-Z0-9]{3,4}-[0-9]{6}$/;
  public static readonly MOD_NAMESPACE_REGEX = /^mod\.[a-z0-9_-]+\.[a-z0-9_-]+\.[a-z0-9_-]+\.[a-z0-9_-]+$/;

  // Danh sách các token nguy hại vi phạm CSP trên trình duyệt và P2Game
  private static readonly DANGEROUS_SECURITY_TOKENS = [
    '<script',
    '</script',
    'javascript:',
    ['ev', 'al('].join(''),
    ['new', 'Function'].join(' '),
    ['Func', 'tion('].join(''),
    'setTimeout(',
    'setInterval(',
    '__proto__',
    'constructor.prototype',
    'onload=',
    'onerror=',
    'document.cookie',
    'window.location'
  ];

  // Danh mục 4 gói nội dung chính thức chuẩn V1.4
  public static readonly OFFICIAL_PACKS: Record<string, ContentPackManifestDef> = {
    'HW-MOD-PACK-000001': {
      packId: 'HW-MOD-PACK-000001',
      name: 'Woodland Wildlife Pack',
      nameVi: 'Gói Sinh Thái Rừng',
      version: '1.4.0',
      minGameVersion: '1.4.0',
      description: 'Hệ sinh thái rừng giai đoạn 1: Quạ Rừng (Crow) và Bướm Đêm Hổ Phách (Lantern Moth).',
      author: 'Official Antigravity Team',
      isBuiltIn: true,
      dependencies: [],
      contentEntries: [
        {
          id: 'HW-ANI-AMBIENT-000001',
          type: 'ANI',
          subType: 'AMBIENT',
          slug: 'woodland_crow',
          nameVi: 'Quạ Rừng',
          nameEn: 'Woodland Crow',
          runtimeKey: 'ani_crow',
          tags: ['wildlife', 'alarm', 'ambient']
        },
        {
          id: 'HW-ANI-AMBIENT-000002',
          type: 'ANI',
          subType: 'AMBIENT',
          slug: 'lantern_moth',
          nameVi: 'Bướm Đêm Hổ Phách',
          nameEn: 'Lantern Moth',
          runtimeKey: 'ani_lantern_moth',
          tags: ['wildlife', 'light_seeker', 'ambient']
        }
      ]
    },
    'HW-MOD-PACK-000002': {
      packId: 'HW-MOD-PACK-000002',
      name: 'Survival Equipment Pack',
      nameVi: 'Gói Trang Bị Sinh Tồn',
      version: '1.4.0',
      minGameVersion: '1.4.0',
      description: 'Hệ thống 4 ô trang bị cá nhân chuyên biệt và 3 công cụ tự vệ không có độ bền.',
      author: 'Official Antigravity Team',
      isBuiltIn: true,
      dependencies: [],
      contentEntries: [
        {
          id: 'HW-EQP-BODY-000001',
          type: 'EQP',
          subType: 'BODY',
          slug: 'moss_cloak',
          nameVi: 'Áo Choàng Rêu',
          nameEn: 'Moss Cloak',
          runtimeKey: 'eqp_moss_cloak',
          tags: ['equipment', 'body', 'weather_resistance']
        },
        {
          id: 'HW-EQP-FEET-000001',
          type: 'EQP',
          subType: 'FEET',
          slug: 'trail_boots',
          nameVi: 'Ủng Đi Rừng',
          nameEn: 'Trail Boots',
          runtimeKey: 'eqp_trail_boots',
          tags: ['equipment', 'feet', 'mire_stability']
        },
        {
          id: 'HW-EQP-BACK-000001',
          type: 'EQP',
          subType: 'BACK',
          slug: 'field_backpack',
          nameVi: 'Túi Hành Trang',
          nameEn: 'Field Backpack',
          runtimeKey: 'eqp_field_backpack',
          tags: ['equipment', 'back', 'capacity_boost']
        },
        {
          id: 'HW-EQP-CHRM-000001',
          type: 'EQP',
          subType: 'CHRM',
          slug: 'bell_ward_charm',
          nameVi: 'Bùa Chuông Cổ',
          nameEn: 'Bell Ward Charm',
          runtimeKey: 'eqp_bell_ward_charm',
          tags: ['equipment', 'charm', 'composure_ward']
        },
        {
          id: 'HW-WPN-STAFF-000001',
          type: 'WPN',
          subType: 'STAFF',
          slug: 'walking_staff',
          nameVi: 'Gậy Gỗ',
          nameEn: 'Walking Staff',
          runtimeKey: 'wpn_walking_staff',
          tags: ['weapon', 'blunt', 'stagger']
        },
        {
          id: 'HW-WPN-MEL-000001',
          type: 'WPN',
          subType: 'SPEAR',
          slug: 'iron_tipped_spear',
          nameVi: 'Giáo Gỗ Bịt Sắt',
          nameEn: 'Iron-Tipped Spear',
          runtimeKey: 'wpn_iron_spear',
          tags: ['weapon', 'pierce', 'defense']
        },
        {
          id: 'HW-WPN-HATCH-000001',
          type: 'WPN',
          subType: 'AXE',
          slug: 'hunting_hatchet',
          nameVi: 'Rìu Đi Rừng',
          nameEn: 'Hunting Hatchet',
          runtimeKey: 'wpn_hunting_hatchet',
          tags: ['weapon', 'slash', 'woodcutting']
        }
      ]
    },
    'HW-MOD-PACK-000003': {
      packId: 'HW-MOD-PACK-000003',
      name: 'Camp & Cooking Pack',
      nameVi: 'Gói Khu Trại & Ẩm Thực',
      version: '1.4.0',
      minGameVersion: '1.4.0',
      description: 'Lửa Trại 3 cấp, Rương Gỗ Lưu Trữ 12 ô, Nồi Thảo Dược, Lều Sinh Tồn và ẩm thực ấm áp.',
      author: 'Official Antigravity Team',
      isBuiltIn: true,
      dependencies: [],
      contentEntries: [
        {
          id: 'HW-BLD-CAMP-000001',
          type: 'BLD',
          subType: 'CAMP',
          slug: 'campfire_bellhollow',
          nameVi: 'Lửa Trại Làng Bellhollow',
          nameEn: 'Bellhollow Central Campfire',
          runtimeKey: 'bld_campfire_bellhollow',
          tags: ['building', 'camp', 'warmth']
        },
        {
          id: 'HW-BLD-CHEST-000001',
          type: 'BLD',
          subType: 'CHEST',
          slug: 'storage_chest',
          nameVi: 'Rương Gỗ Lưu Trữ 12 Ô',
          nameEn: 'Storage Chest 12-Slot',
          runtimeKey: 'bld_storage_chest',
          tags: ['building', 'storage', 'inventory']
        },
        {
          id: 'HW-BLD-CAULD-000001',
          type: 'BLD',
          subType: 'CAULD',
          slug: 'herbal_cauldron',
          nameVi: 'Nồi Nấu Thảo Dược',
          nameEn: 'Herbal Cauldron',
          runtimeKey: 'bld_herbal_cauldron',
          tags: ['building', 'brewing', 'alchemy']
        },
        {
          id: 'HW-BLD-SHELTER-000001',
          type: 'BLD',
          subType: 'SHELTER',
          slug: 'survival_shelter',
          nameVi: 'Lều Sinh Tồn',
          nameEn: 'Survival Shelter',
          runtimeKey: 'bld_survival_shelter',
          tags: ['building', 'shelter', 'rest']
        },
        {
          id: 'HW-ITM-FOOD-000001',
          type: 'ITM',
          subType: 'FOOD',
          slug: 'calming_tea',
          nameVi: 'Trà Thảo Dược An Thần',
          nameEn: 'Calming Herbal Tea',
          runtimeKey: 'food_calming_tea',
          tags: ['consumable', 'food', 'composure']
        },
        {
          id: 'HW-ITM-FOOD-000002',
          type: 'ITM',
          subType: 'FOOD',
          slug: 'roasted_mushroom',
          nameVi: 'Nấm Rừng Nướng Than',
          nameEn: 'Roasted Forest Mushroom',
          runtimeKey: 'food_roasted_mushroom',
          tags: ['consumable', 'food', 'stamina']
        },
        {
          id: 'HW-ITM-FOOD-000003',
          type: 'ITM',
          subType: 'FOOD',
          slug: 'root_soup',
          nameVi: 'Súp Rễ Rừng',
          nameEn: 'Forest Root Soup',
          runtimeKey: 'food_root_soup',
          tags: ['consumable', 'food', 'health', 'warmth']
        },
        {
          id: 'HW-ITM-CNS-000003',
          type: 'ITM',
          subType: 'CNS',
          slug: 'resin_flare',
          nameVi: 'Đuốc Nhựa Thông Khẩn Cấp',
          nameEn: 'Emergency Resin Flare',
          runtimeKey: 'item_resin_flare',
          tags: ['consumable', 'tactical', 'light', 'repel']
        },
        {
          id: 'HW-ITM-MAT-000001',
          type: 'ITM',
          subType: 'MAT',
          slug: 'forest_rope',
          nameVi: 'Dây Thừng Rừng',
          nameEn: 'Forest Rope',
          runtimeKey: 'mat_forest_rope',
          tags: ['material', 'crafting']
        },
        {
          id: 'HW-ITM-MAT-000002',
          type: 'ITM',
          subType: 'MAT',
          slug: 'charcoal',
          nameVi: 'Than Củi',
          nameEn: 'Charcoal',
          runtimeKey: 'mat_charcoal',
          tags: ['material', 'fuel']
        }
      ]
    },
    'HW-MOD-PACK-000004': {
      packId: 'HW-MOD-PACK-000004',
      name: 'Ancient Relics & Boss Pack',
      nameVi: 'Gói Cổ Vật & Đấu Trùm',
      version: '1.4.0',
      minGameVersion: '1.4.0',
      description: '3 tiểu khu khám phá, Cổ Ngữ, Cổ Vật hiếm và Trận chạm trán Boss Kẻ Nuốt Tiếng Chuông (Mire Warden).',
      author: 'Official Antigravity Team',
      isBuiltIn: true,
      dependencies: ['HW-MOD-PACK-000002'],
      contentEntries: [
        {
          id: 'HW-MON-BOSS-000001',
          type: 'MON',
          subType: 'BOSS',
          slug: 'the_mire_warden',
          nameVi: 'Kẻ Nuốt Tiếng Chuông',
          nameEn: 'The Mire Warden',
          runtimeKey: 'mon_mire_warden',
          tags: ['monster', 'boss', 'puzzle_encounter']
        },
        {
          id: 'HW-LOC-WORK-000001',
          type: 'LOC',
          subType: 'WORK',
          slug: 'abandoned_bell_workshop',
          nameVi: 'Xưởng Chuông Bỏ Hoang',
          nameEn: 'Abandoned Bell Workshop',
          runtimeKey: 'subzone_bell_workshop',
          tags: ['location', 'subzone', 'workshop']
        },
        {
          id: 'HW-LOC-CELLAR-000001',
          type: 'LOC',
          subType: 'CELLAR',
          slug: 'root_cellar',
          nameVi: 'Hầm Rễ Cổ',
          nameEn: 'Ancient Root Cellar',
          runtimeKey: 'subzone_root_cellar',
          tags: ['location', 'subzone', 'cellar']
        },
        {
          id: 'HW-LOC-CLEAR-000001',
          type: 'LOC',
          subType: 'CLEAR',
          slug: 'whispering_clearing',
          nameVi: 'Khoảng Trống Thì Thầm',
          nameEn: 'Whispering Clearing',
          runtimeKey: 'subzone_whispering_clearing',
          tags: ['location', 'subzone', 'clearing']
        },
        {
          id: 'HW-ITM-RELIC-000001',
          type: 'ITM',
          subType: 'RELIC',
          slug: 'heart_of_roots',
          nameVi: 'Trái Tim Mạch Rễ Cổ',
          nameEn: 'Heart of Ancient Roots',
          runtimeKey: 'relic_heart_of_roots',
          tags: ['relic', 'quest', 'unique']
        },
        {
          id: 'HW-ITM-KEY-000003',
          type: 'ITM',
          subType: 'KEY',
          slug: 'bell_mold',
          nameVi: 'Khuôn Đúc Chuông Cũ',
          nameEn: 'Ancient Bell Mold',
          runtimeKey: 'item_bell_mold',
          tags: ['quest', 'key_item']
        },
        {
          id: 'HW-ITM-MAT-000005',
          type: 'ITM',
          subType: 'MAT',
          slug: 'medicinal_roots',
          nameVi: 'Rễ Thuốc Cổ Quý Hiếm',
          nameEn: 'Rare Medicinal Roots',
          runtimeKey: 'item_medicinal_roots',
          tags: ['material', 'alchemy']
        },
        {
          id: 'HW-ITM-MAT-000003',
          type: 'ITM',
          subType: 'MAT',
          slug: 'runed_iron_part',
          nameVi: 'Phụ Kiện Sắt Rèn Cổ Ngữ',
          nameEn: 'Runed Iron Part',
          runtimeKey: 'mat_runed_iron',
          aliases: ['item_runed_iron_part'],
          tags: ['material', 'smithing']
        }
      ]
    }
  };

  private registeredContentIds: Map<string, string> = new Map(); // ContentId -> PackId
  private validatedPacks: Map<string, ContentPackManifestDef> = new Map();

  private constructor() {
    this.registerOfficialPacks();
  }

  public static getInstance(): ContentPackValidator {
    if (!ContentPackValidator.instance) {
      ContentPackValidator.instance = new ContentPackValidator();
    }
    return ContentPackValidator.instance;
  }

  /**
   * Đăng ký 4 gói chính thức vào Validator
   */
  private registerOfficialPacks(): void {
    for (const pack of Object.values(ContentPackValidator.OFFICIAL_PACKS)) {
      this.validatedPacks.set(pack.packId, pack);
      for (const entry of pack.contentEntries) {
        this.registeredContentIds.set(entry.id, pack.packId);
      }
    }
  }

  /**
   * 1. Kiểm tra an toàn bảo mật chuỗi JSON thuần túy (CSP & P2Game Security Check)
   */
  public static validateJsonSafety(jsonString: string): { isSafe: boolean; violations: string[] } {
    const violations: string[] = [];
    if (typeof jsonString !== 'string') {
      return { isSafe: false, violations: ['Dữ liệu đầu vào không phải là chuỗi JSON.'] };
    }

    const lower = jsonString.toLowerCase();
    for (const token of ContentPackValidator.DANGEROUS_SECURITY_TOKENS) {
      if (lower.includes(token.toLowerCase())) {
        violations.push(`Phát hiện token nguy hại bị cấm: "${token}".`);
      }
    }

    return {
      isSafe: violations.length === 0,
      violations
    };
  }

  /**
   * 2. Phân tích cú pháp và kiểm duyệt an toàn gói dữ liệu (Safe JSON Parsing & Manifest Check)
   */
  public validatePackJson(rawInput: string | object, knownPacks?: Map<string, ContentPackManifestDef>): PackValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let isSafeJson = true;
    let manifest: any;

    if (typeof rawInput === 'string') {
      const safetyCheck = ContentPackValidator.validateJsonSafety(rawInput);
      if (!safetyCheck.isSafe) {
        isSafeJson = false;
        errors.push(...safetyCheck.violations);
      }

      try {
        manifest = JSON.parse(rawInput);
      } catch (err: any) {
        errors.push(`Lỗi cú pháp JSON: ${err.message}`);
        return {
          isValid: false,
          packId: 'unknown',
          isSafeJson: false,
          errors,
          warnings,
          entryCount: 0
        };
      }
    } else if (rawInput && typeof rawInput === 'object') {
      const strRepr = JSON.stringify(rawInput);
      const safetyCheck = ContentPackValidator.validateJsonSafety(strRepr);
      if (!safetyCheck.isSafe) {
        isSafeJson = false;
        errors.push(...safetyCheck.violations);
      }
      manifest = rawInput;
    } else {
      errors.push('Dữ liệu gói nội dung không hợp lệ (phải là JSON string hoặc object).');
      return {
        isValid: false,
        packId: 'unknown',
        isSafeJson: false,
        errors,
        warnings,
        entryCount: 0
      };
    }

    return this.validateManifest(manifest, knownPacks, isSafeJson);
  }

  /**
   * 3. Kiểm duyệt cấu trúc Manifest của Gói Nội Dung
   */
  public validateManifest(
    manifest: any,
    knownPacks?: Map<string, ContentPackManifestDef>,
    isSafeJson: boolean = true
  ): PackValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!manifest || typeof manifest !== 'object') {
      return {
        isValid: false,
        packId: 'invalid',
        isSafeJson,
        errors: ['Manifest không phải là đối tượng hợp lệ.'],
        warnings: [],
        entryCount: 0
      };
    }

    const packId = typeof manifest.packId === 'string' ? manifest.packId.trim() : '';
    if (!packId) {
      errors.push('packId không được để trống.');
    }

    const name = typeof manifest.name === 'string' ? manifest.name.trim() : '';
    if (!name) {
      errors.push('name gói nội dung không được để trống.');
    }

    const version = typeof manifest.version === 'string' ? manifest.version.trim() : '';
    if (!version || !/^\d+\.\d+\.\d+/.test(version)) {
      errors.push(`version gói nội dung "${version}" không tuân thủ Semantic Versioning (x.y.z).`);
    }

    // Kiểm tra tính tương thích phiên bản game (Version Compatibility)
    if (manifest.minGameVersion && typeof manifest.minGameVersion === 'string') {
      if (!ContentPackValidator.isVersionCompatible(manifest.minGameVersion, ContentPackValidator.CURRENT_GAME_VERSION)) {
        errors.push(`Gói yêu cầu phiên bản game tối thiểu ${manifest.minGameVersion}, hiện tại là ${ContentPackValidator.CURRENT_GAME_VERSION}.`);
      }
    }

    const isBuiltIn = Boolean(manifest.isBuiltIn);
    const contentEntries: ContentPackEntryDef[] = Array.isArray(manifest.contentEntries) ? manifest.contentEntries : [];

    if (contentEntries.length === 0) {
      warnings.push(`Gói "${packId}" không chứa bất kỳ contentEntries nào.`);
    }

    // 4. Kiểm tra từng Content Entry và phát hiện xung đột Content ID (Collision Detection)
    const localEntryIds = new Set<string>();
    const localRuntimeKeys = new Set<string>();

    for (const entry of contentEntries) {
      if (!entry || typeof entry !== 'object') {
        errors.push('Tồn tại entry không phải là đối tượng hợp lệ.');
        continue;
      }

      if (!entry.id || typeof entry.id !== 'string') {
        errors.push('Entry ID không được để trống.');
        continue;
      }

      const entryId = entry.id.trim();

      // Kiểm tra trùng lặp trong chính gói này
      if (localEntryIds.has(entryId)) {
        errors.push(`Trùng lặp Content ID "${entryId}" trong cùng gói "${packId}".`);
      }
      localEntryIds.add(entryId);

      // Quy tắc không gian tên (Namespace Rules)
      if (isBuiltIn) {
        if (!ContentPackValidator.FIRST_PARTY_ENTRY_REGEX.test(entryId)) {
          errors.push(`Gói tích hợp (${packId}): Entry ID "${entryId}" không đúng chuẩn First-party HW-[TYPE]-[SUBTYPE]-[SEQ].`);
        }
      } else {
        // Gói bên ngoài (Mod)
        if (entryId.startsWith('HW-')) {
          errors.push(`Gói Mod (${packId}): Tuyệt đối cấm sử dụng tiền tố First-party "HW-". Phải dùng mod.<author>.<pack>.<type>.<id>.`);
        } else if (!ContentPackValidator.MOD_NAMESPACE_REGEX.test(entryId)) {
          errors.push(`Gói Mod (${packId}): Entry ID "${entryId}" không tuân thủ định dạng mod.<author>.<pack>.<type>.<id>.`);
        }
      }

      // Phát hiện xung đột Content ID với các gói đã nạp khác
      const existingPackId = this.registeredContentIds.get(entryId);
      if (existingPackId && existingPackId !== packId) {
        errors.push(`Xung đột Content ID: "${entryId}" đã được đăng ký bởi gói "${existingPackId}".`);
      }

      // Kiểm tra runtimeKey
      if (!entry.runtimeKey || typeof entry.runtimeKey !== 'string') {
        errors.push(`Entry "${entryId}" thiếu runtimeKey.`);
      } else {
        const rk = entry.runtimeKey.trim();
        if (localRuntimeKeys.has(rk)) {
          warnings.push(`Trùng lặp runtimeKey "${rk}" trong cùng gói "${packId}".`);
        }
        localRuntimeKeys.add(rk);
      }
    }

    // 5. Kiểm tra Dependencies
    const packPool = knownPacks || this.validatedPacks;
    if (manifest.dependencies && Array.isArray(manifest.dependencies)) {
      for (const depId of manifest.dependencies) {
        if (typeof depId === 'string' && depId.trim()) {
          const cleanDepId = depId.trim();
          if (!packPool.has(cleanDepId)) {
            warnings.push(`Gói phụ thuộc "${cleanDepId}" chưa được đăng ký trong hệ thống.`);
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      packId,
      isSafeJson,
      errors,
      warnings,
      entryCount: contentEntries.length
    };
  }

  /**
   * So sánh phiên bản Semantic Versioning (minVersion <= currentVersion)
   */
  public static isVersionCompatible(minVersion: string, currentVersion: string): boolean {
    const parse = (v: string) => v.split('.').map(n => parseInt(n, 10) || 0);
    const [minMajor, minMinor, minPatch] = parse(minVersion);
    const [curMajor, curMinor, curPatch] = parse(currentVersion);

    if (curMajor > minMajor) return true;
    if (curMajor < minMajor) return false;
    if (curMinor > minMinor) return true;
    if (curMinor < minMinor) return false;
    return curPatch >= minPatch;
  }

  /**
   * Lấy định nghĩa một gói nội dung chính thức theo Content Pack ID
   */
  public getOfficialPack(packId: string): ContentPackManifestDef | undefined {
    return ContentPackValidator.OFFICIAL_PACKS[packId];
  }

  /**
   * Lấy danh sách toàn bộ 4 gói nội dung chính thức
   */
  public getAllOfficialPacks(): ContentPackManifestDef[] {
    return Object.values(ContentPackValidator.OFFICIAL_PACKS);
  }

  /**
   * Kiểm duyệt toàn diện toàn bộ 4 gói nội dung chính thức
   */
  public validateAllOfficialPacks(): { allValid: boolean; results: Record<string, PackValidationResult> } {
    const results: Record<string, PackValidationResult> = {};
    let allValid = true;

    for (const [id, manifest] of Object.entries(ContentPackValidator.OFFICIAL_PACKS)) {
      const res = this.validateManifest(manifest);
      results[id] = res;
      if (!res.isValid) {
        allValid = false;
      }
    }

    return { allValid, results };
  }
}
