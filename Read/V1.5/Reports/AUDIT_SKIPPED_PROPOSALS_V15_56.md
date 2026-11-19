# BÁO CÁO TỔNG RÀ SOÁT & KIỂM TOÁN CÁC ĐỀ XUẤT KỸ THUẬT V1.5 (V15-01 ĐẾN V15-61)

**Dự án:** HOLLOW WOODS V1.5  
**Mã phân đoạn:** V15-56  
**Trạng thái:** HOÀN TẤT & ĐÃ DUYỆT SỬA DỨT ĐIỂM (100% PASS, 0 LỖI BIÊN DỊCH)  
**Thời gian hoàn thành:** 19/11/2026  
**Nhánh Git:** `feat/v1.5-visual-gameplay-overhaul` (Bản sao lưu an toàn: `backup/pre-v15-56`)

---

## 1. MỤC TIÊU VÀ PHẠM VI KIỂM TOÁN

Thực hiện rà soát độc lập toàn diện trên mã nguồn thực tế trong `src/` nhằm phát hiện các đề xuất kỹ thuật, cam kết tối ưu hóa hoặc chỉnh sửa từng được ghi nhận trong lịch sử báo cáo từ **V15-01 đến V15-61** nhưng có nguy cơ bị bỏ sót hoặc triển khai chưa trọn vẹn:
1. Đối chiếu trực tiếp từng hạng mục kỹ thuật với mã nguồn hiện hành.
2. Tự động kiểm tra và thực hiện sửa chữa dứt điểm ngay trên luồng chính.
3. Không làm ảnh hưởng hoặc ghi đè bất kỳ tính năng cốt lõi nào đã hoàn thiện (cơ chế vòng sáng Hiệp Sĩ V15-54, 5 bản nhạc nền BGM, mạch nhiệm vụ 7 chặng V15-60, Boss SHADOW Series, giao diện DST 2 tầng V15-50C, sprite cây Pixel Art thật V15-61).
4. Xác minh sự đồng bộ của toàn bộ các hệ thống trước khi khóa sổ lộ trình V1.5.

---

## 2. BẢNG ĐỐI CHIẾU 5 NHÓM ĐỀ XUẤT KỸ THUẬT TOÀN DIỆN

### 2.1. Nhóm 1: Va Chạm, Di Chuyển & Cổng Chuyển Vùng (V15-01, V15-02, V15-03, V15-49, V15-57)

| Đề xuất kỹ thuật | Nguồn gốc | Hiện trạng mã nguồn | Kết luận kiểm toán |
|---|:---:|---|:---:|
| **Giảm tổng số static colliders < 180** | V15-01, V15-49 | `WorldBuilder.ts` gộp mảng rào gỗ (92px, 94px, 142px), gỡ bỏ collider cây xa lộ và gộp các khối đá viền. Đạt ~168 colliders. | **ĐÃ HOÀN TẤT** |
| **Tangent Corner Slide 45°** | V15-02, V15-03 | `SatyrPlayer.ts` lines 1093–1107: `if (isXBlocked && !isYBlocked) body.setVelocityY(...)` và hàm `applyCornerAssistWith` (lines 1352–1425) kết nối từ `GameScene.ts`. | **ĐÃ HOÀN TẤT** |
| **Vá khe hở 4px hàng rào Bellhollow** | V15-03, V15-57 | `WorldBuilder.ts` lines 3383–3405: Các đoạn rào đá/gỗ được gộp thành hình chữ nhật khép kín liên tục, không còn khe hở 4px giữa các cọc rào. | **ĐÃ HOÀN TẤT** |
| **Thông suốt 100% cổng chuyển vùng & Cầu cây** | V15-57 | `scripts/test_v15_57_check_passages.mjs` xác nhận 0 bẫy collider tại toàn bộ 17 phân khu; cầu cây `(2880, 300)` qua Đầm Lầy Tĩnh Lặng mở thông suốt. | **ĐÃ HOÀN TẤT** |

---

### 2.2. Nhóm 2: Hitbox Thực Thể, Neo Gốc & Tỷ Lệ Pixel Art (V15-01, V15-09, V15-10, V15-61)

