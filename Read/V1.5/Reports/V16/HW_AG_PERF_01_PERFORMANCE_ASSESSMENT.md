# HW-AG-PERF-01 — GAME PERFORMANCE ASSESSMENT & OPTIMIZATION ROADMAP
**Dự án:** HOLLOW WOODS V1.6.1 (Baseline đo trên V1.6.0 `feat/v1.6-competition-preview`)\
**Ngày:** 27/11/2026 (18:38 ICT)\
**Chế độ:** Read-only Audit & Roadmap (Không chỉnh sửa mã nguồn, không hạ chất lượng đồ họa/âm thanh)\

---

## 1. SỐ LIỆU BASELINE THỰC TẾ (CHROME HEADLESS CDP — `--disable-gpu` MÔ PHỎNG MÁY YẾU)

> Lưu ý: Đo bằng `requestAnimationFrame` delta trong môi trường phần mềm (`--disable-gpu` SwiftShader) để lộ rõ bottleneck CPU/GPU fill-rate trên máy cấu hình thấp.

| Phân cảnh / Khu vực | FPS TB | Frame TB (ms) | Frame P95 (ms) | Frame Max (ms) | Textures | `gsChildren` | JS Heap Used / Total (MB) |
|---|---:|---:|---:|---:|---:|---:|---:|
| `MainMenuScene` | **58.7** | 17.04 | 16.80 | 49.90 | 179 | 0 | 209.37 / 221.76 |
| `fog_crossing` | **35.8** | 27.94 | 33.50 | **116.70** | 531 | 1,224 | 238.56 / 269.44 |
| `bellhollow` | **33.7** | 29.69 | 33.40 | 50.00 | 531 | 1,224 | 244.41 / 270.19 |
| `outer_woods` | **37.5** | 26.70 | 33.40 | 33.40 | 531 | 1,224 | 237.15 / 270.94 |
| `crooked_path` | **34.9** | 28.67 | 33.40 | 49.90 | 531 | 1,224 | 251.82 / 270.94 |
| `silent_mire` | **36.1** | 27.68 | 33.40 | 50.00 | 531 | 1,224 | 245.44 / 271.19 |

---

## 2. PHÂN TÍCH BOTTLENECK CHÍNH

### 2.1. Nguyên nhân `GPU stall due to ReadPixels` trong nhật ký P2Game Portal
- Trong source hiện có **16 lời gọi `Graphics.generateTexture(...)`** (`PreloadScene.ts:164, 936` cho `'dummy_transparent'`, `BlackKnightPlayer.ts:251`, `UIScene.ts:284`, `InventorySystem.ts:59`, `MiniMapWidget.ts:113, 227`, `QuickCraftSidebar.ts:110`, và 7× trong `HUDIconGenerator.ts`).
- `PreloadScene.ts:164` chạy ngay khi khởi tạo WebGL (khớp đúng vị trí xuất hiện cảnh báo `GPU stall due to ReadPixels` ngay sau banner `Phaser v4.2.1` trên log Portal).
- Trong WebGL, `Graphics.generateTexture()` dựng vào framebuffer rồi đọc ngược pixel / đồng bộ GPU→CPU, gây stall pipeline.

### 2.2. Nạp toàn bộ 13 phân khu & 531 textures cùng lúc (`WorldBuilder.ts`)
- Khi vào `GameScene`, `texturesCount` tăng vọt từ **179 → 531** (`+352` textures) và `gsChildren = 1,224`.
- Toàn bộ 13+ canvas `ground_baked` (`textures.createCanvas(...)`) được tạo/giữ suốt phiên chơi; **chưa có lời gọi `this.scene.textures.remove(...)`** khi rời phân khu (`0` kết quả `textures.remove` trong `src/`).

### 2.3. Chi phí RenderTexture `fogOfWarLayer` & Particles/Lighting
- `GameScene.ts:6718–6783` đã có *Dirty Checking* và *Light Frustum Culling*, nhưng mỗi khi nhân vật di chuyển (`screenX/Y` đổi > `0.25px`) vẫn thực hiện `clear() + fill() + erase()` trên `RenderTexture` kích thước tới `1280×720` (tùy `GraphicsQualitySystem`). Trên GPU tích hợp/máy yếu, fill-rate toàn màn hình chiếm phần lớn frame time (~28ms/frame).

