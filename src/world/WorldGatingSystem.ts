import { ZoneId, WorldTier, ZoneAccessRule } from '../types';
import { PlayerState } from '../state/PlayerState';

export interface TransitionEvaluation {
  allowed: boolean;
  reason?: string;
  hint?: string;
  tier: WorldTier;
  targetZoneId: ZoneId;
}

/**
 * WorldGatingSystem – Quản lý tập trung quy tắc khóa/mở khóa và chuyển vùng giữa 3 tầng thế giới
 * Áp dụng theo Thiết kế V1.2 (Phương án C — Hybrid Open World).
 */
export class WorldGatingSystem {
  private static instance: WorldGatingSystem | null = null;
  private accessRules: Map<ZoneId, ZoneAccessRule> = new Map();

  private constructor() {
    this.registerDefaultRules();
  }

  public static getInstance(): WorldGatingSystem {
    if (!WorldGatingSystem.instance) {
      WorldGatingSystem.instance = new WorldGatingSystem();
    }
    return WorldGatingSystem.instance;
  }

  /**
   * Đăng ký bộ quy tắc chuẩn tắc cho toàn bộ các phân khu trong 3 tầng thế giới V1.2
   */
  private registerDefaultRules(): void {
    // =========================================================================
    // TẦNG 1: CORE WORLD (Vùng Lõi tự do sinh hoạt, chế tạo và khám phá)
    // =========================================================================
    this.registerRule({
      zoneId: 'fog_crossing',
      tier: 'LAYER_1_CORE',
      conditionType: 'always_unlocked',
      lockedReasonVietnamese: 'Lối mòn ban sơ luôn mở.',
      hintVietnamese: 'Bước theo tiếng chuông dẫn lối để tiến vào làng.'
    });

    this.registerRule({
      zoneId: 'bellhollow',
      tier: 'LAYER_1_CORE',
      conditionType: 'always_unlocked',
      lockedReasonVietnamese: 'Làng Bellhollow là trung tâm an toàn của vùng lõi.',
      hintVietnamese: 'Nơi tập trung các NPC, bàn chế tạo và tháp chuông cổ.'
    });

    this.registerRule({
      zoneId: 'sanctuary_farm',
      tier: 'LAYER_1_CORE',
      conditionType: 'always_unlocked',
      lockedReasonVietnamese: 'Nông trại Trú Ẩn thuộc vùng lõi an toàn.',
      hintVietnamese: 'Khu vực bình yên để canh tác thảo dược và kho chứa an toàn.'
    });

    this.registerRule({
      zoneId: 'outer_woods',
      tier: 'LAYER_1_CORE',
      conditionType: 'always_unlocked',
      lockedReasonVietnamese: 'Rừng Ngoại Vi mở tự do cho người chơi thu thập nguyên liệu ban đầu.',
      hintVietnamese: 'Vùng đệm ven làng Bellhollow, an toàn cho việc tìm kiếm củi khô và thảo dược.'
    });

    // V1.4 - Tiểu khu Core World
    this.registerRule({
      zoneId: 'sub_bell_workshop',
      tier: 'LAYER_1_CORE',
      conditionType: 'always_unlocked',
      lockedReasonVietnamese: 'Xưởng Chuông Bỏ Hoang nằm ven Rừng Ngoại Vi.',
      hintVietnamese: 'Khám phá nhánh rừng phía Nam Outer Woods để tìm tàn tích xưởng rèn chuông.'
    });

    this.registerRule({
      zoneId: 'sub_root_cellar',
      tier: 'LAYER_1_CORE',
      conditionType: 'always_unlocked',
      lockedReasonVietnamese: 'Hầm Rễ Cổ nằm dưới nền Nông Trại Sanctuary.',
      hintVietnamese: 'Lối xuống nằm cạnh chòi nông cụ Sanctuary Farm.'
    });

    // =========================================================================
    // TẦNG 2: FRONTIER (Vùng Biên viễn khám phá & thử thách sinh tồn)
    // =========================================================================
    this.registerRule({
      zoneId: 'crooked_path',
      tier: 'LAYER_2_FRONTIER',
      conditionType: 'flag_required',
      requiredFlag: 'east_gate_unlocked',
      lockedReasonVietnamese: 'Cổng Đông làng Bellhollow đang bị khóa chặt bằng xích sắt phong ấn!',
      hintVietnamese: 'Hãy hoàn tất hội thoại mở cổng với Garth, Edda hoặc Neris.'
    });

    this.registerRule({
      zoneId: 'sub_whispering_clearing',
      tier: 'LAYER_2_FRONTIER',
      conditionType: 'quest_required',
      requiredQuestId: 'Q03_PREPARE_RESOURCES',
      lockedReasonVietnamese: 'Khoảng Trống Thì Thầm nằm sâu trong vùng rừng sương mù.',
      hintVietnamese: 'Cần mở Cổng Đông để tiếp cận từ Outer Woods hoặc Deep Forest.'
    });

    this.registerRule({
      zoneId: 'deep_forest',
      tier: 'LAYER_2_FRONTIER',
      conditionType: 'quest_required',
      requiredQuestId: 'Q04_ANCIENT_RUNES',
      requiredFlag: 'talked_to_neris',
      lockedReasonVietnamese: 'Rừng Sâu mịt mù sương độc, Kẻ Lắng Nghe đang lởn vởn săn đuổi!',
      hintVietnamese: 'Cần vượt qua Cổng Đông và mang theo mồi tạo tiếng động để đánh lạc hướng quái vật.'
    });

    // =========================================================================
    // TẦNG 3: FORBIDDEN REGIONS (Vùng Cấm mở khóa theo tiến trình cốt truyện)
    // =========================================================================
    this.registerRule({
      zoneId: 'silent_mire',
      tier: 'LAYER_3_FORBIDDEN',
      conditionType: 'quest_required',
      requiredQuestId: 'Q04_ANCIENT_RUNES',
      requiredTaskId: 't1',
      lockedReasonVietnamese: 'Đầm Lầy Tĩnh Lặng bị che phủ bởi sương mù độc hại và nước lầy đen kịt!',
      hintVietnamese: 'Cần hoàn thành nhiệm vụ lần theo dấu vết cổ ngữ tại Đường Mòn Quanh Co.'
    });

    this.registerRule({
      zoneId: 'ancient_rune_puzzle',
      tier: 'LAYER_3_FORBIDDEN',
      conditionType: 'quest_required',
      requiredQuestId: 'Q04_ANCIENT_RUNES',
      lockedReasonVietnamese: 'Khu Vực Câu Đố Cổ Ngữ chưa được khai mở.',
      hintVietnamese: 'Cần tiến sâu vào Đầm Lầy Tĩnh Lặng để tìm ba Cột Đá Cổ Ngữ.'
    });

    this.registerRule({
      zoneId: 'broken_bell_shrine',
      tier: 'LAYER_3_FORBIDDEN',
      conditionType: 'flag_required',
      requiredFlag: 'mire_root_seal_broken',
      requiredQuestId: 'Q05_SOLVE_MIRE',
      lockedReasonVietnamese: 'Cây cầu bị khóa bởi Phong Ấn Rễ Cổ.',
      hintVietnamese: 'Hãy tìm Sir Vaelen tại Trạm Lửa Rừng Tĩnh Lặng để tìm cách hóa giải.'
    });

    // =========================================================================
    // V1.4 - CÁC PHÂN KHU MỞ RỘNG TẦNG 3 (FORBIDDEN EXPANSION)
    // =========================================================================
    this.registerRule({
      zoneId: 'abyssal_chasm',
      tier: 'LAYER_3_FORBIDDEN',
      conditionType: 'flag_required',
      requiredFlag: 'abyssal_gate_unlocked',
      lockedReasonVietnamese: 'Cổng Cổ Ngữ Hư Không đang bị phong ấn bởi năng lượng bóng tối từ Khe Nứt!',
      hintVietnamese: 'Cần giải phóng ngọn lửa chuông hoặc mang theo Bùa Hộ Mệnh Cổ Ngữ để tiến vào Vực Sâu.'
    });

    this.registerRule({
      zoneId: 'drowned_mire_depths',
      tier: 'LAYER_3_FORBIDDEN',
      conditionType: 'flag_required',
      requiredFlag: 'mire_drained',
      lockedReasonVietnamese: 'Vùng Trũng Đầm Lầy ngập sâu trong bùn lầy nguy hiểm chưa thể tiếp cận!',
      hintVietnamese: 'Hãy hoàn thành câu đố 3 cột đá để hạ mực nước đầm lầy.'
    });

    this.registerRule({
      zoneId: 'whispering_grove_sanctum',
      tier: 'LAYER_3_FORBIDDEN',
      conditionType: 'quest_required',
      requiredQuestId: 'Q04_ANCIENT_RUNES',
      lockedReasonVietnamese: 'Thánh Địa Rừng Thì Thầm bị khóa bởi kết giới cành liễu cổ xưa!',
      hintVietnamese: 'Lần theo âm vang tiếng thì thầm qua Khoảng Trống Thì Thầm.'
    });

    this.registerRule({
      zoneId: 'sunken_crypt_ruins',
      tier: 'LAYER_3_FORBIDDEN',
      conditionType: 'flag_required',
      requiredFlag: 'clapper_collected',
      lockedReasonVietnamese: 'Cổng Hầm Mộ Chìm bị khóa chặt bởi phong ấn cổ ngữ rễ cây!',
      hintVietnamese: 'Khôi phục quả chuông tại Miếu Chuông để phá vỡ phong ấn hầm mộ.'
    });

    this.registerRule({
      zoneId: 'veil_origin_cavern',
      tier: 'LAYER_3_FORBIDDEN',
      conditionType: 'flag_required',
      requiredFlag: 'knight_commander_defeated',
      lockedReasonVietnamese: 'Hang Cội Nguồn Màn Sương tỏa ra khí lạnh thấu xương, phong ấn cấm kỵ chưa mở!',
      hintVietnamese: 'Vượt qua thử thách Vực Sâu Bóng Tối và đối đầu với Tàn Dư Hiệp Sĩ.'
    });
  }

