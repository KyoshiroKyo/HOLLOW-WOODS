# 08 — World Map và Minimap

World Map dùng 10 node tĩnh trong `ParchmentWorldMapModal.ts`, kèm số đếm `/10`, trong khi `zones.json` có 17 ID. Thiếu `sub_bell_workshop`, `sub_root_cellar`, `sub_whispering_clearing`, `drowned_mire_depths`, `whispering_grove_sanctum`, `sunken_crypt_ruins`, `veil_origin_cavern`. Node có cấu hình vị trí/landmark riêng; phần hiển thị visited cập nhật từ PlayerState. Journal dẫn vào bản đồ, và [N] đang chuyển tiếp tới cùng World Map qua `UIScene.toggleMiniMap()`. Giữ [M] cho mute. `MiniMapWidget` vẫn có lifecycle/update marker, nhưng [N] hiện mở bản đồ giấy da, không mở widget. [Topology](07_WORLD_17_ZONE_AUDIT.md)

| Thành phần | Hợp đồng đề xuất cho C09 | Gate QA |
|---|---|---|
| World Map bố cục giấy da | Tách vị trí đồ họa khỏi topology. Dùng registry 17 ID, label theo tiến trình và chỉ hiện các đường đã biết | Discovery/load, zoom/pan, focus/keyboard, marker quest/NPC và danh sách vùng khóa |
| Journal Map | Dùng cùng đầu vào hiển thị và quest tracking với [N] | Journal/map/HUD khớp sau đổi quest và Continue |
| Minimap HUD | Thiết kế tùy chọn ON/OFF, mũi hướng, marker visited/quest có cổng reveal; mặc định theo luật hiện hành | Owner duyệt riêng, khả năng đọc ở viewport hẹp, chi phí redraw/texture, không đổi Save schema |
| Mystery / FoW | Cùng predicate quyết định visibility cho label, icon, edge và tooltip | Không lộ node hoặc chi tiết lore trước tiến trình |

Chưa thử UI bản đồ mới vì audit chỉ khảo sát baseline. C01/C02 cung cấp route, gate và blocker độc lập trước khi chốt hình học đồ họa. Việc mở Minimap HUD cần Owner xác nhận theo quy tắc hiện hành.
