import React from 'react';
import { TOWER_TYPES } from '../game/constants';
import { Shield, RotateCcw, Pause, Play, FastForward, Trash2 } from 'lucide-react';

interface GameHUDProps {
  money: number;
  lives: number;
  wave: number;
  isGameOver: boolean;
  isPaused: boolean;
  timeScale: number;
  selectedTower: string | null;
  hasSelectedTowerOnMap: boolean;
  onSelectTower: (key: string | null) => void;
  onRestart: () => void;
  onTogglePause: () => void;
  onToggleSpeed: () => void;
  onSellTower: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
    money, lives, wave, isGameOver, isPaused, timeScale,
    selectedTower, hasSelectedTowerOnMap,
    onSelectTower, onRestart, onTogglePause, onToggleSpeed, onSellTower
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">

      {/* Top Bar: Stats & Controls */}
      <div className="flex justify-between items-center bg-slate-800/90 backdrop-blur-md p-4 rounded-xl border border-slate-600 shadow-xl pointer-events-auto">
        <div className="flex gap-8">
            <div className="flex items-center gap-2 text-rose-500">
                <Shield size={24} />
                <span className="text-2xl font-bold font-mono">{lives}</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
                <span className="text-xl">$</span>
                <span className="text-2xl font-bold font-mono">{money}</span>
            </div>
        </div>

        <div className="text-slate-200 font-bold text-xl tracking-widest">
            WAVE <span className="text-sky-400 text-2xl">{wave}</span>
        </div>

        <div className="flex gap-2">
            <button onClick={onTogglePause} className="p-2 rounded bg-slate-700 hover:bg-slate-600 text-white transition">
                {isPaused ? <Play size={20} /> : <Pause size={20} />}
            </button>
            <button onClick={onToggleSpeed} className={`p-2 rounded bg-slate-700 hover:bg-slate-600 text-white transition ${timeScale > 1 ? 'text-sky-400' : ''}`}>
                <FastForward size={20} />
            </button>
        </div>
      </div>

      {/* Game Over Screen */}
      {isGameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center pointer-events-auto z-50">
              <h1 className="text-6xl font-black text-rose-500 mb-4 tracking-tighter shadow-rose-500/50 drop-shadow-lg">GAME OVER</h1>
              <p className="text-slate-300 text-xl mb-8">You survived {wave} waves</p>
              <button
                onClick={onRestart}
                className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105"
              >
                  <RotateCcw size={20} /> TRY AGAIN
              </button>
          </div>
      )}

      {/* Bottom Bar: Tower Selection */}
      <div className="flex justify-center items-end gap-4 pointer-events-auto pb-4">

        {hasSelectedTowerOnMap && (
            <button
                onClick={onSellTower}
                className="mb-4 bg-rose-600 hover:bg-rose-500 text-white p-4 rounded-xl font-bold shadow-lg flex flex-col items-center gap-2 border-2 border-rose-400 transition transform hover:scale-105"
            >
                <Trash2 size={24} />
                <span>SELL (70%)</span>
            </button>
        )}

        {Object.entries(TOWER_TYPES).map(([key, tower]) => {
            const isSelected = selectedTower === key;
            const canAfford = money >= tower.cost;

            return (
                <button
                    key={key}
                    onClick={() => onSelectTower(key === selectedTower ? null : key)}
                    disabled={!canAfford && !isSelected}
                    className={`
                        relative group flex flex-col items-center p-3 rounded-xl border-2 transition-all w-24
                        ${isSelected ? 'bg-slate-700 border-sky-400 shadow-lg scale-110 -translate-y-2' : 'bg-slate-800/90 border-slate-600 hover:border-slate-400'}
                        ${!canAfford && !isSelected ? 'opacity-50 grayscale' : ''}
                    `}
                >
                    <div className="w-8 h-8 rounded-full mb-2 shadow-lg" style={{ backgroundColor: tower.color }}></div>
                    <span className="text-xs font-bold text-slate-200">{tower.name}</span>
                    <span className="text-xs font-mono text-emerald-400">${tower.cost}</span>

                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-slate-900 p-3 rounded-lg border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
                        <h4 className="font-bold text-slate-200 mb-1">{tower.name}</h4>
                        <p className="text-xs text-slate-400">{tower.description}</p>
                        <div className="mt-2 text-xs flex justify-between text-slate-500">
                           <span>DMG: {tower.damage}</span>
                           <span>RNG: {tower.range}</span>
                        </div>
                    </div>
                </button>
            )
        })}
      </div>
    </div>
  );
};
