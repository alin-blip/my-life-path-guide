
import React from 'react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/context/LanguageContext';
import { Tent, Calendar, Clock, ChartBar } from 'lucide-react';

const GeneralsTent = () => {
  const { language } = useLanguage();

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-8">
        <div className="flex items-center gap-3 mb-6">
          <Tent className="h-8 w-8 text-warrior-accent" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {language === 'en' ? "General's Tent" : "Cortul Generalului"}
            </h1>
            <p className="text-muted-foreground">
              {language === 'en' 
                ? "Weekly review and strategic planning"
                : "Evaluare săptămânală și planificare strategică"}
            </p>
          </div>
        </div>

        <Tabs defaultValue="weekly-review" className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="weekly-review">
              {language === 'en' ? "Weekly Review" : "Evaluare Săptămânală"}
            </TabsTrigger>
            <TabsTrigger value="monthly-planning">
              {language === 'en' ? "Monthly Planning" : "Planificare Lunară"}
            </TabsTrigger>
            <TabsTrigger value="quarterly-strategy">
              {language === 'en' ? "Quarterly Strategy" : "Strategie Trimestrială"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weekly-review">
            <Card className="p-6 bg-warrior-DEFAULT border-warrior-muted/20">
              <div className="flex items-center mb-4">
                <Calendar className="h-5 w-5 text-warrior-accent mr-2" />
                <h3 className="text-xl font-semibold">
                  {language === 'en' ? "Week of April 1-7, 2025" : "Săptămâna 1-7 Aprilie, 2025"}
                </h3>
              </div>
              
              <p className="text-muted-foreground mb-6">
                {language === 'en' 
                  ? "Review your progress across all domains and plan your next week."
                  : "Evaluează-ți progresul în toate domeniile și planifică săptămâna următoare."}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">
                    {language === 'en' ? "Weekly Score" : "Scor Săptămânal"}
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="text-4xl font-bold">18/21</div>
                    <div className="text-green-500 text-sm">+3</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">
                    {language === 'en' ? "Core 4 Completion" : "Completare Core 4"}
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="text-4xl font-bold">85%</div>
                    <div className="text-green-500 text-sm">+5%</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h4 className="font-medium mb-4">
                  {language === 'en' ? "Actions for Next Week" : "Acțiuni pentru Săptămâna Viitoare"}
                </h4>
                <div className="space-y-2">
                  <div className="p-3 bg-warrior-muted/10 rounded-md border border-warrior-muted/20">
                    {language === 'en' ? "Complete Door planning by Monday" : "Completează planificarea Door până luni"}
                  </div>
                  <div className="p-3 bg-warrior-muted/10 rounded-md border border-warrior-muted/20">
                    {language === 'en' ? "Finish monthly mission questionnaire" : "Finalizează chestionarul misiunii lunare"}
                  </div>
                  <div className="p-3 bg-warrior-muted/10 rounded-md border border-warrior-muted/20">
                    {language === 'en' ? "Update Core 4 daily scores" : "Actualizează scorurile zilnice Core 4"}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="monthly-planning">
            <Card className="p-6 bg-warrior-DEFAULT border-warrior-muted/20">
              <div className="flex justify-center items-center h-40">
                <p className="text-muted-foreground">
                  {language === 'en' 
                    ? "Monthly planning content will be available soon."
                    : "Conținutul pentru planificarea lunară va fi disponibil în curând."}
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="quarterly-strategy">
            <Card className="p-6 bg-warrior-DEFAULT border-warrior-muted/20">
              <div className="flex justify-center items-center h-40">
                <p className="text-muted-foreground">
                  {language === 'en' 
                    ? "Quarterly strategy content will be available soon."
                    : "Conținutul pentru strategia trimestrială va fi disponibil în curând."}
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default GeneralsTent;
