import React, { useEffect, useRef } from 'react';
import { Point, CursorTrailPoint } from '../types';

const PixelCursor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef<Point>({ x: -100, y: -100 });
  const trailRef = useRef<CursorTrailPoint[]>([]);
  
  // Configuration
  const TRAIL_LENGTH = 30;
  const PIXEL_SIZE = 8;
  const COLORS = ['#8b5cf6', '#c026d3', '#ffffff', '#4c1d95'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    handleResize();

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Add new point to trail
      trailRef.current.unshift({
        x: mousePos.current.x,
        y: mousePos.current.y,
        age: 1.0,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      });

      // Trim trail
      if (trailRef.current.length > TRAIL_LENGTH) {
        trailRef.current.pop();
      }

      // Draw trail
      trailRef.current.forEach((point, index) => {
        point.age -= 0.05; // Decay
        if (point.age <= 0) return;

        ctx.fillStyle = point.color;
        ctx.globalAlpha = point.age * 0.5;
        
        // Snapping coordinates to grid for pixel effect
        const snappedX = Math.floor(point.x / PIXEL_SIZE) * PIXEL_SIZE;
        const snappedY = Math.floor(point.y / PIXEL_SIZE) * PIXEL_SIZE;
        
        // Add some jitter for glitch effect
        const jitter = index % 3 === 0 ? (Math.random() - 0.5) * 4 : 0;

        ctx.fillRect(snappedX + jitter, snappedY + jitter, PIXEL_SIZE, PIXEL_SIZE);
      });

      // Draw Main Cursor (Crosshair)
      const cx = Math.floor(mousePos.current.x / PIXEL_SIZE) * PIXEL_SIZE;
      const cy = Math.floor(mousePos.current.y / PIXEL_SIZE) * PIXEL_SIZE;

      ctx.fillStyle = 'white';
      ctx.globalAlpha = 1;
      
      // Center dot
      ctx.fillRect(cx, cy, PIXEL_SIZE, PIXEL_SIZE);
      
      // Crosshair arms
      ctx.fillStyle = '#8b5cf6'; // Primary Purple
      ctx.fillRect(cx - PIXEL_SIZE, cy, PIXEL_SIZE, PIXEL_SIZE);
      ctx.fillRect(cx + PIXEL_SIZE, cy, PIXEL_SIZE, PIXEL_SIZE);
      ctx.fillRect(cx, cy - PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
      ctx.fillRect(cx, cy + PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-50 mix-blend-screen"
    />
  );
};

export default PixelCursor;