# HW-ASSET-01 — BÁO CÁO TÀI NGUYÊN CHƯA PHÂN LOẠI & CHỜ XỬ LÝ (UNCLASSIFIED ASSETS REPORT)

- **Ngày tạo:** `2026-11-26 06:54:09`
- **Nguyên tắc:** Không tự suy đoán hay giải nén `.rar` không rõ nội dung; không xóa tệp.

## 1. Tài nguyên đưa vào `99_Unclassified`

### 1.1 Kho Pixel Art (`3` tệp)

3 tệp nén `.rar` nguyên bản chưa được giải nén kiểm tra nội dung thực tế:
- `Pixel_Art/99_Unclassified/Archives_Pending_Inspection/ForgottenMemories.rar` (gốc: `Pixel_Art/ForgottenMemories.rar`, `536,733 B`, SHA-256 `c05171b4069af835...`)
- `Pixel_Art/99_Unclassified/Archives_Pending_Inspection/Ramses Free Package_2.rar` (gốc: `Pixel_Art/Ramses Free Package_2.rar`, `18,504 B`, SHA-256 `885440eb3011638c...`)
- `Pixel_Art/99_Unclassified/Archives_Pending_Inspection/Resurrected RPG 1.1.rar` (gốc: `Pixel_Art/Resurrected RPG 1.1.rar`, `656,129 B`, SHA-256 `2151da0ca017ae5b...`)

### 1.2 Kho Âm Thanh (`635` tệp)

- **635 tệp metadata macOS (`__MACOSX/._*` và `.DS_Store`)** phát sinh khi giải nén `Super Dialogue Audio Pack v1.zip` trên macOS.
- Đã gom an toàn về `Sound_Effects/99_Unclassified/_macos_metadata/` để không xóa mất dữ liệu khi kiểm toán.
- **Đề xuất cho Owner:** Có thể cho phép xóa toàn bộ `Sound_Effects/99_Unclassified/_macos_metadata/` (tiết kiệm ~2.5 MB file rác Finder).

## 2. Tài nguyên nguồn giữ nguyên vị trí do Script / Quy tắc phụ thuộc (Phase E)

Các tài nguyên sau đã xác định rõ vai trò nhưng **chưa di chuyển** để tránh làm gãy script hoặc vi phạm tham chiếu hiện hành:
- `Pixel_Art/The Fan-tasy Tileset (Free) 1.5.9.zip` (`scripts/restore_tiled_tileset_images.py:19`) → Đề xuất đích: `Pixel_Art/06_Terrain/Tilesets/` sau khi cập nhật script.
- `Pixel_Art/Black Knight/` (`29` tệp; `scripts/extract_black_knight_wayfarer.mjs:17` & `Read/AI_IRON_RULES.md:37`) → Đề xuất đích: `Pixel_Art/01_Characters/Player/Black_Knight/` sau khi cập nhật script & doc.
- `Sound_Effects/The Knight’s Quiet Fire/` (`5` tệp MP3; `scripts/test_v15_39_bgm_system.mjs:47`) → Đề xuất đích: `Sound_Effects/01_Music/Exploration/The_Knights_Quiet_Fire/` sau khi cập nhật script kiểm thử BGM.
