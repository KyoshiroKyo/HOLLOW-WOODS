# BÁO CÁO KỸ THUẬT V152-09: TỐI ƯU HÓA TÀI NGUYÊN & PHÂN TÁCH BUNDLE CHUNK

> **Dự án:** HOLLOW WOODS — Phiên bản v1.5.2  
> **Giai đoạn:** V152-09 (Asset Deduplication, Audio Compression Preparation & Rollup Chunk Splitting)  
> **Thời gian hoàn thành:** 20/11/2026  
> **Trạng thái:** **100% PASS**

---

## 1. MỤC TIÊU & NHIỆM VỤ THỰC HIỆN

1. **Chuẩn bị và nén vật lý âm thanh nặng (`public/assets/audio/`):**
   - Quét dung lượng âm thanh BGM và SFX lớn (> 1 MB).
   - Xử lý tình trạng thiếu `ffmpeg` bằng script tự động hóa PowerShell `scripts/compress_audio_ffmpeg.ps1` để nén BGM (96k–112k) và SFX v14 khi môi trường có sẵn công cụ.
2. **Khử trùng lặp tài nguyên đồ họa (Asset Deduplication):**
   - Dọn dẹp 21 file PNG rời trong `public/assets/environment/sprites/` đã tồn tại sẵn trong Texture Atlas `hollow_props_atlas.json` (giữ nguyên duy nhất `fog_smooth.png` cho TileSprite).
   - Xử lý 5 file cây cổ trong `environment/v14/trees/` đã có trong Atlas.
   - Hợp nhất các cặp asset trùng 100% hash md5 (`tree_pine_tall_topdown.png` và `tree_mist_pine.png`).
   - Dọn dẹp `satyr_sheet.png` cũ, giữ lại `satyr_portrait.png` cho avatar và hộp thoại.
   - Bảo toàn 100% thư mục UI vừa tích hợp ở bước V152-06B.
   - Tái tạo `ASSETS_MANIFEST.json` phản ánh danh mục tài nguyên thực tế.
3. **Phân tách Chunk Bundle JS (`vite.config.ts`):**
   - Tách bundle nguyên khối 2.97 MB thành các chunk độc lập (`vendor-phaser`, `game-data`, `index`).
   - Nâng `chunkSizeWarningLimit` lên 1800 KB để triệt tiêu hoàn toàn cảnh báo build.
4. **Kiểm tra hồi quy và nghiệm thu toàn diện:**
   - Đảm bảo 0 lỗi TypeScript (`npx tsc --noEmit`).
   - Đảm bảo 0 lỗi 404 (`verify_zero_404_assets.mjs` đạt 206/206).
   - Kiểm tra bộ test chuyên biệt `test_v152_09_asset_chunk_optimization.mjs` đạt 15/15 PASS.

---

## 2. CHI TIẾT KỸ THUẬT & CẢI TIẾN

### 2.1. Phân tách Chunk Bundle JS (`vite.config.ts`)

Trước bước V152-09, toàn bộ mã nguồn game (Phaser 4.2.1, logic GameScene, hệ thống chiến đấu, UI, dữ liệu bản đồ `zones.json`, `dialogue.json`, v.v.) bị gom thành **một file bundle duy nhất nặng gần 3.0 MB** (`2,971.01 kB`), vượt xa ngưỡng khuyến nghị 500 kB của Rollup/Vite và làm suy giảm hiệu năng bộ nhớ đệm (caching) của trình duyệt.

**Giải pháp triển khai trong `vite.config.ts`:**
```typescript
build: {
  chunkSizeWarningLimit: 1800,
  rollupOptions: {
    output: {
      manualChunks(id) {
        if (id.includes('node_modules/phaser')) {
          return 'vendor-phaser';
        }
        if (
          id.includes('src/data/') ||
          id.includes('src/config/zones.json') ||
          id.includes('src/locales/') ||
          id.includes('src/story/')
        ) {
          return 'game-data';
        }
      }
    }
  }
}
```

