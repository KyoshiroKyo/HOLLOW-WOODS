/**
 * Script rà soát toàn bộ source code tạo bản đồ, nhà cửa, cây cối và nhân vật
 * Phục vụ lập báo cáo docs/v1.4/bugfix_visual_hitbox_audit.md
 */

import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();

console.log('================================================================');
console.log('🔍 AUDITING HITBOX, COLLISION & VISUAL INCONSISTENCIES (V1.4)');
console.log('================================================================\n');

// 1. Quét zones.json
const zonesPath = path.join(rootDir, 'src', 'data', 'zones.json');
const zonesData = JSON.parse(fs.readFileSync(zonesPath, 'utf8'));

console.log('--- 1. RÀ SOÁT CẤU TRÚC ZONES.JSON ---');
console.log(`Tổng số phân khu: ${zonesData.zones.length}`);

const zoneColliderReport = [];
const deepForestGaps = [];

for (const z of zonesData.zones) {
  const colliders = z.colliders || [];
  const boundaries = colliders.filter(c => c.type === 'boundary');
  const walls = colliders.filter(c => c.type === 'wall');
  const transitions = z.transitions || [];

  zoneColliderReport.push({
    id: z.id,
    name: z.name,
    bounds: z.bounds,
    boundaryCount: boundaries.length,
    wallCount: walls.length,
    transitionCount: transitions.length
  });

  // Kiểm tra Rừng Sâu (deep_forest)
  if (z.id === 'deep_forest') {
    console.log(`\nPhát hiện phân khu Deep Forest (bounds: x=${z.bounds.x}..${z.bounds.x + z.bounds.width}, y=${z.bounds.y}..${z.bounds.y + z.bounds.height}):`);
    for (const b of boundaries) {
      console.log(`  - Collider [${b.id}]: x=${b.x}, y=${b.y}, w=${b.width}, h=${b.height}`);
    }
    for (const t of transitions) {
      console.log(`  - Transition [${t.id}] -> ${t.toZone}: rect=(${t.triggerRect.x}, ${t.triggerRect.y}, ${t.triggerRect.width}, ${t.triggerRect.height})`);
      // Kiểm tra xem transition có bị boundary đè lên không
      for (const b of boundaries) {
        const overlapX = (t.triggerRect.x < b.x + b.width) && (t.triggerRect.x + t.triggerRect.width > b.x);
        const overlapY = (t.triggerRect.y < b.y + b.height) && (t.triggerRect.y + t.triggerRect.height > b.y);
        if (overlapX && overlapY) {
          deepForestGaps.push({
            zone: z.id,
            transitionId: t.id,
            boundaryId: b.id,
            issue: 'Boundary collider đè trực tiếp lên Trigger Transition hoặc chắn lối vào'
          });
        }
      }
    }
  }
}

// 2. Quét WorldBuilder.ts
console.log('\n--- 2. RÀ SOÁT WORLDBUILDER.TS ---');
const wbPath = path.join(rootDir, 'src', 'world', 'WorldBuilder.ts');
const wbContent = fs.readFileSync(wbPath, 'utf8');
const wbLines = wbContent.split('\n');

const bodyOffsetIssues = [];
const missingRefreshBody = [];
const scaleInconsistencies = [];
const depthSortingIssues = [];

wbLines.forEach((line, idx) => {
  const lineNum = idx + 1;

  // Lệch offset: .setOffset(-... / 2, -... / 2) trên Sprite create(undefined)
  if (line.includes('setOffset(-') && line.includes('/ 2')) {
    bodyOffsetIssues.push({
      line: lineNum,
      code: line.trim()
    });
  }

  // setScale nhưng không refreshBody
  if (line.includes('.setScale(')) {
    // Kiểm tra các dòng lân cận xem có refreshBody không
    const context = wbLines.slice(Math.max(0, idx - 2), Math.min(wbLines.length, idx + 8)).join('\n');
    if (!context.includes('refreshBody') && context.includes('body')) {
      missingRefreshBody.push({
        line: lineNum,
        code: line.trim()
      });
    }
    scaleInconsistencies.push({
      line: lineNum,
      code: line.trim()
    });
  }

  // Hardcoded depth thay vì y-sorting
  if (line.includes('.setDepth(')) {
    const depthArg = line.match(/\.setDepth\(([^)]+)\)/);
    if (depthArg) {
      const val = depthArg[1].trim();
      // Nếu không phải là biến y, y + ..., hoặc hằng số DEPTH_... chuẩn
      if (!val.includes('y') && !val.startsWith('DEPTH_') && !val.includes('DEPTH')) {
        depthSortingIssues.push({
          line: lineNum,
          code: line.trim(),
          depthVal: val
        });
      }
    }
  }
});

console.log(`- Phát hiện ${bodyOffsetIssues.length} vị trí dùng .setOffset(-w/2, -h/2) trên collider tĩnh`);
console.log(`- Phát hiện ${scaleInconsistencies.length} vị trí gọi .setScale(...)`);
console.log(`- Phát hiện ${depthSortingIssues.length} vị trí dùng setDepth cố định không theo tọa độ Y`);

// 3. Quét các file Entities (SatyrPlayer, NPCs, Monsters)
console.log('\n--- 3. RÀ SOÁT CÁC ENTITIES (PLAYER, NPCS, MONSTERS) ---');
const entitiesDir = path.join(rootDir, 'src', 'entities');
const entityFiles = fs.readdirSync(entitiesDir).filter(f => f.endsWith('.ts'));

const entityAuditResults = [];

entityFiles.forEach(file => {
  const fPath = path.join(entitiesDir, file);
  const content = fs.readFileSync(fPath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    if (line.includes('.setScale(')) {
      const context = lines.slice(Math.max(0, idx - 2), Math.min(lines.length, idx + 8)).join('\n');
      const hasRefresh = context.includes('refreshBody');
      const hasSetSize = context.includes('setSize');
      entityAuditResults.push({
        file,
        line: lineNum,
        code: line.trim(),
        hasRefresh,
        hasSetSize
      });
    }
  });
});

console.log(`- Kiểm tra ${entityFiles.length} file entities, phát hiện ${entityAuditResults.length} lệnh setScale`);

// Xuất file JSON tạm để tổng hợp báo cáo
const auditOutput = {
  zoneColliderReport,
  deepForestGaps,
  bodyOffsetIssuesSample: bodyOffsetIssues.slice(0, 20),
  totalBodyOffsetIssues: bodyOffsetIssues.length,
  missingRefreshBodySample: missingRefreshBody.slice(0, 15),
  depthSortingIssuesSample: depthSortingIssues.slice(0, 20),
  entityAuditResults
};

fs.writeFileSync(path.join(rootDir, 'scripts', 'temp_audit_results.json'), JSON.stringify(auditOutput, null, 2));
console.log('\n✅ Đã ghi nhận toàn bộ dữ liệu audit vào scripts/temp_audit_results.json');
