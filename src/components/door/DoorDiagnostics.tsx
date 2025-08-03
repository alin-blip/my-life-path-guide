
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Upload, Bug, FileText } from 'lucide-react';
import { useDoorDiagnostics } from '@/hooks/useDoorDiagnostics';
import { useLanguage } from '@/context/LanguageContext';

export const DoorDiagnostics: React.FC = () => {
  const { runDiagnostics, exportData, importData } = useDoorDiagnostics();
  const { t } = useLanguage();
  const [diagnosticResults, setDiagnosticResults] = useState<string>('');

  const handleRunDiagnostics = () => {
    const results = runDiagnostics();
    setDiagnosticResults(results);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importData(file);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-400">
          <Bug className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#1A1F2C] border-[#2A3A53] text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-blue-400">Door Diagnostics & Backup</DialogTitle>
          <DialogDescription className="text-gray-300">
            Verifică și gestionează datele tale Door
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="diagnostics" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#232B3C]">
            <TabsTrigger value="diagnostics" className="text-gray-300">Diagnostic</TabsTrigger>
            <TabsTrigger value="backup" className="text-gray-300">Backup</TabsTrigger>
            <TabsTrigger value="help" className="text-gray-300">Ajutor</TabsTrigger>
          </TabsList>
          
          <TabsContent value="diagnostics" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-gray-300">Verifică starea datelor tale Door:</p>
              <Button onClick={handleRunDiagnostics} size="sm">
                <Bug className="w-4 h-4 mr-2" />
                Rulează Diagnostic
              </Button>
            </div>
            
            {diagnosticResults && (
              <ScrollArea className="h-64 w-full rounded border border-[#2A3A53] p-4">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                  {diagnosticResults}
                </pre>
              </ScrollArea>
            )}
          </TabsContent>
          
          <TabsContent value="backup" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-medium mb-2 text-blue-400">Export Date</h4>
                <p className="text-gray-300 mb-4">Salvează toate datele Door într-un fișier backup:</p>
                <Button onClick={exportData} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Exportă Toate Datele
                </Button>
              </div>
              
              <div>
                <h4 className="text-lg font-medium mb-2 text-blue-400">Import Date</h4>
                <p className="text-gray-300 mb-4">Restaurează datele dintr-un fișier backup:</p>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="outline" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Selectează Fișier Backup
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="help" className="space-y-4">
            <div className="space-y-4 text-gray-300">
              <div>
                <h4 className="text-lg font-medium mb-2 text-blue-400">Probleme Comune</h4>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>Task-urile dispar:</strong> Datele sunt organizate pe săptămâni. Verifică săptămâna corectă.</li>
                  <li>• <strong>Nu văd task-urile de ieri:</strong> Folosește săgețile pentru a naviga la săptămâna anterioară.</li>
                  <li>• <strong>Datele se pierd:</strong> Folosește funcția de backup pentru a salva datele periodic.</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-medium mb-2 text-blue-400">Cum Funcționează Salvarea</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Datele se salvează automat în browser (localStorage)</li>
                  <li>• Fiecare săptămână are propria colecție de date</li>
                  <li>• Hot List-ul este partajat între toate săptămânile</li>
                  <li>• Hit/Do tasks sunt specifice fiecărei zile</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
