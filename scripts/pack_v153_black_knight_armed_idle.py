"""Pack reviewed Armed Idle artwork for Phaser. Requires Pillow and the local artwork sources."""
import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image

DIRECTIONS = ("down", "up", "left", "right")
SOURCE_SIZE = (144, 64)
RUNTIME_CROP = (40, 0, 104, 64)
LEFT_R2_SHA = "9053abcc4536c7128e46d7b80820d736f36ce776df96323f2a686837f33ee8ae"


def green_spill(pixel):
    r, g, b, alpha = pixel
    return alpha > 0 and g >= 128 and g > r + 16 and g >= b - 12


def sword_gold(pixel):
    r, g, b, alpha = pixel
    return alpha > 0 and r >= 200 and 95 <= g <= r + 5 and b <= 130


def clean_artwork(image, direction):
    result = image.copy()
    bounds = image.getbbox()
    spill_count = 0

    for y in range(bounds[1], bounds[3]):
        for x in range(bounds[0], bounds[2]):
            r, g, b, alpha = image.getpixel((x, y))
            if not alpha:
                continue
            if green_spill((r, g, b, alpha)):
                neighbors = [image.getpixel((x + dx, y + dy))
                             for dx, dy in ((0, -1), (-1, 0), (1, 0), (0, 1))]
                gold = next((p for p in neighbors if sword_gold(p)), (0, 0, 0, 0))
                result.putpixel((x, y), gold)
                spill_count += 1

    if direction != "left":
        return result, spill_count

    for y in range(bounds[1], bounds[3]):
        for x in range(bounds[0], bounds[2]):
            r, g, b, alpha = result.getpixel((x, y))
            if not alpha:
                continue
            # Protect the dark-red plume while harmonizing the armor and cape with Fellor RIGHT.
            plume = y < bounds[1] + 7 and r >= g + 24 and r >= b + 8
            if not plume and max(r, g, b) < 160:
                luminance = (0.25 * r + 0.60 * g + 0.15 * b) * 0.83
                tuned = tuple(round(luminance * 0.57 + channel * 0.357) for channel in (r, g, b))
                result.putpixel((x, y), (*tuned, alpha))
            elif sword_gold((r, g, b, alpha)):
                result.putpixel((x, y), (r, min(g, round(r * 0.80)), b, alpha))

    return result, spill_count


def pack(source_root, left_r2, output):
    local_clip = source_root / "Custom_4Dir/Animation_Frames/armed-idle"
    with (local_clip / "metadata.json").open() as file:
        legacy = json.load(file)["directions"]
    source_paths = {
        "down": sorted((local_clip / "down").glob("*.png")),
        "up": sorted((local_clip / "up").glob("*.png")),
        "left": sorted(left_r2.glob("*.png")),
        "right": sorted((source_root / "Source_Library/03-armed-idle").glob("*.png")),
    }
    origins = {
        direction: legacy[direction]["source"] for direction in ("down", "up", "right")
    }
    origins["left"] = {
        "artwork": "ImageGen supplemental, LEFT R2",
        "artistReference": "Fellor / BitBlast Studio",
        "imageGenFile": "exec-81435f45-b0c9-4979-bb11-64a17a8b4907.png",
        "imageGenSha256": LEFT_R2_SHA,
    }
    width = height = 64
    atlas = Image.new("RGBA", (6 * width, len(DIRECTIONS) * height))
    frames = {}
    for row, direction in enumerate(DIRECTIONS):
        paths = source_paths[direction]
        if len(paths) != 6:
            raise ValueError(f"{direction}: expected 6 reviewed source PNGs, got {len(paths)}")

        source_frames = []
        for column, path in enumerate(paths):
            with Image.open(path) as image:
                if image.mode != "RGBA" or image.size != SOURCE_SIZE:
                    raise ValueError(f"{path}: expected RGBA 144×64")
                clean, spill_count = (image.copy(), 0) if direction == "right" else clean_artwork(image, direction)

            cropped = clean.crop(RUNTIME_CROP)
            bbox = cropped.getbbox()
            if not bbox or bbox[3] != 63:
                raise ValueError(f"{path}: empty frame or shifted bottom edge")
            x0, y0, x1, y1 = clean.getbbox()
            if (bbox[0] + RUNTIME_CROP[0], bbox[1], bbox[2] + RUNTIME_CROP[0], bbox[3]) != (x0, y0, x1, y1):
                raise ValueError(f"{path}: crop would cut visible artwork")
            if any(green_spill(pixel) for _, pixel in cropped.getcolors(64 * 64)):
                raise ValueError(f"{path}: remaining green/cyan pixels")

            x, y = column * width, row * height
            atlas.paste(cropped, (x, y))
            key = f"armed_idle_{direction}_{column}"
            frames[key] = {
                "frame": {"x": x, "y": y, "w": width, "h": height},
                "rotated": False,
                "trimmed": False,
                "sourceSize": {"w": width, "h": height},
            }
            source_frames.append({
                "key": key,
                "sourceFile": path.name,
                "sourceSha256": hashlib.sha256(path.read_bytes()).hexdigest(),
                "greenSpillPixelsCorrected": spill_count,
                "opaqueBoundsPx": list(bbox),
            })
        origins[direction]["frames"] = source_frames

    output.mkdir(parents=True, exist_ok=True)
    atlas.save(output / "black_knight_armed_idle.png", optimize=True)
    metadata = {
        "frames": frames,
        "meta": {
            "image": "black_knight_armed_idle.png",
            "size": {"w": atlas.width, "h": atlas.height},
            "scale": "1",
            "license": "Fellor / BitBlast Studio. In-game use only. See Pixel_Art/Black Knight/License.txt.",
            "animation": {"loop": True, "frameDurationMs": 70, "order": list(DIRECTIONS)},
            "sourceCanvasPx": list(SOURCE_SIZE),
            "sourceContentAnchorPx": [72, 63],
            "runtimeCropPx": list(RUNTIME_CROP),
            "runtimeOrigin": [0.5, 1],
            "origins": origins,
        },
    }
    (output / "black_knight_armed_idle.json").write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source_root", type=Path, help="Local Pixel_Art/Black Knight directory")
    parser.add_argument("left_r2", type=Path, help="Directory of the six extracted LEFT R2 PNGs")
    parser.add_argument("--output", type=Path, default=Path("public/assets/characters/black_knight"))
    args = parser.parse_args()
    pack(args.source_root, args.left_r2, args.output)
