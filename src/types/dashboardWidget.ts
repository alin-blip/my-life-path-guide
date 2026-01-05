export type WidgetSize = 'small' | 'medium' | 'large';

export interface DashboardWidget {
  id: string;
  enabled: boolean;
  order: number;
  size: WidgetSize;
}

export interface DashboardWidgetsConfig {
  widgets: DashboardWidget[];
}

export interface WidgetDefinition {
  id: string;
  name: { en: string; ro: string };
  description: { en: string; ro: string };
  icon: string;
  defaultSize: WidgetSize;
  category: 'fitness' | 'productivity' | 'mindset' | 'tracking' | 'routine';
}
