// src/logic/constants.js

export const GACHA_CONFIG = {
  ROLL_COST: 100,
  INITIAL_POINTS: 1000,
  // Zonas: El centro ahora te hace perder dinero (0.1x). Los bordes son el Jackpot (x25).
  MULTIPLIERS: [25, 4, 0.5, 0.1, 0.5, 4, 25],
  FRENZY_GOAL: 100,
  FRENZY_BALLS: 30,
};

export const BOARD_CONFIG = {
  width: 700,
  height: 700,
  pegRadius: 7, // Clavos ligeramente más pequeños para que la bola caiga más fluida
  ballRadius: 12,
};

export const SHOP_CONFIG = {
  BOX_COST: 5000, 
  PRESTIGE_COST: 50000, // Puntos necesarios para hacer Prestigio
};

export const UPGRADES = {
  bouncy_balls: { id: 'bouncy_balls', name: 'Bolas de Goma', desc: 'Aumenta el rebote (llega más a los bordes).', color: '#a855f7' },
  heavy_balls: { id: 'heavy_balls', name: 'Bolas de Plomo', desc: 'Caen más rápido y evitan atascos.', color: '#3b82f6' },
  golden_luck: { id: 'golden_luck', name: 'Suerte Dorada', desc: 'Todos los multiplicadores base suman +0.5x.', color: '#eab308' },
  cheap_rolls: { id: 'cheap_rolls', name: 'VIP Ticket', desc: 'Tirar te cuesta 20 pts menos siempre.', color: '#ef4444' },
};
