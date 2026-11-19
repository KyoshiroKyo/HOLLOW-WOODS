# BÁO CÁO NGHIỆM THU BƯỚC V15-58B: BẪY "TIẾNG GỌI TRONG SƯƠNG" & NGHỊCH LÝ ÁNH SÁNG [F]

---

## 1. Mục Tiêu Triển Khai
Thực hiện hóa **Quy Tắc Bằng Máu Số 1 & Số 2** vào chiều sâu gameplay sinh tồn kinh dị trên HOLLOW WOODS V1.5:
1. **Bẫy Tương Tác Giả "Tiếng Gọi Trong Sương" (Quy Tắc 1):** Cảnh báo người chơi không được đáp lại những tiếng gọi quen thuộc trong rừng sâu khi Tinh Thần xuống thấp.
2. **Nghịch Lý Ánh Sáng [F] — Light-vs-Stealth Dilemma (Quy Tắc 2):** Thiết lập cơ chế đánh đổi sinh tồn giữa việc bật sáng để giữ Tinh Thần với việc thu hút quái vật săn mồi từ xa.

---

## 2. Chi Tiết Kỹ Thuật & Cấu Trúc File

### 2.1. Bẫy Tương Tác Giả "Tiếng Gọi Trong Sương" (`src/entities/WhisperTrap.ts`, `src/scenes/GameScene.ts`)
- **Điều kiện kích hoạt:**
  - Người chơi di chuyển ở các phân khu ngoài Làng Bellhollow (`zoneId !== 'bellhollow'`).
  - Tinh Thần (Sanity) $< 60/100$ và không đứng trong Sanctuary / Lửa trại.
- **Tần suất & Tồn tại:**
  - Chu kỳ ngẫu nhiên: mỗi $35–50$ giây xuất hiện tối đa **1 điểm bẫy** cùng lúc.
  - Vị trí: Đốm sáng lập lòe yếu ớt lệch khỏi đường mòn $110–165\text{px}$.
  - Thời gian tồn tại: Tự động tan biến sau đúng **15 giây** nếu người chơi tỉnh táo làm ngơ không bấm `[E]`.
- **Nội dung mồi nhử (Lure Quotes):**
  - Giọng Garth: *"\"Này... Garth đây... Mau lại đây!\""*
  - Giọng Bà lão Edda: *"\"Lữ khách ơi... ta tìm thấy lối rồi...\""*
  - Giọng Cậu bé Finn: *"\"Anh ơi! Có thư khẩn từ làng... lại đây!\""*
  - Giọng Thầy thuốc Neris: *"\"Thuốc thảo mộc của anh xong rồi... mau qua đây...\""*
  - Nhãn tương tác: `"[E] Đáp lại tiếng gọi quen thuộc... (Garth?)"`
- **Hình phạt sập bẫy khi nhấn `[E]`:**
  - Chớp tối màn hình trong $0.35$ giây ($350\text{ms}$), rung mạnh camera ($350\text{ms}$, magnitude $0.018$).
  - Phát âm thanh thì thầm méo mó rùng rợn, tiếng thét quỷ dị (`ghost_scream`, `ghost_whisper`, `jumpscare_stinger`).
  - Hiển thị cảnh báo nổi bật: `"⚠️ BẠN ĐÃ PHÁ VỠ QUY TẮC SỐ 1! Khu rừng đang mượn giọng người quen..."`.
  - **Trừ ngay 15 điểm Tinh Thần (Sanity)**.
  - **Phát sóng chấn động bán kính 360px:** Kéo The Listener vào trạng thái truy tìm với độ nhạy $3.0\times$, kích động bầy Quạ Bóng Tối cất tiếng kêu báo động và đánh thức Hiệp Sĩ Sa Ngã lân cận.

---

### 2.2. Nghịch Lý Ánh Sáng [F] — Light-vs-Stealth Dilemma
Kết nối trực tiếp trạng thái vòng sáng ấm [F] (`playerState.stats.isLanternOn`) với toàn bộ AI cảm biến quái vật:
- **Khi Vòng Sáng [F] đang BẬT:**
  - **The Listener (`ListenerAI.ts`, `TheListener.ts`):** Tầm nhìn phát hiện tuần tra tăng từ $130\text{px} \rightarrow 169\text{px}$ (+30%), tầm nhìn nghi vấn tăng từ $125\text{px} \rightarrow 163\text{px}$ (+30%), độ nhạy thính giác tăng $+30\%$ ($1.3\times$).
  - **Quạ Bóng Tối (`ShadowMonsters.ts`):** Bán kính phát hiện báo động tăng $+30\%$ ($200\text{px} \rightarrow 260\text{px}$ ban ngày, $270\text{px} \rightarrow 351\text{px}$ ban đêm).
  - **Hiệp Sĩ Sa Ngã (`EvilKnights.ts`):** Bán kính phát hiện tăng từ $130\text{px} \rightarrow 208\text{px}$ (+60% so với ban ngày tĩnh lặng).
  - **Kỵ Binh Hắc Ám (`EvilKnights.ts`):** Tầm phát hiện phóng lao tăng từ $220\text{px} \rightarrow 286\text{px}$ (+30%).
  - **Goblin Scout (`AmbushMonsters.ts`):** Tầm bị rọi sáng phát hiện tăng từ $150\text{px} \rightarrow 195\text{px}$ (+30%).
  - **VeilSystem (`VeilSystem.ts`):** `getLanternThreatMultiplier()` kích hoạt mức $1.3\times$.
- **Khi Vòng Sáng [F] TẮT:**
  - Toàn bộ bán kính phát hiện của quái vật thu hẹp về mức tiêu chuẩn.
  - Người chơi có thể chủ động tắt sáng, nín thở lách qua các góc tuần tra trong bóng tối.

---

## 3. Kết Quả Kiểm Thử Toàn Diện
- **Kiểm tra TypeScript (`npx tsc --noEmit`):** Đạt 0 lỗi biên dịch.
- **Kịch bản kiểm thử V15-58B (`test_v15_58b_whisper_trap_and_light_dilemma.mjs`):** Đạt **4/4 bài test (100%)**.
- **Kịch bản kiểm thử V15-58A (`test_v15_58a_hallucinations_and_apparitions.mjs`):** Đạt **4/4 bài test (100%)**.
- **Kiểm tra lối đi & Collider (`test_v15_57_check_passages.mjs`):** 0 issues.
- **Kiểm toán tổng thể bản đồ & Asset (`audit_map_reachability_and_assets.mjs`):** Đạt **73/73 bài test (100%)**.
