# Batch 04A — Kết quả kiểm thử tại checkpoint R10

**Mã runtime `35a1cf5181eb69a2ecc6c800e3eb8bbdb45ab8de` và `82468756b40242e29eb9c094a0ae334c02bac24a` · Chromium trong Cloud · WebGL SwiftShader và Canvas**

| Tiêu chí | Lệnh hoặc fixture | Kết quả |
|---|---|---|
| Biên dịch | `npm run check` và `git diff --check` | Exit 0. |
| Build | `vite build --outDir <tạm>` cho public và `VITE_HOLLOW_WOODS_QA=1 vite build --outDir <tạm>` cho QA | Exit 0. Fonts và script public được phục vụ ở subpath dù Vite lưu ý chúng tải tĩnh. Build thử ngoài dist của repo. |
| Save schema 3 và namespace QA | `node scripts/test_v153_save_schema3.mjs` · Legacy Save 49 ca · Chromium Continue | PASS. 49/49 legacy, test schema và QA riêng đều exit 0. |
| Score và hợp đồng SDK | `node scripts/test_v153_dev_score_safety.mjs` · `test_v152_08_p2game_sdk.mjs` · mock Chromium | PASS. 31/31 static và mock public/QA. Không gửi điểm thật. |
| UI, HUD và iframe | `test_v152_06b_ui_pack.mjs`, `test_v152_06a_hud_stamina.mjs`, `test_v15_48_iframe_focus_and_hud_layout.mjs` | 25/25, 18/18, 28/28. Kiểm tra focus cũ đòi listener pointerdown toàn trang được thay bằng assertion canvas-only, kèm ca Chromium bấm ngoài thực tế. |
| Asset và data | `verify_data_integrity.mjs`, `verify_zero_404_assets.mjs`, `test_v15_34_safe_spawn_and_unstuck.mjs` | 15/15, 210 hợp lệ và 0 thiếu, SafeSpawn exit 0. 245 manifest entries khớp, 176 PNG đọc được, 65 audio kiểm tra codec, 51 vùng atlas hợp lệ, 51 tile layer kiểm tra độ dài. |
| BUG-024 | WAV HTTP 200 truyền chậm và request giữ hẳn, watchdog fixture 3,8 giây thay cho 45 giây | PRODUCTION LOCAL PASS. Bản cũ báo lỗi quá sớm. Bản sửa vào menu khi còn tiến triển và chỉ hiện Retry khi không còn tiến triển. [Startup](V153_P2GAME_BLACK_SCREEN_REPORT.md). |
| BUG-031/032/037 | Chromium ở Bellhollow gần (1100,167), kiểm tra panel, chia bộ đếm, phím và focus | LOCAL PASS cho phần 04A. 4 quan hệ, 228 static body, 8 dynamic body; 0 lỗi JS/HTTP trong fixture sạch. [Dev](V153_B04_DEV_MODE_UPGRADE_REPORT.md). |
| F10, snapshot SFX, nguồn Tinh Thần | Chromium fixture Edda, WAV thực, F10 xuất JSON | PASS. 133 mẫu, 493 texture khớp Texture Manager. Hai SFX cùng key, khớp gain/loop/count và giải phóng sau phát. Nguồn môi trường hiện trong Copy Bug Info. |
| Regression V152 chạy lúc audit | `audit_map_reachability_and_assets` và các suite V152-02/04/05/07/09 | Vaelen 25/25 và lighting đạt. Audio 18/22, combat 65/66, chunk 14/15 vì mục kiểm tra backup vắng ở Git. Map mock còn 11 collider trùng theo hình học và vị trí Garth/Bram/Finn cần tái hiện trong nhóm map. [Audit](V153_B04_DEV_MODE_BASELINE_AUDIT.md). |
| Regression lịch sử Tinh Thần | `verify_v15_05_sanity_mechanics.mjs` | 14/19, exit 1 với cùng năm assertion trên QA baseline và 04A. Công thức Tinh Thần không đổi, bổ sung đọc nguồn chẩn đoán sinh tồn. |
| Hosted P2Game | SDK URL thực qua Cloud | HOSTED BLOCKED. CONNECT 403. Preview và log bản tester cần cung cấp ngoài luồng này. |

Bằng chứng runtime dùng profile cách ly và kiểm tra bằng input thật hoặc fixture có ghi nhãn. KPI 60 FPS và natural playthrough thuộc 04E2/04F.
