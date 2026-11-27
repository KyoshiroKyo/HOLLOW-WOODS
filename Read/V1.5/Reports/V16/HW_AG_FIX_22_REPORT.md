# HW-AG-FIX-22 — LIGHT CIRCLE VISUAL DIAGNOSTIC REPORT

**Project:** HOLLOW WOODS V1.6.1\
**Branch:** `feat/v1.6-competition-preview`\
**Status:** ALREADY FIXED (V15-54 Light Aura Overhaul) — VERIFIED IN CURRENT BUILD (0 Code Edits)

---

## 1. Kết luận & Nguyên nhân gốc

Hiện tượng **"vòng tròn vàng đặc liên tục xuất hiện rồi biến mất quanh nhân vật"** trong video tester ngày 16/11/2026 **KHÔNG CÒN TỒN TẠI** trên phiên bản hiện tại (đã được xử lý từ bản cập nhật **V15-54 Light Aura Overhaul**).

### Nguồn hiệu ứng & Cơ chế đã sửa:
1. **Trước V15-54 (nguyên nhân trong video cũ):** Cơ chế đèn lồng cũ từng vẽ `fillCircle` cứng/đậm mỗi frame (`lanternGlowGfx` và vòng tròn đặc cũ quanh nhân vật).
2. **Trên bản build hiện tại:**
   - **Vòng sáng quanh nhân vật (`BlackKnightPlayer.ts:242-257`, `2462-2488`):** Đã chuyển sang texture cache mềm `hw_lantern_aura_soft_v1` gồm 3 lớp chuyển sắc dịu (`0xf39c12` alpha `0.02`, `0xf1c40f` alpha `0.038`, `0xffe082` alpha `0.065`), chỉ hiển thị khi bật `[F]` (`isLanternOn = true`, `stamina >= 5`, `!isHiding`).
   - **Quầng sáng hổ phách (`GameScene.ts:1731-1763`, `6786-6817`):** Dùng `lanternGlowImage` với gradient radial mượt `cached_lantern_glow_radial` (`maxAlpha <= 0.24`, `BlendModes.ADD`). `lanternGlowGfx` luôn giữ trạng thái rỗng (`isLanternGlowDrawn = false`), không còn vẽ vòng tròn vàng đặc.

---

## 2. Kết quả kiểm thử Runtime (Playwright `?dev=1`)

- **Console / Page Errors:** `0`

| Trạng thái kiểm thử | `isLanternOn` | `overlayVisible` (`hw_lantern_aura_soft_v1`) | `glowImgVisible` (`cached_lantern_glow_radial`) | `glowGfxDrawn` (vòng tròn đặc) | `Light Motion` (`effective`) | `Screen Flash` (`effective`) |
|---|---|---|---|---|---|---|
| Đèn Lồng Tắt (mặc định) | `false` | `false` | `false` | `false` | `false` | `true` |
| Đèn Lồng Bật `[F]` (đứng yên) | `true` | `true` (`alpha ~ 0.90`) | `true` (`alpha ~ 0.14`) | `false` | `false` | `true` |
| Đèn Lồng Bật `[F]` (đang di chuyển) | `true` | `true` (`alpha ~ 0.77`) | `true` (`alpha = 0.24`) | `false` | `false` | `true` |

- Không ghi nhận bất kỳ vòng tròn vàng đặc nào nhấp nháy hay bật/tắt bất thường quanh nhân vật; khi tắt đèn lồng, vòng sáng biến mất hoàn toàn; khi bật đèn lồng, chỉ có quầng sáng chuyển sắc mềm dịu mắt.

---

## 3. Ảnh đối chiếu (Artifacts)

- Đèn lồng TẮT: `fix22_lantern_off.png`
- Đèn lồng BẬT `[F]` (vòng sáng chuyển sắc mềm, không có vòng tròn vàng đặc): `fix22_lantern_on_default.png`
- Đèn lồng BẬT khi di chuyển: `fix22_lantern_on_motion.png`
