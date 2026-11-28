# HW-AG-BOSS-TEAM-RELEASE-01 — Báo Cáo Hoàn Thiện Boss & Xuất 3 Gói Bàn Giao (V1.6.1)

**Dự án:** HOLLOW WOODS V1.6.1 — THE UNBROKEN OATH (Kyoshiro Studio)  
**Nhánh AG:** `feat/v1.6-competition-preview`  
**Worktree:** `G:\HOLLOW_WOODS_C02`  
**Baseline Codex đã fast-forward:** `59e6ef21c11a38f0576ee3d4ec37bf378f969464`  
**Pinned Source Commit SHA (cho cả 3 gói ZIP):** `f662edca9e7543916a0b7c742a109df2d478cad6`  

---

## 1. Phase A & Phase B — Thay Đổi & Trạng Thái Boss

| Boss / Hạng mục | HP (Trước -> Sau) | Lãnh địa / Khu vực | Trạng thái & Chi tiết |
| :--- | :--- | :--- | :--- |
| **Sir Mordric (Dark Knight)** | `300 / 300` (giữ nguyên từ `81230e6`) | `deep_forest` `(2340, -190)` | **PASS**: 2 cận vệ `FallenKnightEntity` `100 HP`, Vaelen hỗ trợ 1 lần khi HP vượt ngưỡng `<= 150`. |
| **The Mire Warden (Kẻ Nuốt Tiếng Chuông)** | `100 -> 500` | `broken_bell_shrine` `(4500, 240)` | **PASS (QA Candidate)**: Cập nhật `bossHp/maxBossHp = 500` trong `src/entities/MireWardenBoss.ts`. Chuyển pha dựa trên 3 ấn phong ấn (`sealProgress`), thanh máu scale theo tỷ lệ `bossHp / maxBossHp`, không softlock. |
| **Shadow Behemoth** | `8 / 8` (giữ nguyên) | `silent_mire` `(780, 280)` | **PASS**: Đã gỡ `broken_bell_shrine` khỏi `SHADOW_BEHEMOTH_HABITATS` trong `src/systems/WildlifeSystem.ts` để hết chồng lấn đấu trường Mire Warden. `abyssal_chasm` vẫn ở trạng thái `pending_construction` (bị khóa). |
| **Fallen Knight Art** | — | — | **`BLOCKED_ART`**: Chưa có asset riêng đã duyệt khác Sir Vaelen (`#02` FIX15). Giữ nguyên sprite hiện hành, không tự ý recolor hay tạo asset mới. |
| **Registry & CSV Sync** | — | — | Đã đồng bộ `Read/V1.5/Reports/V16/ENEMY_REGISTRY.csv` khớp 500 HP Mire Warden, 300 HP Dark Knight, habitat Shadow Behemoth. |

---

## 2. Kết Quả Kiểm Chứng Kỹ Thuật

| Hạng mục | Kết quả | Phạm vi |
| :--- | :--- | :--- |
| `npm run check` (`tsc --noEmit`) | **PASS (0 lỗi)** | Toàn bộ source TypeScript |
| `npm run verify:data` | **PASS (15/15)** | Items, Recipes, Dialogues, Quests, ContentRegistry, Lore |
| `scripts/verify_boss_team_release.mjs` (Chrome CDP) | **PASS (12/12)** | Mire Warden 500 HP + no Behemoth overlap + Phase 2/Defeat, Behemoth in `silent_mire`, Dark Knight 300 HP + 2×100 guards + Vaelen once <=150 HP, Edda `"Edda"`, `node_resin_ow_1 (1520,595)`, `abyssal_chasm` locked, 0 JS errors |
| `scripts/validate_p2game_build.mjs 1.6.1` | **PASS (23/23)** | P2Game production manifest, relative paths, fonts, 0 forbidden files |
| Kiểm chứng giải nén 3 gói ZIP (Chrome CDP) | **PASS** | Xem log kiểm chứng giải nén: P2Game F9 lock (`?dev=1`), Private QA F9 + `hollow_woods_qa_v1_savegame` isolation, Source Code sạch |
| **Kế thừa FIX15, MAP-02, UI-LORE-01, RELEASE-QA** | **GIỮ NGUYÊN** | Save Schema 3, B07-R1, FIX-23 (Edda reward), Legacy Rune Charm Recovery vẫn HOLD |
| Hosted Portal thật, Cloud SDK thật, EVKey/UniKey vật lý, Benchmark 8 GB, Owner Listening | **NOT RUN** | Ngoài phạm vi local offline |

---

## 3. Ba Gói Đầu Ra (Pinned SHA: `f662edca9e7543916a0b7c742a109df2d478cad6`)

Thư mục xuất: `G:\HOLLOW_WOODS_C02\release\team-handover-v161-f662edc\`

| Gói | Đường dẫn tuyệt đối | Kích thước | SHA-256 | Cờ QA / Lưu ý |
| :--- | :--- | :--- | :--- | :--- |
| **1. P2Game Release** | `G:\HOLLOW_WOODS_C02\release\team-handover-v161-f662edc\HOLLOW_WOODS_V1.6.1_P2GAME_RELEASE.zip` | `62,288,128 bytes` (`59.40 MB`) | `93F70F04509404BCD709D84E909F20C25C402BFE9472963A44F444CDA8CCE2EE` | Production (`QA_BUILD=false`), F4/F9 khóa cả khi `?dev=1` |
| **2. Source Code** | `G:\HOLLOW_WOODS_C02\release\team-handover-v161-f662edc\HOLLOW_WOODS_V1.6.1_SOURCE_CODE.zip` | `63,972,713 bytes` (`61.01 MB`) | `400F69DE4737DE316A8ADB47214BA45E51B3CBB55F15008F67D5F0A27383D2DE` | Source đầy đủ + `README_CAIDAT_DEV.md` + `SOURCE_MANIFEST.txt` (không có `node_modules`/`.git`/`dist`) |
| **3. Private QA** | `G:\HOLLOW_WOODS_C02\release\team-handover-v161-f662edc\HOLLOW_WOODS_V1.6.1_PRIVATE_QA.zip` | `62,290,976 bytes` (`59.41 MB`) | `888BA6C63E0346AF3AA9C888CAA3D8146986E30D6051E0CD26DFDEBD24D00BCF` | `VITE_HOLLOW_WOODS_QA=1`, 1-click `CHƠI_GAME.bat` (`127.0.0.1`), Save cách ly `hollow_woods_qa_v1_savegame` |
