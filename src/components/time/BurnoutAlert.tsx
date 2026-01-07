import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X, Flame, Battery, Scale, Coffee } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface BurnoutAlertData {
  id: string;
  alert_type: 'overwork' | 'energy_drain' | 'imbalance' | 'no_recovery';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metric_value: number | null;
  recommendations: string[] | null;
}

interface BurnoutAlertProps {
  alert: BurnoutAlertData;
  onDismiss?: () => void;
}

const alertConfig = {
  overwork: { icon: Flame, color: 'text-red-500', bgColor: 'bg-red-500/10 border-red-500/30' },
  energy_drain: { icon: Battery, color: 'text-orange-500', bgColor: 'bg-orange-500/10 border-orange-500/30' },
  imbalance: { icon: Scale, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10 border-yellow-500/30' },
  no_recovery: { icon: Coffee, color: 'text-purple-500', bgColor: 'bg-purple-500/10 border-purple-500/30' },
};

const severityLabels = {
  low: { label: 'Scăzut', color: 'bg-yellow-500' },
  medium: { label: 'Mediu', color: 'bg-orange-500' },
  high: { label: 'Ridicat', color: 'bg-red-500' },
  critical: { label: 'Critic', color: 'bg-red-600' },
};

export function BurnoutAlert({ alert, onDismiss }: BurnoutAlertProps) {
  const config = alertConfig[alert.alert_type];
  const severity = severityLabels[alert.severity];
  const Icon = config.icon;

  const handleAcknowledge = async () => {
    await supabase
      .from('burnout_alerts')
      .update({ acknowledged_at: new Date().toISOString() })
      .eq('id', alert.id);
    onDismiss?.();
  };

  return (
    <Card className={cn("border", config.bgColor)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon className={cn("h-5 w-5", config.color)} />
            <CardTitle className="text-base">Alertă Burnout</CardTitle>
            <span className={cn("text-xs px-2 py-0.5 rounded-full text-white", severity.color)}>
              {severity.label}
            </span>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleAcknowledge}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm">{alert.description}</p>
        
        {alert.metric_value && (
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">Valoare: {alert.metric_value}</span>
          </div>
        )}

        {alert.recommendations && alert.recommendations.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Recomandări:</p>
            <ul className="text-sm space-y-1">
              {alert.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleAcknowledge}
          className="w-full mt-2"
        >
          Am înțeles
        </Button>
      </CardContent>
    </Card>
  );
}
