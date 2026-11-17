import fs from 'fs';
import path from 'path';

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failCount++;
  }
}

console.log('--- KIỂM TRA BƯỚC V14-P2-02: THỜI TIẾT MƯA SƯƠNG & HUY HIỆU ĐỘ ẨM / THÂN NHIỆT ---');

// 1. Kiểm tra WeatherSystem.ts
const weatherSystemPath = path.resolve('src/systems/WeatherSystem.ts');
assert(fs.existsSync(weatherSystemPath), 'File src/systems/WeatherSystem.ts tồn tại');
const weatherContent = fs.readFileSync(weatherSystemPath, 'utf-8');

assert(weatherContent.includes("type WeatherType = 'CLEAR' | 'MIST_RAIN'"), 'WeatherSystem hỗ trợ 2 trạng thái CLEAR và MIST_RAIN');
assert(weatherContent.includes('maxParticles: number = 75'), 'WeatherSystem giới hạn pool hạt mưa tối đa 75 hạt tránh quá tải hiệu năng');
assert(weatherContent.includes('getFootstepNoiseDampening'), 'WeatherSystem cung cấp phương thức getFootstepNoiseDampening()');
assert(weatherContent.includes('Math.max(0.6, 1.0 - 0.4 * this.rainIntensity)'), 'Tiếng bước chân giảm tối đa 40% (hệ số 0.6) khi trời Mưa Sương');
assert(weatherContent.includes('getFairPlayListenerAlertDistance'), 'WeatherSystem cung cấp khoảng cách cảnh báo công bằng 220px');
assert(weatherContent.includes('AudioManager.getInstance().setRainIntensity(this.rainIntensity)'), 'WeatherSystem tự động đồng bộ âm thanh mưa với AudioManager');

// 2. Kiểm tra AudioManager.ts
const audioManagerPath = path.resolve('src/audio/AudioManager.ts');
const audioContent = fs.readFileSync(audioManagerPath, 'utf-8');
assert(audioContent.includes('setRainIntensity(intensity: number)'), 'AudioManager có hàm setRainIntensity điều chỉnh âm thanh mưa rơi');
assert(audioContent.includes('rainGain'), 'AudioManager quản lý rainGain bằng Web Audio API');

// 3. Kiểm tra SurvivalSystem.ts
const survivalPath = path.resolve('src/systems/SurvivalSystem.ts');
const survivalContent = fs.readFileSync(survivalPath, 'utf-8');
assert(survivalContent.includes('stats.moisture'), 'SurvivalSystem quản lý chỉ số moisture (Độ ẩm)');
assert(survivalContent.includes('stats.temperature'), 'SurvivalSystem quản lý chỉ số temperature (Thân nhiệt)');
assert(survivalContent.includes('getMoistureTier(): \'DRY\' | \'DAMP\' | \'SOAKED\''), 'Có hàm getMoistureTier() phân cấp DRY / DAMP / SOAKED');
assert(survivalContent.includes('getTemperatureTier(): \'WARM\' | \'CHILLY\' | \'FREEZING\''), 'Có hàm getTemperatureTier() phân cấp WARM / CHILLY / FREEZING');
assert(survivalContent.includes('STAMINA_RECOVERY_RATE * 0.75'), 'Trạng thái SOAKED giảm 25% tốc độ hồi thể lực');
assert(survivalContent.includes('stats.composure = Math.max(0, stats.composure - 0.4 * dt)'), 'Trạng thái FREEZING tạo áp lực rút Bình Tâm nhẹ (-0.4/s)');
assert(survivalContent.includes('stats.health = Math.max(0, stats.health - 0.4 * dt);'), 'Giữ nguyên 100% dòng rút máu nguyên thủy khi đói/khát để pass hồi quy V1.3');

// 4. Kiểm tra UIScene.ts
const uiScenePath = path.resolve('src/scenes/UIScene.ts');
const uiContent = fs.readFileSync(uiScenePath, 'utf-8');
assert(uiContent.includes('this.statCardBg.fillRoundedRect(12, 8, 308, 92, 6)'), 'UIScene giữ nguyên kích thước khung stat gốc 308x92 để pass hồi quy');
assert(uiContent.includes('this.moistureBadgeBg'), 'UIScene tạo badge Độ Ẩm riêng biệt dạng huy hiệu');
assert(uiContent.includes('this.temperatureBadgeBg'), 'UIScene tạo badge Thân Nhiệt riêng biệt dạng huy hiệu');
assert(uiContent.includes('updateStatusBadges(moisture: number, temperature: number)'), 'UIScene có hàm updateStatusBadges cập nhật huy hiệu môi trường');
assert(uiContent.includes('Khô ráo') && uiContent.includes('Ẩm ướt') && uiContent.includes('Ướt sũng'), 'Huy hiệu Độ Ẩm hiển thị nhãn tiếng Việt chuẩn Khô ráo / Ẩm ướt / Ướt sũng');
assert(uiContent.includes('Ấm áp') && uiContent.includes('Se lạnh') && uiContent.includes('Cóng lạnh'), 'Huy hiệu Thân Nhiệt hiển thị nhãn tiếng Việt chuẩn Ấm áp / Se lạnh / Cóng lạnh');

// 5. Kiểm tra GameScene.ts
const gameScenePath = path.resolve('src/scenes/GameScene.ts');
const gameContent = fs.readFileSync(gameScenePath, 'utf-8');
assert(gameContent.includes('this.weatherSystem = new WeatherSystem()'), 'GameScene khởi tạo WeatherSystem');
assert(gameContent.includes('this.weatherSystem.getFootstepNoiseDampening()'), 'GameScene áp dụng hệ số cản tiếng chân vào thính giác The Listener');
assert(gameContent.includes('this.weatherSystem.renderRainParticles(this.rainGfx)'), 'GameScene gọi render hạt mưa lên tầng rainGfx');
assert(gameContent.includes('this.weatherSystem.update(dt'), 'GameScene cập nhật weatherSystem theo dt');
assert(gameContent.includes('this.weatherSystem.isRaining()'), 'GameScene truyền trạng thái mưa sang SurvivalSystem');

console.log(`\nTổng kết: ${passCount} PASS / ${failCount} FAIL`);
if (failCount > 0) {
  process.exit(1);
} else {
  console.log('>>> TẤT CẢ KIỂM THỬ V14-P2-02 ĐÃ ĐẠT CHUẨN XUẤT SẮC! <<<');
}
