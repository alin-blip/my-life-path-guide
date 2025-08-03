
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { MissionCategory } from '@/types/mission';
import { ArrowRight, CheckCircle, Circle, Edit, PlusCircle } from 'lucide-react';

interface GameJourneyMapProps {
  category: MissionCategory;
}

export const GameJourneyMap: React.FC<GameJourneyMapProps> = ({ category }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const getCategoryColor = (type: 'bg' | 'text' | 'border') => {
    switch (category) {
      case 'body':
        return type === 'bg' ? 'bg-red-900/20' : type === 'text' ? 'text-red-400' : 'border-red-700';
      case 'being':
        return type === 'bg' ? 'bg-blue-900/20' : type === 'text' ? 'text-blue-400' : 'border-blue-700';
      case 'balance':
        return type === 'bg' ? 'bg-green-900/20' : type === 'text' ? 'text-green-400' : 'border-green-700';
      case 'business':
        return type === 'bg' ? 'bg-purple-900/20' : type === 'text' ? 'text-purple-400' : 'border-purple-700';
    }
  };

  const getCategoryName = () => {
    switch (category) {
      case 'body':
        return language === 'en' ? 'Body' : 'Corp';
      case 'being':
        return language === 'en' ? 'Being' : 'Ființă';
      case 'balance':
        return language === 'en' ? 'Balance' : 'Echilibru';
      case 'business':
        return language === 'en' ? 'Business' : 'Afacere';
    }
  };

  return (
    <div className={`p-6 ${getCategoryColor('bg')} rounded-lg`}>
      <h2 className={`text-2xl font-bold mb-6 ${getCategoryColor('text')}`}>
        {getCategoryName()}
      </h2>

      <div className="grid grid-cols-1 gap-8 mb-12">
        {/* Foundation - Current Reality */}
        <Card className="p-6 bg-gray-800/50 border border-gray-700">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-medium text-white mb-1">
                {language === 'en' ? '1. Current Reality' : '1. Realitatea Actuală'}
              </h3>
              <p className="text-gray-400 text-sm">
                {language === 'en' ? 'Define your starting point' : 'Definește punctul tău de plecare'}
              </p>
            </div>
            <div className="rounded-full p-1 bg-gray-500/20">
              <PlusCircle size={28} className="text-gray-400" />
            </div>
          </div>
          
          <Button 
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate(`/fact-maps?fromMission=true&category=foundation`)}
          >
            {language === 'en' ? 'Define Reality' : 'Definește Realitatea'}
          </Button>
        </Card>

        {/* Monthly Mission */}
        <Card className="p-6 bg-gray-800/50 border border-gray-700">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-medium text-white mb-1">
                {language === 'en' ? '2. Monthly Mission' : '2. Misiunea Lunară'}
              </h3>
              <p className="text-gray-400 text-sm">
                {language === 'en' ? 'Your next milestone to achieve' : 'Următorul tău obiectiv de atins'}
              </p>
            </div>
            <div className="rounded-full p-1 bg-gray-500/20">
              <PlusCircle size={28} className="text-gray-400" />
            </div>
          </div>
          
          <Button 
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate(`/fact-maps/monthly-mission?category=${category}`)}
          >
            {language === 'en' ? 'Create Mission' : 'Creează Misiune'}
          </Button>
        </Card>

        {/* Impossible Annual Goal */}
        <Card className="p-6 bg-gray-800/50 border border-gray-700">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-medium text-white mb-1">
                {language === 'en' ? '3. Annual Goal' : '3. Obiectivul Anual'}
              </h3>
              <p className="text-gray-400 text-sm">
                {language === 'en' ? 'Your impossible game for the year' : 'Jocul tău imposibil pentru an'}
              </p>
            </div>
            <div className="rounded-full p-1 bg-gray-500/20">
              <PlusCircle size={28} className="text-gray-400" />
            </div>
          </div>
          
          <Button 
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate(`/fact-maps/monthly-mission?category=${category}&isImpossible=true`)}
          >
            {language === 'en' ? 'Define Goal' : 'Definește Obiectivul'}
          </Button>
        </Card>
      </div>

      {/* Visual Path */}
      <div className="flex flex-col items-center">
        <div className="flex justify-center items-center w-full mb-8">
          <div className="flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center border-2 ${getCategoryColor('border')}`}>
              <span className="text-white">1</span>
            </div>
            <span className="text-xs text-gray-400 mt-2">
              {language === 'en' ? 'Reality' : 'Realitate'}
            </span>
          </div>
          <div className="h-1 w-16 bg-gray-700 relative flex items-center">
            <ArrowRight className="text-gray-600 absolute right-0" />
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center border-2 ${getCategoryColor('border')}`}>
              <span className="text-white">2</span>
            </div>
            <span className="text-xs text-gray-400 mt-2">
              {language === 'en' ? 'Monthly' : 'Lunar'}
            </span>
          </div>
          <div className="h-1 w-16 bg-gray-700 relative flex items-center">
            <ArrowRight className="text-gray-600 absolute right-0" />
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center border-2 ${getCategoryColor('border')}`}>
              <span className="text-white">3</span>
            </div>
            <span className="text-xs text-gray-400 mt-2">
              {language === 'en' ? 'Annual' : 'Anual'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
