import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const FounderSection = () => {
  const { elementRef, isVisible } = useScrollAnimation();
  
  return (
    <div 
      ref={elementRef}
      className={`mb-24 transition-all duration-700 ${
        isVisible ? 'opacity-100 animate-fade-in-up' : 'opacity-0'
      }`} 
      id="founder"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Why I Created Jump to Freedom
        </h2>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          The story behind the system that transforms stuck entrepreneurs into balanced leaders
        </p>
      </div>

      <Card className="bg-white border-slate-200 shadow-lg p-8 md:p-12 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Founder Image Placeholder */}
          <div className="w-full md:w-48 shrink-0">
            <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-slate-200 flex items-center justify-center">
              <Quote className="h-16 w-16 text-primary/40" />
            </div>
            <div className="mt-4 text-center">
              <div className="font-bold text-slate-900 text-lg">[Founder Name]</div>
              <div className="text-sm text-slate-500">Founder, Jump to Freedom</div>
            </div>
          </div>

          {/* Story Content */}
          <div className="flex-1 space-y-4 text-slate-600">
            <p className="text-lg leading-relaxed font-semibold text-slate-900">
              <span className="text-red-500">7 years.</span> It took me 7 years to discover, test, and prove the path to true freedom.
            </p>

            <p className="leading-relaxed">
              In 2016, I had "everything": €1M+ revenue, team of 15, beautiful offices. 
              But the reality? <span className="text-red-600 font-bold">Complete burnout, 230 lbs, chronic anxiety, a wife I saw 2 hours a week</span>.
            </p>

            <p className="leading-relaxed">
              I ended up in the hospital after an anxiety attack. Doctors told me: 
              <span className="text-red-600 font-semibold italic"> "If you don't change something radically, you don't have much time left."</span> 
              I was 32 years old and ready to die.
            </p>

            <p className="leading-relaxed">
              I realized the brutal truth: <span className="text-slate-900 font-bold">I had money, but I didn't have LIFE</span>. 
              My body was collapsing. My relationship with my wife was dead. I felt nothing spiritual. 
              Business was running, but I was a human ruin.
            </p>

            <p className="leading-relaxed">
              I refused to accept this was the end. I started looking for answers — 
              not in pills or weekend motivation, but in <span className="text-primary font-bold">brutal truth</span>. 
              I realized the problem wasn't just in business. It was in <span className="text-slate-900 font-semibold">ALL areas simultaneously</span> — 
              body, spirit, relationships, business.
            </p>

            <div className="bg-blue-50 border-l-4 border-primary p-4 rounded-r">
              <p className="text-slate-900 font-bold mb-2">The transformation results:</p>
              <ul className="space-y-1 text-sm text-slate-700">
                <li>✓ Lost 65 lbs in 4 months</li>
                <li>✓ From depression to mental power and clarity</li>
                <li>✓ Business grew to €5M+ in 3 years</li>
                <li>✓ From toxic relationship to passionate marriage</li>
                <li>✓ Father and husband guided by faith</li>
              </ul>
            </div>

            <p className="leading-relaxed">
              <span className="text-primary font-bold">Success without balance is just another form of poverty.</span> 
              You can have millions in the bank and still be in The Pit — disconnected, desensitized, destroyed inside. 
              I was there. <span className="text-slate-900 font-semibold">I don't want other men to end up where I was.</span>
            </p>

            <p className="leading-relaxed">
              I systematized everything I learned in those 7 years and transformed it into Jump to Freedom. 
              Not because I want to sell something — because <span className="text-slate-900 font-bold">I had no one to show me the way when I was in The Pit</span>. 
              And I know that pain. <span className="text-green-600 font-bold">You now have the chance I never had.</span>
            </p>

            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r">
              <p className="text-slate-900 font-bold">
                Now the system is used by 65,000+ men in 40+ countries. Built on timeless principles, adapted for modern life.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
