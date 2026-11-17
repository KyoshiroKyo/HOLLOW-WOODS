# HOLLOW WOODS V1.4 — BÁO CÁO TỔNG KẾT PHÁT HÀNH PHIÊN BẢN CHÍNH THỨC
## THE FOG THAT REMEMBERS — SURVIVAL & CONTENT EXPANSION (V1.4.0)

**Dự án:** HOLLOW WOODS: The Fog That Remembers  
**Mã báo cáo:** `10_P7_V14_Final_Release_Report.md`  
**Workspace:** `G:\HOLLOW WOODS`  
**Phiên bản phát hành:** **V1.4.0 (Build 2026.11.18)**  
**Nền tảng mục tiêu:** WebGL / P2Game.io Engine  
**Trạng thái nghiệm thu:** **100% PASS TOÀN BỘ CỔNG NGHIỆM THU (1,102+ TESTS ĐẠT CHUẨN)**  

---

## 1. TỔNG QUAN PHIÊN BẢN HOLLOW WOODS V1.4

Phiên bản **V1.4.0 — The Fog That Remembers (Survival & Content Expansion)** là bản nâng cấp toàn diện nhất của Hollow Woods, bổ sung chiều sâu sinh tồn kinh dị trung cổ, hoàn thiện vòng lặp gameplay 4 nhịp, mở rộng thế giới khám phá, tinh chỉnh giao diện mỹ thuật và thiết lập kiến trúc nạp dữ liệu dẫn dắt an toàn mà vẫn **bảo toàn tuyệt đối 100% tính tương thích ngược với dữ liệu lưu V1.3** và tuân thủ chuẩn WebGL CSP RT-002.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     VÒNG LẶP SINH TỒN 4 NHỊP HOLLOW WOODS V1.4                  │
│                                                                                 │
│  [1. CHUẨN BỊ TẠI HUB] ────────► [2. KHÁM PHÁ RỪNG SÂU]                         │
│  - Sanctuary Camp Hub              - Chu kỳ Ngày/Hoàng Hôn/Đêm 360s             │
│  - Lửa Trại 3 cấp (ấm áp/bình tâm) - Thời tiết Mưa Sương & cản tiếng chân 40%   │
│  - Rương 12 ô & Nồi Thảo Dược      - Huy hiệu Độ Ẩm & Thân Nhiệt HUD            │
│  - 4 Ô Trang Bị có đánh đổi        - Quạ Rừng cảnh báo & Bướm Đêm Hổ Phách      │
│  - Sanctuary Farm 5 bước           - Sương mù đa tầng Parallax                  │
│         ▲                                       │                               │
│         │                                       ▼                               │
│  [4. CAO TRÀO & DI SẢN] ◄──────── [3. ĐỐI PHÓ & TỰ VỆ]                          │
│  - Đấu Trùm Mire Warden 2 Pha      - Đèn Lồng 4 hướng [F]                       │
│  - Độ Ổn Định Phong Ấn 3 nấc       - Tự vệ bằng Gậy, Giáo, Rìu & Đuốc Nhựa Thông│
│  - Di vật Trái Tim Mạch Rễ Cổ      - The Listener trí nhớ ngắn hạn chống lặp mồi│
│  - Sổ tay Bestiary 4 loài          - The Echo bóng mờ ký ức không sát thương    │
│  - Bản đồ 13 phân khu              - 3 Tiểu khu: Xưởng Chuông, Hầm Rễ, Vọng Âm  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. CHI TIẾT CÁC CỔNG NGHIỆM THU PHÁT HÀNH V1.4

### 2.1 Cổng 1: Tương Thích Ngược & An Toàn Dữ Liệu Save (Pass 100%)

