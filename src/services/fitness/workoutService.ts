
export interface Exercise {
  name: string;
  muscleGroup: string;
  equipment: string;
  type: 'strength' | 'cardio' | 'flexibility';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
}

export interface WorkoutExercise {
  exercise: Exercise;
  sets?: number;
  reps?: number;
  duration?: number; // in minutes
  rest?: number; // in seconds
  intensity?: 'low' | 'medium' | 'high';
}

export interface Workout {
  title: string;
  description: string;
  exercises: WorkoutExercise[];
  duration: number; // estimated duration in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  targetMuscleGroups: string[];
  notes?: string;
}

export interface WorkoutProgram {
  title: string;
  description: string;
  workouts: Workout[];
  daysPerWeek: number;
  goal: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  location: 'gym' | 'home' | 'outdoors';
}

// Sample exercise database
const exercises: Exercise[] = [
  // Chest exercises
  {
    name: 'Bench Press',
    muscleGroup: 'chest',
    equipment: 'barbell',
    type: 'strength',
    difficulty: 'intermediate',
    description: 'Lie on a flat bench, lower the barbell to your chest, then press it back up.'
  },
  {
    name: 'Push-ups',
    muscleGroup: 'chest',
    equipment: 'bodyweight',
    type: 'strength',
    difficulty: 'beginner',
    description: 'Start in a plank position with hands shoulder-width apart, lower your body until your chest nearly touches the floor, then push back up.'
  },
  {
    name: 'Dumbbell Flyes',
    muscleGroup: 'chest',
    equipment: 'dumbbells',
    type: 'strength',
    difficulty: 'intermediate',
    description: 'Lie on a flat bench with a dumbbell in each hand, extend arms above chest, then lower them out to sides in an arc motion.'
  },
  
  // Back exercises
  {
    name: 'Pull-ups',
    muscleGroup: 'back',
    equipment: 'pull-up bar',
    type: 'strength',
    difficulty: 'intermediate',
    description: 'Hang from a pull-up bar with hands slightly wider than shoulder-width, pull your body up until your chin clears the bar.'
  },
  {
    name: 'Bent Over Rows',
    muscleGroup: 'back',
    equipment: 'barbell',
    type: 'strength',
    difficulty: 'intermediate',
    description: 'Bend at hips and knees, keeping back straight. Pull barbell to lower chest, then lower back down.'
  },
  {
    name: 'Lat Pulldowns',
    muscleGroup: 'back',
    equipment: 'cable machine',
    type: 'strength',
    difficulty: 'beginner',
    description: 'Sit at a lat pulldown machine, grip the bar with hands wider than shoulder-width, pull the bar down to chest level.'
  },
  
  // Leg exercises
  {
    name: 'Squats',
    muscleGroup: 'legs',
    equipment: 'barbell',
    type: 'strength',
    difficulty: 'intermediate',
    description: 'Stand with feet shoulder-width apart, barbell across upper back. Bend knees and hips to lower your body, then stand back up.'
  },
  {
    name: 'Lunges',
    muscleGroup: 'legs',
    equipment: 'bodyweight',
    type: 'strength',
    difficulty: 'beginner',
    description: 'Step forward with one leg, lowering your body until both knees are bent at 90 degrees, then return to starting position.'
  },
  {
    name: 'Leg Press',
    muscleGroup: 'legs',
    equipment: 'machine',
    type: 'strength',
    difficulty: 'beginner',
    description: 'Sit in the leg press machine, feet on platform. Push the platform away by extending your legs, then return to starting position.'
  },
  
  // Shoulder exercises
  {
    name: 'Shoulder Press',
    muscleGroup: 'shoulders',
    equipment: 'dumbbells',
    type: 'strength',
    difficulty: 'intermediate',
    description: 'Sit with dumbbells at shoulder height, press them overhead until arms are extended, then lower back down.'
  },
  {
    name: 'Lateral Raises',
    muscleGroup: 'shoulders',
    equipment: 'dumbbells',
    type: 'strength',
    difficulty: 'beginner',
    description: 'Stand with dumbbells at your sides, raise them out to the sides until arms are parallel to the floor, then lower back down.'
  },
  
  // Arm exercises
  {
    name: 'Bicep Curls',
    muscleGroup: 'arms',
    equipment: 'dumbbells',
    type: 'strength',
    difficulty: 'beginner',
    description: 'Stand with dumbbells in hands, palms facing forward. Curl the weights toward your shoulders, then lower them back down.'
  },
  {
    name: 'Tricep Dips',
    muscleGroup: 'arms',
    equipment: 'bench',
    type: 'strength',
    difficulty: 'beginner',
    description: 'Sit on a bench with hands at edge, move hips forward off the bench, lower body by bending arms, then push back up.'
  },
  
  // Core exercises
  {
    name: 'Plank',
    muscleGroup: 'core',
    equipment: 'bodyweight',
    type: 'strength',
    difficulty: 'beginner',
    description: 'Hold a push-up position with your body in a straight line from head to heels, weight on forearms and toes.'
  },
  {
    name: 'Crunches',
    muscleGroup: 'core',
    equipment: 'bodyweight',
    type: 'strength',
    difficulty: 'beginner',
    description: 'Lie on your back with knees bent, feet on floor. Curl upper body toward knees, then lower back down.'
  },
  
  // Cardio exercises
  {
    name: 'Running',
    muscleGroup: 'full body',
    equipment: 'none',
    type: 'cardio',
    difficulty: 'beginner',
    description: 'Run at a steady pace, focusing on maintaining consistent breathing and form.'
  },
  {
    name: 'Jumping Jacks',
    muscleGroup: 'full body',
    equipment: 'bodyweight',
    type: 'cardio',
    difficulty: 'beginner',
    description: 'Stand with feet together, arms at sides. Jump while spreading legs and raising arms, then return to starting position.'
  },
  {
    name: 'Burpees',
    muscleGroup: 'full body',
    equipment: 'bodyweight',
    type: 'cardio',
    difficulty: 'intermediate',
    description: 'Start standing, drop to a squat position, kick feet back into a plank, do a push-up, return to squat, then jump up.'
  },
  
  // Flexibility exercises
  {
    name: 'Hamstring Stretch',
    muscleGroup: 'legs',
    equipment: 'none',
    type: 'flexibility',
    difficulty: 'beginner',
    description: 'Sit with one leg extended, the other bent. Reach for your toes on the extended leg, holding the stretch.'
  },
  {
    name: 'Downward Dog',
    muscleGroup: 'full body',
    equipment: 'none',
    type: 'flexibility',
    difficulty: 'beginner',
    description: 'Start on hands and knees, lift hips up and back, forming an inverted V shape with your body.'
  }
];

