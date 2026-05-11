import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

export const StickyHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { language } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: language === 'ro' ? 'Metodologia' : 'Methodology', href: '#methodology' },
    { label: language === 'ro' ? 'Pentru cine' : "Who it's for", href: '#target' },
    { label: language === 'ro' ? 'Prețuri' : 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ];

  const scrollToSection = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${
          isScrolled
            ? "bg-background/85 backdrop-blur-md border-b border-border"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo — hairline mark + wordmark */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <span className="font-display text-xl md:text-2xl font-semibold tracking-tight text-foreground">
                CEO Mind <span className="text-primary italic">OS</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-10">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollToSection(item.href)}
                  className="text-[13px] uppercase tracking-wider font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* CTAs */}
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => navigate('/auth')}
                className="text-muted-foreground hover:text-foreground"
              >
                {language === 'ro' ? 'Autentificare' : 'Login'}
              </Button>
              <Button
                variant="default"
                onClick={() => navigate('/auth')}
              >
                {language === 'ro' ? 'Start Gratuit' : 'Start Free'}
              </Button>
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-foreground"
              aria-label="menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-0 top-16 z-40 bg-background border-b border-border md:hidden"
          >
            <nav className="container mx-auto px-6 py-6 flex flex-col gap-1">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => scrollToSection(item.href)}
                  className="text-base font-medium text-foreground hover:text-primary transition-colors text-left py-3 border-b border-border"
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-5 flex flex-col gap-3">
                <Button
                  variant="outline"
                  onClick={() => { navigate('/auth'); setIsMobileMenuOpen(false); }}
                  className="w-full"
                >
                  {language === 'ro' ? 'Autentificare' : 'Login'}
                </Button>
                <Button
                  onClick={() => { navigate('/auth'); setIsMobileMenuOpen(false); }}
                  className="w-full"
                >
                  {language === 'ro' ? 'Start Gratuit' : 'Start Free'}
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-16 md:h-20" />
    </>
  );
};
