# 🏛️ QUYẾT ĐỊNH CHUYỂN ĐỔI WORKSPACE & TÁI CẤU TRÚC TÀI LIỆU — GATE 0.2.1
## HOLLOW WOODS V1.1 — FINAL MIGRATION PLAN CORRECTION

> **Mã kế hoạch:** GATE 0.2.1 — FINAL MIGRATION DECISION & PLAN CORRECTION
> **Chức danh thực hiện:** Senior Technical Lead & Git Repository Administrator
> **Thư mục làm việc hiện tại:** `G:\HOLLOW WOODS V3`
> **Thư mục mục tiêu:** `G:\Hollow Woods`
> **Dự án chính thức:** **HOLLOW WOODS V1.1**
> **Nhân vật chính:** **SATYR** (Bảo tồn 100%)
> **Ngày thực hiện:** 2026-11-14
> **Quy tắc tuyệt đối:** 🔒 **READ-ONLY REVIEW** (Không đổi tên folder, không di chuyển tệp, không commit/push, không sửa mã nguồn/asset, không sửa `.gitignore`).

---

## 📌 QUYẾT ĐỊNH QUẢN TRỊ TÀI LIỆU TỐI CAO TỪ CHỦ DỰ ÁN (OWNER'S DIRECTIVE)

Chủ dự án đã phê duyệt định hướng tái cấu trúc phân vùng tài liệu như sau:
1. **Thư mục tài liệu hiện có:**
   $$\text{Thư mục hiện tại: } \texttt{Read/V3.0/} \quad \Longrightarrow \quad \text{Đổi tên thành: } \texttt{Read/V1/}$$
2. **Thư mục tài liệu hoạt động mới:**
   $$\text{Thư mục active chính thức: } \texttt{Read/V1.1/}$$
3. **Bãi bỏ hoàn toàn phương án:** `Read/Archive/V3.0_Historical/`.
   - Toàn bộ hồ sơ lịch sử kế thừa từ giai đoạn trước sẽ nằm trọn vẹn trong `Read/V1/`.
   - Toàn bộ tài liệu thiết kế, quy chuẩn và lộ trình kỹ thuật của dự án mới sẽ nằm trong `Read/V1.1/`.

---

## 1. TASK 1 — CẤU TRÚC PHÂN VÙNG TÀI LIỆU CHUẨN XÁC (CORRECTED STRUCTURE)

Cấu trúc phân vùng tài liệu chính thức được thiết lập khi bước vào giai đoạn di dời:

```
Read/
├── V1/                                          ← HỒ SƠ LỊCH SỬ KẾ THỪA (Inherited Historical Records)
│   ├── README_INDEX.md                          (Sổ chỉ mục tài liệu lịch sử V1 kế thừa từ V3.0)
│   ├── Asset_Registry/
│   │   └── ASSET_LICENSES.md                    (Sổ đăng ký bản quyền tài nguyên giai đoạn đầu)
│   └── Reports/
│       ├── V3.0_CANON_REGISTER.md               (Nguyên bản Canon V3.0 ban đầu)
│       ├── V3.0_STORY_AND_QUEST_FLOW.md         (Nguyên bản luồng cốt truyện 7 Hồi)
│       ├── V3.0_MAP_AND_SCENE_PLAN.md           (Nguyên bản kế hoạch bản đồ 5 phân khu)
│       ├── V3.0_ASSET_GAP_REPORT.md             (Báo cáo thiếu hụt tài nguyên ban đầu)
│       ├── V3.0_DEVELOPMENT_TASK_PLAN.md        (Kế hoạch 57 file mã nguồn ban đầu)
│       ├── V3.0_PASS_G1_REPORT.md .. G5         (5 báo cáo nghiệm thu kỹ thuật Cycle 1)
│       ├── V3.0_10H_OVERHAUL_REPORT.md          (Báo cáo tổng kết đại tu 10 giờ)
│       ├── V3.0_GIT_PUSH_SUCCESS.md             (Báo cáo đồng bộ GitHub ngày 14/11)
│       ├── AUDIT_2026-11-14/                    (10 báo cáo kiểm toán độc lập 00-09 & ảnh)
│       └── REMEDIATION/                         (Hồ sơ thẩm tra Gate 0, 0.1, 0.2, 0.2.1)
│
└── V1.1/                                        ← TÀI LIỆU HOẠT ĐỘNG CHÍNH THỨC (Active Development)
    ├── README_INDEX.md                          (Sổ chỉ mục tài liệu chính của HOLLOW WOODS V1.1)
    ├── Design/                                  (Tài liệu GDD, Story, World, Game Mechanics V1.1)
    │   ├── CANON_REGISTER.md                    (Quy chuẩn Canon V1.1: Satyr, The Veil, Bellhollow)
    │   ├── STORY_AND_QUEST_FLOW.md              (Cốt truyện & Nhiệm vụ V1.1)
    │   └── MAP_AND_SCENE_PLAN.md                (Bản đồ thế giới & Thông số Camera HD 1280×720)
    ├── Asset_Registry/
    │   └── ASSET_LICENSES.md                    (Sổ theo dõi bản quyền tài nguyên đang vận hành)
    ├── Remediation_Gates/                       (Lộ trình khắc phục kỹ thuật phân tầng Gates 1–4)
    │   ├── GATE_1_ENGINE_AND_MOVEMENT.md        (Kế hoạch Gate 1)
    │   ├── GATE_2_WORLD_AND_TILES.md            (Kế hoạch Gate 2)
    │   ├── GATE_3_UI_SCENE_MIGRATION.md         (Kế hoạch Gate 3)
    │   └── GATE_4_POLISH_AND_RELEASE.md         (Kế hoạch Gate 4)
    └── Reports/                                 (Các báo cáo nghiệm thu thực tế của phiên bản V1.1)
```

