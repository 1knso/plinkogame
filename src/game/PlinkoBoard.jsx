import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import Matter from 'matter-js';
import { BOARD_CONFIG, GACHA_CONFIG } from '../logic/constants';

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
        restitution: 0.3, // Rebote de los clavos más bajo para evitar dispersión extrema
        friction: 0.05,
        render: { fillStyle: '#cbd5e1' }
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
    const bucket = Matter.Bodies.rectangle(x, height - 20, bucketWidth, 40, {
      isStatic: true, isSensor: true, label: 'bucket', multiplier: mult, render: { visible: false }
    });
    const wall = Matter.Bodies.rectangle(index * bucketWidth, height - 30, 4, 60, {
      isStatic: true, render: { fillStyle: '#334155' }
    });
    bodies.push(bucket, wall);
  });
  return bodies;
};

const PlinkoBoard = forwardRef(({ onReward }, ref) => {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  useImperativeHandle(ref, () => ({
    dropBall: (options = {}) => {
      if (!engineRef.current) return;
      
      // La bola cae EXACTAMENTE en el centro para respetar la probabilidad de la campana de Gauss
      const startX = BOARD_CONFIG.width / 2 + (Math.random() * 2 - 1); 
      
      const restitution = options.bouncy ? 0.9 : 0.4;
      const density = options.heavy ? 0.2 : 0.05;
      const fillStyle = options.heavy ? '#3b82f6' : (options.bouncy ? '#a855f7' : '#facc15');

      const ball = Matter.Bodies.circle(startX, 20, BOARD_CONFIG.ballRadius, {
        restitution, friction: 0.001, density, label: 'ball', render: { fillStyle }
      });
      Matter.World.add(engineRef.current.world, ball);
    }
  }));

  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = Matter.Engine.create();
    engine.world.gravity.y = 1.2; 
    engineRef.current = engine;

    const render = Matter.Render.create({
      canvas: canvasRef.current, engine,
      options: { width: BOARD_CONFIG.width, height: BOARD_CONFIG.height, wireframes: false, background: 'transparent' }
    });

    // Añadidas 14 filas para hacer más difícil llegar a los extremos
    const staticBodies = [...createBoundaries(), ...createPegs(BOARD_CONFIG.width / 2, 80, 14, 42), ...createBuckets()];
    Matter.World.add(engine.world, staticBodies);

    Matter.Runner.run(Matter.Runner.create(), engine);
    Matter.Render.run(render);

    const handleCollision = (event) => {
      event.pairs.forEach(({ bodyA, bodyB }) => {
        const ball = bodyA.label === 'ball' ? bodyA : (bodyB.label === 'ball' ? bodyB : null);
        const bucket = bodyA.label === 'bucket' ? bodyA : (bodyB.label === 'bucket' ? bodyB : null);

        if (ball && bucket) {
          Matter.World.remove(engine.world, ball);
          if (onReward) onReward(bucket.multiplier, (bucket.position.x / BOARD_CONFIG.width) * 100);
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
    <div className="relative w-full h-full max-h-[60vh] aspect-square mx-auto bg-slate-900 rounded-t-2xl border-t-4 border-l-4 border-r-4 border-slate-700 shadow-2xl overflow-hidden flex items-end">
      <canvas ref={canvasRef} className="w-full h-full object-contain object-bottom" />
    </div>
  );
});

PlinkoBoard.displayName = 'PlinkoBoard';
export default PlinkoBoard;
