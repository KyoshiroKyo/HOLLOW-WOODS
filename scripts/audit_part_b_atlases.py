import os
import json
from PIL import Image

ATLASES = [
    ("public/assets/atlases/hollow_props_atlas.json", "public/assets/atlases/hollow_props_atlas.png"),
    ("public/assets/atlases/item_icons_atlas.json", "public/assets/atlases/item_icons_atlas.png"),
    ("public/assets/characters/black_knight/black_knight_armed_idle.json", "public/assets/characters/black_knight/black_knight_armed_idle.png"),
    ("public/assets/characters/black_knight/black_knight_conversion_actions.json", "public/assets/characters/black_knight/black_knight_conversion_actions.png"),
    ("public/assets/characters/black_knight/black_knight_conversion_air.json", "public/assets/characters/black_knight/black_knight_conversion_air.png"),
    ("public/assets/characters/black_knight/black_knight_conversion_combat.json", "public/assets/characters/black_knight/black_knight_conversion_combat.png"),
    ("public/assets/characters/black_knight/black_knight_conversion_motion.json", "public/assets/characters/black_knight/black_knight_conversion_motion.png"),
    ("public/assets/characters/black_knight/black_knight_conversion_states.json", "public/assets/characters/black_knight/black_knight_conversion_states.png"),
    ("public/assets/characters/black_knight/black_knight_core_combat.json", "public/assets/characters/black_knight/black_knight_core_combat.png"),
    ("public/assets/characters/black_knight/black_knight_defense.json", "public/assets/characters/black_knight/black_knight_defense.png"),
    ("public/assets/characters/black_knight/black_knight_extended_skills.json", "public/assets/characters/black_knight/black_knight_extended_skills.png"),
    ("public/assets/characters/black_knight/black_knight_movement.json", "public/assets/characters/black_knight/black_knight_movement.png")
]

