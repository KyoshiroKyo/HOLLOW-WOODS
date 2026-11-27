# RELEASE-QA — Queue Continuation

**PASS kỹ thuật local.** Source 1a0a346303f5f0af87c756094f14831ba4f8ae87. Checkpoint trước nghiệm thu 4d329bd0ea895afbf94809b6da05403d8b302a8e.

| Hạng mục | Kết quả và phạm vi | Checkpoint |
| --- | --- | --- |
| ANIM-RESIDUAL | NOT REPRODUCED trong ca 1× bổ sung, có alpha bounds, gait, anchor và chuyển trạng thái vũ khí. BUG-059 giữ cổng artwork. | 5604efb |
| WORLD-02-R1 | PASS. Từ chối bốn yêu cầu QA ngoài bounds hoặc pending. Ancient Rune Puzzle qua kiểm collider. | dcec7b8 |
| QUEST-01 | PASS 3/3 tuyến mở đầu. Marker Sổ tay và nhãn vùng thống nhất sau Continue. Private QA kiểm riêng vị trí và mục tiêu truyện. | 1a0a346 |
| INPUT-02 | NOT REPRODUCED. Bốn ca synthetic keyup, modal và composition đạt. | 7a2e0e5 |
| PERF-02 | NOT REPRODUCED lỗi tăng texture/scene trên tuyến thử. p95 18,1 ms sau năm vòng. | 4d329bd |
| RELEASE-QA | Chromium production 25/25 từ ZIP giải nén, Private QA 4/4 trên build riêng, validator 23/23. | Checkpoint báo cáo này |

Production xác nhận startup, Prologue/Skip, chuyển động bốn hướng, bản đồ, Save/Continue, thưởng Edda và F4/F9 khóa. Private QA xác nhận bản đồ, F4/F9, diagnostics, dữ liệu QA riêng và chặn gửi tiến trình. Không gửi điểm thật. TypeScript và cả hai build đạt. B07-R1/MICRO-03 gọi implementation thật 18/18, B05 6/6, Schema 3, RT-002 28/28, SDK 31/31, harness chặn điểm Dev và scan SE-004 đạt.

[Production](../Evidence/HW-QUEUE-CONTINUATION/release_production.json) · [Private QA](../Evidence/HW-QUEUE-CONTINUATION/release_private_qa.json) · [Validator](../Evidence/HW-QUEUE-CONTINUATION/release_validator.json) · [Harness](../Evidence/HW-QUEUE-CONTINUATION/release_harness_status.json).

Candidate local tại release/p2game/queue-continuation/HOLLOW_WOODS_V1.6.1_P2GAME_RELEASE.zip. 292 tệp, 62.448.639 byte, SHA-256 1722c1eab090ffd5b6ea1c7df0496ac5523fb016ae7169a49335041c25d87aea. Từng tệp được đối chiếu SHA-256 với build sau giải nén. [Kiểm ZIP](../Evidence/HW-QUEUE-CONTINUATION/release_archive_check.json).

Hosted Portal, cloud SDK thật, EVKey/UniKey vật lý, máy 8 GB, tuyến benchmark dài và review nghe của Owner **NOT RUN**. Cổng duyệt audio, artwork và Canon tiếp tục riêng. ZIP V1.6.0 và các candidate trước được bảo toàn. Hồ sơ FIX15 vẫn gồm 15 tiêu chí cùng kết quả MAP-02. Candidate chỉ bàn giao nội bộ.
