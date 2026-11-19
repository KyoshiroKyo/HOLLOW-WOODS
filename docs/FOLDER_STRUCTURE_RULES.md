# QUY TẮC CẤU TRÚC THƯ MỤC CHUẨN HÓA DỰ ÁN HOLLOW WOODS
**Dự án:** `HOLLOW WOODS — The Fog That Remembers`  
**Phiên bản áp dụng:** `HOLLOW WOODS V1.5+`  
**Cập nhật lần cuối:** `19/11/2026 (Bước V15-35)`  
**Mục đích:** Quy chuẩn hóa toàn diện cấu trúc thư mục dự án, đảm bảo mọi thành viên trong nhóm phát triển và các hệ thống AI khi tiếp nhận dự án đều có thể định vị tài nguyên, mã nguồn, tài liệu và điểm kiểm thử một cách chính xác, nhanh chóng và ngăn chặn hoàn toàn việc xả rác file rời ở thư mục gốc.

---

## 1. NGUYÊN TẮC QUẢN LÝ THƯ MỤC CỐT LÕI

1. **Thư Mục Gốc Tuyệt Đối Tinh Gọn (Root Minimalism):**
   - Thư mục gốc `G:\HOLLOW WOODS\` chỉ được phép chứa các file cấu hình tiêu chuẩn của dự án (`package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `p2game.json`, `index.html`, `.gitignore`) và tài liệu chính `README.md`.
   - **Tuyệt đối không** đặt các file nén (`.zip`, `.rar`, `.7z`), file tài liệu Markdown rời rạc (`.md`, `.txt`) hoặc thư mục sao lưu tạm (`backup_*`) ở thư mục gốc.
2. **Nguyên Tắc Phân Loại Đúng Thư Mục Đích:**
   - Mã nguồn game $\rightarrow$ `src/`
   - Tài nguyên runtime phục vụ game chạy trực tiếp $\rightarrow$ `public/assets/`
   - Tài liệu kỹ thuật, hướng dẫn & nhật ký chat $\rightarrow$ `docs/` hoặc `Read/`
   - Bản đóng gói phát hành (zip/p2game/school) $\rightarrow$ `release/`
   - Bản sao lưu dữ liệu, lịch sử, map cũ & step backup $\rightarrow$ `Backups/`
   - Kho đồ họa gốc & tài nguyên thiết kế $\rightarrow$ `Pixel_Art/`
   - Kho âm thanh nguồn & hiệu ứng gốc $\rightarrow$ `Sound_Effects/`
   - Kịch bản tự động hóa, kiểm toán & đóng gói $\rightarrow$ `scripts/`
   - Bộ kiểm thử unit test & integration test $\rightarrow$ `tests/`

---

## 2. BẢN ĐỒ CHI TIẾT CÂY THƯ MỤC CHUẨN

