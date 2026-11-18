# HOLLOW WOODS V1.4 — BÁO CÁO PHÁT TRIỂN PHẦN 7 (BƯỚC V14-P7-01)
## HỆ THỐNG GÓI DỮ LIỆU CONTENT PACKS, CÂN BẰNG ÂM THANH & TRỢ NĂNG THỊ GIÁC TOÀN CỤC

**Phân hệ:** Data Architecture, Audio Ducking, Visual Accessibility & Resource Cleanup  
**Mã báo cáo:** `09_P7_ContentPacks_And_QA_Report.md`  
**Workspace:** `G:\HOLLOW WOODS`  
**Ngày thực hiện:** 18/11/2026  
**Trạng thái kiểm thử:** **100% PASS (58/58 P7 Tests & 571/571 Regression Tests)**  

---

## 1. TỔNG QUAN MỤC TIÊU BƯỚC V14-P7-01

Triển khai cấu trúc gói nội dung dữ liệu dẫn dắt (Built-in Data-Driven Content Packs) an toàn theo chuẩn WebGL / P2Game, tối ưu thứ bậc ưu tiên âm thanh sinh tồn (Audio Priority Ducking), bổ sung trợ năng thị giác nguy hiểm khi tiếng bước chân bị mưa sương làm nhòe và thu dọn tài nguyên vòng lặp chuyển cảnh:

1. **Bộ nạp gói dữ liệu an toàn (`src/registry/ContentPackLoader.ts`)**: Cấu trúc manifest tiêu chuẩn, tích hợp sẵn 4 gói nội dung lớn, phân tách tuyệt đối không gian tên First-party (`HW-*`) và Mod ngoại lai (`mod.*`), từ chối mọi mã thực thi động (`eval`, `script`) tuân thủ nghiêm ngặt CSP RT-002, hỗ trợ bật/tắt an toàn.
2. **Cân bằng âm thanh & Ducking sinh tồn (`src/audio/AudioManager.ts`)**: Tự động dìm âm nền và thời tiết từ 35% đến 55% khi xuất hiện các tín hiệu sống còn (tiếng bước chân Kẻ Lắng Nghe, tiếng quạ thét báo động, tiếng tim đập hoảng loạn). Dọn dẹp sạch sẽ loop và timer khi chuyển vùng.
3. **Trợ năng thị giác sương mù & Dọn dẹp VFX (`src/systems/VeilSystem.ts`, `src/scenes/GameScene.ts`)**: Viền rung hổ phách/đỏ sương mù hiển thị cảnh báo khi mưa sương át âm thanh và kẻ săn mồi tiến sát dưới 260px. Giải phóng toàn bộ tween và overlay khi chuyển cảnh.

---

## 2. KIẾN TRÚC GÓI NỘI DUNG BUILT-IN DATA-DRIVEN CONTENT PACKS

### 2.1 Cấu trúc Manifest & Entry Tiêu Chuẩn

Mỗi gói nội dung được định nghĩa qua giao diện dữ liệu thuần túy (Pure Data Interfaces):

```typescript
export interface ContentPackEntry {
  id: string;               // HW-[TYPE]-[SUBTYPE]-[SEQ] hoặc mod.<author>.<pack>.<type>.<id>
  type: string;             // ITM, EQP, ANI, MON, ZONE, QST
  subType?: string;          // MAT, FOOD, CAMP, RLC, BODY, FEET, BACK, CHARM, AMBIENT, BOSS
  slug: string;             // Khóa định danh runtime tương thích ngược
  nameVi: string;           // Tên tiếng Việt hiển thị
  nameEn?: string;          // Tên tiếng Anh hiển thị
  runtimeKey?: string;      // Runtime item key
  aliases?: string[];       // Danh sách alias tương thích Save cũ
  tags?: string[];          // Nhãn phân loại nghiệp vụ
  metadata?: Record<string, unknown>;
}

export interface ContentPackManifest {
  packId: string;
  name: string;
  nameVi?: string;
  version: string;
  description?: string;
  author: string;
  isBuiltIn?: boolean;
  dependencies?: string[];
  contentEntries: ContentPackEntry[];
}
```

### 2.2 Đăng Ký 4 Gói Nội Dung Tích Hợp Sẵn

Hệ thống tự động nạp sẵn 4 gói nội dung cốt lõi của V1.4:

