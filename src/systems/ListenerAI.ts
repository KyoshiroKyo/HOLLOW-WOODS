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

  private targetInvestigateX: number = 0;
  private targetInvestigateY: number = 0;

  private alertTimer: number = 0;
  private searchTimer: number = 0;
  private lostSightTimer: number = 0;

  constructor(listener: TheListener, waypoints: Waypoint[]) {
    this.listener = listener;
    this.waypoints = waypoints;
  }

  public update(delta: number, playerX: number, playerY: number, isPlayerHiding: boolean): void {

    switch (this.state) {
      case 'PATROL':
        this.updatePatrol();
        break;

      case 'ALERT_TELEGRAPH':
        this.alertTimer -= delta;
        this.listener.setVelocity(0, 0);
        if (this.alertTimer <= 0) {
          this.state = 'INVESTIGATE_SOUND';
          this.listener.setAlertVisual(false);
        }
        break;

      case 'INVESTIGATE_SOUND':
        this.updateInvestigate(playerX, playerY, isPlayerHiding);
        break;

      case 'CHASE':
        this.updateChase(playerX, playerY, isPlayerHiding, delta);
        break;

      case 'SEARCH':
        this.searchTimer -= delta;
        this.listener.setVelocity(0, 0);
        if (this.searchTimer <= 0) {
          this.state = 'RETURN';
        } else {
          // Nếu người chơi bước ra khỏi chỗ nấp trong lúc tìm kiếm
          if (!isPlayerHiding) {
            const dist = Math.hypot(this.listener.x - playerX, this.listener.y - playerY);
            if (dist <= 75) {
              this.state = 'CHASE';
            }
          }
        }
        break;

      case 'RETURN':
        this.updateReturn();
        break;
    }
  }

  public triggerSoundAlert(soundX: number, soundY: number, _volume: number): void {
    // Nếu đang truy đuổi thì không phân tâm trừ khi mồi ném nổ
    if (this.state === 'CHASE') return;

    this.targetInvestigateX = soundX;
    this.targetInvestigateY = soundY;

    // Kích hoạt tín hiệu cảnh báo Telegraph 0.8s
    this.state = 'ALERT_TELEGRAPH';
    this.alertTimer = 800;
    this.listener.setAlertVisual(true);
  }

  public forceChase(): void {
    this.state = 'CHASE';
    this.lostSightTimer = 0;
    this.listener.setAlertVisual(true);
  }

  private updatePatrol(): void {
    if (this.waypoints.length === 0) return;

    const wp = this.waypoints[this.currentWaypointIdx];
    const dist = Math.hypot(this.listener.x - wp.x, this.listener.y - wp.y);

    if (dist <= 10) {
      this.currentWaypointIdx = (this.currentWaypointIdx + 1) % this.waypoints.length;
    } else {
      const angle = Math.atan2(wp.y - this.listener.y, wp.x - this.listener.x);
      const speed = 40; // Tốc độ tuần tra chậm rãi
      this.listener.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    }
  }

  private updateInvestigate(playerX: number, playerY: number, isPlayerHiding: boolean): void {
    const distToSound = Math.hypot(this.listener.x - this.targetInvestigateX, this.listener.y - this.targetInvestigateY);

    // Kiểm tra nếu trên đường đi phát hiện thấy người chơi (và người chơi KHÔNG ẩn nấp)
    if (!isPlayerHiding) {
      const distToPlayer = Math.hypot(this.listener.x - playerX, this.listener.y - playerY);
      if (distToPlayer <= 70) {
        this.state = 'CHASE';
        return;
      }
    }

    if (distToSound <= 12) {
      // Đã tới nguồn âm thanh -> chuyển sang tìm kiếm
      this.state = 'SEARCH';
      this.searchTimer = 4500; // Tìm kiếm 4.5s
      this.listener.setVelocity(0, 0);
    } else {
      const angle = Math.atan2(this.targetInvestigateY - this.listener.y, this.targetInvestigateX - this.listener.x);
      const speed = 55;
      this.listener.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    }
  }

  private updateChase(playerX: number, playerY: number, isPlayerHiding: boolean, delta: number): void {
    // Nếu người chơi kịp chui vào chỗ ẩn nấp (Thân cây / Bụi rậm)
    if (isPlayerHiding) {
      this.state = 'SEARCH';
      this.searchTimer = 4000;
      this.listener.setVelocity(0, 0);
      return;
    }

    const dist = Math.hypot(this.listener.x - playerX, this.listener.y - playerY);

    if (dist > 180) {
      this.lostSightTimer += delta;
      if (this.lostSightTimer >= 2500) {
        // Mất dấu quá lâu -> quay lại tìm kiếm
        this.lostSightTimer = 0;
        this.state = 'SEARCH';
        this.searchTimer = 3500;
        return;
      }
    } else {
      this.lostSightTimer = 0;
    }

    // Lao vào rượt đuổi tốc độ cao
    const angle = Math.atan2(playerY - this.listener.y, playerX - this.listener.x);
    const speed = 105;
    this.listener.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
  }

  private updateReturn(): void {
    if (this.waypoints.length === 0) {
      this.state = 'PATROL';
      return;
    }

    const wp = this.waypoints[this.currentWaypointIdx];
    const dist = Math.hypot(this.listener.x - wp.x, this.listener.y - wp.y);

    if (dist <= 15) {
      this.state = 'PATROL';
    } else {
      const angle = Math.atan2(wp.y - this.listener.y, wp.x - this.listener.x);
      const speed = 45;
      this.listener.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    }
  }
}