class WorkoutService {
  private getExercisesForLevel(level: 'beginner' | 'intermediate' | 'advanced'): Exercise[] {
    if (level === 'beginner') {
      return exercises.filter(e => e.difficulty === 'beginner');
    } else if (level === 'intermediate') {
      return exercises.filter(e => e.difficulty === 'beginner' || e.difficulty === 'intermediate');
    } else {
      return exercises; // For advanced, all exercises are available
    }
  }
  
  private getExercisesForLocation(location: 'gym' | 'home' | 'outdoors', availableExercises: Exercise[]): Exercise[] {
    if (location === 'home') {
      return availableExercises.filter(e => 
        e.equipment === 'bodyweight' || 
        e.equipment === 'none' || 
        e.equipment === 'dumbbells'
      );
    } else if (location === 'outdoors') {
      return availableExercises.filter(e => 
        e.equipment === 'bodyweight' || 
        e.equipment === 'none'
      );
    } else {
      return availableExercises; // For gym, all equipment is available
    }
  }
  
  private getExercisesForMuscleGroups(
    targetMuscleGroups: string[],
    availableExercises: Exercise[]
  ): Exercise[] {
    if (targetMuscleGroups.length === 0) {
      return availableExercises;
    }
    
    return availableExercises.filter(e => 
      targetMuscleGroups.includes(e.muscleGroup) || e.muscleGroup === 'full body'
    );
  }
  
