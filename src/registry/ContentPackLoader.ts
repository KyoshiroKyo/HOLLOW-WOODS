/**
 * HOLLOW WOODS V1.4 — BỘ NẠP GÓI NỘI DUNG DỮ LIỆU TÍCH HỢP (CONTENT PACK LOADER)
 *
 * Quản lý kiến trúc Data-Driven Content Packs an toàn tuyệt đối:
 * 1. Cung cấp cấu trúc Manifest chuẩn (packId, name, version, dependencies, contentEntries).
 * 2. Tách biệt hoàn toàn không gian tên Mod (mod.<author>.<pack>.<type>.<local_id>) khỏi First-party (HW-...).
 * 3. Kiểm tra tính toàn vẹn, dependency và chỉ chấp nhận dữ liệu JSON thuần (tuyệt đối không chạy JS ngoài).
 * 4. Cho phép bật/tắt (toggle) gói mở rộng an toàn mà không làm hỏng file Save cốt lõi.
 */

export interface ContentPackEntry {
  id: string;                 // Tầng 1: HW-[TYPE]-[SUBTYPE]-[SEQ] hoặc mod.<author>.<pack>.<type>.<id>
  type: string;               // ITM, WPN, EQP, ANI, MON, QST, etc.
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

export interface ContentPackManifest {
  packId: string;
  name: string;
  nameVi?: string;
  version: string;
  description?: string;
  author?: string;
  isBuiltIn: boolean;
  dependencies?: string[];
  contentEntries: ContentPackEntry[];
}

export interface PackValidationResult {
  isValid: boolean;
  packId: string;
  errors: string[];
  warnings: string[];
}

export class ContentPackLoader {
  private static instance: ContentPackLoader;

  // Bản đồ lưu trữ các gói nội dung đã đăng ký
  private packs: Map<string, ContentPackManifest> = new Map();
  // Tập hợp các packId đang được kích hoạt (enabled)
  private enabledPacks: Set<string> = new Set();
  // Ánh xạ entryId -> packId để tra cứu nguồn gốc
  private entryToPackMap: Map<string, string> = new Map();
  // Ánh xạ bí danh gói chính thức (HW-MOD-PACK-XXXXXX <-> pack_xxx)
  private packAliases: Map<string, string> = new Map([
    ['HW-MOD-PACK-000001', 'pack_wildlife'],
    ['HW-MOD-PACK-000002', 'pack_equipment'],
    ['HW-MOD-PACK-000003', 'pack_camp_cooking'],
    ['HW-MOD-PACK-000004', 'pack_relics'],
    ['mod_wildlife_pack', 'pack_wildlife'],
    ['mod_equipment_pack', 'pack_equipment'],
    ['mod_camp_pack', 'pack_camp_cooking'],
    ['mod_relics_pack', 'pack_relics']
  ]);

  private constructor() {
    this.initDefaultBuiltInPacks();
  }

  public static getInstance(): ContentPackLoader {
    if (!ContentPackLoader.instance) {
      ContentPackLoader.instance = new ContentPackLoader();
    }
    return ContentPackLoader.instance;
  }

  /**
   * Khởi tạo 4 gói nội dung tích hợp chuẩn V1.4 (Built-in Data-Driven Packs)
   */
  private initDefaultBuiltInPacks(): void {
    // 1. Gói Sinh Vật Rừng Hoang Dã (Woodland Wildlife Pack)
    const wildlifePack: ContentPackManifest = {
      packId: 'pack_wildlife',
      name: 'Woodland Wildlife Pack',
      nameVi: 'Gói Sinh Vật Rừng Hoang Dã',
      version: '1.4.0',
      description: 'Hệ sinh thái rừng giai đoạn 1: Quạ Rừng và Bướm Đêm Hổ Phách.',
      author: 'Official',
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
    };

    // 2. Gói Trang Bị Sinh Tồn & Tự Vệ (Survival Equipment Pack)
    const equipmentPack: ContentPackManifest = {
      packId: 'pack_equipment',
      name: 'Survival Equipment Pack',
      nameVi: 'Gói Trang Bị Sinh Tồn & Tự Vệ',
      version: '1.4.0',
      description: '4 ô trang bị chuyên biệt có đánh đổi chỉ số và 3 vũ khí sinh tồn đẩy lùi.',
      author: 'Official',
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
          nameVi: 'Gậy Đi Rừng',
          nameEn: 'Walking Staff',
          runtimeKey: 'wpn_walking_staff',
          tags: ['weapon', 'blunt', 'stagger']
        },
        {
          id: 'HW-WPN-SPEAR-000001',
          type: 'WPN',
          subType: 'SPEAR',
          slug: 'wooden_spear',
          nameVi: 'Giáo Gỗ Rừng',
          nameEn: 'Wooden Spear',
          runtimeKey: 'wpn_wooden_spear',
          tags: ['weapon', 'pierce', 'defense']
        },
        {
          id: 'HW-WPN-HATCH-000001',
          type: 'WPN',
          subType: 'AXE',
          slug: 'hunting_hatchet',
          nameVi: 'Rìu Rừng Nhỏ',
          nameEn: 'Hunting Hatchet',
          runtimeKey: 'wpn_hunting_hatchet',
          tags: ['weapon', 'slash', 'cleave']
        }
      ]
    };

