# ASSET_GAPS.md — HW-AG-CONTENT-01

- **Repo / Branch:** `G:\HOLLOW_WOODS_C02` / `feat/v1.6-competition-preview`
- **Commit SHA:** `dcbe3ea0622103e35e73fe94480c4d160b1dc2ba`

## 1. Unregistered Entities (Loaded & Spawned, Missing from `ContentRegistry`)
1. `MistBatAmbushEntity` (`assets/characters/monsters/bat_sheet.png`, `PreloadScene.ts:782`) — spawned in `WildlifeSystem.ts:567+`; **missing** from `registryData.ts` / `content_registry.json`, provenance unverified.
2. `WanderingShadeEntity` (`assets/characters/monsters/ghost_sheet.png`, `PreloadScene.ts:786`) — spawned in `WildlifeSystem.ts:592+`; **missing** from `registryData.ts` / `content_registry.json`, provenance unverified.
3. `GoblinScoutEntity` (`assets/characters/monsters/goblin_scout_dagger_sheet.png`, `PreloadScene.ts:790`) — spawned in `WildlifeSystem.ts:620+`; **missing** from `registryData.ts` / `content_registry.json`, provenance unverified.
4. `FallenKnightApparition` (`src/entities/FallenKnightApparition.ts`) — Classic Sanity 2.1 hallucination reusing `SPRITE_FALLEN_KNIGHT`, not registered separately.
5. `WhisperTrap` (`src/entities/WhisperTrap.ts`) — Classic Sanity 2.1 procedural trap, not registered in `ContentRegistry`.

## 2. Registered & Loaded, But Unused / Unspawned
1. `HW-MON-BOSS-000003` (`ShadowBehemothBoss`, `assets/characters/bosses/shadow_big_boss_sheet.png` + `portrait_shadow_big_boss.png`) — registered in `registryData.ts`, loaded in `PreloadScene.ts:749-753`, class exists in `ShadowMonsters.ts:388`, but **no active `new ShadowBehemothBoss(...)` spawn site** exists in `WildlifeSystem.ts` or `GameScene.ts`.

## 3. Path / Naming / Dual-Class Mismatches
1. `HW-MON-STALKER-000001` (`TheListener`): `content_registry.json` lists `assets/sprites/the_listener.png`, whereas `PreloadScene.ts:729` loads `assets/monsters/the_listener.png`.
2. `MireWardenBoss` vs `BossMireWarden`: two entity files (`src/entities/MireWardenBoss.ts` and `src/entities/BossMireWarden.ts`) for the same boss (`HW-MON-BOSS-000001`).
3. `Sir Vaelen` (`campfire_knight_pray_sheet.png` / `campfire_knight_idle_sheet.png`) vs `FallenKnightEntity` (`fallen_knight_sheet.png`): both originate from `2D SL Knight v1.0` pack (separate texture keys, visually similar silhouette).
4. `SatyrPlayer.ts` / `satyr_portrait.png`: legacy naming — **NEED REFERENCE** (do not use `Satyr/Satyh/Marden` as canonical ID without trailer frame/timecode verification).

## 4. Unfinished / Placeholder Expansion Zones (Zones 13–17)
The following 5 zones exist in `src/data/zones.json` and `WorldGatingSystem.ts`, have `SafeSpawnResolver` entries, and have 2 interactables each, **but**:
- Are **absent from `ContentRegistry`** (`registryData.ts` / `content_registry.json`).
- Are **absent from `WorldBuilder.pendingDeferredZones`** (`WorldBuilder.ts:264-273`).
- Have **no custom terrain renderer** in `WorldBuilder.ts:348-353` (render only generic `tileSprite` `TILE_STONE_FLOOR` / `TILE_SWAMP_MUD` / `TILE_FOREST_GRASS`).

Zones:
- `abyssal_chasm`
- `drowned_mire_depths`
- `whispering_grove_sanctum`
- `sunken_crypt_ruins`
- `veil_origin_cavern`
