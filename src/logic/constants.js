// src/logic/constants.js

export const GACHA_CONFIG = {
  ROLL_COST: 100,
  INITIAL_POINTS: 1000,
  MULTIPLIERS: [20, 3, 0.5, 0.2, 0.5, 3, 20],
  FRENZY_GOAL: 100, // Bolas necesarias para el Frenesí
  FRENZY_BALLS: 30, // Bolas que caen de golpe en el Frenesí
};

export const BOARD_CONFIG = {
  width: 700,
  height: 700,
  pegRadius: 8,
  ballRadius: 13,
};

export const SHOP_CONFIG = {
  BOX_COST: 4000, // Coste de tirar en el Gacha de mejoras
};

// Catálogo de mejoras que el jugador puede desbloquear
export const UPGRADES = {
  bouncy_balls: { id: 'bouncy_balls', name: 'Bolas Saltarinas', desc: 'Las bolas rebotan mucho más.', color: '#a855f7' },
  heavy_balls: { id: 'heavy_balls', name: 'Bolas de Plomo', desc: 'Caen rápido y con precisión.', color: '#3b82f6' },
  golden_luck: { id: 'golden_luck', name: 'Suerte Dorada', desc: 'Todos los premios suman +0.5x.', color: '#eab308' },
  cheap_rolls: { id: 'cheap_rolls', name: 'VIP Ticket', desc: 'Tirar cuesta 20 pts menos.', color: '#ef4444' },
};
