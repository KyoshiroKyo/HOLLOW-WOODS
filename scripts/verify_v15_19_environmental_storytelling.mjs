import fs from 'fs';
import path from 'path';

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

console.log('=== RUNNING VERIFICATION FOR STEP V15-19: ENVIRONMENTAL STORYTELLING ===\n');

// 1. Kiểm tra 10 Mảnh Lore trong src/data/lore.json
try {
  const lorePath = path.resolve('src/data/lore.json');
  const loreRaw = fs.readFileSync(lorePath, 'utf8');
  const loreData = JSON.parse(loreRaw);
  assert(true, 'src/data/lore.json cú pháp JSON hợp lệ 100%');

  const expectedLores = [
    { id: 'lore_knights_memorial_stele', title: 'BIA ĐÁ TƯỞNG NIỆM ĐOÀN KỴ SĨ' },
    { id: 'lore_bellmaker_dew_journal', title: 'TRANG NHẬT KÝ ƯỚT SƯƠNG: HỢP KIM NGÂN VANG' },
    { id: 'lore_broken_sword_mire', title: 'THANH KIẾM GÃY BÊN BỜ ĐẦM LẦY' },
    { id: 'lore_elian_unsent_letter', title: 'BỨC THƯ CHƯA KỊP GỬI CỦA ELIAN' },
    { id: 'lore_ancient_oak_hollow', title: 'GỐC SỒI NGÀN NĂM & DẤU ẤN MẠCH RỄ' },
    { id: 'lore_root_cellar_alchemy', title: 'GHI CHÉP DƯỢC THẢO DƯỚI HẦM RỄ' },
    { id: 'lore_echo_ruins_prayer', title: 'TIẾNG VỌNG KÝ ỨC: LỜI NGUYỆN CẦU TÀN TÍCH' },
    { id: 'lore_echo_mire_path', title: 'TIẾNG VỌNG KÝ ỨC: BƯỚC CHÂN ĐẦM LẦY' },
    { id: 'lore_stone_chessboard', title: 'BÀN CỜ ĐÁ GIỮA MÀN SƯƠNG' },
    { id: 'lore_shrine_parchment_map', title: 'BẢN ĐỒ DA CỪU: HỘI TỤ MẠCH RỄ' }
  ];

  for (const expected of expectedLores) {
    const entry = loreData.loreEntries.find(e => e.id === expected.id);
    assert(!!entry, `Tồn tại mảnh ký ức ${expected.id}`);
    assert(entry?.title === expected.title, `Tiêu đề chuẩn: "${expected.title}"`);
    assert(entry?.content && entry.content.length > 50, `Nội dung của ${expected.id} chi tiết và đầy đủ (> 50 ký tự)`);
  }
} catch (e) {
  assert(false, `Lỗi đọc src/data/lore.json: ${e.message}`);
}

// 2. Kiểm tra 10 Điểm Tương Tác trong src/data/zones.json
try {
  const zonesPath = path.resolve('src/data/zones.json');
  const zonesRaw = fs.readFileSync(zonesPath, 'utf8');
  const zonesData = JSON.parse(zonesRaw);
  assert(true, 'src/data/zones.json cú pháp JSON hợp lệ 100%');

  const expectedInteractables = [
    { zoneId: 'bellhollow', id: 'env_ancient_oak_hollow', actionId: 'inspect_ancient_oak_hollow' },
    { zoneId: 'outer_woods', id: 'env_knights_memorial_stele', actionId: 'inspect_knights_memorial_stele' },
    { zoneId: 'outer_woods', id: 'env_echo_ruins_prayer', actionId: 'inspect_echo_ruins_prayer' },
    { zoneId: 'crooked_path', id: 'env_elian_unsent_letter', actionId: 'inspect_elian_unsent_letter' },
    { zoneId: 'crooked_path', id: 'env_stone_chessboard', actionId: 'inspect_stone_chessboard' },
    { zoneId: 'silent_mire', id: 'env_broken_sword_mire', actionId: 'inspect_broken_sword_mire' },
    { zoneId: 'silent_mire', id: 'env_echo_mire_path', actionId: 'inspect_echo_mire_path' },
    { zoneId: 'broken_bell_shrine', id: 'env_shrine_parchment_map', actionId: 'inspect_shrine_parchment_map' },
    { zoneId: 'sub_bell_workshop', id: 'env_bellmaker_dew_journal', actionId: 'inspect_bellmaker_dew_journal' },
    { zoneId: 'sub_root_cellar', id: 'env_root_cellar_alchemy', actionId: 'inspect_root_cellar_alchemy' }
  ];

  for (const exp of expectedInteractables) {
    const zone = zonesData.zones.find(z => z.id === exp.zoneId);
    assert(!!zone, `Tìm thấy phân khu ${exp.zoneId}`);
    const item = zone?.interactables?.find(i => i.id === exp.id);
    assert(!!item, `Tìm thấy interactable ${exp.id} trong phân khu ${exp.zoneId}`);
    assert(item?.actionId === exp.actionId, `actionId của ${exp.id} đúng: ${exp.actionId}`);
    assert(item?.type === 'clue', `type của ${exp.id} là "clue"`);
    assert(item?.promptText && item.promptText.includes('[E]'), `promptText của ${exp.id} có tiền tố [E]`);
  }
} catch (e) {
  assert(false, `Lỗi đọc src/data/zones.json: ${e.message}`);
}

