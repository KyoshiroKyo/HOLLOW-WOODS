# 📂 DANH MỤC TÀI LIỆU — HOLLOW WOODS V3.0
## THƯ MỤC TÀI LIỆU THUẦN MARKDOWN (100% .MD ONLY)

> **HOLLOW WOODS V3.0 — THE FOG THAT REMEMBERS (SƯƠNG MÙ GHI NHỚ)**  
> **Phiên bản:** V3.0 (Chuẩn hóa Kiến Trúc Dự Án)  
> **Quy chuẩn quản trị:** Thư mục `Read/V3.0/` CHỈ CHỨA TÀI LIỆU MARKDOWN (`.md`). Tuyệt đối không chứa script code, file nháp, hay file ảnh.

---

## 1. QUY TẮC PHÂN VÙNG THƯ MỤC TOÀN DỰ ÁN (6 PHÂN VÙNG)

Dự án tuân thủ nghiêm ngặt 6 phân vùng kiến trúc chuẩn mực:

1. **`Read/V3.0/` (CHỈ CHỨA TÀI LIỆU `.md` 100%):**
   - Chứa các tài liệu thiết kế GDD, cốt truyện, kế hoạch phát triển và báo cáo nghiệm thu kỹ thuật.
   - Không chứa bất kỳ file code, script hay file tạm nào.

2. **`scripts/` (Công cụ Node.js & Kiểm toán QA):**
   - Chứa toàn bộ các script trích xuất sprite, xử lý asset và kiểm thử nghiệm thu (`*.mjs`), điển hình là `verify_v3_release.mjs`.
   - `scripts/temp/`: Chứa file nháp, file văn bản thô hoặc ảnh trung gian tạm thời.

3. **`src/` (Mã nguồn TypeScript Game Engine):**
   - Phân tách theo đúng mô hình hướng thành phần: `animation/`, `audio/`, `config/`, `data/`, `entities/`, `scenes/`, `state/`, `systems/`, `types/`, `ui/`, `utils/`, `world/`.

4. **`public/assets/` (Tài nguyên Runtime):**
   - Chứa sprite nhân vật (`characters/satyr/`), âm thanh (`audio/`), môi trường (`environment/`), NPC (`characters/npcs/`), và quái vật (`monsters/`).

5. **`Pixel_Art/` & `reference/` (Kho tài nguyên gốc & Tài liệu tham khảo):**
   - `Pixel_Art/`: Toàn bộ các gói asset nguyên bản đã mua/tải về.
   - `reference/`: Tài liệu tham khảo nguyên bản và thư mục sao lưu nén `reference/backups/`.

