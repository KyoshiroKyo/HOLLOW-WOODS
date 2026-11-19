# BÁO CÁO KỸ THUẬT V15-60: TÁI CẤU TRÚC MẠCH NHIỆM VỤ CHÍNH TUYẾN THEO LỘ TRÌNH ĐA NHÁNH A -> E -> B -> D -> F -> E -> C

**Dự án:** HOLLOW WOODS V1.5  
**Mã phân đoạn:** `V15-60`  
**Ngày thực hiện:** 19/11/2026  
**Trạng thái:** Hoàn tất 100% (Đã nghiệm thu qua kiểm thử tự động 72/72 Checks & Production Build)  
**Tệp tin tác động:**
- `src/data/items.json` *(Bổ sung 2 vật phẩm nhiệm vụ: `quest_rune_fragment` và `quest_purification_key`)*
- `src/data/quests.json` *(Tạo mới cấu trúc chuẩn hóa 7 chặng chính tuyến kèm hướng đi)*
- `src/systems/QuestSystem.ts` *(Tạo mới hệ thống điều phối tiến trình nhiệm vụ singleton)*
- `src/world/WorldGatingSystem.ts` *(Cập nhật quy tắc phong ấn cầu đầm lầy dẫn sang Miếu Chuông)*
- `src/data/dialogues.json` *(Bổ sung 7 kịch bản hội thoại phân nhánh chính tuyến)*
- `src/scenes/UIScene.ts` *(Tích hợp QuestSystem cập nhật khung HUD Nhiệm Vụ Hiện Tại [J])*
- `src/ui/JournalModal.ts` *(Cập nhật tab [1. NHIỆM VỤ] trình bày rõ 7 chặng & hướng đi gợi ý)*
- `src/scenes/GameScene.ts` *(Tích hợp luồng tương tác: chốt chặn đầm lầy, nhận huy hiệu, đối thoại Sir Vaelen, nhặt khuôn đúc xưởng chuông, nhặt mảnh cổ ngữ rừng sâu, đúc chìa khóa thanh tẩy, phá phong ấn hạ cầu cây)*
- `scripts/test_v15_60_quest_chain_restructuring.mjs` *(Tạo mới bộ kiểm thử tự động 72 chỉ mục)*

---

## 1. MỤC TIÊU & THIẾT KẾ KIẾN TRÚC

Nhằm loại bỏ hoàn toàn trải nghiệm "đi một mạch đường thẳng" thiếu chiều sâu khám phá, bước **V15-60** tái cấu trúc mạch nhiệm vụ chính tuyến của HOLLOW WOODS V1.5 thành **Lộ Trình Khám Phá Đa Nhánh Hình Chữ V Khép Kín (Metroidvania-lite Quest Loop)**:

$$\mathbf{A \rightarrow E \rightarrow B \rightarrow D \rightarrow F \rightarrow E \rightarrow C}$$

### Bảng Phân Tách 7 Chặng Nhiệm Vụ Chính Tuyến:
| Chặng | Tên Chặng | Lộ Trình | Điểm Xuất Phát | Phân Khu Mục Tiêu | Hướng Đi Gợi Ý | Vật Phẩm Cần/Nhận | NPC Dẫn Dắt |
|---|---|---|---|---|---|---|---|
| **1** | Điều Tra Đầm Lầy Tĩnh Lặng | $A \rightarrow E$ | Làng Bellhollow (A) | Đầm Lầy Tĩnh Lặng (E) | **Đông / Đông Nam** | — | Garth & Edda |
| **2** | Phong Ấn Rễ Cổ & Huy Hiệu Sa Ngã | Tại $E \rightarrow B$ | Đầm Lầy Tĩnh Lặng (E) | Trạm Lửa Rừng Tĩnh Lặng (B) | **Tây** | `quest_corrupted_crest` | Tiếng vọng rễ cây |
| **3** | Giải Mã Huy Hiệu & Khuôn Đúc Cổ | $B \rightarrow D$ | Trạm Lửa Rừng Tĩnh Lặng (B) | Xưởng Chuông & Hầm Rễ (D) | **Nam** | `item_bell_mold` | Sir Vaelen |
| **4** | Mảnh Cổ Ngữ Khai Mở | $D \rightarrow F$ | Xưởng Chuông Bỏ Hoang (D) | Rừng Sâu & Khu Cổ Ngữ (F) | **Bắc / Đông Bắc** | `quest_rune_fragment` | Bệ Thờ Cổ Ngữ |
| **5** | Đúc Chìa Khóa Thanh Tẩy | $F \rightarrow B/A$ | Rừng Sâu (F) | Trạm Lửa (B) hoặc Lò Rèn (A) | **Tây / Tây Nam** | `quest_purification_key` | Sir Vaelen / Bram |
| **6** | Phá Bỏ Phong Ấn Rễ Cổ & Hạ Cầu | Quay lại $E \rightarrow$ Mở $C$ | Trạm Lửa (B) | Cầu Cây Đầm Lầy (E) | **Đông** | Dùng `quest_purification_key` | Sir Vaelen |
| **7** | Miếu Chuông Phế Tích & Hồi Kết | Tại $C$ | Đầm Lầy Tĩnh Lặng (E) | Miếu Chuông Phế Tích (C) | **Đông Bắc** | `quest_bronze_clapper` | Boss Mire Warden |

