# HOLLOW WOODS V1.5 — ĐẠI TU ĐỒ HỌA & BỐ CỤC THẾ GIỚI
## BÁO CÁO KỸ THUẬT: CHUẨN HÓA QUY CHUẨN KÍCH THƯỚC PIXEL ART, ĐIỂM NEO & BẢNG MÀU

**Dự án:** HOLLOW WOODS: The Fog That Remembers  
**Mã tài liệu:** `V15-09` / `04_Graphics_And_World_Layout.md`  
**Phiên bản:** V1.5 (Visual & Gameplay Overhaul)  
**Nhánh Git:** `feat/v1.5-visual-gameplay-overhaul`  
**Ngày thực hiện:** 18/11/2026  
**Trạng thái:** Hoàn tất xuất sắc (14/14 bài kiểm tra tự động PASS 100%, 0 lỗi TypeScript, bản dựng Vite thành công)  

---

### 1. NGUYÊN TẮC THIẾT KẾ & THƯỚC ĐO TỶ LỆ CHUẨN (UNIFIED SCALE STANDARD)

Trước bản nâng cấp V1.5, các asset nhân vật và quái vật được nhập từ nhiều nguồn mã nguồn mở và gói asset khác nhau (N3XUS, 2D SL Knight, Roguelike, v.v.), dẫn đến sự lệch pha thị giác nghiêm trọng:
- NPC người có chiều cao hiển thị lên tới $80 - 96\text{ px}$, cao gần gấp đôi các công trình nhà ở dân cư ($48\text{ px}$) và trạm gác cổng làng ($26\text{ px}$).
- Cậu bé Finn (Errand Boy) cao ngang ngửa người lớn ($50\text{ px}$).
- Các khoảng trống trong suốt (transparent padding) ở đáy frame khiến điểm neo chân bị trôi dạt (từ $58/64$, $62/64$ đến $63/64$ hay $140/160$), gây hiện tượng chân nhân vật bị lơ lửng hoặc lún sâu vào lòng đất khi sắp xếp độ sâu Y-Depth Sorting.
- Viền đen gắt kẽ số học (`#000000`) gây xung đột với tông màu u ám của sương mù woodland.

#### Bảng Thước Đo Tỷ Lệ Chuẩn (Unified Scale Standard)

| Phân Loại Thực Thể | Tên Nhân Vật / Thực Thể | Chiều Cao Cũ | Chiều Cao Chuẩn V1.5 | Tỷ Lệ Co Giãn (Scale) | Chiều Rộng Vai | Kích Thước Bóng Đổ Elip ($W \times H$) | Điểm Neo Chân Chuẩn |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Nhân Vật Chính** | The Mossbound Wayfarer | $43\text{ px}$ | **$43\text{ px}$** | $1.000$ | $18\text{ px}$ | $18 \times 6\text{ px}$ | `origin(0.5, 1.0)` |
| **NPC Người Lớn** | Garth (Người Canh Cổng) | $55\text{ px}$ | **$46\text{ px}$** | $0.836$ | $22\text{ px}$ | $22 \times 7\text{ px}$ | `origin(0.5, 1.0)` |
| **NPC Người Lớn** | Edda (Trưởng Lão Dược Sư)| $51\text{ px}$ | **$45\text{ px}$** | $0.882$ | $16\text{ px}$ | $16 \times 5\text{ px}$ | `origin(0.5, 1.0)` |
| **NPC Người Lớn** | Neris (Thầy Thuốc Bí Thuật)| $44\text{ px}$ | **$44\text{ px}$** | $1.000$ | $15\text{ px}$ | $15 \times 5\text{ px}$ | `origin(0.5, 1.0)` |
| **NPC Người Lớn** | Bram (Thợ Rèn & Làm Gốm)| $63\text{ px}$ | **$47\text{ px}$** | $0.746$ | $24\text{ px}$ | $24 \times 7.5\text{ px}$| `origin(0.5, 1.0)` |
| **NPC Người Lớn** | Hiệp Sĩ Canh Lửa (Đứng) | $47\text{ px}$ | **$47\text{ px}$** | $1.000$ | $22\text{ px}$ | $22 \times 7\text{ px}$ | `origin(0.5, 1.0)` |
| **NPC Người Lớn** | Hiệp Sĩ Canh Lửa (Quỳ) | $44\text{ px}$ | **$44\text{ px}$** | $1.000$ | $22\text{ px}$ | $22 \times 7\text{ px}$ | `origin(0.5, 1.0)` |
| **NPC Trẻ Em** | Finn (Cậu Bé Sai Vặt) | $50\text{ px}$ | **$35\text{ px}$** | $0.700$ | $12\text{ px}$ | $12 \times 4\text{ px}$ | `origin(0.5, 1.0)` |
| **Sinh Vật** | Dơi Sương Mù (Mist Bat) | $31\text{ px}$ | **$30\text{ px}$** | $0.968$ | $12\text{ px}$ | $12 \times 4\text{ px}$ | `origin(0.5, 1.0)` |
| **Sinh Vật** | Hồn Ma (Wandering Shade)| $31\text{ px}$ | **$30\text{ px}$** | $0.968$ | $16\text{ px}$ | $16 \times 5\text{ px}$ (mờ)| `origin(0.5, 1.0)` |
| **Quái Vật** | Goblin Scout | $23\text{ px}$ | **$23\text{ px}$** | $1.000$ | $16\text{ px}$ | $16 \times 5\text{ px}$ | `origin(0.5, 1.0)` |
| **Quái Vật** | Quạ Bóng Tối (Shadow Crow)| $33\text{ px}$ | **$32\text{ px}$** | $0.970$ | $14\text{ px}$ | $14 \times 4.5\text{ px}$| `origin(0.5, 1.0)` |
| **Quái Vật** | Sói Xương (Skull Wolf) | $53\text{ px}$ | **$52\text{ px}$** | $0.981$ | $32\text{ px}$ | $34 \times 10\text{ px}$ | `origin(0.5, 1.0)` |
| **Quái Tinh** | The Listener | $62\text{ px}$ | **$62\text{ px}$** | $1.000$ | $22\text{ px}$ | $24 \times 7\text{ px}$ | `origin(0.5, 1.0)` |
| **Quái Tinh** | Hiệp Sĩ Sa Ngã (Fallen) | $47\text{ px}$ | **$47\text{ px}$** | $1.000$ | $24\text{ px}$ | $24 \times 7.5\text{ px}$| `origin(0.5, 1.0)` |
| **Kỵ Binh** | Kỵ Sĩ Kinh Hoàng (Horseman)| $56\text{ px}$ | **$56\text{ px}$** | $1.000$ | $44\text{ px}$ | $48 \times 14\text{ px}$ | `origin(0.5, 1.0)` |
| **Trùm Cuối** | Hooded Knight Boss | $160\text{ px}$ | **$140\text{ px}$** | $0.875$ | $50\text{ px}$ | $52 \times 14\text{ px}$ | `origin(0.5, 1.0)` |

