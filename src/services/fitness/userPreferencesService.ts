
export interface UserPreferences {
  // User data for calorie calculator
  userData: {
    gender: 'male' | 'female';
    age: number;
    weight: number;
    height: number;
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    goal: 'lose_weight' | 'maintain' | 'gain_muscle' | 'reduce_cellulite';
  };
  dietType: string;
  
  // Preferences for meal planner
  mealPreferences: {
    mealsPerDay: number;
    excludedFoods: string[];
    preferredFoods: string[];
  };
  
  // Preferences for workout generator
  workoutPreferences: {
    goal: 'build_muscle' | 'lose_fat' | 'improve_cardio' | 'general_fitness' | 'flexibility';
    level: 'beginner' | 'intermediate' | 'advanced';
    location: 'gym' | 'home' | 'outdoors';
    daysPerWeek: number;
    targetMuscleGroups: string[];
  };
}

const defaultPreferences: UserPreferences = {
  userData: {
    gender: 'male',
    age: 30,
    weight: 70,
    height: 175,
    activityLevel: 'moderate',
    goal: 'maintain'
  },
  dietType: 'balanced',
  mealPreferences: {
    mealsPerDay: 3,
    excludedFoods: [],
    preferredFoods: []
  },
  workoutPreferences: {
    goal: 'general_fitness',
    level: 'beginner',
    location: 'gym',
    daysPerWeek: 3,
    targetMuscleGroups: []
  }
};

class UserPreferencesService {
  private static STORAGE_KEY = 'warrior_fitness_preferences';
  private preferences: UserPreferences;
  
  constructor() {
    this.preferences = this.loadPreferences();
  }
  
  private loadPreferences(): UserPreferences {
    try {
      const savedPreferences = localStorage.getItem(UserPreferencesService.STORAGE_KEY);
      if (savedPreferences) {
        return JSON.parse(savedPreferences);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
    
    return { ...defaultPreferences };
  }
  
  private savePreferences(): void {
    try {
      localStorage.setItem(
        UserPreferencesService.STORAGE_KEY, 
        JSON.stringify(this.preferences)
      );
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }
  
  getUserData() {
    return this.preferences.userData;
  }
  
  updateUserData(userData: Partial<UserPreferences['userData']>) {
    this.preferences.userData = { ...this.preferences.userData, ...userData };
    this.savePreferences();
    return this.preferences.userData;
  }
  
  getDietType() {
    return this.preferences.dietType;
  }
  
  updateDietType(dietType: string) {
    this.preferences.dietType = dietType;
    this.savePreferences();
    return this.preferences.dietType;
  }
  
  getMealPreferences() {
    return this.preferences.mealPreferences;
  }
  
  updateMealPreferences(mealPreferences: Partial<UserPreferences['mealPreferences']>) {
    this.preferences.mealPreferences = { ...this.preferences.mealPreferences, ...mealPreferences };
    this.savePreferences();
    return this.preferences.mealPreferences;
  }
  
  getWorkoutPreferences() {
    return this.preferences.workoutPreferences;
  }
  
  updateWorkoutPreferences(workoutPreferences: Partial<UserPreferences['workoutPreferences']>) {
    this.preferences.workoutPreferences = { ...this.preferences.workoutPreferences, ...workoutPreferences };
    this.savePreferences();
    return this.preferences.workoutPreferences;
  }
  
  getAllPreferences() {
    return this.preferences;
  }
  
  resetAllPreferences() {
    this.preferences = { ...defaultPreferences };
    this.savePreferences();
    return this.preferences;
  }
}

// Create a singleton instance
const userPreferencesService = new UserPreferencesService();
export default userPreferencesService;