---

## 2. CHI TIẾT TRIỂN KHAI KỸ THUẬT

### 2.1. Định Nghĩa 2 Vật Phẩm Nhiệm Vụ Mới (`src/data/items.json`)
```json
{
  "id": "quest_rune_fragment",
  "name": "Mảnh Cổ Ngữ Khai Mở",
  "category": "quest",
  "description": "Mảnh đá khắc chữ cổ phát ra ánh xanh huyền bí, dùng để tôi luyện Chìa Khóa Thanh Tẩy.",
  "stackable": false,
  "maxStack": 1,
  "iconColor": "#3498db"
},
{
  "id": "quest_purification_key",
  "name": "Chìa Khóa Thanh Tẩy",
  "category": "quest",
  "description": "Chìa khóa cổ đúc từ đồng đen và rèn bằng ngọn lửa hiệp sĩ, có khả năng hóa giải Phong Ấn Rễ Cổ.",
  "stackable": false,
  "maxStack": 1,
  "iconColor": "#f1c40f"
}
```

### 2.2. Hệ Thống Điều Phối `QuestSystem` (`src/systems/QuestSystem.ts`)
- **Singleton Pattern:** Cung cấp phương thức `QuestSystem.getInstance()`.
- **Hàm `getCurrentStageNumber(playerState)`:** Tự động nhận diện chính xác người chơi đang ở chặng nào (1 đến 7) dựa trên cờ trạng thái, lịch sử qua vùng và túi đồ:
  - Nếu đã hạ cầu cây (`mire_root_seal_broken` / `shrine_bridge_lowered`) $\rightarrow$ **Chặng 7**.
  - Nếu có `quest_purification_key` $\rightarrow$ **Chặng 6**.
  - Nếu có đủ `item_bell_mold` và `quest_rune_fragment` $\rightarrow$ **Chặng 5**.
  - Nếu có `item_bell_mold` $\rightarrow$ **Chặng 4**.
  - Nếu có `quest_corrupted_crest` hoặc cờ `corrupted_crest_obtained` $\rightarrow$ **Chặng 3**.
  - Nếu đã từng đặt chân tới Đầm Lầy Tĩnh Lặng (`entered_silent_mire` / `visitedZones.has('silent_mire')`) $\rightarrow$ **Chặng 2**.
  - Khởi đầu tại làng $\rightarrow$ **Chặng 1**.
- **Hàm `getBridgeSealState(playerState)`:** Trả về trạng thái chốt chặn cầu cây:
  - `isBroken`: Phong ấn đã bị phá, thân cây đã đổ làm cầu.
  - `canBreak`: Người chơi đang sở hữu `quest_purification_key`.
  - `promptText` & `reasonText`: Câu nhắc tương tác tương ứng.
- **Hàm `unlockBridge(playerState)`:** Tra chìa khóa, kích hoạt cờ `mire_root_seal_broken`, `shrine_bridge_lowered`, `shrine_unlocked`, cập nhật quest sang `Q06_RETRIEVE_CLAPPER`.
- **Hàm `craftPurificationKey(playerState)`:** Kết hợp `item_bell_mold` và `quest_rune_fragment`, trao `quest_purification_key` vào túi đồ.

### 2.3. Quy Tắc Mở Vùng Trong `WorldGatingSystem` (`src/world/WorldGatingSystem.ts`)
Khóa chặt lối chuyển vùng sang Miếu Chuông Phế Tích (`broken_bell_shrine`) nếu phong ấn chưa giải phóng:
```typescript
this.registerRule({
  zoneId: 'broken_bell_shrine',
  tier: 'LAYER_3_FORBIDDEN',
  conditionType: 'flag_required',
  requiredFlag: 'mire_root_seal_broken',
  requiredQuestId: 'Q05_SOLVE_MIRE',
  lockedReasonVietnamese: 'Cây cầu bị khóa bởi Phong Ấn Rễ Cổ.',
  hintVietnamese: 'Hãy tìm Sir Vaelen tại Trạm Lửa Rừng Tĩnh Lặng để tìm cách hóa giải.'
});
```

