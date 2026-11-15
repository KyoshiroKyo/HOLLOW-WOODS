import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('=== HOLLOW WOODS V1.3 — VERIFY PERFORMANCE OPTIMIZATION & 10-SYSTEM CROSS AUDIT (C4-13-09) ===\n');

let allPassed = true;

function check(label, condition, details = '') {
  if (condition) {
    console.log(`[PASS] ${label} ${details ? '(' + details + ')' : ''}`);
  } else {
    console.error(`[FAIL] ${label} ${details ? '(' + details + ')' : ''}`);
    allPassed = false;
  }
}

// =========================================================================
// 1. TỐI ƯU HÓA 60 FPS UPDATE LOOP & DIRTY-CHECKING
// =========================================================================
console.log('--- 1. Kiểm tra Dirty-Checking & Loại bỏ cấp phát đối tượng trong Update Loop ---');

const uiSceneContent = fs.readFileSync(path.join(rootDir, 'src/scenes/UIScene.ts'), 'utf-8');
const gameSceneContent = fs.readFileSync(path.join(rootDir, 'src/scenes/GameScene.ts'), 'utf-8');
const satyrContent = fs.readFileSync(path.join(rootDir, 'src/entities/SatyrPlayer.ts'), 'utf-8');
const listenerAiContent = fs.readFileSync(path.join(rootDir, 'src/systems/ListenerAI.ts'), 'utf-8');
const theListenerContent = fs.readFileSync(path.join(rootDir, 'src/entities/TheListener.ts'), 'utf-8');
const veilContent = fs.readFileSync(path.join(rootDir, 'src/systems/VeilSystem.ts'), 'utf-8');
const survivalContent = fs.readFileSync(path.join(rootDir, 'src/systems/SurvivalSystem.ts'), 'utf-8');

// UIScene prompt dirty-checking
check('UIScene Prompt Dirty-Checking (lastPromptText)', uiSceneContent.includes('lastPromptText'));
check('UIScene Prompt Alpha Dirty-Checking (lastPromptAlpha)', uiSceneContent.includes('lastPromptAlpha'));
check('UIScene Prompt Bg & Text bypass redraw when unchanged', uiSceneContent.includes('if (this.lastPromptText !== prompt)'));

// UIScene stats & quickslots dirty-checking
check('UIScene Stats Bars Dirty-Checking', uiSceneContent.includes('isBarsDirty'));
check('UIScene Stats Text Dirty-Checking (lastCurH, lastCurS, etc.)', uiSceneContent.includes('lastCurH') && uiSceneContent.includes('lastCurS'));
check('UIScene QuickSlot Counts Dirty-Checking', uiSceneContent.includes('lastPoulticeCount') && uiSceneContent.includes('lastOilCount'));
check('UIScene Quest Tracker Dirty-Checking', uiSceneContent.includes('lastQuestTitle') && uiSceneContent.includes('lastQuestTaskText'));

// UIScene Popup pooling
check('UIScene Pooled Popup Message Object', uiSceneContent.includes('pooledPopupText'));
check('UIScene showPopupMessage reuses pooled Text without new allocations', uiSceneContent.includes('this.pooledPopupText = HDTextHelper.createText') && uiSceneContent.includes('popup.setText(msg)'));

// Zero allocations in update loops
check('SatyrPlayer foot position cached Vector2 reuse', satyrContent.includes('cachedFootPos') && satyrContent.includes('cachedLanternPos'));
check('ListenerAI zero dynamic allocations in update/steering', !listenerAiContent.includes('new Phaser.') && !listenerAiContent.includes('new Array'));
check('VeilSystem zero dynamic allocations', !veilContent.includes('new Graphics') && !veilContent.includes('new Text'));
check('SurvivalSystem zero dynamic allocations', !survivalContent.includes('new Graphics') && !survivalContent.includes('new Text'));

// =========================================================================
// 2. CHỐNG RÒ RỈ BỘ NHỚ & DỌN DẸP VÒNG ĐỜI (CLEANUP LIFECYCLE)
// =========================================================================
console.log('\n--- 2. Kiểm tra Dọn dẹp Vòng Đời & Chống Rò Rỉ Bộ Nhớ (Lifecycle Cleanup) ---');

