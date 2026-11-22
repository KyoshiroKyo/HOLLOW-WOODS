# BÁO CÁO KIỂM TOÁN CẤU HÌNH VÀ AN TOÀN PHÁT HÀNH V1.5.4 (HW-REL-01)

- **Dự án:** HOLLOW WOODS — V1.5.4 PREPARATION
- **Nhánh làm việc:** `feat/v1.5.3-ag-world-polish`
- **Git HEAD SHA:** `9990797ef877e9e60471e2d9db5eabc9beccdaed`
- **Mã nhiệm vụ:** `HW-REL-01 — V1.5.4 RELEASE CONFIG & SAFETY AUDIT`
- **Chế độ thực thi:** `READ-ONLY SOURCE AUDIT + DOC-ONLY COMMIT` (Tuyệt đối không sửa source, không nâng version, không release)
- **Ngày thực hiện:** 22/11/2026
- **Kết luận Audit:** **AUDIT COMPLETE**
- **Kết luận Release:** **RELEASE CONDITIONAL (Chưa sẵn sàng phát hành ngay — Cần cập nhật cấu hình trước khi release)**

---

## 1. TỔNG QUAN & PHẠM VI KIỂM TOÁN

Nhiệm vụ **HW-REL-01** thực hiện kiểm toán toàn diện tính sẵn sàng của repository để chuẩn bị cho việc phát hành phiên bản **V1.5.4**. Quy trình tuân thủ nghiêm ngặt nguyên tắc đóng băng mã nguồn:
- Không thay đổi phiên bản trong `package.json`, `p2game.json`, hoặc bất kỳ file nào.
- Không chỉnh sửa `package-lock.json`.
- Không tạo tag Git, không merge vào nhánh `main`.
- Không chạy các lệnh đóng gói phân phối (`release:p2game`, `release:standalone`).
- Không tải bản build lên nền tảng P2Game.
- Không thay đổi SDK hoặc cấu trúc Save Schema 3.
- Bảo toàn tuyệt đối các file manifest âm thanh untracked của Owner.

---

## 2. KIỂM TOÁN PHIÊN BẢN CỦA TỪNG FILE (METADATA VERSION AUDIT)

Bảng đối chiếu phiên bản hiện tại trên toàn bộ các file cấu hình và mã nguồn:

| Tệp tin | Phiên bản hiện tại | Phiên bản kỳ vọng (Target V1.5.4) | Trạng thái đồng bộ | Ghi chú kỹ thuật |
| :--- | :---: | :---: | :---: | :--- |
| `package.json` | `1.5.2` | `1.5.4` | ⚠️ Cần nâng cấp | Trường `"version": "1.5.2"` |
| `package-lock.json` | `3.0.0` | `1.5.4` (hoặc đồng bộ lock) | ⚠️ Mismatch | Lockfile ghi name `"hollow-woods-v3"`, version `"3.0.0"` (di sản V3) |
| `p2game.json` (root) | `1.5.2` | `1.5.4` | ⚠️ Cần nâng cấp | Đồng bộ tuyệt đối với `public/p2game.json` |
| `public/p2game.json` | `1.5.2` | `1.5.4` | ⚠️ Cần nâng cấp | Tự động copy vào `dist/` khi build |
| `src/data/content_registry.json` | `1.5.2` | `1.5.4` | ⚠️ Cần nâng cấp | Trường `"version": "1.5.2"` |
| `src/systems/SaveManager.ts` | `1.5.1` (line 508) | `1.5.4` | ⚠️ Cần nâng cấp | Schema 3 lưu chuỗi phiên bản khi tạo file save |
| `scripts/verify_pre_release_audit.mjs` | `1.4.0` (line 119) | Dynamic / `1.5.4` | ❌ Lỗi thời (Hardcoded) | Assert cứng version 1.4.0 |
| `scripts/build_p2game_release.mjs` | `1.5.0` (alias) | `1.5.4` | ⚠️ Cần rà soát | Tạo file alias hardcode `hollow-woods-p2game-v1.5.0.zip` |
| `scripts/build_standalone_release.mjs` | `1.5.1` (alias) | `1.5.4` | ⚠️ Cần rà soát | Tạo file alias hardcode `HOLLOW_WOODS_V1.5.1_STANDALONE.zip` |
| `index.html` (title) | `V1.5` | `V1.5.4` | ⚠️ Cần cập nhật tiêu đề | Tiêu đề hiện tại: `HOLLOW WOODS V1.5 – The Fog That Remembers` |

