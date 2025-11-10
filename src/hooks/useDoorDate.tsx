
import { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, getWeek, getYear, parseISO, isValid } from 'date-fns';
import { DayOfWeek } from '@/types/door';

export function useDoorDate() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentDateRange, setCurrentDateRange] = useState('');
  const [currentWeekKey, setCurrentWeekKey] = useState('');
  const [activeDay, setActiveDay] = useState<DayOfWeek>(getCurrentDayOfWeek());

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
    const weekNumber = getWeek(currentDate, { weekStartsOn: 1 }); // ISO week
    const year = getYear(currentDate);
    // FIX: Use proper ISO week format for consistency with weekly_planning
    const weekKey = `door-week-${year}-${String(weekNumber).padStart(2, '0')}`;
    setCurrentWeekKey(weekKey);
    
    
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
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
    handlePreviousWeek,
    handleNextWeek,
    selectDayOfWeek,
    getCurrentDayOfWeek,
    navigateToDate,
  };
}