| Mã Gói (`packId`) | Tên Gói Nội Dung | Phụ Thuộc | Nội Dung Trọng Tâm |
| :--- | :--- | :---: | :--- |
| **`pack_wildlife`** | Woodland Wildlife Pack | Không | Quạ Rừng (`HW-ANI-AMBIENT-000001`), Bướm Đêm Hổ Phách (`HW-ANI-AMBIENT-000002`). |
| **`pack_equipment`** | Survival Equipment Pack | Không | Áo Choàng Rêu, Ủng Đi Rừng, Túi Hành Trang, Bùa Chuông Cổ, Gậy Lữ Hành, Giáo Gỗ, Rìu Rừng Nhỏ. |
| **`pack_camp_cooking`** | Camp & Cooking Pack | Không | Lửa Trại 3 cấp (`HW-ITM-CAMP-000001`), Nồi Nấu, Trà An Thần, Nấm Nướng, Súp Rễ, Than Củi, Dây Thừng Rừng, Phụ Kiện Sắt Cổ Ngữ. |
| **`pack_relics`** | Ancient Relics Pack | `pack_equipment` | Kẻ Nuốt Tiếng Chuông (`HW-MON-BOSS-000001`), Trái Tim Mạch Rễ Cổ (`HW-ITM-RLC-000003`), Cổ Thư Chuông. |

### 2.3 Phân Tách Không Gian Tên & Bảo Mật Sandbox

- **First-party Canonical ID:** Bắt buộc tuân thủ biểu thức chính quy `^HW-[A-Z]{3,4}-[A-Z0-9_]{3,8}-[0-9]{6}$`.
- **Third-party Mod ID:** Bắt buộc theo định dạng phân cấp `^mod\.[a-z0-9_]+\.[a-z0-9_]+\.[a-z0-9_]+\.[a-z0-9_]+$`.
- **An toàn CSP RT-002:** Quét sạch mọi chuỗi JSON đầu vào; tuyệt đối không chấp nhận các token nguy hiểm như `<script`, `javascript:`, chuỗi thực thi động `eval` hay `Function`. Chỉ chấp nhận JSON thuần túy, loại bỏ mọi nguy cơ chèn mã độc vào WebGL runtime.
- **Toggle linh hoạt:** Cung cấp `enablePack(id)`, `disablePack(id)`, `isPackEnabled(id)`, `getAllActiveEntries()`. Việc bật/tắt không làm biến mất dữ liệu của người chơi trong SaveManager.

---

## 3. CÂN BẰNG ÂM THANH TOÀN CỤC & AUDIO DUCKING HIERARCHY

Để đảm bảo người chơi có thể nghe và định vị các mối nguy hiểm sinh tồn trong không gian rừng sương mù, hệ thống Audio Ducking được thiết lập với phân cấp ưu tiên rõ ràng:

```
[MỨC CAO NHẤT] Kẻ Lắng Nghe Phát Hiện (Alert) ➔ Dìm âm nền 55% (Factor: 0.45, 2.2s)
       ▲
[MỨC 2] Tiếng Tim Đập Hoảng Loạn (Composure < 40) ➔ Dìm âm nền 50% (Factor: 0.50, liên tục)
       ▲
[MỨC 3] Tiếng Quạ Thét Báo Động (Crow Caw) ➔ Dìm âm nền 45% (Factor: 0.55, 1.3s)
       ▲
[MỨC 4] Tiếng Bước Chân Kẻ Lắng Nghe (Heavy Step) ➔ Dìm âm nền 35% (Factor: 0.65, 0.55s)
       ▲
[MỨC NỀN] Âm Môi Trường Rừng / Làng / Gió Mưa ➔ Mức chuẩn 0.38
```

- **Phục hồi tuyến tính (Smooth Unducking):** Sau khi tín hiệu khẩn cấp kết thúc, âm lượng nền được ramp tuyến tính trở lại qua `linearRampToValueAtTime` trong 0.5 giây, tránh cảm giác cắt cụt âm lượng.
- **Chống spam phím (SFX Debounce):** Toàn bộ các âm thanh one-shot đi qua bảng `sfxCooldowns` với thời gian giãn cách tối thiểu từ 250ms đến 5000ms.
- **Dọn dẹp vòng lặp âm thanh (`cleanupAudioLoops`):** Khi chuyển phân khu hoặc đóng scene, toàn bộ bộ đếm nhịp tim, bộ đếm dìm âm và gain node được tái lập về trạng thái an toàn.

---

## 4. TRỢ NĂNG THỊ GIÁC MƯA SƯƠNG & DỌN DẸP TÀI NGUYÊN VFX

### 4.1 Chỉ Báo Nguy Hiểm Khi Tiếng Động Bị Mưa Át (Rain Threat Visual Indicator)

Khi thời tiết Mưa Sương (Mist Rain) làm giảm 40% bán kính truyền âm, người chơi hoặc game thủ khiếm thính sẽ gặp bất lợi lớn. Hệ thống trợ năng thị giác giải quyết triệt để vấn đề này:

- **Đồ họa Overlay:** `rainAuraThreatOverlay` đặt tại `depth: 3200` (nằm trên cảnh quan và thực thể, nằm dưới HUD 8500), `scrollFactor: 0`.
- **Cơ chế kích hoạt:** Khi `isRaining === true` và `distToListener < 260px`:
  - Vẽ viền màu đỏ hổ phách sương mù (`0xba3c1e`) bao quanh 4 mép màn hình HD 1280×720.
  - Độ dày viền mở rộng từ 18px đến 40px theo độ gần của quái vật.
  - Tần số nhấp nháy nhịp nhàng: `alpha = proximityFactor * (0.28 + 0.18 * sin(time * 0.007))`.
