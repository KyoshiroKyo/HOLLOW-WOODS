# HOLLOW WOODS — SOURCE IMPACT MATRIX (VERIFIED FILE PATHS & CODE LINES)

- **Mission:** `HW-NARRATIVE-00D — DIALOGUE, QUEST & SOURCE IMPACT AUDIT` (`READ-ONLY`)
- **Nguyên tắc kiểm tra:** Chỉ ghi đường dẫn **tồn tại thật** trong `G:\HOLLOW WOODS\src\`; phân loại rõ `LOW / MEDIUM / HIGH / CRITICAL`; không tạo tên file tưởng tượng; không thực hiện global search-and-replace.

---

## 1. Xác Minh Tồn Tại Các File Nghi Vấn Từ Bible (`Ch. 15` & `Ch. 17 Table 18`)

| Đường dẫn nêu trong hồ sơ cũ | Trạng thái thực tế tại `G:\HOLLOW WOODS` | Ghi chú |
| :--- | :---: | :--- |
| `src/scenes/Act0Scene.ts`, `Act1Scene.ts`, `OpeningCutsceneScene.ts` | **KHÔNG TỒN TẠI** | Logic Act 0 nằm trong `src/scenes/GameScene.ts` (`L1065, L1393, L2712, L3324`). |
| `src/systems/WorldGatingSystem.ts` | Không ở `systems/` | Thực tế nằm tại **`src/world/WorldGatingSystem.ts`** (`479` lines). |
| `src/systems/BossEncounterSystem.ts` | **TỒN TẠI** | Có thật trong `src/systems/BossEncounterSystem.ts` (kiểm trước nếu đụng chạm boss queue). |
| `src/entities/BossMireWarden.ts` (`65` lines) & `MireWardenBoss.ts` (`746` lines) | **CẢ HAI TỒN TẠI** | `GameScene.ts` khởi tạo `new BossMireWarden(...)` (`L6805`); cần giữ entry point thật này. |

---

## 2. Ma Trận Tác Động Source Chi Tiết (`CRITICAL → LOW`)

### 2.1 Nhóm **`CRITICAL`** (`REVEAL / SAVE / ENDING` — Chờ chốt `OQ-01..09`, `OQ-18`, `OQ-20`)
| File Thực Tế (Lines) | Điểm Logic / Dòng Code Xác Minh | Thay đổi dự kiến (Chỉ sau Owner duyệt) | Rủi ro kỹ thuật & Bảo vệ |
| :--- | :--- | :--- | :--- |
| `src/state/PlayerState.ts` (`1,042`) | `setStoryFlag` (`L405`); `checkQuestProgression` (`L581–623`, nhánh mở `lore_wayfarer_inner_journal` `L610–622`); `setMemoryAwakeningStage` (`L758–775` mở `lore_black_knight_chronicle` tại `stage 1`); `unlockAllMemoryChapters` (`L783–788`) | Điều chỉnh cổng mở lore để không spoil tự phong ấn / Chỉ Huy tại `stage 1–2`; phân biệt rõ `storyFlags` vs gameplay `flags`. | **CRITICAL:** Sai cổng làm kẹt `stage >= 2/3`, lệch ending hoặc mất lore đã mở trong save cũ. |
| `src/systems/EndingSystem.ts` (`1,096`) | `ENDING_CONFIGS` (`L64–120`: "Chỉ Huy Hiệp Sĩ Đen", "hàng trăm năm"); `determineEndingType` (`L205–222`: `comp>=50 && stage>=3 && trust>=65`); `triggerTheFirstTollFinale` (`L227`) | Cập nhật `narrativeLines` nếu Owner chốt lore mới (`NAR-021`); **giữ nguyên ID & 3 ngưỡng công thức**. | **CRITICAL:** Bất kỳ thay đổi điều kiện nào đều phá vỡ cân bằng 3 ending. |
| `src/scenes/EndingScene.ts` (`32`) | Scene trình chiếu ending | Giữ nguyên wrapper lifecycle; kiểm tương thích nếu `EndingSystem` đổi text. | **CRITICAL:** Mất trạng thái trả về Main Menu / New Journey. |
| `src/systems/SaveManager.ts` (`789`) | `CURRENT_SCHEMA_VERSION = 3` (`L68`); restore/serialize `memoryAwakeningStage`, `villageTrustScore`, `storyFlags`, `legacyExtraData` (`L380–454`, `L534–538`, `L699–722`); alias `quest_corrupted_crest` (`L225/354`) | Giữ schema `3`; nếu thêm cờ mới (`prologue_seen`, choice-once), mặc định `false` cho save cũ. | **CRITICAL:** Tuyệt đối không reset save, không đổi item/quest/lore ID. |
| `src/services/CloudSaveService.ts` (`680`) | Đồng bộ cloud & alias `quest_corrupted_knight_crest → quest_corrupted_crest` (`L175–257`) | Giữ đồng bộ trường tương tự `SaveManager`. | **CRITICAL:** Lệch cloud vs local save. |

### 2.2 Nhóm **`HIGH`** (`RUNTIME / DIALOGUE ROUTING / QUEST / ENEMIES / UI`)
| File Thực Tế (Lines) | Điểm Logic / Dòng Code Xác Minh | Thay đổi dự kiến (Chỉ sau Owner duyệt) | Rủi ro kỹ thuật & Bảo vệ |
| :--- | :--- | :--- | :--- |
| `src/scenes/MainMenuScene.ts` (`1,185`) | `startNewGame` (`L290`); `showChronicleAndGuideModal` (`L746`, spoil `"Chỉ huy Hiệp Sĩ Đen"` tại **`L797`**) | Rewrite đoạn giới thiệu lore tại `L797` để ẩn thân phận `Meliodas`/Chỉ Huy ở Act 0; giữ tagline runtime trừ khi duyệt branding mới. | **HIGH:** Spoil sớm ngay từ màn hình Menu (`CONFLICT C04`, `I-01`). |
| `src/scenes/GameScene.ts` (`7,404`) | `startAct0Intro` (`L1393`); `triggerAct0AtmosphereTelegraph` (`L3324`); `updateAct0Progression` (`L2712`); Vaelen routing (`L1532–1551`, `L4807–4898`, popup Chỉ Huy `L4849`, `stage=1` `L4882`); crest/rune (`L6164–6226`); First Toll (`L6294`); Mire Warden (`L6773, L7339`) | Thêm hook optional Prologue nếu duyệt `OQ-19` (không chạy khi `Continue`, giữ checkpoint `x≥280`); gỡ popup spoil `L4849` & rà thứ tự `hasCrest` vs `q3_complete`. | **HIGH:** Rủi ro kẹt input/timer/camera Act 0, softlock Vaelen routing hoặc kẹt quest chính. |
| `src/systems/DialogueSystem.ts` (`432`) | `DialogueChoice` (`L7–14` chỉ có `text, actionId?, nextDialogueKey?, setFlag?, trustDelta?, responseLine?`); phím `1–3` (`L75–80`); `selectChoice` (`L291–329` cộng `addVillageTrust` không guard); `endDialogue` (`L331–365`) | Thêm guard **one-time** cho `trustDelta`; hỗ trợ optional `condition` / `choiceId` + hiển thị `> 3` lựa chọn (vd. Vaelen intro `5` choices). | **HIGH:** Cho phép farm `villageTrustScore >= 65` làm sai lệch điều kiện `true_ending` (`I-03`). |
| `src/data/quests.json` (`214`) & `src/systems/QuestSystem.ts` (`303`) | `mainRoute` `A→E→B→D→F→E→C` (`7` stages); `craftPurificationKey` (`QuestSystem.ts:220–229`) | Chỉ cập nhật wording mô tả nếu retcon được duyệt; **cấm sửa `stageId`, `questId`, `legacyQuestId`, `requiredItem`**. | **HIGH:** Phá vỡ tuyến chính hoặc softlock vật phẩm sau cổng. |
| `src/world/WorldGatingSystem.ts` (`479`) | Quy tắc mở `17` zone (`crooked_path` .. `veil_origin_cavern` `L91–196`) | Giữ nguyên quy tắc mở zone; kiểm riêng nếu dời Dark Knight xuống `veil_origin_cavern` (`L193` hiện đòi `knight_commander_defeated`). | **HIGH:** Chặn nhầm lối vào boss/khu vực phụ. |
| `src/entities/EvilKnights.ts` (`1,048`) | `HoodedKnightBoss` (`L668`), `intro` (`L837`), `boss_hooded_knight_defeated` & `quest_corrupted_crest` (`L998–1012`) | Chỉ đổi danh tính/spawn/drop sau khi Owner chốt `OQ-04`, `OQ-14`, `OQ-15`. | **HIGH:** Gãy `SQ08` nếu tự hợp nhất với `Mordric`. |
| `src/systems/WildlifeSystem.ts` (`824`), `EchoSystem.ts` (`127`), `ListenerAI.ts` (`665`), `TheEcho.ts` (`239`), `TheListener.ts` (`282`), `FallenKnightApparition.ts` (`165`) | Quản lý spawn Hooded (`L502`), Echo messages, Listener AI | Không sửa AI / không tự thêm Satyr runtime / không gộp Apparition physics trước duyệt queue riêng. | **HIGH:** Lệch cơ chế sinh tồn & hiệu năng. |
| `src/scenes/UIScene.ts` (`4,043`), `src/ui/JournalModal.ts` (`1,739`), `TornPageModal.ts` (`944`), `PaperNoteModal.ts` (`9`) | Dialogues, Journal, Torn Pages (`HW-H4-12A` đang giữ diff trên `UIScene.ts` & `JournalModal.ts`) | Đảm bảo wrap text tiếng Việt; không spoil trước trong Journal preview; giữ nguyên `HW-H4-12A` & `EVKey`. | **HIGH:** Xung đột merge hoặc vỡ khung UI `#141712`/`#C8963E`. |
| `src/data/zones.json` (`4,215`), `WorldBuilder.ts` (`8,316`), `ZoneConnectionRegistry.ts` (`941`) | `17` zones, `41` transitions (`ZCR` mới có `10` nodes) | Thuộc scope `World Reconstruction 2.0` (`00C` / `HW-WORLD-20B..20F`), không gộp chung sửa chữ narrative. | **HIGH:** Đụng chạm collider/navigation. |
| `src/data/items.json` (`620`), `content_registry.json` (`802`), `src/registry/registryData.ts` (`842`) | Chứa `quest_corrupted_crest`, `item_bell_mold`, `lore_satyr_journal` | Giữ nguyên IDs & aliases; cấm tái dùng `lore_satyr_journal` cho boss `Satyr`. | **HIGH:** Hỏng kho đồ & save migration. |

