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
    isGameOver: false,
    isPaused: false,
    timeScale: 1
  });

  const [selectedTower, setSelectedTower] = useState<string | null>(null);
  const [selectedMapTowerPos, setSelectedMapTowerPos] = useState<{x: number, y: number} | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Set Canvas Size
    canvasRef.current.width = CANVAS_WIDTH;
    canvasRef.current.height = CANVAS_HEIGHT;

    const engine = new GameEngine(canvasRef.current, (state) => {
      // Avoid excessive re-renders by checking specific changes if needed, but simple merge is fine for now
      setGameState(s => ({ ...s, ...state, isPaused: engine.isPaused, timeScale: engine.timeScale }));
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

    if (selectedTower) {
        // Build mode
        const success = engineRef.current.buildTower(gridX, gridY, selectedTower);
        if (success) {
            // Deselect after build? Or keep selected for multi-build. Let's keep for multi-build but clear map selection.
            setSelectedMapTowerPos(null);
        }
    } else {
        // Select mode
        // Check if there is a tower here
        // Simple distance check logic is inside engine usually, but we can iterate roughly
        // Better to ask engine "is there a tower at gridX, gridY?"
        // Since we don't have that method, let's implement a rough check or add method to engine.
        // Actually we can just keep track of map position.
        setSelectedMapTowerPos({ x: gridX, y: gridY });
        // Ideally we should visually indicate selection on map
    }
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
            isGameOver: false,
            isPaused: false,
            timeScale: 1
         });
     }
  };

  const handleTogglePause = () => {
      if (engineRef.current) {
          engineRef.current.isPaused = !engineRef.current.isPaused;
          setGameState(s => ({ ...s, isPaused: engineRef.current!.isPaused }));
      }
  };

  const handleToggleSpeed = () => {
      if (engineRef.current) {
          engineRef.current.timeScale = engineRef.current.timeScale === 1 ? 2 : 1;
          setGameState(s => ({ ...s, timeScale: engineRef.current!.timeScale }));
      }
  };

  const handleSell = () => {
      if (engineRef.current && selectedMapTowerPos) {
          if (engineRef.current.sellTower(selectedMapTowerPos.x, selectedMapTowerPos.y)) {
              setSelectedMapTowerPos(null);
          }
      }
  };

  return (
    <div className="w-full h-screen bg-slate-900 flex items-center justify-center overflow-hidden relative p-4">
      <div
        className="relative shadow-2xl rounded-xl overflow-hidden border border-slate-700 bg-slate-800"
        style={{ width: '100%', maxWidth: CANVAS_WIDTH, aspectRatio: `${CANVAS_WIDTH}/${CANVAS_HEIGHT}` }}
      >
        <canvas
          ref={canvasRef}
          className="cursor-crosshair block w-full h-full"
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onClick={handleCanvasClick}
        />

        <GameHUD
            money={gameState.money}
            lives={gameState.lives}
            wave={gameState.wave}
            isGameOver={gameState.isGameOver}
            isPaused={gameState.isPaused}
            timeScale={gameState.timeScale}
            selectedTower={selectedTower}
            hasSelectedTowerOnMap={!!selectedMapTowerPos}
            onSelectTower={(t) => {
                setSelectedTower(t);
                setSelectedMapTowerPos(null); // Clear map selection when picking tool
            }}
            onRestart={handleRestart}
            onTogglePause={handleTogglePause}
            onToggleSpeed={handleToggleSpeed}
            onSellTower={handleSell}
        />
      </div>
    </div>
  );
}

export default App;
