import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Globe, User, Briefcase, Star } from 'lucide-react';

export const GratitudeStackExplanation: React.FC = () => {
  return (
    <Card className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-700/50 mb-6">
      <CardHeader>
        <CardTitle className="text-emerald-300 flex items-center gap-2">
          <Heart className="h-6 w-6" />
          Stack-ul de Recunoștință
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-gray-300">
        <p>
          Acest stack te ghidează printr-un proces de recunoștință profundă, 
          explorând 4 domenii ale vieții tale:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-emerald-900/30 rounded-lg p-4 border border-emerald-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-5 w-5 text-emerald-400" />
              <h3 className="font-semibold text-emerald-300">Lume</h3>
            </div>
            <p className="text-sm">3 lucruri din lume pentru care ești recunoscător</p>
          </div>
          
          <div className="bg-pink-900/30 rounded-lg p-4 border border-pink-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-5 w-5 text-pink-400" />
              <h3 className="font-semibold text-pink-300">Viață Personală</h3>
            </div>
            <p className="text-sm">3 lucruri din viața ta personală</p>
          </div>
          
          <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="h-5 w-5 text-blue-400" />
              <h3 className="font-semibold text-blue-300">Viață Profesională</h3>
            </div>
            <p className="text-sm">3 lucruri din viața ta profesională</p>
          </div>
          
          <div className="bg-amber-900/30 rounded-lg p-4 border border-amber-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-amber-400" />
              <h3 className="font-semibold text-amber-300">Despre Tine</h3>
            </div>
            <p className="text-sm">3 lucruri despre tine însuți/însăți</p>
          </div>
        </div>
        
        <p className="text-sm text-gray-400 italic">
          "Recunoștința transformă ceea ce avem în suficient." – Melody Beattie
        </p>
      </CardContent>
    </Card>
  );
};
