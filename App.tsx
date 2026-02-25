import React, { useEffect, useState, useRef } from 'react';
import PixelCursor from './components/PixelCursor';
import Orb from './components/Orb';
import DynamicText from './components/DynamicText';
import { Fingerprint, Tv } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';

const App: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const glowPathRef = useRef<SVGPathElement>(null);
  
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

        const w = window.innerWidth;
        const h = window.innerHeight;
        
        // Base positions
        // p1 (RGZZN - Top Left): Moved closer to center (30%)
        // p2 (DASHB - Bottom Right): Kept at original position (16% -> 0.84)
        const p1Base = { x: w * 0.30, y: h * 0.30 };
        const p2Base = { x: w * 0.84, y: h * 0.84 };

        // Distances for magnetic pull
        const dist1 = Math.hypot(mousePos.current.x - p1Base.x, mousePos.current.y - p1Base.y);
        const dist2 = Math.hypot(mousePos.current.x - p2Base.x, mousePos.current.y - p2Base.y);
        
        const maxDist = 500; 
        const force = 0.20; // Stronger pull
        
        // Calculate displacements (Magnetic Effect)
        // We apply this to the OUTER wrapper (the ref)
        const isMobile = window.innerWidth < 768;
        const tx1 = (!isMobile && dist1 < maxDist) ? (mousePos.current.x - p1Base.x) * force * (1 - dist1/maxDist) : 0;
        const ty1 = (!isMobile && dist1 < maxDist) ? (mousePos.current.y - p1Base.y) * force * (1 - dist1/maxDist) : 0;
        const tx2 = (!isMobile && dist2 < maxDist) ? (mousePos.current.x - p2Base.x) * force * (1 - dist2/maxDist) : 0;
        const ty2 = (!isMobile && dist2 < maxDist) ? (mousePos.current.y - p2Base.y) * force * (1 - dist2/maxDist) : 0;

        // Apply magnetic movement to the wrapper
        orb1Ref.current.style.transform = `translate(${tx1}px, ${ty1}px)`;
        orb2Ref.current.style.transform = `translate(${tx2}px, ${ty2}px)`;

        // --- ROPE CALCULATION FIX ---
        // Instead of getting the rect of the wrapper (which is static relative to the float animation),
        // we find the actual inner circle (the <a> tag with class 'orb-anchor') that is moving via CSS.
        const anchor1 = orb1Ref.current.querySelector('.orb-anchor');
        const anchor2 = orb2Ref.current.querySelector('.orb-anchor');

        if (anchor1 && anchor2) {
            const rect1 = anchor1.getBoundingClientRect();
            const rect2 = anchor2.getBoundingClientRect();
            
            // Calculate absolute center of the VISUAL sphere
            const startX = rect1.left + rect1.width / 2;
            const startY = rect1.top + rect1.height / 2;
            const endX = rect2.left + rect2.width / 2;
            const endY = rect2.top + rect2.height / 2;
            
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;
            
            // Dynamic Sag based on distance (makes it feel loose)
            const currentDist = Math.hypot(endX - startX, endY - startY);
            const sag = currentDist * 0.1; // 10% of distance is sag height
            
            const d = `M ${startX} ${startY} Q ${midX} ${midY + sag} ${endX} ${endY}`;
            
            pathRef.current.setAttribute('d', d);
            if (glowPathRef.current) glowPathRef.current.setAttribute('d', d);
        }
        
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
      <PixelCursor />

      {/* Overlay Effects */}
      <div className="fixed inset-0 pointer-events-none z-[100] scanline opacity-10 mix-blend-overlay"></div>
      <div className="fixed inset-0 pointer-events-none z-[90] vignette"></div>
      <div className="fixed top-0 left-0 w-full h-[5px] bg-white/10 z-[80] pointer-events-none animate-scanline blur-sm"></div>

      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
         <div 
            className="w-full h-full opacity-[0.05]" 
            style={{ 
                backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`, 
                backgroundSize: '50px 50px' 
            }} 
         />
         {[...Array(20)].map((_, i) => (
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
                    opacity: Math.random() * 0.4
                }}
             />
         ))}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/5 rounded-full blur-[120px] animate-pulse-glow" />
      </div>

      {/* Rope Layer - Needs to be behind Orbs but above background */}
      <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none overflow-visible">
        <defs>
            <linearGradient id="ropeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#d3ff6e" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#abff00" stopOpacity="0.6" />
            </linearGradient>
        </defs>
        
        <path 
            ref={pathRef}
            fill="none"
            stroke="url(#ropeGradient)"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            className="opacity-70"
        >
             <animate attributeName="stroke-dashoffset" from="0" to="100" dur="2.5s" repeatCount="indefinite" />
        </path>
        
        <path 
            ref={glowPathRef}
            fill="none"
            stroke="white"
            strokeWidth="0.5"
            className="opacity-40 blur-[2px]"
        />
      </svg>

      {/* Orbs */}
      <Orb 
          ref={orb1Ref}
          label="RGZZN" 
          subLabel="Identity"
          href="https://rgzzn.hrz.me" 
          position="top-left" 
          icon={Fingerprint}
      />

      <Orb 
          ref={orb2Ref}
          label="DASHB" 
          subLabel="tvOS App"
          href="https://dashb.hrz.me" 
          position="bottom-right" 
          icon={Tv}
      />

      {/* Central Content */}
      <main className="relative z-20 w-full h-full flex items-center justify-center pointer-events-none">
        <div className="relative group z-30 pointer-events-auto">
            <DynamicText />
            <div className="absolute -left-16 top-1/2 w-12 h-[1px] bg-white/30 group-hover:w-24 group-hover:bg-primary transition-all duration-500"></div>
            <div className="absolute -right-16 top-1/2 w-12 h-[1px] bg-white/30 group-hover:w-24 group-hover:bg-secondary transition-all duration-500"></div>
        </div>
      </main>

      {/* Noise Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.06] z-[45] mix-blend-overlay"
        style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Vercel Web Analytics */}
      <Analytics />
    </div>
  );
};

export default App;
