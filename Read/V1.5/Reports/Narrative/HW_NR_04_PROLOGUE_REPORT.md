# HW-NR-04 — PROLOGUE & ACT 0 RECONSTRUCTION REPORT (BẢN THẢO TRÌNH DUYỆT)

- **Mission ID:** `HW-NR-04 — PROLOGUE & ACT 0 RECONSTRUCTION`
- **Project:** `HOLLOW WOODS` — `KYOSHIRO STUDIO`
- **Agent:** `AG 4 Hydro High`
- **Dependencies:** `HW-NR-01` ([HW_CANON_OWNER_DECISION_MATRIX.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_CANON_OWNER_DECISION_MATRIX.md)) + `HW-NR-02` ([HW_NARRATIVE_RESIDUE_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/HW_NARRATIVE_RESIDUE_REGISTRY.md))
- **Trạng thái thực thi:** **`DRAFT SUBMITTED — STOPPED BEFORE SOURCE EDIT`** *(Tuân thủ tuyệt đối điều kiện khóa trong lệnh `HW-NR-04`: *"Nếu chưa có lời dẫn được duyệt đầy đủ, trình bản thảo và dừng trước khi sửa source"* — hiện `DEC-LOCK-02`, `DEC-LOCK-03`, `DEC-LOCK-07`, `DEC-LOCK-20` từ `HW-NR-01` chưa được Owner ký duyệt).*

---

## 1. Kiểm Chứng Hiện Trạng Act 0 & Ảnh Chụp Gameplay Thực Tế

Chạy kiểm tra trực tiếp trên trình duyệt headless Chromium (`1280×720`, Vite read-only dev server `?qa=1`, **`0` lỗi `pageerror` / `console.error`**, **`0` file `src/` bị sửa**). Toàn bộ `5` ảnh chụp thực tế lưu tại [Visuals/HW-NR-04-PROLOGUE/](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-04-PROLOGUE/):

| # | Tệp ảnh thực tế (`1280×720`) | Giai đoạn | Những gì quan sát trực tiếp trên màn hình |
| :-: | :--- | :--- | :--- |
| `01` | [01_main_menu_baseline.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-04-PROLOGUE/01_main_menu_baseline.png) | Main Menu | Hiện `HOLLOW WOODS` / `DỊ CẢNH RỪNG SƯƠNG` / `THE FOG THAT REMEMBERS`, nền Black Knight V2 sắc nét, khung `[H] ĐIỀU KHIỂN` gọn gàng. |
| `02` | [02_chronicle_modal_spoil.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-04-PROLOGUE/02_chronicle_modal_spoil.png) | Chronicle & Guide Modal (`[H]`) | **Phát hiện Spoiler P0:** Dòng 2 trong hộp Biên Niên Sử ghi thẳng *"Ngươi — **Chỉ huy Hiệp Sĩ Đen** mang mảnh ký ức ngủ vùi — thắp sáng **Đèn Lồng Hổ Phách**..."* (`MainMenuScene.ts:797`), dù bên dưới ghi `Hào Quang Hộ Tâm`. Tiêu đề `ĐIỀ U KHIỂN` có khoảng hở dấu thanh nhỏ. |
| `03` | [03_act0_fog_crossing_wake.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-04-PROLOGUE/03_act0_fog_crossing_wake.png) | Act 0 — `Fog Crossing` tỉnh dậy | HUD hiển thị **`The Mossbound Wayfarer`**, `[F] SÁNG: TẮT`, `Tinh Thần: 90/100`, Quest tracker `HỒI 1: LÀNG CHUÔNG BELLHOLLOW`, nhân vật đứng cạnh `[E] Đọc Mẩu Nhật Ký Cũ Bị Rách` và bóng `Echo`, phía Đông là cổng `Garth`. |
| `04` | [04_act0_telegraph_and_lantern.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-04-PROLOGUE/04_act0_telegraph_and_lantern.png) | Act 0 — Bật `[F]` & đi qua `x>=175` | Bấm `[F]` bật `Vòng Sáng Hộ Tâm` (`[F] SÁNG: BẬT`, `Tinh Thần: 92/100`), di chuyển Đông kích hoạt chuẩn popup `GameScene.ts:3353`: *"🍂 RĂNG RẮC! Có tiếng cành cây gãy sau lưng... Hãy đi theo ánh đèn phía trước!"*. |
| `05` | [05_act0_echo_bellhollow_entry.png](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Visuals/HW-NR-04-PROLOGUE/05_act0_echo_bellhollow_entry.png) | Act 0 — `Lối Mòn Xuyên Sương` & `Echo` | Hiện banner `LỐI MÒN XUYÊN SƯƠNG`. **Phát hiện lỗi tràn UI mới (`EchoSystem.ts:24`):** Thông điệp popup dài `143` ký tự của Echo (`"Tiếng vọng... một bóng hình lữ khách..."`) chạy tràn khỏi 2 mép ngang màn hình `1280px` do chưa cấu hình wrap chữ / rút gọn câu! |

