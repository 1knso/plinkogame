import React, { useState, useRef } from 'react';
import PlinkoBoard from './game/PlinkoBoard'; // Ajusta la ruta según tu estructura
import GachaMenu from './components/gacha/GachaMenu'; // Ajusta la ruta

const ROLL_COST = 100;
const INITIAL_POINTS = 1000;

const App = () => {
  // Estado global de la economía (React)
  const [points, setPoints] = useState(INITIAL_POINTS);
  
  // Referencia imperativa hacia el motor de físicas
  const boardRef = useRef(null);

  // Regla de negocio: Validar fondos, cobrar y ejecutar
  const handleRoll = () => {
    if (points < ROLL_COST) return;
    
    // 1. Lógica de UI/Estado
    setPoints((prev) => prev - ROLL_COST);
    
    // 2. Lógica Imperativa (Motor de físicas)
    // Usamos el encadenamiento opcional (?.) por seguridad
    boardRef.current?.dropBall();
  };

  return (
    <main className="min-h-screen bg-slate-800 flex flex-col items-center justify-center p-4">
      
      {/* Contenedor relativo que apila el juego y la UI */}
      <div className="relative w-full max-w-2xl">
        
        {/* Capa Z-0: El motor de físicas */}
        <PlinkoBoard ref={boardRef} />

        {/* Capa Z-10: La UI Flotante posicionada en la parte inferior */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-10/12 max-w-sm z-10">
          <GachaMenu 
            points={points} 
            cost={ROLL_COST} 
            onRoll={handleRoll} 
          />
        </div>
        
      </div>
      
    </main>
  );
};

export default App;
