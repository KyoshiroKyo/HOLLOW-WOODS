# HW-CODEX-00-R1 · Bàn giao workspace Windows

**27/11/2026 · HOLLOW WOODS V1.6.0 The Unbroken Oath · Roadmap 3.1**

Workspace Codex sẵn sàng để phát triển trên baseline B08. Build và smoke test Windows qua trên GPU thực. Việc tích hợp BUG-059 còn chờ 96 frame Idle/Walk được nghiệm thu. Kết quả này bổ sung độc lập cho báo cáo Cloud PARTIAL tại `adaa81979a4264ae00dd814ba4d5a413c3a9faac`. [Hồ sơ bàn giao Cloud](https://github.com/KyoshiroKyo/HOLLOW-WOODS/tree/adaa81979a4264ae00dd814ba4d5a413c3a9faac/Read/V1.5/Reports/Codex/HW-CODEX-00) · [Technical Implementation Bible, nhật ký Roadmap 3.1](https://docs.google.com/document/d/1rUDUUEYk0qazwe61z41ZD3Ns-o4Z_6LyoANDtX0YJtI/edit?tab=t.brtiuc7aeov2)

## Môi trường và checkout

| Mục | Xác minh |
|---|---|
| OS và CWD | Windows 10 build 19045, `G:\HOLLOW_WOODS_CODEX` |
| Branch | `feat/v1.6-codex-development` |
| HEAD đầu phiên | `c9de0c21b0301003895cf2d106229dfef564a2b6` |
| GitHub trước bàn giao | SHA nhánh Codex khớp HEAD qua `git ls-remote --heads origin`. `main` tại `94efc0335506bcccf4b553eae3021cf27e84df42` |
| Git status đầu phiên | Sạch, theo dõi `origin/feat/v1.6-codex-development` |
| Worktree | 15 mục gồm worktree Codex riêng, cây gốc `G:\HOLLOW WOODS` và các worktree AG/QA. Hai mục QA cũ được Git đánh dấu prunable. Codex có index/HEAD riêng tại `G:/HOLLOW WOODS/.git/worktrees/HOLLOW_WOODS_CODEX` và dùng chung object store/refs tại `G:/HOLLOW WOODS/.git` |
| Toolchain | Node.js 26.7.0, npm 11.19.0, Phaser 4.2.1, Vite 5.4.21, TypeScript 5.9.3 |
| Kiểm trước commit | `npx --no-install tsc --noEmit` PASS, `npm run build` PASS, `npm run verify:data` đạt 15/15 |

`npm ci` gặp `ECONNRESET` ở registry. Để chạy local, Codex dùng bản sao dependency đã cài từ thư mục `node_modules` của dự án gốc vào thư mục ignored của workspace, rồi đối chiếu phiên bản toàn bộ package áp dụng cho platform với lockfile. Vite báo cảnh báo build cho `startup-status.js` và hai đường dẫn WOFF tĩnh. Chrome tải build local với 0 lỗi HTTP localhost và 0 page exception. [Telemetry runtime](04_LOCAL_RUNTIME_VERIFICATION.json)

## Kho asset bổ sung

Đã đối chiếu **6.141 đường dẫn asset local** với **1.049 bản ghi Cloud** từ B08, nhánh art và Cloud archive. Trong đó 1.716 đường dẫn trùng SHA-256 với 465 hash Cloud. 4.425 đường dẫn còn lại quy về **1.673 hash duy nhất bổ sung**. Inventory ghi một hàng cho mỗi hash mới và ghi đường dẫn alias để tìm bản sao liên quan. [Inventory](02_LOCAL_ASSET_INVENTORY.json)

| Nguồn | Số đường dẫn asset đủ điều kiện |
|---|---:|
| `G:\HOLLOW WOODS\Asset_Art` | 197 |
| `G:\HOLLOW WOODS\HOLLOW_WOODS_EXPORT` | 1.886 |
| Backup thư viện, map, bước và checkpoint | 4.058 |

Trong nhóm bổ sung có 215 hash hoạt ảnh nhân vật, 77 spritesheet/atlas, 19 portrait, 467 môi trường/tileset, 66 map, 52 UI, 3 menu, 1 VFX, 585 audio và 188 ứng viên khác. Phân loại theo đường dẫn và kiểu dữ liệu. Các thư viện Pixel Art và Sound Effects riêng ở root gốc đã được tổ chức trong export hoặc backup. 230 tệp nén được đếm theo tên/đuôi và giữ nguyên. Quyền sử dụng, các mục trong archive nén và trạng thái sẵn sàng tích hợp của asset bổ sung còn cần xác nhận theo task. [Inventory theo nguồn và phương pháp](02_LOCAL_ASSET_INVENTORY.json)

## Kết quả runtime

Chrome 158.0.8127.38 headless, Phaser WebGL 1, ANGLE Direct3D11 trên **NVIDIA GeForce GTX 1070 Ti** với driver **32.0.15.8266**. Canvas và viewport 1280×720, DPR 1. Đo `requestAnimationFrame` khi nhân vật đứng yên ở Fog Crossing sau khởi động New Game, 300 khoảng khung hình trong 5,004 giây. Kết quả **59,95 FPS**, trung bình **16,68 ms**, P95 **16,80 ms**, P99 **16,90 ms**. Bộ đếm Phaser tại thời điểm đọc là 55,58 FPS, được ghi riêng với chuỗi rAF. Phép đo này bao phủ một vị trí và một cấu hình đồ họa. [Số đo](04_LOCAL_RUNTIME_VERIFICATION.json)

| Hạng mục | Bằng chứng |
|---|---|
| Main Menu → New Game → HUD | Click nút Bước Vào Màn Sương. GameScene và UIScene hoạt động, HUD hiện sinh lực, thể lực, tinh thần, zone và đồng hồ. [Menu](Evidence/01_main_menu.png) · [Gameplay thật](Evidence/02_gameplay_day.png) |
| Movement và Idle/Walk/Run | Phím D và Shift ghi chuyển Walk → Run → Walk → Idle ở hướng Right, có tăng tọa độ X. Phím X đổi trạng thái kiếm và lặp lại. [Frame, texture và scale](04_LOCAL_RUNTIME_VERIFICATION.json) |
| Journal · Inventory · World Map | J, I và N mở/đóng thành công qua phím trình duyệt. [Journal](Evidence/03_journal.png) · [Inventory](Evidence/04_inventory.png) · [World Map](Evidence/05_world_map.png) |
| Day/Night | Tăng pha bằng TimeSystem trong bộ nhớ, nhận hai sự kiện DAY → DUSK → NIGHT, màu môi trường và HUD đổi. [Ngày](Evidence/02_gameplay_day.png) · [Đêm](Evidence/06_gameplay_night.png) |
| Classic Sanity 2.1 | Ở Tinh Thần 11, vignette tắt trong ngữ cảnh Fog Crossing an toàn. Fixture đổi ngữ cảnh sang `outer_woods` và ghi đủ 12 tam giác, ba tầng ở bốn góc, cùng HUD 11/100. [Ảnh fixture](Evidence/07_classic_sanity_fixture.png) |

Chrome dùng profile cô lập và dữ liệu New Game. Phím được phát bằng CDP. EVKey vật lý, Day/Night tự trôi hết một chu kỳ, tuyến đi tự nhiên cho Sanity, QA đầy đủ BUG-023 và P2Game hosted đều chưa chạy trong R1. SDK bên ngoài được chặn trong phiên standalone. [Chi tiết kiểm tra và giới hạn](04_LOCAL_RUNTIME_VERIFICATION.json)

## Checkpoint AG tại thời điểm lập kế hoạch

| Nhánh hoặc công việc | Checkpoint xác minh |
|---|---|
| B07 | GitHub `76a235f409ecb46935a775730c5adf958b5d75c1`, báo cáo gate còn chờ A06-R1/A07/B05 |
| B08 | GitHub `c9de0c21b0301003895cf2d106229dfef564a2b6`, cũng là baseline Codex. Hosted QA thuộc AG |
| C01 | GitHub `77e532f25b6f6723ec0624ce84e0977304f0ec86`, đã có checkpoint sửa collision |
| C02 | Worktree local ở cùng SHA C01. Danh sách GitHub chưa có nhánh C02 và chưa có checkpoint riêng được xác minh |
| A07 | Checkpoint khôi phục `36f43b6` trên lịch sử của nhánh AG tại GitHub `e4edb07`. A06-R1 có nhánh riêng tại `fc5bf1d`. Cây AG gốc ở `e01be4b`. Chưa có checkpoint GitHub xác nhận A07 hoàn tất |
| HW-GIT-CONSOLIDATE-01 | Tìm commit theo mã nhiệm vụ chưa có kết quả và `main` còn ở `94efc03`. Trạng thái hợp nhất vẫn do AG quản lý |

## CHAR-006 · The Headless Warden

V3.2 Original là thiết kế đã được Owner chọn làm chuẩn. Nhánh archive GitHub tại `339b8ab759f694c6d92b669dfd9c5dda12e37ed9` ghi archive binary V3.2 Original còn pending. R5 có 4 PNG thiết bị/VFX. R6/R7 mỗi lượt có 8 lớp Soulfire được lưu, với R7 còn chờ Owner review. Trên ổ G: có prototype LAB-03 và bộ tham chiếu gồm mount, rider, VFX, portrait, master sheet và atlas trong export. Chưa đối chiếu được bộ đó với binary V3.2 Original. Tệp lore handover V3.2 độc lập chưa tìm thấy trong các thư mục đã dò hoặc Google Drive được kết nối. Đã tiếp nhận qua báo cáo HOLD, nhật ký Roadmap 3.1 và archive status. [Báo cáo HOLD](../../V16/HW_V16_00R2_HEADLESS_WARDEN_HOLD_REPORT.md) · [Trạng thái archive](https://github.com/KyoshiroKyo/HOLLOW-WOODS/blob/339b8ab759f694c6d92b669dfd9c5dda12e37ed9/Asset_Art/The_Headless_Warden/ART_STATUS.json)

Gate B là phạm vi art đang theo dõi. D06/D07/E06 giữ **DEFERRED**, DEC-LOCK-14 giữ **RESERVED** và Gate C/D khóa. Codex tiếp nhận tuyến nhiệm vụ này cho tương lai sau khi Owner nghiệm thu asset và mở Game Integration Gate.

## Bước phát triển đề xuất

Ưu tiên **BUG-059 Artwork Fidelity Recovery**. Phép đo xác nhận mọi slot Idle/Walk hoạt động ở độ phân giải 64×64. Cần gói 96 frame thay thế đạt chất lượng Conversion Run, kèm provenance và pivot. Chốt đầu vào và nghiệm thu artwork trước khi thay atlas. Commit bàn giao chứa báo cáo và bằng chứng R1. [Artwork readiness](03_MELODIAS_ARTWORK_READINESS.md) · [Phạm vi và thứ tự triển khai Codex](05_CODEX_FIRST_DEVELOPMENT_TASK.md)
