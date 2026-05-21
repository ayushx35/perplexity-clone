import React, { useState, useEffect, useMemo } from 'react';

export interface Message {
  role: 'user' | 'bot';
  text: string;
  animate?: boolean;
}

interface MessageItemProps {
  message: Message;
  onFollowUpClick: (query: string) => void;
  onScrollToBottom: () => void;
}

function parseLLMResponse(text: string) {
  const cleanText = text.trim();
  
  // 1. Try standard JSON parsing
  try {
    let jsonText = cleanText;
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(json)?/, '').replace(/```$/, '').trim();
    }
    const parsed = JSON.parse(jsonText);
    if (parsed && typeof parsed === 'object') {
      return {
        answer: parsed.answer || parsed.response || text,
        followUps: Array.isArray(parsed.followUps) ? parsed.followUps : (Array.isArray(parsed.followups) ? parsed.followups : [])
      };
    }
  } catch (e) {
    // Fall through to regex/text parsing
  }

  // 2. Try parsing custom text key-value format (answer: ..., followUps: [...])
  const answerRegex = /(?:^|\n)(?:answer|Answer|RESPONSE|Response)\s*:\s*([\s\S]*?)(?=\n(?:followUps|followups|Followups|Follow Ups)\s*:|$)/i;
  const followUpsRegex = /(?:followUps|followups|Followups|Follow Ups)\s*:\s*\[([\s\S]*?)\]/i;

  const answerMatch = cleanText.match(answerRegex);
  const followUpsMatch = cleanText.match(followUpsRegex);

  if (answerMatch || followUpsMatch) {
    const answerVal = answerMatch ? answerMatch[1].trim() : '';
    let followUpsList: string[] = [];

    if (followUpsMatch) {
      const rawList = followUpsMatch[1].trim();
      const itemRegex = /"(.*?)"|'(.*?)'/g;
      let match;
      while ((match = itemRegex.exec(rawList)) !== null) {
        followUpsList.push(match[1] || match[2]);
      }
      if (followUpsList.length === 0 && rawList) {
        followUpsList = rawList
          .split(/[\n,]+/)
          .map(item => item.replace(/^\s*[-*>]?\s*/, '').trim())
          .filter(item => item.length > 0);
      }
    }

    if (answerVal || followUpsList.length > 0) {
      return {
        answer: answerVal || text,
        followUps: followUpsList
      };
    }
  }

  // 3. Fallback: treat whole text as answer
  return {
    answer: text,
    followUps: []
  };
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, onFollowUpClick, onScrollToBottom }) => {
  const { role, text, animate = false } = message;

  const parsed = useMemo(() => {
    if (role === 'user') return { answer: text, followUps: [] };
    return parseLLMResponse(text);
  }, [text, role]);

  const [typedAnswer, setTypedAnswer] = useState('');
  const [showFollowUps, setShowFollowUps] = useState(false);
  const [typedFollowUps, setTypedFollowUps] = useState<string[]>([]);
  const [isAnswerTyping, setIsAnswerTyping] = useState(false);

  // Handle main answer typing
  useEffect(() => {
    if (role !== 'bot' || !animate) {
      setTypedAnswer(parsed.answer);
      setShowFollowUps(true);
      setTypedFollowUps(parsed.followUps);
      onScrollToBottom();
      return;
    }

    setIsAnswerTyping(true);
    let charIndex = 0;
    let currentText = '';
    
    const interval = setInterval(() => {
      if (charIndex < parsed.answer.length) {
        currentText += parsed.answer[charIndex];
        setTypedAnswer(currentText);
        charIndex++;
        onScrollToBottom();
      } else {
        clearInterval(interval);
        setIsAnswerTyping(false);
        setShowFollowUps(true);
      }
    }, 6);

    return () => clearInterval(interval);
  }, [parsed.answer, animate, role, onScrollToBottom]);

  // Handle staggered follow-up questions typing
  useEffect(() => {
    if (role !== 'bot' || !animate || !showFollowUps || parsed.followUps.length === 0) {
      if (showFollowUps && !animate) {
        setTypedFollowUps(parsed.followUps);
      }
      return;
    }

    let qIndex = 0;
    const currentQuestions: string[] = [];

    const typeNextQuestion = () => {
      if (qIndex >= parsed.followUps.length) {
        return;
      }

      const qText = parsed.followUps[qIndex];
      let charIndex = 0;
      let currentQText = '';

      currentQuestions.push('');
      setTypedFollowUps([...currentQuestions]);

      const qInterval = setInterval(() => {
        if (charIndex < qText.length) {
          currentQText += qText[charIndex];
          currentQuestions[qIndex] = currentQText;
          setTypedFollowUps([...currentQuestions]);
          charIndex++;
          onScrollToBottom();
        } else {
          clearInterval(qInterval);
          qIndex++;
          setTimeout(typeNextQuestion, 200);
        }
      }, 5);
    };

    typeNextQuestion();
  }, [showFollowUps, parsed.followUps, animate, role, onScrollToBottom]);

  if (role === 'user') {
    return (
      <div className="message user">
        <div className="message-header">--- SENDER: USER ---</div>
        <span>{parsed.answer}</span>
      </div>
    );
  }

  return (
    <div className="message bot">
      <div className="message-header">
        --- SENDER: PURPLEXITY CO-PROCESSOR ---
      </div>
      <span>
        {typedAnswer}
        {isAnswerTyping && <span className="blinking-cursor" />}
      </span>

      {showFollowUps && parsed.followUps.length > 0 && (
        <div className="followup-section">
          <div className="followup-header">&gt; SUGGESTED FOLLOW-UPS:</div>
          <div className="followup-list">
            {typedFollowUps.map((q, idx) => (
              <button
                key={idx}
                className="followup-btn"
                onClick={() => onFollowUpClick(parsed.followUps[idx])}
              >
                &gt; {q}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
