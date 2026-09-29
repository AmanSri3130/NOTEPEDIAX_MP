import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function GlassCard({ 
  children, 
  className = '', 
  hoverEffect = true,
  onClick
}) {
  const cardRef = useRef(null);
  const [hovering, setHovering] = useState(false);

  // Motion values for tilt angles
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  // Spring animations for smooth, realistic damping
  const springRotateX = useSpring(rotateX, { damping: 25, stiffness: 120 });
  const springRotateY = useSpring(rotateY, { damping: 25, stiffness: 120 });

  // Coordinates for flashlight cursor glow
  const glowX = useMotionValue(0);
  const glowY = useMotionValue(0);
  const springGlowX = useSpring(glowX, { damping: 30, stiffness: 150 });
  const springGlowY = useSpring(glowY, { damping: 30, stiffness: 150 });

  const handleMouseMove = (e) => {
    if (!cardRef.current || !hoverEffect) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate mouse position relative to card center (ranges -0.5 to 0.5)
    const relativeX = (e.clientX - rect.left) / width - 0.5;
    const relativeY = (e.clientY - rect.top) / height - 0.5;

    // Update rotations (tilting towards the mouse coordinates)
    rotateX.set(-relativeY * 10); // Max 10 degrees tilt
    rotateY.set(relativeX * 10);

    // Update relative coordinates of cursor light
    glowX.set(e.clientX - rect.left);
    glowY.set(e.clientY - rect.top);
  };

  const handleMouseEnter = () => {
    setHovering(true);
  };

  const handleMouseLeave = () => {
    setHovering(false);
    rotateX.set(0);
    rotateY.set(0);
  };

  // Convert coordinate values to CSS radial gradient statement
  const spotlightBg = useTransform(
    [springGlowX, springGlowY],
    ([x, y]) => `radial-gradient(320px circle at ${x}px ${y}px, var(--glow-primary), transparent)`
  );

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      onClick={onClick}
      className={`relative rounded-3xl border border-cosmic-border/60 dark:border-white/5 bg-gradient-to-b from-cosmic-surface/75 to-cosmic-base/40 dark:from-cosmic-surface/85 dark:to-cosmic-card/45 backdrop-blur-2xl p-6 transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.03),inset_0_1px_2px_rgba(255,255,255,0.7)] dark:shadow-[0_15px_35px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.05)] hover:shadow-[0_15px_45px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.8)] dark:hover:shadow-[0_25px_50px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.1),0_0_20px_rgba(99,102,241,0.08)] hover:-translate-y-1 hover:border-slate-300 dark:hover:border-cosmic-indigo/40 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Specular shine reflection edge layer */}
      <div 
        className="absolute inset-0 pointer-events-none rounded-3xl transition-opacity duration-500 bg-gradient-to-tr from-transparent via-white/[0.08] dark:via-white/[0.03] to-transparent z-[1]" 
        style={{
          opacity: hovering ? 1 : 0.4,
        }}
      />

      {/* Light spotlight tracker overlay */}
      {hoverEffect && (
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-3xl z-0"
          style={{
            background: spotlightBg,
            opacity: hovering ? 1 : 0,
            transition: 'opacity 0.3s',
          }}
        />
      )}

      {/* Projection layer */}
      <div style={{ transform: 'translateZ(15px)' }} className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
