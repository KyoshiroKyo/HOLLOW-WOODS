/**
 * verify_b07_edda_save_migration.mjs — HW-AG-B07
 * Node-only test (no Chromium). Tests migrateEddaRuneCharmV161 logic directly
 * using mock SaveData in Save Schema 3 format.
 * 6 test cases. Exits 0 if all pass, 1 if any fail.
 */
import assert from 'node:assert/strict';

// ─── Inline the migration logic (mirrors SaveManager.migrateEddaRuneCharmV161) ───
// We test it in isolation so the script stays lightweight and dependency-free.
// The real implementation in SaveManager.ts is called from sanitizeAndMigrateSaveData().
function migrateEddaRuneCharmV161(inventory, flags, storyFlags, equippedSlots, storageChest) {
  const CHARM_ID = 'eqp_bell_ward_charm';
  const MIGRATION_FLAG = 'migrated_edda_rune_charm_v161';
  const GRANT_FLAG = 'edda_rune_charm_granted';
  const REWARD_FLAG = 'dlg_reward:edda_rune_guide';

  if (flags.includes(MIGRATION_FLAG) || storyFlags.includes(MIGRATION_FLAG)) return;

  const hadGrantFlag = flags.includes(GRANT_FLAG) || storyFlags.includes(GRANT_FLAG);
  const hadRewardFlag = flags.includes(REWARD_FLAG) || storyFlags.includes(REWARD_FLAG);
  if (!hadGrantFlag && !hadRewardFlag) return;

  const inInventory = inventory.some(([id, cnt]) => id === CHARM_ID && cnt > 0);
  const inEquipped = equippedSlots.charm === CHARM_ID;
  const inChest = storageChest.some(([id, cnt]) => id === CHARM_ID && cnt > 0);

  if (!flags.includes(GRANT_FLAG)) flags.push(GRANT_FLAG);
  if (!flags.includes(REWARD_FLAG)) flags.push(REWARD_FLAG);
  if (!storyFlags.includes(GRANT_FLAG)) storyFlags.push(GRANT_FLAG);
  if (!storyFlags.includes(REWARD_FLAG)) storyFlags.push(REWARD_FLAG);

  if (!inInventory && !inEquipped && !inChest) {
    const existing = inventory.find(([id]) => id === CHARM_ID);
    if (existing) {
      existing[1] = 1;
    } else {
      inventory.push([CHARM_ID, 1]);
    }
  }

  flags.push(MIGRATION_FLAG);
  storyFlags.push(MIGRATION_FLAG);
}

function countCharm(inventory) {
  const entry = inventory.find(([id]) => id === 'eqp_bell_ward_charm');
  return entry ? entry[1] : 0;
}

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (e) {
    console.error(`  [FAIL] ${name}: ${e.message}`);
    failed++;
  }
}

// ─── TC1: Save cũ bị lỗi — có cờ, 0 charm ở mọi nơi → phục hồi 1 charm + idempotency flag ───
test('TC1: Save cũ bị lỗi → phục hồi 1 charm + cờ idempotency', () => {
  const inv = [];
  const flags = ['edda_rune_charm_granted'];
  const story = ['dlg_reward:edda_rune_guide'];
  const equipped = { body: null, feet: null, back: null, charm: null };
  const chest = [];

  migrateEddaRuneCharmV161(inv, flags, story, equipped, chest);

  assert.equal(countCharm(inv), 1, 'inventory phải có 1 eqp_bell_ward_charm');
  assert.ok(flags.includes('migrated_edda_rune_charm_v161'), 'flags phải có cờ idempotency');
  assert.ok(story.includes('migrated_edda_rune_charm_v161'), 'storyFlags phải có cờ idempotency');
  assert.ok(flags.includes('edda_rune_charm_granted'), 'flags giữ nguyên edda_rune_charm_granted');
  assert.ok(flags.includes('dlg_reward:edda_rune_guide'), 'flags giữ nguyên dlg_reward:edda_rune_guide');
  assert.ok(story.includes('edda_rune_charm_granted'), 'storyFlags sync edda_rune_charm_granted');
  assert.ok(story.includes('dlg_reward:edda_rune_guide'), 'storyFlags sync dlg_reward:edda_rune_guide');
});

