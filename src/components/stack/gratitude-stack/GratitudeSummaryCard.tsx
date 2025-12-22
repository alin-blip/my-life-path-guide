import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Heart, Briefcase, Star, Download, RotateCcw, Share2 } from 'lucide-react';
import { getGratitudeCategories } from './questions';

interface GratitudeSummaryCardProps {
  answers: Record<number, string>;
  onReset?: () => void;
  onShare?: () => void;
  onExport?: () => void;
}

export const GratitudeSummaryCard: React.FC<GratitudeSummaryCardProps> = ({
  answers,
  onReset,
  onShare,
  onExport
}) => {
  const categories = getGratitudeCategories();
  const stackTitle = answers[0] || "Stack de Recunoștință";

  const getCategoryIcon = (key: string) => {
    switch (key) {
      case 'world': return <Globe className="h-5 w-5" />;
      case 'personal': return <Heart className="h-5 w-5" />;
      case 'professional': return <Briefcase className="h-5 w-5" />;
      case 'self': return <Star className="h-5 w-5" />;
      default: return null;
    }
  };

  const getCategoryGradient = (key: string) => {
    switch (key) {
      case 'world': return 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40';
      case 'personal': return 'from-pink-500/20 to-rose-500/20 border-pink-500/40';
      case 'professional': return 'from-blue-500/20 to-indigo-500/20 border-blue-500/40';
      case 'self': return 'from-amber-500/20 to-yellow-500/20 border-amber-500/40';
      default: return 'from-gray-500/20 to-gray-500/20 border-gray-500/40';
    }
  };

  const getCategoryTextColor = (key: string) => {
    switch (key) {
      case 'world': return 'text-emerald-300';
      case 'personal': return 'text-pink-300';
      case 'professional': return 'text-blue-300';
      case 'self': return 'text-amber-300';
      default: return 'text-gray-300';
    }
  };

  const getCategoryIconColor = (key: string) => {
    switch (key) {
      case 'world': return 'text-emerald-400';
      case 'personal': return 'text-pink-400';
      case 'professional': return 'text-blue-400';
      case 'self': return 'text-amber-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main Summary Card */}
      <Card className="bg-gradient-to-br from-emerald-900/30 via-teal-900/20 to-cyan-900/30 border-emerald-500/30 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
        
        <CardHeader className="relative">
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
            🙏 {stackTitle}
          </CardTitle>
          <p className="text-center text-emerald-200/70 text-sm mt-2">
            Cele 12 lucruri pentru care ești recunoscător astăzi
          </p>
        </CardHeader>
        
        <CardContent className="relative space-y-4">
          {Object.entries(categories).map(([key, category], categoryIndex) => (
            <div 
              key={key}
              className={`bg-gradient-to-r ${getCategoryGradient(key)} border rounded-xl p-4 transform transition-all duration-500 hover:scale-[1.02]`}
              style={{ 
                animationDelay: `${categoryIndex * 150}ms`,
                animation: 'slideInFromRight 0.5s ease-out forwards',
                opacity: 0
              }}
            >
              <div className={`flex items-center gap-2 mb-3 ${getCategoryIconColor(key)}`}>
                {getCategoryIcon(key)}
                <h3 className={`font-semibold ${getCategoryTextColor(key)}`}>
                  {category.label}
                </h3>
              </div>
              
              <ul className="space-y-2">
                {[category.start, category.start + 1, category.start + 2].map((questionIndex, itemIndex) => (
                  answers[questionIndex] && (
                    <li 
                      key={questionIndex}
                      className="flex items-start gap-3 text-gray-200 text-sm animate-fade-in"
                      style={{ 
                        animationDelay: `${(categoryIndex * 150) + (itemIndex * 100)}ms` 
                      }}
                    >
                      <span className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${getCategoryGradient(key).replace('/20', '/40')} flex items-center justify-center text-xs font-bold ${getCategoryTextColor(key)}`}>
                        {itemIndex + 1}
                      </span>
                      <span className="leading-relaxed">{answers[questionIndex]}</span>
                    </li>
                  )
                ))}
              </ul>
            </div>
          ))}
          
          {/* Insight Section */}
          {answers[13] && (
            <div 
              className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/40 rounded-xl p-4 mt-6 animate-fade-in"
              style={{ animationDelay: '600ms' }}
            >
              <div className="flex items-center gap-2 mb-2 text-purple-300">
                <Star className="h-5 w-5 text-purple-400" />
                <h3 className="font-semibold">Realizare Cheie</h3>
              </div>
              <p className="text-gray-200 text-sm italic">"{answers[13]}"</p>
            </div>
          )}
          
          {/* Action Section */}
          {answers[14] && (
            <div 
              className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/40 rounded-xl p-4 animate-fade-in"
              style={{ animationDelay: '700ms' }}
            >
              <div className="flex items-center gap-2 mb-2 text-green-300">
                <Heart className="h-5 w-5 text-green-400" />
                <h3 className="font-semibold">Acțiune de Recunoștință</h3>
              </div>
              <p className="text-gray-200 text-sm">{answers[14]}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center animate-fade-in" style={{ animationDelay: '800ms' }}>
        {onReset && (
          <Button
            variant="outline"
            onClick={onReset}
            className="border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/20"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Stack Nou
          </Button>
        )}
        {onShare && (
          <Button
            variant="outline"
            onClick={onShare}
            className="border-blue-500/50 text-blue-300 hover:bg-blue-500/20"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Partajează
          </Button>
        )}
        {onExport && (
          <Button
            variant="outline"
            onClick={onExport}
            className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportă PDF
          </Button>
        )}
      </div>
      
      {/* Motivational Quote */}
      <div className="text-center py-4 animate-fade-in" style={{ animationDelay: '900ms' }}>
        <p className="text-gray-400 text-sm italic">
          "Recunoștința transformă ceea ce avem în suficient, și mai mult."
        </p>
        <p className="text-gray-500 text-xs mt-1">— Melody Beattie</p>
      </div>
      
      <style>{`
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};
