import os
import shutil
import json

ROOT_DIR = os.getcwd()
ARCHIVE_DIR = os.path.join(ROOT_DIR, 'Backups', 'assets_archive', '_unused_assets_archive')
PUBLIC_ASSETS = os.path.join(ROOT_DIR, 'public', 'assets')

# Load scan results
with open('scripts/asset_scan_report.json', 'r', encoding='utf-8') as f:
    scan_data = json.load(f)

unused_list = scan_data['unusedList']
# Filter out maps - maps are the exported Tiled JSON maps
filtered_unused = [p for p in unused_list if not p.startswith('assets/maps/')]

print(f"Total unreferenced/backup asset files to archive: {len(filtered_unused)}")

os.makedirs(ARCHIVE_DIR, exist_ok=True)

moved_files = []
total_bytes_saved = 0

for rel_p in filtered_unused:
    src_full = os.path.join(ROOT_DIR, 'public', rel_p)
    if not os.path.exists(src_full):
        continue
    
    dest_full = os.path.join(ARCHIVE_DIR, rel_p)
    dest_parent = os.path.dirname(dest_full)
    os.makedirs(dest_parent, exist_ok=True)
    
    file_size = os.path.getsize(src_full)
    shutil.move(src_full, dest_full)
    total_bytes_saved += file_size
    moved_files.append((rel_p, file_size))

# Also remove empty directories left behind in public/assets
for root, dirs, files in os.walk(PUBLIC_ASSETS, topdown=False):
    for d in dirs:
        dir_p = os.path.join(root, d)
        try:
            if not os.listdir(dir_p):
                os.rmdir(dir_p)
                print(f"Removed empty directory: {os.path.relpath(dir_p, ROOT_DIR)}")
        except Exception:
            pass

print(f"\nSuccessfully archived {len(moved_files)} files to _unused_assets_archive/")
print(f"Total storage saved from public/ and dist/: {total_bytes_saved / 1024:.1f} KB ({total_bytes_saved / (1024*1024):.2f} MB)")

with open('scripts/archive_log.json', 'w', encoding='utf-8') as f:
    json.dump({
        'archiveCount': len(moved_files),
        'bytesSaved': total_bytes_saved,
        'archivedFiles': moved_files
    }, f, indent=2)
