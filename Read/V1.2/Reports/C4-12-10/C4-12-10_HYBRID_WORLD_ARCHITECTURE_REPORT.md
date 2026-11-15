# HOLLOW WOODS V1.2 — BÁO CÁO KỸ THUẬT C4-12-10
## THIẾT LẬP KIẾN TRÚC KỸ THUẬT MÔ HÌNH THẾ GIỚI MỞ LAI (HYBRID OPEN WORLD — PHƯƠNG ÁN C)

- **Mã lệnh:** `COMMAND C4-12-10`
- **Dự án:** HOLLOW WOODS V1.2 (*Dị Cảnh Rừng Liễu — The Fog That Remembers*)
- **Thư mục làm việc:** `G:\HOLLOW WOODS`
- **Mô hình thế giới:** **World Structure C — Hybrid Open World (Thế Giới Mở Lai 3 Tầng)**
- **Định hướng mỹ thuật:** **Visual Direction A — Dark Woodland Pixel Art**
- **Trạng thái thực thi:** **HOÀN TẤT THÀNH CÔNG (83/83 TIÊU CHÍ QC ĐẠT 100%)**
- **Bản sao lưu trước khi sửa:** `Backups/C4-12-10_PRE_BACKUP/` (WorldBuilder, GameScene, zones, PlayerState, SaveManager).

---

## 1. TỔNG QUAN VÀ MỤC TIÊU THỰC HIỆN

Thực hiện chỉ đạo chính thức từ Project Owner và sơ đồ kiến trúc V1.2 (`media_1794701767054_833c3668.jpg`, `media_1794701775008_a29f0b18.jpg`), bước **C4-12-10** thiết lập toàn bộ nền tảng kiến trúc kỹ thuật, cấu trúc dữ liệu, hệ thống phân tầng và cơ chế kiểm soát chuyển vùng cho mô hình **Thế Giới Mở Lai (Hybrid Open World — Phương án C)**:
1. **Phân chia 3 Tầng thế giới (World Tiers):** Chuẩn hóa 9 phân khu với mã ID ổn định, xác định rõ quyền tự do khám phá và ranh giới phong ấn theo tiến trình cốt truyện.
2. **Cơ chế kiểm soát mở khóa tập trung (`WorldGatingSystem`):** Xây dựng lớp quản lý quy tắc truy cập vùng tập trung, triệt tiêu việc viết cứng điều kiện rải rác trong mã nguồn, trả về thông điệp và gợi ý tiếng Việt rõ ràng khi vùng bị khóa.
3. **Cấu trúc ranh giới, điểm sinh (Spawn Points) và kết nối đi/về:** Đồng bộ trong `zones.json` với tọa độ thực tế, thuật toán phát hiện vùng ưu tiên diện tích nhỏ (`sortedZones`) giúp phân giải chính xác các sub-zone.
4. **Bảo tồn dữ liệu và tương thích lưu trữ (Save/Load):** Ghi nhận các vùng đã khám phá (`visitedZones`) trong `PlayerState` và lưu trữ bền vững qua `SaveManager`, bảo đảm tương thích 100% với các bản save cũ.
5. **Tuân thủ giới hạn phạm vi:** Chỉ thiết lập khung kiến trúc, cấu trúc dữ liệu và logic kết nối kỹ thuật — chưa vẽ chi tiết đồ họa địa hình cho các bản đồ mới (dành riêng cho chuỗi lệnh `C4-12-17` đến `C4-12-25`).

---

## 2. PHÂN TẦNG VÀ DANH MỤC 9 PHÂN KHU THẾ GIỚI V1.2

