import json

with open('src/data/zones.json', 'r', encoding='utf-8') as f:
    zdata = json.load(f)

print("=== ROCKS IN ZONES.JSON ===")
for z in zdata['zones']:
    zid = z['id']
    for obj in z.get('interactables', []):
        if obj.get('type') == 'rock' or 'rock' in obj.get('id', ''):
            print(f"{zid}: id={obj.get('id')}, type={obj.get('type')}, x={obj.get('x')}, y={obj.get('y')}, name={obj.get('name')}")

print("\n=== BELLHOLLOW NPCS & INTERACTABLES ===")
for z in zdata['zones']:
    if z['id'] == 'bellhollow':
        print("-- NPCS --")
        for npc in z.get('npcs', []):
            print(f"NPC: id={npc.get('id')}, name={npc.get('name')}, x={npc.get('x')}, y={npc.get('y')}")
        print("-- INTERACTABLES --")
        for obj in z.get('interactables', []):
            print(f"OBJ: id={obj.get('id')}, name={obj.get('name')}, x={obj.get('x')}, y={obj.get('y')}, type={obj.get('type')}")