---

### 2. CÔNG NGHỆ XỬ LÝ ẢNH TỰ ĐỘNG BẰNG PNGJS (`scripts/standardize_pixel_art_assets.mjs`)

Hệ thống đã thực hiện xử lý đồng bộ **44 tệp asset đồ họa** của toàn bộ nhân vật, NPC và quái vật trong thư mục `public/assets/characters/`:

1. **Cắt Bỏ Khoảng Trống Dưới Chân (Trim Padding & Align Baseline):**
   - Quét toàn bộ các frame trong spritesheet để xác định đường cơ sở tiếp đất toàn cục ($Y_{\text{ground}}$).
   - Di chuyển toàn bộ pixel cơ thể nhân vật sao cho điểm tiếp đất thấp nhất luôn rơi chính xác vào dòng đáy của frame ($y = \text{frameHeight} - 1$, tức $y=63$ cho frame $64\times 64$, $y=31$ cho frame $32\times 32$, $y=159$ cho frame $160\times 160$).
   - Kết quả: Khoảng trống đáy `BottomGap = 0px` trên 100% các sprite.

2. **Quy Chuẩn Điểm Neo Chân Tuyệt Đối `origin(0.5, 1.0)`:**
   - Do chân nhân vật luôn chạm đáy frame, điểm neo `origin(0.5, 1.0)` trong Phaser đặt tọa độ $(x, y)$ của Sprite trùng khít $100\%$ với gót chân đứng trên mặt đất.
   - Thống nhất cơ chế Y-Sorting: `this.setDepth(Math.floor(this.y))` đảm bảo tính tầng lớp tự nhiên khi đi trước hay sau các hàng cây, bia đá và công trình.

3. **Chuẩn Hóa Viền Tối Dịu (Dark Charcoal Outline `#18141a`):**
   - Thay thế toàn bộ pixel viền đen gắt kỹ thuật số thô ráp ($R \le 26, G \le 26, B \le 26$) thành màu than chì tối tự nhiên `#18141a` ($R=24, G=20, B=26$).
   - Tạo độ hòa hợp quang học mềm mại với nền rừng rậm và sương mù.

4. **Đồng Bộ Bảng Màu Trung Cổ U Ám (Muted Dark Woodland Palette):**
   - Chuyển đổi không gian màu RGB $\to$ HSL.
   - Kiểm soát độ rực màu: các vùng màu có độ bão hòa cao $S > 0.55$ được giảm $18\%$ ($S \leftarrow \min(0.55, S \times 0.82)$).
   - Đảm bảo toàn bộ asset từ nhiều nguồn khác nhau đạt được tông màu trầm ấm, cổ kính và u tịch đồng nhất.

---

### 3. CÂN CHỈNH HỘP VA CHẠM (COLLIDER HITBOX) & GIAO DIỆN NPC

1. **Hitbox Bàn Chân Cho `NPCEntity` (Container Arcade Physics):**
   - Vì `NPCEntity` là một Container có gốc $(0, 0)$ tại chân NPC, hitbox bàn chân được cấu hình lại chuẩn xác:
     $$\text{body.setSize}(bw, bh);\quad \text{body.setOffset}\left(-\frac{bw}{2}, -bh\right);$$
   - Garth / Hiệp Sĩ Canh Lửa: $bw=22, bh=12$, offset $(-11, -12)$.
   - Bram: $bw=24, bh=14$, offset $(-12, -14)$.
   - Finn: $bw=14, bh=10$, offset $(-7, -10)$.
   - Chấm dứt hoàn toàn lỗi hitbox bị lệch âm hoặc đè ngầm dưới lòng đất.

2. **Độ Cao Bảng Tên & Bong Bóng Hội Thoại Tương Thích Tỷ Lệ:**
   - Bảng nhãn tên (`createNamePlate`) và Bong bóng tương tác `[E] Trò chuyện` (`createPromptBubble`) được liên kết động theo chiều cao thực tế:
     - Cậu bé Finn ($35\text{ px}$): `headOffsetY = 42px`, `bubbleOffsetY = 60px` (vừa vặn trên chỏm tóc).
     - Người lớn ($44 - 47\text{ px}$): `headOffsetY = 52px - 56px`, `bubbleOffsetY = 72px - 76px`.

---

### 4. BẢNG TỔNG HỢP KẾT QUẢ KIỂM THỬ V15-09 (`verify_v15_09_pixel_art_standardization.mjs`)

