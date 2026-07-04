
import React, { createContext, useState, useEffect, useContext, useRef, useCallback } from 'react';
import { userProgressService } from '@/services/userProgressService';

type DayOfWeek = 'Mo' | 'Tu' | 'We' | 'Th' | 'Fr' | 'Sa' | 'Su';

interface CoreActivity {
  id: string;
  name: string;
  category: 'body' | 'being' | 'balance' | 'business';
  completed: boolean;
}

interface DailyFourActivity {
  id: string;
  name: string;
  completed: boolean;
}

interface WeeklyTwoActivity {
  id: string;
  name: string;
  completed: boolean;
}

interface DailyCoreData {
  [activityId: string]: boolean;
}

interface CoreDataByDay {
  [day: string]: DailyCoreData;
}

interface ActivityByDay {
  [day: string]: {
    dailyActivities: DailyFourActivity[];
    weeklyActivities: WeeklyTwoActivity[];
  };
}

interface ProgressContextType {
  // Progress percentages for different sections
  progress: {
    coreValuesProgress: number;
    dailyFourProgress: number;
    doorProgress: number;
    stackProgress: number;
    tribeProgress: number;
  };
  
  // Core 4 data
  coreData: CoreDataByDay;
  updateCoreActivity: (day: DayOfWeek, activityId: string, completed: boolean) => void;
  getCoreScore: () => number;
  getCoreTotalByDay: (day: DayOfWeek) => number;
  
  // Daily Four and Weekly Two data
  dailyFourData: ActivityByDay;
  updateDailyActivity: (day: DayOfWeek, activityId: string, completed: boolean) => void;
  updateWeeklyActivity: (day: DayOfWeek, activityId: string, completed: boolean) => void;
  getDailyFourScore: () => number;
  getWeeklyTwoScore: () => number;
  
  // Common data
  selectedDay: DayOfWeek;
  setSelectedDay: (day: DayOfWeek) => void;
  
  // Selected date for calendar-based progress
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  loadProgressForDate: (date: string) => Promise<void>;
  
  // Utility functions
  syncData: () => void;
}

const defaultDays: DayOfWeek[] = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const defaultCoreActivities = [
  { id: 'fitness', name: 'FITNESS', category: 'body', completed: false },
  { id: 'fuel', name: 'FUEL', category: 'body', completed: false },
  { id: 'meditation', name: 'MEDITATION', category: 'being', completed: false },
  { id: 'memoirs', name: 'MEMOIRS', category: 'being', completed: false },
  { id: 'person1', name: 'PERSON 1', category: 'balance', completed: false },
  { id: 'person2', name: 'PERSON 2', category: 'balance', completed: false },
  { id: 'discover', name: 'DISCOVER', category: 'business', completed: false },
  { id: 'declare', name: 'DECLARE', category: 'business', completed: false },
];

const defaultDailyActivities = [
  { id: 'video', name: 'VIDEO', completed: false },
  { id: 'text', name: 'TEXT', completed: false },
  { id: 'audio', name: 'AUDIO', completed: false },
  { id: 'image', name: 'IMAGE', completed: false },
];

const defaultWeeklyActivities = [
  { id: 'podcast', name: 'PODCAST', completed: false },
  { id: 'webinar', name: 'WEBINAR', completed: false },
];

const getCurrentDayOfWeek = (): DayOfWeek => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const dayMap: {[key: number]: DayOfWeek} = {
    0: 'Su', 1: 'Mo', 2: 'Tu', 3: 'We', 4: 'Th', 5: 'Fr', 6: 'Sa'
  };
  return dayMap[dayOfWeek];
};

// Initialize empty data structures
const initializeCoreData = (): CoreDataByDay => {
  const initialData: CoreDataByDay = {};
  defaultDays.forEach(day => {
    initialData[day] = {};
    defaultCoreActivities.forEach(activity => {
      initialData[day][activity.id] = false;
    });
  });
  return initialData;
};