```text
                               ┌────────────────────────────────────────────────┐
                               │             Broken Bell Shrine                 │
                               │          (Tầng 3: Miếu Chuông Cổ)              │
                               └───────────────────────▲────────────────────────┘
                                                       │ (Mire Puzzle Solved)
                               ┌───────────────────────┴────────────────────────┐
                               │           Ancient Rune Puzzle                  │
                               │        (Tầng 3: Trận Địa Cổ Ngữ)               │
                               └───────────────────────▲────────────────────────┘
                                                       │ (Quest Q04: Clues)
                               ┌───────────────────────┴────────────────────────┐
                               │                  Silent Mire                   │
                               │          (Tầng 3: Đầm Lầy Tĩnh Lặng)           │
                               └───────────────────────▲────────────────────────┘
                                                       │ (Quest Q04: Enter)
      ┌────────────────────────────────────────────────┴────────────────────────┐
      │                               Deep Forest                               │
      │                  (Tầng 2: Rừng Sâu — Lãnh Địa The Listener)             │
      └────────────────────────────────────────▲────────────────────────────────┘
                                               │ (Explore / Stealth)
      ┌────────────────────────────────────────┴────────────────────────────────┐
      │                             The Crooked Path                            │
      │                  (Tầng 2: Đường Mòn Quanh Co — Tiền Tuyến)              │
      └────────────────────────────────────────▲────────────────────────────────┘
                                               │ (Quest Q03: Cổng Đông mở)
 ══════════════════════════════════════════════╪══════════════════════════════════════════════
               RANH GIỚI BẢO VỆ VÙNG LÕI (CỔNG ĐÔNG LÀNG BELLHOLLOW)
 ══════════════════════════════════════════════╪══════════════════════════════════════════════
      ┌────────────────────────────────────────┴────────────────────────────────┐
      │                               Outer Woods                               │
      │                   (Tầng 1: Rừng Ngoại Vi — Khám Phá Tự Do)              │
      └────────────────────────────────────────▲────────────────────────────────┘
                                               │ (Kết nối tự do vành đai)
 ┌───────────────────────┐             ┌───────┴───────┐             ┌────────────────────────┐
 │      Fog Crossing     │ ──────────> │   Bellhollow  │ <─────────> │     Sanctuary Farm     │
 │  (Tầng 1: Lối Mòn Mở) │             │  (Tầng 1: Lõi)│             │ (Tầng 1: Nông Trại)    │
 └───────────────────────┘             └───────────────┘             └────────────────────────┘
```

### 2.1. Tầng 1 — Core World (Vùng Lõi tự do mở từ đầu)
- **Quy tắc truy cập:** `always_unlocked` (Mở tự do ngay từ đầu game, là khu vực an toàn không có quái vật săn đuổi).
- **Các phân khu trực thuộc:**
  1. `fog_crossing` (*Lối Mòn Xuyên Sương*): Ranh giới mở đầu ($480 \times 360\text{ px}$), nơi người chơi tỉnh giấc và nghe tiếng chuông ngân dẫn lối.
  2. `bellhollow` (*Làng Chuông Cổ*): Trung tâm sinh hoạt ($1120 \times 960\text{ px}$), nơi tọa lạc Tháp Chuông, Giếng Nước, Bàn Chế Tạo, các ngôi nhà và 3 NPC cốt lõi (Garth, Edda, Neris).
  3. `sanctuary_farm` (*Nông Trại Trú Ẩn*): Khu vực phía Nam làng ($640 \times 480\text{ px}$), cung cấp đất trồng thảo mộc, nguồn nước sinh hoạt và rương trữ đồ an toàn.
  4. `outer_woods` (*Rừng Ngoại Vi*): Vành đai rừng ven làng ($480 \times 480\text{ px}$), cung cấp tài nguyên gỗ khô, nhựa thông, đá lửa và thảo dược cơ bản cho giai đoạn đầu game.

### 2.2. Tầng 2 — Frontier (Vùng Biên viễn mở dần theo nhiệm vụ)
- **Quy tắc truy cập:** `quest_required` (Mở khóa sau khi chế tạo thành công Dầu Đèn và Cổng Đông mở tại Hồi 3: `Q03_PREPARE_RESOURCES`).
- **Các phân khu trực thuộc:**
  5. `crooked_path` (*Đường Mòn Quanh Co*): Địa hình quanh co hiểm trở ($1280 \times 640\text{ px}$), nhiều ngã rẽ, sương mù dày hơn và các hốc cây ẩn nấp.
  6. `deep_forest` (*Rừng Sâu*): Vùng rừng rậm ngột ngạt phía Bắc ($1280 \times 640\text{ px}$), nơi thực thể *The Listener* tuần tra gắt gao; chứa mỏ nhựa thông cổ thụ và lối mòn bí mật.