| Tiêu Chí Kiểm Thử | Yêu Cầu Kỹ Thuật | Đo Đạc Thực Tế | Kết Quả |
| :--- | :--- | :---: | :---: |
| **Chiều cao Wayfarer** | Chuẩn hóa $42\text{px} - 48\text{px}$, bottomGap = 0 | **$43\text{ px}$** (BottomGap: 0) | **PASS** |
| **Chiều cao Garth** | Chuẩn hóa $42\text{px} - 48\text{px}$, bottomGap = 0 | **$46\text{ px}$** (BottomGap: 0) | **PASS** |
| **Chiều cao Edda** | Chuẩn hóa $42\text{px} - 48\text{px}$, bottomGap = 0 | **$45\text{ px}$** (BottomGap: 0) | **PASS** |
| **Chiều cao Neris** | Chuẩn hóa $42\text{px} - 48\text{px}$, bottomGap = 0 | **$44\text{ px}$** (BottomGap: 0) | **PASS** |
| **Chiều cao Bram** | Chuẩn hóa $42\text{px} - 48\text{px}$, bottomGap = 0 | **$47\text{ px}$** (BottomGap: 0) | **PASS** |
| **Chiều cao Hiệp Sĩ Canh Lửa** | Chuẩn hóa $42\text{px} - 48\text{px}$, bottomGap = 0 | **$47\text{ px}$** (BottomGap: 0) | **PASS** |
| **Chiều cao Finn (Cậu bé)** | Chuẩn hóa $34\text{px} - 36\text{px}$, bottomGap = 0 | **$35\text{ px}$** (BottomGap: 0) | **PASS** |
| **Neo chân Wayfarer** | `WAYFARER_ORIGIN_Y = 1.0`, offset $Y=52$ | Khớp chân đáy frame $64\times 64$ | **PASS** |
| **Neo chân NPCEntity** | `npcSprite.setOrigin(0.5, 1.0)`, offset $(-bw/2, -bh)$ | Khớp đáy Container | **PASS** |
| **Bóng đổ theo vai NPC** | Bram $24\text{px}$, Garth/Knight $22\text{px}$, Finn $12\text{px}$ | Khớp chiều rộng vai | **PASS** |
| **Bóng đổ Wayfarer** | Elip $18 \times 6\text{ px}$ khớp vai $18\text{px}$ | $18 \times 6\text{ px}$, alpha $0.28$ | **PASS** |
| **Neo & Bóng Hiệp Sĩ Tà Ác** | Origin $1.0$, bóng Fallen ($24$), Horseman ($48$), Boss ($52$) | Khớp chuẩn | **PASS** |
| **Neo & Bóng Sói Xương** | Origin $1.0$, bóng $34 \times 10\text{ px}$ | Khớp thân hình sói | **PASS** |
| **Neo & Bóng The Listener** | Origin $1.0$, bóng $24 \times 7\text{ px}$ | Khớp bóng đen quái tinh | **PASS** |
| **Tổng Cộng** | **Tất cả các tiêu chí kiểm thử của V15-09** | **14/14 PASS (100%)** | **PASS** |

---

## BÁO CÁO KỸ THUẬT V15-10: THIẾT KẾ & ĐẠI TU BỘ CÔNG TRÌNH KIẾN TRÚC LÀNG BELLHOLLOW

**Dự án:** HOLLOW WOODS: The Fog That Remembers  
**Mã tài liệu:** `V15-10` / `04_Graphics_And_World_Layout.md`  
**Phiên bản:** V1.5 (Visual & Gameplay Overhaul)  
**Nhánh Git:** `feat/v1.5-visual-gameplay-overhaul`  
**Ngày thực hiện:** 18/11/2026  
**Trạng thái:** Hoàn tất xuất sắc (Toàn bộ 6 công trình pixel art độ nét cao, 0 lỗi TypeScript, bản dựng Vite thành công)  

---

### 1. MỤC TIÊU & HIỆN TRẠNG TRƯỚC V15-10

Trước bước V15-10, các công trình trong Làng Bellhollow bộc lộ nhiều điểm hạn chế thị giác:
- Kích thước công trình quá nhỏ bé so với tỷ lệ nhân vật (nhân vật cao $43\text{px}$ trong khi nhà chỉ cao $48\text{px} - 80\text{px}$), tạo cảm giác nhà lùn hơn người.
- Xưởng rèn của Bram và Chốt canh cổng làng của Garth được vẽ tạm bợ bằng các khối phẳng `Phaser.GameObjects.Graphics` đơn điệu, thiếu chiều sâu pixel art u ám.
- Tháp chuông cũ ($80 \times 112\text{px}$) chưa thể hiện được sự uy nghi, cổ kính của trung tâm tâm linh làng Chuông Cổ.
- Giếng làng và xô nước thô sơ, chưa có chi tiết dây thừng, trục quay và mặt nước lấp lánh.
- Hộp va chạm tĩnh (colliders) bao trùm quá cao hoặc đè lên phần mái, khiến nhân vật bị chặn từ xa khi đi từ phía sau nhà.

---

### 2. QUY CHUẨN KÍCH THƯỚC & TỶ LỆ CÔNG TRÌNH V1.5

Tất cả 6 công trình mới được thiết kế và xuất trực tiếp bằng script `pngjs` tại `public/assets/buildings/`, đạt tỷ lệ lớn gấp **$2.8\times$ đến $5.6\times$** chiều cao nhân vật chính ($43\text{px}$):

| Tệp Sprite Công Trình | Kích Thước ($W \times H$) | Tỷ Lệ / Nhân Vật | Đặc Điểm Mỹ Thuật Chi Tiết | Tọa Độ Gốc Đặt ($X, Y$) | Kích Thước Hitbox Chân Đế ($W \times H$) |
| :--- | :---: | :---: | :--- | :---: | :---: |
| `house_elder_edda.png` | **$160 \times 144\text{ px}$** | **$3.3\times$** | Nhà gỗ đá cổ kính của Bà lão Edda, mái ngói vảy cá phủ rêu, xà gỗ Tudor, cửa vòm sồi đinh tán, lồng đèn ấm, ống khói đá nhả khói. | $(704, 110)$ | $136 \times 32\text{ px}$ (đáy $y=110$) |
| `house_herbalist_neris.png` | **$152 \times 136\text{ px}$** | **$3.2\times$** | Nhà thảo mộc Neris, hiên mở treo các bó hoa oải hương/ngải cứu/cúc phơi khô, chậu gốm cây thuốc, cửa sổ sáng ngọc bích ấm dịu. | $(970, 108)$ | $130 \times 30\text{ px}$ (đáy $y=108$) |
| `smithy_workshop_bram.png` | **$176 \times 148\text{ px}$** | **$3.4\times$** | Xưởng rèn Bram, mái ngói chịu nhiệt muội than, lò đá hồng rực than củi, đe thép mỏ nhọn trên gốc sồi, thùng tôi nước, giá gác kiếm/khiên. | $(1000, 352)$ | $154 \times 32\text{ px}$ (đáy $y=352$) |
| `gatehouse_garth.png` | **$128 \times 136\text{ px}$** | **$3.2\times$** | Chốt canh cổng làng của Garth bằng đá hộc và cột gỗ lim, mái chòi canh nhô 4 góc, cửa sổ quan sát sáng ấm, giá giáo canh gác, khiên làng. | $(516, 180)$ | $96 \times 32\text{ px}$ (đáy $y=180$) |
| `bell_tower_grand.png` | **$160 \times 240\text{ px}$** | **$5.6\times$** | Tháp Chuông Cổ Đại đồ sộ, bệ đá hộc nứt nẻ phủ dây thường xuân, cửa vòm Gothic, gác chuông gỗ mở treo Đại Hồng Chung đồng cổ và dây giật. | $(870, 310)$ | $110 \times 34\text{ px}$ (đáy $y=310$) |
| `village_well_detailed.png` | **$64 \times 72\text{ px}$** | **$1.7\times$** | Giếng đá cổ tròn phủ rêu, lòng giếng sâu phản chiếu mặt nước xanh ngọc lấp lánh, mái ngói vảy cá, trục quay gỗ, cuộn dây thừng và xô gỗ. | $(726, 384)$ | $38 \times 20\text{ px}$ (đáy $y=384$) |

