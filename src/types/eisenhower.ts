// Eisenhower Matrix - 4 Quadrants based on Importance and Urgency

export type EisenhowerQuadrant = 
  | 'q1_reactor'      // Important + Urgent → DO NOW
  | 'q2_creator'      // Important + NOT Urgent → SCHEDULE (BEST!)
  | 'q3_delegator'    // NOT Important + Urgent → DELEGATE
  | 'q4_eliminator'   // NOT Important + NOT Urgent → DELETE
  | 'unset';          // Not classified yet

export interface QuadrantConfig {
  id: EisenhowerQuadrant;
  label: string;
  labelRo: string;
  action: string;
  actionRo: string;
  important: boolean;
  urgent: boolean;
  color: string;
  bgColor: string;
  borderColor: string;
  hoverBgColor: string;
  icon: string;
  priority: number; // For DB mapping
}

export const EISENHOWER_QUADRANTS: Record<EisenhowerQuadrant, QuadrantConfig> = {
  q2_creator: {
    id: 'q2_creator',
    label: 'Creator',
    labelRo: 'Creator',
    action: 'Plan & Schedule',
    actionRo: 'Planifică',
    important: true,
    urgent: false,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30',
    hoverBgColor: 'hover:bg-green-500/30',
    icon: '✨',
    priority: 3
  },
  q1_reactor: {
    id: 'q1_reactor',
    label: 'Reactor',
    labelRo: 'Reactor',
    action: 'Do Now',
    actionRo: 'Fă ACUM',
    important: true,
    urgent: true,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30',
    hoverBgColor: 'hover:bg-red-500/30',
    icon: '⚡',
    priority: 4
  },
  q3_delegator: {
    id: 'q3_delegator',
    label: 'Delegator',
    labelRo: 'Delegator',
    action: 'Delegate',
    actionRo: 'Delegă',
    important: false,
    urgent: true,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/30',
    hoverBgColor: 'hover:bg-orange-500/30',
    icon: '👥',
    priority: 2
  },
  q4_eliminator: {
    id: 'q4_eliminator',
    label: 'Eliminator',
    labelRo: 'Eliminator',
    action: 'Delete',
    actionRo: 'Șterge',
    important: false,
    urgent: false,
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/20',
    borderColor: 'border-gray-500/30',
    hoverBgColor: 'hover:bg-gray-500/30',
    icon: '🗑️',
    priority: 1
  },
  unset: {
    id: 'unset',
    label: 'Unset',
    labelRo: 'Nesetat',
    action: 'Classify',
    actionRo: 'Clasifică',
    important: false,
    urgent: false,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    borderColor: 'border-muted',
    hoverBgColor: 'hover:bg-muted',
    icon: '❓',
    priority: 0
  }
};

// Helper: priority number → quadrant
export function priorityToQuadrant(priority: number): EisenhowerQuadrant {
  switch (priority) {
    case 4: return 'q1_reactor';
    case 3: return 'q2_creator';
    case 2: return 'q3_delegator';
    case 1: return 'q4_eliminator';
    default: return 'unset';
  }
}

// Helper: quadrant → priority number
export function quadrantToPriority(quadrant: EisenhowerQuadrant): number {
  return EISENHOWER_QUADRANTS[quadrant].priority;
}

// Get quadrant config by priority
export function getQuadrantByPriority(priority: number): QuadrantConfig {
  const quadrant = priorityToQuadrant(priority);
  return EISENHOWER_QUADRANTS[quadrant];
}

// Get all quadrants for selection (excluding 'unset')
export function getSelectableQuadrants(): QuadrantConfig[] {
  return [
    EISENHOWER_QUADRANTS.q1_reactor,
    EISENHOWER_QUADRANTS.q2_creator,
    EISENHOWER_QUADRANTS.q3_delegator,
    EISENHOWER_QUADRANTS.q4_eliminator
  ];
}
