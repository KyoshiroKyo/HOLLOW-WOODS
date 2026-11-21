"""Pack or validate reviewed four-direction combat artwork. Requires Pillow and NumPy."""

import argparse
import hashlib
import json
from pathlib import Path
import re

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
ATLAS_KEYS = {"core": "black_knight_core_combat", "defense": "black_knight_defense"}
ATLAS = ROOT / "public/assets/characters/black_knight"
REGISTRY = ROOT / "src/animation/BlackKnightAnimations.ts"
DIRECTIONS = ("down", "up", "left", "right")
FRAME = 64
GROUND = 63
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
}


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def config(group):
    registry = REGISTRY.read_text()
    count = int(re.search(r"const CORE_COMBAT_FRAMES = (\d+);", registry)[1])
    if group == "core":
        entries = re.findall(
            r"(\w+): \{ frameMs: (\d+), impactFrame: (\d+), recoveryFrame: (\d+) \},", registry
        )
        return count, {action: (int(ms), int(impact), int(recovery)) for action, ms, impact, recovery in entries}
    entries = re.findall(r"(\w+): \{ frameMs: ([\d.]+) \},", registry)
    return count, {action: (float(ms), None, None) for action, ms in entries}


def cyan_mask(rgb):
    r, g, b = rgb.astype(np.int16).transpose((2, 0, 1))
    return (np.minimum(g, b) - r >= 15) & (np.abs(g - b) < 70)


