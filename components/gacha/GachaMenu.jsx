import React from 'react';

const GachaMenu = ({ points, onRoll, cost }) => {
  const canRoll = points >= cost;

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl">
      
      <div className="mb-4 text-center">
        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">
          Balance Actual
        </span>
        <h2 className="text-3xl font-black text-black uppercase tracking-tighter">
          {points} <span className="text-lg">PTS</span>
        </h2>
      </div>

      <button
        onClick={onRoll}
        disabled={!canRoll}
        className={`w-full py-4 text-xl font-black uppercase transition-all duration-150 rounded-lg ${
          canRoll
            ? 'bg-yellow-400 hover:bg-yellow-300 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-4 border-black text-black active:translate-y-0 active:shadow-none'
            : 'bg-slate-200 text-slate-400 border-4 border-slate-300 cursor-not-allowed'
        }`}
      >
        Tirar Gacha ({cost} pts)
      </button>

    </div>
  );
};

export default GachaMenu;
