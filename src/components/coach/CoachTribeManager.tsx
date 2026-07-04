import React, { useState } from 'react';
import { useCoachTribe, TribeMember } from '@/hooks/useCoachTribe';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResponsiveModal, ResponsiveModalHeader, ResponsiveModalTitle } from '@/components/ui/responsive-modal';
import { Label } from '@/components/ui/label';
import { 
  Users, Plus, Crown, UserMinus, Calendar, Shield
} from 'lucide-react';
import { format } from 'date-fns';

interface CoachTribeManagerProps {
  coachProfileId: string;
  userId: string;
  coachName: string;
}

export const CoachTribeManager: React.FC<CoachTribeManagerProps> = ({ 
  coachProfileId, 
  userId,
  coachName 
}) => {
  const {
    coachTribe,
    members,
    loading,
    createCoachTribe,
    removeMember,
  } = useCoachTribe(coachProfileId, userId);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [tribeName, setTribeName] = useState(`${coachName}'s Warriors`);
  const [tribeDesc, setTribeDesc] = useState('Private community for my coached clients');
  const [creating, setCreating] = useState(false);

  const handleCreateTribe = async () => {
    if (!tribeName.trim()) return;
    
    setCreating(true);
    const result = await createCoachTribe(tribeName.trim(), tribeDesc.trim());
    if (result) {
      setIsCreateOpen(false);
    }
    setCreating(false);
  };

  const handleRemoveMember = async (member: TribeMember) => {
    if (member.role === 'owner') return;
    
    if (confirm(`Remove ${member.display_name} from the tribe?`)) {
      await removeMember(member.user_id);
    }
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  // No tribe yet - show creation UI
  if (!coachTribe) {
    return (
      <Card className="glass-card">
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Create Your Tribe</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Set up a private community for your clients. When a referred user makes their first payment, 
            they'll be automatically added to your tribe.
          </p>
          
          <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Create Tribe
          </Button>
          <ResponsiveModal open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <ResponsiveModalHeader>
                <ResponsiveModalTitle>Create Your Coach Tribe</ResponsiveModalTitle>
              </ResponsiveModalHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Tribe Name</Label>
                  <Input
                    value={tribeName}
                    onChange={(e) => setTribeName(e.target.value)}
                    placeholder="e.g., Elite Warriors"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={tribeDesc}
                    onChange={(e) => setTribeDesc(e.target.value)}
                    placeholder="What's your tribe about..."
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm">
                  <Shield className="h-4 w-4 text-primary flex-shrink-0" />
                  <p className="text-muted-foreground">
                    This will be a private tribe. Only your referred clients will be added automatically.
                  </p>
                </div>
                <Button 
                  onClick={handleCreateTribe} 
                  disabled={!tribeName.trim() || creating}
                  className="w-full"
                >
                  {creating ? 'Creating...' : 'Create Tribe'}
                </Button>
              </div>
          </ResponsiveModal>

        </CardContent>
      </Card>
    );
  }

  // Show tribe with members
  return (
    <Card className="glass-card">
      <CardHeader className="pb-4 border-b">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{coachTribe.name}</CardTitle>
              <CardDescription>
                {coachTribe.description || 'Private coach community'}
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Shield className="h-3 w-3" />
            Private
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Members ({members.length})
          </h4>
        </div>

        {members.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>No members yet</p>
            <p className="text-sm mt-1">
              Clients will be added automatically after their first payment
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[350px]">
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.user_id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10">
                      {member.avatar_emoji || member.display_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{member.display_name}</span>
                      {member.role === 'owner' && (
                        <Crown className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Joined {format(new Date(member.joined_at), 'MMM d, yyyy')}
                    </div>
                  </div>

                  {member.role !== 'owner' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMember(member)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
