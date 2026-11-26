# HW-NR-18 — CINEMATIC AUDIO INTEGRATION REPORT

- **Mission ID:** `HW-NR-18`
- **Project:** `HOLLOW WOODS` — `KYOSHIRO STUDIO`
- **Agent:** `AG 4 Hydro High` / Codex
- **Dependencies Checked:**
  - `HW-NARRATIVE-00E`: [HW_TRAILER_VISUAL_AND_AUDIO_REFERENCE_REPORT.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/HW_TRAILER_VISUAL_AND_AUDIO_REFERENCE_REPORT.md)
  - `HW-NARRATIVE-00G`: [AUDIO_INTEGRATION_PLAN.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/AUDIO_INTEGRATION_PLAN.md) (`DESIGN PLANNING ONLY`)
  - [HW_AUDIO_ASSET_INDEX.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-ASSET-01/HW_AUDIO_ASSET_INDEX.json)
  - [OWNER_DECISIONS_REQUIRED.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/OWNER_DECISIONS_REQUIRED.md) (`OQ-20 (a)`, `AUDIO-LIC`)
  - [CANON_DECISION_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/CANON_DECISION_REGISTRY.md) (`AUD-K12`, `NAR-028`, `NAR-029`)
- **Overall Execution Status:** **`PARTIAL / INTEGRATION BLOCKED — AWAITING APPROVED AUDIO BIBLE, V12.2 DAW STEMS & NARRATIVE EVENT APPROVAL`** (`0` edits to `src/` and `public/assets/`)

---

## 1. Executive Conclusion

1. **Completed (`READ-ONLY + ACOUSTIC & LIVE RUNTIME QA`):**
   - Full inventory and legal/license audit of all **`65` runtime audio files** in `public/assets/audio/` and **`1,216` source entries** in [HW_AUDIO_ASSET_INDEX.json](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Evidence/HW-ASSET-01/HW_AUDIO_ASSET_INDEX.json).
   - Direct FFmpeg EBU R128 (`LUFS` / `LRA` / `Peak dBFS` / `Duration` / `Sample Rate`) acoustic measurement across all runtime BGM, ambience, dialogue, and bell cues.
   - Live headless Chrome + Vite runtime execution covering `Volume sliders`, `Mute`, `Pause/Resume`, `Zone Transitions`, `Sanctuary Isolation`, `New Game`, `Continue`, `Audio Overlap / Cooldown`, and `Cleanup / stopAll()`.