---

## 2. Toàn Bộ Bảng Đối Chiếu Lời Dẫn Trước (Runtime Hiện Hành) vs Bản Thảo Đề Xuất (`PROPOSED`)

> **Quy tắc bảo vệ Canon & Anti-Spoiler:**
> - Danh xưng ban đầu giữ nguyên **`The Mossbound Wayfarer`** (*Lữ Khách Rêu Phong*).
> - **TUYỆT ĐỐI `0` chữ `Meliodas`, `Blackwood`, `The Wolf Lord` / `Lang Chủ`, hay `Chỉ Huy`** trong Prologue, Menu hay toàn bộ `Fog Crossing` (`Act 0`).
> - **KHÔNG tự khẳng định** nguồn tiếng gọi (`Rừng` / `The Veil` / `The Listener` / `The Echo`) hay số năm / cơ chế xuyên thời gian trong khi `OQ-02`, `OQ-03`, `OQ-08` chưa được Owner khóa.
> - Giữ nguyên hướng dẫn phím (`WASD`, `[F]`, `[E]`, `[J]`), điểm telegraph `x>=175`, điểm hoàn tất Act 0 `x>=280` (`Q00_WAKE_UP → Q01_MEET_EDDA`) và cơ chế `Vòng Sáng Hộ Tâm [F]`.

### 2.1 Đoạn Mở Đầu Mới — Opening Prologue `28 Giây` (`CS01–CS06`, `Ch. 09` — Chờ duyệt `DEC-LOCK-20`)

| Điểm chạm | Lời dẫn / Text TRƯỚC (`Runtime Hiện Hành`) | Bản Thảo ĐỀ XUẤT SAU (`PROPOSED` — Giữ nguyên tinh thần Bible Ch. 09, `0%` Spoiler) | Quy tắc bảo vệ |
| :--- | :--- | :--- | :--- |
| **`CS01` (`0–4s`)** | *(Chưa tồn tại — vào thẳng `fog_crossing` sau nút New Game)* | **Hình:** Rừng xưa mờ nắng, bóng lưng một người thầy vô danh và hai kỵ sĩ trẻ tập luyện.<br>**Dẫn:** *"Đã từng có một lời thề, được trao dưới tán rừng già."* | Không mặt, không tên `Meliodas` / `Vaelen` / `Mordric`. |
| **`CS02` (`4–9s`)** | *(Chưa tồn tại)* | **Hình:** Huy hiệu sờn dấu vết, hai kỵ sĩ trẻ đứng cạnh nhau.<br>**Dẫn:** *"Có những người đã dành cả đời để gìn giữ nó."* | Cello `D–F–E–A` rất nhẹ; không in tên `Order of the Black Wolf` nếu chưa duyệt `OQ-K06`. |
| **`CS03` (`9–14s`)** | *(Chưa tồn tại)* | **Hình:** Nhân vật bước dọc lối mòn giữa làn sương dày dần, le lói tia sáng xa.<br>**Dẫn:** *"Hãy lắng nghe… khu rừng đang cất tiếng gọi."* *(hoặc giữ mẫu Bible: *"Hãy lắng nghe… khu rừng cần ngươi."*)* | `1` tiếng chuông ngắn `~2.8s fade-out` (`V12.2`); giữ mở nguồn gốc lời cầu cứu (`OQ-02`). |
| **`CS04` (`14–19s`)** | *(Chưa tồn tại)* | **Hình:** Lối mòn đổi sắc dưới tầng sương trôi êm *(không flash trắng)*, dấu vết thời gian lướt qua.<br>**Dẫn:** *"Nhưng có những con đường không dẫn về cùng một thời đại."* | Không giải thích cơ chế xuyên thời gian / không nhắc `Algiz` (`OQ-03`). |
| **`CS05` (`19–24s`)** | *(Chưa tồn tại)* | **Hình:** Kỵ sĩ mặc giáp rêu phong mở mắt tại bìa rừng `Fog Crossing`.<br>**Dẫn:** *"Khi tỉnh lại, mọi thứ đều xa lạ… kể cả chính mình."* | Bắt đầu hòa `ambience_crossing`. |
| **`CS06` (`24–28s`)** | *(Chưa tồn tại)* | **Hình:** Camera hạ mượt về khung nhìn gameplay `640×360`, Vòng Sáng Hộ Tâm `[F]` tỏa sáng ấm.<br>**Dẫn:** *"Khu rừng vẫn nhớ những gì ngươi đã quên."* | Chỉ chạy `1` lần khi `New Game` (`storyFlags: prologue_seen`); `Continue` bỏ qua 100%. |