---

### 3. KIẾN TRÚC MÃ NGUỒN & CƠ CHẾ VẬT LÝ / Y-DEPTH SORTING

1. **Khóa Hằng Số Texture Mới Trong `Constants.ts`:**
   - Khai báo 6 hằng số: `SPRITE_HOUSE_ELDER_EDDA_V15`, `SPRITE_HOUSE_HERBALIST_NERIS_V15`, `SPRITE_SMITHY_WORKSHOP_BRAM_V15`, `SPRITE_GATEHOUSE_GARTH_V15`, `SPRITE_BELL_TOWER_GRAND_V15`, `SPRITE_VILLAGE_WELL_DETAILED_V15`.
   - Giữ nguyên các hằng số cũ để đảm bảo khả năng tương thích ngược hoàn hảo.

2. **Nạp Asset Trong `PreloadScene.ts`:**
   - Nạp các ảnh PNG trực tiếp từ `assets/buildings/` trong phương thức `preload()`, không gây xung đột với atlas props cũ.

3. **Cơ Chế Bóng Đổ Tiếp Xúc Tự Nhiên (Natural Ground Footing):**
   - Mỗi công trình được tạo một lớp bóng tiếp xúc mặt đất `footingGfx` mềm mại tại độ sâu `DEPTH_GROUND_FOOTING = -95`, sử dụng hình chữ nhật bo góc với độ trong suốt gradient ($0.45 - 0.58$), tạo cảm giác các khối đá cắm sâu vững chãi vào nền đất.

4. **Chuẩn Hóa Điểm Neo & Y-Depth Sorting:**
   - Toàn bộ công trình sử dụng `origin(0.5, 1.0)` đặt chính xác tại chân móng tiếp đất $Y_{\text{base}}$.
   - Độ sâu `depth = y` đặt theo chân móng.
   - Khi nhân vật di chuyển ở tọa độ $Y < Y_{\text{base}}$, độ sâu nhân vật nhỏ hơn công trình $\to$ mái nhà và vách tường che khuất nhân vật một cách tự nhiên.
   - Khi nhân vật ở tọa độ $Y > Y_{\text{base}}$, nhân vật đứng ở phía trước hiên nhà.

5. **Hộp Va Chạm Chân Đế (Foot-Level Hitbox):**
   - Hộp va chạm chỉ bao phủ $15\% - 26\%$ chiều cao ở đáy công trình ($30\text{px} - 34\text{px}$), triệt tiêu hoàn toàn hiện tượng kẹt góc khi đi vòng qua mái từ phía bắc.
   - Đảm bảo khoảng cách thông thoáng tới toàn bộ các NPC: Garth ($Y=265 > 180$), Edda ($Y=345 > 310$), Neris ($Y=145 > 108$), Bram ($Y=365 > 352$) và Bàn Chế Tạo ($Y=360$).

---

### 4. KẾT QUẢ KIỂM THỬ TỰ ĐỘNG (`verify_v15_10_bellhollow_buildings.mjs`)

- [x] **Tệp ảnh:** 6/6 file PNG được tạo với đúng kích thước pixel và tỷ lệ chuẩn medieval pixel art.
- [x] **Constants:** 6/6 khóa texture được xuất chính xác trong `Constants.ts`.
- [x] **Preloader:** 6/6 sprite được nạp thành công trong `PreloadScene.ts`.
- [x] **WorldBuilder:** 6/6 công trình được tích hợp với điểm neo `origin(0.5, 1.0)`, foot-level hitboxes và Y-sorting chuẩn xác.
- [x] **TypeScript:** `npx tsc --noEmit` đạt **0 lỗi**.
- [x] **Build:** `npm run build` hoàn thành trong **10.21s**, tạo bundle sạch không lỗi.

---

## BÁO CÁO KỸ THUẬT V15-11: NÂNG CẤP ĐỒ HỌA CÂY CỐI, THẢM THỰC VẬT & KẾT CẤU MẶT ĐẤT LIỀN MẠCH

**Dự án:** HOLLOW WOODS: The Fog That Remembers  
**Mã tài liệu:** `V15-11` / `04_Graphics_And_World_Layout.md`  
**Phiên bản:** V1.5 (Visual & Gameplay Overhaul)  
**Nhánh Git:** `feat/v1.5-visual-gameplay-overhaul`  
**Ngày thực hiện:** 18/11/2026  
**Trạng thái:** Hoàn tất xuất sắc (10/10 asset thực vật & decal pixel art độ nét cao, thuật toán Feathered Transition nền đất mượt mà, 0 lỗi TypeScript, bản dựng Vite thành công)  

---

### 1. MỤC TIÊU & HIỆN TRẠNG TRƯỚC V15-11

