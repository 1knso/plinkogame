import React, { useState } from 'react';
import { SHOP_CONFIG, UPGRADES } from '../../logic/constants';

const UpgradeShop = ({ points, onBuy, inventory }) => {
  const [isRolling, setIsRolling] = useState(false);
  const [revealed, setRevealed] = useState(null);

  const handlePull = () => {
    if (points < SHOP_CONFIG.BOX_COST || isRolling) return;
    setIsRolling(true);
    setRevealed(null);
    onBuy(SHOP_CONFIG.BOX_COST);

    // Seleccionar mejora aleatoria que no se tenga (o repetida si las tiene todas)
    const upgradeKeys = Object.keys(UPGRADES);
    const randomKey = upgradeKeys[Math.floor(Math.random() * upgradeKeys.length)];
    const wonUpgrade = UPGRADES[randomKey];

    // Simular tiempo de animación de la caja (1.5s)
    setTimeout(() => {
      setRevealed(wonUpgrade);
      setIsRolling(false);
    }, 1500);
  };

  return (
    <div className="w-full h-full p-6 flex flex-col items-center justify-center bg-slate-900 text-white overflow-hidden">
      
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-black uppercase tracking-widest text-yellow-400 drop-shadow-md">Black Market</h2>
        <p className="text-slate-400 text-sm mt-2">Desbloquea habilidades permanentes</p>
      </div>

      {/* Zona Central: La Caja o la Recompensa */}
      <div className="h-64 w-full flex items-center justify-center relative">
        {isRolling && (
          <div className="w-32 h-32 bg-slate-700 border-4 border-slate-500 rounded-2xl animate-gacha-shake flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.2)]">
            <span className="text-4xl">📦</span>
          </div>
        )}

        {revealed && !isRolling && (
          <div className="flex flex-col items-center animate-gacha-reveal z-10" style={{ color: revealed.color }}>
            <div className="w-24 h-24 rounded-full border-4 flex items-center justify-center mb-4 bg-slate-800 shadow-[0_0_40px_currentColor]">
              <span className="text-4xl font-black">✨</span>
            </div>
            <h3 className="text-2xl font-black uppercase drop-shadow-md">{revealed.name}</h3>
            <p className="text-slate-300 text-center text-sm px-8 mt-2">{revealed.desc}</p>
          </div>
        )}

        {!isRolling && !revealed && (
          <div className="w-32 h-32 bg-slate-800 border-4 border-slate-600 rounded-2xl flex items-center justify-center opacity-80">
             <span className="text-4xl opacity-50">📦</span>
          </div>
        )}
      </div>

      {/* Botón de Compra */}
      <div className="mt-10 w-full max-w-xs">
        <button
          onClick={handlePull}
          disabled={points < SHOP_CONFIG.BOX_COST || isRolling}
          className={`relative w-full py-5 text-xl font-black uppercase transition-all duration-100 rounded-xl overflow-hidden ${
            points >= SHOP_CONFIG.BOX_COST && !isRolling
              ? 'bg-gradient-to-t from-purple-700 to-fuchsia-500 text-white shadow-[0_6px_0_rgb(126,34,206)] hover:translate-y-1 hover:shadow-[0_2px_0_rgb(126,34,206)] active:translate-y-2 active:shadow-none'
              : 'bg-slate-800 text-slate-500 shadow-[0_6px_0_rgb(30,41,59)] cursor-not-allowed'
          }`}
        >
          <span className="relative z-10">Abrir ({SHOP_CONFIG.BOX_COST} PTS)</span>
        </button>
      </div>

      {/* Inventario visual rápido */}
      <div className="mt-8 flex gap-2">
        {Object.values(UPGRADES).map(upg => (
          <div key={upg.id} className={`w-3 h-3 rounded-full ${inventory.includes(upg.id) ? 'shadow-[0_0_10px_currentColor]' : 'bg-slate-800'}`} style={{ backgroundColor: inventory.includes(upg.id) ? upg.color : '' }} />
        ))}
      </div>
    </div>
  );
};

export default UpgradeShop;
