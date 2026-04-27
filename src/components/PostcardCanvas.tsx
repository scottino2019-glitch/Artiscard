import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as fabric from 'fabric';

interface PostcardCanvasProps {
  width: number;
  height: number;
}

export interface PostcardCanvasHandle {
  addText: (text: string, options?: any) => void;
  addImage: (url: string) => void;
  addSticker: (content: string) => void;
  addShape: (type: string) => void;
  addFrame: (style: string) => void;
  setBackground: (color: string) => void;
  setBackgroundImage: (url: string) => void;
  exportImage: (format: 'png' | 'jpeg') => string;
  applyFilter: (filterType: string) => void;
  updateSelectedText: (options: any) => void;
  deleteSelected: () => void;
}

const PostcardCanvas = forwardRef<PostcardCanvasHandle, PostcardCanvasProps>(({ width, height }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvas = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
    });

    fabricCanvas.current = canvas;

    return () => {
      canvas.dispose();
    };
  }, []); // Run once on mount

  useEffect(() => {
    if (fabricCanvas.current) {
      fabricCanvas.current.setDimensions({ width, height });
      fabricCanvas.current.renderAll();
    }
  }, [width, height]);

  const [currentFrameStyle, setCurrentFrameStyle] = useState<string | null>(null);

  useEffect(() => {
    if (!fabricCanvas.current) return;
    
    // Cleanup existing frames
    const canvas = fabricCanvas.current;
    if (!canvas) return;

    const existingFrames = canvas.getObjects().filter(obj => (obj as any).isFrame);
    if (existingFrames.length > 0) {
      canvas.remove(...existingFrames);
    }

    if (!currentFrameStyle) {
      canvas.renderAll();
      return;
    }

    const margin = 40;
    const inkColor = '#1C1917';
    const frames: fabric.Object[] = [];

    const setupFrameObj = (obj: fabric.Object) => {
      (obj as any).isFrame = true;
      obj.selectable = false;
      obj.evented = false; // This makes it click-through!
      obj.hoverCursor = 'default';
      obj.originX = 'left';
      obj.originY = 'top';
      return obj;
    };

    if (currentFrameStyle === 'vintage') {
      // 1. Ornate Corners (Classic Decorative Brackets)
      const cornerLen = 60;
      const cornerStroke = 4;
      const cornerDist = 12; // Distance from the edges

      const cornerConfigs = [
        // Top Left
        { path: `M 0 ${cornerLen} L 0 0 L ${cornerLen} 0`, l: cornerDist, t: cornerDist },
        // Top Right
        { path: `M 0 0 L ${cornerLen} 0 L ${cornerLen} ${cornerLen}`, l: width - cornerDist - cornerLen, t: cornerDist },
        // Bottom Left
        { path: `M 0 0 L 0 ${cornerLen} L ${cornerLen} ${cornerLen}`, l: cornerDist, t: height - cornerDist - cornerLen },
        // Bottom Right
        { path: `M ${cornerLen} 0 L ${cornerLen} ${cornerLen} L 0 ${cornerLen}`, l: width - cornerDist - cornerLen, t: height - cornerDist - cornerLen }
      ];

      cornerConfigs.forEach(conf => {
        const p = new fabric.Path(conf.path, {
          left: conf.l,
          top: conf.t,
          stroke: inkColor,
          strokeWidth: cornerStroke,
          fill: 'transparent',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeUniform: true,
        });
        frames.push(setupFrameObj(p));
      });

      // 2. Main Thin Rectangle
      const mainRect = new fabric.Rect({
        width: width - margin * 2,
        height: height - margin * 2,
        left: margin,
        top: margin,
        fill: 'transparent',
        stroke: inkColor,
        strokeWidth: 1.5,
        strokeUniform: true,
      });
      frames.push(setupFrameObj(mainRect));

      // 3. Very fine decorative inner line
      const innerMargin = margin + 12;
      const innerRect = new fabric.Rect({
        width: width - innerMargin * 2,
        height: height - innerMargin * 2,
        left: innerMargin,
        top: innerMargin,
        fill: 'transparent',
        stroke: inkColor,
        strokeWidth: 0.6,
        strokeUniform: true,
      });
      frames.push(setupFrameObj(innerRect));

    } else if (currentFrameStyle === 'bold') {
      const outer = new fabric.Rect({
        width: width - margin * 2,
        height: height - margin * 2,
        left: margin,
        top: margin,
        fill: 'transparent',
        stroke: inkColor,
        strokeWidth: 8,
        strokeUniform: true,
      });
      frames.push(setupFrameObj(outer));

      const innerMargin = margin + 15;
      const inner = new fabric.Rect({
        width: width - innerMargin * 2,
        height: height - innerMargin * 2,
        left: innerMargin,
        top: innerMargin,
        fill: 'transparent',
        stroke: inkColor,
        strokeWidth: 2,
        strokeUniform: true,
      });
      frames.push(setupFrameObj(inner));
    } else if (currentFrameStyle === 'thin') {
      const thin = new fabric.Rect({
        width: width - margin * 2,
        height: height - margin * 2,
        left: margin,
        top: margin,
        fill: 'transparent',
        stroke: inkColor,
        strokeWidth: 1.2,
        strokeUniform: true,
      });
      frames.push(setupFrameObj(thin));
    }

    if (frames.length > 0) {
      canvas.add(...frames);
      // Ensure frames are always on top but non-blocking
      frames.forEach(f => canvas.bringObjectToFront(f));
    }

    canvas.renderAll();
  }, [width, height, currentFrameStyle]);

  useImperativeHandle(ref, () => ({
    addText: (text: string, options = {}) => {
      if (!fabricCanvas.current) return;
      const t = new fabric.IText(text, {
        left: 100,
        top: 100,
        fontFamily: 'Inter',
        fontSize: 40,
        fill: '#1c1917',
        ...options,
      });
      fabricCanvas.current.add(t);
      fabricCanvas.current.setActiveObject(t);
    },

    addImage: async (url: string) => {
      if (!fabricCanvas.current) return;
      try {
        const img = await fabric.FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
        img.scaleToWidth(width * 0.8);
        fabricCanvas.current.add(img);
        fabricCanvas.current.centerObject(img);
        fabricCanvas.current.setActiveObject(img);
      } catch (err) {
        console.error("Image load error", err);
      }
    },

    addSticker: (content: string) => {
      if (!fabricCanvas.current) return;
      const t = new fabric.FabricText(content, {
        left: width / 2,
        top: height / 2,
        fontSize: 80,
      });
      fabricCanvas.current.add(t);
      fabricCanvas.current.centerObject(t);
      fabricCanvas.current.setActiveObject(t);
    },

    addShape: (type: string) => {
      if (!fabricCanvas.current) return;
      let shape: fabric.Object | null = null;
      const common = {
        left: width / 2,
        top: height / 2,
        fill: '#FACC15',
        stroke: '#000000',
        strokeWidth: 2,
      };

      switch (type) {
        case 'circle':
          shape = new fabric.Circle({ ...common, radius: 50 });
          break;
        case 'rect':
          shape = new fabric.Rect({ ...common, width: 100, height: 100 });
          break;
        case 'triangle':
          shape = new fabric.Triangle({ ...common, width: 100, height: 100 });
          break;
        case 'star':
          shape = new fabric.Path('M 50 0 L 61 35 L 98 35 L 68 57 L 79 91 L 50 70 L 21 91 L 32 57 L 2 35 L 39 35 Z', {
            ...common,
            scaleX: 1.5,
            scaleY: 1.5,
          });
          break;
      }

      if (shape) {
        fabricCanvas.current.add(shape);
        fabricCanvas.current.centerObject(shape);
        fabricCanvas.current.setActiveObject(shape);
        fabricCanvas.current.renderAll();
      }
    },

    setBackground: (color: string) => {
      if (!fabricCanvas.current) return;
      fabricCanvas.current.set({ backgroundColor: color });
      fabricCanvas.current.renderAll();
    },

    setBackgroundImage: async (url: string) => {
      if (!fabricCanvas.current) return;
      try {
        const img = await fabric.FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
        const scaleX = width / img.width!;
        const scaleY = height / img.height!;
        const scale = Math.max(scaleX, scaleY);
        
        fabricCanvas.current.backgroundImage = img;
        img.set({
           scaleX: scale,
           scaleY: scale,
           originX: 'left',
           originY: 'top',
           left: 0,
           top: 0
        });
        fabricCanvas.current.renderAll();
      } catch (err) {
        console.error("BG image error", err);
      }
    },

    exportImage: (format: 'png' | 'jpeg') => {
      if (!fabricCanvas.current) return '';
      return fabricCanvas.current.toDataURL({
        format,
        multiplier: 2, // High res
      });
    },

    applyFilter: async (filterType: string) => {
      const activeObject = fabricCanvas.current?.getActiveObject();
      if (!activeObject || !(activeObject instanceof fabric.FabricImage)) return;

      activeObject.filters = [];
      
      switch (filterType) {
        case 'grayscale':
          activeObject.filters.push(new fabric.filters.Grayscale());
          break;
        case 'sepia':
          activeObject.filters.push(new fabric.filters.Sepia());
          break;
        case 'invert':
          activeObject.filters.push(new fabric.filters.Invert());
          break;
        case 'blur':
          activeObject.filters.push(new fabric.filters.Blur({ blur: 0.5 }));
          break;
      }
      
      await activeObject.applyFilters();
      fabricCanvas.current?.renderAll();
    },

    updateSelectedText: (options: any) => {
      const activeObject = fabricCanvas.current?.getActiveObject();
      if (activeObject && (activeObject instanceof fabric.IText || activeObject instanceof fabric.FabricText)) {
        // Curve Logic: using path
        if (options.curviness !== undefined) {
           const curve = options.curviness;
           if (curve === 0) {
             activeObject.set({ path: undefined });
           } else {
             // Simple arc path based on text width
             const w = activeObject.width || 200;
             const h = Math.abs(curve) * 50;
             const d = curve > 0 
                ? `M 0 ${h} Q ${w/2} 0 ${w} ${h}`
                : `M 0 0 Q ${w/2} ${h} ${w} 0`;
             
             activeObject.set({ 
               path: new fabric.Path(d)
             });
           }
        }
        
        activeObject.set(options);
        fabricCanvas.current?.renderAll();
      }
    },

    deleteSelected: () => {
      const activeObjects = fabricCanvas.current?.getActiveObjects();
      if (activeObjects) {
        fabricCanvas.current?.remove(...activeObjects);
        fabricCanvas.current?.discardActiveObject();
        fabricCanvas.current?.renderAll();
      }
    },

    addFrame: (style: string) => {
      setCurrentFrameStyle(prev => prev === style ? null : style);
    }
  }), [width, height]);

  return (
    <div className="relative border border-stone-200 canvas-shadow overflow-hidden bg-white">
      <canvas ref={canvasRef} />
    </div>
  );
});

export default PostcardCanvas;
