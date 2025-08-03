
export type DayOfWeek = 'M' | 'T' | 'W' | 'Th' | 'F' | 'Sa' | 'Su';

export type TaskPriority = 'none' | 'important' | 'urgent' | 'urgent-important';

export type HotListItem = {
  id: string;
  text: string;
  selected: boolean;
  priority: TaskPriority;
  isKeyPoint?: boolean; // Added isKeyPoint property
};

export type HitListItem = {
  id: string;
  text: string;
  day: DayOfWeek | null;
  completed: boolean;
  isKeyPoint?: boolean;
  keyPointId?: string; // Reference to the original key point ID
  priority?: TaskPriority;
};

export type DoListItem = {
  id: string;
  text: string;
  day: DayOfWeek | null;
  completed: boolean;
  priority?: TaskPriority;
};

export type DominoKeyPoint = {
  id: string;
  text: string;
  completed?: boolean; // Add completed flag
};
