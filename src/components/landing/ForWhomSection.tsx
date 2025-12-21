import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const idealFor = [
  "You want to HAVE IT ALL — not just money, but health, relationships, and inner peace",
  "You're willing to confront the truth about your current life",
  "You want a structured system, not weekend motivation",
  "You understand that real change requires time, energy, and commitment",
  "You want to leave a legacy for your children — an example of a complete man"
];

const notFor = [
  "You're looking for a quick fix or magic 'hack'",
  "You're not willing to do the daily work",
  "You only want money, without balance in body, relationships, or spirit",
  "You believe you already know everything and don't need a system",
  "You're not willing to tell the truth about where you are now"
];

export const ForWhomSection = () => {
  const { elementRef, isVisible } = useScrollAnimation();
  
  return (
    <div 
      ref={elementRef}
      className={`mb-24 transition-all duration-700 ${
        isVisible ? 'opacity-100 animate-fade-in-up' : 'opacity-0'
      }`} 
      id="for-whom"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Is Jump to Freedom Right for You?
        </h2>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          Be honest with yourself: if you see yourself in the left column, this is for you.
          If you're in the right column, it's <span className="text-primary font-bold">not yet</span> the right time.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Ideal For */}
        <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200 p-8 shadow-md hover:shadow-2xl hover:shadow-green-200/50 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] group">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle2 className="h-8 w-8 text-green-500 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12" />
            <h3 className="text-2xl font-bold text-slate-900">Jump to Freedom IS for you if:</h3>
          </div>
          <ul className="space-y-4">
            {idealFor.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
                <span className="text-slate-700">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 p-4 bg-green-100 rounded-lg border border-green-200">
            <p className="text-sm text-slate-700">
              <span className="font-bold">In short:</span> You want a healthy body, strong relationships, spiritual clarity AND a profitable business — and you're ready to follow a complete system.
            </p>
          </div>
        </Card>

        {/* Not For */}
        <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200 p-8 shadow-md hover:shadow-2xl hover:shadow-red-200/50 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] group">
          <div className="flex items-center gap-3 mb-6">
            <XCircle className="h-8 w-8 text-red-500 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12" />
            <h3 className="text-2xl font-bold text-slate-900">Jump to Freedom is NOT for you if:</h3>
          </div>
          <ul className="space-y-4">
            {notFor.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <XCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
                <span className="text-slate-700">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 p-4 bg-red-100 rounded-lg border border-red-200">
            <p className="text-sm text-slate-700">
              <span className="font-bold">In short:</span> If you only want money without balance or you're looking for shortcuts, Jump to Freedom is not for you. Come back when you're ready for complete transformation.
            </p>
          </div>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          If you see yourself in the green column, start your free trial. If you're in red, save this page and come back when you're ready.
          <span className="block mt-2 text-green-600 font-semibold">Jump to Freedom only works for those who are truly ready to transform.</span>
        </p>
      </div>
    </div>
  );
};
