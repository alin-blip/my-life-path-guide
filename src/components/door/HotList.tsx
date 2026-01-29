import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, GripVertical, Search, Plus, Target, Brain, CheckCircle2, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { DoorEmptyState } from './DoorEmptyState';
import { cn } from '@/lib/utils';
import { IdeaBankItem, IdeaAnalysisResult, ideasBankService } from '@/services/ideasBankService';
import { IdeaAnalysisModal } from './IdeaAnalysisModal';
import { IdeaQuadrantModal } from './IdeaQuadrantModal';
import { useToast } from '@/hooks/use-toast';
import { EisenhowerSelector } from '@/components/ui/EisenhowerSelector';
import { QuadrantBadge } from '@/components/ui/QuadrantBadge';
import { priorityToQuadrant, EISENHOWER_QUADRANTS, getQuadrantLabel } from '@/types/eisenhower';

interface HotListProps {
  onMoveToHit?: (idea: IdeaBankItem) => void;
  onMoveToDo?: (idea: IdeaBankItem) => void;
  isMobile?: boolean;
}

export const HotList: React.FC<HotListProps> = ({
  onMoveToHit,
  onMoveToDo,
  isMobile = false
}) => {
  const [ideas, setIdeas] = useState<IdeaBankItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newItemText, setNewItemText] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [selectedIdea, setSelectedIdea] = useState<IdeaBankItem | null>(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  
  // Quadrant modal state
  const [pendingIdea, setPendingIdea] = useState<IdeaBankItem | null>(null);
  const [showQuadrantModal, setShowQuadrantModal] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();
  const { toast } = useToast();

  // Load ideas on mount
  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    try {
      const loadedIdeas = await ideasBankService.fetchAllIdeas();
      setIdeas(loadedIdeas);
    } catch (error) {
      console.error('Error loading ideas:', error);
    }
  };

  const filteredIdeas = ideas.filter(idea =>
    idea.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddItem = async () => {
    if (newItemText.trim() && !isAdding) {
      setIsAdding(true);
      try {
        // Save with priority 0 (unset) - will be classified in modal
        const newIdea = await ideasBankService.addIdea(newItemText.trim(), 'work', 0);
        setIdeas(prev => [newIdea, ...prev]);
        setNewItemText('');
        
        // Open quadrant modal for classification
        setPendingIdea(newIdea);
        setShowQuadrantModal(true);
      } catch (error) {
        console.error('Error adding idea:', error);
        toast({
          title: '⚠️ Eroare',
          description: 'Nu s-a putut salva ideea',
          variant: 'destructive',
        });
      } finally {
        setIsAdding(false);
      }
    }
  };

  // Quadrant modal handlers
  const handleQuadrantSelect = async (priority: number) => {
    if (!pendingIdea) return;
    
    try {
      // If Q4 (eliminator, priority=1), delete the idea
      if (priority === 1) {
        await handleDelete(pendingIdea.id);
        toast({
          title: "🗑️ Idee eliminată",
          description: "Nu era importantă și nici urgentă",
        });
      } else {
        await ideasBankService.updateIdea(pendingIdea.id, { priority });
        setIdeas(prev => prev.map(i => 
          i.id === pendingIdea.id ? { ...i, priority } : i
        ));
        toast({
          title: "✅ Idee clasificată!",
          description: `Cadran: ${getQuadrantLabel(priority)}`,
        });
      }
    } catch (error) {
      console.error('Error updating idea priority:', error);
    }
    
    setShowQuadrantModal(false);
    setPendingIdea(null);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSkipClassification = () => {
    setShowQuadrantModal(false);
    setPendingIdea(null);
    toast({
      title: "💡 Idee salvată",
      description: "Poți clasifica mai târziu",
    });
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleAnalyzeFromModal = () => {
    setShowQuadrantModal(false);
    if (pendingIdea) {
      setSelectedIdea(pendingIdea);
      setIsAnalysisModalOpen(true);
      setPendingIdea(null);
    }
  };

  const handleUpdateText = async (id: string, text: string) => {
    if (!text.trim()) return;
    try {
      await ideasBankService.updateIdea(id, { text: text.trim() });
      setIdeas(prev => prev.map(idea => 
        idea.id === id ? { ...idea, text: text.trim() } : idea
      ));
    } catch (error) {
      console.error('Error updating idea:', error);
    }
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await ideasBankService.deleteIdea(id);
      setIdeas(prev => prev.filter(idea => idea.id !== id));
      toast({
        title: "Idee ștearsă",
        description: "Ideea a fost eliminată",
      });
    } catch (error) {
      console.error('Error deleting idea:', error);
    }
  };

  const handleArchive = async (idea: IdeaBankItem) => {
    try {
      await ideasBankService.archiveIdea(idea.id);
      setIdeas(prev => prev.filter(i => i.id !== idea.id));
      setIsAnalysisModalOpen(false);
      toast({
        title: "Idee arhivată",
        description: "Ideea a fost mutată în arhivă",
      });
    } catch (error) {
      console.error('Error archiving idea:', error);
    }
  };

  const handleAnalyze = (idea: IdeaBankItem) => {
    setSelectedIdea(idea);
    setIsAnalysisModalOpen(true);
  };

  const handleAnalysisComplete = (idea: IdeaBankItem, result: IdeaAnalysisResult) => {
    setIdeas(prev => prev.map(i => 
      i.id === idea.id ? { ...i, analysis_result: result, status: result.recommendation === 'pursue' ? 'approved' : result.recommendation === 'defer' ? 'analyzed' : 'rejected' } : i
    ));
  };

  const handleMoveToHit = (idea: IdeaBankItem) => {
    onMoveToHit?.(idea);
    setIsAnalysisModalOpen(false);
    // Remove from ideas list after moving
    setIdeas(prev => prev.filter(i => i.id !== idea.id));
    ideasBankService.archiveIdea(idea.id);
  };

  const handleMoveToDo = (idea: IdeaBankItem) => {
    onMoveToDo?.(idea);
    setIsAnalysisModalOpen(false);
    // Remove from ideas list after moving
    setIdeas(prev => prev.filter(i => i.id !== idea.id));
    ideasBankService.archiveIdea(idea.id);
  };

  const getStatusBadge = (idea: IdeaBankItem) => {
    if (!idea.analysis_result) return null;

    const config = {
      pursue: { icon: CheckCircle2, className: 'text-green-500' },
      defer: { icon: AlertTriangle, className: 'text-yellow-500' },
      discard: { icon: XCircle, className: 'text-red-500' }
    };

    const rec = idea.analysis_result.recommendation;
    const { icon: Icon, className } = config[rec];
    
    return (
      <div className={cn("flex items-center gap-1", className)} title={`${rec.toUpperCase()} - ${idea.analysis_result.relevance_score}%`}>
        <Icon className="w-3 h-3" />
        <span className="text-xs">{idea.analysis_result.relevance_score}%</span>
      </div>
    );
  };

  return (
    <div className={isMobile ? 'max-h-[70vh] overflow-y-auto overflow-x-hidden w-full max-w-full' : ''}>
      {/* Add Input */}
      <div className={`${isMobile ? 'mb-3' : 'mb-4'}`}>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Plus className={`absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground ${isMobile ? 'w-3 h-3' : 'h-4 w-4'}`} />
            <Input
              ref={inputRef}
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === 'Enter' && !isAdding) {
                  e.preventDefault();
                  await handleAddItem();
                }
              }}
              placeholder={isAdding ? "Se salvează..." : `${t('addItem')}...${!isMobile ? ' (Enter ↵)' : ''}`}
              disabled={isAdding}
              className={`bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary transition-all ${
                isMobile ? 'pl-8 pr-2 text-sm h-9' : 'pl-10 h-10'
              } ${isAdding ? 'opacity-50' : ''}`}
            />
          </div>
          {/* Mobile add button - improved visibility */}
          {isMobile && newItemText.trim() && (
            <Button
              size="sm"
              onClick={handleAddItem}
              disabled={isAdding}
              className="h-10 px-4 shrink-0 bg-primary text-primary-foreground font-medium"
            >
              {isAdding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1" />
                  <span>Adaugă</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      
      {/* Search */}
      {filteredIdeas.length > 5 && (
        <div className={`${isMobile ? 'mb-3' : 'mb-4'}`}>
          {showSearch ? (
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground ${isMobile ? 'w-3 h-3' : 'h-4 w-4'}`} />
              <Input
                placeholder={t('searchItems')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onBlur={() => !searchTerm && setShowSearch(false)}
                autoFocus
                className={`bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary ${
                  isMobile ? 'pl-8 text-sm h-8' : 'pl-10'
                }`}
              />
              {searchTerm && (
                <button 
                  onClick={() => { setSearchTerm(''); setShowSearch(false); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ) : (
            <button 
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Search className="w-3 h-3" />
              <span>{t('searchItems')}</span>
            </button>
          )}
        </div>
      )}
      
      {/* Ideas List */}
      <div className={`space-y-1 ${isMobile ? 'max-h-[calc(70vh-120px)] overflow-y-auto' : ''}`}>
        {filteredIdeas.length > 0 ? (
          filteredIdeas.map(idea => {
            const isEditing = editingId === idea.id;
            
            return (
              <div 
                key={idea.id} 
                className={cn(
                  "group relative flex items-center gap-2 rounded-lg hover:bg-muted/50 transition-all",
                  isMobile ? 'p-2' : 'p-2'
                )}
              >
                {/* Drag handle - hidden on mobile */}
                {!isMobile && (
                  <div className="cursor-grab text-muted-foreground/50 group-hover:text-muted-foreground">
                    <GripVertical className="w-4 h-4" />
                  </div>
                )}
                
                {/* Eisenhower Quadrant Badge */}
                <EisenhowerSelector
                  priority={idea.priority}
                  onSelect={async (newPriority) => {
                    // If Q4 (eliminator), confirm deletion
                    if (newPriority === 1) {
                      if (confirm('Această idee nu este importantă și nici urgentă. Vrei să o ștergi?')) {
                        await handleDelete(idea.id);
                      }
                      return;
                    }
                    try {
                      await ideasBankService.updateIdea(idea.id, { priority: newPriority });
                      setIdeas(prev => prev.map(i => 
                        i.id === idea.id ? { ...i, priority: newPriority } : i
                      ));
                    } catch (error) {
                      console.error('Error updating priority:', error);
                    }
                  }}
                  trigger={
                    <QuadrantBadge 
                      priority={idea.priority} 
                      size="sm"
                      onClick={() => {}}
                    />
                  }
                />
                
                {/* Status badge (AI analysis) */}
                {getStatusBadge(idea)}
                
                {/* Text / Edit */}
                {isEditing ? (
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleUpdateText(idea.id, editValue);
                      } else if (e.key === 'Escape') {
                        setEditingId(null);
                      }
                    }}
                    onBlur={() => handleUpdateText(idea.id, editValue)}
                    autoFocus
                    className={`flex-grow bg-transparent border-none focus:ring-1 focus:ring-primary text-foreground ${
                      isMobile ? 'p-1 text-sm h-7' : 'p-1 h-7'
                    }`}
                  />
                ) : (
                  <span 
                    className={`flex-grow text-foreground cursor-text hover:text-primary transition-colors ${isMobile ? 'text-sm' : 'text-sm'}`}
                    onClick={() => {
                      setEditValue(idea.text);
                      setEditingId(idea.id);
                    }}
                  >
                    {idea.text}
                  </span>
                )}
                
                {/* Actions - visible on mobile, hover on desktop */}
                <div className={cn(
                  "flex items-center gap-1 transition-opacity",
                  isMobile ? "opacity-70" : "opacity-0 group-hover:opacity-100"
                )}>
                  {/* Analyze button */}
                  <button
                    className="p-1 text-muted-foreground hover:text-primary transition-colors"
                    title="Analizează ideea cu AI"
                    onClick={() => handleAnalyze(idea)}
                  >
                    <Brain className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                  </button>
                  
                  {/* Move to HIT */}
                  <button
                    className="p-1 text-muted-foreground hover:text-primary transition-colors"
                    title={t('setWeeklyFocus')}
                    onClick={() => handleMoveToHit(idea)}
                  >
                    <Target className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                  </button>
                  
                  {/* Delete */}
                  <button
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                    onClick={() => handleDelete(idea.id)}
                  >
                    <X className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <DoorEmptyState 
            onAddItem={() => inputRef.current?.focus()}
            onAddTemplate={async (text) => {
              const newIdea = await ideasBankService.addIdea(text, 'work', 0);
              setIdeas(prev => [newIdea, ...prev]);
              // Open quadrant modal for template ideas too
              setPendingIdea(newIdea);
              setShowQuadrantModal(true);
            }}
          />
        )}
      </div>

      {/* Quadrant Classification Modal */}
      <IdeaQuadrantModal
        isOpen={showQuadrantModal}
        onClose={() => {
          setShowQuadrantModal(false);
          setPendingIdea(null);
        }}
        ideaText={pendingIdea?.text || ''}
        onSelectQuadrant={handleQuadrantSelect}
        onSkip={handleSkipClassification}
        onAnalyze={handleAnalyzeFromModal}
        isMobile={isMobile}
      />

      {/* Analysis Modal */}
      <IdeaAnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        idea={selectedIdea}
        onMoveToHit={handleMoveToHit}
        onMoveToDo={handleMoveToDo}
        onArchive={handleArchive}
        onAnalysisComplete={handleAnalysisComplete}
      />
    </div>
  );
};