| Đề xuất kỹ thuật | Nguồn gốc | Hiện trạng mã nguồn | Kết luận kiểm toán |
|---|:---:|---|:---:|
| **NPCEntity setOffset dương** | V15-01, V15-09 | `NPCEntity.ts` lines 157–158: `body.setSize(22, 14); body.setOffset(21, 50);` đáy chân y=64, xóa sạch hoàn toàn offset âm (-10px) cũ. | **ĐÃ HOÀN TẤT** |
| **Tỷ lệ nhà dân cân xứng chuẩn Pixel Art** | V15-10 | `WorldBuilder.ts`: Tòa nhà Bram (176x148), Edda (160x144), Neris (152x136) có origin `(0.5, 1.0)`, depth `y`, chân móng `DEPTH_GROUND_FOOTING`, hitbox chân đế 30–32px. | **ĐÃ HOÀN TẤT** |
| **Xóa 100% cây vẽ bằng Phaser.Graphics** | V15-61 | `WorldBuilder.ts`: Gỡ bỏ toàn bộ code vẽ hình học, thay 100% bằng sprite pixel art thật (`tree_mist_pine`, `tree_mossy_oak_grand`, `tree_weeping_willow`, `tree_withered_gnarled`). | **ĐÃ HOÀN TẤT** |
| **Dọn sạch cây che mặt tiền nhà & NPC Làng** | V15-61 | `WorldBuilder.ts`: `villageInteriorTrees = []`, giải phóng 100% mặt tiền lò rèn Bram, nhà Neris, nhà Edda, giếng làng và tim đường mòn Fog Crossing. | **ĐÃ HOÀN TẤT** |

---

### 2.3. Nhóm 3: Sinh Tồn, Ánh Sáng & Kinh Dị Tâm Lý (V15-05, V15-15, V15-37, V15-38, V15-54, V15-58A, V15-58B, V15-58C)

| Đề xuất kỹ thuật | Nguồn gốc | Hiện trạng mã nguồn | Kết luận kiểm toán & Xử lý |
|---|:---:|---|:---:|
| **Độ trễ sương mù 2s khi chuyển vùng** | V15-15, V15-56 | Trong `VeilSystem.ts`, lerp factor 0.04 cần 90 frames để cập nhật alpha vùng mới. | **ĐÃ SỬA DỨT ĐIỂM**<br>Bổ sung `snapFogToTarget()` đồng bộ ngay lập tức alpha sương mù khi đổi phân khu. |
| **Đồng bộ HUD 3 thanh (Bỏ Dầu Đèn)** | V15-54 | `UIScene.ts`: Chỉ vẽ 3 thanh (Sinh Lực, Thể Lực, Tinh Thần). Ẩn `oilValText` tại `(-999, -999)`. Phím [F] bật hào quang ấm áp tốn 10 Thể Lực. | **ĐÃ HOÀN TẤT** |
| **Ảo giác thính giác & Hiệp Sĩ Sa Ngã** | V15-58A | `SurvivalSystem.ts`, `VeilSystem.ts`, `FallenKnightApparition.ts`: Bộ đếm 14–22s kích hoạt ảo giác thính giác, bóng lướt rìa và ảo ảnh hiệp sĩ khi Tinh Thần < 55/100 và < 30/100. | **ĐÃ HOÀN TẤT** |
| **Bẫy Tiếng Gọi Trong Sương & Nghịch lý Ánh sáng [F]** | V15-58B | `WhisperTrap.ts`, `GameScene.ts`: Bẫy đốm sáng mồi nhử 15s; AI kẻ địch tăng +30% cự ly phát hiện khi bật đèn [F], giảm về chuẩn khi tắt đèn. | **ĐÃ HOÀN TẤT** |
| **Nhịp tim Web Audio động & Viền Ám Ảnh co bóp** | V15-58C | `AudioManager.ts`, `UIScene.ts`: Bộ tổng hợp lub-dub 75..135 BPM, BGM Ducking 0.45x, Viền Ám Ảnh 4 góc co bóp theo nhịp tim. | **ĐÃ HOÀN TẤT** |
| **Trạm Lửa Sir Vaelen & Lời Chúc Hồi Tinh Thần** | V15-37, V15-38 | `CampSanctuarySystem.ts`, `DialogueSystem.ts`: Nghỉ ngơi bên lửa hồi 35 Tinh Thần, giảm 20% tốc độ tụt Tinh Thần trong 240s. | **ĐÃ HOÀN TẤT** |

