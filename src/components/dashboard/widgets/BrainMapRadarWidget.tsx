import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import { mindQuizService, type MindAxisScoreRow } from '@/services/mindQuizService';
import { useLanguage } from '@/context/LanguageContext';
import type { DashboardWidget } from '@/types/dashboardWidget';

interface Props {
  size?: DashboardWidget['size'];
  onRemove?: () => void;
  onResize?: (size: DashboardWidget['size']) => void;
  dragHandleProps?: any;
}

const AXIS_LABELS: Record<string, { ro: string; en: string }> = {
  cognitiva: { ro: 'Cognitivă', en: 'Cognitive' },
  emotionala: { ro: 'Emoțională', en: 'Emotional' },
  afectiva: { ro: 'Afectivă', en: 'Affective' },
  volitiva: { ro: 'Volitivă', en: 'Volitional' },
  comportamentala: { ro: 'Comportamentală', en: 'Behavioral' },
  profesionala: { ro: 'Profesională', en: 'Professional' },
};

const AXIS_ORDER = [
  'cognitiva',
  'emotionala',
  'afectiva',
  'volitiva',
  'comportamentala',
  'profesionala',
];

export const BrainMapRadarWidget: React.FC<Props> = ({ dragHandleProps }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const lang: 'ro' | 'en' = language === 'en' ? 'en' : 'ro';
  const [rows, setRows] = useState<MindAxisScoreRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mindQuizService
      .getAxisScores()
      .then((r) => setRows(r))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  const data = AXIS_ORDER.map((id) => {
    const r = rows.find((x) => x.axis === id);
    return {
      axis: AXIS_LABELS[id][lang],
      score: r?.score_healthy ?? 0,
    };
  });

  const assessed = rows.length;
  const avg = assessed
    ? Math.round(rows.reduce((s, r) => s + r.score_healthy, 0) / assessed)
    : null;

  const t = (en: string, ro: string) => (lang === 'en' ? en : ro);

  return (
    <Card
      className="border-primary/30 bg-gradient-to-br from-primary/5 to-violet-500/5 h-full cursor-pointer hover:border-primary/50 transition-colors"
      onClick={() => navigate('/minte')}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2" {...dragHandleProps}>
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">{t('Brain Map — 6 axes', 'Brain Map — 6 axe')}</h3>
            <p className="text-[11px] text-muted-foreground">
              {assessed
                ? t(`${assessed} axes assessed · avg ${avg}`, `${assessed} axe evaluate · medie ${avg}`)
                : t('Take a Mind test to activate', 'Fă un test ca să-l activezi')}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </div>

        {loading ? (
          <div className="text-xs text-muted-foreground">{t('Loading…', 'Se încarcă…')}</div>
        ) : assessed === 0 ? (
          <div className="space-y-2 py-4 text-center">
            <p className="text-xs text-muted-foreground">
              {t(
                'Your brain map will appear here after the first test.',
                'Harta apare aici după primul test.',
              )}
            </p>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/minte/teste');
              }}
            >
              {t('Start a test', 'Începe un test')}
            </Button>
          </div>
        ) : (
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data} outerRadius="75%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.35}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
