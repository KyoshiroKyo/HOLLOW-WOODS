/**
 * IdentityRevealResolver — Bộ giải hợp đồng Thức Tỉnh Ký Ức & Tiết Lộ Thân Phận (HW-V16-A06)
 *
 * Phân tách tường minh 5 trạng thái độc lập theo DEC-LOCK-07 & DEC-LOCK-11:
 *   1. memoryStage     : Tiến trình ký ức (0..3)
 *   2. loreUnlocked    : Bản ghi đã mở trong Sổ Tay [J] (unlockedLore)
 *   3. npcRecognition  : Mức độ nhận biết của NPC (không vượt quá Reveal Gate)
 *   4. identityRevealed: memoryStage >= 3 AND Approved Recognition Evidence
 *   5. questCompleted  : Trạng thái hoàn thành nhiệm vụ chính/phụ
 */

export interface IdentityLoreView {
  id: string;
  act: number;
  title: string;
  author: string;
  content: string;
}

export interface IdentityQuestTaskView {
  id: string;
  done: boolean;
}

export interface IdentityQuestView {
  id: string;
  tasks: IdentityQuestTaskView[];
}

export interface IdentityStateView {
  memoryAwakeningStage: number;
  flags: Set<string>;
  storyFlags: Set<string>;
  unlockedLore: IdentityLoreView[];
  inventory?: Map<string, number>;
  quests?: Map<string, IdentityQuestView>;
}

export type LoreVisibilityStatus = 'AVAILABLE' | 'HIDDEN' | 'REDACTED' | 'REVEALED';

export type NpcRecognitionLevel =
  | 'NONE'
  | 'FAINT_FAMILIARITY'
  | 'COMRADE_OATH'
  | 'MORDRIC_STANCE_GLINT'
  | 'VAELEN_CREST_Q05'
  | 'FULL_REVEAL';

export interface ApprovedEvidenceRule {
  id: string;
  label: string;
  route: 'main' | 'side';
  evaluate: (state: IdentityStateView) => boolean;
}

export interface PlayerDisplayIdentity {
  isRevealed: boolean;
  memoryStage: number;
  hudBadge: string;
  plainName: string;
  chronicleTitle: string;
  subtitle: string;
}

export interface QuestCompletionSnapshot {
  q05MireSolved: boolean;
  q06ClapperRetrieved: boolean;
  sq08Completed: boolean;
}

export interface IdentityStatusSnapshot {
  memoryStage: number;
  hasEvidence: boolean;
  identityRevealed: boolean;
  matchedEvidenceRuleIds: string[];
  npcRecognition: NpcRecognitionLevel;
  loreUnlockedIds: string[];
  questCompleted: QuestCompletionSnapshot;
  displayIdentity: PlayerDisplayIdentity;
}

/**
 * Sổ quy tắc chứng cứ đã được Owner phê duyệt chính thức (HW-V16-A06-R1 — Option 1, 2026-11-27):
 *   - MAIN_PATH_Q05 : Tuyến chính Q05 không ép SQ08
 *   - SIDE_PATH_SQ08: Tuyến phụ SQ08 song song với Sir Mordric & Sir Vaelen
 */
export const APPROVED_IDENTITY_EVIDENCE_RULES: ReadonlyArray<ApprovedEvidenceRule> = [
  {
    id: 'MAIN_PATH_Q05',
    label: 'Tuyến chính Q05: Xác nhận Quân Huy Hắc Lang + Rèn Chìa / Phá Phong Ấn + Văn Bia Kỵ Sĩ',
    route: 'main',
    evaluate: (state: IdentityStateView): boolean =>
      hasAnyFlag(state, 'vaelen_mold_quest_assigned') &&
      (hasAnyFlag(state, 'purification_key_crafted') || hasAnyFlag(state, 'mire_root_seal_broken')) &&
      (
        hasAnyFlag(state, 'inspected_knights_memorial_stele') ||
        hasAnyFlag(state, 'collected_note_inspect_knights_memorial_stele') ||
        hasAnyFlag(state, 'collected_note_read_black_knight_stele')
      )
  },
  {
    id: 'SIDE_PATH_SQ08',
    label: 'Tuyến phụ SQ08: Hạ gục Sir Mordric & Hoàn tất kiểm chứng cùng Sir Vaelen',
    route: 'side',
    evaluate: (state: IdentityStateView): boolean =>
      hasAnyFlag(state, 'campfire_knight_q3_completed') &&
      hasAnyFlag(state, 'boss_hooded_knight_defeated')
  }
];

