# HW-GIT-REPORTING-POLICY — Mandatory GitHub Reporting & Sync Policy

- **Project:** HOLLOW WOODS (*Roadmap 3.1 / V1.6.0 — The Unbroken Oath*)
- **Studio:** KYOSHIRO STUDIO
- **Effective Date:** `2026-11-26`
- **Owner Directive Reference:** `HW-GIT-01` & `HW-ART-REF-02-R1`
- **Scope:** Mandatory for ALL **AG** and **Codex** tasks in repository `HOLLOW-WOODS`

---

## 1. Core Mandate

Từ thời điểm ban hành chỉ thị `HW-ART-REF-02-R1`, **mọi nhiệm vụ** của AG và Codex trong HOLLOW WOODS — bao gồm cả:
- Implementation Tasks (code, gameplay, UI, asset integration, bug fixes)
- Read-Only Audits
- Asset Archive & Organization
- Research & Lore Alignment
- Design Specifications
- Tasks ending in `PARTIAL` or `BLOCKED`

**BẮT BUỘC** phải có báo cáo nghiệm thu (và các tệp metadata/evidence phù hợp) được **commit và push lên GitHub**, sau đó **xác minh Remote SHA trùng khớp với Local HEAD**.

Quy định này thay thế điều khoản *"Không commit/push"* ở các nhiệm vụ trước **đối với phần báo cáo và metadata được phép lưu trữ**. Nó **không** mở rộng quyền sửa source code hoặc runtime asset cho các nhiệm vụ Read-Only / Archive / Research / Audit.

---

## 2. Standard Execution Pipelines

### A. IMPLEMENTATION TASK
```text
IMPLEMENT → TEST → REPORT → COMMIT → PUSH → VERIFY REMOTE SHA
```
1. Thực thi đúng phạm vi được Owner phê duyệt.
2. Chạy build/typecheck/unit test/runtime QA theo yêu cầu. Không ghi `PASS` nếu chưa có bằng chứng chạy thực tế sau lần sửa cuối cùng.
3. Tạo báo cáo tại `Read/V1.5/Reports/...` (hoặc đường dẫn chỉ định) kèm bằng chứng test.
4. Kiểm tra `git status` & chỉ stage các file thuộc phạm vi (không commit source chưa nghiệm thu).
5. Commit theo chuẩn Conventional Commits có mã nhiệm vụ `[HW-...]`, push lên branch mục tiêu và xác minh `git rev-parse HEAD == git ls-remote origin <branch>`.

### B. READ-ONLY / DESIGN / ARCHIVE TASK
```text
AUDIT → VERIFY → REPORT → DOCS-ONLY COMMIT → PUSH → VERIFY REMOTE SHA
```
1. Không chỉnh sửa `src/`, `public/`, asset gốc hoặc cấu hình runtime ngoài phạm vi.
2. Thực hiện audit/archive/verify đầy đủ (SHA-256, file counts, QA checks).
3. Xuất báo cáo chính thức + metadata gọn nhẹ (`.md`, `.json`, `SHA256SUMS.txt` — tuyệt đối **không** đưa `.zip`, `.rar`, asset pack thương mại thô hay backup lớn lên GitHub trừ khi có lệnh riêng).
4. Tạo **DOCS-ONLY COMMIT** an toàn (sử dụng explicit pathspecs hoặc `git commit --only -- <docs/metadata>` nếu index đang có staged changes khác chưa được commit).
5. Push và xác minh Remote SHA.

### C. PARTIAL / BLOCKED TASK
```text
REPORT BLOCKER → SAFE DOCS-ONLY CHECKPOINT → PUSH → VERIFY REMOTE SHA
```
1. Dừng đúng điểm an toàn ngay khi phát hiện blocker, thiếu quyền, xung đột Canon hoặc fail gate.
2. Ghi rõ trạng thái `PARTIAL` hoặc `BLOCKED`, nguyên nhân gốc, phần đã xong, phần còn thiếu và đề xuất bước mở khóa trong báo cáo.
3. Không commit code dở dang hoặc source chưa đạt kiểm thử; chỉ commit báo cáo & metadata an toàn (**Safe Docs-Only Checkpoint**).
4. Push lên remote và xác minh Remote SHA.

---

## 3. Strict Verification & Git Safety Rules

- **Chống báo cáo sai trạng thái:** Tuyệt đối không đánh dấu `PASS` khi còn gate chưa chạy, test bị skip hoặc bằng chứng chưa đủ.
- **Chống commit nhầm thay đổi ngoài phạm vi:**
  - Tuyệt đối **không dùng `git add .`** hoặc `git add -A`.
  - Luôn kiểm tra `git status --short` và `git diff --cached --name-status` trước khi commit; nếu workspace đang chứa thay đổi staged từ đợt khác (ví dụ staged `Pixel_Art/` renames), bắt buộc cô lập commit bằng pathspec tường minh (`git commit --only -m "..." -- <approved-files>`) và kiểm tra lại `git show --stat HEAD` trước khi push.
  - Nếu không thể tách commit an toàn mà không ảnh hưởng index/worktree khác, dừng lại và báo `BLOCKED`.
- **Bảo vệ lịch sử Git & Asset:**
  - Không `git reset`, `git clean`, `git stash`, `git rebase` hoặc `git push --force`.
  - Không push gói `.zip`/`.rar`, raw commercial spritesheets, thư mục `Asset_Art/`, `HOLLOW_WOODS_EXPORT/`, hoặc `Backups/` lên repository.

---

## 4. Mandatory Return Fields for Checkpoint Tasks

Mọi phản hồi hoàn thành checkpoint phải nêu rõ các trường xác minh từ GitHub/local thực tế:
- `TASK ID`
- `STATUS`
- `REPORT PATH`
- `GITHUB REPORT URL`
- `COMMIT SHA`
- `REMOTE SHA`
- `COMMIT URL`
- `PUSH STATUS`
- `SOURCE CHANGES`
- `ASSET CHANGES`
- `NEXT TASK`
