export type WidgetType = 
  | 'counter'
  | 'tracker'
  | 'goal'
  | 'chart'
  | 'checklist'
  | 'timer'
  | 'notes';

export type WidgetVisualization = 
  | 'number'
  | 'progress_bar'
  | 'pie'
  | 'line_chart'
  | 'bar_chart'
  | 'list';

export type WidgetLayout = 'vertical' | 'horizontal' | 'compact';

export type WidgetColor = 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'yellow' | 'pink' | 'cyan';

export interface WidgetField {
  name: string;
  type: 'number' | 'text' | 'boolean' | 'date';
  label: string;
  defaultValue?: any;
  min?: number;
  max?: number;
}

export interface WidgetConfig {
  type: WidgetType;
  layout: WidgetLayout;
  visualization: WidgetVisualization;
  color: WidgetColor;
  icon: string;
  fields: WidgetField[];
  goal?: number;
  unit?: string;
  dataSource?: 'custom' | 'champion_routine' | 'workout_sessions' | 'daily_habits';
}

export interface CustomWidget {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  config: WidgetConfig;
  is_template: boolean;
  is_public: boolean;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface WidgetTemplate {
  id: string;
  name: string;
  description?: string;
  config: WidgetConfig;
  category?: string;
  icon?: string;
  is_official: boolean;
  usage_count: number;
  creator_user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface WidgetData {
  id: string;
  widget_id: string;
  user_id: string;
  date: string;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const WIDGET_ICONS = [
  'Book', 'Heart', 'Target', 'Clock', 'Check', 'Star', 'Trophy', 'Flame',
  'Dumbbell', 'Brain', 'Coffee', 'Sun', 'Moon', 'Droplet', 'Apple', 'Smile'
];

export const WIDGET_CATEGORIES = [
  { value: 'fitness', label: 'Fitness', labelEn: 'Fitness' },
  { value: 'productivity', label: 'Productivitate', labelEn: 'Productivity' },
  { value: 'mindset', label: 'Mindset', labelEn: 'Mindset' },
  { value: 'health', label: 'Sănătate', labelEn: 'Health' },
  { value: 'learning', label: 'Învățare', labelEn: 'Learning' },
  { value: 'relationships', label: 'Relații', labelEn: 'Relationships' },
  { value: 'finance', label: 'Finanțe', labelEn: 'Finance' },
  { value: 'other', label: 'Altele', labelEn: 'Other' },
];
