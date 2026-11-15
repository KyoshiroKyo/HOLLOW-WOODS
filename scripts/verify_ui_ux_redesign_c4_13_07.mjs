/**
 * Verification Script for Milestone C4-13-07:
 * Redesign Main Menu, In-game HUD, and Semi-transparent Interaction Label System
 */

import fs from 'fs';
import path from 'path';

let passCount = 0;
let failCount = 0;

function assert(condition, description) {
  if (condition) {
    console.log(`[PASS] ${description}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${description}`);
    failCount++;
  }
}

console.log('================================================================');
console.log('VERIFYING MILESTONE C4-13-07: UI / UX & VISUAL REDESIGN');
console.log('================================================================\n');

// 1. Check UIScene.ts
const uiScenePath = path.resolve('src/scenes/UIScene.ts');
const uiSceneContent = fs.readFileSync(uiScenePath, 'utf-8');

assert(uiSceneContent.includes('private statCardBg!: Phaser.GameObjects.Graphics;'), 'UIScene has statCardBg property');
assert(uiSceneContent.includes('private promptContainer!: Phaser.GameObjects.Container;'), 'UIScene has promptContainer property');
assert(uiSceneContent.includes('private promptBg!: Phaser.GameObjects.Graphics;'), 'UIScene has promptBg property');
assert(!uiSceneContent.includes("backgroundColor: '#0c1017f2'"), 'UIScene removed solid black backgroundColor (#0c1017f2) from prompt');
assert(uiSceneContent.includes('setInteractionPrompt(prompt: string | null, worldX?: number, worldY?: number, proximityAlpha: number = 1.0)'), 'setInteractionPrompt supports proximityAlpha parameter');
assert(uiSceneContent.includes('this.promptContainer.setAlpha(clampedAlpha)'), 'setInteractionPrompt applies clampedAlpha to promptContainer');
assert(uiSceneContent.includes('this.statCardBg.fillRoundedRect(12, 8, 308, 92, 6)'), 'statCardBg renders compact semi-transparent backing');
assert(uiSceneContent.includes('this.questBg.fillRoundedRect(questBoxX, questBoxY, questBoxW, questBoxH, 6)'), 'questBg renders semi-transparent quest card');
assert(uiSceneContent.includes('this.setHUDVisible(false)') && uiSceneContent.includes('handleModalOpened'), 'handleModalOpened hides all HUD elements');
assert(uiSceneContent.includes('this.setHUDVisible(true)') && uiSceneContent.includes('handleModalClosed'), 'handleModalClosed unhides HUD elements when modals are closed');
assert(uiSceneContent.includes('if (this.statCardBg) this.statCardBg.setVisible(visible)'), 'setHUDVisible controls statCardBg visibility');
assert(uiSceneContent.includes('if (this.promptContainer) this.promptContainer.setVisible(visible)'), 'setHUDVisible controls promptContainer visibility');

// 2. Check NPCEntity.ts
const npcEntityPath = path.resolve('src/entities/NPCEntity.ts');
const npcEntityContent = fs.readFileSync(npcEntityPath, 'utf-8');

assert(npcEntityContent.includes('bubbleBg.fillStyle(0x090e15, 0.70)'), 'NPCEntity prompt bubble uses semi-transparent dark backing (alpha 0.70)');
assert(npcEntityContent.includes('bubbleBg.lineStyle(1, 0xd4af37, 0.75)'), 'NPCEntity prompt bubble uses thin golden border');
assert(npcEntityContent.includes('setNearby(nearby: boolean, playerX?: number, playerY?: number, distance?: number)'), 'NPCEntity setNearby supports distance parameter');
assert(npcEntityContent.includes('proximityAlpha = 0.45'), 'NPCEntity setNearby implements subtle hint opacity for distance > 38px');
assert(npcEntityContent.includes('this.promptBubble.setAlpha(proximityAlpha)'), 'NPCEntity setNearby applies proximityAlpha to promptBubble');

// 3. Check WorldBuilder.ts
const wbPath = path.resolve('src/world/WorldBuilder.ts');
const wbContent = fs.readFileSync(wbPath, 'utf-8');

