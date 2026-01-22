import { Vector2 } from '../Vector2';

export abstract class Entity {
  position: Vector2;
  radius: number;
  markedForDeletion: boolean = false;

  constructor(position: Vector2, radius: number = 0) {
    this.position = position;
    this.radius = radius;
  }

  abstract update(dt: number): void;
  abstract draw(ctx: CanvasRenderingContext2D): void;
}
