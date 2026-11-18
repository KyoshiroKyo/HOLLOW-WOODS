import zipfile
import re

zpath = r"G:\HOLLOW WOODS\Sound_Effects\Horror SFX\Horror SFX Complete MP3.zip"

with zipfile.ZipFile(zpath, "r") as z:
    all_names = z.namelist()

def get_matches(regex_str):
    rx = re.compile(regex_str, re.IGNORECASE)
    matches = []
    for n in all_names:
        if not n.endswith('/'):
            base = n.split('/')[-1]
            if rx.search(base):
                matches.append((n, base))
    return matches

print("=== Footstep / Movement ===")
for path, base in get_matches(r"footstep|step|creak|squish|mud|wood|stone|gravel|leaf|leaves|grass|slosh")[:25]:
    print(f"  {base}  -->  {path}")

print("\n=== Wind / Water / Ambience ===")
for path, base in get_matches(r"wind|rain|water|mist|drip|splash|bubble|stream|insect|cricket|frog|swamp")[:25]:
    print(f"  {base}  -->  {path}")

print("\n=== Bat / Ghost / Ambush ===")
for path, base in get_matches(r"bat|wing|flap|flutter|screech|squeak|ghost|whisper|moan|groan|wail|phantom|spirit|chatter|gasp|scream")[:25]:
    print(f"  {base}  -->  {path}")

print("\n=== Monster / Growl / Beast ===")
for path, base in get_matches(r"monster|growl|snarl|roar|beast|bite|chew|demon|grunt|hiss|hound|wolf")[:25]:
    print(f"  {base}  -->  {path}")

print("\n=== Boss / Drone / Stinger / Rune ===")
for path, base in get_matches(r"drone|stinger|ominous|heartbeat|pulse|tension|bell|gong|resonance|chime|rune|portal|magic|earthquake|rumble")[:25]:
    print(f"  {base}  -->  {path}")

print("\n=== Interactables / Objects / Chest / Page ===")
for path, base in get_matches(r"door|drawer|chest|box|book|page|paper|key|metal|wood|writing|pickup|cloth")[:25]:
    print(f"  {base}  -->  {path}")
