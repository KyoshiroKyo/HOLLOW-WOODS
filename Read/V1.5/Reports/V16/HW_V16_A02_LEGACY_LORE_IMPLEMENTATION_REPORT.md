# HW-V16-A02 — APPROVED LEGACY LORE CLEANUP & NARRATIVE IMPLEMENTATION REPORT

- **Mission ID:** `HW-V16-A02 — APPROVED LEGACY LORE CLEANUP & NARRATIVE IMPLEMENTATION`
- **Project:** `HOLLOW WOODS — THE UNBROKEN OATH` (`Target: V1.6.0`)
- **Studio:** `KYOSHIRO STUDIO`
- **Agent:** `AG 4 Hydro High`
- **Roadmap:** `3.1` | **Dependency:** `HW-V16-A01` (`PASS`)
- **Branch / Baseline:** `feat/v1.5.3-ag-world-polish` @ `f35da6d3867cc8c9714cfd293406c490d752e8c4`
- **Safety Backup Created:** `Backups/steps/backup_hw_v16_a02/` (`22` files preserved intact before edits)

---

## 1. Executive Summary (`§16 FINAL REPORT`)

- **TASK STATUS:** **`PASS`** *(Legacy Lore Cleanup, Modern Residue Removal, Spoiler Blocking & Vaelen/Mordric Conflict Fix Implemented & Verified)*
- **CANON LOCKS IMPLEMENTED (`A02` Scope):** `DEC-LOCK-01`, `DEC-LOCK-02`, `DEC-LOCK-03`, `DEC-LOCK-04`, `DEC-LOCK-05`, `DEC-LOCK-06` *(Name/Motto text)*, `DEC-LOCK-07` *(Anti-spoiler & Stage 3 label)*, `DEC-LOCK-08`, `DEC-LOCK-09` *(Mordric = HoodedKnightBoss Compat)*, `DEC-LOCK-10`, `DEC-LOCK-15`, `DEC-LOCK-19`
- **PRODUCTION FILES MODIFIED:** **`21` files** (`14` TypeScript + `7` JSON):
  - `src/systems/EndingSystem.ts`, `src/systems/VeilSystem.ts`, `src/systems/DialogueSystem.ts`
  - `src/scenes/MainMenuScene.ts`, `src/scenes/PreloadScene.ts`, `src/scenes/UIScene.ts`, `src/scenes/GameScene.ts`
  - `src/entities/EvilKnights.ts`, `src/state/PlayerState.ts`, `src/ui/JournalModal.ts`, `src/ui/ItemTooltipHelper.ts`
  - `src/world/WorldGatingSystem.ts`, `src/registry/registryData.ts`, `src/data/tornPagesData.ts`
  - `src/data/lore.json`, `src/data/dialogues.json`, `src/data/items.json`, `src/data/zones.json`, `src/data/content_registry.json`
  - `src/data/maps/sub_bell_workshop.json`, `src/data/maps/veil_origin_cavern.json` *(còn `SaveManager.ts` được sao lưu phòng ngừa trong `Backups/steps/backup_hw_v16_a02/` nhưng không phát sinh sửa đổi)*