- **Ngưỡng an toàn:** Khi trời tạnh mưa, hoặc khi Kẻ Lắng Nghe lùi ra xa `>= 260px`, hoặc người chơi bước vào Làng Bellhollow / Nông trại, viền đỏ tự động được xóa sạch và đặt alpha về 0.

### 4.2 Thu Dọn Tài Nguyên Chuyển Vùng (`cleanupTransitionVFX`)

Tại `GameScene.ts`, cả hai luồng chuyển phân khu:
1. **Liền kề liên tục (Case 2A - Seamless Transition)**
2. **Cổng dịch chuyển (Case 2B - Portal Transition)**

Cùng với sự kiện `shutdown` của Scene đều tự động gọi:
```typescript
this.audioManager.cleanupAudioLoops();
if (this.veilSystem) {
  this.veilSystem.cleanupTransitionVFX();
  this.veilSystem.triggerZoneTransitionMist(350);
}
```
Phương thức `cleanupTransitionVFX()` dừng ngay các Tween tiếng thì thầm rác, dọn `distortionOverlay`, xóa `rainAuraThreatOverlay` và tái lập alpha màn sương về 0, loại bỏ hoàn toàn hiện tượng rò rỉ bộ nhớ hoặc xung đột đồ họa khi đổi vùng.

---

## 5. KẾT QUẢ KIỂM THỬ & CHỨNG NHẬN HỆ THỐNG

### 5.1 Kiểm tra TypeScript Compilation
```bash
npx tsc --noEmit
# Exit code: 0 (0 errors)
```

### 5.2 Kiểm tra Bộ Test V14-P7-01 (`scripts/test_v14_p7_01.mjs`)
- **Phần 1: Kiến trúc Content Packs & Bảo mật Sandbox:** 19/19 PASS
- **Phần 2: Cân bằng Âm thanh & Audio Ducking Priority:** 14/14 PASS
- **Phần 3: Trợ năng Thị giác Mưa sương & Thu dọn VFX:** 25/25 PASS
- **Tổng cộng:** **58/58 testcases PASS (100%)**

### 5.3 Kiểm tra Hồi quy Toàn diện Toàn bộ Dự án (`scripts/run_v1_3_regression_suite.mjs`)
- 22 bộ kiểm thử hồi quy bao quát toàn bộ Act 0 - Act 1, 10 hệ thống lõi, audio, dialogue, P2Game packaging CSP RT-002:
- **Kết quả:** **571/571 testcases PASS (100%)**

### 5.4 Kiểm tra Chuỗi Test Suites V1.4
| Kịch Bản Kiểm Thử | Nội Dung Trọng Tâm | Kết Quả |
| :--- | :--- | :---: |
| `test_v14_p3_02.mjs` | Vật phẩm mới, Công thức chế tạo & Sanctuary Farm | **58/58 PASS** |
| `test_v14_p4_01.mjs` | Giao diện Hotbar 8 ô, Viền Highlight & Crafting Drawer | **34/34 PASS** |
| `test_v14_p4_02.mjs` | 4 Ô Trang bị, Vũ khí tự vệ sinh tồn & Đuốc Nhựa Thông | **41/41 PASS** |
| `test_v14_p5_01.mjs` | Sinh vật rừng Quạ Rừng & Bướm Đêm Hổ Phách | **34/34 PASS** |
| `test_v14_p5_02.mjs` | AI Trí nhớ ngắn hạn The Listener, Ký ức The Echo & World Events | **38/38 PASS** |
| `test_v14_p6_01.mjs` | 3 Tiểu khu khám phá, 5 Nhiệm vụ NPC, Sổ tay Bestiary & Bản đồ vùng | **68/68 PASS** |
| `test_v14_p6_02.mjs` | Trận Trùm Giải Đố Kẻ Nuốt Tiếng Chuông (2 Pha, Di vật Mạch Rễ) | **41/41 PASS** |
| `test_v14_p7_01.mjs` | Bộ nạp Gói dữ liệu JSON, Cân bằng Âm thanh & Trợ năng Thị giác | **58/58 PASS** |
| **Tổng bài kiểm tra V1.4** | **Bao phủ toàn diện các tính năng mới** | **372/372 PASS** |

### 5.5 Kiểm tra Production Build
```bash
npm run build
# tsc && vite build
# dist/assets/index-5z3YiL6F.js  2,327.52 kB │ gzip: 552.86 kB
# ✓ built in 7.14s (Exit code: 0)
```

---

## 6. KẾT LUẬN & SẴN SÀNG CHO BƯỚC TIẾP THEO