  public registerRule(rule: ZoneAccessRule): void {
    this.accessRules.set(rule.zoneId, rule);
  }

  public getRule(zoneId: ZoneId): ZoneAccessRule | undefined {
    return this.accessRules.get(zoneId);
  }

  public getZoneTier(zoneId: ZoneId): WorldTier {
    const rule = this.accessRules.get(zoneId);
    return rule ? rule.tier : 'LAYER_1_CORE';
  }

  public getTierDisplayName(tier: WorldTier): string {
    switch (tier) {
      case 'LAYER_1_CORE':
        return 'Tầng 1 — Core World (Vùng Lõi tự do)';
      case 'LAYER_2_FRONTIER':
        return 'Tầng 2 — Frontier (Vùng Biên viễn)';
      case 'LAYER_3_FORBIDDEN':
        return 'Tầng 3 — Forbidden (Vùng Cấm cốt truyện)';
    }
  }

  /**
   * C4-12-28: Đánh giá tính khả dụng (Unlocked) tập trung của một phân khu đối với trạng thái người chơi
   * Nơi duy nhất định nghĩa và kiểm tra quy tắc cốt truyện để mở khóa thế giới.
   */
  public isZoneUnlocked(zoneId: ZoneId, playerState: PlayerState): boolean {
    const rule = this.accessRules.get(zoneId);
    if (!rule) {
      console.warn(`[WorldGatingSystem] Phân khu chưa được đăng ký hoặc không xác định: ${zoneId}`);
      return false;
    }

    // Tầng 1 (Core World): luôn luôn mở tự do
    if (rule.tier === 'LAYER_1_CORE' || rule.conditionType === 'always_unlocked') {
      return true;
    }

    const storyQuestId = playerState.getStoryQuestId();

    // 2. Khu vực Rừng Sâu Deep Forest: Chỉ mở khi Cổng Đông đã mở VÀ tiến trình đạt từ Q04 trở đi (hoặc có flag deep_forest_unlocked)
    if (zoneId === 'deep_forest') {
      const eastGateOpen = this.isZoneUnlocked('crooked_path', playerState);
      if (!eastGateOpen) return false;

      return (
        playerState.hasFlag('deep_forest_unlocked') ||
        storyQuestId === 'Q04_ANCIENT_RUNES' ||
        storyQuestId === 'Q05_SOLVE_MIRE' ||
        storyQuestId === 'Q06_RETRIEVE_CLAPPER'
      );
    }

    // Tầng 3 (Forbidden): Đầm Lầy Tĩnh Lặng & Trận Địa Cổ Ngữ
    if (zoneId === 'silent_mire' || zoneId === 'ancient_rune_puzzle') {
      const eastGateOpen = this.isZoneUnlocked('crooked_path', playerState);
      if (!eastGateOpen) return false;

      const q04 = playerState.quests.get('Q04_ANCIENT_RUNES');
      const t1Done = q04?.tasks.find(t => t.id === 't1')?.done ?? false;
      const pastQ04 =
        storyQuestId === 'Q05_SOLVE_MIRE' ||
        storyQuestId === 'Q06_RETRIEVE_CLAPPER';
      return (
        t1Done ||
        pastQ04 ||
        playerState.hasFlag('entered_silent_mire') ||
        playerState.hasFlag('mire_unlocked')
      );
    }

    // Tầng 3 (Forbidden): Miếu Chuông Phế Tích (The Broken Bell Shrine)
    if (zoneId === 'broken_bell_shrine') {
      return (
        playerState.hasFlag('mire_root_seal_broken') ||
        playerState.hasFlag('shrine_bridge_lowered') ||
        playerState.hasFlag('mire_puzzle_solved') ||
        playerState.hasFlag('mire_pillars_solved') ||
        playerState.hasFlag('mire_drained') ||
        storyQuestId === 'Q06_RETRIEVE_CLAPPER' ||
        playerState.hasFlag('clapper_collected')
      );
    }

    // V1.4: Phân khu Vực Sâu Bóng Tối (Abyssal Chasm)
    if (zoneId === 'abyssal_chasm') {
      const deepForestOpen = this.isZoneUnlocked('deep_forest', playerState);
      if (!deepForestOpen) return false;
      return (
        playerState.hasFlag('abyssal_gate_unlocked') ||
        playerState.hasFlag('abyssal_chasm_unlocked') ||
        storyQuestId === 'Q06_RETRIEVE_CLAPPER' ||
        playerState.hasFlag('clapper_collected') ||
        playerState.hasFlag('mire_puzzle_solved')
      );
    }

    // V1.4: Vùng Trũng Đầm Lầy (Drowned Mire Depths)
    if (zoneId === 'drowned_mire_depths') {
      return (
        playerState.hasFlag('mire_drained') ||
        playerState.hasFlag('mire_puzzle_solved') ||
        storyQuestId === 'Q06_RETRIEVE_CLAPPER'
      );
    }

    // V1.4: Thánh Địa Rừng Thì Thầm (Whispering Grove Sanctum)
    if (zoneId === 'whispering_grove_sanctum') {
      return (
        this.isZoneUnlocked('sub_whispering_clearing', playerState) &&
        (playerState.hasFlag('grove_sanctum_unlocked') ||
         storyQuestId === 'Q04_ANCIENT_RUNES' ||
         storyQuestId === 'Q05_SOLVE_MIRE' ||
         storyQuestId === 'Q06_RETRIEVE_CLAPPER')
      );
    }

    // V1.4: Hầm Mộ Chìm Phế Tích (Sunken Crypt Ruins)
    if (zoneId === 'sunken_crypt_ruins') {
      return (
        playerState.hasFlag('clapper_collected') ||
        playerState.hasFlag('crypt_unlocked')
      );
    }

    // V1.4: Hang Cội Nguồn Màn Sương (Veil Origin Cavern)
    if (zoneId === 'veil_origin_cavern') {
      return (
        playerState.hasFlag('knight_commander_defeated') ||
        playerState.hasFlag('veil_origin_unlocked')
      );
    }

    // Kiểm tra quy tắc mở rộng theo điều kiện đăng ký (Fail-Closed nếu không khớp)
    switch (rule.conditionType) {
      case 'item_required': {
        if (!rule.requiredItem) return false;
        return (playerState.inventory.get(rule.requiredItem) || 0) >= 1;
      }

      case 'flag_required': {
        if (!rule.requiredFlag) return false;
        return playerState.hasFlag(rule.requiredFlag);
      }

      case 'quest_required': {
        if (rule.requiredQuestId && storyQuestId === rule.requiredQuestId) {
          if (rule.requiredTaskId) {
            const q = playerState.quests.get(rule.requiredQuestId);
            return q?.tasks.find(t => t.id === rule.requiredTaskId)?.done ?? false;
          }
          return true;
        }
        return false;
      }

      default:
        return false;
    }
  }

