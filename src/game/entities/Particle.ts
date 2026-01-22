import { Entity } from './Entity';
import { Vector2 } from '../Vector2';

export class Particle extends Entity {
  velocity: Vector2;
  life: number = 1.0; // 0.0 to 1.0
  decay: number;
  color: string;
  size: number;

  constructor(position: Vector2, color: string, size: number = 2) {
    super(position);
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 2 + 0.5;
    this.velocity = new Vector2(Math.cos(angle) * speed, Math.sin(angle) * speed);
    this.color = color;
    this.decay = Math.random() * 0.02 + 0.01;
    this.size = size;
  }

  update(): void {
    this.position = this.position.add(this.velocity);
    this.life -= this.decay;
    if (this.life <= 0) {
      this.markedForDeletion = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }
}
