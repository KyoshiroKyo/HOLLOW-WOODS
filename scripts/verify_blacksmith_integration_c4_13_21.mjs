import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

console.log('=== VERIFYING STEP C4-13-21: BLACKSMITH NPC INTEGRATION ===\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

// 1. Verify files exist on disk
const expectedFiles = [
  { p: 'public/assets/characters/villagers/blacksmith_sheet.png', w: 384, h: 64 },
  { p: 'public/assets/characters/villagers/npc_blacksmith.png', w: 64, h: 64 },
  { p: 'public/assets/characters/villagers/portrait_blacksmith.png', w: 64, h: 64 },
  { p: 'public/assets/characters/npcs/blacksmith_sheet.png', w: 384, h: 64 },
  { p: 'public/assets/characters/npcs/npc_blacksmith.png', w: 64, h: 64 },
  { p: 'public/assets/characters/npcs/portrait_blacksmith.png', w: 64, h: 64 }
];

for (const file of expectedFiles) {
  const fullPath = path.resolve(file.p);
  const exists = fs.existsSync(fullPath);
  assert(exists, `File exists: ${file.p}`);
  if (exists) {
    const buf = fs.readFileSync(fullPath);
    const png = PNG.sync.read(buf);
    assert(png.width === file.w && png.height === file.h, `Dimensions match ${file.w}x${file.h} for ${file.p}`);
    // Check transparency
    let hasTransparent = false;
    let hasOpaque = false;
    for (let i = 0; i < png.data.length; i += 4) {
      const a = png.data[i + 3];
      if (a === 0) hasTransparent = true;
      if (a > 200) hasOpaque = true;
    }
    assert(hasTransparent && hasOpaque, `File has transparent background and solid content: ${file.p}`);
  }
}

// 2. Verify Constants.ts
const constantsSrc = fs.readFileSync('src/config/Constants.ts', 'utf8');
assert(constantsSrc.includes("SPRITE_BLACKSMITH_SHEET = 'blacksmith_sheet'"), "Constants.ts defines SPRITE_BLACKSMITH_SHEET");
assert(constantsSrc.includes("SPRITE_NPC_BLACKSMITH = 'npc_blacksmith'"), "Constants.ts defines SPRITE_NPC_BLACKSMITH");
assert(constantsSrc.includes("PORTRAIT_BLACKSMITH = 'portrait_blacksmith'"), "Constants.ts defines PORTRAIT_BLACKSMITH");

// 3. Verify PreloadScene.ts
const preloadSrc = fs.readFileSync('src/scenes/PreloadScene.ts', 'utf8');
assert(preloadSrc.includes("PORTRAIT_BLACKSMITH"), "PreloadScene imports PORTRAIT_BLACKSMITH");
assert(preloadSrc.includes("SPRITE_BLACKSMITH_SHEET"), "PreloadScene imports SPRITE_BLACKSMITH_SHEET");
assert(preloadSrc.includes("assets/characters/villagers/blacksmith_sheet.png"), "PreloadScene loads blacksmith_sheet.png");
assert(preloadSrc.includes("assets/characters/villagers/portrait_blacksmith.png"), "PreloadScene loads portrait_blacksmith.png");
assert(preloadSrc.includes("assets/characters/villagers/npc_blacksmith.png"), "PreloadScene loads npc_blacksmith.png");

// 4. Verify NPCEntity.ts
const npcSrc = fs.readFileSync('src/entities/NPCEntity.ts', 'utf8');
assert(npcSrc.includes("initialSheet = scene.textures.exists('blacksmith_sheet')"), "NPCEntity maps Bram to blacksmith_sheet");
assert(npcSrc.includes("anim_blacksmith_work"), "NPCEntity registers anim_blacksmith_work");
assert(npcSrc.includes("npc_bram_work"), "NPCEntity registers npc_bram_work");
assert(npcSrc.includes("npc_bram_idle"), "NPCEntity registers npc_bram_idle");
assert(npcSrc.includes("icon = '🔨'"), "NPCEntity assigns hammer icon to Bram");

// 5. Verify GameScene.ts
const gameSceneSrc = fs.readFileSync('src/scenes/GameScene.ts', 'utf8');
assert(gameSceneSrc.includes("id: 'npc_bram'") && gameSceneSrc.includes("title: 'Thợ rèn làng'"), "GameScene defines Bram as Thợ rèn làng");
assert(gameSceneSrc.includes("x: 1045") && gameSceneSrc.includes("y: 365"), "GameScene positions Bram at (1045, 365)");

// 6. Verify zones.json
const zonesJson = JSON.parse(fs.readFileSync('src/data/zones.json', 'utf8'));
const zonesList = zonesJson.zones || [];
const bellhollow = zonesList.find(z => z.id === 'bellhollow');
assert(bellhollow !== undefined, "zones.json contains bellhollow zone");
const bramZone = bellhollow?.npcs?.find(i => i.id === 'npc_bram');
assert(bramZone !== undefined, "zones.json contains npc_bram in bellhollow npcs");
if (bramZone) {
  assert(bramZone.title === 'Thợ rèn làng', "zones.json sets Bram title to 'Thợ rèn làng'");
  assert(bramZone.x === 1045 && bramZone.y === 365, "zones.json positions Bram at x: 1045, y: 365");
}

// 7. Verify dialogues.json
const dialoguesData = JSON.parse(fs.readFileSync('src/data/dialogues.json', 'utf8'));
const dialoguesMap = dialoguesData.dialogues || dialoguesData;
const bramChat = dialoguesMap.bram_chat;
assert(bramChat !== undefined, "dialogues.json contains bram_chat");
if (bramChat) {
  assert(bramChat.speaker.includes('Thợ Rèn'), "dialogues.json speaker mentions Thợ Rèn");
  assert(bramChat.portrait === 'portrait_blacksmith', "dialogues.json portrait is portrait_blacksmith");
  assert(bramChat.lines.some(l => l.includes('lò rèn')), "dialogues.json lines mention forge (lò rèn)");
  assert(bramChat.lines.some(l => l.includes('Bàn Chế Tạo')), "dialogues.json lines guide Crafting Bench");
}

// 8. Verify UIScene.ts & DialogueSystem.ts
const uiSceneSrc = fs.readFileSync('src/scenes/UIScene.ts', 'utf8');
assert(uiSceneSrc.includes("portrait_blacksmith"), "UIScene supports portrait_blacksmith");
const dialogueSysSrc = fs.readFileSync('src/systems/DialogueSystem.ts', 'utf8');
assert(dialogueSysSrc.includes("portrait_blacksmith"), "DialogueSystem supports portrait_blacksmith");

console.log(`\n=== RESULT: ${passCount} PASSED, ${failCount} FAILED ===`);
if (failCount > 0) {
  process.exit(1);
} else {
  console.log('ALL VERIFICATION CHECKS PASSED PERFECTLY!');
}
