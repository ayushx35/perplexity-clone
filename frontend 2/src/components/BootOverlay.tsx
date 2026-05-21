import React, { useEffect, useState, useRef } from 'react';

interface BootOverlayProps {
  onComplete: () => void;
}

const BOOT_LINES = [
  "PURPLEXITY OS v1.0.9 (C) 1994-1996 PURPLEX INC.",
  "--------------------------------------------------",
  "CPU: INTEL i486 DX2-66 PROCESSOR OK",
  "CONVENTIONAL MEMORY: 640 KB OK",
  "EXTENDED MEMORY: 15360 KB OK",
  "TOTAL MEMORY: 16384 KB OK",
  "DETECTING HARDWARE...",
  "  PRIMARY MASTER: TAVILY WEB SEARCH PROVIDER v0.7.3",
  "  PRIMARY SLAVE: OPENAI LLM AGENTS ENGINE",
  "INITIALIZING PORT 3000 NETWORK CONNECTIVITY...",
  "CONNECTING TO GATEWAY HTTP://LOCALHOST:3000... OK",
  "LOADING SYSTEM DICTIONARIES...",
  "SYSTEM STATUS: ONLINE. READY FOR INSTRUCTION.",
  "--------------------------------------------------",
  "TYPE A QUESTION AND PRESS 'EXECUTE' TO SEARCH THE CYBER-SPACE.",
  " "
];

export const BootOverlay: React.FC<BootOverlayProps> = ({ onComplete }) => {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let currentIdx = 0;
    const timeouts: number[] = [];

    const printNextLine = () => {
      if (currentIdx < BOOT_LINES.length) {
        setVisibleLines(prev => [...prev, BOOT_LINES[currentIdx]]);
        currentIdx++;
        
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }

        const delay = 60 + Math.random() * 80;
        const timer = window.setTimeout(printNextLine, delay);
        timeouts.push(timer);
      } else {
        const endTimer = window.setTimeout(onComplete, 300);
        timeouts.push(endTimer);
      }
    };

    printNextLine();

    return () => {
      timeouts.forEach(t => clearTimeout(t));
    };
  }, [onComplete]);

  return (
    <div className="boot-overlay" ref={containerRef}>
      {visibleLines.map((line, idx) => (
        <div key={idx} className="boot-line" style={{ animationDelay: '0s' }}>
          {line}
        </div>
      ))}
    </div>
  );
};