- **LEGACY LORE BEFORE:** Tự phong ấn ký ức/`Algiz`/tái sinh; cảnh ô tô/đèn pha/quốc lộ & thoại `Satyr:`; spoil `Chỉ huy Hiệp Sĩ Đen` ngay Main Menu, Journal, HUD & Stage 1 Xưởng Chuông; `"Sir Valen"`; `"hàng trăm năm"`; `"dầu thông"`/`"ngọn đèn bão"`; `Vaelen q2` tin Hooded là Tổng Chỉ Huy; `HoodedKnightBoss` gọi NVC `"Chỉ Huy"` & nhắc tự phong ấn tái sinh.
- **LEGACY LORE AFTER:** Meliodas Blackwood (The Wolf Lord — Người Thầy & Tổng Chỉ Huy Đoàn Kỵ Sĩ Hắc Lang, *Fides Ultra Tenebras*) nghe lời cầu cứu bí ẩn từ rừng già (`UNKNOWN`), gặp biến cố xuyên thời gian bí ẩn (không chốt số năm hay quan hệ nhân quả với 7 hồi chuông), tỉnh dậy làm *Lữ Khách Rêu Phong*; ẩn danh tính ở Main Menu & Stage 0–2; `Sir Mordric = The Dark Knight = HoodedKnightBoss` thống nhất xuyên suốt; thoại Dark Fantasy sạch bối cảnh hiện đại.
- **RESIDUES REPLACED:** **`100%`** các tàn dư mục tiêu trong `src/` & `dist/` (`dist_residue_hits = 0`).
- **TECHNICAL REFERENCES PRESERVED:** `lore_satyr_journal`, `SatyrPlayer.ts`, `SatyrAnimations.ts`, `satyr_*`, `boss_hooded_knight`, `HoodedKnightBoss` class, `hooded_knight_sheet`, `portrait_hooded_knight`, `quest_corrupted_crest`, `knight_commander_defeated`, `veil_commander_epistle` ID, `Algiz` cọc đầm lầy (`lore_broken_sword_mire` & `GameScene:5531`), `59/59` dialogue keys, `17` zone IDs, `Save Schema 3`, `3` Ending thresholds (`50 / 3 / 65`), `Classic Sanity 2.1`, Vòng Sáng `[F]`, `Black Knight V2`, `H4-06`, `H4-12A`.
- **REMAINING RESIDUES:** **`0`** nội dung hiển thị người chơi trái Canon trong `dist/assets/*.js`. Chỉ còn tên lớp/comment kỹ thuật nội bộ (`HoodedKnightBoss`, comments trong `EndingSystem.ts:11/579/580/644`, `EvilKnights.ts:10/15/664/814`, `WildlifeSystem.ts:498/526`, `TornPageModal.ts:794`, `AudioManager.ts:3812`) được giữ nguyên chủ ý (`KEEP-TECHNICAL`) để không chạm hệ thống/class đang hoạt động.
- **DEFERRED ITEMS:**
  - `A06/B07`: Identity Reveal Evidence Resolver chi tiết (`Memory Stage >= 3 AND Chứng cứ phù hợp` ngoài `Q05/SQ08`) — A02 giữ nguyên cơ chế Stage hiện hành & chống spoil bằng văn bản trung tính.
  - `A03–A05`: Mở rộng nguyên văn thoại Trailer `V12.2` (`DLG-006..034`) & phân nhánh choice mới.
  - `A07`: Viết lại văn bản chính thức mới cho 3 Ending sau khi Owner duyệt lời kết cuối (`DEC-LOCK-18`).
  - `D06/D07/E06` (`CHAR-006 — The Headless Warden`), `BUG-058/059` (`Codex`), `B06` (`Audio`), `C01–C10` (`World 2.0`).
- **DIALOGUE KEYS:** **`59 / 59` PRESERVED** (`0` key bị xóa/đổi tên).
- **DIALOGUE PAYLOAD INTEGRITY:** **`100% INTACT`** (toàn bộ `choices`, `trustDelta`, `setFlag`, `onCompleteFlag`, `nextQuestId`, `nextDialogueKey`, `rewardItem`, `rewardCount`, `healPlayer` giữ nguyên).
- **MORDRIC IDENTITY:** **`SYNCHRONIZED`** — `Sir Mordric = The Dark Knight = HoodedKnightBoss` thống nhất trên Dialogue, Boss intro/defeat/combat popups, Bestiary, Items, Content Registry, Quests & Bàn cờ đá (`DEC-LOCK-09`, giữ 100% runtime IDs/flags/quest).
- **EARLY IDENTITY SPOILER:** **`ELIMINATED`** trên Main Menu (`showChronicleAndGuideModal`), HUD Stage 0–2 (`Lữ Khách Rêu Phong`), Journal header (`BIÊN NIÊN KÝ ỨC & CỔ THƯ BELLHOLLOW`), Stage 1 Xưởng Chuông (`lore_black_knight_chronicle`), Torn Pages, Bia đá & `WorldGatingSystem`.
- **IDENTITY REVEAL RESOLVER:** Hiện dùng gate Stage 3 hiện hành của baseline (`GameScene:4849`, `UIScene:340/1063`, `EndingSystem:792`); chưa tạo cờ chứng cứ mới (`DEFERRED TO A06/B07` theo §7).
- **QUEST COMPATIBILITY:** **`PASS`** (`test_v15_60_quest_chain_restructuring.mjs`: `72/72 PASS`, main route `A→E→B→D→F→E→C→A` + `SQ08` tùy chọn nguyên vẹn, `0` softlock).
- **ENDING COMPATIBILITY:** **`PASS` (Logic & Selection)** — `determineEndingType()` giữ nguyên `true_ending` (`50 / 3 / 65`), `sacrifice_ending` (`stage >= 2`), `fog_loop_ending`; `verify_v15_20_multiple_endings.mjs` đạt `44/46` (`2` assertion chuỗi V1.5 cũ `"Chỉ Huy Hiệp Sĩ Đen"` / `"ngọn đèn"` thất bại có chủ ý do text mới theo Canon `DEC-LOCK-01/08/18` — giữ nguyên script lịch sử).
- **SAVE COMPATIBILITY:** **`PASS`** (`test_v153_save_schema3.mjs`: PASS + Playwright `A02_T09_SAVE_STAGES` Stage 0..3 giữ nguyên inventory, quest flags, unlockedLoreIds, trust & `0` thưởng lặp).
- **TYPECHECK (`npm run check`):** **`PASS`** (Exit `0`).
- **DATA INTEGRITY (`npm run verify:data`):** **`PASS`** (`15/15`, Exit `0`).
- **BUILD (`npm run build`):** **`PASS`** (Built in `13.09s`, `dist/assets/index-DEldfsGd.js` `1,186.64 kB`, Exit `0`).
- **TARGETED TEST RESULTS:** `A02-T01..T12` Verified (`7/7` Playwright runtime suites PASS trên Chrome headless `dist/`, `0` console/page/HTTP errors, `6` PNG screenshots verified bằng mắt; `verify_zero_404_assets.mjs` `212/212`; `verify_v15_16` PASS; `test_v15_60` `72/72`; `test_v153_save_schema3` PASS; `verify_v15_20` `44/46` expected legacy string diff).
- **ARCHIVES PRESERVED:** **`100%`** (`91/91` archives intact, `Backups/steps/backup_hw_v16_a02/` `22` files saved).
- **FILES DELETED:** **`0`**

