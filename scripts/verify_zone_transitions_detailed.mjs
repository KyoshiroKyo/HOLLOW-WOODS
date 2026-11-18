import fs from 'fs';

const zonesData = JSON.parse(fs.readFileSync('src/data/zones.json', 'utf8'));
const zones = zonesData.zones;
const zoneMap = new Map();
zones.forEach(z => zoneMap.set(z.id, z));

console.log('=== CHI TIẾT KIỂM TOÁN TỌA ĐỘ TRANSITION & COLLIDER CHO 17 ZONE ===\n');

let issues = 0;

for (const z of zones) {
  if (!z.transitions) continue;
  for (const t of z.transitions) {
    const dest = zoneMap.get(t.toZone);
    if (!dest) {
      console.error(`[LỖI] Zone ${z.id} trỏ tới toZone không tồn tại: ${t.toZone}`);
      issues++;
      continue;
    }

    // Kiểm tra targetSpawn nằm trong bounds của dest
    const sp = t.targetSpawn;
    if (
      sp.x < dest.bounds.x ||
      sp.x > dest.bounds.x + dest.bounds.width ||
      sp.y < dest.bounds.y ||
      sp.y > dest.bounds.y + dest.bounds.height
    ) {
      console.error(`[LỖI BOUNDS] Transition ${t.id} từ ${z.id} sang ${t.toZone}: targetSpawn (${sp.x}, ${sp.y}) nằm ngoài bounds của ${t.toZone}!`);
      issues++;
    }

    // Kiểm tra targetSpawn có dính solid collider trong dest không
    if (dest.colliders) {
      for (const col of dest.colliders) {
        if (!col.isSolid) continue;
        if (
          sp.x >= col.x &&
          sp.x <= col.x + col.width &&
          sp.y >= col.y &&
          sp.y <= col.y + col.height
        ) {
          console.error(`[LỖI COLLIDER] Transition ${t.id}: targetSpawn (${sp.x}, ${sp.y}) rơi trúng solid collider ${col.id} trong ${dest.id}!`);
          issues++;
        }
      }
    }

    // Kiểm tra returnPoint nằm trong bounds của z
    if (t.returnPoint) {
      const rp = t.returnPoint;
      if (
        rp.x < z.bounds.x ||
        rp.x > z.bounds.x + z.bounds.width ||
        rp.y < z.bounds.y ||
        rp.y > z.bounds.y + z.bounds.height
      ) {
        console.error(`[LỖI BOUNDS] Transition ${t.id} trong ${z.id}: returnPoint (${rp.x}, ${rp.y}) nằm ngoài bounds!`);
        issues++;
      }
    }
  }
}

if (issues === 0) {
  console.log('>>> HOÀN HẢO: 100% CỔNG TRANSITION ĐẶT TỌA ĐỘ AN TOÀN TRONG BOUNDS & KHÔNG CHẠM COLLIDER! <<<');
} else {
  console.log(`>>> TỔNG SỐ LỖI PHÁT HIỆN: ${issues} <<<`);
}
