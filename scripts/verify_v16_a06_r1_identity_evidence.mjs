import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const phaserNodeStubPlugin = {
  name: 'phaser-node-stub',
  setup(b) {
    b.onResolve({ filter: /^phaser$/ }, () => ({ path: 'phaser', namespace: 'phaser-stub' }));
    b.onLoad({ filter: /.*/, namespace: 'phaser-stub' }, () => ({
      contents: `
        class EventEmitter {
          constructor() { this._l = new Map(); }
          on(ev, fn) { if (!this._l.has(ev)) this._l.set(ev, []); this._l.get(ev).push(fn); return this; }
          once(ev, fn) { const w = (...a) => { this.off(ev, w); fn(...a); }; return this.on(ev, w); }
          off(ev, fn) { const arr = this._l.get(ev) || []; this._l.set(ev, arr.filter(f => f !== fn)); return this; }
          emit(ev, ...a) { for (const fn of [...(this._l.get(ev) || [])]) fn(...a); return true; }
          removeAllListeners(ev) { if (ev) this._l.delete(ev); else this._l.clear(); return this; }
        }
        export const Events = { EventEmitter };
        export const Scene = class {};
        export default { Events, Scene };
      `,
      loader: 'js'
    }));
  }
};

async function loadModules() {
  const storage = new Map();
  globalThis.localStorage = {
    getItem: (k) => (storage.has(k) ? storage.get(k) : null),
    setItem: (k, v) => { storage.set(k, String(v)); },
    removeItem: (k) => { storage.delete(k); }
  };
  globalThis.window = { localStorage: globalThis.localStorage };

  const entrySource = `
    export * from './src/systems/IdentityRevealResolver.ts';
    export { PlayerState } from './src/state/PlayerState.ts';
    export { QuestSystem } from './src/systems/QuestSystem.ts';
    export { SaveManager } from './src/systems/SaveManager.ts';
    export { EndingSystem } from './src/systems/EndingSystem.ts';
  `;
  const result = await build({
    stdin: {
      contents: entrySource,
      resolveDir: ROOT_DIR,
      sourcefile: 'a06_r1_bundle_entry.ts',
      loader: 'ts'
    },
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
    plugins: [phaserNodeStubPlugin],
    define: {
      'import.meta.env': JSON.stringify({ DEV: false, VITE_HOLLOW_WOODS_QA: '1' })
    }
  });
  const moduleUrl = 'data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64');
  const mod = await import(moduleUrl);
  return { mod, storage };
}

const { mod, storage } = await loadModules();
const {
  APPROVED_IDENTITY_EVIDENCE_RULES,
  hasIdentityEvidence,
  canRevealPlayerIdentity,
  getMatchedEvidenceRuleIds,
  getLoreVisibilityStatus,
  getPlayerDisplayIdentity,
  getEndingDisplayLines,
  PlayerState,
  QuestSystem,
  SaveManager,
  EndingSystem
} = mod;

let passed = 0;
let failed = 0;
function check(name, cond, detail = '') {
  if (cond) {
    passed++;
    console.log(`[PASS] ${name}${detail ? ` -> ${detail}` : ''}`);
  } else {
    failed++;
    console.error(`[FAIL] ${name}${detail ? ` -> ${detail}` : ''}`);
  }
}

