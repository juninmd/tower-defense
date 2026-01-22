
export const TILE_SIZE = 40;
export const MAP_WIDTH = 24; // in tiles
export const MAP_HEIGHT = 16; // in tiles
export const CANVAS_WIDTH = MAP_WIDTH * TILE_SIZE;
export const CANVAS_HEIGHT = MAP_HEIGHT * TILE_SIZE;

export const COLORS = {
  background: '#1e293b', // Slate 800
  grid: '#334155', // Slate 700
  path: '#0f172a', // Slate 900
  pathBorder: '#475569', // Slate 600
  towerBase: '#cbd5e1', // Slate 300
  accent: '#0ea5e9', // Sky 500
  danger: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
  text: '#f8fafc',
};

export const TOWER_TYPES = {
  BASIC: {
    name: 'Turret',
    cost: 50,
    range: 120,
    damage: 10,
    cooldown: 400, // ms
    color: '#0ea5e9', // Blue
    description: 'Fast firing basic defense.'
  },
  SNIPER: {
    name: 'Sniper',
    cost: 150,
    range: 300,
    damage: 50,
    cooldown: 1500,
    color: '#10b981', // Green
    description: 'Long range, high damage.'
  },
  BLASTER: {
    name: 'Blaster',
    cost: 250,
    range: 80,
    damage: 30,
    cooldown: 800,
    color: '#ef4444', // Red
    description: 'Splash damage area attack.',
    splashRadius: 60
  },
  RAPID: {
    name: 'Minigun',
    cost: 400,
    range: 100,
    damage: 4,
    cooldown: 50,
    color: '#f59e0b', // Amber
    description: 'Extremely fast fire rate.'
  }
};

export const INITIAL_LIVES = 20;
export const INITIAL_MONEY = 120;
