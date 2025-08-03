
import React, { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Text, TEvent } from 'fabric';
import { CanvasControls } from './CanvasControls';
import { useToast } from '@/hooks/use-toast';

export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<'select' | 'text' | 'draw'>('select');
  const [activeColor, setActiveColor] = useState('#000000');
  const { toast } = useToast();

  // Initialize fabric canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: window.innerWidth * 0.75,
      height: window.innerHeight * 0.7,
      backgroundColor: '#ffffff',
    });

    // Setup canvas events
    canvas.on('object:added', () => {
      toast({
        title: 'Element added',
        description: 'New element added to canvas',
      });
    });

    setFabricCanvas(canvas);

    // Resize handler
    const handleResize = () => {
      canvas.setDimensions({
        width: window.innerWidth * 0.75,
        height: window.innerHeight * 0.7,
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      canvas.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [toast]);

  // Handle tool changes
  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === 'draw';
    
    if (activeTool === 'draw' && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = activeColor;
      fabricCanvas.freeDrawingBrush.width = 2;
    }
  }, [activeTool, activeColor, fabricCanvas]);

  // Handle adding text
  const handleAddText = () => {
    if (!fabricCanvas) return;
    
    const text = new Text('Click to edit text', {
      left: 100,
      top: 100,
      fill: activeColor,
      fontFamily: 'Arial',
      fontSize: 24,
      editable: true,
    });
    
    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    fabricCanvas.renderAll();
  };

  // Handle clear canvas
  const handleClear = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = '#ffffff';
    fabricCanvas.renderAll();
    toast({
      title: 'Canvas cleared',
      description: 'All elements have been removed',
    });
  };

  // Handle tool selection
  const handleToolChange = (tool: 'select' | 'text' | 'draw') => {
    setActiveTool(tool);
    
    if (tool === 'text') {
      handleAddText();
      setActiveTool('select'); // Switch back to select after adding text
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <CanvasControls
        activeTool={activeTool}
        onToolChange={handleToolChange}
        onColorChange={setActiveColor}
        activeColor={activeColor}
        onClear={handleClear}
      />
      
      <div className="border border-gray-200 rounded-lg shadow-lg overflow-hidden bg-white">
        <canvas ref={canvasRef} className="max-w-full" />
      </div>
      
      <div className="text-sm text-gray-500 mt-2">
        <p>Drag elements to move them. Double-click text to edit.</p>
      </div>
    </div>
  );
};
