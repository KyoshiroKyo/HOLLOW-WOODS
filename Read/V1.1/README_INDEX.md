# HOLLOW WOODS V1.1 — DOCUMENTATION INDEX & REMEDIATION REGISTRY

- **Dự án:** HOLLOW WOODS V1.1 – THE FOG THAT REMEMBERS (SƯƠNG MÙ GHI NHỚ)
- **Nhân vật chính:** **SATYR** (`SatyrPlayer`)
- **Trạng thái phát triển:** Đang tái cấu trúc và sửa chữa từng phần qua các Gate (Remediation Gates)

---

## 1. CẤU TRÚC THƯ MỤC TÀI LIỆU
```
Read/
├── V1/                     <-- Di sản lịch sử lưu trữ (Read-Only)
└── V1.1/                   <-- Tài liệu phát triển & Báo cáo kỹ thuật hiện hành
    ├── README_INDEX.md
    └── Reports/
        ├── GATE_1B_CRAFTING_AND_JOURNAL_UI_REPORT.md
        └── REMEDIATION/
            ├── GATE_1A_DIALOGUE_REPORT.md
            ├── GATE_1C_PAUSE_DEBUG_REPORT.md
            ├── GATE_2A_TERRAIN_ASSET_REPORT.md
            ├── GATE_2B_NPC_MONSTER_REPORT.md
            ├── GATE_3A_SATYR_ANIMATION_REPORT.md
            ├── GATE_3B_PERFORMANCE_REPORT.md
            ├── GATE_3C_ENDING_REPORT.md
            ├── evidence_dialogue_repaired.png
            ├── evidence_ending_repaired.png
            ├── evidence_modals_repaired.png
            ├── evidence_npc_monster_repaired.png
            ├── evidence_pause_debug_repaired.png
            ├── evidence_performance_gate_3b.png
            ├── evidence_satyr_movement_repaired.png
            ├── evidence_terrain_repaired.png
            ├── satyr_contact_sheet_88_frames.png
            └── satyr_contact_sheet_88_frames_2x.png
```

---

## 2. DANH MỤC BÁO CÁO KỸ THUẬT CÁC GATE (REMEDIATION GATES)

| Gate | Tên nhiệm vụ | Trạng thái | Báo cáo chi tiết |
| :---: | :--- | :---: | :--- |
| **Gate 0** | Forensic Verification & Remediation Planning | **HOÀN THÀNH** | Đã hoàn thành kiểm toán độc lập |
| **Gate 0.2**| Migration Readiness & Pre-commit Staging Review | **HOÀN THÀNH** | Đã phê duyệt phương án A |
| **Gate 0.2.3**| Approved Checkpoint Commit | **HOÀN THÀNH** | Commit `3e5524e` đã tạo thành công |
| **Gate 1A**| Repair Dialogue Architecture & NPC Interaction | **HOÀN THÀNH** | [GATE_1A_DIALOGUE_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.1/Reports/REMEDIATION/GATE_1A_DIALOGUE_REPORT.md) |
| **Gate 1B**| Repair Crafting & Journal UI Architecture | **HOÀN THÀNH** | [GATE_1B_CRAFTING_AND_JOURNAL_UI_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.1/Reports/GATE_1B_CRAFTING_AND_JOURNAL_UI_REPORT.md) |
| **Gate 1C**| Repair Pause Menu & Debug UI Positioning | **HOÀN THÀNH** | [GATE_1C_PAUSE_DEBUG_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.1/Reports/REMEDIATION/GATE_1C_PAUSE_DEBUG_REPORT.md) |
| **Gate 2A**| Terrain, Tileset & Sprite Extraction Integrity | **HOÀN THÀNH** | [GATE_2A_TERRAIN_ASSET_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.1/Reports/REMEDIATION/GATE_2A_TERRAIN_ASSET_REPORT.md) |
| **Gate 2B**| NPC & Monster Sprite Visual Repair | **HOÀN THÀNH** | [GATE_2B_NPC_MONSTER_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.1/Reports/REMEDIATION/GATE_2B_NPC_MONSTER_REPORT.md) |
| **Gate 3A**| Satyr Sprite Frame Mapping & Movement Repair | **HOÀN THÀNH** | [GATE_3A_SATYR_ANIMATION_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.1/Reports/REMEDIATION/GATE_3A_SATYR_ANIMATION_REPORT.md) |
| **Gate 3B**| Fog of War & UI Rendering Performance | **HOÀN THÀNH** | [GATE_3B_PERFORMANCE_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.1/Reports/REMEDIATION/GATE_3B_PERFORMANCE_REPORT.md) |
| **Gate 3C**| Ending Visibility & Soft-Lock Repair | **HOÀN THÀNH** | [GATE_3C_ENDING_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.1/Reports/REMEDIATION/GATE_3C_ENDING_REPORT.md) |