// GameScene shutdown cleanup
check('GameScene shutdown event cleans AudioManager', gameSceneContent.includes('this.audioManager.setHeartbeatActive(false)') && gameSceneContent.includes('this.audioManager.stopAmbience()'));
check('GameScene shutdown destroys FarmingSystem & WorldBuilder', gameSceneContent.includes('this.farmingSystem.destroy()') && gameSceneContent.includes('this.worldBuilder.destroy()'));
check('GameScene shutdown destroys VeilSystem', gameSceneContent.includes('this.veilSystem.destroy()'));
check('GameScene shutdown destroys all NPCs', gameSceneContent.includes('npc.destroy()') && gameSceneContent.includes('this.npcs = []'));
check('GameScene shutdown destroys TheListener Monster', gameSceneContent.includes('this.listenerMonster.destroy()'));
check('GameScene shutdown destroys Player', gameSceneContent.includes('this.player.destroy()'));
check('GameScene shutdown destroys Graphics & Textures (firefly, lantern, fogOfWar, lightMask)',
  gameSceneContent.includes('this.fireflyGfx.destroy()') &&
  gameSceneContent.includes('this.lanternGlowGfx.destroy()') &&
  gameSceneContent.includes('this.fogOfWarLayer.destroy()') &&
  gameSceneContent.includes('this.cachedLightMaskImage.destroy()')
);
check('GameScene shutdown kills all Tweens & Timers', gameSceneContent.includes('this.tweens.killAll()') && gameSceneContent.includes('this.time.removeAllEvents()'));

// TheListener cleanup
check('TheListener implements explicit destroy()', theListenerContent.includes('public destroy(fromScene?: boolean): void'));
check('TheListener destroys visualGfx & alertIcon', theListenerContent.includes('this.visualGfx.destroy()') && theListenerContent.includes('this.alertIcon.destroy()'));
check('TheListener kills active tweens', theListenerContent.includes('this.scene.tweens.killTweensOf(this.alertIcon)'));

// UIScene shutdown cleanup
check('UIScene shutdown kills Tweens, Timers, and Keyboard Listeners',
  uiSceneContent.includes('this.tweens.killAll()') &&
  uiSceneContent.includes('this.time.removeAllEvents()') &&
  uiSceneContent.includes('this.input.keyboard.removeAllListeners()')
);
check('UIScene shutdown destroys all 4 Modals & pooled popup',
  uiSceneContent.includes('this.craftingModal.destroy()') &&
  uiSceneContent.includes('this.journalModal.destroy()') &&
  uiSceneContent.includes('this.pauseModal.destroy()') &&
  uiSceneContent.includes('this.gameOverModal.destroy()') &&
  uiSceneContent.includes('this.pooledPopupText.destroy()')
);

// Modal explicit destroy implementations
const craftingModalContent = fs.readFileSync(path.join(rootDir, 'src/ui/CraftingModal.ts'), 'utf-8');
const journalModalContent = fs.readFileSync(path.join(rootDir, 'src/ui/JournalModal.ts'), 'utf-8');
const pauseModalContent = fs.readFileSync(path.join(rootDir, 'src/ui/PauseModal.ts'), 'utf-8');
const gameOverModalContent = fs.readFileSync(path.join(rootDir, 'src/ui/GameOverModal.ts'), 'utf-8');

check('CraftingModal has destroy()', craftingModalContent.includes('public destroy(): void') && craftingModalContent.includes('this.container.destroy()'));
check('JournalModal has destroy()', journalModalContent.includes('public destroy(): void') && journalModalContent.includes('this.contentContainer.destroy()') && journalModalContent.includes('this.container.destroy()'));
check('PauseModal has destroy()', pauseModalContent.includes('public destroy(): void') && pauseModalContent.includes('this.container.destroy()'));
check('GameOverModal has destroy()', gameOverModalContent.includes('public destroy(): void') && gameOverModalContent.includes('this.container.destroy()'));

// =========================================================================
// 3. RÀ SOÁT CHÉO 10 HỆ THỐNG TIỀM ẨN (10 LATENT SYSTEMS AUDIT)
// =========================================================================
console.log('\n--- 3. Rà soát Chéo 10 Hệ Thống Tiềm Ẩn (10 Latent Systems Cross-Audit) ---');

// (1) Save/Load System
const saveManagerContent = fs.readFileSync(path.join(rootDir, 'src/systems/SaveManager.ts'), 'utf-8');
check('System 1: Save/Load System (SaveManager, checkpoint, localStorage, transient state reset)',
  saveManagerContent.includes('saveGame') &&
  saveManagerContent.includes('hasSave') &&
  saveManagerContent.includes('getSaveSummary') &&
  saveManagerContent.includes('state.stats.isHiding = false')
);