const IDENTITY_SENSITIVE_LORE_IDS = new Set<string>([
  'lore_memory_chapter_4',
  'lore_wayfarer_inner_journal',
  'lore_ending_true',
  'lore_ending_sacrifice'
]);

const REDACTED_LORE_PROJECTIONS: Record<string, { title?: string; author?: string; content: string }> = {
  lore_memory_chapter_4: {
    title: 'HỒI ỨC IV: MẢNH KÝ ỨC CHƯA TRỌN VẸN',
    author: 'Tàn Dư Ký Ức Bản Thể',
    content:
      'Những mảnh ký ức vẫn còn lớp sương che phủ — cần thêm bằng chứng được xác thực để gọi đúng tên quá khứ của kẻ đã bước vào rừng năm xưa theo tiếng cầu cứu bí ẩn.\n\nDù chưa thể gọi thành tên, thanh kiếm và Vòng Sáng Hộ Tâm [F] vẫn tiếp tục soi đường hoàn tất lời thề bảo vệ Bellhollow: Fides Ultra Tenebras.'
  },
  lore_wayfarer_inner_journal: {
    title: 'NHẬT KÝ LỮ KHÁCH: LỜI THỀ TRONG RÊU PHONG',
    author: 'Người lữ khách',
    content:
      'Từng mảnh ký ức như dòng nước ấm chảy qua lớp băng giá của thời gian...\n\n[Danh tính quá khứ vẫn còn chìm trong màn sương — cần thêm bằng chứng được xác thực để khôi phục trọn vẹn.]\n\nNgọn lửa kiên định của Sir Vaelen, chén thuốc của Neris, lò rèn của Bram, lòng dũng cảm của Garth và tiếng tin từ Finn... tất cả đã giữ ta vững bước.\n\nLời thề bảo vệ Bellhollow chưa bao giờ tắt. Ta sẽ đưa Lưỡi Chuông Đồng trở về đỉnh tháp và gióng lên hồi chuông giải phóng cho thung lũng này!'
  }
};

function hasAnyFlag(state: IdentityStateView, flag: string): boolean {
  return Boolean(state.flags?.has(flag) || state.storyFlags?.has(flag));
}

function clampMemoryStage(stage: number): number {
  if (typeof stage !== 'number' || Number.isNaN(stage)) return 0;
  return Math.max(0, Math.min(3, Math.floor(stage)));
}

/**
 * Kiểm tra người chơi có thỏa ít nhất một quy tắc chứng cứ nhận diện đã được Owner phê duyệt hay không.
 */
export function getMatchedEvidenceRuleIds(
  state: IdentityStateView,
  approvedRules: ReadonlyArray<ApprovedEvidenceRule> = APPROVED_IDENTITY_EVIDENCE_RULES
): string[] {
  if (!approvedRules || approvedRules.length === 0) {
    return [];
  }
  const matched: string[] = [];
  for (const rule of approvedRules) {
    try {
      if (rule.evaluate(state)) {
        matched.push(rule.id);
      }
    } catch {
      // Bỏ qua lỗi cục bộ trên rule đơn lẻ để giữ an toàn fail-closed
    }
  }
  return matched;
}

export function hasIdentityEvidence(
  state: IdentityStateView,
  approvedRules: ReadonlyArray<ApprovedEvidenceRule> = APPROVED_IDENTITY_EVIDENCE_RULES
): boolean {
  return getMatchedEvidenceRuleIds(state, approvedRules).length > 0;
}

/**
 * Hợp đồng bắt buộc (DEC-LOCK-07):
 *   Identity Revealed = Memory Stage >= 3 AND Approved Recognition Evidence
 */
