# HƯỚNG DẪN SỬ DỤNG VÀ KHÔI PHỤC LỊCH SỬ CHAT HOLLOW WOODS (ANTIGRAVITY)

Tài liệu này hướng dẫn cách đọc trực tiếp hoặc khôi phục toàn bộ lịch sử làm việc, hội thoại và không gian tư duy (brain) của dự án **HOLLOW WOODS** từ Antigravity IDE sang máy tính khác (máy tính ở trường học hoặc laptop cá nhân).

---

## 1. CÁC TỆP ĐÃ ĐƯỢC ĐÓNG GÓI

Trong thư mục và gói lưu trữ `.rar`:

1. **`HOLLOW_WOODS_CHAT_HISTORY_READABLE.md`**:
   - Toàn bộ 156 yêu cầu phát triển cốt lõi và các phản hồi kỹ thuật của Antigravity trong phiên làm việc hiện tại (từ ngày 14/11/2026 đến 17/11/2026).
   - Có đầy đủ mục lục clickable, mốc thời gian, chi tiết sửa lỗi (Shift run, Audio hotfix, C4-134-01, SaveManager, v.v.).
   - Mở đọc được ngay trên mọi ứng dụng: VS Code, Notepad, Obsidian, trình duyệt web hoặc sao chép ngữ cảnh để tiếp tục hỏi Gemini / Claude / ChatGPT.

2. **`HOLLOW_WOODS_EARLIER_CHAT_HISTORY_READABLE.md`**:
   - Toàn bộ hội thoại giai đoạn đầu (từ ngày 10/11/2026 đến 14/11/2026: khởi tạo Satyr, thiết kế làng Bellhollow, hệ thống Veil, bản build v1.0 - v1.2).

3. **`Hollow_Woods_Antigravity_Chat_History.rar`**:
   - Gói nén lưu trữ toàn vẹn cấu trúc dữ liệu Antigravity:
     - Thư mục `conversations/`: Cơ sở dữ liệu SQLite (`.db`) của phiên chính và toàn bộ subagent (Tester, Audio, Visual, Transition).
     - Thư mục `brain/`: Toàn bộ nhật ký thực thi chi tiết (`transcript.jsonl`, `transcript_full.jsonl`), ảnh tải lên (`.user_uploaded/`), bằng chứng nghiệm thu (`browser_evidence/`).
     - Thư mục `chapter_titles/` & tệp `conversation_summaries.db`: Dữ liệu tiêu đề và tóm tắt hiển thị trên giao diện Antigravity IDE.

---

## 2. CÁCH ĐỌC NHANH TRÊN MÁY TÍNH TRƯỜNG HỌC (KHÔNG CẦN CÀI ANTIGRAVITY)

- Bạn chỉ cần mở tệp `HOLLOW_WOODS_CHAT_HISTORY_READABLE.md` bằng **VS Code**, **Notepad++**, hoặc kéo thả vào trình duyệt Chrome/Edge.
- Khi cần tiếp tục làm việc với AI khác (như Gemini trên web hoặc Claude):
  - Mở file `.md`, tìm đến mục lục phần việc bạn muốn làm tiếp (ví dụ: mục cuối cùng v1.3.4 / C4-134-01).
  - Sao chép (Copy) đoạn tóm tắt kỹ thuật hoặc yêu cầu gần nhất và dán vào cửa sổ chat mới.

---

## 3. CÁCH KHÔI PHỤC ĐẦY ĐỦ TRÊN MÁY MỚI CÓ CÀI ANTIGRAVITY IDE

Nếu máy tính ở trường học hoặc máy tính cá nhân mới đã cài **Antigravity IDE**:

### Bước 1: Xác định thư mục dữ liệu Antigravity trên máy mới
- Mở PowerShell hoặc File Explorer và truy cập đường dẫn:
  ```text
  %USERPROFILE%\.gemini\antigravity\
  ```
  *(Thường là `C:\Users\<Tên_Người_Dùng>\.gemini\antigravity\`)*

### Bước 2: Giải nén gói RAR
- Giải nén tệp `Hollow_Woods_Antigravity_Chat_History.rar`.
- Bạn sẽ thấy 3 thư mục chính: `brain`, `conversations`, `chapter_titles` và tệp `conversation_summaries.db`.

### Bước 3: Sao chép đè vào thư mục `.gemini\antigravity\`
- Sao chép các thư mục con trong `conversations/` vào `%USERPROFILE%\.gemini\antigravity\conversations\`
- Sao chép các thư mục con trong `brain/` vào `%USERPROFILE%\.gemini\antigravity\brain\`
- Sao chép các file trong `chapter_titles/` vào `%USERPROFILE%\.gemini\antigravity\chapter_titles\`
- (Nếu chưa có dữ liệu quan trọng khác) Sao chép đè file `conversation_summaries.db`.

### Bước 4: Khởi động lại Antigravity IDE
- Mở Antigravity IDE lên.
- Bạn sẽ thấy phiên hội thoại **HOLLOW WOODS** xuất hiện trong danh sách lịch sử chat với toàn bộ tin nhắn, ngữ cảnh và các subagent nguyên vẹn!

---

## 4. BẢNG MÃ HỘI THOẠI QUAN TRỌNG

| Conversation ID | Giai đoạn / Chức năng | Mô tả tóm tắt |
| :--- | :--- | :--- |
| **`00208b21-eeea-4e46-b57b-236e43a76b2f`** | **Phiên chính hiện tại (Active)** | Phát triển v1.3, Hotfix Audio, Shift Run, C4-134-01 |
| `54c6dfe7-f683-4631-8b65-2e4eb1c29a11` | Phiên nền tảng v1.0 - v1.2 | Khởi tạo cấu trúc dự án, thế giới ranh giới, entity cơ bản |
| `1d075525-f135-4f2d-80ca-794211829b97` | Subagent Browser | Nghiệm thu hình ảnh và tương tác game |
| `58fc4861-0dee-41be-b2d4-d68488000db9` | Subagent Audio | Kiểm tra âm thanh làng Bellhollow và hội thoại |
| `e31193b8-cea4-45ee-80b9-dfadc6d55fa7` | Subagent Transition | Kiểm tra chuyển vùng không giật và sương mù hồng |