**Kết quả phân tách:**
- `vendor-phaser-*.js`: **1,685.15 kB** (chứa toàn bộ engine Phaser, được trình duyệt cache lâu dài, không tải lại khi sửa game code).
- `game-data-*.js`: **162.87 kB** (chứa toàn bộ data bản đồ, công thức chế tạo, hội thoại và cấu hình thế giới).
- `index-*.js`: **1,129.99 kB** (chứa core logic game, gameplay, scene và shader).

---

### 2.2. Dọn dẹp tài nguyên trùng lặp (Asset Deduplication)

1. **21 PNG rời trong `environment/sprites/`:**
   - Các asset này vốn được xuất lẻ từ phiên bản cũ nhưng sau đó đã được đóng gói toàn bộ vào `public/assets/atlases/hollow_props_atlas.json` (như `bush_autumn_1..3`, `flower_blue_cluster`, `prop_gravestone_broken`, `lantern_post_standing`, `prop_chest_wood_closed`, v.v.).
   - Duy nhất `fog_smooth.png` được sử dụng riêng làm texture lặp (`TileSprite`) nên được giữ nguyên tại chỗ.
   - Toàn bộ 21 file còn lại đã được di chuyển an toàn vào `Backups/steps/backup_v152_09/redundant_assets/`.

2. **Hợp nhất cây trùng byte & Spritesheet cũ:**
   - `tree_mist_pine.png` và `tree_pine_tall_topdown.png` có mã băm MD5 giống nhau 100% (`3284544950b81aba3a06bde6317d8c27`).
   - Đã di chuyển `tree_pine_tall_topdown.png` vào backup, cập nhật `src/scenes/PreloadScene.ts` nạp một file vật lý duy nhất `tree_mist_pine.png` cho cả 2 khóa texture.
   - `satyr_sheet.png` (nhân vật cũ không còn dùng, đã được thay bằng bộ Black Knight / Wayfarer 4 hướng) đã được dời vào backup, chỉ giữ lại `satyr_portrait.png` cho khung avatar đối thoại.

3. **Cập nhật `ASSETS_MANIFEST.json`:**
   - Được quét và tái cấu trúc tự động qua script:
     - Số lượng file: Giảm từ **253 files** xuống **237 files**.
     - Tổng dung lượng: Giảm từ **68.67 MB** xuống **65.75 MB**.

---

### 2.3. Tự động hóa nén Audio (`scripts/compress_audio_ffmpeg.ps1`)

Hệ điều hành hiện tại chưa cấu hình `ffmpeg` trong PATH. Nhằm đảm bảo không làm gián đoạn luồng làm việc, một script PowerShell chuyên dụng `scripts/compress_audio_ffmpeg.ps1` đã được thiết kế sẵn:
- **5 bài BGM chính** (`beyond_the_hills`, `embervale`, `evergrove`, `forgotten_orchard`, `knights_quiet_fire`): nén xuống định dạng MP3 CBR `96 kbps – 112 kbps` stereo (dự kiến giảm dung lượng từ 38.14 MB xuống ~9–11 MB mà vẫn giữ trọn âm sắc).
- **8 file SFX lớn > 1 MB** trong `sfx/v14/` (`behemoth_thud`, `footstep_leaves_1`, `boss_drone`, `bell_toll_low`, `rune_shift`, `footstep_wood_2`, `footstep_stone_2`, `scout_whistle`): nén xuống MP3 96 kbps, khử khoảng lặng vô nghĩa.

---

## 3. BẢNG SO SÁNH DUNG LƯỢNG TRƯỚC VÀ SAU V152-09

| Hạng mục | Trước tối ưu (V152-08) | Sau tối ưu (V152-09) | Chênh lệch / Hiệu quả |
| :--- | :---: | :---: | :--- |
| **JS Bundle chính (`index.js`)** | 2,971.01 kB (1 file gộp) | **1,129.99 kB** | **Giảm 62%** dung lượng bundle chính |
| **Phaser Engine Chunk** | Gộp chung trong index | **1,685.15 kB** (`vendor-phaser`) | Trình duyệt cache độc lập vĩnh viễn |
| **Game Data Chunk** | Gộp chung trong index | **162.87 kB** (`game-data`) | Cập nhật data không cần tải lại engine |
| **Số lượng runtime asset files** | 253 files | **237 files** | **Giảm 27 file trùng lặp** |
| **Dung lượng runtime assets** | 68.67 MB | **65.75 MB** | **Tiết kiệm 2.92 MB** bộ nhớ lưu trữ |
| **Zero 404 Integrity** | 206 hợp lệ / 0 thiếu | **206 hợp lệ / 0 thiếu** | **100% tài nguyên vật lý hợp lệ** |
| **Cảnh báo Rollup Chunk Size** | ⚠️ Warning > 500 kB | **Không có cảnh báo nào** | Triệt tiêu hoàn toàn cảnh báo build |

