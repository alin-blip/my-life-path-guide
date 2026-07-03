import React from 'react';
import {
  ResponsiveModal,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import { DailyHabit } from '@/hooks/useDailyHabits';
import { HabitSettingsPanel } from './HabitSettingsPanel';

interface HabitSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habits: DailyHabit[];
  onAdd: (habit: Omit<DailyHabit, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<DailyHabit | null>;
  onUpdate: (id: string, updates: Partial<DailyHabit>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRefetch: () => Promise<void>;
  onReorder?: (habits: DailyHabit[]) => Promise<void>;
}

export const HabitSettingsModal: React.FC<HabitSettingsModalProps> = ({
  open,
  onOpenChange,
  habits,
  onAdd,
  onUpdate,
  onDelete,
  onRefetch,
  onReorder,
}) => {
  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      className="max-w-md max-h-[80vh] overflow-y-auto"
    >
      <ResponsiveModalHeader>
        <ResponsiveModalTitle>Configurare Habits</ResponsiveModalTitle>
      </ResponsiveModalHeader>

      <HabitSettingsPanel
        habits={habits}
        onAdd={onAdd}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onReorder={onReorder}
      />
    </ResponsiveModal>
  );
};
