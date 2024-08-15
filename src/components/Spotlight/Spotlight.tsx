'use client';

import { type RefObject, useCallback } from 'react';

import type { TvSeries } from '@/types/tv-series';
import preloadImage from '@/utils/preloadImage';

import SpotlightItem from './SpotlightItem';
import Carousel from '../Carousel/Carousel';
import { usePageStore } from '../Page/PageProvider';

export default function Spotlight({
  className,
  items,
}: Readonly<{
  className?: string;
  items: TvSeries[];
}>) {
  const updateBackground = usePageStore((state) => state.setBackground);
  const itemRenderer = useCallback(
    (index: number, ref: RefObject<HTMLAnchorElement>) => (
      <SpotlightItem ref={ref} index={index} item={items[index]} />
    ),
    [items],
  );

  const handleChange = useCallback(
    (index: number) => {
      const item = items[index];
      const backgroundImage = item.backdropImage as string;
      const backgroundColor = item.backdropColor;

      preloadImage(backgroundImage).finally(() => {
        updateBackground({
          backgroundImage,
          backgroundColor,
        });
        document.querySelector('main')!.style.backgroundColor = backgroundColor;
      });
    },
    [items, updateBackground],
  );

  return (
    <Carousel
      className={className}
      itemRenderer={itemRenderer}
      itemCount={items.length}
      onChange={handleChange}
    />
  );
}
