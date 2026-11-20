# V153-BATCH-04-R10 — Checkpoint bàn giao 04C-K1

**20/11/2026 · Dừng sau 04C-K1 · Armed Idle RUNTIME_TESTED · bộ hoạt ảnh PARTIAL · release BLOCKED**

HEAD nhánh `feat/v1.5.3-batch04` chứa checkpoint này. Worktree `/workspace/work/v153-b04/checkout`. Mốc đã được Owner nghiệm thu 04A PARTIAL là `c89cb8ec06b462d4b3d15387d138b9723cf64824`. Commit runtime K1 là `0b16b7d4e531607de8bc98053f07a995367b3666`. [Báo cáo K1](V153_B04_K1_RUNTIME_REPORT.md) · [Ảnh và log](Visuals/V153_B04C_K1).

| ID | Trạng thái và điểm nối |
|---|---|
| B04-10-K1 | CLOSED-VERIFIED local cho Armed Idle bốn hướng, 24 frame. Tái sử dụng atlas, mã và bằng chứng này. |
| BUG-032 phần frame / LEG-R8-03 phần registry | CLOSED-VERIFIED local. 136 → 0 cảnh báo `satyr_sheet`. Phần combat và state legacy tiếp tục ở K2/K3. |
| B04-10-K2/K3 | OPEN. 25 nhóm còn thiếu coverage artwork/runtime bốn hướng. [Ma trận](V153_CHARACTER_ANIMATION_MATRIX.md). |
| BUG-051–054 | OPEN ở 04C-G theo Owner. Ghi registry, phần gameplay vẫn chờ batch sở hữu. [Registry](V153_TESTER_BUG_REGISTRY.md). |
| Hosted và release | BLOCKED. Cần preview/log hợp lệ và nghiệm thu phát hành. |

### 04A còn mở và owner

| Phần còn mở từ 04A | Owner xác minh hoặc triển khai tiếp |
|---|---|
| Tiled editor thiếu `Tileset_Ground.tsx`, `Objects_Props.tsx`, `Objects_Buildings.tsx`. Các tuyến, collider và loại đối tượng chưa kiểm chứng hết. | 04B1 cho đường đi, terrain, trigger, camera và collider. 04B2 cho tileset dựng cảnh, prop và picker theo layout thật. |
| Hitbox/hurtbox của các đòn và state chưa xem đủ. Nguồn Tinh Thần ngoài hệ sinh tồn trong combat, vật phẩm, NPC và quy luật vùng. | 04C-K3 cho kỹ năng/state và chẩn đoán combat. 04C-G cho NPC/item/gameplay. 04B1 và 04D cho ranh vùng hoặc biến động do môi trường. |
| Mở lại ca audio khi chuyển track, kiểm tra gain/instance và tác động môi trường. | 04D. |
| Click-away các modal gameplay. | 04E1 theo BUG-037. |
| FPS thiết bị thật, độ phủ playthrough, kiểm chứng hosted P2Game và phương án rollback. | 04E2 cho hiệu năng cục bộ. 04F cho full playthrough, hosted và release gate. |

### Mốc lịch sử 04A

**PARTIAL · Owner đã chấp thuận để tiếp tục K1.**

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

**Command tiếp theo khi Owner duyệt riêng:** `V153-BATCH-04B1 EXECUTE REMAINING ONLY`. Dùng HEAD nhánh phát triển, báo cáo K1 và lệnh 03. Sau 04B1 giữ thứ tự 04B2 → 04C-K2 → 04C-K3 → 04C-G → 04D → 04E1 → 04E2 → 04F. [Đặc tả 04B1](../../../docs/chat_and_commands/V153_BATCH04_R10/03_V153_B04B1_PLAYTEST_MAP_CAMERA_TERRAIN.md) · [INDEX R10](../../../docs/chat_and_commands/V153_BATCH04_R10/00_INDEX_V153_BATCH04_R10.md).
