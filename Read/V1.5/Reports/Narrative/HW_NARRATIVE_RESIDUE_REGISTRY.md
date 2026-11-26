# HW-NR-02 — LEGACY NARRATIVE RESIDUE REGISTRY (`UNLOCKED FOR HW-V16-A02`)

- **Mission ID:** `HW-NR-02` → Replacement Decisions Locked by **`HW-V16-A01`** (`2026-11-26`)
- **Project:** `HOLLOW WOODS` — `KYOSHIRO STUDIO`
- **Mode:** Audit Baseline Preserved + Mapped for **`HW-V16-A02 — APPROVED LEGACY LORE CLEANUP & NARRATIVE IMPLEMENTATION`** (`0` runtime edits performed in `A01`)
- **Dependencies:** [HW_MASTER_CANON_LOCK.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_MASTER_CANON_LOCK.md), [HW_CANON_OWNER_DECISION_MATRIX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_CANON_OWNER_DECISION_MATRIX.md)
- **Inventory JSON:** [HW_LEGACY_DIALOGUE_INVENTORY.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_LEGACY_DIALOGUE_INVENTORY.json)

> **`HW-V16-A01` Cleanup Authorization Summary (`READY FOR A02`):**
> - **`DEC-LOCK-02`:** Thay thuyết tự phong ấn ký ức / `Algiz` / tái sinh gắn với nguồn gốc mất trí nhớ bằng biến cố xuyên thời gian bí ẩn; **giữ nguyên** các rune `Algiz` không liên quan Lore bị thay thế.
> - **`DEC-LOCK-03` & `05`:** Nguồn lời cầu cứu giữ `UNKNOWN`; giữ bí ẩn quan hệ nhân quả với 7 hồi chuông.
> - **`DEC-LOCK-04`:** Bỏ toàn bộ `"hàng trăm năm"` / số thế hệ chưa duyệt; thống nhất `Làng Sương Mù = Bellhollow`.
> - **`DEC-LOCK-07` & `01`:** Ẩn `Meliodas` & `Tổng Chỉ Huy` tại Menu và giai đoạn đầu (`The Mossbound Wayfarer — Lữ Khách Rêu Phong`); chỉ reveal ở `Memory Stage >= 3` + chứng cứ phù hợp (không ép `SQ08`).
> - **`DEC-LOCK-08` & `15`:** Xóa bỏ toàn bộ bối cảnh hiện đại (`ô tô`, `đèn pha`, `quốc lộ`, `Satyr:` hiển thị người chơi); giữ nguyên ID kỹ thuật (`lore_satyr_journal`, `SatyrPlayer.ts`, `satyr_*`) và backup lịch sử.
> - **`DEC-LOCK-09` & `10`:** Sửa hiển thị `HoodedKnightBoss` thành `Sir Mordric — The Dark Knight` theo mốc hợp lý và giữ 100% runtime ID/class/texture/quest/save flags/`quest_corrupted_crest`; sửa Vaelen `q2`/`q3` (`A04`).

---

## 1. Thống Kê Quét Nguồn Toàn Cục (`19` Phạm Vi Kiểm Tra)

- **`Drager` (`case-insensitive`):** **`0`** kết quả trong toàn bộ `src/` & `public/assets/maps/` *(đã sạch `Drager`, nhưng quy tắc cấm dùng lại giữ nguyên)*.
- **`Meliodas / Blackwood / Wolf Lord`:** **`0`** kết quả trong runtime source hiện hành *(chưa tích hợp tên mới vào text game)*.
- **`Chữ "Chỉ Huy" / "Tổng Chỉ Huy" / "commander"`:** **`77` dòng trên `14` tệp** (`dialogues.json`, `lore.json`, `tornPagesData.ts`, `zones.json`, `maps/veil_origin_cavern.json`, `items.json`, `content_registry.json`, `registryData.ts`, `EvilKnights.ts`, `GameScene.ts`, `MainMenuScene.ts`, `PlayerState.ts`, `EndingSystem.ts`, `WorldGatingSystem.ts`).
- **Tàn dư chữ `Satyr:` lộ ra UI/Player & Nháp cũ:** **`2` cụm hiển thị người chơi** (`EndingSystem.ts:1037` + `VeilSystem.ts:44`), bên cạnh nhóm alias/ID kỹ thuật nội bộ được bảo vệ.
- **Lỗi chính tả & Mốc năm chưa duyệt:** **`Sir Valen`** tại `lore.json:85` & `tornPagesData.ts:299`; cụm **`trăm năm`** tại `EndingSystem.ts:78`, `lore_ending_true`, `edda_black_knight_reverence`.
- **Thuyết cũ *"Tự phong ấn ký ức (`Algiz`) để tái sinh"*:** Xuất hiện ở `lore.json` (`3` entries), `dialogues.json` (`2` keys), `zones.json` + `maps/veil_origin_cavern.json` (`veil_commander_epistle`), `tornPagesData.ts` (`read_black_knight_stele`).