Trước bước V15-11, môi trường tự nhiên và kết cấu nền đất tồn tại các vấn đề thị giác cần đại tu:
- **Tán cây đơn điệu:** Các cây xanh trong làng Bellhollow và vùng rừng lân cận chủ yếu sử dụng các tán tròn đồng tâm hoặc hình khối phẳng đơn sơ lặp đi lặp lại (`tree_oak_1..3`), thiếu tính đa dạng sinh thái đặc trưng của một khu rừng sương mù phương Bắc.
- **Thiếu lớp phủ nền đất (Ground Decals):** Mặt đất giữa các công trình và lối đi khá trơ trụi, thiếu các chi tiết thảm thực vật vi mô tự nhiên như cỏ dại ven tường, dương xỉ râm mát, lá mục mùa thu, sỏi đá ven đường, nấm dạ quang ẩm thấp và các vũng nước đọng.
- **Đường đi cắt cạnh thô cứng (Stair-Stepping Borders):** Lòng đường đất (`drawOrganicDirtPath`) và sân đá cuội (`drawCobbleCourtyard`) có các mép chuyển tiếp cắt thẳng hoặc bậc thang thô ráp, tạo cảm giác hình học nhân tạo thay vì một vùng đất cổ xưa tự nhiên.

---

### 2. BỘ ASSET CÂY CỔ THỤ & THẢM THỰC VẬT PIXEL ART MỚI

Tất cả 10 asset thực vật mới được thiết kế, đổ bóng và tạo trực tiếp bằng script xử lý đồ họa `pngjs` (`scripts/generate_v15_foliage_and_trees.mjs`), lưu tại `public/assets/environment/`:

#### 2.1. Bộ 4 Biến Thể Cây Cổ Thụ Rừng Sương (Chiều cao $144\text{px} - 160\text{px}$)

| Tệp Sprite Cây | Kích Thước ($W \times H$) | Điểm Neo (Origin) | Hitbox Chân Đế ($W \times H$) | Đặc Điểm Nghệ Thuật & Sinh Thái |
| :--- | :---: | :---: | :---: | :--- |
| `tree_mist_pine.png` | **$112 \times 160\text{ px}$** | `origin(0.5, 0.92)` | $20 \times 14\text{ px}$ | **Thông Sương Mù:** Thân cao vút vỏ sần sùi màu xám tro, tán lá kim xếp tầng hình tháp nhọn vươn qua màn sương, rễ bám đất vững chãi, bóng đổ mềm mại dưới gốc. |
| `tree_mossy_oak_grand.png` | **$144 \times 160\text{ px}$** | `origin(0.5, 0.92)` | $20 \times 14\text{ px}$ | **Sồi Già Rêu Phủ:** Thân đại thụ gồ ghề nứt nẻ bám rêu xanh, tán lá xòe rộng phân tầng sáng tối mềm mại với các chùm lá rủ tự nhiên, rễ nổi gân guốc bám chặt mặt đất. |
| `tree_weeping_willow.png` | **$128 \times 152\text{ px}$** | `origin(0.5, 0.92)` | $20 \times 14\text{ px}$ | **Liễu Rủ Đầm Lầy:** Thân gỗ uốn lượn cổ quái ngả về phía đầm lầy, các dải cành lá liễu mềm mại rủ dài thướt tha chạm mặt cỏ, sắc xanh ngọc u tịch hòa quyện hơi sương ẩm ướt. |
| `tree_withered_gnarled.png` | **$112 \times 144\text{ px}$** | `origin(0.5, 0.90)` | $20 \times 14\text{ px}$ | **Cây Khô Trơ Cành:** Thân gỗ xoắn vặn nứt nẻ mục nát, cành khẳng khiu trơ trọi đâm tủa vào không trung lạnh lẽo, mốc xám bám trên các khớp cành, mang đậm không khí rùng rợn. |

#### 2.2. Bộ Lớp Phủ Mặt Đất (Ground Decals / Foliage — Không Va Chạm)

| Tệp Sprite Decal | Kích Thước ($W \times H$) | Độ Sâu Phân Tầng (Depth) | Ứng Dụng Trong Bản Đồ |
| :--- | :---: | :---: | :--- |
| `decal_wild_grass.png` | **$32 \times 24\text{ px}$** | `DEPTH_GROUND_FLORA` ($-9000$) | Cỏ dại xanh rêu mọc tự nhiên ven bờ rào, chân tường đá và quanh các gốc cây. |
| `decal_fern_cluster.png` | **$36 \times 28\text{ px}$** | `DEPTH_GROUND_FLORA` ($-9000$) | Cụm dương xỉ râm mát xòe tròn ở các vùng đất ẩm dưới tán rừng và đầm lầy. |
| `decal_glowing_mushrooms.png` | **$32 \times 24\text{ px}$** | `DEPTH_GROUND_DECALS` ($-8500$) | Cụm nấm mũ xanh ngọc dạ quang phát sáng ma mị ở các hốc cây tối và góc giếng cổ. |
| `decal_autumn_leaves.png` | **$36 \times 24\text{ px}$** | `DEPTH_GROUND_TURF` ($-9200$) | Thảm lá rụng mùa thu sương lạnh màu vàng úa và nâu đỏ rải rác trên nền đất và rìa đường. |
| `decal_pebbles_stones.png` | **$32 \times 20\text{ px}$** | `DEPTH_GROUND_STONES` ($-9100$) | Các viên sỏi cuội xám tro nhỏ rải rác ven mép đường đá cuội và đường đất. |
| `decal_swamp_puddle.png` | **$48 \times 28\text{ px}$** | `DEPTH_GROUND_WATER` ($-8900$) | Vũng nước nông đọng rêu đục phản chiếu ánh sáng le lói qua sương, mép bùn êm dịu. |

---

### 3. THUẬT TOÁN KẾT CẤU MẶT ĐẤT & CHUYỂN BIÊN TỰ NHIÊN (FEATHERED TRANSITIONS)

1. **Đường Đất Hữu Cơ Chuyển Biên Mềm (`drawOrganicDirtPath`):**
   - Thay thế việc vẽ các ô chữ nhật thô cứng bằng giải thuật hình học `ctx.beginPath() + ctx.ellipse()`.
   - Kết hợp sóng nhiễu điều hòa kép `Math.sin(ang * 6.2) + Math.cos(...)` tạo độ gợn mép tự nhiên.
   - Rải các hạt đất ẩm (`#3c3a25`), đất sẫm (`#4e3b29`) và rêu xanh (`#2d4227`) chuyển màu êm dịu hòa quyện vào nền cỏ, triệt tiêu hoàn toàn đường viền răng cưa thẳng băng.

