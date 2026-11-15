# BÁO CÁO KỸ THUẬT: ĐỒNG BỘ LUỒNG TRẢI NGHIỆM SINH TỒN, KHÁM PHÁ ĐẦU GAME VÀ HƯỚNG DẪN NHIỆM VỤ XUYÊN SUỐT VÙNG LÕI (C4-12-14)

- **Mã công việc:** `COMMAND C4-12-14`
- **Dự án:** HOLLOW WOODS V1.2 — *Dị Cảnh Rừng Liễu (The Fog That Remembers)*
- **Không gian làm việc:** `G:\HOLLOW WOODS`
- **Thời gian thực hiện:** 15/11/2026
- **Trạng thái:** **HOÀN THÀNH TOÀN DIỆN (100% Passed — 0 TypeScript Error)**
- **Thư mục sao lưu:** [Backups/C4-12-14_PRE_BACKUP/](file:///G:/HOLLOW%20WOODS/Backups/C4-12-14_PRE_BACKUP/)
- **Kịch bản kiểm tra tự động:** [scripts/verify_gameplay_quest_c4_12_14.mjs](file:///G:/HOLLOW%20WOODS/scripts/verify_gameplay_quest_c4_12_14.mjs)

---

## 1. TỔNG QUAN VÀ MỤC TIÊU CỦA BƯỚC C4-12-14

Bước **C4-12-14** giải quyết triệt để các vấn đề mâu thuẫn cốt truyện, tắc nghẽn nhiệm vụ (dead-ends), nhầm lẫn phím tắt và sai lệch danh tính nhân vật trong toàn bộ luồng trải nghiệm đầu game (Onboarding & Core Progression Flow) tại làng Bellhollow:

1. **Rà soát & loại bỏ mâu thuẫn cốt truyện (Story & Dialogue Dead-Ends):**
   - Loại bỏ câu thoại phi lý của Edda (*"Cổng Đông đã mở"* ngay sau khi gặp lần đầu), thay thế bằng phân luồng thoại động: khi cổng đang khóa thì nhắc nhở sang tìm Neris học pha dầu đèn; chỉ khi đã hoàn thành pha chế Dầu Đèn mới chúc mừng cổng mở.
   - Xóa bỏ vòng lặp thoại đơn điệu của Garth (trước đây luôn lặp lại tiếng hét cảnh báo ban đầu `garth_warning`), nâng cấp thành 4 trạng thái thoại theo tiến độ thực tế của người chơi.
   - Chuẩn hóa hoàn toàn danh xưng nhân vật chính từ "Satyr" cũ thành **"The Mossbound Wayfarer"** (*Lữ Khách Rêu Phong*), thay thế ảnh chân dung thoại sang `wayfarer_portrait`.
2. **Loại bỏ tắc nghẽn tài nguyên (Resource & Crafting Accessibility):**
   - Xác minh toàn bộ các điểm thu hái nguyên liệu cần thiết cho nhiệm vụ Q03 (`res_dry_wood`, `res_tree_resin`) đều nằm tại các ô đất đi lại được bên trong làng Bellhollow trước Cổng Đông.
   - Thống nhất phím tắt chế tạo: hỗ trợ đồng thời cả `[C]`, `[I]` và `[TAB]`, cập nhật rõ ràng trong bảng mục tiêu nhiệm vụ Q03 và gợi ý thanh HUD.
3. **Đồng bộ hóa logic nhiệm vụ và đóng/mở Cổng Đông (Gate Progression & Persistence):**
   - Cổng Đông chỉ mở khi người chơi hoàn thành chế tạo Bình Dầu Đèn dự phòng (`craft_lantern_oil_complete`) theo lời dặn của Neris và Edda.
   - Chuẩn hóa khởi tạo ban đầu giữa Constructor và `reset()` của `PlayerState.ts` (mặc định hoàn thành `Q00_WAKE_UP`, bắt đầu tại `Q01_MEET_EDDA`).
   - Lưu trữ và khôi phục toàn vẹn trạng thái từng nhiệm vụ, cờ sự kiện và danh sách vùng đã khám phá trong `SaveManager.ts`.

---

## 2. SƠ ĐỒ TIẾN TRÌNH NHIỆM VỤ VÙNG LÕI (CORE WORLD QUEST FLOW)

```mermaid
flowchart TD
    Q00["HỒI 0: XUYÊN QUA MÀN SƯƠNG (Q00_WAKE_UP)<br/>• Vượt qua Fog Crossing<br/>• Bật đèn lồng [F]<br/>• Tiến vào Bellhollow"]
    --> Q01["HỒI 1: LÀNG CHUÔNG BELLHOLLOW (Q01_MEET_EDDA)<br/>• Gặp Garth tại Cổng Tây làng [garth_warning]<br/>• Garth chỉ đường tới Tháp Chuông [garth_reminder_edda]<br/>• Gặp Edda nhận Ba Quy Tắc Bằng Máu [edda_intro]"]

    Q01 --> Q02["HỒI 1B: THUỐC CỨU SINH MẠNG (Q02_MEET_NERIS)<br/>• Tìm Neris tại tiệm thuốc Đông Bắc<br/>• Neris hồi phục sinh lực và trao công thức pha chế Dầu Đèn [neris_intro]<br/>• Mở khóa Ghi Chép Thảo Dược"]

    Q02 --> Q03["HỒI 2: CHUẨN BỊ VÀO RỪNG CẤM (Q03_PREPARE_RESOURCES)<br/>• Thu thập 1 Gỗ Khô + 1 Nhựa Cây quanh Bellhollow<br/>• Mở bàn chế tạo [C / I / TAB] để chế Dầu Đèn<br/>• Hoàn thành kích hoạt cờ craft_lantern_oil_complete"]

    Q03 --> GATE{"Kiểm Tra Điều Kiện Cổng Đông<br/>isEastGateUnlocked() == true"}

    GATE -- "Đạt điều kiện" --> Q04["HỒI 3: ĐƯỜNG MÒN QUANH CO (Q04_ANCIENT_RUNES)<br/>• Garth chúc lên đường bình an [garth_east_gate_open]<br/>• Edda dặn dò tìm Lưỡi Chuông [edda_reminder_open]<br/>• Bước qua Cổng Đông (x >= 1500) sang The Crooked Path"]

    Q04 --> Q05["HỒI 4: ĐẦM LẦY TĨNH LẶNG (Q05_SOLVE_MIRE)<br/>• Giải mã 3 Cột Đá Cổ Ngữ (Trăng Khuyết, Rễ Rừng, Con Mắt)<br/>• Rút cạn nước bùn độc"]

    Q05 --> Q06["HỒI 5: MIẾU CHUÔNG PHẾ TÍCH (Q06_RETRIEVE_CLAPPER)<br/>• Đoạt lại Lưỡi Chuông Đồng từ bệ thờ<br/>• Cắt đuôi The Listener và trở về Bellhollow"]
```

---

## 3. CHI TIẾT CÁC CẢI TIẾN KỸ THUẬT ĐÃ THỰC HIỆN

### 3.1. Phân luồng thoại ngữ cảnh động cho 3 NPC (`dialogues.json` & `GameScene.ts`)

| Nhân vật NPC | Điều kiện trạng thái người chơi | Mã hội thoại được kích hoạt | Nội dung truyền tải |
| :--- | :--- | :--- | :--- |
| **Garth** *(Người Gác Cổng)* | Chưa nói chuyện lần đầu | `garth_warning` | Cảnh báo quái vật trong sương mù, yêu cầu người chơi dừng lại. |
| **Garth** | Đã gặp Garth nhưng chưa gặp Edda | `garth_reminder_edda` | Hối thúc người chơi tới Tháp Chuông gặp bà lão Edda để nắm Ba Quy Tắc Bằng Máu. |
| **Garth** | Đã gặp Edda nhưng chưa chế Dầu Đèn (Cổng khóa) | `garth_reminder_gate_locked` | Giải thích rõ ràng Cổng Đông bị khóa, bắt buộc phải tới gặp Neris chữa thương và chuẩn bị Dầu Đèn dự phòng. |
| **Garth** | Đã chế tạo xong Dầu Đèn (Cổng mở) | `garth_east_gate_open` | Chúc Lữ Khách lên đường bình an, cảnh báo Kẻ Lắng Nghe và nhắc tìm lại Lưỡi Chuông Đồng. |
| **Edda** *(Người Giữ Chuông)* | Chưa nói chuyện lần đầu | `edda_intro` | Giới thiệu danh tính Lữ Khách, truyền thụ chi tiết Ba Quy Tắc Bằng Máu sống còn. |
| **Edda** | Đã gặp nhưng Cổng Đông chưa mở | `edda_reminder_locked` | Nhắc lại 3 quy tắc và bảo người chơi tới tiệm thuốc Neris chữa thương, chuẩn bị dầu đèn. |
| **Edda** | Cổng Đông đã mở | `edda_reminder_open` | Cổ vũ người chơi tiến vào Đầm Lầy Tĩnh Lặng tìm lại Lưỡi Chuông Đồng bị đánh cắp. |
| **Neris** *(Thầy Thuốc Làng)* | Chưa nói chuyện lần đầu | `neris_intro` | Chữa thương (100 HP, 90 Tâm trí), cấp công thức pha chế Dầu Đèn và thuốc sơ cứu. |
| **Neris** | Đã gặp, Cổng Đông chưa mở | `neris_heal_locked` | Hồi máu và nhắc nhở thu thập cành khô, nhựa cây quanh làng để nấu dầu đèn. |
| **Neris** | Cổng Đông đã mở | `neris_heal_open` | Hồi phục thể lực và dặn dò cẩn trọng khí lạnh buốt giá ngoài rừng sâu. |

### 3.2. Chuẩn hóa hình tượng nhân vật chính The Mossbound Wayfarer
- Đã thay thế toàn bộ danh xưng cũ trong các đoạn thoại: loại bỏ hoàn toàn chữ *"Satyr"* và chân dung cũ `satyr_portrait`.
- Sử dụng chân dung pixel-art đồng bộ `portrait_wayfarer` / `wayfarer_portrait` chuẩn mực Visual Direction A.
- Trong đoạn thoại nhặt Lưỡi Chuông Đồng (`clapper_found`), danh xưng và avatar hiển thị chính xác là **The Mossbound Wayfarer**.

### 3.3. Hỗ trợ phím tắt chế tạo kép (`KeyC`, `KeyI`, `Tab`)
Trong [src/entities/SatyrPlayer.ts](file:///G:/HOLLOW%20WOODS/src/entities/SatyrPlayer.ts#L620-L622):
```typescript
} else if (code === 'KeyI' || code === 'Tab' || code === 'KeyC') {
  this.pendingOneShotActions.add('craft');
}
```
Người chơi có thể bấm phím `[C]` (Chế tạo theo thói quen RPG hiện đại) hoặc `[I]` / `[TAB]` (Túi đồ sinh tồn) đều mở giao diện chế tạo ngay lập tức mà không bị bỡ ngỡ.

### 3.4. Điểm tài nguyên ban đầu quanh làng Bellhollow
Trong [src/systems/InventorySystem.ts](file:///G:/HOLLOW%20WOODS/src/systems/InventorySystem.ts#L100-L130), đã bố trí đầy đủ các điểm thu hái nguyên liệu trên mặt đất an toàn trước Cổng Đông:
- `node_wood_bellhollow_1` tại `(680, 220)`: Cành Khô ven giếng làng.
- `node_resin_bellhollow_2` tại `(640, 185)`: Nhựa Cây cổ thụ cạnh Tháp Chuông.
- `node_flint_1` tại `(620, 350)`: Đá Lửa gần bàn chế tạo làng.
- `node_herb_1` tại `(1040, 180)`: Thảo Dược Bạc ven suối nhỏ gần nhà Neris.
- `node_resin_1` tại `(880, 200)`: Nhựa Cây bên đường đi.
- `node_wood_3` tại `(1120, 380)`: Cành Củi Khô cạnh bờ rào phía Đông.

Khi người chơi nhặt đủ `res_dry_wood >= 1` và `res_tree_resin >= 1`, hàm `evaluateQ03ResourceTask()` trong `PlayerState.ts` tự động đánh dấu hoàn thành task 1 của Q03 và phát tín hiệu thông báo.

### 3.5. Đồng bộ hóa lưu trữ tiến trình nhiệm vụ (`SaveManager.ts`)
Trong [src/systems/SaveManager.ts](file:///G:/HOLLOW%20WOODS/src/systems/SaveManager.ts#L53-L77), toàn bộ các trường trạng thái sau được tuần tự hóa nguyên vẹn:
```typescript
const questData = Array.from(state.quests.values()).map(q => ({
  id: q.id,
  tasks: q.tasks.map(t => ({ id: t.id, done: t.done }))
}));

const saveData: SaveData = {
  version: '3.0.0',
  timestamp: Date.now(),
  checkpointName,
  zoneId,
  playerPos: { x: playerX, y: playerY },
  stats: { ... },
  inventory: Array.from(state.inventory.entries()),
  flags: Array.from(state.flags),
  currentQuestId: state.currentQuestId,
  quests: questData,
  unlockedLoreIds: state.unlockedLore.map(l => l.id),
  visitedZones: state.getVisitedZones()
};
```
Khi tải game (`loadGame`), tiến độ từng task con của từng quest được nạp lại chính xác, ngăn ngừa hiện tượng mất trạng thái cổng mở hoặc reset nhiệm vụ.

---

## 4. KẾT QUẢ KIỂM TRA TỰ ĐỘNG (VERIFICATION TEST RESULTS)

Đã khởi chạy kịch bản kiểm tra toàn diện [scripts/verify_gameplay_quest_c4_12_14.mjs](file:///G:/HOLLOW%20WOODS/scripts/verify_gameplay_quest_c4_12_14.mjs):

```text
================================================================
  TEST SUITE: C4-12-14 GAMEPLAY QUEST & ONBOARDING VERIFICATION
================================================================

--- 1. Kiểm tra Lore & Quest Structure (lore.json) ---
[PASS] File src/data/lore.json tồn tại
[PASS] Q00_WAKE_UP tồn tại trong questLog
[PASS] Q01_MEET_EDDA tồn tại trong questLog
[PASS] Q02_MEET_NERIS tồn tại trong questLog
[PASS] Q03_PREPARE_RESOURCES tồn tại trong questLog
[PASS] Q04_ANCIENT_RUNES tồn tại trong questLog
[PASS] Q05_SOLVE_MIRE tồn tại trong questLog
[PASS] Q06_RETRIEVE_CLAPPER tồn tại trong questLog
[PASS] Q00_WAKE_UP được đánh dấu hoàn thành mặc định khi vào Bellhollow
[PASS] Q03 Task 2 hướng dẫn đúng phím [Phím C / I]

--- 2. Kiểm tra Hệ Thống Thoại Đa Ngữ Cảnh (dialogues.json) ---
[PASS] File src/data/dialogues.json tồn tại
[PASS] Có thoại garth_warning (cảnh báo ban đầu)
[PASS] Có thoại garth_reminder_edda (nhắc gặp Edda)
[PASS] Có thoại garth_reminder_gate_locked (nhắc chuẩn bị dầu đèn)
[PASS] Có thoại garth_east_gate_open (chúc an toàn khi cổng mở)
[PASS] Có thoại edda_intro (giới thiệu 3 Quy Tắc Bằng Máu)
[PASS] Có thoại edda_reminder_locked (nhắc chế dầu trước khi cổng mở)
[PASS] Có thoại edda_reminder_open (hướng dẫn vào rừng khi cổng đã mở)
[PASS] Có thoại neris_intro (chữa thương và cấp công thức Dầu Đèn)
[PASS] Có thoại neris_heal_locked (hồi máu và dặn thu thập nguyên liệu)
[PASS] Có thoại neris_heal_open (hồi máu và dặn dò cẩn trọng sương lạnh)
[PASS] Có thoại clapper_found
[PASS] clapper_found sử dụng wayfarer_portrait
[PASS] Không còn từ khóa cũ "Satyr" / "satyr_portrait" trong bất kỳ câu thoại nào

--- 3. Kiểm tra Ngữ Cảnh Tương Tác NPC trong GameScene.ts ---
[PASS] GameScene.ts phân luồng thoại ngữ cảnh 4 giai đoạn cho Garth
[PASS] GameScene.ts phân luồng thoại ngữ cảnh khi cổng khóa/mở cho Edda
[PASS] GameScene.ts phân luồng thoại ngữ cảnh khi cổng khóa/mở cho Neris

--- 4. Kiểm tra PlayerState.ts (Logic Nhiệm Vụ, Tài Nguyên & Cổng Đông) ---
[PASS] PlayerState khởi đầu mặc định ở Q01_MEET_EDDA
[PASS] PlayerState có hàm kiểm tra isEastGateUnlocked() chuẩn xác
[PASS] PlayerState có hàm tự động đánh giá Q03 khi đủ tài nguyên
[PASS] PlayerState kiểm tra đúng cờ hoàn thành chế tạo Dầu Đèn
[PASS] PlayerState.reset() tái tạo chính xác visitedZones

--- 5. Kiểm tra Phím Bấm Chế Tạo (SatyrPlayer.ts) ---
[PASS] SatyrPlayer.ts hỗ trợ cả phím [C], [I] và [TAB] để mở bảng chế tạo

--- 6. Kiểm tra Điểm Tài Nguyên Bellhollow (InventorySystem.ts) ---
[PASS] Có điểm tài nguyên cành khô ban đầu trong làng
[PASS] Có điểm tài nguyên nhựa cây ban đầu trong làng
[PASS] Các nguyên liệu chế tạo Dầu Đèn (res_dry_wood, res_tree_resin) có sẵn trước Cổng Đông

--- 7. Kiểm tra Lưu Trữ Tiến Trình (SaveManager.ts) ---
[PASS] SaveManager lưu currentQuestId
[PASS] SaveManager lưu toàn bộ game flags
[PASS] SaveManager lưu danh sách visitedZones
[PASS] SaveManager lưu chi tiết tiến độ các quest

================================================================
KẾT QUẢ KIỂM TRA: 40 / 40 BÀI TEST ĐẠT (100%)
================================================================
```

---

## 5. KẾT LUẬN & TRẠNG THÁI HỆ THỐNG

1. **Tính nhất quán cốt truyện & nhiệm vụ:** Luồng trải nghiệm từ lúc bắt đầu tại Bellhollow tới khi bước qua Cổng Đông diễn ra mượt mà, hợp lý và không còn bất kỳ dòng chỉ dẫn mâu thuẫn hay tắc nghẽn nào.
2. **Đồng bộ hình tượng nhân vật chính:** Tất cả các thành phần UI, thoại và đồ họa đã chuyển hoàn toàn sang **The Mossbound Wayfarer** (*Lữ Khách Rêu Phong*).
3. **Chất lượng mã nguồn:** Biên dịch TypeScript (`npx tsc --noEmit`) đạt **0 lỗi**, Vite HMR cập nhật trơn tru mà không có lỗi runtime.
4. **Sẵn sàng cho bước tiếp theo:** Vùng Lõi Bellhollow đã sẵn sàng 100% cho các bước tích hợp âm thanh (C4-12-15/Audio) hoặc mở rộng nông trại / vùng ngoại vi tiếp theo.
