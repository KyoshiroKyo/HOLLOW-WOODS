import zipfile
import os

base_dir = r"G:\HOLLOW WOODS\Sound_Effects\Horror SFX"
zips = [
    "Horror SFX Free.zip",
    "Horror SFX Complete MP3.zip",
    "Horror SFX Complete OGG.zip"
]

for zname in zips:
    zpath = os.path.join(base_dir, zname)
    if os.path.exists(zpath):
        with zipfile.ZipFile(zpath, "r") as z:
            infolist = z.infolist()
            files = [info.filename for info in infolist if not info.is_dir()]
            print(f"=== {zname} ===")
            print(f"Total files: {len(files)}")
            # Group by top-level folder inside zip
            folders = {}
            for f in files:
                parts = f.split('/')
                top = parts[0] if len(parts) > 1 else 'root'
                sub = parts[1] if len(parts) > 2 else ''
                key = f"{top}/{sub}" if sub else top
                folders[key] = folders.get(key, 0) + 1
            print("Folder breakdown:")
            for k, count in sorted(folders.items()):
                print(f"  {k}: {count} files")
            print()
