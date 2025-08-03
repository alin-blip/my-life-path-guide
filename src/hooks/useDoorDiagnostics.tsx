
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { format, getWeek, getYear } from 'date-fns';

export function useDoorDiagnostics() {
  const { toast } = useToast();

  const runDiagnostics = () => {
    const diagnosticResults: string[] = [];
    
    // Check localStorage keys
    const allKeys = Object.keys(localStorage);
    const doorKeys = allKeys.filter(key => key.startsWith('door-'));
    
    diagnosticResults.push(`Found ${doorKeys.length} Door-related keys in localStorage:`);
    doorKeys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (key === 'door-hot-list') {
            diagnosticResults.push(`  - ${key}: ${parsed.length} items`);
          } else if (key.startsWith('door-week-')) {
            diagnosticResults.push(`  - ${key}: ${parsed.hitList?.length || 0} hit items, ${parsed.doList?.length || 0} do items`);
          }
        } catch (e) {
          diagnosticResults.push(`  - ${key}: Invalid JSON data`);
        }
      }
    });

    // Check current week data
    const today = new Date();
    const currentWeekKey = `door-week-${getYear(today)}-${getWeek(today)}`;
    const currentWeekData = localStorage.getItem(currentWeekKey);
    
    diagnosticResults.push(`\nCurrent week (${currentWeekKey}):`);
    if (currentWeekData) {
      try {
        const parsed = JSON.parse(currentWeekData);
        diagnosticResults.push(`  - Hit tasks: ${parsed.hitList?.length || 0}`);
        diagnosticResults.push(`  - Do tasks: ${parsed.doList?.length || 0}`);
        diagnosticResults.push(`  - Active day: ${parsed.activeDay || 'Not set'}`);
        diagnosticResults.push(`  - Selected domino: ${parsed.selectedDomino ? 'Yes' : 'No'}`);
      } catch (e) {
        diagnosticResults.push(`  - Error parsing data: ${e}`);
      }
    } else {
      diagnosticResults.push(`  - No data found for current week`);
    }

    // Check previous weeks (last 4 weeks)
    for (let i = 1; i <= 4; i++) {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - (i * 7));
      const pastWeekKey = `door-week-${getYear(pastDate)}-${getWeek(pastDate)}`;
      const pastWeekData = localStorage.getItem(pastWeekKey);
      
      if (pastWeekData) {
        try {
          const parsed = JSON.parse(pastWeekData);
          diagnosticResults.push(`Week ${i} ago (${pastWeekKey}): ${parsed.hitList?.length || 0} hit, ${parsed.doList?.length || 0} do`);
        } catch (e) {
          diagnosticResults.push(`Week ${i} ago (${pastWeekKey}): Invalid data`);
        }
      }
    }

    console.log('🔍 Door Diagnostics:', diagnosticResults.join('\n'));
    return diagnosticResults.join('\n');
  };

  const exportData = () => {
    const allKeys = Object.keys(localStorage);
    const doorKeys = allKeys.filter(key => key.startsWith('door-'));
    
    const exportData: {[key: string]: any} = {};
    doorKeys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          exportData[key] = JSON.parse(data);
        } catch (e) {
          exportData[key] = data; // Keep as string if can't parse
        }
      }
    });

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `door-backup-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Date exportate",
      description: "Backup-ul datelor Door a fost salvat",
    });
  };

  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        Object.entries(importedData).forEach(([key, value]) => {
          if (key.startsWith('door-')) {
            localStorage.setItem(key, JSON.stringify(value));
          }
        });

        toast({
          title: "Date importate",
          description: "Datele Door au fost restaurate cu succes",
        });
        
        // Refresh the page to reload data
        window.location.reload();
      } catch (error) {
        toast({
          title: "Eroare import",
          description: "Fișierul selectat nu este valid",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  return {
    runDiagnostics,
    exportData,
    importData
  };
}