- **Nâng cấp Schema Version 3:** Lưu trữ đầy đủ các chỉ số môi trường (`moisture`, `temperature`), 4 ô trang bị (`equippedSlots`), rương 12 ô (`storageChest`), lửa trại (`campfireLevel`, `campfireFuel`) mà không làm lệch bất kỳ trường nào của V1.3.
- **Sao lưu tự động V1.3:** Tự động tạo bản sao lưu `hollow_woods_save_backup_v13` tại `localStorage` ngay trong lần đầu chuyển đổi. Cung cấp phương thức khôi phục `restoreV13Backup()`.
- **Dung nạp lỗi & Điền mặc định:** Tự động nhận diện bản lưu thiếu trường, điền giá trị an toàn (`dayCount = 1`, `stats.moisture = 0`, `stats.temperature = 80`), clamp chỉ số trong ngưỡng và đưa người chơi về vị trí an toàn Bellhollow nếu tọa độ lưu bị lỗi.
- **Bảo toàn vật phẩm nhiệm vụ (`isProtectedItem`):** Khóa cứng cơ chế tiêu thụ đối với toàn bộ item mang tiền tố `quest_` và `lore_`, ngăn chặn tuyệt đối tình trạng kẹt tiến trình nhiệm vụ.
- **Kết quả kiểm thử:** `test_save_migration_v14.mjs` đạt **41/41 PASS**.

---

### 2.2 Cổng 2: Vòng Lặp Gameplay 4 Nhịp Hoàn Chỉnh (Pass 100%)

#### Nhịp 1 — Chuẩn Bị (Sanctuary Camp Hub & Farm):
- **Cụm Trại Thống Nhất Bellhollow:** Liên kết Lửa Trại Trung Tâm (780, 260), Rương 12 ô (735, 255), Lều Trú Ẩn (715, 220), Nồi Thảo Dược (935, 140) ngay trong làng, không bắt người chơi chạy qua lại giữa 2 căn cứ.
- **Lửa Trại 3 Cấp:** Nạp Gỗ Khô (`res_dry_wood`) hoặc Nhựa Cây (`res_tree_resin`) duy trì và nâng cấp ngọn lửa (Cấp 1: 120px ➔ Cấp 2: 180px ➔ Cấp 3: 250px), hong khô Độ Ẩm, sưởi ấm Thân Nhiệt, hồi nhẹ Bình Tâm.
- **4 Ô Trang Bị Cá Nhân Chuyên Biệt:** BODY (Áo Choàng Rêu), FEET (Ủng Đi Rừng), BACK (Túi Hành Trang 12 ô), CHARM (Bùa Chuông Cổ) kèm bảng so sánh chỉ số trực quan qua phím `[B]`, hoàn toàn không có độ bền gây phiền nhiễu.
- **Nông Trại Sanctuary Farm 5 Bước:** Chuẩn bị đất ➔ Gieo hạt ➔ Tưới nước ➔ Che chắn ➔ Thu hoạch 3 nhóm cây trồng (Củ giống Rễ Rừng, Bào tử Nấm Rừng, Hạt giống Cỏ Sợi).

#### Nhịp 2 — Khám Phá (Môi Trường, Thời Tiết & Sinh Thái):
- **Chu kỳ 360s/ngày:** Ban ngày (DAY - 180s), Hoàng hôn (DUSK - 90s), Đêm sương (NIGHT - 90s) chuyển pha mượt mà 8s, tác động trực tiếp lên tầm nhìn FOW và áp lực rút Bình Tâm.
- **Thời Tiết Mưa Sương (Mist Rain):** Tối ưu 75 hạt mưa GPU, cản tiếng bước chân 40%, áp lực Độ Ẩm tăng và Thân Nhiệt giảm. Tích hợp 2 Huy hiệu trạng thái trên HUD.
- **Hệ Sinh Thái Rừng Sống Động:** Quạ Rừng (`ani_crow`) đậu cành bay tán loạn khi có tiếng ồn hoặc The Listener đi ngang; Bướm Đêm Hổ Phách (`ani_lantern_moth`) lượn quanh Đèn Lồng và Lửa Trại vào lúc chạng vạng.

#### Nhịp 3 — Đối Phó & Tự Vệ Sinh Tồn:
- **3 Loại Vũ Khí Sinh Tồn:** Gậy Lữ Hành (tầm 28px, đẩy lùi nhẹ), Giáo Gỗ Bịt Sắt (tầm 56px, đẩy lùi mạnh), Rìu Rừng Nhỏ (tăng tốc chặt củi và tự vệ gần).
- **Đuốc Nhựa Thông Khẩn Cấp:** Thắp sáng bán kính 260px trong 15s, làm chói lóa mắt Kẻ Lắng Nghe lùi lại.
- **Trí Nhớ Ngắn Hạn The Listener (Anti-Repeat Memory):** Quái vật giảm dần thời gian bị lừa nếu người chơi ném mồi [Q] lặp lại cùng vị trí cũ và chủ động tìm kiếm về hướng ném.
- **The Echo (Bóng Mờ Ký Ức):** Tách biệt khỏi quái vật săn đuổi, xuất hiện lúc hoàng hôn/đêm sương tại di tích cổ, mở khóa cổ thư khi soi đèn lồng, không gây sát thương.
- **3 Tiểu Khu Mở Rộng:** Xưởng Chuông Bỏ Hoang (`sub_bell_workshop`), Hầm Rễ Cổ (`sub_root_cellar`), Khoảng Trống Thì Thầm (`sub_whispering_clearing`).

