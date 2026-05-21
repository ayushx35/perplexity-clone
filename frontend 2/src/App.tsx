import { useState, useEffect, useRef } from 'react';
import { BootOverlay } from './components/BootOverlay';
import { Sidebar } from './components/Sidebar';
import { MessageItem } from './components/MessageItem';
import type { Message } from './components/MessageItem';

type TerminalEntry =
  | { id: string; type: 'message'; data: Message }
  | { id: string; type: 'log'; text: string; time: string };

export default function App() {
  const [isBooted, setIsBooted] = useState(false);
  const [crtActive, setCrtActive] = useState(() => {
    const saved = localStorage.getItem('perplexity_crt');
    return saved !== 'false';
  });
  const [glowActive, setGlowActive] = useState(() => {
    const saved = localStorage.getItem('perplexity_glow');
    return saved !== 'false';
  });

  const [entries, setEntries] = useState<TerminalEntry[]>([]);
  const [queryHistory, setQueryHistory] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem('perplexity_history') || '[]');
  });
  const [inputVal, setInputVal] = useState('');

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync settings to localStorage
  useEffect(() => {
    localStorage.setItem('perplexity_crt', String(crtActive));
  }, [crtActive]);

  useEffect(() => {
    localStorage.setItem('perplexity_glow', String(glowActive));
  }, [glowActive]);

  // Load message logs from storage on boot
  const loadSavedSession = () => {
    const saved = localStorage.getItem('perplexity_messages');
    if (saved) {
      try {
        const parsedMsgs: Message[] = JSON.parse(saved);
        const restoredEntries: TerminalEntry[] = parsedMsgs.map((msg, idx) => ({
          id: `restored-${idx}`,
          type: 'message',
          data: { ...msg, animate: false }
        }));
        setEntries(restoredEntries);
        logEvent('RESTORING PRIOR STORAGE SESSIONS...');
      } catch (e) {
        logEvent('READY.');
      }
    } else {
      logEvent('READY.');
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const logEvent = (text: string) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const newLog: TerminalEntry = {
      id: `log-${Date.now()}-${Math.random()}`,
      type: 'log',
      text,
      time: timeStr
    };
    setEntries(prev => [...prev, newLog]);
    setTimeout(scrollToBottom, 50);
  };

  const handleSend = async (queryText?: string) => {
    if (!isBooted) return;
    const query = (queryText !== undefined ? queryText : inputVal).trim();
    if (!query) return;

    if (queryText === undefined) {
      setInputVal('');
    }

    // Remove any bot messages that are still typing (animate true) before sending a new query
    setEntries(prev => prev.filter(entry => !(entry.type === 'message' && entry.data.role === 'bot' && entry.data.animate)));

    // Add user message
    const userMsg: TerminalEntry = {
      id: `msg-${Date.now()}-user`,
      type: 'message',
      data: { role: 'user', text: query }
    };
    setEntries(prev => [...prev, userMsg]);

    // Update query archive history
    setQueryHistory(prev => {
      let updated = [query, ...prev.filter(item => item !== query)];
      if (updated.length > 15) updated = updated.slice(0, 15);
      localStorage.setItem('perplexity_history', JSON.stringify(updated));
      return updated;
    });

    logEvent('INITIALIZING SYSTEM AGENT SEARCH DISPATCH...');

    const timer1 = setTimeout(() => logEvent('QUERY ROUTED TO TAVILY GLOBAL WEB INDEX...'), 500);
    const timer2 = setTimeout(() => logEvent('COMPILING CONTEXT FROM TOP RETRIEVED SEGMENTS...'), 1200);
    const timer3 = setTimeout(() => logEvent('SYNTHESIZING FINAL RESPONSE VIA LLM AGENT...'), 2200);

    try {
      const baseUrl = window.location.port !== '3000' ? 'http://localhost:3000' : '';
      const response = await fetch(`${baseUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      const data = await response.json();

      if (response.ok) {
        logEvent('RESPONSE VERIFIED. PARSING STREAM...');
        const botMsg: TerminalEntry = {
          id: `msg-${Date.now()}-bot`,
          type: 'message',
          data: { role: 'bot', text: data.result || 'Empty response.', animate: true }
        };
        setEntries(prev => [...prev, botMsg]);
      } else {
        logEvent('ERROR DETECTED ON NODE PROTOCOL HANDLER.');
        const errMsg: TerminalEntry = {
          id: `msg-${Date.now()}-err`,
          type: 'message',
          data: { role: 'bot', text: `AGENT ERROR: ${data.error || 'UNHANDLED EXCEPTION'}` }
        };
        setEntries(prev => [...prev, errMsg]);
      }
    } catch (e) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      logEvent('CONNECTION LOSS DETECTED.');
      const networkErrMsg: TerminalEntry = {
        id: `msg-${Date.now()}-net-err`,
        type: 'message',
        data: { role: 'bot', text: 'CRITICAL NETWORK FAULT: Could not reach the server host. Check gateway on port 3000.' }
      };
      setEntries(prev => [...prev, networkErrMsg]);
    }
  };

  // Sync entries to localStorage (only messages)
  useEffect(() => {
    if (entries.length === 0) return;
    const messagesOnly = entries
      .filter((e): e is TerminalEntry & { type: 'message' } => e.type === 'message')
      .map(e => e.data);
    if (messagesOnly.length > 0) {
      localStorage.setItem('perplexity_messages', JSON.stringify(messagesOnly));
    }
  }, [entries]);

  const handlePurge = () => {
    if (window.confirm("PURGE CORE CHAT RECORDS AND SEARCH HISTORY?")) {
      localStorage.removeItem('perplexity_history');
      localStorage.removeItem('perplexity_messages');
      setEntries([]);
      setQueryHistory([]);
      logEvent('SYSTEM CODES RESETS... STORAGE CLEARED.');
    }
  };

  const handleBootComplete = () => {
    setIsBooted(true);
    loadSavedSession();
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div className={`${crtActive ? '' : 'crt-off'} ${glowActive ? 'glow-active' : ''}`}>
      <div className="crt-scanlines flicker-active"></div>
      <div className="grid-bg"></div>

      <div className="app-wrapper">
        {/* Header bar */}
        <header className="status-bar">
          <div className="section">
            <span><span className="blink-dot"></span> SYSTEM: ONLINE</span>
            <span>PORT: 3000</span>
            <span>OS: PURPLEXITY v1.0.9</span>
          </div>
          <div className="section">
            <span>CRT: <b>{crtActive ? 'ON' : 'OFF'}</b></span>
            <span>GLOW: <b>{glowActive ? 'ON' : 'OFF'}</b></span>
          </div>
        </header>

        <div className="main-workspace">
          {/* Sidebar */}
          <Sidebar
            crtActive={crtActive}
            setCrtActive={setCrtActive}
            glowActive={glowActive}
            setGlowActive={setGlowActive}
            onPurge={handlePurge}
            queryHistory={queryHistory}
            onHistoryClick={(q) => handleSend(q)}
          />

          {/* Main chat interface */}
          <main className="chat-container">
            {!isBooted && <BootOverlay onComplete={handleBootComplete} />}

            <div className="terminal-output" ref={chatContainerRef}>
              {entries.map((entry) => {
                if (entry.type === 'log') {
                  return (
                    <div key={entry.id} className="terminal-log-entry">
                      [{entry.time}] {entry.text}
                    </div>
                  );
                }
                return (
                  <MessageItem
                    key={entry.id}
                    message={entry.data}
                    onFollowUpClick={(q) => handleSend(q)}
                    onScrollToBottom={scrollToBottom}
                  />
                );
              })}
            </div>

            {/* Input prompt */}
            <div className="input-bar">
              <span className="prompt-symbol">USER@PURPLEXITY:~$</span>
              <input
                type="text"
                ref={inputRef}
                className="chat-input"
                placeholder="Type query / command..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend();
                }}
                disabled={!isBooted}
                autoFocus
              />
              <button 
                className="btn-send" 
                onClick={() => handleSend()}
                disabled={!isBooted}
              >
                EXECUTE
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
