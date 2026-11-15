# HOLLOW WOODS V1.2 — BÁO CÁO SAO LƯU & BẢO TOÀN TRẠNG THÁI C4-12-01
## COMMAND C4-12-01 — CHANGE PRESERVATION & TIMESTAMPED BACKUP

- **Dự án:** HOLLOW WOODS V1.2 — *Dị Cảnh Rừng Liễu (The Fog That Remembers)*
- **Không gian làm việc:** `G:\HOLLOW WOODS`
- **Mã bước:** `C4-12-01`
- **Trạng thái:** **PASS**
- **Phạm vi thực hiện:** Kiểm tra chỉ đọc (`read-only`) trạng thái Git, tạo bản sao lưu có gắn mốc thời gian cho `src/` và các tài nguyên liên quan, đối chiếu dung lượng byte (`0` sai lệch), khảo sát kết nối trong `GameScene.ts` và kiểm tra biên dịch TypeScript (`npx tsc --noEmit`).

---

## 1. KẾT QUẢ KIỂM TRA TRẠNG THÁI GIT CHỈ ĐỌC (READ-ONLY GIT AUDIT)

Đã kiểm tra bằng `git --no-optional-locks status --porcelain=v1 -uall` mà không can thiệp bất kỳ lệnh ghi/xóa Git nào:

| Phân loại trạng thái Git | Số lượng mục | Hành động xử lý |
| :--- | :---: | :--- |
| **Staged entries** | `61` | Giữ nguyên 100%, không `reset` / `restore` |
| **Unstaged modified entries** | `37` | Giữ nguyên 100%, không `checkout` / `restore` |
| **Deleted entries** | `32` | Giữ nguyên 100%, không can thiệp |
| **Untracked entries** | `87` | Giữ nguyên 100%, không `clean` |
| **Tổng số mục ghi nhận** | **`209`** | Bảo toàn tuyệt đối toàn bộ working tree & `.git/index.lock` |

---

## 2. BẢN SAO LƯU GẮN MỐC THỜI GIAN & ĐỐI CHIẾU DUNG LƯỢNG BYTE

- **Thư mục sao lưu:** [Backups/C4-12-01_20261115_0518/](file:///G:/HOLLOW%20WOODS/Backups/C4-12-01_20261115_0518)
- **File danh mục kiểm chứng:** [backup_manifest.json](file:///G:/HOLLOW%20WOODS/Backups/C4-12-01_20261115_0518/backup_manifest.json)
- **Phạm vi sao lưu:**
  - Toàn bộ mã nguồn `src/`
  - Toàn bộ tài nguyên `public/assets/`
  - Các file cấu hình gốc: `package.json`, `tsconfig.json`, `index.html`, `vite.config.ts`
- **Kết quả đối chiếu dung lượng byte (Lightweight Byte-Size Verification):**
  - **Tổng số file đã sao lưu:** `158` files
  - **Tổng dung lượng:** `1,278,853` bytes (`~1.28 MB`)
  - **Số file lệch dung lượng (`sizeMismatchCount`):** **`0`** (`100%` khớp dung lượng byte với bản gốc, không dùng vòng lặp băm mật mã nặng nề).

---

## 3. KHẢO SÁT `GameScene.ts` & CÁC ĐIỂM KẾT NỐI GAMEPLAY HIỆN TẠI

Qua đọc kiểm tra trực tiếp [GameScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts) (chưa chỉnh sửa code ở bước này):

1. **Khởi tạo thế giới & nhân vật (`L115–L159`):**
   - Khởi tạo `PlayerState`, `SurvivalSystem`, đăng ký hoạt ảnh `registerSatyrAnimations(this.anims)`, dựng bản đồ qua `WorldBuilder.buildWorld()`, tạo `SatyrPlayer` gắn collider vật lý với `worldBuilder.colliderGroup` và thiết lập camera `Zoom 2.2x`.
2. **Hệ thống NPC & UI Overlay (`L157–L210`):**
   - Tạo 3 NPC (`npc_garth` tại `530, 220`; `npc_edda` tại `790, 330`; `npc_neris` tại `970, 130`), kết nối `DialogueSystem`, `InventorySystem`, `EndingSystem`, `CraftingModal`, `JournalModal` và `PauseModal` trên `UIScene` (`Zoom 1.0`).
3. **Vòng lặp tương tác (`handleInteractions` & `executeMapInteraction`, `L894–L1056`):**
   - Trò chuyện với NPC trong bán kính `42px` (`[E]`).
   - Thu thập tài nguyên thế giới (`res_dry_wood`, `res_tree_resin`, `res_flint`, `res_herbs`) trong bán kính `38px` (`[E]`).
   - Mở Bàn Chế Tạo (`open_crafting_bench`), đọc biển chỉ đường (`read_fog_sign`), tương tác 3 Cột Đá Cổ Ngữ (`touch_pillar_1..3`), nhặt Lưỡi Chuông Đồng (`collect_bell_tongue`), gắn chuông (`inspect_bell`) và ẩn nấp (`hide_player`).
4. **Chuyển vùng & Ranh giới Cổng Đông (`handleZoneLogic`, `L864–L892`):**
   - Hiện tại `handleZoneLogic()` phát hiện phân khu qua `worldBuilder.detectCurrentZone(footPos)` và tự động cập nhật nhiệm vụ `Q04_ANCIENT_RUNES` khi sang `crooked_path` / `silent_mire`, nhưng chưa có cổng chặn/mở khóa tường minh theo tiến trình nhiệm vụ `Q03` tại Cổng Đông (sẽ được xử lý ở bước `C4-12-03`).

---

## 4. GHI NHẬN TRUNG THỰC CÁC VẤN ĐỀ ĐÃ BIẾT & PHẦN CHƯA TEST TRÌNH DUYỆT

- **Kiểm tra biên dịch TypeScript (`npx tsc --noEmit`):** **PASS** (`0` lỗi).
- **Kiểm tra đối chiếu dung lượng bản sao lưu (`158` files):** **PASS** (`0` sai lệch).
- **Các hạng mục cần kiểm tra / hoàn thiện ở các bước tiếp theo:**
  - Kiểm tra thực tế bộ gõ Tiếng Việt (`UniKey` / `EVKey`) trên trình duyệt: **NOT TESTED** trong lượt này (sẽ rà soát ở bước `C4-12-02`).
  - Kiểm tra cơ chế khóa/mở Cổng Đông làng Bellhollow theo nhiệm vụ `Q03_PREPARE_RESOURCES`: **NOT TESTED** (sẽ thực hiện ở bước `C4-12-03`).
  - Kiểm tra chu trình thu thập tài nguyên & chế tạo thực tế trên trình duyệt: **NOT TESTED** (sẽ thực hiện ở bước `C4-12-04`).
  - Tích hợp nhân vật chính `The Mossbound Wayfarer` vào `GameScene`: Chưa thực hiện (dành cho bước `C4-12-06`).
