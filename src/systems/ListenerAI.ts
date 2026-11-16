import { MonsterState } from '../entities/monsters/Monster';
import { TheListener } from '../entities/TheListener';

export interface Waypoint {
  x: number;
  y: number;
}

export class ListenerAI {
  private listener: TheListener;
  public state: MonsterState = 'PATROL';

  private waypoints: Waypoint[] = [];
  private currentWaypointIdx: number = 0;

  // Tọa độ điều tra âm thanh & vị trí người chơi nhìn thấy cuối cùng (Fair Play)
  private targetInvestigateX: number = 0;
  private targetInvestigateY: number = 0;
  private lastKnownPlayerX: number = 0;
  private lastKnownPlayerY: number = 0;
  private searchOriginX: number = 0;
  private searchOriginY: number = 0;
  private currentSearchOffsetIdx: number = 0;

  // Bộ đếm thời gian các trạng thái
  private alertTimer: number = 0;
  private searchTimer: number = 0;
  private lostSightTimer: number = 0;
  private attackCooldown: number = 0;
  private patrolWaitTimer: number = 0;
  private detectionCooldown: number = 0; // Thời gian nghỉ giảm nhạy cảm sau khi từ bỏ truy đuổi

  // Tối ưu hóa tần suất tính toán đường đi & Cơ chế chống kẹt vật lý (C4-13-05)
  private pathUpdateTimer: number = 0;
  private readonly PATH_UPDATE_INTERVAL: number = 160; // Chỉ tính hướng đi mỗi 160ms (chống tụt FPS)
  private lastRecordedX: number = 0;
  private lastRecordedY: number = 0;
  private stuckTimer: number = 0;
  private avoidanceAngleOffset: number = 0; // Góc né vật cản khi vướng địa hình

  // Giới hạn lãnh thổ rừng & Ranh giới Khu Vực An Toàn Làng Bellhollow (C4-13-05)
  public static readonly SAFE_ZONE_BORDER_X: number = 1620; // Toàn bộ Làng Bellhollow & Cổng làng ở x <= 1620
  public static readonly FOREST_TERRITORY_MIN_X: number = 1630; // Điểm bắt đầu lãnh thổ rừng
  public static readonly FOREST_TERRITORY_MAX_X: number = 3980; // Giới hạn trước miếu chuông
  public static readonly MAX_LEASH_DISTANCE: number = 420; // Bán kính truy đuổi tối đa từ lộ trình tuần tra

  // C4-13-09: Tọa độ tìm kiếm tĩnh tái sử dụng, loại bỏ hoàn toàn cấp phát mảng mới mỗi frame
  private static readonly SEARCH_OFFSETS: Waypoint[] = [
    { x: 36, y: 0 },
    { x: -36, y: 16 },
    { x: 0, y: -36 },
    { x: 18, y: 32 }
  ];

  constructor(listener: TheListener, waypoints: Waypoint[]) {
    this.listener = listener;
    this.waypoints = waypoints;
    if (waypoints.length > 0) {
      this.lastKnownPlayerX = waypoints[0].x;
      this.lastKnownPlayerY = waypoints[0].y;
    }
  }

  public setWaypoints(waypoints: Waypoint[]): void {
    if (waypoints && waypoints.length > 0) {
      this.waypoints = waypoints;
      this.currentWaypointIdx = 0;
      this.patrolWaitTimer = 0;
    }
  }

  public canAttack(): boolean {
    return this.attackCooldown <= 0;
  }

  public triggerAttackCooldown(ms: number = 1500): void {
    this.attackCooldown = ms;
  }

  /**
   * Đưa Kẻ Lắng Nghe về trạng thái tuần tra mặc định và triệt tiêu toàn bộ vận tốc truy đuổi
   */
  public resetToPatrol(initialX?: number, initialY?: number): void {
    this.state = 'PATROL';
    this.alertTimer = 0;
    this.searchTimer = 0;
    this.lostSightTimer = 0;
    this.attackCooldown = 0;
    this.patrolWaitTimer = 0;
    this.detectionCooldown = 0;
    this.stuckTimer = 0;
    this.avoidanceAngleOffset = 0;
    this.listener.setAlertVisual(false);
    this.listener.setVelocity(0, 0);

    if (initialX !== undefined && initialY !== undefined) {
      this.listener.setPosition(initialX, initialY);
    } else if (this.waypoints.length > 0) {
      this.currentWaypointIdx = 0;
      this.listener.setPosition(this.waypoints[0].x, this.waypoints[0].y);
    }
  }

