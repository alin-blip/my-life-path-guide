import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface FunnelStep {
  name: string;
  value: number;
  percentage: number;
}

interface FunnelChartProps {
  data: FunnelStep[];
}

export const FunnelChart = ({ data }: FunnelChartProps) => {
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-indigo-500',
    'bg-green-500',
    'bg-emerald-500'
  ];

  const getDropOff = (index: number): string => {
    if (index === 0 || data[index - 1].value === 0) return '';
    const dropOff = ((1 - data[index].value / data[index - 1].value) * 100).toFixed(1);
    return `-${dropOff}%`;
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-10 text-muted-foreground">
          No data available for this time range
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Conversion Funnel</span>
          <span className="text-sm font-normal text-muted-foreground">
            Overall: {data[0]?.value > 0 ? ((data[data.length - 1]?.value / data[0]?.value) * 100).toFixed(1) : 0}%
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.map((step, index) => (
          <div key={step.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                <span className="font-medium">{step.name}</span>
              </div>
              <div className="flex items-center gap-4">
                {getDropOff(index) && (
                  <span className="text-sm text-orange-500">{getDropOff(index)} drop</span>
                )}
                <span className="text-lg font-bold">{step.value.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">({step.percentage}%)</span>
              </div>
            </div>
            <Progress 
              value={step.percentage} 
              className="h-4"
              style={{
                ['--progress-color' as any]: `var(--${colors[index % colors.length].replace('bg-', '')})`
              }}
            />
          </div>
        ))}

        {/* Funnel visualization */}
        <div className="mt-8 flex flex-col items-center space-y-1">
          {data.map((step, index) => {
            const width = Math.max(20, step.percentage);
            return (
              <div
                key={`viz-${step.name}`}
                className={`${colors[index % colors.length]} text-white text-sm font-medium py-2 flex items-center justify-center transition-all`}
                style={{
                  width: `${width}%`,
                  clipPath: 'polygon(5% 0%, 95% 0%, 100% 100%, 0% 100%)'
                }}
              >
                {step.value}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
