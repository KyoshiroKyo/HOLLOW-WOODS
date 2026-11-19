# BÁO CÁO KỸ THUẬT BƯỚC V15-30: GIAO DIỆN TRANG GIẤY CỔ TƯƠNG TÁC (TORN PAGE MODAL) & ĐỒNG BỘ MẨU NHẬT KÝ THẾ GIỚI

**Dự án:** HOLLOW WOODS V1.5  
**Giai đoạn:** UI/UX Overhaul & World Parchment Experience  
**Mã bước:** V15-30  
**Ngày thực hiện:** 19/11/2026  
**Trạng thái kiểm thử:** 39/39 Tests PASS, TypeScript 0 lỗi (`npx tsc --noEmit`), Vite Production Build hoàn tất.

---

## 1. MỤC TIÊU & TỔNG QUAN NÂNG CẤP
Trước bước V15-30, khi người chơi nhấn `[E]` vào các "Mẩu Nhật Ký Cũ Bị Rách", văn bia hoặc cổ thư trong thế giới, hệ thống chỉ hiển thị một dòng thông báo ngắn dạng popup phía trên tường (`showPopupMessage`), khiến người chơi dễ bỏ lỡ bối cảnh cốt truyện sâu sắc và mất cảm giác nhập vai phiêu lưu.

**Bước V15-30 đã đại tu triệt để trải nghiệm khảo sát cốt truyện:**
1. **Giao diện Trang Giấy Cổ Tương Tác (`src/ui/TornPageModal.ts`):** Thiết kế trang giấy da dê cổ rách viền (Aged Torn Parchment) mở ra trang trọng ở giữa màn hình chuẩn HD 1280×720 với hiệu ứng lật trang nhẹ và âm thanh giấy cũ sột soạt.
2. **Registry Cổ Thư & Nhật Ký Thế Giới (`src/data/tornPagesData.ts`):** Hệ thống hóa 11 mẩu nhật ký, văn bia và bích họa cổ rải rác khắp thung lũng Hollow Woods.
3. **Cơ chế An Toàn & Đóng Băng Thế Giới:** Tạm dừng chuyển động của nhân vật và quái vật xung quanh (kể cả The Listener) khi người chơi đang mở trang giấy đọc để người chơi thoải mái nghiền ngẫm mà không bị đánh lén.
4. **Tích hợp Sổ Tay [J] & Tiến trình Thức Tỉnh Ký Ức:** Đọc xong có thể bấm `[E / Space] Cất vào Sổ Tay & Đóng`, tự động mở khóa Lore trong Sổ Tay [J], cộng điểm Bình Tâm, cấp vật phẩm thưởng (nếu có) và nâng cấp chương ký ức Hiệp Sĩ Đen.
5. **Cập nhật Trạng Thái Động Trên Bản Đồ:** Mẩu giấy sau khi đọc và cất sẽ tự động đổi nhãn prompt thành: `"Đã thu thập (Có thể nhấn [E] để xem lại)"`.

---

## 2. KIẾN TRÚC & CHI TIẾT THỰC HIỆN

### 2.1. Cấu trúc Đồ họa Aged Torn Parchment (`TornPageModal.ts`)
- **Kích thước & Bố cục:** Trang giấy da $680 \times 420\text{px}$ đặt tại trung tâm màn hình $(640, 360)$, nằm trên lớp phủ mờ tối `overlayBg` với alpha 0.76.
- **Họa tiết Giấy Da Cổ:**
  - Viền ngoài cháy sém sắc độ nâu sẫm sứt góc giả lập mép rách gặm nham nhở.
  - Vết ố loang nước trà ẩm mốc và các thớ xơ giấy ngang nhạt màu tạo cảm giác xúc giác chân thực.
  - Cổ ngữ Runes khắc chìm nổi bật ở đầu trang (`ᚱ`, `ᛉ`, `ᚠ`, `ᛏ`, `ᛋ`, `ᛚ`, `📜`, `ᛗ`, `ᚦ`, `ᚺ`, `ᛖ`).
  - Font chữ Serif cổ điển trình bày trang trọng, khoảng cách lề và dãn dòng tối ưu cho việc đọc văn học kỳ bí.
- **Điều khiển & Phím tắt:**
  - **Lật trang:** `[◄ Trang Trước [A]]` / `[Trang Tiếp [D] ►]`, hỗ trợ phím `A`, `D`, `ArrowLeft`, `ArrowRight`.
  - **Cất & Đóng:** Nút bấm nổi bật bọc viền đồng thau `[E / Space] Cất vào Sổ Tay & Đóng` (tự động chuyển sang `[E / Space] Đã Cất Vào Sổ Tay • Đóng` nếu đã thu thập trước đó). Nhấn `E`, `Space`, `Enter` hoặc `ESC` đều phản hồi tức thì.
  - **Âm thanh:** Tích hợp `AudioManager.playWorldInteractSFX('journal')` khi mở ra hoặc lật trang.

