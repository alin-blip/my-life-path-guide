import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useCoachTribeLessons, TribeCourse, TribeCourseModule } from '@/hooks/useCoachTribeLessons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  BookOpen,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronLeft,
  FileText,
  Video,
  File,
  Loader2,
  GripVertical,
} from 'lucide-react';

interface Props {
  tribeId: string;
  coachId: string;
}

const t = {
  ro: {
    title: 'Lecții & Cursuri',
    noCourses: 'Niciun curs încă. Creează primul tău curs!',
    newCourse: 'Curs Nou',
    courseTitle: 'Titlu curs',
    courseDesc: 'Descriere (opțional)',
    create: 'Creează',
    cancel: 'Anulează',
    modules: 'lecții',
    published: 'Publicat',
    draft: 'Draft',
    publish: 'Publică',
    unpublish: 'Ascunde',
    delete: 'Șterge',
    addModule: 'Adaugă Lecție',
    moduleTitle: 'Titlu lecție',
    moduleDesc: 'Descriere lecție',
    contentType: 'Tip conținut',
    text: 'Text',
    video: 'Video',
    pdf: 'PDF',
    content: 'Conținut',
    videoUrl: 'URL Video (YouTube/Vimeo)',
    pdfUrl: 'URL PDF',
    save: 'Salvează',
    back: 'Înapoi',
    noModules: 'Nicio lecție în acest curs.',
    free: 'Gratuit',
  },
  en: {
    title: 'Lessons & Courses',
    noCourses: 'No courses yet. Create your first course!',
    newCourse: 'New Course',
    courseTitle: 'Course title',
    courseDesc: 'Description (optional)',
    create: 'Create',
    cancel: 'Cancel',
    modules: 'lessons',
    published: 'Published',
    draft: 'Draft',
    publish: 'Publish',
    unpublish: 'Unpublish',
    delete: 'Delete',
    addModule: 'Add Lesson',
    moduleTitle: 'Lesson title',
    moduleDesc: 'Lesson description',
    contentType: 'Content type',
    text: 'Text',
    video: 'Video',
    pdf: 'PDF',
    content: 'Content',
    videoUrl: 'Video URL (YouTube/Vimeo)',
    pdfUrl: 'PDF URL',
    save: 'Save',
    back: 'Back',
    noModules: 'No lessons in this course.',
    free: 'Free',
  },
};

