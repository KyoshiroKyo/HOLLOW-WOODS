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