---

## 2. Sổ Đăng Ký Từng Nhóm Tàn Dư Theo `19` Khu Vực Trong Game

### 2.1 `dialogues.json` (`59` Keys — Xem Đầy Đủ Ở `HW_LEGACY_DIALOGUE_INVENTORY.json`)
- **`CONFLICT` (`9` keys):** `campfire_knight_intro` (`L615`, nhắc `chỉ huy` + `5` choices), `campfire_knight_comrade_bond` (`L656`, nhắc lệnh `chỉ huy`), `campfire_knight_q2_complete` (`L729`, tin Hooded là Chỉ Huy `C02`), `campfire_knight_q3_reminder` (`L743`), `campfire_knight_q3_complete` (`L760`, `Tổng Chỉ Huy` + `tự phong ấn`), `hooded_knight_encounter_intro` (`L790`, `"Chỉ... Chỉ huy?!"`), `hooded_knight_encounter_defeat` (`L814`, `tự phong ấn... tái sinh`), `campfire_knight_idle_talk` (`L836`, `Chỉ Huy Hiệp Sĩ Đen`), `edda_black_knight_reverence` (`L893`, `trăm năm`).
- **`REWRITE` (`4` keys `black_knight_reverence` còn lại):** `garth_black_knight_reverence` (`L885`), `bram_black_knight_reverence` (`L909`), `neris_black_knight_reverence` (`L901`), `finn_black_knight_reverence` (`L917`) — đồng bộ chức danh với `DEC-LOCK-01` & mốc reveal `DEC-LOCK-07`.
- **`KEEP` (`46` keys còn lại):** Gồm toàn bộ chuỗi `garth_*` (`9`), `edda_*` (`8` — lưu ý `edda_intro` có thể `EXPAND` thêm `DLG-006/007` sau khi duyệt), `neris_*` (`8`), `bram_*` (`5`), `finn_*` (`4`), `vaelen` (`q1`, `blessings`, `mold/key` `11` keys), và `clapper_found` (`1`).

### 2.2 `lore.json` (`29` Entries) & `tornPagesData.ts` (`23` Entries)
| File (`Line`) | Entry ID | Tình trạng phát hiện & Phân loại | Liên kết Canon |
| :--- | :--- | :--- | :---: |
| `lore.json:60–72` | `lore_memory_chapter_3`, `4` | Chứa `"Chỉ Huy Hiệp Sĩ Đen"`, `"thuộc hạ dưới trướng"`, `"tự tay xóa đi ký ức để tránh tâm ma"`. **`CONFLICT`** | `DEC-LOCK-01/02/07` |
| `lore.json:74–79` | `lore_wayfarer_inner_journal` | Khẳng định *"dùng Cổ Ngữ `Algiz` phong ấn toàn bộ ký ức của chính mình"*. **`CONFLICT`** | `DEC-LOCK-02 (OQ-03)` |
| `lore.json:81–86` & `tornPagesData.ts:291–303` | `lore_knights_memorial_stele` / `inspect_knights_memorial_stele` | Sai chính tả **`Sir Valen`** (`lore.json:85`, `tornPagesData:299`) + ghi *"tên Tổng Chỉ Huy bị cào mòn / Chỉ Huy sẽ trở lại"*. **`REWRITE` / `CONFLICT`** | `DEC-LOCK-01/06` |
| `lore.json:335–340` & `tornPagesData.ts:307–319` | `lore_black_knight_chronicle` / `read_black_knight_stele` | Lộ ở `stage = 1` rằng `"Hiệp Sĩ Đen — vị chỉ huy... phong ấn lời nguyền & đánh đổi ký ức"`; `L316` nhắc *"ngọn đèn bão"*. **`CONFLICT`** | `DEC-LOCK-02/07` |
| `tornPagesData.ts:240–252` | `read_blacksmith_journal` | Gắn `memoryAwakeningStage: 1` và nhắc *"vị Chỉ Huy Hiệp Sĩ Đen"*. **`REWRITE` / `CONFLICT`** | `DEC-LOCK-01/07` |
| `tornPagesData.ts:347` | `read_shrine_stele` | Dùng từ cũ *"ngọn đèn bão"* thay cho Vòng Sáng Hộ Tâm (`AI_IRON_RULES §3`). **`REWRITE`** | `AI_IRON_RULES` |
| `lore.json:151–170` | `lore_ending_true/sacrifice/fog_loop` | Nhắc *"hàng trăm năm"* (`L155`) và *"Chỉ Huy Hiệp Sĩ Đen"*. **`CONFLICT` / `REWRITE`** | `DEC-LOCK-04/18` |
| `lore.json:492–513` | `sideQuestLog` (`SQ08_PURIFY_FALLEN`) | Gọi Boss là *"Chỉ Huy Hiệp Sĩ Trùm Mũ (Hooded Knight Boss)"*. **`CONFLICT`** | `DEC-LOCK-09 (OQ-04)` |
| `lore.json` *(20 entries còn lại)* | `lore_three_rules`, `lore_clapper_curse`, `lore_elian_unsent_letter`, `lore_mire_warden_memory`, v.v. | Phù hợp Lore thế giới Bellhollow / Mạch Rễ / Elian tách biệt. **`KEEP`** | `HW-NR-01 §7` |