  private createWorkout(
    title: string,
    description: string,
    targetMuscleGroups: string[],
    availableExercises: Exercise[],
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ): Workout {
    const workoutExercises: WorkoutExercise[] = [];
    const exerciseCount = difficulty === 'beginner' ? 5 : difficulty === 'intermediate' ? 7 : 9;
    
    // Filter exercises by target muscle groups
    let muscleSpecificExercises = this.getExercisesForMuscleGroups(
      targetMuscleGroups, 
      availableExercises
    );
    
    // If no specific targets, use all exercises
    if (muscleSpecificExercises.length === 0) {
      muscleSpecificExercises = availableExercises;
    }
    
    // Add exercises to the workout
    const selectedExercises = new Set<string>();
    let attempts = 0;
    
    // Add strength exercises
    const strengthExercises = muscleSpecificExercises.filter(e => e.type === 'strength');
    while (workoutExercises.length < exerciseCount - 2 && attempts < 50 && strengthExercises.length > 0) {
      const randomIndex = Math.floor(Math.random() * strengthExercises.length);
      const exercise = strengthExercises[randomIndex];
      
      if (!selectedExercises.has(exercise.name)) {
        selectedExercises.add(exercise.name);
        
        // Sets and reps based on difficulty
        let sets = 3;
        let reps = 10;
        let rest = 60;
        
        if (difficulty === 'intermediate') {
          sets = 4;
          rest = 45;
        } else if (difficulty === 'advanced') {
          sets = 5;
          reps = 8;
          rest = 30;
        }
        
        workoutExercises.push({
          exercise,
          sets,
          reps,
          rest
        });
      }
      
      attempts++;
    }
    
    // Add cardio exercise
    const cardioExercises = availableExercises.filter(e => e.type === 'cardio');
    if (cardioExercises.length > 0) {
      const randomCardio = cardioExercises[Math.floor(Math.random() * cardioExercises.length)];
      
      // Duration based on difficulty
      let duration = difficulty === 'beginner' ? 10 : difficulty === 'intermediate' ? 15 : 20;
      let intensity: 'low' | 'medium' | 'high' = 
        difficulty === 'beginner' ? 'low' : 
        difficulty === 'intermediate' ? 'medium' : 'high';
      
      workoutExercises.push({
        exercise: randomCardio,
        duration,
        intensity
      });
    }
    
    // Add flexibility exercise
    const flexibilityExercises = availableExercises.filter(e => e.type === 'flexibility');
    if (flexibilityExercises.length > 0) {
      const randomFlex = flexibilityExercises[Math.floor(Math.random() * flexibilityExercises.length)];
      
      workoutExercises.push({
        exercise: randomFlex,
        duration: 5,
        intensity: 'low'
      });
    }
    
    // Calculate total workout duration
    const totalDuration = workoutExercises.reduce((sum, we) => {
      if (we.duration) {
        return sum + we.duration;
      } else if (we.sets && we.reps) {
        // Estimate time for strength exercises
        const timePerSet = (we.reps * 3) + (we.rest ? we.rest : 60) / 60; // in minutes
        return sum + (we.sets * timePerSet);
      }
      return sum + 5; // Default to 5 minutes if no duration info
    }, 0);
    
    return {
      title,
      description,
      exercises: workoutExercises,
      duration: Math.round(totalDuration),
      difficulty,
      targetMuscleGroups
    };
  }
  
