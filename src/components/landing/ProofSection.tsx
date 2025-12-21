import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Quote, Dumbbell, Sparkles, Heart, Briefcase } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const ProofSection = () => {
  const { elementRef, isVisible } = useScrollAnimation();
  
  return (
    <section 
      ref={elementRef}
      className={`mb-24 transition-all duration-700 ${
        isVisible ? 'opacity-100 animate-fade-in-up' : 'opacity-0'
      }`} 
      id="proof"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Real Transformations in All 4 Pillars
        </h2>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          This isn't theory. These are entrepreneurs who jumped to freedom and have measurable results in Body, Being, Balance & Business.
        </p>
      </div>

      {/* Video Testimonial Placeholder */}
      <div className="mb-12 max-w-4xl mx-auto">
        <Card className="bg-white border-slate-200 shadow-md overflow-hidden">
          <div className="aspect-video bg-gradient-to-br from-emerald-50 via-violet-50 to-blue-50 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <p className="text-lg text-slate-900 font-semibold mb-2">Video Testimonial</p>
              <p className="text-slate-600 text-sm">Entrepreneur explains complete transformation: from burnout to balance in Body, Being, Balance & Business</p>
              <p className="text-xs text-slate-500 mt-2">(Video coming soon — text testimonials available now)</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Client Industries */}
      <div className="mb-12">
        <p className="text-center text-slate-500 text-sm mb-6">Used by entrepreneurs from:</p>
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 max-w-4xl mx-auto">
          <div className="px-4 md:px-6 py-2 md:py-3 bg-slate-100 rounded border border-slate-200 text-slate-900 font-semibold text-sm md:text-base">
            E-commerce
          </div>
          <div className="px-4 md:px-6 py-2 md:py-3 bg-slate-100 rounded border border-slate-200 text-slate-900 font-semibold text-sm md:text-base">
            SaaS
          </div>
          <div className="px-4 md:px-6 py-2 md:py-3 bg-slate-100 rounded border border-slate-200 text-slate-900 font-semibold text-sm md:text-base">
            Consulting
          </div>
          <div className="px-4 md:px-6 py-2 md:py-3 bg-slate-100 rounded border border-slate-200 text-slate-900 font-semibold text-sm md:text-base">
            Agencies
          </div>
          <div className="px-4 md:px-6 py-2 md:py-3 bg-slate-100 rounded border border-slate-200 text-slate-900 font-semibold text-sm md:text-base">
            Real Estate
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Testimonial 1 - All 4 Pillars */}
        <Card className="bg-gradient-to-br from-emerald-50 to-violet-50 border-primary/30 shadow-md group hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300">
          <CardHeader>
            <Quote className="w-8 h-8 text-primary mb-2 group-hover:scale-110 transition-transform duration-300" />
            <div className="flex items-center gap-2 mb-2">
              <div className="flex gap-1">
                <Dumbbell className="w-4 h-4 text-emerald-600" />
                <Sparkles className="w-4 h-4 text-violet-600" />
                <Heart className="w-4 h-4 text-rose-600" />
                <Briefcase className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-primary font-bold text-lg">All 4 Pillars</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 mb-4 italic">
              "In 90 days: lost 12kg, reconnected with my wife, found spiritual clarity, and added +€15k/month profit. Jump to Freedom showed me I don't have to sacrifice anything for business success."
            </p>
            <div className="border-t border-slate-200 pt-3">
              <p className="text-slate-900 font-semibold">John P.</p>
              <p className="text-slate-500 text-sm">E-commerce, 42, married</p>
            </div>
          </CardContent>
        </Card>

        {/* Testimonial 2 - Burnout Recovery */}
        <Card className="bg-gradient-to-br from-violet-50 to-rose-50 border-primary/30 shadow-md group hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300">
          <CardHeader>
            <Quote className="w-8 h-8 text-primary mb-2 group-hover:scale-110 transition-transform duration-300" />
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-violet-600" />
              <span className="text-primary font-bold text-lg">From Burnout to Clarity</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 mb-4 italic">
              "I was completely exhausted. Jump to Freedom helped me rebuild my body, reconnect spiritually, repair my marriage, and grow business by +22% in Q1. Now I HAVE IT ALL."
            </p>
            <div className="border-t border-slate-200 pt-3">
              <p className="text-slate-900 font-semibold">Michael S.</p>
              <p className="text-slate-500 text-sm">SaaS B2B, 38, 2 kids</p>
            </div>
          </CardContent>
        </Card>

        {/* Testimonial 3 - Balance + Business */}
        <Card className="bg-gradient-to-br from-rose-50 to-blue-50 border-primary/30 shadow-md group hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300">
          <CardHeader>
            <Quote className="w-8 h-8 text-primary mb-2 group-hover:scale-110 transition-transform duration-300" />
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-rose-600" />
              <span className="text-primary font-bold text-lg">Balance + Business Together</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 mb-4 italic">
              "I thought I had to choose between family and business. The Have It All system showed me I can have both. Now my family supports me and business grows naturally."
            </p>
            <div className="border-t border-slate-200 pt-3">
              <p className="text-slate-900 font-semibold">Anna M.</p>
              <p className="text-slate-500 text-sm">Consulting, 35, mother</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
        <Card className="bg-emerald-50 border-emerald-200 p-4 text-center">
          <Dumbbell className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-900">87%</p>
          <p className="text-xs text-slate-600">Exercise daily after 30 days</p>
        </Card>
        <Card className="bg-violet-50 border-violet-200 p-4 text-center">
          <Sparkles className="w-6 h-6 text-violet-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-900">92%</p>
          <p className="text-xs text-slate-600">Report mental clarity</p>
        </Card>
        <Card className="bg-rose-50 border-rose-200 p-4 text-center">
          <Heart className="w-6 h-6 text-rose-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-900">78%</p>
          <p className="text-xs text-slate-600">Improved relationships</p>
        </Card>
        <Card className="bg-blue-50 border-blue-200 p-4 text-center">
          <Briefcase className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-slate-900">+23%</p>
          <p className="text-xs text-slate-600">Average revenue growth</p>
        </Card>
      </div>

      <div className="text-center mt-8">
        <p className="text-slate-500 text-sm italic">
          * Representative testimonials. Real case studies being added as community grows.
        </p>
      </div>
    </section>
  );
};