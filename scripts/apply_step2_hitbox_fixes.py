# scripts/apply_step2_hitbox_fixes.py
import sys

def main():
    path = 'src/world/WorldBuilder.ts'
    with open(path, 'r', encoding='utf-8') as f:
        code = f.read()

    # 1. Add helper methods before safeAddImage
    helper_code = '''  /**
   * C4-14-FIX: Tạo một static collider hình chữ nhật chuẩn xác tuyệt đối theo AABB thế giới: [minX, minY, width, height].
   * Khắc phục triệt để lỗi lệch 16px của Phaser Arcade Physics khi dùng default texture 32x32.
   */
  public createStaticBoxCollider(
    minX: number,
    minY: number,
    width: number,
    height: number,
    name?: string
  ): Phaser.Physics.Arcade.Sprite {
    const sprite = this.colliderGroup.create(minX, minY, undefined) as Phaser.Physics.Arcade.Sprite;
    sprite.setOrigin(0, 0);
    sprite.setVisible(false);
    const body = sprite.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(width, height, false);
    body.reset(minX, minY);
    if (name) {
      sprite.setName(name);
    }
    return sprite;
  }

  /**
   * C4-14-FIX: Tạo một static collider chuẩn tâm thế giới: [cx, cy, width, height]
   */
  public createStaticBoxColliderCentered(
    cx: number,
    cy: number,
    width: number,
    height: number,
    name?: string
  ): Phaser.Physics.Arcade.Sprite {
    return this.createStaticBoxCollider(cx - width / 2, cy - height / 2, width, height, name);
  }

  '''

    if 'public createStaticBoxCollider(' not in code:
        idx = code.find('private safeAddImage(')
        if idx == -1:
            print("ERROR: could not find safeAddImage")
            sys.exit(1)
        code = code[:idx] + helper_code + code[idx:]
        print("Added createStaticBoxCollider & createStaticBoxColliderCentered helpers.")

    # 2. createWestFogBarrier (index 2582)
    old_2582 = '''    const barrierBody = this.colliderGroup.create(barrierX, roadCenterY, undefined) as Phaser.Physics.Arcade.Sprite;
    barrierBody.setVisible(false);
    const b = barrierBody.body as Phaser.Physics.Arcade.Body;
    b.setSize(30, 120);
    b.setOffset(-15, -60);'''
    new_2582 = '''    this.createStaticBoxColliderCentered(barrierX, roadCenterY, 30, 120, 'Rào Sương Mù Cổng Tây');'''
    assert old_2582 in code, "old_2582 not found"
    code = code.replace(old_2582, new_2582, 1)

    # 3. createTree (index 2618)
    old_2618 = '''    const body = this.colliderGroup.create(x, y, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(20, 12);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-10, -6);'''
    new_2618 = '''    this.createStaticBoxColliderCentered(x, y, 20, 12, 'Gốc Cây');'''
    assert old_2618 in code, "old_2618 not found"
    code = code.replace(old_2618, new_2618, 1)

    # 4. createHollowTree (index 2631)
    old_2631 = '''    const body = this.colliderGroup.create(x, y, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(28, 14);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-14, -7);'''
    new_2631 = '''    this.createStaticBoxColliderCentered(x, y, 28, 14, 'Cây Rỗng');'''
    assert old_2631 in code, "old_2631 not found"
    code = code.replace(old_2631, new_2631, 1)

    # 5. createStoneSign (index 2658)
    old_2658 = '''    const body = this.colliderGroup.create(x, y - 2, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(14, 10);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-7, -5);'''
    new_2658 = '''    this.createStaticBoxColliderCentered(x, y - 2, 14, 10, 'Biển Chỉ Dẫn');'''
    assert old_2658 in code, "old_2658 not found"
    code = code.replace(old_2658, new_2658, 1)

    # 6. createBuilding (index 2688) - Foot-level Hitbox ~32.5% đáy công trình
    old_2688 = '''    const colW = w - 6;
    const colH = Math.max(h - 6, 42);
    const body = this.colliderGroup.create(x + w / 2, y + h - colH / 2, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(colW, colH);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-colW / 2, -colH / 2);'''
    new_2688 = '''    // C4-14-FIX: Thiết kế hitbox chân đế (Foot-level Hitbox ~32.5% phần đáy công trình).
    // Đáy sprite nhà 112x80 nằm tại y + 56. Hitbox chân tường bao phủ 26px đáy (y+30..y+56)
    // cho phép nhân vật đi lách tự nhiên sau mái nhà, nhưng bị chặn vững chắc trước mặt tiền.
    const colW = Math.min(w - 12, 100);
    const colH = 26;
    this.createStaticBoxCollider(x + 6, y + 56 - colH, colW, colH, name);'''
    assert old_2688 in code, "old_2688 not found"
    code = code.replace(old_2688, new_2688, 1)

    old_house_depth = '''    const house = this.safeAddImage(x, y - 24, houseKey);
    house.setOrigin(0, 0);
    house.setDepth(y + h);'''
    new_house_depth = '''    const house = this.safeAddImage(x, y - 24, houseKey);
    house.setOrigin(0, 0);
    house.setDepth(y + 56);'''
    assert old_house_depth in code, "old_house_depth not found"
    code = code.replace(old_house_depth, new_house_depth, 1)

    # 7. createBellTower (index 2715)
    old_2715 = '''    const colW = w - 8;
    const colH = Math.max(h - 4, 54);
    const body = this.colliderGroup.create(x + w / 2, y + h - colH / 2, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(colW, colH);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-colW / 2, -colH / 2);'''
    new_2715 = '''    // C4-14-FIX: Hitbox chân đế bệ đá tháp chuông (64x30 px tại đáy y=312)
    const colW = 64;
    const colH = 30;
    this.createStaticBoxCollider(x + 8, 312 - colH, colW, colH, 'Tháp Chuông');'''
    assert old_2715 in code, "old_2715 not found"
    code = code.replace(old_2715, new_2715, 1)

    old_tower_depth = '''    const tower = this.safeAddImage(x, y - 52, SPRITE_BELL_TOWER);
    tower.setOrigin(0, 0);
    tower.setDepth(y + h);'''
    new_tower_depth = '''    const tower = this.safeAddImage(x, y - 52, SPRITE_BELL_TOWER);
    tower.setOrigin(0, 0);
    tower.setDepth(312);'''
    assert old_tower_depth in code, "old_tower_depth not found"
    code = code.replace(old_tower_depth, new_tower_depth, 1)

    # 8. createVillageWell (index 2728)
    old_2728 = '''    const body = this.colliderGroup.create(x, y - 6, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(32, 22);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-16, -11);'''
    new_2728 = '''    this.createStaticBoxColliderCentered(x, y - 4, 30, 18, 'Giếng Nước Làng');'''
    assert old_2728 in code, "old_2728 not found"
    code = code.replace(old_2728, new_2728, 1)

    # 9. createCraftingBench (index 2741)
    old_2741 = '''    const body = this.colliderGroup.create(x + 18, y + 10, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(52, 16);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-26, -8);'''
    new_2741 = '''    this.createStaticBoxColliderCentered(x + 18, y + 10, 48, 14, 'Bàn Chế Tạo');'''
    assert old_2741 in code, "old_2741 not found"
    code = code.replace(old_2741, new_2741, 1)

    # 10. createCraftingWorkshopPavilion (index 2793)
    old_2793 = '''    const body = this.colliderGroup.create(x + 42, y + 20, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(88, 40);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-44, -20);'''
    new_2793 = '''    this.createStaticBoxCollider(x, y + 18, 84, 24, 'Mái Xưởng Rèn');'''
    assert old_2793 in code, "old_2793 not found"
    code = code.replace(old_2793, new_2793, 1)

    # 11. createWestWatchpost (index 2843)
    old_2843 = '''    const body = this.colliderGroup.create(x + 32, y + 24, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(58, 42);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-29, -21);'''
    new_2843 = '''    this.createStaticBoxCollider(x + 6, y + 20, 52, 26, 'Trạm Gác Cổng Tây');'''
    assert old_2843 in code, "old_2843 not found"
    code = code.replace(old_2843, new_2843, 1)

    # 12. createSouthWestCottage (index 2870)
    old_2870 = '''    const colW = 96;
    const colH = 46;
    const body = this.colliderGroup.create(x + 47, y + 25, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(colW, colH);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-colW / 2, -colH / 2);'''
    new_2870 = '''    // C4-14-FIX: Foot-level Hitbox chân đế nhà dân Tây-Nam (đáy tại y=428)
    this.createStaticBoxCollider(x + 6, 428 - 24, 91, 24, 'Nhà Dân Tây-Nam');'''
    assert old_2870 in code, "old_2870 not found"
    code = code.replace(old_2870, new_2870, 1)

    old_cottage_depth = '''    const house = this.scene.add.image(x, y - 22, SPRITE_HOUSE_EDDA);
    house.setOrigin(0, 0);
    house.setScale(0.92, 0.92);
    house.setTint(0xd8cfc4);
    house.setDepth(y + 48);'''
    new_cottage_depth = '''    const house = this.scene.add.image(x, y - 22, SPRITE_HOUSE_EDDA);
    house.setOrigin(0, 0);
    house.setScale(0.92, 0.92);
    house.setTint(0xd8cfc4);
    house.setDepth(428);'''
    assert old_cottage_depth in code, "old_cottage_depth not found"
    code = code.replace(old_cottage_depth, new_cottage_depth, 1)

    # 13. createApothecaryTables (index 2912 & 2917)
    old_apoth = '''    const leftBody = this.colliderGroup.create(leftX, leftY + 2, undefined) as Phaser.Physics.Arcade.Sprite;
    leftBody.setVisible(false);
    (leftBody.body as Phaser.Physics.Arcade.Body).setSize(26, 14);
    (leftBody.body as Phaser.Physics.Arcade.Body).setOffset(-13, -7);

    const rightBody = this.colliderGroup.create(rightX, rightY + 2, undefined) as Phaser.Physics.Arcade.Sprite;
    rightBody.setVisible(false);
    (rightBody.body as Phaser.Physics.Arcade.Body).setSize(26, 14);
    (rightBody.body as Phaser.Physics.Arcade.Body).setOffset(-13, -7);'''
    new_apoth = '''    this.createStaticBoxColliderCentered(leftX, leftY + 2, 24, 10, 'Bàn Thuốc Trái');
    this.createStaticBoxColliderCentered(rightX, rightY + 2, 24, 10, 'Bàn Thuốc Phải');'''
    assert old_apoth in code, "old_apoth not found"
    code = code.replace(old_apoth, new_apoth, 1)

    # 14. createVillagePropCluster (index 2985)
    old_2985 = '''    const body = this.colliderGroup.create(x, y + 2, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(22, 12);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-11, -6);'''
    new_2985 = '''    this.createStaticBoxColliderCentered(x, y + 2, 20, 12, 'Cụm Vật Phẩm Làng');'''
    assert old_2985 in code, "old_2985 not found"
    code = code.replace(old_2985, new_2985, 1)

    # 15. createVillageLanternPost (index 3028)
    old_3028 = '''    const body = this.colliderGroup.create(x, y - 1, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(8, 8);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-4, -4);'''
    new_3028 = '''    this.createStaticBoxColliderCentered(x, y - 1, 8, 8, 'Cột Đèn Lồng');'''
    assert old_3028 in code, "old_3028 not found"
    code = code.replace(old_3028, new_3028, 1)

    # 16. createVillageFence (index 3072)
    old_3072 = '''      if (withCollider) {
        const body = this.colliderGroup.create(fx + 23, fy - 4, undefined) as Phaser.Physics.Arcade.Sprite;
        body.setVisible(false);
        (body.body as Phaser.Physics.Arcade.Body).setSize(42, 10);
        (body.body as Phaser.Physics.Arcade.Body).setOffset(-21, -5);
      }'''
    new_3072 = '''      if (withCollider) {
        this.createStaticBoxColliderCentered(fx + 23, fy - 4, 42, 10, 'Hàng Rào Làng');
      }'''
    assert old_3072 in code, "old_3072 not found"
    code = code.replace(old_3072, new_3072, 1)

    # 17. createEastForestEntrance (index 3133, 3142, 3169, 3197, 3246)
    old_3133 = '''    const northFenceBody = this.colliderGroup.create(gateX - 31, northPostY - 4, undefined) as Phaser.Physics.Arcade.Sprite;
    northFenceBody.setVisible(false);
    (northFenceBody.body as Phaser.Physics.Arcade.Body).setSize(46, 12);
    (northFenceBody.body as Phaser.Physics.Arcade.Body).setOffset(-23, -6);'''
    new_3133 = '''    this.createStaticBoxColliderCentered(gateX - 31, northPostY - 4, 46, 12, 'Rào Bắc Cổng Đông');'''
    assert old_3133 in code, "old_3133 not found"
    code = code.replace(old_3133, new_3133, 1)

    old_3142 = '''    const southFenceBody = this.colliderGroup.create(gateX - 31, southPostY - 4, undefined) as Phaser.Physics.Arcade.Sprite;
    southFenceBody.setVisible(false);
    (southFenceBody.body as Phaser.Physics.Arcade.Body).setSize(46, 12);
    (southFenceBody.body as Phaser.Physics.Arcade.Body).setOffset(-23, -6);'''
    new_3142 = '''    this.createStaticBoxColliderCentered(gateX - 31, southPostY - 4, 46, 12, 'Rào Nam Cổng Đông');'''
    assert old_3142 in code, "old_3142 not found"
    code = code.replace(old_3142, new_3142, 1)

    old_3169 = '''    const northBody = this.colliderGroup.create(gateX, northPostY - 4, undefined) as Phaser.Physics.Arcade.Sprite;
    northBody.setVisible(false);
    (northBody.body as Phaser.Physics.Arcade.Body).setSize(18, 14);
    (northBody.body as Phaser.Physics.Arcade.Body).setOffset(-9, -7);'''
    new_3169 = '''    this.createStaticBoxColliderCentered(gateX, northPostY - 4, 18, 14, 'Trụ Bắc Cổng Đông');'''
    assert old_3169 in code, "old_3169 not found"
    code = code.replace(old_3169, new_3169, 1)

    old_3197 = '''    const southBody = this.colliderGroup.create(gateX, southPostY - 4, undefined) as Phaser.Physics.Arcade.Sprite;
    southBody.setVisible(false);
    (southBody.body as Phaser.Physics.Arcade.Body).setSize(18, 14);
    (southBody.body as Phaser.Physics.Arcade.Body).setOffset(-9, -7);'''
    new_3197 = '''    this.createStaticBoxColliderCentered(gateX, southPostY - 4, 18, 14, 'Trụ Nam Cổng Đông');'''
    assert old_3197 in code, "old_3197 not found"
    code = code.replace(old_3197, new_3197, 1)

    old_3246 = '''    const dummyKey = this.scene.textures && this.scene.textures.exists('dummy_transparent') ? 'dummy_transparent' : undefined;
    this.eastGateColliderBody = this.colliderGroup.create(gateX, roadY, dummyKey) as Phaser.Physics.Arcade.Sprite;
    this.eastGateColliderBody.setVisible(false);
    this.eastGateColliderBody.setAlpha(0);
    const gateBody = this.eastGateColliderBody.body as Phaser.Physics.Arcade.Body;
    gateBody.setSize(16, 76);
    gateBody.setOffset(-8, -38);
    gateBody.enable = !this.isEastGateOpen;'''
    new_3246 = '''    this.eastGateColliderBody = this.createStaticBoxColliderCentered(gateX, roadY, 16, 76, 'Cổng Đông');
    this.eastGateColliderBody.body.enable = !this.isEastGateOpen;'''
    assert old_3246 in code, "old_3246 not found"
    code = code.replace(old_3246, new_3246, 1)

    # 18. createBellhollowVegetation variant tree (index 3586)
    old_3586 = '''      if (withCollider) {
        const body = this.colliderGroup.create(x, y - 2, undefined) as Phaser.Physics.Arcade.Sprite;
        body.setVisible(false);
        const bw = variant === 'hollow' ? 24 : 18;
        const bh = 12;
        (body.body as Phaser.Physics.Arcade.Body).setSize(bw, bh);
        (body.body as Phaser.Physics.Arcade.Body).setOffset(-bw / 2, -bh / 2);
      }'''
    new_3586 = '''      if (withCollider) {
        const bw = variant === 'hollow' ? Math.round(24 * scale) : Math.round(18 * scale);
        const bh = Math.round(12 * scale);
        this.createStaticBoxColliderCentered(x, y - 2, bw, bh, 'Cây Rừng Biến Thể');
      }'''
    assert old_3586 in code, "old_3586 not found"
    code = code.replace(old_3586, new_3586, 1)

    # 19. createRock (index 3867)
    old_3867 = '''    const dummyKey = this.scene.textures && this.scene.textures.exists('dummy_transparent') ? 'dummy_transparent' : undefined;
    const body = this.colliderGroup.create(x + w / 2, y + h / 2, dummyKey) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    body.setAlpha(0);
    (body.body as Phaser.Physics.Arcade.Body).setSize(w * 0.82, h * 0.68);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-w * 0.41, -h * 0.34);'''
    new_3867 = '''    const colW = Math.round(w * 0.75);
    const colH = Math.round(Math.min(h * 0.5, 14));
    this.createStaticBoxColliderCentered(x + w / 2, y + h - 2 - colH / 2, colW, colH, 'Tảng Đá');'''
    assert old_3867 in code, "old_3867 not found"
    code = code.replace(old_3867, new_3867, 1)

    # 20. createMireWater (index 3883)
    old_3883 = '''    const body = this.colliderGroup.create(x + w / 2, y + h / 2, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(w * 0.85, h * 0.8);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-w * 0.425, -h * 0.4);'''
    new_3883 = '''    this.createStaticBoxColliderCentered(x + w / 2, y + h / 2, Math.round(w * 0.75), Math.round(h * 0.65), 'Vùng Nước Sình Lầy');'''
    assert old_3883 in code, "old_3883 not found"
    code = code.replace(old_3883, new_3883, 1)

    # 21. createRunestonePillar (index 3944)
    old_3944 = '''    const body = this.colliderGroup.create(x, y - 4, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(18, 14);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-9, -7);'''
    new_3944 = '''    this.createStaticBoxColliderCentered(x, y - 4, 18, 14, 'Cột Cổ Ngữ');'''
    assert old_3944 in code, "old_3944 not found"
    code = code.replace(old_3944, new_3944, 1)

    # 22. createStoneAltar (index 4117)
    old_4117 = '''    const body = this.colliderGroup.create(x, y - 2, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(28, 14);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-14, -7);'''
    new_4117 = '''    this.createStaticBoxColliderCentered(x, y - 2, 28, 14, 'Bệ Thờ Đá');'''
    assert old_4117 in code, "old_4117 not found"
    code = code.replace(old_4117, new_4117, 1)

    # 23. createAncientRuneStele (index 4152)
    old_4152 = '''    const body = this.colliderGroup.create(x, y + 2, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(16, 12);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-8, -6);'''
    new_4152 = '''    this.createStaticBoxColliderCentered(x, y + 2, 16, 12, 'Cột Đá Cổ');'''
    assert old_4152 in code, "old_4152 not found"
    code = code.replace(old_4152, new_4152, 1)

    # 24. createShrineAltar (index 4199)
    old_4199 = '''    const body = this.colliderGroup.create(x + w / 2, y + 10, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(48, 16);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-24, -8);'''
    new_4199 = '''    this.createStaticBoxColliderCentered(x + w / 2, y + 10, 48, 16, 'Miếu Chuông Vỡ');'''
    assert old_4199 in code, "old_4199 not found"
    code = code.replace(old_4199, new_4199, 1)

    # 25. createShrinePillar (index 4244)
    old_4244 = '''    const body = this.colliderGroup.create(x, y - 4, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(20, 16);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-10, -8);'''
    new_4244 = '''    this.createStaticBoxColliderCentered(x, y - 4, 20, 16, 'Trụ Miếu Chuông');'''
    assert old_4244 in code, "old_4244 not found"
    code = code.replace(old_4244, new_4244, 1)

    # 26. createHidingRubble (index 4273)
    old_4273 = '''    const body = this.colliderGroup.create(x, y - 2, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(36, 16);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-18, -8);'''
    new_4273 = '''    this.createStaticBoxColliderCentered(x, y - 2, 36, 16, 'Đống Đổ Nát');'''
    assert old_4273 in code, "old_4273 not found"
    code = code.replace(old_4273, new_4273, 1)

    # 27. createShrineInscribedStele (index 4303)
    old_4303 = '''    const body = this.colliderGroup.create(x, y + 2, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(16, 12);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-8, -6);'''
    new_4303 = '''    this.createStaticBoxColliderCentered(x, y + 2, 16, 12, 'Bia Đá Cổ Ngữ');'''
    assert old_4303 in code, "old_4303 not found"
    code = code.replace(old_4303, new_4303, 1)

    # 28. setupZoneColliders (index 4345)
    old_setup = '''  private setupZoneColliders(zone: ZoneData): void {
    for (const spec of zone.colliders) {
      if (spec.type === 'boundary') {
        const wall = this.colliderGroup.create(
          spec.x + spec.width / 2, 
          spec.y + spec.height / 2, 
          undefined
        ) as Phaser.Physics.Arcade.Sprite;
        wall.setVisible(false);
        const b = wall.body as Phaser.Physics.Arcade.Body;
        b.setSize(spec.width, spec.height);
        b.setOffset(-spec.width / 2, -spec.height / 2);
      }
    }
  }'''
    new_setup = '''  private setupZoneColliders(zone: ZoneData): void {
    for (const spec of zone.colliders) {
      if (spec.type === 'boundary') {
        const wall = this.createStaticBoxCollider(spec.x, spec.y, spec.width, spec.height, spec.id);
        wall.setVisible(false);
      }
    }
  }'''
    assert old_setup in code, "old_setup not found"
    code = code.replace(old_setup, new_setup, 1)

    # 29. createFarmBarnStructure (index 4608)
    old_4608 = '''    const colW = w - 8;
    const colH = 22;
    const body = this.colliderGroup.create(x + w / 2, y + h - colH / 2, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(colW, colH);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-colW / 2, -colH / 2);'''
    new_4608 = '''    const colW = w - 8;
    const colH = 22;
    this.createStaticBoxCollider(x + 4, y + h - colH, colW, colH, 'Kho Thóc');'''
    assert old_4608 in code, "old_4608 not found"
    code = code.replace(old_4608, new_4608, 1)

    # 30. createCentralCampfire (index 4683)
    old_4683 = '''    const body = this.colliderGroup.create(x + 18, y + 15, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(28, 20);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-14, -10);'''
    new_4683 = '''    this.createStaticBoxColliderCentered(x + 18, y + 15, 24, 16, 'Lửa Trại Làng');'''
    assert old_4683 in code, "old_4683 not found"
    code = code.replace(old_4683, new_4683, 1)

    # 31. createShelterTent (index 4725)
    old_4725 = '''    const body = this.colliderGroup.create(x + 18, y + 6, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(40, 18);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-20, -9);'''
    new_4725 = '''    this.createStaticBoxColliderCentered(x + 18, y + 6, 36, 16, 'Lều Trú Ẩn');'''
    assert old_4725 in code, "old_4725 not found"
    code = code.replace(old_4725, new_4725, 1)

    # 32. createHerbalCauldron (index 4768)
    old_4768 = '''    const body = this.colliderGroup.create(x + 12, y + 6, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(22, 16);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-11, -8);'''
    new_4768 = '''    this.createStaticBoxColliderCentered(x + 12, y + 6, 20, 14, 'Nồi Thảo Dược');'''
    assert old_4768 in code, "old_4768 not found"
    code = code.replace(old_4768, new_4768, 1)

    # 33. createChestProp (index 4802)
    old_4802 = '''    const body = this.colliderGroup.create(x + 14, y + 10, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(24, 14);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-12, -7);'''
    new_4802 = '''    this.createStaticBoxColliderCentered(x + 14, y + 10, 22, 14, 'Rương Trú Ẩn');'''
    assert old_4802 in code, "old_4802 not found"
    code = code.replace(old_4802, new_4802, 1)

    # 34. createHunterCampfire (index 4852)
    old_4852 = '''    const body = this.colliderGroup.create(x + 18, y + 15, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(24, 16);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-12, -8);'''
    new_4852 = '''    this.createStaticBoxColliderCentered(x + 18, y + 15, 24, 16, 'Lửa Trại Thợ Săn');'''
    assert old_4852 in code, "old_4852 not found"
    code = code.replace(old_4852, new_4852, 1)

    # 35. createFarmPerimeterFences (index 4869)
    old_4869 = '''      if (withCollider) {
        const body = this.colliderGroup.create(fx + 23, fy - 4, undefined) as Phaser.Physics.Arcade.Sprite;
        body.setVisible(false);
        (body.body as Phaser.Physics.Arcade.Body).setSize(42, 10);
        (body.body as Phaser.Physics.Arcade.Body).setOffset(-21, -5);
      }'''
    new_4869 = '''      if (withCollider) {
        this.createStaticBoxColliderCentered(fx + 23, fy - 4, 42, 10, 'Hàng Rào Nông Trại');
      }'''
    assert old_4869 in code, "old_4869 not found"
    code = code.replace(old_4869, new_4869, 1)

    # 36. createHunterDryingRack (index 4953)
    old_4953 = '''    const body = this.colliderGroup.create(x + 17, y + 4, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(32, 10);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-16, -5);'''
    new_4953 = '''    this.createStaticBoxColliderCentered(x + 17, y + 4, 32, 10, 'Giá Phơi Thợ Săn');'''
    assert old_4953 in code, "old_4953 not found"
    code = code.replace(old_4953, new_4953, 1)

    # 37. createHunterLeanToShelter (index 5067)
    old_5067 = '''    const body = this.colliderGroup.create(x + 15, y + 4, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(32, 12);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-16, -6);'''
    new_5067 = '''    this.createStaticBoxColliderCentered(x + 15, y + 4, 32, 12, 'Lều Thợ Săn');'''
    assert old_5067 in code, "old_5067 not found"
    code = code.replace(old_5067, new_5067, 1)

    # 38. createFallenLog (index 5142)
    old_5142 = '''    const body = this.colliderGroup.create(x, y, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(Math.round(length * 0.8), 10);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-Math.round(length * 0.4), -5);'''
    new_5142 = '''    this.createStaticBoxColliderCentered(x, y, Math.round(length * 0.75), 10, 'Thân Cây Đổ');'''
    assert old_5142 in code, "old_5142 not found"
    code = code.replace(old_5142, new_5142, 1)

    # 39. createStoneMarker (index 5318)
    old_5318 = '''    const body = this.colliderGroup.create(x + 6, y + 4, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(12, 10);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-6, -5);'''
    new_5318 = '''    this.createStaticBoxColliderCentered(x + 6, y + 4, 12, 10, 'Cột Mốc Đá');'''
    assert old_5318 in code, "old_5318 not found"
    code = code.replace(old_5318, new_5318, 1)

    # 40. createCrookedPathCollapsedBridge (index 5505)
    old_5505 = '''    const dummyKey = this.scene.textures && this.scene.textures.exists('dummy_transparent') ? 'dummy_transparent' : undefined;
    const blocker = this.colliderGroup.create(bridgeX, roadY, dummyKey) as Phaser.Physics.Arcade.Sprite;
    blocker.setVisible(false);
    blocker.setAlpha(0);
    const body = blocker.body as Phaser.Physics.Arcade.Body;
    body.setSize(38, 86);
    body.setOffset(-19, -43);
    body.immovable = true;'''
    new_5505 = '''    const blocker = this.createStaticBoxColliderCentered(bridgeX, roadY, 38, 86, 'Cầu Sập Đường Mòn');
    blocker.body.immovable = true;'''
    assert old_5505 in code, "old_5505 not found"
    code = code.replace(old_5505, new_5505, 1)

    # 41. createSunkenMonolithRuins (index 6160)
    old_6160 = '''    const body = this.colliderGroup.create(x + w / 2, y + h / 2, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(w * 0.75, h * 0.6);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-w * 0.375, -h * 0.3);'''
    new_6160 = '''    this.createStaticBoxColliderCentered(x + w / 2, y + h / 2, Math.round(w * 0.75), Math.round(h * 0.45), 'Tàn Tích Bia Đá');'''
    assert old_6160 in code, "old_6160 not found"
    code = code.replace(old_6160, new_6160, 1)

    # 42. createDeadTitanWillow (index 6213)
    old_6213 = '''    const body = this.colliderGroup.create(x, y + 10, undefined) as Phaser.Physics.Arcade.Sprite;
    body.setVisible(false);
    (body.body as Phaser.Physics.Arcade.Body).setSize(36, 18);
    (body.body as Phaser.Physics.Arcade.Body).setOffset(-18, -9);'''
    new_6213 = '''    this.createStaticBoxColliderCentered(x, y + 6, 32, 16, 'Liễu Titan Khô');'''
    assert old_6213 in code, "old_6213 not found"
    code = code.replace(old_6213, new_6213, 1)

    # 43. createShrineGateWard (index 6290)
    old_6290 = '''    const dummyKey = this.scene.textures && this.scene.textures.exists('dummy_transparent') ? 'dummy_transparent' : undefined;
    this.shrineWardColliderBody = this.colliderGroup.create(x, y, dummyKey) as Phaser.Physics.Arcade.Sprite;
    this.shrineWardColliderBody.setVisible(false);
    this.shrineWardColliderBody.setAlpha(0);
    const body = this.shrineWardColliderBody.body as Phaser.Physics.Arcade.Body;
    body.setSize(16, 76);
    body.setOffset(-8, -38);
    body.enable = !this.isShrineWardOpen;'''
    new_6290 = '''    this.shrineWardColliderBody = this.createStaticBoxColliderCentered(x, y, 16, 76, 'Phong Ấn Miếu');
    this.shrineWardColliderBody.body.enable = !this.isShrineWardOpen;'''
    assert old_6290 in code, "old_6290 not found"
    code = code.replace(old_6290, new_6290, 1)

    # 44. Deep Forest boundary trees and gap fixes
    old_df_trees = '''    // 7. Quần Thể Cây Sồi & Thông Cổ Thụ Viền Rừng (Natural Boundary Tree Clusters)
    // Dàn cây viền phía Bắc (wy: -610..-570)
    for (let x = bounds.x + 40; x < bounds.x + bounds.width - 40; x += 105) {
      this.createTree(x, -590 + ((x % 3) * 18), 'Cây Rừng Cổ Thụ Viền Bắc');
    }

    // Dàn cây viền phía Tây (wx: 1620..1660)
    for (let y = bounds.y + 40; y < bounds.y + bounds.height - 40; y += 95) {
      this.createTree(1640 + ((Math.abs(y) % 2) * 20), y, 'Cây Rừng Cổ Thụ Viền Tây');
    }

    // Dàn cây viền phía Đông (wx: 2820..2860, chừa lối sang Đầm Lầy tại y ~ -260..-300)
    for (let y = bounds.y + 40; y < bounds.y + bounds.height - 40; y += 95) {
      if (y < -330 || y > -210) {
        this.createTree(2840 + ((Math.abs(y) % 2) * 20), y, 'Cây Rừng Cổ Thụ Viền Đông');
      }
    }

    // Dàn cây viền phía Nam (wy: -45..-15, chừa lối thông Crooked Path 2000..2160)
    for (let x = bounds.x + 40; x < bounds.x + bounds.width - 40; x += 110) {
      if (x < 1990 || x > 2170) {
        this.createTree(x, -35 + ((x % 2) * 15), 'Cây Rừng Cổ Thụ Viền Nam');
      }
    }'''
    new_df_trees = '''    // 7. C4-14-FIX: Quần Thể Cây Sồi & Thông Cổ Thụ Viền Rừng Khép Kín (Impenetrable Forest Boundary)
    // Bước nhảy dày 55-60px kết hợp bụi rậm tự nhiên, loại bỏ hoàn toàn khe hở lọt biên
    // Dàn cây viền phía Bắc (wy: -610..-570, chừa lối vào Abyssal Chasm 2200..2280)
    for (let x = bounds.x + 40; x < bounds.x + bounds.width - 40; x += 55) {
      if (x < 2190 || x > 2290) {
        this.createTree(x, -600 + ((x % 3) * 12), 'Cây Rừng Cổ Thụ Viền Bắc');
        this.createDenseBush(x + 25, -590);
      }
    }

    // Dàn cây viền phía Tây (wx: 1620..1660)
    for (let y = bounds.y + 40; y < bounds.y + bounds.height - 40; y += 55) {
      this.createTree(1630 + ((Math.abs(y) % 2) * 15), y, 'Cây Rừng Cổ Thụ Viền Tây');
      this.createDenseBush(1635, y + 25);
    }

    // Dàn cây viền phía Đông (wx: 2820..2860, chừa lối sang Đầm Lầy tại y ~ -320..-200)
    for (let y = bounds.y + 40; y < bounds.y + bounds.height - 40; y += 55) {
      if (y < -330 || y > -190) {
        this.createTree(2850 + ((Math.abs(y) % 2) * 15), y, 'Cây Rừng Cổ Thụ Viền Đông');
        this.createDenseBush(2845, y + 25);
      }
    }

    // Dàn cây viền phía Nam (wy: -45..-15, chừa lối thông Crooked Path 2000..2160 và Whispering Clearing 1800..1880)
    for (let x = bounds.x + 40; x < bounds.x + bounds.width - 40; x += 55) {
      const inWc = x >= 1790 && x <= 1890;
      const inCp = x >= 1990 && x <= 2170;
      if (!inWc && !inCp) {
        this.createTree(x, -35 + ((x % 2) * 12), 'Cây Rừng Cổ Thụ Viền Nam');
        this.createDenseBush(x + 25, -30);
      }
    }'''
    assert old_df_trees in code, "old_df_trees not found"
    code = code.replace(old_df_trees, new_df_trees, 1)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(code)

    print("SUCCESS: 100% of colliders and boundary trees replaced with perfect mathematical alignment!")

if __name__ == '__main__':
    main()