Bước **V14-P7-01** đã hoàn thành xuất sắc 100% mục tiêu:
1. Kiến trúc gói nội dung Built-in Data-Driven JSON an toàn, cách ly hoàn toàn mã thực thi, chuẩn bị sẵn sàng cho khả năng mở rộng dữ liệu.
2. Cân bằng âm thanh chuyên sâu với cơ chế Audio Ducking tự động bảo vệ trải nghiệm định vị sinh tồn.
3. Tính năng trợ năng thị giác viền rung hổ phách công bằng cho người chơi trong điều kiện thời tiết mưa sương.
4. Cơ chế thu dọn tài nguyên chuyển cảnh triệt để, giữ vững hiệu năng 60 FPS ổn định trên WebGL.

---

## 7. NGHIỆM THU PHẦN 8 — BƯỚC V14-P8-01 (TỐI ƯU ÁNH SÁNG ĐÈN LỒNG & GIAO DIỆN)

### 7.1 Mục Tiêu & Vấn Đề Cần Giải Quyết
Trong quá trình trải nghiệm thực tế, phát hiện 3 vấn đề cần tinh chỉnh:
1. **Lệch tâm vùng sáng đèn lồng:** Vùng sương mù bị khoét lỗ và quầng sáng bị lệch hẳn lên trên và sang trái so với nhân vật.
2. **Quầng sáng có viền phân tầng thô cứng:** Ánh sáng đèn lồng gồm 3 vòng tròn đồng tâm với viền cắt sắc nét, chưa toát lên vẻ ấm áp tự nhiên của ngọn đèn dầu cổ tích.
3. **Lỗi đè chữ trên HUD và lặp từ tương tác:** Nút trạng thái `[F] BẬT / TẮT` đè lên chỉ số `Dầu Đèn: xx/100`, và chuỗi tương tác hiển thị lặp từ `[E] Nhấn [E] xem Tấm Biển Mục`.

### 7.2 Chi Tiết Giải Pháp Kỹ Thuật

#### A. Sửa triệt để lỗi lệch tâm vùng sáng đèn lồng (`GameScene.ts`, `VeilSystem.ts`, `SatyrPlayer.ts`)
- **Nguyên nhân gốc rễ:** Trong Phaser 3, `RenderTexture` kế thừa từ `Image` và có `origin` mặc định là `(0.5, 0.5)`. Khi tạo `this.fogOfWarLayer = this.add.renderTexture(0, 0, 1280, 720)`, tâm của texture nằm tại `(0, 0)` thay vì góc trên bên trái, khiến toàn bộ tọa độ xóa đục lỗ bị lệch `(-640px, -360px)` trên màn hình!
- **Khắc phục:**
  - Thiết lập tường minh `this.fogOfWarLayer.setOrigin(0, 0)` để bao phủ đúng pixel `(0, 0) -> (1280, 720)`.
  - Thiết lập `setOrigin(0.5, 0.5)` cho `cachedLightMaskImage` và `lanternGlowImage` để tâm mặt nạ trùng khớp nguồn sáng.
  - Tính toán tọa độ màn hình chuẩn xác theo Camera Zoom (2.2x) và Camera Scroll:
    ```typescript
    const camCenterX = cam.width * 0.5;
    const camCenterY = cam.height * 0.5;
    const camWorldCenterX = cam.scrollX + camCenterX;
    const camWorldCenterY = cam.scrollY + camCenterY;
    const screenX = Math.round(camCenterX + (lightWorldX - camWorldCenterX) * cam.zoom);
    const screenY = Math.round(camCenterY + (lightWorldY - camWorldCenterY) * cam.zoom);
    ```
  - Đồng bộ điểm phát sáng chuẩn xác theo đầu đèn lồng treo trên gậy của Wayfarer theo đủ 4 hướng (`DOWN: -5, -16`, `UP: 13, -19`, `LEFT: -9, -16`, `RIGHT: 9, -16`) khớp 100% từng pixel với sprite sheet.

#### B. Làm mượt quầng sáng đèn lồng với Radial Gradient (`GameScene.ts`)
- Thay thế hoàn toàn các lệnh vẽ `fillCircle` đồng tâm thô cứng bằng texture canvas chuyển sắc mềm mại `cached_lantern_glow_radial` (512×512) với chuyển dịch màu từ lõi vàng ấm hổ phách (`#ffeeaa`, `#ffc34d`), cam hổ phách (`#f39c12`, `#e67e22`) loang êm dịu dần về độ trong suốt tuyệt đối.
- Hiển thị quầng sáng bằng `this.lanternGlowImage` sử dụng `Phaser.BlendModes.ADD` và `setDepth(5020)`, tạo hiệu ứng ánh lửa ấm áp chiếu rọi huyền ảo vào cảnh vật xung quanh.
- Giữ nguyên nhịp thở và đốm lửa bập bùng tự nhiên (`flicker`), đồng thời tắt/bật tức thì khi người chơi nhấn `[F]` hoặc hết dầu đèn.