6. **Thư mục gốc (Root `G:\HOLLOW WOODS V3\`):**
   - Chỉ lưu các file cấu hình tiêu chuẩn: `index.html`, `package.json`, `tsconfig.json`, `vite.config.ts`, `.gitignore`, `README.md`.

---

## 2. DANH SÁCH TÀI LIỆU TRONG `Read/V3.0/`

| # | Đường dẫn | Mô tả nội dung | Trạng thái |
|---|---|---|:---:|
| 1 | `README_INDEX.md` | Sổ chỉ mục tài liệu và quy chuẩn phân vùng thư mục dự án V3.0. | ✅ Hoàn thành |
| 2 | `Asset_Registry/ASSET_LICENSES.md` | Sổ Đăng Ký Bản Quyền Asset — phân loại 3 cấp trạng thái cho toàn bộ tài nguyên. | ✅ Hoàn thành |
| 3 | `Reports/V3.0_CANON_REGISTER.md` | Sổ Đăng Ký Canon V3.0 — chốt các yếu tố cốt lõi: Satyr, The Veil, Bellhollow, 3 Quy Tắc Máu. | ✅ Hoàn thành |
| 4 | `Reports/V3.0_STORY_AND_QUEST_FLOW.md` | Luồng Cốt Truyện & Nhiệm Vụ Tập 1 (The First Toll) gồm 7 Hồi hoàn chỉnh (Act 0 - Act 6). | ✅ Hoàn thành |
| 5 | `Reports/V3.0_MAP_AND_SCENE_PLAN.md` | Kế Hoạch Bản Đồ & Scene Phaser — cấu trúc 5 phân khu và hệ thống camera. | ✅ Hoàn thành |
| 6 | `Reports/V3.0_ASSET_GAP_REPORT.md` | Báo Cáo Kiểm Toán Asset & Khoảng Trống — danh mục các sprite cần bóc tách. | ✅ Hoàn thành |
| 7 | `Reports/V3.0_DEVELOPMENT_TASK_PLAN.md` | Kế Hoạch Triển Khai Kỹ Thuật Chi Tiết — 57 file mã nguồn qua các giai đoạn. | ✅ Hoàn thành |
| 8 | `Reports/V3.0_PASS_G1_REPORT.md` | Báo Cáo Nghiệm Thu PASS G1 — Khởi tạo Phaser, Satyr 64×32, camera và 5 phân khu. | ✅ Hoàn thành |
| 9 | `Reports/V3.0_PASS_G2_REPORT.md` | Báo Cáo Nghiệm Thu PASS G2 — 4 chỉ số sinh tồn, NPC Edda & Neris, chế tạo và sổ tay. | ✅ Hoàn thành |
| 10 | `Reports/V3.0_PASS_G3_REPORT.md` | Báo Cáo Nghiệm Thu PASS G3 — Màn Sương The Veil, The Listener AI, chỗ trốn & 2 câu đố. | ✅ Hoàn thành |
| 11 | `Reports/V3.0_PASS_G4_REPORT.md` | Báo Cáo Nghiệm Thu PASS G4 — Mở đầu Act 0, Cao trào Act 5, Hồi kết Act 6 & Save/Pause. | ✅ Hoàn thành |
| 12 | `Reports/V3.0_PASS_G5_RELEASE_REPORT.md` | Báo Cáo Nghiệm Thu Phát Hành PASS G5 — Hệ thống âm thanh Web Audio và QA 10 tiêu chí. | ✅ Hoàn thành |
| 13 | `Reports/V3.0_10H_OVERHAUL_REPORT.md` | Báo Cáo Tổng Kết Đại Tu 10 Giờ (Cycle 1 & Cycle 2) — 100% Pixel Art thật, chuẩn Native Canvas HD 1280×720, Zoom 2.2×, typography HD tiếng Việt và kiểm toán 10/10 PASS phát hành. | ✅ Hoàn thành |

---

## 3. CẤU TRÚC THƯ MỤC `Read/V3.0/` (THUẦN MARKDOWN)

```
Read/V3.0/
├── README_INDEX.md                              ← Sổ chỉ mục tài liệu (file này)
├── Asset_Registry/
│   └── ASSET_LICENSES.md                        ← Sổ đăng ký bản quyền tài nguyên
└── Reports/
    ├── V3.0_CANON_REGISTER.md                   ← Sổ đăng ký canon chính thức
    ├── V3.0_STORY_AND_QUEST_FLOW.md             ← Luồng cốt truyện 7 Hồi
    ├── V3.0_MAP_AND_SCENE_PLAN.md               ← Kế hoạch bản đồ & scene
    ├── V3.0_ASSET_GAP_REPORT.md                 ← Báo cáo kiểm toán thiếu hụt asset
    ├── V3.0_DEVELOPMENT_TASK_PLAN.md            ← Kế hoạch triển khai kỹ thuật
    ├── V3.0_PASS_G1_REPORT.md                   ← Báo cáo nghiệm thu PASS G1
    ├── V3.0_PASS_G2_REPORT.md                   ← Báo cáo nghiệm thu PASS G2
    ├── V3.0_PASS_G3_REPORT.md                   ← Báo cáo nghiệm thu PASS G3
    ├── V3.0_PASS_G4_REPORT.md                   ← Báo cáo nghiệm thu PASS G4
    ├── V3.0_PASS_G5_RELEASE_REPORT.md           ← Báo cáo nghiệm thu phát hành PASS G5
    └── V3.0_10H_OVERHAUL_REPORT.md              ← Báo cáo tổng kết đại tu 10 giờ
```

---
*Cập nhật lần cuối: 2026-11-14 | Quản trị viên: Chief Software Architect — HOLLOW WOODS V3.0*