  /**
   * Tính khoảng cách tới điểm tuần tra gần nhất để kiểm soát bán kính rượt đuổi tối đa (Leash Distance)
   */
  public getDistanceToNearestWaypoint(): number {
    if (this.waypoints.length === 0) return 0;
    let minDist = Infinity;
    for (const wp of this.waypoints) {
      const d = Math.hypot(this.listener.x - wp.x, this.listener.y - wp.y);
      if (d < minDist) minDist = d;
    }
    return minDist;
  }

  /**
   * Kiểm tra xem một tọa độ có nằm trong Khu Vực An Toàn (Làng Bellhollow) hay không
   */
  public isInsideSafeZone(x: number): boolean {
    return x <= ListenerAI.SAFE_ZONE_BORDER_X;
  }

  public update(delta: number, playerX: number, playerY: number, isPlayerHiding: boolean, isPlayerDead: boolean = false): void {
    if (this.attackCooldown > 0) {
      this.attackCooldown -= delta;
    }
    if (this.detectionCooldown > 0) {
      this.detectionCooldown -= delta;
    }

    // Dừng ngay lập tức hành vi rượt đuổi / điều tra khi người chơi đã gục ngã
    if (isPlayerDead) {
      if (this.state !== 'PATROL') {
        this.state = 'PATROL';
        this.listener.setAlertVisual(false);
      }
      this.listener.setVelocity(0, 0);
      return;
    }

    // Cập nhật bộ đếm kiểm tra chống kẹt địa hình và tính toán đường đi định kỳ (Throttled Steering)
    this.pathUpdateTimer += delta;
    const shouldUpdatePath = this.pathUpdateTimer >= this.PATH_UPDATE_INTERVAL;
    if (shouldUpdatePath) {
      this.updateStuckDetection();
      this.pathUpdateTimer = 0;
    }

    switch (this.state) {
      case 'PATROL':
        this.updatePatrol(delta, playerX, playerY, isPlayerHiding, shouldUpdatePath);
        break;

      case 'ALERT':
      case 'ALERT_TELEGRAPH':
      case 'INVESTIGATE_SOUND':
        this.updateAlert(delta, playerX, playerY, isPlayerHiding, shouldUpdatePath);
        break;

      case 'CHASE':
        this.updateChase(delta, playerX, playerY, isPlayerHiding, shouldUpdatePath);
        break;

      case 'SEARCH':
        this.updateSearch(delta, playerX, playerY, isPlayerHiding, shouldUpdatePath);
        break;

      case 'RETURN':
      case 'DISENGAGE':
        this.updateReturn(delta, shouldUpdatePath);
        break;
    }
  }

  /**
   * Phát hiện kẹt vật lý khi di chuyển: nếu có vận tốc nhưng thực tế bị đứng yên, tự động đổi góc né
   */
  private updateStuckDetection(): void {
    const body = this.listener.body as Phaser.Physics.Arcade.Body | undefined;
    if (!body) return;

    const currentSpeed = Math.hypot(body.velocity.x, body.velocity.y);
    const distMoved = Math.hypot(this.listener.x - this.lastRecordedX, this.listener.y - this.lastRecordedY);
    this.lastRecordedX = this.listener.x;
    this.lastRecordedY = this.listener.y;

    if (currentSpeed > 10 && distMoved < 2.5) {
      this.stuckTimer += this.PATH_UPDATE_INTERVAL;
      if (this.stuckTimer >= 320) {
        // Áp dụng góc né vật cản 45 độ để trượt theo mép collider
        this.avoidanceAngleOffset = (Math.floor(this.stuckTimer / 320) % 2 === 0 ? 1 : -1) * 0.785; // +/- 45 deg
      }
      if (this.stuckTimer >= 1200) {
        // Kẹt quá lâu (1.2s): Tự động giải phóng
        if (this.state === 'PATROL' && this.waypoints.length > 0) {
          this.currentWaypointIdx = (this.currentWaypointIdx + 1) % this.waypoints.length;
        } else if (this.state === 'CHASE' || this.state === 'ALERT') {
          this.triggerSearchAt(this.lastKnownPlayerX, this.lastKnownPlayerY);
        } else if (this.state === 'SEARCH') {
          this.state = 'RETURN';
        }
        this.stuckTimer = 0;
        this.avoidanceAngleOffset = 0;
      }
    } else {
      this.stuckTimer = 0;
      this.avoidanceAngleOffset = 0;
    }
  }