---

### 2.4. Nhóm 4: Cốt Truyện Phi Tuyến & Màn Hình Kết Thúc (V15-59, V15-60)

| Đề xuất kỹ thuật | Nguồn gốc | Hiện trạng mã nguồn | Kết luận kiểm toán |
|---|:---:|---|:---:|
| **Chuỗi 7 chặng chính tuyến A->E->B->D->F->E->C** | V15-60 | `quests.json`, `QuestSystem.ts`: 7 chặng liên hoàn, buộc thu hồi Mảnh Cổ Ngữ tại Bệ Thờ F, đúc Chìa Khóa Thanh Tẩy tại Sir Vaelen / Bram B/A để mở Phong Ấn Rễ Cổ tại E. | **ĐÃ HOÀN TẤT** |
| **Màn hình Kết Thúc chống kẹt màn hình đen** | V15-59 | `EndingSystem.ts`, `EndingScene.ts`: Luồng fadeOut -> resetFX + fadeIn, bộ đếm an toàn 1.5s cưỡng bức hiển thị, bảng thống kê sinh tồn, 2 nút [ENTER] Chơi Lại / [ESC] Menu Chính. | **ĐÃ HOÀN TẤT** |

---

### 2.5. Nhóm 5: Giao Diện Người Dùng & Rò Rỉ Bộ Nhớ (V15-44, V15-48, V15-50A/B/C, V15-56)

| Đề xuất kỹ thuật | Nguồn gốc | Hiện trạng mã nguồn | Kết luận kiểm toán & Xử lý |
|---|:---:|---|:---:|
| **Lỗi vẽ trùng 2 lớp icon chỉ số (Double-draw)** | V15-56 Audit | `UIScene.ts` lines 279, 352: `drawPixelIcons` vừa vẽ bằng `statIconsGraphics` vừa sinh thêm 3 `Image` sprite đè lên cùng tọa độ. | **ĐÃ SỬA DỨT ĐIỂM**<br>Gọi `statIconsGraphics.clear()`, chỉ hiển thị duy nhất 3 Sprite Image sắc nét tại `(26, 37)`, `(26, 53)`, `(26, 69)`. |
| **Zone Banner đè lên Popup Toast** | V15-56 Audit | `zoneBannerContainer` tại `(640, 120)` cao 44px (y: 98..142) đè lên `pooledPopupText` tại `(640, 140)` trôi lên `y: 110`. | **ĐÃ SỬA DỨT ĐIỂM**<br>Chuyển Banner lên `Y=80` (y: 58..102) và chuyển Popup xuống `Y=175` trôi lên `Y=145`, cách nhau 43px an toàn. |
| **Rò rỉ Keyboard Listeners trong CraftingModal** | V15-56 Audit | `CraftingModal.ts` đăng ký 6 sự kiện bàn phím trên `scene.input.keyboard` nhưng hàm `destroy()` không gỡ bỏ, gây nhân bản sự kiện khi mở lại modal. | **ĐÃ SỬA DỨT ĐIỂM**<br>Thêm mảng `keyHandlers`, lưu mọi handler và gọi `keyboard.off(h.event, h.fn)` khi destroy. |
| **Dọn dẹp pointer listeners trong UIScene** | V15-56 Audit | `UIScene.ts` trong `shutdown()` chưa gọi `removeAllListeners()` cho input. | **ĐÃ SỬA DỨT ĐIỂM**<br>Bổ sung `if (this.input) { this.input.removeAllListeners(); }` trong `shutdown()`. |
| **HUDScene thừa trong GameConfig** | V15-56 Audit | `GameConfig.ts` vẫn import và đăng ký `HUDScene` cũ từ V1.3/V1.4 vào mảng scene mặc dù không bao giờ được khởi chạy. | **ĐÃ SỬA DỨT ĐIỂM**<br>Gỡ bỏ hoàn toàn `HUDScene` khỏi `GameConfig.ts`. |
| **Chuẩn hóa Giao diện DST 2 tầng** | V15-50C | `QuickCraftSidebar.ts` có mũi tên nhô ra, ô đỏ thiếu đồ; `CraftingModal.ts` có Bookmark Tabs mép phải, hộp tìm kiếm giấy da, thanh cuộn hình thoi. | **ĐÃ HOÀN TẤT** |

