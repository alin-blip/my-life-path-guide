import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, MoreVertical, Plus, Pencil, Check, Trash } from 'lucide-react';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from '@/context/LanguageContext';
import { MonthlyMission, MissionCategory } from '@/types/mission';
import { ThreeStepSystem } from './mission/ThreeStepSystem';
import { MissionCategorySelector } from './mission/MissionCategorySelector';
import { FactMapsContentProps, FactMapGoal, FactMapItem, GoalStatus } from '@/types/factMaps';
import { getFactMaps, saveFactMaps, deleteFactMap } from '@/services/factMapService';
import { v4 as uuidv4 } from 'uuid';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
type MapCategory = 'foundation' | 'monthly' | 'impossible';
export const FactMapsContent: React.FC<FactMapsContentProps> = ({
  initialCategory,
  highlightId
}) => {
  const {
    language
  } = useLanguage();
  const navigate = useNavigate();
  const currentDate = new Date();
  const formattedDate = format(currentDate, "MMMM do yyyy");
  const [currentPeriod, setCurrentPeriod] = useState("2025 - Q2");
  const [editMapDialogOpen, setEditMapDialogOpen] = useState(false);
  const [editGoalDialogOpen, setEditGoalDialogOpen] = useState(false);
  const [currentMap, setCurrentMap] = useState<FactMapItem | null>(null);
  const [currentGoal, setCurrentGoal] = useState<FactMapGoal | null>(null);
  const [newMapTitle, setNewMapTitle] = useState("");
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalDescription, setNewGoalDescription] = useState("");
  const [newGoalStatus, setNewGoalStatus] = useState<GoalStatus>("pending");
  const [selectedCategory, setSelectedCategory] = useState<MapCategory>(initialCategory || 'foundation');
  const [selectedMissionTab, setSelectedMissionTab] = useState<MissionCategory | null>(null);
  const [showMissionCategories, setShowMissionCategories] = useState(false);
  const [showImpossibleCategories, setShowImpossibleCategories] = useState(false);
  const [factMaps, setFactMaps] = useState<FactMapItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [mapToDelete, setMapToDelete] = useState<FactMapItem | null>(null);
  useEffect(() => {
    fetchFactMapsFromSupabase();
    if (initialCategory) {
      setSelectedCategory(initialCategory);
      setTimeout(() => {
        const categoryElement = document.getElementById(`category-${initialCategory}`);
        if (categoryElement) {
          categoryElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 300);
    }
    if (highlightId) {
      console.log("Highlighting item with ID:", highlightId);
    }
  }, [initialCategory, highlightId]);
  useEffect(() => {
    if (!isLoading) {
      updateGoalStatuses();
      checkForAnswersAndUpdateColors();
    }
  }, [isLoading]);
  const fetchFactMapsFromSupabase = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching fact maps...");
      const data = await getFactMaps();
      if (data && data.length > 0) {
        console.log("Retrieved maps:", data.length);
        setFactMaps(data);
      } else {
        console.log("No maps found, using default templates");
        const defaultMaps = createDefaultMaps();
        setFactMaps(defaultMaps);
        await saveFactMaps(defaultMaps);
      }
    } catch (error) {
      console.error('Error in fetchFactMapsFromSupabase:', error);
      const defaultMaps = createDefaultMaps();
      setFactMaps(defaultMaps);
    } finally {
      setIsLoading(false);
    }
  };
  const createDefaultMaps = () => {
    const now = new Date().toISOString();
    return [{
      id: uuidv4(),
      title: 'BASIC - Where we are today',
      category: 'foundation' as const,
      createdAt: now,
      updatedAt: now,
      items: [{
        id: uuidv4(),
        name: 'Body',
        description: 'Current fitness level and health status',
        status: 'in-progress' as const,
        createdAt: now,
        updatedAt: now,
        answers: {},
        isCompleted: false
      }, {
        id: uuidv4(),
        name: 'Being',
        description: 'Current spiritual and mental state',
        status: 'pending' as const,
        createdAt: now,
        updatedAt: now,
        answers: {},
        isCompleted: false
      }, {
        id: uuidv4(),
        name: 'Balance',
        description: 'Current relationships and social connections',
        status: 'pending' as const,
        createdAt: now,
        updatedAt: now,
        answers: {},
        isCompleted: false
      }, {
        id: uuidv4(),
        name: 'Business',
        description: 'Current financial and career situation',
        status: 'pending' as const,
        createdAt: now,
        updatedAt: now,
        answers: {},
        isCompleted: false
      }]
    }, {
      id: uuidv4(),
      title: 'Monthly Missions Progress',
      category: 'monthly' as const,
      createdAt: now,
      updatedAt: now,
      items: [{
        id: uuidv4(),
        name: 'Body',
        description: 'No mission created yet',
        status: 'pending' as const,
        createdAt: now,
        updatedAt: now,
        isCompleted: false
      }, {
        id: uuidv4(),
        name: 'Being',
        description: 'No mission created yet',
        status: 'pending' as const,
        createdAt: now,
        updatedAt: now,
        isCompleted: false
      }, {
        id: uuidv4(),
        name: 'Balance',
        description: 'No mission created yet',
        status: 'pending' as const,
        createdAt: now,
        updatedAt: now,
        isCompleted: false
      }, {
        id: uuidv4(),
        name: 'Business',
        description: 'No mission created yet',
        status: 'pending' as const,
        createdAt: now,
        updatedAt: now,
        isCompleted: false
      }]
    }, {
      id: uuidv4(),
      title: 'Impossible Game Progress',
      category: 'impossible' as const,
      createdAt: now,
      updatedAt: now,
      items: [{
        id: uuidv4(),
        name: 'Body',
        description: 'No impossible game created yet',
        status: 'pending' as const,
        createdAt: now,
        updatedAt: now,
        isCompleted: false
      }, {
        id: uuidv4(),
        name: 'Being',
        description: 'No impossible game created yet',
        status: 'pending' as const,
        createdAt: now,
        updatedAt: now,
        isCompleted: false
      }, {
        id: uuidv4(),
        name: 'Balance',
        description: 'No impossible game created yet',
        status: 'pending' as const,
        createdAt: now,
        updatedAt: now,
        isCompleted: false
      }, {
        id: uuidv4(),
        name: 'Business',
        description: 'No impossible game created yet',
        status: 'pending' as const,
        createdAt: now,
        updatedAt: now,
        isCompleted: false
      }]
    }];
  };
  const checkForAnswersAndUpdateColors = async () => {
    try {
      const updatedMaps = [...factMaps];
      const basicMap = updatedMaps.find(map => map.category === 'foundation');
      if (!basicMap) return;
      
      let hasUpdates = false;
      
      basicMap.items.forEach((item, index) => {
        // Check if item has answers in its own data (from Supabase)
        const hasContent = item.answers && Object.values(item.answers).some(
          answer => answer && (answer as string).trim() !== ''
        );
        
        if (hasContent && !item.isCompleted) {
          basicMap.items[index] = {
            ...item,
            isBlue: true,
            isCompleted: true,
            status: 'completed'
          };
          hasUpdates = true;
        }
      });
      
      if (hasUpdates) {
        setFactMaps(updatedMaps);
        await saveFactMaps(updatedMaps);
      }
    } catch (error) {
      console.error('Error updating item colors based on answers:', error);
    }
  };
  const updateGoalStatuses = async () => {
    try {
      const storedMissions = JSON.parse(localStorage.getItem('monthlyMissions') || '[]') as MonthlyMission[];
      if (!storedMissions.length) return;
      const updatedMaps = [...factMaps];
      let monthlyMap = updatedMaps.find(map => map.category === 'monthly');
      if (!monthlyMap) {
        monthlyMap = {
          id: 'm1',
          title: 'Monthly Missions Progress',
          category: 'monthly' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          items: [{
            id: 'm1-1',
            name: 'Body',
            description: 'No mission created yet',
            status: 'pending' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isCompleted: false
          }, {
            id: 'm1-2',
            name: 'Being',
            description: 'No mission created yet',
            status: 'pending' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isCompleted: false
          }, {
            id: 'm1-3',
            name: 'Balance',
            description: 'No mission created yet',
            status: 'pending' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isCompleted: false
          }, {
            id: 'm1-4',
            name: 'Business',
            description: 'No mission created yet',
            status: 'pending' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isCompleted: false
          }]
        };
        updatedMaps.push(monthlyMap);
      }
      const monthlyMapIndex = updatedMaps.findIndex(map => map.id === monthlyMap!.id);
      storedMissions.forEach(mission => {
        if (mission.isImpossibleGame) return;
        const categoryIndexMap = {
          'body': 0,
          'being': 1,
          'balance': 2,
          'business': 3
        };
        const itemIndex = categoryIndexMap[mission.category];
        const startDate = new Date(mission.startDate);
        const endDate = new Date(mission.endDate);
        const startFormatted = format(startDate, "MMM d");
        const endFormatted = format(endDate, "MMM d, yyyy");
        const period = `${startFormatted} - ${endFormatted}`;
        const objectives = mission.questions?.impossibleFruits?.filter(fruit => fruit.trim() !== '') || [];
        if (itemIndex !== undefined && monthlyMapIndex !== -1) {
          updatedMaps[monthlyMapIndex].items[itemIndex] = {
            ...updatedMaps[monthlyMapIndex].items[itemIndex],
            description: mission.name || 'Mission',
            isBlue: true,
            status: 'in-progress',
            updatedAt: new Date().toISOString(),
            missionDetails: {
              period,
              name: mission.name,
              objectives
            }
          };
        }
      });
      let impossibleMap = updatedMaps.find(map => map.category === 'impossible');
      if (!impossibleMap) {
        impossibleMap = {
          id: 'ig1',
          title: 'Impossible Game Progress',
          category: 'impossible' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          items: [{
            id: 'ig1-1',
            name: 'Body',
            description: 'No impossible game created yet',
            status: 'pending' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isCompleted: false
          }, {
            id: 'ig1-2',
            name: 'Being',
            description: 'No impossible game created yet',
            status: 'pending' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isCompleted: false
          }, {
            id: 'ig1-3',
            name: 'Balance',
            description: 'No impossible game created yet',
            status: 'pending' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isCompleted: false
          }, {
            id: 'ig1-4',
            name: 'Business',
            description: 'No impossible game created yet',
            status: 'pending' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isCompleted: false
          }]
        };
        updatedMaps.push(impossibleMap);
      }
      const impossibleMapIndex = updatedMaps.findIndex(map => map.id === impossibleMap!.id);
      storedMissions.forEach(mission => {
        if (!mission.isImpossibleGame) return;
        const categoryIndexMap = {
          'body': 0,
          'being': 1,
          'balance': 2,
          'business': 3
        };
        const itemIndex = categoryIndexMap[mission.category];
        if (itemIndex !== undefined && impossibleMapIndex !== -1) {
          const year = new Date(mission.startDate).getFullYear();
          const period = `${year} - ${year + 1}`;
          const objectives = mission.questions?.impossibleFruits?.filter(fruit => fruit.trim() !== '') || [];
          updatedMaps[impossibleMapIndex].items[itemIndex] = {
            ...updatedMaps[impossibleMapIndex].items[itemIndex],
            description: mission.name || 'Impossible Game',
            isBlue: true,
            status: 'in-progress',
            updatedAt: new Date().toISOString(),
            missionDetails: {
              period,
              name: mission.name,
              objectives
            }
          };
        }
      });
      setFactMaps(updatedMaps);
      await saveFactMaps(updatedMaps);
    } catch (error) {
      console.error('Error updating goal statuses:', error);
    }
  };
  const handlePrevPeriod = () => {
    setCurrentPeriod("2025 - Q1");
  };
  const handleNextPeriod = () => {
    setCurrentPeriod("2025 - Q3");
  };
  const getStatusColor = (status: GoalStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };
  const toggleGoalCompletion = async (map: FactMapItem, goal: FactMapGoal, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const newStatus: GoalStatus = goal.status === 'completed' ? 'pending' : 'completed';
      const updatedMaps = factMaps.map(m => {
        if (m.id === map.id) {
          const updatedItems = m.items.map(item => item.id === goal.id ? {
            ...item,
            status: newStatus,
            updatedAt: new Date().toISOString()
          } : item);
          return {
            ...m,
            items: updatedItems,
            updatedAt: new Date().toISOString()
          };
        }
        return m;
      });
      setFactMaps(updatedMaps);
      await saveFactMaps(updatedMaps);
      toast({
        title: newStatus === 'completed' ? "Goal Completed" : "Goal Marked as Pending",
        description: `${goal.name} has been marked as ${newStatus}.`
      });
    } catch (error) {
      console.error('Error toggling goal completion:', error);
      toast({
        title: "Error",
        description: "Failed to update goal status.",
        variant: "destructive"
      });
    }
  };
  const addNewMap = async (category: MapCategory) => {
    try {
      console.log(`Adding new map for category: ${category}`);
      const mapId = uuidv4();
      const now = new Date().toISOString();
      const newMap: FactMapItem = {
        id: mapId,
        title: category === 'foundation' ? 'NEW MAP' : category === 'monthly' ? `MM.Q1.${new Date().getFullYear()}-NEW` : `IG.${new Date().getFullYear()}-NEW`,
        category: category,
        createdAt: now,
        updatedAt: now,
        items: [{
          id: `${mapId}-1`,
          name: 'Body',
          description: 'Enter your goals here...',
          status: 'pending' as const,
          createdAt: now,
          updatedAt: now
        }, {
          id: `${mapId}-2`,
          name: 'Being',
          description: 'Enter your goals here...',
          status: 'pending' as const,
          createdAt: now,
          updatedAt: now
        }, {
          id: `${mapId}-3`,
          name: 'Balance',
          description: 'Enter your goals here...',
          status: 'pending' as const,
          createdAt: now,
          updatedAt: now
        }, {
          id: `${mapId}-4`,
          name: 'Business',
          description: 'Enter your goals here...',
          status: 'pending' as const,
          createdAt: now,
          updatedAt: now
        }]
      };
      const updatedMaps = [...factMaps, newMap];
      setFactMaps(updatedMaps);
      await saveFactMaps(updatedMaps);
      toast({
        title: "Success",
        description: "New map created successfully"
      });
    } catch (error) {
      console.error('Error adding new map:', error);
      toast({
        title: "Error",
        description: "Failed to create new map",
        variant: "destructive"
      });
    }
  };
  const handleEditMap = (map: FactMapItem) => {
    setCurrentMap(map);
    setNewMapTitle(map.title);
    setEditMapDialogOpen(true);
  };
  const handleDeleteMap = (map: FactMapItem) => {
    setMapToDelete(map);
    setDeleteConfirmOpen(true);
  };
  const confirmDeleteMap = async () => {
    if (!mapToDelete) return;
    try {
      const success = await deleteFactMap(mapToDelete.id);
      if (success) {
        const updatedMaps = factMaps.filter(map => map.id !== mapToDelete.id);
        setFactMaps(updatedMaps);
        toast({
          title: "Success",
          description: "Map deleted successfully"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete map",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting map:', error);
      toast({
        title: "Error",
        description: "Failed to delete map",
        variant: "destructive"
      });
    } finally {
      setDeleteConfirmOpen(false);
      setMapToDelete(null);
    }
  };
  const handleSaveMapEdit = async () => {
    if (!currentMap) return;
    const updatedMaps = factMaps.map(map => map.id === currentMap.id ? {
      ...map,
      title: newMapTitle,
      updatedAt: new Date().toISOString()
    } : map);
    setFactMaps(updatedMaps);
    await saveFactMaps(updatedMaps);
    setEditMapDialogOpen(false);
    toast({
      title: "Success",
      description: "Map updated successfully"
    });
  };
  const handleEditGoal = (map: FactMapItem, goal: FactMapGoal, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    handleGoToFactMapDetail(map, goal);
  };
  const handleSaveGoalEdit = () => {
    if (!currentMap || !currentGoal) return;
    const updatedMaps = factMaps.map(map => {
      if (map.id === currentMap.id) {
        const updatedItems = map.items.map(item => item.id === currentGoal.id ? {
          ...item,
          name: newGoalName,
          description: newGoalDescription,
          status: newGoalStatus,
          updatedAt: new Date().toISOString()
        } : item);
        return {
          ...map,
          items: updatedItems,
          updatedAt: new Date().toISOString()
        };
      }
      return map;
    });
    setFactMaps(updatedMaps);
    localStorage.setItem('factMaps', JSON.stringify(updatedMaps));
    setEditGoalDialogOpen(false);
    toast({
      title: "Success",
      description: "Goal updated successfully"
    });
  };
  const handleGoToFactMapDetail = (map: FactMapItem, goal: FactMapGoal) => {
    if (map.category === 'monthly') {
      const categoryMapping: Record<string, MissionCategory> = {
        'Body': 'body',
        'Being': 'being',
        'Balance': 'balance',
        'Business': 'business'
      };
      const missionCategory = categoryMapping[goal.name] as MissionCategory;
      if (missionCategory) {
        navigate(`/fact-maps/monthly-mission?category=${missionCategory}`);
        return;
      }
    }
    if (map.category === 'impossible') {
      const categoryMapping: Record<string, MissionCategory> = {
        'Body': 'body',
        'Being': 'being',
        'Balance': 'balance',
        'Business': 'business'
      };
      const missionCategory = categoryMapping[goal.name] as MissionCategory;
      if (missionCategory) {
        navigate(`/fact-maps/monthly-mission?category=${missionCategory}&isImpossible=true`);
        return;
      }
    }
    navigate(`/fact-maps/${map.id}/${goal.id}`);
  };
  const handleCreateMonthlyMission = (category?: MissionCategory, isImpossible: boolean = false) => {
    if (category) {
      navigate(`/fact-maps/monthly-mission?category=${category}${isImpossible ? '&isImpossible=true' : ''}`);
    } else {
      navigate('/fact-maps/monthly-mission');
    }
  };
  const toggleMissionCategories = () => {
    setShowMissionCategories(!showMissionCategories);
  };
  const toggleImpossibleCategories = () => {
    setShowImpossibleCategories(!showImpossibleCategories);
  };
  const renderMapCard = (map: FactMapItem) => {
    if (!map || !map.items) return null;
    return;
  };
  const renderCategorySection = (category: MapCategory) => {
    const categoryMaps = factMaps.filter(map => map.category === category);
    if (isLoading) {
      return <div className="flex-1 p-2" id={`category-${category}`}>
          <h2 className="text-center uppercase tracking-widest font-light text-gray-300 mb-6">{category}</h2>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>;
    }
    if (category === 'foundation') {
      const basicMaps = categoryMaps.filter(map => map.category === 'foundation');
      return <div className="flex-1 p-2" id={`category-${category}`}>
          <h2 className="text-center uppercase tracking-widest font-light text-gray-300 mb-6">{category}</h2>
          <div className="flex justify-center mb-6">
            <Button className="rounded-full bg-blue-600 hover:bg-blue-700 h-12 w-12 p-0" onClick={() => addNewMap(category)}>
              <Plus className="h-6 w-6" />
            </Button>
          </div>
          <div className="space-y-4 mt-4">
            {basicMaps.length > 0 ? basicMaps.map(map => renderMapCard(map)) : <div className="text-center py-8 text-gray-400">
                <p>No foundation maps found. Click the + button to create one.</p>
              </div>}
          </div>
        </div>;
    }
    if (category === 'monthly') {
      const monthlyMap = categoryMaps.find(map => map.id === 'm1' || map.title.includes('Monthly Missions'));
      return <div className="flex-1 p-2" id={`category-${category}`}>
          <h2 className="text-center uppercase tracking-widest font-light text-gray-300 mb-6">
            Monthly Mission
          </h2>
          <div className="flex justify-center mb-6">
            <Button className="rounded-full bg-blue-600 hover:bg-blue-700 h-12 w-12 p-0" onClick={toggleMissionCategories}>
              <Plus className="h-6 w-6" />
            </Button>
          </div>
          
          {showMissionCategories && <div className="mb-6">
              <MissionCategorySelector />
            </div>}
          
          <div className="space-y-4 mt-4">
            {monthlyMap && renderMapCard(monthlyMap)}
          </div>
        </div>;
    }
    if (category === 'impossible') {
      const impossibleMap = categoryMaps.find(map => map.id === 'ig1' || map.title.includes('Impossible Game'));
      return <div className="flex-1 p-2" id={`category-${category}`}>
          <h2 className="text-center uppercase tracking-widest font-light text-gray-300 mb-6">
            Impossible Game
          </h2>
          <div className="flex justify-center mb-6">
            <Button className="rounded-full bg-blue-600 hover:bg-blue-700 h-12 w-12 p-0" onClick={toggleImpossibleCategories}>
              <Plus className="h-6 w-6" />
            </Button>
          </div>
          
          {showImpossibleCategories && <div className="mb-6">
              <MissionCategorySelector isImpossibleGame={true} />
            </div>}
          
          <div className="space-y-4 mt-4">
            {impossibleMap && renderMapCard(impossibleMap)}
          </div>
        </div>;
    }
    return <div className="flex-1 p-2" id={`category-${category}`}>
        <h2 className="text-center uppercase tracking-widest font-light text-gray-300 mb-6">
          {category}
        </h2>
        <div className="flex justify-center mb-6">
          <Button className="rounded-full bg-blue-600 hover:bg-blue-700 h-12 w-12 p-0" onClick={() => addNewMap(category)}>
            <Plus className="h-6 w-6" />
          </Button>
        </div>
        <div className="space-y-4 mt-4">
          {categoryMaps.length > 0 ? categoryMaps.map(map => renderMapCard(map)) : <div className="text-center py-8 text-gray-400">
              <p>No maps found. Click the + button to create one.</p>
            </div>}
        </div>
      </div>;
  };
  return <div className="min-h-screen bg-gradient-to-b from-[#0c1023] to-[#1a2242] text-white pb-20">
      <header className="p-6 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl tracking-wider font-light">FACT MAPS</h1>
          <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className="ml-2 text-gray-300">April 6th 2025</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            <img src="/lovable-uploads/561095a8-076a-45bc-9bc2-a92402aa267a.png" alt="Founder profile avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      <div className="flex justify-center items-center my-8">
        <Button variant="ghost" className="text-gray-400" onClick={handlePrevPeriod}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="bg-[#1e243b80] px-12 py-3 rounded-full">
          <span className="text-gray-300 text-lg">{currentPeriod}</span>
        </div>
        <Button variant="ghost" className="text-gray-400" onClick={handleNextPeriod}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
      
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-4">
          {renderCategorySection('foundation')}
          {renderCategorySection('monthly')}
          {renderCategorySection('impossible')}
        </div>
      </div>

      <Dialog open={editMapDialogOpen} onOpenChange={setEditMapDialogOpen}>
        <DialogContent className="bg-[#1A2234] text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Edit Map</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update the details of your map.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mapTitle" className="text-right">
                Title
              </Label>
              <Input id="mapTitle" value={newMapTitle} onChange={e => setNewMapTitle(e.target.value)} className="col-span-3 bg-[#1E2638] border-gray-700 text-white" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="text-gray-300 border-gray-700">
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleSaveMapEdit} className="bg-blue-500 hover:bg-blue-600">
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-[#1A2234] text-white border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. This will permanently delete the map 
              "{mapToDelete?.title}" and all its content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent text-gray-300 border-gray-700 hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteMap} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
};