# BÁO CÁO KỸ THUẬT V15-37: DỰNG TRẠM LỬA RỪNG TĨNH LẶNG, NPC SIR VAELEN VÀ KẾT NỐI NHẠC NỀN KNIGHTS_QUIET_FIRE TRÊN HOLLOW WOODS V1.5

**Dự án:** HOLLOW WOODS: The Fog That Remembers  
**Mã phân đoạn:** `V15-37`  
**Ngày thực hiện:** 19/11/2026  
**Nhánh Git:** `feat/v1.5-visual-gameplay-overhaul`  
**Tập tin cập nhật:**
- `src/world/WorldBuilder.ts`
- `src/systems/CampSanctuarySystem.ts`
- `src/scenes/GameScene.ts`
- `src/scenes/PreloadScene.ts`
- `src/audio/AudioManager.ts`
- `src/entities/NPCEntity.ts`
- `src/data/dialogues.json`
- `src/data/zones.json`

---

## 1. MỤC TIÊU & TỔNG QUAN PHÂN ĐOẠN V15-37

1. **Dựng Trạm Lửa Rừng Tĩnh Lặng (Quiet Forest Bonfire Outpost):**
   - Tạo khu cắm trại an toàn ấm cúng giữa đường mòn nối từ Làng Bellhollow / Rừng Ngoài sang Rừng Sâu và Đầm Lầy Tĩnh Lặng.
   - Thêm bộ trang bị hành quân cổ của Kỵ Sĩ: Phiến đá ngồi nghỉ phong hóa, Rương quân nhu sồi bọc sắt, Khiên tròn kỵ sĩ & thanh gươm cắm đất, Bó củi khô xếp gọn, Ấm đồng dã chiến đun nước trên than hồng.
   - Thiết lập vùng bảo hộ Sanctuary Aura 4 tầng đa sắc (180px, 105px, 60px, 28px) xua đuổi quái vật, sưởi ấm thân nhiệt, hong khô độ ẩm và gia tốc hồi phục Tinh Thần (Sanity).

2. **NPC "Sir Vaelen — Kỵ Sĩ Trầm Mặc" với Bộ Sprite Thật:**
   - Đưa kỵ sĩ Sir Vaelen vào canh gác bên đốm lửa tại tọa độ $(1435, 705)$ bằng sprite hiệp sĩ thật trích xuất từ gói `2D_SL_Knight`.
   - Tư thế ngồi quỳ chống kiếm canh lửa (`anim_campfire_knight_pray` — 12 frames $64 \times 64\text{px}$) và đứng trang nghiêm đối thoại (`anim_campfire_knight_idle` — 8 frames $64 \times 64\text{px}$).
   - Chân dung hội thoại chuẩn pixel art `portrait_campfire_knight.png`.
   - Hitbox chân đế chuẩn dương: `body.setSize(22, 14); body.setOffset(21, 50);`, loại bỏ triệt để các offset âm.
   - Cốt truyện hội thoại phân tầng Stage 0–3 chia sẻ kinh nghiệm sinh tồn trong sương và hé lộ thân phận Hiệp Sĩ Đen.

3. **Kết Nối BGM Bếp Lửa "The Knight's Quiet Fire":**
   - Nạp bản nhạc nền `knights_quiet_fire.mp3` với khóa `bgm_knights_quiet_fire`.
   - Cơ chế phát hiện vùng động: Khi người chơi bước vào bán kính $\le 180\text{px}$ quanh tâm bếp lửa $(1470, 710)$ hoặc Sir Vaelen $(1435, 705)$, hệ thống tự động crossfade mượt mà sang bản nhạc `bgm_knights_quiet_fire` trong 1.5 giây với âm lượng 0.85.
   - Khi rời khỏi bán kính $> 180\text{px}$, hệ thống crossfade trả lại nhạc nền Outer Woods (`bgm_beyond_the_hills`) ban ngày hoặc nhường không gian cho âm thanh rừng đêm.

---

## 2. TRIỂN KHAI CHI TIẾT

### 2.1. Cấu Trúc Trạm Lửa Rừng Tĩnh Lặng (`src/world/WorldBuilder.ts`)
- **Tâm bếp lửa hồng:** $(1470, 710)$.
- **Quầng sáng Sanctuary Aura 4 tầng:**
  - Vòng ngoại vi $180\text{px}$ (`#ffaa33`, alpha 0.14)
  - Vòng trung tâm $105\text{px}$ (`#ff8811`, alpha 0.22)
  - Vòng lõi nhiệt $60\text{px}$ (`#ff6600`, alpha 0.32)
  - Tâm than hồng $28\text{px}$ (`#ffe088`, alpha 0.45)