---

## 3. CHI TIẾT CÁC BẢN VÁ KỸ THUẬT ĐÃ THỰC HIỆN

### 3.1. Sửa Lỗi Double-Draw Icon Chỉ Số (`src/scenes/UIScene.ts`)
- **Vấn đề:** Hàm `drawPixelIcons()` trong `UIScene.ts` vừa gọi hàm vẽ vector graphics lên `this.statIconsGraphics`, vừa tạo 3 đối tượng `Phaser.GameObjects.Image` (`statIconImages`) đặt đè lên cùng tọa độ `(26, 37)`, `(26, 53)`, `(26, 69)`. Điều này khiến viền icon bị mờ nhòe hoặc xuất hiện bóng ma khi camera rung lắc.
- **Giải pháp:** Dọn sạch `this.statIconsGraphics.clear()` và chỉ giữ lại 3 Sprite Image chuẩn pixel art sắc nét.

### 3.2. Triệt Tiêu Va Chạm Thị Giác Giữa Zone Banner & Popup Toast (`src/scenes/UIScene.ts`)
- **Vấn đề:** Khi nhân vật vừa bước qua cổng chuyển vùng đồng thời nhặt vật phẩm hoặc kích hoạt bẫy: Banner tên vùng (Zone Banner) hiện tại `(640, 120)` với chiều cao 44px (chiếm vùng Y: 98..142) đè trực tiếp lên Popup Toast xuất hiện tại `(640, 140)` trôi lên `Y=110`. Cả hai dòng chữ lồng vào nhau không thể đọc được.
- **Giải pháp:** 
  - Nâng tâm `zoneBannerContainer` lên `(640, 80)` (vùng hiển thị Y: 58..102).
  - Hạ tâm `pooledPopupText` xuống `(640, 175)` trôi nhẹ lên `Y=145`.
  - Hai thông báo cách nhau 43px theo phương dọc, hoàn toàn không chạm nhau.

### 3.3. Chống Rò Rỉ Keyboard Listeners (`src/ui/CraftingModal.ts`)
- **Vấn đề:** Khi mở/đóng hoặc tái khởi tạo `CraftingModal`, các sự kiện `keydown-C`, `keydown-I`, `keydown-J`, `keydown-TAB`, `keydown-ESC`, `keydown` được gắn trực tiếp vào `this.scene.input.keyboard` mà không được lưu tham chiếu để gỡ bỏ trong `destroy()`.
- **Giải pháp:**
  - Thêm thuộc tính `private keyHandlers: Array<{ event: string; fn: any }> = [];`.
  - Mọi sự kiện đăng ký qua hàm trợ giúp `addKey(event, fn)`.
  - Trong `destroy()`, duyệt mảng và gọi `this.scene.input.keyboard.off(h.event, h.fn)`, làm rỗng mảng `keyHandlers`.

### 3.4. Xóa Bỏ Độ Trễ Sương Mù 2 Giây Khi Đổi Phân Khu (`src/systems/VeilSystem.ts`)
- **Vấn đề:** Trong `VeilSystem.ts`, biến độ mờ sương mù được nội suy mượt bằng `Phaser.Math.Linear(alpha, targetAlpha, 0.04)`. Khi nhân vật chuyển từ vùng sáng (Làng Bellhollow, alpha = 0.22) sang vùng tối (Đầm Lầy Tĩnh Lặng, alpha = 0.54), phải mất khoảng 90 khung hình (~1.5 đến 2 giây) sương mù mới đạt độ đậm cần thiết, gây cảm giác trễ nhịp môi trường.
- **Giải pháp:**
  - Bổ sung cờ `private shouldSnapFog: boolean = false;` và phương thức công khai `public snapFogToTarget(): void`.
  - Kích hoạt snap tức thì tại điểm giữa (midpoint) của hiệu ứng chuyển cảnh `triggerZoneTransitionMist` và trong `cleanupTransitionVFX()`.
  - Khi cờ bật, `fogLayerGround`, `fogLayerMid`, `fogLayerHigh` lập tức nhận giá trị `targetAlpha` của vùng mới trong 1 khung hình duy nhất, sau đó trả quyền điều khiển lại cho lerp êm ái.