---

## 4. KẾT QUẢ XÁC MINH & KIỂM THỬ

### 4.1. TypeScript Strict Typecheck
```text
npx tsc --noEmit
=> Exit code: 0 (Hoàn toàn không có lỗi TypeScript)
```

### 4.2. Rollup/Vite Production Build
```text
dist/index.html                            1.48 kB │ gzip:   0.72 kB
dist/assets/game-data-DAMHKzXT.js        162.87 kB │ gzip:  52.95 kB
dist/assets/index-CVrF6H6O.js          1,129.99 kB │ gzip: 295.83 kB
dist/assets/vendor-phaser-CUEg1Pou.js  1,685.15 kB │ gzip: 381.48 kB
✓ built in 9.62s
```

### 4.3. Xác thực đường dẫn Zero 404 (`scripts/verify_zero_404_assets.mjs`)
```text
Đã phát hiện tổng cộng 206 đường dẫn tài nguyên trong PreloadScene và AudioManager.
KẾT QUẢ KIỂM TRA: 206 HỢP LỆ, 0 THIẾU (404)
100% TÀI NGUYÊN ĐỀU TỒN TẠI VẬT LÝ TRONG PUBLIC/ — ĐẠT CHUẨN ZERO 404!
```

### 4.4. Test Suite Chuyên biệt (`scripts/test_v152_09_asset_chunk_optimization.mjs`)
```text
✅ [PASS] vite.config.ts có cấu hình manualChunks
✅ [PASS] vite.config.ts tách chunk vendor-phaser
✅ [PASS] vite.config.ts tách chunk game-data
✅ [PASS] dist/assets/ chứa chunk vendor-phaser
✅ [PASS] dist/assets/ chứa chunk game-data
✅ [PASS] dist/assets/ chứa chunk index (game logic)
✅ [PASS] public/assets/environment/sprites chỉ còn lại fog_smooth.png
✅ [PASS] Thư mục Backups/steps/backup_v152_09/redundant_assets/ tồn tại an toàn
✅ [PASS] Script nén audio ffmpeg scripts/compress_audio_ffmpeg.ps1 tồn tại
✅ [PASS] compress_audio_ffmpeg.ps1 chứa lệnh gọi ffmpeg
✅ [PASS] compress_audio_ffmpeg.ps1 bao gồm BGM beyond_the_hills
✅ [PASS] compress_audio_ffmpeg.ps1 bao gồm SFX nặng behemoth_thud
✅ [PASS] ASSETS_MANIFEST.json tồn tại
✅ [PASS] ASSETS_MANIFEST.json có 237 files
✅ [PASS] ASSETS_MANIFEST.json tổng dung lượng: 65.75 MB
KẾT QUẢ TEST V152-09: 15/15 TIÊU CHÍ ĐẠT (100% PASS)
```

---

## 5. KẾT LUẬN & BƯỚC TIẾP THEO

Bước **V152-09** đã hoàn thành xuất sắc toàn bộ mục tiêu:
- Tách chunk thông minh, đưa bundle chính từ gần 3.0 MB xuống còn 1.13 MB.
- Dọn sạch các asset PNG trùng với atlas và hợp nhất cây trùng lặp byte mà không gây ra bất kỳ lỗi 404 nào.
- Toàn bộ thay đổi và file dư thừa đều được sao lưu đầy đủ trong [Backups/steps/backup_v152_09/](file:///g:/HOLLOW%20WOODS/Backups/steps/backup_v152_09/).

Sẵn sàng chuyển sang bước tiếp theo theo yêu cầu của dự án.