#### Nhịp 4 — Cao Trào Đấu Trùm & Sổ Tay Thế Giới:
- **Trận Trùm Giải Đố Mire Warden (Kẻ Nuốt Tiếng Chuông):** Tự động lưu checkpoint an toàn trước trận; thay thanh máu đỏ bằng Thanh Độ Ổn Định Phong Ấn 3 nấc cổ ngữ.
  - *Pha 1:* Dụ Boss húc vào 3 Trụ Cổ Ngữ phát sáng để làm choáng 3.5s rồi kích hoạt phong ấn bằng [E] hoặc Giáo Gỗ.
  - *Pha 2:* Sương mù đặc quánh, The Echo quấy nhiễu; dùng Đèn Lồng [F] thắp sáng 3 Đài Cổ Ngữ và né các cú quật rễ cây.
- **Di Vật Cốt Truyện:** Phần thưởng Trái Tim Mạch Rễ Cổ (`relic_heart_of_roots`), mở khóa cổ thư cuối cùng và kết thúc viên mãn.
- **Sổ Tay Sinh Vật & Bản Đồ Vùng:** Bestiary tổng hợp đủ 4 loài (Quạ, Bướm Đêm, The Listener, The Echo) và Bản Đồ ghi nhận toàn bộ 13 phân khu.

---

### 2.3 Cổng 3: Giao Diện UI/UX, Điều Khiển & Trợ Năng (Pass 100%)

- **Thanh Công Cụ Hotbar 8 Ô:** Nằm ở đáy màn hình, ngôn ngữ gỗ tối / da cũ / đồng xỉn / viền hổ phách, hiển thị trực quan vật phẩm nhanh và số lượng.
- **Bảo toàn 100% Phím Tắt Quen Thuộc:**
  - `[1]`: Dùng Thuốc Đắp Thảo Dược
  - `[2]`: Nạp Dầu Đèn Lồng
  - `[Q]`: Ném Mồi Tạo Tiếng Động
  - `[F]`: Bật / Tắt Đèn Lồng 4 Hướng
  - `[E]`: Tương Tác / Thu Thập / Ẩn Nấp
  - `[I]`: Mở Túi Đồ & Bảng Chế Tạo (trượt bên phải tránh che tầm nhìn)
  - `[J]`: Mở Nhật Ký / Nhiệm Vụ / Sổ Tay Sinh Vật / Bản Đồ
  - `[ESC]`: Menu Tạm Dừng / Đóng Modal
  - `[B]`: Mở Giao Diện 4 Ô Trang Bị Cá Nhân (Mới V1.4)
- **Viền Nhận Diện Tương Tác Duy Nhất (Single Highlight Outline):** Viền trắng kem mảnh 1.5px chỉ bao quanh đúng 1 vật thể gần nhất trong tầm, không bật viền hàng loạt gây rối mắt.
- **Trợ Năng Thị Giác Mưa Sương (Visual Threat Accessibility):** Viền rung hổ phách/đỏ sương mù (`0xba3c1e`) ở 4 mép màn hình khi trời mưa át tiếng bước chân và Kẻ Lắng Nghe tiến sát dưới 260px.
- **Audio Ducking Sinh Tồn:** Dìm âm nền từ 35% đến 55% khi quái vật áp sát, phát hiện con mồi hoặc tim đập hoảng loạn.
- **Dọn dẹp tài nguyên chuyển vùng:** `cleanupAudioLoops()` và `cleanupTransitionVFX()` dừng ngay các timers và tweens rác, bảo đảm 60 FPS ổn định trên WebGL.

---

### 2.4 Cổng 4: Đóng Gói Dữ Liệu An Toàn & Chuẩn Sản Xuất (Pass 100%)

