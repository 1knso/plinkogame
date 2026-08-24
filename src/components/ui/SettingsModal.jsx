import React from 'react';

const SettingsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-black uppercase text-white tracking-wider">Ajustes</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-black text-xl px-2">&times;</button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh] text-slate-300">
          
          <button 
            onClick={toggleFullscreen}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold uppercase rounded-lg shadow-lg active:translate-y-1 transition-all"
          >
            Alternar Pantalla Completa
          </button>

          <div>
            <h3 className="text-lg font-bold text-yellow-400 mb-2 uppercase">¿Cómo se juega?</h3>
            <ul className="space-y-3 text-sm">
              <li><strong className="text-white">1. Tirar Gacha:</strong> Gasta puntos para soltar bolas. Cuentas con multiplicadores que pueden hacerte ganar a lo grande o perder puntos.</li>
              <li><strong className="text-purple-400">2. La Tienda:</strong> Ve a la pestaña Tienda y compra cajas sorpresa para desbloquear físicas nuevas (bolas de goma, plomo, suerte extra).</li>
              <li><strong className="text-orange-400">3. Frenesí:</strong> Cada 100 bolas lanzadas, se activará una lluvia automática. ¡Pura ganancia!</li>
              <li><strong className="text-cyan-400">4. Ascensión:</strong> Si compras todas las mejoras de la tienda y acumulas 50,000 pts, podrás reiniciar el juego con un bono de multiplicador permanente.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
