import { z } from 'zod';
import { createValidator } from '@/modules/core/validators';

// Define schema for simulation history entry
export const simulationHistoryEntrySchema = z.object({
  date: z.string(),
  teamAName: z.string(),
  teamBName: z.string(),
  matchType: z.string(),
  score: z.string(),
  probability: z.string(),
  outcome: z.string(),
  couponCount: z.number(),
  couponCount100: z.number().optional(),
  id: z.string()
});

// Define schema for the entire history list
export const simulationHistorySchema = z.array(simulationHistoryEntrySchema);

// Create validators
export const validateHistoryEntry = createValidator(simulationHistoryEntrySchema, 'HistoryEntry');
export const validateHistory = createValidator(simulationHistorySchema, 'History');