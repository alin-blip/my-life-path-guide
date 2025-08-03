
import React, { useState, useEffect } from 'react';
import { Check, ChevronLeft, ChevronRight, Plus, MoreVertical, X, Trash2 } from 'lucide-react';
import { Card } from './ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { MissionCategory } from '@/types/mission';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { getCategoryName } from './mission/utils/categoryUtils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatFromSupabase } from '@/types/factMaps';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { useNavigate } from 'react-router-dom';

export const GameContent: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentQuarter, setCurrentQuarter] = useState(2);
  const [currentYear, setCurrentYear] = useState(2025);
  const [openDialog, setOpenDialog] = useState<'foundation' | 'monthly' | 'impossible' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [missionToDelete, setMissionToDelete] = useState<{id: string, type: string} | null>(null);
  
  // State for missions with proper structure
  const [missions, setMissions] = useState<{
    foundation: { id: string; name: string; categories: MissionCategory[] }[];
    monthly: { id: string; name: string; categories: MissionCategory[] }[];
    impossible: { id: string; name: string; categories: MissionCategory[] }[];
  }>({
    foundation: [],
    monthly: [],
    impossible: []
  });

  useEffect(() => {
    fetchMissions();
  }, []);

  const handlePreviousQuarter = () => {
    if (currentQuarter === 1) {
      setCurrentYear(prev => prev - 1);
      setCurrentQuarter(4);
    } else {
      setCurrentQuarter(prev => prev - 1);
    }
  };

  const handleNextQuarter = () => {
    if (currentQuarter === 4) {
      setCurrentYear(prev => prev + 1);
      setCurrentQuarter(1);
    } else {
      setCurrentQuarter(prev => prev + 1);
    }
  };
  
  const handleAddMission = (type: 'foundation' | 'monthly' | 'impossible') => {
    setOpenDialog(type);
  };

  const handleDeleteMission = (id: string, type: string) => {
    setMissionToDelete({ id, type });
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteMission = async () => {
    if (!missionToDelete) return;
    
    setIsLoading(true);
    try {
      let error = null;
      
      if (missionToDelete.type === 'monthly' || missionToDelete.type === 'impossible') {
        // TODO: Implement proper database deletion with authentication
        // For now, using local storage until authentication is implemented
        const savedMissions = JSON.parse(localStorage.getItem('monthlyMissions') || '[]');
        const updatedMissions = savedMissions.filter((m: any) => m.id !== missionToDelete.id);
        localStorage.setItem('monthlyMissions', JSON.stringify(updatedMissions));
        const result = { error: null };
          
        error = result.error;
      } else {
        const result = await supabase
          .from('fact_maps')
          .delete()
          .eq('id', missionToDelete.id);
          
        error = result.error;
      }
      
      if (error) throw error;
      
      // Create a deep copy of the missions state to avoid reference issues
      const updatedMissions = {
        foundation: [...missions.foundation],
        monthly: [...missions.monthly],
        impossible: [...missions.impossible]
      };
      
      // Filter out the deleted mission from the appropriate array
      updatedMissions[missionToDelete.type as 'foundation' | 'monthly' | 'impossible'] = 
        updatedMissions[missionToDelete.type as 'foundation' | 'monthly' | 'impossible'].filter(
          mission => mission.id !== missionToDelete.id
        );
      
      // Update state with the new missions object
      setMissions(updatedMissions);
      
      toast({
        title: language === 'en' ? 'Mission Deleted' : 'Misiune Ștearsă',
        description: language === 'en' 
          ? 'The mission has been permanently deleted.' 
          : 'Misiunea a fost ștearsă definitiv.',
      });
    } catch (err) {
      console.error('Error deleting mission:', err);
      toast({
        title: language === 'en' ? 'Error' : 'Eroare',
        description: language === 'en' 
          ? 'Failed to delete mission' 
          : 'Nu s-a putut șterge misiunea',
        variant: 'destructive'
      });
    } finally {
      // Reset state in a clean way to avoid stale references
      setIsLoading(false);
      setDeleteConfirmOpen(false);
      setMissionToDelete(null);
    }
  };

  const handleCategorySelect = async (type: 'foundation' | 'monthly' | 'impossible', category: MissionCategory) => {
    setIsLoading(true);
    try {
      // Create different types of missions based on selection
      if (type === 'foundation') {
        // Create a new foundation fact map
        // TODO: Implement proper database insertion with authentication
        // For now, using local storage until authentication is implemented
        const newFoundation = {
          id: crypto.randomUUID(),
          title: `Foundation ${currentQuarter}-${currentYear}`,
          category: 'foundation',
          user_id: 'temp-user', // Will be replaced with real user ID when auth is implemented
          items: [{ 
            id: crypto.randomUUID(),
            name: category,
            description: '',
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const existingMaps = JSON.parse(localStorage.getItem('factMaps') || '[]');
        localStorage.setItem('factMaps', JSON.stringify([...existingMaps, newFoundation]));
        const data = [newFoundation];
        const error = null;

        if (error) throw error;
        
        toast({
          title: language === 'en' ? 'Foundation Map Created' : 'Hartă de Fundație Creată',
          description: language === 'en' 
            ? `You can now add more details to your ${category} foundation` 
            : `Acum poți adăuga mai multe detalii la fundația ${category}`,
        });
        
      } else {
        // Create monthly or impossible mission
        // TODO: Implement proper database insertion with authentication
        // For now, using local storage until authentication is implemented
        const newMission = {
          id: crypto.randomUUID(),
          name: `${type === 'monthly' ? 'MM' : 'IG'} ${category.charAt(0).toUpperCase() + category.slice(1)}`,
          category: category,
          user_id: 'temp-user', // Will be replaced with real user ID when auth is implemented
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          is_impossible_game: type === 'impossible',
          questions: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const existingMissions = JSON.parse(localStorage.getItem('monthlyMissions') || '[]');
        localStorage.setItem('monthlyMissions', JSON.stringify([...existingMissions, newMission]));
        const data = [newMission];
        const error = null;

        if (error) throw error;
        
        toast({
          title: language === 'en' ? `${type === 'monthly' ? 'Monthly' : 'Impossible'} Mission Created` : 
            `Misiune ${type === 'monthly' ? 'Lunară' : 'Imposibilă'} Creată`,
          description: language === 'en' 
            ? `New ${category} mission created successfully` 
            : `Noua misiune ${category} a fost creată cu succes`,
        });
      }

      // After successful creation, fetch the newly created mission
      await fetchMissions();
      
    } catch (err) {
      console.error('Error creating mission:', err);
      toast({
        title: language === 'en' ? 'Error' : 'Eroare',
        description: language === 'en' 
          ? 'Failed to create mission' 
          : 'Nu s-a putut crea misiunea',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      setOpenDialog(null);
    }
  };

  const handleCategoryClick = (type: 'foundation' | 'monthly' | 'impossible', mission: any, category: MissionCategory) => {
    // Navigate to the appropriate screen based on type and category
    if (type === 'foundation') {
      navigate(`/fact-maps/${mission.id}/${mission.categories.find(c => c === category)}`);
    } else if (type === 'monthly') {
      navigate(`/fact-maps/monthly-mission?category=${category}`);
    } else {
      navigate(`/fact-maps/monthly-mission?category=${category}&isImpossible=true`);
    }
  };

  // Fetch missions from Supabase when needed
  const fetchMissions = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement proper database fetching with authentication
      // For now, using local storage until authentication is implemented
      const factMapData = JSON.parse(localStorage.getItem('factMaps') || '[]').filter((map: any) => map.category === 'foundation');
      const monthlyData = JSON.parse(localStorage.getItem('monthlyMissions') || '[]').filter((mission: any) => !mission.is_impossible_game);
      const impossibleData = JSON.parse(localStorage.getItem('monthlyMissions') || '[]').filter((mission: any) => mission.is_impossible_game);

      // Process and set the missions data - start with empty arrays
      const formattedFoundation = factMapData ? factMapData.map(item => {
        const formattedItem = formatFromSupabase(item);
        return {
          id: formattedItem.id,
          name: formattedItem.title || `Foundation #${formattedItem.id.substring(0, 4)}`,
          categories: formattedItem.items
            .map(goal => goal.name.toLowerCase() as MissionCategory)
            .filter(Boolean) as MissionCategory[]
        };
      }) : [];

      const formattedMonthly = monthlyData ? monthlyData.map(item => ({
        id: item.id,
        name: item.name || `Monthly Mission`,
        categories: [item.category as MissionCategory]
      })) : [];

      const formattedImpossible = impossibleData ? impossibleData.map(item => ({
        id: item.id,
        name: item.name || `Impossible Game`,
        categories: [item.category as MissionCategory]
      })) : [];

      // Update state with fetched missions - don't create defaults if none exist
      setMissions({
        foundation: formattedFoundation,
        monthly: formattedMonthly,
        impossible: formattedImpossible
      });
    } catch (err) {
      toast({
        title: language === 'en' ? 'Error' : 'Eroare',
        description: language === 'en' 
          ? 'Failed to load missions' 
          : 'Nu s-au putut încărca misiunile',
        variant: 'destructive'
      });
      console.error('Error fetching missions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const isCategoryCompleted = (mission: any, category: MissionCategory) => {
    return mission.categories.includes(category);
  };

  const renderMissionCard = (type: 'foundation' | 'monthly' | 'impossible', mission: any) => {
    const isImpossible = type === 'impossible';
    
    return (
      <Card key={mission.id} className="bg-slate-800/50 rounded-xl overflow-hidden border-0 shadow-md">
        <div className="flex justify-between items-center p-4 bg-slate-700/30">
          <div className="text-gray-300 text-sm">{mission.name}</div>
          <div className="text-gray-300 text-sm">{type === 'monthly' ? 'MM' : 'IG'}:{mission.id.substring(0, 4)}</div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-white">
              <DropdownMenuItem 
                className="text-red-400 focus:text-red-300 focus:bg-slate-700"
                onClick={() => handleDeleteMission(mission.id, type)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {language === 'en' ? 'Delete' : 'Șterge'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="p-3 space-y-2">
          {['body', 'being', 'balance', 'business'].map((category) => (
            <div 
              key={category}
              className={`
                flex justify-between items-center p-3 rounded-lg cursor-pointer
                ${isImpossible && isCategoryCompleted(mission, category as MissionCategory) 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : isCategoryCompleted(mission, category as MissionCategory)
                    ? 'bg-slate-700/80 text-white hover:bg-slate-600'
                    : 'bg-slate-700/40 text-gray-400 hover:bg-slate-700/60'}
              `}
              onClick={() => handleCategoryClick(type, mission, category as MissionCategory)}
            >
              {language === 'en' 
                ? category.charAt(0).toUpperCase() + category.slice(1) 
                : category === 'body' ? 'Corp' 
                  : category === 'being' ? 'Ființă' 
                  : category === 'balance' ? 'Echilibru' 
                  : 'Afacere'}
              
              {isCategoryCompleted(mission, category as MissionCategory) && (
                isImpossible ? (
                  <Check className="h-4 w-4 text-white" />
                ) : (
                  <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full">
                    <Plus className="h-4 w-4" />
                  </Button>
                )
              )}
            </div>
          ))}
        </div>
      </Card>
    );
  };

  const renderPlusButton = (type: 'foundation' | 'monthly' | 'impossible') => (
    <Button
      onClick={() => handleAddMission(type)}
      className="h-14 w-14 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center mx-auto shadow-lg"
      disabled={isLoading}
    >
      <Plus className="h-8 w-8 text-white" />
    </Button>
  );

  const renderCategoryDialog = () => {
    if (!openDialog) return null;
    
    return (
      <Dialog open={openDialog !== null} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent className="bg-slate-800 text-white border-0 max-w-md p-0 rounded-xl overflow-hidden">
          <DialogTitle className="sr-only">
            {language === 'en' ? 'Select Category' : 'Selectează Categoria'}
          </DialogTitle>
          
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                {language === 'en' ? 'Select Category' : 'Selectează Categoria'}
              </h3>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setOpenDialog(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {(['body', 'being', 'balance', 'business'] as MissionCategory[]).map((category) => (
                <Button 
                  key={category}
                  className="flex justify-between items-center bg-slate-700/50 hover:bg-blue-600/50 p-4 rounded-lg text-left"
                  onClick={() => handleCategorySelect(openDialog, category)}
                  disabled={isLoading}
                >
                  <span>{getCategoryName(category, language)}</span>
                  <Plus className="h-5 w-5" />
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0c1023] to-[#1a2242] text-white pb-20 p-6">
      {/* Quarter Selector */}
      <div className="flex justify-center items-center mb-10 mt-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handlePreviousQuarter}
          className="text-gray-400 hover:text-white"
          disabled={isLoading}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <div className="bg-slate-800/50 px-12 py-3 rounded-full shadow-lg mx-4">
          <span className="text-gray-300 text-lg font-medium tracking-wider">
            {currentYear} - Q{currentQuarter}
          </span>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleNextQuarter}
          className="text-gray-400 hover:text-white"
          disabled={isLoading}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Columns Layout */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Foundation Column */}
        <div>
          <h2 className="text-center uppercase tracking-widest font-light text-gray-300 mb-6">
            {language === 'en' ? 'Foundation' : 'Fundație'}
          </h2>
          
          <div className="bg-slate-800/20 rounded-xl p-6 min-h-[200px] flex items-center justify-center shadow-inner">
            {isLoading ? (
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-slate-700 h-10 w-10"></div>
              </div>
            ) : (
              renderPlusButton('foundation')
            )}
          </div>
          
          {/* Display Foundation Maps if they exist */}
          {missions.foundation.length > 0 && (
            <div className="mt-6 space-y-4">
              {missions.foundation.map(mission => renderMissionCard('foundation', mission))}
            </div>
          )}
        </div>
        
        {/* Monthly Mission Column */}
        <div>
          <h2 className="text-center uppercase tracking-widest font-light text-gray-300 mb-6">
            {language === 'en' ? 'Monthly Mission' : 'Misiune Lunară'}
          </h2>
          
          <div className="bg-slate-800/20 rounded-xl p-6 min-h-[200px] flex items-center justify-center shadow-inner">
            {isLoading ? (
              <div className="animate-pulse flex space-x-4 justify-center">
                <div className="rounded-full bg-slate-700 h-10 w-10"></div>
              </div>
            ) : (
              renderPlusButton('monthly')
            )}
          </div>
          
          {/* Display Monthly Missions if they exist */}
          {missions.monthly.length > 0 && (
            <div className="mt-6 space-y-4">
              {missions.monthly.map(mission => renderMissionCard('monthly', mission))}
            </div>
          )}
        </div>
        
        {/* Impossible Column */}
        <div>
          <h2 className="text-center uppercase tracking-widest font-light text-gray-300 mb-6">
            {language === 'en' ? 'Impossible' : 'Imposibil'}
          </h2>
          
          <div className="bg-slate-800/20 rounded-xl p-6 min-h-[200px] flex items-center justify-center shadow-inner">
            {isLoading ? (
              <div className="animate-pulse flex space-x-4 justify-center">
                <div className="rounded-full bg-slate-700 h-10 w-10"></div>
              </div>
            ) : (
              renderPlusButton('impossible')
            )}
          </div>
          
          {/* Display Impossible Game Missions if they exist */}
          {missions.impossible.length > 0 && (
            <div className="mt-6 space-y-4">
              {missions.impossible.map(mission => renderMissionCard('impossible', mission))}
            </div>
          )}
        </div>
      </div>
      
      {/* Category Selection Dialog */}
      {renderCategoryDialog()}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-slate-800 text-white border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle>{language === 'en' ? 'Are you sure?' : 'Ești sigur?'}</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              {language === 'en' 
                ? 'This action cannot be undone. This will permanently delete the selected mission.'
                : 'Această acțiune nu poate fi anulată. Misiunea selectată va fi ștearsă definitiv.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-transparent text-gray-300 border-gray-700 hover:bg-gray-700"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setMissionToDelete(null);
              }}
            >
              {language === 'en' ? 'Cancel' : 'Anulează'}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteMission}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {language === 'en' ? 'Delete' : 'Șterge'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
