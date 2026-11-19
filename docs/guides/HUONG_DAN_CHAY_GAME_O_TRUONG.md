# 🌲 HƯỚNG DẪN TIẾP TỤC PHÁT TRIỂN HOLLOW WOODS Ở TRƯỜNG HỌC

Chào bạn! Đây là toàn bộ mã nguồn và tài nguyên hoàn chỉnh của dự án **HOLLOW WOODS V1.3.4**.
Gói nén này đã được tối ưu gọn nhẹ, loại bỏ các thư mục rác và file tạm cồng kềnh để bạn có thể mang tới trường phát triển tiếp trên máy tính phòng thực hành hoặc laptop một cách mượt mà nhất.

---

## 🚀 1. CÁCH KHỞI CHẠY DỰ ÁN TRÊN MÁY TÍNH Ở TRƯỜNG

### Bước 1: Giải nén thư mục
- Giải nén tệp zip này vào một thư mục bất kỳ trên máy tính (ví dụ: `D:\HOLLOW_WOODS` hoặc `C:\Projects\HOLLOW_WOODS`).

### Bước 2: Mở Terminal / PowerShell tại thư mục vừa giải nén
- Đảm bảo máy tính đã cài đặt **Node.js** (khuyến nghị phiên bản 18+ hoặc 20+). Kiểm tra bằng lệnh:
  ```bash
  node -v
  npm -v
  ```

### Bước 3: Cài đặt các thư viện phụ thuộc (Dependencies)
- Chạy lệnh sau để tải nhanh bộ thư viện `node_modules`:
  ```bash
  npm install
  ```

### Bước 4: Chạy máy chủ phát triển (Dev Server)
- Chạy lệnh:
  ```bash
  npm run dev
  ```
- Terminal sẽ hiển thị đường dẫn: `http://localhost:5173/`
- Giữ phím `Ctrl` và click vào đường dẫn trên, hoặc mở trình duyệt Chrome / Edge và dán `http://localhost:5173/` để chơi và phát triển game ngay lập tức! Có tính năng **Hot Module Replacement (HMR)**: khi bạn sửa code trong `src/`, game sẽ tự động cập nhật ngay trên trình duyệt mà không cần tải lại trang.

---

## 🛠️ 2. CÁC LỆNH HỮU ÍCH KHI LÀM VIỆC

| Lệnh | Công dụng |
| :--- | :--- |
| `npm run dev` | Khởi chạy môi trường phát triển trực tiếp (`localhost:5173`) |
| `npm run check` | Kiểm tra toàn bộ lỗi TypeScript (`tsc --noEmit`) |
| `npm run build` | Đóng gói bản build sản xuất ra thư mục `dist/` |
| `npm run preview` | Chạy thử nghiệm bản build sản xuất (`dist/`) tại `localhost:4173` |
| `node scripts/run_v1_3_regression_suite.mjs` | Chạy toàn bộ bộ 22 bài kiểm tra hồi quy tự động (571 tiêu chí ĐẠT) |

---

## 📂 3. CẤU TRÚC MÃ NGUỒN CHÍNH

- **`src/`**: Toàn bộ mã nguồn TypeScript của game:
  - `src/scenes/`: Các Scene chính (`PreloadScene`, `MainMenuScene`, `GameScene`, `UIScene`).
  - `src/entities/`: Thực thể người chơi `SatyrPlayer`, quái vật `ListenerMonster`.
  - `src/systems/`: Hệ thống gameplay (`AudioManager`, `DialogueSystem`, `CraftingSystem`, `SurvivalSystem`, `VeilSystem`, `PuzzleSystem`, `FarmingSystem`, `InventorySystem`, `SaveManager`).
  - `src/world/`: Khởi tạo bản đồ thế giới `WorldBuilder`.
  - `src/data/`: Dữ liệu JSON (`zones.json`, `dialogues.json`, `items.json`, `recipes.json`).
  - `src/config/`: Cấu hình hằng số `Constants.ts`.
- **`public/`**: Tài nguyên game trong runtime (Spritesheet, Backgrounds, Audio, Fonts, `p2game.json`).
- **`Pixel_Art/`**: Tài nguyên đồ họa gốc (để mở trong Aseprite / Photoshop nếu cần vẽ thêm).
- **`scripts/`**: Các kịch bản kiểm thử, đóng gói và xác thực tự động.
- **`Read/`**: Toàn bộ tài liệu thiết kế, sơ đồ kiến trúc và lịch sử cập nhật.
- **`.git/`**: Lịch sử Git đầy đủ để bạn tiếp tục `git commit`, `git status`, `git diff` như ở nhà.

Chúc bạn có một buổi học tập và phát triển game thật hiệu quả tại trường học! 🎮🌲
