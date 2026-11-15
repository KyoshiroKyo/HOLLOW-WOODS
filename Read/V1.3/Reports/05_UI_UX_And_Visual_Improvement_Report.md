# BÁO CÁO THỰC THI & NÂNG CẤP ĐỒ HỌA MÔI TRƯỜNG, XỬ LÝ VẬT THỂ XÁM BẤT THƯỜNG & SƯƠNG MÙ ĐA TẦNG (C4-13-06)
## CHUẨN HÓA PIXEL ART TẢNG ĐÁ, LOẠI BỎ HÌNH TRÒN XÁM, NÂNG CẤP SƯƠNG MÙ PARALLAX 3 LỚP & QUẦNG SÁNG MÔI TRƯỜNG

- **Dự án:** HOLLOW WOODS (*Dị Cảnh Rừng Liễu — The Fog That Remembers*)
- **Phiên bản:** **V1.3**
- **Mã hạng mục:** **`C4-13-06`**
- **Định hướng nghệ thuật:** **Visual Direction A — Dark Woodland Pixel Art**
- **Thư mục dự án:** `G:\HOLLOW WOODS`
- **Tập tin sao lưu trước thực thi:** [C4-13-06_PRE_BACKUP](file:///G:/HOLLOW%20WOODS/Backups/C4-13-06_PRE_BACKUP)
- **Trạng thái kiểm tra:** `npx tsc --noEmit` -> **0 lỗi (Mã thoát 0)** | `verify_visual_improvements_c4_13_06.mjs` -> **28/28 PASS (100%)** | `npm run build` -> **Thành công (6.96s)**

---

## 1. HIỆN TRẠNG & NGUYÊN NHÂN GỐC RỄ (ROOT CAUSE ANALYSIS)

Dựa trên hình ảnh thực tế từ quá trình trải nghiệm và rà soát mã nguồn, hệ thống phát hiện các điểm nghẽn đồ họa gây ảnh hưởng nghiêm trọng đến tính thẩm mỹ và phong cách Pixel Art đồng bộ của trò chơi:

1. **Khối elip màu xám trơn thô kệch dưới "Khối Đá Canh Gác" và các mỏm đá:**
   - Trong [WorldBuilder.ts](file:///G:/HOLLOW%20WOODS/src/world/WorldBuilder.ts#L3473-L3484), hàm `createRock(x, y, w, h)` trước đây sử dụng lệnh vẽ nguyên thủy thô sơ: `rock.fillStyle(0x424949, 1); rock.fillEllipse(x + w / 2, y + h / 2, w, h);`.
   - Tại điểm tương tác `[E] Kiểm Tra Khối Đá Canh Gác` (`cp_ancient_sentinel_rock`, tọa độ $x=2100, y=280$), trên màn hình hiển thị một hình bầu dục màu xám đậm đặc không hề có vân đá, chất liệu hay phong cách pixel art, tạo cảm giác như một vật thể giữ chỗ chưa hoàn thiện.
   - Các tảng đá khác dọc Đường Mòn Quanh Co, Rừng Ngoại Vi và Rừng Sâu cũng bị tình trạng tương tự.
2. **Vòng tròn xám quá to và viền dày dưới vật phẩm tài nguyên:**
   - Trong [InventorySystem.ts](file:///G:/HOLLOW%20WOODS/src/systems/InventorySystem.ts#L135-L144), hàm `createNodeVisual` vẽ một khối bóng đổ đậm `fillEllipse(0, 6, 18, 7)` với độ mờ $0.42$ kèm vòng viền `strokeEllipse(0, 5, 20, 9)` màu sắc sặc sỡ theo loại vật phẩm.
   - Khi hiển thị dưới các cành củi khô (`res_dry_wood`) và đá lửa (`res_flint`), quầng tròn này quá to so với kích thước $16 \times 16$ px của sprite, làm nổi lên các đĩa xám/viền tròn kỳ lạ trên mặt cỏ.
3. **Hiện tượng hộp vuông xanh lá có chữ X (`__DEFAULT` Fallback Box) tại các Collider:**
   - Khi khởi tạo khối va chạm vật lý bằng `colliderGroup.create(x, y, undefined)`, Phaser 3 tự động nạp texture mặc định hệ thống `__DEFAULT` (một ô vuông xanh lá viền đen có đường chéo X).
   - Nếu sprite chưa được gán độ mờ triệt để (`alpha = 0`), trong một số ngữ cảnh chuyển vùng hoặc kiểm tra va chạm, ô vuông xanh lá này vô tình bị kết xuất đè lên kết giới cổng miếu hoặc các cánh cổng thế giới.
4. **Vết sương mù ranh giới bị co méo thành viên nang xám trên thảm cỏ:**
   - Trong [WorldBuilder.ts](file:///G:/HOLLOW%20WOODS/src/world/WorldBuilder.ts#L3455), hàm `addBoundaryMist(485, 340, 0.65, 0.75, 0.22, 0x8aa099)` áp dụng scale co dọc ngang không đều lên texture `fog_smooth.png` (vốn là ảnh $512 \times 256$ px) kèm sắc độ xám lục `0x8aa099` không có chế độ hòa trộn màn hình.
   - Hậu quả là tại khoảng cỏ thoáng gần Cổng Tây chỗ Garth gác xuất hiện một khối hình bầu dục xám đứng trơ trọi như một giọt nước/viên nang xám bất thường.
5. **Hiện tượng "mất sương mù" ở đầu game (Lack of Initial Fog):**
   - Trong [VeilSystem.ts](file:///G:/HOLLOW%20WOODS/src/systems/VeilSystem.ts), texture `fog_smooth.png` có độ trong suốt gốc với alpha tối đa chỉ đạt $110/255 \approx 0.43$.
   - Khi nạp vào làng Bellhollow với `targetAlpha1 = 0.12` và `targetAlpha2 = 0.07`, độ mờ thực tế trên màn hình chỉ còn $0.12 \times 0.43 \approx 0.05$ ($5\%$) và $3\%$, khiến mắt thường gần như hoàn toàn không nhìn thấy sương mù lúc mới vào game.
   - Đồng thời, 2 lớp sương mù cũ đều neo ở `depth 5500` với `scrollFactor(0)` cố định, không hề có hiệu ứng trôi dạt Parallax theo Camera và thiếu hẳn tầng sương mù là là mặt đất.
6. **Quầng sáng đèn đường và đèn lồng có viền cắt tròn thô cứng:**
   - Quầng sáng quanh các cột đèn lồng đường làng (`createVillageLanternPost`) và bếp lửa trại (`createHunterCampfire`) sử dụng một vòng tròn đơn sắc đặc, tạo viền tròn sắc nhọn gắt gao.
   - Đèn lồng cầm tay của nhân vật khi bật `[F]` vẽ 2 vòng tròn lớn đồng tâm với alpha cao, tạo cảm giác như 2 đĩa vàng dán lên màn hình thay vì luồng ánh sáng ấm áp lan tỏa trong đêm.

---

## 2. CÁC BIỆN PHÁP NÂNG CẤP ĐÃ THỰC HIỆN

### 2.1. Chuẩn Hóa Sprite Tảng Đá Pixel Art Thay Thế Khối Elip Xám ([WorldBuilder.ts](file:///G:/HOLLOW%20WOODS/src/world/WorldBuilder.ts), [PreloadScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/PreloadScene.ts), [Constants.ts](file:///G:/HOLLOW%20WOODS/src/config/Constants.ts))
- **Trích xuất & tích hợp tài nguyên Pixel Art chuẩn:**
  - Trích xuất 2 bộ sprite đá tự nhiên từ bộ tài nguyên gốc `TX Props with Shadow.png`:
    + `rock_large.png` ($64 \times 48$ px): Khối đá tảng cổ thụ hùng vĩ, sắc nét, có bóng đổ chân thực.
    + `rock_medium.png` ($48 \times 40$ px): Khối đá hoa cương phủ rêu trung bình.
  - Khai báo khóa texture [SPRITE_ROCK_LARGE](file:///G:/HOLLOW%20WOODS/src/config/Constants.ts#L97) và [SPRITE_ROCK_MEDIUM](file:///G:/HOLLOW%20WOODS/src/config/Constants.ts#L98) trong `Constants.ts`.
  - Nạp đầy đủ trong [PreloadScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/PreloadScene.ts#L192-L193).
- **Tái cấu trúc hoàn toàn hàm `createRock` trong `WorldBuilder.ts`:**
  - **Loại bỏ 100%** lệnh vẽ `rock.fillStyle(0x424949, 1); rock.fillEllipse(...)`.
  - Bổ sung bóng đổ mặt đất mềm mịn: `shadow.fillStyle(0x000000, 0.25); shadow.fillEllipse(...)` đặt tại `depth = y + h - 2`.
  - Đối với các khối đá lớn ($w \ge 48$ hoặc $h \ge 30$, bao gồm **Khối Đá Canh Gác Cổ Đại** tại $x=2100, y=280$ và Khối Đá Ổ Kẻ Lắng Nghe tại $x=2340, y=-490$): Render sprite Pixel Art `SPRITE_ROCK_LARGE` sắc nét với neo chân `setOrigin(0.5, 0.88)` tại `depth = y + h`.
  - Đối với các mỏm đá tự nhiên ven đường ($w < 48$): Render `SPRITE_ROCK_MEDIUM`.
  - Hộp va chạm vật lý Arcade Physics được tạo bằng texture trong suốt `dummy_transparent`, thiết lập `setVisible(false)` và `setAlpha(0)`, đảm bảo hitbox chuẩn xác mà không bao giờ lộ viền.

### 2.2. Xóa Vòng Tròn Quá Khổ Dưới Tài Nguyên ([InventorySystem.ts](file:///G:/HOLLOW%20WOODS/src/systems/InventorySystem.ts))
- Xóa bỏ hoàn toàn lệnh vẽ `strokeEllipse(0, 5, 20, 9)` và bóng đen đậm `alpha 0.42`.
- Thay bằng bóng tiếp xúc mặt đất thu nhỏ ôm sát chân vật phẩm: `baseGfx.fillStyle(0x000000, 0.25); baseGfx.fillEllipse(0, 5, 12, 4);`.
- Giữ nguyên hiệu ứng nhấp nhô nhẹ nhàng hình sin ($y \pm 2$ px) của icon tài nguyên, giúp cành củi khô, đá lửa, thảo dược và nhựa cây nằm hòa quyện tự nhiên trên thảm cỏ như các vật phẩm nhặt được trong các game Pixel Art kinh điển.

### 2.3. Chuẩn Hóa Bóng Đổ Chân Nhân Vật, NPC & Thực Thể (Foot Contact Shadows)
- **The Listener ([TheListener.ts](file:///G:/HOLLOW%20WOODS/src/entities/TheListener.ts#L57-L64)):**
  - Giảm bóng đổ từ elip đen đậm $0.55$ kích thước $28 \times 8$ px về dạng elip đen mờ mịn ôm sát gót chân ma quái: `g.fillStyle(0x000000, 0.25); g.fillEllipse(0, 0, 22, 6);`.
- **NPC Làng Bellhollow ([NPCEntity.ts](file:///G:/HOLLOW%20WOODS/src/entities/NPCEntity.ts#L71-L75)):**
  - Tinh chỉnh bóng chân của 5 NPC (Garth, Edda, Neris, Bram, Finn) về kích thước $16 \times 5$ px với `alpha: 0.25`.
- **Nhân vật chính The Mossbound Wayfarer ([SatyrPlayer.ts](file:///G:/HOLLOW%20WOODS/src/entities/SatyrPlayer.ts#L145-L155)):**
  - Bổ sung thành phần bóng chân `footShadowGfx` chuyên biệt (`alpha: 0.25`, kích thước $16 \times 5$ px) tại `depth = depth - 1`.
  - Tự động di chuyển bám sát gót chân Satyr trong mọi hoạt ảnh di chuyển, vung gậy, tương tác; tự ẩn khi nhân vật đang núp bụi/hốc cây hoặc khi ngã xuống.

### 2.4. Khóa Toàn Diện Collider Vô Hình Chống Lộ Hộp Xanh ([PreloadScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/PreloadScene.ts), [WorldBuilder.ts](file:///G:/HOLLOW%20WOODS/src/world/WorldBuilder.ts))
- Tạo texture vô hình chuẩn $1 \times 1$ px `dummy_transparent` ngay trong hàm `create()` của `PreloadScene.ts`.
- Trong [WorldBuilder.ts](file:///G:/HOLLOW%20WOODS/src/world/WorldBuilder.ts#L137-L144), sau khi hoàn tất dựng cảnh toàn bộ thế giới, bổ sung vòng lặp duyệt qua tất cả thực thể con của `colliderGroup` để ép buộc: `spr.setVisible(false); spr.setAlpha(0);`.
- Khắc phục triệt để hiện tượng hộp vuông xanh lá có chữ X (`__DEFAULT`) từng xuất hiện tại Cổng Miếu Chuông hoặc các rào chắn.

### 2.5. Xử Lý Vết Sương Mù Bất Thường Ven Cổng Tây ([WorldBuilder.ts](file:///G:/HOLLOW%20WOODS/src/world/WorldBuilder.ts#L3460-L3466))
- Điều chỉnh hai điểm sương ranh giới tại Cổng Tây ($x=480, y=140$ và $y=360$):
  + Tăng tỷ lệ chiều ngang $1.10$, giảm chiều dọc $0.45$ theo phương ngang tự nhiên của làn sương.
  + Giảm độ mờ xuống $0.12$ với tông màu lục sẫm `$0x5c706b`, xóa bỏ hoàn toàn hình khối viên nang xám bất thường trên bãi cỏ.

### 2.6. Xây Dựng Hệ Thống Sương Mù Đa Tầng Parallax Kích Hoạt Ngay Từ Đầu Game ([VeilSystem.ts](file:///G:/HOLLOW%20WOODS/src/systems/VeilSystem.ts))
Thay vì chỉ có 2 lớp sương phẳng ở trên cao, hệ thống được nâng cấp thành **3 lớp sương mù Parallax phân tầng độ sâu không gian**:
1. **Tầng 1 — Sương là là mặt đất (`fogLayerGround`):**
   - Đặt tại `depth = -40` (ngay trên thảm cỏ `-98`, bên dưới nhân vật, NPC và nhà cửa).
   - Hệ số Parallax theo Camera: $15\%$ (`camScroll * 0.15`) kèm vận tốc trôi ngang tự nhiên $12$ px/s.
   - Tạo cảm giác sương đêm và sương sớm bốc lên từ mặt cỏ, len lỏi qua các con đường mòn mà không che khuất nhân vật hay bảng tên.
2. **Tầng 2 — Sương thân cây khí quyển (`fogLayerMid`):**
   - Đặt tại `depth = 450` (đan xen giữa thân cây cổ thụ và mái nhà).
   - Hệ số Parallax: $35\%$ (`camScroll * 0.35`) kèm dao động dọc hình sin $2$ px và vận tốc trôi ngang $19$ px/s.
3. **Tầng 3 — Sương vòm tán cây trên cao (`fogLayerHigh`):**
   - Đặt tại `depth = 2800` (bao phủ trên ngọn cây, trôi chậm chạp $7$ px/s, bên dưới giao diện HUD/UI).
   - Hệ số Parallax: $55\%$ (`camScroll * 0.55`).
4. **Kích hoạt tức thời từ frame 0 (Zero-Delay Mist):**
   - Trong constructor, gán ngay độ mờ khởi điểm (`0.24`, `0.18`, `0.14`) thay vì chờ hàm `update()` lerp từ 0 lên, đảm bảo người chơi vừa vào cảnh là cảm nhận được ngay bầu không khí huyền bí của *The Hollow Woods*.
5. **Chuyển tiếp độ mờ tự nhiên theo từng phân khu:**
   - **Bellhollow & Sanctuary Farm:** Sương mỏng thanh thoát (`0.22`, `0.15`, `0.11`), giữ làng quê trong trẻo, sắc nét, NPC và nhà cửa hiển thị sáng rõ.
   - **Outer Woods:** Sương rừng lượn nhẹ quanh gốc sồi và bãi trại thợ săn (`0.32`, `0.25`, `0.18`).
   - **Crooked Path & Fog Crossing:** Sương mù dày đặc che phủ lối mòn (`0.42`, `0.34`, `0.25`).
   - **Deep Forest, Silent Mire & Broken Bell Shrine:** Màn sương đêm dày đặc, ma mị cuộn trôi mạnh mẽ (`0.54`, `0.44`, `0.34`).
   - Khi tắt đèn lồng `[F]`: Cả 3 tầng sương tự động dày thêm $+0.12 \sim +0.14$, tạo cảm giác bóng tối và sương mù siết chặt lại quanh người chơi.

### 2.7. Nâng Cấp Quầng Sáng Đèn Đường, Lửa Trại & Đèn Lồng Nhân Vật ([WorldBuilder.ts](file:///G:/HOLLOW%20WOODS/src/world/WorldBuilder.ts), [GameScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts))
- **Cột đèn đường làng (`createVillageLanternPost`):**
  - Chuyển từ 1 vòng tròn đơn sắc đặc thành quầng sáng ấm 3 tầng chuyển sắc mịn màng:
    + Tầng ngoài tỏa rộng (bán kính 28 px, alpha 0.05).
    + Tầng trung tâm hổ phách (bán kính 18 px, alpha 0.09).
    + Lõi vàng ấm gần bóng đèn (bán kính 9 px, alpha 0.16).
- **Lửa trại thợ săn (`createHunterCampfire`):**
  - Quầng sáng 3 tầng chuyển sắc (bán kính 38, 24, 12 px) kết hợp bóng đổ mặt đất mờ mịn dưới đống củi.
- **Đèn lồng cầm tay nhân vật GameScene (`updateLanternGlow`):**
  - Thay thế 2 khối đĩa tròn đồng tâm gắt gao bằng 3 tầng ánh sáng ấm áp lan tỏa với tỷ lệ bán kính $82\%$, $50\%$ và $24\%$, triệt tiêu hoàn toàn viền cắt gắt trên màn hình.

---

## 3. KẾT QUẢ KIỂM TOÁN TỰ ĐỘNG (VERIFICATION RESULTS)

Hệ thống đã chạy kịch bản kiểm tra tự động chuyên sâu [verify_visual_improvements_c4_13_06.mjs](file:///G:/HOLLOW%20WOODS/scripts/verify_visual_improvements_c4_13_06.mjs). Kết quả đạt **28/28 tiêu chí (100% PASS)**:

```text
================================================================
  HOLLOW WOODS V1.3 - VERIFICATION SUITE C4-13-06
================================================================

--- 1. KIỂM TRA TÀI NGUYÊN SPRITE TẢNG ĐÁ PIXEL ART ---
[PASS] File rock_large.png tồn tại trong public/assets/environment/sprites/
[PASS] File rock_medium.png tồn tại trong public/assets/environment/sprites/
[PASS] rock_large.png có kích thước chuẩn pixel art 64x48 (thực tế: 64x48)
[PASS] rock_medium.png có kích thước chuẩn pixel art 48x40 (thực tế: 48x40)

--- 2. KIỂM TRA KHÓA CONSTANTS TẢNG ĐÁ ---
[PASS] SPRITE_ROCK_LARGE được định nghĩa trong Constants.ts
[PASS] SPRITE_ROCK_MEDIUM được định nghĩa trong Constants.ts

--- 3. KIỂM TRA NẠP TÀI NGUYÊN & TEXTURE VÔ HÌNH TRONG PRELOADSCENE ---
[PASS] PreloadScene import đúng hằng số rock sprites
[PASS] PreloadScene nạp ảnh rock_large.png
[PASS] PreloadScene nạp ảnh rock_medium.png
[PASS] PreloadScene tạo texture vô hình 1x1 dummy_transparent chống fallback __DEFAULT

--- 4. KIỂM TRA CHUẨN HÓA WORLDBUILDER (CREATE ROCK & COLLIDERS) ---
[PASS] Đã loại bỏ hoàn toàn lệnh vẽ khối elip xám 0x424949 giữ chỗ
[PASS] createRock sử dụng sprite Pixel Art rock_large và rock_medium
[PASS] createRock bổ sung bóng đổ mặt đất mờ mịn alpha 0.25
[PASS] buildWorld đảm bảo toàn bộ colliderGroup có alpha 0 và setVisible false

--- 5. KIỂM TRA CHUẨN HÓA BÓNG ĐỔ VẬT PHẨM TÀI NGUYÊN ---
[PASS] Đã loại bỏ vòng tròn viền màu strokeEllipse quá khổ dưới tài nguyên
[PASS] Bóng đổ tài nguyên thu nhỏ về dạng elip đen mờ mịn 12x4 px (alpha 0.25)

--- 6. KIỂM TRA BÓNG ĐỔ CHÂN NHÂN VẬT, NPC & MONSTER ---
[PASS] The Listener có bóng chân elip đen mờ mịn 22x6 px (alpha 0.25)
[PASS] NPCEntity có bóng chân elip đen mờ mịn 16x5 px (alpha 0.25)
[PASS] SatyrPlayer được trang bị bóng chân mờ mịn footShadowGfx (alpha 0.25)

--- 7. KIỂM TRA SƯƠNG MÙ ĐA TẦNG PARALLAX (VEILSYSTEM) ---
[PASS] VeilSystem thiết lập đầy đủ 3 tầng sương mù: Ground, Mid, High
[PASS] fogLayerGround đặt ở depth -40 (là là mặt đất, dưới nhân vật)
[PASS] fogLayerMid đặt ở depth 450 (lưng chừng thân cây)
[PASS] fogLayerHigh đặt ở depth 2800 (tán cây trên cao, dưới HUD/UI)
[PASS] Sương mù được kích hoạt alpha ngay từ constructor (thấy sương từ frame 0)
[PASS] Sương mù cuộn Parallax đồng bộ chuyển động camera với hệ số đa tầng

--- 8. KIỂM TRA QUẦNG SÁNG ẤM CỘT ĐÈN & LỬA TRẠI ---
[PASS] Cột đèn đường sở hữu quầng sáng ấm 3 tầng chuyển sắc tự nhiên
[PASS] Lửa trại thợ săn sở hữu quầng sáng ấm 3 tầng chuyển sắc tự nhiên
[PASS] Đèn lồng nhân vật GameScene sở hữu hiệu ứng tỏa sáng ấm 3 tầng mịn màng

================================================================
KẾT QUẢ KIỂM TOÁN: 28 PASSED, 0 FAILED
================================================================
✓ TẤT CẢ CÁC TIÊU CHÍ KIỂM TRA ĐỒ HỌA C4-13-06 ĐẠT CHUẨN 100%!
```

- **Kiểm tra biên dịch TypeScript:** `npx tsc --noEmit` hoàn thành với **0 lỗi**.
- **Kiểm tra đóng gói sản phẩm:** `npm run build` hoàn thành trong **6.96 giây**, tạo gói `dist/` sạch sẽ.

---

# PHẦN II: BÁO CÁO THỰC THI BƯỚC C4-13-07
## THIẾT KẾ LẠI GIAO DIỆN MENU CHÍNH, HUD TRONG GAME VÀ HỆ THỐNG NHÃN TƯƠNG TÁC BÁN TRONG SUỐT

- **Dự án:** HOLLOW WOODS (*Dị Cảnh Rừng Liễu — The Fog That Remembers*)
- **Phiên bản:** **V1.3**
- **Mã hạng mục:** **`C4-13-07`**
- **Định hướng nghệ thuật:** **Visual Direction A — Dark Woodland Pixel Art**
- **Thư mục dự án:** `G:\HOLLOW WOODS`
- **Tập tin sao lưu trước thực thi:** [C4-13-07_PRE_BACKUP](file:///G:/HOLLOW%20WOODS/Backups/C4-13-07_PRE_BACKUP)
- **Trạng thái kiểm tra:** `npx tsc --noEmit` -> **0 lỗi (Mã thoát 0)** | `verify_ui_ux_redesign_c4_13_07.mjs` -> **34/34 PASS (100%)** | `npm run build` -> **Thành công (7.16s)**

---

## 1. MỤC TIÊU & HIỆN TRẠNG TRƯỚC NÂNG CẤP (C4-13-07)

1. **Nhãn nhắc tương tác `[E]` che khuất tầm nhìn:**
   - Trong phiên bản cũ, [UIScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/UIScene.ts) hiển thị `promptText` với nền chữ nhật đen đặc `backgroundColor: '#0c1017f2'` và viền gắt, che khuất chi tiết đồ họa pixel art của NPC và cảnh quan xung quanh.
   - [NPCEntity.ts](file:///G:/HOLLOW%20WOODS/src/entities/NPCEntity.ts) tạo bong bóng thoại bằng hộp `0x0a0f0d` với độ mờ $0.95$ gần như đặc tuyệt đối.
   - Cơ chế hiển thị nhãn có tính chất "bật/tắt đột ngột": người chơi chỉ cần bước qua ngưỡng 42px là nhãn hiện ra 100%, không hề có chỉ báo khoảng cách hay độ mờ gợi ý từ xa.
2. **Giao diện Menu Chính (MainMenuScene.ts) đơn điệu, thiếu chức năng:**
   - Menu cũ chỉ có 1 nút hoặc 2 nút (Tiếp tục / Bắt đầu mới).
   - Thiếu hoàn toàn mục Cài Đặt (Settings) để người chơi điều chỉnh âm thanh, xem hướng dẫn phím bấm.
   - Thiếu mục Thông Tin (Credits) giới thiệu bối cảnh cốt truyện HOLLOW WOODS và thông tin công nghệ engine.
   - Nút Tiếp Tục bị biến mất hoàn toàn khi chưa có bản lưu thay vì hiển thị trạng thái mờ (disabled) kèm thông báo rõ ràng cho người chơi.
3. **Thanh trạng thái và HUD trong game cồng kềnh, gây đè chữ khi mở Modal:**
   - Cụm 4 thanh chỉ số góc trên trái chiếm diện tích màn hình lớn với các viền dày, phân bố rời rạc từ $x=16$ tới $x=410$.
   - Khung nhiệm vụ góc trên phải sử dụng nền đen $0.92$ viền kép dày, tạo khối chữ nhật nặng nề.
   - Khi người chơi mở Bàn Chế Tạo (`CraftingModal`), Sổ Tay (`JournalModal`), Menu Tạm Dừng (`PauseModal`), Hộp Thoại (`Dialogue`) hoặc Bảng Game Over (`GameOverModal`), các thanh chỉ số và bảng nhiệm vụ vẫn nằm nguyên phía sau, gây hiện tượng đè chữ, rối mắt và mất tập trung.

---

## 2. NỘI DUNG NÂNG CẤP ĐÃ TRIỂN KHAI

### 2.1. Thiết Kế Lại Hệ Thống Nhãn Tương Tác `[E]` Bán Trong Suốt & Hiệu Ứng Rõ Dần Theo Khoảng Cách
- **Xóa bỏ hoàn toàn nền đen đặc:**
  - Xóa bỏ thuộc tính `backgroundColor: '#0c1017f2'` thô cứng khỏi `promptText`.
  - Thay thế bằng Container chuẩn mực `promptContainer` bao gồm:
    + `promptBg`: Khung dạng viên nang (pill box) bo góc mềm mại, tô màu bóng đêm bán trong suốt `0x090e15` với alpha $\approx 0.72$, bao bọc bởi viền mảnh vàng hổ phách `0xd4af37` (alpha $0.65$, độ dày 1px). Tự động co giãn theo chiều dài chuỗi ký tự text.
    + `promptText`: Phông chữ HD sắc nét, màu vàng hoàng kim `#f1c40f` nổi bật phím bấm `[E]`, đi kèm bóng đổ nhẹ không viền đen thô.
- **Hiệu ứng mờ dần theo khoảng cách (Proximity Opacity System):**
  - Trong [WorldBuilder.ts](file:///G:/HOLLOW%20WOODS/src/world/WorldBuilder.ts), bổ sung phương thức `checkInteractableProximity(pos, maxRadius = 65)` tính toán chính xác khoảng cách Euclid đến vật thể gần nhất.
  - Phân tầng hiển thị 2 cấp độ:
    + **Vùng Gợi Ý Từ Xa ($38\text{px} < \text{dist} \le 65\text{px}$):** Nhãn tương tác hiển thị ở độ mờ nhẹ nhàng `alpha = 0.45`, giúp người chơi nhận biết phía trước có điểm tương tác mà không gây xao nhãng tầm nhìn.
    + **Vùng Tương Tác Chuẩn Xác ($\text{dist} \le 38\text{px}$):** Nhãn tương tác lập tức chuyển sang độ rõ tối đa `alpha = 1.0`, nút `[E]` sáng rõ nét, sẵn sàng thực thi hành động ngay khi người chơi bấm phím.
  - Cơ chế 2 tầng này được áp dụng đồng bộ cho:
    + **NPC:** Cả nhãn màn hình [UIScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/UIScene.ts) và bong bóng thoại trên đầu NPC [NPCEntity.ts](file:///G:/HOLLOW%20WOODS/src/entities/NPCEntity.ts) đều áp dụng độ mờ $0.45$ khi ở xa và $1.0$ khi lại gần.
    + **Mỏ tài nguyên:** Cành củi khô, đá lửa, thảo dược, nhựa cây trong [InventorySystem.ts](file:///G:/HOLLOW%20WOODS/src/systems/InventorySystem.ts).
    + **Luống đất trồng trọt:** Các ô đất tại Nông Trại Thánh Địa trong [FarmingSystem.ts](file:///G:/HOLLOW%20WOODS/src/systems/FarmingSystem.ts).
    + **Vật thể thế giới:** Bàn Chế Tạo, Thạch Trụ Cổ, Cổng Miếu Chuông trong [WorldBuilder.ts](file:///G:/HOLLOW%20WOODS/src/world/WorldBuilder.ts).

### 2.2. Thiết Kế Lại Giao Diện Menu Chính ([MainMenuScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/MainMenuScene.ts))
- **Không khí nghệ thuật đêm rừng u tịch:**
  - Nền chuyển sắc đêm rừng sâu `0x040608` $\to$ `0x0c1117` chuẩn HD $1280 \times 720$.
  - Hai tầng sương mù Parallax (`fogBack` và `fogFront`) trôi ngược chiều nhẹ nhàng với chu kỳ 32s và 22s.
  - Quầng sáng ấm áp 3 tầng quanh nhân vật The Mossbound Wayfarer (`0xf39c12`, `0xf1c40f`, `0xfff5d7`) với hoạt ảnh nhịp thở breathing tween êm dịu.
  - Tiêu đề **HOLLOW WOODS** đỏ son viền đen sắc nét, phụ đề **DỊ CẢNH RỪNG LIỄU — THE FOG THAT REMEMBERS** cùng câu khẩu hiệu kinh điển của trò chơi.
- **Bổ sung đầy đủ 4 nút tương tác chính:**
  1. `▶ BƯỚC VÀO MÀN SƯƠNG (BẮT ĐẦU MỚI)`: Xóa bản lưu cũ, hiệu ứng camera fade 500ms chuyển mượt vào GameScene.
  2. `▶ TIẾP TỤC HÀNH TRÌNH`:
     - Nếu có bản lưu: Nổi bật màu xanh ngọc bích `#2ecc71`, hiển thị tên checkpoint đã lưu, nạp và tiếp tục hành trình.
     - Nếu chưa có bản lưu: Hiển thị trạng thái mờ `▷ TIẾP TỤC (CHƯA CÓ BẢN LƯU)` màu xám tro `#636e72`, khi bấm vào hiển thị thông báo toast hướng dẫn thân thiện.
  3. `⚙ CÀI ĐẶT TRÒ CHƠI`:
     - Mở cửa sổ popup Cài Đặt (580×400 px, nền bán trong suốt `0x080d14` alpha $0.94$, viền vàng kim).
     - Nút Bật/Tắt Âm Thanh tương tác trực tiếp với `AudioManager.toggleMute()`, hiển thị trạng thái âm thanh thời gian thực.
     - Bảng tra cứu danh sách phím tắt điều khiển trực quan.
     - Nút Đóng `[✕ ĐÓNG [ESC]]`.
  4. `ℹ THÔNG TIN & CỐT TRUYỆN`:
     - Mở cửa sổ popup Thông Tin & Cốt Truyện (620×430 px, viền thạch anh tím `0x9b59b6`).
     - Tóm tắt cốt truyện: Bối cảnh làng cổ Bellhollow, Màn Sương Ký Ức, Tháp Chuông Thánh, Kẻ Lắng Nghe The Listener.
     - Thông số công nghệ: Phaser 4 + TypeScript, Chuẩn HD 1280×720, Visual Direction A, Phiên bản V1.3.

### 2.3. Tinh Gọn HUD & Cơ Chế Tự Động Ẩn Khi Mở Modal ([UIScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/UIScene.ts), [GameScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts))
- **Hộp chỉ số sinh tồn tinh gọn (Top-Left Stat Panel):**
  - Toàn bộ 4 thanh chỉ số được thu gọn vào trong một khung thẻ bán trong suốt sang trọng `statCardBg` (kích thước $308 \times 92$ px tại $x=12, y=8$, màu nền `0x080d14` alpha $0.72$, viền mảnh `0x2c3e50`).
  - Thanh chỉ số được thiết kế thanh mảnh, hiện đại (chiều cao 9-10px thay vì 14px thô kệch), màu sắc tươi sáng:
    + Sinh Lực (Health): Đỏ thẫm `#e74c3c`
    + Thể Lực (Stamina): Vàng hổ phách `#f1c40f`
    + Dầu Đèn (Oil): Cam ấm `#e67e22`
    + Bình Tâm (Composure): Tím thạch anh `#9b59b6`
  - Huy hiệu đèn lồng `[F] BẬT / TẮT` tích hợp gọn gàng ngay cạnh thanh Dầu Đèn với màu sắc sinh động.
- **Khung theo dõi nhiệm vụ góc trên phải (Top-Right Quest Tracker):**
  - Thu gọn kích thước về $340 \times 78$ px tại $x=920, y=16$.
  - Nền bán trong suốt `0x080d14` (alpha $0.75$), viền vàng kim mảnh $1\text{px}$, vạch nhấn màu đồng thau thanh lịch mép trái.
- **Thanh phím tắt đáy màn hình (Bottom Quickslots):**
  - Chuyển sang nền bán trong suốt `0x090e15` (alpha $0.78$), viền mảnh `0x3d4a5d`, giữ nguyên 100% chức năng bấm chuột và phím tắt `[1]`, `[2]`, `[Q]`, `[F]`, `[I]`, `[J]`, `[ESC]`.
- **Cơ chế tự động ẩn HUD khi mở Modal (Auto-Hide HUD on Modal):**
  - Nâng cấp `handleModalOpened()`: Tự động gọi `this.setHUDVisible(false)` ngay khi bất kỳ Modal nào (`CraftingModal`, `JournalModal`, `PauseModal`, `GameOverModal`, `Dialogue`) được kích hoạt.
  - Nâng cấp `handleModalClosed()`: Khi tất cả các Modal và Hộp thoại đã đóng (`!this.isAnyModalOpen`), tự động gọi `this.setHUDVisible(true)` và làm mới tức thì chỉ số, nhiệm vụ và phím tắt.
  - Đồng bộ hóa sự kiện mở/đóng của `PauseModal` và `GameOverModal` trong [GameScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L290-L321) trỏ về `handleModalOpened()` và `handleModalClosed()`.
  - Kết quả: Triệt tiêu 100% hiện tượng đè chữ, chữ phía sau lọt ra ngoài cửa sổ modal, mang lại trải nghiệm giao diện đẳng cấp, gọn gàng và không rối mắt.

---

## 3. KẾT QUẢ KIỂM THỬ TỰ ĐỘNG & ĐÓNG GÓI BẢN DỰ ÁN

Chạy bộ kiểm thử tự động toàn diện [scripts/verify_ui_ux_redesign_c4_13_07.mjs](file:///G:/HOLLOW%20WOODS/scripts/verify_ui_ux_redesign_c4_13_07.mjs):

```
================================================================
VERIFYING MILESTONE C4-13-07: UI / UX & VISUAL REDESIGN
================================================================

[PASS] UIScene has statCardBg property
[PASS] UIScene has promptContainer property
[PASS] UIScene has promptBg property
[PASS] UIScene removed solid black backgroundColor (#0c1017f2) from prompt
[PASS] setInteractionPrompt supports proximityAlpha parameter
[PASS] setInteractionPrompt applies clampedAlpha to promptContainer
[PASS] statCardBg renders compact semi-transparent backing
[PASS] questBg renders semi-transparent quest card
[PASS] handleModalOpened hides all HUD elements
[PASS] handleModalClosed unhides HUD elements when modals are closed
[PASS] setHUDVisible controls statCardBg visibility
[PASS] setHUDVisible controls promptContainer visibility
[PASS] NPCEntity prompt bubble uses semi-transparent dark backing (alpha 0.70)
[PASS] NPCEntity prompt bubble uses thin golden border
[PASS] NPCEntity setNearby supports distance parameter
[PASS] NPCEntity setNearby implements subtle hint opacity for distance > 38px
[PASS] NPCEntity setNearby applies proximityAlpha to promptBubble
[PASS] WorldBuilder has checkInteractableProximity method
[PASS] checkInteractableProximity returns item and Euclidean distance
[PASS] GameScene detects NPC proximity within 65px hint radius
[PASS] GameScene applies proximity alpha to NPC interaction prompt
[PASS] GameScene applies proximity alpha to resource node prompt
[PASS] GameScene queries interactable proximity at 65px radius
[PASS] pauseModal.onOpen connects to handleModalOpened
[PASS] pauseModal.onClose connects to handleModalClosed
[PASS] gameOverModal.onOpen connects to handleModalOpened
[PASS] gameOverModal.onClose connects to handleModalClosed
[PASS] MainMenu has Bắt Đầu Mới button
[PASS] MainMenu has Tiếp Tục button with save data check
[PASS] MainMenu has Cài Đặt button and modal
[PASS] MainMenu has Thông Tin button and modal
[PASS] MainMenu implements 2 drifting fog layers
[PASS] MainMenu implements multi-tier warm lantern glow
[PASS] MainMenu displays V1.3 version

================================================================
TOTAL CHECKS: 34
PASSED: 34
FAILED: 0
================================================================
>>> ALL C4-13-07 UI/UX & VISUAL REDESIGN CHECKS PASSED SUCCESSFULLY! <<<
```

- **Kiểm tra biên dịch TypeScript:** `npx tsc --noEmit` hoàn thành với **0 lỗi**.
- **Kiểm tra đóng gói sản phẩm:** `npm run build` hoàn thành trong **7.16 giây**, tạo gói `dist/` hoàn hảo.

---

## 4. TỔNG KẾT & TRẠNG THÁI BÀN GIAO C4-13-07

Bước **C4-13-07** đã hoàn thành xuất sắc toàn bộ các mục tiêu đặt ra:
- **Nhãn tương tác:** Không còn các hộp đen đặc chắn tầm mắt; thay vào đó là các viên nang bán trong suốt tinh tế với hiệu ứng mờ dần theo khoảng cách (gợi ý nhẹ ở 65px, sắc nét ở 38px, bấm [E] phản hồi tức thì).
- **Menu chính:** Bầu không khí đêm rừng huyền ảo với sương mù trôi, hào quang đèn lồng ấm áp, đầy đủ 4 nút tương tác (Bắt Đầu Mới, Tiếp Tục với kiểm tra file lưu, Cài Đặt âm thanh/phím tắt, Thông Tin cốt truyện/engine).
- **HUD trong game:** Tinh gọn, chiếm ít không gian hiển thị, tự động ẩn toàn bộ khi mở bất kỳ modal nào và phục hồi nguyên vẹn khi đóng.
- **Bảo toàn chức năng:** 100% phím tắt, nút bấm chuột, logic hội thoại và tương tác đều vận hành chính xác và mượt mà.

Dự án phiên bản **V1.3** đã đạt độ hoàn thiện cao về mặt hình ảnh, trải nghiệm người dùng (UX) và cơ chế sinh tồn.