  /**
   * C4-12-28 & C4-132-04: Kiểm tra trạng thái cổng chặn thế giới tập trung (Gate Check)
   */
  public isGateOpen(gateId: string, playerState: PlayerState): boolean {
    switch (gateId) {
      case 'east_gate':
      case 'gate_bellhollow_east':
        return this.isZoneUnlocked('crooked_path', playerState);

      case 'deep_forest_gate':
      case 'gate_deep_forest':
        return this.isZoneUnlocked('deep_forest', playerState);

      case 'abyssal_gate':
      case 'abyssal_chasm_gate':
      case 'gate_abyssal_chasm':
        return this.isZoneUnlocked('abyssal_chasm', playerState);

      case 'deep_forest_mire_barrier':
      case 'df_mire_barrier':
      case 'mire_boundary':
      case 'mire_ward':
      case 'gate_silent_mire':
        return this.isZoneUnlocked('silent_mire', playerState);

      case 'shrine_ward':
      case 'gate_broken_bell_shrine':
        return this.isZoneUnlocked('broken_bell_shrine', playerState);

      default:
        console.warn(`[WorldGatingSystem] Cổng không xác định hoặc chưa đăng ký: ${gateId}`);
        return false;
    }
  }

  /**
   * C4-12-28: Lấy danh sách toàn bộ phân khu hiện đang mở khóa
   */
  public getAllUnlockedZones(playerState: PlayerState): ZoneId[] {
    const allZones: ZoneId[] = [
      'fog_crossing',
      'bellhollow',
      'sanctuary_farm',
      'outer_woods',
      'crooked_path',
      'deep_forest',
      'silent_mire',
      'ancient_rune_puzzle',
      'broken_bell_shrine'
    ];
    return allZones.filter(z => this.isZoneUnlocked(z, playerState));
  }

