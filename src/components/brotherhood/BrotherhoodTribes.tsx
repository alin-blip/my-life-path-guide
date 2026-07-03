import React, { useState } from 'react';
import { useBrotherhood, Tribe } from '@/hooks/useBrotherhood';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ResponsiveModal, ResponsiveModalHeader, ResponsiveModalTitle } from '@/components/ui/responsive-modal';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Users, Plus, Crown, Lock, Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const BrotherhoodTribes: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { tribes, myTribes, loading, createTribe, joinTribe, leaveTribe } = useBrotherhood();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTribeName, setNewTribeName] = useState('');
  const [newTribeDesc, setNewTribeDesc] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const myTribeIds = myTribes.map(t => t.id);

  const handleCreate = async () => {
    if (!newTribeName.trim()) return;
    
    setIsCreating(true);
    await createTribe(newTribeName.trim(), newTribeDesc.trim(), isPublic);
    setNewTribeName('');
    setNewTribeDesc('');
    setIsPublic(true);
    setIsCreateOpen(false);
    setIsCreating(false);
  };

  const handleJoinLeave = async (tribe: Tribe) => {
    if (myTribeIds.includes(tribe.id)) {
      await leaveTribe(tribe.id);
    } else {
      await joinTribe(tribe.id);
    }
  };

  const renderTribeCard = (tribe: Tribe) => {
    const isMember = myTribeIds.includes(tribe.id);
    const isOwner = tribe.created_by === user?.id;

    return (
      <Card key={tribe.id} className="glass-card hover:border-primary/30 transition-all">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  {tribe.name}
                  {isOwner && <Crown className="h-4 w-4 text-yellow-500" />}
                </CardTitle>
                <CardDescription className="text-xs flex items-center gap-1">
                  {tribe.is_public ? (
                    <>
                      <Globe className="h-3 w-3" />
                      {language === 'ro' ? 'Public' : 'Public'}
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3" />
                      {language === 'ro' ? 'Privat' : 'Private'}
                    </>
                  )}
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {tribe.member_count} {language === 'ro' ? 'membri' : 'members'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {tribe.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {tribe.description}
            </p>
          )}
          <Button 
            variant={isMember ? 'outline' : 'default'}
            size="sm"
            className="w-full"
            onClick={() => handleJoinLeave(tribe)}
            disabled={isOwner}
          >
            {isOwner 
              ? (language === 'ro' ? 'Proprietar' : 'Owner')
              : isMember 
                ? (language === 'ro' ? 'Părăsește' : 'Leave')
                : (language === 'ro' ? 'Alătură-te' : 'Join')}
          </Button>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">
            {language === 'ro' ? 'Tribes' : 'Tribes'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {language === 'ro' 
              ? 'Comunități de războinici cu aceleași obiective' 
              : 'Communities of warriors with shared goals'}
          </p>
        </div>
        
        <ResponsiveModal open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          
            <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              {language === 'ro' ? 'Creează Tribe' : 'Create Tribe'}
            </Button>
          
          
            <ResponsiveModalHeader>
              <ResponsiveModalTitle>
                {language === 'ro' ? 'Creează un Tribe Nou' : 'Create a New Tribe'}
              </ResponsiveModalTitle>
            </ResponsiveModalHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>{language === 'ro' ? 'Nume' : 'Name'}</Label>
                <Input
                  placeholder={language === 'ro' ? 'ex: Warriors Romania' : 'e.g., Morning Warriors'}
                  value={newTribeName}
                  onChange={(e) => setNewTribeName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ro' ? 'Descriere' : 'Description'}</Label>
                <Textarea
                  placeholder={language === 'ro' ? 'Despre ce este acest tribe...' : 'What is this tribe about...'}
                  value={newTribeDesc}
                  onChange={(e) => setNewTribeDesc(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{language === 'ro' ? 'Tribe Public' : 'Public Tribe'}</Label>
                  <p className="text-xs text-muted-foreground">
                    {language === 'ro' 
                      ? 'Oricine poate vedea și se poate alătura' 
                      : 'Anyone can see and join'}
                  </p>
                </div>
                <Switch
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>
              <Button 
                onClick={handleCreate} 
                disabled={!newTribeName.trim() || isCreating}
                className="w-full"
              >
                {isCreating 
                  ? (language === 'ro' ? 'Se creează...' : 'Creating...') 
                  : (language === 'ro' ? 'Creează Tribe' : 'Create Tribe')}
              </Button>
            </div>
          
        </ResponsiveModal>
      </div>

      {/* My Tribes Section */}
      {myTribes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {language === 'ro' ? 'Tribe-urile Mele' : 'My Tribes'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myTribes.map(renderTribeCard)}
          </div>
        </div>
      )}

      {/* Discover Tribes Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {language === 'ro' ? 'Descoperă Tribes' : 'Discover Tribes'}
        </h3>
        {tribes.filter(t => !myTribeIds.includes(t.id)).length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                {language === 'ro' 
                  ? 'Nu există alte tribes disponibile. Creează primul!' 
                  : 'No other tribes available. Create the first one!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tribes.filter(t => !myTribeIds.includes(t.id)).map(renderTribeCard)}
          </div>
        )}
      </div>
    </div>
  );
};
