import json

with open('src/data/zones.json', 'r', encoding='utf-8') as f:
    zdata = json.load(f)

# 1. Update bellhollow
for z in zdata['zones']:
    if z['id'] == 'bellhollow':
        existing_ids = [i['id'] for i in z.get('interactables', [])]
        if 'bellhollow_notice_board' not in existing_ids:
            z['interactables'].append({
                'id': 'bellhollow_notice_board',
                'name': 'Bảng Tin Dị Thường (Manh Mối Sinh Tồn)',
                'type': 'clue',
                'x': 750,
                'y': 270,
                'width': 28,
                'height': 26,
                'promptText': '[E] Đọc Bảng Tin Dị Thường',
                'actionId': 'read_bellhollow_notice_board'
            })
            print('Added bellhollow_notice_board')

    # 2. Update outer_woods
    if z['id'] == 'outer_woods':
        existing_ids = [i['id'] for i in z.get('interactables', [])]
        new_items = [
            {
                'id': 'abandoned_ranger_outpost',
                'name': 'Nhà Trạm Kiểm Lâm Bỏ Hoang',
                'type': 'clue',
                'x': 1420,
                'y': 620,
                'width': 56,
                'height': 42,
                'promptText': '[E] Khảo sát Trạm Kiểm Lâm Bỏ Hoang',
                'actionId': 'inspect_ranger_outpost'
            },
            {
                'id': 'ranger_outpost_chest',
                'name': 'Rương Tiếp Tế Kiểm Lâm',
                'type': 'storage',
                'x': 1445,
                'y': 645,
                'width': 28,
                'height': 18,
                'promptText': '[E] Mở Rương Tiếp Tế Kiểm Lâm',
                'actionId': 'open_ranger_outpost_chest'
            },
            {
                'id': 'ow_lantern_checkpoint_1',
                'name': 'Trụ Đèn Bão Bìa Rừng',
                'type': 'clue',
                'x': 1220,
                'y': 600,
                'width': 18,
                'height': 28,
                'promptText': '[E] Thắp Sáng Trụ Đèn Bão',
                'actionId': 'ignite_lantern_checkpoint'
            },
            {
                'id': 'shortcut_titan_trunk_outer',
                'name': 'Cầu Thân Cây Đổ (Lối tắt Đầm Lầy)',
                'type': 'clue',
                'x': 1540,
                'y': 680,
                'width': 32,
                'height': 24,
                'promptText': '[E] Cầu Thân Cây Đổ (Đường tắt Đầm Lầy)',
                'actionId': 'inspect_titan_trunk_shortcut_outer'
            }
        ]
        for it in new_items:
            if it['id'] not in existing_ids:
                z['interactables'].append(it)
                print(f"Added {it['id']} to outer_woods")

        trans_ids = [t['id'] for t in z.get('transitions', [])]
        if 'to_silent_mire_via_shortcut' not in trans_ids:
            z['transitions'].append({
                'id': 'to_silent_mire_via_shortcut',
                'fromZone': 'outer_woods',
                'toZone': 'silent_mire',
                'status': 'active',
                'barrierType': 'shortcut',
                'triggerRect': {
                    'x': 1560,
                    'y': 670,
                    'width': 36,
                    'height': 40
                },
                'targetSpawn': {
                    'x': 2920,
                    'y': 420
                },
                'returnPoint': {
                    'x': 1530,
                    'y': 680
                },
                'displayLabel': 'Qua Cầu Cây Đổ sang Đầm Lầy',
                'description': 'Lối đi tắt thân cây đại thụ vắt ngang qua khe vực'
            })
            print('Added to_silent_mire_via_shortcut to outer_woods')

    # 3. Update silent_mire
    if z['id'] == 'silent_mire':
        existing_ids = [i['id'] for i in z.get('interactables', [])]
        new_items = [
            {
                'id': 'sunken_mire_shrine',
                'name': 'Miếu Thờ Chìm',
                'type': 'clue',
                'x': 3520,
                'y': 280,
                'width': 64,
                'height': 48,
                'promptText': '[E] Khảo sát Miếu Thờ Chìm',
                'actionId': 'inspect_sunken_mire_shrine'
            },
            {
                'id': 'sunken_bronze_talisman',
                'name': 'Cổ Vật: Chuông Đồng Chìm',
                'type': 'clue',
                'x': 3540,
                'y': 295,
                'width': 24,
                'height': 24,
                'promptText': '[E] Tiếp nhận Cổ Vật: CHUÔNG ĐỒNG CHÌM',
                'actionId': 'collect_sunken_talisman'
            },
            {
                'id': 'shortcut_titan_trunk_marsh',
                'name': 'Cơ Quan Hạ Thân Cây Cổ Thụ (Đường tắt Rừng Ngoài)',
                'type': 'clue',
                'x': 2890,
                'y': 420,
                'width': 32,
                'height': 24,
                'promptText': '[E] Đẩy Đổ Thân Cây Cổ Thụ Làm Cầu Vượt Vực',
                'actionId': 'activate_titan_trunk_shortcut'
            }
        ]
        for it in new_items:
            if it['id'] not in existing_ids:
                z['interactables'].append(it)
                print(f"Added {it['id']} to silent_mire")

        trans_ids = [t['id'] for t in z.get('transitions', [])]
        if 'to_outer_woods_via_shortcut' not in trans_ids:
            z['transitions'].append({
                'id': 'to_outer_woods_via_shortcut',
                'fromZone': 'silent_mire',
                'toZone': 'outer_woods',
                'status': 'active',
                'barrierType': 'shortcut',
                'triggerRect': {
                    'x': 2880,
                    'y': 410,
                    'width': 36,
                    'height': 40
                },
                'targetSpawn': {
                    'x': 1540,
                    'y': 700
                },
                'returnPoint': {
                    'x': 2920,
                    'y': 420
                },
                'displayLabel': 'Qua Cầu Cây Đổ về Rìa Rừng Ngoài',
                'description': 'Lối đi tắt thân cây đại thụ thông suốt về Rừng Ngoài'
            })
            print('Added to_outer_woods_via_shortcut to silent_mire')

    # 4. Update deep_forest
    if z['id'] == 'deep_forest':
        existing_ids = [i['id'] for i in z.get('interactables', [])]
        new_items = [
            {
                'id': 'whispering_totem_pillar',
                'name': 'Cột Vật Tổ Thì Thầm (Cảnh Báo Sớm)',
                'type': 'clue',
                'x': 2100,
                'y': -320,
                'width': 28,
                'height': 56,
                'promptText': '[E] Lắng nghe Cột Vật Tổ Thì Thầm',
                'actionId': 'listen_whispering_totem'
            },
            {
                'id': 'ambush_goblin_scout_zone',
                'name': 'Khu Vực Phục Kích: Goblin Scout',
                'type': 'clue',
                'x': 1950,
                'y': -250,
                'width': 48,
                'height': 48,
                'promptText': 'Nhấn [E] Thám thính tiếng động lạ',
                'actionId': 'inspect_ambush_sound_df'
            }
        ]
        for it in new_items:
            if it['id'] not in existing_ids:
                z['interactables'].append(it)
                print(f"Added {it['id']} to deep_forest")

with open('src/data/zones.json', 'w', encoding='utf-8') as f:
    json.dump(zdata, f, ensure_ascii=False, indent=2)

print('Updated zones.json successfully')
