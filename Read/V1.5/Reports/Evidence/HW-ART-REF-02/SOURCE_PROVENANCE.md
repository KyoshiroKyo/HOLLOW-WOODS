# Source Provenance — Meliodas Blackwood (Black Knight V2)

| Milestone | Branch / Tag | Full Commit SHA | Key Content | Archive Status |
|---|---|---|---|---|
| **Original Fellor V1.0** | `main` / `cb8ba12b` | `cb8ba12bcc0df69d2ae87416eef3cd6bd6c69835` | Fellor `Black_Knight_All_In_One_New.png` (`2592x1152`), 16 GIFs, WEB_Images, `License.txt`, `Read me.txt` | `03_LEGACY_ARCHIVE/Black_Knight_V1_0_Fellor` |
| **V1.4 Wayfarer Base** | `V14-P8-07` | `cb8ba12bcc0df69d2ae87416eef3cd6bd6c69835` | Early `wayfarer_*.png` base + `legacy_v14_wayfarer_portrait.png` | `03_LEGACY_ARCHIVE/V1_4_Wayfarer_Base_cb8ba12b` |
| **V1.5 Palette/Scale** | `V1.5` | `646f3d3e...` (archived snapshot) | Wayfarer V1.5 palette/scale adjustment | `03_LEGACY_ARCHIVE/V1_5_PaletteScale_646f3d3e` |
| **V1.5.2 Combat States** | `V1.5.2` | `b5eaa612...` (archived snapshot) | Wayfarer V1.5.2 CombatStates (`preview_wayfarer_4dir.png` etc.) | `03_LEGACY_ARCHIVE/V1_5_2_CombatStates_b5eaa612` |
| **Codex K1 — Armed Idle** | `feat/v1.5.3-batch04` | `0b16b7d4e531607de8bc98053f07a995367b3666` | `black_knight_armed_idle.{png,json}` — **`down/up/left` STILL ACTIVE IN RUNTIME** | `02_CURRENT_RUNTIME/` & `03_LEGACY_ARCHIVE/K1_ArmedIdle_0b16b7d4` (`PARTIAL_RUNTIME_ACTIVE_ARMED_IDLE`) |
| **Codex K2 v1 — Movement** | `feat/v1.5.3-batch04` | `4f6eb7e2a844e70b26a7f62b013d5d9274fc935f` | Superseded movement atlas `black_knight_movement` v1 | `03_LEGACY_ARCHIVE/K2_V1_Movement_4f6eb7e2` |
| **Codex K2 v2 — Unified V2** | `feat/v1.5.3-batch04` | `5feed142c9861b12ac0473ae535d8877c2faf814` | Unified movement (`armed_idle_right`, `armed_walk`, `unarmed_idle`, `unarmed_walk`) | `01_LATEST_ARTWORK/Atlases_Latest/K2_V2_5feed142` |
| **Codex K3 — Core Combat** | `feat/v1.5.3-batch04` | `0a927c226587a3f82957b06183138ecf9f9a6fe2` | `black_knight_core_combat.{png,json}` | `01_LATEST_ARTWORK/Atlases_Latest/K3_Combat_Defense_Skills` |
| **Codex K3 — Defense** | `feat/v1.5.3-batch04` | `6a64978d09b0f9f88c96b85f509a1c34ec097fe3` | `black_knight_defense.{png,json}` | `01_LATEST_ARTWORK/Atlases_Latest/K3_Combat_Defense_Skills` |
| **Codex K3 — Extended Skills** | `feat/v1.5.3-batch04` | `d383c52bd88d2b265db373e5b362cbf19a547d71` | `black_knight_extended_skills.{png,json}` | `01_LATEST_ARTWORK/Atlases_Latest/K3_Combat_Defense_Skills` |
| **Codex Conversion 34-Seq** | `feat/v1.5.3-batch04` | `6bb15b80479f1206e2eaba878cd5903434f63ea4` | 5 `black_knight_conversion_*` atlases (1,328 frames / 34 sequences) | `01_LATEST_ARTWORK/Atlases_Latest/Conversion_34Seq_6bb15b80` |
| **V1.5.3 Runtime Sync** | `feat/v1.5.3-ag-world-polish` | `11d91dd545b8bbaa8bb7e16e4587ddd12bfa233d` | Runtime atlases & scripts sync baseline | `02_CURRENT_RUNTIME/` |
| **Narrative Canon Checkpoint** | `feat/v1.5.3-ag-world-polish` | `f35da6d3867cc8c9714cfd293406c490d752e8c4` | HW-V16-A01 Canon Lock baseline | Reference Checkpoint |
| **Current Worktree HEAD** | `feat/v1.5.3-ag-world-polish` | `94d346fb1793dcf5042590896646e7f6d3e5b225` | HW-V16-A02 Runtime Lore Implementation (black_knight runtime unchanged) | Live Snapshot Source |

## Missing Intermediate Cloud Sheets (Transparent Ledger — Do Not Auto-Regenerate)

From `HW_CHAR_01_R2_CODEX_BLACK_KNIGHT_V2_RECOVERY.md` (§4.2):
- `armed_walk.png` (SHA prefix `e73402b383...`) — raw Codex Cloud input sheet, never committed standalone to GitHub or exported locally (`MISSING_FROM_GITHUB_AND_LOCAL`).
- `right_runs.png` (SHA prefix `7daa29509e...`) — raw Codex Cloud input sheet (`MISSING_FROM_GITHUB_AND_LOCAL`).
- `unarmed_idle.png` (SHA prefix `caa36cd098...`) — raw Codex Cloud input sheet (`MISSING_FROM_GITHUB_AND_LOCAL`).

All extracted frames from these sheets remain 100% lossless inside `01_LATEST_ARTWORK/Atlases_Latest/` and `01_LATEST_ARTWORK/Spritesheets_4Dir/`.
