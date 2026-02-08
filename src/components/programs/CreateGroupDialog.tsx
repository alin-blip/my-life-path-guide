import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Tribe } from '@/hooks/useBrotherhood';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Lock, Crown } from 'lucide-react';

interface CreateGroupDialogProps {
  myTribes: Tribe[];
  onCreateTribe: (name: string, description: string, isPublic: boolean) => Promise<any>;
}

export const CreateGroupDialog: React.FC<CreateGroupDialogProps> = ({
  myTribes,
  onCreateTribe,
}) => {
  const { user, subscriptionTier } = useAuth();
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [creating, setCreating] = useState(false);

  const ownedGroups = myTribes.filter((t) => t.created_by === user?.id);
  const tier = subscriptionTier?.toLowerCase() || '';

  const canCreate = (): boolean => {
    if (tier === 'elite') return true;
    if (tier === 'pro') return ownedGroups.length < 2;
    return false;
  };

  const getRestrictionMessage = (): string | null => {
    if (tier === 'elite') return null;
    if (tier === 'pro' && ownedGroups.length >= 2) {
      return language === 'ro'
        ? 'Ai atins limita de 2 grupuri pentru planul PRO. Fă upgrade la ELITE pentru grupuri nelimitate.'
        : 'You reached the limit of 2 groups on PRO plan. Upgrade to ELITE for unlimited groups.';
    }
    return language === 'ro'
      ? 'Crearea de grupuri este disponibilă doar pentru membrii PRO și ELITE.'
      : 'Group creation is available only for PRO and ELITE members.';
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    await onCreateTribe(name.trim(), description.trim(), isPublic);
    setName('');
    setDescription('');
    setIsPublic(true);
    setOpen(false);
    setCreating(false);
  };

  const allowed = canCreate();
  const restrictionMsg = getRestrictionMessage();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" disabled={!allowed}>
          {!allowed && <Lock className="h-4 w-4" />}
          {allowed && <Plus className="h-4 w-4" />}
          {language === 'ro' ? 'Creează Grup' : 'Create Group'}
          {tier === 'pro' && (
            <span className="ml-1 text-[10px] font-bold bg-primary-foreground/20 px-1.5 py-0.5 rounded">
              PRO
            </span>
          )}
          {tier === 'elite' && (
            <span className="ml-1 text-[10px] font-bold bg-primary-foreground/20 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <Crown className="h-3 w-3" /> ELITE
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {language === 'ro' ? 'Creează un Grup Nou' : 'Create a New Group'}
          </DialogTitle>
          <DialogDescription>
            {language === 'ro'
              ? 'Construiește o comunitate cu războinici care împărtășesc aceleași obiective.'
              : 'Build a community with warriors who share the same goals.'}
          </DialogDescription>
        </DialogHeader>

        {restrictionMsg ? (
          <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4 text-center">
            {restrictionMsg}
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>{language === 'ro' ? 'Nume' : 'Name'}</Label>
              <Input
                placeholder={language === 'ro' ? 'ex: Warriors Romania' : 'e.g., Morning Warriors'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ro' ? 'Descriere' : 'Description'}</Label>
              <Textarea
                placeholder={
                  language === 'ro' ? 'Despre ce este acest grup...' : 'What is this group about...'
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none min-h-[80px]"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{language === 'ro' ? 'Grup Public' : 'Public Group'}</Label>
                <p className="text-xs text-muted-foreground">
                  {language === 'ro'
                    ? 'Oricine poate vedea și se poate alătura'
                    : 'Anyone can see and join'}
                </p>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>
            <Button
              onClick={handleCreate}
              disabled={!name.trim() || creating}
              className="w-full"
            >
              {creating
                ? language === 'ro' ? 'Se creează...' : 'Creating...'
                : language === 'ro' ? 'Creează Grupul' : 'Create Group'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