  /**
   * TRẠNG THÁI 1: PATROL (Tuần tra tự nhiên trong khu vực rừng)
   */
  private updatePatrol(delta: number, playerX: number, playerY: number, isPlayerHiding: boolean, shouldUpdatePath: boolean): void {
    if (this.waypoints.length === 0) return;

    // 1. Kiểm tra tầm nhìn phát hiện người chơi (Line of Sight Check)
    if (!isPlayerHiding && this.detectionCooldown <= 0) {
      // Nếu người chơi ở ngoài làng Bellhollow
      if (!this.isInsideSafeZone(playerX)) {
        const distToPlayer = Math.hypot(this.listener.x - playerX, this.listener.y - playerY);
        if (distToPlayer <= 130) {
          this.forceChase();
          return;
        }
      }
    }

    // 2. Tạm dừng ngó nghiêng khi đến waypoint
    if (this.patrolWaitTimer > 0) {
      this.patrolWaitTimer -= delta;
      this.listener.setVelocity(0, 0);
      return;
    }

    const wp = this.waypoints[this.currentWaypointIdx];
    const distToWp = Math.hypot(this.listener.x - wp.x, this.listener.y - wp.y);

    if (distToWp <= 14) {
      this.currentWaypointIdx = (this.currentWaypointIdx + 1) % this.waypoints.length;
      this.patrolWaitTimer = 1100; // Tạm dừng 1.1s quan sát rừng
      this.listener.setVelocity(0, 0);
      return;
    }

    if (shouldUpdatePath) {
      let angle = Math.atan2(wp.y - this.listener.y, wp.x - this.listener.x) + this.avoidanceAngleOffset;
      const speed = 42;
      this.listener.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    }
  }

  /**
   * TRẠNG THÁI 2: ALERT (Phát hiện nghi vấn — Hiện dấu [?] vàng & đi tới nguồn âm thanh)
   */
  private updateAlert(delta: number, playerX: number, playerY: number, isPlayerHiding: boolean, shouldUpdatePath: boolean): void {
    // 1. Pha Telegraph dừng lại lắng nghe (0.7s)
    if (this.alertTimer > 0) {
      this.alertTimer -= delta;
      this.listener.setVelocity(0, 0);
      if (this.alertTimer <= 0) {
        // Kết thúc pha đứng nghe, tiếp tục giữ icon [?] vàng khi tiến tới kiểm tra
        this.listener.setAlertVisual(true, 'alert');
      }
      return;
    }

    // 2. Kiểm tra nếu thấy người chơi trên đường đi tới nguồn âm thanh
    if (!isPlayerHiding && this.detectionCooldown <= 0 && !this.isInsideSafeZone(playerX)) {
      const distToPlayer = Math.hypot(this.listener.x - playerX, this.listener.y - playerY);
      if (distToPlayer <= 125) {
        this.forceChase();
        return;
      }
    }

    // 3. Tiến tới vị trí phát ra âm thanh (được giới hạn ngoài Làng Bellhollow)
    const targetX = Math.max(ListenerAI.FOREST_TERRITORY_MIN_X, this.targetInvestigateX);
    const targetY = this.targetInvestigateY;
    const distToSound = Math.hypot(this.listener.x - targetX, this.listener.y - targetY);

    if (distToSound <= 18) {
      // Đã tới vị trí âm thanh nhưng không thấy gì -> Chuyển sang tìm kiếm
      this.triggerSearchAt(targetX, targetY);
      return;
    }

    if (shouldUpdatePath) {
      let angle = Math.atan2(targetY - this.listener.y, targetX - this.listener.x) + this.avoidanceAngleOffset;
      const speed = 56;
      this.listener.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    }
  }

