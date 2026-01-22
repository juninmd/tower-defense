import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './game/GameEngine';
import { GameHUD } from './components/GameHUD';
import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE, INITIAL_MONEY, INITIAL_LIVES } from './game/constants';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState({
    money: INITIAL_MONEY,
    lives: INITIAL_LIVES,
    wave: 1,
    isGameOver: false
  });

  const [selectedTower, setSelectedTower] = useState('BASIC');

  useEffect(() => {
    if (!canvasRef.current) return;

    // Set Canvas Size
    canvasRef.current.width = CANVAS_WIDTH;
    canvasRef.current.height = CANVAS_HEIGHT;

    const engine = new GameEngine(canvasRef.current, (state) => {
      setGameState(s => ({ ...s, ...state }));
    });

    engineRef.current = engine;

    return () => {
      engine.stop();
    };
  }, []);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!engineRef.current || !canvasRef.current) return;
    if (gameState.isGameOver) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert to Grid
    const gridX = Math.floor(x / TILE_SIZE);
    const gridY = Math.floor(y / TILE_SIZE);

    engineRef.current.buildTower(gridX, gridY, selectedTower);
  };

  const handleRestart = () => {
     if (engineRef.current && canvasRef.current) {
         engineRef.current.stop();

         const engine = new GameEngine(canvasRef.current!, (state) => {
            setGameState(s => ({ ...s, ...state }));
         });
         engineRef.current = engine;
         setGameState({
            money: INITIAL_MONEY,
            lives: INITIAL_LIVES,
            wave: 1,
            isGameOver: false
         });
     }
  };

  return (
    <div className="w-full h-screen bg-slate-950 flex items-center justify-center overflow-hidden relative">
      <div className="relative shadow-2xl rounded-xl overflow-hidden border border-slate-800 bg-black">
        <canvas
          ref={canvasRef}
          className="cursor-crosshair block"
          style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
          onClick={handleCanvasClick}
        />

        <GameHUD
            money={gameState.money}
            lives={gameState.lives}
            wave={gameState.wave}
            isGameOver={gameState.isGameOver}
            selectedTower={selectedTower}
            onSelectTower={setSelectedTower}
            onRestart={handleRestart}
        />
      </div>

      {/* Background Ambience */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/50 via-slate-950 to-black pointer-events-none"></div>
    </div>
  );
}

export default App;
