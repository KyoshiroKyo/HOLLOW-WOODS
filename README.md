# 🌲 HOLLOW WOODS V1.5 – THE FOG THAT REMEMBERS (SƯƠNG MÙ GHI NHỚ)

> **Tập 1: The First Toll (Tiếng Chuông Đầu Tiên)**  
> **Thể loại:** 2D Atmospheric Psychological Survival Horror  
> **Độ phân giải:** Native Canvas HD 1280×720 | World Camera Zoom 2.2× | 60 FPS Target  
> **Kho lưu trữ GitHub:** [https://github.com/KyoshiroKyo/HOLLOW-WOODS](https://github.com/KyoshiroKyo/HOLLOW-WOODS)

---

## 🛠️ Công Nghệ & Nền Tảng Kỹ Thuật

- **Game Engine:** Phaser 4.2.1 / 3.80+ (Arcade Physics Engine with Corner-Slide Assist)
- **Ngôn ngữ:** TypeScript Strict Mode (`0 errors`, Clean type-checking)
- **Bộ dựng (Bundler):** Vite 5.4+ (Fast HMR & Optimized Production Build)
- **Hệ thống An Toàn:** `SafeSpawnResolver` tự động gỡ kẹt collider, reset sạch cờ ẩn nấp khi nạp Save
- **Giao diện Cổ Điển:** Dark Woodland Parchment UI, Torn Page & Paper Note Modals tương tác giữa màn hình
- **Hệ thống Âm thanh:** Web Audio API đa tầng (Lọc âm sương mù, tiếng bước chân động, nhịp tim sinh tồn)
- **Giao diện & Chữ hiển thị:** Native 1280×720 HD Typography Helper (Linear Filtering, 2x Canvas Resolution)

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy Cho Đồng Đội

Để tải mã nguồn và tiếp tục phát triển hoặc trải nghiệm trò chơi, các thành viên thực hiện tuần tự 4 bước sau:

### Bước 1: Tải mã nguồn về máy
```bash
git clone https://github.com/KyoshiroKyo/HOLLOW-WOODS.git
```

### Bước 2: Di chuyển vào thư mục dự án
```bash
cd HOLLOW-WOODS
```

### Bước 3: Cài đặt các gói thư viện phụ thuộc
```bash
npm install
```

### Bước 4: Khởi chạy máy chủ phát triển
```bash
npm run dev
```
Trình duyệt sẽ tự động mở tại địa chỉ `http://localhost:3000/`.

---

## 🔍 Lệnh Kiểm Tra Lỗi & Đóng Gói Sản Phẩm

- **Kiểm tra cú pháp & kiểu dữ liệu TypeScript (Strict Mode):**
  ```bash
  npx tsc --noEmit
  ```
  *(Yêu cầu bắt buộc: Đạt 0 errors)*

- **Đóng gói phiên bản phát hành chính thức (Production Bundle):**
  ```bash
  npm run build
  ```
  *(Tạo gói tĩnh tối ưu hóa tại thư mục `dist/`)*

- **Kiểm tra chạy thử gói phát hành (Preview):**
  ```bash
  npm run preview
  ```

---

## 🎮 Bảng Phím Tắt Điều Khiển Trong Game

| Phím bấm | Chức năng chi tiết |
|:---:|---|
| **`W / A / S / D`** hoặc **Mũi tên** | Di chuyển nhân vật qua lại trong khu rừng |
| **`Shift`** | Chạy nhanh (tiêu hao Thể lực / Stamina) |
| **`F`** | Bật / Tắt Đèn Lồng (tiêu hao Dầu đèn, duy trì Bình tâm / Composure) |
| **`E`** | Tương tác nói chuyện NPC, Ẩn nấp thân cây rỗng/bụi rậm, Thu thập tài nguyên, Đọc biển báo/cổ thư, Rung chuông |
| **`Q`** | Ném Mồi Tiếng Động (Noise Lure) đánh lạc hướng quái vật The Listener |
| **`1`** | Sử dụng nhanh Thuốc Đắp Hồi Máu khẩn cấp |
| **`I` / `C`** | Mở / Đóng Bàn Chế Tạo Dã Ngoại (Crafting Modal) |
| **`J`** | Mở / Đóng Sổ Tay Nhiệm Vụ & Cổ Thư (Journal Modal: Nhiệm Vụ, Ký Ức Hiệp Sĩ, Bestiary, Bản Đồ) |
| **`M`** | Bật / Tắt toàn bộ âm thanh trò chơi (Mute / Unmute) |
| **`ESC`** | Tạm dừng trò chơi & mở Bảng Tùy Chọn (Pause Menu) |
| **`F8`** | **🛡️ Gỡ Kẹt Về Điểm An Toàn (Emergency Unstuck):** Thoát kẹt địa hình/cổng sắt và hồi phục về điểm an toàn |
| **`F9`** | **⚙️ Chế độ Debug Khung Tương Tác Quản Trị Viên:** Bật/Tắt hiển thị hộp va chạm và tầm tương tác |
| **`F4`** | Bật / Tắt Bảng Kỹ Thuật Debug Overlay (FPS, Tọa độ, Hitbox chân đế) |

---

## 📂 Cấu Trúc Thư Mục Chuẩn Hóa Dự Án

Chi tiết toàn bộ quy định phân cấp thư mục được mô tả tại [docs/FOLDER_STRUCTURE_RULES.md](file:///G:/HOLLOW%20WOODS/docs/FOLDER_STRUCTURE_RULES.md).

```
HOLLOW-WOODS/
├── src/                           ← Toàn bộ mã nguồn TypeScript của game (scenes, entities, systems, ui, world...)
├── public/assets/                 ← Tài nguyên runtime phục vụ trực tiếp cho game (audio, maps, characters, ui...)
├── docs/                          ← Hệ thống tài liệu kỹ thuật, hướng dẫn & nhật ký
│   ├── FOLDER_STRUCTURE_RULES.md  ← Quy chuẩn cây thư mục chi tiết cho nhóm và AI
│   ├── guides/                    ← Hướng dẫn chạy game tại trường, khôi phục chat, hướng dẫn người dùng
│   ├── reports/                   ← Báo cáo đánh giá & kiểm toán các phiên bản cũ
│   ├── chat_and_commands/         ← Bản trích xuất câu lệnh & lịch sử chat phát triển
│   └── v1.4/                      ← Toàn bộ báo cáo kỹ thuật & hồ sơ bản V1.4
├── Read/                          ← Báo cáo chuyên sâu và sổ chỉ mục kiến trúc
│   ├── V1.3/                      ← Hồ sơ thiết kế & kiểm toán chi tiết V1.3
│   └── V1.5/                      ← Hồ sơ đại tu toàn diện V1.5 (Reports/, README_INDEX.md)
├── release/                       ← Bản đóng gói phát hành (p2game/, school-dev/, archives/)
├── Backups/                       ← Kho lưu trữ dự phòng (chat_history/, maps/, assets_archive/, steps/)
├── Pixel_Art/                     ← Kho tài nguyên đồ họa pixel art gốc, mockups từ họa sĩ
├── Sound_Effects/                 ← Kho âm thanh nguồn và sample hiệu ứng gốc
├── scripts/                       ← Kịch bản kiểm thử tự động, build automation, kiểm toán QA
├── tests/                         ← Bộ kiểm thử tự động (Unit Tests & Integration Tests)
├── dist/                          ← Gói ứng dụng sau khi build (bị .gitignore)
├── package.json                   ← Cấu hình thư viện và script npm
├── tsconfig.json                  ← Cấu hình biên dịch TypeScript Strict Mode
├── vite.config.ts                 ← Cấu hình máy chủ phát triển và đóng gói Vite
└── README.md                      ← Tài liệu này
```

---

## 🏆 Trạng Thái Dự Án

- **Phiên bản hiện tại:** HOLLOW WOODS V1.5 (`feat/v1.5-visual-gameplay-overhaul`).
- **Sổ Chỉ Mục & Tiến Độ 32 Bước V1.5:**
  - [Read/V1.5/README_INDEX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/README_INDEX.md): Danh mục chi tiết 32 bước nâng cấp toàn diện và 14 báo cáo kỹ thuật.
  - [Read/V1.5/Reports/08_V15_Total_Overhaul_Final_Report.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/08_V15_Total_Overhaul_Final_Report.md): Báo cáo tổng kết đại tu toàn diện HOLLOW WOODS V1.5.
  - [Read/V1.5/Reports/14_Safe_Spawn_And_Unstuck_Resolver.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/14_Safe_Spawn_And_Unstuck_Resolver.md): Cơ chế an toàn vị trí nạp checkpoint và gỡ kẹt khẩn cấp `[F8]`.
- **Trạng thái kiểm toán:** 🎉 **100% BUILD PRODUCTION & KIỂM ĐỊNH TOÀN DIỆN THÀNH CÔNG (0 ERRORS)**.
- **Tác quyền & Quản trị:** Dự án thực thi bởi Chief Software Architect cho `KyoshiroKyo/HOLLOW-WOODS`.
