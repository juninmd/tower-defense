import React from 'react';
import { ShieldAlert, Play, RotateCw, Zap, Cpu, Check, X } from 'lucide-react';
import { type GameState, GameEngine } from '../game/GameEngine';
import { TOWERS, type TowerType } from '../game/Constants';
import { Tower } from '../game/Tower';
import { soundManager } from '../game/SoundManager';
import { type MapConfig } from '../game/Maps';
import { StartMenu } from './StartMenu';
import { TopBar } from './hud/TopBar';
import { TowerBar } from './hud/TowerBar';
import { TowerPanel } from './hud/TowerPanel';

interface HUDProps {
  gameState: GameState;
  engine: React.MutableRefObject<GameEngine | null> | null;
  selectedTowerType: TowerType | null;
  onSelectTower: (type: TowerType | null) => void;
  selectedTower: Tower | null;
  onSellTower: () => void;
  onDeselect: () => void;
  selectedMap: MapConfig;
  onSelectMap: (map: MapConfig) => void;
  onConfirmPlacement: () => void;
  onCancelPlacement: () => void;
  isPortrait?: boolean;
}

export const HUD: React.FC<HUDProps> = ({
  gameState,
  engine,
  selectedTowerType,
  onSelectTower,
  selectedTower,
  onSellTower,
  onDeselect,
  selectedMap,
  onSelectMap,
  onConfirmPlacement,
  onCancelPlacement,
  isPortrait = false
}) => {
  // Keyboard Shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if Mod Selection or Game Over
      if (gameState.isGameOver || gameState.choosingMod) return;

      switch (e.key) {
        case ' ':
          if (!gameState.gameStarted) {
            engine?.current?.startGame();
          } else if (gameState.waveActive) {
            // Toggle Speed
            const nextSpeed = gameState.speed === 1 ? 2 : gameState.speed === 2 ? 4 : 1;
            engine?.current?.setSpeed(nextSpeed);
          } else {
            engine?.current?.startWave();
          }
          break;
        case 'Escape':
          if (selectedTowerType) {
            onCancelPlacement();
          } else if (selectedTower) {
            onDeselect();
          } else {
            engine?.current?.togglePause();
          }
          break;
        case 'Backspace':
        case 'Delete':
          if (selectedTower) onSellTower();
          break;
        case 'u':
        case 'U':
          if (selectedTower && engine?.current) engine.current.upgradeTower(selectedTower);
          break;
      }

      // Tower Selection 1-0
      const towerKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
      const towerTypes = Object.keys(TOWERS) as TowerType[];
      const idx = towerKeys.indexOf(e.key);
      if (idx !== -1 && idx < towerTypes.length) {
        onSelectTower(towerTypes[idx]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, selectedTower, selectedTowerType, engine, onCancelPlacement, onDeselect, onSellTower, onSelectTower]);

  return (
    <div className={`absolute inset-0 pointer-events-none flex flex-col justify-between font-sans selection:bg-blue-500/30 ${isPortrait ? '' : 'p-4'}`}>
      <TopBar gameState={gameState} engine={engine} isPortrait={isPortrait} />

      {/* Wave Control (Floating) */}
      {!gameState.waveActive && gameState.gameStarted && !gameState.isGameOver && !gameState.isPaused && !gameState.choosingMod && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 pointer-events-auto">
          <button
            onClick={() => engine?.current?.startWave()}
            className="group flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 lg:hover:from-emerald-500 lg:hover:to-teal-500 text-white px-8 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all lg:hover:scale-105 active:scale-95 border border-emerald-400/30"
          >
            <ShieldAlert size={20} className="lg:group-hover:animate-bounce" />
            <span>DEPLOY NEXT WAVE</span>
          </button>
        </div>
      )}

      {selectedTower && !gameState.isGameOver && !gameState.choosingMod && (
        <TowerPanel tower={selectedTower} gameState={gameState} engine={engine} isPortrait={isPortrait} onSell={onSellTower} onClose={onDeselect} />
      )}

      {/* Placement Controls */}
      {selectedTowerType && !gameState.isGameOver && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-8 pointer-events-auto z-30">
          <button
            onClick={onCancelPlacement}
            className="bg-slate-800/80 lg:hover:bg-red-500 text-white p-4 rounded-full shadow-lg border-2 border-slate-600 lg:hover:border-red-400 transition-all backdrop-blur-sm active:scale-95"
          >
            <X size={28} />
          </button>
          <button
            onClick={onConfirmPlacement}
            className="bg-emerald-500 lg:hover:bg-emerald-400 text-white p-4 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)] border-2 border-emerald-300 transition-all lg:hover:scale-110 active:scale-95"
          >
            <Check size={32} />
          </button>
        </div>
      )}

      {/* Special Abilities */}
      {gameState.gameStarted && !gameState.isGameOver && !gameState.choosingMod && !(isPortrait && selectedTower) && (
        <div className="absolute bottom-24 right-4 pointer-events-auto z-20">
          <button
            onClick={() => engine?.current?.activateAbility('ORBITAL_STRIKE')}
            disabled={gameState.money < 500}
            className={`bg-red-600 lg:hover:bg-red-500 text-white p-4 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.4)] border-4 border-red-800 transition-all active:scale-95 flex flex-col items-center gap-1 group relative overflow-hidden ${gameState.money < 500 ? 'opacity-50 grayscale cursor-not-allowed' : 'lg:hover:scale-110'}`}
            title="Orbital Strike ($500)"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            <Zap size={24} fill="currentColor" className={`${gameState.money >= 500 ? 'animate-pulse' : ''}`} />
            <span className="text-[10px] font-black tracking-wider shadow-black drop-shadow-md">NUKE</span>
            <span className="text-[10px] font-mono bg-black/30 px-1 rounded">$500</span>
          </button>
        </div>
      )}

      <TowerBar gameState={gameState} selectedTowerType={selectedTowerType} onSelectTower={onSelectTower} isPortrait={isPortrait} />

      {/* Start Game Overlay */}
      {!gameState.gameStarted && !gameState.isGameOver && (
        <StartMenu
          selectedMap={selectedMap}
          onSelectMap={onSelectMap}
          onStart={() => {
            engine?.current?.startGame();
            soundManager.playShoot('BASIC');
          }}
        />
      )}

      {/* Mod Selection Overlay */}
      {
        gameState.choosingMod && (
          <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center z-50 pointer-events-auto backdrop-blur-md">
            <div className="max-w-4xl w-full px-4">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">SYSTEM UPGRADE AVAILABLE</h2>
                <p className="text-slate-400">Choose a modification to enhance your defenses.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto p-2 no-scrollbar">
                {gameState.modOptions?.map((mod, i) => (
                  <button
                    key={i}
                    onClick={() => engine?.current?.selectMod(mod)}
                    className={`
                                relative group overflow-hidden bg-slate-900 border-2 p-6 rounded-2xl transition-all lg:hover:scale-105 text-left flex flex-col h-64 shadow-2xl
                                ${mod.rarity === 'LEGENDARY' ? 'border-amber-500/50 lg:hover:border-amber-500 shadow-amber-500/10' :
                        mod.rarity === 'RARE' ? 'border-cyan-500/50 lg:hover:border-cyan-500 shadow-cyan-500/10' :
                          'border-slate-600 lg:hover:border-slate-400 shadow-blue-500/5'}
                            `}
                  >
                    <div className={`
                                absolute inset-0 opacity-0 lg:group-hover:opacity-10 transition-opacity
                                ${mod.rarity === 'LEGENDARY' ? 'bg-amber-500' : mod.rarity === 'RARE' ? 'bg-cyan-500' : 'bg-white'}
                            `} />

                    <div className="mb-4">
                      <span className={`
                                    text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded
                                    ${mod.rarity === 'LEGENDARY' ? 'bg-amber-500/20 text-amber-400' :
                          mod.rarity === 'RARE' ? 'bg-cyan-500/20 text-cyan-400' :
                            'bg-slate-700 text-slate-300'}
                                `}>
                        {mod.rarity}
                      </span>
                    </div>

                    <Cpu size={32} className={`mb-4 ${mod.rarity === 'LEGENDARY' ? 'text-amber-400' : mod.rarity === 'RARE' ? 'text-cyan-400' : 'text-slate-200'}`} />

                    <h3 className="text-xl font-bold text-white mb-2 lg:group-hover:text-blue-200 transition-colors">{mod.name}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{mod.description}</p>

                    <div className="mt-auto pt-4 flex items-center gap-2 text-xs font-mono opacity-50">
                      <span>ID: {mod.id.split('_')[0]}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )
      }

      {/* Paused Overlay */}
      {
        gameState.isPaused && !gameState.isGameOver && !gameState.choosingMod && (
          <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center z-40 pointer-events-auto backdrop-blur-sm">
            <div className="bg-slate-900/90 p-8 rounded-2xl border border-slate-700 text-center shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-6 tracking-widest">SYSTEM PAUSED</h2>
              <button
                onClick={() => engine?.current?.togglePause()}
                className="bg-blue-600 lg:hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 mx-auto"
              >
                <Play size={20} fill="currentColor" /> RESUME
              </button>
            </div>
          </div>
        )
      }

      {/* Game Over Overlay */}
      {
        gameState.isGameOver && (
          <div className="absolute inset-0 bg-red-950/90 flex items-center justify-center z-50 pointer-events-auto backdrop-blur-md p-4">
            <div className="bg-slate-900 p-8 sm:p-10 rounded-3xl border-2 border-red-500/50 text-center max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.2)]">
              <h2 className="text-5xl font-black text-red-500 mb-2 tracking-tighter">CRITICAL FAILURE</h2>
              <div className="h-1 w-20 bg-red-500 mx-auto my-6 rounded-full" />
              <p className="text-slate-300 text-xl mb-2">Systems compromised at</p>
              <p className="text-4xl font-bold text-white mb-8">Wave {gameState.wave - 1}</p>

              <button
                onClick={() => window.location.reload()}
                className="w-full bg-slate-800 lg:hover:bg-slate-700 text-white text-lg font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-colors border border-slate-600 lg:hover:border-slate-500"
              >
                <RotateCw size={24} /> REBOOT SYSTEM
              </button>
            </div>
          </div>
        )
      }

      {/* Shortcuts Help */}
      <div className="absolute bottom-4 left-4 pointer-events-none text-[10px] text-slate-500 font-mono hidden sm:block">
        [SPACE] Start/Speed &nbsp; [ESC] Cancel/Pause &nbsp; [1-0] Select Tower &nbsp; [U] Upgrade &nbsp; [BKSP] Sell
      </div>
    </div >
  );
};
