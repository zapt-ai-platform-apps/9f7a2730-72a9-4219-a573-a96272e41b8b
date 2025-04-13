import { createValidator } from '@/modules/core/validators';

/**
 * Schema for simulation input data
 */
export const simulationInputSchema = {
  teamAName: { type: 'string', required: true },
  teamBName: { type: 'string', required: true },
  scoresA: { type: 'array', required: true },
  scoresB: { type: 'array', required: true },
  h2hScores: { type: 'array', required: false },
  isHomeTeamA: { type: 'boolean', required: true },
  isHomeTeamB: { type: 'boolean', required: true },
  matchType: { type: 'string', required: true },
  alpha: { type: 'number', required: true },
  iterations: { type: 'number', required: true },
  rankA: { type: 'number', required: false },
  rankB: { type: 'number', required: false },
  competitionType: { type: 'string', required: false },
  isKnockoutStage: { type: 'boolean', required: false }
};

/**
 * Schema for simulation results
 */
export const simulationResultSchema = {
  teamAName: { type: 'string', required: true },
  teamBName: { type: 'string', required: true },
  matchSettings: { type: 'object', required: true },
  resultatsHT: { type: 'object', required: true },
  resultatsFT: { type: 'object', required: true },
  couponParis: { type: 'array', required: true },
  couponParis75: { type: 'array', required: true },
  date: { type: 'string', required: true }
};

/**
 * Schema for access code validation
 */
export const accessCodeSchema = {
  code: { type: 'string', required: true }
};

/**
 * Validators
 */
export const validateSimulationInput = createValidator(
  simulationInputSchema, 
  'SimulationInput'
);

export const validateSimulationResult = createValidator(
  simulationResultSchema, 
  'SimulationResult'
);

export const validateAccessCode = createValidator(
  accessCodeSchema,
  'AccessCode'
);