export function canRevealPlayerIdentity(
  state: IdentityStateView,
  approvedRules: ReadonlyArray<ApprovedEvidenceRule> = APPROVED_IDENTITY_EVIDENCE_RULES
): boolean {
  return clampMemoryStage(state.memoryAwakeningStage) >= 3 && hasIdentityEvidence(state, approvedRules);
}

/**
 * Tách riêng mức độ nhận biết của NPC khỏi việc tiết lộ danh tính đầy đủ của người chơi.
 */
export function getNpcRecognitionLevel(
  state: IdentityStateView,
  approvedRules: ReadonlyArray<ApprovedEvidenceRule> = APPROVED_IDENTITY_EVIDENCE_RULES
): NpcRecognitionLevel {
  if (canRevealPlayerIdentity(state, approvedRules)) {
    return 'FULL_REVEAL';
  }
  if (hasAnyFlag(state, 'vaelen_mold_quest_assigned')) {
    return 'VAELEN_CREST_Q05';
  }
  const stage = clampMemoryStage(state.memoryAwakeningStage);
  if (hasAnyFlag(state, 'boss_hooded_knight_defeated') || stage >= 2) {
    return 'MORDRIC_STANCE_GLINT';
  }
  if (hasAnyFlag(state, 'campfire_knight_q1_completed') || stage >= 1) {
    return 'COMRADE_OATH';
  }
  if (hasAnyFlag(state, 'talked_to_campfire_knight') || hasAnyFlag(state, 'talked_to_edda')) {
    return 'FAINT_FAMILIARITY';
  }
  return 'NONE';
}

/**
 * Danh xưng hiển thị thống nhất cho HUD, Dialogues, Ending Chronicle & Menu.
 */
export function getPlayerDisplayIdentity(
  state: IdentityStateView,
  approvedRules: ReadonlyArray<ApprovedEvidenceRule> = APPROVED_IDENTITY_EVIDENCE_RULES
): PlayerDisplayIdentity {
  const memoryStage = clampMemoryStage(state.memoryAwakeningStage);
  const isRevealed = canRevealPlayerIdentity(state, approvedRules);
  const title = isRevealed ? 'Lord Meliodas Blackwood — The Wolf Lord'
    : memoryStage >= 2 ? 'The Lone Wolf' : 'The Nameless Wayfarer';

  return {
    isRevealed,
    memoryStage,
    hudBadge: `${isRevealed ? '⚔️' : '🌲'} ${title}`,
    plainName: title,
    chronicleTitle: title,
    subtitle: isRevealed ? 'The Wolf Lord' : title
  };
}

export function getQuestCompletionSnapshot(state: IdentityStateView): QuestCompletionSnapshot {
  const sq08 = state.quests?.get('SQ08_PURIFY_FALLEN');
  const sq08TasksDone = Boolean(sq08 && sq08.tasks.length > 0 && sq08.tasks.every((t) => t.done));
  return {
    q05MireSolved: hasAnyFlag(state, 'mire_pillars_solved') || hasAnyFlag(state, 'mire_puzzle_solved') || hasAnyFlag(state, 'shrine_bridge_lowered'),
    q06ClapperRetrieved: hasAnyFlag(state, 'clapper_collected') || hasAnyFlag(state, 'bell_rung'),
    sq08Completed: hasAnyFlag(state, 'campfire_knight_q3_completed') || sq08TasksDone
  };
}

export function getIdentityStatusSnapshot(
  state: IdentityStateView,
  approvedRules: ReadonlyArray<ApprovedEvidenceRule> = APPROVED_IDENTITY_EVIDENCE_RULES
): IdentityStatusSnapshot {
  const memoryStage = clampMemoryStage(state.memoryAwakeningStage);
  const matchedEvidenceRuleIds = getMatchedEvidenceRuleIds(state, approvedRules);
  const hasEvidence = matchedEvidenceRuleIds.length > 0;
  const identityRevealed = memoryStage >= 3 && hasEvidence;
  return {
    memoryStage,
    hasEvidence,
    identityRevealed,
    matchedEvidenceRuleIds,
    npcRecognition: getNpcRecognitionLevel(state, approvedRules),
    loreUnlockedIds: (state.unlockedLore || []).map((l) => l.id),
    questCompleted: getQuestCompletionSnapshot(state),
    displayIdentity: getPlayerDisplayIdentity(state, approvedRules)
  };
}

