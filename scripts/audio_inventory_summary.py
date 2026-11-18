import os
import zipfile

base_se = r"G:\HOLLOW WOODS\Sound_Effects"

# Summary stats
packs = {
    "8-bit  16-bit Sound Effects (x25) Pack": 0,
    "Horror SFX / Horror SFX Free.zip": 0,
    "Horror SFX / Horror SFX Complete MP3.zip": 0,
    "Horror SFX / Horror SFX Complete OGG.zip": 0,
    "_extracted_dialogue / Super Dialogue Audio Pack v1": 0
}

# 1. 8-bit
bit_dir = os.path.join(base_se, "8-bit  16-bit Sound Effects (x25) Pack")
if os.path.exists(bit_dir):
    packs["8-bit  16-bit Sound Effects (x25) Pack"] = len([f for f in os.listdir(bit_dir) if os.path.isfile(os.path.join(bit_dir, f))])

# 2. Free zip
z_free = os.path.join(base_se, "Horror SFX", "Horror SFX Free.zip")
if os.path.exists(z_free):
    with zipfile.ZipFile(z_free, "r") as z:
        packs["Horror SFX / Horror SFX Free.zip"] = len([f for f in z.namelist() if not f.endswith('/')])

# 3. Complete MP3
z_mp3 = os.path.join(base_se, "Horror SFX", "Horror SFX Complete MP3.zip")
if os.path.exists(z_mp3):
    with zipfile.ZipFile(z_mp3, "r") as z:
        packs["Horror SFX / Horror SFX Complete MP3.zip"] = len([f for f in z.namelist() if not f.endswith('/')])

# 4. Complete OGG
z_ogg = os.path.join(base_se, "Horror SFX", "Horror SFX Complete OGG.zip")
if os.path.exists(z_ogg):
    with zipfile.ZipFile(z_ogg, "r") as z:
        packs["Horror SFX / Horror SFX Complete OGG.zip"] = len([f for f in z.namelist() if not f.endswith('/')])

# 5. Dialogue
diag_dir = os.path.join(base_se, "_extracted_dialogue", "Super Dialogue Audio Pack v1", "Step 2 - Audio Files")
diag_count = 0
if os.path.exists(diag_dir):
    for root, dirs, files in os.walk(diag_dir):
        diag_count += len([f for f in files if f.endswith('.wav')])
packs["_extracted_dialogue / Super Dialogue Audio Pack v1"] = diag_count

print("=== SOUND EFFECTS INVENTORY SUMMARY ===")
total = 0
for k, v in packs.items():
    print(f"  {k}: {v} audio files")
    total += v
print(f"Total Audio Inventory: {total} files")
