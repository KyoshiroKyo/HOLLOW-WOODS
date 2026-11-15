import * as Phaser from 'phaser';

export type MonsterState = 'PATROL' | 'ALERT' | 'ALERT_TELEGRAPH' | 'INVESTIGATE_SOUND' | 'CHASE' | 'SEARCH' | 'RETURN' | 'DISENGAGE';

export abstract class Monster extends Phaser.Physics.Arcade.Sprite {
  public currentState: MonsterState = 'PATROL';
  public alertDuration: number = 800; // 0.8s cảnh báo telegraph
  public hearingRadius: number = 140;

  constructor(scene: Phaser.Scene, x: number, y: number, textureKey: string) {
    super(scene, x, y, textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  public abstract hearSound(sourceX: number, sourceY: number, volume: number): void;
}

