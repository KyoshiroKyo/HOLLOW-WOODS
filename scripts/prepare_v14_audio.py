import zipfile
import os
import shutil

dest_dir = r"G:\HOLLOW WOODS\public\assets\audio\sfx\v14"
os.makedirs(dest_dir, exist_ok=True)

free_zip = r"G:\HOLLOW WOODS\Sound_Effects\Horror SFX\Horror SFX Free.zip"
mp3_zip = r"G:\HOLLOW WOODS\Sound_Effects\Horror SFX\Horror SFX Complete MP3.zip"

extract_map = [
    # (zip_source, internal_path, target_filename)
    # 1. Footsteps & Foley
    (free_zip, "Horror SFX Free/Liquids/Liquid_slosh.wav", "footstep_mud_1.wav"),
    (free_zip, "Horror SFX Free/Liquids/Liquid_plash poor.wav", "footstep_mud_2.wav"),
    (free_zip, "Horror SFX Free/House & Office/Door_squeeky_2.wav", "footstep_wood_1.wav"),
    (free_zip, "Horror SFX Free/Ambient/Old House_creeky metal and wood_ambiance_7.wav", "footstep_wood_2.wav"),
    (free_zip, "Horror SFX Free/Ambient/Tap_reverb.wav", "footstep_stone_1.wav"),
    (free_zip, "Horror SFX Free/Ambient/Metal_random tapping.wav", "footstep_stone_2.wav"),
    (mp3_zip, "Horror SFX Complete MP3/Ambient/Wind Through Foliage.mp3", "footstep_leaves_1.mp3"),

    # 2. Bat & Ghost Ambush
    (free_zip, "Horror SFX Free/Character/woosh.wav", "bat_flap.wav"),
    (free_zip, "Horror SFX Free/Monsters & Ghosts/Hiss.wav", "bat_screech.wav"),
    (free_zip, "Horror SFX Free/Monsters & Ghosts/Bite.wav", "bat_bite.wav"),
    (free_zip, "Horror SFX Free/Monsters & Ghosts/Ghost_moan_2.wav", "ghost_moan.wav"),
    (free_zip, "Horror SFX Free/Monsters & Ghosts/Tone_Moaning.wav", "ghost_whisper.wav"),
    (free_zip, "Horror SFX Free/Monsters & Ghosts/Ghost_scream_3.wav", "ghost_scream.wav"),
    (free_zip, "Horror SFX Free/Character/woosh_5.wav", "ghost_dissipate.wav"),
    (free_zip, "Horror SFX Free/Stingers and Spooky Triggers/Piano_stinger_dissonent.wav", "jumpscare_stinger.wav"),
    (free_zip, "Horror SFX Free/Character/Gasp.wav", "sanity_gasp.wav"),

    # 3. Monster Telegraphs
    (free_zip, "Horror SFX Free/Stingers and Spooky Triggers/Slide guitar_decreasing pitch.wav", "scout_whistle.wav"),
    (free_zip, "Horror SFX Free/House & Office/Metal scrape_scratch.wav", "dagger_slash.wav"),
    (free_zip, "Horror SFX Free/Monsters & Ghosts/Monster_growl_1.wav", "skull_wolf_growl.wav"),
    (free_zip, "Horror SFX Free/Monsters & Ghosts/Monster_growl_5.wav", "skull_wolf_snarl.wav"),
    (free_zip, "Horror SFX Free/Monsters & Ghosts/Monster_Roar_4.wav", "behemoth_roar.wav"),
    (free_zip, "Horror SFX Free/Monsters & Ghosts/Gore_mushy.wav", "behemoth_thud.wav"),
    (free_zip, "Horror SFX Free/Monsters & Ghosts/Robotic_bass.wav", "void_stalker_drone.wav"),
    (free_zip, "Horror SFX Free/Monsters & Ghosts/Scream_Robotic.wav", "void_stalker_screech.wav"),

    # 4. Boss & Environment Shifts
    (free_zip, "Horror SFX Free/Stingers and Spooky Triggers/Piano_drone_low_sustained_2.wav", "boss_drone.wav"),
    (free_zip, "Horror SFX Free/Stingers and Spooky Triggers/Metal_resonance.wav", "rune_shift.wav"),
    (free_zip, "Horror SFX Free/Ambient/Bell_low.wav", "bell_toll_low.wav"),
    (free_zip, "Horror SFX Free/House & Office/Drawer_open_2.wav", "chest_creak.wav"),
    (free_zip, "Horror SFX Free/House & Office/Writing.wav", "journal_page.wav")
]

copied = 0
for zpath, internal_file, out_name in extract_map:
    target_path = os.path.join(dest_dir, out_name)
    with zipfile.ZipFile(zpath, "r") as z:
        if internal_file in z.namelist():
            with z.open(internal_file) as src_f, open(target_path, "wb") as dst_f:
                shutil.copyfileobj(src_f, dst_f)
            print(f"Extracted: {out_name} ({os.path.getsize(target_path)} bytes)")
            copied += 1
        else:
            print(f"ERROR: Could not find {internal_file} in {os.path.basename(zpath)}")

print(f"\nCompleted: {copied}/{len(extract_map)} V1.4 audio assets prepared in {dest_dir}")
