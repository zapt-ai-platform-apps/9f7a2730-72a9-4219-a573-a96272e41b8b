import { createValidator } from '@/modules/core/validators';

/**
 * Schema for history item
 */
export const historyItemSchema = {
  teamAName: { type: 'string', required: true },
  teamBName: { type: 'string', required: true },
  matchType: { type: 'string', required: true },
  score: { type: 'string', required: true },
  probability: { type: 'string', required: true },
  outcome: { type: 'string', required: true },
  couponCount: { type: 'number', required: true },
  couponCount75: { type: 'number', required: true },
  date: { type: 'string', required: true },
  id: { type: 'string', required: true }
};

/**
 * Schema for team data
 */
export const teamDataSchema = {
  name: { type: 'string', required: true },
  scores: { type: 'array', required: true }
};

/**
 * Validators
 */
export const validateHistoryItem = createValidator(
  historyItemSchema, 
  'HistoryItem'
);

export const validateTeamData = createValidator(
  teamDataSchema, 
  'TeamData'
);