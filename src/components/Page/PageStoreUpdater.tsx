'use client';

import { useEffect, useState } from 'react';

import preloadImage from '@/utils/preloadImage';

import { usePageStore } from './PageProvider';

export default function PageStoreUpdater({
  backgroundColor,
  backgroundImage,
}: Readonly<{
  backgroundImage: string;
  backgroundColor: string;
}>) {
  const updateBackground = usePageStore((state) => state.setBackground);
  const [imageIsPreloaded, setImageIsPreloaded] = useState(false);

  useEffect(() => {
    preloadImage(backgroundImage).finally(() => {
      setImageIsPreloaded(true);
      updateBackground({ backgroundImage, backgroundColor });
    });
  }, [backgroundColor, backgroundImage, updateBackground]);

  return imageIsPreloaded ? (
    <style global jsx>{`
      #modal-root > div {
        background-color: ${backgroundColor} !important;
      }
    `}</style>
  ) : null;
}
