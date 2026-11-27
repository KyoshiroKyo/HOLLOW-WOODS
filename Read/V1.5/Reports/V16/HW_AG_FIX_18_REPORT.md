# HW-AG-FIX-18 — BOSS HP DIAGNOSTIC REPORT

**Project:** HOLLOW WOODS V1.6.1\
**Branch:** `feat/v1.6-competition-preview`\
**Status:** DIAGNOSED & REPRODUCED IN RUNTIME (0 Code Edits — Handed Off to Codex)

---

## 1. Xác định chính xác Boss & Nguyên nhân gốc

- **Boss mà Owner gặp:** `HoodedKnightBoss` (`src/entities/EvilKnights.ts:668`), tên hiển thị trong game là **Chỉ Huy Hiệp Sĩ Trùm Mũ / Sir Mordric — Kỵ Sĩ Bóng Tối** (Dark Knight), xuất hiện tại `deep_forest` `(2340, -190)` cùng 2 hộ vệ `FallenKnightEntity`.
- **Nguyên nhân gốc khiến Boss bị đánh bại chỉ với 1 đòn (cảm giác như chỉ có 1 HP):**
  1. **Mất cân đối chỉ số HP vs sát thương vũ khí:**\
     - `HoodedKnightBoss` khai báo `maxHp = 10`, `currentHp = 10` (`src/entities/EvilKnights.ts:670-671`).\
     - Trong khi đó, vũ khí yếu nhất của người chơi là **Gậy Gỗ** (`wpn_walking_staff` trong `src/systems/EquipmentSystem.ts:89`) đã gây **`damage = 10`** (các vũ khí khác còn cao hơn: *Rìu Đi Rừng* `damage = 18`, *Giáo Gỗ Bịt Sắt* `damage = 25`), và `GameScene.ts:3197-3198` truyền thẳng `dmg = weaponDef.damage || 1` vào `hoodedBoss.takeDamage(dmg)` (thậm chí nhân đôi `amount * 2` nếu `isVulnerable === true`).\
     - Kết quả: **`10 HP - 10 damage = 0 HP` ngay ở cú đánh đầu tiên (1-Hit Kill)**.
  2. **Không có thanh máu (Boss HP Bar) hiển thị cho `HoodedKnightBoss`:**\
     - Kiểm tra `src/scenes/UIScene.ts` và `src/entities/EvilKnights.ts`: `HoodedKnightBoss` không có thanh máu UI riêng (khác với `MireWardenBoss` có `bossHp: 100` và thông báo `Boss còn X/100 HP`). Do không có thanh máu và chết ngay sau 1 nhát chém, người chơi nhìn nhận boss như chỉ có 1 HP.
     - Không tồn tại lỗi hiển thị HP cục bộ (không có widget HP bar nào hiển thị sai số), nên AG giữ nguyên runtime theo đúng giới hạn nhiệm vụ.

*(Tham chiếu thêm các thực thể cùng file `src/entities/EvilKnights.ts`: `FallenKnightEntity` có `hp = 4, maxHp = 4`; `DreadHorsemanEntity` có `hp = 5, maxHp = 5` — cũng chết sau 1 đòn với `damage >= 10`.)*

---

## 2. Số liệu tái hiện Runtime (Playwright + Vite `?dev=1`)

- **Vị trí kiểm thử:** `deep_forest` `(2340, -190)`
- **Vũ khí mặc định:** `wpn_walking_staff` (Gậy Gỗ, `damage: 10`)
- **Console / Page Errors:** `0`

| Thời điểm | `maxHp` | `currentHp` | `bossState` | `isDefeated` | `boss_hooded_knight_defeated` | Thanh máu Boss | Ghi chú / Popup |
|---|---:|---:|---|---|---|---|---|
| Trước đòn đánh | `10` | `10` | `stagger` | `false` | `false` | Không có | Boss đứng tại `(2340, -190)` |
| Sau **1 đòn** (`Space`) | `10` | **`0`** | **`death`** | **`true`** | **`true`** | Không có | `👑 KỴ SĨ TRÙM MŨ ĐÃ BỊ TIÊU DIỆT! Thu nhận Huy Hiệu Hiệp Sĩ Tha Hóa!` |

### Ảnh chụp đối chiếu (Artifacts)

- Trước đòn đánh (`currentHp: 10 / 10`): `fix18_before_hit.png`
- Sau đúng 1 đòn đánh (`currentHp: 0 / 10`, `isDefeated: true`): `fix18_after_1_hit.png`

---

## 3. Bàn giao cho Codex

- Đã xác nhận **không phải lỗi hiển thị HP cục bộ**; nguyên nhân 100% là `HoodedKnightBoss` đang có `maxHp = 10, currentHp = 10` (`src/entities/EvilKnights.ts:670-671`) trong khi sát thương vũ khí tối thiểu của người chơi là `10` (`src/systems/EquipmentSystem.ts:89`).
- Theo giới hạn của `HW-AG-FIX-18`, AG **không** chỉnh sửa `EvilKnights.ts`, Combat System hay chỉ số thuộc hạ.
- **Đề xuất bàn giao Codex:**
  1. Cập nhật `maxHp` và `currentHp` của `HoodedKnightBoss` lên **`300`** (theo yêu cầu của Owner) tại `src/entities/EvilKnights.ts:670-671`.
  2. Xem xét bổ sung thanh máu Boss hoặc popup hiển thị HP còn lại (`currentHp / maxHp`) cho `HoodedKnightBoss` khi giao chiến để người chơi theo dõi tiến độ trận đấu.
  3. Xem xét cân bằng lại HP cho 2 thuộc hạ `FallenKnightEntity` (`4 HP`) và `DreadHorsemanEntity` (`5 HP`) nếu cần đồng bộ với thang sát thương vũ khí `10–25`.