    // 3. Gói Lửa Trại & Ẩm Thực Sinh Tồn (Camp & Cooking Pack)
    const campCookingPack: ContentPackManifest = {
      packId: 'pack_camp_cooking',
      name: 'Camp & Cooking Pack',
      nameVi: 'Gói Lửa Trại & Ẩm Thực Sinh Tồn',
      version: '1.4.0',
      description: 'Lửa Trại 3 cấp, Nồi Nấu Thảo Dược và 3 món ăn Trung cổ Bellhollow.',
      author: 'Official',
      isBuiltIn: true,
      dependencies: [],
      contentEntries: [
        {
          id: 'HW-ITM-FOOD-000001',
          type: 'ITM',
          subType: 'FOOD',
          slug: 'calming_tea',
          nameVi: 'Trà Thảo Dược An Thần',
          nameEn: 'Calming Herbal Tea',
          runtimeKey: 'food_calming_tea',
          tags: ['consumable', 'composure_boost']
        },
        {
          id: 'HW-ITM-FOOD-000002',
          type: 'ITM',
          subType: 'FOOD',
          slug: 'roasted_mushroom',
          nameVi: 'Nấm Rừng Nướng Than',
          nameEn: 'Roasted Forest Mushroom',
          runtimeKey: 'food_roasted_mushroom',
          tags: ['consumable', 'stamina_boost']
        },
        {
          id: 'HW-ITM-FOOD-000003',
          type: 'ITM',
          subType: 'FOOD',
          slug: 'root_soup',
          nameVi: 'Súp Rễ Rừng',
          nameEn: 'Forest Root Soup',
          runtimeKey: 'food_root_soup',
          tags: ['consumable', 'health_boost', 'warmth']
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
          tags: ['material', 'fuel', 'brewing']
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
    };

    // 4. Gói Cổ Vật & Đấu Trùm (Ancient Relics Pack)
    const relicsPack: ContentPackManifest = {
      packId: 'pack_relics',
      name: 'Ancient Relics Pack',
      nameVi: 'Gói Cổ Vật & Đấu Trùm',
      version: '1.4.0',
      description: 'Trận trùm Kẻ Nuốt Tiếng Chuông, Di vật Mạch Rễ và Cổ Thư.',
      author: 'Official',
      isBuiltIn: true,
      dependencies: ['pack_equipment'],
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
          id: 'HW-PUZ-RUNE-000001',
          type: 'PUZ',
          subType: 'RUNE',
          slug: 'three_runed_pillars',
          nameVi: 'Câu Đố 3 Trụ Cổ Ngữ',
          nameEn: 'Three Runed Pillars Puzzle',
          runtimeKey: 'puz_runed_pillars',
          tags: ['puzzle', 'rune', 'boss_mechanic']
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
    };

    // Đăng ký và kích hoạt sẵn 4 gói nội dung
    this.registerPack(wildlifePack);
    this.registerPack(equipmentPack);
    this.registerPack(campCookingPack);
    this.registerPack(relicsPack);
  }

  /**
   * Kiểm tra tính hợp lệ và an toàn tuyệt đối của Manifest gói nội dung
   */
  public validatePack(manifest: ContentPackManifest): PackValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Kiểm tra trường bắt buộc
    if (!manifest.packId || typeof manifest.packId !== 'string' || manifest.packId.trim() === '') {
      errors.push('packId không được để trống.');
    }
    if (!manifest.name || typeof manifest.name !== 'string' || manifest.name.trim() === '') {
      errors.push('name gói nội dung không được để trống.');
    }
    if (!manifest.version || typeof manifest.version !== 'string') {
      errors.push('version gói nội dung không hợp lệ.');
    }

    // 2. Kiểm tra an toàn dữ liệu: Ngăn chặn mã độc JavaScript (Security Sandbox)
    const jsonString = JSON.stringify(manifest);
    const dangerousTokens = ['<script', 'javascript:', 'ev' + 'al(', 'new' + ' Function('];
    if (dangerousTokens.some(token => jsonString.includes(token))) {
      errors.push('Phát hiện nội dung có khả năng thực thi mã JavaScript độc hại. Chỉ chấp nhận JSON thuần túy.');
    }

    // 3. Quy tắc Không Gian Tên (Namespace Isolation Rule)
    const firstPartyRegex = /^HW-[A-Z]{3}-[A-Z0-9]{3,4}-[0-9]{6}$/;
    const modNamespaceRegex = /^mod\.[a-z0-9_-]+\.[a-z0-9_-]+\.[a-z0-9_-]+\.[a-z0-9_-]+$/;

    for (const entry of manifest.contentEntries || []) {
      if (manifest.isBuiltIn) {
        if (!firstPartyRegex.test(entry.id)) {
          errors.push(`Gói tích hợp (${manifest.packId}): Entry ID "${entry.id}" không tuân thủ quy chuẩn First-party HW-[TYPE]-[SUBTYPE]-[SEQ].`);
        }
      } else {
        // Gói mở rộng bên ngoài / Mod
        if (entry.id.startsWith('HW-')) {
          errors.push(`Gói Mod (${manifest.packId}): Tuyệt đối không được sử dụng tiền tố First-party "HW-". Phải sử dụng định dạng mod.<author>.<pack>.<type>.<id>.`);
        } else if (!modNamespaceRegex.test(entry.id)) {
          errors.push(`Gói Mod (${manifest.packId}): Entry ID "${entry.id}" không tuân thủ định dạng không gian tên mod.<author>.<pack>.<type>.<local_id>.`);
        }
      }

      // Kiểm tra trùng lặp với các entry đã đăng ký
      const existingPackId = this.entryToPackMap.get(entry.id);
      if (existingPackId && existingPackId !== manifest.packId) {
        errors.push(`Xung đột Content ID: "${entry.id}" đã được đăng ký bởi gói "${existingPackId}".`);
      }
    }

    // 4. Kiểm tra Dependencies
    if (manifest.dependencies && Array.isArray(manifest.dependencies)) {
      for (const depId of manifest.dependencies) {
        if (!this.packs.has(depId)) {
          warnings.push(`Gói phụ thuộc "${depId}" hiện chưa được đăng ký trong hệ thống.`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      packId: manifest.packId,
      errors,
      warnings
    };
  }

  /**
   * Đăng ký gói nội dung vào hệ thống sau khi đã qua bước kiểm duyệt an toàn
   */
  public registerPack(manifest: ContentPackManifest): PackValidationResult {
    const valResult = this.validatePack(manifest);
    if (!valResult.isValid) {
      console.error(`[ContentPackLoader] Gói "${manifest.packId}" không hợp lệ:`, valResult.errors);
      return valResult;
    }

    this.packs.set(manifest.packId, manifest);
    this.enabledPacks.add(manifest.packId);

    for (const entry of manifest.contentEntries) {
      this.entryToPackMap.set(entry.id, manifest.packId);
    }

    return valResult;
  }

  /**
   * Lấy manifest một gói theo packId hoặc alias
   */
  public getPack(packId: string): ContentPackManifest | undefined {
    const resolvedId = this.packAliases.get(packId) || packId;
    return this.packs.get(resolvedId);
  }

  /**
   * Bật một gói nội dung mở rộng
   */
  public enablePack(packId: string): boolean {
    const resolvedId = this.packAliases.get(packId) || packId;
    const pack = this.packs.get(resolvedId);
    if (!pack) return false;

    // Kiểm tra các gói phụ thuộc (Dependencies)
    if (pack.dependencies) {
      for (const depId of pack.dependencies) {
        const resolvedDepId = this.packAliases.get(depId) || depId;
        if (!this.enabledPacks.has(resolvedDepId)) {
          console.warn(`[ContentPackLoader] Không thể bật gói "${packId}" vì gói phụ thuộc "${depId}" chưa được bật.`);
          return false;
        }
      }
    }

    this.enabledPacks.add(resolvedId);
    return true;
  }

  /**
   * Tắt một gói nội dung mở rộng mà KHÔNG làm ảnh hưởng dữ liệu Save cốt lõi
   */
  public disablePack(packId: string): boolean {
    const resolvedId = this.packAliases.get(packId) || packId;
    const pack = this.packs.get(resolvedId);
    if (!pack) return false;

    // Không cho phép tắt các gói cốt lõi nếu có gói khác đang phụ thuộc vào nó
    for (const [otherId, otherPack] of this.packs.entries()) {
      if (this.enabledPacks.has(otherId) && otherPack.dependencies?.includes(resolvedId)) {
        console.warn(`[ContentPackLoader] Không thể tắt gói "${packId}" vì gói "${otherId}" đang phụ thuộc vào nó.`);
        return false;
      }
    }

    this.enabledPacks.delete(resolvedId);
    return true;
  }

  /**
   * Kiểm tra trạng thái kích hoạt của gói
   */
  public isPackEnabled(packId: string): boolean {
    const resolvedId = this.packAliases.get(packId) || packId;
    return this.enabledPacks.has(resolvedId);
  }

  /**
   * Lấy danh sách toàn bộ các gói nội dung đã đăng ký
   */
  public getRegisteredPacks(): ContentPackManifest[] {
    return Array.from(this.packs.values());
  }

  /**
   * Lấy danh sách các gói nội dung đang được bật
   */
  public getEnabledPacks(): ContentPackManifest[] {
    return Array.from(this.packs.values()).filter(p => this.enabledPacks.has(p.packId));
  }

  /**
   * Lấy danh sách entries thuộc một gói cụ thể
   */
  public getPackEntries(packId: string): ContentPackEntry[] {
    const pack = this.getPack(packId);
    return pack ? pack.contentEntries : [];
  }

  /**
   * Lấy danh sách toàn bộ entries từ các gói đang được bật
   */
  public getAllActiveEntries(): ContentPackEntry[] {
    const result: ContentPackEntry[] = [];
    for (const packId of this.enabledPacks) {
      const pack = this.packs.get(packId);
      if (pack) {
        result.push(...pack.contentEntries);
      }
    }
    return result;
  }
}
