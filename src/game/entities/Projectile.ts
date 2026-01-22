import { Entity } from './Entity';
import { Vector2 } from '../Vector2';
import { Enemy } from './Enemy';

export class Projectile extends Entity {
  target: Enemy | null;
  targetPos: Vector2 | null; // For splash/aoe where target might die but projectile continues
  speed: number = 8;
  damage: number;
  color: string;
  splashRadius: number;

  constructor(position: Vector2, target: Enemy, damage: number, color: string, splashRadius: number = 0) {
    super(position, 3);
    this.target = target;
    this.targetPos = target.position.clone();
    this.damage = damage;
    this.color = color;
    this.splashRadius = splashRadius;
  }

  update(): void {
    let dest = this.targetPos;

    // Update destination if target is still alive and moving
    if (this.target && !this.target.markedForDeletion) {
        dest = this.target.position;
        this.targetPos = dest.clone();
    } else if (!dest) {
        this.markedForDeletion = true;
        return;
    }

    const direction = dest!.sub(this.position);
    const dist = direction.distance(new Vector2(0, 0));

    if (dist < this.speed) {
       this.markedForDeletion = true; // Hit
    } else {
       this.position = this.position.add(direction.normalize().scale(this.speed));
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.shadowBlur = 5;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
