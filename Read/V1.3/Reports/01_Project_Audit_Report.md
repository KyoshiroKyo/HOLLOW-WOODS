# HOLLOW WOODS V1.3 — BÁO CÁO HIỆN TRẠNG DỰ ÁN (PROJECT AUDIT REPORT)
## KHỞI ĐỘNG CỘT MỐC V1.3 & RÀ SOÁT TỔNG THỂ KIẾN TRÚC HỆ THỐNG

- **Mã lệnh:** `COMMAND C4-13-01`
- **Dự án:** HOLLOW WOODS V1.3 (*Dị Cảnh Rừng Liễu — The Fog That Remembers*)
- **Thư mục làm việc:** `G:\HOLLOW WOODS`
- **Định hướng nghệ thuật:** **Visual Direction A — Dark Woodland Pixel Art**
- **Trạng thái biên dịch:** `npx tsc --noEmit` -> **0 lỗi (Clean Compilation, Mã thoát 0)**
- **Thời điểm kiểm định:** 2026-11-15

---

## 1. TỔNG QUAN HIỆN TRẠNG MÃ NGUỒN & TRẠNG THÁI GIT

Trước khi tiến hành nâng cấp V1.3, toàn bộ trạng thái kho mã nguồn Git và các tệp thay đổi đang làm việc (uncommitted changes) đã được rà soát và bảo toàn nguyên vẹn:
1. **Nhánh Git hoạt động:** `main` (trên nền cam kết hợp nhất V1.2 gần nhất).
2. **Các tài nguyên chưa commit:**
   - Bộ tệp hình ảnh nhân vật pixel art mới thuộc bước C4-12-08: các spritesheet $64 \times 64\text{ px}$ (`edda_idle_sheet.png`, `neris_idle_sheet.png`, `garth_walk_sheet.png`, `potter_walk_sheet.png`, `errand_boy_walk_sheet.png`) và các ảnh chân dung hội thoại (`portrait_garth.png`, `portrait_edda.png`, `portrait_neris.png`, `portrait_bram.png`, `portrait_finn.png`).
   - Các tệp mã nguồn logic thuộc bước C4-12-09: [`src/scenes/GameScene.ts`](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts), [`src/entities/NPCEntity.ts`](file:///G:/HOLLOW%20WOODS/src/entities/NPCEntity.ts), [`src/scenes/PreloadScene.ts`](file:///G:/HOLLOW%20WOODS/src/scenes/PreloadScene.ts), [`src/data/zones.json`](file:///G:/HOLLOW%20WOODS/src/data/zones.json).
3. **Thư mục sao lưu an toàn trước khi chỉnh sửa:**
   - `Backups/C4-13-01_PRE_BACKUP/`: Chứa bản lưu gốc của `GameScene.ts`, `SatyrPlayer.ts`, `SaveManager.ts`, `PlayerState.ts`, `WorldBuilder.ts`.

---

## 2. KẾT QUẢ ĐẠT ĐƯỢC TỪ CÁC BƯỚC C4-12-08 & C4-12-09

### 2.1. Bộ tài nguyên Dân làng C4-12-08 (Villager Asset Packaging)
- Hoàn tất đóng gói toàn bộ nhân vật con người của làng Bellhollow từ gói tài nguyên gốc sang chuẩn thống nhất $64 \times 64\text{ px}$, điểm neo chân `(0.5, 58/64)`.
- Cung cấp đủ 5 ảnh chân dung biểu cảm sắc nét $64 \times 64\text{ px}$ nạp vào `UIScene` phục vụ hệ thống hội thoại:
  + `portrait_garth.png`: Người Canh Cổng nghiêm nghị, trung thành.
  + `portrait_edda.png`: Bà Lão Giữ Chuông tóc bạc, thông thái.
  + `portrait_neris.png`: Người Chữa Thảo Mộc nhân hậu, hiền từ.
  + `portrait_bram.png`: Thợ Thủ Công râu quai nón, từng trải.
  + `portrait_finn.png`: Cậu Bé Đưa Tin nhanh nhẹn, tinh nghịch.
- Thiết lập tệp manifest `villager_animation_manifest.json` ghi nhận metadata khung hình, tốc độ phát và khóa hoạt ảnh.

### 2.2. Tích hợp Runtime C4-12-09 (NPCEntity Runtime Integration)
- Nâng cấp `NPCEntity` hiển thị bằng `Phaser.GameObjects.Sprite` phát hoạt ảnh lặp đa hướng (`idle` và `walk`), loại bỏ hoàn toàn hình ảnh tĩnh đơn điệu:
  + Edda: Hoạt ảnh Idle 9 frames tĩnh tâm, mượt mà.
  + Neris: Hoạt ảnh Idle 6 frames thao tác dược thảo.
  + Garth / Bram / Finn: Hoạt ảnh tuần tra Idle/Walk đồng bộ hướng nhìn.
- Thiết lập nhãn tên NPC (`namePlate`) ở độ sâu `depth = 5000` và bong bóng tương tác `[E]` ở `depth = 5001` với khung nền mờ than rêu (`0x090d0b`, alpha `0.90`) và viền đồng cổ kép.
- Bố trí 5 NPC trên mặt đất thông thoáng của làng Bellhollow:
  + **Garth (Người Canh Cổng):** Đài đá Cổng Tây `(520, 265)`, tuần tra $505..535$.
  + **Bà Lão Edda (Người Giữ Chuông):** Khoảng sân thoáng bên trái Tháp Chuông `(710, 380)`.
  + **Neris (Người Chữa Thảo Mộc):** Mặt đất trước cửa nhà Thảo Mộc `(970, 215)`.
  + **Bram (Thợ Thủ Công):** Gần Bàn Chế Tạo `(1025, 370)`.
  + **Finn (Cậu Bé Đưa Tin):** Rìa quảng trường `(760, 260)`, tuần tra $745..775$.
- Bộ kiểm thử tự động `scripts/verify_npc_runtime_c4_12_09.mjs` đạt **56/56 tiêu chí (100% PASS)**.

| Thực thể NPC | Vị trí $(X, Y)$ | Tệp Spritesheet | Số frame | Tệp chân dung | Trạng thái Runtime |
| :--- | :---: | :--- | :---: | :--- | :---: |
| **Garth** | `(520, 265)` | `garth_walk_sheet.png` | 4 frames | `portrait_garth.png` | **PASS (100%)** |
| **Edda** | `(710, 380)` | `edda_idle_sheet.png` | 9 frames | `portrait_edda.png` | **PASS (100%)** |
| **Neris** | `(970, 215)` | `neris_idle_sheet.png` | 6 frames | `portrait_neris.png` | **PASS (100%)** |
| **Bram** | `(1025, 370)` | `potter_walk_sheet.png` | 4 frames | `portrait_bram.png` | **PASS (100%)** |
| **Finn** | `(760, 260)` | `errand_boy_walk_sheet.png` | 4 frames | `portrait_finn.png` | **PASS (100%)** |

---

## 3. PHÂN TÍCH HIỆN TRẠNG CÁC PHÂN KHU THẾ GIỚI TRƯỚC V1.3

Thế giới game bao gồm 9 phân khu mở liên thông:
1. **Lối Mòn Xuyên Sương (Fog Crossing):** Điểm khởi đầu Act 0, dải đường dẫn tới làng.
2. **Làng Chuông Bellhollow (Bellhollow):** Trung tâm cộng đồng, có Tháp Chuông, Nhà Edda, Nhà Neris, Bàn Chế Tạo và 5 NPC dân làng.
3. **Nông Trại Sanctuary Farm:** 4 ô đất canh tác thảo dược chu kỳ sinh trưởng động.
4. **Rừng Ven (Outer Woods):** Vùng đệm sinh tồn nhiều tài nguyên gỗ và đá lửa.
5. **Lối Mòn Quanh Co (The Crooked Path):** Lộ trình quanh co nối từ Cổng Đông làng tới Đầm Lầy và Rừng Sâu, có Kẻ Lắng Nghe tuần tra.
6. **Rừng Sâu (Deep Forest):** Vùng rừng nguyên sinh tối tăm, nhiều nấm phát quang, búi rễ xoắn, thân cây cổ thụ đổ và ổ Kẻ Lắng Nghe.
7. **Đầm Lầy Tĩnh Lặng (Silent Mire):** Bùn lầy đen, vũng nước trũng và cầu ván gỗ.
8. **Trận Địa Cổ Ngữ (Ancient Rune Puzzle):** Câu đố 3 cột đá Trăng - Rễ - Mắt giải mã kết giới.
9. **Miếu Chuông Phế Tích (The Broken Bell Shrine):** Điểm cực Đông, nơi đặt bệ thờ miếu chuông và quả chuông vỡ kết thúc Hồi 1.

---

## 4. DANH MỤC CÁC ĐIỂM ẨN NẤP SINH TỒN (15 ĐIỂM TOÀN MAP)

| Phân khu | Điểm ẩn nấp | Tọa độ $(X, Y)$ | Loại hình |
| :--- | :--- | :--- | :--- |
| **The Crooked Path** | `hide_bush_1` | `(1820, 260)` | Bụi rậm đặc |
| **The Crooked Path** | `hide_tree_1` | `(1900, 180)` | Thân cây rỗng |
| **The Crooked Path** | `hide_bush_2` | `(2180, 200)` | Bụi rậm đặc khối đá |
| **The Crooked Path** | `hide_bush_3` | `(2500, 380)` | Bụi rậm đặc vực rễ |
| **The Crooked Path** | `hide_tree_2` | `(2350, 420)` | Thân cây rỗng vực rễ |
| **Deep Forest** | `df_hiding_tree_1` | `(1820, -240)` | Cổ thụ thân rỗng nấm |
| **Deep Forest** | `df_hiding_tree_2` | `(2180, -300)` | Cổ thụ đổ thân rỗng trung tâm |
| **Deep Forest** | `df_hiding_tree_3` | `(2450, -470)` | Cổ thụ thân rỗng vực thẳm |
| **Deep Forest** | `df_hide_bush_1` | `(2020, -360)` | Bụi rậm rừng sâu trung tâm |
| **Deep Forest** | `df_hide_bush_2` | `(2240, -520)` | Bụi rậm vực đá phía Bắc |
| **Deep Forest** | `df_hide_bush_3` | `(2600, -300)` | Bụi rậm đầm lầy phía Đông |
| **Silent Mire** | `sm_hiding_tree_1` | `(3080, 260)` | Hốc cây liễu mục đầm lầy |
| **Silent Mire** | `sm_hide_bush_1` | `(3320, 340)` | Cụm lau sậy dày đầm lầy |
| **Silent Mire** | `sm_hide_bush_2` | `(3760, 320)` | Bụi cỏ lác rậm rạp phía Đông |
| **The Broken Bell Shrine** | `shrine_hiding_spot` | `(4360, 380)` | Khối đá đổ nát bệ thờ |

Toàn bộ 15 điểm ẩn nấp này là trọng tâm được nâng cấp cơ chế thoát kẹt hai chiều và giải thuật gỡ va chạm tự động trong bước C4-13-01.
