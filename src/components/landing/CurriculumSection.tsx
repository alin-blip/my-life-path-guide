import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Map, Target, Calendar, Dumbbell, Sparkles, Heart, Briefcase } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const modules = [
  {
    number: "DAY 1",
    title: "Ignite Your Desire",
    duration: "Foundation",
    icon: Target,
    description: "Define your 'Have It All' vision — clarity on what you truly want in all 4 areas.",
    outcomes: [
      "Complete your first Stack coaching session",
      "Define your vision for Body, Being, Balance & Business",
      "Set your intention for the 7-day transformation",
      "Join the community of freedom seekers"
    ]
  },
  {
    number: "DAY 2",
    title: "Body Mastery",
    duration: "Physical",
    icon: Dumbbell,
    description: "Start your physical transformation — movement and nutrition that energizes.",
    outcomes: [
      "30 minutes of movement (any form you enjoy)",
      "Green smoothie or healthy nutrition choice",
      "Complete your Stack session",
      "Track your first Body progress"
    ]
  },
  {
    number: "DAY 3",
    title: "Soul Connection",
    duration: "Spiritual",
    icon: Sparkles,
    description: "Connect with your inner self through meditation and gratitude practices.",
    outcomes: [
      "10 minutes of meditation",
      "Gratitude journaling (3 things)",
      "Continue Body rituals from Day 2",
      "Stack session for inner clarity"
    ]
  },
  {
    number: "DAY 4",
    title: "Love & Connection",
    duration: "Relationships",
    icon: Heart,
    description: "Add value to the people who matter most — spouse, children, or close friends.",
    outcomes: [
      "One meaningful action for your partner/spouse",
      "One meaningful action for children/family/friends",
      "Continue Body + Being rituals",
      "Reflect on relationship growth"
    ]
  },
  {
    number: "DAY 5",
    title: "Business Edge",
    duration: "Professional",
    icon: Briefcase,
    description: "Invest in your professional growth — learn, plan, and apply.",
    outcomes: [
      "30 minutes of business/marketing reading",
      "Extract 3 key ideas from your learning",
      "Apply 1 idea immediately",
      "Continue all previous rituals"
    ]
  },
  {
    number: "DAY 6",
    title: "Integration Day",
    duration: "All Areas",
    icon: Target,
    description: "Practice ALL 4 areas in one day — experience the power of complete balance.",
    outcomes: [
      "Body: 30 min movement + healthy eating",
      "Being: Stack + 10 min meditation",
      "Balance: Add value to 2 people",
      "Business: Learn & apply one insight"
    ]
  },
  {
    number: "DAY 7",
    title: "Freedom Blueprint",
    duration: "Planning",
    icon: Map,
    description: "Create your weekly execution plan using The Door — your roadmap to freedom.",
    outcomes: [
      "Complete weekly planning in The Door",
      "Define your Domino objective for the week",
      "Set 5 Key Points across all 4 areas",
      "Celebrate your 7-day transformation!"
    ]
  }
];

export const CurriculumSection = () => {
  const { elementRef, isVisible } = useScrollAnimation();
  
  return (
    <div 
      ref={elementRef}
      className={`mb-24 transition-all duration-700 ${
        isVisible ? 'opacity-100 animate-fade-in-up' : 'opacity-0'
      }`} 
      id="curriculum"
    >
      <div className="text-center mb-12">
        <Badge className="bg-primary/10 text-primary border-primary/50 mb-4 font-semibold">
          Complete 7-Day Transformation
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Your Have It All Lifestyle Challenge
        </h2>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          Each day builds on the previous, progressively integrating all 4 life areas until you're 
          <span className="text-primary font-bold"> living the complete system</span> with full clarity and momentum.
        </p>
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Timeline line */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary/50 to-primary transform -translate-x-1/2" />

        <div className="space-y-12">
          {modules.map((module, idx) => {
            const Icon = module.icon;
            const isEven = idx % 2 === 0;
            
            return (
              <div key={module.number} className="relative">
                {/* Timeline dot */}
                <div className="hidden md:block absolute left-1/2 top-8 w-6 h-6 bg-primary rounded-full border-4 border-white shadow-lg transform -translate-x-1/2 z-10" />
                
                <div className={`md:grid md:grid-cols-2 gap-8 ${isEven ? '' : 'md:grid-flow-col-dense'}`}>
                  <div className={isEven ? 'md:text-right' : 'md:col-start-2'}>
                    <Card className="bg-white border-slate-200 p-6 hover:border-primary hover:shadow-xl transition-all shadow-md">
                      <div className="flex items-start gap-4 md:flex-row-reverse md:justify-end">
                        <div className={`p-3 bg-primary/10 rounded-lg ${isEven ? 'md:ml-0' : ''}`}>
                          <Icon className="h-8 w-8 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 md:justify-end">
                            <Badge variant="outline" className="border-primary/50 text-primary font-semibold">
                              {module.number}
                            </Badge>
                            <span className="text-sm text-slate-500 font-medium">{module.duration}</span>
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 mb-2">{module.title}</h3>
                          <p className="text-slate-600 mb-4">{module.description}</p>
                          <div className="space-y-2">
                            <div className="text-sm font-semibold text-primary">What You'll Do:</div>
                            <ul className="space-y-1 text-sm text-slate-600">
                              {module.outcomes.map((outcome, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-primary mt-1">•</span>
                                  <span>{outcome}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-12 text-center">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-primary/40 p-6 max-w-3xl mx-auto shadow-lg">
          <p className="text-lg text-slate-700">
            <span className="font-bold text-primary">End Result:</span> After 7 days, you'll have experienced the complete system — 
            daily rituals for Body, Being, Balance & Business, plus a weekly planning framework that keeps you focused on what truly matters.
          </p>
        </Card>
      </div>
    </div>
  );
};