// 3. Kiểm tra mã nguồn src/world/WorldBuilder.ts
try {
  const wbPath = path.resolve('src/world/WorldBuilder.ts');
  const wbContent = fs.readFileSync(wbPath, 'utf8');

  assert(wbContent.includes('renderEnvironmentalStorytellingProps'), 'WorldBuilder có phương thức renderEnvironmentalStorytellingProps');
  assert(wbContent.includes('this.renderEnvironmentalStorytellingProps()'), 'WorldBuilder gọi renderEnvironmentalStorytellingProps trong buildWorld');
  assert(wbContent.includes('env_knights_memorial_stele'), 'WorldBuilder đăng ký env_knights_memorial_stele');
  assert(wbContent.includes('env_bellmaker_dew_journal'), 'WorldBuilder đăng ký env_bellmaker_dew_journal');
  assert(wbContent.includes('env_broken_sword_mire'), 'WorldBuilder đăng ký env_broken_sword_mire');
  assert(wbContent.includes('env_elian_unsent_letter'), 'WorldBuilder đăng ký env_elian_unsent_letter');
  assert(wbContent.includes('env_ancient_oak_hollow'), 'WorldBuilder đăng ký env_ancient_oak_hollow');
  assert(wbContent.includes('env_root_cellar_alchemy'), 'WorldBuilder đăng ký env_root_cellar_alchemy');
  assert(wbContent.includes('env_echo_ruins_prayer'), 'WorldBuilder đăng ký env_echo_ruins_prayer');
  assert(wbContent.includes('env_echo_mire_path'), 'WorldBuilder đăng ký env_echo_mire_path');
  assert(wbContent.includes('env_stone_chessboard'), 'WorldBuilder đăng ký env_stone_chessboard');
  assert(wbContent.includes('env_shrine_parchment_map'), 'WorldBuilder đăng ký env_shrine_parchment_map');
  assert(wbContent.includes('SPRITE_THE_ECHO'), 'WorldBuilder render sprite SPRITE_THE_ECHO cho The Echo');
} catch (e) {
  assert(false, `Lỗi đọc src/world/WorldBuilder.ts: ${e.message}`);
}

// 4. Kiểm tra mã nguồn src/scenes/GameScene.ts
try {
  const gsPath = path.resolve('src/scenes/GameScene.ts');
  const gsContent = fs.readFileSync(gsPath, 'utf8');

  const actionIds = [
    'inspect_knights_memorial_stele',
    'inspect_bellmaker_dew_journal',
    'inspect_broken_sword_mire',
    'inspect_elian_unsent_letter',
    'inspect_ancient_oak_hollow',
    'inspect_root_cellar_alchemy',
    'inspect_echo_ruins_prayer',
    'inspect_echo_mire_path',
    'inspect_stone_chessboard',
    'inspect_shrine_parchment_map'
  ];

  for (const act of actionIds) {
    assert(gsContent.includes(`actionId === '${act}'`), `GameScene xử lý hành động ${act}`);
  }

  assert(gsContent.includes("this.playerState.modifyComposure(15)"), 'GameScene thưởng hồi phục Bình Tâm');
  assert(gsContent.includes("this.playerState.modifyComposure(20)"), 'GameScene thưởng hồi phục Bình Tâm cấp độ 20');
  assert(gsContent.includes("this.playerState.modifyComposure(25)"), 'GameScene thưởng hồi phục Bình Tâm cấp độ 25 cho The Echo / Map');
  assert(gsContent.includes("this.playerState.addItem('res_tree_resin', 1)"), 'GameScene thưởng Nhựa Thông Cổ Thụ');
  assert(gsContent.includes("this.playerState.addItem('mat_runed_iron', 1)"), 'GameScene thưởng Phôi Sắt Cổ Ngữ');
  assert(gsContent.includes("this.playerState.addItem('res_herbs', 2)"), 'GameScene thưởng Thảo Dược Bạc');
  assert(gsContent.includes("this.playerState.addItem('res_dry_wood', 2)"), 'GameScene thưởng Gỗ Khô');
} catch (e) {
  assert(false, `Lỗi đọc src/scenes/GameScene.ts: ${e.message}`);
}

// 5. Kiểm tra giao diện Sổ Tay src/ui/JournalModal.ts
try {
  const jmPath = path.resolve('src/ui/JournalModal.ts');
  const jmContent = fs.readFileSync(jmPath, 'utf8');

  assert(jmContent.includes("item.id.includes('echo')"), 'JournalModal phát hiện và gắn biểu tượng riêng cho The Echo');
  assert(jmContent.includes("'✨ '"), 'JournalModal hiển thị biểu tượng ngôi sao lân tinh ✨ cho The Echo');
} catch (e) {
  assert(false, `Lỗi đọc src/ui/JournalModal.ts: ${e.message}`);
}

console.log(`\n======================================================`);
console.log(`KẾT QUẢ KIỂM THỬ V15-19: PASS=${passCount}, FAIL=${failCount}`);
console.log(`======================================================\n`);

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
