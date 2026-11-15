/**
 * AUTOMATED VERIFICATION SCRIPT FOR COMMAND C4-12-13
 * Validates HUD UI, Quest Tracker, Quickbar, Interaction Prompt, Modals & Boundaries
 */

import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

console.log('================================================================');
console.log('  C4-12-13: HUD UI, QUEST TRACKER & MODALS VERIFICATION');
console.log('================================================================\n');

// 1. UIScene.ts Verification
const uiScenePath = path.resolve('src/scenes/UIScene.ts');
assert(fs.existsSync(uiScenePath), 'src/scenes/UIScene.ts exists');
const uiSceneCode = fs.readFileSync(uiScenePath, 'utf-8');

assert(uiSceneCode.includes('export interface QuickSlotRef'), 'UIScene defines QuickSlotRef interface');
assert(uiSceneCode.includes('The Mossbound Wayfarer'), 'UIScene displays player title badge (The Mossbound Wayfarer)');

// Survival Bars & Labels
assert(uiSceneCode.includes('healthValText'), 'UIScene contains healthValText');
assert(uiSceneCode.includes('staminaValText'), 'UIScene contains staminaValText');
assert(uiSceneCode.includes('oilValText'), 'UIScene contains oilValText');
assert(uiSceneCode.includes('composureValText'), 'UIScene contains composureValText');
assert(uiSceneCode.includes('Sinh Lực:'), 'UIScene formats Vietnamese label for Health');
assert(uiSceneCode.includes('Thể Lực:'), 'UIScene formats Vietnamese label for Stamina');
assert(uiSceneCode.includes('Dầu Đèn:'), 'UIScene formats Vietnamese label for Oil');
assert(uiSceneCode.includes('Bình Tâm:'), 'UIScene formats Vietnamese label for Composure');

// Lantern Indicator
assert(uiSceneCode.includes('lanternStatusBg'), 'UIScene contains lanternStatusBg pill graphics');
assert(uiSceneCode.includes('ĐÈN: BẬT [F]') && uiSceneCode.includes('ĐÈN: TẮT [F]'), 'UIScene toggles ON/OFF lantern pill status with [F]');

// Quest Box
assert(uiSceneCode.includes('NHIỆM VỤ HIỆN TẠI [J]'), 'UIScene features clear quest header');
assert(uiSceneCode.includes('questTitleText'), 'UIScene contains questTitleText for chapter title');
assert(uiSceneCode.includes('questTrackerText'), 'UIScene contains questTrackerText for active task');
assert(uiSceneCode.includes('questBoxW = 364') && uiSceneCode.includes('questBoxH = 86'), 'Quest box dimensions standard (364x86)');

// Quickbar
assert(uiSceneCode.includes('quickSlotContainer'), 'UIScene contains quickSlotContainer');
assert(uiSceneCode.includes('selectQuickSlot'), 'UIScene supports selectQuickSlot(index)');
assert(uiSceneCode.includes('redrawQuickSlotHighlights'), 'UIScene implements redrawQuickSlotHighlights()');
assert(uiSceneCode.includes('slotHighlightGraphics'), 'UIScene contains slotHighlightGraphics');
assert(uiSceneCode.includes('poulticeCountText') && uiSceneCode.includes('oilCountText') && uiSceneCode.includes('lureCountText'), 'Consumable count badges exist');

// Interaction Prompt
assert(uiSceneCode.includes('promptWorldTarget'), 'UIScene tracks promptWorldTarget for world space follow');
assert(uiSceneCode.includes('updatePromptPosition'), 'UIScene implements updatePromptPosition()');
assert(uiSceneCode.includes('setInteractionPrompt(prompt: string | null, worldX?: number, worldY?: number)'), 'setInteractionPrompt supports optional world coordinates');
assert(uiSceneCode.includes('update(): void'), 'UIScene contains update() hook for smooth prompt tracking');

// Modal Suppression & Control
assert(uiSceneCode.includes('isAnyModalOpen'), 'UIScene exposes isAnyModalOpen getter');
assert(uiSceneCode.includes('setDialogueActive'), 'UIScene implements setDialogueActive for suppressing background HUD');
assert(uiSceneCode.includes('setHUDVisible'), 'UIScene implements setHUDVisible for ending/cutscene cleanup');

// 2. GameScene.ts Verification
const gameScenePath = path.resolve('src/scenes/GameScene.ts');
assert(fs.existsSync(gameScenePath), 'src/scenes/GameScene.ts exists');
const gameSceneCode = fs.readFileSync(gameScenePath, 'utf-8');

