# V153-BATCH-03-R2 — QA tại checkpoint

**20/11/2026 · Nhánh `work` · HEAD `b5eaa61`**

| Phạm vi | Kết quả thực chạy |
|---|---|
| TypeScript và whitespace | `npx --no-install tsc --noEmit` và `git diff --check` đạt. |
| Kiểm tra tự động | SDK 31/31, UI Pack 25/25, HUD/Stamina 18/18, iframe/layout 28/28, toàn vẹn data 15/15, Save lịch sử 49/49, test schema 3 và SafeSpawn đạt. Loader có 210 URL và 0 thiếu. |
| Production local | Build Vite riêng. Chromium đạt root/subpath, SDK chậm, init treo rồi tải lại, lỗi mạng SDK, lỗi module 404, iframe 1600×900 DPR 1,25, Canvas khi tắt WebGL. |
| UI và gameplay | E mở Neris/Garth/Edda, Esc đóng, HUD khôi phục và mở lại được. E đi tới lựa chọn Neris, phần thưởng chỉ trao một lần. Menu, Vòng Sáng, F9 và Esc mở/đóng Tạm dừng hoạt động trong iframe production. |
| Camera và đường đi | Cùng fixture Bellhollow trước và sau, đo bounds và footprint bằng F9. Thao tác thật qua Fog Crossing → Bellhollow, qua Cổng Đông đã mở đến Crooked Path và quay về, đi từ Bellhollow xuống Outer Woods và qua hai chiều Bellhollow ↔ Sanctuary Farm. |
| Save runtime | Chromium Continue từ schema 3 phiên bản 1.5.0, Save lại thành 1.5.1 rồi Reload → Continue. Kiểm tra đồng nhất trang bị, vũ khí, kho đồ, task, khóa vùng, tài nguyên cạn, loại cây, trạng thái luống và đất đã chuẩn bị. Khi chạy với clock thường, cây sang `growing` sau 12 giây theo FarmingSystem. Lượt so sánh dữ liệu dùng thời điểm cố định để giữ cùng giai đoạn cây. |
| Audio | 12/12 kiểm tra logic audio lịch sử và AudioContext production unlock đạt. `OfflineAudioContext` 48 kHz đổi ramp giữa chừng. Mức chênh mẫu liền kề tại điểm đổi gain là 0, còn với lọc tín hiệu 6 kHz mức đỉnh lân cận gần như trùng phương án `cancelAndHoldAtTime`. Chưa tái hiện rè/rít bằng phép thử này. |
| Storefront | Hai manifest và tám ảnh khớp SHA-256 Batch 02. Tất cả tài nguyên này tải được từ build production, qua subpath HTTP 200. |
| Combat và artwork | Kiểm thử legacy 65/66 ở cả baseline và worktree R1 do thiếu PNG preview trong thư mục Backups. Chưa có atlas Black Knight mới để kiểm thử combat bốn hướng. |

Bốn MP3 ambience runtime đều giải mã được. Độ dài file village khoảng 2,57 giây, forest 13,70 giây, mire 17,28 giây và crossing 24,82 giây. Độ nhảy mẫu thô giữa cuối và đầu vòng village ở bản giải mã mono 48 kHz là khoảng 0,00143, gần mức P99 chênh mẫu liền kề 0,00122. Kết quả chỉ mô tả file trong Cloud. Cần thiết bị hoặc bản ghi của người chơi để xác định tiếng rít và cần đo dài hơn để đánh giá âm thanh khi chuyển vùng, nấp, giao chiến và tải lại. [AudioManager](../../../src/audio/AudioManager.ts).

**CLOUD-QA-01 → 03 PARTIAL · RELEASE BLOCKED.** Chưa hoàn tất luồng chơi tự nhiên từ New Game qua toàn bộ tiến độ nhiệm vụ, runtime bốn hướng, kiểm thử âm thanh trên thiết bị, đo 60 FPS và các cảnh sâu. Hosted P2Game cần preview cùng log hoặc bản build thực tế đã báo lỗi. [Evidence startup](V153_P2GAME_BLACK_SCREEN_REPORT.md) · [Ảnh gameplay F9](V153_WORLD_REPAIR_REPORT.md) · [Ảnh UI](V153_UI_UX_REPORT.md) · [Ma trận artwork](V153_CHARACTER_ANIMATION_MATRIX.md).
