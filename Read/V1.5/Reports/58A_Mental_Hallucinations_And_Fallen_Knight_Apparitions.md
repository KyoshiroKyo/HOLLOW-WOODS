# BÁO CÁO NGHIỆM THU BƯỚC V15-58A: HỆ THỐNG ẢO GIÁC TINH THẦN & ẢO ẢNH HIỆP SĨ SA NGÃ

---

## 1. Mục Tiêu Triển Khai
Xây dựng cơ chế sinh tồn tâm lý kinh dị theo chiều sâu (Psychological Horror Survival) khi chỉ số **Tinh Thần (Sanity / Composure)** của nhân vật bị sụt giảm:
1. **Tầng Ảo Giác Thính Giác & Bóng Lướt Rìa Tầm Nhìn (Tinh Thần < 55/100):** Tái hiện sự căng thẳng tâm lý khi lữ khách lạc lối ngoài vùng an toàn Làng Bellhollow.
2. **Thực Thể "Ảo Ảnh Hiệp Sĩ Sa Ngã" — Fallen Knight Apparition (Tinh Thần < 30/100):** Tạo ra các thực thể ảo ảnh bóng tối đứng nhìn chằm chằm từ sương đêm, không gây kẹt collider và có các phản ứng tan biến đa dạng khi tiếp cận, rọi sáng hoặc chém kiếm.

---

## 2. Chi Tiết Kỹ Thuật & Cấu Trúc File

### 2.1. Tầng Ảo Giác Thính Giác & Bóng Lướt Rìa Tầm Nhìn (`src/systems/SurvivalSystem.ts`, `src/systems/VeilSystem.ts`)
- **Điều kiện kích hoạt:**
  - `stats.composure < 55/100` và `zoneId !== 'bellhollow'`.
- **Bộ đếm thời gian & Cooldown:**
  - Chu kỳ ngẫu nhiên: `14 + Math.random() * 8` (mỗi 14–22 giây xuất hiện 1 hiện tượng).
  - Cooldown chống dồn dập: $10.0\text{s} - 12.0\text{s}$.
- **3 Hiện tượng tâm lý đặc thù:**
  1. **Tiếng Bước Chân Giả Sau Lưng (`False Footsteps`):**
     - Khi hiện tượng được xếp hàng (`pendingFalseFootsteps = true`), hệ thống theo dõi trạng thái di chuyển của nhân vật.
     - Khi người chơi **vừa dừng bước** (`wasPlayerMoving && !isPlayerMoving`), sau khoảng trễ $250\text{ms}$, âm thanh bước chân giả rỗng vang lên ngay sau gáy bằng `AudioManager.getInstance().playFalseFootsteps()`.
  2. **Chuông Đồng Méo Mó & Thì Thầm Trầm Đục:**
     - Phát âm thanh chuông đồng rạn nứt (`playCrackedBellToll()`) hoặc tiếng thì thầm ma quái từ rừng sâu (`ghost_whisper`, `ghost_moan`).
  3. **Bóng Đen Lướt Rìa Màn Sương (`Peripheral Shadow Flicker`):**
     - Sinh vệt bóng đen ma mờ (silhouette graphics) tại rìa tầm nhìn ($180–240\text{px}$ quanh người chơi).
     - Vệt bóng lướt nhanh chéo qua tầm mắt ($70–110\text{px}$) và tan biến hoàn toàn trong đúng $0.6$ giây ($600\text{ms}$) kèm tiếng rít gió thoảng nhẹ.

---

### 2.2. Thực Thể "Ảo Ảnh Hiệp Sĩ Sa Ngã" (`src/entities/FallenKnightApparition.ts`, `src/scenes/GameScene.ts`)
- **Đặc tính kỹ thuật:**
  - Kế thừa trực tiếp `Phaser.GameObjects.Sprite` $\rightarrow$ **Tuyệt đối KHÔNG có Arcade Physics Collider**, không bao giờ gây cản trở đường đi hay kẹt nhân vật.
  - Sử dụng sprite `SPRITE_FALLEN_KNIGHT` ('fallen_knight_sheet').
  - Phủ lớp bóng mờ tối sẫm (`setTint(0x281938)`), alpha cơ sở nhấp nhô nhẹ theo hàm sin ($0.42 \sim 0.85$).
  - Có vũng bóng ma mờ dưới chân và vầng khói tà khí quanh thân.
  - **Hướng nhìn:** Luôn xoay mặt (`setFlipX`) đứng bất động nhìn chằm chằm về phía người chơi từ trong sương mù.
- **Quy tắc sinh (Spawning Rules):**
  - Kích hoạt khi Tinh Thần $< 30/100$, ngoài Làng Bellhollow và không đứng trong Sanctuary / Lửa trại.
  - Giới hạn tối đa **1–2 ảo ảnh** cùng lúc trên toàn bản đồ.
  - Khoảng cách sinh: Rìa vùng tối cách người chơi $155–205\text{px}$.
  - Hồi chiêu sinh: $10–16$ giây.
- **Cơ chế tương tác & Tan biến (Interaction & Dissipation):**
  1. **Tan rã bạo phát thành khói đen (Smoke Burst Dissipation):**
     - *Kích hoạt khi:* Người chơi áp sát $< 85\text{px}$, bật Đèn Lồng `[F]` chiếu trúng (cự ly $\le 140\text{px}$), hoặc vung kiếm chém trúng (cự ly $\le 95\text{px}$).
     - *Phản ứng:* Ảo ảnh lập tức nổ tung thành 20 hạt khói đen/tím bung nở tứ phía; phát tiếng rít lạnh gáy (`ghost_dissipate` + `ghost_scream`), rung nhẹ camera $150\text{ms}$ và **trừ nhẹ 4 điểm Tinh Thần**.
  2. **Tự động mờ dần và giải phóng bộ nhớ (Fade-Out Clean Destruction):**
     - *Kích hoạt khi:* Người chơi quay lưng bỏ đi xa ($> 320\text{px}$), bước vào vòng lửa trại của Sir Vaelen / Làng Bellhollow, hoặc Tinh Thần hồi phục lên trên $45/100$.
     - *Phản ứng:* Tween mờ dần alpha về 0 trong $1.0\text{s}$ rồi dọn dẹp sạch sẽ toàn bộ Graphics và Sprite khỏi bộ nhớ.

---

## 3. Kết Quả Kiểm Thử Toàn Diện
- **Kiểm tra TypeScript (`npx tsc --noEmit`):** Đạt 0 lỗi biên dịch.
- **Kịch bản kiểm thử V15-58A (`test_v15_58a_hallucinations_and_apparitions.mjs`):** Đạt **4/4 bài test (100%)**.
- **Kịch bản kiểm tra lối đi & Collider (`test_v15_57_check_passages.mjs`):** 0 issues.
- **Kiểm toán tổng thể bản đồ & Asset (`audit_map_reachability_and_assets.mjs`):** Đạt **73/73 bài test (100%)**.