try {
  // Rule structure check
  check(
    'Rules: APPROVED_IDENTITY_EVIDENCE_RULES defines exact MAIN_PATH_Q05 & SIDE_PATH_SQ08',
    APPROVED_IDENTITY_EVIDENCE_RULES.length === 2 &&
      APPROVED_IDENTITY_EVIDENCE_RULES.map((r) => r.id).join(',') === 'MAIN_PATH_Q05,SIDE_PATH_SQ08',
    APPROVED_IDENTITY_EVIDENCE_RULES.map((r) => r.id).join(', ')
  );

  // R1-T01: Stage 0-2 NEVER reveal even when all evidence flags exist
  const ps = PlayerState.getInstance();
  ps.reset();
  ps.setFlag('vaelen_mold_quest_assigned');
  ps.setFlag('purification_key_crafted');
  ps.setFlag('inspected_knights_memorial_stele');
  ps.setFlag('boss_hooded_knight_defeated');
  ps.setFlag('campfire_knight_q3_completed');
  check('R1-T01a: Stage 0 with evidence stays unrevealed', ps.memoryAwakeningStage === 0 && ps.hasIdentityEvidence() === true && !ps.canRevealPlayerIdentity());
  ps.setMemoryAwakeningStage(1);
  check('R1-T01b: Stage 1 with evidence stays unrevealed', !ps.canRevealPlayerIdentity() && !ps.unlockedLore.some((l) => l.id === 'lore_wayfarer_inner_journal'));
  ps.setMemoryAwakeningStage(2);
  check('R1-T01c: Stage 2 with evidence stays unrevealed', !ps.canRevealPlayerIdentity() && !ps.unlockedLore.some((l) => l.id === 'lore_wayfarer_inner_journal'));

  // R1-T02: Stage 3 missing approved evidence must NOT reveal (including quest_corrupted_crest alone)
  ps.reset();
  ps.addItem('quest_corrupted_crest', 1);
  ps.setFlag('corrupted_crest_obtained');
  ps.setFlag('boss_hooded_knight_defeated'); // SQ08 incomplete without campfire_knight_q3_completed
  ps.setMemoryAwakeningStage(3);
  check(
    'R1-T02a: Stage 3 + quest_corrupted_crest + boss_hooded_knight_defeated alone does NOT reveal',
    ps.memoryAwakeningStage === 3 && !ps.hasIdentityEvidence() && !ps.canRevealPlayerIdentity()
  );
  check(
    'R1-T02b: lore_memory_chapter_4 is REDACTED & lore_wayfarer_inner_journal stays HIDDEN',
    getLoreVisibilityStatus('lore_memory_chapter_4', ps) === 'REDACTED' &&
      getLoreVisibilityStatus('lore_wayfarer_inner_journal', ps) === 'HIDDEN'
  );

  // R1-T02c: Main route missing stele stays unrevealed
  ps.reset();
  ps.setFlag('vaelen_mold_quest_assigned');
  ps.setFlag('purification_key_crafted');
  ps.setMemoryAwakeningStage(3);
  check('R1-T02c: Stage 3 + vaelen_mold_quest_assigned + purification_key_crafted without stele does NOT reveal', !ps.canRevealPlayerIdentity());

  // R1-T02d: Main route missing vaelen_mold_quest_assigned stays unrevealed
  ps.reset();
  ps.setFlag('purification_key_crafted');
  ps.setFlag('collected_note_read_black_knight_stele');
  ps.setMemoryAwakeningStage(3);
  check('R1-T02d: Stage 3 + key + stele without vaelen_mold_quest_assigned does NOT reveal', !ps.canRevealPlayerIdentity());

  // R1-T03 & R1-T04: Main path reaches Stage 3 on unlockBridge without SQ08 and reveals with all 3 stele variants
  for (const steleFlag of [
    'inspected_knights_memorial_stele',
    'collected_note_inspect_knights_memorial_stele',
    'collected_note_read_black_knight_stele'
  ]) {
    ps.reset();
    let revealedEvents = 0;
    const onRev = () => { revealedEvents++; };
    ps.on('identity_revealed', onRev);

    ps.addItem('item_bell_mold', 1);
    ps.setFlag('has_bell_mold');
    ps.addItem('quest_rune_fragment', 1);
    ps.setFlag('has_rune_fragment');
    ps.setFlag('vaelen_mold_quest_assigned');
    ps.setFlag(steleFlag);
    assert.equal(QuestSystem.getInstance().craftPurificationKey(ps), true);
    assert.equal(QuestSystem.getInstance().unlockBridge(ps), true);

    check(
      `R1-T03/T04 (${steleFlag}): Main path reaches Stage 3 via unlockBridge without SQ08 and reveals`,
      ps.memoryAwakeningStage === 3 &&
        ps.canRevealPlayerIdentity() &&
        getMatchedEvidenceRuleIds(ps).includes('MAIN_PATH_Q05') &&
        !getMatchedEvidenceRuleIds(ps).includes('SIDE_PATH_SQ08') &&
        ps.unlockedLore.some((l) => l.id === 'lore_wayfarer_inner_journal') &&
        revealedEvents === 1,
      `matched=${getMatchedEvidenceRuleIds(ps).join(',')}, events=${revealedEvents}`
    );
    ps.off('identity_revealed', onRev);
  }

  // R1-T05: Side path SQ08 reveal
  ps.reset();
  let sideEvents = 0;
  const onSideRev = () => { sideEvents++; };
  ps.on('identity_revealed', onSideRev);
  ps.setFlag('boss_hooded_knight_defeated');
  ps.setFlag('campfire_knight_q3_completed');
  ps.setMemoryAwakeningStage(3);
  check(
    'R1-T05: Side path SQ08 + Stage 3 reveals Meliodas Blackwood cleanly',
    ps.canRevealPlayerIdentity() &&
      getMatchedEvidenceRuleIds(ps).includes('SIDE_PATH_SQ08') &&
      getPlayerDisplayIdentity(ps).plainName === 'Lord Meliodas Blackwood — The Wolf Lord' &&
      sideEvents === 1
  );
  ps.off('identity_revealed', onSideRev);

  // R1-T06: Late evidence AFTER Stage 3 (Case B) — no stage increment, no duplicate trust/reward
  ps.reset();
  ps.setVillageTrustScore(55);
  ps.setFlag('vaelen_mold_quest_assigned');
  ps.addItem('item_bell_mold', 1);
  ps.addItem('quest_rune_fragment', 1);
  QuestSystem.getInstance().craftPurificationKey(ps);
  ps.setMemoryAwakeningStage(3);
  check('R1-T06a: Stage 3 reached first without stele stays unrevealed', ps.memoryAwakeningStage === 3 && !ps.canRevealPlayerIdentity());
  let lateEvents = 0;
  ps.on('identity_revealed', () => { lateEvents++; });
  ps.setFlag('collected_note_read_black_knight_stele');
  check(
    'R1-T06b: Late stele evidence triggers single reveal & unlocks inner journal without trust/stage change',
    ps.canRevealPlayerIdentity() &&
      ps.memoryAwakeningStage === 3 &&
      ps.getVillageTrustScore() === 55 &&
      ps.unlockedLore.some((l) => l.id === 'lore_wayfarer_inner_journal') &&
      lateEvents === 1
  );

  // R1-T07: Evidence BEFORE Stage 3 (Case A)
  ps.reset();
  let earlyCaseEvents = 0;
  ps.on('identity_revealed', () => { earlyCaseEvents++; });
  ps.setMemoryAwakeningStage(2);
  ps.setFlag('vaelen_mold_quest_assigned');
  ps.setFlag('purification_key_crafted');
  ps.setFlag('inspected_knights_memorial_stele');
  check('R1-T07a: Evidence gathered at Stage 2 waits unrevealed', !ps.canRevealPlayerIdentity() && earlyCaseEvents === 0);
  ps.setMemoryAwakeningStage(3);
  check('R1-T07b: Reaching Stage 3 later reveals immediately once', ps.canRevealPlayerIdentity() && earlyCaseEvents === 1);

  // R1-T08 & R1-T12: Completing both routes & re-reconciling never duplicates events/trust/items
  const trustBeforeSecond = ps.getVillageTrustScore();
  const invCountBeforeSecond = ps.getItemCount('quest_purification_key');
  const loreCountBeforeSecond = ps.unlockedLore.length;
  ps.setFlag('boss_hooded_knight_defeated');
  ps.setFlag('campfire_knight_q3_completed');
  ps.setMemoryAwakeningStage(3);
  ps.reconcileIdentityRevealState({ emitEvent: true });
  ps.reconcileIdentityRevealState({ emitEvent: true });
  check(
    'R1-T08/T12: Completing SQ08 after Main reveal & repeated sync causes 0 duplicate events/trust/items/lore',
    getMatchedEvidenceRuleIds(ps).length === 2 &&
      earlyCaseEvents === 1 &&
      ps.getVillageTrustScore() === trustBeforeSecond &&
      ps.getItemCount('quest_purification_key') === invCountBeforeSecond &&
      ps.unlockedLore.length === loreCountBeforeSecond
  );

  // R1-T09 & Case D: Save / Load before reveal, after reveal, and legacy Stage 3 + evidence without pre-set notified flag
  storage.clear();
  ps.reset();
  ps.setVillageTrustScore(68);
  ps.setStoryFlag('choice_garth_cooperative');
  ps.setFlag('vaelen_mold_quest_assigned');
  ps.setFlag('purification_key_crafted');
  ps.setMemoryAwakeningStage(3);
  assert.equal(SaveManager.saveGame('Pre-Reveal Stage3', 'silent_mire', 500, 300), true);
  ps.reset();
  const loadedPre = SaveManager.loadGame();
  check(
    'R1-T09a: Save/Load Stage 3 before evidence keeps Schema 3 and unrevealed state',
    loadedPre?.saveSchemaVersion === 3 &&
      ps.memoryAwakeningStage === 3 &&
      !ps.canRevealPlayerIdentity() &&
      !ps.unlockedLore.some((l) => l.id === 'lore_wayfarer_inner_journal')
  );

  // Case D legacy save containing Stage 3 + SIDE_PATH_SQ08 flags but NO lore_wayfarer_inner_journal and NO identity_revealed_notified
  const legacySaveObj = SaveManager.buildSaveData('Legacy Case D', 'bellhollow', 640, 360);
  legacySaveObj.flags = ['boss_hooded_knight_defeated', 'campfire_knight_q3_completed'];
  legacySaveObj.questFlags = [...legacySaveObj.flags];
  legacySaveObj.unlockedLoreIds = ['lore_three_rules', 'lore_memory_chapter_4'];
  legacySaveObj.memoryAwakeningStage = 3;
  legacySaveObj.villageTrustScore = 72;
  let legacyPopupEvents = 0;
  ps.reset();
  ps.on('identity_revealed', () => { legacyPopupEvents++; });
  SaveManager.applySaveToState(SaveManager.sanitizeAndMigrateSaveData(legacySaveObj));
  check(
    'R1-T09b/Case D: Legacy save Stage 3 + SQ08 syncs inner journal & reveal state cleanly with 0 duplicate popup/stage change',
    ps.memoryAwakeningStage === 3 &&
      ps.canRevealPlayerIdentity() &&
      ps.unlockedLore.some((l) => l.id === 'lore_wayfarer_inner_journal') &&
      ps.getVillageTrustScore() === 72 &&
      ps.getStoryFlags().length === 1 &&
      legacyPopupEvents === 0
  );
  // Continuing gameplay on Case D must also NOT emit a duplicate reveal popup
  ps.setFlag('inspected_knights_memorial_stele');
  ps.setFlag('vaelen_mold_quest_assigned');
  ps.setFlag('mire_root_seal_broken');
  check('R1-T09c: Further evidence flags after Case D load do not fire duplicate reveal popup', legacyPopupEvents === 0);

  // R1-T13: 16 Ending boundary cases (stage 0..3 x comp 49/50 x trust 64/65 -> 8 fog / 7 sacrifice / 1 true)
  const stubDisplayObj = () => ({
    setDepth: () => stubDisplayObj(),
    setVisible: () => stubDisplayObj(),
    setScrollFactor: () => stubDisplayObj(),
    setAlpha: () => stubDisplayObj(),
    setOrigin: () => stubDisplayObj(),
    add: () => stubDisplayObj(),
    destroy: () => {}
  });
  const fakeScene = {
    playerState: ps,
    add: {
      container: stubDisplayObj,
      graphics: stubDisplayObj,
      text: stubDisplayObj
    }
  };
  const endingSys = new EndingSystem(fakeScene);
  const counts = { fog_loop_ending: 0, sacrifice_ending: 0, true_ending: 0 };
  for (const st of [0, 1, 2, 3]) {
    for (const cp of [49, 50]) {
      for (const tr of [64, 65]) {
        ps.reset();
        ps.setMemoryAwakeningStage(st);
        ps.stats.composure = cp;
        ps.setVillageTrustScore(tr);
        const res = endingSys.determineEndingType();
        counts[res]++;
      }
    }
  }
  check(
    'R1-T13: 16 Ending boundary cases unchanged (8 fog_loop / 7 sacrifice / 1 true)',
    counts.fog_loop_ending === 8 && counts.sacrifice_ending === 7 && counts.true_ending === 1,
    JSON.stringify(counts)
  );
  // Check Ending display text reveals Meliodas only when revealed
  ps.reset();
  ps.setMemoryAwakeningStage(3);
  const redactedEndingLines = getEndingDisplayLines('true_ending', ['Lord Meliodas Blackwood đã giải cứu làng.'], ps);
  ps.setFlag('vaelen_mold_quest_assigned');
  ps.setFlag('purification_key_crafted');
  ps.setFlag('inspected_knights_memorial_stele');
  const revealedEndingLines = getEndingDisplayLines('true_ending', ['Lord Meliodas Blackwood đã giải cứu làng.'], ps);
  check(
    'R1-T10/T13b: Ending display text redacts unrevealed Stage 3 and reveals once evidence exists',
    !redactedEndingLines[0].includes('Meliodas') && revealedEndingLines[0].includes('Meliodas Blackwood')
  );

  // R1-T14: 7-stage main quest progression stays unbroken without softlock
  ps.reset();
  ps.markZoneVisited('silent_mire');
  ps.addItem('quest_corrupted_crest', 1);
  ps.setFlag('corrupted_crest_obtained');
  ps.setFlag('vaelen_mold_quest_assigned');
  ps.addItem('item_bell_mold', 1);
  ps.setFlag('has_bell_mold');
  ps.addItem('quest_rune_fragment', 1);
  ps.setFlag('has_rune_fragment');
  assert.equal(QuestSystem.getInstance().craftPurificationKey(ps), true);
  assert.equal(QuestSystem.getInstance().unlockBridge(ps), true);
  check(
    'R1-T14: Main quest progression reaches Stage 7 shrine unlock & Stage 3 without SQ08',
    QuestSystem.getInstance().getCurrentStageNumber(ps) === 7 &&
      ps.isShrineUnlocked() === true &&
      ps.memoryAwakeningStage === 3 &&
      ps.getStoryQuestId() === 'Q06_RETRIEVE_CLAPPER'
  );

  // Save legacy unrevealed stage 3 lore preservation (R1-T11)
  check(
    'R1-T11: storyFlags untouched by internal identity_revealed_notified flag',
    !ps.getStoryFlags().includes('identity_revealed_notified') && !ps.hasFlag('identity_revealed_notified')
  );
} catch (err) {
  failed++;
  console.error('UNEXPECTED ERROR:', err);
}

console.log(`\n=== SUMMARY: ${passed} PASS, ${failed} FAIL ===`);
process.exit(failed > 0 ? 1 : 0);