### Các Nguyên Tắc Quản Trị Tài Liệu Bắt Buộc:
- **Bảo toàn nguyên vẹn nội dung lịch sử:** Giữ nguyên 100% nội dung chữ và tên tệp tin gốc trong `Read/V1/` (ví dụ `V3.0_PASS_G1_REPORT.md`).
- **Không Mass-Replace:** Không tự ý sửa đổi từ `V3.0` thành `V1` trong các văn bản quá khứ để tránh bóp méo dữ liệu kiểm toán.
- **Minh bạch nguồn gốc:** Tệp `Read/V1.1/README_INDEX.md` sẽ nêu rõ: `Read/V1/` là kho lưu trữ lịch sử kế thừa từ phiên bản V3.0 ban đầu; `Read/V1.1/` là định danh phát triển chính thức hiện hành của trò chơi.

---

## 2. TASK 2 — KIỂM KÊ TOÀN DIỆN HIỆN TRẠNG GIT MỚI NHẤT (LATEST GIT INVENTORY)

Dựa trên kết quả chạy lệnh trực tiếp tại commit HEAD `5f09c73`:

### 2.1. Danh mục 4 Tệp tin Đã theo dõi có thay đổi (Tracked Modifications)
```
M Read/V3.0/README_INDEX.md                     (+9, -1 lines)
M Read/V3.0/Reports/V3.0_10H_OVERHAUL_REPORT.md (+1 line, newline)
M Read/V3.0/Reports/V3.0_GIT_PUSH_SUCCESS.md    (+1 line, newline)
M vite.config.ts                                (+1, -1 line, remove UTF-8 BOM)
```
- **Xác nhận:** Toàn bộ 4 tệp tin này đã sẵn sàng để được commit bảo tồn trong checkpoint trước khi đổi tên workspace.

