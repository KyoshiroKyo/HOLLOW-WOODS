# CLOUD-01Y-R — Migration tên Black Knight

**LOCAL PASS · 20/11/2026**

GameScene tạo `BlackKnightPlayer` và gọi `registerBlackKnightAnimations`. Camera và hai công cụ debug dùng kiểu mới. Cấu hình hoạt ảnh fallback chuyển sang `black_knight_animations.json` với nội dung JSON giống hệt trước khi đổi tên. [Player](../../../src/entities/BlackKnightPlayer.ts) · [Registry](../../../src/animation/BlackKnightAnimations.ts) · [GameScene](../../../src/scenes/GameScene.ts) · [Fallback JSON](../../../src/data/black_knight_animations.json).

| Tham chiếu trước migration | Cách tương thích |
|---|---|
| Import `SatyrPlayer`, `Satyr` và `WayfarerPlayer` | Alias tới cùng constructor `BlackKnightPlayer`. |
| Import `registerSatyrAnimations` | Alias tới `registerBlackKnightAnimations`. |
| Kiểu `SatyrAnimState` | Alias tới `BlackKnightAnimState`. |
| Khóa texture và animation `satyr_*`, `wayfarer_*` | Giữ các key hiện hành trong loader và registry. Portrait cũ được định tuyến tới cùng ảnh Black Knight mới. |
| Item/content ID như `lore_satyr_journal`, Cloud Save và khóa localStorage | Giữ đúng ID trong dữ liệu, serializer và SaveManager. |

Đã cập nhật các đường dẫn đọc source trong script kiểm thử cũ. Chromium standalone xác nhận instance thật là `BlackKnightPlayer`, các alias trỏ cùng constructor, 72 cặp khóa hoạt ảnh có danh sách frame bằng nhau, phím D và F9 hoạt động, New Game và Continue schema 3 đều vào Fog Crossing. TypeScript và `git diff --check` đạt. Test combat V152-05 đạt 65/66 ở cả HEAD và worktree. Một kiểm tra phụ thuộc ảnh preview legacy vắng trong `Backups/steps/backup_v152_05/`. [Gameplay sau migration tên](Visuals/V153_BATCH_03/naming-gameplay.png).

Ảnh gameplay ghi lại bộ sprite legacy mà game đang dùng. CLOUD-01Z phụ thuộc bộ hoạt ảnh sản xuất đạt gate.