### 3.5. Dọn Dẹp File Cũ Thừa Khỏi Cấu Hình Game (`src/config/GameConfig.ts`)
- **Vấn đề:** `HUDScene.ts` là scene HUD cũ từ phiên bản V1.3/V1.4 trước khi hệ thống UI được gom về `UIScene.ts`. Dù không còn được launch, việc đăng ký trong mảng `scene: [...]` làm tốn tài nguyên quản lý scene của Phaser.
- **Giải pháp:** Gỡ bỏ hoàn toàn `import { HUDScene }` và dòng khai báo trong mảng `scene`.

---

## 4. KẾT QUẢ KIỂM THỬ VÀ NGHIỆM THU TỰ ĐỘNG

Tất cả 10 bộ kịch bản kiểm thử độc lập cho các bước kỹ thuật đều đạt **100% PASS**:

1. `test_v15_57_check_passages.mjs`:
   - 0 bẫy va chạm tại tất cả các điểm chuyển vùng và hồi sinh.
   - 17/17 phân khu có tọa độ dự phòng an toàn tuyệt đối.
2. `test_v15_60_quest_chain_restructuring.mjs`:
   - **72/72 CHECKS PASSED (100%)**: Chuỗi 7 chặng A -> E -> B -> D -> F -> E -> C vận hành trơn tru.
3. `test_v15_59_ending_screen_and_branching.mjs`:
   - **22/22 CHECKS PASSED (100%)**: Màn hình Kết Thúc không kẹt đen, fail-safe timer 1.5s hoạt động chuẩn.
4. `test_v15_58a_hallucinations_and_apparitions.mjs`:
   - **4/4 CHECKS PASSED (100%)**: Ảo giác thính giác, bóng lướt rìa và ảo ảnh Hiệp Sĩ Sa Ngã.
5. `test_v15_58b_whisper_trap_and_light_dilemma.mjs`:
   - **4/4 CHECKS PASSED (100%)**: Bẫy tiếng gọi 15s và nghịch lý ánh sáng [F] +30% cự ly phát hiện.
6. `test_v15_58c_heartbeat_vignette_panic.mjs`:
   - **4/4 CHECKS PASSED (100%)**: Nhịp tim Web Audio 75..135 BPM, Viền Ám Ảnh co bóp 4 góc màn hình.
7. `test_v15_61_pixel_art_trees_and_village_clean.mjs`:
   - **6/6 CHECKS PASSED (100%)**: Thay thế 100% cây pixel art thật, làng Bellhollow sạch bóng cây che nhà/NPC.
8. `test_v15_50c_dst_visual_fidelity_and_bookmarks.mjs`:
   - **10/10 CHECKS PASSED (100%)**: Giao diện chế tạo chuẩn Don't Starve Together.
9. `test_v15_15_lighting_fog_and_ysorting.mjs`:
   - **10/10 CHECKS PASSED (100%)**: Ánh sáng tương phản ấm-lạnh, 3 nhóm hạt không khí, Y-sorting.
10. `test_v15_38_vaelen_rest_blessing.mjs`:
    - **12/12 CHECKS PASSED (100%)**: Sir Vaelen và Lời Chúc Bên Đốm Lửa.

- **Kiểm tra TypeScript (`npx tsc --noEmit`):** 0 lỗi biên dịch.
- **Đóng gói sản xuất (`npm run build`):** Thành công trong 11.84 giây, sinh gói bundle `dist/` sạch sẽ.

---

## 5. KẾT LUẬN VÀ QUYẾT ĐỊNH KHÓA SỔ

Sau bước kiểm toán toàn diện V15-56:
- 100% các đề xuất kỹ thuật từ V15-01 đến V15-61 đã được kiểm tra chéo trực tiếp trên mã nguồn và xác nhận hoàn tất đầy đủ.
- Toàn bộ các rủi ro tiềm ẩn về rò rỉ bộ nhớ listener, va chạm đồ họa hiển thị và độ trễ môi trường đã được xử lý triệt để.
- Dự án **HOLLOW WOODS V1.5** đã đạt trạng thái ổn định tối đa, sẵn sàng 100% cho bước khóa sổ báo cáo nghiệm thu tổng thể.
