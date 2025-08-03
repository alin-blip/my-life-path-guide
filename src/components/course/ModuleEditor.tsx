
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CourseModule, CourseSubmodule } from '@/types/course';
import { Plus, Trash2, GripVertical, Video, FileText, File } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface ModuleEditorProps {
  modules: CourseModule[];
  onModulesChange: (modules: CourseModule[]) => void;
}

export const ModuleEditor: React.FC<ModuleEditorProps> = ({ modules, onModulesChange }) => {
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  const addModule = () => {
    const newModule: CourseModule = {
      id: `module-${Date.now()}`,
      title: '',
      description: '',
      order: modules.length + 1,
      duration: '',
      submodules: []
    };
    onModulesChange([...modules, newModule]);
  };

  const updateModule = (moduleId: string, updates: Partial<CourseModule>) => {
    const updatedModules = modules.map(module => 
      module.id === moduleId ? { ...module, ...updates } : module
    );
    onModulesChange(updatedModules);
  };

  const deleteModule = (moduleId: string) => {
    const updatedModules = modules.filter(module => module.id !== moduleId);
    onModulesChange(updatedModules);
  };

  const addSubmodule = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;

    const newSubmodule: CourseSubmodule = {
      id: `submodule-${Date.now()}`,
      title: '',
      description: '',
      order: (module.submodules?.length || 0) + 1,
      duration: ''
    };

    updateModule(moduleId, {
      submodules: [...(module.submodules || []), newSubmodule]
    });
  };

  const updateSubmodule = (moduleId: string, submoduleId: string, updates: Partial<CourseSubmodule>) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;

    const updatedSubmodules = (module.submodules || []).map(sub =>
      sub.id === submoduleId ? { ...sub, ...updates } : sub
    );

    updateModule(moduleId, { submodules: updatedSubmodules });
  };

  const deleteSubmodule = (moduleId: string, submoduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;

    const updatedSubmodules = (module.submodules || []).filter(sub => sub.id !== submoduleId);
    updateModule(moduleId, { submodules: updatedSubmodules });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Module și conținut</h3>
        <Button onClick={addModule} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Adaugă modul
        </Button>
      </div>

      {modules.map((module, index) => (
        <Card key={module.id} className="border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-gray-400" />
                <CardTitle className="text-base">
                  Modul {index + 1}: {module.title || 'Modul nou'}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedModule(
                    expandedModule === module.id ? null : module.id
                  )}
                >
                  {expandedModule === module.id ? 'Restrânge' : 'Extinde'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteModule(module.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {expandedModule === module.id && (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Titlu modul</label>
                  <Input
                    value={module.title}
                    onChange={(e) => updateModule(module.id, { title: e.target.value })}
                    placeholder="ex: Introducere în concepte"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Durata</label>
                  <Input
                    value={module.duration}
                    onChange={(e) => updateModule(module.id, { duration: e.target.value })}
                    placeholder="ex: 30 min"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descriere</label>
                <Textarea
                  value={module.description}
                  onChange={(e) => updateModule(module.id, { description: e.target.value })}
                  placeholder="Descrierea modulului..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <Video className="inline h-4 w-4 mr-1" />
                    Link video
                  </label>
                  <Input
                    value={module.videoUrl || ''}
                    onChange={(e) => updateModule(module.id, { videoUrl: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <File className="inline h-4 w-4 mr-1" />
                    Link PDF
                  </label>
                  <Input
                    value={module.pdfUrl || ''}
                    onChange={(e) => updateModule(module.id, { pdfUrl: e.target.value })}
                    placeholder="https://example.com/document.pdf"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <FileText className="inline h-4 w-4 mr-1" />
                  Conținut text
                </label>
                <Textarea
                  value={module.textContent || ''}
                  onChange={(e) => updateModule(module.id, { textContent: e.target.value })}
                  placeholder="Conținutul textual al modulului..."
                  rows={5}
                />
              </div>

              {/* Submodule section */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Submodule</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addSubmodule(module.id)}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Submodul
                  </Button>
                </div>

                {module.submodules?.map((submodule, subIndex) => (
                  <Card key={submodule.id} className="mb-2 bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium text-sm">
                          Submodul {subIndex + 1}: {submodule.title || 'Submodul nou'}
                        </h5>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSubmodule(module.id, submodule.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                        <Input
                          value={submodule.title}
                          onChange={(e) => updateSubmodule(module.id, submodule.id, { title: e.target.value })}
                          placeholder="Titlu submodul"
                          className="text-sm"
                        />
                        <Input
                          value={submodule.duration}
                          onChange={(e) => updateSubmodule(module.id, submodule.id, { duration: e.target.value })}
                          placeholder="Durata"
                          className="text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <Input
                          value={submodule.videoUrl || ''}
                          onChange={(e) => updateSubmodule(module.id, submodule.id, { videoUrl: e.target.value })}
                          placeholder="Link video"
                          className="text-sm"
                        />
                        <Input
                          value={submodule.pdfUrl || ''}
                          onChange={(e) => updateSubmodule(module.id, submodule.id, { pdfUrl: e.target.value })}
                          placeholder="Link PDF"
                          className="text-sm"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      ))}

      {modules.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Nu există module încă. Adaugă primul modul pentru a începe.</p>
        </div>
      )}
    </div>
  );
};