2. **Blocked (`NO SOURCE / ASSET MUTATION APPLIED`):**
   - **No signed `APPROVED AUDIO BIBLE` exists:** [AUDIO_INTEGRATION_PLAN.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/AUDIO_INTEGRATION_PLAN.md) (`HW-NARRATIVE-00G`) is `DESIGN PLANNING ONLY`, and `AUD-K12` in [CANON_DECISION_REGISTRY.md](file:///G:/HOLLOW%20WOODS/Read/V1.5/Reports/Narrative/CANON_DECISION_REGISTRY.md#L36) remains **`TRAILER-ONLY`**.
   - **Missing `V12.2` DAW Stems (`OQ-20 (a)`):** Only the stereo mixdown `HOLLOW_WOODS_V12_2_CINEMATIC_SOUNDTRACK.mp3` (`01:00.00`, `48kHz 320 kbps`, `2,401,964 B`) is available. Individual separated stems (`bgm_prologue_memory`, `bgm_vaelen_oath_cello`, `bgm_dark_knight_dissonance`, `bgm_ending_unbroken`) do not exist in the workspace, and per `HW-NR-18` & `AUD-K12` the full trailer mix MUST NOT be looped as gameplay BGM.
   - **Narrative Audio Sync Blocked Upstream:** Opening Prologue (`HW-NR-16`) and In-Game Cinematic Events (`HW-NR-17`) remain blocked pending Owner decisions `DEC-LOCK-01..20`.
   - **Unverified License Pack (`AUDIO-LIC`):** `27` WAVs in `Mystic_Autumn_Knights` (`wantosure`) remain license-unverified (`UNKNOWN`).

---

## 2. Audio Inventory & Objective Acoustic Measurements (`FFmpeg EBU R128`)

Measured directly on `65` runtime files under `G:\HOLLOW WOODS\public\assets\audio\`:

| Category / File | Duration | Format | Integrated (`LUFS`) | `LRA` (`LU`) | Peak (`dBFS`) | Size (`Bytes`) | Role & Observation |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `bgm/beyond_the_hills.mp3` | `03:06.23` | `44.1kHz stereo` | `-13.8` | `4.1` | `-3.0` | `7,449,077` | Outer Woods day BGM |
| `bgm/embervale.mp3` | `02:58.00` | `44.1kHz stereo` | `-14.7` | `4.2` | `-4.0` | `7,119,934` | Registered night campfire BGM track |
| `bgm/evergrove.mp3` | `03:20.02` | `44.1kHz stereo` | `-17.5` | `3.3` | `-4.5` | `8,000,783` | `sub_whispering_clearing` BGM |
| `bgm/forgotten_orchard.mp3` | `03:15.06` | `44.1kHz stereo` | `-15.7` | `5.9` | `-2.6` | `7,802,253` | Workshop / Root Cellar / Torn Page reading BGM |
| `bgm/knights_quiet_fire.mp3` | `03:14.12` | `44.1kHz stereo` | `-15.4` | `5.7` | `-3.8` | `7,764,636` | Sir Vaelen Sanctuary exclusive BGM |
| `ambience/ambience_crossing.mp3` | `02:30.72` | `48kHz stereo` | `-24.8` | `2.3` | `-13.2` | `2,771,121` | Wind through foliage (`fog_crossing`, cavern, cellar, chasm) |
| `ambience/ambience_village.mp3` | `01:11.96` | `48kHz stereo` | `-32.3` | `1.4` | `-17.1` | `1,557,211` | Hearth / furnace embers (`bellhollow`, `sanctuary_farm`, workshop) |
| `ambience/ambience_forest.mp3` | **`00:13.67`** | `48kHz stereo` | **`-12.8`** | `1.9` | **`-1.1`** | `134,574` | **Loudness & loop-length anomaly:** `+12 to +24 dB` hotter than other ambients and short `13.67s` loop |
| `ambience/ambience_mire.mp3` | `00:17.25` | `48kHz stereo` | `-36.9` | `1.3` | `-19.8` | `303,521` | Quiet marsh ambience (`silent_mire`, ruins, shrine) |
| `sfx/bell_low.mp3` | **`00:11.22`** | `48kHz stereo` | `-21.7` | `6.2` | `-9.2` | `173,492` | `bronze_bell` — long `11.22s` tail |
| `sfx/v14/bell_toll_low.wav` | **`00:11.22`** | `48kHz stereo` | `-21.7` | `6.3` | `-9.3` | `2,154,660` | `bell_toll_low` — matches `NAR-029` finding requiring future `~2.6–2.8s` short-fade cue |
| `dialogue/dialogue_garth.wav` | `00:00.34` | `44.1kHz mono` | `-70.0*` | `0.0` | `+0.1` | `109,854` | Short voice bark (*`<400ms` gating floor in EBU R128*) |
| `dialogue/dialogue_edda.wav` | `00:00.35` | `48kHz mono` | `-70.0*` | `0.0` | `0.0` | `117,766` | Short voice bark |
| `dialogue/dialogue_bram.wav` | `00:00.36` | `44.1kHz mono` | `-70.0*` | `0.0` | `0.0` | `113,502` | Short voice bark |
| `dialogue/dialogue_neris.wav` | `00:00.35` | `44.1kHz mono` | `-70.0*` | `0.0` | `0.0` | `113,154` | Short voice bark |
| `dialogue/dialogue_finn.wav` | `00:00.47` | `44.1kHz mono` | `-14.1` | `0.0` | `0.0` | `134,314` | Child voice bark |
| `dialogue/dialogue_text_blip.wav` | `00:00.45` | `44.1kHz stereo` | `-25.0` | `0.0` | `-7.8` | `119,864` | Dialogue typewriter blip (`45ms` cooldown) |

*(Reference Trailer `V12.2` from `HW-NARRATIVE-00E`: `-18.0 LUFS`, `LRA 12.1 LU`, `-0.9 dBFS` Peak; Bellhollow `14–24s` reduced `-5.9 dB` to `-32.1 dBFS`, Outro `-28.9 dBFS`.)*

---

## 3. Rights & License Audit (`public/assets/audio/` vs `HW_AUDIO_ASSET_INDEX.json`)

| Source / License Group | Count | Usage Status | Compliance Requirements / Notes |
| :--- | :---: | :---: | :--- |
| `The Knight's Quiet Fire` (Gates of Vortalania) | `5` BGM MP3 | `ACTIVE-RUNTIME` | Custom Game Asset for HOLLOW WOODS; cleared for runtime |
| `Super Dialogue Audio Pack` (Dillon Becker) | `5` Dialogue WAV | `ACTIVE-RUNTIME` | **CC BY 4.0** — Must credit `Dillon Becker` & voice actors in Game Credits |
| `8-bit 16-bit Sound Effects (x25) Pack` | `13` UI/Cue WAV/MP3 | `ACTIVE-RUNTIME` | Royalty-Free UI Pack; no raw asset redistribution; Private archive only |
| `OpenGameArt / Horror SFX Royalty-Free` | `42` Ambience/SFX | `ACTIVE-RUNTIME` | Royalty-Free synchronized runtime usage; no raw source redistribution |
| `Mystic_Autumn_Knights` (`wantosure`) | `27` WAVs | **NOT IN RUNTIME (`UNKNOWN`)** | Blocked by `AUDIO-LIC` until author license verified |
| Unclassified Source Archive entries (`UNKNOWN`) | `635` (of `1,216` source) | Non-runtime | Require manifest verification before moving any asset to `public/` |

---

## 4. Runtime Audio Bugs & Integration Gaps Identified (Source Audit + Live Chrome Run)

Verified by inspecting [AudioManager.ts](file:///G:/HOLLOW%20WOODS/src/audio/AudioManager.ts), [SettingsManager.ts](file:///G:/HOLLOW%20WOODS/src/systems/SettingsManager.ts), and [GameScene.ts](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts), and reproduced live in Headless Chrome (`console_errors = []`, `page_errors = []`):

1. **`Music` Slider vs BGM Volume Desync (`BUG`):**
   - [MainMenuScene.ts:466](file:///G:/HOLLOW%20WOODS/src/scenes/MainMenuScene.ts#L459-L468) and [PauseModal.ts:293](file:///G:/HOLLOW%20WOODS/src/ui/PauseModal.ts#L293) call `settings.setMusicVolume(val)`.
   - [SettingsManager.ts:146, 322](file:///G:/HOLLOW%20WOODS/src/systems/SettingsManager.ts#L142-L157) calls ONLY `AudioManager.getInstance().setMusicVolume(val)` ([AudioManager.ts:687-696](file:///G:/HOLLOW%20WOODS/src/audio/AudioManager.ts#L687-L696)), which updates `this.ambienceVolume`, **leaving `this.bgmVolume` unchanged**.
   - **Live measurement:** After `setMasterVolume(0.5)` + `setMusicVolume(0.2)`, `ambience` dropped `0.7 → 0.2`, while `bgm` stayed **`0.55`** (`currentBGMAudio.volume = 0.275` instead of `0.100`). Only calling `setBGMVolume(0.2)` updated `currentBGMAudio.volume` to `0.1`.
2. **`Mute [M]` Shortcut Desync (`BUG`):**
   - [GameScene.ts:1108](file:///G:/HOLLOW%20WOODS/src/scenes/GameScene.ts#L1103-L1112) calls `this.audioManager.toggleMute()` directly instead of syncing `SettingsManager.getInstance().toggleMute()`, so keyboard mute does not persist into settings UI/storage.
3. **In-Game `PauseModal` vs `AudioManager`:**
   - Opening `PauseModal` keeps `AudioManager.ctx.state === 'running'` (`main.ts:137-143` only pauses `game.sound.pauseAll()` on `window.p2.onPause`, not Web Audio `ctx` or streaming `HTMLAudioElement`).
4. **Knight Dialogue Voice Fallback (`playNPCSpeech`):**
   - [AudioManager.ts:2287-2308](file:///G:/HOLLOW%20WOODS/src/audio/AudioManager.ts#L2287-L2308) has branches only for `edda`, `neris`, `bram`, `finn`, `garth` — so **`Sir Vaelen`** (`17` dialogue keys) and **`Hooded Knight` / `Sir Mordric`** fall back to `dialogue_garth.wav`.
5. **Ambience Loudness Spread & Bell Overlap Risk:**
   - `ambience_forest.mp3` (`-12.8 LUFS`, `13.67s`) is `~12–24 dB` louder than `crossing` (`-24.8`), `village` (`-32.3`), and `mire` (`-36.9`).
   - `bronze_bell` (`bell_low.mp3`, `11.22s`) uses an `800ms` cooldown (`AudioManager.ts:2581`), permitting simultaneous overlap (`bronzeCount = 2` observed live) if triggered ~1s apart.

---

## 5. Live Runtime Test Results (`Chrome Headless + Vite Dev Server`)

| `HW-NR-18` Test Case | Execution Result | Observed Runtime Metrics (`0` Console / Page Errors) |
| :--- | :---: | :--- |
| **`Volume sliders`** (`Master`, `Music`, `SFX`) | **PARTIAL / BUG FOUND** | `Master` (`1.0→0.5`), `Ambience` (`0.7→0.2`), `SFX` (`0.85→0.3`) updated; `Music` slider does not invoke `setBGMVolume` (`bgm` stayed `0.55` vs `0.2` via direct `setBGMVolume`). |
| **`Mute` toggle** | **PASS (Core Bus)** | `am.isMuted`: `false → true → false`; `0.08s` `masterGain` ramp & `HTMLAudioElement.volume` zeroing active. *(See `[M]` settings persistence note above).* |
| **`Pause` / `Resume`** (`PauseModal`) | **PASS (No Crash/Freeze)** | `ctxBefore: "running"`, `PauseModal.isOpen: true`, `ctxDuringPause: "running"`, `isClosed: true`, `ctxAfter: "running"`. |
| **`Zone transitions` & `Sanctuary`** | **PASS** | `crossing → village → forest → mire → Sanctuary (bgm_knights_quiet_fire, activeAmbience = null, crackedBell suppressed = 0) → mire`; `fadingChannels` settled cleanly after fade timeout. |
| **`New Game`** | **PASS** | Enters `fog_crossing`, `unlocked = true`, `ambience = "crossing"`, `bgm = null`, `context = "running"`. |
| **`Continue`** | **PASS** | Scene restarts cleanly from Menu back into `GameScene` (`fadingBGMs = 0`, `context = "running"`). |
| **`Audio overlap` & cooldowns** | **PASS (Cooldowns Active)** | `npc_speech` `350ms` cooldown blocked rapid repeat (`true`); `bronze_bell` `800ms` cooldown active (`bronzeCount = 2` across delayed + manual call; `cracked_bell` blocked in Sanctuary `0`). |
| **`Listener cleanup` & `stopAll()`** | **PASS** | `setupAutoplayUnlock` listeners removed on first unlock; `stopAll()` returned `bgm: null, ambience: null, fadingChannels: 0, fadingBGMs: 0, activeSFXCount: 0`. |
| **Human-Ear Listening Check** | **`NOT PERFORMED`** | Headless AI audit measured objective signal/WebAudio behavior only; requires Owner human-ear listening verification before shipping audio mix changes. |

---

## 6. Hard Stop Compliance & Unlock Actions

- **Hard Stop Followed:** Did NOT alter any original trailer (`V12` / `V12.2`), did NOT overwrite or delete any sound files in `public/assets/audio/` or `HOLLOW-WOODS-AUDIO-SOURCES/`, did NOT loop full `60s` trailer audio as BGM, did NOT edit `src/`, did NOT commit or push.
- **To Unlock Full `HW-NR-18` Integration:**
  1. Supply separated **`V12.2` DAW audio stems** (`OQ-20 (a)`) and sign off the **Audio Bible** (`AUD-K12` transition from `TRAILER-ONLY`).
  2. Authorize license status for `Mystic_Autumn_Knights` (`AUDIO-LIC`) if combat/knight SFX from that pack are desired.
  3. Approve fixing the `SettingsManager.setMusicVolume → AudioManager.setBGMVolume` link, `GameScene [M]` settings sync, `ambience_forest.mp3` loudness normalization, `sfx_bell_short_fade` (`~2.8s`), and knight `playNPCSpeech` voice slots once `HW-NR-16` / `HW-NR-17` unlock.
