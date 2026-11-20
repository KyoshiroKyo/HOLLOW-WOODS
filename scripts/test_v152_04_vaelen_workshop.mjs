/**
 * TEST SUITE: V152-04 (Sir Vaelen Outpost & Sub Bell Workshop South Route)
 */
import fs from 'fs';
import path from 'path';

let pass = 0;
let fail = 0;

function assert(cond, msg) {
  if (cond) {
    console.log(`  ✅ PASS: ${msg}`);
    pass++;
  } else {
    console.error(`  ❌ FAIL: ${msg}`);
    fail++;
  }
}

console.log('=== RUNNING VERIFICATION FOR STEP V152-04 ===\n');

// 1. Kiểm tra Asset Pixel Art thật của Trạm Kiểm Lâm & Lều Thợ Săn
console.log('1. Kiểm tra tài nguyên Pixel Art:');
const cabinPath = path.resolve('public/assets/buildings/ranger_cabin_wood.png');
const tentPath = path.resolve('public/assets/environment/props/prop_wayfarer_tent.png');
assert(fs.existsSync(cabinPath), 'Tập tin ranger_cabin_wood.png tồn tại trong public/assets/buildings/');
assert(fs.existsSync(tentPath), 'Tập tin prop_wayfarer_tent.png tồn tại trong public/assets/environment/props/');

const cabinBuf = fs.readFileSync(cabinPath);
assert(cabinBuf.readUInt32BE(16) === 88 && cabinBuf.readUInt32BE(20) === 103, 'ranger_cabin_wood.png kích thước chuẩn 88x103 px');

// 2. Kiểm tra WorldBuilder.ts
console.log('\n2. Kiểm tra WorldBuilder.ts:');
const wbSrc = fs.readFileSync(path.resolve('src/world/WorldBuilder.ts'), 'utf-8');
assert(!wbSrc.includes('fillTriangle(x - 4, y + 12'), 'Đã xóa sạch vẽ mái nhà hình tam giác bằng Phaser.Graphics trong createAbandonedRangerOutpost');
assert(!wbSrc.includes('g.fillRoundedRect(x - 4, y + 8, 38, 16'), 'Đã xóa sạch vẽ lều bằng Phaser.Graphics trong createHunterLeanToShelter');
assert(wbSrc.includes('SPRITE_BUILDING_RANGER_OUTPOST_V15'), 'createAbandonedRangerOutpost sử dụng SPRITE_BUILDING_RANGER_OUTPOST_V15 Pixel Art');
assert(wbSrc.includes("createStoneSign(1300, 985, 'XƯỞNG CHUÔNG BỎ HOANG ↓')"), 'WorldBuilder cắm biển chỉ dẫn XƯỞNG CHUÔNG BỎ HOANG ↓ tại (1300, 985)');
assert(!wbSrc.includes("createTree(1340, 990"), 'Đã dỡ bỏ cây cổ thụ chắn ngang lối Nam tại (1340, 990)');

// 3. Kiểm tra Sir Vaelen và Trạm Lửa CampSanctuarySystem
console.log('\n3. Kiểm tra Sir Vaelen & CampSanctuarySystem:');
const campSrc = fs.readFileSync(path.resolve('src/systems/CampSanctuarySystem.ts'), 'utf-8');
const gsSrc = fs.readFileSync(path.resolve('src/scenes/GameScene.ts'), 'utf-8');
const zonesData = JSON.parse(fs.readFileSync(path.resolve('src/data/zones.json'), 'utf-8'));
const ow = zonesData.zones.find(z => z.id === 'outer_woods');
const bw = zonesData.zones.find(z => z.id === 'sub_bell_workshop');

assert(campSrc.includes('knightX: number = 1435') && campSrc.includes('knightY: number = 710'), 'CampSanctuarySystem cấu hình Sir Vaelen tại (1435, 710)');
assert(campSrc.includes('campfireX: number = 1470') && campSrc.includes('campfireY: number = 710'), 'CampSanctuarySystem cấu hình Bếp Lửa Hồng tại (1470, 710)');
const dist = Math.hypot(1470 - 1435, 710 - 710);
assert(dist >= 35 && dist <= 50, `Khoảng cách giữa Sir Vaelen và Bếp Lửa nằm trong phạm vi 35-50px (thực tế: ${dist}px)`);

assert(ow.npcs.some(n => n.id === 'npc_campfire_knight' && n.x === 1435 && n.y === 710), 'zones.json định nghĩa Sir Vaelen tại (1435, 710)');
assert(gsSrc.includes('id: \'npc_campfire_knight\'') && gsSrc.includes('x: 1435') && gsSrc.includes('y: 710'), 'GameScene khởi tạo Sir Vaelen tại (1435, 710)');

// 4. Kiểm tra ZoneConnectionRegistry.ts & zones.json
console.log('\n4. Kiểm tra kết nối vùng và chốt kẹp tọa độ:');
const zcSrc = fs.readFileSync(path.resolve('src/world/ZoneConnectionRegistry.ts'), 'utf-8');
assert(zcSrc.includes("id: 'conn_outer_woods_to_bell_workshop'"), 'ZoneConnectionRegistry đăng ký kết nối từ Outer Woods tới Sub Bell Workshop');
assert(zcSrc.includes("id: 'conn_bell_workshop_to_outer_woods'"), 'ZoneConnectionRegistry đăng ký kết nối 2 chiều từ Sub Bell Workshop về Outer Woods');
assert(zcSrc.includes("this.zoneNodes.set('sub_bell_workshop'"), 'ZoneConnectionRegistry đăng ký node sub_bell_workshop');

assert(ow.transitions.some(t => t.toZone === 'sub_bell_workshop'), 'zones.json outer_woods có transition sang sub_bell_workshop');
assert(bw.transitions.some(t => t.toZone === 'outer_woods'), 'zones.json sub_bell_workshop có transition sang outer_woods');
assert(ow.interactables.some(i => i.id === 'sign_sub_bell_workshop'), 'zones.json outer_woods có interactable sign_sub_bell_workshop');

// 5. Kiểm tra Boundary Colliders của Sub Bell Workshop dày >= 32px
console.log('\n5. Kiểm tra Boundary Colliders:');
const topL = bw.colliders.find(c => c.id === 'bw_bound_top_left');
const topR = bw.colliders.find(c => c.id === 'bw_bound_top_right');
const bot = bw.colliders.find(c => c.id === 'bw_bound_bottom');
const left = bw.colliders.find(c => c.id === 'bw_bound_left');
const right = bw.colliders.find(c => c.id === 'bw_bound_right');

assert(topL && topL.height >= 32, 'bw_bound_top_left dày >= 32px');
assert(topR && topR.height >= 32, 'bw_bound_top_right dày >= 32px');
assert(bot && bot.height >= 32, 'bw_bound_bottom dày >= 32px');
assert(left && left.width >= 32, 'bw_bound_left dày >= 32px');
assert(right && right.width >= 32, 'bw_bound_right dày >= 32px');

assert(gsSrc.includes("case 'sub_bell_workshop':"), 'GameScene clampPlayerToZoneBounds có cấu hình bảo vệ cho sub_bell_workshop');

console.log(`\n=== TỔNG KẾT: ${pass} PASS / ${fail} FAIL ===`);
if (fail > 0) process.exit(1);
