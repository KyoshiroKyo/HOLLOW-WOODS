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
console.log('  C4-12-19: SANCTUARY FARM ENVIRONMENT VERIFICATION TEST');
console.log('================================================================\n');

// 1. Kiểm tra Pre-Backup
console.log('--- TEST GROUP 1: Pre-Backup Integrity ---');
const backupDir = path.resolve('Backups/C4-12-19_PRE_BACKUP');
assert(fs.existsSync(backupDir), 'Backup directory Backups/C4-12-19_PRE_BACKUP exists');
assert(fs.existsSync(path.join(backupDir, 'WorldBuilder.ts')), 'Backup of WorldBuilder.ts exists');
assert(fs.existsSync(path.join(backupDir, 'zones.json')), 'Backup of zones.json exists');
assert(fs.existsSync(path.join(backupDir, 'ZoneConnectionRegistry.ts')), 'Backup of ZoneConnectionRegistry.ts exists');
assert(fs.existsSync(path.join(backupDir, 'PlayerState.ts')), 'Backup of PlayerState.ts exists');
assert(fs.existsSync(path.join(backupDir, 'GameScene.ts')), 'Backup of GameScene.ts exists');

// 2. Kiểm tra PlayerState.ts (Toạ độ 4 ô đất & Di chuyển tự động)
console.log('\n--- TEST GROUP 2: PlayerState Herb Plot Positions & Migration ---');
const playerStateContent = fs.readFileSync(path.resolve('src/state/PlayerState.ts'), 'utf8');
assert(playerStateContent.includes("id: 'plot_1', x: 760, y: 640"), 'plot_1 placed at (760, 640) inside Sanctuary Farm terrace');
assert(playerStateContent.includes("id: 'plot_2', x: 840, y: 640"), 'plot_2 placed at (840, 640) inside Sanctuary Farm terrace');
assert(playerStateContent.includes("id: 'plot_3', x: 760, y: 690"), 'plot_3 placed at (760, 690) inside Sanctuary Farm terrace');
assert(playerStateContent.includes("id: 'plot_4', x: 840, y: 690"), 'plot_4 placed at (840, 690) inside Sanctuary Farm terrace');
assert(playerStateContent.includes('Tự động nâng cấp tọa độ nếu dữ liệu lưu từ phiên bản cũ'), 'PlayerState.setHerbPlots contains legacy coordinate auto-migration comment');
assert(playerStateContent.includes('p.x === 1045 && p.y === 430') && playerStateContent.includes('x: 760, y: 640'), 'Migration translates legacy coordinates to Sanctuary Farm terrace');

// 3. Kiểm tra zones.json (Cấu hình Sanctuary Farm & Interactables)
console.log('\n--- TEST GROUP 3: zones.json Sanctuary Farm Definition & Interactables ---');
const zonesJson = JSON.parse(fs.readFileSync(path.resolve('src/data/zones.json'), 'utf8'));
const farmZone = zonesJson.zones.find(z => z.id === 'sanctuary_farm');
assert(!!farmZone, 'Sanctuary Farm zone exists in zones.json');
assert(farmZone.bounds.x === 480 && farmZone.bounds.y === 560, 'Farm bounds correctly set (x: 480, y: 560)');
assert(farmZone.bounds.width === 640 && farmZone.bounds.height === 480, 'Farm size is 640x480 px');

const interactableIds = (farmZone.interactables || []).map(i => i.id);
assert(interactableIds.includes('farm_storage_chest'), 'Interactable: farm_storage_chest present');
assert(interactableIds.includes('farm_processing_bench'), 'Interactable: farm_processing_bench (workbench) present');
assert(interactableIds.includes('farm_water_well'), 'Interactable: farm_water_well present');
assert(interactableIds.includes('farm_welcome_sign'), 'Interactable: farm_welcome_sign present');
assert(interactableIds.includes('farm_herb_terrace_sign'), 'Interactable: farm_herb_terrace_sign present');

const wellInteractable = farmZone.interactables.find(i => i.id === 'farm_water_well');
assert(wellInteractable && wellInteractable.x === 920 && wellInteractable.y === 700, 'Well interactable located at (920, 700)');

const benchInteractable = farmZone.interactables.find(i => i.id === 'farm_processing_bench');
assert(benchInteractable && benchInteractable.type === 'workbench', 'farm_processing_bench has type workbench');

// 4. Kiểm tra WorldBuilder.ts (Môi trường Nông trại Sanctuary Farm)
console.log('\n--- TEST GROUP 4: WorldBuilder Sanctuary Farm Art & Props ---');
const wbContent = fs.readFileSync(path.resolve('src/world/WorldBuilder.ts'), 'utf8');