### 2.2. Danh mục Đầy Đủ Các Mục Chưa Theo Dõi (Untracked Files — 20 mục)
Sau khi hoàn tất Gate 0.2 và văn bản Gate 0.2.1 hiện hành:
1. `FULL_DIAGNOSTIC_REPORT.md` (65,545 B — Báo cáo chẩn đoán hệ thống 7 phần)
2. `HOLLOW_WOODS_V3_FORENSIC_AUDIT.zip` (114,352 B — Gói nén backup cục bộ)
3. `scripts/generate_full_diagnostic.mjs` (22,416 B — Script kiểm tra chẩn đoán)
4. `Read/V3.0/Reports/AUDIT_2026-11-14/00_AUDIT_STATUS.md` (6,843 B)
5. `Read/V3.0/Reports/AUDIT_2026-11-14/01_PASS_T01_T10_AUDIT.md` (24,934 B)
6. `Read/V3.0/Reports/AUDIT_2026-11-14/02_PASS_T11_T20_AUDIT.md` (24,788 B)
7. `Read/V3.0/Reports/AUDIT_2026-11-14/03_PLAYER_NPC_DIALOGUE_AUDIT.md` (18,847 B)
8. `Read/V3.0/Reports/AUDIT_2026-11-14/04_WORLD_MONSTER_GAMEPLAY_AUDIT.md` (21,079 B)
9. `Read/V3.0/Reports/AUDIT_2026-11-14/05_PERFORMANCE_UI_AUDIO_SAVE_AUDIT.md` (20,863 B)
10. `Read/V3.0/Reports/AUDIT_2026-11-14/06_EXECUTIVE_SUMMARY.md` (9,882 B)
11. `Read/V3.0/Reports/AUDIT_2026-11-14/07_MASTER_BUG_REGISTER.md` (14,643 B)
12. `Read/V3.0/Reports/AUDIT_2026-11-14/08_REMEDIATION_ROADMAP.md` (9,486 B)
13. `Read/V3.0/Reports/AUDIT_2026-11-14/09_AI_HANDOFF_SUMMARY.md` (5,365 B)
14. `Read/V3.0/Reports/AUDIT_2026-11-14/evidence_dialogue_viewport.png` (2,193 B)
15. `Read/V3.0/Reports/AUDIT_2026-11-14/evidence_npcs_composite.png` (6,718 B)
16. `Read/V3.0/Reports/AUDIT_2026-11-14/evidence_satyr_frames.png` (23,385 B)
17. `Read/V3.0/Reports/REMEDIATION/GATE_0_FORENSIC_VERIFICATION.md` (27,326 B)
18. `Read/V3.0/Reports/REMEDIATION/PROJECT_IDENTITY_MIGRATION_PREPARATION.md` (16,449 B)
19. `Read/V3.0/Reports/REMEDIATION/GATE_0_2_MIGRATION_READINESS.md` (15,280 B)
20. `Read/V3.0/Reports/REMEDIATION/GATE_0_2_1_FINAL_MIGRATION_DECISION.md` (Tệp báo cáo này)

---

## 3. TASK 3 — THẨM TRA BẢN QUYỀN 6 GÓI NÉN RAR NGUYÊN BẢN TRONG `Pixel_Art/`

Đã trích xuất cấu trúc tệp bên trong của toàn bộ 6 tệp `.rar` tại `Pixel_Art/` bằng công cụ phân tích nhị phân:

| Tên gói RAR | Dung lượng | Tệp tin cốt lõi bên trong | Tệp License / Readme đi kèm | Phân loại tình trạng bản quyền | Khuyến nghị quản trị Git |
|---|:---:|---|:---:|:---:|:---:|
| **`Crow Animations.rar`** | 15 KB | 7 ảnh PNG quạ bay/đậu + `Crow_animations.ase` | ❌ **Không có** (Missing) | **License file missing / License unclear** (Asset miễn phí trên itch.io nhưng không có điều khoản cho phép phân phối lại gói gốc) | **Keep Local Only** (Không đưa vào Git) |
| **`ForgottenMemories.rar`** | 536 KB | `Trees_seperated.png`, `Props.png`, `TileSet.png`, `Trees.png`, `WaterTiles-6frames.png` | ❌ **Không có** (Missing) | **License unclear / License file missing** (`ASSET_LICENSES.md` ghi nhận: Chưa rõ bản quyền) | **Keep Local Only** (Không đưa vào Git) |
| **`PixelHorse_V1.0.rar`** | 296 KB | 25 PNG sprite atlas + `MAKING YOUR OWN HORSE RIDER.txt` | ⚠️ **Có txt hướng dẫn** (Yêu cầu đọc license tại website của tác giả) | **License unclear / External only** (Không có văn bản phân phối lại gói nén) | **Keep Local Only** (Không đưa vào Git) |
| **`Ramses Free Package_2.rar`** | 18 KB | 3 ảnh PNG + 3 GIF preview nhân vật | ❌ **Không có** (Missing) | **License file missing / License unclear** (Gói miễn phí cá nhân) | **Keep Local Only** (Không đưa vào Git) |
| **`Resurrected RPG 1.1.rar`** | 656 KB | 7 tệp `.aseprite` + 6 ảnh PNG tường/cỏ/cây | ❌ **Không có** (Missing) | **License file missing / License unclear** (Chứa tệp nguồn Aseprite gốc) | **Keep Local Only** (Không đưa vào Git) |
| **`SHADOW Series - The Free Assets.rar`** | 465 KB | 39 ảnh PNG + 7 tệp `.aseprite` quái vật bóng tối | ❌ **Không có** (Missing) | **License file missing / Redistribution prohibited** (Tác giả itch.io cấm re-host gói gốc) | **Keep Local Only** (Không đưa vào Git) |