### 2.3 `quests.json`, `Journal`, `Memory`, `NPC` & `Boss Dialogue`
- **`quests.json` (`214` lines, `7` stages):** Cấu trúc route `A→E→B→D→F→E→C→A` và từ ngữ `Huy Hiệu Kỵ Sĩ Sa Ngã` sạch `Drager` / sạch `tự phong ấn` (`KEEP` về cấu trúc; chỉ rà nhẹ wording nếu `OQ-04` đổi vai trò Sir Vaelen / Crest).
- **`JournalModal.ts:909`:** Tiêu đề `'📜 BIÊN NIÊN KÝ ỨC HIỆP SĨ ĐEN & CỔ THƯ:'` hiển thị ngay khi mở Sổ Tay (`REWRITE` theo mốc reveal `DEC-LOCK-07`).
- **`PlayerState.ts` Memory Gates (`L610–622`, `L758–788`) & Bestiary (`L930–931`):** Stage `1` mở thẳng `lore_black_knight_chronicle`; lựa chọn đồng cảm mở thẳng `lore_wayfarer_inner_journal`; Bestiary ghi `nameVi: 'Chỉ Huy Hiệp Sĩ Trùm Mũ'` (`CONFLICT`).
- **`EvilKnights.ts:833,839` (Boss dialogue):** `HoodedKnightBoss` gọi NVC `"Chỉ Huy Hiệp Sĩ Đen"` khi nhận diện (`CONFLICT`, chờ `OQ-04/17`).
- **`BossMireWarden.ts` / `MireWardenBoss.ts` / `NPCEntity.ts`:** Không chứa lời thoại text sai canon hardcoded (`KEEP`).

### 2.4 `Main Menu`, `Act 0 & Act 1`, `Loading Tips`, `Tooltips`, `Item Descriptions`, `Localization`
- **`MainMenuScene.ts:797` (`showChronicleAndGuideModal`):** **`P0 SPOILER`!** Ghi nguyên văn *"Ngươi — Chỉ huy Hiệp Sĩ Đen mang mảnh ký ức ngủ vùi —..."* (`REWRITE`). Dòng `L52/59/795` (`DỊ CẢNH RỪNG SƯƠNG / THE FOG THAT REMEMBERS`) thuộc `CONFLICT` chờ `OQ-17`.
- **`Act 0` & `Act 1` (`GameScene.ts:1393–1430, 2731`, `EchoSystem.ts:17–45, 113`):**
  - `GameScene.ts:1419`: Popup mở đầu `"🔔 Một tiếng chuông đồng mơ hồ ngân vang..."` (`CONFLICT` nhẹ với `OQ-02` / Prologue `CS03`).
  - `EchoSystem.ts:24,33,42`: Lời thoại Echo về chuông & quy tắc sống sót (`KEEP`), nhưng **`EchoSystem.ts:112–115`** tự động nâng `memoryAwakeningStage = 2` khi chạm Echo (`REWRITE` nếu cần đồng bộ Reveal Curve).
