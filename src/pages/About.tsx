import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Heart, Lightbulb, Users, Rocket, CheckCircle2, Dumbbell, Brain, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const About = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: Target,
      title: "Purpose-Driven",
      description: "Every feature is designed to help you live with intention and achieve meaningful goals across all areas of life."
    },
    {
      icon: Heart,
      title: "Holistic Growth",
      description: "We believe true success comes from balance - nurturing your body, mind, relationships, and career together."
    },
    {
      icon: Lightbulb,
      title: "Continuous Improvement",
      description: "Small daily actions compound into extraordinary results. We help you build systems, not just motivation."
    },
    {
      icon: Users,
      title: "Community Support",
      description: "You're not alone on this journey. Connect with like-minded individuals committed to growth."
    }
  ];

  const pillars = [
    {
      icon: Dumbbell,
      name: "Body",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      description: "Physical health, energy, fitness, and vitality"
    },
    {
      icon: Brain,
      name: "Being",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      description: "Mental clarity, spirituality, and inner peace"
    },
    {
      icon: Heart,
      name: "Balance",
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
      description: "Relationships, family, and meaningful connections"
    },
    {
      icon: Briefcase,
      name: "Business",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      description: "Career growth, finances, and professional success"
    }
  ];

  return (
    <>
      <Helmet>
        <title>About CEO Mind OS — Our Mission & 4 Pillars</title>
        <meta name="description" content="CEO Mind OS helps founders grow across Body, Being, Balance, and Business with proven daily systems. Learn our story, values, and mission." />
        <link rel="canonical" href="https://ceomindos.com/about" />
        <meta property="og:title" content="About CEO Mind OS — Our Mission & 4 Pillars" />
        <meta property="og:description" content="CEO Mind OS helps founders grow across Body, Being, Balance, and Business with proven daily systems." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ceomindos.com/about" />
      </Helmet>

      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5" />
          <div className="max-w-6xl mx-auto px-4 relative">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
                About <span className="text-primary">CEO Mind OS</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                We're on a mission to help you break free from the trap of imbalance and 
                build a life where you truly have it all - health, peace, love, and prosperity.
              </p>
            </div>
          </div>
        </section>

        {/* The Story Section */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 text-center">
              The Story Behind CEO Mind OS
            </h2>
            
            <div className="prose prose-lg max-w-none text-slate-600">
              <p className="text-lg leading-relaxed mb-6">
                I know what it feels like to be successful on paper but empty inside. To hit every business goal 
                while watching your health decline, your relationships suffer, and your inner peace disappear.
              </p>
              
              <p className="text-lg leading-relaxed mb-6">
                For years, I chased success in one area at the expense of everything else. I'd get my fitness 
                on track, only to see my business suffer. I'd focus on work, and my relationships would crumble. 
                It felt like a never-ending game of whack-a-mole.
              </p>

              <p className="text-lg leading-relaxed mb-6">
                Then I discovered the truth: <strong>you can have it all - but not by juggling</strong>. 
                You need a system that integrates all areas of life into one cohesive daily practice.
              </p>

              <p className="text-lg leading-relaxed mb-6">
                That's why I created CEO Mind OS. It's not another productivity app or fitness tracker. 
                It's a complete founder operating system built on four pillars: <strong>Body, Being, Balance, and Business</strong>.
              </p>

              <p className="text-lg leading-relaxed">
                Every tool, every feature, every daily practice is designed to help you grow in all four areas 
                simultaneously. Because that's the only way to achieve true, lasting fulfillment.
              </p>
            </div>
          </div>
        </section>

        {/* The 4 Pillars */}
        <section className="py-16 md:py-20 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-center">
              The 4 Pillars of Freedom
            </h2>
            <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
              True freedom comes from mastery in all four areas of life. Neglect one, and the others eventually suffer.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pillars.map((pillar) => (
                <div 
                  key={pillar.name}
                  className={`${pillar.bgColor} rounded-2xl p-6 text-center transition-transform hover:scale-105`}
                >
                  <div className={`w-16 h-16 ${pillar.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <pillar.icon className={`w-8 h-8 ${pillar.color}`} />
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${pillar.color}`}>{pillar.name}</h3>
                  <p className="text-slate-600 text-sm">{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Mission */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                  Our Mission
                </h2>
                <p className="text-lg text-slate-600 mb-6">
                  To empower 1 million people to break free from the trap of imbalanced living 
                  and build lives of holistic abundance - where physical vitality, mental clarity, 
                  deep relationships, and financial prosperity coexist in harmony.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                    <p className="text-slate-600">Provide proven daily systems that create lasting change</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                    <p className="text-slate-600">Make holistic growth accessible to everyone, not just the elite</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                    <p className="text-slate-600">Build a global community of people committed to having it all</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-2xl p-8">
                <Rocket className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Vision</h3>
                <p className="text-slate-600">
                  A world where success is measured not by achievements in isolation, but by 
                  the harmony and fulfillment across all dimensions of life. Where "having it all" 
                  isn't a fantasy, but a systematic reality available to anyone willing to do the work.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-16 md:py-20 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-center">
              Our Core Values
            </h2>
            <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
              These principles guide everything we build and every decision we make.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((value) => (
                <div 
                  key={value.title}
                  className="bg-white rounded-xl p-6 border border-slate-200 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <value.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{value.title}</h3>
                      <p className="text-slate-600">{value.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20 bg-gradient-to-br from-primary to-primary/80">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Start with CEO Mind OS?
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of people who have transformed their lives by mastering all four pillars. 
              Start your 7-day free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-white text-primary hover:bg-slate-100 px-8 py-6 text-lg font-bold"
                onClick={() => navigate('/auth')}
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-bold"
                onClick={() => navigate('/')}
                aria-label="Learn more about the CEO Mind OS platform"
              >
                Explore the Platform
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default About;