/**
 * Phân loại trạng thái hiển thị của từng mảnh Lore trong Journal [J]:
 *   - AVAILABLE : Có thể đọc (lore không chứa danh tính thật)
 *   - HIDDEN    : Chưa được mở khóa
 *   - REDACTED  : Đã mở khóa trong save/stage nhưng chưa đủ điều kiện reveal danh tính -> hiển thị bản che danh tính
 *   - REVEALED  : Đủ điều kiện đọc toàn bộ nội dung gốc
 */
export function getLoreVisibilityStatus(
  loreId: string,
  state: IdentityStateView,
  approvedRules: ReadonlyArray<ApprovedEvidenceRule> = APPROVED_IDENTITY_EVIDENCE_RULES
): LoreVisibilityStatus {
  const isUnlocked = (state.unlockedLore || []).some((l) => l.id === loreId);
  if (!isUnlocked) {
    return 'HIDDEN';
  }
  if (IDENTITY_SENSITIVE_LORE_IDS.has(loreId)) {
    return canRevealPlayerIdentity(state, approvedRules) ? 'REVEALED' : 'REDACTED';
  }
  return 'AVAILABLE';
}

function redactIdentityNames(text: string): string {
  return text
    .replace(/(?:Lord )?Meliodas Blackwood\s*[—-]\s*The Wolf Lord/g, 'Người lữ khách mang Vòng Sáng Hộ Tâm')
    .replace(/Lord Meliodas Blackwood/g, 'Người lữ khách ấy')
    .replace(/Meliodas Blackwood/g, 'Người lữ khách ấy');
}

function redactEndingNarrative(text: string): string {
  return redactIdentityNames(text
    .replace(/sự thức tỉnh trọn vẹn của (?:Lord )?Meliodas Blackwood — The Wolf Lord và /g, '')
    .replace(/^(?:Lord )?Meliodas Blackwood(?: — The Wolf Lord)? đã nhớ lại[^\n]+(?:\n\n)?/, ''));
}

/**
 * Chiếu một mục Lore sang dạng hiển thị an toàn mà KHÔNG xóa hoặc thay đổi bản gốc trong SaveData.
 */
export function projectLoreEntryForDisplay<T extends IdentityLoreView>(
  entry: T,
  state: IdentityStateView,
  approvedRules: ReadonlyArray<ApprovedEvidenceRule> = APPROVED_IDENTITY_EVIDENCE_RULES
): { entry: T; status: LoreVisibilityStatus } {
  const status = getLoreVisibilityStatus(entry.id, state, approvedRules);
  if (status !== 'REDACTED') {
    return { entry, status };
  }

  const override = REDACTED_LORE_PROJECTIONS[entry.id];
  if (override) {
    return {
      status,
      entry: {
        ...entry,
        title: override.title ?? entry.title,
        author: override.author ?? entry.author,
        content: override.content
      }
    };
  }

  return {
    status,
    entry: {
      ...entry,
      title: redactIdentityNames(entry.title),
      author: redactIdentityNames(entry.author),
      content: redactEndingNarrative(entry.content)
    }
  };
}

/**
 * Đồng bộ lời văn hiển thị trên Ending Screen theo Reveal Gate mà không đổi ngưỡng chọn Ending.
 */
export function getEndingDisplayLines(
  endingType: 'true_ending' | 'sacrifice_ending' | 'fog_loop_ending',
  canonicalLines: string[],
  state: IdentityStateView,
  approvedRules: ReadonlyArray<ApprovedEvidenceRule> = APPROVED_IDENTITY_EVIDENCE_RULES
): string[] {
  if (endingType === 'fog_loop_ending' || canRevealPlayerIdentity(state, approvedRules)) {
    return canonicalLines;
  }
  return canonicalLines.map(redactEndingNarrative).filter(Boolean);
}