#### C. Sửa lỗi đè chữ trên HUD & Lặp từ tương tác (`UIScene.ts`, `zones.json`, `GameScene.ts`)
- **HUD Top-Left:** Dịch chuyển khung nền trạng thái `lanternStatusBg` từ `x = 252` sang `x = 280` (+28px) và tâm chữ `lanternStatusText` từ `x = 280` sang `x = 308` (+28px). Thanh `Dầu Đèn: xx/100` tại `x = 194` nay có khoảng trống 86px rộng rãi, loại bỏ hoàn toàn 100% xung đột hiển thị.
- **Tương tác Tấm Biển:**
  - Chuẩn hóa chuỗi trong `src/data/zones.json`: `"[E] Xem Tấm Biển Mục"` và `"[E] Kiểm tra Lối Mòn Phía Sau"`.
  - Bổ sung bộ lọc Regex thông minh tại `GameScene.ts` triệt tiêu mọi biến thể tiền tố lặp từ như `Nhấn [E]`, `[E] Nhấn [E]` thành dạng chuẩn gọn gàng: `"[E] <Hành động>"` khi trong phạm vi kích hoạt và `"<Hành động>"` khi ở rìa quan sát.

### 7.3 Bảng Tổng Hợp Nghiệm Thu V14-P8-01

| Hạng Mục Kiểm Tra | Tệp Tác Động | Kết Quả Nghiệm Thu |
| :--- | :--- | :---: |
| Tâm lỗ sương mù bám khít đầu đèn lồng theo Camera Zoom 2.2x & 4 hướng | `GameScene.ts`, `SatyrPlayer.ts` | **PASS (100% khớp tâm)** |
| Quầng sáng chuyển sắc mềm Radial Gradient & ADD blend mode | `GameScene.ts` | **PASS (Mượt mà, không viền sắc)** |
| Trạng thái bật/tắt tức thì khi nhấn [F] | `GameScene.ts` | **PASS (Phản hồi tức thì)** |
| HUD nút [F] dịch +28px không đè chữ Dầu Đèn | `UIScene.ts` | **PASS (Khoảng trống 86px)** |
| Lời nhắc tương tác sạch sẽ "[E] Xem Tấm Biển Mục" | `GameScene.ts`, `zones.json` | **PASS (Không lặp từ)** |
| TypeScript Compiler (`npx tsc --noEmit`) | Toàn bộ codebase | **0 Lỗi (Code 0)** |
| Kiểm thử xác minh Bước V14-P8-01 (`test_v14_p8_01.mjs`) | Kịch bản chuyên biệt | **15/15 PASS (100%)** |
| Kiểm thử cổng nghiệm thu V1.4 (`test_v14_p7_02_release_gate.mjs`) | Toàn bộ 4 cổng nghiệm thu | **38/38 PASS (100%)** |
| Bản dựng Production (`npm run build`) | Vite & TypeScript | **Thành công (7.66s, Code 0)** |

---

## 8. NGHIỆM THU PHẦN 8 — BƯỚC V14-P8-04 (KIỂM DUYỆT 4 GÓI NỘI DUNG JSON & BẢO LƯU DỮ LIỆU LẠ LEGACYEXTRADATA KHI DI TRÚ SAVE)

### 8.1 Mục Tiêu & Yêu Cầu Kỹ Thuật
1. **Module Thẩm Định Dữ Liệu Gói Nội Dung (`src/systems/ContentPackValidator.ts`)**:
   - Thiết lập bộ lọc bảo mật CSP RT-002: Chỉ chấp nhận định dạng JSON thuần túy (Pure Data JSON), cấm tuyệt đối mã JavaScript thực thi động (`eval`, `new Function`, `<script>`, `javascript:`).
   - Kiểm tra cấu trúc Manifest bắt buộc (`packId`, `name`, `version`, `dependencies`, `contentEntries`).
   - Kiểm tra chuẩn đặt tên Content ID theo hai không gian tên phân tách: First-party (`HW-[TYPE]-[SUBTYPE]-[SEQ]`) và Mod ngoại lai (`mod.<author>.<pack>.<type>.<id>`).
   - Phát hiện xung đột trùng lặp Content ID giữa các gói nội dung và kiểm tra độ tương thích SemVer với phiên bản game lõi (`1.4.0`).
   - Khai báo chuẩn hóa 4 gói nội dung chính thức:
     - `HW-MOD-PACK-000001`: Woodland Wildlife Pack (Quạ Rừng & Bướm Đêm).
     - `HW-MOD-PACK-000002`: Survival Equipment Pack (4 ô trang bị cá nhân).
     - `HW-MOD-PACK-000003`: Camp & Cooking Pack (Lửa Trại 3 cấp, Rương 12 ô, Nồi Thảo Dược, Lều).
     - `HW-MOD-PACK-000004`: Ancient Relics & Boss Pack (3 tiểu khu, Cổ Ngữ & Boss Mire Warden).