### 2.2 Đồng Bộ Văn Bản Menu, Loading & Act 0 (`Fog Crossing` → `Bellhollow`)

| Tệp & Dòng (`Runtime Key`) | Nội dung TRƯỚC (`Runtime Hiện Hành` — `00H / NR-02 Verified`) | Bản Thảo ĐỀ XUẤT SAU (`PROPOSED` — Chờ duyệt để sửa) | Ghi chú kỹ thuật & Save |
| :--- | :--- | :--- | :--- |
| `src/scenes/MainMenuScene.ts:795–798` (`Chronicle Modal`) | `'✦ DỊ CẢNH RỪNG SƯƠNG (THE FOG THAT REMEMBERS) ✦\nĐại Hồng Chung Bellhollow nứt đôi khiến mạch rễ tha hóa trỗi dậy, giam cầm thung lũng trong Màn Sương Ký Ức vĩnh cửu.\nNgươi — Chỉ huy Hiệp Sĩ Đen mang mảnh ký ức ngủ vùi — thắp sáng Đèn Lồng Hổ Phách để giữ vững Bình Tâm, giải mã cổ ngữ,\nvà quyết định vận mệnh thung lũng qua 3 Kết Thúc: ...'` | `'✦ HOLLOW WOODS ✦\nĐại Hồng Chung Bellhollow nứt vỡ, giam cầm cả thung lũng trong màn sương lạnh The Veil.\nMang danh hiệu Kẻ Lữ Hành mất hết ký ức, hãy giữ vững Vòng Sáng Hộ Tâm [F] và Bình Tâm, bước theo những dấu vết còn sót lại\nđể tìm lời giải phía sau màn sương và định đoạt vận mệnh Bellhollow.'` | Gỡ dứt điểm **`CONFLICT C04`** (*Chỉ huy Hiệp Sĩ Đen*) & chữ cũ *Đèn Lồng Hổ Phách*; giữ đúng hướng dẫn phím bên dưới. |
| `src/scenes/PreloadScene.ts:142` (`LORE_TIPS[1]`) | `'Đừng bao giờ bước chệch khỏi con đường mòn khi ngọn đèn lồng chưa được châm đầy dầu thông.'` | `'Đừng bao giờ bước chệch khỏi con đường mòn khi Thể Lực cạn kiệt khiến Vòng Sáng Hộ Tâm [F] tắt lịm.'` | Đồng bộ 100% với cơ chế Vòng Sáng Hộ Tâm `[F]` (`AI_IRON_RULES §3`). |
| `src/scenes/GameScene.ts:1419` (`startAct0Intro`) | `'🔔 Một tiếng chuông đồng mơ hồ ngân vang từ phía Đông màn sương...'` | `'🕯️ Giữa tầng sương lạnh, một tiếng gọi mơ hồ và dư âm chuông cổ khẽ vọng về từ phía Đông...'` *(chờ chốt `DEC-LOCK-03`)* | Hòa nhịp giữa lời cầu cứu rừng già (hướng mới) & tiếng chuông dẫn về Bellhollow (Act 0). |
| `src/scenes/GameScene.ts:3353` (`triggerAct0AtmosphereTelegraph` tại `x>=175`) | `'🍂 RĂNG RẮC! Có tiếng cành cây gãy sau lưng... Hãy đi theo ánh đèn phía trước!'` | `'🍂 RĂNG RẮC! Có tiếng cành cây gãy sau lưng... Bật Vòng Sáng [F] và tiến về ánh lửa phía trước!'` | Khớp điều khiển `[F]` thực tế và giữ nguyên vị trí trigger `x >= 175`. |
| `src/scenes/GameScene.ts:2731` (`updateAct0Progression` tại `x>=280`) | `'Echo: “Đi theo tiếng chuông... Làng Bellhollow ở ngay phía trước...”'` | `'Echo: “Lối vào làng Bellhollow ngay phía trước... Đừng để Vòng Sáng Hộ Tâm lụi tàn.”'` | Giữ nguyên complete `Q00_WAKE_UP`, chuyển `Q01_MEET_EDDA` & checkpoint save. |
| `src/systems/EchoSystem.ts:24` (`echo_fog_gate`) & `L112–115` | `L24`: Chuỗi `143` ký tự tràn màn hình (xem ảnh `05`).<br>`L113`: Tự đẩy `memoryAwakeningStage` lên `2` khi vừa chạm Echo ở đầu game! | Rút gọn text `L24` thành câu `<= 75` ký tự hoặc bật `wordWrap` trên popup UI để không tràn `1280px`; đồng thời **không tự tăng `stage = 2` ngay ở cổng làng** (`L113`) nếu lộ trình Reveal đặt `stage 2` tại Xưởng Chuông/Hầm Rễ. | Khắc phục lỗi tràn UI nhìn thấy ở ảnh `05` & chặn nhảy cóc `stage`. |
| `src/data/lore.json:181–196` (`Q00_WAKE_UP`) | `title`: `'HỒI 0: XUYÊN QUA MÀN SƯƠNG'`<br>`description`: `'Thoát khỏi màn sương The Veil và tìm kiếm dấu vết sự sống.'` | `KEEP` *(đã khớp `The Mossbound Wayfarer`, nhắc đúng `[WASD]` & `[F]`, không spoil `Meliodas`)*. | Bảo toàn 100% `questId` & `tasks` cho Save Schema `3`. |

