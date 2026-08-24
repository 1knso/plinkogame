import React, { useState, useRef, useEffect, useCallback } from 'react';
import PlinkoBoard from './game/PlinkoBoard';
import GachaMenu from './components/gacha/GachaMenu';
import UpgradeShop from './components/shop/UpgradeShop';
import SettingsModal from './components/ui/SettingsModal';
import { GACHA_CONFIG, UPGRADES } from './logic/constants';

const App = () => {
  const [gameState, setGameState] = useState(() => {
    const saved = localStorage.getItem('plinko_save');
    return saved ? JSON.parse(saved) : { points: GACHA_CONFIG.INITIAL_POINTS, ballsDropped: 0, inventory: [], prestige: 0 };
  });

  const [activeTab, setActiveTab] = useState('game');
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [activeFlashes, setActiveFlashes] = useState({});
  const [isShaking, setIsShaking] = useState(false);
  const [frenzyActive, setFrenzyActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const boardRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('plinko_save', JSON.stringify(gameState));
  }, [gameState]);

  // Antiatasco pasivo
  useEffect(() => {
    if (gameState.points < (GACHA_CONFIG.ROLL_COST - 20) && !frenzyActive) {
      const timeout = setTimeout(() => {
        setGameState(prev => ({ ...prev, points: prev.points + 200 }));
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [gameState.points, frenzyActive]);

  const triggerFrenzy = useCallback(() => {
    setFrenzyActive(true);
    let count = 0;
    const interval = setInterval(() => {
      boardRef.current?.dropBall({ bouncy: true });
      count++;
      if (count >= GACHA_CONFIG.FRENZY_BALLS) {
        clearInterval(interval);
        setTimeout(() => setFrenzyActive(false), 5000);
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

  const handleReward = useCallback((baseMultiplier, xPercent, bucketIndex) => {
    setGameState(prev => {
      const upgradeBonus = prev.inventory.includes('golden_luck') ? 0.5 : 0;
      const prestigeBonus = 1 + (prev.prestige * 0.2); 
      const finalMultiplier = (baseMultiplier + upgradeBonus) * prestigeBonus;
      
      const rollCost = prev.inventory.includes('cheap_rolls') ? GACHA_CONFIG.ROLL_COST - 20 : GACHA_CONFIG.ROLL_COST;
      const reward = Math.floor(rollCost * finalMultiplier);
      const isJackpot = baseMultiplier >= 10;

      // Efecto Shake global
      if (isJackpot) {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 300);
      }

      // Efecto Destello (Flash) del cubo específico
      setActiveFlashes(prev => ({ ...prev, [bucketIndex]: isJackpot ? 'jackpot' : 'normal' }));
      setTimeout(() => setActiveFlashes(prev => ({ ...prev, [bucketIndex]: null })), 200);

      // Texto Flotante
      const id = Date.now() + Math.random();
      setFloatingTexts(texts => [...texts, { id, reward, xPercent, isJackpot }]);
      setTimeout(() => setFloatingTexts(texts => texts.filter(t => t.id !== id)), 1200);

      return { ...prev, points: prev.points + reward };
    });
  }, []);

  const handleBuyUpgrade = (cost, upgradeId) => {
    setGameState(prev => ({
      ...prev, points: prev.points - cost, inventory: [...prev.inventory, upgradeId]
    }));
  };

  const handlePrestige = () => {
    setGameState(prev => ({
      points: GACHA_CONFIG.INITIAL_POINTS, ballsDropped: 0, inventory: [], prestige: prev.prestige + 1
    }));
    setActiveTab('game');
  };

  const frenzyProgress = (gameState.ballsDropped % GACHA_CONFIG.FRENZY_GOAL) / GACHA_CONFIG.FRENZY_GOAL * 100;

  return (
    <main className="h-[100dvh] w-full bg-slate-950 font-sans overflow-hidden select-none flex flex-col relative text-white">
      
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      <nav className="flex-shrink-0 h-14 w-full flex bg-slate-900 border-b-2 border-slate-800 z-50">
        <button onClick={() => setActiveTab('game')} className={`flex-1 text-sm font-black uppercase transition-colors ${activeTab === 'game' ? 'text-yellow-400 bg-slate-800' : 'text-slate-500'}`}>Plinko</button>
        <button onClick={() => setActiveTab('shop')} className={`flex-1 text-sm font-black uppercase transition-colors ${activeTab === 'shop' ? 'text-purple-400 bg-slate-800' : 'text-slate-500'}`}>Tienda</button>
        <button onClick={() => setShowSettings(true)} className="w-14 flex items-center justify-center text-slate-400 hover:text-white bg-slate-800/50 border-l border-slate-800 transition-colors">
          ⚙️
        </button>
      </nav>

      <div className="flex-1 w-[200vw] flex transition-transform duration-500 ease-in-out min-h-0" style={{ transform: activeTab === 'game' ? 'translateX(0)' : 'translateX(-100vw)' }}>
        
        {/* VISTA JUEGO */}
        <section className={`w-[100vw] h-full flex flex-col items-center justify-between p-2 pb-6 relative ${frenzyActive ? 'animate-frenzy' : ''}`}>
          
          <div className="flex-shrink-0 w-full max-w-md h-4 bg-slate-800 rounded-full border border-slate-700 overflow-hidden mb-2 mt-2">
            <div className="h-full bg-gradient-to-r from-red-600 to-orange-400 transition-all duration-300" style={{ width: `${frenzyActive ? 100 : frenzyProgress}%` }} />
          </div>

          <div className={`flex-1 min-h-0 w-full max-w-lg flex flex-col justify-end relative transition-transform ${isShaking ? 'animate-shake' : ''}`}>
            
            <div className="absolute top-[50%] left-0 w-full h-full pointer-events-none z-20 overflow-visible">
              {floatingTexts.map(text => (
                <div key={text.id} className="absolute animate-float-pop text-3xl font-black drop-shadow-[0_0_8px_rgba(0,0,0,1)]" style={{ left: `${text.xPercent}%`, color: text.isJackpot ? '#facc15' : '#4ade80' }}>
                  +{text.reward}
                </div>
              ))}
            </div>

            <PlinkoBoard ref={boardRef} onReward={handleReward} />

            <div className="flex-shrink-0 flex border-t-4 border-slate-800 w-full mb-4 relative overflow-hidden rounded-b-xl">
              {GACHA_CONFIG.MULTIPLIERS.map((mult, i) => {
                const isJackpot = mult >= 10;
                const flashClass = activeFlashes[i] === 'jackpot' ? 'bucket-flash-jackpot' : activeFlashes[i] === 'normal' ? 'bucket-flash-normal' : '';
                
                return (
                  <div key={i} className={`flex-1 h-12 flex items-center justify-center border-r border-l border-slate-900/50 transition-all duration-75 ${isJackpot ? 'bg-orange-500/20' : 'bg-slate-800/80'} ${flashClass}`}>
                    <span className={`font-black text-[10px] md:text-sm drop-shadow-md z-10 ${isJackpot ? 'text-yellow-400' : mult >= 1 ? 'text-white' : 'text-slate-500'}`}>
                      {mult}x
                    </span>
                  </div>
                );
              })}
            </div>

          </div>

          <div className="flex-shrink-0 w-full max-w-sm">
            <GachaMenu points={gameState.points} cost={gameState.inventory.includes('cheap_rolls') ? GACHA_CONFIG.ROLL_COST - 20 : GACHA_CONFIG.ROLL_COST} onRoll={handleRoll} />
          </div>
        </section>

        {/* VISTA TIENDA */}
        <section className="w-[100vw] h-full overflow-hidden">
          <UpgradeShop 
            points={gameState.points} 
            inventory={gameState.inventory} 
            prestigeLevel={gameState.prestige}
            onPrestige={handlePrestige}
            onBuy={(cost) => {
              const unownedKeys = Object.keys(UPGRADES).filter(k => !gameState.inventory.includes(k));
              const upgradeId = unownedKeys[Math.floor(Math.random() * unownedKeys.length)];
              handleBuyUpgrade(cost, upgradeId);
            }} 
          />
        </section>

      </div>
    </main>
  );
};

export default App;