assert(wbContent.includes('checkInteractableProximity(pos: Point2D, maxRadius: number = 65)'), 'WorldBuilder has checkInteractableProximity method');
assert(wbContent.includes('return { item: closestItem, dist: Math.sqrt(closestDistSq) };'), 'checkInteractableProximity returns item and Euclidean distance');

// 4. Check GameScene.ts
const gameScenePath = path.resolve('src/scenes/GameScene.ts');
const gameSceneContent = fs.readFileSync(gameScenePath, 'utf-8');

assert(gameSceneContent.includes('const isNear = dist <= 65;'), 'GameScene detects NPC proximity within 65px hint radius');
assert(gameSceneContent.includes('proximityAlpha = isWithinInteractRange ? 1.0 : 0.45;'), 'GameScene applies proximity alpha to NPC interaction prompt');
assert(gameSceneContent.includes('inventorySystem.getNearbyAvailableNode') && gameSceneContent.includes('isWithinHarvestRange ? 1.0 : 0.45'), 'GameScene applies proximity alpha to resource node prompt');
assert(gameSceneContent.includes('worldBuilder.checkInteractableProximity(this.player.getFootPosition(), 65)'), 'GameScene queries interactable proximity at 65px radius');
assert(gameSceneContent.includes('this.pauseModal.onOpen = () => {') && gameSceneContent.includes('this.uiScene.handleModalOpened()'), 'pauseModal.onOpen connects to handleModalOpened');
assert(gameSceneContent.includes('this.pauseModal.onClose = () => {') && gameSceneContent.includes('this.uiScene.handleModalClosed()'), 'pauseModal.onClose connects to handleModalClosed');
assert(gameSceneContent.includes('this.gameOverModal.onOpen = () => {') && gameSceneContent.includes('this.uiScene.handleModalOpened()'), 'gameOverModal.onOpen connects to handleModalOpened');
assert(gameSceneContent.includes('this.gameOverModal.onClose = () => {') && gameSceneContent.includes('this.uiScene.handleModalClosed()'), 'gameOverModal.onClose connects to handleModalClosed');

// 5. Check MainMenuScene.ts
const mainMenuPath = path.resolve('src/scenes/MainMenuScene.ts');
const mainMenuContent = fs.readFileSync(mainMenuPath, 'utf-8');

assert(mainMenuContent.includes('BƯỚC VÀO MÀN SƯƠNG (BẮT ĐẦU MỚI)'), 'MainMenu has Bắt Đầu Mới button');
assert(mainMenuContent.includes('TIẾP TỤC HÀNH TRÌNH') && mainMenuContent.includes('TIẾP TỤC (CHƯA CÓ BẢN LƯU)'), 'MainMenu has Tiếp Tục button with save data check');
assert(mainMenuContent.includes('⚙ CÀI ĐẶT TRÒ CHƠI') && mainMenuContent.includes('showSettingsModal()'), 'MainMenu has Cài Đặt button and modal');
assert(mainMenuContent.includes('ℹ THÔNG TIN & CỐT TRUYỆN') && mainMenuContent.includes('showCreditsModal()'), 'MainMenu has Thông Tin button and modal');
assert(mainMenuContent.includes('fogBack') && mainMenuContent.includes('fogFront'), 'MainMenu implements 2 drifting fog layers');
assert(mainMenuContent.includes('lanternGlow.fillStyle(0xf39c12, 0.12)') && mainMenuContent.includes('lanternGlow.fillStyle(0xfff5d7, 0.48)'), 'MainMenu implements multi-tier warm lantern glow');
assert(mainMenuContent.includes('V1.3 (Visual Direction A + Hybrid Open World)'), 'MainMenu displays V1.3 version');

console.log('\n================================================================');
console.log(`TOTAL CHECKS: ${passCount + failCount}`);
console.log(`PASSED: ${passCount}`);
console.log(`FAILED: ${failCount}`);
console.log('================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('\n>>> ALL C4-13-07 UI/UX & VISUAL REDESIGN CHECKS PASSED SUCCESSFULLY! <<<');
}