---

## 2. BEFORE / AFTER Change Ledger (`HW-V16-A02`)

| File & Key / Line | Old Content (`BEFORE`) | New Content (`AFTER`) | `DEC-LOCK` | Test Result |
| :--- | :--- | :--- | :---: | :---: |
| `EndingSystem.ts:1018–1037` | Đồ họa quốc lộ/đèn pha ô tô & `'Satyr: “Ánh đèn pha ô tô... quốc lộ ven rừng?!”'` | Ánh lửa Hộ Tâm & `'“Giữa những tầng sương, một lối mòn quen thuộc dần hiện ra.”'` | `08`, `15` | `A02-T02/T11` PASS |
| `EndingSystem.ts:78–118, 792` | `"suốt hàng trăm năm"`, `"Chỉ Huy Hiệp Sĩ Đen"`, `"ngọn đèn"` | `"bao mùa sương lạnh"`, `"Meliodas Blackwood — The Wolf Lord"`, `"Vòng Sáng Hộ Tâm"` | `01`, `04`, `07`, `18` | `A02-T08/T11` PASS |
| `VeilSystem.ts:44` | `'“Satyr... quay lại đi... con đường về nhà ở phía sau...”'` | `'“Quay lại đi… con đường ngươi tìm kiếm vẫn còn ở phía sau…”'` | `08`, `15` | `A02-T02/T11` PASS |
| `MainMenuScene.ts:797` | `'Ngươi — Chỉ huy Hiệp Sĩ Đen mang mảnh ký ức ngủ vùi — thắp sáng Đèn Lồng Hổ Phách...'` | `'Một kẻ lữ hành mất ký ức tỉnh dậy giữa màn sương — thắp sáng Vòng Sáng Hộ Tâm [F]...'` | `07` | `A02-T03` PASS |
| `PreloadScene.ts:142` | `'...ngọn đèn lồng chưa được châm đầy dầu thông.'` | `'...Vòng Sáng Hộ Tâm [F] chưa sẵn sàng dẫn lối giữa màn sương.'` | `08`, `AI_IRON` | `A02-T01/T11` PASS |
| `UIScene.ts:340, 1063` | `'🌲 The Mossbound Wayfarer'` / `'⚔️ Hiệp Sĩ Đen (Black Knight)'` | `'🌲 Lữ Khách Rêu Phong'` (Stage < 3) / `'⚔️ Meliodas Blackwood'` (Stage >= 3) | `07` | `A02-T03/T10` PASS |
| `UIScene.ts:3818` & `DialogueSystem.ts:157` | Chỉ match `speaker.includes('Trùm Mũ')` | Thêm match `'Mordric'` & `'Kỵ Sĩ Bóng Tối'` giữ portrait `portrait_hooded_knight` | `09` | `A02-T04` PASS |
| `JournalModal.ts:909` | `'📜 BIÊN NIÊN KÝ ỨC HIỆP SĨ ĐEN & CỔ THƯ:'` | `'📜 BIÊN NIÊN KÝ ỨC & CỔ THƯ BELLHOLLOW:'` | `07` | `A02-T03` PASS |
| `WorldGatingSystem.ts:185` | `'...khóa chặt bởi bia mộ Hiệp Sĩ Đen!'` | `'...khóa chặt bởi phong ấn cổ ngữ rễ cây!'` | `07` | `A02-T03` PASS |
| `GameScene.ts:802..3144` | `"CHỈ HUY HIỆP SĨ"` / `"Chỉ Huy Hiệp Sĩ Trùm Mũ"` / `"Đèn Lồng [F]"` | `"KỴ SĨ TRÙM MŨ"` / `"Sir Mordric"` (khi hạ gục) / `"Vòng Sáng Hộ Tâm [F]"` | `09`, `10` | `A02-T04` PASS |
| `GameScene.ts:4292, 4382, 4849, 5426, 5544` | Stage 1 lộ `Hiệp Sĩ Đen`; Stage 3 `"Chỉ Huy Hiệp Sĩ Đen"`; `"vị Chỉ Huy"`; `"Hooded Knight"` | Stage 1 dư ảnh lời thề cổ; Stage 3 `Meliodas Blackwood — The Wolf Lord`; `"thủ lĩnh"`; `"Sir Mordric"` | `01`, `07`, `09` | `A02-T03/T11` PASS |
| `EvilKnights.ts:833, 839` | `'...Ngài chính là Chỉ Huy Hiệp Sĩ Đen?!'` | `'Bộ giáp ấy… thật quen thuộc. Vết chém chéo trên bao kiếm… Nhưng ngươi thực sự là ai?'` | `07`, `09` | `A02-T04` PASS |
| `PlayerState.ts:930–935`, `items.json:362`, `ItemTooltipHelper.ts:68`, `content_registry.json`, `registryData.ts` | `"Chỉ Huy Hiệp Sĩ Trùm Mũ"` / `"Hooded Knight Commander"` | `"Sir Mordric — Kỵ Sĩ Bóng Tối (Kỵ Sĩ Trùm Mũ)"` / `"Sir Mordric — The Dark Knight"` | `09` | `A02-T04/T08` PASS |
| `lore.json` (`ch2/3/4`, `inner_journal`, `stele`, `chronicle`, `ending_*`, `SQ08`) | Tự phong ấn/`Algiz` xóa ký ức; `"Sir Valen"`; `"hàng trăm năm"`; lộ Chỉ Huy từ Stage 1 | Biến cố xuyên thời gian bí ẩn; tiếng gọi `UNKNOWN`; `"Sir Vaelen"`; Đoàn Hắc Lang (*Fides Ultra Tenebras*); `Meliodas Blackwood` tại Stage 3; `Sir Mordric` trong `SQ08` | `01..09`, `18` | `A02-T05/T06` PASS |
| `dialogues.json` (`campfire_knight_*`, `hooded_knight_*`, `*_reverence`) | Vaelen `q2` nói Hooded = Chỉ Huy; `q3` & `defeat` nói tự phong ấn tái sinh; `edda` nhắc `"trăm năm"` | `q2` xác nhận bạn cũ `Sir Mordric` (`C02` solved); `q3` & `defeat` nhận diện thầy/biến cố thời gian; toàn bộ `59` keys & payload intact | `01..10`, `19` | `A02-T04/T05` PASS |
| `tornPagesData.ts`, `zones.json`, `maps/sub_bell_workshop.json`, `maps/veil_origin_cavern.json` | `"Sir Valen"`, `"ngọn đèn bão"`, `"Văn Bia Cổ Hiệp Sĩ Đen"`, `"Huyết Thư... xin tự phong ấn"` | `"Sir Vaelen"`, `"Vòng Sáng Hộ Tâm [F]"`, `"Văn Bia Cổ Đoàn Kỵ Sĩ"`, `"Bức Thư Sương Mù Cổ Xưa"` (biến cố sau lời cầu cứu) | `01..08` | `A02-T06/T11` PASS |

