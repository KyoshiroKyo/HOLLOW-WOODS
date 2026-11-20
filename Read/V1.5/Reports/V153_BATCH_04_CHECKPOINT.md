# V153-BATCH-04-R10 — Checkpoint bàn giao 04A

**20/11/2026 · PARTIAL · Dừng sau 04A**

Nhánh phát triển `feat/v1.5.3-batch04`, worktree `/workspace/work/v153-b04/checkout`. Điểm nối Git của QA cũ `0ceffa58f3cb7ffce12b0ba6af9364eb08835eb2`, nhánh `qa/v1.5.3-batch03-r2`; main đối chiếu `b5eaa612f7011b7d9fdc657d31310082d08f281b`. Commit sửa runtime `35a1cf5181eb69a2ecc6c800e3eb8bbdb45ab8de`, commit chốt runtime `82468756b40242e29eb9c094a0ae334c02bac24a`. Dùng HEAD nhánh phát triển có tệp này để resume, đồng thời xác minh SHA remote và tình trạng working tree. [Báo cáo bàn giao](V153_B04A_RESUME_REPORT.md) · [Draft PR QA cũ](https://github.com/KyoshiroKyo/HOLLOW-WOODS/pull/1).

| ID | Mốc để tránh triển khai lặp |
|---|---|
| B04-00, B04-00A/B/C | CLOSED-VERIFIED cho bàn giao 03-R2 và kiểm toán baseline 04A. [Audit](V153_B04_DEV_MODE_BASELINE_AUDIT.md) |
| B04-00D / BUG-024 | CLOSED-VERIFIED production local cho các ca đã ghi. HOSTED BLOCKED do SDK CONNECT 403 từ Cloud và chờ preview/log thực. [Startup](V153_P2GAME_BLACK_SCREEN_REPORT.md) |
| B04-01 | Runtime 245 manifest entry/210 loader references PASS. Kiểm tra Tiled editor còn 3 tham chiếu TSX vắng. |
| B04-02A / V152-DEV-01 | CLOSED-VERIFIED local. Save schema 3, QA namespace và guard mock SDK có bằng chứng. |
| B04-02B/D/E | Các ca đại diện 5 tab, hiệu ứng gameplay QA, picker, Copy Bug Info và tuyến Noclip OFF PASS. Tiếp tục theo registry với lớp/đối tượng/tuyến còn thiếu và nguồn Tinh Thần ngoài hệ sinh tồn. [Dev](V153_B04_DEV_MODE_UPGRADE_REPORT.md) |
| B04-02C / BUG-031 / nền BUG-037 | CLOSED-VERIFIED local. Một panel, F8/F9/F10, ép tắt, focus và năm restart. Click-away modal ở 04E1. |
| BUG-032 | CLOSED-VERIFIED bộ đếm theo vật lý. PARTIAL chung, missing frame `satyr_sheet` 16/17/20/21 ở 04C-K1. |
| Release | BLOCKED. Hosted, runtime Black Knight theo 04C và playtest theo 04F còn mở. |

Việc 04A còn mở cần preview/log thật là nghiệm thu hosted. Các phần chưa có bằng chứng đầy đủ về inspector và editor được ghi trong báo cáo 04A.

Nhánh phát triển dùng để review và kiểm thử 04A. Xem hướng dẫn tạo build QA tách biệt. [Tester guide](V153_BATCH_04_TESTER_GUIDE.md).

**Command kế tiếp khi Owner phê duyệt riêng:** `V153-BATCH-04C-K1 EXECUTE REMAINING ONLY`. Đọc report 04A, registry và file 02 trong command pack. Dùng lại các đầu ra có bằng chứng PASS. Lộ trình đầy đủ sau K1 là 04B1 → 04B2 → 04C-K2 → 04C-K3 → 04C-G → 04D → 04E1 → 04E2 → 04F. [Đặc tả K1](../../../docs/chat_and_commands/V153_BATCH04_R10/02_V153_B04C-K1_BLACK_KNIGHT_RUNTIME_FIRST.md) · [INDEX R10](../../../docs/chat_and_commands/V153_BATCH04_R10/00_INDEX_V153_BATCH04_R10.md).
