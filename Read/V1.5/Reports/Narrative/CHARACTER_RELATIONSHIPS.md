# HOLLOW WOODS — CHARACTER RELATIONSHIPS & KNIGHT ORDER BIBLE

- **Mission:** `HW-NARRATIVE-00B — LORE, CHARACTER & CANON REGISTRY`
- **Primary References:**
  - `HOLLOW_WOODS_MASTER_GAME_BIBLE_UNIFIED.docx`: `Ch. 05`, `Ch. 06`, `Ch. 16`, `Ch. 17` (`Character Relationship Bible` + `Table 16`)
  - [CHARACTER_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/CHARACTER_REGISTRY.md)
  - [HW_CHAR_01_R2_CODEX_BLACK_KNIGHT_V2_RECOVERY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_CHAR_01_R2_CODEX_BLACK_KNIGHT_V2_RECOVERY.md)

---

## 1. Đoàn Kỵ Sĩ (`Knight Order Bible` — `NAR-K06` `PROPOSED`)

Tất cả yếu tố định danh tổ chức dưới đây **vẫn ở trạng thái `PROPOSED`**, chưa được Owner chốt Canon chính thức:
- **Tên đoàn đề xuất:** **`Order of the Black Wolf`** (*Đoàn Kỵ Sĩ Hắc Lang*).
- **Khẩu hiệu đề xuất:** **`Fides Ultra Tenebras`** (*Lòng trung thành vượt qua bóng tối*).
- **Huy hiệu & Sắc độ đề xuất:** Dấu sói (*The Wolf Lord*), chất liệu giáp đen & đồng cũ (`Ch. 06`).
- **Thông tin chưa khóa (`UNKNOWN`):** Lịch sử thành lập, cấp bậc chính thức, lãnh địa, danh sách toàn bộ thành viên (`bia 12 kỵ sĩ` trong `lore_knights_memorial_stele` / `tornPagesData.ts`), toàn văn lời thề gốc. Không mặc nhiên xem toàn đoàn là con nuôi hay tất cả đều trở thành boss (`Ch. 06`).

---

## 2. Sơ Đồ Quan Hệ Trung Tâm (`Ch. 06` & `Ch. 17.3`)

```text
                [Meliodas Blackwood — The Wolf Lord]
          (Baseline: Chỉ Huy | Owner Mới [PROPOSED]: Người Thầy)
           /               |                 \                \
   [PROPOSED dìu dắt] [PROPOSED dìu dắt]  [ACCEPTED]       [ACCEPTED]
         /                 |                   \                \
   Sir Vaelen  <--- Bạn cũ [PROPOSED] ---> Sir Mordric    Sir Roderick   Sir Aldemar
  (Giữ lửa/Trung thành)                   (Dark Knight)  (Crimson/PROPOSED) (Ashen/PROPOSED)
        |                                       |
  [CONFLICT C02: q2 tin Hooded            [CONFLICT C03 / OQ-04:
   là Chỉ Huy; q3 nhận NVC]                Mordric = HoodedKnightBoss?]
                                                |
                                      HoodedKnightBoss (Baseline: SQ08, quest_corrupted_crest)
                                      [CẤM đồng nhất với Elian hoặc tự gán Fallen/Knight_2/3]

  --- Các Trục Tách Biệt Bắt Buộc ---
  • Garth ──[anh ruột]──► Elian (mất tích, SQ09)  [X] KHÔNG gán là Dark Knight / Mordric
  • The Headless Warden (Boss mới `ART-K01`)      [X] KHÔNG gán là DreadHorsemanEntity
  • FallenKnightEntity                            [X] KHÔNG đồng nhất với FallenKnightApparition (ảo ảnh không physics)
  • The Echo (Manh mối ký ức)                     [X] KHÔNG đồng nhất với The Listener (mối nguy săn âm thanh)
  • Mire Warden (Bảo hộ Mạch Rễ / Clapper)        [X] Không phải thầy/trò Đoàn Hắc Lang, không mặc định nguồn tiếng gọi
```

---

## 3. Bảng Ma Trận Quan Hệ Giữa Các Nhóm Nhân Vật

