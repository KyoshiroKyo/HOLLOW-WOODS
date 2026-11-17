import json
import os

print("=== 1. AUDITING src/data/zones.json ===")
with open('src/data/zones.json', 'r', encoding='utf-8') as f:
    zdata = json.load(f)

zones = zdata.get('zones', [])
print(f"Total zones found: {len(zones)}")
for z in zones:
    zid = z.get('id')
    name = z.get('name')
    bounds = z.get('bounds')
    npcs = z.get('npcs', [])
    print(f"Zone: {zid} | Name: {name} | Bounds: {bounds}")
    for n in npcs:
        print(f"   NPC -> id: {n.get('id')}, name: {n.get('name')}, pos: ({n.get('x')}, {n.get('y')})")

print("\n=== 2. AUDITING src/data/dialogues.json ===")
with open('src/data/dialogues.json', 'r', encoding='utf-8') as f:
    ddata = json.load(f)
dialogues = ddata.get('dialogues', {})
print(f"Total dialogue nodes: {len(dialogues)}")
for k, v in list(dialogues.items())[:10]:
    print(f"  {k} -> speaker: {v.get('speaker', 'unknown')}, text: {v.get('text', '')[:50]}...")

print("\n=== 3. AUDITING src/data/lore.json ===")
with open('src/data/lore.json', 'r', encoding='utf-8') as f:
    ldata = json.load(f)
lore_items = ldata.get('lore', ldata.get('entries', []))
print(f"Total lore entries: {len(lore_items)}")
for l in lore_items[:5]:
    print(f"  Lore: {l.get('id')} - {l.get('title')}")

print("\n=== 4. AUDITING src/data/puzzles.json ===")
with open('src/data/puzzles.json', 'r', encoding='utf-8') as f:
    pdata = json.load(f)
puzzles = pdata.get('puzzles', [])
print(f"Total puzzles: {len(puzzles)}")
for p in puzzles:
    print(f"  Puzzle: {p.get('id')} - {p.get('name')}")
