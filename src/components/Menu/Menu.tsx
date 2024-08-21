'use client';

import { useCallback, useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

import useMatchMedia from '@/hooks/useMatchMedia';
import getMainBackgroundColor from '@/utils/getMainBackgroundColor';

import MenuToggle from './MenuToggle';
import LoginButton from '../Buttons/LoginButton';
import Modal from '../Modal';
import Search from '../Search/Search';

const MotionLink = motion(Link);

const buttonVariants = {
  hidden: (i: number) => ({
    opacity: 0,
    y: -25,
    transition: {
      delay: i * 0.1,
      duration: 0.25,
    },
  }),
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.25,
    },
  }),
};

const childrenVariants = {
  hidden: { opacity: 0, y: 25, transition: { duration: 0.25 } },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const MenuItem = ({
  custom,
  label,
  href,
}: Readonly<{
  label: string;
  custom: number;
  href: string;
}>) => {
  return (
    <MotionLink
      href={href}
      className="relative flex h-auto w-auto items-center overflow-hidden text-3xl lowercase leading-none text-white md:h-[18px] md:min-w-12 md:justify-end md:text-base md:leading-none"
      initial="hidden"
      animate="visible"
      exit="hidden"
      custom={custom}
      variants={buttonVariants}
    >
      <span className="relative h-full truncate text-ellipsis">{label}</span>
    </MotionLink>
  );
};

export default function Menu({
  children,
  isAuthenticated,
}: Readonly<{ children: React.ReactNode; isAuthenticated?: boolean }>) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState<string>('#000');
  const isMobile = useMatchMedia('(max-width: 768px)');

  const handleOnClick = useCallback(() => {
    setBackgroundColor(getMainBackgroundColor());
    setMenuOpen((prev) => !prev);
  }, []);

  const renderMenu = useCallback(() => {
    return (
      <>
        <motion.div
          style={{
            backgroundColor,
          }}
          className="fixed inset-0 z-20 md:hidden"
          key="menu-backdrop"
          variants={{
            hidden: {
              opacity: 0,
              transition: {
                duration: 0.25,
                delay: 0.5,
              },
            },
            visible: {
              opacity: 0.9,
              transition: {
                duration: 0.25,
              },
            },
          }}
          initial="hidden"
          exit="hidden"
          animate="visible"
        />
        <div className="fixed inset-0 z-30 md:relative md:inset-auto md:bg-transparent">
          <motion.div
            key="menu"
            className="absolute inset-0 flex flex-col items-center justify-center gap-8 md:inset-auto md:right-0 md:top-0 md:flex-row md:justify-normal"
          >
            <MenuItem label="Home" custom={3} href="/" />
            <MenuItem label="Discover" custom={2} href="/" />

            {isAuthenticated && (
              <MenuItem label="Watchlist" custom={1} href="/" />
            )}

            <motion.div
              key={0}
              initial="hidden"
              animate="visible"
              exit="hidden"
              custom={0} // Reverse stagger
              variants={buttonVariants}
            >
              <LoginButton isAuthenticated={isAuthenticated} />
            </motion.div>
          </motion.div>
        </div>
      </>
    );
  }, [backgroundColor, isAuthenticated]);

  return (
    <div className="ml-auto flex items-center gap-10">
      <div className="relative h-[18px] w-auto">
        <AnimatePresence initial={false}>
          {menuOpen && (
            <>{isMobile ? <Modal>{renderMenu()}</Modal> : renderMenu()}</>
          )}

          {!menuOpen && (
            <motion.div
              className="absolute right-0 top-0 z-10 hidden md:block"
              key="children"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={childrenVariants}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative flex items-center">
        <Search />
        <MenuToggle onClick={handleOnClick} />
      </div>
    </div>
  );
}