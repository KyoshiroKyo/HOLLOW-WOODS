# HW-CODEX-FIX15 — V1.6.1 Acceptance

**Bản build ứng viên nội bộ**, nhánh `feat/v1.6-codex-development`. Checkpoint dự thi được giữ tại `35317c0ef397edb8da3ce7471a18e5b87cada6a9`. Merge AG `e8996c48d4fc7dda3da9e5c483f55bd95f788515` chứa đúng `74a8728e72d06e72eaacee3f33acd3cf257b8f38` với nhánh Codex trước merge. SaveManager, Schema 3, FIX-23 và B07-R1 được giữ. Legacy Rune Charm Recovery vẫn HOLD.

## 15 tiêu chí Owner

| # | Hạng mục | Trạng thái | Kết quả có bằng chứng | Commit |
| --- | --- | --- | --- | --- |
| 01 | Scale và Walk/Run | **PARTIAL** | 24 tổ hợp ở mỗi mức 1×/2×/3×, 0 frame Walk/Run sai cờ sprint | `f23e513` |
| 02 | Fallen Knight giống Sir Vaelen | **BLOCKED** | NPC, ảo ảnh và enemy vẫn phân biệt bằng runtime ID | `81230e6` |
| 03 | Chuông mở đầu gây khó chịu | **PARTIAL** | Web Audio trace một source, stop 2,60 giây; mẫu B peak −21,55 dBFS, không clipping | `3560e4b` |
| 04 | Kiểm kê thực thể và diagnostics F9 | **PARTIAL** | Private QA một panel, 13 active, 23 catalog, texture lỗi được gắn cờ; F4/F9 production bị khóa | `6de0020` |
| 05 | Sói quá yếu | **PARTIAL** | Handler hitbox thật cho gậy/rìu/giáo 3/2/2 đòn; mỗi sói cấp một nanh | `7bc4003` |
| 06 | Listener, Veil và Sanity | **PARTIAL** | Fixture 100/50/25/0 cho số ảo ảnh 0/0/1/1, vào vùng an toàn không mất Tinh Thần | `7bc4003` |
| 07 | Quái chưa duyệt xuất hiện | **PARTIAL** | Fixture rừng đêm và vùng an toàn quan sát 0 thực thể từ ba loại; B05 6/6 | `7bc4003` |
| 08 | Kiểm kê quái, vị trí và Satyr | **PARTIAL** | 17 dòng phân khu và các ca quan sát có ghi kết quả | `6de0020` |
| 09 | Tên Edda | **PASS** | NPC Edda đúng tên, thưởng FIX-23 giữ một bùa qua Continue, ID ổn định | `e8996c4` |
| 10 | Map, mật độ và quái | **PARTIAL** | Resolver 6/6; tuyến mở đầu tự nhiên và portal Xưởng Chuông hai chiều chạy được | `2063fd6` |
| 11 | Dark Knight canonical encounter | **PARTIAL** | Chromium xác nhận 151→143, một ally, teardown, retry 300 HP và một huy hiệu | `81230e6` |
| 12 | Xưởng Chuông và Vực Sâu | **PARTIAL** | Xưởng Chuông vào/ra hai chiều. Vực Sâu chỉ quan sát trên private QA | `2063fd6` |
| 13 | 17 phân khu và hệ sinh thái | **PARTIAL** | Playable điểm đầu và Xưởng xác minh, placeholder tách rõ | `2063fd6` |
| 14 | Asset chưa sử dụng | **PARTIAL** | Xác nhận frame 43–44 rỗng, clip boss dừng ở frame 42 | `81230e6` |
| 15 | Asset Marden trong trailer | **BLOCKED** | Chưa thể xác nhận Marden là asset hoặc nhân vật nào | `e8996c4` |

[Register CSV trước/sau, test, SHA và lý do cho đủ 15 mục](HW_CODEX_FIX15_ACCEPTANCE.csv) · [Ma trận 17 phân khu](FIX15_ZONE_VALIDATION.csv).

## Nghiệm thu production và checkpoint

- AG merge đã qua Chromium **21/21**. Ca nhựa mới thu đúng +1, save cạn còn cạn sau Continue, cây rỗng hoạt động riêng và Edda giữ cờ thưởng đúng một lần.
- FIX15 production trước patch popup/metadata đạt **23/23**, gồm WASD bốn hướng và chuông Web Audio **2,60 giây, một source**. QA riêng xác nhận bộ lọc, giới hạn spawn, JSON và cảnh báo thiếu texture. Benchmark 8 GB, Portal thật, cloud SDK thật, EVKey/UniKey vật lý và Owner listening **NOT RUN**.
- Với popup 26 dòng, baseline Chromium đo cạnh trên `−66,5 px`. Bản vá giữ nền và chữ trong viewport trong lúc tween, vẫn giữ scale 1× cho thông báo thường. Giữ bản đồ hiện hành. Lore dùng văn bản Canon hiện có; A06 **24/24**, A07 **23/23**. Các đề xuất Lore trong hồ sơ bàn giao tiếp tục chờ duyệt.
- B07-R1/MICRO-03 **18/18**, B05 **6/6**, Schema 3, TypeScript/build và regression âm thanh **12/12** đạt. V152-02 cũ đạt 18/22. Bốn ca fail kiểm file backup lịch sử vắng trong worktree, phạm vi này không tạo các backup lịch sử để thay đổi kết quả.
- **Chromium 25/25 trên nội dung giải nén từ ZIP**. Xác nhận asset/HTTP local, popup thường và nhiều dòng ở viewport 1280×720 và 960×540 (canvas logic 1280×720), N mở/đóng bản đồ, Save/Continue, FIX-23 và khóa production F4/F9. Validator P2Game local **23/23**, SE-004 và RT-002 **28/28**. [Trace production](../Evidence/HW-CODEX-FIX15/production_zip_smoke.json).
- ZIP local tại `release/p2game/HOLLOW_WOODS_V1.6.1_P2GAME_RELEASE.zip`, manifest 1.6.1, 292 tệp, **62.448.534 bytes**, SHA-256 `b80781a1a91265766cd7c52073ae7fb78d9566445f966a930b2d11e431173a7e`. Đã so SHA-256 từng file giải nén với build. Gói là candidate bàn giao. Bản V1.6.0 dự thi và ZIP/offline hiện có được bảo toàn.
- Trace nhóm nằm dưới `scratch/hw-codex-fix15/`. Mẫu chuông A/B và số đo ở `scratch/hw-codex-audio-01a-r1/`. Phần artwork/Canon chưa được duyệt tiếp tục đi qua HW-Lore → HW-Design → HW-Code → HW-Dev. Bản dự thi đã qua Portal tiếp tục là mốc tham chiếu để Owner quyết định.
