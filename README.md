# 🌲 HOLLOW WOODS V3.0 – THE FOG THAT REMEMBERS (SƯƠNG MÙ GHI NHỚ)

> **Tập 1: The First Toll (Tiếng Chuông Đầu Tiên)**  
> **Thể loại:** 2D Atmospheric Psychological Survival Horror  
> **Độ phân giải:** Native Canvas HD 1280×720 | World Camera Zoom 2.2×  
> **Kho lưu trữ GitHub:** [https://github.com/KyoshiroKyo/HOLLOW-WOODS](https://github.com/KyoshiroKyo/HOLLOW-WOODS)

---

## 🛠️ Công Nghệ & Nền Tảng Kỹ Thuật

- **Game Engine:** Phaser 4.2.1 / 3.80+ (Arcade Physics Engine)
- **Ngôn ngữ:** TypeScript (Strict Type Checking `0 errors`)
- **Bộ dựng (Bundler):** Vite 5.4+ (Fast HMR & Optimized Production Build)
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

- **Kiểm toán tự động 10 tiêu chuẩn chất lượng V3.0:**
  ```bash
  node scripts/verify_v3_release.mjs
  ```
  *(Đạt kết quả 10/10 PASS toàn diện)*

---

## 🎮 Bảng Phím Tắt Điều Khiển Trong Game

| Phím bấm | Chức năng chi tiết |
|:---:|---|
| **`W / A / S / D`** hoặc **Mũi tên** | Di chuyển nhân vật qua lại trong khu rừng |
| **`Shift`** | Chạy nhanh (tiêu hao Thể lực / Stamina) |
| **`F`** | Bật / Tắt Đèn Lồng (tiêu hao Dầu đèn, duy trì Bình tâm / Composure) |
| **`E`** | Tương tác nói chuyện NPC, Ẩn nấp thân cây rỗng, Thu thập tài nguyên, Rung chuông |
| **`Q`** | Ném Mồi Tiếng Động (Noise Lure) đánh lạc hướng quái vật The Listener |
| **`1`** | Sử dụng nhanh Thuốc Đắp Hồi Máu khẩn cấp |
| **`I` / `C`** | Mở / Đóng Bàn Chế Tạo Dã Ngoại (Crafting Modal) |
| **`J`** | Mở / Đóng Sổ Tay Nhiệm Vụ & Cổ Thư (Journal Modal) |
| **`M`** | Bật / Tắt toàn bộ âm thanh trò chơi (Mute / Unmute) |
| **`ESC`** | Tạm dừng trò chơi & mở Bảng Tùy Chọn (Pause Menu) |
| **`F4`** | Bật / Tắt Bảng Kỹ Thuật Debug Overlay (Khung va chạm chân 14×8, Origin 64×64) |

---

## 📂 Cấu Trúc Thư Mục Chuẩn Hóa

```
HOLLOW-WOODS/
├── public/assets/                 ← Tài nguyên runtime trực tiếp phục vụ game
│   ├── characters/satyr/          ← Spritesheet Dark Rogue (64×64) & chân dung portrait
│   ├── characters/npcs/           ← Sprite nhân vật Garth, Edda, Neris
│   ├── environment/sprites/       ← Cây cổ thụ, nhà ở, tháp chuông, 3 cột đá, giếng làng
│   ├── environment/tilesets/      ← Tile địa hình cỏ, sỏi, bùn đầm lầy
│   ├── monsters/                  ← Sprite The Listener & The Echo
│   └── audio/                     ← Âm thanh khí quyển và hiệu ứng
├── Pixel_Art/                     ← Kho asset gốc nguyên bản
│   └── Dark Rogue/                ← Bảng sprite và reference của Dark Rogue
├── Read/V3.0/                     ← 100% Tài liệu Markdown thiết kế & kiểm toán
│   ├── README_INDEX.md            ← Sổ chỉ mục tra cứu tài liệu
│   ├── Asset_Registry/            ← Sổ đăng ký giấy phép bản quyền
│   └── Reports/                   ← Báo cáo GDD, luồng nhiệm vụ và nghiệm thu từng Pass
├── scripts/                       ← Công cụ Node.js hỗ trợ cắt ảnh & kiểm toán QA
│   ├── verify_v3_release.mjs      ← Script kiểm tra tự động 10 tiêu chuẩn phát hành
│   └── *.mjs                      ← Các script xử lý trích xuất asset
├── src/                           ← Toàn bộ mã nguồn TypeScript của game
│   ├── animation/                 ← Đăng ký hoạt ảnh SatyrAnimations.ts
│   ├── audio/                     ← Hệ thống AudioManager.ts
│   ├── config/                    ← GameConfig.ts (1280×720 HD), Constants.ts
│   ├── data/                      ← Cơ sở dữ liệu JSON (items, lore, dialogues, puzzles)
│   ├── entities/                  ← SatyrPlayer.ts, NPCEntity.ts, TheListener.ts
│   ├── scenes/                    ← BootScene, PreloadScene, MainMenuScene, GameScene, UIScene
│   ├── state/                     ← PlayerState.ts quản lý chỉ số và cốt truyện
│   ├── systems/                   ← SurvivalSystem, DialogueSystem, VeilSystem, EndingSystem...
│   ├── ui/                        ← HUDScene.ts, CraftingModal.ts, JournalModal.ts
│   ├── utils/                     ← HDTextHelper.ts, DebugOverlay.ts
│   └── world/                     ← WorldBuilder.ts (100% Sprite .png thật)
├── .gitignore                     ← Quy chuẩn loại trừ file rác và dependencies
├── index.html                     ← Canvas HTML gốc chuẩn HD
├── package.json                   ← Cấu hình thư viện và script
├── tsconfig.json                  ← Cấu hình biên dịch TypeScript
└── vite.config.ts                 ← Cấu hình đóng gói Vite
```

---

## 🏆 Trạng Thái Dự Án

- **Phiên bản:** HOLLOW WOODS V3.0 (Tập 1: The First Toll).
- **Trạng thái kiểm toán:** 🎉 **10/10 TIÊU CHÍ ĐẠT CHUẨN PHÁT HÀNH 100% (PASS)**.
- **Tác quyền & Quản trị:** Dự án thực thi bởi Chief Software Architect cho `KyoshiroKyo/HOLLOW-WOODS`.
