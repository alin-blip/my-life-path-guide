
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Users, Brain, Target, Heart, Crown, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";

const Index = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900/90 via-pink-900/80 to-purple-900/90">
      {/* Language Selector */}
      <div className="absolute top-6 right-6 z-10">
        <LanguageSelector />
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-feminine-primary to-feminine-purple rounded-full p-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            {language === 'en' ? 'Unleash Your Feminine Power' : 'Eliberează-ți Puterea Feminină'}
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            {language === 'en' 
              ? 'Awaken your divine feminine essence. Transform your Sacred Vessel, Sacred Relationships, Divine Connection, and Queen\'s Empire with proven feminine empowerment rituals.' 
              : 'Trezește-ți esența feminină divină. Transformă-ți Vasul Sacru, Relațiile Sacre, Conexiunea Divină și Imperiul Reginei cu ritualuri dovedite de împuternicire feminină.'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-feminine-primary to-feminine-purple hover:from-feminine-accent hover:to-feminine-purple text-white px-8 py-4 text-lg font-semibold"
            >
              {language === 'en' ? 'Awaken Your Power' : 'Trezește-ți Puterea'}
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/auth')}
              className="border-feminine-secondary text-white hover:bg-feminine-primary/20 px-8 py-4 text-lg"
            >
              {language === 'en' ? 'Discover Your Goddess' : 'Descoperă-ți Zeița'}
            </Button>
          </div>
        </div>

        {/* Sacred Circle Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-gradient-to-br from-feminine-primary/40 to-feminine-rose/40 p-6 rounded-xl border border-feminine-primary/30">
            <div className="text-4xl mb-4">🌺</div>
            <h3 className="text-xl font-bold text-white mb-2">
              {language === 'en' ? 'Sacred Vessel' : 'Vas Sacru'}
            </h3>
            <p className="text-gray-300">
              {language === 'en' 
                ? 'Honor your body through intuitive nutrition and sacred movement' 
                : 'Onorează-ți corpul prin nutriție intuitivă și mișcare sacrată'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-feminine-purple/40 to-purple-700/40 p-6 rounded-xl border border-feminine-purple/30">
            <div className="text-4xl mb-4">🧘‍♀️</div>
            <h3 className="text-xl font-bold text-white mb-2">
              {language === 'en' ? 'Divine Connection' : 'Conexiune Divină'}
            </h3>
            <p className="text-gray-300">
              {language === 'en' 
                ? 'Awaken your inner wisdom and spiritual feminine power' 
                : 'Trezește-ți înțelepciunea interioară și puterea spirituală feminină'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-pink-600/40 to-feminine-primary/40 p-6 rounded-xl border border-pink-500/30">
            <div className="text-4xl mb-4">💖</div>
            <h3 className="text-xl font-bold text-white mb-2">
              {language === 'en' ? 'Sacred Relationships' : 'Relații Sacre'}
            </h3>
            <p className="text-gray-300">
              {language === 'en' 
                ? 'Cultivate divine connections and sacred sisterhood' 
                : 'Cultivă conexiuni divine și sororitatea sacrată'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-yellow-600/40 to-orange-600/40 p-6 rounded-xl border border-yellow-500/30">
            <Crown className="w-12 h-12 text-yellow-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              {language === 'en' ? "Queen's Empire" : 'Imperiul Reginei'}
            </h3>
            <p className="text-gray-300">
              {language === 'en' 
                ? 'Build your abundant queendom with feminine leadership' 
                : 'Construiește-ți împărăția abundentă cu leadership feminin'}
            </p>
          </div>
        </div>

        {/* Sacred Tools Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gradient-to-br from-feminine-primary/20 to-feminine-purple/20 p-6 rounded-xl border border-feminine-primary/30">
            <Sparkles className="w-10 h-10 text-feminine-primary mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {language === 'en' ? 'Sacred Rituals' : 'Ritualuri Sacre'}
            </h3>
            <p className="text-gray-300">
              {language === 'en' 
                ? 'Transform limiting beliefs through divine feminine practices' 
                : 'Transformă convingerile limitative prin practici feminine divine'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-feminine-primary/20 to-feminine-purple/20 p-6 rounded-xl border border-feminine-primary/30">
            <div className="text-3xl mb-4">🌙</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {language === 'en' ? 'Sacred Circle Tracking' : 'Urmărirea Cercului Sacru'}
            </h3>
            <p className="text-gray-300">
              {language === 'en' 
                ? 'Honor your natural cycles and track your goddess journey' 
                : 'Onorează-ți ciclurile naturale și urmărește călătoria zeiței'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-feminine-primary/20 to-feminine-purple/20 p-6 rounded-xl border border-feminine-primary/30">
            <div className="text-3xl mb-4">🦋</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {language === 'en' ? 'Goddess Awakening Map' : 'Harta Trezirii Zeiței'}
            </h3>
            <p className="text-gray-300">
              {language === 'en' 
                ? 'Manifest your divine feminine destiny and impossible dreams' 
                : 'Manifestă-ți destinul feminin divin și visurile imposibile'}
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {language === 'en' ? 'Ready to Unleash Your Divine Feminine Power?' : 'Gata să îți Eliberezi Puterea Feminină Divină?'}
          </h2>
          <p className="text-gray-300 mb-8">
            {language === 'en' 
              ? 'Join the Sacred Circle of empowered women who have awakened their goddess within through the Femeia Eliberată program.' 
              : 'Alătură-te Cercului Sacru de femei împuternicite care și-au trezit zeița din interior prin programul Femeia Eliberată.'}
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/auth')}
            className="bg-gradient-to-r from-feminine-primary to-feminine-purple hover:from-feminine-accent hover:to-feminine-purple text-white px-12 py-4 text-xl font-semibold"
          >
            {language === 'en' ? 'Awaken Your Goddess' : 'Trezește-ți Zeița'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
