import os

dirs = [
    'public/assets/environment/sprites',
    'public/assets/environment/v14/buildings',
    'public/assets/environment/v14/foliage',
    'public/assets/environment/v14/props',
    'public/assets/environment/v14/trees',
    'public/assets/environment/v14/village',
]

with open('src/config/Constants.ts', 'r', encoding='utf-8') as f:
    text = f.read()

all_found = True
for d in dirs:
    for f in os.listdir(d):
        if f.endswith('.png'):
            base = f[:-4]
            target = f"'{base}'"
            if target not in text:
                print(f'{base}: NOT in Constants')
                all_found = False

print('All 51 prop filenames match Constants.ts keys:', all_found)