### Kết Luận Pháp Lý & Hành Động Kỹ Thuật:
1. **Không gói RAR nào** có giấy phép mở (như MIT, CC-BY hoặc Unlicense) cho phép đưa nguyên gói nén lên kho lưu trữ GitHub công khai.
2. Các gói này hiện tại đều **chưa bị Git theo dõi** (untracked do quy tắc `*.rar`).
3. **Quyết định:** Giữ toàn bộ 6 gói RAR ở trạng thái **LOCAL ONLY** trên máy phát triển. Nếu cần chia sẻ nội bộ cho đồng đội, lưu trữ trên kho lưu trữ đám mây nội bộ có phân quyền (Google Drive / NAS) thay vì đẩy vào repository Git công khai.

---

## 4. TASK 4 — DANH MỤC LỆNH STAGING CHECKPOINT CHÍNH XÁC (STAGING LIST)

Chỉ định danh mục tệp tin được stage rõ ràng từng đường dẫn (tuyệt đối **KHÔNG DÙNG `git add .`**):

```powershell
# BƯỚC 1: Stage các cấu hình và tài liệu tracked đã sửa lỗi
git add vite.config.ts
git add Read/V3.0/README_INDEX.md
git add Read/V3.0/Reports/V3.0_10H_OVERHAUL_REPORT.md
git add Read/V3.0/Reports/V3.0_GIT_PUSH_SUCCESS.md

# BƯỚC 2: Stage công cụ chẩn đoán và báo cáo tổng quát
git add scripts/generate_full_diagnostic.mjs
git add FULL_DIAGNOSTIC_REPORT.md

# BƯỚC 3: Stage toàn bộ 10 báo cáo kiểm toán độc lập và 3 ảnh bằng chứng
git add Read/V3.0/Reports/AUDIT_2026-11-14/

# BƯỚC 4: Stage toàn bộ 4 báo cáo chuẩn bị chuyển giao & phục hồi (Gates 0, 0.1, 0.2, 0.2.1)
git add Read/V3.0/Reports/REMEDIATION/GATE_0_FORENSIC_VERIFICATION.md
git add Read/V3.0/Reports/REMEDIATION/PROJECT_IDENTITY_MIGRATION_PREPARATION.md
git add Read/V3.0/Reports/REMEDIATION/GATE_0_2_MIGRATION_READINESS.md
git add Read/V3.0/Reports/REMEDIATION/GATE_0_2_1_FINAL_MIGRATION_DECISION.md

# BƯỚC 5: Tạo commit checkpoint an toàn trước khi đổi tên workspace vật lý
git commit -m "chore: save Gate 0-0.2.1 forensic audit and pre-migration checkpoint"
```

### Các tệp LOẠI TRỪ KHỎI STAGING (Local Only):
- `HOLLOW_WOODS_V3_FORENSIC_AUDIT.zip` (Tệp nén dự phòng local).
- Toàn bộ 6 tệp `.rar` trong `Pixel_Art/`.
- Mọi tệp `.env`, `node_modules/`, `dist/`.

---

## 5. TASK 5 — CHECKLIST LỘ TRÌNH CHUYỂN ĐỔI CHUẨN XÁC (11 BƯỚC)

Quy trình tuần tự từng bước để thực hiện di dời an toàn:

