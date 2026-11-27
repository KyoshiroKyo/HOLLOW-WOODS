# HW-AG-FIX-23 — EDDA RUNE CHARM REWARD HOTFIX REPORT

**Dự án:** HOLLOW WOODS V1.6.1 (`feat/v1.6-competition-preview`)\
**Ngày:** 27/11/2026 (21:59 ICT)\
**Tham chiếu:** `HW_AG_FIX_13_REPORT.md` / `HW-V16-B05`\
**Mức độ:** P0

---

## 1. NGUYÊN NHÂN GỐC (ROOT CAUSE)

Đã xác nhận đúng phân tích từ `HW_AG_FIX_13_REPORT.md`:

- Tại `src/systems/DialogueSystem.ts:435`, biến `hadRuneCharmBeforePass = state.hasFlag('edda_rune_charm_granted')` được chụp trước vòng lặp `APPLY_EFFECTS_ONCE` (`false` ở lần đầu hoàn thành `edda_rune_guide`).
- Trong cùng vòng lặp, tại dòng `443`, `state.setStoryFlag(selectedChoice.setFlag)` ghi `'edda_rune_charm_granted'`, và `PlayerState.setStoryFlag()` (`src/state/PlayerState.ts:421`) đồng bộ ngay cờ này sang `this.setFlag(flag)`.
- Tới dòng `478`, điều kiện cũ kiểm tra:
  `const runeCharmAlreadyGranted = dialogueKey === 'edda_rune_guide' && (hadRuneCharmBeforePass || state.hasFlag('edda_rune_charm_granted'));`
  Do `state.hasFlag('edda_rune_charm_granted')` đã thành `true` ngay trong lần chạy đầu tiên, `runeCharmAlreadyGranted` bị đánh giá là `true` trước khi gọi `state.addItem(payload.rewardItem, payload.rewardCount || 1)`, khiến `eqp_bell_ward_charm` luôn bằng `0` dù cả 2 cờ `edda_rune_charm_granted` và `dlg_reward:edda_rune_guide` đều đã bật `true`.

---

## 2. SỬA ĐỔI ĐÃ ÁP DỤNG (MINIMAL CHANGE)

1. **`src/systems/DialogueSystem.ts` (dòng 478–480):**
   - Bỏ điều kiện `|| state.hasFlag('edda_rune_charm_granted')`.
   - Chỉ giữ `const runeCharmAlreadyGranted = dialogueKey === 'edda_rune_guide' && hadRuneCharmBeforePass;`.
   - Giữ nguyên toàn bộ nội dung hội thoại, Quest System, và các guard chống lặp B05 (`rewardMarker`, `questAlreadyOwned`, `trustMarker`, `questMarker`).

2. **`scripts/verify_v16_b05_quest_hardening.mjs` (dòng 115–118):**
   - Cập nhật assertion static từ kiểm tra chuỗi lỗi cũ sang kiểm tra guard mới `const runeCharmAlreadyGranted = dialogueKey === 'edda_rune_guide' && hadRuneCharmBeforePass;`.

3. **`scripts/verify_fix23.mjs`:**
   - Bổ sung script kiểm thử runtime qua Chrome Headless CDP cho các kịch bản FIX-23 và B05.

---

## 3. KẾT QUẢ KIỂM THỬ

### 3.1. TypeScript, Build & B05 Hardening Suite
| Kiểm tra | Lệnh | Kết quả |
|---|---|---|
| TypeScript | `npx tsc --noEmit` | **PASS** (0 lỗi) |
| Production Build | `npm run build` (`tsc && vite build`) | **PASS** (10.81s, `dist/` build sạch) |
| B05 Quest Hardening | `node scripts/verify_v16_b05_quest_hardening.mjs` | **6/6 PASS** |

### 3.2. Runtime Phaser (Chrome Headless CDP — `scripts/verify_fix23.mjs`)
Profile tách biệt (`os.tmpdir()`), không chạm save Owner. `runtime_errors`: `0`.

| Test Case | Mô tả | Trước → Sau | Trạng thái |
|---|---|---|---|
| `TC0_cancel_before_grant` | Hủy `edda_rune_guide` giữa chừng khi chưa từng nhận | `charmCount: 0 → 0`, `edda_rune_charm_granted: false`, `dlg_reward:edda_rune_guide: false` | **PASS** |
| `TC1_first_completion` | Hoàn thành `edda_rune_guide` lần đầu | `charmCount: 0 → 1`, `edda_rune_charm_granted: true`, `dlg_reward:edda_rune_guide: true` | **PASS** |
| `TC2_repeat_no_duplicate` | Nói chuyện lại `edda_rune_guide` | `charmCount: 1 → 1` | **PASS** |
| `TC3_b05_neris_guard` | Kiểm tra guard B05 (`neris_intro`) | `poultice: 0 → 1 → 1` | **PASS** |
| `TC4_save_continue_no_loss_no_dup` | `handleSaveManual()` → `Page.reload` → `continueGame()` → nói lại Edda | Sau Continue: `charmCount: 1`; sau nói lại: `charmCount: 1`, cờ giữ nguyên `true` | **PASS** |

---

## 4. BẰNG CHỨNG ĐÍNH KÈM

- Script kiểm thử: `scripts/verify_fix23.mjs`
- JSON kết quả đầy đủ: `Read/V1.5/Reports/Evidence/HW-AG-FIX-23/fix23_results.json`
- Ảnh chụp runtime:
  - `Read/V1.5/Reports/Evidence/HW-AG-FIX-23/before_charm.png`
  - `Read/V1.5/Reports/Evidence/HW-AG-FIX-23/after_charm.png`
  - `Read/V1.5/Reports/Evidence/HW-AG-FIX-23/after_continue.png`

---

## 5. TRẠNG THÁI CÁC SAVE TỪNG BỊ LỖI TRƯỚC BẢN VÁ

- **Phạm vi FIX-23:** Không triển khai Save Migration tự động và không chỉnh sửa file save hiện tại của Owner.
- **Hiện trạng save cũ bị lỗi trước bản vá:** Với các save đã chạy `edda_rune_guide` trước FIX-23, hai cờ `edda_rune_charm_granted` và `dlg_reward:edda_rune_guide` đã ở trạng thái `true` trong khi `eqp_bell_ward_charm = 0`. Sau bản vá, cơ chế chống nhận trùng vẫn chặn cấp lại khi nói chuyện lại với Edda, nên save mới hoàn toàn chuẩn xác; riêng save cũ bị lỗi trước đó nếu cần khôi phục vật phẩm sẽ cần xử lý thủ công hoặc cân nhắc ở task Save Migration riêng nếu Owner yêu cầu.
