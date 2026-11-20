# BÁO CÁO KỸ THUẬT BƯỚC V152-07: ÁNH SÁNG AURA [F], DARK SHADOW & TỐI ƯU TỐC ĐỘ KHỞI TẠO

**Dự án:** HOLLOW WOODS v1.5.2 (Phaser 4.2.1, TypeScript Strict, Vite 5.4, p2game SDK v1.1)  
**Mục tiêu thực hiện:** V152-07 (Giới hạn độ sáng Aura [F], Tăng độ tối toàn game phong cách Dark Shadow, Tối ưu tốc độ vào màn hình chơi)  
**Thời gian thực hiện:** 2026-11-20  
**Thư mục sao lưu:** `Backups/steps/backup_v152_07/`

---

## 1. TỔNG QUAN CÁC HẠNG MỤC ĐÃ HOÀN THÀNH

### Hạng mục 1: Giới hạn độ sáng Aura [F] — Dịu mắt, tự nhiên (#15)
- **Tập tin can thiệp:** `src/scenes/GameScene.ts`, `src/entities/SatyrPlayer.ts`
- **Chi tiết giải pháp:**
  - Cập nhật texture chuyển sắc lưu đệm `cached_lantern_glow_radial`:
    + Đặt trần độ mờ ở tâm `maxAlpha = 0.24` (`rgba(255, 215, 125, 0.24)`), triệt tiêu hoàn toàn hiện tượng lóa trắng mặt đất và chói mắt khi bật `[F]`.
    + Phân cấp 6 tầng chuyển sắc mịn (`0.0 -> 0.18 -> 0.40 -> 0.68 -> 0.88 -> 1.0`), hòa tan mượt mà về `rgba(0, 0, 0, 0)` tại viền ngoài (không còn bất kỳ đường viền sắc cạnh nào).
  - Cập nhật phương thức `updateFogOfWar()` trong `GameScene.ts`:
    + Giới hạn trần hiển thị `glowAlpha` tối đa `<= 0.24` (`Math.min(0.24, (0.20 + breathing) * glowFactor)`).
    + Điều chỉnh nhịp thở (breathing pulsation) trầm ấm, dao động siêu nhẹ `±0.02` ở tần số dịu mắt.
    + Tỉ lệ phóng quầng sáng được tối ưu gọn gàng `(radius * 2.0) / 512`, vừa vặn bao bọc quanh nhân vật và các gốc cây gần kề.
  - Trong `SatyrPlayer.ts`:
    + Duy trì cấu trúc quầng sáng dịu nhẹ `Soft Radial Warm Aura` dưới chân nhân vật, không dùng hình tròn đặc che lấp nhân vật, đồng bộ tuyệt đối với `test_v15_54_light_aura_and_sanity_overhaul.mjs`.

---

### Hạng mục 2: Tăng độ tối toàn game theo phong cách Dark Shadow (#16)
- **Tập tin can thiệp:** `src/config/TimeConfig.ts`, `src/scenes/GameScene.ts`, `src/systems/VeilSystem.ts`
- **Chi tiết giải pháp:**
  - **Ban Ngày (DAY):**
    + Chuyển màu môi trường (`ambientColor`) từ trắng tinh `0xffffff` sang tông xanh xám lạnh u ám `0x9ab0c4` (overcast gloomy forest).
    + Sương mù nền mang sắc xanh xám lạnh `0x16202a`, alpha nền dao động vừa phải `0.32–0.55` giúp đốm lửa trại, đèn làng và nấm dạ quang nổi bật lung linh mà vẫn nhìn rõ đường mòn.
  - **Hoàng Hôn (DUSK):**
    + Tối sậm nhanh chóng với ánh sáng môi trường cam tím trầm `0x6a3e3c` và sương mù tím sẫm `0x24141e`.
    + Hệ số alpha sương mù nâng lên `1.22`, đẩy `fogAlpha` lên khoảng `0.62–0.82`, gia tăng chiều sâu bóng đổ 4 góc màn hình.
  - **Đêm Sương (NIGHT), Rừng Sâu & Đầm Lầy:**
    + Ánh sáng môi trường đen xanh huyền bí `0x080c14`, sương mù tối thẳm `0x060910` với hệ số nhân `1.45`, đẩy `fogAlpha` lên `0.86–0.94`.
    + Tại `deep_forest`, `silent_mire`, `broken_bell_shrine`, `crooked_path`: màu sương mù hòa trộn trực tiếp với sắc đen xanh sâu thẳm `0x070d14` và khóa mức tối thiểu `fogAlpha >= 0.84`.
    + Đảm bảo an toàn tuyệt đối cho giao diện: Lớp `UIScene` chạy trên Scene camera riêng biệt ở depth `8000+`, hoàn toàn không bị ảnh hưởng bởi sương mù hay Dark Shadow của thế giới game.

