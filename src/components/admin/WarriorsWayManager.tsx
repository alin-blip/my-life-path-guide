import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Settings } from 'lucide-react';

export const WarriorsWayManager: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-amber-500" />
            <CardTitle>Warrior's Way Course Manager</CardTitle>
          </div>
          <CardDescription>
            Gestionează modulele cursului Warrior's Way. Adaugă link-uri YouTube și marchează modulele gratuite.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Manager în dezvoltare</p>
            <p className="text-sm">
              Funcționalitatea de management a modulelor va fi disponibilă în curând.
              <br />
              Pentru moment, folosește tab-ul "Courses" pentru a gestiona cursurile.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