2. **Cơ Chế Bảo Lưu Dữ Liệu Ngoại Lai `legacyExtraData` (`src/systems/SaveManager.ts`, `src/state/PlayerState.ts`)**:
   - Khi nạp các bản lưu cũ từ V1.3 hoặc bản lưu chứa dữ liệu từ các mod bên thứ ba, mọi trường dữ liệu không nằm trong danh mục `ContentRegistry` chuẩn sẽ tự động được thu gom và lưu giữ nguyên vẹn trong trường `legacyExtraData`.
   - Bảo toàn 100% dữ liệu qua chu trình nạp -> chơi -> ghi lưu (Round-trip load -> modify -> save), không bao giờ cắt bỏ (strip) hay làm mất mát tiến trình hoặc cài đặt tùy biến của người chơi.

---

### 8.2 Chi Tiết Triển Khai Kỹ Thuật

#### A. Kiến Trúc `ContentPackValidator.ts` & Phòng Tuyến An Toàn WebGL
- **Ngăn chặn triệt để mã độc chèn vào WebGL Runtime (`validateJsonSafety`)**:
  Bộ quét token an toàn duyệt qua toàn bộ payload chuỗi hoặc đối tượng JSON, lập tức từ chối và báo lỗi nếu phát hiện các chuỗi độc hại: `<script`, `javascript:`, `eval(`, `new Function`, `onload=`, `onerror=`, `data:text/html`.
- **Thẩm định Manifest chặt chẽ (`validateManifest`)**:
  Kiểm tra sự tồn tại và tính hợp lệ của các trường bắt buộc, xác minh `dependencies` hợp lệ không bị vòng lặp hoặc thiếu gói phụ thuộc.
- **Thẩm định tính duy nhất của Content ID (`validateNoIdCollisions`)**:
  Duyệt toàn bộ `contentEntries`, đối chiếu chéo với bảng đăng ký hiện có nhằm ngăn ngừa tình trạng hai gói nội dung cùng ghi đè một định danh thực thể.
- **Tương thích bí danh hai chiều (`ContentPackLoader.ts`)**:
  Bổ sung bảng `packAliases` ánh xạ qua lại giữa các mã chuẩn định danh V1.4 (`HW-MOD-PACK-000001..04`), mã `mod_*_pack` và mã nội bộ `pack_*`, giúp hệ thống tương thích hoàn toàn với cấu hình dữ liệu trong `content_registry.json`.

#### B. Cơ Chế Bảo Lưu Khóa Lạ `legacyExtraData` Trong `SaveManager` & `PlayerState`
- **Mở rộng `PlayerState.ts`**:
  - Bổ sung thuộc tính `public legacyExtraData?: Record<string, any>;`.
  - Bổ sung các phương thức: `getLegacyExtraData()`, `setLegacyExtraData()`, `setLegacyExtraValue(key, val)`, `getLegacyExtraValue(key)`.
  - Tự động xóa sạch trong hàm `reset()`.
- **Nâng cấp `SaveManager.ts`**:
  - **Khi Sanitize & Migrate:** Mọi thuộc tính không thuộc schema chuẩn của V1.4 được tự động trích xuất vào `legacyExtraData`.
  - **Khi nạp (Restore):** `state.legacyExtraData = data.legacyExtraData ? { ...data.legacyExtraData } : undefined;`.
  - **Khi lưu (Candidate):** Đưa `legacyExtraData: state.legacyExtraData ? { ...state.legacyExtraData } : undefined` vào đối tượng `SaveData` đầu ra.
  - **Vật phẩm mod trong Inventory:** Các vật phẩm bắt đầu bằng tiền tố `mod_` được tự động bảo toàn số lượng và thứ tự, không bị xóa bỏ khi người chơi di trú từ save cũ sang V1.4.

---

### 8.3 Bảng Tổng Hợp Nghiệm Thu V14-P8-04

