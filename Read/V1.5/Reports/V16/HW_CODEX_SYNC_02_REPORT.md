# HW-CODEX-SYNC-02 — Tích hợp changeset AG

- Nhánh đích / worktree · `feat/v1.6-codex-development` / `G:\HOLLOW_WOODS_CODEX`
- PRE_MERGE_SHA và nhánh dự phòng cục bộ `backup/pre-sync-02` · `68206f399c425745175b179a96e7d1bebc520cf8`
- AG SHA, đồng thời là tip được fetch của Competition Preview · `9c940b6d20bfe0b432e51e6ec4597a65cc316ead`
- Merge base và checkpoint V1.6.0 dự thi · `35317c0ef397edb8da3ce7471a18e5b87cada6a9`

## Phạm vi và kết quả merge

Merge `--no-ff --no-commit` ghép tự động `GameScene.ts` và `WorldBuilder.ts` với hai thay đổi AG độc lập. FIX-17 giữ dispatch `hide_player` và câu nhắc vào/ra chỗ ẩn nấp. FIX-21 giữ ba sprite `pillar_eye`, aura và vòng cộng hưởng. WORLD-01 giữ mã điểm neo, collider, bán kính và khóa F4/F9. ANIM-01, tài liệu và artwork 01A/01B, asset công khai và hồ sơ phát hành trùng baseline Codex trước merge.

Changeset AG gồm 41 tệp. Bảy tệp runtime là `src/scenes/GameScene.ts`, `src/world/WorldBuilder.ts`, `src/scenes/MainMenuScene.ts`, `src/scenes/UIScene.ts`, `src/systems/DialogueSystem.ts`, `src/ui/EquipmentModal.ts` và `src/ui/JournalModal.ts`. Năm script là V15-48, V15-54, `verify_b05_runtime_phaser`, `verify_fix23` và `verify_v16_b05_quest_hardening`. 29 tệp còn lại là báo cáo và bằng chứng AG. Không có hunk xung đột. Chuyển ngắt dòng Markdown từ khoảng trắng cuối dòng sang dấu gạch chéo ngược trong 18 báo cáo AG để kiểm tra whitespace đạt mà giữ định dạng hiển thị.

## Kiểm nghiệm

| Hạng mục | Kết quả | Môi trường |
| --- | --- | --- |
| Worktree / staged diff, TypeScript, build | PASS | Local |
| P2Game validator | 23/23 PASS | Local, kiểm tra dist. 6 media legacy không tham chiếu |
| B05 / V15-48 / V15-54 | 6/6, 28/28, 23/23 PASS | Local, kiểm tra nguồn và logic |
| FIX-23 | 5/5 PASS | Local Chromium, fixture hội thoại và save riêng. Đổi đường dẫn bằng chứng sang scratch và dùng WebGL mặc định |
| SE-004 | PASS | Quét bundle game, không có `navigator.clipboard` hoặc `clipboard-write` |
| RT-002 | PASS | Local, kiểm tra `autoFocus: false` và các điểm kích hoạt focus trong V15-48 |
| Browser gộp | 28/28 PASS | Local Chromium. WORLD-01, FIX-17, FIX-21, Walk/Run/nhả Shift, menu, Journal, World Map và khóa F4/F9 |
| Portal / thiết bị thật | NOT RUN | Hosted P2Game và EVKey/UniKey vật lý |

Vite vẫn báo các cảnh báo sẵn có về startup script và đường dẫn font tại thời điểm build. Validator tìm thấy cả hai font trong dist. Phiên browser dùng profile cách ly. Tại cây (1360, 620), mỏ nhựa trùng tọa độ được chọn trước nếu còn tài nguyên. Tình huống FIX-17 thu nhựa bằng [E], rồi kiểm tra vào và ra chỗ ẩn nấp. Quy tắc chọn mục tiêu hiện hành được giữ nguyên. Ca ANIM-01 trong merge là smoke test Walk/Run, phạm vi đầy đủ nằm ở báo cáo ANIM-01. Phát hành V1.6.0, ZIP dự thi, bản offline và worktree AG được bảo toàn.

## Các commit AG tích hợp

- `5f0bbe8` docs(report): add HW-V16 checkpoint, offline package guide, and Audio T00 roadmap
- `111d5eb` feat(ui): selective MainMenu & Fantasy World Map refinement [HW-AG-QUEUE-03-R3]
- `e2222cb` docs(env): add HW-AG-ENV-01 Abandoned Bell Workshop preview proposal [HW-AG-ENV-01]
- `44bd054` docs(perf): add HW-AG-PERF-01 baseline benchmark and optimization roadmap
- `7280224` fix(ui): semantic severity colors and max-width wrapping for notifications [HW-AG-FIX-06]
- `687d39f` fix(ui): polish dialogue choice wrapping, spacing, and context-aware key prompt [HW-AG-FIX-07]
- `b797202` fix(ui): dim depleted x0 quickbar slots and verify multi-resolution bounds [HW-AG-FIX-08]
- `1cbdd49` fix(ui): add long-title auto-fit guard and verify HUD responsive layout [HW-AG-FIX-09]
- `065e13c` fix(ui): improve World Map badge pills, legend contrast, and compass spacing [HW-AG-FIX-10]
- `2a5414c` fix(ui): remove conflicting keydown-M listener from JournalModal [HW-AG-FIX-11]
- `99e4fb4` fix(ui): align EquipmentModal empty hint with [I / C] crafting shortcut [HW-AG-FIX-12]
- `f04686c` test(quests): add Phaser runtime verification for B05 rewards and report Edda charm bug [HW-AG-FIX-13]
- `8b627d5` docs(test): add HW-AG-FIX-14 slow-network regression report and evidence [HW-AG-FIX-14]
- `a86e26f` docs(qa): add HW-AG-FIX-15 physical EVKey/UniKey QA checklist and guide [HW-AG-FIX-15]
- `c3dfeb8` test(v1.6): update outdated V1.5 assertions in v15_48 and v15_54 (HW-AG-FIX-16)
- `86b3d8d` fix(ui): standardize hiding interaction prompts and fix hiding_spot action dispatch (HW-AG-FIX-17)
- `7e7473c` docs(diagnostic): add HW-AG-FIX-18 boss HP diagnostic report for Codex handoff
- `0250f99` docs(audit): add HW-AG-FIX-19 Sir Vaelen & FallenKnight model verification report
- `2d04d76` docs(qa): add HW-AG-FIX-20 outer_woods & sub_bell_workshop rendering verification report
- `22ab78e` fix(world): replace Echo Pillar placeholder rectangles with official pillar_eye sprite (HW-AG-FIX-21)
- `56a9ef1` docs(diagnostic): add HW-AG-FIX-22 light circle visual diagnostic report
- `9c940b6` fix(dialogue): fix Edda Rune Charm reward order in edda_rune_guide (HW-AG-FIX-23)
