# HW-CODEX-QA-MICRO-01 — Independent verification

**Kết quả:** QA baseline PASS. Tách vị trí nút nhựa và cây rỗng chờ Owner duyệt SHA. Commit này bàn giao báo cáo và trace độc lập.

## Preflight và review AG

- Worktree Codex sạch trên `feat/v1.6-codex-development`. Local HEAD và origin cùng là `6b5975947d8c178fa6f6d1203b6732e5a12ec88a` (SYNC-03). AG baseline `7246f4b74b51f013395c123edc16f0134196f905` là ancestor.
- Tip AG quan sát lúc review là `74a8728e72d06e72eaacee3f33acd3cf257b8f38`, có thêm MICRO-03, MICRO-04 và CONTENT-01. Changeset MICRO-01 được khoanh theo `a29be7d1bd59cd58373f23d658997891f372535a` (patch) và `bf4b629888750f5dbaee1b7092ef852e673958d8` (R1 QA). Diff từ `7246f4b` đến R1 chỉ chạm một tệp runtime, `src/systems/InventorySystem.ts`. Một dòng chuyển `node_resin_ow_1` từ (1360,620) sang (1520,595), cách cây khoảng 162 px. Mã runtime của tệp này trên baseline Codex trùng `7246f4b`.
- Báo cáo MICRO-01-R1 và trace AG ghi 16/16, gồm tiếp cận nút runtime ở tọa độ mới bằng phím W, xác nhận đúng ID, thu +1 và không cấp trùng. Bài chạy độc lập bên dưới dùng bản Codex hiện tại. Phê duyệt SHA trong hồ sơ áp dụng cho SYNC-03. Đợt MICRO-01 chưa có SHA được Owner duyệt để tích hợp. [Báo cáo AG MICRO-01](https://github.com/KyoshiroKyo/HOLLOW-WOODS/blob/a29be7d1bd59cd58373f23d658997891f372535a/Read/V1.5/Reports/V16/HW_AG_MICRO_01_REPORT.md) · [Báo cáo AG MICRO-01-R1](https://github.com/KyoshiroKyo/HOLLOW-WOODS/blob/bf4b629888750f5dbaee1b7092ef852e673958d8/Read/V1.5/Reports/V16/HW_AG_MICRO_01_R1_REPORT.md)

## Chromium độc lập

Windows, Chromium 158 headless, production build, Vite preview trên localhost. Mỗi lượt dùng một phiên với profile mới và chặn SDK ngoài. Fixture đặt nhân vật gần điểm kiểm tra. Bấm Menu, Space, E, F4/F9 và giữ WASD qua DevTools. Các lần qua ranh giới dùng chuyển vùng của game và di chuyển thực từ điểm đầu fixture. Vaelen dùng tương tác E tại NPC, còn hồi quy hội thoại Edda/Neris chạy từ entry point của DialogueSystem. Save/Continue dùng bản lưu tạo trong chính phiên thử.

| Ca | Kết quả |
| --- | --- |
| Menu, New Game, Prologue, Space Skip | **PASS**. Loader ẩn ở Menu, Prologue độc lập, Space vào Fog Crossing. |
| FIX-23 và Save/Continue | **5/5 PASS**. Hủy Edda giữ 0 bùa, hoàn tất lần đầu 0 → 1, nói lại giữ 1. Continue từ save thử vẫn giữ đúng một bùa và hai cờ. Neris cấp thuốc một lần. |
| F4/F9 production | **PASS**. QA flag false, không có inspector, overlay hay dev panel. |
| WORLD-01 biển Fog Crossing | **2/2 PASS**. Tại biển, viền sáng và E chọn biển. Ngoài tầm, E chỉ thu nút gỗ đang được chỉ, không kích hoạt biển. |
| Đi bộ Fog Crossing → Bellhollow → Outer Woods → Bellhollow | **3/3 PASS**. Quay lại làng không còn giữ mục tiêu cây hoặc trạng thái ẩn nấp. |
| Cây rỗng với nhựa còn/cạn, ngoài tầm, thoát E/WASD | **5/5 PASS** cho các assertion baseline. Khi còn nhựa, prompt và outline cùng trỏ `node_resin_ow_1`, một E thu 0 → 1. Khi cạn, prompt/outline chuyển đúng `hide_tree_ow_north`, một E dispatch `hide_player` đúng một lần và giữ nhựa bằng 1. E hoặc D thoát. Ngoài tầm không kích hoạt cây. |
| Bụi rậm, bếp lửa và Vaelen | **3/3 PASS**. Prompt, viền sáng và hành động khớp từng mục tiêu. |

Lần đầu đạt 16/19. Trace cho thấy ngoài tầm biển vẫn có một nút gỗ hợp lệ và thời gian giữ phím chưa đưa chân qua đường phân vùng Y=560. Sửa fixture để kiểm tra đúng ID biển, tăng thời gian bước qua ranh giới và thêm ca ngoài tầm cây. Lượt cuối **20/20**, exit 0, 0 lỗi runtime ghi nhận. [Trace Chromium](../Evidence/HW-CODEX-QA-MICRO-01/chromium_results.json). Ảnh, log và script tái hiện lưu cục bộ ở `scratch/hw-codex-qa-micro-01/`.

## Kiểm thử bổ sung và quyết định bàn giao

| Phép kiểm | Kết quả |
| --- | --- |
| `npx --no-install tsc --noEmit` | PASS, exit 0. |
| `npm run build -- --outDir scratch/hw-codex-qa-micro-01/dist` | PASS, exit 0, 104 modules. Cảnh báo sẵn có cho startup script và hai font. |
| Validator P2Game local | 23/23 PASS, exit 0. Sáu media legacy chưa tham chiếu. |
| Harness B07-R1 | 17/17 PASS, exit 0. |
| Chromium Codex tại tọa độ AG mới, Portal thật, cloud SDK thật, EVKey/UniKey vật lý | NOT RUN. Persist trạng thái cạn của riêng nút tài nguyên qua reload chưa được thử. |
| Dọn dẹp | Đã kiểm tra Chrome, Vite và profile tạm do tác vụ tạo. |

Codex đã tái hiện việc nút nhựa và cây rỗng chia sẻ tọa độ. Người chơi phải thu nhựa trước khi có thể dùng cây ở điểm đó. Bằng chứng cho thấy prompt, outline và dispatch khớp mục tiêu và FIX-17 hoạt động sau khi nút cạn. Nếu Owner muốn cây dùng được ngay khi nhựa còn, đề xuất duyệt rõ SHA R1 `bf4b629888750f5dbaee1b7092ef852e673958d8` sau review của HW-Code, rồi kiểm thử tọa độ mới trên bản Codex tích hợp. Source và thứ tự tương tác giữ nguyên tại checkpoint QA này.

HARD STOP chờ Owner/HW-Code. BALANCE-01 và BOSS-01-R3 giữ QUEUED. Legacy Rune Charm Recovery giữ HOLD. Các cổng Audio, Lore, Artwork và CHAR-006 giữ riêng. Worktree AG, main, save thật và ZIP dự thi được giữ nguyên.
