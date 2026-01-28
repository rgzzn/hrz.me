import React, { useEffect, useState, useMemo } from 'react';

// Updated list matching the new readable fonts in tailwind config
const fontFamilies = [
  'font-sans',
  'font-serif',
  'font-mono',
  'font-pixel',
  'font-terminal',
  'font-digital',
  'font-comic',
  'font-western',
  'font-future',
  'font-elegant',
  'font-typewriter',
  'font-syne',
  'font-marker',
  'font-scifi',
  'font-tech',
  'font-stencil',
  'font-bloat',
  'font-rounded',
  'font-funky'
];

interface WordProps {
  word: string;
  initialDelay: number;
}

const AnimatedWord: React.FC<WordProps> = ({ word, initialDelay }) => {
  // Start with a random font
  const [fontIndex, setFontIndex] = useState(() => Math.floor(Math.random() * fontFamilies.length));
  
  useEffect(() => {
    // Randomize the interval for chaos (between 500ms and 2000ms)
    const randomInterval = Math.floor(Math.random() * 1500) + 500;
    
    // Initial timeout to offset start times
    const timeoutId = setTimeout(() => {
        const intervalId = setInterval(() => {
            setFontIndex((prev) => {
                let next = Math.floor(Math.random() * fontFamilies.length);
                // Ensure it changes
                if (next === prev) next = (next + 1) % fontFamilies.length;
                return next;
            });
        }, randomInterval);

        return () => clearInterval(intervalId);
    }, initialDelay);

    return () => clearTimeout(timeoutId);
  }, [initialDelay]);

  return (
    <span 
        className={`
            inline-block mx-2 transition-all duration-300
            ${fontFamilies[fontIndex]}
            /* Force consistent sizing to prevent huge layout shifts */
            leading-none
        `}
    >
      {word}
    </span>
  );
};

const DynamicText: React.FC = () => {
  const phrase = "this is not a website";
  const words = useMemo(() => phrase.split(' '), [phrase]);

  return (
    <div className="relative z-30 flex flex-nowrap items-center justify-center pointer-events-none select-none w-full px-4 overflow-visible">
      <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-center text-white mix-blend-difference flex flex-nowrap justify-center gap-x-2 whitespace-nowrap">
        {words.map((word, i) => (
            <AnimatedWord 
                key={`${word}-${i}`} 
                word={word} 
                initialDelay={i * 200} // Stagger start slightly
            />
        ))}
      </h1>
      
      {/* Ghost/Glitch Layer for extra complexity */}
      <h1 className="absolute inset-0 flex flex-nowrap items-center justify-center gap-x-2 text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-center text-primary/30 mix-blend-overlay blur-[2px] pointer-events-none animate-pulse whitespace-nowrap">
         {words.map((word, i) => (
             <span key={`ghost-${i}`} className={`inline-block mx-2 ${fontFamilies[(i * 3) % fontFamilies.length]} leading-none`}>
                 {word}
             </span>
         ))}
      </h1>
    </div>
  );
};

export default DynamicText;