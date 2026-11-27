# Nhiệm vụ Codex đầu tiên · BUG-059 Artwork Fidelity Recovery

**Đề xuất** · Chốt đầu vào mỹ thuật cho 96 frame Idle/Walk của Meliodas Black Knight V2. Baseline kỹ thuật đo trong R1 là B08 `c9de0c21`. Trước khi bắt đầu lượt tích hợp, xác nhận lại checkpoint GitHub với AG để bám đúng baseline sau công việc hợp nhất. Mức ưu tiên phát triển là P1, bắt đầu khi Owner giao lượt tiếp theo. [Ma trận frame và số đo](03_MELODIAS_ARTWORK_READINESS.md)

## Bàn giao và nghiệm thu

1. Design bàn giao bốn clip Armed Idle, Unarmed Idle, Armed Walk, Unarmed Walk, mỗi clip đủ 4 hướng × 6 frame. Kèm nguồn, phiên bản, quyền sử dụng, sơ đồ hướng/thứ tự, metadata cell/pivot và bản review cạnh Conversion Run. Owner nghiệm thu form giáp, plume, áo choàng, kiếm, silhouette và pose trước bước atlas.
2. Codex đo alpha, kích thước hình, chân và mật độ texel từng frame. Lập contact sheet và đề xuất atlas PNG/JSON với mapping đầy đủ, sau đó kiểm việc nạp qua Preload → registry → player. Duy trì key `wayfarer_*`, alias `satyr_*`, clip Run 12 frame, collider 18×12 và tốc độ 85/140 của B01. Giữ atlas K1/K2 có provenance để truy lại các frame cũ trong giai đoạn duyệt.
3. Kiểm 24 tổ hợp Idle/Walk/Run × 4 hướng × 2 trạng thái kiếm. Theo dõi chuyển Idle → Walk → Run → Walk → Idle, rút/tra kiếm và clip kế tiếp. Ghi frame/texture/origin/scale, foot anchor, timeline và hình cạnh nhau ở cùng zoom. Chạy đối chiếu WebGL trên GPU, smoke Canvas nếu khả dụng, TypeScript, build và hồi quy Save/Continue với fixture riêng. Owner duyệt artwork và tích hợp trước khi đưa lên nhánh tích hợp.

## Thứ tự sau khi khóa đầu vào

| Thứ tự | Hạng mục | Điều kiện vào |
|---|---|---|
| 1 | Meliodas Black Knight V2 Artwork Fidelity | Owner duyệt gói 96 frame và baseline tích hợp |
| 2 | UI/UX Design System | Duyệt hệ màu Dark Moss & Ember Gold, typography và các trạng thái input/độ tương phản trên UI hiện hành |
| 3 | Main Menu Remastered | Design system và quyền sử dụng menu artwork, kiểm New Game/Continue |
| 4 | HUD Remastered | Design system, các trạng thái sinh lực/thể lực/tinh thần, chiến đấu và Vòng Sáng |
| 5 | World Map & Minimap | Checkpoint C01/C02, thiết kế 17 vùng và duyệt riêng nếu hiển thị Minimap HUD |
| 6 | World Remastered | Topology và collision từng zone được nghiệm thu, tileset đủ nguồn/quyền |
| 7 | Performance Optimization | Tuyến benchmark đại diện, profile GPU và ngân sách thời gian khung hình |

Codex phụ trách kiến trúc và các hạng mục cần thiết kế chuyên sâu. AG tiếp tục phần bảo trì và QA, cùng B07/B08/C01/C02/A07 và HW-GIT-CONSOLIDATE-01. Phạm vi ký duyệt Headless Warden độc lập với BUG-059. D06, D07, E06 và DEC-LOCK-14 giữ ở trạng thái DEFERRED/RESERVED cho đến khi Owner nghiệm thu asset và mở Game Integration Gate. [Nhật ký Roadmap 3.1](https://docs.google.com/document/d/1rUDUUEYk0qazwe61z41ZD3Ns-o4Z_6LyoANDtX0YJtI/edit?tab=t.brtiuc7aeov2)
