import React, { useState } from 'react';
import { SHOP_CONFIG, UPGRADES } from '../../logic/constants';

const UpgradeShop = ({ points, onBuy, inventory, prestigeLevel, onPrestige }) => {
  const [isRolling, setIsRolling] = useState(false);
  const [revealed, setRevealed] = useState(null);

  const totalUpgrades = Object.keys(UPGRADES).length;
  const hasAllUpgrades = inventory.length >= totalUpgrades;
  const canPrestige = hasAllUpgrades && points >= SHOP_CONFIG.PRESTIGE_COST;

  const handlePull = () => {
    if (points < SHOP_CONFIG.BOX_COST || isRolling || hasAllUpgrades) return;
    setIsRolling(true);
    setRevealed(null);
    onBuy(SHOP_CONFIG.BOX_COST);

    const unownedKeys = Object.keys(UPGRADES).filter(key => !inventory.includes(key));
    const randomKey = unownedKeys[Math.floor(Math.random() * unownedKeys.length)];
    
    setTimeout(() => {
      setRevealed(UPGRADES[randomKey]);
      setIsRolling(false);
    }, 1500);
  };

  return (
    <div className="w-full h-full p-4 flex flex-col bg-slate-950 text-white overflow-y-auto pb-20">
      
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-black uppercase text-purple-400">Black Market</h2>
        <p className="text-slate-400 text-xs">Mejoras actuales: {inventory.length}/{totalUpgrades}</p>
        {prestigeLevel > 0 && (
          <div className="mt-2 text-yellow-400 font-bold text-sm bg-yellow-400/10 py-1 rounded-full border border-yellow-400/20">
            Nivel de Prestigio: {prestigeLevel} (+{prestigeLevel * 20}% Beneficios)
          </div>
        )}
      </div>

      {/* Gacha de Mejoras */}
      <div className="flex-shrink-0 h-48 w-full flex items-center justify-center relative mb-6">
        {isRolling && (
          <div className="w-24 h-24 bg-slate-800 border-2 border-slate-500 rounded-xl animate-gacha-shake flex items-center justify-center">
            <span className="text-4xl">📦</span>
          </div>
        )}
        {revealed && !isRolling && (
          <div className="flex flex-col items-center animate-gacha-reveal z-10" style={{ color: revealed.color }}>
            <span className="text-4xl font-black mb-2">✨</span>
            <h3 className="text-xl font-black uppercase">{revealed.name}</h3>
            <p className="text-slate-300 text-center text-xs px-4">{revealed.desc}</p>
          </div>
        )}
        {!isRolling && !revealed && (
          <div className="w-24 h-24 bg-slate-800 border-2 border-slate-700 rounded-xl flex items-center justify-center opacity-80">
             <span className="text-4xl opacity-50">📦</span>
          </div>
        )}
      </div>

      <button
        onClick={handlePull}
        disabled={points < SHOP_CONFIG.BOX_COST || isRolling || hasAllUpgrades}
        className={`w-full max-w-sm mx-auto py-4 text-lg font-black uppercase rounded-xl transition-all mb-8 ${
          points >= SHOP_CONFIG.BOX_COST && !isRolling && !hasAllUpgrades
            ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_4px_0_rgb(107,33,168)] active:translate-y-1 active:shadow-none'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
        }`}
      >
        {hasAllUpgrades ? 'Agotado' : `Abrir Caja (${SHOP_CONFIG.BOX_COST})`}
      </button>

      {/* Inventario Visible */}
      <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto w-full mb-8">
        {Object.values(UPGRADES).map(upg => {
          const owned = inventory.includes(upg.id);
          return (
            <div key={upg.id} className={`p-3 rounded-lg border-2 flex flex-col items-center text-center transition-all ${owned ? 'border-current bg-slate-900/50' : 'border-slate-800 bg-slate-900 opacity-40 grayscale'}`} style={{ color: owned ? upg.color : '#334155' }}>
              <span className="font-bold text-xs uppercase mb-1">{upg.name}</span>
              <span className="text-[10px] text-slate-400 leading-tight">{upg.desc}</span>
            </div>
          );
        })}
      </div>

      {/* Botón de Prestigio (Mecánica Infinita) */}
      <div className="max-w-sm mx-auto w-full border-t-2 border-slate-800 pt-6 mt-auto">
        <button
          onClick={onPrestige}
          disabled={!canPrestige}
          className={`w-full py-4 text-lg font-black uppercase rounded-xl transition-all ${
            canPrestige
              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-[0_4px_0_rgb(180,83,9)] animate-pulse active:translate-y-1 active:shadow-none'
              : 'bg-slate-900 text-slate-700 border-2 border-slate-800 cursor-not-allowed'
          }`}
        >
          Ascender ({SHOP_CONFIG.PRESTIGE_COST} pts)
        </button>
        <p className="text-center text-[10px] text-slate-500 mt-2">
          Requiere todas las mejoras y {SHOP_CONFIG.PRESTIGE_COST} pts. Reinicia el progreso pero da un bonus global permanente.
        </p>
      </div>

    </div>
  );
};

export default UpgradeShop;
