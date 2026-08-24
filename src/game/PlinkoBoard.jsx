import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import Matter from 'matter-js';
import { BOARD_CONFIG, GACHA_CONFIG } from '../logic/constants';

// ============================================================================
// FUNCIONES PURAS DE FÍSICAS (Aisladas)
// ============================================================================

const createBoundaries = () => {
  const { width, height } = BOARD_CONFIG;
  const options = { isStatic: true, render: { visible: false } };
  return [
    Matter.Bodies.rectangle(width / 2, height + 50, width, 100, options), // Suelo extendido
    Matter.Bodies.rectangle(-25, height / 2, 50, height, options),
    Matter.Bodies.rectangle(width + 25, height / 2, 50, height, options)
  ];
};

const createPegs = (startX, startY, rows, spacing) => {
  const pegs = [];
  for (let row = 0; row < rows; row++) {
    const pegsInRow = row + 3;
    const offsetX = startX - (pegsInRow * spacing) / 2;
    for (let col = 0; col <= pegsInRow; col++) {
      pegs.push(Matter.Bodies.circle(offsetX + col * spacing, startY + row * spacing, BOARD_CONFIG.pegRadius, {
        isStatic: true,
        render: { fillStyle: '#94a3b8' }
      }));
    }
  }
  return pegs;
};

// Crea los sensores invisibles en la parte inferior
const createBuckets = () => {
  const { width, height } = BOARD_CONFIG;
  const { MULTIPLIERS } = GACHA_CONFIG;
  const bucketWidth = width / MULTIPLIERS.length;
  const bodies = [];

  MULTIPLIERS.forEach((mult, index) => {
    const x = (index * bucketWidth) + (bucketWidth / 2);
    const bucket = Matter.Bodies.rectangle(x, height - 30, bucketWidth, 60, {
      isStatic: true,
      isSensor: true, // Atravesable, pero registra colisión
      label: 'bucket',
      multiplier: mult, // Inyectamos el multiplicador al body
      render: { visible: false }
    });
    
    const wall = Matter.Bodies.rectangle(index * bucketWidth, height - 30, 8, 60, {
      isStatic: true,
      render: { fillStyle: '#475569' }
    });
    bodies.push(bucket, wall);
  });
  return bodies;
};

// Configura las colisiones y devuelve la función para el cleanup
const setupCollisions = (engine, onReward) => {
  const handleCollision = (event) => {
    event.pairs.forEach((pair) => {
      const { bodyA, bodyB } = pair;
      const ball = bodyA.label === 'ball' ? bodyA : (bodyB.label === 'ball' ? bodyB : null);
      const bucket = bodyA.label === 'bucket' ? bodyA : (bodyB.label === 'bucket' ? bodyB : null);

      if (ball && bucket) {
        Matter.World.remove(engine.world, ball); // GARBAGE COLLECTION: Elimina la bola
        if (onReward) onReward(bucket.multiplier); // Retorna los datos a React
      }
    });
  };
  
  Matter.Events.on(engine, 'collisionStart', handleCollision);
  return handleCollision;
};

const cleanupEngine = (engine, render, runner, collisionHandler) => {
  Matter.Events.off(engine, 'collisionStart', collisionHandler);
  Matter.Render.stop(render);
  Matter.Runner.stop(runner);
  Matter.World.clear(engine.world);
  Matter.Engine.clear(engine);
};

// ============================================================================
// COMPONENTE DE REACT
// ============================================================================

const PlinkoBoard = forwardRef(({ onReward }, ref) => {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  useImperativeHandle(ref, () => ({
    dropBall: (xOffset = 0) => {
      if (!engineRef.current) return;
      const startX = (BOARD_CONFIG.width / 2) + xOffset + (Math.random() * 2 - 1);
      
      const ball = Matter.Bodies.circle(startX, 40, BOARD_CONFIG.ballRadius, {
        restitution: 0.6,
        friction: 0.001,
        density: 0.04,
        label: 'ball', // Etiqueta obligatoria para el detector de colisiones
        render: { fillStyle: '#fbbf24' } // Color yellow-400
      });
      
      Matter.World.add(engineRef.current.world, ball);
    }
  }));

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = Matter.Engine.create();
    engineRef.current = engine;

    const render = Matter.Render.create({
      canvas: canvasRef.current,
      engine: engine,
      options: { width: BOARD_CONFIG.width, height: BOARD_CONFIG.height, wireframes: false, background: 'transparent' }
    });

    const staticBodies = [...createBoundaries(), ...createPegs(BOARD_CONFIG.width / 2, 120, 11, 55), ...createBuckets()];
    Matter.World.add(engine.world, staticBodies);

    Matter.Runner.run(Matter.Runner.create(), engine);
    Matter.Render.run(render);

    const collisionHandler = setupCollisions(engine, onReward);

    return () => cleanupEngine(engine, render, null, collisionHandler);
  }, [onReward]);

  return (
    <div className="relative w-full max-w-2xl mx-auto aspect-square bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border-4 border-slate-800">
      <canvas ref={canvasRef} className="w-full h-full object-contain" />
    </div>
  );
});

PlinkoBoard.displayName = 'PlinkoBoard';
export default PlinkoBoard;