  generateWorkoutProgram(
    goal: WorkoutProgram['goal'],
    level: 'beginner' | 'intermediate' | 'advanced',
    location: 'gym' | 'home' | 'outdoors',
    daysPerWeek: number,
    targetMuscleGroups: string[] = []
  ): WorkoutProgram {
    // Get exercises based on level and location
    const exercisesForLevel = this.getExercisesForLevel(level);
    const availableExercises = this.getExercisesForLocation(location, exercisesForLevel);
    
    // Create a title and description based on goal
    let title = 'Custom Workout Program';
    let description = 'A personalized workout program designed to help you reach your fitness goals.';
    
    if (goal === 'build_muscle') {
      title = 'Muscle Building Program';
      description = 'Focus on progressive overload with compound movements to build strength and muscle mass.';
    } else if (goal === 'lose_fat') {
      title = 'Fat Loss Program';
      description = 'Combines strength training and cardio to maximize calorie burn and preserve muscle.';
    } else if (goal === 'improve_cardio') {
      title = 'Cardiovascular Fitness Program';
      description = 'Designed to improve heart health, endurance, and overall cardiovascular fitness.';
    } else if (goal === 'flexibility') {
      title = 'Flexibility and Mobility Program';
      description = 'Focuses on stretching and mobility work to improve range of motion and prevent injuries.';
    } else if (goal === 'general_fitness') {
      title = 'General Fitness Program';
      description = 'A balanced approach to fitness covering strength, cardio, and flexibility components.';
    }
    
    // Generate the workouts
    const workouts: Workout[] = [];
    
    // Define muscle group splits based on days per week
    let muscleGroupSplits: string[][] = [];
    
    if (daysPerWeek <= 3) {
      // Full body workouts for 1-3 days per week
      for (let i = 0; i < daysPerWeek; i++) {
        muscleGroupSplits.push(['full body']);
      }
    } else if (daysPerWeek === 4) {
      // Upper/Lower split
      muscleGroupSplits = [
        ['chest', 'back', 'shoulders', 'arms'], // Upper
        ['legs', 'core'],                      // Lower
        ['chest', 'back', 'shoulders', 'arms'], // Upper
        ['legs', 'core']                       // Lower
      ];
    } else {
      // Push/Pull/Legs split for 5+ days
      muscleGroupSplits = [
        ['chest', 'shoulders', 'arms'], // Push
        ['back', 'arms'],              // Pull
        ['legs'],                      // Legs
        ['chest', 'shoulders', 'arms'], // Push
        ['back', 'arms']               // Pull
      ];
      
      // Add legs and full body for 6-7 days
      if (daysPerWeek >= 6) {
        muscleGroupSplits.push(['legs']); // Legs
      }
      if (daysPerWeek === 7) {
        muscleGroupSplits.push(['full body']); // Active recovery
      }
    }
    
    // Create each workout
    for (let i = 0; i < daysPerWeek; i++) {
      const dayNumber = i + 1;
      const muscleGroups = muscleGroupSplits[i];
      
      let workoutTitle = `Day ${dayNumber}: `;
      if (muscleGroups.includes('full body')) {
        workoutTitle += 'Full Body';
      } else if (muscleGroups.includes('chest') && muscleGroups.includes('shoulders')) {
        workoutTitle += 'Push (Chest, Shoulders, Triceps)';
      } else if (muscleGroups.includes('back')) {
        workoutTitle += 'Pull (Back, Biceps)';
      } else if (muscleGroups.includes('legs')) {
        workoutTitle += 'Legs';
      } else {
        workoutTitle += muscleGroups.map(mg => mg.charAt(0).toUpperCase() + mg.slice(1)).join(', ');
      }
      
      // Generate the workout
      const workout = this.createWorkout(
        workoutTitle,
        `Workout for ${workoutTitle.split(': ')[1]}`,
        muscleGroups,
        availableExercises,
        level
      );
      
      workouts.push(workout);
    }
    
    return {
      title,
      description,
      workouts,
      daysPerWeek,
      goal,
      difficulty: level,
      location
    };
  }
}

const workoutService = new WorkoutService();
export default workoutService;
