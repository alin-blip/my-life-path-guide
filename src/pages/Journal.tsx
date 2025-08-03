
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { JournalEntry } from '@/components/journal/JournalEntry';
import { JournalList } from '@/components/journal/JournalList';
import { JournalDetail } from '@/components/journal/JournalDetail';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PlusCircle, BookOpen } from 'lucide-react';

interface JournalEntryType {
  id: string;
  title: string;
  content: string;
  lesson: string;
  date: string;
  timestamp?: string;
}

const JournalPage = () => {
  const [activeTab, setActiveTab] = useState<string>("list");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntryType | null>(null);

  useEffect(() => {
    if (selectedEntry) {
      setActiveTab("detail");
    }
  }, [selectedEntry]);

  const handleCreateNewEntry = () => {
    setSelectedEntry(null);
    setActiveTab("new");
  };

  const handleEntrySaved = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab("list");
  };

  const handleSelectEntry = (entry: JournalEntryType) => {
    setSelectedEntry(entry);
  };

  const handleBackToList = () => {
    setSelectedEntry(null);
    setActiveTab("list");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 pb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent flex items-center">
            <BookOpen className="mr-2 h-8 w-8 text-indigo-400" />
            Jurnal Personal
          </h1>
          <p className="text-muted-foreground max-w-md">
            Documentează experiențele tale zilnice, sentimentele și lecțiile învățate pentru a accelera creșterea personală.
          </p>
        </div>

        <div className="mb-6">
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white" 
            onClick={handleCreateNewEntry}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Intrare nouă în jurnal
          </Button>
        </div>

        <Tabs 
          defaultValue="list" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="bg-indigo-900/20 border border-indigo-500/10 w-full mb-6 backdrop-blur-sm">
            <TabsTrigger 
              value="list" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-indigo-400/10 data-[state=active]:text-indigo-400 transition-all duration-300"
            >
              Istoric jurnal
            </TabsTrigger>
            <TabsTrigger 
              value="new" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-indigo-400/10 data-[state=active]:text-indigo-400 transition-all duration-300"
            >
              Intrare nouă
            </TabsTrigger>
            {selectedEntry && (
              <TabsTrigger 
                value="detail" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-indigo-400/10 data-[state=active]:text-indigo-400 transition-all duration-300"
              >
                Detalii intrare
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="list" className="animate-fade-in">
            <JournalList 
              onSelectEntry={handleSelectEntry} 
              key={`journal-list-${refreshTrigger}`} 
            />
          </TabsContent>
          
          <TabsContent value="new" className="animate-fade-in">
            <JournalEntry onEntrySaved={handleEntrySaved} />
          </TabsContent>
          
          {selectedEntry && (
            <TabsContent value="detail" className="animate-fade-in">
              <JournalDetail entry={selectedEntry} onBack={handleBackToList} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

export default JournalPage;