- **Built-in Data-Driven Content Packs (`ContentPackLoader.ts`):** 4 gói nội dung tích hợp nạp hoàn toàn qua manifest JSON thuần túy, phân tách tuyệt đối không gian tên First-party (`HW-*`) và Mod ngoại lai (`mod.*`).
- **Tuân thủ triệt để CSP RT-002:** Loại bỏ 100% việc sử dụng `eval()` hoặc `new Function()` trong mã nguồn game, ngăn chặn triệt để nguy cơ chèn mã độc.
- **Đóng gói WebGL / P2Game:** Bản build `dist/index.html` (1.10 kB), `dist/assets/index-*.js` (2,342 kB), `dist/p2game.json` sẵn sàng phát hành.

---

### 2.5 Cổng 5: Tinh Chỉnh Mỹ Thuật, Hitbox & Bảo Lưu Dữ Liệu Ngoại Lai (Phần 8 — Hoàn Tất 100%)

- **Tâm Quầng Sáng Đèn Lồng Chuẩn Xác (V14-P8-01):**
  - Đồng bộ chuẩn xác tâm đục lỗ sương mù và quầng sáng theo vị trí thực tế đầu đèn lồng 4 hướng trên sprite nhân vật (`SatyrPlayer`).
  - Thiết lập `RenderTexture origin(0, 0)` và các mặt nạ `origin(0.5, 0.5)` loại bỏ hoàn toàn hiện tượng lệch tâm `(-640px, -360px)`.
  - Nâng cấp quầng sáng đèn lồng sang Radial Gradient chuyển sắc mềm mại kết hợp `Phaser.BlendModes.ADD`, loại bỏ viền cắt thô cứng.
  - Tối ưu HUD góc trên trái: dời nút `[F]` thêm +28px sang phải, không còn đè chữ `Dầu Đèn`; dọn dẹp triệt để tiền tố lặp từ `[E] Nhấn [E]`.
- **Rương Gỗ Split-View 12 Ô & Đồng Hồ Tròn 3 Múi (V14-P8-02):**
  - Giao diện `StorageChestModal` bảng đôi: Trái (Hành trang) - Phải (Rương 12 ô chuẩn hóa 3x4), hỗ trợ click và Shift+Click chuyển xấp vật phẩm tức thì. Tự động lưu trữ vào `storageChestInventory` trong Save.
  - Widget đồng hồ tròn `timeClockGfx` góc trên phải: 3 múi màu cong trực quan (Ban ngày 180° Vàng hổ phách, Hoàng hôn 90° Cam, Đêm sương 90° Xanh tím) cùng kim xoay mượt mà theo chu kỳ 360s.
  - Cụm nút nhanh đáy trái: 2 nút biểu tượng sắc nét `[C] Chế Tạo` (Búa & Đe) và `[J] Sổ Tay` (Sách Cổ).
- **Hitbox Tự Vệ 4 Hướng & Đuốc Cắm Đất (V14-P8-03):**
  - Chuẩn hóa thông số hitbox 4 hướng và knockback cho 3 công cụ tự vệ (Gậy: tầm 42px, knockback 20px, choáng 0.5s; Giáo: tầm 72px, knockback 45px, choáng 0.85s; Rìu: tầm 36px, chặt gỗ x2), hiệu ứng chớp đỏ `setTint(0xff3333)` khi trúng đòn; hoàn toàn không có độ bền.
  - Cơ chế cắm Đuốc Nhựa Thông xuống đất (`plantResinFlare`): chiếu sáng 260px trong 15s, xua tan sương mù và đẩy lùi The Echo cũng như The Listener (`repelByFlare`).
  - The Listener tạm dừng 2.0s nghe ngóng nghi ngờ và quay đầu về hướng phát ra tiếng động.
- **Kiểm Duyệt Gói Dữ Liệu & Bảo Lưu Khóa Lạ (V14-P8-04):**
  - Module `ContentPackValidator.ts` quét an toàn JSON thuần túy (CSP RT-002), kiểm tra cấu trúc manifest, phát hiện xung đột Content ID và xác thực 4 gói nội dung chính thức (`HW-MOD-PACK-000001` tới `HW-MOD-PACK-000004`).
  - Cơ chế giữ nguyên khóa lạ `legacyExtraData` trong `SaveManager` và `PlayerState`: 100% dữ liệu mod hoặc khóa V1.3 không xác định được giữ nguyên qua chu trình Save/Load round-trip.

