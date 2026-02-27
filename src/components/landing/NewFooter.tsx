import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Mail, Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const NewFooter = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const footerLinks = {
    product: {
      title: language === 'ro' ? 'Produs' : 'Product',
      links: [
        { label: language === 'ro' ? 'Funcționalități' : 'Features', href: '#features' },
        { label: language === 'ro' ? 'Prețuri' : 'Pricing', href: '#pricing' },
        { label: language === 'ro' ? 'Testimoniale' : 'Testimonials', href: '#testimonials' },
        { label: language === 'ro' ? 'FAQ' : 'FAQ', href: '#faq' },
      ],
    },
    resources: {
      title: language === 'ro' ? 'Resurse' : 'Resources',
      links: [
        { label: language === 'ro' ? 'Blog' : 'Blog', href: '/blog' },
        { label: language === 'ro' ? 'Ghiduri' : 'Guides', href: '/guides' },
        { label: language === 'ro' ? 'Suport' : 'Support', href: '/support' },
        { label: language === 'ro' ? 'Status' : 'Status', href: '/status' },
      ],
    },
    company: {
      title: language === 'ro' ? 'Companie' : 'Company',
      links: [
        { label: language === 'ro' ? 'Despre noi' : 'About', href: '/about' },
        { label: language === 'ro' ? 'Contact' : 'Contact', href: '/contact' },
        { label: language === 'ro' ? 'Cariere' : 'Careers', href: '/careers' },
        { label: language === 'ro' ? 'Parteneri' : 'Partners', href: '/partners' },
      ],
    },
    legal: {
      title: language === 'ro' ? 'Legal' : 'Legal',
      links: [
        { label: language === 'ro' ? 'Termeni' : 'Terms', href: '/terms' },
        { label: language === 'ro' ? 'Confidențialitate' : 'Privacy', href: '/privacy' },
        { label: language === 'ro' ? 'Cookies' : 'Cookies', href: '/cookies' },
        { label: language === 'ro' ? 'GDPR' : 'GDPR', href: '/gdpr' },
      ],
    },
  };

  return (
    <footer className="bg-card border-t border-border">
      {/* Pre-footer CTA */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
              {language === 'ro' 
                ? 'Gata să îți transformi viața?' 
                : 'Ready to transform your life?'}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              {language === 'ro'
                ? 'Alătură-te celor 500+ antreprenori care și-au găsit echilibrul între succes și împlinire personală.'
                : 'Join 500+ entrepreneurs who found balance between success and personal fulfillment.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white px-8"
              >
                <Rocket className="w-5 h-5 mr-2" />
                {language === 'ro' ? 'Începe Trial Gratuit' : 'Start Free Trial'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/support')}
              >
                {language === 'ro' ? 'Contactează-ne' : 'Contact Us'}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-xl font-bold text-white">C</span>
              </div>
              <span className="text-xl font-bold text-foreground">
                CEO Mind<span className="text-primary"> OS</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              {language === 'ro'
                ? 'Sistemul AI care te ajută să ai succes fără sacrificiu în toate dimensiunile vieții.'
                : 'The AI system that helps you succeed without sacrifice across all life dimensions.'}
            </p>
            
            {/* Newsletter */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                {language === 'ro' ? 'Newsletter' : 'Newsletter'}
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder={language === 'ro' ? 'Email-ul tău' : 'Your email'}
                  className="flex-1"
                />
                <Button size="icon" variant="outline">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h4 className="font-semibold text-foreground mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} CEO Mind OS. {language === 'ro' ? 'Toate drepturile rezervate.' : 'All rights reserved.'}
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.374 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.626-5.374-12-12-12z"/>
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
