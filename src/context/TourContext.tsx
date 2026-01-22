import React, { createContext, useContext, useState, useCallback } from 'react';

interface TourContextValue {
  isTourActive: boolean;
  setIsTourActive: (active: boolean) => void;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  registerMobileMenuControl: (open: () => void, close: () => void) => void;
}

const TourContext = createContext<TourContextValue | undefined>(undefined);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [isTourActive, setIsTourActive] = useState(false);
  const [menuControls, setMenuControls] = useState<{ open: () => void; close: () => void } | null>(null);

  const registerMobileMenuControl = useCallback((open: () => void, close: () => void) => {
    setMenuControls({ open, close });
  }, []);

  const openMobileMenu = useCallback(() => {
    menuControls?.open();
  }, [menuControls]);

  const closeMobileMenu = useCallback(() => {
    menuControls?.close();
  }, [menuControls]);

  return (
    <TourContext.Provider value={{
      isTourActive,
      setIsTourActive,
      openMobileMenu,
      closeMobileMenu,
      registerMobileMenuControl
    }}>
      {children}
    </TourContext.Provider>
  );
}

export function useTourContext() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTourContext must be used within a TourProvider');
  }
  return context;
}
