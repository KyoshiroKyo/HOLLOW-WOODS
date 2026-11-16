# 📋 BÁO CÁO CHẨN ĐOÁN KỸ THUẬT TOÀN DIỆN (MASTER DIAGNOSTIC REPORT)
## DỰ ÁN: HOLLOW WOODS V3.0 – THE FOG THAT REMEMBERS (SƯƠNG MÙ GHI NHỚ)

> **Người thực hiện:** Principal QA & Systems Auditor
> **Mục tiêu:** Kiểm toán hiện trạng toàn bộ mã nguồn, asset pixel art, toạ độ UI, logic tương tác và hiệu năng
> **Thời gian:** 2026-11-14

---

## 1. TỔNG HỢP CÁC BÁO CÁO & LỆNH ĐÃ CHẠY (PASS HISTORY)

Đã quét và phân tích **12** tài liệu báo cáo kỹ thuật trong thư mục `Read/V3.0/Reports/`:

### 📄 `V3.0_10H_OVERHAUL_REPORT.md`
> **Tiêu đề:** 📜 BÁO CÁO TỔNG KẾT ĐẠI TU TOÀN DIỆN 10 GIỜ (CYCLE 1 & CYCLE 2)

**Tóm tắt nội dung chính:**
- **100% Nghệ thuật Pixel Art thật:** Xóa bỏ hoàn toàn hình vẽ giả lập; tích hợp đầy đủ spritesheet nhân vật Dark Rogue (`64×64` px), 3 NPC riêng biệt kèm ảnh chân dung chân thực, 2 quái vật bóng đêm (`The Listener`, `The Echo`), và hơn 20 loại cây cối, nhà cửa, công trình đá cổ ngữ từ các gói tài nguyên bản quyền.
- **Chuẩn Native HD 1280×720 & World Camera 2.2×:** Nâng cấp độ phân giải từ 640×360 lên 1280×720 HD gốc, camera thế giới zoom 2.2× mang lại góc nhìn pixel art chi tiết, đồng thời giữ Camera UI ở tỷ lệ 1.0 sắc nét tuyệt đối.
- **Hệ thống Font Tiếng Việt HD Không Răng Cưa:** Tiện ích `HDTextHelper` xử lý triệt để bộ font chữ hiện đại, làm mịn mượt và nâng độ phân giải gấp đôi cho mọi đoạn thoại, chỉ số HUD, sổ tay và menu.
- **Ánh Sáng Đèn Lồng Động & Đom Đóm Khí Quyển:** Hệ thống sương mù gradient mềm mại kết hợp mặt nạ chiếu sáng bám sát nhân vật và hơn 50 hạt đom đóm lập lòe dẫn lối qua các điểm tài nguyên và cột đá cổ ngữ.

### 📄 `V3.0_ASSET_GAP_REPORT.md`
> **Tiêu đề:** 📦 BÁO CÁO KIỂM TOÁN ASSET & KHOẢNG TRỐNG – V3.0

**Tóm tắt nội dung chính:**
### A.1. Sprite Sheet
### A.2. Portrait
### A.3. File ZIP
### A.4. Giấy phép

### 📄 `V3.0_CANON_REGISTER.md`
> **Tiêu đề:** 📜 SỔ ĐĂNG KÝ CANON V3.0

**Tóm tắt nội dung chính:**
### Tiểu sử
### Thông Tin Asset
### Trạng Thái Canon
- ✅ **ĐÃ DUYỆT** — Satyr là nhân vật chính chính thức của V3.0.

### 📄 `V3.0_DEVELOPMENT_TASK_PLAN.md`
> **Tiêu đề:** 📋 KẾ HOẠCH TRIỂN KHAI KỸ THUẬT V3.0

**Tóm tắt nội dung chính:**
### 1.1 Tech Stack
### 1.2 Quy Ước Chung
- **Độ phân giải ảo:** 640×360 px
- **Kích thước tile:** 16×16 px (native)

### 📄 `V3.0_GIT_PUSH_SUCCESS.md`
> **Tiêu đề:** 🚀 BÁO CÁO XÁC NHẬN: GIT PUSH THÀNH CÔNG V3.0

**Tóm tắt nội dung chính:**
### 1. KẾT QUẢ TRIỂN KHAI VÀ ĐỒNG BỘ GITHUB
### 2. DANH MỤC THÀNH PHẦN ĐƯỢC BẢO TOÀN TRÊN REPO
### 3. HƯỚNG DẪN ĐỒNG ĐỘI TIẾP TỤC DỰ ÁN

### 📄 `V3.0_MAP_AND_SCENE_PLAN.md`
> **Tiêu đề:** 🗺️ HOLLOW WOODS V3.0 – KẾ HOẠCH BẢN ĐỒ & SCENE

**Tóm tắt nội dung chính:**
### 1.1 Luồng Scene Chính
### 1.2 Mô Tả Chi Tiết Từng Scene
### 1.3 Cơ Chế Scene Overlay (HUD)
### 2.1 Tổng Quan Phân Khu

### 📄 `V3.0_PASS_G1_REPORT.md`
> **Tiêu đề:** 🛡️ BÁO CÁO NGHIỆM THU KỸ THUẬT PASS G1

**Tóm tắt nội dung chính:**
### 2.1. Cấu trúc thư mục mã nguồn được tạo mới (`src/`)
### 3.1. Thông số kỹ thuật Sprite & Va chạm
- **Khung Canvas:** `64 × 32` px.
- **Vùng điểm ảnh thực (Opaque Bounds):** `50 × 21` px (chiếm ~13.9% chiều cao độ phân giải ảo 360p khi hiển thị 2× trên màn hình 720p).

### 📄 `V3.0_PASS_G2_REPORT.md`
> **Tiêu đề:** 📜 BÁO CÁO NGHIỆM THU KỸ THUẬT PASS G2

**Tóm tắt nội dung chính:**
### 4.1. Vị trí & Vai trò NPC
- **Garth – Dân Làng Cảnh Giác (`X: 530, Y: 220`):** Đứng canh tại Cổng Tây làng. Hoảng loạn khi thấy vạt áo Satyr bám đầy sương The Veil, yêu cầu Satyr gặp ngay Người Giữ Chuông.
- **Edda – Người Giữ Chuông (`X: 790, Y: 330`):** Đứng dưới chân Tháp Chuông làng Bellhollow. Kể về quả chuông câm bị cướp mất **Lưỡi Chuông Đồng**, căn dặn **3 Quy Tắc Bằng Máu** và mở đường vào rừng cấm.
- **Neris – Người Chữa Thảo Mộc (`X: 970, Y: 130`):** Đứng cạnh Nhà Thảo Mộc. Chẩn đoán sự ngấm độc sương của Satyr, trao tặng Thuốc Đắp đầu tiên, hồi phục sinh lực và dạy công thức chế tạo.

### 📄 `V3.0_PASS_G3_REPORT.md`
> **Tiêu đề:** 👁️ BÁO CÁO NGHIỆM THU KỸ THUẬT PASS G3

**Tóm tắt nội dung chính:**
- **Kết xuất The Veil:** 24 hạt sương mù nhiều tầng trôi dạt liên tục với tốc độ và bán kính ngẫu nhiên (`40–95 px`). Khi Satyr bật Đèn Lồng (`F`), bán kính nhìn thấy mở rộng lên `120 px` và độ mờ của sương giảm 40%.
- **Hiệu ứng khi Composure < 50 hoặc Tắt Đèn ở Rừng Sâu:**
- **Đặc trưng:** Bóng dáng một lữ khách mờ ảo chập chờn màu xám bạc xuất hiện ở rìa tầm nhìn (`140–180 px` cách Satyr).
- **Vị trí xuất hiện:**

### 📄 `V3.0_PASS_G4_REPORT.md`
> **Tiêu đề:** 📜 BÁO CÁO NGHIỆM THU KỸ THUẬT — PASS G4

