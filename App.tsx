import React, { useEffect, useState, useRef } from 'react';
import PixelCursor from './components/PixelCursor';
import Orb from './components/Orb';
import DynamicText from './components/DynamicText';
import { Fingerprint, Tv } from 'lucide-react';

const App: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  
  // Refs for direct DOM manipulation (High Performance)
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const glowPathRef = useRef<SVGPathElement>(null);
  
  // Physics State Refs
  const mousePos = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    setMounted(true);
    
    const handleMouseMove = (e: MouseEvent) => {
        mousePos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;

    const animate = () => {
        if (!orb1Ref.current || !orb2Ref.current || !pathRef.current) {
            animationFrameId = requestAnimationFrame(animate);
            return;
        }

        // 1. Get Base Positions (where the CSS puts them)
        const rect1 = orb1Ref.current.getBoundingClientRect();
        const rect2 = orb2Ref.current.getBoundingClientRect();
        
        // We need the center points relative to their current transform
        // But getBoundingClientRect includes the transform. 
        // To calculate magnetic pull cleanly, we should estimate the "anchor" position.
        // For simplicity in this effect, we use the rect center as the source of truth for the line,
        // and apply offset to the element's transform style.

        // Initial Anchor Calculation (Approximation based on screen % if we wanted pure math, 
        // but reading rect is safer for responsiveness)
        // However, reading rect causes reflow. 
        // OPTIMIZATION: Assume the rect read in the previous frame is "close enough" or read only once per resize.
        // For "Magnetic" effect, we need a base anchor.
        // Let's assume the element is at `transform: translate3d(0,0,0)` initially.
        
        // Let's implement a simple spring-to-mouse for the visual elements
        
        const calculateMagneticOffset = (rect: DOMRect) => {
             const centerX = rect.left + rect.width / 2;
             const centerY = rect.top + rect.height / 2;
             
             // Since the rect moves with the transform, we need to dampen the "self-correction"
             // or simply calculate distance from mouse.
             
             const dx = mousePos.current.x - centerX;
             const dy = mousePos.current.y - centerY;
             const dist = Math.sqrt(dx*dx + dy*dy);
             
             const triggerDist = 400;
             let offsetX = 0;
             let offsetY = 0;
             
             if (dist < triggerDist) {
                 const pull = 0.3; // Strength
                 offsetX = dx * pull;
                 offsetY = dy * pull;
             }
             return { x: offsetX, y: offsetY, cx: centerX, cy: centerY };
        };

        // We need to know the "zero" position to avoid infinite loop of reading rect -> moving -> reading moved rect.
        // We will read the rect, but apply the transform to a style variable or directly.
        // Actually, easiest way is to use the `offset` from previous frame, subtract it from rect to find "anchor".
        // But let's just stick to: Current Rect Center + Magnetic Delta.
        
        // Note: This simple rect read works because the mouse moves faster than the reflow in most cases,
        // but for a perfect system we'd calculate window% positions.
        // Let's use the rects directly for the line connectivity.
        
        const p1 = { x: rect1.left + rect1.width/2, y: rect1.top + rect1.height/2 };
        const p2 = { x: rect2.left + rect2.width/2, y: rect2.top + rect2.height/2 };

        // Apply Magnetic Transform to Orbs
        // We calculate distance from the "visual" center to mouse
        const dist1 = Math.hypot(mousePos.current.x - p1.x, mousePos.current.y - p1.y);
        const dist2 = Math.hypot(mousePos.current.x - p2.x, mousePos.current.y - p2.y);
        
        const maxDist = 300;
        const force = 0.15;
        
        // Target Offsets
        const tx1 = dist1 < maxDist ? (mousePos.current.x - p1.x) * force : 0;
        const ty1 = dist1 < maxDist ? (mousePos.current.y - p1.y) * force : 0;
        
        const tx2 = dist2 < maxDist ? (mousePos.current.x - p2.x) * force : 0;
        const ty2 = dist2 < maxDist ? (mousePos.current.y - p2.y) * force : 0;

        // Apply transform (Use a lerp for smoothness if desired, but direct is more responsive for magnetic)
        orb1Ref.current.style.transform = `translate3d(calc(-50% + ${tx1}px), calc(-50% + ${ty1}px), 0)`;
        orb2Ref.current.style.transform = `translate3d(calc(-50% + ${tx2}px), calc(-50% + ${ty2}px), 0)`;

        // 2. Update Rope (Bezier Curve)
        // The rope connects the actual visual centers
        // We use a quadratic curve Q. Control point determines the curve.
        // To make it look like a "rope", we add a gravity sag to the Y of the control point.
        
        const startX = p1.x;
        const startY = p1.y;
        const endX = p2.x;
        const endY = p2.y;
        
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        
        // Sag calculation: deeper sag if points are closer horizontally? 
        // Or just fixed sag.
        const sag = 100; // Pixels downwards
        
        // Dynamic Sag: reacts to mouse?
        // Let's make the rope avoid the text slightly by pushing the control point away from center if needed,
        // or just simple gravity.
        
        const d = `M ${startX} ${startY} Q ${midX} ${midY + sag} ${endX} ${endY}`;
        
        pathRef.current.setAttribute('d', d);
        if (glowPathRef.current) glowPathRef.current.setAttribute('d', d);
        
        animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden selection:bg-primary selection:text-white">
      {/* 1. Custom Cursor */}
      <PixelCursor />

      {/* 2. Global Overlays */}
      <div className="fixed inset-0 pointer-events-none z-[100] scanline opacity-10 mix-blend-overlay"></div>
      <div className="fixed inset-0 pointer-events-none z-[90] vignette"></div>
      <div className="fixed top-0 left-0 w-full h-[5px] bg-white/10 z-[80] pointer-events-none animate-scanline blur-sm"></div>

      {/* 3. Background Particles */}
      <div className="absolute inset-0 z-0">
         <div 
            className="w-full h-full opacity-[0.05]" 
            style={{ 
                backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`, 
                backgroundSize: '50px 50px' 
            }} 
         />
         {[...Array(15)].map((_, i) => (
             <div 
                key={i}
                className="absolute bg-white/10 animate-float-medium"
                style={{
                    width: Math.random() * 4 + 2 + 'px',
                    height: Math.random() * 4 + 2 + 'px',
                    top: Math.random() * 100 + '%',
                    left: Math.random() * 100 + '%',
                    animationDuration: Math.random() * 10 + 10 + 's',
                    animationDelay: Math.random() * 5 + 's',
                    opacity: Math.random() * 0.5
                }}
             />
         ))}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] animate-pulse-glow" />
      </div>

      {/* 4. The Dynamic Rope (SVG Layer) */}
      <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none overflow-visible">
        <defs>
            <linearGradient id="ropeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#c026d3" stopOpacity="0.4" />
            </linearGradient>
            <filter id="glowLine">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        
        {/* Main Rope */}
        <path 
            ref={pathRef}
            fill="none"
            stroke="url(#ropeGradient)"
            strokeWidth="1"
            strokeDasharray="5 5"
            className="opacity-60"
        >
             <animate attributeName="stroke-dashoffset" from="0" to="100" dur="2s" repeatCount="indefinite" />
        </path>
        
        {/* Glow/Ghost Rope for effect */}
        <path 
            ref={glowPathRef}
            fill="none"
            stroke="white"
            strokeWidth="0.5"
            className="opacity-20 blur-[1px]"
        />
        
        {/* Particles travelling the rope could go here, but complex with dynamic path d */}
      </svg>

      {/* 5. Main Content Layer */}
      <main className="relative z-20 w-full h-full flex items-center justify-center">
        
        {/* Top Left Orb - RGZZN (Portfolio) */}
        <Orb 
            ref={orb1Ref}
            label="RGZZN" 
            subLabel="Identity"
            href="https://rgzzn.hrz.me" 
            position="top-left" 
            delay={0}
            icon={Fingerprint}
        />

        {/* Center Text */}
        <div className="relative group z-30">
            <DynamicText />
            <div className="absolute -left-8 top-1/2 w-4 h-[1px] bg-white/50 group-hover:w-12 transition-all duration-300"></div>
            <div className="absolute -right-8 top-1/2 w-4 h-[1px] bg-white/50 group-hover:w-12 transition-all duration-300"></div>
        </div>

        {/* Bottom Right Orb - DASHB (Apple TV App) */}
        <Orb 
            ref={orb2Ref}
            label="DASHB" 
            subLabel="tvOS App"
            href="https://dashb.hrz.me" 
            position="bottom-right" 
            delay={2}
            icon={Tv}
        />

      </main>

      {/* 6. Noise Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.05] z-[40] mix-blend-overlay"
        style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
    </div>
  );
};

export default App;