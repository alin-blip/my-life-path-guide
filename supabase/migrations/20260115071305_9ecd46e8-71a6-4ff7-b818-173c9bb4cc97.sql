-- Insert/Update complete scripts for Warriors Way lessons (JSONB format)

-- Video 1-7 and Chapters 1-5
INSERT INTO warriors_way_lesson_content (module_id, section_id, title, order_number, full_script, summary, key_concepts, action_prompts, aha_moment, tags, video_url)
VALUES 
('intro-1', 'intro', 'Punctul de Start - Groapa', 1,
 '7 ani mi-au trebuit să descopăr drumul unui războinic. Am trecut prin burnout, spitalizare și depresie profundă. Groapa este punctul de start - confuzie, sedare, izolare, burnout. Metoda Warrior m-a ajutat să slăbesc 30kg în 4 luni, să construiesc un business de 5 milioane euro, să transform o relație toxică într-o căsnicie plină de pasiune. Cele 3 etape: Fii Bărbatul (eradică lipsa), Fii Regele (creează abundență), Construiește Regatul (moștenire pentru generații).',
 'Călătoria din groapă către transformare prin cele 3 etape fundamentale ale sistemului Warrior.',
 '["Groapa - punctul de start al transformării", "Simptomele gropii: confuzie, sedare, izolare, burnout", "Cele 3 etape: Fii Bărbatul, Fii Regele, Construiește Regatul", "Metoda Warrior testată pe 65.000 de oameni"]'::jsonb,
 '["Identifică simptomele gropii în viața ta", "Scrie 3 lucruri care te țin în groapă", "Ia decizia: vrei să ieși din groapă?"]'::jsonb,
 'Groapa nu este destinația finală - este doar punctul de plecare.',
 ARRAY['transformare', 'groapă', 'burnout', 'cele 3 etape'],
 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=PI-nU1i6vo7AF0RdV1FiSMTC6GkmBF9tBxoHaAoVbPEKW0hQC&videoRatio=1.777778&type=v&skinColor=%232758EB'),

('intro-2', 'intro', 'Cele 6 Etape ale Creșterii și Expansiunii', 2,
 'Călătoria de la adormit la ascensionat. Faza 1: Adormit - inconștiență totală. Faza 2: Trezirea - primul pas către conștiență. Faza 3: Activare - aliniere mentală + dezvoltare abilități. Faza 4: Aplicare - rezultate reale și măsurabile. Faza 5: Accelerare - momentum și efect de bulgăre de zăpadă. Faza 6: Ascensiune - renaști ca o versiune nouă. Ciclul continuă - după ce ascensionezi, procesul reîncepe la un nivel superior.',
 'Cele 6 faze ale transformării: Adormit → Trezire → Activare → Aplicare → Accelerare → Ascensiune.',
 '["Faza 1: Adormit - inconștiență totală", "Faza 2: Trezirea - conștiență", "Faza 3: Activare - aliniere + abilități", "Faza 4: Aplicare - rezultate reale", "Faza 5: Accelerare - momentum", "Faza 6: Ascensiune - renaștere"]'::jsonb,
 '["Identifică în ce fază te afli acum", "Ce eveniment te-a trezit?", "Listează 3 abilități de dezvoltat"]'::jsonb,
 'Ascensiunea nu este destinația finală - un nou ciclu începe la fiecare nivel.',
 ARRAY['6 faze', 'trezire', 'activare', 'ascensiune'],
 NULL),

('intro-5', 'intro', 'Cele 5 Protocoale ale Războinicului', 5,
 'Cele 5 protocoale: 1) CODUL - fundația adevărului, încetează minciuna, Formula Warrior (Fapte, Sentimente, Focus, Rezultate). 2) STACK-UL - instrument de perspectivă, rescrie poveștile false. 3) CORE 4 - Corp, Spirit, Relații, Business. 4) UȘA - tranziție spre realități alternative. 5) JOCUL - obiective imposibile, victorii masive.',
 'Cele 5 protocoale: Codul, Stack-ul, Core 4, Ușa, Jocul.',
 '["Protocol #1: CODUL - fundația adevărului", "Protocol #2: STACK-UL - perspectivă", "Protocol #3: CORE 4 - cele 4 domenii", "Protocol #4: UȘA - tranziție", "Protocol #5: JOCUL - obiective imposibile"]'::jsonb,
 '["Identifică o minciună pe care ți-o spui zilnic", "Aplică Stack-ul de furie", "Evaluează scorul în Core 4"]'::jsonb,
 'Viața este un joc al obiectivelor imposibile.',
 ARRAY['5 protocoale', 'codul', 'stack', 'core 4', 'jocul'],
 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=FEaO0VFEEcDEOk_SUj4U6LTVigwGXhTc7dOCxosObKE941gCT&videoRatio=1.777778&type=v&skinColor=%232758EB'),

('intro-6', 'intro', 'Cele 5 Legi ale Războinicului', 6,
 'Cele 5 legi: 1) Ai încredere în proces - urmează sistemul. 2) Detaliile contează - lucrurile mici te distrug. 3) Fii aici, acum - prezența este putere. 4) Nu renunța niciodată - cel mai periculos moment. 5) Ai grijă de frații tăi - nu ești singur.',
 'Cele 5 legi fundamentale ale călătoriei Warrior.',
 '["Legea #1: AI ÎNCREDERE ÎN PROCES", "Legea #2: DETALIILE CONTEAZĂ", "Legea #3: FII AICI, ACUM", "Legea #4: NU RENUNȚA NICIODATĂ", "Legea #5: AI GRIJĂ DE FRAȚII TĂI"]'::jsonb,
 '["Scrie momentele când nu ai avut încredere", "Identifică 3 detalii mici pe care le ignori", "Găsește un frate căruia să îi oferi suport"]'::jsonb,
 'Te distrug lucrurile mici - cele pe care le ignori.',
 ARRAY['5 legi', 'încredere', 'detalii', 'prezență'],
 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=ixE7kMVqXo3Y0gRGodFa6h1QU9zG0DrqQ9YdPR-pdaIKT1AEd&videoRatio=1.777778&type=v&skinColor=%232758EB'),

('intro-7', 'intro', 'Coeficientul Puterii & Warrior Time-Warp', 7,
 'Warrior Time-Warp: sistem de compunere exponențială. Rezultatele se accelerează - ce lua luni, acum se întâmplă în zile. Singura întrebare: TU vei face munca? Cel mai mare iad: să te întâlnești cu bărbatul care trebuia să fii, dar nu l-ai devenit.',
 'Warrior Time-Warp: accelerare exponențială a rezultatelor.',
 '["Warrior Time-Warp - accelerare exponențială", "Singura limitare ești TU", "Întrebarea: TU vei face munca?", "Cel mai mare iad: omul care trebuia să fii"]'::jsonb,
 '["Vizualizează bărbatul care trebuia să fii", "Scrie ce preț plătești dacă NU faci munca", "Angajează-te pentru 90 de zile"]'::jsonb,
 'Cel mai mare iad este să te întâlnești cu bărbatul care trebuia să fii, dar nu l-ai devenit.',
 ARRAY['time-warp', 'accelerare', 'angajament'],
 'https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=zsuXB6lSkHVvVFsFP3garLJoRRQTKGf4hgsBZUsIftyCGlUcA&videoRatio=1.766667&type=v&skinColor=%232758EB')

ON CONFLICT (module_id) DO UPDATE SET
  full_script = EXCLUDED.full_script,
  summary = EXCLUDED.summary,
  key_concepts = EXCLUDED.key_concepts,
  action_prompts = EXCLUDED.action_prompts,
  aha_moment = EXCLUDED.aha_moment,
  tags = EXCLUDED.tags,
  video_url = COALESCE(EXCLUDED.video_url, warriors_way_lesson_content.video_url),
  updated_at = now();