### 2.3 Nhóm **`MEDIUM`** (`ASSET / PLAYER / AUDIO` — Tách biệt hoàn toàn khỏi text narrative)
- `src/scenes/PreloadScene.ts` (`1,023` lines): Nạp asset/branding (chỉ thêm keyframe prologue hoặc Headless Warden khi đã có asset thật & duyệt).
- `src/entities/BlackKnightPlayer.ts` (`2,524` lines — đang có diff `HW-H4-12A`) & `src/animation/BlackKnightAnimations.ts` (`146` lines): Giữ nguyên atlas `black_knight_*`, scale `1.50` / `1.20`, pivot `(0.5, 1.0)`, Hộ Tâm `[F]`.
- `src/audio/AudioManager.ts` (`3,976` lines): Tích hợp cue/loop `V12.2` thuộc queue audio riêng (`NR-07`), giữ volume sliders.

### 2.4 Nhóm **`LOW`** (`TEXT-ONLY DATA FILES` — Chỉ sửa wording sau khi Owner chốt `OQ-01..09`, `OQ-17`)
- `src/data/dialogues.json` (`995` lines, `59` keys): Sửa lời thoại xung đột `C01–C04` (`campfire_knight_intro/comrade_bond/q2/q3`, `hooded_knight_encounter_intro/defeat`, `edda_black_knight_reverence`), bảo toàn nguyên `speaker`, `portrait`, `onCompleteFlag`, `nextQuestId`, `rewardItem`, `opensEastGate`.
- `src/data/lore.json` (`540` lines, `29` entries): Sửa text tự phong ấn / `Algiz` / Chỉ Huy ở `lore_memory_chapter_4`, `lore_wayfarer_inner_journal`, `lore_black_knight_chronicle`, `lore_ending_*` sau `DEC-NAR`.
- `src/data/tornPagesData.ts` (`366` lines): Kiểm tra `Sir Valen` (`L299`), bia 12 kỵ sĩ, văn bia Hiệp Sĩ Đen (`L309`), và `memoryAwakeningStage: 1` (`L251, L302, L318`).
