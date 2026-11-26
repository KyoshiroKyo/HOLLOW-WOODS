# HW-NARRATIVE-00G — OPENING CUTSCENE IMPLEMENTATION PLAN (`CIN-K13`)

- **Mission:** `HW-NARRATIVE-00G — CHARACTER ART, OPENING CUTSCENE & AUDIO PLAN`
- **Project:** `HOLLOW WOODS` — `KYOSHIRO STUDIO`
- **Mode:** `DESIGN PLANNING ONLY` (`0` dựng cutscene, `0` tạo asset video/ảnh mới, `0` sửa `MainMenuScene.ts`, `GameScene.ts` hay `SaveManager.ts`)
- **Dependencies:** `Unified Edition Ch. 09` (`CIN-K13`, `CS01–06`), `Ch. 16–17` (`NAR-023`, `OQ-01–03`, `OQ-19`, `OQ-20`), [SOURCE_IMPACT_MATRIX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/SOURCE_IMPACT_MATRIX.md), [HW_TRAILER_VISUAL_AND_AUDIO_REFERENCE_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_TRAILER_VISUAL_AND_AUDIO_REFERENCE_REPORT.md)

---

## 1. Storyboard Đề Xuất `28 Giây` (`PROPOSED` — Chưa Duyệt Canon)

Theo `Ch. 09` (`Table 05`) và `CIN-K13`, **bản Prologue `28s` tách biệt hoàn toàn khỏi Intro Studio (`00–10s`) và Trailer `V12.2` (`70s`)**:
- **NGUYÊN TẮC BẮT BUỘC (Anti-Spoiler & Chống Lấy Nhầm Trailer):**
  1. **KHÔNG tự tiết lộ tên `Meliodas`, họ `Blackwood`, `The Wolf Lord` hay chức danh `Chỉ Huy`** trong bất kỳ lời dẫn, hình ảnh hay tiêu đề nào của phân đoạn mở đầu (`CONFLICT C04` / `OQ-01`).
  2. **KHÔNG phát lại nguyên video Trailer `70s` (`V12`/`V12.2`)** làm Opening game vì Trailer chứa spoil nặng ở nửa sau (Mire Warden battle, Satyr, cảnh hang Dark Knight & Vaelen).
  3. **KHÔNG khẳng định tác nhân gây tiếng gọi (`OQ-02`)** hay cơ chế xuyên thời gian/tự phong ấn (`OQ-03`, `OQ-08`) cho tới khi Owner chốt nhóm `OQ-01–09`.

| Shot | Thời lượng | Hình ảnh theo Storyboard `CS01–06` (`PROPOSED`) | Lời dẫn mẫu (`PROPOSED` — Chờ duyệt câu chữ) | Ghi chú bảo vệ cốt truyện & âm thanh |
| :---: | :---: | :--- | :--- | :--- |
| **`CS01`** | `0–4s` | Rừng xưa ánh nắng mờ, bóng lưng **một người thầy** cùng **hai kỵ sĩ trẻ** tập luyện (giữ góc khuất mặt). | *"Đã từng có một lời thề, được trao dưới tán rừng già."* | Không hiện mặt/tên riêng, không ghi rõ `Vaelen`/`Mordric` trên màn hình. |
| **`CS02`** | `4–9s` | Cận cảnh huy hiệu trên tay và hai kỵ sĩ trẻ đứng cạnh nhau dưới tán lá. | *"Có những người đã dành cả đời để gìn giữ nó."* | Chơi motif cello `D–F–E–A` rất nhẹ; không khẳng định tổ chức `Order of the Black Wolf` khi chưa duyệt `OQ-K06`. |
| **`CS03`** | `9–14s` | Nhân vật chính rảo bước trên lối mòn rừng già khi màn sương dày dần, một tia sáng nhạt ở xa. | *"Hãy lắng nghe… khu rừng cần ngươi."* | **1 tiếng chuông ngắn (~2.8s fade-out, chuẩn `V12.2`)**, không rung chuông lặp; giữ câu gọi ở mức mơ hồ (`OQ-02`). |
| **`CS04`** | `14–19s` | Lối mòn biến đổi, màn sương phủ khung hình; bóng cây và dấu vết thời gian lướt qua êm dịu. | *"Nhưng có những con đường không dẫn về cùng một thời đại."* | **Chuyển cảnh Alpha dịu, KHÔNG flash trắng gắt** (an toàn ánh sáng & `Reduced Motion`). |
| **`CS05`** | `19–24s` | Nhân vật chính mở mắt cạnh thềm đá rêu và gốc cổ thụ tại `Fog Crossing`. | *"Khi tỉnh lại, mọi thứ đều xa lạ… kể cả chính mình."* | Bắt đầu hòa sang `ambience_crossing` nền thực của `fog_crossing`. |
| **`CS06`** | `24–28s` | Camera hạ mượt về khung nhìn gameplay `640×360` (`zoom ~2.2x`), Đèn Hộ Tâm ánh sáng ấm nhẹ. | *"Khu rừng vẫn nhớ những gì ngươi đã quên."* | Fade hết phụ đề, trả quyền điều khiển tại `fog_crossing` & kích hoạt nhịp dẫn đầu `startAct0Intro()` (`The Echo`). |