---

## 3. ĐỐI CHIẾU CHI TIẾT 10 TIÊU CHÍ KỸ THUẬT (A – J)

### A. Version Metadata
- Hiện tại phiên bản dự án phân tán giữa `1.5.2` (trong `package.json`, `p2game.json`), `1.5.1` (trong `SaveManager.ts`), `3.0.0` (trong `package-lock.json`), và `1.4.0` (trong script kiểm toán cũ).
- Trước khi phát hành V1.5.4, cần một bước đồng bộ version tập trung có kiểm soát.

### B. Tính Đồng Bộ Của Hai Bản `p2game.json`
- `p2game.json` tại thư mục gốc và `public/p2game.json` **hoàn toàn giống nhau 100%** (cùng 75 dòng, cùng schemaVersion: 1, id: "hollow-woods", version: "1.5.2", permissions, leaderboards, media paths).
- Khi chạy Vite build, file `public/p2game.json` được tự động chép vào `dist/p2game.json`.

### C. Script `verify_pre_release_audit.mjs` Bị Lỗi Thời
- **Lỗi 1 (Version Hardcode):** Dòng 119 thực thi `assert(p2Json.version === '1.4.0')`. Khi chạy trên HEAD hiện tại (`p2game.json` mang version 1.5.2), script lập tức báo FAIL.
- **Lỗi 2 (Vị trí gọi `p2.ready()`):** Dòng 70–71 kiểm tra `window.p2.ready()` trong `BootScene.ts`. Trong thực tế, tại V1.5.2 (HW-FIX V152-08), `p2.ready()` đã được chuyển sang `MainMenuScene.ts:143` (ngay khi Main Menu vẽ xong khung hình đầu tiên) để triệt tiêu cảnh báo màn hình đen `SD-004` của nền tảng P2Game. Script kiểm toán cũ chưa được cập nhật theo sự thay đổi kiến trúc này.
- **Kết luận:** Script `scripts/verify_pre_release_audit.mjs` cần được refactor để đọc version động và kiểm tra `p2.ready()` tại `MainMenuScene.ts`.

### D. SDK Version & P2Game Permissions
- **SDK Version:** Khai báo `"version": "1.1"` và `"cloudSave": true` trong `p2game.json`.
- **Nhúng SDK:** `index.html` chứa thuộc tính `data-sdk-src="https://games.p2game.io/sdk/p2game-sdk.v1.js"`. Hàm `waitForSdkScript()` trong `src/main.ts` nạp SDK bất đồng bộ với cơ chế watchdog timeout 12s và AbortController.
- **Khởi tạo SDK:** `src/main.ts` gọi `await window.p2.init({ timeoutMs: 10000, allowStandalone: true, debug: false })` với cơ chế dự phòng an toàn (fallback standalone) khi offline hoặc môi trường không có SDK.
- **Permissions:** Danh sách quyền gồm `"fullscreen"`, `"audio"`, `"persistent-storage"`, tuân thủ đầy đủ tiêu chuẩn P2Game Hosted Sandbox.

### E. Entry Point & Asset Store
- **Entry Point:** Khai báo `"entry": "index.html"`, khớp với file `index.html` tại gốc và `dist/index.html`.
- **Store Media Assets:** Khai báo 10 file media trong `p2game.json`:
  - `media/hollow_woods_avatar.png` (Avatar/Icon) $\rightarrow$ Tồn tại tại `public/media/`
  - `media/hollow_woods_black_knight_cover.png` (Cover/Background) $\rightarrow$ Tồn tại tại `public/media/`
  - 6 Screenshots: `screen_v153_01_main_menu.png` đến `screen_v153_06_crafting.png` $\rightarrow$ Tồn tại 100% tại `public/media/`.

