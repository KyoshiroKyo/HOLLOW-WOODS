import os
import zipfile
import re

base_se = r"G:\HOLLOW WOODS\Sound_Effects"

# 1. 8-bit & 16-bit Pack
bit_dir = os.path.join(base_se, "8-bit  16-bit Sound Effects (x25) Pack")
bit_files = []
if os.path.exists(bit_dir):
    for f in os.listdir(bit_dir):
        fp = os.path.join(bit_dir, f)
        if os.path.isfile(fp):
            bit_files.append({"name": f, "path": os.path.relpath(fp, base_se), "size": os.path.getsize(fp)})

# 2. Horror SFX Complete MP3.zip
z_mp3 = os.path.join(base_se, "Horror SFX", "Horror SFX Complete MP3.zip")
horror_mp3_files = []
if os.path.exists(z_mp3):
    with zipfile.ZipFile(z_mp3, "r") as z:
        for info in z.infolist():
            if not info.is_dir():
                horror_mp3_files.append({"name": os.path.basename(info.filename), "path": info.filename, "size": info.file_size})

# 3. Super Dialogue Audio Pack
diag_dir = os.path.join(base_se, "_extracted_dialogue", "Super Dialogue Audio Pack v1", "Step 2 - Audio Files")
diag_files = []
if os.path.exists(diag_dir):
    for root, dirs, files in os.walk(diag_dir):
        for f in files:
            if f.endswith('.wav'):
                fp = os.path.join(root, f)
                diag_files.append({"name": f, "path": os.path.relpath(fp, base_se), "size": os.path.getsize(fp)})

print(f"Loaded: {len(bit_files)} bit files, {len(horror_mp3_files)} horror MP3 files, {len(diag_files)} dialogue files.")

def find_matches(pattern, file_list):
    rx = re.compile(pattern, re.IGNORECASE)
    return [f for f in file_list if rx.search(f["name"]) or rx.search(f["path"])]

# Let us search for categories
queries = {
    "footstep": r"footstep|step|walk|run|creak",
    "mud_liquid": r"mud|liquid|slosh|splash|bubble|water|drip|gargl",
    "wind_ambient": r"wind|breeze|haunting|ambient|drone|air",
    "bat_wing": r"bat|wing|flap|flutter|screech|squeak",
    "ghost_whisper": r"ghost|whisper|moan|groan|wail|phantom|spirit|breath|scream|chatter",
    "monster_growl": r"monster|growl|snarl|roar|creature|beast|bite|chew|demon",
    "drone_stinger": r"drone|stinger|ominous|spooky|tension|scary|horror|chord|impact",
    "metal_rune": r"metal|chime|bell|scrape|resonance|twang|stone|rock",
    "gore_damage": r"blood|flesh|bone|snap|hit|damage|hurt|slash|stab"
}

results = {}
for qname, qpattern in queries.items():
    matches = find_matches(qpattern, horror_mp3_files)
    results[qname] = matches
    print(f"Query [{qname}] found {len(matches)} files in Horror SFX Complete MP3.")
    for m in matches[:5]:
        print(f"   -> {m['name']} ({m['size']} bytes)")

# Check 8-bit for UI/Interact
print("\n8-bit match samples:")
for m in bit_files:
    print(f"   8-bit: {m['name']}")
