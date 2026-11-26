# HW-NR-03 — APPROVED LEGACY NARRATIVE CLEANUP REPORT

- **Mission ID:** `HW-NR-03 — APPROVED LEGACY NARRATIVE CLEANUP`
- **Project:** `HOLLOW WOODS` — `KYOSHIRO STUDIO`
- **Agent:** `AG 4 Hydro High`
- **Branch / HEAD Baseline:** `feat/v1.5.3-ag-world-polish` @ `11d91dd545b8bbaa8bb7e16e4587ddd12bfa233d`
- **Dependencies:** `HW-NR-01` ([HW_CANON_OWNER_DECISION_MATRIX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_CANON_OWNER_DECISION_MATRIX.md)) + `HW-NR-02` ([HW_NARRATIVE_RESIDUE_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_NARRATIVE_RESIDUE_REGISTRY.md))
- **Manifest Backup Nguyên Văn:** [HW_LEGACY_NARRATIVE_BACKUP_MANIFEST.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_LEGACY_NARRATIVE_BACKUP_MANIFEST.json)

---

## 1. Kết Luận Cổng An Toàn & Trạng Thái Chờ Duyệt (`BLOCKED ON HW-NR-01 APPROVAL`)

Tuân thủ tuyệt đối `3` quy tắc khóa trong lệnh `HW-NR-03` và `HW-NR-01`:
1. **`DEPENDENCY: HW-NR-01 APPROVED + HW-NR-02`**
2. **`Chỉ xử lý các Residue ID đã được duyệt.`**
3. **`Nếu nội dung thay thế chưa sẵn sàng, giữ nguyên nội dung hiện hành và chuyển mục đó sang nhiệm vụ viết lại tương ứng. Không xóa trước rồi để gameplay thiếu nội dung.`**

**Kết quả kiểm tra cổng phê duyệt thực tế:**
- Tại thời điểm thực thi `HW-NR-03`, **Owner chưa ký duyệt các quyết định `DEC-LOCK-01` → `DEC-LOCK-23`** trong [HW_CANON_OWNER_DECISION_MATRIX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_CANON_OWNER_DECISION_MATRIX.md) (toàn bộ checkbox còn trạng thái mở) và cũng chưa duyệt nội dung văn bản thay thế chính thức từ `PROPOSED`.
- Theo đúng quy tắc trên:
  - **Kiểm tra mục đã được duyệt (`CHAR-K01`: `Drager` `SUPERSEDED`):** Quét toàn bộ `src/`, `public/assets/` và `index.html` xác nhận **`0` lần xuất hiện** chữ `Drager` (không cần xóa sửa thêm).
  - **Toàn bộ `32` cụm tàn dư còn lại (`NR2-001` .. `NR2-016d`):** Đã được **sao lưu nguyên văn kèm SHA-256** và **giữ nguyên hiện trạng 100% trong runtime** để không tự ý chọn thay Owner, không xóa trắng gây thiếu thoại/lore hay gãy NPC/quest; đồng thời chuyển sang đúng bước viết lại trong [FULL_NARRATIVE_RECONSTRUCTION_ROADMAP.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/FULL_NARRATIVE_RECONSTRUCTION_ROADMAP.md) (`NR-REC-02` → `NR-REC-08`).

---

## 2. Kết Quả Safety Gate & Backup Nguyên Văn (`HW_LEGACY_NARRATIVE_BACKUP_MANIFEST.json`)

- **Kiểm tra Git trước & sau khi backup:**
  - `HEAD`: `11d91dd545b8bbaa8bb7e16e4587ddd12bfa233d` (`feat/v1.5.3-ag-world-polish`).
  - `src/` diff: Chỉ giữ `4` file nền `HW-H4-12A` có sẵn từ trước; **`0` thay đổi mới** do `HW-NR-03`.
  - `public/assets/` diff: **`0` file**.
