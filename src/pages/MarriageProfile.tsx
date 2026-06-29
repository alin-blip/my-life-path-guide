import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { MarriageProfileForm } from '@/components/marriage/MarriageProfileForm';

export default function MarriageProfile() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container max-w-2xl mx-auto px-4 py-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/marriage')} className="mb-3">
            <ArrowLeft className="h-4 w-4 mr-2" /> Înapoi
          </Button>
          <h1 className="font-display text-3xl font-semibold">Profil relațional</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            AI Coach-ul folosește aceste date pentru context, memorie persistentă și pattern detection.
          </p>
        </div>
      </div>
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <MarriageProfileForm onSaved={() => navigate('/marriage')} />
      </div>
    </div>
  );
}
