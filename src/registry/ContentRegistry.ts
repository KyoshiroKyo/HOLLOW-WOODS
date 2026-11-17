import { ContentEntry, ContentType, AssetRecord, RegistryValidationResult } from './types';
import { INITIAL_CONTENT_ENTRIES, INITIAL_ASSETS } from './registryData';

/**
 * TRUNG TÂM CONTENT REGISTRY — HỆ THỐNG ĐỊNH DANH 4 TẦNG Ở CHẾ ĐỘ MIRROR
 * 
 * Đảm bảo:
 * 1. Tra cứu hai chiều giữa Content ID (HW-...) và Runtime Key (res_...).
 * 2. Hỗ trợ Alias tự động giải quyết các tên gọi trùng lặp (Tree Resin / Pine Resin, Calming Tea / Herbal Tea).
 * 3. Không tác động trực tiếp vào file Save cũ của SaveManager.
 * 4. Kiểm tra toàn vẹn chống trùng lặp mã (Collision Validation).
 */
export class ContentRegistry {
  private static instance: ContentRegistry;

  private entriesById: Map<string, ContentEntry> = new Map();
  private entriesByRuntimeKey: Map<string, ContentEntry> = new Map();
  private entriesByAlias: Map<string, ContentEntry> = new Map();
  private assetsById: Map<string, AssetRecord> = new Map();

  private constructor() {
    this.init();
  }

  public static getInstance(): ContentRegistry {
    if (!ContentRegistry.instance) {
      ContentRegistry.instance = new ContentRegistry();
    }
    return ContentRegistry.instance;
  }

  private init(): void {
    // 1. Nạp danh mục Assets
    for (const asset of INITIAL_ASSETS) {
      this.assetsById.set(asset.assetId, asset);
    }

    // 2. Nạp danh mục Content Entries
    for (const entry of INITIAL_CONTENT_ENTRIES) {
      this.registerEntry(entry);
    }
  }

  /**
   * Đăng ký một bản ghi mới vào Registry với kiểm tra toàn vẹn
   */
  public registerEntry(entry: ContentEntry): void {
    this.entriesById.set(entry.id, entry);
    this.entriesByRuntimeKey.set(entry.runtimeKey, entry);

    // Đăng ký slug và các aliases
    this.entriesByAlias.set(entry.slug.toLowerCase(), entry);
    if (entry.aliases) {
      for (const alias of entry.aliases) {
        this.entriesByAlias.set(alias.toLowerCase(), entry);
      }
    }
  }

  /**
   * Tra cứu theo Tầng 1: Content ID chính thức (HW-[TYPE]-[SUBTYPE]-[SEQ])
   */
  public getByContentId(contentId: string): ContentEntry | undefined {
    return this.entriesById.get(contentId);
  }

  /**
   * Tra cứu theo Tầng 2: Runtime Key / Legacy Key (snake_case)
   */
  public getByRuntimeKey(runtimeKey: string): ContentEntry | undefined {
    return this.entriesByRuntimeKey.get(runtimeKey);
  }

  /**
   * Tra cứu đa năng / Thông minh (Resolve Alias):
   * Nhận vào Content ID, Runtime Key hoặc bất kỳ Alias nào (VD: "pine_resin", "res_tree_resin", "tree_resin")
   */
  public resolveAlias(idOrKeyOrAlias: string): ContentEntry | undefined {
    if (!idOrKeyOrAlias) return undefined;
    const cleanQuery = idOrKeyOrAlias.trim();
    const lowerQuery = cleanQuery.toLowerCase();

    // 1. Tìm theo Content ID
    const byId = this.entriesById.get(cleanQuery);
    if (byId) return byId;

    // 2. Tìm theo Runtime Key
    const byKey = this.entriesByRuntimeKey.get(cleanQuery);
    if (byKey) return byKey;

    // 3. Tìm theo Alias / Slug
    return this.entriesByAlias.get(lowerQuery);
  }

  /**
   * Tra cứu Tầng 3: Asset Record
   */
  public getAsset(assetId: string): AssetRecord | undefined {
    return this.assetsById.get(assetId);
  }

  /**
   * Lấy toàn bộ danh sách nội dung
   */
  public getAllEntries(): ContentEntry[] {
    return Array.from(this.entriesById.values());
  }

  /**
   * Lấy danh sách nội dung theo phân loại (ITM, WPN, EQP, ZON, NPC...)
   */
  public getEntriesByType(type: ContentType): ContentEntry[] {
    return this.getAllEntries().filter(e => e.type === type);
  }

  /**
   * Kiểm tra toàn vẹn dữ liệu Registry:
   * - Phát hiện ID trùng lặp
   * - Phát hiện Runtime Key trùng lặp
   * - Phát hiện Asset tham chiếu không tồn tại
   */
  public validateRegistry(): RegistryValidationResult {
    const duplicateIds: string[] = [];
    const duplicateRuntimeKeys: string[] = [];
    const unresolvedAssetRefs: string[] = [];
    const issues: string[] = [];

    const seenIds = new Set<string>();
    const seenKeys = new Set<string>();

    for (const entry of INITIAL_CONTENT_ENTRIES) {
      // Kiểm tra trùng Content ID
      if (seenIds.has(entry.id)) {
        duplicateIds.push(entry.id);
        issues.push(`Trùng lặp Content ID: ${entry.id}`);
      }
      seenIds.add(entry.id);

      // Kiểm tra trùng Runtime Key
      if (seenKeys.has(entry.runtimeKey)) {
        duplicateRuntimeKeys.push(entry.runtimeKey);
        issues.push(`Trùng lặp Runtime Key: ${entry.runtimeKey}`);
      }
      seenKeys.add(entry.runtimeKey);

      // Kiểm tra Asset References
      if (entry.assetRefs) {
        for (const assetId of entry.assetRefs) {
          if (!this.assetsById.has(assetId)) {
            unresolvedAssetRefs.push(`${entry.id} -> ${assetId}`);
            issues.push(`Không tìm thấy Asset ID tham chiếu: ${assetId} trong bản ghi ${entry.id}`);
          }
        }
      }
    }

    return {
      isValid: issues.length === 0,
      totalEntries: INITIAL_CONTENT_ENTRIES.length,
      duplicateIds,
      duplicateRuntimeKeys,
      unresolvedAssetRefs,
      issues
    };
  }
}
