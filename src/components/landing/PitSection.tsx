import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const PitSection = () => {
  const { elementRef, isVisible } = useScrollAnimation();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const pitItems = [
    { 
      id: "work", 
      label: "I work constantly but results aren't coming",
      consequence: "→ Guaranteed burnout in 6-12 months, business collapse"
    },
    { 
      id: "disconnect", 
      label: "I feel disconnected from my family/partner",
      consequence: "→ Divorce or destroyed relationships, children who suffer"
    },
    { 
      id: "body", 
      label: "My body is suffering (fatigue, weight gain, no energy)",
      consequence: "→ Chronic disease, physical exhaustion, heart risk"
    },
    { 
      id: "numb", 
      label: "I numb myself with food/alcohol/social media",
      consequence: "→ Addictions, depression, loss of identity"
    },
    { 
      id: "deserve", 
      label: "I feel like I don't deserve more",
      consequence: "→ Perpetual self-sabotage, never reaching your potential"
    },
  ];

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <section 
      ref={elementRef}
      className={`mb-24 transition-all duration-700 ${
        isVisible ? 'opacity-100 animate-fade-in-up' : 'opacity-0'
      }`}
    >
      <div className="text-center mb-12">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Are You Trapped in The Pit?
        </h2>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          The Pit of Imbalance has 5 warning signs. Check what resonates with you:
        </p>
      </div>

      <Card className="bg-white border-slate-200 shadow-lg p-8 md:p-12 max-w-3xl mx-auto">
        <div className="space-y-6 mb-8">
          {pitItems.map((item) => (
            <div key={item.id} className="flex items-start gap-4 p-4 rounded-lg hover:bg-slate-50 transition-colors">
              <Checkbox
                id={item.id}
                checked={checkedItems[item.id] || false}
                onCheckedChange={(checked) => {
                  setCheckedItems(prev => ({
                    ...prev,
                    [item.id]: checked === true
                  }));
                }}
                className="mt-1"
              />
              <label
                htmlFor={item.id}
                className="cursor-pointer flex-1"
              >
                <div className="text-lg text-slate-900 font-medium mb-1">
                  {item.label}
                </div>
                {checkedItems[item.id] && (
                  <div className="text-sm text-red-600 font-semibold animate-in fade-in slide-in-from-top-2 duration-300">
                    {item.consequence}
                  </div>
                )}
              </label>
            </div>
          ))}
        </div>

        {checkedCount >= 2 && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 p-6 rounded-r-lg">
            <p className="text-lg text-slate-900 font-bold mb-2">
              You checked {checkedCount} of 5 — You're in The Pit.
            </p>
            <p className="text-base text-slate-600">
              The good news? <span className="text-primary font-bold">There's a way out.</span> Jump to Freedom 
              teaches you how to escape The Pit and build real balance across Body, Being, Balance & Business.
            </p>
          </div>
        )}

        {checkedCount > 0 && checkedCount < 2 && (
          <div className="bg-blue-50 border-l-4 border-primary p-6 rounded-r-lg">
            <p className="text-base text-slate-600">
              You're close to the edge of The Pit. Now is the time to build a system that 
              <span className="text-slate-900 font-bold"> protects you and puts you on the path to growth.</span>
            </p>
          </div>
        )}

        {checkedCount === 0 && (
          <div className="bg-green-50 border-l-4 border-accent p-6 rounded-r-lg">
            <p className="text-base text-slate-600">
              Excellent that you don't resonate with these symptoms! Still, Jump to Freedom teaches you 
              <span className="text-slate-900 font-bold"> how to PROTECT</span> what you've built and 
              <span className="text-slate-900 font-bold"> SCALE</span> without sacrificing anything.
            </p>
          </div>
        )}
      </Card>
    </section>
  );
};