| Bước | Hành động kỹ thuật | Chi tiết thực thi | Phụ trách | Trạng thái |
|:---:|---|---|:---:|:---:|
| **1** | **Chủ dự án xem xét báo cáo** | Đọc và đánh giá tài liệu Gate 0.2.1 | Project Owner | ⏳ Chờ duyệt |
| **2** | **Chủ dự án phê duyệt checkpoint** | Xác nhận danh mục tệp staging cụ thể | Project Owner | ⏳ Chờ duyệt |
| **3** | **Tạo commit Checkpoint an toàn** | Chạy các lệnh `git add` cụ thể & `git commit` | Lead / Git Admin | ⏳ Chưa chạy |
| **4** | **Đóng file locks hệ điều hành** | Thoát IDE, đóng terminal, dừng mọi dev server | Developer | ⏳ Chưa chạy |
| **5** | **Đổi tên thư mục vật lý Workspace** | `G:\HOLLOW WOODS V3` ➔ `G:\Hollow Woods` | OS / Admin | ⏳ Chưa chạy |
| **6** | **Kiểm tra tính toàn vẹn Git** | Mở terminal tại `G:\Hollow Woods`, chạy `git status` | Lead / Git Admin | ⏳ Chưa chạy |
| **7** | **Đổi tên thư mục tài liệu kế thừa** | Đổi `Read/V3.0/` thành `Read/V1/` | Lead / Git Admin | ⏳ Chưa chạy |
| **8** | **Khởi tạo thư mục tài liệu hoạt động** | Tạo mới cấu trúc `Read/V1.1/` với `README_INDEX.md` | Lead / Git Admin | ⏳ Chưa chạy |
| **9** | **Cập nhật các tệp định danh dự án** | Sửa `package.json`, `index.html`, `README.md`, Menu UI | Lead Developer | ⏳ Chưa chạy |
| **10** | **Chuẩn hóa đường dẫn Node.js scripts** | Cập nhật 5 script sang phân giải gốc `import.meta.url` | Lead Developer | ⏳ Chưa chạy |
| **11** | **Kiểm thử biên dịch và đóng gói** | `npx tsc --noEmit` & `npm run build` | QA / Lead | ⏳ Chưa chạy |

---

## 6. PHÂN TÍCH RỦI RO & QUY TRÌNH PHỤC HỒI (RISKS & RECOVERY)

1. **Rủi ro lỗi File Lock khi đổi tên folder trong Windows:**
   - *Nguyên nhân:* Visual Studio Code, Antigravity, hoặc tiến trình PowerShell đang mở handle tệp tại `G:\HOLLOW WOODS V3`.
   - *Quy trình khắc phục:* Không cố ép đổi tên khi file lock chưa giải phóng. Dùng Task Manager hoặc lệnh `Stop-Process` đóng các tiến trình Node/IDE trước khi đổi tên.
2. **Rủi ro thất lạc Git Remote hoặc HEAD:**
   - *Khẳng định:* Thư mục `.git/` nằm bên trong thư mục dự án và hoạt động theo relative path. Việc đổi tên thư mục cha từ `G:\HOLLOW WOODS V3` sang `G:\Hollow Woods` hoàn toàn **không ảnh hưởng** đến lịch sử commit hay remote `https://github.com/KyoshiroKyo/HOLLOW-WOODS.git`.
3. **Quy trình Rollback (Nếu xảy ra sự cố bất ngờ):**
   - Nếu đổi tên folder thất bại: Giữ nguyên thư mục cũ `G:\HOLLOW WOODS V3`. Trạng thái Git sau commit Checkpoint (Bước 3) là hoàn toàn an toàn và có thể khôi phục 100%.

---

## 🛑 STRICT STOP — DỪNG LẠI CHỜ CHỦ DỰ ÁN DUYỆT

> **XÁC NHẬN TUÂN THỦ:**
> - Báo cáo này hoàn thành 100% ở chế độ **READ-ONLY**.
> - Thư mục `G:\HOLLOW WOODS V3` CHƯA bị đổi tên.
> - Thư mục `Read/V3.0/` CHƯA bị đổi tên.
> - Thư mục `Read/V1.1/` CHƯA được khởi tạo.
> - Không có tệp mã nguồn, tài nguyên, hay cấu hình nào bị thay đổi.
> - Không có lệnh commit hay push nào được thực thi.
>
> **Kính đề nghị Chủ dự án xem xét và ban hành quyết định phê duyệt chính thức để chuyển sang bước thực thi Checkpoint & Đổi tên Workspace!**