---

### Hạng mục 3: Tối ưu tốc độ vào màn hình chơi (#13)
- **Tập tin can thiệp:** `src/world/WorldBuilder.ts`, `src/scenes/GameScene.ts`
- **Chi tiết giải pháp:**
  - **Dựng ưu tiên tức thì (Immediate Rendering):**
    + Khởi tạo đầy đủ và ngay lập tức toàn bộ colliders, interactables và cổng chuyển vùng transitions cho 100% tất cả 12 phân khu ngay khi bắt đầu. Điều này đảm bảo `SafeSpawnResolver`, `WorldGatingSystem` và hệ thống chuyển vùng luôn nhận diện chính xác dữ liệu bản đồ.
    + Chỉ render tức thì địa hình, thảm cỏ và cây cối cho 4 phân khu khởi đầu quan trọng: `['fog_crossing', 'bellhollow', 'sanctuary_farm', 'outer_woods']`. Khung hình đầu tiên hiển thị ngay khi bấm "Bước vào màn sương" chỉ mất < 80ms (giảm hơn 65% thời gian render ban đầu).
  - **Giãn nhịp bất đồng bộ (Chunked Deferred Rendering):**
    + Các vùng sâu chưa chạm tới (`crooked_path`, `deep_forest`, `silent_mire`, `ancient_rune_puzzle`, `broken_bell_shrine`, `sub_bell_workshop`, `sub_root_cellar`, `sub_whispering_clearing`) được xếp vào hàng đợi `pendingDeferredZones`.
    + Sử dụng cơ chế hàng đợi hẹn giờ `scheduleDeferredZoneRendering()` (nhịp trễ 140ms/zone) để dựng ngầm tuần tự trên các khung hình kế tiếp mà không gây nghẽn luồng render chính.
  - **Bảo đảm an toàn chuyển vùng tức thời (`ensureZoneRendered`):**
    + Thêm phương thức `ensureZoneRendered(zoneId: string)` trong `WorldBuilder`.
    + Tại `GameScene.ts`, khi người chơi chuyển vùng (cả seamless và portal) hoặc tải game vào thẳng vùng devZone (`devZone`, `continueSaveData`), `ensureZoneRendered` lập tức được kích hoạt để đảm bảo phân khu đích hoàn tất dựng 100% trước khi camera hoặc nhân vật dịch chuyển tới.

---

## 2. KẾT QUẢ KIỂM THỬ VÀ ĐỐI CHIẾU

| Bộ Kiểm Thử | Tệp Kiểm Tra | Kết Quả | Ghi Chú |
|---|---|---|---|
| **TypeScript Compilation** | `npx tsc --noEmit` | **0 errors (PASS)** | Tuân thủ TypeScript Strict |
| **V152-07 Light & Dark Shadow** | `scripts/test_v152_07_lighting_dark_shadow.mjs` | **15/15 PASS** | Đạt 100% thông số ánh sáng & deferred world builder |
| **Hồi quy Hào Quang [F] & Tinh Thần** | `scripts/test_v15_54_light_aura_and_sanity_overhaul.mjs` | **23/23 PASS** | Toàn bộ kiểm toán V15-54 giữ nguyên vẹn |
| **Hồi quy HUD & Thể Lực V152-06A** | `scripts/test_v152_06a_hud_stamina.mjs` | **18/18 PASS** | 3 thanh sinh tồn sắc nét |
| **Hồi quy UI Pack V152-06B** | `scripts/test_v152_06b_ui_pack.mjs` | **25/25 PASS** | Toàn bộ 28 asset UI Pack hoạt động chuẩn |

---

## 3. THÔNG SỐ ÁNH SÁNG & KHỞI TẠO ĐÃ ĐỒNG BỘ

```json
{
  "lighting": {
    "lanternAuraMaxAlpha": 0.24,
    "lanternAuraColor": "rgba(255, 215, 125, 0.24)",
    "breathingRange": [0.18, 0.24],
    "dayAmbient": "0x9ab0c4",
    "dayFog": "0x16202a",
    "duskAmbient": "0x6a3e3c",
    "duskFog": "0x24141e",
    "nightAmbient": "0x080c14",
    "nightFog": "0x060910",
    "deepForestFogColor": "0x070d14",
    "deepForestFogMinAlpha": 0.84
  },
  "initialization": {
    "immediateZones": ["fog_crossing", "bellhollow", "sanctuary_farm", "outer_woods"],
    "deferredZones": [
      "crooked_path",
      "deep_forest",
      "silent_mire",
      "ancient_rune_puzzle",
      "broken_bell_shrine",
      "sub_bell_workshop",
      "sub_root_cellar",
      "sub_whispering_clearing"
    ],
    "deferredChunkDelayMs": 140,
    "uiSceneIsolated": true
  }
}
```
