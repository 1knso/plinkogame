// src/logic/constants.js

export const GACHA_CONFIG = {
  ROLL_COST: 100,
  INITIAL_POINTS: 1000,
  // Zonas de premio: Bordes difíciles (x10), centro fácil (x0.2)
  MULTIPLIERS: [10, 2.5, 0.5, 0.2, 0.5, 2.5, 10] 
};

export const BOARD_CONFIG = {
  width: 800,
  height: 800,
  pegRadius: 8,
  ballRadius: 12,
};