  /**
   * C4-12-28: Lấy chi tiết thông tin mở khóa phân khu dùng cho giao diện và kiểm tra
   */
  public getZoneUnlockDetails(
    zoneId: ZoneId,
    playerState: PlayerState
  ): { unlocked: boolean; tier: WorldTier; reason: string; hint: string } {
    const rule = this.accessRules.get(zoneId);
    const tier = rule ? rule.tier : 'LAYER_1_CORE';
    const unlocked = this.isZoneUnlocked(zoneId, playerState);

    return {
      unlocked,
      tier,
      reason: unlocked
        ? 'Tuyến đường đã thông suốt và sẵn sàng khám phá.'
        : rule?.lockedReasonVietnamese || 'Khu vực này hiện đang bị niêm phong theo cốt truyện.',
      hint: unlocked
        ? 'Có thể tự do di chuyển qua lại an toàn.'
        : rule?.hintVietnamese || 'Hãy hoàn thành thêm nhiệm vụ cốt truyện để giải phong ấn.'
    };
  }

  /**
   * Đánh giá quá trình di chuyển từ fromZone sang toZone
   */
  public evaluateTransition(
    _fromZone: ZoneId,
    toZone: ZoneId,
    playerState: PlayerState
  ): TransitionEvaluation {
    const rule = this.accessRules.get(toZone);
    const tier = rule ? rule.tier : 'LAYER_1_CORE';

    const unlocked = this.isZoneUnlocked(toZone, playerState);
    if (unlocked) {
      return {
        allowed: true,
        tier,
        targetZoneId: toZone
      };
    }

    return {
      allowed: false,
      reason: rule?.lockedReasonVietnamese || 'Khu vực này hiện đang bị phong ấn!',
      hint: rule?.hintVietnamese || 'Hãy tiếp tục thực hiện chuỗi nhiệm vụ để mở khóa.',
      tier,
      targetZoneId: toZone
    };
  }

  /**
   * Lấy danh sách tất cả các phân khu thuộc một tầng thế giới
   */
  public getZonesByTier(tier: WorldTier): ZoneId[] {
    const list: ZoneId[] = [];
    for (const [zoneId, rule] of this.accessRules.entries()) {
      if (rule.tier === tier) {
        list.push(zoneId);
      }
    }
    return list;
  }
}