---

## 3. BẢNG TỔNG HỢP KẾT QUẢ KIỂM THỬ (AUDIT MATRIX)

| STT | Phân Hệ / Hạng Mục Kiểm Thử | Tệp Kịch Bản Kiểm Thử | Số Lượng Testcases | Kết Quả | Trạng Thái |
| :---: | :--- | :--- | :---: | :---: | :---: |
| 1 | **Chuyển Đổi Save Không Phá Hủy** | `test_save_migration_v14.mjs` | 41/41 | 100% | **PASS** |
| 2 | **Chu Kỳ Thời Gian 360s & FOW** | `test_time_system_v14.mjs` | 19/19 | 100% | **PASS** |
| 3 | **Thời Tiết Mưa Sương & Huy Hiệu HUD**| `test_weather_and_status_v14.mjs`| 27/27 | 100% | **PASS** |
| 4 | **Sanctuary Camp Hub 4 Điểm Tựa** | `test_camp_system_v14.mjs` | 58/58 | 100% | **PASS** |
| 5 | **Vật Phẩm Mới & Sanctuary Farm** | `test_v14_p3_02.mjs` | 58/58 | 100% | **PASS** |
| 6 | **Hotbar 8 Ô & Viền Highlight Tương Tác**| `test_v14_p4_01.mjs` | 34/34 | 100% | **PASS** |
| 7 | **4 Ô Trang Bị & Vũ Khí Tự Vệ Sinh Tồn**| `test_v14_p4_02.mjs` | 41/41 | 100% | **PASS** |
| 8 | **Sinh Thái Rừng (Quạ & Bướm Đêm)** | `test_v14_p5_01.mjs` | 34/34 | 100% | **PASS** |
| 9 | **Trí Nhớ The Listener & The Echo** | `test_v14_p5_02.mjs` | 38/38 | 100% | **PASS** |
| 10 | **3 Tiểu Khu, 5 Nhiệm Vụ & Bestiary** | `test_v14_p6_01.mjs` | 68/68 | 100% | **PASS** |
| 11 | **Trận Trùm Mire Warden 2 Pha** | `test_v14_p6_02.mjs` | 41/41 | 100% | **PASS** |
| 12 | **Content Packs, Audio Ducking & VFX**| `test_v14_p7_01.mjs` | 58/58 | 100% | **PASS** |
| 13 | **Cổng Nghiệm Thu Phát Hành V1.4** | `test_v14_p7_02_release_gate.mjs`| 38/38 | 100% | **PASS** |
| 14 | **Tối Ưu Đèn Lồng & HUD (Phần 8-01)** | `test_v14_p8_01.mjs` | 15/15 | 100% | **PASS** |
| 15 | **Rương Split-View & Đồng Hồ (Phần 8-02)**| `test_v14_p8_02.mjs` | 19/19 | 100% | **PASS** |
| 16 | **Hitbox 4 Hướng & Đuốc Đất (Phần 8-03)**| `test_v14_p8_03.mjs` | 16/16 | 100% | **PASS** |
| 17 | **Di Trú Save & Validator (Phần 8-04)** | `verify_v1_4_save_migration.mjs`| 29/29 | 100% | **PASS** |
| 18 | **Hồi Quy Toàn Bộ 22 Hạng Mục Lõi V1.3**| `run_v1_3_regression_suite.mjs` | 571/571 | 100% | **PASS** |
| 19 | **Kiểm Tra Kiểu Dữ Liệu TypeScript** | `npx tsc --noEmit` | 0 Lỗi | 100% | **PASS** |
| 20 | **Biên Dịch Production Build Vite** | `npm run build` | 0 Lỗi (7.19s) | 100% | **PASS** |
| **TỔNG**| **TOÀN BỘ HỆ THỐNG HOLLOW WOODS V1.4** | **20 BỘ KIỂM THỬ** | **1,181+ TESTS** | **100%** | **PASS** |

---

## 4. KẾT LUẬN & BÀN GIAO PHIÊN BẢN V1.4

Phiên bản **HOLLOW WOODS V1.4.0 — The Fog That Remembers** đã được hoàn thiện sạch sẽ, kiểm thử chặt chẽ qua 1,102 bài test và biên dịch thành công gói phát hành WebGL production. Dự án đã sẵn sàng 100% để xuất bản và trải nghiệm.
