# BÁO CÁO KỸ THUẬT BƯỚC V15-33: NÂNG CẤP GIAO DIỆN MẨU GIẤY CỔ & BIỂN CHỈ DẪN TƯƠNG TÁC
**HOLLOW WOODS V1.5 - THE DARK WOODLAND TOTAL OVERHAUL**
*Dự án:* HOLLOW WOODS V1.5  
*Thời gian thực hiện:* 19/11/2026  
*Trạng thái:* HOÀN TẤT TOÀN DIỆN (100% PASS - 0 LỖI TYPESCRIPT)

---

## 1. MỤC TIÊU & BỐI CẢNH
Trước bản cập nhật V15-33, khi người chơi nhấn `[E]` để tương tác với các điểm đọc thông tin trong thế giới (như Cột Mốc Tiền Tuyến tại *Crooked Path*, Tấm Biển Mục tại *Fog Crossing*, Biển Chỉ Đường Tuyến Vòng, Cáo Thị Rừng Sâu...):
- Hệ thống gọi `showPopupMessage` hiển thị dòng thông báo chữ xanh lá `#2ecc71` nổi ở góc trên bên trái màn hình.
- Dòng chữ nhỏ này nhanh chóng trôi mất, bị thanh trạng thái Sinh Lực / Thể Lực / Đèn Lồng che lấp một phần, đồng thời nhân vật và quái vật vẫn tiếp tục di chuyển, khiến trải nghiệm đọc kém tập trung và thiếu tính nhập vai (như trong ảnh chụp thực tế người chơi phản ánh).

## 2. NỘI DUNG CẢI TIẾN TOÀN DIỆN BƯỚC V15-33

### A. Mở rộng Kiến trúc `TornPageModal` & Tạo `PaperNoteModal`
1. **Phân loại trực quan (4 Visual Variants):**
   - **`signpost` (Biển Gỗ Chỉ Dẫn & Cột Mốc Đường):**
     - Nền ghép ván gỗ sồi phong hóa (`0x321e10`), vân gỗ tự nhiên và rãnh ghép gỗ ngang.
     - 4 đinh tán kim loại góc xám sắt đinh tâm đồng xỉn (`0xb8924b`).
     - Chữ khắc gỗ màu trắng ngà (`#fef9e7`), độ tương phản cao, cực kỳ sắc nét và dễ đọc trên nền gỗ tối.
     - Tiêu đề chữ vàng kim chạm khắc nổi (`#ffd166` viền `#180d07`).
   - **`notice` (Bản Thông Báo Làng, Cáo Thị & Ghi Chú):**
     - Nền giấy vàng ngả sờn viền (`0xf5ebd6`), viền nhạt tự nhiên.
     - Ghim đinh sắt ở mép trên và **Dấu Sáp Đỏ (Red Wax Seal)** dập nổi biểu tượng vàng đồng ở góc trên bên phải.
     - Chữ mực đen nâu sẫm (`#1a120c`), tiêu đề đỏ son sẫm (`#3a0e0e`).
   - **`stele` (Bia Đá Cự Thạch & Bích Họa Cổ Ngữ):**
     - Phiến đá hoa cương xám xanh (`0x28303b`), góc cạnh gồ ghề và vết nứt tự nhiên.
     - Mảng rêu xanh rừng già (`0x274e38`) bám dọc mép đá và 4 góc.
     - Chữ khắc đá sáng màu ánh bạc (`#edf2f7`), cổ ngữ ngọc bích phát sáng huyền ảo (`#68d391` / `#9ae6b4`).
   - **`parchment` (Giấy Da Dê Cổ Rách Viền):**
     - Giấy da dê vàng sờn, rìa giấy cháy sém, vết ố trà và thớ giấy cổ điển.

2. **Âm thanh tương tác chân thực theo chất liệu:**
   - Khi mở biển gỗ (`signpost`): Phát âm thanh gõ gỗ sồi trầm ấm (`playInteract`).
   - Khi mở bia đá (`stele`): Phát âm thanh đá cổ ma thuật (`playWorldInteractSFX('rune')`).
   - Khi mở mẩu giấy / cáo thị (`notice`, `parchment`): Phát âm thanh giấy sột soạt (`playWorldInteractSFX('journal')`).

3. **Cơ chế Khóa Di Chuyển & Đọc An Toàn:**
   - Khi mở bất kỳ trang giấy / biển báo / văn bia nào, `UIScene.handleModalOpened()` tự động thiết lập cờ `isAnyModalOpen = true`.
   - Nhân vật chính dừng di chuyển, AI quái vật (The Listener, Quạ sương mù) được đóng băng tạm thời trong lúc người chơi đọc.
   - Hỗ trợ đóng nhanh bằng phím `[E]`, `[Space]`, `[Enter]`, `[ESC]`, click nút bấm hoặc click ra ngoài vùng nền tối.

4. **Tối ưu hóa Nhãn Tương Tác HUD:**
   - Lần đầu tiếp cận: `[E] Đọc Cột Mốc Tiền Tuyến`, `[E] Đọc Biển Chỉ Đường`, v.v.
   - Sau khi đã đọc: Tự động đổi thành `[E] Đã đọc (Xem lại)` (hoặc `Đã đọc (Xem lại)` khi đứng ngoài tầm tương tác), gọn gàng và không lặp từ.

