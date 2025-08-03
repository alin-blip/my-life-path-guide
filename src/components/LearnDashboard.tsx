
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, Heart, Brain, Briefcase, Dumbbell, BookOpen, Users, Calendar, Headphones, Video, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CategoryCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  bgColor: string;
  id: string;
}

interface SubCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
}

interface LearnDashboardProps {
  onCategorySelect: (category: string) => void;
  activeCategory: string | null;
  categoryCounts?: Record<string, number>;
  onSubcategorySelect: (subcategory: string) => void;
  activeSubcategory: string;
}

export const LearnDashboard: React.FC<LearnDashboardProps> = ({ 
  onCategorySelect, 
  activeCategory,
  categoryCounts = {},
  onSubcategorySelect,
  activeSubcategory 
}) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const subcategories: SubCategory[] = [
    {
      id: 'courses',
      title: language === 'en' ? 'Courses' : 'Cursuri',
      icon: <Video className="w-4 h-4" />
    },
    {
      id: 'mastermind',
      title: 'Mastermind',
      icon: <Users className="w-4 h-4" />
    },
    {
      id: 'events',
      title: language === 'en' ? 'Events' : 'Eveniment',
      icon: <Calendar className="w-4 h-4" />
    },
    {
      id: 'podcast',
      title: 'Podcast',
      icon: <Headphones className="w-4 h-4" />
    },
    {
      id: 'ebook',
      title: 'E-book',
      icon: <BookOpen className="w-4 h-4" />
    },
    {
      id: 'audiobook',
      title: 'AudioBook',
      icon: <FileText className="w-4 h-4" />
    },
  ];

  const categories: CategoryCard[] = [
    {
      id: 'body',
      title: language === 'en' ? "Body" : "Corp",
      description: language === 'en' ? "Optimize your physical health, energy and vitality" : "Optimizează-ți sănătatea fizică, energia și vitalitatea",
      icon: <Dumbbell className="w-12 h-12 text-white" />,
      path: '/armory/body',
      bgColor: "bg-gradient-to-br from-red-900 to-red-700",
    },
    {
      id: 'balance',
      title: language === 'en' ? "Relationships" : "Relații",
      description: language === 'en' ? "Build deep connections and quality relationships" : "Construiește conexiuni profunde și relații de calitate",
      icon: <Heart className="w-12 h-12 text-white" />,
      path: '/armory/balance',
      bgColor: "bg-gradient-to-br from-pink-900 to-pink-700",
    },
    {
      id: 'being',
      title: language === 'en' ? "Spirituality" : "Spiritualitate",
      description: language === 'en' ? "Develop your emotional intelligence and mental clarity" : "Dezvoltă-ți inteligența emoțională și claritatea mentală",
      icon: <Brain className="w-12 h-12 text-white" />,
      path: '/armory/being',
      bgColor: "bg-gradient-to-br from-purple-900 to-purple-700",
    },
    {
      id: 'business',
      title: language === 'en' ? "Business" : "Afaceri",
      description: language === 'en' ? "Improve financial strategies and productivity" : "Îmbunătățește strategiile financiare și productivitatea",
      icon: <Briefcase className="w-12 h-12 text-white" />,
      path: '/armory/business',
      bgColor: "bg-gradient-to-br from-blue-900 to-blue-700",
    }
  ];

  const handleCardClick = (categoryId: string) => {
    onCategorySelect(categoryId);
  };

  const handleSubcategoryChange = (value: string) => {
    onSubcategorySelect(value);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Main Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {categories.map((category, index) => (
          <Card 
            key={index} 
            className={`overflow-hidden border-0 transition-all duration-300 hover:shadow-lg cursor-pointer ${category.bgColor} ${activeCategory === category.id ? 'ring-2 ring-white/30 shadow-lg' : ''}`}
            onClick={() => handleCardClick(category.id)}
          >
            <CardContent className="p-2 sm:p-3 md:p-4">
              <div className="flex flex-col items-center mb-1 sm:mb-2 text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white">
                  {React.cloneElement(category.icon as React.ReactElement, { 
                    className: "w-full h-full text-white" 
                  })}
                </div>
                <h2 className="text-sm sm:text-base md:text-lg font-semibold mt-1 sm:mt-2 text-white">{category.title}</h2>
                {categoryCounts && categoryCounts[category.id] > 0 && (
                  <div className="text-[10px] sm:text-xs text-white/80 mt-1">
                    {language === 'en' ? `${categoryCounts[category.id]} resources` : `${categoryCounts[category.id]} resurse`}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subcategories Tabs - Always show them */}
      <div className="mt-4 sm:mt-6 bg-gray-900 p-2 sm:p-3 md:p-4 rounded-lg shadow-lg">
        <Tabs defaultValue="courses" value={activeSubcategory} onValueChange={handleSubcategoryChange} className="w-full">
          <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 w-full bg-gray-800 gap-1">
            {subcategories.map((subcat) => (
              <TabsTrigger 
                key={subcat.id} 
                value={subcat.id} 
                className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-gray-700 text-xs sm:text-sm p-1 sm:p-2"
              >
                <span className="w-3 h-3 sm:w-4 sm:h-4">
                  {React.cloneElement(subcat.icon as React.ReactElement, { 
                    className: "w-full h-full" 
                  })}
                </span>
                <span className="hidden sm:inline">{subcat.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};
