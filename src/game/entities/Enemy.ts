import { Entity } from './Entity';
import { Vector2 } from '../Vector2';
import { COLORS } from '../constants';

export class Enemy extends Entity {
  speed: number;
  health: number;
  maxHealth: number;
  path: Vector2[];
  pathIndex: number = 0;
  frozen: boolean = false;
  value: number; // Money given on kill

  constructor(path: Vector2[], health: number, speed: number, value: number) {
    super(path[0].clone(), 8); // Radius 8
    this.path = path;
    this.pathIndex = 1; // Start moving towards the second point
    this.health = health;
    this.maxHealth = health;
    this.speed = speed;
    this.value = value;
  }

  update(dt: number): void {
    if (this.pathIndex >= this.path.length) return;

    const target = this.path[this.pathIndex];
    const direction = target.sub(this.position);

    const moveStep = this.speed * dt * 0.06; // Normalize speed for dt

    if (this.position.distance(target) < moveStep) {
      this.position = target.clone();
      this.pathIndex++;
    } else {
      this.position = this.position.add(direction.normalize().scale(moveStep));
    }
  }

  takeDamage(amount: number) {
    this.health -= amount;
    if (this.health <= 0) {
      this.markedForDeletion = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);

    // Health Bar
    const hpPercent = this.health / this.maxHealth;
    ctx.fillStyle = '#334155';
    ctx.fillRect(-10, -15, 20, 4);
    ctx.fillStyle = hpPercent > 0.5 ? COLORS.success : COLORS.danger;
    ctx.fillRect(-10, -15, 20 * hpPercent, 4);

    // Body (Neon Hexagon/Circle)
    ctx.shadowBlur = 10;
    ctx.shadowColor = COLORS.danger;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner glow
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
