import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { Calculator, TrendingUp, DollarSign } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export const B2BRevenueCalculator = () => {
  const { language } = useLanguage();
  const [clients, setClients] = useState(10);
  const pricePerMonth = 97;
  const commissionRate = 0.5;

  const monthlyRevenue = clients * pricePerMonth * commissionRate;
  const yearlyRevenue = monthlyRevenue * 12;

  return (
    <section className="py-20 md:py-32 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="n8n-gradient-text">
              {language === 'ro' ? 'Calculator Venit' : 'Revenue Calculator'}
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            {language === 'ro' ? 'Câți clienți ai sau plănuiești să ai?' : 'How many clients do you have or plan to have?'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto glass-card rounded-2xl p-8 md:p-12"
        >
          <div className="flex items-center gap-3 mb-8">
            <Calculator className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold text-foreground">
              {language === 'ro' ? 'Număr de clienți:' : 'Number of clients:'} <span className="text-primary text-2xl">{clients}</span>
            </span>
          </div>

          <Slider
            value={[clients]}
            onValueChange={(v) => setClients(v[0])}
            min={1}
            max={100}
            step={1}
            className="mb-10"
          />

          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-xl bg-primary/10 p-6 text-center">
              <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-3xl md:text-4xl font-bold text-foreground">
                €{monthlyRevenue.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {language === 'ro' ? '/ lună' : '/ month'}
              </div>
            </div>
            <div className="rounded-xl bg-accent/10 p-6 text-center">
              <DollarSign className="w-6 h-6 text-accent mx-auto mb-2" />
              <div className="text-3xl md:text-4xl font-bold text-foreground">
                €{yearlyRevenue.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {language === 'ro' ? '/ an' : '/ year'}
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            {language === 'ro'
              ? `Calcul: ${clients} clienți × €${pricePerMonth}/lună × 50% comision`
              : `Calculation: ${clients} clients × €${pricePerMonth}/month × 50% commission`}
          </p>
        </motion.div>
      </div>
    </section>
  );
};
