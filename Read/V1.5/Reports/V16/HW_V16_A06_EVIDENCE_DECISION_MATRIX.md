# HW-V16-A06 — EVIDENCE DECISION MATRIX (`OWNER APPROVED — 2026-11-27`)

- **Dự án:** HOLLOW WOODS (`V1.6.0 — THE UNBROKEN OATH`)
- **Nhiệm vụ:** `HW-V16-A06` → `HW-V16-A06-R1 — Approved Identity Evidence Implementation` (`§4–§6`)
- **Trạng thái tài liệu:** **`OWNER APPROVED — 2026-11-27`** (`OPTION 1 APPROVED & IMPLEMENTED IN HW-V16-A06-R1`) — giữ nguyên ngưỡng Ending (`50 / 3 / 65`) và Save Schema `3`.

---

## 1. Lý Do Kích Hoạt Evidence Rule Gate (`PARTIAL` Runtime Status)

Đối chiếu `CANON_DECISION_REGISTRY.md` (`DEC-LOCK-07`, `DEC-LOCK-11`), `Technical Implementation Bible R1` (Ch. 05 mục `[145]`) và mã nguồn thực tế sau `HW-V16-A05`:

1. **Nguyên tắc đã được Owner phê duyệt (`DEC-LOCK-07` & `DEC-LOCK-11`):**
   - `Identity Revealed = Memory Stage >= 3 AND Approved Recognition Evidence`.
   - **Không bắt buộc `SQ08`** để mở khóa nhận diện trong tuyến chính; `Vaelen` có thể nhận biết từ `Q05` nhưng **không** vượt qua Identity Reveal Gate nếu chưa đủ cả `Stage >= 3` lẫn bằng chứng.
2. **Khoảng trống chưa được Owner khóa chi tiết cụ thể trong đặc tả:**
   - Technical Bible (`[145]`) đang ghi rõ bảng ánh xạ chi tiết chứng cứ là **`DRAFT`**. Chưa có danh sách `flag` / `itemId` / `loreId` nào được Owner phê duyệt chính thức làm điều kiện `hasIdentityEvidence()`.
   - Trong runtime hiện hành (`GameScene.ts:4842`), **chỉ `SQ08` (`campfire_knight_q3_complete`) gọi `setMemoryAwakeningStage(3)`**; tuyến nhiệm vụ chính (`Q05_SOLVE_MIRE` → `vaelen_forge_purification_key` → `Q06_RETRIEVE_CLAPPER`) hiện **chưa** có điểm kích nâng `Stage = 3` độc lập với `SQ08`.
3. **Cách xử lý an toàn trong `HW-V16-A06` (`§6`):**
   - Triển khai sẵn hợp đồng `IdentityRevealResolver.ts` với `APPROVED_IDENTITY_EVIDENCE_RULES = []` (mặc định **fail-closed** / giữ trung tính) để khóa toàn bộ rò rỉ `Meliodas` trái phép ở Stage `0–2` và Stage `3` khi thiếu chứng cứ được duyệt.
   - Đề xuất bảng ứng viên dưới đây để Owner chọn và phê duyệt công thức chính thức cho đợt khóa kế tiếp.

---

## 2. Bảng Ứng Viên Chứng Cứ (Evidence Candidates Table)

| Candidate ID | Tuyến | Nguồn dữ liệu & Event trong game | Flags / Items thực tế có sẵn trong runtime | Ý nghĩa tường thuật (Narrative Justification) | Khuyến nghị |
| :--- | :---: | :--- | :--- | :--- | :---: |
| **`EV-CAND-M1`** | Chính (`Q05` + `Outer/Workshop`) | Khảo sát **Bia Đá Đoàn Kỵ Sĩ** hoặc **Văn Bia Hắc Lang** + mang `quest_corrupted_crest` gặp Vaelen ở `Q05` (`vaelen_examine_crest_and_seek_mold`) | `(inspected_knights_memorial_stele \|\| collected_note_inspect_knights_memorial_stele \|\| collected_note_read_black_knight_stele) && vaelen_mold_quest_assigned` | Kết nối **2 đầu mối độc lập không cần `SQ08`**: người chơi đọc văn bia khắc tên thủ lĩnh bị cào mòn (`V15-19/30`) + Sir Vaelen xác nhận dấu ấn Quân Huy Đoàn Kỵ Sĩ Hắc Lang tại `Q05` (`DEC-LOCK-11`). | **Rất cao (Đề xuất chính)** |
| **`EV-CAND-M2`** | Chính (`Q05 Chặng 5`) | Hoàn tất rèn **Chìa Khóa Thanh Tẩy** cùng Vaelen tại Trạm Lửa (`vaelen_forge_purification_key`) hoặc mở khóa `Q06` (`unlockBridge`) | `(purification_key_crafted \|\| has_purification_key) && vaelen_mold_quest_assigned` | Đánh dấu thời điểm hoàn thành hợp tác rèn cổ vật giữa Vaelen và NVC bên đốm lửa — đủ điều kiện vừa nâng Stage 3 tuyến chính (nếu Owner duyệt), vừa xác thực danh tính ở giai đoạn chuẩn bị tiến vào Miếu Chuông. | **Cao (Điểm kích Stage 3 + Evidence)** |
| **`EV-CAND-S1`** | Phụ (`SQ08` + `Mordric`) | Chạm trán & đánh bại **Sir Mordric** (`HoodedKnightBoss`) + hoàn tất chuỗi **`SQ08`** với Sir Vaelen (`campfire_knight_q3_complete`) | `boss_hooded_knight_defeated && campfire_knight_q3_completed` | Cả hai học trò cũ (`Mordric` nhận ra vết chém bao kiếm/giáp trong chiến đấu + `Vaelen` kiểm chứng Quân Huy trong `q3_complete`) cùng xác nhận. **Chiến lược: đường phụ tùy chọn, KHÔNG ép buộc.** | **Cao (Đường phụ song song)** |
| **`EV-CAND-M3`** | Chính (Tối thiểu `Q05` đơn lẻ) | Chỉ dựa trên `vaelen_mold_quest_assigned` (`Q05` V04) | `vaelen_mold_quest_assigned` | Chỉ 1 sự kiện giữa hành trình; quá nhẹ so với yêu cầu kết nối nhiều mảnh ký ức và dễ trùng lặp với `V04` NPC Recognition. | **Không khuyến nghị đứng một mình** |

