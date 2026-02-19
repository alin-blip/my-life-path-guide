

# #4 — Moderare Comunitate: Stergere Postari + Permisiuni

## Problema actuala
Meniul admin din `SkoolPostCard` permite **Pin** si **Schimbare categorie**, dar nu exista optiunea de **Stergere postare**. Nici utilizatorii nu pot sterge propriile postari. Acest lucru inseamna ca spam-ul sau continutul inadecvat nu poate fi eliminat din feed.

## Ce vom implementa

### 1. Stergere postare din SkoolPostCard
Adaugam doua optiuni noi in dropdown-ul existent:
- **Admin**: Buton "Sterge postare" (cu confirmare) - vizibil pentru admini
- **Autor**: Buton "Sterge" - vizibil doar pentru autorul postarii

### 2. Dialog de confirmare
Inainte de stergere, se afiseaza un `AlertDialog` cu mesaj de confirmare pentru a preveni stergerile accidentale.

### 3. RLS Policy - Stergere
Verificam si adaugam (daca lipseste) o politica RLS pe `wall_posts` care permite:
- Adminilor sa stearga orice postare
- Utilizatorilor sa isi stearga doar propriile postari

---

## Detalii tehnice

### Fisier: `src/components/programs/SkoolPostCard.tsx`
- Import `AlertDialog` din radix
- Import `Trash2` icon
- Adaugam state `deleteLoading` si `showDeleteConfirm`
- Functie `handleDeletePost` care face `supabase.from('wall_posts').delete().eq('id', post.id)` apoi apeleaza `onRefresh()`
- In dropdown menu:
  - Daca `isAdmin` sau `user?.id === post.user_id`: afisam optiunea "Sterge"
- `AlertDialog` cu confirmare

### Baza de date (migratie SQL)
- Verificam si adaugam policy RLS `DELETE` pe `wall_posts` pentru:
  - `auth.uid() = user_id` (proprietarul)
  - `public.has_role(auth.uid(), 'admin')` (admin)

### Fisiere modificate
1. `src/components/programs/SkoolPostCard.tsx` — adaugare buton stergere + dialog confirmare
2. Migratie SQL — RLS policy DELETE pe `wall_posts`

