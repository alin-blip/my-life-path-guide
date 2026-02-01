import { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, parseISO, isValid, addDays } from 'date-fns';
import { DayOfWeek } from '@/types/door';
import { getActiveWeekKey, isSundayPlanningDay } from '@/utils/weekUtils';

export function useDoorDate() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentDateRange, setCurrentDateRange] = useState('');
  const [currentWeekKey, setCurrentWeekKey] = useState(() => getActiveWeekKey(new Date()));
  const [activeDay, setActiveDay] = useState<DayOfWeek>(getCurrentDayOfWeek());
  const [isPlanningMode, setIsPlanningMode] = useState(false);

  // New method to navigate to a specific date without reload
  const navigateToDate = (targetDate: Date) => {
    setCurrentDate(targetDate);
    
    const dayOfWeek = targetDate.getDay();
    const dayMap: {[key: number]: DayOfWeek} = {
      0: 'Su', 1: 'M', 2: 'T', 3: 'W', 4: 'Th', 5: 'F', 6: 'Sa'
    };
    
    setActiveDay(dayMap[dayOfWeek] || 'M');
  };

  function getCurrentDayOfWeek(): DayOfWeek {
    const dayOfWeek = new Date().getDay();
    // On Sunday, default to Monday (planning for next week)
    if (dayOfWeek === 0) return 'M';
    
    const dayMap: {[key: number]: DayOfWeek} = {
      0: 'Su', 1: 'M', 2: 'T', 3: 'W', 4: 'Th', 5: 'F', 6: 'Sa'
    };
    return dayMap[dayOfWeek] || 'M';
  }

  useEffect(() => {
    const lastActiveDate = localStorage.getItem('lastActiveDate');
    
    if (lastActiveDate) {
      try {
        const storedDate = parseISO(lastActiveDate);
        
        if (isValid(storedDate)) {
          setCurrentDate(storedDate);
          
          const dayOfWeek = storedDate.getDay();
          const dayMap: {[key: number]: DayOfWeek} = {
            0: 'Su', 1: 'M', 2: 'T', 3: 'W', 4: 'Th', 5: 'F', 6: 'Sa'
          };
          
          setActiveDay(dayMap[dayOfWeek] || getCurrentDayOfWeek());
        } else {
          setActiveDay(getCurrentDayOfWeek());
        }
      } catch (e) {
        console.error("Error parsing stored date:", e);
        setActiveDay(getCurrentDayOfWeek());
      }
      
      localStorage.removeItem('lastActiveDate');
    } else {
      setActiveDay(getCurrentDayOfWeek());
    }
  }, []);
  
  useEffect(() => {
    // Check if it's Sunday (planning mode)
    const isSunday = isSundayPlanningDay(currentDate);
    setIsPlanningMode(isSunday);
    
    // Use getActiveWeekKey which handles Sunday → next week logic
    const weekKey = getActiveWeekKey(currentDate);
    setCurrentWeekKey(weekKey);
    
    // For date range display, show the week we're planning/working on
    let displayDate = currentDate;
    if (isSunday) {
      displayDate = addDays(currentDate, 1); // Show next week's range on Sunday
    }
    
    const weekStart = startOfWeek(displayDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(displayDate, { weekStartsOn: 1 });
    const formattedDateRange = `${format(weekStart, 'MM.dd')} - ${format(weekEnd, 'MM.dd')}`;
    setCurrentDateRange(formattedDateRange);
  }, [currentDate]);

  const handlePreviousWeek = () => {
    setCurrentDate(prevDate => subWeeks(prevDate, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(prevDate => addWeeks(prevDate, 1));
  };

  const selectDayOfWeek = (day: DayOfWeek) => {
    setActiveDay(day);
  };

  return {
    currentDate,
    currentDateRange,
    currentWeekKey,
    activeDay,
    isPlanningMode,
    handlePreviousWeek,
    handleNextWeek,
    selectDayOfWeek,
    getCurrentDayOfWeek,
    navigateToDate,
  };
}
