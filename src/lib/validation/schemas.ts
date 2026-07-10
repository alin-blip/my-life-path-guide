import { z } from 'zod';

// Door planning validation schemas
export const hotListItemSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1, 'Task cannot be empty').max(500, 'Task too long'),
  selected: z.boolean().optional(),
  priority: z.enum(['none', 'important', 'urgent', 'urgent-important']).optional()
});

export const hitListItemSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1, 'Task cannot be empty').max(500, 'Task too long'),
  completed: z.boolean(),
  day: z.string().optional(),
  priority: z.enum(['none', 'important', 'urgent', 'urgent-important']).optional()
});

export const doListItemSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1, 'Task cannot be empty').max(500, 'Task too long'),
  completed: z.boolean(),
  day: z.string().optional(),
  dayOfWeek: z.enum(['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su']).optional(),
  priority: z.enum(['none', 'important', 'urgent', 'urgent-important']).optional()
});

export const dominoKeyPointSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1, 'Key point cannot be empty').max(500, 'Key point too long'),
  completed: z.boolean()
});

export const weeklyPlanningSchema = z.object({
  weekKey: z.string().min(1),
  dominoTitle: z.string().min(1, 'Domino title required').max(200, 'Title too long'),
  weekGoal: z.string().min(1, 'Week goal required').max(1000, 'Goal too long'),
  keyPoints: z.array(dominoKeyPointSchema).min(1, 'At least one key point required').max(10, 'Too many key points'),
  reviewData: z.object({
    achievements: z.string().max(2000).optional(),
    challenges: z.string().max(2000).optional(),
    learnings: z.string().max(2000).optional()
  }).optional()
});

// Mission validation schemas
export const missionSchema = z.object({
  category: z.enum(['business', 'body', 'being', 'balance']),
  title: z.string().min(1, 'Title required').max(200, 'Title too long'),
  measurableResult: z.string().min(1, 'Measurable result required').max(500, 'Too long'),
  endGoalValue: z.string().min(1, 'End goal required').max(200, 'Too long'),
  period: z.string().optional(),
  missionType: z.enum(['monthly', 'annual']),
  isImpossibleGame: z.boolean().optional(),
  goalData: z.record(z.string(), z.any()).optional()
});

// Objectives validation schemas
export const objectiveSchema = z.object({
  category: z.enum(['business', 'body', 'being', 'balance']),
  weekKey: z.string().min(1),
  description: z.string().min(1, 'Description required').max(2000, 'Description too long')
});

export const weeklyObjectivesSchema = z.record(
  z.number(),
  z.string().min(1, 'Answer cannot be empty').max(1000, 'Answer too long')
);

// User input validation schemas
export const emailSchema = z.string().email('Invalid email').max(254, 'Email too long');

export const userInputSchema = z.object({
  content: z.string()
    .min(1, 'Content cannot be empty')
    .max(10000, 'Content too long')
    .refine(
      (val) => !/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(val),
      'Script tags not allowed'
    )
});

// Voice input validation
export const voiceInputSchema = z.object({
  transcript: z.string().min(1, 'Transcript cannot be empty').max(5000, 'Transcript too long'),
  language: z.enum(['en', 'ro']).optional()
});

// Fact map validation
export const factMapSchema = z.object({
  title: z.string().min(1, 'Title required').max(200, 'Title too long'),
  category: z.enum(['business', 'body', 'being', 'balance']),
  items: z.array(z.object({
    id: z.string(),
    text: z.string().min(1).max(500)
  })).max(50, 'Too many items'),
  goals: z.array(z.object({
    id: z.string(),
    text: z.string().min(1).max(500)
  })).max(20, 'Too many goals')
});

// Stack session validation
export const stackAnswerSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1, 'Answer cannot be empty').max(5000, 'Answer too long')
});

// Helper function to validate and sanitize
export function validateAndSanitize<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: 'Validation failed' };
  }
}