  /**
   * TRẠNG THÁI 3: CHASE (Truy đuổi khẩn cấp — Hiện dấu [!] đỏ & nhịp tim căng thẳng)
   */
  private updateChase(delta: number, playerX: number, playerY: number, isPlayerHiding: boolean, shouldUpdatePath: boolean): void {
    // =========================================================================
    // ĐIỀU KIỆN 1: NGƯỜI CHƠI CHẠY VÀO LÀNG BELLHOLLOW HOẶC THỰC THỂ CHẠM RANH GIỚI AN TOÀN
    // =========================================================================
    if (this.isInsideSafeZone(playerX) || this.listener.x <= ListenerAI.SAFE_ZONE_BORDER_X) {
      // Thực thể bị chặn lại ở rìa rừng, không tràn vào làng gây lag và mất cân bằng game
      this.listener.setVelocity(0, 0);
      this.disengageChase('Làng Bellhollow được bảo hộ bởi vòng phong ấn chuông!');
      return;
    }

    // =========================================================================
    // ĐIỀU KIỆN 2: VƯỢT QUÁ BÁN KÍNH TRUY ĐUỔI TỐI ĐA (MAX LEASH DISTANCE)
    // =========================================================================
    const distFromPatrol = this.getDistanceToNearestWaypoint();
    if (distFromPatrol > ListenerAI.MAX_LEASH_DISTANCE) {
      // Quá xa lãnh thổ rừng được giao -> Dừng lại và quay về
      this.listener.setVelocity(0, 0);
      this.disengageChase('Thực thể chạm giới hạn lãnh thổ rừng và quay đầu.');
      return;
    }

    // =========================================================================
    // ĐIỀU KIỆN 3: NGƯỜI CHƠI NÚP VÀO BỤI RẬM HOẶC HỐC CÂY (FAIR PLAY STEALTH)
    // =========================================================================
    if (isPlayerHiding) {
      // Entity KHÔNG BIẾT chỗ nấp của người chơi! Chỉ tìm kiếm tại vị trí cuối cùng nhìn thấy
      this.triggerSearchAt(this.lastKnownPlayerX, this.lastKnownPlayerY);
      return;
    }

    // Ghi nhớ vị trí người chơi nhìn thấy gần nhất
    this.lastKnownPlayerX = playerX;
    this.lastKnownPlayerY = playerY;

    // =========================================================================
    // ĐIỀU KIỆN 4: NGƯỜI CHƠI CHẠY XA KHUẤT TẦM NHÌN
    // =========================================================================
    const distToPlayer = Math.hypot(this.listener.x - playerX, this.listener.y - playerY);
    if (distToPlayer > 220) {
      this.lostSightTimer += delta;
      if (this.lostSightTimer >= 2200) {
        // Mất dấu hơn 2.2 giây -> Chuyển sang tìm kiếm tại vị trí cuối cùng nhìn thấy
        this.lostSightTimer = 0;
        this.triggerSearchAt(this.lastKnownPlayerX, this.lastKnownPlayerY);
        return;
      }
    } else {
      this.lostSightTimer = 0;
    }

    // Di chuyển truy đuổi tốc độ cao (105 px/s) có né vật cản
    if (shouldUpdatePath) {
      let angle = Math.atan2(playerY - this.listener.y, playerX - this.listener.x) + this.avoidanceAngleOffset;
      const speed = 105;
      this.listener.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    }
  }

  /**
   * TRẠNG THÁI 4: SEARCH (Tìm kiếm khi mất dấu — Hiện dấu [?] vàng & tìm quanh lastKnownPosition)
   */
  private updateSearch(delta: number, playerX: number, playerY: number, isPlayerHiding: boolean, shouldUpdatePath: boolean): void {
    this.searchTimer -= delta;

    if (this.searchTimer <= 0) {
      // Hết 4.5s tìm kiếm không thấy gì -> Từ bỏ và quay về tuyến tuần tra
      this.state = 'RETURN';
      this.detectionCooldown = 2500; // 2.5s nghỉ ngơi không phát hiện lặp
      this.listener.onChaseEnded();
      return;
    }

    // Nếu người chơi bước ra khỏi chỗ nấp ngay trước mặt Entity trong lúc tìm kiếm
    if (!isPlayerHiding && !this.isInsideSafeZone(playerX)) {
      const distToPlayer = Math.hypot(this.listener.x - playerX, this.listener.y - playerY);
      if (distToPlayer <= 85) {
        this.forceChase();
        return;
      }
    }

    // Lộ trình tìm kiếm hình chữ thập nhỏ quanh searchOrigin (+/- 36px) tái sử dụng mảng tĩnh
    const offsets = ListenerAI.SEARCH_OFFSETS;
    const targetOffset = offsets[this.currentSearchOffsetIdx % offsets.length];
    const targetX = Math.max(ListenerAI.FOREST_TERRITORY_MIN_X, this.searchOriginX + targetOffset.x);
    const targetY = this.searchOriginY + targetOffset.y;

    const distToOffset = Math.hypot(this.listener.x - targetX, this.listener.y - targetY);
    if (distToOffset <= 12) {
      this.currentSearchOffsetIdx = (this.currentSearchOffsetIdx + 1) % offsets.length;
    }

    if (shouldUpdatePath) {
      let angle = Math.atan2(targetY - this.listener.y, targetX - this.listener.x) + this.avoidanceAngleOffset;
      const speed = 44; // Đi chậm quan sát xung quanh
      this.listener.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    }
  }

