import React from 'react';

const GachaMenu = ({ points, onRoll, cost }) => {
  const canRoll = points >= cost;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-800 border-b-8 border-l-8 border-r-8 border-slate-700 rounded-b-3xl shadow-2xl w-full mx-auto">
      
      <div className="mb-4 text-center">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Balance Total
        </span>
        <h2 className="text-4xl font-black text-white drop-shadow-md">
          {points.toLocaleString()} <span className="text-xl text-yellow-400">PTS</span>
        </h2>
      </div>

      <button
        onClick={onRoll}
        disabled={!canRoll}
        className={`relative w-full max-w-xs py-5 text-2xl font-black uppercase transition-all duration-100 rounded-xl overflow-hidden ${
          canRoll
            ? 'bg-gradient-to-t from-orange-600 to-yellow-400 text-white shadow-[0_6px_0_rgb(194,65,12)] hover:translate-y-1 hover:shadow-[0_2px_0_rgb(194,65,12)] active:translate-y-2 active:shadow-none'
            : 'bg-slate-700 text-slate-500 shadow-[0_6px_0_rgb(51,65,85)] cursor-not-allowed'
        }`}
      >
        <span className="relative z-10 drop-shadow-md">DROP ({cost})</span>
        {/* Brillo interno del botón */}
        {canRoll && <div className="absolute inset-0 bg-white opacity-20 hover:opacity-0 transition-opacity rounded-xl"></div>}
      </button>
      
    </div>
  );
};

export default GachaMenu;
