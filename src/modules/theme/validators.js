import { z } from 'zod';
import { createValidator } from '@/modules/core/validators';

// Define schema for theme settings
export const themeSchema = z.object({
  darkMode: z.boolean()
});

// Create validator
export const validateTheme = createValidator(themeSchema, 'Theme');