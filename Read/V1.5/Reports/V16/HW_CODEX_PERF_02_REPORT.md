# PERF-02

**NOT REPRODUCED** cho lỗi tăng tài nguyên liên tục trên tuyến Fog Crossing ↔ Bellhollow. Đo V1.6.1 source 1a0a346, Chrome headless trên Windows 1280×720, ANGLE D3D11 GTX 1070 Ti. Mỗi mẫu 135 frame. So trước và sau năm vòng đi qua hai vùng và mở bản đồ trên cùng build, profile và thiết bị.

| Mẫu | FPS TB | P50 / P95 (ms) | Texture | Heap JS (MB) |
| --- | ---: | ---: | ---: | ---: |
| Sau làm nóng | 56,31 | 17,9 / 18,1 | 533 | 259,9 |
| Sau năm vòng | 56,37 | 17,9 / 18,1 | 533 | 263,7 |
| Sau GC qua CDP | 56,31 | 17,9 / 18,1 | 533 | 254,2 |

Một terrain texture, 1.241 đối tượng scene và cùng hai scene hoạt động trong các mẫu sau làm nóng. Chênh lệch heap ngắn hạn giảm sau GC. Dữ liệu không đủ để kết luận mọi tuyến dài hoặc mục tiêu 60 FPS. PERF-01 dùng SwiftShader nên giữ số đo riêng. Máy 8 GB, đồ họa phần mềm và lượt chạy dài toàn game **NOT RUN**. Không áp dụng thay đổi chất lượng đồ họa.

[Trace PERF-02](../Evidence/HW-QUEUE-CONTINUATION/perf_02.json).
