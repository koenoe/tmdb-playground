'use client';

import { type MotionProps, motion } from 'framer-motion';

export default function MotionDiv({
  children,
  className,
  ...props
}: MotionProps &
  Readonly<{
    className?: string;
  }>) {
  return (
    <motion.div className={className} {...props}>
      {children}
    </motion.div>
  );
}
