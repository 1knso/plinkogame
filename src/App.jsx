import React, { useState, useRef, useEffect, useCallback } from 'react';
import PlinkoBoard from './game/PlinkoBoard';
import GachaMenu from './components/gacha/GachaMenu';
import UpgradeShop from './components/shop/UpgradeShop';
import { GACHA_CONFIG, UPGRADES } from './logic/constants';

const App = () => {
  // Estado Unificado Persistente
  const [gameState, setGameState] = useState(() => {
    const saved = localStorage.getItem('plinko_save');
    return saved ? JSON.parse(saved) : { points: GACHA_CONFIG.INITIAL_POINTS, ballsDropped: 0, inventory: [] };
  });

  const [activeTab, setActiveTab] = useState('game'); // 'game' o 'shop'
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [isShaking, setIsShaking] = useState(false);
  const [frenzyActive, setFrenzyActive] = useState(false);
  
  const boardRef = useRef(null);

  // Auto-guardado
  useEffect(() => {
    localStorage.setItem('plinko_save', JSON.stringify(gameState));
  }, [gameState]);

  // Lógica del Frenesí
  const triggerFrenzy = useCallback(() => {
    setFrenzyActive(true);
    let count = 0;
    const interval = setInterval(() => {
      boardRef.current?.dropBall({ bouncy: true }); // En frenesí todas botan
      count++;
      if (count >= GACHA_CONFIG.FRENZY_BALLS) {
        clearInterval(interval);
        setTimeout(() => setFrenzyActive(false), 5000); // Apagar luces tras terminar de caer
      }
    }, 150);
  }, []);

  const handleRoll = () => {
    const rollCost = gameState.inventory.includes('cheap_rolls') ? GACHA_CONFIG.ROLL_COST - 20 : GACHA_CONFIG.ROLL_COST;
    if (gameState.points < rollCost || frenzyActive) return;

    setGameState(prev => {
      const nextBalls = prev.ballsDropped + 1;
      if (nextBalls > 0 && nextBalls % GACHA_CONFIG.FRENZY_GOAL === 0) triggerFrenzy();
      return { ...prev, points: prev.points - rollCost, ballsDropped: nextBalls };
    });

    boardRef.current?.dropBall({
      bouncy: gameState.inventory.includes('bouncy_balls'),
      heavy: gameState.inventory.includes('heavy_balls'),
    });
  };

  const handleReward = useCallback((baseMultiplier, xPercent) => {
    setGameState(prev => {
      const bonus = prev.inventory.includes('golden_luck') ? 0.5 : 0;
      const finalMultiplier = baseMultiplier + bonus;
      const rollCost = prev.inventory.includes('cheap_rolls') ? GACHA_CONFIG.ROLL_COST - 20 : GACHA_CONFIG.ROLL_COST;
      const reward = Math.floor(rollCost * finalMultiplier);

      // Efectos visuales de interfaz (Screen Shake)
      if (finalMultiplier >= 10) {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 300);
      }

      // Añadir texto flotante
      const id = Date.now() + Math.random();
      setFloatingTexts(texts => [...texts, { id, reward, xPercent, isJackpot: finalMultiplier >= 10 }]);
      setTimeout(() => setFloatingTexts(texts => texts.filter(t => t.id !== id)), 1000);

      return { ...prev, points: prev.points + reward };
    });
  }, []);

  const handleBuyUpgrade = (cost, upgradeId) => {
    setGameState(prev => ({
      ...prev,
      points: prev.points - cost,
      inventory: prev.inventory.includes(upgradeId) ? prev.inventory : [...prev.inventory, upgradeId]
    }));
  };

  // Calcular progreso de Frenesí
  const frenzyProgress = (gameState.ballsDropped % GACHA_CONFIG.FRENZY_GOAL) / GACHA_CONFIG.FRENZY_GOAL * 100;

  return (
    <main className="h-[100dvh] w-full bg-slate-950 font-sans overflow-hidden select-none flex flex-col relative">
      
      {/* Navegación Superior */}
      <nav className="h-16 w-full flex bg-slate-900 border-b-2 border-slate-800 z-50">
        <button onClick={() => setActiveTab('game')} className={`flex-1 text-center font-black uppercase transition-colors ${activeTab === 'game' ? 'text-yellow-400 bg-slate-800' : 'text-slate-500'}`}>Plinko</button>
        <button onClick={() => setActiveTab('shop')} className={`flex-1 text-center font-black uppercase transition-colors ${activeTab === 'shop' ? 'text-purple-400 bg-slate-800' : 'text-slate-500'}`}>Tienda</button>
      </nav>

      {/* Contenedor Deslizante (Slider de Vistas) */}
      <div className="flex-1 w-[200vw] flex transition-transform duration-500 ease-in-out" style={{ transform: activeTab === 'game' ? 'translateX(0)' : 'translateX(-100vw)' }}>
        
        {/* VISTA 1: EL JUEGO */}
        <section className={`w-[100vw] h-full flex flex-col items-center justify-center p-2 relative ${frenzyActive ? 'animate-frenzy' : ''}`}>
          
          {/* Barra de Frenesí */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-11/12 max-w-md h-6 bg-slate-800 rounded-full border-2 border-slate-700 overflow-hidden z-20 shadow-lg">
            <div className="h-full bg-gradient-to-r from-red-600 to-orange-400 transition-all duration-300" style={{ width: `${frenzyActive ? 100 : frenzyProgress}%` }} />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white drop-shadow-md tracking-widest">
              {frenzyActive ? '¡FRENESÍ!' : `FRENESÍ: ${gameState.ballsDropped % GACHA_CONFIG.FRENZY_GOAL}/${GACHA_CONFIG.FRENZY_GOAL}`}
            </span>
          </div>

          <div className={`relative w-full max-w-xl transition-transform ${isShaking ? 'animate-shake' : ''} mt-8`}>
            <PlinkoBoard ref={boardRef} onReward={handleReward} />

            <div className="absolute top-[80%] left-0 w-full h-full pointer-events-none z-20">
              {floatingTexts.map(text => (
                <div key={text.id} className="absolute animate-float-up text-3xl md:text-5xl font-black drop-shadow-[0_0_10px_rgba(0,0,0,1)]" style={{ left: `${text.xPercent}%`, transform: 'translateX(-50%)', color: text.isJackpot ? '#facc15' : '#4ade80' }}>
                  +{text.reward}
                </div>
              ))}
            </div>

            <div className="absolute bottom-0 left-0 w-full flex border-t-4 border-slate-800 z-10">
              {GACHA_CONFIG.MULTIPLIERS.map((mult, i) => {
                const isJackpot = mult >= 10;
                return (
                  <div key={i} className={`flex-1 h-12 flex items-center justify-center border-r-2 border-l-2 border-slate-900/50 ${isJackpot ? 'bg-orange-500/20' : 'bg-slate-800/80'} backdrop-blur-sm shadow-inner`}>
                    <span className={`font-black text-xs md:text-sm drop-shadow-md ${isJackpot ? 'text-yellow-400' : mult >= 1 ? 'text-white' : 'text-slate-500'}`}>
                      {mult + (gameState.inventory.includes('golden_luck') ? 0.5 : 0)}x
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="-mt-4">
              <GachaMenu points={gameState.points} cost={gameState.inventory.includes('cheap_rolls') ? GACHA_CONFIG.ROLL_COST - 20 : GACHA_CONFIG.ROLL_COST} onRoll={handleRoll} />
            </div>
          </div>
        </section>

        {/* VISTA 2: LA TIENDA */}
        <section className="w-[100vw] h-full overflow-y-auto">
          <UpgradeShop 
            points={gameState.points} 
            inventory={gameState.inventory} 
            onBuy={(cost) => {
              // Obtenemos una id aleatoria para enviar al orquestador
              const keys = Object.keys(UPGRADES);
              const upgradeId = keys[Math.floor(Math.random() * keys.length)];
              handleBuyUpgrade(cost, upgradeId);
            }} 
          />
        </section>

      </div>
    </main>
  );
};

export default App;
