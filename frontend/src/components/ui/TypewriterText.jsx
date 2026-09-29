import React, { useState, useEffect } from 'react';

export default function TypewriterText({ text, speed = 40, delay = 0 }) {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    let index = 0;
    let timer;

    const startTyping = () => {
      timer = setInterval(() => {
        if (index < text.length) {
          setDisplayText((prev) => prev + text.charAt(index));
          index++;
        } else {
          clearInterval(timer);
        }
      }, speed);
    };

    const delayTimeout = setTimeout(startTyping, delay);

    return () => {
      clearTimeout(delayTimeout);
      clearInterval(timer);
      setDisplayText('');
    };
  }, [text, speed, delay]);

  return (
    <span className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
      {displayText}
      <span className="animate-ping ml-0.5 inline-block w-1.5 h-4 bg-cosmic-cyan shrink-0 align-middle">|</span>
    </span>
  );
}