### 2.3. Tầng 3 — Forbidden Regions (Vùng Cấm mở khóa theo cốt truyện)
- **Quy tắc truy cập:** `flag_required` / `custom_eval` (Khóa chặt theo tiến trình phá giải bí ẩn tại Hồi 4 & Hồi 5).
- **Các phân khu trực thuộc:**
  7. `silent_mire` (*Đầm Lầy Tĩnh Lặng*): Vùng trũng ngập nước đen kịt ($1120 \times 640\text{ px}$), sương độc ăn mòn tâm lý, đòi hỏi ngọn đèn lồng luôn thắp sáng.
  8. `ancient_rune_puzzle` (*Khu Vực Câu Đố Cổ Ngữ*): Trận địa linh thiêng ($350 \times 280\text{ px}$) gồm 3 Cột Đá Cổ Ngữ (Mặt Trăng, Rễ Cây, Con Mắt) ẩn chứa cơ chế mở đường.
  9. `broken_bell_shrine` (*Miếu Chuông Phế Tích*): Điểm đến cuối cùng ($960 \times 600\text{ px}$), nơi cất giấu *Lưỡi Chuông Đồng Cổ* và mở ra đại kết cục của HOLLOW WOODS.

---

## 3. THIẾT KẾ HỆ THỐNG KIỂM SOÁT MỞ KHÓA TẬP TRUNG (WORLDGATINGSYSTEM)