| Cặp / Nhóm Quan Hệ | Bản chất Baseline (`GAME-IMPLEMENTED`) | Bổ sung Hướng Mới / Trailer (`PROPOSED` / `TRAILER-ONLY`) | Ràng buộc An Toàn (Không Tự Ý Hợp Nhất) |
| :--- | :--- | :--- | :--- |
| **Meliodas ↔ Sir Vaelen** | Vaelen tuân lệnh Chỉ Huy giữ trạm lửa; `q3_complete` nhận ra Quân Huy Tổng Chỉ Huy & vết chém chéo. | Từng là thầy–trò (`Ch. 03`, `Ch. 06`); Vaelen giữ lời thề (`DLG-009`, `DLG-014`). | Chưa chốt Vaelen nhận ra lúc mới gặp hay chỉ qua huy hiệu/ở hang (`OQ-11`). Không để spoil sớm hoặc cho Vaelen rời trạm lửa (`OQ-16`). |
| **Meliodas ↔ Sir Mordric** | Không có nhân vật tên `Mordric` trong source; `HoodedKnightBoss` nhận ra Chỉ Huy (`DLG-025`). | Thầy–trò; Mordric oán trách thầy vắng mặt khi bóng tối tìm đến (`DLG-012–013` `TRAILER-ONLY`). | Không mặc định NVC cố ý bỏ rơi họ; chưa chốt Mordric = HoodedKnightBoss (`OQ-04`) hay kết cục sau encounter (`OQ-14`). |
| **Sir Vaelen ↔ Sir Mordric** | Trong baseline `q2`, Vaelen tin `HoodedKnightBoss` là Chỉ Huy cũ bị tha hóa (không gọi là bạn cũ). | Hai học trò từng là **bạn thân**, nay đứng ở hai phía niềm tin (`DLG-015`: *"Ta cũng từng chờ đợi như ngươi..."*). | `Vaelen` vào hang hỗ trợ là `TRAILER-ONLY` (`NAR-017`). Xung đột nhận thức `q2/q3` giữ trạng thái `CONFLICT 02` (`OQ-06`). |
| **Meliodas ↔ Roderick & Aldemar** | Chưa xuất hiện trong gameplay baseline. | `ACCEPTED CHARACTER`; đề xuất Roderick đại diện danh dự, Aldemar giữ di vật/ký ức. | Chưa chốt có phải học trò trực tiếp hay không; **CẤM gán cho `Knight_2` / `Knight_3` trong trailer**. |
| **Meliodas ↔ Dân Làng Bellhollow** | Lữ khách mất trí giúp làng mở Cổng Đông, tìm Lưỡi Chuông (`garth/edda/neris/bram/finn_black_knight_reverence`). | Edda gợi ký ức về *"ngày ngươi rời đi"* (`DLG-006–007` `TRAILER-ONLY`). | Chưa xác nhận Edda hay dân làng từng sống cùng thời Meliodas quá khứ (`OQ-08`, `OQ-10`). |
| **Garth ↔ Elian** | Anh em ruột; Elian mất tích khi tuần tra (`SQ09_BROKEN_LANTERN`, `lore_elian_unsent_letter`). | Giữ nguyên tuyến phụ riêng. | **Cấm tuyệt đối** dùng tên Elian để điền cho Dark Knight / Hooded / `Knight_2/3` (`NAR-025`). |
| **Dark Knight ↔ `Knight_2` & `Knight_3`** | Baseline có `FallenKnightEntity` & `DreadHorsemanEntity` tách riêng. | Cảnh hang `V11.x–V12.2` hiển thị 2 thuộc hạ không tên cạnh Dark Knight (`NAR-018`). | Chưa xác nhận danh tính, quan hệ với Fallen Knight runtime hay Roderick/Aldemar (`OQ-07`). |
| **Mire Warden ↔ Bellhollow / Đoàn Kỵ Sĩ** | Cựu bảo hộ Mạch Rễ gắn với Lưỡi Chuông bị đánh rơi tại `broken_bell_shrine`. | Trailer giữ vai trò boss chặng tìm Lưỡi Chuông (`DLG-016–017`). | Không thêm liên hệ thầy trò hay gán làm tác nhân lời cầu cứu. |

---

## 4. Bảng Quy Ước Tên Nguồn vs Tên Trailer (`Table 16` — `Character Relationship Bible`)

| Đối tượng | Định danh trong Source (`GAME-IMPLEMENTED`) | Liên hệ với Tên Mới / Trailer | Quy tắc phân tách |
| :--- | :--- | :--- | :--- |
| **Player (NVC)** | `The Mossbound Wayfarer`, `BlackKnightPlayer`, `Chỉ Huy` (trong lore cũ) | `Lord Meliodas Blackwood`, `The Wolf Lord` | NVC **không phải** Dark Knight (`CHAR-001`). Giữ class & atlas keys. |
| **Hooded Knight** | `HoodedKnightBoss`, `hooded_knight_sheet` | Trailer mượn sprite này cho `Dark Knight` | Chờ `OQ-04` trước khi hợp nhất hay tách `Sir Mordric`. |
| **Dark Knight** | Chưa có entity ID riêng xác minh | `Sir Mordric` (`ACCEPTED CHARACTER`) | Chưa tự tạo boss ID hoặc quest mới trước khi duyệt. |
| **Fallen Knight** | `FallenKnightEntity`, `fallen_knight_sheet` | Tàn quân bị tha hóa | Không mặc định đồng nhất với `Knight_2/3` hay `Mordric`. |
| **Fallen Apparition** | `FallenKnightApparition` | Ảo ảnh Sanity thấp, không collider | Không gộp physics/entity với `FallenKnightEntity`. |
| **Dread Horseman** | `DreadHorsemanEntity`, `dread_horseman_sheet` | Kỵ binh nguồn | **Không** gán thành `The Headless Warden` (`CHAR-006`). |
| **Satyr** | `satyr_*` legacy (nhật ký & compatibility keys NVC) | Mini-boss truy đuổi điện ảnh (`V11.x–V12.2`) | Không lấy key legacy `lore_satyr_journal` làm bằng chứng boss runtime. |
