"""Pack or validate reviewed four-direction combat artwork. Requires Pillow and NumPy."""

import argparse
import hashlib
import json
from pathlib import Path
import re

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
ATLAS_KEYS = {
    "core": "black_knight_core_combat",
    "defense": "black_knight_defense",
    "extended": "black_knight_extended_skills",
}
# Width, height and the space reserved below the foot pivot for ground effects.
EXTENDED_FRAME_SIZES = {
    "armed_buff": (64, 64, 0),
    "unarmed_buff": (64, 64, 0),
    "thrust": (80, 64, 8),
    "ground_slam": (112, 72, 12),
    "flame_stream": (112, 80, 12),
    "fire_wave": (112, 80, 12),
    "aerial_somersault": (96, 80, 10),
    "weapon_art": (112, 72, 10),
}
CONFIG_KEYS = {"core": "CORE_COMBAT_CLIPS", "defense": "DEFENSE_CLIPS", "extended": "EXTENDED_SKILL_CLIPS"}
EVIDENCE_PREFIX = {"core": "core-combat", "defense": "defense", "extended": "extended-skills"}
ATLAS = ROOT / "public/assets/characters/black_knight"
REGISTRY = ROOT / "src/animation/BlackKnightAnimations.ts"
DIRECTIONS = ("down", "up", "left", "right")
FRAME = 64
COLUMNS = 12
PROVENANCE = {
    "attack": "Fellor Source Library 08–11 motion reference + K1/K2 identity",
    "heavy_attack": "Fellor Source Library 05–07 motion reference + K1/K2 identity",
    "attack_combo": "K3 Light Attack pose reference + K1/K2 identity",
    "parry": "Fellor Source Library 27 and 29 + K1/K2 identity",
    "parry_success": "Fellor Source Library 28 + K1/K2 identity",
    "roll": "Fellor Source Library 12 + K1/K2 identity",
    "unarmed_roll": "Fellor Source Library 13 + K1/K2 identity",
    "weapon_on": "Fellor Source Library 01 + K1/K2 identity",
    "weapon_off": "Fellor Source Library 02 + K1/K2 identity",
    "hurt": "Fellor Source Library 31 + K1/K2 identity",
    "unarmed_hurt": "Fellor Source Library 30 + K1/K2 identity",
    "death": "Fellor Source Library 32 + K1/K2 identity",
    "armed_buff": "Fellor Source Library 34 (master 312–323) + K1/K2 identity",
    "unarmed_buff": "Fellor Source Library 33 (master 300–311) + K1/K2 identity",
    "thrust": "Fellor 11 Attack 4 (master 113–123) + K1/K2 identity",
    "ground_slam": "Fellor 05 Heavy Attack 1 and 10 Attack 3 (master 53–60, 108–112) + K1/K2 identity",
    "flame_stream": "Fellor 11 Attack 4 (master 113–122) + K1/K2 identity",
    "fire_wave": "Fellor 07 Heavy Attack 3 and 11 Attack 4 (master 76–81, 113–122) + K1/K2 identity",
    "aerial_somersault": "Fellor 26 Weapon Art (master 243–256) + K1/K2 identity",
    "weapon_art": "Fellor Source Library 26 (master 222–256) + K1/K2 identity",
}


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def config(group):
    registry = REGISTRY.read_text()
    count = int(re.search(r"const CORE_COMBAT_FRAMES = (\d+);", registry)[1])
    block = re.search(rf"const {CONFIG_KEYS[group]} = \{{(.*?)\n\}} as const;", registry, re.S)[1]
    entries = re.findall(
        r"(\w+): \{ frameMs: ([\d.]+)(?: / (\d+))?(?:, impactFrame: (\d+), recoveryFrame: (\d+))? \},",
        block,
    )
    return count, {
        action: (float(ms) / int(divisor or "1"), int(hit) if hit else None, int(recovery) if recovery else None)
        for action, ms, divisor, hit, recovery in entries
    }


def frame_geometry(action):
    width, height, below_pivot = EXTENDED_FRAME_SIZES.get(action, (FRAME, FRAME, 0))
    return width, height, height - below_pivot


