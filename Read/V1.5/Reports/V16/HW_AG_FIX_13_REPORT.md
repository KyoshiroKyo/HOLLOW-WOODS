# HW-AG-FIX-13 — B05 QUEST REWARD RUNTIME VERIFICATION REPORT
**Dự án:** HOLLOW WOODS V1.6.1 (`feat/v1.6-competition-preview`)\
**Ngày:** 27/11/2026 (19:47 ICT)\
**Tham chiếu:** `HW-V16-B05`\

---

## 1. TỔNG HỢP KẾT QUẢ KIỂM THỬ

Kiểm thử runtime Phaser thực tế qua Chrome Headless CDP (`scripts/verify_b05_runtime_phaser.mjs`) trên profile tách biệt (`os.tmpdir()`, không chạm save Owner):

| Hạng mục | Phân loại | Trạng thái | Chi tiết số liệu (Trước → Sau) |
|---|---|---|---|
| `edda_rune_guide` (lần đầu cấp `eqp_bell_ward_charm`) | **RUNTIME** | **FAIL** | `charmCount: 0 → 0` (kỳ vọng `1`), `trust: 50 → 53`, `edda_rune_charm_granted: true`, `dlg_reward:edda_rune_guide: true` |
| `edda_rune_guide` (nói chuyện lại sau khi gỡ/xóa) | **RUNTIME** | **RUNTIME PASS** | `charmCount: 0 → 0`, `trust: 53 → 53` |
| `neris_intro` (nhận lần đầu + nói chuyện lại) | **RUNTIME** | **RUNTIME PASS** | Lần 1: `poultice: 0 → 1`, `trust: 53 → 56`; xóa còn `0` → nói lại: `poultice: 0 → 0`, `trust: 56 → 56` |
| `vaelen_forge_purification_key` (đã có sẵn → tiêu thụ → nói lại) | **RUNTIME** | **RUNTIME PASS** | Pre-owned `1`, `dlg_reward:vaelen_forge_purification_key: true`; xóa còn `0` → nói lại: `0 → 0` |
| Save → Reload → Continue → nói chuyện lại Edda & Neris | **RUNTIME** | **RUNTIME PASS** | Sau Continue: `charmCount: 0`, `poultice: 0`, `trust: 56` → nói lại Edda & Neris: `0 / 0 / 56` |
| `verify_v16_b05_quest_hardening.mjs` (3 bài Node logic) | **RUNTIME (Node)** | **RUNTIME PASS** | `OPEN-02`, `craftPurificationKey` anti-recraft, `BossEncounterSystem` single-drop (`3/3 PASS`) |
| `verify_v16_b05_quest_hardening.mjs` (3 bài kiểm source) | **STATIC** | **STATIC PASS** | Guard tĩnh trong `DialogueSystem.ts` và `GameScene.ts` (`3/3 PASS`) |
| Kiểm thử hủy hội thoại giữa chừng bằng tay trong UI | — | **NOT RUN** | Chưa chạy case bấm ESC giữa chừng `PRESENTING` |

---

## 2. LỖI PHÁT HIỆN CHUYỂN `HW-Code` (KHÔNG TỰ SỬA `DialogueSystem`)

**Vị trí:** `src/systems/DialogueSystem.ts` (dòng `435`, `443`, `478`) kết hợp `src/state/PlayerState.ts` (dòng `417–422`):
1. Tại `DialogueSystem.ts:435`, `hadRuneCharmBeforePass = state.hasFlag('edda_rune_charm_granted')` được đọc trước vòng lặp (`false` ở lần đầu).
2. Trong vòng lặp, dòng `443` gọi `state.setStoryFlag(selectedChoice.setFlag)` (`'edda_rune_charm_granted'`).
3. `PlayerState.setStoryFlag()` (`PlayerState.ts:421`) đồng bộ ngay cờ này sang `this.setFlag(flag)`.
4. Tới dòng `478`, điều kiện:
   `const runeCharmAlreadyGranted = dialogueKey === 'edda_rune_guide' && (hadRuneCharmBeforePass || state.hasFlag('edda_rune_charm_granted'));`
   lúc này `state.hasFlag('edda_rune_charm_granted')` đã thành **`true` ngay ở lần chạy đầu tiên**, làm `addItem('eqp_bell_ward_charm', 1)` ở dòng `485` bị bỏ qua!

**Đề xuất cho `HW-Code`:** Tại `DialogueSystem.ts:478`, chỉ kiểm tra `hadRuneCharmBeforePass` (đã chụp trước vòng lặp `APPLY_EFFECTS_ONCE`), bỏ `|| state.hasFlag('edda_rune_charm_granted')`.

---

## 3. BẰNG CHỨNG ĐÍNH KÈM

- Script kiểm thử: `scripts/verify_b05_runtime_phaser.mjs`
- JSON kết quả đầy đủ: `Read/V1.5/Reports/Evidence/HW-AG-FIX-13/b05_runtime_verification.json`
- Ảnh chụp thực tế:
  - `Read/V1.5/Reports/Evidence/HW-AG-FIX-13/b05_edda_first.png`
  - `Read/V1.5/Reports/Evidence/HW-AG-FIX-13/b05_after_continue.png`
- Console/Runtime errors trong suốt phiên: `0` lỗi.
