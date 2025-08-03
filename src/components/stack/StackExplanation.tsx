
import React from 'react';
import { FileStack, Sparkles, Flame, Hammer } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const StackExplanation: React.FC = () => {
  const { language } = useLanguage();
  
  return (
    <div className="mb-8 bg-gradient-to-br from-[#1E293B] to-[#2A3A53] rounded-xl shadow-lg p-6 border border-purple-500/20 animate-fade-in">
      <div className="flex items-center mb-4">
        <FileStack className="w-6 h-6 mr-3 text-purple-400" />
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          {language === 'en' ? 'The Stack - The Pillar of Perspective and Power' : 'Stack - Stâlpul Perspectivei și Puterii'}
        </h2>
      </div>
      
      <div className="text-gray-300 mb-6 leading-relaxed">
        <p className="mb-4">
          {language === 'en' 
            ? 'Stack is a process where we stop and examine our inner stories and perspectives. It provides a structured way to clarify thoughts, process emotions, and create breakthroughs in any area of life.'
            : 'Stack este un proces prin care ne oprim și examinăm poveștile și perspectivele noastre interioare. Oferă o modalitate structurată de a clarifica gândurile, de a procesa emoțiile și de a crea progrese în orice domeniu al vieții.'}
        </p>
        <p>
          {language === 'en'
            ? 'Through four key steps - Stop, Submit, Struggle and Strike - Stack helps you transform limiting stories into powerful perspectives that drive positive action.'
            : 'Prin patru pași cheie - Oprirea, Supunerea, Lupta și Lovitura - Stack te ajută să transformi poveștile limitative în perspective puternice care conduc la acțiuni pozitive.'}
        </p>
      </div>
      
      <Accordion type="single" collapsible className="border-t border-purple-500/20 pt-2">
        <AccordionItem value="components" className="border-b-0">
          <AccordionTrigger className="text-purple-400 hover:text-purple-300 py-2">
            {language === 'en' ? 'The Four Steps of Stack' : 'Cei Patru Pași ai Stack-ului'}
          </AccordionTrigger>
          <AccordionContent className="text-gray-300">
            <div className="space-y-4 mt-2">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mr-3">
                  <Hammer className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-400">
                    {language === 'en' ? 'Stop' : 'Oprirea'}
                  </h3>
                  <p className="text-sm mt-1">
                    {language === 'en' 
                      ? 'Creating a deliberate pause to observe your thoughts and emotions without judgment.' 
                      : 'Crearea unei pauze deliberate pentru a-ți observa gândurile și emoțiile fără judecată.'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center mr-3">
                  <Flame className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-purple-400">
                    {language === 'en' ? 'Submit' : 'Supunerea'}
                  </h3>
                  <p className="text-sm mt-1">
                    {language === 'en' 
                      ? 'Acknowledging the truth about where you are and what you truly want.' 
                      : 'Recunoașterea adevărului despre unde te afli și ce îți dorești cu adevărat.'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mr-3">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-orange-400">
                    {language === 'en' ? 'Struggle' : 'Lupta'}
                  </h3>
                  <p className="text-sm mt-1">
                    {language === 'en' 
                      ? 'Fighting to break free from limiting stories and perspectives.' 
                      : 'Lupta pentru a te elibera de poveștile și perspectivele care te limitează.'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mr-3">
                  <Hammer className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-green-400">
                    {language === 'en' ? 'Strike' : 'Lovitura'}
                  </h3>
                  <p className="text-sm mt-1">
                    {language === 'en' 
                      ? 'Taking decisive action based on your new perspective and clarity.' 
                      : 'Luarea de acțiuni decisive bazate pe noua ta perspectivă și claritate.'}
                  </p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