| Hạng Mục Kiểm Tra | Kịch Bản & Tệp Nguồn | Tiêu Chí Đánh Giá | Kết Quả |
| :--- | :--- | :--- | :---: |
| **Kiểm tra An toàn JSON CSP** | `ContentPackValidator.ts` | Chặn toàn bộ script injection, eval, onload | **PASS** |
| **Thẩm định 4 Gói Nội Dung Tích Hợp** | `ContentPackValidator.ts` | Đủ 4 gói HW-MOD-PACK, manifest chuẩn | **PASS** |
| **Phát hiện Trùng lặp Content ID** | `ContentPackValidator.ts` | Phát hiện va chạm ID, kiểm tra SemVer 1.4.0 | **PASS** |
| **Bí danh Tương thích Hai Chiều** | `ContentPackLoader.ts` | Ánh xạ HW-MOD-PACK <-> pack_* <-> mod_* | **PASS** |
| **Di trú Save V1.3 -> V1.4** | `SaveManager.ts` | Nâng schema lên v3, bổ sung fallback an toàn | **PASS** |
| **Bảo lưu Khóa Lạ `legacyExtraData`** | `SaveManager.ts`, `PlayerState.ts` | Lưu giữ 100% custom keys, không mất dữ liệu | **PASS** |
| **Round-trip Save / Load Mod Data** | `SaveManager.ts`, `PlayerState.ts` | Dữ liệu mod nguyên vẹn sau chu trình ghi nạp | **PASS** |
| **Bảo toàn Vật phẩm Mod trong Túi** | `SaveManager.ts` | Vật phẩm `mod_*` không bị thất thoát | **PASS** |
| **Sao Lưu Dự Phòng Cũ V13_BACKUP_KEY** | `SaveManager.ts` | Tự động tạo bản sao lưu an toàn của V1.3 | **PASS** |
| **Bộ Kiểm Thử Di Trú & Validator** | `scripts/verify_v1_4_save_migration.mjs` | 29/29 bài kiểm tra chuyên sâu | **29/29 PASS (100%)** |
| **Kiểm Thử Cổng Nghiệm Thu V1.4** | `scripts/test_v14_p7_02_release_gate.mjs` | Toàn bộ 4 cổng nghiệm thu V1.4 | **38/38 PASS (100%)** |
| **Kiểm Tra TypeScript** | `npx tsc --noEmit` | Không còn lỗi kiểu dữ liệu hoặc tham chiếu | **0 Lỗi (Code 0)** |
| **Đóng Gói Bản Dựng Production** | `npm run build` | Vite build hoàn thành trong 6.97s | **Thành công (Code 0)** |

---

## PHẦN 9: BÁO CÁO KHẮC PHỤC TRIỆT ĐỂ SỰ CỐ HIỂN THỊ RỪNG SÂU (V14-P8-11: DEEP FOREST CHARACTER VISIBILITY FIX)

### 9.1 Nguyên Nhân Gốc Rễ (Root Cause Analysis)

1. **Nghịch đảo Tọa độ Y Âm với Độ sâu Mặt đất (Negative Coordinate Inversion):**
   - Trong `src/data/zones.json`, phân khu Rừng Sâu (`deep_forest`) có biên giới không gian $y \in [-640 .. 0]$ và điểm sinh mặc định tại $(2080, -80)$. Phân khu Bãi Trống Vọng Âm (`sub_whispering_clearing`) có $y \in [-360 .. 0]$, và phần phía bắc làng Bellhollow có $y \in [-200 .. 0]$.
   - Hệ thống sắp xếp hiển thị 2D (Y-sorting) trong `SatyrPlayer.ts` gán độ sâu `targetDepth = Math.floor(this.y)`. Khi người chơi di chuyển sâu vào Rừng Sâu ($y = -100, -200, -320$), độ sâu của nhân vật nhận giá trị âm tương ứng ($-100, -200, -320$).
   - Tuy nhiên, trong `WorldBuilder.ts`, ảnh nền địa hình baked (`deep_forest_ground_baked_v12`) được đặt cứng ở `depth = -98`. Sương mù ranh giới đặt ở `depth = -65`, và sương mù mặt đất của `VeilSystem.ts` (`fogLayerGround`) đặt ở `depth = -40`.
   - **Hậu quả đồ họa:** Khi $y < -98$ (ví dụ: $y = -150$), ta có $-150 < -98 < -65 < -40$. Động cơ đồ họa Phaser WebGL vẽ nhân vật trước, sau đó vẽ tấm ảnh mặt đất mờ đục 100% kích thước 1280x640 px lên trên, che khuất hoàn toàn thân thể nhân vật!
   - **Lý do chỉ còn lại chiếc đèn lồng:** Trong `GameScene.ts`, quầng sáng đèn lồng (`this.lanternGlowImage`) nằm ở lớp mặt nạ chiếu sáng màn hình cố định `depth = 5020` và xóa một vòng tròn trong lớp Fog of War. Do đó, quầng sáng đèn lồng vẫn di chuyển trên màn hình ở độ sâu 5020 trong khi toàn bộ thân xác nhân vật bên dưới bị tấm nền địa hình depth $-98$ nuốt chửng.

2. **Thiếu Chuẩn Phân Tầng Hệ Thống (Lack of Standardized Layering Constants):**
   - Các giá trị depth rải rác trong `WorldBuilder.ts` và `VeilSystem.ts` sử dụng các hằng số số nguyên cứng (`-98`, `-97`, `-95`, `-90`, `-88`, `-80`, `-65`, `-40`, `-100`), được thiết kế khi bản đồ game còn có tọa độ $y \ge 0$. Khi thế giới mở rộng về hướng bắc với tọa độ âm, các giả định này bị phá vỡ.

---

### 9.2 Giải Pháp Kiến Trúc & Triển Khai Kỹ Thuật

