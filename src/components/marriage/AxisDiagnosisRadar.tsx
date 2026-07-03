import React from 'react';
import { Card } from '@/components/ui/card';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  axisScores: Record<string, number>;
  primaryDestructured?: string | null;
}

export const AxisDiagnosisRadar: React.FC<Props> = ({ axisScores, primaryDestructured }) => {
  const { t } = useLanguage();

  const LABELS: Record<string, string> = {
    cognitiva: t('marriage.radar.axisCognitive'),
    afectiva: t('marriage.radar.axisAffective'),
    comportamentala: t('marriage.radar.axisBehavioral'),
    volitiva: t('marriage.radar.axisVolitional'),
    profesionala: t('marriage.radar.axisProfessional'),
    spirituala: t('marriage.radar.axisSpiritual'),
  };

  const data = Object.keys(LABELS).map(key => ({
    axis: LABELS[key],
    score: Number(axisScores?.[key] ?? 0),
  }));

  return (
    <Card className="p-5 bg-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold">{t('marriage.radar.title')}</h3>
          <p className="text-xs text-muted-foreground">{t('marriage.radar.subtitle')}</p>
        </div>
        {primaryDestructured && (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            {t('marriage.radar.criticalAxis')} {LABELS[primaryDestructured] || primaryDestructured}
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
