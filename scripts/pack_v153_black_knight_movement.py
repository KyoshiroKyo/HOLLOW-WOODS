"""Pack reviewed K2 movement artwork. Requires Pillow and NumPy."""
import argparse
import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image

DIRECTIONS = ("down", "up", "left", "right")
FRAME = 64
COLUMNS = 14
GROUND = 63
CLIPS = {
    "armed_walk": 170,
    "armed_run": 140,
    "unarmed_idle": 70,
    "unarmed_walk": 170,
    "unarmed_run": 140,
}


def checksum(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def extract_poses(sheet, row, rows, columns=6):
    poses = []
    for column in range(columns):
        left, right = (round(i * sheet.width / columns) for i in (column, column + 1))
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


def custom_frames(poses, direction, clip):
    running = clip.endswith("_run")
    height = 29 if running and direction in ("left", "right") else 32
    ratio = height / max(art.height for art, _, _ in poses)
    ground = max(box[3] for _, box, _ in poses)
    # A side-on sprinter has the helmet ahead of the pelvis, unlike an upright walker.
    anchor_x = {"down": 32, "up": 32, "left": 26 if running else 31, "right": 38 if running else 33}[direction]
    for art, bounds, head_x in poses:
        resized = art.resize((round(art.width * ratio), round(art.height * ratio)), Image.Resampling.NEAREST)
        bottom = GROUND - round((ground - bounds[3]) * ratio) if running else GROUND
        left = anchor_x - round((head_x - bounds[0]) * ratio)
        if not (0 < left < left + resized.width < FRAME and 0 < bottom - resized.height < bottom < FRAME):
            raise ValueError(f"{clip} {direction}: pose would clip at {left}, {bottom}")
        result = Image.new("RGBA", (FRAME, FRAME))
        result.paste(resized, (left, bottom - resized.height))
        if clip.startswith("unarmed"):
            result = mute_sheath_highlights(result)
        yield result, {"sourceBoxInCell": list(bounds)}


def bright_amber(pixels):
    red, green, blue, alpha = pixels.astype(np.int16).transpose((2, 0, 1))
    return (alpha > 0) & (red >= 112) & (green >= 60) & (red > green + 12) & (green > blue + 12)


def mute_sheath_highlights(art):
    # The straps remain drawn in the supplied artwork. Only their accent palette
    # is compressed to leather values, leaving dark metal and the red plume alone.
    pixels = np.array(art)
    amber = bright_amber(pixels)
    rgb = pixels[amber, :3].astype(float)
    pixels[amber, :3] = np.rint(rgb * (94 / rgb[:, :1])).astype(np.uint8)
    return Image.fromarray(pixels)


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
        if clip.startswith("unarmed") and np.any(bright_amber(rgb)):
            raise ValueError(f"{clip} {direction}: bright weapon pixels remain")


def pack(artwork, output):
    count = (len(CLIPS) * len(DIRECTIONS) + 1) * 6
    width, height = COLUMNS * FRAME, ((count + COLUMNS - 1) // COLUMNS) * FRAME
    atlas = Image.new("RGBA", (width, height))
    sources, frames = {}, {}

    def place_clip(clip, direction, poses, timing, path, provenance):
        key = f"{clip}_{direction}"
        prepared = list(custom_frames(poses, direction, clip))
        validate_frames(clip, direction, prepared, 6)
        sources[key] = {"kind": "CUSTOM_ART", "sheet": path.name, "sha256": checksum(path),
                        **provenance, "frames": 6, "durationMsPerFrame": timing, "loopMs": timing * 6}
        for n, (art, audit) in enumerate(prepared):
            index = len(frames)
            x, y = index % COLUMNS * FRAME, index // COLUMNS * FRAME
            atlas.paste(art, (x, y))
            frames[f"{key}_{n}"] = {
                "frame": {"x": x, "y": y, "w": FRAME, "h": FRAME},
                "rotated": False, "trimmed": False,
                "spriteSourceSize": {"x": 0, "y": 0, "w": FRAME, "h": FRAME},
                "sourceSize": {"w": FRAME, "h": FRAME},
                "source": {"artworkBoundsPx": list(art.getbbox()), **audit},
            }

    right_runs = artwork / "right_runs.png"
    right_sheet = Image.open(right_runs).convert("RGB")
    for clip, timing in CLIPS.items():
        path = artwork / f"{clip}.png"
        sheet = Image.open(path).convert("RGB")
        running = clip.endswith("_run")
        for row, direction in enumerate(DIRECTIONS):
            if running and direction == "right":
                right_row = 0 if clip == "armed_run" else 1
                place_clip(clip, direction, extract_poses(right_sheet, right_row, 2), timing,
                           right_runs, {"row": right_row + 1})
            else:
                place_clip(clip, direction, extract_poses(sheet, row, 3 if running else 4), timing,
                           path, {"row": row + 1})

    right_idle = artwork / "armed_idle_right.png"
    idle_sheet = Image.open(right_idle).convert("RGB")
    idle_poses = [pose for row in range(2) for pose in extract_poses(idle_sheet, row, 2, 3)]
    place_clip("armed_idle", "right", idle_poses, 70, right_idle, {"rows": [1, 2], "columns": 3})

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
            "clips": sources,
        },
    }
    (output / "black_knight_movement.json").write_text(json.dumps(metadata, indent=2) + "\n")
    print(f"Packed {len(frames)} frames, {len(sources)} clips, RGBA {width}×{height}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("reviewed_artwork", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    pack(args.reviewed_artwork, args.output)
