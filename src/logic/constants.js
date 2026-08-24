export const GACHA_CONFIG = {
  ROLL_COST: 100,
  INITIAL_POINTS: 1000,
  // Hacemos el premio máximo más jugoso (x20) para generar euforia
  MULTIPLIERS: [20, 3, 0.5, 0.2, 0.5, 3, 20] 
};

export const BOARD_CONFIG = {
  width: 700, // Ajustado para ser divisible exactamente por 7
  height: 700,
  pegRadius: 8,
  ballRadius: 13, // Bola un poco más grande y pesada
};