- **`PreloadScene.ts:140–151` (`LORE_TIPS` — Loading Tips):** `9/10` mẹo rất chuẩn (`KEEP`), riêng **`LORE_TIPS[1]` (`L142`)** viết *"khi ngọn đèn lồng chưa được châm đầy dầu thông"* (thuật ngữ dầu đèn cũ trước `V1.5.2` chuyển sang Vòng Sáng Hộ Tâm `[F]` → `REWRITE`). Tiêu đề `L302` (`THE FOG THAT REMEMBERS`) & `index.html:6` chờ `DEC-LOCK-17`.
- **`ItemTooltipHelper.ts` (`L40,57,68`) & `items.json` (`L92,362`) & `content_registry.json` & `registryData.ts`:**
  - `items.json:362` (`quest_corrupted_crest`), `content_registry.json:298,743..` & `registryData.ts`: nhắc `"Chỉ Huy Hiệp Sĩ Trùm Mũ"` (`REWRITE` theo `OQ-04`).
  - `lore_satyr_journal` (`items.json:92`, `Tooltip L40`), `wpn_walking_staff` (`Tooltip L57`): hiển thị `"Sổ Nhật Ký Lữ Khách"` / `"Mossbound Wayfarer"` — giữ nguyên ID & wording trung tính giai đoạn đầu (`KEEP` ID).
- **`Localization`:** Game không tách thư mục locale ngoài; toàn bộ chuỗi Việt/Anh nằm inline trong các tệp trên.

### 2.5 `World Map`, `Cutscene`, `Ending`, `Hardcoded Text`, `Fallback Dialogue`, `Legacy Save Recovery`
- **`World Map & Zone Lore`:**
  - **`zones.json:4172–4179` & `maps/veil_origin_cavern.json:8600–8621` (`veil_commander_epistle`):** Chứa văn bản phong ấn cũ: *"Ta — Chỉ Huy Hiệp Sĩ Đen — xin tự phong ấn ký ức và bản ngã của mình..."* (`CONFLICT` `DEC-LOCK-02`).
  - **`maps/sub_bell_workshop.json:2643,2648` & `zones.json:3006,3012`:** Nhãn `"Văn Bia Cổ Hiệp Sĩ Đen"` (`CONFLICT` lộ sớm tại Stage 1/2 `DEC-LOCK-07`).
  - **`WorldGatingSystem.ts:185`:** `"bia mộ Hiệp Sĩ Đen"` (`REWRITE` nếu ẩn sớm), flag `knight_commander_defeated` (`L193`, `KEEP` technical ID).
  - **`ParchmentWorldMapModal.ts`:** Đang hiện `10/17` zone; dòng `L64` gọi `"cội nguồn tà ác của Màn Sương"` (`KEEP` / mở rộng lên 17 zone ở Track A).
- **`Cutscene & Ending (`EndingSystem.ts`)`:**
  - **`EndingSystem.ts:1037`:** Tàn dư thoại **`'Satyr: “Ánh đèn pha ô tô... quốc lộ ven rừng?! Thế giới của mình... con đường về nhà có thật!”'`** (`REMOVE FROM RUNTIME`!).
  - **`EndingSystem.ts:78,79,97,117,792`:** Lặp *"suốt hàng trăm năm"* & *"Chỉ Huy Hiệp Sĩ Đen"* (`CONFLICT` `DEC-LOCK-04/18`).
- **`Hardcoded Text (`GameScene.ts`, `UIScene.ts`, `VeilSystem.ts`):**`
  - `VeilSystem.ts:44`: `'“Satyr... quay lại đi... con đường về nhà ở phía sau...”'` (`REPLACE`).
  - `GameScene.ts:802,808,814,2423,2427,3140–3144`: Popup chiến đấu gọi HoodedKnightBoss là `"Chỉ Huy Hiệp Sĩ"` (`REWRITE` theo `OQ-04`).
  - `GameScene.ts:4292,4382,4849` & `L5426`: Popup Xưởng Chuông / SQ08 / Bia Đá lộ chữ `"Hiệp Sĩ Đen"` / `"Chỉ Huy"` sớm (`CONFLICT` `DEC-LOCK-07`).
  - `UIScene.ts:340,1063`: HUD title `'⚔️ Hiệp Sĩ Đen (Black Knight)'` ở `stage >= 3` (`REWRITE` sang `Meliodas Blackwood` khi reveal).
- **`Fallback Dialogue (`DialogueSystem.ts:121`):** Chỉ `console.warn` (`KEEP`).`
- **`Legacy Save Recovery (`SaveManager.ts:78,225,354,386,404–455`, `CloudSaveService.ts:175–257`):**` Khôi phục `memoryAwakeningStage`, `unlockedLoreIds`, `storyFlags`, `legacyExtraData`, alias `quest_corrupted_knight_crest → quest_corrupted_crest`, `lore_satyr_journal`. Phải giữ toàn bộ schema ID & aliasing (`KEEP`), đồng thời viết nội dung mới trong cùng `loreId` cũ sao cho save cũ khi `Continue` không bị gãy hoặc trống lore.
