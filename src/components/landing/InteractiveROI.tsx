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
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Cât te costă să NU ai RoWarrior?
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Calculează exact cât pierzi fără un sistem clar de execuție
        </p>
      </div>

      <Card className="bg-card border-border shadow-lg p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <Label htmlFor="revenue" className="text-lg text-foreground mb-2 block font-semibold">
            Care este cifra ta de afaceri anuală? (EUR)
          </Label>
          <Input
            id="revenue"
            type="number"
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
            className="text-2xl font-bold text-center h-14 bg-input border-primary/30 focus:border-primary text-foreground"
            placeholder="500000"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-destructive/5 border-destructive/50 p-6 shadow">
            <AlertCircle className="h-8 w-8 text-destructive mb-3" />
            <div className="text-sm text-muted-foreground mb-1 font-medium">Timp pierdut pe task-uri inutile</div>
            <div className="text-2xl font-bold text-destructive">
              €{losses.timeLoss.toLocaleString('ro-RO', { maximumFractionDigits: 0 })}
            </div>
          </Card>

          <Card className="bg-destructive/5 border-destructive/50 p-6 shadow">
            <AlertCircle className="h-8 w-8 text-destructive mb-3" />
            <div className="text-sm text-muted-foreground mb-1 font-medium">Oportunități ratate</div>
            <div className="text-2xl font-bold text-destructive">
              €{losses.opportunityLoss.toLocaleString('ro-RO', { maximumFractionDigits: 0 })}
            </div>
          </Card>

          <Card className="bg-primary/5 border-primary/50 p-6 shadow">
            <TrendingUp className="h-8 w-8 text-accent mb-3" />
            <div className="text-sm text-muted-foreground mb-1 font-medium">Investiție RoWarrior/an</div>
            <div className="text-2xl font-bold text-primary">
              €{monthlySubscription.toLocaleString('ro-RO')}
            </div>
          </Card>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-8 text-center border-2 border-primary/40 shadow-lg">
          <DollarSign className="h-12 w-12 text-accent mx-auto mb-3" />
          <div className="text-lg text-muted-foreground mb-2 font-semibold">ROI Estimat în Primul An</div>
          <div className="text-5xl font-bold text-accent mb-2">
            {roi}%
          </div>
          <div className="text-xl text-foreground font-bold mb-4">
            Economisești/Câștigi: €{(losses.total - monthlySubscription).toLocaleString('ro-RO', { maximumFractionDigits: 0 })}
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Calculul este conservator și presupune doar 15% recuperare din timp + oportunități.
            Majoritatea clienților raportează 20-30% îmbunătățire reală.
          </p>
        </div>
      </Card>
    </div>
  );
};