---

## 3. Đề Xuất Công Thức Chính & Công Thức Phụ Trình Owner Phê Duyệt

### Phương Án Đề Xuất 1 (OWNER APPROVED — 2026-11-27 — Song Song Tuyến Chính `Q05` & Tuyến Phụ `SQ08`)

1. **Điều kiện nâng `Memory Stage = 3` không ép `SQ08` (`GAME-IMPLEMENTED` trong `HW-V16-A06-R1`):**
   - **Đường chính:** Khi rèn thành công `[Chìa Khóa Thanh Tẩy]` với Sir Vaelen (`GameScene.ts`: `vaelen_forge_purification_key`) **hoặc** phá Phong Ấn Rễ Cổ (`QuestSystem.ts`: `unlockBridge` / `mire_root_seal_broken`), gọi `setMemoryAwakeningStage(3)` nếu chưa đạt Stage 3 — giúp người chơi đi thuần tuyến chính vẫn đủ điều kiện `Stage >= 3` cho `true_ending` (`comp >= 50, stage >= 3, trust >= 65`).
   - **Đường phụ:** Giữ `campfire_knight_q3_complete` (`SQ08`, `GameScene.ts`) nâng `Stage = 3` nếu chưa đạt.
2. **Điều kiện `hasIdentityEvidence(state)` đã nạp vào `APPROVED_IDENTITY_EVIDENCE_RULES` (`IdentityRevealResolver.ts`):**
   - **Con đường Chính (`MAIN_PATH_Q05`):**
     `vaelen_mold_quest_assigned && (purification_key_crafted || mire_root_seal_broken) && (inspected_knights_memorial_stele || collected_note_inspect_knights_memorial_stele || collected_note_read_black_knight_stele)`
   - **HOẶC Con đường Phụ (`SIDE_PATH_SQ08`):**
     `campfire_knight_q3_completed && boss_hooded_knight_defeated`

> **Trạng thái nghiệm thu `HW-V16-A06-R1` (`2026-11-27`):** Owner đã phê duyệt chính thức Phương Án 1 (`OWNER APPROVED — 2026-11-27`). `APPROVED_IDENTITY_EVIDENCE_RULES` đã kích hoạt đúng 2 rule nêu trên kèm đồng bộ chứng cứ đến trước/sau Stage 3 và bản lưu cũ (`Case A–D`) trên nhánh `feat/v1.6-a06-r1-identity-evidence`.

---

## 4. Phạm Vi Phối Hợp `MEM-04` Với `HW-V16-B07` (`SaveManager.ts`)

Phát hiện khớp nguyên trạng từ `HW-NR-10` / `HW-NR-20`:
- Tại `SaveManager.ts:699 & 719`, khi khôi phục một bản save thưa/cũ mang `memoryAwakeningStage = 1..3` nhưng `unlockedLoreIds` chỉ chứa `['lore_three_rules']`, `applySaveToState()` chỉ gọi `state.restoreUnlockedLore(data.unlockedLoreIds)` mà **chưa** bổ sung các chương ký ức tương ứng của stage (`MEM-04`).
- **Ràng buộc `HW-V16-A06` (`§9`):** Không tự triển khai migration khi quy tắc chứng cứ & backfill chưa được duyệt đồng bộ.
- **Đặc tả chuyển giao cho `HW-V16-B07`:**
  1. Giữ nguyên `CURRENT_SCHEMA_VERSION = 3` và hàm `memoryAwakeningStage` monotonic (không bao giờ hạ stage).
  2. Chỉ backfill non-destructive các chương an toàn (`lore_memory_chapter_1..3`, `lore_black_knight_chronicle`, `lore_memory_chapter_4`) theo stage thực tế **sau** khi `restoreUnlockedLore(data.unlockedLoreIds)` chạy, **không** xóa hay ghi đè lore đã có của người chơi, và **không** tự unlock `lore_wayfarer_inner_journal` bản gốc nếu chưa thỏa `canRevealPlayerIdentity()`.
  3. Đảm bảo idempotent: chạy load → save → load lần 2 không tạo bản sao hoặc cộng thưởng lặp.
