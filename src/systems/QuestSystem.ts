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
import { ZoneConnectionRegistry } from '../world/ZoneConnectionRegistry';
import type { ZoneId } from '../types';

const QUEST_DESTINATIONS: Partial<Record<string, ZoneId>> = {
  Q00_WAKE_UP: 'fog_crossing',
  Q01_MEET_EDDA: 'bellhollow',
  Q02_MEET_NERIS: 'bellhollow',
  Q03_PREPARE_RESOURCES: 'bellhollow',
  Q04_ANCIENT_RUNES: 'crooked_path',
  Q05_SOLVE_MIRE: 'silent_mire',
  Q06_RETRIEVE_CLAPPER: 'broken_bell_shrine',
  SQ01_RUNED_IRON: 'outer_woods',
  SQ02_BELL_MEMORY: 'outer_woods',
  SQ03_CELLAR_TEA: 'sanctuary_farm',
  SQ04_CLEARING_PATROL: 'outer_woods',
  SQ05_FINN_INTEL: 'bellhollow',
  SQ06_KEEP_FIRE: 'outer_woods',
  SQ07_LOST_COMRADES: 'outer_woods',
  SQ08_PURIFY_FALLEN: 'deep_forest',
  SQ09_BROKEN_LANTERN: 'outer_woods',
};

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
  targetZone: ZoneId;
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
      ps.getStoryQuestId() === 'Q06_RETRIEVE_CLAPPER'
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
    ps.setMemoryAwakeningStage(3);
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
  public getTrackedQuestDisplay(ps = PlayerState.getInstance()) {
    const quest = ps.getCurrentQuest();
    if (!quest) return undefined;

    // Vaelen's workshop objective already has route data and uses the current
    // main quest ID. Display that objective after he assigns it.
    const stage = this.getCurrentStageInfo(ps);
    const workshop = quest.id === 'Q05_SOLVE_MIRE' && stage.stageNumber === 3 &&
      ps.hasFlag('vaelen_mold_quest_assigned');
    const tasks = workshop
      ? stage.tasks.map((task, index) => ({ ...task, done: index === 0 }))
      : quest.tasks;
    const nextTask = tasks.find(task => !task.done);
    const followsStory = quest.id === ps.getStoryQuestId();
    const followsRoute = followsStory && (
      (quest.id === 'Q04_ANCIENT_RUNES' && stage.stageNumber === 1 && quest.tasks[0]?.done) ||
      (quest.id === 'Q05_SOLVE_MIRE' && (workshop || [2, 4, 5, 6].includes(stage.stageNumber))) ||
      (quest.id === 'Q06_RETRIEVE_CLAPPER' && nextTask?.id === 't1' && stage.stageNumber === 7)
    );
    const route = nextTask && followsRoute ? stage : undefined;
    const targetZone = nextTask ? route?.targetZone ?? this.getQuestDestination(quest.id, nextTask.id) : undefined;
    const targetName = route?.targetZoneName ??
      (targetZone && ZoneConnectionRegistry.getInstance().getZoneNode(targetZone)?.titleVietnamese);
    return {
      quest, tasks, nextTask, targetZone, targetName, route,
      title: workshop ? stage.title : quest.title,
      description: workshop ? stage.description : quest.description,
    };
  }

  private getQuestDestination(questId: string, taskId: string): ZoneId | undefined {
    if (questId === 'Q06_RETRIEVE_CLAPPER' && taskId === 't2') return 'bellhollow';
    if (questId === 'SQ01_RUNED_IRON' && taskId === 't2') return 'bellhollow';
    if (questId === 'SQ02_BELL_MEMORY' && taskId === 't2') return 'bellhollow';
    if (questId === 'SQ04_CLEARING_PATROL' && taskId === 't3') return 'bellhollow';
    if (questId === 'SQ08_PURIFY_FALLEN' && taskId === 't3') return 'outer_woods';
    if (questId === 'SQ09_BROKEN_LANTERN' && taskId !== 't2') return 'bellhollow';
    return QUEST_DESTINATIONS[questId];
  }

  public getHUDQuestDisplay(state?: PlayerState): {
    header: string;
    title: string;
    taskText: string;
    directionHint: string;
    fullText: string;
  } {
    const tracked = this.getTrackedQuestDisplay(state);
    const header = '📜 NHIỆM VỤ HIỆN TẠI [J]:';
    const title = tracked?.title ?? '';
    const direction = tracked?.route ? ` (Hướng ${tracked.route.directionHint})` : '';
    const directionHint = tracked?.targetName ? `🧭 Mục tiêu: ${tracked.targetName}${direction}` : '';
    const taskText = tracked?.nextTask ? `☐ ${tracked.nextTask.text}` : tracked ? '☑ Đã hoàn thành' : '';

    const fullText = [title, taskText, directionHint].filter(Boolean).join('\n');

    return {
      header,
      title,
      taskText,
      directionHint,
      fullText
    };
  }
}
