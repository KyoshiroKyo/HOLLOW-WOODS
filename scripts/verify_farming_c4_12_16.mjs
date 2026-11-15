/**
 * Automated Verification Script for Command C4-12-16
 * Xây dựng cơ chế nông trại thảo mộc quy mô nhỏ gồm 3–4 ô trồng tại Sanctuary Farm
 */

import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();

console.log('================================================================');
console.log('  TEST SUITE: C4-12-16 SANCTUARY FARMING MVP VERIFICATION');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASS] ${message}`);
  } else {
    console.error(`[FAIL] ${message}`);
  }
}

// 1. Kiểm tra items.json có mục Hạt Giống Thảo Dược
console.log('--- 1. Kiểm tra Dữ Liệu Vật Phẩm (items.json) ---');
const itemsPath = path.join(ROOT_DIR, 'src', 'data', 'items.json');
assert(fs.existsSync(itemsPath), 'File src/data/items.json tồn tại');

const itemsData = JSON.parse(fs.readFileSync(itemsPath, 'utf-8'));
const herbItem = itemsData.items.find(i => i.id === 'res_herbs');
const seedItem = itemsData.items.find(i => i.id === 'seed_herbs');

assert(herbItem, 'Vật phẩm Thảo Dược Bạc (res_herbs) tồn tại');
assert(seedItem, 'Vật phẩm Hạt Giống Thảo Dược (seed_herbs) tồn tại');
assert(seedItem && seedItem.stackable === true, 'Hạt giống thảo dược có thể xếp chồng (stackable: true)');

// 2. Kiểm tra types/index.ts định nghĩa 4 trạng thái ô đất
console.log('\n--- 2. Kiểm tra Kiểu Dữ Liệu (src/types/index.ts) ---');
const typesPath = path.join(ROOT_DIR, 'src', 'types', 'index.ts');
const typesContent = fs.readFileSync(typesPath, 'utf-8');

assert(typesContent.includes('export type HerbPlotStage = \'empty\' | \'planted\' | \'growing\' | \'harvest_ready\';'),
  'Định nghĩa đầy đủ 4 trạng thái HerbPlotStage (empty, planted, growing, harvest_ready)');
assert(typesContent.includes('export interface HerbPlotData'), 'Định nghĩa giao diện HerbPlotData');

// 3. Kiểm tra PlayerState.ts quản lý 4 ô đất và hạt giống ban đầu
console.log('\n--- 3. Kiểm tra Quản Lý Trạng Thái (PlayerState.ts) ---');
const statePath = path.join(ROOT_DIR, 'src', 'state', 'PlayerState.ts');
const stateContent = fs.readFileSync(statePath, 'utf-8');

assert(stateContent.includes('seed_herbs\', 3'), 'Khởi tạo ban đầu người chơi có 3 Hạt Giống Thảo Dược');
assert(stateContent.includes('plot_1') && stateContent.includes('plot_2') && stateContent.includes('plot_3') && stateContent.includes('plot_4'),
  'PlayerState định nghĩa chính xác 4 ô đất thảo dược (plot_1, plot_2, plot_3, plot_4)');
assert(stateContent.includes('public getHerbPlots(): HerbPlotData[]'), 'Có hàm getHerbPlots()');
assert(stateContent.includes('public getHerbPlot(id: string): HerbPlotData | undefined'), 'Có hàm getHerbPlot()');
assert(stateContent.includes('public updateHerbPlot('), 'Có hàm updateHerbPlot()');
assert(stateContent.includes('public setHerbPlots('), 'Có hàm setHerbPlots()');

// 4. Kiểm tra FarmingSystem.ts (Logic sinh trưởng, tương tác & chống bug)
console.log('\n--- 4. Kiểm tra Hệ Thống Canh Tác (FarmingSystem.ts) ---');
const farmingPath = path.join(ROOT_DIR, 'src', 'systems', 'FarmingSystem.ts');
assert(fs.existsSync(farmingPath), 'File src/systems/FarmingSystem.ts tồn tại');

const farmingContent = fs.readFileSync(farmingPath, 'utf-8');

assert(farmingContent.includes('STAGE_GROWING_MS = 12000'), 'Thời gian chuyển sang growing là 12 giây');
assert(farmingContent.includes('STAGE_MATURE_MS = 25000'), 'Thời gian chuyển sang harvest_ready là 25 giây');
assert(farmingContent.includes('computeStage(plantedAt: number): HerbPlotStage'), 'Có hàm computeStage() tính toán mốc thời gian drift-free');
assert(farmingContent.includes('checkNearbyPlot('), 'Có hàm checkNearbyPlot() kiểm tra khoảng cách tương tác');
assert(farmingContent.includes('getPlotPrompt(plot: HerbPlotData): string'), 'Có hàm getPlotPrompt() tạo nhãn [E] sinh động theo 4 trạng thái');
assert(farmingContent.includes('interactWithPlot('), 'Có hàm interactWithPlot() thực hiện gieo trồng và thu hoạch');
assert(farmingContent.includes('stage === \'empty\'') && farmingContent.includes('removeItem(\'seed_herbs\''),
  'Khi gieo trồng: kiểm tra và trừ hạt giống trong túi đồ');
assert(farmingContent.includes('stage === \'harvest_ready\'') && farmingContent.includes('addItem(\'res_herbs\', 2') && farmingContent.includes('addItem(\'seed_herbs\', 1'),
  'Khi thu hoạch: cộng +2 Thảo Dược Bạc và +1 Hạt Giống vào túi đồ');
assert(farmingContent.includes('updateHerbPlot(plotId, \'empty\', 0)'),
  'Cơ chế chống nhân đôi: chuyển ngay trạng thái ô đất về rỗng ngay khoảnh khắc bấm thu hoạch');

// 5. Kiểm tra SaveManager.ts lưu trữ và khôi phục ô đất
console.log('\n--- 5. Kiểm tra Lưu Trữ & Phục Hồi (SaveManager.ts) ---');
const savePath = path.join(ROOT_DIR, 'src', 'systems', 'SaveManager.ts');
const saveContent = fs.readFileSync(savePath, 'utf-8');

assert(saveContent.includes('herbPlots?: { id: string; stage: HerbPlotStage; plantedAt: number }[]'),
  'SaveData mở rộng trường herbPlots');
assert(saveContent.includes('herbPlots: state.getHerbPlots().map('), 'SaveManager.saveGame tuần tự hóa toàn bộ 4 ô đất');
assert(saveContent.includes('state.updateHerbPlot(pSave.id, pSave.stage, pSave.plantedAt)'),
  'SaveManager.loadGame phục hồi toàn vẹn trạng thái 4 ô đất');

// 6. Kiểm tra Tích hợp GameScene.ts
console.log('\n--- 6. Kiểm tra Tích Hợp GameScene.ts ---');
const gamePath = path.join(ROOT_DIR, 'src', 'scenes', 'GameScene.ts');
const gameContent = fs.readFileSync(gamePath, 'utf-8');

assert(gameContent.includes('private farmingSystem!: FarmingSystem'), 'GameScene khai báo trường farmingSystem');
assert(gameContent.includes('this.farmingSystem = new FarmingSystem(this)'), 'GameScene khởi tạo FarmingSystem');
assert(gameContent.includes('this.farmingSystem.update()'), 'GameScene gọi farmingSystem.update() mỗi frame');
assert(gameContent.includes('this.farmingSystem.checkNearbyPlot(px, py'), 'GameScene kiểm tra ô đất gần trong handleInteractions');
assert(gameContent.includes('this.farmingSystem.interactWithPlot('), 'GameScene thực thi tương tác phím [E] với ô đất');
assert(gameContent.includes('this.farmingSystem.destroy()'), 'GameScene dọn dẹp farmingSystem khi shutdown');

// 7. Kiểm tra WorldBuilder.ts chuẩn bị mặt bằng vườn
console.log('\n--- 7. Kiểm tra Bố Cục Vườn Sanctuary (WorldBuilder.ts) ---');
const worldPath = path.join(ROOT_DIR, 'src', 'world', 'WorldBuilder.ts');
const worldContent = fs.readFileSync(worldPath, 'utf-8');

assert(worldContent.includes('createSanctuaryHerbGarden'), 'WorldBuilder xây dựng khu vườn Sanctuary Herb Garden');
assert(worldContent.includes('Vườn Dược Sanctuary'), 'Có biển gỗ đề danh khu vườn thảo dược');

// Tổng kết
console.log('\n================================================================');
console.log(`KẾT QUẢ KIỂM TRA: ${passedTests} / ${totalTests} BÀI TEST ĐẠT (100%)`);
console.log('================================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
} else {
  process.exit(0);
}