### 2.4. Tài nguyên tải trước & dung lượng gói (`public/assets/`)
- `PreloadScene.ts` gọi **215** lệnh `this.load.*` upfront.
- Tổng `public/assets/`: **~74.4 MB** (`audio`: **67.62 MB / 65 tệp** chiếm ~91%, `characters`: 5.77 MB / 84 tệp, `ui`: 0.42 MB, `environment`: 0.31 MB, `atlases`: 0.24 MB, `buildings`: 0.10 MB).
- `public/media/` còn 6 ảnh legacy không tham chiếu trong `p2game.json` (đã được `validate_p2game_build.mjs` cảnh báo nhẹ).

---

## 3. ROADMAP TỐI ƯU ĐỀ XUẤT (KHÔNG HẠ CHẤT LƯỢNG ĐỒ HỌA/ÂM THANH)

| Ưu tiên | Hạng mục tối ưu | Cách thực hiện kỹ thuật | Lợi ích dự kiến | Rủi ro & Kiểm soát |
|---|---|---|---|---|
| **P0** | **Khử `GPU stall due to ReadPixels`** | Thay 16 chỗ `Graphics.generateTexture()` (trước hết là `PreloadScene`, `HUDIconGenerator`, `QuickCraftSidebar`, `MiniMapWidget`) bằng `textures.createCanvas()` + `ctx` 2D + `canvasTex.refresh()` (chỉ upload `texImage2D`, không readback). | Xóa hoàn toàn cảnh báo `ReadPixels` stall khi boot & giảm hitch `116.7ms` đầu game. | Thấp — chỉ đổi cách tạo texture tĩnh, giữ nguyên pixel output. |
| **P1** | **Giải phóng `ground_baked` khi chuyển khu vực** | Trong `WorldBuilder.ts`, giữ cache tối đa `2–3` khu vực gần nhất (LRU) và gọi `this.scene.textures.remove(oldKey)` cho các phân khu xa. | Giảm VRAM & áp lực GC (~245 MB → <195 MB JS Heap + giảm texture count). | Thấp — cần test kỹ quay lại khu cũ (rebuild nhanh <15ms). |
| **P1** | **Tối ưu `fogOfWarLayer` mặc định trên máy yếu** | Tự động chọn `lightingScale = 0.5` (buffer `640×360` scale linear lên `1280×720`) khi FPS trung bình `< 45 FPS` trong 3s đầu, và throttle cập nhật FOW ở `30 Hz` nếu tốc độ di chuyển nhỏ. | Giảm **~75% pixel fill-rate** của `RenderTexture`, kéo máy yếu từ `34–37 FPS` lên **55–60 FPS**. | Thấp — sương mù vốn mềm (`fog_smooth`), scale 0.5x gần như không thấy khác biệt bằng mắt. |
| **P2** | **Gộp Atlas cho `environment/` (73 tệp) & dọn 6 ảnh `public/media/` thừa** | Đóng gói các `foliage/props/pickups` nhỏ lẻ vào 1 texture atlas để giảm WebGL texture binds / draw calls; xóa 6 ảnh legacy ở `public/media/` sau khi Owner duyệt. | Giảm batch breaks trong `GameScene` và giảm ~1–2 MB gói tải. | Trung bình — cần giữ nguyên key alias trong `PreloadScene`. |
| **P2** | **Kết hợp `HW-AUDIO-T00` (Audio Compression)** | Nén 45 tệp `.wav` (`23.61 MB`) sang `.ogg/.mp3` và chuẩn hóa BGM `160 kbps` (sau cuộc thi). | Giảm tải giải mã RAM & gói tải `79.5 MB → ~48 MB`. | Thấp nếu nghe kiểm định trước khi thay. |

---

## 4. ĐÁNH GIÁ VẬN HÀNH TRÊN MÁY CẤU HÌNH THẤP

- **Hiện trạng:** Trên máy không có GPU rời (mô phỏng `--disable-gpu`), menu đạt **58.7 FPS**, nhưng vào gameplay chỉ đạt **33.7 – 37.5 FPS** (`~28 ms/frame`), kèm spike `116.7 ms` lúc khởi tạo `fog_crossing`.
- **Sau khi áp dụng P0 + P1 (không hạ chất lượng mỹ thuật):** Dự kiến giải quyết triệt để spike `ReadPixels` và giảm tải fill-rate/VRAM đủ để máy cấu hình thấp (iGPU / laptop văn phòng) duy trì **50–60 FPS ổn định**.

> ⏸️ **Hoàn tất kiểm toán hiệu năng (Read-only). Dừng chờ Owner nghiệm thu và phê duyệt trước khi triển khai các bước P0/P1 cho V1.6.1.**
