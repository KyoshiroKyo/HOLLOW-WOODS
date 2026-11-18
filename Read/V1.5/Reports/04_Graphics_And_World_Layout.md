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
