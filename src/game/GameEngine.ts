import { Vector2 } from './Vector2';
import { Enemy } from './entities/Enemy';
import { Tower } from './entities/Tower';
import { Projectile } from './entities/Projectile';
import { Particle } from './entities/Particle';
import { soundManager } from './SoundManager';
import { COLORS, TILE_SIZE, MAP_WIDTH, MAP_HEIGHT, TOWER_TYPES, INITIAL_MONEY, INITIAL_LIVES } from './constants';

export class GameEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  towers: Tower[] = [];
  enemies: Enemy[] = [];
  projectiles: Projectile[] = [];
  particles: Particle[] = [];

  path: Vector2[];

  money: number = INITIAL_MONEY;
  lives: number = INITIAL_LIVES;
  wave: number = 1;
  isGameOver: boolean = false;
  isStopped: boolean = false;
  isPaused: boolean = false;

  lastTime: number = 0;

  // Wave Logic
  waveTimer: number = 0;
  enemiesToSpawn: number = 0;
  spawnTimer: number = 0;

  onStateChange: (state: any) => void;

  constructor(canvas: HTMLCanvasElement, onStateChange: (state: any) => void) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.onStateChange = onStateChange;

    // Define a hardcoded path for now (Winding road)
    this.path = this.generatePath();

    this.startWave();

    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  generatePath(): Vector2[] {
    // Grid coordinates
    const points = [
        [0, 2], [5, 2], [5, 8], [12, 8], [12, 4], [18, 4], [18, 12], [8, 12], [8, 14], [22, 14], [22, 8], [24, 8]
    ];
    return points.map(p => new Vector2(p[0] * TILE_SIZE + TILE_SIZE/2, p[1] * TILE_SIZE + TILE_SIZE/2));
  }

  startWave() {
      this.enemiesToSpawn = 5 + Math.floor(this.wave * 2.5);
      this.spawnTimer = 0;
  }

  spawnEnemy() {
      const health = 20 + (this.wave * 15);
      const speed = 1.0 + (this.wave * 0.1);
      const value = 15;
      this.enemies.push(new Enemy(this.path, health, speed, value));
  }

  buildTower(gridX: number, gridY: number, typeKey: string): boolean {
      if (this.isGameOver) return false;

      const type = TOWER_TYPES[typeKey as keyof typeof TOWER_TYPES];
      if (this.money < type.cost) return false;

      const pos = new Vector2(gridX * TILE_SIZE + TILE_SIZE/2, gridY * TILE_SIZE + TILE_SIZE/2);

      // Check collision with path
      // Simple check: is this tile in the path segments?
      // A more robust way is distance to line segments, but let's check distance to path points for the corners
      // Actually, since path is grid based, we can just check if the point is on the line.
      // For now, let's just check against existing towers
      for (const t of this.towers) {
          if (t.position.distance(pos) < 10) return false;
      }

      // Check distance to path (simplified)
      // If we drag a circle along the path, does it hit?
      // Quick hack: Don't build if close to any path node. Better: Check segments.
      // Since it's a grid game, let's just assume we can build anywhere except ON the path line.

      // Let's implement a smarter check:
      // Loop through path segments
      let onPath = false;
      for(let i=0; i<this.path.length-1; i++) {
          const p1 = this.path[i];
          const p2 = this.path[i+1];

          // Check if point is on segment
          const minX = Math.min(p1.x, p2.x) - TILE_SIZE/2;
          const maxX = Math.max(p1.x, p2.x) + TILE_SIZE/2;
          const minY = Math.min(p1.y, p2.y) - TILE_SIZE/2;
          const maxY = Math.max(p1.y, p2.y) + TILE_SIZE/2;

          if (pos.x >= minX && pos.x <= maxX && pos.y >= minY && pos.y <= maxY) {
              onPath = true;
              break;
          }
      }

      if (onPath) return false;

      this.money -= type.cost;
      this.towers.push(new Tower(pos, type));
      this.createParticles(pos, '#ffffff', 5);
      soundManager.playShoot('BASIC'); // Reusing a sound for build confirmation
      this.notifyState();
      return true;
  }

  createParticles(pos: Vector2, color: string, count: number) {
      for(let i=0; i<count; i++) {
          this.particles.push(new Particle(pos.clone(), color));
      }
  }

  update(dt: number) {
    if (this.isGameOver || this.isPaused) return;

    // Spawning Logic
    if (this.enemiesToSpawn > 0) {
        this.spawnTimer -= dt * 16.6;
        if (this.spawnTimer <= 0) {
            this.spawnEnemy();
            this.enemiesToSpawn--;
            this.spawnTimer = 1000 - Math.min(800, this.wave * 50); // Faster spawns later
        }
    } else if (this.enemies.length === 0) {
        // Wave clear
        this.waveTimer += dt * 16.6;
        if (this.waveTimer > 2000) { // 2 seconds between waves
            this.wave++;
            this.startWave();
            this.waveTimer = 0;
            this.notifyState();
        }
    }

    // Entities Update
    this.enemies.forEach(e => e.update(dt));
    this.towers.forEach(t => t.gameUpdate(dt, this.enemies, (p) => {
        this.projectiles.push(p);

        // Find tower type key for sound
        let typeKey = 'BASIC';
        for(const [key, val] of Object.entries(TOWER_TYPES)) {
             if (val.color === t.type.color && val.damage === t.type.damage) {
                 typeKey = key;
             }
        }
        soundManager.playShoot(typeKey as any);
    }));
    this.projectiles.forEach(p => p.update());
    this.particles.forEach(p => p.update());

    // Collision: Projectile vs Enemy
    for (const p of this.projectiles) {
        if (p.markedForDeletion) {
             // It hit something or expired
             // Check if it hit an enemy (distance check was done in projectile update but let's re-verify trigger)
             // Actually Projectile marks itself for deletion on hit.
             // We need to apply damage here if it hit.

             // Let's refine Projectile logic:
             // Projectile tracks target. If close, mark delete.
             // Here we check: if marked for deletion, was it close to target?

             // Simplify: Let's do collision check here instead of inside Projectile.
        }
    }

    // Better Collision Loop
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const p = this.projectiles[i];

        let hit = false;

        // Check collision with target specifically first
        if (p.target && !p.target.markedForDeletion && p.position.distance(p.target.position) < p.target.radius + p.radius) {
            hit = true;
        }
        // If splash, it might just explode at destination
        else if (p.targetPos && p.position.distance(p.targetPos) < 5) { // close enough
            hit = true;
        }

        if (hit) {
            p.markedForDeletion = true;
            this.createParticles(p.position, p.color, 3);
            soundManager.playExplosion();

            if (p.splashRadius > 0) {
                // AoE
                this.enemies.forEach(e => {
                    if (e.position.distance(p.position) <= p.splashRadius) {
                        e.takeDamage(p.damage);
                    }
                });
                // Visual shockwave
                 this.createParticles(p.position, p.color, 8);
            } else {
                // Single Target
                if (p.target) {
                    p.target.takeDamage(p.damage);
                }
            }
        }
    }

    // Cleanup Dead Entities
    for (let i = this.enemies.length - 1; i >= 0; i--) {
        const e = this.enemies[i];
        // Check if reached end
        if (e.pathIndex >= e.path.length) {
            this.lives--;
            e.markedForDeletion = true;
            this.notifyState();
            if (this.lives <= 0) {
                this.isGameOver = true;
                this.notifyState();
            }
        }

        if (e.markedForDeletion) {
            if (e.health <= 0) {
                this.money += e.value;
                this.createParticles(e.position, COLORS.accent, 5);
                soundManager.playMoney();
                this.notifyState();
            }
            this.enemies.splice(i, 1);
        }
    }

    this.projectiles = this.projectiles.filter(p => !p.markedForDeletion);
    this.particles = this.particles.filter(p => !p.markedForDeletion);
  }

  draw() {
    const ctx = this.ctx;
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Grid (Subtle)
    ctx.strokeStyle = '#1e1e2e';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for(let x=0; x<=MAP_WIDTH; x++) {
        ctx.moveTo(x*TILE_SIZE, 0);
        ctx.lineTo(x*TILE_SIZE, this.canvas.height);
    }
    for(let y=0; y<=MAP_HEIGHT; y++) {
        ctx.moveTo(0, y*TILE_SIZE);
        ctx.lineTo(this.canvas.width, y*TILE_SIZE);
    }
    ctx.stroke();

    // Path
    ctx.strokeStyle = COLORS.path;
    ctx.lineWidth = TILE_SIZE * 0.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    if (this.path.length > 0) {
        ctx.moveTo(this.path[0].x, this.path[0].y);
        for(let i=1; i<this.path.length; i++) {
            ctx.lineTo(this.path[i].x, this.path[i].y);
        }
    }
    ctx.stroke();

    // Path Border (Neon Glow)
    ctx.strokeStyle = '#38bdf8'; // Cyan
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#38bdf8';
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Background Grid Glow (Vignette style)
    const gradient = ctx.createRadialGradient(
        this.canvas.width/2, this.canvas.height/2, 100,
        this.canvas.width/2, this.canvas.height/2, 600
    );
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw Entities
    this.towers.forEach(t => t.draw(ctx));
    this.enemies.forEach(e => e.draw(ctx));
    this.projectiles.forEach(p => p.draw(ctx));
    this.particles.forEach(p => p.draw(ctx));
  }

  stop() {
      this.isStopped = true;
  }

  loop(timestamp: number) {
    if (this.isStopped) return;

    if (!this.lastTime) this.lastTime = timestamp;
    const dt = (timestamp - this.lastTime) / 16.6; // Normalize to roughly 1 frame
    this.lastTime = timestamp;

    this.update(dt);
    this.draw();

    requestAnimationFrame(this.loop);
  }

  notifyState() {
      this.onStateChange({
          money: this.money,
          lives: this.lives,
          wave: this.wave,
          isGameOver: this.isGameOver
      });
  }
}