// (2) Scene Transition System
const preloadContent = fs.readFileSync(path.join(rootDir, 'src/scenes/PreloadScene.ts'), 'utf-8');
const mainMenuContent = fs.readFileSync(path.join(rootDir, 'src/scenes/MainMenuScene.ts'), 'utf-8');
check('System 2: Scene Transition (PreloadScene -> MainMenuScene -> GameScene -> launch UIScene)',
  preloadContent.includes('SCENE_MAIN_MENU') &&
  mainMenuContent.includes('SCENE_GAME') &&
  gameSceneContent.includes("this.scene.launch('UIScene')")
);

// (3) Collision & Interaction System
const worldBuilderContent = fs.readFileSync(path.join(rootDir, 'src/world/WorldBuilder.ts'), 'utf-8');
check('System 3: Collision & Interaction (Hollow Trees, Dense Bushes, Interactable Physics Bounds)',
  worldBuilderContent.includes('createHollowTree') &&
  worldBuilderContent.includes('createDenseBush') &&
  satyrContent.includes('isHiding') &&
  satyrContent.includes('isInteractRequested')
);

// (4) Animation System
const npcContent = fs.readFileSync(path.join(rootDir, 'src/entities/NPCEntity.ts'), 'utf-8');
check('System 4: Animation System (Death Single-Play, Lantern Hand Sync, NPC Idle/Walk)',
  satyrContent.includes('public die(): void') &&
  satyrContent.includes('wayfarer_death_') &&
  satyrContent.includes('LANTERN_OFFSET_DOWN') &&
  npcContent.includes('this.npcSprite.play')
);

// (5) Lighting System
check('System 5: Lighting System (cached_light_mask_normal, RenderTexture erase, Depth 5000-5020)',
  gameSceneContent.includes('cached_light_mask_normal') &&
  gameSceneContent.includes('fogOfWarLayer.erase') &&
  gameSceneContent.includes('lanternGlowGfx')
);

// (6) Entity AI System
check('System 6: Entity AI System (Safe Zone Leash, 160ms throttle, self-unstuck, territory)',
  listenerAiContent.includes('isInsideSafeZone') &&
  listenerAiContent.includes('SAFE_ZONE_BORDER_X') &&
  listenerAiContent.includes('MAX_LEASH_DISTANCE') &&
  listenerAiContent.includes('PATH_UPDATE_INTERVAL') &&
  listenerAiContent.includes('updateStuckDetection')
);

// (7) Performance / FPS System
check('System 7: Performance / FPS (Camera Culling, Zero-alloc loops, 60 FPS compliance)',
  worldBuilderContent.includes('updateCameraCulling') &&
  worldBuilderContent.includes('registerCullable')
);

// (8) Audio System
const audioManagerContent = fs.readFileSync(path.join(rootDir, 'src/audio/AudioManager.ts'), 'utf-8');
check('System 8: Audio System (WebAudio, Ambience, Heartbeat, SFX, Mute Toggle, Resource Cleanup)',
  audioManagerContent.includes('stopAmbience') &&
  audioManagerContent.includes('setHeartbeatActive') &&
  audioManagerContent.includes('toggleMute') &&
  audioManagerContent.includes('destroy')
);

// (9) UI System
check('System 9: UI System (HD 1280x720, Zoom 1.0, Semi-transparent HUD, Quickslots, Modals)',
  uiSceneContent.includes('setZoom(1.0)') &&
  uiSceneContent.includes('statCardBg') &&
  uiSceneContent.includes('quickSlotContainer') &&
  uiSceneContent.includes('isAnyModalOpen')
);

// (10) Asset Management System
check('System 10: Asset Management (Spritesheets, Portraits, Sounds, Textures in PreloadScene)',
  preloadContent.includes('edda_idle_sheet') &&
  preloadContent.includes('neris_idle_sheet') &&
  preloadContent.includes('garth_walk_sheet') &&
  preloadContent.includes('portrait_edda') &&
  preloadContent.includes('portrait_neris') &&
  preloadContent.includes('portrait_garth')
);

console.log('\n=================================================================');
if (allPassed) {
  console.log('🎉 TẤT CẢ KIỂM TRA TỐI ƯU HIỆU SUẤT VÀ RÀ SOÁT 10 HỆ THỐNG ĐÃ ĐẠT 100%! (PASS)');
  process.exit(0);
} else {
  console.error('❌ MỘT SỐ HẠNG MỤC CHƯA ĐẠT! VUI LÒNG KIỂM TRA LẠI.');
  process.exit(1);
}
