'use client';

import { motion } from 'framer-motion';
import { useMounted } from '@/hooks/useMounted';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const mounted = useMounted();

  return (
    <motion.div
      initial={mounted ? { opacity: 0, y: 6 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
