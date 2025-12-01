// Script to add Napoleon Hill "Think and Grow Rich: The Legacy" book to Learn
import { supabase } from '@/integrations/supabase/client';

export const addNapoleonHillBook = async () => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated');
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

    if (courseError) {
      console.error('Error creating course:', courseError);
      return;
    }

    console.log('Course created:', course);

    // Add module with download link
    const { data: module, error: moduleError } = await supabase
      .from('course_modules')
      .insert({
        course_id: course.id,
        title: 'Descarcă Cartea Completă',
        description: 'Think and Grow Rich: The Legacy de James Whittaker - versiunea completă în format DOCX. Explorează cei 13 principii ai succesului: Dorința, Credința, Auto-Sugestia, Cunoștințele Specializate, Imaginația, Planificarea Organizată, Decizia, Perseverența, Master Mind, Transmutarea Energiei Sexuale, Subconștientul, Creierul și Al Șaselea Simț.',
        order_index: 0,
        duration: 'E-book',
        text_content: `# Think and Grow Rich: The Legacy

## Despre Carte

"Think and Grow Rich: The Legacy" de James Whittaker este o actualizare modernă a lucrării clasice a lui Napoleon Hill. Cartea prezintă cei 13 pași universali către bogăție și succes, ilustrați prin interviuri cu antreprenori și lideri de gândire contemporani.

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
10. **Misterul Transmutării Energiei Sexuale** - Schimbarea mentalității
11. **Mintea Subconștientă** - Veriga de conectare
12. **Creierul** - O stație de broadcasting și recepție pentru gânduri
13. **Al Șaselea Simț** - Ușa către templul înțelepciunii

## Cum să Folosești Această Carte

Pentru rezultate maxime:
- Citește cartea de cel puțin două ori
- Subliniază conceptele cheie
- Creează un plan de acțiune concret pentru fiecare principiu
- Folosește Stack-ul Napoleon Hill din platformă pentru coaching personalizat
- Revizuiește principiile săptămânal

## Download

Click pe butonul de mai jos pentru a descărca cartea completă în format DOCX.`,
        pdf_url: '/books/think-and-grow-rich-legacy.docx'
      })
      .select()
      .single();

    if (moduleError) {
      console.error('Error creating module:', moduleError);
      return;
    }

    console.log('Module created:', module);
    console.log('✅ Napoleon Hill book added to Learn successfully!');
    
    return { course, module };
  } catch (error) {
    console.error('Error adding Napoleon Hill book:', error);
    throw error;
  }
};