def cyan_mask(rgb):
    r, g, b = rgb.astype(np.int16).transpose((2, 0, 1))
    return (np.minimum(g, b) - r >= 15) & (np.abs(g - b) < 70)


def row_cells(sheet, row, count, action):
    top, bottom = row * sheet.height // 4, (row + 1) * sheet.height // 4
    boundaries = [column * sheet.width // count for column in range(count + 1)]
    if action in EXTENDED_FRAME_SIZES:
        rgb = np.asarray(sheet.crop((0, top, sheet.width, bottom)).convert("RGB"))
        occupied = (~cyan_mask(rgb)).any(axis=0)
        for column in range(1, count):
            center = boundaries[column]
            clear = [x for x in range(center - 40, center + 41) if not occupied[x - 4:x + 5].any()]
            if not clear:
                raise ValueError(f"{action} row {row} between columns {column - 1}/{column}: no cyan separation")
            boundaries[column] = min(clear, key=lambda x: abs(x - center))
    return [(boundaries[column], top, boundaries[column + 1], bottom) for column in range(count)]


def matte(sheet, cell, min_margin=4):
    rgb = np.asarray(sheet.crop(cell).convert("RGB"))
    opaque = ~cyan_mask(rgb)
    rgba = np.dstack([np.where(opaque[:, :, None], rgb, 0), (opaque * 255).astype(np.uint8)])
    image = Image.fromarray(rgba)
    bounds = image.getbbox()
    if not bounds or min(bounds[0], bounds[1], image.width - bounds[2], image.height - bounds[3]) < min_margin:
        raise ValueError(f"Empty or clipped source: cell {cell}, bounds {bounds}")
    return image.crop(bounds), bounds, cell


def normalize_row(sheet, row, count, action):
    width, height, foot_y = frame_geometry(action)
    poses = [matte(sheet, cell) for cell in row_cells(sheet, row, count, action)]
    neutral, box, _ = poses[0]
    ratio = 32 / neutral.height
    ground = box[3]
    if action in ("parry", "parry_success", "roll", "unarmed_roll", "weapon_on", "weapon_off",
                  "hurt", "unarmed_hurt", "death", "armed_buff", "unarmed_buff"):
        ground = max(bounds[3] for _, bounds, _ in poses)
    feet = np.array(neutral)[round(neutral.height * .84):]
    r, g, b, a = feet.astype(np.int16).transpose((2, 0, 1))
    feet_x = np.nonzero((a > 0) & ~((r > g + 30) & (g > b + 30)))[1]
    source_x = box[0] + np.median(feet_x)
    for column, (pixels, bounds, cell) in enumerate(poses):
        # Keep one scale and planted anchor per directional strip, including VFX outside the body.
        resized = pixels.resize(
            (round(pixels.width * ratio), round(pixels.height * ratio)), Image.Resampling.NEAREST
        )
        # Preserve the original cell center when an effect needs the adjacent cyan margin.
        left_from_centered_cell = bounds[0] + cell[0] - column * sheet.width // count
        x = width // 2 + round((left_from_centered_cell - source_x) * ratio)
        y = foot_y - 1 + round((bounds[3] - ground) * ratio) - resized.height
        if not (0 < x < x + resized.width < width and 0 < y < y + resized.height < height):
            raise ValueError(f"{action} row {row}: runtime sprite would clip at {x}, {y}: {bounds}")
        result = Image.new("RGBA", (width, height))
        result.paste(resized, (x, y))
        yield result, list(cell), list(bounds)


def pack(atlas_key, source, parts, count):
    group_rows = (count * len(DIRECTIONS) + COLUMNS - 1) // COLUMNS
    sizes = {action: frame_geometry(action) for action in parts}
    atlas = Image.new("RGBA", (max(w for w, _, _ in sizes.values()) * COLUMNS,
                                sum(h * group_rows for _, h, _ in sizes.values())))
    frames, sources = {}, {}
    top = 0
    for action, (ms, hit, recovery) in parts.items():
        w, h, foot = sizes[action]
        size = {"w": w, "h": h}
        path = source / f"{action}.png"
        sheet = Image.open(path)
        sources[action] = {
            "type": "Custom ImageGen artwork", "sourceSheetSha256": sha256(path),
            "reference": PROVENANCE[action], "frameMs": ms, "impactFrame": hit, "recoveryFrame": recovery,
        }
        for row, direction in enumerate(DIRECTIONS):
            for index, (art, cell, bounds) in enumerate(normalize_row(sheet, row, count, action)):
                name = f"{action}_{direction}_{index}"
                n = row * count + index
                x, y = n % COLUMNS * w, top + n // COLUMNS * h
                atlas.paste(art, (x, y))
                frames[name] = {
                    "frame": {"x": x, "y": y, **size}, "rotated": False, "trimmed": False,
                    "spriteSourceSize": {"x": 0, "y": 0, **size}, "sourceSize": size,
                    "pivot": {"x": 0.5, "y": foot / h}, "duration": ms,
                    "sourceCell": cell, "sourceBoxInCell": bounds,
                }
        top += h * group_rows
    atlas.save(ATLAS / f"{atlas_key}.png", optimize=True)
    meta = {"image": f"{atlas_key}.png", "size": {"w": atlas.width, "h": atlas.height},
            "format": "RGBA8888", "scale": "1", "sources": sources}
    (ATLAS / f"{atlas_key}.json").write_text(json.dumps({"frames": frames, "meta": meta},
                                                      ensure_ascii=False, indent=2) + "\n")


def verify(group, atlas_key, evidence, parts, count, source):
    paths = [ATLAS / f"{atlas_key}.{ext}" for ext in ("png", "json")]
    atlas = Image.open(paths[0])
    data = json.loads(paths[1].read_text())
    assert atlas.mode == "RGBA" and data["meta"]["size"] == {"w": atlas.width, "h": atlas.height}
    assert len(data["frames"]) == len(parts) * len(DIRECTIONS) * count
    coverage = {"sha256": {path.name: sha256(path) for path in paths}, "clips": {}}
    sizes = {action: frame_geometry(action) for action in parts}
    left_pad = 146 if group == "extended" else 124
    col_size = max(w for w, _, _ in sizes.values()) * 2
    above_anchor = max(foot for _, _, foot in sizes.values()) * 2
    below_anchor = max(h - foot for _, h, foot in sizes.values()) * 2
    row_size = above_anchor + below_anchor + 18
    reference = Image.new("RGB", (left_pad + count * col_size, len(parts) * 4 * row_size + 22), "#34343d")
    draw = ImageDraw.Draw(reference)
    draw.text((8, 6), f"{atlas_key} | atlas pixels at 2x | shared foot reference", fill="white")
    occupied = np.zeros((atlas.height, atlas.width), dtype=bool)
    used = set()
    for action, (ms, hit, recovery) in parts.items():
        width, height, foot_y = sizes[action]
        if hit is not None:
            assert 0 <= hit < recovery < count
        origin = data["meta"]["sources"][action]
        assert (origin["frameMs"], origin["impactFrame"], origin["recoveryFrame"]) == (ms, hit, recovery)
        source_sheet = None
        if source is not None:
            path = source / f"{action}.png"
            assert origin["sourceSheetSha256"] == sha256(path)
            source_sheet = Image.open(path)
        for row, direction in enumerate(DIRECTIONS):
            key = f"{action}_{direction}"
            line_y = 22 + len(coverage["clips"]) * row_size
            draw.text((8, line_y + 42), f"{action}\n{direction.upper()} · {ms:.4g} ms", fill="white")
            poses = []
            coverage["clips"][key] = poses
            source_poses = list(normalize_row(source_sheet, row, count, action)) if source_sheet is not None else None
            for i in range(count):
                entry = data["frames"][f"{key}_{i}"]
                x, y, w, h = (entry["frame"][k] for k in ("x", "y", "w", "h"))
                assert (w, h) == (width, height) and not entry["rotated"] and not entry["trimmed"]
                assert x >= 0 and y >= 0 and x + w <= atlas.width and y + h <= atlas.height
                occupied_frame = occupied[y:y + h, x:x + w]
                assert not occupied_frame.any(), (key, i, "overlapping frame")
                occupied_frame[:] = True
                used.add((x, y))
                assert entry["duration"] == ms and entry["pivot"] == {"x": 0.5, "y": foot_y / height}
                assert entry["sourceSize"] == {"w": w, "h": h}
                assert entry["spriteSourceSize"] == {"x": 0, "y": 0, "w": w, "h": h}
                art = atlas.crop((x, y, x + w, y + h))
                if source_poses is not None:
                    expected, cell, bounds = source_poses[i]
                    assert art.tobytes() == expected.tobytes() and entry["sourceCell"] == cell
                    assert entry["sourceBoxInCell"] == bounds
                arr = np.asarray(art)
                opacity = arr[:, :, 3]
                assert set(np.unique(opacity)) == {0, 255}, (key, i, "alpha or empty")
                assert not np.any((opacity > 0) & cyan_mask(arr[:, :, :3])), (key, i, "cyan")
                x0, y0, x1, y1 = art.getbbox()
                assert 0 < x0 < x1 < w and 0 < y0 < y1 < h, (key, i, "bounds")
                if hit is not None:
                    assert y1 - y0 >= 23, (key, i, "height")
                if action.startswith("unarmed_") or action in ("weapon_on", "weapon_off", "roll", "hurt", "armed_buff"):
                    r, g, b, a = arr.astype(np.int16).transpose((2, 0, 1))
                    # Separate the bright saturated blade from the leather strap and ivory hit flash.
                    blade = np.count_nonzero((a > 0) & (r >= 170) & (g >= 90) & (r - b >= 75) & (g - b >= 35))
                    armed = (action in ("roll", "hurt", "armed_buff") or action == "weapon_on" and i >= 3 or
                             action == "weapon_off" and i < 2)
                    unarmed = (action.startswith("unarmed_") or action == "weapon_on" and i < 2 or
                               action == "weapon_off" and i == count - 1)
                    assert not (armed and blade <= 2 or unarmed and blade > 2), (key, i, "blade", blade)
                phase = "pose"
                if hit is not None:
                    phase = "windup" if i < hit else "impact" if i == hit else "recovery" if i >= recovery else "follow-through"
                poses.append({"atlasFrame": f"{key}_{i}", "bounds": [x0, y0, x1, y1],
                              "opaquePixels": int(np.count_nonzero(opacity)), "phase": phase, "ms": ms,
                              "size": [w, h], "footPivot": [w // 2, foot_y],
                              "runtimeKeys": [f"wayfarer_{key}", f"satyr_{key}"],
                              "sha256": hashlib.sha256(art.tobytes()).hexdigest()})
                x_draw = left_pad + i * col_size
                marker = line_y + above_anchor - 2
                draw.line([(x_draw, marker), (x_draw + col_size - 4, marker)], fill="#51515d")
                zoomed = art.resize((w * 2, h * 2), Image.Resampling.NEAREST)
                reference.paste(zoomed, (x_draw + (col_size - w * 2) // 2, line_y + above_anchor - foot_y * 2), zoomed)
                draw.text((x_draw, line_y + row_size - 16), f"{i} {phase}",
                          fill="#ffad53" if i == hit else "#dddddd")
            assert len({pose["sha256"] for pose in poses}) >= count - 1, (key, "duplicate action poses")

    evidence.mkdir(parents=True, exist_ok=True)
    prefix = EVIDENCE_PREFIX[group]
    reference.save(evidence / f"{prefix}-contact.png", optimize=True)
    (evidence / f"{prefix}-asset-qa.json").write_text(json.dumps(coverage, indent=2) + "\n")
    print(f"{len(coverage['clips'])} clips, {len(used)} frames. Alpha, matte, bounds, phases and mapping PASS.")
    for name, digest in coverage["sha256"].items():
        print(f"{digest}  {name}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--group", choices=ATLAS_KEYS, default="core")
    parser.add_argument("--source", type=Path, help="Review sheets named after each action")
    parser.add_argument("--pack", action="store_true", help="Write the production atlas from --source")
    parser.add_argument("--evidence", type=Path, required=True)
    options = parser.parse_args()
    if options.pack and not options.source:
        parser.error("--pack requires --source")
    count, parts = config(options.group)
    atlas_key = ATLAS_KEYS[options.group]
    if options.pack:
        pack(atlas_key, options.source, parts, count)
    verify(options.group, atlas_key, options.evidence, parts, count, options.source)


if __name__ == "__main__":
    main()
