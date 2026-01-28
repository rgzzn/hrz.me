import React, { useState } from 'react';
import { OrbProps } from '../types';
import { ArrowUpRight } from 'lucide-react';

const Orb = React.forwardRef<HTMLDivElement, OrbProps>(({ label, href, position, subLabel, icon: Icon }, ref) => {
  const [isHovered, setIsHovered] = useState(false);

  // Position Logic:
  // RGZZN (top-left) moved closer to center (30%)
  // DASHB (bottom-right) stays at original position (16%)
  const positionClasses = position === 'top-left' 
    ? 'top-[30%] left-[30%]' 
    : 'bottom-[16%] right-[16%]';

  // Floating animation: using different durations/delays to feel organic
  const animationName = position === 'top-left' ? 'diagonal-float-tl' : 'diagonal-float-br';
  const animationDuration = position === 'top-left' ? '12s' : '14s'; // Different speeds
  const animationDelay = position === 'top-left' ? '0s' : '-4s'; // Offset start

  return (
    <div 
      ref={ref}
      className={`absolute ${positionClasses} z-40 group will-change-transform pointer-events-auto`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Centering Wrapper */}
      <div className="relative -translate-x-1/2 -translate-y-1/2">
        
        {/* Animation Wrapper: Using play-state prevents "jumping" when hovering */}
        <div 
          className="w-full h-full relative flex items-center justify-center orb-floater"
          style={{
            animation: `${animationName} ${animationDuration} ease-in-out infinite`,
            animationDelay: animationDelay,
            animationPlayState: isHovered ? 'paused' : 'running',
          }}
        >
          
          {/* Violent Glow effect on hover */}
          <div className={`absolute inset-0 rounded-full bg-primary/40 blur-2xl transition-all duration-300 ${isHovered ? 'scale-[2.8] opacity-100 animate-pulse' : 'scale-100 opacity-20'}`} />

          {/* The Orb Link - This <a> tag is what the rope will track in App.tsx */}
          <a 
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="orb-anchor relative flex flex-col items-center justify-center w-32 h-32 md:w-48 md:h-48 rounded-full border border-white/20 bg-black/60 backdrop-blur-xl transition-all duration-300 overflow-hidden group-hover:scale-110 group-hover:border-primary group-hover:bg-black/90"
          >
              <div className={`absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_2px,3px_100%] pointer-events-none" />

              <div className={`mb-3 text-white/70 group-hover:text-white transition-all duration-300 transform group-hover:-translate-y-1 group-hover:scale-125 z-10`}>
                  <Icon size={28} />
              </div>

              <span className="font-mono text-sm tracking-[0.3em] font-bold text-white group-hover:text-primary transition-colors duration-300 z-10 relative">
                  {label}
                  <span className={`absolute top-0 left-0 -ml-[2px] text-red-500 opacity-0 group-hover:opacity-70 group-hover:animate-pulse`}>{label}</span>
                  <span className={`absolute top-0 left-0 ml-[2px] text-blue-500 opacity-0 group-hover:opacity-70 group-hover:animate-pulse animation-delay-75`}>{label}</span>
              </span>
              
              <div className={`absolute bottom-8 flex items-center gap-1 text-[10px] uppercase tracking-widest text-white/60 transition-all duration-500 transform opacity-100 translate-y-0 md:opacity-0 md:translate-y-8 ${isHovered ? 'md:translate-y-0 md:opacity-100' : ''}`}>
                  <span>{subLabel || 'Open'}</span>
                  <ArrowUpRight size={10} />
              </div>
          </a>
          
          {/* Decorative Rings - Also pause on hover */}
          <div 
            className={`absolute inset-[-15px] rounded-full border border-dashed border-white/10 pointer-events-none transition-all duration-700 ${isHovered ? 'border-primary/40 scale-105' : ''}`} 
            style={{ animation: `spin 20s linear infinite`, animationPlayState: isHovered ? 'paused' : 'running' }}
          />
          <div className={`absolute inset-[-8px] rounded-full border-[0.5px] border-white/20 pointer-events-none transition-all duration-700 ${isHovered ? 'scale-110 border-secondary/50' : 'scale-95'}`} />
        </div>
      </div>

      <style>{`
        @keyframes diagonal-float-tl {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-30px, -20px); }
        }
        @keyframes diagonal-float-br {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, 20px); }
        }
      `}</style>
    </div>
  );
});

Orb.displayName = "Orb";

export default Orb;