-- Adaugă coloana author_name pentru comentarii fictive
ALTER TABLE public.warriors_way_comments 
ADD COLUMN author_name TEXT;