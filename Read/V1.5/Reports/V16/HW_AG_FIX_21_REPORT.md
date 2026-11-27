# HW-AG-FIX-21 — ECHO PILLAR VISUAL ARTIFACTS REPORT

**Project:** HOLLOW WOODS V1.6.1  
**Branch:** `feat/v1.6-competition-preview`  
**Status:** COMPLETED & VERIFIED (Production Build + F9 OFF + Interaction States)

---

## 1. Xác định Zone ID, Đối tượng & Nguyên nhân gốc

- **Zone ID:** `sub_whispering_clearing` (*Khoảng Trống Thì Thầm / Whispering Clearing*, `bounds: { x: 1600, y: -360, width: 370, height: 360 }`).
- **Phân loại các hình khối xuất hiện (khi `F9 OFF`):**

| Thành phần trong ảnh Tester | Đối tượng trong source | Phân loại | Xử lý |
|---|---|---|---|
| **3 hình chữ nhật tím (`36×48`) + chấm tròn giữa** | `pGfx` (`Phaser.GameObjects.Graphics.fillRoundedRect` + `fillCircle`) tại `WorldBuilder.ts:8114-8124` (`renderSubWhisperingClearingDecorations`) | **Placeholder V1.4** cho 3 *Cột Đá Vọng Âm* (`inspect_echo_pillar_1..3` tại `(1740,-250)`, `(1840,-150)`, `(1940,-250)`). | **Đã thay thế** bằng sprite pixel-art chính thức `SPRITE_PILLAR_EYE` (`pillar_eye`, fallback `prop_ancient_monolith_v14`), neo chân `(0.5, 1.0)`, `scale = 0.95`, `tint = 0xd8c4f0`. |
| **3 chấm/vòng hào quang tím nhấp nháy quanh chân cột** | `aura` (`fillCircle(..., 45)`, `0x8e44ad, 0.15`) tại `WorldBuilder.ts:8127-8141` | **Hiệu ứng gameplay có chủ đích** (hào quang cộng hưởng của 3 Cột Đá Vọng Âm). | **Bảo toàn** nguyên trạng. |
| **2 vòng tròn đồng tâm lớn (`r = 130`, `r = 75`)** | `renderSubWhisperingClearingTerrain` trên `sub_whispering_clearing_ground_baked_v14` (`WorldBuilder.ts:8005-8012`) | **Hiệu ứng sân giải đố có chủ đích** (vòng tròn giao thoa âm thanh giữa 3 cột đá). | **Bảo toàn hình học & làm dịu nét vẽ** (`rgba(110, 90, 150, 0.26)`, `lineWidth: 2`) để hòa vào nền đá thay vì giống nét debug. |

---

## 2. File thay đổi

- `src/world/WorldBuilder.ts` (`renderSubWhisperingClearingTerrain` dòng 8005–8012 và `renderSubWhisperingClearingDecorations` dòng 8113–8120).
- Không thay đổi cơ chế câu đố, điều kiện hoàn thành nhiệm vụ (`SQ04_CLEARING_PATROL`), collider hay Classic Sanity 2.1. Không tạo thêm asset mới.

---

## 3. Kết quả kiểm thử

- `npm run build` (`tsc && vite build`): **PASS** (102 modules, 0 errors).
- Kiểm thử Playwright (`F9 OFF`, `sub_whispering_clearing`, `0` console/page errors):
  - Hiển thị 3 **Cột Đá Vọng Âm** bằng sprite pixel-art `pillar_eye` thay cho 3 hình chữ nhật tím placeholder; vòng tròn giao thoa và hào quang cộng hưởng được bảo toàn dịu mắt.
  - Prompt `[E] Lắng nghe Cột Đá Vọng Âm` hoạt động chính xác; nhấn `[E]` bật flag `inspected_echo_pillar = true` và hiển thị thông điệp: `"🔊 Cột Vọng Âm rung lên tiếng thì thầm: \"Đó chỉ là ảo ảnh Ký Ức The Echo... Phân biệt tiếng bước chân giả với tiếng rít của The Listener!\""`.

### Ảnh đối chiếu Trước / Sau (Artifacts)

- Trước khi sửa (3 hình chữ nhật tím placeholder + chấm tròn): `fix21_before_clearing.png`
- Sau khi sửa (3 sprite Cột Đá Vọng Âm chính thức, F9 OFF): `fix21_after_clearing.png`
- Sau khi sửa (tương tác `[E] Lắng nghe Cột Đá Vọng Âm`): `fix21_after_interact.png`