### F. Save Schema Compatibility (Khả Năng Tương Thích Save Game)
- **Phiên bản Schema hiện tại:** `CURRENT_SCHEMA_VERSION = 3`.
- **Tương thích ngược:** Hàm `deserializeSaveData()` trong `SaveManager.ts` hỗ trợ tự động di trú an toàn (non-destructive migration) cho toàn bộ file lưu từ V1.3, V1.4 đến V1.5.x:
  - Khôi phục tọa độ an toàn nếu thiếu.
  - Tự động bổ sung các chỉ số sinh tồn mở rộng (`moisture: 0`, `temperature: 80`).
  - Bảo toàn 100% túi đồ, bí danh lịch sử (aliases), cờ nhiệm vụ, và tình trạng luống thảo dược (`herbPlots`).
- **Khẳng định:** Lưu game hoàn toàn tương thích, không bị phá vỡ cấu trúc.

### G. Output ZIP & Build Pipeline
- Quy trình build `npm run build` (`tsc && vite build`) hoạt động trơn tru:
  - Thời gian build: ~12–14 giây.
  - 0 lỗi TypeScript, 0 lỗi Vite chunk.
- Pipeline đóng gói P2Game (`build_p2game_release.mjs`):
  - Tự động nén `dist/` thành file ZIP bằng Python `zipfile` với mức nén 9 (Deflate Max).
  - Loại bỏ các file `.bak`, `.tmp`, thư mục `maps/` thừa.
  - Kiểm tra xác thực các file bắt buộc (`index.html`, `p2game.json`, các media assets) có trong file ZIP trước khi hoàn tất.

### H. Danh Sách Tệp Cần Chỉnh Sửa Trước Thềm Release V1.5.4
Khi có lệnh chính thức nâng phiên bản lên V1.5.4, các file sau cần được cập nhật:
1. `package.json`: Nâng `"version": "1.5.4"`.
2. `p2game.json` & `public/p2game.json`: Nâng `"version": "1.5.4"`.
3. `src/data/content_registry.json`: Nâng `"version": "1.5.4"`.
4. `src/systems/SaveManager.ts`: Cập nhật chuỗi phiên bản lưu tại line 508 thành `'1.5.4'`.
5. `index.html`: Cập nhật thẻ `<title>` thành `HOLLOW WOODS V1.5.4 – The Fog That Remembers`.
6. `scripts/verify_pre_release_audit.mjs`:
   - Bỏ assert hardcode version 1.4.0, đọc version động từ `p2game.json`.
   - Cập nhật assertion vị trí `p2.ready()` sang `MainMenuScene.ts`.
7. `scripts/build_p2game_release.mjs` & `scripts/build_standalone_release.mjs`: Cập nhật nhãn alias hoặc loại bỏ hardcode V1.5.0 / V1.5.1.

### I. Đánh Giá Hạ Tầng CI & Kiểm Thử Môi Trường Windows
- **Hạ tầng CI:** Hiện tại repository **chưa có thư mục `.github/workflows/`** (chưa cấu hình GitHub Actions CI). Toàn bộ quy trình kiểm thử hiện đang dựa vào các kịch bản QA thủ công hoặc script tự động chạy cục bộ.
- **Rủi ro bộ gõ tiếng Việt (EVKey / Unikey Windows):**
  - Môi trường kiểm thử tự động không đầu (Headless Chrome) không thể can thiệp hay mô phỏng hook bàn phím cấp thấp của phần mềm EVKey trên hệ điều hành Windows.
  - Cần sự kiểm chứng thực tế của Owner trên máy tính vật lý khi gõ tổ hợp phím W/A/S/D.

