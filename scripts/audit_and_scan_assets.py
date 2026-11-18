import os
import re
import json
from PIL import Image

ROOT_DIR = os.getcwd()
PUBLIC_ASSETS = os.path.join(ROOT_DIR, 'public', 'assets')

# 1. Collect all asset files in public/assets
all_assets = []
for root, dirs, files in os.walk(PUBLIC_ASSETS):
    for f in files:
        full_path = os.path.join(root, f)
        rel_path = os.path.relpath(full_path, os.path.join(ROOT_DIR, 'public')).replace('\\', '/')
        all_assets.append({
            'full_path': full_path,
            'rel_path': rel_path,
            'filename': f,
            'basename': os.path.splitext(f)[0],
            'ext': os.path.splitext(f)[1].lower(),
            'size': os.path.getsize(full_path)
        })

print(f"Total assets found in public/assets: {len(all_assets)} files")

# 2. Collect all source text across src/, public/, index.html
source_texts = []
source_files = []

for root, dirs, files in os.walk(os.path.join(ROOT_DIR, 'src')):
    for f in files:
        if f.endswith(('.ts', '.js', '.json', '.css', '.html')):
            p = os.path.join(root, f)
            source_files.append(p)
            with open(p, 'r', encoding='utf-8', errors='ignore') as fp:
                source_texts.append((p, fp.read()))

# Also check index.html and public/*.json
for f in ['index.html', 'public/p2game.json']:
    p = os.path.join(ROOT_DIR, f)
    if os.path.exists(p):
        source_files.append(p)
        with open(p, 'r', encoding='utf-8', errors='ignore') as fp:
            source_texts.append((p, fp.read()))

print(f"Total source/config files scanned for references: {len(source_files)} files")

# 3. Check usage of each asset
used_assets = []
unused_assets = []
oversized_images = []

for asset in all_assets:
    rel_p = asset['rel_path']  # e.g. "assets/environment/sprites/tree_oak_1.png"
    fn = asset['filename']     # e.g. "tree_oak_1.png"
    bn = asset['basename']     # e.g. "tree_oak_1"
    
    # Check image size for WebGL > 2048x2048
    if asset['ext'] in ['.png', '.jpg', '.jpeg', '.webp']:
        try:
            with Image.open(asset['full_path']) as img:
                w, h = img.size
                asset['dimensions'] = (w, h)
                if w > 2048 or h > 2048:
                    oversized_images.append((asset, (w, h)))
        except Exception as e:
            asset['dimensions'] = None

    # Exclude backup directories and files explicitly from being "used" unless specifically referenced
    is_backup = (
        '.bak' in rel_p or
        '.bak' in fn or
        'pilot_verification' in rel_p or
        fn.endswith('.bak')
    )

    found = False
    found_in = []

    if not is_backup:
        for src_path, content in source_texts:
            # Check full relative path or without 'assets/' prefix
            path_no_assets = rel_p.replace('assets/', '', 1)
            if (rel_p in content or path_no_assets in content or fn in content):
                found = True
                found_in.append(os.path.relpath(src_path, ROOT_DIR))
                break
            
            # Special check for audio / dynamic string matching
            if asset['ext'] in ['.wav', '.mp3', '.ogg']:
                if bn in content:
                    found = True
                    found_in.append(os.path.relpath(src_path, ROOT_DIR))
                    break

    if found:
        asset['referenced_in'] = found_in
        used_assets.append(asset)
    else:
        unused_assets.append(asset)

print("\n=== SCAN SUMMARY ===")
print(f"Active / In-use assets: {len(used_assets)}")
print(f"Unused / Orphan / Backup assets: {len(unused_assets)}")
print(f"Oversized images (>2048x2048): {len(oversized_images)}")

total_used_size = sum(a['size'] for a in used_assets)
total_unused_size = sum(a['size'] for a in unused_assets)

print(f"Active assets size: {total_used_size / (1024*1024):.2f} MB")
print(f"Unused assets size: {total_unused_size / (1024*1024):.2f} MB")

print("\n=== UNUSED ASSETS BREAKDOWN ===")
for u in unused_assets:
    print(f"[{u['size']/1024:.1f} KB] {u['rel_path']}")

if oversized_images:
    print("\n=== OVERSIZED IMAGES ===")
    for a, dims in oversized_images:
        print(f"{a['rel_path']} - {dims[0]}x{dims[1]}")
else:
    print("\nNo oversized images found (>2048x2048). All textures conform to WebGL mobile/desktop bounds.")

with open('scripts/asset_scan_report.json', 'w', encoding='utf-8') as f:
    json.dump({
        'totalCount': len(all_assets),
        'usedCount': len(used_assets),
        'unusedCount': len(unused_assets),
        'usedSize': total_used_size,
        'unusedSize': total_unused_size,
        'unusedList': [u['rel_path'] for u in unused_assets],
        'oversizedList': [(a['rel_path'], dims) for a, dims in oversized_images]
    }, f, indent=2)
