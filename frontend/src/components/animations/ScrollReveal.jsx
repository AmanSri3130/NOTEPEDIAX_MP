import React from 'react';
import { motion } from 'framer-motion';

export default function ScrollReveal({ 
  children, 
  variant = 'fade-up', // 'fade-up', 'fade-in', 'scale-in', 'slide-left', 'slide-right'
  delay = 0,
  duration = 0.5,
  className = ''
}) {
  const getVariants = () => {
    switch (variant) {
      case 'fade-up':
        return {
          hidden: { y: 35, opacity: 0 },
          visible: { y: 0, opacity: 1 }
        };
      case 'fade-in':
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 }
        };
      case 'scale-in':
        return {
          hidden: { scale: 0.94, opacity: 0 },
          visible: { scale: 1, opacity: 1 }
        };
      case 'slide-left':
        return {
          hidden: { x: -35, opacity: 0 },
          visible: { x: 0, opacity: 1 }
        };
      case 'slide-right':
        return {
          hidden: { x: 35, opacity: 0 },
          visible: { x: 0, opacity: 1 }
        };
      default:
        return {
          hidden: { y: 20, opacity: 0 },
          visible: { y: 0, opacity: 1 }
        };
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={getVariants()}
      transition={{ 
        duration: duration, 
        delay: delay,
        ease: [0.22, 1, 0.36, 1] 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