---

## 3. Targeted Test Matrix (`A02-T01` – `A02-T12`)

| Test ID | Scope | EXPECTED | ACTUAL | Status | Evidence |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **`A02-T01`** | Residue scan | Mọi cụm cũ được phân loại sạch `REPLACED / KEEP-TECHNICAL / KEEP-CANON / DEFERRED` | `dist/` `0` legacy hits; chỉ còn comment/class nội bộ giữ kỹ thuật (`KEEP-TECHNICAL`) | **PASS** | `Select-String` `src` + `dist` |
| **`A02-T02`** | Modern cleanup | Không còn ô tô, đèn pha, quốc lộ, `Satyr:` | `0` hits trong `EndingSystem.ts`, `VeilSystem.ts` & `dist/` | **PASS** | `dist_residue_hits=0` |
| **`A02-T03`** | Early spoiler | Main Menu, HUD Stage 0–2, Journal Stage 1 không lộ `Meliodas`/`Chỉ Huy` | Menu/HUD=`Lữ Khách Rêu Phong`, Journal=`BIÊN NIÊN KÝ ỨC & CỔ THƯ BELLHOLLOW` (`0` spoil) | **PASS** | [A02_MAIN_MENU_NO_SPOILER.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-V16-A02/A02_MAIN_MENU_NO_SPOILER.png), [A02_EARLY_GAME_WAYFARER.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-V16-A02/A02_EARLY_GAME_WAYFARER.png), [A02_JOURNAL_NO_SPOILER.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-V16-A02/A02_JOURNAL_NO_SPOILER.png) |
| **`A02-T04`** | Vaelen & Mordric | Hết mâu thuẫn Tổng Chỉ Huy ở `q2`; hết tự phong ấn tái sinh; portrait chuẩn | `q2` nêu `Sir Mordric`; `q3` & `defeat` đúng Canon; portrait `campfire`/`hooded` hiển thị `100%` | **PASS** | [A02_VAELEN_DIALOGUE.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-V16-A02/A02_VAELEN_DIALOGUE.png), [A02_MORDRIC_DIALOGUE.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-V16-A02/A02_MORDRIC_DIALOGUE.png) |
| **`A02-T05`** | Dialogue payload | Giữ `59/59` keys, `verify_v15_16` pass, không mất reward/flag/nextQuestId | `59/59` keys, `verify_v15_16_story_and_dialogue.mjs` exit `0`, payload JSON checked | **PASS** | [hw_v16_a02_verification.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-V16-A02/hw_v16_a02_verification.json) |
| **`A02-T06`** | Lore & Torn Pages | `loreId` & Torn Pages hợp lệ, không trùng ID | `verify:data` `15/15 PASS` (`29` lore, `92` registry) | **PASS** | `npm run verify:data` exit `0` |
| **`A02-T07`** | Quest route | `A→E→B→D→F→E→C→A` & `SQ08` tùy chọn không softlock | `test_v15_60_quest_chain_restructuring.mjs` **`72/72 PASS`** | **PASS** | `task-27413` exit `0` |
| **`A02-T08`** | Ending logic | 3 Ending giữ nguyên điều kiện (`50 / 3 / 65`) | Runtime `determineEndingType()` trả `true_ending`/`sacrifice_ending`/`fog_loop_ending` đúng; `verify_v15_20` `44/46` (`2` assertion chuỗi V1.5 cũ expected) | **PASS** *(Baseline logic)* | [hw_v16_a02_verification.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-V16-A02/hw_v16_a02_verification.json) |
| **`A02-T09`** | Save Schema 3 | Stage 0..3 giữ nguyên item/flag/lore/trust, 0 thưởng lặp | `test_v153_save_schema3.mjs` PASS + Playwright `A02_T09_SAVE_STAGES` Stage 0..3 PASS | **PASS** | [hw_v16_a02_verification.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-V16-A02/hw_v16_a02_verification.json) |
| **`A02-T10`** | Runtime UI | Font tiếng Việt rõ, không tràn khung, `0` console/page/HTTP errors | `7/7` runtime suites PASS, `console=0`, `page=0`, `http=0`, `6` PNGs verified | **PASS** | [A02_RUNTIME_LORE_UPDATED.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-V16-A02/A02_RUNTIME_LORE_UPDATED.png) |
| **`A02-T11`** | Production Build | `check`, `verify:data`, `build`, `zero_404` pass & `dist/` sạch | `check=0`, `data=0` (`15/15`), `build=0`, `zero_404=212/212`, `dist_residue_hits=0` | **PASS** | `task-27424` |
| **`A02-T12`** | Git & Asset safety | `diff --check` sạch, `0` xóa file, `297` staged `Pixel_Art/` nguyên vẹn | `diff_check=0`, `cached_check=0`, `Pixel_Art` staged=`297`, backups=`22` files | **PASS** | `git diff --check` |

- **Next Mission Queued (`HARD STOP`):** **`HW-V16-A03 — PROLOGUE, ACT 0 & BELLHOLLOW NARRATIVE`**.