---

## 3. CÁC TÀI LIỆU THỊ GIÁC & SƠ ĐỒ BẰNG CHỨNG
- [evidence_ending_repaired.png](file:///G:/HOLLOW%20WOODS/Read/V1.1/Reports/REMEDIATION/evidence_ending_repaired.png): Sơ đồ phân tích kỹ thuật và đối chiếu Before/After khắc phục BUG-10 (chuyển giao sang UIScene Zoom 1.0, hiển thị toàn vẹn 7 dòng chữ và nút Quay Về Menu Chính, chống Soft-lock).
- [evidence_performance_gate_3b.png](file:///G:/HOLLOW%20WOODS/Read/V1.1/Reports/REMEDIATION/evidence_performance_gate_3b.png): Sơ đồ đo đạc định lượng hiệu năng Fog of War (loại bỏ 3,600 Graphics/phút, dirty checking) và UI (giảm 99.9% lệnh vẽ hình học, memoize HDTextHelper).
- [satyr_contact_sheet_88_frames.png](file:///G:/HOLLOW%20WOODS/Read/V1.1/Reports/REMEDIATION/satyr_contact_sheet_88_frames.png): Bản in tiếp xúc 88 frame có đánh số thứ tự ô từ F0 đến F87 chuẩn xác theo 4 hướng và 5 nhóm hành động.
- [satyr_contact_sheet_88_frames_2x.png](file:///G:/HOLLOW%20WOODS/Read/V1.1/Reports/REMEDIATION/satyr_contact_sheet_88_frames_2x.png): Bản in tiếp xúc 88 frame phóng to 2x sắc nét.
- [evidence_satyr_movement_repaired.png](file:///G:/HOLLOW%20WOODS/Read/V1.1/Reports/REMEDIATION/evidence_satyr_movement_repaired.png): Sơ đồ ma trận di chuyển chéo không rung lắc (BUG-05), bảo tồn frame index khi đổi Walk/Run, Stamina Hysteresis và các trạng thái chiến đấu (Attack/Hurt/Death).
- [evidence_dialogue_repaired.png](file:///G:/HOLLOW%20WOODS/Read/V1.1/Reports/REMEDIATION/evidence_dialogue_repaired.png): Sơ đồ phân bố hình học hộp thoại đối thoại NPC chuẩn HD tại (640, 590).
- [evidence_modals_repaired.png](file:///G:/HOLLOW%20WOODS/Read/V1.1/Reports/REMEDIATION/evidence_modals_repaired.png): Sơ đồ phân bố hình học Bàn Chế Tạo & Sổ Tay chuẩn HD tại (640, 360).
- [evidence_pause_debug_repaired.png](file:///G:/HOLLOW%20WOODS/Read/V1.1/Reports/REMEDIATION/evidence_pause_debug_repaired.png): Sơ đồ phân bố hình học Menu Tạm Dừng tại (640, 360) và Bảng F4 Debug tại (24, 140) ở Zoom 1.0 cố định.
- [evidence_terrain_repaired.png](file:///G:/HOLLOW%20WOODS/Read/V1.1/Reports/REMEDIATION/evidence_terrain_repaired.png): Sơ đồ so sánh Before/After và mô phỏng in-game 4×4 khắc phục BUG-04 tile cỏ rừng và tile bùn lầy.
- [evidence_npc_monster_repaired.png](file:///G:/HOLLOW%20WOODS/Read/V1.1/Reports/REMEDIATION/evidence_npc_monster_repaired.png): Sơ đồ đối chiếu Before/After hoạt ảnh The Listener, thực thể The Echo, và 3 NPC/Chân dung chuẩn HD.
