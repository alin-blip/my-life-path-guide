import { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { getWeekKey } from '@/utils/weekUtils';

export function useObjectivesWeek() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentDateRange, setCurrentDateRange] = useState('');
  const [currentWeekKey, setCurrentWeekKey] = useState('');

  useEffect(() => {
    // Use the same weekKey format as weekly_planning table
    const weekKey = getWeekKey(currentDate);
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
    return getWeekKey(now) === getWeekKey(currentDate);
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