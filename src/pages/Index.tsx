
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Users, Brain, Target, Heart, Dumbbell, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";

const Index = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      {/* Language Selector */}
      <div className="absolute top-6 right-6 z-10">
        <LanguageSelector />
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-4">
              <span className="font-bold text-white text-3xl">H</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            {language === 'en' ? 'HAVE IT ALL Lifestyle Accelerator' : 'Acceleratorul HAVE IT ALL Lifestyle'}
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            {language === 'en' 
              ? 'Transform your body, relationships, and business. Build an extraordinary life with the proven HAVE IT ALL system.' 
              : 'Transformă-ți corpul, relațiile și afacerea. Construiește o viață extraordinară cu sistemul HAVE IT ALL dovedit.'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold"
            >
              {language === 'en' ? 'Start Your Journey' : 'Începe Călătoria'}
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/auth')}
              className="border-gray-600 text-white hover:bg-gray-800 px-8 py-4 text-lg"
            >
              {language === 'en' ? 'Learn More' : 'Află Mai Mult'}
            </Button>
          </div>
        </div>

        {/* Core 4 Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-gradient-to-br from-red-900/40 to-red-700/40 p-6 rounded-xl border border-red-500/20">
            <Dumbbell className="w-12 h-12 text-red-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              {language === 'en' ? 'Body' : 'Corp'}
            </h3>
            <p className="text-gray-300">
              {language === 'en' 
                ? 'Optimize your physical health and energy' 
                : 'Optimizează-ți sănătatea fizică și energia'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-900/40 to-blue-700/40 p-6 rounded-xl border border-blue-500/20">
            <Brain className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              {language === 'en' ? 'Being' : 'Ființă'}
            </h3>
            <p className="text-gray-300">
              {language === 'en' 
                ? 'Develop spiritual connection and clarity' 
                : 'Dezvoltă conexiunea spirituală și claritatea'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-900/40 to-green-700/40 p-6 rounded-xl border border-green-500/20">
            <Heart className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              {language === 'en' ? 'Balance' : 'Echilibru'}
            </h3>
            <p className="text-gray-300">
              {language === 'en' 
                ? 'Build deeper relationships and connections' 
                : 'Construiește relații și conexiuni mai profunde'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/40 to-purple-700/40 p-6 rounded-xl border border-purple-500/20">
            <Briefcase className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              {language === 'en' ? 'Business' : 'Afacere'}
            </h3>
            <p className="text-gray-300">
              {language === 'en' 
                ? 'Scale your income and financial freedom' 
                : 'Crește-ți venitul și libertatea financiară'}
            </p>
          </div>
        </div>

        {/* Tools Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            <Target className="w-10 h-10 text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {language === 'en' ? 'Stack System' : 'Sistemul Stack'}
            </h3>
            <p className="text-gray-300">
              {language === 'en' 
                ? 'Daily mental training to overcome limiting beliefs' 
                : 'Antrenament mental zilnic pentru a depăși convingerile limitative'}
            </p>
          </div>

          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            <Calendar className="w-10 h-10 text-green-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {language === 'en' ? 'Core 4 Tracking' : 'Urmărirea Core 4'}
            </h3>
            <p className="text-gray-300">
              {language === 'en' 
                ? 'Track your daily progress across all life domains' 
                : 'Urmărește progresul zilnic în toate domeniile vieții'}
            </p>
          </div>

          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            <FileText className="w-10 h-10 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {language === 'en' ? 'Journey Mapping' : 'Maparea Călătoriei'}
            </h3>
            <p className="text-gray-300">
              {language === 'en' 
                ? 'Plan and execute your impossible goals' 
                : 'Planifică și execută obiectivele tale imposibile'}
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {language === 'en' ? 'Ready to Transform Your Life?' : 'Gata să îți Transformi Viața?'}
          </h2>
          <p className="text-gray-300 mb-8">
            {language === 'en' 
              ? 'Join thousands who have already started their transformation journey with the HAVE IT ALL Lifestyle.' 
              : 'Alătură-te miilor care și-au început deja călătoria de transformare cu HAVE IT ALL Lifestyle.'}
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/auth')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 text-xl font-semibold"
          >
            {language === 'en' ? 'Begin Your Transformation' : 'Începe Transformarea'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
