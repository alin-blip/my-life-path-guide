import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { X, GripVertical, Search, Plus, Target, Brain, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { DoorEmptyState } from './DoorEmptyState';
import { cn } from '@/lib/utils';
import { IdeaBankItem, IdeaAnalysisResult, ideasBankService } from '@/services/ideasBankService';
import { IdeaAnalysisModal } from './IdeaAnalysisModal';
import { useToast } from '@/hooks/use-toast';

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
        const newIdea = await ideasBankService.addIdea(newItemText.trim());
        setIdeas(prev => [newIdea, ...prev]);
        setNewItemText('');
        toast({
          title: "✅ Idee adăugată",
          description: `"${newIdea.text}" a fost salvată permanent`,
        });
        setTimeout(() => inputRef.current?.focus(), 0);
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
        <div className="relative">
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
            placeholder={isAdding ? "Se salvează..." : (t('addItem') + '...')}
            disabled={isAdding}
            className={`bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary transition-all ${
              isMobile ? 'pl-8 text-sm h-9' : 'pl-10 h-10'
            } ${isAdding ? 'opacity-50' : ''}`}
          />
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
                {/* Drag handle */}
                <div className="cursor-grab text-muted-foreground/50 group-hover:text-muted-foreground">
                  <GripVertical className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                </div>
                
                {/* Status badge */}
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
                
                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
              const newIdea = await ideasBankService.addIdea(text);
              setIdeas(prev => [newIdea, ...prev]);
            }}
          />
        )}
      </div>

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
