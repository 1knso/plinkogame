import React, { useState, useRef, useEffect, useCallback } from 'react';
import PlinkoBoard from './game/PlinkoBoard';
import GachaMenu from './components/gacha/GachaMenu';
import { GACHA_CONFIG } from './logic/constants';

const App = () => {
  const [points, setPoints] = useState(() => {
    const saved = localStorage.getItem('plinko_points');
    return saved ? parseInt(saved, 10) : GACHA_CONFIG.INITIAL_POINTS;
  });
  
  // Estado para los números flotantes de recompensa
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [isShaking, setIsShaking] = useState(false);
  
  const boardRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('plinko_points', points.toString());
  }, [points]);

  // Si el jugador se queda sin puntos, le regalamos para que siga jugando (Adicción)
  useEffect(() => {
    if (points < GACHA_CONFIG.ROLL_COST) {
      setTimeout(() => setPoints(500), 2000);
    }
  }, [points]);

  const handleRoll = () => {
    if (points < GACHA_CONFIG.ROLL_COST) return;
    setPoints((prev) => prev - GACHA_CONFIG.ROLL_COST);
    boardRef.current?.dropBall();
  };

  const handleReward = useCallback((multiplier, xPercent) => {
    const reward = Math.floor(GACHA_CONFIG.ROLL_COST * multiplier);
    setPoints((prev) => prev + reward);
    
    // Si toca premio gordo, hacer temblar la pantalla
    if (multiplier >= 10) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 300);
    }

    // Generar texto flotante
    const id = Date.now() + Math.random();
    setFloatingTexts((prev) => [...prev, { id, reward, xPercent, multiplier }]);

    // Limpiar el texto después de 1 segundo
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((t) => t.id !== id));
    }, 1000);
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-2 font-sans overflow-hidden select-none">
      
      {/* Contenedor principal con Screen Shake condicional */}
      <div className={`relative w-full max-w-xl transition-transform ${isShaking ? 'animate-shake' : ''}`}>
        
        {/* Capa de Físicas */}
        <PlinkoBoard ref={boardRef} onReward={handleReward} />

        {/* Efectos Flotantes de Recompensa */}
        <div className="absolute top-[80%] left-0 w-full h-full pointer-events-none z-20">
          {floatingTexts.map((text) => (
            <div
              key={text.id}
              className="absolute animate-float-up text-3xl md:text-5xl font-black drop-shadow-[0_0_10px_rgba(0,0,0,1)]"
              style={{
                left: `${text.xPercent}%`,
                transform: 'translateX(-50%)',
                color: text.multiplier >= 10 ? '#facc15' : text.multiplier >= 1 ? '#4ade80' : '#f87171'
              }}
            >
              +{text.reward}
            </div>
          ))}
        </div>

        {/* Zonas de Premio (Slots) perfectamente alineados al fondo del canvas */}
        <div className="absolute bottom-0 left-0 w-full flex border-t-4 border-slate-800 z-10">
          {GACHA_CONFIG.MULTIPLIERS.map((mult, i) => {
            const isJackpot = mult >= 10;
            return (
              <div 
                key={i} 
                className={`flex-1 h-14 flex items-center justify-center border-r-2 border-l-2 border-slate-900/50 
                  ${isJackpot ? 'bg-orange-500/20' : 'bg-slate-800/80'}
                  backdrop-blur-sm shadow-inner`}
              >
                <span className={`font-black text-sm md:text-lg drop-shadow-md ${
                  isJackpot ? 'text-yellow-400' : mult >= 1 ? 'text-white' : 'text-slate-500'
                }`}>
                  {mult}x
                </span>
              </div>
            );
          })}
        </div>

        {/* Interfaz Integrada debajo del tablero */}
        <GachaMenu 
          points={points} 
          cost={GACHA_CONFIG.ROLL_COST} 
          onRoll={handleRoll} 
        />
        
      </div>
      
    </main>
  );
};

export default App;
