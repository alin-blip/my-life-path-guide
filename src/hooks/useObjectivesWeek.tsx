import { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, getWeek, getYear } from 'date-fns';

export function useObjectivesWeek() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentDateRange, setCurrentDateRange] = useState('');
  const [currentWeekKey, setCurrentWeekKey] = useState('');

  useEffect(() => {
    const weekNumber = getWeek(currentDate);
    const year = getYear(currentDate);
    const weekKey = `week-${year}-${weekNumber}`;
    setCurrentWeekKey(weekKey);
    
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const formattedDateRange = `${format(weekStart, 'dd.MM')} - ${format(weekEnd, 'dd.MM')}`;
    setCurrentDateRange(formattedDateRange);
  }, [currentDate]);

  const handlePreviousWeek = () => {
    setCurrentDate(prevDate => subWeeks(prevDate, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(prevDate => addWeeks(prevDate, 1));
  };

  const isCurrentWeek = () => {
    const now = new Date();
    const currentWeekNumber = getWeek(now);
    const currentYear = getYear(now);
    const selectedWeekNumber = getWeek(currentDate);
    const selectedYear = getYear(currentDate);
    
    return currentWeekNumber === selectedWeekNumber && currentYear === selectedYear;
  };

  return {
    currentDate,
    currentDateRange,
    currentWeekKey,
    handlePreviousWeek,
    handleNextWeek,
    isCurrentWeek
  };
}