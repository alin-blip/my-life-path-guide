export interface WorkoutProgram {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  is_template: boolean;
  is_public: boolean;
  created_by_admin: boolean;
  created_at: string;
  updated_at: string;
  days?: WorkoutProgramDay[];
}

export interface WorkoutProgramDay {
  id: string;
  program_id: string;
  day_of_week: number; // 0=Monday, 6=Sunday
  name?: string;
  is_rest_day: boolean;
  order_index: number;
  created_at: string;
  exercises?: WorkoutDayExercise[];
}

export interface WorkoutDayExercise {
  id: string;
  day_id: string;
  exercise_name: string;
  target_sets: number;
  target_reps?: string;
  target_weight_kg?: number;
  notes?: string;
  order_index: number;
  created_at: string;
}

export interface WorkoutTemplate {
  id: string;
  source_program_id?: string;
  name: string;
  description?: string;
  category?: string;
  difficulty?: string;
  days_per_week?: number;
  creator_user_id?: string;
  is_official: boolean;
  usage_count: number;
  program_data?: any;
  created_at: string;
  updated_at: string;
}

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Luni', labelEn: 'Monday', short: 'L', shortEn: 'M' },
  { value: 1, label: 'Marți', labelEn: 'Tuesday', short: 'Ma', shortEn: 'T' },
  { value: 2, label: 'Miercuri', labelEn: 'Wednesday', short: 'Mi', shortEn: 'W' },
  { value: 3, label: 'Joi', labelEn: 'Thursday', short: 'J', shortEn: 'Th' },
  { value: 4, label: 'Vineri', labelEn: 'Friday', short: 'V', shortEn: 'F' },
  { value: 5, label: 'Sâmbătă', labelEn: 'Saturday', short: 'S', shortEn: 'Sa' },
  { value: 6, label: 'Duminică', labelEn: 'Sunday', short: 'D', shortEn: 'Su' },
];

export const WORKOUT_CATEGORIES = [
  { value: 'strength', label: 'Forță', labelEn: 'Strength' },
  { value: 'hypertrophy', label: 'Hipertrofie', labelEn: 'Hypertrophy' },
  { value: 'weight_loss', label: 'Pierdere greutate', labelEn: 'Weight Loss' },
  { value: 'endurance', label: 'Rezistență', labelEn: 'Endurance' },
  { value: 'flexibility', label: 'Flexibilitate', labelEn: 'Flexibility' },
  { value: 'general', label: 'General', labelEn: 'General' },
];

export const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Începător', labelEn: 'Beginner' },
  { value: 'intermediate', label: 'Intermediar', labelEn: 'Intermediate' },
  { value: 'advanced', label: 'Avansat', labelEn: 'Advanced' },
];
