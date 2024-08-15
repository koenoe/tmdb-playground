'use client';

import { memo, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';

import { type Props } from './Page';
import { usePageStore } from './PageProvider';
import Background from '../Background/Background';

const transition = {
  type: 'tween',
  ease: [0.4, 0, 0.2, 1],
  duration: 0.5,
};

const variants = {
  hidden: {
    opacity: 0,
    transition,
  },
  show: {
    opacity: 1,
    transition,
  },
};

function PageModal({ children }: Props) {
  const pathname = usePathname();
  const isVisible = pathname.includes('/tv/');
  const backgroundColor =
    document.querySelector('main')!.style.backgroundColor ?? '#000';
  const setBackground = usePageStore((state) => state.setBackground);

  useEffect(() => {
    if (isVisible) {
      // document.body.style.overflow = 'hidden';
      setTimeout(() => {
        document.body.classList.add('modal-is-open');
      }, 500);
    } else {
      // document.body.style.overflow = 'unset';
      setTimeout(() => {
        document.body.classList.remove('modal-is-open');
      }, 500);

      setBackground({
        backgroundColor: undefined,
        backgroundImage: undefined,
      });
    }

    return () => {
      // document.body.style.overflow = 'unset';
      document.body.classList.remove('modal-is-open');

      setBackground({
        backgroundColor: undefined,
        backgroundImage: undefined,
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="modal"
          variants={variants}
          initial="hidden"
          animate="show"
          exit="hidden"
          className="absolute inset-0 z-50 w-screen overflow-y-auto pb-12 transition-colors duration-500"
          style={{
            backgroundColor,
          }}
        >
          <Background
            variant="dynamic"
            context="page"
            color={backgroundColor}
          />

          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.getElementById('modal-root')!,
  );
}

export default memo(PageModal);
