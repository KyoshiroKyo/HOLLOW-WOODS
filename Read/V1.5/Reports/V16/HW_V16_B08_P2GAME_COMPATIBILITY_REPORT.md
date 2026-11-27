# HW-V16-B08 — P2GAME LOADING & BUILD COMPATIBILITY REPORT

- **Project:** HOLLOW WOODS (`V1.6.0` track / Baseline Version `1.5.2` preserved)
- **Task ID:** `HW-V16-B08`
- **Status:** **`PASS` (Local Build & Simulated P2Game Hosting Verified — `HOSTED QA NOT RUN`)**
- **Worktree / Branch:** `G:\HOLLOW_WOODS_B08` on **`fix/v1.6-b08-p2game-compat`**
- **Base Commit:** `cd756a4f3cb48f6c177f83a15d1567b355642073` (`fix/v1.6-b06-audio-lifecycle`, verified descendant of `B01`..`B04` + `B06`)
- **Publish Policy:** **NOT PUBLISHED / NOT UPLOADED** (`HARD STOP` enforced)

---

## 1. Tóm Tắt Thay Đổi Đã Triển Khai

1. **Build Hygiene & Loại Archive/Backup Khỏi Pipeline Build (không xóa file gốc):**
   - **[vite.config.ts](file:///G:/HOLLOW_WOODS_B08/vite.config.ts):** Thêm `stripNonRuntimeFiles()` tại hook `closeBundle()` của plugin `p2game-cleaner` để tự động loại bỏ mọi tệp không phục vụ runtime (`.rar`, `.zip`, `.7z`, `.tar`, `.gz`, `.bak`, `.tmp`, `.psd`, `.aseprite`) khỏi `dist/` ngay sau khi Vite copy `public/`, đảm bảo không bao giờ phát tán tệp nén gốc như `mossbound_wayfarer.rar` vào bundle.
   - **[scripts/build_p2game_release.mjs](file:///G:/HOLLOW_WOODS_B08/scripts/build_p2game_release.mjs)** & **[scripts/build_standalone_release.mjs](file:///G:/HOLLOW_WOODS_B08/scripts/build_standalone_release.mjs):** Mở rộng bộ lọc loại trừ khi nén ZIP (`('.bak', '.tmp', '.rar', '.zip', '.7z', '.tar', '.gz', '.psd', '.aseprite', '.log')`).
   - **[scripts/validate_p2game_build.mjs](file:///G:/HOLLOW_WOODS_B08/scripts/validate_p2game_build.mjs):** Validator mới kiểm tra nhất quán phiên bản, metadata `p2game.json`, asset media tồn tại, đường dẫn tương đối trong `dist/index.html`, quy tắc sandbox P2Game, font `.woff`, và 0 tệp rác trong `dist/`.
2. **Version Consistency (`1.5.2` Baseline Preserved):**
   - Giữ nguyên `package.json`, `p2game.json`, `public/p2game.json` tại `1.5.2` (không nâng `1.6.0`, không sửa phiên bản lịch sử trong `registryData.ts` / `ContentPackValidator.ts`).
   - Đồng bộ telemetry runtime [LeaderboardService.ts:140](file:///G:/HOLLOW_WOODS_B08/src/services/LeaderboardService.ts#L140) (`'1.4.0'` -> `'1.5.2'`) và bản lưu mới [SaveManager.ts:508](file:///G:/HOLLOW_WOODS_B08/src/systems/SaveManager.ts#L508) (`'1.5.1'` -> `'1.5.2'`, giữ nguyên Schema `3` và fallback lịch sử `'1.4.0'`).
3. **P2Game Loading, Iframe Focus, SDK Timeout & Asset Safety:**
   - **[src/main.ts](file:///G:/HOLLOW_WOODS_B08/src/main.ts):** `waitForSdkScript()` chuyển sang bắt timeout CDN `10s` với cảnh báo và đi tiếp qua `initSdk()` (`allowStandalone: true`), không làm kẹt màn hình lỗi nếu CDN P2Game treo TCP; nới rộng chặn cuộn iframe phím `Arrow*` / `Space` cho mọi vùng ngoài ô nhập liệu (`!isTextInput`) bên trong iframe.
   - **[src/audio/AudioManager.ts:357-363](file:///G:/HOLLOW_WOODS_B08/src/audio/AudioManager.ts#L357-L363):** Thêm guard kiểm tra `Content-Type: text/html` trong `loadAudioBuffer()` chống trường hợp CDN fallback SPA trả HTML về request âm thanh.

---

## 2. Xác Minh Archive `mossbound_wayfarer.rar` & So Sánh Dung Lượng Bundle

- **Tệp archive gốc bảo toàn nguyên vẹn:** `G:\HOLLOW WOODS\public\assets\characters\mossbound_wayfarer.rar` (`185,541` bytes, `SHA-256 = A2630EF198C84F88ACA465B64654D3F497D481E51E5BFEA342436ADB706BA46A`) **không bị xóa**.
- Chi tiết so sánh đầy đủ tại [bundle_size_comparison.json](file:///G:/HOLLOW_WOODS_B08/Read/V1.5/Reports/Evidence/HW-V16-B08/bundle_size_comparison.json) và [build_manifest.json](file:///G:/HOLLOW_WOODS_B08/Read/V1.5/Reports/Evidence/HW-V16-B08/build_manifest.json):

| Biến Thể Build | Số File `dist/` | Tổng Dung Lượng | Archive Lọt Bundle | Chunks Chính |
| :--- | :---: | :---: | :---: | :--- |
| **`G:\HOLLOW WOODS\dist` (Trước B08)** | `289` | `83,382,279 B` (`79.52 MB`) | `1` (`mossbound_wayfarer.rar`, `185,541 B`) | Legacy baseline |
| **`G:\HOLLOW_WOODS_B08\dist` (Sau B08)** | `288` | `83,202,373 B` (`79.35 MB`) | **`0`** | `vendor-phaser` `1,685,164 B`, `index` `1,224,652 B`, `game-data` `189,555 B`, `startup-status.js` `1,561 B` |

- *(Lưu ý kiểm toán không chặn: `public/media/` còn 6 ảnh V1.5.0 lịch sử không còn được `p2game.json` tham chiếu gồm `avatar_512x512.png`, `cover_banner_1280x720.png`, `screen_01..04.png` — giữ nguyên để không làm gãy script kiểm thử V15-53 cũ).*

---

## 3. Ma Trận Kiểm Thử (`HW-V16-B08 §7`)

Bằng chứng chi tiết:
- [validator_report.json](file:///G:/HOLLOW_WOODS_B08/Read/V1.5/Reports/Evidence/HW-V16-B08/validator_report.json)
- [b08_runtime_verification.json](file:///G:/HOLLOW_WOODS_B08/Read/V1.5/Reports/Evidence/HW-V16-B08/b08_runtime_verification.json)

| Hạng Mục Kiểm Thử | Kết Quả | Số Liệu Quan Sát Thực Tế |
| :--- | :---: | :--- |
| **Typecheck / Verify Data / Clean Build** | **PASS** | `npm run check` (`0`), `npm run verify:data` (`15/15`), `npm run build` (`9.57s`, `dist/` `288` files) |
| **Local Validator (`validate_p2game_build.mjs`)** | **PASS** | **`23/23` checks PASS** (`1.5.2` parity, relative URLs, `p2game.json`, 0 forbidden files, fonts present) |
| **Zero-404 Asset Audit (`verify_zero_404_assets.mjs`)** | **PASS** | **`212/212`** tài nguyên hợp lệ, `0` lỗi 404 |
| **P2Game SDK v1.1 Check (`test_v152_08_p2game_sdk.mjs`)** | **PASS** | **`31/31` PASS** |
| **Iframe Subpath (`/games/hollow-woods/v1.5.2/`) & First Playable** | **PASS** | Render `MainMenuScene`, ẩn `#game-startup`, `first_playable_ms = 5232.6 ms`, `0` network 404 |
| **SDK Mock (`init`, `ready`, `onPause`, `onResume`, `onBeforeUnload`)** | **PASS** | `init=1`, `ready=1`, `onPause` -> `loop.running=false`, `onResume` -> `loop.running=true` |
| **Keyboard Input Inside `<iframe>` & Scroll Lock** | **PASS** | Click focus `<canvas>`, `KeyD` di chuyển `x: 120 -> 151.17` (`vx = 85`), `ArrowDown`/`Space` `scrollY = 0` |
| **Local Save + Cloud Mock + Reload + Continue** | **PASS** | Lưu `hollow_woods_v1_savegame` + 3 khóa mock cloud (`hw_save_slot_1`, `hw_save_meta`, `progress`), reload khôi phục đúng `x = 151.17` |
| **HTTP 206 Partial Content (`BUG-024` Local Simulation) & MIME** | **PASS (Local)** | **`3` request `HTTP 206`** với `Accept-Ranges: bytes` / `Content-Range`, MIME `.html/.js/.woff/.png/.json/.mp3/.wav` hợp lệ |
| **Offline/Blocked SDK CDN & Missing Media Fallback** | **PASS** | Chặn `p2game-sdk.v1.js` + `404 black_knight_fallback.png`: vẫn vào `MainMenuScene`, `dummy_transparent=true`, `0 pageerror` |
| **Loading Error Fallback UI** | **PASS** | Giả lập 404 module chính: `#game-startup` bật `data-state="error"` và hiển thị liên kết `"Tải lại"` |

---

## 4. Giới Hạn Môi Trường Hosting (`HOSTED QA NOT RUN`)

- **`HOSTED QA NOT RUN`**: Phiên bản chỉnh sửa chưa được upload, publish hay chạy trực tiếp trên máy chủ staging/production chính thức của P2Game.io (`games.p2game.io`).
- **`BUG-024`**: Chỉ kết luận tương thích HTTP `206 Partial Content` trên máy chủ giả lập local có bật `Range`/`Content-Range`; hành vi CDN thực tế của P2Game sau upload vẫn cần kiểm tra lại khi Owner/Publisher triển khai staging chính thức.
- Không publish, không upload `.zip`, không đổi phiên bản khỏi `1.5.2`, không xóa archive gốc và không chạm Headless Warden (`HARD STOP`).