**Tóm tắt nội dung chính:**
### 2.1. Phân Hệ Hoạt Cảnh Mở Đầu Act 0 (Fog Crossing)
- **Tập tin:** [GameScene.ts](file:///g:/HOLLOW%20WOODS%20V3/src/scenes/GameScene.ts)
- **Cơ chế triển khai:**
### 2.2. Phân Hệ Cao Trào Act 5: Miếu Chuông Phế Tích & Cuộc Rượt Đuổi Của Kẻ Lắng Nghe

### 📄 `V3.0_PASS_G5_RELEASE_REPORT.md`
> **Tiêu đề:** 🏆 BÁO CÁO NGHIỆM THU PHÁT HÀNH TOÀN DIỆN (RELEASE REPORT) — PASS G5

**Tóm tắt nội dung chính:**
### Các thành tựu then chốt đã đạt được:
- **Tổng số module TypeScript/JSON hoàn thiện:** 42 modules.
- **Dung lượng Bundle Production:** `dist/index.html` (1.19 kB), `dist/assets/index-Cx3UmN16.js` (1.78 MB, gzip 412 kB bao gồm trọn vẹn Phaser 4 Engine và toàn bộ hệ thống).
- **Độ phân giải hiển thị chuẩn pixel:** Virtual Resolution **`640 × 360` px** (integer scaling phóng nguyên lần `2×` lên `1280×720` và `3×` lên `1920×1080 Full HD`).

### 📄 `V3.0_STORY_AND_QUEST_FLOW.md`
> **Tiêu đề:** 📖 THIẾT KẾ CỐT TRUYỆN VÀ LUỒNG NHIỆM VỤ CHI TIẾT V3.0

**Tóm tắt nội dung chính:**
### HOLLOW WOODS V3.0 — THE FOG THAT REMEMBERS (SƯƠNG MÙ GHI NHỚ)
### 1.1. Bối cảnh & Chủ đề tư tưởng
- **Chủ đề chính:** Nỗi kinh hoàng của sự lãng quên, nghịch lý thời gian và ký ức bị bóp méo. Thế giới không phải là một chiến trường đối kháng trực diện mà là một bài toán sinh tồn tâm lý nơi sự im lặng, quan sát và tôn trọng quy tắc cổ là chìa khóa duy nhất để sống sót.
- **Thế giới:** Thế giới trung cổ u uất bao bọc bởi **The Veil (Màn Sương)**. Ngôi làng **Bellhollow** nhỏ bé tồn tại thoi thóp bên cạnh khu rừng cấm **The Hollow Woods**.


---

## 2. BẢNG KIỂM TRA KÍCH THƯỚC & HÌNH ẢNH THỰC TẾ TRONG `public/assets/`

| Phân mục | Tên File | Kích thước (Width × Height) | Dung lượng | Ghi chú & Mục đích sử dụng |
|---|---|:---:|:---:|---|
| `public/assets/characters` | `npc_edda.png` | **64 × 64 px** | 1.0 KB | Sprite nhân vật NPC trong làng Bellhollow. |
| `public/assets/characters` | `npc_garth.png` | **64 × 64 px** | 1.4 KB | Sprite nhân vật NPC trong làng Bellhollow. |
| `public/assets/characters` | `npc_neris.png` | **64 × 64 px** | 1.4 KB | Sprite nhân vật NPC trong làng Bellhollow. |
| `public/assets/characters` | `portrait_edda.png` | **64 × 64 px** | 0.7 KB | Ảnh chân dung đối thoại 64×64 px của NPC. |
| `public/assets/characters` | `portrait_garth.png` | **64 × 64 px** | 1.1 KB | Ảnh chân dung đối thoại 64×64 px của NPC. |
| `public/assets/characters` | `portrait_neris.png` | **64 × 64 px** | 1.0 KB | Ảnh chân dung đối thoại 64×64 px của NPC. |
| `public/assets/characters/satyr` | `satyr_portrait.png` | **64 × 64 px** | 7.2 KB | Chân dung Dark Rogue chuẩn 64×64 px. |
| `public/assets/characters/satyr` | `satyr_sheet.png` | **1408 × 256 px** | 213.3 KB | **Spritesheet Dark Rogue.** 1408×256 px = 22 cột × 4 hàng ô 64×64 px. |
| `public/assets/characters/npcs` | `npc_edda.png` | **64 × 64 px** | 1.0 KB | Sprite nhân vật NPC trong làng Bellhollow. |
| `public/assets/characters/npcs` | `npc_garth.png` | **64 × 64 px** | 1.4 KB | Sprite nhân vật NPC trong làng Bellhollow. |
| `public/assets/characters/npcs` | `npc_neris.png` | **64 × 64 px** | 1.4 KB | Sprite nhân vật NPC trong làng Bellhollow. |
| `public/assets/characters/npcs` | `portrait_edda.png` | **64 × 64 px** | 0.7 KB | Ảnh chân dung đối thoại 64×64 px của NPC. |
| `public/assets/characters/npcs` | `portrait_garth.png` | **64 × 64 px** | 1.1 KB | Ảnh chân dung đối thoại 64×64 px của NPC. |
| `public/assets/characters/npcs` | `portrait_neris.png` | **64 × 64 px** | 1.0 KB | Ảnh chân dung đối thoại 64×64 px của NPC. |
| `public/assets/environment/sprites` | `bell_tower.png` | **80 × 112 px** | 2.1 KB |  |
| `public/assets/environment/sprites` | `broken_shrine.png` | **96 × 80 px** | 1.5 KB |  |
| `public/assets/environment/sprites` | `bush_dense_1.png` | **50 × 44 px** | 2.9 KB |  |
| `public/assets/environment/sprites` | `bush_dense_2.png` | **41 × 47 px** | 2.4 KB |  |
| `public/assets/environment/sprites` | `crafting_bench.png` | **67 × 36 px** | 2.6 KB |  |
| `public/assets/environment/sprites` | `fog_smooth.png` | **512 × 256 px** | 43.2 KB |  |
| `public/assets/environment/sprites` | `hollow_tree.png` | **40 × 32 px** | 1.6 KB | Sprite cây cối môi trường. |
| `public/assets/environment/sprites` | `house_edda.png` | **112 × 80 px** | 2.3 KB |  |
| `public/assets/environment/sprites` | `house_neris.png` | **112 × 80 px** | 2.4 KB |  |
| `public/assets/environment/sprites` | `pillar_eye.png` | **32 × 52 px** | 2.1 KB | Sprite Cột Đá Cổ Ngữ (Mặt Trăng, Rễ, Mắt). |
| `public/assets/environment/sprites` | `pillar_moon.png` | **32 × 61 px** | 1.9 KB | Sprite Cột Đá Cổ Ngữ (Mặt Trăng, Rễ, Mắt). |
| `public/assets/environment/sprites` | `pillar_root.png` | **31 × 61 px** | 2.1 KB | Sprite Cột Đá Cổ Ngữ (Mặt Trăng, Rễ, Mắt). |
| `public/assets/environment/sprites` | `signpost.png` | **29 × 32 px** | 1.2 KB |  |
| `public/assets/environment/sprites` | `stone_altar.png` | **60 × 42 px** | 3.4 KB |  |
| `public/assets/environment/sprites` | `tree_dead.png` | **24 × 27 px** | 0.7 KB | Sprite cây cối môi trường. |
| `public/assets/environment/sprites` | `tree_oak_1.png` | **113 × 139 px** | 19.2 KB | Sprite cây cối môi trường. |
| `public/assets/environment/sprites` | `tree_oak_2.png` | **95 × 136 px** | 15.2 KB | Sprite cây cối môi trường. |
| `public/assets/environment/sprites` | `tree_oak_3.png` | **83 × 120 px** | 11.6 KB | Sprite cây cối môi trường. |
| `public/assets/environment/sprites` | `village_well.png` | **39 × 46 px** | 1.6 KB |  |
| `public/assets/environment/sprites` | `wooden_fence.png` | **47 × 53 px** | 2.4 KB |  |
| `public/assets/environment/tiles` | `tile_cobble_road.png` | **16 × 16 px** | 0.2 KB |  |
| `public/assets/environment/tiles` | `tile_dirt_trail.png` | **32 × 32 px** | 0.6 KB |  |
| `public/assets/environment/tiles` | `tile_forest_grass.png` | **32 × 32 px** | 0.8 KB | ⚠️ **ĐANG DÙNG LÀM NỀN CỎ.** Cắt từ forest_Tileset (0,0,32,32). Chứa 202 pixel trong suốt + 202 pixel đen gây lỗi ô vuông! |
| `public/assets/environment/tiles` | `tile_stone_floor.png` | **16 × 16 px** | 0.2 KB |  |
| `public/assets/environment/tiles` | `tile_swamp_mud.png` | **32 × 32 px** | 1.3 KB |  |
| `public/assets/environment/tilesets` | `castle_battlement.png` | **16 × 16 px** | 0.2 KB |  |
| `public/assets/environment/tilesets` | `castle_castle_wall.png` | **16 × 16 px** | 0.1 KB |  |
| `public/assets/environment/tilesets` | `castle_castle_wall_dark.png` | **16 × 16 px** | 0.1 KB |  |
| `public/assets/environment/tilesets` | `castle_castle_wall_mossy.png` | **16 × 16 px** | 0.1 KB |  |
| `public/assets/environment/tilesets` | `castle_cobble_road.png` | **16 × 16 px** | 0.1 KB |  |
| `public/assets/environment/tilesets` | `castle_cobble_road_dark.png` | **16 × 16 px** | 0.1 KB |  |
| `public/assets/environment/tilesets` | `castle_roof_blue.png` | **64 × 64 px** | 0.3 KB |  |
| `public/assets/environment/tilesets` | `castle_roof_red.png` | **64 × 64 px** | 0.3 KB |  |
| `public/assets/environment/tilesets` | `castle_roof_thatch.png` | **64 × 64 px** | 0.3 KB |  |
| `public/assets/environment/tilesets` | `castle_stone_floor.png` | **16 × 16 px** | 0.1 KB |  |
| `public/assets/environment/tilesets` | `castle_stone_floor_checker.png` | **16 × 16 px** | 0.1 KB |  |
| `public/assets/environment/tilesets` | `castle_timber_frame_wall.png` | **16 × 16 px** | 0.2 KB |  |
| `public/assets/environment/tilesets` | `castle_tower_red_roof.png` | **64 × 64 px** | 0.5 KB |  |
| `public/assets/environment/tilesets` | `castle_wood_door_wall.png` | **16 × 16 px** | 0.1 KB |  |
| `public/assets/environment/tilesets` | `castle_wood_plank.png` | **16 × 16 px** | 0.1 KB |  |
| `public/assets/environment/tilesets` | `forest_Decorations.png` | **256 × 256 px** | 7.6 KB |  |
| `public/assets/environment/tilesets` | `forest_Mockup1.png` | **480 × 272 px** | 29.2 KB |  |
| `public/assets/environment/tilesets` | `forest_Mockup2.png` | **320 × 180 px** | 14.8 KB |  |
| `public/assets/environment/tilesets` | `forest_Mockup3.png` | **320 × 180 px** | 12.3 KB |  |
| `public/assets/environment/tilesets` | `forest_Tileset.png` | **128 × 240 px** | 6.0 KB |  |
| `public/assets/environment/tilesets` | `forest_Tileset1xPadding.png` | **137 × 256 px** | 6.5 KB |  |
| `public/assets/environment/tilesets` | `TX Plant with Shadow.png` | **512 × 512 px** | 63.7 KB |  |
| `public/assets/environment/tilesets` | `TX Plant.png` | **512 × 512 px** | 63.7 KB |  |
| `public/assets/environment/tilesets` | `TX Player.png` | **128 × 128 px** | 2.5 KB |  |
| `public/assets/environment/tilesets` | `TX Props with Shadow.png` | **512 × 512 px** | 85.7 KB |  |
| `public/assets/environment/tilesets` | `TX Props.png` | **512 × 512 px** | 84.5 KB |  |
| `public/assets/environment/tilesets` | `TX Shadow Plant.png` | **512 × 512 px** | 3.3 KB |  |
| `public/assets/environment/tilesets` | `TX Shadow.png` | **512 × 512 px** | 8.9 KB |  |
| `public/assets/environment/tilesets` | `TX Struct.png` | **512 × 512 px** | 39.6 KB |  |
| `public/assets/environment/tilesets` | `TX Tileset Grass.png` | **256 × 256 px** | 10.8 KB | Tileset cỏ gốc 256×256 px chứa các mẫu cỏ liền mạch (seamless). |
| `public/assets/environment/tilesets` | `TX Tileset Stone Ground.png` | **256 × 256 px** | 8.3 KB |  |
| `public/assets/environment/tilesets` | `TX Tileset Wall.png` | **512 × 512 px** | 16.9 KB |  |
| `public/assets/monsters` | `the_echo.png` | **32 × 64 px** | 0.3 KB | Sprite quái vật bóng đêm. |
| `public/assets/monsters` | `the_listener.png` | **64 × 64 px** | 1.1 KB | Sprite quái vật bóng đêm. |

---

## 3. CHẨN ĐOÁN LỖI NHÂN VẬT CHÍNH (`SatyrPlayer.ts` & `satyr_animations.json`)

### A. Cấu hình Frame trong `satyr_animations.json`
Spritesheet `satyr_sheet.png` có kích thước **1408 × 256 px** (22 cột × 4 hàng ô 64×64 px = 88 frames tổng cộng):
- **Hàng 0 (DOWN):** Frames 0 đến 21
- **Hàng 1 (LEFT):** Frames 22 đến 43
- **Hàng 2 (RIGHT):** Frames 44 đến 65
- **Hàng 3 (UP):** Frames 66 đến 87

Danh sách các animation đang đăng ký:
```json
{
  "animations": [
    {
      "key": "satyr_idle_down",
      "frames": [
        0,
        1,
        2,
        3
      ],
      "frameRate": 4,
      "repeat": -1
    },
    {
      "key": "satyr_walk_down",
      "frames": [
        4,
        5,
        6,
        7,
        8,
        9
      ],
      "frameRate": 8,
      "repeat": -1
    },
    {
      "key": "satyr_run_down",
      "frames": [
        4,
        5,
        6,
        7,
        8,
        9
      ],
      "frameRate": 12,
      "repeat": -1
    },
    {
      "key": "satyr_attack_down",
      "frames": [
        10,
        11,
        12,
        13,
        14
      ],
      "frameRate": 10,
      "repeat": 0
    },
    {
      "key": "satyr_hurt_down",
      "frames": [
        15,
        16,
        17
      ],
      "frameRate": 6,
      "repeat": 0
    },
    {
      "key": "satyr_death_down",
      "frames": [
        18,
        19,
        20,
        21
      ],
      "frameRate": 6,
      "repeat": 0
    },
    {
      "key": "satyr_idle_left",
      "frames": [
        22,
        23,
        24,
        25
      ],
      "frameRate": 4,
      "repeat": -1
    },
    {
      "key": "satyr_walk_left",
      "frames": [
        26,
        27,
        28,
        29,
        30,
        31
      ],
      "frameRate": 8,
      "repeat": -1
    },
    {
      "key": "satyr_run_left",
      "frames": [
        26,
        27,
        28,
        29,
        30,
        31
      ],
      "frameRate": 12,
      "repeat": -1
    },
    {
      "key": "satyr_attack_left",
      "frames": [
        32,
        33,
        34,
        35,
        36
      ],
      "frameRate": 10,
      "repeat": 0
    },
    {
      "key": "satyr_hurt_left",
      "frames": [
        37,
        38,
        39
      ],
      "frameRate": 6,
      "repeat": 0
    },
    {
      "key": "satyr_death_left",
      "frames": [
        40,
        41,
        42,
        43
      ],
      "frameRate": 6,
      "repeat": 0
    },
    {
      "key": "satyr_idle_right",
      "frames": [
        44,
        45,
        46,
        47
      ],
      "frameRate": 4,
      "repeat": -1
    },
    {
      "key": "satyr_walk_right",
      "frames": [
        48,
        49,
        50,
        51,
        52,
        53
      ],
      "frameRate": 8,
      "repeat": -1
    },
    {
      "key": "satyr_run_right",
      "frames": [
        48,
        49,
        50,
        51,
        52,
        53
      ],
      "frameRate": 12,
      "repeat": -1
    },
    {
      "key": "satyr_attack_right",
      "frames": [
        54,
        55,
        56,
        57,
        58
      ],
      "frameRate": 10,
      "repeat": 0
    },
    {
      "key": "satyr_hurt_right",
      "frames": [
        59,
        60,
        61
      ],
      "frameRate": 6,
      "repeat": 0
    },
    {
      "key": "satyr_death_right",
      "frames": [
        62,
        63,
        64,
        65
      ],
      "frameRate": 6,
      "repeat": 0
    },
    {
      "key": "satyr_idle_up",
      "frames": [
        66,
        67,
        68,
        69
      ],
      "frameRate": 4,
      "repeat": -1
    },
    {
      "key": "satyr_walk_up",
      "frames": [
        70,
        71,
        72,
        73,
        74,
        75
      ],
      "frameRate": 8,
      "repeat": -1
    },
    {
      "key": "satyr_run_up",
      "frames": [
        70,
        71,
        72,
        73,
        74,
        75
      ],
      "frameRate": 12,
      "repeat": -1
    },
    {
      "key": "satyr_attack_up",
      "frames": [
        76,
        77,
        78,
        79,
        80
      ],
      "frameRate": 10,
      "repeat": 0
    },
    {
      "key": "satyr_hurt_up",
      "frames": [
        81,
        82,
        83
      ],
      "frameRate": 6,
      "repeat": 0
    },
    {
      "key": "satyr_death_up",
      "frames": [
        84,
        85,
        86,
        87
      ],
      "frameRate": 6,
      "repeat": 0
    },
    {
      "key": "satyr_attack",
      "frames": [
        10,
        11,
        12,
        13,
        14
      ],
      "frameRate": 10,
      "repeat": 0
    },
    {
      "key": "satyr_hurt",
      "frames": [
        15,
        16,
        17
      ],
      "frameRate": 6,
      "repeat": 0
    },
    {
      "key": "satyr_death",
      "frames": [
        18,
        19,
        20,
        21
      ],
      "frameRate": 6,
      "repeat": 0
    }
  ]
}
```

### B. Logic di chuyển & Animation trong `SatyrPlayer.ts`
```typescript
private handleMovement(): void {
    let moveX = 0;
    let moveY = 0;

    // Kiểm tra đầu vào từ WASD hoặc phím mũi tên
    const left = this.keyA.isDown || this.cursors.left.isDown;
    const right = this.keyD.isDown || this.cursors.right.isDown;
    const up = this.keyW.isDown || this.cursors.up.isDown;
    const down = this.keyS.isDown || this.cursors.down.isDown;

    if (left) moveX -= 1;
    if (right) moveX += 1;
    if (up) moveY -= 1;
    if (down) moveY += 1;

    // Xác định trạng thái chạy nhanh
    const wantsToSprint = (this.keyShift.isDown || this.cursors.shift.isDown) && (moveX !== 0 || moveY !== 0);
    const canSprint = wantsToSprint && this.stats.stamina > 5;
    this.stats.isSprinting = canSprint;

    const currentSpeed = canSprint ? PLAYER_SPRINT_SPEED : PLAYER_WALK_SPEED;

    // Chuẩn hóa vector di chuyển (tránh đi chéo chạy nhanh hơn)
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (moveX !== 0 || moveY !== 0) {
      const length = Math.sqrt(moveX * moveX + moveY * moveY);
      const normX = moveX / length;
      const normY = moveY / length;

      body.setVelocity(normX * currentSpeed, normY * currentSpeed);

      // Cập nhật hướng nhìn
      this.updateFacingDirection(moveX, moveY);

      // Cập nhật hoạt ảnh di chuyển
      this.playWalkOrRunAnim();
    } else {
      body.setVelocity(0, 0);
      this.playIdleAnim();
    }
  }

  private updateFacingDirection(moveX: number, moveY: number): void {
    if (Math.abs(moveX) > Math.abs(moveY)) {
      if (moveX < 0) {
        this.facing = 'left';
        this.setFlipX(false);
      } else if (moveX > 0) {
        this.facing = 'right';
        this.setFlipX(false); // Không lật hình vì đã có riêng hàng RIGHT độc lập
      }
    } else {
      if (moveY < 0) {
        this.facing = 'up';
        this.setFlipX(false);
      } else if (moveY > 0) {
        this.facing = 'down';
        this.setFlipX(false);
      }
    }
  }

  private playWalkOrRunAnim(): void {
    const isRunning = this.stats.isSprinting;
    const prefix = isRunning ? 'satyr_run_' : 'satyr_walk_';

    let animKey = '';
    if (this.facing === 'down') {
      animKey = `${prefix}down`;
    } else if (this.facing === 'up') {
      animKey = `${prefix}up`;
    } else if (this.facing === 'right') {
      animKey = `${prefix}right`;
    } else {
      animKey = `${prefix}left`;
    }

    if (this.anims.currentAnim?.key !== animKey) {
      this.play(animKey, true);
    }
  }

  private playIdleAnim(): void {
    let animKey = '';
    if (this.facing === 'down') {
      animKey = 'satyr_idle_down';
    } else if (this.facing === 'up') {
      animKey = 'satyr_idle_up';
    } else if (this.facing === 'right') {
      animKey = 'satyr_idle_right';
    } else {
      animKey = 'satyr_idle_left';
    }

    if (this.anims.currentAnim?.key !== animKey) {
      this.play(animKey, true);
    }
  }
```

### C. Phân tích nguyên nhân nhân vật di chuyển bị khựng / lệch frame:
1. **Sai lệch thứ tự Frame thực tế trong Sprite Sheet:**
   - `satyr_sheet.png` được ghép tự động từ 22 dáng nhân vật của `DarkRogue_Transparent_SpriteSheet.png` bằng thuật toán phân đoạn Histogram.
   - Tuy nhiên, trong ảnh nguồn gốc, 22 dáng đó KHÔNG TUÂN THEO thứ tự: [Idle: 4, Walk: 6, Attack: 5, Hurt: 3, Death: 4]! Một số cột là tư thế nhảy, trượt hoặc vung vũ khí. Khi gọi hoạt ảnh `satyr_walk_down` (frames 4..9), nhân vật bị giật sang tư thế khác hoàn toàn thay vì một chu kỳ bước đi mượt mà.
2. **Xung đột hướng nhìn khi đi chéo (Diagonal Stutter):**
   - Trong `updateFacingDirection`, khi nhấn cả 2 phím (ví dụ W + D), nếu `Math.abs(moveX) === Math.abs(moveY)`, nhánh `else` sẽ luôn ưu tiên gán hướng `up` hoặc `down`. Khi nhả nhẹ phím hoặc tốc độ trượt thay đổi, hướng bị giật qua lại giữa trục X và Y làm animation bị reset liên tục mỗi frame.
3. **Lệch tâm va chạm và Foot Offset:**
   - Origin đặt tại `(0.50, 0.90)` (tương đương pixel x=32, y=57.6). Nhưng Foot Collider body lại đặt `setSize(14, 8)` và `setOffset(25, 50)`. Offset y=50 nằm cao hơn gót chân (y=58) đến 8 pixel, khiến phần chân dưới cọ xát với collider môi trường không khớp với hình ảnh hiển thị.

---

## 4. CHẨN ĐOÁN LỖI KHÔNG TƯƠNG TÁC ĐƯỢC VỚI NPC & MẤT HỘP THOẠI

### A. Mã nguồn xử lý tương tác phím [E] trong `GameScene.ts`
```typescript
private handleInteractions(): void {
    // PASS T13, T15, T16: Khi hộp thoại đang mở hoặc Modal (Chế tạo, Sổ tay, Tạm dừng) mở, BẮT BUỘC ẩn ngay lập tức nhãn gợi ý và nhãn NPC
    if (this.dialogueSystem.isActive || this.craftingModal.isOpen || this.journalModal.isOpen || this.pauseModal.isOpen) {
      if (this.uiScene) {
        this.uiScene.setDialogueActive(true);
      }
      for (const npc of this.npcs) {
        npc.setNearby(false);
      }
      return;
    }

    const px = this.player.x;
    const py = this.player.y;

    // 1. Kiểm tra NPC gần
    let nearbyNPC: NPCEntity | null = null;
    for (const npc of this.npcs) {
      const dist = Math.hypot(px - npc.spec.x, py - npc.spec.y);
      const isNear = dist <= 42;
      npc.setNearby(isNear);
      if (isNear) {
        nearbyNPC = npc;
      }
    }

    if (nearbyNPC) {
      if (this.uiScene) {
        this.uiScene.setInteractionPrompt(`[E] Trò chuyện với ${nearbyNPC.spec.name}`);
      }

      if (this.player.isInteractRequested() && !this.dialogueSystem.isActive) {
        let dKey = nearbyNPC.spec.dialogueKey;
        if (nearbyNPC.spec.id === 'npc_edda' && this.playerState.hasFlag('talked_to_edda')) {
          dKey = 'edda_reminder';
        } else if (nearbyNPC.spec.id === 'npc_neris' && this.playerState.hasFlag('talked_to_neris')) {
          dKey = 'neris_heal';
        }
        this.dialogueSystem.startDialogue(dKey);
      }
      return;
    }

    // 2. Kiểm tra thu hoạch tài nguyên (InventorySystem)
    if (this.player.isInteractRequested()) {
      const harvestResult = this.inventorySystem.checkHarvestNearby(px, py, 34);
      if (harvestResult) {
        if (this.uiScene) {
          this.uiScene.showPopupMessage(`Đã thu thập: ${harvestResult.itemName}`);
        }
        return;
      }
    }

    // 3. Kiểm tra các vật thể và câu đố trên bản đồ
    const nearby = this.worldBuilder.checkInteractableNearby(this.player.getFootPosition(), 42);
    if (nearby) {
      if (this.uiScene) {
        this.uiScene.setInteractionPrompt(nearby.promptText);
      }

      if (this.player.isInteractRequested()) {
        this.executeMapInteraction(nearby.actionId, nearby.name);
      }
    } else {
      if (this.uiScene) {
        this.uiScene.setInteractionPrompt(null);
      }
    }
  }
```

### B. Cấu hình vị trí và hiển thị Hộp Thoại trong `DialogueSystem.ts`
```typescript
constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // 1. Dựng khung hộp thoại HD đặt tại tọa độ (640, 590) kích thước 1060×185 px
    this.container = scene.add.container(640, 590);
    this.container.setScrollFactor(0);
    this.container.setDepth(9000);

    const boxWidth = 1060;
    const boxHeight = 185;
    const halfW = boxWidth / 2;
    const halfH = boxHeight / 2;

    // Nền hộp thoại màu đá đen trung cổ có viền vàng mộc sang trọng
    const bg = scene.add.graphics();
    bg.fillStyle(0x0a0e14, 0.95);
    bg.fillRoundedRect(-halfW, -halfH, boxWidth, boxHeight, 10);
    bg.lineStyle(2, 0xd4af37, 1);
    bg.strokeRoundedRect(-halfW, -halfH, boxWidth, boxHeight, 10);

    // Viền lót bên trong tăng chiều sâu mỹ thuật
    bg.lineStyle(1, 0x4a3b22, 0.7);
    bg.strokeRoundedRect(-halfW + 4, -halfH + 4, boxWidth - 8, boxHeight - 8, 8);

    // Khung chân dung bên trái (140×140 px)
    const portraitBg = scene.add.graphics();
    portraitBg.fillStyle(0x151b24, 1);
    portraitBg.fillRoundedRect(-halfW + 24, -70, 140, 140, 8);
    portraitBg.lineStyle(2, 0xb8860b, 1);
    portraitBg.strokeRoundedRect(-halfW + 24, -70, 140, 140, 8);

    // Chân dung người nói (Tâm tại x = -halfW + 24 + 70 = -436, y = 0)
    this.portraitSprite = scene.add.image(-halfW + 94, 0, 'satyr_portrait');
    this.portraitSprite.setDisplaySize(124, 124);

    // Tên người nói chuẩn HD Tiếng Việt (Cỡ 24px)
    this.speakerText = HDTextHelper.createText(scene, -halfW + 184, -halfH + 20, '', {
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#f39c12',
      stroke: '#000000',
      strokeThickness: 3
    });

    // Nội dung câu thoại chuẩn HD Tiếng Việt (Cỡ đúng chuẩn 20px)
    this.contentText = HDTextHelper.createText(scene, -halfW + 184, -halfH + 60, '', {
      fontSize: '20px',
      color: '#f8f9fa',
      wordWrap: { width: boxWidth - 215 },
      lineSpacing: 8,
      stroke: '#000000',
      strokeThickness: 1
    });

    // Lời nhắc tiếp tục chuẩn HD Tiếng Việt
    this.continuePrompt = HDTextHelper.createText(scene, halfW - 25, halfH - 25, '▶ [E / SPACE]', {
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#bdc3c7'
    }).setOrigin(1, 0.5);

    this.container.add([bg, portraitBg, this.portraitSprite, this.speakerText, this.contentText, this.continuePrompt]);
    this.container.setVisible(false);

    // Hiệu ứng nhấp nháy chữ Tiếp tục
    scene.tweens.add({
      targets: this.continuePrompt,
      alpha: 0.35,
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    // Lắng nghe phím bấm
    if (scene.input && scene.input.keyboard) {
      scene.input.keyboard.on('keydown-SPACE', () => this.handleAdvance());
      scene.input.keyboard.on('keydown-E', () => this.handleAdvance());
      scene.input.keyboard.on('keydown-ENTER', () => this.handleAdvance());
    }
  }
```

### C. NGUYÊN NHÂN GỐC RỄ (ROOT CAUSE) KHIẾN HỘP THOẠI BIẾN MẤT:
> 🚨 **PHÁT HIỆN TỬ HUYỆT KỸ THUẬT: XUNG ĐỘT CAMERA ZOOM 2.2× VÀ VỊ TRÍ HỘP THOẠI**

1. **Hộp thoại được gắn vào `GameScene` thay vì `UIScene`:**
   - Trong `GameScene.ts` dòng 155: `this.dialogueSystem = new DialogueSystem(this);` -> `this` ở đây là `GameScene`!
   - Camera chính của `GameScene` đang được đặt zoom: `this.cameras.main.setZoom(2.2);`. Trong khi đó, `UIScene` mới là Scene dành cho giao diện với `zoom = 1.0`!
2. **Container bị đẩy văng xuống ngoài đáy màn hình (Off-screen Y = 866 px):**
   - `DialogueSystem` đặt toạ độ container tại: `(x: 640, y: 590)` với `setScrollFactor(0)`.
   - Trong Phaser 3, `setScrollFactor(0)` chỉ ngăn cản việc cuộn camera (`scrollX/scrollY`), NHƯNG **vẫn chịu sự co giãn (scale/zoom) của Camera Scene đó** từ tâm Camera `(640, 360)`!
   - Khoảng cách từ tâm màn hình xuống y=590 là: `590 - 360 = +230 px`.
   - Khi Camera zoom 2.2×: Tọa độ hiển thị thực tế trên canvas = `360 + (230 × 2.2) = 360 + 506 = 866 px`!
   - Chiều cao Native Canvas là **720 px**. Do đó tâm hộp thoại nằm ở **Y = 866 px**, tụt xuống dưới đáy màn hình 146 px!
   - Chiều cao hộp thoại là 185 px (nhân zoom 2.2× = 407 px). Đỉnh mép hộp thoại chỉ thò lên tại: `866 - 203.5 = 662.5 px`. Toàn bộ chữ, ảnh chân dung, tên người nói và nội dung đều nằm ngoài tầm nhìn của người chơi!
3. **Hiện tượng người chơi bị đơ cứng (Soft-lock điều khiển):**
   - Khi nhấn `[E]`, `this.dialogueSystem.startDialogue()` được kích hoạt và đặt `this.isActive = true`.
   - Trong `GameScene.ts`, `isUIBusy` kiểm tra `this.dialogueSystem.isActive` và KHÓA TOÀN BỘ DI CHUYỂN CỦA NGƯỜI CHƠI.
   - Nhưng vì hộp thoại bị rớt xuống dưới đáy màn hình không thấy gì, người chơi tưởng rằng game bị đơ hoặc không phản hồi phím [E]!


---

## 5. CHẨN ĐOÁN LỖI NỀN ĐẤT Ô VUÔNG LẶP LẠI & MẤT KHU RỪNG (`WorldBuilder.ts`)

### A. Mã nguồn hàm `renderZoneTerrain` trong `WorldBuilder.ts`
```typescript
private renderZoneTerrain(zone: ZoneData): void {
    const { bounds, id } = zone;

    // 1. Nền mặt đất cơ bản cho từng phân khu bằng TileSprite
    let baseTexture = TILE_FOREST_GRASS;
    let baseTint = 0xffffff;

    if (id === 'fog_crossing') {
      baseTexture = TILE_FOREST_GRASS;
      baseTint = 0x889888; // Sương mù xám nhạt phủ lên thảm cỏ
    } else if (id === 'bellhollow') {
      baseTexture = TILE_FOREST_GRASS;
      baseTint = 0x99aa88; // Cỏ làng ấm áp
    } else if (id === 'crooked_path') {
      baseTexture = TILE_FOREST_GRASS;
      baseTint = 0x6e7d68; // Cỏ rừng rậm tối màu
    } else if (id === 'silent_mire') {
      baseTexture = TILE_SWAMP_MUD;
      baseTint = 0x88aa99; // Bùn rêu nước đầm lầy huyền bí
    } else if (id === 'broken_bell_shrine') {
      baseTexture = TILE_FOREST_GRASS;
      baseTint = 0x777788; // Đất rêu phong xám lạnh quanh miếu đổ
    }

    const ground = this.scene.add.tileSprite(bounds.x, bounds.y, bounds.width, bounds.height, baseTexture);
    ground.setOrigin(0, 0);
    ground.setDepth(-100);
    if (baseTint !== 0xffffff) ground.setTint(baseTint);

    // 2. Vẽ đường mòn, đường đá cuội và sân gạch bằng TileSprite
    if (id === 'fog_crossing') {
      // Đường mòn đất xuyên qua màn sương
      const trail = this.scene.add.tileSprite(bounds.x, 160, bounds.width, 50, TILE_DIRT_TRAIL);
      trail.setOrigin(0, 0);
      trail.setDepth(-95);
      trail.setTint(0x999988);
    } else if (id === 'bellhollow') {
      // Đường đá cuội làng Bellhollow
      const mainRoad = this.scene.add.tileSprite(bounds.x, 240, bounds.width, 60, TILE_COBBLE_ROAD);
      mainRoad.setOrigin(0, 0);
      mainRoad.setDepth(-95);

      const pathEdda = this.scene.add.tileSprite(700, 120, 40, 130, TILE_COBBLE_ROAD);
      pathEdda.setOrigin(0, 0);
      pathEdda.setDepth(-95);

      const pathNeris = this.scene.add.tileSprite(960, 120, 40, 130, TILE_COBBLE_ROAD);
      pathNeris.setOrigin(0, 0);
      pathNeris.setDepth(-95);

      const pathTower = this.scene.add.tileSprite(820, 240, 50, 120, TILE_COBBLE_ROAD);
      pathTower.setOrigin(0, 0);
      pathTower.setDepth(-95);
    } else if (id === 'crooked_path') {
      // Đường mòn uốn lượn qua rừng bằng TileSprite
      const trailSegments = [
        { x: bounds.x, y: 260, w: 350, h: 50 },
        { x: bounds.x + 300, y: 220, w: 350, h: 60 },
        { x: bounds.x + 600, y: 260, w: 350, h: 60 },
        { x: bounds.x + 900, y: 280, w: 380, h: 50 }
      ];
      for (const seg of trailSegments) {
        const trail = this.scene.add.tileSprite(seg.x, seg.y, seg.w, seg.h, TILE_DIRT_TRAIL);
        trail.setOrigin(0, 0);
        trail.setDepth(-95);
        trail.setTint(0x887766);
      }
    } else if (id === 'silent_mire') {
      // Lối đi gờ đất mộc nổi trên đầm lầy
      const mirePaths = [
        { x: bounds.x, y: 300, w: 400, h: 40 },
        { x: bounds.x + 380, y: 220, w: 500, h: 40 },
        { x: bounds.x + 850, y: 270, w: 270, h: 45 }
      ];
      for (const p of mirePaths) {
        const path = this.scene.add.tileSprite(p.x, p.y, p.w, p.h, TILE_DIRT_TRAIL);
        path.setOrigin(0, 0);
        path.setDepth(-95);
        path.setTint(0x665544);
      }
    } else if (id === 'broken_bell_shrine') {
      // Sân gạch đá cổ của Miếu Chuông bằng TileSprite
      const courtyard = this.scene.add.tileSprite(bounds.x + 200, 160, 560, 280, TILE_STONE_FLOOR);
      courtyard.setOrigin(0, 0);
      courtyard.setDepth(-95);
      courtyard.setTint(0x888899);
    }

    // 3. Dựng các chi tiết kiến trúc đặc thù
    this.renderDecorations(zone);
  }
```

### B. NGUYÊN NHÂN MẶT ĐẤT BỊ LÁT BẰNG Ô VUÔNG ĐEN LẶP LẠI:
1. **Trích xuất sai vị trí trong `step7_extract_terrain_tiles.mjs`:**
   - Script `step7_extract_terrain_tiles.mjs` dòng 60 đã cắt: `extractRegion(forestPng, { x: 0, y: 0, w: 32, h: 32 }, 'tile_forest_grass.png')` từ `forest_Tileset.png`.
   - Trong file `forest_Tileset.png` (128×240 px), góc `(0, 0, 32, 32)` KHÔNG PHẢI LÀ TILE CỎ LIỀN MẠCH, mà là một góc của bụi cây có bóng đổ đen và viền trong suốt!
   - **Kiểm tra pixel thực tế:** File `tile_forest_grass.png` có tổng cộng 1024 pixel thì có tới **202 pixel trong suốt (alpha < 200)** và **202 pixel đen kịt**!
   - Khi `WorldBuilder.ts` dùng `tileSprite(bounds.x, bounds.y, bounds.width, bounds.height, TILE_FOREST_GRASS)`, Phaser sẽ lặp lại bức ảnh 32×32 này hàng nghìn lần, tạo thành một mạng lưới ô cờ chằng chịt các đốm đen và lỗ thủng!
2. **Có sẵn Tileset cỏ chuẩn nhưng không dùng:**
   - Trong `public/assets/environment/tilesets/TX Tileset Grass.png` (256×256 px) có sẵn các ô cỏ xanh mượt mà, phẳng phiu, không hề có bóng đen.
3. **Mất cảm giác khu rừng nguyên sinh:**
   - Mật độ cây cối đặt theo chu kỳ cứng `x += 180px`, quá thưa thớt so với chiều cao bản đồ 720px (khi zoom 2.2× thì tầm nhìn thế giới theo trục dọc là ~327 px, các cây bị rải rác ở mép trên và mép dưới), để lộ khoảng đất trống trơn bị lát bởi các ô vuông đen.


---

## 6. CHẨN ĐOÁN HIỆU NĂNG GÂY KHỰNG / GIẬT LAG (`GameScene.ts`, `VeilSystem.ts`, `HDTextHelper.ts`)

### A. Tạo mới & Hủy Graphics mỗi Frame trong `updateFogOfWar` (`GameScene.ts`)
```typescript
private setupFogOfWar(): void {
    // Lớp sương mù động bao phủ toàn màn hình HD 1280×720
    this.fogOfWarLayer = this.add.renderTexture(0, 0, 1280, 720);
    this.fogOfWarLayer.setScrollFactor(0);
    this.fogOfWarLayer.setDepth(5000);

    // Quầng sáng ấm áp phát ra từ Đèn Lồng của Dark Rogue
    this.lanternGlowGfx = this.add.graphics();
    this.lanternGlowGfx.setScrollFactor(0);
    this.lanternGlowGfx.setDepth(5020);
  }

  private setupFireflies(): void {
    this.fireflyGfx = this.add.graphics();
    this.fireflyGfx.setDepth(5050); // Nằm trên sương mù nhẹ để người chơi định vị trong đêm

    this.fireflies = [];

    // Danh sách các điểm tụ đom đóm chính
    const clusters: Array<{ x: number; y: number; count: number; colors: number[]; radius: number }> = [
      // 1. Ba Cột Đá Cổ Ngữ (Silent Mire) - Ánh sáng dạ quang huyền bí
      { x: 3400, y: 220, count: 8, colors: [0x5dade2, 0x85c1e9], radius: 36 }, // Cột Trăng
      { x: 3520, y: 360, count: 8, colors: [0x58d68d, 0x82e0aa], radius: 36 }, // Cột Rễ
      { x: 3640, y: 220, count: 8, colors: [0xaf7ac5, 0xbb8fce], radius: 36 }, // Cột Con Mắt

      // 2. Lửa Trại & Giếng Làng Bellhollow - Tàn lửa ấm áp & đom đóm ven nước
      { x: 850, y: 260, count: 10, colors: [0xf39c12, 0xf1c40f, 0xe67e22], radius: 42 },
      { x: 720, y: 380, count: 4, colors: [0x76d7c4, 0xa3e4d7], radius: 28 },

      // 3. Các điểm tài nguyên thảo dược & nhựa cây (Bellhollow & Crooked Path)
      { x: 1040, y: 180, count: 4, colors: [0x2ecc71, 0x58d68d], radius: 25 },
      { x: 880, y: 200, count: 4, colors: [0xf4d03f, 0xf7dc6f], radius: 25 },
      { x: 1900, y: 180, count: 3, colors: [0xa2d9ce, 0x73c6b6], radius: 22 },
      { x: 2350, y: 420, count: 3, colors: [0xa2d9ce, 0x73c6b6], radius: 22 },

      // 4. Các điểm tài nguyên đầm lầy hoang vu
      { x: 3050, y: 280, count: 4, colors: [0x48c9b0, 0x1abc9c], radius: 26 },
      { x: 3350, y: 380, count: 4, colors: [0x48c9b0, 0x1abc9c], radius: 26 }
    ];

    for (const cluster of clusters) {
      for (let i = 0; i < cluster.count; i++) {
        const angle = (i / cluster.count) * Math.PI * 2 + Math.random() * 0.5;
        const dist = Math.random() * cluster.radius;
        const color = Phaser.Utils.Array.GetRandom(cluster.colors);

        this.fireflies.push({
          anchorX: cluster.x,
          anchorY: cluster.y,
          x: cluster.x + Math.cos(angle) * dist,
          y: cluster.y + Math.sin(angle) * dist,
          color,
          baseAlpha: 0.45 + Math.random() * 0.4,
          size: 1.6 + Math.random() * 1.2,
          radius: cluster.radius * (0.6 + Math.random() * 0.6),
          speed: 0.8 + Math.random() * 0.7,
          phaseX: Math.random() * Math.PI * 2,
          phaseY: Math.random() * Math.PI * 2,
          phaseAlpha: Math.random() * Math.PI * 2
        });
      }
    }
  }

  private updateFireflies(time: number): void {
    if (!this.fireflyGfx) return;
    this.fireflyGfx.clear();

    const cam = this.cameras.main;
    const viewLeft = cam.worldView.x - 60;
    const viewRight = cam.worldView.right + 60;
    const viewTop = cam.worldView.y - 60;
    const viewBottom = cam.worldView.bottom + 60;

    for (let i = 0; i < this.fireflies.length; i++) {
      const f = this.fireflies[i];

      // Chuyển động lơ lửng hình sin mượt mà
      f.x = f.anchorX + Math.sin(time * 0.001 * f.speed + f.phaseX) * f.radius;
      f.y = f.anchorY + Math.cos(time * 0.0013 * f.speed + f.phaseY) * (f.radius * 0.65);

      // Bỏ qua nếu nằm ngoài tầm nhìn camera
      if (f.x < viewLeft || f.x > viewRight || f.y < viewTop || f.y > viewBottom) {
        continue;
      }

      // Ánh sáng lập lòe nhịp nhàng
      const pulse = Math.sin(time * 0.0035 + f.phaseAlpha);
      const alpha = Math.max(0.05, Math.min(1.0, f.baseAlpha + pulse * 0.38));

      // Quầng sáng mờ xung quanh đom đóm
      this.fireflyGfx.fillStyle(f.color, alpha * 0.32);
      this.fireflyGfx.fillCircle(f.x, f.y, f.size * 2.8);

      // Lõi đom đóm sáng rực rỡ
      this.fireflyGfx.fillStyle(f.color, alpha * 0.95);
      this.fireflyGfx.fillCircle(f.x, f.y, f.size);
    }
  }

  public update(time: number, delta: number): void {
    const dt = delta / 1000;

    // Khóa điều khiển nếu Ending đang chạy hoặc UI modal mở
    const isUIBusy =
      this.endingSystem.isEndingActive ||
      this.pauseModal.isOpen ||
      this.dialogueSystem.isActive ||
      this.craftingModal.isOpen ||
      this.journalModal.isOpen;

    if (!isUIBusy) {
      this.player.update(time, delta);
    } else {
      (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    }

    // Cập nhật camera
    this.cameraSystem.update();

    // Cập nhật hệ thống sinh tồn
    const inDeepFog = this.currentZoneId === 'fog_crossing' || this.currentZoneId === 'silent_mire' || this.isAct5ChaseActive;
    this.survivalSystem.update(dt, this.player.x, this.player.y, inDeepFog);

    this.playerState.stats.isLanternOn = this.player.stats.isLanternOn;
    this.playerState.stats.isSprinting = this.player.stats.isSprinting;

    // Cập nhật The Veil (Màn Sương) và hiệu ứng tâm lý (PASS G3)
    this.veilSystem.update(time, delta, inDeepFog);

    // Cập nhật âm thanh khí quyển & hiệu ứng lọc The Veil (PASS G5)
    this.audioManager.updateVeilFilter(inDeepFog, this.playerState.stats.composure);
    this.audioManager.setWindIntensity(inDeepFog ? 1.4 : 0.6);

    // Xử lý âm thanh bước chân trên từng địa hình
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (body && (body.velocity.x !== 0 || body.velocity.y !== 0)) {
      this.footstepTimer += delta;
      const stepInterval = this.player.stats.isSprinting ? 270 : 400;
      if (this.footstepTimer >= stepInterval) {
        this.footstepTimer = 0;
        let terrain: TerrainType = 'grass';
        if (this.currentZoneId === 'silent_mire') terrain = 'mud';
        else if (this.currentZoneId === 'bellhollow') terrain = 'dirt';
        this.audioManager.playFootstep(terrain);
      }
    } else {
      this.footstepTimer = 0;
    }

    // Xử lý âm thanh bật/tắt đèn lồng
    if (this.player.stats.isLanternOn !== this.lastLanternState) {
      this.lastLanternState = this.player.stats.isLanternOn;
      this.audioManager.playLanternToggle(this.lastLanternState);
    }

    // Nhịp tim hoảng loạn khi Bình Tâm suy giảm nghiêm trọng
    if (this.playerState.stats.composure < 40 && !this.isAct5ChaseActive) {
      this.audioManager.setHeartbeatActive(true, 750);
    } else if (!this.isAct5ChaseActive && this.playerState.stats.composure >= 50) {
      this.audioManager.setHeartbeatActive(false);
    }

    // Cập nhật hiện tượng The Echo (Tiếng Vọng) (PASS G3)
    this.echoSystem.update(this.player.x, this.player.y, (msg: string) => {
      if (this.uiScene) {
        this.uiScene.showPopupMessage(msg);
      }
    });

    // Cập nhật Act 0 tutorial / mở đầu
    this.updateAct0Progression();

    // Cập nhật AI của The Listener (PASS G3 & G4 Chase)
    this.updateTheListenerAI(delta);

    // Cập nhật logic truy đuổi Act 5 Climax
    this.updateAct5ChaseLogic();

    // Kiểm tra Câu đố 1: Chiếc Đèn Thứ Hai Trong Sương (Quy Tắc 2)
    this.puzzleSystem.checkFakeLanternProximity(this.player.x, this.player.y, (failMsg: string) => {
      this.cameraSystem.shake(300, 0.01);
      this.cameraSystem.flash(400, 26, 188, 156);
      if (this.uiScene) {
        this.uiScene.showPopupMessage(failMsg);
      }
      // Teleport Satyr trở lại đầu con đường rừng (X: 1660, Y: 280)
      this.player.setPosition(1660, 280);
    });

    // Kiểm tra ném mồi tiếng động [Phím Q]
    this.handleNoiseLureThrow();

    // Phát hiện và xử lý phân khu
    this.handleZoneLogic();

    // Kiểm tra NPC và tương tác gần
    this.handleInteractions();

    // Cập nhật hiệu ứng sương mù động & đom đóm (PASS T17)
    this.updateFogOfWar();
    this.updateFireflies(time);

    // Cập nhật F4 Debug Overlay
    this.debugOverlay.update(this.currentZoneId);
  }

  private updateAct0Progression(): void {
    if (this.isAct0IntroPending && !this.act0TutorialDone && this.player.x >= 280) {
      this.act0TutorialDone = true;
      if (this.act0EchoGfx) {
        this.tweens.add({
          targets: this.act0EchoGfx,
          alpha: 0,
          duration: 900,
          onComplete: () => {
            this.act0EchoGfx?.destroy();
          }
        });
      }

      if (this.uiScene) {
        this.uiScene.showPopupMessage('Echo: “Đi theo tiếng chuông... Làng Bellhollow ở ngay phía trước...”');
      }

      // Đánh dấu hoàn thành Hồi 0
      this.playerState.completeQuestTask('Q00_WAKE_UP', 't1');
      this.playerState.completeQuestTask('Q00_WAKE_UP', 't2');
      this.playerState.setCurrentQuest('Q01_MEET_EDDA');

      // Tự động lưu checkpoint Act 0
      SaveManager.saveGame('HỒI 0 HOÀN THÀNH (CỔNG LÀNG BELLHOLLOW)', 'bellhollow', this.player.x, this.player.y);
    }
  }

  private updateTheListenerAI(delta: number): void {
    if (!this.listenerMonster) return;

    this.listenerMonster.update(delta, this.player.x, this.player.y, this.player.stats.isHiding);

    // Nếu người chơi chạy nhanh (Sprint) tạo ra tiếng ồn bước chân
    if (this.player.stats.isSprinting) {
      this.stepNoiseTimer += delta;
      if (this.stepNoiseTimer >= 350) {
        this.stepNoiseTimer = 0;
        this.emitNoiseWave(this.player.x, this.player.y, 1.0);
        this.listenerMonster.hearSound(this.player.x, this.player.y, 1.0);
      }
    }
  }

  private emitNoiseWave(x: number, y: number, _vol: number): void {
    const wave = this.add.graphics();
    wave.lineStyle(1, 0x3498db, 0.7);
    wave.strokeCircle(x, y, 6);
    wave.setDepth(y);

    this.tweens.add({
      targets: wave,
      alpha: 0,
      scaleX: 2.8,
      scaleY: 2.8,
      duration: 500,
      onComplete: () => wave.destroy()
    });
  }

  private handleNoiseLureThrow(): void {
    if (this.keyQ && Phaser.Input.Keyboard.JustDown(this.keyQ)) {
      if (this.playerState.getItemCount('item_noise_lure') > 0) {
        this.playerState.removeItem('item_noise_lure', 1);
        this.throwNoiseLure();
      } else {
        if (this.uiScene) {
          this.uiScene.showPopupMessage('Không có Mồi Tạo Tiếng Động! Hãy chế tạo bằng [Phím I]');
        }
      }
    }
  }

  private throwNoiseLure(): void {
    let dirX = 0;
    let dirY = 0;
    if (this.player.facing === 'down') dirY = 1;
    else if (this.player.facing === 'up') dirY = -1;
    else if (this.player.facing === 'left') dirX = -1;
    else if (this.player.facing === 'right') dirX = 1;

    const targetX = this.player.x + dirX * 110;
    const targetY = this.player.y + dirY * 110;

    const lureG = this.add.graphics();
    lureG.fillStyle(0xe67e22, 1);
    lureG.fillCircle(0, 0, 4);
    lureG.setPosition(this.player.x, this.player.y - 10);
    lureG.setDepth(this.player.y + 10);

    this.tweens.add({
      targets: lureG,
      x: targetX,
      y: targetY,
      duration: 350,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.createLureDistraction(targetX, targetY);
        lureG.destroy();
      }
    });
  }

  private createLureDistraction(x: number, y: number): void {
    this.cameraSystem.shake(120, 0.004);

    if (this.uiScene) {
      this.uiScene.showPopupMessage('💥 Mồi nổ phát ra tiếng động lớn! Kẻ Lắng Nghe đang hướng tới vị trí đó!');
    }

    // Báo động The Listener chạy tới vị trí mồi ném
    if (this.listenerMonster) {
      this.listenerMonster.hearSound(x, y, 2.5);
    }

    const spark = this.add.graphics();
    spark.fillStyle(0xf39c12, 1);
    spark.fillCircle(x, y, 8);
    spark.setDepth(y);

    this.tweens.add({
      targets: spark,
      alpha: 0,
      scaleX: 3.0,
      scaleY: 3.0,
      duration: 1600,
      onComplete: () => spark.destroy()
    });
  }

  private startAct5EscapeChase(): void {
    this.isAct5ChaseActive = true;

    this.audioManager.playListenerAlert();
    this.audioManager.setHeartbeatActive(true, 420);

    this.cameraSystem.shake(900, 0.02);
    this.cameraSystem.flash(600, 160, 20, 20);

    if (this.uiScene) {
      this.uiScene.showPopupMessage('⚠️ TIẾNG CHUÔNG BỊ KHUẤY ĐỘNG! Kẻ Lắng Nghe đang lao tới! HÃY CHẠY VỀ LÀNG HOẶC NẤP TRONG THÂN CÂY!');
    }

    // Đưa The Listener tới gần lối thoát miếu chuông (X: 4200, Y: 260)
    if (this.listenerMonster) {
      this.listenerMonster.setPosition(4200, 260);
      this.listenerMonster.forceChase();
    }
  }

  private updateAct5ChaseLogic(): void {
    if (!this.isAct5ChaseActive) return;

    // Nếu Satyr đã chạy trốn thành công về làng Bellhollow (X <= 1400)
    if (this.player.x <= 1400 || this.currentZoneId === 'bellhollow') {
      this.isAct5ChaseActive = false;
      this.audioManager.setHeartbeatActive(false);

      // The Listener dừng lại ở bìa rừng phía đông làng
      if (this.listenerMonster) {
        this.listenerMonster.setPosition(1550, 280);
        this.listenerMonster.setVelocity(0, 0);
      }

      this.cameraSystem.shake(300, 0.006);
      if (this.uiScene) {
        this.uiScene.showPopupMessage('✔ BẠN ĐÃ THOÁT VỀ LÀNG AN TOÀN! Vòng phong ấn chuông ngăn cản Kẻ Lắng Nghe!');
      }

      this.playerState.completeQuestTask('Q06_RETRIEVE_CLAPPER', 't2');
      SaveManager.saveGame('HỒI 5: THOÁT THÀNH CÔNG VỀ LÀNG', 'bellhollow', this.player.x, this.player.y);
    }
  }

  private handleZoneLogic(): void {
    const footPos = this.player.getFootPosition();
    this.currentZoneId = this.worldBuilder.detectCurrentZone(footPos);

    if (this.currentZoneId !== this.previousZoneId) {
      this.previousZoneId = this.currentZoneId;
      const zoneData = this.worldBuilder.getActiveZone();
      if (zoneData && this.uiScene) {
        this.uiScene.showZoneBanner(zoneData.atmosphere);
        this.cameraSystem.shake(150, 0.003);
      }

      // Auto-save checkpoint khi chuyển zone (nếu không đang trong cuộc rượt đuổi)
      if (!this.isAct5ChaseActive) {
        const title = zoneData?.atmosphere.titleVietnamese || this.currentZoneId;
        SaveManager.saveGame(`KHU VỰC: ${title}`, this.currentZoneId, this.player.x, this.player.y);
      }
    }
  }

  private handleInteractions(): void {
    // PASS T13, T15, T16: Khi hộp thoại đang mở hoặc Modal (Chế tạo, Sổ tay, Tạm dừng) mở, BẮT BUỘC ẩn ngay lập tức nhãn gợi ý và nhãn NPC
    if (this.dialogueSystem.isActive || this.craftingModal.isOpen || this.journalModal.isOpen || this.pauseModal.isOpen) {
      if (this.uiScene) {
        this.uiScene.setDialogueActive(true);
      }
      for (const npc of this.npcs) {
        npc.setNearby(false);
      }
      return;
    }

    const px = this.player.x;
    const py = this.player.y;

    // 1. Kiểm tra NPC gần
    let nearbyNPC: NPCEntity | null = null;
    for (const npc of this.npcs) {
      const dist = Math.hypot(px - npc.spec.x, py - npc.spec.y);
      const isNear = dist <= 42;
      npc.setNearby(isNear);
      if (isNear) {
        nearbyNPC = npc;
      }
    }

    if (nearbyNPC) {
      if (this.uiScene) {
        this.uiScene.setInteractionPrompt(`[E] Trò chuyện với ${nearbyNPC.spec.name}`);
      }

      if (this.player.isInteractRequested() && !this.dialogueSystem.isActive) {
        let dKey = nearbyNPC.spec.dialogueKey;
        if (nearbyNPC.spec.id === 'npc_edda' && this.playerState.hasFlag('talked_to_edda')) {
          dKey = 'edda_reminder';
        } else if (nearbyNPC.spec.id === 'npc_neris' && this.playerState.hasFlag('talked_to_neris')) {
          dKey = 'neris_heal';
        }
        this.dialogueSystem.startDialogue(dKey);
      }
      return;
    }

    // 2. Kiểm tra thu hoạch tài nguyên (InventorySystem)
    if (this.player.isInteractRequested()) {
      const harvestResult = this.inventorySystem.checkHarvestNearby(px, py, 34);
      if (harvestResult) {
        if (this.uiScene) {
          this.uiScene.showPopupMessage(`Đã thu thập: ${harvestResult.itemName}`);
        }
        return;
      }
    }

    // 3. Kiểm tra các vật thể và câu đố trên bản đồ
    const nearby = this.worldBuilder.checkInteractableNearby(this.player.getFootPosition(), 42);
    if (nearby) {
      if (this.uiScene) {
        this.uiScene.setInteractionPrompt(nearby.promptText);
      }

      if (this.player.isInteractRequested()) {
        this.executeMapInteraction(nearby.actionId, nearby.name);
      }
    } else {
      if (this.uiScene) {
        this.uiScene.setInteractionPrompt(null);
      }
    }
  }

  private executeMapInteraction(actionId: string, name: string): void {
    this.cameraSystem.shake(100, 0.005);

    // Xử lý 3 Cột Đá Cổ Ngữ tại Silent Mire (Câu đố 2)
    if (actionId === 'touch_pillar_1') {
      this.handlePillarInteraction('pillar_moon');
    } else if (actionId === 'touch_pillar_2') {
      this.handlePillarInteraction('pillar_root');
    } else if (actionId === 'touch_pillar_3') {
      this.handlePillarInteraction('pillar_eye');
    } else if (actionId === 'collect_bell_tongue') {
      if (!this.playerState.hasFlag('clapper_collected')) {
        this.playerState.addItem('quest_bronze_clapper', 1);
        this.playerState.setFlag('clapper_collected');
        this.startAct5EscapeChase();
      } else {
        if (this.uiScene) {
          this.uiScene.showPopupMessage('Bệ đá cổ chỉ còn lại vết bụi đồng hoen rỉ.');
        }
      }
    } else if (actionId === 'inspect_bell') {
      if (this.playerState.getItemCount('quest_bronze_clapper') > 0) {
        if (this.uiScene) {
          this.uiScene.showPopupMessage('🔔 Satyr gắn Lưỡi Chuông Đồng vào quả chuông cổ làng Bellhollow...');
        }
        this.endingSystem.triggerTheFirstTollFinale();
      } else {
        if (this.uiScene) {
          this.uiScene.showPopupMessage('Quả chuông làng câm lặng vì thiếu Lưỡi Chuông Đồng!');
        }
      }
    } else if (actionId === 'hide_player') {
      this.player.stats.isHiding = !this.player.stats.isHiding;
      this.player.setVisible(!this.player.stats.isHiding);
      if (this.uiScene) {
        this.uiScene.showPopupMessage(
          this.player.stats.isHiding
            ? '🌿 Đang ẩn nấp an toàn trong Thân Cây / Bụi Rậm! Kẻ Lắng Nghe sẽ không thể nghe thấy bạn.'
            : 'Đã bước ra khỏi chỗ trốn.'
        );
      }
    } else {
      if (this.uiScene) {
        this.uiScene.showPopupMessage(`Đã tương tác với: ${name}`);
      }
    }
  }

  private handlePillarInteraction(pillarId: string): void {
    let noteIdx = 0;
    if (pillarId === 'pillar_root') noteIdx = 1;
    else if (pillarId === 'pillar_eye') noteIdx = 2;
    this.audioManager.playRunestoneResonance(noteIdx);

    const res = this.puzzleSystem.interactPillar(pillarId);
    if (this.uiScene) {
      this.uiScene.showPopupMessage(res.msg);
    }

    if (res.failed) {
      // Báo động The Listener lao đến kiểm tra tiếng gầm cột đá
      if (this.listenerMonster) {
        this.listenerMonster.hearSound(3520, 280, 2.5);
      }
      this.cameraSystem.shake(200, 0.01);
    } else if (res.solved) {
      this.cameraSystem.flash(400, 93, 173, 226);
      this.playerState.setFlag('mire_drained');
      this.playerState.completeQuestTask('Q05_SOLVE_MIRE', 't1');
      this.playerState.completeQuestTask('Q05_SOLVE_MIRE', 't2');
      this.playerState.completeQuestTask('Q05_SOLVE_MIRE', 't3');
      this.playerState.setCurrentQuest('Q06_RETRIEVE_CLAPPER');
      SaveManager.saveGame('HỒI 4: ĐẦM LẦY TĨNH LẶNG (ĐÃ GIẢI MÃ CỘT ĐÁ)', 'silent_mire', this.player.x, this.player.y);
    }
  }
```

> ⚠️ **LỖI HIỆU NĂNG 1: Garbage Collection Spike do `this.make.graphics()`**
- Tại dòng 984 trong `GameScene.ts`: Mỗi frame (60 lần/giây), hàm `updateFogOfWar()` gọi `const lightG = this.make.graphics();` rồi đến dòng 992 lại gọi `lightG.destroy();`.
- Việc cấp phát và hủy đối tượng Graphics liên tục 60 FPS tạo ra hàng nghìn object rác trong V8 Engine heap, kích hoạt Garbage Collection định kỳ gây ra hiện tượng khựng giật (micro-stutters) khi di chuyển.
- **Giải pháp:** Tái sử dụng một đối tượng Graphics duy nhất (`this.maskGraphics`) được khởi tạo một lần duy nhất trong `setupFogOfWar()`.

### B. Lặp lại 110 lệnh vẽ Arc/Circle mỗi Frame trong `updateFireflies` (`GameScene.ts`)
- Mảng `this.fireflies` chứa 55 hạt đom đóm. Mỗi frame, hàm `updateFireflies()` gọi `clear()` và vẽ 2 vòng tròn (`fillCircle` quầng mờ + `fillCircle` lõi sáng) cho từng hạt.
- Tổng cộng **110 lệnh vẽ vector Canvas/WebGL mỗi frame**. Cần hạn chế chỉ vẽ các hạt thực sự nằm trong Camera Viewport và giảm bớt số lượng hạt không cần thiết.

### C. Tái tạo Canvas ngầm liên tục qua `HDTextHelper.applyHD` (`HDTextHelper.ts`)
```typescript
/**
 * HOLLOW WOODS V3.0 - PASS T12
 * HD VIETNAMESE TYPOGRAPHY HELPER
 * Tiện ích chuẩn hóa hiển thị văn bản Tiếng Việt sắc nét chuẩn HD 100%
 */

import * as Phaser from 'phaser';

export const HD_FONT_FAMILY = '"Segoe UI", "Roboto", "Inter", system-ui, sans-serif';

export class HDTextHelper {
  /**
   * Chuẩn hóa style chữ với font chữ HD Tiếng Việt mặc định
   */
  public static formatStyle(style?: Phaser.Types.GameObjects.Text.TextStyle): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontFamily: HD_FONT_FAMILY,
      ...style
    };
  }

  /**
   * Áp dụng độ phân giải cao (setResolution = 2) và bộ lọc mượt mà (LINEAR) cho Text GameObject
   * Đồng thời tự động duy trì độ phân giải HD mỗi khi cập nhật chữ
   */
  public static applyHD(textObj: Phaser.GameObjects.Text, resolution: number = 2): Phaser.GameObjects.Text {
    textObj.setResolution(resolution);
    if (textObj.texture) {
      textObj.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    }

    // Ghi đè phương thức setText để tự động làm mới bộ lọc và độ phân giải khi chuỗi ký tự thay đổi
    const originalSetText = textObj.setText.bind(textObj);
    textObj.setText = function (value: string | string[]) {
      const result = originalSetText(value);
      textObj.setResolution(resolution);
      if (textObj.texture) {
        textObj.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
      }
      return result;
    };

    return textObj;
  }

  /**
   * Tạo nhanh đối tượng Phaser.GameObjects.Text chuẩn HD hỗ trợ tiếng Việt
   */
  public static createText(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string | string[],
    style?: Phaser.Types.GameObjects.Text.TextStyle,
    resolution: number = 2
  ): Phaser.GameObjects.Text {
    const formattedStyle = this.formatStyle(style);
    const textObj = scene.add.text(x, y, text, formattedStyle);
    return this.applyHD(textObj, resolution);
  }

  /**
   * Cập nhật nội dung văn bản và làm mới bộ lọc Linear Filter
   */
  public static updateText(
    textObj: Phaser.GameObjects.Text,
    text: string | string[],
    resolution: number = 2
  ): void {
    textObj.setText(text);
    textObj.setResolution(resolution);
    if (textObj.texture) {
      textObj.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    }
  }
}
```

> ⚠️ **LỖI HIỆU NĂNG 2: `setText` ghi đè gọi `setResolution(2)` liên tục**
- Trong `HDTextHelper.ts` dòng 34-40: `textObj.setText` được bọc để gọi lại `textObj.setResolution(resolution)` và `textObj.texture.setFilter(LINEAR)` mỗi khi cập nhật chuỗi ký tự.
- Trong Phaser 3, mỗi lần gọi `setResolution()`, Phaser sẽ **hủy và tạo mới toàn bộ thẻ HTML5 Canvas ngầm** của Text GameObject đó!
- Khi hộp thoại chạy hiệu ứng đánh máy (Typewriter effect cứ 22ms thêm 1 chữ) hoặc khi DebugOverlay / HUD cập nhật số máu/stamina mỗi frame, bộ nhớ GPU bị nghẽn do liên tục tái phân bổ canvas texture!


---

## 7. BẢNG TỔNG HỢP NGUYÊN NHÂN & KIẾN NGHỊ HÀNH ĐỘNG

| # | Vấn đề quan sát | Nguyên nhân kỹ thuật gốc rễ | Giải pháp kiến trúc đề xuất |
|:---:|---|---|---|
| **1** | Hộp thoại không xuất hiện khi bấm [E], người chơi bị đơ | `DialogueSystem` tạo trong `GameScene` (Zoom 2.2×). Container đặt tại (640, 590) bị phóng to và trôi xuống Y = 866 px (ngoài màn hình). | Chuyển `DialogueSystem` sang quản lý bên trong `UIScene` (Camera Zoom 1.0 cố định), hiển thị chuẩn tọa độ (640, 590) không bị ảnh hưởng bởi camera zoom. |
| **2** | Mặt đất bị ô vuông đen chằng chịt, mất khu rừng | `tile_forest_grass.png` bị cắt nhầm vào ô bụi cây có bóng đổ đen từ `forest_Tileset`. Cây cối đặt thưa thớt (180px). | Trích xuất lại tile cỏ mượt 32×32 từ `TX Tileset Grass.png`. Tăng mật độ cây và bụi rậm trong `WorldBuilder.ts`. |
| **3** | Nhân vật di chuyển bị khựng, sai frame | Các frame trong `satyr_animations.json` không khớp với vị trí hoạt ảnh thực tế trong `satyr_sheet.png`. Đi chéo giật hướng. | Chuẩn hóa lại bảng frame mapping cho 4 hướng và thêm cờ kiểm tra hướng ổn định khi đi chéo. |
| **4** | Game bị khựng giật micro-stutters khi di chuyển | `this.make.graphics()` tạo mới và `destroy()` mỗi frame trong `updateFogOfWar`. `setText` tái tạo canvas liên tục. | Tái sử dụng một đối tượng Graphics tĩnh cố định. Bỏ lệnh `setResolution` trong hook `setText` của `HDTextHelper`. |

---
*Báo cáo được khởi tạo tự động bởi Principal QA & Systems Auditor — HOLLOW WOODS V3.0 (Ngày 14/11/2026).*
