/**
 * HOLLOW WOODS V1.5 - STEP V15-60
 * QUEST SYSTEM & MULTI-BRANCHING EXPLORATION ROUTE (A -> E -> B -> D -> F -> E -> C)
 * 
 * Hệ thống điều phối tiến trình 7 chặng nhiệm vụ chính tuyến liên kết chặt chẽ:
 * Chặng 1: A -> E (Bellhollow -> Silent Mire)
 * Chặng 2: Tại E -> B (Silent Mire -> Quiet Forest Bonfire / Sir Vaelen)
 * Chặng 3: B -> D (Sir Vaelen -> Abandoned Bell Workshop & Root Cellar)
 * Chặng 4: D -> F (Bell Workshop -> Deep Forest & Rune Puzzle)
 * Chặng 5: F -> B/A (Deep Forest -> Sir Vaelen / Bram để đúc Chìa Khóa Thanh Tẩy)
 * Chặng 6: Quay lại E -> Mở khóa C (Silent Mire -> Phá Phong Ấn Rễ Cổ & Hạ Cầu)
 * Chặng 7: Tại C (Broken Bell Shrine -> Đấu Trùm, Thu Hồi Lưỡi Chuông & Kết Thúc)
 */

import { QA_BUILD } from '../debug/DevSessionPolicy';
import { PlayerState } from '../state/PlayerState';
import questsData from '../data/quests.json';

export interface QuestTaskConfig {
  id: string;
  text: string;
  done: boolean;
}

export interface QuestStageConfig {
  stageNumber: number;
  stageId: string;
  questId: string;
  legacyQuestId: string;
  title: string;
  route: string;
  fromZone: string;
  targetZone: string;
  targetZoneName: string;
  directionHint: string;
  giver: string;
  description: string;
  hudHint: string;
  requiredItem: string | null;
  tasks: QuestTaskConfig[];
}

export class QuestSystem {
  private static instance: QuestSystem | null = null;
  private stages: QuestStageConfig[] = [];

  private constructor() {
    this.stages = questsData.stages as QuestStageConfig[];
  }

  public static getInstance(): QuestSystem {
    if (!QuestSystem.instance) {
      QuestSystem.instance = new QuestSystem();
    }
    return QuestSystem.instance;
  }

  public getStages(): QuestStageConfig[] {
    return this.stages;
  }

  public getStage(stageNumber: number): QuestStageConfig | undefined {
    return this.stages.find(s => s.stageNumber === stageNumber);
  }

  /**
   * Xác định chặng hiện tại (1..7) dựa trên kho đồ và các cờ tiến trình của PlayerState
   */
  public getCurrentStageNumber(state?: PlayerState): number {
    const ps = state || PlayerState.getInstance();

    // Chặng 7: Đã phá phong ấn rễ cổ hoặc đã hạ trùm / thu hồi chuông tại C
    if (
      ps.hasFlag('clapper_collected') ||
      ps.hasFlag('boss_mire_warden_defeated') ||
      ps.hasFlag('mire_root_seal_broken') ||
      ps.hasFlag('shrine_bridge_lowered') ||
      ps.currentQuestId === 'Q06_RETRIEVE_CLAPPER'
    ) {
      return 7;
    }

    // Chặng 6: Đã sở hữu Chìa Khóa Thanh Tẩy, đang trên đường quay lại E để mở cầu C
    if (
      ps.getItemCount('quest_purification_key') > 0 ||
      ps.hasFlag('has_purification_key') ||
      ps.hasFlag('purification_key_crafted')
    ) {
      return 6;
    }

    // Chặng 5: Đã có đủ Khuôn Đúc Đồng Cổ (D) và Mảnh Cổ Ngữ (F), cần về gặp Sir Vaelen (B) hoặc Bram (A)
    const hasMold = ps.getItemCount('item_bell_mold') > 0 || ps.hasFlag('has_bell_mold');
    const hasRune = ps.getItemCount('quest_rune_fragment') > 0 ||
                    ps.getItemCount('mat_runed_iron') > 0 ||
                    ps.hasFlag('has_rune_fragment') ||
                    ps.hasFlag('rune_fragment_obtained');
    if (hasMold && hasRune) {
      return 5;
    }

    // Chặng 4: Đã có Khuôn Đúc Đồng Cổ từ Xưởng Chuông (D), đang tiến vào Rừng Sâu (F) tìm Mảnh Cổ Ngữ
    if (hasMold) {
      return 4;
    }

    // Chặng 3: Đã tìm thấy Huy Hiệu Kỵ Sĩ Sa Ngã ở Đầm Lầy (E), đang tới gặp Sir Vaelen (B)
    const hasCrest = ps.getItemCount('quest_corrupted_crest') > 0 ||
                     ps.hasFlag('corrupted_crest_obtained') ||
                     ps.hasFlag('mire_root_seal_inspected');
    if (hasCrest) {
      return 3;
    }

    // Chặng 2: Đã đặt chân tới Đầm Lầy Tĩnh Lặng (E) nhưng cầu bị khóa bởi Phong Ấn Rễ Cổ
    if (
      ps.hasFlag('entered_silent_mire') ||
      ps.hasFlag('mire_visited') ||
      ps.visitedZones.has('silent_mire')
    ) {
      return 2;
    }

    // Chặng 1: Khởi đầu tại Làng Bellhollow (A), chuẩn bị tiến sang Đầm Lầy (E)
    return 1;
  }

