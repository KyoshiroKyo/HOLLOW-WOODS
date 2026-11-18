import os

diag_dir = r"G:\HOLLOW WOODS\Sound_Effects\_extracted_dialogue\Super Dialogue Audio Pack v1\Step 2 - Audio Files"
if os.path.exists(diag_dir):
    folders = os.listdir(diag_dir)
    print("Super Dialogue Audio Pack folders:")
    for f in sorted(folders):
        fpath = os.path.join(diag_dir, f)
        if os.path.isdir(fpath):
            files = [x for x in os.listdir(fpath) if os.path.isfile(os.path.join(fpath, x))]
            print(f"  {f}: {len(files)} files (Sample: {files[:3]})")

bit_dir = r"G:\HOLLOW WOODS\Sound_Effects\8-bit  16-bit Sound Effects (x25) Pack"
if os.path.exists(bit_dir):
    print("\n8-bit 16-bit Sound Effects files:")
    for f in sorted(os.listdir(bit_dir)):
        print(f"  {f}")