2. **Sân Đá Cuội Chuyển Biên Tự Nhiên (`drawCobbleCourtyard`):**
   - Viền chuyển tiếp tự nhiên (Feathered Border): Điểm rải rêu cỏ `#2f442b`, đất ẩm `#483c2e` và vụn sỏi `#4e5652` dọc theo chu vi sân đá theo nhiễu vi mô.
   - Đá lát chuyển biên so le (Feathered Perimeter Pavers): Thay thế vòng bo vỉa thẳng băng cứng nhắc bằng các phiến đá so le, đứt đoạn ngẫu nhiên theo sóng dao động `edgeWobble`.

3. **Cơ Chế Phân Tầng Decal Không Va Chạm (`createGroundDecal`):**
   - Các decal mặt đất được tự động gán vào đúng hằng số chiều sâu trong `Constants.ts` (`DEPTH_GROUND_STONES`, `DEPTH_GROUND_WATER`, `DEPTH_GROUND_DECALS`, `DEPTH_GROUND_FLORA`, `DEPTH_GROUND_TURF`).
   - Tuyệt đối không thêm body collider vật lý, đảm bảo người chơi và NPC có thể bước qua trơn tru mà không bị chặn lối.

---

### 4. BẢNG TỔNG HỢP KIỂM THỬ TỰ ĐỘNG (`verify_v15_11_foliage_and_terrain.mjs`)

| Hạng Mục Kiểm Thử | Yêu Cầu Kỹ Thuật | Kết Quả Thực Tế | Trạng Thái |
| :--- | :--- | :---: | :---: |
| **Kích thước Cây Thông sương mù** | $112 \times 160\text{ px}$ pixel art | $112 \times 160\text{ px}$ | **PASS** |
| **Kích thước Cây Sồi già rêu phủ** | $144 \times 160\text{ px}$ pixel art | $144 \times 160\text{ px}$ | **PASS** |
| **Kích thước Cây Liễu rủ đầm lầy** | $128 \times 152\text{ px}$ pixel art | $128 \times 152\text{ px}$ | **PASS** |
| **Kích thước Cây Khô trơ cành** | $112 \times 144\text{ px}$ pixel art | $112 \times 144\text{ px}$ | **PASS** |
| **Kích thước Decal Bụi cỏ dại** | $32 \times 24\text{ px}$ pixel art | $32 \times 24\text{ px}$ | **PASS** |
| **Kích thước Decal Cụm dương xỉ** | $36 \times 28\text{ px}$ pixel art | $36 \times 28\text{ px}$ | **PASS** |
| **Kích thước Decal Nấm phát sáng** | $32 \times 24\text{ px}$ pixel art | $32 \times 24\text{ px}$ | **PASS** |
| **Kích thước Decal Lá mùa thu** | $36 \times 24\text{ px}$ pixel art | $36 \times 24\text{ px}$ | **PASS** |
| **Kích thước Decal Sỏi đá ven đường** | $32 \times 20\text{ px}$ pixel art | $32 \times 20\text{ px}$ | **PASS** |
| **Kích thước Decal Vũng nước đầm lầy** | $48 \times 28\text{ px}$ pixel art | $48 \times 28\text{ px}$ | **PASS** |
| **Hằng số Constants.ts** | 10 khóa `SPRITE_TREE_*` & `SPRITE_DECAL_*` | 10/10 có mặt | **PASS** |
| **Nạp trong PreloadScene.ts** | 10/10 asset được đăng ký tải | 10/10 được tải | **PASS** |
| **Tích hợp WorldBuilder.ts** | `createTree`, `createGroundDecal`, `createBellhollowGroundDecals` | Đầy đủ và hoàn thiện | **PASS** |
| **Chuyển biên đường đi Feathered** | `drawOrganicDirtPath` áp dụng ellipse & noise | Mép đường mượt mà | **PASS** |
| **Chuyển biên sân đá Feathered** | `drawCobbleCourtyard` áp dụng feathered pavers | Mép đá so le tự nhiên | **PASS** |
| **Kiểm tra kiểu TypeScript** | `npx tsc --noEmit` đạt 0 lỗi | **0 lỗi** | **PASS** |
| **Bản dựng Production** | `npm run build` | **Thành công (13.53s)** | **PASS** |

---

## BÁO CÁO KỸ THUẬT V15-12: CHUẨN HÓA ĐỒ HỌA VẬT PHẨM TRÊN MẶT ĐẤT, ĐẠO CỤ KHU TRẠI & NGUỒN SÁNG MÔI TRƯỜNG

**Dự án:** HOLLOW WOODS: The Fog That Remembers  
**Mã tài liệu:** `V15-12` / `04_Graphics_And_World_Layout.md`  
**Phiên bản:** V1.5 (Visual & Gameplay Overhaul)  
**Nhánh Git:** `feat/v1.5-visual-gameplay-overhaul`  
**Ngày thực hiện:** 18/11/2026  
**Trạng thái:** Hoàn tất xuất sắc (14/14 asset pixel art độ nét cao, tương tác động theo CampSystem, 0 lỗi TypeScript, bản dựng Vite thành công)  

---

### 1. MỤC TIÊU & HIỆN TRẠNG TRƯỚC V15-12

