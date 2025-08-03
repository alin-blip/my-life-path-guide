
export function useDoorStorageStats() {
  const getStorageStats = () => {
    const stats = {
      totalKeys: 0,
      doorKeys: 0,
      totalSize: 0,
      weekKeys: [] as string[]
    };
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        stats.totalKeys++;
        const value = localStorage.getItem(key) || '';
        stats.totalSize += key.length + value.length;
        
        if (key.startsWith('door-')) {
          stats.doorKeys++;
          if (key.startsWith('door-week-')) {
            stats.weekKeys.push(key);
          }
        }
      }
    }
    
    return stats;
  };

  return { getStorageStats };
}
