import React, { useState } from 'react';
import { ProgramGrid } from './ProgramGrid';
import { ProgramCardProps } from './ProgramCard';
import { Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLanguage } from '@/context/LanguageContext';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { toast } from 'sonner';

interface ClassroomTabProps {
  programs: ProgramCardProps[];
}

export const ClassroomTab: React.FC<ClassroomTabProps> = ({ programs }) => {
  const { language } = useLanguage();
  const { isAdmin } = useAdminAuth();
  const isRo = language === 'ro';

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    thumbnail: '',
    category: '',
    url: '',
  });

  // Load admin courses from localStorage
  const [adminCourses, setAdminCourses] = useState<ProgramCardProps[]>(() => {
    try {
      const saved = localStorage.getItem('adminCourses');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleAddCourse = () => {
    if (!newCourse.title.trim()) return;

    const course: ProgramCardProps = {
      id: `admin-${Date.now()}`,
      title: newCourse.title,
      description: newCourse.description || 'New course',
      thumbnail: newCourse.thumbnail || '/lovable-uploads/236c59b1-2cb5-46b5-95db-d302a15e2dfb.png',
      path: newCourse.url || '#',
    };

    const updated = [...adminCourses, course];
    setAdminCourses(updated);
    localStorage.setItem('adminCourses', JSON.stringify(updated));
    setNewCourse({ title: '', description: '', thumbnail: '', category: '', url: '' });
    setShowAddDialog(false);
    toast.success(isRo ? 'Curs adăugat!' : 'Course added!');
  };

  const allPrograms = [...programs, ...adminCourses];

  return (
    <div className="space-y-8">
      {/* Admin Add Course Button */}
      {isAdmin && (
        <Button
          onClick={() => setShowAddDialog(true)}
          variant="outline"
          className="gap-2 border-dashed border-primary/40 text-primary hover:bg-primary/5"
        >
          <Plus className="h-4 w-4" />
          {isRo ? 'Adaugă curs nou' : 'Add new course'}
        </Button>
      )}

      <ProgramGrid programs={allPrograms} />

      {/* Coming Soon */}
      <div className="p-6 rounded-2xl border border-dashed border-border/60 bg-muted/30 text-center">
        <Sparkles className="h-8 w-8 text-muted-foreground/60 mx-auto mb-3" />
        <h3 className="font-semibold text-foreground mb-1">
          {isRo ? 'Mai multe programe în curând' : 'More programs coming soon'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {isRo
            ? 'Suntem în lucru la noi cursuri și programe pentru tine.'
            : "We're working on new courses and programs for you."}
        </p>
      </div>

      {/* Add Course Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isRo ? 'Adaugă curs nou' : 'Add new course'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                {isRo ? 'Titlu' : 'Title'}
              </label>
              <Input
                value={newCourse.title}
                onChange={(e) => setNewCourse(prev => ({ ...prev, title: e.target.value }))}
                placeholder={isRo ? 'Numele cursului' : 'Course name'}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                {isRo ? 'Descriere' : 'Description'}
              </label>
              <Textarea
                value={newCourse.description}
                onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                placeholder={isRo ? 'Descriere scurtă...' : 'Short description...'}
                className="min-h-[80px]"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                {isRo ? 'Categorie' : 'Category'}
              </label>
              <Input
                value={newCourse.category}
                onChange={(e) => setNewCourse(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g. Mindset, Business"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">URL</label>
              <Input
                value={newCourse.url}
                onChange={(e) => setNewCourse(prev => ({ ...prev, url: e.target.value }))}
                placeholder="/warriors-way"
              />
            </div>
            <Button onClick={handleAddCourse} disabled={!newCourse.title.trim()} className="w-full">
              {isRo ? 'Adaugă' : 'Add'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
