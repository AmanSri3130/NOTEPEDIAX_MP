import React, { useState, useEffect, useRef } from 'react';

export default function AnimatedCounter({ value, suffix = '', duration = 1500 }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasStarted.current) {
          hasStarted.current = true;
          startCount();
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [value, duration]);

  const startCount = () => {
    // Parse pure numeric value
    const numericValue = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
    if (numericValue === 0) {
      setCount(value);
      return;
    }

    let startTime = null;

    const animateCount = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // Ease out quad
      const currentVal = Math.floor(percentage * numericValue);
      setCount(currentVal);

      if (percentage < 1) {
        requestAnimationFrame(animateCount);
      } else {
        setCount(numericValue); // ensure accurate final count
      }
    };

    requestAnimationFrame(animateCount);
  };

  return (
    <span ref={elementRef} className="font-mono">
      {count}
      {suffix}
    </span>
  );
}
