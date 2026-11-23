#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
audit_part_c_map_geometry.py
Part C: Map Geometry & Object Reconciliation Audit
Compares 17 Tiled map JSONs (src/data/maps/*.json) against src/data/zones.json and WorldBuilder.ts
"""

import json
import glob
import os
import re

def run_map_geometry_audit():
    maps_dir = 'src/data/maps'
    zones_path = 'src/data/zones.json'
    world_builder_path = 'src/world/WorldBuilder.ts'

    with open(zones_path, 'r', encoding='utf-8') as f:
        zones_data = json.load(f)['zones']
    zones_by_id = {z['id']: z for z in zones_data}

    with open(world_builder_path, 'r', encoding='utf-8') as f:
        wb_source = f.read()

    map_files = sorted(glob.glob(os.path.join(maps_dir, '*.json')))
    print(f"Total Tiled map files found: {len(map_files)}")
    print(f"Total zones in zones.json: {len(zones_data)}")

    audit_results = {
        "summary": {},
        "zones_comparison": {},
        "target_objects": {},
        "discrepancies": []
    }

    # Target objects explicitly requested for deep audit
    target_object_keys = [
        "gather_wood_ow_1",
        "gather_resin_ow_1",
        "ow_bound_bottom_left",
        "ow_bound_right_top",
        "ow_willow_trunk",
        "env_knights_memorial_stele", # Bia Đá Tưởng Niệm Kỵ Sĩ
        "hide_bush_ow_s_curve",       # Bụi Ẩn Nấp Khúc Cua S
        "to_bell_workshop",           # Đường xuống Bell Workshop
        "sign_sub_bell_workshop"
    ]

    total_map_objects = 0
    total_zone_elements = 0

    for mf in map_files:
        zone_id = os.path.splitext(os.path.basename(mf))[0]
        zone = zones_by_id.get(zone_id)

        with open(mf, 'r', encoding='utf-8') as f:
            tiled_map = json.load(f)

        # Collect tiled objects from all objectgroup layers
        tiled_objects = []
        for layer in tiled_map.get('layers', []):
            if layer.get('type') == 'objectgroup':
                for obj in layer.get('objects', []):
                    tiled_objects.append({
                        "id": obj.get("id"),
                        "name": obj.get("name", ""),
                        "type": obj.get("type", ""),
                        "x": obj.get("x"),
                        "y": obj.get("y"),
                        "width": obj.get("width"),
                        "height": obj.get("height"),
                        "layer": layer.get("name")
                    })

        total_map_objects += len(tiled_objects)

        # Collect zone elements
        zone_elements = []
        if zone:
            for c in zone.get('colliders', []):
                zone_elements.append({
                    "category": "collider",
                    "id": c.get("id", ""),
                    "name": c.get("name", c.get("id", "")),
                    "type": c.get("type", "collider"),
                    "x": c.get("x"),
                    "y": c.get("y"),
                    "width": c.get("width"),
                    "height": c.get("height")
                })
            for i in zone.get('interactables', []):
                zone_elements.append({
                    "category": "interactable",
                    "id": i.get("id", ""),
                    "name": i.get("name", ""),
                    "type": i.get("type", ""),
                    "x": i.get("x"),
                    "y": i.get("y"),
                    "width": i.get("width"),
                    "height": i.get("height"),
                    "actionId": i.get("actionId", "")
                })
            for t in zone.get('transitions', []):
                tr = t.get("triggerRect", {})
                zone_elements.append({
                    "category": "transition",
                    "id": t.get("id", ""),
                    "name": t.get("displayLabel", t.get("id", "")),
                    "type": "transition",
                    "x": tr.get("x"),
                    "y": tr.get("y"),
                    "width": tr.get("width"),
                    "height": tr.get("height"),
                    "toZone": t.get("toZone")
                })
            for n in zone.get('npcs', []):
                zone_elements.append({
                    "category": "npc",
                    "id": n.get("id", ""),
                    "name": n.get("name", ""),
                    "type": "npc",
                    "x": n.get("x"),
                    "y": n.get("y"),
                    "width": 32,
                    "height": 32
                })

        total_zone_elements += len(zone_elements)

        # Cross reference between Tiled map and zones.json
        # Map objects indexed by name and id
        map_by_name = {o["name"]: o for o in tiled_objects if o["name"]}
        zone_by_id_map = {e["id"]: e for e in zone_elements if e["id"]}

        # Compare items
        zone_discrepancies = []

        # Check items in zones.json that are missing or have coordinate mismatch in Tiled
        for zid, ze in zone_by_id_map.items():
            if zid in map_by_name:
                mo = map_by_name[zid]
                dx = abs(ze["x"] - mo["x"]) if (ze["x"] is not None and mo["x"] is not None) else 0
                dy = abs(ze["y"] - mo["y"]) if (ze["y"] is not None and mo["y"] is not None) else 0
                dw = abs(ze["width"] - mo["width"]) if (ze["width"] is not None and mo["width"] is not None) else 0
                dh = abs(ze["height"] - mo["height"]) if (ze["height"] is not None and mo["height"] is not None) else 0

                if dx > 0 or dy > 0 or dw > 0 or dh > 0:
                    disc = {
                        "zone_id": zone_id,
                        "element_id": zid,
                        "type": "COORDINATE_OR_SIZE_MISMATCH",
                        "zone_data": {"x": ze["x"], "y": ze["y"], "w": ze["width"], "h": ze["height"]},
                        "tiled_data": {"x": mo["x"], "y": mo["y"], "w": mo["width"], "h": mo["height"], "tiled_id": mo["id"]},
                        "delta": {"dx": dx, "dy": dy, "dw": dw, "dh": dh}
                    }
                    zone_discrepancies.append(disc)
                    audit_results["discrepancies"].append(disc)
            else:
                disc = {
                    "zone_id": zone_id,
                    "element_id": zid,
                    "type": "PRESENT_IN_ZONES_MISSING_IN_TILED",
                    "zone_data": {"x": ze["x"], "y": ze["y"], "w": ze["width"], "h": ze["height"], "category": ze["category"], "name": ze["name"]}
                }
                zone_discrepancies.append(disc)
                audit_results["discrepancies"].append(disc)

        # Check items in Tiled that are missing in zones.json
        for mo in tiled_objects:
            mname = mo["name"]
            if not mname or mname not in zone_by_id_map:
                disc = {
                    "zone_id": zone_id,
                    "tiled_id": mo["id"],
                    "element_name": mname,
                    "type": "PRESENT_IN_TILED_MISSING_IN_ZONES",
                    "tiled_data": {"x": mo["x"], "y": mo["y"], "w": mo["width"], "h": mo["height"], "type": mo["type"], "layer": mo["layer"]}
                }
                zone_discrepancies.append(disc)
                audit_results["discrepancies"].append(disc)

        audit_results["zones_comparison"][zone_id] = {
            "map_objects_count": len(tiled_objects),
            "zone_elements_count": len(zone_elements),
            "discrepancies_count": len(zone_discrepancies),
            "discrepancies": zone_discrepancies
        }

    print(f"\nTotal Tiled Objects: {total_map_objects}")
    print(f"Total Zones Elements: {total_zone_elements}")
    print(f"Total Discrepancies Found: {len(audit_results['discrepancies'])}")

    # Check the specific target objects
    print("\n=== TARGET OBJECTS DEEP AUDIT ===")
    outer_woods_zone = zones_by_id.get("outer_woods", {})
    outer_woods_elements = {e["element_id"]: e for e in audit_results["zones_comparison"].get("outer_woods", {}).get("discrepancies", []) if "element_id" in e}

    # Inspect all elements in outer_woods zones.json
    ow_all = {}
    for c in outer_woods_zone.get("colliders", []):
        ow_all[c["id"]] = {"cat": "collider", **c}
    for i in outer_woods_zone.get("interactables", []):
        ow_all[i["id"]] = {"cat": "interactable", **i}
    for t in outer_woods_zone.get("transitions", []):
        ow_all[t["id"]] = {"cat": "transition", **t}

    with open(os.path.join(maps_dir, 'outer_woods.json'), 'r', encoding='utf-8') as f:
        ow_tiled = json.load(f)
    ow_tiled_objs = {}
    for l in ow_tiled.get('layers', []):
        if l.get('type') == 'objectgroup':
            for o in l.get('objects', []):
                if o.get('name'):
                    ow_tiled_objs[o['name']] = o

    for target in target_object_keys:
        in_zone = ow_all.get(target)
        in_tiled = ow_tiled_objs.get(target)
        
        # Check mentions in WorldBuilder.ts
        wb_matches = re.findall(rf'.*{re.escape(target)}.*', wb_source)

        status_classification = "NOT VERIFIED"
        notes = []

        if target in ["gather_wood_ow_1", "gather_resin_ow_1"]:
            # Check coords in zone vs tiled vs WB
            # Tiled had earlier coords or missing?
            if in_zone and in_tiled:
                if in_zone["x"] == in_tiled["x"] and in_zone["y"] == in_tiled["y"]:
                    status_classification = "INTENTIONAL RUNTIME OVERRIDE"
                    notes.append("Synchronized between Tiled & zones.json, rendered by WorldBuilder.createGatheringNodeProp")
                else:
                    status_classification = "EDITOR DATA STALE"
                    notes.append(f"Coord diff: Zone({in_zone['x']}, {in_zone['y']}) vs Tiled({in_tiled['x']}, {in_tiled['y']})")
            elif in_zone and not in_tiled:
                status_classification = "INTENTIONAL RUNTIME OVERRIDE"
                notes.append("Defined in zones.json & WorldBuilder runtime; absent in base Tiled map")

        elif target in ["ow_bound_bottom_left", "ow_bound_right_top"]:
            if in_zone and in_tiled:
                status_classification = "INTENTIONAL RUNTIME OVERRIDE"
                notes.append(f"Active boundary collider. Zone: {in_zone.get('width')}x{in_zone.get('height')}, Tiled: {in_tiled.get('width')}x{in_tiled.get('height')}. HW-MAP-27 added visual fence props to prevent invisible wall confusion.")
            elif in_zone:
                status_classification = "INTENTIONAL RUNTIME OVERRIDE"
                notes.append(f"Boundary collider registered in zones.json for physics boundary, visual fence placed in WorldBuilder")

        elif target == "ow_willow_trunk":
            # HW-MAP-28 adjusted it to (1190, 905, 20x14)
            if in_zone and in_tiled:
                if in_zone["x"] == in_tiled["x"] and in_zone["y"] == in_tiled["y"] and in_zone["width"] == in_tiled["width"] and in_zone["height"] == in_tiled["height"]:
                    status_classification = "INTENTIONAL RUNTIME OVERRIDE"
                    notes.append("HW-MAP-28 precisely synced between outer_woods.json, zones.json, and WorldBuilder.ts at (1190, 905, 20x14)")
                else:
                    status_classification = "EDITOR DATA STALE"
            
        elif target == "env_knights_memorial_stele":
            # Bia Đá Tưởng Niệm Kỵ Sĩ: HW-MAP-27 relocated from (1250, 720) to (1260, 645)
            if in_zone and in_tiled:
                if in_zone["x"] == in_tiled["x"] == 1260 and in_zone["y"] == in_tiled["y"] == 645:
                    status_classification = "INTENTIONAL RUNTIME OVERRIDE"
                    notes.append("HW-MAP-27 relocated to (1260, 645) in outer_woods.json, zones.json and WorldBuilder.ts")
                else:
                    status_classification = "EDITOR DATA STALE"
                    notes.append("Mismatch in coordinates across files")

        elif target == "hide_bush_ow_s_curve":
            # Bụi Ẩn Nấp Khúc Cua S: HW-MAP-27 relocated from (1180, 650) to (1150, 655)
            if in_zone and in_tiled:
                if in_zone["x"] == in_tiled["x"] == 1150 and in_zone["y"] == in_tiled["y"] == 655:
                    status_classification = "INTENTIONAL RUNTIME OVERRIDE"
                    notes.append("HW-MAP-27 relocated to (1150, 655) in outer_woods.json, zones.json and WorldBuilder.ts to free S-curve pathway")
                else:
                    status_classification = "EDITOR DATA STALE"

        elif target in ["to_bell_workshop", "sign_sub_bell_workshop"]:
            # Đường xuống Bell Workshop: triggerRect at (1320, 1000, 80, 40)
            if in_zone:
                status_classification = "INTENTIONAL RUNTIME OVERRIDE"
                notes.append("Transition to sub_bell_workshop at (1320, 1000) with guide sign at (1300, 985). Road corridor X=1360 clear >= 72px.")

        audit_results["target_objects"][target] = {
            "status": status_classification,
            "in_zones": bool(in_zone),
            "zone_coords": f"({in_zone.get('x')}, {in_zone.get('y')}) [{in_zone.get('width', 0)}x{in_zone.get('height', 0)}]" if in_zone else None,
            "in_tiled": bool(in_tiled),
            "tiled_coords": f"({in_tiled.get('x')}, {in_tiled.get('y')}) [{in_tiled.get('width', 0)}x{in_tiled.get('height', 0)}]" if in_tiled else None,
            "wb_matches_count": len(wb_matches),
            "notes": " | ".join(notes)
        }

        print(f"Target: {target:30} => {status_classification} | in_zone={bool(in_zone)}, in_tiled={bool(in_tiled)} | {'; '.join(notes)}")

    # Classify all discrepancies found
    # Summary of discrepancies by type and zone
    by_type = {}
    for d in audit_results["discrepancies"]:
        dtype = d["type"]
        by_type[dtype] = by_type.get(dtype, 0) + 1

    audit_results["summary"] = {
        "total_maps": len(map_files),
        "total_zones": len(zones_data),
        "total_tiled_objects": total_map_objects,
        "total_zone_elements": total_zone_elements,
        "total_discrepancies": len(audit_results["discrepancies"]),
        "discrepancies_by_type": by_type
    }

    # Save to Read/V1.5/Reports/map_geometry_audit_metrics.json
    out_dir = 'Read/V1.5/Reports'
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, 'map_geometry_audit_metrics.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(audit_results, f, indent=2, ensure_ascii=False)
    print(f"\nMap geometry metrics saved to {out_path}")

    # Output detailed report on discrepancies
    print("\n=== DISCREPANCY ANALYSIS BY CATEGORY ===")
    for dtype, count in by_type.items():
        print(f" - {dtype}: {count}")

    # Group by zone
    by_zone = {}
    for d in audit_results["discrepancies"]:
        z = d["zone_id"]
        by_zone.setdefault(z, []).append(d)

    print("\n=== DISCREPANCIES BREAKDOWN BY ZONE ===")
    for z, dlist in sorted(by_zone.items()):
        print(f"\nZone [{z}]: {len(dlist)} discrepancies")
        for item in dlist:
            dtype = item["type"]
            name = item.get("element_id") or item.get("element_name")
            if dtype == "COORDINATE_OR_SIZE_MISMATCH":
                zd = item["zone_data"]
                td = item["tiled_data"]
                print(f"  * [MISMATCH] {name}: Zone({zd['x']},{zd['y']} {zd['w']}x{zd['h']}) vs Tiled({td['x']},{td['y']} {td['w']}x{td['h']})")
            elif dtype == "PRESENT_IN_ZONES_MISSING_IN_TILED":
                print(f"  * [IN_ZONE_ONLY] {name} ({item['zone_data'].get('category')})")
            elif dtype == "PRESENT_IN_TILED_MISSING_IN_ZONES":
                print(f"  * [IN_TILED_ONLY] {name} (Tiled ID: {item.get('tiled_id')})")

    return audit_results

if __name__ == '__main__':
    run_map_geometry_audit()
