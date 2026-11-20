"""Pack reviewed K2 movement artwork. Requires Pillow and NumPy."""
import argparse
import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image

DIRECTIONS = ("down", "up", "left", "right")
FRAME = 64
COLUMNS = 12
GROUND = 63
SOURCE_CROP = (40, 0, 104, 64)
CLIPS = {
    "armed_walk": (170, None),
    "armed_run": (140, "15-armed-run"),
    "unarmed_idle": (70, "04-unarmed-idle"),
    "unarmed_walk": (170, None),
    "unarmed_run": (140, "14-unarmed-run"),
}


def checksum(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def extract_poses(sheet, row, rows):
    poses = []
    for column in range(6):
        left, right = (round(i * sheet.width / 6) for i in (column, column + 1))
        top, bottom = (round(i * sheet.height / rows) for i in (row, row + 1))
        rgb = np.asarray(sheet.crop((left, top, right, bottom)))
        red, green, blue = rgb.astype(np.int16).transpose((2, 0, 1))
        opaque = ~((np.minimum(green, blue) - red >= 15) & (np.abs(green - blue) < 70))
        ys, xs = np.nonzero(opaque)
        if xs.size == 0 or min(xs.min(), ys.min(), right - left - 1 - xs.max(),
                              bottom - top - 1 - ys.max()) < 4:
            raise ValueError(f"Row {row + 1}, column {column + 1}: empty or clipped pose")

        rgba = np.dstack([np.where(opaque[:, :, None], rgb, 0), (opaque * 255).astype(np.uint8)])
        bounds = (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)
        # Align the helmet's base horizontally, without centering a planted foot
        # that alternates sides or a cape that changes the silhouette.
        height = bounds[3] - bounds[1]
        helmet = opaque[bounds[1] + round(height * .18):bounds[1] + round(height * .34)]
        head_x = float(np.median(np.nonzero(helmet)[1]))
        poses.append((Image.fromarray(rgba).crop(bounds), bounds, head_x))
    return poses


def custom_frames(sheet, row, rows, direction, clip):
    poses = extract_poses(sheet, row, rows)
    running = clip.endswith("_run")
    height = 29 if running and direction == "left" else 32
    ratio = height / max(art.height for art, _, _ in poses)
    ground = max(box[3] for _, box, _ in poses)
    # A side-on sprinter has the helmet ahead of the pelvis, unlike an upright walker.
    anchor_x = {"down": 32, "up": 32, "left": 26 if running else 31, "right": 33}[direction]
    for art, bounds, head_x in poses:
        resized = art.resize((round(art.width * ratio), round(art.height * ratio)), Image.Resampling.NEAREST)
        bottom = GROUND - round((ground - bounds[3]) * ratio)
        left = anchor_x - round((head_x - bounds[0]) * ratio)
        if not (0 < left < left + resized.width < FRAME and 0 < bottom - resized.height < bottom < FRAME):
            raise ValueError(f"{clip} {direction}: pose would clip at {left}, {bottom}")
        result = Image.new("RGBA", (FRAME, FRAME))
        result.paste(resized, (left, bottom - resized.height))
        yield result, {"sourceBoxInCell": list(bounds)}


def original_frames(directory):
    metadata_path = directory / "metadata.json"
    source = json.loads(metadata_path.read_text())
    for entry in source["frames"]:
        path = directory / entry["file"]
        art = Image.open(path).convert("RGBA")
        x0, y0, x1, y1 = art.getbbox()
        if art.size != (144, 64) or not (40 <= x0 < x1 <= 104 and 0 <= y0 < y1 <= GROUND):
            raise ValueError(f"Fellor frame outside transparent crop: {path}")
        if entry["durationMs"] != 70:
            raise ValueError(f"Source timing changed: {path}")
        yield art.crop(SOURCE_CROP), {"file": path.name, "sha256": checksum(path)}


def validate_frames(clip, direction, frames, expected):
    if len(frames) != expected:
        raise ValueError(f"{clip} {direction}: expected {expected} frames, got {len(frames)}")
    hashes = {hashlib.sha256(art.tobytes()).hexdigest() for art, _ in frames}
    if len(hashes) != len(frames):
        raise ValueError(f"{clip} {direction}: identical poses in loop")
    for art, _ in frames:
        x0, y0, x1, y1 = art.getbbox()
        alpha = np.asarray(art.getchannel("A"))
        if not (0 < x0 < x1 < FRAME and 0 < y0 < y1 <= GROUND and
                y1 - y0 >= 24 and set(np.unique(alpha)) == {0, 255}):
            raise ValueError(f"{clip} {direction}: invalid opaque bounds or alpha")
        rgb = np.asarray(art).astype(np.int16)
        r, g, b, opacity = rgb.transpose((2, 0, 1))
        if np.any((opacity > 0) & (np.minimum(g, b) - r >= 15) & (np.abs(g - b) < 70)):
            raise ValueError(f"{clip} {direction}: teal matte remained")


def pack(library, artwork, output):
    count = sum(6 * 4 + (6 if source and clip.endswith("_run") else 0)
                for clip, (_, source) in CLIPS.items())
    width, height = COLUMNS * FRAME, ((count + COLUMNS - 1) // COLUMNS) * FRAME
    atlas = Image.new("RGBA", (width, height))
    sources, frames = {}, {}

    for clip, (custom_duration, original) in CLIPS.items():
        path = artwork / f"{clip}.png"
        sheet = Image.open(path).convert("RGB")
        rows = 3 if original else 4
        for row, direction in enumerate(DIRECTIONS):
            key = f"{clip}_{direction}"
            if original and direction == "right":
                prepared = list(original_frames(library / original))
                timing = 70
                provenance = {"kind": "SOURCE_ORIGINAL", "libraryGroup": original}
                expected = 12 if clip.endswith("_run") else 6
            else:
                prepared = list(custom_frames(sheet, row, rows, direction, clip))
                timing = custom_duration
                provenance = {"kind": "CUSTOM_ART", "sheet": path.name,
                              "sha256": checksum(path), "row": row + 1}
                expected = 6
            validate_frames(clip, direction, prepared, expected)
            sources[key] = {**provenance, "frames": expected, "durationMsPerFrame": timing,
                            "loopMs": timing * expected}
            for n, (art, provenance_frame) in enumerate(prepared):
                index = len(frames)
                x, y = index % COLUMNS * FRAME, index // COLUMNS * FRAME
                atlas.paste(art, (x, y))
                frames[f"{key}_{n}"] = {
                    "frame": {"x": x, "y": y, "w": FRAME, "h": FRAME},
                    "rotated": False, "trimmed": False,
                    "spriteSourceSize": {"x": 0, "y": 0, "w": FRAME, "h": FRAME},
                    "sourceSize": {"w": FRAME, "h": FRAME},
                    "source": provenance_frame,
                }

    output.mkdir(parents=True, exist_ok=True)
    atlas.save(output / "black_knight_movement.png", optimize=True)
    metadata = {
        "frames": frames,
        "meta": {
            "image": "black_knight_movement.png", "format": "RGBA8888",
            "size": {"w": width, "h": height}, "scale": "1",
            "origin": {"x": 0.5, "y": 1}, "groundReferenceY": GROUND,
            "credit": "Fellor / BitBlast Studio; ImageGen supplemental directional poses",
            "license": "Pixel_Art/Black Knight/License.txt",
            "fellorSourceCropPx": list(SOURCE_CROP),
            "clips": sources,
        },
    }
    (output / "black_knight_movement.json").write_text(json.dumps(metadata, indent=2) + "\n")
    print(f"Packed {len(frames)} frames, {len(sources)} clips, RGBA {width}×{height}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source_library", type=Path)
    parser.add_argument("reviewed_artwork", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    pack(args.source_library, args.reviewed_artwork, args.output)