Lớp quản lý `WorldGatingSystem` được đặt tại [src/world/WorldGatingSystem.ts](file:///G:/HOLLOW%20WOODS/src/world/WorldGatingSystem.ts) hoạt động theo mẫu Singleton:

```typescript
export interface TransitionEvaluation {
  allowed: boolean;
  reason?: string;
  hint?: string;
  tier: WorldTier;
  targetZoneId: ZoneId;
}

export class WorldGatingSystem {
  public isZoneUnlocked(zoneId: ZoneId, playerState: PlayerState): boolean;
  public evaluateTransition(fromZone: ZoneId, toZone: ZoneId, playerState: PlayerState): TransitionEvaluation;
  public getZoneTier(zoneId: ZoneId): WorldTier;
  public getZonesByTier(tier: WorldTier): ZoneId[];
}
```

### Ưu điểm vượt trội của kiến trúc tập trung:
- **Triệt tiêu mã lệnh trùng lặp:** Thay vì viết các câu lệnh `if (quest === ...)` rải rác ở `GameScene.ts`, `WorldBuilder.ts` và `SaveManager.ts`, toàn bộ điều kiện mở vùng được quy tụ về một nguồn chân lý duy nhất.
- **Phản hồi người chơi rõ ràng (UX Clarity):** Khi người chơi cố gắng vượt ranh giới vùng bị khóa, hệ thống cung cấp lý do bị chặn và lời gợi ý nhiệm vụ chính xác (Ví dụ: *"🔒 Cổng Đông đang khóa chặt! Hãy gặp Neris và chế tạo Dầu Đèn [Phím I] trước khi vào Rừng Cấm."*).
- **Thuật toán nhận diện phân khu tối ưu:** Trong `WorldBuilder.ts:detectCurrentZone()`, danh sách các vùng được sắp xếp theo diện tích tăng dần (`areaA - areaB`), đảm bảo các vùng lồng nhau (như trận địa rune nằm trong đầm lầy) luôn được nhận diện chính xác $100\%$.

---

## 4. TƯƠNG THÍCH LƯU TRỮ (SAVE / LOAD) & TRẠNG THÁI BỀN VỮNG

- **PlayerState.ts:** Bổ sung thuộc tính `visitedZones: Set<string>`, hàm `markZoneVisited(zoneId)` phát sự kiện `'zone_visited'`, và các hàm kiểm tra `hasVisitedZone()`, `getVisitedZones()`.
- **SaveManager.ts:** Thuộc tính `visitedZones` được lưu vào đối tượng `SaveData` JSON trong LocalStorage. Khi tải bản lưu cũ (chưa có `visitedZones`), hệ thống tự động thiết lập mặc định an toàn `['fog_crossing', 'bellhollow']` mà không gây lỗi phân tích cú pháp.

---

## 5. KẾT QUẢ KIỂM TRA CHẤT LƯỢNG TỰ ĐỘNG (QC VERIFICATION)

Script kiểm định tự động [verify_hybrid_world_architecture_c4_12_10.mjs](file:///G:/HOLLOW%20WOODS/scripts/verify_hybrid_world_architecture_c4_12_10.mjs) đã kiểm tra toàn bộ 83 tiêu chí độc lập:

```text
================================================================
QA / QC VERIFICATION SUITE — COMMAND C4-12-10
KIẾN TRÚC KỸ THUẬT MÔ HÌNH THẾ GIỚI MỞ LAI (HYBRID OPEN WORLD C)
================================================================

--- 1. KIỂM TRA ĐỊNH NGHĨA KIỂU DỮ LIỆU & WORLD TIERS ---
  [PASS] #1..#9: 9/9 TIÊU CHÍ ĐẠT (WorldTier, ZoneId, ZoneAccessRule, ZoneSpawnPoint)

--- 2. KIỂM TRA DỮ LIỆU 9 PHÂN KHU TRONG ZONES.JSON ---
  [PASS] #10..#64: 55/55 TIÊU CHÍ ĐẠT (9 phân khu: bounds, defaultSpawn, atmosphere, transitions)

--- 3. KIỂM TRA HỆ THỐNG QUY TẮC WORLDGATINGSYSTEM ---
  [PASS] #65..#72: 8/8 TIÊU CHÍ ĐẠT (Singleton, evaluation, rules cho 3 tầng)

--- 4. KIỂM TRA BỀN VỮNG DỮ LIỆU & TƯƠNG THÍCH LƯU TRỮ ---
  [PASS] #73..#79: 7/7 TIÊU CHÍ ĐẠT (PlayerState visitedZones, SaveManager save/load)

--- 5. KIỂM TRA TÍCH HỢP GAMESCENE & WORLDBUILDER ---
  [PASS] #80..#83: 4/4 TIÊU CHÍ ĐẠT (evaluateTransition, markZoneVisited, sortedZones)

================================================================
KẾT QUẢ KIỂM TRA KIẾN TRÚC THẾ GIỚI HYBRID C4-12-10: 83/83 TIÊU CHÍ ĐẠT (100%)
STATUS: ALL HYBRID WORLD ARCHITECTURE CHECKS PASSED (100% HOÀN TẤT C4-12-10)
================================================================
```

---

## 6. DANH SÁCH FILE LIÊN QUAN

- Hệ thống quy tắc mở vùng: [WorldGatingSystem.ts](file:///G:/HOLLOW%20WOODS/src/world/WorldGatingSystem.ts)
- Dữ liệu 9 phân khu thế giới: [zones.json](file:///G:/HOLLOW%20WOODS/src/data/zones.json)
- Định nghĩa kiểu dữ liệu toàn cục: [index.ts](file:///G:/HOLLOW%20WOODS/src/types/index.ts)
- Quản lý trạng thái người chơi: [PlayerState.ts](file:///G:/HOLLOW%20WOODS/src/state/PlayerState.ts)
- Quản lý lưu trữ & nạp game: [SaveManager.ts](file:///G:/HOLLOW%20WOODS/src/systems/SaveManager.ts)
- Xây dựng thế giới: [WorldBuilder.ts](file:///G:/HOLLOW%20WOODS/src/world/WorldBuilder.ts)
- Quản lý gameplay & chuyển vùng: [GameScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts)
- Script kiểm định tự động: [verify_hybrid_world_architecture_c4_12_10.mjs](file:///G:/HOLLOW%20WOODS/scripts/verify_hybrid_world_architecture_c4_12_10.mjs)
- Thư mục sao lưu an toàn: [C4-12-10_PRE_BACKUP](file:///G:/HOLLOW%20WOODS/Backups/C4-12-10_PRE_BACKUP/)
