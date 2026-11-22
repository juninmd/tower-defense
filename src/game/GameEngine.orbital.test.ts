import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GameEngine } from './GameEngine';

const fakeCtx = (): CanvasRenderingContext2D =>
    new Proxy({}, { get: () => () => ({ addColorStop: () => {} }) }) as unknown as CanvasRenderingContext2D;
const fakeCanvas = () => ({ width: 0, height: 0, style: {}, getContext: fakeCtx }) as unknown as HTMLCanvasElement;

describe('GameEngine orbital strike on high-DPI screens', () => {
    beforeEach(() => {
        vi.stubGlobal('window', { devicePixelRatio: 2, addEventListener: () => {}, removeEventListener: () => {} });
        vi.stubGlobal('document', { createElement: fakeCanvas });
        vi.stubGlobal('requestAnimationFrame', () => 0);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    // The canvas is drawn in logical (CSS) pixels; using backing-store pixels pushes the effect off-screen.
    it('centers the banner and keeps the particles inside the visible board', () => {
        const engine = new GameEngine(fakeCanvas(), [{ x: 0, y: 0 }, { x: 1, y: 1 }], 400, 300, () => {});
        engine.state.money = 1000;
        engine.activateAbility('ORBITAL_STRIKE');

        const banner = engine.particles.find((p) => p.text === 'ORBITAL STRIKE');
        expect(banner?.position.x).toBe(200);
        expect(banner?.position.y).toBe(150);
        for (const p of engine.particles) {
            expect(p.position.x).toBeLessThanOrEqual(400);
            expect(p.position.y).toBeLessThanOrEqual(300);
        }
        engine.destroy();
    });
});