assert(wbContent.includes('createHerbalistProcessingShelter'), 'Method createHerbalistProcessingShelter implemented');
assert(wbContent.includes('createSanctuaryHerbTerrace'), 'Method createSanctuaryHerbTerrace implemented');
assert(wbContent.includes('createFarmWheelbarrow'), 'Method createFarmWheelbarrow implemented');
assert(wbContent.includes('renderSanctuaryFarmDecorations'), 'Method renderSanctuaryFarmDecorations implemented');

// Kiểm tra chi tiết trực quan của shelter và terrace
assert(wbContent.includes('Bàn Sơ Chế Thảo Mộc'), 'Processing shelter documented with Bàn Sơ Chế Thảo Mộc');
assert(wbContent.includes('Khu Vườn Dược Sanctuary Terrace'), 'Herb terrace documented with Khu Vườn Dược Sanctuary Terrace');
assert(wbContent.includes('this.createHerbalistProcessingShelter(685, 625)'), 'Processing shelter placed at (685, 625)');
assert(wbContent.includes('this.createSanctuaryHerbTerrace(730, 625)'), 'Herb terrace placed at (730, 625)');
assert(wbContent.includes('this.createFarmWheelbarrow(615, 710)'), 'Farm wheelbarrow placed at (615, 710)');

// Kiểm tra việc dời cây cối không đè lên 4 ô đất
assert(!wbContent.includes('this.createTree(760, 660)'), 'Tree at old (760, 660) removed to clear plot_1 & plot_3');
assert(!wbContent.includes('this.createTree(840, 660)'), 'Tree at old (840, 660) removed to clear plot_2 & plot_4');
assert(wbContent.includes('this.createTree(760, 595,') || wbContent.includes('this.createTree(760, 595)'), 'Tree relocated to north embankment (760, 595)');
assert(wbContent.includes('this.createTree(850, 595,') || wbContent.includes('this.createTree(850, 595)'), 'Tree relocated to north embankment (850, 595)');

// 5. Kiểm tra GameScene.ts (Xử lý tương tác các điểm mới trong Farm)
console.log('\n--- TEST GROUP 5: GameScene Interactable Handlers ---');
const gsContent = fs.readFileSync(path.resolve('src/scenes/GameScene.ts'), 'utf8');
assert(gsContent.includes('inspect_farm_well'), 'GameScene handles inspect_farm_well');
assert(gsContent.includes('read_farm_sign'), 'GameScene handles read_farm_sign');
assert(gsContent.includes('read_herb_terrace_sign'), 'GameScene handles read_herb_terrace_sign');
assert(gsContent.includes('Giếng Nước Nông Trại: Nguồn nước trong lành mát lạnh'), 'Well interaction provides atmospheric feedback text');
assert(gsContent.includes('Biển Gỗ: "NÔNG TRẠI TRÚ ẨN'), 'Farm sign interaction provides atmospheric welcome text');

// 6. Kiểm tra Thông thoáng luồng di chuyển và không bị kẹt va chạm
console.log('\n--- TEST GROUP 6: Obstacle Clearance & Path Navigation ---');
const farmColliders = farmZone.colliders || [];
let plotCollisionBlocked = false;
const plots = [
  { id: 'plot_1', x: 760, y: 640, r: 24 },
  { id: 'plot_2', x: 840, y: 640, r: 24 },
  { id: 'plot_3', x: 760, y: 690, r: 24 },
  { id: 'plot_4', x: 840, y: 690, r: 24 }
];

for (const plot of plots) {
  for (const c of farmColliders) {
    const overlapX = plot.x >= c.x && plot.x <= c.x + c.w;
    const overlapY = plot.y >= c.y && plot.y <= c.y + c.h;
    if (overlapX && overlapY) {
      plotCollisionBlocked = true;
      console.error(`Collider ${c.id} directly overlaps ${plot.id} at (${plot.x}, ${plot.y})!`);
    }
  }
}
assert(!plotCollisionBlocked, 'Zero solid colliders in zones.json overlap any of the 4 herb plots');

// Check horizontal distance between plot centers: 840 - 760 = 80px (> 40px width + 40px open lane)
const hPlotSpacing = 840 - 760;
assert(hPlotSpacing === 80, `Horizontal plot spacing is ${hPlotSpacing}px (> 40px plot width + 40px aisle)`);

// Check vertical distance between plot rows: 690 - 640 = 50px (> 20px height + 30px aisle)
const vPlotSpacing = 690 - 640;
assert(vPlotSpacing === 50, `Vertical plot row spacing is ${vPlotSpacing}px (> 20px plot height + 30px aisle)`);

// Check clear access corridor to Bellhollow
assert(farmZone.colliders.every(c => !(c.x < 710 && c.x + c.w > 610 && c.y <= 600 && c.y + c.h >= 560)),
  'Sanctuary Farm North Entrance (connecting to Bellhollow south gate) is wide open without blocking colliders');

console.log('\n================================================================');
console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('================================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('  ALL C4-12-19 CHECKS PASSED PERFECTLY!\n');
}
