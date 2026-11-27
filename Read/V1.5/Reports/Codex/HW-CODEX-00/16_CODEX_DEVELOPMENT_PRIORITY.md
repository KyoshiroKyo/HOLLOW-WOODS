# 16 — Ưu tiên Codex đề xuất

Các ID dưới đây đã có trong Roadmap. Mọi dòng là proposal, Owner duyệt task riêng trước thực thi. B07/B08/C01/C02/A07 tiếp tục thuộc AG.

| ID | Mức và mục tiêu | Dependency | Phạm vi dự kiến và phần bảo vệ | Deliverable / test / Owner gate |
|---|---|---|---|---|
| B02 / BUG-059 | P1 cao, artwork fidelity | Artwork có provenance từ Design, giữ B01 | Atlas Meliodas mới đã duyệt, metadata, Preload/registry/player khi cần. Bảo vệ K1/K2/K3 hiện có, Source Library, scale/collider, Save | Xác nhận 96 frame candidate, so sánh mật độ/pivot đủ hướng, 24 tổ hợp, Armed/Unarmed, round trip. Owner duyệt artwork và integration |
| C09 | P1 cao, World Map và đặc tả Minimap | C01/C02, art giấy da, UX approved | Map/Journal/HUD và dữ liệu trình bày riêng. Bảo vệ zone IDs, gate/discovery, quest, N/M, schema | 17 node candidate, zoom/pan + keyboard + spoiler test. Owner duyệt riêng nếu bật Minimap HUD |
| F01–F06 | P1 cao, profiling rồi tối ưu | B08 ổn định, thiết bị GPU thật, tuyến đại diện | Scene/world/render/audio theo bottleneck đo. Bảo vệ Classic Sanity, stable IDs, artwork, hiệu ứng và gameplay locks | HIGH/MEDIUM/low baseline, repeat restart/transition, cache/lifecycle, frame time, memory. Owner duyệt ngân sách và scope thay đổi |
| C03–C08, C10 | P1 cao, world/level thiết kế từng zone | C01/C02, map topology/fidelity | Tiled maps/zone decoration và collision đã duyệt. Bảo vệ route/gates/Save IDs | Hai chiều, Noclip OFF, collider và snapshot terrain; duyệt từng zone |
| D01–D05, D08 / E01–E05, E07 | P2 cao, character/monster/boss | Canon, art licensed, test state/world | Entities và registry cụ thể. Bảo vệ nội dung đã duyệt, CHAR-006 hold, ending thresholds | Encounter/animation/reward/reset/save, Owner duyệt từng thiết kế |
| D06/D07/E06 | DEFERRED, CHAR-006 | Design final, Lore proposal, Owner quyết định Canon và Game Integration | Tài liệu cho đến approval. Phạm vi runtime sẽ quyết riêng | Gate B/C/D, QA độc lập của AG. Không mở lúc này |

Main Menu/HUD remaster, dialogue và accessibility thuộc phần Owner cần chốt scope UI hoặc Roadmap hiện hữu. Trước nhiệm vụ code đầu tiên, Owner cần chọn ứng viên baseline và xác nhận hướng xử lý hai checkpoint A06-R1/A07; trong lúc đó Design có thể bàn giao dữ liệu phục hồi B02 theo quyền hiện hành.