Trước bước V15-12, các chi tiết vật thể tương tác trên mặt đất và đạo cụ khu trại bộc lộ nhiều điểm hạn chế thị giác:
- **Vật phẩm thu thập (World Pickups) thô sơ:** Gỗ khô chỉ là hình chữ X đơn điệu; nhựa thông là cục vàng cam chói gắt; thảo dược và đá lửa là các chấm màu $16\times 16\text{ px}$ mờ nhạt, thiếu bóng đổ chân đế và không phản ánh đúng không khí u tịch của Rừng Sương.
- **Đạo cụ khu trại vẽ tạm bằng hình khối:** Lửa Trại Trung Tâm, Lều Trú Ẩn, Nồi Thảo Dược, Rương Gỗ và Cột Đèn Đường trong làng Bellhollow được vẽ bằng các lệnh đồ họa hình học nguyên thủy `Phaser.GameObjects.Graphics` (`fillRect`, `fillCircle`, `fillTriangle`), thiếu độ sâu mỹ thuật, không phản ánh được tinh thần Medieval Dark-Fantasy.
- **Lửa trại thiếu phản hồi trực quan:** Lửa trại chỉ có một hình vẽ tĩnh, chưa tự động thay đổi ngoại hình theo 3 cấp độ nhiên liệu (`Duy Trì`, `Cháy Đều`, `Rực Rỡ` và trạng thái `Tro Tàn`) của `CampSystem`.

---

### 2. QUY CHUẨN ĐỒ HỌA 14 ASSET PIXEL ART MỚI

Toàn bộ 14 asset được tạo và xử lý trực tiếp bằng script đồ họa `scripts/generate_v15_pickups_and_camp_props.mjs`:

#### 2.1. Bộ 5 Vật Phẩm Thu Thập Ngoài Thế Giới (World Pickups — $24 \times 24\text{ px}$)

| Tên Asset Sprite | Kích Thước | Màu Sắc Chủ Đạo | Đặc Điểm Nghệ Thuật Pixel Art |
| :--- | :---: | :--- | :--- |
| `res_dry_wood.png` | **$24 \times 24\text{ px}$** | Nâu sồi `#5a3d24`, Rêu xanh `#6ea352` | Bó cành cây khô nhỏ gồm 2 cành xếp chéo tự nhiên trên cỏ, vỏ nứt nẻ có mắt cành, đốm rêu xanh phủ nhẹ, bóng đổ elip mờ ở đáy. |
| `res_tree_resin.png` | **$24 \times 24\text{ px}$** | Hổ phách `#e68a00`, Vỏ thông `#382619` | Giọt nhựa hổ phách/mật ong óng ánh bám trên khúc vỏ thông xám sần sùi, điểm sáng highlight li ti dịu mắt, vệt nhựa rỉ xuống vỏ gỗ. |
| `res_herbs.png` | **$24 \times 24\text{ px}$** | Xanh bạc `#4d856d`, Nụ sáng `#e0f7f1` | Thảo Dược Bạc thanh mảnh với các cặp lá xòe ngang, gân lá ánh bạc, nụ hoa thảo dược nở ở đỉnh tỏa ánh sáng mờ huyền ảo, bóng gốc mềm. |
| `res_flint.png` | **$24 \times 24\text{ px}$** | Xám đá `#39464f`, Tia sáng `#ffcc00` | Cụm 2 hòn đá lửa xám đen sắc cạnh, mặt cắt phẳng nứt nẻ phản chiếu ánh sáng lạnh, hạt tia lửa nhỏ li ti le lói vừa gõ ra ở đỉnh. |
| `res_runed_iron.png`| **$24 \times 24\text{ px}$** | Thép than `#262f36`, Cổ ngữ `#81e6d9` | Mảnh sắt rèn nặng nề màu thép nguội, mép vát rỉ sét đồng cam, trên mặt khắc chữ Cổ Ngữ phát sáng lam ngọc mờ mộng ảo, đinh tán cổ. |

#### 2.2. Bộ Đạo Cụ Sanctuary Camp & Nguồn Sáng Làng Bellhollow

| Tên Asset Sprite | Kích Thước | Chiều Sâu (Depth) | Hitbox Chân Đế | Mô Tả Thiết Kế Chi Tiết |
| :--- | :---: | :---: | :---: | :--- |
| `campfire_unlit.png` | **$48 \times 48\text{ px}$** | $y + 4$ | $24 \times 16\text{ px}$ | Vòng 10 viên đá cuội phủ rêu xếp tròn, củi gỗ sồi xếp chéo đã tàn lụi, lòng bếp tro than xám đen khi lửa tắt hoàn toàn. |
| `campfire_tier1.png` | **$48 \times 48\text{ px}$** | $y + 4$ | $24 \times 16\text{ px}$ | Lửa Trại Cấp 1 (Duy Trì): Đống than hồng âm ỉ giữa các khúc củi, ngọn lửa nhỏ liu riu ấm cúng cao $10 - 12\text{px}$, quầng sáng dịu $36\text{px}$. |
| `campfire_tier2.png` | **$48 \times 48\text{ px}$** | $y + 4$ | $24 \times 16\text{ px}$ | Lửa Trại Cấp 2 (Cháy Đều): Củi cháy đượm nứt nẻ, ngọn lửa bập bùng nhiều tầng vàng cam và lõi trắng cao $18 - 20\text{px}$, quầng sáng $48\text{px}$. |
| `campfire_tier3.png` | **$48 \times 48\text{ px}$** | $y + 4$ | $24 \times 16\text{ px}$ | Lửa Trại Cấp 3 (Rực Rỡ): Cột lửa bốc cao $26 - 28\text{px}$ nhiều nhánh, than đỏ rực, các hạt tàn lửa (`sparks`) bay lên không trung, quầng sáng $66\text{px}$. |
| `prop_chest_bronze.png` | **$40 \times 32\text{ px}$** | $y + 2$ | $26 \times 14\text{ px}$ | Rương gỗ sồi bo góc màu nâu trầm, 3 đai đồng cổ viền đinh tán vàng kim, ổ khóa đồng có lỗ tra chìa, quai xách hai bên hông. |
| `prop_cauldron_tripod.png` | **$36 \times 44\text{ px}$** | $y + 2$ | $20 \times 14\text{ px}$ | Kiềng sắt đen 3 chân vững chãi, xích treo nồi gang đen tròn, than củi hồng rực bên dưới, nước thuốc thảo dược ngọc bích sủi bọt bốc hơi. |
| `prop_wayfarer_tent.png` | **$64 \times 56\text{ px}$** | $y + 4$ | $38 \times 16\text{ px}$ | Khung cọc gỗ sồi chữ A, vải bạt da thú rêu sẫm chắp vá đường chỉ khâu thủ công, cửa hé lộ đệm rơm và chăn len cuộn, đèn bão ấm ở đỉnh. |
| `prop_lantern_post.png` | **$32 \times 64\text{ px}$** | $y + 2$ | $10 \times 8\text{ px}$ | Cột gỗ sồi sần sùi bám rêu có ụ đá gia cố chân, tay đỡ chữ L giằng chéo treo đèn lồng sắt phát sáng hổ phách, đung đưa nhẹ theo gió. |
| `prop_signpost_wood.png` | **$36 \times 48\text{ px}$** | $y$ | $14 \times 10\text{ px}$ | Cọc gỗ sồi cắm đất phủ rêu đỉnh, 2 thanh biển gỗ vát nhọn hình mũi tên chỉ 2 hướng có khắc ký hiệu cổ ngữ, đinh tán sắt rèn cổ. |

