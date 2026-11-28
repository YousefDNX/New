import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { usePrefs } from "@/lib/preferences";

interface MotionCardProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function MotionCard({ children, delay = 0, className }: MotionCardProps) {
  const prefs = usePrefs();
  const reduceMotion = prefs.a11y.reduceMotion;

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: Math.min(delay, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
