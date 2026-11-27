# 12 — Performance

| Bằng chứng | Môi trường | FPS / P95 / chỉ số |
|---|---|---|
| B08 Canvas, Fog Crossing đứng yên sau di chuyển | HEADLESS BENCHMARK. 74 khoảng giữa RAF, headless Chromium | 54,15 FPS, P95 33,3 ms, frame chậm nhất 33,4 ms |
| B08 WebGL, cùng kịch bản | HEADLESS BENCHMARK. SwiftShader, software rendering, 74 khoảng giữa RAF | 5,44 FPS, P95 383,4 ms, frame chậm nhất 716,7 ms |
| LAB-01 lịch sử | REAL GPU BENCHMARK theo evidence, GTX 1070 Ti, lab scene khác | 60,05 FPS, 1% low 59,17 FPS, P95 16,8 ms, trung bình 8 draw calls, 22,56 MB JS heap |

Mẫu 74 khoảng không đủ công bố 1% low ổn định; trace field `worst1PctFps` thực tế ghi nghịch đảo thời lượng frame chậm nhất. Thời gian menu active của hai ca độc lập 3,77/6,32 s đã gồm SDK fallback và preload; chưa đo full first-interactive trên iframe hosted. Actor trace ghi 525+ texture keys Canvas và 515+ WebGL ở các thời điểm khác nhau của world streaming. Không suy ra VRAM từ số key. [B08 trace](Evidence/chromium-smoke.json) · [LAB-01 metrics](../../Evidence/HW-MAP-LAB-01/LAB_01_PERFORMANCE.json)

B08 build tải 83.124.269 B qua 288 tệp được validator kiểm, gồm vendor Phaser 1.685.152 B, app 1.224.652 B và game data 189.555 B. Con số là kích thước build, có asset nạp theo nhu cầu. Smoke kiểm gameplay thật trong Chromium, benchmark dùng software backend. [Build](Evidence/automated-checks.json)

Ưu tiên đo sau phê duyệt F01–F06: (1) rendered geometry/render-texture và culling/cache tại Bellhollow và zone late game, HIGH/MEDIUM/low; (2) JS main-thread, Arcade broadphase, NPC/boss updates và allocations trên tuyến dài; (3) heap/RAM plus node/listener/tween/timer qua scene restart, transition và Continue; (4) load bytes, audio decode, TTFB và first-interactive ở host. Cần log thiết bị GPU yếu thật. CPU/GPU utilization, full-route FPS, draw calls, heap, leaks, giảm cấu hình và khả năng tối ưu trên máy yếu **NOT RUN** ở baseline.