const initializeDailyFourData = (): ActivityByDay => {
  const initialData: ActivityByDay = {};
  defaultDays.forEach(day => {
    initialData[day] = {
      dailyActivities: defaultDailyActivities.map(a => ({ ...a, completed: false })),
      weeklyActivities: defaultWeeklyActivities.map(a => ({ ...a, completed: false })),
    };
  });
  return initialData;
};

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(getCurrentDayOfWeek());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [coreData, setCoreData] = useState<CoreDataByDay>(initializeCoreData());
  const [dailyFourData, setDailyFourData] = useState<ActivityByDay>(initializeDailyFourData());
  
  // Add progress state for different sections
  const [progress, setProgress] = useState({
    coreValuesProgress: 68,
    dailyFourProgress: 75,
    doorProgress: 42,
    stackProgress: 60,
    tribeProgress: 35
  });
  
  // FIX: Add ref to track if data is loaded to prevent multiple syncData calls
  const dataLoaded = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentSaveDateRef = useRef<string>(selectedDate);

  // Update save date ref when selectedDate changes
  useEffect(() => {
    currentSaveDateRef.current = selectedDate;
  }, [selectedDate]);

  // Debounced save to Supabase
  const saveToSupabase = useCallback(async () => {
    const dateToSave = currentSaveDateRef.current;
    
    try {
      // Convert ActivityByDay format to DailyFourData format for service
      const dailyFourFormatted: any = {};
      Object.keys(dailyFourData).forEach(day => {
        dailyFourFormatted[day] = {};
        dailyFourData[day].dailyActivities.forEach(activity => {
          dailyFourFormatted[day][activity.id] = activity.completed;
        });
        dailyFourData[day].weeklyActivities.forEach(activity => {
          dailyFourFormatted[day][activity.id] = activity.completed;
        });
      });

      await Promise.all([
        userProgressService.saveCoreProgress(dateToSave, coreData),
        userProgressService.saveDailyFourProgress(dateToSave, dailyFourFormatted)
      ]);
      if (import.meta.env.DEV) {
        console.log('✅ Progress saved to Supabase');
      }
    } catch (error) {
      console.error('Error saving to Supabase:', error);
    }
  }, [coreData, dailyFourData]);

  // Load data from Supabase on mount (with localStorage fallback)
  useEffect(() => {
    if (dataLoaded.current) return;
    
    const loadInitialData = async () => {
      const today = new Date().toISOString().split('T')[0];
      
      try {
        const { core, dailyFour } = await userProgressService.loadWeekProgress(today);
        
        if (core) {
          setCoreData(core);
          localStorage.setItem('coreData', JSON.stringify(core));
        } else {
          // Fallback to localStorage
          const savedCoreData = localStorage.getItem('coreData');
          if (savedCoreData) {
            try {
              const parsedCore = JSON.parse(savedCoreData);
              setCoreData(parsedCore);
              // Migrate to Supabase
              await userProgressService.saveCoreProgress(today, parsedCore);
            } catch (e) {
              if (import.meta.env.DEV) {
                console.error("Error parsing saved core data:", e);
              }
            }
          }
        }
        
        if (dailyFour) {
          // Convert DailyFourData format to ActivityByDay format
          const convertedData: ActivityByDay = {};
          Object.keys(dailyFour).forEach(day => {
            const dayData = dailyFour[day];
            convertedData[day] = {
              dailyActivities: defaultDailyActivities.map(a => ({
                ...a,
                completed: dayData[a.id] || false
              })),
              weeklyActivities: defaultWeeklyActivities.map(a => ({
                ...a,
                completed: dayData[a.id] || false
              }))
            };
          });
          setDailyFourData(convertedData);
          localStorage.setItem('dailyFourData', JSON.stringify({ byDay: convertedData }));
        } else {
          // Fallback to localStorage
          const savedDailyFourData = localStorage.getItem('dailyFourData');
          if (savedDailyFourData) {
            try {
              const parsedData = JSON.parse(savedDailyFourData);
              if (parsedData.byDay) {
                setDailyFourData(parsedData.byDay);
                
                // Convert and migrate to Supabase
                const dailyFourFormatted: any = {};
                Object.keys(parsedData.byDay).forEach(day => {
                  dailyFourFormatted[day] = {};
                  parsedData.byDay[day].dailyActivities.forEach((activity: any) => {
                    dailyFourFormatted[day][activity.id] = activity.completed;
                  });
                  parsedData.byDay[day].weeklyActivities.forEach((activity: any) => {
                    dailyFourFormatted[day][activity.id] = activity.completed;
                  });
                });
                await userProgressService.saveDailyFourProgress(today, dailyFourFormatted);
              }
            } catch (e) {
              if (import.meta.env.DEV) {
                console.error("Error parsing saved daily four data:", e);
              }
            }
          }
        }

        // Load generic progress data from Supabase (fallback to localStorage)
        const dbProgress = await userProgressService.loadGenericProgress<any>();
        if (dbProgress) {
          setProgress(dbProgress);
        } else {
          const savedProgress = localStorage.getItem('progressData');
          if (savedProgress) {
            try {
              const parsed = JSON.parse(savedProgress);
              setProgress(parsed);
              // Migrate to Supabase
              await userProgressService.saveGenericProgress(parsed);
            } catch (e) {
              if (import.meta.env.DEV) {
                console.error("Error parsing saved progress data:", e);
              }
            }
          }
        }

      } catch (error) {
        console.error('Error loading initial data:', error);
        // Fallback to localStorage on error
        const savedCoreData = localStorage.getItem('coreData');
        if (savedCoreData) {
          try {
            setCoreData(JSON.parse(savedCoreData));
          } catch (e) {
            if (import.meta.env.DEV) {
              console.error("Error parsing saved core data:", e);
            }
          }
        }

        const savedDailyFourData = localStorage.getItem('dailyFourData');
        if (savedDailyFourData) {
          try {
            const parsedData = JSON.parse(savedDailyFourData);
            if (parsedData.byDay) {
              setDailyFourData(parsedData.byDay);
            }
          } catch (e) {
            if (import.meta.env.DEV) {
              console.error("Error parsing saved daily four data:", e);
            }
          }
        }
        
        const savedProgress = localStorage.getItem('progressData');
        if (savedProgress) {
          try {
            setProgress(JSON.parse(savedProgress));
          } catch (e) {
            if (import.meta.env.DEV) {
              console.error("Error parsing saved progress data:", e);
            }
          }
        }
      }
      
      dataLoaded.current = true;
    };

    loadInitialData();
  }, []);

  // Save data to localStorage and Supabase whenever it changes (with debouncing)
  useEffect(() => {
    localStorage.setItem('coreData', JSON.stringify(coreData));
    
    // Debounce Supabase save (500ms)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveToSupabase();
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [coreData, saveToSupabase]);

  useEffect(() => {
    const dataToSave = {
      byDay: dailyFourData
    };
    localStorage.setItem('dailyFourData', JSON.stringify(dataToSave));
    
    // Debounce Supabase save (500ms)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveToSupabase();
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [dailyFourData, saveToSupabase]);
  
  // Save progress data (DB + local cache)
  useEffect(() => {
    localStorage.setItem('progressData', JSON.stringify(progress));
    if (!dataLoaded.current) return;
    userProgressService.saveGenericProgress(progress).catch(err =>
      console.error('Failed to persist generic progress:', err)
    );
  }, [progress]);


  // Emergency save before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveToSupabase();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveToSupabase]);

  // FIX: Use useCallback to prevent unnecessary re-renders
  const updateCoreActivity = useCallback((day: DayOfWeek, activityId: string, completed: boolean) => {
    setCoreData(prev => {
      const newData = { ...prev };
      if (!newData[day]) {
        newData[day] = {};
      }
      newData[day] = { ...newData[day], [activityId]: completed };
      return newData;
    });
  }, []);

  const updateDailyActivity = useCallback((day: DayOfWeek, activityId: string, completed: boolean) => {
    setDailyFourData(prev => {
      const newData = { ...prev };
      if (!newData[day]) {
        newData[day] = {
          dailyActivities: defaultDailyActivities.map(a => ({ ...a, completed: false })),
          weeklyActivities: defaultWeeklyActivities.map(a => ({ ...a, completed: false })),
        };
      }
      
      newData[day] = {
        ...newData[day],
        dailyActivities: newData[day].dailyActivities.map(activity => 
          activity.id === activityId ? { ...activity, completed } : activity
        )
      };
      
      return newData;
    });
  }, []);

  const updateWeeklyActivity = useCallback((day: DayOfWeek, activityId: string, completed: boolean) => {
    // Check if this activity is already completed in another day
    if (completed) {
      let alreadyCompletedInOtherDay = false;
      for (const d of defaultDays) {
        if (d !== day && dailyFourData[d]?.weeklyActivities?.some(a => a.id === activityId && a.completed)) {
          alreadyCompletedInOtherDay = true;
          break;
        }
      }
      
      if (alreadyCompletedInOtherDay) {
        if (import.meta.env.DEV) {
          console.warn(`${activityId} already completed in another day of the week`);
        }
        return; // Don't update if already completed in another day
      }
    }
    
    setDailyFourData(prev => {
      const newData = { ...prev };
      if (!newData[day]) {
        newData[day] = {
          dailyActivities: defaultDailyActivities.map(a => ({ ...a, completed: false })),
          weeklyActivities: defaultWeeklyActivities.map(a => ({ ...a, completed: false })),
        };
      }
      
      newData[day] = {
        ...newData[day],
        weeklyActivities: newData[day].weeklyActivities.map(activity => 
          activity.id === activityId ? { ...activity, completed } : activity
        )
      };
      
      return newData;
    });
  }, [dailyFourData]);

  const getCoreScore = useCallback(() => {
    let score = 0;
    Object.values(coreData).forEach(dayData => {
      Object.values(dayData).forEach(isCompleted => {
        if (isCompleted) score += 0.5;
      });
    });
    return score;
  }, [coreData]);

  const getCoreTotalByDay = useCallback((day: DayOfWeek) => {
    if (!coreData[day]) return 0;
    
    return Object.values(coreData[day]).filter(Boolean).length;
  }, [coreData]);

  const getDailyFourScore = useCallback(() => {
    let score = 0;
    Object.values(dailyFourData).forEach(dayData => {
      dayData.dailyActivities.forEach(activity => {
        if (activity.completed) score += 1;
      });
    });
    return score;
  }, [dailyFourData]);

  const getWeeklyTwoScore = useCallback(() => {
    let score = 0;
    Object.values(dailyFourData).forEach(dayData => {
      dayData.weeklyActivities.forEach(activity => {
        if (activity.completed) score += 1;
      });
    });
    return score;
  }, [dailyFourData]);

  // FIX: Make syncData a useCallback to sync from Supabase
  const syncData = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const { core, dailyFour } = await userProgressService.loadWeekProgress(today);
      
      if (core) {
        setCoreData(core);
        localStorage.setItem('coreData', JSON.stringify(core));
      }
      
      if (dailyFour) {
        // Convert DailyFourData format to ActivityByDay format
        const convertedData: ActivityByDay = {};
        Object.keys(dailyFour).forEach(day => {
          const dayData = dailyFour[day];
          convertedData[day] = {
            dailyActivities: defaultDailyActivities.map(a => ({
              ...a,
              completed: dayData[a.id] || false
            })),
            weeklyActivities: defaultWeeklyActivities.map(a => ({
              ...a,
              completed: dayData[a.id] || false
            }))
          };
        });
        setDailyFourData(convertedData);
        localStorage.setItem('dailyFourData', JSON.stringify({ byDay: convertedData }));
      }

      // Still load progress from localStorage
      const savedProgress = localStorage.getItem('progressData');
      if (savedProgress) {
        try {
          setProgress(JSON.parse(savedProgress));
        } catch (e) {
          console.error("Error parsing saved progress data:", e);
        }
      }
      
      console.log('✅ Data synced from Supabase');
    } catch (error) {
      console.error('Error syncing data:', error);
      // Fallback to localStorage
      const savedCoreData = localStorage.getItem('coreData');
      if (savedCoreData) {
        try {
          setCoreData(JSON.parse(savedCoreData));
        } catch (e) {
          console.error("Error parsing saved core data:", e);
        }
      }

      const savedDailyFourData = localStorage.getItem('dailyFourData');
      if (savedDailyFourData) {
        try {
          const parsedData = JSON.parse(savedDailyFourData);
          if (parsedData.byDay) {
            setDailyFourData(parsedData.byDay);
          }
        } catch (e) {
          console.error("Error parsing saved daily four data:", e);
        }
      }
      
      const savedProgress = localStorage.getItem('progressData');
      if (savedProgress) {
        try {
          setProgress(JSON.parse(savedProgress));
        } catch (e) {
          console.error("Error parsing saved progress data:", e);
        }
      }
    }
  }, []);

  const loadProgressForDate = useCallback(async (date: string) => {
    const { core, dailyFour } = await userProgressService.loadWeekProgress(date);
    if (core) setCoreData(core);
    if (dailyFour) {
      const convertedData: ActivityByDay = {};
      Object.keys(dailyFour).forEach(day => {
        const dayData = dailyFour[day];
        convertedData[day] = {
          dailyActivities: defaultDailyActivities.map(a => ({ ...a, completed: dayData[a.id] || false })),
          weeklyActivities: defaultWeeklyActivities.map(a => ({ ...a, completed: dayData[a.id] || false }))
        };
      });
      setDailyFourData(convertedData);
    }
  }, []);

  return (
    <ProgressContext.Provider
      value={{
        progress,
        coreData,
        updateCoreActivity,
        getCoreScore,
        getCoreTotalByDay,
        
        dailyFourData,
        updateDailyActivity,
        updateWeeklyActivity,
        getDailyFourScore,
        getWeeklyTwoScore,
        
        selectedDay,
        setSelectedDay,
        
        selectedDate,
        setSelectedDate,
        loadProgressForDate,
        
        syncData
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
