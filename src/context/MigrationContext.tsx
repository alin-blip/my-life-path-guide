import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { migrationService, MigrationProgress } from '@/services/migrationService';

interface MigrationContextType {
  isMigrating: boolean;
  migrationNeeded: boolean;
  progress: MigrationProgress[];
  startMigration: () => Promise<void>;
  skipMigration: () => void;
  showMigrationUI: boolean;
}

const MigrationContext = createContext<MigrationContextType | undefined>(undefined);

export const MigrationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationNeeded, setMigrationNeeded] = useState(false);
  const [progress, setProgress] = useState<MigrationProgress[]>([]);
  const [showMigrationUI, setShowMigrationUI] = useState(false);

  useEffect(() => {
    const checkMigration = async () => {
      if (user) {
        const needed = await migrationService.checkMigrationNeeded(user.id);
        setMigrationNeeded(needed);
        setShowMigrationUI(needed);
      }
    };

    checkMigration();
  }, [user]);

  const startMigration = async () => {
    if (!user) return;

    setIsMigrating(true);
    setProgress([]);

    const result = await migrationService.migrateAll(user.id, (progressUpdate) => {
      setProgress(prev => {
        const index = prev.findIndex(p => p.type === progressUpdate.type);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = progressUpdate;
          return updated;
        }
        return [...prev, progressUpdate];
      });
    });

    setIsMigrating(false);

    if (result.success) {
      setMigrationNeeded(false);
      setShowMigrationUI(false);
      await migrationService.clearLocalStorageAfterMigration();
    }
  };

  const skipMigration = () => {
    setShowMigrationUI(false);
  };

  return (
    <MigrationContext.Provider
      value={{
        isMigrating,
        migrationNeeded,
        progress,
        startMigration,
        skipMigration,
        showMigrationUI
      }}
    >
      {children}
    </MigrationContext.Provider>
  );
};

export const useMigration = () => {
  const context = useContext(MigrationContext);
  if (context === undefined) {
    throw new Error('useMigration must be used within a MigrationProvider');
  }
  return context;
};
