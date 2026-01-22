import { Entity } from './Entity';
import { Vector2 } from '../Vector2';
import { Enemy } from './Enemy';
import { Projectile } from './Projectile';
import { COLORS } from '../constants';

interface TowerType {
    range: number;
    damage: number;
    cooldown: number;
    color: string;
    splashRadius?: number;
}

export class Tower extends Entity {
  type: TowerType;
  cooldownTimer: number = 0;
  rotation: number = 0;

  constructor(position: Vector2, type: TowerType) {
    super(position);
    this.type = type;
  }

  update(): void {
      // Base entity update
  }

  // Custom update to handle game logic
  gameUpdate(dt: number, enemies: Enemy[], addProjectile: (p: Projectile) => void): void {
    if (this.cooldownTimer > 0) {
      this.cooldownTimer -= dt * 16.6; // normalizing dt roughly to ms
    }

    if (this.cooldownTimer <= 0) {
      const target = this.findTarget(enemies);
      if (target) {
        this.shoot(target, addProjectile);
        this.cooldownTimer = this.type.cooldown;
      }
    }
  }

  findTarget(enemies: Enemy[]): Enemy | null {
    // Simple closest targeting
    let closest: Enemy | null = null;
    let minDst = Infinity;

    for (const enemy of enemies) {
      const dst = this.position.distance(enemy.position);
      if (dst <= this.type.range && dst < minDst) {
        minDst = dst;
        closest = enemy;
      }
    }
    return closest;
  }

  shoot(target: Enemy, addProjectile: (p: Projectile) => void) {
      // Calculate rotation towards target for drawing
      const dir = target.position.sub(this.position);
      this.rotation = Math.atan2(dir.y, dir.x);

      addProjectile(new Projectile(
          this.position.clone(),
          target,
          this.type.damage,
          this.type.color,
          this.type.splashRadius || 0
      ));
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);

    // Draw Base
    ctx.fillStyle = COLORS.towerBase;
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();

    // Rotate Turret
    ctx.rotate(this.rotation);

    // Draw Turret Barrel
    ctx.fillStyle = this.type.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.type.color;
    ctx.fillRect(0, -5, 20, 10);

    // Draw Turret Center
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    // Range Circle (optional: usually only when selected, but lets stick to simple first)
    // ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    // ctx.beginPath();
    // ctx.arc(0, 0, this.type.range, 0, Math.PI * 2);
    // ctx.stroke();

    ctx.restore();
  }
}