### 2.4. Hội Thoại Phân Nhánh Dẫn Đường (`src/data/dialogues.json`)
Bổ sung đầy đủ 7 kịch bản:
- `garth_guide_to_mire`: Garth chỉ đường qua Cổng Đông dẫn vào Đầm Lầy Tĩnh Lặng.
- `edda_guide_to_mire`: Bà Edda lắng nghe tiếng vọng quả chuông hướng về đầm lầy phía Đông.
- `vaelen_examine_crest_and_seek_mold`: Sir Vaelen nhận ra Huy Hiệu Kỵ Sĩ Sa Ngã, giảng giải về Phong Ấn Rễ Cổ và cử người chơi về hướng Nam vào Xưởng Chuông tìm Khuôn Đúc.
- `vaelen_mold_reminder`: Sir Vaelen nhắc nhở thu thập đủ Khuôn Đúc (D) và Mảnh Cổ Ngữ (F).
- `vaelen_forge_purification_key`: Sir Vaelen tôi luyện Khuôn Đúc và Mảnh Cổ Ngữ trong đốm lửa trại thành Chìa Khóa Thanh Tẩy.
- `vaelen_reminder_use_purification_key`: Sir Vaelen giục người chơi mau đem chìa khóa về phá phong ấn cầu cây Đầm Lầy.
- `bram_help_forge_purification_key`: Thợ rèn Bram hỗ trợ đúc chìa khóa trên đe thép Bellhollow.

### 2.5. Đồng Bộ Hiển Thị HUD & Sổ Tay Lữ Khách [J]
- **HUD Góc Phải Trên (`src/scenes/UIScene.ts`):** Khung `NHIỆM VỤ HIỆN TẠI [J]` mở rộng lên 86px, hiển thị rõ ràng:
  - Dòng tiêu đề chặng (ví dụ: `CHẶNG 3/7: GIẢI MÃ HUY HIỆU & KHUÔN ĐÚC CỔ`).
  - Nội dung hành động cần làm.
  - Dòng chỉ dẫn phương hướng nổi bật: `🧭 Đến: Xưởng Chuông Bỏ Hoang & Hầm Rễ Cổ (Hướng Nam)`.
- **Sổ Tay Lữ Khách [J] (`src/ui/JournalModal.ts`):** Tab `[1. NHIỆM VỤ]` hiển thị bảng lộ trình 7 chặng, mô tả chi tiết và danh sách mục tiêu tasks.

### 2.6. Xử Lý Tương Tác Trong GameScene (`src/scenes/GameScene.ts`)
- **Tương Tác Chốt Chặn Đầm Lầy (`inspect_sm_shrine_gate_ward` / `interact_ancient_root_bridge`):**
  - Khi chưa có chìa khóa: Rung camera nhẹ 200ms, tự động nhặt `quest_corrupted_crest`, hiển thị popup hướng dẫn quay về tìm Sir Vaelen.
  - Khi đã có chìa khóa: Rung chấn camera mạnh 450ms, phát âm vang chuông đồng (`playBronzeBellToll()`), giải phóng phong ấn, hạ thân cây làm cầu và mở toang lối vào Miếu Chuông.
- **Tương Tác Xưởng Chuông (`inspect_bell_mold`):** Nhặt `item_bell_mold`, popup chỉ dẫn hướng Bắc vào Rừng Sâu tìm Mảnh Cổ Ngữ.
- **Tương Tác Bệ Thờ / Bia Cổ Ngữ (`inspect_rune_altar` / `read_rune_clue_stele`):** Nhặt `quest_rune_fragment`, popup chỉ dẫn mang về Trạm Lửa Sir Vaelen.
- **Tương Tác Sir Vaelen (`npc_campfire_knight`):** Ưu tiên các giai đoạn tiếp nhận huy hiệu, nhắc nhở tìm cổ vật và đúc Chìa Khóa Thanh Tẩy.

---

## 3. KẾT QUẢ KIỂM THỬ & NGHIỆM THU

### 3.1. Bộ Kiểm Thử Tự Động (`scripts/test_v15_60_quest_chain_restructuring.mjs`)
- **Kết quả:** `72/72 CHECKS PASSED` (100% Thành công).
- **Phạm vi kiểm tra:**
  - Xác nhận 2 item mới trong `items.json`.
  - Xác nhận cấu trúc 7 chặng, route, directionHint trong `quests.json`.
  - Xác nhận 7 đoạn thoại trong `dialogues.json`.
  - Xác nhận luật mở vùng và câu nhắc tiếng Việt trong `WorldGatingSystem.ts`.
  - Xác nhận logic tính stage và chuyển đổi trạng thái chốt chặn của `QuestSystem.ts`.
  - Mô phỏng chuỗi tương tác State Simulation $1 \rightarrow 2 \rightarrow 3 \rightarrow 4 \rightarrow 5 \rightarrow 6 \rightarrow 7$.
  - Xác nhận tích hợp HUD trên `UIScene.ts` và tab Nhiệm Vụ trong `JournalModal.ts`.
  - Xác nhận các nhánh tương tác tại `GameScene.ts`.

### 3.2. Kiểm Tra Hồi Quy (Regression Tests)
- `node scripts/verify_gate_3c.mjs`: **12/12 PASSED**.
- `node scripts/verify_v15_20_multiple_endings.mjs`: **46/46 PASSED**.
- `node scripts/test_v15_59_ending_screen_and_branching.mjs`: **22/22 PASSED**.

### 3.3. Biên Dịch Dự Án
- `npx tsc --noEmit`: **0 Lỗi biên dịch TypeScript**.
- `npm run build`: **Vite build thành công (dist/assets/index-CsKOocCy.js)**.
