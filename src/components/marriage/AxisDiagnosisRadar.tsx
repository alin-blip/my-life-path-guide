import React from 'react';
import { Card } from '@/components/ui/card';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

interface Props {
  axisScores: Record<string, number>;
  primaryDestructured?: string | null;
}

const LABELS: Record<string, string> = {
  cognitiva: 'Cognitivă',
  afectiva: 'Afectivă',
  comportamentala: 'Comportamentală',
  volitiva: 'Volitivă',
  profesionala: 'Profesională',
  spirituala: 'Spirituală',
};

export const AxisDiagnosisRadar: React.FC<Props> = ({ axisScores, primaryDestructured }) => {
  const data = Object.keys(LABELS).map(key => ({
    axis: LABELS[key],
    score: Number(axisScores?.[key] ?? 0),
  }));

  return (
    <Card className="p-5 bg-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold">Arhitectura Psiho-Mentală</h3>
          <p className="text-xs text-muted-foreground">Scor pe 6 axe relaționale (0 = destructurat, 100 = sănătos)</p>
        </div>
        {primaryDestructured && (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Axă critică: {primaryDestructured}
          </Badge>
        )}
      </div>
      <div className="w-full h-72">
        <ResponsiveContainer>
          <RadarChart data={data}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="axis" tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
            <Radar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.35} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