---

## 3. Kế Hoạch Kiểm Thử Khi Owner Duyệt Bản Thảo (Queue `NR-REC-07` Tiếp Theo)

Sau khi Owner chốt `DEC-LOCK-02`, `DEC-LOCK-03`, `DEC-LOCK-07` và `DEC-LOCK-20` (chọn hình thức Prologue PA A / B / C và chốt văn bản ở §2), đợt code tiếp theo sẽ thực hiện đầy đủ các bài test bắt buộc:
1. `New Game` (Prologue → `fog_crossing` → `[F]` Hộ Tâm → `x>=175` telegraph → `x>=280` `Bellhollow`), kiểm tra `0` lỗi overflow trên câu dẫn mới.
2. `Skip` Prologue (`ESC` / `ENTER` / mất focus tab) + Fallback khi thiếu asset.
3. Kiểm `Continue` bằng Save Schema `3` cũ: **không phát lại Prologue**, giữ nguyên checkpoint, quest flags và `memoryAwakeningStage`.
4. Anti-Spoiler check (`NT-01`): **`0`** chữ `Meliodas`, `Lang Chủ`, `Wolf Lord`, `Chỉ Huy` trong suốt Menu, Loading, Opening và Act 0.

---

## 4. Khóa Dừng (`HARD STOP`)

- **Đã làm:** Kiểm toán mã nguồn Act 0 (`MainMenuScene.ts`, `GameScene.ts`, `PreloadScene.ts`, `EchoSystem.ts`, `lore.json`), chạy Playwright thu thập `5` ảnh gameplay hiện trạng (`0` lỗi console/page), phát hiện lỗi tràn chữ popup `EchoSystem.ts:24` và trình bản thảo đầy đủ Trước/Sau.
- **Chưa sửa (`STOPPED BEFORE SOURCE EDIT`):** Giữ nguyên `0` sửa đổi trên `src/`, `public/assets/`, map topology, quest flags, save schema, Sanity hay animation chờ **Owner** phê duyệt bản thảo & `HW_CANON_OWNER_DECISION_MATRIX.md`.