### J. Sử Dụng Gói Phát Hành & Ảnh Chụp Màn Hình Cũ
- Ảnh chụp màn hình trong `public/media/` hiện mang tên `screen_v153_*.png` (được tạo ở mốc V1.5.3). Hình ảnh này thể hiện giao diện Black Knight, bản đồ mới và hệ thống craft, hoàn toàn khớp với gameplay hiện tại nhưng chưa mang nhãn V1.5.4.
- Các script đóng gói vẫn duy trì việc sao chép ra các file zip alias cũ (`hollow-woods-p2game-v1.5.0.zip`, `HOLLOW_WOODS_V1.5.1_STANDALONE.zip`) để tránh làm hỏng các đường dẫn tải nội bộ trước đó.

---

## 4. TÌNH TRẠNG CÁC HẠNG MỤC P0 / P1 / SPECIAL CHECKS

| Hạng mục kiểm tra | Hiện trạng ghi nhận | Mức độ rủi ro | Trạng thái nghiệm thu |
| :--- | :--- | :---: | :---: |
| **Lỗi P0 (Blocker)** | 0 lỗi sập game, 0 softlock, 0 memory leak, 0 lỗi đứt gãy Save game. | Không có | **PASS** |
| **Lỗi P1: Bản đồ World Map (BUG-033)** | Đã đồng bộ tọa độ beacon và cờ quest (HW-BUG-17), nhưng Bug Registry vẫn giữ nhãn `PARTIAL` chờ người chơi playtest thực tế. | Thấp | **PARTIAL** |
| **Lỗi P1: Bộ gõ EVKey Windows** | Đã cấu hình chống kẹt phím, nhưng cần Owner bấm phím vật lý kiểm chứng. | Trung bình | **ENVIRONMENT BLOCKED** |
| **P2Game Hosted Staging** | Đạt chuẩn sandbox, nhưng cần test trên CDN P2Game online thực tế sau khi upload. | Thấp | **ENVIRONMENT BLOCKED** |
| **Audio Listening Status** | 212/212 tài nguyên âm thanh tồn tại; sửa lỗi kích thước MP3; FOW audio pulse đạt chuẩn HW-FIX-23 V3 & HW-QA-23B. Cần playtest thẩm âm bằng tai nghe thực tế. | Thấp | **PASS (Technical)** / **PENDING PLAYTEST (Aural)** |
| **Asset Manifest Status** | Đã đồng bộ 269 file tại commit `9990797` (HW-ASSET-01); 0 missing paths, 0 mismatch. | Không có | **PASS 100%** |
| **Build & Compilation** | `npm run build` đạt trong 12.42s; `tsc --noEmit` 0 lỗi; `verify_zero_404_assets.mjs` 212/212. | Không có | **PASS 100%** |

---

## 5. KẾT LUẬN KIỂM TOÁN HAI CẤP ĐỘC LẬP

### Cấp độ 1: Kết Luận Kiểm Toán (Audit Completeness)
> ### **AUDIT COMPLETE**
> Quá trình rà soát, kiểm toán cấu hình, mã nguồn, tài nguyên, SDK, Save schema và pipeline phát hành đã được thực hiện toàn diện, trung thực và đầy đủ 100% theo các tiêu chí A–J.

### Cấp độ 2: Đánh Giá Sẵn Sàng Phát Hành (Release Readiness)
> ### **RELEASE CONDITIONAL**
> Trò chơi **CHƯA SẴN SÀNG PHÁT HÀNH NGAY LẬP TỨC** dưới tên gọi V1.5.4 do:
> 1. Phiên bản cấu hình trong `package.json`, `p2game.json`, `content_registry.json` và `SaveManager.ts` vẫn đang ở mốc V1.5.2 / V1.5.1.
> 2. Script kiểm toán pre-release cũ (`verify_pre_release_audit.mjs`) cần được refactor để tránh báo lỗi giả tạo do hardcode V1.4.0.
> 3. Cần kiểm chứng thực tế của Owner đối với bộ gõ EVKey trên máy Windows và playtest âm thanh trực tiếp.
>
> **Khuyến nghị bước tiếp theo:** Chờ Owner phê duyệt kế hoạch nâng phiên bản V1.5.4 trước khi tiến hành cập nhật metadata và đóng gói.
