import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Download, ArrowRight, Mail, Star } from 'lucide-react';

const Core4ThankYou = () => {
  // In a real scenario, this would be a signed URL or protected download
  const pdfDownloadUrl = '/core4-framework.pdf';

  const nextSteps = [
    {
      step: 1,
      title: "Download Your PDF",
      description: "Click the button below to download your CORE 4 Framework PDF"
    },
    {
      step: 2,
      title: "Read the Framework",
      description: "Take 10 minutes to understand the 4 core daily actions"
    },
    {
      step: 3,
      title: "Implement Tomorrow",
      description: "Start with just one CORE 4 action tomorrow morning"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Thank You! Download Your CORE 4 PDF | LifeOS</title>
        <meta name="description" content="Your CORE 4 Framework PDF is ready for download. Start transforming your daily productivity today." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            {/* Success Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-8">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
              You're In! 🎉
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              Your CORE 4 Framework PDF is ready for download. 
              Welcome to the community of high performers!
            </p>

            {/* Download Card */}
            <Card className="border-2 border-primary/20 shadow-xl mb-12">
              <CardContent className="p-8">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-primary/10">
                    <Download className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-xl font-bold text-foreground">CORE 4 Framework</h2>
                    <p className="text-sm text-muted-foreground">PDF Guide • 15 pages</p>
                  </div>
                </div>

                <a href={pdfDownloadUrl} download>
                  <Button size="lg" className="w-full h-14 text-lg font-semibold mb-4">
                    <Download className="w-5 h-5 mr-2" />
                    Download PDF Now
                  </Button>
                </a>

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>We also sent a copy to your email</span>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <div className="text-left mb-12">
              <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
                Your Next 3 Steps
              </h3>
              <div className="space-y-4">
                {nextSteps.map((item) => (
                  <div key={item.step} className="flex items-start gap-4 p-4 rounded-lg bg-card/50 border border-border/50">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA to Main App */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-8">
                <div className="flex items-center justify-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Ready to Go Deeper?
                </h3>
                <p className="text-muted-foreground mb-6">
                  LifeOS is the complete operating system for your life — featuring the CORE 4 
                  Framework plus 10+ other tools to master your health, wealth, relationships, and self.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/auth">
                    <Button size="lg" className="w-full sm:w-auto">
                      Start Free Trial
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Core4ThankYou;
