import zipfile
import os

z_free = r"G:\HOLLOW WOODS\Sound_Effects\Horror SFX\Horror SFX Free.zip"
with zipfile.ZipFile(z_free, "r") as z:
    print("=== HORROR SFX FREE.ZIP FILES ===")
    for f in sorted(z.namelist()):
        if not f.endswith('/'):
            info = z.getinfo(f)
            print(f"  {f} ({info.file_size} bytes)")
