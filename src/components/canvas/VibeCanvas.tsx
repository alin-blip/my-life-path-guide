import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas as FabricCanvas, Rect, Circle, Triangle, Line, IText, Path, FabricObject, PencilBrush } from 'fabric';
import { VibeCanvasToolbar } from './VibeCanvasToolbar';
import { VibeCanvasHeader } from './VibeCanvasHeader';
import { VibeCanvasFooter } from './VibeCanvasFooter';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export type ToolType = 
  | 'select' 
  | 'pan'
  | 'pencil' 
  | 'highlighter' 
  | 'eraser' 
  | 'text' 
  | 'shapes' 
  | 'line'
  | 'arrow'
  | 'rectangle' 
  | 'circle' 
  | 'triangle'
  | 'star'
  | 'sticky';

export type ShapeType = 'rectangle' | 'circle' | 'triangle' | 'star' | 'line' | 'arrow';

interface VibeCanvasProps {
  projectId?: string;
  initialData?: string;
  onSave?: (data: string) => void;
  onOpenProjects?: () => void;
  onOpenTemplates?: () => void;
  onNewProject?: () => void;
}

export const VibeCanvas: React.FC<VibeCanvasProps> = ({ 
  projectId, 
  initialData,
  onSave,
  onOpenProjects,
  onOpenTemplates,
  onNewProject,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [activeColor, setActiveColor] = useState('#ffffff');
  const [strokeColor, setStrokeColor] = useState('#4A7DFF');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [zoom, setZoom] = useState(100);
  const [title, setTitle] = useState('Untitled');
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const { toast } = useToast();

  // Initialize fabric canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth - 40;
    const height = container.clientHeight - 40;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: Math.max(width, 800),
      height: Math.max(height, 600),
      backgroundColor: '#1a1a2e',
      selection: true,
    });

    // Load initial data if provided
    if (initialData) {
      try {
        canvas.loadFromJSON(JSON.parse(initialData), () => {
          canvas.renderAll();
        });
      } catch (e) {
        console.error('Failed to load canvas data:', e);
      }
    }

    setFabricCanvas(canvas);

    // Save initial state
    const initialState = JSON.stringify(canvas.toJSON());
    setHistory([initialState]);
    setHistoryIndex(0);

    // Resize handler
    const handleResize = () => {
      const newWidth = container.clientWidth - 40;
      const newHeight = container.clientHeight - 40;
      canvas.setDimensions({
        width: Math.max(newWidth, 800),
        height: Math.max(newHeight, 600),
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      canvas.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [initialData]);

  // Save state for undo/redo
  const saveState = useCallback(() => {
    if (!fabricCanvas) return;
    
    const state = JSON.stringify(fabricCanvas.toJSON());
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(state);
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCanUndo(newHistory.length > 1);
    setCanRedo(false);
  }, [fabricCanvas, history, historyIndex]);

  // Handle object modifications
  useEffect(() => {
    if (!fabricCanvas) return;

    const handleModified = () => {
      saveState();
    };

    fabricCanvas.on('object:added', handleModified);
    fabricCanvas.on('object:modified', handleModified);
    fabricCanvas.on('object:removed', handleModified);

    return () => {
      fabricCanvas.off('object:added', handleModified);
      fabricCanvas.off('object:modified', handleModified);
      fabricCanvas.off('object:removed', handleModified);
    };
  }, [fabricCanvas, saveState]);

  // Handle tool changes - including cursor and brush updates
  useEffect(() => {
    if (!fabricCanvas) return;

    // Reset drawing mode
    fabricCanvas.isDrawingMode = false;
    fabricCanvas.selection = true;
    
    // Reset cursor to default
    fabricCanvas.defaultCursor = 'default';
    fabricCanvas.hoverCursor = 'move';

    if (activeTool === 'pencil' || activeTool === 'highlighter') {
      fabricCanvas.isDrawingMode = true;
      // Create PencilBrush explicitly for fabric.js v6
      const brush = new PencilBrush(fabricCanvas);
      
      // For highlighter, make the selected color semi-transparent
      // For pencil, use the selected color directly
      if (activeTool === 'highlighter') {
        // Convert hex color to rgba with 40% opacity for highlighter effect
        const hexToRgba = (hex: string, alpha: number) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };
        brush.color = hexToRgba(activeColor, 0.4);
      } else {
        brush.color = activeColor;
      }
      
      brush.width = activeTool === 'highlighter' ? 20 : strokeWidth;
      fabricCanvas.freeDrawingBrush = brush;
      
      // Set custom cursor for drawing tools - use selected color in cursor
      const encodedColor = encodeURIComponent(activeColor);
      fabricCanvas.freeDrawingCursor = activeTool === 'pencil' 
        ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='${encodedColor}' stroke-width='2'%3E%3Cpath d='m18 2 4 4-14.5 14.5-5.5 1 1-5.5L18 2z'/%3E%3C/svg%3E") 2 22, crosshair`
        : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='${encodedColor}' fill-opacity='0.4' stroke='${encodedColor}' stroke-width='1'%3E%3Crect x='3' y='8' width='18' height='8' rx='2'/%3E%3C/svg%3E") 12 12, crosshair`;
    } else if (activeTool === 'eraser') {
      fabricCanvas.isDrawingMode = true;
      // Create eraser brush
      const brush = new PencilBrush(fabricCanvas);
      brush.color = '#1a1a2e'; // Match background color
      brush.width = 20;
      fabricCanvas.freeDrawingBrush = brush;
      
      // Set eraser cursor
      fabricCanvas.freeDrawingCursor = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'%23666\' stroke=\'white\' stroke-width=\'2\'%3E%3Crect x=\'6\' y=\'4\' width=\'12\' height=\'16\' rx=\'2\'/%3E%3C/svg%3E") 12 12, crosshair';
    } else if (activeTool === 'pan') {
      fabricCanvas.defaultCursor = 'grab';
      fabricCanvas.hoverCursor = 'grab';
      fabricCanvas.selection = false;
    } else if (activeTool === 'select') {
      fabricCanvas.defaultCursor = 'default';
    }
  }, [activeTool, activeColor, strokeColor, strokeWidth, fabricCanvas]);

  // Pan mode mouse event handlers
  useEffect(() => {
    if (!fabricCanvas) return;

    let panning = false;
    let lastPos = { x: 0, y: 0 };

    const handleMouseDown = (opt: any) => {
      const e = opt.e as MouseEvent;
      
      // Pan when in pan tool mode
      if (activeTool === 'pan') {
        panning = true;
        lastPos = { x: e.clientX, y: e.clientY };
        fabricCanvas.defaultCursor = 'grabbing';
        fabricCanvas.renderAll();
      }
    };

    const handleMouseMove = (opt: any) => {
      if (!panning) return;
      
      const e = opt.e as MouseEvent;
      const vpt = fabricCanvas.viewportTransform;
      if (!vpt) return;
      
      vpt[4] += e.clientX - lastPos.x;
      vpt[5] += e.clientY - lastPos.y;
      
      lastPos = { x: e.clientX, y: e.clientY };
      fabricCanvas.requestRenderAll();
    };

    const handleMouseUp = () => {
      if (activeTool === 'pan' && panning) {
        panning = false;
        fabricCanvas.defaultCursor = 'grab';
        fabricCanvas.renderAll();
      }
    };

    fabricCanvas.on('mouse:down', handleMouseDown);
    fabricCanvas.on('mouse:move', handleMouseMove);
    fabricCanvas.on('mouse:up', handleMouseUp);

    return () => {
      fabricCanvas.off('mouse:down', handleMouseDown);
      fabricCanvas.off('mouse:move', handleMouseMove);
      fabricCanvas.off('mouse:up', handleMouseUp);
    };
  }, [fabricCanvas, activeTool]);

  // Add shape to canvas
  const addShape = useCallback((shapeType: ShapeType) => {
    if (!fabricCanvas) return;

    let shape: FabricObject;
    const center = fabricCanvas.getCenter();

    switch (shapeType) {
      case 'rectangle':
        shape = new Rect({
          left: center.left - 50,
          top: center.top - 35,
          width: 100,
          height: 70,
          fill: activeColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          rx: 8,
          ry: 8,
        });
        break;
      case 'circle':
        shape = new Circle({
          left: center.left - 40,
          top: center.top - 40,
          radius: 40,
          fill: activeColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
        });
        break;
      case 'triangle':
        shape = new Triangle({
          left: center.left - 40,
          top: center.top - 35,
          width: 80,
          height: 70,
          fill: activeColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
        });
        break;
      case 'line':
        shape = new Line([center.left - 50, center.top, center.left + 50, center.top], {
          stroke: strokeColor,
          strokeWidth: strokeWidth,
        });
        break;
      case 'arrow':
        // Create arrow using path
        const arrowPath = `M ${center.left - 50} ${center.top} L ${center.left + 30} ${center.top} L ${center.left + 20} ${center.top - 10} M ${center.left + 30} ${center.top} L ${center.left + 20} ${center.top + 10}`;
        shape = new Path(arrowPath, {
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          fill: 'transparent',
        });
        break;
      case 'star':
        // Create 5-pointed star
        const starPoints = [];
        const outerRadius = 40;
        const innerRadius = 20;
        for (let i = 0; i < 10; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (Math.PI / 5) * i - Math.PI / 2;
          starPoints.push({
            x: center.left + radius * Math.cos(angle),
            y: center.top + radius * Math.sin(angle),
          });
        }
        const starPath = starPoints.map((p, i) => 
          `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
        ).join(' ') + ' Z';
        shape = new Path(starPath, {
          fill: activeColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
        });
        break;
      default:
        return;
    }

    fabricCanvas.add(shape);
    fabricCanvas.setActiveObject(shape);
    fabricCanvas.renderAll();
    setActiveTool('select');
  }, [fabricCanvas, activeColor, strokeColor, strokeWidth]);

  // Add text to canvas
  const addText = useCallback(() => {
    if (!fabricCanvas) return;

    const center = fabricCanvas.getCenter();
    const text = new IText('Tap to edit', {
      left: center.left - 60,
      top: center.top - 15,
      fill: activeColor, // Use selected color instead of hardcoded white
      fontFamily: 'Inter, sans-serif',
      fontSize: 24,
      fontWeight: '400',
    });

    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    text.enterEditing();
    fabricCanvas.renderAll();
    setActiveTool('select');
  }, [fabricCanvas]);

  // Add sticky note
  const addStickyNote = useCallback(() => {
    if (!fabricCanvas) return;

    const center = fabricCanvas.getCenter();
    const colors = ['#fff740', '#ff7eb9', '#7afcff', '#98fb98', '#ffa07a'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const rect = new Rect({
      left: center.left - 75,
      top: center.top - 75,
      width: 150,
      height: 150,
      fill: randomColor,
      rx: 4,
      ry: 4,
      shadow: {
        color: 'rgba(0,0,0,0.3)',
        blur: 10,
        offsetX: 3,
        offsetY: 3,
      } as any,
    });

    const text = new IText('Note...', {
      left: center.left - 65,
      top: center.top - 65,
      fill: '#1a1a1a',
      fontFamily: 'Inter, sans-serif',
      fontSize: 14,
      width: 130,
    });

    fabricCanvas.add(rect);
    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    text.enterEditing();
    fabricCanvas.renderAll();
    setActiveTool('select');
  }, [fabricCanvas]);

  // Handle tool selection
  const handleToolSelect = useCallback((tool: ToolType) => {
    setActiveTool(tool);
    
    if (tool === 'text') {
      addText();
    } else if (tool === 'sticky') {
      addStickyNote();
    } else if (['rectangle', 'circle', 'triangle', 'star', 'line', 'arrow'].includes(tool)) {
      addShape(tool as ShapeType);
    }
  }, [addText, addStickyNote, addShape]);

  // Undo/Redo
  const handleUndo = useCallback(() => {
    if (!fabricCanvas || historyIndex <= 0) return;
    
    const newIndex = historyIndex - 1;
    fabricCanvas.loadFromJSON(JSON.parse(history[newIndex]), () => {
      fabricCanvas.renderAll();
      setHistoryIndex(newIndex);
      setCanUndo(newIndex > 0);
      setCanRedo(true);
    });
  }, [fabricCanvas, history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (!fabricCanvas || historyIndex >= history.length - 1) return;
    
    const newIndex = historyIndex + 1;
    fabricCanvas.loadFromJSON(JSON.parse(history[newIndex]), () => {
      fabricCanvas.renderAll();
      setHistoryIndex(newIndex);
      setCanUndo(true);
      setCanRedo(newIndex < history.length - 1);
    });
  }, [fabricCanvas, history, historyIndex]);

  // Clear canvas
  const handleClear = useCallback(() => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = '#1a1a2e';
    fabricCanvas.renderAll();
    saveState();
    toast({
      title: 'Canvas cleared',
      description: 'All elements have been removed',
    });
  }, [fabricCanvas, saveState, toast]);

  // Delete selected
  const handleDeleteSelected = useCallback(() => {
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach(obj => fabricCanvas.remove(obj));
      fabricCanvas.discardActiveObject();
      fabricCanvas.renderAll();
    }
  }, [fabricCanvas]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeElement = document.activeElement;
        if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
          handleDeleteSelected();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDeleteSelected, handleUndo, handleRedo]);

  // Export functions
  const handleExport = useCallback((format: 'png' | 'jpg' | 'pdf') => {
    if (!fabricCanvas) return;

    const dataURL = fabricCanvas.toDataURL({
      format: format === 'jpg' ? 'jpeg' : (format === 'pdf' ? 'png' : format),
      quality: 1,
      multiplier: 2,
    });

    if (format === 'pdf') {
      import('jspdf').then(({ jsPDF }) => {
        const pdf = new jsPDF('landscape', 'px', [fabricCanvas.width!, fabricCanvas.height!]);
        pdf.addImage(dataURL, 'PNG', 0, 0, fabricCanvas.width!, fabricCanvas.height!);
        pdf.save(`${title}.pdf`);
      });
    } else {
      const link = document.createElement('a');
      link.download = `${title}.${format}`;
      link.href = dataURL;
      link.click();
    }

    toast({
      title: 'Exported!',
      description: `Canvas saved as ${format.toUpperCase()}`,
    });
  }, [fabricCanvas, title, toast]);

  // Save to backend
  const handleSave = useCallback(() => {
    if (!fabricCanvas || !onSave) return;
    const data = JSON.stringify(fabricCanvas.toJSON());
    onSave(data);
    toast({
      title: 'Saved!',
      description: 'Your canvas has been saved',
    });
  }, [fabricCanvas, onSave, toast]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    if (!fabricCanvas || zoom >= 200) return;
    const newZoom = Math.min(zoom + 10, 200);
    fabricCanvas.setZoom(newZoom / 100);
    setZoom(newZoom);
  }, [fabricCanvas, zoom]);

  const handleZoomOut = useCallback(() => {
    if (!fabricCanvas || zoom <= 25) return;
    const newZoom = Math.max(zoom - 10, 25);
    fabricCanvas.setZoom(newZoom / 100);
    setZoom(newZoom);
  }, [fabricCanvas, zoom]);

  const handleZoomReset = useCallback(() => {
    if (!fabricCanvas) return;
    fabricCanvas.setZoom(1);
    setZoom(100);
  }, [fabricCanvas]);

  // Mouse wheel zoom
  useEffect(() => {
    if (!fabricCanvas) return;

    const handleWheel = (opt: any) => {
      const e = opt.e as WheelEvent;
      e.preventDefault();
      e.stopPropagation();

      const delta = e.deltaY;
      let newZoom = zoom;

      // Reduced sensitivity - 75% of previous value
      const zoomStep = 2.81; // 75% of 3.75
      
      if (delta < 0) {
        // Zoom in
        newZoom = Math.min(zoom + zoomStep, 200);
      } else {
        // Zoom out
        newZoom = Math.max(zoom - zoomStep, 25);
      }

      if (newZoom !== zoom) {
        // Get mouse position for zoom center
        const pointer = fabricCanvas.getScenePoint(e);
        fabricCanvas.zoomToPoint(pointer, newZoom / 100);
        setZoom(newZoom);
      }
    };

    fabricCanvas.on('mouse:wheel', handleWheel);

    return () => {
      fabricCanvas.off('mouse:wheel', handleWheel);
    };
  }, [fabricCanvas, zoom]);

  return (
    <div className="flex flex-col h-screen bg-[#0d0d1a] overflow-hidden">
      {/* Header */}
      <VibeCanvasHeader
        title={title}
        onTitleChange={setTitle}
        onExport={handleExport}
        onSave={handleSave}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        onOpenProjects={onOpenProjects}
        onOpenTemplates={onOpenTemplates}
        onNewProject={onNewProject}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Toolbar */}
        <VibeCanvasToolbar
          activeTool={activeTool}
          onToolSelect={handleToolSelect}
          activeColor={activeColor}
          onColorChange={setActiveColor}
          strokeColor={strokeColor}
          onStrokeColorChange={setStrokeColor}
          strokeWidth={strokeWidth}
          onStrokeWidthChange={setStrokeWidth}
          onClear={handleClear}
        />

        {/* Canvas Area */}
        <div 
          ref={containerRef}
          className="flex-1 flex items-center justify-center p-5 overflow-auto"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg shadow-2xl overflow-hidden"
            style={{ 
              boxShadow: '0 0 60px rgba(74, 125, 255, 0.1)',
            }}
          >
            <canvas ref={canvasRef} />
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <VibeCanvasFooter
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
      />
    </div>
  );
};
