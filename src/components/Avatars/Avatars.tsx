'use client';

import React, { memo } from 'react';

import { cva, cx } from 'class-variance-authority';
import { motion } from 'framer-motion';
import Image from 'next/image';

import { type Person } from '@/types/person';
import svgBase64Shimmer from '@/utils/svgBase64Shimmer';

const MotionImage = motion(Image);

export const avatarsStyles = cva(
  'flex flex-row flex-wrap gap-4 lg:gap-0 [&>*:nth-child(n+7)]:hidden md:[&>*:nth-child(n+7)]:flex lg:min-h-36',
);

export const avatarStyles = cva(
  'relative flex w-24 transform-gpu cursor-pointer flex-col lg:-mr-4 lg:-mt-4',
);

function Avatar({ item }: Readonly<{ item: Person }>) {
  return (
    <motion.div
      key={item.id}
      layout
      className={avatarStyles()}
      initial="inactive"
      whileHover="active"
      variants={{
        inactive: { zIndex: 0 },
        active: { zIndex: 10 },
      }}
    >
      <MotionImage
        src={item.image}
        alt={item.name}
        className="mx-auto aspect-square h-24 w-full rounded-full border-2 border-white object-cover"
        priority
        placeholder={`data:image/svg+xml;base64,${svgBase64Shimmer(200, 200)}`}
        width={200}
        height={200}
        variants={{
          inactive: { scale: 1 },
          active: { scale: 1.15 },
        }}
        unoptimized
      />

      <motion.div
        className="mt-4 hidden w-full flex-col items-center gap-1 text-nowrap text-center lg:flex"
        variants={{
          inactive: { opacity: 0, y: -15 },
          active: { opacity: 1, y: 0 },
        }}
      >
        <div className="text-sm font-semibold">{item.name}</div>
        <div className="text-xs opacity-60">{item.character ?? item.job}</div>
      </motion.div>

      <div className="mt-2 flex flex-col items-center gap-1 text-center lg:hidden">
        <div className="text-sm font-semibold">{item.name}</div>
        <div className="text-xs opacity-60">{item.character ?? item.job}</div>
      </div>
    </motion.div>
  );
}

function Avatars({
  className,
  items,
}: Readonly<{ className?: string; items: Person[] }>) {
  return (
    <div className={cx(avatarsStyles(), className)}>
      {/* TODO: add links to person page eventually */}
      {items.slice(0, 10).map((item) => (
        <Avatar key={item.id} item={item} />
      ))}
    </div>
  );
}

export default memo(Avatars);