- **Sao lưu nguyên văn trước mọi thao tác chỉnh sửa tương lai:**
  - **`24` tệp gốc** (gồm `dialogues.json`, `lore.json`, `quests.json`, `tornPagesData.ts`, `items.json`, `zones.json`, `content_registry.json`, `maps/*.json`, `MainMenuScene.ts`, `PreloadScene.ts`, `GameScene.ts`, `UIScene.ts`, `EndingSystem.ts`, `VeilSystem.ts`, `EchoSystem.ts`, `DialogueSystem.ts`, `EvilKnights.ts`, `PlayerState.ts`, `JournalModal.ts`, `ItemTooltipHelper.ts`, `WorldGatingSystem.ts`, `registryData.ts`, `index.html`) đã được chép khớp 100% SHA-256 vào [Backups/steps/backup_hw_nr_03/](file:///G:/HOLLOW%20WOODS/Backups/steps/backup_hw_nr_03/).
  - **`32` bản ghi `residueSnapshots`** đã ghi rõ `residueId`, `filePath`, `key`, `oldTextVerbatim`, `oldTextSha256`, `canonApprovalStatus = UNAPPROVED_PENDING_OWNER_HW_NR_01`, và `deferredToTask` trong [HW_LEGACY_NARRATIVE_BACKUP_MANIFEST.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_LEGACY_NARRATIVE_BACKUP_MANIFEST.json).

---

## 3. Bảng Điều Chuyển Từng Nhóm Tàn Dư (`Deferred Safely to Rewrite Tasks`)

| Nhóm Residue ID | Tệp nguồn & Key | Phân loại `HW-NR-02` | Hành động tại `HW-NR-03` | Nhiệm vụ tiếp nhận sau khi Owner ký `HW-NR-01` |
| :--- | :--- | :---: | :--- | :--- |
| **`Drager` (`CHAR-K01`)** | Toàn bộ `src/`, `public/assets/`, `index.html` | `SUPERSEDED` | Đã quét xác minh **`0` kết quả** (`CLEAN`) | Duy trì kiểm tra `NA-GATE-02` sau mọi đợt sửa |
| **`NR2-001`, `NR2-002`** | `EndingSystem.ts:1037` (`Satyr:` ô tô/quốc lộ) & `VeilSystem.ts:44` (`Satyr... về nhà`) | `REMOVE FROM RUNTIME` / `REPLACE` | Bảo lưu nguyên văn trong backup + giữ runtime chờ `DEC-LOCK-08` | **`NR-REC-02`** |
| **`NR2-004`, `NR2-010a/b`** | `MainMenuScene.ts:797`, `GameScene.ts:4292,4382,4849`, `UIScene.ts:1063` | `REWRITE` / `CONFLICT` | Bảo lưu nguyên văn chờ `DEC-LOCK-01` & `DEC-LOCK-07` | **`NR-REC-02`** |
| **`NR2-003a/b`, `NR2-007a/b`, `NR2-008a/b/c`** | `lore.json` (`memory_chapter_3/4`, `wayfarer_inner_journal`, `black_knight_chronicle`, `knights_memorial_stele`), `tornPagesData.ts:299`, `zones.json:4178–4179` | `CONFLICT` / `REWRITE` | Bảo lưu nguyên văn chờ `DEC-LOCK-02` (`OQ-03`) & `DEC-LOCK-01/06` | **`NR-REC-03`** |
| **`NR2-015a..e`** | `dialogues.json` (`*_black_knight_reverence` `5` keys) | `CONFLICT` / `REWRITE` | Giữ `5` key hoạt động bình thường chờ `DEC-LOCK-04/07` | **`NR-REC-04`** |
| **`NR2-011`, `NR2-012a..e`, `NR2-013a/b/c`, `NR2-014b`** | `dialogues.json` (`campfire_knight_*`, `hooded_knight_*`), `EvilKnights.ts:833,839`, `SQ08` | `CONFLICT` | Giữ trọn vẹn `SQ06–SQ08` & Boss để không gãy gameplay chờ `DEC-LOCK-09/10/11/17` | **`NR-REC-05`** |
| **`NR2-005a` (`LORE_TIPS`), `NR2-006`** | `PreloadScene.ts:142`, `MainMenuScene:52,59`, `index.html:6` | `REWRITE` / `CONFLICT` | Giữ nguyên chờ `DEC-LOCK-17` & đồng bộ tooltips | **`NR-REC-06`** |
| **`NR2-016a..d`** | `EndingSystem.ts:64–120,792` & `lore_ending_*` | `CONFLICT` / `REWRITE` | Giữ nguyên 3 ending & ngưỡng chờ `DEC-LOCK-04/18` | **`NR-REC-08`** |

---

## 4. Kết Quả Kiểm Thử Thực Tế Trong Đợt `HW-NR-03`

| Hạng mục kiểm tra (`§TESTS`) | Lệnh đã chạy thực tế | Kết quả đo được | Ghi chú phạm vi |
| :--- | :--- | :---: | :--- |
| **TypeScript Check** | `npm run check` (`tsc --noEmit`) | **`PASS` (`exit code 0`)** | Kiểm toàn bộ dự án |
| **Data, Dialogue & Quest Integrity** | `npm run verify:data` (`scripts/verify_data_integrity.mjs`) | **`15 / 15 PASS`** | Xác minh `43` items, `18` recipes, `59` dialogue keys (`100% rewardItem` & `nextDialogueKey` hợp lệ), `7` quest stages, `92` registry, `29` lore |
| **Quest Reference & 7-Stage Chain** | `node scripts/test_v15_60_quest_chain_restructuring.mjs` | **`72 / 72 PASS` (`0 FAIL`)** | Xác minh đầy đủ route `A→E→B→D→F→E→C→A` và toàn bộ hội thoại dẫn đường Vaelen/Garth/Edda/Bram |
| **Interactive Dialogue & Backward Compat** | `node scripts/verify_v15_16_story_and_dialogue.mjs` | **`90 / 90 PASS` (`0 FAIL`)** | Xác minh choice flags, `trustDelta`, SaveManager compatibility & TS interfaces |
| **Save Schema 3 & `Continue` Round-Trip** | `node scripts/test_v153_save_schema3.mjs` | **`PASS`** | Xác nhận giữ `saveSchemaVersion = 3`, `lore_satyr_journal`, `storyFlags`, `villageTrustScore`, round-trip `loadGameProgress`/`saveGameNow` |
| **`Drager` Residue Re-Scan** | Scan case-insensitive `src/`, `public/assets/`, `index.html` | **`0` kết quả** | Không tồn tại chữ `Drager` trong runtime hiện tại |
| **Live Browser `New Game` / `Continue` UI Smoke** | — | **`NOT RUN (DEFERRED)`** | Do `HW-NR-01` chưa duyệt nên chưa sửa bất kỳ file runtime nào; sẽ chạy test trình duyệt ở bước `NR-REC-02+` khi có chỉnh sửa code |

---

## 5. Khóa Dừng Cuối (`HARD STOP`)
- **`0` sửa đổi** đối với quest progression, Save Schema `3`, `Classic Sanity 2.1`, `BUG-058`, `BUG-059`, archive, backup hay production source.
- **Trạng thái nhiệm vụ `HW-NR-03`:** **`PARTIAL / BLOCKED PENDING OWNER SIGN-OFF`** — Phần Safety Gate, `24`-file SHA-256 backup manifest, kiểm tra `Drager = 0` và toàn bộ bộ test tính toàn vẹn đã hoàn tất 100%; phần thay thế/gỡ bỏ `32` cụm tàn dư còn lại đang chờ Owner phê duyệt [HW_CANON_OWNER_DECISION_MATRIX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_CANON_OWNER_DECISION_MATRIX.md).