  /**
   * Lấy cấu hình đầy đủ của chặng nhiệm vụ hiện tại
   */
  private developerStagePreview: number | null = null;

  public setDeveloperStagePreview(stage: number | null): void {
    if (QA_BUILD) this.developerStagePreview = stage;
  }

  public getCurrentStageInfo(state?: PlayerState): QuestStageConfig {
    const stageNum = this.developerStagePreview ?? this.getCurrentStageNumber(state);
    const stage = this.getStage(stageNum);
    return stage || this.stages[0];
  }

  /**
   * Trạng thái chốt chặn Phong Ấn Rễ Cổ tại Đầm Lầy Tĩnh Lặng (E)
   */
  public getBridgeSealState(state?: PlayerState): {
    isBroken: boolean;
    canBreak: boolean;
    promptText: string;
    reasonText: string;
  } {
    const ps = state || PlayerState.getInstance();
    const isBroken = ps.hasFlag('mire_root_seal_broken') || ps.hasFlag('shrine_bridge_lowered');
    const canBreak = !isBroken && (
      ps.getItemCount('quest_purification_key') > 0 ||
      ps.hasFlag('has_purification_key')
    );

    let promptText = '';
    let reasonText = '';

    if (isBroken) {
      promptText = '✔ Thân cây đã hạ làm cầu thông sang Miếu Chuông Phế Tích';
      reasonText = 'Lối đi sang Miếu Chuông đã thông suốt.';
    } else if (canBreak) {
      promptText = '[E] Dùng Chìa Khóa Thanh Tẩy để phá bỏ Phong Ấn Rễ Cổ & Hạ Cầu Cây';
      reasonText = 'Bạn đã có Chìa Khóa Thanh Tẩy trong tay. Hãy tương tác để mở lối!';
    } else {
      promptText = '[E] Khảo sát Cầu Cây bị khóa bởi Phong Ấn Rễ Cổ';
      reasonText = 'Cây cầu bị khóa bởi Phong Ấn Rễ Cổ. Hãy tìm Sir Vaelen tại Trạm Lửa Rừng Tĩnh Lặng để tìm cách hóa giải.';
    }

    return { isBroken, canBreak, promptText, reasonText };
  }

  /**
   * Tương tác mở khóa Cầu Cây tại Đầm Lầy Tĩnh Lặng (E) khi có Chìa Khóa Thanh Tẩy
   */
  public unlockBridge(state?: PlayerState): boolean {
    const ps = state || PlayerState.getInstance();
    const seal = this.getBridgeSealState(ps);
    if (seal.isBroken) return true;
    if (!seal.canBreak) return false;

    // Phá bỏ phong ấn và hạ thân cây làm cầu
    ps.setFlag('mire_root_seal_broken');
    ps.setFlag('shrine_bridge_lowered');
    ps.setFlag('shrine_unlocked');
    ps.setCurrentQuest('Q06_RETRIEVE_CLAPPER');

    return true;
  }

  /**
   * Chế tạo / Hợp nhất Chìa Khóa Thanh Tẩy tại Sir Vaelen (B) hoặc Bram (A)
   */
  public craftPurificationKey(state?: PlayerState): boolean {
    const ps = state || PlayerState.getInstance();
    if (ps.getItemCount('quest_purification_key') > 0) return true;

    const hasMold = ps.getItemCount('item_bell_mold') > 0 || ps.hasFlag('has_bell_mold');
    const hasRune = ps.getItemCount('quest_rune_fragment') > 0 ||
                    ps.getItemCount('mat_runed_iron') > 0 ||
                    ps.hasFlag('has_rune_fragment');

    if (!hasMold || !hasRune) return false;

    ps.addItem('quest_purification_key', 1);
    ps.setFlag('has_purification_key');
    ps.setFlag('purification_key_crafted');

    return true;
  }

  /**
   * Định dạng dữ liệu hiển thị trên HUD "NHIỆM VỤ HIỆN TẠI [J]"
   */
  public getHUDQuestDisplay(state?: PlayerState): {
    header: string;
    title: string;
    taskText: string;
    directionHint: string;
    fullText: string;
  } {
    const ps = state || PlayerState.getInstance();
    const stage = this.getCurrentStageInfo(ps);

    const header = `📜 NHIỆM VỤ HIỆN TẠI [J] — CHẶNG ${stage.stageNumber}/7:`;
    const title = `${stage.title}`;
    const directionHint = `🧭 Mục tiêu: ${stage.targetZoneName} (Hướng ${stage.directionHint})`;
    const taskText = `☐ ${stage.hudHint}`;

    const fullText = `${title}\n${taskText}\n${directionHint}`;

    return {
      header,
      title,
      taskText,
      directionHint,
      fullText
    };
  }
}
