# HOLLOW WOODS V1.5.3 — Batch 04A

Nhánh QA `qa/v1.5.3-batch03-r2` ở SHA `0ceffa58f3cb7ffce12b0ba6af9364eb08835eb2`. Main được xác minh ở `b5eaa61`. Bản nâng cấp 04A được thực hiện trong worktree `/workspace/work/v153-b04/checkout` trên nhánh `feat/v1.5.3-batch04`. Worktree gốc giữ bản thiết kế và frame rời. [Draft PR #1 của checkpoint Batch 03](https://github.com/KyoshiroKyo/HOLLOW-WOODS/pull/1).

- **B04-00A/B/C.** Đã lưu audit trước khi sửa mã. Chromium tái hiện Save Debug dùng khóa thường, lượt Dev chưa được đánh dấu khi mở F9, và race ở Leaderboard sau xác thực. [Baseline audit](V153_B04_DEV_MODE_BASELINE_AUDIT.md).
- **B04-00D.** Regression production local đạt. Bản public và QA dùng cùng đường bootstrap, được build vào thư mục chẩn đoán riêng. Hosted còn BLOCKED. [Startup](V153_P2GAME_BLACK_SCREEN_REPORT.md).
- **B04-01.** Sửa generator manifest để mỗi file có một mục. 245 mục khớp đúng file và size, 210/210 đường dẫn loader hợp lệ, 65 file audio có stream nhận diện được. Kiểm tra 176 PNG, 51 vùng atlas và 51 lớp của 17 map Tiled. Ba tham chiếu TSX editor vắng trong checkout. Runtime hiện dùng lớp nền baked và collider Arcade. [QA](V153_BATCH_04_FINAL_QA.md).
- **B04-02A → 02E.** Phân cách Save, setting và báo điểm trong build QA. Nâng F9, các điều khiển và inspector, sửa hotkey ép tắt và vòng đời. Bộ phận độc lập được thử ở runtime với SDK mock. [Báo cáo nâng cấp](V153_B04_DEV_MODE_UPGRADE_REPORT.md).

B04-10 bao gồm 26 nhóm hoạt ảnh bốn hướng. K1 đã chốt bốn hướng Armed Idle và registry trước khi chuyển tới phần còn thiếu của lộ trình. [Checkpoint](V153_BATCH_04_CHECKPOINT.md) · [Ma trận Black Knight](V153_CHARACTER_ANIMATION_MATRIX.md).

Báo cáo bàn giao R10 chốt các sửa tiếp theo ở BUG-024, BUG-031, BUG-032 và BUG-037, cùng trạng thái PARTIAL cuối 04A. [Báo cáo riêng 04A](V153_B04A_RESUME_REPORT.md).

## 04C-K1

Đã cân lại palette LEFT R2, tích hợp atlas Armed Idle 24 frame, giữ alias và loại vòng đăng ký frame sai nguồn gây 136 cảnh báo. Hai build Chromium kiểm tra bốn hướng, chuyển state, Save/Continue và 0 missing-frame. K2/K3 giữ các nhóm còn lại. [Báo cáo K1](V153_B04_K1_RUNTIME_REPORT.md) · [Ảnh trực tiếp trong game](Visuals/V153_B04C_K1/armed-idle-runtime-details.png).

## 04B1

Sửa commit zone tại mép cổng Tây, vùng an toàn Farm và terrain qua Workshop/các vùng mở rộng. Đồng bộ World Map với transitions runtime và phục hồi ba TSX từ archive editor. Chromium ghi 16 tuyến qua, 25 đích khóa theo tiến trình. Hosted còn BLOCKED. [Báo cáo 04B1](V153_B04B1_WORLD_CAMERA_REPORT.md).