  /**
   * TRẠNG THÁI 5: RETURN / DISENGAGE (Từ bỏ truy đuổi & Quay về tuyến tuần tra ban đầu)
   */
  private updateReturn(_delta: number, shouldUpdatePath: boolean): void {
    if (this.waypoints.length === 0) {
      this.state = 'PATROL';
      return;
    }

    const wp = this.waypoints[this.currentWaypointIdx];
    const distToWp = Math.hypot(this.listener.x - wp.x, this.listener.y - wp.y);

    if (distToWp <= 18) {
      // Đã về tới vị trí tuần tra an toàn
      this.state = 'PATROL';
      this.patrolWaitTimer = 900;
      this.listener.setVelocity(0, 0);
      return;
    }

    if (shouldUpdatePath) {
      let angle = Math.atan2(wp.y - this.listener.y, wp.x - this.listener.x) + this.avoidanceAngleOffset;
      const speed = 48;
      this.listener.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    }
  }

  /**
   * Chuyển sang tìm kiếm công bằng tại tọa độ được chỉ định trong 4.5 giây
   */
  private triggerSearchAt(x: number, y: number): void {
    this.state = 'SEARCH';
    this.searchTimer = 4500; // Tìm kiếm trong 4.5s
    this.searchOriginX = Math.max(ListenerAI.FOREST_TERRITORY_MIN_X, x);
    this.searchOriginY = y;
    this.currentSearchOffsetIdx = 0;
    this.lostSightTimer = 0;
    this.listener.onSearchVisual(); // Hiện dấu [?] vàng
  }

  /**
   * Từ bỏ truy đuổi khi chạm ranh giới làng hoặc vượt bán kính leash
   */
  private disengageChase(_reason?: string): void {
    this.state = 'RETURN';
    this.detectionCooldown = 2800; // Nghỉ 2.8s không phát hiện lặp tức thì
    this.listener.setVelocity(0, 0);
    this.listener.onChaseEnded();
  }

  /**
   * Tiếp nhận âm thanh nghi vấn (Sprint bước chân, mồi ném [Q], hoặc tương tác thế giới)
   */
  public triggerSoundAlert(soundX: number, soundY: number, volume: number): void {
    // Nếu âm thanh phát ra trong làng an toàn (Bellhollow) và Entity đang ở rừng, bỏ qua không tràn vào làng
    if (this.isInsideSafeZone(soundX) && soundX < ListenerAI.SAFE_ZONE_BORDER_X - 40) {
      return;
    }

    // Nếu đang trong thời gian nghỉ hồi phục hoặc đang truy đuổi thì không phân tâm trừ khi mồi ném nổ lớn
    if (this.state === 'CHASE' && volume < 2.0) return;
    if (this.detectionCooldown > 0 && volume < 2.0) return;

    this.targetInvestigateX = Math.max(ListenerAI.FOREST_TERRITORY_MIN_X, soundX);
    this.targetInvestigateY = soundY;

    // C4-13-08: Kích hoạt tín hiệu cảnh báo Telegraph 0.7s chỉ khi chuyển sang ALERT (không lặp)
    const previousState = this.state;
    this.state = 'ALERT';
    this.alertTimer = 700;
    if (previousState !== 'ALERT') {
      this.listener.onAlertTelegraph();
    }
  }

  public forceChase(): void {
    // Không bao giờ cho phép kích hoạt rượt đuổi nếu người chơi đang ở trong làng an toàn
    if (this.listener.x <= ListenerAI.SAFE_ZONE_BORDER_X) return;

    // C4-13-08: Chỉ kích hoạt chuông báo và nhịp tim dồn dập khi chuyển trạng thái sang CHASE
    if (this.state === 'CHASE') return;

    this.state = 'CHASE';
    this.lostSightTimer = 0;
    this.patrolWaitTimer = 0;
    this.listener.onChaseAlert();
  }
}
