# HW-AG-MICRO-04 — Báo Cáo Đổi Tên Hiển Thị “Bà Lão Edda” Thành “Edda”

- **Project:** HOLLOW WOODS V1.6.1
- **Branch:** `feat/v1.6-competition-preview`
- **SHA trước:** `5498bbb7f86c00b84906c7ed0aae22d13841f922` (sau mốc review AG `bf4b629888750f5dbaee1b7092ef852e673958d8`)
- **Status:** **DONE** (`tsc` + `vite build` + kiểm tra tĩnh PASS)
- **Date:** 2026-11-28

---

## 1. Các Vị Trí Tên Hiển Thị Đã Đổi Thành “Edda”

| Tệp & Dòng | Trước | Sau | Phạm vi ảnh hưởng |
|---|---|---|---|
| `src/data/zones.json:190` | `"name": "Bà Lão Edda"` | `"name": "Edda"` | NPC nameplate (`NPCEntity`), prompt tương tác (`Trò chuyện với Edda` tại `GameScene.ts:4800`), danh sách NPC trong F9 (`DeveloperModeManager.ts:244`) |
| `src/data/dialogues.json:894, 934` | `"speaker": "Bà Edda – Người Giữ Chuông"` | `"speaker": "Edda – Người Giữ Chuông"` | Nhãn người nói (`speaker`) trong thoại `edda_black_knight_reverence` và `edda_guide_to_mire` (7 node thoại khác của Edda đã là `"Edda – Người Giữ Chuông"`) |
| `src/entities/WhisperTrap.ts:35` | `speaker: 'Bà lão Edda'` | `speaker: 'Edda'` | Nhãn người nói giả mạo trong bẫy tiếng gọi (đồng bộ với `Garth`, `Finn`, `Neris`) |
| `src/data/quests.json:23` | `"giver": "Garth & Bà Edda (Làng Bellhollow)"` | `"giver": "Garth & Edda (Làng Bellhollow)"` | Nhãn người giao nhiệm vụ (`giver`) |
| `src/ui/JournalModal.ts:122` | `'Nhà Bà Lão Edda & Thầy Thuốc Neris'` | `'Nhà Edda & Thầy Thuốc Neris'` | Nhãn địa danh hiển thị trong Sổ Tay (`JournalModal`), đồng bộ với `'Nhà Edda – Người Giữ Chuông'` (`WorldBuilder.ts:2802`) |
| `src/registry/registryData.ts:796` | `nameVi: 'Bà Lão Edda – Người Giữ Chuông'`, `nameEn: 'Elder Edda the Bellkeeper'` | `nameVi: 'Edda – Người Giữ Chuông'`, `nameEn: 'Edda the Bellkeeper'` | Bản dịch VN/EN trong `ContentRegistry` |
| `src/data/content_registry.json:767` | `"nameVi": "Bà Lão Edda – Người Giữ Chuông"`, `"nameEn": "Elder Edda the Bellkeeper"` | `"nameVi": "Edda – Người Giữ Chuông"`, `"nameEn": "Edda the Bellkeeper"` | Bản JSON mirror của `ContentRegistry` |

---

## 2. Các Chuỗi Văn Kể / Lời Thoại / Canon Được Giữ Nguyên (Không Replace-All)

- **Lời thoại NPC & chỉ dẫn sân khấu (`src/data/dialogues.json`):** dòng `10, 11, 41, 43, 51, 216, 250, 420, 499, 524` (cách nhân vật khác/lời kể gọi *"bà Edda"* / *"Bà lão Edda"*).
- **Mô tả nhiệm vụ (`src/data/quests.json`):** dòng `24, 30` (văn mô tả và task text).
- **Lore & Loading Tip & Tooltip:** `src/data/lore.json` (`211, 367, 376`), `src/scenes/PreloadScene.ts:146`, `src/ui/ItemTooltipHelper.ts:56`, `src/ui/JournalModal.ts:118` (đoạn văn mô tả).
- **Không chạm:** ID (`npc_edda`, `Q01_MEET_EDDA`, `HW-NPC-VILLAGER-000002`), cờ (`talked_to_edda`, `edda_rune_charm_granted`), chân dung (`portrait_edda`), `SaveManager`, `DialogueSystem` (bảo toàn FIX-23).

---

## 3. Kiểm Chứng (Verification)

- `npx tsc --noEmit`: **PASS**
- `npm run build` (`vite build`): **PASS** (`102 modules transformed`, built in `11.81s`)
- Kiểm tra tĩnh JSON & Registry:
  - `eddaZoneName`: `"Edda"`
  - `badSpeakers` (các `speaker` còn `"Bà Edda"` / `"Bà Lão Edda"`): `[]`
  - `questGiver`: `"Garth & Edda (Làng Bellhollow)"`
  - `regVi`: `"Edda – Người Giữ Chuông"`
  - `regEn`: `"Edda the Bellkeeper"`
- **Chưa chạy thêm browser smoke** vì chỉ đổi chuỗi hiển thị và giữ nguyên toàn bộ ID, cờ, `DialogueSystem` (FIX-23) và logic thưởng.