// ─── TC2: Nạp lại Save đã migrate lần 2 → không nhân đôi (idempotent) ───
test('TC2: Nạp lại Save đã migrate → vẫn 1 charm, không nhân đôi', () => {
  // Giả lập trạng thái SAU khi TC1 đã chạy và được serialized lại
  const inv = [['eqp_bell_ward_charm', 1]];
  const flags = [
    'edda_rune_charm_granted',
    'dlg_reward:edda_rune_guide',
    'migrated_edda_rune_charm_v161'
  ];
  const story = [
    'edda_rune_charm_granted',
    'dlg_reward:edda_rune_guide',
    'migrated_edda_rune_charm_v161'
  ];
  const equipped = { body: null, feet: null, back: null, charm: null };
  const chest = [];

  migrateEddaRuneCharmV161(inv, flags, story, equipped, chest);

  assert.equal(countCharm(inv), 1, 'inventory vẫn đúng 1 — không nhân đôi');
  assert.equal(inv.filter(([id]) => id === 'eqp_bell_ward_charm').length, 1, 'không có entry trùng lặp');
});

// ─── TC3: Save hợp lệ — đã có charm trong inventory → giữ nguyên ───
test('TC3: Save hợp lệ có sẵn charm trong inventory → giữ nguyên 1', () => {
  const inv = [['eqp_bell_ward_charm', 1], ['item_herbal_poultice', 2]];
  const flags = ['edda_rune_charm_granted', 'dlg_reward:edda_rune_guide'];
  const story = ['dlg_reward:edda_rune_guide'];
  const equipped = { body: null, feet: null, back: null, charm: null };
  const chest = [];

  migrateEddaRuneCharmV161(inv, flags, story, equipped, chest);

  assert.equal(countCharm(inv), 1, 'inventory vẫn 1 — không cấp thêm khi đã có');
  assert.ok(flags.includes('migrated_edda_rune_charm_v161'), 'cờ idempotency phải được gắn');
});

// ─── TC4: Save hợp lệ — charm đang đeo ở equippedSlots.charm → không cấp thêm vào túi ───
test('TC4: Charm đang đeo ở equippedSlots.charm → không cấp thêm vào túi', () => {
  const inv = [['res_dry_wood', 3]];
  const flags = ['edda_rune_charm_granted', 'dlg_reward:edda_rune_guide'];
  const story = ['edda_rune_charm_granted'];
  const equipped = { body: null, feet: null, back: null, charm: 'eqp_bell_ward_charm' };
  const chest = [];

  migrateEddaRuneCharmV161(inv, flags, story, equipped, chest);

  assert.equal(countCharm(inv), 0, 'inventory vẫn 0 — charm đang đeo, không cấp thêm vào túi');
  assert.ok(flags.includes('migrated_edda_rune_charm_v161'), 'cờ idempotency phải được gắn');
});

// ─── TC5: Save hợp lệ — charm cất trong storageChest → không cấp thêm vào túi ───
test('TC5: Charm cất trong storageChest → không cấp thêm vào túi', () => {
  const inv = [];
  const flags = ['dlg_reward:edda_rune_guide'];
  const story = ['edda_rune_charm_granted', 'dlg_reward:edda_rune_guide'];
  const equipped = { body: null, feet: null, back: null, charm: null };
  const chest = [['eqp_bell_ward_charm', 1], ['res_flint', 2]];

  migrateEddaRuneCharmV161(inv, flags, story, equipped, chest);

  assert.equal(countCharm(inv), 0, 'inventory vẫn 0 — charm đang ở rương, không cấp thêm');
  assert.ok(flags.includes('migrated_edda_rune_charm_v161'), 'cờ idempotency phải được gắn');
});

// ─── TC6: Save mới chưa gặp Edda (không có cờ) → 0 charm, không gắn gì ───
test('TC6: Save mới chưa gặp Edda → 0 charm, không migration', () => {
  const inv = [['item_lantern_oil', 100]];
  const flags = ['started_game'];
  const story = [];
  const equipped = { body: null, feet: null, back: null, charm: null };
  const chest = [];

  migrateEddaRuneCharmV161(inv, flags, story, equipped, chest);

  assert.equal(countCharm(inv), 0, 'inventory vẫn 0 — chưa gặp Edda');
  assert.ok(!flags.includes('migrated_edda_rune_charm_v161'), 'không gắn cờ migration khi chưa gặp Edda');
  assert.ok(!flags.includes('edda_rune_charm_granted'), 'không tự thêm edda_rune_charm_granted');
});

// ─── SUMMARY ───
console.log('');
console.log(`=== verify_b07_edda_save_migration: ${passed}/${passed + failed} PASS ===`);
process.exit(failed > 0 ? 1 : 0);