### B. Danh Mục 23 Điểm Đọc Nội Dung Được Đồng Bộ Hóa

| STT | Action ID | Tên Vật Thể / Điểm Tương Tác | Phân Loại Visual Variant | Nơi Xuất Hiện | Đồng Bộ Sổ Tay [J] |
|:---:|:---|:---|:---:|:---|:---:|
| 1 | `read_cp_frontier_sign` | Cột Mốc Tiền Tuyến | `signpost` | Crooked Path | Có ghi nhận |
| 2 | `read_fog_sign` | Tấm Biển Mục Cửa Rừng | `signpost` | Fog Crossing | Có ghi nhận |
| 3 | `read_detour_sign` | Biển Chỉ Đường Tuyến Vòng | `signpost` | Crooked Path | `lore_detour_path` |
| 4 | `read_farm_sign` | Biển Nông Trại Trú Ẩn | `signpost` | Sanctuary Farm | Có ghi nhận |
| 5 | `read_ow_sign` | Biển Chỉ Dẫn Rừng Ven | `signpost` | Outer Woods | Có ghi nhận |
| 6 | `read_sm_entry_sign` | Biển Cảnh Báo Đầm Lầy Tĩnh Lặng | `signpost` | Silent Mire | Có ghi nhận |
| 7 | `inspect_farm_gate` | Biển Chỉ Hướng Lối Nam Nông Trại | `signpost` | Bellhollow | Có ghi nhận |
| 8 | `inspect_outer_woods_gate` | Biển Chỉ Hướng Cổng Rừng Ngoại Vi | `signpost` | Bellhollow | Có ghi nhận |
| 9 | `read_bellhollow_notice_board` | Bảng Tin Dị Thường Bellhollow | `notice` | Bellhollow | `lore_three_rules` |
| 10 | `read_herb_terrace_sign` | Hướng Dẫn Vườn Dược Sanctuary | `notice` | Sanctuary Farm | Có ghi nhận |
| 11 | `inspect_df_entry_sign` | Cáo Thị Cảnh Báo Rừng Sâu | `notice` | Deep Forest | Có ghi nhận |
| 12 | `inspect_deep_forest_gate` | Cửa Ngõ Bìa Rừng Sâu | `notice` | Crooked Path | Có ghi nhận |
| 13 | `inspect_fog_journal_1` | Mẩu Nhật Ký Rách #1 | `parchment` | Fog Crossing | `lore_fog_journal_1` |
| 14 | `inspect_bellmaker_dew_journal` | Trang Nhật Ký Ướt Sương | `parchment` | Bell Workshop | `lore_bellmaker_dew_journal` |
| 15 | `inspect_elian_unsent_letter` | Bức Thư Chưa Kịp Gửi Của Elian | `parchment` | Outer Woods | `lore_elian_unsent_letter` |
| 16 | `read_blacksmith_journal` | Ghi Chép Thợ Rèn Bellhollow | `parchment` | Bell Workshop | `lore_blacksmith_journal` |
| 17 | `inspect_root_cellar_alchemy` | Ghi Chép Dược Thảo Hầm Rễ | `parchment` | Root Cellar | `lore_root_cellar_alchemy` |
| 18 | `inspect_shrine_parchment_map` | Bản Đồ Da Cừu Miếu Chuông | `parchment` | Broken Bell Shrine | `lore_shrine_parchment_map` |
| 19 | `inspect_knights_memorial_stele` | Bia Đá Tưởng Niệm Đoàn Kỵ Sĩ | `stele` | Outer Woods | `lore_knights_memorial_stele` |
| 20 | `read_black_knight_stele` | Văn Bia Cổ Lời Thề Hiệp Sĩ Đen | `stele` | Ancient Ruins | `lore_black_knight_chronicle` |
| 21 | `read_rune_clue_stele` | Cổ Thư Đầm Lầy: Trận Đồ Cột Đá | `stele` | Silent Mire | `lore_runestones` |
| 22 | `read_shrine_stele` | Bia Đá Miếu Chuông: Lời Nguyền Câm Lặng | `stele` | Broken Bell Shrine | `lore_clapper_curse` |
| 23 | `read_fog_origin_mural` | Bích Họa Cổ: Nguồn Gốc The Veil | `stele` | Ancient Ruins | `lore_fog_origin` |

---

## 3. KẾT QUẢ KIỂM THỬ TỔNG THỂ
1. **Kiểm thử tự động (`scripts/test_v15_33_paper_note_and_signposts.mjs`):**  
   - 24/24 Test Cases **PASS tuyệt đối**.
2. **Kiểm tra TypeScript (`npx tsc --noEmit`):**  
   - **0 Lỗi TypeScript** (Clean check).
3. **Đóng gói phát hành (`npm run build`):**  
   - Đóng gói Vite hoàn tất sạch sẽ, thư mục `dist/` sẵn sàng vận hành.