- **Hệ thống vật phẩm & công sự dã chiến:**
  - **Phiến đá ngồi nghỉ (Weathered Resting Stone Slab):** Tọa độ $(1504, 718)$, kích thước $42 \times 24\text{px}$, collider chân đế $32 \times 12\text{px}$.
  - **Rương quân nhu sồi bọc sắt (Iron-banded Oak Supply Chest):** Tọa độ $(1498, 690)$, kích thước $26 \times 20\text{px}$.
  - **Khiên kỵ sĩ & Gươm cắm đất (Knight's Round Shield & Grounded Sword):** Tọa độ $(1444, 690)$, kích thước $20 \times 24\text{px}$.
  - **Bó củi khô xếp gọn (Dry Firewood Bundle):** Tọa độ $(1484, 736)$, kích thước $22 \times 16\text{px}$.
  - **Ấm đồng dã chiến (Camp Kettle over Embers):** Tọa độ $(1460, 718)$, kích thước $14 \times 16\text{px}$.
- **Collider chân bếp lửa:** `createStaticBoxColliderCentered(1470, 710, 24, 16, 'Bếp Lửa Hồng Đá Cổ')`.

### 2.2. Vùng Bảo Hộ & Hiệu Ứng Sinh Tồn (`src/systems/CampSanctuarySystem.ts`)
- Đồng bộ tọa độ: `bonfireX: 1470, bonfireY: 710, knightX: 1435, knightY: 705, sanctuaryRadius: 180`.
- Phương thức `isPlayerInSanctuary(px, py)` kiểm tra khoảng cách Euclide tới bếp lửa hoặc tới Sir Vaelen:
  $$\min\left(\sqrt{(px - 1470)^2 + (py - 710)^2}, \sqrt{(px - 1435)^2 + (py - 705)^2}\right) \le 180$$
- Buff khi đứng trong vùng:
  - Hồi phục Sinh Lực: $+4\text{ HP/s}$.
  - Gia tốc hồi phục Tinh Thần: $\times 1.20$ ($+4.8\text{ Tinh Thần/s}$).
  - Gia tốc hong khô Độ Ẩm: $\times 1.20$.
  - Tương tác `[E] Sưởi Ấm Bên Lửa Cổ`: Hồi ngay $+15$ Tinh Thần, giảm $-20$ Độ Ẩm, tăng $+15$ Thân Nhiệt.

### 2.3. Điều Phối Nhạc Nền BGM (`src/scenes/GameScene.ts`)
- Bổ sung kiểm tra ưu tiên vị trí Trạm Lửa trong `updateBGMState()`:
  ```typescript
  // V15-37: Khu vực Trạm Lửa Rừng Tĩnh Lặng của Sir Vaelen
  const distToHearth = Math.hypot(this.player.x - 1470, this.player.y - 710);
  const distToVaelen = Math.hypot(this.player.x - 1435, this.player.y - 705);
  const isNearVaelenBonfire = Math.min(distToHearth, distToVaelen) <= 180;

  if (isNearVaelenBonfire) {
    this.audioManager.playBGM('bgm_knights_quiet_fire', 1.5, 0.85);
    return;
  }
  ```
- Tự động hạ âm BGM (suppression) khi nguy hiểm cao (Boss thức tỉnh, Quái The Listener truy đuổi).

---

## 3. KẾT QUẢ KIỂM TOÁN TỰ ĐỘNG & ĐÓNG GÓI BẢN PHÁT HÀNH

1. **Kiểm tra biên dịch TypeScript (`npx tsc --noEmit`):**
   - Kết quả: `0 errors` (Mã nguồn sạch hoàn toàn).

2. **Kiểm toán Bản đồ BFS & Toàn Bộ Assets (`scripts/audit_map_reachability_and_assets.mjs`):**
   - **73/73 bài kiểm tra đạt 100% (PASS).**
   - Điểm kiểm tra Sir Vaelen và Bếp Lửa Hồng $(1435, 705)$: Walkable, BFS Reachable = true, không bị đè bởi bất kỳ collider cứng nào, khoảng trống mặt trước $> 48\text{px}$.
   - Tổng cộng 347 Static Colliders được kiểm toán, không có collider nào trùng lặp tọa độ hoặc kích thước.

3. **Đóng gói Production Build (`npm run build`):**
   - `dist/index.html` (1.31 kB) & `dist/assets/index-BwD5HWEX.js` (2,859.76 kB).
   - Build thành công trong 9.74s, sẵn sàng vận hành ổn định.
