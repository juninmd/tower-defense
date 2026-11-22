import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GameEngine, type GameState } from './GameEngine';

// Canvas 2D stub: any drawing call is a no-op.
const fakeCtx = (): CanvasRenderingContext2D =>
    new Proxy({}, { get: () => () => ({ addColorStop: () => {} }) }) as unknown as CanvasRenderingContext2D;
const fakeCanvas = () => ({ width: 0, height: 0, style: {}, getContext: fakeCtx }) as unknown as HTMLCanvasElement;

describe('GameEngine notifyState throttle', () => {
    let now = 1000;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.stubGlobal('window', { devicePixelRatio: 1, addEventListener: () => {}, removeEventListener: () => {} });
        vi.stubGlobal('document', { createElement: fakeCanvas });
        vi.stubGlobal('requestAnimationFrame', () => 0);
        vi.spyOn(performance, 'now').mockImplementation(() => now);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    // A throttled update must still reach the HUD, or it shows stale money/wave until some later event.
    it('delivers the latest state after an update dropped by the throttle', () => {
        const states: GameState[] = [];
        const engine = new GameEngine(fakeCanvas(), [{ x: 0, y: 0 }, { x: 1, y: 1 }], 100, 100, (s) => states.push(s));

        engine.setSpeed(2);
        now += 10;
        engine.setSpeed(3);
        expect(states.at(-1)?.speed).toBe(2);

        now += 40;
        vi.advanceTimersByTime(40);
        expect(states.at(-1)?.speed).toBe(3);
        engine.destroy();
    });
});