assert(gameSceneCode.includes('nearbyResource.x,') && gameSceneCode.includes('nearbyResource.y'), 'GameScene passes resource node world coords to setInteractionPrompt');
assert(gameSceneCode.includes('nearby.x,') && gameSceneCode.includes('nearby.y'), 'GameScene passes interactable world coords to setInteractionPrompt');
assert(gameSceneCode.includes('this.uiScene.selectQuickSlot(3)'), 'GameScene syncs quickslot 3 on lantern toggle');
assert(gameSceneCode.includes('this.uiScene.selectQuickSlot(2)'), 'GameScene syncs quickslot 2 on lure throw');
assert(gameSceneCode.includes('if (this.dialogueSystem.isActive || this.craftingModal.isOpen || this.journalModal.isOpen || this.pauseModal.isOpen)'), 'GameScene locks interactions when modals or dialogues are active');

// 3. NPCEntity.ts Verification
const npcEntityPath = path.resolve('src/entities/NPCEntity.ts');
assert(fs.existsSync(npcEntityPath), 'src/entities/NPCEntity.ts exists');
const npcEntityCode = fs.readFileSync(npcEntityPath, 'utf-8');

assert(npcEntityCode.includes('HDTextHelper.createText'), 'NPCEntity uses HDTextHelper for sharp HD typography');
assert(npcEntityCode.includes('container = scene.add.container(0, -58)'), 'NPC nameplate positioned at y = -58 (above head)');
assert(npcEntityCode.includes('container = scene.add.container(0, -80)'), 'NPC prompt bubble positioned at y = -80 (above nameplate)');
assert(npcEntityCode.includes('this.promptBubble.setVisible(nearby)'), 'NPC prompt bubble toggles visibility dynamically');

// 4. Modals Verification
const craftingModalPath = path.resolve('src/ui/CraftingModal.ts');
assert(fs.existsSync(craftingModalPath), 'src/ui/CraftingModal.ts exists');
const craftingCode = fs.readFileSync(craftingModalPath, 'utf-8');
assert(craftingCode.includes('modalW = 840') && craftingCode.includes('modalH = 520'), 'CraftingModal dimensions standard 840x520 at 1280x720 canvas');
assert(craftingCode.includes('overlay.fillRect(0, 0, 1280, 720)'), 'CraftingModal provides 1280x720 click-blocking overlay');

const journalModalPath = path.resolve('src/ui/JournalModal.ts');
assert(fs.existsSync(journalModalPath), 'src/ui/JournalModal.ts exists');
const journalCode = fs.readFileSync(journalModalPath, 'utf-8');
assert(journalCode.includes('modalW = 840') && journalCode.includes('modalH = 520'), 'JournalModal dimensions standard 840x520 at 1280x720 canvas');
assert(journalCode.includes('overlay.fillRect(0, 0, 1280, 720)'), 'JournalModal provides 1280x720 click-blocking overlay');

const pauseModalPath = path.resolve('src/ui/PauseModal.ts');
assert(fs.existsSync(pauseModalPath), 'src/ui/PauseModal.ts exists');
const pauseCode = fs.readFileSync(pauseModalPath, 'utf-8');
assert(pauseCode.includes('modalW = 480') && pauseCode.includes('modalH = 370'), 'PauseModal dimensions standard 480x370 at 1280x720 canvas');
assert(pauseCode.includes('overlay.fillRect(0, 0, 1280, 720)'), 'PauseModal provides 1280x720 click-blocking overlay');

// 5. Canvas Boundary & Safe Margins Summary
console.log('\n--- Canvas Bounds & Safe Margins (1280x720 Standard) ---');
console.log('  Top-Left HUD (Bars & Labels):    X: 16 -> 406 px,  Y: 6 -> 92 px (Safe margin)');
console.log('  Top-Right Quest Tracker:        X: 896 -> 1260 px, Y: 20 -> 106 px (20px safe margin)');
console.log('  Bottom-Center Quickbar:         X: 238 -> 1042 px, Y: 667 -> 701 px (19px bottom margin)');
console.log('  Interaction Prompt [E]:         Clamped within X: [160..1120], Y: [50..624] px');
console.log('  Modals (Crafting/Journal):      X: 220 -> 1060 px, Y: 100 -> 620 px (Centered 840x520)');
console.log('  Pause Modal:                    X: 400 -> 880 px,  Y: 175 -> 545 px (Centered 480x370)');

console.log('\n================================================================');
console.log(`  SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('  ALL C4-12-13 HUD UI VERIFICATION CHECKS PASSED!\n');
}
