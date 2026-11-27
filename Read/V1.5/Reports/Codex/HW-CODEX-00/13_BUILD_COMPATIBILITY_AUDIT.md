# 13 — Build & P2Game

Baseline `c9de0c21b0301003895cf2d106229dfef564a2b6`. Node v24.22.1, Vite 5.4.21, Phaser 4.2.1, TS 5.9.3. Vite `base: './'`, tách vendor và game data, loại archive khỏi dist. Version thuộc build 1.5.2; V1.6.0 là đích Roadmap. Giữ SDK v1.1, Save schema 3, ID và manifest.

| Bài kiểm tra độc lập | Kết quả |
|---|---|
| `npm run check` | PASS |
| `npm run verify:data` | 15/15 |
| `npm run build` | PASS, 288 files, 83.124.269 B theo validator |
| `node scripts/validate_p2game_build.mjs` | 23/23, không archive lỗi |
| `node scripts/verify_zero_404_assets.mjs` | 212/212 literal paths |
| `node scripts/test_v153_save_schema3.mjs` | 2/2 nhóm PASS, schema + local round trip và QA isolation |
| `node scripts/test_v152_08_p2game_sdk.mjs` | 31/31 assertions |
| Chromium Canvas / WebGL | 2/2 smoke: menu, New Game handler, di chuyển bằng phím. SDK abort có chủ đích. 0 local HTTP error hoặc pageerror |
| Real hosted iframe, CDN 206, real cloud save | NOT RUN |

`npm ci` đầu tiên yêu cầu cache ngoài writable roots nên báo ENOENT. Cùng lockfile cài thành công khi dùng cache riêng. Build cảnh báo hai font URL được resolve lúc runtime và startup script classic; validator tìm thấy 2 font và script trong dist. Còn sáu media file lịch sử không trong manifest. B08 mô phỏng sdk CDN fail, HTTP 206, cloud mock và iframe ở subpath trên máy AG; giữ ghi nhận đó độc lập với smoke local. [B08](../../V16/HW_V16_B08_P2GAME_COMPATIBILITY_REPORT.md) · [Kiểm tra máy](Evidence/automated-checks.json) · [Trace](Evidence/chromium-smoke.json)
