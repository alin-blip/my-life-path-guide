import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const AddNapoleonHillBook: React.FC = () => {
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const addBookToLearn = async () => {
    try {
      setIsAdding(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Eroare",
          description: "Trebuie să fii autentificat",
          variant: "destructive"
        });
        return;
      }

      // Check if book already exists
      const { data: existing } = await supabase
        .from('courses')
        .select('id')
        .eq('title', 'Think and Grow Rich: The Legacy')
        .single();

      if (existing) {
        toast({
          title: "Cartea există deja",
          description: "Cartea Napoleon Hill este deja în Learn",
        });
        return;
      }

      // Create the course
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert({
          user_id: user.id,
          title: 'Think and Grow Rich: The Legacy',
          description: 'Cartea clasică a lui Napoleon Hill despre cei 13 pași către bogăție și succes. Descoperă principiile universale care au transformat viețile a milioane de oameni din întreaga lume.',
          category: 'business',
          difficulty_level: 'intermediate',
          duration: '300+ pagini',
          is_published: true,
          thumbnail_url: null
        })
        .select()
        .single();

      if (courseError) throw courseError;

      // Add module with download link
      const { error: moduleError } = await supabase
        .from('course_modules')
        .insert({
          course_id: course.id,
          title: 'Descarcă Cartea Completă',
          description: 'Think and Grow Rich: The Legacy de James Whittaker - versiunea completă în format DOCX.',
          order_index: 0,
          duration: 'E-book',
          text_content: `# Think and Grow Rich: The Legacy

## Despre Carte

"Think and Grow Rich: The Legacy" de James Whittaker este o actualizare modernă a lucrării clasice a lui Napoleon Hill. Cartea prezintă cei 13 pași universali către bogăție și succes.

## Cei 13 Principii:

1. **Dorința** - Punctul de pornire al tuturor realizărilor
2. **Credința** - Vizualizarea și credința în atingerea obiectivului
3. **Auto-Sugestia** - Mijlocul de influențare a minții subconștiente
4. **Cunoștințe Specializate** - Experiențe și observații personale
5. **Imaginația** - Atelierul minții
6. **Planificarea Organizată** - Cristalizarea dorinței în acțiune
7. **Decizia** - Stăpânirea procrastinării
8. **Perseverența** - Efortul susținut necesar pentru inducerea credinței
9. **Master Mind** - Puterea motrice
10. **Transmutarea Energiei** - Schimbarea mentalității
11. **Mintea Subconștientă** - Veriga de conectare
12. **Creierul** - Stație de broadcasting pentru gânduri
13. **Al Șaselea Simț** - Ușa către înțelepciune

## Cum să Folosești Această Carte

Pentru rezultate maxime:
- Citește cartea de cel puțin două ori
- Subliniază conceptele cheie
- Creează un plan de acțiune concret pentru fiecare principiu
- Folosește Stack-ul Napoleon Hill din platformă pentru coaching personalizat
- Revizuiește principiile săptămânal

Click pe butonul de download pentru cartea completă.`,
          pdf_url: '/books/think-and-grow-rich-legacy.docx'
        });

      if (moduleError) throw moduleError;

      toast({
        title: "✅ Carte adăugată!",
        description: "Napoleon Hill a fost adăugat în Learn → Business → E-book",
      });

    } catch (error) {
      console.error('Error adding book:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut adăuga cartea. Încearcă din nou.",
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Adaugă Napoleon Hill în Learn
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Adaugă cartea "Think and Grow Rich: The Legacy" în secțiunea Learn → Business → E-book cu posibilitate de download.
        </p>
        <Button 
          onClick={addBookToLearn} 
          disabled={isAdding}
          className="w-full"
        >
          <Download className="w-4 h-4 mr-2" />
          {isAdding ? 'Se adaugă...' : 'Adaugă Cartea Napoleon Hill'}
        </Button>
      </CardContent>
    </Card>
  );
};
