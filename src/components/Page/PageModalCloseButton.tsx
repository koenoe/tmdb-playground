'use client';

import { memo } from 'react';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const buttonVariants = {
  active: {
    scale: 1.1,
  },
  inactive: {
    scale: 1,
  },
};

const svgVariants = {
  active: {
    rotate: 90,
  },
  inactive: {
    rotate: 0,
  },
};

function PageModalCloseButton() {
  const router = useRouter();

  return (
    <motion.button
      type="button"
      className="flex items-center rounded-lg bg-white/10 p-4 text-white transition-colors hover:bg-white/15"
      // Note: this disables exit animations
      // see https://github.com/vercel/next.js/discussions/42658#discussioncomment-10258449
      // but `router.push()` or `router.replace()` will break state restoring
      onClick={() => router.back()}
      whileHover="active"
      whileTap="active"
      variants={buttonVariants}
      layout
    >
      <motion.svg
        fill="#fff"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 512 512"
        xmlSpace="preserve"
        className="h-4 w-4"
        variants={svgVariants}
      >
        <g>
          <g>
            <polygon
              points="512,59.076 452.922,0 256,196.922 59.076,0 0,59.076 196.922,256 0,452.922 59.076,512 256,315.076 452.922,512
			512,452.922 315.076,256"
            />
          </g>
        </g>
      </motion.svg>
    </motion.button>
  );
}

export default memo(PageModalCloseButton);