---

## 2. So Sánh `3` Phương Án Triển Khai Kỹ Thuật (`A / B / C` — Chờ `OQ-19`)

Hiện trạng mã nguồn thực tế (`HEAD 11d91dd5`): **KHÔNG tồn tại** `OpeningCutsceneScene.ts`, `Act0Scene.ts` hay `Act1Scene.ts` (`SOURCE_IMPACT_MATRIX.md §1`). Luồng hiện hành đi thẳng từ [MainMenuScene.ts:290-297](file:///G:/HOLLOW%20WOODS/src/scenes/MainMenuScene.ts#L290-L297) (`startNewGame()`) → `SCENE_GAME` (`isContinue: false`) → [GameScene.ts:1393-1430](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L1393-L1430) (`startAct0Intro()`).

| Tiêu chí so sánh | Phương án A: In-Engine Cutscene | Phương án B: Pre-Rendered Video (`1080p MP4/WebM`) | Phương án C: Hybrid (`Keyframe Lớp Tách` + `In-Engine Handoff`) — **ĐỀ XUẤT KỸ THUẬT** |
| :--- | :--- | :--- | :--- |
| **Cách dựng** | Dùng tilemap/sprite nhân vật thật trong Phaser, camera tween & text box `Dark Moss`. | Phát 1 file video dựng sẵn (`public/assets/cinematics/prologue.mp4` + phụ đề `.json`). | `CS01–05` dùng 5–6 cảnh **Pixel Keyframe đa lớp (`background / nhân vật / sương overlay`)** nhẹ dựng trực tiếp trong Phaser Overlay Scene; `CS06` crossfade thẳng sang camera thật của `fog_crossing`. |
| **Chất lượng & Đồng bộ Pixel Art** | Đồng bộ `100%` độ phân giải logic `640×360` *nearest-neighbor*; nhưng đòi hỏi phải có trước sprite hồi tưởng (người thầy + 2 kỵ sĩ trẻ chưa sản xuất). | Hình ảnh giàu chi tiết nhất (mức trailer), nhưng khi resize về canvas game `1280×720` hoặc `360p` dễ mất độ sắc pixel. | **Cân bằng tối ưu:** Keyframe pixel art `640×360` sắc nét tuyệt đối khi phóng to; không phụ thuộc đủ bộ animation combat cho kỵ sĩ quá khứ. |
| **Dung lượng & Rủi ro Mạng (`P2Game.io`)** | Rất nhẹ (`< 500 KB`), 0 rủi ro HTTP `206` Range. | Nặng (`15–40 MB`), từng có tiền lệ rủi ro `BUG-024` (P2Game CDN HTTP `206` Partial Content / autoplay policy trình duyệt). | **Rất nhẹ (`~1–3 MB` tổng 6 gói PNG/WebP 360p/720p)**, nạp nhanh ngay qua Phaser `LoaderPlugin`, **0 rủi ro streaming MP4 HTTP 206**. |
| **Hỗ trợ `Reduced Motion` & Skip Tức Thì** | Mượt, dễ tắt rung/pan camera; cắt tween là vào gameplay ngay. | Khó giảm chuyển động vì hình ảnh đã nướng cứng vào video; dễ giật audio khi seek/skip. | **Tốt nhất:** Chế độ bình thường có parallax sương + pan chậm; bật `Reduced Motion` chuyển sang đổi slide tĩnh mượt + ẩn rung màn hình; nhấn Skip là nhảy thẳng sang `CS06`/gameplay trong `300ms`. |
| **Rủi ro kỹ thuật** | Dễ chạm va chạm/NPC/AI nếu dựng chung trong `GameScene` đang chạy tick physics. | Rủi ro lỗi codec giữa Chromium / Safari / Electron & mất đồng bộ subtitle khi lag. | Thấp nhất; chỉ cần quản lý gọn một Overlay Scene/State riêng tách khỏi vòng lặp physics cho tới bước `CS06`. |

> **Khuyến nghị kiến trúc:** Nếu Owner duyệt thực hiện Prologue `28s`, **Phương án C (Hybrid)** là tối ưu cho bản phát hành Web/Desktop (`P2Game.io` & Vite build), vừa giữ được chất điện ảnh hồi tưởng qua tranh pixel chuẩn `640×360` vừa tránh rủi ro dung lượng/streaming video của Phương án B và tránh tốn công sản xuất bộ sprite nhân vật quá khứ đầy đủ animation của Phương án A. *(Toàn bộ vẫn ở trạng thái **`PROPOSED`** chờ `OQ-19`)*.

---

## 3. Đặc Tả Điều Khiển, Input Lock, Skip, Continue, Fallback & Save Schema

### 3.1 Luồng Trigger `New Game` vs `Continue`
```text
[MainMenuScene]
  ├─ "BƯỚC VÀO MÀN SƯƠNG" (startNewGame, isContinue = false)
  │     ├─ Reset local save (giữ nguyên SaveManager.clearSave() hiện hành)
  │     ├─ [Nếu Prologue bật & chưa skip trước đó] ─► OpeningCutsceneOverlay (CS01..CS06, max 28s)
  │     │        ├─ Hoàn tất tự nhiên (28s) ──┐
  │     │        ├─ Người chơi nhấn Skip ─────┼─► Ghi flag storyFlags: 'prologue_seen'
  │     │        └─ Fallback lỗi tải media ───┘     └─► GameScene.startAct0Intro() tại fog_crossing
  │     └─ (Nếu Prologue tắt theo config) ─► Vào thẳng GameScene.startAct0Intro()
  │
  └─ "TIẾP TỤC HÀNH TRÌNH" (continueGame, isContinue = true)
        └─ BỎ QUA HOÀN TOÀN PROLOGUE ─► Load SaveData vào đúng zoneId / checkpoint đã lưu
```
*(Tùy chọn mở rộng `PROPOSED`: Nút **"Xem lại mở đầu / Gallery"** ở Menu phụ hoặc Chronicle Modal chỉ chạy trình chiếu xem lại rồi trả về Main Menu, **tuyệt đối không** reset hay ghi đè save hiện có).*

### 3.2 Quy Tắc `Input Lock`, `Skip` & Khôi Phục Sạch Tài Nguyên
1. **Input Lock khi đang chạy Prologue:**
   - Khóa toàn bộ input di chuyển `WASD/Arrows`, đánh/né, dùng đèn `[F]`, mở túi/sổ tay/bản đồ/chế tạo `[I / J / C / M / Tab]` và tạm dừng `GameScene` physics/AI/Composure drain (bảo đảm nhân vật không bị mất Tinh Thần hay bị thực thể tấn công trong lúc xem cutscene).
   - Ẩn toàn bộ HUD gameplay (`UIScene`), chỉ hiển thị khung letterbox mỏng, phụ đề tiếng Việt font chuẩn `#E8DFC8` trên dải nền mờ `#141712` (`alpha 0.78`), và nhãn hướng dẫn góc phải dưới: **`[ESC / ENTER] Bỏ qua`**.
2. **Hành vi `Skip` & Tự Tạm Dừng Mất Focus:**
   - Nhấn `ESC`, `ENTER`, `SPACE` hoặc click nút `Bỏ qua` ở góc: kích hoạt `skipFadeOut` (`300ms` fade đen nhanh, chống nhấp nháy) → hủy toàn bộ timer/tween/audio cue của Prologue → mở khóa ngay sang `fog_crossing`.
   - Khi cửa sổ trình duyệt mất focus (`blur` / `visibilitychange === hidden`): tự động tạm dừng đồng hồ đếm thời gian cutscene & tạm hạ âm lượng cue, khôi phục khi quay lại tab để tránh lỡ lời dẫn.
3. **Hợp đồng Cleanup Bắt Buộc (`Zero Leaks / Zero Softlock`):**
   - Trước khi giao quyền lại cho `GameScene`: xóa toàn bộ `this.time.delayedCall` nội bộ cutscene, stop tweens, ngắt kết nối audio cue prologue, khôi phục camera zoom (`~2.2x`) & target follow `player`, kiểm tra `UIScene` hiển thị đúng HUD, gắn `'prologue_seen'` vào `PlayerState.storyFlags`, và giữ nguyên checkpoint Act 0 (`fog_crossing` → `x ≥ 280` `updateAct0Progression`).

### 3.3 Chiến Lược `Fallback` 2 Tầng Khi Lỗi Asset Hoặc Thiếu Kết Nối
- **Tầng 1 (Lỗi tải 1 phần asset / Video codec lỗi ở PA B):** Tự động chuyển sang bộ `6` thẻ keyframe tĩnh tối giản (hoặc chữ dẫn truyện nền Dark Moss + sương procedural sẵn có) không làm đứng màn hình.
- **Tầng 2 (Lỗi toàn bộ media hoặc timeout > `3,000 ms`):** Ghi `console.warn` có cấu trúc, bỏ qua sạch Prologue, **không ghi lỗi chết game**, và gọi thẳng `GameScene.startAct0Intro()` như luồng baseline hiện tại.

### 3.4 Tương Thích `SaveManager` (`CURRENT_SCHEMA_VERSION = 3`)
Kiểm tra trực tiếp [SaveManager.ts:68](file:///G:/HOLLOW%20WOODS/src/systems/SaveManager.ts#L68) & [SaveManager.ts:386-454](file:///G:/HOLLOW%20WOODS/src/systems/SaveManager.ts#L386-L454):
- **KHÔNG tăng `CURRENT_SCHEMA_VERSION`** (giữ nguyên `3`) và **KHÔNG thêm key top-level mới dễ gãy cloud migration**.
- Cờ `'prologue_seen'` lưu trực tiếp dưới dạng chuỗi phần tử trong mảng **`storyFlags: string[]`** đã tồn tại sẵn trong `SaveData` & `PlayerState` ([PlayerState.ts:79,405](file:///G:/HOLLOW%20WOODS/src/state/PlayerState.ts#L79)).
- Các file save cũ (V1.3 / V1.4 / V1.5) không chứa `'prologue_seen'`, nhưng vì khi bấm **`Continue`** (`isContinue === true`) không bao giờ mở Prologue, toàn bộ save cũ & save cloud (`CloudSaveService.ts`) hoạt động trơn tru 100% mà không phải reset hay migrate cưỡng bức.

---

## 4. Phần Đã Duyệt vs Các Quyết Định Cần Owner Chốt (`OQ-19`, `OQ-20`)

- **Đã khóa về mặt kỹ thuật (`BASELINE PRESERVED`):** Save Schema `3`, cơ chế `Continue` không phát lại prologue, Act 0 checkpoint `fog_crossing`, không sửa gameplay/Vòng Sáng `[F]`, không tiết lộ tên `Meliodas` sớm.
- **Cần Owner quyết định trước khi code (`OQ-19` & `OQ-01..03`):**
  1. Chọn hình thức triển khai: **Phương án A (In-Engine)**, **B (Video 1080p)**, hay **C (Hybrid Keyframe + Live Handoff)**?
  2. Duyệt chính thức thời lượng `28s` (`CS01–CS06`), nguyên văn `6` câu dẫn tiếng Việt và mức độ mơ hồ của câu gọi ở `CS03` (`OQ-02`).
  3. Xác nhận có bổ sung tùy chọn **"Xem lại mở đầu"** trong Menu/Chronicle sau khi đã hoàn thành Act 0 hay không.
