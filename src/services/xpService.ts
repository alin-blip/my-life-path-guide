// XP Service - allows awarding XP from anywhere in the app
// Uses custom events to communicate with the useXPSystem hook

export type XPReason = 
  | 'stack_completed'
  | 'core4_completed'
  | 'biz4_completed'
  | 'page_read'
  | 'action_completed'
  | 'daily_streak'
  | 'journal_entry'
  | 'weekly_planning';

export const XP_AMOUNTS: Record<XPReason, number> = {
  stack_completed: 50,
  core4_completed: 100,
  biz4_completed: 100,
  page_read: 5,
  action_completed: 10,
  daily_streak: 20,
  journal_entry: 30,
  weekly_planning: 50,
};

export const XP_LABELS: Record<XPReason, string> = {
  stack_completed: 'Stack completat',
  core4_completed: 'Core 4 completat',
  biz4_completed: 'Biz 4 completat',
  page_read: 'Pagină citită',
  action_completed: 'Acțiune completată',
  daily_streak: 'Streak zilnic',
  journal_entry: 'Jurnal completat',
  weekly_planning: 'Plan săptămânal completat',
};

export interface XPAwardEvent {
  amount: number;
  reason: string;
}

/**
 * Award XP to the user. This dispatches a custom event that is
 * listened to by the Dashboard component which has access to useXPSystem.
 */
export const awardXP = (reason: XPReason, customAmount?: number): void => {
  const amount = customAmount ?? XP_AMOUNTS[reason];
  const label = XP_LABELS[reason];
  
  console.log(`🎮 XP Award: +${amount} XP for "${label}"`);
  
  window.dispatchEvent(new CustomEvent<XPAwardEvent>('xp-award', {
    detail: { amount, reason: label }
  }));
};

/**
 * Award custom XP with a custom reason string
 */
export const awardCustomXP = (amount: number, reason: string): void => {
  console.log(`🎮 XP Award: +${amount} XP for "${reason}"`);
  
  window.dispatchEvent(new CustomEvent<XPAwardEvent>('xp-award', {
    detail: { amount, reason }
  }));
};
