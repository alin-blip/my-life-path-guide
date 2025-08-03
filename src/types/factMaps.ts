
export interface FactMapsContentProps {
  initialCategory?: 'foundation' | 'monthly' | 'impossible' | null;
  highlightId?: string | null;
}

export type GoalStatus = 'pending' | 'in-progress' | 'completed';

export interface FactMapGoal {
  id: string;
  name: string;
  description: string;
  isBlue?: boolean;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
  answers?: Record<string, string>;
  isCompleted?: boolean;
  missionDetails?: {
    period: string;
    name: string;
    objectives?: string[];
  };
}

export interface FactMapItem {
  id: string;
  title: string;
  category: 'foundation' | 'monthly' | 'impossible';
  createdAt: string;
  updatedAt: string;
  items: FactMapGoal[];
}

// This interface maps to what we get from Supabase
export interface SupabaseFactMap {
  id: string;
  title: string;
  category: string;
  created_at: string;
  updated_at: string;
  items: any; // This will be converted to the proper format
  user_id: string | null;
}

// Helper function to convert between FactMapItem and Supabase format
export function formatForSupabase(map: FactMapItem): {
  id: string;
  title: string;
  category: string;
  created_at: string;
  updated_at: string;
  items: any;
  user_id?: string | null;
} {
  // Serialize FactMapGoal items to plain objects
  const serializedItems = map.items.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description,
    status: item.status,
    isBlue: item.isBlue,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    answers: item.answers,
    isCompleted: item.isCompleted,
    missionDetails: item.missionDetails
  }));
  
  return {
    id: map.id,
    title: map.title,
    category: map.category,
    created_at: map.createdAt,
    updated_at: map.updatedAt,
    items: serializedItems
  };
}

// Helper function to convert from Supabase format to FactMapItem
export function formatFromSupabase(item: SupabaseFactMap): FactMapItem {
  // Ensure category is one of the valid options
  const validCategory = isValidCategory(item.category) ? 
    item.category as 'foundation' | 'monthly' | 'impossible' :
    'foundation';
  
  // Process items array to ensure it conforms to FactMapGoal type
  const processedItems: FactMapGoal[] = Array.isArray(item.items) 
    ? item.items.map((goalItem: any) => ({
        id: goalItem.id || '',
        name: goalItem.name || '',
        description: goalItem.description || '',
        status: (goalItem.status as GoalStatus) || 'pending',
        isBlue: goalItem.isBlue || false,
        createdAt: goalItem.createdAt || item.created_at,
        updatedAt: goalItem.updatedAt || item.updated_at,
        answers: goalItem.answers || {},
        isCompleted: goalItem.isCompleted || false,
        missionDetails: goalItem.missionDetails || undefined
      }))
    : [];
    
  return {
    id: item.id,
    title: item.title,
    category: validCategory,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    items: processedItems
  };
}

// Helper function to validate category
function isValidCategory(category: string): boolean {
  return ['foundation', 'monthly', 'impossible'].includes(category);
}
