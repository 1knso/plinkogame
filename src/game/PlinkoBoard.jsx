import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import Matter from 'matter-js';
import { BOARD_CONFIG, GACHA_CONFIG } from '../logic/constants';

// Funciones puras extraídas para evitar espagueti
const createBoundaries = () => {
  const { width, height } = BOARD_CONFIG;
  const options = { isStatic: true, render: { visible: false } };
  return [
    Matter.Bodies.rectangle(width / 2, height + 50, width, 100, options),
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
        restitution: 0.5,
        render: { fillStyle: '#cbd5e1' } // Color más brillante
      }));
    }
  }
  return pegs;
};

const createBuckets = () => {
  const { width, height } = BOARD_CONFIG;
  const bucketWidth = width / GACHA_CONFIG.MULTIPLIERS.length;
  const bodies = [];

  GACHA_CONFIG.MULTIPLIERS.forEach((mult, index) => {
    const x = (index * bucketWidth) + (bucketWidth / 2);
    // Sensor que detecta la bola
    const bucket = Matter.Bodies.rectangle(x, height - 20, bucketWidth, 40, {
      isStatic: true,
      isSensor: true,
      label: 'bucket',
      multiplier: mult,
      render: { visible: false }
    });
    // Paredes físicas de los botes
    const wall = Matter.Bodies.rectangle(index * bucketWidth, height - 30, 6, 60, {
      isStatic: true,
      render: { fillStyle: '#334155' }
    });
    bodies.push(bucket, wall);
  });
  return bodies;
};

const PlinkoBoard = forwardRef(({ onReward }, ref) => {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  useImperativeHandle(ref, () => ({
    dropBall: (xOffset = 0) => {
      if (!engineRef.current) return;
      const startX = (BOARD_CONFIG.width / 2) + xOffset + (Math.random() * 10 - 5);
      
      const ball = Matter.Bodies.circle(startX, 20, BOARD_CONFIG.ballRadius, {
        restitution: 0.8, // Rebote más frenético
        friction: 0.005,
        density: 0.05,
        label: 'ball',
        render: { fillStyle: '#facc15' } // Amarillo neón
      });
      
      Matter.World.add(engineRef.current.world, ball);
    }
  }));

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = Matter.Engine.create();
    // Gravedad ligeramente ajustada para que caiga con más "peso"
    engine.world.gravity.y = 1.2; 
    engineRef.current = engine;

    const render = Matter.Render.create({
      canvas: canvasRef.current,
      engine: engine,
      options: { 
        width: BOARD_CONFIG.width, 
        height: BOARD_CONFIG.height, 
        wireframes: false, 
        background: 'transparent' 
      }
    });

    const staticBodies = [
      ...createBoundaries(), 
      ...createPegs(BOARD_CONFIG.width / 2, 100, 12, 48), // Clavos más juntos y más filas
      ...createBuckets()
    ];
    Matter.World.add(engine.world, staticBodies);

    Matter.Runner.run(Matter.Runner.create(), engine);
    Matter.Render.run(render);

    const handleCollision = (event) => {
      event.pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;
        const ball = bodyA.label === 'ball' ? bodyA : (bodyB.label === 'ball' ? bodyB : null);
        const bucket = bodyA.label === 'bucket' ? bodyA : (bodyB.label === 'bucket' ? bodyB : null);

        if (ball && bucket) {
          Matter.World.remove(engine.world, ball);
          if (onReward) {
            // Pasamos el multiplicador y el punto X exacto en porcentaje
            const xPercent = (bucket.position.x / BOARD_CONFIG.width) * 100;
            onReward(bucket.multiplier, xPercent);
          }
        }
      });
    };

    Matter.Events.on(engine, 'collisionStart', handleCollision);

    return () => {
      Matter.Events.off(engine, 'collisionStart', handleCollision);
      Matter.Render.stop(render);
      Matter.World.clear(engine.world);
      Matter.Engine.clear(engine);
    };
  }, [onReward]);

  return (
    <div className="relative w-full max-w-2xl mx-auto aspect-square bg-slate-900 rounded-t-3xl border-t-8 border-l-8 border-r-8 border-slate-700 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full object-contain" />
    </div>
  );
});

PlinkoBoard.displayName = 'PlinkoBoard';
export default PlinkoBoard;
