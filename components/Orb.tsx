import React, { useState } from 'react';
import { OrbProps } from '../types';
import { ArrowUpRight } from 'lucide-react';

// Now wraps the component to forward the Ref to the DOM element
const Orb = React.forwardRef<HTMLDivElement, OrbProps>(({ label, href, position, subLabel, icon: Icon }, ref) => {
  const [isHovered, setIsHovered] = useState(false);

  // Position styles adjusted based on user's visual feedback (crosses):
  // Moved significantly inwards to approximately 25% from the edges.
  const positionClasses = position === 'top-left' 
    ? 'top-[25%] left-[25%]' 
    : 'bottom-[25%] right-[25%]';

  return (
    <div 
      ref={ref}
      className={`absolute ${positionClasses} z-20 group -translate-x-1/2 -translate-y-1/2 will-change-transform`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animation Wrapper for floating */}
      <div className="animate-float-slow w-full h-full relative flex items-center justify-center">
        
        {/* Violent Glow effect on hover */}
        <div className={`absolute inset-0 rounded-full bg-primary/40 blur-2xl transition-all duration-300 ${isHovered ? 'scale-[2.0] opacity-100 animate-pulse' : 'scale-100 opacity-20'}`} />

        {/* The Orb Link */}
        <a 
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="relative flex flex-col items-center justify-center w-32 h-32 md:w-48 md:h-48 rounded-full border border-white/20 bg-black/60 backdrop-blur-xl transition-all duration-300 overflow-hidden group-hover:scale-110 group-hover:border-primary group-hover:bg-black/90"
        >
            {/* Inner Glitch Video/Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            
            {/* Scanline inside the orb */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_2px,3px_100%] pointer-events-none" />

            {/* Icon */}
            <div className={`mb-3 text-white/70 group-hover:text-white transition-all duration-300 transform group-hover:-translate-y-1 group-hover:scale-125 z-10`}>
                <Icon size={28} />
            </div>

            {/* Text Label */}
            <span className="font-mono text-sm tracking-[0.3em] font-bold text-white group-hover:text-primary transition-colors duration-300 z-10 relative">
                {label}
                {/* Glitch text shadow */}
                <span className={`absolute top-0 left-0 -ml-[2px] text-red-500 opacity-0 group-hover:opacity-70 group-hover:animate-pulse`}>{label}</span>
                <span className={`absolute top-0 left-0 ml-[2px] text-blue-500 opacity-0 group-hover:opacity-70 group-hover:animate-pulse animation-delay-75`}>{label}</span>
            </span>
            
            {/* Sub label / Action */}
            <div className={`absolute bottom-8 flex items-center gap-1 text-[10px] uppercase tracking-widest text-white/60 transition-all duration-500 transform ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                <span>{subLabel || 'Open'}</span>
                <ArrowUpRight size={10} />
            </div>
        </a>
        
        {/* Complex Rings */}
        {/* Ring 1: Dashed */}
        <div className={`absolute inset-[-15px] rounded-full border border-dashed border-white/10 pointer-events-none transition-all duration-700 ${isHovered ? 'animate-[spin_4s_linear_infinite] border-primary/40 scale-105' : 'animate-[spin_20s_linear_infinite]'}`} />
        
        {/* Ring 2: Thin solid eccentric */}
        <div className={`absolute inset-[-8px] rounded-full border-[0.5px] border-white/20 pointer-events-none transition-all duration-700 ${isHovered ? 'scale-110 border-secondary/50' : 'scale-95'}`} />

        {/* Ring 3: Counter spin */}
        <div className={`absolute inset-[-25px] rounded-full border-t border-b border-transparent border-l border-r border-white/10 pointer-events-none animate-[spin_15s_linear_infinite_reverse] ${isHovered ? 'border-white/40' : ''}`} />

      </div>
    </div>
  );
});

Orb.displayName = "Orb";

export default Orb;