---

### 3. KIẾN TRÚC MÃ NGUỒN & HOẠT ẢNH TƯƠNG TÁC ĐỘNG

1. **Lửa Trại Động Theo Hệ Thống Nhiên Liệu (`CampSystem`):**
   - Lắng nghe sự kiện `playerState.on('campfire_updated', ...)` trong `createCentralCampfire()`.
   - Khi người chơi nạp củi hoặc nhựa thông, texture tự động hoán đổi mượt mà giữa `campfire_unlit`, `campfire_tier1`, `campfire_tier2` và `campfire_tier3`.
   - Quầng sáng ấm chuyển sắc ở mặt đất tự động co giãn bán kính từ $26\text{px}$ đến $66\text{px}$ tương ứng.
   - Bổ sung hiệu ứng bập bùng ngọn lửa bằng tween co giãn tỷ lệ ($scaleY=1.04, scaleX=0.98$).

2. **Cột Đèn Lồng Đung Đưa Trong Gió Lạnh:**
   - Đặt điểm neo tại chân cột `origin(0.38, 0.95)` (đúng tim cột $x=12$ trên frame $32\text{px}$).
   - Hoạt ảnh `Sine.easeInOut` đung đưa góc $\pm 1.2^\circ$ với chu kỳ tự nhiên $2600\text{ms} - 3600\text{ms}$ ngẫu nhiên theo tọa độ.
   - Quầng sáng vàng hổ phách nhấp nháy êm dịu ở mặt đất tại độ sâu `DEPTH_GROUND_DECALS`.

3. **Nồi Thảo Dược Sôi Sủi Bọt:**
   - Thêm hiệu ứng hơi nước thuốc xanh ngọc bích nhấp nhô bốc lên (`y - 6`, alpha giảm dần) phía trên miệng nồi.

4. **Hiển Thị Vật Phẩm 1:1 Pixel Art Sắc Nét Trong `InventorySystem`:**
   - Thay thế việc phóng đại $1.25\times$ của sprite $16\text{px}$ cũ bằng tỷ lệ $1.0\times$ chuẩn xác cho asset $24\times 24\text{ px}$.
   - Hỗ trợ thêm `mat_runed_iron` (Phôi Sắt Cổ Ngữ) với sprite `res_runed_iron.png` tại phế tích Đầm Lầy.

---

### 4. BẢNG TỔNG HỢP KIỂM THỬ TỰ ĐỘNG (`verify_v15_12_pickups_and_props.mjs`)

| Hạng Mục Kiểm Thử | Yêu Cầu Kỹ Thuật | Kết Quả Thực Tế | Trạng Thái |
| :--- | :--- | :---: | :---: |
| **Kích thước Gỗ Khô** | $24 \times 24\text{ px}$ pixel art | $24 \times 24\text{ px}$ | **PASS** |
| **Kích thước Nhựa Thông** | $24 \times 24\text{ px}$ pixel art | $24 \times 24\text{ px}$ | **PASS** |
| **Kích thước Thảo Dược Bạc** | $24 \times 24\text{ px}$ pixel art | $24 \times 24\text{ px}$ | **PASS** |
| **Kích thước Đá Lửa** | $24 \times 24\text{ px}$ pixel art | $24 \times 24\text{ px}$ | **PASS** |
| **Kích thước Phôi Sắt Cổ** | $24 \times 24\text{ px}$ pixel art | $24 \times 24\text{ px}$ | **PASS** |
| **Kích thước Lửa Trại 4 Trạng Thái** | $48 \times 48\text{ px}$ (Unlit, Tier 1, 2, 3) | 4/4 file đạt $48 \times 48\text{ px}$ | **PASS** |
| **Kích thước Rương Gỗ Đai Đồng** | $40 \times 32\text{ px}$ pixel art | $40 \times 32\text{ px}$ | **PASS** |
| **Kích thước Nồi Sắc Thảo Dược** | $36 \times 44\text{ px}$ pixel art | $36 \times 44\text{ px}$ | **PASS** |
| **Kích thước Lều Vải Da Thú** | $64 \times 56\text{ px}$ pixel art | $64 \times 56\text{ px}$ | **PASS** |
| **Kích thước Cột Đèn Lồng Gỗ** | $32 \times 64\text{ px}$ pixel art | $32 \times 64\text{ px}$ | **PASS** |
| **Kích thước Biển Chỉ Đường Gỗ** | $36 \times 48\text{ px}$ pixel art | $36 \times 48\text{ px}$ | **PASS** |
| **Hằng số Constants.ts** | 14/14 khóa hằng số khai báo đầy đủ | 14/14 có mặt | **PASS** |
| **Tải Asset PreloadScene.ts** | 14/14 asset nạp trong `preload()` | 14/14 được nạp | **PASS** |
| **Tích hợp WorldBuilder.ts** | Đạo cụ camp, cột đèn đung đưa, lửa trại 3 cấp | Tích hợp hoàn thiện | **PASS** |
| **Tích hợp InventorySystem.ts**| Hỗ trợ 1:1 pixel scale & phôi sắt cổ ngữ | Tích hợp hoàn thiện | **PASS** |
| **Kiểm tra kiểu TypeScript** | `npx tsc --noEmit` đạt 0 lỗi | **0 lỗi** | **PASS** |
| **Bản dựng Production** | `npm run build` | **Thành công** | **PASS** |
