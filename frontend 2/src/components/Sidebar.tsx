import React, { useState, useEffect } from 'react';

interface SidebarProps {
  crtActive: boolean;
  setCrtActive: (active: boolean) => void;
  glowActive: boolean;
  setGlowActive: (active: boolean) => void;
  onPurge: () => void;
  queryHistory: string[];
  onHistoryClick: (query: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  crtActive,
  setCrtActive,
  glowActive,
  setGlowActive,
  onPurge,
  queryHistory,
  onHistoryClick
}) => {
  const [cpu, setCpu] = useState(12);
  const [mem, setMem] = useState(8392);
  const [ping, setPing] = useState(142);

  useEffect(() => {
    const timer = setInterval(() => {
      setCpu(Math.floor(8 + Math.random() * 15));
      setMem(Math.floor(7500 + Math.random() * 1000));
      setPing(Math.floor(100 + Math.random() * 90));
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <aside className="sidebar">
      {/* Controls */}
      <div className="sidebar-section">
        <div className="sidebar-title">Controls</div>
        <button 
          className={`btn-control ${crtActive ? 'active' : ''}`}
          onClick={() => setCrtActive(!crtActive)}
        >
          CRT SCANLINES [{crtActive ? 'ON' : 'OFF'}]
        </button>
        <button 
          className={`btn-control ${glowActive ? 'active' : ''}`}
          onClick={() => setGlowActive(!glowActive)}
        >
          SCREEN GLOW [{glowActive ? 'ON' : 'OFF'}]
        </button>
        <button className="btn-control" onClick={onPurge}>
          PURGE STORAGE
        </button>
      </div>

      {/* System Status */}
      <div className="sidebar-section">
        <div className="sidebar-title">System Status</div>
        <div className="system-stats">
          <div className="stat-row">
            <span>CPU LOAD:</span>
            <span>{cpu}%</span>
          </div>
          <div className="stat-row">
            <span>MEM FREE:</span>
            <span>{mem} KB</span>
          </div>
          <div className="stat-row">
            <span>TAVILY PIN:</span>
            <span>{ping}ms</span>
          </div>
          <div className="stat-row">
            <span>MODEL:</span>
            <span>WEB-AI-120B</span>
          </div>
        </div>
      </div>

      {/* Query Archive */}
      <div className="sidebar-section">
        <div className="sidebar-title">Query Archive</div>
        <ul className="history-list">
          {queryHistory.map((q, idx) => (
            <li 
              key={idx} 
              className="history-item"
              title={q}
              onClick={() => onHistoryClick(q)}
            >
              {`> ${q}`}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};
