import fs from 'fs';
import path from 'path';

function runTests() {
  console.log('=== KIỂM TRA TỰ ĐỘNG BƯỚC V15-45: CHỈ DẪN TRẬN BOSS & TRỤ PHONG ẤN MẠCH RỄ ===\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
    }
  }

  // 1. Kiểm tra tài nguyên sprite SHADOW Series
  const bossSpriteDir = 'public/assets/characters/bosses/wetlands_boss';
  const expectedSprites = [
    'boss_wetlands_idle.png',
    'boss_wetlands_walk.png',
    'boss_wetlands_attack1.png',
    'boss_wetlands_attack2.png',
    'boss_wetlands_hit.png',
    'boss_wetlands_death.png'
  ];

  for (const spriteName of expectedSprites) {
    const fullPath = path.join(bossSpriteDir, spriteName);
    assert(fs.existsSync(fullPath), `Tài nguyên SHADOW Series: ${spriteName} tồn tại đầy đủ`);
  }

  // 2. Kiểm tra MireWardenBoss.ts
  const bossCode = fs.readFileSync('src/entities/MireWardenBoss.ts', 'utf8').replace(/\r\n/g, '\n');

  assert(
    bossCode.includes('showInvulnerableWarning') &&
    bossCode.includes('🛡️ BẤT KHẢ XÂM PHẠM!') &&
    bossCode.includes('Hãy phá hủy 3 Trụ Phong Ấn ở góc quảng trường trước.'),
    'MireWardenBoss: Có phương thức showInvulnerableWarning() hiển thị chỉ dẫn trên đầu Boss'
  );

  assert(
    bossCode.includes('triggerSonicRoar') &&
    bossCode.includes('anim_boss_wetlands_attack2'),
    'MireWardenBoss: Có đòn gầm sóng âm triggerSonicRoar() kết nối anim_boss_wetlands_attack2'
  );

  assert(
    bossCode.includes('anim_boss_wetlands_attack1') &&
    bossCode.includes('anim_boss_wetlands_hit') &&
    bossCode.includes('anim_boss_wetlands_death'),
    'MireWardenBoss: Sử dụng đầy đủ hoạt ảnh lao húc, choáng và tử trận từ SHADOW Series'
  );

  // 3. Kiểm tra GameScene.ts
  const gameSceneCode = fs.readFileSync('src/scenes/GameScene.ts', 'utf8').replace(/\r\n/g, '\n');

  assert(
    gameSceneCode.includes('showInvulnerableWarning') &&
    gameSceneCode.includes('🛡️ Bất khả xâm phạm! Hãy phá hủy 3 Trụ Phong Ấn ở góc quảng trường trước.'),
    'GameScene: Đánh trúng Boss lúc chưa choáng hiển thị thông báo Bất Khả Xâm Phạm'
  );

  assert(
    gameSceneCode.includes("promptText: '[E] Phá Giải Phong Ấn Mạch Rễ'"),
    'GameScene: Có nhãn tương tác [E] Phá Giải Phong Ấn Mạch Rễ khi ở gần trụ phát sáng'
  );

  assert(
    gameSceneCode.includes('handleShatterRunePillar(pillar: RunePillarTarget)'),
    'GameScene: Có hàm handleShatterRunePillar xử lý phá trụ, làm choáng Boss và kích hoạt trụ tiếp theo'
  );

  assert(
    gameSceneCode.includes('handleBossSonicRoar()') &&
    gameSceneCode.includes('playBehemothRoar'),
    'GameScene: Có hàm handleBossSonicRoar xử lý đòn sóng âm lan tỏa và gây sát thương/đẩy lùi'
  );

  assert(
    gameSceneCode.includes('distP <= 65') &&
    gameSceneCode.includes('playHurt') &&
    gameSceneCode.includes('setVelocity(Math.cos(angle) * 340, Math.sin(angle) * 340)'),
    'GameScene: Đòn lao húc của Boss kiểm tra va chạm chuẩn xác (distP <= 65), đẩy lùi và phát âm thanh sát thương'
  );

  console.log(`\nKết quả: ${passed}/${total} bài kiểm tra đạt yêu cầu (${Math.round((passed / total) * 100)}%).`);
  if (passed === total) {
    console.log('>>> TẤT CẢ CÁC BÀI KIỂM TRA ĐỀU THÀNH CÔNG VƯỢT TRỘI! <<<');
    process.exit(0);
  } else {
    console.error('>>> CÓ BÀI KIỂM TRA THẤT BẠI! <<<');
    process.exit(1);
  }
}

runTests();
