import { describe, it, expect } from 'vitest';
import { InputManager } from './InputManager';

describe('InputManager.handleClick', () => {
  it('leaves the price check to the engine, which knows the DISCOUNT mod', () => {
    const input = new InputManager();
    input.setPlacementMode('BASIC');
    input.updateMouse(100, 100);
    // With DISCOUNT the tower costs 90% of the list price, so the click must reach placeTower.
    const action = input.handleClick([]);
    expect(action?.action).toBe('PLACE');
  });
});