def audit_atlases():
    report = []
    total_frames_checked = 0
    issues_found = []

    for json_path, png_path in ATLASES:
        atlas_name = os.path.basename(json_path)
        print(f"\n--- Checking Atlas: {atlas_name} ---")

        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        img = Image.open(png_path)
        img_w, img_h = img.size
        img_mode = img.mode

        meta_size = data.get('meta', {}).get('size', {})
        meta_w = meta_size.get('w')
        meta_h = meta_size.get('h')

        dim_match = (img_w == meta_w and img_h == meta_h)
        print(f"  Image dimensions: {img_w}x{img_h} ({img_mode}) | Meta: {meta_w}x{meta_h} -> {'MATCH' if dim_match else 'MISMATCH'}")
        if not dim_match:
            issues_found.append({
                "atlas": atlas_name,
                "type": "DIMENSION_MISMATCH",
                "details": f"PNG is {img_w}x{img_h}, but meta.size declares {meta_w}x{meta_h}"
            })

        # Parse frames (list or dict)
        raw_frames = data.get('frames', [])
        frame_list = []
        frame_names = set()
        duplicate_names = []

        if isinstance(raw_frames, list):
            for f_entry in raw_frames:
                fname = f_entry.get('filename')
                if fname in frame_names:
                    duplicate_names.append(fname)
                frame_names.add(fname)
                frame_list.append((fname, f_entry))
        elif isinstance(raw_frames, dict):
            for fname, f_entry in raw_frames.items():
                if fname in frame_names:
                    duplicate_names.append(fname)
                frame_names.add(fname)
                frame_list.append((fname, f_entry))

        print(f"  Total frames: {len(frame_list)} | Unique: {len(frame_names)}")
        total_frames_checked += len(frame_list)

        if duplicate_names:
            issues_found.append({
                "atlas": atlas_name,
                "type": "DUPLICATE_FRAME_NAMES",
                "details": f"{len(duplicate_names)} duplicates: {duplicate_names[:5]}"
            })

        # Load image into RGBA for alpha sampling
        rgba_img = img.convert('RGBA')

        atlas_empty_frames = []
        atlas_oob_frames = []
        atlas_border_touch_frames = []

        for fname, f_entry in frame_list:
            rect = f_entry.get('frame', {})
            rx = rect.get('x', 0)
            ry = rect.get('y', 0)
            rw = rect.get('w', 0)
            rh = rect.get('h', 0)

            # Check bounds
            if rx < 0 or ry < 0 or rw <= 0 or rh <= 0 or (rx + rw > img_w) or (ry + rh > img_h):
                atlas_oob_frames.append((fname, rx, ry, rw, rh))
                continue

            # Check cropped frame alpha
            box = (rx, ry, rx + rw, ry + rh)
            frame_crop = rgba_img.crop(box)
            alpha_band = frame_crop.split()[3]
            alpha_extrema = alpha_band.getextrema() # (min_alpha, max_alpha)

            if alpha_extrema[1] == 0:
                atlas_empty_frames.append(fname)

        if atlas_oob_frames:
            issues_found.append({
                "atlas": atlas_name,
                "type": "OUT_OF_BOUNDS_FRAMES",
                "count": len(atlas_oob_frames),
                "samples": atlas_oob_frames[:3]
            })
            print(f"  [ERROR] Out of bounds frames: {len(atlas_oob_frames)}")

        if atlas_empty_frames:
            issues_found.append({
                "atlas": atlas_name,
                "type": "EMPTY_TRANSPARENT_FRAMES",
                "count": len(atlas_empty_frames),
                "samples": atlas_empty_frames[:3]
            })
            print(f"  [WARN] Fully transparent empty frames: {len(atlas_empty_frames)}")

        if not atlas_oob_frames and not atlas_empty_frames and dim_match and not duplicate_names:
            print("  ✓ All frames geometrically valid and contain non-zero alpha.")

    # Special Check: Character foot alignment in Walk / Run / Idle
    print("\n--- Auditing Foot Alignment in Movement and Idle Atlases ---")
    movement_json = "public/assets/characters/black_knight/black_knight_movement.json"
    movement_png = "public/assets/characters/black_knight/black_knight_movement.png"
    idle_json = "public/assets/characters/black_knight/black_knight_armed_idle.json"
    idle_png = "public/assets/characters/black_knight/black_knight_armed_idle.png"

    foot_telemetry = {}

    for name, jpath, ppath in [("movement", movement_json, movement_png), ("idle", idle_json, idle_png)]:
        with open(jpath, 'r', encoding='utf-8') as f:
            d = json.load(f)
        img = Image.open(ppath).convert('RGBA')
        frames = d.get('frames', [])
        if isinstance(frames, dict):
            frames = [{'filename': k, **v} for k, v in frames.items()]

        anim_groups = {}
        for f in frames:
            fn = f.get('filename', '')
            prefix = fn.rsplit('_', 1)[0] if '_' in fn else fn
            anim_groups.setdefault(prefix, []).append(f)

        foot_telemetry[name] = {}
        for group_name, flist in sorted(anim_groups.items()):
            flist.sort(key=lambda x: x.get('filename', ''))
            foot_positions = []
            for f in flist:
                rect = f.get('frame', {})
                rx, ry, rw, rh = rect.get('x'), rect.get('y'), rect.get('w'), rect.get('h')
                crop = img.crop((rx, ry, rx + rw, ry + rh))
                alpha = crop.split()[3]
                # Find lowest row with alpha > 30
                lowest_y = None
                for y in range(rh - 1, -1, -1):
                    row_alphas = [alpha.getpixel((x, y)) for x in range(rw)]
                    if any(a > 30 for a in row_alphas):
                        lowest_y = y
                        break
                foot_positions.append({
                    "frame": f.get('filename'),
                    "frame_h": rh,
                    "foot_y_in_frame": lowest_y,
                    "bottom_pad": (rh - 1 - lowest_y) if lowest_y is not None else None
                })
            foot_telemetry[name][group_name] = foot_positions
            pads = [fp["bottom_pad"] for fp in foot_positions if fp["bottom_pad"] is not None]
            if pads:
                min_p, max_p = min(pads), max(pads)
                print(f"  [{name}] {group_name} ({len(flist)} frames): Foot bottom pad min={min_p}px, max={max_p}px, delta={max_p - min_p}px")

    summary = {
        "total_atlases": len(ATLASES),
        "total_frames_checked": total_frames_checked,
        "issues_found": issues_found,
        "foot_telemetry_summary": {
            k: {g: {"frame_count": len(v), "max_foot_delta": max(f["bottom_pad"] for f in v if f["bottom_pad"] is not None) - min(f["bottom_pad"] for f in v if f["bottom_pad"] is not None)}
                for g, v in groups.items()}
            for k, groups in foot_telemetry.items()
        }
    }

    with open("Read/V1.5/Reports/atlas_validation_metrics.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print("\n=======================================================")
    print(f"ATLAS AUDIT COMPLETE: {total_frames_checked} frames across {len(ATLASES)} atlases checked.")
    print(f"Total Structural Issues: {len(issues_found)}")
    print("=======================================================")

if __name__ == "__main__":
    audit_atlases()