def matte(sheet, row, column, count):
    cell = (column * sheet.width // count, row * sheet.height // 4,
            (column + 1) * sheet.width // count, (row + 1) * sheet.height // 4)
    rgb = np.asarray(sheet.crop(cell).convert("RGB"))
    opaque = ~cyan_mask(rgb)
    rgba = np.dstack([np.where(opaque[:, :, None], rgb, 0), (opaque * 255).astype(np.uint8)])
    image = Image.fromarray(rgba)
    bounds = image.getbbox()
    if not bounds or min(bounds[0], bounds[1], image.width - bounds[2], image.height - bounds[3]) < 4:
        raise ValueError(f"Empty or clipped source: row {row}, column {column}, bounds {bounds}")
    return image.crop(bounds), bounds, cell


def normalize_row(sheet, row, count, action):
    poses = [matte(sheet, row, column, count) for column in range(count)]
    neutral, box, _ = poses[0]
    ratio = 32 / neutral.height
    ground = box[3]
    if action in ("parry", "parry_success", "roll", "unarmed_roll", "weapon_on", "weapon_off",
                  "hurt", "unarmed_hurt", "death"):
        ground = max(bounds[3] for _, bounds, _ in poses)
    feet = np.array(neutral)[round(neutral.height * .84):]
    r, g, b, a = feet.astype(np.int16).transpose((2, 0, 1))
    feet_x = np.nonzero((a > 0) & ~((r > g + 30) & (g > b + 30)))[1]
    source_x = box[0] + np.median(feet_x)
    for pixels, bounds, cell in poses:
        # Keep one scale and planted anchor per directional strip, including VFX outside the body.
        resized = pixels.resize(
            (round(pixels.width * ratio), round(pixels.height * ratio)), Image.Resampling.NEAREST
        )
        x = FRAME // 2 + round((bounds[0] - source_x) * ratio)
        y = GROUND + round((bounds[3] - ground) * ratio) - resized.height
        if not (0 < x < x + resized.width < FRAME and 0 < y < y + resized.height < FRAME):
            raise ValueError(f"Runtime sprite would clip at {x}, {y}: {bounds}")
        result = Image.new("RGBA", (FRAME, FRAME))
        result.paste(resized, (x, y))
        yield result, list(cell), list(bounds)


def pack(atlas_key, source, parts, count):
    names = [f"{action}_{d}_{i}" for action in parts for d in DIRECTIONS for i in range(count)]
    atlas = Image.new("RGBA", (COLUMNS * FRAME, (len(names) + COLUMNS - 1) // COLUMNS * FRAME))
    size = {"w": FRAME, "h": FRAME}
    frames, sources = {}, {}
    for action, (ms, hit, recovery) in parts.items():
        path = source / f"{action}.png"
        sheet = Image.open(path)
        sources[action] = {
            "type": "Custom ImageGen artwork", "sourceSheetSha256": sha256(path),
            "reference": PROVENANCE[action], "frameMs": ms, "impactFrame": hit, "recoveryFrame": recovery,
        }
        for row, direction in enumerate(DIRECTIONS):
            for index, (art, cell, bounds) in enumerate(normalize_row(sheet, row, count, action)):
                name = f"{action}_{direction}_{index}"
                n = len(frames)
                x, y = n % COLUMNS * FRAME, n // COLUMNS * FRAME
                atlas.paste(art, (x, y))
                frames[name] = {
                    "frame": {"x": x, "y": y, **size}, "rotated": False, "trimmed": False,
                    "spriteSourceSize": {"x": 0, "y": 0, **size}, "sourceSize": size,
                    "pivot": {"x": 0.5, "y": 1}, "duration": ms,
                    "sourceCell": cell, "sourceBoxInCell": bounds,
                }
    atlas.save(ATLAS / f"{atlas_key}.png", optimize=True)
    meta = {"image": f"{atlas_key}.png", "size": {"w": atlas.width, "h": atlas.height},
            "format": "RGBA8888", "scale": "1", "sources": sources}
    (ATLAS / f"{atlas_key}.json").write_text(json.dumps({"frames": frames, "meta": meta},
                                                      ensure_ascii=False, indent=2) + "\n")


def verify(atlas_key, evidence, parts, count, source):
    paths = [ATLAS / f"{atlas_key}.{ext}" for ext in ("png", "json")]
    atlas = Image.open(paths[0])
    data = json.loads(paths[1].read_text())
    assert atlas.mode == "RGBA" and data["meta"]["size"] == {"w": atlas.width, "h": atlas.height}
    assert len(data["frames"]) == len(parts) * len(DIRECTIONS) * count
    coverage = {"sha256": {path.name: sha256(path) for path in paths}, "clips": {}}
    reference = Image.new("RGB", (124 + count * 128, (len(parts) * 4) * 140 + 22), "#34343d")
    draw = ImageDraw.Draw(reference)
    draw.text((8, 6), f"{atlas_key} | atlas pixels at 2x | ground y=63", fill="white")
    used = set()
    for action, (ms, hit, recovery) in parts.items():
        if hit is not None:
            assert 0 < hit < recovery < count
        origin = data["meta"]["sources"][action]
        assert (origin["frameMs"], origin["impactFrame"], origin["recoveryFrame"]) == (ms, hit, recovery)
        source_sheet = None
        if source is not None:
            path = source / f"{action}.png"
            assert origin["sourceSheetSha256"] == sha256(path)
            source_sheet = Image.open(path)
        for row, direction in enumerate(DIRECTIONS):
            key = f"{action}_{direction}"
            line_y = 22 + len(coverage["clips"]) * 140
            draw.text((8, line_y + 42), f"{action}\n{direction.upper()} · {ms} ms", fill="white")
            poses = []
            coverage["clips"][key] = poses
            source_poses = list(normalize_row(source_sheet, row, count, action)) if source_sheet is not None else None
            for i in range(count):
                entry = data["frames"][f"{key}_{i}"]
                x, y, w, h = (entry["frame"][k] for k in ("x", "y", "w", "h"))
                assert (w, h) == (FRAME, FRAME) and not entry["rotated"] and not entry["trimmed"]
                assert x >= 0 and y >= 0 and x + w <= atlas.width and y + h <= atlas.height
                assert x % FRAME == y % FRAME == 0 and (x, y) not in used
                used.add((x, y))
                assert entry["duration"] == ms and entry["pivot"] == {"x": 0.5, "y": 1}
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
                if action.startswith("unarmed_") or action in ("weapon_on", "weapon_off", "roll", "hurt"):
                    r, g, b, a = arr.astype(np.int16).transpose((2, 0, 1))
                    # Separate the bright saturated blade from the leather strap and ivory hit flash.
                    blade = np.count_nonzero((a > 0) & (r >= 170) & (g >= 90) & (r - b >= 75) & (g - b >= 35))
                    armed = (action in ("roll", "hurt") or action == "weapon_on" and i >= 3 or
                             action == "weapon_off" and i < 2)
                    unarmed = (action.startswith("unarmed_") or action == "weapon_on" and i < 2 or
                               action == "weapon_off" and i == count - 1)
                    assert not (armed and blade <= 2 or unarmed and blade > 2), (key, i, "blade", blade)
                phase = "pose"
                if hit is not None:
                    phase = "windup" if i < hit else "impact" if i == hit else "recovery" if i >= recovery else "follow-through"
                poses.append({"atlasFrame": f"{key}_{i}", "bounds": [x0, y0, x1, y1],
                              "opaquePixels": int(np.count_nonzero(opacity)), "phase": phase, "ms": ms,
                              "runtimeKeys": [f"wayfarer_{key}", f"satyr_{key}"],
                              "sha256": hashlib.sha256(art.tobytes()).hexdigest()})
                x_draw = 124 + i * 128
                draw.line([(x_draw, line_y + 126), (x_draw + 123, line_y + 126)], fill="#51515d")
                zoomed = art.resize((128, 128), Image.Resampling.NEAREST)
                reference.paste(zoomed, (x_draw, line_y), zoomed)
                draw.text((x_draw, line_y + 128), f"{i} {phase}", fill="#ffad53" if i == hit else "#dddddd")
            assert len({pose["sha256"] for pose in poses}) >= count - 1, (key, "duplicate action poses")

    evidence.mkdir(parents=True, exist_ok=True)
    prefix = "core-combat" if atlas_key.endswith("core_combat") else "defense"
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
    verify(atlas_key, options.evidence, parts, count, options.source)


if __name__ == "__main__":
    main()
