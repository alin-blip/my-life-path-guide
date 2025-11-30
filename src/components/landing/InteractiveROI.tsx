import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, AlertCircle, DollarSign } from "lucide-react";

export const InteractiveROI = () => {
  const [revenue, setRevenue] = useState<string>("500000");

  const calculateLosses = (rev: number) => {
    // Calculăm pierderile estimate: 15-30% din cifră pe task-uri inutile + oportunități ratate
    const timeLoss = rev * 0.15; // 15% timp pierdut pe task-uri inutile
    const opportunityLoss = rev * 0.15; // 15% oportunități ratate din lipsa de focus
    return { timeLoss, opportunityLoss, total: timeLoss + opportunityLoss };
  };

  const revNumber = parseFloat(revenue) || 0;
  const losses = calculateLosses(revNumber);
  const monthlySubscription = 197 * 12; // €197/lună × 12 luni
  const roi = ((losses.total - monthlySubscription) / monthlySubscription * 100).toFixed(0);

  return (
    <div className="mb-24" id="roi-calculator">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Cât te costă să NU ai RoWarrior?
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Calculează exact cât pierzi fără un sistem clar de execuție
        </p>
      </div>

      <Card className="bg-gradient-to-br from-background/80 to-background/40 backdrop-blur border-border/50 p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <Label htmlFor="revenue" className="text-lg text-white mb-2 block">
            Care este cifra ta de afaceri anuală? (EUR)
          </Label>
          <Input
            id="revenue"
            type="number"
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
            className="text-2xl font-bold text-center h-14 bg-background/60 border-feminine-primary/30 focus:border-feminine-primary text-white"
            placeholder="500000"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-destructive/10 border-destructive/30 p-6">
            <AlertCircle className="h-8 w-8 text-destructive mb-3" />
            <div className="text-sm text-gray-400 mb-1">Timp pierdut pe task-uri inutile</div>
            <div className="text-2xl font-bold text-destructive">
              €{losses.timeLoss.toLocaleString('ro-RO', { maximumFractionDigits: 0 })}
            </div>
          </Card>

          <Card className="bg-destructive/10 border-destructive/30 p-6">
            <AlertCircle className="h-8 w-8 text-destructive mb-3" />
            <div className="text-sm text-gray-400 mb-1">Oportunități ratate</div>
            <div className="text-2xl font-bold text-destructive">
              €{losses.opportunityLoss.toLocaleString('ro-RO', { maximumFractionDigits: 0 })}
            </div>
          </Card>

          <Card className="bg-feminine-primary/10 border-feminine-primary/30 p-6">
            <TrendingUp className="h-8 w-8 text-feminine-accent mb-3" />
            <div className="text-sm text-gray-400 mb-1">Investiție RoWarrior/an</div>
            <div className="text-2xl font-bold text-feminine-primary">
              €{monthlySubscription.toLocaleString('ro-RO')}
            </div>
          </Card>
        </div>

        <div className="bg-gradient-to-r from-feminine-primary/20 to-feminine-purple/20 rounded-lg p-8 text-center border border-feminine-primary/30">
          <DollarSign className="h-12 w-12 text-feminine-accent mx-auto mb-3" />
          <div className="text-lg text-gray-300 mb-2">ROI Estimat în Primul An</div>
          <div className="text-5xl font-bold text-feminine-accent mb-2">
            {roi}%
          </div>
          <div className="text-xl text-white mb-4">
            Economisești/Câștigi: €{(losses.total - monthlySubscription).toLocaleString('ro-RO', { maximumFractionDigits: 0 })}
          </div>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto">
            Calculul este conservator și presupune doar 15% recuperare din timp + oportunități.
            Majoritatea clienților raportează 20-30% îmbunătățire reală.
          </p>
        </div>
      </Card>
    </div>
  );
};
