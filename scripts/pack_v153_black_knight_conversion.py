"""Pack selected custom Black Knight sheets and audit their transparency and source mapping."""

import argparse
import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

from qa_v153_black_knight_combat import cyan_mask, matte, sha256

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "src/animation/BlackKnightConversion.json"
ATLAS_DIR = ROOT / "public/assets/characters/black_knight"
DIRECTIONS = ("down", "up", "left", "right")


def clear_seams(occupied, count, label):
    boundaries = [n * len(occupied) // count for n in range(count + 1)]
    for i in range(1, count):
        center = boundaries[i]
        radius = min(42, len(occupied) // count // 4)
        candidates = [x for x in range(center - radius, center + radius + 1) if not occupied[x-4:x+5].any()]
        if not candidates:
            raise ValueError(f"{label}, between {i - 1}/{i}. Art or VFX crosses both margins.")
        boundaries[i] = min(candidates, key=lambda x: abs(x - center))
    return boundaries


def extract_row(sheet, action, row, spec):
    count = spec.get("artworkFrames", 6)
    mask = ~cyan_mask(np.asarray(sheet.convert("RGB")))
    row_seams = clear_seams(mask.any(axis=1), 4, action)
    top, bottom = row_seams[row:row + 2]
    boundaries = clear_seams(mask[top:bottom].any(axis=0), count, f"{action}, {DIRECTIONS[row]}")

    cells = [(boundaries[i], top, boundaries[i+1], bottom) for i in range(count)]
    selected = spec.get("sample", list(range(count)))
    source = {i: (matte(sheet, cells[i], min_margin=1)[:2], cells[i]) for i in set(selected) | {0}}
    # Anchor on the row's first pose, except the airborne drops where every
    # frame is above the fixed reference by at least the small foot clearance.
    neutral, box = source[0][0]
    ratio = 32 / neutral.height
    if spec.get("referenceHeight"):
        ratio = 32 / spec["referenceHeight"]
    ground = max(bounds[3] for (_, bounds), _ in source.values())
    if "fall_" in action:
        ground += round(4 / ratio)
    feet = np.asarray(neutral)[round(neutral.height * 0.83):].astype(np.int16)
    r, g, b, a = feet.transpose((2, 0, 1))
    foot_x = np.nonzero((a > 0) & ~((r > g + 30) & (g > b + 30)))[1]
    if not foot_x.size:
        raise ValueError(f"{action}, {DIRECTIONS[row]}. Missing readable ground anchor.")
    source_x = box[0] + float(np.median(foot_x))
    width, height = spec["width"], spec["height"]
    pivot_y = height - spec["belowFoot"]
    for i in selected:
        (pose, bounds), cell = source[i]
        w, h = round(pose.width * ratio), round(pose.height * ratio)
        x = width // 2 + round((bounds[0] + cell[0] - i * sheet.width // count - source_x) * ratio)
        y = pivot_y - 1 + round((bounds[3] - ground) * ratio) - h
        if not (0 < x and x + w < width and 0 < y and y + h < height):
            raise ValueError(f"{action}, {DIRECTIONS[row]} frame {i}. Runtime edge at {(x, y, w, h)}.")
        frame = Image.new("RGBA", (width, height))
        frame.paste(pose.resize((w, h), Image.Resampling.NEAREST), (x, y))
        yield frame, cell, bounds, i


def pack(group, actions, sources):
    name = f"black_knight_conversion_{group}"
    columns = 18 if group == "combat" else 12
    width = max(spec["width"] for spec in actions.values()) * columns
    height = sum(((4 * spec["frames"] + columns - 1) // columns) * spec["height"] for spec in actions.values())
    atlas = Image.new("RGBA", (width, height))
    frames, artwork = {}, {}
    top = 0
    for action, spec in actions.items():
        parts = [{**spec, **segment} for segment in spec.get("segments", [{}])]
        rows = [[] for _ in DIRECTIONS]
        identity = []
        for part in parts:
            path = sources / f"{part.get('artwork', action)}.png"
            identity.append({"file": path.name, "sha256": sha256(path)})
            with Image.open(path) as sheet:
                for row in range(len(DIRECTIONS)):
                    rows[row].extend((*pose, path.name) for pose in extract_row(sheet, action, row, part))
        artwork[action] = {"sheets": identity, "sourceGroup": spec.get("sourceGroup"), "frameMs": spec["frameMs"],
                           "authoring": "Custom ImageGen artwork based on approved K1/K2 identity and Fellor motion references"}
        w, h = spec["width"], spec["height"]
        size = {"w": w, "h": h}
        for row, direction in enumerate(DIRECTIONS):
            extracted = rows[row]
            if len(extracted) != spec["frames"]:
                raise ValueError(f"{action} expected {spec['frames']}, got {len(extracted)}.")
            for n, (frame, cell, source_bounds, original_index, source_file) in enumerate(extracted):
                index = row * len(extracted) + n
                x, y = index % columns * w, top + index // columns * h
                atlas.paste(frame, (x, y))
                frames[f"{action}_{direction}_{n}"] = {
                    "frame": {"x": x, "y": y, **size}, "rotated": False, "trimmed": False,
                    "sourceSize": size, "spriteSourceSize": {"x": 0, "y": 0, **size},
                    "pivot": {"x": 0.5, "y": (h - spec["belowFoot"]) / h},
                    "duration": spec["frameMs"], "sourceCell": cell, "sourceBoxInCell": source_bounds,
                    "artworkColumnZeroBased": original_index, "artworkFile": source_file,
                }
        top += ((4 * spec["frames"] + columns - 1) // columns) * h
    atlas.save(ATLAS_DIR / f"{name}.png", optimize=True)
    data = {"frames": frames, "meta": {"image": f"{name}.png", "size": {"w": width, "h": height},
                                      "sources": artwork, "format": "RGBA8888"}}
    (ATLAS_DIR / f"{name}.json").write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")


def verify(group, actions, evidence):
    name = f"black_knight_conversion_{group}"
    png, meta = (ATLAS_DIR / f"{name}.{ext}" for ext in ("png", "json"))
    atlas = Image.open(png)
    data = json.loads(meta.read_text())
    assert atlas.mode == "RGBA"
    info = {"sha256": {p.name: sha256(p) for p in (png, meta)}, "clips": {}}
    max_frames = max(spec["frames"] for spec in actions.values())
    rows = len(actions) * 4
    contact = Image.new("RGB", (154 + 112*max_frames, 24 + 108*rows), "#34343d")
    draw = ImageDraw.Draw(contact)
    draw.text((8, 6), f"RUNTIME_ATLAS / {name} / same foot reference per row", fill="white")
    occupied = np.zeros((atlas.height, atlas.width), dtype=bool)
    for action, spec in actions.items():
        for d in DIRECTIONS:
            key = f"{action}_{d}"
            line = 24 + len(info["clips"])*108
            draw.text((8,line+41),f"{action}\n{d.upper()}",fill="white")
            poses, hashes = [], set()
            for i in range(spec["frames"]):
                name_frame = f"{key}_{i}"
                entry = data["frames"][name_frame]
                x, y, w, h = (entry["frame"][field] for field in "xywh")
                foot_y = h - spec["belowFoot"]
                assert (w,h)==(spec["width"],spec["height"]) and x+w <= atlas.width and y+h <= atlas.height
                assert entry["pivot"] == {"x": 0.5, "y": foot_y/h} and entry["duration"]==spec["frameMs"]
                assert not occupied[y:y+h,x:x+w].any()
                occupied[y:y+h,x:x+w] = True
                img=atlas.crop((x,y,x+w,y+h))
                arr = np.asarray(img)
                r,g,b,alpha=arr.astype(np.int16).transpose((2,0,1))
                assert set(np.unique(alpha)) == {0,255}, (name_frame,"empty or alpha")
                assert not np.any((alpha > 0) & cyan_mask(arr[:,:,:3])), (name_frame,"cyan")
                x0,y0,x1,y1=img.getbbox()
                assert 0<x0<x1<w and 0<y0<y1<h, (name_frame,"clipped")
                bright_weapon = np.count_nonzero((alpha > 0)&(r >= 170)&(g >= 90)&(r-b >= 75)&(g-b >= 35))
                if action.startswith("unarmed_"):
                    assert bright_weapon <= 2, (name_frame,"weapon in unarmed",bright_weapon)
                if action == "armed_buff_sequence":
                    assert bright_weapon >= 10, (name_frame, "held sword missing during buff", bright_weapon)
                digest=hashlib.sha256(img.tobytes()).hexdigest()
                hashes.add(digest)
                poses.append({"frame":name_frame,"bounds":[x0,y0,x1,y1],"sha256":digest,
                              "pivot":[w//2,foot_y],"frameMs":spec["frameMs"],"brightWeaponPixels":int(bright_weapon)})
                left = 154 + 112*i
                draw.line((left,line+85,left+111,line+85),fill="#525261")
                contact.paste(img,(left + (112-w)//2,line+86-foot_y),img)
            assert len(hashes) >= max(1,spec["frames"]-1), (key,"duplicate poses")
            info["clips"][key] = poses

    assert len(data["frames"]) == sum(len(frames) for frames in info["clips"].values())
    evidence.mkdir(parents=True,exist_ok=True)
    contact.save(evidence/f"{group}-contact.png",optimize=True)
    (evidence/f"{group}-asset-qa.json").write_text(json.dumps(info,ensure_ascii=False,indent=2)+"\n")
    print(group, len(info["clips"]), len(data["frames"]), info["sha256"])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("group")
    parser.add_argument("--source", type=Path, help="Pack selected PNGs from this directory before verifying")
    parser.add_argument("--evidence", type=Path, required=True)
    options = parser.parse_args()
    actions = json.loads(CONFIG.read_text())[options.group]
    if options.source:
        pack(options.group, actions, options.source)
    verify(options.group, actions, options.evidence)


if __name__ == "__main__":
    main()