1. **Chuẩn Hóa Hằng Số Phân Tầng Độ Sâu Toàn Cục (`Constants.ts`):**
   Đưa toàn bộ các tầng nền địa hình, chân móng, thực vật sàn, vũng nước, phù điêu sàn và sương mù mặt đất xuống dải độ sâu $\le -6900$:
   - `DEPTH_GROUND_BASE = -10000`: Nền đất baked cơ sở của tất cả 12 phân khu.
   - `DEPTH_GROUND_FOOTING = -9500`: Chân móng công trình, bờ đá.
   - `DEPTH_GROUND_TURF = -9200`: Đốm cỏ rêu, mảng đất phủ ranh giới.
   - `DEPTH_GROUND_STONES = -9100`: Sỏi đá cuội trên mặt đất.
   - `DEPTH_GROUND_FLORA = -9000`: Hoa cỏ sát mặt sàn.
   - `DEPTH_GROUND_WATER = -8900`: Vũng nước, dòng suối sát đất.
   - `DEPTH_GROUND_DECALS = -8500`: Quầng sáng đèn sàn, nấm dạ quang, hào quang bệ thờ.
   - `DEPTH_GROUND_MIST = -8000`: Sương mù ranh giới địa hình (WorldBuilder boundary mist).
   - `DEPTH_VEIL_GROUND_FOG = -7000`: Sương mù mặt đất của VeilSystem.
   - `DEPTH_VEIL_PINK_DAWN = -6900`: Sương mù hồng bình minh Fog Crossing.

   **Khoảng cách an toàn (Safety Margin):**
   Vị trí cao nhất về phía bắc của thế giới là $y = -640$ (đỉnh Rừng Sâu).
   Khoảng cách an toàn giữa nhân vật/quái vật/cây cối thấp nhất và lớp sương mù/đất nền:
   $$\Delta \text{Depth} = -640 - (-7000) = +6360 \text{ depth units}$$
   Đảm bảo 100% không một thực thể nào trong game có thể bị nền đất hoặc sương mù mặt đất che phủ.

2. **Cơ Chế Bảo Vệ Hiển Thị Nhân Vật (Display Guardrails in `SatyrPlayer.ts`):**
   - Trong `update()`: Tự động kiểm tra và cưỡng chế `visible = true` và `alpha = 1` mỗi khung hình khi nhân vật không ở trong bụi rậm/thân cây ẩn nấp và chưa chết.
   - Trong `safePlayAnim()`: Bổ sung fallback an toàn tự động phát `wayfarer_idle_down` / `satyr_idle_down` nếu khóa hoạt ảnh đích bị thiếu hoặc rỗng frame, bảo đảm sprite không bao giờ bị rơi vào trạng thái rỗng vô hình.
   - Trong `exitHiding()`: Tái xác nhận `setVisible(true)` và `setAlpha(1)`.

3. **Cơ Chế Bảo Vệ Chuyển Phân Khu Trong `GameScene.ts`:**
   - Trong `handleZoneTransition()` (cả chuyển tiếp liền mạch 2A và cổng dịch chuyển 2B): Tự động giải phóng trạng thái ẩn nấp `if (this.player.stats.isHiding) this.player.exitHiding()`, đồng thời kích hoạt lại `setVisible(true)`, `setActive(true)`, `setAlpha(1)`.
   - Trong vòng lặp `update()`: Duy trì kiểm tra liên tục tính hiển thị của nhân vật.

---

### 9.3 Bảng Tổng Hợp Kiểm Thử Nghiệm Thu V14-P8-11

| Bộ Kiểm Thử | Tệp Kịch Bản | Số Bài Test | Kết Quả |
| :--- | :--- | :---: | :---: |
| **Kiểm Thử Hiển Thị & Phân Tầng Rừng Sâu** | `scripts/verify_v14_p8_11_deep_forest_visibility.mjs` | 55/55 | **PASS (100%)** |
| **Hồi Quy Toàn Diện Kế Thừa V1.3** | `scripts/run_v1_3_regression_suite.mjs` | 571/571 | **PASS (100%)** |
| **Xác Minh Di Trú Dữ Liệu Save V1.3 -> V1.4** | `scripts/verify_v1_4_save_migration.mjs` | 88/88 | **PASS (100%)** |
| **Kiểm Thử Sinh Vật Sói Xương (Skull Wolf)** | `scripts/verify_v14_p8_08_skull_wolf.mjs` | 42/42 | **PASS (100%)** |
| **Kiểm Thử Quái Vật Bóng Tối (Shadow Monsters)** | `scripts/verify_v14_p8_09_shadow_monsters.mjs` | 53/53 | **PASS (100%)** |
| **Kiểm Thử Nhóm Hiệp Sĩ Tà Ác (Evil Knights)** | `scripts/verify_v14_p8_10_evil_knights.mjs` | 63/63 | **PASS (100%)** |
| **Kiểm Tra Kiểu Dữ Liệu TypeScript** | `npx tsc --noEmit` | 0 Lỗi | **0 Lỗi (Code 0)** |
| **Đóng Gói Bản Dựng Production** | `npm run build` | Vite 7.84s | **Thành công (Code 0)** |



