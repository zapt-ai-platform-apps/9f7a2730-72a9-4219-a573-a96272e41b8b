import { z } from 'zod';
import { createValidator } from '@/modules/core/validators';

// Define schema for simulation form data
export const simulationFormSchema = z.object({
  teamAName: z.string().min(1, "Nom de l'équipe A requis"),
  teamBName: z.string().min(1, "Nom de l'équipe B requis"),
  scoresA: z.array(z.number()).min(3, "Au moins 3 scores pour l'équipe A"),
  scoresB: z.array(z.number()).min(3, "Au moins 3 scores pour l'équipe B"),
  h2hScores: z.array(z.object({
    scoreA: z.number(),
    scoreB: z.number()
  })).optional().default([]),
  isHomeTeamA: z.boolean(),
  isHomeTeamB: z.boolean(),
  matchType: z.enum(['friendly', 'league', 'competition']),
  alpha: z.number().min(0).max(3),
  iterations: z.number().min(1000).max(20000),
  rankA: z.number().min(1).max(20).optional(),
  rankB: z.number().min(1).max(20).optional(),
  competitionType: z.enum(['championsLeague', 'europaLeague', 'domesticCup', 'worldCup']).optional(),
  isKnockoutStage: z.boolean().optional()
});

// Define schema for simulation results
export const simulationResultsSchema = z.object({
  teamAName: z.string(),
  teamBName: z.string(),
  matchSettings: z.object({
    matchType: z.string(),
    isHomeTeamA: z.boolean(),
    isHomeTeamB: z.boolean(),
    rankA: z.number().optional(),
    rankB: z.number().optional(),
    competitionType: z.string().optional(),
    isKnockoutStage: z.boolean().optional()
  }),
  resultatsHT: z.object({
    scoreExact: z.string(),
    scoreExactPourcentage: z.string(),
    probas: z.object({
      btts: z.string(),
      over15: z.string(),
      over25: z.string(),
      over35: z.string(),
      victoireA: z.string(),
      victoireB: z.string(),
      nul: z.string()
    }),
    topScores: z.array(z.object({
      score: z.string(),
      pourcentage: z.string()
    }))
  }),
  resultatsFT: z.object({
    scoreExact: z.string(),
    scoreExactPourcentage: z.string(),
    probas: z.object({
      btts: z.string(),
      over15: z.string(),
      over25: z.string(),
      over35: z.string(),
      victoireA: z.string(),
      victoireB: z.string(),
      nul: z.string()
    }),
    topScores: z.array(z.object({
      score: z.string(),
      pourcentage: z.string()
    }))
  }),
  couponParis: z.array(z.object({
    type: z.string(),
    pari: z.string(),
    probabilite: z.string()
  })),
  couponParis100: z.array(z.object({
    type: z.string(),
    pari: z.string(),
    probabilite: z.string()
  })).optional(),
  date: z.string()
});

// Create validators
export const validateSimulationForm = createValidator(simulationFormSchema, 'SimulationForm');
export const validateSimulationResults = createValidator(simulationResultsSchema, 'SimulationResults');