```
HOLLOW WOODS/
├── .git/                                 ← Cấu hình quản lý phiên bản Git
├── Backups/                              ← Toàn bộ kho lưu trữ dự phòng và dữ liệu cũ
│   ├── chat_history/                     ← File .rar lưu trữ toàn bộ lịch sử trò chuyện AI & log phát triển
│   ├── maps/                             ← Bản đồ Tiled Map JSON các phiên bản trước khi đại tu (pre-redesign, v1.3)
│   ├── assets_archive/                   ← Tài nguyên thừa chưa dùng (_unused_assets_archive, staging)
│   ├── steps/                            ← Bản sao lưu an toàn mã nguồn theo từng bước (backup_v15_*, backup_assets_*)
│   ├── Archive_Raw_Assets/               ← Tài nguyên nguyên bản lưu trữ lâu dài
│   ├── Sprint_Checkpoints/               ← Điểm kiểm tra các đợt phát triển
│   └── Version_Snapshots/                ← Bản chụp phiên bản lớn
├── dist/                                 ← Sản phẩm sau khi build (npm run build, bị .gitignore)
├── docs/                                 ← Hệ sinh thái tài liệu kỹ thuật & vận hành
│   ├── FOLDER_STRUCTURE_RULES.md         ← Bản quy tắc cấu trúc thư mục này
│   ├── guides/                           ← Hướng dẫn chạy game tại trường, khôi phục chat, hướng dẫn người dùng
│   ├── reports/                          ← Các báo cáo đánh giá & kế hoạch khắc phục phiên bản cũ
│   ├── chat_and_commands/                ← Lịch sử lệnh, command packs và bản xuất chat Markdown
│   └── v1.4/                             ← Toàn bộ 30+ báo cáo kiểm toán & kỹ thuật của phiên bản V1.4
├── node_modules/                         ← Thư viện phụ thuộc Node.js (bị .gitignore)
├── Pixel_Art/                            ← Kho tài nguyên đồ họa pixel art gốc, mockups từ họa sĩ
├── public/                               ← Tài nguyên tĩnh runtime phục vụ trực tiếp cho Phaser 3 / Vite
│   └── assets/                           ← Cây tài nguyên thực tế mà game nạp lúc chạy
│       ├── audio/                        ← Âm thanh khí quyển (ambience), hội thoại (dialogue), hiệu ứng (sfx)
│       ├── characters/                   ← Spritesheet Wayfarer, NPCs, Sir Vaelen, Garth, Edda, v.v.
│       ├── environment/                  ← Tilesets, sprites cây cối, công trình, prop, textures
│       ├── maps/                         ← Toàn bộ 17 file Tiled Map JSON v1.10 của thế giới
│       ├── monsters/                     ← The Listener, The Echo, Mire Warden Boss, Dơi sương mù
│       └── ui/                           ← Icons, khung giấy da da dê, tooltip, bảng hiệu
├── Read/                                 ← Hệ thống báo cáo phân tích kiến trúc chuyên sâu
│   ├── V1.3/                             ← Hồ sơ thiết kế & kiểm toán chi tiết V1.3
│   └── V1.5/                             ← Hồ sơ đại tu toàn diện V1.5 (Reports/, README_INDEX.md)
├── reference/                            ← Tài liệu kỹ thuật tham khảo, spec P2Game, cheat sheets
├── release/                              ← Bản đóng gói phát hành hoàn chỉnh
│   ├── p2game/                           ← Gói zip tích hợp P2Game SDK (v1.3.4, v1.4.0, v1.5.0)
│   ├── school-dev/                       ← Bản đóng gói triển khai máy tính trường học / phòng lab
│   └── archives/                         ← Bản lưu trữ các gói phát hành cũ
├── scripts/                              ← Kịch bản kiểm thử tự động, build automation, kiểm toán hiệu năng
├── Sound_Effects/                        ← Kho âm thanh nguồn, master audio, sound effect packs
├── src/                                  ← Toàn bộ mã nguồn TypeScript của trò chơi
│   ├── audio/                            ← AudioManager, quản lý tiếng bước chân, lọc âm sương mù
│   ├── config/                           ← Hằng số Constants.ts, ContentRegistry, GameConfig
│   ├── data/                             ← Dữ liệu hội thoại dialogues.json, lore.json, quests.json
│   ├── entities/                         ← Thực thể SatyrPlayer, NPCEntity, TheListener, TheEcho, Boss
│   ├── scenes/                           ← PreloadScene, MainMenuScene, GameScene, UIScene
│   ├── services/                         ← CloudSaveService, LeaderboardService, P2GameSDK
│   ├── state/                            ← Quản lý trạng thái PlayerState (Singleton)
│   ├── systems/                          ← SafeSpawnResolver, VeilSystem, TimeSystem, WeatherSystem, v.v.
│   ├── types/                            ← Định nghĩa kiểu TypeScript (index.ts)
│   ├── ui/                               ← PaperNoteModal, TornPageModal, CraftingModal, JournalModal, PauseModal
│   └── world/                            ← WorldBuilder, WorldGatingSystem, ZoneConnectionRegistry
├── tests/                                ← Bộ kiểm thử tự động (Unit Tests & Integration Tests)
├── .gitignore                            ← Cấu hình loại trừ file rác, file build và kho lưu trữ nặng
├── index.html                            ← Điểm khởi đầu nạp ứng dụng web
├── p2game.json                           ← Cấu hình tích hợp nền tảng P2Game.io
├── package.json                          ← Quản lý dependencies & npm scripts
├── package-lock.json                     ← Khóa phiên bản dependencies
├── README.md                             ← Tài liệu giới thiệu tổng quan dự án cho cộng đồng & nhóm
├── tsconfig.json                         ← Cấu hình biên dịch TypeScript Strict Mode
└── vite.config.ts                        ← Cấu hình máy chủ phát triển và đóng gói Vite
```

---

## 3. QUY ĐỊNH DÀNH CHO LẬP TRÌNH VIÊN & CÁC TÁC NHÂN AI

1. **Quy định khi tạo bản sao lưu (Backup):**
   - Trước khi sửa đổi lớn các file cốt lõi, luôn tạo bản sao lưu trong thư mục:  
     `Backups/steps/backup_vXX_YY/` (ví dụ: `Backups/steps/backup_v15_34/`).
   - Tuyệt đối không tạo thư mục `backup_*` trực tiếp ở thư mục gốc.
2. **Quy định khi bổ sung tài liệu Markdown:**
   - Hướng dẫn vận hành/chơi/cài đặt $\rightarrow$ Đặt trong `docs/guides/`.
   - Báo cáo phân tích chuyên môn $\rightarrow$ Đặt trong `docs/reports/` hoặc `Read/V1.5/Reports/`.
   - Lịch sử câu lệnh, prompt $\rightarrow$ Đặt trong `docs/chat_and_commands/`.
3. **Quy định khi xuất bản Build:**
   - Các gói `.zip` phát hành bắt buộc phải được di chuyển vào `release/p2game/` hoặc `release/school-dev/`.
4. **Quy định kiểm toán chất lượng trước khi Commit:**
   - Chạy lệnh `npx tsc --noEmit` xác nhận **0 lỗi TypeScript**.
   - Chạy lệnh `npm run build` xác nhận gói `dist/` đóng gói thành công.