### 2.2. Registry Dữ Liệu Nhật Ký & Cổ Thư (`src/data/tornPagesData.ts`)
| ID Bản Đồ | Tiêu Đề | Vị Trí | Tác Dụng Khi Cất |
| :--- | :--- | :--- | :--- |
| `inspect_fog_journal_1` | Kẻ Đi Trước | Fog Crossing | +10 Bình Tâm, mở Lore |
| `inspect_bellmaker_dew_journal` | Hợp Kim Ngân Vang | Xưởng Chuông Cổ | +10 Bình Tâm, +1 Nhựa Thông, mở Lore |
| `inspect_elian_unsent_letter` | Bức Thư Chưa Kịp Gửi | Rừng Ngoài | +15 Bình Tâm, cờ `lore_elian_letter_found` |
| `read_blacksmith_journal` | Hợp Kim Xua Sương | Xưởng Chuông Cổ | +15 Bình Tâm, Thức tỉnh ký ức Hiệp Sĩ Đen cấp 1 |
| `inspect_knights_memorial_stele` | Bia Đá Tưởng Niệm Kỵ Sĩ | Xưởng Chuông Cổ | +15 Bình Tâm, Thức tỉnh ký ức Hiệp Sĩ Đen cấp 1 |
| `read_black_knight_stele` | Lời Thề Hiệp Sĩ Đen | Phế Tích Cổ | +20 Bình Tâm, Thức tỉnh ký ức Hiệp Sĩ Đen cấp 1 |
| `inspect_root_cellar_alchemy` | Ghi Chép Thảo Mộc Hầm Rễ | Hầm Rễ Cổ | +20 Bình Tâm, +2 Thảo Dược Bạc |
| `read_bellhollow_notice_board` | Bảng Tin Dị Thường | Làng Bellhollow | +10 Bình Tâm, 3 Quy tắc sinh tồn |
| `inspect_shrine_parchment_map` | Bản Đồ Hội Tụ Mạch Rễ | Miếu Chuông Vỡ | +25 Bình Tâm, +90s Dầu Đèn |
| `read_rune_clue_stele` | Trận Đồ Cột Đá | Đầm Lầy Sương Mù | +10 Bình Tâm, gợi ý giải đố 3 cột |
| `read_shrine_stele` | Lời Nguyền Câm Lặng | Miếu Chuông Vỡ | +15 Bình Tâm, truyền thuyết quả chuông |
| `read_fog_origin_mural` | Bích Họa Nguồn Gốc Sương | Phế Tích Cổ | +15 Bình Tâm, nguồn gốc The Veil |

### 2.3. Cơ chế Khóa Chuyển Động An Toàn Trong `GameScene.ts` & `UIScene.ts`
- Bổ sung `tornPageModal` vào getter `isAnyModalOpen` của `UIScene.ts`.
- Khi `isAnyModalOpen` là `true`:
  - `this.player.body.setVelocity(0, 0); this.player.playIdle(); this.player.resetAllInputState();`
  - `this.listenerMonster.body.setVelocity(0, 0); this.listenerMonster.ai.resetToPatrol();`
  - Vòng lặp `this.wildlifeSystem.getEntities()` được duyệt và triệt tiêu vận tốc `setVelocity(0, 0)`.
  - Quái vật hoàn toàn bị đóng băng vật lý trong thời gian người chơi đọc giấy da.
- Cập nhật prompt tương tác trong `GameScene.handleInteractions()`: Nếu mẩu giấy đã có cờ `collected_note_<id>`, hiển thị:
  `[E] Đã thu thập (Có thể nhấn [E] để xem lại)` (khi ở cự ly $\le 52\text{px}$) hoặc `Đã thu thập (Có thể nhấn [E] để xem lại)` (khi ở cự ly $52\text{px} - 65\text{px}$).

---

## 3. KẾT QUẢ KIỂM THỬ TỰ ĐỘNG
- **Kịch bản kiểm thử:** `node scripts/test_v15_30_torn_page_modal.mjs`
- **Kết quả:** 39/39 tiêu chí PASS 100%.
- **Biên dịch TypeScript:** `npx tsc --noEmit` hoàn tất với **0 lỗi**.
- **Đóng gói Vite:** `npm run build` hoàn tất sản phẩm phát hành trong `8.91s`.
