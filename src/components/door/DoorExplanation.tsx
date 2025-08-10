
import React from 'react';
import { KeyRound, Sparkles, Flame, Trophy, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const DoorExplanation: React.FC = () => {
  const { language } = useLanguage();
  
  return (
    <div className="mb-4 sm:mb-6 bg-gradient-to-br from-[#1E293B] to-[#2A3A53] rounded-xl shadow-lg p-3 sm:p-6 border border-blue-500/20 animate-fade-in">
      <div className="flex items-center mb-4">
        <KeyRound className="w-6 h-6 mr-3 text-blue-400" />
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          {language === 'en' ? 'To Do - The Pillar of Focus and Production' : 'De Făcut - Stâlpul Concentrării și Producției'}
        </h2>
      </div>
      
      <div className="text-gray-300 mb-6 leading-relaxed">
        <p className="mb-4">
          {language === 'en' 
            ? 'To Do represents the game of daily production. While Stack handles perspective and Core Four provides power, To Do focuses on daily productivity, answering the question: "What do I do today?"'
            : 'De Făcut reprezintă jocul producției zilnice. În timp ce Stack se ocupă de perspectivă și Core Four oferă putere, De Făcut se concentrează pe productivitatea zilnică, răspunzând la întrebarea: "Ce fac azi?"'}
        </p>
        <p>
          {language === 'en'
            ? 'The system works on the premise that "doing more" doesn\'t necessarily mean "achieving more". The goal is not to just do more things, but to do what matters to get clear results.'
            : 'Sistemul funcționează pe premisa că "a face mai mult" nu înseamnă neapărat "a obține mai mult". Scopul nu este doar să faci mai multe lucruri, ci să faci ceea ce contează pentru a obține rezultate clare.'}
        </p>
      </div>
      
      <Accordion type="single" collapsible className="border-t border-blue-500/20 pt-2">
        <AccordionItem value="components" className="border-b-0">
          <AccordionTrigger className="text-blue-400 hover:text-blue-300 py-2">
            {language === 'en' ? 'The Four Components of To Do' : 'Cele Patru Componente ale Aplicației De Făcut'}
          </AccordionTrigger>
          <AccordionContent className="text-gray-300">
            <div className="space-y-4 mt-2">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mr-3">
                  <Flame className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-orange-400">
                    {language === 'en' ? 'Potential' : 'Potențial'}
                  </h3>
                  <p className="text-sm mt-1">
                    {language === 'en' 
                      ? 'The Hot List with all your ideas and action options.' 
                      : 'Lista de idei cu toate ideile și opțiunile tale de acțiune.'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center mr-3">
                  <KeyRound className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-400">
                    {language === 'en' ? 'Planning' : 'Planificare'}
                  </h3>
                  <p className="text-sm mt-1">
                    {language === 'en' 
                      ? 'Selecting one priority item as your Domino Door - the action that will have the greatest impact.' 
                      : 'Selectarea unui element prioritar ca Ușa Domino - acțiunea care va avea cel mai mare impact.'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center mr-3">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-purple-400">
                    {language === 'en' ? 'Production' : 'Producție'}
                  </h3>
                  <p className="text-sm mt-1">
                    {language === 'en' 
                      ? 'Your Hit List and Do List - the essential actions for your daily focus.' 
                      : 'Lista de Lovituri și Lista de Sarcini - acțiunile esențiale pentru focusul tău zilnic.'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mr-3">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-green-400">
                    {language === 'en' ? 'Profit' : 'Profit'}
                  </h3>
                  <p className="text-sm mt-1">
                    {language === 'en' 
                      ? 'The results obtained from production - tracking your completed tasks and achievements.' 
                      : 'Rezultatele obținute din producție - urmărirea sarcinilor și realizărilor completate.'}
                  </p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <div className="mt-4 flex justify-end">
        <div className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer group">
          <span>{language === 'en' ? 'Start creating your To Do lists' : 'Începe să-ți creezi listele De Făcut'}</span>
          <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};
