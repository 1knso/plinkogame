import React, { useState, useRef, useEffect, useCallback } from 'react';
import PlinkoBoard from './game/PlinkoBoard';
import GachaMenu from './components/gacha/GachaMenu';
import { GACHA_CONFIG } from './logic/constants';

const App = () => {
  // Inicialización perezosa (Lazy) desde localStorage para persistir en Vercel
  const [points, setPoints] = useState(() => {
    const saved = localStorage.getItem('plinko_points');
    return saved ? parseInt(saved, 10) : GACHA_CONFIG.INITIAL_POINTS;
  });
  
  const boardRef = useRef(null);

  // Guardar en localStorage cada vez que los puntos cambien
  useEffect(() => {
    localStorage.setItem('plinko_points', points.toString());
  }, [points]);

  const handleRoll = () => {
    if (points < GACHA_CONFIG.ROLL_COST) return;
    setPoints((prev) => prev - GACHA_CONFIG.ROLL_COST);
    boardRef.current?.dropBall();
  };

  // useCallback evita que React re-cree esta función en cada render, 
  // previniendo que el useEffect del PlinkoBoard reinicie las físicas.
  const handleReward = useCallback((multiplier) => {
    const reward = Math.floor(GACHA_CONFIG.ROLL_COST * multiplier);
    setPoints((prev) => prev + reward);
  }, []);

  return (
    <main className="min-h-screen bg-slate-800 flex flex-col items-center justify-center p-4">
      
      <div className="relative w-full max-w-2xl">
        
        {/* Capa de Físicas */}
        <PlinkoBoard ref={boardRef} onReward={handleReward} />

        {/* Capa de Recompensas (UI sobre el Canvas) */}
        <div className="absolute bottom-0 left-0 w-full h-[60px] flex">
          {GACHA_CONFIG.MULTIPLIERS.map((mult, i) => (
            <div 
              key={i} 
              className="flex-1 flex items-center justify-center border-l-2 border-r-2 border-slate-700/50 bg-slate-800/40"
            >
              <span className={`font-black text-sm md:text-lg ${
                mult >= 5 ? 'text-yellow-400' : mult >= 1 ? 'text-white' : 'text-slate-500'
              }`}>
                x{mult}
              </span>
            </div>
          ))}
        </div>

        {/* Menú de Interacción */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-10/12 max-w-sm z-10">
          <GachaMenu 
            points={points} 
            cost={GACHA_CONFIG.ROLL_COST} 
            onRoll={handleRoll} 
          />
        </div>
        
      </div>
      
    </main>
  );
};

export default App;
