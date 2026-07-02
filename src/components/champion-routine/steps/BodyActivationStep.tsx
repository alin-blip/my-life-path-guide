import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Droplets, Sun, ArrowUp, ArrowRight, Check } from 'lucide-react';

interface BodyActivationStepProps {
  waterCompleted: boolean;
  lightCompleted: boolean;
  onWaterComplete: (value: boolean) => void;
  onLightComplete: (value: boolean) => void;
  onNext: () => void;
}

const ITEMS = [
  {
    id: 'water',
    icon: Droplets,
    label: 'Pahar mare de apă',
    description: 'Hidratează-ți corpul imediat',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30',
  },
  {
    id: 'light',
    icon: Sun,
    label: 'Lumină naturală',
    description: 'Expune-te la lumina soarelui',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30',
  },
  {
    id: 'posture',
    icon: ArrowUp,
    label: 'Postură dreaptă',
    description: 'Umeri trași, piept deschis, cap sus',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/30',
  },
] as const;

export function BodyActivationStep({
  waterCompleted,
  lightCompleted,
  onWaterComplete,
  onLightComplete,
  onNext,
}: BodyActivationStepProps) {
  const [postureChecked, setPostureChecked] = useState(false);

  const states: Record<string, boolean> = {
    water: waterCompleted,
    light: lightCompleted,
    posture: postureChecked,
  };

  const toggle = (id: string) => {
    if (id === 'water') onWaterComplete(!waterCompleted);
    else if (id === 'light') onLightComplete(!lightCompleted);
    else setPostureChecked((v) => !v);
  };

  const allDone = waterCompleted && lightCompleted && postureChecked;
  const doneCount = [waterCompleted, lightCompleted, postureChecked].filter(Boolean).length;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <Card className="w-full max-w-2xl p-8 space-y-6 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent border-cyan-500/20">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full transition-all duration-500 ${
            allDone ? 'bg-green-500/20 scale-110' : 'bg-cyan-500/20'
          }`}>
            {allDone ? (
              <Check className="h-10 w-10 text-green-500" />
            ) : (
              <span className="text-3xl">⚡</span>
            )}
          </div>
          <h1 className="text-3xl font-bold">Activare Corp</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            30 de secunde — pregătește-ți corpul pentru o zi de campion.
          </p>
        </div>

        {/* Checklist items */}
        <div className="space-y-3">
          {ITEMS.map((item) => {
            const done = states[item.id];
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => toggle(item.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 text-left ${
                  done
                    ? 'bg-green-500/10 border-green-500/30'
                    : `bg-muted/20 ${item.borderColor} hover:bg-muted/40`
                }`}
              >
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  done ? 'bg-green-500/20' : item.bgColor
                }`}>
                  {done ? (
                    <Check className="h-6 w-6 text-green-500" />
                  ) : (
                    <Icon className={`h-6 w-6 ${item.color}`} />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Progress */}
        <div className="text-center text-sm text-muted-foreground">
          {doneCount}/3 completate
        </div>

        {/* Next button */}
        <Button
          onClick={() => {
            try {
              const today = new Date().toISOString().split('T')[0];
              localStorage.setItem(`body_activation_done_${today}`, '1');
            } catch {}
            onNext();
          }}
          size="lg"
          className="w-full gap-2"
          disabled={!allDone}
        >
          {allDone ? 'Continuă' : 'Completează toate 3'}
          <ArrowRight className="h-5 w-5" />
        </Button>
      </Card>
    </div>
  );
}
