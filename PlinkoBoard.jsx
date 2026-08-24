import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import Matter from 'matter-js';

// ============================================================================
// LÓGICA DE FÍSICAS (Funciones Puras - Agnósticas a React)
// ============================================================================

const CONFIG = {
  width: 800,
  height: 800,
  pegRadius: 8,
  ballRadius: 12,
};

// 1. Crea las paredes invisibles y el suelo
const createBoundaries = () => {
  const { width, height } = CONFIG;
  const options = { isStatic: true, render: { visible: false } };
  
  return [
    Matter.Bodies.rectangle(width / 2, height + 25, width, 50, options), // Suelo
    Matter.Bodies.rectangle(-25, height / 2, 50, height, options),       // Pared Izquierda
    Matter.Bodies.rectangle(width + 25, height / 2, 50, height, options) // Pared Derecha
  ];
};

// 2. Crea la pirámide de clavos (Plinko pegs)
const createPegs = (startX, startY, rows, spacing) => {
  const pegs = [];
  for (let row = 0; row < rows; row++) {
    const pegsInRow = row + 3; // Empezamos con 3 clavos en la cima
    const rowWidth = pegsInRow * spacing;
    const offsetX = startX - rowWidth / 2;
    
    for (let col = 0; col <= pegsInRow; col++) {
      const x = offsetX + col * spacing;
      const y = startY + row * spacing;
      
      const peg = Matter.Bodies.circle(x, y, CONFIG.pegRadius, {
        isStatic: true,
        render: { fillStyle: '#94a3b8' } // Color slate-400
      });
      pegs.push(peg);
    }
  }
  return pegs;
};

// 3. Destrucción segura del motor para evitar fugas de memoria
const cleanupEngine = (engine, render, runner) => {
  Matter.Render.stop(render);
  Matter.Runner.stop(runner);
  Matter.World.clear(engine.world);
  Matter.Engine.clear(engine);
  // Al pasar un canvas propio, no necesitamos que Matter.js destruya el elemento del DOM
};

// ============================================================================
// COMPONENTE UI DE REACT
// ============================================================================

const PlinkoBoard = forwardRef((props, ref) => {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  // Exponemos métodos imperativos al componente padre (ej: el botón de "Tirar")
  useImperativeHandle(ref, () => ({
    dropBall: (xOffset = 0) => {
      if (!engineRef.current) return;
      
      // Se suelta la bola cerca del centro, con una pequeña variación para que no caiga recta
      const startX = (CONFIG.width / 2) + xOffset + (Math.random() * 2 - 1);
      
      const ball = Matter.Bodies.circle(startX, 50, CONFIG.ballRadius, {
        restitution: 0.6, // Rebote (bounciness)
        friction: 0.001,
        density: 0.04,
        render: { fillStyle: '#3b82f6' } // Color blue-500
      });
      
      Matter.World.add(engineRef.current.world, ball);
    }
  }));

  useEffect(() => {
    if (!canvasRef.current) return;

    // Inicialización de Matter.js
    const engine = Matter.Engine.create();
    engineRef.current = engine;

    const render = Matter.Render.create({
      canvas: canvasRef.current,
      engine: engine,
      options: {
        width: CONFIG.width,
        height: CONFIG.height,
        wireframes: false, // Desactivar wireframes para ver colores
        background: 'transparent'
      }
    });

    // Poblar el mundo
    const boundaries = createBoundaries();
    const pegs = createPegs(CONFIG.width / 2, 150, 10, 60);
    Matter.World.add(engine.world, [...boundaries, ...pegs]);

    // Arrancar el motor y el renderizador
    const runner = Matter.Runner.create();
    Matter.Render.run(render);
    Matter.Runner.run(runner, engine);

    // Cleanup al desmontar el componente
    return () => cleanupEngine(engine, render, runner);
  }, []);

  return (
    // Contenedor Responsive con Tailwind.
    // El canvas tiene un tamaño lógico (800x800) pero CSS lo ajusta visualmente al 100% del contenedor.
    <div className="relative w-full max-w-2xl mx-auto aspect-square bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border-4 border-slate-800">
      <canvas
        ref={canvasRef}
        width={CONFIG.width}
        height={CONFIG.height}
        className="w-full h-full object-contain"
      />
    </div>
  );
});

PlinkoBoard.displayName = 'PlinkoBoard';

export default PlinkoBoard;
