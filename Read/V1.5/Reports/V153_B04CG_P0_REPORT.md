# V153 04C-G — BUG-051 đến BUG-054

Baseline `27f237eb10e13c13d95848621f2adcad38a5df0d` trên `feat/v1.5.3-batch04`. Kiểm thử trên build local bằng Chromium Canvas. Việc đặt nhân vật cạnh NPC và cấp nguyên liệu cần thiết dùng fixture. Mở và tiến hội thoại, đóng bằng Escape, đổi mục theo dõi, đi qua cổng và Save/Continue dùng điều khiển trong game.

| Mã | Nguyên nhân và sửa | Kết quả |
|---|---|---|
| BUG-051 | Garth ghi `talked_to_villagers`, trong khi cổng đòi `talked_to_garth` cùng hai cờ khác. `PlayerState.ts` bỏ điều kiện ghép. `WorldGatingSystem.ts` dùng `east_gate_unlocked` cho Cổng Đông. | **PASS**. Trước sửa, hoàn tất cả ba thoại vẫn khóa. Sau sửa, collider ngừng chặn và đi bộ vào Crooked Path với Noclip tắt. |
| BUG-052 | `dialogues.json` đánh dấu đúng các thoại mở cổng. `DialogueSystem.ts` ghi cờ khi hoàn tất. `SaveManager.ts` phục hồi cờ và bảo toàn quyền vào cổng từ các save có dấu vết mở cổng cũ. `GameScene.ts` cập nhật lời nhắc và ghi tiến độ Q04 khi bước qua cổng. | **PASS**. Garth, Edda và Neris được thử trên ba New Game riêng. Cổng vẫn khóa lúc mở thoại, sau Escape và trước khi kết thúc câu phản hồi. Cả ba nhánh tiếp tục với cổng đã mở sau Continue schema 3. |
| BUG-053 | HUD chỉ đọc chặng điều hướng chính tuyến, nên việc nhận nhiệm vụ phụ không đổi tiêu đề. `QuestSystem.ts` cung cấp dữ liệu nhiệm vụ theo dõi cho HUD. `GameScene.ts` và `dialogues.json` ghi nhận chỉ dẫn tìm khuôn của Vaelen khi hoàn tất thoại. | **PASS**. Edda, Giữ Lửa Trong Sương, Dấu Vết Đồng Đội Cũ và chỉ dẫn tìm khuôn xuất hiện khi kết thúc thoại. |
| BUG-054 | Sổ Tay lưu lựa chọn riêng, World Map đọc chặng chính tuyến, còn Save ghi `currentQuestId`. `PlayerState.ts`, `UIScene.ts`, `JournalModal.ts`, `ParchmentWorldMapModal.ts` và `SaveManager.ts` dùng cùng lựa chọn. Tiến độ chính tuyến được giữ trong trường `flags` có sẵn để lựa chọn trong Sổ Tay không cấp quyền mở vùng. | **PASS**. Kiểm tra nhận, chọn mục khác, hoàn tất và Continue, gồm tiêu đề, ghim World Map và dấu hoàn tất. Chọn Q06 khi mới bắt đầu vẫn giữ khóa Cổng Đông và Miếu Chuông, kể cả sau Continue. |

TypeScript và build **PASS**. `test_v153_save_schema3.mjs` **PASS** cả hai ca. `test_v15_60_quest_chain_restructuring.mjs` **PASS 72/72**. `verify_v15_17_villager_stories.mjs` giữ **47/48** như baseline. Assertion còn lỗi kiểm lời giải cổ ngữ Rad, Isa, Algiz của `edda_rune_guide`.

Schema 3, quest ID và phần thưởng được giữ nguyên. Kiểm thử Chromium dùng SDK fixture cục bộ. [Dữ liệu trước sửa](Visuals/V153_B04CG_P0/baseline.json) · [Dữ liệu sau sửa](Visuals/V153_B04CG_P0/chromium.json)
