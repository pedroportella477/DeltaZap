
"use client";

import { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Paintbrush, Eraser, Trash2, Download } from 'lucide-react';

export default function CanvasPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Adjust for device pixel ratio for sharper drawing
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;

    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.scale(dpr, dpr);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    contextRef.current = context;
  }, []);
  
  useEffect(() => {
    if (contextRef.current) {
        contextRef.current.strokeStyle = color;
        contextRef.current.lineWidth = lineWidth;
        contextRef.current.globalCompositeOperation = tool === 'pen' ? 'source-over' : 'destination-out';
    }
  }, [color, lineWidth, tool]);

  const startDrawing = ({ nativeEvent }: React.MouseEvent | React.TouchEvent) => {
    if (!contextRef.current) return;
    const { offsetX, offsetY } = getCoordinates(nativeEvent);
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    if (!contextRef.current) return;
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const draw = ({ nativeEvent }: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !contextRef.current) return;
    const { offsetX, offsetY } = getCoordinates(nativeEvent);
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const getCoordinates = (event: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { offsetX: 0, offsetY: 0 };

    if (event instanceof MouseEvent) {
      return { offsetX: event.offsetX, offsetY: event.offsetY };
    } else if (event.touches && event.touches[0]) {
      const rect = canvas.getBoundingClientRect();
      return {
        offsetX: event.touches[0].clientX - rect.left,
        offsetY: event.touches[0].clientY - rect.top,
      };
    }
    return { offsetX: 0, offsetY: 0 };
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'quadro-branco.png';
    link.click();
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-6">
      <CardHeader className="p-0 mb-4">
        <CardTitle className="font-headline text-2xl">Quadro Branco</CardTitle>
        <CardDescription>Use o espaço abaixo para desenhar, anotar e criar.</CardDescription>
      </CardHeader>
      
      <div className="flex-grow flex flex-col md:flex-row gap-4">
        <Card className="w-full md:w-64 flex-shrink-0">
            <CardHeader>
                <CardTitle className="text-lg">Ferramentas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Cor do Pincel</Label>
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-full h-10 p-1 bg-card border rounded-md cursor-pointer"
                        disabled={tool === 'eraser'}
                    />
                </div>
                 <div className="space-y-2">
                    <Label>Tamanho do Pincel ({lineWidth}px)</Label>
                    <Slider 
                        defaultValue={[lineWidth]}
                        max={50}
                        min={1}
                        step={1}
                        onValueChange={(value) => setLineWidth(value[0])}
                    />
                 </div>
                 <div className="space-y-2">
                    <Label>Ferramenta</Label>
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant={tool === 'pen' ? 'secondary' : 'outline'} onClick={() => setTool('pen')}>
                            <Paintbrush className="mr-2" /> Pincel
                        </Button>
                        <Button variant={tool === 'eraser' ? 'secondary' : 'outline'} onClick={() => setTool('eraser')}>
                            <Eraser className="mr-2" /> Borracha
                        </Button>
                    </div>
                 </div>
                 <div className="space-y-2 pt-4 border-t">
                    <Label>Ações</Label>
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="destructive" onClick={clearCanvas}>
                            <Trash2 className="mr-2" /> Limpar
                        </Button>
                        <Button variant="default" onClick={downloadCanvas}>
                            <Download className="mr-2" /> Salvar
                        </Button>
                    </div>
                 </div>
            </CardContent>
        </Card>
        <Card className="flex-grow">
          <CardContent className="p-0 h-full">
            <canvas
              ref={canvasRef}
              className="w-full h-full rounded-lg bg-muted/30 cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseUp={finishDrawing}
              onMouseOut={finishDrawing}
              onMouseMove={draw}
              onTouchStart={startDrawing}
              onTouchEnd={finishDrawing}
              onTouchMove={draw}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