export const CoachTribeLessons: React.FC<Props> = ({ tribeId, coachId }) => {
  const { language } = useLanguage();
  const txt = t[language] || t.ro;

  const {
    courses, modules, loading,
    fetchCourses, createCourse, updateCourse, deleteCourse,
    fetchModules, createModule, deleteModule,
  } = useCoachTribeLessons(tribeId, coachId);

  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [showNewCourse, setShowNewCourse] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [showNewModule, setShowNewModule] = useState(false);
  const [moduleForm, setModuleForm] = useState({
    title: '', description: '', content_type: 'text',
    content_text: '', video_url: '', pdf_url: '',
  });

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  useEffect(() => {
    if (selectedCourse) fetchModules(selectedCourse);
  }, [selectedCourse, fetchModules]);

  const handleCreateCourse = async () => {
    if (!newTitle.trim()) return;
    await createCourse(newTitle.trim(), newDesc.trim());
    setNewTitle(''); setNewDesc(''); setShowNewCourse(false);
  };

  const handleCreateModule = async () => {
    if (!selectedCourse || !moduleForm.title.trim()) return;
    await createModule(selectedCourse, {
      title: moduleForm.title.trim(),
      description: moduleForm.description.trim() || undefined,
      content_type: moduleForm.content_type,
      content_text: moduleForm.content_text || undefined,
      video_url: moduleForm.video_url || undefined,
      pdf_url: moduleForm.pdf_url || undefined,
    });
    setModuleForm({ title: '', description: '', content_type: 'text', content_text: '', video_url: '', pdf_url: '' });
    setShowNewModule(false);
  };

  const getIcon = (type: string) => {
    if (type === 'video') return <Video className="h-4 w-4" />;
    if (type === 'pdf') return <File className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  if (loading && !courses.length) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // Course detail view
  if (selectedCourse) {
    const course = courses.find(c => c.id === selectedCourse);
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setSelectedCourse(null)}>
            <ChevronLeft className="h-4 w-4 mr-1" /> {txt.back}
          </Button>
          <h3 className="font-semibold text-lg">{course?.title}</h3>
          <Badge variant={course?.is_published ? 'default' : 'secondary'}>
            {course?.is_published ? txt.published : txt.draft}
          </Badge>
        </div>

        {modules.length === 0 && !showNewModule && (
          <p className="text-center text-muted-foreground py-6">{txt.noModules}</p>
        )}

        {modules.map((mod, idx) => (
          <Card key={mod.id}>
            <CardContent className="pt-4 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                  <span className="text-xs font-mono">{idx + 1}</span>
                  {getIcon(mod.content_type)}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{mod.title}</p>
                  {mod.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{mod.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px]">{mod.content_type}</Badge>
                    {mod.is_free && <Badge variant="secondary" className="text-[10px]">{txt.free}</Badge>}
                  </div>
                </div>
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive shrink-0"
                onClick={() => deleteModule(mod.id, selectedCourse)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>
        ))}

        {showNewModule ? (
          <Card>
            <CardContent className="pt-4 space-y-3">
              <Input placeholder={txt.moduleTitle} value={moduleForm.title}
                onChange={e => setModuleForm(p => ({ ...p, title: e.target.value }))} />
              <Input placeholder={txt.moduleDesc} value={moduleForm.description}
                onChange={e => setModuleForm(p => ({ ...p, description: e.target.value }))} />
              <Select value={moduleForm.content_type}
                onValueChange={v => setModuleForm(p => ({ ...p, content_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">{txt.text}</SelectItem>
                  <SelectItem value="video">{txt.video}</SelectItem>
                  <SelectItem value="pdf">{txt.pdf}</SelectItem>
                </SelectContent>
              </Select>
              {moduleForm.content_type === 'text' && (
                <Textarea placeholder={txt.content} value={moduleForm.content_text}
                  onChange={e => setModuleForm(p => ({ ...p, content_text: e.target.value }))}
                  className="min-h-[120px]" />
              )}
              {moduleForm.content_type === 'video' && (
                <Input placeholder={txt.videoUrl} value={moduleForm.video_url}
                  onChange={e => setModuleForm(p => ({ ...p, video_url: e.target.value }))} />
              )}
              {moduleForm.content_type === 'pdf' && (
                <Input placeholder={txt.pdfUrl} value={moduleForm.pdf_url}
                  onChange={e => setModuleForm(p => ({ ...p, pdf_url: e.target.value }))} />
              )}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowNewModule(false)}>{txt.cancel}</Button>
                <Button size="sm" onClick={handleCreateModule} disabled={!moduleForm.title.trim()}>{txt.save}</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button variant="outline" className="w-full" onClick={() => setShowNewModule(true)}>
            <Plus className="h-4 w-4 mr-2" /> {txt.addModule}
          </Button>
        )}
      </div>
    );
  }

  // Course list view
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" /> {txt.title}
        </h3>
        <Button size="sm" onClick={() => setShowNewCourse(true)}>
          <Plus className="h-4 w-4 mr-1" /> {txt.newCourse}
        </Button>
      </div>

      {showNewCourse && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <Input placeholder={txt.courseTitle} value={newTitle} onChange={e => setNewTitle(e.target.value)} />
            <Textarea placeholder={txt.courseDesc} value={newDesc} onChange={e => setNewDesc(e.target.value)}
              className="min-h-[60px] resize-none" />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowNewCourse(false)}>{txt.cancel}</Button>
              <Button size="sm" onClick={handleCreateCourse} disabled={!newTitle.trim()}>{txt.create}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {courses.length === 0 && !showNewCourse && (
        <p className="text-center text-muted-foreground py-8">{txt.noCourses}</p>
      )}

      {courses.map(course => (
        <Card key={course.id} className="cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => setSelectedCourse(course.id)}>
          <CardContent className="pt-4 flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">{course.title}</p>
                <Badge variant={course.is_published ? 'default' : 'secondary'} className="text-[10px] shrink-0">
                  {course.is_published ? txt.published : txt.draft}
                </Badge>
              </div>
              {course.description && (
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{course.description}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {course.modules_count || 0} {txt.modules}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button size="icon" variant="ghost" className="h-7 w-7"
                onClick={(e) => { e.stopPropagation(); updateCourse(course.id, { is_published: !course.is_published }); }}>
                {course.is_published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive"
                onClick={(e) => { e.stopPropagation(); deleteCourse(course.id); }}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
