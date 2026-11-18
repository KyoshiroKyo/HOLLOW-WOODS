import zipfile
import json

zpath = r"G:\HOLLOW WOODS\Sound_Effects\Horror SFX\Horror SFX Complete MP3.zip"

with zipfile.ZipFile(zpath, "r") as z:
    files = [f for f in z.namelist() if not f.endswith('/')]
    
categorized = {}
for f in files:
    parts = f.split('/')
    if len(parts) >= 2:
        cat = parts[1] # e.g. Ambient, Character, Monsters & Ghosts, etc.
        categorized.setdefault(cat, []).append(parts[-1])

print(f"Total categories: {len(categorized)}")
for cat, flist in sorted(categorized.items()):
    print(f"\n--- Category: {cat} ({len(flist)} files) ---")
    # print up to 15 sample files
    for item in sorted(flist)[:15]:
        print(f"  {item}")
